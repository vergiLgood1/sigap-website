import { User } from "@/src/entities/models/users/users.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"

export type IGetUsersUseCase = ReturnType<typeof getUsersUseCase>

export const getUsersUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
) => async (): Promise<User[]> => {
    return instrumentationService.startSpan({ name: "getUsers Use Case", op: "function" },
        async () => {
            const users = await usersRepository.getUsers()

            return users
        }
    )
}