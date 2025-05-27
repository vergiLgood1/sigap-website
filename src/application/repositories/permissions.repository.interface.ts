import { ICreatePermissionSchema } from "@/src/entities/models/permissions/create-permission.model";
import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { IUpdatePermissionSchema } from "@/src/entities/models/permissions/update-permission.model";
import { permissions } from "@prisma/client";

export interface IPermissionsRepository {
    create(data: ICreatePermissionSchema): Promise<IPermissionsSchema>;
    getById(id: string): Promise<IPermissionsSchema | null>;
    getByRoleAndResource(roleId: string, resourceId: string): Promise<IPermissionsSchema[]>;
    getByRole(role: string): Promise<IPermissionsSchema[]>;
    getAll(): Promise<IPermissionsSchema[]>;
    update(id: string, data: IUpdatePermissionSchema): Promise<IPermissionsSchema>;
    delete(id: string): Promise<IPermissionsSchema>;
    checkPermission(role: string, action: string, resource: string): Promise<boolean>;
}