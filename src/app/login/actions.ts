"use server";

import { redirect } from "next/navigation";
import { createSession, verifyCredentials } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard") || "/dashboard";

  if (!email || !password) return { error: "Informe e-mail e senha." };

  const session = await verifyCredentials(email, password);
  if (!session) return { error: "E-mail ou senha inválidos." };

  await createSession(session);
  redirect(next.startsWith("/") ? next : "/dashboard");
}
