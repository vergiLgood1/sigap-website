/**
 * Definisikan tipe untuk satuan waktu yang valid
 * @description Satuan waktu yang valid: "ns", "us", "µs", "ms", "s", "m", "h"
 */
export type TimeUnit = "ns" | "us" | "µs" | "ms" | "s" | "m" | "h";

/**
 * Buat tipe untuk durasi yang valid (1ns, 2ms, 10h, dll.)
 * @description Format durasi yang valid: `${number}${TimeUnit}` atau "none"
 */
export type ValidBanDuration = `${number}${TimeUnit}` | "none";