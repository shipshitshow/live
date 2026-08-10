import type { ErrorResponse, LeadListResponse } from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import {
  countLeadsByEpisode,
  createLead,
  listLeadEpisodeOptions,
  listLeads,
  parseLeadInput,
} from '@/lib/leads-store';
import { logError, logEvent } from '@/lib/logger';

export async function GET() {
  try {
    const [leads, episodes] = await Promise.all([
      listLeads(),
      listLeadEpisodeOptions(),
    ]);

    logEvent('api.leads.list', {
      episodeCount: episodes.length,
      leadCount: leads.length,
    });

    const response: LeadListResponse = {
      episodes,
      leads,
      leadsByEpisode: countLeadsByEpisode(leads),
    };

    return NextResponse.json(response);
  } catch (error) {
    logError('api.leads.list_failed', error);
    const response: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to load leads',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const response: ErrorResponse = { error: 'Invalid JSON body' };
    return NextResponse.json(response, { status: 400 });
  }

  const input = parseLeadInput(body);
  if (!input) {
    const response: ErrorResponse = {
      error: 'A lead needs a date (YYYY-MM-DD) and a known source',
    };
    return NextResponse.json(response, { status: 400 });
  }

  try {
    const lead = await createLead(input);
    logEvent('api.leads.create', {
      episodeDate: lead.episodeDate,
      leadId: lead.id,
      source: lead.source,
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    logError('api.leads.create_failed', error, { source: input.source });
    const response: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to save lead',
    };
    return NextResponse.json(response, { status: 503 });
  }
}
