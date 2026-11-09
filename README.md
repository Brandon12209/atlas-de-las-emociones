# PGI | Atlas de las Emociones

Sitio académico multipágina con cinco piezas tridimensionales independientes: Felicidad, Miedo, Tristeza, Enojo y Asco / desagrado. Portada borgoña, colección, una sala por emoción, metodología y fuentes. Felicidad conserva a Cappie con las manos corregidas; Enojo utiliza la revisión existente de Mita con cabello corto y gafas.

## Abrir el sitio

```sh
git lfs pull
npm ci
npm run dev -- --host 127.0.0.1
```

Visitar `http://127.0.0.1:5173/`. Sala principal: `http://127.0.0.1:5173/felicidad.html`.

`npm run build` genera nueve documentos HTML independientes y recursos seleccionados en `dist/`. `npm run preview` sirve la versión compilada. Three.js se carga únicamente en la sala interactiva; la portada, la colección y las páginas de lectura no descargan el GLB.

## Explorar

Un clic o toque sobre el rostro, las manos o el cuerpo enfoca la región y cambia el panel académico. Hay seis regiones por emoción, con observaciones, interpretación, fuentes y una pregunta de reflexión. «Ficha de la emoción» recupera el contenido completo. Órbita, zoom, desplazamiento, enfoque por doble clic y fichas por permanencia del cursor. Los botones ofrecen acceso equivalente mediante teclado y tacto. Flechas para girar, Mayús + flechas para desplazar, +/− para zoom e Inicio para volver. Las transiciones respetan movimiento reducido.

## Fuente visual

Se conserva la pose de `04_COPIA_PRUEBA_COPIA_CON_MANOS_BIEN_FINAL.blend`. Las cinco copias fuente editables están en `assets/source/`. Las exportaciones conservan la geometría evaluada, los materiales de Eevee horneados y los contornos originales. No se decima ni se sustituyen materiales por PBR o MToon genéricos. Los recursos grandes se administran mediante Git LFS; cada sala descarga solo su modelo.

- [Fidelidad, comparación y límites](docs/FIDELIDAD.md)
- [Integración de las cinco emociones y validación](docs/INTEGRACION_CINCO_EMOCIONES.md)
- [Rúbrica UVM y trazabilidad científica](docs/RUBRICA_Y_FUENTES.md)
- [Mantenimiento y regeneración](docs/MANTENIMIENTO.md)
- [Recursos, créditos y autorización declarada](docs/THIRD_PARTY.md)
- [Evidencia de validación](docs/validation/)

## Pruebas

Con el servidor activo, `npm test` comprueba modelo, cámaras, fichas, teclado, navegación real entre páginas, móvil, accesibilidad automática y solapamientos entre bloques de texto. Las imágenes de comparación requieren las referencias de Blender descritas en mantenimiento. Las pruebas usan Chrome instalado y guardan resultados en `evidence/`.

La compilación no es una certificación de fidelidad: las comparaciones entre Blender y navegador documentan diferencias residuales de sombras, filtrado y antialiasing. El sombreado está fijado a la pose; el rig completo se conserva en Blender.
