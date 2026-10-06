# MauCuan 0.3.3

The quiz answer sheet previously embedded React Native views and touch buttons inside an Expo UI native presentation. Those choices rendered but did not respond on the user's Android device. The answer tree now uses universal Expo UI Column, Text and Button components throughout, so Android's Compose buttons receive clicks directly instead of passing touches through React Native children. The sheet keeps its dismissal, question progression and bubble-feedback behavior. Native sizing uses numeric dimensions supported by the installed SDK 57 modifier implementation.

The dialogue bubble no longer overlays the room's decorated interior. A fixed dialogue area sits beneath the interior within the same rounded room frame, with its tail pointing up toward the character. Wall art, furniture, toys and head accessories have their original room space back. Miko returns to her larger size. Short and long dialogue occupy the same fixed area; font fitting has a 12-point minimum. The three interaction controls retain their order and do not shift between messages.

Receipt scanning is unchanged from the user's accepted 0.3.2 implementation.

Validation: 46 automated tests, TypeScript and lint; Android and iOS production bundle exports. Quiz coverage includes all correct answers, a wrong answer, closing/reopening the sheet, and keeping the decorated viewport free of dialogue. A regression asserts that the sheet contains native choice controls rather than RN Pressables. A static component-based review shows the sky-house wall, crown, plant and bookshelf with the dialogue beneath them. These checks do not replace physical Android tap testing, which remains pending the replacement APK.

Source version: 0.3.3. A fresh approved EAS one-build allowance is required for the replacement Android preview. No store submission is included.
