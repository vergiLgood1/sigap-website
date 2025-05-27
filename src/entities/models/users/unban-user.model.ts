import { z } from "zod";

export const UnbanUserSchema = z.object({
    id: z.string(),
})

export type IUnbanUserSchema = z.infer<typeof UnbanUserSchema>;

export const defaulIUnbanUserSchemaValues: IUnbanUserSchema = {
    id: "",
}

export const UnbanUserCredentialsSchema = UnbanUserSchema.pick({ id: true })

export type ICredentialsUnbanUserSchema = z.infer<typeof UnbanUserCredentialsSchema>