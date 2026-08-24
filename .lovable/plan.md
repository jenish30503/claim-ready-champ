# Add real accounts to Warranty Tracker

Turn the current placeholder login into working email/password accounts, powered by Lovable Cloud (built-in backend — no external accounts or keys to manage). Warranty data stays exactly where it is today (in the browser), so the Samsung TV demo path keeps working unchanged.

## What changes for the user

- **Sign up / Sign in** actually work: create an account with email + password, stay signed in across reloads, sign out from the profile page.
- **Profile page** shows the real account: email plus an editable display name that is saved and comes back after reload.
- **Header** reflects session state: signed out shows "Sign in"; signed in shows the account with a way to open the profile / sign out.
- **Demo data untouched**: the seeded products (Samsung TV flow, ₹166,380 total, evidence rules, clause 4.2) still load for every visitor, so a live demo works whether or not you sign in.

## Pages

| Route | State |
|---|---|
| `/login` | keep design, wire to real sign-in, add "Forgot password?" |
| `/signup` | keep design, wire to real sign-up, show "check your email" confirmation state |
| `/reset-password` | new page to set a new password from the emailed link |
| `/profile` | real user data, save display name, working sign-out |
| all 7 demo pages | unchanged |

## Signup confirmation

By default a new signup must confirm via email before being signed in. For a live hackathon demo that is a wait, so I'll enable instant sign-in on signup (auto-confirm) unless you tell me otherwise. Password reset by email still works.

## Technical notes

1. Enable Lovable Cloud (provisions the auth backend and generates the client files).
2. Add a `profiles` table keyed to the auth user (`id`, `display_name`, timestamps) with row-level security so each user can only read/write their own row, table grants for authenticated users, and a trigger that creates the row on signup.
3. Replace the hand-written `src/lib/supabase.ts` placeholder client with the generated `@/integrations/supabase/client`; delete the placeholder so no route can pick up the fake URL/key. The pasted `VITE_SUPABASE_*` values are no longer needed — Cloud injects its own.
4. Keep `AuthContext` as the single session source, switch it to the generated client, and use `getUser()` for trusted checks.
5. Replace the `beforeLoad` session gate on `/profile` with the standard protected-route layout so a hard refresh doesn't bounce a signed-in user.
6. Mount `<Toaster />` once in the root route (currently missing) so login/signup toasts actually appear.
7. Warranty/scan stores stay on localStorage; no schema for products in this step.

## Not included

Cloud-synced warranties, image storage, and Google sign-in — say the word later and I'll add them.
