import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IDeleteRoleUseCase } from "@/src/application/use-cases/roles/delete-role.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";

export type IDeleteRoleController = ReturnType<typeof deleteRoleController>;

export const deleteRoleController = (
    instrumentationService: IInstrumentationService,
    deleteRoleUseCase: IDeleteRoleUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (id: string) => {
    return await instrumentationService.startSpan({ name: "deleteRole Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to delete a role");
        }

        return await deleteRoleUseCase(id);
    });
};
