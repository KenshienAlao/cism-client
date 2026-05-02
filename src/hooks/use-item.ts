import { StallItems } from "@/model/stall.model";
import { itemService } from "@/service/item.service";
import { useQuery } from "@tanstack/react-query";
import { Item } from "@/model/item.model";

/**
 * ─── Query Keys ─────────────────────────────────────────────────────────────
 * Centralized keys for predictable cache management.
 */
export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
};

/**
 * ─── Hook Return Type ───────────────────────────────────────────────────────
 */
interface UseItemReturn {
  items: StallItems[];
  meals: Item[];
  snacks: Item[];
  drinks: Item[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * ─── useItem Hook ───────────────────────────────────────────────────────────
 * A company-standard hook for fetching all stall items.
 * Handles data flattening, automatic retries, and cache management.
 */
export function useItem(): UseItemReturn {
  const query = useQuery<StallItems[], Error>({
    queryKey: itemKeys.lists(),
    queryFn: async () => {
      const res = await itemService.getAllItems();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    retry: 1,
  });

  const data = query.data ?? [];

  return {
    items: data,
    meals: data.flatMap((stall) => stall.meals),
    snacks: data.flatMap((stall) => stall.snacks),
    drinks: data.flatMap((stall) => stall.drinks),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => query.refetch(),
  };
}
