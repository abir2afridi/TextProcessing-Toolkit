export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(
  text: string,
  filename: string,
  mimeType = "text/plain;charset=utf-8"
): void {
  downloadBlob(new Blob([text], { type: mimeType }), filename);
}
