import { z } from "zod"

export const GenerateRequestSchema = z.object({
  company: z.string().min(1, "Company is required").max(120),
  role: z.string().min(1, "Job Title is required").max(120),
  jobUrl: z
    .string()
    .optional()
    .transform((s) => (s && s.trim().length > 0 ? s.trim() : undefined))
    .refine((val) => !val || /^https?:\/\/\S+$/i.test(val), {
      message: "Must be a valid URL starting with http(s)://",
    }),
  extra: z.string().max(5000).optional(),
})

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
