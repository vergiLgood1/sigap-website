import { IUsersRepository } from "@/src/application/repositories/users.repository.interface"
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { IGetUsersUseCase } from "@/src/application/use-cases/users/get-users.use-case"

export type IGetUsersController = ReturnType<typeof getUsersController>

export const getUsersController =
    (
        instrumentationService: IInstrumentationService,
        getUsersUseCase: IGetUsersUseCase
    ) =>
        async () => {
            return await instrumentationService.startSpan({ name: "geIGetUsers Controller" }, async () => {
                return await getUsersUseCase()
            })
        }