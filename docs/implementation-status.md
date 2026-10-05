# MauCuan implementation status

Last verified: 5 October 2026.

## Source and connected services

- Repository: https://github.com/medissl/MauCuan
- Native source: `codex/maucuan-native`, draft PR https://github.com/medissl/MauCuan/pull/1
- Website source: `main`, `website/`; GitHub-connected Vercel production deployment
- Website: https://maucuan-finance.vercel.app
- Expo: https://expo.dev/accounts/medizeng/projects/maucuan
- Expo project ID: `2e5ac3c3-095a-46a0-a99c-ce1dfaa285da`
- Supabase: https://supabase.com/dashboard/project/dftqtktmtcfobggjviqp

The existing repository is used for both code and documentation. The local app configuration points to the Expo project. Expo's GitHub settings confirm the existing `medissl/MauCuan` repository is connected; the base directory is the repository root. Build from `codex/maucuan-native`, preview profile, Android. `main` currently contains the website, not the native app. The one approved [Android preview build](https://expo.dev/accounts/medizeng/projects/maucuan/builds/67505a34-8438-4947-bca2-f01e1e35115b) was queued from commit `18c6573` at 12:49 UTC. Build ID: `67505a34-8438-4947-bca2-f01e1e35115b`. The build failed at 20:36 WIB during dependency installation: npm ci reported three missing @emnapi lock entries. The repaired lockfile adds those entries without changing existing package versions. A fresh npm 10.9.8 install and a Linux/x64 installation dry run pass. The user approved one replacement Android preview build. Build `6cf9587f-a9d9-4d37-92ac-da61826bead4` is queued from repaired commit `0d7af33`: https://expo.dev/accounts/medizeng/projects/maucuan/builds/6cf9587f-a9d9-4d37-92ac-da61826bead4 . No APK is available yet. No store submission was authorized.

## Implemented and checked

The mascot and icon use a spotted macan cub. The website hero is static and its floating text cards are removed. Supabase's Site URL uses the new website address; native and HTTPS auth callbacks are allowed.

Native account handling, income/spending records, savings allocations, private receipt storage, and server-checked daily rewards are implemented. Daily review and no-spend days earn rewards; additional spending does not increase rewards.

Receipt reading runs on-device through `expo-text-extractor@2.0.0` (Android ML Kit / iOS Vision). Suggested merchant, IDR amount, and date require review before saving. Ambiguous amounts stay blank. No DocRunic OCR integration or cloud OCR credential is needed.

Validation passed: lint, TypeScript, Expo Doctor (21/21), eight finance/receipt parser tests, Android/iOS JavaScript and Hermes exports, hosted database security tests, and Supabase security advisor with no findings. The website production deployment is READY and its public page was inspected.

## Remaining before public release

- Run and verify the approved Android APK build from the connected repository.
- Test the installed app on real devices, including camera OCR, auth callbacks, and accessibility.
- Configure a dedicated SMTP sender after obtaining an owned sender domain. The free website hostname cannot verify an email sender. Email confirmation remains enabled; public email delivery has not been validated.
- Complete account deletion/export in the app and store requirements.
- Revisit the upstream dependency advisories documented in README before release.

See [account email setup](account-email-setup.md) for future SMTP configuration. Never commit privileged Supabase keys, SMTP credentials, signing secrets, or provider tokens.
