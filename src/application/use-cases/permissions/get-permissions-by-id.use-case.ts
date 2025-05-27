import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { NotFoundError } from "@/src/entities/errors/common";

export type IGetPermissionByIdUseCase = ReturnType<typeof getPermissionByIdUseCase>;

export const getPermissionByIdUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (id: string): Promise<IPermissionsSchema> => {
    return await instrumentationService.startSpan({ name: "Get Permissions By Id Use Case", op: "function" },
        async () => {

            const permissions = await permissionsRepository.getById(id)

            if (!permissions) {
                throw new NotFoundError("Permissions not found")
            }

            return permissions
        }
    )
}