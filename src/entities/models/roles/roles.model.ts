import { z } from "zod";

export type IUserRoles = {
    TYPES: {
        ADMIN: 'admin';
        STAFF: 'staff';
        VIEWER: 'viewer';
    };

    ALLOWED_ROLES_TO_ACTIONS: [
        'admin',
        'staff'
    ];
};

export const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    created_at: z.union([z.string(), z.date()]).nullable().optional(),
    updated_at: z.union([z.string(), z.date()]).nullable().optional(),
})

export type IRolesSchema = z.infer<typeof RoleSchema>;