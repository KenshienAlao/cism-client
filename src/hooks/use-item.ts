import { StallItems } from "@/model/stall.model";
import { itemService } from "@/service/item.service";
import { useQuery } from "@tanstack/react-query";

export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
};

interface UseItemReturn {
  items: StallItems[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useItem(): UseItemReturn {
  const query = useQuery<StallItems[], Error>({
    queryKey: itemKeys.lists(),
    queryFn: async () => {
      const res = await itemService.getAllItems();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });

  const data = query.data ?? [];

  return {
    items: data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => query.refetch(),
  };
}
