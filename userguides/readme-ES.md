# 📕 Libros de Memoria (una extensión de SillyTavern)

Una extensión de SillyTavern de nueva generación para la creación de memorias automática, estructurada y fiable. Marque escenas en el chat, genere resúmenes basados en JSON con IA y guárdelos como entradas "[vectorizadas](#vectorized)" en sus libros de conocimiento. Admite chats grupales, gestión avanzada de perfiles y manejo a prueba de balas de API/modelos.

⚠️‼️**¡Por favor, lea los [prerrequisitos](#-prerrequisitos) para notas de instalación!**

**📘 [Guía de Usuario (ES)](USER_GUIDE.md)** |  **📋 [Historial de Versiones y Registro de Cambios](changelog.md)** | [Uso de 📕 Memory Books con 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Spanish.md)

---

### 📚 Potencia tu experiencia con Lorebook Ordering (STLO)

Para una organización avanzada de memorias y una integración de historias más profunda, se recomienda usar STMB junto con [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Spanish.md). Consulta la guía para mejores prácticas, instrucciones de configuración y consejos.

> Nota: Admite varios idiomas: consulte la carpeta [`/locales`](locales) para ver la lista. Los Readme y las Guías de Usuario internacionales/localizadas se pueden encontrar en la carpeta [`/userguides`](userguides). 
> El convertidor de libros de conocimiento y la biblioteca de plantillas de prompts laterales se encuentran en la carpeta [`/resources`](resources).

## FAQ (Preguntas Frecuentes)
### ¿Dónde está la entrada en el menú de Extensiones?
Los ajustes se encuentran en el menú de Extensiones (la varita mágica 🪄 a la izquierda de su cuadro de entrada). Busque "Libros de Memoria".

![Ubicación de los ajustes de STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

### ¿Vectorizado?

La entrada 🔗 en la información del mundo se llama "vectorized" en la interfaz de usuario de ST. Por eso uso la palabra vectorizado. Si no usa la extensión de vectores (yo no la uso), funciona a través de palabras clave. Todo esto está automatizado para que no tenga que pensar qué palabras clave usar.

![Menú desplegable de estrategia de ST](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/vectorized.png)

![Palabras clave generadas por IA](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/keywords.png)

---

## 🚦 Novedades (v4.6.7)

### 🪲 Varias Correcciones de Errores
- corregir la creación automática y el resumen automático

### 🌐 Internacionalización
- Internacionalización continua (consulte la carpeta [`/locales`](locales) para ver la lista).

---

## 📋 Prerrequisitos

- **SillyTavern:** 1.13.4+ (se recomienda la última versión)
- ⚠️‼️**INSTALAR PARA TODOS LOS USUARIOS:**‼️⚠️ Como STMB reutiliza muchas funciones del código base de ST, asegúrate de que la extensión esté instalada para todos los usuarios para que la ubicación sea `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`. De lo contrario, fallarán las importaciones de funciones.
- **Selección de escena:** Se deben establecer los marcadores de inicio y fin (inicio < fin).
- **Soporte de finalización de chat:** Soporte completo para OpenAI, Claude, Anthropic, OpenRouter u otra API de finalización de chat.
- **Soporte de finalización de texto:** Las API de finalización de texto (Kobold, TextGen, etc.) son compatibles cuando se conectan a través de la configuración manual completa o una fuente de finalización personalizada en SillyTavern.

### Consejos de KoboldCpp para usar 📕 ST Memory Books
Configura esto en ST (puedes volver a la Completación de Texto DESPUÉS de que STMB funcione)
- API de Chat Completion
- Fuente de chat completion personalizada
- Endpoint `http://localhost:5001/v1` (también puedes usar `127.0.0.1:5000/v1`)
- Ingresa cualquier cosa en "clave de API personalizada" (no importa, pero ST requiere una)
- El ID del modelo debe ser `koboldcpp/nombredelmodelo` (¡no pongas .gguf en el nombre del modelo!)
- Descarga e importa un preajuste de chat completion (cualquiera servirá) solo para TENER un preajuste de chat completion. Evita errores de "no soportado"

## � Ajustes recomendados de activación global de Información del Mundo/Libro de Conocimiento

- **Coincidir palabras completas:** dejar sin marcar (falso)
- **Profundidad de escaneo:** cuanto más alta, mejor (al menos 4)
- **Máximos pasos de recursión:** 2 (recomendación general, no obligatorio)
- **% de contexto:** 40% (basado en una ventana de contexto de 100,000 tokens) - asume que no tiene un historial de chat o bots muy pesados.

---

## �🚀 Empezando

### 1. **Instalar y Cargar**
- Cargue SillyTavern y seleccione un personaje o un chat grupal.
- Espere a que aparezcan los botones de chevron (► ◄) en los mensajes del chat (puede tardar hasta 10 segundos).

![Espere a estos botones](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Marcar una Escena**
- Haga clic en ► en el primer mensaje de su escena.
- Haga clic en ◄ en el último mensaje.

![Retroalimentación visual que muestra la selección de escena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Crear una Memoria**
- Abra el menú de Extensiones (la varita mágica 🪄) y haga clic en "Libros de Memoria", o use el comando de barra `/creatememory`.
- Confirme los ajustes (perfil, contexto, API/modelo) si se le solicita.
- Espere a la generación de la IA y a la entrada automática en el libro de conocimiento.

---

## 🆕 Atajos de Comandos de Barra

- `/creatememory` usará los marcadores de inicio/fin de chevron existentes para crear una memoria.
- `/scenememory x-y` creará una memoria comenzando con el mensaje x y terminando con el mensaje y.
- `/nextmemory` creará una memoria con todos los mensajes desde la última memoria.

## 👥 Soporte para Chats Grupales

- Todas las características funcionan con chats grupales.
- Los marcadores de escena, la creación de memorias y la integración con el libro de conocimiento se almacenan en los metadatos del grupo.
- No se requiere una configuración especial: simplemente seleccione un chat grupal y úselo como de costumbre.

---

## 🧭 Modos de Operación

### **Modo Automático (Predeterminado)**
- **Cómo funciona:** Usa automáticamente el libro de conocimiento que está vinculado a su chat actual.
- **Ideal para:** Simplicidad y velocidad. La mayoría de los usuarios deberían empezar aquí.
- **Para usar:** Asegúrese de que haya un libro de conocimiento seleccionado en el menú desplegable "Libros de Conocimiento del Chat" para su personaje o chat grupal.

![Ejemplo de vinculación de libro de conocimiento de chat](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Modo de Creación Automática de Libro de Conocimiento** ⭐ *Nuevo en v4.2.0*
- **Cómo funciona:** Crea y vincula automáticamente un nuevo libro de conocimiento cuando no existe ninguno, utilizando su plantilla de nomenclatura personalizada.
- **Ideal para:** Nuevos usuarios y configuración rápida. Perfecto para la creación de libros de conocimiento con un solo clic.
- **Para usar:**
  1. Habilite "Crear automáticamente un libro de conocimiento si no existe" en los ajustes de la extensión.
  2. Configure su plantilla de nomenclatura (predeterminado: "LTM - {{char}} - {{chat}}").
  3. Cuando cree una memoria sin un libro de conocimiento vinculado, se creará y vinculará uno automáticamente.
- **Marcadores de posición de la plantilla:** {{char}} (nombre del personaje), {{user}} (su nombre), {{chat}} (ID del chat)
- **Numeración inteligente:** Añade automáticamente números (2, 3, 4...) si existen nombres duplicados.
- **Nota:** No se puede usar simultáneamente con el Modo de Libro de Conocimiento Manual.

### **Modo de Libro de Conocimiento Manual**
- **Cómo funciona:** Le permite seleccionar un libro de conocimiento diferente para las memorias por chat, ignorando el libro de conocimiento principal vinculado al chat.
- **Ideal para:** Usuarios avanzados que desean dirigir las memorias a un libro de conocimiento específico y separado.
- **Para usar:**
  1. Habilite "Activar Modo Manual de Libro de Conocimiento" en los ajustes de la extensión.
  2. La primera vez que cree una memoria en un chat, se le pedirá que elija un libro de conocimiento.
  3. Esta elección se guarda para ese chat específico hasta que la borre o vuelva al Modo Automático.
- **Nota:** No se puede usar simultáneamente con el Modo de Creación Automática de Libro de Conocimiento.

---

## 📝 Generación de Memorias

### **Salida Solo en JSON**
Todos los prompts y preajustes **deben** indicar a la IA que devuelva solo JSON válido, por ejemplo:

```json
{
  "title": "Título corto de la escena",
  "content": "Resumen detallado de la escena...",
  "keywords": ["palabra clave1", "palabra clave2"]
}
```
**No se permite ningún otro texto en la respuesta.**

### **Preajustes Integrados**
1. **Resumen:** Resúmenes detallados paso a paso.
2. **Resumir:** Encabezados de Markdown para línea de tiempo, eventos, interacciones, resultado.
3. **Sinopsis:** Markdown completo y estructurado.
4. **Resumir:** Resumen conciso de eventos con línea de tiempo.
5. **Mínimo:** Resumen de 1-2 frases.

### **Prompts Personalizados**
- Cree los suyos propios, pero **deben** devolver JSON válido como se indicó anteriormente.

---

## 📚 Integración con el Libro de Conocimiento

- **Creación automática de entradas:** Las nuevas memorias se almacenan como entradas con todos los metadatos.
- **Detección basada en indicadores:** Solo las entradas con el indicador `stmemorybooks` se reconocen como memorias.
- **Numeración automática:** Numeración secuencial con ceros a la izquierda y múltiples formatos compatibles (`[000]`, `(000)`, `{000}`, `#000`).
- **Orden manual/automático:** Ajustes de orden de inserción por perfil.
- **Actualización del editor:** Opcionalmente, actualiza automáticamente el editor del libro de conocimiento después de añadir una memoria.

> **¡Las memorias existentes deben ser convertidas!**
> Use el [Convertidor de Libros de Conocimiento](/resources/lorebookconverter.html) para añadir el indicador `stmemorybooks` y los campos requeridos.

---

### 🎡 Prompts Laterales

Los Prompts Laterales se pueden usar como rastreadores y crearán entradas en su libro de memorias. 
- **Acceso:** Desde los ajustes de Libros de Memoria, haga clic en “🎡 Gestor de Prompts Laterales”.
- **Características:**
    - Ver todos los prompts laterales.
    - Crear nuevos prompts o duplicarlos para experimentar con diferentes estilos de prompt.
    - Editar o eliminar cualquier preajuste (incluidos los integrados).
    - Exportar e importar preajustes como archivos JSON para copia de seguridad o para compartir.
    - Ejecutarlos manualmente o automáticamente con la creación de memorias.
- **Consejos de uso:**
    - Al crear un nuevo prompt, puede copiar de los integrados para una mejor compatibilidad.
    - Biblioteca de Plantillas de Prompts Laterales adicional [archivo JSON](resources/SidePromptTemplateLibrary.json) - simplemente importe para usar

---

### 🧠 Integración de Regex para Personalización Avanzada
- **Control Total Sobre el Procesamiento de Texto**: Memory Books ahora se integra con la extensión **Regex** de SillyTavern, permitiéndole aplicar potentes transformaciones de texto en dos etapas clave:
    1.  **Generación de Prompts**: Modifique automáticamente los prompts enviados a la IA creando scripts de regex que apunten a la ubicación **User Input**.
    2.  **Análisis de Respuestas**: Limpie, reformatee o estandarice la respuesta cruda de la IA antes de que se guarde, apuntando a la ubicación **AI Output**.
- **Soporte Multi-selección**: Ahora puede seleccionar varios scripts de regex a la vez; todos los scripts habilitados se aplicarán en orden durante la generación de prompts y el análisis de respuestas, permitiendo transformaciones avanzadas y flexibles.
- **Cómo Funciona**: La integración es perfecta. Simplemente cree y habilite los scripts que desee en la extensión Regex, y Memory Books los aplicará automáticamente durante la creación de memorias y prompts laterales.

---

## 👤 Gestión de Perfiles

- **Perfiles:** Cada perfil incluye API, modelo, temperatura, prompt/preajuste, formato de título y ajustes del libro de conocimiento.
- **Importar/Exportar:** Comparta perfiles como JSON.
- **Creación de perfiles:** Use la ventana emergente de opciones avanzadas para guardar nuevos perfiles.
- **Anulaciones por perfil:** Cambie temporalmente la API/modelo/temperatura para la creación de memorias y luego restaure sus ajustes originales.

---

## ⚙️ Ajustes y Configuración

![Panel de ajustes principal](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Ajustes Globales**
- **Modo de Libro de Conocimiento Manual:** Habilite para seleccionar libros de conocimiento por chat.
- **Crear automáticamente un libro de conocimiento si no existe:** ⭐ *Nuevo en v4.2.0* - Crea y vincula automáticamente libros de conocimiento utilizando su plantilla de nomenclatura.
- **Plantilla de Nombre de Libro de Conocimiento:** ⭐ *Nuevo en v4.2.0* - Personalice los nombres de los libros de conocimiento creados automáticamente con los marcadores de posición {{char}}, {{user}}, {{chat}}.
- **Permitir Superposición de Escenas:** Permita o evite rangos de memoria superpuestos.
- **Usar Siempre el Perfil Predeterminado:** Omita las ventanas emergentes de confirmación.
- **Mostrar vistas previas de la memoria:** Habilite la ventana emergente de vista previa para revisar y editar las memorias antes de añadirlas al libro de conocimiento.
- **Mostrar Notificaciones:** Active/desactive los mensajes emergentes.
- **Actualizar Editor:** Actualice automáticamente el editor del libro de conocimiento después de la creación de la memoria.
- **Umbral de Advertencia de Tokens:** Establezca el nivel de advertencia para escenas grandes (predeterminado: 30,000).
- **Memorias Anteriores Predeterminadas:** Número de memorias anteriores a incluir como contexto (0-7).
- **Crear resúmenes de memoria automáticamente:** Habilite la creación automática de memorias a intervalos.
- **Intervalo de Auto-Resumen:** Número de mensajes después de los cuales se creará automáticamente un resumen de memoria (10-200, predeterminado: 100).
- **Formato de Título de Memoria:** Elija o personalice (ver más abajo).

![Configuración del perfil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Campos del Perfil**
- **Nombre:** Nombre a mostrar.
- **API/Proveedor:** openai, claude, custom, etc.
- **Modelo:** Nombre del modelo (p. ej., gpt-4, claude-3-opus).
- **Temperatura:** 0.0–2.0.
- **Prompt o Preajuste:** Personalizado o integrado.
- **Formato de Título:** Plantilla por perfil.
- **Modo de Activación:** Vectorizado, Constante, Normal.
- **Posición:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN.
- **Modo de Orden:** Automático/manual.
- **Recursión:** Prevenir/retrasar la recursión.

---

## 🏷️ Formato de Título

Personalice los títulos de las entradas de su libro de conocimiento utilizando un potente sistema de plantillas.

- **Marcadores de posición:**
  - `{{title}}` - El título generado por la IA (p. ej., "Un Encuentro Fatídico").
  - `{{scene}}` - El rango de mensajes (p. ej., "Escena 15-23").
  - `{{char}}` - El nombre del personaje.
  - `{{user}}` - Su nombre de usuario.
  - `{{messages}}` - El número de mensajes en la escena.
  - `{{profile}}` - El nombre del perfil utilizado para la generación.
  - Marcadores de posición de fecha/hora actual en varios formatos (p. ej., `13 de agosto de 2025` para la fecha, `11:08 PM` para la hora).
- **Numeración automática:** Use `[0]`, `[00]`, `(0)`, `{0}`, `#0`, y ahora también las formas envueltas como `#[000]`, `([000])`, `{[000]}` para una numeración secuencial con ceros a la izquierda.
- **Formatos personalizados:** Puede crear sus propios formatos. A partir de la v4.5.1, se permiten todos los caracteres Unicode imprimibles (incluidos emojis, CJK, acentuados, símbolos, etc.) en los títulos; solo se bloquean los caracteres de control Unicode.

---

## 🧵 Memorias de Contexto

- **Incluya hasta 7 memorias anteriores** como contexto para una mejor continuidad.
- **La estimación de tokens** incluye las memorias de contexto para mayor precisión.

![Generación de memoria con contexto](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Retroalimentación Visual y Accesibilidad

- **Estados de los botones:**
  - Inactivo, activo, selección válida, en escena, procesando.

![Selección de escena completa que muestra todos los estados visuales](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **Accesibilidad:**
  - Navegación por teclado, indicadores de foco, atributos ARIA, movimiento reducido, compatible con dispositivos móviles.

---

## 🛠️ Solución de Problemas

- **No hay libro de conocimiento disponible o seleccionado:**
  - En el Modo Manual, seleccione un libro de conocimiento cuando se le solicite.
  - En el Modo Automático, vincule un libro de conocimiento a su chat.
  - O habilite "Crear automáticamente un libro de conocimiento si no existe" para la creación automática.

- **No se ha seleccionado ninguna escena:**
  - Marque tanto el punto de inicio (►) como el de fin (◄).

- **La escena se superpone con una memoria existente:**
  - Elija un rango diferente o habilite "Permitir superposición de escenas" en los ajustes.

![Advertencia de superposición de escena](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **La IA no pudo generar una memoria válida:**
  - Use un modelo que admita la salida en formato JSON.
  - Revise su prompt y los ajustes del modelo.

- **Se superó el umbral de advertencia de tokens:**
  - Use una escena más pequeña o aumente el umbral.

- **Faltan los botones de chevron:**
  - Espere a que se cargue la extensión o actualice la página.

- **Datos del personaje no disponibles:**
  - Espere a que el chat/grupo se cargue por completo.

---

## 📝 Política de Caracteres (v4.5.1+)

- **Permitidos en los títulos:** Se permiten todos los caracteres Unicode imprimibles, incluidas las letras acentuadas, emojis, CJK y símbolos.
- **Bloqueados:** Solo se bloquean los caracteres de control Unicode (U+0000–U+001F, U+007F–U+009F); estos se eliminan automáticamente.

Consulte los [Detalles de la Política de Caracteres](charset.md) para ver ejemplos y notas de migración.
---

*Desarrollado con amor usando VS Code/Cline, pruebas exhaustivas y los comentarios de la comunidad.* 🤖💕
