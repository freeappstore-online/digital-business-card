import { PageHeader } from '@freeappstore/sdk/ui';

export function About() {
  return (
    <>
      <PageHeader
        title="About"
        description="A free digital business card on FreeAppStore."
      />
      <div className="prose">
        <p>
          Digital Card replaces paper networking cards with a public profile page, QR code, and
          downloadable vCard. It is free: no ads, trials, or subscriptions.
        </p>
        <p>
          Card documents live in a shared collection so anyone with the link can read a profile.
          Only you can edit or delete your own card. After publishing this app, the owner should run{' '}
          <code>fas db share cards</code> once so public profiles are readable for everyone.
        </p>
        <p>
          View counts use shared counters. Anyone can read them; signed-in visitors may increment
          once per browser session. Built with the FreeAppStore SDK.
        </p>
      </div>
    </>
  );
}
