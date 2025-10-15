/**
 * Chinese (Simplified, zh-CN) locale data for Memory Books
 *
 * Notes for translators:
 * - Only a subset is provided as a scaffold. Missing keys will safely fall back to English via i18n.js.
 * - Keep placeholders intact (e.g., {{name}}, {{count}}, {{date}}, {{time}}).
 * - Preserve any embedded HTML or code fragments (e.g., <strong>{{name}}</strong>, <code>...</code>).
 * - Emoji should remain as-is.
 */
export const localeData_zh_cn = {
    // Main Settings / Menu
    'STMemoryBooks_Settings': '📕 记忆书设置',
    'STMemoryBooks_MenuItem': '记忆书',
    'STMemoryBooks_Close': '关闭',
    'STMemoryBooks_NoMatches': '无匹配',

    // Common buttons
    'STMemoryBooks_CreateMemory': '创建记忆',
    'STMemoryBooks_ClearSceneBtn': '清除场景',
    'STMemoryBooks_NoSceneSelected': '未选择场景。请先设置开始和结束点。',

    // Scene Display
    'STMemoryBooks_CurrentScene': '当前场景：',
    'STMemoryBooks_Start': '开始',
    'STMemoryBooks_End': '结束',
    'STMemoryBooks_Message': '消息',
    'STMemoryBooks_Messages': '消息',
    'STMemoryBooks_EstimatedTokens': '预估 tokens',
    'STMemoryBooks_NoSceneMarkers': '未设置场景标记。请先使用消息中的按钮标记开始 (►) 与结束 (◄)。',

    // Side Prompt Picker
    'STMemoryBooks_RunSidePrompt': '运行侧边提示',
    'STMemoryBooks_SearchSidePrompts': '搜索侧边提示...',

    // Labels / Info
    'STMemoryBooks_Label_TotalTokens': '总 tokens：{{count}}',
    'STMemoryBooks_Label_TotalTokensCalculating': '总 tokens：计算中...',

    // Toast / Title
    'index.toast.title': 'STMemoryBooks',

    // A few toasts as examples
    'STMemoryBooks_Toast_ProfileSaved': '配置 "{{name}}" 保存成功',
    'STMemoryBooks_Toast_ProfileSaveFailed': '保存配置失败：{{message}}',
    'STMemoryBooks_Toast_TitleCannotBeEmpty': '记忆标题不能为空',
    'STMemoryBooks_Toast_ContentCannotBeEmpty': '记忆内容不能为空',

    // Auto-Summary examples
    'STMemoryBooks_AutoSummaryReadyTitle': '自动摘要已就绪',
    'STMemoryBooks_Button_SelectLorebook': '选择词典',
    'STMemoryBooks_Button_Postpone': '推迟',

    // Misc small examples
    'STMemoryBooks_Save': '保存',
    'STMemoryBooks_Cancel': '取消',
};
