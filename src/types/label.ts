// src/types/label.ts
import { z } from "zod";

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
