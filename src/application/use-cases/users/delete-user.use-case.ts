import { NotFoundError } from "@/src/entities/errors/common"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IUserSchema } from "@/src/entities/models/users/users.model"
import { ICredentialsDeleteUserSchema } from "@/src/entities/models/users/delete-user.model"

export type IDeleteUserUseCase = ReturnType<typeof deleteUserUseCase>

export const deleteUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialsDeleteUserSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "deleteUser Use Case", op: "function" },
        async () => {
            const user = await usersRepository.getUserById(credential)

            if (!user) {
                throw new NotFoundError("User not found")
            }

            const deletedUser = await usersRepository.deleteUser(credential)

            return deletedUser
        }
    )
}