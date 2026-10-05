# MauCuan

A native Android and iOS app for recording income and spending, setting savings goals, and building consistent habits with Miko the spotted macan. Built with Expo / React Native and Supabase.

Latest approved Android preview: [corrected-Miko build 6767c626](https://expo.dev/accounts/medizeng/projects/maucuan/builds/6767c626-e823-47f1-a649-17caeeeea74d), queued from commit cac3ee2. Includes all 0.2.0 fixes, teal-blue theme and fixed-palette Miko artwork. See [current preview details](docs/android-preview.md). Earlier queue records below are historical.

## Run locally

Requires Node 22+ and npm. Copy `.env.example` to `.env`, run `npm ci`, then `npm start`. The example contains only the project's public client connection, not a privileged key. Never add a Supabase secret or service-role key to the app.

For full native email callbacks, install a development build. Expo Go can preview basic screens but does not register the `maucuan://` URL scheme. Android and iOS device behavior still needs validation.

## Implemented

- Email/password account creation, verification handling, sign-in/out, password recovery, and native encrypted session persistence.
- First-use profile and wallet setup; real transactions with editing, deletion, filters, and monthly category insights. Explicit screen routes, balance breakdown, editable profile and password settings. Monetary inputs show an Rp prefix and Indonesian thousands grouping while saving raw whole-rupiah values.
- Savings goals and atomic allocations that do not count as new spending.
- Camera/gallery receipt attachments, stored in a private Supabase bucket. On-device OCR suggests merchant, IDR total, and date using ML Kit (Android) / Vision (iOS). Users must review before saving; unreadable or conflicting fields remain manual. Requires a new native build, not Expo Go.
- Server-authoritative daily check-ins, XP, levels, leaves, and cosmetic collection redemptions. Extra transactions do not earn extra daily rewards.
- Approved 2D Miko with five expressions, breathing motion, tap-to-greet and rest interaction, a deep-teal home-screen icon, opaque bottom navigation, and reduced-motion support.

## Connected backend

[MauCuan Supabase project](https://supabase.com/dashboard/project/dftqtktmtcfobggjviqp) · Medi corp · Singapore region. Created on the quoted $0/month plan. Any future plan changes require a separate decision.

The initial schema is saved in `supabase/schema.sql` and applied to the hosted project as `maucuan_initial`. Tables enforce owner access with RLS. Client roles cannot write check-ins, reward amounts, accessory costs, contributions, or the opening balance directly. Public RPC wrappers invoke checked private functions for these operations. Daily reward dates use Asia/Jakarta; no user-supplied date can farm XP.

## Setup still needed

1. **Email delivery:** Gmail SMTP has been saved in the hosted dashboard by the operator. Confirmation and password recovery templates use numeric `{{ .Token }}` codes, with no verification-link button. Copies are in `supabase/templates/`. End-to-end inbox delivery still needs testing; use a dedicated transactional sender before public launch.
2. **Auth redirects:** Site URL is `https://maucuan-finance.vercel.app`; `maucuan://auth/callback` and the website callback remain allowed for compatibility. The current signup and recovery screens use email codes.
3. **Receipt OCR:** on-device extraction is implemented with `expo-text-extractor@2.0.0`; validate it on real receipt photos after installing the native build. No OCR cloud credentials are required. DocRunic exposes documentation tools and was not connected as an OCR processor.
4. **Build distribution:** Expo project [@medizeng/maucuan](https://expo.dev/accounts/medizeng/projects/maucuan) is connected to `medissl/MauCuan`. The first build failed on missing transitive lock entries. Replacement [build 6cf9587f](https://expo.dev/accounts/medizeng/projects/maucuan/builds/6cf9587f-a9d9-4d37-92ac-da61826bead4) finished successfully and is the older 0.1.0 APK being tested. The approved 0.2.0 Android preview build was cancelled while queued at the operator request to include the latest teal-blue theme: https://expo.dev/accounts/medizeng/projects/maucuan/builds/8e30df9d-4fc6-435d-9cdc-e1c2ea9c51d4 . It targeted commit 839098e; its replacement must target the updated theme commit. No new APK is available yet. The repaired npm 10.9.8 lockfile passes a clean install. No store submission is included.
5. **Store readiness:** privacy/support URLs, account deletion/export workflows, physical-device accessibility checks, and the store listing. This initial implementation is a development build, not a store-ready release.

## Validation

`npm run lint` checks the source; `npm run typecheck` checks TypeScript. `npm test` validates financial arithmetic, currency input, amount/date parsing, Jakarta dates, pet progress, receipt parsing, and real component event handlers for home routes and email-code verification. Interaction tests mock the phone platform and Supabase; they do not prove real-device touches or email delivery. `supabase/security-tests.sql` checks cross-user and anonymous access, opening balance immutability, no-spend validation, allocation limits, and duplicate daily reward behavior; all fixtures roll back.

Android and iOS JavaScript/Hermes bundle exports have passed. Database security tests passed on the hosted project, and Supabase's security advisor reported no findings. These checks do not substitute for real-device testing or end-to-end email delivery.

## Current limits

One IDR wallet; online-first recording; daily check-ins; a 2D mascot with five expressions, breathing motion and greeting/rest interaction. No bank transfers, bank sync, cloud OCR, reminders, frame-by-frame pet animation, accessory rendering, or recurring transactions yet. Large ledgers will need server pagination and aggregates before scale.

Dependency audit: the current Expo/React Native toolchain includes unresolved upstream `braces`, `node-forge`, and Router's transitive URI parser advisories. Patched braces/forge versions were unavailable when checked; the parser repair currently requires a Router major upgrade, outside SDK 57 compatibility. Do not expose the Metro development server publicly; revisit upstream fixes before release. The compatible `uuid` fix is pinned through an override.

## Website

[Live MauCuan website](https://maucuan-finance.vercel.app) is deployed from `website/` to the Vercel Hobby project `maucuan-finance`. Vercel is connected to this GitHub repository; `main` publishes the website. Includes landing, support, privacy, and an optional native auth handoff page. Uses approved 2D Miko artwork, a teal-blue palette, gentle grounded breathing, an accessible tap-to-greet interaction and no floating text cards. The free Vercel address is a website address, not a verified email sender domain. A custom domain was deferred; Gmail SMTP is configured separately in Supabase.

## Project documentation

GitHub is the shared record for source, setup, and validation. See [implementation status](docs/implementation-status.md), [account email setup](docs/account-email-setup.md), and the original [Miko](docs/miko-art-direction.txt) and [icon](docs/icon-art-direction.txt) artwork prompts. Native implementation is on `codex/maucuan-native` in [draft PR #1](https://github.com/medissl/MauCuan/pull/1).

## Current Android preview

The approved replacement Android preview build includes the teal-blue theme and all 0.2.0 fixes. Build ID: 46f7be09-b6af-4cb3-a72d-31faa90141d9. Source commit: 62ca462655eb7e757f1acd35e577534f859c2ef1. Status when recorded: queued. Build page: https://expo.dev/accounts/medizeng/projects/maucuan/builds/46f7be09-b6af-4cb3-a72d-31faa90141d9 . An APK download appears only after success. The prior 8e30df9d build was cancelled while queued. No store submission.

