import { z } from "zod";

// Define the profile sub-schema
const ProfileSchema = z.object({
    avatar: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    address: z.record(z.string(), z.any()).nullable().optional(),
    birth_date: z.date().nullable().optional(),
    birth_place: z.string().nullable().optional(),
    nik: z.string().nullable().optional(),
});

// Update user schema with roles_id
export const UpdateUserSchema = z.object({
    email: z.string().email().optional(),
    encrypted_password: z.string().nullable().optional(),
    roles_id: z.string().uuid().optional(), // Use roles_id as UUID
    phone: z.string().nullable().optional(),
    invited_at: z.union([z.string(), z.date()]).nullable().optional(),
    confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
    last_sign_in_at: z.union([z.string(), z.date()]).nullable().optional(),
    created_at: z.union([z.string(), z.date()]).nullable().optional(),
    updated_at: z.union([z.string(), z.date()]).nullable().optional(),
    is_anonymous: z.boolean().optional(),
    is_banned: z.boolean().optional(),
    banned_until: z.union([z.string(), z.date()]).nullable().optional(),
    banned_reason: z.string().nullable().optional(),
    profile: ProfileSchema.optional(),
});

export type IUpdateUserSchema = z.infer<typeof UpdateUserSchema>;

export const defaultValueUpdateUserSchema: IUpdateUserSchema = {
    email: undefined,
    encrypted_password: undefined,
    roles_id: undefined,
    phone: undefined,
    invited_at: undefined,
    confirmed_at: undefined,
    last_sign_in_at: undefined,
    created_at: undefined,
    updated_at: undefined,
    is_anonymous: false,
    is_banned: false,
    banned_until: undefined,
    banned_reason: undefined,
    profile: {
        avatar: undefined,
        username: undefined,
        nik: undefined,
        birth_date: undefined,
        birth_place: undefined,
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

    }
};



export const CredentialUpdateUserSchema = z.object({
    id: z.string(),
})

export type ICredentialUpdateUserSchema = z.infer<typeof CredentialUpdateUserSchema>