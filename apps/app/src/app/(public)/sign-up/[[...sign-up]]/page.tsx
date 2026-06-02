import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}
