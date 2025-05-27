import { IUsersRepository } from "@/src/application/repositories/users.repository.interface"
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case"
import { NotFoundError } from "@/src/entities/errors/common"

export type IGetCurrentUserController = ReturnType<typeof getCurrentUserController>

export const getCurrentUserController =
    (
        instrumentationService: IInstrumentationService,
        getCurrentUserUseCase: IGetCurrentUserUseCase
    ) =>
        async () => {
            return await instrumentationService.startSpan({ name: "getCurrentUser Controller" }, async () => {

                return await getCurrentUserUseCase();
            })
        }