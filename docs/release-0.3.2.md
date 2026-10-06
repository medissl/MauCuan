# MauCuan 0.3.2

Miko's speech bubble is now a fixed overlay inside her room. Longer messages use a smaller font with native text fitting; they do not change the room height or move the controls below. Repeated account disclaimers are removed. The personal, everyday and bond-stage dialogue banks are rewritten in casual Indonesian, preserving the user's chosen pet name and contextual goal/balance facts.

The action row is Throw ball / Play quiz / Chat. Quiz questions and feedback are spoken in the room bubble. Three answers appear in an Expo UI native bottom sheet, which closes after selection. Dismissing the sheet keeps the question; the bubble's answer action reopens it. Other play actions are disabled during the quiz. No rewards are added for quiz answers or spending.

Receipt parsing now associates a product row with the quantity/unit-price row directly underneath. It recognizes multiplication signs, packs such as `1 lusin`, and sizes such as `1 500 ml`. The printed extended price can be on the product row or quantity row. Unit price is not mistaken for the extended price, and a quantity line cannot become a product name. Missing associations are flagged for review. Merchant/address/footer exclusions and spatial row alignment remain in place.

Regression fixtures recover all three reported examples: Indomie goreng (Rp36,000), Fruit apple (Rp7,000), Belfood sosis bakar (Rp27,000), preserving names and one purchased pack each. Eight-item column layouts, tilted rows, missing extended prices, footer rejection and editable item persistence are also covered. This changes the layout parser; it does not train or fine-tune ML Kit or Apple Vision. Actual photos, blur and varied store layouts still require device testing.

Validation: 45 tests, lint, TypeScript, Android and iOS production Hermes bundle exports. A static component-based browser layout review checks placement only; it does not establish native sheet behavior or camera accuracy. Native installation testing remains required.

Source version: 0.3.2. The finished 0.3.1 APK does not contain these changes. The approved Android preview was dispatched from d049dedc68e2e64e2f1af43da8c13984b2517636 on 6 October 2026: build 3190f91a-16c2-4cc1-8dff-2c32bcba27a3, IN_PROGRESS at dispatch. Its one-build allowance is consumed; no store submission is included. See android-preview.md for the build link.
