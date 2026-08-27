<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: 완전한 AI 참조 매뉴얼

**제품:** SillyTavern Memory Books (STMB)  
**참조 버전:** v8.5.0, 2026년 8월 1일  
**목적:** AI 어시스턴트가 Memory Books를 가르치고, 설명하고, 문제를 해결할 때 사용하는 하나의 고밀도 기준 문서.

---

## 목차

- [1. AI 어시스턴트가 이 매뉴얼을 사용하는 방법](#1-ai-어시스턴트가-이-매뉴얼을-사용하는-방법)
- [2. 제품 정의와 기본 개념](#2-제품-정의와-기본-개념)
- [3. 핵심 용어와 기능 선택](#3-핵심-용어와-기능-선택)
- [4. 요구 사항, 설치 및 초기 확인](#4-요구-사항-설치-및-초기-확인)
- [5. Memory Books 열기와 메인 패널 이해](#5-memory-books-열기와-메인-패널-이해)
- [6. Memory Book 저장 모드](#6-memory-book-저장-모드)
- [7. 프로필, 연결 및 생성 라우팅](#7-프로필-연결-및-생성-라우팅)
- [8. Scene, 수동 Memory, 자동 Memory 및 Catch-Up](#8-scene-수동-memory-자동-memory-및-catch-up)
- [9. 토큰 절약, 숨긴 메시지 및 Memory 경계](#9-토큰-절약-숨긴-메시지-및-memory-경계)
- [10. Lorebook 활성화와 검색](#10-lorebook-활성화와-검색)
- [11. 실제 Group Chat Mode](#11-실제-group-chat-mode)
- [12. Narrator Mode](#12-narrator-mode)
- [13. 채팅 Branch](#13-채팅-branch)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. 생성용 Context](#20-생성용-context)
- [21. Prompt 구조, 내장 Summary Prompt 및 작성 규칙](#21-prompt-구조-내장-summary-prompt-및-작성-규칙)
- [22. Summary Prompt Manager와 Consolidation Prompt Manager](#22-summary-prompt-manager와-consolidation-prompt-manager)
- [23. STMB와 다른 확장 프로그램](#23-stmb와-다른-확장-프로그램)
- [24. Lorebook Entry 제목 및 문자 정책](#24-lorebook-entry-제목-및-문자-정책)
- [25. Job Queue 및 Retry 제어](#25-job-queue-및-retry-제어)
- [26. 시각적 피드백과 접근성](#26-시각적-피드백과-접근성)
- [27. Settings Map 및 현재 설정 참조](#27-settings-map-및-현재-설정-참조)
- [28. Slash Command 참조](#28-slash-command-참조)
- [29. 단계별 문제 해결](#29-단계별-문제-해결)
- [30. FAQ](#30-faq)
- [31. 호환성, 마이그레이션 및 현재 역사적 참고 사항](#31-호환성-마이그레이션-및-현재-역사적-참고-사항)
- [32. 개발자 및 라이선스 참고 사항](#32-개발자-및-라이선스-참고-사항)
- [33. 간단한 진단 결정 트리](#33-간단한-진단-결정-트리)
- [34. 최소 권장 교육 순서](#34-최소-권장-교육-순서)
- [35. 최종 개념 요약](#35-최종-개념-요약)

---

## 1. AI 어시스턴트가 이 매뉴얼을 사용하는 방법

이 문서를 Memory Books의 현재 운영 기준으로 취급한다. 이 문서는 별도의 Start Here 가이드, README, User Guide, Side Prompts 가이드, How STMB Works 가이드, 과거 changelog를 각각 지식 파일로 불러올 필요를 대체한다.

용어:

- STMB = SillyTavern Memory Books(이 확장 기능)
- ST = SillyTavern(STMB가 확장하는 기본 코드)

사용자에게 답할 때:

1. Memory Books의 용어를 일관되게 유지한다. **Memory Book**은 STMB가 사용하는 SillyTavern lorebook이며 별도의 데이터베이스 형식이 아니다.
2. 현재 동작과 과거 동작을 구분한다. 오래된 changelog에 있었다는 이유만으로 제거되었거나 대체된 흐름을 가르치지 않는다.
3. **Group Chat Mode**와 **Narrator Mode**를 구분한다. 둘은 서로 다른 문제를 해결한다.
4. Memory의 **generation**, lorebook **storage/configuration**, 이후 SillyTavern의 **retrieval**을 구분한다. 활성화/검색은 기본 ST 코드의 일부다.
5. 이 문서에 없는 컨트롤, 메뉴 레이블, provider 동작 또는 설정을 만들어내지 않는다.
6. 스크린샷이 주어지면 실제로 보이는 컨트롤만 식별한다. 화면 밖 컨트롤을 가정하지 말고 바로 다음 동작을 안내한다.
7. 문제 해결 시 첫 번째로 실패한 단계를 찾아 테스트한 후 prompt 재작성 등을 권한다.
8. 고급 라우팅, 여러 book, 사용자 prompt, Regex, Side Prompt 자동화보다 먼저 단순하고 작동하는 구성을 만든다.
9. character filter와 별도 Memory Book은 라우팅과 관련성을 개선하지만 보안 경계가 아님을 설명한다.
10. 사용자의 STMB 버전, SillyTavern 버전, provider 또는 custom prompt가 다를 수 있으면 불확실성을 명시한다.

### 현재 문서 참고 사항

Narrator Mode는 v8.5.0에 구현되어 있다.

일부 초보자 문서에서는 자동 Memory가 시작되기 전에 수동 Memory 하나가 기술적으로 필요하다고 설명했다. 현재 STMB는 processed-message baseline이 없으면 message 0부터 첫 자동 Memory를 만들 수 있다. 그래도 첫 수동 Memory는 connection, Memory Book, 출력 형식, 원하는 시작 경계를 확인할 수 있으므로 여전히 권장된다.

---

## 2. 제품 정의와 기본 개념

Memory Books는 선택되거나 자동으로 정해진 채팅 범위를 구조화된 Memory entry로 변환하여 SillyTavern lorebook에 저장하는 확장 기능이다.

기본 흐름:

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

STMB는 모델 자체에 영구 기억을 추가하지 않는다. 외부 참조 시스템(lorebook entry)을 관리한다. SillyTavern이 관련 lorebook entry를 AI 요청에 포함할 때 채팅 모델이 그것을 “기억”하게 된다.

### 세 가지 독립 단계

1. **Generation quality** — Memory 생성 모델이 정확하고 유용한 결과를 만들었는가?
2. **Storage and configuration** — 결과가 올바른 Memory Book에 적절한 활성화 설정과 함께 저장되었는가?
3. **Retrieval and model use** — SillyTavern이 entry를 활성화해 전송했고, 채팅 모델이 이를 올바르게 사용했는가?

이 세 단계를 따로 진단한다.

### Lorebook과 Memory Book

**lorebook**(SillyTavern 일부에서는 **World Info**)은 SillyTavern이 조건에 따라 모델 요청에 추가할 수 있는 entry 모음이다. 일반적인 lorebook entry에는 다음이 있다.

- title/comment
- content
- activation keywords 또는 다른 activation mode
- insertion position과 order
- recursion과 budget 제어
- 선택적인 character filter 및 기타 metadata

**Memory Book**은 STMB가 사용하는 일반 SillyTavern lorebook이다. 일반 lorebook 도구로 열고, 수정하고, 순서를 바꾸고, export/import/delete할 수 있다. 사용 기능에 따라 다음이 들어갈 수 있다.

- scene Memories
- Arc, Chapter, Book, Legend, Series, Epic summaries
- Clip 및 Topical Clip entries
- Side Prompt tracker entries
- 기타 STMB 관리 entries

### Memory entry는 압축된 context다

Scene Memory는 원본 transcript가 아니다. 다음과 같은 연속성에 중요한 정보를 보존하기 위한 압축 표현이다.

- 사건과 결과
- 결정과 계획
- 발견과 폭로
- 관계 또는 감정 변화
- 개별 인물의 지식, 믿음, 오해
- 중요한 물건, 장소, 정체, 약속, 제약

처리된 메시지를 숨겨도 삭제되는 것은 아니다. AI에 전송되는 active chat-history context에서 제외되어 토큰을 계속 소비하지 않게 한다.

---

## 3. 핵심 용어와 기능 선택

| 필요 | 기능 | 의미 |
|---|---|---|
| 선택한 또는 자동 채팅 범위를 요약 | **Memory** | “이 scene에서 일어난 일을 기억해.” |
| 선택한 채팅 문구나 한 사실 저장 | **Clip** | “이 메모를 저장해.” |
| 저장된 Memories에서 한 주제의 사실 모으기 | **Topical Clip** | “내 Memories가 이 주제에 대해 말하는 내용을 모아.” |
| 반복 실행으로 변하는 정보 유지 | **Side Prompt** | “이 tracker를 계속 최신 상태로 유지해.” |
| 여러 하위 tier Memory/summary 결합 | **Consolidation** | “이 entries를 상위 recap으로 묶어.” |
| 하나의 기존 STMB entry 단축 | **Compaction** | “사실은 유지하고 이 entry를 줄여.” |
| 원래 source로 기존 entry 교체본 만들기 | **Regeneration** | “이 entry를 다시 만들고 교체를 검토해.” |

### 자주 혼동하는 기능

- **Clip vs Topical Clip:** Clip은 현재 채팅에서 선택한 텍스트로 시작한다. Topical Clip은 기존의 확인된 STMB Memories에서 시작한다.
- **Topical Clip vs Side Prompt:** Topical Clip은 주제를 모으기 위해 수동 실행한다. Side Prompt는 변하는 tracker를 반복 유지할 수 있다.
- **Compaction vs Consolidation:** Compaction은 entry 하나를 다시 쓴다. Consolidation은 여러 entry로 새 상위 tier summary를 만든다.
- **Memory vs Side Prompt:** Memories는 보통 순차적인 scene 기록이다. Side Prompts는 하나의 지속 지원 문서를 update/overwrite한다.
- **Generation vs retrieval:** entry를 만들었다고 SillyTavern이 나중에 반드시 활성화하는 것은 아니다.

---

## 4. 요구 사항, 설치 및 초기 확인

### 요구 사항

- SillyTavern 1.18.0 이상. 최신 호환 릴리스 권장.
- 작동하는 AI connection.
- 지시를 따를 수 있고, Memory/Consolidation에서는 유효한 JSON을 반환할 수 있는 모델.
- third-party SillyTavern extension 설치 권한.
- local 또는 Text Completion backend를 OpenAI-compatible Chat Completion endpoint로 사용할 때 SillyTavern에 사용 가능한 Chat Completion preset.

### 일반 Chat Completion 사용자

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google 등 Chat Completion 연결은 대개 내장 **Current SillyTavern Settings** profile을 사용할 수 있다.

### Local 및 Text Completion 사용자

KoboldCpp, llama.cpp, TextGen, Ollama 등은 OpenAI-compatible Chat Completion endpoint로 노출할 때 가장 안정적인 경우가 많다. 평소 roleplay가 Text Completion이더라도 STMB를 위해 SillyTavern에 Chat Completion preset이 필요하다.

일반적인 KoboldCpp 설정:

- API type: Chat Completion
- source: Custom OpenAI-compatible
- endpoint 예: `http://localhost:5001/v1` 또는 `http://127.0.0.1:5000/v1`
- SillyTavern이 요구하면 비어 있지 않은 custom API key
- endpoint가 기대하는 model ID, 흔히 `koboldcpp/modelname`; 불필요한 `.gguf` suffix 제외
- Chat Completion preset import
- response length 최소 2048 tokens, 보통 4096이 더 안전

일반적인 llama.cpp 설정:

- API type: Chat Completion
- source: Custom OpenAI-compatible
- endpoint `http://localhost:8080/v1`, SillyTavern이 Docker라면 `http://host.docker.internal:8080/v1`
- 필요하면 비어 있지 않은 API key
- 제공되는 model ID
- endpoint가 요구하지 않으면 prompt post-processing 없음

예시 server command:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### 선택 사항: Chat Top Bar

STMB는 Chat Top Bar / Chat Top Info Bar 없이 작동한다. 설치하면 active, completed, failed, canceled, blocked, review-needed 작업을 보여 주는 **Memory Books Jobs** queue UI가 추가된다.

### 설치

1. SillyTavern을 연다.
2. 메인 **Extensions** 패널을 연다.
3. **Install Extension**을 선택한다.
4. 공식 Memory Books repository를 설치한다.
5. 요청되면 SillyTavern을 reload한다.
6. character chat 또는 group chat을 연다.
7. STMB controls가 초기화될 때까지 몇 초 기다린다.

SillyTavern Extras는 필요하지 않다.

### STMB가 로드되었는지 확인

다음 중 하나 이상이 보여야 한다.

- 채팅 입력 옆 magic-wand Extensions menu의 **Memory Books**
- 펼친 message actions의 scene chevrons **►**, **◄**

둘 다 없다면:

1. 최대 10초 기다린다.
2. 페이지를 새로고침한다.
3. extension이 설치 및 활성화되었는지 확인한다.
4. character 또는 group chat을 다시 연다.
5. 기본 확인이 실패한 뒤에만 browser console을 확인한다.

---

## 5. Memory Books 열기와 메인 패널 이해

채팅 입력 근처의 magic-wand Extensions menu를 열고 **Memory Books**를 선택한다.

패널에는 다음이 포함될 수 있다.

- Current Scene
- Memory Status / highest processed message
- Current Lorebook Configuration
- Memory Profiles
- Profile Actions
- Extra Function Buttons
- Prompt Managers
- General Settings
- Automatic Memories
- Token Saving
- 관련 시 group-character 또는 Narrator controls

첫 Memory에는 세 가지 결정만 필요하다.

1. 어떤 Memory Book에 저장할 것인가?
2. 어떤 profile/connection으로 생성할 것인가?
3. 어떤 chat messages가 scene인가?

---

## 6. Memory Book 저장 모드

### 6.1 Automatic Mode: chat-bound Memory Book

Automatic Mode가 일반 기본값이다. STMB는 SillyTavern을 통해 현재 chat에 bind된 lorebook을 사용한다.

사용하기 좋은 경우:

- 한 chat에 주 Memory Book 하나
- 최소 설정 선호
- group character별 별도 Memory Book이 필요 없음

bind된 lorebook이 없으면 SillyTavern에서 하나를 bind하거나 Auto-Create를 사용한다.

### 6.2 Auto-Create Lorebook Mode

**Auto-create lorebook if none exists**를 켜면 첫 Memory 저장 시 STMB가 lorebook을 만들고 bind할 수 있다.

기본 이름 template에서 사용 가능:

- `{{char}}` — character 또는 group name
- `{{user}}` — user name
- `{{chat}}` — chat ID/name

중복 이름을 피하기 위해 STMB가 숫자 suffix를 추가한다.

Auto-Create와 Manual Lorebook Mode는 동시에 사용할 수 없다.

### 6.3 Manual Lorebook Mode

**Manual Lorebook Mode**를 켜면 chat-bound lorebook과 독립적으로 Memory Book을 선택한다.

사용하기 좋은 경우:

- memory를 전용 lorebook에 둘 때
- 여러 chat이 의도적으로 하나의 Memory Book을 공유할 때
- group member별 별도 book이 필요할 때
- Narrator Mode를 사용할 때
- 사용자가 이후 activation plan을 이해할 때

main manual Memory Book 선택은 현재 chat에 저장된다. 단, 호환 solo chat에서 persistent character lock이 우선할 수 있다.

### 6.4 별도 Memory Book이 보통 더 명확함

전용 Memory Book은 다음을 쉽게 한다.

- memory와 character definition/setting lore 분리
- 독립 lorebook budget/order 설정
- memory history 재사용/export
- unrelated lore 없이 STMB entries 확인
- activation 진단

권장 사항일 뿐 필수는 아니다.

### 6.5 Character Memory Book locks

Character Memory Book lock은 character card에 붙는 지속적인 Manual Mode assignment다.

solo chat:

- unlocked manual book은 현재 chat에 속한다.
- locked book은 호환 Manual Mode chats에서 character card를 따라간다.
- lock 해제 전에는 manual book을 바꿀 수 없다.

real group chat:

- unlocked per-character assignment는 현재 group chat에 속한다.
- locked per-character assignment는 호환 Manual Mode groups에서 해당 card를 따라간다.
- locked book이 없으면 broken-lock 상태가 되며 unlock 또는 repair해야 한다.

같은 character가 여러 story에서 의도적으로 하나의 계속되는 Memory Book을 공유해야 할 때만 lock을 사용한다. alternate universe나 독립 timeline에는 위험하다.

### 6.6 권장 시작 layout

- Solo chat: chat-bound 또는 auto-created Memory Book 하나.
- Real group chat: group Memory Book 하나.
- Narrator chat: Narrator Mode 요구에 따라 omniscient Memory Book 하나 + declared character마다 고유 book 하나.

---

## 7. 프로필, 연결 및 생성 라우팅

Memory Books profile은 generation과 결과 lorebook-entry 설정을 함께 제어한다.

### 7.1 첫 profile 권장

먼저 **Current SillyTavern Settings**를 사용한다. 현재 SillyTavern에서 active provider, model, temperature를 사용한다.

처음부터 prompt를 다시 쓰거나 Full Manual endpoint를 구성하지 않는다. 먼저 Memory 하나가 생성되고 저장되는지 확인한다.

### 7.2 별도 STMB profile이 필요한 경우

다음이 필요할 때 saved profile을 만든다.

- memory에 더 저렴하거나 안정적인 model 사용
- roleplay와 다른 provider 사용
- named Custom connection bind
- custom summary prompt 선택
- 다른 temperature/max output behavior
- title formatting 변경
- activation/insertion/order/recursion 변경
- 별도 group/omniscient 및 character-focused prompts 사용

### 7.3 Profile fields

profile에는 다음이 포함될 수 있다.

- display name
- API/provider
- model ID
- temperature
- Summary Prompt preset
- optional separate multi-character prompts
- structured-output behavior
- optional SillyTavern ChatCompletionService routing
- optional Chat Completion preset
- reverse-proxy behavior
- title format
- activation mode: Normal, Constant, Vectorized
- insertion position(character/example-message/author’s-note/Outlet 포함)
- Outlet name
- automatic/manual order value
- Prevent Recursion
- Delay Until Recursion

### 7.4 Named Custom OpenAI-compatible connections

Custom OpenAI-compatible profile은:

- 현재 active SillyTavern Custom connection 사용 또는
- SillyTavern Connection Manager의 named Custom connection 하나 bind

named connection은 저장된 URL과 secret을 제공한다. STMB profile의 model field는 model override로 유지된다. named connection이 삭제되거나 Custom Chat Completion connection이 아니게 되면 STMB는 조용히 다른 곳으로 보내지 않고 요청을 block한다.

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion**은 schema를 거부하는 provider에 structured-output schema를 보내지 않는다. 그래도 선택한 Memory/Consolidation prompt가 요구하는 유효한 JSON을 model이 반환해야 한다.

### 7.6 ChatCompletionService

**Use ST's ChatCompletionService**는 지원 profile 요청을 SillyTavern request helper로 라우팅하며 선택한 SillyTavern Chat Completion preset을 적용할 수 있다. OpenRouter 요청은 provider order, quantization filters, fallback controls, middle-out routing도 상속한다. ChatCompletionService가 실패해 STMB fallback 경로를 사용해도 이 OpenRouter controls가 유지된다. 그 재시도까지 실패하면 STMB는 처음 오류와 fallback provider response를 모두 보존해 보고한다. Full Manual profile은 이 경로를 사용하지 않는다.

### 7.7 Reverse proxy 및 Full Manual Configuration

**Use reverse proxy**는 지원 provider에 SillyTavern의 reverse-proxy 정보를 전달한다.

**Full Manual Configuration**은 별도 endpoint/key를 STMB profile 안에 저장한다. 예외적인 경로다. 가능하면 SillyTavern에서 구성하고 테스트한 provider/Custom connection을 사용한다.

### 7.8 Output length

global STMB maximum response-token setting은 Memory Books 작업의 일반 Chat Completion output length를 override할 수 있다. 잘린 JSON은 generation 실패의 흔한 원인이다. schema나 prompt를 약화하기 전에 output length를 늘린다.

---

## 8. Scene, 수동 Memory, 자동 Memory 및 Catch-Up

### 8.1 Scene이란

**scene**은 STMB가 하나의 Memory로 처리하는 inclusive chat-message range다.

좋은 경계는 보통 하나의 일관된 단위를 담는다.

- 사건
- 대화
- 조사 단계
- 감정/관계 발전
- 장소/목표 변화
- 연결된 action sequence

너무 작은 범위는 가치가 적을 수 있다. 너무 큰 범위는 비용이 증가하고 요약이 어려우며 context를 초과하거나 서로 다른 사건을 섞기 쉽다.

### 8.2 Scene 수동 표시

1. message actions를 펼친다(보통 three-dot 또는 비슷한 control).
2. 첫 포함 message에서 **►**를 누른다.
3. 마지막 포함 message에서 **◄**를 누른다.
4. Memory Books를 열어 start/end/speakers/message count/token estimate를 확인한다.

두 boundary message 모두 포함된다.

**Clear Scene**으로 선택을 지우거나 다른 start/end marker로 하나의 경계를 교체한다.

### 8.3 수동 Memory 만들기

1. scene 확인.
2. effective Memory Book 확인.
3. selected profile 확인.
4. **Create Memory** 또는 `/creatememory` 실행.
5. 표시되면 confirmation, token warning, participant confirmation, preview 확인.
6. 결과 승인.
7. 새 lorebook entry가 생겼고 Memory Status가 scene 끝까지 진행했는지 확인.

유효한 Memory 결과에는 보통:

- title
- content
- keywords
- source range/chat identity 등 STMB metadata

### 8.4 Memory previews

**Show memory previews**가 켜져 있으면 다음을 검토/수정할 수 있다.

- title
- memory content
- keywords

이름, attribution, 사실, 빠진 consequence, 관련 없는 commentary를 확인한다. preview가 꺼져 있으면 유효한 결과는 자동 저장된다.

### 8.5 Automatic Memories

**Auto-create memory summaries**를 켜고:

- **Auto-Summary Interval** — 자동 Memory당 새 message 수
- **Auto-Summary Buffer** — 아직 진행 중인 scene을 너무 일찍 요약하지 않도록 최신 message 제외 수

예:

```text
Interval: 30
Buffer: 2
```

processed boundary 이후 최소 32 messages가 있어야 하며 newest message보다 2 messages 앞에서 끝나는 Memory를 만든다.

processed baseline이 없으면 현재 STMB는 baseline을 `-1`로 보고 message 0에서 시작할 수 있다. 그래도 setup 검증과 의도적인 시작점 선택을 위해 첫 수동 Memory를 권장한다.

낮은 interval은 더 focused한 Memories와 더 많은 요청을 만든다. 높은 interval은 요청 수는 줄지만 unrelated material을 합칠 위험이 커진다. 세밀한 roleplay는 약 20–40 messages, 짧고 빠른 대화는 40–60을 실용적인 시작 범위로 볼 수 있다.

필요한 Memory Book assignment가 없으면 자동 generation이 postponed될 수 있다.

### 8.6 Processed-message baseline

STMB는 chat별 highest processed message를 저장한다. 이는:

- `/nextmemory` 시작점
- automatic Memory 시작점
- memory-boundary indicator
- 이미 처리된 message 판정

에 사용된다.

사용:

```text
/stmb-highest
/stmb-set-highest <N>
/stmb-set-highest none
```

수동 변경은 skipped/repeated range를 만들 수 있으므로 신중하게 한다.

### 8.7 기존 긴 chat Catch-Up

사용:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

예:

```text
/stmb-catchup interval=40 start=0 end=245
```

range는 inclusive다. chunk는 순서대로 처리되며 마지막 chunk는 더 작을 수 있다.

Catch-up은 의도적으로 non-interactive다. 실행 전:

- intended profile 선택 및 테스트
- **Always use default profile** 켜기
- **Show memory previews** 끄기
- effective Memory Book 확보 또는 Automatic Mode에서 Auto-Create 허용
- 필요한 multi-character book assignment 모두 수리
- token-warning threshold보다 작은 chunk size 선택

STMB는 모든 chunk를 preflight하고 순서대로 처리하며 첫 failure 또는 `/stmb-stop`에서 멈춘다. 이전에 완료한 chunk는 남는다. 전체를 반복하지 말고 첫 미완료 message부터 재개한다.

Catch-up은 광범위 변환용이다. 문학적/사건 단위 경계가 중요하면 수동 scene boundary가 더 좋다.

---

## 9. 토큰 절약, 숨긴 메시지 및 Memory 경계

### 9.1 숨김은 삭제가 아님

hidden message는 chat file에 남는다. 다시 표시하기 전까지 active chat context에서 제외된다.

### 9.2 Auto-hide modes

**Auto-hide messages after adding memory**:

- Do not auto-hide
- Auto-hide all messages up to the last Memory
- Auto-hide only messages in the last Memory

**Messages to leave unhidden**는 경계 근처의 최근 overlap을 남긴다.

> **Presence 확장 프로그램 사용 시:** Presence와 STMB는 모두 SillyTavern의 공유 message visibility state를 변경하므로, Presence가 STMB가 숨긴 message를 나중에 다시 표시할 수 있다. 구성 지침은 [STMB와 다른 확장 프로그램](#23-stmb와-다른-확장-프로그램)을 참조한다.

### 9.3 Generation 전 unhide

**Unhide hidden messages for memory generation**은 STMB가 범위를 compile하기 전에 선택 범위를 표시한다. 이전에 숨긴 range를 regenerate/reprocess할 때 사용한다. 성공 저장 후 어떤 것이 다시 숨겨지는지는 선택한 auto-hide mode가 결정한다.

### 9.4 Memory-boundary indicator

highest processed message를 사용해 processed history와 unprocessed chat 경계를 표시한다.

Modes:

- Off
- Memory boundary divider
- draggable jump button
- divider + jump button

jump button은 첫 unprocessed message로 scroll하며 드래그 위치를 기억한다.

### 9.5 학습에 좋은 초기 구성

- boundary divider와 jump button 표시
- 2 messages unhidden
- generation용 temporary unhide 활성화
- Memory 저장 확인 전까지 auto-hide 없음
- 그 후 주요 token-saving benefit을 위해 all processed messages 숨기기

---

## 10. Lorebook 활성화와 검색

### 10.1 Keywords

Normal Memories는 흔히 keyword-triggered다. 좋은 keyword는 구체적이고 식별 가능하다.

- character names/aliases
- named locations/organizations
- important objects
- event names
- identifiers
- specific discoveries/actions

`important event`, `conversation`, `secret` 같은 약한 keyword는 너무 넓다.

Memory content는 모델이 무엇을 배우는지 결정한다. keyword는 SillyTavern이 언제 검색할지 돕는다.

### 10.2 Activation modes

- **Normal:** keyword/rule 기반.
- **Constant:** 해당 budget/entry control 안에서 항상 active.
- **Vectorized:** setup이 지원하면 vector retrieval 사용.

Vectors는 선택 사항이다. STMB는 Vectors extension 없이 keyword로 작동한다.

### 10.3 권장 global World Info settings

일반 시작 권장:

- Match Whole Words: off
- Scan Depth: 비교적 높게, 예: 8
- Max Recursion Steps: 약 2
- Context percentage: 전체 context와 경쟁 prompt material에 맞게

필수값은 아니다.

### 10.4 Delay Until Recursion

Memory Book이 유일한 active lorebook/World Info source라면 **Delay Until Recursion**을 끈다. 그렇지 않으면 첫 recursion cycle을 시작할 entry가 없어 Memory가 activation되지 않을 수 있다.

### 10.5 Retrieval 진단

AI가 “기억하지 못한다”고 할 때:

1. entry 존재 확인.
2. 올바른 Memory Book이 chat에 active인지 확인.
3. entry enabled 확인.
4. keywords/activation mode가 현재 conversation에 맞는지 확인.
5. lorebook budget 충분한지 확인.
6. recursion settings 확인.
7. World Info inspection tool/request log로 entry가 실제 전송되었는지 확인.
8. 전송되었지만 무시했다면 문제는 STMB storage가 아니라 model behavior 또는 competing context다.

---

## 11. 실제 Group Chat Mode

### 11.1 정의

Group Chat Mode는 둘 이상의 독립 character card로 구성된 실제 SillyTavern group에 적용된다.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern은 각 message를 어느 card가 작성했는지 기록하므로 STMB가 speaker attribution과 참여 group member를 감지할 수 있다.

별도 Group Chat Mode switch는 필요 없다. group chat을 열고 STMB를 평소처럼 사용한다.

### 11.2 Participant detection

감지된 participant는 보통 선택 scene 안에서 최소 한 message를 작성한 character card다.

STMB는 prose에서 실제로 방에 있던 모든 인물을 추론하지 않는다. 따라서:

- 말하지 않은 observer는 감지되지 않을 수 있음
- 언급만 된 character는 participant 아님
- group이 이야기한 absent character는 선택되지 않음
- user는 별도 group-character Memory Book target으로 취급하지 않음
- duplicate/unusual speaker identity는 수정이 필요할 수 있음

자동 감지가 group character를 하나도 찾지 못하면 automatic acceptance가 켜져 있어도 participant confirmation이 열린다. 누가 present였는지 사용자가 검토해야 한다.

participant prompt의 의미는 **이 Memory를 어떤 group characters와 연관시킬 것인가?** 이다. 누가 모든 사실을 알았는지 또는 물리적으로 있었는지를 증명하지 않는다.

### 11.3 Group Memory Book 하나

권장 시작 layout이다.

Automatic Mode, Auto-Create 또는 main Manual Mode book을 사용한다. scene마다 group Memory Book에 canonical entry 하나를 만든다. participant names가 있으면 inclusive SillyTavern character filter를 줄 수 있다.

Alice와 Bob의 inclusive filter는 Alice **또는** Bob이 active일 때 entry가 activation될 수 있다는 뜻이다. 합성 “Alice and Bob” character나 subset book을 만들지 않는다.

하나의 group book이 좋은 경우:

- cast가 대부분 하나의 story 공유
- omniscient/group-oriented summary 하나면 충분
- 최소 setup/중복 적은 entries 선호
- STLO 필요 없음

하나의 group Memory도 비대칭 지식을 보존할 수 있다.

> Alice는 송신기를 찾아 숨겼다. Bob은 방이 비어 있다고 믿었다.

### 11.4 Group book 하나 + per-character books

고급 real-group layout:

- canonical group Memory Book 하나
- group member마다 assigned character Memory Book 하나

요구:

- Manual Lorebook Mode
- SillyTavern-LorebookOrdering (STLO) 설치/활성화
- 모든 필요한 group member의 valid assignment

canonical group book은 character book으로 재사용할 수 없다. 여러 character가 같은 character book을 공유할 수 있으며, STMB는 그 shared book에 duplicate 대신 한 copy를 쓴다.

Memory 저장 시:

1. canonical version을 group book에 씀
2. automatic acceptance가 아니면 participant 확인
3. 선택 participant books에 linked copies 작성
4. 필요한 save 하나가 실패하면 가능한 한 partial write rollback

real-group participant confirmation에서 아무도 선택하지 않으면 현재 group member 모두에게 적용한다.

### 11.5 별도 group/character prompts

기본은 같은 group-oriented Memory를 participant books에 복사한다.

profile에서 **Use separate group and character prompts in group chats**를 활성화하면:

- Group Summary Prompt → canonical group version
- Character Summary Prompt → single-character target book별 individualized version

character-focused version은 다음을 보존할 수 있다.

- private knowledge
- mistaken beliefs
- personal emotional reactions
- relationship-specific priorities
- 그 participant에게 중요했던 내용

추가 AI requests가 필요하다. shared character book은 assigned character마다 duplicate하지 않고 shared copy 하나를 받는다.

### 11.6 STLO 역할

Memory Books가 결정:

- scene range
- participants
- summary content
- copy를 받을 books
- individualized prompts 사용 여부

STLO가 결정:

- lorebook 활성화 시점
- 어느 character가 활성화할 수 있는지
- priority, position, budget, ordering

STMB가 character book을 assign하면 기존 STLO priorities/budgets/overrides를 보존하면서 character avatar basename을 `stlo.characterOverrides`에 추가하고 `stlo.onlyWhenSpeaking`을 켠다.

STMB는 merge-only다. assignment를 clear/change해도 이전 STLO override를 자동 제거하지 않는다. 오래된 override는 STLO에서 수동 제거한다.

### 11.7 Filter/book은 privacy control이 아님

별도 book/filter는 relevance를 개선한다. 다음을 보장하지 않는다.

- 다른 character 정보가 절대 넘어오지 않음
- model이 canonical group version을 절대 보지 않음
- previous-memory context가 완전히 knowledge-partitioned임
- character book이 conscious knowledge만 표현함

보안 경계가 아닌 context-routing tool로 사용한다.

### 11.8 Linked copies는 live sync가 아님

linked entries는 같은 원래 사건임을 알려 주는 metadata를 공유하지만 이후 수정은 독립적이다.

한 copy를 edit/delete/compact해도 다른 copy는 자동 변경되지 않는다. character copy regeneration도 그 copy만 변경한다. 그러나 canonical group entry를 regenerate할 때 STMB는 해당 entry만 또는 모든 linked character entries와 함께 regenerate할지 묻는다. 선택 entry마다 자체 generation/approval review가 있어 character-focused prompt가 유지된다.

### 11.9 Group member 추가/제거/reassign

character 추가:

- 다음 distributed Memory 전에 valid book assign
- 과거 Memories는 retroactive copy되지 않음
- 과거 filters는 rewrite되지 않음
- 필요하면 historical context 수동 제공

character 제거:

- 기존 entries 유지
- 이전 filters/STLO overrides 유지
- linked copies 자동 삭제되지 않음

character book 변경:

- future routing 변경
- old book의 STLO override에서 그 character를 제거하지 않을 수 있음

### 11.10 Group consolidation

canonical group book은 automatic group-chat consolidation analysis prompt를 사용해 objective events와 individual knowledge를 구분하며 omniscient chronology를 만든다.

character books는 popup에서 선택한 consolidation preset을 사용한다. book마다 eligible source 수가 다를 수 있다. material 부족 book은 warning과 함께 skip되고 준비된 books는 계속된다.

character book의 missing scene은 chronology gap일 뿐 absence/ignorance/unconsciousness를 증명하지 않는다. shared character book은 consolidated entry 하나를 받는다.

---

## 12. Narrator Mode

### 12.1 정의

Narrator Mode는 하나의 Narrator character card가 여러 fictional characters를 쓰는 일반 1:1 SillyTavern chat용이다.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Narrator Mode가 없으면 SillyTavern은 모든 AI response를 Narrator card가 작성한 것으로 본다. Narrator Mode는 Narrator prose 내부 fictional characters를 scene/Memory Book과 연결하기 위한 수동 cast model을 제공한다.

실제 SillyTavern group chat에서는 사용할 수 없다.

### 12.2 필요한 storage layout

Narrator Mode 요구:

- Manual Lorebook Mode
- 선택된 **omniscient/canonical Memory Book** 하나
- declared cast member마다 고유 Memory Book 하나

규칙:

- cast member는 omniscient book 사용 불가
- 두 cast member가 같은 book 공유 불가
- 모든 declared member에게 available book 필요
- retired member는 복구되거나 구현에서 제거될 때까지 identity와 reserved book assignment 유지
- Auto-Create는 Manual Lorebook Mode와 상호 배타적이므로 호환되지 않음

advanced real-group layout과 달리 Narrator Mode는 active-character retrieval에 STLO가 필요하지 않다. generation 중 STMB가 selected cast members의 books를 active lorebook context에 주입한다.

### 12.3 설정

1. Narrator card의 일반 chat을 연다.
2. Manual Lorebook Mode를 켠다.
3. main manual book을 선택한다. 이것이 omniscient Memory Book이다.
4. **Narrator Mode**를 켠다.
5. **Manage Narrator Cast**를 연다.
6. fictional character를 이름으로 추가하고 각각 unique Memory Book assign.
7. floating **Active Cast** drawer에서 다음 exchange에 present할 characters 선택.

Manual Lorebook Mode를 끄기 전에 Narrator Mode를 꺼야 한다.

### 12.4 Active Cast drawer와 timeline metadata

floating Active Cast drawer는 expand/collapse/move 가능하며 current cast members 선택에 사용한다.

generation 때 STMB가 active cast snapshot을 저장한다.

- user message: active-cast snapshot
- Narrator response: generation snapshot
- continuation: 기존 cast metadata와 merge
- swipe metadata: swipe별 별도 저장
- swipe 선택: 그 timeline point의 active cast 복원 가능
- 최근 messages 삭제: 남은 최신 tagged Narrator message에서 cast state 복원 가능

cast marker는 association을 기록할 뿐 prose semantic analysis가 아니다.

### 12.5 정상 Narrator generation 중 retrieval

Narrator generation이 시작되면 STMB는 active cast의 Memory Books를 load해 해당 request의 character-lore collection에 merge하며 duplicate world/UID pairs를 피한다.

결과:

- 이 workflow로는 active-cast books만 추가
- omniscient book은 일반 Manual Mode activation/configuration을 따름
- Narrator Mode에서는 per-character STLO filters 불필요
- 정확한 character books가 context에 들어가려면 generation 전 cast selection이 올바라야 함

### 12.6 Scene participant detection

selected scene에서는 tagged Narrator responses가 authoritative하다. STMB는 Narrator-authored messages에 stamped cast IDs를 합친다.

scene에 untagged legacy Narrator messages가 있으면 모든 messages의 continuity information을 fallback으로 사용하고 사용자가 scene cast를 확인하게 한다. current active cast가 preselected된다. empty selection은 individual cast member가 없었다는 뜻이다.

fully tagged scenes는 이 confirmation이 필요 없다.

### 12.7 Memory distribution

Narrator scene Memory는:

- main Memory Book에 canonical omniscient entry 하나
- selected participant별 unique Memory Book에 linked copy 하나

Narrator copies는 native SillyTavern character filters를 사용하지 않는다. 대신 STMB가 Narrator participant/owner IDs를 entry metadata에 저장한다.

separate multi-character prompts가 꺼져 있으면 participant books는 omniscient summary copy를 받는다. 켜져 있으면 single-character book별 character-focused generation 가능.

### 12.8 Narrator consolidation 및 regeneration

Narrator ownership/participant metadata는 consolidation sources를 통해 전달된다. 그래서 higher-tier entry는 어떤 character book이 copy를 소유하고 underlying material에 어떤 cast members가 참여했는지 유지할 수 있다.

Regeneration은 이 metadata로 replacement prompt target이 omniscient/group-oriented인지 character-focused인지 결정한다.

real-group copy와 마찬가지로 linked Narrator entries는 생성 후 live sync되지 않는다.

### 12.9 Cast member retire

cast manager에서 member를 retired로 표시하고 나중에 restore할 수 있다. retired member는:

- active-cast choices에서 제거
- active-cast ID set에서 제거
- stable identity/history metadata 유지
- book reservation 유지하여 다른 identity와 우발적 merge 방지

활성 cast를 떠났지만 historical Memory identity를 유지해야 할 때 retirement를 사용한다.

---

## 13. 채팅 Branch

SillyTavern의 native branch는 서로 다른 continuity가 될 수 있다. branch와 parent가 같은 unlocked Memory Books에 쓰면 모순된 timeline이 섞일 수 있다.

**Copy Memory Books when branching**은 기본적으로 켜져 있다.

### 13.1 복사되는 항목

STMB가 새 native branch를 감지하면:

- Automatic Mode: active chat-bound Memory Book 복사
- Manual Mode: main manual Memory Book 복사
- Manual Mode real group: unique unlocked character Memory Book 각각 복사
- Narrator Mode: omniscient book + declared character book 각각 복사
- persistent real-character locks: lock은 “이 같은 book을 계속 사용”한다는 뜻이므로 복사하지 않고 유지

한 branch operation에서 복사되는 모든 book은 같은 available lineage number를 사용한다.

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

기존 branch에서 다시 branch해도 `Branch 1 Branch 1` 같은 이름 대신 원래 lineage root를 유지한다.

### 13.2 Rewritten metadata

복사본 안에서 STMB는:

- 일치하는 parent chat IDs를 새 branch chat ID로 변경
- linked book 둘 다 복사되었으면 canonical group/character links를 복사본으로 redirect
- 새 branch bindings를 copies로 update

기존 content를 clone할 뿐 Memory를 regenerate하지 않는다.

### 13.3 Failure safety

branch copying 중 chat을 전환하지 않는다.

copy가 실패하면 STMB는 새 branch의 inherited writable bindings를 clear하고 failure를 기록한다. 그러면 branch가 parent originals에 조용히 쓰는 것을 막는다.

### 13.4 Branch copy 끄기

branch가 의도적으로 parent와 같은 Memory Books와 계속되는 history를 공유해야 할 때만 setting을 끈다.

---

## 14. Clips

Clip은 선택한 chat text를 AI call 없이 `[STMB Clip]` lorebook entry에 직접 저장한다.

### 14.1 Clip을 사용하는 경우

- preference
- promise 또는 secret
- name 또는 alias
- item 또는 pet
- 짧은 relationship fact
- 정확히 또는 거의 그대로 보존해야 하는 문장
- scene Memory까지 만들 필요 없는 빠른 note-to-self

### 14.2 Workflow

1. chat message 안의 text를 highlight한다.
2. floating scissors button을 누른다.
3. 기존 Clip entry를 선택하거나 새로 만든다.
4. 새 entry는 always-active 또는 keyword-triggered behavior를 선택한다.
5. 현재 entry와 updated preview를 검토한다.
6. 필요하면 rename한다.
7. Save.

floating scissors button은 chat text 선택 후에만 나타나며 main panel에서 끌 수 있다.

### 14.3 Entry format

Title:

```text
Seraphina Healed Me [STMB Clip]
```

Content:

```markdown
=== Seraphina Healed Me ===

- Seraphina가 마법으로 사용자의 상처를 치료했다.

=== END Seraphina Healed Me ===
```

Clip entry 하나에는 section 하나가 있다. focused title은 focused activation keywords를 지원한다.

### 14.4 기존 entries

기존 entry title 끝에 `[STMB Clip]`을 추가하면 Clip entry로 취급할 수 있다. 긴 Clip entries는 수동 edit 또는 compact할 수 있다.

Clips는 선택한 text만 저장한다. source attribution은 자동 추가되지 않는다.

---

## 15. Topical Clips

Topical Clip은 확인된 STMB Memory entries, 현재 chat의 명시적 message range 또는 둘 다 읽고 AI에게 한 topic에 집중된 “about this topic” entry를 만들게 한다. eligible Memory sources에는 scene Memories와 consolidated summaries가 포함될 수 있다. Clip/Side Prompt entries는 source에서 제외된다.

### 15.1 Topical Clip을 사용하는 경우

한 subject의 정보가 여러 Memories에 흩어져 있을 때, 예:

- recurring NPC
- relationship history
- location/faction
- investigation/mystery
- powers, injuries, promises, preferences, secrets
- important object
- unresolved plot thread

Topical Clip은 모든 source Memory의 chronology가 아니라 subject별로 정리한다.

### 15.2 Source restrictions

Topical Clip은:

- selected source book의 confirmed STMB Memory entries(eligible consolidated summaries 포함)
- 현재 chat에서 명시적으로 선택한 inclusive `X-Y` range의 visible messages

를 사용한다.

**Include saved Memories**와 **Include chat messages**는 따로 또는 함께 사용할 수 있다. message ranges는 global unhide-before-memory setting을 따르고 compile 후 previously hidden messages를 복원한다.

사용하지 않는 것:

- selected range 밖 chat messages
- ordinary Clip entries
- Side Prompt entries
- unrelated ordinary lorebook entries

### 15.3 Topical Clip 생성

1. Memory Books를 연다.
2. **Topical Clip** 클릭.
3. source Memory Book 선택.
4. topic 입력.
5. activation keywords 입력 또는 비워 topic 사용.
6. 새 entry 또는 기존 `[STMB Clip]` update target 선택.
7. saved Memories, chat messages 또는 둘 다 sources로 선택.
8. 선택적으로 특정 source Memories만 선택 및/또는 exact message range 입력.
9. generation profile 선택.
10. draft 생성.
11. review/edit.
12. 올바를 때만 save.

생성된 draft는 절대 자동 저장되지 않는다.

### 15.4 Existing Topical Clip update

성공한 run 후 STMB는 사용된 source Memories와, 해당하는 경우 source chat/message range/message IDs/hashes를 기록한다. 이후 Memory-based update는 보통 new/changed source Memories + existing Clip content만 보낸다. message ranges는 항상 명시적으로 선택한다.

**Rebuild from all source memories**를 사용하는 경우:

- current entry가 불완전/무질서
- prompt 변경
- older Memories 대폭 편집
- 전체 topic 재검토 필요

### 15.5 Manual source selection 및 token warning

book이 크거나, topic이 한 story period에 제한되거나, names가 겹치거나, strict evidence control이 필요하면 **Use only selected memories**를 사용한다.

STMB는 request size를 추정하고 configured token threshold 초과 시 경고한다. source를 줄이거나 threshold를 의도적으로 올리거나 이번 한 번 실행한다.

### 15.6 Review standard

draft가 다음을 만족하는지 확인한다.

- topic에 집중
- names/relationships 보존
- major relevant facts 포함
- contradictions를 숨기지 않고 표시
- source Memories가 뒷받침하지 않는 explanation을 invent하지 않음
- update를 불필요한 duplication 없이 merge

### 15.7 Prompt placeholders

custom Topical Clip prompt는 saved Memories 선택 시 `{{SOURCE_MEMORIES}}`, chat messages 선택 시 `{{SOURCE_MESSAGES}}`를 포함해야 한다.

Source placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

지원 placeholders:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

custom prompt가 유용한 output을 만들지 않으면 Reset to Default를 사용한다.

---

## 16. Side Prompts

Side Prompt는 normal character reply와 별도로 실행되는 named STMB prompt다. 보통 또 하나의 sequential scene Memory 대신 계속 유지되는 support entry 하나를 만들거나 update한다.

**Trackers & Side Prompts** 목록의 power icon은 prompt-wide **Enabled** flag를 즉시 변경한다. green은 enabled, dim은 disabled다. 이 control은 설정된 triggers를 추가/제거/변경하지 않는다.

### 16.1 적합한 용도

- plot/unresolved-thread tracker
- relationship state
- NPC/faction status
- inventory/resources
- injuries/statistics/reputation
- timelines/dates/deadlines/travel
- mystery clues/suspects/contradictions
- inventions/research/projects
- continuity-risk reports
- world-state summaries

모호한 “track everything” prompt, duplicate scene summary 또는 다음 roleplay response 안에 반드시 있어야 하는 task는 피한다.

### 16.2 Output format

Side Prompt는 보통 save할 준비가 된 final plain text 또는 Markdown을 기대한다. Memory JSON은 필요 없다. tracker text 자체로 JSON을 의도할 때만 JSON을 사용한다.

### 16.3 Run sequence

일반 run은 다음을 조립한다.

1. Side Prompt instructions
2. prior saved tracker entry(있으면)
3. optional previous Memories
4. optional Additional Context
5. selected/since-last scene text
6. optional Response Format instructions

prior entry는 revise할 existing state이지, 모든 옛 statement가 계속 true라는 증거가 아니다. prompt는 stale/resolved/contradicted/duplicate information을 제거하라고 명시해야 한다.

### 16.4 Manual runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

공백이 있는 이름은 quote한다. supplied range는 inclusive다.

manual run은 targeted analysis와 runtime macro values가 필요한 prompt에 좋다.

### 16.5 Automatic after-Memory runs

Side Prompt는 **Run automatically after memory**를 활성화할 수 있다.

chat은 두 자동 선택 mode 중 하나를 사용한다.

- individually enabled Side Prompts
- selected Side Prompt Set 하나

selected set은 individually enabled automatic prompts를 **대체**하며 추가하지 않는다.

#### Memory Assistance Side Prompt

**Memory Assistance**는 네 개의 독립 mode를 가진 reserved Side Prompt다. ordinary Side Prompt enablement나 selected Side Prompt Set과 무관하게 successfully saved Memories 뒤에 실행된다. Memory regeneration 중에는 실행되지 않는다.

Memory Assistance는 processed raw scene과 해당 Memory가 저장된 각 Memory Book의 ordinary/Topical Clips를 비교한다. reviewed Clip마다 title/topic, keywords, current content, stable ID, type을 AI에 보낸다.

job queue 사용 시 target Memory Book마다 Memory save 후 별도 **Memory Assistance** job이 생긴다. request, response-validation, report-save, automatic-application error는 그 job을 **Failed**로 표시하고 queue에 오류를 노출한다. saved Memory는 **Completed**로 남으며 Memory Assistance retry는 Memory를 regenerate하지 않는다.

- **Off** — Memory Assistance 비활성화.
- **Update** — Clips 5개 이하 직접 review, 5개 초과 시 selection list. proposed changes는 manual approval 대기.
- **Update and Suggest** — 먼저 topic-discovery request 후 Update와 같은 existing-Clip review workflow.
- **Automatic** — 어떤 Clip을 review할지 묻지 않고 token-based batches로 모든 Clip review. valid ordinary Clip additions는 직접 적용, Topical Clip replacements는 **Memory Assistance Suggestions**에서 approval pending.

추가 규칙:

- Update/Update and Suggest의 큰 selection list는 **Query Selected**, **Query All** 제공.
- Query All/Automatic은 모든 Clip을 하나의 과대 request에 넣지 않고 token-based batches 사용.
- ordinary Clip마다 addition으로 proposed exact message excerpt 최대 하나.
- Topical Clips는 complete replacement draft.
- AI response는 affected Clip UID를 suggested excerpt/replacement에 직접 map하는 simple JSON object. empty object = update 없음.
- Update 결과는 `Memory Assistance (STMB SidePrompt)`에 쓰이며 **Memory Assistance Suggestions**에서 승인 전 unapplied.
- Automatic 결과는 applied ordinary Clip additions 수를 기록하고 Topical replacements/application failures는 manual review로 유지.
- selection cancel은 이전 suggestions를 clear하여 latest scene 결과로 혼동하지 않게 함.

Update and Suggest는 existing-Clip review batches 전에 별도 suggestion-only prompt를 사용한다. request에는 processed scene과 existing Topical Clip titles/topics/keywords의 lightweight list가 들어간다. discovery 중 ordinary Clips/existing Clip bodies는 보내지 않는다. AI는 topic과 activation keywords가 있는 JSON objects로 0–5 topics를 반환한다. `{"topics":[]}`도 유효하다.

suggested topics는 Memory Assistance report에 저장된다. **Memory Assistance Suggestions**에서 **Review Topics**를 선택하면 checked/editable rows로 볼 수 있다. unwanted topics uncheck, topic name/keywords edit, additional topics 추가 가능. confirmed topics는 standard Topical Clip draft workflow를 하나씩 연다. pending topic은 해당 Topical Clip save 후에만 제거된다. draft를 닫으면 suggestions에 남는다.

reviewable suggestions가 준비되면 updated Memory Book용 completion popup이 열린다. **Dismiss**는 notice 닫기, **Go to Suggestions**는 해당 Memory Book이 선택된 **Memory Assistance Suggestions** 열기. extension menu에서 직접 열면 current chat의 effective Memory Book(chat-bound in Automatic Mode 또는 resolved manual book in Manual Mode)을 먼저 선택한다.

Update/Topic Suggestions prompts와 connection-profile override는 따로 edit 가능하지만 두 structured response contracts는 fixed다. Memory Assistance는 delete/duplicate/Side Prompt Set 배치/manual run할 수 없다.

### 16.6 Automatic visible-message intervals

Side Prompt는 **Run on visible message interval**을 켜고 checkpoint 이후 visible message 수를 지정할 수 있다.

hidden/system messages는 count하지 않는다.

set이 active면 해당 set rows 중 referenced prompt가 적절한 interval trigger를 가진 것만 candidate다.

### 16.7 Side Prompt Sets

Side Prompt Set은 folder가 아니라 ordered run list다. 같은 template이 다른 macro values로 여러 번 나타날 수 있다.

예:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

row에는:

- prompt reference
- optional label
- runtime macro values
- order
- duplicate/delete actions

가 저장될 수 있다. top-to-bottom으로 실행된다.

Manual set commands:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Default sets 및 per-chat selection

General Settings에서:

- solo chats default set
- group chats default set

을 지정할 수 있다.

각 chat은:

1. applicable default inherit
2. individually enabled prompts 명시적 사용
3. named set 선택

중 하나다. empty global default = individual mode.

selected set이 delete되면 STMB는 다른 workflow를 조용히 대체하지 않고 warning한다. missing row prompt 또는 unresolved macro는 warning과 함께 해당 row를 skip한다.

set은 candidate rows를 고른다. referenced Side Prompt 각각은 after-Memory 또는 interval execution에 맞는 automatic trigger가 여전히 필요하다. manual set commands에는 trigger checkbox가 필요 없다.

### 16.9 Macros

Side Prompts는 일반 SillyTavern macros를 사용할 수 있다.

```text
{{user}}
{{char}}
```

비표준 `{{...}}` placeholder는 runtime macro다. 수동으로 제공하거나 set row에 저장해야 한다.

예:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

unresolved runtime macros가 있는 prompt는 자동 실행할 수 없다. automatic run은 값을 물어보기 위해 멈출 수 없다.

### 16.10 Memory-count macros

STMB는 effective main Memory Book용 integer macros를 등록한다.

| Macro | Count |
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

effective main book은 Automatic Mode의 chat-bound book 또는 Manual Mode의 resolved main manual book이다. multi-book group/Narrator setup에서는 모든 character books의 count를 합치지 않는다.

count macro는 숫자만 제공하며 entry content는 제공하지 않는다.

### 16.11 Message ranges

explicit range는 정확히 그 inclusive range를 사용한다. range가 없으면 Side Prompt의 since-last checkpoint/cap behavior를 사용한다.

debugging, targeted cleanup, known section rerun에는 explicit range를 사용한다.

### 16.12 Additional Context 및 previous Memories

Side Prompt는 previous scene Memories 최대 7개를 포함할 수 있다.

Additional Context source:

- none
- **Follow chat** — chat의 selected Context Setting
- fixed named Context Setting 하나

reference material이므로 tracker에 무조건 복사하지 않는다.

### 16.13 Lorebook targets

Side Prompt는 보통 effective Memory Book에 저장한다. 대신:

1. per-chat target override
2. template-level target
3. fallback effective Memory Book

을 사용할 수 있다. valid per-chat override가 우선한다.

shared campaign book 또는 dedicated tracker book처럼 의도적일 때 alternate target을 쓴다. retrieval plan 없이 tracker를 흩뜨리지 않는다.

### 16.14 Side Prompt entry controls

template이 설정할 수 있는 것:

- title override
- keywords
- Normal/Constant/Vectorized activation
- insertion position 및 Outlet name
- order mode/value
- Prevent Recursion
- Delay Until Recursion
- Ignore Budget

Title/keyword fields는 applicable macros를 expand할 수 있다. **Ignore Budget**은 여러 always-included tracker가 context를 크게 소비할 수 있으므로 신중하게 사용한다.

### 16.15 Connection profile override

Side Prompt는 normal Memory Books connection resolution을 inherit하거나 특정 STMB profile을 bind할 수 있다. cheaper model 또는 structured maintenance에 더 적합한 model에 유용하다. profile 조합이 많을수록 troubleshooting이 어려워진다.

### 16.16 Side Prompt regeneration

compatible save는 다음 compact snapshot을 저장한다.

- Side Prompt template key
- prior entry content
- source chat 및 inclusive range
- runtime macro values

regenerate하려면 lorebook editor에서 **Regenerate side prompt**를 클릭한다. replacement는 saved snapshot + current template/current profile/context settings를 사용한다.

template 삭제, source chat/range unavailable, generation 중 target/source 변경이면 완료할 수 없다. content만 replace하며 기존 title/keywords/entry settings는 유지한다.

### 16.17 좋은 Side Prompt 작성

좋은 Side Prompt는:

- 정확한 maintenance job
- 어떤 source를 review할지
- revise/replace/merge/append 중 무엇인지
- 제거할 stale information
- stable output headings/order
- strict length limit
- final-output-only behavior

를 정의한다.

예:

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

유용한 guards:

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

stable headings는 반복 update에서 drift를 줄인다.

### 16.18 Side Prompt troubleshooting

prompt가 실행되지 않았다면:

- Memory 또는 interval event 실제 발생 확인
- chat의 individual/set selection 확인
- referenced prompt 존재 확인
- relevant automatic trigger enabled 확인
- 모든 runtime macro 값 확인
- `/stmb-stop` 또는 failed job이 취소했는지 확인

두 번 실행됐다면 manual + automatic, duplicate set rows, duplicate prompt copies, 여러 tab/chat trigger 확인.

wrong book이라면 per-chat와 template-level target scopes 둘 다 확인.

output이 계속 커지면 explicit replacement/pruning/item-count/word-count rules 추가.

---

## 17. Consolidation

Consolidation은 lower-tier STMB Memories/summaries를 higher-tier chronological recap으로 합친다.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

raw chat이 아니라 기존 STMB entries를 source로 사용한다.

### 17.2 목적

사용하기 좋은 경우:

- scene Memories가 누적
- 오래된 material에 full scene detail 불필요
- 큰 relationship/plot/campaign phase 종료
- continuity를 보존하며 token use 감소
- 더 정돈된 higher-level chronology 필요

consolidated entry는 lasting changes, turning points, goals, consequences, relationship shifts, unresolved threads, stable state를 강조해야 한다.

### 17.3 Manual workflow

1. **Consolidate Memories** 열기.
2. target tier 선택.
3. eligible source entries 선택.
4. consolidation prompt/profile settings 선택.
5. successful consolidation 후 source entries disable 여부 결정.
6. 실행하고 candidates 검토.
7. 원하는 summaries 승인.

### 17.4 Readiness prompt는 automatic consolidation이 아님

**Prompt for consolidation when a tier is ready**는 selected target tiers를 감시한다. saved minimum eligible count에 도달하면 yes/later prompt를 보여 준다. Yes는 consolidation interface를 여는 것이며 silent consolidation을 실행하지 않는다.

### 17.5 Consolidation output schema

ordinary consolidation은 strict JSON을 기대한다.

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

model은 하나 또는 여러 summary를 반환할 수 있다. `member_ids`로 각 source를 summary에 assign한다. 맞지 않는 outlier는 unrelated recap에 강제로 넣지 말고 `unassigned_items`에 둔다.

### 17.6 Previous higher-tier summary

target tier의 previous summary를 canon context로 제공할 수 있다. rewrite할 source material이 아니다. consolidation prompt는 lower-tier sources와 명확히 구분해야 한다.

### 17.7 Previews 및 failed responses

Consolidation preview는 edit, accept, same sources에서 one candidate regenerate, pending batch regenerate를 지원할 수 있다.

malformed/failed AI response는 inspection 가능하며 지원되는 경우 commit 전 manual correction 가능.

### 17.8 Source disabling

활성화하면 successful consolidation 후 source entries를 disable하여 higher-tier summary가 retrieval을 맡게 한다. lorebook editor에서 되돌릴 수 있다.

### 17.9 좋은 consolidation prompt

다음을 정의한다.

- compression target
- one recap인지 smallest coherent number인지
- chronology/grouping logic
- 반드시 남길 details
- outlier 처리
- exact JSON structure

major beats, consequences, promises, relationship changes, identifiers, unresolved threads, retrieval-friendly keywords를 보존하면서 반복 scene-level detail을 제거한다.

---

## 18. Compaction

Compaction은 AI에게 기존 STMB-managed entry 하나를 줄이게 하고 교체 전에 original과 draft를 보여 준다.

### 18.1 Eligible entries

- `[STMB Clip]` entries
- Side Prompt entries
- STMB Memory entries

ordinary non-STMB lorebook entries는 목록에 없다.

### 18.2 Workflow

1. **Compaction** 열기.
2. Memory Book 선택.
3. Compaction Profile 선택.
4. 필요하면 Compaction Prompt edit.
5. entry 하나 선택.
6. original/compacted token estimates/content 비교.
7. 필요하면 draft edit.
8. replace/copy draft/cancel.

**Replace with Compacted Version**을 선택할 때까지 original은 바뀌지 않는다.

### 18.3 좋은 용도

- 긴 Clip collections
- 반복/stale tracker content
- wordy scene Memories
- context를 많이 쓰는 always-active entries

새 facts 추가, raw chat 요약, 새 Memory 생성, ordinary lorebook entry 처리용이 아니다.

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

prompt는 redundancy/low-value wording을 제거하되 facts, names, pronouns, macros, wrapper headings, end markers를 보존해야 한다.

---

## 19. Regeneration

Regeneration은 기존 entry의 reviewable replacement를 만든다. 두 번째 numbered entry를 만들지 않으며 approval 없이 overwrite하지 않는다.

### 19.1 Scene Memory regeneration

- source chat 열기
- lorebook editor에서 Memory Book 열기
- **Regenerate memory** 클릭
- linked character entries가 있는 canonical group entry라면 clicked entry만 또는 all linked entries 함께 regenerate 선택
- current profile, prompt, previous-memory count, Additional Context 선택
- selected entry 각각의 title/content/keywords review

original scene range와 sequence number는 유지된다. linked entries는 같은 regeneration settings를 사용하되 각자의 Memory Book context와 group/character prompt target에 맞춰 generate된다. STMB는 direct regenerations 저장 전에 모든 approvals를 모은다. 모든 source messages가 hidden이면 reveal하거나 unhide-before-generation을 켠다.

### 19.2 Consolidation regeneration

higher-tier summary는 exact linked lower-tier sources에서 dedicated **Regenerate Consolidation** preset으로 regenerate된다.

전체 source set이 올바른 tier에 남아 있어야 한다. active parent summary가 의존하는 lower-tier source는 regenerate할 수 없다. 의도적으로 lower tier를 rebuild하려면 parent를 먼저 delete한다.

### 19.3 Side Prompt regeneration

Section 16.16 snapshot 규칙 참조.

### 19.4 Safety checks

replacement 직전에 STMB 확인:

- target entry unchanged
- source chat range unchanged
- required consolidation sources unchanged/available
- entry still eligible

하나라도 실패하면 overwrite하지 않는다.

linked group/character/Narrator copies는 독립적이다.

---

## 20. 생성용 Context

STMB request에는 여러 context source가 들어갈 수 있으며 서로 대체할 수 없다.

### 20.1 Current scene

지금 처리되는 message range. ordinary scene Memory의 target material이다.

### 20.2 Previous Memories

effective Memory Book의 이전 scene Memories. read-only continuity context로 보통 0–7개 포함한다.

current scene보다 앞에 나타난다는 이유로 다시 summarize하면 안 된다.

### 20.3 Additional Context

stable reference material로 제공하는 selected lorebook entries. 예:

- character/setting rules
- canonical names/terminology
- campaign constraints
- authoritative timeline
- location references
- scene에서 반복되지 않았지만 assumed facts

Additional Context는 previous Memories와 scene transcript 앞에 온다. 또 다른 scene이 아니라 reference다.

### 20.4 Context Settings

Context Setting은 reusable ordered Additional Context collection이다.

Workflow:

1. **Context Settings** 열기.
2. named setting 생성.
3. lorebook entries 선택.
4. 순서 지정.
5. current chat에 setting 선택 또는 No Context 명시.

selection은 per chat 저장되고 Current SillyTavern Settings와 saved profiles 모두에서 작동한다.

referenced book/entry가 사라지면 warning 후 stale reference를 skip하고 계속한다. Context Setting 전체가 delete되면 그 chat은 다른 selection까지 Additional Context 없이 계속된다.

Context Settings는 duplicate/import/export할 수 있으며 `stmb-context-settings.json` 형식이다.

### 20.5 Prior Side Prompt entry

revise할 현재 tracker text. 모든 old statement가 여전히 valid하다는 evidence가 아니다.

### 20.6 Consolidation sources

실제로 group/compress하는 lower-tier entries.

### 20.7 Previous higher-tier summary

consolidation에서 carry-forward하는 canon. rewrite source가 아니다.

### 20.8 Workflow별 올바른 순서

Ordinary Memory:

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

prompt는 target material과 reference-only material을 분명히 label해야 한다.

---

## 21. Prompt 구조, 내장 Summary Prompt 및 작성 규칙

STMB에는 세 가지 주요 structured generation system과 여러 focused auxiliary workflow가 있다.

### 21.1 Ordinary Memory generation

STMB는 JSON object 하나를 기대한다.

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

규칙:

- JSON object만 반환
- exact keys `title`, `content`, `keywords`
- `keywords`는 JSON array of strings
- title 짧고 읽기 쉽게
- concrete retrieval terms 사용
- 원하는 Markdown은 `content` string 안에
- quotation marks 올바르게 escape

STMB는 일부 fences, trailing commas, think tags, wrappers, minor malformed output을 repair할 수 있지만 prompt는 recovery에 의존하면 안 된다.

강한 Memory prompt는:

1. 원하는 memory style/compression level
2. 보존할 continuity-relevant information
3. 제외할 filler/OOC/unsupported material
4. exact JSON schema

를 명시한다. 약한 prompt는 style만 말하고 structure가 없거나, final object 대신 analysis를 요구하거나, previous context와 current scene을 섞거나, abstract keywords를 사용한다.

### 21.2 Built-in Summary Prompts와 선택

이 presets는 ordinary Memory generation 전용이다. Consolidation, Side Prompts, Topical Clips, Compaction을 제어하지 않는다. profile의 **Memory Creation Method**에서 선택한다. profile이 다른 preset을 지정하지 않으면 **Summary**가 일반 fallback/default다.

universal best prompt는 없다. detail, readability, retrieval quality, token cost 사이 trade-off가 있다.

- **대부분 사용자 시작값: Summary.** 균형 잡힌 general-purpose preset.
- **continuity-heavy long-running roleplay: Comprehensive.** filtering/causality/continuity/keyword guidance가 가장 강하지만 model에 더 많은 것을 요구하고 output이 클 수 있다.
- **context token 절약 최우선: Minimal.** 의도적으로 짧고 nuance 손실.
- **별도 real-group/Narrator character books: Group + Character.** profile의 separate group/character prompt setting으로 함께 사용. general style 경쟁자가 아니라 targeting prompts다.

| Built-in prompt | 가장 적합한 용도 | 주요 trade-off |
|---|---|---|
| **Summary** | 대부분 solo chats와 first setup. important events/interactions/developments/revelations/outcomes와 concrete keywords를 가진 상세 chronological narrative. | token-minimal 사용자에게는 detail이 많지만 가장 structured preset보다 단순함. |
| **Comprehensive** | causal chains, character dynamics, established facts, key exchanges, unresolved threads, disciplined keywords가 중요한 장기 continuity. | 가장 길고 demanding한 instruction. capable model과 충분한 response tokens 필요. |
| **Summarize** | Timeline, Story Beats, Key Interactions, Notable Details, Outcome으로 매우 scannable Markdown record를 원하는 경우. | bullet-heavy라 natural memory보다 reference note처럼 보이고 heading 사이 repetition 가능. |
| **Synopsis** | source scene이 없어도 significant beat/interaction/detail/outcome을 거의 모두 남기고 싶을 때. | intentionally long; tight lorebook/context budget에 부적합. |
| **Sum Up** | visible scene heading/timeline을 가진 chronological narrative beat record, Summarize/Synopsis보다 sectional overhead 적음. | events/dynamics/facts/continuity state의 명시적 분리가 덜함. |
| **Minimal** | high-volume chats, cheap archival coverage, 매우 작은 Memory context. 2–5 sentence Memory. | motive/emotion/causality/minor continuity details 손실 가능. |
| **Northgate** | actions, emotional shifts, development, significant dialogue를 강조한 readable third-person past-tense literary record. SillyTavern Discord의 Northgate 스타일. | readability 중심; maximum compression/reference category separation 아님. built-in text가 OOC 제외를 명시하지 않으므로 OOC 많으면 review. |
| **Aelemar** | source scene 없이도 standalone record가 되어야 하는 major plot/emotional scenes. SillyTavern Discord의 Aelemar 스타일. | 최소 300 words 요구, aggressive token saving에 부적합. OOC 제외도 명시하지 않음. |
| **Group** | real group의 shared/omniscient Memory Book 또는 multi-book workflow의 omniscient target. action/emotion/knowledge attribution을 올바르게 유지하며 group state/decision 보존. | individual character Memory에 쓰지 않음. shared group continuity에 집중. |
| **Character** | real-group/multi-character workflow의 한 character-focused Memory Book. 그 character가 무엇을 했고/알았고/느꼈고/배웠고/숨겼고/오해했고/영향받았는지 기록. | target character와 무관한 material과 unsupported private knowledge를 의도적으로 제외. |

새 설치에서는 generation/retrieval이 안정될 때까지 **Summary**를 사용한다. 이후 prompt만 바꿔 비슷한 scenes의 여러 Memories를 비교한다. omitted causality/continuity state/weak keywords 문제면 **Comprehensive**, Memory size 문제면 **Minimal**을 선호한다. prompt 변경은 weak model, truncated output, poor scene boundaries, incorrect retrieval settings를 보상하지 못한다.

exact built-in text는 current SillyTavern locale용으로 recreate할 수 있다. recreate하면 built-in의 local edits는 제거하지만 unrelated custom presets는 삭제하지 않아야 한다. 수정한 built-in은 먼저 duplicate/export한다.

### 21.3 Multi-character prompt targeting

separate group/character prompts가 켜져 있으면 STMB가 request target을:

- `group` — canonical real-group 또는 omniscient Narrator Memory
- `character` — individual character-book version

으로 표시한다. prompt는 scene/supplied context가 뒷받침하지 않는 knowledge를 invent하지 않고 target perspective를 명시적으로 사용해야 한다.

### 21.4 Side Prompt authoring

Side Prompts는 보통 plain text/Markdown을 반환한다. Memory prompt가 아니라 maintenance instruction처럼 작성한다.

강한 Side Prompt는:

- 한 narrow job 정의
- previous tracker 사용법 설명
- stale state 제거
- stable headings/length limit 부여
- final tracker만 반환

### 21.5 Consolidation authoring

ordinary consolidation은 Section 17.5 schema를 요구한다. 강한 prompt는:

- chronology 보존
- smallest coherent number summaries 생성
- `member_ids`로 모든 used source assign
- `unassigned_items`로 leftovers 식별
- major changes/unresolved continuity 보존
- concrete keywords 사용

Dedicated **Regenerate Consolidation** preset은 one replacement summary용이며 normal consolidation default로 선택할 수 없다.

### 21.6 Topical Clip authoring

prompt는 `{{SOURCE_MEMORIES}}`를 포함하고 requested topic에 집중하며 source evidence와 inference를 구분하고 new material을 existing Clip content에 merge하고 contradictions를 드러내야 한다.

### 21.7 Compaction authoring

prompt는 `{{ENTRY_CONTENT}}`를 포함해야 하며 unsupported facts 추가 없이 줄여야 한다. entry에 필요한 structural wrappers/macros를 보존한다.

### 21.8 Prompt-writing checklist

STMB prompt를 마무리하기 전:

1. 실제 analysis target은 무엇인가?
2. reference-only material은 무엇인가?
3. strict JSON 또는 final plain text 중 무엇을 기대하는가?
4. later retrieval을 위해 무엇이 살아남아야 하는가?
5. 무엇을 omit/merge/carry forward/leave unassigned해야 하는가?

style보다 return-format correctness가 우선이다.

---

## 22. Summary Prompt Manager와 Consolidation Prompt Manager

### Summary Prompt Manager

ordinary Memory prompt presets를 create/edit/duplicate/delete/import/export할 수 있다. Memory Books profile을 통해 preset을 assign한다.

모든 ordinary Memory preset은 required Memory JSON schema를 보존해야 한다.

built-in Summary Prompt 선택 가이드와 best-use case는 Section 21.2 참조.

### Consolidation Prompt Manager

lower-tier entries를 higher-tier summaries로 group하는 prompts를 관리하고 normal default consolidation prompt를 선택한다.

regeneration-only consolidation preset은 ordinary consolidation에 사용할 수 없다.

### Import 및 localization behavior

Built-in prompts는 current app locale로 recreate할 수 있다. recreate 전에 locally modified built-ins를 backup한다.

---

## 23. STMB와 다른 확장 프로그램

SillyTavern 확장 프로그램은 나란히 실행되며 동일한 SillyTavern data를 읽거나 변경할 수 있다. STMB는 다른 확장 프로그램을 override하거나 disable하지 않으며, 다른 확장 프로그램보다 우선권을 갖지 않는다. 확장 프로그램의 동작이 겹치면 최종 결과는 관련된 각 확장 프로그램의 설정과 동작 시점에 따라 달라진다.

### 23.1 공유 message visibility

Chat message의 hidden 여부는 SillyTavern의 공유 message state에 속한다. STMB만 소유하는 state가 아니다.

STMB의 **Token Saving** 설정은 Memory 저장 후 처리된 message를 숨길 수 있다. 다른 확장 프로그램이 나중에 그 message를 다시 표시할 수 있으며 STMB는 이를 막지 않는다. 마찬가지로 **Unhide hidden messages for memory generation**은 STMB가 selected range를 처리하거나 regenerate하는 동안 message를 다시 표시할 수 있다.

### 23.2 Presence

Presence 확장 프로그램과 STMB는 모두 chat message의 hidden/visible state를 변경할 수 있다. Presence가 STMB가 숨긴 message를 다시 표시해도 STMB의 Token Saving 설정이 지워지거나 무시된 것은 아니다. Presence의 이후 동작이 동일한 SillyTavern message state를 변경한 것이다.

Presence를 사용하면서 STMB가 숨긴 message를 계속 숨겨 두려면 Presence 자체의 hidden-message 잠금 기능을 사용한다. Presence는 현재 이 용도로 `/presenceLockHiddenMessages` command를 제공한다. 해당 message range에 실행하고 range가 늘어나면 다시 실행한다. 현재 command 동작은 Presence 문서를 참조한다.

STMB는 Presence를 자동으로 구성하거나 호출하지 않으며, STMB의 group chat participant 관리는 Token Saving과 관련이 없다.

### 23.3 Regex 연동

STMB는 SillyTavern Regex extension과 두 단계에서 연동한다.

1. **Outgoing/User Input:** assembled prompt를 보내기 전 transform.
2. **Incoming/AI Output:** raw response를 parsing/saving 전 clean/standardize.

**Use regex (advanced)**를 켜고 **Configure regex**를 열어 방향별로 하나 이상 script를 선택한다.

중요: STMB 자체 selection이 execution을 제어한다. Regex extension의 일반 UI에서 script가 disabled여도 STMB가 선택한 script는 실행될 수 있다.

transformation을 이해할 때만 Regex를 사용한다. 잘못된 outgoing rule은 required schema instructions를 망가뜨릴 수 있고 잘못된 incoming rule은 valid JSON을 망가뜨릴 수 있다.

---

## 24. Lorebook Entry 제목 및 문자 정책

### 24.1 Title placeholders

Profile title format에서 사용 가능:

- `{{title}}` — AI-generated title
- `{{scene}}` — source range
- `{{char}}` — character/group name
- `{{user}}` — user name
- `{{messages}}` — scene message count
- `{{profile}}` — profile name
- supported date/time placeholders

### 24.2 Auto-numbering

지원 numbering tokens 예:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB는 chosen format에 따라 sequential zero-padded number를 assign한다.

### 24.3 Printable Unicode

title에는 emoji, accented text, CJK, symbols 등 모든 printable Unicode를 허용한다. U+0000–U+001F 및 U+007F–U+009F control characters는 제거된다.

Auto-Create가 쓰는 lorebook filename은 filesystem-reserved characters와 length에 대해 별도로 sanitize된다.

---

## 25. Job Queue 및 Retry 제어

optional queue는 Chat Top Bar / Chat Top Info Bar가 필요하다. queue 사용 시 Memory, consolidation, Side Prompt regeneration은 regeneration job을 만들고 replacement는 승인 전 review 상태로 남는다.

**Memory Books Jobs** drawer는 다음을 표시할 수 있다.

- queued
- active
- completed
- failed
- canceled
- blocked
- Needs Review

chat range를 처리하는 job은 starting/ending message numbers를 row에 보여 준다. drawer에서 active work cancel, review job reopen, failure inspect, retry, terminal history row dismiss도 가능하다.

Retry scopes:

- **Retry:** one non-Memory job(Side Prompt/consolidation 등) 다시 실행.
- **Retry All:** Memory + associated after-Memory Side Prompt work를 rerun/resume. Memory가 이미 저장됐다면 duplicate 없이 그 result에서 resume할 수 있음.
- **Retry Memory:** Memory만 rerun/resume하고 after-Memory Side Prompts는 의도적으로 skip.

combined workflow 복구에는 Retry All, tracker work가 필요 없으면 Retry Memory를 사용한다.

Chat Top Bar가 없어도 정상 workflow는 작동하지만 queue UI가 없다.

---

## 26. 시각적 피드백과 접근성

STMB는 scene controls에 inactive, selected, valid range, in-scene, processing 등의 visual state를 제공한다. 정확한 color는 SillyTavern theme에 따라 다르다.

Accessibility 지원:

- keyboard navigation
- focus indicators
- ARIA attributes
- reduced-motion behavior
- mobile-friendly controls

스크린샷을 설명할 때 특정 색 대신 실제 visible icon/label을 설명한다.

---

## 27. Settings Map 및 현재 설정 참조

이 section은 settings map이다. 각 user-facing STMB configuration control의 위치와 기능을 설명하고 specialized interface의 주요 saved/one-run controls도 정리한다. 특정 Clip, Topical Clip, Compaction 또는 preview를 만들 때만 쓰는 one-time content field는 workflow section에서 설명한다.

공통 시작 경로:

**chat input 옆 magic-wand Extensions menu → Memory Books**

아래 path는 명시적으로 **SillyTavern**이라고 하지 않는 한 Memory Books main panel에서 시작한다. current chat/provider/profile/storage mode에 적용되지 않는 control은 hidden/disabled일 수 있다.

Scope:

- **Global:** 더 좁은 setting이 override하지 않으면 STMB 전체.
- **Per chat:** current chat/group에 저장.
- **Per character:** compatible chats 사이에서 character card를 따라감.
- **Per profile/template/setting:** reusable object에 저장.
- **Per run:** 지금 준비하는 operation 하나에만 적용.

### 27.1 Main panel: storage, chat mode, active profile

| Setting | Location | Scope | 기능 |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode; book choice는 per chat | normal chat-bound lorebook을 automatic target으로 쓰지 않고 current chat용 Memory Book 선택을 요구. Auto-Create와 동시 불가. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls** | Per chat | 이 chat의 main Memory Book. Narrator Mode에서는 omniscient book. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows** | Per chat | real-group member별 separate Memory Book. configure/retrieval에 STLO 필요. |
| **Character Memory Book lock** | assignment 옆 lock icon | Per character | compatible Manual Mode chats에서 같은 Memory Book assignment 유지. 변경 전 unlock. |
| **Narrator Mode** | **Current Lorebook Configuration**; normal non-group chats only | Per chat | selected manual book을 omniscient Memory Book으로 사용하고 declared fictional cast의 unique books 활성화. |
| **Manage Narrator Cast** | **Narrator Mode** 아래/Active Cast drawer | Per chat | declared Narrator characters add/retire/restore 및 unique book assign. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | Automatic Mode에서 chat에 book 없으면 create/bind. Manual Mode와 동시 불가. |
| **Lorebook Name Template** | Auto-create 아래 | Global | `{{char}}`, `{{user}}`, `{{chat}}`로 auto-created book 이름 지정. |
| **Memory profile selection** | **Memory Profiles** selector | Per run | 다음 Memory용 profile 선택. 이것만으로 saved default는 변경되지 않음. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | selected profile을 automatic Memories 및 일반 workflow default로 지정. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format** 또는 **Edit Profile** | Per profile | 새 Memory title/macros/numbering format. |

### 27.2 General Settings

**Settings → General Settings**.

| Setting | Scope | 기능 |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | normal pre-generation confirmation skip. non-interactive catch-up에 필요. 독립 warnings/previews는 여전히 가능. |
| **Automatically accept detected participants in future** | Global | real-group participant confirmation을 건너뛰고 detected set 수락. |
| **Show memory previews** | Global | generated Memories/해당 Side Prompt output 저장 전 editable review. |
| **Show consolidation previews** | Global | consolidation candidate commit 전 review. |
| **Show notifications** | Global | STMB toast notifications. |
| **Show floating Clip button when text is highlighted** | Global | chat text 선택 시 scissors control 표시. |
| **Memory boundary indicator** | Global | none/divider/jump button/both. |
| **Allow scene overlap** | Global | existing Memory가 대표하는 message IDs와 selected scene overlap 허용. |
| **Refresh lorebook editor after adding memories** | Global | STMB write 후 open lorebook editor refresh. |
| **Copy Memory Books when branching** | Global | native chat branch에 active unlocked books의 independent copies 제공. character-locked books는 공유 유지. |
| **Default for solo chats** | Global | solo after-Memory Side Prompt Set default. empty = individually enabled. |
| **Default for group chats** | Global | real group after-Memory Side Prompt Set default. empty = individually enabled. |
| **Max Response Tokens** | Global | STMB generation output max override. cut-off JSON이면 증가. `0`은 normal provider/ST fallback. |
| **Token Warning Threshold** | Global | estimated input request가 threshold 초과 시 confirmation warning. model context limit 자체는 바꾸지 않음. |
| **Default Previous Memories Count** | Global | 새 Memory에 continuity context로 제공할 prior Memories 기본 0–7. Advanced Memory Options에서 one run override 가능. |
| **Use regex (advanced)** | Global | STMB regex-processing selection enable. underlying Regex UI enabled state와 별도. |
| **Configure regex… → Outgoing scripts** | Global | provider 전송 전 material에 적용. |
| **Configure regex… → Incoming scripts** | Global | parsing/saving 전 returned material에 적용. |

#### General Settings 안 Token Saving

같은 popup의 **Token Saving (Hide/Unhide Messages)**.

| Setting | Scope | 기능 |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | no hide / latest Memory까지 all processed / latest Memory range only. reversible, delete 아님. |
| **Messages to leave unhidden** | Global | auto-hide 시 boundary 근처 최근 messages overlap 유지. `0`은 applicable scene end까지 hide. |
| **Unhide hidden messages for memory generation** | Global | source range compile 전 `/unhide X-Y` equivalent. 성공 save 후 selected auto-hide mode가 다시 hide 범위 결정. |

### 27.3 Automatic Memories 및 consolidation reminders

**Settings → Automatic Memories**.

| Setting | Scope | 기능 |
|---|---|---|
| **Auto-create memory summaries** | Global | automatic `/nextmemory` style creation. baseline 없으면 message 0 가능. first manual Memory는 여전히 권장. |
| **Auto-Summary Interval** | Global | normal automatic cadence의 message 수. |
| **Auto-Summary Buffer** | Global | ready range의 newest messages 제외. live conversation보다 약간 뒤에서 generation. |
| **Prompt for consolidation when a tier is ready** | Global | monitored tier가 saved minimum에 도달하면 yes/later. silent consolidation 아님. |
| **Auto-Consolidation Tiers** | Global | readiness prompt로 monitor할 target tiers. minimum은 **Consolidate Memories**에 저장. |

### 27.4 Profile editor

**Memory Profiles → Profile Actions → Edit Profile**. 아래는 특별한 표시가 없으면 per profile이며 **Current SillyTavern Settings**는 ST가 제어하는 fields를 lock한다.

| Setting | 기능 |
|---|---|
| **Profile Name** | reusable STMB profile 이름. built-in은 locked. |
| **API/Provider** | current ST routing, supported provider, Custom OpenAI-compatible, Full Manual 선택. |
| **Use this connection profile** | Custom API에서 active ST Custom connection 또는 named Custom connection 선택. saved URL/secret 사용, STMB **Model**은 override 유지. |
| **Skip structured output and use plain-text completion** | schema 거부 provider에 structured-output schema를 보내지 않음. prompt는 여전히 valid JSON 요구. |
| **Use ST's ChatCompletionService** | supported request를 ST Chat Completion helper로 routing. Full Manual에는 unavailable. |
| **Chat Completion Preset** | ChatCompletionService를 통해 ST preset 선택 적용. |
| **Model** | exact model ID. Current ST profile은 active model 읽음. |
| **Temperature** | profile randomness. Current ST profile은 active temperature 읽음. |
| **Use reverse proxy** | supported provider에 ST reverse-proxy details 전달. |
| **API Endpoint URL / API Key** | Full Manual만 separate direct endpoint/credential. |
| **Memory Creation Method** | ordinary Memory Summary Prompt preset. |
| **Use separate group and character prompts in group chats** | group/character-focused books에 distinct prompts. |
| **Group Summary Prompt / Character Summary Prompt** | separate prompting 시 두 presets. |
| **Memory Title Format** | title/macros/numbering. |
| **Activation Mode** | Normal/Constant/Vectorized. |
| **Insertion Position** | Character, Example Messages, Author's Note, named Outlet 등. |
| **Outlet Name** | position이 Outlet일 때 target Outlet. |
| **Insertion Order** | Auto = Memory number, Manual = fixed, Reverse = starting value에서 감소(Outlet 용). |
| **Prevent Recursion** | generated entry content가 recursive scan에서 다른 entries trigger하지 않게 함. |
| **Delay Until Recursion** | first scan pass activation 방지. 다른 것이 recursion 시작 못 하면 off. |
| **Also include** | legacy profile compatibility. current config는 per-chat Context Settings 사용. |

active SillyTavern provider/model/temperature/connection preset/reverse proxy는 ST 자체 connection controls에서 설정한다. **Current SillyTavern Settings**는 그 live values를 읽는다.

### 27.5 Context Settings

**Settings → Context Settings**.

| Setting | Scope | 기능 |
|---|---|---|
| **Additional Context for this chat** | Per chat | named Context Setting 선택, explicit No Context, 또는 migrated context 결정 전 unset. |
| **Context Setting Name** | Per Context Setting | reusable collection 이름. |
| **Additional Context entries and order** | Per Context Setting | stable reference용 lorebook entries 선택/순서. missing entry warning 후 skip. |

**New**, **Duplicate**, **Delete**, **Import JSON**, **Export JSON**은 Context Settings를 관리한다. chat/Side Prompt가 selection하기 전 generation behavior는 바꾸지 않는다.

### 27.6 Trackers & Side Prompts

**Settings → Trackers & Side Prompts**.

| Setting | Location/Scope | 기능 |
|---|---|---|
| **After-memory side prompt mode for this chat** | main/per chat | solo/group default, individually enabled, 또는 named Side Prompt Set. |
| **How many concurrent prompts to run at once** | main/global | simultaneous Side Prompt jobs 1–10. |
| **Side Prompt Set Name** | set/per set | reusable ordered run group 이름. |
| **Side Prompt / Row Label / Macro Values** | set row/per set | template, optional label, literal/set-level macro values, order. |
| **Enabled** | Side Prompt editor/per template | individual mode에서 template eligible. trigger가 실제 실행 시점 결정. |
| **Run on visible message interval / Interval** | editor/per template | configured visible messages 뒤 실행. unresolved runtime macro면 automatic trigger unavailable. |
| **Run automatically after memory** | editor/per template | successful Memory 뒤 실행, chat mode/set 적용. |
| **Allow manual run via `/sideprompt`** | editor/per template | explicit manual execution 허용. |
| **Prompt / Response Format** | editor/per template | instruction 및 optional output structure. macros 가능. |
| **Previous memories for context** | editor/per template | 0–7 previous Memories. |
| **Use additional context / Additional Context Source** | editor/per template | chat Context Setting follow 또는 fixed named setting. |
| **Lorebook Target** | editor/per template 또는 per chat | normal Memory Book 또는 다른 lorebook. 변경 시 chat-only vs template scope 질문. |
| **Lorebook Entry Title Override / Keywords** | editor/per template | upsert title template/activation keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | editor/per template | activation/placement. |
| **Insertion Order / Order Value** | editor/per template | automatic Memory-number 또는 fixed manual order. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | editor/per template | 해당 lorebook flags. |
| **Override default memory profile / Connection Profile** | editor/per template | 특정 STMB profile로 routing. |
| **Memory Assistance Mode** | edit Memory Assistance/global | Off/Update/Update and Suggest/Automatic. |
| **Update Prompt / Topic Suggestions Prompt** | built-in | 두 AI tasks. response contracts는 fixed. |
| **Use a connection profile override** | built-in | default 대신 selected STMB profile. |

### 27.7 Prompt managers

| Setting | Location | Scope | 기능 |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager** | Per preset | reusable ordinary-Memory prompt. profile이 preset을 선택해야 사용. |
| **Default consolidation prompt** | **Consolidation Prompt Manager → Set Default** | Global | **Consolidate Memories** 기본 prompt. regeneration/group-only preset 불가. |
| **Consolidation Prompt name and prompt text** | Consolidation Prompt Manager | Per preset | reusable consolidation instructions. dedicated regeneration/group presets는 제한된 workflow만. |

### 27.8 Topical Clip 및 Compaction defaults

**Settings → Topical Clip** 또는 **Settings → Compaction**.

| Setting | Location | Scope | 기능 |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | 해당 interfaces | Global shared default | Topical Clip generation과 Compaction이 공유하는 STMB profile selection. |
| **Topical Clip Prompt** | Topical Clip → Edit | Global | custom prompt. Reset to Default 가능. required source macros validation. |
| **Compaction Prompt** | Compaction → Edit | Global | existing entries shortening custom prompt. `{{ENTRY_CONTENT}}` required. |

Memory Book/topic/keywords/source inclusion/source selection/message range/draft/Compaction entry는 per-run choices다.

### 27.9 Consolidate Memories controls

main panel 아래 **Consolidate Memories**.

| Setting | Scope | 기능 |
|---|---|---|
| **Target tier** | Per run | 만들 higher tier, 따라서 바로 lower eligible source tier 선택. |
| **Consolidation Prompt** | Per run | 이번 consolidation prompt; manager default로 시작. |
| **Maximum entries per pass** | Per run | analysis pass당 lower-tier entries 수. |
| **Token Budget** | Per run | batching용 approximate input budget. |
| **Number of automatic summary attempts** | Per run | usable assignments/summaries를 얻기 위한 repeated analysis passes 제한. |
| **Saved minimum eligible entries** | Global per target tier | chosen tier readiness/minimum. automatic readiness prompt도 제어. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation defaults | 새 consolidated entry save settings. ordinary Memory profile settings와 별도. |
| **Disable selected source entries after creating summaries** | Per run | successful consolidated sources disable, delete 아님. |
| **Selected source entries** | Per run | 처리할 eligible lower-tier entries. unchecked는 untouched. |

### 27.10 관련 SillyTavern World Info settings

STMB 밖 SillyTavern World Info/lorebook settings지만 saved Memories retrieval에 영향.

| Setting | 기능 |
|---|---|
| **Match Whole Words** | keyword boundary matching. off가 flexible Memory keywords의 흔한 시작값. |
| **Scan Depth** | activation을 위해 scan할 recent text 양. 8 정도의 비교적 높은 값이 흔한 시작값. |
| **Max Recursion Steps** | recursive World Info activation 제한. 약 2 흔한 시작값. |
| **Context percentage / lorebook budget** | lorebook entries가 차지할 수 있는 context 제한. 전체 context/다른 prompt와 균형. |

권장 사항이며 hard requirements가 아니다. Section 10 retrieval diagnosis 참조.

---

## 28. Slash Command 참조

### Memory commands

```text
/creatememory
```

현재 marked scene에서 Memory 생성.

```text
/scenememory X-Y
```

inclusive range 설정 후 Memory 생성. 예: `/scenememory 10-15`.

```text
/nextmemory
```

highest processed boundary 다음 message부터 current eligible end까지 Memory 생성.

```text
/stmb-catchup interval=x start=y end=z
```

기존 긴 chat을 consecutive chunks로 처리.

### Side Prompt commands

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Processed-boundary commands

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergency stop

```text
/stmb-stop
```

Side Prompts 포함 모든 in-flight STMB generation을 everywhere 중지. 이미 committed work는 저장 상태 유지.

---

## 29. 단계별 문제 해결

### 29.1 Extension/UI가 로드되지 않음

증상:

- magic-wand menu에 Memory Books 없음
- chevrons 없음
- text selection 후 floating Clip button 없음

확인:

1. extension installed/enabled
2. page reload
3. character/group chat open
4. 최대 10초 기다림
5. message actions expand
6. 이후에만 console 확인

### 29.2 Scene 선택 없음

marked scene에는 **►**, **◄** 둘 다 필요. panel의 Current Scene 확인.

range가 existing Memory와 overlap하면 다른 range 또는 Allow Scene Overlap.

### 29.3 Valid Memory Book 없음

Automatic Mode:

- lorebook bind 또는
- Auto-Create enable

Manual Mode:

- main manual book 선택
- deleted selection repair
- broken character lock unlock 후 변경

Real multi-book group:

- STLO available
- every required member valid assignment
- group book을 character book으로 재사용 금지

Narrator Mode:

- Manual Mode enabled
- omniscient book selected
- every declared member unique non-omniscient book

### 29.4 AI가 valid Memory를 만들지 못함

순서대로:

1. provider/model/profile valid
2. response truncation 확인
3. maximum response tokens 충분
4. selected prompt exact JSON 요구 유지
5. Regex가 schema를 깨지 않았는지
6. provider가 selected structured-output mode 지원
7. provider가 schema를 거부할 때만 Skip Structured Output
8. prompt 재작성 전 더 instruction-following model 시도
9. persistent error notification의 **Raw response from AI**로 provider response 확인 및 지원 시 manual JSON correction

흔한 원인: code fences, commentary, missing key, keywords가 array 아님, refusal text, cut-off output.

### 29.5 Memory 저장 후 messages가 사라짐

auto-hidden일 가능성. Token Saving 설정 변경. hidden messages는 삭제되지 않았다.

### 29.6 Automatic Memories가 실행되지 않음

확인:

- Auto-create memory summaries enabled
- highest processed boundary 이후 충분한 messages
- interval + buffer 충족
- postpone checkpoint 없음
- valid Memory Book
- 다른 Memory job이 trigger block하지 않음
- 작업 중 chat switch하지 않음
- group generation 끝난 뒤 trigger 기대

current version은 첫 manual Memory가 recommended이지만 technical requirement는 아니다.

### 29.7 Memory 존재하지만 activation 안 됨

확인:

- correct book active
- entry enabled
- relevant keywords
- activation mode
- budget
- recursion/Delay Until Recursion
- STLO routing
- World Info inspection/logs

retrieval을 테스트하기 전 Memory regenerate하지 않는다.

### 29.8 Entry가 전송되었지만 무시됨

model-use behavior다. 가능한 대응:

- Memory를 짧고 explicit하게
- insertion position/priority 개선
- competing context 감소
- OOC reminder
- supplied context를 더 잘 따르는 model

### 29.9 Side Prompt 실행 안 됨

Section 16.18 참조. 특히 selected set은 set 밖 individually enabled prompts를 suppress한다.

### 29.10 Consolidation prompt 안 나타남

확인:

- readiness prompt enabled
- target tier monitored
- enough eligible source entries
- sources already disabled/ineligible 아님
- saved minimum count 충족

### 29.11 Regeneration button disabled

hover/표시 reason 확인. 흔한 원인:

- required snapshot metadata 이전 entry
- source chat/range unavailable
- source entries missing/wrong tier
- active parent consolidation이 lower source block
- original sequence number 결정 불가
- Side Prompt template deleted

### 29.12 Branch가 books를 복사하지 않음

확인:

- branch creation 전에 Copy Memory Books when branching enabled
- native SillyTavern branch
- source books 존재/load 가능
- copy 중 chat switch 없음
- branch가 previously completed/failed 표시 아님
- locked books는 의도적으로 copy 대신 preserved

### 29.13 Narrator Mode cast가 틀림

확인:

- generation 전 Active Cast
- continuation이 cast metadata merge했는지
- swipe가 older cast state restore했는지
- legacy untagged messages 때문에 confirmation 필요한지
- declared character retired 여부
- 각 character book 존재

---

## 30. FAQ

### Vectors가 필요한가?

아니다. keyword activation으로 충분하고 자동 생성된다. Vectors는 선택 사항이다.

### Memories는 separate lorebook을 써야 하나?

organization, budgeting, reuse, diagnosis를 위해 보통 권장하지만 필수는 아니다.

### STMB가 messages를 삭제하나?

아니다. processed messages를 active context에서 숨길 수 있다.

### STMB를 완전히 수동으로 쓸 수 있나?

그렇다. 원하는 때에 scene을 mark하고 Memories만 만든다.

### Automatic Memories가 첫 Memory를 만들 수 있나?

현재 STMB에서는 그렇다. processed baseline이 없으면 interval + buffer가 충족되면 message 0부터 시작한다. 그래도 setup 검증과 시작 boundary 선택을 위해 first manual run 권장.

### Consolidation이 자동 실행되나?

아니다. tier ready 시 prompt할 수 있지만 user가 확인하고 review한다.

### Real group이 Memory Book 하나만 써도 되나?

그렇다. 권장 시작 layout이며 STLO 불필요.

### Separate real-group character books는 언제 유용한가?

individual continuity, knowledge, speaker-specific retrieval, character-focused summaries가 추가 setup/AI requests의 가치가 있을 때.

### Narrator Mode와 Group Chat Mode는 같은가?

아니다. Group Chat Mode는 별도 SillyTavern character-card authors를 읽는다. Narrator Mode는 Narrator card 하나가 쓰는 fictional characters를 수동 선언한다.

### Narrator Mode에 STLO가 필요한가?

active-cast retrieval 경로에는 필요 없다. Manual Lorebook Mode, omniscient book 하나, unique per-character books가 필요하다.

### Linked copies는 sync되나?

아니다. origin/consolidation metadata로 linked일 뿐 continuous mirror가 아니다.

### Delay Until Recursion은 왜 보통 꺼야 하나?

다른 lorebook entry가 recursion을 시작하지 못하면 delayed Memory entry가 activation되지 않을 수 있다.

### 첫 successful Memory 후 무엇을 해야 하나?

entry retrieval 확인 → automatic Memories enable → interval/buffer 선택 → token hiding enable → 필요할 때만 Clips/narrow Side Prompt 추가. Topical Clip/Consolidation은 Memories가 충분히 쌓인 뒤 사용.

---

## 31. 호환성, 마이그레이션 및 현재 역사적 참고 사항

현재 사용에 영향을 주는 history만 보존한다.

### Current baseline

- 현재 문서 release: v8.5.0, 2026년 8월 1일.
- SillyTavern requirement: 1.14.0 이상.
- Narrator Mode: v8.5.0.
- Branch book copying, Side Prompt regeneration, character Memory Book locks: v8.4.0.
- multi-character real-group Memory distribution: v8.0.0.
- Additional Context가 profiles에서 reusable per-chat Context Settings로 이동: v7.0.0; older profile context migrated.
- Topical Clip: v6.10.0.
- Compaction/Clips: v6.6.0.
- Side Prompt Sets/per-prompt targets: v6.4–v6.5.
- multi-tier Arc→Epic Consolidation: v6.0.0; older Arc metadata migrated.
- Job Queue integration: v6.8.0, optional.
- current profile defaults는 user/profile이 바꾸지 않으면 Delay Until Recursion disabled.

### Older version의 existing Memories

`stmemorybooks` flag와 required metadata가 있는 entries만 STMB Memories로 인식한다. current metadata 이전 entries에는 supplied lorebook converter를 사용한다.

### Removed functionality

old bookmark feature는 v4.0.0에서 Memory Books core extension에서 제거/분리됐다. 현재 Memory Books bookmark controls로 가르치지 않는다.

### Localized built-ins

Built-in prompts는 active SillyTavern language에 맞게 regenerate할 수 있다. customized built-ins는 먼저 backup한다.

### Import behavior

Side Prompt import는 additive다. existing prompts를 보존하고 imported key conflict는 overwrite 대신 rename한다.

---

## 32. 개발자 및 라이선스 참고 사항

Memory Books는 bundling/minification에 Bun을 사용한다.

```sh
bun run build
```

repository pre-commit build hook 설치:

```sh
bun run install-hooks
```

hook은 commit 전에 build하고 build artifacts를 stage하며 build 실패 시 commit을 중단한다.

Memory Books는 Copyright © 2024–2026 Aiko Hanasaki이며 GNU Affero General Public License v3.0으로 라이선스된다. modified version은 applicable notices를 보존하고 modifications를 식별하며 AGPL source-availability requirements를 준수해야 한다.

---

## 33. 간단한 진단 결정 트리

```text
사용자: “Memory Books가 작동하지 않아요.”
│
├─ menu/control이 보이는가?
│  ├─ 아니오 → installation/loading/UI checks.
│  └─ 예
│
├─ scene을 선택할 수 있는가?
│  ├─ 아니오 → message actions 펼치기; 두 chevrons 설정; overlap 확인.
│  └─ 예
│
├─ valid effective Memory Book이 있는가?
│  ├─ 아니오 → bind, auto-create, manual 선택 또는 multi-book bindings repair.
│  └─ 예
│
├─ generation이 valid complete output을 반환하는가?
│  ├─ 아니오 → profile, provider, output tokens, JSON schema, Regex, model.
│  └─ 예
│
├─ intended book에 entry가 있는가?
│  ├─ 아니오 → save/rollback/permission/job failure.
│  └─ 예
│
├─ SillyTavern이 나중에 activation하고 전송하는가?
│  ├─ 아니오 → keywords, activation mode, book binding, budget, recursion, STLO.
│  └─ 예
│
└─ model이 supplied entry를 사용하는가?
   ├─ 아니오 → model compliance, placement, competing context, entry clarity.
   └─ 예 → workflow 정상 작동.
```

---

## 34. 최소 권장 교육 순서

새 사용자에게 먼저 다음만 가르친다.

1. magic-wand menu에서 Memory Books 찾기.
2. bound book이 있는 Automatic Mode 사용 또는 Auto-Create enable.
3. Current SillyTavern Settings 선택.
4. message actions를 펼쳐 짧고 완전한 scene을 **►**, **◄**로 mark.
5. Memory 하나 create/preview.
6. Memory Book을 열어 saved entry 확인.
7. later activation되는지 확인.
8. automatic Memories enable, interval/buffer 선택.
9. hidden message가 delete가 아님을 설명한 뒤 auto-hide enable.
10. concrete need가 있을 때 Clips → Side Prompts → Topical Clip/Consolidation 순으로 소개.

실제 문제에 필요하지 않으면 custom prompts, Full Manual endpoints, multiple character books, Regex, consolidation부터 시작하지 않는다.

---

## 35. 최종 개념 요약

Memory Books는 SillyTavern lorebooks 위에 구축된 external continuity pipeline이다.

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

가장 잘 작동하는 조건:

- scenes가 coherent함
- prompts가 target과 reference context를 분명히 구분
- JSON workflows가 exact schemas 반환
- keywords가 concrete함
- Memory Books가 deliberate하게 assigned/activated됨
- long-running trackers가 stale state를 prune
- consolidation이 continuity를 지우지 않고 old detail 감소
- 사용자가 “saved = sent”라고 가정하지 않고 retrieval 확인
- advanced multi-book routing은 precision이 complexity보다 가치 있을 때만 사용
