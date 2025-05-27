import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { InstrumentationService } from '@/src/infrastructure/services/instrumentation.service';
import { CrashReporterService } from '@/src/infrastructure/services/crash-reporter.service';
import { MockInstrumentationService } from '@/src/infrastructure/services/instrumentation.service.mock';
import { MockCrashReporterService } from '@/src/infrastructure/services/crash-reporter.service.mock';

export function createMonitoringModule() {
    const monitoringModule = createModule();

    if (process.env.NODE_ENV === 'test') {
        // monitoringModule
        //     .bind(DI_SYMBOLS.IInstrumentationService)
        //     .toClass(MockInstrumentationService);
        // monitoringModule
        //     .bind(DI_SYMBOLS.ICrashReporterService)
        //     .toClass(MockCrashReporterService);
        monitoringModule
            .bind(DI_SYMBOLS.IInstrumentationService)
            .toClass(InstrumentationService);
        monitoringModule
            .bind(DI_SYMBOLS.ICrashReporterService)
            .toClass(CrashReporterService);
    } else {
        monitoringModule
            .bind(DI_SYMBOLS.IInstrumentationService)
            .toClass(InstrumentationService);
        monitoringModule
            .bind(DI_SYMBOLS.ICrashReporterService)
            .toClass(CrashReporterService);
    }   

    return monitoringModule;
}