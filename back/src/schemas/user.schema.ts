import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name is required"),
  email: z.email({ error: "A valid email is required" }),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  address: z.string({ error: "Address is required" }).min(1, "Address is required"),
  phone: z.string({ error: "Phone is required" }).min(1, "Phone is required"),
});

export const loginSchema = z.object({
  email: z.email({ error: "A valid email is required" }),
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});
