# 🎡 Side Prompt

Side Prompt는 채팅 유지 관리를 위한 추가 STMB 프롬프트 실행입니다. 일반 캐릭터 응답이 모든 작업을 떠안지 않아도 되도록, 분석, 추적, 요약, 정리, 보조 노트 업데이트를 처리할 수 있습니다.

채팅에 진행 중인 트래커, 관계 보고서, 플롯 목록, 발명 기록, NPC 상태표, 타임라인, 또는 비슷한 보조 문서가 필요할 때 사용하세요. 캐릭터는 계속 역할극을 진행하고, Side Prompt가 문서 작업을 맡습니다. ❤️

## 목차

- [Side Prompt란?](#side-prompt란)
- [언제 사용하나요?](#언제-사용하나요)
- [빠른 설정 안내](#빠른-설정-안내)
- [실행 방식](#실행-방식)
- [수동 실행](#수동-실행)
- [메모리 후 자동 실행](#메모리-후-자동-실행)
- [Side Prompt Set](#side-prompt-set)
- [매크로](#매크로)
- [메시지 범위](#메시지-범위)
- [좋은 Side Prompt 작성법](#좋은-side-prompt-작성법)
- [예시](#예시)
- [문제 해결](#문제-해결)
- [핵심 정리](#핵심-정리)

---

## Side Prompt란?

Side Prompt는 일반 캐릭터 응답과 별도로 실행되는 이름 있는 프롬프트입니다.

다음과 같은 내용을 생성하거나 업데이트할 수 있습니다.

- 플롯 트래커
- 관계 트래커
- NPC 또는 세력 노트
- 인벤토리/자원 목록
- 타임라인
- 미스터리/단서 보드
- 발명 또는 프로젝트 트래커
- 연속성 보고서
- 정리 노트
- lorebook 스타일 보조 항목

Side Prompt는 일반 메모리와 다릅니다. 메모리는 보통 장면 요약을 순서대로 저장합니다. Side Prompt는 보통 계속 갱신되거나 덮어쓰이는 진행 상태 문서를 유지합니다.

또한 반드시 JSON을 반환할 필요도 없습니다. 특정 프롬프트나 저장 대상이 더 엄격한 형식을 요구하지 않는 한, 일반 텍스트와 Markdown이면 충분합니다.

---

## 언제 사용하나요?

Side Prompt는 구조화된 보조 작업에 사용하세요.

좋은 사용 예:

- **플롯 포인트:** 진행 중인 스레드, 해결된 스레드, 남은 떡밥
- **관계:** 신뢰, 긴장, 호감, 경계선, 목표
- **NPC:** 각 NPC가 아는 것, 원하는 것, 최근에 한 일, 다음에 필요한 것
- **타임라인:** 날짜, 이동, 부상, 마감일, 카운트다운
- **세계 상태:** 변경된 장소, 물건, 세력, 자원
- **미스터리:** 단서, 용의자, 모순, 미해결 질문
- **프로젝트:** 발명, 연구, 장애물, 범위 변경, 다음 단계
- **연속성:** 환각 위험이 큰 내용이나 누락된 맥락

나쁜 사용 예:

- 다음 캐릭터 응답 안에 반드시 들어가야 하는 내용
- 막연한 “스토리를 더 좋게 만들어줘” 프롬프트
- 실행할 때마다 에세이를 만드는 거대한 분석 프롬프트
- 별도 역할이 없는 중복 메모리 요약

Side Prompt는 마법이 아닙니다. 막연한 Side Prompt는 정리된 막연함일 뿐입니다.

---

## 빠른 설정 안내

클릭 순서가 필요한 경우 [Side Prompt 활성화 Scribe 안내](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)를 참고하세요.

간단한 경로는 다음과 같습니다. **Extensions**를 열고, **Memory Books**를 연 뒤, **Side Prompts**를 클릭하고, 원하는 프롬프트를 선택하여 활성화하세요. 필요하면 **Run automatically after memory**를 켠 다음, **Save**와 **Close**를 누릅니다.

---

## 실행 방식

일반적인 Side Prompt 실행은 다음 흐름을 따릅니다.

1. STMB가 검토할 메시지를 선택합니다.
2. Side Prompt가 준비됩니다.
3. 필요한 매크로가 채워집니다.
4. 모델이 Side Prompt 출력을 생성합니다.
5. STMB가 출력을 확인합니다.
6. Side Prompt 설정에 따라 결과가 미리보기, 저장, 업데이트, 또는 건너뛰기 처리됩니다.

수동 Side Prompt, 메모리 후 Side Prompt, Side Prompt Set의 각 행은 같은 시스템처럼 동작해야 합니다. 미리보기, 일괄 실행, 빈 응답 확인, 저장, 중지 처리, 알림에 대해 같은 일반 실행 동작을 공유합니다.

---

## 수동 실행

하나의 Side Prompt를 수동으로 실행하려면 `/sideprompt`를 사용하세요.

기본 형식:

```txt
/sideprompt "Prompt Name"
```

메시지 범위 포함:

```txt
/sideprompt "Prompt Name" 10-20
```

런타임 매크로 포함:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

공백이 있는 프롬프트 이름은 따옴표로 감싸세요.

수동 실행은 일회성 확인, 특정 범위 업데이트, 사용자 지정 매크로 값이 필요한 프롬프트에 가장 적합합니다.

---

## 메모리 후 자동 실행

일부 Side Prompt는 메모리가 생성된 뒤 자동으로 실행될 수 있습니다.

채팅이 진행되는 동안 트래커를 최신 상태로 유지해야 할 때 유용합니다. 예를 들어 관계 트래커나 플롯 트래커는 각 메모리 후에 업데이트할 수 있습니다.

메모리 후 실행 방식은 두 가지입니다.

- **개별 활성화된 Side Prompt 사용** — 기존 동작입니다. **Run automatically after memory**가 켜진 모든 Side Prompt가 실행될 수 있습니다.
- **이름 있는 Side Prompt Set 사용** — 선택된 Set이 대신 실행됩니다.

선택된 Side Prompt Set은 개별 활성화된 메모리 후 Side Prompt를 대체합니다. 추가로 더해지는 것이 아닙니다. 이 방식은 사용자가 잊고 남겨 둔 오래된 체크박스 때문에 중복 실행이 발생하는 일을 막습니다.

---

## Side Prompt Set

Side Prompt Set은 여러 Side Prompt를 하나의 순서 있는 워크플로로 묶습니다.

Set은 단순한 폴더가 아니라 순서가 있는 실행 목록입니다. 같은 Side Prompt를 다른 매크로 값으로 여러 번 넣을 수 있습니다.

예시 Set:

1. Relationship Tracker with `{{npc name}} = Alice`
2. Relationship Tracker with `{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

이렇게 하면 하나의 프롬프트 템플릿으로 서로 다른 NPC, 세력, 장소, 프로젝트에 대한 별도 항목을 유지할 수 있습니다.

### Set 관리

Set을 만들고, 편집하고, 복제하고, 삭제하고, 순서를 바꾸려면 **🎡 Trackers & Side Prompts**를 여세요.

각 행에는 다음을 넣을 수 있습니다.

- Side Prompt
- 선택적 행 라벨
- 저장된 매크로 값
- 복제/삭제 컨트롤
- 위/아래 이동 컨트롤

행은 위에서 아래로 실행됩니다. 기반이 되는 트래커를 먼저 두고, 정리/보고용 프롬프트는 나중에 두세요.

### Set 수동 실행

저장된 값으로 Set 실행:

```txt
/sideprompt-set "Set Name"
```

범위 포함:

```txt
/sideprompt-set "Set Name" 10-20
```

매크로 값을 넣어 재사용 가능한 Set 실행:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Set에 아직 값을 받아야 하는 재사용 토큰이 있을 때는 `/sideprompt-macroset`을 사용하세요.

### 누락된 Set 또는 행

Side Prompt Set은 의도적으로 엄격합니다.

- 선택된 Set이 없으면, 개별 활성화된 메모리 후 동작이 사용됩니다.
- Set이 선택되어 있으면, 개별 활성화된 메모리 후 프롬프트는 무시됩니다.
- 선택된 Set이 삭제되었다면 아무것도 실행되지 않고 STMB가 경고합니다.
- 어떤 행이 삭제된 프롬프트를 가리키면, 그 행은 건너뛰고 STMB가 경고합니다.
- 어떤 행에 아직 필요한 매크로 값이 없으면, 그 행은 건너뛰고 STMB가 경고합니다.

조용한 fallback은 더 나쁩니다. 선택된 워크플로가 깨졌다면 사용자가 알아야 합니다.

---

## 매크로

Side Prompt는 `{{user}}`, `{{char}}` 같은 일반 SillyTavern 매크로를 사용할 수 있습니다.

또한 런타임 매크로도 사용할 수 있습니다. 런타임 매크로는 Side Prompt 실행 시 채워지는 자리표시자입니다.

런타임 매크로 예시:

```txt
{{npc name}}
```

수동 실행:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

저장된 Set 값:

```txt
{{npc name}} = Alice
```

재사용 가능한 Set 수준 값:

```txt
{{npc name}} = {{npc_1}}
```

그다음 실행:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### 매크로 팁

무난한 이름을 사용하세요.

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

다음과 같은 이름은 피하세요.

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

UI에서는 공백이 읽기 쉽습니다. 슬래시 명령어에서는 보통 밑줄이 덜 귀찮습니다.

사용자 지정 런타임 매크로가 있는 Side Prompt는 필요한 값이 Side Prompt Set 행처럼 어딘가에 저장되어 있지 않은 한 개별 자동 실행에 적합하지 않습니다. 자동 실행은 중간에 멈춰서 `{{npc name}}`이 누구를 뜻하는지 물어볼 수 없습니다.

---

## 메시지 범위

Side Prompt는 특정 메시지 범위에 대해 실행할 수 있습니다.

```txt
/sideprompt "Plot Points" 50-80
```

범위를 제공하면 STMB는 그 범위를 사용합니다.

범위를 제공하지 않으면 STMB는 기존 cap/checkpoint 로직과 함께 일반적인 마지막 Side Prompt 이후 동작을 사용합니다.

일상적인 추적에는 마지막 실행 이후 동작이 더 쉽습니다. 디버깅이나 특정 범위 정리에는 명시적 범위가 더 명확합니다.

Side Prompt 범위 컴파일은 메모리와 같은 숨김 메시지 선호 설정을 따라야 하며, 전역 메모리 전 숨김 해제 설정도 포함해야 합니다.

---

## 좋은 Side Prompt 작성법

좋은 Side Prompt에는 일이 있습니다. 나쁜 Side Prompt에는 분위기만 있습니다.

다음을 명확히 하세요.

- 무엇을 검토해야 하는지
- 무엇을 업데이트해야 하는지
- 무엇을 무시해야 하는지
- 어떤 형식으로 출력해야 하는지
- 출력 길이는 어느 정도여야 하는지
- 교체, 수정, 추가 중 무엇을 해야 하는지

### 의도적으로 짧은 출력을 요구하세요

트래커는 제한하지 않으면 부풀어 오릅니다.

약한 예:

```txt
Update the relationship tracker.
```

더 나은 예:

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

유용한 제한 규칙:

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### 안정적인 제목을 사용하세요

안정적인 제목은 반복 업데이트를 더 깔끔하게 만듭니다.

좋은 예:

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

나쁜 예:

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### 모든 것을 요구하지 마세요

모든 세부사항을 요구하는 Side Prompt는 보통 모든 세부사항을 출력합니다.

중요한 것만 고르세요. 플롯 트래커에는 보통 미해결 후크, 바뀐 내용, 누가 알고 있는지, 후속 조치가 필요한 내용이 있으면 됩니다. 장면 속 모든 표정까지 필요하지는 않습니다.

### 매크로 사용을 눈에 띄게 만드세요

좋은 이름:

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

덜 유용한 이름:

```txt
Tracker 3
Update thing
Misc relationship prompt
```

사용자가 왜 값을 요구하는지 이해하려고 전체 프롬프트 본문을 열어 봐야 해서는 안 됩니다.

---

## 예시

### Plot Points Tracker

채팅에 여러 활성 스토리라인이 있을 때 사용하세요.

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

권장 형태:

```md
# Plot Points

## Active Threads

1. **Missing artifact** — Current status and latest clue.
2. **Rival faction** — What they want and what changed.

## Recently Resolved

1. **Old misunderstanding** — Resolved when Alice told Bob the truth.

## Needs Follow-Up

1. Who has the key?
2. Why did the guard lie?
```

### 매크로가 있는 Relationship Tracker

프롬프트 요구값:

```txt
{{npc name}}
```

수동 실행:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Set 행:

| 행 | Side Prompt | 저장된 매크로 |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

이렇게 하면 NPC마다 별도의 프롬프트 정의를 만들 필요가 없습니다.

### 발명 또는 프로젝트 트래커

사용자가 계속 무언가를 발명, 연구, 제작, 변경할 때 사용하세요.

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

프로젝트가 존재한다는 말만 반복하는 메모리 열 개를 저장하는 것보다 보통 더 깔끔합니다.

### 재사용 가능한 Cast Pass

Set 수준 런타임 토큰을 사용해 Set을 만드세요.

```txt
{{npc_1}}
{{npc_2}}
```

실행:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

나중에 다시 사용:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

같은 Set입니다. 다른 출연진입니다. 💡

---

## 문제 해결

### 메모리 후 Side Prompt가 실행되지 않았습니다.

확인할 것:

- 메모리가 실제로 실행되었나요?
- Side Prompt의 메모리 후 실행이 활성화되어 있나요?
- 채팅이 **Use individually-enabled side prompts**를 사용하고 있나요?
- 채팅이 대신 Side Prompt Set을 사용하고 있나요?
- 프롬프트에 제공되지 않은 매크로 값이 필요한가요?
- 프롬프트가 삭제, 이름 변경, 또는 이동되었나요?

채팅이 Side Prompt Set을 사용하면, 해당 채팅에서는 개별 활성화된 메모리 후 체크박스가 무시됩니다.

### Side Prompt Set이 실행되지 않았습니다.

확인할 것:

- 이 채팅에 Set이 선택되어 있나요?
- Set이 아직 존재하나요?
- 모든 행이 존재하는 Side Prompt를 가리키고 있나요?
- 필요한 모든 매크로에 저장값 또는 제공값이 있나요?

자동 실행은 누락된 값을 물어볼 수 없습니다. Set에 매크로 값을 저장하거나 `/sideprompt-macroset`으로 수동 실행하세요.

### 한 행이 건너뛰어졌습니다.

가능한 원인:

- 참조된 Side Prompt가 삭제됨
- 참조된 Side Prompt의 이름이 변경됨
- 행에 해결되지 않은 매크로가 있음
- 모델이 빈 응답 또는 유효하지 않은 응답을 반환함

STMB는 모든 것이 잘 된 척하는 대신 경고해야 합니다.

### 출력이 너무 깁니다.

강한 제한을 추가하세요.

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

모델은 트래커가 쓸모없을 정도로 커졌다는 사실을 자연스럽게 알지 못합니다. 직접 지시하세요.

### 두 번 실행되었습니다.

확인할 것:

- 수동 실행과 자동 실행이 모두 발생함
- Set 안에 중복 행이 있음
- 같은 Side Prompt의 반복 복사본이 있음
- 여러 채팅 또는 탭이 가까운 시간에 작업을 트리거함

선택된 Side Prompt Set은 개별 활성화된 메모리 후 프롬프트를 대체해야 하므로, 흔한 중복 실행 문제 하나를 막아 줍니다.

### 잘못된 메시지가 분석되었습니다.

명시적 범위를 사용하세요.

```txt
/sideprompt "Plot Points" 50-80
```

마지막 실행 이후 동작은 편리합니다. 디버깅에는 명시적 범위가 더 낫습니다.

### 트래커가 오래된 정보를 계속 유지합니다.

Side Prompt에 오래된 정보를 제거하라고 지시하세요.

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

트래커는 저절로 깔끔해지지 않습니다.

---

## 핵심 정리

### 사용자용

긴 채팅을 구조적으로 관리하고 싶을 때 Side Prompt를 사용하세요.

수동 실행은 일회성 분석에 좋습니다. 메모리 후 실행이나 Side Prompt Set은 최신 상태를 유지해야 하는 트래커에 적합합니다.

### 봇 제작자용

Side Prompt는 역할극 문장이 아니라 유지 관리 도구처럼 만드세요.

안정적인 제목, 엄격한 출력 규칙, 명확한 업데이트 동작을 사용하세요. 하나의 프롬프트가 여러 NPC, 세력, 장소, 프로젝트에 적용되어야 한다면 매크로를 사용하세요.

### 관리자용

Side Prompt는 생성 작업을 더 추가합니다.

그래서 예측 가능하고, 확인 가능하며, 좋은 의미에서 지루해야 합니다. Set은 의도된 워크플로를 명시적으로 보여 주므로, 체크박스가 난립하는 것보다 낫습니다.
