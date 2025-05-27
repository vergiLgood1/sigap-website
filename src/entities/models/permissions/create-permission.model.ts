import { z } from "zod";

export interface CreatePermissionDto {
    action: string;
    resource_id: string;
    role_id: string;
}

export const CreatePermissionSchema = z.object({
    action: z.string().min(1, { message: "Action is required" }),
    resource_id: z.string().min(1, { message: "Resource ID is required" }),
    role_id: z.string().min(1, { message: "Role ID is required" }),
})

export type ICreatePermissionSchema = z.infer<typeof CreatePermissionSchema>;

export const defaultICreatePermissionSchemaValues: ICreatePermissionSchema = {
    action: "",
    resource_id: "",
    role_id: "",
}
