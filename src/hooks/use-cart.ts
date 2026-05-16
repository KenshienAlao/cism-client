import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/service/cart.service";
import { CartRequest } from "@/validation/cart.validation";
import { CartResponse } from "@/model/cart.model";
import { notifSuccess, notifError } from "@/lib/toast";
import { useItem } from "./use-item";
import { useAuth } from "./use-auth";
import { useMemo, useCallback } from "react";

export const CART_QUERY_KEY = ["cart"];

export interface StalledCart {
  stallName: string;
  items: CartResponse[];
  subtotal: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const { items: allStalls } = useItem();
  const { profile } = useAuth();

  const { data: rawCartItems = [], isLoading, isFetching } = useQuery<CartResponse[]>({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => (await cartService.getCart()).data || [],
    enabled: !!profile,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 2,
  });

  const getStock = useCallback((itemId: number, variationId?: number | null) => {
    for (const stall of allStalls) {
      const item = stall.items.find(i => Number(i.id) === Number(itemId));
      if (item) {
        if (variationId) {
          return item.variations?.find(v => Number(v.id) === Number(variationId))?.stock || 0;
        }
        return item.stocks;
      }
    }
    return 0;
  }, [allStalls]);

  const { cartItems, stalledItems } = useMemo(() => {
    if (rawCartItems.length === 0) return { cartItems: [], stalledItems: [] };

    const itemMap = new Map();
    allStalls.forEach(stall => {
      stall.items.forEach(item => itemMap.set(Number(item.id), { item, stall }));
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
            enrichedItem.variationName = variation.name;
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
        await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
        const previous = queryClient.getQueryData<CartResponse[]>(CART_QUERY_KEY);
        if (previous) {
          queryClient.setQueryData<CartResponse[]>(CART_QUERY_KEY, onOptimisticUpdate(previous, vars));
        }
        return { previous };
      },
      onSuccess: (res) => {
        if (successMsg) notifSuccess(res.message || successMsg);
      },
      onError: (err: any, _, context) => {
        if (context?.previous) queryClient.setQueryData(CART_QUERY_KEY, context.previous);
        notifError(err.message || "Action failed");
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
    });
  };

  const addMutation = useOptimisticMutation(
    (item: CartRequest) => cartService.addToCart(item),
    (old, vars) => {
      // Find stall info from allStalls
      let stallName = "Store";
      let itemName = "Product";
      let price = 0;
      let image = "";

      for (const stall of allStalls) {
        const item = stall.items.find(i => Number(i.id) === Number(vars.stallItemId));
        if (item) {
          stallName = stall.name;
          itemName = item.name;
          price = item.price;
          image = typeof item.image === 'string' ? item.image : "";
          
          if (vars.variationId) {
            const variation = item.variations?.find(v => Number(v.id) === Number(vars.variationId));
            if (variation) {
              price = variation.price;
              if (typeof variation.image === 'string') image = variation.image;
            }
          }
          break;
        }
      }

      const existingIndex = old.findIndex(i => 
        Number(i.itemId) === Number(vars.stallItemId) && 
        (vars.variationId ? Number(i.variationId) === Number(vars.variationId) : !i.variationId)
      );

      if (existingIndex > -1) {
        const next = [...old];
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + vars.quantity };
        return next;
      }

      return [...old, {
        id: Date.now(),
        itemId: Number(vars.stallItemId),
        variationId: vars.variationId || null,
        name: itemName,
        stallName,
        price,
        image,
        quantity: vars.quantity
      } as CartResponse];
    },
    "Added to cart"
  );

  const updateMutation = useOptimisticMutation(
    ({ id, quantity }: { id: number, quantity: number }) => cartService.updateToCart(id, quantity),
    (old, { id, quantity }) => old.map(item => item.id === id ? { ...item, quantity } : item)
  );

  const removeMutation = useOptimisticMutation(
    (id: number) => cartService.removeToCart(id),
    (old, id) => old.filter(item => item.id !== id)
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
    isFetching,
    isMutating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending,
    addToCart: async (item: CartRequest) => {
      const existing = cartItems.find(i =>
        Number(i.itemId) === Number(item.stallItemId) &&
        (item.variationId ? Number(i.variationId) === Number(item.variationId) : !i.variationId)
      );

      const availableStock = getStock(Number(item.stallItemId), item.variationId);
      const requestedQty = (existing?.quantity || 0) + item.quantity;

      if (requestedQty > availableStock) {
        notifError(`Only ${availableStock} items available in stock`);
        throw new Error("Out of stock");
      }

      return addMutation.mutateAsync(item);
    },
    updateQuantity: (id: number, quantity: number) => {
      const cartItem = cartItems.find(i => i.id === id);
      if (!cartItem) return;

      const availableStock = getStock(Number(cartItem.itemId), cartItem.variationId);
      if (quantity > availableStock) {
        notifError(`Only ${availableStock} items available in stock`);
        return;
      }
      updateMutation.mutate({ id, quantity });
    },
    removeItem: (id: number) => removeMutation.mutate(id),
    clearCart: () => clearMutation.mutate(undefined as any),
    getStock,
    cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    cartTotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
  };
}
