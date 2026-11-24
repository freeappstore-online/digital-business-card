export const MAX_PHOTO_DATA_URL_LENGTH = 36_000;
const TARGET_SIZE = 240;

/**
 * Center-crop and resize an image File into a compact JPEG data URL
 * that comfortably fits inside a 64 KiB collection document.
 */
export async function compressProfilePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  const bitmap = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process image in this browser.');
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);

  for (const quality of [0.82, 0.7, 0.55, 0.4]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_PHOTO_DATA_URL_LENGTH) {
      return dataUrl;
    }
  }

  throw new Error('Image is too large even after compression. Try a simpler photo.');
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file.'));
    };
    img.src = url;
  });
}
