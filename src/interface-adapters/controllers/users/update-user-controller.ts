import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { IUpdateUserUseCase } from "@/src/application/use-cases/users/update-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { UpdateUserSchema } from "@/src/entities/models/users/update-user.model";

import { z } from "zod";

const inputSchema = UpdateUserSchema

export type IUpdateUserController = ReturnType<typeof updateUserController>

export const updateUserController =
    (
        instrumentationService: IInstrumentationService,
        updateUserUseCase: IUpdateUserUseCase,
        getCurrentUserUseCase: IGetCurrentUserUseCase
    ) =>
        async (id: string, input: Partial<z.infer<typeof inputSchema>>,) => {
            return await instrumentationService.startSpan({ name: "updateUser Controller" }, async () => {

                const session = await getCurrentUserUseCase()

                if (!session) {
                    throw new UnauthenticatedError("Must be logged in to create a todo")
                }

                const { data, error: inputParseError } = inputSchema.safeParse(input)

                if (inputParseError) {
                    throw new InputParseError("Invalid data", { cause: inputParseError })
                }

                return await updateUserUseCase({ id }, data);
            })
        }