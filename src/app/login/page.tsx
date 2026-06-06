import { BispoMark } from "@/components/brand/bispo-mark";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar · Método Bispo Analytics" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="bg-board flex h-14 w-14 items-center justify-center rounded-2xl bg-bispo-green text-white">
            <BispoMark className="h-8 w-8" />
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold">Método Bispo Analytics</h1>
          <p className="text-sm text-muted">Entre para acessar seus dashboards</p>
        </div>

        <div className="card p-6">
          <LoginForm next={next ?? "/dashboard"} />
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Demo: <span className="font-semibold">admin@metodobispo.com</span> · senha{" "}
          <span className="font-semibold">bispo123</span>
        </p>
      </div>
    </div>
  );
}
