import { NotFoundError } from "@/src/entities/errors/common"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IUserSchema, UserResponse } from "@/src/entities/models/users/users.model"
import { AuthenticationError } from "@/src/entities/errors/auth"


export type IGetCurrentUserUseCase = ReturnType<typeof getCurrentUserUseCase>

export const getCurrentUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "getCurrentUser Use Case", op: "function" },
        async () => {

            const existingUser = await usersRepository.getCurrentUser()

            if (!existingUser) {
                throw new NotFoundError("User not found")
            }

            return existingUser
        }
    )
}
