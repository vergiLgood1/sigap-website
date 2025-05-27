import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetPermissionByRoleUseCase } from "@/src/application/use-cases/permissions/get-permissions-by-role.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";


export type IGetPermissionByRoleController = ReturnType<typeof getPermissionByRoleController>;

export const getPermissionByRoleController = (
    instrumentationService: IInstrumentationService,
    getPermissionByRoleUseCase: IGetPermissionByRoleUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (roleId: string) => {
    return await instrumentationService.startSpan({ name: "Get Permission By Role Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to fetch permissions");
        }

        return await getPermissionByRoleUseCase(roleId);
    });
};
