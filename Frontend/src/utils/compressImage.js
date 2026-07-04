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
    maxSizeMB: 5,              // Max 5MB
    maxWidthOrHeight: 2048,    // Max 2048px
    useWebWorker: true,        // Background thread - UI nahi rukegi
    fileType: 'image/webp',    // WebP format mein convert karo
    initialQuality: 0.9,       // 90% quality
  };

  try {
    const compressed = await imageCompression(file, options);
    console.log(`Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
    const dotIndex = file.name.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
    const webpFile = new File([compressed], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now()
    });
    return webpFile;
  } catch (err) {
    console.warn('Image compression failed, using original:', err);
    return file; // fallback: original file
  }
}
