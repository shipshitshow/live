import { Suspense } from "react";
import { UnpublishedClient } from "@/components/review/UnpublishedClient";
import { AppHeader } from "@/components/AppHeader";
import { ReviewQueueContentSkeleton } from "@/components/PageSkeletons";

export const metadata = {
  title: "Ship Shit Show — Unpublished Videos",
};

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Unpublished Videos" activeHref="/review" />
      <Suspense fallback={<ReviewQueueContentSkeleton />}>
        <UnpublishedClient />
      </Suspense>
    </div>
  );
}
