import { AppHeader } from "@/components/AppHeader";
import { CommentsClient } from "@/components/comments/CommentsClient";

export const metadata = {
  title: "Ship Shit Show — Comments",
};

export default function CommentsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Comments" activeHref="/comments" />
      <CommentsClient />
    </div>
  );
}
