# Current Android preview

Updated 6 October 2026 (Asia/Jakarta).

The current approved 0.3.0 preview build is **b9890126-0225-4f56-a1ce-a23568ebdaf6**:
https://expo.dev/accounts/medizeng/projects/maucuan/builds/b9890126-0225-4f56-a1ce-a23568ebdaf6

Status checked after dispatch: **IN_PROGRESS**. There is no downloadable APK until it finishes successfully. Build source is commit `72c76ad7c311976de65d68e32f3ea03bc9d52cb0` on `codex/maucuan-native`, Android `preview` profile, internal distribution. No store submission.

Includes native date calendars, corrected Android OCR image paths, merchant/total parsing and editable receipt items, Miko's hold-to-pet reactions, room customization with 22 cosmetics, level gifts, contextual recorded-finance tips and a finance quiz. See [release notes and validation](release-0.3.0.md).

The operator explicitly approved an allowance capped at one EAS build. It has been used for this build. No additional builds should be started using this allowance.

When successful, download the APK from the build page and install it over the older MauCuan installation using Android's Update action. Device testing must cover email-code signup/recovery, date dialogs, saving/editing records and receipt items, camera/gallery OCR on actual receipts, savings allocations, petting gestures, shop ownership and room placement, level gifts, quiz, reduced motion and opaque system-navigation area. Automated checks do not replace these tests.

## Previous preview

The previous 0.2.0 build was `6767c626-e823-47f1-a649-17caeeeea74d`, from commit `cac3ee2c15919bebedb3fc502e4ba919a2d57ced`:
https://expo.dev/accounts/medizeng/projects/maucuan/builds/6767c626-e823-47f1-a649-17caeeeea74d

It included account codes, navigation, settings, currency formatting, bottom safe-area fixes, the teal-blue theme and fixed-palette Miko artwork. It does not include the 0.3.0 features above. The earlier preview queue entry `46f7be09-b6af-4cb3-a72d-31faa90141d9` was cancelled before that replacement.
