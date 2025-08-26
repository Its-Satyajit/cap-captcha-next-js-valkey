// src/lib/cap.ts
import Cap from "@cap.js/server";
import { EXPIRATION, VALKEY_KEYS } from "@/lib/config";
import { db as valkey } from "@/lib/db";

const cap = new Cap({
  storage: {
    challenges: {
      store: async (token, data) => {
        const key = `${VALKEY_KEYS.CHALLENGE_PREFIX}${token}`;
        const value = JSON.stringify(data);
        await valkey.set(key, value, "EX", EXPIRATION.CHALLENGE);
      },

      read: async (token) => {
        const key = `${VALKEY_KEYS.CHALLENGE_PREFIX}${token}`;
        const data = await valkey.get(key);
        if (!data) {
          return null;
        }
        return JSON.parse(data);
      },

      delete: async (token) => {
        const key = `${VALKEY_KEYS.CHALLENGE_PREFIX}${token}`;
        await valkey.del(key);
      },

      listExpired: async () => {
        return [];
      },
    },

    tokens: {
      store: async (key, expires) => {
        const tokenKey = `${VALKEY_KEYS.TOKEN_PREFIX}${key}`;
        await valkey.set(tokenKey, expires, "EX", EXPIRATION.TOKEN);
      },

      get: async (key) => {
        const tokenKey = `${VALKEY_KEYS.TOKEN_PREFIX}${key}`;
        const expiresStr = await valkey.get(tokenKey);

        if (!expiresStr) return null;

        const expires = parseInt(expiresStr, 10);
        if (Number.isNaN(expires) || expires <= Date.now()) return null;

        return expires;
      },

      delete: async (key) => {
        const tokenKey = `${VALKEY_KEYS.TOKEN_PREFIX}${key}`;
        await valkey.del(tokenKey);
      },

      listExpired: async () => {
        return [];
      },
    },
  },
});

export default cap;
