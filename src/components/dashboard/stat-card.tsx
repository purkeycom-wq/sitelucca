import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  changePct,
  goodWhenUp = true,
}: {
  label: string;
  value: string;
  changePct?: number;
  goodWhenUp?: boolean;
}) {
  const hasDelta = typeof changePct === "number";
  const isGood = hasDelta ? (goodWhenUp ? changePct! >= 0 : changePct! <= 0) : true;
  const Icon = (changePct ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-extrabold">{value}</p>
      {hasDelta && (
        <span
          className={cn(
            "pill mt-2",
            isGood ? "bg-positive/10 text-positive" : "bg-critical/10 text-critical",
          )}
        >
          <Icon className="h-3 w-3" />
          {changePct! >= 0 ? "+" : ""}
          {changePct!.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
