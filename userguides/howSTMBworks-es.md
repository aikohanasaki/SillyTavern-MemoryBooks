# Cómo funciona SillyTavern Memory Books (STMB)

Esta es una explicación de alto nivel de cómo funciona STMB. No pretende explicar el código. En su lugar, este documento explica qué información ensambla STMB, en qué orden la envía y qué se espera que devuelva el modelo.

Utiliza este documento para ayudarte a escribir o editar prompts para STMB.

## Los 3 flujos principales de prompts de STMB

STMB tiene tres flujos principales:

1. Generación de memoria
2. Prompts secundarios
3. Consolidación

Están relacionados, pero no esperan el mismo tipo de salida.

- La generación de memoria espera JSON estricto.
- Los prompts secundarios normalmente esperan texto limpio en formato plano. Pueden usar Markdown u otros formatos de entrada de lorebook, pero NO uses JSON en los prompts secundarios.
- La consolidación espera JSON estricto, pero con un esquema distinto al de las memorias.

## I. Generación de memoria

Cuando creas una memoria, STMB envía un único prompt ensamblado que normalmente contiene estas partes en este orden:

1. El texto del prompt o preajuste de memoria seleccionado
   - Este es el bloque de instrucciones del Gestor de Prompts de Resumen.
   - Le dice al modelo qué tipo de resumen debe escribir y qué forma JSON debe devolver.
   - Las macros como `{{user}}` y `{{char}}` se resuelven antes del envío.

2. Contexto opcional de memorias anteriores
   - Si la ejecución se configuró para incluir memorias anteriores, se insertan como contexto de solo lectura.
   - Se marcan claramente como contexto y no como el contenido que debe resumirse otra vez.

3. La transcripción de la escena actual
   - El rango de chat seleccionado se formatea línea por línea como `Speaker: message`.
   - Esta es la escena real que el modelo debe convertir en una memoria.

Forma muy aproximada:

```text
[instrucciones del prompt o preajuste de memoria]

=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
[cero o más memorias anteriores]
=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
Alice: ...
Bob: ...
=== END SCENE ===
```

### Lo que debe devolver el modelo

Esperamos un único objeto JSON:

```json
{
  "title": "Short scene title",
  "content": "The actual memory text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

Mejores prácticas:

- Devuelve solo el objeto JSON.
- Usa exactamente las claves `title`, `content` y `keywords`.
- Haz que `keywords` sea un array JSON real de cadenas.
- Mantén el título corto y legible.
- Haz que las palabras clave sean concretas y fáciles de recuperar: lugares, objetos, nombres propios, acciones distintivas e identificadores.

STMB a veces puede rescatar una salida ligeramente desordenada, pero los prompts no deben depender de eso.

### Lo que hace que un prompt de memoria sea bueno

Los buenos prompts de memoria hacen cuatro cosas con claridad:

1. Le dicen al modelo qué tipo de memoria debe escribir
   - Registro detallado de la escena
   - Sinopsis compacta
   - Recapitulación mínima
   - Memoria narrativa con tono literario

2. Le dicen al modelo qué es lo importante
   - giros de la historia
   - decisiones
   - cambios en los personajes
   - revelaciones
   - resultados
   - detalles importantes para la continuidad

3. Le dicen al modelo que debe ignorar
   - normalmente el contenido OOC
   - relleno
   - charla de ambientación, si quieres una memoria más ajustada

4. Le dicen al modelo exactamente qué JSON debe devolver

### Lo que hace que un prompt de memoria sea debil

Los prompts débiles suelen fallar de una de estas maneras:

- Describen el estilo de escritura, pero no la forma JSON.
- Piden "análisis útiles" o "pensamientos" en lugar de un objeto de memoria final.
- Fomentan palabras clave abstractas en vez de términos concretos para recuperación.
- No distinguen entre el contexto previo y la escena actual.
- Piden demasiados formatos de salida a la vez.

### Consejos prácticos para escribir prompts de memoria

- Deja claro si el resumen debe ser exhaustivo o eficiente en tokens.
- Si quieres Markdown dentro de `content`, dilo de forma directa.
- Si quieres memorias cortas, limita el cuerpo, no el esquema JSON.
- Si quieres una recuperación fuerte, dedica espacio del prompt a la calidad de las palabras clave, no solo al estilo del resumen.
- Trata las memorias anteriores como contexto de continuidad, no como material que deba reescribirse.

## II. Prompts secundarios

Los prompts secundarios NO son memorias. Son prompts de seguimiento o actualización que normalmente escriben o sobrescriben una entrada independiente del lorebook. Es un concepto muy distinto al de una memoria y es importante tenerlo presente.

Cuando se ejecuta un prompt secundario, STMB normalmente ensambla estas partes en este orden:

1. El texto principal de instrucciones del prompt secundario
   - Este es el prompt real de la tarea para ese rastreador.
   - Las macros estándar de SillyTavern como `{{user}}` y `{{char}}` se resuelven.
   - Las macros personalizadas en tiempo de ejecución también pueden insertarse en ejecuciones manuales.

2. Entrada previa opcional
   - Si ese prompt secundario ya tiene contenido guardado, STMB puede incluir primero la versión actual.
   - Esto permite que el modelo actualice un rastreador existente en lugar de escribirlo desde cero cada vez.

3. Contexto opcional de memorias anteriores
   - Si la plantilla pide memorias anteriores, STMB las inserta como contexto de solo lectura.

4. El texto compilado de la escena
   - Este es el material de la escena actual al que el rastreador debe reaccionar.

5. Orientación opcional sobre el formato de respuesta
   - Esto no se aplica como un esquema analizado por parser.
   - Es simplemente una instrucción adicional sobre el formato de salida que quieres.

Forma muy aproximada:

```text
[instrucciones del prompt secundario]

