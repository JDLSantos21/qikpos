// src/LabelCommand.ts
import { BarcodeType } from "./types";
import {
  LabelCommand,
  LabelPrintRequest,
  LabelPrintRequestSchema,
  BarcodeOptions,
  BarcodeOptionsSchema,
  BarcodeTypes,
  TextCommand,
} from "./types/label";

// Utilidad para convertir imágenes a Base64 (importada desde el módulo principal)
import { imageToBase64 } from "./utils";

/**
 * TIPOS DE CÓDIGOS DE BARRAS SOPORTADOS:
 *
 * "128" - Code 128: Código de barras de alta densidad que puede codificar todos los caracteres ASCII
 * "39" - Code 39: Código alfanumérico ampliamente usado en industria
 * "EAN13" - EAN-13: Estándar internacional para códigos de productos (13 dígitos)
 * "EAN8" - EAN-8: Versión corta de EAN para productos pequeños (8 dígitos)
 * "UPCA" - UPC-A: Estándar americano para códigos de productos (12 dígitos)
 * "UPCE" - UPC-E: Versión compacta de UPC-A (8 dígitos)
 * "I25" - Interleaved 2 of 5: Código numérico de alta densidad
 * "93" - Code 93: Evolución del Code 39 con mayor densidad
 * "AZTEC" - Aztec Code: Código 2D de alta capacidad
 * "DATAMATRIX" - Data Matrix: Código 2D compacto
 * "PDF417" - PDF417: Código de barras 2D de alta capacidad
 *
 * PARÁMETROS DE ORIENTACIÓN:
 * "N" - Normal (0°)
 * "R" - Rotado 90° (Right)
 * "I" - Invertido 180° (Inverted)
 * "B" - Rotado 270° (Bottom)
 *
 * MODOS DE CODIFICACIÓN (Code 128):
 * "N" - Numérico: Solo números (más eficiente para datos numéricos)
 * "U" - Mayúsculas: Letras mayúsculas y números
 * "A" - ASCII: Todos los caracteres ASCII (por defecto)
 * "D" - UCC/EAN: Formato UCC/EAN específico
 */

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
   *
   * @param rotation Rotación en grados (0, 90, 180, 270)
   * @param orientation Orientación del texto ("N", "R", "I", "B")
   * @returns La instancia actual de LabelPrinterCommand
   */
  text(options: TextCommand): LabelPrinterCommand {
    this.commands.push({
      cmd: "text",
      value: options.value,
      x: options.x,
      y: options.y,
      fontSize: options.fontSize,
      rotation: options.rotation,
      orientation: options.orientation,
      fontWidth: options.fontWidth,
    });
    return this;
  }

  /**
   * Agrega un código de barras a la etiqueta
   *
   * @example
   * // Usando objeto (recomendado)
   * label.barcode({
   *   value: "123456789",
   *   x: 100,
   *   y: 100,
   *   height: 60,
   *   type: "128",
   *   orientation: "R",
   *   printText: false
   * });
   *
   * // Usando parámetros individuales (compatibilidad hacia atrás)
   * label.barcode("123456789", 100, 100, 60, "128", 2, "R", false);
   */
  barcode(
    optionsOrValue: BarcodeOptions | string,
    x?: number,
    y?: number,
    height?: number,
    type?: BarcodeTypes,
    width?: number,
    orientation?: "N" | "R" | "I" | "B",
    printText?: boolean,
    textAbove?: boolean,
    checkDigit?: boolean,
    mode?: "N" | "U" | "A" | "D"
  ): LabelPrinterCommand {
    let options: BarcodeOptions;

    // Si el primer parámetro es un string, usamos la firma legacy
    if (typeof optionsOrValue === "string") {
      options = {
        value: optionsOrValue,
        x: x!,
        y: y!,
        height: height ?? 50,
        type: type ?? "128",
        width: width ?? 2,
        orientation: orientation ?? "N",
        printText: printText ?? true,
        textAbove: textAbove ?? false,
        checkDigit: checkDigit ?? false,
        mode: mode ?? "A",
      };
    } else {
      // Validamos y aplicamos valores por defecto usando el schema
      options = BarcodeOptionsSchema.parse(optionsOrValue);
    }

    this.commands.push({
      cmd: "barcode",
      value: options.value,
      x: options.x,
      y: options.y,
      height: options.height,
      type: options.type,
      width: options.width,
      orientation: options.orientation,
      printText: options.printText,
      textAbove: options.textAbove,
      checkDigit: options.checkDigit,
      mode: options.mode,
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

    // Filtrar comandos duplicados de códigos de barras con el mismo valor y posición
    const filteredCommands: LabelCommand[] = [];
    const seenBarcodes = new Set<string>();

    for (const command of this.commands) {
      if (command.cmd === "barcode") {
        // Crear una clave única para el código de barras basada en valor, x, y
        const barcodeKey = `${command.value}-${command.x}-${command.y}`;

        if (!seenBarcodes.has(barcodeKey)) {
          seenBarcodes.add(barcodeKey);
          filteredCommands.push(command);
        }
        // Si ya existe, lo omitimos (es un duplicado)
      } else {
        // Para todos los demás comandos, los incluimos sin filtrar
        filteredCommands.push(command);
      }
    }

    return LabelPrintRequestSchema.parse({
      printerName: this.printerName,
      width: this.width,
      height: this.height,
      dpi: this.dpi,
      copies: this.copies,
      commands: filteredCommands,
    });
  }
}

export { LabelPrinterCommand };
