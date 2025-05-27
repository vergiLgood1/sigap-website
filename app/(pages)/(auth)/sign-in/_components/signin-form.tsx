"use client";

import type React from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import Link from "next/link";
import { FormField } from "@/app/_components/form-field";
import { useSignInPasswordlessHandler } from "../../_handlers/use-sign-in-passwordless";


export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const {
    register,
    isPending,
    handleSignIn,
    error,
    errors,
    formErrors,
    getFieldErrorMessage
  } = useSignInPasswordlessHandler();

  return (
    <div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl space-y-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400">Sign in to your account</p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-[#1C1C1C] text-white border-gray-800 hover:bg-[#2C2C2C] hover:border-gray-700"
              size="lg"
              disabled={isPending}
            >
              <Lock className="mr-2 h-5 w-5" />
              Continue with SSO
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-gray-400">or</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4" {...props} noValidate>
            <FormField
              label="Email"
              input={
                <Input
                  {...register("email")}
                  placeholder="you@example.com"
                  className={`bg-[#1C1C1C] border-gray-800`}
                  error={!!formErrors.email}
                  disabled={isPending}
                />
              }
              error={getFieldErrorMessage('email') || error}
            />
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sign in
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center text-lg">
            <span className="text-gray-400">Don't have an account? </span>
            <Link
              href="/contact-us"
              className="text-white hover:text-emerald-500"
            >
              Contact Us
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400">
            By continuing, you agree to Sigap's{" "}
            <a href="#" className="text-gray-400 hover:text-white">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            , and to receive periodic emails with updates.
          </p>
        </div>
      </div>
    </div>
  );
}