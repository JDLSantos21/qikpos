# QikPOS - Librería Complementaria JavaScript/TypeScript para Impresión POS y ZPL

[![npm version](https://badge.fury.io/js/qikpos.svg)](https://badge.fury.io/js/qikpos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Una librería rápida y moderna para impresión POS y ZPL que incluye soporte completo para impresoras térmicas ESC/POS e impresoras de etiquetas ZPL.

### OJO: Esta es una libreria que sirve de intermediario entre Typescript/Javascript a través del plugin Qikpos para enviar comandos POS y ZPL a impresoras térmicas y de etiquetas, respectivamente.

## 🚀 Características

- ✅ **Impresoras Térmicas ESC/POS**: Comandos completos para tickets, facturas y recibos.
- ✅ **Impresoras de Etiquetas ZPL**: Soporte completo para etiquetas con códigos de barras, QR, etc..
- ✅ **Códigos de Barras Avanzados**: Nueva sintaxis con objeto + compatibilidad legacy
- ✅ **TypeScript**: Soporte completo con tipos e intellisense
- ✅ **Multi-entorno**: Funciona en Node.js y navegadores
- ✅ **Validación**: Validación automática con Zod

## 📦 Instalación

```bash
npm install qikpos@latest
```

## 🔥 Nuevo en v1.1.0 - Códigos de Barras Mejorados

### Nueva Sintaxis con Objeto (Recomendada)

```typescript
import { createLabel } from "qikpos";

const label = createLabel(4, 6, 203);

// ✨ Nueva sintaxis - más limpia y legible
label.barcode({
  value: "123456789",
  x: 100,
  y: 100,
  height: 60,
  type: "128",
  orientation: "R", // Rotado 90°
  printText: false, // Sin texto visible
  mode: "N", // Modo numérico optimizado
});
```

### Compatibilidad Total hacia Atrás

```typescript
// ✅ Sintaxis legacy sigue funcionando
label.barcode("123456789", 100, 100, 60, "128", 2, "R", false);

// ✅ Nueva sintaxis con objeto
label.barcode({
  value: "123456789",
  x: 100,
  y: 100,
  height: 60,
  orientation: "R",
  printText: false,
});
```

## 📋 Tipos de Códigos de Barras Soportados

| Tipo    | Descripción            | Uso Común                       |
| ------- | ---------------------- | ------------------------------- |
| `128`   | Code 128 (por defecto) | General, alta densidad          |
| `39`    | Code 39                | Industrial, alfanumérico        |
| `EAN13` | EAN-13                 | Productos retail (13 dígitos)   |
| `EAN8`  | EAN-8                  | Productos pequeños (8 dígitos)  |
| `UPCA`  | UPC-A                  | Estándar americano (12 dígitos) |
| `UPCE`  | UPC-E                  | UPC compacto (8 dígitos)        |
| `I25`   | Interleaved 2 of 5     | Logística, numérico             |
| `93`    | Code 93                | Evolución del Code 39           |

## 🎯 Guía Rápida

### Impresoras Térmicas ESC/POS

```typescript
import QikPOS from "qikpos";

// Crear una factura
const invoice = QikPOS.createInvoice()
  .codePage("WPC1252")
  .center()
  .image("/logo.png", 130)
  .feed(1)
  .text("MI TIENDA")
  .feed(1)
  .left()
  .text("Producto 1 ........... $10.00")
  .text("Producto 2 ........... $15.00")
  .feed(1)
  .textStyle(["Bold"])
  .text("TOTAL: $25.00")
  .cut();

// Imprimir
await QikPOS.print(invoice);
```

### Impresoras de Etiquetas ZPL

```typescript
import { createLabel, printLabel } from "qikpos";

// Crear etiqueta
const label = createLabel(4, 6, 203)
  .text("PRODUCTO ABC", 50, 50, 30)
  .barcode({
    value: "1234567890123",
    x: 50,
    y: 100,
    type: "EAN13",
    height: 70,
  })
  .QRCode("https://mitienda.com/producto/123", 200, 200, 5);

// Imprimir
await printLabel(label);
```

## 🔧 Parámetros de Códigos de Barras

### Orientación

- `"N"` - Normal (0°) - **Por defecto**
- `"R"` - Rotado 90°
- `"I"` - Invertido 180°
- `"B"` - Rotado 270°

### Modos de Codificación (Code 128)

- `"A"` - ASCII completo - **Por defecto**
- `"N"` - Solo números (optimizado)
- `"U"` - Mayúsculas y números
- `"D"` - Formato UCC/EAN

## 🧪 Ejemplos Avanzados

### Etiqueta de Producto Completa

```typescript
const label = createLabel(4, 3, 203)
  // Borde
  .rectangle(10, 10, 785, 585, 2)

  // Título
  .text("ETIQUETA DE PRODUCTO", 400, 50, 40)

  // Información
  .text("SKU: ABC-001", 50, 120, 25)
  .text("Precio: $25.99", 50, 170, 25)

  // Código de barras con configuración avanzada
  .barcode({
    value: "1234567890123",
    x: 50,
    y: 220,
    type: "EAN13",
    height: 80,
    printText: true,
    textAbove: false,
  })

  // Código QR
  .QRCode("https://mitienda.com/producto/abc001", 500, 220, 6)

  // Línea separadora
  .line(50, 400, 750, 400, 2)

  // Texto adicional
  .text("Válido hasta: 31/12/2025", 50, 450, 20);

await printLabel(label);
```

### Múltiples Códigos de Barras

```typescript
const label = createLabel(4, 6, 203)
  // Code 128 normal
  .barcode({
    value: "ABC123456",
    x: 50,
    y: 100,
    type: "128",
  })

  // EAN-13 para productos
  .barcode({
    value: "1234567890123",
    x: 50,
    y: 200,
    type: "EAN13",
    height: 70,
  })

  // Code 39 rotado
  .barcode({
    value: "PRODUCT001",
    x: 50,
    y: 300,
    type: "39",
    orientation: "R",
    checkDigit: true,
  })

  // Code 128 optimizado para números
  .barcode({
    value: "1234567890",
    x: 50,
    y: 400,
    type: "128",
    mode: "N",
    height: 60,
  });
```

## 📚 Documentación Completa

- [Guía de Códigos de Barras](./docs/BARCODE_GUIDE.md)
- [Ejemplos Completos](./examples/)
- [Changelog](./CHANGELOG.md)

## 🛠️ API Reference

### Impresoras Térmicas

```typescript
// Crear factura
const invoice = QikPOS.createInvoice()

  // Comandos básicos
  .initialize() // Inicializar impresora
  .text(string) // Agregar texto
  .feed(lines) // Salto de líneas
  .cut() // Cortar papel

  // Formato
  .bold() // Texto en negrita
  .center() // Centrar texto
  .left() // Alinear izquierda
  .right(); // Alinear derecha

// Imprimir
await QikPOS.print(invoice);
```

### Impresoras de Etiquetas

```typescript
// Crear etiqueta
const label = createLabel(width, height, dpi)
  // Contenido
  .text(text, x, y, size, rotation)
  .barcode(options | legacy_params)
  .QRCode(value, x, y, size)
  .image(path, x, y, width, height)
  .line(x1, y1, x2, y2, thickness)
  .rectangle(x, y, width, height, thickness)

  // Configuración
  .setCopies(quantity)
  .setPrinter(name);

// Generar
await label.build();
```

## 🔍 TypeScript

La librería incluye tipos completos para una mejor experiencia de desarrollo:

```typescript
import { BarcodeOptions, LabelPrinterCommand } from "qikpos";

const options: BarcodeOptions = {
  value: "123456789",
  x: 100,
  y: 100,
  type: "128",
  orientation: "N",
};

const label: LabelPrinterCommand = createLabel(4, 6, 203);
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor revisa nuestras [pautas de contribución](CONTRIBUTING.md).

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🏷️ Versiones

- **v1.1.0** - Nueva sintaxis de códigos de barras + parámetros avanzados
- **v1.0.5** - Funcionalidades básicas de impresión

---

Desarrollado con ❤️ para simplificar la impresión POS
