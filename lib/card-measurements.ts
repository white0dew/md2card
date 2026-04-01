export const SOCIAL_NOTE_RESERVED_HEIGHT = 176;

export function getSocialNoteUsableHeight(pageHeight: number) {
  return Math.max(120, pageHeight - SOCIAL_NOTE_RESERVED_HEIGHT);
}
