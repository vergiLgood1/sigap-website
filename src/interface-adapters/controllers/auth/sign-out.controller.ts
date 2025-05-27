import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { ISignOutUseCase } from "@/src/application/use-cases/auth/sign-out.use-case"

// Sign Out Controller
export type ISignOutController = ReturnType<typeof signOutController>

export const signOutController =
    (
        instrumentationService: IInstrumentationService,
        signOutUseCase: ISignOutUseCase
    ) =>
        async () => {
            return await instrumentationService.startSpan({
                name: "signOut Controller"
            }, async () => {
                return await signOutUseCase()
            })
        }
