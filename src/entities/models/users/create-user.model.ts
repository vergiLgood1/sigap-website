import { CNumbers } from "@/app/_utils/const/numbers";
import { CTexts } from "@/app/_utils/const/texts";
import { phonePrefixValidation, phoneRegexValidation } from "@/app/_utils/validation";
import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.string().min(1, "Email is required").email(),
    password: z.string().min(1, { message: "Password is required" }).min(8, { message: "Password must be at least 8 characters" }),
    phone: z.string()
        .refine(phonePrefixValidation, {
            message: `Phone number must start with one of the following: ${CTexts.PHONE_PREFIX.join(', ')}.`,
        })
        .refine(phoneRegexValidation, {
            message: `Phone number must have a length between ${CNumbers.PHONE_MIN_LENGTH} and ${CNumbers.PHONE_MAX_LENGTH} digits without the country code.`,
        })
        .optional(),
    email_confirm: z.boolean().optional(),
});

export type ICreateUserSchema = z.infer<typeof CreateUserSchema>;

export const defaulICreateUserSchemaValues: ICreateUserSchema = {
    email: "",
    password: "",
    phone: "",
    email_confirm: true,
}

export const CredentialCreateUserSchema = CreateUserSchema.pick({
    email: true,
})

