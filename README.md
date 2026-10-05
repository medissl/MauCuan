# MauCuan

A native Android and iOS app for recording income and spending, setting savings goals, and building consistent habits with Miko the spotted macan. Built with Expo / React Native and Supabase.

## Run locally

Requires Node 22+ and npm. Copy `.env.example` to `.env`, run `npm ci`, then `npm start`. The example contains only the project's public client connection, not a privileged key. Never add a Supabase secret or service-role key to the app.

For full native email callbacks, install a development build. Expo Go can preview basic screens but does not register the `maucuan://` URL scheme. Android and iOS device behavior still needs validation.

## Implemented

- Email/password account creation, verification handling, sign-in/out, password recovery, and native encrypted session persistence.
- First-use profile and wallet setup; real transactions with editing, deletion, filters, and monthly category insights.
- Savings goals and atomic allocations that do not count as new spending.
- Camera/gallery receipt attachments, stored in a private Supabase bucket. On-device OCR suggests merchant, IDR total, and date using ML Kit (Android) / Vision (iOS). Users must review before saving; unreadable or conflicting fields remain manual. Requires a new native build, not Expo Go.
- Server-authoritative daily check-ins, XP, levels, leaves, and cosmetic collection redemptions. Extra transactions do not earn extra daily rewards.
- Original rendered Miko character, orange/ivory/forest design, glass navigation, and reduced-motion setting.

## Connected backend

[MauCuan Supabase project](https://supabase.com/dashboard/project/dftqtktmtcfobggjviqp) · Medi corp · Singapore region. Created on the quoted $0/month plan. Any future plan changes require a separate decision.

The initial schema is saved in `supabase/schema.sql` and applied to the hosted project as `maucuan_initial`. Tables enforce owner access with RLS. Client roles cannot write check-ins, reward amounts, accessory costs, contributions, or the opening balance directly. Public RPC wrappers invoke checked private functions for these operations. Daily reward dates use Asia/Jakarta; no user-supplied date can farm XP.

## Setup still needed

1. **Email delivery:** configure a custom SMTP provider, verified sender address, and sender domain for public signup and password resets. [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).
2. **Auth email templates:** Supabase's Site URL is configured as `https://maucuan-finance.vercel.app`; both `maucuan://auth/callback` and the website's `/auth/callback` are allowed redirects. For code-based verification, include `{{ .Token }}` in the confirmation and recovery email templates; the app supports entering those codes. [Native callback guide](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
3. **Receipt OCR:** on-device extraction is implemented with `expo-text-extractor@2.0.0`; validate it on real receipt photos after installing the native build. No OCR cloud credentials are required. DocRunic exposes documentation tools and was not connected as an OCR processor.
4. **Build distribution:** the app configuration is linked to Expo project [@medizeng/maucuan](https://expo.dev/accounts/medizeng/projects/maucuan). Expo's GitHub integration is connected to the existing `medissl/MauCuan` repository. No Android build has started. `eas.json` includes development, Android APK preview, and production profiles. Apple/Google developer accounts are needed for store release. Identifiers `com.medissl.maucuan` are provisional until confirmed.
5. **Store readiness:** privacy/support URLs, account deletion/export workflows, physical-device accessibility checks, and the store listing. This initial implementation is a development build, not a store-ready release.

## Validation

`npm run lint` checks the source; `npm run typecheck` checks TypeScript. `npm test` validates financial arithmetic, amount/date parsing, Jakarta dates, and pet progress. `supabase/security-tests.sql` checks cross-user and anonymous access, opening balance immutability, no-spend validation, allocation limits, and duplicate daily reward behavior; all fixtures roll back.

Android and iOS JavaScript/Hermes bundle exports have passed. Database security tests passed on the hosted project, and Supabase's security advisor reported no findings. These checks do not substitute for real-device testing or end-to-end email delivery.

## Current limits

One IDR wallet; online-first recording; daily check-ins; a static rendered mascot with breathing animation. No bank transfers, bank sync, cloud OCR, reminders, pet pose animation, accessory rendering, or recurring transactions yet. Large ledgers will need server pagination and aggregates before scale.

Dependency audit: the current Expo/React Native toolchain includes unresolved upstream `braces`, `node-forge`, and Router's transitive URI parser advisories. Patched braces/forge versions were unavailable when checked; the parser repair currently requires a Router major upgrade, outside SDK 57 compatibility. Do not expose the Metro development server publicly; revisit upstream fixes before release. The compatible `uuid` fix is pinned through an override.

## Website

[Live MauCuan website](https://maucuan-finance.vercel.app) is deployed from `website/` to the Vercel Hobby project `maucuan-finance`. Vercel is connected to this GitHub repository; `main` publishes the website. Includes landing, support, privacy, and an optional native auth handoff page. Uses the spotted macan artwork with a static hero and no floating text cards. The free Vercel address is a website address, not a verified email sender domain. Custom sender/domain setup was deferred; SMTP is still pending.

## Project documentation

GitHub is the shared record for source, setup, and validation. See [implementation status](docs/implementation-status.md), [account email setup](docs/account-email-setup.md), and the original [Miko](docs/miko-art-direction.txt) and [icon](docs/icon-art-direction.txt) artwork prompts. Native implementation is on `codex/maucuan-native` in [draft PR #1](https://github.com/medissl/MauCuan/pull/1).
