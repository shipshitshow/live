import type { Metadata } from 'next';
import { CommentsView } from '@/components/comments/CommentsView';

export const metadata: Metadata = { title: 'Comments — Ship Shit Show' };

export default function CommentsPage() {
  return (
    <div className="h-screen overflow-hidden">
      <CommentsView />
    </div>
  );
}
