import { IUserSchema } from "@/src/entities/models/users/users.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { NotFoundError } from "@/src/entities/errors/common"
import { IBanUserSchema, ICredentialsBanUserSchema } from "@/src/entities/models/users/ban-user.model"

export type IBanUserUseCase = ReturnType<typeof banUserUseCase>

export const banUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialsBanUserSchema, input: IBanUserSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "banUser Use Case", op: "function" },
        async () => {
            const existingUser = await usersRepository.getUserById(credential)

            if (!existingUser) {
                throw new NotFoundError("User not found")
            }

            const bannedUser = await usersRepository.banUser(credential, input)

            console.log("Use Case: Ban User")

            return bannedUser
        }
    )
}