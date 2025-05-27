import { IInstrumentationService } from "../../services/instrumentation.service.interface";
import { IAuthenticationService } from "../../services/authentication.service.interface";

export type ICheckPermissionsUseCase = ReturnType<typeof checkPermissionsUseCase>;

export const checkPermissionsUseCase = (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
) => async (email: string, action: string, resource: string): Promise<boolean> => {
    return await instrumentationService.startSpan({ name: "Check Permission Use Case", op: "function" },
        async () => {

            const permission = await authenticationService.checkPermission(email, action, resource);

            if (!permission) {
                return false;
            }

            return permission;
        }
    );
};
