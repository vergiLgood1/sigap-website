import { z } from "zod";

export const SignUpSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }).min(8, { message: "Password must be at least 8 characters" }),
    phone: z.string().optional(),
})

export type TSignUpSchema = z.infer<typeof SignUpSchema>;

export const SignUpWithEmailSchema = SignUpSchema.pick({
    email: true,
    password: true,
})

export type ISignUpWithEmailSchema = z.infer<typeof SignUpWithEmailSchema>

export const defaulISignUpWithEmailSchemaValues: ISignUpWithEmailSchema = {
    email: "",
    password: "",
}

export const SignUpWithPhoneSchema = SignUpSchema.pick({
    phone: true,
    password: true,
})

export type ISignUpWithPhoneSchema = z.infer<typeof SignUpWithPhoneSchema>

export const defaulISignUpWithPhoneSchemaValues: ISignUpWithPhoneSchema = {
    phone: "",
    password: "",
}

export const SignUpWithOtpSchema = SignUpSchema.pick({
    email: true,
})

export type TSignUpWithOtpSchema = z.infer<typeof SignUpWithOtpSchema>

export const defaultSignUpWithOtpSchemaValues: TSignUpWithOtpSchema = {
    email: "",
}