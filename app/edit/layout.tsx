import Link from "next/link";

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/edit" className="font-display text-lg tracking-tight">
            8somewhere <span className="text-muted">— edit</span>
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
