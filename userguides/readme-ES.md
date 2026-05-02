# 📕 Memory Books (Una extensión para SillyTavern)

Una extensión de próxima generación para SillyTavern para la creación automática, estructurada y fiable de recuerdos. Marca escenas en el chat, genera resúmenes basados en JSON con IA y guárdalos como entradas en tus lorebooks. Soporta chats grupales, gestión avanzada de perfiles, Side Prompts/rastreadores y consolidación de recuerdos en múltiples niveles.

### ❓ Vocabulario

- Scene (Escena) → Memory (Recuerdo)
- Many Memories (Muchos recuerdos) → Summary / Consolidation (Resumen / Consolidación)
- Always-On (Siempre activo) → Side Prompt (Tracker/Rastreador)

## ❗ ¡Léeme primero!

Comienza aquí:

- ⚠️‼️ Lee los [prerrequisitos](#-prerrequisitos) para notas de instalación, especialmente si usas una API de Text Completion.
- 📽️ [Video de inicio rápido](https://youtu.be/mG2eRH_EhHs) - solo en inglés; lo siento, es el idioma en el que tengo más fluidez.
- ❓ [Preguntas frecuentes](#faq)
- 🛠️ [Solución de problemas](#solución-de-problemas)

Otros enlaces:

- 📘 [Guía de usuario (ES)](USER_GUIDE-ES.md)
- 📋 [Historial de versiones y registro de cambios](../changelog.md)
- 💡 [Uso de 📕 Memory Books con 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Spanish.md)

> Nota: Soporta varios idiomas; consulta la carpeta [`/locales`](../locales) para ver la lista. Los Readmes y las Guías de usuario internacionales/localizadas están en la carpeta [`/userguides`](./).
> El convertidor de lorebooks y la biblioteca de plantillas de Side Prompts están en la carpeta [`/resources`](../resources).

## 📑 Tabla de contenidos

- [Prerrequisitos](#-prerrequisitos)
  - [Consejos de KoboldCpp para usar 📕 ST Memory Books](#consejos-de-koboldcpp-para-usar--st-memory-books)
  - [Consejos de Llama.cpp para usar 📕 ST Memory Books](#consejos-de-llamacpp-para-usar--st-memory-books)
- [Configuración recomendada de activación global de World Info/Lorebook](#-configuración-recomendada-de-activación-global-de-world-infolorebook)
- [Comenzando](#-comenzando)
  - [1. Instalar y cargar](#1-instalar-y-cargar)
  - [2. Marcar una escena](#2-marcar-una-escena)
  - [3. Crear un recuerdo](#3-crear-un-recuerdo)
- [Tipos de memoria: escenas vs resúmenes](#-tipos-de-memoria-escenas-vs-resúmenes)
  - [Recuerdos de escena (predeterminado)](#-recuerdos-de-escena-predeterminado)
  - [Consolidación de resúmenes](#-consolidación-de-resúmenes)
- [Generación de recuerdos](#-generación-de-recuerdos)
  - [Solo salida JSON](#solo-salida-json)
  - [Presets incorporados](#presets-incorporados)
  - [Prompts personalizados](#prompts-personalizados)
- [Integración con lorebook](#-integración-con-lorebook)
- [Comandos de barra](#-comandos-de-barra)
- [Soporte para chats grupales](#-soporte-para-chats-grupales)
- [Modos de operación](#-modos-de-operación)
  - [Modo automático (predeterminado)](#modo-automático-predeterminado)
  - [Modo de auto-creación de lorebook](#modo-de-auto-creación-de-lorebook)
  - [Modo manual de lorebook](#modo-manual-de-lorebook)
- [Trackers y Side Prompts](#-trackers-y-side-prompts)
- [Integración de Regex para personalización avanzada](#-integración-de-regex-para-personalización-avanzada)
- [Gestión de perfiles](#-gestión-de-perfiles)
- [Ajustes y configuración](#-ajustes-y-configuración)
  - [Configuración global](#configuración-global)
  - [Campos del perfil](#campos-del-perfil)
- [Formato de títulos](#-formato-de-títulos)
- [Recuerdos de contexto](#-recuerdos-de-contexto)
- [Retroalimentación visual y accesibilidad](#-retroalimentación-visual-y-accesibilidad)
- [FAQ](#faq)
  - [¿Debo hacer un lorebook separado para los recuerdos, o puedo usar el mismo lorebook que ya uso para otras cosas?](#debo-hacer-un-lorebook-separado-para-los-recuerdos-o-puedo-usar-el-mismo-lorebook-que-ya-uso-para-otras-cosas)
  - [¿Necesito usar vectores?](#necesito-usar-vectores)
  - [¿Debo usar "Delay until recursion" si Memory Books es el único lorebook?](#debo-usar-delay-until-recursion-si-memory-books-es-el-único-lorebook)
  - [¿Por qué la IA no ve mis entradas?](#por-qué-la-ia-no-ve-mis-entradas)
- [Solución de problemas](#solución-de-problemas)
- [Potencia tu experiencia con Lorebook Ordering (STLO)](#-potencia-tu-experiencia-con-lorebook-ordering-stlo)
- [Política de caracteres](#-política-de-caracteres-v451)
- [Para desarrolladores](#-para-desarrolladores)
  - [Compilar la extensión](#compilar-la-extensión)
  - [Git Hooks](#git-hooks)

---

## 📋 Prerrequisitos

- **SillyTavern:** 1.14.0+ (se recomienda la versión más reciente)
- **Selección de escena:** deben estar definidos los marcadores de inicio y fin (inicio < fin).
- **Soporte de Chat Completion:** soporte completo para OpenAI, Claude, Anthropic, OpenRouter u otras APIs de Chat Completion.
- **Soporte de Text Completion:** las APIs de Text Completion (Kobold, TextGen, etc.) son compatibles cuando se conectan mediante un endpoint de API de Chat Completion compatible con OpenAI. Recomiendo configurar una conexión de Chat Completion según los consejos de KoboldCpp que aparecen abajo; ajusta según sea necesario si usas Ollama u otro software. Después, configura un perfil de STMB y usa `Custom` (recomendado) o la configuración manual completa (solo si `Custom` falla o tienes más de una conexión personalizada).
**NOTA:** Si usas Text Completion, debes tener un preset de Chat Completion.

### Consejos de KoboldCpp para usar 📕 ST Memory Books

Configura esto en ST. Puedes volver a Text Completion DESPUÉS de hacer funcionar STMB:

- Chat Completion API
- Custom chat completion source
- Endpoint `http://localhost:5001/v1` (también puedes usar `127.0.0.1:5000/v1`)
- Introduce cualquier cosa en `custom API key`; no importa, pero ST requiere una clave.
- El ID del modelo debe ser `koboldcpp/modelname` (no pongas `.gguf` en el nombre del modelo).
- Descarga un preset de Chat Completion e impórtalo. Cualquiera sirve; solo necesitas TENER un preset de Chat Completion. Esto evita errores de “not supported”.
- Cambia la longitud máxima de respuesta en el preset de Chat Completion para que sea al menos 2048; se recomienda 4096. Un valor menor aumenta el riesgo de que la respuesta se corte.

### Consejos de Llama.cpp para usar 📕 ST Memory Books

Igual que con Kobold, configura lo siguiente como una *API de Chat Completion* en ST. Puedes volver a tu configuración anterior después de verificar que STMB funciona:

- Crea un nuevo perfil de conexión para una API de Chat Completion.
- Completion Source: `Custom (Open-AI Compatible)`
- Endpoint URL: `http://host.docker.internal:8080/v1` si ejecutas ST en Docker; de lo contrario, `http://localhost:8080/v1`
- Custom API Key: introduce cualquier cosa (ST requiere una)
- Model ID: `llama2-7b-chat.gguf` (o tu modelo; no importa si no estás ejecutando más de uno en llama.cpp)
- Prompt post-processing: none

Para iniciar Llama.cpp, recomiendo colocar algo similar a lo siguiente en un script de shell o archivo bat, para que el arranque sea más fácil:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

## 💡 Configuración recomendada de activación global de World Info/Lorebook

- **Match Whole Words:** déjalo desmarcado (false)
- **Scan Depth:** cuanto más alto, mejor (el mío está en 8)
- **Max Recursion Steps:** 2 (recomendación general, no obligatorio)
- **Context %:** 80% (basado en una ventana de contexto de 100.000 tokens); asume que no tienes un historial de chat o bots extremadamente pesados.
- Nota adicional: si el lorebook de recuerdos es tu único lorebook, asegúrate de que `Delay until recursion` esté desactivado en el perfil de STMB, o los recuerdos no se activarán.

---

## 🚀 Comenzando

### 1. **Instalar y cargar**

- Carga SillyTavern y selecciona un personaje o chat grupal.
- Espera a que aparezcan los botones de chevrón (► ◄) en los mensajes del chat. Puede tardar hasta 10 segundos.

![Espera a que aparezcan estos botones](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Marcar una escena**

- Haz clic en ► en el primer mensaje de tu escena.
- Haz clic en ◄ en el último mensaje.

Abajo hay ejemplos de cómo se ven los botones de chevrón al hacer clic. Los colores pueden variar según tu tema CSS.

![Retroalimentación visual mostrando la selección de escena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Crear un recuerdo**

- Abre el menú de Extensiones (la varita mágica 🪄) y haz clic en “Memory Books”, o usa el comando de barra `/creatememory`.
- Confirma la configuración (perfil, contexto, API/modelo) si se solicita.
- Espera la generación de IA y la entrada automática en el lorebook.

---

## 🧩 Tipos de memoria: escenas vs resúmenes

📕 Memory Books soporta **recuerdos de escena** y **consolidación de resúmenes multinivel**, cada uno diseñado para diferentes tipos de continuidad.

### 🎬 Recuerdos de escena (predeterminado)

Los recuerdos de escena capturan **lo que sucedió** en un rango específico de mensajes.

- Se basan en una selección explícita de escena (► ◄)
- Son ideales para recordar eventos momento a momento
- Preservan diálogo, acciones y resultados inmediatos
- Conviene usarlos con frecuencia

Este es el tipo de recuerdo estándar y más usado.

---

### 🌈 Consolidación de resúmenes

La consolidación de resúmenes captura **lo que cambió con el tiempo** a través de múltiples recuerdos o resúmenes.

En lugar de resumir una sola escena, los resúmenes consolidados se centran en:

- Desarrollo de personajes y cambios en relaciones
- Objetivos a largo plazo, tensiones y resoluciones
- Trayectoria emocional y dirección narrativa
- Cambios de estado persistentes que deben permanecer estables

El primer nivel de consolidación es **Arc**, construido a partir de recuerdos de escena. También se soportan niveles superiores para historias más largas:

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 Piensa en estos como *recapitulaciones*, no como registros de escenas.

#### Cuándo usar resúmenes consolidados

- Después de un cambio importante en una relación
- Al final de un capítulo o arco de la historia
- Cuando cambian las motivaciones, la confianza o las dinámicas de poder
- Antes de comenzar una nueva fase de la historia

#### Cómo funciona

- Los resúmenes consolidados se generan a partir de recuerdos/resúmenes STMB existentes, no directamente del chat en bruto.
- La herramienta **Consolidate Memories** permite elegir un nivel de resumen destino y seleccionar entradas fuente.
- STMB puede vigilar opcionalmente niveles de resumen seleccionados y mostrar una confirmación de sí/más tarde cuando un nivel alcanza su mínimo guardado de entradas aptas.
- STMB puede desactivar las entradas fuente después de la consolidación si quieres que el resumen de nivel superior tome el relevo.
- Las respuestas de resumen fallidas de la IA pueden revisarse y corregirse desde la interfaz antes de reintentar guardarlas.

Esto ofrece:

- menor uso de tokens
- mejor continuidad narrativa en chats largos

---

## 📝 Generación de recuerdos

### **Solo salida JSON**

Todos los prompts y presets **deben** indicar a la IA que devuelva solo JSON válido, por ejemplo:

```json
{
  "title": "Título corto de la escena",
  "content": "Resumen detallado de la escena...",
  "keywords": ["palabra clave1", "palabra clave2"]
}
```

**No se permite ningún otro texto en la respuesta.**

### **Presets incorporados**

1. **Summary:** Resúmenes detallados paso a paso.
2. **Summarize:** Encabezados Markdown para línea de tiempo, momentos clave, interacciones y resultado.
3. **Synopsis:** Markdown completo y estructurado.
4. **Sum Up:** Resumen conciso de momentos clave con línea de tiempo.
5. **Minimal:** Resumen de 1-2 oraciones.
6. **Northgate:** Estilo de resumen literario pensado para escritura creativa.
7. **Aelemar:** Se centra en puntos de trama y recuerdos de personajes.
8. **Comprehensive:** Resumen tipo sinopsis con extracción de palabras clave mejorada.

### **Prompts personalizados**

- Puedes crear los tuyos, pero **deben** devolver JSON válido como se muestra arriba.

---

## 📚 Integración con lorebook

- **Creación automática de entradas:** los nuevos recuerdos se almacenan como entradas con todos los metadatos.
- **Detección basada en flags:** solo las entradas con el flag `stmemorybooks` se reconocen como recuerdos.
- **Auto-numeración:** numeración secuencial con ceros a la izquierda y varios formatos compatibles (`[000]`, `(000)`, `{000}`, `#000`).
- **Orden manual/automático:** configuración de orden de inserción por perfil.
- **Actualización del editor:** opcionalmente actualiza automáticamente el editor del lorebook después de añadir un recuerdo.

> **Los recuerdos existentes deben convertirse.**
> Usa el [Lorebook Converter](../resources/lorebookconverter.html) para añadir el flag `stmemorybooks` y los campos requeridos.

---

## 🆕 Comandos de barra

- `/creatememory` - Crea un recuerdo a partir de la escena marcada.
- `/scenememory X-Y` - Define el rango de escena y crea un recuerdo (por ejemplo, `/scenememory 10-15`).
- `/nextmemory` - Crea un recuerdo desde el final del último recuerdo hasta el mensaje actual.
- `/stmb-catchup interval:x start:y end:y` - Crea recuerdos de puesta al día para un chat largo existente procesando el rango de mensajes seleccionado en bloques del tamaño indicado por el intervalo.
- `/sideprompt "Name" {{macro}}="value" [X-Y]` - Ejecuta un Side Prompt (`{{macro}}` es opcional).
- `/sideprompt-set "Set Name" [X-Y]` - Ejecuta un Side Prompt Set guardado.
- `/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]` - Ejecuta un Side Prompt Set y proporciona valores de macro reutilizables.
- `/sideprompt-on "Name" | all` - Activa un Side Prompt por nombre, o todos.
- `/sideprompt-off "Name" | all` - Desactiva un Side Prompt por nombre, o todos.
- `/stmb-highest` - Devuelve el ID de mensaje más alto de los recuerdos procesados en este chat.
- `/stmb-set-highest <N|none>` - Define manualmente el ID de mensaje procesado más alto para este chat.
- `/stmb-stop` - Detiene todas las generaciones STMB en curso en todas partes. Úsalo como parada de emergencia.

### `/stmb-catchup`

Usa `/stmb-catchup` cuando quieras convertir un chat largo existente en recuerdos de STMB.

Sintaxis: `/stmb-catchup interval:x start:y end:y`

Ejemplo: `/stmb-catchup interval:30 start:0 end:300`

---

## 👥 Soporte para chats grupales

- Todas las funciones funcionan con chats grupales.
- Los marcadores de escena, la creación de recuerdos y la integración con el lorebook se almacenan en los metadatos del chat activo.
- No se requiere configuración especial; solo selecciona un chat grupal y úsalo normalmente.

---

## 🧭 Modos de operación

### **Modo automático (predeterminado)**

- **Cómo funciona:** usa automáticamente el lorebook vinculado a tu chat actual.
- **Mejor para:** simplicidad y velocidad. La mayoría de los usuarios deberían comenzar aquí.
- **Para usarlo:** asegúrate de que haya un lorebook seleccionado en el menú desplegable “Chat Lorebooks” para tu personaje o chat grupal.

![Ejemplo de vinculación de lorebook al chat](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Modo de auto-creación de lorebook**

- **Cómo funciona:** crea y vincula automáticamente un nuevo lorebook cuando no existe ninguno, usando tu plantilla de nombres personalizada.
- **Mejor para:** usuarios nuevos y configuración rápida. Perfecto para crear un lorebook con un clic.
- **Para usarlo:**
  1. Activa “Auto-create lorebook if none exists” en los ajustes de la extensión.
  2. Configura tu plantilla de nombres (predeterminado: `LTM - {{char}} - {{chat}}`).
  3. Cuando crees un recuerdo sin un lorebook vinculado, se creará y vinculará uno automáticamente.
- **Marcadores de plantilla:** `{{char}}` (nombre del personaje), `{{user}}` (tu nombre), `{{chat}}` (ID del chat)
- **Numeración inteligente:** añade números automáticamente (2, 3, 4...) si existen nombres duplicados.
- **Nota:** no puede usarse simultáneamente con el Modo manual de lorebook.

### **Modo manual de lorebook**

- **Cómo funciona:** te permite seleccionar un lorebook diferente para los recuerdos por chat, ignorando el lorebook principal vinculado al chat.
- **Mejor para:** usuarios avanzados que quieren dirigir recuerdos a un lorebook específico y separado.
- **Para usarlo:**
  1. Activa “Enable Manual Lorebook Mode” en los ajustes de la extensión.
  2. La primera vez que crees un recuerdo en un chat, se te pedirá elegir un lorebook.
  3. Esta elección se guarda para ese chat específico hasta que la borres o vuelvas al Modo automático.
- **Nota:** no puede usarse simultáneamente con el Modo de auto-creación de lorebook.

---

### 🎡 Trackers y Side Prompts

> 📘 Los Side Prompts tienen su propia guía: [Guía de Side Prompts](side-prompts-es.md). Úsala para sets, macros, ejemplos y solución de problemas.
> 🎡 ¿Necesitas la ruta de clics? Consulta el [recorrido de Scribe para activar Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Los Side Prompts son ejecuciones separadas de prompts de STMB para mantener el estado continuo del chat. Úsalos para trackers y notas de apoyo que no deberían inflar la respuesta normal del personaje, como:

- 💰 Inventario y recursos (“¿Qué objetos tiene el usuario?”)
- ❤️ Estado de relación (“¿Cómo se siente X por Y?”)
- 📊 Estadísticas del personaje (“Salud actual, habilidades, reputación”)
- 🎯 Progreso de misiones (“¿Qué objetivos están activos?”)
- 🌍 Estado del mundo (“¿Qué ha cambiado en el entorno?”)

#### **Acceso:** desde los ajustes de Memory Books, haz clic en “🎡 Trackers & Side Prompts”.

#### **Características:**

- Ver, crear, duplicar, editar, eliminar, exportar e importar Side Prompts.
- Ejecutar Side Prompts manualmente, después de crear una memoria o como parte de un Side Prompt Set.
- Usar macros estándar de SillyTavern como `{{user}}` y `{{char}}`.
- Usar macros de tiempo de ejecución como `{{npc name}}` cuando un prompt necesita un valor proporcionado al ejecutarse.
- Guardar la salida de Side Prompt como entradas de side prompt separadas en tu lorebook de recuerdos.

#### **Consejos de uso:**

- Copia desde los incorporados al crear un nuevo prompt.
- Los Side Prompts no tienen que devolver JSON. Texto plano o Markdown está bien.
- Los Side Prompts normalmente se actualizan/sobrescriben; los recuerdos se guardan secuencialmente.
- La sintaxis manual es `/sideprompt "Name" {{macro}}="value" [X-Y]`.
- Usa Side Prompt Sets cuando un chat necesite un paquete ordenado de trackers.
- Un Side Prompt Set seleccionado para después de crear memoria reemplaza los Side Prompts de después de memoria activados individualmente para ese chat.
- Biblioteca adicional de plantillas de Side Prompts: [archivo JSON](../resources/SidePromptTemplateLibrary.json). Solo impórtalo para usarlo.

---

### 🧠 Integración de Regex para personalización avanzada

- **Control total sobre el procesamiento de texto:** Memory Books se integra con la extensión **Regex** de SillyTavern, lo que permite aplicar transformaciones de texto potentes en dos etapas clave:
  1. **Generación de prompt:** modifica automáticamente los prompts enviados a la IA creando scripts regex dirigidos a la ubicación **User Input**.
  2. **Análisis de respuesta:** limpia, reformatea o estandariza la respuesta bruta de la IA antes de guardarla dirigiéndote a la ubicación **AI Output**.
- **Soporte de selección múltiple:** puedes elegir varios scripts para el procesamiento de salida y entrada.
- **Cómo funciona:** activa `Use regex (advanced)` en STMB, haz clic en `📐 Configure regex…` y elige qué scripts debe ejecutar STMB antes de enviar a la IA y antes de analizar/guardar la respuesta.
- **Importante:** la selección de Regex la controla STMB. Los scripts seleccionados allí se ejecutarán **aunque estén desactivados** en la propia extensión Regex.

---

## 👤 Gestión de perfiles

- **Perfiles:** cada perfil incluye API, modelo, temperatura, prompt/preset, formato de título y ajustes de lorebook.
- **Importar/Exportar:** comparte perfiles como JSON.
- **Creación de perfiles:** usa la ventana emergente de opciones avanzadas para guardar nuevos perfiles.
- **Anulaciones por perfil:** cambia temporalmente API/modelo/temperatura para la creación de recuerdos y luego restaura tu configuración original.
- **Proveedor/perfil incorporado:** STMB incluye una opción obligatoria `Current SillyTavern Settings`, que usa directamente tu conexión/configuración activa de SillyTavern.

---

## ⚙️ Ajustes y configuración

![Panel principal de ajustes](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Configuración global**

[Breve resumen en video en YouTube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode:** habilita la selección de lorebooks por chat.
- **Auto-create lorebook if none exists:** crea y vincula automáticamente lorebooks usando tu plantilla de nombres.
- **Lorebook Name Template:** personaliza los nombres de los lorebooks auto-creados con los marcadores `{{char}}`, `{{user}}`, `{{chat}}`.
- **Allow Scene Overlap:** permite o impide rangos de recuerdos superpuestos.
- **Always Use Default Profile:** omite las ventanas emergentes de confirmación.
- **Show memory previews:** activa una ventana de vista previa para revisar y editar recuerdos antes de añadirlos al lorebook.
- **Show Notifications:** activa o desactiva mensajes tipo toast.
- **Refresh Editor:** actualiza automáticamente el editor del lorebook después de crear un recuerdo.
- **Max Response Tokens:** define la longitud máxima de generación para los resúmenes de recuerdos.
- **Token Warning Threshold:** define el nivel de advertencia para escenas grandes.
- **Default Previous Memories:** número de recuerdos anteriores que se incluirán como contexto (0-7).
- **Auto-create memory summaries:** activa la creación automática de recuerdos en intervalos.
- **Auto-Summary Interval:** número de mensajes tras el cual se crea automáticamente un resumen de recuerdo.
- **Auto-Summary Buffer:** retrasa el resumen automático por una cantidad configurable de mensajes.
- **Prompt for consolidation when a tier is ready:** muestra una confirmación de sí/más tarde cuando un nivel seleccionado tiene suficientes entradas fuente aptas para consolidar.
- **Auto-Consolidation Tiers:** elige uno o más niveles de resumen que deben activar la confirmación cuando estén listos. Actualmente soporta Arc hasta Series.
- **Unhide hidden messages before memory generation:** puede ejecutar `/unhide X-Y` antes de crear un recuerdo.
- **Auto-hide messages after adding memory:** opcionalmente oculta todos los mensajes procesados o solo el rango de recuerdo más reciente.
- **Use regex (advanced):** activa la ventana de selección de Regex de STMB para el procesamiento de salida/entrada.
- **Memory Title Format:** elige o personaliza el formato; ver abajo.

![Configuración de perfil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Campos del perfil**

- **Name:** nombre para mostrar.
- **API/Provider:** `Current SillyTavern Settings`, openai, claude, custom, full manual y otros proveedores compatibles.
- **Model:** nombre del modelo (por ejemplo, gpt-4, claude-3-opus).
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** personalizado o incorporado.
- **Title Format:** plantilla por perfil.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, ↓AN, Outlet (y nombre del campo).
- **Order Mode:** Auto/manual.
- **Recursion:** prevenir/retrasar hasta recursión.

---

## 🏷️ Formato de títulos

Personaliza los títulos de tus entradas de lorebook usando un sistema de plantillas potente.

- **Marcadores de posición:**
  - `{{title}}` - El título generado por la IA (por ejemplo, “Un encuentro fatídico”).
  - `{{scene}}` - El rango de mensajes (por ejemplo, “Scene 15-23”).
  - `{{char}}` - El nombre del personaje.
  - `{{user}}` - Tu nombre de usuario.
  - `{{messages}}` - La cantidad de mensajes en la escena.
  - `{{profile}}` - El nombre del perfil usado para la generación.
  - Marcadores de fecha/hora actual en varios formatos (por ejemplo, `August 13, 2025` para fecha, `11:08 PM` para hora).
- **Auto-numeración:** usa `[0]`, `[00]`, `(0)`, `{0}`, `#0`, y ahora también formas envueltas como `#[000]`, `([000])`, `{[000]}` para numeración secuencial con ceros a la izquierda.
- **Formatos personalizados:** puedes crear tus propios formatos. A partir de v4.5.1, se permiten todos los caracteres Unicode imprimibles en títulos, incluidos emoji, CJK, caracteres acentuados y símbolos. Solo se bloquean los caracteres de control Unicode.

---

## 🧵 Recuerdos de contexto

- **Incluye hasta 7 recuerdos anteriores** como contexto para mejorar la continuidad.
- **La estimación de tokens** incluye recuerdos de contexto para mayor precisión.
- **Las opciones avanzadas** permiten anular temporalmente el comportamiento de prompt/perfil para una sola generación de recuerdo.

![Generación de recuerdos con contexto](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Retroalimentación visual y accesibilidad

- **Estados de botón:**
  - Inactivo, activo, selección válida, en escena, procesando.

![Selección completa de escena mostrando todos los estados visuales](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **Accesibilidad:**
  - Navegación por teclado, indicadores de foco, atributos ARIA, movimiento reducido y compatibilidad móvil.

---

# FAQ

### ¿Debo hacer un lorebook separado para los recuerdos, o puedo usar el mismo lorebook que ya uso para otras cosas?

Recomiendo que tu lorebook de recuerdos sea un libro separado. Esto facilita organizar los recuerdos frente a otras entradas. Por ejemplo, puedes añadirlo a un chat grupal, usarlo en otro chat o establecer un presupuesto individual de lorebook mediante STLO.

### ¿Necesito usar vectores?

Puedes, pero no es obligatorio. Si no usas la extensión de vectores (yo no la uso), funciona mediante palabras clave. Todo esto está automatizado para que no tengas que pensar en qué palabras clave usar.

### ¿Debo usar "Delay until recursion" si Memory Books es el único lorebook?

No. Si no hay otra World Info ni otros lorebooks, seleccionar `Delay until recursion` puede impedir que se active el primer bucle, lo que hace que nada se active. Si Memory Books es el único lorebook, desactiva `Delay until recursion` o asegúrate de configurar al menos una World Info/lorebook adicional.

### ¿Por qué la IA no ve mis entradas?

Primero debes comprobar que las entradas se estén enviando. Me gusta usar [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) para eso.

Si las entradas se activan y se envían a la IA, probablemente tengas que decírselo a la IA de forma más directa en OOC. Algo como: `[OOC: WHY are you not using the information you were given? Specifically: (whatever it was)]` 😁

---

# Solución de problemas

- **¡No puedo encontrar Memory Books en el menú de Extensiones!**
  La configuración está en el menú de Extensiones (la varita mágica 🪄 a la izquierda de tu cuadro de entrada). Busca “Memory Books”.

![Ubicación de los ajustes de STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **No hay lorebook disponible o seleccionado:**
  - En Modo manual, selecciona un lorebook cuando se te solicite.
  - En Modo automático, vincula un lorebook a tu chat.
  - O activa “Auto-create lorebook if none exists” para la creación automática.

- **Error de validación de lorebook:**
  - Probablemente eliminaste el lorebook vinculado previamente. Vuelve a vincular un lorebook nuevo. Puede estar vacío.

- **Ninguna escena seleccionada:**
  - Marca tanto el punto de inicio (►) como el de fin (◄).

- **La escena se superpone con un recuerdo existente:**
  - Elige un rango diferente, o activa “Allow Scene Overlap” en los ajustes.

![Advertencia de superposición de escena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **La IA no pudo generar un recuerdo válido:**
  - Usa un modelo que soporte salida JSON.
  - Revisa tu prompt y los ajustes del modelo.

- **Se excedió el umbral de advertencia de tokens:**
  - Usa una escena más pequeña, o aumenta el umbral.

- **Faltan los botones de chevrón:**
  - Espera a que cargue la extensión, o actualiza la página.

- **Datos del personaje no disponibles:**
  - Espera a que el chat/grupo termine de cargar.

---

## 📚 Potencia tu experiencia con Lorebook Ordering (STLO)

Para organización avanzada de recuerdos e integración más profunda con la historia, usa STMB junto con [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Spanish.md). Consulta la guía para mejores prácticas, instrucciones de configuración y consejos.

---

## 📝 Política de caracteres (v4.5.1+)

- **Permitido en títulos:** se permiten todos los caracteres Unicode imprimibles, incluidos caracteres acentuados, emoji, CJK y símbolos.
- **Bloqueado:** solo se bloquean los caracteres de control Unicode (U+0000–U+001F, U+007F–U+009F); estos se eliminan automáticamente.

Consulta [Detalles de la política de caracteres](../charset.md) para ejemplos y notas de migración.

---

## 👨‍💻 Para desarrolladores

### Compilar la extensión

Esta extensión usa Bun para compilar. El proceso de compilación minimiza y empaqueta los archivos fuente.

```sh
# Compilar la extensión
bun run build
```

### Git Hooks

El proyecto incluye un hook de pre-commit que compila automáticamente la extensión e incluye los artefactos compilados en tus commits. Esto garantiza que los archivos compilados estén siempre sincronizados con el código fuente.

**Para instalar el hook de git:**

```sh
bun run install-hooks
```

El hook hará lo siguiente:

- Ejecutar `bun run build` antes de cada commit
- Añadir los artefactos compilados al commit
- Abortará el commit si la compilación falla

---

*Desarrollado con amor usando VS Code/Cline, pruebas extensivas y comentarios de la comunidad.* 🤖💕
