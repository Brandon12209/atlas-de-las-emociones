# Cinco emociones, cinco piezas reales

Ampliación del 8 de noviembre de 2026. Se preservó la versión de Felicidad y se integraron las últimas fuentes funcionales localizadas para las otras cuatro emociones. La edición se realizó en copias: ningún proceso guardó sobre los proyectos originales.

| Sala | Fuente protegida en `assets/source/` | Recurso web | Apariencia preservada |
|---|---|---|---|
| Felicidad | `CAPPIE_MANOS_CORREGIDAS.blend` | `public/cappie/cappie-radiance.glb` | Cappie, jersey rojo, manos corregidas, pierna recogida |
| Miedo | `MITA_MIEDO_WEB.blend` | `public/emotions/miedo/model.glb` | Cappie, uniforme escolar, revisión de muñeca izquierda |
| Tristeza | `MITA_TRISTEZA_WEB.blend` | `public/emotions/tristeza/model.glb` | Cappie, uniforme escolar, cabeza y brazos descendidos |
| Enojo | `MITA_ENOJO_WEB.blend` | `public/emotions/enojo/model.glb` | Mita de cabello corto y gafas, brazos cruzados |
| Asco | `MITA_ASCO_WEB.blend` | `public/emotions/asco/model.glb` | Cappie, uniforme escolar, cabeza apartada y palma elevada |

El cambio de apariencia entre salas corresponde a los archivos existentes. No se hizo pasar la pose de Felicidad por otra emoción. Los cuatro retratos nuevos se obtuvieron directamente de sus respectivas fuentes Blender.

## Conservación y método

Se repitió el procedimiento documentado en [FIDELIDAD.md](FIDELIDAD.md): geometría evaluada sin reducción de polígonos, UV originales para las texturas de origen y un segundo mapa UV para radiancia de Eevee a 2048². Se conservaron los grupos de sombreado originales durante el horneado, las normales y las luces de la escena. El navegador presenta el resultado en sRGB, sin una segunda exposición ni conversión genérica a PBR. Los contornos conservan sus superficies; el facial utiliza la respuesta angular ya validada para Felicidad.

Las gafas de Enojo requieren una excepción transparente: se preservó su canal alpha y se evitó la segunda mezcla de caras posteriores. Se compararon variantes antes de elegir esta configuración. No se redujo arbitrariamente la opacidad del marco o de las lentes para ajustar una sola vista. Persisten pequeñas diferencias entre la composición transparente de Eevee y WebGL.

Las fuentes protegidas conservan sus rigs y texturas empaquetadas. Los GLB de exposición son poses estáticas; no contienen un rig animable. No se modificaron las poses para esta integración. Los originales, las copias y los recursos finales se identifican mediante SHA-256 en [source-integrity.json](validation/emotions/source-integrity.json). El GLB de Felicidad se compara además con el checkpoint previo para comprobar que no cambió.

## Comparación visual

Para cada modelo nuevo se obtuvieron nueve pares de imágenes con cámara ortográfica equivalente: frente, perfil, espalda, tres cuartos, rostro, ambas manos, torso y piernas. Se capturaron además doce vistas del navegador, separadas 30°, alrededor del personaje. Las láminas muestran fuente Blender / navegador / diferencia amplificada ×3; las cámaras y mediciones están en `validation/emotions/<emoción>/`.

| Modelo | IoU de silueta, mínimo–máximo | Diferencia RGB media, mínimo–máximo (0–255) |
|---|---:|---:|
| Miedo | 99,49–99,83 % | 2,44–4,29 |
| Tristeza | 99,51–99,97 % | 2,61–4,20 |
| Enojo | 99,53–99,96 % | 2,86–4,17 |
| Asco | 99,42–99,98 % | 2,44–4,34 |

Son rangos entre los nueve encuadres. IoU usa alpha >127; el error RGB se calcula únicamente sobre los píxeles de personaje comunes a ambas máscaras. No equivalen a un porcentaje de calidad artística, ni a una prueba exhaustiva de todas las cámaras posibles. La revisión visual de las rotaciones comprobó presencia de cuerpo, dedos, vestuario y accesorios, sin pérdida de piezas durante la exportación. No es una certificación biomecánica de las poses preexistentes ni un análisis exhaustivo de colisiones de malla.

## Lectura contextual

Cada sala ofrece seis entradas: rostro, mano izquierda, mano derecha, torso/brazos, piernas y actuación completa. Los centros de manos se obtienen de los huesos `DEF-hand.L/R` del rig principal; se conserva la izquierda anatómica aunque los brazos se crucen. Para Enojo, el acercamiento a la mano izquierda usa una cámara oblicua porque queda parcialmente oculta por el cruce.

Un clic o toque en una superficie identifica su región, acerca la cámara y cambia el panel derecho. Un arrastre sigue girando el modelo. El doble clic enfoca la superficie exacta. Los botones permiten seleccionar las regiones sin precisión de puntero; «Ficha de la emoción» y «Vista general» recuperan el contenido completo. En móvil se desplaza la lectura al panel actualizado. Las explicaciones enlazan los estudios y distinguen observación, evidencia e interpretación artística.

## Verificación y límites

La batería de producción cubre las nueve páginas, cinco modelos, treinta paneles, selección directa de rostro/manos, arrastre, zoom, teclado, tacto, referencias internas, apartados de la rúbrica y retratos. Las auditorías de escritorio y móvil incluyen desbordamiento horizontal, solapamientos entre bloques de texto y reglas automáticas de accesibilidad. Los resultados y capturas se conservan en `validation/emotions/`.

La iluminación está horneada para la pose. No reproduce todas las sombras proyectadas entre superficies, ni permite cambiar las luces sin regenerar la exportación. Hay diferencias residuales de transparencia en gafas, filtrado UV, contorno facial y antialiasing. Las pruebas móviles usan emulación de Chrome y no sustituyen pruebas en todos los teléfonos físicos. La accesibilidad automática no equivale a certificación completa ni reemplaza pruebas con lectores de pantalla.

Referencias técnicas: [glTF de Blender](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html), [Shader to RGB](https://docs.blender.org/manual/en/latest/render/shader_nodes/converter/shader_to_rgb.html), [materiales de Three.js](https://threejs.org/docs/pages/Material.html). El modelo editado y los recursos previos permanecen recuperables mediante Git LFS y los checkpoints originales.
