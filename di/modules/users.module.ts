import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { UsersRepository } from '@/src/infrastructure/repositories/users.repository';
import { getUsersController } from '@/src/interface-adapters/controllers/users/get-users.controller';
import { banUserController } from '@/src/interface-adapters/controllers/users/ban-user.controller';
import { banUserUseCase } from '@/src/application/use-cases/users/ban-user.use-case';
import { unbanUserUseCase } from '@/src/application/use-cases/users/unban-user.use-case';
import { getCurrentUserUseCase } from '@/src/application/use-cases/users/get-current-user.use-case';
import { getUserByIdUseCase } from '@/src/application/use-cases/users/get-user-by-id.use-case';
import { inviteUserUseCase } from '@/src/application/use-cases/users/invite-user.use-case';
import { createUserUseCase } from '@/src/application/use-cases/users/create-user.use-case';
import { unbanUserController } from '@/src/interface-adapters/controllers/users/unban-user.controller';
import { getCurrentUserController } from '@/src/interface-adapters/controllers/users/get-current-user.controller';
import { getUserByIdController } from '@/src/interface-adapters/controllers/users/get-user-by-id.controller';
import { getUserByEmailController } from '@/src/interface-adapters/controllers/users/get-user-by-email.controller';
import { getUserByUsernameController } from '@/src/interface-adapters/controllers/users/get-user-by-username.controller';
import { inviteUserController } from '@/src/interface-adapters/controllers/users/invite-user.controller';
import { createUserController } from '@/src/interface-adapters/controllers/users/create-user.controller';
import { updateUserController } from '@/src/interface-adapters/controllers/users/update-user-controller';
import { deleteUserController } from '@/src/interface-adapters/controllers/users/delete-user.controller';
import { deleteUserUseCase } from '@/src/application/use-cases/users/delete-user.use-case';
import { getUserByUsernameUseCase } from '@/src/application/use-cases/users/get-user-by-username.use-case';
import { getUserByEmailUseCase } from '@/src/application/use-cases/users/get-user-by-email.use-case';
import { updateUserUseCase } from '@/src/application/use-cases/users/update-user.use-case';
import { getUsersUseCase } from '@/src/application/use-cases/users/get-users.use-case';


export function createUsersModule() {
    const usersModule = createModule();

    if (process.env.NODE_ENV === 'test') {
        // usersModule.bind(DI_SYMBOLS.IUsersRepository).toClass(MockUsersRepository);
        usersModule
            .bind(DI_SYMBOLS.IUsersRepository)
            .toClass(UsersRepository, [
                DI_SYMBOLS.IInstrumentationService,
                DI_SYMBOLS.ICrashReporterService,
            ]);
    } else {
        usersModule
            .bind(DI_SYMBOLS.IUsersRepository)
            .toClass(UsersRepository, [
                DI_SYMBOLS.IInstrumentationService,
                DI_SYMBOLS.ICrashReporterService
            ]);
    }

    // Use cases
    usersModule
        .bind(DI_SYMBOLS.IBanUserUseCase)
        .toHigherOrderFunction(banUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    usersModule
        .bind(DI_SYMBOLS.IUnbanUserUseCase)
        .toHigherOrderFunction(unbanUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetCurrentUserUseCase)
        .toHigherOrderFunction(getCurrentUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUsersUseCase)
        .toHigherOrderFunction(getUsersUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUserByIdUseCase)
        .toHigherOrderFunction(getUserByIdUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUserByEmailUseCase)
        .toHigherOrderFunction(getUserByEmailUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUserByUsernameUseCase)
        .toHigherOrderFunction(getUserByUsernameUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IInviteUserUseCase)
        .toHigherOrderFunction(inviteUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.ICreateUserUseCase)
        .toHigherOrderFunction(createUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IUpdateUserUseCase)
        .toHigherOrderFunction(updateUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IDeleteUserUseCase)
        .toHigherOrderFunction(deleteUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    usersModule
        .bind(DI_SYMBOLS.IUploadAvatarUseCase)
        .toHigherOrderFunction(updateUserUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    // Controllers
    usersModule
        .bind(DI_SYMBOLS.IBanUserController)
        .toHigherOrderFunction(banUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IBanUserUseCase,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IUnbanUserController)
        .toHigherOrderFunction(unbanUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUnbanUserUseCase,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetCurrentUserController)
        .toHigherOrderFunction(getCurrentUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUsersController)
        .toHigherOrderFunction(getUsersController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetUsersUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUserByIdController)
        .toHigherOrderFunction(getUserByIdController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetUserByIdUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUserByEmailController)
        .toHigherOrderFunction(getUserByEmailController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetUserByEmailUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IGetUserByUsernameController)
        .toHigherOrderFunction(getUserByUsernameController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetUserByUsernameUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IInviteUserController)
        .toHigherOrderFunction(inviteUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IInviteUserUseCase,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.ICreateUserController)
        .toHigherOrderFunction(createUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ICreateUserUseCase,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IUpdateUserController)
        .toHigherOrderFunction(updateUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUpdateUserUseCase,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IDeleteUserController)
        .toHigherOrderFunction(deleteUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IDeleteUserUseCase,
            DI_SYMBOLS.IGetCurrentUserUseCase
        ]);

    usersModule
        .bind(DI_SYMBOLS.IUploadAvatarController)
        .toHigherOrderFunction(updateUserController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUploadAvatarUseCase,
        ]);


    return usersModule;
}