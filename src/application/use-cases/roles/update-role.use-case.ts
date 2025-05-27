import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IRolesRepository } from "../../repositories/roles.repository.interface";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { NotFoundError } from "@/src/entities/errors/common";
import { IUpdateRoleSchema } from "@/src/entities/models/roles/update-roles.model";

export type IUpdateRoleUseCase = ReturnType<typeof updateRoleUseCase>;

export const updateRoleUseCase = (
    instrumentationService: IInstrumentationService,
    rolesRepository: IRolesRepository,
) => async (id: string, data: IUpdateRoleSchema): Promise<IRolesSchema> => {
    return await instrumentationService.startSpan({ name: "Update Role Use Case", op: "function" },
        async () => {

            const existingRole = await rolesRepository.getById(id);

            if (!existingRole) {
                throw new NotFoundError("Role not found");
            }

            const updatedRole = await rolesRepository.update(id, data);

            return updatedRole;
        }
    );
};
