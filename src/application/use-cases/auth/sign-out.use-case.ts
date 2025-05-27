import { IAuthenticationService } from "../../services/authentication.service.interface"
import { IInstrumentationService } from "../../services/instrumentation.service.interface"

export type ISignOutUseCase = ReturnType<typeof signOutUseCase>

export const signOutUseCase = (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService
) => async (): Promise<void> => {
    return await instrumentationService.startSpan({ name: "signOut Use Case", op: "function" },
        async () => {
            await authenticationService.signOut()
        }
    )
}
