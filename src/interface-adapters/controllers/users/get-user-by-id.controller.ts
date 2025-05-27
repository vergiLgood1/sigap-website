import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { IGetUserByIdUseCase } from "@/src/application/use-cases/users/get-user-by-id.use-case"
import { InputParseError } from "@/src/entities/errors/common"
import { z } from "zod"

const inputSchema = z.object({
    id: z.string()
})

export type IGetUserByIdController = ReturnType<typeof getUserByIdController>

export const getUserByIdController = (
    instrumentationService: IInstrumentationService,
    getUserByIdUseCase: IGetUserByIdUseCase
) =>
    async (input: Partial<z.infer<typeof inputSchema>>) => {
        return await instrumentationService.startSpan({ name: "getUserById Controller" }, async () => {
            const { data, error: inputParseError } = inputSchema.safeParse(input);

            if (inputParseError) {
                throw new InputParseError("Invalid data", { cause: inputParseError });
            }

            return await getUserByIdUseCase({ id: data.id });
        })
    }