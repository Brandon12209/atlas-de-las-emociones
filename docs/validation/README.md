# Evidencia de validación

Esta carpeta conserva el checkpoint original de Felicidad. La ampliación con las cinco salas y sus pruebas actuales se encuentra en [emotions/](emotions/README.md).

Capturas auténticas obtenidas de Blender y Chrome el 7 de noviembre de 2026. Las comparativas usan cámaras ortográficas equivalentes; ver `../FIDELIDAD.md` para metodología y límites.

- `comparison-front.jpg`, `comparison-face.jpg`, `comparison-hand-left.jpg`, `comparison-hand-right.jpg`, `comparison-side.jpg`, `comparison-back.jpg`: fuente Blender / navegador / diferencia amplificada ×3.
- `rotation-sheet.jpg`: doce ángulos alrededor del modelo.
- `comparison-metrics.json`: mediciones sobre la silueta y los píxeles comunes del personaje.
- `cameras.json`: encuadres de referencia reproducibles.
- `desktop-exhibit-final.png`, `desktop-hotspot.png`, `mobile-exhibit.png`: interacción real.
- `desktop-home.png`, `mobile-home.png`, `desktop-collection.png`: páginas independientes.
- `test-results.json`: cuatro pruebas completas aprobadas sobre la compilación de producción, incluyendo cámaras, doble clic, fichas, teclado, navegación, móvil y auditoría de accesibilidad.
- `multipage-validation.json`: nueve rutas reales examinadas a 1440 y 390 píxeles, sin solapamientos de bloques de texto detectados, sin errores de página y sin incidencias en las reglas automáticas WCAG A/AA utilizadas. Se abrieron también los apartados desplegables para comprobar su contenido.
- `responsive-extra.json`: comprobaciones adicionales a 820 × 1180 y 1024 × 768; sin desbordamiento horizontal ni respuestas HTTP de error en los recursos cargados durante esas visitas.

Las capturas se inspeccionaron visualmente además de las comprobaciones automáticas. La emulación móvil no sustituye una prueba en todos los dispositivos físicos. La ausencia de incidencias automáticas no equivale a una certificación total de accesibilidad.
