import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetPermissionByRoleAndResourcesUseCase } from "@/src/application/use-cases/permissions/get-permissions-by-role-and-resources.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    roleId: z.string(),
    resourceId: z.string(),
})

export type IGetPermissionByRoleAndResourceController = ReturnType<typeof getPermissionByRoleAndResourceController>;

export const getPermissionByRoleAndResourceController = (
    instrumentationService: IInstrumentationService,
    getPermissionByRoleAndResourceUseCase: IGetPermissionByRoleAndResourcesUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: z.infer<typeof inputSchema>) => {
    return await instrumentationService.startSpan({ name: "Get Permissions Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to view permissions");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await getPermissionByRoleAndResourceUseCase(data.roleId, data.resourceId);
    });
};
