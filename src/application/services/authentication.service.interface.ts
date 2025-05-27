import { AuthResult } from "@/src/entities/models/auth/auth-result.model"
import { ISendMagicLinkSchema } from "@/src/entities/models/auth/send-magic-link.model"
import { ISendPasswordRecoverySchema } from "@/src/entities/models/auth/send-password-recovery.model"
import { Session } from "@/src/entities/models/auth/session.model"
import { TSignInSchema, ISignInWithPasswordSchema, ISignInPasswordlessSchema } from "@/src/entities/models/auth/sign-in.model"
import { SignUpWithEmailSchema, SignUpWithPhoneSchema, TSignUpSchema, ISignUpWithEmailSchema, ISignUpWithPhoneSchema } from "@/src/entities/models/auth/sign-up.model"
import { IVerifyOtpSchema } from "@/src/entities/models/auth/verify-otp.model"
import { IUserSchema } from "@/src/entities/models/users/users.model"

export interface IAuthenticationService {
    signInPasswordless(credentials: ISignInPasswordlessSchema): Promise<void>
    signInWithPassword(credentials: ISignInWithPasswordSchema): Promise<void>
    SignUpWithEmail(credentials: ISignUpWithEmailSchema): Promise<IUserSchema>
    SignUpWithPhone(credentials: ISignUpWithPhoneSchema): Promise<IUserSchema>
    getSession(): Promise<Session | null>
    signOut(): Promise<void>
    sendMagicLink(credentials: ISendMagicLinkSchema): Promise<void>
    sendPasswordRecovery(credentials: ISendPasswordRecoverySchema): Promise<void>
    verifyOtp(credentials: IVerifyOtpSchema): Promise<void>
    checkPermission(email: string, action: string, resource: string): Promise<boolean>;
}