=== PRIOR ENTRY ===
[texto actual del rastreador, si existe]

=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
[memorias anteriores opcionales]
=== END PREVIOUS SCENE CONTEXT ===

=== SCENE TEXT ===
[texto compilado de la escena]

=== RESPONSE FORMAT ===
[guía opcional de formato]
```

### Lo que debe devolver el modelo

STMB espera texto plano listo para guardarse.

Esa es la diferencia clave respecto a las memorias:

- Los prompts secundarios no quieren JSON.
- STMB normalmente guarda el texto devuelto tal cual.
- Si pides JSON dentro de un prompt secundario, ese JSON será solo texto, a menos que tu propio flujo dependa de ello.

Eso significa que los prompts secundarios deben apuntar a una salida final utilizable, no a un JSON amable con el parser de memorias.

### Lo que hace que un prompt secundario sea bueno

Los buenos prompts secundarios son concretos, estables y fáciles de actualizar.

Ejemplos:

- Mantener una lista de personajes por orden de importancia.
- Rastrear el estado actual de las relaciones.
- Seguir los hilos de trama no resueltos.
- Rastrear lo que `{{char}}` cree actualmente sobre `{{user}}`.

La mejor redacción para un prompt secundario suele hacer esto:

1. Define el trabajo con claridad
   - "Mantén un rastreador del elenco"
   - "Actualiza la hoja actual de relaciones"
   - "Mantén un informe de hilos no resueltos"

2. Dice si debe actualizar, reemplazar o anexar
   - Esto importa porque puede incluirse el texto de la entrada previa.

3. Define el formato de salida
   - encabezados
   - estructura de viñetas
   - secciones
   - reglas de orden

4. Dice lo que no debe incluir
   - especulaciones
   - elementos duplicados
   - información obsoleta
   - narración sobre la propia tarea

### Lo que hace que un prompt secundario sea débil

- Es demasiado amplio: "rastrea todo".
- Nunca dice si la entrada anterior debe revisarse o reescribirse.
- Pide cadena de pensamiento o explicaciones en vez de texto final de rastreador.
- Deja el formato demasiado vago, así que el rastreador deriva con el tiempo.

### Consejos prácticos para escribir prompts secundarios

- Escribe los prompts secundarios como instrucciones de mantenimiento, no como prompts de resumen.
- Da por hecho que el modelo puede ver primero el rastreador actual y después la escena nueva.
- Mantén cada rastreador centrado en una sola tarea.
- Usa el campo Formato de Respuesta para controlar el diseño, los nombres de las secciones y el orden.

## III. Consolidación

La consolidación combina entradas de nivel inferior en resúmenes de nivel superior.

Ejemplos:

- memorias en resúmenes de arco
- resúmenes de arco en resúmenes de capítulo
- resúmenes de capítulo en resúmenes de libro

Cuando se ejecuta la consolidación, STMB normalmente ensambla estas partes en este orden:

1. El texto del prompt o preajuste de consolidación seleccionado
   - Explica cómo debe comprimir el modelo las entradas de origen.
   - También define el esquema JSON que el modelo debe devolver.

2. Resumen opcional anterior de nivel superior
   - Si se está arrastrando un resumen anterior de esa capa, se incluye primero como contexto canónico.
   - El prompt le dice al modelo que no debe reescribirlo.

3. Las entradas seleccionadas de nivel inferior en orden cronológico
   - Cada elemento de origen se incluye con identificador, título y contenido.
   - Ese es el material que el modelo debe agrupar, comprimir y convertir en resúmenes de nivel superior.

Forma muy aproximada:

```text
[instrucciones del prompt o preajuste de consolidación]

