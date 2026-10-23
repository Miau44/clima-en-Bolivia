# Verificaciones realizadas

- JavaScript: comprobación de sintaxis con Node.
- Navegador: Chromium, carga de la edición independiente.
- Videos: los tres MP4 se cargan y reproducen sin errores; H.264, 1280 x 720, 24 fps, 10 s.
- Selección de las tres ciudades y los cuatro efectos.
- Controles de pausa, modo cine, Escape, ajustes y unidades.
- Importación y restauración de un MP4 local.
- Visualización en 320, 360, 390, 768, 1024, 1366 y 1440 px de ancho, sin desbordamiento horizontal.
- Preferencia de movimiento reducido: videos y efectos pausados.
- Procesamiento de respuestas API simuladas: tormenta, sol y viento.
- Fallo de conexión: se indica que no hay datos actuales y no se muestran ejemplos como datos reales.
- Paso de Clima actual a un efecto manual: cambia al modo DEMO.
- Sin excepciones JavaScript no controladas en estas pruebas.

## Limitaciones
La conexión real a Open-Meteo no pudo verificarse desde el entorno de creación.
Las pruebas de red utilizaron respuestas simuladas; no prueban disponibilidad actual,
precisión meteorológica ni acceso desde todos los proveedores de internet.
No se verificó en todos los navegadores o teléfonos físicos.
Los videos representan una atmósfera recreada, no filmaciones de las ciudades.
