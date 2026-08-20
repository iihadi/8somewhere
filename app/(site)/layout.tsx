import { getAllReviews } from "@/lib/repo";
import { getStats } from "@/lib/derive";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stats = getStats(await getAllReviews());

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer total={stats.total} cities={stats.cities} />
    </div>
  );
}
