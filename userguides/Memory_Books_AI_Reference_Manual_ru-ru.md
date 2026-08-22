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
- [23. Интеграция Regex](#23-интеграция-regex)
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

Считайте этот документ актуальным эксплуатационным справочником Memory Books. Он заменяет необходимость загружать отдельные Start Here, README, User Guide, руководство по Side Prompts, How STMB Works и исторический changelog как независимые файлы знаний.

Термины:

- STMB = SillyTavern=MemoryBooks (это расширение)
- ST = SillyTavern (базовый код, который расширяет STMB)

При ответах пользователям:

1. Точно сохраняйте терминологию Memory Books. **Книга Памяти (Memory Book)** — это лорбук SillyTavern, который использует STMB, а не отдельный формат базы данных.
2. Отличайте текущее поведение от исторического. Не учите удалённому или заменённому процессу только потому, что он встречался в старом changelog.
3. Отличайте **Group Chat Mode** от **Narrator Mode**. Они решают разные задачи.
4. Разделяйте **генерацию** памяти, **хранение/настройку** лорбука и последующее **извлечение SillyTavern**. Активация/извлечение относятся к базовому коду ST.
5. Не придумывайте элементы управления, названия меню, поведение провайдеров или настройки, которых здесь нет.
6. Если дан скриншот, называйте только видимые элементы. Давайте следующее непосредственное действие, не предполагая существование элемента за пределами экрана.
7. При диагностике найдите первый неработающий этап и проверьте его, прежде чем советовать переписывать промпт.
8. Сначала добейтесь работы простой конфигурации; только потом переходите к сложной маршрутизации, нескольким книгам, кастомным промптам, Regex или автоматизации Боковых Промптов.
9. Объясняйте, что фильтры персонажей и отдельные Книги Памяти улучшают маршрутизацию и релевантность, но не являются границей безопасности.
10. Указывайте на неопределённость, если установленная версия, версия SillyTavern, провайдер или кастомный промпт могут отличаться.

### Примечания к текущему документу

Narrator Mode реализован в v8.5.0.

В нескольких старых руководствах для новичков говорилось, что перед автоматическими Memories технически нужна ручная Memory. Текущий STMB умеет создать первую автоматическую Memory с сообщения 0, если базовой точки обработанных сообщений ещё нет. Первая ручная Memory всё равно рекомендуется: она проверяет подключение, Книгу Памяти, формат вывода и желаемую стартовую границу до того, как пользователь начнёт полагаться на автоматизацию.

---

## 2. Определение продукта и ментальная модель

Memory Books — расширение SillyTavern, преобразующее выбранные или автоматически определённые диапазоны чата в структурированные записи памяти, хранящиеся в лорбуках SillyTavern.

Основной процесс:

```text
Сообщения чата
    ↓
STMB выбирает или получает диапазон сообщений
    ↓
STMB собирает запрос к ИИ
    ↓
Модель возвращает структурированную память
    ↓
STMB сохраняет запись лорбука
    ↓
Старые обработанные сообщения можно скрыть из активного контекста
    ↓
Позже SillyTavern активирует релевантные записи лорбука
    ↓
Модель чата получает эти записи как контекст
```

STMB не даёт модели постоянную внутреннюю память. Он поддерживает внешнюю справочную систему — записи лорбука. Модель «помнит», когда SillyTavern добавляет релевантные записи в запрос к ИИ.

### Три отдельные стадии

1. **Качество генерации** — создала ли модель памяти точный и полезный результат?
2. **Хранение и настройка** — сохранён ли результат в нужной Книге Памяти с правильными настройками активации?
3. **Извлечение и использование моделью** — активировал и отправил ли SillyTavern запись, и использовала ли её модель?

Диагностируйте эти стадии отдельно.

### Лорбуки и Книги Памяти

**Лорбук**, также называемый **World Info** в некоторых частях SillyTavern, — набор записей, которые SillyTavern может условно добавлять в запрос модели. Обычно запись имеет:

- заголовок/комментарий;
- содержимое;
- ключевые слова или другой режим активации;
- позицию и порядок вставки;
- настройки рекурсии и бюджета;
- необязательные фильтры персонажей и метаданные.

**Книга Памяти (Memory Book)** — обычный лорбук SillyTavern, который использует STMB. Его можно открывать, редактировать, переупорядочивать, экспортировать, импортировать и удалять стандартными инструментами. В зависимости от функций он может содержать:

- Scene Memories;
- сводки Arc, Chapter, Book, Legend, Series и Epic;
- Clip и Topical Clip;
- tracker-записи Боковых Промптов;
- другие записи STMB.

### Записи памяти — это сжатый контекст

Scene Memory — не исходный транскрипт, а сжатое представление, которое должно сохранить важную для непрерывности информацию:

- события и последствия;
- решения и планы;
- открытия и раскрытия;
- изменения отношений и эмоций;
- индивидуальное знание, убеждения и заблуждения;
- важные предметы, места, личности, обещания и ограничения.

Скрытие обработанных сообщений не удаляет их. Оно лишь не отправляет их ИИ, поэтому они больше не расходуют активный контекст истории.

---

## 3. Основные термины и выбор функций

| Потребность | Функция | Смысл |
|---|---|---|
| Суммировать выбранный/автоматический диапазон чата | **Memory** | «Запомни, что произошло в этой сцене». |
| Сохранить выбранный текст или один факт | **Clip** | «Сохрани эту заметку». |
| Собрать факты об одной теме из сохранённых Memories | **Topical Clip** | «Собери всё, что мои Memories говорят об этом». |
| Поддерживать меняющиеся данные через повторные запуски | **Боковой Промпт (Side Prompt)** | «Обновляй этот tracker». |
| Объединить несколько Memories/сводок нижнего уровня | **Consolidation** | «Сверни эти записи в сводку более высокого уровня». |
| Сократить одну существующую запись STMB | **Compaction** | «Сожми эту запись, не потеряв факты». |
| Заменить запись, используя её исходные источники | **Regeneration** | «Пересоздай запись и покажи замену на проверку». |

### Часто путаемые функции

- **Clip vs Topical Clip:** Clip начинается с выделенного текста текущего чата; Topical Clip — с подтверждённых STMB Memories.
- **Topical Clip vs Side Prompt:** Topical Clip вручную собирает тему; Боковой Промпт может постоянно поддерживать меняющийся tracker.
- **Compaction vs Consolidation:** Compaction переписывает одну запись; Consolidation создаёт новую сводку из нескольких.
- **Memory vs Side Prompt:** Memories обычно идут последовательными сценами; Side Prompt обновляет/перезаписывает один продолжающийся документ.
- **Генерация vs извлечение:** создание записи не гарантирует её последующую активацию SillyTavern.

---

## 4. Требования, установка и первичная проверка

### Требования

- SillyTavern 1.18.0 или новее; рекомендуется последняя совместимая версия.
- Рабочее подключение ИИ.
- Модель, способная следовать инструкциям и возвращать валидный JSON для Memory/Consolidation.
- Возможность устанавливать сторонние расширения SillyTavern.
- Chat Completion preset в SillyTavern при использовании локального/Text Completion backend через OpenAI-compatible Chat Completion endpoint.

### Обычные пользователи Chat Completion

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google и другие Chat Completion подключения обычно могут использовать встроенный профиль **Current SillyTavern Settings**.

### Локальные и Text Completion пользователи

KoboldCpp, llama.cpp, TextGen, Ollama и подобные backend обычно надёжнее работают через OpenAI-compatible Chat Completion endpoint. Даже если обычный RP использует Text Completion, для STMB в SillyTavern нужен Chat Completion preset.

Типичная настройка KoboldCpp:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:5001/v1` или `http://127.0.0.1:5000/v1`;
- любой непустой custom API key, если SillyTavern требует;
- model ID в формате endpoint, обычно `koboldcpp/modelname`, без лишнего `.gguf`;
- импортированный Chat Completion preset;
- response length минимум 2048 tokens, часто безопаснее 4096.

Типичная настройка llama.cpp:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1` или `http://host.docker.internal:8080/v1` для Docker;
- непустой API key при необходимости;
- ID сервируемой модели;
- без prompt post-processing, если endpoint этого не требует.

Пример:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Необязательный Chat Top Bar

STMB работает без Chat Top Bar / Chat Top Info Bar. С ним появляется **Memory Books Jobs** — очередь активных, завершённых, failed, canceled, blocked и review-needed задач.

### Установка

1. Откройте SillyTavern.
2. Откройте главный **Extensions**.
3. Выберите **Install Extension**.
4. Установите официальный репозиторий Memory Books.
5. Перезагрузите SillyTavern при необходимости.
6. Откройте чат персонажа или группы.
7. Подождите несколько секунд инициализации.

SillyTavern Extras не требуется.

### Проверка загрузки STMB

Должно появиться хотя бы одно:

- **Книги Памяти / Memory Books** в меню Extensions у поля чата;
- сценовые **►** и **◄** в расширенных действиях сообщения.

Если нет:

1. подождите до 10 секунд;
2. обновите страницу;
3. убедитесь, что расширение установлено и включено;
4. снова откройте чат;
5. только после этого смотрите консоль браузера.

---

## 5. Открытие Memory Books и главное окно

Откройте меню Extensions с волшебной палочкой рядом с вводом и выберите **Книги Памяти**.

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
- group-character/Narrator controls.

Для первой Memory нужны три решения:

1. Какая Книга Памяти получит запись?
2. Какой профиль/подключение её создаст?
3. Какие сообщения составляют сцену?

---

## 6. Режимы хранения Книг Памяти

### 6.1 Automatic Mode: книга, привязанная к чату

Обычный режим по умолчанию. STMB использует лорбук, привязанный к текущему чату SillyTavern.

Подходит, когда:

- у одного чата одна основная Книга Памяти;
- нужна минимальная конфигурация;
- персонажам группы не нужны отдельные книги.

Если лорбук не привязан, привяжите его в SillyTavern или используйте Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Включите **Auto-create lorebook if none exists**, чтобы STMB создал и привязал лорбук при первом сохранении Memory.

Шаблон имени поддерживает:

- `{{char}}` — персонаж/группа;
- `{{user}}` — пользователь;
- `{{chat}}` — ID/имя чата.

При необходимости добавляются числовые суффиксы.

Auto-Create и Manual Lorebook Mode взаимоисключающие.

### 6.3 Manual Lorebook Mode

Включите **Manual Lorebook Mode**, чтобы выбирать Книгу Памяти независимо от chat-bound lorebook.

Используйте, если:

- памяти должны лежать в отдельном лорбуке;
- несколько чатов намеренно используют одну Книгу;
- членам группы нужны отдельные книги;
- используется Narrator Mode;
- пользователь понимает план активации.

Основная manual-book selection хранится для текущего чата, если совместимый persistent character lock её не переопределяет.

### 6.4 Отдельные Книги Памяти обычно понятнее

Отдельная книга упрощает:

- отделение памяти от character definitions/setting lore;
- отдельный budget/order;
- экспорт и повторное использование истории;
- просмотр STMB-записей без постороннего lore;
- диагностику активации.

Рекомендация, не требование.

### 6.5 Блокировки Книг Памяти персонажа

Character Memory Book lock — постоянная Manual-Mode-привязка к Character Card.

В solo chat:

- unlocked manual book относится к текущему чату;
- locked book следует за картой в совместимых Manual-Mode-чатах;
- изменить book можно только после unlock.

В real group:

- unlocked per-character assignment относится к текущей группе;
- locked assignment следует за картой в совместимых группах;
- отсутствующий locked book создаёт broken-lock state, который нужно исправить/снять.

Используйте lock только если персонаж действительно должен иметь одну продолжающуюся Книгу Памяти в разных историях. Для AU/разных timelines это опасно.

### 6.6 Рекомендуемый старт

- Solo: chat-bound или auto-created Memory Book.
- Real group: одна group Memory Book.
- Narrator: omniscient book + уникальная книга на каждого заявленного персонажа.

---

## 7. Профили, подключения и маршрутизация генерации

Профиль Memory Books управляет генерацией и настройками создаваемой записи.

### 7.1 Первый рекомендуемый профиль

Сначала **Current SillyTavern Settings**: он использует текущие provider/model/temperature SillyTavern.

Не начинайте с переписывания промптов или Full Manual endpoint. Сначала докажите, что одна Memory создаётся и сохраняется.

### 7.2 Зачем отдельный профиль

Он нужен, чтобы:

- использовать более дешёвую/надёжную модель;
- другой provider, чем RP;
- привязать named Custom connection;
- выбрать custom Summary Prompt;
- другую temperature/max output;
- другой title format;
- activation/insertion/order/recursion;
- separate group/character prompts.

### 7.3 Поля профиля

Могут включать:

- display name;
- API/provider;
- model ID;
- temperature;
- Summary Prompt preset;
- separate multi-character prompts;
- structured-output behavior;
- ChatCompletionService routing;
- Chat Completion preset;
- reverse proxy;
- title format;
- Normal/Constant/Vectorized;
- insertion position, включая character/example-message/author’s-note/Outlet;
- Outlet name;
- automatic/manual order;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Named Custom OpenAI-compatible connections

Custom профиль может использовать active Custom connection или конкретную named connection из Connection Manager.

Named connection поставляет URL/secret; поле Model STMB остаётся override. Если connection удалена или перестала быть Custom Chat Completion, STMB блокирует запрос, не маршрутизирует молча.

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** не отправляет provider schema, если тот его отвергает. Но модель всё равно должна вернуть валидный JSON по Memory/Consolidation prompt.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** использует request helper SillyTavern и может применять Chat Completion preset. OpenRouter также наследует provider order, quantization filters, fallback и middle-out. Эти настройки сохраняются и при fallback STMB. Если оба пути падают, STMB сообщает исходную и fallback ошибку. Full Manual не использует этот путь.

### 7.7 Reverse proxy и Full Manual

**Use reverse proxy** передаёт proxy settings SillyTavern.

**Full Manual Configuration** хранит отдельный endpoint/key в профиле. Это исключительный путь; по возможности используйте подключение, настроенное и протестированное в SillyTavern.

### 7.8 Длина вывода

Глобальный STMB max response tokens может переопределять обычную длину вывода. Обрезанный JSON — частая причина ошибок. Сначала увеличьте output length.

---

## 8. Сцены, ручные и автоматические Memories и Catch-Up

### 8.1 Сцена

**Сцена** — включительный диапазон сообщений, который превращается в одну Memory.

Хорошая граница содержит один цельный блок:

- событие;
- разговор;
- этап расследования;
- эмоциональное/отношенческое развитие;
- смену места/цели;
- связанную последовательность действий.

Слишком маленькие диапазоны мало полезны; слишком большие дороже, труднее и смешивают события.

### 8.2 Ручная разметка

1. Раскройте message actions.
2. **►** на первом сообщении.
3. **◄** на последнем.
4. Откройте Memory Books и проверьте start/end/speakers/count/tokens.

Обе границы включены.

**Clear Scene** очищает; новый marker заменяет соответствующую границу.

### 8.3 Создать ручную Memory

1. Проверить сцену.
2. Проверить effective Memory Book.
3. Проверить profile.
4. **Create Memory** или `/creatememory`.
5. Просмотреть confirmation/token/participants/preview при наличии.
6. Одобрить.
7. Убедиться в новой записи и продвижении Memory Status.

Обычно результат содержит title, content, keywords и STMB metadata.

### 8.4 Previews

При **Show memory previews** можно проверять/править title/content/keywords.

Проверяйте имена, атрибуцию, факты, последствия и лишние комментарии. Без preview валидный результат сохраняется автоматически.

### 8.5 Automatic Memories

Включите **Auto-create memory summaries**:

- **Auto-Summary Interval** — сколько новых сообщений на Memory;
- **Auto-Summary Buffer** — сколько самых новых оставить вне summary.

```text
Interval: 30
Buffer: 2
```

STMB ждёт минимум 32 сообщения после границы и делает Memory до двух сообщений перед новейшим.

Без baseline текущий STMB использует `-1` и может начать с 0. Первая ручная Memory всё равно полезна.

Меньший interval = более точные Memories, больше requests. Больший = меньше/крупнее, выше риск смешения. Практический старт: 20–40 для подробного RP, 40–60 для коротких обменов.

Автоматика может откладываться, если нет нужной Книги Памяти.

### 8.6 Highest processed baseline

Определяет:

- старт `/nextmemory`;
- старт automatic;
- boundary indicator;
- что уже обработано.

```text
/stmb-highest
/stmb-set-highest <N>
/stmb-set-highest none
```

Меняйте вручную осторожно: возможны пропуски/повторы.

### 8.7 Catch-Up

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Пример:

```text
/stmb-catchup interval=40 start=0 end=245
```

Range inclusive, chunks идут последовательно.

Перед запуском:

- profile протестирован;
- **Always use default profile** включён;
- **Show memory previews** выключен;
- effective book существует или Auto-Create разрешён;
- multi-character assignments исправны;
- chunk ниже warning threshold.

STMB preflight-ит chunks, идёт по порядку и стопается на первой ошибке или `/stmb-stop`. Уже сохранённое остаётся. Возобновляйте с первой незавершённой message.

---

## 9. Экономия токенов, скрытые сообщения и граница памяти

### 9.1 Hide ≠ delete

Hidden messages остаются в chat file, но не входят в active context.

### 9.2 Auto-hide modes

**Auto-hide messages after adding memory**:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** оставляет небольшой overlap.

### 9.3 Unhide перед генерацией

**Unhide hidden messages for memory generation** показывает range до compilation. После успешного save выбранный auto-hide определяет, что спрятать снова.

### 9.4 Boundary indicator

Показывает границу processed/unprocessed.

- Off;
- divider;
- draggable jump button;
- оба.

Jump button ведёт к первой unprocessed message и запоминает позицию.

### 9.5 Стартовая конфигурация

- divider + jump;
- оставить 2 messages;
- temporary unhide;
- сначала no auto-hide до проверки save;
- затем hide all processed для экономии.

---

## 10. Активация и извлечение лорбука

### 10.1 Keywords

Хорошие keywords конкретны:

- имена/aliases;
- места/организации;
- важные предметы;
- события;
- IDs;
- конкретные открытия/действия.

`important event`, `conversation`, `secret` слишком общие.

Content сообщает модели факты; keywords помогают решить, когда запись извлечь.

### 10.2 Activation modes

- **Normal:** keyword/rule.
- **Constant:** всегда активна с учётом budget/controls.
- **Vectorized:** vector retrieval, если поддерживается.

Vectors необязательны.

### 10.3 Рекомендуемые World Info settings

- Match Whole Words: off;
- Scan Depth: примерно 8;
- Max Recursion Steps: около 2;
- Context percentage: по общему контексту.

Рекомендации, не требования.

### 10.4 Delay Until Recursion

Если Memory Book — единственный активный lorebook, оставьте **Delay Until Recursion** off. Иначе ничто не начнёт первый recursion cycle.

### 10.5 Диагностика retrieval

1. Entry существует?
2. Нужный book активен?
3. Entry enabled?
4. Keywords/mode подходят?
5. Budget?
6. Recursion?
7. World Info inspector/request log — отправлялся ли entry?
8. Если отправлялся, но проигнорирован — проблема model behavior/competing context.

---

## 11. Настоящий Group Chat Mode

### 11.1 Определение

Настоящая SillyTavern-группа содержит несколько отдельных Character Cards.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern знает автора каждого сообщения, поэтому STMB сохраняет speaker attribution и определяет участников.

Отдельного переключателя Group Chat Mode нет.

### 11.2 Participant detection

Обычно participant — card, написавшая хотя бы одно сообщение в сцене.

STMB не определяет физическое присутствие из прозы. Поэтому:

- молчаливый наблюдатель может не определиться;
- упомянутый персонаж не participant;
- обсуждаемый отсутствующий не selected;
- user не отдельная target character book;
- необычные speaker IDs могут потребовать правки.

Если не найдено ни одного group character, confirmation открывается даже при auto accept. Нужно вручную проверить участников.

Вопрос означает: **С какими персонажами группы связать эту Memory?** Он не доказывает знания/физическое присутствие.

### 11.3 Одна Group Memory Book

Рекомендуемый старт.

Automatic Mode/Auto-Create/main Manual Book. Каждая сцена даёт canonical entry. При наличии participant names возможен inclusive character filter.

Filter Alice+Bob означает Alice **или** Bob, не синтетический «Alice and Bob».

Подходит, если:

- одна общая история;
- omniscient/group summary достаточно;
- нужна простота;
- STLO не нужен.

Можно сохранять асимметрию:

> Alice нашла передатчик и спрятала его. Bob считал комнату пустой.

### 11.4 Group book + per-character books

Advanced layout:

- canonical group Memory Book;
- character Memory Book на каждого.

Требования:

- Manual Lorebook Mode;
- STLO установлен/включён;
- valid assignment всем нужным members.

Group book не может быть character book. Несколько characters могут делить один character book; запись туда одна.

При save:

1. canonical в group;
2. participant confirmation;
3. linked copies в выбранные books;
4. rollback partial writes при ошибке по возможности.

Никого не выбрать = применить ко всем current members.

### 11.5 Separate group/character prompts

По умолчанию копируется одна group-oriented Memory.

При **Use separate group and character prompts in group chats**:

- Group Summary Prompt → canonical;
- Character Summary Prompt → индивидуальный вариант на каждый single-character target.

Можно сохранить private knowledge, mistaken beliefs, emotions, priorities, relationship continuity. Требует дополнительных AI requests. Shared character book получает одну shared copy.

### 11.6 STLO

Memory Books решает range, participants, summary, books, individualized prompts.

STLO решает activation, character access, priority, position, budget, order.

STMB добавляет avatar basename в `stlo.characterOverrides`, включает `stlo.onlyWhenSpeaking`, сохраняя существующие настройки.

Только merge: старый override не удаляется автоматически.

### 11.7 Не защита приватности

Separate books/filters не гарантируют:

- отсутствие чужой информации;
- отсутствие canonical group view;
- идеальное knowledge partition;
- только сознательное знание.

Это routing, не security.

### 11.8 Linked copies не синхронизируются

Общие metadata связывают origin, но edits независимы.

Edit/delete/compact/regenerate character copy не меняет остальные. При regeneration canonical group entry можно выбрать только его или все linked entries; каждое генерируется/одобряется отдельно.

### 11.9 Изменение состава

Добавление: assign valid book до следующей distributed Memory; старые Memories/filters не обновляются; history вручную.

Удаление: entries/filters/STLO overrides остаются; copies не удаляются.

Переназначение: меняет future routing; old override может остаться.

### 11.10 Group consolidation

Canonical group book использует автоматический group analysis prompt: omniscient chronology + различение objective events/individual knowledge.

Character books используют preset из popup. Нехватка sources в одном book может привести к skip с warning, остальные продолжают.

Missing scene = chronology gap, не доказательство отсутствия/незнания. Shared book получает один consolidated entry.

---

## 12. Narrator Mode

### 12.1 Определение

Для обычного 1:1 чата, где одна Narrator Card пишет нескольких фиктивных персонажей.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Без режима SillyTavern видит все AI responses как Narrator. Режим даёт STMB ручную модель cast.

Недоступен внутри real group.

### 12.2 Обязательный layout

- Manual Lorebook Mode;
- одна omniscient/canonical Memory Book;
- уникальная book на каждого cast member.

Нельзя: cast member = omniscient book; shared book между двумя members; отсутствующая book. Retired members сохраняют identity/reservation. Auto-Create несовместим.

STLO для Active-Cast retrieval не нужен: STMB сам добавляет books active cast в lorebook context.

### 12.3 Настройка

1. Откройте normal Narrator chat.
2. Manual Lorebook Mode.
3. Выберите main manual book = omniscient.
4. Включите **Narrator Mode**.
5. **Manage Narrator Cast**.
6. Добавьте characters и unique books.
7. Выберите active characters в **Active Cast**.

Перед отключением Manual Mode надо выключить Narrator Mode.

### 12.4 Active Cast metadata

Drawer можно разворачивать, сворачивать, двигать.

На generation STMB snapshot-ит cast:

- user message получает active snapshot;
- Narrator response — generation snapshot;
- continuation merge-ит;
- swipe metadata отдельна;
- выбор swipe может восстановить cast;
- delete recent messages может восстановить по последнему tagged Narrator message.

Это association, не semantic analysis.

### 12.5 Retrieval

STMB загружает books Active Cast и merge-ит entries в character-lore request, избегая duplicate world/UID.

- добавляются только active cast books;
- omniscient следует обычной Manual Mode activation;
- STLO filters не нужны;
- cast надо выбрать до generation.

### 12.6 Scene participant detection

Tagged Narrator responses авторитетны; STMB объединяет cast IDs.

Для legacy untagged messages используется continuity info и confirmation; current active preselected; empty = никто индивидуально.

Fully tagged scenes не требуют confirmation.

### 12.7 Memory distribution

- canonical omniscient entry;
- linked copy в unique book каждого selected participant.

Native ST character filters не используются; metadata содержит participant/owner IDs.

Separate prompts off → copies omniscient summary; on → character-focused versions.

### 12.8 Consolidation/Regeneration

Ownership/participant metadata идёт через sources, чтобы higher tiers знали owner/participants. Regeneration выбирает omniscient/group или character target по metadata.

Linked entries независимы.

### 12.9 Retiring cast

Retired member:

- исчезает из Active Cast;
- удаляется из active IDs;
- сохраняет identity/history;
- сохраняет book reservation.

Это нужно для ушедшего персонажа с сохранённой историей.

---

## 13. Ветвление чатов

Branches могут стать разными continuity. Общие unlocked Memory Books смешают противоречия.

**Copy Memory Books when branching** включено по умолчанию.

### 13.1 Что копируется

- Automatic: chat-bound book;
- Manual: main manual book;
- Manual real group: все unique unlocked character books;
- Narrator: omniscient + declared character books;
- persistent character locks не копируются, а сохраняются как shared by design.

Одна операция использует один lineage number:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branch от branch сохраняет root, не `Branch 1 Branch 1`.

### 13.2 Metadata rewrite

STMB:

- заменяет parent chat IDs на new branch ID;
- перенаправляет canonical links, если обе книги скопированы;
- обновляет bindings.

Это clone, не regeneration.

### 13.3 Failure safety

Не переключайте чат во время copy.

При failure STMB очищает inherited writable bindings и отмечает ошибку, чтобы branch не писал в parent originals.

### 13.4 Отключение

Только если branch намеренно должен разделять books/history с parent.

---

## 14. Clips

Clip сохраняет выделенный chat text прямо в `[STMB Clip]`, без AI.

### 14.1 Для чего

- preference;
- promise/secret;
- name/alias;
- item/pet;
- короткий relationship fact;
- строка почти дословно;
- note-to-self.

### 14.2 Workflow

1. Выделить text.
2. Нажать scissors.
3. Existing/new Clip.
4. Always active или keyword-triggered.
5. Preview.
6. Rename при необходимости.
7. Save.

Кнопка появляется только после выделения и может быть выключена.

### 14.3 Формат

```text
Seraphina Healed Me [STMB Clip]
```

```markdown
=== Seraphina Healed Me ===

- Seraphina исцелила раны пользователя магией.

=== END Seraphina Healed Me ===
```

Один Clip = одна section.

### 14.4 Existing entries

Добавьте `[STMB Clip]` к title. Long clips можно edit/compact.

Сохраняется только выбранный text; source attribution автоматически не добавляется.

---

## 15. Topical Clips

Topical Clip читает confirmed STMB Memories, explicit current-chat message range или оба и просит AI сделать focused entry по теме. Eligible sources включают Scene Memories и consolidated summaries; Clip/Side Prompt исключены.

### 15.1 Когда использовать

Данные о теме разбросаны:

- NPC;
- relationship history;
- place/faction;
- investigation/mystery;
- powers/injuries/promises/preferences/secrets;
- important object;
- unresolved plot thread.

Организация по topic, не общей chronology.

### 15.2 Sources

Использует:

- confirmed Memories из selected source book, включая eligible consolidated;
- visible messages из explicit inclusive `X-Y`.

**Include saved Memories** и **Include chat messages** отдельно/вместе. Ranges следуют global unhide setting и восстанавливают ранее hidden messages.

Не использует outside range, Clips, Side Prompts, unrelated lorebook entries.

### 15.3 Создание

1. Memory Books → **Topical Clip**.
2. Source Memory Book.
3. Topic.
4. Keywords или topic по умолчанию.
5. New/existing `[STMB Clip]`.
6. Saved Memories/messages/both.
7. Optional selected memories/exact range.
8. Generation profile.
9. Generate draft.
10. Review/edit.
11. Save только когда корректно.

Draft никогда не auto-saved.

### 15.4 Update existing

STMB хранит used source memories и при наличии source chat/range/IDs/hashes. Следующий memory-based update обычно посылает только new/changed sources + existing Clip. Message ranges всегда explicit.

**Rebuild from all source memories** если entry неполна, prompt поменялся, старые Memories сильно edited или нужна полная переоценка.

### 15.5 Selection/token warnings

**Use only selected memories** для больших books, ограниченного периода, overlapping names или строгого evidence control.

При превышении threshold STMB предупреждает.

### 15.6 Review

Draft должен быть on-topic, сохранять names/relationships, major facts, показывать contradictions, не invent unsupported explanations и не дублировать.

### 15.7 Placeholders

`{{SOURCE_MEMORIES}}` обязательно при saved Memories, `{{SOURCE_MESSAGES}}` при messages.

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Reset to Default при проблемах.

---

## 16. Боковые Промпты

**Боковой Промпт (Side Prompt)** — именованный STMB prompt, запускаемый отдельно от обычной character response. Обычно поддерживает одну продолжающуюся служебную запись.

В **Trackers & Side Prompts** power icon сразу меняет **Enabled**: зелёный включён, тусклый выключен. Это не меняет triggers.

### 16.1 Применение

- plot/unresolved trackers;
- relationship state;
- NPC/faction status;
- inventory/resources;
- injuries/stats/reputation;
- timelines/dates/deadlines/travel;
- clues/suspects/contradictions;
- inventions/research/projects;
- continuity-risk reports;
- world-state summaries.

Не делайте vague “track everything”, duplicate scene summaries или задачи для next RP response.

### 16.2 Output

Обычно final plain text/Markdown. Memory JSON не нужен, кроме намеренного хранения JSON.

### 16.3 Run sequence

1. instructions;
2. prior tracker;
3. optional previous Memories;
4. optional Additional Context;
5. selected/since-last scene;
6. optional Response Format.

Prior entry — state to revise, не доказательство вечной истинности. Удаляйте stale/resolved/contradicted/duplicate info.

### 16.4 Manual

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Quotes для names with spaces. Range inclusive.

### 16.5 Automatic after Memory

**Run automatically after memory**.

Chat выбирает individually enabled или selected Side Prompt Set. Set заменяет individual, не добавляется.

#### Memory Assistance

Reserved Side Prompt с четырьмя режимами. Запускается после saved Memories независимо от normal enable/set, но не при Memory regeneration.

Сравнивает raw scene с ordinary/Topical Clips в каждом target Memory Book и отправляет title/topic, keywords, content, stable ID, type.

С Job Queue отдельный **Memory Assistance** job на book. Ошибка делает job **Failed**, Memory остаётся **Completed**; retry не regenerates Memory.

- **Off**
- **Update**: ≤5 clips прямо, >5 selection; manual approval.
- **Update and Suggest**: topic discovery + Update workflow.
- **Automatic**: все clips token batches; ordinary additions apply directly, Topical replacements pending.

Query Selected/All; token batches; max one exact excerpt на ordinary Clip; Topical получает full replacement; AI response — JSON map UID→suggestion, `{}` = nothing.

Update writes `Memory Assistance (STMB SidePrompt)` pending approval. Automatic records applied count and keeps Topical/failures. Cancel clears old suggestions.

Discovery sends scene + lightweight Topical titles/topics/keywords, не ordinary clips/bodies; returns 0–5 topics; `{"topics":[]}` valid.

**Review Topics** позволяет uncheck/edit/add. Confirmed topics открывают стандартный Topical Clip workflow. Topic удаляется только после save.

Completion popup: **Dismiss** или **Go to Suggestions**. Menu selection сначала выбирает effective book.

Prompts/profile override editable, response contracts fixed. Memory Assistance нельзя delete/duplicate/set/manual.

### 16.6 Visible-message interval

**Run on visible message interval** с count since checkpoint. Hidden/system не считаются. При set активны только rows с подходящим trigger.

### 16.7 Side Prompt Sets

Ordered run list, не folder. Template может повторяться с разными macros.

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Rows: prompt ref, label, macro values, order, duplicate/delete.

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Defaults/per-chat

General Settings: default solo/group set.

Chat: inherit, individual, named set.

Empty global default = individual.

Deleted selected set → warning, no silent fallback. Missing prompt/unresolved macro → row skipped.

Automatic rows всё равно нуждаются в соответствующем trigger. Manual commands — нет.

### 16.9 Macros

```text
{{user}}
{{char}}
```

Custom `{{...}}` — runtime macros:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Нужны manual values или set row. Unresolved macro не auto-run.

### 16.10 Count macros

| Macro | Count |
|---|---|
| `{{memtier0}}` | Scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clips |
| `{{memside}}` | Side Prompts |

Effective main book: chat-bound Automatic или resolved manual. Character books не суммируются.

### 16.11 Message ranges

Explicit = exact inclusive. Без range — since-last checkpoint/cap.

### 16.12 Additional Context/Previous Memories

До 7 previous scene Memories.

Additional Context: none, **Follow chat**, fixed named setting. Reference, не copy blindly.

### 16.13 Lorebook targets

Порядок:

1. per-chat override;
2. template target;
3. effective book fallback.

Use deliberate shared/dedicated targets, не scatter без retrieval plan.

### 16.14 Entry controls

Title override, keywords, Normal/Constant/Vectorized, position/Outlet, order, Prevent Recursion, Delay Until Recursion, Ignore Budget.

Macros могут expand. Ignore Budget осторожно.

### 16.15 Connection profile override

Inheritance или fixed STMB profile. Слишком много combinations усложняют troubleshooting.

### 16.16 Regeneration

Snapshot:

- template key;
- prior content;
- source chat/range;
- runtime macros.

Lorebook editor → **Regenerate side prompt**. Использует current template/profile/context.

Нельзя, если template deleted, source unavailable или target/source changed. Заменяется только content.

### 16.17 Хороший Side Prompt

Определяет exact job, sources, revise/replace/merge/append, stale removal, stable headings/order, strict limit, final-only.

```text
Обновите tracker отношений по предоставленной сцене. Сохраните актуальные факты, интегрируйте новые изменения в существующие разделы и удалите решённые, противоречащие, устаревшие или повторяющиеся детали. Для каждого отношения оставьте 1–3 кратких пункта. Выведите только обновлённый tracker.
```

```text
Не добавляйте новый раздел без действительно новой информации.
Удаляйте решённые линии и устаревшие предположения.
Выведите только обновлённый отчёт, без предисловия и объяснений.
Вся выдача — не более 300 слов.
```

### 16.18 Troubleshooting

Не запустился: event, mode/set, prompt exists, trigger, macros, stop/failure.

Дважды: manual+auto, duplicate rows/prompts, tabs/chats.

Wrong book: per-chat/template target.

Growing output: explicit replace/prune/item/word limits.

---

## 17. Consolidation

Объединяет lower-tier STMB Memories/summaries в higher-tier chronological recaps.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Работает с existing STMB entries, не raw chat.

### 17.2 Когда

- scene Memories накопились;
- старым деталям не нужен полный уровень;
- закончилась крупная relationship/plot/campaign phase;
- нужно снизить tokens, сохраняя continuity;
- нужна чистая higher-level chronology.

Higher entries должны сохранять lasting changes, turning points, goals, consequences, relationships, unresolved threads, stable state.

### 17.3 Manual workflow

1. **Consolidate Memories**.
2. Target tier.
3. Source entries.
4. Prompt/profile.
5. Disable sources after success?
6. Run/review.
7. Approve.

### 17.4 Readiness != auto consolidation

**Prompt for consolidation when a tier is ready** показывает yes/later при minimum. Yes лишь открывает interface.

### 17.5 JSON schema

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

`member_ids` назначает sources; outliers → `unassigned_items`.

### 17.6 Previous higher-tier summary

Canon context, не source to rewrite.

### 17.7 Previews/failures

Можно edit/accept/regenerate candidate/batch. Malformed output можно inspect и иногда manually correct.

### 17.8 Source disabling

После success можно disable sources, чтобы higher summary заменила retrieval; reversible.

### 17.9 Хорошие prompts

Compression target, number of recaps, chronology/grouping, must-keep details, outliers, exact schema. Сохраняют major beats/consequences/promises/relationships/IDs/threads/keywords, убирают повторы.

---

## 18. Compaction

Сокращает одну существующую STMB-запись с review original/draft.

### 18.1 Eligible

- `[STMB Clip]`;
- Side Prompt;
- STMB Memory.

Обычные lorebook entries не включены.

### 18.2 Workflow

1. **Compaction**.
2. Memory Book.
3. Compaction Profile.
4. Optional Prompt.
5. Entry.
6. Compare.
7. Edit.
8. Replace/copy/cancel.

Original меняется только после **Replace with Compacted Version**.

### 18.3 Для чего

Long Clips, stale/repetitive trackers, verbose Memories, expensive always-active entries.

Не для adding facts/raw chat/new Memory/ordinary entries.

### 18.4 Placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Сохранять facts/names/pronouns/macros/wrappers/end markers, удалять redundancy.

---

## 19. Regeneration

Создаёт проверяемую замену существующей записи. Не создаёт вторую numbered entry и никогда не перезаписывает без approval.

### 19.1 Scene Memory

- открыть source chat;
- открыть Memory Book в lorebook editor;
- **Regenerate memory**;
- для canonical group entry с linked character entries выбрать только clicked entry или все linked;
- выбрать current profile, prompt, previous-memory count, Additional Context;
- проверить title/content/keywords каждого.

Original scene range и sequence number сохраняются. Linked entries используют те же settings, но генерируются с собственным book context и group/character target. STMB собирает все approvals до save. Если sources hidden, unhide или включите unhide-before-generation.

### 19.2 Consolidation

Higher-tier summary пересоздаётся по exact linked lower-tier sources с **Regenerate Consolidation**.

Полный source set должен существовать на правильном tier. Lower source нельзя regenerate, пока active parent от неё зависит; при намеренной перестройке сначала удалить parent.

### 19.3 Side Prompt

См. 16.16.

### 19.4 Safety

Перед replacement STMB убеждается:

- target unchanged;
- source chat range unchanged;
- consolidation sources unchanged/available;
- entry eligible.

Иначе ничего не overwrite.

Linked group/character/Narrator copies независимы.

---

## 20. Контекст для генерации

Источники контекста не взаимозаменяемы.

### 20.1 Current scene

Range, обрабатываемый сейчас; target ordinary Scene Memory.

### 20.2 Previous Memories

Earlier Scene Memories из effective book, read-only continuity context, обычно 0–7. Не суммировать повторно.

### 20.3 Additional Context

Selected lorebook entries как stable reference:

- character/setting rules;
- canonical names/terms;
- campaign constraints;
- authoritative timeline;
- locations;
- assumed facts.

Стоит перед Previous Memories и scene transcript. Это reference, не scene.

### 20.4 Context Settings

Reusable ordered collection.

1. **Context Settings**.
2. Create named setting.
3. Select entries.
4. Order.
5. Select for chat или No Context.

Stored per chat, работает с Current ST и saved profiles.

Missing book/entry → warning + skip. Deleted setting → chat без Additional Context до новой selection.

Import/export `stmb-context-settings.json`.

### 20.5 Prior Side Prompt entry

Current tracker state to revise, не доказательство истинности всего старого.

### 20.6 Consolidation sources

Lower-tier entries — реальный материал.

### 20.7 Previous higher-tier summary

Carried canon, не rewrite source.

### 20.8 Ordering

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Target/reference должны быть явно подписаны.

---

## 21. Архитектура промптов, встроенные Summary Prompts и правила написания

### 21.1 Ordinary Memory

Ожидается:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Только object, exact keys, keywords array strings, short title, concrete terms, Markdown внутри content, correct escaping.

STMB умеет чинить некоторые fences/trailing commas/think tags/wrappers, но не рассчитывайте на это.

Сильный prompt: style/compression, facts to preserve, content to omit, exact schema.

### 21.2 Built-in Summary Prompts

Только ordinary Memory. Не управляют Consolidation/Side Prompt/Topical/Compaction. Выбираются в **Memory Creation Method**; **Summary** — обычный default/fallback.

- **Summary** — лучший старт для большинства.
- **Comprehensive** — long continuity-heavy RP, сильнее причинность/continuity/keywords, но тяжелее.
- **Minimal** — экономия контекста, потеря нюансов.
- **Group + Character** — separate books в group/Narrator.

| Preset | Для чего | Компромисс |
|---|---|---|
| **Summary** | Большинство solo и first setup; подробная chronology, events/interactions/revelations/outcomes/keywords. | Больше деталей, чем minimal. |
| **Comprehensive** | Длинные continuity-sensitive истории; causal chains, dynamics, facts, exchanges, unresolved threads. | Самые длинные инструкции, нужен способный model/tokens. |
| **Summarize** | Scannable Markdown: Timeline, Story Beats, Key Interactions, Notable Details, Outcome. | Bullet-heavy, возможны повторы. |
| **Synopsis** | Почти все значимые beats/details/outcomes. | Очень длинный. |
| **Sum Up** | Chronological narrative record с heading/timeline и меньшей секционностью. | Меньше явного разделения категорий. |
| **Minimal** | High volume/low context; 2–5 предложений. | Теряет motives/emotion/causality/minor details. |
| **Northgate** | Third-person past-tense literary record; community style Northgate. | Читаемость вместо max compression; OOC не исключён явно. |
| **Aelemar** | Major plot/emotional scenes как standalone record; community style Aelemar. | ≥300 words, не для token saving; OOC не исключён явно. |
| **Group** | Shared/omniscient book с правильной attribution. | Не individual memory. |
| **Character** | Individual perspective: did/knew/felt/learned/concealed/misunderstood/affected. | Убирает нерелевантное и unsupported private knowledge. |

Для новой установки оставьте **Summary** до стабильной generation/retrieval. Потом меняйте только prompt и сравнивайте. Comprehensive — при потерях причинности/keywords; Minimal — при размере. Prompt не исправляет weak model, truncation, bad boundaries или retrieval.

Built-ins можно recreate под locale; backup modifications.

### 21.3 Targeting

`group` для canonical group/omniscient Narrator; `character` для individual. Не invent unsupported knowledge.

### 21.4 Side Prompt authoring

Plain text/Markdown maintenance instructions: narrow job, prior tracker usage, stale-state removal, stable headings/limits, final-only.

### 21.5 Consolidation authoring

Schema 17.5, chronology, minimum coherent summaries, `member_ids`, `unassigned_items`, major continuity, concrete keywords. **Regenerate Consolidation** только replacement.

### 21.6 Topical Clip

Должен включать `{{SOURCE_MEMORIES}}`, оставаться on-topic, отличать evidence/inference, merge new info, surface contradictions.

### 21.7 Compaction

`{{ENTRY_CONTENT}}` обязателен; сокращать без invention, сохранять wrappers/macros.

### 21.8 Checklist

1. Analysis target?
2. Reference-only?
3. Strict JSON или plain text?
4. Что должно сохраниться?
5. Что omit/merge/carry/unassign?

Формат важнее стиля.

---

## 22. Summary Prompt Manager и Consolidation Prompt Manager

Summary Manager: create/edit/duplicate/delete/import/export ordinary presets; profile assignment; JSON schema обязателен.

Consolidation Manager: prompts и normal default; regeneration-only нельзя выбрать как ordinary default.

Built-ins можно recreate в locale, custom backups заранее.

---

## 23. Интеграция Regex

1. **Outgoing/User Input** — трансформация перед send.
2. **Incoming/AI Output** — cleanup перед parse/save.

**Use regex (advanced)** → **Configure regex** → scripts.

STMB selection сама управляет execution, даже если script disabled в обычной Regex UI.

Плохой outgoing ломает schema; incoming ломает JSON.

---

## 24. Заголовки записей лорбука и политика символов

### 24.1 Placeholders

`{{title}}`, `{{scene}}`, `{{char}}`, `{{user}}`, `{{messages}}`, `{{profile}}`, date/time.

### 24.2 Numbering

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

Sequential zero-padded.

### 24.3 Unicode

Любой printable Unicode, включая emoji/CJK. Control U+0000–U+001F и U+007F–U+009F удаляются. Auto-Create filenames отдельно sanitised.

---

## 25. Очередь задач и повторные попытки

Требует optional Chat Top Bar. Regeneration Memory/consolidation/Side Prompt создаёт job; replacement ждёт review.

Статусы: queued, active, completed, failed, canceled, blocked, Needs Review.

Drawer показывает message ranges, позволяет cancel/review/failure/retry/dismiss.

- **Retry:** non-Memory job.
- **Retry All:** Memory + after-Memory Side Prompts; может resume saved result без duplicate.
- **Retry Memory:** только Memory, без after-memory prompts.

Без Top Bar workflows работают без queue UI.

---

## 26. Визуальная обратная связь и доступность

Scene states: inactive, selected, valid range, in-scene, processing; цвета зависят от theme.

Accessibility: keyboard, focus, ARIA, reduced motion, mobile controls.

На скриншоте описывайте icon/label, не цвет.

---

## 27. Карта настроек и актуальный справочник

Путь: **Extensions (волшебная палочка) → Memory Books**.

Scopes: Global, Per chat, Per character, Per profile/template/setting, Per run.

### 27.1 Main

| Setting | Location | Scope | Что делает |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | Current Lorebook Configuration | global mode/chat book | Требует manual book; несовместим Auto-Create. |
| **Selected manual Memory Book** | manual controls | per chat | Main book; Narrator = omniscient. |
| **Group-character Memory Book assignments** | group rows | per chat | Separate book на member; нужен STLO. |
| **Character Memory Book lock** | lock icon | per character | Persistent assignment. |
| **Narrator Mode** | current config | per chat | Omniscient main + declared unique books. |
| **Manage Narrator Cast** | Narrator/Active Cast | per chat | Cast management. |
| **Auto-create lorebook if none exists** | current config | global | Создаёт/binds book в Automatic. |
| **Lorebook Name Template** | under Auto-Create | global | `{{char}}`, `{{user}}`, `{{chat}}`. |
| **Memory profile selection** | Memory Profiles | per run | Next Memory profile. |
| **Set as Default** | Profile Actions | global | Default profile. |
| **Memory Title Format** | Profiles/Edit | per profile | Titles/numbering. |

### 27.2 General Settings

| Setting | Scope | Что делает |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Skip confirmation; нужно Catch-Up. |
| **Automatically accept detected participants in future** | Global | Auto-accept real-group participants. |
| **Show memory previews** | Global | Editable review. |
| **Show consolidation previews** | Global | Consolidation review. |
| **Show notifications** | Global | Toasts. |
| **Show floating Clip button when text is highlighted** | Global | Scissors. |
| **Memory boundary indicator** | Global | Divider/jump. |
| **Allow scene overlap** | Global | Allows overlap. |
| **Refresh lorebook editor after adding memories** | Global | Refresh open editor. |
| **Copy Memory Books when branching** | Global | Copy unlocked books; locked remain shared. |
| **Default for solo chats** | Global | Solo Side Prompt Set. |
| **Default for group chats** | Global | Group set. |
| **Max Response Tokens** | Global | STMB output cap; `0` fallback. |
| **Token Warning Threshold** | Global | Size warning. |
| **Default Previous Memories Count** | Global | 0–7. |
| **Use regex (advanced)** | Global | Regex processing. |
| **Configure regex… → Outgoing scripts** | Global | Before send. |
| **Configure regex… → Incoming scripts** | Global | Before parse/save. |

Token Saving:

- **Auto-hide messages after adding memory** — none/all processed/last range.
- **Messages to leave unhidden** — overlap; 0 means through end.
- **Unhide hidden messages for memory generation** — `/unhide X-Y` equivalent.

### 27.3 Automatic

- **Auto-create memory summaries** — automatic, может с message 0.
- **Auto-Summary Interval** — cadence.
- **Auto-Summary Buffer** — newest excluded.
- **Prompt for consolidation when a tier is ready** — yes/later, не automatic consolidation.
- **Auto-Consolidation Tiers** — monitored tiers.

### 27.4 Profile Editor

| Setting | Что делает |
|---|---|
| **Profile Name** | Имя. |
| **API/Provider** | Current ST/provider/Custom/Full Manual. |
| **Use this connection profile** | Active/named Custom. |
| **Skip structured output and use plain-text completion** | Не отправляет schema, JSON всё ещё нужен. |
| **Use ST's ChatCompletionService** | ST helper. |
| **Chat Completion Preset** | Optional preset. |
| **Model** | Exact ID. |
| **Temperature** | Randomness. |
| **Use reverse proxy** | ST proxy. |
| **API Endpoint URL / API Key** | Full Manual. |
| **Memory Creation Method** | Summary preset. |
| **Use separate group and character prompts in group chats** | Separate prompts. |
| **Group Summary Prompt / Character Summary Prompt** | Preset selection. |
| **Memory Title Format** | Titles. |
| **Activation Mode** | Normal/Constant/Vectorized. |
| **Insertion Position** | Character/Example/Author's Note/Outlet. |
| **Outlet Name** | Outlet. |
| **Insertion Order** | Auto/Manual/Reverse. |
| **Prevent Recursion** | No triggering other entries. |
| **Delay Until Recursion** | No first-pass activation. |
| **Also include** | Legacy only. |

Current ST provider/model/temp/proxy настраиваются в SillyTavern.

### 27.5 Context Settings

- **Additional Context for this chat** — named/No Context/unset.
- **Context Setting Name**
- **Additional Context entries and order**

New/Duplicate/Delete/Import/Export управляют объектами.

### 27.6 Trackers & Side Prompts

- After-memory mode per chat: default/individual/set.
- Concurrent prompts: 1–10.
- Set Name.
- Row prompt/label/macros/order.
- Enabled.
- Visible interval.
- Auto after memory.
- Manual `/sideprompt`.
- Prompt/Response Format.
- Previous memories 0–7.
- Additional Context follow/fixed.
- Lorebook Target template/chat.
- Title/Keywords.
- Activation/Insertion/Outlet.
- Order.
- Recursion/Ignore Budget.
- Connection Profile override.
- Memory Assistance Mode Off/Update/Update and Suggest/Automatic.
- Update/Topic Suggestion Prompts.
- Memory Assistance profile override.

### 27.7 Prompt Managers

Summary preset name/text; default consolidation prompt; consolidation preset name/text.

### 27.8 Topical/Compaction defaults

Shared **Generation Profile / Compaction Profile**; global Topical Clip Prompt; global Compaction Prompt requiring `{{ENTRY_CONTENT}}`.

### 27.9 Consolidate controls

Target tier; prompt; max entries/pass; token budget; attempts; saved minimum per tier; consolidated-entry activation/position/order/recursion; disable sources; selected sources.

### 27.10 SillyTavern World Info

Match Whole Words off common; Scan Depth ~8; Max Recursion ~2; context/lorebook budget. Recommendations.

---

## 28. Справочник slash-команд

```text
/creatememory
/scenememory X-Y
/nextmemory
/stmb-catchup interval=x start=y end=z
```

Side Prompt:

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

Boundary:

```text
/stmb-highest
/stmb-set-highest <N|none>
```

Stop:

```text
/stmb-stop
```

Останавливает все in-flight STMB generation, включая Side Prompts; committed work остаётся.

---

## 29. Устранение неполадок по этапам

### 29.1 UI не загрузился

Проверьте install/enable, reload, открытый chat, 10s, expanded actions, затем console.

### 29.2 No scene

Нужны оба **►**/**◄**; Current Scene; overlap setting.

### 29.3 No valid book

Automatic: bind или Auto-Create.

Manual: select main, repair deleted, unlock broken.

Multi-book group: STLO + all assignments + group book != character book.

Narrator: Manual + omniscient + unique per member.

### 29.4 Invalid AI output

Порядок: profile/provider, truncation, output tokens, exact JSON prompt, Regex, structured support, Skip Structured только при rejection, better model, Raw response/manual correction.

### 29.5 Messages disappeared

Auto-hidden, не deleted.

### 29.6 Automatic не сработал

Enabled, enough messages, interval+buffer, no postpone, valid book, no blocking job, no chat switch, group generation complete.

### 29.7 Entry не activates

Book, enabled, keywords, mode, budget, recursion, STLO, inspector/logs. Не regenerate до retrieval check.

### 29.8 Sent but ignored

Model behavior: shorter/clearer, placement, less context, OOC reminder, better model.

### 29.9 Side Prompt

Section 16.18; selected set suppresses outside individual prompts.

### 29.10 Consolidation readiness

Enabled, tier monitored, eligible count/minimum.

### 29.11 Regeneration disabled

Old metadata, source missing, wrong/missing sources, parent blocks, sequence unknown, template deleted.

### 29.12 Branch copy

Setting before branch, native branch, books load, no chat switch, not already handled, locks intentionally preserved.

### 29.13 Narrator cast

Active selection, continuation, swipe, legacy confirmation, retired status, books exist.

---

## 30. FAQ

**Нужны Vectors?** Нет, keywords достаточно.

**Отдельный лорбук?** Обычно да для порядка/budget/reuse/diagnosis, не обязательно.

**STMB удаляет messages?** Нет, только скрывает из контекста.

**Полностью вручную?** Да.

**Automatic может сделать первую Memory?** Да, с message 0 при interval+buffer; manual first всё ещё рекомендуется.

**Consolidation automatic?** Нет, только prompt + review.

**Одна книга для real group?** Да, recommended, STLO не нужен.

**Когда separate character books?** Когда individual continuity/knowledge/retrieval стоит сложности.

**Narrator = Group?** Нет: Group — разные Cards; Narrator — один Card пишет несколько fictional characters.

**Narrator нужен STLO?** Нет для Active Cast; нужен Manual, omniscient, unique books.

**Linked copies synchronized?** Нет.

**Delay Until Recursion почему off?** Без другого recursion starter запись может никогда не активироваться.

**После первой Memory?** Проверить retrieval, включить automatic/interval/buffer/hide, затем Clips/Side Prompts и позже Topical/Consolidation при необходимости.

---

## 31. Совместимость, миграция и актуальные исторические примечания

### Current baseline

- v8.5.0, 1 августа 2026.
- SillyTavern 1.14.0+.
- Narrator Mode: v8.5.0.
- Branch copy, Side Prompt Regeneration, Character Locks: v8.4.0.
- Multi-character real-group: v8.0.0.
- Additional Context → per-chat Context Settings: v7.0.0.
- Topical Clip: v6.10.0.
- Compaction/Clips: v6.6.0.
- Side Prompt Sets/targets: v6.4–v6.5.
- Multi-tier consolidation: v6.0.0.
- Job Queue: v6.8.0 optional.
- Delay Until Recursion default off.

### Older Memories

Только entries с `stmemorybooks` и required metadata считаются STMB Memories. Для старых используйте converter.

### Removed

Bookmarks удалены из core Memory Books в v4.0.0. Не учите им как текущей функции.

### Localized built-ins

Можно regenerate по активному языку. Backup customizations.

### Import

Side Prompt import additive; key conflicts rename, не overwrite.

---

## 32. Примечания для разработчиков и лицензия

```sh
bun run build
```

```sh
bun run install-hooks
```

Hook builds before commit, stages artifacts, aborts on failure.

Copyright © 2024–2026 Aiko Hanasaki. GNU Affero General Public License v3.0. Модификации должны сохранять уведомления, отмечать изменения и соблюдать AGPL source-availability.

---

## 33. Компактное дерево диагностики

```text
«Memory Books не работает»
│
├─ Control visible?
│  ├─ Нет → install/loading/UI.
│  └─ Да
├─ Scene selectable?
│  ├─ Нет → actions, оба chevrons, overlap.
│  └─ Да
├─ Valid effective book?
│  ├─ Нет → bind/auto-create/manual/repair.
│  └─ Да
├─ Valid complete generation?
│  ├─ Нет → profile/provider/tokens/JSON/Regex/model.
│  └─ Да
├─ Entry saved?
│  ├─ Нет → save/rollback/permission/job.
│  └─ Да
├─ SillyTavern activates/sends?
│  ├─ Нет → keywords/mode/binding/budget/recursion/STLO.
│  └─ Да
└─ Model uses?
   ├─ Нет → compliance/placement/context/clarity.
   └─ Да → workflow работает.
```

---

## 34. Минимальная рекомендуемая последовательность обучения

1. Найти Memory Books в меню.
2. Automatic Mode + bound book или Auto-Create.
3. Current SillyTavern Settings.
4. Короткая сцена **►**/**◄**.
5. Create/preview Memory.
6. Открыть book и проверить entry.
7. Проверить retrieval.
8. Automatic + interval/buffer.
9. Auto-hide только после объяснения, что не delete.
10. Clips → Side Prompts → Topical/Consolidation только по необходимости.

Не начинать с custom prompts, Full Manual, multi-books, Regex, Consolidation без реальной причины.

---

## 35. Итоговая модель

```text
Выбрать/запланировать chat material
→ сгенерировать structured representation
→ сохранить с retrieval metadata
→ при желании скрыть processed transcript
→ позже позволить SillyTavern извлечь релевантные entries
```

Лучше всего работает при coherent scenes, ясном разделении target/reference, точных JSON schemas, concrete keywords, deliberate book assignments, pruning stale trackers, разумной Consolidation, проверке retrieval и использовании advanced multi-book routing только когда его точность оправдывает сложность.
