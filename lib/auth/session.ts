import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "sportshub_session";
export const SESSION_TTL_SECONDS = 60 * 60; // 1 hour.

// Stateless, signed session: the cookie itself carries an expiry and an
// HMAC signature, so validity is checked by verifying the signature rather
// than by looking anything up in a store. That's deliberate — on Vercel,
// `proxy.ts` (Edge) and the Server Actions (Node) are separate runtimes that
// never share memory, so an in-memory session set created by one is
// invisible to the other. A signed cookie needs no shared state at all: it
// verifies the same way wherever it's checked.
//
// Uses Web Crypto (`crypto.subtle`) rather than Node's `crypto` module
// specifically because it's the one crypto API available in both the Edge
// and Node.js runtimes.

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padLength = (4 - (value.length % 4)) % 4;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  const binary = atob(padded);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload).buffer);
  const key = await hmacKey(getSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, signatureB64] = token.split(".");
  if (!payloadB64 || !signatureB64) return false;

  try {
    const key = await hmacKey(getSecret());
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signatureB64),
      new TextEncoder().encode(payloadB64),
    );
    if (!validSignature) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64)),
    );
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  return isValidSessionToken(await getSessionToken());
}
