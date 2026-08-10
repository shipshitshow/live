import type { Metadata } from 'next';
import { LeadsView } from '@/components/leads/LeadsView';

export const metadata: Metadata = { title: 'Leads — Ship Shit Show' };

export default function LeadsPage() {
  return (
    <div className="h-screen overflow-hidden">
      <LeadsView />
    </div>
  );
}
