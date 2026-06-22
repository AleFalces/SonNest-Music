// Builds an optimized Cloudinary delivery URL from a stored image URL.
//
// Cloudinary lets us transform on delivery by injecting params after `/upload/`,
// so we never re-upload to change the framing. We pad each instrument onto a
// fixed canvas (`c_pad,b_auto`) so the photo fills the box without cropping and
// rounded corners show, plus `f_auto,q_auto` for a much lighter WebP/AVIF.
//
// Non-Cloudinary URLs (legacy external images) are returned untouched, so the
// catalog keeps working before/while the migration runs.
export const cloudinaryImage = (
  url: string,
  width: number,
  height: number
): string => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const transform = `f_auto,q_auto,c_pad,b_auto,w_${width},h_${height}`;
  return url.replace("/upload/", `/upload/${transform}/`);
};
