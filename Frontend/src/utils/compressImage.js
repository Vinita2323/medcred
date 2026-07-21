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

  // Skip compression for non-image files (like PDFs)
  if (!file.type.startsWith('image/')) return file;

  // --- Sanitize filename -----------------------------------------------
  // Camera-captured files on iOS/Android often have names like "", "image",
  // "image.jpg", or just "blob". We ensure a safe, non-empty filename.
  const rawName = file.name || '';
  const dotIndex = rawName.lastIndexOf('.');
  let baseName = dotIndex > 0 ? rawName.substring(0, dotIndex) : rawName;
  if (!baseName || baseName === 'image' || baseName === 'blob') {
    baseName = `upload_${Date.now()}`;
  }
  // ---------------------------------------------------------------------

  const options = {
    maxSizeMB: 5,              // Max 5MB
    maxWidthOrHeight: 2048,    // Max 2048px
    useWebWorker: true,        // Background thread — UI stays responsive
    fileType: 'image/webp',    // Convert to WebP for smaller size
    initialQuality: 0.9,       // 90% quality
  };

  try {
    const compressed = await imageCompression(file, options);
    console.log(
      `[compressImage] ${file.name || '(no name)'}: ` +
      `${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`
    );

    // Build a proper File object with a guaranteed valid name + MIME type.
    // This is critical for mobile: blobs returned by camera capture may have
    // no name, causing FormData to send an unnamed part that some servers reject.
    const webpFile = new File([compressed], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
    return webpFile;
  } catch (err) {
    console.warn('[compressImage] Compression failed, using original file:', err);
    // Fallback: return a File with a sanitized name so upload still works
    if (file.name) return file;
    return new File([file], `${baseName}${getExtFromMime(file.type)}`, {
      type: file.type || 'image/jpeg',
      lastModified: Date.now(),
    });
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

