import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { NotFoundError } from "@/src/entities/errors/common";

export type IGetPermissionByRoleAndResourcesUseCase = ReturnType<typeof getPermissionByRoleAndResourcesUseCase>;

export const getPermissionByRoleAndResourcesUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (roleId: string, resourceId: string): Promise<IPermissionsSchema[]> => {
    return await instrumentationService.startSpan({ name: "Get Permissions By Role And Resources Use Case", op: "function" },
        async () => {

            const permissions = await permissionsRepository.getByRoleAndResource(roleId, resourceId)

            if (!permissions) {
                throw new NotFoundError("Permissions not found")
            }

            return permissions
        }
    )
}