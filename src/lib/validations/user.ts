import { z } from "zod";

export const userSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email("Ingresá un email válido"),
});

export type UserInput = z.infer<typeof userSchema>;

export const pointsAdjustSchema = z.object({
  amount: z.coerce
    .number()
    .int("Tiene que ser un número entero")
    .refine((value) => value !== 0, "Ingresá una cantidad distinta de 0"),
});
