import { useState } from "react";
import { UseFormSetValue } from "react-hook-form";

/**
 * Creates a reusable change handler for form inputs
 * @param setValue - The setValue function from react-hook-form
 * @returns Object with handleChange function and error management
 */
export function useFormHandler<T extends Record<string, any>>(
    setValue: UseFormSetValue<T>
) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // Update the form value
        setValue(name as any, value as any);

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const setError = (name: string, message: string) => {
        setErrors((prev) => ({
            ...prev,
            [name]: message,
        }));
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        handleChange,
        errors,
        setError,
        clearErrors,
    };
}