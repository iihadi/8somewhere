import { getAllReviews } from "@/lib/repo";
import { getStats, publishedOnly } from "@/lib/derive";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SearchShortcut from "@/components/SearchShortcut";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stats = getStats(publishedOnly(await getAllReviews()));

  return (
    <div className="flex min-h-screen flex-col">
      <SearchShortcut />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer total={stats.total} cities={stats.cities} />
    </div>
  );
}
