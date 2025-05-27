import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { createPermissionUseCase } from '@/src/application/use-cases/permissions/create-permissions.use-case';
import { getAllPermissionsUseCase } from '@/src/application/use-cases/permissions/get-all-permissions';
import { getPermissionByIdUseCase } from '@/src/application/use-cases/permissions/get-permissions-by-id.use-case';
import { getPermissionByRoleUseCase } from '@/src/application/use-cases/permissions/get-permissions-by-role.use-case';
import { updatePermissionUseCase } from '@/src/application/use-cases/permissions/update-permissions.use-case';
import { deletePermissionUseCase } from '@/src/application/use-cases/permissions/delete-permissions.use-case';
import { createPermissionController } from '@/src/interface-adapters/controllers/permissions/create-permission.controller';
import { getAllPermissionsController } from '@/src/interface-adapters/controllers/permissions/get-all-permission.controller';
import { getPermissionByIdController } from '@/src/interface-adapters/controllers/permissions/get-permission-by-id.controller';
import { getPermissionByRoleController } from '@/src/interface-adapters/controllers/permissions/get-permission-by-role.controller';
import { updatePermissionController } from '@/src/interface-adapters/controllers/permissions/update-permission.controller';
import { deletePermissionController } from '@/src/interface-adapters/controllers/permissions/delete-permission.controller';
import { PermissionsRepository } from '@/src/infrastructure/repositories/permissions.repository';

export function createPermissionsModule() {
    const permissionsModule = createModule();

    if (process.env.NODE_ENV === 'test') {
        permissionsModule
            .bind(DI_SYMBOLS.IPermissionsRepository)
            .toClass(PermissionsRepository, [
                DI_SYMBOLS.IInstrumentationService,
                DI_SYMBOLS.ICrashReporterService,
            ]);
    } else {
        permissionsModule
            .bind(DI_SYMBOLS.IPermissionsRepository)
            .toClass(PermissionsRepository, [
                DI_SYMBOLS.IInstrumentationService,
                DI_SYMBOLS.ICrashReporterService,
            ]);
    }

    // Use Cases
    permissionsModule
        .bind(DI_SYMBOLS.ICreatePermissionUseCase)
        .toHigherOrderFunction(createPermissionUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IPermissionsRepository,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IGetAllPermissionsUseCase)
        .toHigherOrderFunction(getAllPermissionsUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IPermissionsRepository,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IGetPermissionByIdUseCase)
        .toHigherOrderFunction(getPermissionByIdUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IPermissionsRepository,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IGetPermissionByRoleUseCase)
        .toHigherOrderFunction(getPermissionByRoleUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IPermissionsRepository,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IUpdatePermissionUseCase)
        .toHigherOrderFunction(updatePermissionUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IPermissionsRepository,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IDeletePermissionUseCase)
        .toHigherOrderFunction(deletePermissionUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IPermissionsRepository,
        ]);

    // Controllers
    permissionsModule
        .bind(DI_SYMBOLS.ICreatePermissionController)
        .toHigherOrderFunction(createPermissionController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ICreatePermissionUseCase,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IGetAllPermissionsController)
        .toHigherOrderFunction(getAllPermissionsController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetAllPermissionsUseCase,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IGetPermissionByIdController)
        .toHigherOrderFunction(getPermissionByIdController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetPermissionByIdUseCase,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IGetPermissionByRoleController)
        .toHigherOrderFunction(getPermissionByRoleController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetPermissionByRoleUseCase,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IUpdatePermissionController)
        .toHigherOrderFunction(updatePermissionController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUpdatePermissionUseCase,
        ]);

    permissionsModule
        .bind(DI_SYMBOLS.IDeletePermissionController)
        .toHigherOrderFunction(deletePermissionController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IDeletePermissionUseCase,
        ]);

    return permissionsModule;
}
