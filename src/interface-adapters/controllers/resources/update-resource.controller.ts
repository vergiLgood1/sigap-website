import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IUpdateResourceUseCase } from "@/src/application/use-cases/resources/update-resource.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    name: z.string().min(1, { message: "Resource name is required" }),
    description: z.string().optional(),
});

export type IUpdateResourceController = ReturnType<typeof updateResourceController>;

export const updateResourceController = (
    instrumentationService: IInstrumentationService,
    updateResourceUseCase: IUpdateResourceUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (id: string, input: Partial<z.infer<typeof inputSchema>>) => {
    return await instrumentationService.startSpan({ name: "updateResource Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to update a resource");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await updateResourceUseCase(id, data);
    });
};
