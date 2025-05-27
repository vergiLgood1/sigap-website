import { useState } from "react";
import { useSignOutMutation } from "../_queries/mutations";
import { useNavigations } from "@/app/_hooks/use-navigations";
import { toast } from "sonner";
import { AuthenticationError } from "@/src/entities/errors/auth";

export function useSignOutHandler() {
    const { mutateAsync: signOut, isPending, error: errors } = useSignOutMutation();
    const { router } = useNavigations();
    const [error, setError] = useState<string>();

    const handleSignOut = async () => {
        if (isPending) return;

        setError(undefined);

        await signOut(undefined, {
            onSuccess: () => {
                toast.success('You have been signed out successfully');
                router.push('/sign-in');
            },
            onError: (error) => {
                if (error instanceof AuthenticationError) {
                    setError(error.message);
                    toast.error(error.message);
                }
            },
        });
    };

    return {
        handleSignOut,
        error,
        isPending: isPending,
        errors: !!error || errors,
        clearError: () => setError(undefined),
    };
}
