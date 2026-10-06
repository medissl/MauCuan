# MauCuan 0.3.0

Date entry now opens a native calendar. Labels are simply **Tanggal** and **Tanggal target**, and selected dates display as `2026 - 10 - 06`. Storage continues to use ISO dates. A target date can be cleared. Android Material UTC date-only values and iOS local values are handled separately.

Receipt recognition still runs on the phone using Google ML Kit (Android) / Apple Vision (iOS), through expo-text-extractor. There is no cloud AI, API key, or per-scan fee. A concrete Android bug was fixed: this package's Android implementation calls `File(uriString)` for non-content paths, so a `file://` prefix must be stripped before recognition. iOS keeps the URI. Images are selected at full quality for OCR; oversized private upload copies are resized only after recognition, at save time.

Receipt review includes editable store name, date, total, item names, quantities and line totals. Item totals are not unit prices. The parser handles a total on its own line, whole IDR with zero cents, and equally sized separate text/price columns. Address and cashier metadata are excluded from merchant suggestions. Ambiguous totals stay blank. Tax/discount/item discrepancies are highlighted; the user-reviewed transaction total remains authoritative. Raw recognized text is expandable locally and is not stored. Items are stored with the transaction in the same account-protected row. Camera and gallery recognition on the user's real receipts still need device testing; fixture tests do not establish real-world accuracy.

Miko now has a room and a 550 ms hold-to-pet gesture. A drawn hand follows the finger on the UI thread. After 170 points of movement Miko switches to the happy expression, hops and emits a heart. Reduced motion omits the hop and ambient movement. An **Elus Miko** button provides an alternative to the gesture. Petting does not award XP or leaves. The gesture is memoized so changing expressions does not replace it mid-stroke.

The room and 22 cosmetic items use authored vector shapes with the existing fixed orange, teal, cream and ink palette. Existing Miko PNGs were retained unchanged. Owned hats and glasses are rendered on Miko; wall, rug, left/right decoration and toy slots render in the room. Purchases and equipped slots persist in Supabase. Catalog prices, minimum levels, ownership and slots are checked by the server. Duplicate purchases do not charge twice. Profile locking serializes redemptions and equipment changes.

Levels grant meaningful free cosmetics: cloud rug at 2, night wall at 3, trophy at 4 and crown at 5. Further paid-in-leaves cosmetics unlock at levels 2–4. Base scarf remains part of Miko's approved artwork. It is not a removable/equippable item. There is no cash shop and no penalties for missed days. The only reward source remains the first daily check-in: 20 XP and 10 leaves.

Check-in starts with today's recorded transaction count and expenses, links to review, and disables the no-spend claim when an expense already exists today. Leaves use an icon in the balance, shop and reward display. Miko offers varied rule-based observations from recorded balance, monthly cash flow, weekly expenses, largest category and savings goal progress. These are not a generative AI chatbot or bank account analysis. A five-question finance quiz gives explanations and a score without additional rewards.

## Validation

- Unit/component checks cover finance, OCR path handling, receipt fixtures, calendar cancel/confirm/clear, shop locks/equip/unequip, quiz completion, stable petting gesture and its movement threshold.
- `supabase/enhancement-tests.sql` verifies actual hosted receipt persistence, catalog prices, insufficient funds, duplicate charge prevention, level locks and free gifts, equipment slots/ownership, account isolation and anonymous denial; all synthetic data rolls back.
- Original security tests are retained. Security advisors report no new database issues; the existing Auth leaked-password-protection warning remains.
- Lint, TypeScript and Android/iOS Hermes bundle exports are required before build dispatch.
- Native calendar sheets, camera recognition and gesture feel still require release APK testing on a phone. This is a preview, not a store release.

For a fresh database apply `supabase/schema.sql`, then `supabase/enhancements.sql`. The enhancement SQL is already applied to the hosted MauCuan project. It preserves existing transaction and accessory rows and remains compatible with the older 0.2.0 client.
