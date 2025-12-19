# 📕 Memory Books (Una Extensión de SillyTavern)

Una extensión de SillyTavern de próxima generación para la creación automática, estructurada y confiable de memorias. Marca escenas en el chat, genera resúmenes basados en JSON con IA y guárdalos como entradas "vectorizadas" en tus libros de lore. Soporta chats de grupo, gestión avanzada de perfiles y manejo sólido de API/modelos.

Comience aquí:
* ⚠️‼️ Por favor lea los requisitos previos (especialmente si utiliza la API de finalización de texto de OpenAI)
* ❓ [Preguntas Frecuentes](#faq)
* 🛠️ [Solución de problemas](#troubleshooting)

Otros enlaces:
* 📘 [Guía de Usuario (ES)](userguides/USER_GUIDE-ES.md)
* 📋 [Historial de Versiones y Registro de cambios](changelog.md)
* 💡 [Usando Memory Books con Lorebook Ordering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Potenciando Memory Books con Lorebook Ordering (STLO)

Para una organización avanzada de memorias e integración más profunda de la historia, recomendamos encarecidamente usar STMB junto con [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Consulta la guía para mejores prácticas, instrucciones de configuración y consejos!

> Nota: Soporta varios idiomas: ver la carpeta `/locales` para la lista. Las guías de lectura e internacionales/localizadas se pueden encontrar en la carpeta [`/userguides`](userguides). 
> El conversor de Lorebook y la biblioteca de plantillas de Side Prompts se encuentran en la carpeta [`/resources`](resources).

---

## 📋 Requisitos previos

- **SillyTavern:** 1.13.5+ (recomendada la última versión)
- ⚠️‼️**INSTALAR PARA TODOS LOS USUARIOS:** ⚠️⚠️ Debido a que STMB reutiliza muchas funciones del código base de ST, asegúrese de que la extensión esté instalada para todos los usuarios para que la ubicación sea `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`.
- **Selección de escena:** Deben establecerse los marcadores de inicio y final (inicio < fin).
- **Soporte de Chat Completion:** Soporte completo para OpenAI, Claude, Anthropic, OpenRouter u otras API de finalización de chat.
- **Soporte de Text Completion:** Las APIs de finalización de texto (Kobold, TextGen, etc.) son compatibles cuando se conectan a través de un endpoint de API de Finalización de Chat compatible con OpenAI. Recomendó configurar una conexión API de finalización de Chat según los consejos de KoboldCpp a continuación (modifique según sea necesario si utiliza Ollama u otro software). Después de eso, configure un perfil STMB y use Custom (recomendado) o configuración manual completa (solo si Custom falla o tiene más de una conexión personalizada).

### Consejos de KoboldCpp para usar 📕 ST Memory Books
Configúrelo en ST (puede volver a Text Completion después de hacer funcionar STMB)
- API de Finalización de Chat
- Fuente de finalización de chat personalizada
- Endpoint `http://localhost:5001/v1` (también puede usar `127.0.0.1:5000/v1`)
- ingrese cualquier cosa en "custom API key" (no importa, pero ST requiere uno)
- el ID de modelo debe ser `koboldcpp/modelname` (¡no ponga .gguf en el nombre del modelo!)
- descargue un preset de finalización de chat e impórtelo (cualquiera servirá) solo para que tenga un preset de finalización de chat. Esto evita errores de “no soportado”

## 💡 Recomendaciones de Configuración Global del Mundo/Lorebook

- **Coincidencia de palabras completas:** desmarcado (false)
- **Profundidad de escaneo:** cuanto mayor, mejor (la mía está en 8)
- **Pasos de Recursión Máxima:** 2 (recomendación general, no obligatorio)
- **Contexto %:** 80% (basado en una ventana de contexto de 100,000 tokens) - asume que no tienes un historial de chat extremadamente grande o bots.

---

## 🚀 Empezando

### 1. **Instalar y Cargar**
- Cargue SillyTavern y seleccione un personaje o un chat de grupo.
- Espere a que aparezcan los botones de chevron (► ◄) en los mensajes de chat (puede tardar hasta 10 segundos).

![Espere por estos botones](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Marcar una Escena**
- Haga clic en ► en el primer mensaje de su escena.
- Haga clic en ◄ en el último mensaje.

![Indicaciones visuales que muestran la selección de escena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Crear una Memoria**
- Abra el menú de Extensiones (la varita mágica 🪄) y haga clic en "Memory Books", o use el comando slash `/creatememory`.
- Confirme la configuración (perfil, contexto, API/modelo) si se le solicita.
- Espere la generación por IA y la entrada automática en el lorebook.

---

## 🆕 Atajos de Comandos Slash

- `/creatememory` usará los marcadores de inicio/fin de chevron existentes para crear una memoria
- `/scenememory x-y` creará una memoria que comienza en el mensaje x y termina en el mensaje y
- `/nextmemory` creará una memoria con todos los mensajes desde la última memoria.

## 👥 Soporte para Chat de Grupo

- Todas las funciones funcionan con chats de grupo.
- Los marcadores de escena, la creación de memorias y la integración con lorebook se almacenan en metadatos del grupo.
- No se requiere configuración especial: simplemente elija un chat de grupo y úselo como de costumbre.

---

## 🧭 Modos de Operación

### **Modo Automático (Predeterminado)**
- **Cómo funciona:** Usa automáticamente el lorebook vinculado a su chat actual.
- **Mejor para:** Simplicidad y rapidez. La mayoría de usuarios debería empezar aquí.
- **Cómo usar:** Asegúrese de que un lorebook esté seleccionado en el listado "Chat Lorebooks" para su personaje o chat de grupo.

![Ejemplo de enlace del lorebook de chat](https://github.com/aikohanasaki/imagehost/blob/main/STMMemoryBooks/chatlorebook.png)

### **Modo de Auto-Creación de Lorebook** ⭐ *Nuevo en la versión v4.2.0*
- **Cómo funciona:** Crea y vincula automáticamente un nuevo lorebook cuando no existe uno, usando su plantilla de nombre personalizada.
- **Mejor para:** Usuarios nuevos y configuración rápida. Perfecto para crear un Lorebook con un solo clic.
- **Para usar:**
  1. Habilite "Auto-create lorebook if none exists" en la configuración de la extensión.
  2. Configure su plantilla de nombres (predeterminado: "LTM - {{char}} - {{chat}}").
  3. Cuando cree una memoria sin un lorebook ligado, se crea y enlaza automáticamente.
- **Marcadores de plantilla:** {{char}} (nombre del personaje), {{user}} (su nombre), {{chat}} (ID del chat)
- **Numeración inteligente:** Agrega números automáticamente (2, 3, 4, ...) si existen nombres duplicados.
- **Nota:** No se puede usar simultáneamente con el Modo Manual de Lorebook.

### **Modo de Lorebook Manual**
- **Cómo funciona:** Le permite seleccionar un lorebook diferente para memorias en un chat específico, ignorando el lorebook vinculado al chat principal.
- **Mejor para:** Usuarios avanzados que desean dirigir memorias a un lorebook específico y separado.
- **Para usar:**
  1. Habilite "Enable Manual Lorebook Mode" en la configuración de la extensión.
  2. La primera vez que crea una memoria en un chat, se le pedirá que elija un lorebook.
  3. Esta elección se guarda para ese chat específico hasta que la borre o vuelva a Automatic Mode.
- **Nota:** No se puede usar simultáneamente con el Modo de Auto-Creación de Lorebook.

---

## 📝 Generación de Memorias

### **Salida JSON Únicamente**
Todos los prompts y presets deben indicar que la IA devuelva solo JSON válido, por ejemplo:

```json
{
  "title": "Título corto de la escena",
  "content": "Resumen detallado de la escena...",
  "keywords": ["palabra1", "palabra2"]
}
```
**No se permite texto adicional.**

### **Presets Integrados**
1. **Resumen:** Resúmenes detallados beat-by-beat.
2. **Summarize:** Encabezados de Markdown para línea de tiempo, beats, interacciones, resultado.
3. **Synopsis:** Detallado y estructurado en Markdown.
4. **Sum Up:** Resumen breve con línea de tiempo.

### **Prompts Personalizados**
- Crea el tuyo propio, pero debe devolver JSON válido como se muestra arriba.

---

## 📚 Integración con Lorebook

- **Entrada automática:** Las nuevas memorias se almacenan como entradas con todos los metadatos.
- **Detección por banderas:** Solo las entradas con la bandera `stmemorybooks` son reconocidas como memorias.
- **Numeración automática:** Numeración secuencial, con relleno de ceros, con múltiples formatos soportados (`[000]`, `(000)`, `{000}`, `#000`).
- **Ordenamiento Manual/Automático:** Configuraciones de inserción por perfil.
- **Actualización del editor:** Opcionalmente actualiza automáticamente el editor de lorebook después de añadir una memoria.

> **¡Las memorias existentes deben convertirse!**
> Utilice el [Conversor de Lorebook](/resources/lorebookconverter.html) para añadir la bandera `stmemorybooks` y los campos requeridos.

---

### 🎡 Prompts Laterales

Los Side Prompts pueden usarse como trackers y crearán entradas en su libro de lore de memorias.
- **Acceso:** Desde la configuración de Memory Books, haga clic en “🎡 Side Prompt Manager”.
- **Características**:
    - Ver todos los prompts laterales.
    - Crear nuevos o duplicar prompts para experimentar con diferentes estilos de prompts.
    - Editar o eliminar cualquier preset (incluidos los integrados).
    - Exportar e importar presets como archivos JSON para copias de seguridad o compartir.
    - Ejecutarlos manualmente o automáticamente con la creación de memorias.
- **Consejos de uso:**
    - Al crear un nuevo prompt, puede copiar de los integrados para mayor compatibilidad.
    - Biblioteca adicional de Side Prompts Template Library [JSON file](resources/SidePromptTemplateLibrary.json) - con solo importar para usar

---

### 🧠 Integración de Regex para Personalización Avanzada
- **Control total sobre el procesamiento de texto**: Memory Books ahora se integra con la extensión de SillyTavern **Regex**, permitiendo aplicar transformaciones de texto potentes en dos etapas clave:
    1.  **Generación de prompts**: Modificar automáticamente los prompts enviados al IA creando scripts de regex que apunten a la ubicación de la Entrada del Usuario.
    2.  **Análisis de respuestas**: Limpiar, reformatear o estandarizar la respuesta cruda de la IA antes de que sea guardada, apuntando a la ubicación de la Salida de IA.
- **Soporte de multi-selección**: Ahora puedes seleccionar múltiples scripts de regex. Todos los scripts habilitados se aplicarán en secuencia en cada etapa (Generación de prompts y Análisis de respuestas), lo que permite transformaciones avanzadas y flexibles.
- **Cómo funciona**: La integración es fluida. Simplemente crea y habilita (multi-selección) tus scripts deseados en la extensión Regex, y Memory Books los aplicará automáticamente durante la creación de memorias y prompts secundarios.

---

## 👤 Gestión de Perfiles

- **Perfiles:** Cada perfil incluye API, modelo, temperatura, prompt/preset, formato de título y configuraciones de lorebook.
- **Importar/Exportar:** Compartir perfiles como JSON.
- **Creación de perfiles:** Use el cuadro de opciones avanzadas para guardar nuevos perfiles.
- **Anulaciones por perfil:** Cambie temporalmente API/model/temperatura para la creación de memorias y luego restablezca su configuración original.

---

## ⚙️ Ajustes y Configuración

![Panel principal de ajustes](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Ajustes Globales**
[Resumen en video corto en YouTube](https://youtu.be/mG2eRH_EhHs)

- **Modo de Lorebook Manual:** Actívelo para seleccionar lorebooks por chat.
- **Auto-create lorebook if none exists:** ⭐ *Nuevo en la versión v4.2.0* - Crea y enlaza lorebooks automáticamente usando su plantilla de nombres.
- **Lorebook Name Template:** ⭐ *Nuevo en la versión v4.2.0* - Personalice los nombres de lorebook creados automáticamente con marcadores de posición {{char}}, {{user}}, {{chat}}.
- **Allow Scene Overlap:** Permitir o evitar solapamientos de escenas.
- **Always Use Default Profile:** Omite los cuadros de confirmación.
- **Show memory previews:** Habilitar vista previa para revisar y editar memorias antes de agregarlas al lorebook.
- **Show Notifications:** Activar notificaciones tipo toast.
- **Refresh Editor:** Actualizar automáticamente el editor de lorebook después de crear una memoria.
- **Token Warning Threshold:** Establecer el umbral de advertencia para escenas grandes (predeterminado: 30,000).
- **Default Previous Memories:** Número de memorias anteriores a incluir como contexto (0-7).
- **Auto-create memory summaries:** Habilitar la generación automática de resúmenes de memorias a intervalos.
- **Auto-Summary Interval:** Número de mensajes después del cual se crea automáticamente un resumen de memoria (10-200, por defecto: 100).
- **Memory Title Format:** Elija o personalice (ver más abajo).

![Configuración de perfil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Campos de Perfil**
- **Name:** Nombre para mostrar.
- **API/Provider:** openai, claude, custom, etc.
- **Model:** Nombre del modelo (p. ej., gpt-4, claude-3-opus).
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** Personalizado o incorporado.
- **Title Format:** Plantilla por perfil.
- **Activation Mode:** Vectorizado, Constante, Normal.
- **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Salida (y nombre de campo).
- **Order Mode:** Auto/manual.
- **Recursion:** Evitar / retrasar la recursión.

---

## 🏷️ Formato de Títulos

Personalice los títulos de sus entradas de lorebook usando un sistema de plantillas poderoso.

- **Placeholders:**
  - `{{title}}` - El título generado por la IA (p. ej., "Un Encuentro Fatídico").
  - `{{scene}}` - El rango de mensajes (p. ej., "Escena 15-23").
  - `{{char}}` - El nombre del personaje.
  - `{{user}}` - Su nombre de usuario.
  - `{{messages}}` - El número de mensajes en la escena.
  - `{{profile}}` - El nombre del perfil utilizado para la generación.
  - Marcadores de fecha/hora actuales en varios formatos.
- **Numeración automática:** Use `[0]`, `[00]`, `(0)`, `{0}`, `#0`, y ahora también las formas envolventes como `#[000]`, `([000])`, `{[000]}` para una numeración secuencial, con ceros a la izquierda.
- **Formatos personalizados:** Puede crear sus propios formatos. A partir de la versión v4.5.1, todos los caracteres Unicode imprimibles (incluyendo emoji, CJK, acentos, símbolos, etc.) están permitidos en los títulos; solo están bloqueados los caracteres de control Unicode.

---

## 🧵 Memorias de Contexto

- **Incluye hasta 7 memorias anteriores** como contexto para mejor continuidad.
- **Estimación de tokens** incluye las memorias de contexto para mayor precisión.

![Memorias de contexto](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Comentarios Visuales y Accesibilidad

- **estados de botón:** Inactivo, activo, selección válida, en escena, en procesamiento.

![Estado de finalización de la escena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **Accesibilidad:**
  - Navegación por teclado, indicadores de foco, atributos ARIA, movimiento reducido, versión móvil compatible.

---

# FAQ

### ¿No encuentro Memory Books en el menú de Extensiones?
Los ajustes se encuentran en el menú de Extensiones (la varita 🪄 a la izquierda de su caja de entrada). Busque "Memory Books".

![Ubicación de los ajustes de STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

### ¿Necesito ejecutar vectores?

La entrada 🔗 en la información mundial se llama "vectorized" en la interfaz de ST. Por eso uso el vector de mundo. Si no usas la extensión de vectores (yo no), funciona por palabras clave. Todo esto se hace automáticamente para que no tengas que pensar en qué palabras clave usar.

![Desplegable de estrategia de ST](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/vectorized.png)

![Palabras clave generadas por IA](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/keywords.png)

### ¿Debería hacer un lorebook separado para memorias, o puedo usar el mismo lorebook que ya utilizo para otras cosas?
Recomiendo que su lorebook de memorias sea un libro separado. Esto facilita la organización de memorias (frente a otras entradas).
Por ejemplo, añadirlo a un chat de grupo, usarlo en otro chat o configurar un presupuesto de lorebook por separado (usando STLO).

### ¿Debería usar 'Retrasar la recursión' si Memory Books es el único lorebook?
No. Si no hay otros World Info o lorebooks, seleccionar 'Retrasar la recursión' puede evitar que se dispare el primer bucle, haciendo que nada se active. Si Memory Books es el único lorebook, desactívelo o asegúrese de configurar al menos un World Info/lorebook adicional.

---

## 📝 Política de Personajes (v4.5.1+)

- **Permitidos en títulos:** Todos los caracteres Unicode imprimibles están permitidos, incluyendo acentos, emoji, CJK y símbolos.
- **Bloqueados:** Solo caracteres de control Unicode (U+0000–U+001F, U+007F–U+009F) están bloqueados; se eliminan automáticamente.

Consulta [Detalles de la Política de Caracteres](charset.md) para ejemplos y notas de migración.

---

*Desarrollado con amor usando VS Code/Cline, pruebas extensivas y comentarios de la comunidad.* 🤖💕
