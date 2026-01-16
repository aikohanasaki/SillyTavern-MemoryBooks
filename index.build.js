var I7=Object.create;var{getPrototypeOf:L7,defineProperty:R8,getOwnPropertyNames:Q4,getOwnPropertyDescriptor:w7}=Object,G4=Object.prototype.hasOwnProperty;var E6=(Z,Q,G)=>{G=Z!=null?I7(L7(Z)):{};let J=Q||!Z||!Z.__esModule?R8(G,"default",{value:Z,enumerable:!0}):G;for(let W of Q4(Z))if(!G4.call(J,W))R8(J,W,{get:()=>Z[W],enumerable:!0});return J},Z4=new WeakMap,C7=(Z)=>{var Q=Z4.get(Z),G;if(Q)return Q;if(Q=R8({},"__esModule",{value:!0}),Z&&typeof Z==="object"||typeof Z==="function")Q4(Z).map((J)=>!G4.call(Q,J)&&R8(Q,J,{get:()=>Z[J],enumerable:!(G=w7(Z,J))||G.enumerable}));return Z4.set(Z,Q),Q},n1=(Z,Q)=>()=>(Q||Z((Q={exports:{}}).exports,Q),Q.exports);var $4=(Z,Q)=>{for(var G in Q)R8(Z,G,{get:Q[G],enumerable:!0,configurable:!0,set:(J)=>Q[G]=()=>J})};var N1=(Z,Q)=>()=>(Z&&(Q=Z(Z=0)),Q);var J4=((Z)=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(Z,{get:(Q,G)=>(typeof require<"u"?require:Q)[G]}):Z)(function(Z){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+Z+'" is not supported')});var i8,E0,b6,s1,s0,_8,l8,c$,p$;var D1=N1(()=>{i8={MAX_RETRIES:2,RETRY_DELAY_MS:2000,TOKEN_WARNING_THRESHOLD_DEFAULT:50000,DEFAULT_MEMORY_COUNT:0},E0={MAX_SCAN_RANGE:100,MAX_AFFECTED_MESSAGES:200,BUTTON_UPDATE_DEBOUNCE_MS:50,VALIDATION_DELAY_MS:500},b6={INPUT_DEBOUNCE_MS:1000,CHAT_OBSERVER_DEBOUNCE_MS:50},s1={PROMPTS_FILE:"stmb-summary-prompts.json",SIDE_PROMPTS_FILE:"stmb-side-prompts.json",ARC_PROMPTS_FILE:"stmb-arc-prompts.json"},s0={CURRENT_VERSION:1},_8={summary:"Summary - Detailed beat-by-beat summaries in narrative prose",summarize:"Summarize - Bullet-point format",synopsis:"Synopsis - Long and comprehensive (beats, interactions, details) with headings",sumup:"Sum Up - Concise story beats in narrative prose",minimal:"Minimal - Brief 1-2 sentence summary",northgate:"Northgate - Intended for creative writing. By Northgate on ST Discord",aelemar:"Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord",comprehensive:"Comprehensive - Synopsis plus improved keywords extraction"},l8={summary:"STMemoryBooks_DisplayName_summary",summarize:"STMemoryBooks_DisplayName_summarize",synopsis:"STMemoryBooks_DisplayName_synopsis",sumup:"STMemoryBooks_DisplayName_sumup",minimal:"STMemoryBooks_DisplayName_minimal",northgate:"STMemoryBooks_DisplayName_northgate",aelemar:"STMemoryBooks_DisplayName_aelemar",comprehensive:"STMemoryBooks_DisplayName_comprehensive"},c$=E0.MAX_SCAN_RANGE,p$=E0.MAX_AFFECTED_MESSAGES});import{chat as a1,chat_metadata as o$}from"../../../../script.js";import{saveMetadataDebounced as h7,getContext as M7}from"../../../extensions.js";import{t as t$,translate as M0}from"../../../i18n.js";function f(){let Q=M7().chatMetadata;if(!Q)return{sceneStart:null,sceneEnd:null};if(!Q.STMemoryBooks)Q.STMemoryBooks={};return Q.STMemoryBooks.sceneStart=V0.start??Q.STMemoryBooks.sceneStart??null,Q.STMemoryBooks.sceneEnd=V0.end??Q.STMemoryBooks.sceneEnd??null,Q.STMemoryBooks}function Z0(){h7()}function q4(){let Q=f()?.highestMemoryProcessed;return Number.isFinite(Q)?Q:null}function o8(Z,Q,G,J){let W=v7(Z,Q,G,J);if(W.needsFullUpdate){n8();return}if(W.min===null||W.max===null)return;let q="#chat .mes[mesid]",Y=document.querySelectorAll(q),z=Array.from(Y).filter((K)=>{let X=parseInt(K.getAttribute("mesid")),V=W.min!==null?X>=W.min:!0,F=W.max!==null&&W.max!==void 0?X<=W.max:!0;return V&&F});if(z.length>0){let K=f();f6(z,K)}}function v7(Z,Q,G,J){let W=new Set;if(Z!==null&&Q!==null)for(let Y=Z;Y<=Q;Y++)W.add(Y);if(Z!==null)W.add(Z);if(Q!==null)W.add(Q);if(G!==null&&J!==null)for(let Y=G;Y<=J;Y++)W.add(Y);if(G!==null)W.add(G);if(J!==null)W.add(J);if(G!==null&&J===null){let Y=Math.min(G+E0.MAX_SCAN_RANGE,a1.length-1);for(let z=G+1;z<=Y;z++)W.add(z)}if(J!==null&&G===null){let Y=Math.max(J-E0.MAX_SCAN_RANGE,0);for(let z=Y;z<J;z++)W.add(z)}if(Z!==null&&Q===null&&G!==null&&J!==null){let Y=Math.min(Z+E0.MAX_SCAN_RANGE,a1.length-1);for(let z=J+1;z<=Y;z++)W.add(z)}if(Q!==null&&Z===null&&G!==null&&J!==null){let Y=Math.max(Q-E0.MAX_SCAN_RANGE,0);for(let z=Y;z<G;z++)W.add(z)}if(W.size===0)return{min:null,max:null,needsFullUpdate:!1};if(W.size>E0.MAX_AFFECTED_MESSAGES)return{needsFullUpdate:!0};let q=Array.from(W).sort((Y,z)=>Y-z);return{min:q[0],max:q[q.length-1],needsFullUpdate:!1}}function W4(Z,Q){let G=f(),J=G.sceneStart??null,W=G.sceneEnd??null,q=P7(G,Z,Q);return G.sceneStart=q.start,G.sceneEnd=q.end,V0.start=q.start,V0.end=q.end,Z0(),o8(J,W,q.start,q.end),Promise.resolve()}function y6(Z,Q){let G=f(),J=G.sceneStart??null,W=G.sceneEnd??null,q=Number(Z),Y=Number(Q);G.sceneStart=q,G.sceneEnd=Y,V0.start=q,V0.end=Y,Z0(),o8(J,W,q,Y)}function t1(){let Z=f(),Q=Z.sceneStart??null,G=Z.sceneEnd??null;Z.sceneStart=null,Z.sceneEnd=null,V0.start=null,V0.end=null,Z0(),n8()}function n8(){let Z=f(),Q=document.querySelectorAll("#chat .mes[mesid]");f6(Q,Z)}function Y4(Z){if(!Z||Z.length===0)return;let Q=f();f6(Z,Q)}function f6(Z,Q){let{sceneStart:G,sceneEnd:J}=Q;Z.forEach((W)=>{let q=parseInt(W.getAttribute("mesid")),Y=W.querySelector(".mes_stmb_start"),z=W.querySelector(".mes_stmb_end");if(!Y||!z)return;if(Y.classList.remove("on","valid-start-point","in-scene"),z.classList.remove("on","valid-end-point","in-scene"),G!=null&&J!=null){if(q===G)Y.classList.add("on");else if(q===J)z.classList.add("on");else if(q>G&&q<J)Y.classList.add("in-scene"),z.classList.add("in-scene")}else if(G!=null){if(q===G)Y.classList.add("on");else if(q>G)z.classList.add("valid-end-point")}else if(J!=null){if(q===J)z.classList.add("on");else if(q<J)Y.classList.add("valid-start-point")}})}function r1(){let Z=f(),Q=Z.sceneStart??null,G=Z.sceneEnd??null,J=!1,W=a1.length;if(W===0){if(Z.sceneStart!==null||Z.sceneEnd!==null)Z.sceneStart=null,Z.sceneEnd=null,J=!0}else{if(Z.sceneStart!==null&&Z.sceneStart<0)Z.sceneStart=null,J=!0;if(Z.sceneEnd!==null&&Z.sceneEnd<0)Z.sceneEnd=null,J=!0;if(Z.sceneStart!==null&&Z.sceneStart>=W)Z.sceneStart=null,J=!0;if(Z.sceneEnd!==null&&Z.sceneEnd>=W)Z.sceneEnd=W-1,J=!0;if(Z.sceneStart!==null&&Z.sceneEnd!==null&&Z.sceneStart>Z.sceneEnd)Z.sceneStart=null,Z.sceneEnd=null,J=!0}if(J)V0.start=Z.sceneStart,V0.end=Z.sceneEnd,Z0(),o8(Q,G,Z.sceneStart,Z.sceneEnd)}function z4(Z,Q){let G=Number(Z);if(!Number.isFinite(G))return;let J=f(),W=J.sceneStart??null,q=J.sceneEnd??null,Y=J.sceneStart,z=J.sceneEnd,K="";if(Y===G&&z===G){if(t1(),Q?.moduleSettings?.showNotifications)toastr.warning(M0("Scene cleared due to start marker deletion","STMemoryBooks_Toast_SceneClearedStart"),"STMemoryBooks");r1();return}if(Y!=null&&z!=null){if(G<Y)Y--,z--,K=M0("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===Y){if(Y=null,z!=null&&z>G)z--;K=M0("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(G>Y&&G<z)z--,K=M0("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===z)z=null,K=M0("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(Y!=null){if(G<Y)Y--,K=M0("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===Y)Y=null,K=M0("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(z!=null){if(G<z)z--,K=M0("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===z)z=null,K=M0("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else{r1();return}let X=a1.length;if(X===0)Y=null,z=null;else{if(Y!=null&&(Y<0||Y>=X))Y=null;if(z!=null&&(z<0||z>=X))z=X-1;if(Y!=null&&z!=null&&Y>z)Y=null,z=null}if(Y!==J.sceneStart||z!==J.sceneEnd){if(J.sceneStart=Y,J.sceneEnd=z,V0.start=Y,V0.end=z,Z0(),o8(W,q,Y,z),K&&Q?.moduleSettings?.showNotifications)toastr.warning(K,"STMemoryBooks")}r1()}function s8(Z){let Q=parseInt(Z.getAttribute("mesid")),G=Z.querySelector(".extraMesButtons");if(!G){G=document.createElement("div"),G.classList.add("extraMesButtons");let q=Z.querySelector(".mes_block");if(q)q.appendChild(G);else Z.appendChild(G)}if(Z.querySelector(".mes_stmb_start"))return;let J=document.createElement("div");J.title=M0("Mark Scene Start","STMemoryBooks_MarkSceneStart"),J.classList.add("mes_stmb_start","mes_button","fa-solid","fa-caret-right","interactable"),J.setAttribute("tabindex","0"),J.setAttribute("data-i18n","[title]STMemoryBooks_MarkSceneStart");let W=document.createElement("div");W.title=M0("Mark Scene End","STMemoryBooks_MarkSceneEnd"),W.classList.add("mes_stmb_end","mes_button","fa-solid","fa-caret-left","interactable"),W.setAttribute("tabindex","0"),W.setAttribute("data-i18n","[title]STMemoryBooks_MarkSceneEnd"),J.addEventListener("click",(q)=>{q.stopPropagation(),W4(Q,"start")}),W.addEventListener("click",(q)=>{q.stopPropagation(),W4(Q,"end")}),G.appendChild(J),G.appendChild(W)}async function I8(){let Z=f();if(Z.sceneStart===null||Z.sceneEnd===null)return null;let Q=a1[Z.sceneStart],G=a1[Z.sceneEnd];if(!Q||!G)return null;let J=(W)=>{let q=W.mes||"";return q.length>100?q.substring(0,100)+"...":q};try{let W=Q8(Z.sceneStart,Z.sceneEnd),q=Z8(W),Y=await k6(q);return{sceneStart:Z.sceneStart,sceneEnd:Z.sceneEnd,startExcerpt:J(Q),endExcerpt:J(G),startSpeaker:Q.name||"Unknown",endSpeaker:G.name||"Unknown",messageCount:Z.sceneEnd-Z.sceneStart+1,estimatedTokens:Y}}catch(W){console.warn("STMemoryBooks-SceneManager: getSceneData failed:",W);try{if((W?.message||"").includes("No visible messages"))toastr?.warning?.(M0("Selected range has no visible messages. Adjust start/end.","STMemoryBooks_NoVisibleMessages"),"STMemoryBooks")}catch{}return null}}function P7(Z,Q,G){let J=parseInt(Q),W=Z.sceneStart,q=Z.sceneEnd;if(G==="start"){if(Z.sceneEnd!==null&&(Z.sceneEnd??null)<J)q=null;W=Z.sceneStart===J?null:J}else if(G==="end"){if(Z.sceneStart!==null&&(Z.sceneStart??null)>J)W=null;q=Z.sceneEnd===J?null:J}return{start:W,end:q}}function r8(){let Z=f();V0.start=Z.sceneStart,V0.end=Z.sceneEnd}function X4(){return{...V0}}var V0;var e1=N1(()=>{a8();D1();V0={start:null,end:null}});import{getRequestHeaders as K4}from"../../../../script.js";import{translate as x7}from"../../../i18n.js";function L8(Z){return Z.replace(/\w\S*/g,(Q)=>{return Q.charAt(0).toUpperCase()+Q.slice(1).toLowerCase()})}function b7(Z){return Z.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)}function V4(Z){let Q=Z.split(`
`).filter((G)=>G.trim());if(Q.length>0){let J=Q[0].trim().replace(/^(You are|Analyze|Create|Generate|Write)\s+/i,"").replace(/[:.]/g,"").trim();return L8(J.substring(0,50))}return"Custom Prompt"}function u6(Z,Q){let G=b7(Z),J=G,W=2,q=R1();while(J in Q||J in q)J=`${G}-${W}`,W++;return J}async function r0(Z=null){if(G8)return G8;let Q=!1,G=null;try{let J=await fetch(`/user/files/${j4}`,{method:"GET",credentials:"include",headers:K4()});if(!J.ok)Q=!0;else{let W=await J.text();if(G=JSON.parse(W),!F4(G))Q=!0}}catch(J){Q=!0}if(Q){let J={},W=new Date().toISOString(),q=R1();for(let[Y,z]of Object.entries(q))J[Y]={displayName:g6[Y]||L8(Y),prompt:z,createdAt:W};if(Z&&Z.profiles&&Array.isArray(Z.profiles)){for(let Y of Z.profiles)if(Y.prompt&&Y.prompt.trim()){let z=`Custom: ${Y.name||"Unnamed Profile"}`,K=u6(z,J);J[K]={displayName:z,prompt:Y.prompt,createdAt:W},console.log(`${I0}: Migrated custom prompt from profile "${Y.name}" as "${K}"`)}}G={version:s0.CURRENT_VERSION,overrides:J},await $8(G)}return G8=G,G8}async function $8(Z){try{let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:K4(),body:JSON.stringify({name:j4,data:G})});if(!J.ok)throw Error(`Failed to save prompts: ${J.statusText}`);G8=Z,console.log(`${I0}: Prompts saved successfully`)}catch(Q){throw console.error(`${I0}: Error saving overrides:`,Q),Q}}function F4(Z){if(!Z||typeof Z!=="object")return console.error(`${I0}: Invalid data type`),!1;if(typeof Z.version!=="number")return console.error(`${I0}: Invalid schema version type: ${Z.version}`),!1;if(Z.version!==s0.CURRENT_VERSION)console.warn(`${I0}: Unexpected schema version: ${Z.version} (expected ${s0.CURRENT_VERSION})`);if(!Z.overrides||typeof Z.overrides!=="object")return console.error(`${I0}: Missing or invalid overrides object`),!1;for(let[Q,G]of Object.entries(Z.overrides)){if(!G||typeof G!=="object")return console.error(`${I0}: Invalid override entry for key: ${Q}`),!1;if(typeof G.prompt!=="string"||!G.prompt.trim())return console.error(`${I0}: Invalid or empty prompt for key: ${Q}`),!1;if(G.displayName!==void 0&&typeof G.displayName!=="string")return console.error(`${I0}: Invalid displayName for key: ${Q}`),!1}return!0}async function J8(Z){return await r0(Z),S7=!0,E7=null,!0}async function T1(Z=null){let Q=await r0(Z),G=[];for(let[W,q]of Object.entries(Q.overrides))G.push({key:W,displayName:q.displayName||L8(W),createdAt:q.createdAt||null});let J=R1()||{};for(let W of Object.keys(J))if(!(W in Q.overrides))G.push({key:W,displayName:g6[W]||L8(W),createdAt:null});return G.sort((W,q)=>{if(!W.createdAt)return 1;if(!q.createdAt)return-1;return new Date(q.createdAt)-new Date(W.createdAt)}),G}async function G1(Z,Q=null){let G=await r0(Q);if(G.overrides[Z]){let W=G.overrides[Z].prompt;if(typeof W==="string"&&W.trim())return W}return R1()[Z]||d0()}async function m6(Z,Q=null){let G=await r0(Q);if(G.overrides[Z]&&G.overrides[Z].displayName)return G.overrides[Z].displayName;return g6[Z]||L8(Z)}async function w8(Z,Q,G){let J=await r0(),W=new Date().toISOString();if(!Z)Z=u6(G||V4(Q),J.overrides);if(J.overrides[Z])J.overrides[Z].prompt=Q,J.overrides[Z].displayName=G||J.overrides[Z].displayName,J.overrides[Z].updatedAt=W;else J.overrides[Z]={displayName:G||V4(Q),prompt:Q,createdAt:W};return await $8(J),Z}async function U4(Z){let Q=await r0(),G=Q.overrides[Z];if(!G)throw Error(`Preset "${Z}" not found`);let J=`${G.displayName} (Copy)`,W=u6(J,Q.overrides),q=new Date().toISOString();return Q.overrides[W]={displayName:J,prompt:G.prompt,createdAt:q},await $8(Q),W}async function H4(Z){let Q=await r0();if(!Q.overrides[Z])throw Error(`Preset "${Z}" not found`);delete Q.overrides[Z],await $8(Q)}async function B4(){let Z=await r0();return JSON.stringify(Z,null,2)}async function O4(Z){try{let Q=JSON.parse(Z);if(!F4(Q))throw Error("Invalid prompts file structure - see console for details");await $8(Q)}catch(Q){throw console.error(`${I0}: Error importing prompts:`,Q),Q}}async function A4(Z="overwrite"){if(Z!=="overwrite")console.warn(`${I0}: Unsupported mode for recreateBuiltInPrompts: ${Z}; defaulting to 'overwrite'`);let Q=await r0(),G=R1(),J=Object.keys(G||{}),W=0;if(Q&&Q.overrides&&typeof Q.overrides==="object"){for(let q of J)if(q in Q.overrides)delete Q.overrides[q],W++}return await $8(Q),G8=Q,console.log(`${I0}: Recreated built-in prompts (removed ${W} overrides)`),{removed:W}}var I0="STMemoryBooks-SummaryPromptManager",j4,G8=null,S7=!1,E7=null,g6;var t8=N1(()=>{b0();D1();j4=s1.PROMPTS_FILE,g6=Object.fromEntries(Object.keys(_8).map((Z)=>[Z,x7(_8[Z],l8[Z])]))});var I4={};$4(I4,{validateProfile:()=>X8,showLorebookSelectionPopup:()=>_1,resolveEffectiveConnectionFromProfile:()=>o6,readIntInput:()=>J0,parseTemperature:()=>n6,normalizeCompletionSource:()=>q0,isValidPreset:()=>p7,getUIModelSettings:()=>Q0,getPresetPrompt:()=>d7,getPresetNames:()=>c7,getEffectivePrompt:()=>I1,getEffectiveLorebookName:()=>z8,getDefaultPrompt:()=>d0,getCurrentModelSettings:()=>m7,getCurrentMemoryBooksContext:()=>Y8,getCurrentApiInfo:()=>o,getBuiltInPresetPrompts:()=>R1,getApiSelectors:()=>l6,generateSafeProfileName:()=>L1,formatPresetDisplayName:()=>i7,estimateTokens:()=>$1,deepClone:()=>q8,createProfileObject:()=>J1,clampInt:()=>K0,SELECTORS:()=>a0});import{chat_metadata as W8,characters as d6,name2 as c6,this_chid as p6}from"../../../../script.js";import{getContext as y7,extension_settings as D4}from"../../../extensions.js";import{selected_group as T4,groups as f7}from"../../../group-chats.js";import{METADATA_KEY as i6,world_names as e8}from"../../../world-info.js";import{Popup as R4,POPUP_TYPE as _4,POPUP_RESULT as Z6}from"../../../popup.js";import{translate as c0}from"../../../i18n.js";function k7(...Z){for(let Q of Z){let G=v0(Q);if(G.length)return G}return v0()}function g7(){return document.querySelector("#group_chat_completion_source")?"#group_":"#"}function J0(Z,Q){if(!Z)return Q;let G=parseInt(Z.value,10);return Number.isFinite(G)?G:Q}function K0(Z,Q,G){return Math.min(Math.max(Z,Q),G)}function q0(Z){let Q=String(Z||"").trim().toLowerCase();if(Q==="google")return"makersuite";return Q===""?"openai":Q}function o(){try{let Z="unknown",Q="unknown",G="unknown";if(typeof window.getGeneratingApi==="function")Z=window.getGeneratingApi();else Z=v0(a0.mainApi).val()||"unknown";if(typeof window.getGeneratingModel==="function")Q=window.getGeneratingModel();if(G=v0(a0.completionSource).val()||Z,!u7.includes(G))console.warn(`${p0}: Unsupported completion source: ${G}, falling back to openai`),G="openai";return{api:Z,model:Q,completionSource:G}}catch(Z){return console.warn(`${p0}: Error getting API info:`,Z),{api:v0(a0.mainApi).val()||"unknown",model:"unknown",completionSource:v0(a0.completionSource).val()||"openai"}}}function l6(){let Z=g7(),G=k7(`${Z}chat_completion_source`,"#chat_completion_source").val?.()||"openai",J={openai:`${Z}model_openai_select`,claude:`${Z}model_claude_select`,openrouter:`${Z}model_openrouter_select`,ai21:`${Z}model_ai21_select`,makersuite:`${Z}model_google_select`,mistralai:`${Z}model_mistralai_select`,custom:`${Z}model_custom_select`,cohere:`${Z}model_cohere_select`,perplexity:`${Z}model_perplexity_select`,groq:`${Z}model_groq_select`,nanogpt:`${Z}model_nanogpt_select`,deepseek:`${Z}model_deepseek_select`,electronhub:`${Z}model_electronhub_select`,vertexai:`${Z}model_vertexai_select`,aimlapi:`${Z}model_aimlapi_select`,xai:`${Z}model_xai_select`,pollinations:`${Z}model_pollinations_select`,moonshot:`${Z}model_moonshot_select`,fireworks:`${Z}model_fireworks_select`,cometapi:`${Z}model_cometapi_select`,azure_openai:`${Z}model_azure_openai_select`},W=J[G]||J.openai,q=`${Z}temp_openai`.replace("##","#"),Y=`${Z}temp_counter_openai`.replace("##","#");return{model:W,temp:q,tempCounter:Y}}function Y8(){try{let Z=null,Q=null,G=null,J=!!T4,W=T4||null,q=null;if(J){let X=f7?.find((V)=>V.id===W);if(X)q=X.name,Q=X.chat_id,G=Q,Z=q}else{if(c6&&c6.trim())Z=String(c6).trim();else if(p6!==void 0&&d6&&d6[p6])Z=d6[p6].name;else if(W8?.character_name)Z=String(W8.character_name).trim();if(Z&&Z.normalize)Z=Z.normalize("NFC");try{let X=y7();if(X?.chatId)Q=X.chatId,G=Q;else if(typeof window.getCurrentChatId==="function")Q=window.getCurrentChatId(),G=Q}catch(X){if(console.warn(`${p0}: Could not get context, trying fallback methods`),typeof window.getCurrentChatId==="function")Q=window.getCurrentChatId(),G=Q}}let Y=null;if(W8&&i6 in W8)Y=W8[i6];let z=null;try{let X=o(),V=l6(),F=v0(V.temp).val()??v0(V.tempCounter).val(),j=Number.isFinite(parseFloat(F))?parseFloat(F):0.7,O=v0(V.model).val()||"";z={api:X.api,model:O,temperature:j,completionSource:X.completionSource,source:"current_ui"}}catch(X){console.warn(`${p0}: Could not get current model/temperature settings:`,X),z=null}let K={characterName:Z,chatId:Q,chatName:G,groupId:W,isGroupChat:J,lorebookName:Y,modelSettings:z};if(J)K.groupName=q;return K}catch(Z){return console.warn(`${p0}: Error getting context:`,Z),{characterName:null,chatId:null,chatName:null,groupId:null,groupName:null,isGroupChat:!1}}}async function z8(){if(!D4.STMemoryBooks.moduleSettings.manualModeEnabled)return W8?.[i6]||null;let Q=f();if(Q.manualLorebook??null)if(e8.includes(Q.manualLorebook))return Q.manualLorebook;else toastr.error(`The designated manual lorebook "${Q.manualLorebook}" no longer exists. Please select a new one.`),delete Q.manualLorebook;let G=e8.map((Y)=>`<option value="${Y}">${Y}</option>`).join("");if(G.length===0)return toastr.error("No lorebooks found to select from.","STMemoryBooks"),null;let J=`
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Manual mode is enabled, but no lorebook has been designated for this chat's memories. Please select one.</p>
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${G}
            </select>
        </div>
    `,W=new R4(J,_4.TEXT,"",{okButton:"Select",cancelButton:"Cancel"});if(await W.show()===Z6.AFFIRMATIVE){let Y=W.dlg.querySelector("#stmb-manual-lorebook-select").value;return Q.manualLorebook=Y,Z0(),toastr.success(`"${Y}" is now the Memory Book for this chat.`,"STMemoryBooks"),Y}return null}async function _1(Z=null){if(e8.length===0)return toastr.error("No lorebooks found to select from.","STMemoryBooks"),null;let Q=e8.map((q)=>{return`<option value="${q}"${q===Z?" selected":""}>${q}</option>`}).join(""),G=`
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Choose which lorebook should be used for this chat's memories.</p>
            ${Z?`<p><strong>Current:</strong> ${Z}</p>`:""}
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${Q}
            </select>
        </div>
    `,J=new R4(G,_4.TEXT,"",{okButton:"Select",cancelButton:"Cancel"});if(await J.show()===Z6.AFFIRMATIVE){let q=J.dlg.querySelector("#stmb-manual-lorebook-select").value;if(q!==Z){let Y=f();return Y.manualLorebook=q,Z0(),toastr.success(`Manual lorebook changed to: ${q}`,"STMemoryBooks"),q}else return q}return null}function m7(Z){try{if(!Z)throw Error("getCurrentModelSettings requires a profile");let Q=Z.effectiveConnection||Z.connection;if(!Q)throw Error("Profile is missing connection");let G=(Q.model||"").trim();if(!G)throw Error("Profile is missing required connection.model");let J=n6(Q.temperature);if(J===null)J=0.7;return{model:G,temperature:J}}catch(Q){throw console.warn(`${p0}: Error getting current model settings:`,Q),Q}}function Q0(){try{let Z=l6(),Q=(v0(Z.model).val()||"").trim(),G=0.7,J=v0(Z.temp).val()||v0(Z.tempCounter).val();if(J!==null&&J!==void 0&&J!==""){let W=parseFloat(J);if(!isNaN(W)&&W>=0&&W<=2)G=W}return{model:Q,temperature:G}}catch(Z){return console.warn(`${p0}: Error getting UI model settings:`,Z),{model:"",temperature:0.7}}}async function $1(Z,Q={}){let{estimatedOutput:G=300}=Q,J=String(Z||""),W=Math.ceil(J.length/4);return{input:W,output:G,total:W+G}}function o6(Z){let Q=Z?.effectiveConnection||Z?.connection||{},G=q0(Q.api||"openai"),J=(Q.model||"").trim(),W=0.7;if(typeof Q.temperature==="number"&&!Number.isNaN(Q.temperature))W=Math.max(0,Math.min(2,Q.temperature));let q=Q.endpoint?String(Q.endpoint):void 0,Y=Q.apiKey?String(Q.apiKey):void 0;return{api:G,model:J,temperature:W,endpoint:q,apiKey:Y}}function R1(){return{summary:c0(`You are a talented summarist skilled at capturing scenes from stories comprehensively. Analyze the following roleplay scene and return a detailed memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Detailed beat-by-beat summary in narrative prose...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a detailed beat-by-beat summary in narrative prose. First, note the dates/time. Then capture this scene accurately without losing ANY important information EXCEPT FOR [OOC] conversation/interaction. All [OOC] conversation/interaction is not useful for summaries.
This summary will go in a vectorized database, so include:
- All important story beats/events that happened
- Key interaction highlights and character developments
- Notable details, memorable quotes, and revelations
- Outcome and anything else important for future interactions between {{user}} and {{char}}
Capture ALL nuance without repeating verbatim. Make it comprehensive yet digestible.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords for vectorized database retrieval. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_summary"),summarize:c0(`Analyze the following roleplay scene and return a structured summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Detailed summary with markdown headers...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a detailed bullet-point summary using markdown with these headers (but skip and ignore all OOC conversation/interaction):
- **Timeline**: Day/time this scene covers.
- **Story Beats**: List all important plot events and story developments that occurred.
- **Key Interactions**: Describe the important character interactions, dialogue highlights, and relationship developments.
- **Notable Details**: Mention any important objects, settings, revelations, or details that might be relevant for future interactions.
- **Outcome**: Summarize the result, resolution, or state of affairs at the end of the scene.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords that would help a vectorized database find this conversation again if something is mentioned. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Ensure you capture ALL important information - comprehensive detail is more important than brevity.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_summarize"),synopsis:c0(`Analyze the following roleplay scene and return a comprehensive synopsis as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Long detailed synopsis with markdown structure...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a long and detailed beat-by-beat summary using markdown structure. Capture the most recent scene accurately without losing ANY information. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded. Use this structure:
# [Scene Title]
**Timeline**: (day/time)
## Story Beats
- (List all important plot events and developments)
## Key Interactions
- (Detail all significant character interactions and dialogue)
## Notable Details
- (Include memorable quotes, revelations, objects, settings)
## Outcome
- (Describe results, resolutions, and final state)

Include EVERYTHING important for future interactions between {{user}} and {{char}}. Capture all nuance without regurgitating verbatim.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords for vectorized database retrieval. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_synopsis"),sumup:c0(`Analyze the following roleplay scene and return a beat summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Comprehensive beat summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, write a comprehensive beat summary that captures this scene completely. Format it as:
# Scene Summary - Day X - [Title]
First note the dates/time covered by the scene. Then narrate ALL important story beats/events that happened, key interaction highlights, notable details, memorable quotes, character developments, and outcome. Ensure no important information is lost. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded. 

For the keywords field, provide 15-30 specific, descriptive, relevant keywords that would help a vectorized database find this summary again if mentioned. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_sumup"),minimal:c0(`Analyze the following roleplay scene and return a minimal memory entry as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Brief 2-5 sentence summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, provide a very brief 2-5 sentence summary of what happened in this scene. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded.

For the keywords field, generate 15-30 specific, descriptive, highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_minimal"),northgate:c0(`You are a memory archivist for a long-form narrative. Your function is to analyze the provided scene and extract all pertinent information into a structured JSON object.

You must respond with ONLY valid JSON in this exact format:
{
"title": "Concise Scene Title (3-5 words)",
"content": "A detailed, literary summary of the scene written in a third-person, past-tense narrative style. Capture all key actions, emotional shifts, character development, and significant dialogue. Focus on "showing" what happened through concrete details. Ensure the summary is comprehensive enough to serve as a standalone record of the scene's events and their impact on the characters.",
"keywords": ["keyword1", "keyword2", "keyword3"]
}

For the "content" field, write with literary quality. Do not simply list events; synthesize them into a coherent narrative block.

For the "keywords" field, provide 15-30 specific and descriptive keywords that capture the scene's core elements. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON object, with no additional text or explanations.`,"STMemoryBooks_Prompt_northgate"),aelemar:c0(`You are a meticulous archivist, skilled at accurately capturing all key plot points and memories from a story. Analyze the following story scene and extract a detailed summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Concise scene title (3-5 words)",
  "content": "Detailed summary of key plot points and character memories, beat-by-beat in narrative prose...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a beat-by-beat summary in narrative prose. Capture all key plot points that advance the story and character memories that leave a lasting impression, ensuring nothing essential is omitted. This summary will go in a vectorized database, so include: 

- Story beats, events, actions and consequences, turning points, and outcomes
- Key character interactions, character developments, significant dialogue, revelations, emotional impact, and relationships
- Outcomes and anything else important for future interactions between the user and the world
Capture ALL nuance without repeating verbatim. Do not simply list events; synthesize them into a coherent narrative block. This summary must be comprehensive enough to serve as a standalone record of the story so far, even if the original text is lost. Use at least 300 words. Avoid redundancy.

For the keywords field, provide 15-30 specific and descriptive keywords that capture the scene's core elements. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_aelemar"),comprehensive:c0(`Analyze the following roleplay scene in the context of previous summaries provided (if available) and return a comprehensive synopsis as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short, descriptive scene title (3-6 words)",
  "content": "Long detailed synopsis with markdown structure...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a beat-by-beat summary of the scene that *replaces reading the full scene* while preserving all plot-relevant nuance and reads like a clean, structured scene log — concise yet complete. This summary needs to be token-efficient: exercise judgment as to whether or not an interaction is flavor-only or truly affects the plot. Flavor scenes (interaction detail that does not advance plot) may be captured through key exchanges and should be skipped when recording story beats. 

Write in **past tense**, **third-person**, and exclude all [OOC] or meta discussion.  
Use concrete nouns (e.g., “rice cooker” > “appliance”).  
Only use adjectives/adverbs when they materially affect tone, emotion, or characterization.  
Focus on **cause → intention → reaction → consequence** chains for clarity and compression.

# [Scene Title]
**Timeline**: (day/time)

## Story Beats
- Present all major actions, revelations, and emotional or magical shifts in order.
- Capture clear cause–effect logic: what triggered what, and why it mattered.
- Only include plot-affecting interactions and do not capture flavor-only beats.

## Character Dynamics
- Summarize how each character’s **motives, emotions, and relationships** evolved.
- Include subtext, tension, or silent implications.
- Highlight key beats of conflict, vulnerability, trust, or power shifts.

## Key Exchanges
- Include only pivotal dialogue that defines tone, emotion, or change.
- Attribute speakers by name; keep quotes short but exact.
- BE SELECTIVE. Maximum of 8 quotes.

## Outcome & Continuity
- Detail resulting **decisions, emotional states, physical/magical effects, or narrative consequences**.
- Include all elements that influence future continuity (knowledge, relationships, injuries, promises, etc.).
- Note any unresolved threads or foreshadowed elements.

Write compactly but completely — every line should add new information or insight.  
Synthesize redundant actions or dialogue into unified cause–effect–emotion beats.
Favor compression over coverage whenever the two conflict; omit anything that can be inferred from context or established characterization.

For the keywords field:

Generate **15–30 standalone topical keywords** that function as retrieval tags, not micro-summaries. 
Keywords must be:
- **Concrete and scene-specific** (locations, objects, proper nouns, unique actions, repeated motifs).
- **One concept per keyword** — do NOT combine multiple ideas into one keyword.
- **Useful for retrieval if the user later mentions that noun or action alone**, not only in a specific context.
- Not {{char}}'s or {{user}}'s names.
- **Not thematic, emotional, or abstract.** Stop-list: intimacy, vulnerability, trust, dominance, submission, power dynamics, boundaries, jealousy, aftercare, longing, consent, emotional connection.

Avoid:
- Overly specific compound keywords (“David Tokyo marriage”).
- Narrative or plot-summary style keywords (“art dealer date fail”).
- Keywords that contain multiple facts or descriptors.
- Keywords that only make sense when the whole scene is remembered.

Prefer:
- Proper nouns (e.g., "Chinatown", "Ritz-Carlton bar").
- Specific physical objects ("CPAP machine", "chocolate chip cookies").
- Distinctive actions ("cookie baking", "piano apology").
- Unique phrases or identifiers from the scene used by characters ("pack for forever", "dick-measuring contest").

Your goal: **keywords should fire when the noun/action is mentioned alone**, not only when paired with a specific person or backstory.

Return ONLY the JSON — no additional text.`,"STMemoryBooks_Prompt_comprehensive")}}function d0(){return c0(`Analyze the following chat scene and return a memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Concise memory focusing on key plot points, character development, and important interactions",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_default")}async function d7(Z){return await G1(Z)}async function I1(Z){if(!Z)return d0();if(Z.preset)return await G1(Z.preset);else return d0()}function X8(Z){if(!Z||typeof Z!=="object")return console.warn(`${p0}: Profile validation failed - not an object`),!1;if(!Z.name||typeof Z.name!=="string")return console.warn(`${p0}: Profile validation failed - invalid name`),!1;if(Z.connection&&typeof Z.connection!=="object")return console.warn(`${p0}: Profile validation failed - invalid connection`),!1;return!0}function q8(Z){if(Z===null||typeof Z!=="object")return Z;if(Z instanceof Date)return new Date(Z.getTime());if(Array.isArray(Z))return Z.map((G)=>q8(G));let Q={};for(let G in Z)if(Z.hasOwnProperty(G))Q[G]=q8(Z[G]);return Q}function c7(){return["summary","summarize","synopsis","sumup","minimal","northgate","aelemar","comprehensive"]}function p7(Z){return new Set(["summary","summarize","synopsis","sumup","minimal","northgate","aelemar","comprehensive"]).has(Z)}function L1(Z,Q=[]){if(!Z||typeof Z!=="string")Z="New Profile";let G=Z.trim().replace(/[<>:"/\\|?*]/g,"");if(!G)G="New Profile";let J=G,W=1;while(Q.includes(J))J=`${G} (${W})`,W++;return J}function n6(Z){if(typeof Z==="number")return isNaN(Z)?null:Math.max(0,Math.min(2,Z));if(typeof Z==="string"){let Q=parseFloat(Z);return isNaN(Q)?null:Math.max(0,Math.min(2,Q))}return null}function i7(Z){let Q=_8[Z],G=l8[Z];return Q&&G&&c0(Q,G)||Z}function J1(Z={}){let Q=n6(Z.temperature);if(Q===null)Q=0.7;let G={name:(Z.name||"New Profile").trim(),connection:{api:Z.api||"openai",temperature:Q},prompt:(Z.prompt||"").trim(),preset:Z.preset||"",constVectMode:Z.constVectMode||"link",position:Z.position!==void 0?Number(Z.position):0,orderMode:Z.orderMode||"auto",orderValue:Z.orderValue!==void 0?Number(Z.orderValue):100,preventRecursion:Z.preventRecursion!==void 0?Z.preventRecursion:!0,delayUntilRecursion:Z.delayUntilRecursion!==void 0?Z.delayUntilRecursion:!0};if(Z.isBuiltinCurrentST)G.isBuiltinCurrentST=!0;if(Z.titleFormat||!Z.isDynamicProfile)G.titleFormat=Z.titleFormat||"[000] - {{title}}";let J=(Z.model||"").trim();if(J)G.connection.model=J;let W=(Z.endpoint||"").trim();if(W)G.connection.endpoint=W;let q=(Z.apiKey||"").trim();if(q)G.connection.apiKey=q;if(G.prompt&&G.preset)G.preset="";if(!G.prompt&&!G.preset)G.preset="summary";try{if(Number(G.position)===7&&typeof Z.outletName==="string"){let Y=Z.outletName.trim();if(Y)G.outletName=Y}}catch{}return G}var p0="STMemoryBooks-Utils",v0,a0,u7;var b0=N1(()=>{e1();t8();D1();v0=window.jQuery;a0={extensionsMenu:"#extensionsMenu .list-group",menuItem:"#stmb-menu-item",chatContainer:"#chat",mainApi:"#main_api",completionSource:"#chat_completion_source",modelOpenai:"#model_openai_select",modelClaude:"#model_claude_select",modelOpenrouter:"#model_openrouter_select",modelAi21:"#model_ai21_select",modelGoogle:"#model_google_select",modelMistralai:"#model_mistralai_select",modelCohere:"#model_cohere_select",modelPerplexity:"#model_perplexity_select",modelGroq:"#model_groq_select",modelNanogpt:"#model_nanogpt_select",modelDeepseek:"#model_deepseek_select",modelElectronhub:"#model_electronhub_select",modelVertexai:"#model_vertexai_select",modelAimlapi:"#model_aimlapi_select",modelXai:"#model_xai_select",modelPollinations:"#model_pollinations_select",modelMoonshot:"#model_moonshot_select",modelFireworks:"#model_fireworks_select",modelCometapi:"#model_cometapi_select",modelAzureOpenai:"#model_azure_openai_select",tempOpenai:"#temp_openai",tempCounterOpenai:"#temp_counter_openai"},u7=["openai","claude","openrouter","ai21","makersuite","vertexai","mistralai","custom","cohere","perplexity","groq","nanogpt","deepseek","electronhub","aimlapi","xai","pollinations","moonshot","fireworks","cometapi","azure_openai"]});import{chat as Q6,name1 as l7,name2 as L4}from"../../../../script.js";import{getContext as o7}from"../../../extensions.js";import{t as y0,translate as L0}from"../../../i18n.js";function Z8(Z){let{sceneStart:Q,sceneEnd:G,chatId:J,characterName:W}=Z;if(Q==null||G==null)throw Error(L0("Scene markers are required","chatcompile.errors.sceneMarkersRequired"));if(Q>G)throw Error(L0("Start message cannot be greater than end message","chatcompile.errors.startGreaterThanEnd"));if(Q<0||G>=Q6.length)throw Error(y0`Message IDs out of bounds: ${Q}-${G} (0-${Q6.length-1})`);let q=[],Y=0,z=0;for(let V=Q;V<=G;V++){let F=Q6[V];if(!F){z++;continue}if(F.is_system){Y++;continue}let j={id:V,name:n7(F.name),mes:s7(F.mes,F.is_user),send_date:F.send_date||new Date().toISOString()};if(F.is_user!==void 0)j.is_user=F.is_user;q.push(j)}let X={metadata:{sceneStart:Q,sceneEnd:G,chatId:J||"unknown",characterName:W||L4||L0("Unknown","common.unknown"),messageCount:q.length,totalRequestedRange:G-Q+1,hiddenMessagesSkipped:Y,messagesSkipped:z,compiledAt:new Date().toISOString(),totalChatLength:Q6.length,userName:l7||L0("User","chatcompile.defaults.user")},messages:q};if(q.length===0)throw Error(y0`No visible messages in range ${Q}-${G}`);return X}function Q8(Z,Q){let G=o7();return{sceneStart:Z,sceneEnd:Q,chatId:G.chatId||"unknown",characterName:G.name2||L4||L0("Unknown","common.unknown")}}async function k6(Z){let Q=s6(Z),{input:G}=await $1(Q,{estimatedOutput:0});return G}async function w4(Z){let{metadata:Q,messages:G}=Z,J=new Set,W=0,q=0,Y=0;return G.forEach((z)=>{if(J.add(z.name),W+=(z.mes||"").length,z.is_user)q++;else Y++}),{messageCount:G.length,speakerCount:J.size,speakers:Array.from(J),totalCharacters:W,estimatedTokens:await k6(Z),userMessages:q,characterMessages:Y,timeSpan:{start:G[0]?.send_date,end:G[G.length-1]?.send_date}}}function C4(Z){let Q=[],G=[];if(!Z.metadata)Q.push(L0("Missing metadata","chatcompile.validation.errors.missingMetadata"));if(!Z.messages||!Array.isArray(Z.messages))Q.push(L0("Invalid messages array","chatcompile.validation.errors.invalidMessagesArray"));if(Z.messages&&Z.messages.length===0)G.push(L0("No messages","chatcompile.validation.warnings.noMessages"));if(Z.messages)Z.messages.forEach((W,q)=>{if(!W.id&&W.id!==0)G.push(y0`Message at index ${q} missing id`);if(!W.name)G.push(y0`Message at index ${q} missing name`);if(!W.mes&&W.mes!=="")G.push(y0`Message at index ${q} missing content`)});if(Z.messages&&Z.messages.length>100)G.push(L0("Very large scene","chatcompile.validation.warnings.veryLargeScene"));return{valid:Q.length===0,errors:Q,warnings:G}}function s6(Z){let{metadata:Q,messages:G}=Z,J=[];return J.push(L0("=== SCENE METADATA ===","chatcompile.readable.headerMetadata")),J.push(y0`Range: ${Q.sceneStart}-${Q.sceneEnd}`),J.push(y0`Chat: ${Q.chatId}`),J.push(y0`Character: ${Q.characterName}`),J.push(y0`Compiled: ${Q.messageCount}`),J.push(y0`Compiled at: ${Q.compiledAt}`),J.push(""),J.push(L0("=== SCENE MESSAGES ===","chatcompile.readable.headerMessages")),G.forEach((W)=>{J.push(y0`[${W.id}] ${W.name}: ${W.mes}`)}),J.join(`
`)}function n7(Z){if(!Z)return L0("Unknown","common.unknown");return Z.trim()||L0("Unknown","common.unknown")}function s7(Z,Q=!1){if(!Z)return"";try{return String(Z).replace(/\r\n/g,`
`).trim()}catch(G){return String(Z).trim()}}var a8=N1(()=>{b0()});var h4=n1((AJ,G6)=>{if(typeof G6==="object"&&typeof G6.exports==="object")G6.exports=r6;r6.defunct=function(Z){throw Error("Unexpected character at index "+(this.index-1)+": "+Z)};function r6(Z){if(typeof Z!=="function")Z=r6.defunct;var Q=[],G=[],J=0;this.state=0,this.index=0,this.input="",this.addRule=function(q,Y,z){var K=q.global;if(!K){var X="g";if(q.multiline)X+="m";if(q.ignoreCase)X+="i";q=new RegExp(q.source,X)}if(Object.prototype.toString.call(z)!=="[object Array]")z=[0];return G.push({pattern:q,global:K,action:Y,start:z}),this},this.setInput=function(q){return J=0,this.state=0,this.index=0,Q.length=0,this.input=q,this},this.lex=function(){if(Q.length)return Q.shift();this.reject=!0;while(this.index<=this.input.length){var q=W.call(this).splice(J),Y=this.index;while(q.length)if(this.reject){var z=q.shift(),K=z.result,X=z.length;this.index+=X,this.reject=!1,J++;var V=z.action.apply(this,K);if(this.reject)this.index=K.index;else if(typeof V<"u")switch(Object.prototype.toString.call(V)){case"[object Array]":Q=V.slice(1),V=V[0];default:if(X)J=0;return V}}else break;var F=this.input;if(Y<F.length)if(this.reject){J=0;var V=Z.call(this,F.charAt(this.index++));if(typeof V<"u")if(Object.prototype.toString.call(V)==="[object Array]")return Q=V.slice(1),V[0];else return V}else{if(this.index!==Y)J=0;this.reject=!0}else if(q.length)this.reject=!0;else break}};function W(){var q=[],Y=0,z=this.state,K=this.index,X=this.input;for(var V=0,F=G.length;V<F;V++){var j=G[V],O=j.start,H=O.length;if(!H||O.indexOf(z)>=0||z%2&&H===1&&!O[0]){var A=j.pattern;A.lastIndex=K;var B=A.exec(X);if(B&&B.index===K){var D=q.push({result:B,action:j.action,length:B[0].length});if(j.global)Y=D;while(--D>Y){var T=D-1;if(q[D].length>q[T].length){var L=q[D];q[D]=q[T],q[T]=L}}}}}return q}}});var r7={};var M4=N1(()=>{/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */if(!String.fromCodePoint)(function(){var Z=function(){try{var W={},q=Object.defineProperty,Y=q(W,W,W)&&q}catch(z){}return Y}(),Q=String.fromCharCode,G=Math.floor,J=function(W){var q=16384,Y=[],z,K,X=-1,V=arguments.length;if(!V)return"";var F="";while(++X<V){var j=Number(arguments[X]);if(!isFinite(j)||j<0||j>1114111||G(j)!=j)throw RangeError("Invalid code point: "+j);if(j<=65535)Y.push(j);else j-=65536,z=(j>>10)+55296,K=j%1024+56320,Y.push(z,K);if(X+1==V||Y.length>q)F+=Q.apply(null,Y),Y.length=0}return F};if(Z)Z(String,"fromCodePoint",{value:J,configurable:!0,writable:!0});else String.fromCodePoint=J})()});var x4=n1((a6,v4)=>{Object.defineProperty(a6,"__esModule",{value:!0});a6.default=void 0;M4();var a7=/\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g,t7={"0":"\x00",b:"\b",f:"\f",n:`
`,r:"\r",t:"\t",v:"\v","'":"'",'"':'"',"\\":"\\"},$6=function(Q){return String.fromCodePoint(parseInt(Q,16))},e7=function(Q){return String.fromCodePoint(parseInt(Q,8))},ZQ=function(Q){return Q.replace(a7,function(G,J,W,q,Y,z,K,X){if(W!==void 0)return $6(W);else if(q!==void 0)return $6(q);else if(Y!==void 0)return $6(Y);else if(z!==void 0)return e7(z);else if(X!==void 0)return $6(X);else return t7[K]})};a6.default=ZQ;v4.exports=a6.default});var S4=n1((J6)=>{/*! https://mths.be/utf8js v3.0.0 by @mathias */(function(Z){var Q=String.fromCharCode;function G(H){var A=[],B=0,D=H.length,T,L;while(B<D)if(T=H.charCodeAt(B++),T>=55296&&T<=56319&&B<D)if(L=H.charCodeAt(B++),(L&64512)==56320)A.push(((T&1023)<<10)+(L&1023)+65536);else A.push(T),B--;else A.push(T);return A}function J(H){var A=H.length,B=-1,D,T="";while(++B<A){if(D=H[B],D>65535)D-=65536,T+=Q(D>>>10&1023|55296),D=56320|D&1023;T+=Q(D)}return T}function W(H){if(H>=55296&&H<=57343)throw Error("Lone surrogate U+"+H.toString(16).toUpperCase()+" is not a scalar value")}function q(H,A){return Q(H>>A&63|128)}function Y(H){if((H&4294967168)==0)return Q(H);var A="";if((H&4294965248)==0)A=Q(H>>6&31|192);else if((H&4294901760)==0)W(H),A=Q(H>>12&15|224),A+=q(H,6);else if((H&4292870144)==0)A=Q(H>>18&7|240),A+=q(H,12),A+=q(H,6);return A+=Q(H&63|128),A}function z(H){var A=G(H),B=A.length,D=-1,T,L="";while(++D<B)T=A[D],L+=Y(T);return L}function K(){if(j>=F)throw Error("Invalid byte index");var H=V[j]&255;if(j++,(H&192)==128)return H&63;throw Error("Invalid continuation byte")}function X(){var H,A,B,D,T;if(j>F)throw Error("Invalid byte index");if(j==F)return!1;if(H=V[j]&255,j++,(H&128)==0)return H;if((H&224)==192)if(A=K(),T=(H&31)<<6|A,T>=128)return T;else throw Error("Invalid continuation byte");if((H&240)==224)if(A=K(),B=K(),T=(H&15)<<12|A<<6|B,T>=2048)return W(T),T;else throw Error("Invalid continuation byte");if((H&248)==240){if(A=K(),B=K(),D=K(),T=(H&7)<<18|A<<12|B<<6|D,T>=65536&&T<=1114111)return T}throw Error("Invalid UTF-8 detected")}var V,F,j;function O(H){V=G(H),F=V.length,j=0;var A=[],B;while((B=X())!==!1)A.push(B);return J(A)}Z.version="3.0.0",Z.encode=z,Z.decode=O})(typeof J6>"u"?J6.utf8={}:J6)});var y4=n1((qQ,t6)=>{var QQ=h4(),GQ=x4(),DJ=S4(),$Q=[[/\s*:\s*/,-1],[/\s*,\s*/,-2],[/\s*{\s*/,-3],[/\s*}\s*/,13],[/\s*\[\s*/,-4],[/\s*\]\s*/,12],[/\s*\.\s*/,-5]];function E4(Z){return Z=Z.replace(/\\\//,"/"),GQ(Z)}function JQ(Z){let Q=new QQ,G=0,J=0;return Q.addRule(/"((?:\\.|[^"])*?)($|")/,(W,q)=>{return G+=W.length,{type:11,value:E4(q),row:J,col:G,single:!1}}),Q.addRule(/'((?:\\.|[^'])*?)($|'|(",?[ \t]*\n))/,(W,q)=>{return G+=W.length,{type:11,value:E4(q),row:J,col:G,single:!0}}),Q.addRule(/[\-0-9]*\.[0-9]*([eE][\+\-]?)?[0-9]*(?:\s*)/,(W)=>{return G+=W.length,{type:6,value:parseFloat(W),row:J,col:G}}),Q.addRule(/\-?[0-9]+([eE][\+\-]?)[0-9]*(?:\s*)/,(W)=>{return G+=W.length,{type:6,value:parseFloat(W),row:J,col:G}}),Q.addRule(/\-?[0-9]+(?:\s*)/,(W)=>{return G+=W.length,{type:7,value:parseInt(W),row:J,col:G}}),$Q.forEach((W)=>{Q.addRule(W[0],(q)=>{return G+=q.length,{type:W[1],value:q,row:J,col:G}})}),Q.addRule(/\s/,(W)=>{if(W==`
`)G=0,J++;else G+=W.length}),Q.addRule(/\S[ \t]*/,(W)=>{return G+=W.length,{type:14,value:W,row:J,col:G}}),Q.setInput(Z),Q}qQ.lexString=b4;function b4(Z,Q){let G=JQ(Z),J="";while(J=G.lex())Q(J)}qQ.getAllTokens=WQ;function WQ(Z){let Q=[];return b4(Z,function(J){Q.push(J)}),Q}});var u4=n1((UQ,g4)=>{var XQ=y4(),e6=0,w1=1,W1=2,ZZ=3,W6=4,q6=5,VQ=6,f4=7,Y0=8,k0=9,q1=10,KQ=11,K8=12,j8=13,jQ=14,W0=15,V8=-1,f0=-2,QZ=-3,C1=-4;function k4(Z){if(Z.peek==null)Object.defineProperty(Z,"peek",{enumerable:!1,value:function(){return this[this.length-1]}});if(Z.last==null)Object.defineProperty(Z,"last",{enumerable:!1,value:function(Q){return this[this.length-(1+Q)]}})}function M(Z,Q){return Z&&Z.hasOwnProperty("type")&&Z.type==Q}function I(Z){}UQ.parse=FQ;function FQ(Z,Q){let G=[],J=[];k4(G),k4(J);let W=function(q){J.push(q)};if(XQ.lexString(Z,W),J[0].type==C1&&J.last(0).type!=K8)J.push({type:K8,value:"]",row:-1,col:-1});if(J[0].type==QZ&&J.last(0).type!=j8)J.push({type:j8,value:"}",row:-1,col:-1});for(let q=0;q<J.length;q++){I("Shifting "+J[q].type),G.push(J[q]),I(G),I("Reducing...");while(t0(G))I(G),I("Reducing...")}if(G.length==1&&G[0].type==w1)I("Pre-compile error fix 1"),G=[{type:q1,value:G[0].value}];return Y6(G[0],Q)}function t0(Z){let Q=Z.pop();switch(Q.type){case Y0:if(Q.value.trim()=="true")return I("Rule 5"),Z.push({type:ZZ,value:"true"}),!0;if(Q.value.trim()=="false")return I("Rule 6"),Z.push({type:ZZ,value:"false"}),!0;if(Q.value.trim()=="null")return I("Rule 7"),Z.push({type:W0,value:null}),!0;break;case jQ:if(M(Z.peek(),Y0))return I("Rule 11a"),Z.peek().value+=Q.value,!0;return I("Rule 11c"),Z.push({type:Y0,value:Q.value}),!0;case f4:if(M(Q,f4)&&M(Z.peek(),Y0))return I("Rule 11b"),Z.peek().value+=Q.value,!0;return I("Rule 11f"),Q.type=W0,Z.push(Q),!0;case KQ:return I("Rule 11d"),Q.type=W0,Q.value=Q.value,Z.push(Q),!0;case ZZ:if(I("Rule 11e"),Q.type=W0,Q.value=="true")Q.value=!0;else Q.value=!1;return Z.push(Q),!0;case VQ:return I("Rule 11g"),Q.type=W0,Z.push(Q),!0;case W0:if(M(Z.peek(),f0))return I("Rule 12"),Q.type=q6,Z.pop(),Z.push(Q),!0;if(M(Z.peek(),V8))return I("Rule 13"),Q.type=W6,Z.pop(),Z.push(Q),!0;if(M(Z.peek(),Y0)&&M(Z.last(1),W0)){I("Error rule 1");let G=Z.pop();return Z.peek().value+='"'+G.value+'"',Z.peek().value+=Q.value,!0}if(M(Z.peek(),Y0)&&M(Z.last(1),W1)){I("Error rule 2");let G=Z.pop(),J=Z.peek().value.pop();return J+='"'+G.value+'"',J+=Q.value,Z.peek().value.push(J),!0}if(M(Z.peek(),Y0)&&M(Z.last(1),w1)){I("Error rule 3");let G=Z.pop(),J=Z.peek().value.pop(),W=Q.single?"'":'"';return J.value+=W+G.value+W,J.value+=Q.value,Z.peek().value.push(J),!0}if(M(Z.peek(),Y0)){I("Error rule 4");let G=Z.pop().value;return Q.value=G+Q.value,Z.push(Q),!0}break;case k0:if(M(Q,k0)&&M(Z.peek(),f0))return I("Rule 12a"),Q.type=q6,Z.pop(),Z.push(Q),!0;if(M(Z.peek(),V8))return I("Rule 13a"),Q.type=W6,Z.pop(),Z.push(Q),!0;break;case q1:if(M(Z.peek(),f0)){I("Rule 12b");let G={type:q6,value:Q};return Z.pop(),Z.push(G),!0}if(M(Z.peek(),V8)){I("Rule 13b");let G={type:W6,value:Q};return Z.pop(),Z.push(G),!0}if(M(Z.peek(),Y0)){I("Error rule 9");let G=Z.pop();return Z.push({type:e6,key:G.value.trim(),value:Q}),!0}break;case q6:if(M(Z.peek(),W1))return I("Rule 14"),Z.peek().value.push(Q.value),!0;return I("Rule 15"),Z.push({type:W1,value:[Q.value]}),!0;case W1:if(M(Z.peek(),W0))return I("Rule 15a"),Q.value.unshift(Z.peek().value),Z.pop(),Z.push(Q),!0;if(M(Z.peek(),k0))return I("Rule 15b"),Q.value.unshift(Z.peek().value),Z.pop(),Z.push(Q),!0;if(M(Z.peek(),q1))return I("Rule 15c"),Q.value.unshift(Z.peek()),Z.pop(),Z.push(Q),!0;if(M(Z.peek(),Y0)&&(Z.last(1),f0)){I("Error rule 7");let G=Z.pop();Z.push({type:W0,value:G.value}),I("Start subreduce... ("+G.value+")");while(t0(Z));return I("End subreduce"),Z.push(Q),!0}if(M(Z.peek(),W1))return I("Error rule 8"),Z.peek().value.push(Q.value[0]),!0;break;case W6:if(M(Z.peek(),Y0)||M(Z.peek(),W0)||M(Z.peek(),W1)){I("Rule 16");let G=Z.pop();return Z.push({type:e6,key:G.value,value:Q.value}),!0}throw Error("Got a :value that can't be handled at line "+Q.row+":"+Q.col);case e6:if(M(Z.last(0),f0)&&M(Z.last(1),w1))return I("Rule 17"),Z.last(1).value.push(Q),Z.pop(),!0;return I("Rule 18"),Z.push({type:w1,value:[Q]}),!0;case w1:if(M(Z.peek(),w1))return I("Rule 17a"),Q.value.forEach(function(G){Z.peek().value.push(G)}),!0;break;case K8:if(M(Z.peek(),W1)&&M(Z.last(1),C1)){I("Rule 19");let G=Z.pop();return Z.pop(),Z.push({type:k0,value:G.value}),!0}if(M(Z.peek(),k0)&&M(Z.last(1),C1)){I("Rule 19b");let G=Z.pop();return Z.pop(),Z.push({type:k0,value:[G.value]}),!0}if(M(Z.peek(),C1))return I("Rule 22"),Z.pop(),Z.push({type:k0,value:[]}),!0;if(M(Z.peek(),W0)&&M(Z.last(1),C1)){I("Rule 23");let G=Z.pop().value;return Z.pop(),Z.push({type:k0,value:[G]}),!0}if(M(Z.peek(),q1)&&M(Z.last(1),C1)){I("Rule 23b");let G=Z.pop();return Z.pop(),Z.push({type:k0,value:[G]}),!0}if(M(Z.peek(),Y0)&&M(Z.last(1),f0)){I("Error rule 5");let G=Z.pop();Z.push({type:W0,value:G.value}),I("Start subreduce... ("+G.value+")");while(t0(Z));return I("End subreduce"),Z.push({type:K8}),!0}if(M(Z.peek(),f0)&&(M(Z.last(1),Y0)||M(Z.last(1),q1)||M(Z.last(1),W0))){I("Error rule 5a"),Z.pop(),Z.push({type:K8,value:"]"}),I("Start subreduce..."),I("Content: "+JSON.stringify(Z));while(t0(Z));return I("End subreduce"),!0}if(M(Z.peek(),Y0)&&M(Z.last(1),C1)){I("Error rule 5b");let G=Z.pop();return Z.pop(),Z.push({type:k0,value:[G.value]}),!0}if(M(Z.peek(),f0)&&M(Z.last(1),W1)){I("Error rule 5c"),Z.pop(),Z.push({type:K8}),I("Start subreduce..."),I("Content: "+JSON.stringify(Z));while(t0(Z));return I("End subreduce"),!0}break;case j8:if(M(Z.peek(),w1)&&M(Z.last(1),QZ)){I("Rule 20");let G=Z.pop();return Z.pop(),Z.push({type:q1,value:G.value}),!0}if(M(Z.peek(),QZ))return I("Rule 21"),Z.pop(),Z.push({type:q1,value:null}),!0;if(M(Z.peek(),Y0)&&M(Z.last(1),V8)){I("Error rule 4a");let G=Z.pop();Z.push({type:W0,value:G.value}),I("Start subreduce... ("+G.value+")");while(t0(Z));return I("End subreduce"),Z.push({type:j8}),!0}if(M(Z.peek(),V8)){I("Error rule 4b"),Z.push({type:W0,value:null}),I("Starting subreduce...");while(t0(Z));return I("End subreduce."),Z.push({type:j8}),!0}if(M(Z.peek(),f0))return I("Error rule 10a"),Z.pop(),Z.push({type:j8}),!0;throw Error("Found } that I can't handle at line "+Q.row+":"+Q.col);case f0:if(M(Z.peek(),f0))return I("Comma error rule 1"),!0;if(M(Z.peek(),Y0)){I("Comma error rule 2");let G=Z.pop();Z.push({type:W0,value:G.value}),I("Starting subreduce...");while(t0(Z));return I("End subreduce."),Z.push(Q),!0}if(M(Z.peek(),V8)){I("Comma error rule 3"),Z.push({type:W0,value:null}),I("Starting subreduce...");while(t0(Z));return I("End subreduce."),Z.push(Q),!0}}return Z.push(Q),!1}function Y6(Z,Q){if(["boolean","number","string"].indexOf(typeof Z)!=-1)return Z;if(Z===null)return null;if(Array.isArray(Z)){let J=[];while(Z.length>0)J.unshift(Y6(Z.pop()));return J}if(M(Z,q1)){let J={};if(Z.value===null)return{};return Z.value.forEach(function(W){let q=W.key,Y=Y6(W.value);if(Q&&q in J)J[q]={value:J[q],next:Y};else J[q]=Y}),J}if(M(Z,k0))return Y6(Z.value);return Z.value}});var d4=n1((AQ,m4)=>{var BQ=u4();AQ.parse=OQ;function OQ(Z,Q){let G=!0,J=!1;if(Q){if("fallback"in Q&&Q[G]===!1)G=!1;J="duplicateKeys"in Q&&Q.duplicateKeys===!0}try{return BQ.parse(Z,J)}catch(W){if(G===!1)throw W;try{let q=JSON.parse(Z);return console.warn("dirty-json got valid JSON that failed with the custom parser. We're returning the valid JSON, but please file a bug report here: https://github.com/RyanMarcus/dirty-json/issues  -- the JSON that caused the failure was: "+Z),q}catch(q){throw W}}}});var h5={};$4(h5,{upsertTemplate:()=>O6,removeTemplate:()=>_Z,recreateBuiltInSidePrompts:()=>wZ,loadSidePrompts:()=>g0,listTemplates:()=>X1,listEnabledByType:()=>wG,listByTrigger:()=>A6,importFromJSON:()=>LZ,getTemplate:()=>DZ,firstRunInitIfMissing:()=>LG,findTemplateByName:()=>TZ,exportToJSON:()=>IZ,duplicateTemplate:()=>RZ,clearCache:()=>CG});import{getRequestHeaders as R5}from"../../../../script.js";import{t as B6,translate as a}from"../../../i18n.js";function x8(){return new Date().toISOString()}function O0(Z){return String(Z||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)||"sideprompt"}function I5(Z){if(!Z||typeof Z!=="object")return!1;if(typeof Z.version!=="number")return!1;if(!Z.prompts||typeof Z.prompts!=="object")return!1;for(let[Q,G]of Object.entries(Z.prompts)){if(!G||typeof G!=="object")return!1;if(G.key!==Q)return!1;if(typeof G.name!=="string"||!G.name.trim())return!1;if(typeof G.enabled!=="boolean")return!1;if(typeof G.prompt!=="string")return!1;if(!G.settings||typeof G.settings!=="object")return!1;if(!G.triggers||typeof G.triggers!=="object")return!1;if(G.triggers.onInterval!=null){let J=G.triggers.onInterval;if(typeof J!=="object")return!1;let W=Number(J.visibleMessages);if(!Number.isFinite(W)||W<1)return!1}if(G.triggers.onAfterMemory!=null){let J=G.triggers.onAfterMemory;if(typeof J!=="object")return!1;if(typeof J.enabled!=="boolean")return!1}if(G.triggers.commands!=null){if(!Array.isArray(G.triggers.commands))return!1;for(let J of G.triggers.commands)if(typeof J!=="string"||!J.trim())return!1}}return!0}function L5(Z){if(!Z||typeof Z!=="object")return!1;if(!Z.prompts||typeof Z.prompts!=="object")return!1;return Object.values(Z.prompts).some((Q)=>Q&&typeof Q==="object"&&("type"in Q)&&!("triggers"in Q))}function w5(Z){let Q=x8(),G={version:Math.max(2,Number(Z.version||1)+1),prompts:{}};for(let[J,W]of Object.entries(Z.prompts||{})){let q={key:J,name:String(W.name||"Side Prompt"),enabled:!!W.enabled,prompt:String(W.prompt!=null?W.prompt:"this is a placeholder prompt"),responseFormat:String(W.responseFormat||""),settings:{...W.settings||{}},createdAt:W.createdAt||Q,updatedAt:Q,triggers:{onInterval:void 0,onAfterMemory:void 0,commands:["sideprompt"]}},Y=String(W.type||"").toLowerCase();if(Y==="tracker"){let z=Math.max(1,Number(W.settings?.intervalVisibleMessages??50));q.triggers.onInterval={visibleMessages:z}}else if(Y==="plotpoints"){let z=!!(W.settings?.withMemories??!0);q.triggers.onAfterMemory={enabled:!!z}}else if(Y==="scoreboard"){if(!!(W.settings?.withMemories??!1))q.triggers.onAfterMemory={enabled:!0}}G.prompts[J]=q}return G}function C5(){let Z=x8(),Q={};{let G=O0("Plotpoints");Q[G]={key:G,name:a("Plotpoints","STMemoryBooks_Plotpoints"),enabled:!1,prompt:a("Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.","STMemoryBooks_PlotpointsPrompt"),responseFormat:a(`=== Plot Points ===
(as of [point in the story when this analysis was done])

[Overarching Plot Arc]
(2-3 sentence summary of the superobjective or major plot)

[Thread #1 Title]
- Summary: (1 sentence)
- Status: (active / on hold)
- At Stake: (how resolution will affect the ongoing story)
- Last Known: (location or time)
- Key Characters: ...


[Thread #2 Title]
- Summary: (1 sentence)
- Status: (active / on hold)
- At Stake: (how resolution will affect the ongoing story)
- Last Known: (location or time)
- Key Characters: ...

...

-- Plot Hooks --
- (new or potential plot hooks)

-- Character Dynamics --
- current status of {{user}}'s/{{char}}'s relationships with NPCs

===End Plot Points===
`,"STMemoryBooks_PlotpointsResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:2,orderMode:"manual",orderValue:25,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=O0("Status");Q[G]={key:G,name:a("Status","STMemoryBooks_Status"),enabled:!1,prompt:a("Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.","STMemoryBooks_StatusPrompt"),responseFormat:a(`Follow this general format:

## Witty Headline or Summary

### AFFINITY (0-100, have some relationship with !lovefactor and !lustfactor)
- Score with evidence
- Recent changes 
- Supporting quotes
- Anything else that might be illustrative of the current affinity

### LOVEFACTOR and LUSTFACTOR
(!lovefactor and !lustfactor reports go here)

### RELATIONSHIP STATUS (negative = enemies, 0 = strangers, 100 = life partners)
- Trust/boundaries/communication
- Key events
- Issues
- Any other pertinent points

### GOALS
- Short/long-term objectives
- Progress/obstacles
- Growth areas
- Any other pertinent points

### ANALYSIS
- Psychology/POV
- Development/triggers
- Story suggestions
- Any other pertinent points

### WRAP-UP
- OOC Summary (1 paragraph)`,"STMemoryBooks_StatusResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"link",position:3,orderMode:"manual",orderValue:25,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=O0("Cast");Q[G]={key:G,name:a("Cast of Characters","STMemoryBooks_CastOfCharacters"),enabled:!1,prompt:a(`You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. 
Step 1: Review the scene and either add or update plot-related NPCs to the NPC WHO'S WHO report. Please note that {{char}} and {{user}} are major characters and do NOT need to be included in this report.
Step 2: This list should be kept in order of importance to the plot, so it may need to be reordered.
Step 3: If your response would be more than 2000 tokens long, remove NPCs with the least impact to the plot.`,"STMemoryBooks_CastOfCharactersPrompt"),responseFormat:a(`===NPC WHO'S WHO===
(In order of importance to the plot)

Person 1: 1-2 sentence desription
Person 2: 1-2 sentence desription
===END NPC WHO'S WHO===`,"STMemoryBooks_CastOfCharactersResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:3,orderMode:"manual",orderValue:15,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=O0("Assess");Q[G]={key:G,name:a("Assess","STMemoryBooks_Assess"),enabled:!1,prompt:a('Assess the interaction between {{char}} and {{user}} to date. List all the information {{char}} has learned about {{user}} through observation, questioning, or drawing conclusions from interaction (similar to a mental "note to self"). If there is already a list, update it. Try to keep it token-efficient and compact, focused on the important things.',"STMemoryBooks_AssessPrompt"),responseFormat:a(`Use this format: 
=== Things {{char}} has learned about {{user}} ===
(detailed list, in {{char}}'s POV/tone of voice)
===`,"STMemoryBooks_AssessResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:2,orderMode:"manual",orderValue:30,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}return Q}function NZ(){return{version:Math.max(2,s0.CURRENT_VERSION??2),prompts:C5()}}async function i0(Z){let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:R5(),body:JSON.stringify({name:_5,data:G})});if(!J.ok)throw Error(B6`Failed to save side prompts: ${J.status} ${J.statusText}`);S1=Z,console.log(`${A8}: ${a("Side prompts saved successfully","STMemoryBooks_SidePromptsSaved")}`)}async function g0(){if(S1)return S1;let Z=null;try{let Q=await fetch(`/user/files/${_5}`,{method:"GET",credentials:"include",headers:R5()});if(!Q.ok)Z=NZ(),await i0(Z);else{let G=await Q.text(),J=JSON.parse(G);if(L5(J))console.log(`${A8}: ${a("Migrating side prompts file from V1(type) to V2(triggers)","STMemoryBooks_MigratingSidePrompts")}`),Z=w5(J),await i0(Z);else if(!I5(J))console.warn(`${A8}: ${a("Invalid side prompts file structure; recreating with built-ins","STMemoryBooks_InvalidSidePromptsFile")}`),Z=NZ(),await i0(Z);else if(Z=J,Number(Z.version||1)<2)Z.version=2,await i0(Z)}}catch(Q){console.warn(`${A8}: ${a("Error loading side prompts; creating base doc","STMemoryBooks_ErrorLoadingSidePrompts")}`,Q),Z=NZ(),await i0(Z)}return S1=Z,S1}async function LG(){return await g0(),!0}async function X1(){let Z=await g0(),Q=Object.values(Z.prompts);return Q.sort((G,J)=>{let W=G.updatedAt||G.createdAt||"";return(J.updatedAt||J.createdAt||"").localeCompare(W)}),Q}async function DZ(Z){return(await g0()).prompts[Z]||null}async function TZ(Z){let Q=await g0(),G=String(Z||"").trim();if(!G)return null;let J=G.toLowerCase(),W=O0(G),q=J.replace(/[^a-z0-9]+/g," ").trim(),Y=Object.values(Q.prompts);for(let z of Y){let K=String(z.name||"").toLowerCase(),X=String(z.key||"").toLowerCase(),V=O0(z.name||"");if(K===J||X===J||V===W)return z}for(let z of Y){let K=String(z.name||"").toLowerCase(),X=String(z.key||"").toLowerCase(),V=O0(z.name||"");if(K.startsWith(J)||V.startsWith(W)||X.startsWith(J))return z}for(let z of Y){let K=String(z.name||"").toLowerCase(),X=O0(z.name||""),V=K.replace(/[^a-z0-9]+/g," ").trim();if(K.includes(J)||X.includes(W)||q&&V.includes(q))return z}return null}async function O6(Z){let Q=await g0(),G=!Z.key,J=x8(),W=String(Z.name??"").trim(),q=G?null:Q.prompts[Z.key],Y=W||(G?a("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt"):q?.name||a("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")),z;if(Z.key)z=Z.key;else{let F=O0(Y||a("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")),j=2;while(Q.prompts[F])F=O0(`${Y} ${j}`),j++;z=F}let K=Q.prompts[z],X={key:z,name:Y,enabled:typeof Z.enabled==="boolean"?Z.enabled:K?.enabled??!1,prompt:String(Z.prompt!=null?Z.prompt:K?.prompt||"this is a placeholder prompt"),responseFormat:String(Z.responseFormat!=null?Z.responseFormat:K?.responseFormat||""),settings:{...K?.settings||{},...Z.settings||{}},triggers:Z.triggers?Z.triggers:K?.triggers||{commands:["sideprompt"]},createdAt:K?.createdAt||J,updatedAt:J};if(X.triggers.onInterval){let V=Math.max(1,Number(X.triggers.onInterval.visibleMessages??50));X.triggers.onInterval={visibleMessages:V}}if(X.triggers.onAfterMemory)X.triggers.onAfterMemory={enabled:!!X.triggers.onAfterMemory.enabled};if("commands"in X.triggers)if(Array.isArray(X.triggers.commands))X.triggers.commands=X.triggers.commands.filter((V)=>typeof V==="string"&&V.trim());else X.triggers.commands=[];else X.triggers.commands=["sideprompt"];return Q.prompts[z]=X,await i0(Q),z}async function RZ(Z){let Q=await g0(),G=Q.prompts[Z];if(!G)throw Error(B6`Template "${Z}" not found`);let J=B6`${G.name} (Copy)`,W=O0(J),q=2;while(Q.prompts[W])W=O0(`${J} ${q}`),q++;let Y=x8();return Q.prompts[W]={...G,key:W,name:J,createdAt:Y,updatedAt:Y},await i0(Q),W}async function _Z(Z){let Q=await g0();if(!Q.prompts[Z])throw Error(B6`Template "${Z}" not found`);delete Q.prompts[Z],await i0(Q)}async function IZ(){let Z=await g0();return JSON.stringify(Z,null,2)}async function LZ(Z){let Q=JSON.parse(Z),G=null;if(I5(Q))G=Q;else if(L5(Q))G=w5(Q);else throw Error(a("Invalid side prompts file structure","STMemoryBooks_InvalidSidePromptsJSON"));let J=await g0(),W={version:Math.max(2,Number(J.version??2),Number(G.version??2)),prompts:{...J.prompts}},q=(K,X)=>{let V=String(X||"").trim()||K||"sideprompt",F=O0(V),j=K&&!W.prompts[K]?K:F;if(!j)j="sideprompt";let O=2;while(W.prompts[j])j=O0(`${V} ${O}`),O++;return j},Y=0,z=0;for(let[K,X]of Object.entries(G.prompts||{})){let V=W.prompts[K]?q(null,X?.name||K):K;if(V!==K)z++;let F=x8(),j={key:V,name:String(X.name||"Side Prompt"),enabled:!!X.enabled,prompt:String(X.prompt!=null?X.prompt:"this is a placeholder prompt"),responseFormat:String(X.responseFormat||""),settings:{...X.settings||{}},triggers:X.triggers?{...X.triggers}:{commands:["sideprompt"]},createdAt:X.createdAt||F,updatedAt:F};if(j.triggers.onInterval){let O=Math.max(1,Number(j.triggers.onInterval.visibleMessages??50));j.triggers.onInterval={visibleMessages:O}}if(j.triggers.onAfterMemory)j.triggers.onAfterMemory={enabled:!!j.triggers.onAfterMemory.enabled};if("commands"in j.triggers)if(Array.isArray(j.triggers.commands))j.triggers.commands=j.triggers.commands.filter((O)=>typeof O==="string"&&O.trim());else j.triggers.commands=[];else j.triggers.commands=["sideprompt"];W.prompts[V]=j,Y++}return await i0(W),{added:Y,renamed:z}}async function wZ(Z="overwrite"){if(Z!=="overwrite")console.warn(`${A8}: Unsupported mode for recreateBuiltInSidePrompts: ${Z}; defaulting to 'overwrite'`);let Q=await g0(),G=C5(),J=Object.keys(G||{}),W=0;if(!Q||!Q.prompts||typeof Q.prompts!=="object")throw Error(a("Invalid side prompts document","STMemoryBooks_InvalidSidePromptsJSON"));for(let q of J)Q.prompts[q]=G[q],W++;return await i0(Q),S1=Q,console.log(`${A8}: Recreated built-in side prompts (overwrote ${W} entries)`),{replaced:W}}async function wG(Z){let Q=String(Z||"").toLowerCase(),G=await X1();if(Q==="tracker")return G.filter((J)=>J.enabled&&J.triggers?.onInterval&&Number(J.triggers.onInterval.visibleMessages)>=1);if(Q==="plotpoints")return G.filter((J)=>J.enabled&&J.triggers?.onAfterMemory?.enabled);if(Q==="scoreboard")return G.filter((J)=>J.enabled&&(Array.isArray(J.triggers?.commands)||J.triggers?.onAfterMemory?.enabled));return[]}async function A6(Z){let Q=await X1();if(Z==="onInterval")return Q.filter((G)=>G.enabled&&G.triggers?.onInterval&&Number(G.triggers.onInterval.visibleMessages)>=1);if(Z==="onAfterMemory")return Q.filter((G)=>G.enabled&&G.triggers?.onAfterMemory?.enabled);if(Z&&Z.startsWith("command:")){let G=Z.slice(8).trim();return Q.filter((J)=>Array.isArray(J.triggers?.commands)&&J.triggers.commands.some((W)=>W.toLowerCase()===G.toLowerCase()))}return[]}function CG(){S1=null}var A8="STMemoryBooks-SidePromptsManager",_5,S1=null;var S8=N1(()=>{D1();_5=s1.SIDE_PROMPTS_FILE});a8();import{eventSource as Z1,event_types as H1,chat as H7,chat_metadata as c1,saveSettingsDebounced as s,characters as iZ,this_chid as sG,settings as X3}from"../../../../script.js";import{Popup as $0,POPUP_TYPE as r,POPUP_RESULT as i}from"../../../popup.js";import{extension_settings as p}from"../../../extensions.js";import{SlashCommandParser as k1}from"../../../slash-commands/SlashCommandParser.js";import{SlashCommand as g1}from"../../../slash-commands/SlashCommand.js";import{SlashCommandEnumValue as rZ}from"../../../slash-commands/SlashCommandEnumValue.js";import{ARGUMENT_TYPE as L6,SlashCommandArgument as w6}from"../../../slash-commands/SlashCommandArgument.js";import{executeSlashCommands as rG}from"../../../slash-commands.js";import{METADATA_KEY as p8,world_names as h6,loadWorldInfo as aG,saveWorldInfo as tG,reloadEditor as eG}from"../../../world-info.js";import{lodash as Z$,Handlebars as Q$,DOMPurify as i1}from"../../../../lib.js";import{escapeHtml as b}from"../../../utils.js";b0();var i4=E6(d4(),1);import{characters as GZ,this_chid as c4,substituteParams as DQ,getRequestHeaders as TQ}from"../../../../script.js";import{oai_settings as z6}from"../../../openai.js";import{runRegexScript as RQ,getRegexScripts as _Q}from"../../../extensions/regex/engine.js";import{groups as p4}from"../../../group-chats.js";import{extension_settings as C8}from"../../../extensions.js";var CJ=window.jQuery;function IQ(Z){try{let Q={...Z};return Q.disabled=!1,Q}catch{return Z}}function l4(Z,Q){if(typeof Z!=="string")return"";if(!Array.isArray(Q)||Q.length===0)return Z;try{let G=_Q({allowedOnly:!1})||[],J=Q.map((q)=>Number(String(q).replace(/^idx:/,""))).filter((q)=>Number.isInteger(q)&&q>=0&&q<G.length),W=Z;for(let q of J){let Y=IQ(G[q]);try{W=RQ(Y,W)}catch(z){console.warn("applySelectedRegex: script failed",q,z)}}return W}catch(G){return console.warn("applySelectedRegex failed",G),Z}}class $Z extends Error{constructor(Z,Q){super(Z);this.name="TokenWarningError",this.tokenCount=Q}}class F8 extends Error{constructor(Z){super(Z);this.name="AIResponseError"}}class X6 extends Error{constructor(Z){super(Z);this.name="InvalidProfileError"}}function LQ(){return"/api/backends/chat-completions/generate"}async function h1({model:Z,prompt:Q,temperature:G=0.7,api:J="openai",endpoint:W=null,apiKey:q=null,extra:Y={}}){let z=LQ(),K=TQ(),X=Math.max(Number(Y.max_tokens)||0,Number(z6.max_response)||0),V=Math.floor(X)||0;if(Number.isFinite(V)&&V>0)if((typeof Z==="string"?Z.toLowerCase():"").includes("gpt-5"))Y.max_completion_tokens=V,delete Y.max_tokens;else Y.max_tokens=V;if(Y.max_output_tokens!=null){let A=Number.parseFloat(Y.max_output_tokens),B=Number.isFinite(A)?Math.floor(A):0;if(Number.isFinite(Y.max_tokens)&&Y.max_tokens>0)Y.max_output_tokens=Math.min(B,Y.max_tokens);else Y.max_output_tokens=B}let F={messages:[{role:"user",content:Q}],model:Z,temperature:G,chat_completion_source:J,...Y};if(J==="full-manual"){let A=String(W||"").trim();if(!A)throw new X6("Full Manual Configuration requires an API Endpoint URL.");z=A,K={"Content-Type":"application/json"};let B=q!=null?String(q).trim():"";if(B)K.Authorization=`Bearer ${B}`;F={model:Z,messages:[{role:"user",content:Q}],temperature:G,...Y}}else if(J==="custom"&&Z)F.custom_model_id=Z,F.custom_url=z6.custom_url||"";else if(J==="deepseek")F.custom_url="https://api.deepseek.com/chat/completions";let j=await fetch(z,{method:"POST",headers:K,body:JSON.stringify(F)});if(!j.ok){let A="";try{A=await j.text()}catch(D){A=""}let B=Error(`LLM request failed: ${j.status} ${j.statusText}`);if(A)B.providerBody=A;throw B}let O=await j.json(),H="";if(O.choices?.[0]?.message?.content)H=O.choices[0].message.content;else if(O.completion)H=O.completion;else if(O.choices?.[0]?.text)H=O.choices[0].text;else if(O.content&&Array.isArray(O.content))H=O.content.find((B)=>B&&typeof B==="object"&&B.type==="text"&&B.text)?.text||"";else if(typeof O.content==="string")H=O.content;return{text:H,full:O}}async function o4({api:Z,model:Q,prompt:G,temperature:J=0.7,endpoint:W=null,apiKey:q=null,extra:Y={}}){return await h1({model:Q,prompt:G,temperature:J,api:Z,endpoint:W,apiKey:q,extra:Y})}async function wQ(Z={},Q=null){let G;if(typeof Z==="number")G={maxWaitMs:Z,initialIntervalMs:Q||250,maxIntervalMs:1000,backoffMultiplier:1.2,useExponentialBackoff:!1};else G={maxWaitMs:5000,initialIntervalMs:100,maxIntervalMs:1000,backoffMultiplier:1.5,useExponentialBackoff:!0,...Z};let{maxWaitMs:J,initialIntervalMs:W,maxIntervalMs:q,backoffMultiplier:Y,useExponentialBackoff:z,signal:K}=G,X=Date.now(),V=W,F=0,{getCurrentMemoryBooksContext:j}=await Promise.resolve().then(() => (b0(),I4)),O=j();while(Date.now()-X<J){if(K?.aborted)return!1;let H=W;if(O.isGroupChat){if(p4&&O.groupId){if(p4.find((B)=>B.id===O.groupId))return!0}}else if(GZ&&GZ.length>c4&&GZ[c4])return!0;if(await new Promise((A,B)=>{let D=setTimeout(A,H);if(K){let T=()=>{clearTimeout(D),B(Error("Cancelled"))};K.addEventListener("abort",T,{once:!0})}}).catch(()=>{return!1}),z&&H<q)H=Math.min(H*Y,q)}return!1}function CQ(Z){try{if(typeof Z==="object"&&Z!==null&&Array.isArray(Z.content)){let Q=Z.content.find((G)=>G&&typeof G==="object"&&G.type==="text"&&G.text);if(Q&&typeof Q.text==="string")return Q.text}return null}catch(Q){return null}}function hQ(Z){try{let Q=0,G=0,J=!1,W=!1;for(let q=0;q<Z.length;q++){let Y=Z[q];if(J){if(W)W=!1;else if(Y==="\\")W=!0;else if(Y==='"')J=!1}else if(Y==='"')J=!0;else if(Y==="{")Q++;else if(Y==="}")Q--;else if(Y==="[")G++;else if(Y==="]")G--;if(Q<0||G<0)return!0}return J||Q!==0||G!==0}catch{return!1}}function MQ(Z){let Q=(Z||"").trim();if(!Q)return!0;if(/[.!?]["'’\)\]]?$/.test(Q))return!0;if(Q.length>=80&&!/[.!?]$/.test(Q))return!1;return!0}function vQ(Z){return String(Z).replace(/\r\n/g,`
`).replace(/^\uFEFF/,"").replace(/[\u0000-\u001F\u200B-\u200D\u2060]/g,"")}function PQ(Z){let Q=/```([\w-]*)\s*([\s\S]*?)```/g,G=[],J;while((J=Q.exec(Z))!==null)G.push((J[2]||"").trim());return G}function xQ(Z){let Q=Z.search(/[\{\[]/);if(Q===-1)return null;let G=Z[Q],J=G==="{"?"}":"]",W=0,q=!1,Y=!1;for(let z=Q;z<Z.length;z++){let K=Z[z];if(q){if(Y)Y=!1;else if(K==="\\")Y=!0;else if(K==='"')q=!1;continue}if(K==='"'){q=!0;continue}if(K===G)W++;else if(K===J){if(W--,W===0)return Z.slice(Q,z+1).trim()}}return null}function SQ(Z){return/[\{\[]/.test(Z)}function EQ(Z){let Q=new Set,G=[];for(let J of Z)if(!Q.has(J))Q.add(J),G.push(J);return G}function P0(Z,Q,G=!0){let J=new F8(Q);J.code=Z,J.recoverable=G;try{console.debug(`STMemoryBooks: AIResponseError code=${Z} recoverable=${G}: ${Q}`)}catch{}return J}function JZ(Z){let Q=Z;try{let V=!!C8?.STMemoryBooks?.moduleSettings?.useRegex,F=C8?.STMemoryBooks?.moduleSettings?.selectedRegexIncoming;if(V&&typeof Q==="string"&&Array.isArray(F)&&F.length>0)Q=l4(Q,F)}catch(V){console.warn("STMemoryBooks: incoming regex application failed",V)}if(typeof Q==="object"&&Q!==null&&Array.isArray(Q.content)){let V=CQ(Q);if(V)Q=V;else{let F=P0("EMPTY_OR_INVALID","AI response is empty or invalid",!1);try{F.rawResponse=JSON.stringify(Q)}catch{}throw F}}else if(typeof Q==="object"&&Q!==null&&Q.content)Q=Q.content;if(typeof Q==="object"&&Q!==null)try{let F=Q?.candidates?.[0]?.content?.parts;if(Array.isArray(F)&&F.length>0){let j=F.map((O)=>O&&typeof O.text==="string"?O.text:"").join("");if(j&&j.trim())Q=j}}catch(V){}if(!Q||typeof Q!=="string"){let V=P0("EMPTY_OR_INVALID","AI response is empty or invalid",!1);try{V.rawResponse=typeof Q==="string"?Q:JSON.stringify(Q)}catch{}throw V}Q=Q.trim(),Q=Q.replace(/<think>[\s\S]*?<\/think>/gi,"");let G=vQ(Q),J=[],W=PQ(G);if(W.length)J.push(...W);J.push(G);let q=xQ(G);if(q)J.push(q);let Y=EQ(J),z=(V)=>{if(!V||typeof V!=="object")return P0("EMPTY_OR_INVALID","AI response is empty or invalid",!1);if(!V.content&&!V.summary&&!V.memory_content)return P0("MISSING_FIELDS_CONTENT","AI response missing content field",!1);if(!V.title)return P0("MISSING_FIELDS_TITLE","AI response missing title field",!1);if(!Array.isArray(V.keywords))return P0("INVALID_KEYWORDS","AI response missing or invalid keywords array.",!1);return null},K=null;for(let V of Y){try{let F=JSON.parse(V),j=z(F);if(j)K=j;else return F}catch{}try{let F=i4.default.parse(V),j=z(F);if(j)K=j;else return F}catch{}}if(!SQ(G)){let V=P0("NO_JSON_BLOCK","AI response did not contain a JSON block. The model may have returned prose or declined the request.",!0);throw V.rawResponse=G,V}if(hQ(G)){let V=P0("UNBALANCED","AI response appears truncated or invalid JSON (unbalanced structures). Try increasing Max Response Length.",!1);throw V.rawResponse=G,V}let X=G.trim();if(X&&X.length>=80&&!MQ(X)){let V=P0("INCOMPLETE_SENTENCE","AI response JSON appears incomplete (text ends mid-sentence). Try increasing Max Response Length.",!1);throw V.rawResponse=G,V}if(K)throw K.rawResponse=G,K;{let V=P0("MALFORMED","AI did not return valid JSON. This may indicate the model does not support structured output well or the response contained unsupported formatting.",!1);throw V.rawResponse=G,V}}async function bQ(Z,Q){if(!await wQ())throw new F8("Character data is not available. This may indicate that SillyTavern is still loading. Please wait a moment and try again.");let J=Q?.effectiveConnection||Q?.connection||{};try{let W=q0(J.api||o().api),q={};if(z6.openai_max_tokens)q.max_tokens=z6.openai_max_tokens;let{text:Y,full:z}=await h1({model:J.model,prompt:Z,temperature:J.temperature,api:W,endpoint:J.endpoint,apiKey:J.apiKey,extra:q}),K=z?.choices?.[0]?.finish_reason||z?.finish_reason||z?.stop_reason,X=typeof K==="string"?K.toLowerCase():"";if(X.includes("length")||X.includes("max")){let F=P0("PROVIDER_TRUNCATION","Model response appears truncated (provider finish_reason). Please increase Max Response Length.",!1);try{F.rawResponse=Y||""}catch{}try{F.providerResponse=z||null}catch{}throw F}if(z?.truncated===!0){let F=P0("PROVIDER_TRUNCATION_FLAG","Model response appears truncated (provider flag). Please increase Max Response Length.",!1);try{F.rawResponse=Y||""}catch{}try{F.providerResponse=z||null}catch{}throw F}let V=JZ(Y);return{content:V.content||V.summary||V.memory_content||"",title:V.title||"Memory",keywords:V.keywords||[],profile:Q}}catch(W){if(W instanceof F8)throw W;let q=new F8(`Memory generation failed: ${W.message||W}`);try{if(typeof W?.providerBody==="string")q.providerBody=W.providerBody;if(typeof W?.rawResponse==="string")q.rawResponse=W.rawResponse}catch{}throw q}}async function n4(Z,Q,G={}){try{yQ(Z,Q);let J=await gQ(Z,Q),W=await kQ(J),q=G.tokenWarningThreshold??30000;if(W.total>q)throw new $Z("Token warning threshold exceeded.",W.total);let Y=await bQ(J,Q),z=uQ(Y,Z);return{content:z.content,extractedTitle:z.extractedTitle,metadata:{sceneRange:`${Z.metadata.sceneStart}-${Z.metadata.sceneEnd}`,messageCount:Z.metadata.messageCount,characterName:Z.metadata.characterName,userName:Z.metadata.userName,chatId:Z.metadata.chatId,createdAt:new Date().toISOString(),profileUsed:Q.name,presetUsed:Q.preset||"custom",tokenUsage:W,generationMethod:"json-structured-output",version:"2.0"},suggestedKeys:z.suggestedKeys,titleFormat:Q.useDynamicSTSettings||Q?.connection?.api==="current_st"?C8.STMemoryBooks?.titleFormat||"[000] - {{title}}":Q.titleFormat||"[000] - {{title}}",lorebookSettings:{constVectMode:Q.constVectMode,position:Q.position,orderMode:Q.orderMode,orderValue:Q.orderValue,preventRecursion:Q.preventRecursion,delayUntilRecursion:Q.delayUntilRecursion,outletName:Number(Q.position)===7?Q.outletName||"":void 0},lorebook:{content:z.content,comment:`Auto-generated memory from messages ${Z.metadata.sceneStart}-${Z.metadata.sceneEnd}. Profile: ${Q.name}.`,key:z.suggestedKeys||[],keysecondary:[],selective:!0,constant:!1,order:100,position:"before_char",disable:!1,addMemo:!0,excludeRecursion:!1,delayUntilRecursion:!0,probability:100,useProbability:!1}}}catch(J){if(J instanceof $Z||J instanceof F8||J instanceof X6)throw J;throw Error(`Memory creation failed: ${J.message}`)}}function yQ(Z,Q){if(!Z||!Array.isArray(Z.messages)||Z.messages.length===0)throw Error("Invalid or empty compiled scene data provided.");let G=typeof Q?.prompt==="string"&&Q.prompt.trim().length>0,J=typeof Q?.preset==="string"&&Q.preset.trim().length>0;if(!G&&!J)throw new X6("Invalid profile configuration. You must set either a custom prompt or a valid preset.")}function fQ(Z,Q,G=[]){let J=Z.map((q)=>{let Y=q.name||"Unknown",z=(q.mes||"").trim();return z?`${Y}: ${z}`:null}).filter(Boolean),W=[""];if(G&&G.length>0)W.push("=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ==="),W.push("These are previous memories for context only. Do NOT include them in your new memory:"),W.push(""),G.forEach((q,Y)=>{if(W.push(`Context ${Y+1} - ${q.title}:`),W.push(q.content),q.keywords&&q.keywords.length>0)W.push(`Keywords: ${q.keywords.join(", ")}`);W.push("")}),W.push("=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ==="),W.push("");return W.push("=== SCENE TRANSCRIPT ==="),W.push(...J),W.push(""),W.push("=== END SCENE ==="),W.join(`
`)}async function kQ(Z){return await $1(Z,{estimatedOutput:300})}async function gQ(Z,Q){let{metadata:G,messages:J,previousSummariesContext:W}=Z,q=await I1(Q),Y=DQ(q,G.userName,G.characterName),z=fQ(J,G,W),K=`${Y}

${z}`;try{let X=!!C8?.STMemoryBooks?.moduleSettings?.useRegex,V=C8?.STMemoryBooks?.moduleSettings?.selectedRegexOutgoing;if(X&&Array.isArray(V)&&V.length>0)return l4(K,V)}catch(X){console.warn("STMemoryBooks: outgoing regex application failed",X)}return K}function uQ(Z,Q){let{content:G,title:J,keywords:W}=Z,q=(G||Z.summary||Z.memory_content||"").trim(),Y=(J||"Memory").trim(),z=Array.isArray(W)?W.filter((K)=>K&&typeof K==="string"&&K.trim()!=="").map((K)=>K.trim()):[];return{content:q,extractedTitle:Y,suggestedKeys:z}}e1();import{getContext as vJ}from"../../../extensions.js";import{METADATA_KEY as xJ,loadWorldInfo as SJ,createWorldInfoEntry as WZ,saveWorldInfo as qZ,reloadEditor as YZ}from"../../../world-info.js";import{extension_settings as s4}from"../../../extensions.js";import{moment as r4}from"../../../../lib.js";import{executeSlashCommands as mQ}from"../../../slash-commands.js";import{translate as dQ}from"../../../i18n.js";var H0="STMemoryBooks-AddLore";function E(Z,Q,G){let J=dQ(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}function a4(Z){if(!Z)return null;let Q=Z.split("-");if(Q.length!==2)return null;let G=parseInt(Q[0],10),J=parseInt(Q[1],10);if(isNaN(G)||isNaN(J)||G<0||J<0)return null;return{start:G,end:J}}async function cQ(Z,Q=""){let G=Q?` (${Q})`:"";console.log(E("addlore.log.executingHideCommand",`${H0}: Executing hide command${G}: {{hideCommand}}`,{hideCommand:Z})),await mQ(Z)}async function V6(Z,Q=""){try{await cQ(Z,Q)}catch(G){console.warn(E("addlore.warn.autohideFailed",`${H0}: Auto-hide failed:`),G)}}function pQ(Z={}){if(Z.autoHideMode)return Z.autoHideMode;if(Z.autoHideAllMessages)return"all";else if(Z.autoHideLastMemory)return"last";else return"none"}var iQ=["[000] - {{title}} ({{profile}})","{{date}} [000] \uD83C\uDFAC{{title}}, {{messages}} msgs","[000] {{date}} - {{char}} Memory","[00] - {{user}} & {{char}} {{scene}}","\uD83E\uDDE0 [000] ({{messages}} msgs)","\uD83D\uDCDA Memory #[000] - {{profile}} {{date}} {{time}}","[000] - {{scene}}: {{title}}","[000] - {{title}} ({{scene}})","[000] - {{title}}"];async function zZ(Z,Q){try{if(!Z?.content)throw Error(E("addlore.errors.invalidContent","Invalid memory result: missing content"));if(!Q?.valid||!Q.data)throw Error(E("addlore.errors.invalidLorebookValidation","Invalid lorebook validation data"));let G=s4.STMemoryBooks||{},J=Z.titleFormat;if(!J)J=G.titleFormat||E("addlore.titleFormats.8","[000] - {{title}}");let W=G.moduleSettings?.refreshEditor!==!1,q=Z.lorebookSettings||{constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0},Y=WZ(Q.name,Q.data);if(!Y)throw Error(E("addlore.errors.createEntryFailed","Failed to create new lorebook entry"));let z=oQ(J,Z,Q.data);if(lQ(Y,Z,z,q),await qZ(Q.name,Q.data,!0),G.moduleSettings?.showNotifications!==!1)toastr.success(E("addlore.toast.added",'Memory "{{entryTitle}}" added to "{{lorebookName}}"',{entryTitle:z,lorebookName:Q.name}),E("addlore.toast.title","STMemoryBooks"));if(W)try{await Promise.resolve(YZ(Q.name))}catch(X){console.warn(E("addlore.warn.refreshEditorFailed",`${H0}: reloadEditor failed:`),X)}let K=pQ(G.moduleSettings);if(K!=="none"){let X=G.moduleSettings.unhiddenEntriesCount??2;if(K==="all"){let V=a4(Z.metadata?.sceneRange);if(!V)console.warn(E("addlore.warn.autohideSkippedInvalidRange",`${H0}: Auto-hide skipped - invalid scene range: "{{range}}"`,{range:Z.metadata?.sceneRange})),toastr.warning(E("addlore.toast.autohideInvalidRange","Auto-hide skipped: invalid scene range metadata"),E("addlore.toast.title","STMemoryBooks"));else{let{start:F,end:j}=V;if(X===0)await V6(`/hide 0-${j}`,E("addlore.hideCommand.allComplete","all mode - complete"));else{let O=j-X;if(O>=0)await V6(`/hide 0-${O}`,E("addlore.hideCommand.allPartial","all mode - partial"))}}}else if(K==="last"){let V=a4(Z.metadata?.sceneRange);if(!V)console.warn(E("addlore.warn.autohideSkippedInvalidRange",`${H0}: Auto-hide skipped - invalid scene range: "{{range}}"`,{range:Z.metadata?.sceneRange})),toastr.warning(E("addlore.toast.autohideInvalidRange","Auto-hide skipped: invalid scene range metadata"),E("addlore.toast.title","STMemoryBooks"));else{let{start:F,end:j}=V,O=j-F+1;if(X>=O);else if(X===0)await V6(`/hide ${F}-${j}`,E("addlore.hideCommand.lastHideAll","last mode - hide all"));else{let H=j-X;if(H>=F)await V6(`/hide ${F}-${H}`,E("addlore.hideCommand.lastPartial","last mode - partial"))}}}}return tQ(Z),{success:!0,entryId:Y.uid,entryTitle:z,lorebookName:Q.name,keywordCount:Z.suggestedKeys?.length||0,message:E("addlore.result.added",'Memory successfully added to "{{lorebookName}}"',{lorebookName:Q.name})}}catch(G){if(console.error(E("addlore.log.addFailed",`${H0}: Failed to add memory to lorebook:`),G),s4.STMemoryBooks?.moduleSettings?.showNotifications!==!1)toastr.error(E("addlore.toast.addFailed","Failed to add memory: {{message}}",{message:G.message}),E("addlore.toast.title","STMemoryBooks"));return{success:!1,error:G.message,message:E("addlore.result.addFailed","Failed to add memory to lorebook: {{message}}",{message:G.message})}}}function lQ(Z,Q,G,J){Z.content=Q.content,Z.key=Q.suggestedKeys||[],Z.comment=G;let W=h8(G)||1;switch(J.constVectMode){case"blue":Z.constant=!0,Z.vectorized=!1;break;case"green":Z.constant=!1,Z.vectorized=!1;break;case"link":default:Z.constant=!1,Z.vectorized=!0;break}if(Z.position=J.position,Number(J.position)===7){let q=String(J.outletName||"").trim();if(q)Z.outletName=q}if(J.orderMode==="manual")Z.order=J.orderValue;else Z.order=W;if(Z.preventRecursion=J.preventRecursion,Z.delayUntilRecursion=J.delayUntilRecursion,Z.keysecondary=[],Z.selective=!0,Z.selectiveLogic=0,Z.addMemo=!0,Z.disable=!1,Z.excludeRecursion=!1,Z.probability=100,Z.useProbability=!0,Z.depth=4,Z.group="",Z.groupOverride=!1,Z.groupWeight=100,Z.scanDepth=null,Z.caseSensitive=null,Z.matchWholeWords=null,Z.useGroupScoring=null,Z.automationId="",Z.role=null,Z.sticky=0,Z.cooldown=0,Z.delay=0,Z.displayIndex=W,Z.stmemorybooks=!0,Q.metadata?.sceneRange){let q=Q.metadata.sceneRange.split("-");if(q.length===2)Z.STMB_start=parseInt(q[0],10),Z.STMB_end=parseInt(q[1],10)}}function t4(Z){return Z.stmemorybooks===!0}function oQ(Z,Q,G){let J=Z,W=[{pattern:/\[\[0+\]\]/g,prefix:"[",suffix:"]"},{pattern:/\[0+\]/g,prefix:"",suffix:""},{pattern:/\(\[0+\]\)/g,prefix:"(",suffix:")"},{pattern:/\{\[0+\]\}/g,prefix:"{",suffix:"}"},{pattern:/#\[0+\]/g,prefix:"#",suffix:""}];for(let{pattern:z,prefix:K,suffix:X}of W){let V=J.match(z);if(V){let F=nQ(G,Z);V.forEach((j)=>{let O;if(z.source.includes("\\[\\["))O=j.length-4;else if(z.source.includes("\\(\\[")||z.source.includes("\\{\\["))O=j.length-4;else if(z.source.includes("#\\["))O=j.length-3;else if(z.source.includes("\\["))O=j.length-2;else O=j.length-2;let H=F.toString().padStart(O,"0"),A=K+H+X;J=J.replace(j,A)});break}}let q=Q.metadata||{},Y={"{{title}}":Q.extractedTitle||E("addlore.defaults.title","Memory"),"{{scene}}":E("addlore.defaults.scene","Scene {{range}}",{range:q.sceneRange||E("common.unknown","Unknown")}),"{{char}}":q.characterName||E("common.unknown","Unknown"),"{{user}}":q.userName||E("addlore.defaults.user","User"),"{{messages}}":q.messageCount||0,"{{profile}}":q.profileUsed||E("common.unknown","Unknown"),"{{date}}":r4().format("YYYY-MM-DD"),"{{time}}":r4().format("HH:mm:ss")};return Object.entries(Y).forEach(([z,K])=>{J=J.replace(new RegExp(z.replace(/[{}]/g,"\\$&"),"g"),K)}),J=aQ(J),J}function nQ(Z,Q=null){if(!Z.entries)return 1;let G=Object.values(Z.entries),J=[];if(G.forEach((q)=>{if(t4(q)&&q.comment){let Y=Q?sQ(q.comment,Q):h8(q.comment);if(Y!==null)J.push(Y)}}),J.length===0)return 1;return Math.max(...J)+1}function sQ(Z,Q){if(!Z||typeof Z!=="string"||!Q||typeof Q!=="string")return null;let G=[/\[0+\]/g,/\(0+\)/g,/\{0+\}/g,/#0+/g],J=[],W=null;for(let Y of G){let z=[...Q.matchAll(Y)];if(z.length>0){J=z,W=Y;break}}if(J.length===0)return h8(Z);let q=rQ(Q);if(q=q.replace(/\\\{\\\{[^}]+\\\}\\\}/g,".*?"),W.source.includes("\\["))q=q.replace(/\\\[0+\\\]/g,"(\\d+)");else if(W.source.includes("\\("))q=q.replace(/\\\(0+\\\)/g,"(\\d+)");else if(W.source.includes("\\{"))q=q.replace(/\\\{0+\\\}/g,"(\\d+)");else if(W.source.includes("#"))q=q.replace(/#0+/g,"(\\d+)");try{let Y=Z.match(new RegExp(q));if(Y&&Y[1]){let z=parseInt(Y[1],10);return isNaN(z)?null:z}}catch(Y){}return h8(Z)}function rQ(Z){return Z.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function h8(Z){if(!Z||typeof Z!=="string")return null;let Q=Z.match(/\[(\d+)\]/);if(Q){let z=parseInt(Q[1],10);return isNaN(z)?null:z}let G=Z.match(/\((\d+)\)/);if(G){let z=parseInt(G[1],10);return isNaN(z)?null:z}let J=Z.match(/\{(\d+)\}/);if(J){let z=parseInt(J[1],10);return isNaN(z)?null:z}let W=Z.match(/#(\d+)(?:-(\d+))?/);if(W){let z=parseInt(W[1],10),K=W[2]?parseInt(W[2],10):null,X=K!==null?K:z;return isNaN(X)?null:X}let q=Z.match(/^(\d+)(?:\s*[-\s])/);if(q){let z=parseInt(q[1],10);return isNaN(z)?null:z}let Y=[...Z.matchAll(/(\d+)/g)];for(let z of Y){let K=parseInt(z[1],10);if(isNaN(K))continue;let X=z[0],V=z.index,F=Z.substring(Math.max(0,V-10),V),j=Z.substring(V+X.length,V+X.length+10);if(!(/\d{4}-\d{2}-\d{2}/.test(F+X+j)||/\d{4}-\d{1,2}/.test(F+X)||/-\d{1,2}-\d{1,2}/.test(X+j)))return K}return null}function U8(Z){if(!Z.entries)return[];let Q=Object.values(Z.entries),G=[];return Q.forEach((J)=>{if(t4(J)){let W=h8(J.comment)||0;G.push({number:W,title:J.comment,content:J.content,keywords:J.key||[],entry:J})}}),G.sort((J,W)=>J.number-W.number),G}function aQ(Z){return String(Z??"").replace(/[\u0000-\u001F\u007F-\u009F]/g,"").trim()||E("addlore.sanitize.fallback","Auto Memory")}function Y1(){return iQ.map((Z,Q)=>E(`addlore.titleFormats.${Q}`,Z))}function e4(Z){if(typeof Z.STMB_start==="number"&&typeof Z.STMB_end==="number")return{start:Z.STMB_start,end:Z.STMB_end};return null}function tQ(Z){try{console.log(E("addlore.log.updateHighestCalled",`${H0}: updateHighestMemoryProcessed called with:`),Z);let Q=Z.metadata?.sceneRange;if(console.log(E("addlore.log.sceneRangeExtracted",`${H0}: sceneRange extracted:`),Q),!Q){console.warn(E("addlore.warn.noSceneRange",`${H0}: No scene range found in memory result, cannot update highest processed`));return}let G=Q.split("-");if(G.length!==2){console.warn(E("addlore.warn.invalidSceneRangeFormat",`${H0}: Invalid scene range format: {{range}}`,{range:Q}));return}let J=parseInt(G[1],10);if(isNaN(J)){console.warn(E("addlore.warn.invalidEndMessage",`${H0}: Invalid end message number: {{end}}`,{end:G[1]}));return}let W=f();if(!W){console.warn(E("addlore.warn.noSceneMarkers",`${H0}: Could not get scene markers to update highest processed`));return}W.highestMemoryProcessed=J,Z0(),console.log(E("addlore.log.setHighest",`${H0}: Set highest memory processed to message {{endMessage}}`,{endMessage:J}))}catch(Q){console.error(E("addlore.log.updateHighestError",`${H0}: Error updating highest memory processed:`),Q)}}function z0(Z,Q){if(!Z||!Z.entries||!Q)return null;let G=Object.values(Z.entries);for(let J of G)if((J.comment||"")===Q)return J;return null}async function M8(Z,Q,G,J={}){let{refreshEditor:W=!0}=J;if(!Z||!Q||!Array.isArray(G))throw Error(E("addlore.upsert.errors.invalidArgs","Invalid arguments to upsertLorebookEntriesBatch"));let q=[];for(let Y of G){if(!Y||!Y.title)continue;let z=String(Y.title),K=Y.content!=null?String(Y.content):"",X=Y.defaults||{},V=Y.metadataUpdates||{},F=Y.entryOverrides||{},j=z0(Q,z),O=!1;if(!j){if(j=WZ(Z,Q),!j)throw Error(E("addlore.upsert.errors.createFailed","Failed to create lorebook entry"));if(j.vectorized=!!X.vectorized,j.selective=!!X.selective,typeof X.order==="number")j.order=X.order;if(typeof X.position==="number")j.position=X.position;j.disable=!1,O=!0}if(j.key=Array.isArray(j.key)?j.key:[],j.keysecondary=Array.isArray(j.keysecondary)?j.keysecondary:[],typeof j.disable!=="boolean")j.disable=!1;j.comment=z,j.content=K;for(let[H,A]of Object.entries(V))j[H]=A;for(let[H,A]of Object.entries(F))j[H]=A;q.push({title:z,uid:j.uid,created:O})}if(await qZ(Z,Q,!0),W)YZ(Z);return q}async function XZ(Z,Q,G,J,W={}){let{defaults:q={vectorized:!0,selective:!0,order:100,position:0},metadataUpdates:Y={},refreshEditor:z=!0,entryOverrides:K={}}=W;if(!Z||!Q||!G)throw Error(E("addlore.upsert.errors.invalidArgs","Invalid arguments to upsertLorebookEntryByTitle"));let X=z0(Q,G),V=!1;if(!X){if(X=WZ(Z,Q),!X)throw Error(E("addlore.upsert.errors.createFailed","Failed to create lorebook entry"));if(X.vectorized=!!q.vectorized,X.selective=!!q.selective,typeof q.order==="number")X.order=q.order;if(typeof q.position==="number")X.position=q.position;X.key=X.key||[],X.keysecondary=X.keysecondary||[],X.disable=!1,V=!0}X.comment=G,X.content=J!=null?String(J):"";for(let[F,j]of Object.entries(Y||{}))X[F]=j;for(let[F,j]of Object.entries(K||{}))X[F]=j;if(await qZ(Z,Q,!0),z)YZ(Z);return{uid:X.uid,created:V}}import{getCurrentChatId as eQ,name1 as ZG,name2 as QG,chat_metadata as GG,saveMetadata as $G}from"../../../../script.js";import{createNewWorldInfo as JG,METADATA_KEY as WG,world_names as VZ}from"../../../world-info.js";import{translate as qG}from"../../../i18n.js";var K6="STMemoryBooks-AutoCreate";function x0(Z,Q,G){let J=qG(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}function YG(Z){if(!Z||Z.trim()==="")Z=x0("STMemoryBooks_LorebookNameTemplatePlaceholder","LTM - {{char}} - {{chat}}");let Q=eQ()||x0("common.unknown","Unknown"),G=QG||x0("common.unknown","Unknown"),J=ZG||x0("addlore.defaults.user","User"),W=Z.replace(/\{\{chat\}\}/g,Q).replace(/\{\{char\}\}/g,G).replace(/\{\{user\}\}/g,J);if(W=W.replace(/[\/\\:*?"<>|]/g,"_").replace(/_{2,}/g,"_").substring(0,60),!VZ||!VZ.includes(W))return W;for(let q=2;q<=999;q++){let Y=`${W} ${q}`;if(!VZ.includes(Y))return Y}return`${W} ${Date.now()}`}async function j6(Z,Q="chat"){try{let G=YG(Z);if(console.log(x0("autocreate.log.creating",`${K6}: Auto-creating lorebook "{{name}}" for {{context}}`,{name:G,context:Q})),await JG(G))return GG[WG]=G,await $G(),console.log(x0("autocreate.log.created",`${K6}: Successfully created and bound lorebook "{{name}}"`,{name:G})),toastr.success(x0("autocreate.toast.createdBound",'Created and bound lorebook "{{name}}"',{name:G}),x0("autocreate.toast.title","STMemoryBooks")),{success:!0,name:G};else return console.error(x0("autocreate.log.createFailed",`${K6}: Failed to create lorebook`)),{success:!1,error:x0("autocreate.errors.failedAutoCreate","Failed to auto-create lorebook.")}}catch(G){return console.error(x0("autocreate.log.createError",`${K6}: Error creating lorebook:`),G),{success:!1,error:x0("autocreate.errors.failedAutoCreateWithMessage","Failed to auto-create lorebook: {{message}}",{message:G.message})}}}e1();b0();import{extension_settings as v8}from"../../../extensions.js";import{chat as F6,chat_metadata as zG}from"../../../../script.js";import{METADATA_KEY as XG,world_names as Z5}from"../../../world-info.js";import{Popup as VG,POPUP_TYPE as KG,POPUP_RESULT as Q5}from"../../../popup.js";import{translate as jG}from"../../../i18n.js";function n(Z,Q,G){let J=jG(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}async function FG(){let Z=v8.STMemoryBooks,Q;if(!Z.moduleSettings.manualModeEnabled){if(Q=zG?.[XG]||null,!Q&&Z?.moduleSettings?.autoCreateLorebook){let G=Z.moduleSettings.lorebookNameTemplate||n("STMemoryBooks_LorebookNameTemplatePlaceholder","LTM - {{char}} - {{chat}}"),J=await j6(G,"auto-summary");if(J.success)Q=J.name;else return{valid:!1,error:J.error}}}else{let G=f()||{};if(Q=G.manualLorebook??null,!Q){let W=new VG(`
                <h4 data-i18n="STMemoryBooks_AutoSummaryReadyTitle">Auto-Summary Ready</h4>
                <div class="world_entry_form_control">
                    <p data-i18n="STMemoryBooks_AutoSummaryNoAssignedLorebook">Auto-summary is enabled but there is no assigned lorebook for this chat.</p>
                    <p data-i18n="STMemoryBooks_AutoSummarySelectOrPostponeQuestion">Would you like to select a lorebook for memory storage, or postpone this auto-summary?</p>
                    <label for="stmb-postpone-messages" data-i18n="STMemoryBooks_PostponeLabel">Postpone for how many messages?</label>
                    <select id="stmb-postpone-messages" class="text_pole">
                        <option value="10" data-i18n="STMemoryBooks_Postpone10">10 messages</option>
                        <option value="20" data-i18n="STMemoryBooks_Postpone20">20 messages</option>
                        <option value="30" data-i18n="STMemoryBooks_Postpone30">30 messages</option>
                        <option value="40" data-i18n="STMemoryBooks_Postpone40">40 messages</option>
                        <option value="50" data-i18n="STMemoryBooks_Postpone50">50 messages</option>
                    </select>
                </div>
            `,KG.TEXT,"",{okButton:n("STMemoryBooks_Button_SelectLorebook","Select Lorebook"),cancelButton:n("STMemoryBooks_Button_Postpone","Postpone")});if(await W.show()===Q5.AFFIRMATIVE){let Y=await _1();if(Y)G.manualLorebook=Y,Z0(),Q=Y;else return{valid:!1,error:n("STMemoryBooks_Error_NoLorebookSelectedForAutoSummary","No lorebook selected for auto-summary.")}}else{let Y=W.dlg.querySelector("#stmb-postpone-messages"),z=parseInt(Y.value,10),K=Number.isFinite(z)?z:10,X=F6.length;return G.autoSummaryNextPromptAt=X+K,Z0(),console.log(n("autosummary.log.postponed","STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})",{count:K,until:G.autoSummaryNextPromptAt})),{valid:!1,error:n("STMemoryBooks_Info_AutoSummaryPostponed","Auto-summary postponed for {{count}} messages.",{count:K})}}}}if(!Q)return{valid:!1,error:n("STMemoryBooks_Error_NoLorebookForAutoSummary","No lorebook available for auto-summary.")};if(!Z5||!Z5.includes(Q))return{valid:!1,error:n("STMemoryBooks_Error_SelectedLorebookNotFound",'Selected lorebook "{{name}}" not found.',{name:Q})};try{let{loadWorldInfo:G}=await import("../../../world-info.js"),J=await G(Q);return{valid:!!J,data:J,name:Q}}catch(G){return{valid:!1,error:n("STMemoryBooks_Error_FailedToLoadSelectedLorebook","Failed to load the selected lorebook.")}}}async function G5(){try{let Z=v8.STMemoryBooks;if(!Z?.moduleSettings?.autoSummaryEnabled)return;let Q=f()||{},G=F6.length,J=G-1,W=Z.moduleSettings.autoSummaryInterval,q=Z?.moduleSettings?.autoSummaryBuffer,Y=K0(parseInt(q)||0,0,50),z=W+Y,K=Q.highestMemoryProcessed??null;if(W5()){console.log(n("autosummary.log.skippedInProgress","STMemoryBooks: Auto-summary skipped - memory creation in progress"));return}let X;if(K===null)X=G,console.log(n("autosummary.log.noPrevious","STMemoryBooks: No previous memories found - counting from start"));else X=J-K,console.log(n("autosummary.log.sinceLast","STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}",{highestProcessed:K,count:X}));if(console.log(n("autosummary.log.triggerCheck","STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?",{count:X,required:z})),X<z){console.log(n("autosummary.log.notTriggered","STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages",{needed:z-X}));return}if(Q.autoSummaryNextPromptAt&&G<Q.autoSummaryNextPromptAt){console.log(n("autosummary.log.postponedUntil","STMemoryBooks: Auto-summary postponed until message {{until}}",{until:Q.autoSummaryNextPromptAt}));return}let V=await FG();if(!V.valid){console.log(n("autosummary.log.blocked","STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}",{error:V.error}));return}if(Q.autoSummaryNextPromptAt)delete Q.autoSummaryNextPromptAt,Z0(),console.log(n("autosummary.log.clearedPostpone","STMemoryBooks: Cleared auto-summary postpone flag"));let F,j,O=J-Y,H=Math.max(0,O);if(K===null)F=0,j=H;else F=K+1,j=H;if(F>j)return;console.log(n("autosummary.log.triggered","STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}",{start:F,end:j})),Q.sceneStart=F,Q.sceneEnd=j,Z0();let{executeSlashCommands:A}=await import("../../../slash-commands.js");await A("/creatememory")}catch(Z){console.error(n("autosummary.log.triggerError","STMemoryBooks: Error in auto-summary trigger check:"),Z)}}async function $5(){try{let Z=Y8();if(!Z.isGroupChat&&v8.STMemoryBooks.moduleSettings.autoSummaryEnabled){let Q=F6.length;console.log(n("autosummary.log.messageReceivedSingle","STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}",{count:Q})),await G5()}else if(Z.isGroupChat)console.log(n("autosummary.log.messageReceivedGroup","STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED"))}catch(Z){console.error(n("autosummary.log.messageHandlerError","STMemoryBooks: Error in auto-summary message received handler:"),Z)}}async function J5(){try{if(v8.STMemoryBooks.moduleSettings.autoSummaryEnabled){let Z=F6.length;console.log(n("autosummary.log.groupFinished","STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}",{count:Z})),await G5()}}catch(Z){console.error(n("autosummary.log.groupHandlerError","STMemoryBooks: Error in auto-summary group finished handler:"),Z)}}function KZ(){if(v8.STMemoryBooks?.moduleSettings?.autoSummaryEnabled)t1()}b0();import{saveSettingsDebounced as P8}from"../../../../script.js";import{Popup as U6,POPUP_TYPE as B8,POPUP_RESULT as z1}from"../../../popup.js";import{moment as q5,Handlebars as UG,DOMPurify as Y5}from"../../../../lib.js";t8();import{t as jZ,translate as k}from"../../../i18n.js";var B0="STMemoryBooks-ProfileManager",H8="Current SillyTavern Settings",z5=UG.compile(`
<div class="popup-content">
    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-name">
            <h4 data-i18n="STMemoryBooks_ProfileName">Profile Name:</h4>
            <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_ProfileNamePlaceholder" placeholder="Profile name" {{#if isNameLocked}}disabled title="Name locked for this profile"{{/if}}>
        </label>
    </div>


    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_ModelAndTempSettings">Model & Temperature Settings:</h4>
        <div class="info-block hint marginBot10" data-i18n="STMemoryBooks_ModelHint">
            For model, copy-paste the exact model ID, eg. <code>gemini-2.5-pro</code>, <code>deepseek/deepseek-r1-0528:free</code>, <code>gpt-4o-mini-2024-07-18</code>, etc.
        </div>

        <label for="stmb-profile-api">
            <h4 data-i18n="STMemoryBooks_APIProvider">API/Provider:</h4>
            <select id="stmb-profile-api" class="text_pole" {{#if isProviderLocked}}disabled title="Provider locked for this profile"{{/if}}>
                <option value="current_st" {{#if (eq connection.api "current_st")}}selected{{/if}} data-i18n="STMemoryBooks_CurrentSTSettings">Current SillyTavern Settings</option>

                <option value="ai21" {{#if (eq connection.api "ai21")}}selected{{/if}}>AI21</option>
                <option value="aimlapi" {{#if (eq connection.api "aimlapi")}}selected{{/if}}>AI/ML API</option>
                <option value="claude" {{#if (eq connection.api "claude")}}selected{{/if}}>Anthropic/Claude</option>
                <option value="azure_openai" {{#if (eq connection.api "azure_openai")}}selected{{/if}}>Azure OpenAI</option>
                <option value="cohere" {{#if (eq connection.api "cohere")}}selected{{/if}}>Cohere</option>
                <option value="cometapi" {{#if (eq connection.api "cometapi")}}selected{{/if}}>Comet API</option>
                <option value="deepseek" {{#if (eq connection.api "deepseek")}}selected{{/if}}>DeepSeek</option>
                <option value="electronhub" {{#if (eq connection.api "electronhub")}}selected{{/if}}>Electron Hub</option>
                <option value="fireworks" {{#if (eq connection.api "fireworks")}}selected{{/if}}>Fireworks</option>
                <option value="makersuite" {{#if (eq connection.api "makersuite")}}selected{{/if}}>Google AI Studio</option>
                <option value="groq" {{#if (eq connection.api "groq")}}selected{{/if}}>Groq</option>
                <option value="mistralai" {{#if (eq connection.api "mistralai")}}selected{{/if}}>MistralAI</option>
                <option value="moonshot" {{#if (eq connection.api "moonshot")}}selected{{/if}}>Moonshot</option>
                <option value="nanogpt" {{#if (eq connection.api "nanogpt")}}selected{{/if}}>NanoGPT</option>
                <option value="openai" {{#if (eq connection.api "openai")}}selected{{/if}}>OpenAI</option>
                <option value="openrouter" {{#if (eq connection.api "openrouter")}}selected{{/if}}>OpenRouter</option>
                <option value="perplexity" {{#if (eq connection.api "perplexity")}}selected{{/if}}>Perplexity</option>
                <option value="pollinations" {{#if (eq connection.api "pollinations")}}selected{{/if}}>Pollinations</option>
                <option value="siliconflow" {{#if (eq connection.api "siliconflow")}}selected{{/if}}>SiliconFlow</option>
                <option value="vertexai" {{#if (eq connection.api "vertexai")}}selected{{/if}}>Vertex AI</option>
                <option value="xai" {{#if (eq connection.api "xai")}}selected{{/if}}>xAI</option>
                <option value="zai" {{#if (eq connection.api "zai")}}selected{{/if}}>Z.AI</option>

                <option value="custom" {{#if (eq connection.api "custom")}}selected{{/if}} data-i18n="STMemoryBooks_CustomAPI">Custom OpenAI-Compatible API</option>
                <option value="full-manual" {{#if (eq connection.api "full-manual")}}selected{{/if}}>Full Manual Configuration</option>
            </select>
        </label>

        <div class="info-block warning marginBot10 {{#unless (eq connection.api 'full-manual')}}displayNone{{/unless}}" data-i18n="STMemoryBooks_FullManualConfig">
            ⚠️ EXCEPTIONAL setup - This should ONLY be used when you need a separate API connection to a different endpoint. Most users should NOT need this option.
        </div>
        <label for="stmb-profile-model">
            <h4 data-i18n="STMemoryBooks_Model">Model:</h4>
            <input type="text" id="stmb-profile-model" value="{{connection.model}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_ModelPlaceholder" placeholder="Paste model ID here" {{#if (eq connection.api "current_st")}}disabled title="Managed by SillyTavern UI"{{/if}}>
        </label>

        <label for="stmb-profile-temperature">
            <h4 data-i18n="STMemoryBooks_TemperatureRange">Temperature (0.0 - 2.0):</h4>
            <input type="number" id="stmb-profile-temperature" value="{{connection.temperature}}" class="text_pole" min="0" max="2" step="0.1" data-i18n="[placeholder]STMemoryBooks_TemperaturePlaceholder" placeholder="DO NOT LEAVE BLANK! If unsure put 0.8." {{#if (eq connection.api "current_st")}}disabled title="Managed by SillyTavern UI"{{/if}}>
        </label>

        <div id="stmb-full-manual-section" class="{{#unless (eq connection.api 'full-manual')}}displayNone{{/unless}}">
            <label for="stmb-profile-endpoint">
                <h4 data-i18n="STMemoryBooks_APIEndpointURL">API Endpoint URL:</h4>
                <input type="text" id="stmb-profile-endpoint" value="{{connection.endpoint}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_APIEndpointPlaceholder" placeholder="https://api.example.com/v1/chat/completions">
            </label>

            <label for="stmb-profile-apikey">
                <h4 data-i18n="STMemoryBooks_APIKey">API Key:</h4>
                <input type="password" id="stmb-profile-apikey" value="{{connection.apiKey}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_APIKeyPlaceholder" placeholder="Enter your API key">
            </label>
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-preset">
            <h4 data-i18n="STMemoryBooks_Profile_MemoryMethod">Memory Creation Method:</h4>
            <small data-i18n="STMemoryBooks_Profile_PresetSelectDesc">Choose a summary prompt. Edit or create custom prompts in the Summary Prompt Manager to see them in this list.</small>
            <select id="stmb-profile-preset" class="text_pole">
                {{#each presetOptions}}
                <option value="{{value}}" {{#if selected}}selected{{/if}}>{{displayName}}</option>
                {{/each}}
            </select>
        </label>
        {{#if hasLegacyCustomPrompt}}
        <div id="stmb-legacy-custom-prompt" class="displayNone">{{prompt}}</div>
        {{/if}}
    </div>

    <div class="world_entry_form_control marginTop5">
        <div class="buttons_block justifyCenter gap10px whitespacenowrap">
            <div id="stmb-open-prompt-manager" class="menu_button interactable" data-i18n="STMemoryBooks_OpenPromptManager">\uD83E\uDDE9 Open Summary Prompt Manager</div>
            <div id="stmb-refresh-presets" class="menu_button interactable" data-i18n="STMemoryBooks_RefreshPresets">\uD83D\uDD04 Refresh Presets</div>
            {{#if hasLegacyCustomPrompt}}
            <div id="stmb-move-to-preset" class="menu_button interactable" data-i18n="STMemoryBooks_MoveToPreset">\uD83D\uDCCC Move Current Custom Prompt to Preset</div>
            {{/if}}
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_TitleFormat">Memory Title Format:</h4>
        <small class="opacity50p" data-i18n="STMemoryBooks_TitleFormatDesc">Use [0], [00], etc. for numbering. Available tags: {{title}}, {{scene}}, {{char}}, {{user}}, {{messages}}, {{profile}}, {{date}}, {{time}}</small>
        <select id="stmb-profile-title-format-select" class="text_pole">
            {{#each titleFormats}}
            <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
            {{/each}}
            <option value="custom" data-i18n="STMemoryBooks_CustomTitleFormat">Custom Title Format...</option>
        </select>
        <input type="text" id="stmb-profile-custom-title-format" class="text_pole marginTop5 {{#unless showCustomTitleInput}}displayNone{{/unless}}"
            data-i18n="[placeholder]STMemoryBooks_EnterCustomFormat" placeholder="Enter custom format" value="{{titleFormat}}">
    </div>
    <hr>
    <h4 data-i18n="STMemoryBooks_LorebookEntrySettings">Lorebook Entry Settings</h4>
    <div class="info-block hint marginBot10" data-i18n="STMemoryBooks_LorebookEntrySettingsDesc">
        These settings control how the generated memory is saved into the lorebook.
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-const-vect">
            <h4 data-i18n="STMemoryBooks_ActivationMode">Activation Mode:</h4>
            <small data-i18n="STMemoryBooks_ActivationModeDesc">\uD83D\uDD17 Vectorized is recommended for memories.</small>
            <select id="stmb-profile-const-vect" class="text_pole">
                <option value="link" {{#if (eq constVectMode "link")}}selected{{/if}} data-i18n="STMemoryBooks_Vectorized">\uD83D\uDD17 Vectorized (Default)</option>
                <option value="blue" {{#if (eq constVectMode "blue")}}selected{{/if}} data-i18n="STMemoryBooks_Constant">\uD83D\uDD35 Constant</option>
                <option value="green" {{#if (eq constVectMode "green")}}selected{{/if}} data-i18n="STMemoryBooks_Normal">\uD83D\uDFE2 Normal</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-position">
            <h4 data-i18n="STMemoryBooks_InsertionPosition">Insertion Position:</h4>
            <small data-i18n="STMemoryBooks_InsertionPositionDesc">↑Char is recommended. Aiko recommends memories never go lower than ↑AN.</small>
            <select id="stmb-profile-position" class="text_pole">
                <option value="0" {{#if (eq position 0)}}selected{{/if}} data-i18n="STMemoryBooks_CharUp">↑Char</option>
                <option value="1" {{#if (eq position 1)}}selected{{/if}} data-i18n="STMemoryBooks_CharDown">↓Char</option>
                <option value="5" {{#if (eq position 5)}}selected{{/if}} data-i18n="STMemoryBooks_EMUp">↑EM</option>
                <option value="6" {{#if (eq position 6)}}selected{{/if}} data-i18n="STMemoryBooks_EMDown">↓EM</option>
                <option value="2" {{#if (eq position 2)}}selected{{/if}} data-i18n="STMemoryBooks_ANUp">↑AN</option>
                <option value="3" {{#if (eq position 3)}}selected{{/if}} data-i18n="STMemoryBooks_ANDown">↓AN</option>
                <option value="7" {{#if (eq position 7)}}selected{{/if}} data-i18n="STMemoryBooks_Outlet">Outlet</option>
            </select>
        </label>
    </div>

    <div id="stmb-profile-outlet-name-container" class="world_entry_form_control marginTop5 {{#unless (eq position 7)}}displayNone{{/unless}}">
        <label for="stmb-profile-outlet-name">
            <h4 data-i18n="STMemoryBooks_OutletName">Outlet Name:</h4>
            <input type="text" id="stmb-profile-outlet-name" class="text_pole" data-i18n="[placeholder]STMemoryBooks_OutletNamePlaceholder" placeholder="Outlet name" value="{{outletName}}">
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_InsertionOrder">Insertion Order:</h4>
        <div class="buttons_block justifyCenter gap10px">
            <label class="checkbox_label"><input type="radio" name="order-mode" value="auto" {{#if (eq orderMode 'auto')}}checked{{/if}}> <span data-i18n="STMemoryBooks_AutoOrder">Auto (uses memory #)</span></label>
            <label class="checkbox_label"><input type="radio" name="order-mode" value="manual" {{#if (eq orderMode 'manual')}}checked{{/if}}> <span data-i18n="STMemoryBooks_ManualOrder">Manual</span> <input type="number" id="stmb-profile-order-value" value="{{orderValue}}" class="text_pole {{#if (eq orderMode 'auto')}}displayNone{{/if}} width100px" min="1" max="9999" step="1" style="margin-left: auto;"></label>
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_RecursionSettings">Recursion Settings:</h4>
        <div class="buttons_block justifyCenter">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-profile-prevent-recursion" {{#if preventRecursion}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_PreventRecursion">Prevent Recursion</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-profile-delay-recursion" {{#if delayUntilRecursion}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_DelayUntilRecursion">Delay Until Recursion</span>
            </label>
        </div>
    </div>
</div>
`);async function X5(Z,Q,G){let J=Z.profiles[Q];if(!J){console.error(`${B0}: No profile found at index ${Q}`);return}try{let W=o();await J8(Z);let Y=(await T1()).map((A)=>({value:A.key,displayName:A.displayName,selected:A.key===(J.preset||"")})),z=J.connection||{temperature:0.7},K=J.titleFormat||Z.titleFormat||"[000] - {{title}}",X=Y1(),V=!!J.isBuiltinCurrentST,F={name:V?k(H8,"STMemoryBooks_Profile_CurrentST"):J.name,connection:z,api:"openai",prompt:J.prompt||"",preset:J.preset||"",currentApi:W.api||"Unknown",presetOptions:Y,isNameLocked:V,isProviderLocked:V,titleFormat:K,titleFormats:X.map((A)=>({value:A,isSelected:A===K})),showCustomTitleInput:!X.includes(K),constVectMode:J.constVectMode,position:J.position,orderMode:J.orderMode,orderValue:J.orderValue,preventRecursion:J.preventRecursion,delayUntilRecursion:J.delayUntilRecursion,outletName:J.outletName||"",hasLegacyCustomPrompt:J.prompt&&J.prompt.trim()?!0:!1},j=Y5.sanitize(z5(F)),O=new U6(`<h3>${k("Edit Profile","STMemoryBooks_ProfileEditTitle")}</h3>${j}`,B8.TEXT,"",{okButton:k("Save","STMemoryBooks_Save"),cancelButton:k("Cancel/Close","STMemoryBooks_CancelClose"),wide:!0,large:!0,allowVerticalScrolling:!0});if(U5(O,Z),await O.show()===z1.AFFIRMATIVE){let A=H5(O.dlg,J.name);if(J?.isBuiltinCurrentST)A.isBuiltinCurrentST=!0,A.name=H8,A.connection=A.connection||{},A.connection.api="current_st";if(!X8(A)){toastr.error(k("Invalid profile data","STMemoryBooks_InvalidProfileData"),"STMemoryBooks");return}if(Z.profiles[Q]=A,P8(),G)G();toastr.success(k("Profile updated successfully","STMemoryBooks_ProfileUpdatedSuccess"),"STMemoryBooks")}}catch(W){console.error(`${B0}: Error editing profile:`,W),toastr.error(k("Failed to edit profile","STMemoryBooks_FailedToEditProfile"),"STMemoryBooks")}}async function V5(Z,Q){try{let G=Z.profiles.map((O)=>O.name),J=L1("New Profile",G),W=o(),q=Z.titleFormat||"[000] - {{title}}",Y=Y1();await J8(Z);let K=(await T1()).map((O)=>({value:O.key,displayName:O.displayName,selected:!1})),X={name:J,connection:{temperature:0.7},api:"",prompt:"",preset:"",currentApi:W.api||"Unknown",presetOptions:K,isNameLocked:!1,isProviderLocked:!1,titleFormat:q,titleFormats:Y.map((O)=>({value:O,isSelected:O===q})),showCustomTitleInput:!Y.includes(q),constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0,outletName:""},V=Y5.sanitize(z5(X)),F=new U6(`<h3>${k("New Profile","STMemoryBooks_NewProfileTitle")}</h3>${V}`,B8.TEXT,"",{okButton:k("Create","STMemoryBooks_Create"),cancelButton:k("Cancel/Close","STMemoryBooks_CancelClose"),wide:!0,large:!0,allowVerticalScrolling:!0});if(U5(F,Z),await F.show()===z1.AFFIRMATIVE){let O=H5(F.dlg,J),H=L1(O.name,G);if(O.name=H,!X8(O)){toastr.error(k("Invalid profile data","STMemoryBooks_InvalidProfileData"),"STMemoryBooks");return}if(Z.profiles.push(O),P8(),Q)Q();toastr.success(k("Profile created successfully","STMemoryBooks_ProfileCreatedSuccess"),"STMemoryBooks")}}catch(G){console.error(`${B0}: Error creating profile:`,G),toastr.error(k("Failed to create profile","STMemoryBooks_FailedToCreateProfile"),"STMemoryBooks")}}async function K5(Z,Q,G){if(Z.profiles.length<=1){toastr.error(k("Cannot delete the last profile","STMemoryBooks_CannotDeleteLastProfile"),"STMemoryBooks");return}let J=Z.profiles[Q];if(J?.isBuiltinCurrentST){toastr.error(k('Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',"STMemoryBooks_CannotDeleteDefaultProfile"),"STMemoryBooks");return}try{let W=k('Delete profile "{{name}}"?',"STMemoryBooks_DeleteProfileConfirm").replace("{{name}}",J.name);if(await new U6(W,B8.CONFIRM,"").show()===z1.AFFIRMATIVE){let Y=J.name;if(Z.profiles.splice(Q,1),Z.defaultProfile===Q)Z.defaultProfile=0;else if(Z.defaultProfile>Q)Z.defaultProfile--;if(P8(),G)G();toastr.success(k("Profile deleted successfully","STMemoryBooks_ProfileDeletedSuccess"),"STMemoryBooks")}}catch(W){console.error(`${B0}: Error deleting profile:`,W),toastr.error(k("Failed to delete profile","STMemoryBooks_FailedToDeleteProfile"),"STMemoryBooks")}}function j5(Z){try{let Q={profiles:Z.profiles,exportDate:q5().toISOString(),version:1,moduleVersion:Z.migrationVersion||1},G=JSON.stringify(Q,null,2),J=new Blob([G],{type:"application/json"}),W=document.createElement("a");W.href=URL.createObjectURL(J),W.download=`stmemorybooks-profiles-${q5().format("YYYY-MM-DD")}.json`,document.body.appendChild(W),W.click(),document.body.removeChild(W),setTimeout(()=>URL.revokeObjectURL(W.href),1000),toastr.success(k("Profiles exported successfully","STMemoryBooks_ProfilesExportedSuccess"),"STMemoryBooks")}catch(Q){console.error(`${B0}: Error exporting profiles:`,Q),toastr.error(k("Failed to export profiles","STMemoryBooks_FailedToExportProfiles"),"STMemoryBooks")}}function HG(Z){return J1(Z)}function F5(Z,Q,G){let J=Z.target.files[0];if(!J)return;let W=new FileReader;W.onload=function(q){try{let Y=JSON.parse(q.target.result);if(!Y.profiles||!Array.isArray(Y.profiles))throw Error(k("Invalid profile data format - missing profiles array","STMemoryBooks_ImportErrorInvalidFormat"));let z=Y.profiles.filter((F)=>X8(F)).map((F)=>HG(F));if(z.length===0)throw Error(k("No valid profiles found in import file","STMemoryBooks_ImportErrorNoValidProfiles"));let K=0,X=0,V=Q.profiles.map((F)=>F.name);if(z.forEach((F)=>{if(!V.includes(F.name)){let O=L1(F.name,V);F.name=O,V.push(O),Q.profiles.push(F),K++}else X++}),K>0){if(P8(),G)G();let F=jZ`Imported ${K} profile${K===1?"":"s"}`;if(X>0)F+=jZ` (${X} duplicate${X===1?"":"s"} skipped)`;toastr.success(F,k("STMemoryBooks profile import completed","STMemoryBooks_ImportComplete"))}else toastr.warning(k("No new profiles imported - all profiles already exist","STMemoryBooks_ImportNoNewProfiles"),"STMemoryBooks")}catch(Y){console.error(`${B0}: Error importing profiles:`,Y),toastr.error(jZ`Failed to import profiles: ${Y.message}`,"STMemoryBooks")}},W.onerror=function(){console.error(`${B0}: Error reading import file`),toastr.error(k("Failed to read import file","STMemoryBooks_ImportReadError"),"STMemoryBooks")},W.readAsText(J),Z.target.value=""}function U5(Z,Q){let G=Z.dlg;G.querySelector("#stmb-open-prompt-manager")?.addEventListener("click",()=>{try{let q=document.querySelector("#stmb-prompt-manager");if(q)q.click();else toastr.error(k("Prompt Manager button not found. Open main settings and try again.","STMemoryBooks_PromptManagerNotFound"),"STMemoryBooks")}catch(q){console.error(`${B0}: Error opening prompt manager from profile editor:`,q),toastr.error(k("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}),G.querySelector("#stmb-refresh-presets")?.addEventListener("click",async()=>{try{let q=G.querySelector("#stmb-profile-preset");if(!q)return;let Y=q.value,z=await T1();if(q.innerHTML="",z.forEach((K)=>{let X=document.createElement("option");if(X.value=K.key,X.textContent=K.displayName,K.key===Y)X.selected=!0;q.appendChild(X)}),![...q.options].some((K)=>K.value===Y)&&q.options.length>0)q.selectedIndex=0;toastr.success(k("Preset list refreshed","STMemoryBooks_PresetListRefreshed"),"STMemoryBooks")}catch(q){console.error(`${B0}: Error refreshing presets:`,q),toastr.error(k("Failed to refresh presets","STMemoryBooks_FailedToRefreshPresets"),"STMemoryBooks")}});let J=async()=>{try{let q=G.querySelector("#stmb-profile-preset");if(!q)return;let Y=q.value,z=await T1();if(q.innerHTML="",z.forEach((K)=>{let X=document.createElement("option");if(X.value=K.key,X.textContent=K.displayName,K.key===Y)X.selected=!0;q.appendChild(X)}),![...q.options].some((K)=>K.value===Y)&&q.options.length>0)q.selectedIndex=0}catch(q){console.error(`${B0}: Error auto-refreshing presets on update:`,q)}};window.addEventListener("stmb-presets-updated",J),Z?.dlg?.addEventListener("close",()=>{window.removeEventListener("stmb-presets-updated",J)}),G.querySelector("#stmb-move-to-preset")?.addEventListener("click",async()=>{try{let q=G.querySelector("#stmb-legacy-custom-prompt"),Y=q?q.textContent:"";if(!Y||!Y.trim()){toastr.error(t("STMemoryBooks_NoCustomPromptToMigrate","No custom prompt to migrate"),"STMemoryBooks");return}let X=`Custom: ${G.querySelector("#stmb-profile-name")?.value?.trim()||"Profile"}`,V=await w8(null,Y,X);if(await new U6(`<h3 data-i18n="STMemoryBooks_MoveToPresetConfirmTitle">Move to Preset</h3><p data-i18n="STMemoryBooks_MoveToPresetConfirmDesc">Create a preset from this profile's custom prompt, set the preset on this profile, and clear the custom prompt?</p>`,B8.CONFIRM,"",{okButton:k("Apply","STMemoryBooks_Apply"),cancelButton:k("Cancel","STMemoryBooks_Cancel")}).show()===z1.AFFIRMATIVE){let O=G.querySelector("#stmb-profile-preset");if(O){if(![...O.options].some((H)=>H.value===V)){let H=document.createElement("option");H.value=V,H.textContent=X,O.appendChild(H)}O.value=V}q?.remove(),G.querySelector("#stmb-move-to-preset")?.remove(),toastr.success(k("Preset created and selected. Remember to Save.","STMemoryBooks_CustomPromptMigrated"),"STMemoryBooks")}}catch(q){console.error(`${B0}: Error moving custom prompt to preset:`,q),toastr.error(k("Failed to move custom prompt to preset","STMemoryBooks_FailedToMigrateCustomPrompt"),"STMemoryBooks")}}),G.querySelector("#stmb-profile-title-format-select")?.addEventListener("change",(q)=>{let Y=G.querySelector("#stmb-profile-custom-title-format");if(q.target.value==="custom")Y.classList.remove("displayNone"),Y.focus();else Y.classList.add("displayNone")}),G.querySelector("#stmb-profile-temperature")?.addEventListener("input",(q)=>{let Y=parseFloat(q.target.value);if(!isNaN(Y)){if(Y<0)q.target.value=0;if(Y>2)q.target.value=2}}),G.querySelector("#stmb-profile-model")?.addEventListener("input",(q)=>{q.target.value=q.target.value.replace(/[<>]/g,"")}),G.querySelector("#stmb-profile-api")?.addEventListener("change",(q)=>{let Y=G.querySelector("#stmb-full-manual-section"),z=G.querySelector("#stmb-profile-model"),K=G.querySelector("#stmb-profile-temperature");if(q.target.value==="full-manual")Y.classList.remove("displayNone");else Y.classList.add("displayNone");let X=q.target.value==="current_st";if(z)z.disabled=X,z.title=X?"Managed by SillyTavern UI":"";if(K)K.disabled=X,K.title=X?"Managed by SillyTavern UI":""}),G.querySelectorAll('input[name="order-mode"]').forEach((q)=>{q.addEventListener("change",(Y)=>{let z=G.querySelector("#stmb-profile-order-value");if(Y.target.value==="manual")z.classList.remove("displayNone");else z.classList.add("displayNone")})});let W=G.querySelector("#stmb-profile-position");W?.addEventListener("change",()=>{let q=G.querySelector("#stmb-profile-outlet-name-container");if(q)q.classList.toggle("displayNone",W.value!=="7")}),function(){let q=G.querySelector("#stmb-profile-outlet-name-container");if(W&&q)q.classList.toggle("displayNone",W.value!=="7")}();try{let q=G.querySelector('h4[data-i18n="STMemoryBooks_RecursionSettings"]'),Y=q?q.parentElement?.querySelector(".buttons_block"):null;if(Y&&!G.querySelector("#stmb-convert-existing-recursion")){let z=document.createElement("label");z.className="checkbox_label";let K=document.createElement("input");K.type="checkbox",K.id="stmb-convert-existing-recursion",K.checked=!!(Q&&Q.moduleSettings&&Q.moduleSettings.convertExistingRecursion);let X=document.createElement("span");X.textContent="Also convert recursion settings on existing entries";try{X.setAttribute("data-i18n","STMemoryBooks_ConvertExistingRecursion")}catch(V){}z.appendChild(K),z.appendChild(X),Y.appendChild(z),K.addEventListener("change",()=>{try{Q.moduleSettings=Q.moduleSettings||{},Q.moduleSettings.convertExistingRecursion=!!K.checked,P8()}catch(V){console.error(`${B0}: Failed to save convertExistingRecursion flag`,V)}})}}catch(q){console.warn(`${B0}: Failed to inject convertExistingRecursion checkbox`,q)}}function H5(Z,Q){let G={name:Z.querySelector("#stmb-profile-name")?.value.trim()||Q,api:Z.querySelector("#stmb-profile-api")?.value,model:Z.querySelector("#stmb-profile-model")?.value,temperature:Z.querySelector("#stmb-profile-temperature")?.value,endpoint:Z.querySelector("#stmb-profile-endpoint")?.value,apiKey:Z.querySelector("#stmb-profile-apikey")?.value,constVectMode:Z.querySelector("#stmb-profile-const-vect")?.value,position:Z.querySelector("#stmb-profile-position")?.value,orderMode:Z.querySelector('input[name="order-mode"]:checked')?.value,orderValue:Z.querySelector("#stmb-profile-order-value")?.value,preventRecursion:Z.querySelector("#stmb-profile-prevent-recursion")?.checked,delayUntilRecursion:Z.querySelector("#stmb-profile-delay-recursion")?.checked},J=Z.querySelector("#stmb-profile-preset");G.prompt="",G.preset=J?.value||"";let W=Z.querySelector("#stmb-profile-title-format-select");if(W?.value==="custom")G.titleFormat=Z.querySelector("#stmb-profile-custom-title-format")?.value;else if(W)G.titleFormat=W.value;if(G.position==="7"||G.position===7)G.outletName=Z.querySelector("#stmb-profile-outlet-name")?.value?.trim()||"";return J1(G)}function FZ(Z){let Q=[],G=[];if(!Z.profiles||!Array.isArray(Z.profiles))Z.profiles=[],G.push("Created empty profiles array");if(Z.profiles.length===0){let J=J1({name:H8,api:"current_st",preset:"summary",isBuiltinCurrentST:!0});Z.profiles.push(J),G.push('Added default profile using provider "Current SillyTavern Settings".')}Z.profiles=Z.profiles.map((J)=>{if(J&&J.useDynamicSTSettings)J.connection=J.connection||{},J.connection.api="current_st",J.isBuiltinCurrentST=!0,delete J.useDynamicSTSettings,G.push(`Migrated legacy dynamic profile "${J.name}" to provider-based current_st`);return J});try{let J=[];for(let W=0;W<Z.profiles.length;W++)if(Z.profiles[W]?.isBuiltinCurrentST)J.push(W);if(J.length===0){let W=Z.profiles.findIndex((q)=>q?.connection?.api==="current_st"&&q?.name===H8);if(W<0)W=Z.profiles.findIndex((q)=>q?.connection?.api==="current_st"&&q?.preset==="summary");if(W<0)W=Z.profiles.findIndex((q)=>q?.connection?.api==="current_st");if(W>=0)Z.profiles[W].isBuiltinCurrentST=!0,G.push(`Marked existing profile "${Z.profiles[W].name}" as builtin Current ST profile`);else{let q=J1({name:H8,api:"current_st",preset:"summary",isBuiltinCurrentST:!0});if(Z.profiles.unshift(q),typeof Z.defaultProfile==="number")Z.defaultProfile+=1;G.push("Added missing builtin Current ST profile.")}}else if(J.length>1){for(let W=1;W<J.length;W++)delete Z.profiles[J[W]].isBuiltinCurrentST;G.push("Fixed multiple builtin Current ST profiles (kept first, cleared others).")}}catch(J){console.warn(`${B0}: Failed to enforce builtin Current ST profile invariants`,J)}if(Z.profiles.forEach((J,W)=>{if(!X8(J)){if(Q.push(`Profile ${W} is invalid`),!J.name)J.name=`Profile ${W+1}`,G.push(`Fixed missing name for profile ${W}`);if(!J.connection)J.connection={},G.push(`Fixed missing connection for profile ${W}`)}if(J?.isBuiltinCurrentST)J.name=H8,J.connection=J.connection||{},J.connection.api="current_st";if(J.constVectMode===void 0)J.constVectMode="link",G.push(`Added default 'constVectMode' to profile "${J.name}"`);if(J.position===void 0)J.position=0,G.push(`Added default 'position' to profile "${J.name}"`);if(J.orderMode===void 0)J.orderMode="auto",J.orderValue=100,G.push(`Added default 'order' settings to profile "${J.name}"`);if(J.preventRecursion===void 0)J.preventRecursion=!1,G.push(`Added default 'preventRecursion' to profile "${J.name}"`);if(J.delayUntilRecursion===void 0)J.delayUntilRecursion=!0,G.push(`Added default 'delayUntilRecursion' to profile "${J.name}"`);if(!J.titleFormat)J.titleFormat=Z.titleFormat||"[000] - {{title}}",G.push(`Added missing title format to profile "${J.name}"`)}),Z.defaultProfile>=Z.profiles.length)Z.defaultProfile=0,G.push("Fixed invalid default profile index");return{valid:Q.length===0,issues:Q,fixes:G,profileCount:Z.profiles.length}}e1();import{Handlebars as H6}from"../../../../lib.js";var UZ=H6.compile(`
    <h3 data-i18n="STMemoryBooks_Settings">\uD83D\uDCD5 Memory Books Settings</h3>
        {{#if hasScene}}
        <div id="stmb-scene" class="padding10 marginBot10">
            <div class="marginBot5" data-i18n="STMemoryBooks_CurrentScene">Current Scene:</div>
            <div class="padding10 marginTop5 stmb-box">
                <pre><code id="stmb-scene-block"><span data-i18n="STMemoryBooks_Start">Start</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneData.sceneStart}} ({{sceneData.startSpeaker}})
{{sceneData.startExcerpt}}

<span data-i18n="STMemoryBooks_End">End</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneData.sceneEnd}} ({{sceneData.endSpeaker}})
{{sceneData.endExcerpt}}

<span data-i18n="STMemoryBooks_Messages">Messages</span>: {{sceneData.messageCount}} | <span data-i18n="STMemoryBooks_EstimatedTokens">Estimated tokens</span>: {{sceneData.estimatedTokens}}</code></pre>
            </div>
        </div>
        {{else}}
        <div class="info-block warning">
            <span data-i18n="STMemoryBooks_NoSceneMarkers">No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.</span>
        </div>
        {{/if}}

        {{#if highestMemoryProcessed}}
        <div id="stmb-memory-status" class="info-block">
            <span>\uD83D\uDCCA <span data-i18n="STMemoryBooks_MemoryStatus">Memory Status</span>: <span data-i18n="STMemoryBooks_ProcessedUpTo">Processed up to message</span> #{{highestMemoryProcessed}}</span>
        </div>
        {{else}}
        <div id="stmb-memory-status" class="info-block">
            <span>\uD83D\uDCCA <span data-i18n="STMemoryBooks_MemoryStatus">Memory Status</span>: <span data-i18n="STMemoryBooks_NoMemoriesProcessed">No memories have been processed for this chat yet</span> <small data-i18n="STMemoryBooks_SinceVersion">(since updating to version 3.6.2 or higher.)</small></span>
            <br />
            <small data-i18n="STMemoryBooks_AutoSummaryNote">Please note that Auto-Summary requires you to "prime" every chat with at least one manual memory. After that, summaries will be made automatically.</small>
        </div>
        {{/if}}

        <h4 data-i18n="STMemoryBooks_Preferences">Preferences:</h4>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-always-use-default" {{#if alwaysUseDefault}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_AlwaysUseDefault">Always use default profile (no confirmation prompt)</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-memory-previews" {{#if showMemoryPreviews}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_ShowMemoryPreviews">Show memory previews</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-notifications" {{#if showNotifications}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_ShowNotifications">Show notifications</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-unhide-before-memory" {{#if unhideBeforeMemory}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_UnhideBeforeMemory">Unhide hidden messages for memory generation (runs /unhide X-Y)</span>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-manual-mode-enabled" {{#if manualModeEnabled}}checked{{/if}} {{#if autoCreateLorebook}}disabled{{/if}}>
                <span data-i18n="STMemoryBooks_EnableManualMode">Enable Manual Lorebook Mode</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_ManualModeDesc">When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.</small>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-auto-create-lorebook" {{#if autoCreateLorebook}}checked{{/if}} {{#if manualModeEnabled}}disabled{{/if}}>
                <span data-i18n="STMemoryBooks_AutoCreateLorebook">Auto-create lorebook if none exists</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_AutoCreateLorebookDesc">When enabled, automatically creates and binds a lorebook to the chat if none exists.</small>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-lorebook-name-template">
                <h4 data-i18n="STMemoryBooks_LorebookNameTemplate">Lorebook Name Template:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_LorebookNameTemplateDesc">Template for auto-created lorebook names. Supports {{char}}, {{user}}, {{chat}} placeholders.</small>
                <input type="text" id="stmb-lorebook-name-template" class="text_pole"
                    value="{{lorebookNameTemplate}}" data-i18n="[placeholder]STMemoryBooks_LorebookNameTemplatePlaceholder"
                    placeholder="LTM - {{char}} - {{chat}}"
                    {{#unless autoCreateLorebook}}disabled{{/unless}}>
            </label>
        </div>

        <h4 data-i18n="STMemoryBooks_CurrentLorebookConfig">Current Lorebook Configuration</h4>

        <div class="info-block">
            <small class="opacity50p" data-i18n="STMemoryBooks_Mode">Mode:</small>
            <h5 id="stmb-mode-badge">{{lorebookMode}}</h5>

            <small class="opacity50p" data-i18n="STMemoryBooks_ActiveLorebook">Active Lorebook:</small>
            <h5 id="stmb-active-lorebook" class="{{#unless currentLorebookName}}opacity50p{{/unless}}">
                {{#if currentLorebookName}}
                    {{currentLorebookName}}
                {{else}}
                    <span data-i18n="STMemoryBooks_NoneSelected">None selected</span>
                {{/if}}
            </h5>

            <div id="stmb-manual-controls" style="display: {{#if manualModeEnabled}}block{{else}}none{{/if}};">
                <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-manual-lorebook-buttons">
                    <!-- Manual lorebook buttons will be dynamically inserted here -->
                </div>
            </div>

            <div id="stmb-automatic-info" class="marginTop5" style="display: {{#if manualModeEnabled}}none{{else}}block{{/if}};">
                <small class="opacity50p">
                    {{#if chatBoundLorebookName}}
                        <span data-i18n="STMemoryBooks_UsingChatBound">Using chat-bound lorebook</span> "{{chatBoundLorebookName}}"
                    {{else}}
                        <span data-i18n="STMemoryBooks_NoChatBound">No chat-bound lorebook. Memories will require lorebook selection.</span>
                    {{/if}}
                </small>
            </div>
        </div>

        <hr class="marginTop10 marginBot10">

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-allow-scene-overlap" {{#if allowSceneOverlap}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_AllowSceneOverlap">Allow scene overlap</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_AllowSceneOverlapDesc">Check this box to skip checking for overlapping memories/scenes.</small>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-refresh-editor" {{#if refreshEditor}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_RefreshEditor">Refresh lorebook editor after adding memories</span>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-auto-summary-enabled" {{#if autoSummaryEnabled}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_AutoSummaryEnabled">Auto-create memory summaries</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_AutoSummaryDesc">Automatically run /nextmemory after a specified number of messages.</small>            
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-auto-summary-interval">
                <h4 data-i18n="STMemoryBooks_AutoSummaryInterval">Auto-Summary Interval:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_AutoSummaryIntervalDesc">Number of messages after which to automatically create a memory summary.</small>
                <input type="number" id="stmb-auto-summary-interval" class="text_pole"
                    value="{{autoSummaryInterval}}" min="10" max="200" step="1"
                    data-i18n="[placeholder]STMemoryBooks_DefaultInterval" placeholder="50">
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-auto-summary-buffer">
                <h4 data-i18n="STMemoryBooks_AutoSummaryBuffer">Auto-Summary Buffer:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_AutoSummaryBufferDesc">Delay auto-summary by X messages (belated generation). Default 2, max 50.</small>
                <input type="number" id="stmb-auto-summary-buffer" class="text_pole"
                    value="{{autoSummaryBuffer}}" min="0" max="50" step="1" placeholder="0">
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-default-memory-count">
                <h4 data-i18n="STMemoryBooks_DefaultMemoryCount">Default Previous Memories Count:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_DefaultMemoryCountDesc">Default number of previous memories to include as context when creating new memories.</small>
                <select id="stmb-default-memory-count" class="text_pole">
                    <option value="0" {{#if (eq defaultMemoryCount 0)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount0">None (0 memories)</option>
                    <option value="1" {{#if (eq defaultMemoryCount 1)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount1">Last 1 memory</option>
                    <option value="2" {{#if (eq defaultMemoryCount 2)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount2">Last 2 memories</option>
                    <option value="3" {{#if (eq defaultMemoryCount 3)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount3">Last 3 memories</option>
                    <option value="4" {{#if (eq defaultMemoryCount 4)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount4">Last 4 memories</option>
                    <option value="5" {{#if (eq defaultMemoryCount 5)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount5">Last 5 memories</option>
                    <option value="6" {{#if (eq defaultMemoryCount 6)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount6">Last 6 memories</option>
                    <option value="7" {{#if (eq defaultMemoryCount 7)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount7">Last 7 memories</option>
                </select>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-auto-hide-mode">
                <h4 data-i18n="STMemoryBooks_AutoHideMode">Auto-hide messages after adding memory:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_AutoHideModeDesc">Choose what messages to automatically hide after creating a memory.</small>
                <select id="stmb-auto-hide-mode" class="text_pole">
                    <option value="none" {{#if (eq autoHideMode "none")}}selected{{/if}} data-i18n="STMemoryBooks_AutoHideNone">Do not auto-hide</option>
                    <option value="all" {{#if (eq autoHideMode "all")}}selected{{/if}} data-i18n="STMemoryBooks_AutoHideAll">Auto-hide all messages up to the last memory</option>
                    <option value="last" {{#if (eq autoHideMode "last")}}selected{{/if}} data-i18n="STMemoryBooks_AutoHideLast">Auto-hide only messages in the last memory</option>
                </select>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-unhidden-entries-count">
                <h4 data-i18n="STMemoryBooks_UnhiddenCount">Messages to leave unhidden:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_UnhiddenCountDesc">Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)</small>
                <input type="number" id="stmb-unhidden-entries-count" class="text_pole"
                    value="{{unhiddenEntriesCount}}" min="0" max="50" step="1"
                    data-i18n="[placeholder]STMemoryBooks_DefaultUnhidden" placeholder="2">
            </label>
        </div>
        
        <div class="world_entry_form_control">
            <label for="stmb-token-warning-threshold">
                <h4 data-i18n="STMemoryBooks_TokenWarning">Token Warning Threshold:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_TokenWarningDesc">Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000</small>
                <input type="number" id="stmb-token-warning-threshold" class="text_pole"
                    value="{{tokenWarningThreshold}}" min="1000" max="200000" step="1000"
                    data-i18n="[placeholder]STMemoryBooks_DefaultTokenWarning" placeholder="30000">
            </label>
        </div>

        <div class="world_entry_form_control">
            <h4 data-i18n="STMemoryBooks_TitleFormat">Memory Title Format:</h4>
            <select id="stmb-title-format-select" class="text_pole">
                {{#each titleFormats}}
                <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
                {{/each}}
                <option value="custom" data-i18n="STMemoryBooks_CustomTitleFormat">Custom Title Format...</option>
            </select>
            <input type="text" id="stmb-custom-title-format" class="text_pole marginTop5 {{#unless showCustomInput}}displayNone{{/unless}}"
                data-i18n="[placeholder]STMemoryBooks_EnterCustomFormat" placeholder="Enter custom format" value="{{titleFormat}}">
            <small class="opacity50p" data-i18n="STMemoryBooks_TitleFormatDesc">Use [0], [00], [000] for auto-numbering. Available: {{title}}, {{scene}}, &#123;&#123;char}}, &#123;&#123;user}}, {{messages}}, {{profile}}, &#123;&#123;date}}, &#123;&#123;time}}</small>
        </div>

        <div class="world_entry_form_control" class="flex-container">
            <div class="flex flexFlowRow alignItemsBaseline">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-use-regex" {{#if useRegex}}checked{{/if}}>
                    <span data-i18n="STMemoryBooks_UseRegexAdvanced">Use regex (advanced)</span>
                </label>
            </div>
            <div class="flex flexFlowRow buttons_block marginTop5 justifyCenter gap10px whitespacenowrap">
                <button id="stmb-configure-regex" class="menu_button whitespacenowrap" style="{{#unless useRegex}}display:none;{{/unless}}" data-i18n="STMemoryBooks_ConfigureRegex">
                    \uD83D\uDCD0 Configure regex…
                </button>
            </div>
            <small class="opacity70p" data-i18n="STMemoryBooks_RegexSelection_Desc">Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.</small>
        </div>

        <div class="world_entry_form_control">
            <h4 data-i18n="STMemoryBooks_Profiles">Memory Profiles:</h4>
            <select id="stmb-profile-select" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}{{#if isDefault}} (Default){{/if}}</option>
                {{/each}}
            </select>
        </div>

        <div id="stmb-profile-summary" class="padding10 marginBot10">
            <div class="marginBot5" data-i18n="STMemoryBooks_ProfileSettings">Profile Settings:</div>
            <div><span data-i18n="STMemoryBooks_Provider">Provider</span>: <span id="stmb-summary-api">{{selectedProfile.connection.api}}</span></div>
            <div><span data-i18n="STMemoryBooks_Model">Model</span>: <span id="stmb-summary-model">{{selectedProfile.connection.model}}</span></div>
            <div><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span id="stmb-summary-temp">{{selectedProfile.connection.temperature}}</span></div>
            <div><span data-i18n="STMemoryBooks_TitleFormat">Title Format</span>: <span id="stmb-summary-title">{{selectedProfile.titleFormat}}</span></div>
            <details class="marginTop10">
                <summary data-i18n="STMemoryBooks_ViewPrompt">View Prompt</summary>
                <div class="padding10 marginTop5 stmb-box">
                    <pre><code id="stmb-summary-prompt">{{selectedProfile.effectivePrompt}}</code></pre>
                </div>
            </details>
        </div>

        <h4 data-i18n="STMemoryBooks_ProfileActions">Profile Actions:</h4>
        <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-profile-buttons">
            <!-- Profile buttons will be dynamically inserted here -->
        </div>

        <h4 data-i18n="STMemoryBooks_extraFunctionButtons">Extra Function Buttons:</h4>
        <input type="file" id="stmb-import-file" accept=".json" class="displayNone">
        <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-extra-function-buttons">
            <!-- extra function buttons will be dynamically inserted here -->
        </div>

        <div class="info-block">
            <h4 data-i18n="STMemoryBooks_promptManagerButtons">Prompt Managers</h4>
            <small class="opacity50p" data-i18n="STMemoryBooks_PromptManagerButtonsHint">Want to tweak things? Use the buttons below to customize each prompt type.</small>
            <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-prompt-manager-buttons">
                <!-- prompt manager buttons will be dynamically inserted here -->
            </div>
        </div>

`),B5=H6.compile(`
    <h3 data-i18n="STMemoryBooks_CreateMemory">Create Memory</h3>
    <div id="stmb-scene" class="padding10 marginBot10">
        <div class="marginBot5" data-i18n="STMemoryBooks_ScenePreview">Scene Preview:</div>
        <div class="padding10 marginTop5 stmb-box">
            <pre><code id="stmb-scene-block"><span data-i18n="STMemoryBooks_Start">Start</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneStart}} ({{startSpeaker}})
{{startExcerpt}}

<span data-i18n="STMemoryBooks_End">End</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneEnd}} ({{endSpeaker}})
{{endExcerpt}}

<span data-i18n="STMemoryBooks_Messages">Messages</span>: {{messageCount}} | <span data-i18n="STMemoryBooks_EstimatedTokens">Estimated tokens</span>: {{estimatedTokens}}</code></pre>
        </div>
    </div>

    <div class="world_entry_form_control">
        <h5><span data-i18n="STMemoryBooks_UsingProfile">Using Profile</span>: <span class="success">{{profileName}}</span></h5>

        <div id="stmb-profile-summary" class="padding10 marginBot10">
            <div class="marginBot5" data-i18n="STMemoryBooks_ProfileSettings">Profile Settings:</div>
            <div><span data-i18n="STMemoryBooks_Model">Model</span>: <span id="stmb-summary-model">{{profileModel}}</span></div>
            <div><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span id="stmb-summary-temp">{{profileTemperature}}</span></div>
            <details class="marginTop10">
                <summary data-i18n="STMemoryBooks_ViewPrompt">View Prompt</summary>
                <div class="padding10 marginTop5 stmb-box">
                    <pre><code id="stmb-summary-prompt">{{effectivePrompt}}</code></pre>
                </div>
            </details>
        </div>
    </div>

    {{#if showWarning}}
    <div class="info-block warning marginTop10">
        ⚠️ <span data-i18n="STMemoryBooks_LargeSceneWarning">Large scene</span> ({{estimatedTokens}} tokens) <span data-i18n="STMemoryBooks_MayTakeTime">may take some time to process.</span>
    </div>
    {{/if}}

    <div class="marginTop10 opacity50p fontsize90p" data-i18n="STMemoryBooks_AdvancedOptionsHint">
        Click "Advanced Options" to customize prompt, context memories, or API settings.
    </div>
`),O5=H6.compile(`
    <h3 data-i18n="STMemoryBooks_AdvancedOptions">Advanced Memory Options</h3>
    <div class="world_entry_form_control">
        <h4 data-i18n="STMemoryBooks_SceneInformation">Scene Information:</h4>
        <div class="padding10 marginBot15" style="background-color: var(--SmartThemeBlurTintColor); border-radius: 5px;">
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Messages">Messages</span> {{sceneStart}}-{{sceneEnd}} ({{messageCount}} <span data-i18n="STMemoryBooks_Total">total</span>)</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_BaseTokens">Base tokens</span>: {{estimatedTokens}}</div>
            <div class="fontsize90p" id="stmb-total-tokens-display"><span data-i18n="STMemoryBooks_TotalTokens">Total tokens</span>: {{estimatedTokens}}</div>
        </div>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-profile-select-advanced">
            <h4 data-i18n="STMemoryBooks_Profile">Profile:</h4>
            <small data-i18n="STMemoryBooks_ChangeProfileDesc">Change the profile to use different base settings.</small>
            <select id="stmb-profile-select-advanced" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}{{#if isDefault}} (Default){{/if}}</option>
                {{/each}}
            </select>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-effective-prompt-advanced">
            <h4 data-i18n="STMemoryBooks_MemoryCreationPrompt">Memory Creation Prompt:</h4>
            <small data-i18n="STMemoryBooks_CustomizePromptDesc">Customize the prompt used to generate this memory.</small>
            <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-effective-prompt-advanced" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
            <textarea id="stmb-effective-prompt-advanced" class="text_pole textarea_compact" rows="6" data-i18n="[placeholder]STMemoryBooks_MemoryPromptPlaceholder" placeholder="Memory creation prompt">{{effectivePrompt}}</textarea>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-context-memories-advanced">
            <h4 data-i18n="STMemoryBooks_IncludePreviousMemories">Include Previous Memories as Context:</h4>
            <small>
                <span data-i18n="STMemoryBooks_PreviousMemoriesDesc">Previous memories provide context for better continuity.</span>
                {{#if availableMemories}}
                <br><span data-i18n="STMemoryBooks_Found">Found</span> {{availableMemories}} {{#if (eq availableMemories 1)}}<span data-i18n="STMemoryBooks_ExistingMemorySingular">existing memory in lorebook.</span>{{else}}<span data-i18n="STMemoryBooks_ExistingMemoriesPlural">existing memories in lorebook.</span>{{/if}}
                {{else}}
                <br><span data-i18n="STMemoryBooks_NoMemoriesFound">No existing memories found in lorebook.</span>
                {{/if}}
            </small>
            <select id="stmb-context-memories-advanced" class="text_pole">
                <option value="0" {{#if (eq defaultMemoryCount 0)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount0">None (0 memories)</option>
                <option value="1" {{#if (eq defaultMemoryCount 1)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount1">Last 1 memory</option>
                <option value="2" {{#if (eq defaultMemoryCount 2)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount2">Last 2 memories</option>
                <option value="3" {{#if (eq defaultMemoryCount 3)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount3">Last 3 memories</option>
                <option value="4" {{#if (eq defaultMemoryCount 4)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount4">Last 4 memories</option>
                <option value="5" {{#if (eq defaultMemoryCount 5)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount5">Last 5 memories</option>
                <option value="6" {{#if (eq defaultMemoryCount 6)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount6">Last 6 memories</option>
                <option value="7" {{#if (eq defaultMemoryCount 7)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount7">Last 7 memories</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control">
        <h4 data-i18n="STMemoryBooks_APIOverride">API Override Settings:</h4>

        <div class="padding10 marginBot10" style="background-color: var(--SmartThemeBlurTintColor); border-radius: 5px; filter: brightness(1.2);">
            <div class="marginBot5" data-i18n="STMemoryBooks_ProfileSettings">Profile Settings:</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Model">Model</span>: <span class="success" id="stmb-profile-model-display">{{profileModel}}</span></div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span class="success" id="stmb-profile-temp-display">{{profileTemperature}}</span></div>
        </div>

        <div class="padding10 marginBot10" style="background-color: var(--SmartThemeBlurTintColor); border-radius: 5px;">
            <div class="marginBot5" data-i18n="STMemoryBooks_CurrentSTSettings">Current SillyTavern Settings:</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Model">Model</span>: <span style="color: var(--SmartThemeQuoteColor);">{{currentModel}}</span></div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span style="color: var(--SmartThemeQuoteColor);">{{currentTemperature}}</span></div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_API">API</span>: <span style="color: var(--SmartThemeQuoteColor);">{{currentApi}}</span></div>
        </div>

        <label class="checkbox_label">
            <input type="checkbox" id="stmb-override-settings-advanced">
            <span data-i18n="STMemoryBooks_UseCurrentSettings">Use current SillyTavern settings instead of profile settings</span>
        </label>
        <small class="opacity50p marginTop5" data-i18n="STMemoryBooks_OverrideDesc">
            Override the profile's model and temperature with your current SillyTavern settings.
        </small>
    </div>

    <div class="world_entry_form_control displayNone" id="stmb-save-profile-section-advanced">
        <h4 data-i18n="STMemoryBooks_SaveAsNewProfile">Save as New Profile:</h4>
        <label for="stmb-new-profile-name-advanced">
            <h4 data-i18n="STMemoryBooks_ProfileName">Profile Name:</h4>
            <small data-i18n="STMemoryBooks_SaveProfileDesc">Your current settings differ from the selected profile. Save them as a new profile.</small>
            <input type="text" id="stmb-new-profile-name-advanced" class="text_pole" data-i18n="[placeholder]STMemoryBooks_EnterProfileName" placeholder="Enter new profile name" value="{{suggestedProfileName}}">
        </label>
    </div>

    {{#if showWarning}}
    <div class="info-block warning marginTop10" id="stmb-token-warning-advanced">
        <span data-i18n="STMemoryBooks_LargeSceneWarningShort">⚠️ Large scene may take some time to process.</span>
    </div>
    {{/if}}
`),A5=H6.compile(`
    <h3 data-i18n="STMemoryBooks_MemoryPreview">\uD83D\uDCD6 Memory Preview</h3>
    <div class="world_entry_form_control">
        <small class="marginBot10" data-i18n="STMemoryBooks_MemoryPreviewDesc">Review the generated memory below. You can edit the content while preserving the structure.</small>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-preview-title">
            <h4 data-i18n="STMemoryBooks_MemoryTitle">Memory Title:</h4>
            <input type="text" id="stmb-preview-title" class="text_pole" value="{{#if title}}{{title}}{{else}}Memory{{/if}}" data-i18n="[placeholder]STMemoryBooks_MemoryTitlePlaceholder" placeholder="Memory title" {{#if titleReadonly}}readonly disabled{{/if}}>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-preview-content">
            <h4 data-i18n="STMemoryBooks_MemoryContent">Memory Content:</h4>
            <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-preview-content" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
            <textarea id="stmb-preview-content" class="text_pole textarea_compact" rows="8" data-i18n="[placeholder]STMemoryBooks_MemoryContentPlaceholder" placeholder="Memory content">{{#if content}}{{content}}{{else}}{{/if}}</textarea>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-preview-keywords">
            <h4 data-i18n="STMemoryBooks_Keywords">Keywords:</h4>
            <small class="opacity50p" data-i18n="STMemoryBooks_KeywordsDesc">Separate keywords with commas</small>
            <input type="text" id="stmb-preview-keywords" class="text_pole" value="{{#if keywordsText}}{{keywordsText}}{{else}}{{/if}}" data-i18n="[placeholder]STMemoryBooks_KeywordsPlaceholder" placeholder="keyword1, keyword2, keyword3">
        </label>
    </div>

    <div class="world_entry_form_control">
        <h4 data-i18n="STMemoryBooks_SceneInformation">Scene Information:</h4>
        <div class="padding10 marginBot10 stmb-box">
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Messages">Messages</span>: {{#if sceneStart}}{{sceneStart}}{{else}}?{{/if}}-{{#if sceneEnd}}{{sceneEnd}}{{else}}?{{/if}} ({{#if messageCount}}{{messageCount}}{{else}}?{{/if}} <span data-i18n="STMemoryBooks_Total">total</span>)</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Profile">Profile</span>: {{#if profileName}}{{profileName}}{{else}}<span data-i18n="STMemoryBooks_UnknownProfile">Unknown Profile</span>{{/if}}</div>
        </div>
    </div>
`);import{saveSettingsDebounced as BG}from"../../../../script.js";import{Popup as HZ,POPUP_TYPE as BZ,POPUP_RESULT as M1}from"../../../popup.js";import{DOMPurify as OZ}from"../../../../lib.js";import{translate as v}from"../../../i18n.js";import{loadWorldInfo as N5}from"../../../world-info.js";b0();import{playMessageSound as OG}from"../../../power-user.js";var S0="STMemoryBooks-ConfirmationPopup";function v1(Z,Q,G){let J=v(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}var P1={ADVANCED:M1.CUSTOM1,SAVE_PROFILE:M1.CUSTOM2,EDIT:M1.CUSTOM3,RETRY:M1.CUSTOM4};function AZ(){try{OG()}catch(Z){console.error("playMessageSound failed",Z)}}async function D5(Z,Q,G,J,W,q=null){let Y=q!==null?q:Q.defaultProfile,z=Q.profiles[Y],K=await I1(z),X={...Z,profileName:z?.isBuiltinCurrentST?v("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):z.name,effectivePrompt:K,profileModel:z.useDynamicSTSettings||z?.connection?.api==="current_st"?v("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"):z.connection?.model||v("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"),profileTemperature:z.useDynamicSTSettings||z?.connection?.api==="current_st"?v("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"):z.connection?.temperature!==void 0?z.connection.temperature:v("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"),currentModel:G?.model||v("Unknown","common.unknown"),currentTemperature:G?.temperature??0.7,currentApi:J?.api||v("Unknown","common.unknown"),tokenThreshold:Q.moduleSettings.tokenWarningThreshold??30000,showWarning:Z.estimatedTokens>(Q.moduleSettings.tokenWarningThreshold??30000),profiles:Q.profiles.map((F,j)=>({...F,name:F?.isBuiltinCurrentST?v("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):F.name,isDefault:j===Q.defaultProfile,isSelected:j===Y}))},V=OZ.sanitize(B5(X));AZ();try{let j=await new HZ(V,BZ.TEXT,"",{okButton:v("Create Memory","STMemoryBooks_CreateMemory"),cancelButton:v("Cancel","STMemoryBooks_Cancel"),allowVerticalScrolling:!0,wide:!1,customButtons:[{text:v("Advanced Options...","STMemoryBooks_Button_AdvancedOptions"),result:P1.ADVANCED,classes:["menu_button","whitespacenowrap"],action:null}]}).show();if(j===M1.AFFIRMATIVE)return{confirmed:!0,profileSettings:{...z,effectivePrompt:K},advancedOptions:{memoryCount:Q.moduleSettings.defaultMemoryCount??0,overrideSettings:!1}};else if(j===P1.ADVANCED)return await AG(Z,Q,z,G,J,W);return{confirmed:!1}}catch(F){return{confirmed:!1}}}async function AG(Z,Q,G,J,W,q){let Y=await IG(Q,q),z=await I1(G),K=G.connection?.model||v("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"),X=G.connection?.temperature!==void 0?G.connection.temperature:v("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"),V={...Z,availableMemories:Y,profiles:Q.profiles.map((j,O)=>({...j,name:j?.isBuiltinCurrentST?v("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):j.name,isDefault:O===Q.defaultProfile})),effectivePrompt:z,defaultMemoryCount:Q.moduleSettings.defaultMemoryCount??0,profileModel:K,profileTemperature:X,currentModel:J?.model||v("Unknown","common.unknown"),currentTemperature:J?.temperature??0.7,currentApi:W?.api||v("Unknown","common.unknown"),suggestedProfileName:v1("STMemoryBooks_ModifiedProfileName","{{name}} - Modified",{name:G.name}),tokenThreshold:Q.moduleSettings.tokenWarningThreshold??30000,showWarning:Z.estimatedTokens>(Q.moduleSettings.tokenWarningThreshold??30000)},F=OZ.sanitize(O5(V));AZ();try{let j=new HZ(F,BZ.TEXT,"",{okButton:v("Create Memory","STMemoryBooks_Button_CreateMemory"),cancelButton:v("Cancel","STMemoryBooks_Cancel"),wide:!0,large:!0,allowVerticalScrolling:!0,customButtons:[{text:v("Save as New Profile","STMemoryBooks_Button_SaveAsNewProfile"),result:P1.SAVE_PROFILE,classes:["menu_button","whitespacenowrap"],action:null}]});TG(j,Z,Q,G,q);let O=await j.show();if(O===M1.AFFIRMATIVE)return await NG(j,Q);else if(O===P1.SAVE_PROFILE)return await DG(j,Q);return{confirmed:!1}}catch(j){return{confirmed:!1}}}async function NG(Z,Q){let G=Z.dlg,J=Number(G.querySelector("#stmb-profile-select-advanced").value),W=G.querySelector("#stmb-effective-prompt-advanced")?.value,q=Number(G.querySelector("#stmb-context-memories-advanced").value),Y=G.querySelector("#stmb-override-settings-advanced")?.checked||!1;if(Z.dlg.querySelector(".popup_button_ok")?.dataset.shouldSave==="true"){let F=G.querySelector("#stmb-new-profile-name-advanced").value.trim();if(F)try{await T5(G,Q,F),toastr.success(v1("STMemoryBooks_Toast_ProfileSaved",'Profile "{{name}}" saved successfully',{name:F}),v("STMemoryBooks","confirmationPopup.toast.title"))}catch(j){console.error(v(`${S0}: Failed to save profile:`,"confirmationPopup.log.saveFailed"),j),toastr.error(v1("STMemoryBooks_Toast_ProfileSaveFailed","Failed to save profile: {{message}}",{message:j.message}),v("STMemoryBooks","confirmationPopup.toast.title"))}else return console.error(v(`${S0}: Profile creation cancelled - no name provided`,"confirmationPopup.log.saveCancelledNoName")),toastr.error(v('Please enter a profile name or use "Create Memory" to proceed without saving',"STMemoryBooks_Toast_ProfileNameOrProceed"),v("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1}}let X=Q.profiles[J],V={...X,prompt:W||X.prompt,effectiveConnection:{...X.connection}};if(Y){let F=Q0(),j=o();if(j.api)V.effectiveConnection.api=j.api;if(F.model)V.effectiveConnection.model=F.model;if(typeof F.temperature==="number")V.effectiveConnection.temperature=F.temperature}return{confirmed:!0,profileSettings:V,advancedOptions:{memoryCount:q,overrideSettings:Y}}}async function DG(Z,Q){let G=Z.dlg.querySelector("#stmb-new-profile-name-advanced").value.trim();if(!G)return console.error(v(`${S0}: Profile name validation failed - empty name`,"confirmationPopup.log.validationFailedEmptyName")),toastr.error(v("Please enter a profile name","STMemoryBooks_Toast_ProfileNameRequired"),v("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1};return await T5(Z.dlg,Q,G),toastr.success(v1("STMemoryBooks_Toast_ProfileSaved",'Profile "{{name}}" saved successfully',{name:G}),v("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1}}function TG(Z,Q,G,J,W){let q=Z.dlg,Y={prompt:q.querySelector("#stmb-effective-prompt-advanced").value,memoryCount:parseInt(q.querySelector("#stmb-context-memories-advanced").value),overrideSettings:q.querySelector("#stmb-override-settings-advanced").checked,profileIndex:parseInt(q.querySelector("#stmb-profile-select-advanced").value)},z=()=>{let K=q.querySelector("#stmb-effective-prompt-advanced").value,X=parseInt(q.querySelector("#stmb-context-memories-advanced").value),V=q.querySelector("#stmb-override-settings-advanced").checked,F=parseInt(q.querySelector("#stmb-profile-select-advanced").value),j=K!==Y.prompt||X!==Y.memoryCount||V!==Y.overrideSettings||F!==Y.profileIndex,O=q.querySelector("#stmb-save-profile-section-advanced"),H=Z.dlg.querySelector(".popup_button_ok");if(H)if(j)H.textContent=v("Save Profile & Create Memory","STMemoryBooks_SaveProfileAndCreateMemory"),H.title=v("Save the modified settings as a new profile and create the memory","STMemoryBooks_Tooltip_SaveProfileAndCreateMemory"),H.dataset.shouldSave="true";else H.textContent=v("Create Memory","STMemoryBooks_CreateMemory"),H.title=v("Create memory using the selected profile settings","STMemoryBooks_Tooltip_CreateMemory"),H.dataset.shouldSave="false";if(j)O.style.display="block";else O.style.display="none"};q.querySelector("#stmb-effective-prompt-advanced")?.addEventListener("input",z),q.querySelector("#stmb-context-memories-advanced")?.addEventListener("change",z),q.querySelector("#stmb-override-settings-advanced")?.addEventListener("change",z),q.querySelector("#stmb-profile-select-advanced")?.addEventListener("change",async(K)=>{let X=parseInt(K.target.value),V=G.profiles[X],F=await I1(V);q.querySelector("#stmb-effective-prompt-advanced").value=F;let j=q.querySelector("#stmb-profile-model-display"),O=q.querySelector("#stmb-profile-temp-display");if(j)j.textContent=V.connection?.model||v("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel");if(O)O.textContent=V.connection?.temperature!==void 0?V.connection.temperature:v("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature");Y.prompt=F,Y.profileIndex=X,z()}),RG(q,Q,G,W,z),z()}function RG(Z,Q,G,J,W){let q=Z.querySelector("#stmb-context-memories-advanced"),Y=Z.querySelector("#stmb-total-tokens-display"),z=Z.querySelector("#stmb-token-warning-advanced"),K=G.moduleSettings.tokenWarningThreshold??50000;if(q&&Y){let X={},V=async()=>{let F=Number(q.value);if(F===0){if(Y.textContent=v1("STMemoryBooks_Label_TotalTokens","Total tokens: {{count}}",{count:Q.estimatedTokens}),z)z.style.display=Q.estimatedTokens>K?"block":"none";return}if(!X[F]){Y.textContent=v("Total tokens: Calculating...","STMemoryBooks_Label_TotalTokensCalculating");let H=await x1(F,G,J);X[F]=H.summaries}let j=X[F],O=await _G(Q,j);if(Y.textContent=v1("STMemoryBooks_Label_TotalTokens","Total tokens: {{count}}",{count:O}),z)if(O>K)z.style.display="block",z.querySelector("span").textContent=v1("STMemoryBooks_Warn_LargeSceneTokens","⚠️ Large scene ({{tokens}} tokens) may take some time to process.",{tokens:O});else z.style.display="none"};q.addEventListener("change",()=>{V(),W()}),V()}}async function T5(Z,Q,G){let J=parseInt(Z.querySelector("#stmb-profile-select-advanced")?.value||Q.defaultProfile),W=Q.profiles[J],q={name:G,prompt:Z.querySelector("#stmb-effective-prompt-advanced")?.value,api:W.connection?.api,model:W.connection?.model,temperature:W.connection?.temperature,preset:W.preset,titleFormat:W.titleFormat||Q.titleFormat};if(Z.querySelector("#stmb-override-settings-advanced")?.checked||!1){let X=Q0(),V=o();q.api=V.api,q.model=X.model,q.temperature=X.temperature}let z=J1(q),K=Q.profiles.map((X)=>X.name);z.name=L1(z.name,K),Q.profiles.push(z),BG()}async function x1(Z,Q,G){if(Z<=0)return{summaries:[],actualCount:0,requestedCount:0};try{let J=await z8();if(!J)return{summaries:[],actualCount:0,requestedCount:Z};let W=await N5(J);if(!W)return{summaries:[],actualCount:0,requestedCount:Z};let Y=U8(W).slice(-Z),z=Y.length;return{summaries:Y.map((K)=>({number:K.number,title:K.title,content:K.content,keywords:K.keywords})),actualCount:z,requestedCount:Z}}catch(J){return{summaries:[],actualCount:0,requestedCount:Z}}}async function _G(Z,Q){let G=Z.estimatedTokens;if(Q&&Q.length>0){let J=200;for(let W of Q){let q=W.content||"",Y=Math.ceil(q.length/4);J+=Y}return G+J}return G}async function IG(Z,Q){try{let G=await z8();if(!G)return 0;let J=await N5(G);if(!J)return 0;return U8(J).length}catch(G){return 0}}async function O8(Z,Q,G,J={}){try{if(!Z||typeof Z!=="object")return console.error(v(`${S0}: Invalid memoryResult passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidMemoryResult")),{action:"cancel"};if(!Q||typeof Q!=="object")return console.error(v(`${S0}: Invalid sceneData passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidSceneData")),{action:"cancel"};if(!G||typeof G!=="object")return console.error(v(`${S0}: Invalid profileSettings passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidProfileSettings")),{action:"cancel"};if(typeof Q.sceneStart!=="number"||typeof Q.sceneEnd!=="number"||typeof Q.messageCount!=="number")return console.error(v(`${S0}: sceneData missing required numeric properties`,"confirmationPopup.log.sceneDataMissingProps")),{action:"cancel"};let W=(X)=>{if(Array.isArray(X))return X.filter((V)=>V&&typeof V==="string").join(", ");else if(typeof X==="string")return X.trim();else return""},q={title:Z.extractedTitle||v("Memory","addlore.defaults.title"),content:Z.content||"",keywordsText:W(Z.suggestedKeys),sceneStart:Q.sceneStart,sceneEnd:Q.sceneEnd,messageCount:Q.messageCount,titleReadonly:!!J.lockTitle,profileName:G?.isBuiltinCurrentST?v("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):G.name||v("Unknown Profile","STMemoryBooks_UnknownProfile")},Y=OZ.sanitize(A5(q));AZ();let z=new HZ(Y,BZ.TEXT,"",{okButton:v("Edit & Save","STMemoryBooks_EditAndSave"),cancelButton:v("Cancel","STMemoryBooks_Cancel"),allowVerticalScrolling:!0,wide:!0,customButtons:[{text:v("Retry Generation","STMemoryBooks_RetryGeneration"),result:P1.RETRY,classes:["menu_button","whitespacenowrap"],action:null}]});switch(await z.show()){case M1.AFFIRMATIVE:case P1.EDIT:let X=z.dlg;if(!X)return console.error(v(`${S0}: Popup element not available for reading edited values`,"confirmationPopup.log.popupNotAvailable")),toastr.error(v("Unable to read edited values","STMemoryBooks_Toast_UnableToReadEditedValues"),v("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let V=X.querySelector("#stmb-preview-title"),F=X.querySelector("#stmb-preview-content"),j=X.querySelector("#stmb-preview-keywords");if(!V||!F||!j)return console.error(v(`${S0}: Required input elements not found in popup`,"confirmationPopup.log.inputsNotFound")),toastr.error(v("Unable to find input fields","STMemoryBooks_Toast_UnableToFindInputFields"),v("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let O=V.value?.trim()||"",H=F.value?.trim()||"",A=j.value?.trim()||"";if(J?.lockTitle)O=Z.extractedTitle||O;if(!O||O.length===0)return console.error(v(`${S0}: Memory title validation failed - empty title`,"confirmationPopup.log.titleValidationFailed")),toastr.error(v("Memory title cannot be empty","STMemoryBooks_Toast_TitleCannotBeEmpty"),v("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};if(!H||H.length===0)return console.error(v(`${S0}: Memory content validation failed - empty content`,"confirmationPopup.log.contentValidationFailed")),toastr.error(v("Memory content cannot be empty","STMemoryBooks_Toast_ContentCannotBeEmpty"),v("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let D=((L)=>{if(!L||typeof L!=="string")return[];return L.split(",").map((P)=>P.trim()).filter((P)=>P.length>0&&typeof P==="string")})(A);return{action:"edit",memoryData:{...Z,extractedTitle:O,content:H,suggestedKeys:D}};case P1.RETRY:return{action:"retry"};default:return{action:"cancel"}}}catch(W){return console.error(v(`${S0}: Error showing memory preview popup:`,"confirmationPopup.log.previewError"),W),{action:"cancel"}}}b0();t8();D1();e1();a8();b0();import{chat as b8,chat_metadata as D6}from"../../../../script.js";import{extension_settings as w0}from"../../../extensions.js";import{getRegexedString as P5,regex_placement as N6}from"../../../extensions/regex/engine.js";import{METADATA_KEY as hG,world_names as M5,loadWorldInfo as x5}from"../../../world-info.js";S8();import{t as V1,translate as A0}from"../../../i18n.js";var c="STMemoryBooks-SidePrompts",v5=!1,CZ=Promise.resolve();function S5(Z){return CZ=CZ.then(Z).catch((Q)=>{console.warn(`${c}: preview task failed`,Q)}),CZ}async function MZ(){let Z=w0.STMemoryBooks,Q=null;if(Z?.moduleSettings?.manualModeEnabled)Q=(f()||{}).manualLorebook??null;else Q=D6?.[hG]||null;if(!Q||!M5||!M5.includes(Q))throw toastr.error(A0("No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.","STMemoryBooks_Toast_NoMemoryLorebookAssigned"),"STMemoryBooks"),Error(A0("No memory lorebook assigned","STMemoryBooks_Error_NoMemoryLorebookAssigned"));try{let G=await x5(Q);if(!G)throw Error(A0("Failed to load lorebook","STMemoryBooks_Error_FailedToLoadLorebook"));return{name:Q,data:G}}catch(G){throw toastr.error(A0("Failed to load the selected lorebook.","STMemoryBooks_Toast_FailedToLoadLorebook"),"STMemoryBooks"),G}}function MG(Z,Q){let G=0,J=Math.max(-1,Number.isFinite(Z)?Z:-1),W=Math.max(-1,Q);for(let q=J+1;q<=W&&q<b8.length;q++){let Y=b8[q];if(Y&&!Y.is_system)G++}return G}function hZ(Z,Q){let G=Q8(Z,Q);return Z8(G)}function vZ(Z,Q,G,J,W=[]){let q=[];if(q.push(String(Z||"")),Q&&String(Q).trim())q.push(`
=== PRIOR ENTRY ===
`),q.push(String(Q));if(Array.isArray(W)&&W.length>0)q.push(`
=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
`),q.push(`These are previous memories for context only. Do NOT include them in your new output.

`),W.forEach((X,V)=>{if(q.push(`Context ${V+1} - ${X.title||"Memory"}:
`),q.push(`${X.content||""}
`),Array.isArray(X.keywords)&&X.keywords.length)q.push(`Keywords: ${X.keywords.join(", ")}
`);q.push(`
`)}),q.push(`=== END PREVIOUS SCENE CONTEXT ===
`);let Y=G?s6(G):"";if(q.push(`
=== SCENE TEXT ===
`),q.push(Y),J&&String(J).trim())q.push(`
=== RESPONSE FORMAT ===
`),q.push(String(J).trim());let z=q.join("");return w0?.STMemoryBooks?.moduleSettings?.useRegex?P5(z,N6.USER_INPUT,{isPrompt:!0}):z}async function PZ(Z,Q=null){let G,J,W,q,Y;if(Q&&(Q.api||Q.model))G=q0(Q.api||"openai"),J=Q.model||"",W=typeof Q.temperature==="number"?Q.temperature:0.7,q=Q.endpoint||null,Y=Q.apiKey||null,console.debug(`${c}: runLLM using overrides api=${G} model=${J} temp=${W}`);else{let X=o(),V=Q0();G=q0(X.completionSource||X.api||"openai"),J=V.model||"",W=V.temperature??0.7,console.debug(`${c}: runLLM using UI settings api=${G} model=${J} temp=${W}`)}let{text:z}=await o4({api:G,model:J,prompt:Z,temperature:W,endpoint:q,apiKey:Y,extra:{}});return w0?.STMemoryBooks?.moduleSettings?.useRegex?P5(z||"",N6.AI_OUTPUT):z||""}function N8(Z=null,Q={}){try{if(Z&&(Z.effectiveConnection||Z.connection)){let z=o6(Z),{api:K,model:X,temperature:V,endpoint:F,apiKey:j}=z;return console.debug(`${c}: resolveSidePromptConnection using provided profile api=${K} model=${X} temp=${V}`),{api:K,model:X,temperature:V,endpoint:F,apiKey:j}}let G=w0?.STMemoryBooks,J=G?.profiles||[],W=Q&&Number.isFinite(Q.overrideProfileIndex)?Number(Q.overrideProfileIndex):null;if(W!==null&&J.length>0){if(W<0||W>=J.length)W=0;let z=J[W];if(z?.useDynamicSTSettings||z?.connection?.api==="current_st"){let K=o(),X=Q0(),V=q0(K.completionSource||K.api||"openai"),F=X.model||"",j=X.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection using UI via template override profile index=${W} api=${V} model=${F} temp=${j}`),{api:V,model:F,temperature:j}}else{let K=z?.connection||{},X=q0(K.api||"openai"),V=K.model||"",F=typeof K.temperature==="number"?K.temperature:0.7,j=K.endpoint||null,O=K.apiKey||null;return console.debug(`${c}: resolveSidePromptConnection using template override profile index=${W} api=${X} model=${V} temp=${F}`),{api:X,model:V,temperature:F,endpoint:j,apiKey:O}}}let q=Number(G?.defaultProfile??0);if(!Array.isArray(J)||J.length===0){let z=o(),K=Q0(),X=q0(z.completionSource||z.api||"openai"),V=K.model||"",F=K.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection fallback to UI (no profiles) api=${X} model=${V} temp=${F}`),{api:X,model:V,temperature:F}}if(!Number.isFinite(q)||q<0||q>=J.length)q=0;let Y=J[q];if(Y?.useDynamicSTSettings||Y?.connection?.api==="current_st"){let z=o(),K=Q0(),X=q0(z.completionSource||z.api||"openai"),V=K.model||"",F=K.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection using UI via dynamic default profile api=${X} model=${V} temp=${F}`),{api:X,model:V,temperature:F}}else{let z=Y?.connection||{},K=q0(z.api||"openai"),X=z.model||"",V=typeof z.temperature==="number"?z.temperature:0.7,F=z.endpoint||null,j=z.apiKey||null;return console.debug(`${c}: resolveSidePromptConnection using default profile api=${K} model=${X} temp=${V}`),{api:K,model:X,temperature:V,endpoint:F,apiKey:j}}}catch(G){let J=o(),W=Q0(),q=q0(J.completionSource||J.api||"openai"),Y=W.model||"",z=W.temperature??0.7;return console.warn(`${c}: resolveSidePromptConnection error; falling back to UI`,G),{api:q,model:Y,temperature:z}}}function E8(Z,Q){let G=Number(Z);return Number.isFinite(G)?G:Q}function xZ(Z){let Q=Z&&Z.settings&&Z.settings.lorebook||{};return{constVectMode:Q.constVectMode||"link",position:E8(Q.position,0),orderMode:Q.orderMode==="manual"?"manual":"auto",orderValue:E8(Q.orderValue,100),preventRecursion:Q.preventRecursion!==!1,delayUntilRecursion:!!Q.delayUntilRecursion,outletName:String(Q.outletName||"")}}function SZ(Z){let Q={vectorized:Z.constVectMode==="link",selective:!0,order:Z.orderMode==="manual"?E8(Z.orderValue,100):100,position:E8(Z.position,0)},G={constant:Z.constVectMode==="blue",vectorized:Z.constVectMode==="link",preventRecursion:!!Z.preventRecursion,delayUntilRecursion:!!Z.delayUntilRecursion};if(Z.orderMode==="manual")G.order=E8(Z.orderValue,100);if(Number(Z.position)===7&&Z.outletName)G.outletName=String(Z.outletName);return{defaults:Q,entryOverrides:G}}async function EZ(){try{let Z=await A6("onInterval");if(!Z||Z.length===0)return;let Q=await MZ(),G=b8.length-1;if(G<0)return;for(let J of Z){let W=`${J.name} (STMB SidePrompt)`,q=`${J.name} (STMB Tracker)`,Y=z0(Q.data,W)||z0(Q.data,q),z=Number((Y&&Y[`STMB_sp_${J.key}_lastMsgId`])??(Y&&Y.STMB_tracker_lastMsgId)??-1),K=Y?.[`STMB_sp_${J.key}_lastRunAt`]?Date.parse(Y[`STMB_sp_${J.key}_lastRunAt`]):Y?.STMB_tracker_lastRunAt?Date.parse(Y.STMB_tracker_lastRunAt):null,X=Date.now(),V=1e4;if(K&&X-K<1e4)continue;let F=MG(z,G),j=Math.max(1,Number(J?.triggers?.onInterval?.visibleMessages??50));if(F<j)continue;let O=Math.max(0,z+1),A=Math.max(O,G-200+1),B=null;try{B=hZ(A,G)}catch(_){console.warn(`${c}: Interval compile failed:`,_);continue}let D=Y?.content||"",T=[],L=Number(J?.settings?.previousMemoriesCount??0),P=Math.max(0,Math.min(7,L));if(P>0)try{T=(await x1(P,w0,D6))?.summaries||[]}catch{}let x=vZ(J.prompt,D,B,J.responseFormat,T),w="";try{let _=Number(J?.settings?.overrideProfileIndex),u=!!J?.settings?.overrideProfileEnabled&&Number.isFinite(_)?N8(null,{overrideProfileIndex:_}):N8(null);console.log(`${c}: SidePrompt attempt`,{trigger:"onInterval",name:J.name,key:J.key,range:`${A}-${G}`,visibleSince:F,threshold:j,api:u.api,model:u.model}),w=await PZ(x,u)}catch(_){console.error(`${c}: Interval sideprompt LLM failed:`,_),toastr.error(V1`SidePrompt "${J.name}" failed: ${_.message}`,"STMemoryBooks");continue}try{if(w0?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let h={extractedTitle:W,content:w,suggestedKeys:[]},u={sceneStart:B?.metadata?.sceneStart??A,sceneEnd:B?.metadata?.sceneEnd??G,messageCount:B?.metadata?.messageCount??(B?.messages?.length??0)},e={name:"SidePrompt"},y;if(await S5(async()=>{y=await O8(h,u,e,{lockTitle:!0})}),y?.action==="cancel"||y?.action==="retry"){console.log(`${c}: SidePrompt "${J.name}" canceled or retry requested in preview; skipping save`);continue}else if(y?.action==="edit"&&y.memoryData)w=y.memoryData.content??w}}catch(_){console.warn(`${c}: Preview step failed; proceeding without preview`,_)}try{let _=xZ(J),{defaults:h,entryOverrides:u}=SZ(_),e=B?.metadata?.sceneEnd??G;await XZ(Q.name,Q.data,W,w,{defaults:h,entryOverrides:u,metadataUpdates:{[`STMB_sp_${J.key}_lastMsgId`]:G,[`STMB_sp_${J.key}_lastRunAt`]:new Date().toISOString(),STMB_tracker_lastMsgId:G,STMB_tracker_lastRunAt:new Date().toISOString()},refreshEditor:w0?.STMemoryBooks?.moduleSettings?.refreshEditor!==!1}),console.log(`${c}: SidePrompt success`,{trigger:"onInterval",name:J.name,key:J.key,saved:!0,contentChars:w.length})}catch(_){console.error(`${c}: Interval sideprompt upsert failed:`,_),toastr.error(V1`Failed to update sideprompt entry "${J.name}"`,"STMemoryBooks");continue}}}catch(Z){}}async function bZ(Z,Q=null){try{let G=await MZ(),J=await A6("onAfterMemory");if(!J||J.length===0)return;let W=N8(Q);console.debug(`${c}: runAfterMemory default overrides api=${W.api} model=${W.model} temp=${W.temperature}`);let q=w0?.STMemoryBooks,Y=q?.moduleSettings?.refreshEditor!==!1,z=q?.moduleSettings?.showNotifications!==!1,K=[],X=K0(Number(q?.moduleSettings?.sidePromptsMaxConcurrent??2),1,5),V=[];for(let F=0;F<J.length;F+=X)V.push(J.slice(F,F+X));for(let F of V){let j=F.map(async(B)=>{try{let D=`${B.name} (STMB SidePrompt)`,L=(z0(G.data,D)||z0(G.data,`${B.name} (STMB Plotpoints)`)||z0(G.data,`${B.name} (STMB Scoreboard)`))?.content||"",P=[],x=Number(B?.settings?.previousMemoriesCount??0),w=Math.max(0,Math.min(7,x));if(w>0)try{P=(await x1(w,w0,D6))?.summaries||[]}catch{}let _=vZ(B.prompt,L,Z,B.responseFormat,P),h=Number(B?.settings?.overrideProfileIndex),e=!!B?.settings?.overrideProfileEnabled&&Number.isFinite(h)?N8(null,{overrideProfileIndex:h}):W;console.log(`${c}: SidePrompt attempt`,{trigger:"onAfterMemory",name:B.name,key:B.key,api:e.api,model:e.model});let y=await PZ(_,e);return{ok:!0,tpl:B,text:y}}catch(D){return console.error(`${c}: Wave LLM failed for "${B.name}":`,D),{ok:!1,tpl:B,error:D}}}),O=await Promise.all(j.map((B)=>B.then((D)=>({...D,_completedAt:performance.now()}))));O.sort((B,D)=>B._completedAt-D._completedAt);let H=[],A=[];for(let B of O){if(!B.ok){K.push({name:B.tpl?.name||"unknown",ok:!1,error:B.error});continue}let D=B.text,T=!0;try{if(w0?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let P={extractedTitle:`${B.tpl.name} (STMB SidePrompt)`,content:D,suggestedKeys:[]},x={sceneStart:Z?.metadata?.sceneStart??0,sceneEnd:Z?.metadata?.sceneEnd??0,messageCount:Z?.metadata?.messageCount??(Z?.messages?.length??0)},w={name:"SidePrompt"},_;if(await S5(async()=>{_=await O8(P,x,w,{lockTitle:!0})}),_?.action==="cancel"||_?.action==="retry")T=!1;else if(_?.action==="edit"&&_.memoryData)D=_.memoryData.content??D}}catch(L){console.warn(`${c}: Preview step failed; proceeding without preview`,L)}if(T){let L=B.tpl,P=`${L.name} (STMB SidePrompt)`,x=xZ(L),{defaults:w,entryOverrides:_}=SZ(x);H.push({title:P,content:D,defaults:w,entryOverrides:_,metadataUpdates:{[`STMB_sp_${L.key}_lastRunAt`]:new Date().toISOString()}}),A.push(L.name)}else K.push({name:B.tpl.name,ok:!1,error:Error("User canceled or retry in preview")})}if(H.length>0)try{let B=await x5(G.name);await M8(G.name,B,H,{refreshEditor:Y}),G.data=B;for(let D of A){if(K.push({name:D,ok:!0}),z)toastr.success(V1`SidePrompt "${D}" updated.`,"STMemoryBooks");console.log(`${c}: SidePrompt success`,{trigger:"onAfterMemory",name:D,saved:!0})}}catch(B){console.error(`${c}: Wave save failed:`,B),toastr.error(A0("Failed to save SidePrompt updates for this wave","STMemoryBooks_Toast_FailedToSaveWave"),"STMemoryBooks");for(let D of A)K.push({name:D,ok:!1,error:B})}}if(z&&K.length>0){let F=K.filter((B)=>B.ok).map((B)=>B.name),j=K.filter((B)=>!B.ok).map((B)=>B.name),O=F.length,H=j.length,A=(B)=>{if(B.length===0)return"";let T=B.slice(0,5).join(", "),L=B.length>5?`, +${B.length-5} more`:"";return`${T}${L}`};if(H===0)toastr.info(V1`Side Prompts after memory: ${O} succeeded. ${A(F)}`,"STMemoryBooks");else toastr.warning(V1`Side Prompts after memory: ${O} succeeded, ${H} failed. ${H?"Failed: "+A(j):""}`,"STMemoryBooks")}}catch(G){}}async function yZ(Z){try{let Q=await MZ(),{name:G,range:J}=vG(Z);if(!G)return toastr.error(A0('SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',"STMemoryBooks_Toast_SidePromptNameNotProvided"),"STMemoryBooks"),"";let W=await TZ(G);if(!W)return toastr.error(A0("SidePrompt template not found. Check name.","STMemoryBooks_Toast_SidePromptNotFound"),"STMemoryBooks"),"";if(!(Array.isArray(W?.triggers?.commands)&&W.triggers.commands.some((B)=>String(B).toLowerCase()==="sideprompt")))return toastr.error(A0('Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',"STMemoryBooks_Toast_ManualRunDisabled"),"STMemoryBooks"),"";let Y=b8.length-1;if(Y<0)return toastr.error(A0("No messages available.","STMemoryBooks_Toast_NoMessagesAvailable"),"STMemoryBooks"),"";let z=null;if(J){let B=String(J).trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);if(!B)return toastr.error(A0("Invalid range format. Use X-Y","STMemoryBooks_Toast_InvalidRangeFormat"),"STMemoryBooks"),"";let D=parseInt(B[1],10),T=parseInt(B[2],10);if(!(D>=0&&T>=D&&T<b8.length))return toastr.error(A0("Invalid message range for /sideprompt","STMemoryBooks_Toast_InvalidMessageRange"),"STMemoryBooks"),"";try{z=hZ(D,T)}catch(L){return toastr.error(A0("Failed to compile the specified range","STMemoryBooks_Toast_FailedToCompileRange"),"STMemoryBooks"),""}}else{if(!v5)toastr.info(A0('Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',"STMemoryBooks_Toast_SidePromptRangeTip"),"STMemoryBooks"),v5=!0;let B=`${W.name} (STMB SidePrompt)`,D=z0(Q.data,B)||z0(Q.data,`${W.name} (STMB Scoreboard)`)||z0(Q.data,`${W.name} (STMB Plotpoints)`)||z0(Q.data,`${W.name} (STMB Tracker)`),T=Number((D&&D[`STMB_sp_${W.key}_lastMsgId`])??(D&&D.STMB_score_lastMsgId)??(D&&D.STMB_tracker_lastMsgId)??-1),L=Math.max(0,T+1),x=Math.max(L,Y-200+1);try{z=hZ(x,Y)}catch(w){return toastr.error(A0("Failed to compile messages for /sideprompt","STMemoryBooks_Toast_FailedToCompileMessages"),"STMemoryBooks"),""}}let K=`${W.name} (STMB SidePrompt)`,V=(z0(Q.data,K)||z0(Q.data,`${W.name} (STMB Scoreboard)`)||z0(Q.data,`${W.name} (STMB Plotpoints)`)||z0(Q.data,`${W.name} (STMB Tracker)`))?.content||"",F=[],j=Number(W?.settings?.previousMemoriesCount??0),O=Math.max(0,Math.min(7,j));if(O>0)try{F=(await x1(O,w0,D6))?.summaries||[]}catch{}let H=vZ(W.prompt,V,z,W.responseFormat,F),A="";try{let B=Number(W?.settings?.overrideProfileIndex),T=!!W?.settings?.overrideProfileEnabled&&Number.isFinite(B)?N8(null,{overrideProfileIndex:B}):N8(null);console.log(`${c}: SidePrompt attempt`,{trigger:"manual",name:W.name,key:W.key,rangeProvided:!!J,api:T.api,model:T.model}),A=await PZ(H,T);try{if(w0?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let h={extractedTitle:K,content:A,suggestedKeys:[]},u={sceneStart:z?.metadata?.sceneStart??0,sceneEnd:z?.metadata?.sceneEnd??0,messageCount:z?.metadata?.messageCount??(z?.messages?.length??0)},y=await O8(h,u,{name:"SidePrompt"},{lockTitle:!0});if(y?.action==="cancel"||y?.action==="retry")return toastr.info(V1`SidePrompt "${W.name}" canceled.`,"STMemoryBooks"),"";else if(y?.action==="edit"&&y.memoryData)A=y.memoryData.content??A}}catch(_){console.warn(`${c}: Preview step failed; proceeding without preview`,_)}let L=xZ(W),{defaults:P,entryOverrides:x}=SZ(L),w=z?.metadata?.sceneEnd??Y;await XZ(Q.name,Q.data,K,A,{defaults:P,entryOverrides:x,metadataUpdates:{[`STMB_sp_${W.key}_lastMsgId`]:w,[`STMB_sp_${W.key}_lastRunAt`]:new Date().toISOString(),STMB_tracker_lastMsgId:w,STMB_tracker_lastRunAt:new Date().toISOString()},refreshEditor:w0?.STMemoryBooks?.moduleSettings?.refreshEditor!==!1}),console.log(`${c}: SidePrompt success`,{trigger:"manual",name:W.name,key:W.key,saved:!0,contentChars:A.length})}catch(B){return console.error(`${c}: /sideprompt failed:`,B),toastr.error(V1`SidePrompt "${W.name}" failed: ${B.message}`,"STMemoryBooks"),""}return toastr.success(V1`SidePrompt "${W.name}" updated.`,"STMemoryBooks"),""}catch(Q){return""}}function vG(Z){let Q=String(Z||"").trim();if(!Q)return{name:"",range:null};let G="",J="",W=Q.match(/^"([^"]+)"\s*(.*)$/),q=!W&&Q.match(/^'([^']+)'\s*(.*)$/);if(W)G=W[1],J=W[2]||"";else if(q)G=q[1],J=q[2]||"";else{let z=Q.match(/(\d+)\s*[-–—]\s*(\d+)\s*$/);if(z)G=Q.slice(0,z.index).trim(),J=Q.slice(z.index);else G=Q,J=""}let Y=null;if(J){let z=J.match(/(\d+)\s*[-–—]\s*(\d+)/);if(z)Y=`${z[1]}-${z[2]}`}return{name:G,range:Y}}S8();import{Popup as y8,POPUP_TYPE as E1,POPUP_RESULT as j1}from"../../../popup.js";import{DOMPurify as T6}from"../../../../lib.js";import{escapeHtml as R}from"../../../utils.js";import{extension_settings as l0}from"../../../extensions.js";import{saveSettingsDebounced as xG}from"../../../../script.js";import{Handlebars as PG}from"../../../../lib.js";var E5=PG.compile(`
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="text-align:left;" data-i18n="STMemoryBooks_Name">Name</th>
      <th style="width: 240px; text-align:left;" data-i18n="STMemoryBooks_Triggers">Triggers</th>
      <th style="width: 120px; text-align:right;" data-i18n="STMemoryBooks_Actions">Actions</th>
    </tr>
  </thead>
  <tbody>
    {{#if items}}
      {{#each items}}
        <tr data-tpl-key="{{key}}" style="cursor: pointer; border-bottom: 1px solid var(--SmartThemeBorderColor);">
          <td style="padding: 8px;">{{name}}</td>
          <td style="padding: 8px;">
              {{#if badges}}
                {{#each badges}}
                  <span class="badge" style="margin-right:6px;">{{this}}</span>
                {{/each}}
              {{else}}
                <span class="opacity50p" data-i18n="STMemoryBooks_None">None</span>
              {{/if}}
          </td>
          <td style="padding: 8px; text-align:right;">
            <span class="stmb-sp-inline-actions" style="display: inline-flex; gap: 10px;">
              <button class="stmb-sp-action stmb-sp-action-edit" title="Edit" aria-label="Edit" data-i18n="[title]STMemoryBooks_Edit;[aria-label]STMemoryBooks_Edit" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="stmb-sp-action stmb-sp-action-duplicate" title="Duplicate" aria-label="Duplicate" data-i18n="[title]STMemoryBooks_Duplicate;[aria-label]STMemoryBooks_Duplicate" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="stmb-sp-action stmb-sp-action-delete" title="Delete" aria-label="Delete" data-i18n="[title]STMemoryBooks_Delete;[aria-label]STMemoryBooks_Delete" style="background:none;border:none;cursor:pointer;color:var(--redColor);">
                <i class="fa-solid fa-trash"></i>
              </button>
            </span>
          </td>
        </tr>
      {{/each}}
    {{else}}
      <tr>
        <td colspan="3">
          <div class="opacity50p" data-i18n="STMemoryBooks_NoSidePromptsAvailable">No side prompts available</div>
        </td>
      </tr>
    {{/if}}
  </tbody>
</table>
`);import{translate as N,applyLocale as b5}from"../../../i18n.js";function e0(Z,Q,G){let J=N(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}function y5(Z){let Q=[],G=Z?.triggers||{};if(G.onInterval&&Number(G.onInterval.visibleMessages)>=1)Q.push(`${N("Interval","STMemoryBooks_Interval")}:${Number(G.onInterval.visibleMessages)}`);if(G.onAfterMemory&&!!G.onAfterMemory.enabled)Q.push(N("AfterMemory","STMemoryBooks_AfterMemory"));if(Array.isArray(G.commands)&&G.commands.some((J)=>String(J).toLowerCase()==="sideprompt"))Q.push(N("Manual","STMemoryBooks_Manual"));return Q}function SG(Z){let Q=(Z||[]).map((G)=>({key:String(G.key||""),name:String(G.name||""),badges:y5(G)}));return E5({items:Q})}async function K1(Z,Q=null){let G=Z?.dlg?.querySelector("#stmb-sp-list");if(!G)return;let J=(Z?.dlg?.querySelector("#stmb-sp-search")?.value||"").toLowerCase(),W=await X1(),q=J?W.filter((Y)=>{let z=Y.name.toLowerCase().includes(J),K=y5(Y).join(" ").toLowerCase();return z||K.includes(J)}):W;G.innerHTML=T6.sanitize(SG(q));try{b5(G)}catch(Y){}if(Q){let Y=G.querySelector(`tr[data-tpl-key="${CSS.escape(Q)}"]`);if(Y)Y.style.backgroundColor="var(--cobalt30a)",Y.style.border=""}}async function EG(Z,Q){try{let G=await DZ(Q);if(!G){toastr.error(e0("STMemoryBooks_TemplateNotFound",'Template "{{key}}" not found',{key:Q}),N("STMemoryBooks","index.toast.title"));return}let J=!!G.enabled,W=G.settings||{},q=G.triggers||{},Y=!!(q.onInterval&&Number(q.onInterval.visibleMessages)>=1),z=Y?Math.max(1,Number(q.onInterval.visibleMessages)):50,K=!!(q.onAfterMemory&&q.onAfterMemory.enabled),X=Array.isArray(q.commands)?q.commands.some((C)=>String(C).toLowerCase()==="sideprompt"):!1,V=l0?.STMemoryBooks?.profiles||[],F=Number.isFinite(W.overrideProfileIndex)?Number(W.overrideProfileIndex):l0?.STMemoryBooks?.defaultProfile??0;if(!(F>=0&&F<V.length))F=0;let j=!!W.overrideProfileEnabled,O=V.map((C,d)=>`<option value="${d}" ${d===F?"selected":""}>${R(C?.name||"Profile "+(d+1))}</option>`).join(""),H=`
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-override-enabled" ${j?"checked":""}>
                    <span>${R(N("Override default memory profile","STMemoryBooks_OverrideDefaultMemoryProfile"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-edit-override-container" style="display: ${j?"block":"none"};">
                <label for="stmb-sp-edit-override-index">
                    <h4>${R(N("Connection Profile:","STMemoryBooks_ConnectionProfile"))}</h4>
                    <select id="stmb-sp-edit-override-index" class="text_pole">
                        ${O}
                    </select>
                </label>
            </div>
        `,A=Number.isFinite(W.previousMemoriesCount)?Number(W.previousMemoriesCount):0,B=W&&W.lorebook||{},D=B.constVectMode||"link",T=Number.isFinite(B.position)?Number(B.position):0,L=B.orderMode==="manual",P=Number.isFinite(B.orderValue)?Number(B.orderValue):100,x=B.preventRecursion!==!1,w=!!B.delayUntilRecursion,_=`
            <h3>${R(N("Edit Side Prompt","STMemoryBooks_EditSidePrompt"))}</h3>
            <div class="world_entry_form_control">
                <small>${R(N("Key:","STMemoryBooks_Key"))} <code>${R(G.key)}</code></small>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-name">
                    <h4>${R(N("Name:","STMemoryBooks_Name"))}</h4>
                    <input type="text" id="stmb-sp-edit-name" class="text_pole" value="${R(G.name)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-enabled" ${J?"checked":""}>
                    <span>${R(N("Enabled","STMemoryBooks_Enabled"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>${R(N("Triggers:","STMemoryBooks_Triggers"))}</h4>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-interval" ${Y?"checked":""}>
                    <span>${R(N("Run on visible message interval","STMemoryBooks_RunOnVisibleMessageInterval"))}</span>
                </label>
                <div id="stmb-sp-edit-interval-container" style="display:${Y?"block":"none"}; margin-left:28px;">
                    <label for="stmb-sp-edit-interval">
                        <h4 style="margin: 0 0 4px 0;">${R(N("Interval (visible messages):","STMemoryBooks_IntervalVisibleMessages"))}</h4>
                        <input type="number" id="stmb-sp-edit-interval" class="text_pole" min="1" step="1" value="${z}">
                    </label>
                </div>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-aftermem" ${K?"checked":""}>
                    <span>${R(N("Run automatically after memory","STMemoryBooks_RunAutomaticallyAfterMemory"))}</span>
                </label>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-manual" ${X?"checked":""}>
                    <span>${R(N("Allow manual run via /sideprompt","STMemoryBooks_AllowManualRunViaSideprompt"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prompt">
                    <h4>${R(N("Prompt:","STMemoryBooks_PromptTitle"))}</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-prompt" class="text_pole textarea_compact" rows="10">${R(G.prompt||"")}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-response-format">
                    <h4>${R(N("Response Format (optional):","STMemoryBooks_ResponseFormatOptional"))}</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-response-format" class="text_pole textarea_compact" rows="6">${R(G.responseFormat||"")}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>${R(N("Lorebook Entry Settings","STMemoryBooks_LorebookEntrySettings"))}:</h4>
                <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${R(N("Activation Mode","STMemoryBooks_ActivationMode"))}:</h4>
                        <select id="stmb-sp-edit-lb-mode" class="text_pole">
                            <option value="link" ${D==="link"?"selected":""}>${R(N("\uD83D\uDD17 Vectorized (Default)","STMemoryBooks_Vectorized"))}</option>
                            <option value="green" ${D==="green"?"selected":""}>${R(N("\uD83D\uDFE2 Normal","STMemoryBooks_Normal"))}</option>
                            <option value="blue" ${D==="blue"?"selected":""}>${R(N("\uD83D\uDD35 Constant","STMemoryBooks_Constant"))}</option>
                        </select>
                    </label>
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${R(N("Insertion Position:","STMemoryBooks_InsertionPosition"))}</h4>
                        <select id="stmb-sp-edit-lb-position" class="text_pole">
                            <option value="0" ${T===0?"selected":""}>${R(N("↑Char","STMemoryBooks_CharUp"))}</option>
                            <option value="1" ${T===1?"selected":""}>${R(N("↓Char","STMemoryBooks_CharDown"))}</option>
                            <option value="5" ${T===5?"selected":""}>${R(N("↑EM","STMemoryBooks_EMUp"))}</option>
                            <option value="6" ${T===6?"selected":""}>${R(N("↓EM","STMemoryBooks_EMDown"))}</option>
                            <option value="2" ${T===2?"selected":""}>${R(N("↑AN","STMemoryBooks_ANUp"))}</option>
                            <option value="3" ${T===3?"selected":""}>${R(N("↓AN","STMemoryBooks_ANDown"))}</option>
                            <option value="7" ${T===7?"selected":""}>${R(N("Outlet","STMemoryBooks_Outlet"))}</option>
                        </select>
                        <div id="stmb-sp-edit-lb-outlet-name-container" style="display:${T===7?"block":"none"}; margin-top: 8px;">
                            <label>
                                <h4 style="margin: 0 0 4px 0;">${R(N("Outlet Name:","STMemoryBooks_OutletName"))}</h4>
                                <input type="text" id="stmb-sp-edit-lb-outlet-name" class="text_pole" placeholder="${R(N("Outlet name","STMemoryBooks_OutletNamePlaceholder"))}" value="${R(B.outletName||"")}">
                            </label>
                        </div>
                    </label>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <h4>${R(N("Insertion Order:","STMemoryBooks_InsertionOrder"))}</h4>
                    <label class="radio_label">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-auto" value="auto" ${L?"":"checked"}>
                        <span>${R(N("Auto (uses memory #)","STMemoryBooks_AutoOrder"))}</span>
                    </label>
                    <label class="radio_label" style="margin-left: 12px;">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-manual" value="manual" ${L?"checked":""}>
                        <span>${R(N("Manual","STMemoryBooks_ManualOrder"))}</span>
                    </label>
                    <div id="stmb-sp-edit-lb-order-value-container" style="display:${L?"block":"none"}; margin-left:28px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">${R(N("Order Value:","STMemoryBooks_OrderValue"))}</h4>
                            <input type="number" id="stmb-sp-edit-lb-order-value" class="text_pole" step="1" value="${P}">
                        </label>
                    </div>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <label class="checkbox_label">
                        <input type="checkbox" id="stmb-sp-edit-lb-prevent" ${x?"checked":""}>
                        <span>${R(N("Prevent Recursion","STMemoryBooks_PreventRecursion"))}</span>
                    </label>
                    <label class="checkbox_label" style="margin-left: 12px;">
                        <input type="checkbox" id="stmb-sp-edit-lb-delay" ${w?"checked":""}>
                        <span>${R(N("Delay Until Recursion","STMemoryBooks_DelayUntilRecursion"))}</span>
                    </label>
                </div>
            </div>

            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prev-mem-count">
                    <h4>${R(N("Previous memories for context:","STMemoryBooks_PreviousMemoriesForContext"))}</h4>
<input type="number" id="stmb-sp-edit-prev-mem-count" class="text_pole" min="0" max="7" step="1" value="${A}">
                </label>
                <small class="opacity70p">${R(N("Number of previous memory entries to include before scene text (0 = none).","STMemoryBooks_PreviousMemoriesHelp"))}</small>
            </div>

            <div class="world_entry_form_control">
                <h4>${R(N("Overrides:","STMemoryBooks_Overrides"))}</h4>
                ${H}
            </div>
        `,h=new y8(T6.sanitize(_),E1.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:N("Save","STMemoryBooks_Save"),cancelButton:N("Cancel","STMemoryBooks_Cancel")}),u=()=>{let C=h.dlg;if(!C)return;let d=C.querySelector("#stmb-sp-edit-trg-interval"),F0=C.querySelector("#stmb-sp-edit-interval-container");d?.addEventListener("change",()=>{if(F0)F0.style.display=d.checked?"block":"none";if(d.checked)C.querySelector("#stmb-sp-edit-interval")?.focus()});let m0=C.querySelector("#stmb-sp-edit-override-enabled"),h0=C.querySelector("#stmb-sp-edit-override-container");m0?.addEventListener("change",()=>{if(h0)h0.style.display=m0.checked?"block":"none"});let D0=C.querySelector("#stmb-sp-edit-lb-order-auto"),X0=C.querySelector("#stmb-sp-edit-lb-order-manual"),T0=C.querySelector("#stmb-sp-edit-lb-order-value-container"),A1=()=>{if(T0)T0.style.display=X0?.checked?"block":"none"};D0?.addEventListener("change",A1),X0?.addEventListener("change",A1);let U0=C.querySelector("#stmb-sp-edit-lb-position"),o0=C.querySelector("#stmb-sp-edit-lb-outlet-name-container");U0?.addEventListener("change",()=>{if(o0)o0.style.display=U0.value==="7"?"block":"none"})},e=h.show();if(u(),await e===j1.AFFIRMATIVE){let C=h.dlg,d=C.querySelector("#stmb-sp-edit-name")?.value.trim()||"",F0=C.querySelector("#stmb-sp-edit-prompt")?.value.trim()||"",m0=C.querySelector("#stmb-sp-edit-response-format")?.value.trim()||"",h0=!!C.querySelector("#stmb-sp-edit-enabled")?.checked;if(!F0){toastr.error(N("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),N("STMemoryBooks","index.toast.title"));return}if(!d)toastr.info(N("Name was empty. Keeping previous name.","STMemoryBooks_NameEmptyKeepPrevious"),N("STMemoryBooks","index.toast.title"));let D0={},X0=!!C.querySelector("#stmb-sp-edit-trg-interval")?.checked,T0=!!C.querySelector("#stmb-sp-edit-trg-aftermem")?.checked,A1=!!C.querySelector("#stmb-sp-edit-trg-manual")?.checked;if(X0){let _0=parseInt(C.querySelector("#stmb-sp-edit-interval")?.value??"50",10),_7=Math.max(1,isNaN(_0)?50:_0);D0.onInterval={visibleMessages:_7}}if(T0)D0.onAfterMemory={enabled:!0};if(A1)D0.commands=["sideprompt"];let U0={...G.settings||{}},o0=!!C.querySelector("#stmb-sp-edit-override-enabled")?.checked;if(U0.overrideProfileEnabled=o0,o0){let _0=parseInt(C.querySelector("#stmb-sp-edit-override-index")?.value??"",10);if(!isNaN(_0))U0.overrideProfileIndex=_0}else delete U0.overrideProfileIndex;let T8=C.querySelector("#stmb-sp-edit-lb-mode")?.value||"link",n0=parseInt(C.querySelector("#stmb-sp-edit-lb-position")?.value??"0",10),x6=!!C.querySelector("#stmb-sp-edit-lb-order-manual")?.checked,S6=parseInt(C.querySelector("#stmb-sp-edit-lb-order-value")?.value??"100",10),g=!!C.querySelector("#stmb-sp-edit-lb-prevent")?.checked,l=!!C.querySelector("#stmb-sp-edit-lb-delay")?.checked,G0=n0===7?C.querySelector("#stmb-sp-edit-lb-outlet-name")?.value?.trim()||"":"",R0=parseInt(C.querySelector("#stmb-sp-edit-prev-mem-count")?.value??"0",10);U0.previousMemoriesCount=Number.isFinite(R0)&&R0>0?Math.min(R0,7):0,U0.lorebook={constVectMode:["link","green","blue"].includes(T8)?T8:"link",position:Number.isFinite(n0)?n0:0,orderMode:x6?"manual":"auto",orderValue:Number.isFinite(S6)?S6:100,preventRecursion:g,delayUntilRecursion:l,...n0===7&&G0?{outletName:G0}:{}},await O6({key:G.key,name:d,enabled:h0,prompt:F0,responseFormat:m0,settings:U0,triggers:D0}),toastr.success(e0("STMemoryBooks_Toast_SidePromptUpdated",'SidePrompt "{{name}}" updated.',{name:d||G.name}),N("STMemoryBooks","index.toast.title")),window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated")),await K1(Z,G.key)}}catch(G){console.error("STMemoryBooks: Error editing side prompt:",G),toastr.error(N("Failed to edit SidePrompt","STMemoryBooks_FailedToEditSidePrompt"),N("STMemoryBooks","index.toast.title"))}}async function bG(Z){let Q=l0?.STMemoryBooks?.profiles||[],G=Number(l0?.STMemoryBooks?.defaultProfile??0);if(!(G>=0&&G<Q.length))G=0;let J=Q.map((X,V)=>`<option value="${V}" ${V===G?"selected":""}>${R(X?.name||"Profile "+(V+1))}</option>`).join(""),W=`
        <h3>${R(N("New Side Prompt","STMemoryBooks_NewSidePrompt"))}</h3>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-name">
                <h4>${R(N("Name:","STMemoryBooks_Name"))}</h4>
                <input type="text" id="stmb-sp-new-name" class="text_pole" placeholder="${R(N("My Side Prompt","STMemoryBooks_MySidePromptPlaceholder"))}" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-enabled">
                <span>${R(N("Enabled","STMemoryBooks_Enabled"))}</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${R(N("Triggers:","STMemoryBooks_Triggers"))}</h4>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-interval">
                <span>${R(N("Run on visible message interval","STMemoryBooks_RunOnVisibleMessageInterval"))}</span>
            </label>
            <div id="stmb-sp-new-interval-container" class="displayNone" style="margin-left:28px;">
                <label for="stmb-sp-new-interval">
                    <h4 style="margin: 0 0 4px 0;">${R(N("Interval (visible messages):","STMemoryBooks_IntervalVisibleMessages"))}</h4>
                    <input type="number" id="stmb-sp-new-interval" class="text_pole" min="1" step="1" value="50">
                </label>
            </div>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-aftermem">
                <span>${R(N("Run automatically after memory","STMemoryBooks_RunAutomaticallyAfterMemory"))}</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-manual" checked>
                <span>${R(N("Allow manual run via /sideprompt","STMemoryBooks_AllowManualRunViaSideprompt"))}</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prompt">
                <h4>${R(N("Prompt:","STMemoryBooks_PromptTitle"))}</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-prompt" class="text_pole textarea_compact" rows="8" placeholder="${R(N("Enter your prompt here...","STMemoryBooks_EnterPromptPlaceholder"))}"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-response-format">
                <h4>${R(N("Response Format (optional):","STMemoryBooks_ResponseFormatOptional"))}</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-response-format" class="text_pole textarea_compact" rows="6" placeholder="${R(N("Optional response format","STMemoryBooks_ResponseFormatPlaceholder"))}"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${R(N("Lorebook Entry Settings","STMemoryBooks_LorebookEntrySettings"))}:</h4>
            <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                <label>
                    <h4 style="margin: 0 0 4px 0;">${R(N("Activation Mode","STMemoryBooks_ActivationMode"))}:</h4>
                    <select id="stmb-sp-new-lb-mode" class="text_pole">
                        <option value="link" selected>${R(N("\uD83D\uDD17 Vectorized (Default)","STMemoryBooks_Vectorized"))}</option>
                        <option value="green">${R(N("\uD83D\uDFE2 Normal","STMemoryBooks_Normal"))}</option>
                        <option value="blue">${R(N("\uD83D\uDD35 Constant","STMemoryBooks_Constant"))}</option>
                    </select>
                </label>
                <label>
                    <h4 style="margin: 0 0 4px 0;">${R(N("Insertion Position:","STMemoryBooks_InsertionPosition"))}</h4>
                    <select id="stmb-sp-new-lb-position" class="text_pole">
                        <option value="0" selected>${R(N("↑Char","STMemoryBooks_CharUp"))}</option>
                        <option value="1">${R(N("↓Char","STMemoryBooks_CharDown"))}</option>
                        <option value="2">${R(N("↑AN","STMemoryBooks_ANUp"))}</option>
                        <option value="3">${R(N("↓AN","STMemoryBooks_ANDown"))}</option>
                        <option value="4">${R(N("↑EM","STMemoryBooks_EMUp"))}</option>
                        <option value="5">${R(N("↓EM","STMemoryBooks_EMDown"))}</option>
                        <option value="7">${R(N("Outlet","STMemoryBooks_Outlet"))}</option>
                    </select>
                    <div id="stmb-sp-new-lb-outlet-name-container" class="displayNone" style="margin-top: 8px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">${R(N("Outlet Name:","STMemoryBooks_OutletName"))}</h4>
                            <input type="text" id="stmb-sp-new-lb-outlet-name" class="text_pole" placeholder="${R(N("Outlet name (e.g., ENDING)","STMemoryBooks_OutletNamePlaceholder"))}">
                        </label>
                    </div>
                </label>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <h4>${R(N("Insertion Order:","STMemoryBooks_InsertionOrder"))}</h4>
                <label class="radio_label">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-auto" value="auto" checked>
                    <span>${R(N("Auto (uses memory #)","STMemoryBooks_AutoOrder"))}</span>
                </label>
                <label class="radio_label" style="margin-left: 12px;">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-manual" value="manual">
                    <span>${R(N("Manual","STMemoryBooks_ManualOrder"))}</span>
                </label>
                <div id="stmb-sp-new-lb-order-value-container" style="display:none; margin-left:28px;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${R(N("Order Value:","STMemoryBooks_OrderValue"))}</h4>
                        <input type="number" id="stmb-sp-new-lb-order-value" class="text_pole" step="1" value="100">
                    </label>
                </div>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-lb-prevent" checked>
                    <span>${R(N("Prevent Recursion","STMemoryBooks_PreventRecursion"))}</span>
                </label>
                <label class="checkbox_label" style="margin-left: 12px;">
                    <input type="checkbox" id="stmb-sp-new-lb-delay">
                    <span>${R(N("Delay Until Recursion","STMemoryBooks_DelayUntilRecursion"))}</span>
                </label>
            </div>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prev-mem-count">
                <h4>${R(N("Previous memories for context:","STMemoryBooks_PreviousMemoriesForContext"))}</h4>
<input type="number" id="stmb-sp-new-prev-mem-count" class="text_pole" min="0" max="7" step="1" value="0">
            </label>
            <small class="opacity70p">${R(N("Number of previous memory entries to include before scene text (0 = none).","STMemoryBooks_PreviousMemoriesHelp"))}</small>
        </div>

        <div class="world_entry_form_control">
            <h4>${R(N("Overrides:","STMemoryBooks_Overrides"))}</h4>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-override-enabled">
                    <span>${R(N("Override default memory profile","STMemoryBooks_OverrideDefaultMemoryProfile"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-new-override-container" style="display: none;">
                <label for="stmb-sp-new-override-index">
                    <h4>${R(N("Connection Profile:","STMemoryBooks_ConnectionProfile"))}</h4>
                    <select id="stmb-sp-new-override-index" class="text_pole">
                        ${J}
                    </select>
                </label>
            </div>
        </div>
    `,q=new y8(T6.sanitize(W),E1.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:N("Create","STMemoryBooks_Create"),cancelButton:N("Cancel","STMemoryBooks_Cancel")}),Y=()=>{let X=q.dlg,V=X.querySelector("#stmb-sp-new-trg-interval"),F=X.querySelector("#stmb-sp-new-interval-container");V?.addEventListener("change",()=>{if(F)F.style.display=V.checked?"block":"none";if(V.checked)X.querySelector("#stmb-sp-new-interval")?.focus()});let j=X.querySelector("#stmb-sp-new-override-enabled"),O=X.querySelector("#stmb-sp-new-override-container");j?.addEventListener("change",()=>{if(O)O.style.display=j.checked?"block":"none"});let H=X.querySelector("#stmb-sp-new-lb-order-auto"),A=X.querySelector("#stmb-sp-new-lb-order-manual"),B=X.querySelector("#stmb-sp-new-lb-order-value-container"),D=()=>{if(B)B.style.display=A?.checked?"block":"none"};H?.addEventListener("change",D),A?.addEventListener("change",D);let T=X.querySelector("#stmb-sp-new-lb-position"),L=X.querySelector("#stmb-sp-new-lb-outlet-name-container");T?.addEventListener("change",()=>{if(L)L.classList.toggle("displayNone",T.value!=="7")})},z=q.show();if(Y(),await z===j1.AFFIRMATIVE){let X=q.dlg,V=X.querySelector("#stmb-sp-new-name")?.value.trim()||"",F=!!X.querySelector("#stmb-sp-new-enabled")?.checked,j=X.querySelector("#stmb-sp-new-prompt")?.value.trim()||"",O=X.querySelector("#stmb-sp-new-response-format")?.value.trim()||"";if(!j){toastr.error(N("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),N("STMemoryBooks","index.toast.title"));return}if(!V)toastr.info(e0("STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled",'No name provided. Using "{{name}}".',{name:N("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")}),N("STMemoryBooks","index.toast.title"));let H={},A=!!X.querySelector("#stmb-sp-new-trg-interval")?.checked,B=!!X.querySelector("#stmb-sp-new-trg-aftermem")?.checked,D=!!X.querySelector("#stmb-sp-new-trg-manual")?.checked;if(A){let C=parseInt(X.querySelector("#stmb-sp-new-interval")?.value??"50",10),d=Math.max(1,isNaN(C)?50:C);H.onInterval={visibleMessages:d}}if(B)H.onAfterMemory={enabled:!0};if(D)H.commands=["sideprompt"];let T={},L=!!X.querySelector("#stmb-sp-new-override-enabled")?.checked;if(T.overrideProfileEnabled=L,L){let C=parseInt(X.querySelector("#stmb-sp-new-override-index")?.value??"",10);if(!isNaN(C))T.overrideProfileIndex=C}let P=X.querySelector("#stmb-sp-new-lb-mode")?.value||"link",x=parseInt(X.querySelector("#stmb-sp-new-lb-position")?.value??"0",10),w=!!X.querySelector("#stmb-sp-new-lb-order-manual")?.checked,_=parseInt(X.querySelector("#stmb-sp-new-lb-order-value")?.value??"100",10),h=!!X.querySelector("#stmb-sp-new-lb-prevent")?.checked,u=!!X.querySelector("#stmb-sp-new-lb-delay")?.checked,e=x===7?X.querySelector("#stmb-sp-new-lb-outlet-name")?.value?.trim()||"":"",y=parseInt(X.querySelector("#stmb-sp-new-prev-mem-count")?.value??"0",10);T.previousMemoriesCount=Number.isFinite(y)&&y>0?Math.min(y,7):0,T.lorebook={constVectMode:["link","green","blue"].includes(P)?P:"link",position:Number.isFinite(x)?x:0,orderMode:w?"manual":"auto",orderValue:Number.isFinite(_)?_:100,preventRecursion:h,delayUntilRecursion:u,...x===7&&e?{outletName:e}:{}};try{await O6({name:V,enabled:F,prompt:j,responseFormat:O,settings:T,triggers:H}),toastr.success(N("SidePrompt created","STMemoryBooks_SidePromptCreated"),N("STMemoryBooks","index.toast.title")),await K1(Z)}catch(C){console.error("STMemoryBooks: Error creating side prompt:",C),toastr.error(N("Failed to create SidePrompt","STMemoryBooks_FailedToCreateSidePrompt"),N("STMemoryBooks","index.toast.title"))}}}async function yG(){try{let Z=await IZ(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-side-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(N("Side prompts exported successfully","STMemoryBooks_SidePromptsExported"),N("STMemoryBooks","index.toast.title"))}catch(Z){console.error("STMemoryBooks: Error exporting side prompts:",Z),toastr.error(N("Failed to export side prompts","STMemoryBooks_FailedToExportSidePrompts"),N("STMemoryBooks","index.toast.title"))}}async function fG(Z,Q){let G=Z.target.files?.[0];if(!G)return;try{let J=await G.text(),W=await LZ(J);if(W&&typeof W==="object"){let{added:q=0,renamed:Y=0}=W,z=Y>0?e0("STMemoryBooks_ImportedSidePromptsRenamedDetail"," ({{count}} renamed due to key conflicts)",{count:Y}):"";toastr.success(e0("STMemoryBooks_ImportedSidePromptsDetail","Imported side prompts: {{added}} added{{detail}}",{added:q,detail:z}),N("STMemoryBooks","index.toast.title"))}else toastr.success(N("Imported side prompts","STMemoryBooks_ImportedSidePrompts"),N("STMemoryBooks","index.toast.title"));await K1(Q)}catch(J){console.error("STMemoryBooks: Error importing side prompts:",J),toastr.error(e0("STMemoryBooks_FailedToImportSidePrompts","Failed to import: {{message}}",{message:J?.message||"Unknown error"}),N("STMemoryBooks","index.toast.title"))}}async function f5(){try{let Z='<h3 data-i18n="STMemoryBooks_SidePrompts_Title">\uD83C\uDFA1 Trackers & Side Prompts</h3>';Z+='<div class="world_entry_form_control">',Z+='<p class="opacity70p" data-i18n="STMemoryBooks_SidePrompts_Desc">Create and manage side prompts for trackers and other behind-the-scenes functions.</p>',Z+="</div>",Z+='<div class="world_entry_form_control">',Z+='<input type="text" id="stmb-sp-search" class="text_pole" data-i18n="[placeholder]STMemoryBooks_SearchSidePrompts;[aria-label]STMemoryBooks_SearchSidePrompts" placeholder="Search side prompts..." aria-label="Search side prompts" />',Z+="</div>",Z+='<div class="world_entry_form_control">',Z+=`<label for="stmb-sp-max-concurrent"><h4>${R(N("How many concurrent prompts to run at once","STMemoryBooks_SidePrompts_MaxConcurrentLabel"))}</h4></label>`,Z+='<input type="number" id="stmb-sp-max-concurrent" class="text_pole" min="1" max="5" step="1" value="2">',Z+=`<small class="opacity70p">${R(N("Range 1–5. Defaults to 2.","STMemoryBooks_SidePrompts_MaxConcurrentHelp"))}</small>`,Z+="</div>",Z+='<div id="stmb-sp-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',Z+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',Z+=`<button id="stmb-sp-new" class="menu_button whitespacenowrap">${R(N("New","STMemoryBooks_SidePrompts_New"))}</button>`,Z+=`<button id="stmb-sp-export" class="menu_button whitespacenowrap">${R(N("Export JSON","STMemoryBooks_SidePrompts_ExportJSON"))}</button>`,Z+=`<button id="stmb-sp-import" class="menu_button whitespacenowrap">${R(N("Import JSON","STMemoryBooks_SidePrompts_ImportJSON"))}</button>`,Z+=`<button id="stmb-sp-recreate-builtins" class="menu_button whitespacenowrap">${R(N("♻️ Recreate Built-in Side Prompts","STMemoryBooks_SidePrompts_RecreateBuiltIns"))}</button>`,Z+="</div>",Z+='<input type="file" id="stmb-sp-import-file" accept=".json" style="display: none;" />';let Q=new y8(T6.sanitize(Z),E1.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:N("Close","STMemoryBooks_Close")});(()=>{let J=Q.dlg;if(!J)return;let W=J.querySelector("#stmb-sp-max-concurrent");if(W){let q=(K,X,V)=>Math.max(X,Math.min(V,K)),Y=q(Number(l0?.STMemoryBooks?.moduleSettings?.sidePromptsMaxConcurrent??2),1,5);W.value=String(Y);let z=()=>{let K=parseInt(W.value,10),X=q(isNaN(K)?2:K,1,5);if(W.value=String(X),!l0.STMemoryBooks)l0.STMemoryBooks={moduleSettings:{}};if(!l0.STMemoryBooks.moduleSettings)l0.STMemoryBooks.moduleSettings={};l0.STMemoryBooks.moduleSettings.sidePromptsMaxConcurrent=X,xG()};W.addEventListener("change",z)}J.querySelector("#stmb-sp-search")?.addEventListener("input",()=>K1(Q)),J.querySelector("#stmb-sp-new")?.addEventListener("click",async()=>{await bG(Q)}),J.querySelector("#stmb-sp-export")?.addEventListener("click",async()=>{await yG()}),J.querySelector("#stmb-sp-import")?.addEventListener("click",()=>{J.querySelector("#stmb-sp-import-file")?.click()}),J.querySelector("#stmb-sp-import-file")?.addEventListener("change",async(q)=>{await fG(q,Q)}),J.querySelector("#stmb-sp-recreate-builtins")?.addEventListener("click",async()=>{let q=`<div class="info_block">${R(N("This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.","STMemoryBooks_SidePrompts_RecreateWarning"))}</div>`;if(await new y8(`<h3>${R(N("Recreate Built-in Side Prompts","STMemoryBooks_SidePrompts_RecreateTitle"))}</h3>${q}`,E1.CONFIRM,"",{okButton:N("Recreate","STMemoryBooks_SidePrompts_RecreateOk"),cancelButton:N("Cancel","STMemoryBooks_Cancel")}).show()===j1.AFFIRMATIVE)try{let K=await wZ("overwrite"),X=Number(K?.replaced||0);toastr.success(e0("STMemoryBooks_SidePrompts_RecreateSuccess","Recreated {{count}} built-in side prompts from current locale",{count:X}),N("STMemoryBooks","index.toast.title")),window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated")),await K1(Q)}catch(K){console.error("STMemoryBooks: Error recreating built-in side prompts:",K),toastr.error(N("Failed to recreate built-in side prompts","STMemoryBooks_SidePrompts_RecreateFailed"),N("STMemoryBooks","index.toast.title"))}}),J.addEventListener("click",async(q)=>{let Y=q.target.closest(".stmb-sp-action"),z=q.target.closest("tr[data-tpl-key]");if(!z)return;let K=z.dataset.tplKey;if(J.querySelectorAll("tr[data-tpl-key]").forEach((X)=>{X.classList.remove("ui-state-active"),X.style.backgroundColor="",X.style.border=""}),z.style.backgroundColor="var(--cobalt30a)",z.style.border="",Y){if(q.preventDefault(),q.stopPropagation(),Y.classList.contains("stmb-sp-action-edit"))await EG(Q,K);else if(Y.classList.contains("stmb-sp-action-duplicate"))try{let X=await RZ(K);toastr.success(N("SidePrompt duplicated","STMemoryBooks_SidePromptDuplicated"),N("STMemoryBooks","index.toast.title")),await K1(Q,X)}catch(X){console.error("STMemoryBooks: Error duplicating side prompt:",X),toastr.error(N("Failed to duplicate SidePrompt","STMemoryBooks_FailedToDuplicateSidePrompt"),N("STMemoryBooks","index.toast.title"))}else if(Y.classList.contains("stmb-sp-action-delete")){if(await new y8(`<h3>${R(e0("STMemoryBooks_DeleteSidePromptTitle","Delete Side Prompt",{name:K}))}</h3><p>${R(e0("STMemoryBooks_DeleteSidePromptConfirm","Are you sure you want to delete this template?",{name:K}))}</p>`,E1.CONFIRM,"",{okButton:N("Delete","STMemoryBooks_Delete"),cancelButton:N("Cancel","STMemoryBooks_Cancel")}).show()===j1.AFFIRMATIVE)try{await _Z(K),toastr.success(N("SidePrompt deleted","STMemoryBooks_SidePromptDeleted"),N("STMemoryBooks","index.toast.title")),await K1(Q)}catch(F){console.error("STMemoryBooks: Error deleting side prompt:",F),toastr.error(N("Failed to delete SidePrompt","STMemoryBooks_FailedToDeleteSidePrompt"),N("STMemoryBooks","index.toast.title"))}}return}})})(),await K1(Q),await Q.show();try{b5(Q)}catch(J){}}catch(Z){console.error("STMemoryBooks: Error showing Side Prompts:",Z),toastr.error(N("Failed to open Side Prompts","STMemoryBooks_FailedToOpenSidePrompts"),N("STMemoryBooks","index.toast.title"))}}S8();b0();import{translate as fZ}from"../../../i18n.js";function k5(){return{arc_default:fZ(`You are an expert narrative analyst and memory-engine assistant.
Your task is to take multiple scene summaries (of varying detail and formatting), normalize them, reconstruct the full chronology, identify self-contained story arcs, and output each arc as a single memory entry in JSON.

Each arc must be token-efficient, plot-accurate, and compatible with long-running RP memory systems such as STMB.

You will receive input in this exact format:
- An optional PREVIOUS ARC block, which is canon and must not be rewritten.
- A MEMORIES block containing entries formatted as:
  [ID] | ORDER
  Full text of the memory (may span multiple paragraphs)

Strict output format (JSON only; no markdown, no prose outside JSON):
{
  "arcs": [
    {
      "title": "Short descriptive arc title (3–6 words)",
      "summary": "Structured arc summary as a single string (see Summary Content Structure below).",
      "keywords": ["keyword1", "keyword2", "..."],
      "member_ids": ["<ID from MEMORIES>", "..."]  // optional: IDs of memories that belong to this arc
    }
  ],
  "unassigned_memories": [
    { "id": "memory-id", "reason": "Brief explanation of why this memory does not fit the produced arcs." }
  ]
}

Arc count rule:
- Do not force a number of arcs. Produce the smallest coherent number of arcs based on content (often 1–3, possibly 1 if all memories form one arc).
- Respect chronology using ORDER (ascending).
- If some memories do not fit the produced arcs, place them in unassigned_memories with a short reason.

Do not repeat text from PREVIOUS ARC. Treat it as canon; continue consequences only if relevant in the new memories.

PROCESS

STEP 1 — UNIFIED STORY (internal only)
- Combine ALL memories into a single chronological retelling.
- Ignore OOC/meta content.
- Preserve plot-relevant events, character choices, emotional shifts, decisions, consequences, conflicts, promises, boundary negotiations.
- Exclude flavor-only content unless it affects future behavior.
- Normalize to past-tense, third-person.
- Focus on cause → intention → reaction → consequence chains.
- Do NOT output this unified story.

STEP 2 — IDENTIFY STORY ARCS
- From the unified story, extract arcs that begin when a meaningful shift occurs in:
  relationship dynamics; emotional vulnerability; intimacy or distance; conflict/reconciliation; routine/ritual changes; boundaries/negotiations; logistical shifts (travel, location, communication); any event with lasting consequences.
- Ensure each arc is self-contained and represents a significant movement.

STEP 3 — ARC OBJECTS (fill arcs[] in JSON)
For each arc, fill fields as follows:

title:
- 3–6 words, descriptive of the arc’s core.

summary:
- The entire “Summary Content Structure” below must appear inside this single string (use headings and bullets as plain text).
- Keep total length 5–15% of the combined text for the arc’s memories.
- Do not include OOC/meta or filler.

Summary Content Structure (must be followed inside summary string):

# [Arc Title]
Time period: What timeframe the arc covers (e.g. "March 3–10, 2024", "Week of July 15, 2023")

Arc Premise: One sentence describing what this arc is about.

## Major Beats
- 3–7 bullets capturing the major plot movements of this arc
- Focus on cause → effect logic
- Include only plot-affecting events

## Character Dynamics
- 1–2 paragraphs describing how the characters’ emotions, motives, boundaries, or relationship changed
- Include subtext, tension shifts, power exchange changes, new trust/vulnerabilities, or new conflicts
- Include silent implications if relevant

## Key Exchanges
- Up to 8 short, exact quotes
- Only include dialogue that materially shifted tone, emotion, or relationship dynamics

## Outcome & Continuity
- 4–8 bullets capturing:
  - decisions
  - promises
  - new emotional states
  - new routines/rituals
  - injuries or physical changes
  - foreshadowed future events
  - unresolved threads
  - permanent consequences

STEP 4 — KEYWORDS
- Provide 15–30 standalone retrieval keywords in keywords[] per arc.

MUST:
- Concrete nouns, physical objects, places, proper nouns, distinctive actions, or memorable scene elements
- Each keyword = ONE concept only
- Each keyword must be retrievable if mentioned ALONE
- Use ONLY nouns or noun-phrases

MUST NOT:
- No narrative/summary keywords (“start of affair”, “argument resolved”)
- No emotional/abstract words (intimacy, vulnerability, trust, jealousy, dominance, submission, aftercare, connection, longing, etc.)
- No multi-fact keywords (“Denver airport Lyft ride and call”)
- No themes or vibes

Examples of valid keywords:
- Four Seasons bar
- Macallan 25
- private elevator
- Aston Martin
- CPAP machine
- Gramercy Tavern
- yuzu soda
- satellite map
- Life360 app
- marble desk
- “pack for forever”
- “dick-measuring contest”

Classification of non-fitting memories:
- If a memory obviously belongs to a later arc, is unrelated, flavor-only with no continuity impact, duplicates, or conflicts with PREVIOUS ARC chronology, put it in unassigned_memories with a short reason.

JSON-only:
- Return only the JSON object described above.
- No markdown fences, no commentary, no system prompts, no extra text.`,"STMemoryBooks_ArcPrompt_Default"),arc_alternate:fZ(`You are an expert narrative analyst and memory-engine assistant.
Your task is to take multiple scene summaries (of varying detail and formatting), normalize them, reconstruct the full chronology, and output a single memory arc entry in JSON. The arc must be token-efficient and plot-accurate.

You will receive input in this exact format:
- An optional PREVIOUS ARC block, which is canon and must not be rewritten.
- A MEMORIES block containing entries formatted as:
  [ID] | ORDER
  Full text of the memory (may span multiple paragraphs)

Strict output format (JSON only; no markdown, no prose outside JSON):
{
  "arcs": [
    {
      "title": "Short descriptive arc title (3–6 words)",
      "summary": "Structured arc summary as a single string (see Summary Content Structure below).",
      "keywords": ["keyword1", "keyword2", "..."],
      "member_ids": ["<ID from MEMORIES>", "..."]  // optional: IDs of memories that belong to this arc
    }
  ],
  "unassigned_memories": [
    { "id": "memory-id", "reason": "Brief explanation of why this memory does not fit the produced arcs." }
  ]
}

Notes:
- Respect chronology using ORDER (ascending).
- If some memories do not fit the arc, place them in unassigned_memories with a short reason.

Do not repeat text from PREVIOUS ARC. Treat it as canon; continue consequences only if relevant in the new memories.

PROCESS

STEP 1 — UNIFIED STORY (internal only)
- Combine ALL memories into a single chronological retelling.
- Ignore OOC/meta content.
- Preserve plot-relevant events, character choices, emotional shifts, decisions, consequences, conflicts, promises, boundary negotiations.
- Exclude flavor-only content unless it affects future behavior.
- Normalize to past-tense, third-person.
- Focus on cause → intention → reaction → consequence chains.
- Do NOT output this unified story.

STEP 2 — IDENTIFY STORY ARCS
- From the unified story, identify a self-contained arc that represents a significant narrative movement.

STEP 3 — ARC OBJECTS (fill arcs[] in JSON)
For the story arc, fill fields as follows:

title:
- 3–6 words, descriptive of the arc’s core.

summary:
- The entire “Summary Content Structure” below must appear inside this single string (use headings and bullets as plain text).
- Keep total length 5–15% of the combined text for the arc’s memories.
- Do not include OOC/meta or filler.

Summary Content Structure (must be followed inside summary string):

# [Arc Title]
Time period: What timeframe the arc covers (e.g. "March 3–10, 2024", "Week of July 15, 2023")

Arc Premise: One sentence describing what this arc is about.

## Major Beats
- 3–7 bullets capturing the major plot movements of this arc
- Focus on cause → effect logic
- Include only plot-affecting events

## Character Dynamics
- 1–2 paragraphs describing how the characters’ emotions, motives, boundaries, or relationship changed
- Include subtext, tension shifts, power exchange changes, new trust/vulnerabilities, or new conflicts
- Include silent implications if relevant

## Key Exchanges
- Up to 8 short, exact quotes
- Only include dialogue that materially shifted tone, emotion, or relationship dynamics

## Outcome & Continuity
- 4–8 bullets capturing:
  - decisions
  - promises
  - new emotional states
  - new routines/rituals
  - injuries or physical changes
  - foreshadowed future events
  - unresolved threads
  - permanent consequences

STEP 4 — KEYWORDS
- Provide 15–30 standalone retrieval keywords in keywords[] per arc.

MUST:
- Concrete nouns, physical objects, places, proper nouns, distinctive actions, or memorable scene elements
- Each keyword = ONE concept only
- Each keyword must be retrievable if mentioned ALONE
- Use ONLY nouns or noun-phrases

MUST NOT:
- No narrative/summary keywords (“start of affair”, “argument resolved”)
- No emotional/abstract words (intimacy, vulnerability, trust, jealousy, dominance, submission, aftercare, connection, longing, etc.)
- No multi-fact keywords (“Denver airport Lyft ride and call”)
- No themes or vibes

Examples of valid keywords:
- Four Seasons bar
- Macallan 25
- private elevator
- Aston Martin
- CPAP machine
- Gramercy Tavern
- yuzu soda
- satellite map
- Life360 app
- marble desk
- “pack for forever”
- “dick-measuring contest”

Classification of non-fitting memories:
- If a memory obviously belongs to a later arc, is unrelated, flavor-only with no continuity impact, duplicates, or conflicts with PREVIOUS ARC chronology, put it in unassigned_memories with a short reason.

JSON-only:
- Return only the JSON object described above.
- No markdown fences, no commentary, no system prompts, no extra text.`,"STMemoryBooks_ArcPrompt_Alternate"),arc_tiny:fZ(`You specialize in compressing many small memories into compact, coherent story arcs. Combine the memories below — and the previous arc if provided — into a single arc that captures the main narrative through-lines.

Return JSON only:
{ "arcs": [ { "title": "...", "summary": "...", "keywords": ["..."], "member_ids": ["<ID>", "..."] } ], "unassigned_memories": [ { "id": "...", "reason": "..." } ] }

Rules:
- 5–15% length compression
- Focus on plot, emotional progression, decisions, conflicts, continuity
- Identify non-fitting items in unassigned_memories with a brief reason
- No quotes, no OOC, no commentary outside JSON`,"STMemoryBooks_ArcPrompt_Tiny")}}function F1(){return k5()}function f8(){return k5().arc_default}D1();import{getRequestHeaders as kZ}from"../../../../script.js";import{translate as g5}from"../../../i18n.js";var k8="STMemoryBooks-ArcAnalysisPromptManager",gZ=s1.ARC_PROMPTS_FILE,g8={arc_default:"Multi-Arc Analysis",arc_alternate:"Single Arc"},b1=null;function kG(Z){return String(Z||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)}function U1(Z){return String(Z||"").replace(/\w\S*/g,(Q)=>{return Q.charAt(0).toUpperCase()+Q.slice(1).toLowerCase()})}function u8(Z){let Q=String(Z||"").split(`
`).filter((G)=>G.trim());if(Q.length>0){let J=Q[0].trim().replace(/^(You are|Analyze|Create|Generate|Write)\s+/i,"").replace(/[:.]/g,"").trim();return U1(J.substring(0,50))}return"Arc Prompt"}function u5(Z,Q){let G=F1()||{},J=Q||{},W=kG(Z||"arc-prompt"),q=W,Y=2;while(q in J||q in G)q=`${W}-${Y++}`;return q}function m5(Z){if(!Z||typeof Z!=="object")return!1;if(typeof Z.version!=="number")return!1;if(!Z.overrides||typeof Z.overrides!=="object")return!1;for(let[Q,G]of Object.entries(Z.overrides)){if(!G||typeof G!=="object")return!1;if(typeof G.prompt!=="string"||!G.prompt.trim())return!1;if(G.displayName!==void 0&&typeof G.displayName!=="string")return!1}return!0}async function u0(Z=null){if(b1)return b1;let Q=!1,G=null;try{let J=await fetch(`/user/files/${gZ}`,{method:"GET",credentials:"include",headers:kZ()});if(!J.ok)Q=!0;else{let W=await J.text();if(G=JSON.parse(W),!m5(G))Q=!0}}catch{Q=!0}if(Q){let J={},W=new Date().toISOString(),q=F1()||{};for(let[Y,z]of Object.entries(q)){let K;if(g8[Y])K=g5(g8[Y])||U1(Y.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||u8(z);else K=U1(Y.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||u8(z);J[Y]={displayName:K,prompt:z,createdAt:W}}G={version:s0.CURRENT_VERSION,overrides:J},await y1(G)}return b1=G,b1}async function y1(Z){let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:kZ(),body:JSON.stringify({name:gZ,data:G})});if(!J.ok){let W=g5("Failed to save arc prompts","STMemoryBooks_ArcPromptManager_SaveFailed");throw Error(`${W}: ${J.statusText}`)}b1=Z,console.log(`${k8}: Arc prompts saved`)}async function uZ(Z){return await u0(Z),!0}async function R6(Z=null){let Q=await u0(Z),G=[];for(let[W,q]of Object.entries(Q.overrides))G.push({key:W,displayName:q.displayName||U1(W),createdAt:q.createdAt||null});let J=F1()||{};for(let W of Object.keys(J))if(!(W in Q.overrides))G.push({key:W,displayName:g8[W]||U1(W.replace(/^arc[_-]?/,"").replace(/[_-]/g," ")),createdAt:null});return G.sort((W,q)=>{if(!W.createdAt)return 1;if(!q.createdAt)return-1;return new Date(q.createdAt)-new Date(W.createdAt)}),G}async function _6(Z,Q=null){let G=await u0(Q);if(G.overrides[Z]&&typeof G.overrides[Z].prompt==="string"&&G.overrides[Z].prompt.trim())return G.overrides[Z].prompt;return F1()[Z]||f8()}async function mZ(Z,Q=null){let G=await u0(Q);if(G.overrides[Z]&&G.overrides[Z].displayName)return G.overrides[Z].displayName;return g8[Z]||U1(String(Z||"").replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||"Arc Prompt"}async function d5(Z,Q=null){let G=await u0(Q),J=F1()||{};return!!(G.overrides[Z]||J[Z])}async function dZ(Z,Q,G){let J=await u0(),W=new Date().toISOString(),q=Z;if(!q)q=u5(G||u8(Q),J.overrides);if(J.overrides[q])J.overrides[q].prompt=Q,J.overrides[q].displayName=G||J.overrides[q].displayName,J.overrides[q].updatedAt=W;else J.overrides[q]={displayName:G||u8(Q),prompt:Q,createdAt:W};return await y1(J),q}async function c5(Z){let Q=await u0(),G=Q.overrides[Z];if(!G)throw Error(`Arc preset "${Z}" not found`);let J=`${G.displayName||U1(Z)} (Copy)`,W=u5(J,Q.overrides),q=new Date().toISOString();return Q.overrides[W]={displayName:J,prompt:G.prompt,createdAt:q},await y1(Q),W}async function p5(Z){let Q=await u0();if(!Q.overrides[Z])throw Error(`Arc preset "${Z}" not found`);delete Q.overrides[Z],await y1(Q)}async function i5(){let Z=await u0();return JSON.stringify(Z,null,2)}async function l5(Z){let Q=JSON.parse(Z);if(!m5(Q))throw Error("Invalid arc prompts file structure.");await y1(Q)}async function o5(Z="overwrite"){if(Z!=="overwrite")console.warn(`${k8}: Unsupported mode "${Z}", defaulting to overwrite`);let Q=await u0(),G=F1()||{},J=Object.keys(G),W=0;if(Q&&Q.overrides&&typeof Q.overrides==="object"){for(let q of J)if(q in Q.overrides)delete Q.overrides[q],W++}return await y1(Q),b1=Q,console.log(`${k8}: Recreated arc built-ins (removed ${W} overrides)`),{removed:W}}async function n5(Z={}){let Q=Z.backup!==!1,G=F1()||{},J=new Date().toISOString(),W={};for(let[z,K]of Object.entries(G))W[z]={displayName:g8[z]||U1(z.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||u8(K),prompt:K,createdAt:J};let q;try{let z=await u0();if(Q&&z){let K=String(gZ||"stmb-arc-prompts.json").replace(/\.json$/i,""),X=J.replace(/[:.]/g,"-");q=`${K}.backup-${X}.json`;let V=JSON.stringify(z,null,2),F=btoa(unescape(encodeURIComponent(V))),j=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:kZ(),body:JSON.stringify({name:q,data:F})});if(!j.ok)console.warn(`${k8}: Failed to write backup "${q}": ${j.statusText}`)}}catch(z){console.warn(`${k8}: Backup step failed:`,z)}let Y={version:s0.CURRENT_VERSION,overrides:W};await y1(Y),b1=Y;try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch{}return{count:Object.keys(W).length,backupName:q}}import{extension_settings as e5}from"../../../extensions.js";import{translate as I6}from"../../../i18n.js";var gG=`Based on this narrative arc summary, generate 15–30 standalone topical keywords that function as retrieval tags, not micro-summaries.
Keywords must be:
- Concrete and scene-specific (locations, objects, proper nouns, unique actions, repeated motifs).
- One concept per keyword — do NOT combine multiple ideas into one keyword.
- Useful for retrieval if the user later mentions that noun or action alone, not only in a specific context.
- Not {{char}}'s or {{user}}'s names.
- Not thematic, emotional, or abstract. Stop-list: intimacy, vulnerability, trust, dominance, submission, power dynamics, boundaries, jealousy, aftercare, longing, consent, emotional connection.

Avoid:
- Overly specific compound keywords (“David Tokyo marriage”).
- Narrative or plot-summary style keywords (“art dealer date fail”).
- Keywords that contain multiple facts or descriptors.
- Keywords that only make sense when the whole scene is remembered.

Prefer:
- Proper nouns (e.g., "Chinatown", "Ritz-Carlton bar").
- Specific physical objects ("CPAP machine", "chocolate chip cookies").
- Distinctive actions ("cookie baking", "piano apology").
- Unique phrases or identifiers from the scene used by characters ("pack for forever", "dick-measuring contest").

Your goal: keywords should fire when the noun/action is mentioned alone, not only when paired with a specific person or backstory.

Return ONLY a JSON array of 15-30 strings. No commentary, no explanations.`;function Z7(Z){return String(Z||"").replace(/\r\n/g,`
`).replace(/^\uFEFF/,"").replace(/[\u200B-\u200D\u2060]/g,"")}function Q7(Z){let Q=/```([\w+-]*)\s*([\s\S]*?)```/g,G=[],J;while((J=Q.exec(Z))!==null)G.push((J[2]||"").trim());return G}function uG(Z){let Q=String(Z||"").trim();if(!/'\s*\+\s*'/.test(Q)&&!/\\n'\s*\+/.test(Q))return null;Q=Q.replace(/^\s*content\s*:\s*/,"");let G=/'((?:\\.|[^'\\])*)'/g,J=[],W;while((W=G.exec(Q))!==null)J.push(W[1]);if(!J.length)return null;let q=J.join("");return q=q.replace(/\\r\\n/g,`
`).replace(/\\n/g,`
`).replace(/\\t/g,"\t").replace(/\\"/g,'"').replace(/\\\\/g,"\\"),q.trim()||null}function G7(Z){let Q=Z.search(/[\{\[]/);if(Q===-1)return null;let G=Z[Q],J=G==="{"?"}":"]",W=0,q=!1,Y=!1;for(let z=Q;z<Z.length;z++){let K=Z[z];if(q){if(Y)Y=!1;else if(K==="\\")Y=!0;else if(K==='"')q=!1;continue}if(K==='"'){q=!0;continue}if(K===G)W++;else if(K===J){if(W--,W===0)return Z.slice(Q,z+1).trim()}}return null}function $7(Z){let Q="",G=!1,J=!1,W=!1,q=!1;for(let Y=0;Y<Z.length;Y++){let z=Z[Y],K=Z[Y+1];if(G){if(Q+=z,J)J=!1;else if(z==="\\")J=!0;else if(z==='"')G=!1;continue}if(W){if(z===`
`)W=!1,Q+=z;continue}if(q){if(z==="*"&&K==="/")q=!1,Y++;continue}if(z==='"'){G=!0,Q+=z;continue}if(z==="/"&&K==="/"){W=!0,Y++;continue}if(z==="/"&&K==="*"){q=!0,Y++;continue}Q+=z}return Q}function J7(Z){let Q="",G=!1,J=!1;for(let W=0;W<Z.length;W++){let q=Z[W];if(G){if(Q+=q,J)J=!1;else if(q==="\\")J=!0;else if(q==='"')G=!1;continue}if(q==='"'){G=!0,Q+=q;continue}if(q===","){let Y=W+1;while(Y<Z.length&&/\s/.test(Z[Y]))Y++;if(Z[Y]==="}"||Z[Y]==="]")continue}Q+=q}return Q}function r5(Z){let Q=[],G=new Set;for(let J of Z||[]){let W=String(J||"").trim();if(W=W.replace(/^["']|["']$/g,""),W=W.replace(/^\d+\.\s*/,""),W=W.replace(/^[\-\*\u2022]\s*/,""),W=W.trim(),!W)continue;let q=W.toLowerCase();if(G.has(q))continue;if(G.add(q),Q.push(W),Q.length>=30)break}return Q}function a5(Z){let Q=Z7(String(Z||"").trim()),G=[],J=Q7(Q);if(J.length)G.push(...J);let W=G7(Q);if(W)G.push(W);G.push(Q);let q=Array.from(new Set(G));for(let K of q)try{let X=J7($7(K)),V=JSON.parse(X),F=Array.isArray(V)?V:V&&Array.isArray(V.keywords)?V.keywords:null;if(F)return r5(F)}catch{}let Y=Q.split(/\r?\n/).map((K)=>K.trim()).filter(Boolean),z=[];if(Y.length>1)z=Y.map((K)=>K.replace(/^[\-\*\u2022]?\s*\d*\.?\s*/,"").trim());else z=Q.split(/[,;]+/).map((K)=>K.trim());return r5(z)}async function mG(Z,Q){let G=String(Z||"").trim(),J=`${gG}

=== ARC SUMMARY ===
${G}
=== END SUMMARY ===`,{text:W}=await h1({model:Q.model,prompt:J,temperature:typeof Q.temperature==="number"?Q.temperature:0.2,api:Q.api,endpoint:Q.endpoint,apiKey:Q.apiKey,extra});try{console.debug("STMB ArcAnalysis: keyword gen response length=%d",(W||"").length)}catch{}let q=[];try{q=a5(W)}catch{}if(!Array.isArray(q)||q.length===0){let Y=`${J}

Return ONLY a JSON array of 15-30 strings.`,z=await h1({model:Q.model,prompt:Y,temperature:typeof Q.temperature==="number"?Q.temperature:0.2,api:Q.api,endpoint:Q.endpoint,apiKey:Q.apiKey,extra});q=a5(z.text)}if(q.length>30)q=q.slice(0,30);return q}function dG(Z){let Q=[];for(let G of Z){if(!G||typeof G!=="object")continue;let J=String(G.uid??""),W=cG(G.comment??"")??0,q=String(G.content??"").trim(),Y=(G.comment||"Untitled").toString().trim();Q.push({id:J,order:W,content:q,title:Y})}return Q.sort((G,J)=>G.order-J.order),Q}function cG(Z){if(!Z)return null;let Q=Z.match(/\[(\d+)\]/);if(Q)return parseInt(Q[1],10);let G=Z.match(/^(\d+)[\s-]/);if(G)return parseInt(G[1],10);return null}function t5({briefs:Z,previousArcSummary:Q=null,previousArcOrder:G=null,promptText:J=null}){let W=J||f8(),q=[];if(Q){if(q.push("=== PREVIOUS ARC (CANON — DO NOT REWRITE, DO NOT INCLUDE IN YOUR NEW SUMMARY) ==="),typeof G<"u"&&G!==null)q.push(`Arc ${G}`);q.push(Q.trim()),q.push("=== END PREVIOUS ARC ==="),q.push("")}return q.push("=== MEMORIES ==="),Z.forEach((Y,z)=>{let K=String(z+1).padStart(3,"0"),X=(Y.title||"").toString().trim(),V=(Y.content||"").toString().trim();q.push(`=== Memory ${K} ===`),q.push(`Title: ${X}`),q.push(`Contents: ${V}`),q.push(`=== end Memory ${K} ===`),q.push("")}),q.push("=== END MEMORIES ==="),q.push(""),`${W}

${q.join(`
`)}`}function m8(Z){if(!Z||typeof Z!=="string")throw Error(I6("Empty AI response","STMemoryBooks_ArcAnalysis_EmptyResponse"));let Q=Z7(Z.trim().replace(/<think>[\s\S]*?<\/think>/gi,"")),G=[],J=uG(Q);if(J)G.push(J);let W=Q7(Q);if(W.length)G.push(...W);G.push(Q);let q=G7(Q);if(q)G.push(q);let Y=Array.from(new Set(G));for(let z of Y)try{let K=z;K=$7(K),K=J7(K);let X=JSON.parse(K);if(!X||typeof X!=="object")continue;if(!("arcs"in X)||!("unassigned_memories"in X))continue;let V=Array.isArray(X.arcs)?X.arcs:[],F=Array.isArray(X.unassigned_memories)?X.unassigned_memories:[],j=V.filter((H)=>H&&typeof H.title==="string"&&H.title.trim()&&typeof H.summary==="string"&&H.summary.trim()),O=F.filter((H)=>H&&typeof H.id==="string"&&H.id.trim()&&typeof H.reason==="string");return{arcs:j,unassigned_memories:O}}catch{}throw Error(I6("Model did not return valid arc JSON","STMemoryBooks_ArcAnalysis_InvalidJSON"))}async function W7(Z,Q={},G=null){let{presetKey:J="arc_default",maxItemsPerPass:W=12,maxPasses:q=10,minAssigned:Y=2,tokenTarget:z}=Q,K=Q?.extra??{},X=J==="arc_alternate",V=Object.prototype.hasOwnProperty.call(Q,"maxPasses")?q:X?1:q,F=e5?.STMemoryBooks?.moduleSettings?.tokenWarningThreshold,j=typeof z==="number"?z:typeof F==="number"?F:30000,O=j,H=Z.map((y)=>y&&y.entry?y.entry:y).filter(Boolean),A=dG(H),B=new Map(A.map((y)=>[y.id,y])),D=[],T="",L="",P=null;try{if(J&&await d5(J))P=await _6(J)}catch{}if(!P)P=f8();let x=q7(G),w=null,_=null,h=0,u=[];while(B.size>0&&h<V){h++,O=j;let y=Array.from(B.values()).sort((g,l)=>g.order-l.order),C=[];for(let g of u)if(B.has(g.id)&&C.length<W)C.push(g);for(let g of y){if(C.length>=W)break;if(!C.find((l)=>l.id===g.id))C.push(g)}if(C.length===0)break;try{console.debug("STMB ArcAnalysis: pass %d batch=%o",h,C.map((g)=>g.id))}catch{}let d=t5({briefs:C,previousArcSummary:w,previousArcOrder:_,promptText:P}),F0=await $1(d,{estimatedOutput:500}),m0=C.length,h0=!1;while(F0.total>O&&C.length>1)C.pop(),h0=!0,d=t5({briefs:C,previousArcSummary:w,previousArcOrder:_,promptText:P}),F0=await $1(d,{estimatedOutput:500});if(h0)try{console.debug("STMB ArcAnalysis: trimmed batch from %d to %d (est=%d, budget=%d)",m0,C.length,F0.total,O)}catch{}if(F0.total>O&&C.length===1){let g=O;O=F0.total;try{console.debug("STMB ArcAnalysis: raised budget for single item from %d to %d (est=%d)",g,O,F0.total)}catch{}}let{text:D0}=await h1({model:x.model,prompt:d,temperature:x.temperature??0.2,api:x.api,endpoint:x.endpoint,apiKey:x.apiKey,extra:K});T=String(D0??""),L="";let X0;try{X0=m8(D0)}catch(g){let l=`${d}

Return ONLY the JSON object, nothing else. Ensure arrays and commas are valid.`,G0=await h1({model:x.model,prompt:l,temperature:x.temperature??0.2,api:x.api,endpoint:x.endpoint,apiKey:x.apiKey,extra:K});L=String(G0?.text??"");try{X0=m8(G0.text)}catch(R0){let _0=Error(String(R0?.message||g?.message||"Model did not return valid arc JSON"));throw _0.name="ArcAIResponseError",_0.code="ARC_INVALID_JSON",_0.rawText=String(D0??""),_0.retryRawText=String(G0?.text??""),_0.prompt=d,_0.repairPrompt=l,_0}}let T0=new Map;C.forEach((g,l)=>{let G0=String(g.id);T0.set(G0,G0);let R0=String(l+1).padStart(3,"0");T0.set(R0,G0),T0.set(String(l+1),G0)});let A1=(g)=>T0.get(String(g).trim()),U0=new Set;if(Array.isArray(X0.unassigned_memories))X0.unassigned_memories.forEach((g)=>{let l=A1(g.id);if(l)U0.add(l)});let o0=C.filter((g)=>!U0.has(g.id));try{console.debug("STMB ArcAnalysis: pass %d arcs=%d unassigned=%d assigned=%d",h,Array.isArray(X0.arcs)?X0.arcs.length:0,U0.size,o0.length)}catch{}if(o0.length<Y&&h>1)break;let T8=Array.isArray(X0.arcs)?X0.arcs:[],n0=new Set,x6=0;for(let g=0;g<T8.length;g++){let l=T8[g];if(!l||typeof l.title!=="string"||typeof l.summary!=="string")continue;let G0=null;if(Array.isArray(l.member_ids))G0=l.member_ids.map(A1).filter((R0)=>R0!==void 0);if(G0&&G0.length>0);else G0=o0.map((R0)=>R0.id);if(G0.length===0)continue;D.push({order:h*10+g,title:l.title,summary:l.summary,keywords:Array.isArray(l.keywords)?l.keywords:[],memberIds:G0}),G0.forEach((R0)=>n0.add(String(R0))),x6++,w=l.summary}if(D.length>0)_=D[D.length-1].order;else _=null;if(n0.size>0){for(let g of n0)B.delete(String(g));if(B.size===0&&D.length===1)try{console.info("STMB ArcAnalysis: all memories were consumed into a single arc.")}catch{}}else{try{console.debug("STMB ArcAnalysis: no new IDs consumed on pass %d; stopping.",h)}catch{}break}u=C.filter((g)=>U0.has(g.id));try{console.debug("STMB ArcAnalysis: pass %d consumed=%d remaining=%d",h,n0.size,B.size)}catch{}}let e=Array.from(B.values()).map((y)=>y.id);return{arcCandidates:D,leftovers:e,rawText:String(T??""),retryRawText:String(L??"")}}function q7(Z){if(Z&&Z.api&&Z.model)return Z;if(Z&&(Z.effectiveConnection||Z.connection)){let J=Z.effectiveConnection||Z.connection;return{api:q0(J.api||o().completionSource||"openai"),model:J.model||Q0().model||"",temperature:typeof J.temperature==="number"?J.temperature:Q0().temperature??0.2,endpoint:J.endpoint,apiKey:J.apiKey}}let Q=o(),G=Q0();return{api:q0(Q.completionSource||"openai"),model:G.model||"",temperature:G.temperature??0.2}}function pG(Z){if(!Z||typeof Z!=="string")return null;let Q=Z.match(/\[ARC\s+(\d+)\]/i);if(Q)return parseInt(Q[1],10);if(Q=Z.match(/\[ARC\s+\[(\d+)\]\]/i),Q)return parseInt(Q[1],10);return null}function iG(Z){let Q=Object.values(Z?.entries||{}),G=0;for(let J of Q)if(J&&J.stmbArc===!0&&typeof J.comment==="string"){let W=pG(J.comment);if(typeof W==="number"&&W>G)G=W}return G+1}function lG(Z,Q,G){let J=String(Q||"").trim(),W=String(Z||"").trim()||"[ARC 000] - {{title}}";W=W.replace(/\{\{\s*title\s*\}\}/g,J);let q=W.match(/\[([^\]]*?)(0{2,})([^\]]*?)\]/);if(q){let z=q[2].length,K=String(G).padStart(z,"0"),X=`[${q[1]}${K}${q[3]}]`;return W.replace(q[0],X)}return`[ARC ${String(G).padStart(3,"0")}] ${J}`}async function cZ({lorebookName:Z,lorebookData:Q,arcCandidates:G,disableOriginals:J=!1}){if(!Z||!Q)throw Error(I6("Missing lorebookName or lorebookData","STMemoryBooks_ArcAnalysis_MissingLorebookData"));let W=[],q=e5?.STMemoryBooks?.arcTitleFormat||"[ARC 000] - {{title}}",Y=iG(Q);try{console.info("STMB ArcAnalysis: committing %d arc(s): %o",G.length,G.map((z)=>z.title))}catch{}for(let z of G){let K=lG(q,z.title,Y++),X=z.summary,V=Array.isArray(z.keywords)?z.keywords:[];if(V.length===0)try{let B=q7(null);V=await mG(X,B)}catch(B){try{console.warn('STMB ArcAnalysis: keyword generation failed for "%s": %s',K,String(B?.message||B))}catch{}}let F={vectorized:!0,selective:!0,order:100,position:0},j={stmemorybooks:!0,stmbArc:!0,type:"arc",key:Array.isArray(V)?V:[],disable:!1},O=await M8(Z,Q,[{title:K,content:X,defaults:F,entryOverrides:j}],{refreshEditor:!1}),H=O&&O[0],A=H?H.uid:null;if(!A)throw Error(I6("Arc upsert returned no entry (commitArcs failed)","STMemoryBooks_ArcAnalysis_UpsertFailed"));if(J&&A){let B=new Set(z.memberIds.map(String)),D=Object.values(Q.entries||{});for(let T of D)if(B.has(String(T.uid)))T.disable=!0,T.disabledByArcId=A}W.push({arcEntryId:A,title:K})}await M8(Z,Q,[],{refreshEditor:!0});try{console.info("STMB ArcAnalysis: committed arc IDs: %o",W.map((z)=>z.arcEntryId))}catch{}return{results:W}}import{Handlebars as oG}from"../../../../lib.js";var pZ=oG.compile(`
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th data-i18n="STMemoryBooks_PromptManager_DisplayName">Display Name</th>
    </tr>
  </thead>
  <tbody>
    {{#if items}}
      {{#each items}}
        <tr data-preset-key="{{key}}" style="cursor: pointer; border-bottom: 1px solid var(--SmartThemeBorderColor);">
          <td style="padding: 8px;">
            <span class="stmb-preset-name">{{displayName}}</span>
            <span class="stmb-inline-actions" style="float: right; display: inline-flex; gap: 10px;">
              <button class="stmb-action stmb-action-edit" title="Edit" aria-label="Edit" data-i18n="[title]STMemoryBooks_Edit;[aria-label]STMemoryBooks_Edit" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="stmb-action stmb-action-duplicate" title="Duplicate" aria-label="Duplicate" data-i18n="[title]STMemoryBooks_Duplicate;[aria-label]STMemoryBooks_Duplicate" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="stmb-action stmb-action-delete" title="Delete" aria-label="Delete" data-i18n="[title]STMemoryBooks_Delete;[aria-label]STMemoryBooks_Delete" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </span>
          </td>
        </tr>
      {{/each}}
    {{else}}
      <tr>
        <td>
          <div class="opacity50p" data-i18n="STMemoryBooks_PromptManager_NoPresets">No presets available</div>
        </td>
      </tr>
    {{/if}}
  </tbody>
</table>
`);import{t as S,translate as U,applyLocale as D8,addLocaleData as lZ,getCurrentLocale as G$}from"../../../i18n.js";async function Y7(Z){let G={zh:"zh-cn",zh_cn:"zh-cn",zh_tw:"zh-tw","zh.tw":"zh-tw","zh-cn":"zh-cn","zh-tw":"zh-tw","zh-CN":"zh-cn","zh-TW":"zh-tw",ja:"ja-jp",ja_jp:"ja-jp","ja-JP":"ja-jp","ja-jp":"ja-jp",ru:"ru-ru",ru_ru:"ru-ru","ru-RU":"ru-ru","ru-ru":"ru-ru",es:"es-es","es-es":"es-es",de:"de-de",de_de:"de-de","de-DE":"de-de","de-de":"de-de",fr:"fr-fr",fr_fr:"fr-fr","fr-FR":"fr-fr","fr-fr":"fr-fr",ko:"ko-kr",ko_kr:"ko-kr","ko-KR":"ko-kr","ko-kr":"ko-kr",ms:"ms-my",ms_my:"ms-my","ms-MY":"ms-my","ms-my":"ms-my",id:"id-id",id_id:"id-id","id-ID":"id-id","id-id":"id-id",en:"en",en_us:"en","en-US":"en","en-us":"en",en_gb:"en","en-GB":"en","en-gb":"en"}[Z]||Z,W={"zh-cn":"./locales/zh-cn.json","zh-tw":"./locales/zh-tw.json","ja-jp":"./locales/ja-jp.json","ru-ru":"./locales/ru-ru.json","es-es":"./locales/es-es.json","de-de":"./locales/de-de.json","fr-fr":"./locales/fr-fr.json","ko-kr":"./locales/ko-kr.json","ms-my":"./locales/ms-my.json","id-id":"./locales/id-id.json"}[G];if(!W)return null;try{let q=await fetch(new URL(W,import.meta.url));if(!q.ok)return null;return await q.json()}catch(q){return console.warn("STMemoryBooks: Failed to load locale JSON for",G,q),null}}var nG={STMemoryBooks_Settings:"\uD83D\uDCD5 Memory Books Settings",STMemoryBooks_CurrentScene:"Current Scene:",STMemoryBooks_Start:"Start",STMemoryBooks_End:"End",STMemoryBooks_Message:"Message",STMemoryBooks_Messages:"Messages",STMemoryBooks_EstimatedTokens:"Estimated tokens",STMemoryBooks_NoSceneMarkers:"No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.",STMemoryBooks_MemoryStatus:"Memory Status",STMemoryBooks_ProcessedUpTo:"Processed up to message",STMemoryBooks_NoMemoriesProcessed:"No memories have been processed for this chat yet",STMemoryBooks_SinceVersion:"(since updating to version 3.6.2 or higher.)",STMemoryBooks_AutoSummaryNote:'Please note that Auto-Summary requires you to "prime" every chat with at least one manual memory. After that, summaries will be made automatically.',STMemoryBooks_Preferences:"Preferences:",STMemoryBooks_AlwaysUseDefault:"Always use default profile (no confirmation prompt)",STMemoryBooks_ShowMemoryPreviews:"Show memory previews",STMemoryBooks_ShowNotifications:"Show notifications",STMemoryBooks_UnhideBeforeMemory:"Unhide hidden messages for memory generation (runs /unhide X-Y)",STMemoryBooks_EnableManualMode:"Enable Manual Lorebook Mode",STMemoryBooks_ManualModeDesc:"When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.",STMemoryBooks_AutoCreateLorebook:"Auto-create lorebook if none exists",STMemoryBooks_AutoCreateLorebookDesc:"When enabled, automatically creates and binds a lorebook to the chat if none exists.",STMemoryBooks_LorebookNameTemplate:"Lorebook Name Template:",STMemoryBooks_LorebookNameTemplateDesc:"Template for auto-created lorebook names. Supports {{char}}, {{user}}, {{chat}} placeholders.",STMemoryBooks_LorebookNameTemplatePlaceholder:"LTM - {{char}} - {{chat}}",STMemoryBooks_CurrentLorebookConfig:"Current Lorebook Configuration",STMemoryBooks_Mode:"Mode:",STMemoryBooks_ActiveLorebook:"Active Lorebook:",STMemoryBooks_NoneSelected:"None selected",STMemoryBooks_UsingChatBound:"Using chat-bound lorebook",STMemoryBooks_NoChatBound:"No chat-bound lorebook. Memories will require lorebook selection.",STMemoryBooks_AllowSceneOverlap:"Allow scene overlap",STMemoryBooks_AllowSceneOverlapDesc:"Check this box to skip checking for overlapping memories/scenes.",STMemoryBooks_RefreshEditor:"Refresh lorebook editor after adding memories",STMemoryBooks_AutoSummaryEnabled:"Auto-create memory summaries",STMemoryBooks_AutoSummaryDesc:"Automatically run /nextmemory after a specified number of messages.",STMemoryBooks_AutoSummaryInterval:"Auto-Summary Interval:",STMemoryBooks_AutoSummaryIntervalDesc:"Number of messages after which to automatically create a memory summary.",STMemoryBooks_AutoSummaryBuffer:"Auto-Summary Buffer:",STMemoryBooks_AutoSummaryBufferDesc:"Delay auto-summary by X messages (belated generation). Default 2, max 50.",STMemoryBooks_DefaultInterval:"50",STMemoryBooks_AutoSummaryReadyTitle:"Auto-Summary Ready",STMemoryBooks_AutoSummaryNoAssignedLorebook:"Auto-summary is enabled but there is no assigned lorebook for this chat.",STMemoryBooks_AutoSummarySelectOrPostponeQuestion:"Would you like to select a lorebook for memory storage, or postpone this auto-summary?",STMemoryBooks_PostponeLabel:"Postpone for how many messages?",STMemoryBooks_Postpone10:"10 messages",STMemoryBooks_Postpone20:"20 messages",STMemoryBooks_Postpone30:"30 messages",STMemoryBooks_Postpone40:"40 messages",STMemoryBooks_Postpone50:"50 messages",STMemoryBooks_Button_SelectLorebook:"Select Lorebook",STMemoryBooks_Button_Postpone:"Postpone",STMemoryBooks_Error_NoLorebookSelectedForAutoSummary:"No lorebook selected for auto-summary.",STMemoryBooks_Info_AutoSummaryPostponed:"Auto-summary postponed for {{count}} messages.",STMemoryBooks_Error_NoLorebookForAutoSummary:"No lorebook available for auto-summary.",STMemoryBooks_Error_SelectedLorebookNotFound:'Selected lorebook "{{name}}" not found.',STMemoryBooks_Error_FailedToLoadSelectedLorebook:"Failed to load the selected lorebook.",STMemoryBooks_DefaultMemoryCount:"Default Previous Memories Count:",STMemoryBooks_DefaultMemoryCountDesc:"Default number of previous memories to include as context when creating new memories.",STMemoryBooks_MemoryCount0:"None (0 memories)",STMemoryBooks_MemoryCount1:"Last 1 memory",STMemoryBooks_MemoryCount2:"Last 2 memories",STMemoryBooks_MemoryCount3:"Last 3 memories",STMemoryBooks_MemoryCount4:"Last 4 memories",STMemoryBooks_MemoryCount5:"Last 5 memories",STMemoryBooks_MemoryCount6:"Last 6 memories",STMemoryBooks_MemoryCount7:"Last 7 memories",STMemoryBooks_AutoHideMode:"Auto-hide messages after adding memory:",STMemoryBooks_AutoHideModeDesc:"Choose what messages to automatically hide after creating a memory.",STMemoryBooks_AutoHideNone:"Do not auto-hide",STMemoryBooks_AutoHideAll:"Auto-hide all messages up to the last memory",STMemoryBooks_AutoHideLast:"Auto-hide only messages in the last memory",STMemoryBooks_UnhiddenCount:"Messages to leave unhidden:",STMemoryBooks_UnhiddenCountDesc:"Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)",STMemoryBooks_DefaultUnhidden:"0",STMemoryBooks_TokenWarning:"Token Warning Threshold:",STMemoryBooks_TokenWarningDesc:"Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000",STMemoryBooks_DefaultTokenWarning:"30000",STMemoryBooks_TitleFormat:"Memory Title Format:",STMemoryBooks_CustomTitleFormat:"Custom Title Format...",STMemoryBooks_EnterCustomFormat:"Enter custom format",STMemoryBooks_TitleFormatDesc:"Use [0], [00], [000] for auto-numbering. Available: {{title}}, {{scene}}, {{char}}, {{user}}, {{messages}}, {{profile}}, {{date}}, {{time}}",STMemoryBooks_Profiles:"Memory Profiles:",STMemoryBooks_Profile_CurrentST:"Current SillyTavern Settings",STMemoryBooks_Default:"(Default)",STMemoryBooks_ProfileSettings:"Profile Settings:",STMemoryBooks_Provider:"Provider",STMemoryBooks_Model:"Model",STMemoryBooks_Temperature:"Temperature",STMemoryBooks_ViewPrompt:"View Prompt",STMemoryBooks_ProfileActions:"Profile Actions:",STMemoryBooks_extraFunctionButtons:"Import/Export Profiles:",STMemoryBooks_promptManagerButtons:"Prompt Managers",STMemoryBooks_PromptManagerButtonsHint:"Want to tweak things? Use the buttons below to customize each prompt type.",STMemoryBooks_CreateMemory:"Create Memory",STMemoryBooks_ScenePreview:"Scene Preview:",STMemoryBooks_UsingProfile:"Using Profile",STMemoryBooks_LargeSceneWarning:"Large scene",STMemoryBooks_MayTakeTime:"may take some time to process.",STMemoryBooks_AdvancedOptionsHint:'Click "Advanced Options" to customize prompt, context memories, or API settings.',STMemoryBooks_AdvancedOptions:"Advanced Memory Options",STMemoryBooks_SceneInformation:"Scene Information:",STMemoryBooks_Total:"total",STMemoryBooks_BaseTokens:"Base tokens",STMemoryBooks_TotalTokens:"Total tokens",STMemoryBooks_Profile:"Profile",STMemoryBooks_ChangeProfileDesc:"Change the profile to use different base settings.",STMemoryBooks_MemoryCreationPrompt:"Memory Creation Prompt:",STMemoryBooks_CustomizePromptDesc:"Customize the prompt used to generate this memory.",STMemoryBooks_MemoryPromptPlaceholder:"Memory creation prompt",STMemoryBooks_IncludePreviousMemories:"Include Previous Memories as Context:",STMemoryBooks_PreviousMemoriesDesc:"Previous memories provide context for better continuity.",STMemoryBooks_Found:"Found",STMemoryBooks_ExistingMemorySingular:"existing memory in lorebook.",STMemoryBooks_ExistingMemoriesPlural:"existing memories in lorebook.",STMemoryBooks_NoMemoriesFound:"No existing memories found in lorebook.",STMemoryBooks_APIOverride:"API Override Settings:",STMemoryBooks_CurrentSTSettings:"Current SillyTavern Settings:",STMemoryBooks_API:"API",STMemoryBooks_UseCurrentSettings:"Use current SillyTavern settings instead of profile settings",STMemoryBooks_OverrideDesc:"Override the profile's model and temperature with your current SillyTavern settings.",STMemoryBooks_SaveAsNewProfile:"Save as New Profile:",STMemoryBooks_ProfileName:"Profile Name:",STMemoryBooks_SaveProfileDesc:"Your current settings differ from the selected profile. Save them as a new profile.",STMemoryBooks_EnterProfileName:"Enter new profile name",STMemoryBooks_LargeSceneWarningShort:"⚠️ Large scene may take some time to process.",STMemoryBooks_MemoryPreview:"\uD83D\uDCD6 Memory Preview",STMemoryBooks_MemoryPreviewDesc:"Review the generated memory below. You can edit the content while preserving the structure.",STMemoryBooks_MemoryTitle:"Memory Title:",STMemoryBooks_MemoryTitlePlaceholder:"Memory title",STMemoryBooks_MemoryContent:"Memory Content:",STMemoryBooks_MemoryContentPlaceholder:"Memory content",STMemoryBooks_Keywords:"Keywords:",STMemoryBooks_KeywordsDesc:"Separate keywords with commas",STMemoryBooks_KeywordsPlaceholder:"keyword1, keyword2, keyword3",STMemoryBooks_UnknownProfile:"Unknown Profile",STMemoryBooks_PromptManager_Title:"\uD83E\uDDE9 Summary Prompt Manager",STMemoryBooks_PromptManager_Desc:"Manage your summary generation prompts. All presets are editable.",STMemoryBooks_PromptManager_Search:"Search presets...",STMemoryBooks_PromptManager_DisplayName:"Display Name",STMemoryBooks_PromptManager_DateCreated:"Date Created",STMemoryBooks_PromptManager_New:"➕ New Preset",STMemoryBooks_PromptManager_Edit:"✏️ Edit",STMemoryBooks_PromptManager_Duplicate:"\uD83D\uDCCB Duplicate",STMemoryBooks_PromptManager_Delete:"\uD83D\uDDD1️ Delete",STMemoryBooks_PromptManager_Export:"\uD83D\uDCE4 Export JSON",STMemoryBooks_PromptManager_Import:"\uD83D\uDCE5 Import JSON",STMemoryBooks_PromptManager_ApplyToProfile:"✅ Apply to Selected Profile",STMemoryBooks_PromptManager_NoPresets:"No presets available",STMemoryBooks_Profile_MemoryMethod:"Memory Creation Method:",STMemoryBooks_Profile_PresetSelectDesc:"Choose a preset. Create and edit presets in the Summary Prompt Manager.",STMemoryBooks_CustomPromptManaged:"Custom prompts are now controlled by the Summary Prompt Manager.",STMemoryBooks_OpenPromptManager:"\uD83E\uDDE9 Open Summary Prompt Manager",STMemoryBooks_MoveToPreset:"\uD83D\uDCCC Move Current Custom Prompt to Preset",STMemoryBooks_MoveToPresetConfirmTitle:"Move to Preset",STMemoryBooks_MoveToPresetConfirmDesc:"Create a preset from this profile's custom prompt, set the preset on this profile, and clear the custom prompt?",STMemoryBooks_SidePrompts_Title:"\uD83C\uDFA1 Trackers & Side Prompts",STMemoryBooks_SidePrompts_Desc:"Create and manage side prompts for trackers and other behind-the-scenes functions.",STMemoryBooks_EditSidePrompt:"Edit Side Prompt",STMemoryBooks_ResponseFormatPlaceholder:"Optional response format",STMemoryBooks_PreviousMemoriesHelp:"Number of previous memory entries to include before scene text (0 = none).",STMemoryBooks_Name:"Name",STMemoryBooks_Key:"Key",STMemoryBooks_Enabled:"Enabled",STMemoryBooks_RunOnVisibleMessageInterval:"Run on visible message interval",STMemoryBooks_IntervalVisibleMessages:"Interval (visible messages):",STMemoryBooks_RunAutomaticallyAfterMemory:"Run automatically after memory",STMemoryBooks_AllowManualRunViaSideprompt:"Allow manual run via /sideprompt",STMemoryBooks_Triggers:"Triggers",STMemoryBooks_ResponseFormatOptional:"Response Format (optional)",STMemoryBooks_OrderValue:"Order Value",STMemoryBooks_PreviousMemoriesForContext:"Previous memories for context",STMemoryBooks_Overrides:"Overrides",STMemoryBooks_OverrideDefaultMemoryProfile:"Override default memory profile",STMemoryBooks_ConnectionProfile:"Connection Profile",STMemoryBooks_NewSidePrompt:"New Side Prompt",STMemoryBooks_MySidePromptPlaceholder:"My Side Prompt",STMemoryBooks_Actions:"Actions",STMemoryBooks_None:"None",STMemoryBooks_Edit:"Edit",STMemoryBooks_Duplicate:"Duplicate",STMemoryBooks_NoSidePromptsAvailable:"No side prompts available.",STMemoryBooks_SidePrompts_New:"➕ New",STMemoryBooks_SidePrompts_ExportJSON:"\uD83D\uDCE4 Export JSON",STMemoryBooks_SidePrompts_ImportJSON:"\uD83D\uDCE5 Import JSON",STMemoryBooks_SidePrompts_RecreateBuiltIns:"♻️ Recreate Built-in Side Prompts",STMemoryBooks_SidePrompts_RecreateTitle:"Recreate Built-in Side Prompts",STMemoryBooks_SidePrompts_RecreateWarning:"This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.",STMemoryBooks_SidePrompts_RecreateOk:"Recreate",STMemoryBooks_SidePrompts_RecreateSuccess:"Recreated {{count}} built-in side prompts from current locale",STMemoryBooks_SidePrompts_RecreateFailed:"Failed to recreate built-in side prompts",STMemoryBooks_SidePrompts_MaxConcurrentLabel:"Max concurrent side prompts",STMemoryBooks_SidePrompts_MaxConcurrentHelp:"This controls how many side prompts can be running at one time. Lower this value if you have a slow connection or are running into rate limits. Default: 3",STMemoryBooks_SidePromptCreated:'SidePrompt "{{name}}" created.',STMemoryBooks_FailedToCreateSidePrompt:"Failed to create SidePrompt.",STMemoryBooks_SidePromptDuplicated:'SidePrompt "{{name}}" duplicated.',STMemoryBooks_FailedToDuplicateSidePrompt:"Failed to duplicate SidePrompt.",STMemoryBooks_SidePromptDeleted:'SidePrompt "{{name}}" deleted.',STMemoryBooks_FailedToDeleteSidePrompt:"Failed to delete SidePrompt.",STMemoryBooks_SidePromptsExported:"Side prompts exported.",STMemoryBooks_FailedToExportSidePrompts:"Failed to export side prompts.",STMemoryBooks_ImportedSidePrompts:"Imported {{count}} side prompts.",STMemoryBooks_ImportedSidePromptsDetail:"Imported side prompts: {{added}} added{{detail}}",STMemoryBooks_ImportedSidePromptsRenamedDetail:" ({{count}} renamed due to key conflicts)",STMemoryBooks_FailedToImportSidePrompts:"Failed to import side prompts.",STMemoryBooks_DeleteSidePromptTitle:"Delete Side Prompt",STMemoryBooks_DeleteSidePromptConfirm:'Are you sure you want to delete "{{name}}"?',STMemoryBooks_NameEmptyKeepPrevious:"Name was empty. Keeping previous name.",STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled:'No name provided. Using "Untitled Side Prompt".',STMemoryBooks_MenuItem:"Memory Books",STMemoryBooks_Close:"Close",STMemoryBooks_NoMatches:"No matches",STMemoryBooks_RunSidePrompt:"Run Side Prompt",STMemoryBooks_SearchSidePrompts:"Search side prompts...",STMemoryBooks_Interval:"Interval",STMemoryBooks_AfterMemory:"AfterMemory",STMemoryBooks_Manual:"Manual",STMemoryBooks_AutomaticChatBound:"Automatic (Chat-bound)",STMemoryBooks_UsingChatBoundLorebook:'Using chat-bound lorebook "<strong>{{lorebookName}}</strong>"',STMemoryBooks_NoChatBoundLorebook:"No chat-bound lorebook. Memories will require lorebook selection.",STMemoryBooks_ManualLorebookSetupTitle:"Manual Lorebook Setup",STMemoryBooks_ManualLorebookSetupDesc1:'You have a chat-bound lorebook "<strong>{{name}}</strong>".',STMemoryBooks_ManualLorebookSetupDesc2:"Would you like to use it for manual mode or select a different one?",STMemoryBooks_UseChatBound:"Use Chat-bound",STMemoryBooks_SelectDifferent:"Select Different",STMemoryBooks_SidePromptGuide:'SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',STMemoryBooks_MultipleMatches:'Multiple matches: {{top}}{{more}}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_ClearCustomPromptTitle:"Clear Custom Prompt?",STMemoryBooks_ClearCustomPromptDesc:"This profile has a custom prompt. Clear it so the selected preset is used?",STMemoryBooks_CreateNewPresetTitle:"Create New Preset",STMemoryBooks_DisplayNameTitle:"Display Name:",STMemoryBooks_MyCustomPreset:"My Custom Preset",STMemoryBooks_PromptTitle:"Prompt:",STMemoryBooks_EnterPromptPlaceholder:"Enter your prompt here...",STMemoryBooks_EditPresetTitle:"Edit Preset",STMemoryBooks_DeletePresetTitle:"Delete Preset",STMemoryBooks_DeletePresetConfirm:'Are you sure you want to delete "{{name}}"?',STMemoryBooks_NotSet:"Not Set",STMemoryBooks_ProfileNamePlaceholder:"Profile name",STMemoryBooks_ModelAndTempSettings:"Model & Temperature Settings:",STMemoryBooks_ModelHint:"For model, copy-paste the exact model ID, eg. `gemini-2.5-pro`, `deepseek/deepseek-r1-0528:free`, `gpt-4o-mini-2024-07-18`, etc.",STMemoryBooks_ModelPlaceholder:"Paste model ID here",STMemoryBooks_APIProvider:"API/Provider:",STMemoryBooks_CustomAPI:"Custom API",STMemoryBooks_FullManualConfig:"Full Manual Configuration",STMemoryBooks_TemperatureRange:"Temperature (0.0 - 2.0):",STMemoryBooks_TemperaturePlaceholder:"DO NOT LEAVE BLANK! If unsure put 0.8.",STMemoryBooks_APIEndpointURL:"API Endpoint URL:",STMemoryBooks_APIEndpointPlaceholder:"https://api.example.com/v1/chat/completions",STMemoryBooks_APIKey:"API Key:",STMemoryBooks_APIKeyPlaceholder:"Enter your API key",STMemoryBooks_LorebookEntrySettings:"Lorebook Entry Settings",STMemoryBooks_LorebookEntrySettingsDesc:"These settings control how the generated memory is saved into the lorebook.",STMemoryBooks_OutletName:"Outlet Name",STMemoryBooks_OutletNamePlaceholder:"e.g., ENDING",STMemoryBooks_ActivationMode:"Activation Mode:",STMemoryBooks_ActivationModeDesc:"\uD83D\uDD17 Vectorized is recommended for memories.",STMemoryBooks_Vectorized:"\uD83D\uDD17 Vectorized (Default)",STMemoryBooks_Constant:"\uD83D\uDD35 Constant",STMemoryBooks_Normal:"\uD83D\uDFE2 Normal",STMemoryBooks_InsertionPosition:"Insertion Position:",STMemoryBooks_InsertionPositionDesc:"↑Char is recommended. Aiko recommends memories never go lower than ↑AN.",STMemoryBooks_CharUp:"↑Char",STMemoryBooks_CharDown:"↓Char",STMemoryBooks_ANUp:"↑AN",STMemoryBooks_ANDown:"↓AN",STMemoryBooks_EMUp:"↑EM",STMemoryBooks_EMDown:"↓EM",STMemoryBooks_Outlet:"Outlet",STMemoryBooks_InsertionOrder:"Insertion Order:",STMemoryBooks_AutoOrder:"Auto (uses memory #)",STMemoryBooks_ManualOrder:"Manual",STMemoryBooks_RecursionSettings:"Recursion Settings:",STMemoryBooks_PreventRecursion:"Prevent Recursion",STMemoryBooks_DelayUntilRecursion:"Delay Until Recursion",STMemoryBooks_RefreshPresets:"\uD83D\uDD04 Refresh Presets",STMemoryBooks_Button_CreateMemory:"Create Memory",STMemoryBooks_Button_AdvancedOptions:"Advanced Options...",STMemoryBooks_Button_SaveAsNewProfile:"Save as New Profile",STMemoryBooks_SaveProfileAndCreateMemory:"Save Profile & Create Memory",STMemoryBooks_Tooltip_SaveProfileAndCreateMemory:"Save the modified settings as a new profile and create the memory",STMemoryBooks_Tooltip_CreateMemory:"Create memory using the selected profile settings",STMemoryBooks_EditAndSave:"Edit & Save",STMemoryBooks_RetryGeneration:"Retry Generation",STMemoryBooks_PromptManager_Hint:`\uD83D\uDCA1 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don't change the "respond with JSON" instructions, \uD83D\uDCD5Memory Books uses that to process the returned result from the AI.`,STMemoryBooks_ExpandEditor:"Expand the editor",STMemoryBooks_ClearAndApply:"Clear and Apply",STMemoryBooks_Cancel:"Cancel",STMemoryBooks_Create:"Create",STMemoryBooks_Save:"Save",STMemoryBooks_Delete:"Delete",STMemoryBooks_Toast_ProfileSaved:'Profile "{{name}}" saved successfully',STMemoryBooks_Toast_ProfileSaveFailed:"Failed to save profile: {{message}}",STMemoryBooks_Toast_ProfileNameOrProceed:'Please enter a profile name or use "Create Memory" to proceed without saving',STMemoryBooks_Toast_ProfileNameRequired:"Please enter a profile name",STMemoryBooks_Toast_UnableToReadEditedValues:"Unable to read edited values",STMemoryBooks_Toast_UnableToFindInputFields:"Unable to find input fields",STMemoryBooks_Toast_TitleCannotBeEmpty:"Memory title cannot be empty",STMemoryBooks_Toast_ContentCannotBeEmpty:"Memory content cannot be empty",STMemoryBooks_Toast_NoMemoryLorebookAssigned:"No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.",STMemoryBooks_Error_NoMemoryLorebookAssigned:"No memory lorebook assigned",STMemoryBooks_Error_FailedToLoadLorebook:"Failed to load lorebook",STMemoryBooks_Toast_FailedToLoadLorebook:"Failed to load the selected lorebook.",STMemoryBooks_Toast_SidePromptFailed:'SidePrompt "{{name}}" failed: {{message}}',STMemoryBooks_Toast_FailedToUpdateSidePrompt:'Failed to update sideprompt entry "{{name}}"',STMemoryBooks_Toast_FailedToSaveWave:"Failed to save SidePrompt updates for this wave",STMemoryBooks_Toast_SidePromptsSucceeded:"Side Prompts after memory: {{okCount}} succeeded. {{succeeded}}",STMemoryBooks_Toast_SidePromptsPartiallyFailed:"Side Prompts after memory: {{okCount}} succeeded, {{failCount}} failed. {{failed}}",STMemoryBooks_Toast_SidePromptNameNotProvided:'SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_Toast_SceneClearedStart:"Scene cleared due to start marker deletion",STMemoryBooks_Toast_SceneEndPointCleared:"Scene end point cleared due to message deletion",STMemoryBooks_Toast_SceneMarkersAdjusted:"Scene markers adjusted due to message deletion.",STMemoryBooks_MarkSceneStart:"Mark Scene Start",STMemoryBooks_MarkSceneEnd:"Mark Scene End",STMemoryBooks_CreateMemoryBtn:"Create Memory",STMemoryBooks_ClearSceneBtn:"Clear Scene",STMemoryBooks_NoSceneSelected:"No scene selected. Make sure both start and end points are set.",STMemoryBooks_NoSceneMarkersToastr:"No scene markers set. Use chevron buttons to mark start and end points first.",STMemoryBooks_MissingRangeArgument:"Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_InvalidFormat:"Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_InvalidMessageIDs:"Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_StartGreaterThanEnd:"Start message cannot be greater than end message",STMemoryBooks_MessageIDsOutOfRange:"Message IDs out of range.",STMemoryBooks_MessagesDoNotExist:"One or more specified messages do not exist",STMemoryBooks_SceneSet:"Scene set.",STMemoryBooks_MemoryAlreadyInProgress:"Memory creation is already in progress",STMemoryBooks_NoLorebookAvailable:"No lorebook available.",STMemoryBooks_NoMessagesToSummarize:"There are no messages to summarize yet.",STMemoryBooks_NoNewMessagesSinceLastMemory:"No new messages since the last memory.",STMemoryBooks_NextMemoryFailed:"Failed to run /nextmemory.",STMemoryBooks_OnlyNOfRequestedMemoriesAvailable:"Only some of the requested memories are available",STMemoryBooks_NoPreviousMemoriesFound:"No previous memories found in lorebook",STMemoryBooks_WorkingToast:"Creating memory...",STMemoryBooks_MaximumRetryAttemptsReached:"Maximum retry attempts reached",STMemoryBooks_RetryingMemoryGeneration:"Retrying memory generation...",STMemoryBooks_UnableToRetrieveEditedMemoryData:"Unable to retrieve edited memory data",STMemoryBooks_EditedMemoryDataIncomplete:"Edited memory data is incomplete",STMemoryBooks_MemoryCreatedSuccessfully:"Memory created successfully!",STMemoryBooks_MemoryCreationFailedWillRetry:"Memory creation failed. Retrying...",STMemoryBooks_SceneTooLarge:"Scene is too large. Try selecting a smaller range.",STMemoryBooks_AIFailedToGenerateValidMemory:"AI failed to generate valid memory.",STMemoryBooks_ProfileConfigurationError:"Profile configuration error.",STMemoryBooks_FailedToCreateMemory:"Failed to create memory.",STMemoryBooks_LoadingCharacterData:"SillyTavern is still loading character data, please wait a few seconds and try again.",STMemoryBooks_GroupChatDataUnavailable:"Group chat data not available, please wait a few seconds and try again.",STMemoryBooks_LorebookValidationError:"Lorebook validation error",STMemoryBooks_SceneOverlap:"Scene overlaps with existing memory.",STMemoryBooks_UnexpectedError:"An unexpected error occurred.",STMemoryBooks_ChangeManualLorebook:"Change",STMemoryBooks_SelectManualLorebook:"Select",STMemoryBooks_ManualLorebook:"Manual Lorebook",STMemoryBooks_FailedToSelectManualLorebook:"Failed to select manual lorebook",STMemoryBooks_ClearManualLorebook:"Clear Manual Lorebook",STMemoryBooks_ManualLorebookCleared:"Manual lorebook cleared",STMemoryBooks_FailedToClearManualLorebook:"Failed to clear manual lorebook",STMemoryBooks_SetAsDefault:"Set as Default",STMemoryBooks_SetAsDefaultProfileSuccess:'"{{name}}" is now the default profile.',STMemoryBooks_EditProfile:"Edit Profile",STMemoryBooks_FailedToEditProfile:"Failed to edit profile",STMemoryBooks_NewProfile:"New Profile",STMemoryBooks_FailedToCreateProfile:"Failed to create profile",STMemoryBooks_DeleteProfile:"Delete Profile",STMemoryBooks_FailedToDeleteProfile:"Failed to delete profile",STMemoryBooks_ExportProfiles:"Export Profiles",STMemoryBooks_FailedToExportProfiles:"Failed to export profiles",STMemoryBooks_ImportProfiles:"Import Profiles",STMemoryBooks_SummaryPromptManager:"Summary Prompt Manager",STMemoryBooks_FailedToOpenSummaryPromptManager:"Failed to open Summary Prompt Manager",STMemoryBooks_SidePrompts:"Side Prompts",STMemoryBooks_FailedToOpenSidePrompts:"Failed to open Side Prompts",STMemoryBooks_SelectPresetFirst:"Select a preset first",STMemoryBooks_NoProfilesAvailable:"No profiles available",STMemoryBooks_SelectedProfileNotFound:"Selected profile not found",STMemoryBooks_PresetAppliedToProfile:"Preset applied to profile",STMemoryBooks_PromptCannotBeEmpty:"Prompt cannot be empty",STMemoryBooks_PresetCreatedSuccessfully:"Preset created successfully",STMemoryBooks_FailedToCreatePreset:"Failed to create preset",STMemoryBooks_PresetUpdatedSuccessfully:"Preset updated successfully",STMemoryBooks_FailedToEditPreset:"Failed to edit preset",STMemoryBooks_PresetDuplicatedSuccessfully:"Preset duplicated successfully",STMemoryBooks_FailedToDuplicatePreset:"Failed to duplicate preset",STMemoryBooks_PresetDeletedSuccessfully:"Preset deleted successfully",STMemoryBooks_PromptsExportedSuccessfully:"Prompts exported successfully",STMemoryBooks_PromptsImportedSuccessfully:"Prompts imported successfully",STMemoryBooks_FailedToImportPrompts:"Failed to import prompts.",STMemoryBooks_CreateMemoryButton:"Create Memory",STMemoryBooks_ConsolidateArcsButton:"Consolidate Memories into Arcs",STMemoryBooks_NoSceneSelectedMakeSure:"No scene selected. Make sure both start and end points are set.",STMemoryBooks_ClearSceneButton:"Clear Scene",STMemoryBooks_FailedToImportProfiles:"Failed to import profiles",STMemoryBooks_ManualLorebookSet:'Manual lorebook set to "{{name}}"',STMemoryBooks_PleaseSelectLorebookForManualMode:"Please select a lorebook for manual mode",STMemoryBooks_FailedToSaveSettings:"Failed to save settings. Please try again.",STMemoryBooks_FailedToInitializeChatMonitoring:"STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.",STMemoryBooks_Label_CurrentSTModel:"Current SillyTavern model",STMemoryBooks_Label_CurrentSTTemperature:"Current SillyTavern temperature",STMemoryBooks_Label_TotalTokens:"Total tokens: {{count}}",STMemoryBooks_Label_TotalTokensCalculating:"Total tokens: Calculating...",STMemoryBooks_Warn_LargeSceneTokens:"⚠️ Large scene ({{tokens}} tokens) may take some time to process.",STMemoryBooks_ModifiedProfileName:"{{name}} - Modified",STMemoryBooks_ProfileEditTitle:"Edit Profile",STMemoryBooks_CancelClose:"Cancel/Close",STMemoryBooks_InvalidProfileData:"Invalid profile data",STMemoryBooks_ProfileUpdatedSuccess:"Profile updated successfully",STMemoryBooks_NewProfileTitle:"New Profile",STMemoryBooks_ProfileCreatedSuccess:"Profile created successfully",STMemoryBooks_DeleteProfileConfirm:'Delete profile "{{name}}"?',STMemoryBooks_CannotDeleteLastProfile:"Cannot delete the last profile",STMemoryBooks_CannotDeleteDefaultProfile:'Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',STMemoryBooks_ProfileDeletedSuccess:"Profile deleted successfully",STMemoryBooks_ProfilesExportedSuccess:"Profiles exported successfully",STMemoryBooks_ImportErrorInvalidFormat:"Invalid profile data format - missing profiles array",STMemoryBooks_ImportErrorNoValidProfiles:"No valid profiles found in import file",STMemoryBooks_ImportSuccess:"Imported {{importedCount}} profile{{plural}}",STMemoryBooks_ImportSkipped:" ({{skippedCount}} duplicate{{plural}} skipped)",STMemoryBooks_ImportComplete:"STMemoryBooks profile import completed",STMemoryBooks_ImportNoNewProfiles:"No new profiles imported - all profiles already exist",STMemoryBooks_ImportFailed:"Failed to import profiles: {{message}}",STMemoryBooks_ImportReadError:"Failed to read import file",STMemoryBooks_PromptManagerNotFound:"Prompt Manager button not found. Open main settings and try again.",STMemoryBooks_PresetListRefreshed:"Preset list refreshed",STMemoryBooks_FailedToRefreshPresets:"Failed to refresh presets",STMemoryBooks_NoCustomPromptToMigrate:"No custom prompt to migrate",STMemoryBooks_CustomPromptMigrated:"Preset created and selected. Remember to Save.",STMemoryBooks_FailedToMigrateCustomPrompt:"Failed to move custom prompt to preset",STMemoryBooks_Toast_SidePromptUpdated:'SidePrompt "{{name}}" updated.',STMemoryBooks_Toast_SidePromptNotFound:"SidePrompt template not found. Check name.",STMemoryBooks_Toast_ManualRunDisabled:'Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',STMemoryBooks_Toast_NoMessagesAvailable:"No messages available.",STMemoryBooks_Toast_InvalidRangeFormat:"Invalid range format. Use X-Y",STMemoryBooks_Toast_InvalidMessageRange:"Invalid message range for /sideprompt",STMemoryBooks_Toast_FailedToCompileRange:"Failed to compile the specified range",STMemoryBooks_Toast_SidePromptRangeTip:'Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',STMemoryBooks_Toast_FailedToCompileMessages:"Failed to compile messages for /sideprompt",STMemoryBooks_Plotpoints:"Plotpoints",STMemoryBooks_PlotpointsPrompt:"Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.",STMemoryBooks_Status:"Status",STMemoryBooks_StatusPrompt:"Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.",STMemoryBooks_CastOfCharacters:"Cast of Characters",STMemoryBooks_CastOfCharactersPrompt:`You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. 
Step 1: Review the scene and either add or update plot-related NPCs to the NPC WHO'S WHO report. Please note that {{char}} and {{user}} are major characters and do NOT need to be included in this report.
Step 2: This list should be kept in order of importance to the plot, so it may need to be reordered.
Step 3: If your response would be more than 2000 tokens long, remove NPCs with the least impact to the plot.`,STMemoryBooks_Assess:"Assess",STMemoryBooks_AssessPrompt:'Assess the interaction between {{char}} and {{user}} to date. List all the information {{char}} has learned about {{user}} in a code block through observation, questioning, or drawing conclusions from interaction (similar to a mental "note to self"). If there is already a list, update it. Try to keep it token-efficient and compact, focused on the important things.',STMemoryBooks_PlotpointsResponseFormat:`=== Plot Points ===
(as of [point in the story when this analysis was done])

[Overarching Plot Arc]
(2-3 sentence summary of the superobjective or major plot)

[Thread #1 Title]
- Summary: (1 sentence)
- Status: (active / on hold)
- At Stake: (how resolution will affect the ongoing story)
- Last Known: (location or time)
- Key Characters: ...


[Thread #2 Title]
- Summary: (1 sentence)
- Status: (active / on hold)
- At Stake: (how resolution will affect the ongoing story)
- Last Known: (location or time)
- Key Characters: ...

...

-- Plot Hooks --
- (new or potential plot hooks)

-- Character Dynamics --
- current status of {{user}}'s/{{char}}'s relationships with NPCs

===End Plot Points===
`,STMemoryBooks_StatusResponseFormat:`Follow this general format:

## Witty Headline or Summary

### AFFINITY (0-100, have some relationship with !lovefactor and !lustfactor)
- Score with evidence
- Recent changes 
- Supporting quotes
- Anything else that might be illustrative of the current affinity

### LOVEFACTOR and LUSTFACTOR
(!lovefactor and !lustfactor reports go here)

### RELATIONSHIP STATUS (negative = enemies, 0 = strangers, 100 = life partners)
- Trust/boundaries/communication
- Key events
- Issues
- Any other pertinent points

### GOALS
- Short/long-term objectives
- Progress/obstacles
- Growth areas
- Any other pertinent points

### ANALYSIS
- Psychology/POV
- Development/triggers
- Story suggestions
- Any other pertinent points

### WRAP-UP
- OOC Summary (1 paragraph)`,STMemoryBooks_CastOfCharactersResponseFormat:`===NPC WHO'S WHO===
(In order of importance to the plot)

Person 1: 1-2 sentence desription
Person 2: 1-2 sentence desription
===END NPC WHO'S WHO===`,STMemoryBooks_AssessResponseFormat:`Use this format: 
=== Things {{char}} has learned about {{user}} ===
(detailed list, in {{char}}'s POV/tone of voice)
===`,STMemoryBooks_FailedToSaveSidePrompts:"Failed to save side prompts: {{status}} {{statusText}}",STMemoryBooks_SidePromptsSaved:"Side prompts saved successfully",STMemoryBooks_MigratingSidePrompts:"Migrating side prompts file from V1(type) to V2(triggers)",STMemoryBooks_InvalidSidePromptsFile:"Invalid side prompts file structure; recreating with built-ins",STMemoryBooks_ErrorLoadingSidePrompts:"Error loading side prompts; creating base doc",STMemoryBooks_UntitledSidePrompt:"Untitled Side Prompt",STMemoryBooks_TemplateNotFound:'Template "{{key}}" not found',STMemoryBooks_CopyOfTemplate:"{{name}} (Copy)",STMemoryBooks_InvalidSidePromptsJSON:"Invalid side prompts file structure",STMemoryBooks_ConverterTitle:"STMemoryBooks Lorebook Converter (v3)",STMemoryBooks_ConverterHeader:"Lorebook Converter",STMemoryBooks_ConverterDescription:'This tool flags entries by adding `stmemorybooks: true`. An entry is converted only if it matches the title format, is <strong>not</strong> set to `"vectorized": false`, and has its `"position"` set to `0`.',STMemoryBooks_ConverterSampleTitleLabel:"Sample Title Format (Optional)",STMemoryBooks_ConverterSampleTitlePlaceholder:"e.g., 01 - My First Memory",STMemoryBooks_ConverterSampleTitleDescription:'The tool will find the first number and use it to create a pattern. If blank, it defaults to matching titles like "01 - title".',STMemoryBooks_ConverterFileUploadLabel:"Click or Drag to Upload Lorebook File",STMemoryBooks_ConverterIncludeVectorizedLabel:"Include \uD83D\uDD35 entries",STMemoryBooks_ConverterIncludeVectorizedDescription:"If enabled, entries with `vectorized: false` will also be included as memories.",STMemoryBooks_ConverterConvertButton:"Convert File",STMemoryBooks_ConverterConversionComplete:"Conversion complete!",STMemoryBooks_ConverterDownloadLink:"Download {{filename}}",STMemoryBooks_ConverterErrorProcessingFile:"Error processing file. Please ensure it is a valid JSON lorebook. Error: {{message}}",STMemoryBooks_ConverterInvalidLorebookStructure:"Invalid lorebook structure: 'entries' object not found.",STMemoryBooks_ConverterUsingDefaultRegex:"Using default: {{regex}}",STMemoryBooks_ConverterConversionStats:"Conversion complete. Checked {{totalEntries}} entries and flagged {{memoriesConverted}} as memories.","addlore.errors.invalidContent":"Invalid memory result: missing content","addlore.errors.invalidLorebookValidation":"Invalid lorebook validation data","addlore.errors.createEntryFailed":"Failed to create new lorebook entry","addlore.toast.added":'Memory "{{entryTitle}}" added to "{{lorebookName}}"',"addlore.toast.addFailed":"Failed to add memory: {{message}}","addlore.toast.autohideInvalidRange":"Auto-hide skipped: invalid scene range metadata","addlore.toast.title":"STMemoryBooks","addlore.result.added":'Memory successfully added to "{{lorebookName}}"',"addlore.result.addFailed":"Failed to add memory to lorebook: {{message}}","addlore.defaults.title":"Memory","addlore.defaults.scene":"Scene {{range}}","addlore.defaults.user":"User","addlore.sanitize.fallback":"Auto Memory","addlore.preview.error":"Error: {{message}}","addlore.preview.sampleTitle":"Sample Memory Title","addlore.preview.sampleProfile":"Summary","addlore.stats.errors.noBinding":"No lorebook bound to chat","addlore.stats.errors.loadFailed":"Failed to load lorebook","addlore.titleFormat.errors.nonEmpty":"Title format must be a non-empty string","addlore.titleFormat.warnings.sanitization":"Title contains characters that will be removed during sanitization","addlore.titleFormat.warnings.unknownPlaceholders":"Unknown placeholders: {{placeholders}}","addlore.titleFormat.warnings.invalidNumbering":"Invalid numbering patterns: {{patterns}}. Use [0], [00], [000], (0), {0}, #0 etc.","addlore.titleFormat.warnings.tooLong":"Title format is very long and may be truncated","addlore.upsert.errors.invalidArgs":"Invalid arguments to upsertLorebookEntryByTitle","addlore.upsert.errors.createFailed":"Failed to create lorebook entry","addlore.titleFormats.0":"[000] - {{title}} ({{profile}})","addlore.titleFormats.1":"{{date}} [000] \uD83C\uDFAC{{title}}, {{messages}} msgs","addlore.titleFormats.2":"[000] {{date}} - {{char}} Memory","addlore.titleFormats.3":"[00] - {{user}} & {{char}} {{scene}}","addlore.titleFormats.4":"\uD83E\uDDE0 [000] ({{messages}} msgs)","addlore.titleFormats.5":"\uD83D\uDCDA Memory #[000] - {{profile}} {{date}} {{time}}","addlore.titleFormats.6":"[000] - {{scene}}: {{title}}","addlore.titleFormats.7":"[000] - {{title}} ({{scene}})","addlore.titleFormats.8":"[000] - {{title}}","addlore.log.executingHideCommand":"STMemoryBooks-AddLore: Executing hide command{{context}}: {{hideCommand}}","addlore.warn.autohideSkippedInvalidRange":'STMemoryBooks-AddLore: Auto-hide skipped - invalid scene range: "{{range}}"',"addlore.hideCommand.allComplete":"all mode - complete","addlore.hideCommand.allPartial":"all mode - partial","addlore.hideCommand.lastHideAll":"last mode - hide all","addlore.hideCommand.lastPartial":"last mode - partial","addlore.log.addFailed":"STMemoryBooks-AddLore: Failed to add memory to lorebook:","addlore.log.getStatsError":"STMemoryBooks-AddLore: Error getting lorebook stats:","addlore.log.updateHighestCalled":"STMemoryBooks-AddLore: updateHighestMemoryProcessed called with:","addlore.log.sceneRangeExtracted":"STMemoryBooks-AddLore: sceneRange extracted:","addlore.warn.noSceneRange":"STMemoryBooks-AddLore: No scene range found in memory result, cannot update highest processed","addlore.warn.invalidSceneRangeFormat":"STMemoryBooks-AddLore: Invalid scene range format: {{range}}","addlore.warn.invalidEndMessage":"STMemoryBooks-AddLore: Invalid end message number: {{end}}","addlore.warn.noSceneMarkers":"STMemoryBooks-AddLore: Could not get scene markers to update highest processed","addlore.log.setHighest":"STMemoryBooks-AddLore: Set highest memory processed to message {{endMessage}}","addlore.log.updateHighestError":"STMemoryBooks-AddLore: Error updating highest memory processed:","autocreate.log.creating":'STMemoryBooks-AutoCreate: Auto-creating lorebook "{{name}}" for {{context}}',"autocreate.log.created":'STMemoryBooks-AutoCreate: Successfully created and bound lorebook "{{name}}"',"autocreate.log.createFailed":"STMemoryBooks-AutoCreate: Failed to create lorebook","autocreate.log.createError":"STMemoryBooks-AutoCreate: Error creating lorebook:","autosummary.log.postponed":"STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})","autosummary.log.skippedInProgress":"STMemoryBooks: Auto-summary skipped - memory creation in progress","autosummary.log.noPrevious":"STMemoryBooks: No previous memories found - counting from start","autosummary.log.sinceLast":"STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}","autosummary.log.triggerCheck":"STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?","autosummary.log.notTriggered":"STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages","autosummary.log.postponedUntil":"STMemoryBooks: Auto-summary postponed until message {{until}}","autosummary.log.blocked":"STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}","autosummary.log.clearedPostpone":"STMemoryBooks: Cleared auto-summary postpone flag","autosummary.log.triggered":"STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}","autosummary.log.triggerError":"STMemoryBooks: Error in auto-summary trigger check:","autosummary.log.messageReceivedSingle":"STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}","autosummary.log.messageReceivedGroup":"STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED","autosummary.log.messageHandlerError":"STMemoryBooks: Error in auto-summary message received handler:","autosummary.log.groupFinished":"STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}","autosummary.log.groupHandlerError":"STMemoryBooks: Error in auto-summary group finished handler:","autocreate.toast.title":"STMemoryBooks","autocreate.toast.createdBound":'Created and bound lorebook "{{name}}"',"autocreate.errors.failedAutoCreate":"Failed to auto-create lorebook.","autocreate.errors.failedAutoCreateWithMessage":"Failed to auto-create lorebook: {{message}}","common.unknown":"Unknown",STMemoryBooks_ArcPromptManager:"Arc Prompt Manager",STMemoryBooks_Arc_RebuildBuiltins:"Rebuild from built-ins",STMemoryBooks_Arc_MaxPerPass:"Maximum number of memories to process in each pass",STMemoryBooks_Arc_MaxPasses:"Number of automatic arc attempts",STMemoryBooks_Arc_MinAssigned:"Minimum number of memories in each arc",STMemoryBooks_Arc_TokenBudget:"Token Budget",STMemoryBooks_Arc_RebuildTitle:"Rebuild Arc Prompts from Built-ins",STMemoryBooks_Arc_RebuildWarning:"This will overwrite your saved Arc prompt presets with the built-ins. A timestamped backup will be created.",STMemoryBooks_Arc_RebuildNote:"After rebuild, the preset list will refresh automatically.",STMemoryBooks_ConsolidateArcs_DisableOriginals:"Disable originals after creating arcs",STMemoryBooks_ConsolidateArcs_Tip:"Tip: uncheck memories that should not be included.",STMemoryBooks_ArcAnalysis_EmptyResponse:"Empty AI response",STMemoryBooks_ArcAnalysis_InvalidJSON:"Model did not return valid arc JSON",STMemoryBooks_ArcAnalysis_MissingLorebookData:"Missing lorebookName or lorebookData",STMemoryBooks_ArcAnalysis_UpsertFailed:"Arc upsert returned no entry (commitArcs failed)",STMemoryBooks_ArcPromptManager_SaveFailed:"Failed to save arc prompts",STMemoryBooks_ArcPrompt_Default:`You are an expert narrative analyst and memory-engine assistant.
Your task is to take multiple scene summaries (of varying detail and formatting), normalize them, reconstruct the full chronology, identify self-contained story arcs, and output each arc as a single memory entry in JSON.

Each arc must be token-efficient, plot-accurate, and compatible with long-running RP memory systems such as STMB.

You will receive input in this exact format:
- An optional PREVIOUS ARC block, which is canon and must not be rewritten.
- A MEMORIES block containing entries formatted as:
  [ID] | ORDER
  Full text of the memory (may span multiple paragraphs)

Strict output format (JSON only; no markdown, no prose outside JSON):
{
  "arcs": [
    {
      "title": "Short descriptive arc title (3–6 words)",
      "summary": "Structured arc summary as a single string (see Summary Content Structure below).",
      "keywords": ["keyword1", "keyword2", "..."],
      "member_ids": ["<ID from MEMORIES>", "..."]  // optional: IDs of memories that belong to this arc
    }
  ],
  "unassigned_memories": [
    { "id": "memory-id", "reason": "Brief explanation of why this memory does not fit the produced arcs." }
  ]
}

Arc count rule:
- Do not force a number of arcs. Produce the smallest coherent number of arcs based on content (often 1–3, possibly 1 if all memories form one arc).
- Respect chronology using ORDER (ascending).
- If some memories do not fit the produced arcs, place them in unassigned_memories with a short reason.

Do not repeat text from PREVIOUS ARC. Treat it as canon; continue consequences only if relevant in the new memories.

PROCESS

STEP 1 — UNIFIED STORY (internal only)
- Combine ALL memories into a single chronological retelling.
- Ignore OOC/meta content.
- Preserve plot-relevant events, character choices, emotional shifts, decisions, consequences, conflicts, promises, boundary negotiations.
- Exclude flavor-only content unless it affects future behavior.
- Normalize to past-tense, third-person.
- Focus on cause → intention → reaction → consequence chains.
- Do NOT output this unified story.

STEP 2 — IDENTIFY STORY ARCS
- From the unified story, extract arcs that begin when a meaningful shift occurs in:
  relationship dynamics; emotional vulnerability; intimacy or distance; conflict/reconciliation; routine/ritual changes; boundaries/negotiations; logistical shifts (travel, location, communication); any event with lasting consequences.
- Ensure each arc is self-contained and represents a significant movement.

STEP 3 — ARC OBJECTS (fill arcs[] in JSON)
For each arc, fill fields as follows:

title:
- 3–6 words, descriptive of the arc’s core.

summary:
- The entire “Summary Content Structure” below must appear inside this single string (use headings and bullets as plain text).
- Keep total length 5–15% of the combined text for the arc’s memories.
- Do not include OOC/meta or filler.

Summary Content Structure (must be followed inside summary string):

# [Arc Title]
Time period: What timeframe the arc covers (e.g. "March 3–10, 2024", "Week of July 15, 2023")

Arc Premise: One sentence describing what this arc is about.

## Major Beats
- 3–7 bullets capturing the major plot movements of this arc
- Focus on cause → effect logic
- Include only plot-affecting events

## Character Dynamics
- 1–2 paragraphs describing how the characters’ emotions, motives, boundaries, or relationship changed
- Include subtext, tension shifts, power exchange changes, new trust/vulnerabilities, or new conflicts
- Include silent implications if relevant

## Key Exchanges
- Up to 8 short, exact quotes
- Only include dialogue that materially shifted tone, emotion, or relationship dynamics

## Outcome & Continuity
- 4–8 bullets capturing:
  - decisions
  - promises
  - new emotional states
  - new routines/rituals
  - injuries or physical changes
  - foreshadowed future events
  - unresolved threads
  - permanent consequences

STEP 4 — KEYWORDS
- Provide 15–30 standalone retrieval keywords in keywords[] per arc.

MUST:
- Concrete nouns, physical objects, places, proper nouns, distinctive actions, or memorable scene elements
- Each keyword = ONE concept only
- Each keyword must be retrievable if mentioned ALONE
- Use ONLY nouns or noun-phrases

MUST NOT:
- No narrative/summary keywords (“start of affair”, “argument resolved”)
- No emotional/abstract words (intimacy, vulnerability, trust, jealousy, dominance, submission, aftercare, connection, longing, etc.)
- No multi-fact keywords (“Denver airport Lyft ride and call”)
- No themes or vibes

Examples of valid keywords:
- Four Seasons bar
- Macallan 25
- private elevator
- Aston Martin
- CPAP machine
- Gramercy Tavern
- yuzu soda
- satellite map
- Life360 app
- marble desk
- “pack for forever”
- “dick-measuring contest”

Classification of non-fitting memories:
- If a memory obviously belongs to a later arc, is unrelated, flavor-only with no continuity impact, duplicates, or conflicts with PREVIOUS ARC chronology, put it in unassigned_memories with a short reason.

JSON-only:
- Return only the JSON object described above.
- No markdown fences, no commentary, no system prompts, no extra text.`,STMemoryBooks_ArcPrompt_Alternate:`You are an expert narrative analyst and memory-engine assistant.
Your task is to take multiple scene summaries (of varying detail and formatting), normalize them, reconstruct the full chronology, and output a single memory arc entry in JSON. The arc must be token-efficient and plot-accurate.

You will receive input in this exact format:
- An optional PREVIOUS ARC block, which is canon and must not be rewritten.
- A MEMORIES block containing entries formatted as:
  [ID] | ORDER
  Full text of the memory (may span multiple paragraphs)

Strict output format (JSON only; no markdown, no prose outside JSON):
{
  "arcs": [
    {
      "title": "Short descriptive arc title (3–6 words)",
      "summary": "Structured arc summary as a single string (see Summary Content Structure below).",
      "keywords": ["keyword1", "keyword2", "..."],
      "member_ids": ["<ID from MEMORIES>", "..."]  // optional: IDs of memories that belong to this arc
    }
  ],
  "unassigned_memories": [
    { "id": "memory-id", "reason": "Brief explanation of why this memory does not fit the produced arcs." }
  ]
}

Notes:
- Respect chronology using ORDER (ascending).
- If some memories do not fit the arc, place them in unassigned_memories with a short reason.

Do not repeat text from PREVIOUS ARC. Treat it as canon; continue consequences only if relevant in the new memories.

PROCESS

STEP 1 — UNIFIED STORY (internal only)
- Combine ALL memories into a single chronological retelling.
- Ignore OOC/meta content.
- Preserve plot-relevant events, character choices, emotional shifts, decisions, consequences, conflicts, promises, boundary negotiations.
- Exclude flavor-only content unless it affects future behavior.
- Normalize to past-tense, third-person.
- Focus on cause → intention → reaction → consequence chains.
- Do NOT output this unified story.

STEP 2 — IDENTIFY STORY ARCS
- From the unified story, identify a self-contained arc that represents a significant narrative movement.

STEP 3 — ARC OBJECTS (fill arcs[] in JSON)
For the story arc, fill fields as follows:

title:
- 3–6 words, descriptive of the arc’s core.

summary:
- The entire "Summary Content Structure" below must appear inside this single string (use headings and bullets as plain text).
- Keep total length 5–15% of the combined text for the arc’s memories.
- Do not include OOC/meta or filler.

Summary Content Structure (must be followed inside summary string):

# [Arc Title]
Time period: What timeframe the arc covers (e.g. "March 3–10, 2024", "Week of July 15, 2023")

Arc Premise: One sentence describing what this arc is about.

## Major Beats
- 3–7 bullets capturing the major plot movements of this arc
- Focus on cause → effect logic
- Include only plot-affecting events

## Character Dynamics
- 1–2 paragraphs describing how the characters’ emotions, motives, boundaries, or relationship changed
- Include subtext, tension shifts, power exchange changes, new trust/vulnerabilities, or new conflicts
- Include silent implications if relevant

## Key Exchanges
- Up to 8 short, exact quotes
- Only include dialogue that materially shifted tone, emotion, or relationship dynamics

## Outcome & Continuity
- 4–8 bullets capturing:
  - decisions
  - promises
  - new emotional states
  - new routines/rituals
  - injuries or physical changes
  - foreshadowed future events
  - unresolved threads
  - permanent consequences

STEP 4 — KEYWORDS
- Provide 15–30 standalone retrieval keywords in keywords[] per arc.

MUST:
- Concrete nouns, physical objects, places, proper nouns, distinctive actions, or memorable scene elements
- Each keyword = ONE concept only
- Each keyword must be retrievable if mentioned ALONE
- Use ONLY nouns or noun-phrases

MUST NOT:
- No narrative/summary keywords (“start of affair”, “argument resolved”)
- No emotional/abstract words (intimacy, vulnerability, trust, jealousy, dominance, submission, aftercare, connection, longing, etc.)
- No multi-fact keywords (“Denver airport Lyft ride and call”)
- No themes or vibes

Examples of valid keywords:
- Four Seasons bar
- Macallan 25
- private elevator
- Aston Martin
- CPAP machine
- Gramercy Tavern
- yuzu soda
- satellite map
- Life360 app
- marble desk
- “pack for forever”
- “dick-measuring contest”

Classification of non-fitting memories:
- If a memory obviously belongs to a later arc, is unrelated, flavor-only with no continuity impact, duplicates, or conflicts with PREVIOUS ARC chronology, put it in unassigned_memories with a short reason.

JSON-only:
- Return only the JSON object described above.
- No markdown fences, no commentary, no system prompts, no extra text.`,STMemoryBooks_ArcPrompt_Tiny:`You specialize in compressing many small memories into compact, coherent story arcs. Combine the memories below — and the previous arc if provided — into a single arc that captures the main narrative through-lines.

Return JSON only:
{ "arcs": [ { "title": "...", "summary": "...", "keywords": ["..."], "member_ids": ["<ID>", "..."] } ], "unassigned_memories": [ { "id": "...", "reason": "..." } ] }

Rules:
- 5–15% length compression
- Focus on plot, emotional progression, decisions, conflicts, continuity
- Identify non-fitting items in unassigned_memories with a brief reason
- No quotes, no OOC, no commentary outside JSON`,"chatcompile.errors.sceneMarkersRequired":"Scene markers are required for compilation","chatcompile.errors.startGreaterThanEnd":"Start marker cannot be greater than end marker","chatcompile.errors.outOfBounds":"Scene markers ({{start}}-{{end}}) are out of chat bounds (0-{{max}})","chatcompile.errors.noVisibleInRange":"No visible messages found in range {{start}}-{{end}}. All messages may be hidden or missing.","chatcompile.validation.errors.missingMetadata":"Missing metadata object","chatcompile.validation.errors.invalidMessagesArray":"Missing or invalid messages array","chatcompile.validation.warnings.noMessages":"No messages in compiled scene","chatcompile.validation.warnings.messageMissingId":"Message at index {{index}} missing ID","chatcompile.validation.warnings.messageMissingName":"Message at index {{index}} missing speaker name","chatcompile.validation.warnings.messageMissingContent":"Message at index {{index}} missing content","chatcompile.validation.warnings.veryLargeScene":"Very large scene (>100 messages) - consider breaking into smaller segments","chatcompile.readable.headerMetadata":"=== SCENE METADATA ===","chatcompile.readable.range":"Range: Messages {{start}}-{{end}}","chatcompile.readable.chat":"Chat: {{chatId}}","chatcompile.readable.character":"Character: {{name}}","chatcompile.readable.compiled":"Compiled: {{count}} messages","chatcompile.readable.compiledAt":"Compiled at: {{date}}","chatcompile.readable.headerMessages":"=== SCENE MESSAGES ===","chatcompile.readable.line":"[{{id}}] {{name}}: {{text}}","chatcompile.defaults.user":"User","confirmationPopup.toast.title":"STMemoryBooks","confirmationPopup.log.saveFailed":"STMemoryBooks-ConfirmationPopup: Failed to save profile:","confirmationPopup.log.saveCancelledNoName":"STMemoryBooks-ConfirmationPopup: Profile creation cancelled - no name provided","confirmationPopup.log.validationFailedEmptyName":"STMemoryBooks-ConfirmationPopup: Profile name validation failed - empty name","confirmationPopup.log.invalidMemoryResult":"STMemoryBooks-ConfirmationPopup: Invalid memoryResult passed to showMemoryPreviewPopup","confirmationPopup.log.invalidSceneData":"STMemoryBooks-ConfirmationPopup: Invalid sceneData passed to showMemoryPreviewPopup","confirmationPopup.log.invalidProfileSettings":"STMemoryBooks-ConfirmationPopup: Invalid profileSettings passed to showMemoryPreviewPopup","confirmationPopup.log.sceneDataMissingProps":"STMemoryBooks-ConfirmationPopup: sceneData missing required numeric properties","confirmationPopup.log.popupNotAvailable":"STMemoryBooks-ConfirmationPopup: Popup element not available for reading edited values","confirmationPopup.log.inputsNotFound":"STMemoryBooks-ConfirmationPopup: Required input elements not found in popup","confirmationPopup.log.titleValidationFailed":"STMemoryBooks-ConfirmationPopup: Memory title validation failed - empty title","confirmationPopup.log.contentValidationFailed":"STMemoryBooks-ConfirmationPopup: Memory content validation failed - empty content","confirmationPopup.log.previewError":"STMemoryBooks-ConfirmationPopup: Error showing memory preview popup:","index.warn.getEffectivePromptAsync":"STMemoryBooks: getEffectivePromptAsync fallback due to error:","index.error.chatContainerNotFound":"STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.","index.error.processingChatElements":"STMemoryBooks: Error processing new chat elements:","index.error.updatingButtonStates":"STMemoryBooks: Error updating button states:","index.log.chatObserverInitialized":"STMemoryBooks: Chat observer initialized","index.log.chatObserverDisconnected":"STMemoryBooks: Chat observer disconnected","index.log.chatChanged":"STMemoryBooks: Chat changed - updating scene state","index.error.processingMessagesAfterChange":"STMemoryBooks: Error processing messages after chat change:","index.log.foundOrphanedMarkers":"STMemoryBooks: Found orphaned scene markers on chat load (start: {{start}}, end: {{end}})","index.error.handleMessageReceived":"STMemoryBooks: Error in handleMessageReceived:","index.error.handleGroupWrapperFinished":"STMemoryBooks: Error in handleGroupWrapperFinished:","index.error.noSceneMarkersForCreate":"STMemoryBooks: No scene markers set for createMemory command","index.toast.title":"STMemoryBooks","index.error.nextMemoryFailed":"STMemoryBooks: /nextmemory failed:","index.warn.sidePromptCacheRefreshFailed":"STMemoryBooks: side prompt cache refresh failed","index.log.addedDynamicProfile":"STMemoryBooks: Added dynamic profile for existing installation (migration to v3)","index.log.removedStaticTitleFormat":"STMemoryBooks: Removed static titleFormat from dynamic profile","index.log.createdDynamicProfile":"STMemoryBooks: Created dynamic profile for fresh installation","index.log.appliedProfileFixes":"STMemoryBooks: Applied profile fixes:","index.warn.mutualExclusion":"STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false","index.log.migratingV2":"STMemoryBooks: Migrating to JSON-based architecture (v2)","index.log.updatingProfileToJSON":'STMemoryBooks: Updating profile "{{name}}" to use JSON output',STMemoryBooks_Slash_CreateMemory_Help:"Create memory from marked scene",STMemoryBooks_Slash_SceneMemory_Help:"Set scene range and create memory (e.g., /scenememory 10-15)",STMemoryBooks_Slash_SceneMemory_ArgRangeDesc:"Message range (X-Y format)",STMemoryBooks_Slash_NextMemory_Help:"Create memory from end of last memory to current message",STMemoryBooks_Slash_SidePrompt_Help:'Run side prompt (no args opens picker). Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_Slash_SidePrompt_ArgDesc:"Template name (quote if contains spaces), optionally followed by X-Y range",STMemoryBooks_Slash_SidePromptOn_Help:'Enable a Side Prompt by name or all. Usage: /sideprompt-on "Name" | all',STMemoryBooks_Slash_SidePromptOn_ArgDesc:'Template name (quote if contains spaces) or "all"',STMemoryBooks_Slash_SidePromptOff_Help:'Disable a Side Prompt by name or all. Usage: /sideprompt-off "Name" | all',STMemoryBooks_Slash_SidePromptOff_ArgDesc:'Template name (quote if contains spaces) or "all"',STMemoryBooks_SidePromptToggle_MissingName:'Missing name. Usage: /sideprompt-on "Name" | /sideprompt-off "Name" | all',STMemoryBooks_Prompt_summary:`You are a talented summarist skilled at capturing scenes from stories comprehensively. Analyze the following roleplay scene and return a detailed memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Detailed beat-by-beat summary in narrative prose...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a detailed beat-by-beat summary in narrative prose. First, note the dates/time. Then capture this scene accurately without losing ANY important information EXCEPT FOR [OOC] conversation/interaction. All [OOC] conversation/interaction is not useful for summaries.
This summary will go in a vectorized database, so include:
- All important story beats/events that happened
- Key interaction highlights and character developments
- Notable details, memorable quotes, and revelations
- Outcome and anything else important for future interactions between {{user}} and {{char}}
Capture ALL nuance without repeating verbatim. Make it comprehensive yet digestible.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords for vectorized database retrieval. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,STMemoryBooks_Prompt_summarize:`Analyze the following roleplay scene and return a structured summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Detailed summary with markdown headers...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a detailed bullet-point summary using markdown with these headers (but skip and ignore all OOC conversation/interaction):
- **Timeline**: Day/time this scene covers.
- **Story Beats**: List all important plot events and story developments that occurred.
- **Key Interactions**: Describe the important character interactions, dialogue highlights, and relationship developments.
- **Notable Details**: Mention any important objects, settings, revelations, or details that might be relevant for future interactions.
- **Outcome**: Summarize the result, resolution, or state of affairs at the end of the scene.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords that would help a vectorized database find this conversation again if something is mentioned. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Ensure you capture ALL important information - comprehensive detail is more important than brevity.

Return ONLY the JSON, no other text.`,STMemoryBooks_Prompt_synopsis:`Analyze the following roleplay scene and return a comprehensive synopsis as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Long detailed synopsis with markdown structure...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a long and detailed beat-by-beat summary using markdown structure. Capture the most recent scene accurately without losing ANY information. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded. Use this structure:
# [Scene Title]
**Timeline**: (day/time)
## Story Beats
- (List all important plot events and developments)
## Key Interactions
- (Detail all significant character interactions and dialogue)
## Notable Details
- (Include memorable quotes, revelations, objects, settings)
## Outcome
- (Describe results, resolutions, and final state)

Include EVERYTHING important for future interactions between {{user}} and {{char}}. Capture all nuance without regurgitating verbatim.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords for vectorized database retrieval. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,STMemoryBooks_Prompt_sumup:`Analyze the following roleplay scene and return a beat summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Comprehensive beat summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, write a comprehensive beat summary that captures this scene completely. Format it as:
# Scene Summary - Day X - [Title]
First note the dates/time covered by the scene. Then narrate ALL important story beats/events that happened, key interaction highlights, notable details, memorable quotes, character developments, and outcome. Ensure no important information is lost. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded.

For the keywords field, provide 15-30 specific, descriptive, relevant keywords that would help a vectorized database find this summary again if mentioned. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,STMemoryBooks_Prompt_minimal:`Analyze the following roleplay scene and return a minimal memory entry as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Brief 2-5 sentence summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, provide a very brief 2-5 sentence summary of what happened in this scene. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded.

For the keywords field, generate 15-30 specific, descriptive, highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,STMemoryBooks_Prompt_northgate:`You are a memory archivist for a long-form narrative. Your function is to analyze the provided scene and extract all pertinent information into a structured JSON object.

You must respond with ONLY valid JSON in this exact format:
{
"title": "Concise Scene Title (3-5 words)",
"content": "A detailed, literary summary of the scene written in a third-person, past-tense narrative style. Capture all key actions, emotional shifts, character development, and significant dialogue. Focus on "showing" what happened through concrete details. Ensure the summary is comprehensive enough to serve as a standalone record of the scene's events and their impact on the characters.",
"keywords": ["keyword1", "keyword2", "keyword3"]
}

For the "content" field, write with literary quality. Do not simply list events; synthesize them into a coherent narrative block.

For the "keywords" field, provide 15-30 specific and descriptive keywords that capture the scene's core elements. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON object, with no additional text or explanations.`,STMemoryBooks_Prompt_aelemar:`You are a meticulous archivist, skilled at accurately capturing all key plot points and memories from a story. Analyze the following story scene and extract a detailed summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Concise scene title (3-5 words)",
  "content": "Detailed summary of key plot points and character memories, beat-by-beat in narrative prose...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a beat-by-beat summary in narrative prose. Capture all key plot points that advance the story and character memories that leave a lasting impression, ensuring nothing essential is omitted. This summary will go in a vectorized database, so include:

- Story beats, events, actions and consequences, turning points, and outcomes
- Key character interactions, character developments, significant dialogue, revelations, emotional impact, and relationships
- Outcomes and anything else important for future interactions between the user and the world
Capture ALL nuance without repeating verbatim. Do not simply list events; synthesize them into a coherent narrative block. This summary must be comprehensive enough to serve as a standalone record of the story so far, even if the original text is lost. Use at least 300 words. Avoid redundancy.

For the keywords field, provide 15-30 specific and descriptive keywords that capture the scene's core elements. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,STMemoryBooks_Prompt_comprehensive:`Analyze the following roleplay scene in the context of previous summaries provided (if available) and return a comprehensive synopsis as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short, descriptive scene title (3-6 words)",
  "content": "Long detailed synopsis with markdown structure...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a beat-by-beat summary of the scene that *replaces reading the full scene* while preserving all plot-relevant nuance and reads like a clean, structured scene log — concise yet complete. This summary needs to be token-efficient: exercise judgment as to whether or not an interaction is flavor-only or truly affects the plot. Flavor scenes (interaction detail that does not advance plot) may be captured through key exchanges and should be skipped when recording story beats.

Write in **past tense**, **third-person**, and exclude all [OOC] or meta discussion.
Use concrete nouns (e.g., “rice cooker” > “appliance”).
Only use adjectives/adverbs when they materially affect tone, emotion, or characterization.
Focus on **cause → intention → reaction → consequence** chains for clarity and compression.

# [Scene Title]
**Timeline**: (day/time)

## Story Beats
- Present all major actions, revelations, and emotional or magical shifts in order.
- Capture clear cause–effect logic: what triggered what, and why it mattered.
- Only include plot-affecting interactions and do not capture flavor-only beats.

## Character Dynamics
- Summarize how each character’s **motives, emotions, and relationships** evolved.
- Include subtext, tension, or silent implications.
- Highlight key beats of conflict, vulnerability, trust, or power shifts.

## Key Exchanges
- Include only pivotal dialogue that defines tone, emotion, or change.
- Attribute speakers by name; keep quotes short but exact.
- BE SELECTIVE. Maximum of 8 quotes.

## Outcome & Continuity
- Detail resulting **decisions, emotional states, physical/magical effects, or narrative consequences**.
- Include all elements that influence future continuity (knowledge, relationships, injuries, promises, etc.).
- Note any unresolved threads or foreshadowed elements.

Write compactly but completely — every line should add new information or insight.
Synthesize redundant actions or dialogue into unified cause–effect–emotion beats.
Favor compression over coverage whenever the two conflict; omit anything that can be inferred from context or established characterization.

For the keywords field:

Generate **15–30 standalone topical keywords** that function as retrieval tags, not micro-summaries.
Keywords must be:
- **Concrete and scene-specific** (locations, objects, proper nouns, unique actions, repeated motifs).
- **One concept per keyword** — do NOT combine multiple ideas into one keyword.
- **Useful for retrieval if the user later mentions that noun or action alone**, not only in a specific context.
- Not {{char}}'s or {{user}}'s names.
- **Not thematic, emotional, or abstract.** Stop-list: intimacy, vulnerability, trust, dominance, submission, power dynamics, boundaries, jealousy, aftercare, longing, consent, emotional connection.

Avoid:
- Overly specific compound keywords (“David Tokyo marriage”).
- Narrative or plot-summary style keywords (“art dealer date fail”).
- Keywords that contain multiple facts or descriptors.
- Keywords that only make sense when the whole scene is remembered.

Prefer:
- Proper nouns (e.g., "Chinatown", "Ritz-Carlton bar").
- Specific physical objects ("CPAP machine", "chocolate chip cookies").
- Distinctive actions ("cookie baking", "piano apology").
- Unique phrases or identifiers from the scene used by characters ("pack for forever", "dick-measuring contest").

Your goal: **keywords should fire when the noun/action is mentioned alone**, not only when paired with a specific person or backstory.

Return ONLY the JSON — no additional text.`,STMemoryBooks_Prompt_default:`Analyze the following chat scene and return a memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Concise memory focusing on key plot points, character development, and important interactions",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY the JSON, no other text.`,STMemoryBooks_DisplayName_summary:"Summary - Detailed beat-by-beat summaries in narrative prose",STMemoryBooks_DisplayName_summarize:"Summarize - Bullet-point format",STMemoryBooks_DisplayName_synopsis:"Synopsis - Long and comprehensive (beats, interactions, details) with headings",STMemoryBooks_DisplayName_sumup:"Sum Up - Concise story beats in narrative prose",STMemoryBooks_DisplayName_minimal:"Minimal - Brief 1-2 sentence summary",STMemoryBooks_DisplayName_northgate:"Northgate - Intended for creative writing. By Northgate on ST Discord",STMemoryBooks_DisplayName_aelemar:"Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord",STMemoryBooks_DisplayName_comprehensive:"Comprehensive - Synopsis plus improved keywords extraction",STMemoryBooks_PromptManager_RecreateBuiltins:"♻️ Recreate Built-in Prompts",STMemoryBooks_RecreateBuiltinsTitle:"Recreate Built-in Prompts",STMemoryBooks_RecreateBuiltinsWarning:"This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",STMemoryBooks_RecreateArcBuiltinsWarning:"This will remove overrides for all built‑in presets (multi-arc, single, tiny). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom:"This does not affect your other custom presets.",STMemoryBooks_RecreateBuiltinsOverwrite:"Overwrite",STMemoryBooks_RegexSelection_Title:"\uD83D\uDCD0 Regex selection",STMemoryBooks_RegexSelection_Desc:"Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.",STMemoryBooks_RegexSelection_Outgoing:"Run regex before sending to AI",STMemoryBooks_RegexSelection_Incoming:"Run regex before adding to lorebook (before previews)",STMemoryBooks_RegexSelect_PlaceholderOutgoing:"Select outgoing regex…",STMemoryBooks_RegexSelect_PlaceholderIncoming:"Select incoming regex…",STMemoryBooks_RegexSelectionsSaved:"Regex selections saved",STMemoryBooks_FailedToSaveRegexSelections:"Failed to save regex selections",STMemoryBooks_UseRegexAdvanced:"Use regex (advanced)",STMemoryBooks_ConfigureRegex:"\uD83D\uDCD0 Configure regex…"},f1={en:nG};import{getRegexScripts as B7}from"../../../extensions/regex/engine.js";import"../../../../lib/select2.min.js";async function O7(Z){try{if(Z?.prompt&&String(Z.prompt).trim())return Z.prompt;if(Z?.preset)return await G1(Z.preset)}catch(Q){console.warn(U("STMemoryBooks: getEffectivePromptAsync fallback due to error:","index.warn.getEffectivePromptAsync"),Q)}return d0()}async function $$(){return String(q4())}function W5(){return N0}var j0="STMemoryBooks",z7=!1;var A7={moduleSettings:{alwaysUseDefault:!0,showMemoryPreviews:!1,showNotifications:!0,unhideBeforeMemory:!1,refreshEditor:!0,tokenWarningThreshold:50000,defaultMemoryCount:0,autoClearSceneAfterMemory:!1,manualModeEnabled:!1,allowSceneOverlap:!1,autoHideMode:"all",unhiddenEntriesCount:2,autoSummaryEnabled:!1,autoSummaryInterval:50,autoSummaryBuffer:2,autoCreateLorebook:!1,lorebookNameTemplate:"LTM - {{char}} - {{chat}}",useRegex:!1,selectedRegexOutgoing:[],selectedRegexIncoming:[]},titleFormat:"[000] - {{title}}",profiles:[],defaultProfile:0,migrationVersion:4},m=null,N0=!1,oZ=!1,C6=null,X7=!1,d8=null,m1=null,p1=null,u1=null,B1=null,d1=null;var O1=null,c8=null;function J$(Z){let Q=[];if(Z.matches&&Z.matches("#chat .mes[mesid]")){if(!Z.querySelector(".mes_stmb_start"))s8(Z),Q.push(Z)}else if(Z.querySelectorAll)Z.querySelectorAll("#chat .mes[mesid]").forEach((J)=>{if(!J.querySelector(".mes_stmb_start"))s8(J),Q.push(J)});return Q}function W$(){if(O1)O1.disconnect(),O1=null;let Z=document.getElementById("chat");if(!Z)throw Error(U("STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.","index.error.chatContainerNotFound"));let Q=X4();if(!Q||Q.start===null&&Q.end===null)r8();O1=new MutationObserver((G)=>{let J=[];for(let W of G)for(let q of W.addedNodes)if(q.nodeType===Node.ELEMENT_NODE)try{let Y=J$(q);J.push(...Y)}catch(Y){console.error(U("STMemoryBooks: Error processing new chat elements:","index.error.processingChatElements"),Y)}if(J.length>0)clearTimeout(c8),c8=setTimeout(()=>{try{Y4(J)}catch(W){console.error(U("STMemoryBooks: Error updating button states:","index.error.updatingButtonStates"),W)}},b6.CHAT_OBSERVER_DEBOUNCE_MS)}),O1.observe(Z,{childList:!0,subtree:!0}),console.log(U("STMemoryBooks: Chat observer initialized","index.log.chatObserverInitialized"))}function q$(){if(O1)O1.disconnect(),O1=null,console.log(U("STMemoryBooks: Chat observer disconnected","index.log.chatObserverDisconnected"));if(c8)clearTimeout(c8),c8=null}function Y$(){console.log(U("STMemoryBooks: Chat changed - updating scene state","index.log.chatChanged")),r8(),N7(),setTimeout(()=>{try{R7()}catch(Z){console.error(U("STMemoryBooks: Error processing messages after chat change:","index.error.processingMessagesAfterChange"),Z)}},b6.CHAT_OBSERVER_DEBOUNCE_MS)}function N7(){let Z=f()||{},{sceneStart:Q,sceneEnd:G}=Z;if(Q!==null||G!==null){if(console.log(S`Found orphaned scene markers: start=${Q}, end=${G}`),!N0&&p[j0].moduleSettings.autoSummaryEnabled)t1()}}async function z$(){try{setTimeout(r1,E0.VALIDATION_DELAY_MS),await $5(),await EZ()}catch(Z){console.error(U("STMemoryBooks: Error in handleMessageReceived:","index.error.handleMessageReceived"),Z)}}async function X$(){try{setTimeout(r1,E0.VALIDATION_DELAY_MS),await J5(),await EZ()}catch(Z){console.error(U("STMemoryBooks: Error in handleGroupWrapperFinished:","index.error.handleGroupWrapperFinished"),Z)}}async function V$(Z,Q){if(!await I8())return console.error(U("STMemoryBooks: No scene markers set for createMemory command","index.error.noSceneMarkersForCreate")),toastr.error(U("No scene markers set. Use chevron buttons to mark start and end points first.","STMemoryBooks_NoSceneMarkersToastr"),U("STMemoryBooks","index.toast.title")),"";return P6(),""}async function K$(Z,Q){let G=String(Q||"").trim();if(!G)return toastr.error(U("Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_MissingRangeArgument"),U("STMemoryBooks","index.toast.title")),"";let J=G.match(/^(\d+)\s*[-–—]\s*(\d+)$/);if(!J)return toastr.error(U("Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_InvalidFormat"),U("STMemoryBooks","index.toast.title")),"";let W=Number(J[1]),q=Number(J[2]);if(!Number.isFinite(W)||!Number.isFinite(q))return toastr.error(U("Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_InvalidMessageIDs"),U("STMemoryBooks","index.toast.title")),"";if(W>q)return toastr.error(U("Start message cannot be greater than end message","STMemoryBooks_StartGreaterThanEnd"),U("STMemoryBooks","index.toast.title")),"";let Y=H7;if(W<0||q>=Y.length)return toastr.error(S`Message IDs out of range. Valid range: 0-${Y.length-1}`,U("STMemoryBooks","index.toast.title")),"";if(!Y[W]||!Y[q])return toastr.error(U("One or more specified messages do not exist","STMemoryBooks_MessagesDoNotExist"),U("STMemoryBooks","index.toast.title")),"";y6(W,q);let z=Y8(),K=z.isGroupChat?` in group "${z.groupName}"`:"";return toastr.info(S`Scene set: messages ${W}-${q}${K}`,U("STMemoryBooks","index.toast.title")),P6(),""}async function j$(Z,Q){try{if(N0)return toastr.info(U("Memory creation is already in progress","STMemoryBooks_MemoryAlreadyInProgress"),U("STMemoryBooks","index.toast.title")),"";let G=await eZ();if(!G.valid)return toastr.error(U("No lorebook available: "+G.error,"STMemoryBooks_NoLorebookAvailable"),U("STMemoryBooks","index.toast.title")),"";let J=f()||{},W=H7.length-1;if(W<0)return toastr.info(U("There are no messages to summarize yet.","STMemoryBooks_NoMessagesToSummarize"),U("STMemoryBooks","index.toast.title")),"";let q=typeof J.highestMemoryProcessed==="number"?J.highestMemoryProcessed:null,Y=q===null?0:q+1,z=W;if(Y>z)return toastr.info(U("No new messages since the last memory.","STMemoryBooks_NoNewMessagesSinceLastMemory"),U("STMemoryBooks","index.toast.title")),"";y6(Y,z),await P6()}catch(G){console.error(U("STMemoryBooks: /nextmemory failed:","index.error.nextMemoryFailed"),G),toastr.error(U("Failed to run /nextmemory: "+G.message,"STMemoryBooks_NextMemoryFailed"),U("STMemoryBooks","index.toast.title"))}return""}async function F$(Z,Q){let G=String(Q||"").trim();if(!G)return toastr.info(U('SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',"STMemoryBooks_SidePromptGuide"),U("STMemoryBooks","index.toast.title")),"";let J=G.match(/^["']([^"']+)["']\s*(.*)$/)||G.match(/^(.+?)(\s+\d+\s*[-–—]\s*\d+)?$/),W=J?(J[1]||G).trim():G;try{let Y=(await X1()).filter((z)=>z.name.toLowerCase().includes(W.toLowerCase()));if(Y.length>1){let z=Y.slice(0,5).map((X)=>X.name).join(", "),K=Y.length>5?`, +${Y.length-5} more`:"";return toastr.info(S`Multiple matches: ${z}${K}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]`,U("STMemoryBooks","index.toast.title")),""}return yZ(G)}catch{return yZ(G)}}async function D7(Z,Q,G){let J=String(Q||"").trim();if(!J)return toastr.error(U(G?'Missing name. Use: /sideprompt-on "Name" OR /sideprompt-on all':'Missing name. Use: /sideprompt-off "Name" OR /sideprompt-off all',"STMemoryBooks_SidePromptToggle_MissingName"),U("STMemoryBooks","index.toast.title")),"";try{let{findTemplateByName:W,upsertTemplate:q,listTemplates:Y}=await Promise.resolve().then(() => (S8(),h5));if(J.toLowerCase()==="all"){let K=await Y(),X=0;for(let V of K)if(V.enabled!==G)await q({key:V.key,enabled:G}),X++;try{window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"))}catch(V){}return toastr.success(S`${G?"Enabled":"Disabled"} ${X} side prompt${X===1?"":"s"}`,U("STMemoryBooks","index.toast.title")),""}let z=await W(J);if(!z)return toastr.error(S`Side Prompt not found: ${J}`,U("STMemoryBooks","index.toast.title")),"";if(z.enabled===G)return toastr.info(S`"${z.name}" is already ${G?"enabled":"disabled"}`,U("STMemoryBooks","index.toast.title")),"";await q({key:z.key,enabled:G});try{window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"))}catch(K){}toastr.success(S`${G?"Enabled":"Disabled"} "${z.name}"`,U("STMemoryBooks","index.toast.title"))}catch(W){console.error("STMemoryBooks: sideprompt enable/disable failed:",W),toastr.error(S`Failed to toggle side prompt: ${W.message}`,U("STMemoryBooks","index.toast.title"))}return""}async function U$(Z,Q){return D7(Z,Q,!0)}async function H$(Z,Q){return D7(Z,Q,!1)}var T7=[];async function tZ(){try{T7=(await X1()||[]).filter((Q)=>{let G=Q?.triggers?.commands;if(!("commands"in(Q?.triggers||{})))return!0;return Array.isArray(G)&&G.some((J)=>String(J).toLowerCase()==="sideprompt")}).map((Q)=>Q.name)}catch(Z){console.warn(U("STMemoryBooks: side prompt cache refresh failed","index.warn.sidePromptCacheRefreshFailed"),Z)}}window.addEventListener("stmb-sideprompts-updated",tZ);try{tZ()}catch(Z){}var nZ=()=>T7.map((Z)=>new rZ(Z));function C0(){if(p.STMemoryBooks=p.STMemoryBooks||q8(A7),(p.STMemoryBooks.migrationVersion??1)<4){if(!p.STMemoryBooks.profiles?.some((W)=>W?.isBuiltinCurrentST||W?.useDynamicSTSettings||W?.connection?.api==="current_st"&&W?.name==="Current SillyTavern Settings")){if(!p.STMemoryBooks.profiles)p.STMemoryBooks.profiles=[];let W={name:"Current SillyTavern Settings",isBuiltinCurrentST:!0,connection:{api:"current_st"},preset:"summary",constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0};if(p.STMemoryBooks.profiles.unshift(W),p.STMemoryBooks.defaultProfile!==void 0)p.STMemoryBooks.defaultProfile+=1;console.log(S`${j0}: Added dynamic profile for existing installation (migration to v3)`)}p.STMemoryBooks.profiles.forEach((W)=>{if(W.useDynamicSTSettings&&W.titleFormat)delete W.titleFormat,console.log(S`${j0}: Removed static titleFormat from dynamic profile`)}),p.STMemoryBooks.migrationVersion=4,s()}if(!p.STMemoryBooks.profiles||p.STMemoryBooks.profiles.length===0){let J={name:"Current SillyTavern Settings",isBuiltinCurrentST:!0,connection:{api:"current_st"},preset:"summary",constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0};p.STMemoryBooks.profiles=[J],console.log(S`${j0}: Created dynamic profile for fresh installation`)}let Q=B$(p.STMemoryBooks),G=FZ(p.STMemoryBooks);if(G.fixes.length>0)console.log(S`${j0}: Applied profile fixes:`,G.fixes),s();return Q}function B$(Z){if(!Z.profiles||Z.profiles.length===0)Z.profiles=[],Z.defaultProfile=0;if(Z.defaultProfile>=Z.profiles.length)Z.defaultProfile=0;if(!Z.moduleSettings)Z.moduleSettings=q8(A7.moduleSettings);if(!Z.moduleSettings.tokenWarningThreshold||Z.moduleSettings.tokenWarningThreshold<1000)Z.moduleSettings.tokenWarningThreshold=30000;if(Z.moduleSettings.defaultMemoryCount=K0(Z.moduleSettings.defaultMemoryCount??0,0,7),Z.moduleSettings.unhiddenEntriesCount===void 0||Z.moduleSettings.unhiddenEntriesCount===null)Z.moduleSettings.unhiddenEntriesCount=2;if(Z.moduleSettings.autoSummaryEnabled===void 0)Z.moduleSettings.autoSummaryEnabled=!1;if(Z.moduleSettings.autoSummaryInterval===void 0||Z.moduleSettings.autoSummaryInterval<10)Z.moduleSettings.autoSummaryInterval=100;if(Z.moduleSettings.autoSummaryBuffer=K0(Z.moduleSettings.autoSummaryBuffer??0,0,50),Z.moduleSettings.autoCreateLorebook===void 0)Z.moduleSettings.autoCreateLorebook=!1;if(Z.moduleSettings.unhideBeforeMemory===void 0)Z.moduleSettings.unhideBeforeMemory=!1;if(!Z.moduleSettings.lorebookNameTemplate)Z.moduleSettings.lorebookNameTemplate="LTM - {{char}} - {{chat}}";if(Z.moduleSettings.manualModeEnabled&&Z.moduleSettings.autoCreateLorebook)Z.moduleSettings.autoCreateLorebook=!1,console.warn(U("STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false","index.warn.mutualExclusion"));if(!Z.migrationVersion||Z.migrationVersion<2)console.log(S`${j0}: Migrating to JSON-based architecture (v2)`),Z.migrationVersion=2,Z.profiles.forEach((Q)=>{if(Q.prompt&&Q.prompt.includes("createMemory"))console.log(S`${j0}: Updating profile "${Q.name}" to use JSON output`),Q.prompt=d0()});return Z}async function eZ(Z=!1){let Q=p.STMemoryBooks,G=await z8();if(!Z){if(!G&&Q?.moduleSettings?.autoCreateLorebook&&!Q?.moduleSettings?.manualModeEnabled){let J=Q.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",W=await j6(J,"chat");if(W.success)G=W.name;else return{valid:!1,error:W.error}}}if(!G)return{valid:!1,error:"No lorebook available or selected."};if(!h6||!h6.includes(G))return{valid:!1,error:`Selected lorebook "${G}" not found.`};try{let J=await aG(G);return{valid:!!J,data:J,name:G}}catch(J){return{valid:!1,error:"Failed to load the selected lorebook."}}}async function O$(Z,Q,G=null){let J=C0(),W=J.moduleSettings.tokenWarningThreshold??30000,q=!J.moduleSettings.alwaysUseDefault||Z.estimatedTokens>W,Y=null;if(q){let X=G!==null?G:J.defaultProfile;if(Y=await D5(Z,J,Q0(),o(),c1,X),!Y.confirmed)return null}else{let X=J.profiles[J.defaultProfile];Y={confirmed:!0,profileSettings:{...X,effectivePrompt:await O7(X)},advancedOptions:{memoryCount:K0(J.moduleSettings.defaultMemoryCount??0,0,7),overrideSettings:!1}}}let{profileSettings:z,advancedOptions:K}=Y;if(z?.connection?.api==="current_st"||K.overrideSettings){let X=o(),V=Q0();if(z.effectiveConnection={api:X.completionSource||"openai",model:V.model||"",temperature:V.temperature??0.7},z.useDynamicSTSettings)console.log("STMemoryBooks: Using dynamic ST settings profile - current settings:",z.effectiveConnection);else console.log("STMemoryBooks: Using current SillyTavern settings override for memory creation")}else z.effectiveConnection={...z.connection},console.log("STMemoryBooks: Using profile connection settings for memory creation");return{profileSettings:z,summaryCount:K.memoryCount??0,tokenThreshold:W,settings:J}}function A$(Z){if(Z&&Z.name==="AIResponseError"){if(typeof Z.recoverable==="boolean")return Z.recoverable;if(Z.code&&String(Z.code).toUpperCase().includes("TRUNCATION"))return!0}if(["TokenWarningError","InvalidProfileError"].includes(Z?.name))return!1;if(Z?.message&&(Z.message.includes("Scene compilation failed")||Z.message.includes("Invalid memory result")||Z.message.includes("Invalid lorebook")))return!1;return!0}async function aZ(Z,Q,G,J=0){let{profileSettings:W,summaryCount:q,tokenThreshold:Y,settings:z}=G;C6=W;let K=null,X=null,V=null;try{if(z?.moduleSettings?.convertExistingRecursion&&Q?.valid&&Q.data?.entries){let j=U8(Q.data)||[],O=j.length>0?j[0].entry:null,H=!!W.preventRecursion,A=!!W.delayUntilRecursion,B=!1;if(!O)B=!1;else{let D=!!O.preventRecursion,T=!!O.delayUntilRecursion;B=D!==H||T!==A}if(B){let D=0,T=0,L=Object.values(Q.data.entries||{});for(let P of L)if(P&&P.stmemorybooks===!0){D++;let x=P.preventRecursion!==H,w=P.delayUntilRecursion!==A;if(x||w)P.preventRecursion=H,P.delayUntilRecursion=A,T++}if(T>0){try{if(await tG(Q.name,Q.data,!0),z.moduleSettings?.refreshEditor)try{eG(Q.name)}catch(P){}}catch(P){console.warn("STMemoryBooks: Failed to save lorebook during recursion conversion:",P)}try{toastr.info(S`Updated recursion flags on ${T} of ${D} memory entr${T===1?"y":"ies"}`,"STMemoryBooks")}catch(P){}}}}}catch(j){console.warn("STMemoryBooks: convertExistingRecursion check failed:",j)}let F=i8.MAX_RETRIES;try{let j=Q8(Z.sceneStart,Z.sceneEnd);K=Z8(j);let O=C4(K);if(!O.valid)throw Error(`Scene compilation failed: ${O.errors.join(", ")}`);let H=[];if(X={summaries:[],actualCount:0,requestedCount:0},q>0)if(X=await x1(q,z,c1),H=X.summaries,X.actualCount>0){if(X.actualCount<X.requestedCount)toastr.warning(S`Only ${X.actualCount} of ${X.requestedCount} requested memories available`,"STMemoryBooks");console.log(`STMemoryBooks: Including ${X.actualCount} previous memories as context`)}else toastr.warning(U("No previous memories found in lorebook","STMemoryBooks_NoPreviousMemoriesFound"),"STMemoryBooks");let A;if(J>0)A=`Retrying memory creation (attempt ${J+1}/${F+1})...`;else A=X.actualCount>0?`Creating memory with ${X.actualCount} context memories...`:"Creating memory...";toastr.info(S`${A}`,"STMemoryBooks",{timeOut:0}),K.previousSummariesContext=H,V=await w4(K);let B=V?.estimatedTokens,D=await n4(K,W,{tokenWarningThreshold:Y}),T=D;if(z.moduleSettings.showMemoryPreviews){toastr.clear();let w=await O8(D,Z,W);if(w.action==="cancel")return;else if(w.action==="retry"){let h=J>=F?J-F:0;if(h>=3)return toastr.warning(S`Maximum retry attempts (${3}) reached`,"STMemoryBooks"),{action:"cancel"};toastr.info(S`Retrying memory generation (${h+1}/${3})...`,"STMemoryBooks");let u=Math.max(J+1,F+h+1);return await aZ(Z,Q,G,u)}if(w.action==="accept")T=D;else if(w.action==="edit"){if(!w.memoryData){console.error("STMemoryBooks: Edit action missing memoryData"),toastr.error(U("Unable to retrieve edited memory data","STMemoryBooks_UnableToRetrieveEditedMemoryData"),"STMemoryBooks");return}if(!w.memoryData.extractedTitle||!w.memoryData.content){console.error("STMemoryBooks: Edited memory data missing required fields"),toastr.error(U("Edited memory data is incomplete","STMemoryBooks_EditedMemoryDataIncomplete"),"STMemoryBooks");return}T=w.memoryData}else console.warn(`STMemoryBooks: Unexpected preview action: ${w.action}`),T=D}let L=await zZ(T,Q);if(!L.success)throw Error(L.error||"Failed to add memory to lorebook");try{let w=W?.effectiveConnection||W?.connection||{};console.debug("STMemoryBooks: Passing profile to runAfterMemory",{api:w.api,model:w.model,temperature:w.temperature}),await bZ(K,W)}catch(w){console.warn("STMemoryBooks: runAfterMemory failed:",w)}try{let w=f()||{};w.highestMemoryProcessed=Z.sceneEnd,Z0()}catch(w){console.warn("STMemoryBooks: Failed to update highestMemoryProcessed baseline:",w)}KZ();let P=X.actualCount>0?` (with ${X.actualCount} context ${X.actualCount===1?"memory":"memories"})`:"";toastr.clear(),m1=null,d8=null,p1=null;let x=J>0?` (succeeded on attempt ${J+1})`:"";toastr.success(S`Memory "${L.entryTitle}" created successfully${P}${x}!`,"STMemoryBooks")}catch(j){if(console.error("STMemoryBooks: Error creating memory:",j),J<F&&A$(j))return toastr.warning(S`Memory creation failed (attempt ${J+1}). Retrying in ${Math.round(i8.RETRY_DELAY_MS/1000)} seconds...`,"STMemoryBooks",{timeOut:3000}),await new Promise((B)=>setTimeout(B,i8.RETRY_DELAY_MS)),await aZ(Z,Q,G,J+1);let H=J>0?` (failed after ${J+1} attempts)`:"",A=j&&j.code?` [${j.code}]`:"";if(j.name==="TokenWarningError")toastr.error(S`Scene is too large (${j.tokenCount} tokens). Try selecting a smaller range${H}.`,"STMemoryBooks",{timeOut:8000});else if(j.name==="AIResponseError"){try{toastr.clear(m1)}catch(B){}d8=j,p1={sceneData:Z,compiledScene:K,profileSettings:W,lorebookValidation:Q,memoryFetchResult:X,sceneStats:V,settings:z,summaryCount:q,tokenThreshold:Y,sceneRange:K?.metadata?.sceneStart!==void 0?`${K.metadata.sceneStart}-${K.metadata.sceneEnd}`:`${Z.sceneStart}-${Z.sceneEnd}`},m1=toastr.error(S`AI failed to generate valid memory${A}: ${j.message}${H}`,"STMemoryBooks",{timeOut:0,extendedTimeOut:0,closeButton:!0,tapToDismiss:!1,onclick:()=>{try{g$(d8)}catch(B){console.error(B)}}})}else if(j.name==="InvalidProfileError")toastr.error(S`Profile configuration error: ${j.message}${H}`,"STMemoryBooks",{timeOut:8000});else toastr.error(S`Failed to create memory: ${j.message}${H}`,"STMemoryBooks")}}async function P6(Z=null){let Q=Y8();if(!Q.isGroupChat){if(!iZ||iZ.length===0||!iZ[sG]){toastr.error(U("SillyTavern is still loading character data, please wait a few seconds and try again.","STMemoryBooks_LoadingCharacterData"),"STMemoryBooks");return}}else if(!Q.groupId||!Q.groupName){toastr.error(U("Group chat data not available, please wait a few seconds and try again.","STMemoryBooks_GroupChatDataUnavailable"),"STMemoryBooks");return}if(N0)return;N0=!0;try{let G=C0();if(G?.moduleSettings?.unhideBeforeMemory){let X=f()||{};if(X.sceneStart!==null&&X.sceneEnd!==null)try{await rG(`/unhide ${X.sceneStart}-${X.sceneEnd}`)}catch(V){console.warn("STMemoryBooks: /unhide command failed or unavailable:",V)}}let J=await I8();if(!J){console.error("STMemoryBooks: No scene selected for memory initiation"),toastr.error(U("No scene selected","STMemoryBooks_NoSceneSelected"),"STMemoryBooks"),N0=!1;return}let W=await eZ();if(!W.valid){console.error("STMemoryBooks: Lorebook validation failed:",W.error),toastr.error(U(W.error,"STMemoryBooks_LorebookValidationError"),"STMemoryBooks"),N0=!1;return}let q=U8(W.data),Y=J.sceneStart,z=J.sceneEnd;if(!G.moduleSettings.allowSceneOverlap)for(let X of q){let V=e4(X.entry);if(V&&V.start!==null&&V.end!==null){let F=Number(V.start),j=Number(V.end),O=Number(Y),H=Number(z);if(console.debug(`STMemoryBooks: OverlapCheck new=[${O}-${H}] existing="${X.title}" [${F}-${j}] cond1(ns<=e)=${O<=j} cond2(ne>=s)=${H>=F}`),O<=j&&H>=F){console.error(`STMemoryBooks: Scene overlap detected with memory: ${X.title} [${F}-${j}] vs new [${O}-${H}]`),toastr.error(S`Scene overlaps with existing memory: "${X.title}" (messages ${F}-${j})`,"STMemoryBooks"),N0=!1;return}}}let K=await O$(J,W,Z);if(!K){N0=!1;return}if(m)m.completeCancelled(),m=null;await aZ(J,W,K)}catch(G){console.error("STMemoryBooks: Critical error during memory initiation:",G),toastr.error(S`An unexpected error occurred: ${G.message}`,"STMemoryBooks")}finally{N0=!1}}function M6(Z){if(Z.autoHideMode)return Z.autoHideMode;if(Z.autoHideAllMessages)return"all";else if(Z.autoHideLastMemory)return"last";else return"none"}function V7(){let Z=p.STMemoryBooks;if(!Z)return;let Q=f()||{},G=Z.moduleSettings.manualModeEnabled,J=document.querySelector("#stmb-mode-badge");if(J)J.textContent=G?U("Manual","STMemoryBooks_Manual"):U("Automatic (Chat-bound)","STMemoryBooks_AutomaticChatBound");let W=document.querySelector("#stmb-active-lorebook");if(W){let V=G?Q.manualLorebook:c1?.[p8];W.textContent=V||U("None selected","STMemoryBooks_NoneSelected"),W.className=V?"":"opacity50p"}let q=document.querySelector("#stmb-manual-controls");if(q)q.style.display=G?"block":"none";let Y=document.querySelector("#stmb-automatic-info");if(Y){Y.style.display=G?"none":"block";let V=Y.querySelector("small");if(V){let F=c1?.[p8]??null;V.innerHTML=F?S`Using chat-bound lorebook "<strong>${F}</strong>"`:U("No chat-bound lorebook. Memories will require lorebook selection.","STMemoryBooks_NoChatBoundLorebook")}}let z=document.querySelector("#stmb-auto-create-lorebook"),K=document.querySelector("#stmb-manual-mode-enabled"),X=document.querySelector("#stmb-lorebook-name-template");if(z&&K){let V=Z.moduleSettings.autoCreateLorebook;if(z.disabled=G,K.disabled=V,X)X.disabled=!V}}function v6(){if(!m?.dlg)return;let Z=C0(),Q=f()||{},G=m.content.querySelector("#stmb-manual-lorebook-buttons"),J=m.content.querySelector("#stmb-profile-buttons"),W=m.content.querySelector("#stmb-extra-function-buttons"),q=m.content.querySelector("#stmb-prompt-manager-buttons");if(G&&Z.moduleSettings.manualModeEnabled){let X=Q.manualLorebook??null,V=[{text:`\uD83D\uDCD5 ${X?U("Change","STMemoryBooks_ChangeManualLorebook"):U("Select","STMemoryBooks_SelectManualLorebook")} `+U("Manual Lorebook","STMemoryBooks_ManualLorebook"),id:"stmb-select-manual-lorebook",action:async()=>{try{if(await _1(X?Q.manualLorebook:null))Q1()}catch(F){console.error("STMemoryBooks: Error selecting manual lorebook:",F),toastr.error(U("Failed to select manual lorebook","STMemoryBooks_FailedToSelectManualLorebook"),"STMemoryBooks")}}}];if(X)V.push({text:"❌ "+U("Clear Manual Lorebook","STMemoryBooks_ClearManualLorebook"),id:"stmb-clear-manual-lorebook",action:()=>{try{let F=f()||{};delete F.manualLorebook,Z0(),Q1(),toastr.success(U("Manual lorebook cleared","STMemoryBooks_ManualLorebookCleared"),"STMemoryBooks")}catch(F){console.error("STMemoryBooks: Error clearing manual lorebook:",F),toastr.error(U("Failed to clear manual lorebook","STMemoryBooks_FailedToClearManualLorebook"),"STMemoryBooks")}}});G.innerHTML="",V.forEach((F)=>{let j=document.createElement("div");j.className="menu_button interactable whitespacenowrap",j.id=F.id,j.textContent=F.text,j.addEventListener("click",F.action),G.appendChild(j)})}if(!J||!W)return;let Y=[{text:"⭐ "+U("Set as Default","STMemoryBooks_SetAsDefault"),id:"stmb-set-default-profile",action:()=>{let X=m?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let V=K0(J0(X,Z.defaultProfile??0),0,Z.profiles.length-1);if(V===Z.defaultProfile)return;Z.defaultProfile=V,s();let F=Z.profiles[V]?.isBuiltinCurrentST?U("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):Z.profiles[V].name;toastr.success(S`"${F}" is now the default profile.`,"STMemoryBooks"),Q1()}},{text:"✏️ "+U("Edit Profile","STMemoryBooks_EditProfile"),id:"stmb-edit-profile",action:async()=>{try{let X=m?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let V=K0(J0(X,Z.defaultProfile??0),0,Z.profiles.length-1),F=Z.profiles[V];if(F.useDynamicSTSettings)F.connection=F.connection||{},F.connection.api="current_st",delete F.useDynamicSTSettings,s();await X5(Z,V,Q1)}catch(X){console.error(`${j0}: Error in edit profile:`,X),toastr.error(U("Failed to edit profile","STMemoryBooks_FailedToEditProfile"),"STMemoryBooks")}}},{text:"➕ "+U("New Profile","STMemoryBooks_NewProfile"),id:"stmb-new-profile",action:async()=>{try{await V5(Z,Q1)}catch(X){console.error(`${j0}: Error in new profile:`,X),toastr.error(U("Failed to create profile","STMemoryBooks_FailedToCreateProfile"),"STMemoryBooks")}}},{text:"\uD83D\uDDD1️ "+U("Delete Profile","STMemoryBooks_DeleteProfile"),id:"stmb-delete-profile",action:async()=>{try{let X=m?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let V=J0(X,Z.defaultProfile??0);await K5(Z,V,Q1)}catch(X){console.error(`${j0}: Error in delete profile:`,X),toastr.error(U("Failed to delete profile","STMemoryBooks_FailedToDeleteProfile"),"STMemoryBooks")}}}],z=[{text:"\uD83D\uDCE4 "+U("Export Profiles","STMemoryBooks_ExportProfiles"),id:"stmb-export-profiles",action:()=>{try{j5(Z)}catch(X){console.error(`${j0}: Error in export profiles:`,X),toastr.error(U("Failed to export profiles","STMemoryBooks_FailedToExportProfiles"),"STMemoryBooks")}}},{text:"\uD83D\uDCE5 "+U("Import Profiles","STMemoryBooks_ImportProfiles"),id:"stmb-import-profiles",action:()=>{let X=m?.dlg?.querySelector("#stmb-import-file");if(X)X.click()}}],K=[{text:"\uD83E\uDDE9 "+U("Summary Prompt Manager","STMemoryBooks_SummaryPromptManager"),id:"stmb-prompt-manager",action:async()=>{try{await l1()}catch(X){console.error(`${j0}: Error opening prompt manager:`,X),toastr.error(U("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}},{text:"\uD83E\uDDF1 "+U("Arc Prompt Manager","STMemoryBooks_ArcPromptManager"),id:"stmb-arc-prompt-manager",action:async()=>{try{await o1()}catch(X){console.error(`${j0}: Error opening Arc Prompt Manager:`,X),toastr.error(U("Failed to open Arc Prompt Manager","STMemoryBooks_FailedToOpenArcPromptManager"),"STMemoryBooks")}}},{text:"\uD83C\uDFA1 "+U("Trackers & Side Prompts","STMemoryBooks_SidePrompts"),id:"stmb-side-prompts",action:async()=>{try{await f5()}catch(X){console.error(`${j0}: Error opening Trackers & Side Prompts Manager:`,X),toastr.error(U("Failed to open Trackers & Side Prompts Manager","STMemoryBooks_FailedToOpenSidePrompts"),"STMemoryBooks")}}}];J.innerHTML="",W.innerHTML="",q.innerHTML="",Y.forEach((X)=>{let V=document.createElement("div");V.className="menu_button interactable whitespacenowrap",V.id=X.id,V.textContent=X.text,V.addEventListener("click",X.action),J.appendChild(V)}),z.forEach((X)=>{let V=document.createElement("div");V.className="menu_button interactable whitespacenowrap",V.id=X.id,V.textContent=X.text,V.addEventListener("click",X.action),W.appendChild(V)}),K.forEach((X)=>{let V=document.createElement("div");V.className="menu_button interactable whitespacenowrap",V.id=X.id,V.textContent=X.text,V.addEventListener("click",X.action),q.appendChild(V)})}async function l1(){try{let Z=p.STMemoryBooks;await J8(Z);let Q=await T1(),G='<h3 data-i18n="STMemoryBooks_PromptManager_Title">\uD83E\uDDE9 Summary Prompt Manager</h3>';G+='<div class="world_entry_form_control">',G+='<p data-i18n="STMemoryBooks_PromptManager_Desc">Manage your summary generation prompts. All presets are editable.</p>',G+="</div>",G+='<div class="world_entry_form_control">',G+='<input type="text" id="stmb-prompt-search" class="text_pole" placeholder="Search presets..." aria-label="Search presets" data-i18n="[placeholder]STMemoryBooks_PromptManager_Search;[aria-label]STMemoryBooks_PromptManager_Search" />',G+="</div>",G+='<div id="stmb-preset-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',G+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',G+='<button id="stmb-pm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_New">➕ New Preset</button>',G+='<button id="stmb-pm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Export">\uD83D\uDCE4 Export JSON</button>',G+='<button id="stmb-pm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Import">\uD83D\uDCE5 Import JSON</button>',G+='<button id="stmb-pm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_RecreateBuiltins">♻️ Recreate Built-in Prompts</button>',G+='<button id="stmb-pm-apply" class="menu_button whitespacenowrap" disabled data-i18n="STMemoryBooks_PromptManager_ApplyToProfile">✅ Apply to Selected Profile</button>',G+="</div>",G+=`<small>${U(`\uD83D\uDCA1 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don't change the "respond with JSON" instructions, \uD83D\uDCD5Memory Books uses that to process the returned result from the AI.`,"STMemoryBooks_PromptManager_Hint")}</small>`,G+='<input type="file" id="stmb-pm-import-file" accept=".json" style="display: none;" />';let J=new $0(G,r.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")});N$(J);let W=J.dlg?.querySelector("#stmb-preset-list");if(W){let q=(Q||[]).map((Y)=>({key:String(Y.key||""),displayName:String(Y.displayName||"")}));W.innerHTML=i1.sanitize(pZ({items:q}))}await J.show()}catch(Z){console.error("STMemoryBooks: Error showing prompt manager:",Z),toastr.error(U("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}function N$(Z){let Q=Z.dlg,G=null;Q.addEventListener("click",async(W)=>{let q=W.target.closest(".stmb-action");if(q){W.preventDefault(),W.stopPropagation();let z=q.closest("tr[data-preset-key]"),K=z?.dataset.presetKey;if(!K)return;if(Q.querySelectorAll("tr[data-preset-key]").forEach((V)=>{V.classList.remove("ui-state-active"),V.style.backgroundColor="",V.style.border=""}),z)z.style.backgroundColor="var(--cobalt30a)",z.style.border="",G=K;let X=Q.querySelector("#stmb-pm-apply");if(X)X.disabled=!1;if(q.classList.contains("stmb-action-edit"))await K7(Z,K);else if(q.classList.contains("stmb-action-duplicate"))await j7(Z,K);else if(q.classList.contains("stmb-action-delete"))await F7(Z,K);return}let Y=W.target.closest("tr[data-preset-key]");if(Y){Q.querySelectorAll("tr[data-preset-key]").forEach((K)=>{K.classList.remove("ui-state-active"),K.style.backgroundColor="",K.style.border=""}),Y.style.backgroundColor="var(--cobalt30a)",Y.style.border="",G=Y.dataset.presetKey;let z=Q.querySelector("#stmb-pm-apply");if(z)z.disabled=!1}});let J=Q.querySelector("#stmb-prompt-search");if(J)J.addEventListener("input",(W)=>{let q=W.target.value.toLowerCase();Q.querySelectorAll("tr[data-preset-key]").forEach((Y)=>{let z=Y.querySelector("td:first-child").textContent.toLowerCase();Y.style.display=z.includes(q)?"":"none"})});Q.querySelector("#stmb-pm-new")?.addEventListener("click",async()=>{await D$(Z)}),Q.querySelector("#stmb-pm-edit")?.addEventListener("click",async()=>{if(G)await K7(Z,G)}),Q.querySelector("#stmb-pm-duplicate")?.addEventListener("click",async()=>{if(G)await j7(Z,G)}),Q.querySelector("#stmb-pm-delete")?.addEventListener("click",async()=>{if(G)await F7(Z,G)}),Q.querySelector("#stmb-pm-export")?.addEventListener("click",async()=>{await T$()}),Q.querySelector("#stmb-pm-import")?.addEventListener("click",()=>{Q.querySelector("#stmb-pm-import-file")?.click()}),Q.querySelector("#stmb-pm-import-file")?.addEventListener("change",async(W)=>{await R$(W,Z)}),Q.querySelector("#stmb-pm-recreate-builtins")?.addEventListener("click",async()=>{try{let W=`
                <h3>${b(U("Recreate Built-in Prompts","STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${b(U("This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.","STMemoryBooks_RecreateBuiltinsWarning"))}
                </div>
                <p class="opacity70p">${b(U("This does not affect your other custom presets.","STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;if(await new $0(W,r.CONFIRM,"",{okButton:U("Overwrite","STMemoryBooks_RecreateBuiltinsOverwrite"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()===i.AFFIRMATIVE){let z=await A4("overwrite");try{window.dispatchEvent(new CustomEvent("stmb-presets-updated"))}catch(K){}toastr.success(S`Removed ${z?.removed||0} built-in overrides`,U("STMemoryBooks","index.toast.title")),Z.completeAffirmative(),await l1()}}catch(W){console.error("STMemoryBooks: Error recreating built-in prompts:",W),toastr.error(U("Failed to recreate built-in prompts","STMemoryBooks_FailedToRecreateBuiltins"),U("STMemoryBooks","index.toast.title"))}}),Q.querySelector("#stmb-pm-apply")?.addEventListener("click",async()=>{if(!G){toastr.error(U("Select a preset first","STMemoryBooks_SelectPresetFirst"),"STMemoryBooks");return}let W=p?.STMemoryBooks;if(!W||!Array.isArray(W.profiles)||W.profiles.length===0){toastr.error(U("No profiles available","STMemoryBooks_NoProfilesAvailable"),"STMemoryBooks");return}let q=W.defaultProfile??0;if(m?.dlg){let z=m.dlg.querySelector("#stmb-profile-select");if(z)q=J0(z,W.defaultProfile??0)}let Y=W.profiles[q];if(!Y){toastr.error(U("Selected profile not found","STMemoryBooks_SelectedProfileNotFound"),"STMemoryBooks");return}if(Y.prompt&&Y.prompt.trim())if(await new $0('<h3 data-i18n="STMemoryBooks_ClearCustomPromptTitle">Clear Custom Prompt?</h3><p data-i18n="STMemoryBooks_ClearCustomPromptDesc">This profile has a custom prompt. Clear it so the selected preset is used?</p>',r.CONFIRM,"",{okButton:U("Clear and Apply","STMemoryBooks_ClearAndApply"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()===i.AFFIRMATIVE)Y.prompt="";else return;if(Y.preset=G,s(),toastr.success(U("Preset applied to profile","STMemoryBooks_PresetAppliedToProfile"),"STMemoryBooks"),m?.dlg)try{Q1()}catch(z){}})}async function D$(Z){let G=new $0(`
        <h3 data-i18n="STMemoryBooks_CreateNewPresetTitle">Create New Preset</h3>
        <div class="world_entry_form_control">
            <label for="stmb-pm-new-display-name">
                <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                <input type="text" id="stmb-pm-new-display-name" class="text_pole" data-i18n="[placeholder]STMemoryBooks_MyCustomPreset" placeholder="My Custom Preset" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-pm-new-prompt">
                <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-pm-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-pm-new-prompt" class="text_pole textarea_compact" rows="10" data-i18n="[placeholder]STMemoryBooks_EnterPromptPlaceholder" placeholder="Enter your prompt here..."></textarea>
            </label>
        </div>
    `,r.TEXT,"",{okButton:U("Create","STMemoryBooks_Create"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await G.show()===i.AFFIRMATIVE){let W=G.dlg.querySelector("#stmb-pm-new-display-name").value.trim(),q=G.dlg.querySelector("#stmb-pm-new-prompt").value.trim();if(!q){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}try{await w8(null,q,W||null),toastr.success(U("Preset created successfully","STMemoryBooks_PresetCreatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await l1()}catch(Y){console.error("STMemoryBooks: Error creating preset:",Y),toastr.error(U("Failed to create preset","STMemoryBooks_FailedToCreatePreset"),"STMemoryBooks")}}}async function K7(Z,Q){try{let G=await m6(Q),J=await G1(Q),W=`
            <h3 data-i18n="STMemoryBooks_EditPresetTitle">Edit Preset</h3>
            <div class="world_entry_form_control">
                <label for="stmb-pm-edit-display-name">
                    <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                    <input type="text" id="stmb-pm-edit-display-name" class="text_pole" value="${b(G)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-pm-edit-prompt">
                    <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-pm-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-pm-edit-prompt" class="text_pole textarea_compact" rows="10">${b(J)}</textarea>
                </label>
            </div>
        `,q=new $0(W,r.TEXT,"",{okButton:U("Save","STMemoryBooks_Save"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await q.show()===i.AFFIRMATIVE){let z=q.dlg.querySelector("#stmb-pm-edit-display-name").value.trim(),K=q.dlg.querySelector("#stmb-pm-edit-prompt").value.trim();if(!K){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}await w8(Q,K,z||null),toastr.success(U("Preset updated successfully","STMemoryBooks_PresetUpdatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await l1()}}catch(G){console.error("STMemoryBooks: Error editing preset:",G),toastr.error(U("Failed to edit preset","STMemoryBooks_FailedToEditPreset"),"STMemoryBooks")}}async function j7(Z,Q){try{let G=await U4(Q);toastr.success(U("Preset duplicated successfully","STMemoryBooks_PresetDuplicatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await l1()}catch(G){console.error("STMemoryBooks: Error duplicating preset:",G),toastr.error(U("Failed to duplicate preset","STMemoryBooks_FailedToDuplicatePreset"),"STMemoryBooks")}}async function F7(Z,Q){let G=await m6(Q),J=new $0(`<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${b(U('Are you sure you want to delete "{{name}}"?',"STMemoryBooks_DeletePresetConfirm",{name:G}))}</p>`,r.CONFIRM,"",{okButton:U("Delete","STMemoryBooks_Delete"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});try{D8(J.dlg)}catch(q){}if(await J.show()===i.AFFIRMATIVE)try{await H4(Q),toastr.success(U("Preset deleted successfully","STMemoryBooks_PresetDeletedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await l1()}catch(q){console.error("STMemoryBooks: Error deleting preset:",q),toastr.error(U("Failed to delete preset","STMemoryBooks_FailedToDeletePreset"),"STMemoryBooks")}}async function T$(){try{let Z=await B4(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-summary-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(U("Prompts exported successfully","STMemoryBooks_PromptsExportedSuccessfully"),"STMemoryBooks")}catch(Z){console.error("STMemoryBooks: Error exporting prompts:",Z),toastr.error(U("Failed to export prompts","STMemoryBooks_FailedToExportPrompts"),"STMemoryBooks")}}async function R$(Z,Q){let G=Z.target.files[0];if(!G)return;try{let J=await G.text();await O4(J),toastr.success(U("Prompts imported successfully","STMemoryBooks_PromptsImportedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Q.completeAffirmative(),await l1()}catch(J){console.error("STMemoryBooks: Error importing prompts:",J),toastr.error(S`Failed to import prompts: ${J.message}`,"STMemoryBooks")}}async function o1(){try{let Z=p.STMemoryBooks;await uZ(Z);let Q=await R6(),G='<h3 data-i18n="STMemoryBooks_ArcPromptManager_Title">\uD83E\uDDF1 Arc Prompt Manager</h3>';G+='<div class="world_entry_form_control">',G+='<p data-i18n="STMemoryBooks_ArcPromptManager_Desc">Manage your Arc Analysis prompts. All presets are editable.</p>',G+="</div>",G+='<div class="world_entry_form_control">',G+='<input type="text" id="stmb-apm-search" class="text_pole" placeholder="Search arc presets..." aria-label="Search arc presets" data-i18n="[placeholder]STMemoryBooks_ArcPromptManager_Search;[aria-label]STMemoryBooks_ArcPromptManager_Search" />',G+="</div>",G+='<div id="stmb-apm-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',G+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',G+='<button id="stmb-apm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_New">➕ New Arc Preset</button>',G+='<button id="stmb-apm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Export">\uD83D\uDCE4 Export JSON</button>',G+='<button id="stmb-apm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Import">\uD83D\uDCE5 Import JSON</button>',G+='<button id="stmb-apm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_RecreateBuiltins">♻️ Recreate Built-in Arc Prompts</button>',G+="</div>",G+='<input type="file" id="stmb-apm-import-file" accept=".json" style="display: none;" />';let J=new $0(G,r.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")});_$(J);let W=J.dlg?.querySelector("#stmb-apm-list");if(W){let q=(Q||[]).map((Y)=>({key:String(Y.key||""),displayName:String(Y.displayName||"")}));W.innerHTML=i1.sanitize(pZ({items:q}))}await J.show()}catch(Z){console.error("STMemoryBooks: Error showing Arc Prompt Manager:",Z),toastr.error(U("Failed to open Arc Prompt Manager","STMemoryBooks_FailedToOpenArcPromptManager"),"STMemoryBooks")}}function _$(Z){let Q=Z.dlg,G=null;Q.addEventListener("click",async(J)=>{let W=J.target.closest(".stmb-action");if(W){J.preventDefault(),J.stopPropagation();let Y=W.closest("tr[data-preset-key]"),z=Y?.dataset.presetKey;if(!z)return;if(Q.querySelectorAll("tr[data-preset-key]").forEach((K)=>{K.classList.remove("ui-state-active"),K.style.backgroundColor="",K.style.border=""}),Y)Y.style.backgroundColor="var(--cobalt30a)",Y.style.border="",G=z;if(W.classList.contains("stmb-action-edit"))await L$(Z,z);else if(W.classList.contains("stmb-action-duplicate"))await w$(Z,z);else if(W.classList.contains("stmb-action-delete"))await C$(Z,z);return}let q=J.target.closest("tr[data-preset-key]");if(q)Q.querySelectorAll("tr[data-preset-key]").forEach((Y)=>{Y.classList.remove("ui-state-active"),Y.style.backgroundColor="",Y.style.border=""}),q.style.backgroundColor="var(--cobalt30a)",q.style.border="",G=q.dataset.presetKey}),Q.querySelector("#stmb-apm-search")?.addEventListener("input",(J)=>{let W=J.target.value.toLowerCase();Q.querySelectorAll("tr[data-preset-key]").forEach((q)=>{let Y=q.querySelector("td:first-child").textContent.toLowerCase();q.style.display=Y.includes(W)?"":"none"})}),Q.querySelector("#stmb-apm-new")?.addEventListener("click",async()=>{await I$(Z)}),Q.querySelector("#stmb-apm-export")?.addEventListener("click",async()=>{await h$()}),Q.querySelector("#stmb-apm-import")?.addEventListener("click",()=>{Q.querySelector("#stmb-apm-import-file")?.click()}),Q.querySelector("#stmb-apm-import-file")?.addEventListener("change",async(J)=>{await M$(J,Z)}),Q.querySelector("#stmb-apm-recreate-builtins")?.addEventListener("click",async()=>{try{let J=`
                <h3>${b(U("Recreate Built-in Prompts","STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${b(U("This will remove overrides for all built‑in presets (multi-arc, single, tiny). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.","STMemoryBooks_RecreateArcBuiltinsWarning"))}
                </div>
                <p class="opacity70p">${b(U("This does not affect your other custom presets.","STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;if(await new $0(J,r.CONFIRM,"",{okButton:U("Overwrite","STMemoryBooks_RecreateBuiltinsOverwrite"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()===i.AFFIRMATIVE){let Y=await o5("overwrite");try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch(z){}toastr.success(S`Removed ${Y?.removed||0} built-in overrides`,U("STMemoryBooks","index.toast.title")),Z.completeAffirmative(),await o1()}}catch(J){console.error("STMemoryBooks: Error recreating built-in arc prompts:",J),toastr.error(U("Failed to recreate built-in prompts","STMemoryBooks_FailedToRecreateBuiltins"),U("STMemoryBooks","index.toast.title"))}})}async function I$(Z){let G=new $0(`
        <h3 data-i18n="STMemoryBooks_CreateNewPresetTitle">Create New Preset</h3>
        <div class="world_entry_form_control">
            <label for="stmb-apm-new-display-name">
                <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                <input type="text" id="stmb-apm-new-display-name" class="text_pole" data-i18n="[placeholder]STMemoryBooks_MyCustomPreset" placeholder="My Custom Preset" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-apm-new-prompt">
                <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-apm-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-apm-new-prompt" class="text_pole textarea_compact" rows="10" data-i18n="[placeholder]STMemoryBooks_EnterPromptPlaceholder" placeholder="Enter your prompt here..."></textarea>
            </label>
        </div>
    `,r.TEXT,"",{okButton:U("Create","STMemoryBooks_Create"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await G.show()===i.AFFIRMATIVE){let W=G.dlg.querySelector("#stmb-apm-new-display-name").value.trim(),q=G.dlg.querySelector("#stmb-apm-new-prompt").value.trim();if(!q){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}try{await dZ(null,q,W||null),toastr.success(U("Preset created successfully","STMemoryBooks_PresetCreatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await o1()}catch(Y){console.error("STMemoryBooks: Error creating arc preset:",Y),toastr.error(U("Failed to create preset","STMemoryBooks_FailedToCreatePreset"),"STMemoryBooks")}}}async function L$(Z,Q){try{let G=await mZ(Q),J=await _6(Q),W=`
            <h3 data-i18n="STMemoryBooks_EditPresetTitle">Edit Preset</h3>
            <div class="world_entry_form_control">
                <label for="stmb-apm-edit-display-name">
                    <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                    <input type="text" id="stmb-apm-edit-display-name" class="text_pole" value="${b(G)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-apm-edit-prompt">
                    <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-apm-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-apm-edit-prompt" class="text_pole textarea_compact" rows="10">${b(J)}</textarea>
                </label>
            </div>
        `,q=new $0(W,r.TEXT,"",{okButton:U("Save","STMemoryBooks_Save"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await q.show()===i.AFFIRMATIVE){let z=q.dlg.querySelector("#stmb-apm-edit-display-name").value.trim(),K=q.dlg.querySelector("#stmb-apm-edit-prompt").value.trim();if(!K){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}await dZ(Q,K,z||null),toastr.success(U("Preset updated successfully","STMemoryBooks_PresetUpdatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await o1()}}catch(G){console.error("STMemoryBooks: Error editing arc preset:",G),toastr.error(U("Failed to edit preset","STMemoryBooks_FailedToEditPreset"),"STMemoryBooks")}}async function w$(Z,Q){try{let G=await c5(Q);toastr.success(U("Preset duplicated successfully","STMemoryBooks_PresetDuplicatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await o1()}catch(G){console.error("STMemoryBooks: Error duplicating arc preset:",G),toastr.error(U("Failed to duplicate preset","STMemoryBooks_FailedToDuplicatePreset"),"STMemoryBooks")}}async function C$(Z,Q){let G=await mZ(Q),J=new $0(`<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${b(U('Are you sure you want to delete "{{name}}"?',"STMemoryBooks_DeletePresetConfirm",{name:G}))}</p>`,r.CONFIRM,"",{okButton:U("Delete","STMemoryBooks_Delete"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});try{D8(J.dlg)}catch(q){}if(await J.show()===i.AFFIRMATIVE)try{await p5(Q),toastr.success(U("Preset deleted successfully","STMemoryBooks_PresetDeletedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await o1()}catch(q){console.error("STMemoryBooks: Error deleting arc preset:",q),toastr.error(U("Failed to delete preset","STMemoryBooks_FailedToDeletePreset"),"STMemoryBooks")}}async function h$(){try{let Z=await i5(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-arc-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(U("Prompts exported successfully","STMemoryBooks_PromptsExportedSuccessfully"),"STMemoryBooks")}catch(Z){console.error("STMemoryBooks: Error exporting arc prompts:",Z),toastr.error(U("Failed to export prompts","STMemoryBooks_FailedToExportPrompts"),"STMemoryBooks")}}async function M$(Z,Q){let G=Z.target.files[0];if(!G)return;try{let J=await G.text();await l5(J),toastr.success(U("Prompts imported successfully","STMemoryBooks_PromptsImportedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Q.completeAffirmative(),await o1()}catch(J){console.error("STMemoryBooks: Error importing arc prompts:",J),toastr.error(S`Failed to import prompts: ${J.message}`,"STMemoryBooks")}}async function v$(){try{let Z=await eZ(!0),Q=Z?.name||null,G=Z?.data||{entries:{}};if(!Z?.valid||!Q)toastr.info("No memory lorebook currently assigned, no memories found.","SillyTavern Memory Books"),Q=null,G={entries:{}};let J=Object.values(G.entries||{}),W=(_)=>{if(typeof _!=="string")return 0;let h=_.match(/\[(\d+)\]/);if(h)return parseInt(h[1],10);let u=_.match(/^(\d+)[\s-]/);if(u)return parseInt(u[1],10);return 0},q=J.filter((_)=>_&&_.stmemorybooks===!0&&_.stmbArc!==!0&&!_.disable).sort((_,h)=>W(_.comment||"")-W(h.comment||""));await uZ(p?.STMemoryBooks);let Y=await R6(),z="arc_default",X=C0()?.moduleSettings?.tokenWarningThreshold??30000,V="";V+=`<h3>${b(U("\uD83C\uDF08 Consolidate Memories into Arcs","STMemoryBooks_ConsolidateArcs_Title"))}</h3>`,V+='<div class="world_entry_form_control">',V+=`<label><strong>${b(U("Preset","STMemoryBooks_ConsolidateArcs_Preset"))}:</strong> `,V+='<select id="stmb-arc-preset" class="text_pole">';for(let _ of Y){let h=String(_.key||""),u=String(_.displayName||h),e=h===z?" selected":"";V+=`<option value="${b(h)}"${e}>${b(u)}</option>`}V+=`</select></label> <button id="stmb-arc-rebuild-builtins" class="menu_button whitespacenowrap">${b(U("Rebuild from built-ins","STMemoryBooks_Arc_RebuildBuiltins"))}</button></div>`,V+='<div class="flex-container flexGap10">',V+=`<label>${b(U("Maximum number of memories to process in each pass","STMemoryBooks_Arc_MaxPerPass"))} <input id="stmb-arc-maxpass" type="number" min="1" max="50" value="12" class="text_pole" style="width:80px"/></label>`,V+=`<label>${b(U("Number of automatic arc attempts","STMemoryBooks_Arc_MaxPasses"))} <input id="stmb-arc-maxpasses" type="number" min="1" max="50" value="10" class="text_pole" style="width:100px"/></label>`,V+=`<label>${b(U("Minimum number of memories in each arc","STMemoryBooks_Arc_MinAssigned"))} <input id="stmb-arc-minassigned" type="number" min="1" max="12" value="2" class="text_pole" style="width:110px"/></label>`,V+=`<label>${b(U("Token Budget","STMemoryBooks_Arc_TokenBudget"))} <input id="stmb-arc-token" type="number" min="1000" max="100000" value="${X}" class="text_pole" style="width:120px"/></label>`,V+="</div>",V+='<div class="world_entry_form_control" class="flex-container"><div class="flex flexFlowRow alignItemsBaseline">',V+=`<label class="checkbox_label"><input id="stmb-arc-disable-originals" type="checkbox"/> ${b(U("Disable original memories after creating arcs","STMemoryBooks_ConsolidateArcs_DisableOriginals"))}</label>`,V+="</div></div>",V+='<div class="world_entry_form_control"><div class="flex-container flexGap10 marginBot5">',V+=`<button id="stmb-arc-select-all" class="menu_button">${b(U("Select All","STMemoryBooks_SelectAll"))}</button>`,V+=`<button id="stmb-arc-deselect-all" class="menu_button">${b(U("Deselect All","STMemoryBooks_DeselectAll"))}</button>`,V+="</div>",V+='<div id="stmb-arc-list" style="max-height:300px; overflow-y:auto; border:1px solid var(--SmartHover2); padding:6px">';for(let _ of q){let h=_.comment||"(untitled)",u=String(_.uid),e=W(h);V+=`<label class="flex-container flexGap10" style="align-items:center; margin:2px 0;"><input type="checkbox" class="stmb-arc-item" value="${b(u)}" checked /> <span class="opacity70p">[${String(e).padStart(3,"0")}]</span> <span>${b(h)}</span></label>`}V+="</div>",V+=`<small class="opacity70p">${b(U("Tip: uncheck memories that should not be included.","STMemoryBooks_ConsolidateArcs_Tip"))}</small>`,V+="</div>";let F=new $0(i1.sanitize(V),r.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:U("Run","STMemoryBooks_Run"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}),j=F.dlg;try{D8(j)}catch(_){}if(j.querySelector("#stmb-arc-select-all")?.addEventListener("click",(_)=>{_.preventDefault(),j.querySelectorAll(".stmb-arc-item").forEach((h)=>h.checked=!0)}),j.querySelector("#stmb-arc-deselect-all")?.addEventListener("click",(_)=>{_.preventDefault(),j.querySelectorAll(".stmb-arc-item").forEach((h)=>h.checked=!1)}),j.querySelector("#stmb-arc-rebuild-builtins")?.addEventListener("click",async(_)=>{_.preventDefault();try{let h=`
                    <h3>${b(U("Rebuild Arc Prompts from Built-ins","STMemoryBooks_Arc_RebuildTitle"))}</h3>
                    <div class="info-block warning">
                        ${b(U("This will overwrite your saved Arc prompt presets with the built-ins. A timestamped backup will be created.","STMemoryBooks_Arc_RebuildWarning"))}
                    </div>
                    <p class="opacity70p">${b(U("After rebuild, the preset list will refresh automatically.","STMemoryBooks_Arc_RebuildNote"))}</p>
                `;if(await new $0(h,r.CONFIRM,"",{okButton:U("Rebuild","STMemoryBooks_Rebuild"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()!==i.AFFIRMATIVE)return;let y=await n5({backup:!0}),C=await R6(),d=j.querySelector("#stmb-arc-preset");if(d){let m0=d.value||z;d.innerHTML="";for(let h0 of C){let D0=String(h0.key||""),X0=String(h0.displayName||D0),T0=document.createElement("option");T0.value=D0,T0.textContent=X0,d.appendChild(T0)}if(Array.from(d.options).some((h0)=>h0.value===m0))d.value=m0;else d.value=z}try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch(m0){}let F0=y?.backupName?` (backup: ${y.backupName}) `:"";toastr.success(S`Rebuilt Arc prompts (${y?.count||0} presets)${F0}`,"STMemoryBooks")}catch(h){console.error("STMemoryBooks: Arc prompts rebuild failed:",h),toastr.error(S`Failed to rebuild Arc prompts: ${h.message}`,"STMemoryBooks")}}),await F.show()!==i.AFFIRMATIVE)return;let H=Array.from(j.querySelectorAll(".stmb-arc-item")).filter((_)=>_.checked).map((_)=>_.value);if(H.length===0){toastr.error(U("Select at least one memory to consolidate.","STMemoryBooks_SelectAtLeastOne"),"STMemoryBooks");return}if(!Q){toastr.info("Arc consolidation requires a memory lorebook. No lorebook assigned.","STMemoryBooks");return}let B={presetKey:String(j.querySelector("#stmb-arc-preset")?.value||"arc_default"),maxItemsPerPass:Math.max(1,J0(j.querySelector("#stmb-arc-maxpass"),12)),maxPasses:Math.max(1,J0(j.querySelector("#stmb-arc-maxpasses"),10)),minAssigned:Math.max(1,J0(j.querySelector("#stmb-arc-minassigned"),2)),tokenTarget:Math.max(1000,J0(j.querySelector("#stmb-arc-token"),X))},D=!!j.querySelector("#stmb-arc-disable-originals")?.checked,T=new Map(q.map((_)=>[String(_.uid),_])),L=H.map((_)=>T.get(String(_))).filter(Boolean);toastr.info(U("Consolidating memories into arcs...","STMemoryBooks_ConsolidatingArcs"),"STMemoryBooks",{timeOut:0});let P;try{P=await W7(L,B,null)}catch(_){try{toastr.clear(B1)}catch(h){}if(u1=_,d1={lorebookName:Q,lorebookData:G,selectedEntries:L,options:B,disableOriginals:D},_?.name==="ArcAIResponseError")B1=toastr.error(S`Arc analysis failed (invalid JSON): ${_.message}`,"STMemoryBooks",{timeOut:0,extendedTimeOut:0,closeButton:!0,tapToDismiss:!1,onclick:()=>{try{sZ(u1)}catch(h){console.error(h)}}});else toastr.error(S`Arc analysis failed: ${_.message}`,"STMemoryBooks");return}let{arcCandidates:x,leftovers:w}=P||{arcCandidates:[],leftovers:[]};if(!x||x.length===0){u1={name:"ArcAIResponseError",code:"ARC_NO_USABLE_ARCS",message:U("No usable arcs were produced from the model response.","STMemoryBooks_ArcAnalysis_NoUsableArcs"),rawText:P?.rawText||"",retryRawText:P?.retryRawText||""},d1={lorebookName:Q,lorebookData:G,selectedEntries:L,options:B,disableOriginals:D};try{toastr.clear(B1)}catch(h){}B1=toastr.warning(S`Arc analysis produced no usable arcs. Review the raw response to fix/extract an arc.`,"STMemoryBooks",{timeOut:0,extendedTimeOut:0,closeButton:!0,tapToDismiss:!1,onclick:()=>{try{sZ(u1)}catch(h){console.error(h)}}});try{sZ(u1)}catch(h){console.error(h)}return}try{let _=await cZ({lorebookName:Q,lorebookData:G,arcCandidates:x,disableOriginals:D}),h=Array.isArray(_?.results)?_.results.length:x.length,u=`Created ${h} arc${h===1?"":"s"}${w?.length?`, ${w.length} leftover`:""}.`;if(h===1&&(!w||w.length===0))u+=" (all selected memories were consumed into a single arc)";toastr.success(S`${u}`,"STMemoryBooks"),u1=null,d1=null;try{toastr.clear(B1)}catch(e){}B1=null}catch(_){toastr.error(S`Failed to commit arcs: ${_.message}`,"STMemoryBooks")}}catch(Z){console.error("STMemoryBooks: showArcConsolidationPopup failed:",Z),toastr.error(S`Failed to open consolidate popup: ${Z.message}`,"STMemoryBooks")}}async function P$(){let Z=C0();await J8(Z);let Q=await I8(),G=Array.isArray(Z.moduleSettings.selectedRegexOutgoing)?Z.moduleSettings.selectedRegexOutgoing:[],J=Array.isArray(Z.moduleSettings.selectedRegexIncoming)?Z.moduleSettings.selectedRegexIncoming:[],W=[];try{(B7({allowedOnly:!1})||[]).forEach((A,B)=>{let D=`idx:${B}`,T=`${A?.scriptName||"Untitled"}${A?.disabled?" (disabled)":""}`;W.push({key:D,label:T,selectedOutgoing:G.includes(D),selectedIncoming:J.includes(D)})})}catch(H){console.warn("STMemoryBooks: Failed to enumerate Regex scripts for UI",H)}let q=Z.profiles[Z.defaultProfile],Y=f(),z=Z.moduleSettings.manualModeEnabled,K=c1?.[p8]??null,X=Y?.manualLorebook??null,V={hasScene:!!Q,sceneData:Q,highestMemoryProcessed:Y?.highestMemoryProcessed,alwaysUseDefault:Z.moduleSettings.alwaysUseDefault,showMemoryPreviews:Z.moduleSettings.showMemoryPreviews,showNotifications:Z.moduleSettings.showNotifications,unhideBeforeMemory:Z.moduleSettings.unhideBeforeMemory||!1,refreshEditor:Z.moduleSettings.refreshEditor,allowSceneOverlap:Z.moduleSettings.allowSceneOverlap,manualModeEnabled:Z.moduleSettings.manualModeEnabled,lorebookMode:z?"Manual":"Automatic (Chat-bound)",currentLorebookName:z?X:K,manualLorebookName:X,chatBoundLorebookName:K,availableLorebooks:h6??[],autoHideMode:M6(Z.moduleSettings),unhiddenEntriesCount:Z.moduleSettings.unhiddenEntriesCount??2,tokenWarningThreshold:Z.moduleSettings.tokenWarningThreshold??50000,defaultMemoryCount:Z.moduleSettings.defaultMemoryCount??0,autoSummaryEnabled:Z.moduleSettings.autoSummaryEnabled??!1,autoSummaryInterval:Z.moduleSettings.autoSummaryInterval??50,autoSummaryBuffer:Z.moduleSettings.autoSummaryBuffer??2,autoCreateLorebook:Z.moduleSettings.autoCreateLorebook??!1,lorebookNameTemplate:Z.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",profiles:Z.profiles.map((H,A)=>({...H,name:H?.isBuiltinCurrentST?U("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):H.name,isDefault:A===Z.defaultProfile})),titleFormat:Z.titleFormat,useRegex:Z.moduleSettings.useRegex||!1,regexOptions:W,selectedRegexOutgoing:G,selectedRegexIncoming:J,titleFormats:Y1().map((H)=>({value:H,isSelected:H===Z.titleFormat})),showCustomInput:!Y1().includes(Z.titleFormat),selectedProfile:{...q,connection:q.useDynamicSTSettings||q?.connection?.api==="current_st"?(()=>{let H=o(),A=Q0();return{api:H.completionSource||"openai",model:A.model||"Not Set",temperature:A.temperature??0.7}})():{api:q.connection?.api||"openai",model:q.connection?.model||"Not Set",temperature:q.connection?.temperature!==void 0?q.connection.temperature:0.7},titleFormat:q.titleFormat||Z.titleFormat,effectivePrompt:q.prompt&&q.prompt.trim()?q.prompt:q.preset?await G1(q.preset):d0()}},F=i1.sanitize(UZ(V)),j=[];j.push({text:"\uD83E\uDDE0 "+U("Create Memory","STMemoryBooks_CreateMemoryButton"),result:null,classes:["menu_button"],action:async()=>{if(!Q){toastr.error(U("No scene selected. Make sure both start and end points are set.","STMemoryBooks_NoSceneSelectedMakeSure"),"STMemoryBooks");return}let H=Z.defaultProfile;if(m&&m.dlg){let A=m.dlg.querySelector("#stmb-profile-select");if(A)H=parseInt(A.value)||Z.defaultProfile,console.log(`STMemoryBooks: Using profile index ${H} (${Z.profiles[H]?.name}) from main popup selection`)}await P6(H)}}),j.push({text:"\uD83C\uDF08 "+U("Consolidate Memories into Arcs","STMemoryBooks_ConsolidateArcsButton"),result:null,classes:["menu_button"],action:async()=>{await v$()}}),j.push({text:"\uD83D\uDDD1️ "+U("Clear Scene","STMemoryBooks_ClearSceneButton"),result:null,classes:["menu_button"],action:()=>{t1(),Q1()}});let O={wide:!0,large:!0,allowVerticalScrolling:!0,customButtons:j,cancelButton:U("Close","STMemoryBooks_Close"),okButton:!1,onClose:S$};try{m=new $0(F,r.TEXT,"",O),x$(),v6(),await m.show()}catch(H){console.error("STMemoryBooks: Error showing settings popup:",H),m=null}}function x$(){if(!m)return;let Z=m.dlg;Z.addEventListener("click",async(Q)=>{let G=C0();if(Q.target&&Q.target.matches("#stmb-configure-regex")){Q.preventDefault();try{await m$()}catch(J){console.warn("STMemoryBooks: showRegexSelectionPopup failed",J)}return}}),Z.addEventListener("change",async(Q)=>{let G=C0();if(Q.target.matches("#stmb-use-regex")){G.moduleSettings.useRegex=Q.target.checked,s();let J=Z.querySelector("#stmb-configure-regex");if(J)J.style.display=Q.target.checked?"":"none";return}if(Q.target.matches("#stmb-regex-outgoing")){try{let J=Array.from(Q.target.selectedOptions||[]).map((W)=>W.value);G.moduleSettings.selectedRegexOutgoing=J,s()}catch(J){console.warn("STMemoryBooks: failed to save selectedRegexOutgoing",J)}return}if(Q.target.matches("#stmb-regex-incoming")){try{let J=Array.from(Q.target.selectedOptions||[]).map((W)=>W.value);G.moduleSettings.selectedRegexIncoming=J,s()}catch(J){console.warn("STMemoryBooks: failed to save selectedRegexIncoming",J)}return}if(Q.target.matches("#stmb-import-file")){try{F5(Q,G,Q1)}catch(J){console.error(`${j0}: Error in import profiles:`,J),toastr.error(U("Failed to import profiles","STMemoryBooks_FailedToImportProfiles"),"STMemoryBooks")}return}if(Q.target.matches("#stmb-allow-scene-overlap")){G.moduleSettings.allowSceneOverlap=Q.target.checked,s();return}if(Q.target.matches("#stmb-unhide-before-memory")){G.moduleSettings.unhideBeforeMemory=Q.target.checked,s();return}if(Q.target.matches("#stmb-manual-mode-enabled")){let J=Q.target.checked;if(J){G.moduleSettings.autoCreateLorebook=!1;let W=document.querySelector("#stmb-auto-create-lorebook");if(W)W.checked=!1}if(J){let W=c1?.[p8],q=f()||{};if(!q.manualLorebook){if(W){let Y=`
                            <h4 data-i18n="STMemoryBooks_ManualLorebookSetupTitle">Manual Lorebook Setup</h4>
                            <div class="world_entry_form_control">
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc1" data-i18n-params='{"name": "${W}"}'>You have a chat-bound lorebook "<strong>${W}</strong>".</p>
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc2">Would you like to use it for manual mode or select a different one?</p>
                            </div>
                        `;if(await new $0(Y,r.TEXT,"",{okButton:U("Use Chat-bound","STMemoryBooks_UseChatBound"),cancelButton:U("Select Different","STMemoryBooks_SelectDifferent")}).show()===i.AFFIRMATIVE)q.manualLorebook=W,Z0(),toastr.success(S`Manual lorebook set to "${W}"`,"STMemoryBooks");else if(!await _1(W)){Q.target.checked=!1;return}}else if(toastr.info(U("Please select a lorebook for manual mode","STMemoryBooks_PleaseSelectLorebookForManualMode"),"STMemoryBooks"),!await _1()){Q.target.checked=!1;return}}}G.moduleSettings.manualModeEnabled=Q.target.checked,s(),V7(),v6();return}if(Q.target.matches("#stmb-auto-hide-mode")){G.moduleSettings.autoHideMode=Q.target.value,delete G.moduleSettings.autoHideAllMessages,delete G.moduleSettings.autoHideLastMemory,s();return}if(Q.target.matches("#stmb-profile-select")){let J=K0(J0(Q.target),0,profiles.length-1);if(J>=0&&J<G.profiles.length){let W=G.profiles[J],q=Z.querySelector("#stmb-summary-api"),Y=Z.querySelector("#stmb-summary-model"),z=Z.querySelector("#stmb-summary-temp"),K=Z.querySelector("#stmb-summary-title"),X=Z.querySelector("#stmb-summary-prompt");if(W.useDynamicSTSettings||W?.connection?.api==="current_st"){let V=o(),F=Q0();if(q)q.textContent=V.completionSource||"openai";if(Y)Y.textContent=F.model||U("Not Set","STMemoryBooks_NotSet");if(z)z.textContent=Number(F.temperature??0.7)}else{if(q)q.textContent=W.connection?.api||"openai";if(Y)Y.textContent=W.connection?.model||U("Not Set","STMemoryBooks_NotSet");if(z)z.textContent=W.connection?.temperature!==void 0?W.connection.temperature:"0.7"}if(K)K.textContent=W.titleFormat||G.titleFormat;if(X)X.textContent=await O7(W)}return}if(Q.target.matches("#stmb-title-format-select")){let J=Z.querySelector("#stmb-custom-title-format"),W=Z.querySelector("#stmb-summary-title");if(Q.target.value==="custom")J.classList.remove("displayNone"),J.focus();else if(J.classList.add("displayNone"),G.titleFormat=Q.target.value,s(),W)W.textContent=Q.target.value;return}if(Q.target.matches("#stmb-default-memory-count")){let J=K0(J0(Q.target,G.moduleSettings.defaultMemoryCount??0),0,7);G.moduleSettings.defaultMemoryCount=J;return}if(Q.target.matches("#stmb-auto-summary-enabled")){G.moduleSettings.autoSummaryEnabled=Q.target.checked,s();return}if(Q.target.matches("#stmb-auto-create-lorebook")){if(Q.target.checked){G.moduleSettings.manualModeEnabled=!1;let W=document.querySelector("#stmb-manual-mode-enabled");if(W)W.checked=!1}G.moduleSettings.autoCreateLorebook=Q.target.checked,s(),V7(),v6();return}if(Q.target.matches("#stmb-auto-summary-interval")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=10&&J<=200)G.moduleSettings.autoSummaryInterval=J,s();return}if(Q.target.matches("#stmb-auto-summary-buffer")){let J=J0(Q.target);G.moduleSettings.autoSummaryBuffer=K0(J??0,0,50),s();return}}),Z.addEventListener("input",Z$.debounce((Q)=>{let G=C0();if(Q.target.matches("#stmb-custom-title-format")){let J=Q.target.value.trim();if(J&&J.includes("000")){G.titleFormat=J,s();let W=Z.querySelector("#stmb-summary-title");if(W)W.textContent=J}return}if(Q.target.matches("#stmb-lorebook-name-template")){let J=Q.target.value.trim();if(J)G.moduleSettings.lorebookNameTemplate=J,s();return}if(Q.target.matches("#stmb-token-warning-threshold")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=1000&&J<=1e5)G.moduleSettings.tokenWarningThreshold=J,s();return}if(Q.target.matches("#stmb-unhidden-entries-count")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=0&&J<=50)G.moduleSettings.unhiddenEntriesCount=J,s();return}},1000))}function S$(Z){try{let Q=Z.dlg,G=C0(),J=Q.querySelector("#stmb-always-use-default")?.checked??G.moduleSettings.alwaysUseDefault,W=Q.querySelector("#stmb-show-memory-previews")?.checked??G.moduleSettings.showMemoryPreviews,q=Q.querySelector("#stmb-show-notifications")?.checked??G.moduleSettings.showNotifications,Y=Q.querySelector("#stmb-unhide-before-memory")?.checked??G.moduleSettings.unhideBeforeMemory,z=Q.querySelector("#stmb-refresh-editor")?.checked??G.moduleSettings.refreshEditor,K=Q.querySelector("#stmb-allow-scene-overlap")?.checked??G.moduleSettings.allowSceneOverlap,X=Q.querySelector("#stmb-auto-hide-mode")?.value??M6(G.moduleSettings),V=J0(Q.querySelector("#stmb-token-warning-threshold"),G.moduleSettings.tokenWarningThreshold??50000),F=Number(Q.querySelector("#stmb-default-memory-count").value),j=J0(Q.querySelector("#stmb-unhidden-entries-count"),G.moduleSettings.unhiddenEntriesCount??0),O=Q.querySelector("#stmb-manual-mode-enabled")?.checked??G.moduleSettings.manualModeEnabled,H=Q.querySelector("#stmb-auto-summary-enabled")?.checked??G.moduleSettings.autoSummaryEnabled,A=J0(Q.querySelector("#stmb-auto-summary-interval"),G.moduleSettings.autoSummaryInterval??50),B=K0(J0(Q.querySelector("#stmb-auto-summary-buffer"),G.moduleSettings.autoSummaryBuffer??0),0,50),D=Q.querySelector("#stmb-auto-create-lorebook")?.checked??G.moduleSettings.autoCreateLorebook;if(J!==G.moduleSettings.alwaysUseDefault||W!==G.moduleSettings.showMemoryPreviews||q!==G.moduleSettings.showNotifications||Y!==G.moduleSettings.unhideBeforeMemory||z!==G.moduleSettings.refreshEditor||V!==G.moduleSettings.tokenWarningThreshold||F!==G.moduleSettings.defaultMemoryCount||O!==G.moduleSettings.manualModeEnabled||K!==G.moduleSettings.allowSceneOverlap||X!==M6(G.moduleSettings)||j!==G.moduleSettings.unhiddenEntriesCount||H!==G.moduleSettings.autoSummaryEnabled||A!==G.moduleSettings.autoSummaryInterval||B!==G.moduleSettings.autoSummaryBuffer||D!==G.moduleSettings.autoCreateLorebook)G.moduleSettings.alwaysUseDefault=J,G.moduleSettings.showMemoryPreviews=W,G.moduleSettings.showNotifications=q,G.moduleSettings.unhideBeforeMemory=Y,G.moduleSettings.refreshEditor=z,G.moduleSettings.tokenWarningThreshold=V,G.moduleSettings.defaultMemoryCount=F,G.moduleSettings.manualModeEnabled=O,G.moduleSettings.allowSceneOverlap=K,G.moduleSettings.autoHideMode=X,delete G.moduleSettings.autoHideAllMessages,delete G.moduleSettings.autoHideLastMemory,G.moduleSettings.unhiddenEntriesCount=j,G.moduleSettings.autoSummaryEnabled=H,G.moduleSettings.autoSummaryInterval=A,G.moduleSettings.autoSummaryBuffer=B,G.moduleSettings.autoCreateLorebook=D,s()}catch(Q){console.error("STMemoryBooks: Failed to save settings:",Q),toastr.warning(U("Failed to save settings. Please try again.","STMemoryBooks_FailedToSaveSettings"),"STMemoryBooks")}m=null}async function Q1(){if(!m||!m.dlg.hasAttribute("open"))return;try{let Z=C0(),Q=await I8(),G=Z.profiles[Z.defaultProfile],J=f(),W=Z.moduleSettings.manualModeEnabled,q=c1?.[p8]||null,Y=J?.manualLorebook||null,z={hasScene:!!Q,sceneData:Q,highestMemoryProcessed:J?.highestMemoryProcessed,alwaysUseDefault:Z.moduleSettings.alwaysUseDefault,showMemoryPreviews:Z.moduleSettings.showMemoryPreviews,showNotifications:Z.moduleSettings.showNotifications,unhideBeforeMemory:Z.moduleSettings.unhideBeforeMemory||!1,refreshEditor:Z.moduleSettings.refreshEditor,allowSceneOverlap:Z.moduleSettings.allowSceneOverlap,manualModeEnabled:Z.moduleSettings.manualModeEnabled,lorebookMode:W?"Manual":"Automatic (Chat-bound)",currentLorebookName:W?Y:q,manualLorebookName:Y,chatBoundLorebookName:q,availableLorebooks:h6??[],autoHideMode:M6(Z.moduleSettings),unhiddenEntriesCount:Z.moduleSettings.unhiddenEntriesCount??0,tokenWarningThreshold:Z.moduleSettings.tokenWarningThreshold??50000,defaultMemoryCount:Z.moduleSettings.defaultMemoryCount??0,autoSummaryEnabled:Z.moduleSettings.autoSummaryEnabled??!1,autoSummaryInterval:Z.moduleSettings.autoSummaryInterval??50,autoSummaryBuffer:Z.moduleSettings.autoSummaryBuffer??0,autoCreateLorebook:Z.moduleSettings.autoCreateLorebook??!1,lorebookNameTemplate:Z.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",profiles:Z.profiles.map((F,j)=>({...F,name:F?.isBuiltinCurrentST?U("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):F.name,isDefault:j===Z.defaultProfile})),titleFormat:Z.titleFormat,titleFormats:Y1().map((F)=>({value:F,isSelected:F===Z.titleFormat})),showCustomInput:!Y1().includes(Z.titleFormat),selectedProfile:{...G,connection:G.useDynamicSTSettings||G?.connection?.api==="current_st"?(()=>{let F=o(),j=Q0();return{api:F.completionSource||"openai",model:j.model||"Not Set",temperature:j.temperature??0.7}})():{api:G.connection?.api||"openai",model:G.connection?.model||"gpt-4.1",temperature:G.connection?.temperature??0.7},titleFormat:G.titleFormat||Z.titleFormat,effectivePrompt:G.prompt&&G.prompt.trim()?G.prompt:G.preset?await G1(G.preset):d0()}},K=i1.sanitize(UZ(z));m.content.innerHTML=K;let X=m.content.querySelector("#stmb-profile-select");if(X)X.value=Z.defaultProfile,X.dispatchEvent(new Event("change"));let V=["wide_dialogue_popup","large_dialogue_popup","vertical_scrolling_dialogue_popup"];m.dlg.classList.add(...V),m.content.style.overflowY="auto",v6()}catch(Z){console.error("STMemoryBooks: Error refreshing popup content:",Z)}}function R7(){let Z=document.querySelectorAll("#chat .mes[mesid]");if(Z.length>0){let Q=0;Z.forEach((G)=>{if(!G.querySelector(".mes_stmb_start"))s8(G),Q++}),n8()}}function E$(){let Z=g1.fromProps({name:"creatememory",callback:V$,helpString:U("Create memory from marked scene","STMemoryBooks_Slash_CreateMemory_Help")}),Q=g1.fromProps({name:"scenememory",callback:K$,helpString:U("Set scene range and create memory (e.g., /scenememory 10-15)","STMemoryBooks_Slash_SceneMemory_Help"),unnamedArgumentList:[w6.fromProps({description:U("Message range (X-Y format)","STMemoryBooks_Slash_SceneMemory_ArgRangeDesc"),typeList:[L6.STRING],isRequired:!0})]}),G=g1.fromProps({name:"nextmemory",callback:j$,helpString:U("Create memory from end of last memory to current message","STMemoryBooks_Slash_NextMemory_Help")}),J=g1.fromProps({name:"sideprompt",callback:F$,helpString:U('Run side prompt. Usage: /sideprompt "Name" [X-Y]',"STMemoryBooks_Slash_SidePrompt_Help"),unnamedArgumentList:[w6.fromProps({description:U("Template name (quote if contains spaces), optionally followed by X-Y range","STMemoryBooks_Slash_SidePrompt_ArgDesc"),typeList:[L6.STRING],isRequired:!0,enumProvider:nZ})]}),W=g1.fromProps({name:"sideprompt-on",callback:U$,helpString:U('Enable a Side Prompt by name or all. Usage: /sideprompt-on "Name" | all',"STMemoryBooks_Slash_SidePromptOn_Help"),unnamedArgumentList:[w6.fromProps({description:U('Template name (quote if contains spaces) or "all"',"STMemoryBooks_Slash_SidePromptOn_ArgDesc"),typeList:[L6.STRING],isRequired:!0,enumProvider:()=>[new rZ("all"),...nZ()]})]}),q=g1.fromProps({name:"sideprompt-off",callback:H$,helpString:U('Disable a Side Prompt by name or all. Usage: /sideprompt-off "Name" | all',"STMemoryBooks_Slash_SidePromptOff_Help"),unnamedArgumentList:[w6.fromProps({description:U('Template name (quote if contains spaces) or "all"',"STMemoryBooks_Slash_SidePromptOff_ArgDesc"),typeList:[L6.STRING],isRequired:!0,enumProvider:()=>[new rZ("all"),...nZ()]})]}),Y=g1.fromProps({name:"stmb-highest",callback:$$,helpString:U("Return the highest message index for processed memories in this chat. Usage: /stmb-highest","STMemoryBooks_Slash_Highest_Help"),returns:"Highest memory processed message index as a string."});k1.addCommandObject(Z),k1.addCommandObject(Q),k1.addCommandObject(G),k1.addCommandObject(J),k1.addCommandObject(W),k1.addCommandObject(q),k1.addCommandObject(Y)}function b$(){let Z=$(`
        <div id="stmb-menu-item-container" class="extension_container interactable" tabindex="0">
            <div id="stmb-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-book extensionsMenuExtensionButton"></div>
                <span data-i18n="STMemoryBooks_MenuItem">Memory Books</span>
            </div>
        </div>
        `),Q=$("#extensionsMenu");if(Q.length>0)Q.append(Z),D8(Z[0]);else console.warn("STMemoryBooks: Extensions menu not found - retrying initialization")}function y$(){$(document).on("click",a0.menuItem,P$),Z1.on(H1.CHAT_CHANGED,Y$),Z1.on(H1.MESSAGE_DELETED,(Q)=>{let G=C0();z4(Q,G)}),Z1.on(H1.MESSAGE_RECEIVED,z$),Z1.on(H1.GROUP_WRAPPER_FINISHED,X$),Z1.on(H1.GENERATION_STARTED,(Q,G,J)=>{X7=J||!1;try{if(m1)toastr.clear(m1)}catch(W){}m1=null,d8=null,p1=null});let Z=Object.values(a0).filter((Q)=>Q.includes("model_")||Q.includes("temp_")).join(", ");Z1.on(H1.GENERATE_AFTER_DATA,(Q)=>{if(X7)return;if(N0&&C6){let G=C6.effectiveConnection||C6.connection||{},W={openai:"openai",claude:"claude",openrouter:"openrouter",ai21:"ai21",makersuite:"makersuite",google:"makersuite",vertexai:"vertexai",mistralai:"mistralai",custom:"custom",cohere:"cohere",perplexity:"perplexity",groq:"groq",nanogpt:"nanogpt",deepseek:"deepseek",electronhub:"electronhub",aimlapi:"aimlapi",xai:"xai",pollinations:"pollinations",moonshot:"moonshot",fireworks:"fireworks",cometapi:"cometapi",azure_openai:"azure_openai",zai:"zai",siliconflow:"siliconflow"}[G.api]||"openai";if(Q.chat_completion_source=W,Q.include_reasoning=!1,G.model)Q.model=G.model;if(typeof G.temperature==="number")Q.temperature=G.temperature}}),window.addEventListener("beforeunload",q$)}async function f$(Z){if(N0){toastr.warning(U("Memory generation is already in progress.","STMemoryBooks_ManualFix_InProgress"),"STMemoryBooks");return}try{N0=!0;let Q=p1;if(!Q?.compiledScene||!Q?.profileSettings||!Q?.lorebookValidation?.valid){toastr.error(U("Missing failure context; cannot apply corrected JSON.","STMemoryBooks_ManualFix_NoContext"),"STMemoryBooks");return}if(!Q?.sceneData||Q.sceneData.sceneEnd===void 0||Q.sceneData.sceneStart===void 0){toastr.error(U("Missing scene range; cannot apply corrected JSON.","STMemoryBooks_ManualFix_NoSceneRange"),"STMemoryBooks");return}let G=String(Z||"").trim();if(!G){toastr.error(U("Corrected JSON is empty.","STMemoryBooks_ManualFix_EmptyJson"),"STMemoryBooks");return}let J;try{J=JZ(G)}catch(H){let A=H?.message||"Failed to parse corrected JSON.",B=H?.code?` [${H.code}]`:"";toastr.error(S`Corrected JSON is still invalid${B}: ${A}`,"STMemoryBooks");return}if(!J.content&&!J.summary&&!J.memory_content){toastr.error(U("Corrected JSON is missing content.","STMemoryBooks_ManualFix_MissingContent"),"STMemoryBooks");return}if(!J.title){toastr.error(U("Corrected JSON is missing title.","STMemoryBooks_ManualFix_MissingTitle"),"STMemoryBooks");return}if(!Array.isArray(J.keywords)){toastr.error(U("Corrected JSON is missing keywords array.","STMemoryBooks_ManualFix_MissingKeywords"),"STMemoryBooks");return}let{compiledScene:W,profileSettings:q}=Q,Y=(J.content||J.summary||J.memory_content||"").trim(),z=(J.title||"Memory").trim(),K=Array.isArray(J.keywords)?J.keywords.filter((H)=>H&&typeof H==="string"&&H.trim()!==""):[],X=Q.sceneStats||null,V=Q.sceneRange||`${W.metadata.sceneStart}-${W.metadata.sceneEnd}`,F={content:Y,extractedTitle:z,metadata:{sceneRange:V,messageCount:W.metadata?.messageCount,characterName:W.metadata?.characterName,userName:W.metadata?.userName,chatId:W.metadata?.chatId,createdAt:new Date().toISOString(),profileUsed:q.name,presetUsed:q.preset||"custom",tokenUsage:X?{estimatedTokens:X.estimatedTokens}:void 0,generationMethod:"manual-json-repair",version:"2.0"},suggestedKeys:K,titleFormat:q.useDynamicSTSettings||q?.connection?.api==="current_st"?p.STMemoryBooks?.titleFormat||"[000] - {{title}}":q.titleFormat||"[000] - {{title}}",lorebookSettings:{constVectMode:q.constVectMode,position:q.position,orderMode:q.orderMode,orderValue:q.orderValue,preventRecursion:q.preventRecursion,delayUntilRecursion:q.delayUntilRecursion,outletName:Number(q.position)===7?q.outletName||"":void 0},lorebook:{content:Y,comment:`Auto-generated memory from messages ${V}. Profile: ${q.name}.`,key:K||[],keysecondary:[],selective:!0,constant:!1,order:100,position:"before_char",disable:!1,addMemo:!0,excludeRecursion:!1,delayUntilRecursion:!0,probability:100,useProbability:!1}},j=await zZ(F,Q.lorebookValidation);if(!j.success)throw Error(j.error||"Failed to add memory to lorebook");try{let H=q.effectiveConnection||q.connection||{};console.debug("STMemoryBooks: Passing profile to runAfterMemory",{api:H.api,model:H.model,temperature:H.temperature}),await bZ(W,q)}catch(H){console.warn("STMemoryBooks: runAfterMemory failed:",H)}try{let H=f()||{};H.highestMemoryProcessed=Q.sceneData.sceneEnd,Z0()}catch(H){console.warn("STMemoryBooks: Failed to update highestMemoryProcessed baseline:",H)}KZ();let O=Q.memoryFetchResult?.actualCount>0?` (with ${Q.memoryFetchResult.actualCount} context ${Q.memoryFetchResult.actualCount===1?"memory":"memories"})`:"";toastr.clear(),m1=null,d8=null,p1=null,toastr.success(S`Memory "${j.entryTitle}" created successfully${O}!`,"STMemoryBooks")}catch(Q){console.error("STMemoryBooks: Manual JSON repair failed:",Q),toastr.error(S`Failed to create memory from corrected JSON: ${Q.message}`,"STMemoryBooks")}finally{N0=!1}}async function k$(Z){if(oZ){toastr.warning(U("Arc consolidation is already in progress.","STMemoryBooks_ArcManualFix_InProgress"),"STMemoryBooks");return}try{oZ=!0;let Q=d1;if(!Q?.lorebookName||!Q?.lorebookData||!Array.isArray(Q?.selectedEntries)||!Q?.options){toastr.error(U("Missing failure context; cannot apply corrected Arc JSON.","STMemoryBooks_ArcManualFix_NoContext"),"STMemoryBooks");return}let G=String(Z||"").trim();if(!G){toastr.error(U("Corrected JSON is empty.","STMemoryBooks_ArcManualFix_EmptyJson"),"STMemoryBooks");return}let J;try{J=m8(G)}catch(B){let D=B?.message||"Failed to parse corrected Arc JSON.",T=B?.code?` [${B.code}]`:"";toastr.error(S`Corrected Arc JSON is still invalid${T}: ${D}`,"STMemoryBooks");return}let W=Array.isArray(J?.arcs)?J.arcs:[];if(W.length===0){toastr.error(U("Corrected JSON is missing arcs.","STMemoryBooks_ArcManualFix_MissingArcs"),"STMemoryBooks");return}let q=W.some((B)=>Array.isArray(B?.member_ids)&&B.member_ids.length>0);if(W.length>1&&!q){toastr.error(U("Multiple arcs require member_ids to avoid ambiguous assignment. Add member_ids or reduce to one arc.","STMemoryBooks_ArcManualFix_MultiArcNeedsMemberIds"),"STMemoryBooks");return}let z=Q.selectedEntries.map((B)=>String(B?.uid)).filter(Boolean),K=new Map;z.forEach((B,D)=>{K.set(B,B);let T=String(D+1).padStart(3,"0");K.set(T,B),K.set(String(D+1),B)});let X=(B)=>K.get(String(B).trim()),V=new Set;(Array.isArray(J?.unassigned_memories)?J.unassigned_memories:[]).forEach((B)=>{let D=X(B?.id);if(D)V.add(D)});let j=z.filter((B)=>!V.has(B)),O=W.map((B)=>{let D=String(B?.title||"").trim(),T=String(B?.summary||"").trim(),L=Array.isArray(B?.keywords)?B.keywords:[];L=L.filter((x)=>typeof x==="string"&&x.trim()).map((x)=>x.trim());let P=null;if(Array.isArray(B?.member_ids))P=B.member_ids.map(X).filter((x)=>x!==void 0);if(!P||P.length===0)P=j;return P=Array.from(new Set(P)).filter(Boolean),{title:D,summary:T,keywords:L,memberIds:P}}),H=await cZ({lorebookName:Q.lorebookName,lorebookData:Q.lorebookData,arcCandidates:O,disableOriginals:!!Q.disableOriginals}),A=Array.isArray(H?.results)?H.results.length:O.length;toastr.success(S`Created ${A} arc${A===1?"":"s"} from corrected JSON.`,"STMemoryBooks"),u1=null,d1=null;try{toastr.clear(B1)}catch(B){}B1=null}catch(Q){console.error("STMemoryBooks: applyManualFixedArcJson failed:",Q),toastr.error(S`Failed to apply corrected Arc JSON: ${Q.message}`,"STMemoryBooks")}finally{oZ=!1}}function sZ(Z){try{let Q=(O)=>b(String(O??"")),G=Q(Z?.message||U("Unknown error","STMemoryBooks_UnknownError")),J=Q(Z?.code||""),W=String(Z?.retryRawText||Z?.rawText||"").trim(),q=String(Z?.rawText||"").trim(),Y=!!d1?.lorebookName&&!!d1?.lorebookData,z=(O)=>String(O||"").split(/[\n,]+/g).map((H)=>String(H||"").trim()).map((H)=>H.replace(/^["']|["']$/g,"")).map((H)=>H.replace(/^\d+\.\s*/,"")).map((H)=>H.replace(/^[\-\*\u2022]\s*/,"")).map((H)=>H.trim()).filter(Boolean).slice(0,30),K=(O)=>{let H=String(O||"");try{let x=m8(H),w=Array.isArray(x?.arcs)?x.arcs[0]:null;if(w)return{title:String(w.title||"").trim(),summary:String(w.summary||"").trim(),keywords:Array.isArray(w.keywords)?w.keywords:[]}}catch{}let A="",B="",D=[],T=H.match(/(?:^|\n)\s*(?:title|arc\s*title)\s*[:\-]\s*(.+)\s*$/im)||H.match(/(?:^|\n)\s*#{1,6}\s*(.+)\s*$/m);if(T)A=String(T[1]||"").trim().replace(/^["']|["']$/g,"");let L=H.match(/(?:^|\n)\s*(?:summary|arc\s*summary|content)\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:keywords?|tags?)\s*[:\-]|\n\s*$)/im);if(L)B=String(L[1]||"").trim();else if(A){let w=H.split(A).slice(1).join(A).split(/\n\s*\n/g).map((_)=>_.trim()).filter(Boolean);if(w.length)B=w[0]}let P=H.match(/(?:^|\n)\s*(?:keywords?|tags?)\s*[:\-]\s*([\s\S]*)$/im);if(P)D=z(P[1]);else{let x=H.split(/\r?\n/).filter((w)=>/^\s*(?:[\-\*\u2022]|\d+\.)\s+/.test(w)).slice(0,60).join(`
`);if(x)D=z(x)}return{title:A,summary:B,keywords:D}},X=W?K(W):null,V="";if(V+=`<h3>${Q(U("Review Failed Arc Response","STMemoryBooks_ReviewFailedArc_Title"))}</h3>`,V+=`<div><strong>${Q(U("Error","STMemoryBooks_ReviewFailedArc_ErrorLabel"))}:</strong> ${G}</div>`,J)V+=`<div><strong>${Q(U("Code","STMemoryBooks_ReviewFailedArc_CodeLabel"))}:</strong> ${J}</div>`;if(W){if(V+='<div class="world_entry_form_control">',V+=`<h4>${Q(U("Raw AI Response","STMemoryBooks_ReviewFailedArc_RawLabel"))}</h4>`,V+=`<textarea id="stmb-arc-corrected-raw" class="text_pole" style="width: 100%; min-height: 220px; max-height: 360px; white-space: pre; overflow:auto;">${b(W)}</textarea>`,V+='<div class="buttons_block gap10px">',V+=`<button id="stmb-arc-copy-raw" class="menu_button">${Q(U("Copy Raw","STMemoryBooks_ReviewFailedArc_CopyRaw"))}</button>`,V+=`<button id="stmb-arc-extract-fields" class="menu_button">${Q(U("Extract Title/Summary/Keywords","STMemoryBooks_ReviewFailedArc_ExtractFields"))}</button>`,V+=`<button id="stmb-arc-fill-json" class="menu_button">${Q(U("Fill JSON from fields","STMemoryBooks_ReviewFailedArc_FillJson"))}</button>`,V+=`<button id="stmb-arc-apply-corrected-raw" class="menu_button" ${Y?"":"disabled"}>${Q(U("Create Arcs from corrected JSON","STMemoryBooks_ReviewFailedArc_CreateArcs"))}</button>`,V+="</div>",V+='<div class="world_entry_form_control">',V+=`<h4>${Q(U("Extractable Fields","STMemoryBooks_ReviewFailedArc_FieldsTitle"))}</h4>`,V+=`<div class="opacity70p">${Q(U("Use Extract to populate fields from the raw response, then Fill JSON to generate a valid Arc JSON object.","STMemoryBooks_ReviewFailedArc_FieldsDesc"))}</div>`,V+=`<div class="world_entry_form_control"><label>${Q(U("Title","STMemoryBooks_Title"))}</label><input id="stmb-arc-field-title" class="text_pole" style="width:100%" value="${b(String(X?.title||""))}"></div>`,V+=`<div class="world_entry_form_control"><label>${Q(U("Summary","STMemoryBooks_Summary"))}</label><textarea id="stmb-arc-field-summary" class="text_pole" style="width:100%; min-height: 110px; white-space: pre-wrap;">${b(String(X?.summary||""))}</textarea></div>`,V+=`<div class="world_entry_form_control"><label>${Q(U("Keywords (one per line or comma-separated)","STMemoryBooks_Keywords"))}</label><textarea id="stmb-arc-field-keywords" class="text_pole" style="width:100%; min-height: 90px; white-space: pre-wrap;">${b(Array.isArray(X?.keywords)?X.keywords.join(`
`):"")}</textarea></div>`,V+="</div>",!Y)V+=`<div class="opacity70p">${Q(U("Unable to apply corrected JSON because the original consolidation context is missing.","STMemoryBooks_ReviewFailedArc_NoContext"))}</div>`;if(q&&q!==W)V+=`<details class="world_entry_form_control"><summary class="opacity70p">${Q(U("Show original (pre-retry) response","STMemoryBooks_ReviewFailedArc_ShowOriginal"))}</summary>`,V+=`<textarea class="text_pole" style="width: 100%; min-height: 160px; max-height: 260px; white-space: pre; overflow:auto;">${b(q)}</textarea>`,V+="</details>";V+="</div>"}else V+=`<div class="world_entry_form_control opacity70p">${Q(U("No raw response was captured.","STMemoryBooks_ReviewFailedArc_NoRaw"))}</div>`;let F=new $0(i1.sanitize(V),r.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")}),j=F.dlg;j.querySelector("#stmb-arc-copy-raw")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(W||q),toastr.success(U("Copied raw response","STMemoryBooks_CopiedRaw"),"STMemoryBooks")}catch(O){toastr.error(U("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),j.querySelector("#stmb-arc-extract-fields")?.addEventListener("click",async()=>{try{let O=j.querySelector("#stmb-arc-corrected-raw")?.value??W??q,H=K(O),A=j.querySelector("#stmb-arc-field-title"),B=j.querySelector("#stmb-arc-field-summary"),D=j.querySelector("#stmb-arc-field-keywords");if(A)A.value=H?.title||"";if(B)B.value=H?.summary||"";if(D)D.value=Array.isArray(H?.keywords)?H.keywords.join(`
`):"";toastr.success(U("Extracted fields from response","STMemoryBooks_ReviewFailedArc_ExtractedFieldsToast"),"STMemoryBooks")}catch(O){toastr.error(U("Failed to extract fields","STMemoryBooks_ReviewFailedArc_ExtractFieldsFailed"),"STMemoryBooks")}}),j.querySelector("#stmb-arc-fill-json")?.addEventListener("click",async()=>{try{let O=String(j.querySelector("#stmb-arc-field-title")?.value||"").trim(),H=String(j.querySelector("#stmb-arc-field-summary")?.value||"").trim(),A=j.querySelector("#stmb-arc-field-keywords")?.value||"",B=z(A);if(!O||!H){toastr.warning(U("Title and Summary are required to build an arc.","STMemoryBooks_ReviewFailedArc_TitleSummaryRequired"),"STMemoryBooks");return}let T=JSON.stringify({arcs:[{title:O,summary:H,keywords:B}],unassigned_memories:[]},null,2),L=j.querySelector("#stmb-arc-corrected-raw");if(L)L.value=T;toastr.success(U("Filled JSON from fields","STMemoryBooks_ReviewFailedArc_FilledJsonToast"),"STMemoryBooks")}catch(O){toastr.error(U("Failed to build JSON","STMemoryBooks_ReviewFailedArc_FillJsonFailed"),"STMemoryBooks")}}),j.querySelector("#stmb-arc-apply-corrected-raw")?.addEventListener("click",async()=>{let O=j.querySelector("#stmb-arc-corrected-raw")?.value??W??q;k$(O)}),F.show()}catch(Q){console.error("STMemoryBooks: Failed to show failed Arc response popup:",Q)}}function g$(Z){try{let Q=(V)=>b(String(V||"")),G=Z?.code?Q(Z.code):"",J=Q(Z?.message||"Unknown error"),W=typeof Z?.rawResponse==="string"?Z.rawResponse:"",q=typeof Z?.providerBody==="string"?Z.providerBody:"",Y=!!W&&!!p1?.compiledScene&&!!p1?.lorebookValidation?.valid,z="";if(z+=`<h3>${Q(U("Review Failed AI Response","STMemoryBooks_ReviewFailedAI_Title"))}</h3>`,z+='<div class="world_entry_form_control">',z+=`<div><strong>${Q(U("Error","STMemoryBooks_ReviewFailedAI_ErrorLabel"))}:</strong> ${J}</div>`,G)z+=`<div><strong>${Q(U("Code","STMemoryBooks_ReviewFailedAI_CodeLabel"))}:</strong> ${G}</div>`;if(z+="</div>",W){if(z+='<div class="world_entry_form_control">',z+=`<h4>${Q(U("Raw AI Response","STMemoryBooks_ReviewFailedAI_RawLabel"))}</h4>`,z+=`<textarea id="stmb-corrected-raw" class="text_pole" style="width: 100%; min-height: 220px; max-height: 360px; white-space: pre; overflow:auto;">${b(W)}</textarea>`,z+='<div class="buttons_block gap10px">',z+=`<button id="stmb-copy-raw" class="menu_button">${Q(U("Copy Raw","STMemoryBooks_ReviewFailedAI_CopyRaw"))}</button>`,z+=`<button id="stmb-apply-corrected-raw" class="menu_button" ${Y?"":"disabled"}>${Q(U("Create Memory from corrected JSON","STMemoryBooks_ReviewFailedAI_CreateMemory"))}</button>`,z+="</div>",!Y)z+=`<div class="opacity70p">${Q(U("Unable to apply corrected JSON because the original generation context is missing.","STMemoryBooks_ReviewFailedAI_NoContext"))}</div>`;z+="</div>"}else z+=`<div class="world_entry_form_control opacity70p">${Q(U("No raw response was captured.","STMemoryBooks_ReviewFailedAI_NoRaw"))}</div>`;if(q)z+='<div class="world_entry_form_control">',z+=`<h4>${Q(U("Provider Error Body","STMemoryBooks_ReviewFailedAI_ProviderBody"))}</h4>`,z+=`<pre class="text_pole" style="white-space: pre-wrap; max-height: 200px; overflow:auto;"><code>${b(q)}</code></pre>`,z+=`<div class="buttons_block gap10px"><button id="stmb-copy-provider" class="menu_button">${Q(U("Copy Provider Body","STMemoryBooks_ReviewFailedAI_CopyProvider"))}</button></div>`,z+="</div>";let K=new $0(i1.sanitize(z),r.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")}),X=K.dlg;X.querySelector("#stmb-copy-raw")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(W),toastr.success(U("Copied raw response","STMemoryBooks_CopiedRaw"),"STMemoryBooks")}catch(V){toastr.error(U("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),X.querySelector("#stmb-apply-corrected-raw")?.addEventListener("click",async()=>{let V=X.querySelector("#stmb-corrected-raw")?.value??W;f$(V)}),X.querySelector("#stmb-copy-provider")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(q),toastr.success(U("Copied provider body","STMemoryBooks_CopiedProvider"),"STMemoryBooks")}catch(V){toastr.error(U("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),K.show()}catch(Q){console.error("STMemoryBooks: Failed to show failed AI response popup:",Q)}}async function U7(){if(z7)return;z7=!0,console.log("STMemoryBooks: Initializing");try{let W=G$?.()||"en";try{let q=await Y7(W);if(q)lZ(W,q)}catch(q){console.warn("STMemoryBooks: Failed to load JSON locale bundle:",q)}if(f1&&typeof f1==="object"){if(f1[W])lZ(W,f1[W]);if(W!=="en"&&f1.en)lZ(W,Object.fromEntries(Object.entries(f1.en).filter(([q])=>!0)))}}catch(W){console.warn("STMemoryBooks: Failed to merge plugin locales:",W)}let Z=0,Q=20;while(Z<Q){if($(a0.extensionsMenu).length>0&&Z1&&typeof $0<"u")break;await new Promise((W)=>setTimeout(W,500)),Z++}b$();try{D8()}catch(W){}let G=C0(),J=FZ(G);if(!J.valid){if(console.warn("STMemoryBooks: Profile validation issues found:",J.issues),J.fixes.length>0)s()}r8(),N7();try{W$()}catch(W){console.error("STMemoryBooks: Failed to initialize chat observer:",W),toastr.error(U("STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.","STMemoryBooks_FailedToInitializeChatMonitoring"),"STMemoryBooks");return}y$(),await tZ(),E$();try{R7(),console.log("STMemoryBooks: Processed existing messages during initialization")}catch(W){console.error("STMemoryBooks: Error processing existing messages during init:",W)}Q$.registerHelper("eq",function(W,q){return W===q}),console.log("STMemoryBooks: Extension loaded successfully")}function u$(){let Z=[];try{(B7({allowedOnly:!1})||[]).forEach((G,J)=>{let W=`idx:${J}`,q=`${G?.scriptName||"Untitled"}${G?.disabled?" (disabled)":""}`;Z.push({key:W,label:q})})}catch(Q){console.warn("STMemoryBooks: buildFlatRegexOptions failed",Q)}return Z}async function m$(){let Z=C0(),Q=u$(),G=Array.isArray(Z.moduleSettings.selectedRegexOutgoing)?Z.moduleSettings.selectedRegexOutgoing:[],J=Array.isArray(Z.moduleSettings.selectedRegexIncoming)?Z.moduleSettings.selectedRegexIncoming:[],W="";W+='<h3 data-i18n="STMemoryBooks_RegexSelection_Title">\uD83D\uDCD0 Regex selection</h3>',W+='<div class="world_entry_form_control"><small class="opacity70p" data-i18n="STMemoryBooks_RegexSelection_Desc">Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.</small></div>',W+='<div class="world_entry_form_control">',W+='<h4 data-i18n="STMemoryBooks_RegexSelection_Outgoing">Run regex before sending to AI</h4>',W+='<select id="stmb-regex-outgoing" multiple style="width:100%">';for(let z of Q){let K=G.includes(z.key)?" selected":"";W+=`<option value="${b(z.key)}"${K}>${b(z.label)}</option>`}W+="</select>",W+="</div>",W+='<div class="world_entry_form_control">',W+='<h4 data-i18n="STMemoryBooks_RegexSelection_Incoming">Run regex before adding to lorebook (before previews)</h4>',W+='<select id="stmb-regex-incoming" multiple style="width:100%">';for(let z of Q){let K=J.includes(z.key)?" selected":"";W+=`<option value="${b(z.key)}"${K}>${b(z.label)}</option>`}W+="</select>",W+="</div>";let q=new $0(W,r.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:U("Save","STMemoryBooks_Save"),cancelButton:U("Close","STMemoryBooks_Close")});try{D8(q.dlg)}catch(z){}if(setTimeout(()=>{try{if(window.jQuery&&typeof window.jQuery.fn.select2==="function"){let z=window.jQuery(q.dlg);window.jQuery("#stmb-regex-outgoing").select2({width:"100%",placeholder:U("Select outgoing regex…","STMemoryBooks_RegexSelect_PlaceholderOutgoing"),closeOnSelect:!1,dropdownParent:z}),window.jQuery("#stmb-regex-incoming").select2({width:"100%",placeholder:U("Select incoming regex…","STMemoryBooks_RegexSelect_PlaceholderIncoming"),closeOnSelect:!1,dropdownParent:z})}}catch(z){console.warn("STMemoryBooks: Select2 initialization failed (using native selects)",z)}},0),await q.show()===i.AFFIRMATIVE)try{let z=Array.from(q.dlg?.querySelector("#stmb-regex-outgoing")?.selectedOptions||[]).map((X)=>X.value),K=Array.from(q.dlg?.querySelector("#stmb-regex-incoming")?.selectedOptions||[]).map((X)=>X.value);Z.moduleSettings.selectedRegexOutgoing=z,Z.moduleSettings.selectedRegexIncoming=K,s(),toastr.success(U("Regex selections saved","STMemoryBooks_RegexSelectionsSaved"),"STMemoryBooks")}catch(z){console.warn("STMemoryBooks: Failed to save regex selections",z),toastr.error(U("Failed to save regex selections","STMemoryBooks_FailedToSaveRegexSelections"),"STMemoryBooks")}}$(document).ready(()=>{if(Z1&&H1.APP_READY)Z1.on(H1.APP_READY,U7);setTimeout(U7,2000)});export{eZ as validateLorebook,W5 as isMemoryProcessing,C6 as currentProfile};

//# debugId=E4872AD9B7C8A1C764756E2164756E21
