# MauCuan implementation status

Updated 6 October 2026.

## Connected services

- Source: https://github.com/medissl/MauCuan
- Native branch: codex/maucuan-native, draft PR https://github.com/medissl/MauCuan/pull/1
- Website: main, website/, https://maucuan-finance.vercel.app
- Expo: https://expo.dev/accounts/medizeng/projects/maucuan
- Supabase: https://supabase.com/dashboard/project/dftqtktmtcfobggjviqp

## Current implementation

Native accounts, code-based signup and password recovery, encrypted sessions, onboarding, income/expense CRUD, receipt camera/gallery and on-device OCR review, savings goals/allocations, insights, server-controlled daily rewards and cosmetic collection redemptions. Recording more spending gives no extra rewards.

Version 0.2.0 adds explicit Expo Router screens, functioning home destinations for settings/balance/pet/scan/manual entry, balance details, profile/password editing, fixed Rp prefixes and automatic thousands grouping, opaque bottom safe area, clean date/greeting, approved 2D Miko expressions and a deep-teal icon. Native touch behavior must still be retested on the installed new build.

Gmail SMTP was saved by the operator. Signup and recovery email templates now use numeric tokens; templates and previews were verified. End-to-end delivery is not yet verified.

## Builds and checks

The first Android build failed on missing dependency lock entries. Replacement 6cf9587f-a9d9-4d37-92ac-da61826bead4 finished successfully; it is the older 0.1.0 APK. The user approved a fresh one-build allowance. Updated Android preview build 8e30df9d-4fc6-435d-9cdc-e1c2ea9c51d4 is queued from commit 839098e: https://expo.dev/accounts/medizeng/projects/maucuan/builds/8e30df9d-4fc6-435d-9cdc-e1c2ea9c51d4 . No updated APK is available yet. No store submission was authorized.

Lint, TypeScript, finance/receipt/component interaction tests, Android/iOS Hermes exports and clean npm 10.9.8 installation were checked. Component tests use mocked platform and backend; real-device verification remains required. Hosted schema/security checks passed earlier and no database schema changed in this UI/auth update.

## Remaining limits

One IDR wallet, online-first data, no bank sync/transfers, reminders, recurring records or cloud OCR. Mascot uses expression images with gentle motion; accessory collection redemption is stored, but accessory rendering is not implemented. Account deletion/export, device accessibility, transactional email provider, and store listing still need work before public store release. See README for upstream dependency advisories.
