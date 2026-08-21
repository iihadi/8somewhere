import LogoMark from "@/components/LogoMark";

/**
 * Full-height loading state, shown by Next's loading.tsx convention
 * while a route segment's async data fetch is in flight. Pure CSS
 * animation — no client JS needed, so it paints instantly.
 */
export default function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="h-14 w-14 animate-pulse opacity-80" />
        <p className="eyebrow flex items-center gap-2">
          {label}
          <span className="flex gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted" />
          </span>
        </p>
      </div>
    </div>
  );
}
