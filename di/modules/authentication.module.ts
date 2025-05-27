import { createModule } from '@evyweb/ioctopus';

import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';

import { signInUseCase } from '@/src/application/use-cases/auth/sign-in-passwordless.use-case';
import { signUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { signOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';

import { DI_SYMBOLS } from '@/di/types';
import { signInPasswordlessController } from '@/src/interface-adapters/controllers/auth/sign-in-passwordless.controller';
import { signOutController } from '@/src/interface-adapters/controllers/auth/sign-out.controller';
import { verifyOtpUseCase } from '@/src/application/use-cases/auth/verify-otp.use-case';
import { verifyOtpController } from '@/src/interface-adapters/controllers/auth/verify-otp.controller';
import { sendMagicLinkUseCase } from '@/src/application/use-cases/auth/send-magic-link.use-case';
import { sendPasswordRecoveryUseCase } from '@/src/application/use-cases/auth/send-password-recovery.use-case';
import { sendMagicLinkController } from '@/src/interface-adapters/controllers/auth/send-magic-link.controller';
import { sendPasswordRecoveryController } from '@/src/interface-adapters/controllers/auth/send-password-recovery.controller';
import { signInWithPasswordUseCase } from '@/src/application/use-cases/auth/sign-in-with-password.use-case';
import { signInWithPasswordController } from '@/src/interface-adapters/controllers/auth/sign-in-with-password.controller';
import { checkPermissionsUseCase } from '@/src/application/use-cases/auth/check-permissions.use-case';
import { checkPermissionsController } from '@/src/interface-adapters/controllers/auth/check-permissions.controller';

export function createAuthenticationModule() {
    const authenticationModule = createModule();

    if (process.env.NODE_ENV === 'test') {
        // authenticationModule
        //     .bind(DI_SYMBOLS.IAuthenticationService)
        //     .toClass(MockAuthenticationService, [DI_SYMBOLS.IUsersRepository]);
        authenticationModule
            .bind(DI_SYMBOLS.IAuthenticationService)
            .toClass(AuthenticationService, [
                DI_SYMBOLS.IInstrumentationService,
                DI_SYMBOLS.ICrashReporterService,
                DI_SYMBOLS.IPermissionsRepository,
                DI_SYMBOLS.IUsersRepository,
            ]);
    } else {
    authenticationModule
        .bind(DI_SYMBOLS.IAuthenticationService)
        .toClass(AuthenticationService, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ICrashReporterService,
            DI_SYMBOLS.IPermissionsRepository,
            DI_SYMBOLS.IUsersRepository,
        ]);
    }

    // Use Cases
    authenticationModule
        .bind(DI_SYMBOLS.ISignInPasswordlessUseCase)
        .toHigherOrderFunction(signInUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISignInWithPasswordUseCase)
        .toHigherOrderFunction(signInWithPasswordUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISignUpUseCase)
        .toHigherOrderFunction(signUpUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.IVerifyOtpUseCase)
        .toHigherOrderFunction(verifyOtpUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
            DI_SYMBOLS.IUsersRepository
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISignOutUseCase)
        .toHigherOrderFunction(signOutUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISendMagicLinkUseCase)
        .toHigherOrderFunction(sendMagicLinkUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISendPasswordRecoveryUseCase)
        .toHigherOrderFunction(sendPasswordRecoveryUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
            DI_SYMBOLS.IUsersRepository,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ICheckPermissionsUseCase)
        .toHigherOrderFunction(checkPermissionsUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IAuthenticationService,
        ]);


    // Controllers
    authenticationModule
        .bind(DI_SYMBOLS.ISignInPasswordlessController)
        .toHigherOrderFunction(signInPasswordlessController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ISignInPasswordlessUseCase,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISignInWithPasswordController)
        .toHigherOrderFunction(signInWithPasswordController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ISignInWithPasswordUseCase,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.IVerifyOtpController)
        .toHigherOrderFunction(verifyOtpController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IVerifyOtpUseCase,
        ]);


    authenticationModule
        .bind(DI_SYMBOLS.ISignOutController)
        .toHigherOrderFunction(signOutController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ISignOutUseCase,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISendMagicLinkController)
        .toHigherOrderFunction(sendMagicLinkController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ISendMagicLinkUseCase,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ISendPasswordRecoveryController)
        .toHigherOrderFunction(sendPasswordRecoveryController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ISendPasswordRecoveryUseCase,
        ]);

    authenticationModule
        .bind(DI_SYMBOLS.ICheckPermissionsController)
        .toHigherOrderFunction(checkPermissionsController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ICheckPermissionsUseCase,
            DI_SYMBOLS.IUsersRepository,
        ]);



    return authenticationModule;
}