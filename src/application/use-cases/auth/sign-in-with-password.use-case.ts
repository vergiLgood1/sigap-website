import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { IUsersRepository } from "../../repositories/users.repository.interface";
import { IAuthenticationService } from "../../services/authentication.service.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";

export type ISignInWithPasswordUseCase = ReturnType<typeof signInWithPasswordUseCase>

export const signInWithPasswordUseCase = (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository
) => async (input: { email: string; password: string }): Promise<void> => {
    return await instrumentationService.startSpan({ name: "signInWithPassword Use Case", op: "function" },
        async () => {
          const existingUser = await usersRepository.getUserByEmail({
            email: input.email,
          });

          if (!existingUser) {
            throw new UnauthenticatedError(
              'User not found. Please tell your admin to create an account for you.'
            );
          }

          await authenticationService.signInWithPassword({
            email: input.email,
            password: input.password,
          });

          return;
        }
    )
}