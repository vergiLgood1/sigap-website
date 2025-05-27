import { z } from "zod";

type permissions = {
    id: string;
    action: string;
    role_id: string;
    resource_id: string;
    created_at: Date;
    updated_at: Date;
}

export const PermissionsSchema = z.object({
    id: z.string().uuid(),
    action: z.string().min(1).max(255),
    role_id: z.string().uuid(),
    resource_id: z.string().uuid(),
    created_at: z.date(),
    updated_at: z.date()
})

export type IPermissionsSchema = z.infer<typeof PermissionsSchema>;

