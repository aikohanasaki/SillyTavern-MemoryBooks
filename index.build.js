var K7=Object.create;var{getPrototypeOf:U7,defineProperty:U8,getOwnPropertyNames:mZ,getOwnPropertyDescriptor:H7}=Object,dZ=Object.prototype.hasOwnProperty;var I6=(Z,Q,G)=>{G=Z!=null?K7(U7(Z)):{};let J=Q||!Z||!Z.__esModule?U8(G,"default",{value:Z,enumerable:!0}):G;for(let W of mZ(Z))if(!dZ.call(J,W))U8(J,W,{get:()=>Z[W],enumerable:!0});return J},uZ=new WeakMap,B7=(Z)=>{var Q=uZ.get(Z),G;if(Q)return Q;if(Q=U8({},"__esModule",{value:!0}),Z&&typeof Z==="object"||typeof Z==="function")mZ(Z).map((J)=>!dZ.call(Q,J)&&U8(Q,J,{get:()=>Z[J],enumerable:!(G=H7(Z,J))||G.enumerable}));return uZ.set(Z,Q),Q},k0=(Z,Q)=>()=>(Q||Z((Q={exports:{}}).exports,Q),Q.exports);var cZ=(Z,Q)=>{for(var G in Q)U8(Z,G,{get:Q[G],enumerable:!0,configurable:!0,set:(J)=>Q[G]=()=>J})};var U0=(Z,Q)=>()=>(Z&&(Q=Z(Z=0)),Q);var pZ=((Z)=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(Z,{get:(Q,G)=>(typeof require<"u"?require:Q)[G]}):Z)(function(Z){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+Z+'" is not supported')});var y8,M1,w6,g0,i1,H8,f8,LJ,CJ;var H0=U0(()=>{y8={MAX_RETRIES:2,RETRY_DELAY_MS:2000,TOKEN_WARNING_THRESHOLD_DEFAULT:50000,DEFAULT_MEMORY_COUNT:0},M1={MAX_SCAN_RANGE:100,MAX_AFFECTED_MESSAGES:200,BUTTON_UPDATE_DEBOUNCE_MS:50,VALIDATION_DELAY_MS:500},w6={INPUT_DEBOUNCE_MS:1000,CHAT_OBSERVER_DEBOUNCE_MS:50},g0={PROMPTS_FILE:"stmb-summary-prompts.json",SIDE_PROMPTS_FILE:"stmb-side-prompts.json",ARC_PROMPTS_FILE:"stmb-arc-prompts.json"},i1={CURRENT_VERSION:1},H8={summary:"Summary - Detailed beat-by-beat summaries in narrative prose",summarize:"Summarize - Bullet-point format",synopsis:"Synopsis - Long and comprehensive (beats, interactions, details) with headings",sumup:"Sum Up - Concise story beats in narrative prose",minimal:"Minimal - Brief 1-2 sentence summary",northgate:"Northgate - Intended for creative writing. By Northgate on ST Discord",aelemar:"Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord",comprehensive:"Comprehensive - Synopsis plus improved keywords extraction"},f8={summary:"STMemoryBooks_DisplayName_summary",summarize:"STMemoryBooks_DisplayName_summarize",synopsis:"STMemoryBooks_DisplayName_synopsis",sumup:"STMemoryBooks_DisplayName_sumup",minimal:"STMemoryBooks_DisplayName_minimal",northgate:"STMemoryBooks_DisplayName_northgate",aelemar:"STMemoryBooks_DisplayName_aelemar",comprehensive:"STMemoryBooks_DisplayName_comprehensive"},LJ=M1.MAX_SCAN_RANGE,CJ=M1.MAX_AFFECTED_MESSAGES});import{chat as m0,chat_metadata as vJ}from"../../../../script.js";import{saveMetadataDebounced as O7,getContext as R7}from"../../../extensions.js";import{groups as bJ,editGroup as yJ}from"../../../group-chats.js";import{t as gJ,translate as D1}from"../../../i18n.js";function m(){let Q=R7().chatMetadata;if(!Q)return{sceneStart:null,sceneEnd:null};if(!Q.STMemoryBooks)Q.STMemoryBooks={};return Q.STMemoryBooks.sceneStart=X1.start??Q.STMemoryBooks.sceneStart??null,Q.STMemoryBooks.sceneEnd=X1.end??Q.STMemoryBooks.sceneEnd??null,Q.STMemoryBooks}function Q1(){O7()}function k8(Z,Q,G,J){let W=A7(Z,Q,G,J);if(W.needsFullUpdate){g8();return}if(W.min===null||W.max===null)return;let q="#chat .mes[mesid]",Y=document.querySelectorAll(q),z=Array.from(Y).filter((V)=>{let X=parseInt(V.getAttribute("mesid")),j=W.min!==null?X>=W.min:!0,K=W.max!==null&&W.max!==void 0?X<=W.max:!0;return j&&K});if(z.length>0){let V=m();M6(z,V)}}function A7(Z,Q,G,J){let W=new Set;if(Z!==null&&Q!==null)for(let Y=Z;Y<=Q;Y++)W.add(Y);if(Z!==null)W.add(Z);if(Q!==null)W.add(Q);if(G!==null&&J!==null)for(let Y=G;Y<=J;Y++)W.add(Y);if(G!==null)W.add(G);if(J!==null)W.add(J);if(G!==null&&J===null){let Y=Math.min(G+M1.MAX_SCAN_RANGE,m0.length-1);for(let z=G+1;z<=Y;z++)W.add(z)}if(J!==null&&G===null){let Y=Math.max(J-M1.MAX_SCAN_RANGE,0);for(let z=Y;z<J;z++)W.add(z)}if(Z!==null&&Q===null&&G!==null&&J!==null){let Y=Math.min(Z+M1.MAX_SCAN_RANGE,m0.length-1);for(let z=J+1;z<=Y;z++)W.add(z)}if(Q!==null&&Z===null&&G!==null&&J!==null){let Y=Math.max(Q-M1.MAX_SCAN_RANGE,0);for(let z=Y;z<G;z++)W.add(z)}if(W.size===0)return{min:null,max:null,needsFullUpdate:!1};if(W.size>M1.MAX_AFFECTED_MESSAGES)return{needsFullUpdate:!0};let q=Array.from(W).sort((Y,z)=>Y-z);return{min:q[0],max:q[q.length-1],needsFullUpdate:!1}}function L6(Z,Q){let G=m(),J=G.sceneStart??null,W=G.sceneEnd??null,q=T7(G,Z,Q);return G.sceneStart=q.start,G.sceneEnd=q.end,X1.start=q.start,X1.end=q.end,Q1(),k8(J,W,q.start,q.end),Promise.resolve()}function C6(Z,Q){let G=m(),J=G.sceneStart??null,W=G.sceneEnd??null,q=Number(Z),Y=Number(Q);G.sceneStart=q,G.sceneEnd=Y,X1.start=q,X1.end=Y,Q1(),k8(J,W,q,Y)}function d0(){let Z=m(),Q=Z.sceneStart??null,G=Z.sceneEnd??null;Z.sceneStart=null,Z.sceneEnd=null,X1.start=null,X1.end=null,Q1(),g8()}function g8(){let Z=m(),Q=document.querySelectorAll("#chat .mes[mesid]");M6(Q,Z)}function iZ(Z){if(!Z||Z.length===0)return;let Q=m();M6(Z,Q)}function M6(Z,Q){let{sceneStart:G,sceneEnd:J}=Q;Z.forEach((W)=>{let q=parseInt(W.getAttribute("mesid")),Y=W.querySelector(".mes_stmb_start"),z=W.querySelector(".mes_stmb_end");if(!Y||!z)return;if(Y.classList.remove("on","valid-start-point","in-scene"),z.classList.remove("on","valid-end-point","in-scene"),G!=null&&J!=null){if(q===G)Y.classList.add("on");else if(q===J)z.classList.add("on");else if(q>G&&q<J)Y.classList.add("in-scene"),z.classList.add("in-scene")}else if(G!=null){if(q===G)Y.classList.add("on");else if(q>G)z.classList.add("valid-end-point")}else if(J!=null){if(q===J)z.classList.add("on");else if(q<J)Y.classList.add("valid-start-point")}})}function u0(){let Z=m(),Q=Z.sceneStart??null,G=Z.sceneEnd??null,J=!1,W=m0.length;if(W===0){if(Z.sceneStart!==null||Z.sceneEnd!==null)Z.sceneStart=null,Z.sceneEnd=null,J=!0}else{if(Z.sceneStart!==null&&Z.sceneStart<0)Z.sceneStart=null,J=!0;if(Z.sceneEnd!==null&&Z.sceneEnd<0)Z.sceneEnd=null,J=!0;if(Z.sceneStart!==null&&Z.sceneStart>=W)Z.sceneStart=null,J=!0;if(Z.sceneEnd!==null&&Z.sceneEnd>=W)Z.sceneEnd=W-1,J=!0;if(Z.sceneStart!==null&&Z.sceneEnd!==null&&Z.sceneStart>Z.sceneEnd)Z.sceneStart=null,Z.sceneEnd=null,J=!0}if(J)X1.start=Z.sceneStart,X1.end=Z.sceneEnd,Q1(),k8(Q,G,Z.sceneStart,Z.sceneEnd)}function lZ(Z,Q){let G=Number(Z);if(!Number.isFinite(G))return;let J=m(),W=J.sceneStart??null,q=J.sceneEnd??null,Y=J.sceneStart,z=J.sceneEnd,V="";if(Y===G&&z===G){if(d0(),Q?.moduleSettings?.showNotifications)toastr.warning(D1("Scene cleared due to start marker deletion","STMemoryBooks_Toast_SceneClearedStart"),"STMemoryBooks");u0();return}if(Y!=null&&z!=null){if(G<Y)Y--,z--,V=D1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===Y){if(Y=null,z!=null&&z>G)z--;V=D1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(G>Y&&G<z)z--,V=D1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===z)z=null,V=D1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(Y!=null){if(G<Y)Y--,V=D1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===Y)Y=null,V=D1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(z!=null){if(G<z)z--,V=D1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===z)z=null,V=D1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else{u0();return}let X=m0.length;if(X===0)Y=null,z=null;else{if(Y!=null&&(Y<0||Y>=X))Y=null;if(z!=null&&(z<0||z>=X))z=X-1;if(Y!=null&&z!=null&&Y>z)Y=null,z=null}if(Y!==J.sceneStart||z!==J.sceneEnd){if(J.sceneStart=Y,J.sceneEnd=z,X1.start=Y,X1.end=z,Q1(),k8(W,q,Y,z),V&&Q?.moduleSettings?.showNotifications)toastr.warning(V,"STMemoryBooks")}u0()}function u8(Z){let Q=parseInt(Z.getAttribute("mesid")),G=Z.querySelector(".extraMesButtons");if(!G){G=document.createElement("div"),G.classList.add("extraMesButtons");let q=Z.querySelector(".mes_block");if(q)q.appendChild(G);else Z.appendChild(G)}if(Z.querySelector(".mes_stmb_start"))return;let J=document.createElement("div");J.title=D1("Mark Scene Start","STMemoryBooks_MarkSceneStart"),J.classList.add("mes_stmb_start","mes_button","fa-solid","fa-caret-right","interactable"),J.setAttribute("tabindex","0"),J.setAttribute("data-i18n","[title]STMemoryBooks_MarkSceneStart");let W=document.createElement("div");W.title=D1("Mark Scene End","STMemoryBooks_MarkSceneEnd"),W.classList.add("mes_stmb_end","mes_button","fa-solid","fa-caret-left","interactable"),W.setAttribute("tabindex","0"),W.setAttribute("data-i18n","[title]STMemoryBooks_MarkSceneEnd"),J.addEventListener("click",(q)=>{q.stopPropagation(),L6(Q,"start")}),W.addEventListener("click",(q)=>{q.stopPropagation(),L6(Q,"end")}),G.appendChild(J),G.appendChild(W)}async function B8(){let Z=m();if(Z.sceneStart===null||Z.sceneEnd===null)return null;let Q=m0[Z.sceneStart],G=m0[Z.sceneEnd];if(!Q||!G)return null;let J=(W)=>{let q=W.mes||"";return q.length>100?q.substring(0,100)+"...":q};try{let W=i0(Z.sceneStart,Z.sceneEnd),q=p0(W),Y=await h6(q);return{sceneStart:Z.sceneStart,sceneEnd:Z.sceneEnd,startExcerpt:J(Q),endExcerpt:J(G),startSpeaker:Q.name||"Unknown",endSpeaker:G.name||"Unknown",messageCount:Z.sceneEnd-Z.sceneStart+1,estimatedTokens:Y}}catch(W){console.warn("STMemoryBooks-SceneManager: getSceneData failed:",W);try{if((W?.message||"").includes("No visible messages"))toastr?.warning?.(D1("Selected range has no visible messages. Adjust start/end.","STMemoryBooks_NoVisibleMessages"),"STMemoryBooks")}catch{}return null}}function T7(Z,Q,G){let J=parseInt(Q),W=Z.sceneStart,q=Z.sceneEnd;if(G==="start"){if(Z.sceneEnd!==null&&(Z.sceneEnd??null)<J)q=null;W=Z.sceneStart===J?null:J}else if(G==="end"){if(Z.sceneStart!==null&&(Z.sceneStart??null)>J)W=null;q=Z.sceneEnd===J?null:J}return{start:W,end:q}}function m8(){let Z=m();X1.start=Z.sceneStart,X1.end=Z.sceneEnd}function oZ(){return{...X1}}var X1;var c0=U0(()=>{d8();_1();H0();X1={start:null,end:null}});import{getRequestHeaders as sZ}from"../../../../script.js";import{translate as N7}from"../../../i18n.js";function O8(Z){return Z.replace(/\w\S*/g,(Q)=>{return Q.charAt(0).toUpperCase()+Q.slice(1).toLowerCase()})}function I7(Z){return Z.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)}function nZ(Z){let Q=Z.split(`
`).filter((G)=>G.trim());if(Q.length>0){let J=Q[0].trim().replace(/^(You are|Analyze|Create|Generate|Write)\s+/i,"").replace(/[:.]/g,"").trim();return O8(J.substring(0,50))}return"Custom Prompt"}function P6(Z,Q){let G=I7(Z),J=G,W=2,q=R0();while(J in Q||J in q)J=`${G}-${W}`,W++;return J}async function l1(Z=null){if(l0)return l0;let Q=!1,G=null;try{let J=await fetch(`/user/files/${rZ}`,{method:"GET",credentials:"include",headers:sZ()});if(!J.ok)Q=!0;else{let W=await J.text();if(G=JSON.parse(W),!aZ(G))Q=!0}}catch(J){Q=!0}if(Q){let J={},W=new Date().toISOString(),q=R0();for(let[Y,z]of Object.entries(q))J[Y]={displayName:v6[Y]||O8(Y),prompt:z,createdAt:W};if(Z&&Z.profiles&&Array.isArray(Z.profiles)){for(let Y of Z.profiles)if(Y.prompt&&Y.prompt.trim()){let z=`Custom: ${Y.name||"Unnamed Profile"}`,V=P6(z,J);J[V]={displayName:z,prompt:Y.prompt,createdAt:W},console.log(`${B1}: Migrated custom prompt from profile "${Y.name}" as "${V}"`)}}G={version:i1.CURRENT_VERSION,overrides:J},await o0(G)}return l0=G,l0}async function o0(Z){try{let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:sZ(),body:JSON.stringify({name:rZ,data:G})});if(!J.ok)throw Error(`Failed to save prompts: ${J.statusText}`);l0=Z,console.log(`${B1}: Prompts saved successfully`)}catch(Q){throw console.error(`${B1}: Error saving overrides:`,Q),Q}}function aZ(Z){if(!Z||typeof Z!=="object")return console.error(`${B1}: Invalid data type`),!1;if(typeof Z.version!=="number")return console.error(`${B1}: Invalid schema version type: ${Z.version}`),!1;if(Z.version!==i1.CURRENT_VERSION)console.warn(`${B1}: Unexpected schema version: ${Z.version} (expected ${i1.CURRENT_VERSION})`);if(!Z.overrides||typeof Z.overrides!=="object")return console.error(`${B1}: Missing or invalid overrides object`),!1;for(let[Q,G]of Object.entries(Z.overrides)){if(!G||typeof G!=="object")return console.error(`${B1}: Invalid override entry for key: ${Q}`),!1;if(typeof G.prompt!=="string"||!G.prompt.trim())return console.error(`${B1}: Invalid or empty prompt for key: ${Q}`),!1;if(G.displayName!==void 0&&typeof G.displayName!=="string")return console.error(`${B1}: Invalid displayName for key: ${Q}`),!1}return!0}async function n0(Z){return await l1(Z),D7=!0,_7=null,!0}async function O0(Z=null){let Q=await l1(Z),G=[];for(let[W,q]of Object.entries(Q.overrides))G.push({key:W,displayName:q.displayName||O8(W),createdAt:q.createdAt||null});let J=R0()||{};for(let W of Object.keys(J))if(!(W in Q.overrides))G.push({key:W,displayName:v6[W]||O8(W),createdAt:null});return G.sort((W,q)=>{if(!W.createdAt)return 1;if(!q.createdAt)return-1;return new Date(q.createdAt)-new Date(W.createdAt)}),G}async function e1(Z,Q=null){let G=await l1(Q);if(G.overrides[Z]){let W=G.overrides[Z].prompt;if(typeof W==="string"&&W.trim())return W}return R0()[Z]||k1()}async function x6(Z,Q=null){let G=await l1(Q);if(G.overrides[Z]&&G.overrides[Z].displayName)return G.overrides[Z].displayName;return v6[Z]||O8(Z)}async function R8(Z,Q,G){let J=await l1(),W=new Date().toISOString();if(!Z)Z=P6(G||nZ(Q),J.overrides);if(J.overrides[Z])J.overrides[Z].prompt=Q,J.overrides[Z].displayName=G||J.overrides[Z].displayName,J.overrides[Z].updatedAt=W;else J.overrides[Z]={displayName:G||nZ(Q),prompt:Q,createdAt:W};return await o0(J),Z}async function tZ(Z){let Q=await l1(),G=Q.overrides[Z];if(!G)throw Error(`Preset "${Z}" not found`);let J=`${G.displayName} (Copy)`,W=P6(J,Q.overrides),q=new Date().toISOString();return Q.overrides[W]={displayName:J,prompt:G.prompt,createdAt:q},await o0(Q),W}async function eZ(Z){let Q=await l1();if(!Q.overrides[Z])throw Error(`Preset "${Z}" not found`);delete Q.overrides[Z],await o0(Q)}async function Z4(){let Z=await l1();return JSON.stringify(Z,null,2)}async function Q4(Z){try{let Q=JSON.parse(Z);if(!aZ(Q))throw Error("Invalid prompts file structure - see console for details");await o0(Q)}catch(Q){throw console.error(`${B1}: Error importing prompts:`,Q),Q}}async function G4(Z="overwrite"){if(Z!=="overwrite")console.warn(`${B1}: Unsupported mode for recreateBuiltInPrompts: ${Z}; defaulting to 'overwrite'`);let Q=await l1(),G=R0(),J=Object.keys(G||{}),W=0;if(Q&&Q.overrides&&typeof Q.overrides==="object"){for(let q of J)if(q in Q.overrides)delete Q.overrides[q],W++}return await o0(Q),l0=Q,console.log(`${B1}: Recreated built-in prompts (removed ${W} overrides)`),{removed:W}}var B1="STMemoryBooks-SummaryPromptManager",rZ,l0=null,D7=!1,_7=null,v6;var c8=U0(()=>{_1();H0();rZ=g0.PROMPTS_FILE,v6=Object.fromEntries(Object.keys(H8).map((Z)=>[Z,N7(H8[Z],f8[Z])]))});var z4={};cZ(z4,{validateProfile:()=>a0,showLorebookSelectionPopup:()=>T0,resolveEffectiveConnectionFromProfile:()=>k6,parseTemperature:()=>g6,normalizeCompletionSource:()=>q1,isValidPreset:()=>S7,getUIModelSettings:()=>Z1,getPresetPrompt:()=>P7,getPresetNames:()=>x7,getEffectivePrompt:()=>Q0,getEffectiveLorebookName:()=>A0,getDefaultPrompt:()=>k1,getCurrentModelSettings:()=>v7,getCurrentMemoryBooksContext:()=>B0,getCurrentApiInfo:()=>l,getBuiltInPresetPrompts:()=>R0,getApiSelectors:()=>f6,generateSafeProfileName:()=>N0,formatPresetDisplayName:()=>E7,estimateTokens:()=>Z0,deepClone:()=>r0,createProfileObject:()=>D0,SELECTORS:()=>o1});import{chat_metadata as s0,characters as S6,name2 as E6,this_chid as b6}from"../../../../script.js";import{getContext as w7,extension_settings as $4}from"../../../extensions.js";import{selected_group as W4,groups as L7}from"../../../group-chats.js";import{METADATA_KEY as y6,world_names as p8}from"../../../world-info.js";import{Popup as q4,POPUP_TYPE as Y4,POPUP_RESULT as i8}from"../../../popup.js";import{translate as g1}from"../../../i18n.js";function C7(...Z){for(let Q of Z){let G=I1(Q);if(G.length)return G}return I1()}function M7(){return document.querySelector("#group_chat_completion_source")?"#group_":"#"}function q1(Z){let Q=String(Z||"").trim().toLowerCase();if(Q==="google")return"makersuite";return Q===""?"openai":Q}function l(){try{let Z="unknown",Q="unknown",G="unknown";if(typeof window.getGeneratingApi==="function")Z=window.getGeneratingApi();else Z=I1(o1.mainApi).val()||"unknown";if(typeof window.getGeneratingModel==="function")Q=window.getGeneratingModel();if(G=I1(o1.completionSource).val()||Z,!h7.includes(G))console.warn(`${u1}: Unsupported completion source: ${G}, falling back to openai`),G="openai";return{api:Z,model:Q,completionSource:G}}catch(Z){return console.warn(`${u1}: Error getting API info:`,Z),{api:I1(o1.mainApi).val()||"unknown",model:"unknown",completionSource:I1(o1.completionSource).val()||"openai"}}}function f6(){let Z=M7(),G=C7(`${Z}chat_completion_source`,"#chat_completion_source").val?.()||"openai",J={openai:`${Z}model_openai_select`,claude:`${Z}model_claude_select`,openrouter:`${Z}model_openrouter_select`,ai21:`${Z}model_ai21_select`,makersuite:`${Z}model_google_select`,mistralai:`${Z}model_mistralai_select`,custom:`${Z}model_custom_select`,cohere:`${Z}model_cohere_select`,perplexity:`${Z}model_perplexity_select`,groq:`${Z}model_groq_select`,nanogpt:`${Z}model_nanogpt_select`,deepseek:`${Z}model_deepseek_select`,electronhub:`${Z}model_electronhub_select`,vertexai:`${Z}model_vertexai_select`,aimlapi:`${Z}model_aimlapi_select`,xai:`${Z}model_xai_select`,pollinations:`${Z}model_pollinations_select`,moonshot:`${Z}model_moonshot_select`,fireworks:`${Z}model_fireworks_select`,cometapi:`${Z}model_cometapi_select`,azure_openai:`${Z}model_azure_openai_select`},W=J[G]||J.openai,q=`${Z}temp_openai`.replace("##","#"),Y=`${Z}temp_counter_openai`.replace("##","#");return{model:W,temp:q,tempCounter:Y}}function B0(){try{let Z=null,Q=null,G=null,J=!!W4,W=W4||null,q=null;if(J){let X=L7?.find((j)=>j.id===W);if(X)q=X.name,Q=X.chat_id,G=Q,Z=q}else{if(E6&&E6.trim())Z=String(E6).trim();else if(b6!==void 0&&S6&&S6[b6])Z=S6[b6].name;else if(s0?.character_name)Z=String(s0.character_name).trim();if(Z&&Z.normalize)Z=Z.normalize("NFC");try{let X=w7();if(X?.chatId)Q=X.chatId,G=Q;else if(typeof window.getCurrentChatId==="function")Q=window.getCurrentChatId(),G=Q}catch(X){if(console.warn(`${u1}: Could not get context, trying fallback methods`),typeof window.getCurrentChatId==="function")Q=window.getCurrentChatId(),G=Q}}let Y=null;if(s0&&y6 in s0)Y=s0[y6];let z=null;try{let X=l(),j=f6(),K=parseFloat(I1(j.temp).val()||I1(j.tempCounter).val()||0.7),F=I1(j.model).val()||"";z={api:X.api,model:F,temperature:K,completionSource:X.completionSource,source:"current_ui"}}catch(X){console.warn(`${u1}: Could not get current model/temperature settings:`,X),z=null}let V={characterName:Z,chatId:Q,chatName:G,groupId:W,isGroupChat:J,lorebookName:Y,modelSettings:z};if(J)V.groupName=q;return V}catch(Z){return console.warn(`${u1}: Error getting context:`,Z),{characterName:null,chatId:null,chatName:null,groupId:null,groupName:null,isGroupChat:!1}}}async function A0(){if(!$4.STMemoryBooks.moduleSettings.manualModeEnabled)return s0?.[y6]||null;let Q=m();if(Q.manualLorebook??null)if(p8.includes(Q.manualLorebook))return Q.manualLorebook;else toastr.error(`The designated manual lorebook "${Q.manualLorebook}" no longer exists. Please select a new one.`),delete Q.manualLorebook;let G=p8.map((Y)=>`<option value="${Y}">${Y}</option>`).join("");if(G.length===0)return toastr.error("No lorebooks found to select from.","STMemoryBooks"),null;let J=`
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Manual mode is enabled, but no lorebook has been designated for this chat's memories. Please select one.</p>
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${G}
            </select>
        </div>
    `,W=new q4(J,Y4.TEXT,"",{okButton:"Select",cancelButton:"Cancel"});if(await W.show()===i8.AFFIRMATIVE){let Y=W.dlg.querySelector("#stmb-manual-lorebook-select").value;return Q.manualLorebook=Y,Q1(),toastr.success(`"${Y}" is now the Memory Book for this chat.`,"STMemoryBooks"),Y}return null}async function T0(Z=null){if(p8.length===0)return toastr.error("No lorebooks found to select from.","STMemoryBooks"),null;let Q=p8.map((q)=>{return`<option value="${q}"${q===Z?" selected":""}>${q}</option>`}).join(""),G=`
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Choose which lorebook should be used for this chat's memories.</p>
            ${Z?`<p><strong>Current:</strong> ${Z}</p>`:""}
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${Q}
            </select>
        </div>
    `,J=new q4(G,Y4.TEXT,"",{okButton:"Select",cancelButton:"Cancel"});if(await J.show()===i8.AFFIRMATIVE){let q=J.dlg.querySelector("#stmb-manual-lorebook-select").value;if(q!==Z){let Y=m();return Y.manualLorebook=q,Q1(),toastr.success(`Manual lorebook changed to: ${q}`,"STMemoryBooks"),q}else return q}return null}function v7(Z){try{if(!Z)throw Error("getCurrentModelSettings requires a profile");let Q=Z.effectiveConnection||Z.connection;if(!Q)throw Error("Profile is missing connection");let G=(Q.model||"").trim();if(!G)throw Error("Profile is missing required connection.model");let J=g6(Q.temperature);if(J===null)J=0.7;return{model:G,temperature:J}}catch(Q){throw console.warn(`${u1}: Error getting current model settings:`,Q),Q}}function Z1(){try{let Z=f6(),Q=(I1(Z.model).val()||"").trim(),G=0.7,J=I1(Z.temp).val()||I1(Z.tempCounter).val();if(J!==null&&J!==void 0&&J!==""){let W=parseFloat(J);if(!isNaN(W)&&W>=0&&W<=2)G=W}return{model:Q,temperature:G}}catch(Z){return console.warn(`${u1}: Error getting UI model settings:`,Z),{model:"",temperature:0.7}}}async function Z0(Z,Q={}){let{estimatedOutput:G=300}=Q,J=String(Z||""),W=Math.ceil(J.length/4);return{input:W,output:G,total:W+G}}function k6(Z){let Q=Z?.effectiveConnection||Z?.connection||{},G=q1(Q.api||"openai"),J=(Q.model||"").trim(),W=0.7;if(typeof Q.temperature==="number"&&!Number.isNaN(Q.temperature))W=Math.max(0,Math.min(2,Q.temperature));let q=Q.endpoint?String(Q.endpoint):void 0,Y=Q.apiKey?String(Q.apiKey):void 0;return{api:G,model:J,temperature:W,endpoint:q,apiKey:Y}}function R0(){return{summary:g1(`You are a talented summarist skilled at capturing scenes from stories comprehensively. Analyze the following roleplay scene and return a detailed memory as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_summary"),summarize:g1(`Analyze the following roleplay scene and return a structured summary as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_summarize"),synopsis:g1(`Analyze the following roleplay scene and return a comprehensive synopsis as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_synopsis"),sumup:g1(`Analyze the following roleplay scene and return a beat summary as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_sumup"),minimal:g1(`Analyze the following roleplay scene and return a minimal memory entry as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Brief 2-5 sentence summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, provide a very brief 2-5 sentence summary of what happened in this scene. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded.

For the keywords field, generate 15-30 specific, descriptive, highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_minimal"),northgate:g1(`You are a memory archivist for a long-form narrative. Your function is to analyze the provided scene and extract all pertinent information into a structured JSON object.

You must respond with ONLY valid JSON in this exact format:
{
"title": "Concise Scene Title (3-5 words)",
"content": "A detailed, literary summary of the scene written in a third-person, past-tense narrative style. Capture all key actions, emotional shifts, character development, and significant dialogue. Focus on "showing" what happened through concrete details. Ensure the summary is comprehensive enough to serve as a standalone record of the scene's events and their impact on the characters.",
"keywords": ["keyword1", "keyword2", "keyword3"]
}

For the "content" field, write with literary quality. Do not simply list events; synthesize them into a coherent narrative block.

For the "keywords" field, provide 15-30 specific and descriptive keywords that capture the scene's core elements. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON object, with no additional text or explanations.`,"STMemoryBooks_Prompt_northgate"),aelemar:g1(`You are a meticulous archivist, skilled at accurately capturing all key plot points and memories from a story. Analyze the following story scene and extract a detailed summary as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_aelemar"),comprehensive:g1(`Analyze the following roleplay scene in the context of previous summaries provided (if available) and return a comprehensive synopsis as JSON.

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

Return ONLY the JSON — no additional text.`,"STMemoryBooks_Prompt_comprehensive")}}function k1(){return g1(`Analyze the following chat scene and return a memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Concise memory focusing on key plot points, character development, and important interactions",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_default")}async function P7(Z){return await e1(Z)}async function Q0(Z){if(!Z)return k1();if(Z.preset)return await e1(Z.preset);else return k1()}function a0(Z){if(!Z||typeof Z!=="object")return console.warn(`${u1}: Profile validation failed - not an object`),!1;if(!Z.name||typeof Z.name!=="string")return console.warn(`${u1}: Profile validation failed - invalid name`),!1;if(Z.connection&&typeof Z.connection!=="object")return console.warn(`${u1}: Profile validation failed - invalid connection`),!1;return!0}function r0(Z){if(Z===null||typeof Z!=="object")return Z;if(Z instanceof Date)return new Date(Z.getTime());if(Array.isArray(Z))return Z.map((G)=>r0(G));let Q={};for(let G in Z)if(Z.hasOwnProperty(G))Q[G]=r0(Z[G]);return Q}function x7(){return["summary","summarize","synopsis","sumup","minimal","northgate","aelemar","comprehensive"]}function S7(Z){return new Set(["summary","summarize","synopsis","sumup","minimal","northgate","aelemar","comprehensive"]).has(Z)}function N0(Z,Q=[]){if(!Z||typeof Z!=="string")Z="New Profile";let G=Z.trim().replace(/[<>:"/\\|?*]/g,"");if(!G)G="New Profile";let J=G,W=1;while(Q.includes(J))J=`${G} (${W})`,W++;return J}function g6(Z){if(typeof Z==="number")return isNaN(Z)?null:Math.max(0,Math.min(2,Z));if(typeof Z==="string"){let Q=parseFloat(Z);return isNaN(Q)?null:Math.max(0,Math.min(2,Q))}return null}function E7(Z){let Q=H8[Z],G=f8[Z];return Q&&G&&g1(Q,G)||Z}function D0(Z={}){let Q=g6(Z.temperature);if(Q===null)Q=0.7;let G={name:(Z.name||"New Profile").trim(),connection:{api:Z.api||"openai",temperature:Q},prompt:(Z.prompt||"").trim(),preset:Z.preset||"",constVectMode:Z.constVectMode||"link",position:Z.position!==void 0?Number(Z.position):0,orderMode:Z.orderMode||"auto",orderValue:Z.orderValue!==void 0?Number(Z.orderValue):100,preventRecursion:Z.preventRecursion!==void 0?Z.preventRecursion:!0,delayUntilRecursion:Z.delayUntilRecursion!==void 0?Z.delayUntilRecursion:!0};if(Z.titleFormat||!Z.isDynamicProfile)G.titleFormat=Z.titleFormat||"[000] - {{title}}";let J=(Z.model||"").trim();if(J)G.connection.model=J;let W=(Z.endpoint||"").trim();if(W)G.connection.endpoint=W;let q=(Z.apiKey||"").trim();if(q)G.connection.apiKey=q;if(G.prompt&&G.preset)G.preset="";if(!G.prompt&&!G.preset)G.preset="summary";try{if(Number(G.position)===7&&typeof Z.outletName==="string"){let Y=Z.outletName.trim();if(Y)G.outletName=Y}}catch{}return G}var u1="STMemoryBooks-Utils",I1,o1,h7;var _1=U0(()=>{c0();c8();H0();I1=window.jQuery;o1={extensionsMenu:"#extensionsMenu .list-group",menuItem:"#stmb-menu-item",chatContainer:"#chat",mainApi:"#main_api",completionSource:"#chat_completion_source",modelOpenai:"#model_openai_select",modelClaude:"#model_claude_select",modelOpenrouter:"#model_openrouter_select",modelAi21:"#model_ai21_select",modelGoogle:"#model_google_select",modelMistralai:"#model_mistralai_select",modelCohere:"#model_cohere_select",modelPerplexity:"#model_perplexity_select",modelGroq:"#model_groq_select",modelNanogpt:"#model_nanogpt_select",modelDeepseek:"#model_deepseek_select",modelElectronhub:"#model_electronhub_select",modelVertexai:"#model_vertexai_select",modelAimlapi:"#model_aimlapi_select",modelXai:"#model_xai_select",modelPollinations:"#model_pollinations_select",modelMoonshot:"#model_moonshot_select",modelFireworks:"#model_fireworks_select",modelCometapi:"#model_cometapi_select",modelAzureOpenai:"#model_azure_openai_select",tempOpenai:"#temp_openai",tempCounterOpenai:"#temp_counter_openai"},h7=["openai","claude","openrouter","ai21","makersuite","vertexai","mistralai","custom","cohere","perplexity","groq","nanogpt","deepseek","electronhub","aimlapi","xai","pollinations","moonshot","fireworks","cometapi","azure_openai"]});import{chat as l8,name1 as b7,name2 as X4}from"../../../../script.js";import{getContext as y7}from"../../../extensions.js";import{t as h1,translate as O1}from"../../../i18n.js";function p0(Z){let{sceneStart:Q,sceneEnd:G,chatId:J,characterName:W}=Z;if(Q==null||G==null)throw Error(O1("Scene markers are required","chatcompile.errors.sceneMarkersRequired"));if(Q>G)throw Error(O1("Start message cannot be greater than end message","chatcompile.errors.startGreaterThanEnd"));if(Q<0||G>=l8.length)throw Error(h1`Message IDs out of bounds: ${Q}-${G} (0-${l8.length-1})`);let q=[],Y=0,z=0;for(let j=Q;j<=G;j++){let K=l8[j];if(!K){z++;continue}if(K.is_system){Y++;continue}let F={id:j,name:f7(K.name),mes:k7(K.mes,K.is_user),send_date:K.send_date||new Date().toISOString()};if(K.is_user!==void 0)F.is_user=K.is_user;q.push(F)}let X={metadata:{sceneStart:Q,sceneEnd:G,chatId:J||"unknown",characterName:W||X4||O1("Unknown","common.unknown"),messageCount:q.length,totalRequestedRange:G-Q+1,hiddenMessagesSkipped:Y,messagesSkipped:z,compiledAt:new Date().toISOString(),totalChatLength:l8.length,userName:b7||O1("User","chatcompile.defaults.user")},messages:q};if(q.length===0)throw Error(h1`No visible messages in range ${Q}-${G}`);return X}function i0(Z,Q){let G=y7();return{sceneStart:Z,sceneEnd:Q,chatId:G.chatId||"unknown",characterName:G.name2||X4||O1("Unknown","common.unknown")}}async function h6(Z){let Q=u6(Z),{input:G}=await Z0(Q,{estimatedOutput:0});return G}async function V4(Z){let{metadata:Q,messages:G}=Z,J=new Set,W=0,q=0,Y=0;return G.forEach((z)=>{if(J.add(z.name),W+=(z.mes||"").length,z.is_user)q++;else Y++}),{messageCount:G.length,speakerCount:J.size,speakers:Array.from(J),totalCharacters:W,estimatedTokens:await h6(Z),userMessages:q,characterMessages:Y,timeSpan:{start:G[0]?.send_date,end:G[G.length-1]?.send_date}}}function j4(Z){let Q=[],G=[];if(!Z.metadata)Q.push(O1("Missing metadata","chatcompile.validation.errors.missingMetadata"));if(!Z.messages||!Array.isArray(Z.messages))Q.push(O1("Invalid messages array","chatcompile.validation.errors.invalidMessagesArray"));if(Z.messages&&Z.messages.length===0)G.push(O1("No messages","chatcompile.validation.warnings.noMessages"));if(Z.messages)Z.messages.forEach((W,q)=>{if(!W.id&&W.id!==0)G.push(h1`Message at index ${q} missing id`);if(!W.name)G.push(h1`Message at index ${q} missing name`);if(!W.mes&&W.mes!=="")G.push(h1`Message at index ${q} missing content`)});if(Z.messages&&Z.messages.length>100)G.push(O1("Very large scene","chatcompile.validation.warnings.veryLargeScene"));return{valid:Q.length===0,errors:Q,warnings:G}}function u6(Z){let{metadata:Q,messages:G}=Z,J=[];return J.push(O1("=== SCENE METADATA ===","chatcompile.readable.headerMetadata")),J.push(h1`Range: ${Q.sceneStart}-${Q.sceneEnd}`),J.push(h1`Chat: ${Q.chatId}`),J.push(h1`Character: ${Q.characterName}`),J.push(h1`Compiled: ${Q.messageCount}`),J.push(h1`Compiled at: ${Q.compiledAt}`),J.push(""),J.push(O1("=== SCENE MESSAGES ===","chatcompile.readable.headerMessages")),G.forEach((W)=>{J.push(h1`[${W.id}] ${W.name}: ${W.mes}`)}),J.join(`
`)}function f7(Z){if(!Z)return O1("Unknown","common.unknown");return Z.trim()||O1("Unknown","common.unknown")}function k7(Z,Q=!1){if(!Z)return"";try{return String(Z).replace(/\r\n/g,`
`).trim()}catch(G){return String(Z).trim()}}var d8=U0(()=>{_1()});var F4=k0((W$,o8)=>{if(typeof o8==="object"&&typeof o8.exports==="object")o8.exports=m6;m6.defunct=function(Z){throw Error("Unexpected character at index "+(this.index-1)+": "+Z)};function m6(Z){if(typeof Z!=="function")Z=m6.defunct;var Q=[],G=[],J=0;this.state=0,this.index=0,this.input="",this.addRule=function(q,Y,z){var V=q.global;if(!V){var X="g";if(q.multiline)X+="m";if(q.ignoreCase)X+="i";q=new RegExp(q.source,X)}if(Object.prototype.toString.call(z)!=="[object Array]")z=[0];return G.push({pattern:q,global:V,action:Y,start:z}),this},this.setInput=function(q){return J=0,this.state=0,this.index=0,Q.length=0,this.input=q,this},this.lex=function(){if(Q.length)return Q.shift();this.reject=!0;while(this.index<=this.input.length){var q=W.call(this).splice(J),Y=this.index;while(q.length)if(this.reject){var z=q.shift(),V=z.result,X=z.length;this.index+=X,this.reject=!1,J++;var j=z.action.apply(this,V);if(this.reject)this.index=V.index;else if(typeof j<"u")switch(Object.prototype.toString.call(j)){case"[object Array]":Q=j.slice(1),j=j[0];default:if(X)J=0;return j}}else break;var K=this.input;if(Y<K.length)if(this.reject){J=0;var j=Z.call(this,K.charAt(this.index++));if(typeof j<"u")if(Object.prototype.toString.call(j)==="[object Array]")return Q=j.slice(1),j[0];else return j}else{if(this.index!==Y)J=0;this.reject=!0}else if(q.length)this.reject=!0;else break}};function W(){var q=[],Y=0,z=this.state,V=this.index,X=this.input;for(var j=0,K=G.length;j<K;j++){var F=G[j],H=F.start,B=H.length;if(!B||H.indexOf(z)>=0||z%2&&B===1&&!H[0]){var A=F.pattern;A.lastIndex=V;var T=A.exec(X);if(T&&T.index===V){var R=q.push({result:T,action:F.action,length:T[0].length});if(F.global)Y=R;while(--R>Y){var N=R-1;if(q[R].length>q[N].length){var M=q[R];q[R]=q[N],q[N]=M}}}}}return q}}});var g7={};var K4=U0(()=>{/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */if(!String.fromCodePoint)(function(){var Z=function(){try{var W={},q=Object.defineProperty,Y=q(W,W,W)&&q}catch(z){}return Y}(),Q=String.fromCharCode,G=Math.floor,J=function(W){var q=16384,Y=[],z,V,X=-1,j=arguments.length;if(!j)return"";var K="";while(++X<j){var F=Number(arguments[X]);if(!isFinite(F)||F<0||F>1114111||G(F)!=F)throw RangeError("Invalid code point: "+F);if(F<=65535)Y.push(F);else F-=65536,z=(F>>10)+55296,V=F%1024+56320,Y.push(z,V);if(X+1==j||Y.length>q)K+=Q.apply(null,Y),Y.length=0}return K};if(Z)Z(String,"fromCodePoint",{value:J,configurable:!0,writable:!0});else String.fromCodePoint=J})()});var B4=k0((d6,U4)=>{Object.defineProperty(d6,"__esModule",{value:!0});d6.default=void 0;K4();var u7=/\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g,m7={"0":"\x00",b:"\b",f:"\f",n:`
`,r:"\r",t:"\t",v:"\v","'":"'",'"':'"',"\\":"\\"},n8=function(Q){return String.fromCodePoint(parseInt(Q,16))},d7=function(Q){return String.fromCodePoint(parseInt(Q,8))},c7=function(Q){return Q.replace(u7,function(G,J,W,q,Y,z,V,X){if(W!==void 0)return n8(W);else if(q!==void 0)return n8(q);else if(Y!==void 0)return n8(Y);else if(z!==void 0)return d7(z);else if(X!==void 0)return n8(X);else return m7[V]})};d6.default=c7;U4.exports=d6.default});var O4=k0((s8)=>{/*! https://mths.be/utf8js v3.0.0 by @mathias */(function(Z){var Q=String.fromCharCode;function G(B){var A=[],T=0,R=B.length,N,M;while(T<R)if(N=B.charCodeAt(T++),N>=55296&&N<=56319&&T<R)if(M=B.charCodeAt(T++),(M&64512)==56320)A.push(((N&1023)<<10)+(M&1023)+65536);else A.push(N),T--;else A.push(N);return A}function J(B){var A=B.length,T=-1,R,N="";while(++T<A){if(R=B[T],R>65535)R-=65536,N+=Q(R>>>10&1023|55296),R=56320|R&1023;N+=Q(R)}return N}function W(B){if(B>=55296&&B<=57343)throw Error("Lone surrogate U+"+B.toString(16).toUpperCase()+" is not a scalar value")}function q(B,A){return Q(B>>A&63|128)}function Y(B){if((B&4294967168)==0)return Q(B);var A="";if((B&4294965248)==0)A=Q(B>>6&31|192);else if((B&4294901760)==0)W(B),A=Q(B>>12&15|224),A+=q(B,6);else if((B&4292870144)==0)A=Q(B>>18&7|240),A+=q(B,12),A+=q(B,6);return A+=Q(B&63|128),A}function z(B){var A=G(B),T=A.length,R=-1,N,M="";while(++R<T)N=A[R],M+=Y(N);return M}function V(){if(F>=K)throw Error("Invalid byte index");var B=j[F]&255;if(F++,(B&192)==128)return B&63;throw Error("Invalid continuation byte")}function X(){var B,A,T,R,N;if(F>K)throw Error("Invalid byte index");if(F==K)return!1;if(B=j[F]&255,F++,(B&128)==0)return B;if((B&224)==192)if(A=V(),N=(B&31)<<6|A,N>=128)return N;else throw Error("Invalid continuation byte");if((B&240)==224)if(A=V(),T=V(),N=(B&15)<<12|A<<6|T,N>=2048)return W(N),N;else throw Error("Invalid continuation byte");if((B&248)==240){if(A=V(),T=V(),R=V(),N=(B&7)<<18|A<<12|T<<6|R,N>=65536&&N<=1114111)return N}throw Error("Invalid UTF-8 detected")}var j,K,F;function H(B){j=G(B),K=j.length,F=0;var A=[],T;while((T=X())!==!1)A.push(T);return J(A)}Z.version="3.0.0",Z.encode=z,Z.decode=H})(typeof s8>"u"?s8.utf8={}:s8)});var T4=k0((s7,c6)=>{var p7=F4(),i7=B4(),Y$=O4(),l7=[[/\s*:\s*/,-1],[/\s*,\s*/,-2],[/\s*{\s*/,-3],[/\s*}\s*/,13],[/\s*\[\s*/,-4],[/\s*\]\s*/,12],[/\s*\.\s*/,-5]];function R4(Z){return Z=Z.replace(/\\\//,"/"),i7(Z)}function o7(Z){let Q=new p7,G=0,J=0;return Q.addRule(/"((?:\\.|[^"])*?)($|")/,(W,q)=>{return G+=W.length,{type:11,value:R4(q),row:J,col:G,single:!1}}),Q.addRule(/'((?:\\.|[^'])*?)($|'|(",?[ \t]*\n))/,(W,q)=>{return G+=W.length,{type:11,value:R4(q),row:J,col:G,single:!0}}),Q.addRule(/[\-0-9]*\.[0-9]*([eE][\+\-]?)?[0-9]*(?:\s*)/,(W)=>{return G+=W.length,{type:6,value:parseFloat(W),row:J,col:G}}),Q.addRule(/\-?[0-9]+([eE][\+\-]?)[0-9]*(?:\s*)/,(W)=>{return G+=W.length,{type:6,value:parseFloat(W),row:J,col:G}}),Q.addRule(/\-?[0-9]+(?:\s*)/,(W)=>{return G+=W.length,{type:7,value:parseInt(W),row:J,col:G}}),l7.forEach((W)=>{Q.addRule(W[0],(q)=>{return G+=q.length,{type:W[1],value:q,row:J,col:G}})}),Q.addRule(/\s/,(W)=>{if(W==`
`)G=0,J++;else G+=W.length}),Q.addRule(/\S[ \t]*/,(W)=>{return G+=W.length,{type:14,value:W,row:J,col:G}}),Q.setInput(Z),Q}s7.lexString=A4;function A4(Z,Q){let G=o7(Z),J="";while(J=G.lex())Q(J)}s7.getAllTokens=n7;function n7(Z){let Q=[];return A4(Z,function(J){Q.push(J)}),Q}});var I4=k0((JQ,_4)=>{var t7=T4(),p6=0,_0=1,G0=2,i6=3,r8=4,a8=5,e7=6,N4=7,Y1=8,P1=9,J0=10,ZQ=11,e0=12,Z8=13,QQ=14,$1=15,t0=-1,v1=-2,l6=-3,I0=-4;function D4(Z){if(Z.peek==null)Object.defineProperty(Z,"peek",{enumerable:!1,value:function(){return this[this.length-1]}});if(Z.last==null)Object.defineProperty(Z,"last",{enumerable:!1,value:function(Q){return this[this.length-(1+Q)]}})}function w(Z,Q){return Z&&Z.hasOwnProperty("type")&&Z.type==Q}function I(Z){}JQ.parse=GQ;function GQ(Z,Q){let G=[],J=[];D4(G),D4(J);let W=function(q){J.push(q)};if(t7.lexString(Z,W),J[0].type==I0&&J.last(0).type!=e0)J.push({type:e0,value:"]",row:-1,col:-1});if(J[0].type==l6&&J.last(0).type!=Z8)J.push({type:Z8,value:"}",row:-1,col:-1});for(let q=0;q<J.length;q++){I("Shifting "+J[q].type),G.push(J[q]),I(G),I("Reducing...");while(n1(G))I(G),I("Reducing...")}if(G.length==1&&G[0].type==_0)I("Pre-compile error fix 1"),G=[{type:J0,value:G[0].value}];return t8(G[0],Q)}function n1(Z){let Q=Z.pop();switch(Q.type){case Y1:if(Q.value.trim()=="true")return I("Rule 5"),Z.push({type:i6,value:"true"}),!0;if(Q.value.trim()=="false")return I("Rule 6"),Z.push({type:i6,value:"false"}),!0;if(Q.value.trim()=="null")return I("Rule 7"),Z.push({type:$1,value:null}),!0;break;case QQ:if(w(Z.peek(),Y1))return I("Rule 11a"),Z.peek().value+=Q.value,!0;return I("Rule 11c"),Z.push({type:Y1,value:Q.value}),!0;case N4:if(w(Q,N4)&&w(Z.peek(),Y1))return I("Rule 11b"),Z.peek().value+=Q.value,!0;return I("Rule 11f"),Q.type=$1,Z.push(Q),!0;case ZQ:return I("Rule 11d"),Q.type=$1,Q.value=Q.value,Z.push(Q),!0;case i6:if(I("Rule 11e"),Q.type=$1,Q.value=="true")Q.value=!0;else Q.value=!1;return Z.push(Q),!0;case e7:return I("Rule 11g"),Q.type=$1,Z.push(Q),!0;case $1:if(w(Z.peek(),v1))return I("Rule 12"),Q.type=a8,Z.pop(),Z.push(Q),!0;if(w(Z.peek(),t0))return I("Rule 13"),Q.type=r8,Z.pop(),Z.push(Q),!0;if(w(Z.peek(),Y1)&&w(Z.last(1),$1)){I("Error rule 1");let G=Z.pop();return Z.peek().value+='"'+G.value+'"',Z.peek().value+=Q.value,!0}if(w(Z.peek(),Y1)&&w(Z.last(1),G0)){I("Error rule 2");let G=Z.pop(),J=Z.peek().value.pop();return J+='"'+G.value+'"',J+=Q.value,Z.peek().value.push(J),!0}if(w(Z.peek(),Y1)&&w(Z.last(1),_0)){I("Error rule 3");let G=Z.pop(),J=Z.peek().value.pop(),W=Q.single?"'":'"';return J.value+=W+G.value+W,J.value+=Q.value,Z.peek().value.push(J),!0}if(w(Z.peek(),Y1)){I("Error rule 4");let G=Z.pop().value;return Q.value=G+Q.value,Z.push(Q),!0}break;case P1:if(w(Q,P1)&&w(Z.peek(),v1))return I("Rule 12a"),Q.type=a8,Z.pop(),Z.push(Q),!0;if(w(Z.peek(),t0))return I("Rule 13a"),Q.type=r8,Z.pop(),Z.push(Q),!0;break;case J0:if(w(Z.peek(),v1)){I("Rule 12b");let G={type:a8,value:Q};return Z.pop(),Z.push(G),!0}if(w(Z.peek(),t0)){I("Rule 13b");let G={type:r8,value:Q};return Z.pop(),Z.push(G),!0}if(w(Z.peek(),Y1)){I("Error rule 9");let G=Z.pop();return Z.push({type:p6,key:G.value.trim(),value:Q}),!0}break;case a8:if(w(Z.peek(),G0))return I("Rule 14"),Z.peek().value.push(Q.value),!0;return I("Rule 15"),Z.push({type:G0,value:[Q.value]}),!0;case G0:if(w(Z.peek(),$1))return I("Rule 15a"),Q.value.unshift(Z.peek().value),Z.pop(),Z.push(Q),!0;if(w(Z.peek(),P1))return I("Rule 15b"),Q.value.unshift(Z.peek().value),Z.pop(),Z.push(Q),!0;if(w(Z.peek(),J0))return I("Rule 15c"),Q.value.unshift(Z.peek()),Z.pop(),Z.push(Q),!0;if(w(Z.peek(),Y1)&&(Z.last(1),v1)){I("Error rule 7");let G=Z.pop();Z.push({type:$1,value:G.value}),I("Start subreduce... ("+G.value+")");while(n1(Z));return I("End subreduce"),Z.push(Q),!0}if(w(Z.peek(),G0))return I("Error rule 8"),Z.peek().value.push(Q.value[0]),!0;break;case r8:if(w(Z.peek(),Y1)||w(Z.peek(),$1)||w(Z.peek(),G0)){I("Rule 16");let G=Z.pop();return Z.push({type:p6,key:G.value,value:Q.value}),!0}throw Error("Got a :value that can't be handled at line "+Q.row+":"+Q.col);case p6:if(w(Z.last(0),v1)&&w(Z.last(1),_0))return I("Rule 17"),Z.last(1).value.push(Q),Z.pop(),!0;return I("Rule 18"),Z.push({type:_0,value:[Q]}),!0;case _0:if(w(Z.peek(),_0))return I("Rule 17a"),Q.value.forEach(function(G){Z.peek().value.push(G)}),!0;break;case e0:if(w(Z.peek(),G0)&&w(Z.last(1),I0)){I("Rule 19");let G=Z.pop();return Z.pop(),Z.push({type:P1,value:G.value}),!0}if(w(Z.peek(),P1)&&w(Z.last(1),I0)){I("Rule 19b");let G=Z.pop();return Z.pop(),Z.push({type:P1,value:[G.value]}),!0}if(w(Z.peek(),I0))return I("Rule 22"),Z.pop(),Z.push({type:P1,value:[]}),!0;if(w(Z.peek(),$1)&&w(Z.last(1),I0)){I("Rule 23");let G=Z.pop().value;return Z.pop(),Z.push({type:P1,value:[G]}),!0}if(w(Z.peek(),J0)&&w(Z.last(1),I0)){I("Rule 23b");let G=Z.pop();return Z.pop(),Z.push({type:P1,value:[G]}),!0}if(w(Z.peek(),Y1)&&w(Z.last(1),v1)){I("Error rule 5");let G=Z.pop();Z.push({type:$1,value:G.value}),I("Start subreduce... ("+G.value+")");while(n1(Z));return I("End subreduce"),Z.push({type:e0}),!0}if(w(Z.peek(),v1)&&(w(Z.last(1),Y1)||w(Z.last(1),J0)||w(Z.last(1),$1))){I("Error rule 5a"),Z.pop(),Z.push({type:e0,value:"]"}),I("Start subreduce..."),I("Content: "+JSON.stringify(Z));while(n1(Z));return I("End subreduce"),!0}if(w(Z.peek(),Y1)&&w(Z.last(1),I0)){I("Error rule 5b");let G=Z.pop();return Z.pop(),Z.push({type:P1,value:[G.value]}),!0}if(w(Z.peek(),v1)&&w(Z.last(1),G0)){I("Error rule 5c"),Z.pop(),Z.push({type:e0}),I("Start subreduce..."),I("Content: "+JSON.stringify(Z));while(n1(Z));return I("End subreduce"),!0}break;case Z8:if(w(Z.peek(),_0)&&w(Z.last(1),l6)){I("Rule 20");let G=Z.pop();return Z.pop(),Z.push({type:J0,value:G.value}),!0}if(w(Z.peek(),l6))return I("Rule 21"),Z.pop(),Z.push({type:J0,value:null}),!0;if(w(Z.peek(),Y1)&&w(Z.last(1),t0)){I("Error rule 4a");let G=Z.pop();Z.push({type:$1,value:G.value}),I("Start subreduce... ("+G.value+")");while(n1(Z));return I("End subreduce"),Z.push({type:Z8}),!0}if(w(Z.peek(),t0)){I("Error rule 4b"),Z.push({type:$1,value:null}),I("Starting subreduce...");while(n1(Z));return I("End subreduce."),Z.push({type:Z8}),!0}if(w(Z.peek(),v1))return I("Error rule 10a"),Z.pop(),Z.push({type:Z8}),!0;throw Error("Found } that I can't handle at line "+Q.row+":"+Q.col);case v1:if(w(Z.peek(),v1))return I("Comma error rule 1"),!0;if(w(Z.peek(),Y1)){I("Comma error rule 2");let G=Z.pop();Z.push({type:$1,value:G.value}),I("Starting subreduce...");while(n1(Z));return I("End subreduce."),Z.push(Q),!0}if(w(Z.peek(),t0)){I("Comma error rule 3"),Z.push({type:$1,value:null}),I("Starting subreduce...");while(n1(Z));return I("End subreduce."),Z.push(Q),!0}}return Z.push(Q),!1}function t8(Z,Q){if(["boolean","number","string"].indexOf(typeof Z)!=-1)return Z;if(Z===null)return null;if(Array.isArray(Z)){let J=[];while(Z.length>0)J.unshift(t8(Z.pop()));return J}if(w(Z,J0)){let J={};if(Z.value===null)return{};return Z.value.forEach(function(W){let q=W.key,Y=t8(W.value);if(Q&&q in J)J[q]={value:J[q],next:Y};else J[q]=Y}),J}if(w(Z,P1))return t8(Z.value);return Z.value}});var L4=k0((YQ,w4)=>{var WQ=I4();YQ.parse=qQ;function qQ(Z,Q){let G=!0,J=!1;if(Q){if("fallback"in Q&&Q[G]===!1)G=!1;J="duplicateKeys"in Q&&Q.duplicateKeys===!0}try{return WQ.parse(Z,J)}catch(W){if(G===!1)throw W;try{let q=JSON.parse(Z);return console.warn("dirty-json got valid JSON that failed with the custom parser. We're returning the valid JSON, but please file a bug report here: https://github.com/RyanMarcus/dirty-json/issues  -- the JSON that caused the failure was: "+Z),q}catch(q){throw W}}}});var U5={};cZ(U5,{upsertTemplate:()=>Y6,removeTemplate:()=>FZ,recreateBuiltInSidePrompts:()=>HZ,loadSidePrompts:()=>x1,listTemplates:()=>q0,listEnabledByType:()=>KG,listByTrigger:()=>z6,importFromJSON:()=>UZ,getTemplate:()=>XZ,firstRunInitIfMissing:()=>FG,findTemplateByName:()=>VZ,exportToJSON:()=>KZ,duplicateTemplate:()=>jZ,clearCache:()=>UG});import{getRequestHeaders as z5}from"../../../../script.js";import{t as q6,translate as e}from"../../../i18n.js";function I8(){return new Date().toISOString()}function K1(Z){return String(Z||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)||"sideprompt"}function V5(Z){if(!Z||typeof Z!=="object")return!1;if(typeof Z.version!=="number")return!1;if(!Z.prompts||typeof Z.prompts!=="object")return!1;for(let[Q,G]of Object.entries(Z.prompts)){if(!G||typeof G!=="object")return!1;if(G.key!==Q)return!1;if(typeof G.name!=="string"||!G.name.trim())return!1;if(typeof G.enabled!=="boolean")return!1;if(typeof G.prompt!=="string")return!1;if(!G.settings||typeof G.settings!=="object")return!1;if(!G.triggers||typeof G.triggers!=="object")return!1;if(G.triggers.onInterval!=null){let J=G.triggers.onInterval;if(typeof J!=="object")return!1;let W=Number(J.visibleMessages);if(!Number.isFinite(W)||W<1)return!1}if(G.triggers.onAfterMemory!=null){let J=G.triggers.onAfterMemory;if(typeof J!=="object")return!1;if(typeof J.enabled!=="boolean")return!1}if(G.triggers.commands!=null){if(!Array.isArray(G.triggers.commands))return!1;for(let J of G.triggers.commands)if(typeof J!=="string"||!J.trim())return!1}}return!0}function j5(Z){if(!Z||typeof Z!=="object")return!1;if(!Z.prompts||typeof Z.prompts!=="object")return!1;return Object.values(Z.prompts).some((Q)=>Q&&typeof Q==="object"&&("type"in Q)&&!("triggers"in Q))}function F5(Z){let Q=I8(),G={version:Math.max(2,Number(Z.version||1)+1),prompts:{}};for(let[J,W]of Object.entries(Z.prompts||{})){let q={key:J,name:String(W.name||"Side Prompt"),enabled:!!W.enabled,prompt:String(W.prompt!=null?W.prompt:"this is a placeholder prompt"),responseFormat:String(W.responseFormat||""),settings:{...W.settings||{}},createdAt:W.createdAt||Q,updatedAt:Q,triggers:{onInterval:void 0,onAfterMemory:void 0,commands:["sideprompt"]}},Y=String(W.type||"").toLowerCase();if(Y==="tracker"){let z=Math.max(1,Number(W.settings?.intervalVisibleMessages||50));q.triggers.onInterval={visibleMessages:z}}else if(Y==="plotpoints"){let z=!!(W.settings?.withMemories??!0);q.triggers.onAfterMemory={enabled:!!z}}else if(Y==="scoreboard"){if(!!(W.settings?.withMemories??!1))q.triggers.onAfterMemory={enabled:!0}}G.prompts[J]=q}return G}function K5(){let Z=I8(),Q={};{let G=K1("Plotpoints");Q[G]={key:G,name:e("Plotpoints","STMemoryBooks_Plotpoints"),enabled:!1,prompt:e("Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.","STMemoryBooks_PlotpointsPrompt"),responseFormat:e(`=== Plot Points ===
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
`,"STMemoryBooks_PlotpointsResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:2,orderMode:"manual",orderValue:25,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=K1("Status");Q[G]={key:G,name:e("Status","STMemoryBooks_Status"),enabled:!1,prompt:e("Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.","STMemoryBooks_StatusPrompt"),responseFormat:e(`Follow this general format:

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
- OOC Summary (1 paragraph)`,"STMemoryBooks_StatusResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"link",position:3,orderMode:"manual",orderValue:25,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=K1("Cast");Q[G]={key:G,name:e("Cast of Characters","STMemoryBooks_CastOfCharacters"),enabled:!1,prompt:e(`You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. 
Step 1: Review the scene and either add or update plot-related NPCs to the NPC WHO'S WHO report. Please note that {{char}} and {{user}} are major characters and do NOT need to be included in this report.
Step 2: This list should be kept in order of importance to the plot, so it may need to be reordered.
Step 3: If your response would be more than 2000 tokens long, remove NPCs with the least impact to the plot.`,"STMemoryBooks_CastOfCharactersPrompt"),responseFormat:e(`===NPC WHO'S WHO===
(In order of importance to the plot)

Person 1: 1-2 sentence desription
Person 2: 1-2 sentence desription
===END NPC WHO'S WHO===`,"STMemoryBooks_CastOfCharactersResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:3,orderMode:"manual",orderValue:15,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=K1("Assess");Q[G]={key:G,name:e("Assess","STMemoryBooks_Assess"),enabled:!1,prompt:e('Assess the interaction between {{char}} and {{user}} to date. List all the information {{char}} has learned about {{user}} through observation, questioning, or drawing conclusions from interaction (similar to a mental "note to self"). If there is already a list, update it. Try to keep it token-efficient and compact, focused on the important things.',"STMemoryBooks_AssessPrompt"),responseFormat:e(`Use this format: 
=== Things {{char}} has learned about {{user}} ===
(detailed list, in {{char}}'s POV/tone of voice)
===`,"STMemoryBooks_AssessResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:2,orderMode:"manual",orderValue:30,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}return Q}function zZ(){return{version:Math.max(2,i1.CURRENT_VERSION||2),prompts:K5()}}async function m1(Z){let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:z5(),body:JSON.stringify({name:X5,data:G})});if(!J.ok)throw Error(q6`Failed to save side prompts: ${J.status} ${J.statusText}`);v0=Z,console.log(`${W8}: ${e("Side prompts saved successfully","STMemoryBooks_SidePromptsSaved")}`)}async function x1(){if(v0)return v0;let Z=null;try{let Q=await fetch(`/user/files/${X5}`,{method:"GET",credentials:"include",headers:z5()});if(!Q.ok)Z=zZ(),await m1(Z);else{let G=await Q.text(),J=JSON.parse(G);if(j5(J))console.log(`${W8}: ${e("Migrating side prompts file from V1(type) to V2(triggers)","STMemoryBooks_MigratingSidePrompts")}`),Z=F5(J),await m1(Z);else if(!V5(J))console.warn(`${W8}: ${e("Invalid side prompts file structure; recreating with built-ins","STMemoryBooks_InvalidSidePromptsFile")}`),Z=zZ(),await m1(Z);else if(Z=J,Number(Z.version||1)<2)Z.version=2,await m1(Z)}}catch(Q){console.warn(`${W8}: ${e("Error loading side prompts; creating base doc","STMemoryBooks_ErrorLoadingSidePrompts")}`,Q),Z=zZ(),await m1(Z)}return v0=Z,v0}async function FG(){return await x1(),!0}async function q0(){let Z=await x1(),Q=Object.values(Z.prompts);return Q.sort((G,J)=>{let W=G.updatedAt||G.createdAt||"";return(J.updatedAt||J.createdAt||"").localeCompare(W)}),Q}async function XZ(Z){return(await x1()).prompts[Z]||null}async function VZ(Z){let Q=await x1(),G=String(Z||"").trim();if(!G)return null;let J=G.toLowerCase(),W=K1(G),q=J.replace(/[^a-z0-9]+/g," ").trim(),Y=Object.values(Q.prompts);for(let z of Y){let V=String(z.name||"").toLowerCase(),X=String(z.key||"").toLowerCase(),j=K1(z.name||"");if(V===J||X===J||j===W)return z}for(let z of Y){let V=String(z.name||"").toLowerCase(),X=String(z.key||"").toLowerCase(),j=K1(z.name||"");if(V.startsWith(J)||j.startsWith(W)||X.startsWith(J))return z}for(let z of Y){let V=String(z.name||"").toLowerCase(),X=K1(z.name||""),j=V.replace(/[^a-z0-9]+/g," ").trim();if(V.includes(J)||X.includes(W)||q&&j.includes(q))return z}return null}async function Y6(Z){let Q=await x1(),G=!Z.key,J=I8(),W=String(Z.name??"").trim(),q=G?null:Q.prompts[Z.key],Y=W||(G?e("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt"):q?.name||e("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")),z;if(Z.key)z=Z.key;else{let K=K1(Y||e("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")),F=2;while(Q.prompts[K])K=K1(`${Y} ${F}`),F++;z=K}let V=Q.prompts[z],X={key:z,name:Y,enabled:typeof Z.enabled==="boolean"?Z.enabled:V?.enabled??!1,prompt:String(Z.prompt!=null?Z.prompt:V?.prompt||"this is a placeholder prompt"),responseFormat:String(Z.responseFormat!=null?Z.responseFormat:V?.responseFormat||""),settings:{...V?.settings||{},...Z.settings||{}},triggers:Z.triggers?Z.triggers:V?.triggers||{commands:["sideprompt"]},createdAt:V?.createdAt||J,updatedAt:J};if(X.triggers.onInterval){let j=Math.max(1,Number(X.triggers.onInterval.visibleMessages||50));X.triggers.onInterval={visibleMessages:j}}if(X.triggers.onAfterMemory)X.triggers.onAfterMemory={enabled:!!X.triggers.onAfterMemory.enabled};if("commands"in X.triggers)if(Array.isArray(X.triggers.commands))X.triggers.commands=X.triggers.commands.filter((j)=>typeof j==="string"&&j.trim());else X.triggers.commands=[];else X.triggers.commands=["sideprompt"];return Q.prompts[z]=X,await m1(Q),z}async function jZ(Z){let Q=await x1(),G=Q.prompts[Z];if(!G)throw Error(q6`Template "${Z}" not found`);let J=q6`${G.name} (Copy)`,W=K1(J),q=2;while(Q.prompts[W])W=K1(`${J} ${q}`),q++;let Y=I8();return Q.prompts[W]={...G,key:W,name:J,createdAt:Y,updatedAt:Y},await m1(Q),W}async function FZ(Z){let Q=await x1();if(!Q.prompts[Z])throw Error(q6`Template "${Z}" not found`);delete Q.prompts[Z],await m1(Q)}async function KZ(){let Z=await x1();return JSON.stringify(Z,null,2)}async function UZ(Z){let Q=JSON.parse(Z),G=null;if(V5(Q))G=Q;else if(j5(Q))G=F5(Q);else throw Error(e("Invalid side prompts file structure","STMemoryBooks_InvalidSidePromptsJSON"));let J=await x1(),W={version:Math.max(2,Number(J.version||2),Number(G.version||2)),prompts:{...J.prompts}},q=(V,X)=>{let j=String(X||"").trim()||V||"sideprompt",K=K1(j),F=V&&!W.prompts[V]?V:K;if(!F)F="sideprompt";let H=2;while(W.prompts[F])F=K1(`${j} ${H}`),H++;return F},Y=0,z=0;for(let[V,X]of Object.entries(G.prompts||{})){let j=W.prompts[V]?q(null,X?.name||V):V;if(j!==V)z++;let K=I8(),F={key:j,name:String(X.name||"Side Prompt"),enabled:!!X.enabled,prompt:String(X.prompt!=null?X.prompt:"this is a placeholder prompt"),responseFormat:String(X.responseFormat||""),settings:{...X.settings||{}},triggers:X.triggers?{...X.triggers}:{commands:["sideprompt"]},createdAt:X.createdAt||K,updatedAt:K};if(F.triggers.onInterval){let H=Math.max(1,Number(F.triggers.onInterval.visibleMessages||50));F.triggers.onInterval={visibleMessages:H}}if(F.triggers.onAfterMemory)F.triggers.onAfterMemory={enabled:!!F.triggers.onAfterMemory.enabled};if("commands"in F.triggers)if(Array.isArray(F.triggers.commands))F.triggers.commands=F.triggers.commands.filter((H)=>typeof H==="string"&&H.trim());else F.triggers.commands=[];else F.triggers.commands=["sideprompt"];W.prompts[j]=F,Y++}return await m1(W),{added:Y,renamed:z}}async function HZ(Z="overwrite"){if(Z!=="overwrite")console.warn(`${W8}: Unsupported mode for recreateBuiltInSidePrompts: ${Z}; defaulting to 'overwrite'`);let Q=await x1(),G=K5(),J=Object.keys(G||{}),W=0;if(!Q||!Q.prompts||typeof Q.prompts!=="object")throw Error(e("Invalid side prompts document","STMemoryBooks_InvalidSidePromptsJSON"));for(let q of J)Q.prompts[q]=G[q],W++;return await m1(Q),v0=Q,console.log(`${W8}: Recreated built-in side prompts (overwrote ${W} entries)`),{replaced:W}}async function KG(Z){let Q=String(Z||"").toLowerCase(),G=await q0();if(Q==="tracker")return G.filter((J)=>J.enabled&&J.triggers?.onInterval&&Number(J.triggers.onInterval.visibleMessages)>=1);if(Q==="plotpoints")return G.filter((J)=>J.enabled&&J.triggers?.onAfterMemory?.enabled);if(Q==="scoreboard")return G.filter((J)=>J.enabled&&(Array.isArray(J.triggers?.commands)||J.triggers?.onAfterMemory?.enabled));return[]}async function z6(Z){let Q=await q0();if(Z==="onInterval")return Q.filter((G)=>G.enabled&&G.triggers?.onInterval&&Number(G.triggers.onInterval.visibleMessages)>=1);if(Z==="onAfterMemory")return Q.filter((G)=>G.enabled&&G.triggers?.onAfterMemory?.enabled);if(Z&&Z.startsWith("command:")){let G=Z.slice(8).trim();return Q.filter((J)=>Array.isArray(J.triggers?.commands)&&J.triggers.commands.some((W)=>W.toLowerCase()===G.toLowerCase()))}return[]}function UG(){v0=null}var W8="STMemoryBooks-SidePromptsManager",X5,v0=null;var w8=U0(()=>{H0();X5=g0.SIDE_PROMPTS_FILE});d8();import{eventSource as r1,event_types as F0,chat as $7,chat_metadata as b0,saveSettingsDebounced as n,characters as xZ,this_chid as bG,name1 as Q3,name2 as G3,saveMetadata as J3,getCurrentChatId as $3,settings as W3}from"../../../../script.js";import{Popup as J1,POPUP_TYPE as a,POPUP_RESULT as p}from"../../../popup.js";import{extension_settings as o,saveMetadataDebounced as z3}from"../../../extensions.js";import{SlashCommandParser as Y8}from"../../../slash-commands/SlashCommandParser.js";import{SlashCommand as z8}from"../../../slash-commands/SlashCommand.js";import{SlashCommandEnumValue as bZ}from"../../../slash-commands/SlashCommandEnumValue.js";import{ARGUMENT_TYPE as H6,SlashCommandArgument as B6}from"../../../slash-commands/SlashCommandArgument.js";import{executeSlashCommands as yG}from"../../../slash-commands.js";import{METADATA_KEY as E8,world_names as A6,loadWorldInfo as fG,createNewWorldInfo as H3,saveWorldInfo as kG,reloadEditor as gG}from"../../../world-info.js";import{lodash as uG,Handlebars as mG,DOMPurify as V8}from"../../../../lib.js";import{escapeHtml as b}from"../../../utils.js";_1();var h4=I6(L4(),1);import{getTokenCount as X$}from"../../../tokenizers.js";import{characters as o6,this_chid as C4,substituteParams as XQ,getRequestHeaders as VQ}from"../../../../script.js";import{oai_settings as e8}from"../../../openai.js";import{runRegexScript as jQ,getRegexScripts as FQ}from"../../../extensions/regex/engine.js";import{groups as M4}from"../../../group-chats.js";import{extension_settings as A8}from"../../../extensions.js";var B$=window.jQuery;function KQ(Z){try{let Q={...Z};return Q.disabled=!1,Q}catch{return Z}}function v4(Z,Q){if(typeof Z!=="string")return"";if(!Array.isArray(Q)||Q.length===0)return Z;try{let G=FQ({allowedOnly:!1})||[],J=Q.map((q)=>Number(String(q).replace(/^idx:/,""))).filter((q)=>Number.isInteger(q)&&q>=0&&q<G.length),W=Z;for(let q of J){let Y=KQ(G[q]);try{W=jQ(Y,W)}catch(z){console.warn("applySelectedRegex: script failed",q,z)}}return W}catch(G){return console.warn("applySelectedRegex failed",G),Z}}class n6 extends Error{constructor(Z,Q){super(Z);this.name="TokenWarningError",this.tokenCount=Q}}class Q8 extends Error{constructor(Z){super(Z);this.name="AIResponseError"}}class s6 extends Error{constructor(Z){super(Z);this.name="InvalidProfileError"}}function UQ(){return"/api/backends/chat-completions/generate"}async function w0({model:Z,prompt:Q,temperature:G=0.7,api:J="openai",endpoint:W=null,apiKey:q=null,extra:Y={}}){let z=UQ(),V=VQ(),X=Math.max(Number(Y.max_tokens)||0,Number(e8.max_response)||0),j=Math.floor(X)||0;if(Number.isFinite(j)&&j>0)if((typeof Z==="string"?Z.toLowerCase():"").includes("gpt-5"))Y.max_completion_tokens=j,delete Y.max_tokens;else Y.max_tokens=j;if(Y.max_output_tokens!=null){let A=Math.floor(Y.max_output_tokens)||0;if(Number.isFinite(Y.max_tokens)&&Y.max_tokens>0)Y.max_output_tokens=Math.min(A,Y.max_tokens);else Y.max_output_tokens=A}let K={messages:[{role:"user",content:Q}],model:Z,temperature:G,chat_completion_source:J,...Y};if(J==="full-manual"&&W&&q)z=W,V={"Content-Type":"application/json",Authorization:`Bearer ${q}`},K={model:Z,messages:[{role:"user",content:Q}],temperature:G,...Y};else if(J==="custom"&&Z)K.custom_model_id=Z,K.custom_url=e8.custom_url||"";else if(J==="deepseek")K.custom_url="https://api.deepseek.com/chat/completions";let F=await fetch(z,{method:"POST",headers:V,body:JSON.stringify(K)});if(!F.ok){let A="";try{A=await F.text()}catch(R){A=""}let T=Error(`LLM request failed: ${F.status} ${F.statusText}`);if(A)T.providerBody=A;throw T}let H=await F.json(),B="";if(H.choices?.[0]?.message?.content)B=H.choices[0].message.content;else if(H.completion)B=H.completion;else if(H.choices?.[0]?.text)B=H.choices[0].text;else if(H.content&&Array.isArray(H.content))B=H.content.find((T)=>T&&typeof T==="object"&&T.type==="text"&&T.text)?.text||"";else if(typeof H.content==="string")B=H.content;return{text:B,full:H}}async function P4({api:Z,model:Q,prompt:G,temperature:J=0.7,endpoint:W=null,apiKey:q=null,extra:Y={}}){return await w0({model:Q,prompt:G,temperature:J,api:Z,endpoint:W,apiKey:q,extra:Y})}async function HQ(Z={},Q=null){let G;if(typeof Z==="number")G={maxWaitMs:Z,initialIntervalMs:Q||250,maxIntervalMs:1000,backoffMultiplier:1.2,useExponentialBackoff:!1};else G={maxWaitMs:5000,initialIntervalMs:100,maxIntervalMs:1000,backoffMultiplier:1.5,useExponentialBackoff:!0,...Z};let{maxWaitMs:J,initialIntervalMs:W,maxIntervalMs:q,backoffMultiplier:Y,useExponentialBackoff:z,signal:V}=G,X=Date.now(),j=W,K=0,{getCurrentMemoryBooksContext:F}=await Promise.resolve().then(() => (_1(),z4)),H=F();while(Date.now()-X<J){if(V?.aborted)return!1;if(H.isGroupChat){if(M4&&H.groupId){if(M4.find((A)=>A.id===H.groupId))return!0}}else if(o6&&o6.length>C4&&o6[C4])return!0;if(await new Promise((B,A)=>{let T=setTimeout(B,j);if(V){let R=()=>{clearTimeout(T),A(Error("Cancelled"))};V.addEventListener("abort",R,{once:!0})}}).catch(()=>{return!1}),z&&j<q)j=Math.min(j*Y,q)}return!1}function BQ(Z){try{if(typeof Z==="object"&&Z!==null&&Array.isArray(Z.content)){let Q=Z.content.find((G)=>G&&typeof G==="object"&&G.type==="text"&&G.text);if(Q&&typeof Q.text==="string")return Q.text}return null}catch(Q){return null}}function OQ(Z){try{let Q=0,G=0,J=!1,W=!1;for(let q=0;q<Z.length;q){let Y=Z[q];if(J){if(W)W=!1;else if(Y==="\\")W=!0;else if(Y==='"')J=!1}else if(Y==='"')J=!0;else if(Y==="{");else if(Y==="}")Q--;else if(Y==="[");else if(Y==="]")G--;if(Q<0||G<0)return!0}return J||Q!==0||G!==0}catch{return!1}}function RQ(Z){let Q=(Z||"").trim();if(!Q)return!0;if(/[.!?]["'’\)\]]?$/.test(Q))return!0;if(Q.length>=80&&!/[.!?]$/.test(Q))return!1;return!0}function AQ(Z){return String(Z).replace(/\r\n/g,`
`).replace(/^\uFEFF/,"").replace(/[\u0000-\u001F\u200B-\u200D\u2060]/g,"")}function TQ(Z){let Q=/```([\w-]*)\s*([\s\S]*?)```/g,G=[],J;while((J=Q.exec(Z))!==null)G.push((J[2]||"").trim());return G}function NQ(Z){let Q=Z.search(/[\{\[]/);if(Q===-1)return null;let G=Z[Q],J=G==="{"?"}":"]",W=0,q=!1,Y=!1;for(let z=Q;z<Z.length;z++){let V=Z[z];if(q){if(Y)Y=!1;else if(V==="\\")Y=!0;else if(V==='"')q=!1;continue}if(V==='"'){q=!0;continue}if(V===G)W++;else if(V===J){if(W--,W===0)return Z.slice(Q,z+1).trim()}}return null}function DQ(Z){return/[\{\[]/.test(Z)}function _Q(Z){let Q=new Set,G=[];for(let J of Z)if(!Q.has(J))Q.add(J),G.push(J);return G}function F1(Z,Q,G=!0){let J=new Q8(Q);J.code=Z,J.recoverable=G;try{console.debug(`STMemoryBooks: AIResponseError code=${Z} recoverable=${G}: ${Q}`)}catch{}return J}function IQ(Z){let Q=Z;try{let V=!!A8?.STMemoryBooks?.moduleSettings?.useRegex,X=A8?.STMemoryBooks?.moduleSettings?.selectedRegexIncoming;if(V&&typeof Q==="string"&&Array.isArray(X)&&X.length>0)Q=v4(Q,X)}catch(V){console.warn("STMemoryBooks: incoming regex application failed",V)}if(typeof Q==="object"&&Q!==null&&Array.isArray(Q.content)){let V=BQ(Q);if(V)Q=V;else{let X=F1("EMPTY_OR_INVALID","AI response is empty or invalid",!1);try{X.rawResponse=JSON.stringify(Q)}catch{}throw X}}else if(typeof Q==="object"&&Q!==null&&Q.content)Q=Q.content;if(typeof Q==="object"&&Q!==null)try{let X=Q?.candidates?.[0]?.content?.parts;if(Array.isArray(X)&&X.length>0){let j=X.map((K)=>K&&typeof K.text==="string"?K.text:"").join("");if(j&&j.trim())Q=j}}catch(V){}if(!Q||typeof Q!=="string"){let V=F1("EMPTY_OR_INVALID","AI response is empty or invalid",!1);try{V.rawResponse=typeof Q==="string"?Q:JSON.stringify(Q)}catch{}throw V}Q=Q.trim(),Q=Q.replace(/<think>[\s\S]*?<\/think>/gi,"");let G=AQ(Q),J=[],W=TQ(G);if(W.length)J.push(...W);J.push(G);let q=NQ(G);if(q)J.push(q);let Y=_Q(J);for(let V of Y)try{let X=JSON.parse(V);if(!X.content&&!X.summary&&!X.memory_content)throw F1("MISSING_FIELDS_CONTENT","AI response missing content field",!1);if(!X.title)throw F1("MISSING_FIELDS_TITLE","AI response missing title field",!1);if(!Array.isArray(X.keywords))throw F1("INVALID_KEYWORDS","AI response missing or invalid keywords array.",!1);return X}catch(X){try{let j=h4.default.parse(V);if(!j.content&&!j.summary&&!j.memory_content)throw F1("MISSING_FIELDS_CONTENT","AI response missing content field",!1);if(!j.title)throw F1("MISSING_FIELDS_TITLE","AI response missing title field",!1);if(!Array.isArray(j.keywords))throw F1("INVALID_KEYWORDS","AI response missing or invalid keywords array.",!1);return j}catch{}}if(!DQ(G)){let V=F1("NO_JSON_BLOCK","AI response did not contain a JSON block. The model may have returned prose or declined the request.",!0);throw V.rawResponse=G,V}if(OQ(G)){let V=F1("UNBALANCED","AI response appears truncated or invalid JSON (unbalanced structures). Try increasing Max Response Length.",!1);throw V.rawResponse=G,V}let z=G.trim();if(z&&z.length>=80&&!RQ(z)){let V=F1("INCOMPLETE_SENTENCE","AI response JSON appears incomplete (text ends mid-sentence). Try increasing Max Response Length.",!1);throw V.rawResponse=G,V}{let V=F1("MALFORMED","AI did not return valid JSON. This may indicate the model does not support structured output well or the response contained unsupported formatting.",!1);throw V.rawResponse=G,V}}async function wQ(Z,Q){if(!await HQ())throw new Q8("Character data is not available. This may indicate that SillyTavern is still loading. Please wait a moment and try again.");let J=Q?.effectiveConnection||Q?.connection||{};try{let W=q1(J.api||l().api),q={};if(e8.openai_max_tokens)q.max_tokens=e8.openai_max_tokens;let{text:Y,full:z}=await w0({model:J.model,prompt:Z,temperature:J.temperature,api:W,endpoint:J.endpoint,apiKey:J.apiKey,extra:q}),V=z?.choices?.[0]?.finish_reason||z?.finish_reason||z?.stop_reason,X=typeof V==="string"?V.toLowerCase():"";if(X.includes("length")||X.includes("max")){let K=F1("PROVIDER_TRUNCATION","Model response appears truncated (provider finish_reason). Please increase Max Response Length.",!0);try{K.rawResponse=Y||""}catch{}try{K.providerResponse=z||null}catch{}throw K}if(z?.truncated===!0){let K=F1("PROVIDER_TRUNCATION_FLAG","Model response appears truncated (provider flag). Please increase Max Response Length.",!0);try{K.rawResponse=Y||""}catch{}try{K.providerResponse=z||null}catch{}throw K}let j=IQ(Y);return{content:j.content||j.summary||j.memory_content||"",title:j.title||"Memory",keywords:j.keywords||[],profile:Q}}catch(W){if(W instanceof Q8)throw W;let q=new Q8(`Memory generation failed: ${W.message||W}`);try{if(typeof W?.providerBody==="string")q.providerBody=W.providerBody;if(typeof W?.rawResponse==="string")q.rawResponse=W.rawResponse}catch{}throw q}}async function x4(Z,Q,G={}){try{LQ(Z,Q);let J=await hQ(Z,Q),W=await MQ(J),q=G.tokenWarningThreshold||30000;if(W.total>q)throw new n6("Token warning threshold exceeded.",W.total);let Y=await wQ(J,Q),z=vQ(Y,Z);return{content:z.content,extractedTitle:z.extractedTitle,metadata:{sceneRange:`${Z.metadata.sceneStart}-${Z.metadata.sceneEnd}`,messageCount:Z.metadata.messageCount,characterName:Z.metadata.characterName,userName:Z.metadata.userName,chatId:Z.metadata.chatId,createdAt:new Date().toISOString(),profileUsed:Q.name,presetUsed:Q.preset||"custom",tokenUsage:W,generationMethod:"json-structured-output",version:"2.0"},suggestedKeys:z.suggestedKeys,titleFormat:Q.useDynamicSTSettings||Q?.connection?.api==="current_st"?A8.STMemoryBooks?.titleFormat||"[000] - {{title}}":Q.titleFormat||"[000] - {{title}}",lorebookSettings:{constVectMode:Q.constVectMode,position:Q.position,orderMode:Q.orderMode,orderValue:Q.orderValue,preventRecursion:Q.preventRecursion,delayUntilRecursion:Q.delayUntilRecursion,outletName:Number(Q.position)===7?Q.outletName||"":void 0},lorebook:{content:z.content,comment:`Auto-generated memory from messages ${Z.metadata.sceneStart}-${Z.metadata.sceneEnd}. Profile: ${Q.name}.`,key:z.suggestedKeys||[],keysecondary:[],selective:!0,constant:!1,order:100,position:"before_char",disable:!1,addMemo:!0,excludeRecursion:!1,delayUntilRecursion:!0,probability:100,useProbability:!1}}}catch(J){if(J instanceof n6||J instanceof Q8||J instanceof s6)throw J;throw Error(`Memory creation failed: ${J.message}`)}}function LQ(Z,Q){if(!Z||!Array.isArray(Z.messages)||Z.messages.length===0)throw Error("Invalid or empty compiled scene data provided.");let G=typeof Q?.prompt==="string"&&Q.prompt.trim().length>0,J=typeof Q?.preset==="string"&&Q.preset.trim().length>0;if(!G&&!J)throw new s6("Invalid profile configuration. You must set either a custom prompt or a valid preset.")}function CQ(Z,Q,G=[]){let J=Z.map((q)=>{let Y=q.name||"Unknown",z=(q.mes||"").trim();return z?`${Y}: ${z}`:null}).filter(Boolean),W=[""];if(G&&G.length>0)W.push("=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ==="),W.push("These are previous memories for context only. Do NOT include them in your new memory:"),W.push(""),G.forEach((q,Y)=>{if(W.push(`Context ${Y+1} - ${q.title}:`),W.push(q.content),q.keywords&&q.keywords.length>0)W.push(`Keywords: ${q.keywords.join(", ")}`);W.push("")}),W.push("=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ==="),W.push("");return W.push("=== SCENE TRANSCRIPT ==="),W.push(...J),W.push(""),W.push("=== END SCENE ==="),W.join(`
`)}async function MQ(Z){return await Z0(Z,{estimatedOutput:300})}async function hQ(Z,Q){let{metadata:G,messages:J,previousSummariesContext:W}=Z,q=await Q0(Q),Y=XQ(q,G.userName,G.characterName),z=CQ(J,G,W),V=`${Y}

${z}`;try{let X=!!A8?.STMemoryBooks?.moduleSettings?.useRegex,j=A8?.STMemoryBooks?.moduleSettings?.selectedRegexOutgoing;if(X&&Array.isArray(j)&&j.length>0)return v4(V,j)}catch(X){console.warn("STMemoryBooks: outgoing regex application failed",X)}return V}function vQ(Z,Q){let{content:G,title:J,keywords:W}=Z,q=(G||Z.summary||Z.memory_content||"").trim(),Y=(J||"Memory").trim(),z=Array.isArray(W)?W.filter((V)=>V&&typeof V==="string"&&V.trim()!=="").map((V)=>V.trim()):[];return{content:q,extractedTitle:Y,suggestedKeys:z}}c0();import{getContext as A$}from"../../../extensions.js";import{METADATA_KEY as N$,loadWorldInfo as D$,createWorldInfoEntry as r6,saveWorldInfo as a6,reloadEditor as t6}from"../../../world-info.js";import{extension_settings as S4}from"../../../extensions.js";import{moment as E4}from"../../../../lib.js";import{executeSlashCommands as PQ}from"../../../slash-commands.js";import{translate as xQ}from"../../../i18n.js";var w1="STMemoryBooks-AddLore";function P(Z,Q,G){let J=xQ(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}function b4(Z){if(!Z)return null;let Q=Z.split("-");if(Q.length!==2)return null;let G=parseInt(Q[0],10),J=parseInt(Q[1],10);if(isNaN(G)||isNaN(J)||G<0||J<0)return null;return{start:G,end:J}}async function Z6(Z,Q=""){let G=Q?` (${Q})`:"";console.log(P("addlore.log.executingHideCommand",`${w1}: Executing hide command${G}: {{hideCommand}}`,{hideCommand:Z})),await PQ(Z)}function SQ(Z={}){if(Z.autoHideMode)return Z.autoHideMode;if(Z.autoHideAllMessages)return"all";else if(Z.autoHideLastMemory)return"last";else return"none"}var EQ=["[000] - {{title}} ({{profile}})","{{date}} [000] \uD83C\uDFAC{{title}}, {{messages}} msgs","[000] {{date}} - {{char}} Memory","[00] - {{user}} & {{char}} {{scene}}","\uD83E\uDDE0 [000] ({{messages}} msgs)","\uD83D\uDCDA Memory #[000] - {{profile}} {{date}} {{time}}","[000] - {{scene}}: {{title}}","[000] - {{title}} ({{scene}})","[000] - {{title}}"];async function y4(Z,Q){try{if(!Z?.content)throw Error(P("addlore.errors.invalidContent","Invalid memory result: missing content"));if(!Q?.valid||!Q.data)throw Error(P("addlore.errors.invalidLorebookValidation","Invalid lorebook validation data"));let G=S4.STMemoryBooks||{},J=Z.titleFormat;if(!J)J=G.titleFormat||P("addlore.titleFormats.8","[000] - {{title}}");let W=G.moduleSettings?.refreshEditor!==!1,q=Z.lorebookSettings||{constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0},Y=r6(Q.name,Q.data);if(!Y)throw Error(P("addlore.errors.createEntryFailed","Failed to create new lorebook entry"));let z=yQ(J,Z,Q.data);if(bQ(Y,Z,z,q),await a6(Q.name,Q.data,!0),G.moduleSettings?.showNotifications!==!1)toastr.success(P("addlore.toast.added",'Memory "{{entryTitle}}" added to "{{lorebookName}}"',{entryTitle:z,lorebookName:Q.name}),P("addlore.toast.title","STMemoryBooks"));if(W)t6(Q.name);let V=SQ(G.moduleSettings);if(V!=="none"){let X=G.moduleSettings?.unhiddenEntriesCount||0;if(V==="all"){let j=b4(Z.metadata?.sceneRange);if(!j)console.warn(P("addlore.warn.autohideSkippedInvalidRange",`${w1}: Auto-hide skipped - invalid scene range: "{{range}}"`,{range:Z.metadata?.sceneRange})),toastr.warning(P("addlore.toast.autohideInvalidRange","Auto-hide skipped: invalid scene range metadata"),P("addlore.toast.title","STMemoryBooks"));else{let{start:K,end:F}=j;if(X===0)await Z6(`/hide 0-${F}`,P("addlore.hideCommand.allComplete","all mode - complete"));else{let H=F-X;if(H>=0)await Z6(`/hide 0-${H}`,P("addlore.hideCommand.allPartial","all mode - partial"))}}}else if(V==="last"){let j=b4(Z.metadata?.sceneRange);if(!j)console.warn(P("addlore.warn.autohideSkippedInvalidRange",`${w1}: Auto-hide skipped - invalid scene range: "{{range}}"`,{range:Z.metadata?.sceneRange})),toastr.warning(P("addlore.toast.autohideInvalidRange","Auto-hide skipped: invalid scene range metadata"),P("addlore.toast.title","STMemoryBooks"));else{let{start:K,end:F}=j,H=F-K+1;if(X>=H);else if(X===0)await Z6(`/hide ${K}-${F}`,P("addlore.hideCommand.lastHideAll","last mode - hide all"));else{let B=F-X;if(B>=K)await Z6(`/hide ${K}-${B}`,P("addlore.hideCommand.lastPartial","last mode - partial"))}}}}return mQ(Z),{success:!0,entryId:Y.uid,entryTitle:z,lorebookName:Q.name,keywordCount:Z.suggestedKeys?.length||0,message:P("addlore.result.added",'Memory successfully added to "{{lorebookName}}"',{lorebookName:Q.name})}}catch(G){if(console.error(P("addlore.log.addFailed",`${w1}: Failed to add memory to lorebook:`),G),S4.STMemoryBooks?.moduleSettings?.showNotifications!==!1)toastr.error(P("addlore.toast.addFailed","Failed to add memory: {{message}}",{message:G.message}),P("addlore.toast.title","STMemoryBooks"));return{success:!1,error:G.message,message:P("addlore.result.addFailed","Failed to add memory to lorebook: {{message}}",{message:G.message})}}}function bQ(Z,Q,G,J){Z.content=Q.content,Z.key=Q.suggestedKeys||[],Z.comment=G;let W=T8(G)||1;switch(J.constVectMode){case"blue":Z.constant=!0,Z.vectorized=!1;break;case"green":Z.constant=!1,Z.vectorized=!1;break;case"link":default:Z.constant=!1,Z.vectorized=!0;break}if(Z.position=J.position,Number(J.position)===7){let q=String(J.outletName||"").trim();if(q)Z.outletName=q}if(J.orderMode==="manual")Z.order=J.orderValue;else Z.order=W;if(Z.preventRecursion=J.preventRecursion,Z.delayUntilRecursion=J.delayUntilRecursion,Z.keysecondary=[],Z.selective=!0,Z.selectiveLogic=0,Z.addMemo=!0,Z.disable=!1,Z.excludeRecursion=!1,Z.probability=100,Z.useProbability=!0,Z.depth=4,Z.group="",Z.groupOverride=!1,Z.groupWeight=100,Z.scanDepth=null,Z.caseSensitive=null,Z.matchWholeWords=null,Z.useGroupScoring=null,Z.automationId="",Z.role=null,Z.sticky=0,Z.cooldown=0,Z.delay=0,Z.displayIndex=W,Z.stmemorybooks=!0,Q.metadata?.sceneRange){let q=Q.metadata.sceneRange.split("-");if(q.length===2)Z.STMB_start=parseInt(q[0],10),Z.STMB_end=parseInt(q[1],10)}}function f4(Z){return Z.stmemorybooks===!0}function yQ(Z,Q,G){let J=Z,W=[{pattern:/\[\[0+\]\]/g,prefix:"[",suffix:"]"},{pattern:/\[0+\]/g,prefix:"",suffix:""},{pattern:/\(\[0+\]\)/g,prefix:"(",suffix:")"},{pattern:/\{\[0+\]\}/g,prefix:"{",suffix:"}"},{pattern:/#\[0+\]/g,prefix:"#",suffix:""}];for(let{pattern:z,prefix:V,suffix:X}of W){let j=J.match(z);if(j){let K=fQ(G,Z);j.forEach((F)=>{let H;if(z.source.includes("\\[\\["))H=F.length-4;else if(z.source.includes("\\(\\[")||z.source.includes("\\{\\["))H=F.length-4;else if(z.source.includes("#\\["))H=F.length-3;else if(z.source.includes("\\["))H=F.length-2;else H=F.length-2;let B=K.toString().padStart(H,"0"),A=V+B+X;J=J.replace(F,A)});break}}let q=Q.metadata||{},Y={"{{title}}":Q.extractedTitle||P("addlore.defaults.title","Memory"),"{{scene}}":P("addlore.defaults.scene","Scene {{range}}",{range:q.sceneRange||P("common.unknown","Unknown")}),"{{char}}":q.characterName||P("common.unknown","Unknown"),"{{user}}":q.userName||P("addlore.defaults.user","User"),"{{messages}}":q.messageCount||0,"{{profile}}":q.profileUsed||P("common.unknown","Unknown"),"{{date}}":E4().format("YYYY-MM-DD"),"{{time}}":E4().format("HH:mm:ss")};return Object.entries(Y).forEach(([z,V])=>{J=J.replace(new RegExp(z.replace(/[{}]/g,"\\$&"),"g"),V)}),J=uQ(J),J}function fQ(Z,Q=null){if(!Z.entries)return 1;let G=Object.values(Z.entries),J=[];if(G.forEach((q)=>{if(f4(q)&&q.comment){let Y=Q?kQ(q.comment,Q):T8(q.comment);if(Y!==null)J.push(Y)}}),J.length===0)return 1;return Math.max(...J)+1}function kQ(Z,Q){if(!Z||typeof Z!=="string"||!Q||typeof Q!=="string")return null;let G=[/\[0+\]/g,/\(0+\)/g,/\{0+\}/g,/#0+/g],J=[],W=null;for(let Y of G){let z=[...Q.matchAll(Y)];if(z.length>0){J=z,W=Y;break}}if(J.length===0)return T8(Z);let q=gQ(Q);if(q=q.replace(/\\\{\\\{[^}]+\\\}\\\}/g,".*?"),W.source.includes("\\["))q=q.replace(/\\\[0+\\\]/g,"(\\d+)");else if(W.source.includes("\\("))q=q.replace(/\\\(0+\\\)/g,"(\\d+)");else if(W.source.includes("\\{"))q=q.replace(/\\\{0+\\\}/g,"(\\d+)");else if(W.source.includes("#"))q=q.replace(/#0+/g,"(\\d+)");try{let Y=Z.match(new RegExp(q));if(Y&&Y[1]){let z=parseInt(Y[1],10);return isNaN(z)?null:z}}catch(Y){}return T8(Z)}function gQ(Z){return Z.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function T8(Z){if(!Z||typeof Z!=="string")return null;let Q=Z.match(/\[(\d+)\]/);if(Q){let z=parseInt(Q[1],10);return isNaN(z)?null:z}let G=Z.match(/\((\d+)\)/);if(G){let z=parseInt(G[1],10);return isNaN(z)?null:z}let J=Z.match(/\{(\d+)\}/);if(J){let z=parseInt(J[1],10);return isNaN(z)?null:z}let W=Z.match(/#(\d+)(?:-(\d+))?/);if(W){let z=parseInt(W[1],10),V=W[2]?parseInt(W[2],10):null,X=V!==null?V:z;return isNaN(X)?null:X}let q=Z.match(/^(\d+)(?:\s*[-\s])/);if(q){let z=parseInt(q[1],10);return isNaN(z)?null:z}let Y=[...Z.matchAll(/(\d+)/g)];for(let z of Y){let V=parseInt(z[1],10);if(isNaN(V))continue;let X=z[0],j=z.index,K=Z.substring(Math.max(0,j-10),j),F=Z.substring(j+X.length,j+X.length+10);if(!(/\d{4}-\d{2}-\d{2}/.test(K+X+F)||/\d{4}-\d{1,2}/.test(K+X)||/-\d{1,2}-\d{1,2}/.test(X+F)))return V}return null}function G8(Z){if(!Z.entries)return[];let Q=Object.values(Z.entries),G=[];return Q.forEach((J)=>{if(f4(J)){let W=T8(J.comment)||0;G.push({number:W,title:J.comment,content:J.content,keywords:J.key||[],entry:J})}}),G.sort((J,W)=>J.number-W.number),G}function uQ(Z){return String(Z??"").replace(/[\u0000-\u001F\u007F-\u009F]/g,"").trim()||P("addlore.sanitize.fallback","Auto Memory")}function $0(){return EQ.map((Z,Q)=>P(`addlore.titleFormats.${Q}`,Z))}function k4(Z){if(typeof Z.STMB_start==="number"&&typeof Z.STMB_end==="number")return{start:Z.STMB_start,end:Z.STMB_end};return null}function mQ(Z){try{console.log(P("addlore.log.updateHighestCalled",`${w1}: updateHighestMemoryProcessed called with:`),Z);let Q=Z.metadata?.sceneRange;if(console.log(P("addlore.log.sceneRangeExtracted",`${w1}: sceneRange extracted:`),Q),!Q){console.warn(P("addlore.warn.noSceneRange",`${w1}: No scene range found in memory result, cannot update highest processed`));return}let G=Q.split("-");if(G.length!==2){console.warn(P("addlore.warn.invalidSceneRangeFormat",`${w1}: Invalid scene range format: {{range}}`,{range:Q}));return}let J=parseInt(G[1],10);if(isNaN(J)){console.warn(P("addlore.warn.invalidEndMessage",`${w1}: Invalid end message number: {{end}}`,{end:G[1]}));return}let W=m();if(!W){console.warn(P("addlore.warn.noSceneMarkers",`${w1}: Could not get scene markers to update highest processed`));return}W.highestMemoryProcessed=J,Q1(),console.log(P("addlore.log.setHighest",`${w1}: Set highest memory processed to message {{endMessage}}`,{endMessage:J}))}catch(Q){console.error(P("addlore.log.updateHighestError",`${w1}: Error updating highest memory processed:`),Q)}}function z1(Z,Q){if(!Z||!Z.entries||!Q)return null;let G=Object.values(Z.entries);for(let J of G)if((J.comment||"")===Q)return J;return null}async function N8(Z,Q,G,J={}){let{refreshEditor:W=!0}=J;if(!Z||!Q||!Array.isArray(G))throw Error(P("addlore.upsert.errors.invalidArgs","Invalid arguments to upsertLorebookEntriesBatch"));let q=[];for(let Y of G){if(!Y||!Y.title)continue;let z=String(Y.title),V=Y.content!=null?String(Y.content):"",X=Y.defaults||{},j=Y.metadataUpdates||{},K=Y.entryOverrides||{},F=z1(Q,z),H=!1;if(!F){if(F=r6(Z,Q),!F)throw Error(P("addlore.upsert.errors.createFailed","Failed to create lorebook entry"));if(F.vectorized=!!X.vectorized,F.selective=!!X.selective,typeof X.order==="number")F.order=X.order;if(typeof X.position==="number")F.position=X.position;F.key=F.key||[],F.keysecondary=F.keysecondary||[],F.disable=!1,H=!0}if(F.key=Array.isArray(F.key)?F.key:[],F.keysecondary=Array.isArray(F.keysecondary)?F.keysecondary:[],typeof F.disable!=="boolean")F.disable=!1;F.comment=z,F.content=V;for(let[B,A]of Object.entries(j))F[B]=A;for(let[B,A]of Object.entries(K))F[B]=A;q.push({title:z,uid:F.uid,created:H})}if(await a6(Z,Q,!0),W)t6(Z);return q}async function e6(Z,Q,G,J,W={}){let{defaults:q={vectorized:!0,selective:!0,order:100,position:0},metadataUpdates:Y={},refreshEditor:z=!0,entryOverrides:V={}}=W;if(!Z||!Q||!G)throw Error(P("addlore.upsert.errors.invalidArgs","Invalid arguments to upsertLorebookEntryByTitle"));let X=z1(Q,G),j=!1;if(!X){if(X=r6(Z,Q),!X)throw Error(P("addlore.upsert.errors.createFailed","Failed to create lorebook entry"));if(X.vectorized=!!q.vectorized,X.selective=!!q.selective,typeof q.order==="number")X.order=q.order;if(typeof q.position==="number")X.position=q.position;X.key=X.key||[],X.keysecondary=X.keysecondary||[],X.disable=!1,j=!0}X.comment=G,X.content=J!=null?String(J):"";for(let[K,F]of Object.entries(Y||{}))X[K]=F;for(let[K,F]of Object.entries(V||{}))X[K]=F;if(await a6(Z,Q,!0),z)t6(Z);return{uid:X.uid,created:j}}import{getCurrentChatId as dQ,name1 as cQ,name2 as pQ,chat_metadata as iQ,saveMetadata as lQ}from"../../../../script.js";import{createNewWorldInfo as oQ,METADATA_KEY as nQ,world_names as ZZ}from"../../../world-info.js";import{translate as sQ}from"../../../i18n.js";var Q6="STMemoryBooks-AutoCreate";function L1(Z,Q,G){let J=sQ(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}function g4(Z){if(!Z||Z.trim()==="")Z=L1("STMemoryBooks_LorebookNameTemplatePlaceholder","LTM - {{char}} - {{chat}}");let Q=dQ()||L1("common.unknown","Unknown"),G=pQ||L1("common.unknown","Unknown"),J=cQ||L1("addlore.defaults.user","User"),W=Z.replace(/\{\{chat\}\}/g,Q).replace(/\{\{char\}\}/g,G).replace(/\{\{user\}\}/g,J);if(W=W.replace(/[\/\\:*?"<>|]/g,"_").replace(/_{2,}/g,"_").substring(0,60),!ZZ||!ZZ.includes(W))return W;for(let q=2;q<=999;q++){let Y=`${W} ${q}`;if(!ZZ.includes(Y))return Y}return`${W} ${Date.now()}`}async function G6(Z,Q="chat"){try{let G=g4(Z);if(console.log(L1("autocreate.log.creating",`${Q6}: Auto-creating lorebook "{{name}}" for {{context}}`,{name:G,context:Q})),await oQ(G))return iQ[nQ]=G,await lQ(),console.log(L1("autocreate.log.created",`${Q6}: Successfully created and bound lorebook "{{name}}"`,{name:G})),toastr.success(L1("autocreate.toast.createdBound",'Created and bound lorebook "{{name}}"',{name:G}),L1("autocreate.toast.title","STMemoryBooks")),{success:!0,name:G};else return console.error(L1("autocreate.log.createFailed",`${Q6}: Failed to create lorebook`)),{success:!1,error:L1("autocreate.errors.failedAutoCreate","Failed to auto-create lorebook.")}}catch(G){return console.error(L1("autocreate.log.createError",`${Q6}: Error creating lorebook:`),G),{success:!1,error:L1("autocreate.errors.failedAutoCreateWithMessage","Failed to auto-create lorebook: {{message}}",{message:G.message})}}}c0();_1();import{extension_settings as D8}from"../../../extensions.js";import{chat as J6,chat_metadata as rQ,saveMetadata as b$,getCurrentChatId as y$,name1 as f$,name2 as k$}from"../../../../script.js";import{METADATA_KEY as aQ,world_names as u4}from"../../../world-info.js";import{Popup as tQ,POPUP_TYPE as eQ,POPUP_RESULT as m4}from"../../../popup.js";import{translate as ZG}from"../../../i18n.js";function r(Z,Q,G){let J=ZG(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}async function QG(){let Z=D8.STMemoryBooks,Q;if(!Z.moduleSettings.manualModeEnabled){if(Q=rQ?.[aQ]||null,!Q&&Z?.moduleSettings?.autoCreateLorebook){let G=Z.moduleSettings.lorebookNameTemplate||r("STMemoryBooks_LorebookNameTemplatePlaceholder","LTM - {{char}} - {{chat}}"),J=await G6(G,"auto-summary");if(J.success)Q=J.name;else return{valid:!1,error:J.error}}}else{let G=m()||{};if(Q=G.manualLorebook??null,!Q){let W=new tQ(`
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
            `,eQ.TEXT,"",{okButton:r("STMemoryBooks_Button_SelectLorebook","Select Lorebook"),cancelButton:r("STMemoryBooks_Button_Postpone","Postpone")});if(await W.show()===m4.AFFIRMATIVE){let Y=await T0();if(Y)G.manualLorebook=Y,Q1(),Q=Y;else return{valid:!1,error:r("STMemoryBooks_Error_NoLorebookSelectedForAutoSummary","No lorebook selected for auto-summary.")}}else{let Y=W.dlg.querySelector("#stmb-postpone-messages"),z=parseInt(Y.value)||20,V=J6.length;return G.autoSummaryNextPromptAt=V+z,Q1(),console.log(r("autosummary.log.postponed","STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})",{count:z,until:G.autoSummaryNextPromptAt})),{valid:!1,error:r("STMemoryBooks_Info_AutoSummaryPostponed","Auto-summary postponed for {{count}} messages.",{count:z})}}}}if(!Q)return{valid:!1,error:r("STMemoryBooks_Error_NoLorebookForAutoSummary","No lorebook available for auto-summary.")};if(!u4||!u4.includes(Q))return{valid:!1,error:r("STMemoryBooks_Error_SelectedLorebookNotFound",'Selected lorebook "{{name}}" not found.',{name:Q})};try{let{loadWorldInfo:G}=await import("../../../world-info.js"),J=await G(Q);return{valid:!!J,data:J,name:Q}}catch(G){return{valid:!1,error:r("STMemoryBooks_Error_FailedToLoadSelectedLorebook","Failed to load the selected lorebook.")}}}async function QZ(){try{let Z=D8.STMemoryBooks;if(!Z?.moduleSettings?.autoSummaryEnabled)return;let Q=m()||{},G=J6.length,J=G-1,W=Z.moduleSettings.autoSummaryInterval,q=Z?.moduleSettings?.autoSummaryBuffer,Y=Math.min(Math.max(parseInt(q)||0,0),50),z=W+Y,V=Q.highestMemoryProcessed??null;if(i4()){console.log(r("autosummary.log.skippedInProgress","STMemoryBooks: Auto-summary skipped - memory creation in progress"));return}let X;if(V===null)X=G,console.log(r("autosummary.log.noPrevious","STMemoryBooks: No previous memories found - counting from start"));else X=J-V,console.log(r("autosummary.log.sinceLast","STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}",{highestProcessed:V,count:X}));if(console.log(r("autosummary.log.triggerCheck","STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?",{count:X,required:z})),X<z){console.log(r("autosummary.log.notTriggered","STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages",{needed:z-X}));return}if(Q.autoSummaryNextPromptAt&&G<Q.autoSummaryNextPromptAt){console.log(r("autosummary.log.postponedUntil","STMemoryBooks: Auto-summary postponed until message {{until}}",{until:Q.autoSummaryNextPromptAt}));return}let j=await QG();if(!j.valid){console.log(r("autosummary.log.blocked","STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}",{error:j.error}));return}if(Q.autoSummaryNextPromptAt)delete Q.autoSummaryNextPromptAt,Q1(),console.log(r("autosummary.log.clearedPostpone","STMemoryBooks: Cleared auto-summary postpone flag"));let K,F,H=J-Y,B=Math.max(0,H);if(V===null)K=0,F=B;else K=V+1,F=B;if(K>F)return;console.log(r("autosummary.log.triggered","STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}",{start:K,end:F})),Q.sceneStart=K,Q.sceneEnd=F,Q1();let{executeSlashCommands:A}=await import("../../../slash-commands.js");await A("/creatememory")}catch(Z){console.error(r("autosummary.log.triggerError","STMemoryBooks: Error in auto-summary trigger check:"),Z)}}async function d4(){try{let Z=B0();if(!Z.isGroupChat&&D8.STMemoryBooks.moduleSettings.autoSummaryEnabled){let Q=J6.length;console.log(r("autosummary.log.messageReceivedSingle","STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}",{count:Q})),await QZ()}else if(Z.isGroupChat)console.log(r("autosummary.log.messageReceivedGroup","STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED"))}catch(Z){console.error(r("autosummary.log.messageHandlerError","STMemoryBooks: Error in auto-summary message received handler:"),Z)}}async function c4(){try{if(D8.STMemoryBooks.moduleSettings.autoSummaryEnabled){let Z=J6.length;console.log(r("autosummary.log.groupFinished","STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}",{count:Z})),await QZ()}}catch(Z){console.error(r("autosummary.log.groupHandlerError","STMemoryBooks: Error in auto-summary group finished handler:"),Z)}}function p4(){if(D8.STMemoryBooks?.moduleSettings?.autoSummaryEnabled)d0()}_1();import{saveSettingsDebounced as _8}from"../../../../script.js";import{Popup as $6,POPUP_TYPE as J8,POPUP_RESULT as W0}from"../../../popup.js";import{moment as l4,Handlebars as GG,DOMPurify as o4}from"../../../../lib.js";c8();import{t as GZ,translate as k}from"../../../i18n.js";var R1="STMemoryBooks-ProfileManager",n4=GG.compile(`
<div class="popup-content">
    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-name">
            <h4 data-i18n="STMemoryBooks_ProfileName">Profile Name:</h4>
            <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_ProfileNamePlaceholder" placeholder="Profile name">
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

                <option value="openai" {{#if (eq connection.api "openai")}}selected{{/if}}>OpenAI</option>
                <option value="claude" {{#if (eq connection.api "claude")}}selected{{/if}}>Claude</option>
                <option value="openrouter" {{#if (eq connection.api "openrouter")}}selected{{/if}}>OpenRouter</option>
                <option value="ai21" {{#if (eq connection.api "ai21")}}selected{{/if}}>AI21</option>
                <option value="makersuite" {{#if (eq connection.api "makersuite")}}selected{{/if}}>Google AI Studio</option>
                <option value="vertexai" {{#if (eq connection.api "vertexai")}}selected{{/if}}>Vertex AI</option>
                <option value="mistralai" {{#if (eq connection.api "mistralai")}}selected{{/if}}>MistralAI</option>
                <option value="custom" {{#if (eq connection.api "custom")}}selected{{/if}} data-i18n="STMemoryBooks_CustomAPI">Custom API</option>
                <option value="cohere" {{#if (eq connection.api "cohere")}}selected{{/if}}>Cohere</option>
                <option value="perplexity" {{#if (eq connection.api "perplexity")}}selected{{/if}}>Perplexity</option>
                <option value="groq" {{#if (eq connection.api "groq")}}selected{{/if}}>Groq</option>
                <option value="electronhub" {{#if (eq connection.api "electronhub")}}selected{{/if}}>Electron Hub</option>
                <option value="nanogpt" {{#if (eq connection.api "nanogpt")}}selected{{/if}}>NanoGPT</option>
                <option value="deepseek" {{#if (eq connection.api "deepseek")}}selected{{/if}}>DeepSeek</option>
                <option value="aimlapi" {{#if (eq connection.api "aimlapi")}}selected{{/if}}>AI/ML API</option>
                <option value="xai" {{#if (eq connection.api "xai")}}selected{{/if}}>xAI</option>
                <option value="pollinations" {{#if (eq connection.api "pollinations")}}selected{{/if}}>Pollinations</option>
                <option value="moonshot" {{#if (eq connection.api "moonshot")}}selected{{/if}}>Moonshot</option>
                <option value="fireworks" {{#if (eq connection.api "fireworks")}}selected{{/if}}>Fireworks</option>
                <option value="cometapi" {{#if (eq connection.api "cometapi")}}selected{{/if}}>Comet API</option>
                <option value="azure_openai" {{#if (eq connection.api "azure_openai")}}selected{{/if}}>Azure OpenAI</option>
                <option value="zai" {{#if (eq connection.api "zai")}}selected{{/if}}>Z.AI</option>
                <option value="siliconflow" {{#if (eq connection.api "siliconflow")}}selected{{/if}}>SiliconFlow</option>

                <option value="full-manual" {{#if (eq connection.api "full-manual")}}selected{{/if}} title="⚠️ EXCEPTIONAL setup - This should ONLY be used when you need a separate API connection to a different endpoint. Most users should NOT need this option." data-i18n="STMemoryBooks_FullManualConfig">Full Manual Configuration</option>
            </select>
        </label>

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
`);async function s4(Z,Q,G){let J=Z.profiles[Q];if(!J){console.error(`${R1}: No profile found at index ${Q}`);return}try{let W=l();await n0(Z);let Y=(await O0()).map((B)=>({value:B.key,displayName:B.displayName,selected:B.key===(J.preset||"")})),z=J.connection||{temperature:0.7},V=J.titleFormat||Z.titleFormat||"[000] - {{title}}",X=$0(),j={name:J.name,connection:z,api:"openai",prompt:J.prompt||"",preset:J.preset||"",currentApi:W.api||"Unknown",presetOptions:Y,isProviderLocked:J.name==="Current SillyTavern Settings",titleFormat:V,titleFormats:X.map((B)=>({value:B,isSelected:B===V})),showCustomTitleInput:!X.includes(V),constVectMode:J.constVectMode,position:J.position,orderMode:J.orderMode,orderValue:J.orderValue,preventRecursion:J.preventRecursion,delayUntilRecursion:J.delayUntilRecursion,outletName:J.outletName||"",hasLegacyCustomPrompt:J.prompt&&J.prompt.trim()?!0:!1},K=o4.sanitize(n4(j)),F=new $6(`<h3>${k("Edit Profile","STMemoryBooks_ProfileEditTitle")}</h3>${K}`,J8.TEXT,"",{okButton:k("Save","STMemoryBooks_Save"),cancelButton:k("Cancel/Close","STMemoryBooks_CancelClose"),wide:!0,large:!0,allowVerticalScrolling:!0});if(Z5(F,Z),await F.show()===W0.AFFIRMATIVE){let B=Q5(F.dlg,J.name);if(!a0(B)){toastr.error(k("Invalid profile data","STMemoryBooks_InvalidProfileData"),"STMemoryBooks");return}if(Z.profiles[Q]=B,_8(),G)G();toastr.success(k("Profile updated successfully","STMemoryBooks_ProfileUpdatedSuccess"),"STMemoryBooks")}}catch(W){console.error(`${R1}: Error editing profile:`,W),toastr.error(k("Failed to edit profile","STMemoryBooks_FailedToEditProfile"),"STMemoryBooks")}}async function r4(Z,Q){try{let G=Z.profiles.map((H)=>H.name),J=N0("New Profile",G),W=l(),q=Z.titleFormat||"[000] - {{title}}",Y=$0();await n0(Z);let V=(await O0()).map((H)=>({value:H.key,displayName:H.displayName,selected:!1})),X={name:J,connection:{temperature:0.7},api:"",prompt:"",preset:"",currentApi:W.api||"Unknown",presetOptions:V,isProviderLocked:J==="Current SillyTavern Settings",titleFormat:q,titleFormats:Y.map((H)=>({value:H,isSelected:H===q})),showCustomTitleInput:!Y.includes(q),constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0,outletName:""},j=o4.sanitize(n4(X)),K=new $6(`<h3>${k("New Profile","STMemoryBooks_NewProfileTitle")}</h3>${j}`,J8.TEXT,"",{okButton:k("Create","STMemoryBooks_Create"),cancelButton:k("Cancel/Close","STMemoryBooks_CancelClose"),wide:!0,large:!0,allowVerticalScrolling:!0});if(Z5(K,Z),await K.show()===W0.AFFIRMATIVE){let H=Q5(K.dlg,J),B=N0(H.name,G);if(H.name=B,!a0(H)){toastr.error(k("Invalid profile data","STMemoryBooks_InvalidProfileData"),"STMemoryBooks");return}if(Z.profiles.push(H),_8(),Q)Q();toastr.success(k("Profile created successfully","STMemoryBooks_ProfileCreatedSuccess"),"STMemoryBooks")}}catch(G){console.error(`${R1}: Error creating profile:`,G),toastr.error(k("Failed to create profile","STMemoryBooks_FailedToCreateProfile"),"STMemoryBooks")}}async function a4(Z,Q,G){if(Z.profiles.length<=1){toastr.error(k("Cannot delete the last profile","STMemoryBooks_CannotDeleteLastProfile"),"STMemoryBooks");return}let J=Z.profiles[Q];if(J?.name==="Current SillyTavern Settings"){toastr.error(k('Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',"STMemoryBooks_CannotDeleteDefaultProfile"),"STMemoryBooks");return}try{let W=k('Delete profile "{{name}}"?',"STMemoryBooks_DeleteProfileConfirm").replace("{{name}}",J.name);if(await new $6(W,J8.CONFIRM,"").show()===W0.AFFIRMATIVE){let Y=J.name;if(Z.profiles.splice(Q,1),Z.defaultProfile===Q)Z.defaultProfile=0;else if(Z.defaultProfile>Q)Z.defaultProfile--;if(_8(),G)G();toastr.success(k("Profile deleted successfully","STMemoryBooks_ProfileDeletedSuccess"),"STMemoryBooks")}}catch(W){console.error(`${R1}: Error deleting profile:`,W),toastr.error(k("Failed to delete profile","STMemoryBooks_FailedToDeleteProfile"),"STMemoryBooks")}}function t4(Z){try{let Q={profiles:Z.profiles,exportDate:l4().toISOString(),version:1,moduleVersion:Z.migrationVersion||1},G=JSON.stringify(Q,null,2),J=new Blob([G],{type:"application/json"}),W=document.createElement("a");W.href=URL.createObjectURL(J),W.download=`stmemorybooks-profiles-${l4().format("YYYY-MM-DD")}.json`,document.body.appendChild(W),W.click(),document.body.removeChild(W),setTimeout(()=>URL.revokeObjectURL(W.href),1000),toastr.success(k("Profiles exported successfully","STMemoryBooks_ProfilesExportedSuccess"),"STMemoryBooks")}catch(Q){console.error(`${R1}: Error exporting profiles:`,Q),toastr.error(k("Failed to export profiles","STMemoryBooks_FailedToExportProfiles"),"STMemoryBooks")}}function JG(Z){return D0(Z)}function e4(Z,Q,G){let J=Z.target.files[0];if(!J)return;let W=new FileReader;W.onload=function(q){try{let Y=JSON.parse(q.target.result);if(!Y.profiles||!Array.isArray(Y.profiles))throw Error(k("Invalid profile data format - missing profiles array","STMemoryBooks_ImportErrorInvalidFormat"));let z=Y.profiles.filter((K)=>a0(K)).map((K)=>JG(K));if(z.length===0)throw Error(k("No valid profiles found in import file","STMemoryBooks_ImportErrorNoValidProfiles"));let V=0,X=0,j=Q.profiles.map((K)=>K.name);if(z.forEach((K)=>{if(!j.includes(K.name)){let H=N0(K.name,j);K.name=H,j.push(H),Q.profiles.push(K),V++}else X++}),V>0){if(_8(),G)G();let K=GZ`Imported ${V} profile${V===1?"":"s"}`;if(X>0)K+=GZ` (${X} duplicate${X===1?"":"s"} skipped)`;toastr.success(K,k("STMemoryBooks profile import completed","STMemoryBooks_ImportComplete"))}else toastr.warning(k("No new profiles imported - all profiles already exist","STMemoryBooks_ImportNoNewProfiles"),"STMemoryBooks")}catch(Y){console.error(`${R1}: Error importing profiles:`,Y),toastr.error(GZ`Failed to import profiles: ${Y.message}`,"STMemoryBooks")}},W.onerror=function(){console.error(`${R1}: Error reading import file`),toastr.error(k("Failed to read import file","STMemoryBooks_ImportReadError"),"STMemoryBooks")},W.readAsText(J),Z.target.value=""}function Z5(Z,Q){let G=Z.dlg;G.querySelector("#stmb-open-prompt-manager")?.addEventListener("click",()=>{try{let q=document.querySelector("#stmb-prompt-manager");if(q)q.click();else toastr.error(k("Prompt Manager button not found. Open main settings and try again.","STMemoryBooks_PromptManagerNotFound"),"STMemoryBooks")}catch(q){console.error(`${R1}: Error opening prompt manager from profile editor:`,q),toastr.error(k("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}),G.querySelector("#stmb-refresh-presets")?.addEventListener("click",async()=>{try{let q=G.querySelector("#stmb-profile-preset");if(!q)return;let Y=q.value,z=await O0();if(q.innerHTML="",z.forEach((V)=>{let X=document.createElement("option");if(X.value=V.key,X.textContent=V.displayName,V.key===Y)X.selected=!0;q.appendChild(X)}),![...q.options].some((V)=>V.value===Y)&&q.options.length>0)q.selectedIndex=0;toastr.success(k("Preset list refreshed","STMemoryBooks_PresetListRefreshed"),"STMemoryBooks")}catch(q){console.error(`${R1}: Error refreshing presets:`,q),toastr.error(k("Failed to refresh presets","STMemoryBooks_FailedToRefreshPresets"),"STMemoryBooks")}});let J=async()=>{try{let q=G.querySelector("#stmb-profile-preset");if(!q)return;let Y=q.value,z=await O0();if(q.innerHTML="",z.forEach((V)=>{let X=document.createElement("option");if(X.value=V.key,X.textContent=V.displayName,V.key===Y)X.selected=!0;q.appendChild(X)}),![...q.options].some((V)=>V.value===Y)&&q.options.length>0)q.selectedIndex=0}catch(q){console.error(`${R1}: Error auto-refreshing presets on update:`,q)}};window.addEventListener("stmb-presets-updated",J),Z?.dlg?.addEventListener("close",()=>{window.removeEventListener("stmb-presets-updated",J)}),G.querySelector("#stmb-move-to-preset")?.addEventListener("click",async()=>{try{let q=G.querySelector("#stmb-legacy-custom-prompt"),Y=q?q.textContent:"";if(!Y||!Y.trim()){toastr.error(t("STMemoryBooks_NoCustomPromptToMigrate","No custom prompt to migrate"),"STMemoryBooks");return}let X=`Custom: ${G.querySelector("#stmb-profile-name")?.value?.trim()||"Profile"}`,j=await R8(null,Y,X);if(await new $6(`<h3 data-i18n="STMemoryBooks_MoveToPresetConfirmTitle">Move to Preset</h3><p data-i18n="STMemoryBooks_MoveToPresetConfirmDesc">Create a preset from this profile's custom prompt, set the preset on this profile, and clear the custom prompt?</p>`,J8.CONFIRM,"",{okButton:k("Apply","STMemoryBooks_Apply"),cancelButton:k("Cancel","STMemoryBooks_Cancel")}).show()===W0.AFFIRMATIVE){let H=G.querySelector("#stmb-profile-preset");if(H){if(![...H.options].some((B)=>B.value===j)){let B=document.createElement("option");B.value=j,B.textContent=X,H.appendChild(B)}H.value=j}q?.remove(),G.querySelector("#stmb-move-to-preset")?.remove(),toastr.success(k("Preset created and selected. Remember to Save.","STMemoryBooks_CustomPromptMigrated"),"STMemoryBooks")}}catch(q){console.error(`${R1}: Error moving custom prompt to preset:`,q),toastr.error(k("Failed to move custom prompt to preset","STMemoryBooks_FailedToMigrateCustomPrompt"),"STMemoryBooks")}}),G.querySelector("#stmb-profile-title-format-select")?.addEventListener("change",(q)=>{let Y=G.querySelector("#stmb-profile-custom-title-format");if(q.target.value==="custom")Y.classList.remove("displayNone"),Y.focus();else Y.classList.add("displayNone")}),G.querySelector("#stmb-profile-temperature")?.addEventListener("input",(q)=>{let Y=parseFloat(q.target.value);if(!isNaN(Y)){if(Y<0)q.target.value=0;if(Y>2)q.target.value=2}}),G.querySelector("#stmb-profile-model")?.addEventListener("input",(q)=>{q.target.value=q.target.value.replace(/[<>]/g,"")}),G.querySelector("#stmb-profile-api")?.addEventListener("change",(q)=>{let Y=G.querySelector("#stmb-full-manual-section"),z=G.querySelector("#stmb-profile-model"),V=G.querySelector("#stmb-profile-temperature");if(q.target.value==="full-manual")Y.classList.remove("displayNone");else Y.classList.add("displayNone");let X=q.target.value==="current_st";if(z)z.disabled=X,z.title=X?"Managed by SillyTavern UI":"";if(V)V.disabled=X,V.title=X?"Managed by SillyTavern UI":""}),G.querySelectorAll('input[name="order-mode"]').forEach((q)=>{q.addEventListener("change",(Y)=>{let z=G.querySelector("#stmb-profile-order-value");if(Y.target.value==="manual")z.classList.remove("displayNone");else z.classList.add("displayNone")})});let W=G.querySelector("#stmb-profile-position");W?.addEventListener("change",()=>{let q=G.querySelector("#stmb-profile-outlet-name-container");if(q)q.classList.toggle("displayNone",W.value!=="7")}),function(){let q=G.querySelector("#stmb-profile-outlet-name-container");if(W&&q)q.classList.toggle("displayNone",W.value!=="7")}();try{let q=G.querySelector('h4[data-i18n="STMemoryBooks_RecursionSettings"]'),Y=q?q.parentElement?.querySelector(".buttons_block"):null;if(Y&&!G.querySelector("#stmb-convert-existing-recursion")){let z=document.createElement("label");z.className="checkbox_label";let V=document.createElement("input");V.type="checkbox",V.id="stmb-convert-existing-recursion",V.checked=!!(Q&&Q.moduleSettings&&Q.moduleSettings.convertExistingRecursion);let X=document.createElement("span");X.textContent="Also convert recursion settings on existing entries";try{X.setAttribute("data-i18n","STMemoryBooks_ConvertExistingRecursion")}catch(j){}z.appendChild(V),z.appendChild(X),Y.appendChild(z),V.addEventListener("change",()=>{try{Q.moduleSettings=Q.moduleSettings||{},Q.moduleSettings.convertExistingRecursion=!!V.checked,_8()}catch(j){console.error(`${R1}: Failed to save convertExistingRecursion flag`,j)}})}}catch(q){console.warn(`${R1}: Failed to inject convertExistingRecursion checkbox`,q)}}function Q5(Z,Q){let G={name:Z.querySelector("#stmb-profile-name")?.value.trim()||Q,api:Z.querySelector("#stmb-profile-api")?.value,model:Z.querySelector("#stmb-profile-model")?.value,temperature:Z.querySelector("#stmb-profile-temperature")?.value,endpoint:Z.querySelector("#stmb-profile-endpoint")?.value,apiKey:Z.querySelector("#stmb-profile-apikey")?.value,constVectMode:Z.querySelector("#stmb-profile-const-vect")?.value,position:Z.querySelector("#stmb-profile-position")?.value,orderMode:Z.querySelector('input[name="order-mode"]:checked')?.value,orderValue:Z.querySelector("#stmb-profile-order-value")?.value,preventRecursion:Z.querySelector("#stmb-profile-prevent-recursion")?.checked,delayUntilRecursion:Z.querySelector("#stmb-profile-delay-recursion")?.checked},J=Z.querySelector("#stmb-profile-preset");G.prompt="",G.preset=J?.value||"";let W=Z.querySelector("#stmb-profile-title-format-select");if(W?.value==="custom")G.titleFormat=Z.querySelector("#stmb-profile-custom-title-format")?.value;else if(W)G.titleFormat=W.value;if(G.position==="7"||G.position===7)G.outletName=Z.querySelector("#stmb-profile-outlet-name")?.value?.trim()||"";return D0(G)}function JZ(Z){let Q=[],G=[];if(!Z.profiles||!Array.isArray(Z.profiles))Z.profiles=[],G.push("Created empty profiles array");if(Z.profiles.length===0){let J=D0({name:"Current SillyTavern Settings",api:"current_st",preset:"summary"});Z.profiles.push(J),G.push('Added default profile using provider "Current SillyTavern Settings".')}if(Z.profiles=Z.profiles.map((J)=>{if(J&&J.useDynamicSTSettings)J.connection=J.connection||{},J.connection.api="current_st",delete J.useDynamicSTSettings,G.push(`Migrated legacy dynamic profile "${J.name}" to provider-based current_st`);return J}),Z.profiles.forEach((J,W)=>{if(!a0(J)){if(Q.push(`Profile ${W} is invalid`),!J.name)J.name=`Profile ${W+1}`,G.push(`Fixed missing name for profile ${W}`);if(!J.connection)J.connection={},G.push(`Fixed missing connection for profile ${W}`)}if(J.constVectMode===void 0)J.constVectMode="link",G.push(`Added default 'constVectMode' to profile "${J.name}"`);if(J.position===void 0)J.position=0,G.push(`Added default 'position' to profile "${J.name}"`);if(J.orderMode===void 0)J.orderMode="auto",J.orderValue=100,G.push(`Added default 'order' settings to profile "${J.name}"`);if(J.preventRecursion===void 0)J.preventRecursion=!1,G.push(`Added default 'preventRecursion' to profile "${J.name}"`);if(J.delayUntilRecursion===void 0)J.delayUntilRecursion=!0,G.push(`Added default 'delayUntilRecursion' to profile "${J.name}"`);if(!J.titleFormat)J.titleFormat=Z.titleFormat||"[000] - {{title}}",G.push(`Added missing title format to profile "${J.name}"`)}),Z.defaultProfile>=Z.profiles.length)Z.defaultProfile=0,G.push("Fixed invalid default profile index");return{valid:Q.length===0,issues:Q,fixes:G,profileCount:Z.profiles.length}}c0();import{Handlebars as W6}from"../../../../lib.js";var $Z=W6.compile(`
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
                    data-i18n="[placeholder]STMemoryBooks_DefaultUnhidden" placeholder="0">
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

`),G5=W6.compile(`
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
`),J5=W6.compile(`
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
`),$5=W6.compile(`
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
`);import{saveSettingsDebounced as $G}from"../../../../script.js";import{Popup as WZ,POPUP_TYPE as qZ,POPUP_RESULT as L0}from"../../../popup.js";import{DOMPurify as YZ}from"../../../../lib.js";import{translate as L}from"../../../i18n.js";import{loadWorldInfo as W5}from"../../../world-info.js";_1();var C1="STMemoryBooks-ConfirmationPopup";function C0(Z,Q,G){let J=L(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}var M0={ADVANCED:L0.CUSTOM1,SAVE_PROFILE:L0.CUSTOM2,EDIT:L0.CUSTOM3,RETRY:L0.CUSTOM4};async function q5(Z,Q,G,J,W,q=null){let Y=q!==null?q:Q.defaultProfile,z=Q.profiles[Y],V=await Q0(z),X={...Z,profileName:z?.connection?.api==="current_st"?L("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):z.name,effectivePrompt:V,profileModel:z.useDynamicSTSettings||z?.connection?.api==="current_st"?L("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"):z.connection?.model||L("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"),profileTemperature:z.useDynamicSTSettings||z?.connection?.api==="current_st"?L("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"):z.connection?.temperature!==void 0?z.connection.temperature:L("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"),currentModel:G?.model||L("Unknown","common.unknown"),currentTemperature:G?.temperature||0.7,currentApi:J?.api||L("Unknown","common.unknown"),tokenThreshold:Q.moduleSettings.tokenWarningThreshold||30000,showWarning:Z.estimatedTokens>(Q.moduleSettings.tokenWarningThreshold||30000),profiles:Q.profiles.map((K,F)=>({...K,name:K?.connection?.api==="current_st"?L("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):K.name,isDefault:F===Q.defaultProfile,isSelected:F===Y}))},j=YZ.sanitize(G5(X));try{let F=await new WZ(j,qZ.TEXT,"",{okButton:L("Create Memory","STMemoryBooks_CreateMemory"),cancelButton:L("Cancel","STMemoryBooks_Cancel"),allowVerticalScrolling:!0,wide:!1,customButtons:[{text:L("Advanced Options...","STMemoryBooks_Button_AdvancedOptions"),result:M0.ADVANCED,classes:["menu_button","whitespacenowrap"],action:null}]}).show();if(F===L0.AFFIRMATIVE)return{confirmed:!0,profileSettings:{...z,effectivePrompt:V},advancedOptions:{memoryCount:Q.moduleSettings.defaultMemoryCount||0,overrideSettings:!1}};else if(F===M0.ADVANCED)return await WG(Z,Q,z,G,J,W);return{confirmed:!1}}catch(K){return{confirmed:!1}}}async function WG(Z,Q,G,J,W,q){let Y=await jG(Q,q),z=await Q0(G),V=G.connection?.model||L("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"),X=G.connection?.temperature!==void 0?G.connection.temperature:L("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"),j={...Z,availableMemories:Y,profiles:Q.profiles.map((F,H)=>({...F,name:F?.connection?.api==="current_st"?L("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):F.name,isDefault:H===Q.defaultProfile})),effectivePrompt:z,defaultMemoryCount:Q.moduleSettings.defaultMemoryCount||0,profileModel:V,profileTemperature:X,currentModel:J?.model||L("Unknown","common.unknown"),currentTemperature:J?.temperature||0.7,currentApi:W?.api||L("Unknown","common.unknown"),suggestedProfileName:C0("STMemoryBooks_ModifiedProfileName","{{name}} - Modified",{name:G.name}),tokenThreshold:Q.moduleSettings.tokenWarningThreshold||30000,showWarning:Z.estimatedTokens>(Q.moduleSettings.tokenWarningThreshold||30000)},K=YZ.sanitize(J5(j));try{let F=new WZ(K,qZ.TEXT,"",{okButton:L("Create Memory","STMemoryBooks_Button_CreateMemory"),cancelButton:L("Cancel","STMemoryBooks_Cancel"),wide:!0,large:!0,allowVerticalScrolling:!0,customButtons:[{text:L("Save as New Profile","STMemoryBooks_Button_SaveAsNewProfile"),result:M0.SAVE_PROFILE,classes:["menu_button","whitespacenowrap"],action:null}]});zG(F,Z,Q,G,q);let H=await F.show();if(H===L0.AFFIRMATIVE)return await qG(F,Q);else if(H===M0.SAVE_PROFILE)return await YG(F,Q);return{confirmed:!1}}catch(F){return{confirmed:!1}}}async function qG(Z,Q){let G=Z.dlg,J=parseInt(G.querySelector("#stmb-profile-select-advanced")?.value||Q.defaultProfile),W=G.querySelector("#stmb-effective-prompt-advanced")?.value,q=parseInt(G.querySelector("#stmb-context-memories-advanced")?.value||0),Y=G.querySelector("#stmb-override-settings-advanced")?.checked||!1;if(Z.dlg.querySelector(".popup_button_ok")?.dataset.shouldSave==="true"){let K=G.querySelector("#stmb-new-profile-name-advanced").value.trim();if(K)try{await Y5(G,Q,K),toastr.success(C0("STMemoryBooks_Toast_ProfileSaved",'Profile "{{name}}" saved successfully',{name:K}),L("STMemoryBooks","confirmationPopup.toast.title"))}catch(F){console.error(L(`${C1}: Failed to save profile:`,"confirmationPopup.log.saveFailed"),F),toastr.error(C0("STMemoryBooks_Toast_ProfileSaveFailed","Failed to save profile: {{message}}",{message:F.message}),L("STMemoryBooks","confirmationPopup.toast.title"))}else return console.error(L(`${C1}: Profile creation cancelled - no name provided`,"confirmationPopup.log.saveCancelledNoName")),toastr.error(L('Please enter a profile name or use "Create Memory" to proceed without saving',"STMemoryBooks_Toast_ProfileNameOrProceed"),L("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1}}let X=Q.profiles[J],j={...X,prompt:W||X.prompt,effectiveConnection:{...X.connection}};if(Y){let K=Z1(),F=l();if(F.api)j.effectiveConnection.api=F.api;if(K.model)j.effectiveConnection.model=K.model;if(typeof K.temperature==="number")j.effectiveConnection.temperature=K.temperature}return{confirmed:!0,profileSettings:j,advancedOptions:{memoryCount:q,overrideSettings:Y}}}async function YG(Z,Q){let G=Z.dlg.querySelector("#stmb-new-profile-name-advanced").value.trim();if(!G)return console.error(L(`${C1}: Profile name validation failed - empty name`,"confirmationPopup.log.validationFailedEmptyName")),toastr.error(L("Please enter a profile name","STMemoryBooks_Toast_ProfileNameRequired"),L("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1};return await Y5(Z.dlg,Q,G),toastr.success(C0("STMemoryBooks_Toast_ProfileSaved",'Profile "{{name}}" saved successfully',{name:G}),L("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1}}function zG(Z,Q,G,J,W){let q=Z.dlg,Y={prompt:q.querySelector("#stmb-effective-prompt-advanced").value,memoryCount:parseInt(q.querySelector("#stmb-context-memories-advanced").value),overrideSettings:q.querySelector("#stmb-override-settings-advanced").checked,profileIndex:parseInt(q.querySelector("#stmb-profile-select-advanced").value)},z=()=>{let V=q.querySelector("#stmb-effective-prompt-advanced").value,X=parseInt(q.querySelector("#stmb-context-memories-advanced").value),j=q.querySelector("#stmb-override-settings-advanced").checked,K=parseInt(q.querySelector("#stmb-profile-select-advanced").value),F=V!==Y.prompt||X!==Y.memoryCount||j!==Y.overrideSettings||K!==Y.profileIndex,H=q.querySelector("#stmb-save-profile-section-advanced"),B=Z.dlg.querySelector(".popup_button_ok");if(B)if(F)B.textContent=L("Save Profile & Create Memory","STMemoryBooks_SaveProfileAndCreateMemory"),B.title=L("Save the modified settings as a new profile and create the memory","STMemoryBooks_Tooltip_SaveProfileAndCreateMemory"),B.dataset.shouldSave="true";else B.textContent=L("Create Memory","STMemoryBooks_CreateMemory"),B.title=L("Create memory using the selected profile settings","STMemoryBooks_Tooltip_CreateMemory"),B.dataset.shouldSave="false";if(F)H.style.display="block";else H.style.display="none"};q.querySelector("#stmb-effective-prompt-advanced")?.addEventListener("input",z),q.querySelector("#stmb-context-memories-advanced")?.addEventListener("change",z),q.querySelector("#stmb-override-settings-advanced")?.addEventListener("change",z),q.querySelector("#stmb-profile-select-advanced")?.addEventListener("change",async(V)=>{let X=parseInt(V.target.value),j=G.profiles[X],K=await Q0(j);q.querySelector("#stmb-effective-prompt-advanced").value=K;let F=q.querySelector("#stmb-profile-model-display"),H=q.querySelector("#stmb-profile-temp-display");if(F)F.textContent=j.connection?.model||L("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel");if(H)H.textContent=j.connection?.temperature!==void 0?j.connection.temperature:L("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature");Y.prompt=K,Y.profileIndex=X,z()}),XG(q,Q,G,W,z),z()}function XG(Z,Q,G,J,W){let q=Z.querySelector("#stmb-context-memories-advanced"),Y=Z.querySelector("#stmb-total-tokens-display"),z=Z.querySelector("#stmb-token-warning-advanced"),V=G.moduleSettings.tokenWarningThreshold||30000;if(q&&Y){let X={},j=async()=>{let K=parseInt(q.value)||0;if(K===0){if(Y.textContent=C0("STMemoryBooks_Label_TotalTokens","Total tokens: {{count}}",{count:Q.estimatedTokens}),z)z.style.display=Q.estimatedTokens>V?"block":"none";return}if(!X[K]){Y.textContent=L("Total tokens: Calculating...","STMemoryBooks_Label_TotalTokensCalculating");let B=await h0(K,G,J);X[K]=B.summaries}let F=X[K],H=await VG(Q,F);if(Y.textContent=C0("STMemoryBooks_Label_TotalTokens","Total tokens: {{count}}",{count:H}),z)if(H>V)z.style.display="block",z.querySelector("span").textContent=C0("STMemoryBooks_Warn_LargeSceneTokens","⚠️ Large scene ({{tokens}} tokens) may take some time to process.",{tokens:H});else z.style.display="none"};q.addEventListener("change",()=>{j(),W()}),j()}}async function Y5(Z,Q,G){let J=parseInt(Z.querySelector("#stmb-profile-select-advanced")?.value||Q.defaultProfile),W=Q.profiles[J],q={name:G,prompt:Z.querySelector("#stmb-effective-prompt-advanced")?.value,api:W.connection?.api,model:W.connection?.model,temperature:W.connection?.temperature,preset:W.preset,titleFormat:W.titleFormat||Q.titleFormat};if(Z.querySelector("#stmb-override-settings-advanced")?.checked||!1){let X=Z1(),j=l();q.api=j.api,q.model=X.model,q.temperature=X.temperature}let z=D0(q),V=Q.profiles.map((X)=>X.name);z.name=N0(z.name,V),Q.profiles.push(z),$G()}async function h0(Z,Q,G){if(Z<=0)return{summaries:[],actualCount:0,requestedCount:0};try{let J=await A0();if(!J)return{summaries:[],actualCount:0,requestedCount:Z};let W=await W5(J);if(!W)return{summaries:[],actualCount:0,requestedCount:Z};let Y=G8(W).slice(-Z),z=Y.length;return{summaries:Y.map((V)=>({number:V.number,title:V.title,content:V.content,keywords:V.keywords})),actualCount:z,requestedCount:Z}}catch(J){return{summaries:[],actualCount:0,requestedCount:Z}}}async function VG(Z,Q){let G=Z.estimatedTokens;if(Q&&Q.length>0){let J=200;for(let W of Q){let q=W.content||"",Y=Math.ceil(q.length/4);J+=Y}return G+J}return G}async function jG(Z,Q){try{let G=await A0();if(!G)return 0;let J=await W5(G);if(!J)return 0;return G8(J).length}catch(G){return 0}}async function $8(Z,Q,G,J={}){try{if(!Z||typeof Z!=="object")return console.error(L(`${C1}: Invalid memoryResult passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidMemoryResult")),{action:"cancel"};if(!Q||typeof Q!=="object")return console.error(L(`${C1}: Invalid sceneData passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidSceneData")),{action:"cancel"};if(!G||typeof G!=="object")return console.error(L(`${C1}: Invalid profileSettings passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidProfileSettings")),{action:"cancel"};if(typeof Q.sceneStart!=="number"||typeof Q.sceneEnd!=="number"||typeof Q.messageCount!=="number")return console.error(L(`${C1}: sceneData missing required numeric properties`,"confirmationPopup.log.sceneDataMissingProps")),{action:"cancel"};let W=(X)=>{if(Array.isArray(X))return X.filter((j)=>j&&typeof j==="string").join(", ");else if(typeof X==="string")return X.trim();else return""},q={title:Z.extractedTitle||L("Memory","addlore.defaults.title"),content:Z.content||"",keywordsText:W(Z.suggestedKeys),sceneStart:Q.sceneStart,sceneEnd:Q.sceneEnd,messageCount:Q.messageCount,titleReadonly:!!J.lockTitle,profileName:G?.connection?.api==="current_st"?L("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):G.name||L("Unknown Profile","STMemoryBooks_UnknownProfile")},Y=YZ.sanitize($5(q)),z=new WZ(Y,qZ.TEXT,"",{okButton:L("Edit & Save","STMemoryBooks_EditAndSave"),cancelButton:L("Cancel","STMemoryBooks_Cancel"),allowVerticalScrolling:!0,wide:!0,customButtons:[{text:L("Retry Generation","STMemoryBooks_RetryGeneration"),result:M0.RETRY,classes:["menu_button","whitespacenowrap"],action:null}]});switch(await z.show()){case L0.AFFIRMATIVE:case M0.EDIT:let X=z.dlg;if(!X)return console.error(L(`${C1}: Popup element not available for reading edited values`,"confirmationPopup.log.popupNotAvailable")),toastr.error(L("Unable to read edited values","STMemoryBooks_Toast_UnableToReadEditedValues"),L("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let j=X.querySelector("#stmb-preview-title"),K=X.querySelector("#stmb-preview-content"),F=X.querySelector("#stmb-preview-keywords");if(!j||!K||!F)return console.error(L(`${C1}: Required input elements not found in popup`,"confirmationPopup.log.inputsNotFound")),toastr.error(L("Unable to find input fields","STMemoryBooks_Toast_UnableToFindInputFields"),L("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let H=j.value?.trim()||"",B=K.value?.trim()||"",A=F.value?.trim()||"";if(J?.lockTitle)H=Z.extractedTitle||H;if(!H||H.length===0)return console.error(L(`${C1}: Memory title validation failed - empty title`,"confirmationPopup.log.titleValidationFailed")),toastr.error(L("Memory title cannot be empty","STMemoryBooks_Toast_TitleCannotBeEmpty"),L("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};if(!B||B.length===0)return console.error(L(`${C1}: Memory content validation failed - empty content`,"confirmationPopup.log.contentValidationFailed")),toastr.error(L("Memory content cannot be empty","STMemoryBooks_Toast_ContentCannotBeEmpty"),L("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let R=((M)=>{if(!M||typeof M!=="string")return[];return M.split(",").map((E)=>E.trim()).filter((E)=>E.length>0&&typeof E==="string")})(A);return{action:"edit",memoryData:{...Z,extractedTitle:H,content:B,suggestedKeys:R}};case M0.RETRY:return{action:"retry"};default:return{action:"cancel"}}}catch(W){return console.error(L(`${C1}: Error showing memory preview popup:`,"confirmationPopup.log.previewError"),W),{action:"cancel"}}}_1();c8();H0();import{editGroup as h3}from"../../../group-chats.js";c0();d8();_1();import{chat as C8,chat_metadata as V6}from"../../../../script.js";import{extension_settings as A1}from"../../../extensions.js";import{getRegexedString as O5,regex_placement as X6}from"../../../extensions/regex/engine.js";import{METADATA_KEY as HG,world_names as H5,loadWorldInfo as R5}from"../../../world-info.js";w8();import{t as Y0,translate as U1}from"../../../i18n.js";var c="STMemoryBooks-SidePrompts",B5=!1,BZ=Promise.resolve();function A5(Z){return BZ=BZ.then(Z).catch((Q)=>{console.warn(`${c}: preview task failed`,Q)}),BZ}async function RZ(){let Z=A1.STMemoryBooks,Q=null;if(Z?.moduleSettings?.manualModeEnabled)Q=(m()||{}).manualLorebook??null;else Q=V6?.[HG]||null;if(!Q||!H5||!H5.includes(Q))throw toastr.error(U1("No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.","STMemoryBooks_Toast_NoMemoryLorebookAssigned"),"STMemoryBooks"),Error(U1("No memory lorebook assigned","STMemoryBooks_Error_NoMemoryLorebookAssigned"));try{let G=await R5(Q);if(!G)throw Error(U1("Failed to load lorebook","STMemoryBooks_Error_FailedToLoadLorebook"));return{name:Q,data:G}}catch(G){throw toastr.error(U1("Failed to load the selected lorebook.","STMemoryBooks_Toast_FailedToLoadLorebook"),"STMemoryBooks"),G}}function BG(Z,Q){let G=0,J=Math.max(-1,Number.isFinite(Z)?Z:-1),W=Math.max(-1,Q);for(let q=J+1;q<=W&&q<C8.length;q++){let Y=C8[q];if(Y&&!Y.is_system)G++}return G}function OZ(Z,Q){let G=i0(Z,Q);return p0(G)}function AZ(Z,Q,G,J,W=[]){let q=[];if(q.push(String(Z||"")),Q&&String(Q).trim())q.push(`
=== PRIOR ENTRY ===
`),q.push(String(Q));if(Array.isArray(W)&&W.length>0)q.push(`
=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
`),q.push(`These are previous memories for context only. Do NOT include them in your new output.

`),W.forEach((X,j)=>{if(q.push(`Context ${j+1} - ${X.title||"Memory"}:
`),q.push(`${X.content||""}
`),Array.isArray(X.keywords)&&X.keywords.length)q.push(`Keywords: ${X.keywords.join(", ")}
`);q.push(`
`)}),q.push(`=== END PREVIOUS SCENE CONTEXT ===
`);let Y=G?u6(G):"";if(q.push(`
=== SCENE TEXT ===
`),q.push(Y),J&&String(J).trim())q.push(`
=== RESPONSE FORMAT ===
`),q.push(String(J).trim());let z=q.join("");return A1?.STMemoryBooks?.moduleSettings?.useRegex?O5(z,X6.USER_INPUT,{isPrompt:!0}):z}async function TZ(Z,Q=null){let G,J,W,q,Y;if(Q&&(Q.api||Q.model))G=q1(Q.api||"openai"),J=Q.model||"",W=typeof Q.temperature==="number"?Q.temperature:0.7,q=Q.endpoint||null,Y=Q.apiKey||null,console.debug(`${c}: runLLM using overrides api=${G} model=${J} temp=${W}`);else{let X=l(),j=Z1();G=q1(X.completionSource||X.api||"openai"),J=j.model||"",W=j.temperature??0.7,console.debug(`${c}: runLLM using UI settings api=${G} model=${J} temp=${W}`)}let{text:z}=await P4({api:G,model:J,prompt:Z,temperature:W,endpoint:q,apiKey:Y,extra:{}});return A1?.STMemoryBooks?.moduleSettings?.useRegex?O5(z||"",X6.AI_OUTPUT):z||""}function q8(Z=null,Q={}){try{if(Z&&(Z.effectiveConnection||Z.connection)){let z=k6(Z),{api:V,model:X,temperature:j,endpoint:K,apiKey:F}=z;return console.debug(`${c}: resolveSidePromptConnection using provided profile api=${V} model=${X} temp=${j}`),{api:V,model:X,temperature:j,endpoint:K,apiKey:F}}let G=A1?.STMemoryBooks,J=G?.profiles||[],W=Q&&Number.isFinite(Q.overrideProfileIndex)?Number(Q.overrideProfileIndex):null;if(W!==null&&J.length>0){if(W<0||W>=J.length)W=0;let z=J[W];if(z?.useDynamicSTSettings||z?.connection?.api==="current_st"){let V=l(),X=Z1(),j=q1(V.completionSource||V.api||"openai"),K=X.model||"",F=X.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection using UI via template override profile index=${W} api=${j} model=${K} temp=${F}`),{api:j,model:K,temperature:F}}else{let V=z?.connection||{},X=q1(V.api||"openai"),j=V.model||"",K=typeof V.temperature==="number"?V.temperature:0.7,F=V.endpoint||null,H=V.apiKey||null;return console.debug(`${c}: resolveSidePromptConnection using template override profile index=${W} api=${X} model=${j} temp=${K}`),{api:X,model:j,temperature:K,endpoint:F,apiKey:H}}}let q=Number(G?.defaultProfile??0);if(!Array.isArray(J)||J.length===0){let z=l(),V=Z1(),X=q1(z.completionSource||z.api||"openai"),j=V.model||"",K=V.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection fallback to UI (no profiles) api=${X} model=${j} temp=${K}`),{api:X,model:j,temperature:K}}if(!Number.isFinite(q)||q<0||q>=J.length)q=0;let Y=J[q];if(Y?.useDynamicSTSettings||Y?.connection?.api==="current_st"){let z=l(),V=Z1(),X=q1(z.completionSource||z.api||"openai"),j=V.model||"",K=V.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection using UI via dynamic default profile api=${X} model=${j} temp=${K}`),{api:X,model:j,temperature:K}}else{let z=Y?.connection||{},V=q1(z.api||"openai"),X=z.model||"",j=typeof z.temperature==="number"?z.temperature:0.7,K=z.endpoint||null,F=z.apiKey||null;return console.debug(`${c}: resolveSidePromptConnection using default profile api=${V} model=${X} temp=${j}`),{api:V,model:X,temperature:j,endpoint:K,apiKey:F}}}catch(G){let J=l(),W=Z1(),q=q1(J.completionSource||J.api||"openai"),Y=W.model||"",z=W.temperature??0.7;return console.warn(`${c}: resolveSidePromptConnection error; falling back to UI`,G),{api:q,model:Y,temperature:z}}}function L8(Z,Q){let G=Number(Z);return Number.isFinite(G)?G:Q}function NZ(Z){let Q=Z&&Z.settings&&Z.settings.lorebook||{};return{constVectMode:Q.constVectMode||"link",position:L8(Q.position,0),orderMode:Q.orderMode==="manual"?"manual":"auto",orderValue:L8(Q.orderValue,100),preventRecursion:Q.preventRecursion!==!1,delayUntilRecursion:!!Q.delayUntilRecursion,outletName:String(Q.outletName||"")}}function DZ(Z){let Q={vectorized:Z.constVectMode==="link",selective:!0,order:Z.orderMode==="manual"?L8(Z.orderValue,100):100,position:L8(Z.position,0)},G={constant:Z.constVectMode==="blue",vectorized:Z.constVectMode==="link",preventRecursion:!!Z.preventRecursion,delayUntilRecursion:!!Z.delayUntilRecursion};if(Z.orderMode==="manual")G.order=L8(Z.orderValue,100);if(Number(Z.position)===7&&Z.outletName)G.outletName=String(Z.outletName);return{defaults:Q,entryOverrides:G}}async function _Z(){try{let Z=await z6("onInterval");if(!Z||Z.length===0)return;let Q=await RZ(),G=C8.length-1;if(G<0)return;for(let J of Z){let W=`${J.name} (STMB SidePrompt)`,q=`${J.name} (STMB Tracker)`,Y=z1(Q.data,W)||z1(Q.data,q),z=Number((Y&&Y[`STMB_sp_${J.key}_lastMsgId`])??(Y&&Y.STMB_tracker_lastMsgId)??-1),V=Y?.[`STMB_sp_${J.key}_lastRunAt`]?Date.parse(Y[`STMB_sp_${J.key}_lastRunAt`]):Y?.STMB_tracker_lastRunAt?Date.parse(Y.STMB_tracker_lastRunAt):null,X=Date.now(),j=1e4;if(V&&X-V<1e4)continue;let K=BG(z,G),F=Math.max(1,Number(J?.triggers?.onInterval?.visibleMessages||50));if(K<F)continue;let H=Math.max(0,z+1),A=Math.max(H,G-200+1),T=null;try{T=OZ(A,G)}catch(_){console.warn(`${c}: Interval compile failed:`,_);continue}let R=Y?.content||"",N=[],M=Number(J?.settings?.previousMemoriesCount||0),E=Math.max(0,Math.min(7,M));if(E>0)try{N=(await h0(E,A1,V6))?.summaries||[]}catch{}let y=AZ(J.prompt,R,T,J.responseFormat,N),C="";try{let _=Number(J?.settings?.overrideProfileIndex),x=!!J?.settings?.overrideProfileEnabled&&Number.isFinite(_)?q8(null,{overrideProfileIndex:_}):q8(null);console.log(`${c}: SidePrompt attempt`,{trigger:"onInterval",name:J.name,key:J.key,range:`${A}-${G}`,visibleSince:K,threshold:F,api:x.api,model:x.model}),C=await TZ(y,x)}catch(_){console.error(`${c}: Interval sideprompt LLM failed:`,_),toastr.error(Y0`SidePrompt "${J.name}" failed: ${_.message}`,"STMemoryBooks");continue}try{if(A1?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let h={extractedTitle:W,content:C,suggestedKeys:[]},x={sceneStart:T?.metadata?.sceneStart??A,sceneEnd:T?.metadata?.sceneEnd??G,messageCount:T?.metadata?.messageCount??(T?.messages?.length??0)},f={name:"SidePrompt"},g;if(await A5(async()=>{g=await $8(h,x,f,{lockTitle:!0})}),g?.action==="cancel"||g?.action==="retry"){console.log(`${c}: SidePrompt "${J.name}" canceled or retry requested in preview; skipping save`);continue}else if(g?.action==="edit"&&g.memoryData)C=g.memoryData.content??C}}catch(_){console.warn(`${c}: Preview step failed; proceeding without preview`,_)}try{let _=NZ(J),{defaults:h,entryOverrides:x}=DZ(_),f=T?.metadata?.sceneEnd??G;await e6(Q.name,Q.data,W,C,{defaults:h,entryOverrides:x,metadataUpdates:{[`STMB_sp_${J.key}_lastMsgId`]:G,[`STMB_sp_${J.key}_lastRunAt`]:new Date().toISOString(),STMB_tracker_lastMsgId:G,STMB_tracker_lastRunAt:new Date().toISOString()},refreshEditor:A1?.STMemoryBooks?.moduleSettings?.refreshEditor!==!1}),console.log(`${c}: SidePrompt success`,{trigger:"onInterval",name:J.name,key:J.key,saved:!0,contentChars:C.length})}catch(_){console.error(`${c}: Interval sideprompt upsert failed:`,_),toastr.error(Y0`Failed to update sideprompt entry "${J.name}"`,"STMemoryBooks");continue}}}catch(Z){}}async function T5(Z,Q=null){try{let G=await RZ(),J=await z6("onAfterMemory");if(!J||J.length===0)return;let W=q8(Q);console.debug(`${c}: runAfterMemory default overrides api=${W.api} model=${W.model} temp=${W.temperature}`);let q=A1?.STMemoryBooks,Y=q?.moduleSettings?.refreshEditor!==!1,z=q?.moduleSettings?.showNotifications!==!1,V=[],j=((F,H,B)=>Math.max(H,Math.min(B,F)))(Number(q?.moduleSettings?.sidePromptsMaxConcurrent??2),1,5),K=[];for(let F=0;F<J.length;F+=j)K.push(J.slice(F,F+j));for(let F of K){let H=F.map(async(R)=>{try{let N=`${R.name} (STMB SidePrompt)`,E=(z1(G.data,N)||z1(G.data,`${R.name} (STMB Plotpoints)`)||z1(G.data,`${R.name} (STMB Scoreboard)`))?.content||"",y=[],C=Number(R?.settings?.previousMemoriesCount||0),_=Math.max(0,Math.min(7,C));if(_>0)try{y=(await h0(_,A1,V6))?.summaries||[]}catch{}let h=AZ(R.prompt,E,Z,R.responseFormat,y),x=Number(R?.settings?.overrideProfileIndex),g=!!R?.settings?.overrideProfileEnabled&&Number.isFinite(x)?q8(null,{overrideProfileIndex:x}):W;console.log(`${c}: SidePrompt attempt`,{trigger:"onAfterMemory",name:R.name,key:R.key,api:g.api,model:g.model});let v=await TZ(h,g);return{ok:!0,tpl:R,text:v}}catch(N){return console.error(`${c}: Wave LLM failed for "${R.name}":`,N),{ok:!1,tpl:R,error:N}}}),B=await Promise.all(H.map((R)=>R.then((N)=>({...N,_completedAt:performance.now()}))));B.sort((R,N)=>R._completedAt-N._completedAt);let A=[],T=[];for(let R of B){if(!R.ok){V.push({name:R.tpl?.name||"unknown",ok:!1,error:R.error});continue}let N=R.text,M=!0;try{if(A1?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let y={extractedTitle:`${R.tpl.name} (STMB SidePrompt)`,content:N,suggestedKeys:[]},C={sceneStart:Z?.metadata?.sceneStart??0,sceneEnd:Z?.metadata?.sceneEnd??0,messageCount:Z?.metadata?.messageCount??(Z?.messages?.length??0)},_={name:"SidePrompt"},h;if(await A5(async()=>{h=await $8(y,C,_,{lockTitle:!0})}),h?.action==="cancel"||h?.action==="retry")M=!1;else if(h?.action==="edit"&&h.memoryData)N=h.memoryData.content??N}}catch(E){console.warn(`${c}: Preview step failed; proceeding without preview`,E)}if(M){let E=R.tpl,y=`${E.name} (STMB SidePrompt)`,C=NZ(E),{defaults:_,entryOverrides:h}=DZ(C);A.push({title:y,content:N,defaults:_,entryOverrides:h,metadataUpdates:{[`STMB_sp_${E.key}_lastRunAt`]:new Date().toISOString()}}),T.push(E.name)}else V.push({name:R.tpl.name,ok:!1,error:Error("User canceled or retry in preview")})}if(A.length>0)try{let R=await R5(G.name);await N8(G.name,R,A,{refreshEditor:Y}),G.data=R;for(let N of T){if(V.push({name:N,ok:!0}),z)toastr.success(Y0`SidePrompt "${N}" updated.`,"STMemoryBooks");console.log(`${c}: SidePrompt success`,{trigger:"onAfterMemory",name:N,saved:!0})}}catch(R){console.error(`${c}: Wave save failed:`,R),toastr.error(U1("Failed to save SidePrompt updates for this wave","STMemoryBooks_Toast_FailedToSaveWave"),"STMemoryBooks");for(let N of T)V.push({name:N,ok:!1,error:R})}}if(z&&V.length>0){let F=V.filter((R)=>R.ok).map((R)=>R.name),H=V.filter((R)=>!R.ok).map((R)=>R.name),B=F.length,A=H.length,T=(R)=>{if(R.length===0)return"";let M=R.slice(0,5).join(", "),E=R.length>5?`, +${R.length-5} more`:"";return`${M}${E}`};if(A===0)toastr.info(Y0`Side Prompts after memory: ${B} succeeded. ${T(F)}`,"STMemoryBooks");else toastr.warning(Y0`Side Prompts after memory: ${B} succeeded, ${A} failed. ${A?"Failed: "+T(H):""}`,"STMemoryBooks")}}catch(G){}}async function IZ(Z){try{let Q=await RZ(),{name:G,range:J}=OG(Z);if(!G)return toastr.error(U1('SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',"STMemoryBooks_Toast_SidePromptNameNotProvided"),"STMemoryBooks"),"";let W=await VZ(G);if(!W)return toastr.error(U1("SidePrompt template not found. Check name.","STMemoryBooks_Toast_SidePromptNotFound"),"STMemoryBooks"),"";if(!(Array.isArray(W?.triggers?.commands)&&W.triggers.commands.some((T)=>String(T).toLowerCase()==="sideprompt")))return toastr.error(U1('Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',"STMemoryBooks_Toast_ManualRunDisabled"),"STMemoryBooks"),"";let Y=C8.length-1;if(Y<0)return toastr.error(U1("No messages available.","STMemoryBooks_Toast_NoMessagesAvailable"),"STMemoryBooks"),"";let z=null;if(J){let T=String(J).trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);if(!T)return toastr.error(U1("Invalid range format. Use X-Y","STMemoryBooks_Toast_InvalidRangeFormat"),"STMemoryBooks"),"";let R=parseInt(T[1],10),N=parseInt(T[2],10);if(!(R>=0&&N>=R&&N<C8.length))return toastr.error(U1("Invalid message range for /sideprompt","STMemoryBooks_Toast_InvalidMessageRange"),"STMemoryBooks"),"";try{z=OZ(R,N)}catch(M){return toastr.error(U1("Failed to compile the specified range","STMemoryBooks_Toast_FailedToCompileRange"),"STMemoryBooks"),""}}else{if(!B5)toastr.info(U1('Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',"STMemoryBooks_Toast_SidePromptRangeTip"),"STMemoryBooks"),B5=!0;let T=`${W.name} (STMB SidePrompt)`,R=z1(Q.data,T)||z1(Q.data,`${W.name} (STMB Scoreboard)`)||z1(Q.data,`${W.name} (STMB Plotpoints)`)||z1(Q.data,`${W.name} (STMB Tracker)`),N=Number((R&&R[`STMB_sp_${W.key}_lastMsgId`])??(R&&R.STMB_score_lastMsgId)??(R&&R.STMB_tracker_lastMsgId)??-1),M=Math.max(0,N+1),y=Math.max(M,Y-200+1);try{z=OZ(y,Y)}catch(C){return toastr.error(U1("Failed to compile messages for /sideprompt","STMemoryBooks_Toast_FailedToCompileMessages"),"STMemoryBooks"),""}}let V=`${W.name} (STMB SidePrompt)`,j=(z1(Q.data,V)||z1(Q.data,`${W.name} (STMB Scoreboard)`)||z1(Q.data,`${W.name} (STMB Plotpoints)`)||z1(Q.data,`${W.name} (STMB Tracker)`))?.content||"",K=[],F=Number(W?.settings?.previousMemoriesCount||0),H=Math.max(0,Math.min(7,F));if(H>0)try{K=(await h0(H,A1,V6))?.summaries||[]}catch{}let B=AZ(W.prompt,j,z,W.responseFormat,K),A="";try{let T=Number(W?.settings?.overrideProfileIndex),N=!!W?.settings?.overrideProfileEnabled&&Number.isFinite(T)?q8(null,{overrideProfileIndex:T}):q8(null);console.log(`${c}: SidePrompt attempt`,{trigger:"manual",name:W.name,key:W.key,rangeProvided:!!J,api:N.api,model:N.model}),A=await TZ(B,N);try{if(A1?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let h={extractedTitle:V,content:A,suggestedKeys:[]},x={sceneStart:z?.metadata?.sceneStart??0,sceneEnd:z?.metadata?.sceneEnd??0,messageCount:z?.metadata?.messageCount??(z?.messages?.length??0)},g=await $8(h,x,{name:"SidePrompt"},{lockTitle:!0});if(g?.action==="cancel"||g?.action==="retry")return toastr.info(Y0`SidePrompt "${W.name}" canceled.`,"STMemoryBooks"),"";else if(g?.action==="edit"&&g.memoryData)A=g.memoryData.content??A}}catch(_){console.warn(`${c}: Preview step failed; proceeding without preview`,_)}let M=NZ(W),{defaults:E,entryOverrides:y}=DZ(M),C=z?.metadata?.sceneEnd??Y;await e6(Q.name,Q.data,V,A,{defaults:E,entryOverrides:y,metadataUpdates:{[`STMB_sp_${W.key}_lastMsgId`]:C,[`STMB_sp_${W.key}_lastRunAt`]:new Date().toISOString(),STMB_tracker_lastMsgId:C,STMB_tracker_lastRunAt:new Date().toISOString()},refreshEditor:A1?.STMemoryBooks?.moduleSettings?.refreshEditor!==!1}),console.log(`${c}: SidePrompt success`,{trigger:"manual",name:W.name,key:W.key,saved:!0,contentChars:A.length})}catch(T){return console.error(`${c}: /sideprompt failed:`,T),toastr.error(Y0`SidePrompt "${W.name}" failed: ${T.message}`,"STMemoryBooks"),""}return toastr.success(Y0`SidePrompt "${W.name}" updated.`,"STMemoryBooks"),""}catch(Q){return""}}function OG(Z){let Q=String(Z||"").trim();if(!Q)return{name:"",range:null};let G="",J="",W=Q.match(/^"([^"]+)"\s*(.*)$/),q=!W&&Q.match(/^'([^']+)'\s*(.*)$/);if(W)G=W[1],J=W[2]||"";else if(q)G=q[1],J=q[2]||"";else{let z=Q.match(/(\d+)\s*[-–—]\s*(\d+)\s*$/);if(z)G=Q.slice(0,z.index).trim(),J=Q.slice(z.index);else G=Q,J=""}let Y=null;if(J){let z=J.match(/(\d+)\s*[-–—]\s*(\d+)/);if(z)Y=`${z[1]}-${z[2]}`}return{name:G,range:Y}}w8();import{Popup as M8,POPUP_TYPE as P0,POPUP_RESULT as X0}from"../../../popup.js";import{DOMPurify as j6}from"../../../../lib.js";import{escapeHtml as D}from"../../../utils.js";import{extension_settings as d1}from"../../../extensions.js";import{saveSettingsDebounced as AG}from"../../../../script.js";import{Handlebars as RG}from"../../../../lib.js";var N5=RG.compile(`
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
`);import{translate as O,applyLocale as D5}from"../../../i18n.js";function s1(Z,Q,G){let J=O(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let Y=G[q];return Y!==void 0&&Y!==null?String(Y):""})}function _5(Z){let Q=[],G=Z?.triggers||{};if(G.onInterval&&Number(G.onInterval.visibleMessages)>=1)Q.push(`${O("Interval","STMemoryBooks_Interval")}:${Number(G.onInterval.visibleMessages)}`);if(G.onAfterMemory&&!!G.onAfterMemory.enabled)Q.push(O("AfterMemory","STMemoryBooks_AfterMemory"));if(Array.isArray(G.commands)&&G.commands.some((J)=>String(J).toLowerCase()==="sideprompt"))Q.push(O("Manual","STMemoryBooks_Manual"));return Q}function TG(Z){let Q=(Z||[]).map((G)=>({key:String(G.key||""),name:String(G.name||""),badges:_5(G)}));return N5({items:Q})}async function z0(Z,Q=null){let G=Z?.dlg?.querySelector("#stmb-sp-list");if(!G)return;let J=(Z?.dlg?.querySelector("#stmb-sp-search")?.value||"").toLowerCase(),W=await q0(),q=J?W.filter((Y)=>{let z=Y.name.toLowerCase().includes(J),V=_5(Y).join(" ").toLowerCase();return z||V.includes(J)}):W;G.innerHTML=j6.sanitize(TG(q));try{D5(G)}catch(Y){}if(Q){let Y=G.querySelector(`tr[data-tpl-key="${CSS.escape(Q)}"]`);if(Y)Y.style.backgroundColor="var(--cobalt30a)",Y.style.border=""}}async function NG(Z,Q){try{let G=await XZ(Q);if(!G){toastr.error(s1("STMemoryBooks_TemplateNotFound",'Template "{{key}}" not found',{key:Q}),O("STMemoryBooks","index.toast.title"));return}let J=!!G.enabled,W=G.settings||{},q=G.triggers||{},Y=!!(q.onInterval&&Number(q.onInterval.visibleMessages)>=1),z=Y?Math.max(1,Number(q.onInterval.visibleMessages)):50,V=!!(q.onAfterMemory&&q.onAfterMemory.enabled),X=Array.isArray(q.commands)?q.commands.some((v)=>String(v).toLowerCase()==="sideprompt"):!1,j=d1?.STMemoryBooks?.profiles||[],K=Number.isFinite(W.overrideProfileIndex)?Number(W.overrideProfileIndex):d1?.STMemoryBooks?.defaultProfile??0;if(!(K>=0&&K<j.length))K=0;let F=!!W.overrideProfileEnabled,H=j.map((v,s)=>`<option value="${s}" ${s===K?"selected":""}>${D(v?.name||"Profile "+(s+1))}</option>`).join(""),B=`
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-override-enabled" ${F?"checked":""}>
                    <span>${D(O("Override default memory profile","STMemoryBooks_OverrideDefaultMemoryProfile"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-edit-override-container" style="display: ${F?"block":"none"};">
                <label for="stmb-sp-edit-override-index">
                    <h4>${D(O("Connection Profile:","STMemoryBooks_ConnectionProfile"))}</h4>
                    <select id="stmb-sp-edit-override-index" class="text_pole">
                        ${H}
                    </select>
                </label>
            </div>
        `,A=Number.isFinite(W.previousMemoriesCount)?Number(W.previousMemoriesCount):0,T=W&&W.lorebook||{},R=T.constVectMode||"link",N=Number.isFinite(T.position)?Number(T.position):0,M=T.orderMode==="manual",E=Number.isFinite(T.orderValue)?Number(T.orderValue):100,y=T.preventRecursion!==!1,C=!!T.delayUntilRecursion,_=`
            <h3>${D(O("Edit Side Prompt","STMemoryBooks_EditSidePrompt"))}</h3>
            <div class="world_entry_form_control">
                <small>${D(O("Key:","STMemoryBooks_Key"))} <code>${D(G.key)}</code></small>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-name">
                    <h4>${D(O("Name:","STMemoryBooks_Name"))}</h4>
                    <input type="text" id="stmb-sp-edit-name" class="text_pole" value="${D(G.name)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-enabled" ${J?"checked":""}>
                    <span>${D(O("Enabled","STMemoryBooks_Enabled"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>${D(O("Triggers:","STMemoryBooks_Triggers"))}</h4>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-interval" ${Y?"checked":""}>
                    <span>${D(O("Run on visible message interval","STMemoryBooks_RunOnVisibleMessageInterval"))}</span>
                </label>
                <div id="stmb-sp-edit-interval-container" style="display:${Y?"block":"none"}; margin-left:28px;">
                    <label for="stmb-sp-edit-interval">
                        <h4 style="margin: 0 0 4px 0;">${D(O("Interval (visible messages):","STMemoryBooks_IntervalVisibleMessages"))}</h4>
                        <input type="number" id="stmb-sp-edit-interval" class="text_pole" min="1" step="1" value="${z}">
                    </label>
                </div>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-aftermem" ${V?"checked":""}>
                    <span>${D(O("Run automatically after memory","STMemoryBooks_RunAutomaticallyAfterMemory"))}</span>
                </label>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-manual" ${X?"checked":""}>
                    <span>${D(O("Allow manual run via /sideprompt","STMemoryBooks_AllowManualRunViaSideprompt"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prompt">
                    <h4>${D(O("Prompt:","STMemoryBooks_PromptTitle"))}</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-prompt" class="text_pole textarea_compact" rows="10">${D(G.prompt||"")}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-response-format">
                    <h4>${D(O("Response Format (optional):","STMemoryBooks_ResponseFormatOptional"))}</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-response-format" class="text_pole textarea_compact" rows="6">${D(G.responseFormat||"")}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>${D(O("Lorebook Entry Settings","STMemoryBooks_LorebookEntrySettings"))}:</h4>
                <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${D(O("Activation Mode","STMemoryBooks_ActivationMode"))}:</h4>
                        <select id="stmb-sp-edit-lb-mode" class="text_pole">
                            <option value="link" ${R==="link"?"selected":""}>${D(O("\uD83D\uDD17 Vectorized (Default)","STMemoryBooks_Vectorized"))}</option>
                            <option value="green" ${R==="green"?"selected":""}>${D(O("\uD83D\uDFE2 Normal","STMemoryBooks_Normal"))}</option>
                            <option value="blue" ${R==="blue"?"selected":""}>${D(O("\uD83D\uDD35 Constant","STMemoryBooks_Constant"))}</option>
                        </select>
                    </label>
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${D(O("Insertion Position:","STMemoryBooks_InsertionPosition"))}</h4>
                        <select id="stmb-sp-edit-lb-position" class="text_pole">
                            <option value="0" ${N===0?"selected":""}>${D(O("↑Char","STMemoryBooks_CharUp"))}</option>
                            <option value="1" ${N===1?"selected":""}>${D(O("↓Char","STMemoryBooks_CharDown"))}</option>
                            <option value="5" ${N===5?"selected":""}>${D(O("↑EM","STMemoryBooks_EMUp"))}</option>
                            <option value="6" ${N===6?"selected":""}>${D(O("↓EM","STMemoryBooks_EMDown"))}</option>
                            <option value="2" ${N===2?"selected":""}>${D(O("↑AN","STMemoryBooks_ANUp"))}</option>
                            <option value="3" ${N===3?"selected":""}>${D(O("↓AN","STMemoryBooks_ANDown"))}</option>
                            <option value="7" ${N===7?"selected":""}>${D(O("Outlet","STMemoryBooks_Outlet"))}</option>
                        </select>
                        <div id="stmb-sp-edit-lb-outlet-name-container" style="display:${N===7?"block":"none"}; margin-top: 8px;">
                            <label>
                                <h4 style="margin: 0 0 4px 0;">${D(O("Outlet Name:","STMemoryBooks_OutletName"))}</h4>
                                <input type="text" id="stmb-sp-edit-lb-outlet-name" class="text_pole" placeholder="${D(O("Outlet name","STMemoryBooks_OutletNamePlaceholder"))}" value="${D(T.outletName||"")}">
                            </label>
                        </div>
                    </label>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <h4>${D(O("Insertion Order:","STMemoryBooks_InsertionOrder"))}</h4>
                    <label class="radio_label">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-auto" value="auto" ${M?"":"checked"}>
                        <span>${D(O("Auto (uses memory #)","STMemoryBooks_AutoOrder"))}</span>
                    </label>
                    <label class="radio_label" style="margin-left: 12px;">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-manual" value="manual" ${M?"checked":""}>
                        <span>${D(O("Manual","STMemoryBooks_ManualOrder"))}</span>
                    </label>
                    <div id="stmb-sp-edit-lb-order-value-container" style="display:${M?"block":"none"}; margin-left:28px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">${D(O("Order Value:","STMemoryBooks_OrderValue"))}</h4>
                            <input type="number" id="stmb-sp-edit-lb-order-value" class="text_pole" step="1" value="${E}">
                        </label>
                    </div>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <label class="checkbox_label">
                        <input type="checkbox" id="stmb-sp-edit-lb-prevent" ${y?"checked":""}>
                        <span>${D(O("Prevent Recursion","STMemoryBooks_PreventRecursion"))}</span>
                    </label>
                    <label class="checkbox_label" style="margin-left: 12px;">
                        <input type="checkbox" id="stmb-sp-edit-lb-delay" ${C?"checked":""}>
                        <span>${D(O("Delay Until Recursion","STMemoryBooks_DelayUntilRecursion"))}</span>
                    </label>
                </div>
            </div>

            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prev-mem-count">
                    <h4>${D(O("Previous memories for context:","STMemoryBooks_PreviousMemoriesForContext"))}</h4>
<input type="number" id="stmb-sp-edit-prev-mem-count" class="text_pole" min="0" max="7" step="1" value="${A}">
                </label>
                <small class="opacity70p">${D(O("Number of previous memory entries to include before scene text (0 = none).","STMemoryBooks_PreviousMemoriesHelp"))}</small>
            </div>

            <div class="world_entry_form_control">
                <h4>${D(O("Overrides:","STMemoryBooks_Overrides"))}</h4>
                ${B}
            </div>
        `,h=new M8(j6.sanitize(_),P0.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:O("Save","STMemoryBooks_Save"),cancelButton:O("Cancel","STMemoryBooks_Cancel")}),x=()=>{let v=h.dlg;if(!v)return;let s=v.querySelector("#stmb-sp-edit-trg-interval"),b1=v.querySelector("#stmb-sp-edit-interval-container");s?.addEventListener("change",()=>{if(b1)b1.style.display=s.checked?"block":"none";if(s.checked)v.querySelector("#stmb-sp-edit-interval")?.focus()});let y1=v.querySelector("#stmb-sp-edit-override-enabled"),G1=v.querySelector("#stmb-sp-edit-override-container");y1?.addEventListener("change",()=>{if(G1)G1.style.display=y1.checked?"block":"none"});let j1=v.querySelector("#stmb-sp-edit-lb-order-auto"),c1=v.querySelector("#stmb-sp-edit-lb-order-manual"),H1=v.querySelector("#stmb-sp-edit-lb-order-value-container"),t1=()=>{if(H1)H1.style.display=c1?.checked?"block":"none"};j1?.addEventListener("change",t1),c1?.addEventListener("change",t1);let N1=v.querySelector("#stmb-sp-edit-lb-position"),f1=v.querySelector("#stmb-sp-edit-lb-outlet-name-container");N1?.addEventListener("change",()=>{if(f1)f1.style.display=N1.value==="7"?"block":"none"})},f=h.show();if(x(),await f===X0.AFFIRMATIVE){let v=h.dlg,s=v.querySelector("#stmb-sp-edit-name")?.value.trim()||"",b1=v.querySelector("#stmb-sp-edit-prompt")?.value.trim()||"",y1=v.querySelector("#stmb-sp-edit-response-format")?.value.trim()||"",G1=!!v.querySelector("#stmb-sp-edit-enabled")?.checked;if(!b1){toastr.error(O("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),O("STMemoryBooks","index.toast.title"));return}if(!s)toastr.info(O("Name was empty. Keeping previous name.","STMemoryBooks_NameEmptyKeepPrevious"),O("STMemoryBooks","index.toast.title"));let j1={},c1=!!v.querySelector("#stmb-sp-edit-trg-interval")?.checked,H1=!!v.querySelector("#stmb-sp-edit-trg-aftermem")?.checked,t1=!!v.querySelector("#stmb-sp-edit-trg-manual")?.checked;if(c1){let K8=parseInt(v.querySelector("#stmb-sp-edit-interval")?.value??"50",10),F7=Math.max(1,isNaN(K8)?50:K8);j1.onInterval={visibleMessages:F7}}if(H1)j1.onAfterMemory={enabled:!0};if(t1)j1.commands=["sideprompt"];let N1={...G.settings||{}},f1=!!v.querySelector("#stmb-sp-edit-override-enabled")?.checked;if(N1.overrideProfileEnabled=f1,f1){let K8=parseInt(v.querySelector("#stmb-sp-edit-override-index")?.value??"",10);if(!isNaN(K8))N1.overrideProfileIndex=K8}else delete N1.overrideProfileIndex;let b8=v.querySelector("#stmb-sp-edit-lb-mode")?.value||"link",F8=parseInt(v.querySelector("#stmb-sp-edit-lb-position")?.value??"0",10),u=!!v.querySelector("#stmb-sp-edit-lb-order-manual")?.checked,i=parseInt(v.querySelector("#stmb-sp-edit-lb-order-value")?.value??"100",10),W1=!!v.querySelector("#stmb-sp-edit-lb-prevent")?.checked,p1=!!v.querySelector("#stmb-sp-edit-lb-delay")?.checked,gZ=F8===7?v.querySelector("#stmb-sp-edit-lb-outlet-name")?.value?.trim()||"":"",_6=parseInt(v.querySelector("#stmb-sp-edit-prev-mem-count")?.value??"0",10);N1.previousMemoriesCount=Number.isFinite(_6)&&_6>0?Math.min(_6,7):0,N1.lorebook={constVectMode:["link","green","blue"].includes(b8)?b8:"link",position:Number.isFinite(F8)?F8:0,orderMode:u?"manual":"auto",orderValue:Number.isFinite(i)?i:100,preventRecursion:W1,delayUntilRecursion:p1,...F8===7&&gZ?{outletName:gZ}:{}},await Y6({key:G.key,name:s,enabled:G1,prompt:b1,responseFormat:y1,settings:N1,triggers:j1}),toastr.success(s1("STMemoryBooks_Toast_SidePromptUpdated",'SidePrompt "{{name}}" updated.',{name:s||G.name}),O("STMemoryBooks","index.toast.title")),window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated")),await z0(Z,G.key)}}catch(G){console.error("STMemoryBooks: Error editing side prompt:",G),toastr.error(O("Failed to edit SidePrompt","STMemoryBooks_FailedToEditSidePrompt"),O("STMemoryBooks","index.toast.title"))}}async function DG(Z){let Q=d1?.STMemoryBooks?.profiles||[],G=Number(d1?.STMemoryBooks?.defaultProfile??0);if(!(G>=0&&G<Q.length))G=0;let J=Q.map((X,j)=>`<option value="${j}" ${j===G?"selected":""}>${D(X?.name||"Profile "+(j+1))}</option>`).join(""),W=`
        <h3>${D(O("New Side Prompt","STMemoryBooks_NewSidePrompt"))}</h3>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-name">
                <h4>${D(O("Name:","STMemoryBooks_Name"))}</h4>
                <input type="text" id="stmb-sp-new-name" class="text_pole" placeholder="${D(O("My Side Prompt","STMemoryBooks_MySidePromptPlaceholder"))}" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-enabled">
                <span>${D(O("Enabled","STMemoryBooks_Enabled"))}</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${D(O("Triggers:","STMemoryBooks_Triggers"))}</h4>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-interval">
                <span>${D(O("Run on visible message interval","STMemoryBooks_RunOnVisibleMessageInterval"))}</span>
            </label>
            <div id="stmb-sp-new-interval-container" class="displayNone" style="margin-left:28px;">
                <label for="stmb-sp-new-interval">
                    <h4 style="margin: 0 0 4px 0;">${D(O("Interval (visible messages):","STMemoryBooks_IntervalVisibleMessages"))}</h4>
                    <input type="number" id="stmb-sp-new-interval" class="text_pole" min="1" step="1" value="50">
                </label>
            </div>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-aftermem">
                <span>${D(O("Run automatically after memory","STMemoryBooks_RunAutomaticallyAfterMemory"))}</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-manual" checked>
                <span>${D(O("Allow manual run via /sideprompt","STMemoryBooks_AllowManualRunViaSideprompt"))}</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prompt">
                <h4>${D(O("Prompt:","STMemoryBooks_PromptTitle"))}</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-prompt" class="text_pole textarea_compact" rows="8" placeholder="${D(O("Enter your prompt here...","STMemoryBooks_EnterPromptPlaceholder"))}"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-response-format">
                <h4>${D(O("Response Format (optional):","STMemoryBooks_ResponseFormatOptional"))}</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-response-format" class="text_pole textarea_compact" rows="6" placeholder="${D(O("Optional response format","STMemoryBooks_ResponseFormatPlaceholder"))}"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${D(O("Lorebook Entry Settings","STMemoryBooks_LorebookEntrySettings"))}:</h4>
            <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                <label>
                    <h4 style="margin: 0 0 4px 0;">${D(O("Activation Mode","STMemoryBooks_ActivationMode"))}:</h4>
                    <select id="stmb-sp-new-lb-mode" class="text_pole">
                        <option value="link" selected>${D(O("\uD83D\uDD17 Vectorized (Default)","STMemoryBooks_Vectorized"))}</option>
                        <option value="green">${D(O("\uD83D\uDFE2 Normal","STMemoryBooks_Normal"))}</option>
                        <option value="blue">${D(O("\uD83D\uDD35 Constant","STMemoryBooks_Constant"))}</option>
                    </select>
                </label>
                <label>
                    <h4 style="margin: 0 0 4px 0;">${D(O("Insertion Position:","STMemoryBooks_InsertionPosition"))}</h4>
                    <select id="stmb-sp-new-lb-position" class="text_pole">
                        <option value="0" selected>${D(O("↑Char","STMemoryBooks_CharUp"))}</option>
                        <option value="1">${D(O("↓Char","STMemoryBooks_CharDown"))}</option>
                        <option value="2">${D(O("↑AN","STMemoryBooks_ANUp"))}</option>
                        <option value="3">${D(O("↓AN","STMemoryBooks_ANDown"))}</option>
                        <option value="4">${D(O("↑EM","STMemoryBooks_EMUp"))}</option>
                        <option value="5">${D(O("↓EM","STMemoryBooks_EMDown"))}</option>
                        <option value="7">${D(O("Outlet","STMemoryBooks_Outlet"))}</option>
                    </select>
                    <div id="stmb-sp-new-lb-outlet-name-container" class="displayNone" style="margin-top: 8px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">${D(O("Outlet Name:","STMemoryBooks_OutletName"))}</h4>
                            <input type="text" id="stmb-sp-new-lb-outlet-name" class="text_pole" placeholder="${D(O("Outlet name (e.g., ENDING)","STMemoryBooks_OutletNamePlaceholder"))}">
                        </label>
                    </div>
                </label>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <h4>${D(O("Insertion Order:","STMemoryBooks_InsertionOrder"))}</h4>
                <label class="radio_label">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-auto" value="auto" checked>
                    <span>${D(O("Auto (uses memory #)","STMemoryBooks_AutoOrder"))}</span>
                </label>
                <label class="radio_label" style="margin-left: 12px;">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-manual" value="manual">
                    <span>${D(O("Manual","STMemoryBooks_ManualOrder"))}</span>
                </label>
                <div id="stmb-sp-new-lb-order-value-container" style="display:none; margin-left:28px;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${D(O("Order Value:","STMemoryBooks_OrderValue"))}</h4>
                        <input type="number" id="stmb-sp-new-lb-order-value" class="text_pole" step="1" value="100">
                    </label>
                </div>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-lb-prevent" checked>
                    <span>${D(O("Prevent Recursion","STMemoryBooks_PreventRecursion"))}</span>
                </label>
                <label class="checkbox_label" style="margin-left: 12px;">
                    <input type="checkbox" id="stmb-sp-new-lb-delay">
                    <span>${D(O("Delay Until Recursion","STMemoryBooks_DelayUntilRecursion"))}</span>
                </label>
            </div>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prev-mem-count">
                <h4>${D(O("Previous memories for context:","STMemoryBooks_PreviousMemoriesForContext"))}</h4>
<input type="number" id="stmb-sp-new-prev-mem-count" class="text_pole" min="0" max="7" step="1" value="0">
            </label>
            <small class="opacity70p">${D(O("Number of previous memory entries to include before scene text (0 = none).","STMemoryBooks_PreviousMemoriesHelp"))}</small>
        </div>

        <div class="world_entry_form_control">
            <h4>${D(O("Overrides:","STMemoryBooks_Overrides"))}</h4>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-override-enabled">
                    <span>${D(O("Override default memory profile","STMemoryBooks_OverrideDefaultMemoryProfile"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-new-override-container" style="display: none;">
                <label for="stmb-sp-new-override-index">
                    <h4>${D(O("Connection Profile:","STMemoryBooks_ConnectionProfile"))}</h4>
                    <select id="stmb-sp-new-override-index" class="text_pole">
                        ${J}
                    </select>
                </label>
            </div>
        </div>
    `,q=new M8(j6.sanitize(W),P0.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:O("Create","STMemoryBooks_Create"),cancelButton:O("Cancel","STMemoryBooks_Cancel")}),Y=()=>{let X=q.dlg,j=X.querySelector("#stmb-sp-new-trg-interval"),K=X.querySelector("#stmb-sp-new-interval-container");j?.addEventListener("change",()=>{if(K)K.style.display=j.checked?"block":"none";if(j.checked)X.querySelector("#stmb-sp-new-interval")?.focus()});let F=X.querySelector("#stmb-sp-new-override-enabled"),H=X.querySelector("#stmb-sp-new-override-container");F?.addEventListener("change",()=>{if(H)H.style.display=F.checked?"block":"none"});let B=X.querySelector("#stmb-sp-new-lb-order-auto"),A=X.querySelector("#stmb-sp-new-lb-order-manual"),T=X.querySelector("#stmb-sp-new-lb-order-value-container"),R=()=>{if(T)T.style.display=A?.checked?"block":"none"};B?.addEventListener("change",R),A?.addEventListener("change",R);let N=X.querySelector("#stmb-sp-new-lb-position"),M=X.querySelector("#stmb-sp-new-lb-outlet-name-container");N?.addEventListener("change",()=>{if(M)M.classList.toggle("displayNone",N.value!=="7")})},z=q.show();if(Y(),await z===X0.AFFIRMATIVE){let X=q.dlg,j=X.querySelector("#stmb-sp-new-name")?.value.trim()||"",K=!!X.querySelector("#stmb-sp-new-enabled")?.checked,F=X.querySelector("#stmb-sp-new-prompt")?.value.trim()||"",H=X.querySelector("#stmb-sp-new-response-format")?.value.trim()||"";if(!F){toastr.error(O("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),O("STMemoryBooks","index.toast.title"));return}if(!j)toastr.info(s1("STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled",'No name provided. Using "{{name}}".',{name:O("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")}),O("STMemoryBooks","index.toast.title"));let B={},A=!!X.querySelector("#stmb-sp-new-trg-interval")?.checked,T=!!X.querySelector("#stmb-sp-new-trg-aftermem")?.checked,R=!!X.querySelector("#stmb-sp-new-trg-manual")?.checked;if(A){let v=parseInt(X.querySelector("#stmb-sp-new-interval")?.value??"50",10),s=Math.max(1,isNaN(v)?50:v);B.onInterval={visibleMessages:s}}if(T)B.onAfterMemory={enabled:!0};if(R)B.commands=["sideprompt"];let N={},M=!!X.querySelector("#stmb-sp-new-override-enabled")?.checked;if(N.overrideProfileEnabled=M,M){let v=parseInt(X.querySelector("#stmb-sp-new-override-index")?.value??"",10);if(!isNaN(v))N.overrideProfileIndex=v}let E=X.querySelector("#stmb-sp-new-lb-mode")?.value||"link",y=parseInt(X.querySelector("#stmb-sp-new-lb-position")?.value??"0",10),C=!!X.querySelector("#stmb-sp-new-lb-order-manual")?.checked,_=parseInt(X.querySelector("#stmb-sp-new-lb-order-value")?.value??"100",10),h=!!X.querySelector("#stmb-sp-new-lb-prevent")?.checked,x=!!X.querySelector("#stmb-sp-new-lb-delay")?.checked,f=y===7?X.querySelector("#stmb-sp-new-lb-outlet-name")?.value?.trim()||"":"",g=parseInt(X.querySelector("#stmb-sp-new-prev-mem-count")?.value??"0",10);N.previousMemoriesCount=Number.isFinite(g)&&g>0?Math.min(g,7):0,N.lorebook={constVectMode:["link","green","blue"].includes(E)?E:"link",position:Number.isFinite(y)?y:0,orderMode:C?"manual":"auto",orderValue:Number.isFinite(_)?_:100,preventRecursion:h,delayUntilRecursion:x,...y===7&&f?{outletName:f}:{}};try{await Y6({name:j,enabled:K,prompt:F,responseFormat:H,settings:N,triggers:B}),toastr.success(O("SidePrompt created","STMemoryBooks_SidePromptCreated"),O("STMemoryBooks","index.toast.title")),await z0(Z)}catch(v){console.error("STMemoryBooks: Error creating side prompt:",v),toastr.error(O("Failed to create SidePrompt","STMemoryBooks_FailedToCreateSidePrompt"),O("STMemoryBooks","index.toast.title"))}}}async function _G(){try{let Z=await KZ(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-side-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(O("Side prompts exported successfully","STMemoryBooks_SidePromptsExported"),O("STMemoryBooks","index.toast.title"))}catch(Z){console.error("STMemoryBooks: Error exporting side prompts:",Z),toastr.error(O("Failed to export side prompts","STMemoryBooks_FailedToExportSidePrompts"),O("STMemoryBooks","index.toast.title"))}}async function IG(Z,Q){let G=Z.target.files?.[0];if(!G)return;try{let J=await G.text(),W=await UZ(J);if(W&&typeof W==="object"){let{added:q=0,renamed:Y=0}=W,z=Y>0?s1("STMemoryBooks_ImportedSidePromptsRenamedDetail"," ({{count}} renamed due to key conflicts)",{count:Y}):"";toastr.success(s1("STMemoryBooks_ImportedSidePromptsDetail","Imported side prompts: {{added}} added{{detail}}",{added:q,detail:z}),O("STMemoryBooks","index.toast.title"))}else toastr.success(O("Imported side prompts","STMemoryBooks_ImportedSidePrompts"),O("STMemoryBooks","index.toast.title"));await z0(Q)}catch(J){console.error("STMemoryBooks: Error importing side prompts:",J),toastr.error(s1("STMemoryBooks_FailedToImportSidePrompts","Failed to import: {{message}}",{message:J?.message||"Unknown error"}),O("STMemoryBooks","index.toast.title"))}}async function I5(){try{let Z='<h3 data-i18n="STMemoryBooks_SidePrompts_Title">\uD83C\uDFA1 Trackers & Side Prompts</h3>';Z+='<div class="world_entry_form_control">',Z+='<p class="opacity70p" data-i18n="STMemoryBooks_SidePrompts_Desc">Create and manage side prompts for trackers and other behind-the-scenes functions.</p>',Z+="</div>",Z+='<div class="world_entry_form_control">',Z+='<input type="text" id="stmb-sp-search" class="text_pole" data-i18n="[placeholder]STMemoryBooks_SearchSidePrompts;[aria-label]STMemoryBooks_SearchSidePrompts" placeholder="Search side prompts..." aria-label="Search side prompts" />',Z+="</div>",Z+='<div class="world_entry_form_control">',Z+=`<label for="stmb-sp-max-concurrent"><h4>${D(O("How many concurrent prompts to run at once","STMemoryBooks_SidePrompts_MaxConcurrentLabel"))}</h4></label>`,Z+='<input type="number" id="stmb-sp-max-concurrent" class="text_pole" min="1" max="5" step="1" value="2">',Z+=`<small class="opacity70p">${D(O("Range 1–5. Defaults to 2.","STMemoryBooks_SidePrompts_MaxConcurrentHelp"))}</small>`,Z+="</div>",Z+='<div id="stmb-sp-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',Z+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',Z+=`<button id="stmb-sp-new" class="menu_button whitespacenowrap">${D(O("New","STMemoryBooks_SidePrompts_New"))}</button>`,Z+=`<button id="stmb-sp-export" class="menu_button whitespacenowrap">${D(O("Export JSON","STMemoryBooks_SidePrompts_ExportJSON"))}</button>`,Z+=`<button id="stmb-sp-import" class="menu_button whitespacenowrap">${D(O("Import JSON","STMemoryBooks_SidePrompts_ImportJSON"))}</button>`,Z+=`<button id="stmb-sp-recreate-builtins" class="menu_button whitespacenowrap">${D(O("♻️ Recreate Built-in Side Prompts","STMemoryBooks_SidePrompts_RecreateBuiltIns"))}</button>`,Z+="</div>",Z+='<input type="file" id="stmb-sp-import-file" accept=".json" style="display: none;" />';let Q=new M8(j6.sanitize(Z),P0.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:O("Close","STMemoryBooks_Close")});(()=>{let J=Q.dlg;if(!J)return;let W=J.querySelector("#stmb-sp-max-concurrent");if(W){let q=(V,X,j)=>Math.max(X,Math.min(j,V)),Y=q(Number(d1?.STMemoryBooks?.moduleSettings?.sidePromptsMaxConcurrent??2),1,5);W.value=String(Y);let z=()=>{let V=parseInt(W.value,10),X=q(isNaN(V)?2:V,1,5);if(W.value=String(X),!d1.STMemoryBooks)d1.STMemoryBooks={moduleSettings:{}};if(!d1.STMemoryBooks.moduleSettings)d1.STMemoryBooks.moduleSettings={};d1.STMemoryBooks.moduleSettings.sidePromptsMaxConcurrent=X,AG()};W.addEventListener("change",z)}J.querySelector("#stmb-sp-search")?.addEventListener("input",()=>z0(Q)),J.querySelector("#stmb-sp-new")?.addEventListener("click",async()=>{await DG(Q)}),J.querySelector("#stmb-sp-export")?.addEventListener("click",async()=>{await _G()}),J.querySelector("#stmb-sp-import")?.addEventListener("click",()=>{J.querySelector("#stmb-sp-import-file")?.click()}),J.querySelector("#stmb-sp-import-file")?.addEventListener("change",async(q)=>{await IG(q,Q)}),J.querySelector("#stmb-sp-recreate-builtins")?.addEventListener("click",async()=>{let q=`<div class="info_block">${D(O("This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.","STMemoryBooks_SidePrompts_RecreateWarning"))}</div>`;if(await new M8(`<h3>${D(O("Recreate Built-in Side Prompts","STMemoryBooks_SidePrompts_RecreateTitle"))}</h3>${q}`,P0.CONFIRM,"",{okButton:O("Recreate","STMemoryBooks_SidePrompts_RecreateOk"),cancelButton:O("Cancel","STMemoryBooks_Cancel")}).show()===X0.AFFIRMATIVE)try{let V=await HZ("overwrite"),X=Number(V?.replaced||0);toastr.success(s1("STMemoryBooks_SidePrompts_RecreateSuccess","Recreated {{count}} built-in side prompts from current locale",{count:X}),O("STMemoryBooks","index.toast.title")),window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated")),await z0(Q)}catch(V){console.error("STMemoryBooks: Error recreating built-in side prompts:",V),toastr.error(O("Failed to recreate built-in side prompts","STMemoryBooks_SidePrompts_RecreateFailed"),O("STMemoryBooks","index.toast.title"))}}),J.addEventListener("click",async(q)=>{let Y=q.target.closest(".stmb-sp-action"),z=q.target.closest("tr[data-tpl-key]");if(!z)return;let V=z.dataset.tplKey;if(J.querySelectorAll("tr[data-tpl-key]").forEach((X)=>{X.classList.remove("ui-state-active"),X.style.backgroundColor="",X.style.border=""}),z.style.backgroundColor="var(--cobalt30a)",z.style.border="",Y){if(q.preventDefault(),q.stopPropagation(),Y.classList.contains("stmb-sp-action-edit"))await NG(Q,V);else if(Y.classList.contains("stmb-sp-action-duplicate"))try{let X=await jZ(V);toastr.success(O("SidePrompt duplicated","STMemoryBooks_SidePromptDuplicated"),O("STMemoryBooks","index.toast.title")),await z0(Q,X)}catch(X){console.error("STMemoryBooks: Error duplicating side prompt:",X),toastr.error(O("Failed to duplicate SidePrompt","STMemoryBooks_FailedToDuplicateSidePrompt"),O("STMemoryBooks","index.toast.title"))}else if(Y.classList.contains("stmb-sp-action-delete")){if(await new M8(`<h3>${D(s1("STMemoryBooks_DeleteSidePromptTitle","Delete Side Prompt",{name:V}))}</h3><p>${D(s1("STMemoryBooks_DeleteSidePromptConfirm","Are you sure you want to delete this template?",{name:V}))}</p>`,P0.CONFIRM,"",{okButton:O("Delete","STMemoryBooks_Delete"),cancelButton:O("Cancel","STMemoryBooks_Cancel")}).show()===X0.AFFIRMATIVE)try{await FZ(V),toastr.success(O("SidePrompt deleted","STMemoryBooks_SidePromptDeleted"),O("STMemoryBooks","index.toast.title")),await z0(Q)}catch(K){console.error("STMemoryBooks: Error deleting side prompt:",K),toastr.error(O("Failed to delete SidePrompt","STMemoryBooks_FailedToDeleteSidePrompt"),O("STMemoryBooks","index.toast.title"))}}return}})})(),await z0(Q),await Q.show();try{D5(Q)}catch(J){}}catch(Z){console.error("STMemoryBooks: Error showing Side Prompts:",Z),toastr.error(O("Failed to open Side Prompts","STMemoryBooks_FailedToOpenSidePrompts"),O("STMemoryBooks","index.toast.title"))}}w8();_1();import{translate as wZ}from"../../../i18n.js";function w5(){return{arc_default:wZ(`You are an expert narrative analyst and memory-engine assistant.
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
- No markdown fences, no commentary, no system prompts, no extra text.`,"STMemoryBooks_ArcPrompt_Default"),arc_alternate:wZ(`You are an expert narrative analyst and memory-engine assistant.
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
- No markdown fences, no commentary, no system prompts, no extra text.`,"STMemoryBooks_ArcPrompt_Alternate"),arc_tiny:wZ(`You specialize in compressing many small memories into compact, coherent story arcs. Combine the memories below — and the previous arc if provided — into a single arc that captures the main narrative through-lines.

Return JSON only:
{ "arcs": [ { "title": "...", "summary": "...", "keywords": ["..."], "member_ids": ["<ID>", "..."] } ], "unassigned_memories": [ { "id": "...", "reason": "..." } ] }

Rules:
- 5–15% length compression
- Focus on plot, emotional progression, decisions, conflicts, continuity
- Identify non-fitting items in unassigned_memories with a brief reason
- No quotes, no OOC, no commentary outside JSON`,"STMemoryBooks_ArcPrompt_Tiny")}}function V0(){return w5()}function h8(){return w5().arc_default}H0();import{getRequestHeaders as LZ}from"../../../../script.js";import{translate as L5}from"../../../i18n.js";var v8="STMemoryBooks-ArcAnalysisPromptManager",CZ=g0.ARC_PROMPTS_FILE,P8={arc_default:"STMemoryBooks_ArcDefaultDisplayName",arc_alternate:"STMemoryBooks_ArcAlternateDisplayName"},x0=null;function wG(Z){return String(Z||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)}function j0(Z){return String(Z||"").replace(/\w\S*/g,(Q)=>{return Q.charAt(0).toUpperCase()+Q.slice(1).toLowerCase()})}function x8(Z){let Q=String(Z||"").split(`
`).filter((G)=>G.trim());if(Q.length>0){let J=Q[0].trim().replace(/^(You are|Analyze|Create|Generate|Write)\s+/i,"").replace(/[:.]/g,"").trim();return j0(J.substring(0,50))}return"Arc Prompt"}function C5(Z,Q){let G=V0()||{},J=Q||{},W=wG(Z||"arc-prompt"),q=W,Y=2;while(q in J||q in G)q=`${W}-${Y++}`;return q}function M5(Z){if(!Z||typeof Z!=="object")return!1;if(typeof Z.version!=="number")return!1;if(!Z.overrides||typeof Z.overrides!=="object")return!1;for(let[Q,G]of Object.entries(Z.overrides)){if(!G||typeof G!=="object")return!1;if(typeof G.prompt!=="string"||!G.prompt.trim())return!1;if(G.displayName!==void 0&&typeof G.displayName!=="string")return!1}return!0}async function S1(Z=null){if(x0)return x0;let Q=!1,G=null;try{let J=await fetch(`/user/files/${CZ}`,{method:"GET",credentials:"include",headers:LZ()});if(!J.ok)Q=!0;else{let W=await J.text();if(G=JSON.parse(W),!M5(G))Q=!0}}catch{Q=!0}if(Q){let J={},W=new Date().toISOString(),q=V0()||{};for(let[Y,z]of Object.entries(q)){let V;if(P8[Y])V=L5(P8[Y])||j0(Y.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||x8(z);else V=j0(Y.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||x8(z);J[Y]={displayName:V,prompt:z,createdAt:W}}G={version:i1.CURRENT_VERSION,overrides:J},await S0(G)}return x0=G,x0}async function S0(Z){let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:LZ(),body:JSON.stringify({name:CZ,data:G})});if(!J.ok){let W=L5("Failed to save arc prompts","STMemoryBooks_ArcPromptManager_SaveFailed");throw Error(`${W}: ${J.statusText}`)}x0=Z,console.log(`${v8}: Arc prompts saved`)}async function MZ(Z){return await S1(Z),!0}async function F6(Z=null){let Q=await S1(Z),G=[];for(let[W,q]of Object.entries(Q.overrides))G.push({key:W,displayName:q.displayName||j0(W),createdAt:q.createdAt||null});let J=V0()||{};for(let W of Object.keys(J))if(!(W in Q.overrides))G.push({key:W,displayName:P8[W]||j0(W.replace(/^arc[_-]?/,"").replace(/[_-]/g," ")),createdAt:null});return G.sort((W,q)=>{if(!W.createdAt)return 1;if(!q.createdAt)return-1;return new Date(q.createdAt)-new Date(W.createdAt)}),G}async function K6(Z,Q=null){let G=await S1(Q);if(G.overrides[Z]&&typeof G.overrides[Z].prompt==="string"&&G.overrides[Z].prompt.trim())return G.overrides[Z].prompt;return V0()[Z]||h8()}async function hZ(Z,Q=null){let G=await S1(Q);if(G.overrides[Z]&&G.overrides[Z].displayName)return G.overrides[Z].displayName;return P8[Z]||j0(String(Z||"").replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||"Arc Prompt"}async function h5(Z,Q=null){let G=await S1(Q),J=V0()||{};return!!(G.overrides[Z]||J[Z])}async function vZ(Z,Q,G){let J=await S1(),W=new Date().toISOString(),q=Z;if(!q)q=C5(G||x8(Q),J.overrides);if(J.overrides[q])J.overrides[q].prompt=Q,J.overrides[q].displayName=G||J.overrides[q].displayName,J.overrides[q].updatedAt=W;else J.overrides[q]={displayName:G||x8(Q),prompt:Q,createdAt:W};return await S0(J),q}async function v5(Z){let Q=await S1(),G=Q.overrides[Z];if(!G)throw Error(`Arc preset "${Z}" not found`);let J=`${G.displayName||j0(Z)} (Copy)`,W=C5(J,Q.overrides),q=new Date().toISOString();return Q.overrides[W]={displayName:J,prompt:G.prompt,createdAt:q},await S0(Q),W}async function P5(Z){let Q=await S1();if(!Q.overrides[Z])throw Error(`Arc preset "${Z}" not found`);delete Q.overrides[Z],await S0(Q)}async function x5(){let Z=await S1();return JSON.stringify(Z,null,2)}async function S5(Z){let Q=JSON.parse(Z);if(!M5(Q))throw Error("Invalid arc prompts file structure.");await S0(Q)}async function E5(Z="overwrite"){if(Z!=="overwrite")console.warn(`${v8}: Unsupported mode "${Z}", defaulting to overwrite`);let Q=await S1(),G=V0()||{},J=Object.keys(G),W=0;if(Q&&Q.overrides&&typeof Q.overrides==="object"){for(let q of J)if(q in Q.overrides)delete Q.overrides[q],W++}return await S0(Q),x0=Q,console.log(`${v8}: Recreated arc built-ins (removed ${W} overrides)`),{removed:W}}async function b5(Z={}){let Q=Z.backup!==!1,G=V0()||{},J=new Date().toISOString(),W={};for(let[z,V]of Object.entries(G))W[z]={displayName:P8[z]||j0(z.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||x8(V),prompt:V,createdAt:J};let q;try{let z=await S1();if(Q&&z){let V=String(CZ||"stmb-arc-prompts.json").replace(/\.json$/i,""),X=J.replace(/[:.]/g,"-");q=`${V}.backup-${X}.json`;let j=JSON.stringify(z,null,2),K=btoa(unescape(encodeURIComponent(j))),F=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:LZ(),body:JSON.stringify({name:q,data:K})});if(!F.ok)console.warn(`${v8}: Failed to write backup "${q}": ${F.statusText}`)}}catch(z){console.warn(`${v8}: Backup step failed:`,z)}let Y={version:i1.CURRENT_VERSION,overrides:W};await S0(Y),x0=Y;try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch{}return{count:Object.keys(W).length,backupName:q}}import{extension_settings as m5}from"../../../extensions.js";import{translate as U6}from"../../../i18n.js";var LG=`Based on this narrative arc summary, generate 15–30 standalone topical keywords that function as retrieval tags, not micro-summaries.
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

Return ONLY a JSON array of 15-30 strings. No commentary, no explanations.`;function d5(Z){return String(Z||"").replace(/\r\n/g,`
`).replace(/^\uFEFF/,"").replace(/[\u200B-\u200D\u2060]/g,"")}function c5(Z){let Q=/```([\w+-]*)\s*([\s\S]*?)```/g,G=[],J;while((J=Q.exec(Z))!==null)G.push((J[2]||"").trim());return G}function p5(Z){let Q=Z.search(/[\{\[]/);if(Q===-1)return null;let G=Z[Q],J=G==="{"?"}":"]",W=0,q=!1,Y=!1;for(let z=Q;z<Z.length;z++){let V=Z[z];if(q){if(Y)Y=!1;else if(V==="\\")Y=!0;else if(V==='"')q=!1;continue}if(V==='"'){q=!0;continue}if(V===G)W++;else if(V===J){if(W--,W===0)return Z.slice(Q,z+1).trim()}}return null}function i5(Z){let Q="",G=!1,J=!1,W=!1,q=!1;for(let Y=0;Y<Z.length;Y++){let z=Z[Y],V=Z[Y+1];if(G){if(Q+=z,J)J=!1;else if(z==="\\")J=!0;else if(z==='"')G=!1;continue}if(W){if(z===`
`)W=!1,Q+=z;continue}if(q){if(z==="*"&&V==="/")q=!1,Y++;continue}if(z==='"'){G=!0,Q+=z;continue}if(z==="/"&&V==="/"){W=!0,Y++;continue}if(z==="/"&&V==="*"){q=!0,Y++;continue}Q+=z}return Q}function l5(Z){let Q="",G=!1,J=!1;for(let W=0;W<Z.length;W++){let q=Z[W];if(G){if(Q+=q,J)J=!1;else if(q==="\\")J=!0;else if(q==='"')G=!1;continue}if(q==='"'){G=!0,Q+=q;continue}if(q===","){let Y=W+1;while(Y<Z.length&&/\s/.test(Z[Y]))Y++;if(Z[Y]==="}"||Z[Y]==="]")continue}Q+=q}return Q}function f5(Z){let Q=[],G=new Set;for(let J of Z||[]){let W=String(J||"").trim();if(W=W.replace(/^["']|["']$/g,""),W=W.replace(/^\d+\.\s*/,""),W=W.replace(/^[\-\*\u2022]\s*/,""),W=W.trim(),!W)continue;let q=W.toLowerCase();if(G.has(q))continue;if(G.add(q),Q.push(W),Q.length>=30)break}return Q}function k5(Z){let Q=d5(String(Z||"").trim()),G=[],J=c5(Q);if(J.length)G.push(...J);let W=p5(Q);if(W)G.push(W);G.push(Q);let q=Array.from(new Set(G));for(let V of q)try{let X=l5(i5(V)),j=JSON.parse(X),K=Array.isArray(j)?j:j&&Array.isArray(j.keywords)?j.keywords:null;if(K)return f5(K)}catch{}let Y=Q.split(/\r?\n/).map((V)=>V.trim()).filter(Boolean),z=[];if(Y.length>1)z=Y.map((V)=>V.replace(/^[\-\*\u2022]?\s*\d*\.?\s*/,"").trim());else z=Q.split(/[,;]+/).map((V)=>V.trim());return f5(z)}async function CG(Z,Q){let G=String(Z||"").trim(),J=`${LG}

=== ARC SUMMARY ===
${G}
=== END SUMMARY ===`,{text:W}=await w0({model:Q.model,prompt:J,temperature:typeof Q.temperature==="number"?Q.temperature:0.2,api:Q.api,endpoint:Q.endpoint,apiKey:Q.apiKey,extra});try{console.debug("STMB ArcAnalysis: keyword gen response length=%d",(W||"").length)}catch{}let q=[];try{q=k5(W)}catch{}if(!Array.isArray(q)||q.length===0){let Y=`${J}

Return ONLY a JSON array of 15-30 strings.`,z=await w0({model:Q.model,prompt:Y,temperature:typeof Q.temperature==="number"?Q.temperature:0.2,api:Q.api,endpoint:Q.endpoint,apiKey:Q.apiKey,extra});q=k5(z.text)}if(q.length>30)q=q.slice(0,30);return q}function MG(Z){let Q=[];for(let G of Z){if(!G||typeof G!=="object")continue;let J=String(G.uid??""),W=hG(G.comment??"")??0,q=String(G.content??"").trim(),Y=(G.comment||"Untitled").toString().trim();Q.push({id:J,order:W,content:q,title:Y})}return Q.sort((G,J)=>G.order-J.order),Q}function hG(Z){if(!Z)return null;let Q=Z.match(/\[(\d+)\]/);if(Q)return parseInt(Q[1],10);let G=Z.match(/^(\d+)[\s-]/);if(G)return parseInt(G[1],10);return null}function g5({briefs:Z,previousArcSummary:Q=null,previousArcOrder:G=null,promptText:J=null}){let W=J||h8(),q=[];if(Q){if(q.push("=== PREVIOUS ARC (CANON — DO NOT REWRITE, DO NOT INCLUDE IN YOUR NEW SUMMARY) ==="),typeof G<"u"&&G!==null)q.push(`Arc ${G}`);q.push(Q.trim()),q.push("=== END PREVIOUS ARC ==="),q.push("")}return q.push("=== MEMORIES ==="),Z.forEach((Y,z)=>{let V=String(z+1).padStart(3,"0"),X=(Y.title||"").toString().trim(),j=(Y.content||"").toString().trim();q.push(`=== Memory ${V} ===`),q.push(`Title: ${X}`),q.push(`Contents: ${j}`),q.push(`=== end Memory ${V} ===`),q.push("")}),q.push("=== END MEMORIES ==="),q.push(""),`${W}

${q.join(`
`)}`}function u5(Z){if(!Z||typeof Z!=="string")throw Error(U6("Empty AI response","STMemoryBooks_ArcAnalysis_EmptyResponse"));let Q=d5(Z.trim().replace(/<think>[\s\S]*?<\/think>/gi,"")),G=[],J=c5(Q);if(J.length)G.push(...J);G.push(Q);let W=p5(Q);if(W)G.push(W);let q=Array.from(new Set(G));for(let Y of q)try{let z=Y;z=i5(z),z=l5(z);let V=JSON.parse(z);if(!V||typeof V!=="object")continue;if(!("arcs"in V)||!("unassigned_memories"in V))continue;let X=Array.isArray(V.arcs)?V.arcs:[],j=Array.isArray(V.unassigned_memories)?V.unassigned_memories:[],K=X.filter((H)=>H&&typeof H.title==="string"&&H.title.trim()&&typeof H.summary==="string"&&H.summary.trim()),F=j.filter((H)=>H&&typeof H.id==="string"&&H.id.trim()&&typeof H.reason==="string");return{arcs:K,unassigned_memories:F}}catch{}throw Error(U6("Model did not return valid arc JSON","STMemoryBooks_ArcAnalysis_InvalidJSON"))}async function o5(Z,Q={},G=null){let{presetKey:J="arc_default",maxItemsPerPass:W=12,maxPasses:q=10,minAssigned:Y=2,tokenTarget:z}=Q,V=Q?.extra??{},X=J==="arc_alternate",j=Object.prototype.hasOwnProperty.call(Q,"maxPasses")?q:X?1:q,K=m5?.STMemoryBooks?.moduleSettings?.tokenWarningThreshold,F=typeof z==="number"?z:typeof K==="number"?K:30000,H=F,B=Z.map((x)=>x&&x.entry?x.entry:x).filter(Boolean),A=MG(B),T=new Map(A.map((x)=>[x.id,x])),R=[],N=null;try{if(J&&await h5(J))N=await K6(J)}catch{}if(!N)N=h8();let M=n5(G),E=null,y=null,C=0,_=[];while(T.size>0&&C<j){C++,H=F;let x=Array.from(T.values()).sort((u,i)=>u.order-i.order),f=[];for(let u of _)if(T.has(u.id)&&f.length<W)f.push(u);for(let u of x){if(f.length>=W)break;if(!f.find((i)=>i.id===u.id))f.push(u)}if(f.length===0)break;try{console.debug("STMB ArcAnalysis: pass %d batch=%o",C,f.map((u)=>u.id))}catch{}let g=g5({briefs:f,previousArcSummary:E,previousArcOrder:null,promptText:null}),v=await Z0(g,{estimatedOutput:500}),s=f.length,b1=!1;while(v.total>H&&f.length>1)f.pop(),b1=!0,g=g5({briefs:f,previousArcSummary:E,previousArcOrder:y,promptText:null}),v=await Z0(g,{estimatedOutput:500});if(b1)try{console.debug("STMB ArcAnalysis: trimmed batch from %d to %d (est=%d, budget=%d)",s,f.length,v.total,H)}catch{}if(v.total>H&&f.length===1){let u=H;H=v.total;try{console.debug("STMB ArcAnalysis: raised budget for single item from %d to %d (est=%d)",u,H,v.total)}catch{}}let{text:y1}=await w0({model:M.model,prompt:g,temperature:M.temperature??0.2,api:M.api,endpoint:M.endpoint,apiKey:M.apiKey,extra:V}),G1;try{G1=u5(y1)}catch(u){let i=`${g}

Return ONLY the JSON object, nothing else. Ensure arrays and commas are valid.`,W1=await w0({model:M.model,prompt:i,temperature:M.temperature??0.2,api:M.api,endpoint:M.endpoint,apiKey:M.apiKey,extra:V});G1=u5(W1.text)}let j1=new Map;f.forEach((u,i)=>{let W1=String(u.id);j1.set(W1,W1);let p1=String(i+1).padStart(3,"0");j1.set(p1,W1),j1.set(String(i+1),W1)});let c1=(u)=>j1.get(String(u).trim()),H1=new Set;if(Array.isArray(G1.unassigned_memories))G1.unassigned_memories.forEach((u)=>{let i=c1(u.id);if(i)H1.add(i)});let t1=f.filter((u)=>!H1.has(u.id));try{console.debug("STMB ArcAnalysis: pass %d arcs=%d unassigned=%d assigned=%d",C,Array.isArray(G1.arcs)?G1.arcs.length:0,H1.size,t1.length)}catch{}if(t1.length<Y&&C>1)break;let N1=Array.isArray(G1.arcs)?G1.arcs:[],f1=new Set,b8=0;for(let u=0;u<N1.length;u++){let i=N1[u];if(!i||typeof i.title!=="string"||typeof i.summary!=="string")continue;let W1=null;if(Array.isArray(i.member_ids))W1=i.member_ids.map(c1).filter((p1)=>p1!==void 0);if(W1&&W1.length>0);else W1=t1.map((p1)=>p1.id);if(W1.length===0)continue;R.push({order:C*10+u,title:i.title,summary:i.summary,keywords:Array.isArray(i.keywords)?i.keywords:[],memberIds:W1}),W1.forEach((p1)=>f1.add(String(p1))),b8++,E=i.summary}if(R.length>0)y=R[R.length-1].order;else y=null;if(f1.size>0){for(let u of f1)T.delete(String(u));if(T.size===0&&R.length===1)try{console.info("STMB ArcAnalysis: all memories were consumed into a single arc.")}catch{}}else{try{console.debug("STMB ArcAnalysis: no new IDs consumed on pass %d; stopping.",C)}catch{}break}_=f.filter((u)=>H1.has(u.id));try{console.debug("STMB ArcAnalysis: pass %d consumed=%d remaining=%d",C,f1.size,T.size)}catch{}}let h=Array.from(T.values()).map((x)=>x.id);return{arcCandidates:R,leftovers:h}}function n5(Z){if(Z&&Z.api&&Z.model)return Z;if(Z&&(Z.effectiveConnection||Z.connection)){let J=Z.effectiveConnection||Z.connection;return{api:q1(J.api||l().completionSource||"openai"),model:J.model||Z1().model||"",temperature:typeof J.temperature==="number"?J.temperature:Z1().temperature||0.2,endpoint:J.endpoint,apiKey:J.apiKey}}let Q=l(),G=Z1();return{api:q1(Q.completionSource||"openai"),model:G.model||"",temperature:G.temperature||0.2}}function vG(Z){if(!Z||typeof Z!=="string")return null;let Q=Z.match(/\[ARC\s+(\d+)\]/i);if(Q)return parseInt(Q[1],10);if(Q=Z.match(/\[ARC\s+\[(\d+)\]\]/i),Q)return parseInt(Q[1],10);return null}function PG(Z){let Q=Object.values(Z?.entries||{}),G=0;for(let J of Q)if(J&&J.stmbArc===!0&&typeof J.comment==="string"){let W=vG(J.comment);if(typeof W==="number"&&W>G)G=W}return G+1}function xG(Z,Q,G){let J=String(Q||"").trim(),W=String(Z||"").trim()||"[ARC 000] - {{title}}";W=W.replace(/\{\{\s*title\s*\}\}/g,J);let q=W.match(/\[([^\]]*?)(0{2,})([^\]]*?)\]/);if(q){let z=q[2].length,V=String(G).padStart(z,"0"),X=`[${q[1]}${V}${q[3]}]`;return W.replace(q[0],X)}return`[ARC ${String(G).padStart(3,"0")}] ${J}`}async function s5({lorebookName:Z,lorebookData:Q,arcCandidates:G,disableOriginals:J=!1}){if(!Z||!Q)throw Error(U6("Missing lorebookName or lorebookData","STMemoryBooks_ArcAnalysis_MissingLorebookData"));let W=[],q=m5?.STMemoryBooks?.arcTitleFormat||"[ARC 000] - {{title}}",Y=PG(Q);try{console.info("STMB ArcAnalysis: committing %d arc(s): %o",G.length,G.map((z)=>z.title))}catch{}for(let z of G){let V=xG(q,z.title,Y++),X=z.summary,j=Array.isArray(z.keywords)?z.keywords:[];if(j.length===0)try{let T=n5(null);j=await CG(X,T)}catch(T){try{console.warn('STMB ArcAnalysis: keyword generation failed for "%s": %s',V,String(T?.message||T))}catch{}}let K={vectorized:!0,selective:!0,order:100,position:0},F={stmemorybooks:!0,stmbArc:!0,type:"arc",key:Array.isArray(j)?j:[],disable:!1},H=await N8(Z,Q,[{title:V,content:X,defaults:K,entryOverrides:F}],{refreshEditor:!1}),B=H&&H[0],A=B?B.uid:null;if(!A)throw Error(U6("Arc upsert returned no entry (commitArcs failed)","STMemoryBooks_ArcAnalysis_UpsertFailed"));if(J&&A){let T=new Set(z.memberIds.map(String)),R=Object.values(Q.entries||{});for(let N of R)if(T.has(String(N.uid)))N.disable=!0,N.disabledByArcId=A}W.push({arcEntryId:A,title:V})}await N8(Z,Q,[],{refreshEditor:!0});try{console.info("STMB ArcAnalysis: committed arc IDs: %o",W.map((z)=>z.arcEntryId))}catch{}return{results:W}}import{Handlebars as SG}from"../../../../lib.js";var PZ=SG.compile(`
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
`);import{t as S,translate as U,applyLocale as j8,addLocaleData as SZ,getCurrentLocale as dG}from"../../../i18n.js";async function r5(Z){let G={zh:"zh-cn",zh_cn:"zh-cn",zh_tw:"zh-tw","zh.tw":"zh-tw","zh-cn":"zh-cn","zh-tw":"zh-tw","zh-CN":"zh-cn","zh-TW":"zh-tw",ja:"ja-jp",ja_jp:"ja-jp","ja-JP":"ja-jp","ja-jp":"ja-jp",ru:"ru-ru",ru_ru:"ru-ru","ru-RU":"ru-ru","ru-ru":"ru-ru",es:"es-es","es-es":"es-es",ko:"ko-kr",ko_kr:"ko-kr","ko-KR":"ko-kr","ko-kr":"ko-kr",ms:"ms-my",ms_my:"ms-my","ms-MY":"ms-my","ms-my":"ms-my",id:"id-id",id_id:"id-id","id-ID":"id-id","id-id":"id-id",en:"en",en_us:"en","en-US":"en","en-us":"en",en_gb:"en","en-GB":"en","en-gb":"en"}[Z]||Z,W={"zh-cn":"./locales/zh-cn.json","zh-tw":"./locales/zh-tw.json","ja-jp":"./locales/ja-jp.json","ru-ru":"./locales/ru-ru.json","es-es":"./locales/es-es.json","ko-kr":"./locales/ko-kr.json","ms-my":"./locales/ms-my.json","id-id":"./locales/id-id.json"}[G];if(!W)return null;try{let q=await fetch(new URL(W,import.meta.url));if(!q.ok)return null;return await q.json()}catch(q){return console.warn("STMemoryBooks: Failed to load locale JSON for",G,q),null}}var EG={STMemoryBooks_Settings:"\uD83D\uDCD5 Memory Books Settings",STMemoryBooks_CurrentScene:"Current Scene:",STMemoryBooks_Start:"Start",STMemoryBooks_End:"End",STMemoryBooks_Message:"Message",STMemoryBooks_Messages:"Messages",STMemoryBooks_EstimatedTokens:"Estimated tokens",STMemoryBooks_NoSceneMarkers:"No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.",STMemoryBooks_MemoryStatus:"Memory Status",STMemoryBooks_ProcessedUpTo:"Processed up to message",STMemoryBooks_NoMemoriesProcessed:"No memories have been processed for this chat yet",STMemoryBooks_SinceVersion:"(since updating to version 3.6.2 or higher.)",STMemoryBooks_AutoSummaryNote:'Please note that Auto-Summary requires you to "prime" every chat with at least one manual memory. After that, summaries will be made automatically.',STMemoryBooks_Preferences:"Preferences:",STMemoryBooks_AlwaysUseDefault:"Always use default profile (no confirmation prompt)",STMemoryBooks_ShowMemoryPreviews:"Show memory previews",STMemoryBooks_ShowNotifications:"Show notifications",STMemoryBooks_UnhideBeforeMemory:"Unhide hidden messages for memory generation (runs /unhide X-Y)",STMemoryBooks_EnableManualMode:"Enable Manual Lorebook Mode",STMemoryBooks_ManualModeDesc:"When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.",STMemoryBooks_AutoCreateLorebook:"Auto-create lorebook if none exists",STMemoryBooks_AutoCreateLorebookDesc:"When enabled, automatically creates and binds a lorebook to the chat if none exists.",STMemoryBooks_LorebookNameTemplate:"Lorebook Name Template:",STMemoryBooks_LorebookNameTemplateDesc:"Template for auto-created lorebook names. Supports {{char}}, {{user}}, {{chat}} placeholders.",STMemoryBooks_LorebookNameTemplatePlaceholder:"LTM - {{char}} - {{chat}}",STMemoryBooks_CurrentLorebookConfig:"Current Lorebook Configuration",STMemoryBooks_Mode:"Mode:",STMemoryBooks_ActiveLorebook:"Active Lorebook:",STMemoryBooks_NoneSelected:"None selected",STMemoryBooks_UsingChatBound:"Using chat-bound lorebook",STMemoryBooks_NoChatBound:"No chat-bound lorebook. Memories will require lorebook selection.",STMemoryBooks_AllowSceneOverlap:"Allow scene overlap",STMemoryBooks_AllowSceneOverlapDesc:"Check this box to skip checking for overlapping memories/scenes.",STMemoryBooks_RefreshEditor:"Refresh lorebook editor after adding memories",STMemoryBooks_AutoSummaryEnabled:"Auto-create memory summaries",STMemoryBooks_AutoSummaryDesc:"Automatically run /nextmemory after a specified number of messages.",STMemoryBooks_AutoSummaryInterval:"Auto-Summary Interval:",STMemoryBooks_AutoSummaryIntervalDesc:"Number of messages after which to automatically create a memory summary.",STMemoryBooks_AutoSummaryBuffer:"Auto-Summary Buffer:",STMemoryBooks_AutoSummaryBufferDesc:"Delay auto-summary by X messages (belated generation). Default 2, max 50.",STMemoryBooks_DefaultInterval:"50",STMemoryBooks_AutoSummaryReadyTitle:"Auto-Summary Ready",STMemoryBooks_AutoSummaryNoAssignedLorebook:"Auto-summary is enabled but there is no assigned lorebook for this chat.",STMemoryBooks_AutoSummarySelectOrPostponeQuestion:"Would you like to select a lorebook for memory storage, or postpone this auto-summary?",STMemoryBooks_PostponeLabel:"Postpone for how many messages?",STMemoryBooks_Postpone10:"10 messages",STMemoryBooks_Postpone20:"20 messages",STMemoryBooks_Postpone30:"30 messages",STMemoryBooks_Postpone40:"40 messages",STMemoryBooks_Postpone50:"50 messages",STMemoryBooks_Button_SelectLorebook:"Select Lorebook",STMemoryBooks_Button_Postpone:"Postpone",STMemoryBooks_Error_NoLorebookSelectedForAutoSummary:"No lorebook selected for auto-summary.",STMemoryBooks_Info_AutoSummaryPostponed:"Auto-summary postponed for {{count}} messages.",STMemoryBooks_Error_NoLorebookForAutoSummary:"No lorebook available for auto-summary.",STMemoryBooks_Error_SelectedLorebookNotFound:'Selected lorebook "{{name}}" not found.',STMemoryBooks_Error_FailedToLoadSelectedLorebook:"Failed to load the selected lorebook.",STMemoryBooks_DefaultMemoryCount:"Default Previous Memories Count:",STMemoryBooks_DefaultMemoryCountDesc:"Default number of previous memories to include as context when creating new memories.",STMemoryBooks_MemoryCount0:"None (0 memories)",STMemoryBooks_MemoryCount1:"Last 1 memory",STMemoryBooks_MemoryCount2:"Last 2 memories",STMemoryBooks_MemoryCount3:"Last 3 memories",STMemoryBooks_MemoryCount4:"Last 4 memories",STMemoryBooks_MemoryCount5:"Last 5 memories",STMemoryBooks_MemoryCount6:"Last 6 memories",STMemoryBooks_MemoryCount7:"Last 7 memories",STMemoryBooks_AutoHideMode:"Auto-hide messages after adding memory:",STMemoryBooks_AutoHideModeDesc:"Choose what messages to automatically hide after creating a memory.",STMemoryBooks_AutoHideNone:"Do not auto-hide",STMemoryBooks_AutoHideAll:"Auto-hide all messages up to the last memory",STMemoryBooks_AutoHideLast:"Auto-hide only messages in the last memory",STMemoryBooks_UnhiddenCount:"Messages to leave unhidden:",STMemoryBooks_UnhiddenCountDesc:"Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)",STMemoryBooks_DefaultUnhidden:"0",STMemoryBooks_TokenWarning:"Token Warning Threshold:",STMemoryBooks_TokenWarningDesc:"Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000",STMemoryBooks_DefaultTokenWarning:"30000",STMemoryBooks_TitleFormat:"Memory Title Format:",STMemoryBooks_CustomTitleFormat:"Custom Title Format...",STMemoryBooks_EnterCustomFormat:"Enter custom format",STMemoryBooks_TitleFormatDesc:"Use [0], [00], [000] for auto-numbering. Available: {{title}}, {{scene}}, {{char}}, {{user}}, {{messages}}, {{profile}}, {{date}}, {{time}}",STMemoryBooks_Profiles:"Memory Profiles:",STMemoryBooks_Profile_CurrentST:"Current SillyTavern Settings",STMemoryBooks_Default:"(Default)",STMemoryBooks_ProfileSettings:"Profile Settings:",STMemoryBooks_Provider:"Provider",STMemoryBooks_Model:"Model",STMemoryBooks_Temperature:"Temperature",STMemoryBooks_ViewPrompt:"View Prompt",STMemoryBooks_ProfileActions:"Profile Actions:",STMemoryBooks_extraFunctionButtons:"Import/Export Profiles:",STMemoryBooks_promptManagerButtons:"Prompt Managers",STMemoryBooks_PromptManagerButtonsHint:"Want to tweak things? Use the buttons below to customize each prompt type.",STMemoryBooks_CreateMemory:"Create Memory",STMemoryBooks_ScenePreview:"Scene Preview:",STMemoryBooks_UsingProfile:"Using Profile",STMemoryBooks_LargeSceneWarning:"Large scene",STMemoryBooks_MayTakeTime:"may take some time to process.",STMemoryBooks_AdvancedOptionsHint:'Click "Advanced Options" to customize prompt, context memories, or API settings.',STMemoryBooks_AdvancedOptions:"Advanced Memory Options",STMemoryBooks_SceneInformation:"Scene Information:",STMemoryBooks_Total:"total",STMemoryBooks_BaseTokens:"Base tokens",STMemoryBooks_TotalTokens:"Total tokens",STMemoryBooks_Profile:"Profile",STMemoryBooks_ChangeProfileDesc:"Change the profile to use different base settings.",STMemoryBooks_MemoryCreationPrompt:"Memory Creation Prompt:",STMemoryBooks_CustomizePromptDesc:"Customize the prompt used to generate this memory.",STMemoryBooks_MemoryPromptPlaceholder:"Memory creation prompt",STMemoryBooks_IncludePreviousMemories:"Include Previous Memories as Context:",STMemoryBooks_PreviousMemoriesDesc:"Previous memories provide context for better continuity.",STMemoryBooks_Found:"Found",STMemoryBooks_ExistingMemorySingular:"existing memory in lorebook.",STMemoryBooks_ExistingMemoriesPlural:"existing memories in lorebook.",STMemoryBooks_NoMemoriesFound:"No existing memories found in lorebook.",STMemoryBooks_APIOverride:"API Override Settings:",STMemoryBooks_CurrentSTSettings:"Current SillyTavern Settings:",STMemoryBooks_API:"API",STMemoryBooks_UseCurrentSettings:"Use current SillyTavern settings instead of profile settings",STMemoryBooks_OverrideDesc:"Override the profile's model and temperature with your current SillyTavern settings.",STMemoryBooks_SaveAsNewProfile:"Save as New Profile:",STMemoryBooks_ProfileName:"Profile Name:",STMemoryBooks_SaveProfileDesc:"Your current settings differ from the selected profile. Save them as a new profile.",STMemoryBooks_EnterProfileName:"Enter new profile name",STMemoryBooks_LargeSceneWarningShort:"⚠️ Large scene may take some time to process.",STMemoryBooks_MemoryPreview:"\uD83D\uDCD6 Memory Preview",STMemoryBooks_MemoryPreviewDesc:"Review the generated memory below. You can edit the content while preserving the structure.",STMemoryBooks_MemoryTitle:"Memory Title:",STMemoryBooks_MemoryTitlePlaceholder:"Memory title",STMemoryBooks_MemoryContent:"Memory Content:",STMemoryBooks_MemoryContentPlaceholder:"Memory content",STMemoryBooks_Keywords:"Keywords:",STMemoryBooks_KeywordsDesc:"Separate keywords with commas",STMemoryBooks_KeywordsPlaceholder:"keyword1, keyword2, keyword3",STMemoryBooks_UnknownProfile:"Unknown Profile",STMemoryBooks_PromptManager_Title:"\uD83E\uDDE9 Summary Prompt Manager",STMemoryBooks_PromptManager_Desc:"Manage your summary generation prompts. All presets are editable.",STMemoryBooks_PromptManager_Search:"Search presets...",STMemoryBooks_PromptManager_DisplayName:"Display Name",STMemoryBooks_PromptManager_DateCreated:"Date Created",STMemoryBooks_PromptManager_New:"➕ New Preset",STMemoryBooks_PromptManager_Edit:"✏️ Edit",STMemoryBooks_PromptManager_Duplicate:"\uD83D\uDCCB Duplicate",STMemoryBooks_PromptManager_Delete:"\uD83D\uDDD1️ Delete",STMemoryBooks_PromptManager_Export:"\uD83D\uDCE4 Export JSON",STMemoryBooks_PromptManager_Import:"\uD83D\uDCE5 Import JSON",STMemoryBooks_PromptManager_ApplyToProfile:"✅ Apply to Selected Profile",STMemoryBooks_PromptManager_NoPresets:"No presets available",STMemoryBooks_Profile_MemoryMethod:"Memory Creation Method:",STMemoryBooks_Profile_PresetSelectDesc:"Choose a preset. Create and edit presets in the Summary Prompt Manager.",STMemoryBooks_CustomPromptManaged:"Custom prompts are now controlled by the Summary Prompt Manager.",STMemoryBooks_OpenPromptManager:"\uD83E\uDDE9 Open Summary Prompt Manager",STMemoryBooks_MoveToPreset:"\uD83D\uDCCC Move Current Custom Prompt to Preset",STMemoryBooks_MoveToPresetConfirmTitle:"Move to Preset",STMemoryBooks_MoveToPresetConfirmDesc:"Create a preset from this profile's custom prompt, set the preset on this profile, and clear the custom prompt?",STMemoryBooks_SidePrompts_Title:"\uD83C\uDFA1 Trackers & Side Prompts",STMemoryBooks_SidePrompts_Desc:"Create and manage side prompts for trackers and other behind-the-scenes functions.",STMemoryBooks_EditSidePrompt:"Edit Side Prompt",STMemoryBooks_ResponseFormatPlaceholder:"Optional response format",STMemoryBooks_PreviousMemoriesHelp:"Number of previous memory entries to include before scene text (0 = none).",STMemoryBooks_Name:"Name",STMemoryBooks_Key:"Key",STMemoryBooks_Enabled:"Enabled",STMemoryBooks_RunOnVisibleMessageInterval:"Run on visible message interval",STMemoryBooks_IntervalVisibleMessages:"Interval (visible messages):",STMemoryBooks_RunAutomaticallyAfterMemory:"Run automatically after memory",STMemoryBooks_AllowManualRunViaSideprompt:"Allow manual run via /sideprompt",STMemoryBooks_Triggers:"Triggers",STMemoryBooks_ResponseFormatOptional:"Response Format (optional)",STMemoryBooks_OrderValue:"Order Value",STMemoryBooks_PreviousMemoriesForContext:"Previous memories for context",STMemoryBooks_Overrides:"Overrides",STMemoryBooks_OverrideDefaultMemoryProfile:"Override default memory profile",STMemoryBooks_ConnectionProfile:"Connection Profile",STMemoryBooks_NewSidePrompt:"New Side Prompt",STMemoryBooks_MySidePromptPlaceholder:"My Side Prompt",STMemoryBooks_Actions:"Actions",STMemoryBooks_None:"None",STMemoryBooks_Edit:"Edit",STMemoryBooks_Duplicate:"Duplicate",STMemoryBooks_NoSidePromptsAvailable:"No side prompts available.",STMemoryBooks_SidePrompts_New:"➕ New",STMemoryBooks_SidePrompts_ExportJSON:"\uD83D\uDCE4 Export JSON",STMemoryBooks_SidePrompts_ImportJSON:"\uD83D\uDCE5 Import JSON",STMemoryBooks_SidePrompts_RecreateBuiltIns:"♻️ Recreate Built-in Side Prompts",STMemoryBooks_SidePrompts_RecreateTitle:"Recreate Built-in Side Prompts",STMemoryBooks_SidePrompts_RecreateWarning:"This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.",STMemoryBooks_SidePrompts_RecreateOk:"Recreate",STMemoryBooks_SidePrompts_RecreateSuccess:"Recreated {{count}} built-in side prompts from current locale",STMemoryBooks_SidePrompts_RecreateFailed:"Failed to recreate built-in side prompts",STMemoryBooks_SidePrompts_MaxConcurrentLabel:"Max concurrent side prompts",STMemoryBooks_SidePrompts_MaxConcurrentHelp:"This controls how many side prompts can be running at one time. Lower this value if you have a slow connection or are running into rate limits. Default: 3",STMemoryBooks_SidePromptCreated:'SidePrompt "{{name}}" created.',STMemoryBooks_FailedToCreateSidePrompt:"Failed to create SidePrompt.",STMemoryBooks_SidePromptDuplicated:'SidePrompt "{{name}}" duplicated.',STMemoryBooks_FailedToDuplicateSidePrompt:"Failed to duplicate SidePrompt.",STMemoryBooks_SidePromptDeleted:'SidePrompt "{{name}}" deleted.',STMemoryBooks_FailedToDeleteSidePrompt:"Failed to delete SidePrompt.",STMemoryBooks_SidePromptsExported:"Side prompts exported.",STMemoryBooks_FailedToExportSidePrompts:"Failed to export side prompts.",STMemoryBooks_ImportedSidePrompts:"Imported {{count}} side prompts.",STMemoryBooks_ImportedSidePromptsDetail:"Imported side prompts: {{added}} added{{detail}}",STMemoryBooks_ImportedSidePromptsRenamedDetail:" ({{count}} renamed due to key conflicts)",STMemoryBooks_FailedToImportSidePrompts:"Failed to import side prompts.",STMemoryBooks_DeleteSidePromptTitle:"Delete Side Prompt",STMemoryBooks_DeleteSidePromptConfirm:'Are you sure you want to delete "{{name}}"?',STMemoryBooks_NameEmptyKeepPrevious:"Name was empty. Keeping previous name.",STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled:'No name provided. Using "Untitled Side Prompt".',STMemoryBooks_MenuItem:"Memory Books",STMemoryBooks_Close:"Close",STMemoryBooks_NoMatches:"No matches",STMemoryBooks_RunSidePrompt:"Run Side Prompt",STMemoryBooks_SearchSidePrompts:"Search side prompts...",STMemoryBooks_Interval:"Interval",STMemoryBooks_AfterMemory:"AfterMemory",STMemoryBooks_Manual:"Manual",STMemoryBooks_AutomaticChatBound:"Automatic (Chat-bound)",STMemoryBooks_UsingChatBoundLorebook:'Using chat-bound lorebook "<strong>{{lorebookName}}</strong>"',STMemoryBooks_NoChatBoundLorebook:"No chat-bound lorebook. Memories will require lorebook selection.",STMemoryBooks_ManualLorebookSetupTitle:"Manual Lorebook Setup",STMemoryBooks_ManualLorebookSetupDesc1:'You have a chat-bound lorebook "<strong>{{name}}</strong>".',STMemoryBooks_ManualLorebookSetupDesc2:"Would you like to use it for manual mode or select a different one?",STMemoryBooks_UseChatBound:"Use Chat-bound",STMemoryBooks_SelectDifferent:"Select Different",STMemoryBooks_SidePromptGuide:'SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',STMemoryBooks_MultipleMatches:'Multiple matches: {{top}}{{more}}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_ClearCustomPromptTitle:"Clear Custom Prompt?",STMemoryBooks_ClearCustomPromptDesc:"This profile has a custom prompt. Clear it so the selected preset is used?",STMemoryBooks_CreateNewPresetTitle:"Create New Preset",STMemoryBooks_DisplayNameTitle:"Display Name:",STMemoryBooks_MyCustomPreset:"My Custom Preset",STMemoryBooks_PromptTitle:"Prompt:",STMemoryBooks_EnterPromptPlaceholder:"Enter your prompt here...",STMemoryBooks_EditPresetTitle:"Edit Preset",STMemoryBooks_DeletePresetTitle:"Delete Preset",STMemoryBooks_DeletePresetConfirm:'Are you sure you want to delete "{{name}}"?',STMemoryBooks_NotSet:"Not Set",STMemoryBooks_ProfileNamePlaceholder:"Profile name",STMemoryBooks_ModelAndTempSettings:"Model & Temperature Settings:",STMemoryBooks_ModelHint:"For model, copy-paste the exact model ID, eg. `gemini-2.5-pro`, `deepseek/deepseek-r1-0528:free`, `gpt-4o-mini-2024-07-18`, etc.",STMemoryBooks_ModelPlaceholder:"Paste model ID here",STMemoryBooks_APIProvider:"API/Provider:",STMemoryBooks_CustomAPI:"Custom API",STMemoryBooks_FullManualConfig:"Full Manual Configuration",STMemoryBooks_TemperatureRange:"Temperature (0.0 - 2.0):",STMemoryBooks_TemperaturePlaceholder:"DO NOT LEAVE BLANK! If unsure put 0.8.",STMemoryBooks_APIEndpointURL:"API Endpoint URL:",STMemoryBooks_APIEndpointPlaceholder:"https://api.example.com/v1/chat/completions",STMemoryBooks_APIKey:"API Key:",STMemoryBooks_APIKeyPlaceholder:"Enter your API key",STMemoryBooks_LorebookEntrySettings:"Lorebook Entry Settings",STMemoryBooks_LorebookEntrySettingsDesc:"These settings control how the generated memory is saved into the lorebook.",STMemoryBooks_OutletName:"Outlet Name",STMemoryBooks_OutletNamePlaceholder:"e.g., ENDING",STMemoryBooks_ActivationMode:"Activation Mode:",STMemoryBooks_ActivationModeDesc:"\uD83D\uDD17 Vectorized is recommended for memories.",STMemoryBooks_Vectorized:"\uD83D\uDD17 Vectorized (Default)",STMemoryBooks_Constant:"\uD83D\uDD35 Constant",STMemoryBooks_Normal:"\uD83D\uDFE2 Normal",STMemoryBooks_InsertionPosition:"Insertion Position:",STMemoryBooks_InsertionPositionDesc:"↑Char is recommended. Aiko recommends memories never go lower than ↑AN.",STMemoryBooks_CharUp:"↑Char",STMemoryBooks_CharDown:"↓Char",STMemoryBooks_ANUp:"↑AN",STMemoryBooks_ANDown:"↓AN",STMemoryBooks_EMUp:"↑EM",STMemoryBooks_EMDown:"↓EM",STMemoryBooks_Outlet:"Outlet",STMemoryBooks_InsertionOrder:"Insertion Order:",STMemoryBooks_AutoOrder:"Auto (uses memory #)",STMemoryBooks_ManualOrder:"Manual",STMemoryBooks_RecursionSettings:"Recursion Settings:",STMemoryBooks_PreventRecursion:"Prevent Recursion",STMemoryBooks_DelayUntilRecursion:"Delay Until Recursion",STMemoryBooks_RefreshPresets:"\uD83D\uDD04 Refresh Presets",STMemoryBooks_Button_CreateMemory:"Create Memory",STMemoryBooks_Button_AdvancedOptions:"Advanced Options...",STMemoryBooks_Button_SaveAsNewProfile:"Save as New Profile",STMemoryBooks_SaveProfileAndCreateMemory:"Save Profile & Create Memory",STMemoryBooks_Tooltip_SaveProfileAndCreateMemory:"Save the modified settings as a new profile and create the memory",STMemoryBooks_Tooltip_CreateMemory:"Create memory using the selected profile settings",STMemoryBooks_EditAndSave:"Edit & Save",STMemoryBooks_RetryGeneration:"Retry Generation",STMemoryBooks_PromptManager_Hint:`\uD83D\uDCA1 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don't change the "respond with JSON" instructions, \uD83D\uDCD5Memory Books uses that to process the returned result from the AI.`,STMemoryBooks_ExpandEditor:"Expand the editor",STMemoryBooks_ClearAndApply:"Clear and Apply",STMemoryBooks_Cancel:"Cancel",STMemoryBooks_Create:"Create",STMemoryBooks_Save:"Save",STMemoryBooks_Delete:"Delete",STMemoryBooks_Toast_ProfileSaved:'Profile "{{name}}" saved successfully',STMemoryBooks_Toast_ProfileSaveFailed:"Failed to save profile: {{message}}",STMemoryBooks_Toast_ProfileNameOrProceed:'Please enter a profile name or use "Create Memory" to proceed without saving',STMemoryBooks_Toast_ProfileNameRequired:"Please enter a profile name",STMemoryBooks_Toast_UnableToReadEditedValues:"Unable to read edited values",STMemoryBooks_Toast_UnableToFindInputFields:"Unable to find input fields",STMemoryBooks_Toast_TitleCannotBeEmpty:"Memory title cannot be empty",STMemoryBooks_Toast_ContentCannotBeEmpty:"Memory content cannot be empty",STMemoryBooks_Toast_NoMemoryLorebookAssigned:"No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.",STMemoryBooks_Error_NoMemoryLorebookAssigned:"No memory lorebook assigned",STMemoryBooks_Error_FailedToLoadLorebook:"Failed to load lorebook",STMemoryBooks_Toast_FailedToLoadLorebook:"Failed to load the selected lorebook.",STMemoryBooks_Toast_SidePromptFailed:'SidePrompt "{{name}}" failed: {{message}}',STMemoryBooks_Toast_FailedToUpdateSidePrompt:'Failed to update sideprompt entry "{{name}}"',STMemoryBooks_Toast_FailedToSaveWave:"Failed to save SidePrompt updates for this wave",STMemoryBooks_Toast_SidePromptsSucceeded:"Side Prompts after memory: {{okCount}} succeeded. {{succeeded}}",STMemoryBooks_Toast_SidePromptsPartiallyFailed:"Side Prompts after memory: {{okCount}} succeeded, {{failCount}} failed. {{failed}}",STMemoryBooks_Toast_SidePromptNameNotProvided:'SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_Toast_SceneClearedStart:"Scene cleared due to start marker deletion",STMemoryBooks_Toast_SceneEndPointCleared:"Scene end point cleared due to message deletion",STMemoryBooks_Toast_SceneMarkersAdjusted:"Scene markers adjusted due to message deletion.",STMemoryBooks_MarkSceneStart:"Mark Scene Start",STMemoryBooks_MarkSceneEnd:"Mark Scene End",STMemoryBooks_CreateMemoryBtn:"Create Memory",STMemoryBooks_ClearSceneBtn:"Clear Scene",STMemoryBooks_NoSceneSelected:"No scene selected. Make sure both start and end points are set.",STMemoryBooks_NoSceneMarkersToastr:"No scene markers set. Use chevron buttons to mark start and end points first.",STMemoryBooks_MissingRangeArgument:"Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_InvalidFormat:"Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_InvalidMessageIDs:"Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_StartGreaterThanEnd:"Start message cannot be greater than end message",STMemoryBooks_MessageIDsOutOfRange:"Message IDs out of range.",STMemoryBooks_MessagesDoNotExist:"One or more specified messages do not exist",STMemoryBooks_SceneSet:"Scene set.",STMemoryBooks_MemoryAlreadyInProgress:"Memory creation is already in progress",STMemoryBooks_NoLorebookAvailable:"No lorebook available.",STMemoryBooks_NoMessagesToSummarize:"There are no messages to summarize yet.",STMemoryBooks_NoNewMessagesSinceLastMemory:"No new messages since the last memory.",STMemoryBooks_NextMemoryFailed:"Failed to run /nextmemory.",STMemoryBooks_OnlyNOfRequestedMemoriesAvailable:"Only some of the requested memories are available",STMemoryBooks_NoPreviousMemoriesFound:"No previous memories found in lorebook",STMemoryBooks_WorkingToast:"Creating memory...",STMemoryBooks_MaximumRetryAttemptsReached:"Maximum retry attempts reached",STMemoryBooks_RetryingMemoryGeneration:"Retrying memory generation...",STMemoryBooks_UnableToRetrieveEditedMemoryData:"Unable to retrieve edited memory data",STMemoryBooks_EditedMemoryDataIncomplete:"Edited memory data is incomplete",STMemoryBooks_MemoryCreatedSuccessfully:"Memory created successfully!",STMemoryBooks_MemoryCreationFailedWillRetry:"Memory creation failed. Retrying...",STMemoryBooks_SceneTooLarge:"Scene is too large. Try selecting a smaller range.",STMemoryBooks_AIFailedToGenerateValidMemory:"AI failed to generate valid memory.",STMemoryBooks_ProfileConfigurationError:"Profile configuration error.",STMemoryBooks_FailedToCreateMemory:"Failed to create memory.",STMemoryBooks_LoadingCharacterData:"SillyTavern is still loading character data, please wait a few seconds and try again.",STMemoryBooks_GroupChatDataUnavailable:"Group chat data not available, please wait a few seconds and try again.",STMemoryBooks_LorebookValidationError:"Lorebook validation error",STMemoryBooks_SceneOverlap:"Scene overlaps with existing memory.",STMemoryBooks_UnexpectedError:"An unexpected error occurred.",STMemoryBooks_ChangeManualLorebook:"Change",STMemoryBooks_SelectManualLorebook:"Select",STMemoryBooks_ManualLorebook:"Manual Lorebook",STMemoryBooks_FailedToSelectManualLorebook:"Failed to select manual lorebook",STMemoryBooks_ClearManualLorebook:"Clear Manual Lorebook",STMemoryBooks_ManualLorebookCleared:"Manual lorebook cleared",STMemoryBooks_FailedToClearManualLorebook:"Failed to clear manual lorebook",STMemoryBooks_SetAsDefault:"Set as Default",STMemoryBooks_SetAsDefaultProfileSuccess:'"{{name}}" is now the default profile.',STMemoryBooks_EditProfile:"Edit Profile",STMemoryBooks_FailedToEditProfile:"Failed to edit profile",STMemoryBooks_NewProfile:"New Profile",STMemoryBooks_FailedToCreateProfile:"Failed to create profile",STMemoryBooks_DeleteProfile:"Delete Profile",STMemoryBooks_FailedToDeleteProfile:"Failed to delete profile",STMemoryBooks_ExportProfiles:"Export Profiles",STMemoryBooks_FailedToExportProfiles:"Failed to export profiles",STMemoryBooks_ImportProfiles:"Import Profiles",STMemoryBooks_SummaryPromptManager:"Summary Prompt Manager",STMemoryBooks_FailedToOpenSummaryPromptManager:"Failed to open Summary Prompt Manager",STMemoryBooks_SidePrompts:"Side Prompts",STMemoryBooks_FailedToOpenSidePrompts:"Failed to open Side Prompts",STMemoryBooks_SelectPresetFirst:"Select a preset first",STMemoryBooks_NoProfilesAvailable:"No profiles available",STMemoryBooks_SelectedProfileNotFound:"Selected profile not found",STMemoryBooks_PresetAppliedToProfile:"Preset applied to profile",STMemoryBooks_PromptCannotBeEmpty:"Prompt cannot be empty",STMemoryBooks_PresetCreatedSuccessfully:"Preset created successfully",STMemoryBooks_FailedToCreatePreset:"Failed to create preset",STMemoryBooks_PresetUpdatedSuccessfully:"Preset updated successfully",STMemoryBooks_FailedToEditPreset:"Failed to edit preset",STMemoryBooks_PresetDuplicatedSuccessfully:"Preset duplicated successfully",STMemoryBooks_FailedToDuplicatePreset:"Failed to duplicate preset",STMemoryBooks_PresetDeletedSuccessfully:"Preset deleted successfully",STMemoryBooks_PromptsExportedSuccessfully:"Prompts exported successfully",STMemoryBooks_PromptsImportedSuccessfully:"Prompts imported successfully",STMemoryBooks_FailedToImportPrompts:"Failed to import prompts.",STMemoryBooks_CreateMemoryButton:"Create Memory",STMemoryBooks_NoSceneSelectedMakeSure:"No scene selected. Make sure both start and end points are set.",STMemoryBooks_ClearSceneButton:"Clear Scene",STMemoryBooks_FailedToImportProfiles:"Failed to import profiles",STMemoryBooks_ManualLorebookSet:'Manual lorebook set to "{{name}}"',STMemoryBooks_PleaseSelectLorebookForManualMode:"Please select a lorebook for manual mode",STMemoryBooks_FailedToSaveSettings:"Failed to save settings. Please try again.",STMemoryBooks_FailedToInitializeChatMonitoring:"STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.",STMemoryBooks_Label_CurrentSTModel:"Current SillyTavern model",STMemoryBooks_Label_CurrentSTTemperature:"Current SillyTavern temperature",STMemoryBooks_Label_TotalTokens:"Total tokens: {{count}}",STMemoryBooks_Label_TotalTokensCalculating:"Total tokens: Calculating...",STMemoryBooks_Warn_LargeSceneTokens:"⚠️ Large scene ({{tokens}} tokens) may take some time to process.",STMemoryBooks_ModifiedProfileName:"{{name}} - Modified",STMemoryBooks_ProfileEditTitle:"Edit Profile",STMemoryBooks_CancelClose:"Cancel/Close",STMemoryBooks_InvalidProfileData:"Invalid profile data",STMemoryBooks_ProfileUpdatedSuccess:"Profile updated successfully",STMemoryBooks_NewProfileTitle:"New Profile",STMemoryBooks_ProfileCreatedSuccess:"Profile created successfully",STMemoryBooks_DeleteProfileConfirm:'Delete profile "{{name}}"?',STMemoryBooks_CannotDeleteLastProfile:"Cannot delete the last profile",STMemoryBooks_CannotDeleteDefaultProfile:'Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',STMemoryBooks_ProfileDeletedSuccess:"Profile deleted successfully",STMemoryBooks_ProfilesExportedSuccess:"Profiles exported successfully",STMemoryBooks_ImportErrorInvalidFormat:"Invalid profile data format - missing profiles array",STMemoryBooks_ImportErrorNoValidProfiles:"No valid profiles found in import file",STMemoryBooks_ImportSuccess:"Imported {{importedCount}} profile{{plural}}",STMemoryBooks_ImportSkipped:" ({{skippedCount}} duplicate{{plural}} skipped)",STMemoryBooks_ImportComplete:"STMemoryBooks profile import completed",STMemoryBooks_ImportNoNewProfiles:"No new profiles imported - all profiles already exist",STMemoryBooks_ImportFailed:"Failed to import profiles: {{message}}",STMemoryBooks_ImportReadError:"Failed to read import file",STMemoryBooks_PromptManagerNotFound:"Prompt Manager button not found. Open main settings and try again.",STMemoryBooks_PresetListRefreshed:"Preset list refreshed",STMemoryBooks_FailedToRefreshPresets:"Failed to refresh presets",STMemoryBooks_NoCustomPromptToMigrate:"No custom prompt to migrate",STMemoryBooks_CustomPromptMigrated:"Preset created and selected. Remember to Save.",STMemoryBooks_FailedToMigrateCustomPrompt:"Failed to move custom prompt to preset",STMemoryBooks_Toast_SidePromptUpdated:'SidePrompt "{{name}}" updated.',STMemoryBooks_Toast_SidePromptNotFound:"SidePrompt template not found. Check name.",STMemoryBooks_Toast_ManualRunDisabled:'Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',STMemoryBooks_Toast_NoMessagesAvailable:"No messages available.",STMemoryBooks_Toast_InvalidRangeFormat:"Invalid range format. Use X-Y",STMemoryBooks_Toast_InvalidMessageRange:"Invalid message range for /sideprompt",STMemoryBooks_Toast_FailedToCompileRange:"Failed to compile the specified range",STMemoryBooks_Toast_SidePromptRangeTip:'Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',STMemoryBooks_Toast_FailedToCompileMessages:"Failed to compile messages for /sideprompt",STMemoryBooks_Plotpoints:"Plotpoints",STMemoryBooks_PlotpointsPrompt:"Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.",STMemoryBooks_Status:"Status",STMemoryBooks_StatusPrompt:"Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.",STMemoryBooks_CastOfCharacters:"Cast of Characters",STMemoryBooks_CastOfCharactersPrompt:`You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. 
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
===`,STMemoryBooks_FailedToSaveSidePrompts:"Failed to save side prompts: {{status}} {{statusText}}",STMemoryBooks_SidePromptsSaved:"Side prompts saved successfully",STMemoryBooks_MigratingSidePrompts:"Migrating side prompts file from V1(type) to V2(triggers)",STMemoryBooks_InvalidSidePromptsFile:"Invalid side prompts file structure; recreating with built-ins",STMemoryBooks_ErrorLoadingSidePrompts:"Error loading side prompts; creating base doc",STMemoryBooks_UntitledSidePrompt:"Untitled Side Prompt",STMemoryBooks_TemplateNotFound:'Template "{{key}}" not found',STMemoryBooks_CopyOfTemplate:"{{name}} (Copy)",STMemoryBooks_InvalidSidePromptsJSON:"Invalid side prompts file structure",STMemoryBooks_ConverterTitle:"STMemoryBooks Lorebook Converter (v3)",STMemoryBooks_ConverterHeader:"Lorebook Converter",STMemoryBooks_ConverterDescription:'This tool flags entries by adding `stmemorybooks: true`. An entry is converted only if it matches the title format, is <strong>not</strong> set to `"vectorized": false`, and has its `"position"` set to `0`.',STMemoryBooks_ConverterSampleTitleLabel:"Sample Title Format (Optional)",STMemoryBooks_ConverterSampleTitlePlaceholder:"e.g., 01 - My First Memory",STMemoryBooks_ConverterSampleTitleDescription:'The tool will find the first number and use it to create a pattern. If blank, it defaults to matching titles like "01 - title".',STMemoryBooks_ConverterFileUploadLabel:"Click or Drag to Upload Lorebook File",STMemoryBooks_ConverterIncludeVectorizedLabel:"Include \uD83D\uDD35 entries",STMemoryBooks_ConverterIncludeVectorizedDescription:"If enabled, entries with `vectorized: false` will also be included as memories.",STMemoryBooks_ConverterConvertButton:"Convert File",STMemoryBooks_ConverterConversionComplete:"Conversion complete!",STMemoryBooks_ConverterDownloadLink:"Download {{filename}}",STMemoryBooks_ConverterErrorProcessingFile:"Error processing file. Please ensure it is a valid JSON lorebook. Error: {{message}}",STMemoryBooks_ConverterInvalidLorebookStructure:"Invalid lorebook structure: 'entries' object not found.",STMemoryBooks_ConverterUsingDefaultRegex:"Using default: {{regex}}",STMemoryBooks_ConverterConversionStats:"Conversion complete. Checked {{totalEntries}} entries and flagged {{memoriesConverted}} as memories.","addlore.errors.invalidContent":"Invalid memory result: missing content","addlore.errors.invalidLorebookValidation":"Invalid lorebook validation data","addlore.errors.createEntryFailed":"Failed to create new lorebook entry","addlore.toast.added":'Memory "{{entryTitle}}" added to "{{lorebookName}}"',"addlore.toast.addFailed":"Failed to add memory: {{message}}","addlore.toast.autohideInvalidRange":"Auto-hide skipped: invalid scene range metadata","addlore.toast.title":"STMemoryBooks","addlore.result.added":'Memory successfully added to "{{lorebookName}}"',"addlore.result.addFailed":"Failed to add memory to lorebook: {{message}}","addlore.defaults.title":"Memory","addlore.defaults.scene":"Scene {{range}}","addlore.defaults.user":"User","addlore.sanitize.fallback":"Auto Memory","addlore.preview.error":"Error: {{message}}","addlore.preview.sampleTitle":"Sample Memory Title","addlore.preview.sampleProfile":"Summary","addlore.stats.errors.noBinding":"No lorebook bound to chat","addlore.stats.errors.loadFailed":"Failed to load lorebook","addlore.titleFormat.errors.nonEmpty":"Title format must be a non-empty string","addlore.titleFormat.warnings.sanitization":"Title contains characters that will be removed during sanitization","addlore.titleFormat.warnings.unknownPlaceholders":"Unknown placeholders: {{placeholders}}","addlore.titleFormat.warnings.invalidNumbering":"Invalid numbering patterns: {{patterns}}. Use [0], [00], [000], (0), {0}, #0 etc.","addlore.titleFormat.warnings.tooLong":"Title format is very long and may be truncated","addlore.upsert.errors.invalidArgs":"Invalid arguments to upsertLorebookEntryByTitle","addlore.upsert.errors.createFailed":"Failed to create lorebook entry","addlore.titleFormats.0":"[000] - {{title}} ({{profile}})","addlore.titleFormats.1":"{{date}} [000] \uD83C\uDFAC{{title}}, {{messages}} msgs","addlore.titleFormats.2":"[000] {{date}} - {{char}} Memory","addlore.titleFormats.3":"[00] - {{user}} & {{char}} {{scene}}","addlore.titleFormats.4":"\uD83E\uDDE0 [000] ({{messages}} msgs)","addlore.titleFormats.5":"\uD83D\uDCDA Memory #[000] - {{profile}} {{date}} {{time}}","addlore.titleFormats.6":"[000] - {{scene}}: {{title}}","addlore.titleFormats.7":"[000] - {{title}} ({{scene}})","addlore.titleFormats.8":"[000] - {{title}}","addlore.log.executingHideCommand":"STMemoryBooks-AddLore: Executing hide command{{context}}: {{hideCommand}}","addlore.warn.autohideSkippedInvalidRange":'STMemoryBooks-AddLore: Auto-hide skipped - invalid scene range: "{{range}}"',"addlore.hideCommand.allComplete":"all mode - complete","addlore.hideCommand.allPartial":"all mode - partial","addlore.hideCommand.lastHideAll":"last mode - hide all","addlore.hideCommand.lastPartial":"last mode - partial","addlore.log.addFailed":"STMemoryBooks-AddLore: Failed to add memory to lorebook:","addlore.log.getStatsError":"STMemoryBooks-AddLore: Error getting lorebook stats:","addlore.log.updateHighestCalled":"STMemoryBooks-AddLore: updateHighestMemoryProcessed called with:","addlore.log.sceneRangeExtracted":"STMemoryBooks-AddLore: sceneRange extracted:","addlore.warn.noSceneRange":"STMemoryBooks-AddLore: No scene range found in memory result, cannot update highest processed","addlore.warn.invalidSceneRangeFormat":"STMemoryBooks-AddLore: Invalid scene range format: {{range}}","addlore.warn.invalidEndMessage":"STMemoryBooks-AddLore: Invalid end message number: {{end}}","addlore.warn.noSceneMarkers":"STMemoryBooks-AddLore: Could not get scene markers to update highest processed","addlore.log.setHighest":"STMemoryBooks-AddLore: Set highest memory processed to message {{endMessage}}","addlore.log.updateHighestError":"STMemoryBooks-AddLore: Error updating highest memory processed:","autocreate.log.creating":'STMemoryBooks-AutoCreate: Auto-creating lorebook "{{name}}" for {{context}}',"autocreate.log.created":'STMemoryBooks-AutoCreate: Successfully created and bound lorebook "{{name}}"',"autocreate.log.createFailed":"STMemoryBooks-AutoCreate: Failed to create lorebook","autocreate.log.createError":"STMemoryBooks-AutoCreate: Error creating lorebook:","autosummary.log.postponed":"STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})","autosummary.log.skippedInProgress":"STMemoryBooks: Auto-summary skipped - memory creation in progress","autosummary.log.noPrevious":"STMemoryBooks: No previous memories found - counting from start","autosummary.log.sinceLast":"STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}","autosummary.log.triggerCheck":"STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?","autosummary.log.notTriggered":"STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages","autosummary.log.postponedUntil":"STMemoryBooks: Auto-summary postponed until message {{until}}","autosummary.log.blocked":"STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}","autosummary.log.clearedPostpone":"STMemoryBooks: Cleared auto-summary postpone flag","autosummary.log.triggered":"STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}","autosummary.log.triggerError":"STMemoryBooks: Error in auto-summary trigger check:","autosummary.log.messageReceivedSingle":"STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}","autosummary.log.messageReceivedGroup":"STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED","autosummary.log.messageHandlerError":"STMemoryBooks: Error in auto-summary message received handler:","autosummary.log.groupFinished":"STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}","autosummary.log.groupHandlerError":"STMemoryBooks: Error in auto-summary group finished handler:","autocreate.toast.title":"STMemoryBooks","autocreate.toast.createdBound":'Created and bound lorebook "{{name}}"',"autocreate.errors.failedAutoCreate":"Failed to auto-create lorebook.","autocreate.errors.failedAutoCreateWithMessage":"Failed to auto-create lorebook: {{message}}","common.unknown":"Unknown",STMemoryBooks_ArcAnalysis_EmptyResponse:"Empty AI response",STMemoryBooks_ArcAnalysis_InvalidJSON:"Model did not return valid arc JSON",STMemoryBooks_ArcAnalysis_MissingLorebookData:"Missing lorebookName or lorebookData",STMemoryBooks_ArcAnalysis_UpsertFailed:"Arc upsert returned no entry (commitArcs failed)",STMemoryBooks_ArcPromptManager_SaveFailed:"Failed to save arc prompts",STMemoryBooks_ArcPrompt_Default:`You are an expert narrative analyst and memory-engine assistant.
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

Return ONLY the JSON, no other text.`,STMemoryBooks_DisplayName_summary:"Summary - Detailed beat-by-beat summaries in narrative prose",STMemoryBooks_DisplayName_summarize:"Summarize - Bullet-point format",STMemoryBooks_DisplayName_synopsis:"Synopsis - Long and comprehensive (beats, interactions, details) with headings",STMemoryBooks_DisplayName_sumup:"Sum Up - Concise story beats in narrative prose",STMemoryBooks_DisplayName_minimal:"Minimal - Brief 1-2 sentence summary",STMemoryBooks_DisplayName_northgate:"Northgate - Intended for creative writing. By Northgate on ST Discord",STMemoryBooks_DisplayName_aelemar:"Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord",STMemoryBooks_DisplayName_comprehensive:"Comprehensive - Synopsis plus improved keywords extraction",STMemoryBooks_PromptManager_RecreateBuiltins:"♻️ Recreate Built-in Prompts",STMemoryBooks_RecreateBuiltinsTitle:"Recreate Built-in Prompts",STMemoryBooks_RecreateBuiltinsWarning:"This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom:"This does not affect your other custom presets.",STMemoryBooks_RecreateBuiltinsOverwrite:"Overwrite",STMemoryBooks_RegexSelection_Title:"\uD83D\uDCD0 Regex selection",STMemoryBooks_RegexSelection_Desc:"Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.",STMemoryBooks_RegexSelection_Outgoing:"Run regex before sending to AI",STMemoryBooks_RegexSelection_Incoming:"Run regex before adding to lorebook (before previews)",STMemoryBooks_RegexSelect_PlaceholderOutgoing:"Select outgoing regex…",STMemoryBooks_RegexSelect_PlaceholderIncoming:"Select incoming regex…",STMemoryBooks_RegexSelectionsSaved:"Regex selections saved",STMemoryBooks_FailedToSaveRegexSelections:"Failed to save regex selections",STMemoryBooks_UseRegexAdvanced:"Use regex (advanced)",STMemoryBooks_ConfigureRegex:"\uD83D\uDCD0 Configure regex…"},E0={en:EG};import{getRegexScripts as W7}from"../../../extensions/regex/engine.js";import"../../../../lib/select2.min.js";async function q7(Z){try{if(Z?.prompt&&String(Z.prompt).trim())return Z.prompt;if(Z?.preset)return await e1(Z.preset)}catch(Q){console.warn(U("STMemoryBooks: getEffectivePromptAsync fallback due to error:","index.warn.getEffectivePromptAsync"),Q)}return k1()}function i4(){return E1}var V1="STMemoryBooks",a5=!1;var Y7={moduleSettings:{alwaysUseDefault:!0,showMemoryPreviews:!1,showNotifications:!0,unhideBeforeMemory:!1,refreshEditor:!0,tokenWarningThreshold:30000,defaultMemoryCount:0,autoClearSceneAfterMemory:!1,manualModeEnabled:!1,allowSceneOverlap:!1,autoHideMode:"all",unhiddenEntriesCount:2,autoSummaryEnabled:!1,autoSummaryInterval:50,autoSummaryBuffer:2,autoCreateLorebook:!1,lorebookNameTemplate:"LTM - {{char}} - {{chat}}",useRegex:!1,selectedRegexOutgoing:[],selectedRegexIncoming:[]},titleFormat:"[000] - {{title}}",profiles:[],defaultProfile:0,migrationVersion:4},d=null,E1=!1,O6=null,t5=!1,R6=null,X8=null;var K0=null,S8=null;function cG(Z){let Q=[];if(Z.matches&&Z.matches("#chat .mes[mesid]")){if(!Z.querySelector(".mes_stmb_start"))u8(Z),Q.push(Z)}else if(Z.querySelectorAll)Z.querySelectorAll("#chat .mes[mesid]").forEach((J)=>{if(!J.querySelector(".mes_stmb_start"))u8(J),Q.push(J)});return Q}function pG(){if(K0)K0.disconnect(),K0=null;let Z=document.getElementById("chat");if(!Z)throw Error(U("STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.","index.error.chatContainerNotFound"));let Q=oZ();if(!Q||Q.start===null&&Q.end===null)m8();K0=new MutationObserver((G)=>{let J=[];for(let W of G)for(let q of W.addedNodes)if(q.nodeType===Node.ELEMENT_NODE)try{let Y=cG(q);J.push(...Y)}catch(Y){console.error(U("STMemoryBooks: Error processing new chat elements:","index.error.processingChatElements"),Y)}if(J.length>0)clearTimeout(S8),S8=setTimeout(()=>{try{iZ(J)}catch(W){console.error(U("STMemoryBooks: Error updating button states:","index.error.updatingButtonStates"),W)}},w6.CHAT_OBSERVER_DEBOUNCE_MS)}),K0.observe(Z,{childList:!0,subtree:!0}),console.log(U("STMemoryBooks: Chat observer initialized","index.log.chatObserverInitialized"))}function iG(){if(K0)K0.disconnect(),K0=null,console.log(U("STMemoryBooks: Chat observer disconnected","index.log.chatObserverDisconnected"));if(S8)clearTimeout(S8),S8=null}function lG(){console.log(U("STMemoryBooks: Chat changed - updating scene state","index.log.chatChanged")),m8(),z7(),setTimeout(()=>{try{j7()}catch(Z){console.error(U("STMemoryBooks: Error processing messages after chat change:","index.error.processingMessagesAfterChange"),Z)}},w6.CHAT_OBSERVER_DEBOUNCE_MS)}function z7(){let Z=m()||{},{sceneStart:Q,sceneEnd:G}=Z;if(Q!==null||G!==null){if(console.log(S`Found orphaned scene markers: start=${Q}, end=${G}`),!E1&&o[V1].moduleSettings.autoSummaryEnabled)d0()}}async function oG(){try{setTimeout(u0,M1.VALIDATION_DELAY_MS),await d4(),await _Z()}catch(Z){console.error(U("STMemoryBooks: Error in handleMessageReceived:","index.error.handleMessageReceived"),Z)}}async function nG(){try{setTimeout(u0,M1.VALIDATION_DELAY_MS),await c4(),await _Z()}catch(Z){console.error(U("STMemoryBooks: Error in handleGroupWrapperFinished:","index.error.handleGroupWrapperFinished"),Z)}}async function sG(Z,Q){if(!await B8())return console.error(U("STMemoryBooks: No scene markers set for createMemory command","index.error.noSceneMarkersForCreate")),toastr.error(U("No scene markers set. Use chevron buttons to mark start and end points first.","STMemoryBooks_NoSceneMarkersToastr"),U("STMemoryBooks","index.toast.title")),"";return D6(),""}async function rG(Z,Q){let G=String(Q||"").trim();if(!G)return toastr.error(U("Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_MissingRangeArgument"),U("STMemoryBooks","index.toast.title")),"";let J=G.match(/^(\d+)\s*[-–—]\s*(\d+)$/);if(!J)return toastr.error(U("Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_InvalidFormat"),U("STMemoryBooks","index.toast.title")),"";let W=Number(J[1]),q=Number(J[2]);if(!Number.isFinite(W)||!Number.isFinite(q))return toastr.error(U("Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_InvalidMessageIDs"),U("STMemoryBooks","index.toast.title")),"";if(W>q)return toastr.error(U("Start message cannot be greater than end message","STMemoryBooks_StartGreaterThanEnd"),U("STMemoryBooks","index.toast.title")),"";let Y=$7;if(W<0||q>=Y.length)return toastr.error(S`Message IDs out of range. Valid range: 0-${Y.length-1}`,U("STMemoryBooks","index.toast.title")),"";if(!Y[W]||!Y[q])return toastr.error(U("One or more specified messages do not exist","STMemoryBooks_MessagesDoNotExist"),U("STMemoryBooks","index.toast.title")),"";C6(W,q);let z=B0(),V=z.isGroupChat?` in group "${z.groupName}"`:"";return toastr.info(S`Scene set: messages ${W}-${q}${V}`,U("STMemoryBooks","index.toast.title")),D6(),""}async function aG(Z,Q){try{if(E1)return toastr.info(U("Memory creation is already in progress","STMemoryBooks_MemoryAlreadyInProgress"),U("STMemoryBooks","index.toast.title")),"";let G=await kZ();if(!G.valid)return toastr.error(U("No lorebook available: "+G.error,"STMemoryBooks_NoLorebookAvailable"),U("STMemoryBooks","index.toast.title")),"";let J=m()||{},W=$7.length-1;if(W<0)return toastr.info(U("There are no messages to summarize yet.","STMemoryBooks_NoMessagesToSummarize"),U("STMemoryBooks","index.toast.title")),"";let q=typeof J.highestMemoryProcessed==="number"?J.highestMemoryProcessed:null,Y=q===null?0:q+1,z=W;if(Y>z)return toastr.info(U("No new messages since the last memory.","STMemoryBooks_NoNewMessagesSinceLastMemory"),U("STMemoryBooks","index.toast.title")),"";C6(Y,z),await D6()}catch(G){console.error(U("STMemoryBooks: /nextmemory failed:","index.error.nextMemoryFailed"),G),toastr.error(U("Failed to run /nextmemory: "+G.message,"STMemoryBooks_NextMemoryFailed"),U("STMemoryBooks","index.toast.title"))}return""}async function tG(Z,Q){let G=String(Q||"").trim();if(!G)return toastr.info(U('SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',"STMemoryBooks_SidePromptGuide"),U("STMemoryBooks","index.toast.title")),"";let J=G.match(/^["']([^"']+)["']\s*(.*)$/)||G.match(/^(.+?)(\s+\d+\s*[-–—]\s*\d+)?$/),W=J?(J[1]||G).trim():G;try{let Y=(await q0()).filter((z)=>z.name.toLowerCase().includes(W.toLowerCase()));if(Y.length>1){let z=Y.slice(0,5).map((X)=>X.name).join(", "),V=Y.length>5?`, +${Y.length-5} more`:"";return toastr.info(S`Multiple matches: ${z}${V}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]`,U("STMemoryBooks","index.toast.title")),""}return IZ(G)}catch{return IZ(G)}}async function X7(Z,Q,G){let J=String(Q||"").trim();if(!J)return toastr.error(U(G?'Missing name. Use: /sideprompt-on "Name" OR /sideprompt-on all':'Missing name. Use: /sideprompt-off "Name" OR /sideprompt-off all',"STMemoryBooks_SidePromptToggle_MissingName"),U("STMemoryBooks","index.toast.title")),"";try{let{findTemplateByName:W,upsertTemplate:q,listTemplates:Y}=await Promise.resolve().then(() => (w8(),U5));if(J.toLowerCase()==="all"){let V=await Y(),X=0;for(let j of V)if(j.enabled!==G)await q({key:j.key,enabled:G}),X++;try{window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"))}catch(j){}return toastr.success(S`${G?"Enabled":"Disabled"} ${X} side prompt${X===1?"":"s"}`,U("STMemoryBooks","index.toast.title")),""}let z=await W(J);if(!z)return toastr.error(S`Side Prompt not found: ${J}`,U("STMemoryBooks","index.toast.title")),"";if(z.enabled===G)return toastr.info(S`"${z.name}" is already ${G?"enabled":"disabled"}`,U("STMemoryBooks","index.toast.title")),"";await q({key:z.key,enabled:G});try{window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"))}catch(V){}toastr.success(S`${G?"Enabled":"Disabled"} "${z.name}"`,U("STMemoryBooks","index.toast.title"))}catch(W){console.error("STMemoryBooks: sideprompt enable/disable failed:",W),toastr.error(S`Failed to toggle side prompt: ${W.message}`,U("STMemoryBooks","index.toast.title"))}return""}async function eG(Z,Q){return X7(Z,Q,!0)}async function ZJ(Z,Q){return X7(Z,Q,!1)}var V7=[];async function fZ(){try{V7=(await q0()||[]).filter((Q)=>{let G=Q?.triggers?.commands;if(!("commands"in(Q?.triggers||{})))return!0;return Array.isArray(G)&&G.some((J)=>String(J).toLowerCase()==="sideprompt")}).map((Q)=>Q.name)}catch(Z){console.warn(U("STMemoryBooks: side prompt cache refresh failed","index.warn.sidePromptCacheRefreshFailed"),Z)}}window.addEventListener("stmb-sideprompts-updated",fZ);try{fZ()}catch(Z){}var EZ=()=>V7.map((Z)=>new bZ(Z));function T1(){if(o.STMemoryBooks=o.STMemoryBooks||r0(Y7),(o.STMemoryBooks.migrationVersion||1)<4){if(!o.STMemoryBooks.profiles?.some((W)=>W.useDynamicSTSettings||W?.connection?.api==="current_st")){if(!o.STMemoryBooks.profiles)o.STMemoryBooks.profiles=[];let W={name:"Current SillyTavern Settings",connection:{api:"current_st"},preset:"summary",constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0};if(o.STMemoryBooks.profiles.unshift(W),o.STMemoryBooks.defaultProfile!==void 0)o.STMemoryBooks.defaultProfile+=1;console.log(S`${V1}: Added dynamic profile for existing installation (migration to v3)`)}o.STMemoryBooks.profiles.forEach((W)=>{if(W.useDynamicSTSettings&&W.titleFormat)delete W.titleFormat,console.log(S`${V1}: Removed static titleFormat from dynamic profile`)}),o.STMemoryBooks.migrationVersion=4,n()}if(!o.STMemoryBooks.profiles||o.STMemoryBooks.profiles.length===0){let J={name:"Current SillyTavern Settings",connection:{api:"current_st"},preset:"summary",constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0};o.STMemoryBooks.profiles=[J],console.log(S`${V1}: Created dynamic profile for fresh installation`)}let Q=QJ(o.STMemoryBooks),G=JZ(o.STMemoryBooks);if(G.fixes.length>0)console.log(S`${V1}: Applied profile fixes:`,G.fixes),n();return Q}function QJ(Z){if(!Z.profiles||Z.profiles.length===0)Z.profiles=[],Z.defaultProfile=0;if(Z.defaultProfile>=Z.profiles.length)Z.defaultProfile=0;if(!Z.moduleSettings)Z.moduleSettings=r0(Y7.moduleSettings);if(!Z.moduleSettings.tokenWarningThreshold||Z.moduleSettings.tokenWarningThreshold<1000)Z.moduleSettings.tokenWarningThreshold=30000;if(Z.moduleSettings.defaultMemoryCount===void 0||Z.moduleSettings.defaultMemoryCount<0)Z.moduleSettings.defaultMemoryCount=0;if(Z.moduleSettings.autoSummaryEnabled===void 0)Z.moduleSettings.autoSummaryEnabled=!1;if(Z.moduleSettings.autoSummaryInterval===void 0||Z.moduleSettings.autoSummaryInterval<10)Z.moduleSettings.autoSummaryInterval=100;if(Z.moduleSettings.autoSummaryBuffer===void 0||Z.moduleSettings.autoSummaryBuffer<0)Z.moduleSettings.autoSummaryBuffer=0;if(Z.moduleSettings.autoSummaryBuffer>50)Z.moduleSettings.autoSummaryBuffer=50;if(Z.moduleSettings.autoCreateLorebook===void 0)Z.moduleSettings.autoCreateLorebook=!1;if(Z.moduleSettings.unhideBeforeMemory===void 0)Z.moduleSettings.unhideBeforeMemory=!1;if(!Z.moduleSettings.lorebookNameTemplate)Z.moduleSettings.lorebookNameTemplate="LTM - {{char}} - {{chat}}";if(Z.moduleSettings.manualModeEnabled&&Z.moduleSettings.autoCreateLorebook)Z.moduleSettings.autoCreateLorebook=!1,console.warn(U("STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false","index.warn.mutualExclusion"));if(!Z.migrationVersion||Z.migrationVersion<2)console.log(S`${V1}: Migrating to JSON-based architecture (v2)`),Z.migrationVersion=2,Z.profiles.forEach((Q)=>{if(Q.prompt&&Q.prompt.includes("createMemory"))console.log(S`${V1}: Updating profile "${Q.name}" to use JSON output`),Q.prompt=k1()});return Z}async function kZ(Z=!1){let Q=o.STMemoryBooks,G=await A0();if(!Z){if(!G&&Q?.moduleSettings?.autoCreateLorebook&&!Q?.moduleSettings?.manualModeEnabled){let J=Q.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",W=await G6(J,"chat");if(W.success)G=W.name;else return{valid:!1,error:W.error}}}if(!G)return{valid:!1,error:"No lorebook available or selected."};if(!A6||!A6.includes(G))return{valid:!1,error:`Selected lorebook "${G}" not found.`};try{let J=await fG(G);return{valid:!!J,data:J,name:G}}catch(J){return{valid:!1,error:"Failed to load the selected lorebook."}}}async function GJ(Z,Q,G=null){let J=T1(),W=J.moduleSettings.tokenWarningThreshold||30000,q=!J.moduleSettings.alwaysUseDefault||Z.estimatedTokens>W,Y=null;if(q){let X=G!==null?G:J.defaultProfile;if(Y=await q5(Z,J,Z1(),l(),b0,X),!Y.confirmed)return null}else{let X=J.profiles[J.defaultProfile];Y={confirmed:!0,profileSettings:{...X,effectivePrompt:await q7(X)},advancedOptions:{memoryCount:J.moduleSettings.defaultMemoryCount||0,overrideSettings:!1}}}let{profileSettings:z,advancedOptions:V}=Y;if(z?.connection?.api==="current_st"||V.overrideSettings){let X=l(),j=Z1();if(z.effectiveConnection={api:X.completionSource||"openai",model:j.model||"",temperature:j.temperature||0.7},z.useDynamicSTSettings)console.log("STMemoryBooks: Using dynamic ST settings profile - current settings:",z.effectiveConnection);else console.log("STMemoryBooks: Using current SillyTavern settings override for memory creation")}else z.effectiveConnection={...z.connection},console.log("STMemoryBooks: Using profile connection settings for memory creation");return{profileSettings:z,summaryCount:V.memoryCount||0,tokenThreshold:W,settings:J}}function JJ(Z){if(Z&&Z.name==="AIResponseError"){if(typeof Z.recoverable==="boolean")return Z.recoverable;if(Z.code&&String(Z.code).toUpperCase().includes("TRUNCATION"))return!0}if(["TokenWarningError","InvalidProfileError"].includes(Z?.name))return!1;if(Z?.message&&(Z.message.includes("Scene compilation failed")||Z.message.includes("Invalid memory result")||Z.message.includes("Invalid lorebook")))return!1;return!0}async function yZ(Z,Q,G,J=0){let{profileSettings:W,summaryCount:q,tokenThreshold:Y,settings:z}=G;O6=W;try{if(z?.moduleSettings?.convertExistingRecursion&&Q?.valid&&Q.data?.entries){let X=G8(Q.data)||[],j=X.length>0?X[0].entry:null,K=!!W.preventRecursion,F=!!W.delayUntilRecursion,H=!1;if(!j)H=!1;else{let B=!!j.preventRecursion,A=!!j.delayUntilRecursion;H=B!==K||A!==F}if(H){let B=0,A=0,T=Object.values(Q.data.entries||{});for(let R of T)if(R&&R.stmemorybooks===!0){B++;let N=R.preventRecursion!==K,M=R.delayUntilRecursion!==F;if(N||M)R.preventRecursion=K,R.delayUntilRecursion=F,A++}if(A>0){try{if(await kG(Q.name,Q.data,!0),z.moduleSettings?.refreshEditor)try{gG(Q.name)}catch(R){}}catch(R){console.warn("STMemoryBooks: Failed to save lorebook during recursion conversion:",R)}try{toastr.info(S`Updated recursion flags on ${A} of ${B} memory entr${A===1?"y":"ies"}`,"STMemoryBooks")}catch(R){}}}}}catch(X){console.warn("STMemoryBooks: convertExistingRecursion check failed:",X)}let V=y8.MAX_RETRIES;try{if(z?.moduleSettings?.unhideBeforeMemory)try{await yG(`/unhide ${Z.sceneStart}-${Z.sceneEnd}`)}catch(C){console.warn("STMemoryBooks: /unhide command failed or unavailable:",C)}let X=i0(Z.sceneStart,Z.sceneEnd),j=p0(X),K=j4(j);if(!K.valid)throw Error(`Scene compilation failed: ${K.errors.join(", ")}`);let F=[],H={summaries:[],actualCount:0,requestedCount:0};if(q>0)if(H=await h0(q,z,b0),F=H.summaries,H.actualCount>0){if(H.actualCount<H.requestedCount)toastr.warning(S`Only ${H.actualCount} of ${H.requestedCount} requested memories available`,"STMemoryBooks");console.log(`STMemoryBooks: Including ${H.actualCount} previous memories as context`)}else toastr.warning(U("No previous memories found in lorebook","STMemoryBooks_NoPreviousMemoriesFound"),"STMemoryBooks");let B;if(J>0)B=`Retrying memory creation (attempt ${J+1}/${V+1})...`;else B=H.actualCount>0?`Creating memory with ${H.actualCount} context memories...`:"Creating memory...";toastr.info(U(B,"STMemoryBooks_WorkingToast"),"STMemoryBooks",{timeOut:0}),j.previousSummariesContext=F;let T=V4(j).estimatedTokens,R=await x4(j,W,{tokenWarningThreshold:Y}),N=R;if(z.moduleSettings.showMemoryPreviews){toastr.clear();let C=await $8(R,Z,W);if(C.action==="cancel")return;else if(C.action==="retry"){let h=J>=V?J-V:0;if(h>=3)return toastr.warning(S`Maximum retry attempts (${3}) reached`,"STMemoryBooks"),{action:"cancel"};toastr.info(S`Retrying memory generation (${h+1}/${3})...`,"STMemoryBooks");let x=Math.max(J+1,V+h+1);return await yZ(Z,Q,G,x)}if(C.action==="accept")N=R;else if(C.action==="edit"){if(!C.memoryData){console.error("STMemoryBooks: Edit action missing memoryData"),toastr.error(U("Unable to retrieve edited memory data","STMemoryBooks_UnableToRetrieveEditedMemoryData"),"STMemoryBooks");return}if(!C.memoryData.extractedTitle||!C.memoryData.content){console.error("STMemoryBooks: Edited memory data missing required fields"),toastr.error(U("Edited memory data is incomplete","STMemoryBooks_EditedMemoryDataIncomplete"),"STMemoryBooks");return}N=C.memoryData}else console.warn(`STMemoryBooks: Unexpected preview action: ${C.action}`),N=R}let M=await y4(N,Q);if(!M.success)throw Error(M.error||"Failed to add memory to lorebook");try{let C=W?.effectiveConnection||W?.connection||{};console.debug("STMemoryBooks: Passing profile to runAfterMemory",{api:C.api,model:C.model,temperature:C.temperature}),await T5(j,W)}catch(C){console.warn("STMemoryBooks: runAfterMemory failed:",C)}try{let C=m()||{};C.highestMemoryProcessed=Z.sceneEnd,Q1()}catch(C){console.warn("STMemoryBooks: Failed to update highestMemoryProcessed baseline:",C)}p4();let E=H.actualCount>0?` (with ${H.actualCount} context ${H.actualCount===1?"memory":"memories"})`:"";toastr.clear(),X8=null,R6=null;let y=J>0?` (succeeded on attempt ${J+1})`:"";toastr.success(S`Memory "${M.entryTitle}" created successfully${E}${y}!`,"STMemoryBooks")}catch(X){if(console.error("STMemoryBooks: Error creating memory:",X),J<V&&JJ(X))return toastr.warning(S`Memory creation failed (attempt ${J+1}). Retrying in ${Math.round(y8.RETRY_DELAY_MS/1000)} seconds...`,"STMemoryBooks",{timeOut:3000}),await new Promise((H)=>setTimeout(H,y8.RETRY_DELAY_MS)),await yZ(Z,Q,G,J+1);let K=J>0?` (failed after ${J+1} attempts)`:"",F=X&&X.code?` [${X.code}]`:"";if(X.name==="TokenWarningError")toastr.error(S`Scene is too large (${X.tokenCount} tokens). Try selecting a smaller range${K}.`,"STMemoryBooks",{timeOut:8000});else if(X.name==="AIResponseError"){try{toastr.clear(X8)}catch(H){}R6=X,X8=toastr.error(S`AI failed to generate valid memory${F}: ${X.message}${K}`,"STMemoryBooks",{timeOut:0,extendedTimeOut:0,closeButton:!0,tapToDismiss:!1,onclick:()=>{try{DJ(R6)}catch(H){console.error(H)}}})}else if(X.name==="InvalidProfileError")toastr.error(S`Profile configuration error: ${X.message}${K}`,"STMemoryBooks",{timeOut:8000});else toastr.error(S`Failed to create memory: ${X.message}${K}`,"STMemoryBooks")}}async function D6(Z=null){let Q=B0();if(!Q.isGroupChat){if(!xZ||xZ.length===0||!xZ[bG]){toastr.error(U("SillyTavern is still loading character data, please wait a few seconds and try again.","STMemoryBooks_LoadingCharacterData"),"STMemoryBooks");return}}else if(!Q.groupId||!Q.groupName){toastr.error(U("Group chat data not available, please wait a few seconds and try again.","STMemoryBooks_GroupChatDataUnavailable"),"STMemoryBooks");return}if(E1)return;E1=!0;try{let G=T1(),J=await B8();if(!J){console.error("STMemoryBooks: No scene selected for memory initiation"),toastr.error(U("No scene selected","STMemoryBooks_NoSceneSelected"),"STMemoryBooks"),E1=!1;return}let W=await kZ();if(!W.valid){console.error("STMemoryBooks: Lorebook validation failed:",W.error),toastr.error(U(W.error,"STMemoryBooks_LorebookValidationError"),"STMemoryBooks"),E1=!1;return}let q=G8(W.data),Y=J.sceneStart,z=J.sceneEnd;if(!G.moduleSettings.allowSceneOverlap)for(let X of q){let j=k4(X.entry);if(j&&j.start!==null&&j.end!==null){let K=Number(j.start),F=Number(j.end),H=Number(Y),B=Number(z);if(console.debug(`STMemoryBooks: OverlapCheck new=[${H}-${B}] existing="${X.title}" [${K}-${F}] cond1(ns<=e)=${H<=F} cond2(ne>=s)=${B>=K}`),H<=F&&B>=K){console.error(`STMemoryBooks: Scene overlap detected with memory: ${X.title} [${K}-${F}] vs new [${H}-${B}]`),toastr.error(S`Scene overlaps with existing memory: "${X.title}" (messages ${K}-${F})`,"STMemoryBooks"),E1=!1;return}}}let V=await GJ(J,W,Z);if(!V){E1=!1;return}if(d)d.completeCancelled(),d=null;await yZ(J,W,V)}catch(G){console.error("STMemoryBooks: Critical error during memory initiation:",G),toastr.error(S`An unexpected error occurred: ${G.message}`,"STMemoryBooks")}finally{E1=!1}}function T6(Z){if(Z.autoHideMode)return Z.autoHideMode;if(Z.autoHideAllMessages)return"all";else if(Z.autoHideLastMemory)return"last";else return"none"}function e5(){let Z=o.STMemoryBooks;if(!Z)return;let Q=m()||{},G=Z.moduleSettings.manualModeEnabled,J=document.querySelector("#stmb-mode-badge");if(J)J.textContent=G?U("Manual","STMemoryBooks_Manual"):U("Automatic (Chat-bound)","STMemoryBooks_AutomaticChatBound");let W=document.querySelector("#stmb-active-lorebook");if(W){let j=G?Q.manualLorebook:b0?.[E8];W.textContent=j||U("None selected","STMemoryBooks_NoneSelected"),W.className=j?"":"opacity50p"}let q=document.querySelector("#stmb-manual-controls");if(q)q.style.display=G?"block":"none";let Y=document.querySelector("#stmb-automatic-info");if(Y){Y.style.display=G?"none":"block";let j=Y.querySelector("small");if(j){let K=b0?.[E8];j.innerHTML=K?S`Using chat-bound lorebook "<strong>${K}</strong>"`:U("No chat-bound lorebook. Memories will require lorebook selection.","STMemoryBooks_NoChatBoundLorebook")}}let z=document.querySelector("#stmb-auto-create-lorebook"),V=document.querySelector("#stmb-manual-mode-enabled"),X=document.querySelector("#stmb-lorebook-name-template");if(z&&V){let j=Z.moduleSettings.autoCreateLorebook;if(z.disabled=G,V.disabled=j,X)X.disabled=!j}}function N6(){if(!d?.dlg)return;let Z=T1(),Q=m()||{},G=d.content.querySelector("#stmb-manual-lorebook-buttons"),J=d.content.querySelector("#stmb-profile-buttons"),W=d.content.querySelector("#stmb-extra-function-buttons"),q=d.content.querySelector("#stmb-prompt-manager-buttons");if(G&&Z.moduleSettings.manualModeEnabled){let X=Q.manualLorebook??null,j=[{text:`\uD83D\uDCD5 ${X?U("Change","STMemoryBooks_ChangeManualLorebook"):U("Select","STMemoryBooks_SelectManualLorebook")} `+U("Manual Lorebook","STMemoryBooks_ManualLorebook"),id:"stmb-select-manual-lorebook",action:async()=>{try{if(await T0(X?Q.manualLorebook:null))a1()}catch(K){console.error("STMemoryBooks: Error selecting manual lorebook:",K),toastr.error(U("Failed to select manual lorebook","STMemoryBooks_FailedToSelectManualLorebook"),"STMemoryBooks")}}}];if(X)j.push({text:"❌ "+U("Clear Manual Lorebook","STMemoryBooks_ClearManualLorebook"),id:"stmb-clear-manual-lorebook",action:()=>{try{let K=m()||{};delete K.manualLorebook,Q1(),a1(),toastr.success(U("Manual lorebook cleared","STMemoryBooks_ManualLorebookCleared"),"STMemoryBooks")}catch(K){console.error("STMemoryBooks: Error clearing manual lorebook:",K),toastr.error(U("Failed to clear manual lorebook","STMemoryBooks_FailedToClearManualLorebook"),"STMemoryBooks")}}});G.innerHTML="",j.forEach((K)=>{let F=document.createElement("div");F.className="menu_button interactable whitespacenowrap",F.id=K.id,F.textContent=K.text,F.addEventListener("click",K.action),G.appendChild(F)})}if(!J||!W)return;let Y=[{text:"⭐ "+U("Set as Default","STMemoryBooks_SetAsDefault"),id:"stmb-set-default-profile",action:()=>{let X=d?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let j=parseInt(X.value);if(j===Z.defaultProfile)return;Z.defaultProfile=j,n();let K=Z.profiles[j]?.connection?.api==="current_st"?U("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):Z.profiles[j].name;toastr.success(S`"${K}" is now the default profile.`,"STMemoryBooks"),a1()}},{text:"✏️ "+U("Edit Profile","STMemoryBooks_EditProfile"),id:"stmb-edit-profile",action:async()=>{try{let X=d?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let j=parseInt(X.value),K=Z.profiles[j];if(K.useDynamicSTSettings)K.connection=K.connection||{},K.connection.api="current_st",delete K.useDynamicSTSettings,n();await s4(Z,j,a1)}catch(X){console.error(`${V1}: Error in edit profile:`,X),toastr.error(U("Failed to edit profile","STMemoryBooks_FailedToEditProfile"),"STMemoryBooks")}}},{text:"➕ "+U("New Profile","STMemoryBooks_NewProfile"),id:"stmb-new-profile",action:async()=>{try{await r4(Z,a1)}catch(X){console.error(`${V1}: Error in new profile:`,X),toastr.error(U("Failed to create profile","STMemoryBooks_FailedToCreateProfile"),"STMemoryBooks")}}},{text:"\uD83D\uDDD1️ "+U("Delete Profile","STMemoryBooks_DeleteProfile"),id:"stmb-delete-profile",action:async()=>{try{let X=d?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let j=parseInt(X.value);await a4(Z,j,a1)}catch(X){console.error(`${V1}: Error in delete profile:`,X),toastr.error(U("Failed to delete profile","STMemoryBooks_FailedToDeleteProfile"),"STMemoryBooks")}}}],z=[{text:"\uD83D\uDCE4 "+U("Export Profiles","STMemoryBooks_ExportProfiles"),id:"stmb-export-profiles",action:()=>{try{t4(Z)}catch(X){console.error(`${V1}: Error in export profiles:`,X),toastr.error(U("Failed to export profiles","STMemoryBooks_FailedToExportProfiles"),"STMemoryBooks")}}},{text:"\uD83D\uDCE5 "+U("Import Profiles","STMemoryBooks_ImportProfiles"),id:"stmb-import-profiles",action:()=>{let X=d?.dlg?.querySelector("#stmb-import-file");if(X)X.click()}}],V=[{text:"\uD83E\uDDE9 "+U("Summary Prompt Manager","STMemoryBooks_SummaryPromptManager"),id:"stmb-prompt-manager",action:async()=>{try{await y0()}catch(X){console.error(`${V1}: Error opening prompt manager:`,X),toastr.error(U("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}},{text:"\uD83E\uDDF1 "+U("Arc Prompt Manager","STMemoryBooks_ArcPromptManager"),id:"stmb-arc-prompt-manager",action:async()=>{try{await f0()}catch(X){console.error(`${V1}: Error opening Arc Prompt Manager:`,X),toastr.error(U("Failed to open Arc Prompt Manager","STMemoryBooks_FailedToOpenArcPromptManager"),"STMemoryBooks")}}},{text:"\uD83C\uDFA1 "+U("Trackers & Side Prompts","STMemoryBooks_SidePrompts"),id:"stmb-side-prompts",action:async()=>{try{await I5()}catch(X){console.error(`${V1}: Error opening Trackers & Side Prompts Manager:`,X),toastr.error(U("Failed to open Trackers & Side Prompts Manager","STMemoryBooks_FailedToOpenSidePrompts"),"STMemoryBooks")}}}];J.innerHTML="",W.innerHTML="",q.innerHTML="",Y.forEach((X)=>{let j=document.createElement("div");j.className="menu_button interactable whitespacenowrap",j.id=X.id,j.textContent=X.text,j.addEventListener("click",X.action),J.appendChild(j)}),z.forEach((X)=>{let j=document.createElement("div");j.className="menu_button interactable whitespacenowrap",j.id=X.id,j.textContent=X.text,j.addEventListener("click",X.action),W.appendChild(j)}),V.forEach((X)=>{let j=document.createElement("div");j.className="menu_button interactable whitespacenowrap",j.id=X.id,j.textContent=X.text,j.addEventListener("click",X.action),q.appendChild(j)})}async function y0(){try{let Z=o.STMemoryBooks;await n0(Z);let Q=await O0(),G='<h3 data-i18n="STMemoryBooks_PromptManager_Title">\uD83E\uDDE9 Summary Prompt Manager</h3>';G+='<div class="world_entry_form_control">',G+='<p data-i18n="STMemoryBooks_PromptManager_Desc">Manage your summary generation prompts. All presets are editable.</p>',G+="</div>",G+='<div class="world_entry_form_control">',G+='<input type="text" id="stmb-prompt-search" class="text_pole" placeholder="Search presets..." aria-label="Search presets" data-i18n="[placeholder]STMemoryBooks_PromptManager_Search;[aria-label]STMemoryBooks_PromptManager_Search" />',G+="</div>",G+='<div id="stmb-preset-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',G+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',G+='<button id="stmb-pm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_New">➕ New Preset</button>',G+='<button id="stmb-pm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Export">\uD83D\uDCE4 Export JSON</button>',G+='<button id="stmb-pm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Import">\uD83D\uDCE5 Import JSON</button>',G+='<button id="stmb-pm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_RecreateBuiltins">♻️ Recreate Built-in Prompts</button>',G+='<button id="stmb-pm-apply" class="menu_button whitespacenowrap" disabled data-i18n="STMemoryBooks_PromptManager_ApplyToProfile">✅ Apply to Selected Profile</button>',G+="</div>",G+=`<small>${U(`\uD83D\uDCA1 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don't change the "respond with JSON" instructions, \uD83D\uDCD5Memory Books uses that to process the returned result from the AI.`,"STMemoryBooks_PromptManager_Hint")}</small>`,G+='<input type="file" id="stmb-pm-import-file" accept=".json" style="display: none;" />';let J=new J1(G,a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")});$J(J);let W=J.dlg?.querySelector("#stmb-preset-list");if(W){let q=(Q||[]).map((Y)=>({key:String(Y.key||""),displayName:String(Y.displayName||"")}));W.innerHTML=V8.sanitize(PZ({items:q}))}await J.show()}catch(Z){console.error("STMemoryBooks: Error showing prompt manager:",Z),toastr.error(U("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}function $J(Z){let Q=Z.dlg,G=null;Q.addEventListener("click",async(W)=>{let q=W.target.closest(".stmb-action");if(q){W.preventDefault(),W.stopPropagation();let z=q.closest("tr[data-preset-key]"),V=z?.dataset.presetKey;if(!V)return;if(Q.querySelectorAll("tr[data-preset-key]").forEach((j)=>{j.classList.remove("ui-state-active"),j.style.backgroundColor="",j.style.border=""}),z)z.style.backgroundColor="var(--cobalt30a)",z.style.border="",G=V;let X=Q.querySelector("#stmb-pm-apply");if(X)X.disabled=!1;if(q.classList.contains("stmb-action-edit"))await Z7(Z,V);else if(q.classList.contains("stmb-action-duplicate"))await Q7(Z,V);else if(q.classList.contains("stmb-action-delete"))await G7(Z,V);return}let Y=W.target.closest("tr[data-preset-key]");if(Y){Q.querySelectorAll("tr[data-preset-key]").forEach((V)=>{V.classList.remove("ui-state-active"),V.style.backgroundColor="",V.style.border=""}),Y.style.backgroundColor="var(--cobalt30a)",Y.style.border="",G=Y.dataset.presetKey;let z=Q.querySelector("#stmb-pm-apply");if(z)z.disabled=!1}});let J=Q.querySelector("#stmb-prompt-search");if(J)J.addEventListener("input",(W)=>{let q=W.target.value.toLowerCase();Q.querySelectorAll("tr[data-preset-key]").forEach((Y)=>{let z=Y.querySelector("td:first-child").textContent.toLowerCase();Y.style.display=z.includes(q)?"":"none"})});Q.querySelector("#stmb-pm-new")?.addEventListener("click",async()=>{await WJ(Z)}),Q.querySelector("#stmb-pm-edit")?.addEventListener("click",async()=>{if(G)await Z7(Z,G)}),Q.querySelector("#stmb-pm-duplicate")?.addEventListener("click",async()=>{if(G)await Q7(Z,G)}),Q.querySelector("#stmb-pm-delete")?.addEventListener("click",async()=>{if(G)await G7(Z,G)}),Q.querySelector("#stmb-pm-export")?.addEventListener("click",async()=>{await qJ()}),Q.querySelector("#stmb-pm-import")?.addEventListener("click",()=>{Q.querySelector("#stmb-pm-import-file")?.click()}),Q.querySelector("#stmb-pm-import-file")?.addEventListener("change",async(W)=>{await YJ(W,Z)}),Q.querySelector("#stmb-pm-recreate-builtins")?.addEventListener("click",async()=>{try{let W=`
                <h3>${b(U("Recreate Built-in Prompts","STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${b(U("This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.","STMemoryBooks_RecreateBuiltinsWarning"))}
                </div>
                <p class="opacity70p">${b(U("This does not affect your other custom presets.","STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;if(await new J1(W,a.CONFIRM,"",{okButton:U("Overwrite","STMemoryBooks_RecreateBuiltinsOverwrite"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()===p.AFFIRMATIVE){let z=await G4("overwrite");try{window.dispatchEvent(new CustomEvent("stmb-presets-updated"))}catch(V){}toastr.success(S`Removed ${z?.removed||0} built-in overrides`,U("STMemoryBooks","index.toast.title")),Z.completeAffirmative(),await y0()}}catch(W){console.error("STMemoryBooks: Error recreating built-in prompts:",W),toastr.error(U("Failed to recreate built-in prompts","STMemoryBooks_FailedToRecreateBuiltins"),U("STMemoryBooks","index.toast.title"))}}),Q.querySelector("#stmb-pm-apply")?.addEventListener("click",async()=>{if(!G){toastr.error(U("Select a preset first","STMemoryBooks_SelectPresetFirst"),"STMemoryBooks");return}let W=o?.STMemoryBooks;if(!W||!Array.isArray(W.profiles)||W.profiles.length===0){toastr.error(U("No profiles available","STMemoryBooks_NoProfilesAvailable"),"STMemoryBooks");return}let q=W.defaultProfile||0;if(d?.dlg){let z=d.dlg.querySelector("#stmb-profile-select");if(z){let V=parseInt(z.value);if(!isNaN(V))q=V}}let Y=W.profiles[q];if(!Y){toastr.error(U("Selected profile not found","STMemoryBooks_SelectedProfileNotFound"),"STMemoryBooks");return}if(Y.prompt&&Y.prompt.trim())if(await new J1('<h3 data-i18n="STMemoryBooks_ClearCustomPromptTitle">Clear Custom Prompt?</h3><p data-i18n="STMemoryBooks_ClearCustomPromptDesc">This profile has a custom prompt. Clear it so the selected preset is used?</p>',a.CONFIRM,"",{okButton:U("Clear and Apply","STMemoryBooks_ClearAndApply"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()===p.AFFIRMATIVE)Y.prompt="";else return;if(Y.preset=G,n(),toastr.success(U("Preset applied to profile","STMemoryBooks_PresetAppliedToProfile"),"STMemoryBooks"),d?.dlg)try{a1()}catch(z){}})}async function WJ(Z){let G=new J1(`
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
    `,a.TEXT,"",{okButton:U("Create","STMemoryBooks_Create"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await G.show()===p.AFFIRMATIVE){let W=G.dlg.querySelector("#stmb-pm-new-display-name").value.trim(),q=G.dlg.querySelector("#stmb-pm-new-prompt").value.trim();if(!q){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}try{await R8(null,q,W||null),toastr.success(U("Preset created successfully","STMemoryBooks_PresetCreatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await y0()}catch(Y){console.error("STMemoryBooks: Error creating preset:",Y),toastr.error(U("Failed to create preset","STMemoryBooks_FailedToCreatePreset"),"STMemoryBooks")}}}async function Z7(Z,Q){try{let G=await x6(Q),J=await e1(Q),W=`
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
        `,q=new J1(W,a.TEXT,"",{okButton:U("Save","STMemoryBooks_Save"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await q.show()===p.AFFIRMATIVE){let z=q.dlg.querySelector("#stmb-pm-edit-display-name").value.trim(),V=q.dlg.querySelector("#stmb-pm-edit-prompt").value.trim();if(!V){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}await R8(Q,V,z||null),toastr.success(U("Preset updated successfully","STMemoryBooks_PresetUpdatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await y0()}}catch(G){console.error("STMemoryBooks: Error editing preset:",G),toastr.error(U("Failed to edit preset","STMemoryBooks_FailedToEditPreset"),"STMemoryBooks")}}async function Q7(Z,Q){try{let G=await tZ(Q);toastr.success(U("Preset duplicated successfully","STMemoryBooks_PresetDuplicatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await y0()}catch(G){console.error("STMemoryBooks: Error duplicating preset:",G),toastr.error(U("Failed to duplicate preset","STMemoryBooks_FailedToDuplicatePreset"),"STMemoryBooks")}}async function G7(Z,Q){let G=await x6(Q),J=new J1(`<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${b(U('Are you sure you want to delete "{{name}}"?',"STMemoryBooks_DeletePresetConfirm",{name:G}))}</p>`,a.CONFIRM,"",{okButton:U("Delete","STMemoryBooks_Delete"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});try{j8(J.dlg)}catch(q){}if(await J.show()===p.AFFIRMATIVE)try{await eZ(Q),toastr.success(U("Preset deleted successfully","STMemoryBooks_PresetDeletedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await y0()}catch(q){console.error("STMemoryBooks: Error deleting preset:",q),toastr.error(U("Failed to delete preset","STMemoryBooks_FailedToDeletePreset"),"STMemoryBooks")}}async function qJ(){try{let Z=await Z4(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-summary-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(U("Prompts exported successfully","STMemoryBooks_PromptsExportedSuccessfully"),"STMemoryBooks")}catch(Z){console.error("STMemoryBooks: Error exporting prompts:",Z),toastr.error(U("Failed to export prompts","STMemoryBooks_FailedToExportPrompts"),"STMemoryBooks")}}async function YJ(Z,Q){let G=Z.target.files[0];if(!G)return;try{let J=await G.text();await Q4(J),toastr.success(U("Prompts imported successfully","STMemoryBooks_PromptsImportedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Q.completeAffirmative(),await y0()}catch(J){console.error("STMemoryBooks: Error importing prompts:",J),toastr.error(S`Failed to import prompts: ${J.message}`,"STMemoryBooks")}}async function f0(){try{let Z=o.STMemoryBooks;await MZ(Z);let Q=await F6(),G='<h3 data-i18n="STMemoryBooks_ArcPromptManager_Title">\uD83E\uDDF1 Arc Prompt Manager</h3>';G+='<div class="world_entry_form_control">',G+='<p data-i18n="STMemoryBooks_ArcPromptManager_Desc">Manage your Arc Analysis prompts. All presets are editable.</p>',G+="</div>",G+='<div class="world_entry_form_control">',G+='<input type="text" id="stmb-apm-search" class="text_pole" placeholder="Search arc presets..." aria-label="Search arc presets" data-i18n="[placeholder]STMemoryBooks_ArcPromptManager_Search;[aria-label]STMemoryBooks_ArcPromptManager_Search" />',G+="</div>",G+='<div id="stmb-apm-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',G+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',G+='<button id="stmb-apm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_New">➕ New Arc Preset</button>',G+='<button id="stmb-apm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Export">\uD83D\uDCE4 Export JSON</button>',G+='<button id="stmb-apm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Import">\uD83D\uDCE5 Import JSON</button>',G+='<button id="stmb-apm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_RecreateBuiltins">♻️ Recreate Built-in Arc Prompts</button>',G+="</div>",G+='<input type="file" id="stmb-apm-import-file" accept=".json" style="display: none;" />';let J=new J1(G,a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")});zJ(J);let W=J.dlg?.querySelector("#stmb-apm-list");if(W){let q=(Q||[]).map((Y)=>({key:String(Y.key||""),displayName:String(Y.displayName||"")}));W.innerHTML=V8.sanitize(PZ({items:q}))}await J.show()}catch(Z){console.error("STMemoryBooks: Error showing Arc Prompt Manager:",Z),toastr.error(U("Failed to open Arc Prompt Manager","STMemoryBooks_FailedToOpenArcPromptManager"),"STMemoryBooks")}}function zJ(Z){let Q=Z.dlg,G=null;Q.addEventListener("click",async(J)=>{let W=J.target.closest(".stmb-action");if(W){J.preventDefault(),J.stopPropagation();let Y=W.closest("tr[data-preset-key]"),z=Y?.dataset.presetKey;if(!z)return;if(Q.querySelectorAll("tr[data-preset-key]").forEach((V)=>{V.classList.remove("ui-state-active"),V.style.backgroundColor="",V.style.border=""}),Y)Y.style.backgroundColor="var(--cobalt30a)",Y.style.border="",G=z;if(W.classList.contains("stmb-action-edit"))await VJ(Z,z);else if(W.classList.contains("stmb-action-duplicate"))await jJ(Z,z);else if(W.classList.contains("stmb-action-delete"))await FJ(Z,z);return}let q=J.target.closest("tr[data-preset-key]");if(q)Q.querySelectorAll("tr[data-preset-key]").forEach((Y)=>{Y.classList.remove("ui-state-active"),Y.style.backgroundColor="",Y.style.border=""}),q.style.backgroundColor="var(--cobalt30a)",q.style.border="",G=q.dataset.presetKey}),Q.querySelector("#stmb-apm-search")?.addEventListener("input",(J)=>{let W=J.target.value.toLowerCase();Q.querySelectorAll("tr[data-preset-key]").forEach((q)=>{let Y=q.querySelector("td:first-child").textContent.toLowerCase();q.style.display=Y.includes(W)?"":"none"})}),Q.querySelector("#stmb-apm-new")?.addEventListener("click",async()=>{await XJ(Z)}),Q.querySelector("#stmb-apm-export")?.addEventListener("click",async()=>{await KJ()}),Q.querySelector("#stmb-apm-import")?.addEventListener("click",()=>{Q.querySelector("#stmb-apm-import-file")?.click()}),Q.querySelector("#stmb-apm-import-file")?.addEventListener("change",async(J)=>{await UJ(J,Z)}),Q.querySelector("#stmb-apm-recreate-builtins")?.addEventListener("click",async()=>{try{let J=`
                <h3>${b(U("Recreate Built-in Prompts","STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${b(U("This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.","STMemoryBooks_RecreateBuiltinsWarning"))}
                </div>
                <p class="opacity70p">${b(U("This does not affect your other custom presets.","STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;if(await new J1(J,a.CONFIRM,"",{okButton:U("Overwrite","STMemoryBooks_RecreateBuiltinsOverwrite"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()===p.AFFIRMATIVE){let Y=await E5("overwrite");try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch(z){}toastr.success(S`Removed ${Y?.removed||0} built-in overrides`,U("STMemoryBooks","index.toast.title")),Z.completeAffirmative(),await f0()}}catch(J){console.error("STMemoryBooks: Error recreating built-in arc prompts:",J),toastr.error(U("Failed to recreate built-in prompts","STMemoryBooks_FailedToRecreateBuiltins"),U("STMemoryBooks","index.toast.title"))}})}async function XJ(Z){let G=new J1(`
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
    `,a.TEXT,"",{okButton:U("Create","STMemoryBooks_Create"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await G.show()===p.AFFIRMATIVE){let W=G.dlg.querySelector("#stmb-apm-new-display-name").value.trim(),q=G.dlg.querySelector("#stmb-apm-new-prompt").value.trim();if(!q){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}try{await vZ(null,q,W||null),toastr.success(U("Preset created successfully","STMemoryBooks_PresetCreatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await f0()}catch(Y){console.error("STMemoryBooks: Error creating arc preset:",Y),toastr.error(U("Failed to create preset","STMemoryBooks_FailedToCreatePreset"),"STMemoryBooks")}}}async function VJ(Z,Q){try{let G=await hZ(Q),J=await K6(Q),W=`
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
        `,q=new J1(W,a.TEXT,"",{okButton:U("Save","STMemoryBooks_Save"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});if(await q.show()===p.AFFIRMATIVE){let z=q.dlg.querySelector("#stmb-apm-edit-display-name").value.trim(),V=q.dlg.querySelector("#stmb-apm-edit-prompt").value.trim();if(!V){toastr.error(U("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}await vZ(Q,V,z||null),toastr.success(U("Preset updated successfully","STMemoryBooks_PresetUpdatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await f0()}}catch(G){console.error("STMemoryBooks: Error editing arc preset:",G),toastr.error(U("Failed to edit preset","STMemoryBooks_FailedToEditPreset"),"STMemoryBooks")}}async function jJ(Z,Q){try{let G=await v5(Q);toastr.success(U("Preset duplicated successfully","STMemoryBooks_PresetDuplicatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await f0()}catch(G){console.error("STMemoryBooks: Error duplicating arc preset:",G),toastr.error(U("Failed to duplicate preset","STMemoryBooks_FailedToDuplicatePreset"),"STMemoryBooks")}}async function FJ(Z,Q){let G=await hZ(Q),J=new J1(`<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${b(U('Are you sure you want to delete "{{name}}"?',"STMemoryBooks_DeletePresetConfirm",{name:G}))}</p>`,a.CONFIRM,"",{okButton:U("Delete","STMemoryBooks_Delete"),cancelButton:U("Cancel","STMemoryBooks_Cancel")});try{j8(J.dlg)}catch(q){}if(await J.show()===p.AFFIRMATIVE)try{await P5(Q),toastr.success(U("Preset deleted successfully","STMemoryBooks_PresetDeletedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await f0()}catch(q){console.error("STMemoryBooks: Error deleting arc preset:",q),toastr.error(U("Failed to delete preset","STMemoryBooks_FailedToDeletePreset"),"STMemoryBooks")}}async function KJ(){try{let Z=await x5(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-arc-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(U("Prompts exported successfully","STMemoryBooks_PromptsExportedSuccessfully"),"STMemoryBooks")}catch(Z){console.error("STMemoryBooks: Error exporting arc prompts:",Z),toastr.error(U("Failed to export prompts","STMemoryBooks_FailedToExportPrompts"),"STMemoryBooks")}}async function UJ(Z,Q){let G=Z.target.files[0];if(!G)return;try{let J=await G.text();await S5(J),toastr.success(U("Prompts imported successfully","STMemoryBooks_PromptsImportedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Q.completeAffirmative(),await f0()}catch(J){console.error("STMemoryBooks: Error importing arc prompts:",J),toastr.error(S`Failed to import prompts: ${J.message}`,"STMemoryBooks")}}async function HJ(){try{let Z=await kZ(!0),Q=Z?.name||null,G=Z?.data||{entries:{}};if(!Z?.valid||!Q)toastr.info("No memory lorebook currently assigned, no memories found.","SillyTavern Memory Books"),Q=null,G={entries:{}};let J=Object.values(G.entries||{}),W=(_)=>{if(typeof _!=="string")return 0;let h=_.match(/\[(\d+)\]/);if(h)return parseInt(h[1],10);let x=_.match(/^(\d+)[\s-]/);if(x)return parseInt(x[1],10);return 0},q=J.filter((_)=>_&&_.stmemorybooks===!0&&_.stmbArc!==!0&&!_.disable).sort((_,h)=>W(_.comment||"")-W(h.comment||""));await MZ(o?.STMemoryBooks);let Y=await F6(),z="arc_default",X=T1()?.moduleSettings?.tokenWarningThreshold||30000,j="";j+=`<h3>${b(U("\uD83C\uDF08 Consolidate Memories into Arcs","STMemoryBooks_ConsolidateArcs_Title"))}</h3>`,j+='<div class="world_entry_form_control">',j+=`<label><strong>${b(U("Preset","STMemoryBooks_ConsolidateArcs_Preset"))}:</strong> `,j+='<select id="stmb-arc-preset" class="text_pole">';for(let _ of Y){let h=String(_.key||""),x=String(_.displayName||h),f=h===z?" selected":"";j+=`<option value="${b(h)}"${f}>${b(x)}</option>`}j+=`</select></label> <button id="stmb-arc-rebuild-builtins" class="menu_button whitespacenowrap">${b(U("Rebuild from built-ins","STMemoryBooks_Arc_RebuildBuiltins"))}</button></div>`,j+='<div class="flex-container flexGap10">',j+=`<label>${b(U("Maximum number of memories to process in each pass","STMemoryBooks_Arc_MaxPerPass"))} <input id="stmb-arc-maxpass" type="number" min="1" max="50" value="12" class="text_pole" style="width:80px"/></label>`,j+=`<label>${b(U("Number of automatic arc attempts","STMemoryBooks_Arc_MaxPasses"))} <input id="stmb-arc-maxpasses" type="number" min="1" max="50" value="10" class="text_pole" style="width:100px"/></label>`,j+=`<label>${b(U("Minimum number of memories in each arc","STMemoryBooks_Arc_MinAssigned"))} <input id="stmb-arc-minassigned" type="number" min="1" max="12" value="2" class="text_pole" style="width:110px"/></label>`,j+=`<label>${b(U("Token Budget","STMemoryBooks_Arc_TokenBudget"))} <input id="stmb-arc-token" type="number" min="1000" max="100000" value="${X}" class="text_pole" style="width:120px"/></label>`,j+="</div>",j+='<div class="world_entry_form_control">',j+=`<label><input id="stmb-arc-disable-originals" type="checkbox"/> ${b(U("Disable originals after creating arcs","STMemoryBooks_ConsolidateArcs_DisableOriginals"))}</label>`,j+="</div>",j+='<div class="world_entry_form_control"><div class="flex-container flexGap10 marginBot5">',j+=`<button id="stmb-arc-select-all" class="menu_button">${b(U("Select All","STMemoryBooks_SelectAll"))}</button>`,j+=`<button id="stmb-arc-deselect-all" class="menu_button">${b(U("Deselect All","STMemoryBooks_DeselectAll"))}</button>`,j+="</div>",j+='<div id="stmb-arc-list" style="max-height:300px; overflow-y:auto; border:1px solid var(--SmartHover2); padding:6px">';for(let _ of q){let h=_.comment||"(untitled)",x=String(_.uid),f=W(h);j+=`<label class="flex-container flexGap10" style="align-items:center; margin:2px 0;"><input type="checkbox" class="stmb-arc-item" value="${b(x)}" checked /> <span class="opacity70p">[${String(f).padStart(3,"0")}]</span> <span>${b(h)}</span></label>`}j+="</div>",j+=`<small class="opacity70p">${b(U("Tip: uncheck memories that should not be included.","STMemoryBooks_ConsolidateArcs_Tip"))}</small>`,j+="</div>";let K=new J1(V8.sanitize(j),a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:U("Run","STMemoryBooks_Run"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}),F=K.dlg;try{j8(F)}catch(_){}if(F.querySelector("#stmb-arc-select-all")?.addEventListener("click",(_)=>{_.preventDefault(),F.querySelectorAll(".stmb-arc-item").forEach((h)=>h.checked=!0)}),F.querySelector("#stmb-arc-deselect-all")?.addEventListener("click",(_)=>{_.preventDefault(),F.querySelectorAll(".stmb-arc-item").forEach((h)=>h.checked=!1)}),F.querySelector("#stmb-arc-rebuild-builtins")?.addEventListener("click",async(_)=>{_.preventDefault();try{let h=`
                    <h3>${b(U("Rebuild Arc Prompts from Built-ins","STMemoryBooks_Arc_RebuildTitle"))}</h3>
                    <div class="info-block warning">
                        ${b(U("This will overwrite your saved Arc prompt presets with the built-ins. A timestamped backup will be created.","STMemoryBooks_Arc_RebuildWarning"))}
                    </div>
                    <p class="opacity70p">${b(U("After rebuild, the preset list will refresh automatically.","STMemoryBooks_Arc_RebuildNote"))}</p>
                `;if(await new J1(h,a.CONFIRM,"",{okButton:U("Rebuild","STMemoryBooks_Rebuild"),cancelButton:U("Cancel","STMemoryBooks_Cancel")}).show()!==p.AFFIRMATIVE)return;let g=await b5({backup:!0}),v=await F6(),s=F.querySelector("#stmb-arc-preset");if(s){let y1=s.value||z;s.innerHTML="";for(let G1 of v){let j1=String(G1.key||""),c1=String(G1.displayName||j1),H1=document.createElement("option");H1.value=j1,H1.textContent=c1,s.appendChild(H1)}if(Array.from(s.options).some((G1)=>G1.value===y1))s.value=y1;else s.value=z}try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch(y1){}let b1=g?.backupName?` (backup: ${g.backupName}) `:"";toastr.success(S`Rebuilt Arc prompts (${g?.count||0} presets)${b1}`,"STMemoryBooks")}catch(h){console.error("STMemoryBooks: Arc prompts rebuild failed:",h),toastr.error(S`Failed to rebuild Arc prompts: ${h.message}`,"STMemoryBooks")}}),await K.show()!==p.AFFIRMATIVE)return;let B=Array.from(F.querySelectorAll(".stmb-arc-item")).filter((_)=>_.checked).map((_)=>_.value);if(B.length===0){toastr.error(U("Select at least one memory to consolidate.","STMemoryBooks_SelectAtLeastOne"),"STMemoryBooks");return}if(!Q){toastr.info("Arc consolidation requires a memory lorebook. No lorebook assigned.","STMemoryBooks");return}let T={presetKey:String(F.querySelector("#stmb-arc-preset")?.value||"arc_default"),maxItemsPerPass:Math.max(1,parseInt(F.querySelector("#stmb-arc-maxpass")?.value)||12),maxPasses:Math.max(1,parseInt(F.querySelector("#stmb-arc-maxpasses")?.value)||10),minAssigned:Math.max(1,parseInt(F.querySelector("#stmb-arc-minassigned")?.value)||2),tokenTarget:Math.max(1000,parseInt(F.querySelector("#stmb-arc-token")?.value)||X)},R=!!F.querySelector("#stmb-arc-disable-originals")?.checked,N=new Map(q.map((_)=>[String(_.uid),_])),M=B.map((_)=>N.get(String(_))).filter(Boolean);toastr.info(U("Consolidating memories into arcs...","STMemoryBooks_ConsolidatingArcs"),"STMemoryBooks",{timeOut:0});let E;try{E=await o5(M,T,null)}catch(_){toastr.error(S`Arc analysis failed: ${_.message}`,"STMemoryBooks");return}let{arcCandidates:y,leftovers:C}=E||{arcCandidates:[],leftovers:[]};if(!y||y.length===0){toastr.warning(U("No arcs were produced. Try different settings or selection.","STMemoryBooks_NoArcsProduced"),"STMemoryBooks");return}try{let _=await s5({lorebookName:Q,lorebookData:G,arcCandidates:y,disableOriginals:R}),h=Array.isArray(_?.results)?_.results.length:y.length,x=`Created ${h} arc${h===1?"":"s"}${C?.length?`, ${C.length} leftover`:""}.`;if(h===1&&(!C||C.length===0))x+=" (all selected memories were consumed into a single arc)";toastr.success(S`${x}`,"STMemoryBooks")}catch(_){toastr.error(S`Failed to commit arcs: ${_.message}`,"STMemoryBooks")}}catch(Z){console.error("STMemoryBooks: showArcConsolidationPopup failed:",Z),toastr.error(S`Failed to open consolidate popup: ${Z.message}`,"STMemoryBooks")}}async function BJ(){let Z=T1();await n0(Z);let Q=await B8(),G=Array.isArray(Z.moduleSettings.selectedRegexOutgoing)?Z.moduleSettings.selectedRegexOutgoing:[],J=Array.isArray(Z.moduleSettings.selectedRegexIncoming)?Z.moduleSettings.selectedRegexIncoming:[],W=[];try{(W7({allowedOnly:!1})||[]).forEach((A,T)=>{let R=`idx:${T}`,N=`${A?.scriptName||"Untitled"}${A?.disabled?" (disabled)":""}`;W.push({key:R,label:N,selectedOutgoing:G.includes(R),selectedIncoming:J.includes(R)})})}catch(B){console.warn("STMemoryBooks: Failed to enumerate Regex scripts for UI",B)}let q=Z.profiles[Z.defaultProfile],Y=m(),z=Z.moduleSettings.manualModeEnabled,V=b0?.[E8]||null,X=Y?.manualLorebook||null,j={hasScene:!!Q,sceneData:Q,highestMemoryProcessed:Y?.highestMemoryProcessed,alwaysUseDefault:Z.moduleSettings.alwaysUseDefault,showMemoryPreviews:Z.moduleSettings.showMemoryPreviews,showNotifications:Z.moduleSettings.showNotifications,unhideBeforeMemory:Z.moduleSettings.unhideBeforeMemory||!1,refreshEditor:Z.moduleSettings.refreshEditor,allowSceneOverlap:Z.moduleSettings.allowSceneOverlap,manualModeEnabled:Z.moduleSettings.manualModeEnabled,lorebookMode:z?"Manual":"Automatic (Chat-bound)",currentLorebookName:z?X:V,manualLorebookName:X,chatBoundLorebookName:V,availableLorebooks:A6||[],autoHideMode:T6(Z.moduleSettings),unhiddenEntriesCount:Z.moduleSettings.unhiddenEntriesCount||2,tokenWarningThreshold:Z.moduleSettings.tokenWarningThreshold||50000,defaultMemoryCount:Z.moduleSettings.defaultMemoryCount||0,autoSummaryEnabled:Z.moduleSettings.autoSummaryEnabled||!1,autoSummaryInterval:Z.moduleSettings.autoSummaryInterval||50,autoSummaryBuffer:Z.moduleSettings.autoSummaryBuffer||2,autoCreateLorebook:Z.moduleSettings.autoCreateLorebook||!1,lorebookNameTemplate:Z.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",profiles:Z.profiles.map((B,A)=>({...B,name:B?.connection?.api==="current_st"?U("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):B.name,isDefault:A===Z.defaultProfile})),titleFormat:Z.titleFormat,useRegex:Z.moduleSettings.useRegex||!1,regexOptions:W,selectedRegexOutgoing:G,selectedRegexIncoming:J,titleFormats:$0().map((B)=>({value:B,isSelected:B===Z.titleFormat})),showCustomInput:!$0().includes(Z.titleFormat),selectedProfile:{...q,connection:q.useDynamicSTSettings||q?.connection?.api==="current_st"?(()=>{let B=l(),A=Z1();return{api:B.completionSource||"openai",model:A.model||"Not Set",temperature:A.temperature||0.7}})():{api:q.connection?.api||"openai",model:q.connection?.model||"Not Set",temperature:q.connection?.temperature!==void 0?q.connection.temperature:0.7},titleFormat:q.titleFormat||Z.titleFormat,effectivePrompt:q.prompt&&q.prompt.trim()?q.prompt:q.preset?await e1(q.preset):k1()}},K=V8.sanitize($Z(j)),F=[];F.push({text:"\uD83E\uDDE0 "+U("Create Memory","STMemoryBooks_CreateMemoryButton"),result:null,classes:["menu_button"],action:async()=>{if(!Q){toastr.error(U("No scene selected. Make sure both start and end points are set.","STMemoryBooks_NoSceneSelectedMakeSure"),"STMemoryBooks");return}let B=Z.defaultProfile;if(d&&d.dlg){let A=d.dlg.querySelector("#stmb-profile-select");if(A)B=parseInt(A.value)||Z.defaultProfile,console.log(`STMemoryBooks: Using profile index ${B} (${Z.profiles[B]?.name}) from main popup selection`)}await D6(B)}}),F.push({text:"\uD83C\uDF08 "+U("Consolidate Memories into Arcs","STMemoryBooks_ConsolidateArcsButton"),result:null,classes:["menu_button"],action:async()=>{await HJ()}}),F.push({text:"\uD83D\uDDD1️ "+U("Clear Scene","STMemoryBooks_ClearSceneButton"),result:null,classes:["menu_button"],action:()=>{d0(),a1()}});let H={wide:!0,large:!0,allowVerticalScrolling:!0,customButtons:F,cancelButton:U("Close","STMemoryBooks_Close"),okButton:!1,onClose:RJ};try{d=new J1(K,a.TEXT,"",H),OJ(),N6(),await d.show()}catch(B){console.error("STMemoryBooks: Error showing settings popup:",B),d=null}}function OJ(){if(!d)return;let Z=d.dlg;Z.addEventListener("click",async(Q)=>{let G=T1();if(Q.target&&Q.target.matches("#stmb-configure-regex")){Q.preventDefault();try{await IJ()}catch(J){console.warn("STMemoryBooks: showRegexSelectionPopup failed",J)}return}}),Z.addEventListener("change",async(Q)=>{let G=T1();if(Q.target.matches("#stmb-use-regex")){G.moduleSettings.useRegex=Q.target.checked,n();let J=Z.querySelector("#stmb-configure-regex");if(J)J.style.display=Q.target.checked?"":"none";return}if(Q.target.matches("#stmb-regex-outgoing")){try{let J=Array.from(Q.target.selectedOptions||[]).map((W)=>W.value);G.moduleSettings.selectedRegexOutgoing=J,n()}catch(J){console.warn("STMemoryBooks: failed to save selectedRegexOutgoing",J)}return}if(Q.target.matches("#stmb-regex-incoming")){try{let J=Array.from(Q.target.selectedOptions||[]).map((W)=>W.value);G.moduleSettings.selectedRegexIncoming=J,n()}catch(J){console.warn("STMemoryBooks: failed to save selectedRegexIncoming",J)}return}if(Q.target.matches("#stmb-import-file")){try{e4(Q,G,a1)}catch(J){console.error(`${V1}: Error in import profiles:`,J),toastr.error(U("Failed to import profiles","STMemoryBooks_FailedToImportProfiles"),"STMemoryBooks")}return}if(Q.target.matches("#stmb-allow-scene-overlap")){G.moduleSettings.allowSceneOverlap=Q.target.checked,n();return}if(Q.target.matches("#stmb-unhide-before-memory")){G.moduleSettings.unhideBeforeMemory=Q.target.checked,n();return}if(Q.target.matches("#stmb-manual-mode-enabled")){let J=Q.target.checked;if(J){G.moduleSettings.autoCreateLorebook=!1;let W=document.querySelector("#stmb-auto-create-lorebook");if(W)W.checked=!1}if(J){let W=b0?.[E8],q=m()||{};if(!q.manualLorebook){if(W){let Y=`
                            <h4 data-i18n="STMemoryBooks_ManualLorebookSetupTitle">Manual Lorebook Setup</h4>
                            <div class="world_entry_form_control">
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc1" data-i18n-params='{"name": "${W}"}'>You have a chat-bound lorebook "<strong>${W}</strong>".</p>
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc2">Would you like to use it for manual mode or select a different one?</p>
                            </div>
                        `;if(await new J1(Y,a.TEXT,"",{okButton:U("Use Chat-bound","STMemoryBooks_UseChatBound"),cancelButton:U("Select Different","STMemoryBooks_SelectDifferent")}).show()===p.AFFIRMATIVE)q.manualLorebook=W,Q1(),toastr.success(S`Manual lorebook set to "${W}"`,"STMemoryBooks");else if(!await T0(W)){Q.target.checked=!1;return}}else if(toastr.info(U("Please select a lorebook for manual mode","STMemoryBooks_PleaseSelectLorebookForManualMode"),"STMemoryBooks"),!await T0()){Q.target.checked=!1;return}}}G.moduleSettings.manualModeEnabled=Q.target.checked,n(),e5(),N6();return}if(Q.target.matches("#stmb-auto-hide-mode")){G.moduleSettings.autoHideMode=Q.target.value,delete G.moduleSettings.autoHideAllMessages,delete G.moduleSettings.autoHideLastMemory,n();return}if(Q.target.matches("#stmb-profile-select")){let J=parseInt(Q.target.value);if(J>=0&&J<G.profiles.length){let W=G.profiles[J],q=Z.querySelector("#stmb-summary-api"),Y=Z.querySelector("#stmb-summary-model"),z=Z.querySelector("#stmb-summary-temp"),V=Z.querySelector("#stmb-summary-title"),X=Z.querySelector("#stmb-summary-prompt");if(W.useDynamicSTSettings||W?.connection?.api==="current_st"){let j=l(),K=Z1();if(q)q.textContent=j.completionSource||"openai";if(Y)Y.textContent=K.model||U("Not Set","STMemoryBooks_NotSet");if(z)z.textContent=K.temperature||"0.7"}else{if(q)q.textContent=W.connection?.api||"openai";if(Y)Y.textContent=W.connection?.model||U("Not Set","STMemoryBooks_NotSet");if(z)z.textContent=W.connection?.temperature!==void 0?W.connection.temperature:"0.7"}if(V)V.textContent=W.titleFormat||G.titleFormat;if(X)X.textContent=await q7(W)}return}if(Q.target.matches("#stmb-title-format-select")){let J=Z.querySelector("#stmb-custom-title-format"),W=Z.querySelector("#stmb-summary-title");if(Q.target.value==="custom")J.classList.remove("displayNone"),J.focus();else if(J.classList.add("displayNone"),G.titleFormat=Q.target.value,n(),W)W.textContent=Q.target.value;return}if(Q.target.matches("#stmb-default-memory-count")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=0&&J<=20)G.moduleSettings.defaultMemoryCount=J,n();return}if(Q.target.matches("#stmb-auto-summary-enabled")){G.moduleSettings.autoSummaryEnabled=Q.target.checked,n();return}if(Q.target.matches("#stmb-auto-create-lorebook")){if(Q.target.checked){G.moduleSettings.manualModeEnabled=!1;let W=document.querySelector("#stmb-manual-mode-enabled");if(W)W.checked=!1}G.moduleSettings.autoCreateLorebook=Q.target.checked,n(),e5(),N6();return}if(Q.target.matches("#stmb-auto-summary-interval")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=10&&J<=200)G.moduleSettings.autoSummaryInterval=J,n();return}if(Q.target.matches("#stmb-auto-summary-buffer")){let J=parseInt(Q.target.value),W=Math.min(Math.max(isNaN(J)?0:J,0),50);G.moduleSettings.autoSummaryBuffer=W,n();return}}),Z.addEventListener("input",uG.debounce((Q)=>{let G=T1();if(Q.target.matches("#stmb-custom-title-format")){let J=Q.target.value.trim();if(J&&J.includes("000")){G.titleFormat=J,n();let W=Z.querySelector("#stmb-summary-title");if(W)W.textContent=J}return}if(Q.target.matches("#stmb-lorebook-name-template")){let J=Q.target.value.trim();if(J)G.moduleSettings.lorebookNameTemplate=J,n();return}if(Q.target.matches("#stmb-token-warning-threshold")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=1000&&J<=1e5)G.moduleSettings.tokenWarningThreshold=J,n();return}if(Q.target.matches("#stmb-unhidden-entries-count")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=0&&J<=50)G.moduleSettings.unhiddenEntriesCount=J,n();return}},1000))}function RJ(Z){try{let Q=Z.dlg,G=T1(),J=Q.querySelector("#stmb-always-use-default")?.checked??G.moduleSettings.alwaysUseDefault,W=Q.querySelector("#stmb-show-memory-previews")?.checked??G.moduleSettings.showMemoryPreviews,q=Q.querySelector("#stmb-show-notifications")?.checked??G.moduleSettings.showNotifications,Y=Q.querySelector("#stmb-unhide-before-memory")?.checked??G.moduleSettings.unhideBeforeMemory,z=Q.querySelector("#stmb-refresh-editor")?.checked??G.moduleSettings.refreshEditor,V=Q.querySelector("#stmb-allow-scene-overlap")?.checked??G.moduleSettings.allowSceneOverlap,X=Q.querySelector("#stmb-auto-hide-mode")?.value??T6(G.moduleSettings),j=Q.querySelector("#stmb-token-warning-threshold"),K=j?parseInt(j.value)||30000:G.moduleSettings.tokenWarningThreshold||30000,F=Q.querySelector("#stmb-default-memory-count"),H=F?parseInt(F.value)||0:G.moduleSettings.defaultMemoryCount||0,B=Q.querySelector("#stmb-unhidden-entries-count"),A=B?parseInt(B.value)||0:G.moduleSettings.unhiddenEntriesCount||0,T=Q.querySelector("#stmb-manual-mode-enabled")?.checked??G.moduleSettings.manualModeEnabled,R=Q.querySelector("#stmb-auto-summary-enabled")?.checked??G.moduleSettings.autoSummaryEnabled,N=Q.querySelector("#stmb-auto-summary-interval"),M=N?parseInt(N.value)||50:G.moduleSettings.autoSummaryInterval||50,E=Q.querySelector("#stmb-auto-summary-buffer"),y=E?Math.min(Math.max(parseInt(E.value)||0,0),50):Math.min(Math.max(G.moduleSettings.autoSummaryBuffer||0,0),50),C=Q.querySelector("#stmb-auto-create-lorebook")?.checked??G.moduleSettings.autoCreateLorebook;if(J!==G.moduleSettings.alwaysUseDefault||W!==G.moduleSettings.showMemoryPreviews||q!==G.moduleSettings.showNotifications||Y!==G.moduleSettings.unhideBeforeMemory||z!==G.moduleSettings.refreshEditor||K!==G.moduleSettings.tokenWarningThreshold||H!==G.moduleSettings.defaultMemoryCount||T!==G.moduleSettings.manualModeEnabled||V!==G.moduleSettings.allowSceneOverlap||X!==T6(G.moduleSettings)||A!==G.moduleSettings.unhiddenEntriesCount||R!==G.moduleSettings.autoSummaryEnabled||M!==G.moduleSettings.autoSummaryInterval||y!==G.moduleSettings.autoSummaryBuffer||C!==G.moduleSettings.autoCreateLorebook)G.moduleSettings.alwaysUseDefault=J,G.moduleSettings.showMemoryPreviews=W,G.moduleSettings.showNotifications=q,G.moduleSettings.unhideBeforeMemory=Y,G.moduleSettings.refreshEditor=z,G.moduleSettings.tokenWarningThreshold=K,G.moduleSettings.defaultMemoryCount=H,G.moduleSettings.manualModeEnabled=T,G.moduleSettings.allowSceneOverlap=V,G.moduleSettings.autoHideMode=X,delete G.moduleSettings.autoHideAllMessages,delete G.moduleSettings.autoHideLastMemory,G.moduleSettings.unhiddenEntriesCount=A,G.moduleSettings.autoSummaryEnabled=R,G.moduleSettings.autoSummaryInterval=M,G.moduleSettings.autoSummaryBuffer=y,G.moduleSettings.autoCreateLorebook=C,n()}catch(Q){console.error("STMemoryBooks: Failed to save settings:",Q),toastr.warning(U("Failed to save settings. Please try again.","STMemoryBooks_FailedToSaveSettings"),"STMemoryBooks")}d=null}async function a1(){if(!d||!d.dlg.hasAttribute("open"))return;try{let Z=T1(),Q=await B8(),G=Z.profiles[Z.defaultProfile],J=m(),W=Z.moduleSettings.manualModeEnabled,q=b0?.[E8]||null,Y=J?.manualLorebook||null,z={hasScene:!!Q,sceneData:Q,highestMemoryProcessed:J?.highestMemoryProcessed,alwaysUseDefault:Z.moduleSettings.alwaysUseDefault,showMemoryPreviews:Z.moduleSettings.showMemoryPreviews,showNotifications:Z.moduleSettings.showNotifications,unhideBeforeMemory:Z.moduleSettings.unhideBeforeMemory||!1,refreshEditor:Z.moduleSettings.refreshEditor,allowSceneOverlap:Z.moduleSettings.allowSceneOverlap,manualModeEnabled:Z.moduleSettings.manualModeEnabled,lorebookMode:W?"Manual":"Automatic (Chat-bound)",currentLorebookName:W?Y:q,manualLorebookName:Y,chatBoundLorebookName:q,availableLorebooks:A6||[],autoHideMode:T6(Z.moduleSettings),unhiddenEntriesCount:Z.moduleSettings.unhiddenEntriesCount||0,tokenWarningThreshold:Z.moduleSettings.tokenWarningThreshold||30000,defaultMemoryCount:Z.moduleSettings.defaultMemoryCount||0,autoSummaryEnabled:Z.moduleSettings.autoSummaryEnabled||!1,autoSummaryInterval:Z.moduleSettings.autoSummaryInterval||50,autoSummaryBuffer:Z.moduleSettings.autoSummaryBuffer||0,autoCreateLorebook:Z.moduleSettings.autoCreateLorebook||!1,lorebookNameTemplate:Z.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",profiles:Z.profiles.map((K,F)=>({...K,name:K?.connection?.api==="current_st"?U("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):K.name,isDefault:F===Z.defaultProfile})),titleFormat:Z.titleFormat,titleFormats:$0().map((K)=>({value:K,isSelected:K===Z.titleFormat})),showCustomInput:!$0().includes(Z.titleFormat),selectedProfile:{...G,connection:G.useDynamicSTSettings||G?.connection?.api==="current_st"?(()=>{let K=l(),F=Z1();return{api:K.completionSource||"openai",model:F.model||"Not Set",temperature:F.temperature||0.7}})():{api:G.connection?.api||"openai",model:G.connection?.model||"gpt-4.1",temperature:G.connection?.temperature!==void 0?G.connection.temperature:0.7},titleFormat:G.titleFormat||Z.titleFormat,effectivePrompt:G.prompt&&G.prompt.trim()?G.prompt:G.preset?await e1(G.preset):k1()}},V=V8.sanitize($Z(z));d.content.innerHTML=V;let X=d.content.querySelector("#stmb-profile-select");if(X)X.value=Z.defaultProfile,X.dispatchEvent(new Event("change"));let j=["wide_dialogue_popup","large_dialogue_popup","vertical_scrolling_dialogue_popup"];d.dlg.classList.add(...j),d.content.style.overflowY="auto",N6()}catch(Z){console.error("STMemoryBooks: Error refreshing popup content:",Z)}}function j7(){let Z=document.querySelectorAll("#chat .mes[mesid]");if(Z.length>0){let Q=0;Z.forEach((G)=>{if(!G.querySelector(".mes_stmb_start"))u8(G),Q++}),g8()}}function AJ(){let Z=z8.fromProps({name:"creatememory",callback:sG,helpString:U("Create memory from marked scene","STMemoryBooks_Slash_CreateMemory_Help")}),Q=z8.fromProps({name:"scenememory",callback:rG,helpString:U("Set scene range and create memory (e.g., /scenememory 10-15)","STMemoryBooks_Slash_SceneMemory_Help"),unnamedArgumentList:[B6.fromProps({description:U("Message range (X-Y format)","STMemoryBooks_Slash_SceneMemory_ArgRangeDesc"),typeList:[H6.STRING],isRequired:!0})]}),G=z8.fromProps({name:"nextmemory",callback:aG,helpString:U("Create memory from end of last memory to current message","STMemoryBooks_Slash_NextMemory_Help")}),J=z8.fromProps({name:"sideprompt",callback:tG,helpString:U('Run side prompt. Usage: /sideprompt "Name" [X-Y]',"STMemoryBooks_Slash_SidePrompt_Help"),unnamedArgumentList:[B6.fromProps({description:U("Template name (quote if contains spaces), optionally followed by X-Y range","STMemoryBooks_Slash_SidePrompt_ArgDesc"),typeList:[H6.STRING],isRequired:!0,enumProvider:EZ})]}),W=z8.fromProps({name:"sideprompt-on",callback:eG,helpString:U('Enable a Side Prompt by name or all. Usage: /sideprompt-on "Name" | all',"STMemoryBooks_Slash_SidePromptOn_Help"),unnamedArgumentList:[B6.fromProps({description:U('Template name (quote if contains spaces) or "all"',"STMemoryBooks_Slash_SidePromptOn_ArgDesc"),typeList:[H6.STRING],isRequired:!0,enumProvider:()=>[new bZ("all"),...EZ()]})]}),q=z8.fromProps({name:"sideprompt-off",callback:ZJ,helpString:U('Disable a Side Prompt by name or all. Usage: /sideprompt-off "Name" | all',"STMemoryBooks_Slash_SidePromptOff_Help"),unnamedArgumentList:[B6.fromProps({description:U('Template name (quote if contains spaces) or "all"',"STMemoryBooks_Slash_SidePromptOff_ArgDesc"),typeList:[H6.STRING],isRequired:!0,enumProvider:()=>[new bZ("all"),...EZ()]})]});Y8.addCommandObject(Z),Y8.addCommandObject(Q),Y8.addCommandObject(G),Y8.addCommandObject(J),Y8.addCommandObject(W),Y8.addCommandObject(q)}function TJ(){let Z=$(`
        <div id="stmb-menu-item-container" class="extension_container interactable" tabindex="0">
            <div id="stmb-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-book extensionsMenuExtensionButton"></div>
                <span data-i18n="STMemoryBooks_MenuItem">Memory Books</span>
            </div>
        </div>
        `),Q=$("#extensionsMenu");if(Q.length>0)Q.append(Z),j8(Z[0]);else console.warn("STMemoryBooks: Extensions menu not found - retrying initialization")}function NJ(){$(document).on("click",o1.menuItem,BJ),r1.on(F0.CHAT_CHANGED,lG),r1.on(F0.MESSAGE_DELETED,(Q)=>{let G=T1();lZ(Q,G)}),r1.on(F0.MESSAGE_RECEIVED,oG),r1.on(F0.GROUP_WRAPPER_FINISHED,nG),r1.on(F0.GENERATION_STARTED,(Q,G,J)=>{t5=J||!1;try{if(X8)toastr.clear(X8)}catch(W){}X8=null,R6=null});let Z=Object.values(o1).filter((Q)=>Q.includes("model_")||Q.includes("temp_")).join(", ");r1.on(F0.GENERATE_AFTER_DATA,(Q)=>{if(t5)return;if(E1&&O6){let G=O6.effectiveConnection||O6.connection||{},W={openai:"openai",claude:"claude",openrouter:"openrouter",ai21:"ai21",makersuite:"makersuite",google:"makersuite",vertexai:"vertexai",mistralai:"mistralai",custom:"custom",cohere:"cohere",perplexity:"perplexity",groq:"groq",nanogpt:"nanogpt",deepseek:"deepseek",electronhub:"electronhub",aimlapi:"aimlapi",xai:"xai",pollinations:"pollinations",moonshot:"moonshot",fireworks:"fireworks",cometapi:"cometapi",azure_openai:"azure_openai",zai:"zai",siliconflow:"siliconflow"}[G.api]||"openai";if(Q.chat_completion_source=W,Q.include_reasoning=!1,G.model)Q.model=G.model;if(typeof G.temperature==="number")Q.temperature=G.temperature}}),window.addEventListener("beforeunload",iG)}function DJ(Z){try{let Q=(K)=>b(String(K||"")),G=Z?.code?Q(Z.code):"",J=Q(Z?.message||"Unknown error"),W=typeof Z?.rawResponse==="string"?Z.rawResponse:"",q=typeof Z?.providerBody==="string"?Z.providerBody:"",Y=1e5,z=W&&W.length>1e5?W.slice(0,1e5)+`
…(truncated)…`:W,V="";if(V+=`<h3>${Q(U("Review Failed AI Response","STMemoryBooks_ReviewFailedAI_Title"))}</h3>`,V+='<div class="world_entry_form_control">',V+=`<div><strong>${Q(U("Error","STMemoryBooks_ReviewFailedAI_ErrorLabel"))}:</strong> ${J}</div>`,G)V+=`<div><strong>${Q(U("Code","STMemoryBooks_ReviewFailedAI_CodeLabel"))}:</strong> ${G}</div>`;if(V+="</div>",W)V+='<div class="world_entry_form_control">',V+=`<h4>${Q(U("Raw AI Response","STMemoryBooks_ReviewFailedAI_RawLabel"))}</h4>`,V+=`<pre class="text_pole" style="white-space: pre-wrap; max-height: 300px; overflow:auto;"><code>${b(z)}</code></pre>`,V+=`<div class="buttons_block gap10px"><button id="stmb-copy-raw" class="menu_button">${Q(U("Copy Raw","STMemoryBooks_ReviewFailedAI_CopyRaw"))}</button></div>`,V+="</div>";else V+=`<div class="world_entry_form_control opacity70p">${Q(U("No raw response was captured.","STMemoryBooks_ReviewFailedAI_NoRaw"))}</div>`;if(q)V+='<div class="world_entry_form_control">',V+=`<h4>${Q(U("Provider Error Body","STMemoryBooks_ReviewFailedAI_ProviderBody"))}</h4>`,V+=`<pre class="text_pole" style="white-space: pre-wrap; max-height: 200px; overflow:auto;"><code>${b(q)}</code></pre>`,V+=`<div class="buttons_block gap10px"><button id="stmb-copy-provider" class="menu_button">${Q(U("Copy Provider Body","STMemoryBooks_ReviewFailedAI_CopyProvider"))}</button></div>`,V+="</div>";let X=new J1(V8.sanitize(V),a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:U("Close","STMemoryBooks_Close")}),j=X.dlg;j.querySelector("#stmb-copy-raw")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(W),toastr.success(U("Copied raw response","STMemoryBooks_CopiedRaw"),"STMemoryBooks")}catch{toastr.error(U("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),j.querySelector("#stmb-copy-provider")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(q),toastr.success(U("Copied provider body","STMemoryBooks_CopiedProvider"),"STMemoryBooks")}catch{toastr.error(U("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),X.show()}catch(Q){console.error("STMemoryBooks: Failed to show failed AI response popup:",Q)}}async function J7(){if(a5)return;a5=!0,console.log("STMemoryBooks: Initializing");try{let W=dG?.()||"en";try{let q=await r5(W);if(q)SZ(W,q)}catch(q){console.warn("STMemoryBooks: Failed to load JSON locale bundle:",q)}if(E0&&typeof E0==="object"){if(E0[W])SZ(W,E0[W]);if(W!=="en"&&E0.en)SZ(W,Object.fromEntries(Object.entries(E0.en).filter(([q])=>!0)))}}catch(W){console.warn("STMemoryBooks: Failed to merge plugin locales:",W)}let Z=0,Q=20;while(Z<Q){if($(o1.extensionsMenu).length>0&&r1&&typeof J1<"u")break;await new Promise((W)=>setTimeout(W,500)),Z++}TJ();try{j8()}catch(W){}let G=T1(),J=JZ(G);if(!J.valid){if(console.warn("STMemoryBooks: Profile validation issues found:",J.issues),J.fixes.length>0)n()}m8(),z7();try{pG()}catch(W){console.error("STMemoryBooks: Failed to initialize chat observer:",W),toastr.error(U("STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.","STMemoryBooks_FailedToInitializeChatMonitoring"),"STMemoryBooks");return}NJ(),await fZ(),AJ();try{j7(),console.log("STMemoryBooks: Processed existing messages during initialization")}catch(W){console.error("STMemoryBooks: Error processing existing messages during init:",W)}mG.registerHelper("eq",function(W,q){return W===q}),console.log("STMemoryBooks: Extension loaded successfully")}function _J(){let Z=[];try{(W7({allowedOnly:!1})||[]).forEach((G,J)=>{let W=`idx:${J}`,q=`${G?.scriptName||"Untitled"}${G?.disabled?" (disabled)":""}`;Z.push({key:W,label:q})})}catch(Q){console.warn("STMemoryBooks: buildFlatRegexOptions failed",Q)}return Z}async function IJ(){let Z=T1(),Q=_J(),G=Array.isArray(Z.moduleSettings.selectedRegexOutgoing)?Z.moduleSettings.selectedRegexOutgoing:[],J=Array.isArray(Z.moduleSettings.selectedRegexIncoming)?Z.moduleSettings.selectedRegexIncoming:[],W="";W+='<h3 data-i18n="STMemoryBooks_RegexSelection_Title">\uD83D\uDCD0 Regex selection</h3>',W+='<div class="world_entry_form_control"><small class="opacity70p" data-i18n="STMemoryBooks_RegexSelection_Desc">Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.</small></div>',W+='<div class="world_entry_form_control">',W+='<h4 data-i18n="STMemoryBooks_RegexSelection_Outgoing">Run regex before sending to AI</h4>',W+='<select id="stmb-regex-outgoing" multiple style="width:100%">';for(let z of Q){let V=G.includes(z.key)?" selected":"";W+=`<option value="${b(z.key)}"${V}>${b(z.label)}</option>`}W+="</select>",W+="</div>",W+='<div class="world_entry_form_control">',W+='<h4 data-i18n="STMemoryBooks_RegexSelection_Incoming">Run regex before adding to lorebook (before previews)</h4>',W+='<select id="stmb-regex-incoming" multiple style="width:100%">';for(let z of Q){let V=J.includes(z.key)?" selected":"";W+=`<option value="${b(z.key)}"${V}>${b(z.label)}</option>`}W+="</select>",W+="</div>";let q=new J1(W,a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:U("Save","STMemoryBooks_Save"),cancelButton:U("Close","STMemoryBooks_Close")});try{j8(q.dlg)}catch(z){}if(setTimeout(()=>{try{if(window.jQuery&&typeof window.jQuery.fn.select2==="function"){let z=window.jQuery(q.dlg);window.jQuery("#stmb-regex-outgoing").select2({width:"100%",placeholder:U("Select outgoing regex…","STMemoryBooks_RegexSelect_PlaceholderOutgoing"),closeOnSelect:!1,dropdownParent:z}),window.jQuery("#stmb-regex-incoming").select2({width:"100%",placeholder:U("Select incoming regex…","STMemoryBooks_RegexSelect_PlaceholderIncoming"),closeOnSelect:!1,dropdownParent:z})}}catch(z){console.warn("STMemoryBooks: Select2 initialization failed (using native selects)",z)}},0),await q.show()===p.AFFIRMATIVE)try{let z=Array.from(q.dlg?.querySelector("#stmb-regex-outgoing")?.selectedOptions||[]).map((X)=>X.value),V=Array.from(q.dlg?.querySelector("#stmb-regex-incoming")?.selectedOptions||[]).map((X)=>X.value);Z.moduleSettings.selectedRegexOutgoing=z,Z.moduleSettings.selectedRegexIncoming=V,n(),toastr.success(U("Regex selections saved","STMemoryBooks_RegexSelectionsSaved"),"STMemoryBooks")}catch(z){console.warn("STMemoryBooks: Failed to save regex selections",z),toastr.error(U("Failed to save regex selections","STMemoryBooks_FailedToSaveRegexSelections"),"STMemoryBooks")}}$(document).ready(()=>{if(r1&&F0.APP_READY)r1.on(F0.APP_READY,J7);setTimeout(J7,2000)});export{kZ as validateLorebook,i4 as isMemoryProcessing,O6 as currentProfile};

//# debugId=2F892EA985C0F90164756E2164756E21
