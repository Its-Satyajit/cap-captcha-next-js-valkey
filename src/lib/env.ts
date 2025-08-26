// src/lib/env.ts
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    // This will stop the server from starting if the variable is missing.
    throw new Error(`FATAL: Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  valkeyUrl: process.env.VALKEY_URL || "valkey://localhost:6379",
  // For production, you might want to enforce this:
  // valkeyUrl: getEnvVar("VALKEY_URL"),
};
