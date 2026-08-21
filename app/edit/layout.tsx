import Link from "next/link";
import Brand from "@/components/Brand";
import LogoMark from "@/components/LogoMark";

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/edit" className="flex items-center gap-2 font-display text-lg tracking-tight">
            <LogoMark className="h-5 w-5" />
            <span>
              <Brand /> <span className="text-muted">— edit</span>
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-muted transition-colors hover:text-cream"
          >
            View live site ↗
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
