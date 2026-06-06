import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const BRL2 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("pt-BR");
const PCT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export function formatValue(
  value: number,
  format: "currency" | "currency2" | "number" | "percent" | "ratio" = "number",
): string {
  switch (format) {
    case "currency":
      return BRL.format(value);
    case "currency2":
      return BRL2.format(value);
    case "percent":
      return PCT.format(value / 100);
    case "ratio":
      return `${NUM.format(Number(value.toFixed(2)))}x`;
    default:
      return NUM.format(Math.round(value));
  }
}

/** Variação percentual entre período atual e anterior. */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}
