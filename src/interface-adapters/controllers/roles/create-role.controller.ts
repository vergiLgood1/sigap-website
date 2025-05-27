import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ICreateRoleUseCase } from "@/src/application/use-cases/roles/create-role.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";

import { z } from "zod";

const inputSchema = z.object({
    name: z.string().min(1, { message: "Role name is required" }),
    description: z.string().optional(),
});

export type ICreateRoleController = ReturnType<typeof createRoleController>;

export const createRoleController = (
    instrumentationService: IInstrumentationService,
    createRoleUseCase: ICreateRoleUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: Partial<z.infer<typeof inputSchema>>) => {
    return await instrumentationService.startSpan({ name: "createRole Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to create a role");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await createRoleUseCase(data);
    });
};
