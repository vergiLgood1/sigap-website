import { z } from "zod";

export const UpdateUserSchema = z.object({
    email: z.string().email().optional(),
    email_confirmed_at: z.boolean().optional(),
    encrypted_password: z.string().optional(),
    roles_id: z.string().optional(), // Sesuai dengan model di Prisma
    phone: z.string().optional(),
    phone_confirmed_at: z.boolean().optional(),
    invited_at: z.union([z.string(), z.date()]).optional(),
    confirmed_at: z.union([z.string(), z.date()]).optional(),
    // recovery_sent_at: z.union([z.string(), z.date()]).optional(),
    last_sign_in_at: z.union([z.string(), z.date()]).optional(),
    created_at: z.union([z.string(), z.date()]).optional(),
    updated_at: z.union([z.string(), z.date()]).optional(),
    is_anonymous: z.boolean().optional(),
    user_metadata: z.record(z.any()).optional(),
    app_metadata: z.record(z.any()).optional(),
    profile: z
        .object({
            avatar: z.string().optional(),
            username: z.string().optional(),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            bio: z.string().optional(),
            address: z.any().optional(),
            birth_date: z.date().optional(),
        })
});

export type IUpdateUserSchema = z.infer<typeof UpdateUserSchema>;

export const defaultValueUpdateUserSchema: IUpdateUserSchema = {
    email: undefined,
    email_confirmed_at: undefined,
    encrypted_password: undefined,
    roles_id: undefined,
    phone: undefined,
    phone_confirmed_at: undefined,
    invited_at: undefined,
    confirmed_at: undefined,
    last_sign_in_at: undefined,
    created_at: undefined,
    updated_at: undefined,
    is_anonymous: false,
    user_metadata: {},
    app_metadata: {},
    profile: {
        avatar: undefined,
        username: undefined,
        first_name: undefined,
        last_name: undefined,
        bio: undefined,
        address: {
            street: "",
            city: "",
            state: "",
            country: "",
            postal_code: "",
        },
        birth_date: undefined,
    }
};



export const CredentialUpdateUserSchema = z.object({
    id: z.string(),
})

export type ICredentialUpdateUserSchema = z.infer<typeof CredentialUpdateUserSchema>