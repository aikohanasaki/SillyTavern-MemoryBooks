# Cómo funcionan los Libros de Memoria de SillyTavern (STMB) — Guía para no programadores

Esta guía explica cómo funciona STMB en términos claros y sencillos para usuarios que no escriben código para SillyTavern pero quieren entender cómo se construyen los prompts.

## Lo que STMB envía a la IA (Generación de Memoria)

Cuando ejecutas "Generar Memoria", STMB envía un prompt de dos partes:

A) Instrucciones del Sistema (de un preajuste como "summary", "synopsis", etc.)
- Un bloque corto de instrucciones que:
  - Le dice al modelo que analice la escena.
  - Le instruye que devuelva ÚNICAMENTE JSON.
  - Define los campos JSON requeridos.
- Las macros como {{user}} y {{char}} se sustituyen con los nombres de tu chat.
- ¡Este NO es tu preajuste! Estos prompts son independientes y se pueden gestionar desde el 🧩Administrador de Prompts de Resumen.

B) La Escena, formateada para el análisis
- STMB formatea tus mensajes recientes como un guion:
  - Un bloque de contexto opcional de memorias anteriores (claramente marcado como NO RESUMIR).
  - La transcripción de la escena actual, una línea por mensaje:
    Alice: …
    Bob: …

Esqueleto de la forma del prompt
```
— Instrucciones del Sistema (de tu preajuste seleccionado) —
Analiza la siguiente escena de chat y devuelve una memoria como JSON.

Debes responder ÚNICAMENTE con JSON válido en este formato exacto:
{
  "title": "Título corto de la escena (1-3 palabras)",
  "content": "…",
  "keywords": ["…","…"]
}

…(la guía del preajuste continúa; las macros como {{user}} y {{char}} ya están sustituidas)…

— Datos de la Escena —
=== CONTEXTO DE LA ESCENA ANTERIOR (NO RESUMIR) ===
Contexto 1 - [Título]:
[Texto de la memoria anterior]
Palabras clave: alfa, beta, …
…(cero o más memorias anteriores)…
=== FIN DEL CONTEXTO DE LA ESCENA ANTERIOR - RESUMIR SOLO LA ESCENA DE ABAJO ===

=== TRANSCRIPCIÓN DE LA ESCENA ===
{{user}}: …
{{char}}: …
… (cada mensaje en su propia línea)
=== FIN DE LA ESCENA ===
```

Notas
- Seguridad de tokens: STMB estima el uso de tokens y te advierte si excedes un umbral.
- Si habilitaste las expresiones regulares de salida en la Configuración, STMB aplica tus scripts de regex seleccionados al texto del prompt justo antes de enviarlo.

## Lo que la IA debe devolver (Contrato JSON)

La IA debe devolver un único objeto JSON con estos campos:
- title: string (corto)
- content: string (el texto del resumen/memoria)
- keywords: array de strings (se recomiendan 10–30 términos específicos por los preajustes)

Rigor y compatibilidad
- Devuelve ÚNICAMENTE el objeto JSON — sin prosa, sin explicaciones.
- Las claves deben ser exactamente: "title", "content", "keywords".
  - STMB tolera "summary" o "memory_content" para el contenido, pero "content" es la mejor práctica.
- keywords debe ser un array de strings (no una cadena separada por comas).

Ejemplo mínimo (válido)
```json
{
  "title": "Confesión Silenciosa",
  "content": "Tarde en la noche, Alice admite que el hackeo fue personal. Bob cuestiona la ética; acuerdan límites y planean un siguiente paso cuidadoso.",
  "keywords": ["Alice", "Bob", "confesión", "límites", "hackeo", "ética", "noche", "siguientes pasos"]
}
```

Ejemplo más largo (válido)
```json
{
  "title": "Tregua en la Azotea",
  "content": "Línea de tiempo: Noche después del incidente del mercado. Hitos de la historia: Alice revela que ella plantó el rastreador. Bob está frustrado pero escucha; repasan la pista e identifican el almacén. Interacciones clave: Alice se disculpa sin excusas; Bob establece condiciones para continuar. Detalles notables: Radio rota, etiqueta del almacén \"K‑17\", sirenas distantes. Resultado: Forman una tregua provisional y acuerdan explorar K‑17 al amanecer.",
  "keywords": ["Alice", "Bob", "tregua", "almacén K-17", "disculpa", "condiciones", "sirenas", "plan de exploración", "noche", "incidente del mercado"]
}
```

### Si el Modelo se comporta mal

STMB intenta rescatar salidas ligeramente malformadas:
- Acepta JSON dentro de bloques de código y extrae el bloque.
- Elimina comentarios y comas finales antes de analizar.
- Detecta JSON truncado/desequilibrado y genera errores claros, por ejemplo:
  - NO_JSON_BLOCK — el modelo respondió con prosa en lugar de JSON.
  - UNBALANCED / INCOMPLETE_SENTENCE — probablemente truncado.
  - MISSING_FIELDS_TITLE / MISSING_FIELDS_CONTENT / INVALID_KEYWORDS — problemas de esquema.

