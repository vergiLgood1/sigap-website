import { z } from "zod";

export interface UpdateRoleDto {
    name?: string;
    description?: string;
}

export const UpdateRoleSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
})

export type IUpdateRoleSchema = z.infer<typeof UpdateRoleSchema>;

export const defaultIUpdateRoleSchemaValues: IUpdateRoleSchema = {
    name: undefined,
    description: undefined,
}