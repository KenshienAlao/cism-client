import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  stallName: string;
  quantity: number;
}

export const CART_QUERY_KEY = ["cart"];
export const CART_OPEN_QUERY_KEY = ["cartOpen"];

export function useCart() {
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: CART_QUERY_KEY,
    queryFn: () => [],
    staleTime: Infinity,
  });

  const { data: isCartOpen = false } = useQuery<boolean>({
    queryKey: CART_OPEN_QUERY_KEY,
    queryFn: () => false,
    staleTime: Infinity,
  });

  const addToCart = useMutation({
    mutationFn: async (item: Omit<CartItem, 'quantity'>) => item,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      
      const existingItem = previousCart.find(i => i.id === newItem.id);
      
      if (existingItem) {
        queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, 
          previousCart.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i)
        );
      } else {
        queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, 
          [...previousCart, { ...newItem, quantity: 1 }]
        );
      }
      queryClient.setQueryData<boolean>(CART_OPEN_QUERY_KEY, true);
      
      return { previousCart };
    }
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string, quantity: number }) => ({ id, quantity }),
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, 
        previousCart.map(i => i.id === id ? { ...i, quantity } : i)
      );
      
      return { previousCart };
    }
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => id,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, 
        previousCart.filter(i => i.id !== id)
      );
      
      return { previousCart };
    }
  });

  const clearCart = useMutation({
    mutationFn: async () => {},
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, []);
    }
  });

  const setIsCartOpen = useMutation({
    mutationFn: async (isOpen: boolean) => isOpen,
    onMutate: async (isOpen) => {
      await queryClient.cancelQueries({ queryKey: CART_OPEN_QUERY_KEY });
      queryClient.setQueryData<boolean>(CART_OPEN_QUERY_KEY, isOpen);
    }
  });

  return {
    cartItems,
    isCartOpen,
    addToCart: (item: Omit<CartItem, 'quantity'>) => addToCart.mutate(item),
    updateQuantity: (id: string, quantity: number) => updateQuantity.mutate({ id, quantity }),
    removeItem: (id: string) => removeItem.mutate(id),
    clearCart: () => clearCart.mutate(),
    setCartOpen: (isOpen: boolean) => setIsCartOpen.mutate(isOpen),
    cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    cartTotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
  };
}
