# MauCuan

A native Android and iOS app for recording income and spending, setting savings goals, and building consistent habits with Miko the tiger. Built with Expo / React Native and Supabase.

## Run locally

Requires Node 22+ and npm. Copy `.env.example` to `.env`, run `npm ci`, then `npm start`. The example contains only the project's public client connection, not a privileged key. Never add a Supabase secret or service-role key to the app.

For full native email callbacks, install a development build. Expo Go can preview basic screens but does not register the `maucuan://` URL scheme. Android and iOS device behavior still needs validation.

## Implemented

- Email/password account creation, verification handling, sign-in/out, password recovery, and native encrypted session persistence.
- First-use profile and wallet setup; real transactions with editing, deletion, filters, and monthly category insights.
- Savings goals and atomic allocations that do not count as new spending.
- Camera/gallery receipt attachments, stored in a private Supabase bucket. **Automatic OCR is not connected yet; receipt fields are currently filled manually.**
- Server-authoritative daily check-ins, XP, levels, leaves, and cosmetic collection redemptions. Extra transactions do not earn extra daily rewards.
- Original rendered Miko character, orange/ivory/forest design, glass navigation, and reduced-motion setting.

## Connected backend

[MauCuan Supabase project](https://supabase.com/dashboard/project/dftqtktmtcfobggjviqp) · Medi corp · Singapore region. Created on the quoted $0/month plan. Any future plan changes require a separate decision.

The initial schema is saved in `supabase/schema.sql` and applied to the hosted project as `maucuan_initial`. Tables enforce owner access with RLS. Client roles cannot write check-ins, reward amounts, accessory costs, contributions, or the opening balance directly. Public RPC wrappers invoke checked private functions for these operations. Daily reward dates use Asia/Jakarta; no user-supplied date can farm XP.

## Setup still needed

1. **Email delivery:** configure a custom SMTP provider, verified sender address, and sender domain for public signup and password resets. [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).
2. **Auth redirects:** add `maucuan://auth/callback` to Supabase Auth's allowed Redirect URLs. An owned HTTPS landing URL should become the Site URL. For code-based verification, include `{{ .Token }}` in the confirmation and recovery email templates; the app supports entering those codes. [Native callback guide](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
3. **Receipt OCR:** choose a provider and spending cap. Its credential must remain on the server. Do not send private receipts to a third party until that integration is selected. The app never pretends OCR has succeeded.
4. **Build distribution:** an Expo account/EAS project is needed for cloud development builds. `eas.json` includes development, Android APK preview, and production profiles. Apple/Google developer accounts are needed for store release. Identifiers `com.medissl.maucuan` are provisional until confirmed.
5. **Store readiness:** privacy/support URLs, account deletion/export workflows, physical-device accessibility checks, and the store listing. This initial implementation is a development build, not a store-ready release.

## Validation

`npm run lint` checks the source; `npm run typecheck` checks TypeScript. `npm test` validates financial arithmetic, amount/date parsing, Jakarta dates, and pet progress. `supabase/security-tests.sql` checks cross-user and anonymous access, opening balance immutability, no-spend validation, allocation limits, and duplicate daily reward behavior; all fixtures roll back.

Android and iOS JavaScript/Hermes bundle exports have passed. Database security tests passed on the hosted project, and Supabase's security advisor reported no findings. These checks do not substitute for real-device testing or end-to-end email delivery.

## Current limits

One IDR wallet; online-first recording; daily check-ins; a static rendered mascot with breathing animation. No bank transfers, bank sync, automatic OCR, reminders, pet pose animation, accessory rendering, or recurring transactions yet. Large ledgers will need server pagination and aggregates before scale.

Dependency audit: the current Expo/React Native toolchain includes unresolved upstream `braces`, `node-forge`, and Router's transitive URI parser advisories. Patched braces/forge versions were unavailable when checked; the parser repair currently requires a Router major upgrade, outside SDK 57 compatibility. Do not expose the Metro development server publicly; revisit upstream fixes before release. The compatible `uuid` fix is pinned through an override.
