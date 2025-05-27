import { z } from "zod";
import { UserSchema } from "@/src/entities/models/users/users.model";

export const SessionSchema = z.object({
    user: z.object({
        id: z.string(),
        email: z.string().email().optional(),
        role_id: z.string().optional(),
    }),
    expiresAt: z.number().optional(),
});

export type Session = z.infer<typeof SessionSchema>