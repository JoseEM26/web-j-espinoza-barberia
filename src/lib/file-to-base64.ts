const MAX_FILE_SIZE_BYTES = 1_800_000; // ~1.8 MB crudos (~2.4 MB en base64, bajo el límite del backend)

export class FileTooLargeError extends Error {}

export function fileToBase64(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Promise.reject(
      new FileTooLargeError("La imagen es muy pesada. Usa una foto de menos de 1.8 MB."),
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
