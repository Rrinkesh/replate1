import api from "./api";

export const uploadService = {
  /**
   * Upload an image file to the server
   * @param {File} file The image file to upload
   * @returns {Promise<string>} The uploaded image URL
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url;
  },
};

export default uploadService;
