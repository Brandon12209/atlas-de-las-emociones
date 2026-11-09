# Validación de Cappie: Blender → navegador

## Fuente y criterio artístico

La fuente es la versión indicada por el responsable, con manos corregidas. Presenta a Cappie con gorra, cabello recogido, guantes azules, jersey rojo, falda azul y una pierna flexionada. Se conserva esta pose y este atuendo; la composición de las referencias inspira la interfaz, sin sustituir el personaje por otro uniforme o por otra Mita.

SHA-256 de la versión fuente capturada al iniciar el trabajo y de la copia protegida: `efd5e06b191f1c2e96ae102fe2024ac7ddbaae86e6c9d4784ac06143fb3c2f82`. Esa versión se conserva íntegra en `assets/source/CAPPIE_MANOS_CORREGIDAS.blend`, en el respaldo local y en el `.blend1` de la carpeta original.

La verificación de cierre detectó un guardado posterior del `.blend` de la carpeta original, fechado el 7 de noviembre de 2026 a las 09:30:46, con SHA-256 `55b68b8e86436409bd752d3d1e2ebd5a224cf101a06dc7a02a6d42dfc3017b03`. No se reemplazó ese archivo ni se incorporó su estado posterior al sitio. La exportación y las comparaciones aquí documentadas corresponden exclusivamente a la copia protegida identificada arriba; no se atribuye la causa de ese guardado.

El GLB prioritario anterior solo contenía una imagen y seis materiales. Cinco materiales carecían de textura. Por ello no era una base visual completa, aunque sí identificaba la versión de manos que debía recuperarse desde Blender.

## Método elegido

1. Abrir una copia con ejecución automática desactivada. Evaluar la pose, los modificadores y la visibilidad; conservar las nueve piezas visibles. No reducir polígonos ni reconstruir anatomía.
2. Conservar UV originales y normales evaluadas. Crear un segundo mapa UV para cada pieza, sin cambiar la superficie tridimensional.
3. Renderizar los materiales originales en espacio UV con Eevee a 2048 × 2048. Las normales originales se suministran al grupo `MITA Shader`, conservando sus operaciones y las luces de la fuente. El resultado fija el sombreado de esta pose al personaje.
4. Añadir un margen de 16 píxeles a las islas UV para eliminar líneas oscuras durante el filtrado. Los píxeles interiores cubiertos no se recolorean.
5. Empaquetar en GLB con `KHR_materials_unlit`: nueve texturas PNG y nueve superficies, más sus nueve cascarones originales de contorno. El navegador usa salida sRGB sin una segunda exposición o tone mapping.
6. Reconstruir el contorno facial dependiente del ángulo mediante la ecuación dieléctrica de Fresnel y el umbral de la rampa original. Los demás contornos conservan su geometría y color.

Se eligió un horneado de radiancia de Eevee, no una sustitución arbitraria por materiales PBR o MToon. La iluminación y el estilo son deliberadamente los de la fuente. El GLB portable incluye los colores y contornos; el visor aporta la respuesta angular específica del contorno facial.

## Comparación reproducible

Blender 5.2.2 LTS, motor Eevee, transformación Standard, exposición 0, gamma 1. Chrome con Three.js, espacio de salida sRGB y sin tone mapping. Cámaras ortográficas equivalentes, fondo transparente y mismas dimensiones: cuerpo 768 × 1024, detalles 768 × 768. Parámetros en `validation/cameras.json`.

Se comparan frente, perfil, espalda, tres cuartos, rostro y ambas manos. También se inspeccionan doce vistas alrededor de 360°. Los resultados se refieren a esos encuadres y a esta iluminación, no a cualquier pose o condición imaginable.

| Vista | Intersección/unión de silueta | Diferencia RGB media (0–255) |
|---|---:|---:|
| Frente | 99,52 % | 3,71 |
| Perfil | 99,46 % | 3,61 |
| Espalda | 99,53 % | 3,58 |
| Tres cuartos | 99,58 % | 3,83 |
| Rostro | 99,74 % | 3,11 |
| Mano izquierda | 99,87 % | 2,44 |
| Mano derecha | 99,70 % | 2,76 |

La intersección/unión usa la máscara alpha con umbral 127. La diferencia RGB media se calcula sobre los píxeles de personaje comunes a ambas máscaras, excluyendo el fondo; no se diluye con píxeles negros de fondo. El informe JSON conserva también el percentil 95, PSNR y número de píxeles evaluados. Estas medidas no equivalen a un «porcentaje de fidelidad artística».

Las comparativas muestran Blender a la izquierda, navegador en el centro y diferencia amplificada ×3 a la derecha. El rostro, el tatuaje, los ojos, las manos, la gorra y la ropa mantienen su identidad; la geometría permanece completa en las vistas inspeccionadas. No se detectó sustitución de una pieza ni pérdida de dedos durante la exportación.

## Diferencias y límites reales

- El horneado fija luz y pose. Cambiar la pose o las luces requiere regenerar el recurso. No es un rig animable en el navegador; el rig editable completo se conserva en la copia Blender.
- El horneado UV no reproduce todas las sombras proyectadas entre piezas. Las luces originales, texturas y sombreado local se conservan; algunos bordes y oclusiones difieren.
- El ruido del shader original, el filtrado UV, la resolución finita y los diferentes sistemas de antialiasing producen diferencias pequeñas, visibles en la imagen de diferencia.
- La silueta conserva la resolución geométrica original. No se alisa ni cambia la anatomía para ocultar el carácter poligonal de la fuente.
- La prueba móvil utiliza emulación de Chrome a 390 × 844, no una granja de teléfonos físicos. La auditoría automática de accesibilidad no certifica por sí sola conformidad total ni sustituye pruebas con lectores de pantalla.
- No se afirma identidad píxel a píxel ni una simulación física del gesto. La pose es la aprobada por el responsable, conservada sin modificaciones.

## Referencias técnicas

- [Blender: glTF 2.0](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html): los materiales glTF dependen de los nodos reconocidos por el exportador.
- [Blender: Shader to RGB](https://docs.blender.org/manual/en/latest/render/shader_nodes/converter/shader_to_rgb.html): nodo específico de Eevee.
- [Three.js: gestión de color](https://threejs.org/manual/pages/color-management.html).
- [Khronos: materiales unlit](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit).
- [Q42: Oculi Mundi](https://engineering.q42.nl/oculi-mundi/): inspiración para combinar exploración espacial y consulta académica.
