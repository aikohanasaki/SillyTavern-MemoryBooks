// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
// Local modification: evidence-based Status reports without relationship scores.

const ENGLISH_PROMPT = `Summarize the relationship between {{user}} and {{char}} using only the supplied scenes and established context. Describe its actual nature, each participant's perspective, trust or distrust, cooperation or conflict, boundaries, communication, shared or conflicting goals, and meaningful changes.

Relationships may be friendly, familial, professional, adversarial, romantic, mixed, or undefined. Do not assume attraction, reciprocity, increasing closeness, or a particular future outcome. Include romantic or sexual aspects only when explicitly established by the supplied material. Kindness, care, physical proximity, or cooperation alone do not establish attraction.

Distinguish established facts from interpretations and uncertainty. Describe observable behavior rather than asserting unspoken motives or feelings. Label any interpretation as tentative; routine verification alone does not establish distrust. When updating an earlier report, retain supported history, correct contradicted claims, and do not treat earlier speculation or scores as evidence. Use the current response format without carrying forward obsolete scoring sections. Describe the relationship in words, without numerical ratings. Do not invent future events, recommend plot developments, or tell the characters how to act. If evidence is absent, say it is not established.`;

// Every locale uses the same six sections. These sections also replace exact
// legacy blocks inside an otherwise customized response format.
export const RELATIONSHIP_DEFAULTS = {
    en: {
        prompt: ENGLISH_PROMPT,
        sections: [
            "### RELATIONSHIP DYNAMICS\n- Established relationship and each participant's perspective; note differences or uncertainty.",
            '### RECENT CHANGES AND EVIDENCE\n- Meaningful changes and the events or brief quotes that support them; note when nothing changed.',
            '### TRUST, BOUNDARIES, AND COMMUNICATION\n- Demonstrated trust or distrust, cooperation or conflict, boundaries, and communication patterns.',
            '### GOALS\n- Established individual, shared, or conflicting goals and observed progress or obstacles.',
            '### OBSERVATIONS AND UNRESOLVED QUESTIONS\n- Evidence-based observations; distinguish interpretations from facts. List only uncertainties raised by the context, without predictions or story suggestions.',
            '### SUMMARY\n- One concise, factual paragraph about the current relationship.',
        ],
    },
    de: {
        prompt: `Fasse die Beziehung zwischen {{user}} und {{char}} ausschließlich anhand der vorliegenden Szenen und des belegten Kontexts zusammen. Beschreibe die tatsächliche Art der Beziehung, die Sichtweise jeder Person, Vertrauen oder Misstrauen, Zusammenarbeit oder Konflikte, Grenzen, Kommunikation, gemeinsame oder gegensätzliche Ziele und wichtige Veränderungen.

Beziehungen können freundschaftlich, familiär, beruflich, feindselig, romantisch, gemischt oder ungeklärt sein. Setze weder Anziehung noch Gegenseitigkeit, zunehmende Nähe oder eine bestimmte Zukunft voraus. Erwähne romantische oder sexuelle Aspekte nur, wenn sie im Material ausdrücklich belegt sind. Freundlichkeit, Fürsorge, körperliche Nähe oder Zusammenarbeit allein belegen keine Anziehung.

Trenne Fakten, Interpretationen und Unsicherheit. Beschreibe beobachtbares Verhalten, ohne unausgesprochene Motive oder Gefühle zu behaupten. Kennzeichne Interpretationen als vorläufig; routinemäßige Überprüfungen allein belegen kein Misstrauen. Bewahre beim Aktualisieren belegte Vorgeschichte, korrigiere widersprochene Aussagen und behandle frühere Spekulationen oder Bewertungen nicht als Belege. Verwende das aktuelle Antwortformat ohne alte Bewertungsskalen. Beschreibe Beziehungen in Worten, ohne Zahlenwerte. Erfinde keine zukünftigen Ereignisse, mache keine Handlungsvorschläge und gib den Figuren keine Verhaltensanweisungen. Fehlen Belege, kennzeichne dies als nicht belegt.`,
        sections: [
            '### BEZIEHUNGSDYNAMIK\n- Belegte Art der Beziehung und die Sichtweise jeder Person; Unterschiede und Unsicherheiten benennen.',
            '### AKTUELLE VERÄNDERUNGEN UND BELEGE\n- Wichtige Veränderungen mit Ereignissen oder kurzen Zitaten belegen; auch unveränderte Zustände benennen.',
            '### VERTRAUEN, GRENZEN UND KOMMUNIKATION\n- Gezeigtes Vertrauen oder Misstrauen, Zusammenarbeit oder Konflikte, Grenzen und Kommunikationsmuster.',
            '### ZIELE\n- Belegte individuelle, gemeinsame oder gegensätzliche Ziele sowie beobachtete Fortschritte oder Hindernisse.',
            '### BEOBACHTUNGEN UND OFFENE FRAGEN\n- Beleggestützte Beobachtungen; Interpretationen von Fakten trennen. Nur durch den Kontext aufgeworfene Unklarheiten, keine Vorhersagen oder Handlungsvorschläge.',
            '### ZUSAMMENFASSUNG\n- Ein knapper, sachlicher Absatz über die aktuelle Beziehung.',
        ],
    },
    es: {
        prompt: `Resume la relación entre {{user}} y {{char}} basándote únicamente en las escenas y el contexto establecido. Describe su naturaleza real, la perspectiva de cada participante, confianza o desconfianza, cooperación o conflicto, límites, comunicación, objetivos compartidos o contrapuestos y cambios significativos.

Las relaciones pueden ser amistosas, familiares, profesionales, hostiles, románticas, mixtas o indefinidas. No presupongas atracción, reciprocidad, mayor cercanía ni un futuro determinado. Incluye aspectos románticos o sexuales solo si el material los establece explícitamente. La amabilidad, los cuidados, la proximidad física o la cooperación por sí solos no demuestran atracción.

Distingue hechos, interpretaciones e incertidumbre. Describe conductas observables sin afirmar motivos o sentimientos no expresados. Marca las interpretaciones como tentativas; una revisión rutinaria por sí sola no demuestra desconfianza. Al actualizar un informe, conserva los antecedentes respaldados, corrige afirmaciones contradichas y no uses especulaciones ni puntuaciones previas como pruebas. Usa el formato actual sin conservar escalas antiguas. Describe la relación con palabras, sin puntuaciones numéricas. No inventes acontecimientos futuros, propongas desarrollos de la trama ni indiques cómo deben actuar los personajes. Si faltan pruebas, indica que no está establecido.`,
        sections: [
            '### DINÁMICA DE LA RELACIÓN\n- Relación establecida y perspectiva de cada participante; diferencias o incertidumbres.',
            '### CAMBIOS RECIENTES Y PRUEBAS\n- Cambios significativos respaldados por acontecimientos o citas breves; indica si no hubo cambios.',
            '### CONFIANZA, LÍMITES Y COMUNICACIÓN\n- Confianza o desconfianza demostrada, cooperación o conflicto, límites y patrones de comunicación.',
            '### OBJETIVOS\n- Objetivos individuales, compartidos o contrapuestos establecidos y avances u obstáculos observados.',
            '### OBSERVACIONES Y PREGUNTAS ABIERTAS\n- Observaciones respaldadas; separa interpretaciones de hechos. Solo incertidumbres planteadas por el contexto, sin predicciones ni propuestas de trama.',
            '### RESUMEN\n- Un párrafo breve y factual sobre la relación actual.',
        ],
    },
    fr: {
        prompt: `Résume la relation entre {{user}} et {{char}} uniquement à partir des scènes fournies et du contexte établi. Décris sa nature réelle, le point de vue de chaque personne, la confiance ou la méfiance, la coopération ou les conflits, les limites, la communication, les objectifs communs ou opposés et les changements significatifs.

La relation peut être amicale, familiale, professionnelle, hostile, romantique, mixte ou indéfinie. Ne présume ni attirance, ni réciprocité, ni rapprochement, ni avenir particulier. Mentionne les aspects romantiques ou sexuels seulement si le contenu les établit explicitement. La gentillesse, les soins, la proximité physique ou la coopération ne prouvent pas à eux seuls une attirance.

Distingue faits, interprétations et incertitudes. Décris les comportements observables sans affirmer des motivations ou sentiments inexprimés. Présente les interprétations comme provisoires ; une vérification de routine ne prouve pas à elle seule la méfiance. Lors d'une mise à jour, conserve les antécédents étayés, corrige les affirmations contredites et ne prends pas les anciennes spéculations ou notes chiffrées pour des preuves. Utilise le format actuel sans reprendre les anciennes échelles. Décris la relation avec des mots, sans notation numérique. N'invente pas d'événements futurs, ne suggère pas d'intrigue et ne dicte pas la conduite des personnages. Si les preuves manquent, indique que ce n'est pas établi.`,
        sections: [
            '### DYNAMIQUE DE LA RELATION\n- Relation établie et point de vue de chaque personne ; différences ou incertitudes.',
            '### CHANGEMENTS RÉCENTS ET ÉLÉMENTS PROBANTS\n- Changements significatifs étayés par des événements ou de brèves citations ; signaler aussi la stabilité.',
            '### CONFIANCE, LIMITES ET COMMUNICATION\n- Confiance ou méfiance démontrée, coopération ou conflits, limites et modes de communication.',
            '### OBJECTIFS\n- Objectifs individuels, communs ou opposés établis, progrès ou obstacles observés.',
            '### OBSERVATIONS ET QUESTIONS OUVERTES\n- Observations étayées ; distinguer interprétations et faits. Seulement les incertitudes soulevées par le contexte, sans prédictions ni propositions de scénario.',
            '### RÉSUMÉ\n- Un paragraphe bref et factuel sur la relation actuelle.',
        ],
    },
    pt: {
        prompt: `Resuma a relação entre {{user}} e {{char}} usando apenas as cenas fornecidas e o contexto estabelecido. Descreva sua natureza real, a perspectiva de cada participante, confiança ou desconfiança, cooperação ou conflito, limites, comunicação, objetivos comuns ou conflitantes e mudanças significativas.

Relações podem ser de amizade, familiares, profissionais, hostis, românticas, mistas ou indefinidas. Não presuma atração, reciprocidade, aproximação crescente nem um futuro específico. Inclua aspectos românticos ou sexuais somente quando explicitamente estabelecidos no material. Gentileza, cuidado, proximidade física ou cooperação, por si só, não demonstram atração.

Diferencie fatos, interpretações e incertezas. Descreva comportamentos observáveis sem afirmar motivos ou sentimentos não expressos. Marque interpretações como provisórias; uma verificação rotineira, por si só, não demonstra desconfiança. Ao atualizar um relatório, preserve o histórico fundamentado, corrija afirmações contraditas e não trate especulações ou pontuações anteriores como provas. Use o formato atual sem manter escalas antigas. Descreva a relação em palavras, sem pontuações numéricas. Não invente eventos futuros, proponha rumos para a trama nem diga como os personagens devem agir. Na ausência de evidências, indique que não está estabelecido.`,
        sections: [
            '### DINÂMICA DA RELAÇÃO\n- Relação estabelecida e perspectiva de cada participante; diferenças e incertezas.',
            '### MUDANÇAS RECENTES E EVIDÊNCIAS\n- Mudanças significativas apoiadas por eventos ou citações breves; indique quando nada mudou.',
            '### CONFIANÇA, LIMITES E COMUNICAÇÃO\n- Confiança ou desconfiança demonstrada, cooperação ou conflito, limites e padrões de comunicação.',
            '### OBJETIVOS\n- Objetivos individuais, comuns ou conflitantes estabelecidos e avanços ou obstáculos observados.',
            '### OBSERVAÇÕES E QUESTÕES EM ABERTO\n- Observações fundamentadas; diferencie interpretações de fatos. Apenas incertezas levantadas pelo contexto, sem previsões nem sugestões de enredo.',
            '### RESUMO\n- Um parágrafo breve e factual sobre a relação atual.',
        ],
    },
    id: {
        prompt: `Ringkas hubungan antara {{user}} dan {{char}} hanya berdasarkan adegan yang diberikan dan konteks yang telah ditetapkan. Jelaskan sifat hubungan yang sebenarnya, sudut pandang masing-masing, kepercayaan atau ketidakpercayaan, kerja sama atau konflik, batasan, komunikasi, tujuan bersama atau bertentangan, serta perubahan penting.

Hubungan dapat berupa pertemanan, keluarga, profesional, permusuhan, romantis, campuran, atau belum jelas. Jangan mengasumsikan ketertarikan, perasaan timbal balik, kedekatan yang meningkat, atau masa depan tertentu. Sertakan aspek romantis atau seksual hanya jika dinyatakan secara jelas dalam materi. Kebaikan, kepedulian, kedekatan fisik, atau kerja sama saja tidak membuktikan ketertarikan.

Bedakan fakta, penafsiran, dan ketidakpastian. Jelaskan perilaku yang dapat diamati tanpa menyatakan motif atau perasaan yang tidak diungkapkan. Tandai penafsiran sebagai sementara; pemeriksaan rutin saja tidak membuktikan ketidakpercayaan. Saat memperbarui laporan, pertahankan riwayat yang didukung bukti, koreksi klaim yang terbantahkan, dan jangan anggap spekulasi atau skor lama sebagai bukti. Gunakan format terbaru tanpa skala penilaian lama. Jelaskan hubungan dengan kata-kata, tanpa skor angka. Jangan mengarang peristiwa masa depan, menyarankan perkembangan alur, atau mengarahkan tindakan karakter. Jika bukti tidak ada, nyatakan bahwa hal tersebut belum ditetapkan.`,
        sections: [
            '### DINAMIKA HUBUNGAN\n- Hubungan yang telah ditetapkan dan sudut pandang masing-masing; perbedaan atau ketidakpastian.',
            '### PERUBAHAN TERBARU DAN BUKTI\n- Perubahan penting beserta peristiwa atau kutipan singkat pendukung; nyatakan jika tidak ada perubahan.',
            '### KEPERCAYAAN, BATASAN, DAN KOMUNIKASI\n- Kepercayaan atau ketidakpercayaan yang ditunjukkan, kerja sama atau konflik, batasan, dan pola komunikasi.',
            '### TUJUAN\n- Tujuan pribadi, bersama, atau bertentangan yang telah ditetapkan serta kemajuan atau hambatan yang teramati.',
            '### PENGAMATAN DAN PERTANYAAN TERBUKA\n- Pengamatan berbasis bukti; pisahkan penafsiran dari fakta. Hanya ketidakpastian dari konteks, tanpa prediksi atau saran alur cerita.',
            '### RINGKASAN\n- Satu paragraf singkat dan faktual tentang hubungan saat ini.',
        ],
    },
    ms: {
        prompt: `Ringkaskan hubungan antara {{user}} dan {{char}} berdasarkan adegan yang diberikan dan konteks yang telah ditetapkan sahaja. Huraikan sifat hubungan sebenar, perspektif setiap individu, kepercayaan atau ketidakpercayaan, kerjasama atau konflik, batasan, komunikasi, matlamat bersama atau bercanggah, dan perubahan penting.

Hubungan boleh bersifat persahabatan, kekeluargaan, profesional, permusuhan, romantik, campuran, atau belum jelas. Jangan andaikan tarikan, perasaan berbalas, keakraban yang meningkat, atau masa depan tertentu. Sertakan aspek romantik atau seksual hanya apabila dinyatakan dengan jelas dalam bahan. Kebaikan, penjagaan, kedekatan fizikal, atau kerjasama sahaja tidak membuktikan tarikan.

Bezakan fakta, tafsiran, dan ketidakpastian. Huraikan tingkah laku yang dapat diperhatikan tanpa mendakwa motif atau perasaan yang tidak dinyatakan. Tandakan tafsiran sebagai tentatif; semakan rutin sahaja tidak membuktikan ketidakpercayaan. Semasa mengemas kini laporan, kekalkan sejarah yang disokong bukti, betulkan dakwaan yang disangkal, dan jangan anggap spekulasi atau skor lama sebagai bukti. Gunakan format semasa tanpa skala penilaian lama. Huraikan hubungan dengan perkataan, tanpa skor berangka. Jangan reka peristiwa masa depan, cadangkan perkembangan plot, atau arahkan tindakan watak. Jika tiada bukti, nyatakan bahawa perkara itu belum ditetapkan.`,
        sections: [
            '### DINAMIK HUBUNGAN\n- Hubungan yang telah ditetapkan dan perspektif setiap individu; perbezaan atau ketidakpastian.',
            '### PERUBAHAN TERKINI DAN BUKTI\n- Perubahan penting dengan peristiwa atau petikan ringkas yang menyokongnya; nyatakan jika tiada perubahan.',
            '### KEPERCAYAAN, BATASAN, DAN KOMUNIKASI\n- Kepercayaan atau ketidakpercayaan yang ditunjukkan, kerjasama atau konflik, batasan, dan corak komunikasi.',
            '### MATLAMAT\n- Matlamat individu, bersama, atau bercanggah yang telah ditetapkan serta kemajuan atau halangan yang diperhatikan.',
            '### PEMERHATIAN DAN SOALAN TERBUKA\n- Pemerhatian berasaskan bukti; bezakan tafsiran daripada fakta. Hanya ketidakpastian daripada konteks, tanpa ramalan atau cadangan plot.',
            '### RINGKASAN\n- Satu perenggan ringkas dan berfakta tentang hubungan semasa.',
        ],
    },
    ru: {
        prompt: `Опиши отношения между {{user}} и {{char}}, опираясь только на предоставленные сцены и установленный контекст. Отрази реальный характер отношений, точку зрения каждого участника, доверие или недоверие, сотрудничество или конфликт, границы, общение, общие или противоречащие цели и значимые изменения.

Отношения могут быть дружескими, семейными, профессиональными, враждебными, романтическими, смешанными или неопределёнными. Не предполагай влечение, взаимность, нарастающую близость или определённое будущее. Упоминай романтические или сексуальные аспекты только при явном подтверждении в материале. Доброта, забота, физическая близость или сотрудничество сами по себе не доказывают влечение.

Разделяй факты, интерпретации и неопределённость. Описывай наблюдаемое поведение, не утверждая невысказанные мотивы или чувства. Помечай интерпретации как предположения; обычная проверка сама по себе не доказывает недоверие. Обновляя отчёт, сохраняй подтверждённую историю, исправляй опровергнутые утверждения и не считай прежние догадки или баллы доказательствами. Используй текущий формат без старых шкал. Описывай отношения словами, без числовых оценок. Не выдумывай будущие события, не предлагай развитие сюжета и не указывай персонажам, как действовать. При отсутствии доказательств укажи, что это не установлено.`,
        sections: [
            '### ДИНАМИКА ОТНОШЕНИЙ\n- Установленные отношения и точка зрения каждого участника; различия и неопределённость.',
            '### НЕДАВНИЕ ИЗМЕНЕНИЯ И ДОКАЗАТЕЛЬСТВА\n- Значимые изменения с подтверждающими событиями или краткими цитатами; отметь отсутствие изменений.',
            '### ДОВЕРИЕ, ГРАНИЦЫ И ОБЩЕНИЕ\n- Проявленное доверие или недоверие, сотрудничество или конфликт, границы и особенности общения.',
            '### ЦЕЛИ\n- Установленные личные, общие или противоречащие цели, наблюдаемые успехи или препятствия.',
            '### НАБЛЮДЕНИЯ И ОТКРЫТЫЕ ВОПРОСЫ\n- Обоснованные наблюдения; отделяй интерпретации от фактов. Только неопределённости из контекста, без предсказаний и предложений по сюжету.',
            '### ИТОГ\n- Один краткий фактический абзац о текущих отношениях.',
        ],
    },
    ja: {
        prompt: `提示されたシーンと確立された文脈だけに基づき、{{user}}と{{char}}の関係を要約してください。実際の関係の性質、それぞれの視点、信頼または不信、協力または対立、境界線、意思疎通、共通または相反する目標、重要な変化を記述してください。

関係は友人、家族、仕事上、敵対、恋愛、複合的、未確定などさまざまです。好意や欲望、相互性、親密さの増加、特定の将来を前提にしないでください。恋愛や性的な側面は資料で明確に示されている場合だけ含めてください。親切、世話、身体的な近さ、協力だけでは恋愛的・性的な魅力の証拠になりません。

事実、解釈、不確実性を区別してください。語られていない動機や感情を断定せず、観察できる行動を記述してください。解釈は暫定的なものと明示してください。通常の確認作業だけで不信があるとはいえません。以前の報告を更新する際は、裏付けのある過去を保持し、反証された主張を修正し、以前の憶測や点数を証拠として扱わないでください。古い採点欄を引き継がず、現在の回答形式を使ってください。関係を数値ではなく言葉で記述してください。未来の出来事を創作したり、物語の展開を提案したり、登場人物の行動を指示したりしないでください。証拠がなければ未確定と明記してください。`,
        sections: [
            '### 関係のあり方\n- 確立された関係と各人の視点。違いや不確実性を示す。',
            '### 最近の変化と根拠\n- 重要な変化と、それを裏付ける出来事や短い引用。変化がなければ明記する。',
            '### 信頼、境界線、意思疎通\n- 実際に示された信頼や不信、協力や対立、境界線、意思疎通の傾向。',
            '### 目標\n- 確立された個人の目標、共通または相反する目標、観察された進展や障害。',
            '### 観察と未解決の問い\n- 根拠のある観察。解釈と事実を分け、文脈で生じた不明点だけを記す。予測や物語の提案はしない。',
            '### 要約\n- 現在の関係について、簡潔で事実に基づく一段落。',
        ],
    },
    ko: {
        prompt: `제공된 장면과 확립된 맥락만을 근거로 {{user}}와 {{char}}의 관계를 요약하세요. 실제 관계의 성격, 각 참여자의 관점, 신뢰 또는 불신, 협력 또는 갈등, 경계, 의사소통, 공통되거나 상충하는 목표와 중요한 변화를 설명하세요.

관계는 우정, 가족, 업무, 적대, 연애, 복합적 관계 또는 미정일 수 있습니다. 끌림, 상호성, 친밀감의 증가나 특정한 미래를 가정하지 마세요. 연애나 성적인 측면은 자료에서 명확히 확립된 경우에만 포함하세요. 친절, 돌봄, 물리적 근접성이나 협력만으로 끌림이 입증되지는 않습니다.

사실, 해석과 불확실성을 구분하세요. 표현되지 않은 동기나 감정을 단정하지 말고 관찰 가능한 행동을 설명하세요. 해석은 잠정적이라고 명시하세요. 일상적인 확인만으로 불신이 입증되지는 않습니다. 이전 보고서를 갱신할 때 근거 있는 과거는 유지하고, 반박된 주장은 수정하며, 이전의 추측이나 점수를 증거로 취급하지 마세요. 과거의 점수 항목을 유지하지 말고 현재 응답 형식을 사용하세요. 관계를 숫자가 아닌 말로 설명하세요. 미래 사건을 지어내거나 이야기 전개를 제안하거나 등장인물의 행동을 지시하지 마세요. 근거가 없으면 확립되지 않았다고 명시하세요.`,
        sections: [
            '### 관계의 양상\n- 확립된 관계와 각 참여자의 관점. 차이점이나 불확실성 명시.',
            '### 최근 변화와 근거\n- 중요한 변화와 이를 뒷받침하는 사건 또는 짧은 인용. 변화가 없는 경우도 명시.',
            '### 신뢰, 경계와 의사소통\n- 드러난 신뢰 또는 불신, 협력 또는 갈등, 경계와 의사소통 양상.',
            '### 목표\n- 확립된 개인적, 공통적 또는 상충하는 목표와 관찰된 진전이나 장애물.',
            '### 관찰과 미해결 질문\n- 근거에 기반한 관찰. 해석과 사실을 구분하고 맥락에서 제기된 불확실성만 기록. 예측이나 이야기 제안 금지.',
            '### 요약\n- 현재 관계에 대한 간결하고 사실적인 한 문단.',
        ],
    },
    'zh-cn': {
        prompt: `仅根据提供的场景和已确立的背景，总结{{user}}与{{char}}之间的关系。描述关系的实际性质、各自的视角、信任或不信任、合作或冲突、界限、沟通、共同或相互冲突的目标，以及重要变化。

关系可以是朋友、家人、工作关系、敌对、恋爱、混合或尚未明确。不要假定存在吸引力、双向感情、日益亲近或特定的未来。只有材料明确确立时，才包含恋爱或性方面的内容。友善、照顾、身体距离近或合作本身不代表吸引力。

区分事实、解读和不确定性。描述可观察的行为，不要断言未表达的动机或感情。将解读标为暂时的推测；例行核查本身不代表不信任。更新旧报告时，保留有依据的历史，纠正被证据否定的说法，不要把旧的猜测或评分当作证据。使用当前回复格式，不沿用旧的评分部分。用文字描述关系，不进行数字评分。不要编造未来事件、建议剧情发展或指示角色如何行动。缺少证据时，请注明尚未确立。`,
        sections: [
            '### 关系动态\n- 已确立的关系与各自的视角；注明差异或不确定性。',
            '### 近期变化与证据\n- 重要变化及其依据的事件或简短引语；没有变化时也请注明。',
            '### 信任、界限与沟通\n- 实际表现出的信任或不信任、合作或冲突、界限及沟通方式。',
            '### 目标\n- 已确立的个人、共同或相互冲突的目标，以及观察到的进展或障碍。',
            '### 观察与未解问题\n- 有证据支持的观察；区分解读与事实。仅记录背景中产生的不确定性，不作预测或剧情建议。',
            '### 总结\n- 用一段简明、客观的文字总结当前关系。',
        ],
    },
    'zh-tw': {
        prompt: `僅根據提供的場景和已確立的背景，總結{{user}}與{{char}}之間的關係。描述關係的實際性質、各自的觀點、信任或不信任、合作或衝突、界限、溝通、共同或相互衝突的目標，以及重要變化。

關係可以是朋友、家人、工作關係、敵對、戀愛、混合或尚未明確。不要假定存在吸引力、雙向感情、日益親近或特定的未來。只有材料明確確立時，才包含戀愛或性方面的內容。友善、照顧、身體距離近或合作本身不代表吸引力。

區分事實、解讀和不確定性。描述可觀察的行為，不要斷言未表達的動機或感情。將解讀標為暫時的推測；例行核查本身不代表不信任。更新舊報告時，保留有依據的歷史，修正被證據否定的說法，不要把舊的猜測或評分當作證據。使用目前的回覆格式，不沿用舊的評分部分。用文字描述關係，不進行數字評分。不要編造未來事件、建議劇情發展或指示角色如何行動。缺少證據時，請註明尚未確立。`,
        sections: [
            '### 關係動態\n- 已確立的關係與各自的觀點；註明差異或不確定性。',
            '### 近期變化與證據\n- 重要變化及其依據的事件或簡短引語；沒有變化時也請註明。',
            '### 信任、界限與溝通\n- 實際表現出的信任或不信任、合作或衝突、界限及溝通方式。',
            '### 目標\n- 已確立的個人、共同或相互衝突的目標，以及觀察到的進展或障礙。',
            '### 觀察與未解問題\n- 有證據支持的觀察；區分解讀與事實。僅記錄背景中產生的不確定性，不作預測或劇情建議。',
            '### 總結\n- 用一段簡明、客觀的文字總結目前的關係。',
        ],
    },
};

for (const defaults of Object.values(RELATIONSHIP_DEFAULTS)) {
    defaults.responseFormat = defaults.sections.join('\n\n');
}

export const DEFAULT_STATUS_PROMPT = RELATIONSHIP_DEFAULTS.en.prompt;
export const DEFAULT_STATUS_RESPONSE_FORMAT = RELATIONSHIP_DEFAULTS.en.responseFormat;
