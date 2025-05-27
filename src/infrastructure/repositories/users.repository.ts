import { IUsersRepository } from "@/src/application/repositories/users.repository.interface";
import { ICrashReporterService } from "@/src/application/services/crash-reporter.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { createAdminClient } from "@/app/_utils/supabase/admin";
import { createClient as createServerClient } from "@/app/_utils/supabase/server";
import { IUserSchema, IUserSupabaseSchema } from "@/src/entities/models/users/users.model";
import { ITransaction } from "@/src/entities/models/transaction.interface";
import db from "@/prisma/db";
import { DatabaseOperationError, NotFoundError } from "@/src/entities/errors/common";
import { AuthenticationError } from "@/src/entities/errors/auth";
import { ICredentialGetUserByEmailSchema, ICredentialGetUserByUsernameSchema, IGetUserByIdSchema } from "@/src/entities/models/users/read-user.model";
import { ICredentialsInviteUserSchema } from "@/src/entities/models/users/invite-user.model";
import { ICredentialUpdateUserSchema, IUpdateUserSchema } from "@/src/entities/models/users/update-user.model";
import { ICredentialsDeleteUserSchema } from "@/src/entities/models/users/delete-user.model";
import { IBanUserSchema, ICredentialsBanUserSchema } from "@/src/entities/models/users/ban-user.model";
import { ICredentialsUnbanUserSchema } from "@/src/entities/models/users/unban-user.model";
import { ICreateUserSchema } from "@/src/entities/models/users/create-user.model";
import { User } from "@supabase/supabase-js";

export class UsersRepository implements IUsersRepository {
    constructor(
        private readonly instrumentationService: IInstrumentationService,
        private readonly crashReporterService: ICrashReporterService,
        private readonly supabaseAdmin = createAdminClient(),
        private readonly supabaseServer = createServerClient()
    ) { }

