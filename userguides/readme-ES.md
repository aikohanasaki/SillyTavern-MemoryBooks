# 📕 Memory Books (Una extensión para SillyTavern)

Una extensión de próxima generación para SillyTavern para la creación automática, estructurada y fiable de recuerdos. Marca escenas en el chat, genera resúmenes basados en JSON con IA y guárdalos como entradas "[vectorizadas](#vectorized)" en tus lorebooks (libros de saber). Soporta chats grupales, gestión avanzada de perfiles y un manejo robusto de API/modelos.

### ❓ Vocabulario
- Scene (Escena) → Memory (Recuerdo)
- Many Scenes (Muchas Escenas) → Arc Summary (Resumen de Arco)
- Always-On (Siempre activo) → Side Prompt (Prompt Secundario/Rastreador)

## ❗ ¡Léeme Primero!

Comienza aquí: 
* ⚠️‼️Por favor, lee los [prerrequisitos](#-prerrequisitos) para notas de instalación (especialmente si ejecutas una API de Completado de Texto).
* ❓ [Preguntas Frecuentes](#FAQ)
* 🛠️ [Solución de Problemas](#solución-de-problemas)

Otros enlaces: 
* 📘 [Guía de Usuario (EN)](USER_GUIDE.md)
* 📋 [Historial de Versiones y Registro de Cambios](changelog.md)
* 💡 [Usando 📕 Memory Books con 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Potencia tu experiencia con Lorebook Ordering (STLO)

Para una organización avanzada de la memoria y una integración más profunda en la historia, recomendamos encarecidamente usar STMB junto con [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). ¡Consulta la guía para conocer las mejores prácticas, instrucciones de configuración y consejos!

> Nota: Soporta varios idiomas: consulta la carpeta [`/locales`](locales) para ver la lista. El Readme y las Guías de Usuario internacionales/localizadas se pueden encontrar en la carpeta [`/userguides`](userguides).
> El convertidor de lorebooks y la biblioteca de plantillas de side prompts están en la carpeta [`/resources`](resources).

---

## 📋 Prerrequisitos

- **SillyTavern:** 1.14.0+ (se recomienda la última versión)
- **Selección de Escena:** Se deben establecer marcadores de inicio y fin (inicio < fin).
- **Soporte de Chat Completion:** Soporte completo para OpenAI, Claude, Anthropic, OpenRouter u otra API de chat completion.
- **Soporte de Text Completion:** Las APIs de text completion (Kobold, TextGen, etc.) son compatibles cuando se conectan a través de un endpoint de API de Chat Completion (compatible con OpenAI). Recomiendo configurar una conexión de API de Chat Completion según los consejos de KoboldCpp a continuación (cambia según sea necesario si usas Ollama u otro software). Después de eso, configura un perfil STMB y usa Personalizado (recomendado) o configuración manual completa (solo si Personalizado falla o tienes más de una conexión personalizada).
**NOTA**: Ten en cuenta que si usas Text Completion, debes...

### Consejos de KoboldCpp para usar 📕 ST Memory Books
Configura esto en ST (puedes volver a cambiar a Text Completion DESPUÉS de hacer funcionar STMB):
- API de Chat Completion
- Fuente de chat completion personalizada
- Endpoint `http://localhost:5001/v1` (también puedes usar `127.0.0.1:5000/v1`)
- introduce cualquier cosa en "custom API key" (no importa, pero ST requiere una)
- el ID del modelo debe ser `koboldcpp/nombredelmodelo` (¡no pongas .gguf en el nombre del modelo!)
- descarga un preset de chat completion e impórtalo (cualquiera servirá) solo para TENER un preset de chat completion. Esto evita errores de "no soportado".
- cambia la longitud máxima de respuesta en el preset de chat completion para que sea al menos 2048; se recomienda 4096. (Menos significa que corres el riesgo de que se corte).

### Consejos de Llama.cpp para usar 📕 ST Memory Books
Al igual que con Kobold, configura lo siguiente como una _API de Chat Completion_ en ST (puedes volver a cambiar a Chat Completion después de verificar que STMB funciona):
- Crea un nuevo perfil de conexión para una API de Chat Completion
- Fuente de Completado: `Custom (Open-AI Compatible)`
- URL del Endpoint: `http://host.docker.internal:8080/v1` si ejecutas ST en docker, de lo contrario `http://localhost:8080/v1`
- Custom API key: introduce cualquier cosa (ST requiere una)
- ID del Modelo: `llama2-7b-chat.gguf` (o tu modelo, no importa si no estás ejecutando más de uno en llama.cpp)
- Post-procesamiento del Prompt: ninguno

Para iniciar Llama.cpp, recomiendo colocar algo similar a lo siguiente en un script de shell o archivo bat, para que el inicio sea más fácil:
```sh
llama-server -m <ruta-del-modelo> -c <tamaño-contexto> --port 8080

```

## 💡 Configuración Recomendada de Activación Global de World Info/Lorebook

* **Match Whole Words (Coincidir palabras completas):** dejar desmarcado (false)
* **Scan Depth (Profundidad de escaneo):** cuanto más alto mejor (el mío está configurado en 8)
* **Max Recursion Steps (Pasos máximos de recursión):** 2 (recomendación general, no obligatorio)
* **Context % (% de Contexto):** 80% (basado en una ventana de contexto de 100,000 tokens) - asume que no tienes un historial de chat o bots súper pesados.

---

## 🚀 Comenzando

### 1. **Instalar y Cargar**

* Carga SillyTavern y selecciona un personaje o chat grupal.
* Espera a que aparezcan los botones de chevrón (► ◄) en los mensajes del chat (puede tardar hasta 10 segundos).

### 2. **Marcar una Escena**

* Haz clic en ► en el primer mensaje de tu escena.
* Haz clic en ◄ en el último mensaje.

### 3. **Crear un Recuerdo**

* Abre el menú de Extensiones (la varita mágica 🪄) y haz clic en "Memory Books", o usa el comando de barra `/creatememory`.
* Confirma la configuración (perfil, contexto, API/modelo) si se solicita.
* Espera a la generación de la IA y la entrada automática en el lorebook.

---

## 🆕 Atajos de Comandos de Barra

* `/creatememory` usará los marcadores de inicio/fin existentes para crear un recuerdo.
* `/scenememory x-y` creará un recuerdo comenzando con el mensaje x y terminando con el mensaje y.
* `/nextmemory` creará un recuerdo con todos los mensajes desde el último recuerdo.

## 👥 Soporte para Chats Grupales

* Todas las características funcionan con chats grupales.
* Los marcadores de escena, la creación de recuerdos y la integración con el lorebook se almacenan en los metadatos del grupo.
* No se requiere configuración especial: simplemente selecciona un chat grupal y úsalo normalmente.

---

## 🧭 Modos de Operación

### **Modo Automático (Predeterminado)**

* **Cómo funciona:** Utiliza automáticamente el lorebook que está vinculado a tu chat actual.
* **Mejor para:** Simplicidad y velocidad. La mayoría de los usuarios deberían comenzar aquí.
* **Para usar:** Asegúrate de que haya un lorebook seleccionado en el menú desplegable "Chat Lorebooks" para tu personaje o chat grupal.

### **Modo de Auto-Creación de Lorebook** ⭐ *Nuevo en v4.2.0*

* **Cómo funciona:** Crea y vincula automáticamente un nuevo lorebook cuando no existe ninguno, utilizando tu plantilla de nombres personalizada.
* **Mejor para:** Nuevos usuarios y configuración rápida. Perfecto para la creación de lorebooks con un solo clic.
* **Para usar:**
1. Habilita "Auto-create lorebook if none exists" en la configuración de la extensión.
2. Configura tu plantilla de nombres (predeterminado: "LTM - {{char}} - {{chat}}").
3. Cuando creas un recuerdo sin un lorebook vinculado, se crea y vincula uno automáticamente.


* **Marcadores de posición de plantilla:** {{char}} (nombre del personaje), {{user}} (tu nombre), {{chat}} (ID del chat)
* **Numeración inteligente:** Añade números automáticamente (2, 3, 4...) si existen nombres duplicados.
* **Nota:** No se puede usar simultáneamente con el Modo Manual de Lorebook.

### **Modo Manual de Lorebook**

* **Cómo funciona:** Te permite seleccionar un lorebook diferente para los recuerdos por cada chat, ignorando el lorebook principal vinculado al chat.
* **Mejor para:** Usuarios avanzados que desean dirigir los recuerdos a un lorebook específico y separado.
* **Para usar:**
1. Habilita "Enable Manual Lorebook Mode" en la configuración de la extensión.
2. La primera vez que crees un recuerdo en un chat, se te pedirá que elijas un lorebook.
3. Esta elección se guarda para ese chat específico hasta que la borres o cambies de nuevo al Modo Automático.


* **Nota:** No se puede usar simultáneamente con el Modo de Auto-Creación de Lorebook.

---

## 🧩 Tipos de Memoria: Escenas vs Arcos

📕 Memory Books soporta **dos niveles de memoria narrativa**, cada uno diseñado para diferentes tipos de continuidad.

### 🎬 Recuerdos de Escena (Predeterminado)

Los recuerdos de escena capturan **lo que sucedió** en un rango específico de mensajes.

* Basado en la selección explícita de escenas (► ◄)
* Ideal para recordar momento a momento
* Preserva el diálogo, las acciones y los resultados inmediatos
* Mejor usado frecuentemente

Este es el tipo de memoria estándar y más utilizado.

---

### 🧭 Resúmenes de Arco *(Beta)*

Los resúmenes de arco capturan **lo que cambió con el tiempo** a través de múltiples escenas.

En lugar de resumir eventos, los resúmenes de arco se centran en:

* Desarrollo del personaje y cambios en las relaciones
* Objetivos a largo plazo, tensiones y resoluciones
* Trayectoria emocional y dirección narrativa
* Cambios de estado persistentes que deben permanecer estables

Los resúmenes de arco son **recuerdos de nivel superior y menor frecuencia** diseñados para prevenir la desviación del personaje y la pérdida narrativa en chats de larga duración.

> 💡 Piensa en los resúmenes de arco como *resúmenes de temporada*, no registros de escenas.

#### Cuándo usar Resúmenes de Arco

* Después de un cambio importante en una relación
* Al final de un capítulo o arco de la historia
* Cuando las motivaciones, la confianza o las dinámicas de poder cambian
* Antes de comenzar una nueva fase de la historia

#### Notas Beta

* Los resúmenes de arco son sensibles al prompt e intencionalmente conservadores
* Se recomienda revisar antes de guardar en el lorebook
* Mejor emparejado con entradas de lorebook de menor prioridad o estilo meta

Los resúmenes de arco se generan **a partir de recuerdos de escena existentes**, no directamente del chat sin procesar.

Esto te ofrece:

* reducción del uso de tokens
* la IA tiene una mejor comprensión del flujo narrativo

---

## 📝 Generación de Recuerdos

### **Solo Salida JSON**

Todos los prompts y presets **deben** instruir a la IA para que devuelva solo JSON válido, por ejemplo:

```json
{
  "title": "Título corto de la escena",
  "content": "Resumen detallado de la escena...",
  "keywords": ["palabra clave1", "palabra clave2"]
}

```

**No se permite ningún otro texto en la respuesta.**

### **Presets Incorporados**

1. **Summary:** Resúmenes detallados paso a paso.
2. **Summarize:** Encabezados Markdown para línea de tiempo, momentos clave, interacciones, resultado.
3. **Synopsis:** Markdown completo y estructurado.
4. **Sum Up:** Resumen conciso de momentos clave con línea de tiempo.
5. **Minimal:** Resumen de 1-2 oraciones.

### **Prompts Personalizados**

* Crea los tuyos propios, pero **deben** devolver JSON válido como se indica arriba.

---

## 📚 Integración con Lorebook

* **Creación Automática de Entradas:** Los nuevos recuerdos se almacenan como entradas con todos los metadatos.
* **Detección Basada en Banderas:** Solo las entradas con la bandera `stmemorybooks` se reconocen como recuerdos.
* **Auto-Numeración:** Numeración secuencial con ceros a la izquierda con múltiples formatos soportados (`[000]`, `(000)`, `{000}`, `#000`).
* **Orden Manual/Automático:** Configuración de orden de inserción por perfil.
* **Actualización del Editor:** Opcionalmente actualiza el editor del lorebook automáticamente después de agregar un recuerdo.

> **¡Los recuerdos existentes deben ser convertidos!**
> Usa el [Convertidor de Lorebook](https://www.google.com/search?q=/resources/lorebookconverter.html) para agregar la bandera `stmemorybooks` y los campos requeridos.

---

### 🎡 Rastreadores y Side Prompts (Prompts Secundarios)

Los Side Prompts pueden usarse como rastreadores y crearán entradas en tu lorebook de memoria. Los Side Prompts te permiten rastrear el **estado continuo**, no solo eventos pasados. Por ejemplo:

* 💰 Inventario y Recursos ("¿Qué artículos tiene el usuario?")
* ❤️ Estado de la Relación ("¿Cómo se siente X acerca de Y?")
* 📊 Estadísticas del Personaje ("Salud actual, habilidades, reputación")
* 🎯 Progreso de Misión ("¿Qué objetivos están activos?")
* 🌍 Estado del Mundo ("¿Qué ha cambiado en el entorno?")

#### **Acceso:** Desde la configuración de Memory Books, haz clic en “🎡 Side Prompt Manager”.

#### **Características:**

```
- Ver todos los side prompts.
- Crear prompts nuevos o duplicar para experimentar con diferentes estilos.
- Editar o eliminar cualquier preset (incluidos los integrados).
- Exportar e importar presets como archivos JSON para copia de seguridad o compartir.
- Ejecutarlos manualmente o automáticamente con la creación de recuerdos.

```

#### **Consejos de Uso:**

```
- Al crear un nuevo prompt, puedes copiar de los integrados para una mejor compatibilidad.
- Biblioteca adicional de Plantillas de Side Prompts [archivo JSON](resources/SidePromptTemplateLibrary.json) - simplemente importa para usar.

```

---

### 🧠 Integración de Regex para Personalización Avanzada

* **Control Total Sobre el Procesamiento de Texto**: Memory Books ahora se integra con la extensión **Regex** de SillyTavern, permitiéndote aplicar transformaciones de texto poderosas en dos etapas clave:
1. **Generación de Prompt**: Modifica automáticamente los prompts enviados a la IA creando scripts regex que apuntan a la ubicación **User Input** (Entrada del Usuario).
2. **Análisis de Respuesta**: Limpia, reformatea o estandariza la respuesta bruta de la IA antes de que se guarde apuntando a la ubicación **AI Output** (Salida de la IA).


* **Soporte de Selección Múltiple**: Ahora puedes seleccionar múltiples scripts regex. Todos los scripts habilitados se aplicarán en secuencia en cada etapa (Generación de Prompt y Análisis de Respuesta), permitiendo transformaciones avanzadas y flexibles.
* **Cómo Funciona**: La integración es fluida. Simplemente crea y habilita (selección múltiple) tus scripts deseados en la extensión Regex, y Memory Books los aplicará automáticamente durante la creación de recuerdos y side prompts.

---

## 👤 Gestión de Perfiles

* **Perfiles:** Cada perfil incluye API, modelo, temperatura, prompt/preset, formato de título y configuración de lorebook.
* **Importar/Exportar:** Comparte perfiles como JSON.
* **Creación de Perfiles:** Usa la ventana emergente de opciones avanzadas para guardar nuevos perfiles.
* **Anulaciones por Perfil:** Cambia temporalmente la API/modelo/temp para la creación de recuerdos, luego restaura tu configuración original.

---

## ⚙️ Ajustes y Configuración

### **Configuración Global**

[Breve descripción en video en Youtube](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode:** Habilita para seleccionar lorebooks por chat.
* **Auto-create lorebook if none exists:** ⭐ *Nuevo en v4.2.0* - Crea y vincula automáticamente lorebooks usando tu plantilla de nombres.
* **Lorebook Name Template:** ⭐ *Nuevo en v4.2.0* - Personaliza los nombres de lorebooks auto-creados con marcadores {{char}}, {{user}}, {{chat}}.
* **Allow Scene Overlap:** Permite o previene rangos de memoria superpuestos.
* **Always Use Default Profile:** Omite las ventanas emergentes de confirmación.
* **Show memory previews:** Habilita la ventana emergente de vista previa para revisar y editar recuerdos antes de agregarlos al lorebook.
* **Show Notifications:** Alterna los mensajes tipo toast.
* **Refresh Editor:** Actualiza automáticamente el editor de lorebook después de la creación de un recuerdo.
* **Token Warning Threshold:** Establece el nivel de advertencia para escenas grandes (predeterminado: 30,000).
* **Default Previous Memories:** Número de recuerdos anteriores para incluir como contexto (0-7).
* **Auto-create memory summaries:** Habilita la creación automática de recuerdos a intervalos.
* **Auto-Summary Interval:** Número de mensajes después de los cuales crear automáticamente un resumen de memoria (10-200, predeterminado: 100).
* **Memory Title Format:** Elige o personaliza (ver abajo).

### **Campos del Perfil**

* **Name:** Nombre para mostrar.
* **API/Provider:** openai, claude, custom, etc.
* **Model:** Nombre del modelo (por ejemplo, gpt-4, claude-3-opus).
* **Temperature:** 0.0–2.0.
* **Prompt or Preset:** Personalizado o integrado.
* **Title Format:** Plantilla por perfil.
* **Activation Mode:** Vectorized, Constant, Normal.
* **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (y nombre del campo).
* **Order Mode:** Auto/manual.
* **Recursion:** Prevenir/retrasar recursión.

---

## 🏷️ Formato de Títulos

Personaliza los títulos de tus entradas de lorebook utilizando un potente sistema de plantillas.

* **Marcadores de posición:**
* `{{title}}` - El título generado por la IA (por ejemplo, "Un Encuentro Fatídico").
* `{{scene}}` - El rango de mensajes (por ejemplo, "Escena 15-23").
* `{{char}}` - El nombre del personaje.
* `{{user}}` - Tu nombre de usuario.
* `{{messages}}` - El número de mensajes en la escena.
* `{{profile}}` - El nombre del perfil utilizado para la generación.
* Marcadores de fecha/hora actuales en varios formatos (por ejemplo, `August 13, 2025` para fecha, `11:08 PM` para hora).


* **Auto-numeración:** Usa `[0]`, `[00]`, `(0)`, `{0}`, `#0`, y ahora también las formas envueltas como `#[000]`, `([000])`, `{[000]}` para numeración secuencial con ceros a la izquierda.
* **Formatos Personalizados:** Puedes crear tus propios formatos. A partir de la v4.5.1, todos los caracteres Unicode imprimibles (incluidos emoji, CJK, acentuados, símbolos, etc.) están permitidos en los títulos; solo los caracteres de control Unicode están bloqueados.

---

## 🧵 Recuerdos de Contexto

* **Incluye hasta 7 recuerdos anteriores** como contexto para una mejor continuidad.
* **La estimación de tokens** incluye recuerdos de contexto para mayor precisión.

---

## 🎨 Retroalimentación Visual y Accesibilidad

* **Estados de Botón:**
* Inactivo, activo, selección válida, en escena, procesando.


* **Accesibilidad:**
* Navegación por teclado, indicadores de foco, atributos ARIA, reducción de movimiento, compatible con móviles.



---

# FAQ (Preguntas Frecuentes)

### ¡No puedo encontrar Memory Books en el menú de Extensiones!

La configuración se encuentra en el menú de Extensiones (la varita mágica 🪄 a la izquierda de tu cuadro de entrada). Busca "Memory Books".

### ¿Necesito ejecutar vectores?

La entrada 🔗 en world info se llama "vectorized" (vectorizada) en la interfaz de usuario de ST. Por eso uso la palabra vectorizada. Si no usas la extensión de vectores (yo no lo hago), funciona a través de palabras clave. Todo esto está automatizado para que no tengas que pensar en qué palabras clave usar.

### ¿Debo hacer un lorebook separado para los recuerdos, o puedo usar el mismo lorebook que ya estoy usando para otras cosas?

Recomiendo que tu lorebook de memoria sea un libro separado. Esto facilita la organización de los recuerdos (frente a otras entradas). Por ejemplo, agregarlo a un chat grupal, usarlo en otro chat o establecer un presupuesto de lorebook individual (usando STLO).

### ¿Debo usar 'Delay until recursion' si Memory Books es el único lorebook?

No. Si no hay otra world info o lorebooks, seleccionar 'Delay until recursion' puede evitar que el primer bucle se active, causando que nada se active. Si Memory Books es el único lorebook, deshabilita 'Delay until recursion' o asegúrate de que al menos una world info/lorebook adicional esté configurada.

---

# Solución de Problemas

* **No hay lorebook disponible o seleccionado:**
* En Modo Manual, selecciona un lorebook cuando se te solicite.
* En Modo Automático, vincula un lorebook a tu chat.
* O habilita "Auto-create lorebook if none exists" para la creación automática.


* **Ninguna escena seleccionada:**
* Marca los puntos de inicio (►) y fin (◄).


* **La escena se superpone con un recuerdo existente:**
* Elige un rango diferente, o habilita "Allow scene overlap" en la configuración.


* **La IA falló al generar un recuerdo válido:**
* Usa un modelo que soporte salida JSON.
* Revisa tu prompt y la configuración del modelo.


* **Umbral de advertencia de tokens excedido:**
* Usa una escena más pequeña, o aumenta el umbral.


* **Faltan botones de chevrón:**
* Espera a que la extensión cargue, o refresca.


* **Datos del personaje no disponibles:**
* Espera a que el chat/grupo cargue completamente.

---

## 📝 Política de Caracteres (v4.5.1+)

* **Permitido en títulos:** Todos los caracteres Unicode imprimibles están permitidos, incluyendo letras acentuadas, emojis, CJK y símbolos.
* **Bloqueado:** Solo los caracteres de control Unicode (U+0000–U+001F, U+007F–U+009F) están bloqueados; estos se eliminan automáticamente.

## Consulta [Detalles de la Política de Caracteres](https://www.google.com/search?q=charset.md) para ejemplos y notas de migración.

*Desarrollado con amor usando VS Code/Cline, pruebas extensivas y comentarios de la comunidad.* 🤖💕
