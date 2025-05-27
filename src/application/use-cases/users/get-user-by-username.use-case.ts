import { NotFoundError } from "@/src/entities/errors/common"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IUserSchema } from "@/src/entities/models/users/users.model"
import { ICredentialGetUserByUsernameSchema } from "@/src/entities/models/users/read-user.model"

export type IGetUserByUsernameUseCase = ReturnType<typeof getUserByUsernameUseCase>

export const getUserByUsernameUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialGetUserByUsernameSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "getUserByUsername Use Case", op: "function" },
        async () => {

            const user = await usersRepository.getUserByUsername(credential)

            if (!user) {
                throw new NotFoundError("User not found")
            }

            return user
        }
    )
}