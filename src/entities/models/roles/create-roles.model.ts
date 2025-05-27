import { z } from "zod";

export interface CreateRoleDto {
    name: string;
    description?: string;
}

export const CreateRoleSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
})

export type ICreateRoleSchema = z.infer<typeof CreateRoleSchema>;

export const defaultICreateRoleSchemaValues: ICreateRoleSchema = {
    name: "",
    description: undefined,
}