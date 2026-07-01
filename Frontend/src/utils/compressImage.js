import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before uploading to server.
 * Converts to WebP format, reduces size to max 300KB, max 1024px width/height.
 * 
 * @param {File} file - The original image file from input
 * @returns {File} - Compressed image file
 */
export async function compressImage(file) {
  if (!file) return file;

  // Skip compression for non-image files (like PDFs)
  if (!file.type.startsWith('image/')) return file;

  const options = {
    maxSizeMB: 0.3,            // Max 300KB
    maxWidthOrHeight: 1024,    // Max 1024px
    useWebWorker: true,        // Background thread - UI nahi rukegi
    fileType: 'image/webp',    // WebP format mein convert karo
    initialQuality: 0.8,       // 80% quality (good balance)
  };

  try {
    const compressed = await imageCompression(file, options);
    console.log(`Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
    return compressed;
  } catch (err) {
    console.warn('Image compression failed, using original:', err);
    return file; // fallback: original file
  }
}
