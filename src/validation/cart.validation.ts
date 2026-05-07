import z from "zod";

export const createCartSchema = z.object({
    stallId: z.number().int().positive(),
    stallItemId: z.number().int().positive(),
    variationId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export type CartRequest = z.infer<typeof createCartSchema>;
