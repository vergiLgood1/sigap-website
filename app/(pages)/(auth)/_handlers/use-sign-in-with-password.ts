import { useNavigations } from "@/app/_hooks/use-navigations";
import { useSignInWithPasswordMutation } from "../_queries/mutations";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ISignInWithPasswordSchema, SignInWithPasswordSchema } from "@/src/entities/models/auth/sign-in.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createRoute } from "@/app/_utils/common";
import { ROUTES } from "@/app/_utils/const/routes";

export const useSignInWithPasswordHandler = () => {
    const { mutateAsync: signInWithPassword, isPending, error: queryError } = useSignInWithPasswordMutation();

    const { router } = useNavigations();

    const [error, setError] = useState<string>();

    const {
        register,
        handleSubmit: handleFormSubmit,
        reset,
        formState: { errors: formErrors },
        setError: setFormError,
    } = useForm<ISignInWithPasswordSchema>({
        defaultValues: {
            email: "",
            password: ""
        },
        resolver: zodResolver(SignInWithPasswordSchema),
        mode: "onSubmit" // Validate on form submission
    });

    const onSubmit = handleFormSubmit(async (data) => {
        if (isPending) return;

        setError(undefined);

        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);

        try {
            await toast.promise(
                signInWithPassword(formData),
                {
                    loading: 'Signing in...',
                    success: () => {
                        // If we reach here, the operation was successful
                        router.push(createRoute(ROUTES.APP.DASHBOARD));
                        return "Successfully signed in!";
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
    const getFieldErrorMessage = (fieldName: keyof ISignInWithPasswordSchema) => {
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
        isPending,
        error: getFieldErrorMessage('email') || error, // Prioritize form validation errors
        queryError,
        errors: !!error || !!queryError || Object.keys(formErrors).length > 0,
        formErrors,
        getFieldErrorMessage
    };
}