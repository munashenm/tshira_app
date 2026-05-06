import DashboardOverview from "@/components/DashboardOverview";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen">
      <DashboardOverview />
    </main>
  );
}
