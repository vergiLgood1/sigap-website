import db from '@/prisma/db';
import { IPermissionsRepository } from '@/src/application/repositories/permissions.repository.interface';
import { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ICreatePermissionSchema } from '@/src/entities/models/permissions/create-permission.model';
import { IPermissionsSchema } from '@/src/entities/models/permissions/permissions.model';
import { IUpdatePermissionSchema } from '@/src/entities/models/permissions/update-permission.model';
import { PrismaClient, permissions } from '@prisma/client';

export class PermissionsRepository implements IPermissionsRepository {
    constructor(
        private readonly instrumentationService: IInstrumentationService,
        private readonly crashReporterService: ICrashReporterService,
    ) { }

    async create(data: ICreatePermissionSchema): Promise<IPermissionsSchema> {
        return db.permissions.create({
            data: {
                action: data.action,
                resource_id: data.resource_id,
                role_id: data.role_id
            }
        });
    }

    async getById(id: string): Promise<permissions | null> {
        return db.permissions.findUnique({
            where: { id }
        });
    }

    async getByRoleAndResource(roleId: string, resourceId: string): Promise<IPermissionsSchema[]> {
        return db.permissions.findMany({
            where: {
                role_id: roleId,
                resource_id: resourceId
            }
        });
    }

    async getByRole(roleId: string): Promise<IPermissionsSchema[]> {
        return db.permissions.findMany({
            where: {
                role_id: roleId
            },
            include: {
                resource: true
            }
        });
    }

    async getAll(): Promise<IPermissionsSchema[]> {
        return db.permissions.findMany();
    }

    async update(id: string, data: IUpdatePermissionSchema): Promise<IPermissionsSchema> {
        return db.permissions.update({
            where: { id },
            data: {
                action: data.action
            }
        });
    }

    async delete(id: string): Promise<IPermissionsSchema> {
        return db.permissions.delete({
            where: { id }
        });
    }

    async checkPermission(role: string, action: string, resource: string): Promise<boolean> {
        return await this.instrumentationService.startSpan({ name: "Check Permission" },
            async () => {
                try {

                    const permission = await db.permissions.findFirst({
                        where: {
                            role: { name: role },
                            action,
                            resource: { name: resource }
                        }
                    })

                    if (!permission) {
                        return false
                    }

                    console.log("Permission", permission)

                    return true

                } catch (err) {
                    this.crashReporterService.report(err);
                    throw err;
                }
            }
        )
    }
}