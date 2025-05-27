import { useNavigations } from "@/app/_hooks/use-navigations";
import { useSignInPasswordlessMutation } from "../_queries/mutations";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ISignInPasswordlessSchema, SignInPasswordlessSchema } from "@/src/entities/models/auth/sign-in.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoute } from "@/app/_utils/common";
import { ROUTES } from "@/app/_utils/const/routes";

export function useSignInPasswordlessHandler() {
    const { mutateAsync: signIn, isPending, error: queryError } = useSignInPasswordlessMutation();
    const { router } = useNavigations();

    // For server/API errors
    const [error, setError] = useState<string>();

    const {
        register,
        handleSubmit: handleFormSubmit,
        reset,
        formState: { errors: formErrors },
        setError: setFormError,
    } = useForm<ISignInPasswordlessSchema>({
        defaultValues: {
            email: "",
        },
        resolver: zodResolver(SignInPasswordlessSchema),
        mode: "onSubmit" // Validate on form submission
    });

    const onSubmit = handleFormSubmit(async (data) => {
        if (isPending) return;

        setError(undefined);

        const formData = new FormData();
        formData.append('email', data.email);

        try {
            await toast.promise(
                signIn(formData),
                {
                    loading: 'Sending magic link...',
                    success: () => {
                        // If we reach here, the operation was successful
                        router.push(createRoute(ROUTES.AUTH.VERIFY_OTP, { email: data.email }));
                        return 'An email has been sent to you. Please check your inbox.';
                    },
                    error: (err) => {
                        const errorMessage = err?.message || 'Failed to send email.';
                        setError(errorMessage);
                        return errorMessage;
                    }
                }
            );
        } catch (err: any) {
            // Error is already handled in the toast.promise error callback
            setError(err?.message || 'An error occurred while sending the email.');
        }
    });

    // Extract the validation error message for the email field
    const getFieldErrorMessage = (fieldName: keyof ISignInPasswordlessSchema) => {
        return formErrors[fieldName]?.message || '';
    };

    // Wrapper to handle the form submission properly
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(e);
    };

    return {
        reset,
        register,
        handleSignIn: handleSubmit,
        error: getFieldErrorMessage('email') || error, // Prioritize form validation errors
        isPending,
        errors: !!error || !!queryError || Object.keys(formErrors).length > 0,
        formErrors,
        getFieldErrorMessage
    };
}