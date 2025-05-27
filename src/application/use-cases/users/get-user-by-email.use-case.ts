import { IUserSchema } from "@/src/entities/models/users/users.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { NotFoundError } from "@/src/entities/errors/common"
import { ICredentialGetUserByEmailSchema } from "@/src/entities/models/users/read-user.model"

export type IGetUserByEmailUseCase = ReturnType<typeof getUserByEmailUseCase>

export const getUserByEmailUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (credential: ICredentialGetUserByEmailSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "getUserByEmail Use Case", op: "function" },
        async () => {

            const user = await usersRepository.getUserByEmail(credential)

            if (!user) {
                throw new NotFoundError("User not found")
            }

            return user
        }
    )
}
