import { z } from "zod";

export const InviteUserSchema = z.object({
    email: z.string().min(1, "Email is required").email(),
});

export type IInviteUserSchema = z.infer<typeof InviteUserSchema>;

export const defaulIInviteUserSchemaValues: IInviteUserSchema = {
    email: "",
}

export const InviteUserCredentialsSchema = InviteUserSchema.pick({ email: true })

export type ICredentialsInviteUserSchema = z.infer<typeof InviteUserCredentialsSchema>