import { z } from "zod";

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  token: z.string().length(6, { message: "OTP must be 6 characters long" }),
});

export type IVerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const defaultVerifyOtpValues: IVerifyOtpSchema = {
  email: "",
  token: "",
};

