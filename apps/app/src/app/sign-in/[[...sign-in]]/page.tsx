import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-10">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  );
}
