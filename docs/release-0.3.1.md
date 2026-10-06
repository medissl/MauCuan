# MauCuan 0.3.1

The receipt reader previously treated OCR block order as reading order. That could pair addresses with prices, miss goods in a separate column and select the wrong total. This release uses the physical position of recognized lines, reconstructs each row from left to right, and deskews modest tilts before parsing. Address/phone/store metadata and thank-you footers are excluded, barcode prefixes are removed, and conflicting totals remain blank. Goods have editable names, quantities and line totals; differences against the payable total are shown for review.

Android uses bundled Google ML Kit Latin recognition without a first-use model download. iOS uses accurate Apple Vision recognition with image orientation. The local fork and both native implementations are in `vendor/expo-text-extractor`, with attribution in NOTICE.md. This is on-device OCR plus layout parsing, not a cloud vision/chat model. Real camera accuracy, blurry receipts and varied store formats are not established by parser fixtures and must be tested in the native APK. Receipt images are not sent to an OCR service. The existing private receipt attachment is uploaded only when the user saves.

## Pet and long-term collection

- Hold and stroke the character to pet her; the redundant visible petting button is removed. Screen-reader users retain a pet action on the character.
- Tap for a tos, toss an animated ball, play the existing finance quiz, or cycle dialogue. A comic bubble is outlined in the same ink and cream palette as the pet.
- More than 100 personal lines are available within each bond stage, alongside contextual facts from recorded finances. There are 60 base personality lines, 36 everyday lines, four bond tiers of 12 lines, and 16 touch/play reactions. Returning users start with a different personal story each date. The user's selected pet name is substituted into dialogue, accessibility and check-in copy.
- Bond warmth changes with accumulated check-ins (10, 90 and 365). Miko is curious, playful and loyal without shame, claims about bank access or punishment for absence. This dialogue system is curated and rule-based, not a generative chatbot.
- 68 rendered collectibles include early affordable furnishings and higher-level exclusives. Free gifts are at levels 2, 3, 4, 5, 10, 20, 30, 40, 50, 70, 90, 110 and 120. Level 120 requires 1,190 check-ins, over 3 years; they need not be consecutive. Level titles appear separately from the number.
- Rooms include gardens, an observatory, a studio, a greenhouse, treehouse, skyhouse and lighthouse. Accessories and furnishings use hand-authored SVGs with the established orange, ink, teal and cream palette.
- The new waiting expression was generated from the approved idle pet and recolored using the exact shared palette. Existing approved expressions are unchanged.
- Server prices, minimum levels, ownership and equipped slots remain authoritative. Only the first daily check-in gives 20 XP and 10 leaves. Spending, transactions, petting and games do not farm rewards.

Apply `supabase/catalog-0.3.1.sql` after the existing schema/enhancements for fresh installations. These idempotent additions are applied to the hosted project. Existing accounts and cosmetics are preserved.

## Reminders and Android widget

Reminders are off by default. Settings requests the phone's notification permission when the user turns them on. Recording/scan sessions teach a preferred hour after at least five distinct days; repeated entries in one batch do not dominate it. The user can select a manual hour. Notifications use local phone time, between 08:00 and 21:00, and contain no financial amounts. They gently invite the user back after 1, 3, 7, 14 and 30 days without opening the app, using 24 varied messages. Opening the app cancels and recalculates them; logout/account switching cancels the old account's schedules. Learned activity timestamps stay in per-account SecureStore on that phone. No push service or server cron is used. Android uses the waiting mascot as the notification's large icon; iOS text reminders have the standard app icon. Android may delay inexact alarms under battery restrictions.

The native Android home-screen widget is registered through the local Expo module in `modules/maucuan-widget`. It uses the chosen pet name and shows idle, checked-in happy, or waiting after a missed day. It opens check-in or the pet room through the app URL scheme. No financial balance is visible on the home screen. Logout clears its account identity. There is no iOS widget in this release.

Install the new APK, then open Settings and choose **Tambahkan widget ke layar utama**. Compatible launchers show their placement confirmation. Alternatively, hold an empty home-screen area, choose Widgets, find MauCuan and drag Teman Macan onto the screen. The widget resizes; Android refreshes it periodically (requested hourly) and immediately when the app opens/check-in changes. Launcher and battery policy can delay background refresh. Force-stopping an app can also suspend reminders until reopening.

## Checks and remaining device work

Passed: 39 full-suite tests plus the additional daily-dialogue regression (40 total cases), lint and TypeScript. Tests cover physical OCR column order, eight goods, tilted row pairing, address/footer rejection, low-confidence boxes, editable receipt persistence, calendar fields, interactions, name/bond variation, adaptive scheduling and widget synchronization/logout.

Passed: actual isolated npm 10.9.3 clean install with dev dependencies, Linux/x64 dependency-selection dry run, Android project generation, native module discovery for the OCR fork/widget/notifications, and Android/iOS production Hermes bundle exports. These exports do not compile Kotlin/Swift. The OCR Android Gradle configuration was updated to the SDK 57 module plugin. Local Android SDK/JDK compilation and real phone testing were unavailable.

Hosted rollback checks passed for catalog prices, minimum-level locks (including denial at level 119 and free gift at level 120), duplicate purchases, leaf balances, equipment slots, ownership isolation and RLS. Security advisors report no new table/RLS issues; the pre-existing leaked-password-protection warning remains.

The next APK needs device checks for actual receipt photos, totals and quantities; hold/stroke/tap and animation placement; check-in/shop/level gifts; notification permission, enable/disable, account switching and return timing; Android widget placement/resizing, happy/waiting transitions, tap routes, logout and device restart. Native compilation must succeed before an APK is available. No store submission or public release is included.
