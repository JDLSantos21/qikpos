// src/LabelCommand.ts
import {
  LabelCommand,
  LabelPrintRequest,
  LabelPrintRequestSchema,
} from "./types/label";

// Utilidad para convertir imágenes a Base64 (importada desde el módulo principal)
import { imageToBase64 } from "./utils";

/**
 * Clase principal para crear comandos de etiquetas ZPL
 */
class LabelPrinterCommand {
  private commands: LabelCommand[] = [];
  private width: number = 4; // 4 pulgadas por defecto
  private height: number = 6; // 6 pulgadas por defecto
  private dpi: number = 203; // 203 DPI por defecto
  private copies: number = 1; // 1 copia por defecto
  private printerName?: string;
  private pendingImagePromises: Promise<void>[] = [];

  /**
   * Constructor para crear una nueva instancia de LabelPrinterCommand
   * @param width Ancho de la etiqueta en pulgadas (por defecto 4)
   * @param height Alto de la etiqueta en pulgadas (por defecto 6)
   * @param dpi Resolución de la impresora en DPI (por defecto 203)
   * @param printerName Nombre de la impresora (opcional)
   */
  constructor(
    width?: number,
    height?: number,
    dpi?: number,
    printerName?: string
  ) {
    this.width = width ?? 4;
    this.height = height ?? 6;
    this.dpi = dpi ?? 203;
    this.printerName = printerName;
  }

  /**
   * Establece la cantidad de copias a imprimir
   * @param qty Número de copias (mínimo 1)
   * @returns La instancia actual de LabelPrinterCommand
   */
  setCopies(qty: number): LabelPrinterCommand {
    this.copies = Math.max(1, qty);
    return this;
  }

  /**
   * Establece el nombre de la impresora
   * @param name Nombre de la impresora
   * @returns La instancia actual de LabelPrinterCommand
   */
  setPrinter(name: string): LabelPrinterCommand {
    this.printerName = name;
    return this;
  }

  /**
   * Agrega texto a la etiqueta
   * @param text Texto a imprimir
   * @param x Posición X en puntos
   * @param y Posición Y en puntos
   * @param fontSize Tamaño de fuente (opcional, por defecto 20)
   * @param rotation Rotación en grados (0, 90, 180, 270)
   * @returns La instancia actual de LabelPrinterCommand
   */
  text(
    text: string,
    x: number,
    y: number,
    fontSize: number = 20,
    rotation: number = 0
  ): LabelPrinterCommand {
    this.commands.push({
      cmd: "text",
      value: text,
      x,
      y,
      fontSize,
      rotation,
    });
    return this;
  }

  /**
   * Agrega un código de barras a la etiqueta
   * @param value Valor del código de barras
   * @param x Posición X en puntos
   * @param y Posición Y en puntos
   * @param height Altura del código de barras (opcional, por defecto 50)
   * @param type Tipo de código de barras (opcional, por defecto "128")
   * @param width Ancho del código de barras (opcional, por defecto 2)
   * @returns La instancia actual de LabelPrinterCommand
   */
  barcode(
    value: string,
    x: number,
    y: number,
    height: number = 50,
    type: string = "128",
    width: number = 2
  ): LabelPrinterCommand {
    this.commands.push({
      cmd: "barcode",
      value,
      x,
      y,
      height,
      type,
      width,
    });
    return this;
  }

  /**
   * Agrega un código QR a la etiqueta
   * @param value Valor del código QR
   * @param x Posición X en puntos
   * @param y Posición Y en puntos
   * @param size Tamaño del código QR (opcional, por defecto 5)
   * @returns La instancia actual de LabelPrinterCommand
   */
  QRCode(
    value: string,
    x: number,
    y: number,
    size: number = 5
  ): LabelPrinterCommand {
    this.commands.push({
      cmd: "qrcode",
      value,
      x,
      y,
      width: size,
    });
    return this;
  }

  /**
   * Agrega una imagen a la etiqueta desde un archivo o URL
   * La imagen se convertirá automáticamente a base64
   * @param imagePath Ruta o URL de la imagen
   * @param x Posición X en puntos
   * @param y Posición Y en puntos
   * @param width Ancho de la imagen
   * @param height Alto de la imagen
   * @returns La instancia actual de LabelPrinterCommand
   */
  image(
    imagePath: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): LabelPrinterCommand {
    // Creamos un placeholder para mantener la posición
    const placeholder: LabelCommand = {
      cmd: "image",
      value: "PLACEHOLDER",
      x,
      y,
      width,
      height,
    };
    this.commands.push(placeholder);

    // Creamos una promesa que se resolverá cuando la imagen se convierta a base64
    const imagePromise = imageToBase64(imagePath)
      .then((base64: any) => {
        // Reemplazamos el placeholder con el comando real
        const index = this.commands.indexOf(placeholder);
        if (index !== -1) {
          this.commands[index] = {
            cmd: "image",
            value: base64,
            x,
            y,
            width,
            height,
          };
        }
      })
      .catch((error: any) => {
        console.error("Error processing image for label:", error);
        throw error;
      });

    // Agregamos la promesa a nuestro array de promesas pendientes
    this.pendingImagePromises.push(imagePromise);

    return this;
  }

  /**
   * Agrega una imagen a la etiqueta (directamente en formato base64)
   * @param imageBase64 Imagen en formato base64
   * @param x Posición X en puntos
   * @param y Posición Y en puntos
   * @param width Ancho de la imagen
   * @param height Alto de la imagen
   * @returns La instancia actual de LabelPrinterCommand
   */
  imageBase64(
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): LabelPrinterCommand {
    this.commands.push({
      cmd: "image",
      value: imageBase64,
      x,
      y,
      width,
      height,
    });
    return this;
  }

  /**
   * Agrega una línea a la etiqueta
   * @param x1 Posición X inicial
   * @param y1 Posición Y inicial
   * @param x2 Posición X final
   * @param y2 Posición Y final
   * @param thickness Grosor de la línea (opcional, por defecto 1)
   * @returns La instancia actual de LabelPrinterCommand
   */
  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number = 1
  ): LabelPrinterCommand {
    this.commands.push({
      cmd: "line",
      x: x1,
      y: y1,
      width: x2,
      height: y2,
      fontSize: thickness, // Usar fontSize como grosor
    });
    return this;
  }

  /**
   * Agrega un rectángulo a la etiqueta
   * @param x Posición X
   * @param y Posición Y
   * @param width Ancho del rectángulo
   * @param height Alto del rectángulo
   * @param thickness Grosor de la línea (opcional, por defecto 1)
   * @returns La instancia actual de LabelPrinterCommand
   */
  rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    thickness: number = 1
  ): LabelPrinterCommand {
    this.commands.push({
      cmd: "rectangle",
      x,
      y,
      width,
      height,
      fontSize: thickness, // Usar fontSize como grosor
    });
    return this;
  }

  /**
   * Construye la solicitud de impresión completa
   * Espera a que todas las imágenes se procesen antes de devolver el resultado
   * @returns Promise con el objeto de solicitud de impresión
   */
  async build(): Promise<LabelPrintRequest> {
    // Esperamos a que todas las imágenes se procesen
    if (this.pendingImagePromises.length > 0) {
      await Promise.all(this.pendingImagePromises);
    }

    return LabelPrintRequestSchema.parse({
      printerName: this.printerName,
      width: this.width,
      height: this.height,
      dpi: this.dpi,
      copies: this.copies,
      commands: this.commands,
    });
  }
}

export { LabelPrinterCommand };
