import { JsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";

type resources = {
    id: string;
    name: string;
    type: string | null;
    description: string | null;
    instance_role: string | null;
    relations: string | null;
    attributes: JsonValue | null;
    created_at: Date;
    updated_at: Date;
}

export const ResourcesSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    type: z.string().nullable(),
    description: z.string().nullable(),
    instance_role: z.string().nullable(),
    relations: z.string().nullable(),
    attributes: z.any().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
})

export type IResourcesSchema = z.infer<typeof ResourcesSchema>;