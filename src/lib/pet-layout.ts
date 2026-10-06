import { petCatalog, type PetRoom, type PetSlot } from './pet.ts';
export const slotNames: Record<PetSlot, string> = { head: 'Kepala', face: 'Wajah', wall: 'Dinding', floor: 'Karpet', left: 'Sudut kiri', right: 'Sudut kanan', toy: 'Tempat mainan' };
// Unit coordinates relative to room width. Independent foreground footprints
// do not overlap; backgrounds and wearables deliberately belong behind/on Miko.
export const roomLayout = {
  height: .86,
  character: { x: .25, y: .33, size: .49 },
  left: { x: .02, y: .64, size: .16 },
  right: { x: .82, y: .60, size: .16 },
  toy: { x: .82, y: .78, size: .07 },
};
// Header, dialogue, hint and actions have their own space. Scale the entire
// decorated scene uniformly on shorter phones, never individual furniture.
export function habitatWidth(contentWidth: number, availableHeight: number) {
  return Math.max(180, Math.min(contentWidth, 400, (availableHeight - 324) / roomLayout.height));
}
export function validRoom(room: PetRoom): PetRoom {
  const result: PetRoom = {};
  for (const item of petCatalog) if (room[item.slot] === item.id) result[item.slot] = item.id;
  return result;
}
