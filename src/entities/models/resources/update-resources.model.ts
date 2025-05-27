import { z } from "zod";

export interface UpdateResourceDto {
    name?: string;
    type?: string;
    description?: string;
    instance_role?: string;
    relations?: string;
    attributes?: Record<string, any>;
}

export const UpdateResourceSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    instance_role: z.string().optional(),
    relations: z.string().optional(),
    attributes: z.record(z.any()).optional(),
})

export type IUpdateResourceSchema = z.infer<typeof UpdateResourceSchema>;

export const defaultIUpdateResourceSchemaValues: IUpdateResourceSchema = {
    name: undefined,
    type: undefined,
    description: undefined,
    instance_role: undefined,
    relations: undefined,
    attributes: {},
}