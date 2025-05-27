import { ICreateRoleSchema } from "@/src/entities/models/roles/create-roles.model";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { IUpdateRoleSchema } from "@/src/entities/models/roles/update-roles.model";
import { roles } from "@prisma/client";

export interface IRolesRepository {
    create(data: ICreateRoleSchema): Promise<IRolesSchema>;
    getById(id: string): Promise<IRolesSchema | null>;
    getByName(name: string): Promise<IRolesSchema | null>;
    getAll(): Promise<IRolesSchema[]>;
    update(id: string, data: IUpdateRoleSchema): Promise<IRolesSchema>;
    delete(id: string): Promise<IRolesSchema>;
}