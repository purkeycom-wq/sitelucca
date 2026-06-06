"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="text-xs font-semibold text-foreground/70" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="admin@metodobispo.com"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-bispo-green"
          placeholder="voce@agencia.com"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground/70" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-bispo-green"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-bispo-green py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
