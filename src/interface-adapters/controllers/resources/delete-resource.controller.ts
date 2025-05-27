import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IDeleteResourceUseCase } from "@/src/application/use-cases/resources/delete-resource.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";

export type IDeleteResourceController = ReturnType<typeof deleteResourceController>;

export const deleteResourceController = (
    instrumentationService: IInstrumentationService,
    deleteResourceUseCase: IDeleteResourceUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (id: string) => {
    return await instrumentationService.startSpan({ name: "deleteResource Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to delete a resource");
        }

        return await deleteResourceUseCase(id);
    });
};
