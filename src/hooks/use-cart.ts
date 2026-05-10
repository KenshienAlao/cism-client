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

  const { data: rawCartItems = [], isLoading } = useQuery<CartResponse[]>({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => (await cartService.getCart()).data || [],
    enabled: !!profile,
    staleTime: 1000 * 60 * 5,
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

  const addMutation = useMutation({
    mutationFn: (item: CartRequest) => cartService.addToCart(item),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<CartResponse[]>(CART_QUERY_KEY);

      if (previous) {
        const existing = previous.find(i =>
          Number(i.itemId) === Number(newItem.stallItemId) &&
          (newItem.variationId ? Number(i.variationId) === Number(newItem.variationId) : !i.variationId)
        );

        if (existing) {
          queryClient.setQueryData<CartResponse[]>(CART_QUERY_KEY,
            previous.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i)
          );
        } else {
          let enrichedTempItem: any = {
            id: Date.now(),
            itemId: newItem.stallItemId,
            variationId: newItem.variationId,
            quantity: newItem.quantity,
            price: 0,
            image: '',
            itemName: 'Adding...'
          };

          for (const stall of allStalls) {
            const catalogItem = stall.items.find(i => Number(i.id) === Number(newItem.stallItemId));
            if (catalogItem) {
              enrichedTempItem.itemName = catalogItem.name;
              enrichedTempItem.price = catalogItem.price;
              enrichedTempItem.image = catalogItem.image;

              if (newItem.variationId) {
                const variation = catalogItem.variations?.find(v => Number(v.id) === Number(newItem.variationId));
                if (variation) {
                  enrichedTempItem.price = variation.price;
                  if (variation.image) enrichedTempItem.image = variation.image;
                  if (variation.name && variation.name.toLowerCase() !== 'default') {
                    enrichedTempItem.itemName = `${catalogItem.name} (${variation.name})`;
                  }
                }
              }
              break;
            }
          }

          queryClient.setQueryData<CartResponse[]>(CART_QUERY_KEY, [...previous, enrichedTempItem]);
        }
      }
      return { previous };
    },
    onSuccess: (res) => {
      notifSuccess(res.message || "Added to cart");
    },
    onError: (err: any, _, context) => {
      if (context?.previous) queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      notifError(err.message || "Failed to add");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
  });

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
