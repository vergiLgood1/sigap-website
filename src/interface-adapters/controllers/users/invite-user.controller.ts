import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { IInviteUserUseCase } from "@/src/application/use-cases/users/invite-user.use-case";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    email: z.string().email(),
})

export type IInviteUserController = ReturnType<typeof inviteUserController>

export const inviteUserController =
    (
        instrumentationService: IInstrumentationService,
        inviteUserUseCase: IInviteUserUseCase,
        getCurrentUserUseCase: IGetCurrentUserUseCase
    ) =>
        async (input: Partial<z.infer<typeof inputSchema>>) => {
            return await instrumentationService.startSpan({ name: "inviteUser Controller" }, async () => {

                const session = await getCurrentUserUseCase();

                if (!session) {
                    throw new InputParseError("Must be logged in to invite a user");
                }

                const { data, error: inputParseError } = inputSchema.safeParse(input);

                if (inputParseError) {
                    throw new InputParseError("Invalid data", { cause: inputParseError });
                }

                return await inviteUserUseCase({ email: data.email });
            })
        }

