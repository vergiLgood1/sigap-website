import { z } from "zod";
import { ISignInPasswordlessUseCase } from "@/src/application/use-cases/auth/sign-in-passwordless.use-case";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { InputParseError } from "@/src/entities/errors/common";

// Sign In Controller
const signInInputSchema = z.object({
  email: z.string().min(1, "Email is Required").email("Please enter a valid email address"),
})

export type ISignInPasswordlessController = ReturnType<typeof signInPasswordlessController>

export const signInPasswordlessController =
  (
    instrumentationService: IInstrumentationService,
    signInUseCase: ISignInPasswordlessUseCase
  ) =>
    async (input: Partial<z.infer<typeof signInInputSchema>>) => {
      return await instrumentationService.startSpan({ name: "signIn Controller" }, async () => {
        const { data, error: inputParseError } = signInInputSchema.safeParse(input)

        if (inputParseError) {
          throw new InputParseError(inputParseError.errors[0].message)
        }

        return await signInUseCase({
          email: data.email
        })
      })
    }
