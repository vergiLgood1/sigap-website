import db from "@/prisma/db";
import { IResourcesRepository } from "@/src/application/repositories/resources.repository.interface";
import { ICrashReporterService } from "@/src/application/services/crash-reporter.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ICreateResourceSchema } from "@/src/entities/models/resources/create-resources.model";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { resources } from "@prisma/client";

export class ResourcesRepository implements IResourcesRepository {
    constructor(
        private readonly instrumentationService: IInstrumentationService,
        private readonly crashReporterService: ICrashReporterService,
    ) { }

    async getById(id: string): Promise<IResourcesSchema | null> {
        return this.instrumentationService.startSpan(
            { name: "Find Resource By ID", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.findUnique({
                        where: { id }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async getByName(name: string): Promise<IResourcesSchema | null> {
        return this.instrumentationService.startSpan(
            { name: "Find Resource By Name", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.findUnique({
                        where: { name }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async getByType(type: string): Promise<IResourcesSchema[] | null> {
        return this.instrumentationService.startSpan(
            { name: "Find Resources By Type", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.findMany({
                        where: { type }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async getAll(): Promise<IResourcesSchema[]> {
        return this.instrumentationService.startSpan(
            { name: "Find All Resources", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.findMany();
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async create(data: ICreateResourceSchema): Promise<IResourcesSchema> {
        return this.instrumentationService.startSpan(
            { name: "Create Resource", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.create({
                        data: {
                            name: data.name,
                            description: data.description,
                            type: data.type,
                        }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async update(id: string, data: ICreateResourceSchema): Promise<IResourcesSchema> {
        return this.instrumentationService.startSpan(
            { name: "Update Resource", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.update({
                        where: { id },
                        data: {
                            name: data.name,
                            description: data.description,
                            type: data.type,
                        }
                    });
                } catch (error) {
                    this.crashReporterService.report(error);
                    throw error;
                }
            }
        )
    }

    async delete(id: string): Promise<IResourcesSchema> {
        return this.instrumentationService.startSpan(
            { name: "Delete Resource", op: "function", attributes: {} },
            async () => {
                try {
                    return await db.resources.delete({
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