=== PREVIOUS ARC/CHAPTER/BOOK (CANON - DO NOT REWRITE) ===
[resumen anterior de nivel superior, opcional]
=== END PREVIOUS ... ===

=== MEMORIES / ARCS / CHAPTERS ===
=== memory 001 ===
Title: ...
Contents: ...
=== end memory 001 ===

=== memory 002 ===
Title: ...
Contents: ...
=== end memory 002 ===
...
=== END ... ===
```

### Lo que debe devolver el modelo

STMB espera un objeto JSON con esta forma:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "The consolidated recap text",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this item was left out"
    }
  ]
}
```

Idea importante:

- La consolidación puede devolver un resumen o varios.
- `member_ids` le dice a STMB que entradas de origen pertenecen a cada resumen devuelto.
- `unassigned_items` es la manera en que el modelo dice "esta entrada no encaja en el resumen que acabo de crear".

### Lo que hace que un prompt de consolidación sea bueno

Los buenos prompts de consolidación hacen bien tres cosas:

1. Definen el objetivo de compresión
   - un solo arco
   - uno o varios arcos
   - recapitulación compacta pero completa
   - recapitulación muy comprimida

2. Definen la lógica de selección
   - preservar la cronología
   - mantener la continuidad
   - fusionar elementos relacionados
   - dejar sin asignar los elementos no relacionados

3. Definen con claridad la estructura JSON

Los mejores prompts de consolidación también le dicen al modelo qué debe conservar:

- los grandes hitos
- los puntos de inflexión
- las promesas
- las consecuencias
- los hilos no resueltos
- los cambios en las relaciones
- las citas o identificadores críticos para la continuidad

### Lo que hace que un prompt de consolidación sea débil

- Pide una recapitulación, pero nunca explica cómo agrupar las entradas de origen.
- No le dice al modelo qué debe hacer con los elementos que no encajan.
- No exige `member_ids`.
- Pide prosa libre en lugar del objeto JSON de consolidación.
- Se centra demasiado en el estilo y define demasiado poco la selección y la agrupación.

### Consejos prácticos para escribir prompts de consolidación

- Dile al modelo si quieres una sola recapitulación coherente o el menor número coherente posible de recapitulaciones.
- Exige cronología.
- Exige un tratamiento explícito de los elementos sobrantes.
- Mantén también aquí las palabras clave como elementos concretos; los resúmenes de nivel superior siguen necesitando valor para recuperación.

## La regla real para escribir prompts

Cuando escribas para STMB, no pienses solo: "¿Qué quiero que diga la IA?"

Piensa:

1. ¿Qué contexto pondrá STMB antes de la escena?
2. ¿Cuál es la unidad real de material que se está analizando?
3. ¿Este flujo espera JSON estricto o texto plano final?
4. ¿Qué información debe sobrevivir para la recuperación posterior?
5. ¿Qué debe ignorar, comprimir, preservar o arrastrar el modelo?

Si tu prompt responde con claridad a esas cinco preguntas, normalmente funcionará bien con STMB.

## Notas de tipo FAQ

- "¿Puedo ver lo que realmente se envió a la IA?"
  Sí. Revisa la salida de tu terminal o del log si quieres inspeccionar el prompt ensamblado.

- "¿STMB fuerza una buena salida aunque mi prompt sea débil?"
  No realmente. STMB a veces puede rescatar JSON malformado, pero no puede arreglar un prompt vago que pidió la cosa equivocada.

- "¿Qué debería optimizar primero al reescribir prompts?"
  Primero optimiza el formato de salida. Después optimiza qué detalles deben preservarse. El estilo va después.
