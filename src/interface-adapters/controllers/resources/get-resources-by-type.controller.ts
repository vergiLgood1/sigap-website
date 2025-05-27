import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IGetResourcesByTypeUseCase } from "@/src/application/use-cases/resources/get-resources-by-type.use-case";
import { IGetCurrentUserUseCase } from "@/src/application/use-cases/users/get-current-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { z } from "zod";

const inputSchema = z.object({
    type: z.string().nonempty("Type is required"),
})

export type IGetResourcesByTypeController = ReturnType<typeof getResourcesByTypeController>;

export const getResourcesByTypeController = (
    instrumentationService: IInstrumentationService,
    getResourcesByTypeUseCase: IGetResourcesByTypeUseCase,
    getCurrentUserUseCase: IGetCurrentUserUseCase
) => async (input: z.infer<typeof inputSchema>) => {
    return await instrumentationService.startSpan({ name: "getResourcesByType Controller" }, async () => {
        const session = await getCurrentUserUseCase();

        if (!session) {
            throw new UnauthenticatedError("Must be logged in to fetch resources");
        }

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
            throw new Error("Invalid data", { cause: inputParseError });
        }

        return await getResourcesByTypeUseCase(data.type);
    });
};