import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-10">
      <SignIn
        fallbackRedirectUrl="/analytics"
        path="/login"
        routing="path"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
