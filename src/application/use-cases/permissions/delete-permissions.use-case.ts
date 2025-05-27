import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { NotFoundError } from "@/src/entities/errors/common";
import { IDeletePermissionsSchema } from "@/src/entities/models/permissions/delete-permissions.model";

export type IDeletePermissionUseCase = ReturnType<typeof deletePermissionUseCase>;

export const deletePermissionUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (input: IDeletePermissionsSchema): Promise<IPermissionsSchema> => {
    return await instrumentationService.startSpan({ name: "Delete Permissions Use Case", op: "function" },
        async () => {

            const permissions = await permissionsRepository.getById(input.id);

            if (!permissions) {
                throw new NotFoundError("Permissions not found");
            }

            const deletedPermissions = await permissionsRepository.delete(input.id);

            return deletedPermissions;
        }
    );
}