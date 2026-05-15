import { Review, ReviewRequest } from "@/model/review.model";
import { StallItems } from "@/model/stall.model";
import { itemService } from "@/service/item.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifError, notifSuccess } from "@/lib/toast";
import { ApiResponse } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export const ITEM_QUERY_KEY = ["items"];

interface UseItemReturn {
  items: StallItems[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  createReview: (review: ReviewRequest) => Promise<ApiResponse<Review>>;
  createReviewMutation: any;
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
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    retry: 1,
  });

  const data = query.data ?? [];


  const { profile } = useAuth();

  const createReviewMutation = useMutation({
    mutationFn: async (review: ReviewRequest) => await itemService.createReview(review),

    onMutate: async (newReview) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ITEM_QUERY_KEY });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<StallItems[]>(ITEM_QUERY_KEY);

      // update to the new value
      if (previousItems && profile) {
        const updatedItems = previousItems.map(stall => {
          if (stall.id === newReview.stallId) {
            const optimisticReview: Review = {
              id: Math.random(), // Temporary ID
              itemId: newReview.itemId,
              stall_item_id: newReview.itemId,
              star: newReview.star,
              comment: newReview.comment || "",
              image: typeof newReview.image === 'string' ? newReview.image : undefined,
              createdAt: new Date().toISOString(),
              user: {
                clientName: profile.user.clientName,
                avatar: profile.user.avatar,
              }
            };
            return {
              ...stall,
              reviews: [optimisticReview, ...stall.reviews]
            };
          }
          return stall;
        });
        queryClient.setQueryData(ITEM_QUERY_KEY, updatedItems);
      }

      return { previousItems };
    },

    onSuccess: (res: ApiResponse<Review>) => {
      if (res.success) {
        notifSuccess("Review submitted successfully!");
      } else {
        notifError(res.message);
      }
    },

    onError: (err: Error, __, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(ITEM_QUERY_KEY, context.previousItems);
      }
      notifError(err.message || "Failed to submit review");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEY });
    }
  });


  return {
    items: data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => query.refetch(),
    createReview: createReviewMutation.mutateAsync,
    createReviewMutation,
  };
}

export function useItemDetail(id: string | null, stallName?: string | null, itemName?: string | null) {
  return useQuery({
    queryKey: ITEM_QUERY_KEY,
    queryFn: async () => {
      const res = await itemService.getAllItems();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    select: (stalls) => {
      if (!stalls.length) return null;

      let found = null;

      if (id) {
        for (const stall of stalls) {
          if (stallName && stall.name.toLowerCase() !== stallName.toLowerCase()) continue;
          const item = stall.items.find(i => String(i.id) === id);
          if (item) {
            found = { item, stall };
            break;
          }
        }
      }
      if (!found && stallName && itemName) {
        const stall = stalls.find(s => s.name.toLowerCase() === stallName.toLowerCase());
        if (stall) {
          const item = stall.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
          if (item) found = { item, stall };
        }
      }

      if (!found && id) {
        for (const stall of stalls) {
          const item = stall.items.find(i => String(i.id) === id);
          if (item) {
            found = { item, stall };
            break;
          }
        }
      }

      if (found) {
        const { item, stall } = found;
        const itemReviews = stall.reviews.filter(r => (r.itemId === item.id) || (r.stall_item_id === item.id));
        const avgRating = itemReviews.length > 0
          ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
          : 0;

        return {
          ...item,
          stallId: stall.id,
          stallName: stall.name,
          stallImage: stall.image,
          reviews: itemReviews,
          rating: avgRating,
          reviewCount: itemReviews.length,
          category: item.category || 'Uncategorized'
        };
      }

      return null;
    }
  });
}
