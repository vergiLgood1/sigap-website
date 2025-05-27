import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetRoleByIdUseCase } from "@/src/application/use-cases/roles/get-role-by-id.use-case";


import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    id: z.string()
})

export type IGetRoleByIdController = ReturnType<typeof getRoleByIdController>;

export const getRoleByIdController = (
    instrumentationService: IInstrumentationService,
    getRoleById: IGetRoleByIdUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: Partial<z.infer<typeof inputSchema>>) => {
    return await instrumentationService.startSpan({ name: "getRole Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to fetch a role");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await getRoleById(data.id);
    });
};
