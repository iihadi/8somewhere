"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "@/components/Spinner";

export default function DeleteReviewButton({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm(`Delete "${name}"? This also removes its photos. Can't be undone.`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/edit/reviews/${slug}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-[#e0554f] disabled:opacity-50"
    >
      {loading && <Spinner />}
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
