# Local receipt-layout extension

Based on `expo-text-extractor` 2.0.0 by Petr Chalupa (pchalupa), whose npm package declares the MIT license. Original author and repository metadata are retained in package.json.

Upstream: https://github.com/pchalupa/expo-text-extractor

MauCuan adds `extractReceiptLayout`: Android ML Kit line rectangles/angles and iOS Vision observation rectangles/confidence. Android uses the bundled Latin recognizer so scanning does not depend on a first-use model download. iOS uses accurate recognition and image orientation. The existing plain-text API remains available for compatibility, but MauCuan uses spatial output exclusively.

The source and shipped JS/type bindings are committed together. No remote OCR service, client API key, or receipt-image upload to a recognition service is introduced. The receipt is uploaded only when the user saves it to their private Supabase bucket.

The Android Gradle definition uses the current SDK 57 expo-module-gradle-plugin rather than the removed legacy ExpoModulesCorePlugin.gradle script.
