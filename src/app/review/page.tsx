import { UnpublishedClient } from "@/components/review/UnpublishedClient";
import { AppHeader } from "@/components/AppHeader";

export const metadata = {
  title: "Ship Shit Show — Unpublished Videos",
};

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Unpublished Videos" activeHref="/review" />

      <UnpublishedClient />
    </div>
  );
}
