import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { createResourceUseCase } from '@/src/application/use-cases/resources/create-resources.use-case';
import { getResourceByIdUseCase } from '@/src/application/use-cases/resources/get-resource-by-id.use-case';
import { getResourcesByTypeUseCase } from '@/src/application/use-cases/resources/get-resources-by-type.use-case';
import { updateResourceUseCase } from '@/src/application/use-cases/resources/update-resource.use-case';
import { deleteResourceUseCase } from '@/src/application/use-cases/resources/delete-resource.use-case';
import { createResourceController } from '@/src/interface-adapters/controllers/resources/create-resource.controller';
import { getResourceByIdController } from '@/src/interface-adapters/controllers/resources/get-resource-by-id.controller';
import { getResourcesByTypeController } from '@/src/interface-adapters/controllers/resources/get-resources-by-type.controller';
import { updateResourceController } from '@/src/interface-adapters/controllers/resources/update-resource.controller';
import { deleteResourceController } from '@/src/interface-adapters/controllers/resources/delete-resource.controller';
import { ResourcesRepository } from '@/src/infrastructure/repositories/resources.repository';

export function createResourcesModule() {
    const resourcesModule = createModule();

    if (process.env.NODE_ENV === 'test') {
        // resourcesModule
        //     .bind(DI_SYMBOLS.IResourcesRepository)
        //     .toClass(MockResourcesRepository, [DI_SYMBOLS.IInstrumentationService]);
    } else {
        resourcesModule
            .bind(DI_SYMBOLS.IResourcesRepository)
            .toClass(ResourcesRepository, [
                DI_SYMBOLS.IInstrumentationService,
            ]);
    }

    // Use Cases
    resourcesModule
        .bind(DI_SYMBOLS.ICreateResourceUseCase)
        .toHigherOrderFunction(createResourceUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IResourcesRepository,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IGetResourceByIdUseCase)
        .toHigherOrderFunction(getResourceByIdUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IResourcesRepository,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IGetResourcesByTypeUseCase)
        .toHigherOrderFunction(getResourcesByTypeUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IResourcesRepository,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IUpdateResourceUseCase)
        .toHigherOrderFunction(updateResourceUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IResourcesRepository,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IDeleteResourceUseCase)
        .toHigherOrderFunction(deleteResourceUseCase, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IResourcesRepository,
        ]);

    // Controllers
    resourcesModule
        .bind(DI_SYMBOLS.ICreateResourceController)
        .toHigherOrderFunction(createResourceController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.ICreateResourceUseCase,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IGetResourceByIdController)
        .toHigherOrderFunction(getResourceByIdController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetResourceByIdUseCase,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IGetResourcesByTypeController)
        .toHigherOrderFunction(getResourcesByTypeController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IGetResourcesByTypeUseCase,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IUpdateResourceController)
        .toHigherOrderFunction(updateResourceController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IUpdateResourceUseCase,
        ]);

    resourcesModule
        .bind(DI_SYMBOLS.IDeleteResourceController)
        .toHigherOrderFunction(deleteResourceController, [
            DI_SYMBOLS.IInstrumentationService,
            DI_SYMBOLS.IDeleteResourceUseCase,
        ]);

    return resourcesModule;
}
