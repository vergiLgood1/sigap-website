import { AuthenticationError } from "@/src/entities/errors/auth"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IAuthenticationService } from "../../services/authentication.service.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IUserSchema, IUserSupabaseSchema } from "@/src/entities/models/users/users.model"
import { ICredentialsInviteUserSchema } from "@/src/entities/models/users/invite-user.model"


export type IInviteUserUseCase = ReturnType<typeof inviteUserUseCase>

export const inviteUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
) => async (credential: ICredentialsInviteUserSchema): Promise<IUserSupabaseSchema> => {
    return await instrumentationService.startSpan({ name: "inviteUser Use Case", op: "function" },
        async () => {

            // const existingUser = await usersRepository.getUserByEmail(credential)

            // if (existingUser) {
            //     throw new AuthenticationError("User already exists")
            // }

            const invitedUser = await usersRepository.inviteUser(credential)

            if (!invitedUser) {
                throw new AuthenticationError("User not invited")
            }

            return invitedUser
        }
    )
}
