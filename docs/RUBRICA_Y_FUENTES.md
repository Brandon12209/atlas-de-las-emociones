# Rúbrica UVM y trazabilidad de la investigación

Se leyó y examinó visualmente el documento original de tres páginas **Rúbrica 2do parcial DH.pdf**, proporcionado en Downloads por el responsable. UVM, Campus Coyoacán, Desarrollo Humano, B6, ciclo C3.2026; profesor José Luis González Pensamiento. Este documento es la fuente curricular, no una publicación científica.

## Correspondencia con la rúbrica

Las cinco emociones obligatorias son miedo, alegría, tristeza, enojo y asco/desagrado. La sala «Felicidad» utiliza el sentido de alegría episódica y lo aclara en su definición; no equipara esa emoción con satisfacción global con la vida.

| Apartado exigido | Dónde encontrarlo en cada sala |
|---|---|
| Nombre | Título y selector de emoción |
| Definición | Definición, con referencia |
| Función y utilidad de reconocerla | Función |
| Desencadenantes | Desencadenantes, con variación contextual |
| Pensamientos asociados | Desplegable «Pensamientos y conductas posibles» |
| Manifestaciones corporales | Manifestaciones; distingue sensaciones declaradas de movimientos visibles |
| Conductas posibles | Mismo desplegable, con varias opciones de respuesta |
| Estrategias saludables | Regulación y práctica con pasos, cuándo usarla y para qué |
| Ejemplo práctico | Caso ficticio: situación → interpretación → emoción → respuesta constructiva |
| Representación visual | Modelo independiente y seis paneles regionales con investigación |

Los cinco criterios se califican con hasta cinco puntos cada uno: comprensión de definiciones/funciones; análisis de desencadenantes, pensamientos, manifestaciones y conductas; pertinencia y aplicación de regulación; ejemplos y análisis; organización y presentación. Total: 25 puntos. La web aporta contenido para estos criterios, pero no garantiza una calificación. La rúbrica pide equipos de cuatro o cinco integrantes: nombres, datos institucionales y condiciones concretas de entrega deben ser los del equipo real y no se han inventado.

La página `metodologia.html` incluye un mapa legible de esta correspondencia. Las fuentes científicas aparecen en `fuentes.html` y cada enlace abre la entrada específica, con DOI y formato bibliográfico APA 7.

## Cómo se contrastó la evidencia

Se consultaron las fuentes primarias enlazadas en `src/research.js`, leyendo artículos o textos de autor disponibles y los registros editoriales/PubMed para comprobar autoría, título y DOI. Se conservaron las referencias útiles del trabajo anterior y se añadieron estudios específicos de miedo, tristeza, enojo, asco y regulación. El sitio contiene quince referencias, incluyendo artículos empíricos, revisiones, metaanálisis y un capítulo académico; no se presentan todos como experimentos equivalentes.

| Pregunta | Fuentes utilizadas | Aplicación y límite |
|---|---|---|
| ¿Una expresión identifica la emoción? | Barrett et al. (2019); Calvo et al. (2018) | Contexto y diferencias individuales. Las expresiones de actores y los rostros humanos no validan automáticamente un personaje anime. |
| ¿Cómo contribuyen cuerpo y manos? | Lopez et al. (2017); Dael et al. (2012); Witkower y Tracy (2019) | Varias posturas pueden comunicar una emoción; algunas se confunden. No se inventa un código psicológico de cada dedo. |
| ¿Qué aporta la expansión a la alegría? | Van Cappellen et al. (2023) | Brazos, cabeza y expansión se interpretan conjuntamente; la expansión no es exclusiva de alegría. |
| ¿Qué se siente en el cuerpo? | Nummenmaa et al. (2014) | Mapas de autoinforme de sensaciones. No son mediciones de músculos, temperatura ni activación del modelo. |
| ¿Qué funciones se proponen? | Fredrickson (2001); Adolphs (2013); Karnaze y Levine (2018); Mayan y Meiran (2011); Curtis et al. (2011) | Marcos y estudios sobre emoción positiva, amenaza, pérdida, aproximación y rechazo. Se usan expresiones condicionales, sin asumir que toda respuesta sea adaptativa. |
| ¿Qué regulación tiene respaldo? | Webb et al. (2012); Kjærvik y Bushman (2024); Chen et al. (2026) | Estrategias y resultados grupales. Las prácticas del atlas son adaptaciones educativas, no protocolos clínicos validados como conjunto. |

Los casos de Lucía, Ana, Diego, Sofía y Pablo son ficticios. No se citan como evidencia de una población. Las observaciones de cada pieza describen su geometría visible; la intención propuesta es artística. El texto explicita cuándo faltan contexto, movimiento temporal o evidencia suficiente para inferir un estado interno.

Para ampliar contenido, añadir primero la referencia verificada a `src/research.js`; después enlazarla mediante `cite()` en `emotion-content.js` o mediante `refs` en `region-content.js`. `cite()` rechaza identificadores desconocidos. Las pruebas verifican que las citas de los treinta paneles llevan a entradas existentes. Mantener actualizados tanto el alcance del estudio como sus límites, sin convertir correlaciones en causalidad.
