import { z } from "zod";

export const Password = z
  .string({ required_error: "Missing password" })
  .brand<"Password">();
export type Password = z.infer<typeof Password>;
