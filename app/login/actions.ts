"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  getSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const COOKIE_TTL = 60 * 60; // 1 hour.

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/login?error=1");
  }

  const token = createSession();
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_TTL,
  });

  redirect("/");
}

export async function logoutAction() {
  const token = await getSessionToken();
  destroySession(token);
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
