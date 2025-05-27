import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IResourcesRepository } from "../../repositories/resources.repository.interface";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IGetResourceByIdUseCase = ReturnType<typeof getResourceByIdUseCase>;

export const getResourceByIdUseCase = (
    instrumentationService: IInstrumentationService,
    resourcesRepository: IResourcesRepository,
) => async (id: string): Promise<IResourcesSchema> => {
    return await instrumentationService.startSpan({ name: "Get Resource By ID Use Case", op: "function" },
        async () => {

            const resource = await resourcesRepository.getById(id);

            if (!resource) {
                throw new NotFoundError("Resource not found");
            }

            return resource;
        }
    );
};
