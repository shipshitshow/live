'use client';

import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@shipshitshow/ui';

export function AppAccountButton() {
  return (
    <>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-6',
              userButtonPopoverCard:
                'border border-surface-border bg-surface-card text-text-primary',
            },
          }}
        />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button
            size="sm"
            className="rounded bg-surface-elevated text-xs text-text-secondary hover:text-text-primary"
          >
            Sign in
          </Button>
        </SignInButton>
      </Show>
    </>
  );
}
