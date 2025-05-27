import { z } from "zod";

/**
 * Schema untuk mendapatkan user berdasarkan ID
 * @typedef {Object} IGetUserByIdSchema
 * @property {string} id - ID pengguna yang akan dicari
 */
export const GetUserByIdSchema = z.object({
    id: z.string(),
});

export type IGetUserByIdSchema = z.infer<typeof GetUserByIdSchema>;

export const defaulIGetUserByIdSchemaValues: IGetUserByIdSchema = {
    id: "",
};

/**
 * Schema credential untuk mendapatkan user berdasarkan ID
 * Mengambil hanya properti 'id' dari GetUserByIdSchema
 */
export const ICredentialGetUserByIdSchema = GetUserByIdSchema.pick({ id: true });

export type ICredentialGetUserByIdSchema = z.infer<typeof ICredentialGetUserByIdSchema>;

export const GetUserByEmailSchema = z.object({
    email: z.string().email(),
});

/** 
 * Tipe inferensi dari GetUserByEmailSchema 
 * @type {z.infer<typeof GetUserByEmailSchema>}
 */
export type IGetUserByEmailSchema = z.infer<typeof GetUserByEmailSchema>;

export const defaulIGetUserByEmailSchemaValues: IGetUserByEmailSchema = {
    email: "",
};

export const ICredentialGetUserByEmailSchema = GetUserByEmailSchema.pick({ email: true });

export type ICredentialGetUserByEmailSchema = z.infer<typeof ICredentialGetUserByEmailSchema>;

/**
 * Schema untuk mendapatkan user berdasarkan username
 * @typedef {Object} IGetUserByUsernameSchema
 * @property {string} username - Nama pengguna yang akan dicari
 */
export const GetUserByUsernameSchema = z.object({
    username: z.string(),
});

export type IGetUserByUsernameSchema = z.infer<typeof GetUserByUsernameSchema>;

export const defaulIGetUserByUsernameSchemaValues: IGetUserByUsernameSchema = {
    username: "",
};

export const ICredentialGetUserByUsernameSchema = GetUserByUsernameSchema.pick({ username: true });

export type ICredentialGetUserByUsernameSchema = z.infer<typeof ICredentialGetUserByUsernameSchema>;