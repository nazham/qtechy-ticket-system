import z from "zod";
import { TicketCategory, TicketPriority, TicketStatus } from "../constants/enums";

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title is too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  category: z.enum(TicketCategory, {
    message: "Invalid ticket category",
  }),
  priority: z.enum(TicketPriority, {
    message: "Invalid ticket priority",
  }),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(TicketStatus, {
    message: "Invalid ticket status",
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
