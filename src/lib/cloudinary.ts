import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
) => {
  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop: 'fill',
        quality,
        fetch_format: format,
      }
    ]
  });
};

// Helper function to generate upload signature
export const generateUploadSignature = (
  params: Record<string, string | number>
) => {
  return cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );
};

// Upload preset for frontend uploads
// Use ml_default (Cloudinary's default unsigned preset) or create your own
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmpjc496u'}/image/upload`; 