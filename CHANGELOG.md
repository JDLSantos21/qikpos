# Changelog

## [1.1.0] - 2025-07-25

### ✨ Added

- **Nueva sintaxis con objeto para códigos de barras**: Ahora puedes usar un objeto de configuración más limpio y legible
- **Interfaz `BarcodeOptions`**: Nuevo tipo TypeScript para mejor intellisense y validación
- **Parámetros avanzados para códigos de barras**:
  - `orientation`: Rotación del código ("N", "R", "I", "B")
  - `printText`: Mostrar/ocultar texto legible
  - `textAbove`: Posición del texto (arriba/abajo)
  - `checkDigit`: Cálculo automático de dígito de verificación
  - `mode`: Modo de codificación para Code 128 ("N", "U", "A", "D")
- **Documentación completa de tipos de códigos de barras soportados**
- **Validación automática con Zod** para opciones de códigos de barras
- **Tests comprehensivos** para ambas sintaxis (nueva y legacy)
- **Guía completa de códigos de barras** en `docs/BARCODE_GUIDE.md`

### 🔧 Enhanced

- **Método `barcode` mejorado** con sobrecarga para soportar tanto la nueva sintaxis con objeto como la legacy
- **Mejor experiencia de desarrollo** con autocompletado mejorado en IDEs
- **Ejemplos actualizados** mostrando ambas sintaxis

### 🛡️ Backwards Compatibility

- **100% compatible** con código existente
- **Sintaxis legacy mantenida** para compatibilidad hacia atrás
- **Migración gradual** posible

### 📚 Documentation

- Guía completa de códigos de barras con ejemplos
- Documentación de todos los tipos de códigos soportados
- Ejemplos de migración de sintaxis legacy a nueva

### 🎯 Developer Experience

- Mejor intellisense con tipos explícitos
- Menos propenso a errores con nombres de propiedades claros
- Validación automática de parámetros

## [1.0.5] - Previous version

- Funcionalidades básicas de impresión de etiquetas
- Soporte para códigos de barras básicos
- Integración con impresoras ZPL
