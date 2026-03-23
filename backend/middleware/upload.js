const { bucket } = require('../config/firebase');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Upload a single file buffer to Firebase Storage and return its public URL.
 */
const uploadBufferToFirebase = async (buffer, mimetype, folder = 'uploads') => {
  const ext = mimetype.split('/')[1] || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: mimetype,
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Make the file publicly readable
  await file.makePublic();

  // Return the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return { publicUrl, fileName };
};

/**
 * Middleware: upload a single req.file to Firebase Storage.
 * Attaches req.file.firebaseUrl and req.file.fileName.
 */
const uploadToFirebase = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const folder = 'tour-images';
    const { publicUrl, fileName } = await uploadBufferToFirebase(
      req.file.buffer,
      req.file.mimetype,
      folder
    );

    req.file.firebaseUrl = publicUrl;
    // Keep backwards-compat alias
    req.file.supabaseUrl = publicUrl;
    req.file.fileName = fileName;

    next();
  } catch (error) {
    console.error('Firebase upload error:', error);
    return next(new AppError('Error uploading image to storage', 500));
  }
});

/**
 * Middleware: upload multiple req.files to Firebase Storage.
 * Attaches req.uploadedFiles array with { url, fileName, originalName }.
 */
const uploadMultipleToFirebase = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const folder = 'tour-images';

  try {
    const uploadPromises = req.files.map(async (file) => {
      const { publicUrl, fileName } = await uploadBufferToFirebase(
        file.buffer,
        file.mimetype,
        folder
      );
      return {
        url: publicUrl,
        fileName,
        originalName: file.originalname,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    req.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error('Firebase multi-upload error:', error);
    return next(new AppError('Error uploading one or more images', 500));
  }
});

/**
 * Delete a file from Firebase Storage by its full path (fileName).
 */
const deleteFromFirebase = async (fileName) => {
  try {
    await bucket.file(fileName).delete();
    return true;
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    return false;
  }
};

// Backwards-compatible aliases (keep old names working for any existing imports)
const uploadToSupabase = uploadToFirebase;
const uploadMultipleToSupabase = uploadMultipleToFirebase;
const deleteFromSupabase = deleteFromFirebase;

module.exports = {
  uploadToFirebase,
  uploadMultipleToFirebase,
  deleteFromFirebase,
  // Aliases for backwards compatibility
  uploadToSupabase,
  uploadMultipleToSupabase,
  deleteFromSupabase,
};