import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before uploading to server.
 * Converts to WebP format, reduces size to max 5MB, max 2048px width/height.
 * Handles camera-captured files on mobile (iOS/Android) which may have empty
 * or generic names (e.g. "image", "blob") and inconsistent MIME types.
 *
 * @param {File} file - The original image file from input (camera or gallery)
 * @returns {Promise<File>} - Compressed image file ready for FormData upload
 */
export async function compressImage(file) {
  if (!file) return file;

  // Detailed initial logging for mobile debugging
  console.log('[compressImage] Selected File details:', {
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)} KB`,
    type: file.type,
    lastModified: file.lastModified,
  });

  // Skip compression for non-image files (e.g. PDFs) unless extension indicates an image
  const isImageMime = file.type && file.type.startsWith('image/');
  const isImageExt = /\.(jpg|jpeg|png|webp|heic|heif|gif|bmp)$/i.test(file.name || '');

  if (!isImageMime && !isImageExt) {
    return file;
  }

  // --- Sanitize filename -----------------------------------------------
  const rawName = file.name || '';
  const dotIndex = rawName.lastIndexOf('.');
  let baseName = dotIndex > 0 ? rawName.substring(0, dotIndex) : rawName;
  if (!baseName || baseName.toLowerCase() === 'image' || baseName.toLowerCase() === 'blob') {
    baseName = `upload_${Date.now()}`;
  }

  // Mobile safe options: useWebWorker set to false to prevent iOS Safari/Android WebView worker context failures
  const options = {
    maxSizeMB: 2,               // Max 2MB output target
    maxWidthOrHeight: 1920,     // Max 1920px dimensions
    useWebWorker: false,        // Safe for mobile browsers (avoids blob URL worker issues in Safari)
    fileType: 'image/jpeg',     // JPEG output is universal across all mobile and desktop browsers
    initialQuality: 0.85,       // 85% quality balance
  };

  try {
    const compressed = await imageCompression(file, options);
    console.log(
      `[compressImage] Success: ${file.name || '(no name)'} ` +
      `[${(file.size / 1024).toFixed(0)}KB] → [${(compressed.size / 1024).toFixed(0)}KB]`
    );
    return compressed;
  } catch (err) {
    console.warn('[compressImage] Primary compression failed, attempting secondary fallback:', err);
    try {
      const fallbackOptions = { maxSizeMB: 4, maxWidthOrHeight: 2048, useWebWorker: false };
      return await imageCompression(file, fallbackOptions);
    } catch (fallbackErr) {
      console.warn('[compressImage] All compression failed, returning original file:', fallbackErr);
      return file;
    }
  }
}

/** Helper: derive a file extension from a MIME type */
function getExtFromMime(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/heic': '.heic',
    'image/heif': '.heif',
  };
  return map[mimeType] || '.jpg';
}

