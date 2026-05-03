import { Review, ReviewRequest } from "@/model/review.model";
import { StallItems } from "@/model/stall.model";
import { itemService } from "@/service/item.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifError, notifSuccess } from "@/lib/toast";
import { ApiResponse } from "@/lib/api";

export const ITEM_QUERY_KEY = ["items"];

interface UseItemReturn {
  items: StallItems[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  createReview: (review: ReviewRequest) => Promise<ApiResponse<Review>>;
}

export function useItem(): UseItemReturn {
  const queryClient = useQueryClient();
  const query = useQuery<StallItems[], Error>({
    queryKey: ITEM_QUERY_KEY,
    queryFn: async () => {
      const res = await itemService.getAllItems();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });

  const data = query.data ?? [];


  const createReviewMutation = useMutation({
    mutationFn: async (review: ReviewRequest) => await itemService.createReview(review),
    onSuccess: (res: ApiResponse<Review>) => {
      if (res.success) {
        console.log(res);
        notifSuccess("Review submitted successfully!");
        queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEY });
      } else {
        notifError(res.message);
      }
    },
    onError: (err: Error) => {
      notifError(err.message || "Failed to submit review");
    },
  });


  return {
    items: data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => query.refetch(),
    createReview: createReviewMutation.mutateAsync,
  };
}
