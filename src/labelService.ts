// src/labelService.ts
import {
  LabelPrintRequest,
  ZPLCommand,
  ZPLCommandSchema,
  RawCommand,
  RawCommandSchema,
} from "./types/label";
import { LabelPrinterCommand } from "./LabelCommand";
import { imageToBase64 } from "./utils";

/**
 * Crea una nueva instancia de LabelPrinterCommand para construir una etiqueta
 * @param width Ancho de la etiqueta en pulgadas (por defecto 4)
 * @param height Alto de la etiqueta en pulgadas (por defecto 6)
 * @param dpi Resolución de la impresora en DPI (por defecto 203)
 * @param printerName Nombre de la impresora (opcional)
 * @returns Una nueva instancia de LabelPrinterCommand
 */
const createLabel = (
  width?: number,
  height?: number,
  dpi?: number,
  printerName?: string
): LabelPrinterCommand => {
  return new LabelPrinterCommand(width, height, dpi, printerName);
};

/**
 * Envía una solicitud de impresión de etiqueta al servidor
 * @param label Objeto LabelPrinterCommand o LabelPrintRequest con los comandos de etiqueta
 * @param apiUrl URL del servidor de impresión. Por defecto "http://localhost:5003"
 * @returns Promesa que se resuelve con el resultado de la impresión
 */
const printLabel = async (
  label: LabelPrinterCommand | LabelPrintRequest,
  apiUrl: string = "http://localhost:5003"
): Promise<{ success: boolean; message: string }> => {
  try {
    // Si es LabelPrinterCommand, construir la solicitud
    const printRequest =
      label instanceof LabelPrinterCommand ? await label.build() : label;

    // Enviar la solicitud al servidor
    const response = await fetch(`${apiUrl}/api/labelprinter/print/label`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printRequest),
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
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error("Error enviando comandos de etiqueta:", error);
    return {
      success: false,
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * Imprime código ZPL directamente
 * @param zplCode Código ZPL a imprimir
 * @param printerName Nombre de la impresora (opcional)
 * @param copies Número de copias (por defecto 1)
 * @param apiUrl URL del servidor de impresión. Por defecto "http://localhost:5003"
 * @returns Promesa que se resuelve con el resultado de la impresión
 */
const printZPL = async (
  zplCode: string,
  printerName?: string,
  copies: number = 1,
  apiUrl: string = "http://localhost:5003"
): Promise<{ success: boolean; message: string }> => {
  try {
    const command = ZPLCommandSchema.parse({
      zpl: zplCode,
      printerName,
      copies: Math.max(1, copies),
    });

    const response = await fetch(`${apiUrl}/api/labelprinter/print/zpl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
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
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error("Error enviando código ZPL:", error);
    return {
      success: false,
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * Imprime datos raw (binarios) directamente
 * @param rawData Datos en formato base64
 * @param printerName Nombre de la impresora (opcional)
 * @param copies Número de copias (por defecto 1)
 * @param apiUrl URL del servidor de impresión. Por defecto "http://localhost:5003"
 * @returns Promesa que se resuelve con el resultado de la impresión
 */
const printRaw = async (
  rawData: string,
  printerName?: string,
  copies: number = 1,
  apiUrl: string = "http://localhost:5003"
): Promise<{ success: boolean; message: string }> => {
  try {
    const command = RawCommandSchema.parse({
      data: rawData,
      printerName,
      copies: Math.max(1, copies),
    });

    const response = await fetch(`${apiUrl}/api/labelprinter/print/raw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
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
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error("Error enviando datos raw:", error);
    return {
      success: false,
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * Obtiene la lista de impresoras de etiquetas disponibles
 * @param apiUrl URL del servidor de impresión. Por defecto "http://localhost:5003"
 * @returns Promesa que se resuelve con la lista de impresoras
 */
const getLabelPrinters = async (
  apiUrl: string = "http://localhost:5003"
): Promise<{ success: boolean; printers: string[] }> => {
  try {
    const response = await fetch(`${apiUrl}/api/labelprinter/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        printers: [],
      };
    }

    const data = await response.json();
    return {
      success: data.success,
      printers: data.data || [],
    };
  } catch (error) {
    console.error("Error obteniendo impresoras de etiquetas:", error);
    return {
      success: false,
      printers: [],
    };
  }
};

/**
 * Selecciona una impresora de etiquetas como predeterminada
 * @param printerName Nombre de la impresora a seleccionar
 * @param apiUrl URL del servidor de impresión. Por defecto "http://localhost:5003"
 * @returns Promesa que se resuelve con el resultado de la selección
 */
const selectLabelPrinter = async (
  printerName: string,
  apiUrl: string = "http://localhost:5003"
): Promise<{ success: boolean; message: string; printer?: string }> => {
  try {
    const response = await fetch(`${apiUrl}/api/labelprinter/select`, {
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
      success: data.success,
      message: data.message,
      printer: data.data,
    };
  } catch (error) {
    console.error("Error seleccionando impresora de etiquetas:", error);
    return {
      success: false,
      message: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * Obtiene la impresora de etiquetas seleccionada actualmente
 * @param apiUrl URL del servidor de impresión. Por defecto "http://localhost:5003"
 * @returns Promesa que se resuelve con la impresora seleccionada
 */
const getSelectedLabelPrinter = async (
  apiUrl: string = "http://localhost:5003"
): Promise<{ success: boolean; printer?: string; message: string }> => {
  try {
    const response = await fetch(`${apiUrl}/api/labelprinter/selected`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Error: ${response.status} - ${errorText}`,
        printer: undefined,
      };
    }

    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
      printer: data.data,
    };
  } catch (error) {
    console.error(
      "Error obteniendo impresora de etiquetas seleccionada:",
      error
    );
    return {
      success: false,
      message: `No se pudo obtener la impresora de etiquetas seleccionada`,
      printer: undefined,
    };
  }
};

export {
  createLabel,
  printLabel,
  printZPL,
  printRaw,
  getLabelPrinters,
  selectLabelPrinter,
  getSelectedLabelPrinter,
};
