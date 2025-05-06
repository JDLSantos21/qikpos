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

// Importar utilidades compartidas
import { imageToBase64 } from "./utils";

// Importar los módulos de etiquetas
import {
  createLabel,
  printLabel,
  printZPL,
  printRaw,
  getLabelPrinters,
  selectLabelPrinter,
  getSelectedLabelPrinter,
} from "./labelService";

import { LabelPrinterCommand } from "./LabelCommand";

import {
  LabelCommand,
  LabelPrintRequest,
  ZPLCommand,
  RawCommand,
} from "./types/label";

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

/**
 * Función para crear una nueva instancia de PrinterCommand.
 * @returns Una nueva instancia de PrinterCommand.
 */
const createInvoice = (): PrinterCommand => {
  return new PrinterCommand();
};

/**
 * Recibe un objeto de tipo PrinterCommand y lo envía al servidor de impresión.
 * @param invoice Objeto de tipo PrinterCommand que contiene los comandos de impresión.
 * @param apiUrl URL del servidor de impresión. Por defecto es "http://localhost:8080"
 * @returns Promesa que se resuelve con el resultado de la impresión
 */
const print = async (
  invoice: PrinterCommand,
  apiUrl: string = "http://localhost:8080"
): Promise<{ success: boolean; message: string }> => {
  try {
    // Construir los comandos (esperar a que se procesen las imágenes)
    const commands = await invoice.build();

    // Enviar al servidor
    const response = await fetch(`${apiUrl}/api/printer/print`, {
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

/**
 * Función para obtener la lista de impresoras disponibles.
 * @param apiUrl URL del servidor de impresión. Por defecto es "http://localhost:8080"
 * @returns Un objeto que contiene el estado de la peticion y la lista de impresoras.
 */
async function getPrinters(
  apiUrl: string = "http://localhost:8080"
): Promise<{ success: boolean; printers: string[] }> {
  try {
    const response = await fetch(`${apiUrl}/api/printer/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        printers: [],
      };
    }

    const data = await response.json();
    return {
      success: true,
      printers: data.data,
    };
  } catch (error) {
    console.error("Error fetching printers:", error);
    return {
      success: false,
      printers: [],
    };
  }
}

/**
 * Función para seleccionar una impresora específica.
 * @param printerName Nombre de la impresora a seleccionar.
 * @param apiUrl URL del servidor de impresión. Por defecto es "http://localhost:8080"
 * @returns Un objeto que contiene el estado de la peticion y el nombre de la impresora seleccionada.
 */
async function selectPrinter(
  printerName: string,
  apiUrl: string = "http://localhost:8080"
): Promise<{
  success: boolean;
  message: string;
  printer?: string;
}> {
  try {
    const response = await fetch(`${apiUrl}/api/printer/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ printerName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      printer: data.data,
    };
  } catch (error) {
    console.error("Error selecting printer:", error);
    return {
      success: false,
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Función para obtener la impresora seleccionada actualmente.
 * @param apiUrl URL del servidor de impresión. Por defecto es "http://localhost:8080"
 * @returns Un objeto que contiene el estado de la peticion y el nombre de la impresora seleccionada.
 */
async function getSelectedPrinter(
  apiUrl: string = "http://localhost:8080"
): Promise<{ success: boolean; printer?: string; message: string }> {
  try {
    const response = await fetch(`${apiUrl}/api/printer/selected`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        message: `Error: ${response.status} - ${errorText}`,
        success: false,
        printer: undefined,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      printer: data.data,
    };
  } catch (error) {
    console.error("Error fetching selected printer:", error);
    return {
      success: false,
      message: `No se pudo obtener la impresora seleccionada`,
      printer: undefined,
    };
  }
}

// Exportar todo como parte del objeto principal y también como módulos individuales
export {
  CMD,
  PrinterCommand,
  createInvoice,
  print,
  getPrinters,
  selectPrinter,
  getSelectedPrinter,
  imageToBase64,
  // Exportar también las funcionalidades de etiquetas
  createLabel,
  printLabel,
  printZPL,
  printRaw,
  getLabelPrinters,
  selectLabelPrinter,
  getSelectedLabelPrinter,
  LabelPrinterCommand,
  // Exportar tipos
  LabelCommand,
  LabelPrintRequest,
  ZPLCommand,
  RawCommand,
};

// Exportación por defecto
const QikPOS = {
  // Funcionalidades de impresora térmica ESC/POS
  createInvoice,
  print,
  getPrinters,
  selectPrinter,
  getSelectedPrinter,
  CMD,
  imageToBase64,

  // Funcionalidades de impresora de etiquetas
  Label: {
    create: createLabel,
    print: printLabel,
    printZPL,
    printRaw,
    getPrinters: getLabelPrinters,
    selectPrinter: selectLabelPrinter,
    getSelectedPrinter: getSelectedLabelPrinter,
  },
};

export default QikPOS;
