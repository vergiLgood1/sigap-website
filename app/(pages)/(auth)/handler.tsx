// import { AuthenticationError } from "@/src/entities/errors/auth";
// import { useState } from "react";
// import { useAuthActions } from './queries';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';;
// import { toast } from 'sonner';
// import { useNavigations } from '@/app/_hooks/use-navigations';
// import {
//     IVerifyOtpSchema,
//     verifyOtpSchema,
// } from '@/src/entities/models/auth/verify-otp.model';

// /**
//  * Hook untuk menangani proses sign in
//  *
//  * @returns {Object} Object berisi handler dan state untuk form sign in
//  * @example
//  * const { handleSubmit, isPending, error } = useSignInPasswordlessHandler();
//  * <form onSubmit={handleSubmit}>...</form>
//  */
// export function useSignInPasswordlessHandler() {
//     const { signIn } = useAuthActions();
//     const { router } = useNavigations();

//     const [error, setError] = useState<string>();

//     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         if (signIn.isPending) return;

//         setError(undefined);

//         const formData = new FormData(event.currentTarget);
//         const email = formData.get('email')?.toString();

//         const res = await signIn.mutateAsync(formData);

//         if (!res?.error) {
//             toast('An email has been sent to you. Please check your inbox.');
//             if (email) router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
//         } else {
//             setError(res.error);
//         }


//     };

//     return {
//         // formData,
//         // handleChange,
//         handleSignIn: handleSubmit,
//         error,
//         isPending: signIn.isPending,
//         errors: !!error || signIn.error,
//         clearError: () => setError(undefined),
//     };
// }

// export function useVerifyOtpHandler(email: string) {
//     const { router } = useNavigations();
//     const { verifyOtp } = useAuthActions();
//     const [error, setError] = useState<string>();

//     const {
//         register,
//         handleSubmit: hookFormSubmit,
//         control,
//         formState: { errors },
//         setValue,
//     } = useForm<IVerifyOtpSchema>({
//         resolver: zodResolver(verifyOtpSchema),
//         defaultValues: {
//             email,
//             token: '',
//         },
//     });

//     const handleOtpChange = (
//         value: string,
//         onChange: (value: string) => void
//     ) => {
//         onChange(value);

//         if (value.length === 6) {
//             handleSubmit();
//         }

//         // Clear error when user starts typing
//         if (error) {
//             setError(undefined);
//         }
//     };

//     const handleSubmit = hookFormSubmit(async (data) => {
//         if (verifyOtp.isPending) return;

//         setError(undefined);

//         // Create FormData object
//         const formData = new FormData();
//         formData.append('email', data.email);
//         formData.append('token', data.token);

//         await verifyOtp.mutateAsync(formData, {
//             onSuccess: () => {
//                 toast.success('OTP verified successfully');
//                 // Navigate to dashboard on success
//                 router.push('/dashboard');
//             },
//             onError: (error) => {
//                 setError(error.message);
//             },
//         });
//     });

//     return {
//         register,
//         control,
//         handleVerifyOtp: handleSubmit,
//         handleOtpChange,
//         errors: {
//             ...errors,
//             token: error ? { message: error } : errors.token,
//         },
//         isPending: verifyOtp.isPending,
//         clearError: () => setError(undefined),
//     };
// }

// export function useSignOutHandler() {
//     const { signOut } = useAuthActions();
//     const { router } = useNavigations();
//     const [error, setError] = useState<string>();

//     const handleSignOut = async () => {
//         if (signOut.isPending) return;

//         setError(undefined);

//         await signOut.mutateAsync(undefined, {
//             onSuccess: () => {
//                 toast.success('You have been signed out successfully');
//                 router.push('/sign-in');
//             },
//             onError: (error) => {
//                 if (error instanceof AuthenticationError) {
//                     setError(error.message);
//                     toast.error(error.message);
//                 }
//             },
//         });
//     };

//     return {
//         handleSignOut,
//         error,
//         isPending: signOut.isPending,
//         errors: !!error || signOut.error,
//         clearError: () => setError(undefined),
//     };
// }
