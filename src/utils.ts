// src/utils.ts

/**
 * Convierte una imagen desde una URL o ruta de archivo a formato base64
 * @param url URL o ruta de la imagen a convertir
 * @returns Promise con los datos de la imagen en formato base64
 */
export const imageToBase64 = async (url: string): Promise<string> => {
  // En un entorno de navegador
  if (typeof window !== "undefined") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL.split(",")[1]);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  }
  // En entorno Node.js
  else {
    try {
      // Si estamos en un entorno Node.js, usamos fs
      const fs = await import("fs").catch(() => undefined);
      if (fs) {
        const data = await fs.promises.readFile(url);
        return Buffer.from(data).toString("base64");
      }
      throw new Error("File system not available");
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  }
};
