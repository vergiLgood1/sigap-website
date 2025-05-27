import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IResourcesRepository } from "../../repositories/resources.repository.interface";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IDeleteResourceUseCase = ReturnType<typeof deleteResourceUseCase>;

export const deleteResourceUseCase = (
    instrumentationService: IInstrumentationService,
    resourcesRepository: IResourcesRepository,
) => async (id: string): Promise<IResourcesSchema> => {
    return await instrumentationService.startSpan({ name: "Delete Resource Use Case", op: "function" },
        async () => {

            const existingResource = await resourcesRepository.getById(id);

            if (!existingResource) {
                throw new NotFoundError("Resource not found");
            }

            const deletedResource = await resourcesRepository.delete(id);

            return deletedResource;
        }
    );
};
