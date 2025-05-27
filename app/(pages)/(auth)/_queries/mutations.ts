import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { checkPermissions, sendMagicLink, sendPasswordRecovery, signInPasswordless, signInWithPassword, signOut, verifyOtp } from "../action"

export const useSignInPasswordlessMutation = () => {
    return useMutation({
        mutationKey: ["signin"],
        mutationFn: async (formData: FormData) => await signInPasswordless(formData),
    })
}

export const useSignInWithPasswordMutation = () => {
    return useMutation({
        mutationKey: ["signin", "credentials"],
        mutationFn: async (formData: FormData) => await signInWithPassword(formData),
    })
}

export const useSignOutMutation = () => {
    return useMutation({
        mutationKey: ["signout"],
        mutationFn: async () => await signOut(),
    })
}

export const useSendMagicLinkMutation = () => {
    return useMutation({
        mutationKey: ["send-magic-link"],
        mutationFn: async (email: string) => await sendMagicLink(email),
    })
}

export const useSendPasswordRecoveryMutation = () => {
    return useMutation({
        mutationKey: ["send-password-recovery"],
        mutationFn: async (email: string) => await sendPasswordRecovery(email),
    })
}

export const useVerifyOtpMutation = () => {
    return useMutation({
        mutationKey: ["verify-otp"],
        mutationFn: async (formData: FormData) => await verifyOtp(formData),
    })
}
