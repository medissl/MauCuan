# Miko's fixed color palette

Direct pixel recoloring explicitly requested by the operator on 6 October 2026. No image regeneration was used for this correction. The five expression PNGs and current icons use shared solid material colors, with antialias blends only at boundaries.

| Material | Color |
| --- | --- |
| Body | #FF8808 |
| Spots, outlines and eyes | #00323E |
| Scarf | #009CB4 |
| Cream areas | #FFF4E7 |
| Eye whites | #FFFFFF |
| Existing leg folds | #D96C08 |
| Happy tongue | #FF7A63 |

Poses and canvas placement were not redrawn. Pixel alpha was checked unchanged for every image, and dimensions remain 1312×1199 for expressions and 1254×1254 for icons. Large fills in all five expressions were checked to contain the identical four main palette values. Icon backgrounds were preserved. Existing raster geometry differences between expressions remain; these are expression sprites, not interchangeable animation frames.

The website uses the corrected idle, wink and premium icon. Native source uses all five corrected expressions, premium icon and adaptive foreground. Build 46f7be09-b6af-4cb3-a72d-31faa90141d9 targets an earlier commit and does not include this correction. A replacement build requires a new approved allowance.
