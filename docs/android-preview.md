# Version 0.4.0

Source changes and hosted daily quiz rules are ready. The updated Android APK has not been dispatched yet; the previous one-build allowance was used by 0.3.3. A fresh maximum-one-build preview approval is required. No store submission is included.

# Version 0.3.3

The approved replacement Android preview was dispatched on 6 October 2026 from commit 7d2de226372e965c93c7ef34e0daa23c2b66cf4c, with native quiz answer controls and a fixed dialogue area beneath the decorated room interior. Build: https://expo.dev/accounts/medizeng/projects/maucuan/builds/349b13ff-0ffa-4116-a228-111838b587a6 . Verified status at dispatch: IN_QUEUE. The one-build allowance 01a1107f-515e-7dba-b209-5c8b138b2a90 has been used. Internal APK only, no store submission. Download becomes available after successful completion; physical tap testing remains required.

# Version 0.3.2

The approved 0.3.2 Android preview finished successfully on 6 October 2026 from commit d049dedc68e2e64e2f1af43da8c13984b2517636, with two-line receipt item fixes and the revised pet room/quiz UX. Build: https://expo.dev/accounts/medizeng/projects/maucuan/builds/3190f91a-16c2-4cc1-8dff-2c32bcba27a3 . The one-build allowance 01a10ffe-2f22-7794-915a-7a76014553f7 has been used. Internal APK only, no store submission. The user accepted receipt scanning but reported unresponsive quiz answer controls and dialogue covering decorations, addressed in 0.3.3.

# Version 0.3.1

The approved 0.3.1 Android preview finished successfully on 6 October 2026 from commit ad078174b64a6b2677075154414e51136cdb2668. Build: https://expo.dev/accounts/medizeng/projects/maucuan/builds/c0ac44aa-257b-489a-b350-c0233d34499c . Includes the Android widget, habit reminders, long-term pet collection and bundled receipt layout recognition. The one-build allowance 01a10fce-2042-7c0e-b9b2-5a0ac4d29612 has been used. Internal APK only, no store submission. Download the APK from the build page; installation and real-device verification remain pending.

# Current Android preview

The repaired 0.3.0 Android preview was dispatched on 6 October 2026 from commit `1c61d540fdb12361c104852339def155c8eaf5f6`:
https://expo.dev/accounts/medizeng/projects/maucuan/builds/8a2d1d8a-3082-47d6-addb-053133ee99f8

Status checked 6 October: FINISHED successfully. This includes the dependency lock repair and all 0.3.0 features. The operator approved a maximum of one replacement build; that allowance has been consumed. Internal APK distribution only, with no store submission. Download the APK from this page once the build finishes successfully and install it as an update.

# Android preview build history

Updated 6 October 2026 (Asia/Jakarta).

The current approved 0.3.0 preview build is **b9890126-0225-4f56-a1ce-a23568ebdaf6**:
https://expo.dev/accounts/medizeng/projects/maucuan/builds/b9890126-0225-4f56-a1ce-a23568ebdaf6

Status: **FAILED** during `npm ci --include=dev`, before native compilation. There is no downloadable APK until it finishes successfully. Build source is commit `72c76ad7c311976de65d68e32f3ea03bc9d52cb0` on `codex/maucuan-native`, Android `preview` profile, internal distribution. No store submission.

Includes native date calendars, corrected Android OCR image paths, merchant/total parsing and editable receipt items, Miko's hold-to-pet reactions, room customization with 22 cosmetics, level gifts, contextual recorded-finance tips and a finance quiz. See [release notes and validation](release-0.3.0.md).

The operator explicitly approved an allowance capped at one EAS build. It has been used for this build. No additional builds should be started using this allowance.

When successful, download the APK from the build page and install it over the older MauCuan installation using Android's Update action. Device testing must cover email-code signup/recovery, date dialogs, saving/editing records and receipt items, camera/gallery OCR on actual receipts, savings allocations, petting gestures, shop ownership and room placement, level gifts, quiz, reduced motion and opaque system-navigation area. Automated checks do not replace these tests.

## Previous preview

The previous 0.2.0 build was `6767c626-e823-47f1-a649-17caeeeea74d`, from commit `cac3ee2c15919bebedb3fc502e4ba919a2d57ced`:
https://expo.dev/accounts/medizeng/projects/maucuan/builds/6767c626-e823-47f1-a649-17caeeeea74d

It included account codes, navigation, settings, currency formatting, bottom safe-area fixes, the teal-blue theme and fixed-palette Miko artwork. It does not include the 0.3.0 features above. The earlier preview queue entry `46f7be09-b6af-4cb3-a72d-31faa90141d9` was cancelled before that replacement.

## Dependency-install repair

The failed build reported missing root lock entries for `@emnapi/core@1.11.3` and `@emnapi/runtime@1.11.3`, peers of the optional WASM resolver runtime. The earlier lock was written with npm 11.6.2 on Windows. Regenerating it with npm 10.9.3 in an isolated folder restored those entries without changing application dependencies or existing package versions.

Verified: an actual `npm ci --include=dev --ignore-scripts` with npm 10.9.3 passed, as did a separate Linux/x64 dependency-selection dry run. Lint and TypeScript checks passed. This checks dependency installation; native compilation still needs the replacement EAS build. Fresh build allowance required before retrying.
