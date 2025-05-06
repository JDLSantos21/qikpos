examples / labelExample.ts;
import {
  createLabel,
  printLabel,
  getLabelPrinters,
  selectLabelPrinter,
  getSelectedLabelPrinter,
  printZPL,
} from "../src/index";

// const { createLabel, printLabel, getLabelPrinters, selectLabelPrinter, } = require("../src/index");

// Ejemplo 1: Crear una etiqueta simple con texto y un código QR
async function example1() {
  console.log("Ejemplo 1: Crear una etiqueta simple con texto y un código QR");

  // Creamos la etiqueta (2 pulgadas x 1 pulgada, 300 DPI)
  const label = createLabel(2, 1, 300);

  // Agregamos contenido a la etiqueta
  label
    .text("Llenado de Botellon", 190, 40, 35) // Texto principal
    .QRCode("https://ejemplo.com/producto/123456", 430, 85, 4) // Código QR
    .text("03 Mayo 2025", 430, 210, 30) // Fecha
    .text("02:47 P.M.", 430, 245, 30) // Hora
    .text("001", 230, 110, 100) // Número grande
    .text("Cant.: 50", 230, 210, 45); // Cantidad

  // Para imprimir la etiqueta:
  const result = await printLabel(label);
  console.log(result);

  return result;
  // En su lugar, solo mostramos el objeto de solicitud para el ejemplo
  console.log(JSON.stringify(label.build(), null, 2));
}

// Ejemplo 2: Imprimir una etiqueta con imagen, texto y forma geométrica
async function example2() {
  console.log(
    "\nEjemplo 2: Imprimir una etiqueta con imagen y forma geométrica"
  );

  // Primero verificamos y seleccionamos una impresora disponible
  const printersResult = await getLabelPrinters();

  if (!printersResult.success || printersResult.printers.length === 0) {
    console.log("No se encontraron impresoras de etiquetas disponibles");
    return;
  }

  console.log("Impresoras disponibles:", printersResult.printers);

  // Seleccionamos la primera impresora por simplicidad
  const selectedPrinter = printersResult.printers[0];
  const selectionResult = await selectLabelPrinter(selectedPrinter);

  if (!selectionResult.success) {
    console.log("Error al seleccionar la impresora:", selectionResult.message);
    return;
  }

  console.log("Impresora seleccionada:", selectionResult.printer);

  // Creamos una etiqueta más compleja (4x3 pulgadas, 203 DPI)
  const label = createLabel(4, 3, 203, selectedPrinter)
    // Agregamos un rectángulo como borde
    .rectangle(10, 10, 785, 585, 2)
    // Título
    .text("ETIQUETA DE PRODUCTO", 400, 50, 40)
    // Información del producto
    .text("Descripción:", 50, 120, 25)
    .text("Agua Purificada Premium", 200, 120, 25)
    .text("SKU:", 50, 170, 25)
    .text("WTR-001-20L", 200, 170, 25)
    .text("Fecha:", 50, 220, 25)
    .text("03/05/2025", 200, 220, 25)
    // Código de barras
    .barcode("12345678901", 200, 270, 100, "CODE128", 3)
    // Línea separadora
    .line(50, 400, 750, 400, 1)
    // Texto adicional
    .text("Producto de Calidad", 400, 450, 30)
    .text("Conservar en lugar fresco", 400, 500, 20)
    // Logo (aquí usaríamos una imagen en base64)
    // En un caso real, cargarías la imagen desde un archivo
    .image(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      50,
      450,
      100,
      100
    );

  // Establecemos 2 copias
  label.setCopies(2);

  // Para imprimir realmente la etiqueta, descomenta la siguiente línea:
  // const printResult = await printLabel(label);
  // console.log("Resultado de impresión:", printResult);

  // En su lugar, solo mostramos el objeto de solicitud para el ejemplo
  console.log(JSON.stringify(label.build(), null, 2));
}

// Ejemplo 3: Imprimir código ZPL directo
async function example3() {
  console.log("\nEjemplo 3: Imprimir código ZPL directo");

  // Verificamos la impresora seleccionada
  const selectedPrinterResult = await getSelectedLabelPrinter();

  if (!selectedPrinterResult.success || !selectedPrinterResult.printer) {
    console.log(
      "No hay impresora seleccionada:",
      selectedPrinterResult.message
    );
    return;
  }

  console.log("Impresora actual:", selectedPrinterResult.printer);

  // Código ZPL directo para imprimir una etiqueta simple
  const zplCode = `^XA
^FO50,50^ADN,36,20^FDEjemplo de ZPL Directo^FS
^FO50,100^BY3^BCN,100,Y,N,N^FD12345678^FS
^FO50,230^ADN,36,20^FDQikPOS - Impresión ZPL^FS
^XZ`;

  console.log("Código ZPL a imprimir:");
  console.log(zplCode);

  // Para imprimir realmente, descomenta:
  // const printResult = await printZPL(zplCode);
  // console.log("Resultado de impresión:", printResult);
}

// Ejecutar los ejemplos secuencialmente
export async function runExamples() {
  try {
    await example1();
    // await example2();
    // await example3();
    console.log("\nEjemplos completados!");
  } catch (error) {
    console.error("Error al ejecutar ejemplos:", error);
  }
}

// Descomentar para ejecutar los ejemplos
runExamples();
