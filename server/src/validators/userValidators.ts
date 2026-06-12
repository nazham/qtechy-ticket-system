import z from "zod";
import { objectIdString } from "./shared";

export const userIdParamSchema = z.object({
  id: objectIdString,
});

export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
