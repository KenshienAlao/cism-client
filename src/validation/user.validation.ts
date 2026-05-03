import z from "zod";

export const UpdateUserSchema = z.object({
    clientName: z.string().min(1, "Name is required").trim(),
    studentId: z.string().trim().optional(),
    role: z.enum(["STUDENT", "FACULTY", "STAFF"]),
}).required();

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;