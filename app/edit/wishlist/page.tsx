import { getWishlist } from "@/lib/repo";
import WishlistManager from "@/components/edit/WishlistManager";

export const dynamic = "force-dynamic";

export default async function EditWishlistPage() {
  const items = await getWishlist();

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Wishlist</p>
        <h1 className="mt-2 font-display text-4xl">Not yet</h1>
        <p className="mt-2 text-muted">
          Booked, planned, or just sitting on the list. Converting an entry
          turns it into a draft review, prefilled with what&rsquo;s here —
          it stays off the public site until it&rsquo;s written up and
          published.
        </p>
      </div>
      <WishlistManager items={items} />
    </div>
  );
}
