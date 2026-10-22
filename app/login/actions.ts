"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/login?error=1");
  }

  const token = await createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect("/");
}

export async function logoutAction() {
  // The token itself stays technically valid until it expires (there's no
  // server-side store to revoke it from) — but deleting the cookie means
  // the browser stops sending it, which is what actually signs this device
  // out.
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
