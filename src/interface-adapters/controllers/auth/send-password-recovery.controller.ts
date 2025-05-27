import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { ISendPasswordRecoveryUseCase } from "@/src/application/use-cases/auth/send-password-recovery.use-case"
import { InputParseError } from "@/src/entities/errors/common"
import { z } from "zod"

const sendPasswordRecoveryInputSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

export type ISendPasswordRecoveryController = ReturnType<typeof sendPasswordRecoveryController>

export const sendPasswordRecoveryController =
    (
        instrumentationService: IInstrumentationService,
        sendPasswordRecoveryUseCase: ISendPasswordRecoveryUseCase
    ) =>
        async (input: Partial<z.infer<typeof sendPasswordRecoveryInputSchema>>) => {
            return await instrumentationService.startSpan({ name: "sendPasswordRecovery Controller" },
                async () => {
                    const { data, error: inputParseError } = sendPasswordRecoveryInputSchema.safeParse(input)

                    if (inputParseError) {
                        throw new InputParseError("Invalid data", { cause: inputParseError })
                    }

                    return await sendPasswordRecoveryUseCase({
                        email: data.email
                    })
                })
        }