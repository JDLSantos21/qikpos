// src/types/index.ts
import { z } from "zod";

export type CodePage =
  | "PC437_USA_STANDARD_EUROPE_DEFAULT"
  | "KATAKANA"
  | "PC850_MULTILINGUAL"
  | "PC860_PORTUGUESE"
  | "PC863_CANADIAN_FRENCH"
  | "PC865_NORDIC"
  | "HIRAGANA"
  | "ONE_PASS_KANJI"
  | "ONE_PASS_KANJI2"
  | "PC851_GREEK"
  | "PC853_TURKISH"
  | "PC857_TURKISH"
  | "PC737_GREEK"
  | "ISO8859_7_GREEK"
  | "WPC1252"
  | "PC866_CYRILLIC2"
  | "PC852_LATIN2"
  | "PC858_EURO"
  | "KU42_THAI"
  | "TIS11_THAI"
  | "TIS13_THAI"
  | "TIS14_THAI"
  | "TIS16_THAI"
  | "TIS17_THAI"
  | "TIS18_THAI"
  | "TCVN3_VIETNAMESE_L"
  | "TCVN3_VIETNAMESE_U"
  | "PC720_ARABIC"
  | "WPC775_BALTIC_RIM"
  | "PC855_CYRILLIC"
  | "PC861_ICELANDIC"
  | "PC862_HEBREW"
  | "PC864_ARABIC"
  | "PC869_GREEK"
  | "ISO8859_2_LATIN2"
  | "ISO8859_15_LATIN9"
  | "PC1098_FARSI"
  | "PC1118_LITHUANIAN"
  | "PC1119_LITHUANIAN"
  | "PC1125_UKRANIAN"
  | "WPC1250_LATIN2"
  | "WPC1251_CYRILLIC"
  | "WPC1253_GREEK"
  | "WPC1254_TURKISH"
  | "WPC1255_HEBREW"
  | "WPC1256_ARABIC"
  | "WPC1257_BALTIC_RIM"
  | "WPC1258_VIETNAMESE"
  | "KZ1048_KAZAKHSTAN"
  | "DEVANAGARI"
  | "BENGALI"
  | "TAMIL"
  | "TELUGU"
  | "ASSAMESE"
  | "ORIYA"
  | "KANNADA"
  | "MALAYALAM"
  | "GUJARATI"
  | "PUNJABI"
  | "MARATHI";

export type Command =
  | "Initialize"
  | "PrintLine"
  | "CodePage"
  | "SetStyles"
  | "PrintQRCode"
  | "PrintBarcode"
  | "FeedLines"
  | "LeftAlign"
  | "CenterAlign"
  | "RightAlign"
  | "Clear"
  | "FullCut"
  | "PrintImage";

export type PrintImageCommand = {
  cmd: "PrintImage";
  value: string;
  width?: number;
};

export type BarcodeType =
  | "UPC_A"
  | "UPC_E"
  | "JAN13_EAN13"
  | "JAN8_EAN8"
  | "CODE39"
  | "ITF"
  | "CODABAR_NW_7"
  | "CODE93"
  | "CODE128"
  | "GS1_128"
  | "GS1_DATABAR_OMNIDIRECTIONAL"
  | "GS1_DATABAR_TRUNCATED"
  | "GS1_DATABAR_LIMITED"
  | "GS1_DATABAR_EXPANDED";

export type PrintStyleOption =
  | "None"
  | "FontB"
  | "Proportional"
  | "Condensed"
  | "Bold"
  | "DoubleHeight"
  | "DoubleWidth"
  | "Italic"
  | "Underline";

export type PrintStyle = PrintStyleOption | PrintStyleOption[];

// Esquemas Zod para validación
export const PrintStyleOptionSchema = z.enum([
  "None",
  "FontB",
  "Proportional",
  "Condensed",
  "Bold",
  "DoubleHeight",
  "DoubleWidth",
  "Italic",
  "Underline",
]);

export const PrintStyleSchema = z.union([
  PrintStyleOptionSchema,
  z.array(PrintStyleOptionSchema),
]);

export const CodePageSchema = z.enum([
  "PC437_USA_STANDARD_EUROPE_DEFAULT",
  "KATAKANA",
  "PC850_MULTILINGUAL",
  "PC860_PORTUGUESE",
  "PC863_CANADIAN_FRENCH",
  "PC865_NORDIC",
  "HIRAGANA",
  "ONE_PASS_KANJI",
  "ONE_PASS_KANJI2",
  "PC851_GREEK",
  "PC853_TURKISH",
  "PC857_TURKISH",
  "PC737_GREEK",
  "ISO8859_7_GREEK",
  "WPC1252",
  "PC866_CYRILLIC2",
  "PC852_LATIN2",
  "PC858_EURO",
  "KU42_THAI",
  "TIS11_THAI",
  "TIS13_THAI",
  "TIS14_THAI",
  "TIS16_THAI",
  "TIS17_THAI",
  "TIS18_THAI",
  "TCVN3_VIETNAMESE_L",
  "TCVN3_VIETNAMESE_U",
  "PC720_ARABIC",
  "WPC775_BALTIC_RIM",
  "PC855_CYRILLIC",
  "PC861_ICELANDIC",
  "PC862_HEBREW",
  "PC864_ARABIC",
  "PC869_GREEK",
  "ISO8859_2_LATIN2",
  "ISO8859_15_LATIN9",
  "PC1098_FARSI",
  "PC1118_LITHUANIAN",
  "PC1119_LITHUANIAN",
  "PC1125_UKRANIAN",
  "WPC1250_LATIN2",
  "WPC1251_CYRILLIC",
  "WPC1253_GREEK",
  "WPC1254_TURKISH",
  "WPC1255_HEBREW",
  "WPC1256_ARABIC",
  "WPC1257_BALTIC_RIM",
  "WPC1258_VIETNAMESE",
  "KZ1048_KAZAKHSTAN",
  "DEVANAGARI",
  "BENGALI",
  "TAMIL",
  "TELUGU",
  "ASSAMESE",
  "ORIYA",
  "KANNADA",
  "MALAYALAM",
  "GUJARATI",
  "PUNJABI",
  "MARATHI",
]);

export const BarcodeTypeSchema = z.enum([
  "UPC_A",
  "UPC_E",
  "JAN13_EAN13",
  "JAN8_EAN8",
  "CODE39",
  "ITF",
  "CODABAR_NW_7",
  "CODE93",
  "CODE128",
  "GS1_128",
  "GS1_DATABAR_OMNIDIRECTIONAL",
  "GS1_DATABAR_TRUNCATED",
  "GS1_DATABAR_LIMITED",
  "GS1_DATABAR_EXPANDED",
]);

export const FeedLinesSchema = z.number().min(1).max(10);
