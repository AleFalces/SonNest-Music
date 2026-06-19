import { cloudinary } from "../config/cloudinary";

// Uploads an in-memory image (a multer buffer) to Cloudinary and returns its
// public secure_url. The buffer is wrapped in a base64 data URI so we can use
// the promise-based `upload` instead of a streaming call.
export const uploadImageService = async (file: {
  buffer: Buffer;
  mimetype: string;
}): Promise<string> => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "soundnest/products",
  });
  return result.secure_url;
};
