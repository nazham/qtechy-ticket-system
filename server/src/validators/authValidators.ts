import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      error: (i) => (i.input === undefined ? "Name is required" : "Name must be a string"),
    })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters"),

  email: z
    .string({
      error: (i) => (i.input === undefined ? "Email is required" : "Email must be a string"),
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string({
      error: (i) => (i.input === undefined ? "Password is required" : "Password must be a string"),
    })
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must not exceed 72 characters"), // bcrypt limit
});

export const loginSchema = z.object({
  email: z
    .string({
      error: (i) => (i.input === undefined ? "Email is required" : "Email must be a string"),
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string({
      error: (i) => (i.input === undefined ? "Password is required" : "Password must be a string"),
    })
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
