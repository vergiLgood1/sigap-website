import { AuthenticationError } from "@/src/entities/errors/auth"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IAuthenticationService } from "../../services/authentication.service.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { NotFoundError } from "@/src/entities/errors/common"

export type ISendPasswordRecoveryUseCase = ReturnType<typeof sendPasswordRecoveryUseCase>

export const sendPasswordRecoveryUseCase = (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository
) => async (input: { email: string }): Promise<void> => {
    return await instrumentationService.startSpan({ name: "sendPasswordRecovery Use Case", op: "function" },
        async () => {
            const user = await usersRepository.getUserByEmail({ email: input.email })

            if (!user) {
                throw new NotFoundError("User not found")
            }

            await authenticationService.sendPasswordRecovery({ email: input.email })
        }
    )
}