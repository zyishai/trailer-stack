import { z } from "zod";

export const Username = z
  .string({ required_error: "Missing username" })
  .brand<"Username">();
export type Username = z.infer<typeof Username>;
