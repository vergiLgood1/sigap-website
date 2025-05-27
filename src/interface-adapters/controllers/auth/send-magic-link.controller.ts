import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface"
import { ISendMagicLinkUseCase } from "@/src/application/use-cases/auth/send-magic-link.use-case"

import { z } from "zod"

import { InputParseError } from "@/src/entities/errors/common"

const sendMagicLinkInputSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

export type ISendMagicLinkController = ReturnType<typeof sendMagicLinkController>

export const sendMagicLinkController =
    (
        instrumentationService: IInstrumentationService,
        sendMagicLinkUseCase: ISendMagicLinkUseCase
    ) =>
        async (input: Partial<z.infer<typeof sendMagicLinkInputSchema>>) => {
            return await instrumentationService.startSpan({ name: "sendMagicLink Controller" },
                async () => {
                    const { data, error: inputParseError } = sendMagicLinkInputSchema.safeParse(input)

                    if (inputParseError) {
                        throw new InputParseError("Invalid data", { cause: inputParseError })
                    }

                    return await sendMagicLinkUseCase({
                        email: data.email
                    })
                })
        }