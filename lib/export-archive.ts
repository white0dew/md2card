import JSZip from "jszip";

export interface ArchiveEntry {
  fileName: string;
  blob: Blob;
}

function getTimestampString(now = new Date()) {
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function buildArchiveName(fileName: string, now = new Date()) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
  return `${baseName}-${getTimestampString(now)}.zip`;
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
