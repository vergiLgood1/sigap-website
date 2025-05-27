import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ICreatePermissionUseCase } from "@/src/application/use-cases/permissions/create-permissions.use-case";

import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { CreatePermissionSchema } from "@/src/entities/models/permissions/create-permission.model";
import { z } from "zod";

const inputSchema = z.object({
    action: z.string().min(1, { message: "Action is required" }),
    resource_id: z.string().min(1, { message: "Resource ID is required" }),
    role_id: z.string().min(1, { message: "Role ID is required" }),
})

export type ICreatePermissionController = ReturnType<typeof createPermissionController>;

export const createPermissionController = (
    instrumentationService: IInstrumentationService,
    createPermissionUseCase: ICreatePermissionUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: Partial<z.infer<typeof inputSchema>>) => {
    return await instrumentationService.startSpan({ name: "Create Permission Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to create a permission");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        return await createPermissionUseCase(data);
    });
};
