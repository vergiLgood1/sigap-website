import { IUserSchema } from "@/src/entities/models/users/users.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { AuthenticationError } from "@/src/entities/errors/auth"
import { NotFoundError } from "@/src/entities/errors/common"
import { ICredentialGetUserByIdSchema } from "@/src/entities/models/users/read-user.model"


export type IGetUserByIdUseCase = ReturnType<typeof getUserByIdUseCase>

export const getUserByIdUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialGetUserByIdSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "getUserById Use Case", op: "function" },
        async () => {

            const user = await usersRepository.getUserById(credential)

            if (!user) {
                throw new NotFoundError("User not found")
            }

            return user
        }
    )
}