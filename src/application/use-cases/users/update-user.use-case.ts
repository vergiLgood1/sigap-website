import { IUserSchema } from "@/src/entities/models/users/users.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { NotFoundError } from "@/src/entities/errors/common"
import { ICredentialUpdateUserSchema, IUpdateUserSchema } from "@/src/entities/models/users/update-user.model"

export type IUpdateUserUseCase = ReturnType<typeof updateUserUseCase>

export const updateUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialUpdateUserSchema, input: IUpdateUserSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "updateUser Use Case", op: "function" },
        async () => {

            const existingUser = await usersRepository.getUserById(credential)

            if (!existingUser) {
                throw new NotFoundError("User not found")
            }

            const updatedUser = await usersRepository.updateUser(credential, input)

            return updatedUser
        }
    )
}