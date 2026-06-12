export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(
  text: string,
  filename: string,
  mimeType = "text/plain;charset=utf-8"
): void {
  downloadBlob(new Blob([text], { type: mimeType }), filename);
}
