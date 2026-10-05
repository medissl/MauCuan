# Miko as an interactive pet

Use the portrait for the app icon and the full-body character in the pet screen. These are proposed concept assets; the shipped mascot has not been replaced.

The standalone preview demonstrates a gentle breathing loop, tap reaction, and a happy expression for daily check-ins or savings progress. The no-spend action shares the same once-per-session check-in reward. Savings reactions never add XP. Demo data resets on reload and is not connected to Supabase.

## Native implementation direction

Use a small state machine: idle → greeting or celebrating → idle. Keep rewards in the existing server-validated check-in flow; animation must only follow a successful result and never issue rewards itself. Cancel animation timers on unmount and respect reduced motion. The two matching PNGs can support the first version through expression swaps and subtle whole-body movement.

For independent blinking, tail swishing, waving, and cosmetic clothing, create editable layers from one approved character master and rig them. Separate head, eyes, eyelids, mouth, ears, body, paws, tail and scarf. Do not generate unrelated frames for each movement: that risks changing the spots and proportions. A rig can preserve character identity across every action.

Missing a day should return Miko to a relaxed idle state, without punishment or guilt. Cosmetic accessories can react to the existing rewards system without tying happiness to spending.

These AI-generated PNGs are vector-style raster assets, not production animation rigs. Some tonal variation remains. No new EAS build or website deployment was started for this concept.
