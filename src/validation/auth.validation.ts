import z from "zod";

export const RegisterSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required"),
    studentId: z.string().trim().optional(),
    email: z.email("Invalid format email").trim().min(1, "Email is required"),
    password: z.string().trim().min(1, "Password is required"),
    otp: z.string().trim().min(1, "OTP is required"),
  })
  .required();

export const LoginSchema = z
  .object({
    email: z.email("Invalid format email").trim().min(1, "Email is required"),
    password: z.string().trim().min(1, "Password is required"),
  })
  .required();

export const OtpSchema = z
  .object({
    email: z.email("Invalid format email").trim().min(1, "Email is required"),
    otp: z.string().trim().min(1, "OTP is required"),
  })
  .required();
