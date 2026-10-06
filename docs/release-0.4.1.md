# MauCuan 0.4.1

Catatan now opens directly to the calendar. The redundant calendar/month-list switch is removed. The month sheet uses Jakarta Bold, wider two-column month buttons, explicit dark text and borders, and a custom contrasting grab handle. Future months and years remain disabled; changing month selects today or the first day of the chosen month.

The Macan first screen groups the name, level and leaves above a shorter room, then the touch hint and three play actions. The decorated scene scales uniformly against available screen height after safe areas and bottom navigation. Dialogue has a fixed 108 dp area, smaller text for longer messages, and separate space from furniture. Wall decorations are smaller, furniture slots remain disjoint, and accessories explicitly anchor to Miko's top-left corner. Extra progress and check-in cards remain below the first group.

Miko starts curious and slightly shy. Dialogue and petting/tos/ball responses become familiar after 30 check-ins, close after 90, and include shared-history lines after 365. Three-year lines require 1,095 check-ins. Level alone never advances relationship dialogue. Early reminders use gentle acquaintance invitations. Renamed pets retain their own name everywhere in dialogue.

Validation: TypeScript, lint, 57 automated tests, and Android JavaScript/Hermes export. Tests cover calendar month/year navigation, the daily quiz, gestures, disjoint room slots, common 320–412 dp phone widths and 640–915 dp heights, and early/late relationship boundaries. Source-rendered visual review checked short and tall phone layouts and equipped decorations; it is a layout review rather than a physical Android device screenshot. Final installed-APK verification remains a device check.
