# 📕 ST Memory Books - Su Asistente de Memoria de Chat con IA

**¡Convierta sus interminables conversaciones de chat en recuerdos organizados y con capacidad de búsqueda!**

¿Necesita que el bot recuerde cosas, pero el chat es demasiado largo para el contexto? ¿Quiere rastrear automáticamente puntos importantes de la trama sin tomar notas manualmente? ST Memory Books hace exactamente eso: observa sus chats y crea resúmenes inteligentes para que nunca vuelva a perder el hilo de su historia.

(¿Busca detalles técnicos tras bastidores? Tal vez prefiera leer [Cómo funciona STMB](https://www.google.com/search?q=userguides%5ChowSTMBworks-en.md) en su lugar).

---

## 🚀 Inicio Rápido (¡5 Minutos para su Primera Memoria!)

**¿Nuevo en ST Memory Books?** Vamos a configurarlo con su primera memoria automática en solo unos clics:

### Paso 1: Encuentre la Extensión

* Busque el icono de la varita mágica (🪄) junto a su cuadro de entrada de chat.
* Haga clic en él, luego haga clic en **"Memory Books"**.
* Verá el panel de control de ST Memory Books.

### Paso 2: Active la Auto-Magia

* En el panel de control, busque **"Auto-Summary"** (Auto-Resumen).
* Enciéndalo (ON).
* Configúrelo para crear recuerdos cada **20-30 mensajes** (un buen punto de partida).
* ¡Eso es todo! 🎉

### Paso 3: Chatee Normalmente

* Siga chateando como de costumbre.
* Después de 20-30 mensajes nuevos, ST Memory Books automáticamente:
* Elegirá los mejores límites de la escena.
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

1. Active "Auto-Summary" en la configuración.
2. Elija con qué frecuencia crear recuerdos (cada 20-50 mensajes funciona bien).
3. Siga chateando normalmente - ¡los recuerdos ocurren automáticamente!

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
* `/sideprompt "Relationship Tracker"` - Ejecutar rastreador personalizado.

**Lo que obtiene:**

* Creación de memoria ultrarrápida.
* Operaciones por lotes.
* Integración con flujos de trabajo personalizados.

</details>

---

## 🌈 Resúmenes de Arco (Arc Summaries)

Los Resúmenes de Arco se crean manualmente. Nada se resume o elimina a menos que usted elija hacerlo.

### P: ¿Qué son los Resúmenes de Arco?

**R:** Los Resúmenes de Arco ayudan a mantener manejables las historias largas. Con el tiempo, puede recopilar muchas entradas de memoria antiguas. Algunas de ellas describen la misma parte de la historia.
Un Resumen de Arco le permite combinar varios recuerdos más antiguos en un resumen más corto.

### P: ¿Qué sucede cuando hago un Resumen de Arco?

**R:** Cuando crea un Resumen de Arco:

* Los recuerdos seleccionados se combinan en una nueva entrada.
* El nuevo resumen reemplaza esos recuerdos más antiguos.
*(los recuerdos más antiguos pueden ocultarse automáticamente, no eliminarse)*.
* La historia aún se recuerda, pero con menos tokens.

### P: ¿Por qué hacer Resúmenes de Arco?

**R:** Los Resúmenes de Arco son útiles cuando:

* Su lista de memoria se está volviendo muy larga.
* Los recuerdos más antiguos ya no son necesarios con todo detalle.
* Desea reducir el uso de tokens en chats largos.

### P: ¿Cómo hago un Resumen de Arco?

**R:** Para crear un Resumen de Arco:

1. Haga clic en **🌈 Consolidate Memories into Arcs** en la parte inferior de la ventana emergente principal de STMB.
2. Elija un tipo de arco:
* **Multi-Arc**
La IA busca pausas naturales y crea múltiples arcos.
Puede establecer un número mínimo de recuerdos por arco.
*Funciona mejor con modelos fuertes (GPT, Gemini, Sonnet). Los modelos locales pueden tener dificultades.*
* **Single Arc**
La IA combina todos los recuerdos seleccionados en un solo arco.
Se incluyen arcos anteriores para ayudar a mantener la historia consistente.
* **Tiny**
Una opción más rápida y simple que puede funcionar mejor con modelos locales,
pero los resultados pueden ser menos detallados.


3. Seleccione los recuerdos que desea incluir.
4. Haga clic en **Run** y espere a que termine el análisis del arco.

---

## 🎨 Rastreadores, Prompts Secundarios y Plantillas (Función Avanzada)

Los **Prompts Secundarios** (Side Prompts) son rastreadores en segundo plano que ayudan a mantener la información de la historia en curso.
Se ejecutan junto con la creación de memoria y pueden actualizar las mismas notas a lo largo del tiempo. Piense en ellos como **ayudantes que observan su historia y mantienen ciertos detalles actualizados**.

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
5. Sus recuerdos ahora incluirán este seguimiento automáticamente.

### ⚙️ **Cómo Funcionan los Prompts Secundarios**

* **Rastreadores en Segundo Plano**: Se ejecutan silenciosamente y actualizan la información con el tiempo.
* **No Intrusivos**: No cambian la configuración principal de su IA ni los prompts de los personajes.
* **Control por Chat**: Diferentes chats pueden usar diferentes rastreadores.
* **Basado en Plantillas**: Use plantillas integradas o cree las suyas propias.
* **Automático o Manual**: Algunos se ejecutan automáticamente, otros se pueden ejecutar por comando.

Esto hace que el comportamiento del disparador sea comprensible sin términos técnicos.

### 🛠️ **Gestión de Prompts Secundarios**

* **Side Prompts Manager**: Cree, edite, duplique y organice rastreadores.
* **Enable / Disable**: Encienda o apague los rastreadores en cualquier momento.
* **Import / Export**: Comparta plantillas o haga copias de seguridad.
* **Status View**: Vea qué rastreadores están activos en el chat actual.

### 💡 **Ejemplos de Plantillas**

* Biblioteca de Plantillas de Prompts Secundarios (importe este JSON):
[SidePromptTemplateLibrary.json](https://www.google.com/search?q=/resources/SidePromptTemplateLibrary.json)

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
4. Guárdelo y habilítelo.
5. El rastreador ahora actualizará esta información con el tiempo.

### 💬 **Consejo Pro**

Los Prompts Secundarios funcionan mejor cuando son **pequeños y enfocados**.
En lugar de "rastrear todo", intente "rastrear la tensión romántica entre los personajes principales".

---

### 🧠 Control Avanzado de Texto con la Extensión Regex

**¿Desea un control total sobre el texto que se envía y se recibe de la IA?** ST Memory Books ahora se integra perfectamente con la extensión oficial **Regex**, permitiéndole transformar automáticamente el texto utilizando reglas personalizadas.

**Soporte de Selección Múltiple:** Ahora puede seleccionar múltiples scripts de regex en la extensión Regex. Todos los scripts habilitados se aplicarán en orden en cada etapa (Prompt y Respuesta), permitiendo transformaciones poderosas y flexibles.

Esta es una función avanzada perfecta para usuarios que desean:

* Limpiar automáticamente frases repetitivas o artefactos de la respuesta de una IA.
* Reformatear partes de la transcripción del chat antes de que la IA lo vea.
* Estandarizar terminología o modismos de personajes sobre la marcha.

#### **Cómo Funciona: Dos Ganchos Simples**

La integración funciona aplicando sus scripts de regex habilitados en dos puntos críticos. Usted controla qué scripts se ejecutan configurando su **Placement** (Ubicación) en el editor de la extensión Regex:

1. **Modificando el Prompt (Texto Saliente)**
* **Ubicación a usar**: `User Input`
* **Qué hace**: Intercepta el prompt completamente ensamblado (incluyendo historial de chat, instrucciones del sistema, etc.) justo antes de que se envíe a la IA para la generación de memoria o prompt secundario.
* **Caso de Uso de Ejemplo**: Podría crear un script para reemplazar automáticamente todas las instancias del apodo de un personaje con su nombre completo, asegurando que la IA tenga el contexto adecuado.


2. **Modificando la Respuesta (Texto Entrante)**
* **Ubicación a usar**: `AI Output`
* **Qué hace**: Intercepta la respuesta de texto sin procesar de la IA *antes* de que se analice o guarde como una memoria.
* **Caso de Uso de Ejemplo**: Si su modelo de IA a menudo incluye frases repetitivas como *"Como un modelo de lenguaje grande..."* en sus resúmenes, puede crear un script de regex para eliminar automáticamente esta frase de cada memoria que genere.



#### **Ejemplo de Inicio Rápido: Limpieza de Respuestas de IA**

Digamos que su modelo de IA agrega consistentemente `(OOC: ¡Espero que este resumen sea útil!)` a sus generaciones de memoria. Aquí le mostramos cómo eliminarlo automáticamente:

1. **Vaya a la Extensión Regex**: Abra el menú principal de extensiones de SillyTavern y vaya a **Regex**.
2. **Cree un Nuevo Script**: Haga clic en "Open Regex Editor" para crear un nuevo script de regex.
3. **Configure el Script**:
* **Nombre del Script**: `Limpiar Notas OOC`
* **Find Regex**: `/\\(OOC:.*?\\)/g` (Esto encuentra el texto "(OOC: ...)" y todo lo que contiene).
* **Replace String**: Deje esto en blanco para eliminar el texto coincidente.
* **Affects (Placement)**: Desmarque todas las casillas excepto **AI Output**. ¡Este es el paso más importante!
* **Habilite el Script**: Asegúrese de que el script no esté deshabilitado.


4. **¡Guarde y Listo!**

Ahora, cada vez que ST Memory Books obtenga una respuesta de la IA, este script se ejecutará automáticamente, limpiando el texto no deseado antes de que la memoria se guarde en su lorebook.

---

## ⚙️ Configuraciones que Realmente Importan

No se preocupe, ¡no necesita configurar todo! Aquí están las configuraciones que marcan la mayor diferencia:

### 🎛️ **Frecuencia de Auto-Resumen**

* **20-30 mensajes**: Genial para chats detallados y más lentos.
* **40-60 mensajes**: Perfecto para conversaciones más rápidas y llenas de acción.
* **80+ mensajes**: Para chats grupales muy rápidos o conversaciones casuales.

### 📝 **Vistas Previas de Memoria**

* Active esto para revisar los recuerdos antes de que se guarden.
* Puede editar, aprobar o regenerar si la IA omitió algo importante.
* Recomendado para historias importantes.

### 🏷️ **Títulos de Memoria**

* Personalice cómo se nombran sus recuerdos.
* Use `{{title}}` para títulos generados por IA, `{{scene}}` para números de mensajes.
* Ejemplo: `"Capítulo {{title}} ({{scene}})"` se convierte en `"Capítulo El Gran Escape (Escena 45-67)"`.

### 📚 **Colecciones de Memoria** (Lorebooks)

* **Modo Auto**: Utiliza la colección de memoria predeterminada de su chat (lo más fácil).
* **Modo Manual**: Elija una colección específica para cada chat (para organización).
* **Auto-create**: Crea nuevas colecciones automáticamente (bueno para nuevos personajes).

---

## 🔧 Solución de Problemas (Cuando las Cosas No Funcionan)

### "¡No veo la opción de Memory Books!"

* Compruebe que la extensión esté instalada y habilitada.
* Busque el icono de la varita mágica (🪄) junto a su entrada de chat.
* Intente actualizar la página.

### "¡Los botones de flecha (► ◄) no aparecen!"

* Espere 3-5 segundos después de cargar un chat: necesitan tiempo para aparecer.
* Si aún faltan, actualice la página.
* Asegúrese de que ST Memory Books esté habilitado en las extensiones.

### "¡El Auto Summary no funciona!"

* Verifique dos veces que "Auto-Summary" esté habilitado en la configuración de Memory Books.
* ¿Se ha alcanzado el intervalo de mensajes? El resumen automático espera suficientes mensajes nuevos.
* Si pospuso el resumen automático, podría estar esperando hasta un cierto recuento de mensajes.
* El resumen automático solo procesa mensajes nuevos desde la *última* memoria. Si eliminó recuerdos antiguos, no vuelve atrás.

### "¡Recibo errores sobre lorebooks faltantes!"

* Vaya a la configuración de Memory Books.
* Vincule un lorebook a su chat (Modo Automático) o habilite "Auto-create lorebook if none exists".

### "¡A veces falla sin razón!"

* Asegúrese de que su Longitud Máxima de Respuesta (Max Response Length en los ajustes preestablecidos de SillyTavern) esté establecida en un número lo suficientemente grande. Aiko recomienda al menos 2000 tokens (Aiko usa 4000).
* Los mensajes de error son más detallados ahora, pero si todavía tiene problemas, comuníquese con Aiko en Github o Discord.

### "¡Mis prompts personalizados no funcionan bien!"

* Verifique el "Summary Prompt Manager" en la configuración de Memory Books.
* Asegúrese de que su prompt le indique a la IA que responda en **formato JSON** (por ejemplo, `{ "title": "...", "content": "..." }`).

---

## 🚫 Lo que ST Memory Books No Hace

* **No es un editor general de lorebooks:** Esta guía se centra en las entradas creadas por STMB. Para la edición general de lorebooks, use el editor de lorebooks integrado de SillyTavern.

---

## 💡 Obtener Ayuda y Más Información

* **Información más detallada:** [readme.md](readme.md)
* **Últimas actualizaciones:** [changelog.md](changelog.md)
* **Convertir lorebooks antiguos:** [lorebookconverter.html](https://www.google.com/search?q=lorebookconverter.html)
* **Soporte de la comunidad:** ¡Únase a la comunidad de SillyTavern en Discord! (Busque el hilo 📕ST Memory Books o envíe un DM a @tokyoapple para ayuda directa).
* **Errores/características:** ¿Encontró un error o tiene una gran idea? Abra un problema (issue) en GitHub en este repositorio.

---

### 📚 Potencia con Ordenamiento de Lorebook (STLO)

Para una organización avanzada de la memoria y una integración más profunda de la historia, recomendamos encarecidamente usar STMB junto con [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). ¡Consulte la guía para conocer las mejores prácticas, instrucciones de configuración y consejos!