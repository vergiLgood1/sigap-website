import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetUserByEmailUseCase } from "@/src/application/use-cases/users/get-user-by-email.use-case";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    email: z.string().email()
})

export type IGetUserByEmailController = ReturnType<typeof getUserByEmailController>

export const getUserByEmailController =
    (
        instrumentationService: IInstrumentationService,
        getUserByEmailUseCase: IGetUserByEmailUseCase
    ) =>
        async (input: Partial<z.infer<typeof inputSchema>>) => {
            return await instrumentationService.startSpan({ name: "getUserByEmail Controller" }, async () => {
                const { data, error: inputParseError } = inputSchema.safeParse(input);

                if (inputParseError) {
                    throw new InputParseError("Invalid data", { cause: inputParseError });
                }

                return await getUserByEmailUseCase({ email: data.email });
            })
        }