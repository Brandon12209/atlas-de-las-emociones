# Mantenimiento

## Ejecutar

Requisitos: Node.js compatible con Vite 8, npm y Git LFS. `git lfs pull`, `npm ci`, `npm run dev -- --host 127.0.0.1`. Producción: `npm run build`; servir `dist/` como sitio estático. No se necesitan claves, APIs de pago ni cuentas para usar la exposición.

## Archivos principales

- `index.html`, `coleccion.html`, `felicidad.html`, `miedo.html`, `tristeza.html`, `enojo.html`, `asco.html`, `metodologia.html`, `fuentes.html`: nueve documentos independientes con navegación real.
- `templates/` y `scripts/build-pages.cjs`: fragmentos compartidos y generación de páginas. Editar aquí la estructura; `npm run pages` regenera HTML. `npm run build` lo hace automáticamente.
- `src/exhibition.css`, `src/pages.css` y `src/regions.css`: identidad visual, salas independientes y diseño adaptable.
- `src/app.js`: selección de contenido, alternancia entre ficha y región, fuentes y ayuda.
- `src/emotion-content.js`: las cinco fichas completas, casos ficticios y prácticas.
- `src/research.js`: quince referencias APA 7, DOI y alcance de cada fuente; funciones de cita.
- `src/region-content.js`: treinta lecturas de región, preguntas y referencias.
- `src/model-registry.js`: relación explícita entre sala, GLB, retrato y variante de Mita.
- `src/atlas-content.js` y `src/atlas-editorial.js`: antecedentes conservados; no se usan en la compilación actual.
- `src/viewer.js`: carga glTF, controles, enfoque, hotspots, color y contorno facial.
- `public/cappie/cappie-radiance.glb`: pieza final, administrada por Git LFS.
- `public/emotions/<emoción>/model.glb`, `landmarks.json`, `portrait.webp`: cuatro piezas nuevas, centros anatómicos y retratos auténticos.
- `assets/source/CAPPIE_MANOS_CORREGIDAS.blend`: copia fuente editable, administrada por Git LFS.
- `assets/source/MITA_{MIEDO,TRISTEZA,ENOJO,ASCO}_WEB.blend`: cuatro copias fuente íntegras con sus rigs, administradas por Git LFS.
- `public/cappie/cover.png` y `portrait.webp`: imágenes auténticas de Blender.
- `scripts/export-cappie.py`, `finalize-glb.py`, `render-reference.py`: generación y comparación.

## Regenerar el modelo

Ejecutar Blender en segundo plano con `--disable-autoexec`, abrir la copia fuente y pasar `--python scripts/export-cappie.py -- <carpeta-de-salida>`. Se generan texturas y un GLB intermedio; el script no guarda sobre la fuente. Después ejecutar `python scripts/finalize-glb.py <GLB-intermedio> public/cappie/cappie-radiance.glb` con Pillow y NumPy disponibles. El segundo paso añade márgenes UV y configura materiales unlit portables.

Si cambian pose, apariencia, luces o materiales, regenerar y volver a comparar. No basta cambiar el nombre del GLB. El script copia la visibilidad del proyecto y no activa módulos Python integrados.

Para las cuatro emociones, `scripts/emotion-sources.json` registra las fuentes originales. `prepare-emotions.cjs` crea las copias solo si no existen; `export-emotions.cjs` reutiliza horneados completos de la carpeta de trabajo. Antes de ejecutarlos en otra computadora, adaptar las rutas de Blender, Python y de trabajo que figuran al principio. No reutilizar un horneado de una pose distinta: usar otra carpeta de salida al sustituir la fuente. `render-emotion-reference.py` y `reference-emotions.cjs` generan nueve cámaras por modelo; `inspect-emotions.cjs` captura el navegador y admite nombres de emociones como argumentos. Para los retratos, `render-portrait.py` oculta temporalmente cuerpo y vestuario solo durante el render de la copia; no guarda Blender. `emotion-portraits.py` convierte esos retratos a WebP sin pérdida.

Los centros se obtienen del rig con más huesos, evitando confundirlo con el metarig auxiliar. Al cambiar un modelo, regenerar `landmarks.json` y probar selección de ambas manos, especialmente cuando se cruzan los brazos.

## Validar

Con Vite en `127.0.0.1:5173`, ejecutar `npm test`. Las pruebas usan Chrome instalado. Para otro entorno puede instalarse Chromium de Playwright y ajustar `channel` en la configuración. La captura de regresión de Felicidad usa las cámaras versionadas en `docs/validation/cameras.json`. Para calcular diferencias nuevas hacen falta los renders de Blender: `render-reference.py` escribe en `evidence/blender`; después `python scripts/compare-images.py` calcula las métricas y láminas. Para las otras piezas: `python scripts/compare-images.py evidence/emotions/<emoción>`.

Para probar la compilación final, ejecutar `npm run build`, iniciar `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` y, en otra terminal, `node scripts/test-production.cjs`. `node scripts/check-responsive.cjs` añade las vistas de tablet y escritorio compacto. Las dependencias Python de comparación están en `scripts/requirements.txt`.

El parámetro `?qa` habilita la interfaz de cámaras reproducibles para pruebas; no modifica la pose. En la experiencia normal no se muestra información de implementación. Las diez pruebas verifican piezas/texturas, giro, zoom, enfoque, teclado, hotspots, cinco salas, treinta paneles, selección real de superficies, enlaces de fuentes, apartados de la rúbrica y móvil. Añadir pruebas específicas cuando cambien controles o materiales.

## Añadir una emoción

Actualizar `model-registry.js`, `emotion-content.js`, `region-content.js` y las rutas de `build-pages.cjs`. Conservar referencias verificadas y comprobar el modelo antes de habilitar su sala. Nunca hacer pasar la misma pose por otra emoción. Los retratos deben proceder de los modelos correspondientes. Las cinco salas actuales ya tienen recursos propios.

## Publicación

El sitio funciona como contenido estático. Descargar LFS antes de compilar; un puntero LFS no es un modelo. El repositorio incluye autorización declarada, atribución y límites en `THIRD_PARTY.md`. No publicar otras exportaciones históricas ni archivos personales. Mantener HTTPS y servir GLB con caché. Cada modelo pesa aproximadamente 16,9–17,4 MB, con ocho o nueve texturas de 2048². Cada sala carga solo su pieza; la portada y la colección usan retratos ligeros. Los avisos de Vite sobre rutas de fuentes corresponden a recursos copiados por el plugin al terminar la compilación; las pruebas comprueban que realmente se sirven.

## Checkpoints

El commit `634dc58` conserva la implementación anterior. La copia de seguridad local completa anterior a esta intervención está en `D:\PGI_3D\WEB_FIDELIDAD_20261107\SITIO_ANTES`. La versión fuente utilizada permanece íntegra en la copia protegida y en `assets/source/`; sus huellas y la diferencia detectada con un guardado posterior de la carpeta original están documentadas en `FIDELIDAD.md`. El trabajo nuevo se desarrolla en la rama `feat/cappie-fidelity-museum`.

`a715173` conserva el sitio antes de integrar los cuatro modelos restantes. La ampliación tiene sus intermedios recuperables en `D:\PGI_3D\WEB_ATLAS_5_EMOCIONES_20261107`, junto con `CONTINUAR.md`. `scripts/archive-validation.cjs` verifica originales/copia/GLB y archiva evidencia en `docs/validation/emotions/` después de pasar las pruebas. Los `.blend` y GLB finales permanecen recuperables desde Git LFS; los horneados intermedios son una ayuda local, no un requisito para abrir el sitio.