    async getUsers(): Promise<IUserSchema[]> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > getUsers",
        }, async () => {
            try {

                const query = db.users.findMany({
                    include: {
                        profile: true,
                        role: true,
                    },
                });

                const users = await this.instrumentationService.startSpan({
                    name: `UsersRepository > getUsers > Prisma: db.users.findMany`,
                    op: "db:query",
                    attributes: { "system": "prisma" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (!users) {
                    return [];
                }

                return users;
            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async getUserById(credential: IGetUserByIdSchema): Promise<IUserSchema | undefined> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > getUserById",
        }, async () => {
            try {
                const query = db.users.findUnique({
                    where: {
                        id: credential.id,
                    },
                    include: {
                        profile: true,
                        role: true,
                    },
                })

                const user = await this.instrumentationService.startSpan({
                    name: `UsersRepository > getUserById > Prisma: db.users.findUnique(${credential.id})`,
                    op: "db:query",
                    attributes: { "system": "prisma" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (!user) {
                    throw new NotFoundError("User not found");
                }

                return {
                    ...user,
                };
            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async getUserByUsername(credential: ICredentialGetUserByUsernameSchema): Promise<IUserSchema | undefined> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > getUserByUsername",
        }, async () => {
            try {
                const query = db.users.findFirst({
                    where: {
                        profile: {
                            username: credential.username,
                        },
                    },
                    include: {
                        profile: true,
                        role: true,
                    },
                })

                const user = await this.instrumentationService.startSpan({
                    name: `UsersRepository > getUserByUsername > Prisma: db.users.findFirst(${credential.username})`,
                    op: "db:query",
                    attributes: { "system": "prisma" },
                },
                    async () => {
                        return await query;
                    }
                )



                if (!user) {
                    throw new NotFoundError("User not found");
                }

                return user;
            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async getUserByEmail(credential: ICredentialGetUserByEmailSchema): Promise<IUserSchema | undefined> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > getUserByEmail",
        }, async () => {
            try {

                const query = db.users.findUnique({
                    where: {
                        email: credential.email,
                    },
                    include: {
                        profile: true,
                        role: true,
                    },
                })

                const user = await this.instrumentationService.startSpan({
                    name: `UsersRepository > getUserByEmail > Prisma: db.users.findUnique(${credential.email})`,
                    op: "db:query",
                    attributes: { "system": "prisma" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (!user) {
                    return undefined;
                }

                return user;
            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async getCurrentUser(): Promise<IUserSchema> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > getCurrentUser",
        }, async () => {
            try {
                const supabase = await this.supabaseServer;

                const query = supabase.auth.getUser();

                const { data: { user }, error } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > getCurrentUser > supabase.auth.getUser",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (error) {
                    throw new AuthenticationError("Failed to get current user");
                }

                if (!user) {
                    throw new NotFoundError("User not found");
                }

                const userDetail = await db.users.findUnique({
                    where: {
                        id: user.id,
                    },
                    include: {
                        profile: true,
                        role: true,
                    },
                });

                if (!userDetail) {
                    throw new NotFoundError("User details not found");
                }

                return {
                    ...userDetail
                };
            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async createUser(input: ICreateUserSchema, tx?: ITransaction): Promise<IUserSupabaseSchema> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > createUser",
        }, async () => {
            try {

                console.log("Create User");

                const supabase = this.supabaseAdmin;

                const query = supabase.auth.admin.createUser({
                    email: input.email,
                    password: input.password,
                    email_confirm: input.email_confirm ?? true,
                    phone: input.phone,
                })

                const { data: { user }, error } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > createUser > supabase.auth.admin.createUser",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (error || !user) {
                    throw new DatabaseOperationError("Failed to create user");
                }

                return user;

            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async inviteUser(credential: ICredentialsInviteUserSchema, tx?: ITransaction): Promise<IUserSupabaseSchema> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > inviteUser",
        }, async () => {
            try {
                const supabase = this.supabaseAdmin;

                const query = supabase.auth.admin.inviteUserByEmail(credential.email);

                const { data: { user } } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > inviteUser > supabase.auth.admin.inviteUserByEmail",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (!user) {
                    throw new DatabaseOperationError("Failed to invite user");
                }

                return user;
            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async updateUser(credential: ICredentialUpdateUserSchema, input: Partial<IUpdateUserSchema>, tx?: ITransaction): Promise<IUserSchema> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > updateUser",
        }, async () => {
            try {
                const supabase = this.supabaseAdmin;

                const queryUpdateSupabaseUser = supabase.auth.admin.updateUserById(credential.id, {
                    email: input.email,
                    email_confirm: input.email_confirmed_at,
                    password: input.encrypted_password,
                    password_hash: input.encrypted_password,
                    phone: input.phone,
                    phone_confirm: input.phone_confirmed_at,
                    user_metadata: input.user_metadata,
                    app_metadata: input.app_metadata,
                });

                const { data, error } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > updateUser > supabase.auth.updateUser",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await queryUpdateSupabaseUser;
                    }
                )

                if (error) {
                    throw new DatabaseOperationError("Failed to update user");
                }

                const queryGetUser = db.users.findUnique({
                    where: {
                        id: credential.id,
                    },
                    include: {
                        role: true,
                        profile: true,
                    },
                })

                const user = await this.instrumentationService.startSpan({
                    name: "UsersRepository > updateUser > Prisma: db.users.update",
                    op: "db:query",
                    attributes: { "system": "prisma" },
                },
                    async () => {
                        return await queryGetUser;
                    }
                )

                if (!user) {
                    throw new NotFoundError("User not found");
                }

                const queryUpdateUser = db.users.update({
                    where: {
                        id: credential.id,
                    },
                    include: {
                        profile: true,
                        role: true,
                    },
                    data: {
                        roles_id: input.roles_id || user.roles_id,
                        invited_at: input.invited_at || user.invited_at,
                        confirmed_at: input.confirmed_at || user.confirmed_at,
                        last_sign_in_at: input.last_sign_in_at || user.last_sign_in_at,
                        is_anonymous: input.is_anonymous || user.is_anonymous,
                        created_at: input.created_at || user.created_at,
                        updated_at: input.updated_at || user.updated_at,
                        profile: {
                            update: {
                                avatar: input.profile?.avatar || user.profile?.avatar,
                                username: input.profile?.username || user.profile?.username,
                                first_name: input.profile?.first_name || user.profile?.first_name,
                                last_name: input.profile?.last_name || user.profile?.last_name,
                                bio: input.profile?.bio || user.profile?.bio,
                                address: input.profile?.address || user.profile?.address,
                                birth_date: input.profile?.birth_date || user.profile?.birth_date,
                            },
                        },
                    },
                })

                const updatedUser = await this.instrumentationService.startSpan({
                    name: "UsersRepository > updateUser > Prisma: db.users.update",
                    op: "db:query",
                    attributes: { "system": "prisma" },
                },
                    async () => {
                        return await queryUpdateUser;
                    }
                )

                if (!updatedUser) {
                    throw new DatabaseOperationError("Failed to update user");
                }

                return {
                    ...updatedUser,
                    id: credential.id,
                };

            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async deleteUser(credential: ICredentialsDeleteUserSchema, tx?: ITransaction): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > deleteUser",
        }, async () => {
            try {
                const supabase = this.supabaseAdmin;

                const query = supabase.auth.admin.deleteUser(credential.id);

                const { data: user, error } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > deleteUser > supabase.auth.admin.deleteUser",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (error) {
                    throw new DatabaseOperationError("Failed to delete user");
                }

                return;

            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async banUser(credential: ICredentialsBanUserSchema, input: IBanUserSchema, tx?: ITransaction): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > banUser",
        }, async () => {
            try {
                const supabase = this.supabaseAdmin;

                const query = supabase.auth.admin.updateUserById(credential.id, {
                    ban_duration: input.ban_duration ?? "24h",
                })

                const { data: user, error } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > banUser > supabase.auth.admin.updateUserById",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (error) {
                    throw new DatabaseOperationError("Failed to ban user");
                }

                return;

            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }


    async unbanUser(credential: ICredentialsUnbanUserSchema, tx?: ITransaction): Promise<void> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > unbanUser",
        }, async () => {
            try {
                const supabase = this.supabaseAdmin;

                const query = supabase.auth.admin.updateUserById(credential.id, {
                    ban_duration: "none",
                })

                const { data: user, error } = await this.instrumentationService.startSpan({
                    name: "UsersRepository > unbanUser > supabase.auth.admin.updateUserById",
                    op: "db:query",
                    attributes: { "system": "supabase.auth" },
                },
                    async () => {
                        return await query;
                    }
                )

                if (error) {
                    throw new DatabaseOperationError("Failed to unban user");
                }

                return;

            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }

    async uploadAvatar(userId: string, file: File): Promise<string> {
        return await this.instrumentationService.startSpan({
            name: "UsersRepository > uploadAvatar",
        }, async () => {
            try {
                const supabase = this.supabaseAdmin;

                const { data, error } = await supabase.storage.from("avatars").upload(`avatars/${userId}`, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

                if (error) {
                    throw new DatabaseOperationError("Failed to upload avatar");
                }

                const { data: newAvatar } = supabase.storage.from("avatars").getPublicUrl(`avatars/${userId}`);

                return newAvatar.publicUrl || "";

            } catch (err) {
                this.crashReporterService.report(err);
                throw err;
            }
        })
    }
}