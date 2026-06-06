import { cn } from "@/lib/utils";

/** Marca do Método Bispo — peça de xadrez (bispo) estilizada. */
export function BispoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="11" fill="currentColor" opacity="0.12" />
      {/* corpo do bispo */}
      <path
        d="M24 8c3.6 0 6.2 2.7 6.2 6 0 2-1.1 3.6-2.6 4.8 3.7 2.6 6.4 6.9 6.4 11.6 0 1.5-.4 2.7-1.2 3.6H15.2c-.8-.9-1.2-2.1-1.2-3.6 0-4.7 2.7-9 6.4-11.6-1.5-1.2-2.6-2.8-2.6-4.8 0-3.3 2.6-6 6.2-6Z"
        fill="currentColor"
      />
      {/* fenda diagonal característica */}
      <path d="M26.5 13.5 21 19" stroke="#f8f8f8" strokeWidth="1.6" strokeLinecap="round" />
      {/* base */}
      <rect x="14" y="36" width="20" height="4.5" rx="2.25" fill="currentColor" />
    </svg>
  );
}
