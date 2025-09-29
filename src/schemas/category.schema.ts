import z from "zod";

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1),
        type: z.enum(["INCOME", "EXPENSE"]),
        color: z.string().optional(),
    })
  });

export const updateCategorySchema = createCategorySchema.extend({
    params: z.object({
        id: z.string().cuid(),
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        color: z.string().optional(),
    })
});