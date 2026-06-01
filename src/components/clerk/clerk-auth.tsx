import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/react';

// Clerk auth surface: sign-in/up when signed out, account button when signed in.
export function ClerkAuth() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
