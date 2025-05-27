import { ICreateResourceSchema } from "@/src/entities/models/resources/create-resources.model";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IResourcesRepository } from "../../repositories/resources.repository.interface";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { AlreadyExistsError } from "@/src/entities/errors/common";

export type ICreateResourceUseCase = ReturnType<typeof createResourceUseCase>;

export const createResourceUseCase = (
    instrumentationService: IInstrumentationService,
    resourcesRepository: IResourcesRepository,
) => async (input: ICreateResourceSchema): Promise<IResourcesSchema> => {
    return await instrumentationService.startSpan({ name: "Create Resource Use Case", op: "function" },
        async () => {

            const existingResource = await resourcesRepository.getByName(input.name);

            if (existingResource) {
                throw new AlreadyExistsError("Resource already exists");
            }

            const resource = await resourcesRepository.create(input);

            return resource;
        }
    );
};
