
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IRolesRepository } from "../../repositories/roles.repository.interface";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { AlreadyExistsError } from "@/src/entities/errors/common";
import { ICreateRoleSchema } from "@/src/entities/models/roles/create-roles.model";

export type ICreateRoleUseCase = ReturnType<typeof createRoleUseCase>;

export const createRoleUseCase = (
    instrumentationService: IInstrumentationService,
    rolesRepository: IRolesRepository,
) => async (input: ICreateRoleSchema): Promise<IRolesSchema> => {
    return await instrumentationService.startSpan({ name: "Create Role Use Case", op: "function" },
        async () => {

            const existingRole = await rolesRepository.getByName(input.name);

            if (existingRole) {
                throw new AlreadyExistsError("Role already exists");
            }

            const role = await rolesRepository.create(input);

            return role;
        }
    );
};
