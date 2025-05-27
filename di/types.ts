import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';

import { ISignInPasswordlessUseCase } from '@/src/application/use-cases/auth/sign-in-passwordless.use-case';
import { ISignUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { ISignOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IVerifyOtpUseCase } from '@/src/application/use-cases/auth/verify-otp.use-case';
import { ISignInPasswordlessController } from '@/src/interface-adapters/controllers/auth/sign-in-passwordless.controller';
import { ISignOutController } from '@/src/interface-adapters/controllers/auth/sign-out.controller';
import { IVerifyOtpController } from '@/src/interface-adapters/controllers/auth/verify-otp.controller';
import { IBanUserUseCase } from '@/src/application/use-cases/users/ban-user.use-case';
import { IUnbanUserUseCase } from '@/src/application/use-cases/users/unban-user.use-case';
import { IGetCurrentUserUseCase } from '@/src/application/use-cases/users/get-current-user.use-case';
import { IGetUsersUseCase } from '@/src/application/use-cases/users/get-users.use-case';
import { IGetUserByIdUseCase } from '@/src/application/use-cases/users/get-user-by-id.use-case';
import { IGetUserByEmailUseCase } from '@/src/application/use-cases/users/get-user-by-email.use-case';
import { IGetUserByUsernameUseCase } from '@/src/application/use-cases/users/get-user-by-username.use-case';
import { IInviteUserUseCase } from '@/src/application/use-cases/users/invite-user.use-case';
import { ICreateUserUseCase } from '@/src/application/use-cases/users/create-user.use-case';
import { IUpdateUserUseCase } from '@/src/application/use-cases/users/update-user.use-case';
import { IDeleteUserUseCase } from '@/src/application/use-cases/users/delete-user.use-case';
import { IBanUserController } from '@/src/interface-adapters/controllers/users/ban-user.controller';
import { IUnbanUserController } from '@/src/interface-adapters/controllers/users/unban-user.controller';
import { IGetCurrentUserController } from '@/src/interface-adapters/controllers/users/get-current-user.controller';
import { IGetUserByUsernameController } from '@/src/interface-adapters/controllers/users/get-user-by-username.controller';
import { IGetUserByIdController } from '@/src/interface-adapters/controllers/users/get-user-by-id.controller';
import { IGetUserByEmailController } from '@/src/interface-adapters/controllers/users/get-user-by-email.controller';
import { IInviteUserController } from '@/src/interface-adapters/controllers/users/invite-user.controller';
import { IUpdateUserController } from '@/src/interface-adapters/controllers/users/update-user-controller';
import { ICreateUserController } from '@/src/interface-adapters/controllers/users/create-user.controller';
import { IDeleteUserController } from '@/src/interface-adapters/controllers/users/delete-user.controller';
import { IGetUsersController } from '@/src/interface-adapters/controllers/users/get-users.controller';
import { ISendMagicLinkUseCase } from '@/src/application/use-cases/auth/send-magic-link.use-case';
import { ISendPasswordRecoveryUseCase } from '@/src/application/use-cases/auth/send-password-recovery.use-case';
import { ISendMagicLinkController } from '@/src/interface-adapters/controllers/auth/send-magic-link.controller';
import { ISendPasswordRecoveryController } from '@/src/interface-adapters/controllers/auth/send-password-recovery.controller';
import { IUploadAvatarController } from '@/src/interface-adapters/controllers/users/upload-avatar.controller';
import { IUploadAvatarUseCase } from '@/src/application/use-cases/users/upload-avatar.use-case';
import { ISignInWithPasswordController } from '@/src/interface-adapters/controllers/auth/sign-in-with-password.controller';
import { IRolesRepository } from '@/src/application/repositories/roles.repository.interface';
import { IPermissionsRepository } from '@/src/application/repositories/permissions.repository.interface';
import { IResourcesRepository } from '@/src/application/repositories/resources.repository.interface';
import { ICreateRoleUseCase } from '@/src/application/use-cases/roles/create-role.use-case';
import { IGetRoleByIdUseCase } from '@/src/application/use-cases/roles/get-role-by-id.use-case';
import { IUpdateRoleUseCase } from '@/src/application/use-cases/roles/update-role.use-case';
import { IDeleteRoleUseCase } from '@/src/application/use-cases/roles/delete-role.use-case';
import { ICreatePermissionUseCase } from '@/src/application/use-cases/permissions/create-permissions.use-case';
import { IGetAllPermissionsUseCase } from '@/src/application/use-cases/permissions/get-all-permissions';
import { IGetPermissionByIdUseCase } from '@/src/application/use-cases/permissions/get-permissions-by-id.use-case';
import { IGetPermissionByRoleUseCase } from '@/src/application/use-cases/permissions/get-permissions-by-role.use-case';
import { IGetPermissionByRoleAndResourceController } from '@/src/interface-adapters/controllers/permissions/get-permission-by-role-and-resource.controller';
import { IGetPermissionByRoleAndResourcesUseCase } from '@/src/application/use-cases/permissions/get-permissions-by-role-and-resources.use-case';
import { IUpdatePermissionUseCase } from '@/src/application/use-cases/permissions/update-permissions.use-case';
import { IDeletePermissionUseCase } from '@/src/application/use-cases/permissions/delete-permissions.use-case';
import { ICreateResourceUseCase } from '@/src/application/use-cases/resources/create-resources.use-case';
import { IGetResourceByIdUseCase } from '@/src/application/use-cases/resources/get-resource-by-id.use-case';
import { IGetResourcesByTypeUseCase } from '@/src/application/use-cases/resources/get-resources-by-type.use-case';
import { IUpdateResourceUseCase } from '@/src/application/use-cases/resources/update-resource.use-case';
import { IDeleteResourceUseCase } from '@/src/application/use-cases/resources/delete-resource.use-case';
import { ICheckPermissionsController } from '@/src/interface-adapters/controllers/auth/check-permissions.controller';
import { ICreateRoleController } from '@/src/interface-adapters/controllers/roles/create-role.controller';
import { IGetRoleByIdController } from '@/src/interface-adapters/controllers/roles/get-role-by-id.controller';
import { IUpdateRoleController } from '@/src/interface-adapters/controllers/roles/update-role.controller';
import { IDeleteRoleController } from '@/src/interface-adapters/controllers/roles/delete-role.controller';
import { ICreatePermissionController } from '@/src/interface-adapters/controllers/permissions/create-permission.controller';
import { IGetAllPermissionsController } from '@/src/interface-adapters/controllers/permissions/get-all-permission.controller';
import { IGetPermissionByIdController } from '@/src/interface-adapters/controllers/permissions/get-permission-by-id.controller';
import { IGetPermissionByRoleController } from '@/src/interface-adapters/controllers/permissions/get-permission-by-role.controller';
import { IUpdatePermissionController } from '@/src/interface-adapters/controllers/permissions/update-permission.controller';
import { IDeletePermissionController } from '@/src/interface-adapters/controllers/permissions/delete-permission.controller';
import { IGetResourceByIdController } from '@/src/interface-adapters/controllers/resources/get-resource-by-id.controller';
import { IGetResourcesByTypeController } from '@/src/interface-adapters/controllers/resources/get-resources-by-type.controller';
import { IDeleteResourceController } from '@/src/interface-adapters/controllers/resources/delete-resource.controller';
import { IUpdateResourceController } from '@/src/interface-adapters/controllers/resources/update-resource.controller';
import { ICreateResourceController } from '@/src/interface-adapters/controllers/resources/create-resource.controller';
import { ICheckPermissionsUseCase } from '@/src/application/use-cases/auth/check-permissions.use-case';
import { ISignInWithPasswordUseCase } from '@/src/application/use-cases/auth/sign-in-with-password.use-case';

// Pastikan DI_SYMBOLS memiliki tipe yang sesuai dengan DI_RETURN_TYPES
export const DI_SYMBOLS: { [K in keyof DI_RETURN_TYPES]: symbol } = {
    // Services
    IAuthenticationService: Symbol.for('IAuthenticationService'),
    ITransactionManagerService: Symbol.for('ITransactionManagerService'),
    IInstrumentationService: Symbol.for('IInstrumentationService'),
    ICrashReporterService: Symbol.for('ICrashReporterService'),

    // Repositories
    IUsersRepository: Symbol.for('IUsersRepository'),
    IRolesRepository: Symbol.for('IRolesRepository'),
    IPermissionsRepository: Symbol.for('IPermissionsRepository'),
    IResourcesRepository: Symbol.for('IResourcesRepository'),

    // Use Cases

    // Auth Use Cases
    ISignInPasswordlessUseCase: Symbol.for('ISignInPasswordlessUseCase'),
    ISignInWithPasswordUseCase: Symbol.for('ISignInWithPasswordUseCase'),
    ISignUpUseCase: Symbol.for('ISignUpUseCase'),
    IVerifyOtpUseCase: Symbol.for('IVerifyOtpUseCase'),
    ISignOutUseCase: Symbol.for('ISignOutUseCase'),
    ISendMagicLinkUseCase: Symbol.for('ISendMagicLinkUseCase'),
    ISendPasswordRecoveryUseCase: Symbol.for('ISendPasswordRecoveryUseCase'),
    ICheckPermissionsUseCase: Symbol.for('ICheckPermissionsUseCase'),

    // User Use Cases
    IBanUserUseCase: Symbol.for('IBanUserUseCase'),
    IUnbanUserUseCase: Symbol.for('IUnbanUserUseCase'),
    IGetCurrentUserUseCase: Symbol.for('IGetCurrentUserUseCase'),
    IGetUsersUseCase: Symbol.for('IGetUsersUseCase'),
    IGetUserByIdUseCase: Symbol.for('IGetUserByIdUseCase'),
    IGetUserByEmailUseCase: Symbol.for('IGetUserByEmailUseCase'),
    IGetUserByUsernameUseCase: Symbol.for('IGetUserByUsernameUseCase'),
    IInviteUserUseCase: Symbol.for('IInviteUserUseCase'),
    ICreateUserUseCase: Symbol.for('ICreateUserUseCase'),
    IUpdateUserUseCase: Symbol.for('IUpdateUserUseCase'),
    IDeleteUserUseCase: Symbol.for('IDeleteUserUseCase'),
    IUploadAvatarUseCase: Symbol.for('IUploadAvatarUseCase'),

    // Role Use Cases
    ICreateRoleUseCase: Symbol.for('ICreateRoleUseCase'),
    IGetRoleByIdUseCase: Symbol.for('IGetRoleByIdUseCase'),
    IUpdateRoleUseCase: Symbol.for('IUpdateRoleUseCase'),
    IDeleteRoleUseCase: Symbol.for('IDeleteRoleUseCase'),

    // Permission Use Cases
    ICreatePermissionUseCase: Symbol.for('ICreatePermissionUseCase'),
    IGetAllPermissionsUseCase: Symbol.for('IGetAllPermissionsUseCase'),
    IGetPermissionByIdUseCase: Symbol.for('IGetPermissionByIdUseCase'),
    IGetPermissionByRoleUseCase: Symbol.for('IGetPermissionByRoleUseCase'),
    IGetPermissionByRoleAndResourcesUseCase: Symbol.for('IGetPermissionByRoleAndResourcesUseCase'),
    IUpdatePermissionUseCase: Symbol.for('IUpdatePermissionUseCase'),
    IDeletePermissionUseCase: Symbol.for('IDeletePermissionUseCase'),

    // Resource Use Cases
    ICreateResourceUseCase: Symbol.for('ICreateResourceUseCase'),
    IGetResourceByIdUseCase: Symbol.for('IGetResourceByIdUseCase'),
    IGetResourcesByTypeUseCase: Symbol.for('IGetResourcesByTypeUseCase'),
    IUpdateResourceUseCase: Symbol.for('IUpdateResourceUseCase'),
    IDeleteResourceUseCase: Symbol.for('IDeleteResourceUseCase'),

    // Controllers

    // Auth Controllers
    ISignInPasswordlessController: Symbol.for('ISignInPasswordlessController'),
    ISignInWithPasswordController: Symbol.for('ISignInWithPasswordController'),
    ISignOutController: Symbol.for('ISignOutController'),
    IVerifyOtpController: Symbol.for('IVerifyOtpController'),
    ISendMagicLinkController: Symbol.for('ISendMagicLinkController'),
    ISendPasswordRecoveryController: Symbol.for('ISendPasswordRecoveryController'),
    ICheckPermissionsController: Symbol.for('ICheckPermissionsController'),

    // User Controllers
    IBanUserController: Symbol.for('IBanUserController'),
    IUnbanUserController: Symbol.for('IUnbanUserController'),
    IGetCurrentUserController: Symbol.for('IGetCurrentUserController'),
    IGetUsersController: Symbol.for('IGetUsersController'),
    IGetUserByIdController: Symbol.for('IGetUserByIdController'),
    IGetUserByEmailController: Symbol.for('IGetUserByEmailController'),
    IGetUserByUsernameController: Symbol.for('IGetUserByUsernameController'),
    IInviteUserController: Symbol.for('IInviteUserController'),
    ICreateUserController: Symbol.for('ICreateUserController'),
    IUpdateUserController: Symbol.for('IUpdateUserController'),
    IDeleteUserController: Symbol.for('IDeleteUserController'),
    IUploadAvatarController: Symbol.for('IUploadAvatarController'),

    // Role Controllers
    ICreateRoleController: Symbol.for('ICreateRoleController'),
    IGetRoleByIdController: Symbol.for('IGetRoleByIdController'),
    IUpdateRoleController: Symbol.for('IUpdateRoleController'),
    IDeleteRoleController: Symbol.for('IDeleteRoleController'),

    // Permission Controllers
    ICreatePermissionController: Symbol.for('ICreatePermissionController'),
    IGetAllPermissionsController: Symbol.for('IGetAllPermissionsController'),
    IGetPermissionByIdController: Symbol.for('IGetPermissionByIdController'),
    IGetPermissionByRoleController: Symbol.for('IGetPermissionByRoleController'),
    IGetPermissionByRoleAndResourceController: Symbol.for('IGetPermissionByRoleAndResourceController'),
    IUpdatePermissionController: Symbol.for('IUpdatePermissionController'),
    IDeletePermissionController: Symbol.for('IDeletePermissionController'),

    // Resource Controllers
    ICreateResourceController: Symbol.for('ICreateResourceController'),
    IGetResourceByIdController: Symbol.for('IGetResourceByIdController'),
    IGetResourcesByTypeController: Symbol.for('IGetResourcesByTypeController'),
    IUpdateResourceController: Symbol.for('IUpdateResourceController'),
    IDeleteResourceController: Symbol.for('IDeleteResourceController'),
};

export interface DI_RETURN_TYPES {
    // Services
    IAuthenticationService: IAuthenticationService;
    ITransactionManagerService: ITransactionManagerService;
    IInstrumentationService: IInstrumentationService;
    ICrashReporterService: ICrashReporterService;

    // Repositories
    IUsersRepository: IUsersRepository;
    IRolesRepository: IRolesRepository;
    IPermissionsRepository: IPermissionsRepository;
    IResourcesRepository: IResourcesRepository;

    // Use Cases

    // Auth Use Cases
    ISignInPasswordlessUseCase: ISignInPasswordlessUseCase;
    ISignInWithPasswordUseCase: ISignInWithPasswordUseCase;
    ISignUpUseCase: ISignUpUseCase;
    IVerifyOtpUseCase: IVerifyOtpUseCase;
    ISignOutUseCase: ISignOutUseCase;
    ISendMagicLinkUseCase: ISendMagicLinkUseCase;
    ISendPasswordRecoveryUseCase: ISendPasswordRecoveryUseCase;
    ICheckPermissionsUseCase: ICheckPermissionsUseCase;

    // User Use Cases
    IBanUserUseCase: IBanUserUseCase;
    IUnbanUserUseCase: IUnbanUserUseCase;
    IGetCurrentUserUseCase: IGetCurrentUserUseCase;
    IGetUsersUseCase: IGetUsersUseCase;
    IGetUserByIdUseCase: IGetUserByIdUseCase;
    IGetUserByEmailUseCase: IGetUserByEmailUseCase;
    IGetUserByUsernameUseCase: IGetUserByUsernameUseCase;
    IInviteUserUseCase: IInviteUserUseCase;
    ICreateUserUseCase: ICreateUserUseCase;
    IUpdateUserUseCase: IUpdateUserUseCase;
    IDeleteUserUseCase: IDeleteUserUseCase;
    IUploadAvatarUseCase: IUploadAvatarUseCase;

    // Role Use Cases
    ICreateRoleUseCase: ICreateRoleUseCase;
    IGetRoleByIdUseCase: IGetRoleByIdUseCase;
    IUpdateRoleUseCase: IUpdateRoleUseCase;
    IDeleteRoleUseCase: IDeleteRoleUseCase;

    // Permission Use Cases
    ICreatePermissionUseCase: ICreatePermissionUseCase;
    IGetAllPermissionsUseCase: IGetAllPermissionsUseCase;
    IGetPermissionByIdUseCase: IGetPermissionByIdUseCase;
    IGetPermissionByRoleUseCase: IGetPermissionByRoleUseCase;
    IGetPermissionByRoleAndResourcesUseCase: IGetPermissionByRoleAndResourcesUseCase;
    IUpdatePermissionUseCase: IUpdatePermissionUseCase;
    IDeletePermissionUseCase: IDeletePermissionUseCase;

    // Resource Use Cases
    ICreateResourceUseCase: ICreateResourceUseCase;
    IGetResourceByIdUseCase: IGetResourceByIdUseCase;
    IGetResourcesByTypeUseCase: IGetResourcesByTypeUseCase;
    IUpdateResourceUseCase: IUpdateResourceUseCase;
    IDeleteResourceUseCase: IDeleteResourceUseCase;

    // Controllers

    // Auth Controllers
    ISignInPasswordlessController: ISignInPasswordlessController;
    ISignInWithPasswordController: ISignInWithPasswordController;
    IVerifyOtpController: IVerifyOtpController;
    ISignOutController: ISignOutController;
    ISendMagicLinkController: ISendMagicLinkController;
    ISendPasswordRecoveryController: ISendPasswordRecoveryController;
    ICheckPermissionsController: ICheckPermissionsController;

    // User Controllers
    IBanUserController: IBanUserController;
    IUnbanUserController: IUnbanUserController;
    IGetCurrentUserController: IGetCurrentUserController;
    IGetUsersController: IGetUsersController;
    IGetUserByIdController: IGetUserByIdController;
    IGetUserByEmailController: IGetUserByEmailController;
    IGetUserByUsernameController: IGetUserByUsernameController;
    IInviteUserController: IInviteUserController;
    ICreateUserController: ICreateUserController;
    IUpdateUserController: IUpdateUserController;
    IDeleteUserController: IDeleteUserController;
    IUploadAvatarController: IUploadAvatarController;

    // Role Controllers
    ICreateRoleController: ICreateRoleController;
    IGetRoleByIdController: IGetRoleByIdController;
    IUpdateRoleController: IUpdateRoleController;
    IDeleteRoleController: IDeleteRoleController;

    // Permission Controllers
    ICreatePermissionController: ICreatePermissionController;
    IGetAllPermissionsController: IGetAllPermissionsController;
    IGetPermissionByIdController: IGetPermissionByIdController;
    IGetPermissionByRoleController: IGetPermissionByRoleController;
    IGetPermissionByRoleAndResourceController: IGetPermissionByRoleAndResourceController;
    IUpdatePermissionController: IUpdatePermissionController;
    IDeletePermissionController: IDeletePermissionController;

    // Resource Controllers
    ICreateResourceController: ICreateResourceController;
    IGetResourceByIdController: IGetResourceByIdController;
    IGetResourcesByTypeController: IGetResourcesByTypeController;
    IUpdateResourceController: IUpdateResourceController;
    IDeleteResourceController: IDeleteResourceController;

}