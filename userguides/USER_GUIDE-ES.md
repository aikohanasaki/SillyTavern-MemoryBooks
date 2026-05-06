# 📕 ST Memory Books - Su Asistente de Memoria de Chat con IA

**¡Convierta sus interminables conversaciones de chat en recuerdos organizados y con capacidad de búsqueda!**

¿Necesita que el bot recuerde cosas, pero el chat es demasiado largo para el contexto? ¿Quiere rastrear automáticamente puntos importantes de la trama sin tomar notas manualmente? ST Memory Books hace exactamente eso: observa sus chats y crea resúmenes inteligentes para que nunca vuelva a perder el hilo de su historia.

(¿Busca detalles técnicos tras bastidores? Tal vez prefiera leer [Cómo funciona STMB](howSTMBworks-es.md) en su lugar).

---

## 📑 Tabla de Contenidos

- [🚀 Inicio Rápido (¡5 Minutos para su Primera Memoria!)](#-inicio-rápido-5-minutos-para-su-primera-memoria)
  - [Paso 1: Encuentre la Extensión](#paso-1-encuentre-la-extensión)
  - [Paso 2: Active la Auto-Magia](#paso-2-active-la-auto-magia)
  - [Paso 3: Chatee Normalmente](#paso-3-chatee-normalmente)
- [💡 Lo que ST Memory Books Realmente Hace](#-lo-que-st-memory-books-realmente-hace)
  - [🤖 Resúmenes Automáticos](#-resúmenes-automáticos)
  - [✋ Creación Manual de Memoria](#-creación-manual-de-memoria)
  - [📊 Prompts Secundarios y Rastreadores Inteligentes](#-prompts-secundarios-y-rastreadores-inteligentes)
  - [📚 Colecciones de Memoria](#-colecciones-de-memoria)
- [🎯 Elija su Estilo](#-elija-su-estilo)
- [✂️ Clip to Memory Book](#%EF%B8%8F-clip-to-memory-book)
  - [¿Cuándo debería usar Clips?](#cuándo-debería-usar-clips)
  - [Cómo funciona el clipping](#cómo-funciona-el-clipping)
  - [Crear o renombrar entradas de Clip](#crear-o-renombrar-entradas-de-clip)
  - [Botón flotante de tijeras](#botón-flotante-de-tijeras)
  - [Revisar entradas de Clip largas](#revisar-entradas-de-clip-largas)
- [✂️ Clips vs Side Prompts](#️-clips-vs-side-prompts)
- [🙈 Ahorro de tokens: ocultar / mostrar](#-ahorro-de-tokens-ocultar--mostrar)
  - [¿Qué significa “ocultar”?](#qué-significa-ocultar)
  - [¿Cuándo sirve?](#cuándo-sirve)
  - [Auto-hide después de crear memoria](#auto-hide-después-de-crear-memoria)
  - [Mostrar antes de generar memoria](#mostrar-antes-de-generar-memoria)
  - [Ajuste inicial recomendable](#ajuste-inicial-recomendable)
- [🧭 Compaction vs Consolidation](#-compaction-vs-consolidation)
- [🌈 Consolidación de resúmenes](#-consolidación-de-resúmenes)
  - [¿Qué es?](#qué-es)
  - [¿Cuándo usarlo?](#cuándo-usarlo)
  - [¿Se ejecuta sola?](#se-ejecuta-sola)
  - [¿Qué se consolida?](#qué-se-consolida)
  - [¿Cómo se usa?](#cómo-se-usa)
- [🎨 Rastreadores, Prompts Secundarios y Plantillas (Función Avanzada)](#-rastreadores-prompts-secundarios-y-plantillas-función-avanzada)
  - [🚀 Inicio Rápido con Plantillas](#-inicio-rápido-con-plantillas)
  - [⚙️ Cómo Funcionan los Prompts Secundarios](#-cómo-funcionan-los-prompts-secundarios)
  - [🛠️ Gestión de Prompts Secundarios](#-gestión-de-prompts-secundarios)
  - [💡 Ejemplos de Plantillas](#-ejemplos-de-plantillas)
  - [🔧 Creación de Prompts Secundarios Personalizados](#-creación-de-prompts-secundarios-personalizados)
  - [💬 Consejo Pro](#-consejo-pro)
  - [⌨️ Sintaxis manual /sideprompt](#-sintaxis-manual-sideprompt)
  - [🧠 Control Avanzado de Texto con la Extensión Regex](#-control-avanzado-de-texto-con-la-extensión-regex)
- [🧹 Compactación](#-compactación)
- [⚙️ Configuraciones que Realmente Importan](#-configuraciones-que-realmente-importan)
- [🔧 Solución de Problemas (Cuando las Cosas No Funcionan)](#-solución-de-problemas-cuando-las-cosas-no-funcionan)
- [🚫 Lo que ST Memory Books No Hace](#-lo-que-st-memory-books-no-hace)
- [💡 Obtener Ayuda y Más Información](#-obtener-ayuda-y-más-información)
  - [📚 Potencia con Ordenamiento de Lorebook (STLO)](#-potencia-con-ordenamiento-de-lorebook-stlo)

## 🚀 Inicio Rápido (¡5 Minutos para su Primera Memoria!)

**¿Nuevo en ST Memory Books?** Vamos a configurarlo con su primera memoria automática en solo unos clics:

### Paso 1: Encuentre la Extensión

* Busque el icono de la varita mágica (🪄) junto a su cuadro de entrada de chat.
* Haga clic en él, luego haga clic en **"Memory Books"**.
* Verá el panel de control de ST Memory Books.

### Paso 2: Active la Auto-Magia

* En el panel de control, busque **"Crear resúmenes de memoria automáticamente"**.
* Enciéndalo (ON).
* Configure **Intervalo de Auto-Resumen** en **20-30 mensajes** (un buen punto de partida).
* Mantenga **Búfer de Auto-Resumen** bajo al principio (`0-2` suele ir bien).
* Cree primero una memoria manual para dejar el chat primado.
* ¡Eso es todo! 🎉

### Paso 3: Chatee Normalmente

* Siga chateando como de costumbre.
* Después de 20-30 mensajes nuevos, ST Memory Books automáticamente:
* Usará los mensajes nuevos desde el último punto procesado.
* Le pedirá a su IA que escriba un resumen.
* Lo guardará en su colección de memoria.
* Le mostrará una notificación cuando termine.



**¡Felicidades!** Ahora tiene gestión de memoria automatizada. ¡No más olvidar lo que sucedió hace capítulos!

---

## 💡 Lo que ST Memory Books Realmente Hace

Piense en ST Memory Books como su **bibliotecario personal de IA** para conversaciones de chat:

### 🤖 **Resúmenes Automáticos**

*"No quiero pensar en ello, solo haz que funcione"*

* Observa su chat en segundo plano.
* Crea automáticamente recuerdos cada X mensajes.
* Perfecto para juegos de rol largos, escritura creativa o historias en curso.

### ✋ **Creación Manual de Memoria**

*"Quiero control sobre lo que se guarda"*

* Marque escenas importantes con botones de flecha simples (► ◄).
* Cree recuerdos bajo demanda para momentos especiales.
* Ideal para capturar puntos clave de la trama o desarrollos de personajes.

### 📊 **Prompts Secundarios y Rastreadores Inteligentes**

*"Quiero rastrear relaciones, hilos de la trama o estadísticas"*

* Fragmentos de prompt reutilizables que mejoran la generación de memoria.
* Biblioteca de plantillas con rastreadores listos para usar.
* Prompts de IA personalizados que rastrean cualquier cosa que desee.
* Actualice automáticamente marcadores, estado de relaciones, resúmenes de tramas.
* Ejemplos: "¿A quién le gusta quién?", "Estado actual de la misión", "Rastreador de estado de ánimo del personaje".

### 📚 **Colecciones de Memoria**

*Donde viven todos sus recuerdos*

* Organizado automáticamente y con capacidad de búsqueda.
* Funciona con el sistema de lorebooks (libros de saber) integrado de SillyTavern.
* Su IA puede hacer referencia a recuerdos pasados en nuevas conversaciones.

---

## 🎯 Elija su Estilo

<details>
<summary><strong>🔄 "Configurar y Olvidar" (Recomendado para Principiantes)</strong></summary>

**Perfecto si desea:** Automatización sin intervención que simplemente funciona.

**Cómo funciona:**

1. Active `Crear resúmenes de memoria automáticamente`.
2. Ajuste `Intervalo de Auto-Resumen` según la velocidad de su chat.
3. Opcionalmente use un `Búfer de Auto-Resumen` pequeño si desea generación tardía.
4. Siga chateando normalmente después de crear una primera memoria manual.

**Lo que obtiene:**

* No requiere trabajo manual.
* Creación de memoria consistente.
* Nunca se pierda ritmos importantes de la historia.
* Funciona tanto en chats individuales como grupales.

**Consejo pro:** Comience con 30 mensajes, luego ajuste según su estilo de chat. Los chats rápidos pueden querer más de 50, los chats detallados más lentos pueden preferir 20.

</details>

<details>
<summary><strong>✋ "Control Manual" (Para Creación de Memoria Selectiva)</strong></summary>

**Perfecto si desea:** Decidir exactamente qué se convierte en una memoria.

**Cómo funciona:**

1. Busque los pequeños botones de flecha (► ◄) en sus mensajes de chat.
2. Haga clic en ► en el primer mensaje de una escena importante.
3. Haga clic en ◄ en el último mensaje de esa escena.
4. Abra Memory Books (🪄) y haga clic en "Crear Memoria".

**Lo que obtiene:**

* Control total sobre el contenido de la memoria.
* Perfecto para capturar momentos específicos.
* Ideal para escenas complejas que necesitan límites cuidadosos.

**Consejo pro:** Los botones de flecha aparecen unos segundos después de cargar un chat. Si no los ve, espere un momento o actualice la página.

</details>

<details>
<summary><strong>⚡ "Usuario Avanzado" (Comandos de Barra)</strong></summary>

**Perfecto si desea:** Atajos de teclado y funciones avanzadas.

**Comandos esenciales:**

* `/scenememory 10-25` - Crear memoria de los mensajes 10 al 25.
* `/creatememory` - Crear memoria de la escena marcada actualmente.
* `/nextmemory` - Resumir todo desde la última memoria.
* `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - Ejecutar rastreador personalizado, con rango opcional.
* `/sideprompt-on "Name"` o `/sideprompt-off "Name"` - Activar o desactivar un Side Prompt manualmente.
* `/stmb-set-highest <N|none>` - Ajustar la base de auto-summary para el chat actual.

**Lo que obtiene:**

* Creación de memoria ultrarrápida.
* Operaciones por lotes.
* Integración con flujos de trabajo personalizados.

</details>

---

## ✂️ Clip to Memory Book

Use **Clip to Memory Book** cuando quiera guardar una línea o dato importante sin crear una memoria de escena completa. Resalte texto en el chat, haga clic en el botón flotante de tijeras y luego elija una entrada de Clip existente o cree una nueva.

¿No sabe si esto debería ser un Clip o un Side Prompt? Consulte [Clips vs Side Prompts](#-clips-vs-side-prompts).

### ¿Cuándo debería usar Clips?

Los Clips son mejores para datos pequeños que quiere que la IA recuerde, por ejemplo:

- una preferencia de un personaje
- una promesa o secreto
- un detalle de relación
- una mascota, lugar, objeto o detalle recurrente
- una “nota para mí” rápida que no necesita una memoria completa

Para escenas más grandes, use la creación normal de Memory.

### Cómo funciona el clipping

1. Resalte la oración o frase que quiere guardar.
2. Haga clic en el botón flotante de tijeras.
3. Elija una entrada de Clip existente o cree una nueva.
4. Revise la vista previa de la entrada.
5. Guarde el Clip.

Las entradas de Clip son entradas normales de lorebook marcadas con `[STMB Clip]`. Por ejemplo:

```txt
Seraphina Healed Me [STMB Clip]
```

Dentro de la entrada, STMB mantiene el contenido en un formato de sección limpio:

```md
=== Seraphina Healed Me ===

- Seraphina healed my wounds with magic.

=== END Seraphina Healed Me ===
```

### Crear o renombrar entradas de Clip

Cuando crea una nueva entrada de Clip, el título de la entrada también se convierte en el encabezado de la sección. Puede renombrar la entrada mientras crea el Clip, y STMB actualizará el encabezado de la sección para que coincida.

Las nuevas entradas de Clip pueden ser:

- **siempre activas**, para datos que deberían estar siempre disponibles
- **activadas por palabras clave**, para datos que solo deberían aparecer cuando surjan palabras coincidentes

Use palabras clave cuando el Clip solo sea relevante para un tema, personaje, lugar, mascota, objeto o relación concretos.

### Botón flotante de tijeras

El botón flotante de tijeras solo aparece después de resaltar texto dentro del chat. Puede activarlo o desactivarlo en el popup principal de Memory Books.

### Revisar entradas de Clip largas

Si una entrada de Clip se vuelve larga, STMB puede recordarle que la revise. Puede editarla usted mismo, o usar **Compactación** para pedirle a la IA que haga una entrada de Clip, Side Prompt o Memory de STMB más eficiente en tokens antes de decidir si reemplaza la original.

---

## ✂️ Clips vs Side Prompts

Los Clips y Side Prompts guardan información en su Memory Book, pero no sirven para el mismo trabajo.

Regla simple: **los Clips guardan un dato específico. Los Side Prompts mantienen un rastreador vivo.**

| **Clips** | **Side Prompts** |
|---|---|
| Guardan texto seleccionado del chat en una entrada de Memory Book. | Piden a la IA que revise el chat y actualice una entrada de rastreador. |
| Son mejores para un dato claro, una línea, una promesa, una preferencia, un objeto o una nota. | Son mejores para información que cambia con el tiempo, como el estado de una relación, el progreso de una misión, inventario o hilos de trama sin resolver. |
| Usted elige el texto exacto. STMB guarda lo que seleccionó. | La IA interpreta el chat y escribe o actualiza el rastreador. |
| Úselos cuando el dato ya es obvio y no necesita análisis. | Úselos cuando la IA necesita comparar, resumir o actualizar estado a partir de varios mensajes. |
| Normalmente crecen solo cuando usted añade otro Clip manualmente. | Pueden actualizarse repetidamente conforme cambia la historia. |
| Piense: “fijar esta nota”. | Piense: “mantener esta sección actualizada”. |

Ejemplos de buenos Clips:

- `Aiko likes honey tea.`
- `Andalino promised not to lie to her again.`
- `Colt calls her Boss.`

Ejemplos de buenos Side Prompts:

- estado de relación
- progreso actual de misión
- inventario y recursos
- directorio de NPCs
- hilos de trama sin resolver

Si solo necesita recordar un detalle, use un Clip. Si necesita un rastreador continuo, use un Side Prompt.

---

## 🙈 Ahorro de tokens: ocultar / mostrar

Una de las maneras más simples de reducir el desorden y ahorrar tokens en chats largos es ocultar mensajes después de convertirlos en memoria.

### ¿Qué significa “ocultar”?

Ocultar no borra nada. Los mensajes siguen en el chat y los recuerdos siguen en el lorebook; solo dejan de enviarse directamente a la IA.

### ¿Cuándo sirve?

* Su chat ya es muy largo
* Ya convirtió esos mensajes en memoria
* Quiere limpiar la vista del chat

### Auto-hide después de crear memoria

STMB puede ocultar automáticamente mensajes después de crear una memoria:

* **No ocultar automáticamente**: no oculta nada automáticamente
* **Ocultar automáticamente todos los mensajes hasta la última memoria**: oculta todo lo ya cubierto
* **Ocultar automáticamente solo los mensajes de la última memoria**: oculta solo el último rango procesado

También puede definir cuántos mensajes recientes permanecen visibles con **Mensajes a dejar visibles**.

### Mostrar antes de generar memoria

**Mostrar mensajes ocultos para la generación de memoria (ejecuta /unhide X-Y)** hace que STMB ejecute temporalmente `/unhide X-Y` antes de generar la memoria.

### Ajuste inicial recomendable

* **Ocultar automáticamente solo los mensajes de la última memoria**
* dejar **2** mensajes visibles
* activar **Mostrar mensajes ocultos para la generación de memoria (ejecuta /unhide X-Y)** si suele rehacer memorias o necesita volver a ver rangos concretos antes de generar

## 🧭 Compaction vs Consolidation

Los nombres se parecen, pero hacen trabajos distintos.

Regla simple: **la Compactación limpia una entrada. La Consolidación combina varios recuerdos en una recapitulación de nivel superior.**

| **Compaction / Compactación** | **Consolidation / Consolidación** |
|---|---|
| Hace más pequeña una entrada existente gestionada por STMB. | Combina varios recuerdos o resúmenes en una recapitulación de nivel superior. |
| Trabaja con un Clip, una entrada de Side Prompt o una entrada de Memory de STMB a la vez. | Trabaja a partir de varias entradas de memoria/resumen seleccionadas. |
| Es mejor cuando una entrada es útil, pero demasiado larga, repetitiva o cara de mantener en contexto. | Es mejor cuando los recuerdos de escenas antiguas se acumulan y deberían convertirse en un resumen Arc, Chapter, Book, Legend, Series o Epic. |
| Reescribe la entrada seleccionada de forma más eficiente en tokens. | Crea una nueva entrada de resumen a partir de las entradas fuente seleccionadas. |
| Debe conservar los datos existentes y eliminar relleno. | Debe conservar el arco de continuidad mayor y reducir el detalle escena por escena. |
| No crea una nueva memoria a partir del chat sin procesar. | No compacta por sí sola una entrada inflada. |
| Piense: “recortar esta entrada”. | Piense: “agrupar estos recuerdos en una recapitulación”. |

Ambas herramientas son de revisión previa. STMB le muestra lo que escribió la IA antes de guardar o reemplazar nada.

---

## 🌈 Consolidación de resúmenes

La consolidación ayuda a mantener las historias largas manejables al comprimir memorias antiguas de STMB en entradas de resumen de nivel superior.

### ¿Qué es?

STMB puede combinar recuerdos o resúmenes existentes en un resumen más compacto. El primer nivel es **Arc** y también existen **Chapter**, **Book**, **Legend**, **Series** y **Epic**.

### ¿Cuándo usarlo?

* Su lista de recuerdos ya es muy larga
* Los recuerdos antiguos ya no necesitan detalle escena por escena
* Quiere ahorrar tokens sin perder continuidad
* Quiere resúmenes narrativos más limpios y de nivel superior

### ¿Se ejecuta sola?

No. La consolidación sigue necesitando confirmación.

* Puede abrir **Consolidar las memorias** manualmente desde el popup principal
* También puede activar **Avisar para consolidar cuando una capa esté lista**
* Cuando un nivel de destino seleccionado alcanza su mínimo guardado, STMB muestra una confirmación de **sí / luego**
* Elegir **Yes** solo abre el popup de consolidación con esa capa ya seleccionada; no la ejecuta en silencio
* Esto no sustituye a la consolidación manual, solo la vuelve más fácil de descubrir cuando ya hay suficientes entradas

### ¿Qué se consolida?

* Los recuerdos normales de STMB sí se consolidan
* Los resúmenes de nivel superior también se pueden volver a consolidar
* Los Prompts Secundarios son rastreadores y no se mezclan en Arc/Chapter

### ¿Cómo se usa?

1. Haga clic en **Consolidar las memorias**
2. Elija el nivel destino
3. Seleccione las entradas fuente
4. Decida si quiere desactivar las fuentes tras crear el resumen
5. Pulse **Run**

Si la IA devuelve una mala respuesta de consolidación, puede revisarla y corregirla antes de volver a confirmar.
Si no aparece el aviso automático, compruebe que la opción de confirmación esté activada y que el nivel objetivo esté incluido en **Niveles de Auto-Consolidación**.

---

## 🎨 Rastreadores, Prompts Secundarios y Plantillas (Función Avanzada)

Los **Prompts Secundarios** son rastreadores en segundo plano que ayudan a mantener la información de la historia en curso.
Crean entradas separadas de Side Prompt en el lorebook y se ejecutan junto con la creación de memoria. Piense en ellos como **ayudantes que observan su historia y mantienen ciertos detalles actualizados**.
Las macros estándar de ST como `{{user}}` y `{{char}}` se expanden en `Prompt`, `Response Format`, `Title` y otros campos de texto. Las macros no estándar `{{...}}` se convierten en entradas obligatorias cuando ejecuta el prompt manualmente.

### 🚀 **Inicio Rápido con Plantillas**

1. Abra la configuración de Memory Books.
2. Haga clic en **Prompts Secundarios**.
3. Navegue por la **biblioteca de plantillas** y elija lo que se ajuste a su historia:
* **Character Development Tracker** – Rastrea cambios de personalidad y crecimiento.
* **Relationship Dynamics** – Rastrea las relaciones entre personajes.
* **Plot Thread Tracker** – Rastrea historias en curso.
* **Mood & Atmosphere** – Rastrea el tono emocional.
* **World Building Notes** – Rastrea detalles del entorno y el lore.


4. Habilite las plantillas que desee (puede personalizarlas más tarde).
5. Si la plantilla contiene macros de tiempo de ejecución personalizadas, no se ejecutará automáticamente y deberá iniciarse manualmente con `/sideprompt`.

### ⚙️ **Cómo Funcionan los Prompts Secundarios**

* **Rastreadores en segundo plano**: se ejecutan silenciosamente y actualizan la información con el tiempo.
* **No intrusivos**: no cambian la configuración principal de su IA ni los prompts de los personajes.
* **Control por chat**: diferentes chats pueden usar rastreadores distintos.
* **Basados en plantillas**: use plantillas integradas o cree las suyas propias.
* **Automáticos o manuales**: las plantillas normales pueden ejecutarse automáticamente; las plantillas con macros de tiempo de ejecución personalizadas son solo manuales.
* **Compatibilidad con macros**: `Prompt`, `Response Format` y `Title` expanden macros estándar de ST como `{{user}}` y `{{char}}`.
* **Macros de tiempo de ejecución**: los tokens no estándar `{{...}}` se convierten en entradas obligatorias como `{{npc name}}="Jane Doe"`.
* **Texto plano permitido**: un Side Prompt no tiene que devolver JSON.
* **Comportamiento de sobrescritura**: el Side Prompt actualiza su propia entrada rastreada con el tiempo en lugar de crear una memoria nueva cada vez.

Esto hace que el comportamiento del disparador sea comprensible sin términos técnicos.

### 🛠️ **Gestión de Prompts Secundarios**

* **Administrador de Prompts Secundarios**: cree, edite, duplique y organice rastreadores.
* **Enable / Disable**: encienda o apague los rastreadores en cualquier momento.
* **Import / Export**: comparta plantillas o haga copias de seguridad.
* **Status View**: vea qué rastreadores están activos en el chat actual.
* **Controles de seguridad**: si una plantilla contiene macros de tiempo de ejecución personalizadas, STMB elimina `onInterval` y `onAfterMemory` al guardar/importar y muestra una advertencia.

### 💡 **Ejemplos de Plantillas**

* Biblioteca de Plantillas de Prompts Secundarios (importe este JSON):
[SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Ideas de ejemplo para prompts:

* "Rastrear diálogos importantes e interacciones de personajes".
* "Mantener actualizado el estado actual de la misión".
* "Anotar nuevos detalles de construcción del mundo cuando aparezcan".
* "Rastrear la relación entre el Personaje A y el Personaje B".

### 🔧 **Creación de Prompts Secundarios Personalizados**

1. Abra el Administrador de Prompts Secundarios.
2. Haga clic en **Crear Nuevo**.
3. Escriba una instrucción corta y clara.
   *(ejemplo: "Siempre anota cómo es el clima en cada escena")*.
4. Añada si hace falta macros estándar de ST o macros de tiempo de ejecución en el formato `{{macro}}="value"`.
5. Guárdelo y habilítelo.
6. El rastreador ahora actualizará esta información con el tiempo si se mantienen los activadores automáticos.

### 💬 **Consejo Pro**

Los Prompts Secundarios funcionan mejor cuando son **pequeños y enfocados**.
En lugar de "rastrear todo", intente "rastrear la tensión romántica entre los personajes principales".

### ⌨️ **Sintaxis manual /sideprompt**

Use:
`/sideprompt "Name" {{macro}}="value" [X-Y]`

Ejemplos:
* `/sideprompt "Status" 10-20`
* `/sideprompt "NPC Directory" {{npc name}}="Jane Doe" 40-50`
* `/sideprompt "Location Notes" {{place name}}="Black Harbor" 100-120`

Notas:
* El nombre del Side Prompt debe ir entre comillas.
* Los valores de las macros de tiempo de ejecución deben ir entre comillas.
* El autocompletado de comandos slash sugerirá las macros obligatorias después de elegir el Side Prompt.
* Si una plantilla contiene macros de tiempo de ejecución personalizadas, STMB la mantiene como manual y elimina los activadores automáticos.
* `X-Y` es opcional. Si lo omite, STMB usa los mensajes desde la última vez que se actualizó ese Side Prompt.
* Si ejecuta Prompts Secundarios manualmente y por separado, recuerde activar **Mostrar mensajes ocultos para la generación de memoria (ejecuta /unhide X-Y)**.

---

### 🧠 Control Avanzado de Texto con la Extensión Regex

ST Memory Books puede ejecutar scripts Regex seleccionados antes de generar y antes de guardar.

* Active en STMB **Usar expresiones regulares (avanzado)**
* Haga clic en **📐 Configurar expresiones regulares…**
* Elija por separado qué scripts deben ejecutarse antes de enviar texto a la IA y antes de guardar
* La selección hecha dentro de STMB cuenta incluso si ese script está desactivado en la extensión Regex

---

## 🧹 Compactación

La compactación ayuda cuando una entrada de lorebook gestionada por STMB sigue siendo útil, pero se ha vuelto demasiado larga o repetitiva. En lugar de recortarla manualmente, puede pedir a la IA que la reescriba de forma más eficiente en tokens.

Es una herramienta de **revisión primero**. STMB muestra el original y el borrador compactado antes de reemplazar nada.

### ¿Qué se puede compactar?

La compactación puede mostrar estas entradas de un Libro de Memoria seleccionado:

- entradas de Clip
- entradas de tracker de Prompt Lateral
- entradas de memoria STMB

No muestra entradas ordinarias de lorebook que STMB no gestiona.

### Cómo usar la compactación

1. Abra el popup de Memory Books.
2. Haga clic en **📝 Compactación**.
3. Seleccione el **Libro de Memoria** que quiere revisar. Si el chat actual ya tiene un Libro de Memoria, puede aparecer seleccionado automáticamente.
4. Seleccione un **Perfil de compactación**. Esto elige qué conexión/modelo de IA reescribirá la entrada.
5. Opcional: haga clic en **Editar prompt de compactación** si quiere cambiar las instrucciones de reescritura.
6. Busque la entrada en la tabla y haga clic en **Compactar entrada**.
7. Revise el resultado:
   - **Contenido original** muestra lo que está guardado actualmente.
   - **Borrador compactado** muestra la reescritura de la IA.
   - Ambos muestran recuentos estimados de tokens.
8. Edite el borrador compactado si hace falta.
9. Elija una opción:
   - **Reemplazar con la versión compactada** para guardar el borrador sobre la entrada original.
   - **Copiar borrador compactado** para copiarlo sin guardar.
   - **Cancelar** para dejar la entrada sin cambios.

STMB no debería reemplazar nunca el original en silencio. Si no hace clic en **Reemplazar con la versión compactada**, la entrada de lorebook se queda como estaba.

### Editar el Prompt de compactación

El Prompt de compactación controla cómo la IA reescribe las entradas. El prompt incorporado es deliberadamente conservador: preservar hechos importantes, nombres, pronombres, macros, encabezados envoltorio y marcadores de fin; eliminar repetición y texto de bajo valor; no inventar nada.

El prompt admite estos marcadores de posición:

- `{{ENTRY_CONTENT}}` — el contenido actual de la entrada. Es obligatorio.
- `{{ENTRY_KIND}}` — el tipo de entrada, como Clip, SidePrompt o Memory.
- `{{ENTRY_TITLE}}` — el título de la entrada.

Use **Restablecer al valor predeterminado** si su prompt personalizado deja de comportarse bien.

### Buenos usos

Use la compactación para:

- entradas de Clip largas
- trackers de Prompt Lateral que se repiten con el tiempo
- entradas de memoria correctas pero infladas
- entradas siempre activas que cuestan demasiados tokens

No la use para:

- crear una memoria nueva desde el chat
- añadir nuevos datos
- arreglar continuidad ausente que nunca estuvo en la entrada
- editar entradas normales de lorebook fuera de STMB

La compactación es una herramienta de limpieza, no una herramienta de generación de memoria.

---

## ⚙️ Configuraciones que Realmente Importan

Para la referencia completa, consulte [readme.md](readme.md).

Controles básicos importantes:

* **Ajustes Actuales de SillyTavern** usa directamente su conexión actual de ST
* **Crear su propio perfil STMB** le permite separar la configuración de memoria de la configuración de rol
* **Mostrar vistas previas de memoria** le permite revisar o editar la salida de la IA antes de guardar
* **Crear resúmenes de memoria automáticamente** activa los recuerdos automáticos
* **Intervalo de Auto-Resumen** y **Búfer de Auto-Resumen** controlan cuándo se ejecutan
* **Ocultar / mostrar mensajes** ayuda a ahorrar tokens
* **Activar Modo Manual de Lorebook** y **Crear automáticamente un lorebook si no existe** controlan dónde se guardan los recuerdos
* **Rastreadores y Prompts secundarios** habilita los rastreadores
* **Compactación** permite limpiar entradas largas de Clip, Prompt Lateral o memoria STMB antes de reemplazarlas
* **Avisar para consolidar cuando una capa esté lista** solo muestra la confirmación de consolidación

---

## 🔧 Solución de Problemas (Cuando las Cosas No Funcionan)

Para la lista completa, consulte [readme.md](readme.md).

Comprobaciones rápidas:

* Asegúrese de que STMB esté activado y que **Memory Books** aparezca en el menú de extensiones
* Si no se activan los recuerdos, confirme que **delay until recursion** esté desactivado
* Si el auto-summary no se ejecuta, confirme que creó primero una memoria manual y que el intervalo/buffer son razonables
* Si los recuerdos no se guardan, asegúrese de que haya un lorebook vinculado al chat o de que **Crear automáticamente un lorebook si no existe** esté activado
* Si el comportamiento de Regex parece incorrecto, revise la selección dentro de **📐 Configurar expresiones regulares…**
* Si no aparecen entradas en **Compactación**, seleccione un Libro de Memoria y confirme que contiene entradas STMB elegibles
* Si la consolidación no aparece, confirme que **Avisar para consolidar cuando una capa esté lista** esté activado y que el nivel objetivo esté incluido en **Capas de auto-consolidación**
* Si la confirmación sí aparece, recuerde que **Yes** solo abre el popup de consolidación; no ejecuta la consolidación por sí sola

---

## 🚫 Lo que ST Memory Books No Hace

* **No es un editor general de lorebooks:** Esta guía se centra en las entradas creadas por STMB. Para la edición general de lorebooks, use el editor de lorebooks integrado de SillyTavern.

---

## 💡 Obtener Ayuda y Más Información

* **Información más detallada:** [readme.md](readme.md)
* **Últimas actualizaciones:** [changelog.md](changelog.md)
* **Convertir lorebooks antiguos:** [lorebookconverter.html](../resources/lorebookconverter.html)
* **Soporte de la comunidad:** ¡Únase a la comunidad de SillyTavern en Discord! (Busque el hilo 📕ST Memory Books o envíe un DM a @tokyoapple para ayuda directa).
* **Errores/características:** ¿Encontró un error o tiene una gran idea? Abra un problema (issue) en GitHub en este repositorio.

---

### 📚 Potencia con Ordenamiento de Lorebook (STLO)

Para una organización avanzada de la memoria y una integración más profunda de la historia, recomendamos encarecidamente usar STMB junto con [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). ¡Consulte la guía para conocer las mejores prácticas, instrucciones de configuración y consejos!
