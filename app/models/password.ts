import { z } from "zod";

export const Password = z
  .string({ required_error: "Missing password" })
  .min(6, { message: "Password too short (need >6 letters)" })
  .max(10, { message: "Password too long (need <10 letters)" })
  .brand<"Password">();
export type Password = z.infer<typeof Password>;
