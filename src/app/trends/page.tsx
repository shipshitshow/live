import { TrendsClient } from "@/components/trends/TrendsClient";
import { AppHeader } from "@/components/AppHeader";

export default function TrendsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Trends" activeHref="/trends" />

      <main className="px-6 py-6">
        <TrendsClient />
      </main>
    </div>
  );
}
