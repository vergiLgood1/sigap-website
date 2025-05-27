import { IUserSchema } from "@/src/entities/models/users/users.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IAuthenticationService } from "../../services/authentication.service.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { AuthenticationError } from "@/src/entities/errors/auth"
import { ISignUpWithEmailSchema } from "@/src/entities/models/auth/sign-up.model"



export type ISignUpUseCase = ReturnType<typeof signUpUseCase>

export const signUpUseCase = (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository
) => async (input: ISignUpWithEmailSchema): Promise<IUserSchema> => {
    return await instrumentationService.startSpan({ name: "signUp Use Case", op: "function" },
        async () => {
            const existingUser = await usersRepository.getUserByEmail({ email: input.email })

            if (existingUser) {
                throw new AuthenticationError("User already exists")
            }

            const newUser = await authenticationService.SignUpWithEmailSchema({
                email: input.email,
                password: input.password
            })

            await authenticationService.SignInWithPasswordSchema({
                email: input.email,
                password: input.password
            })

            const session = await authenticationService.getSession();

            if (!session) {
                throw new AuthenticationError("Session not found")
            }

            return {
                ...newUser
            }

        }
    )
}