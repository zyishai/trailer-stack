import { z } from "zod";

export const Datetime = z.string().datetime().brand<"Datetime">();
export type Datetime = z.infer<typeof Datetime>;
