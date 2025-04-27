// src/index.ts
import { z } from "zod";
import {
  BarcodeType,
  BarcodeTypeSchema,
  CodePage,
  CodePageSchema,
  Command,
  FeedLinesSchema,
  PrintStyle,
  PrintStyleSchema,
} from "./types";

// Utilidad para convertir imágenes a Base64
const imageToBase64 = async (url: string): Promise<string> => {
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

// Clase para comandos individuales
class CMD {
  static initialize(): { cmd: Command } {
    return { cmd: "Initialize" };
  }

  static printLine(text: string): { cmd: Command; value: string } {
    return { cmd: "PrintLine", value: text };
  }

  static feedLines(qty: number): { cmd: Command; value: string } {
    // Validación con Zod
    const validQty = FeedLinesSchema.parse(qty);
    return { cmd: "FeedLines", value: String(validQty) };
  }

  static codePage(code: CodePage): { cmd: Command; value: CodePage } {
    // Validación con Zod
    const validCode = CodePageSchema.parse(code);
    return { cmd: "CodePage", value: validCode };
  }

  static printImage(
    base64: string,
    width?: number
  ): { cmd: Command; value: string; width?: number } {
    return { cmd: "PrintImage", value: base64, width };
  }

  static QRCode(value: string): { cmd: Command; value: string } {
    return { cmd: "PrintQRCode", value: value };
  }

  static barcode(
    value: string,
    type: BarcodeType
  ): { cmd: Command; value: string; type: BarcodeType } {
    // Validación con Zod
    const validType = BarcodeTypeSchema.parse(type);
    return { cmd: "PrintBarcode", value: value, type: validType };
  }

  static setStyle(style: PrintStyle): {
    cmd: Command;
    value: string;
  } {
    // Validación con Zod
    const validStyle = PrintStyleSchema.parse(style);

    let styleValue: string;
    if (Array.isArray(validStyle)) {
      styleValue = validStyle.join(", ");
    } else {
      styleValue = validStyle;
    }

    return { cmd: "SetStyles", value: styleValue };
  }

  static leftAlign(): { cmd: Command } {
    return { cmd: "LeftAlign" };
  }

  static centerAlign(): { cmd: Command } {
    return { cmd: "CenterAlign" };
  }

  static rightAlign(): { cmd: Command } {
    return { cmd: "RightAlign" };
  }

  static clear(): { cmd: Command } {
    return { cmd: "Clear" };
  }

  static fullCut(): { cmd: Command } {
    return { cmd: "FullCut" };
  }
}

// Clase principal para crear una secuencia de comandos de impresión
class PrinterCommand {
  private commands: any[] = [];
  private pendingImagePromises: Promise<void>[] = [];

  initialize(): PrinterCommand {
    this.commands.push(CMD.initialize());
    return this;
  }

  text(text: string): PrinterCommand {
    this.commands.push(CMD.printLine(text));
    return this;
  }

  feed(qty: number): PrinterCommand {
    this.commands.push(CMD.feedLines(qty));
    return this;
  }

  codePage(code: CodePage): PrinterCommand {
    this.commands.push(CMD.codePage(code));
    return this;
  }

  image(imagePath: string, width?: number): PrinterCommand {
    // Creamos un placeholder para mantener la posición
    const placeholder = { cmd: "PrintImage", value: "PLACEHOLDER", width };
    this.commands.push(placeholder);

    // Creamos una promesa que se resolverá cuando la imagen se convierta a base64
    const imagePromise = imageToBase64(imagePath)
      .then((base64) => {
        // Reemplazamos el placeholder con el comando real
        const index = this.commands.indexOf(placeholder);
        if (index !== -1) {
          this.commands[index] = CMD.printImage(base64, width);
        }
      })
      .catch((error) => {
        console.error("Error processing image:", error);
        throw error;
      });

    // Agregamos la promesa a nuestro array de promesas pendientes
    this.pendingImagePromises.push(imagePromise);

    return this;
  }

  QRCode(value: string): PrinterCommand {
    this.commands.push(CMD.QRCode(value));
    return this;
  }

  barcode(value: string, type: BarcodeType): PrinterCommand {
    this.commands.push(CMD.barcode(value, type));
    return this;
  }

  textStyle(style: PrintStyle): PrinterCommand {
    this.commands.push(CMD.setStyle(style));
    return this;
  }

  left(): PrinterCommand {
    this.commands.push(CMD.leftAlign());
    return this;
  }

  center(): PrinterCommand {
    this.commands.push(CMD.centerAlign());
    return this;
  }

  right(): PrinterCommand {
    this.commands.push(CMD.rightAlign());
    return this;
  }

  clear(): PrinterCommand {
    this.commands.push(CMD.clear());
    return this;
  }

  fullCut(): PrinterCommand {
    this.commands.push(CMD.fullCut());
    return this;
  }

  async build(): Promise<any[]> {
    // Esperamos a que todas las imágenes se procesen
    if (this.pendingImagePromises.length > 0) {
      await Promise.all(this.pendingImagePromises);
    }
    return this.commands;
  }
}

// Funciones principales para crear y enviar impresiones
const createInvoice = (): PrinterCommand => {
  return new PrinterCommand();
};

const print = async (
  invoice: PrinterCommand,
  endpoint: string = "http://localhost:8080/api/printer/print"
): Promise<{ success: boolean; message: string }> => {
  try {
    // Construir los comandos (esperar a que se procesen las imágenes)
    const commands = await invoice.build();

    // Enviar al servidor
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Error: ${response.status} - ${errorText}`,
      };
    }

    return {
      success: true,
      message: "Print job sent successfully",
    };
  } catch (error) {
    console.error("Error sending print commands:", error);
    return {
      success: false,
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

// Exportar todo como parte del objeto principal y también como módulos individuales
export { CMD, PrinterCommand, createInvoice, print };

// Exportación por defecto
const QikPOS = {
  createInvoice,
  print,
  CMD,
};

export default QikPOS;
