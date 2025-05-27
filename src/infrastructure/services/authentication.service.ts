import { createAdminClient } from "@/app/_utils/supabase/admin";
import { createClient } from "@/app/_utils/supabase/server";
import db from "@/prisma/db";
import { IPermissionsRepository } from "@/src/application/repositories/permissions.repository.interface";
import { IUsersRepository } from "@/src/application/repositories/users.repository.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { ICrashReporterService } from "@/src/application/services/crash-reporter.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { AuthenticationError } from "@/src/entities/errors/auth";
import { ISendMagicLinkSchema } from "@/src/entities/models/auth/send-magic-link.model";
import { ISendPasswordRecoverySchema } from "@/src/entities/models/auth/send-password-recovery.model";
import { Session } from "@/src/entities/models/auth/session.model";
import { SignInWithPasswordSchema, ISignInPasswordlessSchema, ISignInWithPasswordSchema } from "@/src/entities/models/auth/sign-in.model";
import { SignUpWithEmailSchema, SignUpWithPhoneSchema, ISignUpWithEmailSchema, ISignUpWithPhoneSchema } from "@/src/entities/models/auth/sign-up.model";
import { IVerifyOtpSchema } from "@/src/entities/models/auth/verify-otp.model";
import { IUserSchema } from "@/src/entities/models/users/users.model";

export class AuthenticationService implements IAuthenticationService {
    constructor(
        private readonly instrumentationService: IInstrumentationService,
        private readonly crashReporterService: ICrashReporterService,
        private readonly permissionsRepository: IPermissionsRepository,
        private readonly supabaseAdmin = createAdminClient(),
        private readonly supabaseServer = createClient()
    ) { }

    async signInPasswordless(credentials: ISignInPasswordlessSchema): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "signInPasswordless Use Case",
        }, async () => {
            try {

                const supabase = await this.supabaseServer

                const { email } = credentials
                const signIn = supabase.auth.signInWithOtp({ email })

                const { error } = await this.instrumentationService.startSpan({
                    name: "supabase.auth.signInWithOtp",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await signIn
                })

                return
            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }

        })
    }

    async signInWithPassword(credentials: ISignInWithPasswordSchema): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "SignInWithPasswordSchema Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const { email, password } = credentials


                const signIn = supabase.auth.signInWithPassword({ email, password })

                const { data: { session }, error } = await this.instrumentationService.startSpan({
                    name: "supabase.auth.signIn",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await signIn
                })

                return

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }

        })
    }

    async SignUpWithEmail(credentials: ISignUpWithEmailSchema): Promise<IUserSchema> {
        return await this.instrumentationService.startSpan({
            name: "SignUpWithEmailSchema Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const { email, password } = credentials
                const signUp = supabase.auth.signUp({ email, password })

                const { data: { user, session }, error } = await this.instrumentationService.startSpan({
                    name: "supabase.auth.signUp",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await signUp
                })

                const newUser = db.users.findUnique({
                    where: {
                        id: user!.id
                    },
                    include: {
                        profile: true
                    }
                })

                const userDetail = await this.instrumentationService.startSpan({
                    name: "db.users.findUnique",
                    op: "db:query",
                    attributes: { "system": "prisma" }
                }, async () => {
                    return await newUser
                })

                return userDetail!;

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }

        })
    }

    async SignUpWithPhone(credentials: ISignUpWithPhoneSchema): Promise<IUserSchema> {
        throw new Error("Method not implemented.");
    }

    async getSession(): Promise<Session | null> {
        return await this.instrumentationService.startSpan({
            name: "getSession Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const session = supabase.auth.getSession()

                const { data, error } = await this.instrumentationService.startSpan({
                    name: "supabase.auth.session",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await session
                })

                if (!data.session) {
                    throw new AuthenticationError("Session not found")
                }

                return {
                    user: {
                        id: data.session.user.id,
                        role: data.session.user.role,
                        email: data.session.user.email
                    },
                    expiresAt: data.session.expires_at,
                };

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }

        })
    }

    async signOut(): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "signOut Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const signOut = supabase.auth.signOut()

                await this.instrumentationService.startSpan({
                    name: "supabase.auth.signOut",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await signOut
                })

                return;

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }
        })
    }

    async sendMagicLink(credentials: ISendMagicLinkSchema): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "sendMagicLink Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const magicLink = supabase.auth.signInWithOtp({ email: credentials.email })

                await this.instrumentationService.startSpan({
                    name: "supabase.auth.signIn",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await magicLink
                })

                return;

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }
        })
    }

    async sendPasswordRecovery(credentials: ISendPasswordRecoverySchema): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "sendPasswordRecovery Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const passwordRecovery = supabase.auth.resetPasswordForEmail(credentials.email, {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
                })

                await this.instrumentationService.startSpan({
                    name: "supabase.auth.resetPasswordForEmail",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await passwordRecovery
                })

                return;

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }
        })
    }

    async verifyOtp(credentials: IVerifyOtpSchema): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "verifyOtp Use Case",
        }, async () => {
            try {
                const supabase = await this.supabaseServer

                const { email, token } = credentials
                const verifyOtp = supabase.auth.verifyOtp({ email, token, type: "email" })

                await this.instrumentationService.startSpan({
                    name: "supabase.auth.verifyOtp",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" }
                }, async () => {
                    return await verifyOtp
                })

                return;

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }
        })
    }

    async checkPermission(email: string, action: string, resource: string): Promise<boolean> {
        return await this.instrumentationService.startSpan({
            name: "Check Permission Use Case",
        }, async () => {
            try {

                const user = await db.users.findUnique({
                    where: { email },
                    include: { role: true }
                });

                if (!user) {
                    return false;
                }

                return await this.permissionsRepository.checkPermission(user.role.name, action, resource);

            } catch (err) {
                this.crashReporterService.report(err)
                throw err
            }
        })
    }
}