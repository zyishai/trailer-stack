import { z } from "zod";

export const Username = z
  .string({ required_error: "Missing username" })
  .min(4, { message: "Username too short (need >4 letters)" })
  .max(10, { message: "Username too long (need <10 letters)" })
  .brand<"Username">();
export type Username = z.infer<typeof Username>;
