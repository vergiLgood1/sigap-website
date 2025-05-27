"use server";

import { redirect } from "next/navigation"
import { getInjection } from "@/di/container"
import { revalidatePath } from "next/cache"

import { InputParseError, NotFoundError } from "@/src/entities/errors/common"
import { AuthenticationError, UnauthenticatedError } from "@/src/entities/errors/auth"
import { createClient } from "@/app/_utils/supabase/server"
import db from "@/prisma/db";

export async function signInPasswordless(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'signIn',
    {
      recordResponse: true,
    },
    async () => {
      try {
        const email = formData.get('email')?.toString();

        const signInPasswordlessController = getInjection(
          'ISignInPasswordlessController'
        );
        return await signInPasswordlessController({ email });

        // if (email) {
        //     redirect(`/verify-otp?email=${encodeURIComponent(email)}`)
        // }
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
        }

        if (err instanceof AuthenticationError) {
          return { error: 'Invalid credential. Please try again.' };
        }

        if (
          err instanceof UnauthenticatedError ||
          err instanceof NotFoundError
        ) {
          return {
            error: err.message,
          };
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);

        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }
    }
  );
}

export async function signInWithPassword(formData: FormData) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'signInWithPassword',
    {
      recordResponse: true,
    },
    async () => {
      try {
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        // console.log("woi:", email + " " + password)

        const signInWithPasswordController = getInjection(
          'ISignInWithPasswordController'
        );

        await signInWithPasswordController({ email, password });

        return { success: true };
      } catch (err) {
        if (err instanceof InputParseError) {
          return { error: err.message };
        }

        if (err instanceof AuthenticationError) {
          return { error: 'Invalid credential. Please try again.' };
        }

        if (
          err instanceof UnauthenticatedError ||
          err instanceof NotFoundError
        ) {
          return {
            error: err.message,
          };
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);

        return {
          error:
            'An error happened. The developers have been notified. Please try again later.',
        };
      }
    }
  );
}
// export async function signUp(formData: FormData) {
//     const instrumentationService = getInjection("IInstrumentationService")
//     return await instrumentationService.instrumentServerAction("signUp", { recordResponse: true }, async () => {
//         try {
//             const data = Object.fromEntries(formData.entries())
//             const signUpController = getInjection("ISignUpController")
//             await signUpController(data)
//         } catch (err) {
//             if (err instanceof InputParseError) {
//                 return { error: err.message, success: false }
//             }

//             const crashReporterService = getInjection("ICrashReporterService")
//             crashReporterService.report(err)

//             return {
//                 error: "An error occurred during sign up. Please try again later.",
//                 success: false,
//             }
//         }
//     })
// }

export async function signOut() {
    const instrumentationService = getInjection("IInstrumentationService")
    return await instrumentationService.instrumentServerAction("signOut", {
        recordResponse: true
    }, async () => {
        try {
            const signOutController = getInjection("ISignOutController")
            await signOutController()

            // revalidatePath("/")
            // redirect("/sign-in") // Updated to match your route

            return { success: true }
        } catch (err) {
            // if (err instanceof AuthenticationError) {
            //     return {
            //         error: "An error occurred during sign out. Please try again later.",
            //     }
            // }

            const crashReporterService = getInjection("ICrashReporterService")
            crashReporterService.report(err)

            return {
                error: "An error occurred during sign out. Please try again later.",
            }
        }
    })
}

export async function verifyOtp(formData: FormData) {
    const instrumentationService = getInjection("IInstrumentationService")
    return await instrumentationService.instrumentServerAction("verifyOtp", {
        recordResponse: true
    }, async () => {
        try {
            const email = formData.get("email")?.toString()
            const token = formData.get("token")?.toString()

            const verifyOtpController = getInjection("IVerifyOtpController")
            await verifyOtpController({ email, token })

            // redirect("/dashboard") 

            return { success: true }
        } catch (err) {
            if (err instanceof InputParseError || err instanceof AuthenticationError) {
                return { error: err.message }
            }

            const crashReporterService = getInjection("ICrashReporterService")
            crashReporterService.report(err)

            return {
                error: "An error occurred during OTP verification. Please try again later.",
            }
        }
    })
}

export async function sendMagicLink(email: string) {
    const instrumentationService = getInjection("IInstrumentationService")
    return await instrumentationService.instrumentServerAction("sendMagicLink", {
        recordResponse: true
    }, async () => {
        try {

            const sendMagicLinkController = getInjection("ISendMagicLinkController")
            await sendMagicLinkController({ email })

            return { success: true }
        } catch (err) {
            if (err instanceof InputParseError) {
                return { error: err.message }
            }

            const crashReporterService = getInjection("ICrashReporterService")
            crashReporterService.report(err)

            return {
                error: "An error occurred during sending magic link. Please try again later.",
            }
        }
    })
}

export async function sendPasswordRecovery(email: string) {
    const instrumentationService = getInjection("IInstrumentationService")
    return await instrumentationService.instrumentServerAction("sendPasswordRecovery", {
        recordResponse: true
    }, async () => {
        try {

            const sendPasswordRecoveryController = getInjection("ISendPasswordRecoveryController")
            await sendPasswordRecoveryController({ email })

            return { success: true }
        } catch (err) {
            if (err instanceof InputParseError) {
                return { error: err.message }
            }

            const crashReporterService = getInjection("ICrashReporterService")
            crashReporterService.report(err)

            return {
                error: "An error occurred during sending password recovery. Please try again later.",
            }
        }
    })
}

export async function checkPermissions(email: string, action: string, resource: string) {
    const instrumentationService = getInjection("IInstrumentationService")
    return await instrumentationService.instrumentServerAction("checkPermissionNew", {
        recordResponse: true
    }, async () => {
        try {

            // const user = await db.users.findUnique({
            //     where: { email },
            //     include: { role: true }
            // })

            // if (!user) {
            //     return { error: "User not found" }
            // }

            // console.log("Checking permissions for user:", user?.role.name, "action:", action, "resource:", resource)

            // const permission = await db.permissions.findFirst({
            //     where: {
            //         role_id: user.role.id,
            //         action: action,
            //         resource: {
            //             name: resource
            //         }
            //     }
            // })

            // if (!permission) {
            //     return false
            // }

            // return !!permission

            const checkPermissionsController = getInjection("ICheckPermissionsController")
            return await checkPermissionsController({ email, action, resource })

        } catch (err) {
            if (err instanceof InputParseError) {
                return { error: err.message }
            }

            const crashReporterService = getInjection("ICrashReporterService")
            crashReporterService.report(err)

            return {
                error: err instanceof Error ? err.message : "An unknown error occurred",
            }
        }
    })
}