import { IUsersRepository } from "@/src/application/repositories/users.repository.interface"
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface"
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { ICreateUserUseCase } from "@/src/application/use-cases/users/create-user.use-case"
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case"
import { UnauthenticatedError } from "@/src/entities/errors/auth"
import { InputParseError } from "@/src/entities/errors/common"
import { CreateUserSchema } from "@/src/entities/models/users/create-user.model"
import { z } from "zod"

// const inputSchema = z.object({
//     email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
//     password: z
//         .string()
//         .min(1, { message: "Password is required" })
//         .min(8, { message: "Password must be at least 8 characters" })
//         .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
//         .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
//         .regex(/[0-9]/, { message: "Password must contain at least one number" }),
//     email_confirm: z.boolean().optional(),
// })

const inputSchema = CreateUserSchema

export type ICreateUserController = ReturnType<typeof createUserController>

export const createUserController = (
    instrumentationService: IInstrumentationService,
    createUserUseCase: ICreateUserUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: Partial<z.infer<typeof inputSchema>>) => {
    return await instrumentationService.startSpan({ name: "createUser Controller" }, async () => {

        const session = await getCurrentUserUseCase()

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to create a user")
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input)

        if (inputParseError) {
            throw new InputParseError(inputParseError.errors[0].message)
        }

        return await createUserUseCase(data);

    })
}