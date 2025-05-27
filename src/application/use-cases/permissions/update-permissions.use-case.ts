import { IUpdatePermissionSchema } from "@/src/entities/models/permissions/update-permission.model";
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { NotFoundError } from "@/src/entities/errors/common";


export type IUpdatePermissionUseCase = ReturnType<typeof updatePermissionUseCase>;

export const updatePermissionUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (id: string, input: IUpdatePermissionSchema): Promise<IPermissionsSchema> => {
    return await instrumentationService.startSpan({ name: "Update Permission Use Case", op: "function" },
        async () => {

            const permission = await permissionsRepository.getById(id)

            if (!permission) {
                throw new NotFoundError("Permission not found")
            }

            const updatedPermission = await permissionsRepository.update(id, input)

            return updatedPermission
        }
    )
}