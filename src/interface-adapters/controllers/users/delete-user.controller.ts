import { IUsersRepository } from "@/src/application/repositories/users.repository.interface"
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface"
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { IDeleteUserUseCase } from "@/src/application/use-cases/users/delete-user.use-case"
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case"
import { UnauthenticatedError } from "@/src/entities/errors/auth"
import { ICredentialsDeleteUserSchema } from "@/src/entities/models/users/delete-user.model"

export type IDeleteUserController = ReturnType<typeof deleteUserController>

export const deleteUserController =
    (
        instrumentationService: IInstrumentationService,
        deleteUserUseCase: IDeleteUserUseCase,
        getCurrentUserUseCase: IGetCurrentUserUseCase
    ) =>
        async (credential: ICredentialsDeleteUserSchema) => {
            return await instrumentationService.startSpan({ name: "deleteUser Controller" }, async () => {

                const session = await getCurrentUserUseCase()

                if (!session) {
                    throw new UnauthenticatedError("Must be logged in to delete a user")
                }

                return await deleteUserUseCase(credential);
            })
        }