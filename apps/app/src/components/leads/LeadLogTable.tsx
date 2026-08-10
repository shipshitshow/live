'use client';

import type { Lead, LeadStatus } from '@shipshitshow/types';
import { LEAD_STATUSES } from '@shipshitshow/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shipshitshow/ui';
import { SOURCE_LABELS, STATUS_LABELS, STATUS_STYLES } from './lead-labels';

interface LeadLogTableProps {
  leads: Lead[];
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
}

const HEAD_CLASS =
  'text-left py-3 px-4 text-text-secondary font-medium text-xs uppercase tracking-wider';

export function LeadLogTable({ leads, onStatusChange }: LeadLogTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/30 p-8 text-center">
        <p className="text-sm text-text-primary">No inbounds logged yet.</p>
        <p className="mt-2 text-xs text-text-muted">
          Log the next DM, reply or contact-form message the moment it lands.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            <th className={HEAD_CLASS}>Date</th>
            <th className={HEAD_CLASS}>Source</th>
            <th className={HEAD_CLASS}>Episode</th>
            <th className={HEAD_CLASS}>Contact</th>
            <th className={HEAD_CLASS}>Company</th>
            <th className={HEAD_CLASS}>Status</th>
            <th className={HEAD_CLASS}>Note</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b border-surface-border/50 transition-colors last:border-b-0 hover:bg-surface-elevated/50"
            >
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-text-secondary">
                {lead.date}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {SOURCE_LABELS[lead.source]}
              </td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-text-secondary">
                {lead.episodeDate ?? '—'}
              </td>
              <td className="px-4 py-3 text-text-primary">
                {lead.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {lead.company ?? '—'}
              </td>
              <td className="px-4 py-3">
                <Select
                  value={lead.status}
                  onValueChange={(value) =>
                    onStatusChange(lead, value as LeadStatus)
                  }
                >
                  <SelectTrigger
                    aria-label="Status"
                    className={`h-8 text-xs ${STATUS_STYLES[lead.status]}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="max-w-sm px-4 py-3 text-text-muted">
                <span className="line-clamp-2">{lead.note ?? '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
