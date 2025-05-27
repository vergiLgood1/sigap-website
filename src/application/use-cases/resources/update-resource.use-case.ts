import { IUpdateResourceSchema } from "@/src/entities/models/resources/update-resources.model";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IResourcesRepository } from "../../repositories/resources.repository.interface";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { NotFoundError } from "@/src/entities/errors/common";

export type IUpdateResourceUseCase = ReturnType<typeof updateResourceUseCase>;

export const updateResourceUseCase = (
    instrumentationService: IInstrumentationService,
    resourcesRepository: IResourcesRepository,
) => async (id: string, data: IUpdateResourceSchema): Promise<IResourcesSchema> => {
    return await instrumentationService.startSpan({ name: "Update Resource Use Case", op: "function" },
        async () => {

            const existingResource = await resourcesRepository.getById(id);

            if (!existingResource) {
                throw new NotFoundError("Resource not found");
            }

            const updatedResource = await resourcesRepository.update(id, data);

            return updatedResource;
        }
    );
};
