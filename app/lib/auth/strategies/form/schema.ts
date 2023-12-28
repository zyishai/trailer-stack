import { z } from "zod";

export const loginSchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

export const registerSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(4, "Username too short")
    .max(10, "Username too long"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password too short")
    .max(20, "Password too long"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email"),
});
