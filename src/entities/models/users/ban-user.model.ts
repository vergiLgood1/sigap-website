// Schema Zod untuk validasi runtime
import { CRegex } from "@/app/_utils/const/regex";
import { ValidBanDuration } from "@/app/_utils/types/ban-duration";
import { z } from "zod";

export const BanDurationSchema = z.custom<ValidBanDuration>(
    (value) => typeof value === "string" && CRegex.BAN_DURATION_REGEX.test(value),
    { message: "Invalid ban duration format." }
);

// Tipe untuk digunakan di kode
export type IBanDuration = z.infer<typeof BanDurationSchema>;

export const BanUserCredentialsSchema = z.object({
    id: z.string(),
})

export type ICredentialsBanUserSchema = z.infer<typeof BanUserCredentialsSchema>

// Schema utama untuk user
export const BanUserSchema = z.object({
    ban_duration: BanDurationSchema,
});

export type IBanUserSchema = z.infer<typeof BanUserSchema>;

// Nilai default
export const defaulIBanUserSchemaValues: IBanUserSchema = {
    ban_duration: "none",
};
