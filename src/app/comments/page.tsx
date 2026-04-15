import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CommentsClient } from "@/components/comments/CommentsClient";
import { CommentsContentSkeleton } from "@/components/PageSkeletons";

export const metadata = {
  title: "Ship Shit Show — Comments",
};

export default function CommentsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Comments" activeHref="/comments" />
      <Suspense fallback={<CommentsContentSkeleton />}>
        <CommentsClient />
      </Suspense>
    </div>
  );
}
