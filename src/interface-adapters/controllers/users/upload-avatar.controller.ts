import { CNumbers } from "@/app/_utils/const/numbers";
import { CTexts } from "@/app/_utils/const/texts";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IUploadAvatarUseCase } from "@/src/application/use-cases/users/upload-avatar.use-case";
import { z } from "zod";

const inputSchema = z.object({
    id: z.string(),
    avatar: z.instanceof(File).refine(file => file.size <= CNumbers.MAX_FILE_AVATAR_SIZE, {
        message: `File size must be less than ${CNumbers.MAX_FILE_AVATAR_SIZE}`,
    }).refine(file => CTexts.ALLOWED_FILE_TYPES.includes(file.type), {
        message: "Invalid file type. Only PNG and JPG are allowed",
    }),
});

export type IUploadAvatarController = ReturnType<typeof uploadAvatarController>;

export const uploadAvatarController = (
    instrumentationService: IInstrumentationService,
    uploadAvatarUseCase: IUploadAvatarUseCase,
) => async (id: string, file: File) => {
    return await instrumentationService.startSpan({ name: "uploadAvatar Controller" }, async () => {
        const result = inputSchema.safeParse({ id, avatar: file });

        if (!result.success) {
            throw new Error(result.error.errors.map(err => err.message).join(", "));
        }

        return await uploadAvatarUseCase(result.data.id, result.data.avatar);
    });
};
