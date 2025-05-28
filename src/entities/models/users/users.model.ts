import { z } from "zod";

import { AuthError } from "@supabase/supabase-js";
import { RoleSchema } from "../roles/roles.model";

const timestampSchema = z.union([z.string(), z.date()]).nullable();

// const AppMetadataSchema = z
//   .object({
//     provider: z.string(),
//     providers: z.array(z.string()),
//   })
//   .nullable();

// const UserMetadataSchema = z.object({
//   email_verified: z.boolean().optional(),
// });

// const IdentityDataSchema = z.object({
//   email: z.string().email(),
//   email_verified: z.boolean(),
//   phone_verified: z.boolean(),
//   sub: z.string(),
// });

// const IdentitySchema = z.object({
//   identity_id: z.string(),
//   id: z.string(),
//   user_id: z.string(),
//   identity_data: IdentityDataSchema,
//   provider: z.string(),
//   last_sign_in_at: timestampSchema,
//   created_at: timestampSchema,
//   updated_at: timestampSchema,
//   email: z.string().email(),
// });


export const UserSchema = z.object({
  id: z.string(),
  roles_id: z.string().optional(), // Sesuaikan dengan field di Prisma
  email: z.string().email(),
  email_confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
  encrypted_password: z.string().nullable().optional(),
  invited_at: z.union([z.string(), z.date()]).nullable().optional(),
  phone: z.string().nullable().optional(),
  confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
  recovery_sent_at: z.union([z.string(), z.date()]).nullable().optional(),
  last_sign_in_at: z.union([z.string(), z.date()]).nullable().optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
  updated_at: z.union([z.string(), z.date()]).nullable().optional(),
  is_anonymous: z.boolean().optional(),
  banned_until: z.union([z.string(), z.date()]).nullable().optional(),
  profile: z
    .object({
      id: z.string().optional(),
      user_id: z.string(),
      nik: z.string().nullable().optional(),
      birth_place: z.string().nullable().optional(),

      avatar: z.string().nullable().optional(),
      username: z.string().nullable().optional(),
      first_name: z.string().nullable().optional(),
      last_name: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      address: z.any().nullable().optional(),
      birth_date: z.union([z.string(), z.date()]).nullable().optional(),
    })
    .nullable()
    .optional(),
  role: RoleSchema.optional(),
});

export type IUserSchema = z.infer<typeof UserSchema>;

export const UserSupabaseSchema = z.object({
  id: z.string(),
  app_metadata: z.any().optional(),
  user_metadata: z.any().optional(),
  aud: z.string(),
  confirmation_sent_at: z.union([z.string(), z.date()]).nullable().optional(),
  recovery_sent_at: z.union([z.string(), z.date()]).nullable().optional(),
  email_change_sent_at: z.union([z.string(), z.date()]).nullable().optional(),
  new_email: z.string().nullable().optional(),
  new_phone: z.string().nullable().optional(),
  invited_at: z.union([z.string(), z.date()]).nullable().optional(),
  action_link: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
  email_confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
  phone_confirmed_at: z.union([z.string(), z.date()]).nullable().optional(),
  last_sign_in_at: z.union([z.string(), z.date()]).nullable().optional(),
  role: z.string().nullable().optional(),
  updated_at: z.union([z.string(), z.date()]).nullable().optional(),
  identities: z.array(z.any()).nullable().optional(),
  is_anonymous: z.boolean().optional(),
  factors: z.array(z.any()).nullable().optional(),
})

export type IUserSupabaseSchema = z.infer<typeof UserSupabaseSchema>;

export const ProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  avatar: z.string().optional(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  bio: z.string(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
});

export type IProfileSchema = z.infer<typeof ProfileSchema>;

// export type UserFilterOptions = {
//   email: string
//   phone: string
//   lastSignIn: string
//   createdAt: string
//   status: string[]
// }

export const UserFilterOptionsSchema = z.object({
  email: z.string(),
  phone: z.string(),
  lastSignIn: z.string(),
  createdAt: z.string(),
  status: z.array(z.string()),
})

export type IUserFilterOptionsSchema = z.infer<typeof UserFilterOptionsSchema>;

export type UserResponse =
  | {
      data: {
      user: IUserSchema;
      };
      error: null;
    }
  | {
      data: {
        user: null;
      };
      error: AuthError;
    };
