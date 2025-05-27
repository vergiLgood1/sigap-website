import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetAllPermissionsUseCase } from "@/src/application/use-cases/permissions/get-all-permissions";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";


export type IGetAllPermissionsController = ReturnType<typeof getAllPermissionsController>;

export const getAllPermissionsController = (
    instrumentationService: IInstrumentationService,
    getAllPermissionsUseCase: IGetAllPermissionsUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async () => {
    return await instrumentationService.startSpan({ name: "getAllPermissions Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to fetch permissions");
        }

        return await getAllPermissionsUseCase();
    });
};
