import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ICreateResourceUseCase } from "@/src/application/use-cases/resources/create-resources.use-case";

import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    name: z.string().min(1, { message: "Resource name is required" }),
    description: z.string().optional(),
});

export type ICreateResourceController = ReturnType<typeof createResourceController>;

export const createResourceController = (
    instrumentationService: IInstrumentationService,
    createResourceUseCase: ICreateResourceUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: Partial<z.infer<typeof inputSchema>>) => {
    return await instrumentationService.startSpan({ name: "createResource Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to create a resource");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await createResourceUseCase(data);
    });
};
