import type { Metadata } from 'next';
import { KanbanBoard } from '@/components/topics/KanbanBoard';

export const metadata: Metadata = { title: 'Topics — Ship Shit Show' };

export default function TopicsPage() {
  return (
    <div className="h-screen overflow-hidden">
      <KanbanBoard />
    </div>
  );
}
