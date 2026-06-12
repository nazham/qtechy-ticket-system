import z from "zod";
import { TicketCategory, TicketPriority, TicketStatus } from "../constants/enums";
import { objectIdString } from "./shared";

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
  assignedTo: objectIdString.optional().nullable(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(TicketStatus, {
    message: "Invalid ticket status",
  }),
});

export const assignTicketSchema = z.object({
  assignedTo: objectIdString.nullable(),
});

export const addCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "Message must be at least 2 characters")
    .max(5000, "Message must not exceed 5000 characters"),
});

export const updateTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title is too long")
    .optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  category: z
    .enum(TicketCategory, {
      message: "Invalid ticket category",
    })
    .optional(),
  priority: z
    .enum(TicketPriority, {
      message: "Invalid ticket priority",
    })
    .optional(),
  assignedTo: objectIdString.optional().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;

export const getTicketsQuerySchema = z.object({
  searchTerm: z.string().optional(),
  status: z.enum(TicketStatus).optional(),
  priority: z.enum(TicketPriority).optional(),
  category: z.enum(TicketCategory).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "status", "priority", "category"]).optional(),
  sortOrder: z.enum(["asc", "desc", "1", "-1"]).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export type GetTicketsQueryInput = z.infer<typeof getTicketsQuerySchema>;
