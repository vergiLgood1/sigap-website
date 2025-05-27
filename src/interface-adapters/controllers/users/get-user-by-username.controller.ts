import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetUserByUsernameUseCase } from "@/src/application/use-cases/users/get-user-by-username.use-case";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    username: z.string()
})

export type IGetUserByUsernameController = ReturnType<typeof getUserByUsernameController>

export const getUserByUsernameController =
    (
        instrumentationService: IInstrumentationService,
        getUserByUsernameUseCase: IGetUserByUsernameUseCase
    ) =>
        async (input: Partial<z.infer<typeof inputSchema>>) => {
            return await instrumentationService.startSpan({ name: "getUserByUsername Controller" }, async () => {
                const { data, error: inputParseError } = inputSchema.safeParse(input);

                if (inputParseError) {
                    throw new InputParseError("Invalid data", { cause: inputParseError });
                }

                return await getUserByUsernameUseCase({ username: data.username });
            })
        }