import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IRolesRepository } from "../../repositories/roles.repository.interface";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IGetRoleByNameUseCase = ReturnType<typeof getRoleByNameUseCase>;

export const getRoleByNameUseCase = (
    instrumentationService: IInstrumentationService,
    rolesRepository: IRolesRepository,
) => async (name: string): Promise<IRolesSchema> => {
    return await instrumentationService.startSpan({ name: "Get Role By Name Use Case", op: "function" },
        async () => {

            const role = await rolesRepository.getByName(name);

            if (!role) {
                throw new NotFoundError("Role not found");
            }

            return role;
        }
    );
};
