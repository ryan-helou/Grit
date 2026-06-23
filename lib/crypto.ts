import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { env } from "./config";

// AES-256-GCM encryption for OAuth tokens at rest. TOKEN_ENCRYPTION_KEY must be
// a 32-byte key as 64 hex chars (generate with: openssl rand -hex 32).

function key(): Buffer {
  const k = env.tokenKey;
  if (!k) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  const buf = /^[0-9a-fA-F]{64}$/.test(k)
    ? Buffer.from(k, "hex")
    : Buffer.from(k, "base64");
  if (buf.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes");
  }
  return buf;
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ct].map((b) => b.toString("base64")).join(".");
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, ctB64] = payload.split(".");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
