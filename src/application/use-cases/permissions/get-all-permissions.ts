import { IPermissionsSchema } from "@/src/entities/models/permissions/permissions.model";
import { IPermissionsRepository } from "../../repositories/permissions.repository.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";


export type IGetAllPermissionsUseCase = ReturnType<typeof getAllPermissionsUseCase>;

export const getAllPermissionsUseCase = (
    instrumentationService: IInstrumentationService,
    permissionsRepository: IPermissionsRepository,
) => async (): Promise<IPermissionsSchema[]> => {
    return await instrumentationService.startSpan({ name: "Get All Permissions Use Case", op: "function" },
        async () => {

            const permissions = await permissionsRepository.getAll()

            return permissions
        }
    )
}
