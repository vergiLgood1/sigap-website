import { NotFoundError } from "@/src/entities/errors/common"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IUserSchema } from "@/src/entities/models/users/users.model"
import { ICredentialsUnbanUserSchema } from "@/src/entities/models/users/unban-user.model"

export type IUnbanUserUseCase = ReturnType<typeof unbanUserUseCase>

export const unbanUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialsUnbanUserSchema): Promise<IUserSchema> => {
        return await instrumentationService.startSpan({ name: "unbanUser Use Case", op: "function" },
            async () => {
                const existingUser = await usersRepository.getUserById(credential)

                if (!existingUser) {
                    throw new NotFoundError("User not found")
                }

                const unbanUser = await usersRepository.unbanUser(credential)

                return unbanUser
            }
        )
    }
