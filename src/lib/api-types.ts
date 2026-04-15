export interface ErrorResponse {
  error: string;
  code?: string;
  hint?: string;
}

export interface ReauthRequiredResponse extends ErrorResponse {
  reauthRequired: true;
  channelLabel: string | null;
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ErrorResponse).error === 'string'
  );
}

export function isReauthRequiredResponse(
  value: unknown,
): value is ReauthRequiredResponse {
  return (
    isErrorResponse(value) &&
    (value as ReauthRequiredResponse).reauthRequired === true &&
    'channelLabel' in value
  );
}
