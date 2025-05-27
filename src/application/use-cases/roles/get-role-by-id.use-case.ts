import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IRolesRepository } from "../../repositories/roles.repository.interface";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IGetRoleByIdUseCase = ReturnType<typeof getRoleByIdUseCase>;

export const getRoleByIdUseCase = (
    instrumentationService: IInstrumentationService,
    rolesRepository: IRolesRepository,
) => async (id: string): Promise<IRolesSchema> => {
    return await instrumentationService.startSpan({ name: "Get Role By ID Use Case", op: "function" },
        async () => {

            const role = await rolesRepository.getById(id);

            if (!role) {
                throw new NotFoundError("Role not found");
            }

            return role;
        }
    );
};