Mejor comportamiento del modelo
- Emitir un único objeto JSON con los campos requeridos.
- No agregar texto circundante ni bloques de Markdown.
- Mantener el "title" corto; hacer que las "keywords" sean específicas y fáciles de recuperar.
- Obedecer el preajuste (por ejemplo, ignorar el contenido [OOC]).

### Avanzado: Ruta de Ejecución (Opcional)

- Ensamblaje del prompt: buildPrompt(profile, scene) combina el texto de instrucción del preajuste seleccionado con la transcripción de la escena y el bloque opcional de memorias anteriores.
- Envío: sendRawCompletionRequest() envía el texto a tu proveedor/modelo seleccionado.
- Análisis: parseAIJsonResponse() extrae y valida title/content/keywords, con una ligera reparación si es necesario.
- Resultado: STMB almacena la memoria estructurada, aplica tu formato de título y prepara las claves sugeridas para el lorebook.

## Prompts Laterales (Cómo hacerlo)

Los Prompts Laterales son generadores auxiliares, impulsados por plantillas, que escriben notas estructuradas en tu lorebook (por ejemplo, rastreadores, informes, listas de personajes). Son independientes de la ruta de "generación de memoria" y pueden ejecutarse automáticamente o bajo demanda.

Para qué son buenos
- Rastreadores de trama/estado (por ejemplo, "Puntos de Trama")
- Paneles de estado/relación (por ejemplo, "Estado")
- Listas de personajes / quién es quién de los NPCs (por ejemplo, "Elenco de Personajes")
- Notas de punto de vista o evaluaciones (por ejemplo, "Evaluar")

Plantillas incorporadas (incluidas por STMB)
- Puntos de Trama — rastrea hilos y ganchos de la historia.
- Estado — resume la información de relación/afinidad.
- Elenco de Personajes — mantiene una lista de NPCs en orden de importancia para la trama.
- Evaluar — anota lo que {{char}} ha aprendido sobre {{user}}.

Dónde gestionar
- Abre el Administrador de Prompts Laterales (dentro de STMB) para ver, crear, importar/exportar, habilitar o configurar plantillas.

Crear o habilitar un Prompt Lateral
1) Abre el Administrador de Prompts Laterales.
2) Crea una nueva plantilla o habilita una incorporada.
3) Configura:
   - Nombre: Título de visualización (la entrada del lorebook guardada se titulará "Nombre (STMB SidePrompt)").
   - Prompt: Texto de instrucción que seguirá el modelo. Aquí se expanden las macros estándar de ST.
   - Formato de Respuesta: Bloque de guía opcional añadido al prompt (no es un esquema, solo indicaciones). También expande las macros estándar de ST.
   - Macros de tiempo de ejecución: Los tokens `{{...}}` que no sean estándar se convierten en entradas obligatorias para `/sideprompt`, por ejemplo `{{npc name}}="Jane Doe"`.
   - Disparadores:
     • Después de la Memoria — se ejecuta después de cada generación de memoria exitosa para la escena actual.
     • Por Intervalo — se ejecuta cuando se alcanza un umbral de mensajes visibles de usuario/asistente desde la última ejecución (visibleMessages).
     • Comando Manual — permite la ejecución con /sideprompt.
   - Contexto opcional: previousMemoriesCount (0–7) para incluir memorias recientes como contexto de solo lectura.
   - Modelo/perfil: opcionalmente, anula el modelo/perfil (overrideProfileEnabled + overrideProfileIndex). De lo contrario, utiliza el perfil predeterminado de STMB (que puede reflejar la configuración actual de la interfaz de usuario de ST si está configurado).
   - Configuración de inyección en el lorebook:
     • constVectMode: link (vectorizado, predeterminado), green (normal), blue (constante)
     • position: estrategia de inserción.
     • orderMode/orderValue: ordenación manual cuando sea necesario.
     • preventRecursion/delayUntilRecursion: banderas booleanas.

Ejecución manual con /sideprompt
- Sintaxis: /sideprompt "Nombre" {{macro}}="value" [X‑Y]
  - Ejemplos:
    • /sideprompt "Estado"
    • /sideprompt "NPC Directory" {{npc name}}="Jane Doe"
    • /sideprompt "Location Notes" {{place name}}="Black Harbor" 100‑120
- Si omites un rango, STMB compila los mensajes desde el último punto de control (limitado a una ventana reciente).
- La ejecución manual requiere que la plantilla permita el comando sideprompt (habilita "Permitir ejecución manual a través de /sideprompt" en la configuración de la plantilla). Si está deshabilitado, el comando será rechazado.
- El nombre de la plantilla debe ir entre comillas, y los valores de las macros también deben ir entre comillas.
- Después de elegir una plantilla en el autocompletado del comando, STMB sugiere las macros obligatorias que aún falten para esa plantilla.

