import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IDeletePermissionUseCase } from "@/src/application/use-cases/permissions/delete-permissions.use-case";

import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";

export type IDeletePermissionController = ReturnType<typeof deletePermissionController>;

export const deletePermissionController = (
    instrumentationService: IInstrumentationService,
    deletePermissionUseCase: IDeletePermissionUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (id: string) => {
    return await instrumentationService.startSpan({ name: "Delete Permission Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to delete a permission");
        }

        return await deletePermissionUseCase({ id });
    });
};
