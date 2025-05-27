import type { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { AuthenticationError, UnauthenticatedError } from "@/src/entities/errors/auth";
import { type TSignInSchema, ISignInPasswordlessSchema, SignInSchema } from "@/src/entities/models/auth/sign-in.model"
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { IUsersRepository } from "../../repositories/users.repository.interface";

export type ISignInPasswordlessUseCase = ReturnType<typeof signInUseCase>

export const signInUseCase =
    (
        instrumentationService: IInstrumentationService,
        authenticationService: IAuthenticationService,
        usersRepository: IUsersRepository
    ) =>
        async (input: ISignInPasswordlessSchema): Promise<void> => {
            return instrumentationService.startSpan({ name: "signIn Use Case", op: "function" },
                async () => {

                    const existingUser = await usersRepository.getUserByEmail({ email: input.email })

                    if (!existingUser) {
                        throw new UnauthenticatedError("User not found. Please tell your admin to create an account for you.")
                    }

                    // Attempt to sign in
                    await authenticationService.signInPasswordless({
                        email: input.email
                    })

                    return
                }
            )
        }