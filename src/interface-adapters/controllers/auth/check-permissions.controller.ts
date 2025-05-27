import { IUsersRepository } from "@/src/application/repositories/users.repository.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ICheckPermissionsUseCase } from "@/src/application/use-cases/auth/check-permissions.use-case";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";


const checkPermissionInputSchema = z.object({
    email: z.string().email("Please enter a valid email"),  
    action: z.string().nonempty("Please enter an action"),
    resource: z.string().nonempty("Please enter a resource"),
})

export type ICheckPermissionsController = ReturnType<typeof checkPermissionsController>

export const checkPermissionsController =
    (
        instrumentationService: IInstrumentationService,
        checkPermissionUseCase: ICheckPermissionsUseCase,
        usersRpository: IUsersRepository
    ) =>
        async (input: Partial<z.infer<typeof checkPermissionInputSchema>>) => {
            return await instrumentationService.startSpan({ name: "checkPermission Controller" },
                async () => {

                    const session = await usersRpository.getCurrentUser()

                    if (!session) {
                        throw new InputParseError("User not found")
                    }

                    const { data, error: inputParseError } = checkPermissionInputSchema.safeParse(input)

                    if (inputParseError) {
                        throw new InputParseError("Invalid data", { cause: inputParseError })
                    }

                    return await checkPermissionUseCase(
                        data.email,
                        data.action,
                        data.resource
                    )
                }
            )
        }