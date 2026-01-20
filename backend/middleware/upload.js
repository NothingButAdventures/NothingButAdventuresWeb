const { supabase } = require('../config/supabase');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const uploadToSupabase = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${req.file.originalname.split('.').pop()}`;
  const bucketName = 'tour-images'; // You'll need to create this bucket in Supabase

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      return next(new AppError('Error uploading image to storage', 500));
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    req.file.supabaseUrl = urlData.publicUrl;
    req.file.fileName = fileName;

    next();
  } catch (error) {
    return next(new AppError('Error uploading image', 500));
  }
});

const uploadMultipleToSupabase = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const bucketName = 'tour-images';
  const uploadPromises = req.files.map(async (file) => {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`;
    
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw new Error('Upload failed');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        fileName: fileName,
        originalName: file.originalname
      };
    } catch (error) {
      throw new Error(`Failed to upload ${file.originalname}`);
    }
  });

  try {
    const uploadedFiles = await Promise.all(uploadPromises);
    req.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    return next(new AppError('Error uploading one or more images', 500));
  }
});

const deleteFromSupabase = async (fileName, bucketName = 'tour-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error('Delete failed');
    }

    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    return false;
  }
};

module.exports = {
  uploadToSupabase,
  uploadMultipleToSupabase,
  deleteFromSupabase
};