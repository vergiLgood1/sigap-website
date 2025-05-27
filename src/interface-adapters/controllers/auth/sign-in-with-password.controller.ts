import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ISignInWithPasswordUseCase } from "@/src/application/use-cases/auth/sign-in-with-password.use-case";
import { InputParseError } from "@/src/entities/errors/common";

import { z } from "zod";

// Sign In Controller
const signInWithPasswordInputSchema = z.object({
    email: z.string().min(1, "Email is Required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is Required")
})

export type ISignInWithPasswordController = ReturnType<typeof signInWithPasswordController>

export const signInWithPasswordController = (
    instrumentationService: IInstrumentationService,
    signInWithPasswordUseCase: ISignInWithPasswordUseCase
) =>
    async (input: Partial<z.infer<typeof signInWithPasswordInputSchema>>) => {
        return await instrumentationService.startSpan({ name: "signInWithPassword Controller" },
            async () => {
                const { data, error: inputParseError } = signInWithPasswordInputSchema.safeParse(input)

                if (inputParseError) {
                    throw new InputParseError(inputParseError.errors[0].message)
                }

                return await signInWithPasswordUseCase({
                    email: data.email,
                    password: data.password
                })
            }
        )
    }