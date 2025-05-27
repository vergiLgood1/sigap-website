import { z } from "zod";

export interface CreateResourceDto {
    name: string;
    type?: string;
    description?: string;
    instance_role?: string;
    relations?: string;
    attributes?: Record<string, any>;
}

export const CreateResourceSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    type: z.string().optional(),
    description: z.string().optional(),
    instance_role: z.string().optional(),
    relations: z.string().optional(),
    attributes: z.record(z.any()).optional(),
})

export type ICreateResourceSchema = z.infer<typeof CreateResourceSchema>;

export const defaultICreateResourceSchemaValues: ICreateResourceSchema = {
    name: "",
    type: undefined,
    description: undefined,
    instance_role: undefined,
    relations: undefined,
    attributes: {},
}