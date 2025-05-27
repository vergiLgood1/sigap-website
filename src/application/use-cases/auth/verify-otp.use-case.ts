import { IVerifyOtpSchema } from "@/src/entities/models/auth/verify-otp.model"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IAuthenticationService } from "../../services/authentication.service.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { AuthenticationError } from "@/src/entities/errors/auth"
import { NotFoundError } from "@/src/entities/errors/common"


export type IVerifyOtpUseCase = ReturnType<typeof verifyOtpUseCase>

export const verifyOtpUseCase = (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository
) => async (input: IVerifyOtpSchema): Promise<void> => {
    return await instrumentationService.startSpan({ name: "verifyOtp Use Case", op: "function" },
        async () => {

            const user = await usersRepository.getUserByEmail({ email: input.email })

            if (!user) {
                throw new NotFoundError("User not found")
            }

            console.log("email = ", user.email)

            await authenticationService.verifyOtp({
                email: input.email,
                token: input.token
            })
        }
    )
}
