export default function DraftBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Placeholder text generated from your calendar — rewrite it, then set draft: false"
      className={`inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-gold ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      Draft
    </span>
  );
}
