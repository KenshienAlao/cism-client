import z from "zod";

export const createReviewSchema = z.object({
    star: z.number().int().positive().min(1).max(5),
    comment: z.string(),
});

export type ReviewRequest = z.infer<typeof createReviewSchema>;