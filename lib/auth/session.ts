import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "sportshub_session";

// Single hardcoded admin, no DB: valid session tokens just live in memory for
// the life of the process. Restarting the server signs everyone out.
//
// Kept on `globalThis` (like the NHL store) because proxy.ts is bundled
// separately from the app routes and would otherwise get its own empty Set.
const g = globalThis as unknown as { __sportshubSessions?: Set<string> };
const validSessions = (g.__sportshubSessions ??= new Set<string>());

export function createSession(): string {
  const token = crypto.randomUUID();
  validSessions.add(token);
  return token;
}

export function destroySession(token: string | undefined): void {
  if (token) validSessions.delete(token);
}

export function isValidSession(token: string | undefined): boolean {
  return !!token && validSessions.has(token);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  return isValidSession(await getSessionToken());
}
