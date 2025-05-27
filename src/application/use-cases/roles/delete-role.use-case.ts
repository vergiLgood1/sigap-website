import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IRolesRepository } from "../../repositories/roles.repository.interface";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IDeleteRoleUseCase = ReturnType<typeof deleteRoleUseCase>;

export const deleteRoleUseCase = (
    instrumentationService: IInstrumentationService,
    rolesRepository: IRolesRepository,
) => async (id: string): Promise<IRolesSchema> => {
    return await instrumentationService.startSpan({ name: "Delete Role Use Case", op: "function" },
        async () => {

            const existingRole = await rolesRepository.getById(id);

            if (!existingRole) {
                throw new NotFoundError("Role not found");
            }

            const deletedRole = await rolesRepository.delete(id);

            return deletedRole;
        }
    );
};
