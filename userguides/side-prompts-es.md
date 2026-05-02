# 🎡 Side Prompts

Los Side Prompts son ejecuciones adicionales de prompts de STMB para el mantenimiento del chat. Pueden analizar, rastrear, resumir, limpiar o actualizar notas de apoyo sin obligar a la respuesta normal del personaje a hacer todo ese trabajo.

Úsalos cuando un chat necesite un tracker continuo, un informe de relación, una lista de tramas, un registro de inventos, una ficha de estado de NPCs, una línea temporal o un documento de apoyo similar. El personaje puede seguir roleando. El Side Prompt se encarga del papeleo. ❤️

## Tabla de contenidos

- [Qué son los Side Prompts](#qué-son-los-side-prompts)
- [Cuándo usarlos](#cuándo-usarlos)
- [Guía rápida de configuración](#guía-rápida-de-configuración)
- [Cómo funcionan las ejecuciones](#cómo-funcionan-las-ejecuciones)
- [Ejecuciones manuales](#ejecuciones-manuales)
- [Ejecuciones automáticas después de la memoria](#ejecuciones-automáticas-después-de-la-memoria)
- [Side Prompt Sets](#side-prompt-sets)
- [Macros](#macros)
- [Rangos de mensajes](#rangos-de-mensajes)
- [Cómo escribir buenos Side Prompts](#cómo-escribir-buenos-side-prompts)
- [Ejemplos](#ejemplos)
- [Solución de problemas](#solución-de-problemas)
- [Puntos clave](#puntos-clave)

---

## Qué son los Side Prompts

Un Side Prompt es un prompt con nombre que se ejecuta por separado de la respuesta normal del personaje.

Puede producir o actualizar:

- trackers de trama
- trackers de relaciones
- notas de NPCs o facciones
- listas de inventario o recursos
- líneas temporales
- tableros de misterios o pistas
- trackers de inventos o proyectos
- informes de continuidad
- notas de limpieza
- entradas de apoyo estilo lorebook

Los Side Prompts son distintos de las memorias normales. Las memorias suelen guardar resúmenes de escenas en secuencia. Los Side Prompts suelen mantener un documento de estado continuo que se actualiza o sobrescribe.

Tampoco tienen que devolver **JSON**. El texto plano y Markdown están bien, salvo que tu prompt específico o tu destino de guardado exija algo más estricto.

---

## Cuándo usarlos

Usa Side Prompts para trabajo de apoyo estructurado.

Buenos usos:

- **Puntos de trama:** hilos activos, hilos resueltos, cabos sueltos
- **Relaciones:** confianza, tensión, atracción, límites, objetivos
- **NPCs:** qué sabe cada NPC, qué quiere, qué hizo recientemente o qué necesita después
- **Línea temporal:** fechas, viajes, heridas, plazos, cuentas regresivas
- **Estado del mundo:** ubicaciones, objetos, facciones o recursos que cambiaron
- **Misterios:** pistas, sospechosos, contradicciones, preguntas sin respuesta
- **Proyectos:** inventos, investigación, bloqueos, desviaciones de alcance, próximos pasos
- **Continuidad:** riesgos probables de alucinación o contexto faltante

Malos usos:

- cualquier cosa que deba aparecer dentro de la siguiente respuesta del personaje
- prompts vagos de “haz que la historia sea mejor”
- prompts gigantes de análisis que producen ensayos en cada ejecución
- resúmenes de memoria duplicados sin una tarea separada

Los Side Prompts no son magia. Un Side Prompt vago solo es vaguedad organizada.

---

## Guía rápida de configuración

¿Necesitas la versión paso a paso con clics? Usa el [tutorial de Scribe para activar Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

La ruta corta es: abre **Extensions**, abre **Memory Books**, haz clic en **Side Prompts**, elige el prompt que quieras, actívalo, opcionalmente activa **Run automatically after memory**, luego pulsa **Save** y **Close**.

---

## Cómo funcionan las ejecuciones

Una ejecución normal de Side Prompt sigue este flujo básico:

1. STMB elige los mensajes que debe revisar.
2. Se prepara el Side Prompt.
3. Se rellenan las macros necesarias.
4. El modelo genera la salida del Side Prompt.
5. STMB revisa la salida.
6. El resultado se previsualiza, guarda, actualiza o salta según los ajustes del Side Prompt.

Los Side Prompts manuales, los Side Prompts después de la memoria y las filas de Side Prompt Sets deberían sentirse como el mismo sistema. Comparten el mismo comportamiento general de ejecución para previsualizaciones, lotes, comprobaciones de respuestas en blanco, guardados, manejo de detención y notificaciones.

---

## Ejecuciones manuales

Usa `/sideprompt` para ejecutar un Side Prompt manualmente.

Forma básica:

```txt
/sideprompt "Nombre del prompt"
```

Con un rango de mensajes:

```txt
/sideprompt "Nombre del prompt" 10-20
```

Con una macro de ejecución:

```txt
/sideprompt "Tracker de relación" {{npc name}}="Alice" 10-20
```

Usa comillas alrededor de los nombres de prompts que tengan espacios.

Las ejecuciones manuales son mejores para comprobaciones puntuales, actualizaciones dirigidas y prompts que necesitan valores de macro personalizados.

---

## Ejecuciones automáticas después de la memoria

Algunos Side Prompts pueden ejecutarse automáticamente después de que se cree una memoria.

Esto es útil cuando un tracker debe mantenerse actualizado a medida que el chat se desarrolla. Por ejemplo, un tracker de relación o un tracker de trama puede actualizarse después de cada memoria.

Hay dos modos después de la memoria:

- **Usar side prompts activados individualmente** — comportamiento antiguo; puede ejecutarse cualquier Side Prompt que tenga activado **Run automatically after memory**.
- **Usar un Side Prompt Set con nombre** — se ejecuta el set seleccionado en su lugar.

Un Side Prompt Set seleccionado reemplaza los Side Prompts después de la memoria activados individualmente. No se suma a ellos. Eso evita ejecuciones duplicadas causadas por casillas antiguas que los usuarios olvidaron desactivar.

---

## Side Prompt Sets

Los Side Prompt Sets agrupan varios Side Prompts en un flujo de trabajo ordenado.

Un set es una lista ordenada de ejecuciones, no solo una carpeta. El mismo Side Prompt puede aparecer más de una vez con valores de macro distintos.

Ejemplo de set:

1. Tracker de relación con `{{npc name}} = Alice`
2. Tracker de relación con `{{npc name}} = Bob`
3. Tracker de puntos de trama
4. Notas de limpieza de escena

Esto permite que una plantilla de prompt mantenga entradas separadas para distintos NPCs, facciones, ubicaciones o proyectos.

### Administrar sets

Abre **🎡 Trackers & Side Prompts** para crear, editar, duplicar, eliminar o reordenar sets.

Cada fila puede incluir:

- un Side Prompt
- una etiqueta de fila opcional
- valores de macro guardados
- controles para duplicar/eliminar
- controles para mover arriba/abajo

Las filas se ejecutan de arriba abajo. Coloca primero los trackers fundamentales y deja los prompts de limpieza o informe para después.

### Ejecutar un set manualmente

Ejecuta un set con valores guardados:

```txt
/sideprompt-set "Nombre del set"
```

Con un rango:

```txt
/sideprompt-set "Nombre del set" 10-20
```

Ejecuta un set reutilizable con valores de macro:

```txt
/sideprompt-macroset "Pasada de relaciones" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Usa `/sideprompt-macroset` cuando el set tenga tokens reutilizables que todavía necesiten valores.

### Sets o filas faltantes

Los Side Prompt Sets son estrictos a propósito:

- Si no hay ningún set seleccionado, se usa el comportamiento después de la memoria activado individualmente.
- Si hay un set seleccionado, se ignoran los prompts después de la memoria activados individualmente.
- Si el set seleccionado fue eliminado, no se ejecuta nada y STMB te advierte.
- Si una fila apunta a un prompt eliminado, esa fila se salta y STMB te advierte.
- Si una fila todavía necesita un valor de macro, esa fila se salta y STMB te advierte.

Un fallback silencioso sería peor. Si un flujo de trabajo seleccionado se rompió, deberías saberlo.

---

## Macros

Los Side Prompts pueden usar macros normales de SillyTavern, como `{{user}}` y `{{char}}`.

También pueden usar macros de ejecución, que son marcadores de posición rellenados cuando se ejecuta el Side Prompt.

Ejemplo de macro de ejecución:

```txt
{{npc name}}
```

Ejecución manual:

```txt
/sideprompt "Tracker de relación" {{npc name}}="Alice"
```

Valor guardado en el set:

```txt
{{npc name}} = Alice
```

Valor reutilizable a nivel de set:

```txt
{{npc name}} = {{npc_1}}
```

Luego ejecútalo:

```txt
/sideprompt-macroset "Pasada de relaciones" {{npc_1}}="Alice"
```

### Consejos para macros

Usa nombres aburridos:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Evita nombres como:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Los espacios son legibles en la interfaz. Los guiones bajos suelen ser menos molestos en los slash commands.

Un Side Prompt con macros de ejecución personalizadas no debería automatizarse individualmente salvo que los valores necesarios estén guardados en algún lugar, como dentro de una fila de Side Prompt Set. Las ejecuciones automáticas no pueden detenerse y preguntarte quién se supone que es `{{npc name}}`.

---

## Rangos de mensajes

Los Side Prompts pueden ejecutarse sobre un rango específico de mensajes.

```txt
/sideprompt "Puntos de trama" 50-80
```

Si proporcionas un rango, STMB usa ese rango.

Si no proporcionas un rango, STMB usa el comportamiento normal desde el último Side Prompt, con la lógica existente de límite/checkpoint.

Para tracking rutinario, el comportamiento desde la última ejecución es más fácil. Para depuración o limpieza dirigida, los rangos explícitos son más claros.

La compilación de rangos de Side Prompt debería seguir la misma preferencia de mensajes ocultos que usa la memoria, incluido el ajuste global de desocultar antes de la memoria.

---

## Cómo escribir buenos Side Prompts

Un buen Side Prompt tiene una tarea. Un mal Side Prompt tiene vibes.

Sé claro sobre:

- qué debe revisar
- qué debe actualizar
- qué debe ignorar
- qué formato debe producir
- qué tan larga debe ser la salida
- si debe reemplazar, revisar o añadir

### Mantén la salida corta a propósito

Los trackers se inflan salvo que les digas que no lo hagan.

Débil:

```txt
Actualiza el tracker de relación.
```

Mejor:

```txt
Actualiza el tracker de relación. Conserva los datos útiles, elimina los detalles resueltos u obsoletos, y mantén cada entrada en 1-3 viñetas concisas. Devuelve solo el tracker actualizado.
```

Guardarraíles útiles:

```txt
No añadas una sección nueva salvo que haya información realmente nueva. Fusiona las actualizaciones con entradas existentes cuando sea posible.
```

```txt
Elimina los hilos resueltos. No conserves especulación obsoleta solo porque aparecía en el tracker anterior.
```

```txt
Devuelve solo el informe actualizado. Sin comentarios, sin explicación, sin preámbulo.
```

### Usa encabezados estables

Los encabezados estables hacen que las actualizaciones repetidas sean más limpias.

Bueno:

```md
# Tracker de relación

## Estado actual

## Cambios recientes

## Tensiones abiertas

## Próximos desarrollos probables
```

Malo:

```md
# Aquí está mi desglose extenso y emocionalmente inteligente de todo lo que podría estar ocurriendo
```

### No pidas todo

Un Side Prompt que pide cada detalle normalmente producirá cada detalle.

Elige lo que importa. Un tracker de trama suele necesitar el hilo sin resolver, qué cambió, quién lo sabe y qué necesita seguimiento. No necesita cada expresión facial de la escena.

### Haz obvio el uso de macros

Buenos nombres:

```txt
Tracker de relación - {{npc name}}
Estado de NPC - {{npc name}}
Tracker de facción - {{faction}}
```

Nombres menos útiles:

```txt
Tracker 3
Actualizar cosa
Prompt de relación misceláneo
```

Los usuarios no deberían tener que abrir el cuerpo completo del prompt para entender por qué les está pidiendo un valor.

---

## Ejemplos

### Tracker de puntos de trama

Usa esto cuando un chat tenga varias líneas argumentales activas.

```txt
Actualiza el tracker de puntos de trama según los mensajes seleccionados. Conserva solo los hilos activos o resueltos recientemente. Agrupa por línea argumental. Devuelve solo el tracker actualizado.
```

Forma sugerida:

```md
# Puntos de trama

## Hilos activos

1. **Artefacto perdido** — Estado actual y pista más reciente.
2. **Facción rival** — Qué quieren y qué cambió.

## Resuelto recientemente

1. **Viejo malentendido** — Se resolvió cuando Alice le dijo la verdad a Bob.

## Necesita seguimiento

1. ¿Quién tiene la llave?
2. ¿Por qué mintió el guardia?
```

### Tracker de relación con macro

El prompt requiere:

```txt
{{npc name}}
```

Ejecución manual:

```txt
/sideprompt "Tracker de relación" {{npc name}}="Alice" 10-40
```

Filas del set:

| Fila | Side Prompt | Macro guardada |
|---|---|---|
| 1 | Tracker de relación | `{{npc name}} = Alice` |
| 2 | Tracker de relación | `{{npc name}} = Bob` |

Esto evita crear definiciones de prompt separadas para cada NPC.

### Tracker de inventos o proyectos

Usa esto cuando un usuario sigue inventando, investigando, construyendo o cambiando algo con el tiempo.

```txt
Actualiza el tracker del proyecto. Registra solo cambios relevantes de objetivo, progreso, bloqueos, alcance, dependencias o relevancia para la historia. Mantén las entradas concisas y ordenadas por primera aparición.
```

Normalmente esto es más limpio que guardar diez entradas de memoria que todas dicen que el proyecto existe.

### Pasada de reparto reutilizable

Crea un set usando tokens de ejecución a nivel de set:

```txt
{{npc_1}}
{{npc_2}}
```

Ejecútalo:

```txt
/sideprompt-macroset "Pasada de reparto" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Reutilízalo después:

```txt
/sideprompt-macroset "Pasada de reparto" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Mismo set. Reparto distinto. 💡

---

## Solución de problemas

### Mi Side Prompt no se ejecutó después de la memoria.

Comprueba:

- ¿La memoria se ejecutó realmente?
- ¿El Side Prompt está activado para ejecuciones después de la memoria?
- ¿El chat está usando **Usar side prompts activados individualmente**?
- ¿El chat está usando un Side Prompt Set en su lugar?
- ¿El prompt necesita un valor de macro que no se proporcionó?
- ¿El prompt fue eliminado, renombrado o movido?

Si el chat usa un Side Prompt Set, las casillas de después de la memoria activadas individualmente se ignoran para ese chat.

### Mi Side Prompt Set no se ejecutó.

Comprueba:

- ¿El set está seleccionado para este chat?
- ¿El set todavía existe?
- ¿Todas las filas apuntan a Side Prompts existentes?
- ¿Todas las macros requeridas tienen valores guardados o proporcionados?

Las ejecuciones automáticas no pueden pedir valores faltantes. Guarda los valores de macro en el set o ejecútalo manualmente con `/sideprompt-macroset`.

### Se saltó una fila.

Causas probables:

- el Side Prompt referenciado fue eliminado
- el Side Prompt referenciado fue renombrado
- la fila tiene macros sin resolver
- el modelo devolvió una respuesta en blanco o inválida

STMB debería advertir en vez de fingir que todo funcionó.

### La salida es demasiado larga.

Añade límites estrictos:

```txt
Mantén la salida completa por debajo de 300 palabras.
```

```txt
Usa como máximo 5 elementos activos.
```

```txt
Fusiona los detalles relacionados. Elimina detalles obsoletos, resueltos o redundantes.
```

Los modelos no saben de forma natural cuándo un tracker se ha vuelto inútilmente grande. Díselo.

### Se ejecutó dos veces.

Comprueba si hubo:

- ejecución manual más ejecución automática
- filas duplicadas dentro de un set
- copias repetidas del mismo Side Prompt
- varios chats o pestañas activando trabajo casi al mismo tiempo

Un Side Prompt Set seleccionado debería reemplazar los prompts después de la memoria activados individualmente, lo que evita un problema común de ejecución duplicada.

### Se analizaron los mensajes equivocados.

Usa un rango explícito:

```txt
/sideprompt "Puntos de trama" 50-80
```

El comportamiento desde la última ejecución es cómodo. Los rangos explícitos son mejores para depurar.

### El tracker conserva información obsoleta.

Dile al Side Prompt que elimine la información obsoleta.

```txt
Actualiza el tracker. Elimina la especulación obsoleta, los conflictos resueltos y los detalles contradichos por los mensajes seleccionados.
```

Los trackers no se mantienen limpios por accidente.

---

## Puntos clave

### Para usuarios

Usa Side Prompts cuando quieras ayuda estructurada para mantener un chat largo.

Las ejecuciones manuales son mejores para análisis puntuales. Las ejecuciones después de la memoria o los Side Prompt Sets son mejores para trackers que deben mantenerse actualizados.

### Para botmakers

Construye Side Prompts como herramientas de mantenimiento, no como prosa de roleplay.

Usa encabezados estables, reglas de salida estrictas y comportamiento de actualización claro. Usa macros cuando un prompt deba servir para varios NPCs, facciones, ubicaciones o proyectos.

### Para admins

Los Side Prompts añaden más trabajo generado.

Eso significa que deben ser predecibles, inspeccionables y aburridos en el mejor sentido. Los sets ayudan porque hacen explícito el flujo de trabajo previsto en vez de dejarlo en una sopa de casillas.
