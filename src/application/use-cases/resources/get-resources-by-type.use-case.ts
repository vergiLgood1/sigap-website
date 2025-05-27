import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IResourcesRepository } from "../../repositories/resources.repository.interface";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";

export type IGetResourcesByTypeUseCase = ReturnType<typeof getResourcesByTypeUseCase>;

export const getResourcesByTypeUseCase = (
    instrumentationService: IInstrumentationService,
    resourcesRepository: IResourcesRepository,
) => async (type: string): Promise<IResourcesSchema[]> => {
    return await instrumentationService.startSpan({ name: "Get Resources By Type Use Case", op: "function" },
        async () => {

            const resources = await resourcesRepository.getByType(type);

            return resources || [];
        }
    );
};
