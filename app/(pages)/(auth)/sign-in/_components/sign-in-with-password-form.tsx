"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import Link from "next/link";
import { FormField } from "@/app/_components/form-field";
import { useSignInPasswordlessHandler } from "../../_handlers/use-sign-in-passwordless";
import { useSignInWithPasswordHandler } from "../../_handlers/use-sign-in-with-password";
import { useNavigations } from "@/app/_hooks/use-navigations";
import { createRoute } from "@/app/_utils/common";
import { ROUTES } from "@/app/_utils/const/routes";

export function SignInWithPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {

    const { router } = useNavigations();
    // State for password visibility toggle
    const [showPassword, setShowPassword] = useState(false);
    const [isSignInWithPassword, setIsSignInWithPassword] = useState(false);

    // Get handlers for both authentication methods
    const passwordHandler = useSignInWithPasswordHandler();
    const passwordlessHandler = useSignInPasswordlessHandler();

    // Get the current active handler based on state
    const activeHandler = isSignInWithPassword ? passwordHandler : passwordlessHandler;


    // Toggle password form field
    const togglePasswordField = () => {
        setIsSignInWithPassword(!isSignInWithPassword);
    };

    const handleForgotPassword = () => {
        router.push(createRoute(ROUTES.AUTH.FORGOT_PASSWORD));
    };

    return (
        <div>
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-xl space-y-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Welcome back
                        </h1>
                        <p className="text-sm text-gray-400">
                            {isSignInWithPassword
                                ? "Sign in with your password"
                                : "Sign in with a one-time password sent to your email"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full bg-[#1C1C1C] text-white border-gray-800 hover:bg-[#2C2C2C] hover:border-gray-700"
                            size="lg"
                            disabled={activeHandler.isPending}
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

                    <form onSubmit={activeHandler.handleSignIn} className="space-y-4" {...props} noValidate>
                        <div className="relative">
                            <FormField
                                label="Email"
                                link={true}
                                linkText={isSignInWithPassword ? "Use passwordless sign-in" : "Use password sign-in"}
                                onClick={togglePasswordField}
                                input={
                                    <Input
                                        {...(isSignInWithPassword
                                            ? passwordHandler.register("email")
                                            : passwordlessHandler.register("email"))}
                                        placeholder="you@example.com"
                                        className={`bg-[#1C1C1C] border-gray-800`}
                                        error={!!activeHandler.formErrors.email}
                                        disabled={activeHandler.isPending}
                                    />
                                }
                                error={activeHandler.getFieldErrorMessage('email') || activeHandler.error}
                            />
                        </div>

                        {isSignInWithPassword && (
                            <FormField
                                label="Password"
                                linkText="Forgot password?"
                                link={true}
                                onClick={handleForgotPassword}
                                input={
                                    <div className="relative">
                                        <Input
                                            {...passwordHandler.register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className={`bg-[#1C1C1C] border-gray-800`}
                                            error={!!passwordHandler.formErrors.password}
                                            disabled={passwordHandler.isPending}
                                        />
                                    </div>
                                }
                                error={passwordHandler.getFieldErrorMessage('password') || passwordHandler.error}
                            />
                        )}
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            size="lg"
                            disabled={activeHandler.isPending}
                        >
                            {activeHandler.isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    {isSignInWithPassword ? "Signing in..." : "Sending login link..."}
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