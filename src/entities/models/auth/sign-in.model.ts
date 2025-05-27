import { z } from "zod";

// Define the sign-in form schema using Zod
export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }).min(8, { message: "Password must be at least 8 characters" }),
  phone: z.string().optional(),
});

// Export the type derived from the schema
export type TSignInSchema = z.infer<typeof SignInSchema>;

export const SignInWithPasswordSchema = SignInSchema.pick({
  email: true,
  password: true,
})


export type ISignInWithPasswordSchema = z.infer<typeof SignInWithPasswordSchema>

// Default values for the form
export const defaulISignInWithPasswordSchemaValues: ISignInWithPasswordSchema = {
  email: "",
  password: "",
};

export const SignInPasswordlessSchema = SignInSchema.pick({
  email: true,
})

export type ISignInPasswordlessSchema = z.infer<typeof SignInPasswordlessSchema>

// Default values for the form
export const defaulISignInPasswordlessSchemaValues: ISignInPasswordlessSchema = {
  email: "",
}



// Define the sign-in response schema using Zod
export const SignInResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  redirectTo: z.string().optional(),
});


