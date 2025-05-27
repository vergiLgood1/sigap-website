import { ICreatePermissionSchema } from "@/src/entities/models/permissions/create-permission.model"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface"
import { permissions } from "@prisma/client"
import { AlreadyExistsError } from "@/src/entities/errors/common"
import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model"

export type ICreatePermissionUseCase = ReturnType<typeof createPermissionUseCase>

export const createPermissionUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (input: ICreatePermissionSchema): Promise<IPermissionsSchema> => {
    return await instrumentationService.startSpan({ name: "Create Permission Use Case", op: "function" },
        async () => {

            const existingPermission = await permissionsRepository.getByRoleAndResource(input.role_id, input.resource_id)

            if (existingPermission) {
                throw new AlreadyExistsError("Permission already exists")
            }

            const permission = await permissionsRepository.create(input)

            return permission
        }
    )
}
