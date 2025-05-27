import { z } from "zod";

export const SendMagicLinkSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
})

export type ISendMagicLinkSchema = z.infer<typeof SendMagicLinkSchema>

export const defaulISendMagicLinkSchemaValues: ISendMagicLinkSchema = {
    email: "",
}