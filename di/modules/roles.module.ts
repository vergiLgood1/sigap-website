import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { createRoleUseCase } from '@/src/application/use-cases/roles/create-role.use-case';
import { getRoleByIdUseCase } from '@/src/application/use-cases/roles/get-role-by-id.use-case';
import { updateRoleUseCase } from '@/src/application/use-cases/roles/update-role.use-case';
import { deleteRoleUseCase } from '@/src/application/use-cases/roles/delete-role.use-case';
import { createRoleController } from '@/src/interface-adapters/controllers/roles/create-role.controller';
import { getRoleByIdController } from '@/src/interface-adapters/controllers/roles/get-role-by-id.controller';
import { updateRoleController } from '@/src/interface-adapters/controllers/roles/update-role.controller';
import { deleteRoleController } from '@/src/interface-adapters/controllers/roles/delete-role.controller';
import { RolesRepository } from '@/src/infrastructure/repositories/roles.repository';

export function createRolesModule() {
    const rolesModule = createModule();

    if (process.env.NODE_ENV === 'test') {
        // rolesModule
        //     .bind(DI_SYMBOLS.IRolesRepository)
        //     .toClass(MockRolesRepository, [DI_SYMBOLS.IInstrumentationService]);
    } else {
        rolesModule
            .bind(DI_SYMBOLS.IRolesRepository)
            .toClass(RolesRepository, [
                DI_SYMBOLS.IInstrumentationService,
            ]);
    }

    // Use Cases
    rolesModule
        .bind(DI_SYMBOLS.ICreateRoleUseCase)
        .toHigherOrderFunction(createRoleUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IRolesRepository,
        ]);

    rolesModule
        .bind(DI_SYMBOLS.IGetRoleByIdUseCase)
        .toHigherOrderFunction(getRoleByIdUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IRolesRepository,
        ]);

    rolesModule
        .bind(DI_SYMBOLS.IUpdateRoleUseCase)
        .toHigherOrderFunction(updateRoleUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IRolesRepository,
        ]);

    rolesModule
        .bind(DI_SYMBOLS.IDeleteRoleUseCase)
        .toHigherOrderFunction(deleteRoleUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IRolesRepository,
        ]);

    // Controllers
    rolesModule
        .bind(DI_SYMBOLS.ICreateRoleController)
        .toHigherOrderFunction(createRoleController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ICreateRoleUseCase,
        ]);

    rolesModule
        .bind(DI_SYMBOLS.IGetRoleByIdController)
        .toHigherOrderFunction(getRoleByIdController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetRoleByIdUseCase,
        ]);

    rolesModule
        .bind(DI_SYMBOLS.IUpdateRoleController)
        .toHigherOrderFunction(updateRoleController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUpdateRoleUseCase,
        ]);

    rolesModule
        .bind(DI_SYMBOLS.IDeleteRoleController)
        .toHigherOrderFunction(deleteRoleController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IDeleteRoleUseCase,
        ]);

    return rolesModule;
}
