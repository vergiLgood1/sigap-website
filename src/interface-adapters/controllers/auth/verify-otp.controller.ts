import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IVerifyOtpUseCase } from "@/src/application/use-cases/auth/verify-otp.use-case";
import { z } from "zod";
import { InputParseError } from "@/src/entities/errors/common";

// Verify OTP Controller
const verifyOtpInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  token: z.string().min(6, "Please enter a valid OTP")
})

export type IVerifyOtpController = ReturnType<typeof verifyOtpController>

export const verifyOtpController =
  (
    instrumentationService: IInstrumentationService,
    verifyOtpUseCase: IVerifyOtpUseCase
  ) =>
    async (input: Partial<z.infer<typeof verifyOtpInputSchema>>) => {
      return await instrumentationService.startSpan({ name: "verifyOtp Controller" }, async () => {

        // console.log("input", input)

        const { data, error: inputParseError } = verifyOtpInputSchema.safeParse(input)

        if (inputParseError) {
          throw new InputParseError("Invalid data", { cause: inputParseError })
        }

        return await verifyOtpUseCase({
          email: data.email,
          token: data.token
        })
      })
    }