Ejecuciones automáticas
- Después de la Memoria: Todas las plantillas habilitadas con el disparador onAfterMemory se ejecutan utilizando la escena ya compilada. STMB agrupa las ejecuciones con un pequeño límite de concurrencia y puede mostrar notificaciones de éxito/fallo por plantilla.
- Rastreadores por intervalo: Las plantillas habilitadas con onInterval se ejecutan una vez que el número de mensajes visibles (no del sistema) desde la última ejecución alcanza visibleMessages. STMB almacena puntos de control por plantilla (por ejemplo, STMB_sp_<key>_lastMsgId) y retrasa las ejecuciones (~10s). La compilación de la escena está limitada a una ventana reciente por seguridad.
- Las plantillas con macros de tiempo de ejecución personalizadas solo pueden ejecutarse de forma manual. STMB elimina `onInterval` y `onAfterMemory` de esas plantillas al guardar/importar y muestra una advertencia.

Vistas previas y guardado
- Si "mostrar vistas previas de la memoria" está habilitado en la configuración de STMB, aparece una ventana emergente de vista previa. Puedes aceptar, editar, reintentar o cancelar. El contenido aceptado se escribe en tu lorebook vinculado bajo "Nombre (STMB SidePrompt)".
- Los Prompts Laterales requieren que un lorebook de memoria esté vinculado al chat (o seleccionado en Modo Manual). Si no hay ninguno vinculado, STMB mostrará una notificación y omitirá la ejecución.
- Si una plantilla contiene macros de tiempo de ejecución personalizadas, STMB elimina los disparadores automáticos al guardar/importar y muestra una advertencia.

Importar/exportar y restablecer incorporados
- Exportar: Guarda tu documento de Prompts Laterales como JSON.
- Importar: Fusiona las entradas de forma aditiva; los duplicados se renombran de forma segura (sin sobrescrituras). Si una plantilla importada contiene macros de tiempo de ejecución personalizadas, STMB elimina automáticamente `onInterval` y `onAfterMemory` y muestra una advertencia.
- Recrear Incorporados: Restablece las plantillas incorporadas a los valores predeterminados del idioma actual (las plantillas creadas por el usuario no se modifican).

## Prompts Laterales vs. Ruta de Memoria: Diferencias Clave

- Propósito
  - Ruta de Memoria: Produce memorias canónicas de la escena como JSON estricto (título, contenido, palabras clave) para su recuperación.
  - Prompts Laterales: Produce informes/rastreadores auxiliares como texto de formato libre guardado en tu lorebook.

- Cuándo se ejecutan
  - Ruta de Memoria: Se ejecuta solo cuando presionas Generar Memoria (o a través de su flujo de trabajo).
  - Prompts Laterales: Pueden ejecutarse Después de la Memoria, en umbrales de Intervalo o manualmente con /sideprompt.

- Forma del prompt
  - Ruta de Memoria: Utiliza un preajuste dedicado del "Administrador de Prompts de Resumen" con un contrato JSON estricto; STMB valida/repara el JSON.
  - Prompts Laterales: Utiliza el texto de instrucción de la plantilla + entrada anterior opcional + memorias anteriores opcionales + texto de la escena compilada; no se requiere un esquema JSON (el Formato de Respuesta opcional es solo una guía).

- Salida y almacenamiento
  - Ruta de Memoria: Un objeto JSON: { title, content, keywords } → se almacena como una entrada de memoria utilizada para la recuperación.
  - Prompts Laterales: Contenido de texto sin formato → se almacena como una entrada de lorebook titulada "Nombre (STMB SidePrompt)" (los nombres heredados se reconocen para las actualizaciones). No se requieren palabras clave.

- Inclusión en el prompt del chat
  - Ruta de Memoria: Las entradas se seleccionan a través de etiquetas/palabras clave, prioridades, ámbitos y presupuestos de tokens.
  - Prompts Laterales: La inclusión se rige por la configuración de inyección en el lorebook de cada plantilla (constante vs. vectorizado, posición, orden).

- Selección de modelo/perfil
  - Ruta de Memoria: Utiliza los perfiles de memoria definidos en el Administrador de Prompts de Resumen de STMB.
  - Prompts Laterales: Utiliza el perfil predeterminado de STMB (que puede reflejar la interfaz de usuario actual de ST) a menos que se habilite una anulación a nivel de plantilla.

- Concurrencia y procesamiento por lotes
  - Ruta de Memoria: Ejecución única por generación.
  - Prompts Laterales: Las ejecuciones Después de la Memoria se procesan por lotes con concurrencia limitada; los resultados se pueden previsualizar y guardar en oleadas.

- Controles de tokens/tamaño
  - Ruta de Memoria: STMB estima el uso de tokens y aplica un contrato JSON.
  - Prompts Laterales: Compila una ventana de escena limitada y opcionalmente agrega algunas memorias recientes; sin aplicación estricta de JSON.

## Notas estilo Preguntas Frecuentes

- "¿Cambiará esto la forma en que escribo los mensajes?"
  No mucho. Principalmente, seleccionas las entradas y dejas que STMB incluya automáticamente las correctas.

- "¿Puedo ver lo que realmente se envió a la IA?"
  Sí, revisa tu Terminal para inspeccionar lo que se inyectó.
