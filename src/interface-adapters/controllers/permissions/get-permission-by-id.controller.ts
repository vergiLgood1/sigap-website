import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetPermissionByIdUseCase } from "@/src/application/use-cases/permissions/get-permissions-by-id.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    id: z.string().min(1, { message: "Permission ID is required" }),
});

export type IGetPermissionByIdController = ReturnType<typeof getPermissionByIdController>;

export const getPermissionByIdController = (
    instrumentationService: IInstrumentationService,
    getPermissionByIdUseCase: IGetPermissionByIdUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: z.infer<typeof inputSchema>) => {
    return await instrumentationService.startSpan({ name: "Get Permission By Id Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to view a permission");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await getPermissionByIdUseCase(data.id);
    });
};
