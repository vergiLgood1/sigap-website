import { IUsersRepository } from "../../repositories/users.repository.interface";
import { IInstrumentationService } from "../../services/instrumentation.service.interface";

export type IUploadAvatarUseCase = ReturnType<typeof uploadAvatarUseCase>;

export const uploadAvatarUseCase = (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
) => async (userId: string, file: File): Promise<string> => {
    return await instrumentationService.startSpan({ name: "uploadAvatar Use Case", op: "function" },
        async () => {
            const newAvatar = await usersRepository.uploadAvatar(userId, file);

            if (!newAvatar) {
                throw new Error("Failed to upload avatar");
            }

            return newAvatar;
        }
    );
};
