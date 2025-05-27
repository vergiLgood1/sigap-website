import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { IUnbanUserUseCase } from "@/src/application/use-cases/users/unban-user.use-case";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    id: z.string()
})

export type IUnbanUserController = ReturnType<typeof unbanUserController>

export const unbanUserController = (
    instrumentationService: IInstrumentationService,
    unbanUserUseCase: IUnbanUserUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) =>
    async (input: Partial<z.infer<typeof inputSchema>>) => {
        return await instrumentationService.startSpan({ name: "unbanUser Controller" }, async () => {

            const session = await getCurrentUserUseCase();

            if (!session) {
                throw new InputParseError("Must be logged in to unban a user");
            }

            const { data, error: inputParseError } = inputSchema.safeParse(input);

            if (inputParseError) {
                throw new InputParseError("Invalid data", { cause: inputParseError });
            }

            return await unbanUserUseCase({ id: data.id });
        })
    }