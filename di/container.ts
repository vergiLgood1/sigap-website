import { createContainer } from '@evyweb/ioctopus';
import { DI_RETURN_TYPES, DI_SYMBOLS } from '@/di/types';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { createAuthenticationModule } from './modules/authentication.module';
import { createMonitoringModule } from './modules/monitoring.module';
import { createTransactionManagerModule } from './modules/database.modul';
import { createUsersModule } from './modules/users.module';
import { createRolesModule } from './modules/roles.module';
import { createPermissionsModule } from './modules/permissions.module';
import { createResourcesModule } from './modules/resources.module';

const ApplicationContainer = createContainer();

ApplicationContainer.load(Symbol('MonitoringModule'), createMonitoringModule());
ApplicationContainer.load(Symbol('TransactionManagerModule'), createTransactionManagerModule());
ApplicationContainer.load(Symbol('AuthenticationModule'), createAuthenticationModule());
ApplicationContainer.load(Symbol('UsersModule'), createUsersModule());
ApplicationContainer.load(Symbol('RolesModule'), createRolesModule());
ApplicationContainer.load(Symbol('PermissionsModule'), createPermissionsModule());
ApplicationContainer.load(Symbol('ResourcesModule'), createResourcesModule());

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
    symbol: K
): DI_RETURN_TYPES[K] {
    const instrumentationService =
        ApplicationContainer.get<IInstrumentationService>(
            DI_SYMBOLS.IInstrumentationService
        );

    return instrumentationService.startSpan(
        {
            name: '(di) getInjection',
            op: 'function',
            attributes: { symbol: symbol.toString() },
        },
        () => ApplicationContainer.get(DI_SYMBOLS[symbol])
    );
}

