import { z } from "zod";

export const DeletePermissionsSchema = z.object({
    id: z.string().uuid(),
})

export type IDeletePermissionsSchema = z.infer<typeof DeletePermissionsSchema>

export const defaultIDeletePermissionsSchemaValues: IDeletePermissionsSchema = {
    id: "",
}

