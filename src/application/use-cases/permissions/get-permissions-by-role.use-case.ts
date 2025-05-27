import { NotFoundError } from "@/src/entities/errors/common";
import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface";

export type IGetPermissionByRoleUseCase = ReturnType<typeof getPermissionByRoleUseCase>;

export const getPermissionByRoleUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (roleId: string): Promise<IPermissionsSchema[]> => {
    return await instrumentationService.startSpan({ name: "Get Permissions By Role Use Case", op: "function" },
        async () => {

            const permissions = await permissionsRepository.getByRole(roleId)

            if (!permissions) {
                throw new NotFoundError("Permissions not found")
            }

            return permissions
        }
    )
}