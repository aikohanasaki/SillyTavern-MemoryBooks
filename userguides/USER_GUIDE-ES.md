# 📕 ST Memory Books - Su Asistente de Memoria de Chat con IA

**¡Convierta sus interminables conversaciones de chat en recuerdos organizados y con capacidad de búsqueda!**

¿Necesita que el bot recuerde cosas, pero el chat es demasiado largo para el contexto? ¿Quiere rastrear automáticamente puntos importantes de la trama sin tomar notas manualmente? ST Memory Books hace exactamente eso: observa sus chats y crea resúmenes inteligentes para que nunca vuelva a perder el hilo de su historia.

(¿Busca detalles técnicos tras bastidores? Tal vez prefiera leer [Cómo funciona STMB](howSTMBworks-es.md) en su lugar).

---

## 📑 Tabla de Contenidos

- [Inicio Rápido](#-inicio-rpido-5-minutos-para-su-primera-memoria)
- [Lo que hace ST Memory Books](#-lo-que-st-memory-books-realmente-hace)
- [Elija su estilo](#-elija-su-estilo)
- [Ahorro de tokens](#-ahorro-de-tokens-ocultar--mostrar)
- [Consolidación de resúmenes](#-consolidacin-de-resmenes)
- [Prompts secundarios y rastreadores](#-prompts-secundarios-y-rastreadores-inteligentes)
- [Ajustes importantes](#-configuraciones-que-realmente-importan)
- [Solución de problemas](#-solucin-de-problemas-cuando-las-cosas-no-funcionan)
- [Lo que no hace](#-lo-que-st-memory-books-no-hace)
- [Ayuda e información](#-obtener-ayuda-y-ms-infos)

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
4. Abra Memory Books (🪄) y haga clic en "Create Memory" (Crear Memoria).

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
* activar **Mostrar mensajes ocultos para la generación de memoria (ejecuta /unhide X-Y)**

## 🌈 Consolidación de resúmenes

La consolidación combina recuerdos antiguos de STMB en resúmenes de nivel superior.

### ¿Qué es?

STMB puede combinar recuerdos o resúmenes existentes en un resumen más compacto. El primer nivel es **Arc** y también existen **Chapter**, **Book**, **Legend**, **Series** y **Epic**.

### ¿Cuándo usarlo?

* Su lista de recuerdos ya es muy larga
* Los recuerdos antiguos ya no necesitan detalle escena por escena
* Quiere ahorrar tokens sin perder continuidad

### ¿Se ejecuta sola?

No. La consolidación sigue necesitando confirmación.

* Puede abrir **Consolidar las memorias** manualmente
* Opcionalmente STMB puede avisarle cuando un nivel llegue a su mínimo
* Elegir **Yes** solo abre el popup de consolidación, no la ejecuta en silencio

### ¿Qué se consolida?

* Los recuerdos normales de STMB sí se consolidan
* Los resúmenes de nivel superior también se pueden volver a consolidar
* Los Side Prompts son rastreadores y no se mezclan en Arc/Chapter

### ¿Cómo se usa?

1. Haga clic en **Consolidar las memorias**
2. Elija el nivel destino
3. Seleccione las entradas fuente
4. Decida si quiere desactivar las fuentes tras crear el resumen
5. Pulse **Run**

Si la IA devuelve una mala respuesta de consolidación, puede revisarla y corregirla antes de volver a confirmar.

---

## 🎨 Rastreadores, Prompts Secundarios y Plantillas (Función Avanzada)

Los **Prompts Secundarios** (Side Prompts) son rastreadores en segundo plano que ayudan a mantener la información de la historia en curso.
Crean entradas separadas de Side Prompt en el lorebook y se ejecutan junto con la creación de memoria. Piense en ellos como **ayudantes que observan su historia y mantienen ciertos detalles actualizados**.
Las macros estándar de ST como `{{user}}` y `{{char}}` se expanden en `Prompt` y `Response Format`. Las macros no estándar `{{...}}` se convierten en entradas obligatorias para la ejecución manual.

### 🚀 **Inicio Rápido con Plantillas**

1. Abra la configuración de Memory Books.
2. Haga clic en **Side Prompts**.
3. Navegue por la **biblioteca de plantillas** y elija lo que se ajuste a su historia:
* **Character Development Tracker** – Rastrea cambios de personalidad y crecimiento.
* **Relationship Dynamics** – Rastrea las relaciones entre personajes.
* **Plot Thread Tracker** – Rastrea historias en curso.
* **Mood & Atmosphere** – Rastrea el tono emocional.
* **World Building Notes** – Rastrea detalles del entorno y el lore.


4. Habilite las plantillas que desee (puede personalizarlas más tarde).
5. Si la plantilla contiene macros de tiempo de ejecución personalizadas, no se ejecutará automáticamente y deberá iniciarse manualmente con `/sideprompt`.

### ⚙️ **Cómo Funcionan los Prompts Secundarios**

* **Rastreadores en Segundo Plano**: Se ejecutan silenciosamente y actualizan la información con el tiempo.
* **No Intrusivos**: No cambian la configuración principal de su IA ni los prompts de los personajes.
* **Control por Chat**: Diferentes chats pueden usar diferentes rastreadores.
* **Basado en Plantillas**: Use plantillas integradas o cree las suyas propias.
* **Automático o Manual**: Las plantillas estándar pueden ejecutarse automáticamente; las plantillas con macros de tiempo de ejecución personalizadas son solo manuales.
* **Compatibilidad con macros**: `Prompt` y `Response Format` expanden macros estándar de ST como `{{user}}` y `{{char}}`.
* **Controles de seguridad**: Si una plantilla contiene macros de tiempo de ejecución personalizadas, STMB elimina `onInterval` y `onAfterMemory` al guardar/importar y muestra una advertencia.

Esto hace que el comportamiento del disparador sea comprensible sin términos técnicos.

### 🛠️ **Gestión de Prompts Secundarios**

* **Side Prompts Manager**: Cree, edite, duplique y organice rastreadores.
* **Enable / Disable**: Encienda o apague los rastreadores en cualquier momento.
* **Import / Export**: Comparta plantillas o haga copias de seguridad.
* **Status View**: Vea qué rastreadores están activos en el chat actual.

### 💡 **Ejemplos de Plantillas**

* Biblioteca de Plantillas de Prompts Secundarios (importe este JSON):
[SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Ideas de ejemplo para prompts:

* "Rastrear diálogos importantes e interacciones de personajes".
* "Mantener actualizado el estado actual de la misión".
* "Anotar nuevos detalles de construcción del mundo cuando aparezcan".
* "Rastrear la relación entre el Personaje A y el Personaje B".

### 🔧 **Creación de Prompts Secundarios Personalizados**

1. Abra el Administrador de Prompts Secundarios (Side Prompts Manager).
2. Haga clic en **Create New**.
3. Escriba una instrucción corta y clara.
   *(ejemplo: "Siempre anota cómo es el clima en cada escena")*.
4. Añada si hace falta macros estándar de ST o macros de tiempo de ejecución en el formato `{{macro}}="value"`.
5. Guárdelo y habilítelo.
6. El rastreador ahora actualizará esta información con el tiempo si se mantienen los activadores automáticos.

### 💬 **Consejo Pro**

Los Prompts Secundarios funcionan mejor cuando son **pequeños y enfocados**.
En lugar de "rastrear todo", intente "rastrear la tensión romántica entre los personajes principales".

---

### 🧠 Control Avanzado de Texto con la Extensión Regex

ST Memory Books puede ejecutar scripts Regex seleccionados antes de generar y antes de guardar.

* Active en STMB **Usar expresiones regulares (avanzado)**
* Haga clic en **📐 Configurar expresiones regulares…**
* Elija por separado qué scripts deben ejecutarse antes de enviar texto a la IA y antes de guardar
* La selección hecha dentro de STMB cuenta incluso si ese script está desactivado en la extensión Regex

---

## ⚙️ Configuraciones que Realmente Importan

Para la referencia completa, consulte [readme.md](readme.md).

Controles básicos importantes:

* **Ajustes Actuales de SillyTavern** usa directamente su conexión actual de ST
* **Crear resúmenes de memoria automáticamente** activa los recuerdos automáticos
* **Intervalo de Auto-Resumen** y **Búfer de Auto-Resumen** controlan cuándo se ejecutan
* **Auto-hide/unhide memories** ayuda a ahorrar tokens
* **Activar Modo Manual de Lorebook** y **Crear automáticamente un lorebook si no existe** controlan dónde se guardan los recuerdos
* **Avisar para consolidar cuando una capa esté lista** solo muestra la confirmación de consolidación

---

## 🔧 Solución de Problemas (Cuando las Cosas No Funcionan)

Para la lista completa, consulte [readme.md](readme.md).

Comprobaciones rápidas:

* Asegúrese de que STMB esté activado y que **Memory Books** aparezca en el menú de extensiones
* Si el auto-summary no se ejecuta, confirme que creó primero una memoria manual y que el intervalo/buffer son razonables
* Si los recuerdos no se guardan, asegúrese de que haya un lorebook vinculado al chat o de que **Crear automáticamente un lorebook si no existe** esté activado
* Si el comportamiento de Regex parece incorrecto, revise la selección dentro de **📐 Configurar expresiones regulares…**
* Si la consolidación no aparece, revise el nivel objetivo y la opción de confirmación de consolidación

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
