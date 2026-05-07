import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/service/cart.service";
import { CartRequest } from "@/validation/cart.validation";
import { CartResponse } from "@/model/cart.model";
import { notifSuccess, notifError } from "@/lib/toast";
import { useItem } from "./use-item";
import { useAuth } from "./use-auth";
import { useMemo } from "react";

export const CART_QUERY_KEY = ["cart"];

export interface StalledCart {
  stallName: string;
  items: CartResponse[];
  subtotal: number;
}

interface Cart {
  cartItems: CartResponse[];
  stalledItems: StalledCart[];
  isLoading: boolean;
  isMutating: boolean;
  addToCart: (item: CartRequest) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export function useCart(): Cart {
  const queryClient = useQueryClient();
  const { items: allStalls } = useItem();
  const { profile } = useAuth();

  const cartKey = useMemo(() => [...CART_QUERY_KEY, profile?.user?.id], [profile?.user?.id]);
  const { data: rawCartItems = [], isLoading } = useQuery<CartResponse[]>({
    queryKey: cartKey,
    queryFn: async () => (await cartService.getCart()).data || [],
    enabled: !!profile,
  });

  const { cartItems, stalledItems } = useMemo(() => {
    const itemMap = new Map();
    allStalls.forEach(stall => {
      stall.items.forEach(item => {
        itemMap.set(Number(item.id), { item, stall });
      });
    });

    const enriched = rawCartItems.map(cartItem => {
      const data = itemMap.get(Number(cartItem.itemId));
      if (!data) return cartItem;

      const { item, stall } = data;
      const enrichedItem = {
        ...cartItem,
        name: item.name,
        stallName: stall.name,
        image: (typeof item.image === 'string' && item.image) ? item.image : cartItem.image
      };

      if (cartItem.variationId) {
        const variation = item.variations?.find((v: any) => Number(v.id) === Number(cartItem.variationId));
        if (variation) {
          if (variation.image) enrichedItem.image = variation.image;
          if (variation.name && variation.name.toLowerCase() !== 'default') {
            enrichedItem.name = `${item.name} (${variation.name})`;
          }
        }
      }
      return enrichedItem;
    });

    const groups: Record<string, StalledCart> = {};
    enriched.forEach(item => {
      if (!groups[item.stallName]) {
        groups[item.stallName] = { stallName: item.stallName, items: [], subtotal: 0 };
      }
      groups[item.stallName].items.push(item);
      groups[item.stallName].subtotal += item.price * item.quantity;
    });

    return { cartItems: enriched, stalledItems: Object.values(groups) };
  }, [rawCartItems, allStalls]);

  const useOptimisticMutation = <TVariables,>(
    mutationFn: (vars: TVariables) => Promise<any>,
    onOptimisticUpdate: (old: CartResponse[], vars: TVariables) => CartResponse[],
    successMsg?: string
  ) => {
    return useMutation({
      mutationFn,
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey: cartKey });
        const previous = queryClient.getQueryData<CartResponse[]>(cartKey);
        if (previous) {
          queryClient.setQueryData<CartResponse[]>(cartKey, onOptimisticUpdate(previous, vars));
        }
        return { previous };
      },
      onSuccess: (res) => {
        if (successMsg) notifSuccess(res.message || successMsg);
      },
      onError: (err: any, _, context) => {
        if (context?.previous) queryClient.setQueryData(cartKey, context.previous);
        notifError(err.message || "Action failed");
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: cartKey }),
    });
  };

  const addMutation = useMutation({
    mutationFn: (item: CartRequest) => cartService.addToCart(item),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: cartKey });
      notifSuccess(res.message || "Added to cart");
    },
    onError: (err: any) => notifError(err.message || "Failed to add")
  });

  const updateMutation = useOptimisticMutation(
    ({ id, quantity }: { id: number, quantity: number }) => cartService.updateToCart(id, quantity),
    (old, { id, quantity }) => old.map(item => item.id === id ? { ...item, quantity } : item)
  );

  const removeMutation = useOptimisticMutation(
    (id: number) => cartService.removeToCart(id),
    (old, id) => old.filter(item => item.id !== id),
    // "Removed from cart"
  );

  const clearMutation = useOptimisticMutation(
    () => cartService.clearCart(),
    () => [],
    "Cart cleared"
  );

  return {
    cartItems,
    stalledItems,
    isLoading,
    isMutating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending,
    addToCart: (item: CartRequest) => addMutation.mutate(item),
    updateQuantity: (id, quantity) => updateMutation.mutate({ id, quantity }),
    removeItem: (id: number) => removeMutation.mutate(id),
    clearCart: () => clearMutation.mutate(undefined as any),
    cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    cartTotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
  };
}
