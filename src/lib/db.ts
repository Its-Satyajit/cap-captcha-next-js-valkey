
import Valkey from "iovalkey";
import { env } from "@/lib/env";

const valkey = new Valkey(env.valkeyUrl);

valkey.on("connect", () => {
  console.log("Successfully connected to Valkey.");
});

valkey.on("error", (err) => {
  console.error("Valkey Client Error", err);
});

export const db = valkey;
