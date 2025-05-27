import { ICreateResourceSchema } from "@/src/entities/models/resources/create-resources.model";
import { IResourcesSchema } from "@/src/entities/models/resources/resources.model";
import { IUpdateResourceSchema } from "@/src/entities/models/resources/update-resources.model";
import { resources } from "@prisma/client";

export interface IResourcesRepository {
    create(data: ICreateResourceSchema): Promise<IResourcesSchema>;
    getById(id: string): Promise<IResourcesSchema | null>;
    getByName(name: string): Promise<IResourcesSchema | null>;
    getByType(type: string): Promise<IResourcesSchema[] | null>;
    getAll(): Promise<IResourcesSchema[]>;
    update(id: string, data: IUpdateResourceSchema): Promise<IResourcesSchema>;
    delete(id: string): Promise<IResourcesSchema>;
}