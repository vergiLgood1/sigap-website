"use client";

import { useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/_components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/app/_components/ui/button";
import { useVerifyOtpHandler } from "../../_handlers/use-verify-otp";

interface VerifyOtpFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function VerifyOtpForm({ className, ...props }: VerifyOtpFormProps) {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const {
    register,
    control,
    handleVerifyOtp,
    handleOtpChange,
    errors,
    isPending
  } = useVerifyOtpHandler(email)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#171717] border-gray-800 text-white border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">One-Time Password</CardTitle>
          <CardDescription className="text-gray-400">
            One time password is a security feature that helps protect your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input type="hidden" {...register("email")} />
            <div className="space-y-6">
              <Controller
                name="token"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    value={field.value || ""}
                    onChange={(value) => handleOtpChange(value, field.onChange)}
                  >
                    <InputOTPGroup className="flex w-full items-center justify-center space-x-2">
                      {[...Array(6)].map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className={`w-12 h-12 text-xl border-2 border-gray-700 bg-[#1C1C1C] rounded-md ${errors.token ? "ring-red-400 ring-2 ring-offset-0" : ""}`}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {errors.token ? (
                <div className="flex w-full justify-center text-red-400 text-center text-sm">
                  {errors.token.message}
                </div>
              ) : (
                <div className="flex w-full justify-center text-background text-center text-sm">
                  Successfully verified!
                </div>
              )}

              <div className="flex w-full justify-center items-center text-gray-400 text-sm">
                Please enter the one-time password sent to {email}.
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-gray-400 [&_a]:text-emerald-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-emerald-400">
        By clicking continue, you agree to Sigap's{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

