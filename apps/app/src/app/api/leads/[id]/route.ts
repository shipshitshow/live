import type { ErrorResponse } from '@shipshitshow/types';
import { isLeadStatus } from '@shipshitshow/types';
import { type NextRequest, NextResponse } from 'next/server';
import { updateLead } from '@/lib/leads-store';
import { logError, logEvent } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const response: ErrorResponse = { error: 'Invalid JSON body' };
    return NextResponse.json(response, { status: 400 });
  }

  const status =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>).status
      : null;

  if (!isLeadStatus(status)) {
    const response: ErrorResponse = { error: 'Unknown lead status' };
    return NextResponse.json(response, { status: 400 });
  }

  try {
    const lead = await updateLead(id, { status });
    if (!lead) {
      const response: ErrorResponse = { error: 'Lead not found' };
      return NextResponse.json(response, { status: 404 });
    }

    logEvent('api.leads.update', { leadId: id, status });
    return NextResponse.json({ lead });
  } catch (error) {
    logError('api.leads.update_failed', error, { leadId: id });
    const response: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to update lead',
    };
    return NextResponse.json(response, { status: 503 });
  }
}
