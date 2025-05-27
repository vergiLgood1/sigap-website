import { useNavigations } from "@/app/_hooks/use-navigations";
import { IVerifyOtpSchema, verifyOtpSchema } from "@/src/entities/models/auth/verify-otp.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useVerifyOtpMutation } from "../_queries/mutations";

export function useVerifyOtpHandler(email: string) {
    const { mutateAsync: verifyOtp, isPending } = useVerifyOtpMutation();
    const { router } = useNavigations();
    const [error, setError] = useState<string>();

    const {
        register,
        handleSubmit: hookFormSubmit,
        control,
        formState: { errors },
        setValue,
        reset
    } = useForm<IVerifyOtpSchema>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            email,
            token: '',
        },
    });

    const handleOtpChange = (
        value: string,
        onChange: (value: string) => void
    ) => {
        onChange(value);

        if (value.length === 6) {
            handleSubmit();
        }

        // Clear error when user starts typing
        if (error) {
            setError(undefined);
        }
    };

    const handleSubmit = hookFormSubmit(async (data) => {
        if (isPending) return;

        setError(undefined);

        // Create FormData object
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('token', data.token);

        await verifyOtp(formData, {
            onSuccess: () => {
                toast.success('OTP verified successfully');
                // Navigate to dashboard on success
                router.push('/dashboard');
            },
            onError: (error) => {
                setError(error.message);
            },
        });
    });

    return {
        register,
        control,
        handleVerifyOtp: handleSubmit,
        handleOtpChange,
        errors: {
            ...errors,
            token: error ? { message: error } : errors.token,
        },
        isPending: isPending,
        clearError: () => setError(undefined),
        reset,
    };
}

