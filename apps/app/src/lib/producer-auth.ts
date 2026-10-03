import type { ErrorResponse } from '@shipshitshow/types';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import {
  evaluateProducerAccess,
  PRODUCERS_ONLY_PATH,
  type ProducerAccess,
  producerDenial,
  SIGN_IN_PATH,
} from './producer-access';
import { producerSession } from './producer-session';

export async function getProducerAccess(): Promise<ProducerAccess> {
  try {
    return evaluateProducerAccess(await producerSession.getUserId());
  } catch {
    return { ok: false, reason: 'signed_out' };
  }
}

export async function requireProducer(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse<ErrorResponse> }
> {
  const access = await getProducerAccess();
  if (access.ok) return access;
  const { status, code, error } = producerDenial(access.reason);
  return {
    ok: false,
    response: NextResponse.json<ErrorResponse>(
      { code, error },
      { headers: { 'Cache-Control': 'no-store' }, status },
    ),
  };
}

export async function requireProducerPage(): Promise<string> {
  const access = await getProducerAccess();
  if (access.ok) return access.userId;
  return redirect(
    access.reason === 'signed_out' ? SIGN_IN_PATH : PRODUCERS_ONLY_PATH,
  );
}
