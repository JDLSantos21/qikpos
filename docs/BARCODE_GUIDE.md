# QikPOS - Guía de Códigos de Barras

## Nueva Sintaxis con Objeto (Recomendada)

La nueva sintaxis utiliza un objeto de configuración que es más limpio, legible y menos propenso a errores.

### Sintaxis Básica

```typescript
label.barcode({
  value: "123456789",
  x: 100,
  y: 100,
});
```

### Sintaxis Completa

```typescript
label.barcode({
  value: "ABC123456", // Valor del código de barras (requerido)
  x: 100, // Posición X en puntos (requerido)
  y: 100, // Posición Y en puntos (requerido)
  height: 60, // Altura del código (opcional, por defecto 50)
  type: "128", // Tipo de código (opcional, por defecto "128")
  width: 2, // Ancho del código (opcional, por defecto 2)
  orientation: "R", // Orientación (opcional, por defecto "N")
  printText: true, // Mostrar texto (opcional, por defecto true)
  textAbove: false, // Texto arriba (opcional, por defecto false)
  checkDigit: false, // Dígito verificación (opcional, por defecto false)
  mode: "A", // Modo codificación (opcional, por defecto "A")
});
```

## Parámetros Disponibles

### `orientation` - Orientación del Código

- `"N"` - Normal (0°) - **Por defecto**
- `"R"` - Rotado 90° (Right)
- `"I"` - Invertido 180° (Inverted)
- `"B"` - Rotado 270° (Bottom)

### `type` - Tipos de Códigos de Barras Soportados

- `"128"` - Code 128 (alta densidad, todos los caracteres ASCII) - **Por defecto**
- `"39"` - Code 39 (alfanumérico, ampliamente usado)
- `"EAN13"` - EAN-13 (estándar internacional, 13 dígitos)
- `"EAN8"` - EAN-8 (versión corta para productos pequeños, 8 dígitos)
- `"UPCA"` - UPC-A (estándar americano, 12 dígitos)
- `"UPCE"` - UPC-E (versión compacta de UPC-A, 8 dígitos)
- `"I25"` - Interleaved 2 of 5 (numérico de alta densidad)
- `"93"` - Code 93 (evolución del Code 39)
- `"AZTEC"` - Aztec Code (código 2D de alta capacidad)
- `"DATAMATRIX"` - Data Matrix (código 2D compacto)
- `"PDF417"` - PDF417 (código 2D de alta capacidad)

### `mode` - Modos de Codificación (Para Code 128)

- `"A"` - ASCII (todos los caracteres ASCII) - **Por defecto**
- `"N"` - Numérico (solo números, más eficiente)
- `"U"` - Mayúsculas (letras mayúsculas y números)
- `"D"` - UCC/EAN (formato específico UCC/EAN)

## Ejemplos Prácticos

### Código de Barras Simple

```typescript
label.barcode({
  value: "12345",
  x: 50,
  y: 100,
});
```

### Código EAN-13 para Productos

```typescript
label.barcode({
  value: "1234567890123",
  x: 50,
  y: 100,
  type: "EAN13",
  height: 70,
});
```

### Código Rotado sin Texto

```typescript
label.barcode({
  value: "PRODUCT001",
  x: 50,
  y: 100,
  orientation: "R",
  printText: false,
});
```

### Code 128 Optimizado para Números

```typescript
label.barcode({
  value: "1234567890",
  x: 50,
  y: 100,
  type: "128",
  mode: "N",
  height: 80,
});
```

### Code 39 con Verificación

```typescript
label.barcode({
  value: "ABC123",
  x: 50,
  y: 100,
  type: "39",
  checkDigit: true,
  textAbove: true,
});
```

## Compatibilidad hacia Atrás

La sintaxis legacy sigue funcionando para compatibilidad:

```typescript
// Sintaxis legacy (aún soportada)
label.barcode(
  "123456789",
  100,
  100,
  60,
  "128",
  2,
  "N",
  true,
  false,
  false,
  "A"
);

// Equivalente con nueva sintaxis
label.barcode({
  value: "123456789",
  x: 100,
  y: 100,
  height: 60,
  type: "128",
  width: 2,
  orientation: "N",
  printText: true,
  textAbove: false,
  checkDigit: false,
  mode: "A",
});
```

## Ventajas de la Nueva Sintaxis

1. **Más Legible**: Los nombres de las propiedades son auto-documentados
2. **Menos Errores**: No hay que recordar el orden de 11 parámetros
3. **Flexibilidad**: Solo especifica las propiedades que necesitas cambiar
4. **Validación**: Validación automática con Zod
5. **Valores por Defecto**: Aplicación automática de valores por defecto
6. **Autocompletado**: Mejor soporte del IDE para autocompletado

## Migración Recomendada

Para código nuevo, usa la sintaxis con objeto:

```typescript
// ❌ Antiguo (funciona pero no recomendado)
label.barcode("ABC123", 50, 100, 60, "128", 2, "N", true, false, false, "A");

// ✅ Nuevo (recomendado)
label.barcode({
  value: "ABC123",
  x: 50,
  y: 100,
  height: 60,
});
```
