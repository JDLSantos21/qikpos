// src/types/label.ts
import { z } from "zod";

export type BarcodeTypes = "128" | "39" | "EAN13" | "EAN8" | "UPCA" | "UPCE";

// Interfaz para las opciones del código de barras
export interface BarcodeOptions {
  /** Valor del código de barras */
  value: string;
  /** Posición X en puntos */
  x: number;
  /** Posición Y en puntos */
  y: number;
  /** Altura del código de barras (por defecto 50) */
  height?: number;
  /** Tipo de código de barras (por defecto "128") */
  type?: BarcodeTypes;
  /** Ancho del código de barras (por defecto 2) */
  width?: number;
  /** Rotación del código: "N"=Normal, "R"=90°, "I"=180°, "B"=270° (por defecto "N") */
  orientation?: "N" | "R" | "I" | "B";
  /** Mostrar texto legible del código de barras (por defecto true) */
  printText?: boolean;
  /** Posición del texto: true=arriba, false=abajo (por defecto false) */
  textAbove?: boolean;
  /** Calcular dígito de verificación automáticamente (por defecto false) */
  checkDigit?: boolean;
  /** Modo de codificación para Code 128: "N"=Numérico, "U"=Mayúsculas, "A"=ASCII, "D"=UCC/EAN (por defecto "A") */
  mode?: "N" | "U" | "A" | "D";
}

export interface TextCommand {
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  // NUEVAS PROPIEDADES A AGREGAR:
  font?:
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F"
    | "G"
    | "H";
  fontWidth?: number; // Ancho específico del texto
  orientation?: "N" | "R" | "I" | "B"; // Orientación directa ZPL
  // MANTENER PARA RETROCOMPATIBILIDAD:
  rotation?: 0 | 90 | 180 | 270;
}

// Esquema Zod para validación de opciones de código de barras
export const BarcodeOptionsSchema = z.object({
  value: z.string(),
  x: z.number(),
  y: z.number(),
  height: z.number().optional().default(50),
  type: z
    .enum(["128", "39", "EAN13", "EAN8", "UPCA", "UPCE"])
    .optional()
    .default("128"),
  width: z.number().optional().default(2),
  orientation: z.enum(["N", "R", "I", "B"]).optional().default("N"),
  printText: z.boolean().optional().default(true),
  textAbove: z.boolean().optional().default(false),
  checkDigit: z.boolean().optional().default(false),
  mode: z.enum(["N", "U", "A", "D"]).optional().default("A"),
});

// Tipos básicos para comandos de etiquetas
export type LabelCommand = {
  cmd: string;
  value?: string;
  type?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  fontSize?: number;
  rotation?: number;
  orientation?: "N" | "R" | "I" | "B"; // Rotación
  printText?: boolean; // Mostrar texto legible
  textAbove?: boolean; // Texto arriba o abajo
  checkDigit?: boolean; // Calcular dígito de verificación
  mode?: "N" | "U" | "A" | "D"; // Modo de codificación para Code 128
  fontWidth?: number; // Ancho específico del texto
};

// Esquema Zod para validación de comandos de etiquetas
export const LabelCommandSchema = z.object({
  cmd: z.string(),
  value: z.string().optional(),
  type: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  fontSize: z.number().optional(),
  rotation: z.number().optional(),
  // Nuevas propiedades para códigos de barras
  orientation: z.enum(["N", "R", "I", "B"]).optional(),
  printText: z.boolean().optional(),
  textAbove: z.boolean().optional(),
  checkDigit: z.boolean().optional(),
  mode: z.enum(["N", "U", "A", "D"]).optional(),
  fontWidth: z.number().optional(),
});

// Esquema para validar la solicitud de impresión de etiquetas
export const LabelPrintRequestSchema = z.object({
  printerName: z.string().optional(),
  width: z.number().default(4), // Ancho por defecto 4 pulgadas
  height: z.number().default(6), // Alto por defecto 6 pulgadas
  dpi: z.number().default(203), // DPI por defecto 203
  copies: z.number().min(1).default(1), // Al menos 1 copia
  commands: z.array(LabelCommandSchema),
});

// Tipo para la solicitud de impresión de etiquetas
export type LabelPrintRequest = z.infer<typeof LabelPrintRequestSchema>;

// Tipos específicos para comandos ZPL directos
export const ZPLCommandSchema = z.object({
  zpl: z.string(),
  printerName: z.string().optional(),
  copies: z.number().min(1).default(1),
});

export type ZPLCommand = z.infer<typeof ZPLCommandSchema>;

// Tipos para comandos raw (datos binarios en base64)
export const RawCommandSchema = z.object({
  data: z.string(), // Datos en base64
  printerName: z.string().optional(),
  copies: z.number().min(1).default(1),
});

export type RawCommand = z.infer<typeof RawCommandSchema>;
