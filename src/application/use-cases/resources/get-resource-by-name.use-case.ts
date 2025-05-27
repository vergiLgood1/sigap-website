import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IResourcesRepository } from "../../repositories/resources.repository.interface";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IGetResourceByNameUseCase = ReturnType<typeof getResourceByNameUseCase>;

export const getResourceByNameUseCase = (
    instrumentationService: IInstrumentationService,
    resourcesRepository: IResourcesRepository,
) => async (name: string): Promise<IResourcesSchema> => {
    return await instrumentationService.startSpan({ name: "Get Resource By Name Use Case", op: "function" },
        async () => {

            const resource = await resourcesRepository.getByName(name);

            if (!resource) {
                throw new NotFoundError("Resource not found");
            }

            return resource;
        }
    );
};
