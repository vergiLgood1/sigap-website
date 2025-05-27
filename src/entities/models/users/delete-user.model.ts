import { z } from "zod"

export const DeleteUserSchema = z.object({
    id: z.string(),
})

export type IDeleteUserSchema = z.infer<typeof DeleteUserSchema>

export const defaulIDeleteUserSchemaValues: IDeleteUserSchema = {
    id: "",
}

export const DeleteUserCredentialsSchema = DeleteUserSchema.pick({ id: true })

export type ICredentialsDeleteUserSchema = z.infer<typeof DeleteUserCredentialsSchema>