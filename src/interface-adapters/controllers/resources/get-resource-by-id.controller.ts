import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetResourceByIdUseCase } from "@/src/application/use-cases/resources/get-resource-by-id.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
    id: z.string().min(1, { message: "Resource ID is required" }),
});

export type IGetResourceByIdController = ReturnType<typeof getResourceByIdController>;

export const getResourceByIdController = (
    instrumentationService: IInstrumentationService,
    getResourceById: IGetResourceByIdUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: z.infer<typeof inputSchema>) => {
    return await instrumentationService.startSpan({ name: "getResourceById Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to fetch a resource");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        return await getResourceById(data.id);
    });
};
