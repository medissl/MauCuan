import { petCatalog, type PetRoom, type PetSlot } from './pet.ts';
export const slotNames: Record<PetSlot, string> = { head: 'Kepala', face: 'Wajah', wall: 'Dinding', floor: 'Karpet', left: 'Sudut kiri', right: 'Sudut kanan', toy: 'Tempat mainan' };
// Unit coordinates relative to room width. Independent foreground footprints
// do not overlap; backgrounds and wearables deliberately belong behind/on Miko.
export const roomLayout = {
  height: 1.12,
  character: { x: .20, y: .46, size: .60 },
  left: { x: .015, y: .73, size: .18 },
  right: { x: .805, y: .73, size: .18 },
  toy: { x: .805, y: .94, size: .16 },
};
export function validRoom(room: PetRoom): PetRoom {
  const result: PetRoom = {};
  for (const item of petCatalog) if (room[item.slot] === item.id) result[item.slot] = item.id;
  return result;
}
