<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Книги Памяти: Полное справочное руководство для ИИ

**Продукт:** SillyTavern Memory Books (STMB)  
**Справочная версия:** v8.5.0, 1 августа 2026 г.  
**Назначение:** Единый плотный источник истины для ИИ-помощника, который обучает работе с Memory Books, объясняет систему и помогает устранять неполадки.

---

## Содержание

- [1. Как ИИ-помощник должен использовать это руководство](#1-как-ии-помощник-должен-использовать-это-руководство)
- [2. Определение продукта и ментальная модель](#2-определение-продукта-и-ментальная-модель)
- [3. Основные термины и выбор функций](#3-основные-термины-и-выбор-функций)
- [4. Требования, установка и первичная проверка](#4-требования-установка-и-первичная-проверка)
- [5. Открытие Memory Books и главное окно](#5-открытие-memory-books-и-главное-окно)
- [6. Режимы хранения Книг Памяти](#6-режимы-хранения-книг-памяти)
- [7. Профили, подключения и маршрутизация генерации](#7-профили-подключения-и-маршрутизация-генерации)
- [8. Сцены, ручные и автоматические Memories и Catch-Up](#8-сцены-ручные-и-автоматические-memories-и-catch-up)
- [9. Экономия токенов, скрытые сообщения и граница памяти](#9-экономия-токенов-скрытые-сообщения-и-граница-памяти)
- [10. Активация и извлечение лорбука](#10-активация-и-извлечение-лорбука)
- [11. Настоящий Group Chat Mode](#11-настоящий-group-chat-mode)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Ветвление чатов](#13-ветвление-чатов)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Боковые Промпты](#16-боковые-промпты)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Контекст для генерации](#20-контекст-для-генерации)
- [21. Архитектура промптов, встроенные Summary Prompts и правила написания](#21-архитектура-промптов-встроенные-summary-prompts-и-правила-написания)
- [22. Summary Prompt Manager и Consolidation Prompt Manager](#22-summary-prompt-manager-и-consolidation-prompt-manager)
- [23. STMB и другие расширения](#23-stmb-и-другие-расширения)
- [24. Заголовки записей лорбука и политика символов](#24-заголовки-записей-лорбука-и-политика-символов)
- [25. Очередь задач и повторные попытки](#25-очередь-задач-и-повторные-попытки)
- [26. Визуальная обратная связь и доступность](#26-визуальная-обратная-связь-и-доступность)
- [27. Карта настроек и актуальный справочник](#27-карта-настроек-и-актуальный-справочник)
- [28. Справочник slash-команд](#28-справочник-slash-команд)
- [29. Устранение неполадок по этапам](#29-устранение-неполадок-по-этапам)
- [30. FAQ](#30-faq)
- [31. Совместимость, миграция и актуальные исторические примечания](#31-совместимость-миграция-и-актуальные-исторические-примечания)
- [32. Примечания для разработчиков и лицензия](#32-примечания-для-разработчиков-и-лицензия)
- [33. Компактное дерево диагностики](#33-компактное-дерево-диагностики)
- [34. Минимальная рекомендуемая последовательность обучения](#34-минимальная-рекомендуемая-последовательность-обучения)
- [35. Итоговая модель](#35-итоговая-модель)

---

## 1. Как ИИ-помощник должен использовать это руководство

Считайте этот документ актуальным операционным справочником по Memory Books. Он заменяет необходимость отдельно загружать руководство Start Here, README, User Guide, руководство Side Prompts, руководство How STMB Works и исторический changelog как независимые файлы знаний.

Термины:

- STMB = SillyTavern=MemoryBooks (это расширение)
- ST = SillyTavern (базовый код, который расширяет STMB)

При ответах пользователям:

1. Точно сохраняйте терминологию Memory Books. **Memory Book** — это lorebook SillyTavern, который используется STMB; это не отдельный формат базы данных.
2. Различайте текущее и историческое поведение. Не обучайте удалённому или заменённому процессу только потому, что он встречался в старом changelog.
3. Различайте **Group Chat Mode** и **Narrator Mode**. Они решают разные задачи.
4. Различайте **генерацию** Memory, **хранение и конфигурацию** lorebook и последующее **извлечение SillyTavern**. Activation/retrieval является частью базового кода ST.
5. Не придумывайте элементы управления, подписи меню, поведение провайдеров или настройки, которые здесь не описаны.
6. Если пользователь прислал скриншот, определяйте только видимые элементы управления. Указывайте ближайшее следующее действие, а не предполагайте наличие элемента за пределами экрана.
7. При устранении неполадок определите первый этап, на котором произошёл сбой, и проверьте его до того, как рекомендовать переписывать prompt.
8. Сначала предпочитайте простую рабочую конфигурацию, а уже затем сложную маршрутизацию, несколько books, custom prompts, Regex или автоматизацию Side Prompt.
9. Объясняйте, что character filters и отдельные Memory Books улучшают маршрутизацию и релевантность, но не являются границей безопасности.
10. Явно обозначайте неопределённость, если установленная версия, версия SillyTavern, провайдер или custom prompt пользователя могут отличаться.

### Примечания к текущему документу

Narrator Mode реализован в v8.5.0.

В некоторых руководствах для начинающих говорилось, что перед запуском автоматических Memories технически необходимо создать ручную Memory. Текущий STMB может создать первую автоматическую Memory начиная с сообщения 0, если baseline обработанных сообщений отсутствует. Первая ручная Memory всё равно рекомендуется: она позволяет проверить подключение, Memory Book, формат вывода и желаемую начальную границу до того, как полагаться на автоматизацию.

---

## 2. Определение продукта и ментальная модель

Memory Books — это расширение SillyTavern, которое преобразует выбранные или автоматически определённые диапазоны чата в структурированные записи Memory и сохраняет их в lorebooks SillyTavern.

Базовый процесс:

```text
Chat messages
    ↓
STMB selects or receives a message range
    ↓
STMB assembles an AI request
    ↓
The model returns a structured memory
    ↓
STMB saves a lorebook entry
    ↓
Old processed chat messages may be hidden from active context
    ↓
SillyTavern later activates relevant lorebook entries
    ↓
The chat model receives those entries as context
```

STMB не даёт модели постоянную внутреннюю память. Он поддерживает внешнюю справочную систему — записи lorebook. Модель чата «помнит» тогда, когда SillyTavern включает соответствующие записи lorebook в prompt, отправляемый ИИ.

### Три отдельных этапа

1. **Качество генерации** — создала ли модель генерации Memory точный и полезный результат?
2. **Хранение и конфигурация** — был ли результат сохранён в нужный Memory Book с подходящими настройками активации?
3. **Извлечение и использование моделью** — активировал и отправил ли SillyTavern запись, и правильно ли модель чата её использовала?

Устраняйте проблемы на этих этапах отдельно.

### Lorebooks и Memory Books

**lorebook**, который в некоторых частях SillyTavern также называется **World Info**, — это набор записей, которые SillyTavern может условно добавлять в запрос к модели. Обычная запись lorebook содержит:

- заголовок/комментарий;
- содержимое;
- ключевые слова активации или другой режим активации;
- позицию и порядок вставки;
- параметры рекурсии и бюджета;
- необязательные character filters и другие метаданные.

**Memory Book** — это обычный lorebook SillyTavern, который используется STMB. Его можно открывать, редактировать, переупорядочивать, экспортировать, импортировать и удалять стандартными средствами lorebook. В зависимости от используемых функций он может содержать:

- scene Memories;
- сводки Arc, Chapter, Book, Legend, Series или Epic;
- записи Clip и Topical Clip;
- tracker-записи Side Prompt;
- другие записи под управлением STMB.

### Записи Memory — это сжатый контекст

Scene Memory — не исходная расшифровка чата. Это сжатое представление, предназначенное для сохранения информации, важной для непрерывности, например:

- событий и последствий;
- решений и планов;
- открытий и раскрытий;
- изменений отношений или эмоционального состояния;
- индивидуальных знаний, убеждений или заблуждений;
- важных объектов, мест, личностей, обещаний и ограничений.

Скрытие обработанных сообщений не удаляет их. Оно не даёт этим сообщениям отправляться ИИ и продолжать занимать активный контекст истории чата.

---

## 3. Основные термины и выбор функций

| Потребность | Функция | Значение |
|---|---|---|
| Свести один выбранный или автоматический диапазон чата | **Memory** | «Запомнить, что произошло в этой сцене». |
| Сохранить выбранный текст чата или один факт | **Clip** | «Сохранить эту заметку». |
| Собрать факты об одной теме из сохранённых Memories | **Topical Clip** | «Собрать всё, что мои Memories говорят об этом». |
| Поддерживать изменяющуюся информацию через повторные запуски | **Side Prompt** | «Поддерживать этот tracker в актуальном состоянии». |
| Объединить несколько Memories или сводок нижнего уровня | **Consolidation** | «Свернуть эти записи в обзор более высокого уровня». |
| Сократить одну существующую запись под управлением STMB | **Compaction** | «Укоротить эту запись, не потеряв факты». |
| Заменить существующую запись, используя её исходные источники | **Regeneration** | «Пересобрать эту запись и проверить замену». |

### Отличия функций, которые пользователи часто путают

- **Clip vs Topical Clip:** Clip начинается с текста, выделенного в текущем чате. Topical Clip начинается с существующих подтверждённых Memories STMB.
- **Topical Clip vs Side Prompt:** Topical Clip запускается вручную, чтобы собрать информацию по теме. Side Prompt может повторно поддерживать изменяющийся tracker.
- **Compaction vs Consolidation:** Compaction переписывает одну запись. Consolidation создаёт новую сводку более высокого уровня из нескольких записей.
- **Memory vs Side Prompt:** Memories обычно являются последовательными записями сцен. Side Prompts обычно обновляют или перезаписывают один продолжающийся вспомогательный документ.
- **Генерация vs извлечение:** создание записи не гарантирует, что SillyTavern позднее её активирует.

---

## 4. Требования, установка и первичная проверка

### Требования

- SillyTavern 1.18.0 или новее; рекомендуется последняя совместимая версия.
- Рабочее подключение к ИИ.
- Модель, способная следовать инструкциям и, для процессов Memory и Consolidation, возвращать корректный JSON.
- Разрешение на установку сторонних расширений SillyTavern.
- Доступный в SillyTavern preset Chat Completion при использовании локального или Text Completion backend через OpenAI-compatible Chat Completion endpoint.

### Обычные пользователи Chat Completion

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google и другие подключения Chat Completion обычно могут использовать встроенный профиль **Current SillyTavern Settings**.

### Пользователи локальных и Text Completion backend

KoboldCpp, llama.cpp, TextGen, Ollama и похожие backend обычно надёжнее всего работают через OpenAI-compatible Chat Completion endpoint. Даже если обычный roleplay использует Text Completion, в SillyTavern должен быть доступен preset Chat Completion для STMB.

Типичная настройка KoboldCpp:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint вроде `http://localhost:5001/v1` или `http://127.0.0.1:5000/v1`;
- любой непустой custom API key, если SillyTavern его требует;
- model ID в формате, ожидаемом endpoint, обычно `koboldcpp/modelname`, без лишнего суффикса `.gguf`;
- импортированный preset Chat Completion;
- response length не менее 2048 tokens, часто безопаснее 4096.

Типичная настройка llama.cpp:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1` или `http://host.docker.internal:8080/v1`, если SillyTavern работает в Docker;
- любой непустой API key, если SillyTavern его требует;
- model ID запущенной модели;
- без prompt post-processing, если endpoint его не требует.

Пример команды сервера:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Необязательный Chat Top Bar

STMB работает без Chat Top Bar / Chat Top Info Bar. Его установка добавляет интерфейс очереди **Memory Books Jobs** для активных, завершённых, неудачных, отменённых, заблокированных и требующих проверки задач.

### Установка

1. Откройте SillyTavern.
2. Откройте основную панель **Extensions**.
3. Выберите **Install Extension**.
4. Установите официальный репозиторий Memory Books.
5. Перезагрузите SillyTavern, если будет предложено.
6. Откройте чат персонажа или групповой чат.
7. Подождите несколько секунд, пока элементы управления STMB инициализируются.

SillyTavern Extras не требуется.

### Проверка загрузки STMB

Должен появиться хотя бы один из следующих элементов:

- **Memory Books** в меню Extensions с иконкой волшебной палочки рядом с полем ввода;
- шевроны сцены **►** и **◄** в развёрнутых действиях сообщения.

Если нет ни одного:

1. подождите до десяти секунд;
2. обновите страницу;
3. убедитесь, что расширение установлено и включено;
4. снова откройте чат персонажа или группу;
5. проверяйте консоль браузера только после того, как базовые проверки не помогли.

---

## 5. Открытие Memory Books и главное окно

Откройте меню Extensions с волшебной палочкой рядом с полем ввода чата и выберите **Memory Books**.

Панель может содержать:

- Current Scene;
- Memory Status / highest processed message;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- элементы управления group-character или Narrator, когда они применимы.

Для первой Memory нужны всего три решения:

1. В какой Memory Book будет сохранена запись?
2. Какой профиль/подключение будет её генерировать?
3. Какие сообщения чата образуют сцену?

---

## 6. Режимы хранения Книг Памяти

### 6.1 Automatic Mode: Memory Book, привязанный к чату

Automatic Mode — обычный режим по умолчанию. STMB использует lorebook, привязанный к текущему чату через SillyTavern.

Используйте его, если:

- у одного чата один основной Memory Book;
- предпочтительна минимальная настройка;
- персонажам группы не нужны отдельные Memory Books.

Если lorebook не привязан, привяжите его в SillyTavern или используйте Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Включите **Auto-create lorebook if none exists**, чтобы STMB мог создать и привязать lorebook при первом сохранении Memory.

Шаблон имени по умолчанию может использовать:

- `{{char}}` — имя персонажа или группы;
- `{{user}}` — имя пользователя;
- `{{chat}}` — ID/имя чата.

STMB добавляет числовые суффиксы, когда это нужно для устранения дубликатов имён.

Auto-Create и Manual Lorebook Mode взаимоисключающие.

### 6.3 Manual Lorebook Mode

Включите **Manual Lorebook Mode**, чтобы выбирать Memory Book независимо от lorebook, привязанного к чату.

Используйте его, если:

- Memories должны находиться в отдельном lorebook;
- несколько чатов намеренно используют один Memory Book;
- членам группы нужны отдельные books;
- используется Narrator Mode;
- пользователь понимает получившуюся схему активации.

Выбор основного manual Memory Book сохраняется для текущего чата, если только постоянный character lock не переопределяет его в совместимом solo chat.

### 6.4 Отдельные Memory Books обычно понятнее

Выделенный Memory Book облегчает:

- отделение Memories от определений персонажей и lore мира;
- отдельную настройку бюджета и порядка lorebook;
- повторное использование или экспорт истории памяти;
- просмотр записей STMB без постороннего lore;
- диагностику активации.

Это рекомендация, а не требование.

### 6.5 Character Memory Book locks

Character Memory Book lock — это постоянное назначение Manual Mode, прикреплённое к character card.

В solo chat:

- разблокированный manual book принадлежит текущему чату;
- locked book следует за character card между совместимыми чатами Manual Mode;
- manual book нельзя изменить, пока lock не снят.

В реальном group chat:

- разблокированное назначение per-character принадлежит текущему групповому чату;
- locked per-character assignment следует за этим character card в совместимые группы Manual Mode;
- отсутствующий locked book создаёт состояние broken-lock, которое нужно разблокировать или исправить.

Используйте locks только если один и тот же персонаж должен намеренно использовать один продолжающийся Memory Book в разных историях. Для альтернативных вселенных или несвязанных временных линий это опасно.

### 6.6 Рекомендуемый стартовый layout

- Solo chat: один chat-bound или auto-created Memory Book.
- Real group chat: один group Memory Book.
- Narrator chat: один omniscient Memory Book плюс по одному уникальному book для каждого заявленного персонажа, как требует Narrator Mode.

---

## 7. Профили, подключения и маршрутизация генерации

Профиль Memory Books управляет и генерацией, и настройками создаваемой записи lorebook.

### 7.1 Рекомендуемый первый профиль

Сначала используйте **Current SillyTavern Settings**. Он использует провайдер, модель и temperature, которые сейчас активны в SillyTavern.

Не начинайте с переписывания prompts или настройки Full Manual endpoint. Сначала убедитесь, что хотя бы одна Memory может быть сгенерирована и сохранена.

### 7.2 Зачем создавать сохранённый профиль STMB

Создайте отдельный профиль, если нужно:

- использовать более дешёвую или надёжную модель для Memories;
- использовать другого провайдера, чем для roleplay;
- привязать именованное Custom connection;
- выбрать custom summary prompt;
- использовать другую temperature или maximum output behavior;
- изменить формат заголовка;
- изменить activation, insertion, order или recursion settings;
- использовать отдельные group/omniscient и character-focused prompts.

### 7.3 Поля профиля

Профиль может включать:

- display name;
- API/provider;
- model ID;
- temperature;
- preset Summary Prompt;
- необязательные отдельные multi-character prompts;
- поведение structured output;
- необязательную маршрутизацию SillyTavern ChatCompletionService;
- необязательный preset Chat Completion;
- поведение reverse proxy;
- формат заголовка;
- режим активации: Normal, Constant или Vectorized;
- insertion position, включая character, example-message, author’s-note и Outlet;
- Outlet name, когда применимо;
- automatic или manual order value;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Именованные Custom OpenAI-compatible connections

Профиль Custom OpenAI-compatible может:

- использовать текущее активное Custom connection SillyTavern; или
- привязать одно именованное Custom connection из Connection Manager SillyTavern.

Именованное connection предоставляет сохранённые URL и secret. Поле model в профиле STMB остаётся model override. Если именованное connection удалено или перестало быть Custom Chat Completion connection, STMB блокирует запрос, а не молча направляет его куда-то ещё.

### 7.5 Fallback для structured output

**Skip structured output and use plain-text completion** не даёт STMB отправлять structured-output schema провайдерам, которые его отвергают. Модель всё равно должна вернуть корректный JSON, требуемый выбранным prompt Memory или Consolidation.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** использует `ConnectionManagerRequestService`, если в Connection Manager SillyTavern выбран profile. Этот connection profile предоставляет provider, credentials, endpoint, proxy и Chat Completion preset. STMB переопределяет model и temperature, сохраняя собственный response-token limit и выбор structured output. Preset connection profile имеет приоритет над отдельным Chat Completion preset, выбранным в STMB. Выбранный connection profile должен использовать Chat Completion. Ошибка request через connection profile сообщается без повторной попытки через прямой request path STMB, поскольку такой путь потерял бы настройки соединения.

Если SillyTavern connection profile не выбран, действует существующее поведение ChatCompletionService, включая необязательный Chat Completion preset STMB. Request OpenRouter по этому route также наследует provider order, quantization filters, fallback controls и настройку middle-out routing SillyTavern. Эти controls сохраняются, если ChatCompletionService завершается ошибкой и STMB повторяет request через fallback request path. Если и эта попытка неудачна, STMB сообщает обе ошибки. Отключение option сохраняет прямое поведение request STMB. Full Manual profiles не используют ни один из этих service route.

### 7.7 Reverse proxy и Full Manual Configuration

**Use reverse proxy** передаёт настроенные в SillyTavern сведения reverse proxy для поддерживаемых провайдеров.

**Full Manual Configuration** хранит отдельный endpoint и key внутри профиля STMB. Это исключительный путь. Когда возможно, предпочитайте провайдера или Custom connection, уже настроенные и протестированные в SillyTavern.

### 7.8 Длина вывода

Глобальная настройка STMB maximum response tokens может переопределить обычную длину вывода Chat Completion для задач Memory Books. Обрезанный JSON — частая причина неудачной генерации. Сначала увеличьте длину вывода, а не ослабляйте schema или prompt.

---

## 8. Сцены, ручные и автоматические Memories и Catch-Up

### 8.1 Что такое сцена

**Сцена** — это включительный диапазон сообщений чата, который STMB обрабатывает в одну Memory.

Полезные границы обычно содержат одну связную единицу:

- событие;
- разговор;
- этап расследования;
- эмоциональное или relational развитие;
- смену места или цели;
- связанную последовательность действий.

Очень маленькие тривиальные диапазоны могут дать мало пользы. Очень большие стоят дороже, сложнее для сводки, могут превышать контекст и часто объединяют несвязанные события.

### 8.2 Ручная разметка сцены

1. Разверните действия сообщения, обычно через кнопку с тремя точками или похожий элемент.
2. Нажмите **►** на первом включённом сообщении.
3. Нажмите **◄** на последнем включённом сообщении.
4. Откройте Memory Books и проверьте отображаемые start, end, speakers, message count и token estimate.

Оба граничных сообщения включаются.

Используйте **Clear Scene**, чтобы убрать выбор, либо выберите другой start/end marker, чтобы заменить одну из границ.

### 8.3 Создание ручной Memory

1. Проверьте сцену.
2. Проверьте effective Memory Book.
3. Проверьте выбранный профиль.
4. Нажмите **Create Memory** или используйте `/creatememory`.
5. Просмотрите confirmation, token warning, participant confirmation или preview windows, если они появляются.
6. Подтвердите результат.
7. Убедитесь, что появилась новая запись lorebook и Memory Status продвинулся до конца сцены.

Корректный результат Memory обычно содержит:

- заголовок;
- содержимое;
- ключевые слова;
- метаданные STMB, включая исходный диапазон и идентичность чата.

### 8.4 Previews Memory

Если включено **Show memory previews**, можно проверить и при необходимости отредактировать:

- заголовок;
- содержимое Memory;
- ключевые слова.

Проверьте имена, атрибуцию, факты, пропущенные последствия и посторонние комментарии. Без previews корректный результат сохраняется автоматически.

### 8.5 Автоматические Memories

Включите **Auto-create memory summaries** и настройте:

- **Auto-Summary Interval** — количество новых сообщений на одну автоматическую Memory;
- **Auto-Summary Buffer** — количество самых новых сообщений, которые оставляются вне сводки, чтобы не обрабатывать разворачивающуюся сцену слишком рано.

Пример:

```text
Interval: 30
Buffer: 2
```

STMB ждёт, пока после обработанной границы будет не менее 32 сообщений, затем создаёт Memory, заканчивающуюся за два сообщения до самого нового.

Если обработанного baseline нет, текущий STMB считает его равным `-1` и может начать с сообщения 0. Первая ручная Memory всё равно рекомендуется для проверки setup и выбора осознанной начальной точки.

Меньшие интервалы создают более сфокусированные Memories и больше запросов. Большие — меньше, но более крупных Memories с повышенным риском объединения несвязанных материалов. Практичная начальная величина — примерно 20–40 сообщений для детального roleplay и 40–60 для коротких быстрых обменов.

Автоматическая генерация может быть отложена, если обязательный Memory Book ещё не назначен.

### 8.6 Baseline обработанных сообщений

STMB хранит для каждого чата highest processed message. Он определяет:

- откуда начинается `/nextmemory`;
- откуда начинаются автоматические Memories;
- memory-boundary indicator;
- какие сообщения считаются уже обработанными.

Используйте:

- `/stmb-highest`, чтобы показать значение;
- `/stmb-set-highest <N>`, чтобы установить вручную;
- `/stmb-set-highest none`, чтобы очистить.

Ручные изменения должны быть осознанными, потому что они могут привести к пропущенным или повторным диапазонам.

### 8.7 Catch-up для существующего длинного чата

Используйте:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Пример:

```text
/stmb-catchup interval=40 start=0 end=245
```

Диапазон включительный. Chunks обрабатываются последовательно; последний может быть меньше.

Catch-up намеренно не интерактивен. Перед запуском:

- выберите и протестируйте нужный профиль;
- включите **Always use default profile**;
- отключите **Show memory previews**;
- убедитесь, что effective Memory Book существует, либо разрешите Auto-Create в Automatic Mode;
- исправьте все обязательные назначения books для multi-character;
- выберите chunk size ниже порога предупреждения о tokens.

STMB делает preflight каждого chunk, обрабатывает их по порядку и останавливается при первой ошибке или `/stmb-stop`. Уже завершённые chunks остаются сохранёнными. Возобновляйте с первого незавершённого сообщения, а не повторяйте весь диапазон.

Catch-up подходит для массового преобразования. Если важны литературные или событийные границы, ручная разметка сцен остаётся лучше.

---

## 9. Экономия токенов, скрытые сообщения и граница памяти

### 9.1 Скрытие — не удаление

Скрытые сообщения остаются в файле чата. Они исключаются из активного контекста чата, пока их снова не покажут.

### 9.2 Режимы auto-hide

**Auto-hide messages after adding memory** может быть:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** сохраняет небольшой свежий overlap возле границы.

> **Если используется расширение Presence:** Presence может позднее раскрыть сообщения, скрытые STMB, потому что оба расширения изменяют общее состояние видимости сообщений SillyTavern. Рекомендации по конфигурации см. в [STMB и другие расширения](#23-stmb-и-другие-расширения).

### 9.3 Unhide перед генерацией

**Unhide hidden messages for memory generation** показывает выбранный диапазон до того, как STMB его компилирует. Используйте при regeneration или повторной обработке ранее скрытых диапазонов. Выбранный auto-hide mode определяет, что снова будет скрыто после успешного сохранения.

### 9.4 Индикатор границы Memory

Индикатор использует highest processed message, чтобы показать, где заканчивается обработанная история и начинается необработанный чат.

Режимы:

- Off;
- Memory boundary divider;
- draggable jump button;
- divider plus jump button.

Jump button прокручивает к первому необработанному сообщению и запоминает позицию, куда его перетащили.

### 9.5 Хорошая учебная конфигурация

Практичная начальная настройка:

- показывать boundary divider и jump button;
- оставлять два сообщения нескрытыми;
- включить временный unhide для генерации;
- не использовать auto-hide, пока пользователь не подтвердит правильное сохранение Memory;
- затем перейти к скрытию всех обработанных сообщений ради основного выигрыша в tokens.

---

## 10. Активация и извлечение лорбука

### 10.1 Ключевые слова

Обычные Memories часто активируются ключевыми словами. Хорошие keywords конкретны и различимы:

- имена и aliases персонажей;
- именованные места или организации;
- важные объекты;
- названия событий;
- идентификаторы;
- конкретные открытия или действия.

Слабые ключевые слова вроде `important event`, `conversation` или `secret` слишком общие.

Содержимое Memory определяет, что узнаёт модель. Keywords помогают определить, когда SillyTavern её извлекает.

### 10.2 Режимы активации

- **Normal:** активация по keywords/правилам.
- **Constant:** всегда активна с учётом применимых бюджета и параметров записи.
- **Vectorized:** использует vector-related retrieval, если setup пользователя это поддерживает.

Vectors необязательны. STMB работает по ключевым словам без расширения Vectors.

### 10.3 Рекомендуемые глобальные настройки World Info

Обычные стартовые рекомендации:

- Match Whole Words: off;
- Scan Depth: относительно высокий, например 8;
- Max Recursion Steps: примерно 2;
- Context percentage: подбирается под общий контекст пользователя и конкурирующий материал prompt.

Это рекомендации, а не жёсткие требования.

### 10.4 Delay Until Recursion

Если Memory Book — единственный активный источник lorebook/World Info, оставьте **Delay Until Recursion** выключенным. Иначе ни одна запись не сможет начать первый цикл рекурсии, и Memory может вообще не активироваться.

### 10.5 Диагностика извлечения

Если ИИ «не помнит»:

1. Убедитесь, что запись существует.
2. Убедитесь, что для чата активен правильный Memory Book.
3. Убедитесь, что запись включена.
4. Убедитесь, что keywords или activation mode соответствуют текущему разговору.
5. Убедитесь, что бюджета lorebook достаточно.
6. Проверьте настройки рекурсии.
7. Используйте инструмент просмотра World Info или журнал запросов, чтобы подтвердить, что запись действительно была отправлена.
8. Если она была отправлена, но проигнорирована, оставшаяся проблема — поведение модели или конкурирующий контекст, а не хранение STMB.

---
## 11. Настоящий Group Chat Mode

### 11.1 Определение

Group Chat Mode применяется к настоящей группе SillyTavern, содержащей две или более отдельные character cards.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern записывает, какая card создала каждое сообщение, поэтому STMB может сохранять speaker attribution и определять участвующих group members.

Отдельный switch Group Chat Mode не нужен. Откройте group chat и используйте STMB как обычно.

**General Settings → Group Chat** содержит два независимых control, оба включены по умолчанию:

| Setting | Checked | Unchecked |
|---|---|---|
| **character-aware memories** | Включает participant-based memory filters и настроенную character-specific memory processing. | Использует обычную single-book processing для новых memories, regeneration и consolidation. Нет participant confirmation, character filters, character-book copies, linked regeneration, character-based consolidation streams или automatic group/character prompt routing. |
| **Use separate group side prompts** | Automatic side prompts наследуют group default. | Automatic side prompts наследуют solo default. |

Memory checkbox не влияет на side-prompt checkbox. Side-prompt default routing применяется и к after-memory, и к interval triggers; явный выбор per-chat set или individually enabled prompts по-прежнему имеют приоритет, а manual runs остаются доступными.

Когда character-aware memories выключено, **Automatically accept detected participants in future**, назначения **Group Character Lorebooks**, **Use separate group and character prompts in group chats** и selectors **Group Summary Prompt / Character Summary Prompt** остаются видимыми, но серыми. Tooltips объясняют, что они отключены и не применяются, потому что checkbox в General Settings выключен. Когда separate group side prompts выключено, по этой причине серым становится только group side-prompt default selector. Сохранённые choices не теряются и восстанавливаются при повторном включении.

Эти switches не мигрируют существующие entries или STLO configuration. Существующие filters продолжают действовать, пока entry явно не regenerate; regeneration при выключенном character-aware memories удаляет character filter этой entry, не переписывая linked copies. Новые consolidated entries создаются без filter, а source entries сохраняют свои filters. Уже начатые operations, включая queued jobs и retries, сохраняют captured settings. Native group identity, speaker names и primary Memory Book selection остаются без изменений. Narrator Mode независим от этих native-group controls.

Описанное ниже character-aware поведение применяется, пока **character-aware memories** включено.

### 11.2 Определение участников

Обнаруженный participant — обычно character card, который написал хотя бы одно сообщение внутри выбранной сцены.

STMB не выводит из прозы всех, кто физически присутствовал. Поэтому:

- молчаливый наблюдатель может не быть обнаружен;
- просто упомянутый персонаж не является участником;
- отсутствующий персонаж, которого обсуждает группа, не выбирается;
- пользователь не рассматривается как отдельный target Memory Book группового персонажа;
- дублирующиеся или необычные идентичности speaker могут потребовать исправления.

Если автоматическое определение участников не находит ни одного группового персонажа, STMB открывает подтверждение участников даже при включённом автоматическом принятии. Предупреждение объясняет, что обнаружение не удалось, и требует проверить, какие персонажи группы присутствовали, прежде чем продолжать.

Prompt участников означает: **С какими персонажами группы должна быть связана эта Memory?** Он не доказывает, кто знал каждый факт или кто физически присутствовал.

### 11.3 Один групповой Memory Book

Это рекомендуемый стартовый layout.

Используйте Automatic Mode, Auto-Create или основной book Manual Mode. Каждая сцена создаёт одну canonical entry в group Memory Book. Если доступны имена участников, запись может получить включительный character filter SillyTavern.

Включительный фильтр для Alice и Bob означает, что запись может активироваться, когда активна Alice **или** Bob. Он не создаёт синтетического персонажа «Alice and Bob» или отдельный book для подмножества.

Один group book лучше всего, если:

- состав в основном делит одну историю;
- достаточно одной omniscient/group-oriented сводки;
- предпочтительны минимальная настройка и меньше дублированных записей;
- STLO не нужен.

Одна групповая Memory всё равно может сохранять асимметричные знания:

> Alice found the transmitter and hid it. Bob believed the room was empty.

### 11.4 Один group book плюс per-character books

Расширенный real-group layout использует:

- один canonical group Memory Book;
- один assigned character Memory Book для каждого group member.

Требования:

- Manual Lorebook Mode;
- корректное назначение для каждого необходимого group member.

Canonical group book также можно выбрать как character book. STMB хранит canonical group entry и её linked character copy как отдельные entries в этом book. Character copy фильтруется на assigned character и имеет приоритет над canonical version в ход этого character. Несколько characters могут использовать один character book; STMB записывает одну shared copy вместо дублей.

Когда Memory сохраняется:

1. canonical version записывается в group book;
2. participant selection подтверждается, если automatic acceptance не включено;
3. linked copies записываются в books выбранных participants;
4. STMB по возможности выполняет rollback частичных записей, если обязательное сохранение не удалось.

Если в real-group participant confirmation не выбрать ни одного participant, Memory применяется ко всем текущим group members.

### 11.5 Отдельные prompts группы и персонажа

По умолчанию одна и та же group-oriented Memory копируется в books участников.

Профиль может включить **Use separate group and character prompts in group chats**. Тогда:

- Group Summary Prompt создаёт canonical group version;
- Character Summary Prompt создаёт индивидуальную версию для каждого single-character target book.

Character-focused версии могут сохранять:

- личные знания;
- ошибочные убеждения;
- индивидуальные эмоциональные реакции;
- приоритеты конкретных отношений;
- то, что имело значение для одного участника.

Для этого требуются дополнительные запросы к ИИ. Общий character book получает одну общую копию, а не дубликат для каждого назначенного персонажа.

### 11.6 Необязательная интеграция STLO

Memory Books определяет:

- scene range;
- participants;
- summary content;
- какие books получают copies;
- используются ли individualized prompts.

Если STLO установлен, он дополнительно определяет:

- когда lorebook активен;
- какой character может его activate;
- priority, position, budget и ordering.

STLO не требуется для настоящего group chat. STMB inject назначенный book говорящего native group member в эту generation и использует native entry-level character filters. Если STLO доступен и STMB назначает отдельный character book, он также добавляет basename avatar character в `stlo.characterOverrides` и включает `stlo.onlyWhenSpeaking`, сохраняя существующие STLO priorities, budgets и overrides. STMB не применяет lorebook-wide STLO speaking filter, когда character assignment — это canonical group book.

STMB использует merge-only behavior. Очистка или изменение assignment не удаляет старый STLO character override автоматически. Удаляйте устаревшие overrides вручную в STLO.

### 11.7 Filters и books не являются механизмом конфиденциальности

Отдельные books и filters повышают релевантность. Они не гарантируют, что:

- один персонаж никогда не получит информацию другого;
- модель никогда не увидит canonical group version;
- контекст previous Memories идеально разделён по знаниям;
- character book представляет только осознанное знание.

Используйте их как инструменты маршрутизации контекста, а не как границы безопасности.

### 11.8 Linked copies не синхронизируются в реальном времени

Linked entries содержат метаданные, позволяющие STMB распознать один и тот же исходный эпизод, но последующие изменения независимы.

Редактирование, удаление или compaction одной копии не меняет остальные автоматически. Regeneration character copy также меняет только эту копию. Однако при regeneration canonical group entry STMB спрашивает, регенерировать только её или её вместе со всеми linked character entries. Для каждой выбранной записи выполняется собственная генерация и проверка, поэтому character-focused prompts остаются character-focused.

### 11.9 Добавление, удаление или переназначение членов группы

При добавлении персонажа:

- назначьте корректный book до следующей распределённой Memory;
- старые Memories не копируются задним числом;
- старые filters не переписываются;
- при необходимости предоставьте исторический контекст вручную.

При удалении персонажа:

- существующие записи остаются;
- старые filters и overrides STLO остаются;
- linked copies не удаляются автоматически.

При смене book персонажа:

- меняется будущая маршрутизация;
- персонаж не обязательно автоматически удаляется из overrides STLO старого book.

### 11.10 Group consolidation

Canonical group book использует автоматический group-chat consolidation analysis prompt, который стремится создать всеведущую хронологию, различая объективные события и индивидуальные знания.

Character books используют preset consolidation, выбранный во всплывающем окне. Разные books могут иметь разное количество eligible sources. Book без достаточного материала может быть пропущен с предупреждением, пока готовые books продолжают обработку.

Отсутствующая сцена в character book — это хронологический пробел. Она не доказывает отсутствие, незнание или бессознательное состояние. Общий character book получает одну consolidated entry.

---

## 12. Narrator Mode

### 12.1 Определение

Narrator Mode предназначен для обычного one-on-one чата SillyTavern, где одна character card Narrator пишет нескольких вымышленных персонажей.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Без Narrator Mode SillyTavern видит все ответы ИИ как написанные card Narrator. Narrator Mode предоставляет ручную модель состава, чтобы STMB мог связывать сцены и Memory Books с вымышленными персонажами внутри прозы Narrator.

Narrator Mode недоступен внутри настоящего группового чата SillyTavern.

### 12.2 Обязательный layout хранения

Narrator Mode требует:

- Manual Lorebook Mode;
- один выбранный **omniscient/canonical Memory Book**;
- отдельный уникальный Memory Book для каждого declared cast member.

Правила:

- cast member не может использовать omniscient book;
- два cast members не могут использовать один book;
- каждому declared member нужен доступный book;
- retired members сохраняют identity и reserved book assignment до восстановления или иного удаления implementation;
- Auto-Create несовместим, поскольку Narrator Mode зависит от Manual Lorebook Mode.

Как и advanced real-group layout, Narrator Mode не требует STLO для active-character retrieval. STMB inject books выбранных cast members в active lorebook context во время generation.

### 12.3 Настройка

1. Откройте обычный chat Narrator card.
2. Включите Manual Lorebook Mode.
3. Выберите main manual book; это будет omniscient Memory Book.
4. Включите **Narrator Mode**.
5. Откройте **Manage Narrator Cast**.
6. Добавьте каждого fictional character по имени и назначьте уникальный Memory Book.
7. Используйте **Edit** рядом с существующим cast member, чтобы исправить character name или изменить назначенный этому member Memory Book.
8. Используйте плавающий **Active Cast** drawer, чтобы выбрать characters, присутствующих в следующем exchange.

Narrator Mode нужно отключить перед отключением Manual Lorebook Mode.

### 12.4 Drawer Active Cast и timeline metadata

Плавающий drawer Active Cast можно разворачивать, сворачивать, перемещать и использовать для выбора текущих участников состава.

Во время генерации STMB делает snapshot активного состава и сохраняет его в metadata сообщений:

- сообщение пользователя получает active-cast snapshot;
- ответ Narrator получает generation snapshot;
- continuation объединяет свой состав с существующими cast metadata;
- metadata swipe хранится отдельно для каждого swipe;
- выбор swipe может восстановить active cast из этой точки timeline;
- удаление последних сообщений может восстановить состояние состава по последнему оставшемуся tagged Narrator message.

Маркер состава фиксирует связь, а не выполняет semantic analysis прозы.

### 12.5 Извлечение при обычной генерации Narrator

Когда начинается генерация Narrator, STMB загружает Memory Books активного состава и объединяет их записи в character-lore collection для этого запроса, избегая дублирующихся пар world/UID.

Следствия:

- этим Narrator workflow добавляются только books active cast;
- omniscient book продолжает следовать обычной конфигурации/активации Manual Mode;
- per-character STLO filters для Narrator Mode не требуются;
- чтобы в контекст попали правильные character books, состав должен быть выбран правильно до генерации.

### 12.6 Определение участников сцены

Для выбранной сцены tagged Narrator responses считаются авторитетными. STMB объединяет cast IDs, записанные в сообщениях Narrator.

Если сцена содержит старые untagged Narrator messages, STMB использует fallback по continuity information из всех сообщений и просит подтвердить состав сцены. Текущие active cast members заранее выбраны. Пустой выбор означает, что ни один индивидуальный участник состава не присутствовал.

Это подтверждение предназначено именно для старых или неполных cast metadata; полностью tagged scenes его не требуют.

### 12.7 Распределение Memory

Scene Memory Narrator записывается как:

- одна canonical omniscient entry в основном Memory Book;
- одна linked copy в уникальном Memory Book каждого выбранного участника.

Копии Narrator не используют native character filters SillyTavern. Вместо этого STMB сохраняет Narrator participant и owner IDs в metadata записи.

Если отдельные multi-character prompts выключены, books участников получают копии omniscient summary. Если включены, каждый single-character book может получить character-focused generation.

### 12.8 Narrator consolidation и regeneration

Metadata ownership и participants Narrator переносится через источники consolidation. Благодаря этому записи более высокого уровня сохраняют, какой character book владеет копией и какие члены состава участвовали в исходном материале.

Regeneration использует эти metadata, чтобы определить, должен ли replacement prompt target быть omniscient/group-oriented или character-focused.

Как и real-group copies, linked Narrator entries после создания не синхронизируются в реальном времени.

### 12.9 Retiring участников состава

Cast manager может пометить member как retired и позже восстановить его. Retired members:

- удаляются из active-cast choices;
- удаляются из active-cast ID set;
- сохраняют stable identity/history metadata;
- сохраняют book reservation, предотвращая случайное повторное использование и смешение identities.

Используйте retirement для character, который покидает active cast, но историческую Memory identity которого необходимо сохранить.

Изменение character name или Memory Book cast member сохраняет stable identity и retired state этого member. Исправленное имя используется везде, где отображается этот member, и в будущих Memory output. Новое book assignment управляет будущим retrieval и Memory writes; оно не перемещает entries, уже записанные в предыдущий book.

---

## 13. Ветвление чатов

Native branches SillyTavern могут стать разными continuities. Если branch и parent записывают в одни и те же unlocked Memory Books, противоречивые временные линии могут смешаться.

**Copy Memory Books when branching** включено по умолчанию.

### 13.1 Что копируется

Когда STMB распознаёт новую native branch:

- Automatic Mode копирует активный chat-bound Memory Book;
- Manual Mode копирует main manual Memory Book;
- real group в Manual Mode копирует каждый уникальный unlocked character Memory Book;
- Narrator Mode копирует omniscient book и каждый declared character book;
- persistent real-character locks сохраняются, а не копируются, потому что lock означает «продолжать использовать этот же book».

Все books, скопированные одной операцией branch, используют один и тот же доступный lineage number:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branch от существующей branch сохраняет исходный lineage root, а не создаёт имена вроде `Branch 1 Branch 1`.

### 13.2 Переписанные metadata

В копиях STMB:

- переписывает совпадающие parent chat IDs на новый branch chat ID;
- перенаправляет canonical group/character links, если были скопированы оба linked books;
- обновляет bindings новой branch, чтобы они указывали на копии.

Он клонирует существующее содержимое и не регенерирует Memories.

### 13.3 Безопасность при сбое

Не переключайте чаты, пока идёт копирование branch.

Если копирование не удалось, STMB очищает у новой branch унаследованные writable bindings и записывает ошибку, чтобы branch не могла незаметно записывать в оригиналы parent.

### 13.4 Отключение копирования branch

Отключайте настройку только тогда, когда branch намеренно должна делить те же Memory Books и продолжающуюся историю с parent.

---

## 14. Clips

Clip сохраняет выбранный текст чата непосредственно в запись lorebook `[STMB Clip]`. Модель ИИ не вызывается.

### 14.1 Для чего использовать Clips

- предпочтение;
- обещание или секрет;
- имя или alias;
- предмет или питомец;
- короткий факт об отношениях;
- строка, которую нужно сохранить точно или почти точно;
- быстрая «заметка себе», для которой не нужна scene Memory.

### 14.2 Workflow

1. Выделите текст внутри сообщения чата.
2. Нажмите плавающую кнопку с ножницами.
3. Выберите существующую Clip entry или создайте новую.
4. Для новой записи выберите always-active или keyword-triggered поведение.
5. Проверьте текущую запись и обновлённый preview.
6. При необходимости переименуйте.
7. Сохраните.

Плавающая кнопка с ножницами появляется только после выделения текста чата и может быть отключена на основной панели.

### 14.3 Формат записи

Заголовок:

```text
Seraphina Healed Me [STMB Clip]
```

Содержимое:

```markdown
=== Seraphina Healed Me ===

- Seraphina healed the user’s wounds with magic.

=== END Seraphina Healed Me ===
```

Одна Clip entry содержит одну секцию. Сфокусированные заголовки помогают создавать сфокусированные activation keywords.

### 14.4 Существующие записи

Существующую запись можно считать Clip entry, добавив `[STMB Clip]` в конец заголовка. Длинные Clip entries можно редактировать вручную или compact.

Clips сохраняют только выбранный текст. Source attribution автоматически не добавляется.

---

## 15. Topical Clips

Topical Clip читает подтверждённые записи STMB Memory, явный диапазон сообщений текущего чата или оба источника и просит ИИ создать сфокусированную запись «об этой теме». Допустимые источники Memory могут включать scene Memories и consolidated summaries; записи Clip и Side Prompt исключаются из источников.

### 15.1 Когда использовать Topical Clip

Когда информация об одном предмете разбросана по нескольким Memories, например:

- повторяющийся NPC;
- история отношений;
- место или фракция;
- расследование или загадка;
- способности, травмы, обещания, предпочтения или секреты;
- важный объект;
- нерешённая сюжетная линия.

Topical Clip организован по предмету, а не по хронологии каждой source Memory.

### 15.2 Ограничения источников

Topical Clip использует:

- подтверждённые STMB Memory entries из выбранного source book, включая допустимые consolidated summaries;
- видимые сообщения из явно выбранного включительного диапазона `X-Y` в текущем чате.

Элементы **Include saved Memories** и **Include chat messages** можно использовать отдельно или вместе. Диапазоны сообщений следуют глобальной настройке unhide-before-memory и восстанавливают ранее скрытые сообщения после компиляции.

Он не использует:

- сообщения чата вне выбранного диапазона;
- обычные Clip entries;
- Side Prompt entries;
- несвязанные обычные записи lorebook.

### 15.3 Создание Topical Clip

1. Откройте Memory Books.
2. Нажмите **Topical Clip**.
3. Выберите source Memory Book.
4. Введите тему.
5. Введите activation keywords или оставьте пустыми, чтобы использовать тему.
6. Выберите новую запись или существующий target `[STMB Clip]` для обновления.
7. Выберите в качестве источников saved Memories, chat messages или оба.
8. При необходимости выберите только конкретные source Memories. Для сообщений чата укажите точный диапазон или нажмите **Extract…**, чтобы искать по всему текущему чату и выбирать отдельные сообщения, включая несмежные и скрытые.
9. Выберите generation profile.
10. Сгенерируйте draft.
11. Проверьте и отредактируйте его.
12. Сохраняйте только когда результат корректен.

Сгенерированный draft никогда не сохраняется автоматически.


### Объединение существующих Topical Clips

В окне **Topical Clip** нажмите **Combine Clips**. Выберите Memory Book, не менее двух Topical Clips (при необходимости включая disabled clips) и укажите title нового clip. Показываются только Topical Clips, созданные STMB; обычные Clips исключены. Activation keywords нового clip являются объединением primary keywords выбранных clips без дублей. Secondary keyword conditions не копируются.

Выберите generation profile и нажмите **Generate Draft**. AI получает title и полный content каждого выбранного clip и получает инструкцию объединить подтверждённые факты, убрать повторения и сохранить нерешённые противоречия. Проверьте и отредактируйте draft перед сохранением. Изменение выбранных sources, title или Memory Book очищает draft. Если source изменился до сохранения, сгенерируйте новый draft.

**Disable original clips after saving** включено по умолчанию. Отключите, чтобы сохранить текущие activation states исходных clips. При сохранении создаётся новый enabled Topical Clip, а при включённой option исходные clips отключаются в том же обновлении Memory Book. Исходные clips никогда не удаляются. Объединённый clip записывает source IDs отдельно от обычной истории Memory-source Topical Clip.

Если в чате выделен текст, плавающий control предлагает **Clip** и **Extract**. Extract открывает тот же message picker, используя выделенный текст как search query. Он ищет по всей истории текущего чата, включая сообщения, не отрисованные на экране. Пустой search показывает все сообщения. Search сопоставляет literal text или имена speakers без учёта регистра; **Hidden only** ограничивает результаты скрытыми сообщениями.

Результаты выводятся пакетами по 50. Используйте **Load more**, чтобы показать больше результатов, разверните результат для чтения полного текста с подсвеченными совпадениями или используйте **Previous message** и **Next message**, чтобы показать соседний context. Context messages не выбираются автоматически и могут отображаться, даже если не соответствуют search или фильтру Hidden only. Hidden messages помечаются; выбор такого сообщения добавляет его текст в source Topical Clip, не выполняя unhide в чате.

Выбор сохраняется между поисками и изменениями фильтра. Selection count включает сообщения вне текущего списка результатов. **Select loaded results** выбирает все отображаемые результаты, включая показанные context messages; **Clear selection** снимает весь выбор. Выберите **Topical Clip** из standalone Extract или **Use selected messages** при возврате в существующий editor. Query задаёт начальные topic и keywords, которые остаются редактируемыми.

STMB записывает source fingerprints, когда сообщения попадают в picker, и повторно проверяет выбранные сообщения перед принятием, генерацией draft и сохранением. Если выбранный source изменился, **Refresh results** очищает selection и перезагружает результаты, чтобы sources можно было выбрать заново. Завершите или отмените незавершённое редактирование сообщения перед поиском. Переключение чата закрывает picker. Extract не ищет по другим чатам.

### 15.4 Обновление существующего Topical Clip

После успешного запуска STMB записывает, какие source Memories были использованы, а при необходимости также source chat, диапазон сообщений, IDs и hashes. Последующее обновление на основе Memories обычно отправляет только новые или изменённые source Memories вместе с существующим содержимым Clip. Диапазоны сообщений всегда выбираются явно.

Используйте **Rebuild from all source memories**, если:

- текущая запись неполная или плохо организована;
- prompt изменился;
- старые Memories были существенно отредактированы;
- нужно заново рассмотреть всю тему.

### 15.5 Ручной выбор источников и предупреждения о tokens

Используйте **Use only selected memories**, если book большой, тема относится только к одному периоду истории, имена пересекаются или нужен строгий контроль доказательств.

STMB оценивает размер запроса и предупреждает при превышении настроенного token threshold. Сократите источники, осознанно поднимите threshold или выполните один запуск несмотря на предупреждение.

### 15.6 Стандарт проверки

Проверьте, что draft:

- остаётся в рамках темы;
- сохраняет имена и отношения;
- включает основные релевантные факты;
- отмечает противоречия, а не молча выбирает одну версию;
- не придумывает объяснения, не подтверждённые source Memories;
- объединяет обновления без лишнего дублирования.

### 15.7 Placeholders prompt

Custom Topical Clip prompt должен содержать `{{SOURCE_MEMORIES}}`, когда выбраны saved Memories, и `{{SOURCE_MESSAGES}}`, когда выбраны chat messages.

Source placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Поддерживаемые placeholders включают:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Если custom prompt перестал давать полезный результат, используйте Reset to Default.

---

## 16. Боковые Промпты

Side Prompt — это именованный prompt STMB, который запускается отдельно от обычного ответа персонажа. Обычно он создаёт или обновляет одну продолжающуюся вспомогательную запись, а не ещё одну последовательную scene Memory.

В списке **Trackers & Side Prompts** иконка питания немедленно меняет общую flag **Enabled** prompt: зелёная означает enabled, тусклая — disabled. Этот элемент не добавляет, не удаляет и не меняет настроенные triggers prompt.

### 16.1 Подходящие применения

- trackers сюжета и нерешённых линий;
- состояние отношений;
- статус NPC или фракций;
- инвентарь и ресурсы;
- травмы, статистика или репутация;
- timelines, даты, сроки и поездки;
- улики, подозреваемые и противоречия;
- изобретения, исследования и проекты;
- отчёты о рисках continuity;
- сводки состояния мира.

Избегайте расплывчатых prompts «отслеживать всё», дублирования scene summaries или задач, которые должны появляться внутри следующего roleplay response.

### 16.2 Формат вывода

Side Prompts обычно ожидают итоговый plain text или Markdown, готовый к сохранению. Memory JSON не требуется. JSON допустим только если пользователь намеренно хочет хранить JSON как текст tracker.

### 16.3 Последовательность запуска

Обычный запуск собирает:

1. инструкции Side Prompt;
2. предыдущую сохранённую tracker entry, если она есть;
3. необязательные previous Memories;
4. необязательный Additional Context;
5. выбранный или since-last текст сцены;
6. необязательные инструкции Response Format.

Предыдущая запись — это существующее состояние для пересмотра, а не доказательство того, что каждое старое утверждение должно сохраниться. Prompts должны явно удалять устаревшую, решённую, противоречащую или дублирующую информацию.

### 16.4 Ручные запуски

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Имена с пробелами следует заключать в кавычки. Указанный диапазон включительный.

Ручные запуски лучше всего подходят для целевого анализа и prompts, требующих значений runtime macros.

### 16.5 Автоматические запуски после Memory

Side Prompt может включить **Run automatically after memory**.

После этого чат использует один из двух режимов автоматического выбора:

- individually enabled Side Prompts; или
- один selected Side Prompt Set.

Выбранный set заменяет individually enabled automatic prompts для этого чата, а не добавляется к ним.

#### Memory Assistance Side Prompt

**Memory Assistance** — зарезервированный Side Prompt с пятью независимыми режимами. Он запускается после успешного сохранения Memories независимо от обычного включения Side Prompt или выбранного Side Prompt Set. Во время Memory regeneration он не запускается.

Memory Assistance сравнивает raw processed scene с обычными и Topical Clips в каждом Memory Book, который получил Memory. Для каждого проверяемого Clip в ИИ отправляются title/topic, keywords, current content, stable ID и type.

Если доступна job queue, после сохранения Memory каждый target Memory Book получает отдельную задачу **Memory Assistance**. Ошибка request, response-validation, report-save или automatic-application переводит эту задачу в **Failed** и показывает ошибку в очереди. Сохранённая Memory остаётся **Completed**, и retry Memory Assistance не регенерирует Memory.

- **Off** отключает Memory Assistance.
- **Update** напрямую проверяет пять Clips или меньше; при большем количестве открывается список выбора. Предлагаемые изменения ждут ручного подтверждения.
- **Suggest** обнаруживает новые topics для Topical Clip, не проверяя и не обновляя существующие Clips.
- **Update and Suggest** сначала делает один запрос topic-discovery, затем выполняет тот же existing-Clip review workflow, что и Update.
- **Automatic** проверяет каждый Clip пакетами по tokens, не спрашивая, какие Clips проверять. Корректные добавления в обычные Clips применяются напрямую, а замены Topical Clip остаются на подтверждение в **Memory Assistance Suggestions**.

- В режимах Update и Update and Suggest большой список выбора содержит **Query Selected** и **Query All**.
- Query All и Automatic используют token-based batches вместо того, чтобы помещать все Clips в один слишком большой запрос.
- Для каждого обычного Clip предлагается не более одного точного отрывка сообщения как addition.
- Topical Clips получают полные replacement drafts.
- Ответ ИИ — простой JSON object, напрямую сопоставляющий каждый затронутый Clip UID с предложенным отрывком или replacement. Пустой object означает, что обновлять Clips не нужно.
- Результаты Update записываются в `Memory Assistance (STMB SidePrompt)` и остаются неприменёнными до подтверждения через **Memory Assistance Suggestions**.
- Результаты Automatic mode записывают количество применённых добавлений в обычные Clips и сохраняют Topical Clip replacements и ошибки применения для ручной проверки.
- Отмена выбора очищает старые suggestions, чтобы их не перепутали с результатами последней сцены.

Update and Suggest использует отдельный suggestion-only prompt перед existing-Clip review batches. Запрос содержит обработанную сцену и лёгкий список titles, topics и keywords существующих Topical Clips. Обычные Clips и existing Clip bodies на этапе discovery не отправляются. ИИ возвращает от нуля до пяти новых topics в виде JSON objects с topic и activation keywords; `{"topics":[]}` — корректный результат.

Предложенные topics сохраняются в отчёте Memory Assistance. В **Memory Assistance Suggestions** выберите **Review Topics**, чтобы увидеть их как отмеченные редактируемые строки. Можно снять отметки с ненужных тем, изменить имена или keywords либо добавить дополнительные темы. Подтверждённые topics открывают стандартный Topical Clip draft workflow по одному. Pending topic удаляется только после сохранения его Topical Clip; закрытие draft оставляет его доступным через **Memory Assistance Suggestions**.

Когда suggestions готовы к проверке, STMB открывает popup завершения для обновлённого Memory Book. **Dismiss** закрывает уведомление, а **Go to Suggestions** открывает **Memory Assistance Suggestions** с уже выбранным Memory Book. Если открыть **Memory Assistance Suggestions** из меню расширения, сначала выбирается effective Memory Book текущего чата: chat-bound book в Automatic Mode или resolved manual book в Manual Mode.

Update и Topic Suggestions prompts и override connection profile можно редактировать независимо, но оба structured response contracts фиксированы. Memory Assistance нельзя удалить, дублировать, добавить в Side Prompt Set или запустить вручную.

### 16.6 Автоматические интервалы видимых сообщений

Side Prompt может включить **Run on visible message interval** и указать количество видимых сообщений после checkpoint.

Скрытые и системные сообщения не учитываются.

Если активен set, кандидатами являются только строки этого set, чей referenced prompt имеет соответствующий interval trigger.

### 16.7 Side Prompt Sets

Side Prompt Set — это упорядоченный список запусков, а не просто папка. Один template может встречаться несколько раз с разными значениями macros.

Пример:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Строки могут хранить:

- ссылку на prompt;
- необязательный label;
- значения runtime macros;
- порядок;
- действия duplicate или delete.

Строки выполняются сверху вниз.

Ручные команды set:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Default sets и выбор для конкретного чата

General Settings может задавать:

- default set для solo chats;
- default set для group chats.

Каждый чат может:

1. наследовать применимый default;
2. явно использовать individually enabled prompts;
3. выбрать именованный set.

Пустой глобальный default означает individual mode.

Если выбранный set удалён, STMB выдаёт предупреждение, а не молча подставляет другой workflow. Отсутствующий row prompt или unresolved macro приводит к пропуску этой строки с предупреждением.

Set определяет candidate rows. Каждый referenced Side Prompt всё равно должен иметь соответствующий automatic trigger для after-Memory или interval execution. Ручные set commands этих trigger checkboxes не требуют.

### 16.9 Macros

Side Prompts могут использовать обычные macros SillyTavern, например:

```text
{{user}}
{{char}}
```

Нестандартные placeholders `{{...}}` являются runtime macros. Их нужно передать вручную или сохранить в строке set.

Примеры:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Prompt с unresolved runtime macros нельзя запускать автоматически. Automatic runs не могут остановиться, чтобы запросить значения.

### 16.10 Macros количества Memory

STMB регистрирует целочисленные macros для effective main Memory Book:

| Macro | Количество |
|---|---|
| `{{memtier0}}` | scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip entries |
| `{{memside}}` | Side Prompt entries |

Effective main book — это chat-bound book в Automatic Mode или resolved main manual book в Manual Mode. В multi-book group или Narrator setup значения не суммируют все character books.

Macro количества даёт только число, а не содержимое этих записей.

### 16.11 Диапазоны сообщений

Явный диапазон использует ровно этот включительный диапазон. Без диапазона STMB использует поведение since-last checkpoint/cap Side Prompt.

Используйте явные диапазоны для debugging, целевой очистки или повторного запуска известного участка.

### 16.12 Additional Context и previous Memories

Side Prompt может включать до семи previous scene Memories.

Источник Additional Context может быть:

- none;
- **Follow chat**, использующий выбранный Context Setting чата;
- один фиксированный именованный Context Setting.

Это справочные материалы. Prompt не должен слепо копировать их в tracker.

### 16.13 Lorebook targets

Side Prompt обычно сохраняется в effective Memory Book. Вместо этого он может использовать:

1. per-chat target override;
2. template-level target;
3. effective Memory Book как fallback.

Корректный per-chat override имеет приоритет.

Используйте альтернативные targets для намеренно общего campaign book или dedicated tracker book. Не разбрасывайте trackers без плана извлечения.

### 16.14 Настройки записи Side Prompt

Template может задавать:

- title override;
- keywords;
- activation Normal, Constant или Vectorized;
- insertion position и Outlet name;
- order mode/value;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Поля title и keyword могут раскрывать применимые macros. **Ignore Budget** следует использовать осторожно: несколько всегда включаемых trackers могут занять значительную часть контекста.

### 16.15 Override connection profile

Side Prompt может наследовать обычное определение подключения Memory Books или привязать конкретный профиль STMB. Override полезен для более дешёвой модели или модели, лучше подходящей для структурированного обслуживания. Избыточные комбинации профилей усложняют troubleshooting.

### 16.16 Regeneration Side Prompt

Совместимые сохранения теперь хранят snapshot версии 2, содержащий:

- Side Prompt template key;
- предыдущее содержимое записи для regeneration;
- существовала ли запись до запуска и её точное предыдущее состояние, исключая более старый rollback snapshot;
- исходный чат и включительный диапазон;
- значения runtime macros;
- fingerprint точного состояния записи, записанного STMB.

Чтобы выполнить regeneration, откройте редактор lorebook и нажмите **Regenerate side prompt**. Replacement использует сохранённый snapshot вместе с текущим template и текущими настройками profile/context.

Regeneration не может завершиться, если template удалён, source chat/range недоступен или target/source изменился во время генерации. Заменяется только содержимое; существующие title, keywords и настройки записи сохраняются. Legacy snapshots версии 1 продолжают поддерживать regeneration, но не могут использоваться Memory Auto-Rollback.

### 16.17 Написание хороших Side Prompts

Хороший Side Prompt определяет:

- точную задачу обслуживания;
- какой source material проверять;
- нужно ли revise, replace, merge или append;
- какую устаревшую информацию удалить;
- стабильные headings и ordering вывода;
- строгий предел длины;
- поведение final-output-only.

Пример:

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

Полезные ограничения:

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

Стабильные headings уменьшают drift при повторных обновлениях.

### 16.18 Устранение проблем Side Prompt

Если prompt не запустился:

- убедитесь, что событие Memory или interval действительно произошло;
- проверьте individual/set selection чата;
- убедитесь, что referenced prompt всё ещё существует;
- убедитесь, что соответствующий automatic trigger включён;
- убедитесь, что у всех runtime macros есть значения;
- проверьте, не отменили ли его `/stmb-stop` или failed job.

Если он запустился дважды:

- проверьте manual плюс automatic invocation;
- дублированные set rows;
- дублированные копии prompt;
- несколько tabs/chats, запускающих работу.

Если запись попала не в тот book, проверьте как per-chat, так и template-level target scopes.

Если вывод бесконечно растёт, добавьте явные правила replacement, pruning, item-count и word-count.

---

## 17. Consolidation

Consolidation объединяет lower-tier STMB Memories или summaries в higher-tier chronological recaps.

### 17.1 Уровни

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation работает с существующими STMB entries, а не напрямую с raw chat.

### 17.2 Назначение

Используйте, когда:

- scene Memories накапливаются;
- старому материалу больше не нужен полный detail сцены;
- завершена крупная фаза отношений, сюжета или кампании;
- нужно снизить использование tokens, сохранив continuity;
- нужна более чистая хронология высокого уровня.

Consolidated entries должны подчёркивать долгосрочные изменения, turning points, цели, последствия, изменения отношений, нерешённые линии и стабильное состояние.

### 17.3 Ручной workflow

1. Откройте **Consolidate Memories**.
2. Проверьте отображаемый source Memory Book. Выберите другой book, если настроенный manual или chat-bound book не является нужным источником consolidation. Этот выбор действует только для текущего запуска и не меняет настроенный Memory Book чата.
3. Выберите target tier.
4. Выберите eligible source entries.
5. Выберите настройки consolidation prompt/profile.
6. Решите, нужно ли отключить source entries после успешной consolidation.
7. Запустите процесс и проверьте candidates.
8. Подтвердите нужные summaries.

### 17.4 Readiness prompts — не автоматическая consolidation

**Prompt for consolidation when a tier is ready** следит за выбранными target tiers. Когда достигается сохранённый минимум eligible count, STMB показывает yes/later prompt. Выбор Yes открывает интерфейс consolidation. Ничего не консолидируется молча.

### 17.5 Schema вывода consolidation

Обычная consolidation ожидает строгий JSON:

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

Модель может вернуть одну или несколько summaries. `member_ids` привязывает каждый source к возвращённой summary. Outliers должны попадать в `unassigned_items`, а не насильно включаться в несвязанную сводку.

### 17.6 Previous higher-tier summary

Previous summary в target tier можно передать как canon context. Это не source material для переписывания. Prompts consolidation должны отличать её от обрабатываемых lower-tier entries.

### 17.7 Previews и неудачные ответы

Consolidation previews могут позволять редактировать, принимать, регенерировать один candidate из тех же sources или регенерировать pending batch.

Malformed или failed AI responses можно просмотреть и, где поддерживается, исправить вручную до commit.

### 17.8 Отключение sources

Если функция включена, после успешной consolidation STMB отключает source entries, чтобы higher-tier summary могла взять на себя retrieval. Это обратимо через редактирование lorebook.

### 17.9 Хорошие prompts consolidation

Они должны определять:

- цель сжатия;
- создавать одну сводку или минимальное связное число;
- логику chronology и grouping;
- детали, которые должны сохраниться;
- явную обработку outliers;
- точную структуру JSON.

Они должны сохранять major beats, последствия, обещания, изменения отношений, идентификаторы, нерешённые линии и удобные для retrieval keywords, удаляя повторяющиеся детали уровня сцен.

---

## 18. Compaction

Compaction просит ИИ сократить одну существующую STMB-managed entry и показывает оригинал и draft до замены.

### 18.1 Допустимые записи

- `[STMB Clip]` entries;
- Side Prompt entries;
- STMB Memory entries.

Обычные non-STMB lorebook entries не показываются.

### 18.2 Workflow

1. Откройте **Compaction**.
2. Выберите Memory Book.
3. Выберите Compaction Profile.
4. При желании отредактируйте Compaction Prompt.
5. Выберите одну запись.
6. Сравните original и compacted token estimates/content.
7. При необходимости отредактируйте draft.
8. Замените, скопируйте draft или отмените.

Оригинал не меняется до выбора **Replace with Compacted Version**.

### 18.3 Хорошие применения

- длинные коллекции Clip;
- повторяющийся или устаревший tracker content;
- слишком многословные scene Memories;
- always-active entries, занимающие слишком много контекста.

Compaction не предназначена для добавления фактов, сводки raw chat, создания новой Memory или обработки обычных lorebook entries.

### 18.4 Placeholders prompt

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Prompt должен сохранять факты, имена, местоимения, macros, wrapper headings и end markers, удаляя повторения и малополезные формулировки.

---

## 19. Regeneration

Regeneration создаёт проверяемую замену существующей записи. Она не создаёт вторую нумерованную запись и никогда не перезаписывает без подтверждения.

### 19.1 Regeneration scene Memory

- откройте source chat;
- откройте Memory Book в редакторе lorebook;
- нажмите **Regenerate memory**;
- для canonical group entry с linked character entries выберите regeneration только нажатой записи или всех linked entries;
- выберите текущие profile, prompt, previous-memory count и Additional Context;
- проверьте title, content и keywords для каждой выбранной записи.

Исходный диапазон сцены и sequence number сохраняются. Linked entries используют те же выбранные regeneration settings, но генерируются с собственным контекстом Memory Book и group/character prompt target. STMB собирает все подтверждения до начала сохранения direct regenerations. Если все source messages скрыты, раскройте их или включите unhide-before-generation.

### 19.2 Regeneration consolidation

Higher-tier summary регенерируется из своего точного набора linked lower-tier sources с помощью специального preset **Regenerate Consolidation**.

Полный набор sources должен всё ещё существовать на правильном tier. Lower-tier source нельзя регенерировать, пока активная parent summary от него зависит; если намеренно перестраиваете нижний tier, сначала удалите parent.

### 19.3 Regeneration Side Prompt

См. правила snapshot Side Prompt в разделе 16.16.

### 19.4 Проверки безопасности

Непосредственно перед заменой STMB проверяет, что:

- target entry не изменена;
- source chat range не изменился;
- обязательные consolidation sources не изменены и доступны;
- запись остаётся eligible.

Если любая проверка не проходит, ничего не перезаписывается.

Linked group, character и Narrator copies остаются независимыми.

---

## 20. Контекст для генерации

В запросе STMB могут встречаться несколько источников контекста. Они не взаимозаменяемы.

### 20.1 Current scene

Диапазон сообщений, который обрабатывается сейчас. Это target material для обычной scene Memory.

### 20.2 Previous Memories

Более ранние scene Memories из effective Memory Book, включённые как read-only continuity context. Обычно пользователь может включить 0–7.

Их не следует сводить повторно только потому, что они идут перед current scene.

### 20.3 Additional Context

Выбранные записи lorebook, передаваемые как стабильный справочный материал, например:

- правила персонажа или сеттинга;
- канонические имена и терминология;
- ограничения кампании;
- авторитетная timeline;
- справка о местах;
- факты, которые подразумеваются, но не повторяются в сцене.

Additional Context идёт перед Previous Memories и transcript сцены. Это reference material, а не ещё одна сцена.

### 20.4 Context Settings

Context Setting — это повторно используемая упорядоченная коллекция Additional Context entries.

Workflow:

1. откройте **Context Settings**;
2. создайте именованный setting;
3. выберите lorebook entries;
4. упорядочьте их;
5. выберите setting для текущего чата или явно выберите No Context.

Выбор сохраняется per chat и работает как с Current SillyTavern Settings, так и с сохранёнными профилями.

Если referenced book или entry исчезает, STMB предупреждает, пропускает stale reference и продолжает. Если удалён весь Context Setting, чаты, которые на него ссылались, продолжают работу без Additional Context до нового выбора.

Context Settings можно дублировать, импортировать и экспортировать как `stmb-context-settings.json`.

### 20.5 Prior Side Prompt entry

Текущий текст tracker, который нужно пересмотреть. Это состояние, а не доказательство того, что все старые утверждения остаются верными.

### 20.6 Consolidation sources

Lower-tier entries, которые являются фактическим материалом для группировки и сжатия.

### 20.7 Previous higher-tier summary

Canon, переносимый вперёд во время consolidation. Это не source для переписывания.

### 20.8 Правильный порядок по workflow

Обычная Memory:

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

Prompts должны чётко обозначать target material и reference-only material.

---
## 21. Архитектура промптов, встроенные Summary Prompts и правила написания

В STMB есть три основные системы структурированной генерации и несколько специализированных вспомогательных workflow.

### 21.1 Обычная генерация Memory

STMB ожидает один JSON object:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Правила:

- возвращайте только JSON object;
- используйте точные keys `title`, `content` и `keywords`;
- `keywords` должен быть JSON array of strings;
- заголовок должен быть коротким и читаемым;
- используйте конкретные retrieval terms;
- нужный Markdown помещайте внутрь строки `content`;
- правильно экранируйте кавычки.

STMB умеет исправлять некоторые fences, trailing commas, think tags, wrappers и небольшие malformed output, но prompt не должен полагаться на восстановление.

Сильный Memory prompt указывает:

1. желаемый стиль Memory и степень сжатия;
2. continuity-relevant information, которую нужно сохранить;
3. filler, OOC или неподтверждённый материал, который нужно исключить;
4. точный JSON schema.

Слабые prompts задают стиль, но не структуру, просят анализ вместо итогового object, смешивают previous context с current scene или используют абстрактные keywords.

### 21.2 Встроенные Summary Prompts и выбор одного

Эти presets предназначены только для обычной генерации Memory. Они не управляют Consolidation, Side Prompts, Topical Clips или Compaction. Профиль выбирает один в **Memory Creation Method**. **Summary** является обычным fallback/default, если профиль не указывает другой preset. Built-in означает «поставляется STMB», но не означает, что все presets запускаются или одинаково подходят одному чату.

Универсально лучшего prompt нет, потому что detail, readability, retrieval quality и token cost тянут в разные стороны. Практический краткий ответ:

- **Лучший стартовый default для большинства пользователей: Summary.** Сбалансированный и универсальный, подходит для первой проверки новой модели.
- **Лучший для долгого roleplay, где важна continuity: Comprehensive.** Даёт наиболее сильные инструкции по фильтрации, причинности, continuity и keywords, но больше требует от модели и может создавать более крупную structured Memory.
- **Лучший, когда главное — экономия context tokens: Minimal.** Намеренно краткий и теряет нюансы.
- **Лучший для отдельных character books реальной группы или Narrator: Group и Character.** Используйте их вместе через настройку отдельных group/character prompts профиля; это targeting prompts, а не конкурирующие универсальные стили.

| Встроенный prompt | Лучшее применение | Основной trade-off |
|---|---|---|
| **Summary** | Большинство solo chats и первичная настройка. Создаёт подробную хронологическую прозу с важными событиями, взаимодействиями, развитием, раскрытиями, результатами и конкретными retrieval keywords. | Сохраняет больше деталей, чем может хотеть пользователь с жёстким token budget, но проще и менее требователен, чем наиболее структурированные presets. |
| **Comprehensive** | Долгие истории, чувствительные к continuity, где важны причинные цепочки, character dynamics, established facts, key exchanges, unresolved threads и дисциплинированные keywords. Явно отфильтровывает случайные детали и улучшает построение keywords. | Самые длинные и требовательные инструкции. Нужна модель, хорошо следующая инструкциям, и достаточное количество response tokens. |
| **Summarize** | Пользователи, которым нужен очень удобный для просмотра Markdown record, разбитый на Timeline, Story Beats, Key Interactions, Notable Details и Outcome. | Bullet-heavy output может больше походить на справочные заметки, чем на естественную память, и повторять факты между разделами. |
| **Synopsis** | Сцены, где важнее сохранить почти каждый значимый beat, interaction, detail и outcome, чем сэкономить место. | Намеренно длинный и исчерпывающий; один из наименее подходящих вариантов при жёстком lorebook/context budget. |
| **Sum Up** | Хронологический narrative beat record с видимым заголовком сцены и timeline, но без столь большого sectional overhead, как у Summarize или Synopsis. | Меньше явного разделения между events, character dynamics, facts и continuity state. |
| **Minimal** | Чаты большого объёма, дешёвое архивное покрытие или setup, где Memories должны занимать совсем мало контекста. Создаёт краткую Memory из двух–пяти предложений. | Могут теряться важные мотивы, эмоциональные сдвиги, причинность и небольшие continuity details. |
| **Northgate** | Пользователи creative writing, которым нужен связный literary record в третьем лице и прошедшем времени с акцентом на actions, emotional shifts, development и significant dialogue. Этот community style приписывается Northgate из SillyTavern Discord. | Оптимизирует читаемую narrative, а не максимальное сжатие или чётко разделённые reference categories. В отличие от большинства общих presets, его встроенный текст не исключает OOC явно, поэтому при частом OOC его нужно проверять. |
| **Aelemar** | Крупные сюжетные сцены и эмоционально значимые моменты персонажей, которые должны оставаться понятными как самостоятельная запись, даже если source scene недоступна. Этот community style приписывается Aelemar из SillyTavern Discord. | Требует минимум 300 words и намеренно подробен, поэтому плохо подходит для агрессивной экономии tokens. Его встроенный текст также не исключает OOC явно. |
| **Group** | Shared/omniscient Memory Book в реальной группе или omniscient target в multi-book workflow. Сохраняет решения и состояние группы, правильно приписывая actions, emotions и knowledge конкретным участникам. | Не используйте как Memory индивидуального персонажа; он намеренно сосредоточен на общей continuity группы. |
| **Character** | Character-focused Memory Book в real-group или multi-character workflow. Записывает, что персонаж сделал, знал, чувствовал, узнал, скрывал, неправильно понимал или как был затронут. | Намеренно исключает материал сцены, не относящийся к target character, и ограничивает неподтверждённые private knowledge. |

В новой установке используйте **Summary**, пока generation и retrieval не будут надёжно работать. Затем меняйте только prompt и сравнивайте несколько Memories похожих сцен. Предпочитайте **Comprehensive**, если проблема — пропущенная причинность, continuity state или слабые keywords; **Minimal**, если проблема — размер Memory. Смена prompts не компенсирует слабую модель, обрезанный вывод, плохие границы сцен или неправильные настройки retrieval.

Точный встроенный текст можно пересоздать для текущего locale SillyTavern. Пересоздание built-ins удаляет локальные изменения в этих built-ins, но не должно удалять несвязанные custom presets. Дублируйте или экспортируйте изменённый built-in до пересоздания.

### 21.3 Multi-character prompt targeting

Если отдельные group/character prompts включены, STMB помечает request target как:

- `group` для canonical real-group или omniscient Narrator Memory;
- `character` для версии индивидуального character book.

Prompt должен явно использовать perspective target и не придумывать знания, не подтверждённые сценой и переданным контекстом.

### 21.4 Написание Side Prompt

Side Prompts обычно возвращают plain text или Markdown. Пишите их как инструкции по обслуживанию, а не как Memory prompts.

Сильный Side Prompt:

- определяет одну узкую задачу;
- объясняет, как использовать предыдущий tracker;
- удаляет stale state;
- требует стабильных headings и ограничений длины;
- возвращает только итоговый tracker.

### 21.5 Написание Consolidation

Обычная consolidation требует schema из раздела 17.5. Сильный prompt:

- сохраняет хронологию;
- создаёт минимальное связное число summaries;
- назначает каждый использованный source через `member_ids`;
- отмечает остатки через `unassigned_items`;
- сохраняет крупные изменения и нерешённую continuity;
- использует конкретные keywords.

Специальный preset **Regenerate Consolidation** предназначен для одной replacement summary и не выбирается как обычный default consolidation.

### 21.6 Написание Topical Clip

Prompt должен содержать `{{SOURCE_MEMORIES}}`, оставаться сфокусированным на запрошенной теме, различать source evidence и inference, объединять новый материал с existing Clip content и показывать противоречия.

### 21.7 Написание Compaction

Prompt должен содержать `{{ENTRY_CONTENT}}` и сокращать без добавления неподтверждённых фактов. Он должен сохранять structural wrappers и macros, необходимые записи.

### 21.8 Checklist для prompt

Перед завершением любого STMB prompt ответьте:

1. Какой материал является фактическим target анализа?
2. Какой материал только reference?
3. Ожидает ли этот путь строгий JSON или итоговый plain text?
4. Какая информация должна сохраниться для последующего retrieval?
5. Что нужно omit, merge, carry forward или оставить unassigned?

Правильность формата ответа важнее стиля.

---

## 22. Summary Prompt Manager и Consolidation Prompt Manager

### Summary Prompt Manager

Может создавать, редактировать, дублировать, удалять, импортировать и экспортировать presets обычных Memory prompts. Назначайте preset через профиль Memory Books.

Все обычные Memory presets должны сохранять обязательный Memory JSON schema.

Руководство по выбору built-in Summary Prompt и лучшим применениям см. в разделе 21.2.

### Consolidation Prompt Manager

Управляет prompts для группировки lower-tier entries в higher-tier summaries и выбирает обычный default consolidation prompt.

Preset consolidation, предназначенный только для regeneration, нельзя использовать для обычной consolidation.

### Import и localization behavior

Built-in prompts можно пересоздать в текущем locale приложения. Сделайте backup локально изменённых built-ins перед пересозданием.

---

## 23. STMB и другие расширения

Расширения SillyTavern работают рядом друг с другом и могут читать или изменять одни и те же данные SillyTavern. STMB не переопределяет, не отключает и не устанавливает приоритет над другим расширением. Если поведение пересекается, итог зависит от настроек и timing всех задействованных расширений.

### 23.1 Общее состояние видимости сообщений

Скрыто ли сообщение чата — часть общего состояния сообщений SillyTavern. Это не состояние, принадлежащее только STMB.

Настройки **Token Saving** STMB могут скрывать обработанные сообщения после сохранения Memory. Другое расширение может позднее раскрыть их, и STMB не будет этому препятствовать. Аналогично, **Unhide hidden messages for memory generation** может раскрывать сообщения, пока STMB обрабатывает или регенерирует выбранный диапазон.

### 23.2 Presence

Расширение Presence и STMB оба могут менять hidden/visible state сообщений чата. Если Presence показывает сообщения, скрытые STMB, настройка Token Saving STMB не была удалена или проигнорирована; более позднее действие Presence изменило то же состояние сообщения SillyTavern.

Если вы используете Presence и хотите, чтобы скрытые STMB сообщения оставались скрытыми, используйте собственную функцию блокировки hidden messages Presence. В настоящее время Presence предоставляет команду `/presenceLockHiddenMessages`. Запускайте её для нужного диапазона и повторяйте по мере роста диапазона. Актуальное поведение команды см. в документации Presence.

STMB не настраивает и не вызывает Presence автоматически, а обработка участников group chat не связана с Token Saving.

### 23.3 Интеграция Regex

STMB интегрируется с расширением Regex SillyTavern на двух этапах:

1. **Outgoing/User Input:** преобразует собранный prompt до отправки.
2. **Incoming/AI Output:** очищает или стандартизирует raw response до parsing/saving.

Включите **Use regex (advanced)**, затем откройте **Configure regex** и выберите один или несколько scripts для каждого направления.

Важно: выполнение определяется собственным выбором STMB. Script, выбранный STMB, может выполняться даже если он disabled в обычном интерфейсе расширения Regex.

Используйте Regex только если понимаете преобразование. Плохое outgoing rule может повредить обязательные schema instructions; плохое incoming rule — повредить корректный JSON.

---

## 24. Заголовки записей лорбука и политика символов

### 24.1 Placeholders заголовка

Форматы заголовков профиля могут использовать:

- `{{title}}` — заголовок, сгенерированный ИИ;
- `{{scene}}` — исходный диапазон;
- `{{char}}` — имя персонажа/группы;
- `{{groupname}}` — display name текущей группы; вне group chat разрешается как `Unknown`;
- `{{present}}` — разделённый запятыми список персонажей, присутствующих в сцене: individual speakers в group chat, выбранный Active Cast сцены в Narrator Mode или текущий персонаж в обычном character chat;
- `{{user}}` — имя пользователя;
- `{{messages}}` — число сообщений сцены;
- `{{profile}}` — имя профиля;
- поддерживаемые placeholders даты и времени.

### 24.2 Автонумерация

Поддерживаемые numbering tokens включают формы:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB назначает последовательные числа с заполнением нулями согласно выбранному формату.

### 24.3 Печатаемый Unicode

В заголовках разрешены все печатаемые Unicode characters, включая emoji, accented text, CJK и symbols. Управляющие Unicode characters U+0000–U+001F и U+007F–U+009F удаляются.

Имена файлов lorebook, используемые Auto-Create, отдельно очищаются от зарезервированных для файловой системы символов и ограничиваются по длине.

---

## 25. Очередь задач и повторные попытки

Необязательная очередь требует Chat Top Bar / Chat Top Info Bar. Когда очередь доступна, regeneration Memory, consolidation или Side Prompt создаёт regeneration job; replacement остаётся в review до подтверждения.

Drawer **Memory Books Jobs** может показывать:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Jobs, обрабатывающие диапазон чата, показывают начальный и конечный номера сообщений в строках очереди. Drawer также умеет отменять active work, повторно открывать review jobs, просматривать failures, повторять работу и скрывать terminal history rows.

Варианты retry:

- **Retry:** повторно запускает один non-Memory job, например Side Prompt или consolidation.
- **Retry All:** повторно запускает/возобновляет Memory и связанный after-Memory Side Prompt work. Если Memory уже сохранена, STMB может продолжить с этого результата вместо создания дубликата.
- **Retry Memory:** повторно запускает/возобновляет только Memory и намеренно пропускает after-Memory Side Prompts.

Используйте Retry All, чтобы восстановить комбинированный workflow; Retry Memory — когда tracker work запускать не нужно.

Сохранение Consolidation записывает checkpoint в extension settings перед записью каждого принятого summary. Summary и изменения, отключающие его sources, сохраняются вместе. Retry перед записью проверяет live Memory Book на наличие checkpoint marker, поэтому подтверждённый summary повторно используется, а не дублируется. После reload пункт **Consolidation recovery** в меню Extensions показывает незавершённые checkpoints и предлагает **Resume** и **Review details**. Изменённый source, отредактированный summary, дублированный marker или неподтверждённое сохранение помечается **Needs Review** и никогда не проигрывается автоматически; после проверки Memory Book команда **Dismiss after review** удаляет уведомление checkpoint, не изменяя book. Это использует settings и lorebook API ST, но не предоставляет server transaction.

Checkpoint хранит принятый summary draft, сгенерированные keywords, source IDs и fingerprints, а также save options в ST extension settings, чтобы после reload можно было продолжить с точно тем же candidate. Храните backups settings так же приватно, как сами Memory Books.

Без Chat Top Bar STMB всё равно выполняет обычные workflows, но интерфейса очереди нет.


### Отложенный прогресс последней обработки

Если queued Memory завершается после того, как её source chat уже не открыт, Memory всё равно сохраняется в Memory Book. STMB записывает обновление last-processed marker в `extension_settings.STMemoryBooks.pendingProgress` вместо загрузки и перезаписи inactive character или group chat. Уже queued jobs могут завершиться; новые manual и automatic base-memory requests для этого chat ждут, пока pending updates не будут применены или явно discarded. Остальные chats остаются доступными.

Notification просит пользователя вручную снова открыть source chat. Когда chat загружен и idle, popup предлагает **Apply**, **Later** и **Discard pending update**. Apply показывает **Processing…**, запускает `/stmb-set-highest <pending message number>` в affected chat и удаляет pending records из settings перед показом **Done**. Используется обычное manual-marker behavior и range clamping команды без сравнения содержимого сообщений или attachments и без повторного чтения chat. Later, Escape или закрытие popup сохраняет records. В основном STMB panel есть кнопка **Pending progress updates (N)** для повторного открытия этого management popup, в том числе после refresh или отключения Chat Top Bar. Он никогда не переключает chats автоматически. Discard требует confirmation и не трогает сохранённые lorebook memories.

Каждая pending record содержит chat reference, operation/job identity, target message index, original marker state/revision, chat integrity identifier и SHA-256 fingerprint текста source message и identity fields. Attachment fields не читаются и не fingerprint. Conversation text не сохраняется. Appended messages и hide/unhide changes разрешены; edits, deletions, changed identity, manual marker changes или rollback могут сделать update unsafe. Эти проверки применяются к automatic marker updates. Explicit Apply использует slash command, даже если original fingerprint или marker revision больше не совпадают; Later сохраняет pending update, а Discard удаляет его. Явные события rename chat/character remap pending references; missing или unrecognized references остаются доступными для review и discard.

Pending records сохраняются через ST settings API и проверяются повторным чтением settings с десятисекундным confirmation limit. Ошибка settings оставляет update в памяти. Используйте Apply в affected chat для запуска marker command или Discard pending update для удаления pending record. Отдельной settings-save retry button нет. Browser recovery backup отсутствует: refresh до успешного сохранения settings может потерять ещё не persisted update. Если cleanup settings после Apply не удаётся, pending record остаётся; повторный Apply снова запускает command и повторяет cleanup без создания новой Memory. Explicit Apply полагается на обычное save behavior команды; automatic updates по-прежнему проверяют saved marker.

Это устраняет отдельную inactive-chat replacement write STMB. Обычное current-chat save ST всё ещё записывает полный chat, а одновременные settings saves с других tabs/devices не transactional. Изменение не определяет причину ранее сообщавшейся потери chat и не гарантирует защиту от всех save races core/other extensions.

---

## 26. Визуальная обратная связь и доступность

STMB предоставляет визуальные состояния для элементов сцены, включая inactive, selected, valid range, in-scene и processing. Точные цвета зависят от темы SillyTavern.

Поддержка доступности включает:

- keyboard navigation;
- focus indicators;
- ARIA attributes;
- reduced-motion behavior;
- mobile-friendly controls.

При обучении по скриншоту описывайте видимые icon и label, а не полагайтесь на конкретный цвет.

---
## 27. Карта настроек и актуальный справочник

Этот раздел — карта настроек. Он показывает, где находится каждый пользовательский элемент конфигурации STMB и что он контролирует. Также перечислены важные сохранённые и одноразовые настройки специализированных интерфейсов. Одноразовые поля содержимого, используемые только для создания конкретного Clip, Topical Clip, Compaction или preview, описаны в соответствующих workflow-разделах и здесь не повторяются.

Обычный начальный путь:

**меню Extensions с волшебной палочкой рядом с полем ввода чата → Memory Books**

Все пути ниже начинаются с основной панели **Memory Books**, если явно не указано **SillyTavern**. Элемент управления может быть скрыт или disabled, если он не относится к текущему чату, провайдеру, профилю или storage mode.

Используемые ниже scopes:

- **Global:** действует во всём STMB, если более узкая настройка не переопределяет.
- **Per chat:** хранится для текущего чата или группы.
- **Per character:** следует за character card между совместимыми чатами.
- **Per profile/template/setting:** хранится в соответствующем повторно используемом объекте.
- **Per run:** влияет только на операцию, которая готовится сейчас.

### 27.1 Основная панель: хранение, режим чата и активный профиль

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode; выбор book — per chat | Перестаёт использовать обычный chat-bound lorebook как автоматический target STMB и требует выбрать Memory Book для текущего чата. Нельзя включить вместе с Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; виден в Manual Mode | Per chat | Выбирает основной Memory Book, который получает Memories этого чата. В Narrator Mode это omniscient book. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; видно в real group при Manual Mode | Per chat | Назначает Memory Book каждому real-group member. STMB inject назначенный book текущего native speaker; интеграция STLO необязательна. Canonical group book также можно назначить, и тогда он хранит и group entries, и character-focused entries. |
| **Character Memory Book lock** | Иконка lock рядом с назначением Memory Book персонажа | Per character | Закрепляет за character card один и тот же Memory Book в совместимых чатах Manual Mode. Перед изменением назначения lock нужно снять. |
| **Narrator Mode** | **Current Lorebook Configuration**; только обычные non-group chats | Per chat | Использует выбранный manual book как omniscient Memory Book и включает заявленных вымышленных персонажей с собственными уникальными books. Требуются Manual Mode и omniscient book. |
| **Manage Narrator Cast** | Под **Narrator Mode**; также доступно из Active Cast drawer | Per chat | Добавляет, переименовывает, retire, restore и назначает уникальные Memory Books declared Narrator characters. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | В Automatic Mode создаёт и привязывает lorebook, если у чата его нет. Нельзя включить вместе с Manual Mode. |
| **Lorebook Name Template** | Непосредственно под **Auto-create lorebook if none exists** | Global | Именует auto-created books. Поддерживает `{{char}}`, `{{user}}` и `{{chat}}`. Используется только при включённом Auto-Create Lorebook Mode. |
| **Memory profile selection** | селектор **Memory Profiles** | Per run | Выбирает профиль для следующей Memory и соседних profile actions. Сам по себе выбор не меняет сохранённый default. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | Делает выбранный профиль default для automatic Memories и других workflows, если confirmation, Side Prompt override или workflow-specific choice не выбирает другой. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format** или **Profile Actions → Edit Profile** | Per profile | Форматирует заголовки новых Memory entries и необязательную нумерацию с указанными title macros. Элемент на main panel редактирует format default profile; **Edit Profile** меняет выбранный профиль напрямую. |

### 27.2 General Settings

Откройте **Settings → General Settings** на основной панели.

| Setting | Scope | What it does |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Пропускает обычное окно подтверждения перед генерацией. Требуется для non-interactive catch-up; независимые warnings и включённые previews всё равно могут появляться. |
| **Automatically accept detected participants in future** | Global | Больше не спрашивает подтверждение участников real group и принимает detected participant set STMB для последующих Memories. |
| **Show memory previews** | Global | Открывает редактируемую проверку до сохранения сгенерированных Memories и применимого Side Prompt output. |
| **Show consolidation previews** | Global | Открывает review controls для сгенерированных consolidation candidates до commit. |
| **Show notifications** | Global | Включает toast notifications STMB. |
| **Show floating Clip button when text is highlighted** | Global | Показывает плавающую кнопку с ножницами после выделения текста чата. |
| **Memory boundary indicator** | Global | Показывает ни одного элемента, processed-boundary divider, draggable jump button или оба. |
| **Allow scene overlap** | Global | Разрешает выбранной scene range пересекаться с message IDs, уже представленными существующей Memory. |
| **Refresh lorebook editor after adding memories** | Global | Обновляет открытый редактор lorebook после записи entries STMB, чтобы новое содержимое сразу появлялось. |
| **Copy Memory Books when branching** | Global | Даёт native chat branch независимые копии активных unlocked chat-bound или manual Memory Books. Character-locked books по дизайну остаются общими. |
| **Auto-rollback after message deletion** | Global | Включает согласованный rollback, когда удаление или truncation затрагивает уже обработанный материал чата. По умолчанию выключено. Обычное редактирование сообщений и swipes не запускают его. |
| **Apply auto-rollback to branches/checkpoints** | Global; option Auto-rollback | При первом открытии branch или checkpoint выполняет rollback Memories, выходящих за сохранённые сообщения. Требует независимых копий каждого активного Memory Book; иначе rollback пропускается. |
| **Update last message ID processed** | Global; действие Auto-rollback | Перемещает processed checkpoint к концу самой новой surviving Memory или очищает его, если ни одной не осталось. |
| **Delete last Memory** | Global; действие Auto-rollback | Удаляет все invalidated Memories, выбранные rollback scope, и их linked copies. Удаление Memory и consolidation необратимо. |
| **Restore previous Side Prompts** | Global; действие Auto-rollback | Восстанавливает каждый неизменённый affected Side Prompt к последнему точно сохранённому before-state. Хранится только один уровень rollback. |
| **Default for solo chats** | Global | Выбирает Side Prompt Set, который solo chats наследуют после Memory. Пустой выбор использует individually enabled after-Memory Side Prompts. |
| **Default for group chats** | Global | Выбирает Side Prompt Set, который real group chats наследуют после Memory. Пустой выбор использует individually enabled after-Memory Side Prompts. |
| **Max Response Tokens** | Global | Переопределяет максимальную длину вывода генерации STMB. Увеличьте, если корректный JSON обрезается; `0` оставляет обычное поведение провайдера/SillyTavern как fallback. |
| **Token Warning Threshold** | Global | Показывает confirmation warning, если оценочный input request превышает threshold. Не меняет context limit модели. |
| **Default Previous Memories Count** | Global | Задаёт обычный default 0–7 prior Memories, передаваемых как continuity context для новой Memory. Конкретный запуск может переопределить это в **Advanced Memory Options**. |
| **Use regex (advanced)** | Global | Включает собственный выбор regex-processing STMB. Эти selections независимы от того, включён ли underlying SillyTavern regex script в обычном интерфейсе. |
| **Configure regex… → Outgoing scripts** | Global | Выбирает scripts, которые STMB запускает над материалом перед отправкой провайдеру генерации. |
| **Configure regex… → Incoming scripts** | Global | Выбирает scripts, которые STMB запускает над возвращённым материалом перед parsing и saving. |

#### Memory Auto-Rollback внутри General Settings

**Auto-rollback after message deletion** — master preference. Три action checkboxes выбираются независимо, включены по умолчанию и визуально disabled, пока master switch выключен. Поэтому существующие установки после обновления не начинают что-либо удалять сами по себе.

**Apply auto-rollback to branches/checkpoints** по умолчанию выключено. При включении STMB применяет выбранные actions при первом открытии подходящей branch или checkpoint, включая уже существующие child chats. Checkpoints обрабатываются при открытии, а не при создании. STMB использует текущее количество сообщений child chat как индекс первого пропущенного сообщения, поэтому Memory, заканчивающаяся на последнем сохранённом сообщении, остаётся целой, а Memories, пересекающие эту границу или идущие после неё, становятся eligible. Завершение записывается для этого child и этой boundary, а изменение settings не повторяет уже выполненный rollback.

Когда rollback branch/checkpoint удаляет Memory, после успешного сохранения Memory Books он также делает unhide сохранённых сообщений в source range этой Memory. Например, branch на сообщении 36 при Memory 33–44 удаляет эту Memory из copy и делает unhide сообщений 33–36. Это не зависит от preference unhide-before-generation. Уже выполненные child rollback не повторяются автоматически после upgrade; используйте `/unhide 33-36`, чтобы исправить этот пример в существующей branch.

Pending unhide ranges сохраняются в тех же записях Memory Book, что и удаления. Если переключение чата или ошибка прерывает unhide, повторное открытие child при включённом branch/checkpoint auto-rollback повторяет сохранённые ranges, даже если удалённых Memories уже нет. Retry может повторить уже выполненные unhide commands; recovery records удаляются только после завершения всех ranges в нужном чате.

Rollback branch/checkpoint требует изолированных копий каждого активного Memory Book. Если **Copy Memory Books when branching** отключено или shared/locked book нельзя изолировать, STMB пропускает rollback и сообщает причину, чтобы не менять данные parent chat. Ошибки copy/rollback и отменённые подтверждения consolidation остаются eligible при последующем открытии.

Auto-rollback реагирует только на deletion или truncation сообщений, включая deletion phase при response regeneration. На обычный edit или swipe он не реагирует. STMB отслеживает фактические идентичности сообщений в каждом чате, потому что значение deletion event SillyTavern ненадёжно идентифицирует удаление в середине.

При удалении хвоста затрагивается каждая Memory, чей сохранённый source range пересекается с удалённым suffix. При удалении в середине чата STMB предлагает три варианта:

- **Full rollback** удаляет affected Memory и все более новые Memories.
- **Affected only** удаляет только overlapping Memories, сохраняет более новые Memories и сдвигает их сохранённые ranges, соответствующие Side Prompt checkpoints и processed checkpoint на количество удалённых сообщений. Это намеренно оставляет постоянный пробел в Memory coverage.
- **Cancel** не меняет ничего в Memory Books.

Rollback использует точные `STMB_chatId`, source-range и canonical/link metadata во всех доступных Memory Books. Canonical group или Narrator Memory и все обнаруживаемые linked copies являются одной единицей удаления. Отсутствующие canonical copies, неоднозначные legacy entries без достаточной chat identity, malformed ranges или неполные consolidation dependencies останавливают весь rollback и дают инструкции по исправлению; STMB не угадывает ownership.

Если выбрано **Delete last Memory**, STMB делает preflight каждого прямого и транзитивного consolidation parent в каждом affected Memory Book. Одно объединённое confirmation перечисляет consolidations, которые необходимо удалить. Отмена этого confirmation также отменяет изменения checkpoint, Memory и Side Prompt. При подтверждении удаляются consolidation ancestors, затем каждая существующая direct source, которую отключила удалённая consolidation, снова включается и её backlink `disabledBySummaryId` очищается, после чего удаляются выбранные base Memories. Entries, отключённые пользователем независимо, не включаются.

Перед сохранением STMB повторно проверяет complete lorebook fingerprints. Lorebooks записываются через обычные serialized write lanes в отсортированном порядке, а неизменённые pre-write clones сохраняются для compensating saves, если более поздний book не удастся записать. Metadata checkpoint чата меняются только после успешной записи всех lorebooks. Queued work для чата отменяется до preflight; активной non-queued Memory creation разрешается завершиться до продолжения rollback.

Rollback Side Prompt использует regeneration snapshots версии 2. Каждый snapshot записывает, существовала ли entry, её точное prior state без более старого rollback snapshot, source chat/range и fingerprint состояния, которое записал STMB. Если откатываемый запуск создал entry, rollback удаляет её. Если current entry больше не совпадает с сохранённым fingerprint, STMB предполагает, что пользователь или более поздний запуск её изменил, и не трогает её. Snapshots версии 1 всё ещё поддерживают regeneration, но недостаточно безопасны для rollback и пропускаются с предупреждением. Успешное восстановление consumes snapshot, поэтому этот Side Prompt нельзя откатить второй раз, пока он снова не выполнится. Если откатывается несколько Memories вместе, для каждого Side Prompt можно восстановить только последний доступный before-state; информация, добавленная более старыми откатываемыми запусками, может остаться.

#### Token Saving внутри General Settings

Эти элементы находятся ниже в том же popup **General Settings**, в разделе **Token Saving (Hide/Unhide Messages)**.

| Setting | Scope | What it does |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Выбирает отсутствие автоматического скрытия, скрытие всех обработанных сообщений до последней Memory или только диапазона последней Memory. Скрытие обратимо и не удаляет сообщения. |
| **Messages to leave unhidden** | Global | Оставляет это количество свежих сообщений видимыми при auto-hide, сохраняя overlap у Memory boundary. `0` скрывает до конца применимой сцены. |
| **Unhide hidden messages for memory generation** | Global | Выполняет эквивалент `/unhide X-Y` для source range до его компиляции STMB. Выбранный auto-hide mode определяет, что будет снова скрыто после успешного сохранения. |

### 27.3 Automatic Memories и напоминания о consolidation

Откройте **Settings → Automatic Memories** на основной панели.

| Setting | Scope | What it does |
|---|---|---|
| **Auto-create memory summaries** | Global | Включает автоматическое создание Memory в стиле `/nextmemory`. Если processed baseline отсутствует, текущий STMB может начать с сообщения 0; первая ручная Memory всё равно рекомендуется для проверки setup и осознанного выбора начальной границы. |
| **Auto-Summary Trigger** | Global | Выбирает, запускается ли automatic Memory creation по количеству messages или tokens. |
| **Auto-Summary Token Threshold** | Global | Задаёт token count, который запускает automatic Memory creation, когда trigger — **Tokens**. |
| **Auto-Summary Interval** | Global | Задаёт количество messages в обычном automatic cadence, когда trigger — **Messages**. |
| **Auto-Summary Buffer** | Global | Исключает это количество самых новых сообщений из готового автоматического диапазона, чтобы генерация шла немного позади живого разговора. |
| **Prompt for consolidation when a tier is ready** | Global | Показывает yes/later prompt, когда monitored tier достигает сохранённого minimum eligible sources. Никогда не запускает consolidation молча. |
| **Auto-Consolidation Tiers** | Global | Выбирает target tiers для readiness prompts. Minimum каждого tier сохраняется в **Consolidate Memories**. |

#### Уведомления-напоминания о Memory

Controls напоминаний об automatic memories отображаются только в **Automatic Memories**. Controls напоминаний о manual memories отображаются и в **General Settings**, и в **Automatic Memories**, используя одни и те же global preferences. Оба reminder toggle по умолчанию **off** и работают независимо от **Show notifications**.

- **Turn on reminders for automatic memories** действует, пока **Auto-create memory summaries** включено. Настраиваемый interval X по умолчанию равен **10 messages**. Первое напоминание наступает при **Auto-Summary Interval + Auto-Summary Buffer + X** необработанных сообщениях, затем повторяется каждые дополнительные X сообщений. Например, при interval 50, buffer 2 и X = 10 первое напоминание появляется на 62 необработанных сообщениях, затем на 72, 82 и т. д., если проверка происходит на этих значениях.
- **Turn on reminders to make memories manually** действует, пока auto-create выключено. Настраиваемый interval Y по умолчанию равен **50 messages**. Первое напоминание появляется на Y необработанных сообщениях, затем каждые дополнительные Y сообщений. Обе preferences сохраняются при включении или выключении auto-create.

Intervals принимают положительные целые числа и считают **chat messages**, включая сообщения пользователя и assistant, используя существующую границу last-processed Memory. Automatic reminders остаются message-based, даже если generation использует token threshold. Проверки выполняются после ответов assistant и когда memory processing становится idle; generation, pending progress и явное откладывание auto-summary подавляют новые reminders. Задержанное reminder начинает repeat interval с фактического count, при котором notification была показана.

Reminder toasts имеют кнопку закрытия и остаются видимыми до dismiss. Повторения не накапливаются, пока reminder отображается. Notification checkpoints сохраняются отдельно для каждого chat, поэтому reload не повторяет сразу уже показанное reminder. Изменение processed boundary или reminder configuration сбрасывает соответствующее расписание; удалённые сообщения пересчитывают repeat checkpoints. Смена chat, изменение boundary или отключение/переключение active reminder mode убирает видимое reminder. Эти reminders не создают Memories и не изменяют automatic generation thresholds.

### 27.4 Редактор профиля

Выберите профиль в **Memory Profiles**, затем откройте **Profile Actions → Edit Profile**. Эти настройки относятся **per profile**, если не указано иначе. Встроенный профиль **Current SillyTavern Settings** намеренно блокирует поля, которыми управляет SillyTavern.

| Setting | What it does |
|---|---|
| **Profile Name** | Именует повторно используемый профиль STMB. Имя встроенного профиля заблокировано. |
| **API/Provider** | Выбирает текущую маршрутизацию SillyTavern, поддерживаемого провайдера, Custom OpenAI-compatible connection или Full Manual Configuration. |
| **Use this connection profile** | Для **Custom OpenAI-Compatible API** использует либо активное SillyTavern Custom connection, либо одно именованное Custom connection. Его сохранённые URL и secret используются, а **Model** STMB остаётся model override. |
| **Skip structured output and use plain-text completion** | Перестаёт отправлять structured-output schema, если провайдер его отвергает. Выбранный prompt всё равно должен заставить модель вернуть корректный JSON, требуемый STMB. |
| **Use ST's ChatCompletionService** | Использует выбранный ST Connection Manager profile с override model и temperature от STMB. Без выбранного connection profile использует существующий route ChatCompletionService. Недоступно для Full Manual profiles. |
| **Chat Completion Preset** | Необязательно применяет SillyTavern Chat Completion preset, когда ST Connection Manager profile не выбран. Иначе preset предоставляет connection profile. |
| **Model** | Задаёт точный model ID профиля. **Current SillyTavern Settings** вместо этого читает активную модель SillyTavern. |
| **Temperature** | Задаёт randomness генерации профиля. **Current SillyTavern Settings** вместо этого читает активную temperature SillyTavern. |
| **Use reverse proxy** | Передаёт настроенные в SillyTavern сведения reverse proxy поддерживаемым провайдерам; в Full Manual Configuration secret field называется proxy password. |
| **API Endpoint URL / API Key** | Задаёт отдельный direct endpoint и credential только для **Full Manual Configuration**. Для обычного использования предпочитайте connection, настроенное и протестированное в SillyTavern. |
| **Memory Creation Method** | Выбирает preset Summary Prompt для обычной генерации Memory. Содержимое prompt управляется в **Settings → Summary Prompt Manager**. |
| **Use separate group and character prompts in group chats** | Использует разные prompt presets для group Memory Book и character-focused Memory Books. |
| **Group Summary Prompt / Character Summary Prompt** | Выбирает два presets при включённом separate group/character prompting. |
| **Memory Title Format** | Управляет текстом title, macros и automatic numbering для Memories этого профиля. |
| **Activation Mode** | Сохраняет новые entries как **Normal** keyword activation, **Constant** или **Vectorized**. |
| **Insertion Position** | Выбирает расположение сгенерированной entry относительно Character, Example Messages, Author's Note или именованного Outlet. |
| **Outlet Name** | Задаёт target Outlet и появляется только когда **Insertion Position** равно **Outlet**. |
| **Insertion Order** | **Auto** выводит order из номера Memory; **Manual** использует фиксированное значение; **Reverse** считает вниз от начального значения и предназначен только для Outlets. |
| **Prevent Recursion** | Не даёт содержимому generated entry активировать другие lorebook entries при recursive scanning. |
| **Delay Until Recursion** | Не даёт generated entry активироваться на первом scan pass. Оставляйте off, если ничто другое не может начать рекурсию. |
| **Also include** | Только для совместимости legacy profiles. Старые профили могут показывать здесь упорядоченные ссылки на lorebooks; текущая конфигурация использует per-chat **Context Settings**. |

Активные provider, model, temperature, connection preset и reverse proxy SillyTavern настраиваются в собственных connection controls SillyTavern, а не в STMB. Профиль **Current SillyTavern Settings** читает эти live values.

### 27.5 Context Settings

Откройте **Settings → Context Settings** на основной панели.

| Setting | Scope | What it does |
|---|---|---|
| **Additional Context for this chat** | Per chat | Выбирает один named Context Setting, явно сохраняет **No Context** или оставляет выбор unset, чтобы STMB мог спросить, когда migrated context требует решения. |
| **Context Setting Name** | Per Context Setting | Именует повторно используемую коллекцию Additional Context. |
| **Additional Context entries and order** | Per Context Setting | Выбирает lorebook entries для отправки как стабильного справочного материала и задаёт их порядок. Отсутствующие entries вызывают warning и пропускаются. |

**New**, **Duplicate**, **Delete**, **Import JSON** и **Export JSON** управляют Context Settings; они не меняют поведение генерации, пока setting не выбран чатом или Side Prompt.

### 27.6 Trackers & Side Prompts

Откройте **Settings → Trackers & Side Prompts** на основной панели.

| Setting | Location and scope | What it does |
|---|---|---|
| **After-memory side prompt mode for this chat** | Главный экран manager; per chat | Использует соответствующий solo/group default, явно использует individually enabled after-Memory prompts или выбирает один named Side Prompt Set для этого чата. |
| **How many concurrent prompts to run at once** | Главный экран manager; global | Ограничивает одновременные Side Prompt jobs от 1 до 10. |
| **Side Prompt Set Name** | **New Set** или редактирование set; per set | Именует повторно используемую упорядоченную группу запусков Side Prompt. |
| **Side Prompt / Row Label / Macro Values** | Строка Side Prompt Set; per set | Выбирает template строки, необязательный display/title label, literal или set-level значения runtime macros и использует порядок строк как execution order. |
| **Enabled** | **New** или редактирование обычного Side Prompt; per template | Делает template eligible, если чат использует individually enabled after-Memory prompts. Trigger settings всё равно определяют, когда он запускается. |
| **Run on visible message interval / Interval** | Редактор Side Prompt; per template | Запускает после настроенного количества visible messages. Automatic triggers недоступны, если template требует unresolved runtime macros. |
| **Run automatically after memory** | Редактор Side Prompt; per template | Запускает template после успешной Memory с учётом Side Prompt mode или selected set чата. |
| **Allow manual run via `/sideprompt`** | Редактор Side Prompt; per template | Разрешает явный manual execution. |
| **Prompt / Response Format** | Редактор Side Prompt; per template | Задаёт инструкцию и необязательную структуру вывода. Оба поля могут использовать поддерживаемые Side Prompt macros. |
| **Previous memories for context** | Редактор Side Prompt; per template | Включает 0–7 previous Memory entries перед выбранными source messages. |
| **Use additional context / Additional Context Source** | Редактор Side Prompt; per template | Включает Additional Context и либо следует Context Setting текущего чата, либо всегда использует один фиксированный named setting. |
| **Lorebook Target** | Редактор Side Prompt; per template или per chat | Сохраняет output в обычный Memory Book или другой выбранный lorebook. При изменении STMB спрашивает, относится ли выбор только к этому чату или к template в дальнейшем. |
| **Lorebook Entry Title Override / Keywords** | Редактор Side Prompt; per template | Необязательно управляет template заголовка upserted entry и разделёнными запятыми activation keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Редактор Side Prompt; per template | Управляет activation и placement записи lorebook Side Prompt. |
| **Insertion Order / Order Value** | Редактор Side Prompt; per template | Использует automatic Memory-number ordering или фиксированное manual order value. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Редактор Side Prompt; per template | Применяет соответствующие flags recursion/budget записи lorebook SillyTavern. |
| **Override default memory profile / Connection Profile** | Редактор Side Prompt; per template | Направляет этот Side Prompt через выбранный профиль STMB вместо текущего default. |
| **Memory Assistance Mode** | Редактирование **Memory Assistance**; global | **Off** отключает; **Update** предлагает изменения существующих Clips; **Update and Suggest** также обнаруживает Topical Clip topics; **Automatic** напрямую применяет добавления в обычные Clips, оставляя Topical Clip replacements на подтверждение. |
| **Update Prompt / Topic Suggestions Prompt** | Редактирование **Memory Assistance**; per built-in template | Управляет двумя задачами ИИ. Response contracts остаются фиксированными. |
| **Use a connection profile override** | Редактирование **Memory Assistance**; per built-in template | Использует выбранный профиль STMB для Memory Assistance вместо default. |

### 27.7 Prompt managers

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** или редактирование | Per preset | Определяет повторно используемый ordinary-Memory prompt. Профиль использует его только после того, как **Memory Creation Method** или выбор group/character prompt указывает на этот preset. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Выбирает обычный prompt, заранее выбранный в **Consolidate Memories**. Regeneration-only и group-only presets выбирать нельзя. |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** или редактирование | Per preset | Определяет повторно используемые инструкции consolidation. Специальные regeneration и group presets ограничены соответствующими workflows. |

### 27.8 Defaults Topical Clip и Compaction

Откройте **Settings → Topical Clip** или **Settings → Compaction** на основной панели.

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile** или **Compaction → Compaction Profile** | Global shared default | Выбирает профиль STMB для генерации Topical Clip и Compaction. Изменение в одном интерфейсе меняет общий выбор для обоих workflows. |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Сохраняет custom prompt template для генерации Topical Clip. **Reset to Default** возвращает текущий built-in prompt. Required source macros проверяются до сохранения или генерации. |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | Сохраняет custom prompt template для сокращения существующих Memory, Clip и Side Prompt entries. **Reset to Default** возвращает текущий built-in prompt. `{{ENTRY_CONTENT}}` обязателен. |

Memory Book, topic, keywords, включение источников, выбор источников, диапазон сообщений, draft и запись, выбранная для Compaction, являются per-run workflow choices, а не постоянными настройками.

### 27.9 Элементы Consolidate Memories

Откройте **Consolidate Memories** кнопками в нижней части основной панели. Этот интерфейс сочетает saved defaults и one-run choices.

| Setting | Scope | What it does |
|---|---|---|
| **Source Memory Book** | Per run | Показывает Memory Book, который сейчас консолидируется, и позволяет выбрать другой доступный book. Смена перезагружает список eligible entries, не меняя manual или chat-bound Memory Book configuration чата. |
| **Target tier** | Per run | Выбирает higher tier для создания и, следовательно, непосредственно нижний eligible source tier. |
| **Consolidation Prompt** | Per run | Выбирает prompt для этой consolidation; изначально используется default из Consolidation Prompt Manager. |
| **Maximum entries per pass** | Per run | Ограничивает количество lower-tier entries, отправляемых за один analysis pass. |
| **Token Budget** | Per run | Задаёт приблизительный input budget для batching этой consolidation. |
| **Number of automatic summary attempts** | Per run | Ограничивает повторные analysis passes для получения usable assignments и summaries. |
| **Saved minimum eligible entries** | Global, отдельно для каждого target tier | Определяет, когда выбранный tier считается ready. Также управляет automatic readiness prompt этого tier. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | Управляет сохранением newly consolidated entries. Эти настройки отдельны от entry settings обычных Memory profiles. |
| **Disable selected source entries after creating summaries** | Per run | Отключает успешно consolidated sources после commit, чтобы higher-tier summaries могли заменить их в retrieval. Не удаляет их. |
| **Selected source entries** | Per run | Выбирает, какие eligible lower-tier entries будут обработаны. Unchecked entries остаются без изменений. |

### 27.10 Связанные настройки World Info SillyTavern

Эти элементы находятся вне STMB, в настройках World Info/lorebook SillyTavern, но влияют на то, извлекаются ли сохранённые Memories при обычной генерации чата.

| Setting | What it does |
|---|---|
| **Match Whole Words** | Управляет границами совпадения keywords. Off — обычная стартовая точка для гибких Memory keywords. |
| **Scan Depth** | Управляет объёмом недавнего текста, сканируемого для activation lorebook. Относительно высокое значение, например 8, — обычная стартовая точка. |
| **Max Recursion Steps** | Ограничивает recursive World Info activation. Примерно 2 — обычная стартовая точка. |
| **Context percentage / lorebook budget** | Ограничивает объём контекста, который могут занимать lorebook entries. Увеличивайте только с учётом общего контекста модели и другого prompt material. |

Это рекомендации, а не жёсткие требования; диагностику retrieval см. в разделе 10.

---
## 28. Справочник slash-команд

### Команды Memory

```text
/creatememory
```

Создать Memory из текущей размеченной сцены.

```text
/scenememory X-Y
```

Задать включительный диапазон и создать Memory, например `/scenememory 10-15`.

```text
/nextmemory
```

Создать Memory от сообщения после highest processed boundary до текущего допустимого конца.

```text
/stmb-catchup interval=x start=y end=z
```

Обработать существующий длинный чат последовательными chunks.

### Команды Side Prompt

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Команды processed boundary

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Аварийная остановка

```text
/stmb-stop
```

Останавливает всю находящуюся в работе генерацию STMB повсюду, включая Side Prompts. Уже committed работа остаётся сохранённой.

---

## 29. Устранение неполадок по этапам

### 29.1 Расширение/UI не загрузились

Симптомы:

- Memory Books отсутствует в меню с волшебной палочкой;
- отсутствуют chevrons;
- после выделения нет плавающей кнопки Clip.

Проверки:

1. расширение установлено и включено;
2. страница перезагружена;
3. открыт character/group chat;
4. подождите до десяти секунд;
5. разверните действия сообщения;
6. только после этих проверок смотрите консоль.

### 29.2 Сцена не выбрана

Для размеченной сцены нужны и **►**, и **◄**. Проверьте Current Scene на панели.

Если диапазон пересекается с существующей Memory, выберите другой диапазон или включите Allow Scene Overlap.

### 29.3 Нет корректного Memory Book

Automatic Mode:

- привяжите lorebook к чату; или
- включите Auto-Create.

Manual Mode:

- выберите main manual book;
- исправьте удалённый выбор;
- разблокируйте broken character lock до изменения.

Real multi-book group:

- STLO должен быть доступен;
- каждому обязательному участнику нужно корректное назначение;
- group book нельзя повторно использовать как character book.

Narrator Mode:

- Manual Mode должен быть включён;
- должен быть выбран omniscient book;
- каждому заявленному участнику нужен уникальный non-omniscient book.

### 29.4 ИИ не создал корректную Memory

Проверяйте в таком порядке:

1. provider/model/profile корректны;
2. ответ не был truncated;
3. maximum response tokens достаточно;
4. выбранный prompt всё ещё требует точный JSON;
5. Regex не повредил schema;
6. провайдер поддерживает выбранный structured-output mode;
7. используйте Skip Structured Output только если провайдер отвергает schemas;
8. попробуйте модель, лучше следующую инструкциям, прежде чем переписывать prompt;
9. нажмите **Raw response from AI** в постоянном уведомлении об ошибке, чтобы просмотреть сохранённый ответ провайдера, и используйте manual JSON correction interface, когда он доступен.

Частые причины: code fences, commentary, отсутствующий key, keywords не являются array, refusal text или обрезанный вывод.

### 29.5 Memory сохранилась, но сообщения исчезли

Вероятно, они были автоматически скрыты. Измените настройки Token Saving. Hidden messages не удалены.

### 29.6 Automatic Memories не запускаются

Проверьте:

- Auto-create memory summaries включено;
- после highest processed boundary достаточно сообщений;
- выполнено требование interval плюс buffer;
- нет активного postpone checkpoint;
- доступен корректный Memory Book;
- другой Memory job не блокирует trigger;
- во время работы не переключали текущий чат;
- group generation завершилась до ожидаемого момента trigger.

Первая ручная Memory рекомендуется, но в текущей версии технически не обязательна.

### 29.7 Memory существует, но не активируется

Проверьте:

- правильный book активен;
- entry enabled;
- релевантные keywords;
- activation mode;
- budget;
- recursion и Delay Until Recursion;
- routing STLO, если используется;
- инспекцию/logs World Info.

Не регенерируйте Memory до проверки retrieval.

### 29.8 Entry была отправлена, но проигнорирована

Это поведение использования контекста моделью. Возможные меры:

- сделать Memory короче и явнее;
- улучшить insertion position/priority;
- сократить competing context;
- использовать OOC reminder;
- выбрать модель, которая надёжнее следует переданному контексту.

### 29.9 Side Prompt не запустился

См. раздел 16.18. Особенно важно: выбранный set подавляет individually enabled prompts вне этого set.

### 29.10 Не появилось предложение Consolidation

Проверьте:

- readiness prompt включён;
- target tier выбран для monitoring;
- достаточно eligible source entries;
- sources уже не disabled/ineligible;
- сохранённый minimum count этого tier достигнут.

### 29.11 Кнопка Regeneration disabled

Наведите курсор или посмотрите указанную причину. Частые причины:

- entry старше обязательных snapshot metadata;
- source chat/range недоступен;
- source entries отсутствуют или находятся не на том tier;
- active parent consolidation блокирует lower source;
- исходный sequence number невозможно определить;
- Side Prompt template удалён.

### 29.12 Branch не скопировала books

Проверьте:

- Copy Memory Books when branching было включено до создания branch;
- это была native SillyTavern branch;
- source books существовали и могли быть загружены;
- во время копирования чат не переключали;
- branch ранее не была отмечена completed/failed;
- locked books намеренно сохранялись, а не копировались.

### 29.13 Неверный состав Narrator Mode

Проверьте:

- выбор Active Cast до генерации;
- было ли сообщение continuation, объединившей cast metadata;
- восстановил ли swipe старое состояние состава;
- содержит ли сцена legacy untagged messages, требующие подтверждения;
- был ли declared character отправлен в retirement;
- существует ли каждый character book.

---

## 30. FAQ

### Нужны ли vectors?

Нет. Keyword activation достаточно, и keywords генерируются автоматически. Vectors необязательны.

### Следует ли использовать отдельный lorebook для Memories?

Обычно да — ради организации, budget, повторного использования и диагностики, но это не обязательно.

### Удаляет ли STMB сообщения?

Нет. Он может скрывать обработанные сообщения из активного контекста.

### Можно ли использовать STMB полностью вручную?

Да. Размечайте сцены и создавайте Memories только когда хотите.

### Могут ли Automatic Memories создать первую Memory?

Да, в текущем STMB. Если processed baseline отсутствует, он начинает с сообщения 0 после достижения interval плюс buffer. Первый ручной запуск всё равно рекомендуется для проверки setup и выбора нужной начальной границы.

### Consolidation запускается автоматически?

Нет. STMB может предложить её, когда tier готов, но пользователь подтверждает и проверяет операцию.

### Может ли реальная группа использовать один Memory Book?

Да. Это рекомендуемая стартовая конфигурация, и STLO не требуется.

### Когда полезны отдельные real-group character books?

Когда индивидуальная continuity, знания, speaker-specific retrieval или character-focused summaries оправдывают дополнительную настройку и запросы к ИИ.

### Narrator Mode — это то же самое, что Group Chat Mode?

Нет. Group Chat Mode читает отдельных авторов character cards SillyTavern. Narrator Mode вручную объявляет вымышленных персонажей, которых пишет одна Narrator card.

### Требует ли Narrator Mode STLO?

Не для его active-cast retrieval path. Но требуются Manual Lorebook Mode, один omniscient book и уникальные per-character books.

### Linked copies синхронизируются?

Нет. Они связаны для metadata origin/consolidation, а не для непрерывного зеркалирования.

### Почему Delay Until Recursion обычно должен быть выключен?

Если никакая другая запись lorebook не запускает рекурсию, delayed Memory entry может вообще не активироваться.

### Что делать после первой успешной Memory?

Проверьте retrieval записи, затем включите automatic Memories, выберите interval/buffer, включите token hiding и добавляйте Clips или узко определённый Side Prompt только при необходимости. Topical Clip и Consolidation используйте после накопления достаточного количества Memories.

---

## 31. Совместимость, миграция и актуальные исторические примечания

Этот раздел сохраняет только историю, влияющую на текущее использование.

### Текущая база

- Текущая документированная версия: v8.5.0, 1 августа 2026.
- Требование SillyTavern: 1.14.0 или новее.
- Narrator Mode добавлен в v8.5.0.
- Копирование books при branching, regeneration Side Prompt и character Memory Book locks добавлены в v8.4.0.
- Multi-character real-group Memory distribution появилась в v8.0.0.
- Additional Context перенесён из profiles в повторно используемые per-chat Context Settings в v7.0.0; старый profile context мигрируется.
- Topical Clip добавлен в v6.10.0.
- Compaction и Clips добавлены в v6.6.0.
- Side Prompt Sets и per-prompt targets добавлены в период v6.4–v6.5.
- Consolidation стала многоуровневой системой Arc-through-Epic в v6.0.0; старые Arc metadata мигрируются.
- Job Queue integration добавлена в v6.8.0 и остаётся необязательной.
- Текущие defaults профиля используют отключённый Delay Until Recursion, если пользователь/профиль явно его не меняет.

### Существующие Memories из старых версий

Только записи с flag `stmemorybooks` и обязательными metadata распознаются как STMB Memories. Для старых entries, предшествующих текущим metadata, используйте предоставленный converter lorebook.

### Удалённая функциональность

Старая функция bookmark была удалена из Memory Books в v4.0.0 и отделена от core extension. Не обучайте bookmark controls Memory Books как текущему поведению.

### Локализованные built-ins

Built-in prompts можно регенерировать в соответствии с активным языком SillyTavern. Сделайте backup настроенных built-ins перед пересозданием.

### Поведение импорта

Импорт Side Prompt аддитивен. Существующие prompts сохраняются; конфликтующие imported keys переименовываются, а не перезаписывают существующий prompt.

---

## 32. Примечания для разработчиков и лицензия

Memory Books использует Bun для bundling/minification.

```sh
bun run build
```

Установите pre-commit build hook репозитория командой:

```sh
bun run install-hooks
```

Hook выполняет build до commit, добавляет build artifacts в stage и прерывает commit, если build не удался.

Memory Books — Copyright © 2024–2026 Aiko Hanasaki и лицензирован по GNU Affero General Public License v3.0. Изменённые версии должны сохранять применимые уведомления, обозначать изменения и соблюдать требования AGPL по доступности исходного кода.

---

## 33. Компактное дерево диагностики

```text
User says “Memory Books is not working.”
│
├─ Is the menu/control visible?
│  ├─ No → installation/loading/UI checks.
│  └─ Yes
│
├─ Can a scene be selected?
│  ├─ No → expand message actions; set both chevrons; inspect overlap.
│  └─ Yes
│
├─ Is there a valid effective Memory Book?
│  ├─ No → bind, auto-create, select manual, or repair multi-book bindings.
│  └─ Yes
│
├─ Does generation return valid complete output?
│  ├─ No → profile, provider, output tokens, JSON schema, Regex, model.
│  └─ Yes
│
├─ Does the entry exist in the intended book?
│  ├─ No → save/rollback/permission/job failure.
│  └─ Yes
│
├─ Does SillyTavern activate and send it later?
│  ├─ No → keywords, activation mode, book binding, budget, recursion, STLO.
│  └─ Yes
│
└─ Does the model use the supplied entry?
   ├─ No → model compliance, placement, competing context, entry clarity.
   └─ Yes → workflow is functioning.
```

---

## 34. Минимальная рекомендуемая последовательность обучения

Новому пользователю сначала объясняйте только эту последовательность:

1. Откройте меню с волшебной палочкой и найдите Memory Books.
2. Используйте Automatic Mode с привязанным book или включите Auto-Create.
3. Выберите Current SillyTavern Settings.
4. Разверните действия сообщений и отметьте короткую завершённую сцену с **►** и **◄**.
5. Создайте и проверьте preview одной Memory.
6. Откройте Memory Book и убедитесь, что запись сохранена.
7. Проверьте, что запись может активироваться позднее.
8. Включите automatic Memories и выберите interval/buffer.
9. Включайте auto-hide только после объяснения, что hidden messages не удаляются.
10. Знакомьте с Clips, затем Side Prompts, затем Topical Clip/Consolidation только при конкретной необходимости.

Не начинайте с custom prompts, Full Manual endpoints, нескольких character books, Regex или consolidation, если реальная проблема пользователя этого не требует.

---

## 35. Итоговая модель

Memory Books — это внешний pipeline continuity, построенный на lorebooks SillyTavern:

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

Система работает лучше всего, когда:

- сцены связны;
- prompts чётко различают target и reference context;
- JSON workflows возвращают точные schemas;
- keywords конкретны;
- Memory Books назначаются и активируются осознанно;
- long-running trackers удаляют stale state;
- consolidation сокращает старые детали, не уничтожая continuity;
- пользователи проверяют retrieval, а не предполагают, что saved означает sent;
- сложная multi-book routing используется только когда её точность оправдывает сложность.
### История версий Side Prompt

Включите **Enable sideprompt versioning** в **Trackers & Side Prompts**, затем включите **Save all versions** для каждого обычного Side Prompt, историю которого нужно сохранять. Обе настройки по умолчанию выключены. Настройка template сохраняется при редактировании, дублировании, импорте и экспорте; Memory Assistance не поддерживает историю версий.

Каждый успешный run сохраняется в target lorebook как `Title-001 (STMB SidePrompt)`, затем `002` и последующие версии. Существующий ненумерованный output при первом включении истории принимается как `001`. Старые версии отключаются, а новая остаётся включённой. Версии используют общий sanitized Side Prompt/chat inclusion group; изменение display name обновляет эту группу при последующем успешном сохранении. Streams разделяются по template, chat, resolved title override и target lorebook.

Если любая из двух настроек выключена, STMB обновляет самый новый output на месте и сохраняет уже имеющуюся историю. Regeneration обновляет выбранную entry вместо добавления версии. Rollback использует существующие snapshots и после успешного восстановления включает самую новую surviving version. Неоднозначный legacy output не изменяется. Failed, blank, canceled или rejected run не создаёт историю.

STMB сериализует участвующие lorebook writes в пределах одной browser tab. Существующее ограничение SillyTavern на concurrent saves по-прежнему распространяется на другие clients и direct editor saves.
