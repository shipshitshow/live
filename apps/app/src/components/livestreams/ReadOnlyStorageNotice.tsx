import { readOnlyStorageMessage } from '@/lib/storage-capability';

export function ReadOnlyStorageNotice({ subject }: { subject: string }) {
  return (
    <p
      className="rounded-xl border border-accent-red/20 bg-accent-red/5 px-5 py-3 text-xs text-accent-red"
      role="status"
    >
      {readOnlyStorageMessage(subject)}
    </p>
  );
}
