import db from "@/prisma/db";
import { IRolesRepository } from "@/src/application/repositories/roles.repository.interface";
import { ICrashReporterService } from "@/src/application/services/crash-reporter.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ICreateRoleSchema } from "@/src/entities/models/roles/create-roles.model";
import { IRolesSchema } from "@/src/entities/models/roles/roles.model";
import { roles } from "@prisma/client";

export class RolesRepository implements IRolesRepository {
    constructor(
        private readonly instrumentationService: IInstrumentationService,
        private readonly crashReporterService: ICrashReporterService,
    ) { }

    async getById(id: string): Promise<IRolesSchema | null> {
        return this.instrumentationService.startSpan(
            { name: "Find Role By ID", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.roles.findUnique({
                        where: { id }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async getByName(name: string): Promise<IRolesSchema | null> {
        return this.instrumentationService.startSpan(
            { name: "Find Role By Name", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.roles.findUnique({
                        where: { name }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async getAll(): Promise<IRolesSchema[]> {
        return this.instrumentationService.startSpan(
            { name: "Find All Roles", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.roles.findMany();
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async create(data: ICreateRoleSchema): Promise<IRolesSchema> {
        return this.instrumentationService.startSpan(
            { name: "Create Role", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.roles.create({
                        data: {
                            name: data.name,
                            description: data.description,
                        }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async update(id: string, data: ICreateRoleSchema): Promise<IRolesSchema> {
        return this.instrumentationService.startSpan(
            { name: "Update Role", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.roles.update({
                        where: { id },
                        data: {
                            name: data.name,
                            description: data.description,
                        }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async delete(id: string): Promise<IRolesSchema> {
        return this.instrumentationService.startSpan(
            { name: "Delete Role", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.roles.delete({
                        where: { id }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }
}