import JSZip from "jszip";

export interface ArchiveEntry {
  fileName: string;
  blob: Blob;
}

export function buildArchiveName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${fileName}.zip`;
  }

  return `${fileName.slice(0, dotIndex)}.zip`;
}

export function buildArchiveEntries(entries: ArchiveEntry[]) {
  return [...entries];
}

export async function createArchiveBlob(entries: ArchiveEntry[]) {
  const zip = new JSZip();

  buildArchiveEntries(entries).forEach((entry) => {
    zip.file(entry.fileName, entry.blob);
  });

  return zip.generateAsync({ type: "blob" });
}
