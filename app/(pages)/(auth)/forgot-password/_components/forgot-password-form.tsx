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
import { useSendPasswordRecoveryHandler } from "../../_handlers/use-send-password-recovery";
import { FormField } from "@/app/_components/form-field";
import { Input } from "@/app/_components/ui/input";
import { Separator } from "@/app/_components/ui/separator";

interface ForgotPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ForgotPasswordForm({ className, ...props }: ForgotPasswordFormProps) {

    const {
        register,
        handleSubmit,
        error,
        errors,
        formErrors,
        isPending
    } = useSendPasswordRecoveryHandler()

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="bg-[#171717] border-gray-800 text-white border-none max-w-md space-y-4">
                <CardHeader className="text-start">
                    <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
                    <CardDescription className="text-gray-400">
                        Type in your email and we'll send you a link to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            label="Email"
                            input={
                                <Input
                                    {...register("email")}
                                    placeholder="you@example.com"
                                    className={`bg-[#1C1C1C] border-gray-800`}
                                    error={!!errors}
                                    disabled={isPending}
                                />
                            }
                            error={formErrors.email?.message}
                        />
                        <Separator className="" />
                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Sending email...
                                    </>
                                ) : (
                                    "Send Reset Email"
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

