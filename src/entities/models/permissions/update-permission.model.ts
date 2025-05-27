import { z } from "zod";

export const UpdatePermissionSchema = z.object({
    action: z.string().min(1, { message: "Action is required" }),
    resource_id: z.string().min(1, { message: "Resource ID is required" }),
    role_id: z.string().min(1, { message: "Role ID is required" }),
})

export type IUpdatePermissionSchema = z.infer<typeof UpdatePermissionSchema>;

export const defaultIUpdatePermissionSchemaValues: IUpdatePermissionSchema = {
    action: "",
    resource_id: "",
    role_id: "",
}