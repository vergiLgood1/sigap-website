import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IBanUserUseCase } from "@/src/application/use-cases/users/ban-user.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { InputParseError } from "@/src/entities/errors/common";
import { BanDurationSchema, ICredentialsBanUserSchema } from "@/src/entities/models/users/ban-user.model";
import { z } from "zod";

const inputSchema = z.object({
    ban_duration: BanDurationSchema
})

export type IBanUserController = ReturnType<typeof banUserController>

export const banUserController = (
    instrumentationService: IInstrumentationService,
    banUserUseCase: IBanUserUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) =>
    async (credential: ICredentialsBanUserSchema, input: Partial<z.infer<typeof inputSchema>>) => {
        return await instrumentationService.startSpan({ name: "banUser Controller" }, async () => {

            const session = await getCurrentUserUseCase();

            if (!session) {
                throw new InputParseError("Must be logged in to ban a user");
            }

            const { data, error: inputParseError } = inputSchema.safeParse(input);

            if (inputParseError) {
                throw new InputParseError("Invalid data", { cause: inputParseError });
            }

            console.log("Controller: Ban User");

            return await banUserUseCase({ id: credential.id }, { ban_duration: data.ban_duration });
        })
    }