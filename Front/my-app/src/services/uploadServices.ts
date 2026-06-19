import { apiServices, handleAxiosError } from "./apiServices";

// Uploads a product image to the backend, which stores it in Cloudinary and
// returns the hosted URL. The admin form then submits that URL as the product's
// `image`, so create/update stay unchanged.
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiServices.post("/products/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  } catch (error) {
    handleAxiosError(error, "Error to upload image");
  }
};
