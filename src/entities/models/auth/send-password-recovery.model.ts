import { z } from "zod";

export const SendPasswordRecoverySchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
})

export type ISendPasswordRecoverySchema = z.infer<typeof SendPasswordRecoverySchema>

export const defaulISendPasswordRecoverySchemaValues: ISendPasswordRecoverySchema = {
    email: "",
}