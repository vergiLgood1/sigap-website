import { AuthenticationError } from "@/src/entities/errors/auth"
import { IUsersRepository } from "../../repositories/users.repository.interface"
import { IAuthenticationService } from "../../services/authentication.service.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IUserSchema, IUserSupabaseSchema } from "@/src/entities/models/users/users.model"
import { InputParseError } from "@/src/entities/errors/common"
import { ICreateUserSchema } from "@/src/entities/models/users/create-user.model"


export type ICreateUserUseCase = ReturnType<typeof createUserUseCase>

export const createUserUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
) => async (input: ICreateUserSchema): Promise<IUserSupabaseSchema> => {
    return await instrumentationService.startSpan({ name: "createUser Use Case", op: "function" },
        async () => {

            const existingUser = await usersRepository.getUserByEmail({ email: input.email })

            if (existingUser) {
                throw new AuthenticationError("User already exists")
            }

            const newUser = await usersRepository.createUser({
                email: input.email,
                password: input.password,
                email_confirm: true
            })

            return newUser
        }
    )
}
