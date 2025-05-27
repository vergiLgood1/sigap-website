import { createAdminClient } from "@/app/_utils/supabase/admin";
import { createClient } from "@/app/_utils/supabase/client";
import { IUserSchema, IUserSupabaseSchema, UserResponse } from "@/src/entities/models/users/users.model";
import { ITransaction } from "@/src/entities/models/transaction.interface";
import { ICreateUserSchema } from "@/src/entities/models/users/create-user.model";
import { ICredentialUpdateUserSchema, IUpdateUserSchema } from "@/src/entities/models/users/update-user.model";
import { ICredentialsBanUserSchema, IBanUserSchema } from "@/src/entities/models/users/ban-user.model";
import { ICredentialsUnbanUserSchema } from "@/src/entities/models/users/unban-user.model";
import { ICredentialsDeleteUserSchema } from "@/src/entities/models/users/delete-user.model";
import { ICredentialsInviteUserSchema } from "@/src/entities/models/users/invite-user.model";
import { ICredentialGetUserByEmailSchema, ICredentialGetUserByIdSchema, ICredentialGetUserByUsernameSchema, IGetUserByUsernameSchema } from "@/src/entities/models/users/read-user.model";

export interface IUsersRepository {
    getUsers(): Promise<IUserSchema[]>;
    getCurrentUser(): Promise<IUserSchema>;
    getUserById(credential: ICredentialGetUserByIdSchema): Promise<IUserSchema | undefined>;
    getUserByUsername(credential: ICredentialGetUserByUsernameSchema): Promise<IUserSchema | undefined>;
    getUserByEmail(credential: ICredentialGetUserByEmailSchema): Promise<IUserSchema | undefined>;
    createUser(input: ICreateUserSchema, tx?: ITransaction): Promise<IUserSupabaseSchema>;
    inviteUser(credential: ICredentialsInviteUserSchema, tx?: ITransaction): Promise<IUserSupabaseSchema>;
    updateUser(credential: ICredentialUpdateUserSchema, input: Partial<IUpdateUserSchema>, tx?: ITransaction): Promise<IUserSchema>;
    deleteUser(credential: ICredentialsDeleteUserSchema, tx?: ITransaction): Promise<void>;
    banUser(credential: ICredentialsBanUserSchema, input: IBanUserSchema, tx?: ITransaction): Promise<void>;
    unbanUser(credential: ICredentialsUnbanUserSchema, tx?: ITransaction): Promise<void>;
    uploadAvatar(userId: string, file: File): Promise<string>;
}