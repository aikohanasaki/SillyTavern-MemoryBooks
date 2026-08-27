<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: Manual de referencia completo para IA

**Producto:** SillyTavern Memory Books (STMB)  
**Versión de referencia:** v8.5.0, 1 de agosto de 2026  
**Propósito:** Una única fuente de verdad, densa y completa, para un asistente de IA que enseña, explica y soluciona problemas de Memory Books.

---

## Tabla de contenidos

- [1. Cómo debe usar este manual un asistente de IA](#1-cómo-debe-usar-este-manual-un-asistente-de-ia)
- [2. Definición del producto y modelo mental](#2-definición-del-producto-y-modelo-mental)
- [3. Vocabulario básico y selección de funciones](#3-vocabulario-básico-y-selección-de-funciones)
- [4. Requisitos, instalación y verificación inicial](#4-requisitos-instalación-y-verificación-inicial)
- [5. Abrir Memory Books y entender el panel principal](#5-abrir-memory-books-y-entender-el-panel-principal)
- [6. Modos de almacenamiento de Memory Books](#6-modos-de-almacenamiento-de-memory-books)
- [7. Perfiles, conexiones y enrutamiento de generación](#7-perfiles-conexiones-y-enrutamiento-de-generación)
- [8. Escenas, Memorias manuales, Memorias automáticas y puesta al día](#8-escenas-memorias-manuales-memorias-automáticas-y-puesta-al-día)
- [9. Ahorro de tokens, mensajes ocultos y límite de memoria](#9-ahorro-de-tokens-mensajes-ocultos-y-límite-de-memoria)
- [10. Activación y recuperación de lorebooks](#10-activación-y-recuperación-de-lorebooks)
- [11. Modo de chat grupal real](#11-modo-de-chat-grupal-real)
- [12. Modo Narrador](#12-modo-narrador)
- [13. Ramificación de chats](#13-ramificación-de-chats)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidación](#17-consolidación)
- [18. Compactación](#18-compactación)
- [19. Regeneración](#19-regeneración)
- [20. Contexto para la generación](#20-contexto-para-la-generación)
- [21. Arquitectura de prompts, prompts de resumen integrados y reglas de autoría](#21-arquitectura-de-prompts-prompts-de-resumen-integrados-y-reglas-de-autoría)
- [22. Summary Prompt Manager y Consolidation Prompt Manager](#22-summary-prompt-manager-y-consolidation-prompt-manager)
- [23. STMB y otras extensiones](#23-stmb-y-otras-extensiones)
- [24. Títulos de entradas de lorebook y política de caracteres](#24-títulos-de-entradas-de-lorebook-y-política-de-caracteres)
- [25. Cola de trabajos y controles de reintento](#25-cola-de-trabajos-y-controles-de-reintento)
- [26. Retroalimentación visual y accesibilidad](#26-retroalimentación-visual-y-accesibilidad)
- [27. Mapa de ajustes y referencia de ajustes actuales](#27-mapa-de-ajustes-y-referencia-de-ajustes-actuales)
- [28. Referencia de comandos slash](#28-referencia-de-comandos-slash)
- [29. Solución de problemas por etapa](#29-solución-de-problemas-por-etapa)
- [30. Preguntas frecuentes](#30-preguntas-frecuentes)
- [31. Compatibilidad, migración y notas históricas vigentes](#31-compatibilidad-migración-y-notas-históricas-vigentes)
- [32. Notas para desarrolladores y licencia](#32-notas-para-desarrolladores-y-licencia)
- [33. Árbol de diagnóstico compacto](#33-árbol-de-diagnóstico-compacto)
- [34. Secuencia mínima de enseñanza recomendada](#34-secuencia-mínima-de-enseñanza-recomendada)
- [35. Resumen conceptual final](#35-resumen-conceptual-final)

---

## 1. Cómo debe usar este manual un asistente de IA

Trate este documento como la referencia operativa actual de Memory Books. Sustituye la necesidad de cargar por separado la guía Start Here, el README, la Guía del usuario, la guía de Side Prompts, la guía How STMB Works y el changelog histórico como archivos de conocimiento independientes.

Términos:

- STMB = SillyTavern Memory Books (esta extensión)
- ST = SillyTavern (el código base que STMB amplía)

Al responder a los usuarios:

1. Conserve exactamente la terminología de Memory Books. Un **Memory Book** es un lorebook de SillyTavern utilizado por STMB; no es un formato de base de datos independiente.
2. Distinga el comportamiento actual del histórico. No enseñe un flujo de trabajo eliminado o reemplazado solo porque aparecía en un changelog antiguo.
3. Distinga **Group Chat Mode** de **Narrator Mode**. Resuelven problemas diferentes.
4. Distinga la **generación** de memoria, el **almacenamiento/configuración** del lorebook y la posterior **recuperación por SillyTavern**. La activación/recuperación forma parte del código base de ST.
5. No invente controles, etiquetas de menú, comportamientos de proveedores ni ajustes que no estén descritos aquí.
6. Si se proporciona una captura de pantalla, identifique únicamente los controles visibles. Indique la siguiente acción inmediata en vez de asumir que existe un control fuera de pantalla.
7. Al solucionar problemas, identifique primero la primera etapa que falla y compruébela antes de recomendar reescribir prompts.
8. Prefiera una configuración simple que funcione antes de introducir enrutamiento avanzado, varios libros, prompts personalizados, Regex o automatización de Side Prompts.
9. Explique que los filtros de personaje y los Memory Books separados mejoran el enrutamiento y la relevancia; no constituyen una barrera de seguridad.
10. Exprese incertidumbre si la versión instalada del usuario, la versión de SillyTavern, el proveedor o el prompt personalizado pueden diferir.

### Notas del documento actual

Narrator Mode está implementado en v8.5.0.

Varios documentos para principiantes indicaban que, técnicamente, era necesario crear una memoria manual antes de que pudieran comenzar las memorias automáticas. El STMB actual puede crear la primera memoria automática desde el mensaje 0 cuando no existe una línea base de mensajes procesados. Aun así, se recomienda una primera memoria manual porque verifica la conexión, el Memory Book, el formato de salida y el límite inicial deseado antes de confiar en la automatización.

---

## 2. Definición del producto y modelo mental

Memory Books es una extensión de SillyTavern que convierte rangos de chat seleccionados o elegidos automáticamente en entradas de memoria estructuradas almacenadas en lorebooks de SillyTavern.

El proceso básico es:

```text
Mensajes del chat
    ↓
STMB selecciona o recibe un rango de mensajes
    ↓
STMB construye una solicitud para la IA
    ↓
El modelo devuelve una memoria estructurada
    ↓
STMB guarda una entrada de lorebook
    ↓
Los mensajes antiguos ya procesados pueden ocultarse del contexto activo
    ↓
SillyTavern activa más tarde las entradas de lorebook pertinentes
    ↓
El modelo de chat recibe esas entradas como contexto
```

STMB no proporciona memoria interna permanente a un modelo. Mantiene un sistema de referencia externo (entradas de lorebook). El modelo de chat «recuerda» cuando SillyTavern incluye las entradas pertinentes del lorebook en el prompt enviado a la IA.

### Las tres etapas separadas

1. **Calidad de generación** — ¿El modelo que genera la memoria produjo un resultado preciso y útil?
2. **Almacenamiento y configuración** — ¿Se guardó el resultado en el Memory Book previsto con ajustes de activación apropiados?
3. **Recuperación y uso por el modelo** — ¿SillyTavern activó y envió la entrada, y el modelo de chat la utilizó correctamente?

Solucione estas etapas por separado.

### Lorebooks y Memory Books

Un **lorebook**, también llamado **World Info** en algunas partes de SillyTavern, es una colección de entradas que SillyTavern puede añadir de forma condicional a una solicitud al modelo. Una entrada de lorebook normalmente tiene:

- un título/comentario;
- contenido;
- palabras clave de activación u otro modo de activación;
- posición y orden de inserción;
- controles de recursión y presupuesto;
- filtros de personaje opcionales y otros metadatos.

Un **Memory Book** es un lorebook normal de SillyTavern utilizado por STMB. Puede abrirse, editarse, reordenarse, exportarse, importarse o eliminarse con las herramientas normales de lorebook. Según las funciones utilizadas, puede contener:

- Memorias de escena;
- resúmenes Arc, Chapter, Book, Legend, Series o Epic;
- entradas Clip y Topical Clip;
- entradas de seguimiento de Side Prompt;
- otras entradas administradas por STMB.

### Las entradas de memoria son contexto comprimido

Una Memoria de escena no es la transcripción original. Es una representación comprimida destinada a conservar información importante para la continuidad, como:

- acontecimientos y consecuencias;
- decisiones y planes;
- descubrimientos y revelaciones;
- cambios emocionales o de relación;
- conocimiento, creencias o malentendidos individuales;
- objetos, lugares, identidades, promesas y restricciones importantes.

Ocultar mensajes procesados no los elimina. Evita que esos mensajes se envíen a la IA y, por tanto, que sigan consumiendo contexto activo del historial del chat.

---

## 3. Vocabulario básico y selección de funciones

| Necesidad | Función | Significado |
|---|---|---|
| Resumir un rango de chat seleccionado o automático | **Memory** | «Recuerda lo que ocurrió en esta escena». |
| Guardar texto seleccionado del chat o un hecho | **Clip** | «Guarda esta nota». |
| Reunir hechos sobre un tema a partir de Memorias guardadas | **Topical Clip** | «Reúne todo lo que dicen mis Memorias sobre esto». |
| Mantener información cambiante mediante ejecuciones repetidas | **Side Prompt** | «Mantén actualizado este registro». |
| Combinar varias Memorias o resúmenes de nivel inferior | **Consolidation** | «Integra estas entradas en un resumen de nivel superior». |
| Acortar una sola entrada existente administrada por STMB | **Compaction** | «Recorta esta entrada sin perder sus hechos». |
| Sustituir una entrada existente utilizando sus fuentes originales | **Regeneration** | «Reconstruye esta entrada y revisa el reemplazo». |

### Diferencias entre funciones que suelen confundirse

- **Clip vs. Topical Clip:** un Clip parte de texto resaltado en el chat actual. Un Topical Clip parte de Memorias STMB existentes y confirmadas.
- **Topical Clip vs. Side Prompt:** un Topical Clip se ejecuta manualmente para reunir información de un tema. Un Side Prompt puede mantener repetidamente un registro que cambia.
- **Compaction vs. Consolidation:** Compaction reescribe una entrada. Consolidation crea un nuevo resumen de nivel superior a partir de varias entradas.
- **Memory vs. Side Prompt:** las Memorias suelen ser registros secuenciales de escenas. Los Side Prompts normalmente actualizan o sobrescriben un único documento de apoyo continuo.
- **Generación vs. recuperación:** crear una entrada no garantiza que SillyTavern la active más tarde.

---

## 4. Requisitos, instalación y verificación inicial

### Requisitos

- SillyTavern 1.18.0 o posterior; se recomienda la versión compatible más reciente.
- Una conexión de IA funcional.
- Un modelo capaz de seguir instrucciones y, para los flujos de Memory y Consolidation, devolver JSON válido.
- Permiso para instalar extensiones de terceros de SillyTavern.
- Un preset de Chat Completion disponible en SillyTavern cuando se utilice un backend local o Text Completion mediante un endpoint OpenAI-compatible de Chat Completion.

### Usuarios normales de Chat Completion

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google y otras conexiones de Chat Completion normalmente pueden usar el perfil integrado **Current SillyTavern Settings**.

### Usuarios locales y de Text Completion

KoboldCpp, llama.cpp, TextGen, Ollama y backends similares suelen funcionar de forma más fiable si se exponen mediante un endpoint OpenAI-compatible de Chat Completion. Aunque el roleplay normal utilice Text Completion, SillyTavern debe disponer de un preset de Chat Completion para STMB.

Configuración típica de KoboldCpp:

- tipo de API: Chat Completion;
- fuente: Custom OpenAI-compatible;
- endpoint como `http://localhost:5001/v1` o `http://127.0.0.1:5000/v1`;
- cualquier clave API personalizada no vacía si SillyTavern la exige;
- ID del modelo en el formato esperado por el endpoint, normalmente `koboldcpp/modelname`, sin un sufijo `.gguf` innecesario;
- preset de Chat Completion importado;
- longitud de respuesta de al menos 2048 tokens; 4096 suele ser más seguro.

Configuración típica de llama.cpp:

- tipo de API: Chat Completion;
- fuente: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`, o `http://host.docker.internal:8080/v1` si SillyTavern se ejecuta en Docker;
- cualquier clave API no vacía si SillyTavern la exige;
- ID del modelo servido;
- sin posprocesamiento del prompt salvo que el endpoint lo requiera.

Ejemplo de comando del servidor:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Chat Top Bar opcional

STMB funciona sin Chat Top Bar / Chat Top Info Bar. Instalarlo añade la interfaz de cola **Memory Books Jobs** para trabajos activos, completados, fallidos, cancelados, bloqueados y pendientes de revisión.

### Instalación

1. Abra SillyTavern.
2. Abra el panel principal **Extensions**.
3. Elija **Install Extension**.
4. Instale el repositorio oficial de Memory Books.
5. Recargue SillyTavern si se le solicita.
6. Abra un chat de personaje o un chat grupal.
7. Espere varios segundos a que se inicialicen los controles de STMB.

SillyTavern Extras no es necesario.

### Confirmar que STMB se cargó

Debe aparecer al menos uno de estos elementos:

- **Memory Books** en el menú Extensions de la varita mágica junto al campo de entrada del chat;
- los chevrones de escena **►** y **◄** en las acciones ampliadas del mensaje.

Si no aparece ninguno:

1. espere hasta diez segundos;
2. actualice la página;
3. compruebe que la extensión está instalada y habilitada;
4. vuelva a abrir un chat de personaje o grupo;
5. inspeccione la consola del navegador solo después de que fallen las comprobaciones básicas.

---

## 5. Abrir Memory Books y entender el panel principal

Abra el menú Extensions de la varita mágica junto al campo de entrada del chat y elija **Memory Books**.

El panel puede incluir:

- Current Scene;
- Memory Status / mensaje procesado más alto;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- controles de personajes de grupo o Narrator cuando correspondan.

Para crear una primera Memoria solo son necesarias tres decisiones:

1. ¿Qué Memory Book recibirá la entrada?
2. ¿Qué perfil/conexión la generará?
3. ¿Qué mensajes del chat forman la escena?

---

## 6. Modos de almacenamiento de Memory Books

### 6.1 Automatic Mode: Memory Book vinculado al chat

Automatic Mode es el modo normal predeterminado. STMB utiliza el lorebook vinculado al chat actual mediante SillyTavern.

Úselo cuando:

- un chat tenga un Memory Book principal;
- se prefiera una configuración mínima;
- los personajes de grupo no necesiten Memory Books separados.

Si no hay ningún lorebook vinculado, vincule uno en SillyTavern o utilice Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Active **Auto-create lorebook if none exists** para permitir que STMB cree y vincule un lorebook cuando se guarde una Memoria por primera vez.

La plantilla de nombre predeterminada puede usar:

- `{{char}}` — nombre del personaje o grupo;
- `{{user}}` — nombre del usuario;
- `{{chat}}` — ID/nombre del chat.

STMB añade sufijos numéricos cuando es necesario para evitar nombres duplicados.

Auto-Create y Manual Lorebook Mode son mutuamente excluyentes.

### 6.3 Manual Lorebook Mode

Active **Manual Lorebook Mode** para elegir un Memory Book independientemente del lorebook vinculado al chat.

Úselo cuando:

- las memorias deban residir en un lorebook dedicado;
- varios chats compartan intencionadamente un único Memory Book;
- los miembros de un grupo necesiten libros separados;
- se utilice Narrator Mode;
- el usuario comprenda el plan de activación resultante.

La selección del Memory Book manual principal se guarda para el chat actual, salvo que un bloqueo persistente de personaje la sustituya en un chat individual compatible.

### 6.4 Los Memory Books separados suelen ser más claros

Un Memory Book dedicado facilita:

- separar memorias de definiciones de personaje y lore de ambientación;
- establecer un presupuesto y orden de lorebook independientes;
- reutilizar o exportar el historial de memoria;
- inspeccionar entradas administradas por STMB sin lore no relacionado;
- diagnosticar la activación.

Es una recomendación, no un requisito.

### 6.5 Bloqueos de Memory Book de personaje

Un bloqueo de Memory Book de personaje es una asignación persistente de Manual Mode asociada a una tarjeta de personaje.

En un chat individual:

- un libro manual desbloqueado pertenece al chat actual;
- un libro bloqueado sigue a la tarjeta de personaje a través de chats compatibles de Manual Mode;
- el libro manual no puede cambiarse hasta eliminar el bloqueo.

En un chat grupal real:

- una asignación por personaje desbloqueada pertenece al chat grupal actual;
- una asignación por personaje bloqueada sigue esa tarjeta de personaje a grupos compatibles de Manual Mode;
- si falta un libro bloqueado aparece un estado de bloqueo roto que debe desbloquearse o repararse.

Utilice bloqueos únicamente cuando el mismo personaje deba compartir intencionadamente un único Memory Book continuo entre historias. Son peligrosos para universos alternativos o líneas temporales no relacionadas.

### 6.6 Disposición inicial recomendada

- Chat individual: un Memory Book vinculado al chat o creado automáticamente.
- Chat grupal real: un Memory Book de grupo.
- Chat Narrator: un Memory Book omnisciente más un libro único por cada personaje declarado, según lo exigido por Narrator Mode.

---

## 7. Perfiles, conexiones y enrutamiento de generación

Un perfil de Memory Books controla tanto la generación como los ajustes de la entrada de lorebook resultante.

### 7.1 Primer perfil recomendado

Use primero **Current SillyTavern Settings**. Utiliza el proveedor, modelo y temperatura activos actualmente en SillyTavern.

No empiece reescribiendo prompts ni configurando un endpoint Full Manual. Primero demuestre que puede generarse y guardarse una Memoria.

### 7.2 Por qué crear un perfil STMB guardado

Cree un perfil separado cuando necesite:

- usar un modelo más barato o fiable para las memorias;
- usar un proveedor diferente del roleplay;
- vincular una conexión Custom con nombre;
- elegir un Summary Prompt personalizado;
- usar una temperatura o longitud máxima de salida diferentes;
- cambiar el formato de títulos;
- cambiar activación, inserción, orden o recursión;
- usar prompts separados para grupo/omnisciente y personaje.

### 7.3 Campos de perfil

Un perfil puede incluir:

- nombre visible;
- API/proveedor;
- ID del modelo;
- temperatura;
- preset de Summary Prompt;
- prompts multi-personaje separados opcionales;
- comportamiento de salida estructurada;
- enrutamiento opcional mediante SillyTavern ChatCompletionService;
- preset opcional de Chat Completion;
- comportamiento de reverse proxy;
- formato de título;
- modo de activación: Normal, Constant o Vectorized;
- posición de inserción, incluidas posiciones de character, example-message, author’s-note y Outlet;
- nombre de Outlet cuando corresponda;
- valor de orden automático o manual;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Conexiones Custom OpenAI-compatible con nombre

Un perfil Custom OpenAI-compatible puede:

- usar la conexión Custom actualmente activa de SillyTavern; o
- vincular una conexión Custom con nombre desde Connection Manager de SillyTavern.

La conexión con nombre aporta su URL y secreto guardados. El campo model del perfil STMB sigue siendo la sustitución de modelo. Si la conexión con nombre se elimina o deja de ser una conexión Custom Chat Completion, STMB bloquea la solicitud en vez de redirigirla silenciosamente.

### 7.5 Fallback de salida estructurada

**Skip structured output and use plain-text completion** impide que STMB envíe un esquema de salida estructurada a proveedores que lo rechazan. El modelo aún debe devolver el JSON válido exigido por el prompt de Memory o Consolidation seleccionado.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** enruta solicitudes de perfiles compatibles mediante el helper de solicitudes de SillyTavern y puede aplicar un preset de Chat Completion seleccionado. Las solicitudes de OpenRouter también heredan el orden de proveedores de SillyTavern, filtros de cuantización, controles de fallback y la opción de routing middle-out. Estos controles de OpenRouter siguen aplicándose si ChatCompletionService falla y STMB vuelve a intentarlo por su ruta de fallback. Si ese reintento también falla, STMB conserva e informa tanto del error inicial de ChatCompletionService como de la respuesta de fallback del proveedor. Los perfiles Full Manual no utilizan esta ruta.

### 7.7 Reverse proxy y Full Manual Configuration

**Use reverse proxy** reenvía los datos de reverse proxy configurados en SillyTavern para proveedores compatibles.

**Full Manual Configuration** almacena un endpoint y una clave independientes dentro del perfil STMB. Es una ruta excepcional. Siempre que sea posible, prefiera un proveedor o conexión Custom configurados y probados en SillyTavern.

### 7.8 Longitud de salida

El ajuste global de tokens máximos de respuesta de STMB puede sustituir la longitud normal de salida de Chat Completion para trabajos de Memory Books. El JSON truncado es una causa común de fallos de generación. Aumente la longitud de salida antes de debilitar el esquema o el prompt.

---

## 8. Escenas, Memorias manuales, Memorias automáticas y puesta al día

### 8.1 Qué es una escena

Una **escena** es el rango inclusivo de mensajes del chat que STMB procesa para crear una Memoria.

Los límites útiles suelen contener una unidad coherente:

- un acontecimiento;
- una conversación;
- una etapa de investigación;
- un desarrollo emocional o de relación;
- un cambio de lugar u objetivo;
- una secuencia conectada de acciones.

Los rangos muy pequeños y triviales pueden aportar poco valor. Los rangos muy grandes cuestan más, son más difíciles de resumir, pueden superar el contexto y a menudo mezclan acontecimientos no relacionados.

### 8.2 Marcar una escena manualmente

1. Amplíe las acciones del mensaje, normalmente mediante un control de tres puntos o similar.
2. Haga clic en **►** en el primer mensaje incluido.
3. Haga clic en **◄** en el último mensaje incluido.
4. Abra Memory Books y verifique el inicio, final, hablantes, número de mensajes y estimación de tokens.

Se incluyen ambos mensajes límite.

Use **Clear Scene** para eliminar la selección o elija otro marcador de inicio/final para sustituir uno de los límites.

### 8.3 Crear una Memoria manual

1. Verifique la escena.
2. Verifique el Memory Book efectivo.
3. Verifique el perfil seleccionado.
4. Haga clic en **Create Memory** o use `/creatememory`.
5. Revise las ventanas de confirmación, aviso de tokens, confirmación de participantes o vista previa cuando aparezcan.
6. Apruebe el resultado.
7. Confirme que existe una nueva entrada de lorebook y que Memory Status avanzó hasta el final de la escena.

Un resultado de Memoria válido normalmente contiene:

- un título;
- contenido;
- palabras clave;
- metadatos STMB, incluidos rango de origen e identidad del chat.

### 8.4 Vistas previas de Memoria

Cuando **Show memory previews** está habilitado, revise y, si es necesario, edite:

- título;
- contenido de la memoria;
- palabras clave.

Compruebe nombres, atribución, hechos, consecuencias omitidas y comentarios no relacionados. Sin vistas previas, un resultado válido se guarda automáticamente.

### 8.5 Memorias automáticas

Active **Auto-create memory summaries** y configure:

- **Auto-Summary Interval** — número de mensajes nuevos procesados por cada Memoria automática;
- **Auto-Summary Buffer** — mensajes más recientes que se dejan fuera para no resumir demasiado pronto una escena todavía en curso.

Ejemplo:

```text
Interval: 30
Buffer: 2
```

STMB espera a que existan al menos 32 mensajes posteriores al límite procesado y luego crea una Memoria que termina dos mensajes antes del mensaje más reciente.

Si no existe una línea base procesada, STMB actual considera esa línea base como `-1` y puede empezar en el mensaje 0. Sigue recomendándose una primera Memoria manual para validar la configuración y elegir un punto de inicio deliberado.

Los intervalos más bajos crean Memorias más enfocadas y más solicitudes. Los intervalos más altos crean menos Memorias, pero más grandes y con mayor riesgo de mezclar material no relacionado. Un punto de partida práctico es aproximadamente 20–40 mensajes para roleplay detallado y 40–60 para intercambios más breves y rápidos.

La generación automática puede posponerse cuando todavía no está asignado un Memory Book obligatorio.

### 8.6 Línea base de mensajes procesados

STMB guarda el ID del mensaje procesado más alto para cada chat. Determina:

- dónde comienza `/nextmemory`;
- dónde comienzan las Memorias automáticas;
- el indicador de límite de memoria;
- qué mensajes cuentan como ya procesados.

Use:

- `/stmb-highest` para mostrarlo;
- `/stmb-set-highest <N>` para establecerlo manualmente;
- `/stmb-set-highest none` para borrarlo.

Los cambios manuales deben hacerse deliberadamente porque pueden provocar rangos omitidos o repetidos.

### 8.7 Catch-up para un chat largo existente

Use:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Ejemplo:

```text
/stmb-catchup interval=40 start=0 end=245
```

El rango es inclusivo. Los fragmentos se procesan consecutivamente; el último puede ser más pequeño.

Catch-up es deliberadamente no interactivo. Antes de ejecutarlo:

- seleccione y pruebe el perfil previsto;
- habilite **Always use default profile**;
- deshabilite **Show memory previews**;
- asegúrese de que existe el Memory Book efectivo, o permita Auto-Create en Automatic Mode;
- repare todas las asignaciones de libros requeridas para multi-personaje;
- elija un tamaño de fragmento inferior al umbral de aviso de tokens.

STMB hace una comprobación previa de cada fragmento, los procesa en orden y se detiene en el primer fallo o al usar `/stmb-stop`. Los fragmentos completados anteriormente permanecen guardados. Reanude desde el primer mensaje no terminado, en lugar de repetir todo el rango.

Use catch-up para una conversión amplia. Los límites de escena manuales siguen siendo mejores cuando importan los límites literarios o de acontecimientos.

---

## 9. Ahorro de tokens, mensajes ocultos y límite de memoria

### 9.1 Ocultar no es eliminar

Los mensajes ocultos permanecen en el archivo de chat. Se omiten del contexto activo hasta que vuelven a mostrarse.

### 9.2 Modos de auto-hide

**Auto-hide messages after adding memory** puede ser:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** conserva un pequeño solapamiento reciente cerca del límite.

> **Si usa la extensión Presence:** Presence puede volver a mostrar posteriormente mensajes ocultados por STMB, ya que ambas extensiones modifican el estado compartido de visibilidad de mensajes de SillyTavern. Consulte [STMB y otras extensiones](#23-stmb-y-otras-extensiones) para obtener instrucciones de configuración.

### 9.3 Mostrar antes de la generación

**Unhide hidden messages for memory generation** vuelve a mostrar un rango seleccionado antes de que STMB lo compile. Úselo al regenerar o volver a procesar rangos que ya estaban ocultos. El modo auto-hide seleccionado determina qué se vuelve a ocultar después de guardar correctamente.

### 9.4 Indicador de límite de memoria

El indicador usa el mensaje procesado más alto para mostrar dónde termina el historial procesado y comienza el chat no procesado.

Modos:

- Off;
- Memory boundary divider;
- botón de salto arrastrable;
- divisor más botón de salto.

El botón de salto se desplaza hacia el primer mensaje no procesado y recuerda su posición después de arrastrarlo.

### 9.5 Buena configuración para aprender

Una configuración inicial práctica es:

- mostrar el divisor de límite y el botón de salto;
- dejar dos mensajes sin ocultar;
- habilitar el unhide temporal para generación;
- no usar auto-hide hasta que el usuario haya confirmado que una Memoria se guardó correctamente;
- después cambiar a ocultar todos los mensajes procesados para obtener el principal beneficio de ahorro de tokens.

---

## 10. Activación y recuperación de lorebooks

### 10.1 Palabras clave

Las Memorias normales suelen activarse por palabras clave. Las buenas palabras clave son concretas y distintivas:

- nombres y alias de personajes;
- lugares u organizaciones con nombre;
- objetos importantes;
- nombres de acontecimientos;
- identificadores;
- descubrimientos o acciones específicos.

Palabras clave débiles como `important event`, `conversation` o `secret` son demasiado amplias.

El contenido de la memoria determina lo que aprende el modelo. Las palabras clave ayudan a determinar cuándo SillyTavern la recupera.

### 10.2 Modos de activación

- **Normal:** activación mediante palabras clave/reglas.
- **Constant:** siempre activa, sujeta al presupuesto y controles de entrada aplicables.
- **Vectorized:** utiliza recuperación vectorial cuando la configuración del usuario lo permite.

Los vectores son opcionales. STMB funciona mediante palabras clave sin la extensión Vectors.

### 10.3 Ajustes globales recomendados de World Info

Puntos de partida habituales:

- Match Whole Words: desactivado;
- Scan Depth: relativamente alto, por ejemplo 8;
- Max Recursion Steps: aproximadamente 2;
- Context percentage: dimensionado según el contexto total y el material competidor del prompt.

Son recomendaciones, no requisitos estrictos.

### 10.4 Delay Until Recursion

Si el Memory Book es la única fuente activa de lorebook/World Info, deje **Delay Until Recursion** deshabilitado. De lo contrario, puede no haber ninguna entrada que inicie el primer ciclo de recursión y la Memoria puede no activarse nunca.

### 10.5 Diagnóstico de recuperación

Cuando una IA «no recuerda»:

1. Verifique que la entrada existe.
2. Verifique que el Memory Book correcto está activo para el chat.
3. Verifique que la entrada está habilitada.
4. Verifique que las palabras clave o el modo de activación coinciden con la conversación actual.
5. Verifique que el presupuesto de lorebook es suficiente.
6. Verifique los ajustes de recursión.
7. Use una herramienta de inspección de World Info o el registro de solicitudes para confirmar si la entrada realmente se envió.
8. Si se envió pero fue ignorada, el problema restante es el comportamiento del modelo o el contexto competidor, no el almacenamiento de STMB.

---

## 11. Modo de chat grupal real

### 11.1 Definición

Group Chat Mode se aplica a un grupo real de SillyTavern que contiene dos o más tarjetas de personaje separadas.

```text
Grupo de SillyTavern
├── tarjeta de Alice
├── tarjeta de Bob
└── tarjeta de Clara
```

SillyTavern registra qué tarjeta escribió cada mensaje, de modo que STMB puede conservar la atribución de hablante y detectar a los miembros participantes del grupo.

No se requiere un interruptor independiente de Group Chat Mode. Abra un chat grupal y use STMB normalmente.

### 11.2 Detección de participantes

Un participante detectado suele ser una tarjeta de personaje que escribió al menos un mensaje dentro de la escena seleccionada.

STMB no infiere a partir de la prosa a todas las personas físicamente presentes. Por ello:

- un observador silencioso puede no ser detectado;
- un personaje meramente mencionado no es participante;
- un personaje ausente del que habla el grupo no es seleccionado;
- el usuario no se trata como objetivo independiente de Memory Book de personaje;
- identidades de hablante duplicadas o inusuales pueden requerir corrección.

Si la detección automática no encuentra ningún personaje del grupo, STMB abre la confirmación de participantes aunque esté habilitada la aceptación automática. El aviso explica que la detección falló y exige revisar qué personajes estaban presentes antes de continuar.

El prompt de participantes significa: **¿Con qué personajes del grupo debe asociarse esta Memoria?** No demuestra quién conocía cada hecho ni quién estaba físicamente presente.

### 11.3 Un Memory Book de grupo

Es la disposición inicial recomendada.

Use Automatic Mode, Auto-Create o un libro principal de Manual Mode. Cada escena produce una entrada canónica en el Memory Book del grupo. Cuando hay nombres de participantes disponibles, la entrada puede recibir un filtro inclusivo de personajes de SillyTavern.

Un filtro inclusivo para Alice y Bob significa que la entrada puede activarse cuando Alice **o** Bob está activo. No crea un personaje sintético «Alice y Bob» ni un libro independiente para el subconjunto.

Un solo libro de grupo es mejor cuando:

- el elenco comparte principalmente una historia;
- basta un resumen omnisciente/orientado al grupo;
- se prefiere configuración mínima y menos entradas duplicadas;
- no se necesita STLO.

Una única Memoria grupal puede conservar conocimiento asimétrico:

> Alice encontró el transmisor y lo ocultó. Bob creía que la habitación estaba vacía.

### 11.4 Un libro de grupo más libros por personaje

La disposición avanzada para grupos reales usa:

- un Memory Book canónico del grupo;
- un Memory Book de personaje asignado a cada miembro del grupo.

Requisitos:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) instalado y habilitado;
- una asignación válida para cada miembro requerido.

El libro canónico del grupo no puede ser también un libro de personaje. Varios personajes pueden compartir el mismo libro de personaje; STMB escribe una sola copia en ese libro compartido en lugar de duplicados.

Cuando se guarda una Memoria:

1. la versión canónica se escribe en el libro del grupo;
2. se confirma la selección de participantes salvo que la aceptación automática esté habilitada;
3. las copias vinculadas se escriben en los libros de los participantes seleccionados;
4. STMB revierte las escrituras parciales cuando es posible si falla uno de los guardados obligatorios.

No seleccionar ningún participante en la confirmación del grupo real aplica la Memoria a todos los miembros actuales del grupo.

### 11.5 Prompts separados de grupo y personaje

De forma predeterminada, la misma Memoria orientada al grupo se copia a los libros de participantes.

Un perfil puede habilitar **Use separate group and character prompts in group chats**. Entonces:

- Group Summary Prompt escribe la versión canónica del grupo;
- Character Summary Prompt escribe una versión individualizada para cada libro objetivo de un solo personaje.

Las versiones centradas en un personaje pueden conservar:

- conocimiento privado;
- creencias equivocadas;
- reacciones emocionales personales;
- prioridades específicas;
- lo que importó a un participante concreto.

Esto requiere solicitudes adicionales a la IA. Un libro de personaje compartido recibe una sola copia compartida, no un duplicado por cada personaje asignado.

### 11.6 Responsabilidades de STLO

Memory Books decide:

- rango de escena;
- participantes;
- contenido del resumen;
- qué libros reciben copias;
- si se utilizan prompts individualizados.

STLO decide:

- cuándo está activo un lorebook;
- qué personaje puede activarlo;
- prioridad, posición, presupuesto y orden.

Cuando STMB asigna un libro de personaje, añade el basename del avatar del personaje a `stlo.characterOverrides` y habilita `stlo.onlyWhenSpeaking`, conservando prioridades, presupuestos y overrides existentes de STLO.

STMB usa un comportamiento de solo fusión. Borrar o cambiar una asignación no elimina automáticamente el antiguo character override de STLO. Elimine manualmente los overrides obsoletos en STLO.

### 11.7 Los filtros y libros no son controles de privacidad

Los libros separados y los filtros mejoran la relevancia. No garantizan que:

- un personaje nunca pueda recibir información de otro;
- el modelo nunca vea la versión canónica del grupo;
- el contexto de memorias previas esté perfectamente particionado por conocimiento;
- un libro de personaje represente solo conocimiento consciente.

Úselos como herramientas de enrutamiento de contexto, no como barreras de seguridad.

### 11.8 Las copias vinculadas no se sincronizan en vivo

Las entradas vinculadas comparten metadatos que permiten a STMB reconocer el mismo acontecimiento original, pero las ediciones posteriores son independientes.

Editar, eliminar o compactar una copia no cambia automáticamente las demás. Regenerar una copia de personaje solo cambia esa copia. Sin embargo, al regenerar la entrada canónica del grupo, STMB pregunta si debe regenerar solo esa entrada o también todas las entradas de personaje vinculadas. Cada entrada seleccionada recibe su propia generación y revisión de aprobación, por lo que los prompts centrados en personaje siguen estando centrados en ese personaje.

### 11.9 Añadir, eliminar o reasignar miembros del grupo

Al añadir un personaje:

- asigne un libro válido antes de la siguiente Memoria distribuida;
- las Memorias antiguas no se copian retroactivamente;
- los filtros antiguos no se reescriben;
- proporcione manualmente contexto histórico si hace falta.

Al eliminar un personaje:

- las entradas existentes permanecen;
- los filtros antiguos y overrides de STLO permanecen;
- las copias vinculadas no se eliminan automáticamente.

Al cambiar el libro de un personaje:

- cambia el enrutamiento futuro;
- no necesariamente elimina al personaje de los overrides de STLO del libro anterior.

### 11.10 Consolidación de grupo

El libro canónico del grupo utiliza el prompt automático de análisis de consolidación para chat grupal, que busca una cronología omnisciente distinguiendo los acontecimientos objetivos del conocimiento individual.

Los libros de personaje usan el preset de consolidación seleccionado en el popup. Los libros pueden tener diferentes cantidades de fuentes elegibles. Un libro sin material suficiente puede omitirse con un aviso mientras continúan los libros preparados.

Una escena ausente de un libro de personaje es un hueco cronológico. No demuestra ausencia, ignorancia ni inconsciencia. Un libro de personaje compartido recibe una única entrada consolidada.

---

## 12. Modo Narrador

### 12.1 Definición

Narrator Mode es para un chat normal uno-a-uno de SillyTavern donde una sola tarjeta de personaje Narrator escribe varios personajes ficticios.

```text
Chat normal de SillyTavern
└── tarjeta Narrator
    ├── escribe Alice
    ├── escribe Bob
    └── escribe Clara
```

Sin Narrator Mode, SillyTavern considera todas las respuestas de la IA como escritas por la tarjeta Narrator. Narrator Mode proporciona un modelo manual del elenco para que STMB pueda asociar escenas y Memory Books con personajes ficticios dentro de la prosa del Narrator.

Narrator Mode no está disponible dentro de un chat grupal real de SillyTavern.

### 12.2 Disposición de almacenamiento obligatoria

Narrator Mode requiere:

- Manual Lorebook Mode;
- un **Memory Book omnisciente/canónico** seleccionado;
- un Memory Book único para cada miembro declarado del elenco.

Reglas:

- un miembro del elenco no puede usar el libro omnisciente;
- dos miembros del elenco no pueden compartir el mismo libro;
- cada miembro declarado debe tener un libro disponible;
- los miembros retirados conservan su identidad y reserva de libro hasta que se restauran o se eliminan de otra forma según la implementación;
- Auto-Create es incompatible porque Narrator Mode depende de Manual Lorebook Mode.

A diferencia de la disposición avanzada de grupo real, Narrator Mode no necesita STLO para recuperación por personaje activo. STMB inyecta los libros de los miembros del elenco seleccionados en el contexto activo de lorebooks durante la generación.

### 12.3 Configuración

1. Abra el chat normal de la tarjeta Narrator.
2. Active Manual Lorebook Mode.
3. Seleccione el libro manual principal; será el Memory Book omnisciente.
4. Active **Narrator Mode**.
5. Abra **Manage Narrator Cast**.
6. Añada cada personaje ficticio por nombre y asigne un Memory Book único.
7. Use el panel flotante **Active Cast** para seleccionar los personajes presentes en el siguiente intercambio.

Narrator Mode debe deshabilitarse antes de poder deshabilitar Manual Lorebook Mode.

### 12.4 Panel Active Cast y metadatos de la línea temporal

El panel flotante Active Cast puede expandirse, contraerse, moverse y utilizarse para seleccionar miembros actuales del elenco.

Durante la generación, STMB toma una instantánea del elenco activo y la guarda en los metadatos de mensajes:

- el mensaje del usuario recibe la instantánea del elenco activo;
- la respuesta del Narrator recibe la instantánea de generación;
- una continuación fusiona su elenco con los metadatos de elenco existentes;
- los metadatos de cada swipe se guardan por separado;
- seleccionar un swipe puede restaurar el elenco activo de ese punto de la línea temporal;
- eliminar mensajes recientes puede restaurar el estado del elenco desde el último mensaje etiquetado restante del Narrator.

El marcador de elenco registra asociación, no un análisis semántico de la prosa.

### 12.5 Recuperación durante generación normal del Narrator

Cuando comienza una generación del Narrator, STMB carga los Memory Books del elenco activo y fusiona sus entradas en la colección character-lore usada para esa solicitud, evitando pares world/UID duplicados.

Consecuencias:

- solo los libros del elenco activo son añadidos por este flujo de Narrator;
- el libro omnisciente sigue su configuración/activación normal de Manual Mode;
- no se requieren filtros STLO por personaje para Narrator Mode;
- la selección del elenco debe ser correcta antes de la generación si se espera que los libros de personaje correctos entren en contexto.

### 12.6 Detección de participantes de escena

Para una escena seleccionada, las respuestas etiquetadas del Narrator son autoritativas. STMB combina los IDs de elenco registrados en mensajes escritos por el Narrator.

Si la escena contiene mensajes Narrator antiguos sin etiqueta, STMB recurre a información de continuidad de todos los mensajes y pide al usuario confirmar el elenco de la escena. Los miembros activos actuales se preseleccionan. Una selección vacía significa que no había miembros individuales del elenco presentes.

Esta confirmación está pensada específicamente para metadatos de elenco heredados o incompletos; las escenas totalmente etiquetadas no la necesitan.

### 12.7 Distribución de Memorias

Una Memoria de escena Narrator se escribe como:

- una entrada canónica omnisciente en el Memory Book principal;
- una copia vinculada en el Memory Book único de cada participante seleccionado.

Las copias de Narrator no usan filtros nativos de personaje de SillyTavern. En su lugar, STMB guarda IDs de participante y propietario de Narrator en metadatos de entrada.

Si los prompts multi-personaje separados están deshabilitados, los libros de participantes reciben copias del resumen omnisciente. Si están habilitados, cada libro de un solo personaje puede recibir una generación centrada en ese personaje.

### 12.8 Consolidación y regeneración en Narrator

Los metadatos de propiedad y participantes de Narrator se transmiten a las fuentes de consolidación. Esto permite que entradas de nivel superior conserven qué libro de personaje posee una copia y qué miembros del elenco participaron en el material subyacente.

La regeneración usa estos metadatos para decidir si el objetivo del prompt de reemplazo es omnisciente/orientado al grupo o centrado en personaje.

Al igual que las copias de grupos reales, las entradas Narrator vinculadas no se sincronizan en vivo después de crearse.

### 12.9 Retirar miembros del elenco

El gestor de elenco puede marcar a un miembro como retirado y restaurarlo posteriormente. Los miembros retirados:

- se eliminan de las opciones de elenco activo;
- se eliminan del conjunto de IDs activos;
- conservan identidad estable y metadatos históricos;
- conservan su reserva de libro, evitando una reutilización accidental que mezclaría identidades.

Use la retirada para un personaje que abandona el elenco activo pero cuya identidad histórica de Memoria debe mantenerse intacta.

---

## 13. Ramificación de chats

Las ramas nativas de SillyTavern pueden convertirse en continuidades diferentes. Si una rama y su padre escriben en los mismos Memory Books desbloqueados, pueden mezclarse líneas temporales contradictorias.

**Copy Memory Books when branching** está habilitado de forma predeterminada.

### 13.1 Qué se copia

Cuando STMB reconoce una rama nativa recién creada:

- Automatic Mode copia el Memory Book activo vinculado al chat;
- Manual Mode copia el Memory Book manual principal;
- un grupo de Manual Mode copia cada Memory Book de personaje desbloqueado único;
- Narrator Mode copia el libro omnisciente y cada libro de personaje declarado;
- los bloqueos persistentes de personajes reales se conservan en lugar de copiarse, porque un bloqueo significa «seguir usando este mismo libro».

Todos los libros copiados en una operación de rama usan el mismo número de linaje disponible:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Ramificar desde una rama existente conserva la raíz del linaje original, en vez de producir nombres como `Branch 1 Branch 1`.

### 13.2 Metadatos reescritos

Dentro de las copias, STMB:

- reescribe los IDs del chat padre coincidentes con el ID del nuevo chat de la rama;
- redirige vínculos canónicos grupo/personaje cuando se copiaron ambos libros vinculados;
- actualiza las vinculaciones de la nueva rama para que apunten a las copias.

Clona el contenido existente; no regenera Memorias.

### 13.3 Seguridad ante fallos

No cambie de chat mientras la copia de rama está en curso.

Si la copia falla, STMB borra las vinculaciones de escritura heredadas de la nueva rama y registra el fallo para impedir que la rama escriba silenciosamente en los originales del padre.

### 13.4 Deshabilitar copias de ramas

Deshabilite el ajuste únicamente cuando la rama esté destinada intencionadamente a compartir los mismos Memory Books y el mismo historial continuo que el padre.

---

## 14. Clips

Un Clip guarda directamente texto seleccionado del chat en una entrada de lorebook `[STMB Clip]`. No llama a un modelo de IA.

### 14.1 Use Clips para

- una preferencia;
- una promesa o secreto;
- un nombre o alias;
- un objeto o mascota;
- un hecho breve de relación;
- una línea que deba conservarse exactamente o casi exactamente;
- una «nota para mí» rápida que no justifica una Memoria de escena.

### 14.2 Flujo de trabajo

1. Resalte texto dentro de un mensaje del chat.
2. Haga clic en el botón flotante de tijeras.
3. Elija una entrada Clip existente o cree una nueva.
4. Para una nueva entrada, elija always-active o activación por palabras clave.
5. Revise la entrada actual y la vista previa actualizada.
6. Cambie el nombre si es necesario.
7. Guarde.

El botón flotante de tijeras solo aparece después de seleccionar texto del chat y puede deshabilitarse desde el panel principal.

### 14.3 Formato de entrada

Título:

```text
Seraphina Healed Me [STMB Clip]
```

Contenido:

```markdown
=== Seraphina Healed Me ===

- Seraphina curó las heridas del usuario con magia.

=== END Seraphina Healed Me ===
```

Una entrada Clip tiene una sola sección. Los títulos enfocados permiten palabras clave de activación enfocadas.

### 14.4 Entradas existentes

Una entrada existente puede tratarse como Clip añadiendo `[STMB Clip]` al final de su título. Las entradas Clip largas pueden editarse manualmente o compactarse.

Los Clips guardan únicamente el texto elegido. No añaden atribución de fuente automáticamente.

---

## 15. Topical Clips

Un Topical Clip lee entradas de Memoria STMB confirmadas, un rango explícito de mensajes del chat actual o ambos, y pide a una IA producir una entrada enfocada «sobre este tema». Las fuentes de Memoria elegibles pueden incluir Memorias de escena y resúmenes consolidados; las entradas Clip y Side Prompt quedan excluidas como fuentes.

### 15.1 Use Topical Clip cuando

La información sobre un único tema esté repartida entre varias Memorias, por ejemplo:

- un NPC recurrente;
- un historial de relación;
- un lugar o facción;
- una investigación o misterio;
- poderes, lesiones, promesas, preferencias o secretos;
- un objeto importante;
- un hilo argumental no resuelto.

Topical Clip organiza por tema, no por la cronología de todas las Memorias de origen.

### 15.2 Restricciones de fuentes

Topical Clip usa:

- entradas de Memoria STMB confirmadas del libro fuente seleccionado, incluidos resúmenes consolidados elegibles;
- mensajes visibles de un rango inclusivo `X-Y` seleccionado explícitamente en el chat actual.

Los controles **Include saved Memories** y **Include chat messages** pueden utilizarse por separado o juntos. Los rangos de mensajes siguen el ajuste global de unhide-before-memory y restauran los mensajes previamente ocultos después de compilarlos.

No usa:

- mensajes del chat fuera del rango seleccionado;
- entradas Clip normales;
- entradas Side Prompt;
- entradas de lorebook ordinarias no relacionadas.

### 15.3 Crear un Topical Clip

1. Abra Memory Books.
2. Haga clic en **Topical Clip**.
3. Elija el Memory Book fuente.
4. Introduzca el tema.
5. Introduzca palabras clave de activación o déjelas vacías para usar el tema.
6. Elija una entrada nueva o un objetivo existente `[STMB Clip]`.
7. Elija Memorias guardadas, mensajes del chat o ambos como fuentes.
8. Opcionalmente seleccione solo Memorias fuente concretas y/o introduzca un rango exacto de mensajes.
9. Elija el perfil de generación.
10. Genere el borrador.
11. Revíselo y edítelo.
12. Guárdelo solo cuando sea correcto.

El borrador generado nunca se guarda automáticamente.

### 15.4 Actualizar un Topical Clip existente

Después de una ejecución correcta, STMB registra qué Memorias fuente se usaron y, cuando corresponde, el chat de origen, rango de mensajes, IDs y hashes. Una actualización posterior basada en Memorias normalmente envía solo Memorias nuevas o modificadas junto con el contenido existente del Clip. Los rangos de mensajes siempre se eligen explícitamente.

Use **Rebuild from all source memories** cuando:

- la entrada actual esté incompleta o desorganizada;
- haya cambiado el prompt;
- se hayan editado sustancialmente Memorias antiguas;
- deba reconsiderarse todo el tema.

### 15.5 Selección manual de fuentes y avisos de tokens

Use **Use only selected memories** cuando el libro sea grande, el tema se limite a un periodo concreto, los nombres se solapen o sea necesario un control estricto de evidencias.

STMB estima el tamaño de la solicitud y avisa cuando se supera el umbral configurado. Reduzca las fuentes, aumente el umbral deliberadamente o ejecute una vez de todas formas.

### 15.6 Criterio de revisión

Compruebe que el borrador:

- se mantiene en el tema;
- conserva nombres y relaciones;
- incluye los hechos importantes pertinentes;
- identifica contradicciones en vez de elegir silenciosamente una versión;
- no inventa explicaciones no respaldadas por las Memorias fuente;
- fusiona actualizaciones sin duplicación innecesaria.

### 15.7 Placeholders del prompt

Un prompt personalizado de Topical Clip debe incluir `{{SOURCE_MEMORIES}}` cuando se seleccionen Memorias guardadas y `{{SOURCE_MESSAGES}}` cuando se seleccionen mensajes del chat.

Placeholders de fuentes:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Placeholders compatibles:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Use Reset to Default si un prompt personalizado deja de producir resultados útiles.

---

## 16. Side Prompts

Un Side Prompt es un prompt STMB con nombre que se ejecuta por separado de la respuesta normal del personaje. Normalmente crea o actualiza una sola entrada de apoyo continua en vez de otra Memoria secuencial de escena.

En la lista **Trackers & Side Prompts**, el icono de encendido cambia inmediatamente el indicador global **Enabled** del prompt: verde significa habilitado y atenuado significa deshabilitado. Este control no añade, elimina ni modifica de otro modo los triggers configurados del prompt.

### 16.1 Usos apropiados

- seguimiento de trama e hilos no resueltos;
- estado de relaciones;
- estado de NPC o facciones;
- inventario y recursos;
- lesiones, estadísticas o reputación;
- líneas temporales, fechas, plazos y viajes;
- pistas de misterio, sospechosos y contradicciones;
- inventos, investigación y proyectos;
- informes de riesgo de continuidad;
- resúmenes de estado del mundo.

Evite prompts vagos de «seguir todo», resúmenes de escena duplicados o tareas que deban aparecer dentro de la siguiente respuesta de roleplay.

### 16.2 Formato de salida

Los Side Prompts normalmente esperan texto final o Markdown listo para guardar. No requieren JSON de Memory. JSON se permite únicamente cuando el usuario desea intencionadamente guardar JSON como texto del tracker.

### 16.3 Secuencia de ejecución

Una ejecución típica reúne:

1. instrucciones del Side Prompt;
2. entrada previa guardada del tracker, si existe;
3. Memorias previas opcionales;
4. Additional Context opcional;
5. texto de escena seleccionado o desde la última ejecución;
6. instrucciones opcionales de Response Format.

La entrada previa es estado existente que debe revisarse, no prueba de que toda afirmación antigua deba conservarse. Los prompts deben indicar explícitamente eliminar información obsoleta, resuelta, contradicha o duplicada.

### 16.4 Ejecuciones manuales

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Los nombres con espacios deben ir entre comillas. Un rango proporcionado es inclusivo.

Las ejecuciones manuales son mejores para análisis dirigido y prompts que requieren valores de macros en tiempo de ejecución.

### 16.5 Ejecuciones automáticas después de Memory

Un Side Prompt puede habilitar **Run automatically after memory**.

El chat usa entonces uno de dos modos automáticos de selección:

- Side Prompts habilitados individualmente; o
- un Side Prompt Set seleccionado.

Un set seleccionado sustituye a los prompts automáticos habilitados individualmente para ese chat. No se suma a ellos.

#### Memory Assistance Side Prompt

**Memory Assistance** es un Side Prompt reservado con cuatro modos independientes. Se ejecuta después de Memorias guardadas correctamente, independientemente de la habilitación normal de Side Prompts o del Side Prompt Set seleccionado. No se ejecuta durante la regeneración de Memory.

Memory Assistance compara la escena procesada sin resumir con los Clips normales y Topical Clips de cada Memory Book que recibió la Memoria. Envía a la IA el título/tema, palabras clave, contenido actual, ID estable y tipo de cada Clip revisado.

Cuando la cola de trabajos está disponible, cada Memory Book objetivo recibe un trabajo **Memory Assistance** independiente después de guardar la Memoria. Un error de solicitud, validación de respuesta, guardado del informe o aplicación automática marca ese trabajo como **Failed** y expone el error en la cola. La Memoria guardada permanece **Completed**, y reintentar Memory Assistance no regenera la Memoria.

- **Off** deshabilita Memory Assistance.
- **Update** revisa directamente cinco Clips o menos; con más de cinco se abre una lista de selección. Los cambios propuestos esperan aprobación manual.
- **Update and Suggest** primero realiza una solicitud de descubrimiento de temas y luego ejecuta el mismo flujo de revisión de Clips existentes que Update.
- **Automatic** revisa todos los Clips en lotes basados en tokens sin pedir qué Clips revisar. Aplica directamente adiciones válidas a Clips normales, mientras que los reemplazos de Topical Clips permanecen pendientes de aprobación en **Memory Assistance Suggestions**.

- En Update y Update and Suggest, la lista grande ofrece **Query Selected** y **Query All**.
- Query All y Automatic usan lotes basados en tokens en vez de forzar todos los Clips en una solicitud demasiado grande.
- Cada Clip normal recibe como máximo un extracto exacto de mensaje propuesto como adición.
- Los Topical Clips reciben borradores completos de reemplazo.
- La respuesta de IA es un objeto JSON simple que asigna cada UID de Clip afectado directamente a su extracto o reemplazo sugerido. Un objeto vacío significa que ningún Clip necesita actualización.
- Los resultados de Update se escriben en `Memory Assistance (STMB SidePrompt)` y no se aplican hasta aprobarlos mediante **Memory Assistance Suggestions**.
- Los resultados del modo Automatic registran cuántas adiciones a Clips normales se aplicaron y conservan reemplazos de Topical Clip y fallos de aplicación para revisión manual.
- Cancelar la selección borra sugerencias antiguas para que no se confundan con los resultados de la escena más reciente.

Update and Suggest utiliza un prompt independiente solo para sugerencias antes de los lotes de revisión de Clips existentes. La solicitud contiene la escena procesada y una lista ligera de títulos, temas y palabras clave de Topical Clips existentes. No envía Clips normales ni cuerpos existentes de Clips durante el descubrimiento. La IA devuelve de cero a cinco temas nuevos como objetos JSON que contienen un tema y palabras clave de activación; `{"topics":[]}` es un resultado válido.

Los temas sugeridos se guardan en el informe de Memory Assistance. En **Memory Assistance Suggestions**, elija **Review Topics** para verlos como filas marcadas y editables. Puede desmarcar temas no deseados, editar nombres o palabras clave, o añadir temas adicionales. Los temas confirmados abren uno a uno el flujo estándar de borrador de Topical Clip. Un tema pendiente se elimina únicamente después de guardar su Topical Clip; cerrar el borrador lo deja disponible en **Memory Assistance Suggestions**.

Cuando las sugerencias revisables están preparadas, STMB abre un popup de finalización para el Memory Book actualizado. **Dismiss** cierra el aviso, mientras que **Go to Suggestions** abre **Memory Assistance Suggestions** con ese Memory Book ya seleccionado. Abrir **Memory Assistance Suggestions** desde el menú de la extensión selecciona primero el Memory Book efectivo del chat actual (el libro vinculado al chat en Automatic Mode o el libro manual resuelto en Manual Mode).

Los prompts de Update y Topic Suggestions y la sustitución del perfil de conexión pueden editarse independientemente, pero ambos contratos de respuesta estructurada son fijos. Memory Assistance no puede eliminarse, duplicarse, colocarse en un Side Prompt Set ni ejecutarse manualmente.

### 16.6 Intervalos automáticos de mensajes visibles

Un Side Prompt puede habilitar **Run on visible message interval** y especificar una cantidad de mensajes visibles desde su checkpoint.

Los mensajes ocultos y del sistema no cuentan.

Cuando un set está activo, solo son candidatos los renglones del set cuyo prompt referenciado tenga el trigger de intervalo apropiado.

### 16.7 Side Prompt Sets

Un Side Prompt Set es una lista ordenada de ejecuciones, no simplemente una carpeta. La misma plantilla puede aparecer varias veces con diferentes valores de macro.

Ejemplo:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Las filas pueden guardar:

- una referencia a prompt;
- una etiqueta opcional;
- valores de macros en tiempo de ejecución;
- orden;
- acciones de duplicar o eliminar.

Las filas se ejecutan de arriba abajo.

Comandos manuales de set:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Sets predeterminados y selección por chat

General Settings puede definir:

- un set predeterminado para chats individuales;
- un set predeterminado para chats grupales.

Cada chat puede:

1. heredar el predeterminado aplicable;
2. usar explícitamente prompts habilitados individualmente;
3. elegir un set con nombre.

Un predeterminado global vacío significa modo individual.

Si se elimina un set seleccionado, STMB avisa en lugar de sustituir silenciosamente otro flujo. Un prompt faltante en una fila o una macro sin resolver hace que esa fila se omita con un aviso.

El set selecciona filas candidatas. Cada Side Prompt referenciado sigue necesitando el trigger automático pertinente para ejecución después de Memory o por intervalo. Los comandos manuales de set no requieren esas casillas de trigger.

### 16.9 Macros

Los Side Prompts pueden usar macros normales de SillyTavern como:

```text
{{user}}
{{char}}
```

Los placeholders `{{...}}` no estándar son macros de tiempo de ejecución. Deben proporcionarse manualmente o guardarse en una fila de set.

Ejemplos:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Un prompt con macros de runtime sin resolver no puede ejecutarse automáticamente. Las ejecuciones automáticas no pueden detenerse para solicitar valores.

### 16.10 Macros de recuento de memoria

STMB registra macros enteras para el Memory Book principal efectivo:

| Macro | Recuento |
|---|---|
| `{{memtier0}}` | Memorias de escena |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | entradas Clip |
| `{{memside}}` | entradas Side Prompt |

El libro principal efectivo es el vinculado al chat en Automatic Mode o el manual principal resuelto en Manual Mode. En una configuración de varios libros de grupo o Narrator, los recuentos no suman todos los libros de personajes.

Una macro de recuento proporciona únicamente un número, no el contenido de esas entradas.

### 16.11 Rangos de mensajes

Un rango explícito usa exactamente ese rango inclusivo. Sin rango, STMB usa el comportamiento de checkpoint/cap desde la última ejecución del Side Prompt.

Use rangos explícitos para depuración, limpieza dirigida o para volver a ejecutar una sección conocida.

### 16.12 Additional Context y Memorias previas

Un Side Prompt puede incluir hasta siete Memorias de escena previas.

Su fuente de Additional Context puede ser:

- ninguna;
- **Follow chat**, usando el Context Setting seleccionado del chat;
- un Context Setting con nombre fijo.

Son materiales de referencia. El prompt no debe copiarlos ciegamente al tracker.

### 16.13 Objetivos de lorebook

Un Side Prompt normalmente guarda en el Memory Book efectivo. En su lugar puede usar:

1. un override de objetivo por chat;
2. un objetivo a nivel de plantilla;
3. el Memory Book efectivo como fallback.

Un override por chat válido tiene prioridad.

Use objetivos alternativos para un libro compartido de campaña o un libro dedicado de trackers. No disperse trackers sin un plan de recuperación.

### 16.14 Controles de entrada de Side Prompt

Una plantilla puede configurar:

- override de título;
- palabras clave;
- activación Normal, Constant o Vectorized;
- posición de inserción y nombre de Outlet;
- modo/valor de orden;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Los campos de título y palabras clave pueden expandir macros aplicables. **Ignore Budget** debe utilizarse con moderación porque varios trackers incluidos siempre pueden consumir mucho contexto.

### 16.15 Override de perfil de conexión

Un Side Prompt puede heredar la resolución normal de conexión de Memory Books o vincular un perfil STMB específico. Un override es útil para un modelo más barato o mejor en mantenimiento estructurado. Demasiadas combinaciones de perfiles dificultan la solución de problemas.

### 16.16 Regeneración de Side Prompt

Los guardados compatibles almacenan una instantánea compacta que contiene:

- clave de plantilla de Side Prompt;
- contenido anterior de la entrada;
- chat de origen y rango inclusivo;
- valores de macros en tiempo de ejecución.

Para regenerar, abra el editor de lorebook y haga clic en **Regenerate side prompt**. El reemplazo usa la instantánea guardada con la plantilla actual y los ajustes actuales de perfil/contexto.

La regeneración no puede completarse si se eliminó la plantilla, no está disponible el chat/rango de origen o el objetivo/origen cambió durante la generación. Solo se reemplaza el contenido; el título, palabras clave y ajustes existentes de la entrada permanecen.

### 16.17 Escribir buenos Side Prompts

Un buen Side Prompt define:

- el trabajo exacto de mantenimiento;
- qué material fuente revisar;
- si debe revisar, reemplazar, fusionar o añadir;
- información obsoleta que eliminar;
- encabezados y orden de salida estables;
- un límite estricto de longitud;
- comportamiento de solo salida final.

Ejemplo:

```text
Actualiza el registro de relación usando la escena proporcionada. Conserva los hechos actuales, fusiona los nuevos avances en las secciones existentes y elimina detalles resueltos, contradichos, obsoletos o duplicados. Mantén cada relación en 1–3 viñetas concisas. Devuelve únicamente el registro actualizado.
```

Guardas útiles:

```text
No añadas una nueva sección salvo que haya información realmente nueva.
Elimina hilos resueltos y especulaciones obsoletas.
Devuelve únicamente el informe actualizado; sin prefacio ni explicación.
Mantén toda la salida por debajo de 300 palabras.
```

Los encabezados estables reducen la deriva entre actualizaciones repetidas.

### 16.18 Solución de problemas de Side Prompt

Si un prompt no se ejecutó:

- confirme que realmente ocurrió el evento Memory o de intervalo;
- inspeccione la selección individual/set del chat;
- verifique que el prompt referenciado aún existe;
- verifique que el trigger automático pertinente está habilitado;
- compruebe que todas las macros de runtime tienen valores;
- compruebe si `/stmb-stop` o un trabajo fallido lo cancelaron.

Si se ejecutó dos veces:

- compruebe ejecución manual más automática;
- filas duplicadas del set;
- copias duplicadas del prompt;
- varias pestañas o chats ejecutando trabajo.

Si recibió el libro equivocado, inspeccione tanto el objetivo por chat como el objetivo a nivel de plantilla.

Si la salida crece indefinidamente, añada reglas explícitas de reemplazo, poda, número de elementos y límite de palabras.

---

## 17. Consolidación

Consolidation combina Memorias STMB o resúmenes de nivel inferior en recapitulaciones cronológicas de nivel superior.

### 17.1 Niveles

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation trabaja con entradas STMB existentes, no directamente con chat sin procesar.

### 17.2 Propósito

Úsela cuando:

- se estén acumulando Memorias de escena;
- el material antiguo ya no necesite el detalle completo de cada escena;
- haya concluido una fase importante de relación, trama o campaña;
- deba reducirse el uso de tokens preservando continuidad;
- se necesite una cronología de nivel superior más limpia.

Las entradas consolidadas deben enfatizar cambios duraderos, puntos de giro, objetivos, consecuencias, cambios de relación, hilos no resueltos y estado estable.

### 17.3 Flujo manual

1. Abra **Consolidate Memories**.
2. Elija el nivel objetivo.
3. Seleccione las entradas fuente elegibles.
4. Elija el prompt/perfil de consolidación.
5. Decida si las fuentes deben deshabilitarse tras una consolidación correcta.
6. Ejecute y revise los candidatos.
7. Apruebe los resúmenes deseados.

### 17.4 Los avisos de preparación no son consolidación automática

**Prompt for consolidation when a tier is ready** vigila los niveles objetivo seleccionados. Cuando se alcanza el mínimo guardado de fuentes elegibles, STMB muestra un prompt yes/later. Elegir Yes abre la interfaz de consolidación. No consolida silenciosamente.

### 17.5 Esquema de salida de Consolidation

La consolidación normal espera JSON estricto:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

El modelo puede devolver uno o varios resúmenes. `member_ids` asigna cada fuente a un resumen devuelto. Los outliers deben ir en `unassigned_items` en vez de forzarse dentro de una recapitulación no relacionada.

### 17.6 Resumen previo de nivel superior

Un resumen previo del nivel objetivo puede proporcionarse como contexto canónico. No es material fuente que deba reescribirse. Los prompts de consolidación deben distinguirlo de las entradas de nivel inferior que se procesan.

### 17.7 Vistas previas y respuestas fallidas

Las vistas previas de Consolidation pueden permitir editar, aceptar, regenerar un candidato usando las mismas fuentes o regenerar un lote pendiente.

Las respuestas de IA malformadas o fallidas pueden inspeccionarse y, cuando se admite, corregirse manualmente antes de confirmar.

### 17.8 Deshabilitar fuentes

Cuando está habilitado, STMB deshabilita las entradas fuente después de una consolidación correcta para que el resumen de nivel superior pueda asumir la recuperación. Esto es reversible mediante la edición normal del lorebook.

### 17.9 Buenos prompts de consolidación

Deben definir:

- el objetivo de compresión;
- si crear una recapitulación o el menor número coherente;
- lógica de cronología y agrupación;
- detalles que deben sobrevivir;
- manejo explícito de outliers;
- estructura JSON exacta.

Deben preservar grandes acontecimientos, consecuencias, promesas, cambios de relación, identificadores, hilos no resueltos y palabras clave útiles para recuperación, eliminando detalle repetido de escena.

---

## 18. Compactación

Compaction pide a una IA que acorte una entrada existente administrada por STMB y muestra el original y el borrador antes del reemplazo.

### 18.1 Entradas elegibles

- entradas `[STMB Clip]`;
- entradas Side Prompt;
- entradas STMB Memory.

Las entradas normales de lorebook que no son STMB no aparecen.

### 18.2 Flujo de trabajo

1. Abra **Compaction**.
2. Elija un Memory Book.
3. Elija un Compaction Profile.
4. Opcionalmente edite el Compaction Prompt.
5. Elija una entrada.
6. Compare contenido/estimaciones de tokens del original y la versión compactada.
7. Edite el borrador si es necesario.
8. Reemplace, copie el borrador o cancele.

El original no cambia hasta seleccionar **Replace with Compacted Version**.

### 18.3 Buenos usos

- colecciones largas de Clips;
- contenido repetido u obsoleto de trackers;
- Memorias de escena demasiado verbosas;
- entradas always-active que consumen demasiado contexto.

Compaction no sirve para añadir hechos, resumir chat sin procesar, crear una Memoria nueva ni procesar entradas normales de lorebook.

### 18.4 Placeholders del prompt

```text
{{ENTRY_CONTENT}}  contenido actual obligatorio
{{ENTRY_KIND}}     Clip, SidePrompt o Memory
{{ENTRY_TITLE}}    título de la entrada
```

El prompt debe preservar hechos, nombres, pronombres, macros, encabezados envolventes y marcadores finales, eliminando redundancia y texto de poco valor.

---

## 19. Regeneración

Regeneration crea un reemplazo revisable para una entrada existente. No crea una segunda entrada numerada y nunca sobrescribe sin aprobación.

### 19.1 Regeneración de Memoria de escena

- abra el chat de origen;
- abra el Memory Book en el editor de lorebook;
- haga clic en **Regenerate memory**;
- para una entrada canónica de grupo con entradas de personaje vinculadas, elija si regenerar solo la entrada seleccionada o todas las vinculadas;
- elija el perfil actual, prompt, cantidad de Memorias previas y Additional Context;
- revise título, contenido y palabras clave de cada entrada seleccionada.

Se conservan el rango original de escena y el número de secuencia. Las entradas vinculadas reutilizan los mismos ajustes de regeneración seleccionados, pero se generan con el contexto de su propio Memory Book y el objetivo de prompt grupo/personaje correspondiente. STMB recopila todas las aprobaciones antes de comenzar a guardar regeneraciones directas. Si todos los mensajes fuente están ocultos, muéstrelos o habilite unhide-before-generation.

### 19.2 Regeneración de Consolidation

Un resumen de nivel superior se regenera a partir de sus fuentes exactas de nivel inferior vinculadas mediante el preset dedicado **Regenerate Consolidation**.

El conjunto completo de fuentes debe seguir existiendo en el nivel correcto. Una fuente de nivel inferior no puede regenerarse mientras un resumen padre activo dependa de ella; elimine primero el padre cuando se quiera reconstruir intencionadamente el nivel inferior.

### 19.3 Regeneración de Side Prompt

Consulte las reglas de instantánea de Side Prompt en la Sección 16.16.

### 19.4 Comprobaciones de seguridad

Inmediatamente antes del reemplazo, STMB verifica que:

- la entrada objetivo no ha cambiado;
- el rango del chat fuente no ha cambiado;
- las fuentes de Consolidation necesarias no han cambiado y están disponibles;
- la entrada sigue siendo elegible.

Si falla cualquier comprobación, no se sobrescribe nada.

Las copias vinculadas de grupo, personaje y Narrator siguen siendo independientes.

---

## 20. Contexto para la generación

En una solicitud STMB pueden aparecer varias fuentes de contexto. No son intercambiables.

### 20.1 Escena actual

El rango de mensajes que se procesa ahora. Es el material objetivo de una Memoria de escena normal.

### 20.2 Memorias previas

Memorias de escena anteriores del Memory Book efectivo, incluidas como contexto de continuidad de solo lectura. Normalmente el usuario puede incluir de 0 a 7.

No deben resumirse de nuevo solo porque aparezcan antes de la escena actual.

### 20.3 Additional Context

Entradas de lorebook seleccionadas que se proporcionan como material de referencia estable, por ejemplo:

- reglas de personaje o ambientación;
- nombres y terminología canónicos;
- restricciones de campaña;
- una línea temporal autoritativa;
- referencias de lugares;
- hechos asumidos pero no repetidos en la escena.

Additional Context aparece antes de las Memorias previas y de la transcripción de la escena. Es material de referencia, no otra escena.

### 20.4 Context Settings

Un Context Setting es una colección ordenada reutilizable de entradas de Additional Context.

Flujo:

1. abra **Context Settings**;
2. cree un setting con nombre;
3. seleccione entradas de lorebook;
4. ordénelas;
5. elija el setting para el chat actual o seleccione explícitamente No Context.

La selección se guarda por chat y funciona tanto con Current SillyTavern Settings como con perfiles guardados.

Si desaparece un libro o una entrada referenciada, STMB avisa, omite la referencia obsoleta y continúa. Si se elimina todo el Context Setting, los chats que lo referencian continúan sin Additional Context hasta que se elija otra selección.

Los Context Settings pueden duplicarse, importarse y exportarse como `stmb-context-settings.json`.

### 20.5 Entrada previa de Side Prompt

El texto actual del tracker que debe revisarse. Es estado, no evidencia de que todas las afirmaciones antiguas sigan siendo válidas.

### 20.6 Fuentes de Consolidation

Entradas de nivel inferior que constituyen el material real que se agrupa y comprime.

### 20.7 Resumen previo de nivel superior

Canon que se arrastra durante Consolidation. No es una fuente que deba reescribirse.

### 20.8 Orden correcto según el flujo

Memory normal:

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt:

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation:

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Los prompts deben etiquetar claramente el material objetivo y el material solo de referencia.

---

## 21. Arquitectura de prompts, prompts de resumen integrados y reglas de autoría

STMB tiene tres sistemas principales de generación estructurada, además de varios flujos auxiliares enfocados.

### 21.1 Generación normal de Memory

STMB espera un objeto JSON:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Reglas:

- devuelva únicamente el objeto JSON;
- use exactamente las claves `title`, `content` y `keywords`;
- `keywords` debe ser un array JSON de strings;
- mantenga el título corto y legible;
- use términos concretos de recuperación;
- coloque cualquier Markdown deseado dentro del string `content`;
- escape correctamente las comillas.

STMB puede reparar algunos fences, comas finales, think tags, wrappers o pequeños errores de formato, pero los prompts nunca deben depender de esa recuperación.

Un prompt fuerte de Memory especifica:

1. estilo de memoria y nivel de compresión deseados;
2. información relevante para continuidad que debe conservarse;
3. material de relleno, OOC o no respaldado que debe omitirse;
4. esquema JSON exacto.

Los prompts débiles especifican estilo pero no estructura, piden análisis en vez de un objeto final, mezclan contexto previo con la escena actual o utilizan palabras clave abstractas.

### 21.2 Prompts de resumen integrados y cómo elegir uno

Estos presets son únicamente para generación normal de Memory. No controlan Consolidation, Side Prompts, Topical Clips ni Compaction. Un perfil selecciona uno en **Memory Creation Method**. **Summary** es el fallback/default normal si un perfil no especifica otro preset. «Integrado» significa suministrado por STMB; no significa que todos los presets se ejecuten ni que todos sean igual de adecuados para un chat.

No existe un mejor prompt universal, porque detalle, legibilidad, calidad de recuperación y coste en tokens tiran en direcciones diferentes. La respuesta práctica breve es:

- **Mejor punto de partida para la mayoría: Summary.** Es equilibrado, general y una buena primera prueba con un modelo nuevo.
- **Mejor para roleplay largo y sensible a continuidad: Comprehensive.** Aplica las guías más fuertes de filtrado, causalidad, continuidad y palabras clave, pero exige más al modelo y puede producir una Memoria estructurada más grande.
- **Mejor cuando ahorrar contexto es lo principal: Minimal.** Es intencionadamente breve y perderá matices.
- **Mejor para libros separados de personaje en grupo real o Narrator: Group y Character.** Úselos juntos mediante el ajuste de prompts separados grupo/personaje del perfil; son prompts de objetivo, no estilos generales rivales.

| Prompt integrado | Mejor uso | Principal compromiso |
|---|---|---|
| **Summary** | La mayoría de chats individuales y primera configuración. Produce prosa narrativa cronológica detallada con acontecimientos, interacciones, desarrollos, revelaciones, resultados y palabras clave concretas. | Conserva más detalle del que necesita un usuario ultraminimalista, pero es más simple y menos exigente que los presets más estructurados. |
| **Comprehensive** | Historias largas sensibles a continuidad donde importan cadenas causales, dinámica de personajes, hechos establecidos, intercambios clave, hilos no resueltos y palabras clave disciplinadas. Filtra explícitamente detalle incidental y mejora la construcción de keywords. | Tiene las instrucciones más largas y exigentes. Use un modelo competente y suficientes tokens de respuesta. |
| **Summarize** | Usuarios que prefieren un registro Markdown muy escaneable dividido en Timeline, Story Beats, Key Interactions, Notable Details y Outcome. | Las viñetas pueden leerse más como notas de referencia que como memoria narrativa y pueden repetir hechos entre secciones. |
| **Synopsis** | Escenas donde conservar casi cada beat significativo, interacción, detalle y resultado importa más que la compactación. | Es intencionadamente largo y exhaustivo; es de los peores si el presupuesto de lorebook o contexto es ajustado. |
| **Sum Up** | Un registro cronológico narrativo con encabezado visible de escena y timeline, pero con menos secciones que Summarize o Synopsis. | Separa menos explícitamente acontecimientos, dinámica, hechos y estado de continuidad. |
| **Minimal** | Chats de alto volumen, cobertura de archivo barata o configuraciones donde las Memorias deben consumir muy poco contexto. Produce una Memoria breve de dos a cinco frases. | Puede perder motivos, cambios emocionales, causalidad y detalles menores de continuidad. |
| **Northgate** | Usuarios de escritura creativa que quieren un registro literario coherente en tercera persona y pasado, centrado en acciones, cambios emocionales, desarrollo y diálogo significativo. Este estilo comunitario se acredita a Northgate en el Discord de SillyTavern. | Optimiza legibilidad narrativa, no compresión máxima ni categorías claras de referencia. A diferencia de la mayoría de presets generales, su texto integrado no excluye OOC explícitamente, así que revíselo si el OOC es frecuente. |
| **Aelemar** | Escenas importantes de trama y momentos emocionalmente relevantes que deban entenderse como registro independiente incluso sin la escena fuente. Este estilo comunitario se acredita a Aelemar en el Discord de SillyTavern. | Exige al menos 300 palabras y es deliberadamente detallado, por lo que no sirve para ahorro agresivo de tokens. Tampoco excluye OOC explícitamente. |
| **Group** | El Memory Book compartido/omnisciente de un grupo real o el objetivo omnisciente de un flujo multi-libro. Conserva decisiones y estado del grupo atribuyendo acciones, emociones y conocimiento al miembro correcto. | No lo use como Memoria individual de un personaje; se centra intencionadamente en continuidad compartida. |
| **Character** | Un Memory Book centrado en un personaje dentro de un grupo real o flujo multi-personaje. Registra lo que ese personaje hizo, supo, sintió, aprendió, ocultó, malinterpretó o sufrió. | Omite intencionadamente material de escena irrelevante para el personaje objetivo y restringe conocimiento privado no respaldado. |

Para una instalación nueva, use **Summary** hasta que generación y recuperación funcionen con fiabilidad. Después cambie solo el prompt y compare varias Memorias de escenas similares. Prefiera **Comprehensive** si el problema son causalidad omitida, estado de continuidad o keywords débiles; prefiera **Minimal** si el problema es el tamaño de las Memorias. Cambiar prompts no puede compensar un modelo débil, salida truncada, límites de escena deficientes o ajustes de recuperación incorrectos.

El texto exacto integrado puede recrearse para el locale actual de SillyTavern. Recrear los integrados elimina ediciones locales a esos integrados, pero no debería borrar presets personalizados no relacionados. Duplique o exporte un integrado modificado antes de recrearlo.

### 21.3 Objetivo de prompts multi-personaje

Cuando están habilitados prompts separados grupo/personaje, STMB marca el objetivo como:

- `group` para una Memoria canónica de grupo real u omnisciente Narrator;
- `character` para una versión de libro de personaje individual.

El prompt debe usar explícitamente la perspectiva objetivo sin inventar conocimiento no respaldado por la escena y el contexto proporcionado.

### 21.4 Autoría de Side Prompts

Los Side Prompts suelen devolver texto plano o Markdown. Escríbalos como instrucciones de mantenimiento, no como prompts de Memory.

Un Side Prompt fuerte:

- define una sola tarea estrecha;
- explica cómo usar el tracker anterior;
- elimina estado obsoleto;
- impone encabezados estables y límites de longitud;
- devuelve solo el tracker final.

### 21.5 Autoría de Consolidation

La Consolidation normal exige el esquema de la Sección 17.5. Un prompt fuerte:

- conserva cronología;
- crea el menor número coherente de resúmenes;
- asigna cada fuente usada mediante `member_ids`;
- identifica sobrantes mediante `unassigned_items`;
- conserva cambios importantes y continuidad no resuelta;
- usa palabras clave concretas.

El preset dedicado **Regenerate Consolidation** sirve para un único resumen de reemplazo y no puede seleccionarse como default de consolidación normal.

### 21.6 Autoría de Topical Clip

El prompt debe incluir `{{SOURCE_MEMORIES}}`, mantenerse centrado en el tema solicitado, distinguir evidencia de fuente de inferencia, fusionar material nuevo con el contenido existente del Clip y hacer visibles las contradicciones.

### 21.7 Autoría de Compaction

El prompt debe incluir `{{ENTRY_CONTENT}}` y debe acortar sin añadir hechos no respaldados. Debe conservar wrappers estructurales y macros que necesite la entrada.

### 21.8 Checklist para escribir prompts

Antes de terminar cualquier prompt STMB, responda:

1. ¿Qué material es el objetivo real del análisis?
2. ¿Qué material es solo de referencia?
3. ¿Esta ruta espera JSON estricto o texto final?
4. ¿Qué información debe sobrevivir para recuperación posterior?
5. ¿Qué debe omitirse, fusionarse, conservarse o dejarse sin asignar?

La corrección del formato de retorno va antes que el estilo.

---

## 22. Summary Prompt Manager y Consolidation Prompt Manager

### Summary Prompt Manager

Puede crear, editar, duplicar, eliminar, importar y exportar presets normales de Memory. Asigne un preset mediante un perfil de Memory Books.

Todos los presets normales de Memory deben conservar el esquema JSON requerido.

Consulte la Sección 21.2 para la guía de selección y casos de uso de los prompts integrados.

### Consolidation Prompt Manager

Controla los prompts utilizados para agrupar entradas de nivel inferior en resúmenes de nivel superior y selecciona el prompt normal predeterminado de Consolidation.

El preset de Consolidation exclusivo para regeneración no puede usarse para consolidación normal.

### Importación y comportamiento de localización

Los prompts integrados pueden recrearse en el locale actual de la aplicación. Haga copia de seguridad de integrados modificados localmente antes de recrearlos.

---

## 23. STMB y otras extensiones

Las extensiones de SillyTavern se ejecutan en paralelo y pueden leer o modificar los mismos datos de SillyTavern. STMB no anula ni deshabilita otras extensiones, ni establece prioridad sobre ellas. Cuando se solapa el comportamiento de varias extensiones, el resultado final depende de los ajustes y del momento de actuación de cada una.

### 23.1 Visibilidad compartida de los mensajes

Que un mensaje de chat esté oculto forma parte del estado compartido de mensajes de SillyTavern. No es un estado propiedad exclusiva de STMB.

Los ajustes de **Token Saving** de STMB pueden ocultar mensajes procesados después de guardar una Memory. Otra extensión puede volver a mostrar esos mensajes posteriormente, y STMB no lo impedirá. Del mismo modo, **Unhide hidden messages for memory generation** puede mostrar mensajes mientras STMB procesa o regenera un rango seleccionado.

### 23.2 Presence

Tanto la extensión Presence como STMB pueden cambiar el estado oculto o visible de los mensajes de chat. Si Presence muestra mensajes que STMB había ocultado, el ajuste de Token Saving de STMB no se ha borrado ni ignorado; una acción posterior de Presence ha cambiado el mismo estado de mensajes de SillyTavern.

Si usa Presence y quiere que los mensajes ocultados por STMB permanezcan ocultos, utilice la función de bloqueo de mensajes ocultos de Presence. Actualmente, Presence proporciona el comando `/presenceLockHiddenMessages` para este propósito. Ejecútelo para el rango de mensajes correspondiente y repítalo a medida que el rango aumente. Consulte la documentación de Presence para conocer el comportamiento actual del comando.

STMB no configura ni invoca Presence automáticamente, y su gestión de participantes de chats grupales no está relacionada con Token Saving.

### 23.3 Integración con Regex

STMB se integra con la extensión Regex de SillyTavern en dos etapas:

1. **Outgoing/User Input:** transforma el prompt construido antes de enviarlo.
2. **Incoming/AI Output:** limpia o estandariza la respuesta sin procesar antes de analizarla/guardarla.

Active **Use regex (advanced)**, luego abra **Configure regex** y seleccione uno o más scripts para cada dirección.

Importante: la selección propia de STMB controla la ejecución. Un script seleccionado por STMB puede ejecutarse incluso si está deshabilitado en la interfaz normal de la extensión Regex.

Use Regex solo cuando entienda la transformación. Una regla de salida incorrecta puede corromper las instrucciones del esquema requerido; una regla de entrada incorrecta puede corromper JSON válido.

---

## 24. Títulos de entradas de lorebook y política de caracteres

### 24.1 Placeholders de título

Los formatos de título del perfil pueden usar:

- `{{title}}` — título generado por IA;
- `{{scene}}` — rango fuente;
- `{{char}}` — nombre de personaje/grupo;
- `{{user}}` — nombre del usuario;
- `{{messages}}` — cantidad de mensajes de la escena;
- `{{profile}}` — nombre del perfil;
- placeholders compatibles de fecha y hora.

### 24.2 Numeración automática

Los tokens de numeración compatibles incluyen formas como:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB asigna números secuenciales con padding según el formato elegido.

### 24.3 Unicode imprimible

Se permiten todos los caracteres Unicode imprimibles en los títulos, incluidos emoji, texto acentuado, CJK y símbolos. Se eliminan caracteres de control Unicode U+0000–U+001F y U+007F–U+009F.

Los nombres de archivo de lorebook usados por Auto-Create se saneen por separado para caracteres reservados del sistema de archivos y longitud.

---

## 25. Cola de trabajos y controles de reintento

La cola opcional requiere Chat Top Bar / Chat Top Info Bar. Cuando está disponible, regenerar una Memory, Consolidation o Side Prompt crea un trabajo de regeneración; el reemplazo permanece en revisión hasta que se aprueba.

El panel **Memory Books Jobs** puede mostrar:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Los trabajos que procesan un rango de chat muestran los números inicial y final de mensaje en sus filas. El panel también puede cancelar trabajo activo, reabrir trabajos de revisión, inspeccionar fallos, reintentar trabajo y descartar filas terminales del historial.

Ámbitos de reintento:

- **Retry:** vuelve a ejecutar un trabajo que no sea Memory, como un Side Prompt o Consolidation.
- **Retry All:** vuelve a ejecutar/reanuda la Memory y los Side Prompts after-Memory asociados. Si la Memory ya se guardó, STMB puede reanudar desde ese resultado en vez de duplicarla.
- **Retry Memory:** vuelve a ejecutar/reanuda solo la Memory y omite intencionadamente los Side Prompts after-Memory.

Use Retry All para restaurar el flujo combinado; use Retry Memory cuando el trabajo de tracker no deba ejecutarse.

Sin Chat Top Bar, STMB sigue realizando sus flujos normales, pero carece de la interfaz de cola.

---

## 26. Retroalimentación visual y accesibilidad

STMB ofrece estados visuales para los controles de escena, incluidos inactivo, seleccionado, rango válido, dentro de escena y procesando. Los colores exactos dependen del tema de SillyTavern.

El soporte de accesibilidad incluye:

- navegación por teclado;
- indicadores de foco;
- atributos ARIA;
- comportamiento de movimiento reducido;
- controles adaptados a móvil.

Al enseñar desde una captura, describa el icono y la etiqueta visibles en vez de depender de un color concreto.

---

## 27. Mapa de ajustes y referencia de ajustes actuales

Esta sección es el mapa de ajustes. Identifica dónde se encuentra cada control de configuración de STMB orientado al usuario y qué controla. También enumera controles importantes guardados y de una sola ejecución en interfaces especializadas. Los campos de contenido de una sola vez utilizados solo para crear un Clip, Topical Clip, Compaction o preview concreto se documentan en sus secciones de flujo en vez de repetirse aquí.

La ruta inicial habitual es:

**menú Extensions de la varita mágica junto al campo de chat → Memory Books**

Todas las rutas siguientes comienzan en el panel principal de **Memory Books**, salvo que indiquen explícitamente **SillyTavern**. Un control puede estar oculto o deshabilitado cuando no corresponde al chat, proveedor, perfil o modo de almacenamiento actual.

Ámbitos:

- **Global:** se aplica a todo STMB salvo override más específico.
- **Per chat:** guardado para el chat o grupo actual.
- **Per character:** sigue la tarjeta de personaje entre chats compatibles.
- **Per profile/template/setting:** guardado en ese objeto reutilizable.
- **Per run:** afecta únicamente a la operación que se prepara.

### 27.1 Panel principal: almacenamiento, modo de chat y perfil activo

| Ajuste | Ubicación | Ámbito | Qué hace |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Modo global; elección del libro por chat | Deja de usar el lorebook normal vinculado al chat como objetivo automático de STMB y exige seleccionar un Memory Book para el chat actual. No puede habilitarse junto con Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; visible en Manual Mode | Per chat | Elige el Memory Book principal que recibe Memorias de este chat. En Narrator Mode es el libro omnisciente. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; visible en grupo real usando Manual Mode | Per chat | Asigna un Memory Book separado a cada miembro real del grupo. STLO es necesario para configurar estas asignaciones y recuperación filtrada por personaje. |
| **Character Memory Book lock** | Icono de candado junto a la asignación | Per character | Mantiene esa tarjeta asignada al mismo Memory Book en chats compatibles de Manual Mode. Desbloquee antes de cambiar. |
| **Narrator Mode** | **Current Lorebook Configuration**; solo chats normales no grupales | Per chat | Usa el libro manual seleccionado como Memory Book omnisciente y habilita personajes ficticios declarados con libros únicos propios. Requiere Manual Mode y libro omnisciente. |
| **Manage Narrator Cast** | Bajo **Narrator Mode**; también desde Active Cast | Per chat | Añade, retira, restaura y asigna libros únicos a personajes Narrator declarados. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | En Automatic Mode crea y vincula un lorebook si el chat no tiene ninguno. No puede habilitarse con Manual Mode. |
| **Lorebook Name Template** | Directamente bajo Auto-create | Global | Nombra libros autocreados. Admite `{{char}}`, `{{user}}`, `{{chat}}`. Solo se usa con Auto-Create. |
| **Memory profile selection** | Selector **Memory Profiles** | Per run | Elige el perfil para la siguiente Memory y acciones adyacentes. La selección sola no cambia el default guardado. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | Hace que el perfil seleccionado sea el predeterminado para Memorias automáticas y otros flujos salvo selección específica. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**, o **Profile Actions → Edit Profile** | Per profile | Formatea títulos nuevos y numeración opcional con macros. El control del panel principal modifica el formato del perfil default; Edit Profile cambia el perfil seleccionado. |

### 27.2 General Settings

Abra **Settings → General Settings**.

| Ajuste | Ámbito | Qué hace |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Omite la confirmación normal previa a generación. Requerido para catch-up no interactivo; otros avisos y previews habilitados aún pueden aparecer. |
| **Automatically accept detected participants in future** | Global | Deja de pedir confirmación de participantes de grupo real y acepta la detección de STMB. |
| **Show memory previews** | Global | Abre revisión editable antes de guardar Memorias generadas y Side Prompt aplicable. |
| **Show consolidation previews** | Global | Abre revisión de candidatos de Consolidation antes de confirmar. |
| **Show notifications** | Global | Habilita notificaciones toast de STMB. |
| **Show floating Clip button when text is highlighted** | Global | Muestra tijeras flotantes tras seleccionar texto de chat. |
| **Memory boundary indicator** | Global | Muestra ninguno, divisor, botón arrastrable o ambos. |
| **Allow scene overlap** | Global | Permite que un rango de escena se solape con IDs ya representados por una Memory. |
| **Refresh lorebook editor after adding memories** | Global | Actualiza un editor abierto después de escribir entradas. |
| **Copy Memory Books when branching** | Global | Da a una rama nativa copias independientes de libros activos desbloqueados. Los libros bloqueados por personaje siguen compartidos por diseño. |
| **Default for solo chats** | Global | Selecciona el Side Prompt Set heredado por chats individuales después de Memory. Vacío usa prompts after-Memory habilitados individualmente. |
| **Default for group chats** | Global | Igual para grupos reales. |
| **Max Response Tokens** | Global | Sustituye longitud máxima de salida de generación STMB. Auméntelo si JSON válido se corta; `0` deja el comportamiento normal como fallback. |
| **Token Warning Threshold** | Global | Muestra aviso si la solicitud estimada supera el umbral. No cambia el límite real del modelo. |
| **Default Previous Memories Count** | Global | Default de 0–7 Memorias previas como continuidad. Puede sustituirse por ejecución en Advanced Memory Options. |
| **Use regex (advanced)** | Global | Habilita selección propia de procesamiento Regex de STMB. |
| **Configure regex… → Outgoing scripts** | Global | Selecciona scripts aplicados antes de enviar material. |
| **Configure regex… → Incoming scripts** | Global | Selecciona scripts aplicados a la respuesta antes de analizar/guardar. |

#### Token Saving dentro de General Settings

| Ajuste | Ámbito | Qué hace |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Elige no ocultar, ocultar todo lo procesado hasta la última Memory o solo el rango de la última Memory. Ocultar es reversible y no elimina mensajes. |
| **Messages to leave unhidden** | Global | Mantiene este número de mensajes recientes visibles al auto-ocultar. `0` oculta hasta el final aplicable. |
| **Unhide hidden messages for memory generation** | Global | Ejecuta el equivalente de `/unhide X-Y` para la fuente antes de compilarla. El modo auto-hide decide qué se vuelve a ocultar tras guardar. |

### 27.3 Automatic Memories y recordatorios de Consolidation

Abra **Settings → Automatic Memories**.

| Ajuste | Ámbito | Qué hace |
|---|---|---|
| **Auto-create memory summaries** | Global | Habilita creación automática estilo `/nextmemory`. Sin línea base, STMB actual puede empezar en 0; una primera Memory manual sigue recomendada. |
| **Auto-Summary Interval** | Global | Define cuántos mensajes componen la cadencia automática. |
| **Auto-Summary Buffer** | Global | Excluye esta cantidad de mensajes más recientes de un rango listo. |
| **Prompt for consolidation when a tier is ready** | Global | Muestra yes/later al alcanzar el mínimo de fuentes. Nunca consolida silenciosamente. |
| **Auto-Consolidation Tiers** | Global | Elige niveles objetivo vigilados. El mínimo por nivel se guarda en Consolidate Memories. |

### 27.4 Editor de perfiles

Elija un perfil en **Memory Profiles** y abra **Profile Actions → Edit Profile**. Estos ajustes son **per profile** salvo indicación. El perfil integrado Current SillyTavern Settings bloquea deliberadamente campos controlados por SillyTavern.

| Ajuste | Qué hace |
|---|---|
| **Profile Name** | Nombra el perfil reutilizable. El nombre del integrado está bloqueado. |
| **API/Provider** | Elige routing de SillyTavern actual, proveedor compatible, Custom OpenAI-compatible o Full Manual Configuration. |
| **Use this connection profile** | Para Custom OpenAI-Compatible API usa la conexión activa o una Custom con nombre. URL/secreto vienen de ella, mientras Model de STMB sigue siendo override. |
| **Skip structured output and use plain-text completion** | Deja de enviar esquema estructurado si el proveedor lo rechaza. El prompt sigue debiendo producir JSON válido. |
| **Use ST’s ChatCompletionService** | Enruta mediante helper de Chat Completion de ST. No disponible para Full Manual. |
| **Chat Completion Preset** | Aplica opcionalmente un preset de SillyTavern mediante ChatCompletionService. |
| **Model** | ID exacto del modelo. Current SillyTavern Settings usa el modelo activo. |
| **Temperature** | Aleatoriedad de generación. Current SillyTavern Settings usa la temperatura activa. |
| **Use reverse proxy** | Pasa los detalles de reverse proxy de SillyTavern en proveedores compatibles. |
| **API Endpoint URL / API Key** | Endpoint/credencial separados solo para Full Manual Configuration. |
| **Memory Creation Method** | Selecciona el Summary Prompt para Memory normal. |
| **Use separate group and character prompts in group chats** | Usa presets distintos para libro grupal y libros centrados en personaje. |
| **Group Summary Prompt / Character Summary Prompt** | Selecciona esos dos presets. |
| **Memory Title Format** | Controla texto, macros y numeración de títulos. |
| **Activation Mode** | Guarda como Normal, Constant o Vectorized. |
| **Insertion Position** | Elige posición relativa a Character, Example Messages, Author's Note u Outlet. |
| **Outlet Name** | Nombre del Outlet si corresponde. |
| **Insertion Order** | Auto deriva del número; Manual usa valor fijo; Reverse cuenta hacia abajo para Outlets. |
| **Prevent Recursion** | Impide que contenido de la entrada active otras entradas por escaneo recursivo. |
| **Delay Until Recursion** | Evita activación en el primer pase. Déjelo apagado si nada más puede iniciar recursión. |
| **Also include** | Solo compatibilidad con perfiles heredados; la configuración actual usa Context Settings por chat. |

El proveedor, modelo, temperatura, preset de conexión y reverse proxy activos de SillyTavern se configuran en SillyTavern, no en STMB. Current SillyTavern Settings lee esos valores en vivo.

### 27.5 Context Settings

Abra **Settings → Context Settings**.

| Ajuste | Ámbito | Qué hace |
|---|---|---|
| **Additional Context for this chat** | Per chat | Selecciona un Context Setting, guarda explícitamente No Context o deja sin establecer para prompting de migración. |
| **Context Setting Name** | Per Context Setting | Nombra una colección reutilizable. |
| **Additional Context entries and order** | Per Context Setting | Selecciona entradas de lorebook y su orden. Entradas ausentes se avisan y omiten. |

**New**, **Duplicate**, **Delete**, **Import JSON** y **Export JSON** administran Context Settings; no cambian generación hasta que uno es seleccionado por un chat o Side Prompt.

### 27.6 Trackers & Side Prompts

Abra **Settings → Trackers & Side Prompts**.

| Ajuste | Ubicación/ámbito | Qué hace |
|---|---|---|
| **After-memory side prompt mode for this chat** | Pantalla principal; per chat | Usa default solo/grupo, prompts habilitados individualmente o un Side Prompt Set concreto. |
| **How many concurrent prompts to run at once** | Principal; global | Limita trabajos simultáneos de Side Prompt a 1–10. |
| **Side Prompt Set Name** | New Set o editar; per set | Nombra un grupo ordenado reutilizable. |
| **Side Prompt / Row Label / Macro Values** | Fila de set; per set | Elige plantilla, etiqueta opcional, valores de macro y orden. |
| **Enabled** | Editor de Side Prompt; per template | Hace la plantilla elegible en modo individual. Los triggers siguen decidiendo cuándo corre. |
| **Run on visible message interval / Interval** | Editor; per template | Ejecuta tras número configurado de mensajes visibles. |
| **Run automatically after memory** | Editor; per template | Ejecuta tras Memory correcta, sujeto al modo/set del chat. |
| **Allow manual run via `/sideprompt`** | Editor; per template | Permite ejecución manual explícita. |
| **Prompt / Response Format** | Editor; per template | Define instrucción y estructura opcional. |
| **Previous memories for context** | Editor; per template | Incluye 0–7 Memorias previas. |
| **Use additional context / Additional Context Source** | Editor; per template | Sigue el Context Setting del chat o usa uno fijo. |
| **Lorebook Target** | Editor; per template o chat | Guarda en Memory Book normal u otro lorebook. Al cambiar pregunta alcance chat vs plantilla. |
| **Lorebook Entry Title Override / Keywords** | Editor; per template | Controla opcionalmente título upsert y keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Editor; per template | Controla activación y colocación. |
| **Insertion Order / Order Value** | Editor; per template | Orden automático o valor manual fijo. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Editor; per template | Aplica flags correspondientes de lorebook. |
| **Override default memory profile / Connection Profile** | Editor; per template | Enruta este Side Prompt por perfil STMB seleccionado. |
| **Memory Assistance Mode** | Editar Memory Assistance; global | Off, Update, Update and Suggest o Automatic según Sección 16.5. |
| **Update Prompt / Topic Suggestions Prompt** | Memory Assistance | Controla sus dos tareas IA; contratos de respuesta fijos. |
| **Use a connection profile override** | Memory Assistance | Usa perfil STMB seleccionado en vez del default. |

### 27.7 Prompt managers

| Ajuste | Ubicación | Ámbito | Qué hace |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** o editar | Per preset | Define prompt reutilizable de Memory. Un perfil lo usa cuando lo selecciona. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Selecciona el prompt normal preseleccionado por Consolidate Memories. Presets solo-regeneration y solo-group no son seleccionables. |
| **Consolidation Prompt name and prompt text** | Manager → New Consolidation Preset o editar | Per preset | Define instrucciones reutilizables de Consolidation. |

### 27.8 Defaults de Topical Clip y Compaction

Abra **Settings → Topical Clip** o **Settings → Compaction**.

| Ajuste | Ubicación | Ámbito | Qué hace |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | Topical Clip o Compaction | Global compartido | Selecciona perfil STMB para ambos flujos. Cambiarlo en uno cambia la selección compartida. |
| **Topical Clip Prompt** | Topical Clip → Edit Topical Clip Prompt | Global | Guarda prompt personalizado. Reset to Default vuelve al integrado actual. Se validan macros de fuente requeridas. |
| **Compaction Prompt** | Compaction → Edit Compaction Prompt | Global | Guarda prompt personalizado. `{{ENTRY_CONTENT}}` es obligatorio. |

Memory Book, tema, keywords, inclusión/selección de fuentes, rango de mensajes, borrador y entrada de Compaction son decisiones per-run, no ajustes persistentes.

### 27.9 Controles de Consolidate Memories

Abra **Consolidate Memories** desde los botones inferiores del panel principal.

| Ajuste | Ámbito | Qué hace |
|---|---|---|
| **Target tier** | Per run | Elige nivel superior y, por tanto, nivel fuente inmediatamente inferior elegible. |
| **Consolidation Prompt** | Per run | Elige prompt para esta ejecución; inicialmente usa el default del manager. |
| **Maximum entries per pass** | Per run | Limita entradas enviadas en un pase. |
| **Token Budget** | Per run | Presupuesto aproximado de entrada para batches. |
| **Number of automatic summary attempts** | Per run | Limita pases repetidos de análisis. |
| **Saved minimum eligible entries** | Global por tier | Define cuándo el tier se considera preparado y dispara su aviso. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Defaults globales de entradas consolidadas | Controla cómo se guardan nuevas entradas consolidadas, separado de perfiles Memory normales. |
| **Disable selected source entries after creating summaries** | Per run | Deshabilita fuentes correctamente consolidadas; no las elimina. |
| **Selected source entries** | Per run | Elige qué fuentes elegibles se procesan. |

### 27.10 Ajustes relacionados de SillyTavern World Info

Estos controles están fuera de STMB pero afectan recuperación normal:

| Ajuste | Qué hace |
|---|---|
| **Match Whole Words** | Controla coincidencia de límites. Off es inicio común para keywords flexibles. |
| **Scan Depth** | Cuánto texto reciente se escanea. Un valor relativamente alto como 8 es un inicio común. |
| **Max Recursion Steps** | Limita activación recursiva. Aproximadamente 2 es común. |
| **Context percentage / lorebook budget** | Limita contexto ocupado por lorebook. Auméntelo solo equilibrándolo con contexto total y demás material. |

Son recomendaciones, no requisitos estrictos; consulte Sección 10.

---

## 28. Referencia de comandos slash

### Comandos Memory

```text
/creatememory
```

Crea una Memory a partir de la escena marcada.

```text
/scenememory X-Y
```

Establece rango inclusivo y crea una Memory, por ejemplo `/scenememory 10-15`.

```text
/nextmemory
```

Crea una Memory desde el mensaje posterior al límite procesado más alto hasta el final elegible actual.

```text
/stmb-catchup interval=x start=y end=z
```

Procesa un chat largo existente en fragmentos consecutivos.

### Comandos Side Prompt

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Comandos de límite procesado

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Parada de emergencia

```text
/stmb-stop
```

Detiene toda generación STMB en curso en todas partes, incluidos Side Prompts. El trabajo ya confirmado permanece guardado.

---

## 29. Solución de problemas por etapa

### 29.1 La extensión/UI no se cargó

Síntomas:

- Memory Books no aparece en la varita;
- no aparecen chevrones;
- no aparece botón Clip después de seleccionar.

Comprobaciones:

1. extensión instalada y habilitada;
2. página recargada;
3. chat de personaje/grupo abierto;
4. esperar hasta diez segundos;
5. ampliar acciones de mensaje;
6. revisar consola solo después.

### 29.2 No hay escena seleccionada

Se requieren **►** y **◄**. Verifique Current Scene.

Si el rango solapa una Memory existente, elija otro rango o habilite Allow Scene Overlap.

### 29.3 No hay Memory Book válido

Automatic Mode:

- vincule un lorebook al chat; o
- habilite Auto-Create.

Manual Mode:

- seleccione libro manual principal;
- repare una selección eliminada;
- desbloquee un bloqueo roto antes de cambiarlo.

Grupo real multi-libro:

- STLO debe estar disponible;
- cada miembro requerido necesita asignación válida;
- el libro del grupo no puede reutilizarse como libro de personaje.

Narrator Mode:

- Manual Mode habilitado;
- libro omnisciente seleccionado;
- cada miembro declarado con libro único no omnisciente.

### 29.4 La IA no produjo una Memory válida

Compruebe en orden:

1. proveedor/modelo/perfil válidos;
2. respuesta no truncada;
3. suficientes tokens máximos;
4. prompt aún exige JSON exacto;
5. Regex no corrompió esquema;
6. proveedor admite modo estructurado seleccionado;
7. use Skip Structured Output solo si rechaza esquemas;
8. pruebe modelo más obediente antes de reescribir prompt;
9. haga clic en **Raw response from AI** en la notificación persistente para inspeccionar respuesta y usar corrección JSON manual si está disponible.

Causas comunes: code fences, comentario adicional, clave faltante, keywords no-array, rechazo o salida cortada.

### 29.5 Memory guardada pero mensajes desaparecieron

Probablemente se auto-ocultaron. Cambie Token Saving. Los mensajes ocultos no están eliminados.

### 29.6 Automatic Memories no se ejecutaron

Compruebe:

- Auto-create memory summaries habilitado;
- suficientes mensajes tras límite procesado;
- intervalo + buffer satisfechos;
- sin checkpoint de postpone;
- Memory Book válido;
- ningún otro trabajo Memory bloqueando trigger;
- no se cambió de chat durante trabajo;
- generación grupal terminó antes del trigger.

La primera Memory manual se recomienda, pero ya no es técnicamente obligatoria.

### 29.7 Memory existe pero no se activa

Compruebe:

- libro correcto activo;
- entrada habilitada;
- keywords pertinentes;
- modo de activación;
- presupuesto;
- recursión y Delay Until Recursion;
- routing STLO si se usa;
- inspección/logs World Info.

No regenere la Memory hasta haber probado recuperación.

### 29.8 Entrada enviada pero ignorada

Es comportamiento del modelo. Posibles respuestas:

- hacer Memory más corta y explícita;
- mejorar posición/prioridad;
- reducir contexto competidor;
- usar recordatorio OOC;
- elegir modelo que siga mejor contexto.

### 29.9 Side Prompt no se ejecutó

Consulte Sección 16.18. En particular, un set seleccionado suprime prompts individualmente habilitados fuera de él.

### 29.10 Consolidation no mostró aviso

Verifique:

- readiness prompt habilitado;
- tier objetivo monitorizado;
- suficientes fuentes elegibles;
- fuentes no ya deshabilitadas/inelegibles;
- mínimo guardado alcanzado.

### 29.11 Botón Regeneration deshabilitado

Inspeccione la razón. Causas comunes:

- entrada anterior a metadatos snapshot necesarios;
- chat/rango fuente no disponible;
- fuentes faltantes/tier incorrecto;
- parent consolidation activo bloquea fuente inferior;
- no se puede determinar número de secuencia;
- plantilla Side Prompt eliminada.

### 29.12 La rama no copió libros

Compruebe:

- Copy Memory Books when branching estaba habilitado antes;
- era rama nativa;
- libros fuente existían y cargaban;
- no se cambió de chat;
- rama no estaba marcada previously completed/failed;
- libros bloqueados se preservaron intencionadamente, no se copiaron.

### 29.13 El elenco de Narrator Mode es incorrecto

Compruebe:

- Active Cast antes de generación;
- si una continuation fusionó metadatos;
- si un swipe restauró estado anterior;
- si hay mensajes heredados sin etiquetas;
- si personaje está retirado;
- si cada libro aún existe.

---

## 30. Preguntas frecuentes

### ¿Necesito vectores?

No. La activación por keywords es suficiente y se genera automáticamente. Vectors es opcional.

### ¿Deben las Memorias usar un lorebook separado?

Normalmente sí por organización, presupuesto, reutilización y diagnóstico, pero no es obligatorio.

### ¿STMB elimina mensajes?

No. Puede ocultar mensajes procesados del contexto activo.

### ¿Puedo usar STMB completamente de forma manual?

Sí. Marque escenas y cree Memorias solo cuando quiera.

### ¿Automatic Memories puede crear la primera Memory?

Sí en STMB actual. Sin baseline procesado, comienza en mensaje 0 una vez cumplidos intervalo + buffer. Una primera ejecución manual sigue recomendada para verificar setup y elegir límite inicial.

### ¿Consolidation se ejecuta automáticamente?

No. STMB puede avisar cuando un tier está preparado, pero el usuario confirma y revisa.

### ¿Puede un grupo real usar un solo Memory Book?

Sí. Es la disposición inicial recomendada y no requiere STLO.

### ¿Cuándo son útiles libros separados de personaje?

Cuando continuidad individual, conocimiento, recuperación específica por hablante o resúmenes centrados en personaje justifican configuración y solicitudes adicionales.

### ¿Narrator Mode es lo mismo que Group Chat Mode?

No. Group Chat Mode lee autores de tarjetas separadas. Narrator Mode declara manualmente personajes ficticios escritos por una tarjeta Narrator.

### ¿Narrator Mode requiere STLO?

No para su ruta de Active Cast. Sí requiere Manual Lorebook Mode, un libro omnisciente y libros únicos por personaje.

### ¿Las copias vinculadas se sincronizan?

No. Están vinculadas por metadatos de origen/consolidación, no por espejo continuo.

### ¿Por qué Delay Until Recursion suele estar desactivado?

Si ninguna otra entrada inicia recursión, una Memory retrasada puede nunca activarse.

### ¿Qué hacer tras la primera Memory correcta?

Verifique recuperación, luego habilite Memorias automáticas, elija intervalo/buffer, active ocultado de tokens y añada Clips o un Side Prompt estrecho solo si hace falta. Use Topical Clip y Consolidation cuando ya haya suficientes Memorias.

---

## 31. Compatibilidad, migración y notas históricas vigentes

Esta sección conserva solo historia que afecta al uso actual.

### Baseline actual

- Versión documentada actual: v8.5.0, 1 de agosto de 2026.
- Requisito SillyTavern: 1.14.0 o posterior.
- Narrator Mode se añadió en v8.5.0.
- Copia de libros al ramificar, regeneración de Side Prompt y bloqueos de Memory Book de personaje se añadieron en v8.4.0.
- Distribución multi-personaje para grupos reales llegó en v8.0.0.
- Additional Context pasó de perfiles a Context Settings por chat reutilizables en v7.0.0; contexto antiguo se migra.
- Topical Clip se añadió en v6.10.0.
- Compaction y Clips se añadieron en v6.6.0.
- Side Prompt Sets y objetivos por prompt se añadieron en v6.4–v6.5.
- Consolidation pasó a sistema multi-tier Arc-through-Epic en v6.0.0; metadatos Arc antiguos se migran.
- Job Queue se añadió en v6.8.0 y sigue opcional.
- Los defaults de perfiles actuales usan Delay Until Recursion deshabilitado salvo cambio explícito.

### Memorias existentes de versiones antiguas

Solo entradas con flag `stmemorybooks` y metadatos necesarios se reconocen como STMB Memories. Use el conversor de lorebook incluido para entradas antiguas previas a metadatos actuales.

### Funcionalidad eliminada

La antigua función bookmark fue retirada de Memory Books en v4.0.0 y separada del núcleo. No enseñe controles bookmark de Memory Books como comportamiento actual.

### Integrados localizados

Los prompts integrados pueden regenerarse según el idioma activo de SillyTavern. Haga copia de seguridad de integrados personalizados antes de recrearlos.

### Comportamiento de importación

La importación de Side Prompt es aditiva. Los prompts existentes se conservan; conflictos de clave importados se renombran en vez de sobrescribir.

---

## 32. Notas para desarrolladores y licencia

Memory Books usa Bun para bundling/minificación.

```sh
bun run build
```

Instale el hook pre-commit del repositorio con:

```sh
bun run install-hooks
```

El hook construye antes del commit, añade artefactos de build al staging y aborta si falla la build.

Memory Books es Copyright © 2024–2026 Aiko Hanasaki y está licenciado bajo GNU Affero General Public License v3.0. Las versiones modificadas deben conservar los avisos aplicables, identificar modificaciones y cumplir los requisitos de disponibilidad de código fuente de AGPL.

---

## 33. Árbol de diagnóstico compacto

```text
El usuario dice «Memory Books no funciona».
│
├─ ¿Está visible el menú/control?
│  ├─ No → comprobaciones de instalación/carga/UI.
│  └─ Sí
│
├─ ¿Se puede seleccionar una escena?
│  ├─ No → ampliar acciones; colocar ambos chevrones; revisar solapamiento.
│  └─ Sí
│
├─ ¿Hay un Memory Book efectivo válido?
│  ├─ No → vincular, auto-crear, seleccionar manual o reparar asignaciones multi-libro.
│  └─ Sí
│
├─ ¿La generación devuelve salida válida y completa?
│  ├─ No → perfil, proveedor, tokens de salida, esquema JSON, Regex, modelo.
│  └─ Sí
│
├─ ¿Existe la entrada en el libro previsto?
│  ├─ No → fallo de guardado/rollback/permisos/trabajo.
│  └─ Sí
│
├─ ¿SillyTavern la activa y envía después?
│  ├─ No → keywords, modo de activación, vinculación, presupuesto, recursión, STLO.
│  └─ Sí
│
└─ ¿El modelo usa la entrada suministrada?
   ├─ No → cumplimiento del modelo, colocación, contexto competidor, claridad.
   └─ Sí → el flujo funciona.
```

---

## 34. Secuencia mínima de enseñanza recomendada

Para un usuario nuevo, enseñe solo esta secuencia al principio:

1. Abra la varita y encuentre Memory Books.
2. Use Automatic Mode con libro vinculado o habilite Auto-Create.
3. Seleccione Current SillyTavern Settings.
4. Amplíe acciones y marque una escena corta completa con **►** y **◄**.
5. Cree y revise una Memory.
6. Abra el Memory Book y verifique la entrada guardada.
7. Verifique que la entrada pueda activarse posteriormente.
8. Habilite Automatic Memories y elija intervalo/buffer.
9. Habilite auto-hide solo después de explicar que ocultar no elimina.
10. Introduzca Clips, luego Side Prompts, luego Topical Clip/Consolidation solo cuando exista una necesidad concreta.

No empiece con prompts personalizados, endpoints Full Manual, varios libros de personaje, Regex ni Consolidation salvo que el problema real del usuario lo requiera.

---

## 35. Resumen conceptual final

Memory Books es un pipeline externo de continuidad construido sobre lorebooks de SillyTavern:

```text
Seleccionar o programar material del chat
→ generar una representación estructurada
→ guardarla con metadatos de recuperación
→ ocultar opcionalmente la transcripción procesada
→ dejar que SillyTavern recupere entradas pertinentes más tarde
```

El sistema funciona mejor cuando:

- las escenas son coherentes;
- los prompts distinguen claramente objetivo y contexto de referencia;
- los flujos JSON devuelven esquemas exactos;
- las palabras clave son concretas;
- los Memory Books se asignan y activan deliberadamente;
- los trackers de larga duración podan estado obsoleto;
- Consolidation reduce detalle antiguo sin borrar continuidad;
- los usuarios verifican recuperación en vez de asumir que «guardado» significa «enviado»;
- el routing avanzado multi-libro solo se usa cuando su precisión compensa la complejidad.
