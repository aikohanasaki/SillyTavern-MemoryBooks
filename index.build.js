var D7=Object.create;var{getPrototypeOf:_7,defineProperty:T8,getOwnPropertyNames:eZ,getOwnPropertyDescriptor:I7}=Object,Z4=Object.prototype.hasOwnProperty;var x6=(Z,Q,G)=>{G=Z!=null?D7(_7(Z)):{};let J=Q||!Z||!Z.__esModule?T8(G,"default",{value:Z,enumerable:!0}):G;for(let W of eZ(Z))if(!Z4.call(J,W))T8(J,W,{get:()=>Z[W],enumerable:!0});return J},tZ=new WeakMap,w7=(Z)=>{var Q=tZ.get(Z),G;if(Q)return Q;if(Q=T8({},"__esModule",{value:!0}),Z&&typeof Z==="object"||typeof Z==="function")eZ(Z).map((J)=>!Z4.call(Q,J)&&T8(Q,J,{get:()=>Z[J],enumerable:!(G=I7(Z,J))||G.enumerable}));return tZ.set(Z,Q),Q},p0=(Z,Q)=>()=>(Q||Z((Q={exports:{}}).exports,Q),Q.exports);var Q4=(Z,Q)=>{for(var G in Q)T8(Z,G,{get:Q[G],enumerable:!0,configurable:!0,set:(J)=>Q[G]=()=>J})};var H0=(Z,Q)=>()=>(Z&&(Q=Z(Z=0)),Q);var G4=((Z)=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(Z,{get:(Q,G)=>(typeof require<"u"?require:Q)[G]}):Z)(function(Z){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+Z+'" is not supported')});var c8,x1,S6,i0,n1,R8,p8,d$,c$;var O0=H0(()=>{c8={MAX_RETRIES:2,RETRY_DELAY_MS:2000,TOKEN_WARNING_THRESHOLD_DEFAULT:50000,DEFAULT_MEMORY_COUNT:0},x1={MAX_SCAN_RANGE:100,MAX_AFFECTED_MESSAGES:200,BUTTON_UPDATE_DEBOUNCE_MS:50,VALIDATION_DELAY_MS:500},S6={INPUT_DEBOUNCE_MS:1000,CHAT_OBSERVER_DEBOUNCE_MS:50},i0={PROMPTS_FILE:"stmb-summary-prompts.json",SIDE_PROMPTS_FILE:"stmb-side-prompts.json",ARC_PROMPTS_FILE:"stmb-arc-prompts.json"},n1={CURRENT_VERSION:1},R8={summary:"Summary - Detailed beat-by-beat summaries in narrative prose",summarize:"Summarize - Bullet-point format",synopsis:"Synopsis - Long and comprehensive (beats, interactions, details) with headings",sumup:"Sum Up - Concise story beats in narrative prose",minimal:"Minimal - Brief 1-2 sentence summary",northgate:"Northgate - Intended for creative writing. By Northgate on ST Discord",aelemar:"Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord",comprehensive:"Comprehensive - Synopsis plus improved keywords extraction"},p8={summary:"STMemoryBooks_DisplayName_summary",summarize:"STMemoryBooks_DisplayName_summarize",synopsis:"STMemoryBooks_DisplayName_synopsis",sumup:"STMemoryBooks_DisplayName_sumup",minimal:"STMemoryBooks_DisplayName_minimal",northgate:"STMemoryBooks_DisplayName_northgate",aelemar:"STMemoryBooks_DisplayName_aelemar",comprehensive:"STMemoryBooks_DisplayName_comprehensive"},d$=x1.MAX_SCAN_RANGE,c$=x1.MAX_AFFECTED_MESSAGES});import{chat as o0,chat_metadata as l$}from"../../../../script.js";import{saveMetadataDebounced as L7,getContext as C7}from"../../../extensions.js";import{t as a$,translate as w1}from"../../../i18n.js";function g(){let Q=C7().chatMetadata;if(!Q)return{sceneStart:null,sceneEnd:null};if(!Q.STMemoryBooks)Q.STMemoryBooks={};return Q.STMemoryBooks.sceneStart=V1.start??Q.STMemoryBooks.sceneStart??null,Q.STMemoryBooks.sceneEnd=V1.end??Q.STMemoryBooks.sceneEnd??null,Q.STMemoryBooks}function Z1(){L7()}function J4(){let Q=g()?.highestMemoryProcessed;return Number.isFinite(Q)?Q:null}function i8(Z,Q,G,J){let W=h7(Z,Q,G,J);if(W.needsFullUpdate){l8();return}if(W.min===null||W.max===null)return;let q="#chat .mes[mesid]",z=document.querySelectorAll(q),Y=Array.from(z).filter((V)=>{let X=parseInt(V.getAttribute("mesid")),K=W.min!==null?X>=W.min:!0,j=W.max!==null&&W.max!==void 0?X<=W.max:!0;return K&&j});if(Y.length>0){let V=g();b6(Y,V)}}function h7(Z,Q,G,J){let W=new Set;if(Z!==null&&Q!==null)for(let z=Z;z<=Q;z++)W.add(z);if(Z!==null)W.add(Z);if(Q!==null)W.add(Q);if(G!==null&&J!==null)for(let z=G;z<=J;z++)W.add(z);if(G!==null)W.add(G);if(J!==null)W.add(J);if(G!==null&&J===null){let z=Math.min(G+x1.MAX_SCAN_RANGE,o0.length-1);for(let Y=G+1;Y<=z;Y++)W.add(Y)}if(J!==null&&G===null){let z=Math.max(J-x1.MAX_SCAN_RANGE,0);for(let Y=z;Y<J;Y++)W.add(Y)}if(Z!==null&&Q===null&&G!==null&&J!==null){let z=Math.min(Z+x1.MAX_SCAN_RANGE,o0.length-1);for(let Y=J+1;Y<=z;Y++)W.add(Y)}if(Q!==null&&Z===null&&G!==null&&J!==null){let z=Math.max(Q-x1.MAX_SCAN_RANGE,0);for(let Y=z;Y<G;Y++)W.add(Y)}if(W.size===0)return{min:null,max:null,needsFullUpdate:!1};if(W.size>x1.MAX_AFFECTED_MESSAGES)return{needsFullUpdate:!0};let q=Array.from(W).sort((z,Y)=>z-Y);return{min:q[0],max:q[q.length-1],needsFullUpdate:!1}}function $4(Z,Q){let G=g(),J=G.sceneStart??null,W=G.sceneEnd??null,q=M7(G,Z,Q);return G.sceneStart=q.start,G.sceneEnd=q.end,V1.start=q.start,V1.end=q.end,Z1(),i8(J,W,q.start,q.end),Promise.resolve()}function E6(Z,Q){let G=g(),J=G.sceneStart??null,W=G.sceneEnd??null,q=Number(Z),z=Number(Q);G.sceneStart=q,G.sceneEnd=z,V1.start=q,V1.end=z,Z1(),i8(J,W,q,z)}function n0(){let Z=g(),Q=Z.sceneStart??null,G=Z.sceneEnd??null;Z.sceneStart=null,Z.sceneEnd=null,V1.start=null,V1.end=null,Z1(),l8()}function l8(){let Z=g(),Q=document.querySelectorAll("#chat .mes[mesid]");b6(Q,Z)}function W4(Z){if(!Z||Z.length===0)return;let Q=g();b6(Z,Q)}function b6(Z,Q){let{sceneStart:G,sceneEnd:J}=Q;Z.forEach((W)=>{let q=parseInt(W.getAttribute("mesid")),z=W.querySelector(".mes_stmb_start"),Y=W.querySelector(".mes_stmb_end");if(!z||!Y)return;if(z.classList.remove("on","valid-start-point","in-scene"),Y.classList.remove("on","valid-end-point","in-scene"),G!=null&&J!=null){if(q===G)z.classList.add("on");else if(q===J)Y.classList.add("on");else if(q>G&&q<J)z.classList.add("in-scene"),Y.classList.add("in-scene")}else if(G!=null){if(q===G)z.classList.add("on");else if(q>G)Y.classList.add("valid-end-point")}else if(J!=null){if(q===J)Y.classList.add("on");else if(q<J)z.classList.add("valid-start-point")}})}function l0(){let Z=g(),Q=Z.sceneStart??null,G=Z.sceneEnd??null,J=!1,W=o0.length;if(W===0){if(Z.sceneStart!==null||Z.sceneEnd!==null)Z.sceneStart=null,Z.sceneEnd=null,J=!0}else{if(Z.sceneStart!==null&&Z.sceneStart<0)Z.sceneStart=null,J=!0;if(Z.sceneEnd!==null&&Z.sceneEnd<0)Z.sceneEnd=null,J=!0;if(Z.sceneStart!==null&&Z.sceneStart>=W)Z.sceneStart=null,J=!0;if(Z.sceneEnd!==null&&Z.sceneEnd>=W)Z.sceneEnd=W-1,J=!0;if(Z.sceneStart!==null&&Z.sceneEnd!==null&&Z.sceneStart>Z.sceneEnd)Z.sceneStart=null,Z.sceneEnd=null,J=!0}if(J)V1.start=Z.sceneStart,V1.end=Z.sceneEnd,Z1(),i8(Q,G,Z.sceneStart,Z.sceneEnd)}function q4(Z,Q){let G=Number(Z);if(!Number.isFinite(G))return;let J=g(),W=J.sceneStart??null,q=J.sceneEnd??null,z=J.sceneStart,Y=J.sceneEnd,V="";if(z===G&&Y===G){if(n0(),Q?.moduleSettings?.showNotifications)toastr.warning(w1("Scene cleared due to start marker deletion","STMemoryBooks_Toast_SceneClearedStart"),"STMemoryBooks");l0();return}if(z!=null&&Y!=null){if(G<z)z--,Y--,V=w1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===z){if(z=null,Y!=null&&Y>G)Y--;V=w1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(G>z&&G<Y)Y--,V=w1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===Y)Y=null,V=w1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(z!=null){if(G<z)z--,V=w1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===z)z=null,V=w1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else if(Y!=null){if(G<Y)Y--,V=w1("Scene markers adjusted due to message deletion.","STMemoryBooks_Toast_SceneMarkersAdjusted");else if(G===Y)Y=null,V=w1("Scene end point cleared due to message deletion","STMemoryBooks_Toast_SceneEndPointCleared")}else{l0();return}let X=o0.length;if(X===0)z=null,Y=null;else{if(z!=null&&(z<0||z>=X))z=null;if(Y!=null&&(Y<0||Y>=X))Y=X-1;if(z!=null&&Y!=null&&z>Y)z=null,Y=null}if(z!==J.sceneStart||Y!==J.sceneEnd){if(J.sceneStart=z,J.sceneEnd=Y,V1.start=z,V1.end=Y,Z1(),i8(W,q,z,Y),V&&Q?.moduleSettings?.showNotifications)toastr.warning(V,"STMemoryBooks")}l0()}function o8(Z){let Q=parseInt(Z.getAttribute("mesid")),G=Z.querySelector(".extraMesButtons");if(!G){G=document.createElement("div"),G.classList.add("extraMesButtons");let q=Z.querySelector(".mes_block");if(q)q.appendChild(G);else Z.appendChild(G)}if(Z.querySelector(".mes_stmb_start"))return;let J=document.createElement("div");J.title=w1("Mark Scene Start","STMemoryBooks_MarkSceneStart"),J.classList.add("mes_stmb_start","mes_button","fa-solid","fa-caret-right","interactable"),J.setAttribute("tabindex","0"),J.setAttribute("data-i18n","[title]STMemoryBooks_MarkSceneStart");let W=document.createElement("div");W.title=w1("Mark Scene End","STMemoryBooks_MarkSceneEnd"),W.classList.add("mes_stmb_end","mes_button","fa-solid","fa-caret-left","interactable"),W.setAttribute("tabindex","0"),W.setAttribute("data-i18n","[title]STMemoryBooks_MarkSceneEnd"),J.addEventListener("click",(q)=>{q.stopPropagation(),$4(Q,"start")}),W.addEventListener("click",(q)=>{q.stopPropagation(),$4(Q,"end")}),G.appendChild(J),G.appendChild(W)}async function D8(){let Z=g();if(Z.sceneStart===null||Z.sceneEnd===null)return null;let Q=o0[Z.sceneStart],G=o0[Z.sceneEnd];if(!Q||!G)return null;let J=(W)=>{let q=W.mes||"";return q.length>100?q.substring(0,100)+"...":q};try{let W=a0(Z.sceneStart,Z.sceneEnd),q=r0(W),z=await y6(q);return{sceneStart:Z.sceneStart,sceneEnd:Z.sceneEnd,startExcerpt:J(Q),endExcerpt:J(G),startSpeaker:Q.name||"Unknown",endSpeaker:G.name||"Unknown",messageCount:Z.sceneEnd-Z.sceneStart+1,estimatedTokens:z}}catch(W){console.warn("STMemoryBooks-SceneManager: getSceneData failed:",W);try{if((W?.message||"").includes("No visible messages"))toastr?.warning?.(w1("Selected range has no visible messages. Adjust start/end.","STMemoryBooks_NoVisibleMessages"),"STMemoryBooks")}catch{}return null}}function M7(Z,Q,G){let J=parseInt(Q),W=Z.sceneStart,q=Z.sceneEnd;if(G==="start"){if(Z.sceneEnd!==null&&(Z.sceneEnd??null)<J)q=null;W=Z.sceneStart===J?null:J}else if(G==="end"){if(Z.sceneStart!==null&&(Z.sceneStart??null)>J)W=null;q=Z.sceneEnd===J?null:J}return{start:W,end:q}}function n8(){let Z=g();V1.start=Z.sceneStart,V1.end=Z.sceneEnd}function Y4(){return{...V1}}var V1;var s0=H0(()=>{s8();O0();V1={start:null,end:null}});import{getRequestHeaders as X4}from"../../../../script.js";import{translate as v7}from"../../../i18n.js";function _8(Z){return Z.replace(/\w\S*/g,(Q)=>{return Q.charAt(0).toUpperCase()+Q.slice(1).toLowerCase()})}function S7(Z){return Z.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)}function z4(Z){let Q=Z.split(`
`).filter((G)=>G.trim());if(Q.length>0){let J=Q[0].trim().replace(/^(You are|Analyze|Create|Generate|Write)\s+/i,"").replace(/[:.]/g,"").trim();return _8(J.substring(0,50))}return"Custom Prompt"}function k6(Z,Q){let G=S7(Z),J=G,W=2,q=N0();while(J in Q||J in q)J=`${G}-${W}`,W++;return J}async function s1(Z=null){if(t0)return t0;let Q=!1,G=null;try{let J=await fetch(`/user/files/${V4}`,{method:"GET",credentials:"include",headers:X4()});if(!J.ok)Q=!0;else{let W=await J.text();if(G=JSON.parse(W),!K4(G))Q=!0}}catch(J){Q=!0}if(Q){let J={},W=new Date().toISOString(),q=N0();for(let[z,Y]of Object.entries(q))J[z]={displayName:f6[z]||_8(z),prompt:Y,createdAt:W};if(Z&&Z.profiles&&Array.isArray(Z.profiles)){for(let z of Z.profiles)if(z.prompt&&z.prompt.trim()){let Y=`Custom: ${z.name||"Unnamed Profile"}`,V=k6(Y,J);J[V]={displayName:Y,prompt:z.prompt,createdAt:W},console.log(`${N1}: Migrated custom prompt from profile "${z.name}" as "${V}"`)}}G={version:n1.CURRENT_VERSION,overrides:J},await e0(G)}return t0=G,t0}async function e0(Z){try{let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:X4(),body:JSON.stringify({name:V4,data:G})});if(!J.ok)throw Error(`Failed to save prompts: ${J.statusText}`);t0=Z,console.log(`${N1}: Prompts saved successfully`)}catch(Q){throw console.error(`${N1}: Error saving overrides:`,Q),Q}}function K4(Z){if(!Z||typeof Z!=="object")return console.error(`${N1}: Invalid data type`),!1;if(typeof Z.version!=="number")return console.error(`${N1}: Invalid schema version type: ${Z.version}`),!1;if(Z.version!==n1.CURRENT_VERSION)console.warn(`${N1}: Unexpected schema version: ${Z.version} (expected ${n1.CURRENT_VERSION})`);if(!Z.overrides||typeof Z.overrides!=="object")return console.error(`${N1}: Missing or invalid overrides object`),!1;for(let[Q,G]of Object.entries(Z.overrides)){if(!G||typeof G!=="object")return console.error(`${N1}: Invalid override entry for key: ${Q}`),!1;if(typeof G.prompt!=="string"||!G.prompt.trim())return console.error(`${N1}: Invalid or empty prompt for key: ${Q}`),!1;if(G.displayName!==void 0&&typeof G.displayName!=="string")return console.error(`${N1}: Invalid displayName for key: ${Q}`),!1}return!0}async function Z8(Z){return await s1(Z),P7=!0,x7=null,!0}async function A0(Z=null){let Q=await s1(Z),G=[];for(let[W,q]of Object.entries(Q.overrides))G.push({key:W,displayName:q.displayName||_8(W),createdAt:q.createdAt||null});let J=N0()||{};for(let W of Object.keys(J))if(!(W in Q.overrides))G.push({key:W,displayName:f6[W]||_8(W),createdAt:null});return G.sort((W,q)=>{if(!W.createdAt)return 1;if(!q.createdAt)return-1;return new Date(q.createdAt)-new Date(W.createdAt)}),G}async function G0(Z,Q=null){let G=await s1(Q);if(G.overrides[Z]){let W=G.overrides[Z].prompt;if(typeof W==="string"&&W.trim())return W}return N0()[Z]||d1()}async function g6(Z,Q=null){let G=await s1(Q);if(G.overrides[Z]&&G.overrides[Z].displayName)return G.overrides[Z].displayName;return f6[Z]||_8(Z)}async function I8(Z,Q,G){let J=await s1(),W=new Date().toISOString();if(!Z)Z=k6(G||z4(Q),J.overrides);if(J.overrides[Z])J.overrides[Z].prompt=Q,J.overrides[Z].displayName=G||J.overrides[Z].displayName,J.overrides[Z].updatedAt=W;else J.overrides[Z]={displayName:G||z4(Q),prompt:Q,createdAt:W};return await e0(J),Z}async function U4(Z){let Q=await s1(),G=Q.overrides[Z];if(!G)throw Error(`Preset "${Z}" not found`);let J=`${G.displayName} (Copy)`,W=k6(J,Q.overrides),q=new Date().toISOString();return Q.overrides[W]={displayName:J,prompt:G.prompt,createdAt:q},await e0(Q),W}async function j4(Z){let Q=await s1();if(!Q.overrides[Z])throw Error(`Preset "${Z}" not found`);delete Q.overrides[Z],await e0(Q)}async function F4(){let Z=await s1();return JSON.stringify(Z,null,2)}async function B4(Z){try{let Q=JSON.parse(Z);if(!K4(Q))throw Error("Invalid prompts file structure - see console for details");await e0(Q)}catch(Q){throw console.error(`${N1}: Error importing prompts:`,Q),Q}}async function H4(Z="overwrite"){if(Z!=="overwrite")console.warn(`${N1}: Unsupported mode for recreateBuiltInPrompts: ${Z}; defaulting to 'overwrite'`);let Q=await s1(),G=N0(),J=Object.keys(G||{}),W=0;if(Q&&Q.overrides&&typeof Q.overrides==="object"){for(let q of J)if(q in Q.overrides)delete Q.overrides[q],W++}return await e0(Q),t0=Q,console.log(`${N1}: Recreated built-in prompts (removed ${W} overrides)`),{removed:W}}var N1="STMemoryBooks-SummaryPromptManager",V4,t0=null,P7=!1,x7=null,f6;var r8=H0(()=>{S1();O0();V4=i0.PROMPTS_FILE,f6=Object.fromEntries(Object.keys(R8).map((Z)=>[Z,v7(R8[Z],p8[Z])]))});var D4={};Q4(D4,{validateProfile:()=>W8,showLorebookSelectionPopup:()=>T0,resolveEffectiveConnectionFromProfile:()=>i6,readIntInput:()=>W1,parseTemperature:()=>l6,normalizeCompletionSource:()=>Y1,isValidPreset:()=>d7,getUIModelSettings:()=>Q1,getPresetPrompt:()=>u7,getPresetNames:()=>m7,getEffectivePrompt:()=>R0,getEffectiveLorebookName:()=>J8,getDefaultPrompt:()=>d1,getCurrentModelSettings:()=>g7,getCurrentMemoryBooksContext:()=>$8,getCurrentApiInfo:()=>o,getBuiltInPresetPrompts:()=>N0,getApiSelectors:()=>p6,generateSafeProfileName:()=>D0,formatPresetDisplayName:()=>c7,estimateTokens:()=>$0,deepClone:()=>G8,createProfileObject:()=>_0,clampInt:()=>K1,SELECTORS:()=>r1});import{chat_metadata as Q8,characters as u6,name2 as m6,this_chid as d6}from"../../../../script.js";import{getContext as E7,extension_settings as A4}from"../../../extensions.js";import{selected_group as N4,groups as b7}from"../../../group-chats.js";import{METADATA_KEY as c6,world_names as a8}from"../../../world-info.js";import{Popup as T4,POPUP_TYPE as R4,POPUP_RESULT as t8}from"../../../popup.js";import{translate as c1}from"../../../i18n.js";function y7(...Z){for(let Q of Z){let G=L1(Q);if(G.length)return G}return L1()}function f7(){return document.querySelector("#group_chat_completion_source")?"#group_":"#"}function W1(Z,Q){if(!Z)return Q;let G=parseInt(Z.value,10);return Number.isFinite(G)?G:Q}function K1(Z,Q,G){return Math.min(Math.max(Z,Q),G)}function Y1(Z){let Q=String(Z||"").trim().toLowerCase();if(Q==="google")return"makersuite";return Q===""?"openai":Q}function o(){try{let Z="unknown",Q="unknown",G="unknown";if(typeof window.getGeneratingApi==="function")Z=window.getGeneratingApi();else Z=L1(r1.mainApi).val()||"unknown";if(typeof window.getGeneratingModel==="function")Q=window.getGeneratingModel();if(G=L1(r1.completionSource).val()||Z,!k7.includes(G))console.warn(`${p1}: Unsupported completion source: ${G}, falling back to openai`),G="openai";return{api:Z,model:Q,completionSource:G}}catch(Z){return console.warn(`${p1}: Error getting API info:`,Z),{api:L1(r1.mainApi).val()||"unknown",model:"unknown",completionSource:L1(r1.completionSource).val()||"openai"}}}function p6(){let Z=f7(),G=y7(`${Z}chat_completion_source`,"#chat_completion_source").val?.()||"openai",J={openai:`${Z}model_openai_select`,claude:`${Z}model_claude_select`,openrouter:`${Z}model_openrouter_select`,ai21:`${Z}model_ai21_select`,makersuite:`${Z}model_google_select`,mistralai:`${Z}model_mistralai_select`,custom:`${Z}model_custom_select`,cohere:`${Z}model_cohere_select`,perplexity:`${Z}model_perplexity_select`,groq:`${Z}model_groq_select`,nanogpt:`${Z}model_nanogpt_select`,deepseek:`${Z}model_deepseek_select`,electronhub:`${Z}model_electronhub_select`,vertexai:`${Z}model_vertexai_select`,aimlapi:`${Z}model_aimlapi_select`,xai:`${Z}model_xai_select`,pollinations:`${Z}model_pollinations_select`,moonshot:`${Z}model_moonshot_select`,fireworks:`${Z}model_fireworks_select`,cometapi:`${Z}model_cometapi_select`,azure_openai:`${Z}model_azure_openai_select`},W=J[G]||J.openai,q=`${Z}temp_openai`.replace("##","#"),z=`${Z}temp_counter_openai`.replace("##","#");return{model:W,temp:q,tempCounter:z}}function $8(){try{let Z=null,Q=null,G=null,J=!!N4,W=N4||null,q=null;if(J){let X=b7?.find((K)=>K.id===W);if(X)q=X.name,Q=X.chat_id,G=Q,Z=q}else{if(m6&&m6.trim())Z=String(m6).trim();else if(d6!==void 0&&u6&&u6[d6])Z=u6[d6].name;else if(Q8?.character_name)Z=String(Q8.character_name).trim();if(Z&&Z.normalize)Z=Z.normalize("NFC");try{let X=E7();if(X?.chatId)Q=X.chatId,G=Q;else if(typeof window.getCurrentChatId==="function")Q=window.getCurrentChatId(),G=Q}catch(X){if(console.warn(`${p1}: Could not get context, trying fallback methods`),typeof window.getCurrentChatId==="function")Q=window.getCurrentChatId(),G=Q}}let z=null;if(Q8&&c6 in Q8)z=Q8[c6];let Y=null;try{let X=o(),K=p6(),j=L1(K.temp).val()??L1(K.tempCounter).val(),U=Number.isFinite(parseFloat(j))?parseFloat(j):0.7,O=L1(K.model).val()||"";Y={api:X.api,model:O,temperature:U,completionSource:X.completionSource,source:"current_ui"}}catch(X){console.warn(`${p1}: Could not get current model/temperature settings:`,X),Y=null}let V={characterName:Z,chatId:Q,chatName:G,groupId:W,isGroupChat:J,lorebookName:z,modelSettings:Y};if(J)V.groupName=q;return V}catch(Z){return console.warn(`${p1}: Error getting context:`,Z),{characterName:null,chatId:null,chatName:null,groupId:null,groupName:null,isGroupChat:!1}}}async function J8(){if(!A4.STMemoryBooks.moduleSettings.manualModeEnabled)return Q8?.[c6]||null;let Q=g();if(Q.manualLorebook??null)if(a8.includes(Q.manualLorebook))return Q.manualLorebook;else toastr.error(`The designated manual lorebook "${Q.manualLorebook}" no longer exists. Please select a new one.`),delete Q.manualLorebook;let G=a8.map((z)=>`<option value="${z}">${z}</option>`).join("");if(G.length===0)return toastr.error("No lorebooks found to select from.","STMemoryBooks"),null;let J=`
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Manual mode is enabled, but no lorebook has been designated for this chat's memories. Please select one.</p>
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${G}
            </select>
        </div>
    `,W=new T4(J,R4.TEXT,"",{okButton:"Select",cancelButton:"Cancel"});if(await W.show()===t8.AFFIRMATIVE){let z=W.dlg.querySelector("#stmb-manual-lorebook-select").value;return Q.manualLorebook=z,Z1(),toastr.success(`"${z}" is now the Memory Book for this chat.`,"STMemoryBooks"),z}return null}async function T0(Z=null){if(a8.length===0)return toastr.error("No lorebooks found to select from.","STMemoryBooks"),null;let Q=a8.map((q)=>{return`<option value="${q}"${q===Z?" selected":""}>${q}</option>`}).join(""),G=`
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Choose which lorebook should be used for this chat's memories.</p>
            ${Z?`<p><strong>Current:</strong> ${Z}</p>`:""}
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${Q}
            </select>
        </div>
    `,J=new T4(G,R4.TEXT,"",{okButton:"Select",cancelButton:"Cancel"});if(await J.show()===t8.AFFIRMATIVE){let q=J.dlg.querySelector("#stmb-manual-lorebook-select").value;if(q!==Z){let z=g();return z.manualLorebook=q,Z1(),toastr.success(`Manual lorebook changed to: ${q}`,"STMemoryBooks"),q}else return q}return null}function g7(Z){try{if(!Z)throw Error("getCurrentModelSettings requires a profile");let Q=Z.effectiveConnection||Z.connection;if(!Q)throw Error("Profile is missing connection");let G=(Q.model||"").trim();if(!G)throw Error("Profile is missing required connection.model");let J=l6(Q.temperature);if(J===null)J=0.7;return{model:G,temperature:J}}catch(Q){throw console.warn(`${p1}: Error getting current model settings:`,Q),Q}}function Q1(){try{let Z=p6(),Q=(L1(Z.model).val()||"").trim(),G=0.7,J=L1(Z.temp).val()||L1(Z.tempCounter).val();if(J!==null&&J!==void 0&&J!==""){let W=parseFloat(J);if(!isNaN(W)&&W>=0&&W<=2)G=W}return{model:Q,temperature:G}}catch(Z){return console.warn(`${p1}: Error getting UI model settings:`,Z),{model:"",temperature:0.7}}}async function $0(Z,Q={}){let{estimatedOutput:G=300}=Q,J=String(Z||""),W=Math.ceil(J.length/4);return{input:W,output:G,total:W+G}}function i6(Z){let Q=Z?.effectiveConnection||Z?.connection||{},G=Y1(Q.api||"openai"),J=(Q.model||"").trim(),W=0.7;if(typeof Q.temperature==="number"&&!Number.isNaN(Q.temperature))W=Math.max(0,Math.min(2,Q.temperature));let q=Q.endpoint?String(Q.endpoint):void 0,z=Q.apiKey?String(Q.apiKey):void 0;return{api:G,model:J,temperature:W,endpoint:q,apiKey:z}}function N0(){return{summary:c1(`You are a talented summarist skilled at capturing scenes from stories comprehensively. Analyze the following roleplay scene and return a detailed memory as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_summary"),summarize:c1(`Analyze the following roleplay scene and return a structured summary as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_summarize"),synopsis:c1(`Analyze the following roleplay scene and return a comprehensive synopsis as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_synopsis"),sumup:c1(`Analyze the following roleplay scene and return a beat summary as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_sumup"),minimal:c1(`Analyze the following roleplay scene and return a minimal memory entry as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Brief 2-5 sentence summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, provide a very brief 2-5 sentence summary of what happened in this scene. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded.

For the keywords field, generate 15-30 specific, descriptive, highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_minimal"),northgate:c1(`You are a memory archivist for a long-form narrative. Your function is to analyze the provided scene and extract all pertinent information into a structured JSON object.

You must respond with ONLY valid JSON in this exact format:
{
"title": "Concise Scene Title (3-5 words)",
"content": "A detailed, literary summary of the scene written in a third-person, past-tense narrative style. Capture all key actions, emotional shifts, character development, and significant dialogue. Focus on "showing" what happened through concrete details. Ensure the summary is comprehensive enough to serve as a standalone record of the scene's events and their impact on the characters.",
"keywords": ["keyword1", "keyword2", "keyword3"]
}

For the "content" field, write with literary quality. Do not simply list events; synthesize them into a coherent narrative block.

For the "keywords" field, provide 15-30 specific and descriptive keywords that capture the scene's core elements. Keywords must be concrete and scene-specific (locations, objects, proper nouns, unique actions). Do not use abstract themes (e.g., "sadness", "love") or character names.

Return ONLY the JSON object, with no additional text or explanations.`,"STMemoryBooks_Prompt_northgate"),aelemar:c1(`You are a meticulous archivist, skilled at accurately capturing all key plot points and memories from a story. Analyze the following story scene and extract a detailed summary as JSON.

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

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_aelemar"),comprehensive:c1(`Analyze the following roleplay scene in the context of previous summaries provided (if available) and return a comprehensive synopsis as JSON.

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

Return ONLY the JSON — no additional text.`,"STMemoryBooks_Prompt_comprehensive")}}function d1(){return c1(`Analyze the following chat scene and return a memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Concise memory focusing on key plot points, character development, and important interactions",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY the JSON, no other text.`,"STMemoryBooks_Prompt_default")}async function u7(Z){return await G0(Z)}async function R0(Z){if(!Z)return d1();if(Z.preset)return await G0(Z.preset);else return d1()}function W8(Z){if(!Z||typeof Z!=="object")return console.warn(`${p1}: Profile validation failed - not an object`),!1;if(!Z.name||typeof Z.name!=="string")return console.warn(`${p1}: Profile validation failed - invalid name`),!1;if(Z.connection&&typeof Z.connection!=="object")return console.warn(`${p1}: Profile validation failed - invalid connection`),!1;return!0}function G8(Z){if(Z===null||typeof Z!=="object")return Z;if(Z instanceof Date)return new Date(Z.getTime());if(Array.isArray(Z))return Z.map((G)=>G8(G));let Q={};for(let G in Z)if(Z.hasOwnProperty(G))Q[G]=G8(Z[G]);return Q}function m7(){return["summary","summarize","synopsis","sumup","minimal","northgate","aelemar","comprehensive"]}function d7(Z){return new Set(["summary","summarize","synopsis","sumup","minimal","northgate","aelemar","comprehensive"]).has(Z)}function D0(Z,Q=[]){if(!Z||typeof Z!=="string")Z="New Profile";let G=Z.trim().replace(/[<>:"/\\|?*]/g,"");if(!G)G="New Profile";let J=G,W=1;while(Q.includes(J))J=`${G} (${W})`,W++;return J}function l6(Z){if(typeof Z==="number")return isNaN(Z)?null:Math.max(0,Math.min(2,Z));if(typeof Z==="string"){let Q=parseFloat(Z);return isNaN(Q)?null:Math.max(0,Math.min(2,Q))}return null}function c7(Z){let Q=R8[Z],G=p8[Z];return Q&&G&&c1(Q,G)||Z}function _0(Z={}){let Q=l6(Z.temperature);if(Q===null)Q=0.7;let G={name:(Z.name||"New Profile").trim(),connection:{api:Z.api||"openai",temperature:Q},prompt:(Z.prompt||"").trim(),preset:Z.preset||"",constVectMode:Z.constVectMode||"link",position:Z.position!==void 0?Number(Z.position):0,orderMode:Z.orderMode||"auto",orderValue:Z.orderValue!==void 0?Number(Z.orderValue):100,preventRecursion:Z.preventRecursion!==void 0?Z.preventRecursion:!0,delayUntilRecursion:Z.delayUntilRecursion!==void 0?Z.delayUntilRecursion:!0};if(Z.titleFormat||!Z.isDynamicProfile)G.titleFormat=Z.titleFormat||"[000] - {{title}}";let J=(Z.model||"").trim();if(J)G.connection.model=J;let W=(Z.endpoint||"").trim();if(W)G.connection.endpoint=W;let q=(Z.apiKey||"").trim();if(q)G.connection.apiKey=q;if(G.prompt&&G.preset)G.preset="";if(!G.prompt&&!G.preset)G.preset="summary";try{if(Number(G.position)===7&&typeof Z.outletName==="string"){let z=Z.outletName.trim();if(z)G.outletName=z}}catch{}return G}var p1="STMemoryBooks-Utils",L1,r1,k7;var S1=H0(()=>{s0();r8();O0();L1=window.jQuery;r1={extensionsMenu:"#extensionsMenu .list-group",menuItem:"#stmb-menu-item",chatContainer:"#chat",mainApi:"#main_api",completionSource:"#chat_completion_source",modelOpenai:"#model_openai_select",modelClaude:"#model_claude_select",modelOpenrouter:"#model_openrouter_select",modelAi21:"#model_ai21_select",modelGoogle:"#model_google_select",modelMistralai:"#model_mistralai_select",modelCohere:"#model_cohere_select",modelPerplexity:"#model_perplexity_select",modelGroq:"#model_groq_select",modelNanogpt:"#model_nanogpt_select",modelDeepseek:"#model_deepseek_select",modelElectronhub:"#model_electronhub_select",modelVertexai:"#model_vertexai_select",modelAimlapi:"#model_aimlapi_select",modelXai:"#model_xai_select",modelPollinations:"#model_pollinations_select",modelMoonshot:"#model_moonshot_select",modelFireworks:"#model_fireworks_select",modelCometapi:"#model_cometapi_select",modelAzureOpenai:"#model_azure_openai_select",tempOpenai:"#temp_openai",tempCounterOpenai:"#temp_counter_openai"},k7=["openai","claude","openrouter","ai21","makersuite","vertexai","mistralai","custom","cohere","perplexity","groq","nanogpt","deepseek","electronhub","aimlapi","xai","pollinations","moonshot","fireworks","cometapi","azure_openai"]});import{chat as e8,name1 as p7,name2 as _4}from"../../../../script.js";import{getContext as i7}from"../../../extensions.js";import{t as E1,translate as T1}from"../../../i18n.js";function r0(Z){let{sceneStart:Q,sceneEnd:G,chatId:J,characterName:W}=Z;if(Q==null||G==null)throw Error(T1("Scene markers are required","chatcompile.errors.sceneMarkersRequired"));if(Q>G)throw Error(T1("Start message cannot be greater than end message","chatcompile.errors.startGreaterThanEnd"));if(Q<0||G>=e8.length)throw Error(E1`Message IDs out of bounds: ${Q}-${G} (0-${e8.length-1})`);let q=[],z=0,Y=0;for(let K=Q;K<=G;K++){let j=e8[K];if(!j){Y++;continue}if(j.is_system){z++;continue}let U={id:K,name:l7(j.name),mes:o7(j.mes,j.is_user),send_date:j.send_date||new Date().toISOString()};if(j.is_user!==void 0)U.is_user=j.is_user;q.push(U)}let X={metadata:{sceneStart:Q,sceneEnd:G,chatId:J||"unknown",characterName:W||_4||T1("Unknown","common.unknown"),messageCount:q.length,totalRequestedRange:G-Q+1,hiddenMessagesSkipped:z,messagesSkipped:Y,compiledAt:new Date().toISOString(),totalChatLength:e8.length,userName:p7||T1("User","chatcompile.defaults.user")},messages:q};if(q.length===0)throw Error(E1`No visible messages in range ${Q}-${G}`);return X}function a0(Z,Q){let G=i7();return{sceneStart:Z,sceneEnd:Q,chatId:G.chatId||"unknown",characterName:G.name2||_4||T1("Unknown","common.unknown")}}async function y6(Z){let Q=o6(Z),{input:G}=await $0(Q,{estimatedOutput:0});return G}async function I4(Z){let{metadata:Q,messages:G}=Z,J=new Set,W=0,q=0,z=0;return G.forEach((Y)=>{if(J.add(Y.name),W+=(Y.mes||"").length,Y.is_user)q++;else z++}),{messageCount:G.length,speakerCount:J.size,speakers:Array.from(J),totalCharacters:W,estimatedTokens:await y6(Z),userMessages:q,characterMessages:z,timeSpan:{start:G[0]?.send_date,end:G[G.length-1]?.send_date}}}function w4(Z){let Q=[],G=[];if(!Z.metadata)Q.push(T1("Missing metadata","chatcompile.validation.errors.missingMetadata"));if(!Z.messages||!Array.isArray(Z.messages))Q.push(T1("Invalid messages array","chatcompile.validation.errors.invalidMessagesArray"));if(Z.messages&&Z.messages.length===0)G.push(T1("No messages","chatcompile.validation.warnings.noMessages"));if(Z.messages)Z.messages.forEach((W,q)=>{if(!W.id&&W.id!==0)G.push(E1`Message at index ${q} missing id`);if(!W.name)G.push(E1`Message at index ${q} missing name`);if(!W.mes&&W.mes!=="")G.push(E1`Message at index ${q} missing content`)});if(Z.messages&&Z.messages.length>100)G.push(T1("Very large scene","chatcompile.validation.warnings.veryLargeScene"));return{valid:Q.length===0,errors:Q,warnings:G}}function o6(Z){let{metadata:Q,messages:G}=Z,J=[];return J.push(T1("=== SCENE METADATA ===","chatcompile.readable.headerMetadata")),J.push(E1`Range: ${Q.sceneStart}-${Q.sceneEnd}`),J.push(E1`Chat: ${Q.chatId}`),J.push(E1`Character: ${Q.characterName}`),J.push(E1`Compiled: ${Q.messageCount}`),J.push(E1`Compiled at: ${Q.compiledAt}`),J.push(""),J.push(T1("=== SCENE MESSAGES ===","chatcompile.readable.headerMessages")),G.forEach((W)=>{J.push(E1`[${W.id}] ${W.name}: ${W.mes}`)}),J.join(`
`)}function l7(Z){if(!Z)return T1("Unknown","common.unknown");return Z.trim()||T1("Unknown","common.unknown")}function o7(Z,Q=!1){if(!Z)return"";try{return String(Z).replace(/\r\n/g,`
`).trim()}catch(G){return String(Z).trim()}}var s8=H0(()=>{S1()});var L4=p0((OJ,Z6)=>{if(typeof Z6==="object"&&typeof Z6.exports==="object")Z6.exports=n6;n6.defunct=function(Z){throw Error("Unexpected character at index "+(this.index-1)+": "+Z)};function n6(Z){if(typeof Z!=="function")Z=n6.defunct;var Q=[],G=[],J=0;this.state=0,this.index=0,this.input="",this.addRule=function(q,z,Y){var V=q.global;if(!V){var X="g";if(q.multiline)X+="m";if(q.ignoreCase)X+="i";q=new RegExp(q.source,X)}if(Object.prototype.toString.call(Y)!=="[object Array]")Y=[0];return G.push({pattern:q,global:V,action:z,start:Y}),this},this.setInput=function(q){return J=0,this.state=0,this.index=0,Q.length=0,this.input=q,this},this.lex=function(){if(Q.length)return Q.shift();this.reject=!0;while(this.index<=this.input.length){var q=W.call(this).splice(J),z=this.index;while(q.length)if(this.reject){var Y=q.shift(),V=Y.result,X=Y.length;this.index+=X,this.reject=!1,J++;var K=Y.action.apply(this,V);if(this.reject)this.index=V.index;else if(typeof K<"u")switch(Object.prototype.toString.call(K)){case"[object Array]":Q=K.slice(1),K=K[0];default:if(X)J=0;return K}}else break;var j=this.input;if(z<j.length)if(this.reject){J=0;var K=Z.call(this,j.charAt(this.index++));if(typeof K<"u")if(Object.prototype.toString.call(K)==="[object Array]")return Q=K.slice(1),K[0];else return K}else{if(this.index!==z)J=0;this.reject=!0}else if(q.length)this.reject=!0;else break}};function W(){var q=[],z=0,Y=this.state,V=this.index,X=this.input;for(var K=0,j=G.length;K<j;K++){var U=G[K],O=U.start,B=O.length;if(!B||O.indexOf(Y)>=0||Y%2&&B===1&&!O[0]){var N=U.pattern;N.lastIndex=V;var H=N.exec(X);if(H&&H.index===V){var T=q.push({result:H,action:U.action,length:H[0].length});if(U.global)z=T;while(--T>z){var R=T-1;if(q[T].length>q[R].length){var w=q[T];q[T]=q[R],q[R]=w}}}}}return q}}});var n7={};var C4=H0(()=>{/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */if(!String.fromCodePoint)(function(){var Z=function(){try{var W={},q=Object.defineProperty,z=q(W,W,W)&&q}catch(Y){}return z}(),Q=String.fromCharCode,G=Math.floor,J=function(W){var q=16384,z=[],Y,V,X=-1,K=arguments.length;if(!K)return"";var j="";while(++X<K){var U=Number(arguments[X]);if(!isFinite(U)||U<0||U>1114111||G(U)!=U)throw RangeError("Invalid code point: "+U);if(U<=65535)z.push(U);else U-=65536,Y=(U>>10)+55296,V=U%1024+56320,z.push(Y,V);if(X+1==K||z.length>q)j+=Q.apply(null,z),z.length=0}return j};if(Z)Z(String,"fromCodePoint",{value:J,configurable:!0,writable:!0});else String.fromCodePoint=J})()});var v4=p0((s6,h4)=>{Object.defineProperty(s6,"__esModule",{value:!0});s6.default=void 0;C4();var s7=/\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g,r7={"0":"\x00",b:"\b",f:"\f",n:`
`,r:"\r",t:"\t",v:"\v","'":"'",'"':'"',"\\":"\\"},Q6=function(Q){return String.fromCodePoint(parseInt(Q,16))},a7=function(Q){return String.fromCodePoint(parseInt(Q,8))},t7=function(Q){return Q.replace(s7,function(G,J,W,q,z,Y,V,X){if(W!==void 0)return Q6(W);else if(q!==void 0)return Q6(q);else if(z!==void 0)return Q6(z);else if(Y!==void 0)return a7(Y);else if(X!==void 0)return Q6(X);else return r7[V]})};s6.default=t7;h4.exports=s6.default});var P4=p0((G6)=>{/*! https://mths.be/utf8js v3.0.0 by @mathias */(function(Z){var Q=String.fromCharCode;function G(B){var N=[],H=0,T=B.length,R,w;while(H<T)if(R=B.charCodeAt(H++),R>=55296&&R<=56319&&H<T)if(w=B.charCodeAt(H++),(w&64512)==56320)N.push(((R&1023)<<10)+(w&1023)+65536);else N.push(R),H--;else N.push(R);return N}function J(B){var N=B.length,H=-1,T,R="";while(++H<N){if(T=B[H],T>65535)T-=65536,R+=Q(T>>>10&1023|55296),T=56320|T&1023;R+=Q(T)}return R}function W(B){if(B>=55296&&B<=57343)throw Error("Lone surrogate U+"+B.toString(16).toUpperCase()+" is not a scalar value")}function q(B,N){return Q(B>>N&63|128)}function z(B){if((B&4294967168)==0)return Q(B);var N="";if((B&4294965248)==0)N=Q(B>>6&31|192);else if((B&4294901760)==0)W(B),N=Q(B>>12&15|224),N+=q(B,6);else if((B&4292870144)==0)N=Q(B>>18&7|240),N+=q(B,12),N+=q(B,6);return N+=Q(B&63|128),N}function Y(B){var N=G(B),H=N.length,T=-1,R,w="";while(++T<H)R=N[T],w+=z(R);return w}function V(){if(U>=j)throw Error("Invalid byte index");var B=K[U]&255;if(U++,(B&192)==128)return B&63;throw Error("Invalid continuation byte")}function X(){var B,N,H,T,R;if(U>j)throw Error("Invalid byte index");if(U==j)return!1;if(B=K[U]&255,U++,(B&128)==0)return B;if((B&224)==192)if(N=V(),R=(B&31)<<6|N,R>=128)return R;else throw Error("Invalid continuation byte");if((B&240)==224)if(N=V(),H=V(),R=(B&15)<<12|N<<6|H,R>=2048)return W(R),R;else throw Error("Invalid continuation byte");if((B&248)==240){if(N=V(),H=V(),T=V(),R=(B&7)<<18|N<<12|H<<6|T,R>=65536&&R<=1114111)return R}throw Error("Invalid UTF-8 detected")}var K,j,U;function O(B){K=G(B),j=K.length,U=0;var N=[],H;while((H=X())!==!1)N.push(H);return J(N)}Z.version="3.0.0",Z.encode=Y,Z.decode=O})(typeof G6>"u"?G6.utf8={}:G6)});var E4=p0((JQ,r6)=>{var e7=L4(),ZQ=v4(),NJ=P4(),QQ=[[/\s*:\s*/,-1],[/\s*,\s*/,-2],[/\s*{\s*/,-3],[/\s*}\s*/,13],[/\s*\[\s*/,-4],[/\s*\]\s*/,12],[/\s*\.\s*/,-5]];function x4(Z){return Z=Z.replace(/\\\//,"/"),ZQ(Z)}function GQ(Z){let Q=new e7,G=0,J=0;return Q.addRule(/"((?:\\.|[^"])*?)($|")/,(W,q)=>{return G+=W.length,{type:11,value:x4(q),row:J,col:G,single:!1}}),Q.addRule(/'((?:\\.|[^'])*?)($|'|(",?[ \t]*\n))/,(W,q)=>{return G+=W.length,{type:11,value:x4(q),row:J,col:G,single:!0}}),Q.addRule(/[\-0-9]*\.[0-9]*([eE][\+\-]?)?[0-9]*(?:\s*)/,(W)=>{return G+=W.length,{type:6,value:parseFloat(W),row:J,col:G}}),Q.addRule(/\-?[0-9]+([eE][\+\-]?)[0-9]*(?:\s*)/,(W)=>{return G+=W.length,{type:6,value:parseFloat(W),row:J,col:G}}),Q.addRule(/\-?[0-9]+(?:\s*)/,(W)=>{return G+=W.length,{type:7,value:parseInt(W),row:J,col:G}}),QQ.forEach((W)=>{Q.addRule(W[0],(q)=>{return G+=q.length,{type:W[1],value:q,row:J,col:G}})}),Q.addRule(/\s/,(W)=>{if(W==`
`)G=0,J++;else G+=W.length}),Q.addRule(/\S[ \t]*/,(W)=>{return G+=W.length,{type:14,value:W,row:J,col:G}}),Q.setInput(Z),Q}JQ.lexString=S4;function S4(Z,Q){let G=GQ(Z),J="";while(J=G.lex())Q(J)}JQ.getAllTokens=$Q;function $Q(Z){let Q=[];return S4(Z,function(J){Q.push(J)}),Q}});var k4=p0((UQ,f4)=>{var YQ=E4(),a6=0,I0=1,J0=2,t6=3,$6=4,J6=5,zQ=6,b4=7,z1=8,y1=9,W0=10,XQ=11,Y8=12,z8=13,VQ=14,q1=15,q8=-1,b1=-2,e6=-3,w0=-4;function y4(Z){if(Z.peek==null)Object.defineProperty(Z,"peek",{enumerable:!1,value:function(){return this[this.length-1]}});if(Z.last==null)Object.defineProperty(Z,"last",{enumerable:!1,value:function(Q){return this[this.length-(1+Q)]}})}function L(Z,Q){return Z&&Z.hasOwnProperty("type")&&Z.type==Q}function I(Z){}UQ.parse=KQ;function KQ(Z,Q){let G=[],J=[];y4(G),y4(J);let W=function(q){J.push(q)};if(YQ.lexString(Z,W),J[0].type==w0&&J.last(0).type!=Y8)J.push({type:Y8,value:"]",row:-1,col:-1});if(J[0].type==e6&&J.last(0).type!=z8)J.push({type:z8,value:"}",row:-1,col:-1});for(let q=0;q<J.length;q++){I("Shifting "+J[q].type),G.push(J[q]),I(G),I("Reducing...");while(a1(G))I(G),I("Reducing...")}if(G.length==1&&G[0].type==I0)I("Pre-compile error fix 1"),G=[{type:W0,value:G[0].value}];return W6(G[0],Q)}function a1(Z){let Q=Z.pop();switch(Q.type){case z1:if(Q.value.trim()=="true")return I("Rule 5"),Z.push({type:t6,value:"true"}),!0;if(Q.value.trim()=="false")return I("Rule 6"),Z.push({type:t6,value:"false"}),!0;if(Q.value.trim()=="null")return I("Rule 7"),Z.push({type:q1,value:null}),!0;break;case VQ:if(L(Z.peek(),z1))return I("Rule 11a"),Z.peek().value+=Q.value,!0;return I("Rule 11c"),Z.push({type:z1,value:Q.value}),!0;case b4:if(L(Q,b4)&&L(Z.peek(),z1))return I("Rule 11b"),Z.peek().value+=Q.value,!0;return I("Rule 11f"),Q.type=q1,Z.push(Q),!0;case XQ:return I("Rule 11d"),Q.type=q1,Q.value=Q.value,Z.push(Q),!0;case t6:if(I("Rule 11e"),Q.type=q1,Q.value=="true")Q.value=!0;else Q.value=!1;return Z.push(Q),!0;case zQ:return I("Rule 11g"),Q.type=q1,Z.push(Q),!0;case q1:if(L(Z.peek(),b1))return I("Rule 12"),Q.type=J6,Z.pop(),Z.push(Q),!0;if(L(Z.peek(),q8))return I("Rule 13"),Q.type=$6,Z.pop(),Z.push(Q),!0;if(L(Z.peek(),z1)&&L(Z.last(1),q1)){I("Error rule 1");let G=Z.pop();return Z.peek().value+='"'+G.value+'"',Z.peek().value+=Q.value,!0}if(L(Z.peek(),z1)&&L(Z.last(1),J0)){I("Error rule 2");let G=Z.pop(),J=Z.peek().value.pop();return J+='"'+G.value+'"',J+=Q.value,Z.peek().value.push(J),!0}if(L(Z.peek(),z1)&&L(Z.last(1),I0)){I("Error rule 3");let G=Z.pop(),J=Z.peek().value.pop(),W=Q.single?"'":'"';return J.value+=W+G.value+W,J.value+=Q.value,Z.peek().value.push(J),!0}if(L(Z.peek(),z1)){I("Error rule 4");let G=Z.pop().value;return Q.value=G+Q.value,Z.push(Q),!0}break;case y1:if(L(Q,y1)&&L(Z.peek(),b1))return I("Rule 12a"),Q.type=J6,Z.pop(),Z.push(Q),!0;if(L(Z.peek(),q8))return I("Rule 13a"),Q.type=$6,Z.pop(),Z.push(Q),!0;break;case W0:if(L(Z.peek(),b1)){I("Rule 12b");let G={type:J6,value:Q};return Z.pop(),Z.push(G),!0}if(L(Z.peek(),q8)){I("Rule 13b");let G={type:$6,value:Q};return Z.pop(),Z.push(G),!0}if(L(Z.peek(),z1)){I("Error rule 9");let G=Z.pop();return Z.push({type:a6,key:G.value.trim(),value:Q}),!0}break;case J6:if(L(Z.peek(),J0))return I("Rule 14"),Z.peek().value.push(Q.value),!0;return I("Rule 15"),Z.push({type:J0,value:[Q.value]}),!0;case J0:if(L(Z.peek(),q1))return I("Rule 15a"),Q.value.unshift(Z.peek().value),Z.pop(),Z.push(Q),!0;if(L(Z.peek(),y1))return I("Rule 15b"),Q.value.unshift(Z.peek().value),Z.pop(),Z.push(Q),!0;if(L(Z.peek(),W0))return I("Rule 15c"),Q.value.unshift(Z.peek()),Z.pop(),Z.push(Q),!0;if(L(Z.peek(),z1)&&(Z.last(1),b1)){I("Error rule 7");let G=Z.pop();Z.push({type:q1,value:G.value}),I("Start subreduce... ("+G.value+")");while(a1(Z));return I("End subreduce"),Z.push(Q),!0}if(L(Z.peek(),J0))return I("Error rule 8"),Z.peek().value.push(Q.value[0]),!0;break;case $6:if(L(Z.peek(),z1)||L(Z.peek(),q1)||L(Z.peek(),J0)){I("Rule 16");let G=Z.pop();return Z.push({type:a6,key:G.value,value:Q.value}),!0}throw Error("Got a :value that can't be handled at line "+Q.row+":"+Q.col);case a6:if(L(Z.last(0),b1)&&L(Z.last(1),I0))return I("Rule 17"),Z.last(1).value.push(Q),Z.pop(),!0;return I("Rule 18"),Z.push({type:I0,value:[Q]}),!0;case I0:if(L(Z.peek(),I0))return I("Rule 17a"),Q.value.forEach(function(G){Z.peek().value.push(G)}),!0;break;case Y8:if(L(Z.peek(),J0)&&L(Z.last(1),w0)){I("Rule 19");let G=Z.pop();return Z.pop(),Z.push({type:y1,value:G.value}),!0}if(L(Z.peek(),y1)&&L(Z.last(1),w0)){I("Rule 19b");let G=Z.pop();return Z.pop(),Z.push({type:y1,value:[G.value]}),!0}if(L(Z.peek(),w0))return I("Rule 22"),Z.pop(),Z.push({type:y1,value:[]}),!0;if(L(Z.peek(),q1)&&L(Z.last(1),w0)){I("Rule 23");let G=Z.pop().value;return Z.pop(),Z.push({type:y1,value:[G]}),!0}if(L(Z.peek(),W0)&&L(Z.last(1),w0)){I("Rule 23b");let G=Z.pop();return Z.pop(),Z.push({type:y1,value:[G]}),!0}if(L(Z.peek(),z1)&&L(Z.last(1),b1)){I("Error rule 5");let G=Z.pop();Z.push({type:q1,value:G.value}),I("Start subreduce... ("+G.value+")");while(a1(Z));return I("End subreduce"),Z.push({type:Y8}),!0}if(L(Z.peek(),b1)&&(L(Z.last(1),z1)||L(Z.last(1),W0)||L(Z.last(1),q1))){I("Error rule 5a"),Z.pop(),Z.push({type:Y8,value:"]"}),I("Start subreduce..."),I("Content: "+JSON.stringify(Z));while(a1(Z));return I("End subreduce"),!0}if(L(Z.peek(),z1)&&L(Z.last(1),w0)){I("Error rule 5b");let G=Z.pop();return Z.pop(),Z.push({type:y1,value:[G.value]}),!0}if(L(Z.peek(),b1)&&L(Z.last(1),J0)){I("Error rule 5c"),Z.pop(),Z.push({type:Y8}),I("Start subreduce..."),I("Content: "+JSON.stringify(Z));while(a1(Z));return I("End subreduce"),!0}break;case z8:if(L(Z.peek(),I0)&&L(Z.last(1),e6)){I("Rule 20");let G=Z.pop();return Z.pop(),Z.push({type:W0,value:G.value}),!0}if(L(Z.peek(),e6))return I("Rule 21"),Z.pop(),Z.push({type:W0,value:null}),!0;if(L(Z.peek(),z1)&&L(Z.last(1),q8)){I("Error rule 4a");let G=Z.pop();Z.push({type:q1,value:G.value}),I("Start subreduce... ("+G.value+")");while(a1(Z));return I("End subreduce"),Z.push({type:z8}),!0}if(L(Z.peek(),q8)){I("Error rule 4b"),Z.push({type:q1,value:null}),I("Starting subreduce...");while(a1(Z));return I("End subreduce."),Z.push({type:z8}),!0}if(L(Z.peek(),b1))return I("Error rule 10a"),Z.pop(),Z.push({type:z8}),!0;throw Error("Found } that I can't handle at line "+Q.row+":"+Q.col);case b1:if(L(Z.peek(),b1))return I("Comma error rule 1"),!0;if(L(Z.peek(),z1)){I("Comma error rule 2");let G=Z.pop();Z.push({type:q1,value:G.value}),I("Starting subreduce...");while(a1(Z));return I("End subreduce."),Z.push(Q),!0}if(L(Z.peek(),q8)){I("Comma error rule 3"),Z.push({type:q1,value:null}),I("Starting subreduce...");while(a1(Z));return I("End subreduce."),Z.push(Q),!0}}return Z.push(Q),!1}function W6(Z,Q){if(["boolean","number","string"].indexOf(typeof Z)!=-1)return Z;if(Z===null)return null;if(Array.isArray(Z)){let J=[];while(Z.length>0)J.unshift(W6(Z.pop()));return J}if(L(Z,W0)){let J={};if(Z.value===null)return{};return Z.value.forEach(function(W){let q=W.key,z=W6(W.value);if(Q&&q in J)J[q]={value:J[q],next:z};else J[q]=z}),J}if(L(Z,y1))return W6(Z.value);return Z.value}});var u4=p0((HQ,g4)=>{var FQ=k4();HQ.parse=BQ;function BQ(Z,Q){let G=!0,J=!1;if(Q){if("fallback"in Q&&Q[G]===!1)G=!1;J="duplicateKeys"in Q&&Q.duplicateKeys===!0}try{return FQ.parse(Z,J)}catch(W){if(G===!1)throw W;try{let q=JSON.parse(Z);return console.warn("dirty-json got valid JSON that failed with the custom parser. We're returning the valid JSON, but please file a bug report here: https://github.com/RyanMarcus/dirty-json/issues  -- the JSON that caused the failure was: "+Z),q}catch(q){throw W}}}});var L5={};Q4(L5,{upsertTemplate:()=>F6,removeTemplate:()=>DZ,recreateBuiltInSidePrompts:()=>wZ,loadSidePrompts:()=>f1,listTemplates:()=>z0,listEnabledByType:()=>IG,listByTrigger:()=>B6,importFromJSON:()=>IZ,getTemplate:()=>NZ,firstRunInitIfMissing:()=>_G,findTemplateByName:()=>TZ,exportToJSON:()=>_Z,duplicateTemplate:()=>RZ,clearCache:()=>wG});import{getRequestHeaders as T5}from"../../../../script.js";import{t as j6,translate as e}from"../../../i18n.js";function v8(){return new Date().toISOString()}function B1(Z){return String(Z||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)||"sideprompt"}function D5(Z){if(!Z||typeof Z!=="object")return!1;if(typeof Z.version!=="number")return!1;if(!Z.prompts||typeof Z.prompts!=="object")return!1;for(let[Q,G]of Object.entries(Z.prompts)){if(!G||typeof G!=="object")return!1;if(G.key!==Q)return!1;if(typeof G.name!=="string"||!G.name.trim())return!1;if(typeof G.enabled!=="boolean")return!1;if(typeof G.prompt!=="string")return!1;if(!G.settings||typeof G.settings!=="object")return!1;if(!G.triggers||typeof G.triggers!=="object")return!1;if(G.triggers.onInterval!=null){let J=G.triggers.onInterval;if(typeof J!=="object")return!1;let W=Number(J.visibleMessages);if(!Number.isFinite(W)||W<1)return!1}if(G.triggers.onAfterMemory!=null){let J=G.triggers.onAfterMemory;if(typeof J!=="object")return!1;if(typeof J.enabled!=="boolean")return!1}if(G.triggers.commands!=null){if(!Array.isArray(G.triggers.commands))return!1;for(let J of G.triggers.commands)if(typeof J!=="string"||!J.trim())return!1}}return!0}function _5(Z){if(!Z||typeof Z!=="object")return!1;if(!Z.prompts||typeof Z.prompts!=="object")return!1;return Object.values(Z.prompts).some((Q)=>Q&&typeof Q==="object"&&("type"in Q)&&!("triggers"in Q))}function I5(Z){let Q=v8(),G={version:Math.max(2,Number(Z.version||1)+1),prompts:{}};for(let[J,W]of Object.entries(Z.prompts||{})){let q={key:J,name:String(W.name||"Side Prompt"),enabled:!!W.enabled,prompt:String(W.prompt!=null?W.prompt:"this is a placeholder prompt"),responseFormat:String(W.responseFormat||""),settings:{...W.settings||{}},createdAt:W.createdAt||Q,updatedAt:Q,triggers:{onInterval:void 0,onAfterMemory:void 0,commands:["sideprompt"]}},z=String(W.type||"").toLowerCase();if(z==="tracker"){let Y=Math.max(1,Number(W.settings?.intervalVisibleMessages??50));q.triggers.onInterval={visibleMessages:Y}}else if(z==="plotpoints"){let Y=!!(W.settings?.withMemories??!0);q.triggers.onAfterMemory={enabled:!!Y}}else if(z==="scoreboard"){if(!!(W.settings?.withMemories??!1))q.triggers.onAfterMemory={enabled:!0}}G.prompts[J]=q}return G}function w5(){let Z=v8(),Q={};{let G=B1("Plotpoints");Q[G]={key:G,name:e("Plotpoints","STMemoryBooks_Plotpoints"),enabled:!1,prompt:e("Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.","STMemoryBooks_PlotpointsPrompt"),responseFormat:e(`=== Plot Points ===
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
`,"STMemoryBooks_PlotpointsResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:2,orderMode:"manual",orderValue:25,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=B1("Status");Q[G]={key:G,name:e("Status","STMemoryBooks_Status"),enabled:!1,prompt:e("Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.","STMemoryBooks_StatusPrompt"),responseFormat:e(`Follow this general format:

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
- OOC Summary (1 paragraph)`,"STMemoryBooks_StatusResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"link",position:3,orderMode:"manual",orderValue:25,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=B1("Cast");Q[G]={key:G,name:e("Cast of Characters","STMemoryBooks_CastOfCharacters"),enabled:!1,prompt:e(`You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. 
Step 1: Review the scene and either add or update plot-related NPCs to the NPC WHO'S WHO report. Please note that {{char}} and {{user}} are major characters and do NOT need to be included in this report.
Step 2: This list should be kept in order of importance to the plot, so it may need to be reordered.
Step 3: If your response would be more than 2000 tokens long, remove NPCs with the least impact to the plot.`,"STMemoryBooks_CastOfCharactersPrompt"),responseFormat:e(`===NPC WHO'S WHO===
(In order of importance to the plot)

Person 1: 1-2 sentence desription
Person 2: 1-2 sentence desription
===END NPC WHO'S WHO===`,"STMemoryBooks_CastOfCharactersResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:3,orderMode:"manual",orderValue:15,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}{let G=B1("Assess");Q[G]={key:G,name:e("Assess","STMemoryBooks_Assess"),enabled:!1,prompt:e('Assess the interaction between {{char}} and {{user}} to date. List all the information {{char}} has learned about {{user}} through observation, questioning, or drawing conclusions from interaction (similar to a mental "note to self"). If there is already a list, update it. Try to keep it token-efficient and compact, focused on the important things.',"STMemoryBooks_AssessPrompt"),responseFormat:e(`Use this format: 
=== Things {{char}} has learned about {{user}} ===
(detailed list, in {{char}}'s POV/tone of voice)
===`,"STMemoryBooks_AssessResponseFormat"),settings:{overrideProfileEnabled:!1,lorebook:{constVectMode:"blue",position:2,orderMode:"manual",orderValue:30,preventRecursion:!0,delayUntilRecursion:!1}},triggers:{onAfterMemory:{enabled:!0},commands:["sideprompt"]},createdAt:Z,updatedAt:Z}}return Q}function AZ(){return{version:Math.max(2,n1.CURRENT_VERSION??2),prompts:w5()}}async function i1(Z){let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:T5(),body:JSON.stringify({name:R5,data:G})});if(!J.ok)throw Error(j6`Failed to save side prompts: ${J.status} ${J.statusText}`);P0=Z,console.log(`${j8}: ${e("Side prompts saved successfully","STMemoryBooks_SidePromptsSaved")}`)}async function f1(){if(P0)return P0;let Z=null;try{let Q=await fetch(`/user/files/${R5}`,{method:"GET",credentials:"include",headers:T5()});if(!Q.ok)Z=AZ(),await i1(Z);else{let G=await Q.text(),J=JSON.parse(G);if(_5(J))console.log(`${j8}: ${e("Migrating side prompts file from V1(type) to V2(triggers)","STMemoryBooks_MigratingSidePrompts")}`),Z=I5(J),await i1(Z);else if(!D5(J))console.warn(`${j8}: ${e("Invalid side prompts file structure; recreating with built-ins","STMemoryBooks_InvalidSidePromptsFile")}`),Z=AZ(),await i1(Z);else if(Z=J,Number(Z.version||1)<2)Z.version=2,await i1(Z)}}catch(Q){console.warn(`${j8}: ${e("Error loading side prompts; creating base doc","STMemoryBooks_ErrorLoadingSidePrompts")}`,Q),Z=AZ(),await i1(Z)}return P0=Z,P0}async function _G(){return await f1(),!0}async function z0(){let Z=await f1(),Q=Object.values(Z.prompts);return Q.sort((G,J)=>{let W=G.updatedAt||G.createdAt||"";return(J.updatedAt||J.createdAt||"").localeCompare(W)}),Q}async function NZ(Z){return(await f1()).prompts[Z]||null}async function TZ(Z){let Q=await f1(),G=String(Z||"").trim();if(!G)return null;let J=G.toLowerCase(),W=B1(G),q=J.replace(/[^a-z0-9]+/g," ").trim(),z=Object.values(Q.prompts);for(let Y of z){let V=String(Y.name||"").toLowerCase(),X=String(Y.key||"").toLowerCase(),K=B1(Y.name||"");if(V===J||X===J||K===W)return Y}for(let Y of z){let V=String(Y.name||"").toLowerCase(),X=String(Y.key||"").toLowerCase(),K=B1(Y.name||"");if(V.startsWith(J)||K.startsWith(W)||X.startsWith(J))return Y}for(let Y of z){let V=String(Y.name||"").toLowerCase(),X=B1(Y.name||""),K=V.replace(/[^a-z0-9]+/g," ").trim();if(V.includes(J)||X.includes(W)||q&&K.includes(q))return Y}return null}async function F6(Z){let Q=await f1(),G=!Z.key,J=v8(),W=String(Z.name??"").trim(),q=G?null:Q.prompts[Z.key],z=W||(G?e("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt"):q?.name||e("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")),Y;if(Z.key)Y=Z.key;else{let j=B1(z||e("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")),U=2;while(Q.prompts[j])j=B1(`${z} ${U}`),U++;Y=j}let V=Q.prompts[Y],X={key:Y,name:z,enabled:typeof Z.enabled==="boolean"?Z.enabled:V?.enabled??!1,prompt:String(Z.prompt!=null?Z.prompt:V?.prompt||"this is a placeholder prompt"),responseFormat:String(Z.responseFormat!=null?Z.responseFormat:V?.responseFormat||""),settings:{...V?.settings||{},...Z.settings||{}},triggers:Z.triggers?Z.triggers:V?.triggers||{commands:["sideprompt"]},createdAt:V?.createdAt||J,updatedAt:J};if(X.triggers.onInterval){let K=Math.max(1,Number(X.triggers.onInterval.visibleMessages??50));X.triggers.onInterval={visibleMessages:K}}if(X.triggers.onAfterMemory)X.triggers.onAfterMemory={enabled:!!X.triggers.onAfterMemory.enabled};if("commands"in X.triggers)if(Array.isArray(X.triggers.commands))X.triggers.commands=X.triggers.commands.filter((K)=>typeof K==="string"&&K.trim());else X.triggers.commands=[];else X.triggers.commands=["sideprompt"];return Q.prompts[Y]=X,await i1(Q),Y}async function RZ(Z){let Q=await f1(),G=Q.prompts[Z];if(!G)throw Error(j6`Template "${Z}" not found`);let J=j6`${G.name} (Copy)`,W=B1(J),q=2;while(Q.prompts[W])W=B1(`${J} ${q}`),q++;let z=v8();return Q.prompts[W]={...G,key:W,name:J,createdAt:z,updatedAt:z},await i1(Q),W}async function DZ(Z){let Q=await f1();if(!Q.prompts[Z])throw Error(j6`Template "${Z}" not found`);delete Q.prompts[Z],await i1(Q)}async function _Z(){let Z=await f1();return JSON.stringify(Z,null,2)}async function IZ(Z){let Q=JSON.parse(Z),G=null;if(D5(Q))G=Q;else if(_5(Q))G=I5(Q);else throw Error(e("Invalid side prompts file structure","STMemoryBooks_InvalidSidePromptsJSON"));let J=await f1(),W={version:Math.max(2,Number(J.version??2),Number(G.version??2)),prompts:{...J.prompts}},q=(V,X)=>{let K=String(X||"").trim()||V||"sideprompt",j=B1(K),U=V&&!W.prompts[V]?V:j;if(!U)U="sideprompt";let O=2;while(W.prompts[U])U=B1(`${K} ${O}`),O++;return U},z=0,Y=0;for(let[V,X]of Object.entries(G.prompts||{})){let K=W.prompts[V]?q(null,X?.name||V):V;if(K!==V)Y++;let j=v8(),U={key:K,name:String(X.name||"Side Prompt"),enabled:!!X.enabled,prompt:String(X.prompt!=null?X.prompt:"this is a placeholder prompt"),responseFormat:String(X.responseFormat||""),settings:{...X.settings||{}},triggers:X.triggers?{...X.triggers}:{commands:["sideprompt"]},createdAt:X.createdAt||j,updatedAt:j};if(U.triggers.onInterval){let O=Math.max(1,Number(U.triggers.onInterval.visibleMessages??50));U.triggers.onInterval={visibleMessages:O}}if(U.triggers.onAfterMemory)U.triggers.onAfterMemory={enabled:!!U.triggers.onAfterMemory.enabled};if("commands"in U.triggers)if(Array.isArray(U.triggers.commands))U.triggers.commands=U.triggers.commands.filter((O)=>typeof O==="string"&&O.trim());else U.triggers.commands=[];else U.triggers.commands=["sideprompt"];W.prompts[K]=U,z++}return await i1(W),{added:z,renamed:Y}}async function wZ(Z="overwrite"){if(Z!=="overwrite")console.warn(`${j8}: Unsupported mode for recreateBuiltInSidePrompts: ${Z}; defaulting to 'overwrite'`);let Q=await f1(),G=w5(),J=Object.keys(G||{}),W=0;if(!Q||!Q.prompts||typeof Q.prompts!=="object")throw Error(e("Invalid side prompts document","STMemoryBooks_InvalidSidePromptsJSON"));for(let q of J)Q.prompts[q]=G[q],W++;return await i1(Q),P0=Q,console.log(`${j8}: Recreated built-in side prompts (overwrote ${W} entries)`),{replaced:W}}async function IG(Z){let Q=String(Z||"").toLowerCase(),G=await z0();if(Q==="tracker")return G.filter((J)=>J.enabled&&J.triggers?.onInterval&&Number(J.triggers.onInterval.visibleMessages)>=1);if(Q==="plotpoints")return G.filter((J)=>J.enabled&&J.triggers?.onAfterMemory?.enabled);if(Q==="scoreboard")return G.filter((J)=>J.enabled&&(Array.isArray(J.triggers?.commands)||J.triggers?.onAfterMemory?.enabled));return[]}async function B6(Z){let Q=await z0();if(Z==="onInterval")return Q.filter((G)=>G.enabled&&G.triggers?.onInterval&&Number(G.triggers.onInterval.visibleMessages)>=1);if(Z==="onAfterMemory")return Q.filter((G)=>G.enabled&&G.triggers?.onAfterMemory?.enabled);if(Z&&Z.startsWith("command:")){let G=Z.slice(8).trim();return Q.filter((J)=>Array.isArray(J.triggers?.commands)&&J.triggers.commands.some((W)=>W.toLowerCase()===G.toLowerCase()))}return[]}function wG(){P0=null}var j8="STMemoryBooks-SidePromptsManager",R5,P0=null;var P8=H0(()=>{O0();R5=i0.SIDE_PROMPTS_FILE});s8();import{eventSource as e1,event_types as F0,chat as j7,chat_metadata as g0,saveSettingsDebounced as s,characters as pZ,this_chid as oG,settings as z3}from"../../../../script.js";import{Popup as G1,POPUP_TYPE as a,POPUP_RESULT as l}from"../../../popup.js";import{extension_settings as i}from"../../../extensions.js";import{SlashCommandParser as y0}from"../../../slash-commands/SlashCommandParser.js";import{SlashCommand as f0}from"../../../slash-commands/SlashCommand.js";import{SlashCommandEnumValue as nZ}from"../../../slash-commands/SlashCommandEnumValue.js";import{ARGUMENT_TYPE as _6,SlashCommandArgument as I6}from"../../../slash-commands/SlashCommandArgument.js";import{executeSlashCommands as nG}from"../../../slash-commands.js";import{METADATA_KEY as m8,world_names as C6,loadWorldInfo as sG,saveWorldInfo as rG,reloadEditor as aG}from"../../../world-info.js";import{lodash as tG,Handlebars as eG,DOMPurify as m0}from"../../../../lib.js";import{escapeHtml as E}from"../../../utils.js";S1();var c4=x6(u4(),1);import{characters as ZZ,this_chid as m4,substituteParams as AQ,getRequestHeaders as NQ}from"../../../../script.js";import{oai_settings as q6}from"../../../openai.js";import{runRegexScript as TQ,getRegexScripts as RQ}from"../../../extensions/regex/engine.js";import{groups as d4}from"../../../group-chats.js";import{extension_settings as w8}from"../../../extensions.js";var LJ=window.jQuery;function DQ(Z){try{let Q={...Z};return Q.disabled=!1,Q}catch{return Z}}function p4(Z,Q){if(typeof Z!=="string")return"";if(!Array.isArray(Q)||Q.length===0)return Z;try{let G=RQ({allowedOnly:!1})||[],J=Q.map((q)=>Number(String(q).replace(/^idx:/,""))).filter((q)=>Number.isInteger(q)&&q>=0&&q<G.length),W=Z;for(let q of J){let z=DQ(G[q]);try{W=TQ(z,W)}catch(Y){console.warn("applySelectedRegex: script failed",q,Y)}}return W}catch(G){return console.warn("applySelectedRegex failed",G),Z}}class QZ extends Error{constructor(Z,Q){super(Z);this.name="TokenWarningError",this.tokenCount=Q}}class X8 extends Error{constructor(Z){super(Z);this.name="AIResponseError"}}class GZ extends Error{constructor(Z){super(Z);this.name="InvalidProfileError"}}function _Q(){return"/api/backends/chat-completions/generate"}async function L0({model:Z,prompt:Q,temperature:G=0.7,api:J="openai",endpoint:W=null,apiKey:q=null,extra:z={}}){let Y=_Q(),V=NQ(),X=Math.max(Number(z.max_tokens)||0,Number(q6.max_response)||0),K=Math.floor(X)||0;if(Number.isFinite(K)&&K>0)if((typeof Z==="string"?Z.toLowerCase():"").includes("gpt-5"))z.max_completion_tokens=K,delete z.max_tokens;else z.max_tokens=K;if(z.max_output_tokens!=null){let N=Number.parseFloat(z.max_output_tokens),H=Number.isFinite(N)?Math.floor(N):0;if(Number.isFinite(z.max_tokens)&&z.max_tokens>0)z.max_output_tokens=Math.min(H,z.max_tokens);else z.max_output_tokens=H}let j={messages:[{role:"user",content:Q}],model:Z,temperature:G,chat_completion_source:J,...z};if(J==="full-manual"&&W&&q)Y=W,V={"Content-Type":"application/json",Authorization:`Bearer ${q}`},j={model:Z,messages:[{role:"user",content:Q}],temperature:G,...z};else if(J==="custom"&&Z)j.custom_model_id=Z,j.custom_url=q6.custom_url||"";else if(J==="deepseek")j.custom_url="https://api.deepseek.com/chat/completions";let U=await fetch(Y,{method:"POST",headers:V,body:JSON.stringify(j)});if(!U.ok){let N="";try{N=await U.text()}catch(T){N=""}let H=Error(`LLM request failed: ${U.status} ${U.statusText}`);if(N)H.providerBody=N;throw H}let O=await U.json(),B="";if(O.choices?.[0]?.message?.content)B=O.choices[0].message.content;else if(O.completion)B=O.completion;else if(O.choices?.[0]?.text)B=O.choices[0].text;else if(O.content&&Array.isArray(O.content))B=O.content.find((H)=>H&&typeof H==="object"&&H.type==="text"&&H.text)?.text||"";else if(typeof O.content==="string")B=O.content;return{text:B,full:O}}async function i4({api:Z,model:Q,prompt:G,temperature:J=0.7,endpoint:W=null,apiKey:q=null,extra:z={}}){return await L0({model:Q,prompt:G,temperature:J,api:Z,endpoint:W,apiKey:q,extra:z})}async function IQ(Z={},Q=null){let G;if(typeof Z==="number")G={maxWaitMs:Z,initialIntervalMs:Q||250,maxIntervalMs:1000,backoffMultiplier:1.2,useExponentialBackoff:!1};else G={maxWaitMs:5000,initialIntervalMs:100,maxIntervalMs:1000,backoffMultiplier:1.5,useExponentialBackoff:!0,...Z};let{maxWaitMs:J,initialIntervalMs:W,maxIntervalMs:q,backoffMultiplier:z,useExponentialBackoff:Y,signal:V}=G,X=Date.now(),K=W,j=0,{getCurrentMemoryBooksContext:U}=await Promise.resolve().then(() => (S1(),D4)),O=U();while(Date.now()-X<J){if(V?.aborted)return!1;let B=W;if(O.isGroupChat){if(d4&&O.groupId){if(d4.find((H)=>H.id===O.groupId))return!0}}else if(ZZ&&ZZ.length>m4&&ZZ[m4])return!0;if(await new Promise((N,H)=>{let T=setTimeout(N,B);if(V){let R=()=>{clearTimeout(T),H(Error("Cancelled"))};V.addEventListener("abort",R,{once:!0})}}).catch(()=>{return!1}),Y&&B<q)B=Math.min(B*z,q)}return!1}function wQ(Z){try{if(typeof Z==="object"&&Z!==null&&Array.isArray(Z.content)){let Q=Z.content.find((G)=>G&&typeof G==="object"&&G.type==="text"&&G.text);if(Q&&typeof Q.text==="string")return Q.text}return null}catch(Q){return null}}function LQ(Z){try{let Q=0,G=0,J=!1,W=!1;for(let q=0;q<Z.length;q++){let z=Z[q];if(J){if(W)W=!1;else if(z==="\\")W=!0;else if(z==='"')J=!1}else if(z==='"')J=!0;else if(z==="{")Q++;else if(z==="}")Q--;else if(z==="[")G++;else if(z==="]")G--;if(Q<0||G<0)return!0}return J||Q!==0||G!==0}catch{return!1}}function CQ(Z){let Q=(Z||"").trim();if(!Q)return!0;if(/[.!?]["'’\)\]]?$/.test(Q))return!0;if(Q.length>=80&&!/[.!?]$/.test(Q))return!1;return!0}function hQ(Z){return String(Z).replace(/\r\n/g,`
`).replace(/^\uFEFF/,"").replace(/[\u0000-\u001F\u200B-\u200D\u2060]/g,"")}function MQ(Z){let Q=/```([\w-]*)\s*([\s\S]*?)```/g,G=[],J;while((J=Q.exec(Z))!==null)G.push((J[2]||"").trim());return G}function vQ(Z){let Q=Z.search(/[\{\[]/);if(Q===-1)return null;let G=Z[Q],J=G==="{"?"}":"]",W=0,q=!1,z=!1;for(let Y=Q;Y<Z.length;Y++){let V=Z[Y];if(q){if(z)z=!1;else if(V==="\\")z=!0;else if(V==='"')q=!1;continue}if(V==='"'){q=!0;continue}if(V===G)W++;else if(V===J){if(W--,W===0)return Z.slice(Q,Y+1).trim()}}return null}function PQ(Z){return/[\{\[]/.test(Z)}function xQ(Z){let Q=new Set,G=[];for(let J of Z)if(!Q.has(J))Q.add(J),G.push(J);return G}function C1(Z,Q,G=!0){let J=new X8(Q);J.code=Z,J.recoverable=G;try{console.debug(`STMemoryBooks: AIResponseError code=${Z} recoverable=${G}: ${Q}`)}catch{}return J}function $Z(Z){let Q=Z;try{let K=!!w8?.STMemoryBooks?.moduleSettings?.useRegex,j=w8?.STMemoryBooks?.moduleSettings?.selectedRegexIncoming;if(K&&typeof Q==="string"&&Array.isArray(j)&&j.length>0)Q=p4(Q,j)}catch(K){console.warn("STMemoryBooks: incoming regex application failed",K)}if(typeof Q==="object"&&Q!==null&&Array.isArray(Q.content)){let K=wQ(Q);if(K)Q=K;else{let j=C1("EMPTY_OR_INVALID","AI response is empty or invalid",!1);try{j.rawResponse=JSON.stringify(Q)}catch{}throw j}}else if(typeof Q==="object"&&Q!==null&&Q.content)Q=Q.content;if(typeof Q==="object"&&Q!==null)try{let j=Q?.candidates?.[0]?.content?.parts;if(Array.isArray(j)&&j.length>0){let U=j.map((O)=>O&&typeof O.text==="string"?O.text:"").join("");if(U&&U.trim())Q=U}}catch(K){}if(!Q||typeof Q!=="string"){let K=C1("EMPTY_OR_INVALID","AI response is empty or invalid",!1);try{K.rawResponse=typeof Q==="string"?Q:JSON.stringify(Q)}catch{}throw K}Q=Q.trim(),Q=Q.replace(/<think>[\s\S]*?<\/think>/gi,"");let G=hQ(Q),J=[],W=MQ(G);if(W.length)J.push(...W);J.push(G);let q=vQ(G);if(q)J.push(q);let z=xQ(J),Y=(K)=>{if(!K||typeof K!=="object")return C1("EMPTY_OR_INVALID","AI response is empty or invalid",!1);if(!K.content&&!K.summary&&!K.memory_content)return C1("MISSING_FIELDS_CONTENT","AI response missing content field",!1);if(!K.title)return C1("MISSING_FIELDS_TITLE","AI response missing title field",!1);if(!Array.isArray(K.keywords))return C1("INVALID_KEYWORDS","AI response missing or invalid keywords array.",!1);return null},V=null;for(let K of z){try{let j=JSON.parse(K),U=Y(j);if(U)V=U;else return j}catch{}try{let j=c4.default.parse(K),U=Y(j);if(U)V=U;else return j}catch{}}if(!PQ(G)){let K=C1("NO_JSON_BLOCK","AI response did not contain a JSON block. The model may have returned prose or declined the request.",!0);throw K.rawResponse=G,K}if(LQ(G)){let K=C1("UNBALANCED","AI response appears truncated or invalid JSON (unbalanced structures). Try increasing Max Response Length.",!1);throw K.rawResponse=G,K}let X=G.trim();if(X&&X.length>=80&&!CQ(X)){let K=C1("INCOMPLETE_SENTENCE","AI response JSON appears incomplete (text ends mid-sentence). Try increasing Max Response Length.",!1);throw K.rawResponse=G,K}if(V)throw V.rawResponse=G,V;{let K=C1("MALFORMED","AI did not return valid JSON. This may indicate the model does not support structured output well or the response contained unsupported formatting.",!1);throw K.rawResponse=G,K}}async function SQ(Z,Q){if(!await IQ())throw new X8("Character data is not available. This may indicate that SillyTavern is still loading. Please wait a moment and try again.");let J=Q?.effectiveConnection||Q?.connection||{};try{let W=Y1(J.api||o().api),q={};if(q6.openai_max_tokens)q.max_tokens=q6.openai_max_tokens;let{text:z,full:Y}=await L0({model:J.model,prompt:Z,temperature:J.temperature,api:W,endpoint:J.endpoint,apiKey:J.apiKey,extra:q}),V=Y?.choices?.[0]?.finish_reason||Y?.finish_reason||Y?.stop_reason,X=typeof V==="string"?V.toLowerCase():"";if(X.includes("length")||X.includes("max")){let j=C1("PROVIDER_TRUNCATION","Model response appears truncated (provider finish_reason). Please increase Max Response Length.",!1);try{j.rawResponse=z||""}catch{}try{j.providerResponse=Y||null}catch{}throw j}if(Y?.truncated===!0){let j=C1("PROVIDER_TRUNCATION_FLAG","Model response appears truncated (provider flag). Please increase Max Response Length.",!1);try{j.rawResponse=z||""}catch{}try{j.providerResponse=Y||null}catch{}throw j}let K=$Z(z);return{content:K.content||K.summary||K.memory_content||"",title:K.title||"Memory",keywords:K.keywords||[],profile:Q}}catch(W){if(W instanceof X8)throw W;let q=new X8(`Memory generation failed: ${W.message||W}`);try{if(typeof W?.providerBody==="string")q.providerBody=W.providerBody;if(typeof W?.rawResponse==="string")q.rawResponse=W.rawResponse}catch{}throw q}}async function l4(Z,Q,G={}){try{EQ(Z,Q);let J=await fQ(Z,Q),W=await yQ(J),q=G.tokenWarningThreshold??30000;if(W.total>q)throw new QZ("Token warning threshold exceeded.",W.total);let z=await SQ(J,Q),Y=kQ(z,Z);return{content:Y.content,extractedTitle:Y.extractedTitle,metadata:{sceneRange:`${Z.metadata.sceneStart}-${Z.metadata.sceneEnd}`,messageCount:Z.metadata.messageCount,characterName:Z.metadata.characterName,userName:Z.metadata.userName,chatId:Z.metadata.chatId,createdAt:new Date().toISOString(),profileUsed:Q.name,presetUsed:Q.preset||"custom",tokenUsage:W,generationMethod:"json-structured-output",version:"2.0"},suggestedKeys:Y.suggestedKeys,titleFormat:Q.useDynamicSTSettings||Q?.connection?.api==="current_st"?w8.STMemoryBooks?.titleFormat||"[000] - {{title}}":Q.titleFormat||"[000] - {{title}}",lorebookSettings:{constVectMode:Q.constVectMode,position:Q.position,orderMode:Q.orderMode,orderValue:Q.orderValue,preventRecursion:Q.preventRecursion,delayUntilRecursion:Q.delayUntilRecursion,outletName:Number(Q.position)===7?Q.outletName||"":void 0},lorebook:{content:Y.content,comment:`Auto-generated memory from messages ${Z.metadata.sceneStart}-${Z.metadata.sceneEnd}. Profile: ${Q.name}.`,key:Y.suggestedKeys||[],keysecondary:[],selective:!0,constant:!1,order:100,position:"before_char",disable:!1,addMemo:!0,excludeRecursion:!1,delayUntilRecursion:!0,probability:100,useProbability:!1}}}catch(J){if(J instanceof QZ||J instanceof X8||J instanceof GZ)throw J;throw Error(`Memory creation failed: ${J.message}`)}}function EQ(Z,Q){if(!Z||!Array.isArray(Z.messages)||Z.messages.length===0)throw Error("Invalid or empty compiled scene data provided.");let G=typeof Q?.prompt==="string"&&Q.prompt.trim().length>0,J=typeof Q?.preset==="string"&&Q.preset.trim().length>0;if(!G&&!J)throw new GZ("Invalid profile configuration. You must set either a custom prompt or a valid preset.")}function bQ(Z,Q,G=[]){let J=Z.map((q)=>{let z=q.name||"Unknown",Y=(q.mes||"").trim();return Y?`${z}: ${Y}`:null}).filter(Boolean),W=[""];if(G&&G.length>0)W.push("=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ==="),W.push("These are previous memories for context only. Do NOT include them in your new memory:"),W.push(""),G.forEach((q,z)=>{if(W.push(`Context ${z+1} - ${q.title}:`),W.push(q.content),q.keywords&&q.keywords.length>0)W.push(`Keywords: ${q.keywords.join(", ")}`);W.push("")}),W.push("=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ==="),W.push("");return W.push("=== SCENE TRANSCRIPT ==="),W.push(...J),W.push(""),W.push("=== END SCENE ==="),W.join(`
`)}async function yQ(Z){return await $0(Z,{estimatedOutput:300})}async function fQ(Z,Q){let{metadata:G,messages:J,previousSummariesContext:W}=Z,q=await R0(Q),z=AQ(q,G.userName,G.characterName),Y=bQ(J,G,W),V=`${z}

${Y}`;try{let X=!!w8?.STMemoryBooks?.moduleSettings?.useRegex,K=w8?.STMemoryBooks?.moduleSettings?.selectedRegexOutgoing;if(X&&Array.isArray(K)&&K.length>0)return p4(V,K)}catch(X){console.warn("STMemoryBooks: outgoing regex application failed",X)}return V}function kQ(Z,Q){let{content:G,title:J,keywords:W}=Z,q=(G||Z.summary||Z.memory_content||"").trim(),z=(J||"Memory").trim(),Y=Array.isArray(W)?W.filter((V)=>V&&typeof V==="string"&&V.trim()!=="").map((V)=>V.trim()):[];return{content:q,extractedTitle:z,suggestedKeys:Y}}s0();import{getContext as MJ}from"../../../extensions.js";import{METADATA_KEY as PJ,loadWorldInfo as xJ,createWorldInfoEntry as JZ,saveWorldInfo as WZ,reloadEditor as qZ}from"../../../world-info.js";import{extension_settings as o4}from"../../../extensions.js";import{moment as n4}from"../../../../lib.js";import{executeSlashCommands as gQ}from"../../../slash-commands.js";import{translate as uQ}from"../../../i18n.js";var F1="STMemoryBooks-AddLore";function S(Z,Q,G){let J=uQ(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let z=G[q];return z!==void 0&&z!==null?String(z):""})}function s4(Z){if(!Z)return null;let Q=Z.split("-");if(Q.length!==2)return null;let G=parseInt(Q[0],10),J=parseInt(Q[1],10);if(isNaN(G)||isNaN(J)||G<0||J<0)return null;return{start:G,end:J}}async function mQ(Z,Q=""){let G=Q?` (${Q})`:"";console.log(S("addlore.log.executingHideCommand",`${F1}: Executing hide command${G}: {{hideCommand}}`,{hideCommand:Z})),await gQ(Z)}async function Y6(Z,Q=""){try{await mQ(Z,Q)}catch(G){console.warn(S("addlore.warn.autohideFailed",`${F1}: Auto-hide failed:`),G)}}function dQ(Z={}){if(Z.autoHideMode)return Z.autoHideMode;if(Z.autoHideAllMessages)return"all";else if(Z.autoHideLastMemory)return"last";else return"none"}var cQ=["[000] - {{title}} ({{profile}})","{{date}} [000] \uD83C\uDFAC{{title}}, {{messages}} msgs","[000] {{date}} - {{char}} Memory","[00] - {{user}} & {{char}} {{scene}}","\uD83E\uDDE0 [000] ({{messages}} msgs)","\uD83D\uDCDA Memory #[000] - {{profile}} {{date}} {{time}}","[000] - {{scene}}: {{title}}","[000] - {{title}} ({{scene}})","[000] - {{title}}"];async function YZ(Z,Q){try{if(!Z?.content)throw Error(S("addlore.errors.invalidContent","Invalid memory result: missing content"));if(!Q?.valid||!Q.data)throw Error(S("addlore.errors.invalidLorebookValidation","Invalid lorebook validation data"));let G=o4.STMemoryBooks||{},J=Z.titleFormat;if(!J)J=G.titleFormat||S("addlore.titleFormats.8","[000] - {{title}}");let W=G.moduleSettings?.refreshEditor!==!1,q=Z.lorebookSettings||{constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0},z=JZ(Q.name,Q.data);if(!z)throw Error(S("addlore.errors.createEntryFailed","Failed to create new lorebook entry"));let Y=iQ(J,Z,Q.data);if(pQ(z,Z,Y,q),await WZ(Q.name,Q.data,!0),G.moduleSettings?.showNotifications!==!1)toastr.success(S("addlore.toast.added",'Memory "{{entryTitle}}" added to "{{lorebookName}}"',{entryTitle:Y,lorebookName:Q.name}),S("addlore.toast.title","STMemoryBooks"));if(W)try{await Promise.resolve(qZ(Q.name))}catch(X){console.warn(S("addlore.warn.refreshEditorFailed",`${F1}: reloadEditor failed:`),X)}let V=dQ(G.moduleSettings);if(V!=="none"){let X=G.moduleSettings.unhiddenEntriesCount??2;if(V==="all"){let K=s4(Z.metadata?.sceneRange);if(!K)console.warn(S("addlore.warn.autohideSkippedInvalidRange",`${F1}: Auto-hide skipped - invalid scene range: "{{range}}"`,{range:Z.metadata?.sceneRange})),toastr.warning(S("addlore.toast.autohideInvalidRange","Auto-hide skipped: invalid scene range metadata"),S("addlore.toast.title","STMemoryBooks"));else{let{start:j,end:U}=K;if(X===0)await Y6(`/hide 0-${U}`,S("addlore.hideCommand.allComplete","all mode - complete"));else{let O=U-X;if(O>=0)await Y6(`/hide 0-${O}`,S("addlore.hideCommand.allPartial","all mode - partial"))}}}else if(V==="last"){let K=s4(Z.metadata?.sceneRange);if(!K)console.warn(S("addlore.warn.autohideSkippedInvalidRange",`${F1}: Auto-hide skipped - invalid scene range: "{{range}}"`,{range:Z.metadata?.sceneRange})),toastr.warning(S("addlore.toast.autohideInvalidRange","Auto-hide skipped: invalid scene range metadata"),S("addlore.toast.title","STMemoryBooks"));else{let{start:j,end:U}=K,O=U-j+1;if(X>=O);else if(X===0)await Y6(`/hide ${j}-${U}`,S("addlore.hideCommand.lastHideAll","last mode - hide all"));else{let B=U-X;if(B>=j)await Y6(`/hide ${j}-${B}`,S("addlore.hideCommand.lastPartial","last mode - partial"))}}}}return rQ(Z),{success:!0,entryId:z.uid,entryTitle:Y,lorebookName:Q.name,keywordCount:Z.suggestedKeys?.length||0,message:S("addlore.result.added",'Memory successfully added to "{{lorebookName}}"',{lorebookName:Q.name})}}catch(G){if(console.error(S("addlore.log.addFailed",`${F1}: Failed to add memory to lorebook:`),G),o4.STMemoryBooks?.moduleSettings?.showNotifications!==!1)toastr.error(S("addlore.toast.addFailed","Failed to add memory: {{message}}",{message:G.message}),S("addlore.toast.title","STMemoryBooks"));return{success:!1,error:G.message,message:S("addlore.result.addFailed","Failed to add memory to lorebook: {{message}}",{message:G.message})}}}function pQ(Z,Q,G,J){Z.content=Q.content,Z.key=Q.suggestedKeys||[],Z.comment=G;let W=L8(G)||1;switch(J.constVectMode){case"blue":Z.constant=!0,Z.vectorized=!1;break;case"green":Z.constant=!1,Z.vectorized=!1;break;case"link":default:Z.constant=!1,Z.vectorized=!0;break}if(Z.position=J.position,Number(J.position)===7){let q=String(J.outletName||"").trim();if(q)Z.outletName=q}if(J.orderMode==="manual")Z.order=J.orderValue;else Z.order=W;if(Z.preventRecursion=J.preventRecursion,Z.delayUntilRecursion=J.delayUntilRecursion,Z.keysecondary=[],Z.selective=!0,Z.selectiveLogic=0,Z.addMemo=!0,Z.disable=!1,Z.excludeRecursion=!1,Z.probability=100,Z.useProbability=!0,Z.depth=4,Z.group="",Z.groupOverride=!1,Z.groupWeight=100,Z.scanDepth=null,Z.caseSensitive=null,Z.matchWholeWords=null,Z.useGroupScoring=null,Z.automationId="",Z.role=null,Z.sticky=0,Z.cooldown=0,Z.delay=0,Z.displayIndex=W,Z.stmemorybooks=!0,Q.metadata?.sceneRange){let q=Q.metadata.sceneRange.split("-");if(q.length===2)Z.STMB_start=parseInt(q[0],10),Z.STMB_end=parseInt(q[1],10)}}function r4(Z){return Z.stmemorybooks===!0}function iQ(Z,Q,G){let J=Z,W=[{pattern:/\[\[0+\]\]/g,prefix:"[",suffix:"]"},{pattern:/\[0+\]/g,prefix:"",suffix:""},{pattern:/\(\[0+\]\)/g,prefix:"(",suffix:")"},{pattern:/\{\[0+\]\}/g,prefix:"{",suffix:"}"},{pattern:/#\[0+\]/g,prefix:"#",suffix:""}];for(let{pattern:Y,prefix:V,suffix:X}of W){let K=J.match(Y);if(K){let j=lQ(G,Z);K.forEach((U)=>{let O;if(Y.source.includes("\\[\\["))O=U.length-4;else if(Y.source.includes("\\(\\[")||Y.source.includes("\\{\\["))O=U.length-4;else if(Y.source.includes("#\\["))O=U.length-3;else if(Y.source.includes("\\["))O=U.length-2;else O=U.length-2;let B=j.toString().padStart(O,"0"),N=V+B+X;J=J.replace(U,N)});break}}let q=Q.metadata||{},z={"{{title}}":Q.extractedTitle||S("addlore.defaults.title","Memory"),"{{scene}}":S("addlore.defaults.scene","Scene {{range}}",{range:q.sceneRange||S("common.unknown","Unknown")}),"{{char}}":q.characterName||S("common.unknown","Unknown"),"{{user}}":q.userName||S("addlore.defaults.user","User"),"{{messages}}":q.messageCount||0,"{{profile}}":q.profileUsed||S("common.unknown","Unknown"),"{{date}}":n4().format("YYYY-MM-DD"),"{{time}}":n4().format("HH:mm:ss")};return Object.entries(z).forEach(([Y,V])=>{J=J.replace(new RegExp(Y.replace(/[{}]/g,"\\$&"),"g"),V)}),J=sQ(J),J}function lQ(Z,Q=null){if(!Z.entries)return 1;let G=Object.values(Z.entries),J=[];if(G.forEach((q)=>{if(r4(q)&&q.comment){let z=Q?oQ(q.comment,Q):L8(q.comment);if(z!==null)J.push(z)}}),J.length===0)return 1;return Math.max(...J)+1}function oQ(Z,Q){if(!Z||typeof Z!=="string"||!Q||typeof Q!=="string")return null;let G=[/\[0+\]/g,/\(0+\)/g,/\{0+\}/g,/#0+/g],J=[],W=null;for(let z of G){let Y=[...Q.matchAll(z)];if(Y.length>0){J=Y,W=z;break}}if(J.length===0)return L8(Z);let q=nQ(Q);if(q=q.replace(/\\\{\\\{[^}]+\\\}\\\}/g,".*?"),W.source.includes("\\["))q=q.replace(/\\\[0+\\\]/g,"(\\d+)");else if(W.source.includes("\\("))q=q.replace(/\\\(0+\\\)/g,"(\\d+)");else if(W.source.includes("\\{"))q=q.replace(/\\\{0+\\\}/g,"(\\d+)");else if(W.source.includes("#"))q=q.replace(/#0+/g,"(\\d+)");try{let z=Z.match(new RegExp(q));if(z&&z[1]){let Y=parseInt(z[1],10);return isNaN(Y)?null:Y}}catch(z){}return L8(Z)}function nQ(Z){return Z.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function L8(Z){if(!Z||typeof Z!=="string")return null;let Q=Z.match(/\[(\d+)\]/);if(Q){let Y=parseInt(Q[1],10);return isNaN(Y)?null:Y}let G=Z.match(/\((\d+)\)/);if(G){let Y=parseInt(G[1],10);return isNaN(Y)?null:Y}let J=Z.match(/\{(\d+)\}/);if(J){let Y=parseInt(J[1],10);return isNaN(Y)?null:Y}let W=Z.match(/#(\d+)(?:-(\d+))?/);if(W){let Y=parseInt(W[1],10),V=W[2]?parseInt(W[2],10):null,X=V!==null?V:Y;return isNaN(X)?null:X}let q=Z.match(/^(\d+)(?:\s*[-\s])/);if(q){let Y=parseInt(q[1],10);return isNaN(Y)?null:Y}let z=[...Z.matchAll(/(\d+)/g)];for(let Y of z){let V=parseInt(Y[1],10);if(isNaN(V))continue;let X=Y[0],K=Y.index,j=Z.substring(Math.max(0,K-10),K),U=Z.substring(K+X.length,K+X.length+10);if(!(/\d{4}-\d{2}-\d{2}/.test(j+X+U)||/\d{4}-\d{1,2}/.test(j+X)||/-\d{1,2}-\d{1,2}/.test(X+U)))return V}return null}function V8(Z){if(!Z.entries)return[];let Q=Object.values(Z.entries),G=[];return Q.forEach((J)=>{if(r4(J)){let W=L8(J.comment)||0;G.push({number:W,title:J.comment,content:J.content,keywords:J.key||[],entry:J})}}),G.sort((J,W)=>J.number-W.number),G}function sQ(Z){return String(Z??"").replace(/[\u0000-\u001F\u007F-\u009F]/g,"").trim()||S("addlore.sanitize.fallback","Auto Memory")}function q0(){return cQ.map((Z,Q)=>S(`addlore.titleFormats.${Q}`,Z))}function a4(Z){if(typeof Z.STMB_start==="number"&&typeof Z.STMB_end==="number")return{start:Z.STMB_start,end:Z.STMB_end};return null}function rQ(Z){try{console.log(S("addlore.log.updateHighestCalled",`${F1}: updateHighestMemoryProcessed called with:`),Z);let Q=Z.metadata?.sceneRange;if(console.log(S("addlore.log.sceneRangeExtracted",`${F1}: sceneRange extracted:`),Q),!Q){console.warn(S("addlore.warn.noSceneRange",`${F1}: No scene range found in memory result, cannot update highest processed`));return}let G=Q.split("-");if(G.length!==2){console.warn(S("addlore.warn.invalidSceneRangeFormat",`${F1}: Invalid scene range format: {{range}}`,{range:Q}));return}let J=parseInt(G[1],10);if(isNaN(J)){console.warn(S("addlore.warn.invalidEndMessage",`${F1}: Invalid end message number: {{end}}`,{end:G[1]}));return}let W=g();if(!W){console.warn(S("addlore.warn.noSceneMarkers",`${F1}: Could not get scene markers to update highest processed`));return}W.highestMemoryProcessed=J,Z1(),console.log(S("addlore.log.setHighest",`${F1}: Set highest memory processed to message {{endMessage}}`,{endMessage:J}))}catch(Q){console.error(S("addlore.log.updateHighestError",`${F1}: Error updating highest memory processed:`),Q)}}function X1(Z,Q){if(!Z||!Z.entries||!Q)return null;let G=Object.values(Z.entries);for(let J of G)if((J.comment||"")===Q)return J;return null}async function C8(Z,Q,G,J={}){let{refreshEditor:W=!0}=J;if(!Z||!Q||!Array.isArray(G))throw Error(S("addlore.upsert.errors.invalidArgs","Invalid arguments to upsertLorebookEntriesBatch"));let q=[];for(let z of G){if(!z||!z.title)continue;let Y=String(z.title),V=z.content!=null?String(z.content):"",X=z.defaults||{},K=z.metadataUpdates||{},j=z.entryOverrides||{},U=X1(Q,Y),O=!1;if(!U){if(U=JZ(Z,Q),!U)throw Error(S("addlore.upsert.errors.createFailed","Failed to create lorebook entry"));if(U.vectorized=!!X.vectorized,U.selective=!!X.selective,typeof X.order==="number")U.order=X.order;if(typeof X.position==="number")U.position=X.position;U.disable=!1,O=!0}if(U.key=Array.isArray(U.key)?U.key:[],U.keysecondary=Array.isArray(U.keysecondary)?U.keysecondary:[],typeof U.disable!=="boolean")U.disable=!1;U.comment=Y,U.content=V;for(let[B,N]of Object.entries(K))U[B]=N;for(let[B,N]of Object.entries(j))U[B]=N;q.push({title:Y,uid:U.uid,created:O})}if(await WZ(Z,Q,!0),W)qZ(Z);return q}async function zZ(Z,Q,G,J,W={}){let{defaults:q={vectorized:!0,selective:!0,order:100,position:0},metadataUpdates:z={},refreshEditor:Y=!0,entryOverrides:V={}}=W;if(!Z||!Q||!G)throw Error(S("addlore.upsert.errors.invalidArgs","Invalid arguments to upsertLorebookEntryByTitle"));let X=X1(Q,G),K=!1;if(!X){if(X=JZ(Z,Q),!X)throw Error(S("addlore.upsert.errors.createFailed","Failed to create lorebook entry"));if(X.vectorized=!!q.vectorized,X.selective=!!q.selective,typeof q.order==="number")X.order=q.order;if(typeof q.position==="number")X.position=q.position;X.key=X.key||[],X.keysecondary=X.keysecondary||[],X.disable=!1,K=!0}X.comment=G,X.content=J!=null?String(J):"";for(let[j,U]of Object.entries(z||{}))X[j]=U;for(let[j,U]of Object.entries(V||{}))X[j]=U;if(await WZ(Z,Q,!0),Y)qZ(Z);return{uid:X.uid,created:K}}import{getCurrentChatId as aQ,name1 as tQ,name2 as eQ,chat_metadata as ZG,saveMetadata as QG}from"../../../../script.js";import{createNewWorldInfo as GG,METADATA_KEY as $G,world_names as XZ}from"../../../world-info.js";import{translate as JG}from"../../../i18n.js";var z6="STMemoryBooks-AutoCreate";function h1(Z,Q,G){let J=JG(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let z=G[q];return z!==void 0&&z!==null?String(z):""})}function WG(Z){if(!Z||Z.trim()==="")Z=h1("STMemoryBooks_LorebookNameTemplatePlaceholder","LTM - {{char}} - {{chat}}");let Q=aQ()||h1("common.unknown","Unknown"),G=eQ||h1("common.unknown","Unknown"),J=tQ||h1("addlore.defaults.user","User"),W=Z.replace(/\{\{chat\}\}/g,Q).replace(/\{\{char\}\}/g,G).replace(/\{\{user\}\}/g,J);if(W=W.replace(/[\/\\:*?"<>|]/g,"_").replace(/_{2,}/g,"_").substring(0,60),!XZ||!XZ.includes(W))return W;for(let q=2;q<=999;q++){let z=`${W} ${q}`;if(!XZ.includes(z))return z}return`${W} ${Date.now()}`}async function X6(Z,Q="chat"){try{let G=WG(Z);if(console.log(h1("autocreate.log.creating",`${z6}: Auto-creating lorebook "{{name}}" for {{context}}`,{name:G,context:Q})),await GG(G))return ZG[$G]=G,await QG(),console.log(h1("autocreate.log.created",`${z6}: Successfully created and bound lorebook "{{name}}"`,{name:G})),toastr.success(h1("autocreate.toast.createdBound",'Created and bound lorebook "{{name}}"',{name:G}),h1("autocreate.toast.title","STMemoryBooks")),{success:!0,name:G};else return console.error(h1("autocreate.log.createFailed",`${z6}: Failed to create lorebook`)),{success:!1,error:h1("autocreate.errors.failedAutoCreate","Failed to auto-create lorebook.")}}catch(G){return console.error(h1("autocreate.log.createError",`${z6}: Error creating lorebook:`),G),{success:!1,error:h1("autocreate.errors.failedAutoCreateWithMessage","Failed to auto-create lorebook: {{message}}",{message:G.message})}}}s0();S1();import{extension_settings as h8}from"../../../extensions.js";import{chat as V6,chat_metadata as qG}from"../../../../script.js";import{METADATA_KEY as YG,world_names as t4}from"../../../world-info.js";import{Popup as zG,POPUP_TYPE as XG,POPUP_RESULT as e4}from"../../../popup.js";import{translate as VG}from"../../../i18n.js";function n(Z,Q,G){let J=VG(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let z=G[q];return z!==void 0&&z!==null?String(z):""})}async function KG(){let Z=h8.STMemoryBooks,Q;if(!Z.moduleSettings.manualModeEnabled){if(Q=qG?.[YG]||null,!Q&&Z?.moduleSettings?.autoCreateLorebook){let G=Z.moduleSettings.lorebookNameTemplate||n("STMemoryBooks_LorebookNameTemplatePlaceholder","LTM - {{char}} - {{chat}}"),J=await X6(G,"auto-summary");if(J.success)Q=J.name;else return{valid:!1,error:J.error}}}else{let G=g()||{};if(Q=G.manualLorebook??null,!Q){let W=new zG(`
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
            `,XG.TEXT,"",{okButton:n("STMemoryBooks_Button_SelectLorebook","Select Lorebook"),cancelButton:n("STMemoryBooks_Button_Postpone","Postpone")});if(await W.show()===e4.AFFIRMATIVE){let z=await T0();if(z)G.manualLorebook=z,Z1(),Q=z;else return{valid:!1,error:n("STMemoryBooks_Error_NoLorebookSelectedForAutoSummary","No lorebook selected for auto-summary.")}}else{let z=W.dlg.querySelector("#stmb-postpone-messages"),Y=parseInt(z.value,10),V=Number.isFinite(Y)?Y:10,X=V6.length;return G.autoSummaryNextPromptAt=X+V,Z1(),console.log(n("autosummary.log.postponed","STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})",{count:V,until:G.autoSummaryNextPromptAt})),{valid:!1,error:n("STMemoryBooks_Info_AutoSummaryPostponed","Auto-summary postponed for {{count}} messages.",{count:V})}}}}if(!Q)return{valid:!1,error:n("STMemoryBooks_Error_NoLorebookForAutoSummary","No lorebook available for auto-summary.")};if(!t4||!t4.includes(Q))return{valid:!1,error:n("STMemoryBooks_Error_SelectedLorebookNotFound",'Selected lorebook "{{name}}" not found.',{name:Q})};try{let{loadWorldInfo:G}=await import("../../../world-info.js"),J=await G(Q);return{valid:!!J,data:J,name:Q}}catch(G){return{valid:!1,error:n("STMemoryBooks_Error_FailedToLoadSelectedLorebook","Failed to load the selected lorebook.")}}}async function Z5(){try{let Z=h8.STMemoryBooks;if(!Z?.moduleSettings?.autoSummaryEnabled)return;let Q=g()||{},G=V6.length,J=G-1,W=Z.moduleSettings.autoSummaryInterval,q=Z?.moduleSettings?.autoSummaryBuffer,z=K1(parseInt(q)||0,0,50),Y=W+z,V=Q.highestMemoryProcessed??null;if($5()){console.log(n("autosummary.log.skippedInProgress","STMemoryBooks: Auto-summary skipped - memory creation in progress"));return}let X;if(V===null)X=G,console.log(n("autosummary.log.noPrevious","STMemoryBooks: No previous memories found - counting from start"));else X=J-V,console.log(n("autosummary.log.sinceLast","STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}",{highestProcessed:V,count:X}));if(console.log(n("autosummary.log.triggerCheck","STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?",{count:X,required:Y})),X<Y){console.log(n("autosummary.log.notTriggered","STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages",{needed:Y-X}));return}if(Q.autoSummaryNextPromptAt&&G<Q.autoSummaryNextPromptAt){console.log(n("autosummary.log.postponedUntil","STMemoryBooks: Auto-summary postponed until message {{until}}",{until:Q.autoSummaryNextPromptAt}));return}let K=await KG();if(!K.valid){console.log(n("autosummary.log.blocked","STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}",{error:K.error}));return}if(Q.autoSummaryNextPromptAt)delete Q.autoSummaryNextPromptAt,Z1(),console.log(n("autosummary.log.clearedPostpone","STMemoryBooks: Cleared auto-summary postpone flag"));let j,U,O=J-z,B=Math.max(0,O);if(V===null)j=0,U=B;else j=V+1,U=B;if(j>U)return;console.log(n("autosummary.log.triggered","STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}",{start:j,end:U})),Q.sceneStart=j,Q.sceneEnd=U,Z1();let{executeSlashCommands:N}=await import("../../../slash-commands.js");await N("/creatememory")}catch(Z){console.error(n("autosummary.log.triggerError","STMemoryBooks: Error in auto-summary trigger check:"),Z)}}async function Q5(){try{let Z=$8();if(!Z.isGroupChat&&h8.STMemoryBooks.moduleSettings.autoSummaryEnabled){let Q=V6.length;console.log(n("autosummary.log.messageReceivedSingle","STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}",{count:Q})),await Z5()}else if(Z.isGroupChat)console.log(n("autosummary.log.messageReceivedGroup","STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED"))}catch(Z){console.error(n("autosummary.log.messageHandlerError","STMemoryBooks: Error in auto-summary message received handler:"),Z)}}async function G5(){try{if(h8.STMemoryBooks.moduleSettings.autoSummaryEnabled){let Z=V6.length;console.log(n("autosummary.log.groupFinished","STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}",{count:Z})),await Z5()}}catch(Z){console.error(n("autosummary.log.groupHandlerError","STMemoryBooks: Error in auto-summary group finished handler:"),Z)}}function VZ(){if(h8.STMemoryBooks?.moduleSettings?.autoSummaryEnabled)n0()}S1();import{saveSettingsDebounced as M8}from"../../../../script.js";import{Popup as K6,POPUP_TYPE as K8,POPUP_RESULT as Y0}from"../../../popup.js";import{moment as J5,Handlebars as UG,DOMPurify as W5}from"../../../../lib.js";r8();import{t as KZ,translate as u}from"../../../i18n.js";var R1="STMemoryBooks-ProfileManager",q5=UG.compile(`
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
`);async function Y5(Z,Q,G){let J=Z.profiles[Q];if(!J){console.error(`${R1}: No profile found at index ${Q}`);return}try{let W=o();await Z8(Z);let z=(await A0()).map((B)=>({value:B.key,displayName:B.displayName,selected:B.key===(J.preset||"")})),Y=J.connection||{temperature:0.7},V=J.titleFormat||Z.titleFormat||"[000] - {{title}}",X=q0(),K={name:J.name,connection:Y,api:"openai",prompt:J.prompt||"",preset:J.preset||"",currentApi:W.api||"Unknown",presetOptions:z,isProviderLocked:J.name==="Current SillyTavern Settings",titleFormat:V,titleFormats:X.map((B)=>({value:B,isSelected:B===V})),showCustomTitleInput:!X.includes(V),constVectMode:J.constVectMode,position:J.position,orderMode:J.orderMode,orderValue:J.orderValue,preventRecursion:J.preventRecursion,delayUntilRecursion:J.delayUntilRecursion,outletName:J.outletName||"",hasLegacyCustomPrompt:J.prompt&&J.prompt.trim()?!0:!1},j=W5.sanitize(q5(K)),U=new K6(`<h3>${u("Edit Profile","STMemoryBooks_ProfileEditTitle")}</h3>${j}`,K8.TEXT,"",{okButton:u("Save","STMemoryBooks_Save"),cancelButton:u("Cancel/Close","STMemoryBooks_CancelClose"),wide:!0,large:!0,allowVerticalScrolling:!0});if(U5(U,Z),await U.show()===Y0.AFFIRMATIVE){let B=j5(U.dlg,J.name);if(!W8(B)){toastr.error(u("Invalid profile data","STMemoryBooks_InvalidProfileData"),"STMemoryBooks");return}if(Z.profiles[Q]=B,M8(),G)G();toastr.success(u("Profile updated successfully","STMemoryBooks_ProfileUpdatedSuccess"),"STMemoryBooks")}}catch(W){console.error(`${R1}: Error editing profile:`,W),toastr.error(u("Failed to edit profile","STMemoryBooks_FailedToEditProfile"),"STMemoryBooks")}}async function z5(Z,Q){try{let G=Z.profiles.map((O)=>O.name),J=D0("New Profile",G),W=o(),q=Z.titleFormat||"[000] - {{title}}",z=q0();await Z8(Z);let V=(await A0()).map((O)=>({value:O.key,displayName:O.displayName,selected:!1})),X={name:J,connection:{temperature:0.7},api:"",prompt:"",preset:"",currentApi:W.api||"Unknown",presetOptions:V,isProviderLocked:J==="Current SillyTavern Settings",titleFormat:q,titleFormats:z.map((O)=>({value:O,isSelected:O===q})),showCustomTitleInput:!z.includes(q),constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0,outletName:""},K=W5.sanitize(q5(X)),j=new K6(`<h3>${u("New Profile","STMemoryBooks_NewProfileTitle")}</h3>${K}`,K8.TEXT,"",{okButton:u("Create","STMemoryBooks_Create"),cancelButton:u("Cancel/Close","STMemoryBooks_CancelClose"),wide:!0,large:!0,allowVerticalScrolling:!0});if(U5(j,Z),await j.show()===Y0.AFFIRMATIVE){let O=j5(j.dlg,J),B=D0(O.name,G);if(O.name=B,!W8(O)){toastr.error(u("Invalid profile data","STMemoryBooks_InvalidProfileData"),"STMemoryBooks");return}if(Z.profiles.push(O),M8(),Q)Q();toastr.success(u("Profile created successfully","STMemoryBooks_ProfileCreatedSuccess"),"STMemoryBooks")}}catch(G){console.error(`${R1}: Error creating profile:`,G),toastr.error(u("Failed to create profile","STMemoryBooks_FailedToCreateProfile"),"STMemoryBooks")}}async function X5(Z,Q,G){if(Z.profiles.length<=1){toastr.error(u("Cannot delete the last profile","STMemoryBooks_CannotDeleteLastProfile"),"STMemoryBooks");return}let J=Z.profiles[Q];if(J?.name==="Current SillyTavern Settings"){toastr.error(u('Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',"STMemoryBooks_CannotDeleteDefaultProfile"),"STMemoryBooks");return}try{let W=u('Delete profile "{{name}}"?',"STMemoryBooks_DeleteProfileConfirm").replace("{{name}}",J.name);if(await new K6(W,K8.CONFIRM,"").show()===Y0.AFFIRMATIVE){let z=J.name;if(Z.profiles.splice(Q,1),Z.defaultProfile===Q)Z.defaultProfile=0;else if(Z.defaultProfile>Q)Z.defaultProfile--;if(M8(),G)G();toastr.success(u("Profile deleted successfully","STMemoryBooks_ProfileDeletedSuccess"),"STMemoryBooks")}}catch(W){console.error(`${R1}: Error deleting profile:`,W),toastr.error(u("Failed to delete profile","STMemoryBooks_FailedToDeleteProfile"),"STMemoryBooks")}}function V5(Z){try{let Q={profiles:Z.profiles,exportDate:J5().toISOString(),version:1,moduleVersion:Z.migrationVersion||1},G=JSON.stringify(Q,null,2),J=new Blob([G],{type:"application/json"}),W=document.createElement("a");W.href=URL.createObjectURL(J),W.download=`stmemorybooks-profiles-${J5().format("YYYY-MM-DD")}.json`,document.body.appendChild(W),W.click(),document.body.removeChild(W),setTimeout(()=>URL.revokeObjectURL(W.href),1000),toastr.success(u("Profiles exported successfully","STMemoryBooks_ProfilesExportedSuccess"),"STMemoryBooks")}catch(Q){console.error(`${R1}: Error exporting profiles:`,Q),toastr.error(u("Failed to export profiles","STMemoryBooks_FailedToExportProfiles"),"STMemoryBooks")}}function jG(Z){return _0(Z)}function K5(Z,Q,G){let J=Z.target.files[0];if(!J)return;let W=new FileReader;W.onload=function(q){try{let z=JSON.parse(q.target.result);if(!z.profiles||!Array.isArray(z.profiles))throw Error(u("Invalid profile data format - missing profiles array","STMemoryBooks_ImportErrorInvalidFormat"));let Y=z.profiles.filter((j)=>W8(j)).map((j)=>jG(j));if(Y.length===0)throw Error(u("No valid profiles found in import file","STMemoryBooks_ImportErrorNoValidProfiles"));let V=0,X=0,K=Q.profiles.map((j)=>j.name);if(Y.forEach((j)=>{if(!K.includes(j.name)){let O=D0(j.name,K);j.name=O,K.push(O),Q.profiles.push(j),V++}else X++}),V>0){if(M8(),G)G();let j=KZ`Imported ${V} profile${V===1?"":"s"}`;if(X>0)j+=KZ` (${X} duplicate${X===1?"":"s"} skipped)`;toastr.success(j,u("STMemoryBooks profile import completed","STMemoryBooks_ImportComplete"))}else toastr.warning(u("No new profiles imported - all profiles already exist","STMemoryBooks_ImportNoNewProfiles"),"STMemoryBooks")}catch(z){console.error(`${R1}: Error importing profiles:`,z),toastr.error(KZ`Failed to import profiles: ${z.message}`,"STMemoryBooks")}},W.onerror=function(){console.error(`${R1}: Error reading import file`),toastr.error(u("Failed to read import file","STMemoryBooks_ImportReadError"),"STMemoryBooks")},W.readAsText(J),Z.target.value=""}function U5(Z,Q){let G=Z.dlg;G.querySelector("#stmb-open-prompt-manager")?.addEventListener("click",()=>{try{let q=document.querySelector("#stmb-prompt-manager");if(q)q.click();else toastr.error(u("Prompt Manager button not found. Open main settings and try again.","STMemoryBooks_PromptManagerNotFound"),"STMemoryBooks")}catch(q){console.error(`${R1}: Error opening prompt manager from profile editor:`,q),toastr.error(u("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}),G.querySelector("#stmb-refresh-presets")?.addEventListener("click",async()=>{try{let q=G.querySelector("#stmb-profile-preset");if(!q)return;let z=q.value,Y=await A0();if(q.innerHTML="",Y.forEach((V)=>{let X=document.createElement("option");if(X.value=V.key,X.textContent=V.displayName,V.key===z)X.selected=!0;q.appendChild(X)}),![...q.options].some((V)=>V.value===z)&&q.options.length>0)q.selectedIndex=0;toastr.success(u("Preset list refreshed","STMemoryBooks_PresetListRefreshed"),"STMemoryBooks")}catch(q){console.error(`${R1}: Error refreshing presets:`,q),toastr.error(u("Failed to refresh presets","STMemoryBooks_FailedToRefreshPresets"),"STMemoryBooks")}});let J=async()=>{try{let q=G.querySelector("#stmb-profile-preset");if(!q)return;let z=q.value,Y=await A0();if(q.innerHTML="",Y.forEach((V)=>{let X=document.createElement("option");if(X.value=V.key,X.textContent=V.displayName,V.key===z)X.selected=!0;q.appendChild(X)}),![...q.options].some((V)=>V.value===z)&&q.options.length>0)q.selectedIndex=0}catch(q){console.error(`${R1}: Error auto-refreshing presets on update:`,q)}};window.addEventListener("stmb-presets-updated",J),Z?.dlg?.addEventListener("close",()=>{window.removeEventListener("stmb-presets-updated",J)}),G.querySelector("#stmb-move-to-preset")?.addEventListener("click",async()=>{try{let q=G.querySelector("#stmb-legacy-custom-prompt"),z=q?q.textContent:"";if(!z||!z.trim()){toastr.error(t("STMemoryBooks_NoCustomPromptToMigrate","No custom prompt to migrate"),"STMemoryBooks");return}let X=`Custom: ${G.querySelector("#stmb-profile-name")?.value?.trim()||"Profile"}`,K=await I8(null,z,X);if(await new K6(`<h3 data-i18n="STMemoryBooks_MoveToPresetConfirmTitle">Move to Preset</h3><p data-i18n="STMemoryBooks_MoveToPresetConfirmDesc">Create a preset from this profile's custom prompt, set the preset on this profile, and clear the custom prompt?</p>`,K8.CONFIRM,"",{okButton:u("Apply","STMemoryBooks_Apply"),cancelButton:u("Cancel","STMemoryBooks_Cancel")}).show()===Y0.AFFIRMATIVE){let O=G.querySelector("#stmb-profile-preset");if(O){if(![...O.options].some((B)=>B.value===K)){let B=document.createElement("option");B.value=K,B.textContent=X,O.appendChild(B)}O.value=K}q?.remove(),G.querySelector("#stmb-move-to-preset")?.remove(),toastr.success(u("Preset created and selected. Remember to Save.","STMemoryBooks_CustomPromptMigrated"),"STMemoryBooks")}}catch(q){console.error(`${R1}: Error moving custom prompt to preset:`,q),toastr.error(u("Failed to move custom prompt to preset","STMemoryBooks_FailedToMigrateCustomPrompt"),"STMemoryBooks")}}),G.querySelector("#stmb-profile-title-format-select")?.addEventListener("change",(q)=>{let z=G.querySelector("#stmb-profile-custom-title-format");if(q.target.value==="custom")z.classList.remove("displayNone"),z.focus();else z.classList.add("displayNone")}),G.querySelector("#stmb-profile-temperature")?.addEventListener("input",(q)=>{let z=parseFloat(q.target.value);if(!isNaN(z)){if(z<0)q.target.value=0;if(z>2)q.target.value=2}}),G.querySelector("#stmb-profile-model")?.addEventListener("input",(q)=>{q.target.value=q.target.value.replace(/[<>]/g,"")}),G.querySelector("#stmb-profile-api")?.addEventListener("change",(q)=>{let z=G.querySelector("#stmb-full-manual-section"),Y=G.querySelector("#stmb-profile-model"),V=G.querySelector("#stmb-profile-temperature");if(q.target.value==="full-manual")z.classList.remove("displayNone");else z.classList.add("displayNone");let X=q.target.value==="current_st";if(Y)Y.disabled=X,Y.title=X?"Managed by SillyTavern UI":"";if(V)V.disabled=X,V.title=X?"Managed by SillyTavern UI":""}),G.querySelectorAll('input[name="order-mode"]').forEach((q)=>{q.addEventListener("change",(z)=>{let Y=G.querySelector("#stmb-profile-order-value");if(z.target.value==="manual")Y.classList.remove("displayNone");else Y.classList.add("displayNone")})});let W=G.querySelector("#stmb-profile-position");W?.addEventListener("change",()=>{let q=G.querySelector("#stmb-profile-outlet-name-container");if(q)q.classList.toggle("displayNone",W.value!=="7")}),function(){let q=G.querySelector("#stmb-profile-outlet-name-container");if(W&&q)q.classList.toggle("displayNone",W.value!=="7")}();try{let q=G.querySelector('h4[data-i18n="STMemoryBooks_RecursionSettings"]'),z=q?q.parentElement?.querySelector(".buttons_block"):null;if(z&&!G.querySelector("#stmb-convert-existing-recursion")){let Y=document.createElement("label");Y.className="checkbox_label";let V=document.createElement("input");V.type="checkbox",V.id="stmb-convert-existing-recursion",V.checked=!!(Q&&Q.moduleSettings&&Q.moduleSettings.convertExistingRecursion);let X=document.createElement("span");X.textContent="Also convert recursion settings on existing entries";try{X.setAttribute("data-i18n","STMemoryBooks_ConvertExistingRecursion")}catch(K){}Y.appendChild(V),Y.appendChild(X),z.appendChild(Y),V.addEventListener("change",()=>{try{Q.moduleSettings=Q.moduleSettings||{},Q.moduleSettings.convertExistingRecursion=!!V.checked,M8()}catch(K){console.error(`${R1}: Failed to save convertExistingRecursion flag`,K)}})}}catch(q){console.warn(`${R1}: Failed to inject convertExistingRecursion checkbox`,q)}}function j5(Z,Q){let G={name:Z.querySelector("#stmb-profile-name")?.value.trim()||Q,api:Z.querySelector("#stmb-profile-api")?.value,model:Z.querySelector("#stmb-profile-model")?.value,temperature:Z.querySelector("#stmb-profile-temperature")?.value,endpoint:Z.querySelector("#stmb-profile-endpoint")?.value,apiKey:Z.querySelector("#stmb-profile-apikey")?.value,constVectMode:Z.querySelector("#stmb-profile-const-vect")?.value,position:Z.querySelector("#stmb-profile-position")?.value,orderMode:Z.querySelector('input[name="order-mode"]:checked')?.value,orderValue:Z.querySelector("#stmb-profile-order-value")?.value,preventRecursion:Z.querySelector("#stmb-profile-prevent-recursion")?.checked,delayUntilRecursion:Z.querySelector("#stmb-profile-delay-recursion")?.checked},J=Z.querySelector("#stmb-profile-preset");G.prompt="",G.preset=J?.value||"";let W=Z.querySelector("#stmb-profile-title-format-select");if(W?.value==="custom")G.titleFormat=Z.querySelector("#stmb-profile-custom-title-format")?.value;else if(W)G.titleFormat=W.value;if(G.position==="7"||G.position===7)G.outletName=Z.querySelector("#stmb-profile-outlet-name")?.value?.trim()||"";return _0(G)}function UZ(Z){let Q=[],G=[];if(!Z.profiles||!Array.isArray(Z.profiles))Z.profiles=[],G.push("Created empty profiles array");if(Z.profiles.length===0){let J=_0({name:"Current SillyTavern Settings",api:"current_st",preset:"summary"});Z.profiles.push(J),G.push('Added default profile using provider "Current SillyTavern Settings".')}if(Z.profiles=Z.profiles.map((J)=>{if(J&&J.useDynamicSTSettings)J.connection=J.connection||{},J.connection.api="current_st",delete J.useDynamicSTSettings,G.push(`Migrated legacy dynamic profile "${J.name}" to provider-based current_st`);return J}),Z.profiles.forEach((J,W)=>{if(!W8(J)){if(Q.push(`Profile ${W} is invalid`),!J.name)J.name=`Profile ${W+1}`,G.push(`Fixed missing name for profile ${W}`);if(!J.connection)J.connection={},G.push(`Fixed missing connection for profile ${W}`)}if(J.constVectMode===void 0)J.constVectMode="link",G.push(`Added default 'constVectMode' to profile "${J.name}"`);if(J.position===void 0)J.position=0,G.push(`Added default 'position' to profile "${J.name}"`);if(J.orderMode===void 0)J.orderMode="auto",J.orderValue=100,G.push(`Added default 'order' settings to profile "${J.name}"`);if(J.preventRecursion===void 0)J.preventRecursion=!1,G.push(`Added default 'preventRecursion' to profile "${J.name}"`);if(J.delayUntilRecursion===void 0)J.delayUntilRecursion=!0,G.push(`Added default 'delayUntilRecursion' to profile "${J.name}"`);if(!J.titleFormat)J.titleFormat=Z.titleFormat||"[000] - {{title}}",G.push(`Added missing title format to profile "${J.name}"`)}),Z.defaultProfile>=Z.profiles.length)Z.defaultProfile=0,G.push("Fixed invalid default profile index");return{valid:Q.length===0,issues:Q,fixes:G,profileCount:Z.profiles.length}}s0();import{Handlebars as U6}from"../../../../lib.js";var jZ=U6.compile(`
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

`),F5=U6.compile(`
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
`),B5=U6.compile(`
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
`),H5=U6.compile(`
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
`);import{saveSettingsDebounced as FG}from"../../../../script.js";import{Popup as FZ,POPUP_TYPE as BZ,POPUP_RESULT as C0}from"../../../popup.js";import{DOMPurify as HZ}from"../../../../lib.js";import{translate as C}from"../../../i18n.js";import{loadWorldInfo as O5}from"../../../world-info.js";S1();import{playMessageSound as BG}from"../../../power-user.js";var M1="STMemoryBooks-ConfirmationPopup";function h0(Z,Q,G){let J=C(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let z=G[q];return z!==void 0&&z!==null?String(z):""})}var M0={ADVANCED:C0.CUSTOM1,SAVE_PROFILE:C0.CUSTOM2,EDIT:C0.CUSTOM3,RETRY:C0.CUSTOM4};function OZ(){try{BG()}catch(Z){console.error("playMessageSound failed",Z)}}async function A5(Z,Q,G,J,W,q=null){let z=q!==null?q:Q.defaultProfile,Y=Q.profiles[z],V=await R0(Y),X={...Z,profileName:Y?.connection?.api==="current_st"?C("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):Y.name,effectivePrompt:V,profileModel:Y.useDynamicSTSettings||Y?.connection?.api==="current_st"?C("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"):Y.connection?.model||C("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"),profileTemperature:Y.useDynamicSTSettings||Y?.connection?.api==="current_st"?C("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"):Y.connection?.temperature!==void 0?Y.connection.temperature:C("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"),currentModel:G?.model||C("Unknown","common.unknown"),currentTemperature:G?.temperature??0.7,currentApi:J?.api||C("Unknown","common.unknown"),tokenThreshold:Q.moduleSettings.tokenWarningThreshold??30000,showWarning:Z.estimatedTokens>(Q.moduleSettings.tokenWarningThreshold??30000),profiles:Q.profiles.map((j,U)=>({...j,name:j?.connection?.api==="current_st"?C("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):j.name,isDefault:U===Q.defaultProfile,isSelected:U===z}))},K=HZ.sanitize(F5(X));OZ();try{let U=await new FZ(K,BZ.TEXT,"",{okButton:C("Create Memory","STMemoryBooks_CreateMemory"),cancelButton:C("Cancel","STMemoryBooks_Cancel"),allowVerticalScrolling:!0,wide:!1,customButtons:[{text:C("Advanced Options...","STMemoryBooks_Button_AdvancedOptions"),result:M0.ADVANCED,classes:["menu_button","whitespacenowrap"],action:null}]}).show();if(U===C0.AFFIRMATIVE)return{confirmed:!0,profileSettings:{...Y,effectivePrompt:V},advancedOptions:{memoryCount:Q.moduleSettings.defaultMemoryCount??0,overrideSettings:!1}};else if(U===M0.ADVANCED)return await HG(Z,Q,Y,G,J,W);return{confirmed:!1}}catch(j){return{confirmed:!1}}}async function HG(Z,Q,G,J,W,q){let z=await DG(Q,q),Y=await R0(G),V=G.connection?.model||C("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel"),X=G.connection?.temperature!==void 0?G.connection.temperature:C("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature"),K={...Z,availableMemories:z,profiles:Q.profiles.map((U,O)=>({...U,name:U?.connection?.api==="current_st"?C("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):U.name,isDefault:O===Q.defaultProfile})),effectivePrompt:Y,defaultMemoryCount:Q.moduleSettings.defaultMemoryCount??0,profileModel:V,profileTemperature:X,currentModel:J?.model||C("Unknown","common.unknown"),currentTemperature:J?.temperature??0.7,currentApi:W?.api||C("Unknown","common.unknown"),suggestedProfileName:h0("STMemoryBooks_ModifiedProfileName","{{name}} - Modified",{name:G.name}),tokenThreshold:Q.moduleSettings.tokenWarningThreshold??30000,showWarning:Z.estimatedTokens>(Q.moduleSettings.tokenWarningThreshold??30000)},j=HZ.sanitize(B5(K));OZ();try{let U=new FZ(j,BZ.TEXT,"",{okButton:C("Create Memory","STMemoryBooks_Button_CreateMemory"),cancelButton:C("Cancel","STMemoryBooks_Cancel"),wide:!0,large:!0,allowVerticalScrolling:!0,customButtons:[{text:C("Save as New Profile","STMemoryBooks_Button_SaveAsNewProfile"),result:M0.SAVE_PROFILE,classes:["menu_button","whitespacenowrap"],action:null}]});NG(U,Z,Q,G,q);let O=await U.show();if(O===C0.AFFIRMATIVE)return await OG(U,Q);else if(O===M0.SAVE_PROFILE)return await AG(U,Q);return{confirmed:!1}}catch(U){return{confirmed:!1}}}async function OG(Z,Q){let G=Z.dlg,J=Number(G.querySelector("#stmb-profile-select-advanced").value),W=G.querySelector("#stmb-effective-prompt-advanced")?.value,q=Number(G.querySelector("#stmb-context-memories-advanced").value),z=G.querySelector("#stmb-override-settings-advanced")?.checked||!1;if(Z.dlg.querySelector(".popup_button_ok")?.dataset.shouldSave==="true"){let j=G.querySelector("#stmb-new-profile-name-advanced").value.trim();if(j)try{await N5(G,Q,j),toastr.success(h0("STMemoryBooks_Toast_ProfileSaved",'Profile "{{name}}" saved successfully',{name:j}),C("STMemoryBooks","confirmationPopup.toast.title"))}catch(U){console.error(C(`${M1}: Failed to save profile:`,"confirmationPopup.log.saveFailed"),U),toastr.error(h0("STMemoryBooks_Toast_ProfileSaveFailed","Failed to save profile: {{message}}",{message:U.message}),C("STMemoryBooks","confirmationPopup.toast.title"))}else return console.error(C(`${M1}: Profile creation cancelled - no name provided`,"confirmationPopup.log.saveCancelledNoName")),toastr.error(C('Please enter a profile name or use "Create Memory" to proceed without saving',"STMemoryBooks_Toast_ProfileNameOrProceed"),C("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1}}let X=Q.profiles[J],K={...X,prompt:W||X.prompt,effectiveConnection:{...X.connection}};if(z){let j=Q1(),U=o();if(U.api)K.effectiveConnection.api=U.api;if(j.model)K.effectiveConnection.model=j.model;if(typeof j.temperature==="number")K.effectiveConnection.temperature=j.temperature}return{confirmed:!0,profileSettings:K,advancedOptions:{memoryCount:q,overrideSettings:z}}}async function AG(Z,Q){let G=Z.dlg.querySelector("#stmb-new-profile-name-advanced").value.trim();if(!G)return console.error(C(`${M1}: Profile name validation failed - empty name`,"confirmationPopup.log.validationFailedEmptyName")),toastr.error(C("Please enter a profile name","STMemoryBooks_Toast_ProfileNameRequired"),C("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1};return await N5(Z.dlg,Q,G),toastr.success(h0("STMemoryBooks_Toast_ProfileSaved",'Profile "{{name}}" saved successfully',{name:G}),C("STMemoryBooks","confirmationPopup.toast.title")),{confirmed:!1}}function NG(Z,Q,G,J,W){let q=Z.dlg,z={prompt:q.querySelector("#stmb-effective-prompt-advanced").value,memoryCount:parseInt(q.querySelector("#stmb-context-memories-advanced").value),overrideSettings:q.querySelector("#stmb-override-settings-advanced").checked,profileIndex:parseInt(q.querySelector("#stmb-profile-select-advanced").value)},Y=()=>{let V=q.querySelector("#stmb-effective-prompt-advanced").value,X=parseInt(q.querySelector("#stmb-context-memories-advanced").value),K=q.querySelector("#stmb-override-settings-advanced").checked,j=parseInt(q.querySelector("#stmb-profile-select-advanced").value),U=V!==z.prompt||X!==z.memoryCount||K!==z.overrideSettings||j!==z.profileIndex,O=q.querySelector("#stmb-save-profile-section-advanced"),B=Z.dlg.querySelector(".popup_button_ok");if(B)if(U)B.textContent=C("Save Profile & Create Memory","STMemoryBooks_SaveProfileAndCreateMemory"),B.title=C("Save the modified settings as a new profile and create the memory","STMemoryBooks_Tooltip_SaveProfileAndCreateMemory"),B.dataset.shouldSave="true";else B.textContent=C("Create Memory","STMemoryBooks_CreateMemory"),B.title=C("Create memory using the selected profile settings","STMemoryBooks_Tooltip_CreateMemory"),B.dataset.shouldSave="false";if(U)O.style.display="block";else O.style.display="none"};q.querySelector("#stmb-effective-prompt-advanced")?.addEventListener("input",Y),q.querySelector("#stmb-context-memories-advanced")?.addEventListener("change",Y),q.querySelector("#stmb-override-settings-advanced")?.addEventListener("change",Y),q.querySelector("#stmb-profile-select-advanced")?.addEventListener("change",async(V)=>{let X=parseInt(V.target.value),K=G.profiles[X],j=await R0(K);q.querySelector("#stmb-effective-prompt-advanced").value=j;let U=q.querySelector("#stmb-profile-model-display"),O=q.querySelector("#stmb-profile-temp-display");if(U)U.textContent=K.connection?.model||C("Current SillyTavern model","STMemoryBooks_Label_CurrentSTModel");if(O)O.textContent=K.connection?.temperature!==void 0?K.connection.temperature:C("Current SillyTavern temperature","STMemoryBooks_Label_CurrentSTTemperature");z.prompt=j,z.profileIndex=X,Y()}),TG(q,Q,G,W,Y),Y()}function TG(Z,Q,G,J,W){let q=Z.querySelector("#stmb-context-memories-advanced"),z=Z.querySelector("#stmb-total-tokens-display"),Y=Z.querySelector("#stmb-token-warning-advanced"),V=G.moduleSettings.tokenWarningThreshold??50000;if(q&&z){let X={},K=async()=>{let j=Number(q.value);if(j===0){if(z.textContent=h0("STMemoryBooks_Label_TotalTokens","Total tokens: {{count}}",{count:Q.estimatedTokens}),Y)Y.style.display=Q.estimatedTokens>V?"block":"none";return}if(!X[j]){z.textContent=C("Total tokens: Calculating...","STMemoryBooks_Label_TotalTokensCalculating");let B=await v0(j,G,J);X[j]=B.summaries}let U=X[j],O=await RG(Q,U);if(z.textContent=h0("STMemoryBooks_Label_TotalTokens","Total tokens: {{count}}",{count:O}),Y)if(O>V)Y.style.display="block",Y.querySelector("span").textContent=h0("STMemoryBooks_Warn_LargeSceneTokens","⚠️ Large scene ({{tokens}} tokens) may take some time to process.",{tokens:O});else Y.style.display="none"};q.addEventListener("change",()=>{K(),W()}),K()}}async function N5(Z,Q,G){let J=parseInt(Z.querySelector("#stmb-profile-select-advanced")?.value||Q.defaultProfile),W=Q.profiles[J],q={name:G,prompt:Z.querySelector("#stmb-effective-prompt-advanced")?.value,api:W.connection?.api,model:W.connection?.model,temperature:W.connection?.temperature,preset:W.preset,titleFormat:W.titleFormat||Q.titleFormat};if(Z.querySelector("#stmb-override-settings-advanced")?.checked||!1){let X=Q1(),K=o();q.api=K.api,q.model=X.model,q.temperature=X.temperature}let Y=_0(q),V=Q.profiles.map((X)=>X.name);Y.name=D0(Y.name,V),Q.profiles.push(Y),FG()}async function v0(Z,Q,G){if(Z<=0)return{summaries:[],actualCount:0,requestedCount:0};try{let J=await J8();if(!J)return{summaries:[],actualCount:0,requestedCount:Z};let W=await O5(J);if(!W)return{summaries:[],actualCount:0,requestedCount:Z};let z=V8(W).slice(-Z),Y=z.length;return{summaries:z.map((V)=>({number:V.number,title:V.title,content:V.content,keywords:V.keywords})),actualCount:Y,requestedCount:Z}}catch(J){return{summaries:[],actualCount:0,requestedCount:Z}}}async function RG(Z,Q){let G=Z.estimatedTokens;if(Q&&Q.length>0){let J=200;for(let W of Q){let q=W.content||"",z=Math.ceil(q.length/4);J+=z}return G+J}return G}async function DG(Z,Q){try{let G=await J8();if(!G)return 0;let J=await O5(G);if(!J)return 0;return V8(J).length}catch(G){return 0}}async function U8(Z,Q,G,J={}){try{if(!Z||typeof Z!=="object")return console.error(C(`${M1}: Invalid memoryResult passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidMemoryResult")),{action:"cancel"};if(!Q||typeof Q!=="object")return console.error(C(`${M1}: Invalid sceneData passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidSceneData")),{action:"cancel"};if(!G||typeof G!=="object")return console.error(C(`${M1}: Invalid profileSettings passed to showMemoryPreviewPopup`,"confirmationPopup.log.invalidProfileSettings")),{action:"cancel"};if(typeof Q.sceneStart!=="number"||typeof Q.sceneEnd!=="number"||typeof Q.messageCount!=="number")return console.error(C(`${M1}: sceneData missing required numeric properties`,"confirmationPopup.log.sceneDataMissingProps")),{action:"cancel"};let W=(X)=>{if(Array.isArray(X))return X.filter((K)=>K&&typeof K==="string").join(", ");else if(typeof X==="string")return X.trim();else return""},q={title:Z.extractedTitle||C("Memory","addlore.defaults.title"),content:Z.content||"",keywordsText:W(Z.suggestedKeys),sceneStart:Q.sceneStart,sceneEnd:Q.sceneEnd,messageCount:Q.messageCount,titleReadonly:!!J.lockTitle,profileName:G?.connection?.api==="current_st"?C("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):G.name||C("Unknown Profile","STMemoryBooks_UnknownProfile")},z=HZ.sanitize(H5(q));OZ();let Y=new FZ(z,BZ.TEXT,"",{okButton:C("Edit & Save","STMemoryBooks_EditAndSave"),cancelButton:C("Cancel","STMemoryBooks_Cancel"),allowVerticalScrolling:!0,wide:!0,customButtons:[{text:C("Retry Generation","STMemoryBooks_RetryGeneration"),result:M0.RETRY,classes:["menu_button","whitespacenowrap"],action:null}]});switch(await Y.show()){case C0.AFFIRMATIVE:case M0.EDIT:let X=Y.dlg;if(!X)return console.error(C(`${M1}: Popup element not available for reading edited values`,"confirmationPopup.log.popupNotAvailable")),toastr.error(C("Unable to read edited values","STMemoryBooks_Toast_UnableToReadEditedValues"),C("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let K=X.querySelector("#stmb-preview-title"),j=X.querySelector("#stmb-preview-content"),U=X.querySelector("#stmb-preview-keywords");if(!K||!j||!U)return console.error(C(`${M1}: Required input elements not found in popup`,"confirmationPopup.log.inputsNotFound")),toastr.error(C("Unable to find input fields","STMemoryBooks_Toast_UnableToFindInputFields"),C("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let O=K.value?.trim()||"",B=j.value?.trim()||"",N=U.value?.trim()||"";if(J?.lockTitle)O=Z.extractedTitle||O;if(!O||O.length===0)return console.error(C(`${M1}: Memory title validation failed - empty title`,"confirmationPopup.log.titleValidationFailed")),toastr.error(C("Memory title cannot be empty","STMemoryBooks_Toast_TitleCannotBeEmpty"),C("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};if(!B||B.length===0)return console.error(C(`${M1}: Memory content validation failed - empty content`,"confirmationPopup.log.contentValidationFailed")),toastr.error(C("Memory content cannot be empty","STMemoryBooks_Toast_ContentCannotBeEmpty"),C("STMemoryBooks","confirmationPopup.toast.title")),{action:"cancel"};let T=((w)=>{if(!w||typeof w!=="string")return[];return w.split(",").map((v)=>v.trim()).filter((v)=>v.length>0&&typeof v==="string")})(N);return{action:"edit",memoryData:{...Z,extractedTitle:O,content:B,suggestedKeys:T}};case M0.RETRY:return{action:"retry"};default:return{action:"cancel"}}}catch(W){return console.error(C(`${M1}: Error showing memory preview popup:`,"confirmationPopup.log.previewError"),W),{action:"cancel"}}}S1();r8();O0();s0();s8();S1();import{chat as S8,chat_metadata as O6}from"../../../../script.js";import{extension_settings as D1}from"../../../extensions.js";import{getRegexedString as M5,regex_placement as H6}from"../../../extensions/regex/engine.js";import{METADATA_KEY as LG,world_names as C5,loadWorldInfo as v5}from"../../../world-info.js";P8();import{t as X0,translate as H1}from"../../../i18n.js";var c="STMemoryBooks-SidePrompts",h5=!1,LZ=Promise.resolve();function P5(Z){return LZ=LZ.then(Z).catch((Q)=>{console.warn(`${c}: preview task failed`,Q)}),LZ}async function hZ(){let Z=D1.STMemoryBooks,Q=null;if(Z?.moduleSettings?.manualModeEnabled)Q=(g()||{}).manualLorebook??null;else Q=O6?.[LG]||null;if(!Q||!C5||!C5.includes(Q))throw toastr.error(H1("No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.","STMemoryBooks_Toast_NoMemoryLorebookAssigned"),"STMemoryBooks"),Error(H1("No memory lorebook assigned","STMemoryBooks_Error_NoMemoryLorebookAssigned"));try{let G=await v5(Q);if(!G)throw Error(H1("Failed to load lorebook","STMemoryBooks_Error_FailedToLoadLorebook"));return{name:Q,data:G}}catch(G){throw toastr.error(H1("Failed to load the selected lorebook.","STMemoryBooks_Toast_FailedToLoadLorebook"),"STMemoryBooks"),G}}function CG(Z,Q){let G=0,J=Math.max(-1,Number.isFinite(Z)?Z:-1),W=Math.max(-1,Q);for(let q=J+1;q<=W&&q<S8.length;q++){let z=S8[q];if(z&&!z.is_system)G++}return G}function CZ(Z,Q){let G=a0(Z,Q);return r0(G)}function MZ(Z,Q,G,J,W=[]){let q=[];if(q.push(String(Z||"")),Q&&String(Q).trim())q.push(`
=== PRIOR ENTRY ===
`),q.push(String(Q));if(Array.isArray(W)&&W.length>0)q.push(`
=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
`),q.push(`These are previous memories for context only. Do NOT include them in your new output.

`),W.forEach((X,K)=>{if(q.push(`Context ${K+1} - ${X.title||"Memory"}:
`),q.push(`${X.content||""}
`),Array.isArray(X.keywords)&&X.keywords.length)q.push(`Keywords: ${X.keywords.join(", ")}
`);q.push(`
`)}),q.push(`=== END PREVIOUS SCENE CONTEXT ===
`);let z=G?o6(G):"";if(q.push(`
=== SCENE TEXT ===
`),q.push(z),J&&String(J).trim())q.push(`
=== RESPONSE FORMAT ===
`),q.push(String(J).trim());let Y=q.join("");return D1?.STMemoryBooks?.moduleSettings?.useRegex?M5(Y,H6.USER_INPUT,{isPrompt:!0}):Y}async function vZ(Z,Q=null){let G,J,W,q,z;if(Q&&(Q.api||Q.model))G=Y1(Q.api||"openai"),J=Q.model||"",W=typeof Q.temperature==="number"?Q.temperature:0.7,q=Q.endpoint||null,z=Q.apiKey||null,console.debug(`${c}: runLLM using overrides api=${G} model=${J} temp=${W}`);else{let X=o(),K=Q1();G=Y1(X.completionSource||X.api||"openai"),J=K.model||"",W=K.temperature??0.7,console.debug(`${c}: runLLM using UI settings api=${G} model=${J} temp=${W}`)}let{text:Y}=await i4({api:G,model:J,prompt:Z,temperature:W,endpoint:q,apiKey:z,extra:{}});return D1?.STMemoryBooks?.moduleSettings?.useRegex?M5(Y||"",H6.AI_OUTPUT):Y||""}function F8(Z=null,Q={}){try{if(Z&&(Z.effectiveConnection||Z.connection)){let Y=i6(Z),{api:V,model:X,temperature:K,endpoint:j,apiKey:U}=Y;return console.debug(`${c}: resolveSidePromptConnection using provided profile api=${V} model=${X} temp=${K}`),{api:V,model:X,temperature:K,endpoint:j,apiKey:U}}let G=D1?.STMemoryBooks,J=G?.profiles||[],W=Q&&Number.isFinite(Q.overrideProfileIndex)?Number(Q.overrideProfileIndex):null;if(W!==null&&J.length>0){if(W<0||W>=J.length)W=0;let Y=J[W];if(Y?.useDynamicSTSettings||Y?.connection?.api==="current_st"){let V=o(),X=Q1(),K=Y1(V.completionSource||V.api||"openai"),j=X.model||"",U=X.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection using UI via template override profile index=${W} api=${K} model=${j} temp=${U}`),{api:K,model:j,temperature:U}}else{let V=Y?.connection||{},X=Y1(V.api||"openai"),K=V.model||"",j=typeof V.temperature==="number"?V.temperature:0.7,U=V.endpoint||null,O=V.apiKey||null;return console.debug(`${c}: resolveSidePromptConnection using template override profile index=${W} api=${X} model=${K} temp=${j}`),{api:X,model:K,temperature:j,endpoint:U,apiKey:O}}}let q=Number(G?.defaultProfile??0);if(!Array.isArray(J)||J.length===0){let Y=o(),V=Q1(),X=Y1(Y.completionSource||Y.api||"openai"),K=V.model||"",j=V.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection fallback to UI (no profiles) api=${X} model=${K} temp=${j}`),{api:X,model:K,temperature:j}}if(!Number.isFinite(q)||q<0||q>=J.length)q=0;let z=J[q];if(z?.useDynamicSTSettings||z?.connection?.api==="current_st"){let Y=o(),V=Q1(),X=Y1(Y.completionSource||Y.api||"openai"),K=V.model||"",j=V.temperature??0.7;return console.debug(`${c}: resolveSidePromptConnection using UI via dynamic default profile api=${X} model=${K} temp=${j}`),{api:X,model:K,temperature:j}}else{let Y=z?.connection||{},V=Y1(Y.api||"openai"),X=Y.model||"",K=typeof Y.temperature==="number"?Y.temperature:0.7,j=Y.endpoint||null,U=Y.apiKey||null;return console.debug(`${c}: resolveSidePromptConnection using default profile api=${V} model=${X} temp=${K}`),{api:V,model:X,temperature:K,endpoint:j,apiKey:U}}}catch(G){let J=o(),W=Q1(),q=Y1(J.completionSource||J.api||"openai"),z=W.model||"",Y=W.temperature??0.7;return console.warn(`${c}: resolveSidePromptConnection error; falling back to UI`,G),{api:q,model:z,temperature:Y}}}function x8(Z,Q){let G=Number(Z);return Number.isFinite(G)?G:Q}function PZ(Z){let Q=Z&&Z.settings&&Z.settings.lorebook||{};return{constVectMode:Q.constVectMode||"link",position:x8(Q.position,0),orderMode:Q.orderMode==="manual"?"manual":"auto",orderValue:x8(Q.orderValue,100),preventRecursion:Q.preventRecursion!==!1,delayUntilRecursion:!!Q.delayUntilRecursion,outletName:String(Q.outletName||"")}}function xZ(Z){let Q={vectorized:Z.constVectMode==="link",selective:!0,order:Z.orderMode==="manual"?x8(Z.orderValue,100):100,position:x8(Z.position,0)},G={constant:Z.constVectMode==="blue",vectorized:Z.constVectMode==="link",preventRecursion:!!Z.preventRecursion,delayUntilRecursion:!!Z.delayUntilRecursion};if(Z.orderMode==="manual")G.order=x8(Z.orderValue,100);if(Number(Z.position)===7&&Z.outletName)G.outletName=String(Z.outletName);return{defaults:Q,entryOverrides:G}}async function SZ(){try{let Z=await B6("onInterval");if(!Z||Z.length===0)return;let Q=await hZ(),G=S8.length-1;if(G<0)return;for(let J of Z){let W=`${J.name} (STMB SidePrompt)`,q=`${J.name} (STMB Tracker)`,z=X1(Q.data,W)||X1(Q.data,q),Y=Number((z&&z[`STMB_sp_${J.key}_lastMsgId`])??(z&&z.STMB_tracker_lastMsgId)??-1),V=z?.[`STMB_sp_${J.key}_lastRunAt`]?Date.parse(z[`STMB_sp_${J.key}_lastRunAt`]):z?.STMB_tracker_lastRunAt?Date.parse(z.STMB_tracker_lastRunAt):null,X=Date.now(),K=1e4;if(V&&X-V<1e4)continue;let j=CG(Y,G),U=Math.max(1,Number(J?.triggers?.onInterval?.visibleMessages??50));if(j<U)continue;let O=Math.max(0,Y+1),N=Math.max(O,G-200+1),H=null;try{H=CZ(N,G)}catch(_){console.warn(`${c}: Interval compile failed:`,_);continue}let T=z?.content||"",R=[],w=Number(J?.settings?.previousMemoriesCount??0),v=Math.max(0,Math.min(7,w));if(v>0)try{R=(await v0(v,D1,O6))?.summaries||[]}catch{}let y=MZ(J.prompt,T,H,J.responseFormat,R),h="";try{let _=Number(J?.settings?.overrideProfileIndex),b=!!J?.settings?.overrideProfileEnabled&&Number.isFinite(_)?F8(null,{overrideProfileIndex:_}):F8(null);console.log(`${c}: SidePrompt attempt`,{trigger:"onInterval",name:J.name,key:J.key,range:`${N}-${G}`,visibleSince:j,threshold:U,api:b.api,model:b.model}),h=await vZ(y,b)}catch(_){console.error(`${c}: Interval sideprompt LLM failed:`,_),toastr.error(X0`SidePrompt "${J.name}" failed: ${_.message}`,"STMemoryBooks");continue}try{if(D1?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let P={extractedTitle:W,content:h,suggestedKeys:[]},b={sceneStart:H?.metadata?.sceneStart??N,sceneEnd:H?.metadata?.sceneEnd??G,messageCount:H?.metadata?.messageCount??(H?.messages?.length??0)},f={name:"SidePrompt"},m;if(await P5(async()=>{m=await U8(P,b,f,{lockTitle:!0})}),m?.action==="cancel"||m?.action==="retry"){console.log(`${c}: SidePrompt "${J.name}" canceled or retry requested in preview; skipping save`);continue}else if(m?.action==="edit"&&m.memoryData)h=m.memoryData.content??h}}catch(_){console.warn(`${c}: Preview step failed; proceeding without preview`,_)}try{let _=PZ(J),{defaults:P,entryOverrides:b}=xZ(_),f=H?.metadata?.sceneEnd??G;await zZ(Q.name,Q.data,W,h,{defaults:P,entryOverrides:b,metadataUpdates:{[`STMB_sp_${J.key}_lastMsgId`]:G,[`STMB_sp_${J.key}_lastRunAt`]:new Date().toISOString(),STMB_tracker_lastMsgId:G,STMB_tracker_lastRunAt:new Date().toISOString()},refreshEditor:D1?.STMemoryBooks?.moduleSettings?.refreshEditor!==!1}),console.log(`${c}: SidePrompt success`,{trigger:"onInterval",name:J.name,key:J.key,saved:!0,contentChars:h.length})}catch(_){console.error(`${c}: Interval sideprompt upsert failed:`,_),toastr.error(X0`Failed to update sideprompt entry "${J.name}"`,"STMemoryBooks");continue}}}catch(Z){}}async function EZ(Z,Q=null){try{let G=await hZ(),J=await B6("onAfterMemory");if(!J||J.length===0)return;let W=F8(Q);console.debug(`${c}: runAfterMemory default overrides api=${W.api} model=${W.model} temp=${W.temperature}`);let q=D1?.STMemoryBooks,z=q?.moduleSettings?.refreshEditor!==!1,Y=q?.moduleSettings?.showNotifications!==!1,V=[],X=K1(Number(q?.moduleSettings?.sidePromptsMaxConcurrent??2),1,5),K=[];for(let j=0;j<J.length;j+=X)K.push(J.slice(j,j+X));for(let j of K){let U=j.map(async(H)=>{try{let T=`${H.name} (STMB SidePrompt)`,w=(X1(G.data,T)||X1(G.data,`${H.name} (STMB Plotpoints)`)||X1(G.data,`${H.name} (STMB Scoreboard)`))?.content||"",v=[],y=Number(H?.settings?.previousMemoriesCount??0),h=Math.max(0,Math.min(7,y));if(h>0)try{v=(await v0(h,D1,O6))?.summaries||[]}catch{}let _=MZ(H.prompt,w,Z,H.responseFormat,v),P=Number(H?.settings?.overrideProfileIndex),f=!!H?.settings?.overrideProfileEnabled&&Number.isFinite(P)?F8(null,{overrideProfileIndex:P}):W;console.log(`${c}: SidePrompt attempt`,{trigger:"onAfterMemory",name:H.name,key:H.key,api:f.api,model:f.model});let m=await vZ(_,f);return{ok:!0,tpl:H,text:m}}catch(T){return console.error(`${c}: Wave LLM failed for "${H.name}":`,T),{ok:!1,tpl:H,error:T}}}),O=await Promise.all(U.map((H)=>H.then((T)=>({...T,_completedAt:performance.now()}))));O.sort((H,T)=>H._completedAt-T._completedAt);let B=[],N=[];for(let H of O){if(!H.ok){V.push({name:H.tpl?.name||"unknown",ok:!1,error:H.error});continue}let T=H.text,R=!0;try{if(D1?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let v={extractedTitle:`${H.tpl.name} (STMB SidePrompt)`,content:T,suggestedKeys:[]},y={sceneStart:Z?.metadata?.sceneStart??0,sceneEnd:Z?.metadata?.sceneEnd??0,messageCount:Z?.metadata?.messageCount??(Z?.messages?.length??0)},h={name:"SidePrompt"},_;if(await P5(async()=>{_=await U8(v,y,h,{lockTitle:!0})}),_?.action==="cancel"||_?.action==="retry")R=!1;else if(_?.action==="edit"&&_.memoryData)T=_.memoryData.content??T}}catch(w){console.warn(`${c}: Preview step failed; proceeding without preview`,w)}if(R){let w=H.tpl,v=`${w.name} (STMB SidePrompt)`,y=PZ(w),{defaults:h,entryOverrides:_}=xZ(y);B.push({title:v,content:T,defaults:h,entryOverrides:_,metadataUpdates:{[`STMB_sp_${w.key}_lastRunAt`]:new Date().toISOString()}}),N.push(w.name)}else V.push({name:H.tpl.name,ok:!1,error:Error("User canceled or retry in preview")})}if(B.length>0)try{let H=await v5(G.name);await C8(G.name,H,B,{refreshEditor:z}),G.data=H;for(let T of N){if(V.push({name:T,ok:!0}),Y)toastr.success(X0`SidePrompt "${T}" updated.`,"STMemoryBooks");console.log(`${c}: SidePrompt success`,{trigger:"onAfterMemory",name:T,saved:!0})}}catch(H){console.error(`${c}: Wave save failed:`,H),toastr.error(H1("Failed to save SidePrompt updates for this wave","STMemoryBooks_Toast_FailedToSaveWave"),"STMemoryBooks");for(let T of N)V.push({name:T,ok:!1,error:H})}}if(Y&&V.length>0){let j=V.filter((H)=>H.ok).map((H)=>H.name),U=V.filter((H)=>!H.ok).map((H)=>H.name),O=j.length,B=U.length,N=(H)=>{if(H.length===0)return"";let R=H.slice(0,5).join(", "),w=H.length>5?`, +${H.length-5} more`:"";return`${R}${w}`};if(B===0)toastr.info(X0`Side Prompts after memory: ${O} succeeded. ${N(j)}`,"STMemoryBooks");else toastr.warning(X0`Side Prompts after memory: ${O} succeeded, ${B} failed. ${B?"Failed: "+N(U):""}`,"STMemoryBooks")}}catch(G){}}async function bZ(Z){try{let Q=await hZ(),{name:G,range:J}=hG(Z);if(!G)return toastr.error(H1('SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',"STMemoryBooks_Toast_SidePromptNameNotProvided"),"STMemoryBooks"),"";let W=await TZ(G);if(!W)return toastr.error(H1("SidePrompt template not found. Check name.","STMemoryBooks_Toast_SidePromptNotFound"),"STMemoryBooks"),"";if(!(Array.isArray(W?.triggers?.commands)&&W.triggers.commands.some((H)=>String(H).toLowerCase()==="sideprompt")))return toastr.error(H1('Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',"STMemoryBooks_Toast_ManualRunDisabled"),"STMemoryBooks"),"";let z=S8.length-1;if(z<0)return toastr.error(H1("No messages available.","STMemoryBooks_Toast_NoMessagesAvailable"),"STMemoryBooks"),"";let Y=null;if(J){let H=String(J).trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);if(!H)return toastr.error(H1("Invalid range format. Use X-Y","STMemoryBooks_Toast_InvalidRangeFormat"),"STMemoryBooks"),"";let T=parseInt(H[1],10),R=parseInt(H[2],10);if(!(T>=0&&R>=T&&R<S8.length))return toastr.error(H1("Invalid message range for /sideprompt","STMemoryBooks_Toast_InvalidMessageRange"),"STMemoryBooks"),"";try{Y=CZ(T,R)}catch(w){return toastr.error(H1("Failed to compile the specified range","STMemoryBooks_Toast_FailedToCompileRange"),"STMemoryBooks"),""}}else{if(!h5)toastr.info(H1('Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',"STMemoryBooks_Toast_SidePromptRangeTip"),"STMemoryBooks"),h5=!0;let H=`${W.name} (STMB SidePrompt)`,T=X1(Q.data,H)||X1(Q.data,`${W.name} (STMB Scoreboard)`)||X1(Q.data,`${W.name} (STMB Plotpoints)`)||X1(Q.data,`${W.name} (STMB Tracker)`),R=Number((T&&T[`STMB_sp_${W.key}_lastMsgId`])??(T&&T.STMB_score_lastMsgId)??(T&&T.STMB_tracker_lastMsgId)??-1),w=Math.max(0,R+1),y=Math.max(w,z-200+1);try{Y=CZ(y,z)}catch(h){return toastr.error(H1("Failed to compile messages for /sideprompt","STMemoryBooks_Toast_FailedToCompileMessages"),"STMemoryBooks"),""}}let V=`${W.name} (STMB SidePrompt)`,K=(X1(Q.data,V)||X1(Q.data,`${W.name} (STMB Scoreboard)`)||X1(Q.data,`${W.name} (STMB Plotpoints)`)||X1(Q.data,`${W.name} (STMB Tracker)`))?.content||"",j=[],U=Number(W?.settings?.previousMemoriesCount??0),O=Math.max(0,Math.min(7,U));if(O>0)try{j=(await v0(O,D1,O6))?.summaries||[]}catch{}let B=MZ(W.prompt,K,Y,W.responseFormat,j),N="";try{let H=Number(W?.settings?.overrideProfileIndex),R=!!W?.settings?.overrideProfileEnabled&&Number.isFinite(H)?F8(null,{overrideProfileIndex:H}):F8(null);console.log(`${c}: SidePrompt attempt`,{trigger:"manual",name:W.name,key:W.key,rangeProvided:!!J,api:R.api,model:R.model}),N=await vZ(B,R);try{if(D1?.STMemoryBooks?.moduleSettings?.showMemoryPreviews){let P={extractedTitle:V,content:N,suggestedKeys:[]},b={sceneStart:Y?.metadata?.sceneStart??0,sceneEnd:Y?.metadata?.sceneEnd??0,messageCount:Y?.metadata?.messageCount??(Y?.messages?.length??0)},m=await U8(P,b,{name:"SidePrompt"},{lockTitle:!0});if(m?.action==="cancel"||m?.action==="retry")return toastr.info(X0`SidePrompt "${W.name}" canceled.`,"STMemoryBooks"),"";else if(m?.action==="edit"&&m.memoryData)N=m.memoryData.content??N}}catch(_){console.warn(`${c}: Preview step failed; proceeding without preview`,_)}let w=PZ(W),{defaults:v,entryOverrides:y}=xZ(w),h=Y?.metadata?.sceneEnd??z;await zZ(Q.name,Q.data,V,N,{defaults:v,entryOverrides:y,metadataUpdates:{[`STMB_sp_${W.key}_lastMsgId`]:h,[`STMB_sp_${W.key}_lastRunAt`]:new Date().toISOString(),STMB_tracker_lastMsgId:h,STMB_tracker_lastRunAt:new Date().toISOString()},refreshEditor:D1?.STMemoryBooks?.moduleSettings?.refreshEditor!==!1}),console.log(`${c}: SidePrompt success`,{trigger:"manual",name:W.name,key:W.key,saved:!0,contentChars:N.length})}catch(H){return console.error(`${c}: /sideprompt failed:`,H),toastr.error(X0`SidePrompt "${W.name}" failed: ${H.message}`,"STMemoryBooks"),""}return toastr.success(X0`SidePrompt "${W.name}" updated.`,"STMemoryBooks"),""}catch(Q){return""}}function hG(Z){let Q=String(Z||"").trim();if(!Q)return{name:"",range:null};let G="",J="",W=Q.match(/^"([^"]+)"\s*(.*)$/),q=!W&&Q.match(/^'([^']+)'\s*(.*)$/);if(W)G=W[1],J=W[2]||"";else if(q)G=q[1],J=q[2]||"";else{let Y=Q.match(/(\d+)\s*[-–—]\s*(\d+)\s*$/);if(Y)G=Q.slice(0,Y.index).trim(),J=Q.slice(Y.index);else G=Q,J=""}let z=null;if(J){let Y=J.match(/(\d+)\s*[-–—]\s*(\d+)/);if(Y)z=`${Y[1]}-${Y[2]}`}return{name:G,range:z}}P8();import{Popup as E8,POPUP_TYPE as x0,POPUP_RESULT as K0}from"../../../popup.js";import{DOMPurify as A6}from"../../../../lib.js";import{escapeHtml as D}from"../../../utils.js";import{extension_settings as l1}from"../../../extensions.js";import{saveSettingsDebounced as vG}from"../../../../script.js";import{Handlebars as MG}from"../../../../lib.js";var x5=MG.compile(`
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
`);import{translate as A,applyLocale as S5}from"../../../i18n.js";function t1(Z,Q,G){let J=A(Q,Z);if(!G)return J;return J.replace(/{{\s*(\w+)\s*}}/g,(W,q)=>{let z=G[q];return z!==void 0&&z!==null?String(z):""})}function E5(Z){let Q=[],G=Z?.triggers||{};if(G.onInterval&&Number(G.onInterval.visibleMessages)>=1)Q.push(`${A("Interval","STMemoryBooks_Interval")}:${Number(G.onInterval.visibleMessages)}`);if(G.onAfterMemory&&!!G.onAfterMemory.enabled)Q.push(A("AfterMemory","STMemoryBooks_AfterMemory"));if(Array.isArray(G.commands)&&G.commands.some((J)=>String(J).toLowerCase()==="sideprompt"))Q.push(A("Manual","STMemoryBooks_Manual"));return Q}function PG(Z){let Q=(Z||[]).map((G)=>({key:String(G.key||""),name:String(G.name||""),badges:E5(G)}));return x5({items:Q})}async function V0(Z,Q=null){let G=Z?.dlg?.querySelector("#stmb-sp-list");if(!G)return;let J=(Z?.dlg?.querySelector("#stmb-sp-search")?.value||"").toLowerCase(),W=await z0(),q=J?W.filter((z)=>{let Y=z.name.toLowerCase().includes(J),V=E5(z).join(" ").toLowerCase();return Y||V.includes(J)}):W;G.innerHTML=A6.sanitize(PG(q));try{S5(G)}catch(z){}if(Q){let z=G.querySelector(`tr[data-tpl-key="${CSS.escape(Q)}"]`);if(z)z.style.backgroundColor="var(--cobalt30a)",z.style.border=""}}async function xG(Z,Q){try{let G=await NZ(Q);if(!G){toastr.error(t1("STMemoryBooks_TemplateNotFound",'Template "{{key}}" not found',{key:Q}),A("STMemoryBooks","index.toast.title"));return}let J=!!G.enabled,W=G.settings||{},q=G.triggers||{},z=!!(q.onInterval&&Number(q.onInterval.visibleMessages)>=1),Y=z?Math.max(1,Number(q.onInterval.visibleMessages)):50,V=!!(q.onAfterMemory&&q.onAfterMemory.enabled),X=Array.isArray(q.commands)?q.commands.some((M)=>String(M).toLowerCase()==="sideprompt"):!1,K=l1?.STMemoryBooks?.profiles||[],j=Number.isFinite(W.overrideProfileIndex)?Number(W.overrideProfileIndex):l1?.STMemoryBooks?.defaultProfile??0;if(!(j>=0&&j<K.length))j=0;let U=!!W.overrideProfileEnabled,O=K.map((M,r)=>`<option value="${r}" ${r===j?"selected":""}>${D(M?.name||"Profile "+(r+1))}</option>`).join(""),B=`
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-override-enabled" ${U?"checked":""}>
                    <span>${D(A("Override default memory profile","STMemoryBooks_OverrideDefaultMemoryProfile"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-edit-override-container" style="display: ${U?"block":"none"};">
                <label for="stmb-sp-edit-override-index">
                    <h4>${D(A("Connection Profile:","STMemoryBooks_ConnectionProfile"))}</h4>
                    <select id="stmb-sp-edit-override-index" class="text_pole">
                        ${O}
                    </select>
                </label>
            </div>
        `,N=Number.isFinite(W.previousMemoriesCount)?Number(W.previousMemoriesCount):0,H=W&&W.lorebook||{},T=H.constVectMode||"link",R=Number.isFinite(H.position)?Number(H.position):0,w=H.orderMode==="manual",v=Number.isFinite(H.orderValue)?Number(H.orderValue):100,y=H.preventRecursion!==!1,h=!!H.delayUntilRecursion,_=`
            <h3>${D(A("Edit Side Prompt","STMemoryBooks_EditSidePrompt"))}</h3>
            <div class="world_entry_form_control">
                <small>${D(A("Key:","STMemoryBooks_Key"))} <code>${D(G.key)}</code></small>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-name">
                    <h4>${D(A("Name:","STMemoryBooks_Name"))}</h4>
                    <input type="text" id="stmb-sp-edit-name" class="text_pole" value="${D(G.name)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-enabled" ${J?"checked":""}>
                    <span>${D(A("Enabled","STMemoryBooks_Enabled"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>${D(A("Triggers:","STMemoryBooks_Triggers"))}</h4>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-interval" ${z?"checked":""}>
                    <span>${D(A("Run on visible message interval","STMemoryBooks_RunOnVisibleMessageInterval"))}</span>
                </label>
                <div id="stmb-sp-edit-interval-container" style="display:${z?"block":"none"}; margin-left:28px;">
                    <label for="stmb-sp-edit-interval">
                        <h4 style="margin: 0 0 4px 0;">${D(A("Interval (visible messages):","STMemoryBooks_IntervalVisibleMessages"))}</h4>
                        <input type="number" id="stmb-sp-edit-interval" class="text_pole" min="1" step="1" value="${Y}">
                    </label>
                </div>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-aftermem" ${V?"checked":""}>
                    <span>${D(A("Run automatically after memory","STMemoryBooks_RunAutomaticallyAfterMemory"))}</span>
                </label>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-manual" ${X?"checked":""}>
                    <span>${D(A("Allow manual run via /sideprompt","STMemoryBooks_AllowManualRunViaSideprompt"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prompt">
                    <h4>${D(A("Prompt:","STMemoryBooks_PromptTitle"))}</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-prompt" class="text_pole textarea_compact" rows="10">${D(G.prompt||"")}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-response-format">
                    <h4>${D(A("Response Format (optional):","STMemoryBooks_ResponseFormatOptional"))}</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-response-format" class="text_pole textarea_compact" rows="6">${D(G.responseFormat||"")}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>${D(A("Lorebook Entry Settings","STMemoryBooks_LorebookEntrySettings"))}:</h4>
                <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${D(A("Activation Mode","STMemoryBooks_ActivationMode"))}:</h4>
                        <select id="stmb-sp-edit-lb-mode" class="text_pole">
                            <option value="link" ${T==="link"?"selected":""}>${D(A("\uD83D\uDD17 Vectorized (Default)","STMemoryBooks_Vectorized"))}</option>
                            <option value="green" ${T==="green"?"selected":""}>${D(A("\uD83D\uDFE2 Normal","STMemoryBooks_Normal"))}</option>
                            <option value="blue" ${T==="blue"?"selected":""}>${D(A("\uD83D\uDD35 Constant","STMemoryBooks_Constant"))}</option>
                        </select>
                    </label>
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${D(A("Insertion Position:","STMemoryBooks_InsertionPosition"))}</h4>
                        <select id="stmb-sp-edit-lb-position" class="text_pole">
                            <option value="0" ${R===0?"selected":""}>${D(A("↑Char","STMemoryBooks_CharUp"))}</option>
                            <option value="1" ${R===1?"selected":""}>${D(A("↓Char","STMemoryBooks_CharDown"))}</option>
                            <option value="5" ${R===5?"selected":""}>${D(A("↑EM","STMemoryBooks_EMUp"))}</option>
                            <option value="6" ${R===6?"selected":""}>${D(A("↓EM","STMemoryBooks_EMDown"))}</option>
                            <option value="2" ${R===2?"selected":""}>${D(A("↑AN","STMemoryBooks_ANUp"))}</option>
                            <option value="3" ${R===3?"selected":""}>${D(A("↓AN","STMemoryBooks_ANDown"))}</option>
                            <option value="7" ${R===7?"selected":""}>${D(A("Outlet","STMemoryBooks_Outlet"))}</option>
                        </select>
                        <div id="stmb-sp-edit-lb-outlet-name-container" style="display:${R===7?"block":"none"}; margin-top: 8px;">
                            <label>
                                <h4 style="margin: 0 0 4px 0;">${D(A("Outlet Name:","STMemoryBooks_OutletName"))}</h4>
                                <input type="text" id="stmb-sp-edit-lb-outlet-name" class="text_pole" placeholder="${D(A("Outlet name","STMemoryBooks_OutletNamePlaceholder"))}" value="${D(H.outletName||"")}">
                            </label>
                        </div>
                    </label>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <h4>${D(A("Insertion Order:","STMemoryBooks_InsertionOrder"))}</h4>
                    <label class="radio_label">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-auto" value="auto" ${w?"":"checked"}>
                        <span>${D(A("Auto (uses memory #)","STMemoryBooks_AutoOrder"))}</span>
                    </label>
                    <label class="radio_label" style="margin-left: 12px;">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-manual" value="manual" ${w?"checked":""}>
                        <span>${D(A("Manual","STMemoryBooks_ManualOrder"))}</span>
                    </label>
                    <div id="stmb-sp-edit-lb-order-value-container" style="display:${w?"block":"none"}; margin-left:28px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">${D(A("Order Value:","STMemoryBooks_OrderValue"))}</h4>
                            <input type="number" id="stmb-sp-edit-lb-order-value" class="text_pole" step="1" value="${v}">
                        </label>
                    </div>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <label class="checkbox_label">
                        <input type="checkbox" id="stmb-sp-edit-lb-prevent" ${y?"checked":""}>
                        <span>${D(A("Prevent Recursion","STMemoryBooks_PreventRecursion"))}</span>
                    </label>
                    <label class="checkbox_label" style="margin-left: 12px;">
                        <input type="checkbox" id="stmb-sp-edit-lb-delay" ${h?"checked":""}>
                        <span>${D(A("Delay Until Recursion","STMemoryBooks_DelayUntilRecursion"))}</span>
                    </label>
                </div>
            </div>

            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prev-mem-count">
                    <h4>${D(A("Previous memories for context:","STMemoryBooks_PreviousMemoriesForContext"))}</h4>
<input type="number" id="stmb-sp-edit-prev-mem-count" class="text_pole" min="0" max="7" step="1" value="${N}">
                </label>
                <small class="opacity70p">${D(A("Number of previous memory entries to include before scene text (0 = none).","STMemoryBooks_PreviousMemoriesHelp"))}</small>
            </div>

            <div class="world_entry_form_control">
                <h4>${D(A("Overrides:","STMemoryBooks_Overrides"))}</h4>
                ${B}
            </div>
        `,P=new E8(A6.sanitize(_),x0.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:A("Save","STMemoryBooks_Save"),cancelButton:A("Cancel","STMemoryBooks_Cancel")}),b=()=>{let M=P.dlg;if(!M)return;let r=M.querySelector("#stmb-sp-edit-trg-interval"),g1=M.querySelector("#stmb-sp-edit-interval-container");r?.addEventListener("change",()=>{if(g1)g1.style.display=r.checked?"block":"none";if(r.checked)M.querySelector("#stmb-sp-edit-interval")?.focus()});let v1=M.querySelector("#stmb-sp-edit-override-enabled"),$1=M.querySelector("#stmb-sp-edit-override-container");v1?.addEventListener("change",()=>{if($1)$1.style.display=v1.checked?"block":"none"});let j1=M.querySelector("#stmb-sp-edit-lb-order-auto"),o1=M.querySelector("#stmb-sp-edit-lb-order-manual"),A1=M.querySelector("#stmb-sp-edit-lb-order-value-container"),Q0=()=>{if(A1)A1.style.display=o1?.checked?"block":"none"};j1?.addEventListener("change",Q0),o1?.addEventListener("change",Q0);let I1=M.querySelector("#stmb-sp-edit-lb-position"),u1=M.querySelector("#stmb-sp-edit-lb-outlet-name-container");I1?.addEventListener("change",()=>{if(u1)u1.style.display=I1.value==="7"?"block":"none"})},f=P.show();if(b(),await f===K0.AFFIRMATIVE){let M=P.dlg,r=M.querySelector("#stmb-sp-edit-name")?.value.trim()||"",g1=M.querySelector("#stmb-sp-edit-prompt")?.value.trim()||"",v1=M.querySelector("#stmb-sp-edit-response-format")?.value.trim()||"",$1=!!M.querySelector("#stmb-sp-edit-enabled")?.checked;if(!g1){toastr.error(A("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),A("STMemoryBooks","index.toast.title"));return}if(!r)toastr.info(A("Name was empty. Keeping previous name.","STMemoryBooks_NameEmptyKeepPrevious"),A("STMemoryBooks","index.toast.title"));let j1={},o1=!!M.querySelector("#stmb-sp-edit-trg-interval")?.checked,A1=!!M.querySelector("#stmb-sp-edit-trg-aftermem")?.checked,Q0=!!M.querySelector("#stmb-sp-edit-trg-manual")?.checked;if(o1){let N8=parseInt(M.querySelector("#stmb-sp-edit-interval")?.value??"50",10),R7=Math.max(1,isNaN(N8)?50:N8);j1.onInterval={visibleMessages:R7}}if(A1)j1.onAfterMemory={enabled:!0};if(Q0)j1.commands=["sideprompt"];let I1={...G.settings||{}},u1=!!M.querySelector("#stmb-sp-edit-override-enabled")?.checked;if(I1.overrideProfileEnabled=u1,u1){let N8=parseInt(M.querySelector("#stmb-sp-edit-override-index")?.value??"",10);if(!isNaN(N8))I1.overrideProfileIndex=N8}else delete I1.overrideProfileIndex;let d8=M.querySelector("#stmb-sp-edit-lb-mode")?.value||"link",A8=parseInt(M.querySelector("#stmb-sp-edit-lb-position")?.value??"0",10),k=!!M.querySelector("#stmb-sp-edit-lb-order-manual")?.checked,p=parseInt(M.querySelector("#stmb-sp-edit-lb-order-value")?.value??"100",10),J1=!!M.querySelector("#stmb-sp-edit-lb-prevent")?.checked,P1=!!M.querySelector("#stmb-sp-edit-lb-delay")?.checked,m1=A8===7?M.querySelector("#stmb-sp-edit-lb-outlet-name")?.value?.trim()||"":"",P6=parseInt(M.querySelector("#stmb-sp-edit-prev-mem-count")?.value??"0",10);I1.previousMemoriesCount=Number.isFinite(P6)&&P6>0?Math.min(P6,7):0,I1.lorebook={constVectMode:["link","green","blue"].includes(d8)?d8:"link",position:Number.isFinite(A8)?A8:0,orderMode:k?"manual":"auto",orderValue:Number.isFinite(p)?p:100,preventRecursion:J1,delayUntilRecursion:P1,...A8===7&&m1?{outletName:m1}:{}},await F6({key:G.key,name:r,enabled:$1,prompt:g1,responseFormat:v1,settings:I1,triggers:j1}),toastr.success(t1("STMemoryBooks_Toast_SidePromptUpdated",'SidePrompt "{{name}}" updated.',{name:r||G.name}),A("STMemoryBooks","index.toast.title")),window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated")),await V0(Z,G.key)}}catch(G){console.error("STMemoryBooks: Error editing side prompt:",G),toastr.error(A("Failed to edit SidePrompt","STMemoryBooks_FailedToEditSidePrompt"),A("STMemoryBooks","index.toast.title"))}}async function SG(Z){let Q=l1?.STMemoryBooks?.profiles||[],G=Number(l1?.STMemoryBooks?.defaultProfile??0);if(!(G>=0&&G<Q.length))G=0;let J=Q.map((X,K)=>`<option value="${K}" ${K===G?"selected":""}>${D(X?.name||"Profile "+(K+1))}</option>`).join(""),W=`
        <h3>${D(A("New Side Prompt","STMemoryBooks_NewSidePrompt"))}</h3>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-name">
                <h4>${D(A("Name:","STMemoryBooks_Name"))}</h4>
                <input type="text" id="stmb-sp-new-name" class="text_pole" placeholder="${D(A("My Side Prompt","STMemoryBooks_MySidePromptPlaceholder"))}" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-enabled">
                <span>${D(A("Enabled","STMemoryBooks_Enabled"))}</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${D(A("Triggers:","STMemoryBooks_Triggers"))}</h4>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-interval">
                <span>${D(A("Run on visible message interval","STMemoryBooks_RunOnVisibleMessageInterval"))}</span>
            </label>
            <div id="stmb-sp-new-interval-container" class="displayNone" style="margin-left:28px;">
                <label for="stmb-sp-new-interval">
                    <h4 style="margin: 0 0 4px 0;">${D(A("Interval (visible messages):","STMemoryBooks_IntervalVisibleMessages"))}</h4>
                    <input type="number" id="stmb-sp-new-interval" class="text_pole" min="1" step="1" value="50">
                </label>
            </div>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-aftermem">
                <span>${D(A("Run automatically after memory","STMemoryBooks_RunAutomaticallyAfterMemory"))}</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-manual" checked>
                <span>${D(A("Allow manual run via /sideprompt","STMemoryBooks_AllowManualRunViaSideprompt"))}</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prompt">
                <h4>${D(A("Prompt:","STMemoryBooks_PromptTitle"))}</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-prompt" class="text_pole textarea_compact" rows="8" placeholder="${D(A("Enter your prompt here...","STMemoryBooks_EnterPromptPlaceholder"))}"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-response-format">
                <h4>${D(A("Response Format (optional):","STMemoryBooks_ResponseFormatOptional"))}</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-response-format" class="text_pole textarea_compact" rows="6" placeholder="${D(A("Optional response format","STMemoryBooks_ResponseFormatPlaceholder"))}"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${D(A("Lorebook Entry Settings","STMemoryBooks_LorebookEntrySettings"))}:</h4>
            <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                <label>
                    <h4 style="margin: 0 0 4px 0;">${D(A("Activation Mode","STMemoryBooks_ActivationMode"))}:</h4>
                    <select id="stmb-sp-new-lb-mode" class="text_pole">
                        <option value="link" selected>${D(A("\uD83D\uDD17 Vectorized (Default)","STMemoryBooks_Vectorized"))}</option>
                        <option value="green">${D(A("\uD83D\uDFE2 Normal","STMemoryBooks_Normal"))}</option>
                        <option value="blue">${D(A("\uD83D\uDD35 Constant","STMemoryBooks_Constant"))}</option>
                    </select>
                </label>
                <label>
                    <h4 style="margin: 0 0 4px 0;">${D(A("Insertion Position:","STMemoryBooks_InsertionPosition"))}</h4>
                    <select id="stmb-sp-new-lb-position" class="text_pole">
                        <option value="0" selected>${D(A("↑Char","STMemoryBooks_CharUp"))}</option>
                        <option value="1">${D(A("↓Char","STMemoryBooks_CharDown"))}</option>
                        <option value="2">${D(A("↑AN","STMemoryBooks_ANUp"))}</option>
                        <option value="3">${D(A("↓AN","STMemoryBooks_ANDown"))}</option>
                        <option value="4">${D(A("↑EM","STMemoryBooks_EMUp"))}</option>
                        <option value="5">${D(A("↓EM","STMemoryBooks_EMDown"))}</option>
                        <option value="7">${D(A("Outlet","STMemoryBooks_Outlet"))}</option>
                    </select>
                    <div id="stmb-sp-new-lb-outlet-name-container" class="displayNone" style="margin-top: 8px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">${D(A("Outlet Name:","STMemoryBooks_OutletName"))}</h4>
                            <input type="text" id="stmb-sp-new-lb-outlet-name" class="text_pole" placeholder="${D(A("Outlet name (e.g., ENDING)","STMemoryBooks_OutletNamePlaceholder"))}">
                        </label>
                    </div>
                </label>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <h4>${D(A("Insertion Order:","STMemoryBooks_InsertionOrder"))}</h4>
                <label class="radio_label">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-auto" value="auto" checked>
                    <span>${D(A("Auto (uses memory #)","STMemoryBooks_AutoOrder"))}</span>
                </label>
                <label class="radio_label" style="margin-left: 12px;">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-manual" value="manual">
                    <span>${D(A("Manual","STMemoryBooks_ManualOrder"))}</span>
                </label>
                <div id="stmb-sp-new-lb-order-value-container" style="display:none; margin-left:28px;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">${D(A("Order Value:","STMemoryBooks_OrderValue"))}</h4>
                        <input type="number" id="stmb-sp-new-lb-order-value" class="text_pole" step="1" value="100">
                    </label>
                </div>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-lb-prevent" checked>
                    <span>${D(A("Prevent Recursion","STMemoryBooks_PreventRecursion"))}</span>
                </label>
                <label class="checkbox_label" style="margin-left: 12px;">
                    <input type="checkbox" id="stmb-sp-new-lb-delay">
                    <span>${D(A("Delay Until Recursion","STMemoryBooks_DelayUntilRecursion"))}</span>
                </label>
            </div>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prev-mem-count">
                <h4>${D(A("Previous memories for context:","STMemoryBooks_PreviousMemoriesForContext"))}</h4>
<input type="number" id="stmb-sp-new-prev-mem-count" class="text_pole" min="0" max="7" step="1" value="0">
            </label>
            <small class="opacity70p">${D(A("Number of previous memory entries to include before scene text (0 = none).","STMemoryBooks_PreviousMemoriesHelp"))}</small>
        </div>

        <div class="world_entry_form_control">
            <h4>${D(A("Overrides:","STMemoryBooks_Overrides"))}</h4>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-override-enabled">
                    <span>${D(A("Override default memory profile","STMemoryBooks_OverrideDefaultMemoryProfile"))}</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-new-override-container" style="display: none;">
                <label for="stmb-sp-new-override-index">
                    <h4>${D(A("Connection Profile:","STMemoryBooks_ConnectionProfile"))}</h4>
                    <select id="stmb-sp-new-override-index" class="text_pole">
                        ${J}
                    </select>
                </label>
            </div>
        </div>
    `,q=new E8(A6.sanitize(W),x0.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:A("Create","STMemoryBooks_Create"),cancelButton:A("Cancel","STMemoryBooks_Cancel")}),z=()=>{let X=q.dlg,K=X.querySelector("#stmb-sp-new-trg-interval"),j=X.querySelector("#stmb-sp-new-interval-container");K?.addEventListener("change",()=>{if(j)j.style.display=K.checked?"block":"none";if(K.checked)X.querySelector("#stmb-sp-new-interval")?.focus()});let U=X.querySelector("#stmb-sp-new-override-enabled"),O=X.querySelector("#stmb-sp-new-override-container");U?.addEventListener("change",()=>{if(O)O.style.display=U.checked?"block":"none"});let B=X.querySelector("#stmb-sp-new-lb-order-auto"),N=X.querySelector("#stmb-sp-new-lb-order-manual"),H=X.querySelector("#stmb-sp-new-lb-order-value-container"),T=()=>{if(H)H.style.display=N?.checked?"block":"none"};B?.addEventListener("change",T),N?.addEventListener("change",T);let R=X.querySelector("#stmb-sp-new-lb-position"),w=X.querySelector("#stmb-sp-new-lb-outlet-name-container");R?.addEventListener("change",()=>{if(w)w.classList.toggle("displayNone",R.value!=="7")})},Y=q.show();if(z(),await Y===K0.AFFIRMATIVE){let X=q.dlg,K=X.querySelector("#stmb-sp-new-name")?.value.trim()||"",j=!!X.querySelector("#stmb-sp-new-enabled")?.checked,U=X.querySelector("#stmb-sp-new-prompt")?.value.trim()||"",O=X.querySelector("#stmb-sp-new-response-format")?.value.trim()||"";if(!U){toastr.error(A("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),A("STMemoryBooks","index.toast.title"));return}if(!K)toastr.info(t1("STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled",'No name provided. Using "{{name}}".',{name:A("Untitled Side Prompt","STMemoryBooks_UntitledSidePrompt")}),A("STMemoryBooks","index.toast.title"));let B={},N=!!X.querySelector("#stmb-sp-new-trg-interval")?.checked,H=!!X.querySelector("#stmb-sp-new-trg-aftermem")?.checked,T=!!X.querySelector("#stmb-sp-new-trg-manual")?.checked;if(N){let M=parseInt(X.querySelector("#stmb-sp-new-interval")?.value??"50",10),r=Math.max(1,isNaN(M)?50:M);B.onInterval={visibleMessages:r}}if(H)B.onAfterMemory={enabled:!0};if(T)B.commands=["sideprompt"];let R={},w=!!X.querySelector("#stmb-sp-new-override-enabled")?.checked;if(R.overrideProfileEnabled=w,w){let M=parseInt(X.querySelector("#stmb-sp-new-override-index")?.value??"",10);if(!isNaN(M))R.overrideProfileIndex=M}let v=X.querySelector("#stmb-sp-new-lb-mode")?.value||"link",y=parseInt(X.querySelector("#stmb-sp-new-lb-position")?.value??"0",10),h=!!X.querySelector("#stmb-sp-new-lb-order-manual")?.checked,_=parseInt(X.querySelector("#stmb-sp-new-lb-order-value")?.value??"100",10),P=!!X.querySelector("#stmb-sp-new-lb-prevent")?.checked,b=!!X.querySelector("#stmb-sp-new-lb-delay")?.checked,f=y===7?X.querySelector("#stmb-sp-new-lb-outlet-name")?.value?.trim()||"":"",m=parseInt(X.querySelector("#stmb-sp-new-prev-mem-count")?.value??"0",10);R.previousMemoriesCount=Number.isFinite(m)&&m>0?Math.min(m,7):0,R.lorebook={constVectMode:["link","green","blue"].includes(v)?v:"link",position:Number.isFinite(y)?y:0,orderMode:h?"manual":"auto",orderValue:Number.isFinite(_)?_:100,preventRecursion:P,delayUntilRecursion:b,...y===7&&f?{outletName:f}:{}};try{await F6({name:K,enabled:j,prompt:U,responseFormat:O,settings:R,triggers:B}),toastr.success(A("SidePrompt created","STMemoryBooks_SidePromptCreated"),A("STMemoryBooks","index.toast.title")),await V0(Z)}catch(M){console.error("STMemoryBooks: Error creating side prompt:",M),toastr.error(A("Failed to create SidePrompt","STMemoryBooks_FailedToCreateSidePrompt"),A("STMemoryBooks","index.toast.title"))}}}async function EG(){try{let Z=await _Z(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-side-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(A("Side prompts exported successfully","STMemoryBooks_SidePromptsExported"),A("STMemoryBooks","index.toast.title"))}catch(Z){console.error("STMemoryBooks: Error exporting side prompts:",Z),toastr.error(A("Failed to export side prompts","STMemoryBooks_FailedToExportSidePrompts"),A("STMemoryBooks","index.toast.title"))}}async function bG(Z,Q){let G=Z.target.files?.[0];if(!G)return;try{let J=await G.text(),W=await IZ(J);if(W&&typeof W==="object"){let{added:q=0,renamed:z=0}=W,Y=z>0?t1("STMemoryBooks_ImportedSidePromptsRenamedDetail"," ({{count}} renamed due to key conflicts)",{count:z}):"";toastr.success(t1("STMemoryBooks_ImportedSidePromptsDetail","Imported side prompts: {{added}} added{{detail}}",{added:q,detail:Y}),A("STMemoryBooks","index.toast.title"))}else toastr.success(A("Imported side prompts","STMemoryBooks_ImportedSidePrompts"),A("STMemoryBooks","index.toast.title"));await V0(Q)}catch(J){console.error("STMemoryBooks: Error importing side prompts:",J),toastr.error(t1("STMemoryBooks_FailedToImportSidePrompts","Failed to import: {{message}}",{message:J?.message||"Unknown error"}),A("STMemoryBooks","index.toast.title"))}}async function b5(){try{let Z='<h3 data-i18n="STMemoryBooks_SidePrompts_Title">\uD83C\uDFA1 Trackers & Side Prompts</h3>';Z+='<div class="world_entry_form_control">',Z+='<p class="opacity70p" data-i18n="STMemoryBooks_SidePrompts_Desc">Create and manage side prompts for trackers and other behind-the-scenes functions.</p>',Z+="</div>",Z+='<div class="world_entry_form_control">',Z+='<input type="text" id="stmb-sp-search" class="text_pole" data-i18n="[placeholder]STMemoryBooks_SearchSidePrompts;[aria-label]STMemoryBooks_SearchSidePrompts" placeholder="Search side prompts..." aria-label="Search side prompts" />',Z+="</div>",Z+='<div class="world_entry_form_control">',Z+=`<label for="stmb-sp-max-concurrent"><h4>${D(A("How many concurrent prompts to run at once","STMemoryBooks_SidePrompts_MaxConcurrentLabel"))}</h4></label>`,Z+='<input type="number" id="stmb-sp-max-concurrent" class="text_pole" min="1" max="5" step="1" value="2">',Z+=`<small class="opacity70p">${D(A("Range 1–5. Defaults to 2.","STMemoryBooks_SidePrompts_MaxConcurrentHelp"))}</small>`,Z+="</div>",Z+='<div id="stmb-sp-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',Z+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',Z+=`<button id="stmb-sp-new" class="menu_button whitespacenowrap">${D(A("New","STMemoryBooks_SidePrompts_New"))}</button>`,Z+=`<button id="stmb-sp-export" class="menu_button whitespacenowrap">${D(A("Export JSON","STMemoryBooks_SidePrompts_ExportJSON"))}</button>`,Z+=`<button id="stmb-sp-import" class="menu_button whitespacenowrap">${D(A("Import JSON","STMemoryBooks_SidePrompts_ImportJSON"))}</button>`,Z+=`<button id="stmb-sp-recreate-builtins" class="menu_button whitespacenowrap">${D(A("♻️ Recreate Built-in Side Prompts","STMemoryBooks_SidePrompts_RecreateBuiltIns"))}</button>`,Z+="</div>",Z+='<input type="file" id="stmb-sp-import-file" accept=".json" style="display: none;" />';let Q=new E8(A6.sanitize(Z),x0.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:A("Close","STMemoryBooks_Close")});(()=>{let J=Q.dlg;if(!J)return;let W=J.querySelector("#stmb-sp-max-concurrent");if(W){let q=(V,X,K)=>Math.max(X,Math.min(K,V)),z=q(Number(l1?.STMemoryBooks?.moduleSettings?.sidePromptsMaxConcurrent??2),1,5);W.value=String(z);let Y=()=>{let V=parseInt(W.value,10),X=q(isNaN(V)?2:V,1,5);if(W.value=String(X),!l1.STMemoryBooks)l1.STMemoryBooks={moduleSettings:{}};if(!l1.STMemoryBooks.moduleSettings)l1.STMemoryBooks.moduleSettings={};l1.STMemoryBooks.moduleSettings.sidePromptsMaxConcurrent=X,vG()};W.addEventListener("change",Y)}J.querySelector("#stmb-sp-search")?.addEventListener("input",()=>V0(Q)),J.querySelector("#stmb-sp-new")?.addEventListener("click",async()=>{await SG(Q)}),J.querySelector("#stmb-sp-export")?.addEventListener("click",async()=>{await EG()}),J.querySelector("#stmb-sp-import")?.addEventListener("click",()=>{J.querySelector("#stmb-sp-import-file")?.click()}),J.querySelector("#stmb-sp-import-file")?.addEventListener("change",async(q)=>{await bG(q,Q)}),J.querySelector("#stmb-sp-recreate-builtins")?.addEventListener("click",async()=>{let q=`<div class="info_block">${D(A("This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.","STMemoryBooks_SidePrompts_RecreateWarning"))}</div>`;if(await new E8(`<h3>${D(A("Recreate Built-in Side Prompts","STMemoryBooks_SidePrompts_RecreateTitle"))}</h3>${q}`,x0.CONFIRM,"",{okButton:A("Recreate","STMemoryBooks_SidePrompts_RecreateOk"),cancelButton:A("Cancel","STMemoryBooks_Cancel")}).show()===K0.AFFIRMATIVE)try{let V=await wZ("overwrite"),X=Number(V?.replaced||0);toastr.success(t1("STMemoryBooks_SidePrompts_RecreateSuccess","Recreated {{count}} built-in side prompts from current locale",{count:X}),A("STMemoryBooks","index.toast.title")),window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated")),await V0(Q)}catch(V){console.error("STMemoryBooks: Error recreating built-in side prompts:",V),toastr.error(A("Failed to recreate built-in side prompts","STMemoryBooks_SidePrompts_RecreateFailed"),A("STMemoryBooks","index.toast.title"))}}),J.addEventListener("click",async(q)=>{let z=q.target.closest(".stmb-sp-action"),Y=q.target.closest("tr[data-tpl-key]");if(!Y)return;let V=Y.dataset.tplKey;if(J.querySelectorAll("tr[data-tpl-key]").forEach((X)=>{X.classList.remove("ui-state-active"),X.style.backgroundColor="",X.style.border=""}),Y.style.backgroundColor="var(--cobalt30a)",Y.style.border="",z){if(q.preventDefault(),q.stopPropagation(),z.classList.contains("stmb-sp-action-edit"))await xG(Q,V);else if(z.classList.contains("stmb-sp-action-duplicate"))try{let X=await RZ(V);toastr.success(A("SidePrompt duplicated","STMemoryBooks_SidePromptDuplicated"),A("STMemoryBooks","index.toast.title")),await V0(Q,X)}catch(X){console.error("STMemoryBooks: Error duplicating side prompt:",X),toastr.error(A("Failed to duplicate SidePrompt","STMemoryBooks_FailedToDuplicateSidePrompt"),A("STMemoryBooks","index.toast.title"))}else if(z.classList.contains("stmb-sp-action-delete")){if(await new E8(`<h3>${D(t1("STMemoryBooks_DeleteSidePromptTitle","Delete Side Prompt",{name:V}))}</h3><p>${D(t1("STMemoryBooks_DeleteSidePromptConfirm","Are you sure you want to delete this template?",{name:V}))}</p>`,x0.CONFIRM,"",{okButton:A("Delete","STMemoryBooks_Delete"),cancelButton:A("Cancel","STMemoryBooks_Cancel")}).show()===K0.AFFIRMATIVE)try{await DZ(V),toastr.success(A("SidePrompt deleted","STMemoryBooks_SidePromptDeleted"),A("STMemoryBooks","index.toast.title")),await V0(Q)}catch(j){console.error("STMemoryBooks: Error deleting side prompt:",j),toastr.error(A("Failed to delete SidePrompt","STMemoryBooks_FailedToDeleteSidePrompt"),A("STMemoryBooks","index.toast.title"))}}return}})})(),await V0(Q),await Q.show();try{S5(Q)}catch(J){}}catch(Z){console.error("STMemoryBooks: Error showing Side Prompts:",Z),toastr.error(A("Failed to open Side Prompts","STMemoryBooks_FailedToOpenSidePrompts"),A("STMemoryBooks","index.toast.title"))}}P8();S1();import{translate as yZ}from"../../../i18n.js";function y5(){return{arc_default:yZ(`You are an expert narrative analyst and memory-engine assistant.
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
- No markdown fences, no commentary, no system prompts, no extra text.`,"STMemoryBooks_ArcPrompt_Default"),arc_alternate:yZ(`You are an expert narrative analyst and memory-engine assistant.
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
- No markdown fences, no commentary, no system prompts, no extra text.`,"STMemoryBooks_ArcPrompt_Alternate"),arc_tiny:yZ(`You specialize in compressing many small memories into compact, coherent story arcs. Combine the memories below — and the previous arc if provided — into a single arc that captures the main narrative through-lines.

Return JSON only:
{ "arcs": [ { "title": "...", "summary": "...", "keywords": ["..."], "member_ids": ["<ID>", "..."] } ], "unassigned_memories": [ { "id": "...", "reason": "..." } ] }

Rules:
- 5–15% length compression
- Focus on plot, emotional progression, decisions, conflicts, continuity
- Identify non-fitting items in unassigned_memories with a brief reason
- No quotes, no OOC, no commentary outside JSON`,"STMemoryBooks_ArcPrompt_Tiny")}}function U0(){return y5()}function b8(){return y5().arc_default}O0();import{getRequestHeaders as fZ}from"../../../../script.js";import{translate as f5}from"../../../i18n.js";var y8="STMemoryBooks-ArcAnalysisPromptManager",kZ=i0.ARC_PROMPTS_FILE,f8={arc_default:"STMemoryBooks_ArcDefaultDisplayName",arc_alternate:"STMemoryBooks_ArcAlternateDisplayName"},S0=null;function yG(Z){return String(Z||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").substring(0,50)}function j0(Z){return String(Z||"").replace(/\w\S*/g,(Q)=>{return Q.charAt(0).toUpperCase()+Q.slice(1).toLowerCase()})}function k8(Z){let Q=String(Z||"").split(`
`).filter((G)=>G.trim());if(Q.length>0){let J=Q[0].trim().replace(/^(You are|Analyze|Create|Generate|Write)\s+/i,"").replace(/[:.]/g,"").trim();return j0(J.substring(0,50))}return"Arc Prompt"}function k5(Z,Q){let G=U0()||{},J=Q||{},W=yG(Z||"arc-prompt"),q=W,z=2;while(q in J||q in G)q=`${W}-${z++}`;return q}function g5(Z){if(!Z||typeof Z!=="object")return!1;if(typeof Z.version!=="number")return!1;if(!Z.overrides||typeof Z.overrides!=="object")return!1;for(let[Q,G]of Object.entries(Z.overrides)){if(!G||typeof G!=="object")return!1;if(typeof G.prompt!=="string"||!G.prompt.trim())return!1;if(G.displayName!==void 0&&typeof G.displayName!=="string")return!1}return!0}async function k1(Z=null){if(S0)return S0;let Q=!1,G=null;try{let J=await fetch(`/user/files/${kZ}`,{method:"GET",credentials:"include",headers:fZ()});if(!J.ok)Q=!0;else{let W=await J.text();if(G=JSON.parse(W),!g5(G))Q=!0}}catch{Q=!0}if(Q){let J={},W=new Date().toISOString(),q=U0()||{};for(let[z,Y]of Object.entries(q)){let V;if(f8[z])V=f5(f8[z])||j0(z.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||k8(Y);else V=j0(z.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||k8(Y);J[z]={displayName:V,prompt:Y,createdAt:W}}G={version:n1.CURRENT_VERSION,overrides:J},await E0(G)}return S0=G,S0}async function E0(Z){let Q=JSON.stringify(Z,null,2),G=btoa(unescape(encodeURIComponent(Q))),J=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:fZ(),body:JSON.stringify({name:kZ,data:G})});if(!J.ok){let W=f5("Failed to save arc prompts","STMemoryBooks_ArcPromptManager_SaveFailed");throw Error(`${W}: ${J.statusText}`)}S0=Z,console.log(`${y8}: Arc prompts saved`)}async function gZ(Z){return await k1(Z),!0}async function N6(Z=null){let Q=await k1(Z),G=[];for(let[W,q]of Object.entries(Q.overrides))G.push({key:W,displayName:q.displayName||j0(W),createdAt:q.createdAt||null});let J=U0()||{};for(let W of Object.keys(J))if(!(W in Q.overrides))G.push({key:W,displayName:f8[W]||j0(W.replace(/^arc[_-]?/,"").replace(/[_-]/g," ")),createdAt:null});return G.sort((W,q)=>{if(!W.createdAt)return 1;if(!q.createdAt)return-1;return new Date(q.createdAt)-new Date(W.createdAt)}),G}async function T6(Z,Q=null){let G=await k1(Q);if(G.overrides[Z]&&typeof G.overrides[Z].prompt==="string"&&G.overrides[Z].prompt.trim())return G.overrides[Z].prompt;return U0()[Z]||b8()}async function uZ(Z,Q=null){let G=await k1(Q);if(G.overrides[Z]&&G.overrides[Z].displayName)return G.overrides[Z].displayName;return f8[Z]||j0(String(Z||"").replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||"Arc Prompt"}async function u5(Z,Q=null){let G=await k1(Q),J=U0()||{};return!!(G.overrides[Z]||J[Z])}async function mZ(Z,Q,G){let J=await k1(),W=new Date().toISOString(),q=Z;if(!q)q=k5(G||k8(Q),J.overrides);if(J.overrides[q])J.overrides[q].prompt=Q,J.overrides[q].displayName=G||J.overrides[q].displayName,J.overrides[q].updatedAt=W;else J.overrides[q]={displayName:G||k8(Q),prompt:Q,createdAt:W};return await E0(J),q}async function m5(Z){let Q=await k1(),G=Q.overrides[Z];if(!G)throw Error(`Arc preset "${Z}" not found`);let J=`${G.displayName||j0(Z)} (Copy)`,W=k5(J,Q.overrides),q=new Date().toISOString();return Q.overrides[W]={displayName:J,prompt:G.prompt,createdAt:q},await E0(Q),W}async function d5(Z){let Q=await k1();if(!Q.overrides[Z])throw Error(`Arc preset "${Z}" not found`);delete Q.overrides[Z],await E0(Q)}async function c5(){let Z=await k1();return JSON.stringify(Z,null,2)}async function p5(Z){let Q=JSON.parse(Z);if(!g5(Q))throw Error("Invalid arc prompts file structure.");await E0(Q)}async function i5(Z="overwrite"){if(Z!=="overwrite")console.warn(`${y8}: Unsupported mode "${Z}", defaulting to overwrite`);let Q=await k1(),G=U0()||{},J=Object.keys(G),W=0;if(Q&&Q.overrides&&typeof Q.overrides==="object"){for(let q of J)if(q in Q.overrides)delete Q.overrides[q],W++}return await E0(Q),S0=Q,console.log(`${y8}: Recreated arc built-ins (removed ${W} overrides)`),{removed:W}}async function l5(Z={}){let Q=Z.backup!==!1,G=U0()||{},J=new Date().toISOString(),W={};for(let[Y,V]of Object.entries(G))W[Y]={displayName:f8[Y]||j0(Y.replace(/^arc[_-]?/,"").replace(/[_-]/g," "))||k8(V),prompt:V,createdAt:J};let q;try{let Y=await k1();if(Q&&Y){let V=String(kZ||"stmb-arc-prompts.json").replace(/\.json$/i,""),X=J.replace(/[:.]/g,"-");q=`${V}.backup-${X}.json`;let K=JSON.stringify(Y,null,2),j=btoa(unescape(encodeURIComponent(K))),U=await fetch("/api/files/upload",{method:"POST",credentials:"include",headers:fZ(),body:JSON.stringify({name:q,data:j})});if(!U.ok)console.warn(`${y8}: Failed to write backup "${q}": ${U.statusText}`)}}catch(Y){console.warn(`${y8}: Backup step failed:`,Y)}let z={version:n1.CURRENT_VERSION,overrides:W};await E0(z),S0=z;try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch{}return{count:Object.keys(W).length,backupName:q}}import{extension_settings as a5}from"../../../extensions.js";import{translate as R6}from"../../../i18n.js";var fG=`Based on this narrative arc summary, generate 15–30 standalone topical keywords that function as retrieval tags, not micro-summaries.
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

Return ONLY a JSON array of 15-30 strings. No commentary, no explanations.`;function t5(Z){return String(Z||"").replace(/\r\n/g,`
`).replace(/^\uFEFF/,"").replace(/[\u200B-\u200D\u2060]/g,"")}function e5(Z){let Q=/```([\w+-]*)\s*([\s\S]*?)```/g,G=[],J;while((J=Q.exec(Z))!==null)G.push((J[2]||"").trim());return G}function kG(Z){let Q=String(Z||"").trim();if(!/'\s*\+\s*'/.test(Q)&&!/\\n'\s*\+/.test(Q))return null;Q=Q.replace(/^\s*content\s*:\s*/,"");let G=/'((?:\\.|[^'\\])*)'/g,J=[],W;while((W=G.exec(Q))!==null)J.push(W[1]);if(!J.length)return null;let q=J.join("");return q=q.replace(/\\r\\n/g,`
`).replace(/\\n/g,`
`).replace(/\\t/g,"\t").replace(/\\"/g,'"').replace(/\\\\/g,"\\"),q.trim()||null}function Z7(Z){let Q=Z.search(/[\{\[]/);if(Q===-1)return null;let G=Z[Q],J=G==="{"?"}":"]",W=0,q=!1,z=!1;for(let Y=Q;Y<Z.length;Y++){let V=Z[Y];if(q){if(z)z=!1;else if(V==="\\")z=!0;else if(V==='"')q=!1;continue}if(V==='"'){q=!0;continue}if(V===G)W++;else if(V===J){if(W--,W===0)return Z.slice(Q,Y+1).trim()}}return null}function Q7(Z){let Q="",G=!1,J=!1,W=!1,q=!1;for(let z=0;z<Z.length;z++){let Y=Z[z],V=Z[z+1];if(G){if(Q+=Y,J)J=!1;else if(Y==="\\")J=!0;else if(Y==='"')G=!1;continue}if(W){if(Y===`
`)W=!1,Q+=Y;continue}if(q){if(Y==="*"&&V==="/")q=!1,z++;continue}if(Y==='"'){G=!0,Q+=Y;continue}if(Y==="/"&&V==="/"){W=!0,z++;continue}if(Y==="/"&&V==="*"){q=!0,z++;continue}Q+=Y}return Q}function G7(Z){let Q="",G=!1,J=!1;for(let W=0;W<Z.length;W++){let q=Z[W];if(G){if(Q+=q,J)J=!1;else if(q==="\\")J=!0;else if(q==='"')G=!1;continue}if(q==='"'){G=!0,Q+=q;continue}if(q===","){let z=W+1;while(z<Z.length&&/\s/.test(Z[z]))z++;if(Z[z]==="}"||Z[z]==="]")continue}Q+=q}return Q}function n5(Z){let Q=[],G=new Set;for(let J of Z||[]){let W=String(J||"").trim();if(W=W.replace(/^["']|["']$/g,""),W=W.replace(/^\d+\.\s*/,""),W=W.replace(/^[\-\*\u2022]\s*/,""),W=W.trim(),!W)continue;let q=W.toLowerCase();if(G.has(q))continue;if(G.add(q),Q.push(W),Q.length>=30)break}return Q}function s5(Z){let Q=t5(String(Z||"").trim()),G=[],J=e5(Q);if(J.length)G.push(...J);let W=Z7(Q);if(W)G.push(W);G.push(Q);let q=Array.from(new Set(G));for(let V of q)try{let X=G7(Q7(V)),K=JSON.parse(X),j=Array.isArray(K)?K:K&&Array.isArray(K.keywords)?K.keywords:null;if(j)return n5(j)}catch{}let z=Q.split(/\r?\n/).map((V)=>V.trim()).filter(Boolean),Y=[];if(z.length>1)Y=z.map((V)=>V.replace(/^[\-\*\u2022]?\s*\d*\.?\s*/,"").trim());else Y=Q.split(/[,;]+/).map((V)=>V.trim());return n5(Y)}async function gG(Z,Q){let G=String(Z||"").trim(),J=`${fG}

=== ARC SUMMARY ===
${G}
=== END SUMMARY ===`,{text:W}=await L0({model:Q.model,prompt:J,temperature:typeof Q.temperature==="number"?Q.temperature:0.2,api:Q.api,endpoint:Q.endpoint,apiKey:Q.apiKey,extra});try{console.debug("STMB ArcAnalysis: keyword gen response length=%d",(W||"").length)}catch{}let q=[];try{q=s5(W)}catch{}if(!Array.isArray(q)||q.length===0){let z=`${J}

Return ONLY a JSON array of 15-30 strings.`,Y=await L0({model:Q.model,prompt:z,temperature:typeof Q.temperature==="number"?Q.temperature:0.2,api:Q.api,endpoint:Q.endpoint,apiKey:Q.apiKey,extra});q=s5(Y.text)}if(q.length>30)q=q.slice(0,30);return q}function uG(Z){let Q=[];for(let G of Z){if(!G||typeof G!=="object")continue;let J=String(G.uid??""),W=mG(G.comment??"")??0,q=String(G.content??"").trim(),z=(G.comment||"Untitled").toString().trim();Q.push({id:J,order:W,content:q,title:z})}return Q.sort((G,J)=>G.order-J.order),Q}function mG(Z){if(!Z)return null;let Q=Z.match(/\[(\d+)\]/);if(Q)return parseInt(Q[1],10);let G=Z.match(/^(\d+)[\s-]/);if(G)return parseInt(G[1],10);return null}function r5({briefs:Z,previousArcSummary:Q=null,previousArcOrder:G=null,promptText:J=null}){let W=J||b8(),q=[];if(Q){if(q.push("=== PREVIOUS ARC (CANON — DO NOT REWRITE, DO NOT INCLUDE IN YOUR NEW SUMMARY) ==="),typeof G<"u"&&G!==null)q.push(`Arc ${G}`);q.push(Q.trim()),q.push("=== END PREVIOUS ARC ==="),q.push("")}return q.push("=== MEMORIES ==="),Z.forEach((z,Y)=>{let V=String(Y+1).padStart(3,"0"),X=(z.title||"").toString().trim(),K=(z.content||"").toString().trim();q.push(`=== Memory ${V} ===`),q.push(`Title: ${X}`),q.push(`Contents: ${K}`),q.push(`=== end Memory ${V} ===`),q.push("")}),q.push("=== END MEMORIES ==="),q.push(""),`${W}

${q.join(`
`)}`}function D6(Z){if(!Z||typeof Z!=="string")throw Error(R6("Empty AI response","STMemoryBooks_ArcAnalysis_EmptyResponse"));let Q=t5(Z.trim().replace(/<think>[\s\S]*?<\/think>/gi,"")),G=[],J=kG(Q);if(J)G.push(J);let W=e5(Q);if(W.length)G.push(...W);G.push(Q);let q=Z7(Q);if(q)G.push(q);let z=Array.from(new Set(G));for(let Y of z)try{let V=Y;V=Q7(V),V=G7(V);let X=JSON.parse(V);if(!X||typeof X!=="object")continue;if(!("arcs"in X)||!("unassigned_memories"in X))continue;let K=Array.isArray(X.arcs)?X.arcs:[],j=Array.isArray(X.unassigned_memories)?X.unassigned_memories:[],U=K.filter((B)=>B&&typeof B.title==="string"&&B.title.trim()&&typeof B.summary==="string"&&B.summary.trim()),O=j.filter((B)=>B&&typeof B.id==="string"&&B.id.trim()&&typeof B.reason==="string");return{arcs:U,unassigned_memories:O}}catch{}throw Error(R6("Model did not return valid arc JSON","STMemoryBooks_ArcAnalysis_InvalidJSON"))}async function $7(Z,Q={},G=null){let{presetKey:J="arc_default",maxItemsPerPass:W=12,maxPasses:q=10,minAssigned:z=2,tokenTarget:Y}=Q,V=Q?.extra??{},X=J==="arc_alternate",K=Object.prototype.hasOwnProperty.call(Q,"maxPasses")?q:X?1:q,j=a5?.STMemoryBooks?.moduleSettings?.tokenWarningThreshold,U=typeof Y==="number"?Y:typeof j==="number"?j:30000,O=U,B=Z.map((b)=>b&&b.entry?b.entry:b).filter(Boolean),N=uG(B),H=new Map(N.map((b)=>[b.id,b])),T=[],R=null;try{if(J&&await u5(J))R=await T6(J)}catch{}if(!R)R=b8();let w=J7(G),v=null,y=null,h=0,_=[];while(H.size>0&&h<K){h++,O=U;let b=Array.from(H.values()).sort((k,p)=>k.order-p.order),f=[];for(let k of _)if(H.has(k.id)&&f.length<W)f.push(k);for(let k of b){if(f.length>=W)break;if(!f.find((p)=>p.id===k.id))f.push(k)}if(f.length===0)break;try{console.debug("STMB ArcAnalysis: pass %d batch=%o",h,f.map((k)=>k.id))}catch{}let m=r5({briefs:f,previousArcSummary:v,previousArcOrder:null,promptText:R}),M=await $0(m,{estimatedOutput:500}),r=f.length,g1=!1;while(M.total>O&&f.length>1)f.pop(),g1=!0,m=r5({briefs:f,previousArcSummary:v,previousArcOrder:y,promptText:R}),M=await $0(m,{estimatedOutput:500});if(g1)try{console.debug("STMB ArcAnalysis: trimmed batch from %d to %d (est=%d, budget=%d)",r,f.length,M.total,O)}catch{}if(M.total>O&&f.length===1){let k=O;O=M.total;try{console.debug("STMB ArcAnalysis: raised budget for single item from %d to %d (est=%d)",k,O,M.total)}catch{}}let{text:v1}=await L0({model:w.model,prompt:m,temperature:w.temperature??0.2,api:w.api,endpoint:w.endpoint,apiKey:w.apiKey,extra:V}),$1;try{$1=D6(v1)}catch(k){let p=`${m}

Return ONLY the JSON object, nothing else. Ensure arrays and commas are valid.`,J1=await L0({model:w.model,prompt:p,temperature:w.temperature??0.2,api:w.api,endpoint:w.endpoint,apiKey:w.apiKey,extra:V});try{$1=D6(J1.text)}catch(P1){let m1=Error(String(P1?.message||k?.message||"Model did not return valid arc JSON"));throw m1.name="ArcAIResponseError",m1.code="ARC_INVALID_JSON",m1.rawText=v1,m1.retryRawText=J1?.text,m1.prompt=m,m1.repairPrompt=p,m1}}let j1=new Map;f.forEach((k,p)=>{let J1=String(k.id);j1.set(J1,J1);let P1=String(p+1).padStart(3,"0");j1.set(P1,J1),j1.set(String(p+1),J1)});let o1=(k)=>j1.get(String(k).trim()),A1=new Set;if(Array.isArray($1.unassigned_memories))$1.unassigned_memories.forEach((k)=>{let p=o1(k.id);if(p)A1.add(p)});let Q0=f.filter((k)=>!A1.has(k.id));try{console.debug("STMB ArcAnalysis: pass %d arcs=%d unassigned=%d assigned=%d",h,Array.isArray($1.arcs)?$1.arcs.length:0,A1.size,Q0.length)}catch{}if(Q0.length<z&&h>1)break;let I1=Array.isArray($1.arcs)?$1.arcs:[],u1=new Set,d8=0;for(let k=0;k<I1.length;k++){let p=I1[k];if(!p||typeof p.title!=="string"||typeof p.summary!=="string")continue;let J1=null;if(Array.isArray(p.member_ids))J1=p.member_ids.map(o1).filter((P1)=>P1!==void 0);if(J1&&J1.length>0);else J1=Q0.map((P1)=>P1.id);if(J1.length===0)continue;T.push({order:h*10+k,title:p.title,summary:p.summary,keywords:Array.isArray(p.keywords)?p.keywords:[],memberIds:J1}),J1.forEach((P1)=>u1.add(String(P1))),d8++,v=p.summary}if(T.length>0)y=T[T.length-1].order;else y=null;if(u1.size>0){for(let k of u1)H.delete(String(k));if(H.size===0&&T.length===1)try{console.info("STMB ArcAnalysis: all memories were consumed into a single arc.")}catch{}}else{try{console.debug("STMB ArcAnalysis: no new IDs consumed on pass %d; stopping.",h)}catch{}break}_=f.filter((k)=>A1.has(k.id));try{console.debug("STMB ArcAnalysis: pass %d consumed=%d remaining=%d",h,u1.size,H.size)}catch{}}let P=Array.from(H.values()).map((b)=>b.id);return{arcCandidates:T,leftovers:P}}function J7(Z){if(Z&&Z.api&&Z.model)return Z;if(Z&&(Z.effectiveConnection||Z.connection)){let J=Z.effectiveConnection||Z.connection;return{api:Y1(J.api||o().completionSource||"openai"),model:J.model||Q1().model||"",temperature:typeof J.temperature==="number"?J.temperature:Q1().temperature??0.2,endpoint:J.endpoint,apiKey:J.apiKey}}let Q=o(),G=Q1();return{api:Y1(Q.completionSource||"openai"),model:G.model||"",temperature:G.temperature??0.2}}function dG(Z){if(!Z||typeof Z!=="string")return null;let Q=Z.match(/\[ARC\s+(\d+)\]/i);if(Q)return parseInt(Q[1],10);if(Q=Z.match(/\[ARC\s+\[(\d+)\]\]/i),Q)return parseInt(Q[1],10);return null}function cG(Z){let Q=Object.values(Z?.entries||{}),G=0;for(let J of Q)if(J&&J.stmbArc===!0&&typeof J.comment==="string"){let W=dG(J.comment);if(typeof W==="number"&&W>G)G=W}return G+1}function pG(Z,Q,G){let J=String(Q||"").trim(),W=String(Z||"").trim()||"[ARC 000] - {{title}}";W=W.replace(/\{\{\s*title\s*\}\}/g,J);let q=W.match(/\[([^\]]*?)(0{2,})([^\]]*?)\]/);if(q){let Y=q[2].length,V=String(G).padStart(Y,"0"),X=`[${q[1]}${V}${q[3]}]`;return W.replace(q[0],X)}return`[ARC ${String(G).padStart(3,"0")}] ${J}`}async function dZ({lorebookName:Z,lorebookData:Q,arcCandidates:G,disableOriginals:J=!1}){if(!Z||!Q)throw Error(R6("Missing lorebookName or lorebookData","STMemoryBooks_ArcAnalysis_MissingLorebookData"));let W=[],q=a5?.STMemoryBooks?.arcTitleFormat||"[ARC 000] - {{title}}",z=cG(Q);try{console.info("STMB ArcAnalysis: committing %d arc(s): %o",G.length,G.map((Y)=>Y.title))}catch{}for(let Y of G){let V=pG(q,Y.title,z++),X=Y.summary,K=Array.isArray(Y.keywords)?Y.keywords:[];if(K.length===0)try{let H=J7(null);K=await gG(X,H)}catch(H){try{console.warn('STMB ArcAnalysis: keyword generation failed for "%s": %s',V,String(H?.message||H))}catch{}}let j={vectorized:!0,selective:!0,order:100,position:0},U={stmemorybooks:!0,stmbArc:!0,type:"arc",key:Array.isArray(K)?K:[],disable:!1},O=await C8(Z,Q,[{title:V,content:X,defaults:j,entryOverrides:U}],{refreshEditor:!1}),B=O&&O[0],N=B?B.uid:null;if(!N)throw Error(R6("Arc upsert returned no entry (commitArcs failed)","STMemoryBooks_ArcAnalysis_UpsertFailed"));if(J&&N){let H=new Set(Y.memberIds.map(String)),T=Object.values(Q.entries||{});for(let R of T)if(H.has(String(R.uid)))R.disable=!0,R.disabledByArcId=N}W.push({arcEntryId:N,title:V})}await C8(Z,Q,[],{refreshEditor:!0});try{console.info("STMB ArcAnalysis: committed arc IDs: %o",W.map((Y)=>Y.arcEntryId))}catch{}return{results:W}}import{Handlebars as iG}from"../../../../lib.js";var cZ=iG.compile(`
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
`);import{t as x,translate as F,applyLocale as O8,addLocaleData as iZ,getCurrentLocale as Z$}from"../../../i18n.js";async function W7(Z){let G={zh:"zh-cn",zh_cn:"zh-cn",zh_tw:"zh-tw","zh.tw":"zh-tw","zh-cn":"zh-cn","zh-tw":"zh-tw","zh-CN":"zh-cn","zh-TW":"zh-tw",ja:"ja-jp",ja_jp:"ja-jp","ja-JP":"ja-jp","ja-jp":"ja-jp",ru:"ru-ru",ru_ru:"ru-ru","ru-RU":"ru-ru","ru-ru":"ru-ru",es:"es-es","es-es":"es-es",de:"de-de",de_de:"de-de","de-DE":"de-de","de-de":"de-de",fr:"fr-fr",fr_fr:"fr-fr","fr-FR":"fr-fr","fr-fr":"fr-fr",ko:"ko-kr",ko_kr:"ko-kr","ko-KR":"ko-kr","ko-kr":"ko-kr",ms:"ms-my",ms_my:"ms-my","ms-MY":"ms-my","ms-my":"ms-my",id:"id-id",id_id:"id-id","id-ID":"id-id","id-id":"id-id",en:"en",en_us:"en","en-US":"en","en-us":"en",en_gb:"en","en-GB":"en","en-gb":"en"}[Z]||Z,W={"zh-cn":"./locales/zh-cn.json","zh-tw":"./locales/zh-tw.json","ja-jp":"./locales/ja-jp.json","ru-ru":"./locales/ru-ru.json","es-es":"./locales/es-es.json","de-de":"./locales/de-de.json","fr-fr":"./locales/fr-fr.json","ko-kr":"./locales/ko-kr.json","ms-my":"./locales/ms-my.json","id-id":"./locales/id-id.json"}[G];if(!W)return null;try{let q=await fetch(new URL(W,import.meta.url));if(!q.ok)return null;return await q.json()}catch(q){return console.warn("STMemoryBooks: Failed to load locale JSON for",G,q),null}}var lG={STMemoryBooks_Settings:"\uD83D\uDCD5 Memory Books Settings",STMemoryBooks_CurrentScene:"Current Scene:",STMemoryBooks_Start:"Start",STMemoryBooks_End:"End",STMemoryBooks_Message:"Message",STMemoryBooks_Messages:"Messages",STMemoryBooks_EstimatedTokens:"Estimated tokens",STMemoryBooks_NoSceneMarkers:"No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.",STMemoryBooks_MemoryStatus:"Memory Status",STMemoryBooks_ProcessedUpTo:"Processed up to message",STMemoryBooks_NoMemoriesProcessed:"No memories have been processed for this chat yet",STMemoryBooks_SinceVersion:"(since updating to version 3.6.2 or higher.)",STMemoryBooks_AutoSummaryNote:'Please note that Auto-Summary requires you to "prime" every chat with at least one manual memory. After that, summaries will be made automatically.',STMemoryBooks_Preferences:"Preferences:",STMemoryBooks_AlwaysUseDefault:"Always use default profile (no confirmation prompt)",STMemoryBooks_ShowMemoryPreviews:"Show memory previews",STMemoryBooks_ShowNotifications:"Show notifications",STMemoryBooks_UnhideBeforeMemory:"Unhide hidden messages for memory generation (runs /unhide X-Y)",STMemoryBooks_EnableManualMode:"Enable Manual Lorebook Mode",STMemoryBooks_ManualModeDesc:"When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.",STMemoryBooks_AutoCreateLorebook:"Auto-create lorebook if none exists",STMemoryBooks_AutoCreateLorebookDesc:"When enabled, automatically creates and binds a lorebook to the chat if none exists.",STMemoryBooks_LorebookNameTemplate:"Lorebook Name Template:",STMemoryBooks_LorebookNameTemplateDesc:"Template for auto-created lorebook names. Supports {{char}}, {{user}}, {{chat}} placeholders.",STMemoryBooks_LorebookNameTemplatePlaceholder:"LTM - {{char}} - {{chat}}",STMemoryBooks_CurrentLorebookConfig:"Current Lorebook Configuration",STMemoryBooks_Mode:"Mode:",STMemoryBooks_ActiveLorebook:"Active Lorebook:",STMemoryBooks_NoneSelected:"None selected",STMemoryBooks_UsingChatBound:"Using chat-bound lorebook",STMemoryBooks_NoChatBound:"No chat-bound lorebook. Memories will require lorebook selection.",STMemoryBooks_AllowSceneOverlap:"Allow scene overlap",STMemoryBooks_AllowSceneOverlapDesc:"Check this box to skip checking for overlapping memories/scenes.",STMemoryBooks_RefreshEditor:"Refresh lorebook editor after adding memories",STMemoryBooks_AutoSummaryEnabled:"Auto-create memory summaries",STMemoryBooks_AutoSummaryDesc:"Automatically run /nextmemory after a specified number of messages.",STMemoryBooks_AutoSummaryInterval:"Auto-Summary Interval:",STMemoryBooks_AutoSummaryIntervalDesc:"Number of messages after which to automatically create a memory summary.",STMemoryBooks_AutoSummaryBuffer:"Auto-Summary Buffer:",STMemoryBooks_AutoSummaryBufferDesc:"Delay auto-summary by X messages (belated generation). Default 2, max 50.",STMemoryBooks_DefaultInterval:"50",STMemoryBooks_AutoSummaryReadyTitle:"Auto-Summary Ready",STMemoryBooks_AutoSummaryNoAssignedLorebook:"Auto-summary is enabled but there is no assigned lorebook for this chat.",STMemoryBooks_AutoSummarySelectOrPostponeQuestion:"Would you like to select a lorebook for memory storage, or postpone this auto-summary?",STMemoryBooks_PostponeLabel:"Postpone for how many messages?",STMemoryBooks_Postpone10:"10 messages",STMemoryBooks_Postpone20:"20 messages",STMemoryBooks_Postpone30:"30 messages",STMemoryBooks_Postpone40:"40 messages",STMemoryBooks_Postpone50:"50 messages",STMemoryBooks_Button_SelectLorebook:"Select Lorebook",STMemoryBooks_Button_Postpone:"Postpone",STMemoryBooks_Error_NoLorebookSelectedForAutoSummary:"No lorebook selected for auto-summary.",STMemoryBooks_Info_AutoSummaryPostponed:"Auto-summary postponed for {{count}} messages.",STMemoryBooks_Error_NoLorebookForAutoSummary:"No lorebook available for auto-summary.",STMemoryBooks_Error_SelectedLorebookNotFound:'Selected lorebook "{{name}}" not found.',STMemoryBooks_Error_FailedToLoadSelectedLorebook:"Failed to load the selected lorebook.",STMemoryBooks_DefaultMemoryCount:"Default Previous Memories Count:",STMemoryBooks_DefaultMemoryCountDesc:"Default number of previous memories to include as context when creating new memories.",STMemoryBooks_MemoryCount0:"None (0 memories)",STMemoryBooks_MemoryCount1:"Last 1 memory",STMemoryBooks_MemoryCount2:"Last 2 memories",STMemoryBooks_MemoryCount3:"Last 3 memories",STMemoryBooks_MemoryCount4:"Last 4 memories",STMemoryBooks_MemoryCount5:"Last 5 memories",STMemoryBooks_MemoryCount6:"Last 6 memories",STMemoryBooks_MemoryCount7:"Last 7 memories",STMemoryBooks_AutoHideMode:"Auto-hide messages after adding memory:",STMemoryBooks_AutoHideModeDesc:"Choose what messages to automatically hide after creating a memory.",STMemoryBooks_AutoHideNone:"Do not auto-hide",STMemoryBooks_AutoHideAll:"Auto-hide all messages up to the last memory",STMemoryBooks_AutoHideLast:"Auto-hide only messages in the last memory",STMemoryBooks_UnhiddenCount:"Messages to leave unhidden:",STMemoryBooks_UnhiddenCountDesc:"Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)",STMemoryBooks_DefaultUnhidden:"0",STMemoryBooks_TokenWarning:"Token Warning Threshold:",STMemoryBooks_TokenWarningDesc:"Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000",STMemoryBooks_DefaultTokenWarning:"30000",STMemoryBooks_TitleFormat:"Memory Title Format:",STMemoryBooks_CustomTitleFormat:"Custom Title Format...",STMemoryBooks_EnterCustomFormat:"Enter custom format",STMemoryBooks_TitleFormatDesc:"Use [0], [00], [000] for auto-numbering. Available: {{title}}, {{scene}}, {{char}}, {{user}}, {{messages}}, {{profile}}, {{date}}, {{time}}",STMemoryBooks_Profiles:"Memory Profiles:",STMemoryBooks_Profile_CurrentST:"Current SillyTavern Settings",STMemoryBooks_Default:"(Default)",STMemoryBooks_ProfileSettings:"Profile Settings:",STMemoryBooks_Provider:"Provider",STMemoryBooks_Model:"Model",STMemoryBooks_Temperature:"Temperature",STMemoryBooks_ViewPrompt:"View Prompt",STMemoryBooks_ProfileActions:"Profile Actions:",STMemoryBooks_extraFunctionButtons:"Import/Export Profiles:",STMemoryBooks_promptManagerButtons:"Prompt Managers",STMemoryBooks_PromptManagerButtonsHint:"Want to tweak things? Use the buttons below to customize each prompt type.",STMemoryBooks_CreateMemory:"Create Memory",STMemoryBooks_ScenePreview:"Scene Preview:",STMemoryBooks_UsingProfile:"Using Profile",STMemoryBooks_LargeSceneWarning:"Large scene",STMemoryBooks_MayTakeTime:"may take some time to process.",STMemoryBooks_AdvancedOptionsHint:'Click "Advanced Options" to customize prompt, context memories, or API settings.',STMemoryBooks_AdvancedOptions:"Advanced Memory Options",STMemoryBooks_SceneInformation:"Scene Information:",STMemoryBooks_Total:"total",STMemoryBooks_BaseTokens:"Base tokens",STMemoryBooks_TotalTokens:"Total tokens",STMemoryBooks_Profile:"Profile",STMemoryBooks_ChangeProfileDesc:"Change the profile to use different base settings.",STMemoryBooks_MemoryCreationPrompt:"Memory Creation Prompt:",STMemoryBooks_CustomizePromptDesc:"Customize the prompt used to generate this memory.",STMemoryBooks_MemoryPromptPlaceholder:"Memory creation prompt",STMemoryBooks_IncludePreviousMemories:"Include Previous Memories as Context:",STMemoryBooks_PreviousMemoriesDesc:"Previous memories provide context for better continuity.",STMemoryBooks_Found:"Found",STMemoryBooks_ExistingMemorySingular:"existing memory in lorebook.",STMemoryBooks_ExistingMemoriesPlural:"existing memories in lorebook.",STMemoryBooks_NoMemoriesFound:"No existing memories found in lorebook.",STMemoryBooks_APIOverride:"API Override Settings:",STMemoryBooks_CurrentSTSettings:"Current SillyTavern Settings:",STMemoryBooks_API:"API",STMemoryBooks_UseCurrentSettings:"Use current SillyTavern settings instead of profile settings",STMemoryBooks_OverrideDesc:"Override the profile's model and temperature with your current SillyTavern settings.",STMemoryBooks_SaveAsNewProfile:"Save as New Profile:",STMemoryBooks_ProfileName:"Profile Name:",STMemoryBooks_SaveProfileDesc:"Your current settings differ from the selected profile. Save them as a new profile.",STMemoryBooks_EnterProfileName:"Enter new profile name",STMemoryBooks_LargeSceneWarningShort:"⚠️ Large scene may take some time to process.",STMemoryBooks_MemoryPreview:"\uD83D\uDCD6 Memory Preview",STMemoryBooks_MemoryPreviewDesc:"Review the generated memory below. You can edit the content while preserving the structure.",STMemoryBooks_MemoryTitle:"Memory Title:",STMemoryBooks_MemoryTitlePlaceholder:"Memory title",STMemoryBooks_MemoryContent:"Memory Content:",STMemoryBooks_MemoryContentPlaceholder:"Memory content",STMemoryBooks_Keywords:"Keywords:",STMemoryBooks_KeywordsDesc:"Separate keywords with commas",STMemoryBooks_KeywordsPlaceholder:"keyword1, keyword2, keyword3",STMemoryBooks_UnknownProfile:"Unknown Profile",STMemoryBooks_PromptManager_Title:"\uD83E\uDDE9 Summary Prompt Manager",STMemoryBooks_PromptManager_Desc:"Manage your summary generation prompts. All presets are editable.",STMemoryBooks_PromptManager_Search:"Search presets...",STMemoryBooks_PromptManager_DisplayName:"Display Name",STMemoryBooks_PromptManager_DateCreated:"Date Created",STMemoryBooks_PromptManager_New:"➕ New Preset",STMemoryBooks_PromptManager_Edit:"✏️ Edit",STMemoryBooks_PromptManager_Duplicate:"\uD83D\uDCCB Duplicate",STMemoryBooks_PromptManager_Delete:"\uD83D\uDDD1️ Delete",STMemoryBooks_PromptManager_Export:"\uD83D\uDCE4 Export JSON",STMemoryBooks_PromptManager_Import:"\uD83D\uDCE5 Import JSON",STMemoryBooks_PromptManager_ApplyToProfile:"✅ Apply to Selected Profile",STMemoryBooks_PromptManager_NoPresets:"No presets available",STMemoryBooks_Profile_MemoryMethod:"Memory Creation Method:",STMemoryBooks_Profile_PresetSelectDesc:"Choose a preset. Create and edit presets in the Summary Prompt Manager.",STMemoryBooks_CustomPromptManaged:"Custom prompts are now controlled by the Summary Prompt Manager.",STMemoryBooks_OpenPromptManager:"\uD83E\uDDE9 Open Summary Prompt Manager",STMemoryBooks_MoveToPreset:"\uD83D\uDCCC Move Current Custom Prompt to Preset",STMemoryBooks_MoveToPresetConfirmTitle:"Move to Preset",STMemoryBooks_MoveToPresetConfirmDesc:"Create a preset from this profile's custom prompt, set the preset on this profile, and clear the custom prompt?",STMemoryBooks_SidePrompts_Title:"\uD83C\uDFA1 Trackers & Side Prompts",STMemoryBooks_SidePrompts_Desc:"Create and manage side prompts for trackers and other behind-the-scenes functions.",STMemoryBooks_EditSidePrompt:"Edit Side Prompt",STMemoryBooks_ResponseFormatPlaceholder:"Optional response format",STMemoryBooks_PreviousMemoriesHelp:"Number of previous memory entries to include before scene text (0 = none).",STMemoryBooks_Name:"Name",STMemoryBooks_Key:"Key",STMemoryBooks_Enabled:"Enabled",STMemoryBooks_RunOnVisibleMessageInterval:"Run on visible message interval",STMemoryBooks_IntervalVisibleMessages:"Interval (visible messages):",STMemoryBooks_RunAutomaticallyAfterMemory:"Run automatically after memory",STMemoryBooks_AllowManualRunViaSideprompt:"Allow manual run via /sideprompt",STMemoryBooks_Triggers:"Triggers",STMemoryBooks_ResponseFormatOptional:"Response Format (optional)",STMemoryBooks_OrderValue:"Order Value",STMemoryBooks_PreviousMemoriesForContext:"Previous memories for context",STMemoryBooks_Overrides:"Overrides",STMemoryBooks_OverrideDefaultMemoryProfile:"Override default memory profile",STMemoryBooks_ConnectionProfile:"Connection Profile",STMemoryBooks_NewSidePrompt:"New Side Prompt",STMemoryBooks_MySidePromptPlaceholder:"My Side Prompt",STMemoryBooks_Actions:"Actions",STMemoryBooks_None:"None",STMemoryBooks_Edit:"Edit",STMemoryBooks_Duplicate:"Duplicate",STMemoryBooks_NoSidePromptsAvailable:"No side prompts available.",STMemoryBooks_SidePrompts_New:"➕ New",STMemoryBooks_SidePrompts_ExportJSON:"\uD83D\uDCE4 Export JSON",STMemoryBooks_SidePrompts_ImportJSON:"\uD83D\uDCE5 Import JSON",STMemoryBooks_SidePrompts_RecreateBuiltIns:"♻️ Recreate Built-in Side Prompts",STMemoryBooks_SidePrompts_RecreateTitle:"Recreate Built-in Side Prompts",STMemoryBooks_SidePrompts_RecreateWarning:"This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.",STMemoryBooks_SidePrompts_RecreateOk:"Recreate",STMemoryBooks_SidePrompts_RecreateSuccess:"Recreated {{count}} built-in side prompts from current locale",STMemoryBooks_SidePrompts_RecreateFailed:"Failed to recreate built-in side prompts",STMemoryBooks_SidePrompts_MaxConcurrentLabel:"Max concurrent side prompts",STMemoryBooks_SidePrompts_MaxConcurrentHelp:"This controls how many side prompts can be running at one time. Lower this value if you have a slow connection or are running into rate limits. Default: 3",STMemoryBooks_SidePromptCreated:'SidePrompt "{{name}}" created.',STMemoryBooks_FailedToCreateSidePrompt:"Failed to create SidePrompt.",STMemoryBooks_SidePromptDuplicated:'SidePrompt "{{name}}" duplicated.',STMemoryBooks_FailedToDuplicateSidePrompt:"Failed to duplicate SidePrompt.",STMemoryBooks_SidePromptDeleted:'SidePrompt "{{name}}" deleted.',STMemoryBooks_FailedToDeleteSidePrompt:"Failed to delete SidePrompt.",STMemoryBooks_SidePromptsExported:"Side prompts exported.",STMemoryBooks_FailedToExportSidePrompts:"Failed to export side prompts.",STMemoryBooks_ImportedSidePrompts:"Imported {{count}} side prompts.",STMemoryBooks_ImportedSidePromptsDetail:"Imported side prompts: {{added}} added{{detail}}",STMemoryBooks_ImportedSidePromptsRenamedDetail:" ({{count}} renamed due to key conflicts)",STMemoryBooks_FailedToImportSidePrompts:"Failed to import side prompts.",STMemoryBooks_DeleteSidePromptTitle:"Delete Side Prompt",STMemoryBooks_DeleteSidePromptConfirm:'Are you sure you want to delete "{{name}}"?',STMemoryBooks_NameEmptyKeepPrevious:"Name was empty. Keeping previous name.",STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled:'No name provided. Using "Untitled Side Prompt".',STMemoryBooks_MenuItem:"Memory Books",STMemoryBooks_Close:"Close",STMemoryBooks_NoMatches:"No matches",STMemoryBooks_RunSidePrompt:"Run Side Prompt",STMemoryBooks_SearchSidePrompts:"Search side prompts...",STMemoryBooks_Interval:"Interval",STMemoryBooks_AfterMemory:"AfterMemory",STMemoryBooks_Manual:"Manual",STMemoryBooks_AutomaticChatBound:"Automatic (Chat-bound)",STMemoryBooks_UsingChatBoundLorebook:'Using chat-bound lorebook "<strong>{{lorebookName}}</strong>"',STMemoryBooks_NoChatBoundLorebook:"No chat-bound lorebook. Memories will require lorebook selection.",STMemoryBooks_ManualLorebookSetupTitle:"Manual Lorebook Setup",STMemoryBooks_ManualLorebookSetupDesc1:'You have a chat-bound lorebook "<strong>{{name}}</strong>".',STMemoryBooks_ManualLorebookSetupDesc2:"Would you like to use it for manual mode or select a different one?",STMemoryBooks_UseChatBound:"Use Chat-bound",STMemoryBooks_SelectDifferent:"Select Different",STMemoryBooks_SidePromptGuide:'SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',STMemoryBooks_MultipleMatches:'Multiple matches: {{top}}{{more}}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_ClearCustomPromptTitle:"Clear Custom Prompt?",STMemoryBooks_ClearCustomPromptDesc:"This profile has a custom prompt. Clear it so the selected preset is used?",STMemoryBooks_CreateNewPresetTitle:"Create New Preset",STMemoryBooks_DisplayNameTitle:"Display Name:",STMemoryBooks_MyCustomPreset:"My Custom Preset",STMemoryBooks_PromptTitle:"Prompt:",STMemoryBooks_EnterPromptPlaceholder:"Enter your prompt here...",STMemoryBooks_EditPresetTitle:"Edit Preset",STMemoryBooks_DeletePresetTitle:"Delete Preset",STMemoryBooks_DeletePresetConfirm:'Are you sure you want to delete "{{name}}"?',STMemoryBooks_NotSet:"Not Set",STMemoryBooks_ProfileNamePlaceholder:"Profile name",STMemoryBooks_ModelAndTempSettings:"Model & Temperature Settings:",STMemoryBooks_ModelHint:"For model, copy-paste the exact model ID, eg. `gemini-2.5-pro`, `deepseek/deepseek-r1-0528:free`, `gpt-4o-mini-2024-07-18`, etc.",STMemoryBooks_ModelPlaceholder:"Paste model ID here",STMemoryBooks_APIProvider:"API/Provider:",STMemoryBooks_CustomAPI:"Custom API",STMemoryBooks_FullManualConfig:"Full Manual Configuration",STMemoryBooks_TemperatureRange:"Temperature (0.0 - 2.0):",STMemoryBooks_TemperaturePlaceholder:"DO NOT LEAVE BLANK! If unsure put 0.8.",STMemoryBooks_APIEndpointURL:"API Endpoint URL:",STMemoryBooks_APIEndpointPlaceholder:"https://api.example.com/v1/chat/completions",STMemoryBooks_APIKey:"API Key:",STMemoryBooks_APIKeyPlaceholder:"Enter your API key",STMemoryBooks_LorebookEntrySettings:"Lorebook Entry Settings",STMemoryBooks_LorebookEntrySettingsDesc:"These settings control how the generated memory is saved into the lorebook.",STMemoryBooks_OutletName:"Outlet Name",STMemoryBooks_OutletNamePlaceholder:"e.g., ENDING",STMemoryBooks_ActivationMode:"Activation Mode:",STMemoryBooks_ActivationModeDesc:"\uD83D\uDD17 Vectorized is recommended for memories.",STMemoryBooks_Vectorized:"\uD83D\uDD17 Vectorized (Default)",STMemoryBooks_Constant:"\uD83D\uDD35 Constant",STMemoryBooks_Normal:"\uD83D\uDFE2 Normal",STMemoryBooks_InsertionPosition:"Insertion Position:",STMemoryBooks_InsertionPositionDesc:"↑Char is recommended. Aiko recommends memories never go lower than ↑AN.",STMemoryBooks_CharUp:"↑Char",STMemoryBooks_CharDown:"↓Char",STMemoryBooks_ANUp:"↑AN",STMemoryBooks_ANDown:"↓AN",STMemoryBooks_EMUp:"↑EM",STMemoryBooks_EMDown:"↓EM",STMemoryBooks_Outlet:"Outlet",STMemoryBooks_InsertionOrder:"Insertion Order:",STMemoryBooks_AutoOrder:"Auto (uses memory #)",STMemoryBooks_ManualOrder:"Manual",STMemoryBooks_RecursionSettings:"Recursion Settings:",STMemoryBooks_PreventRecursion:"Prevent Recursion",STMemoryBooks_DelayUntilRecursion:"Delay Until Recursion",STMemoryBooks_RefreshPresets:"\uD83D\uDD04 Refresh Presets",STMemoryBooks_Button_CreateMemory:"Create Memory",STMemoryBooks_Button_AdvancedOptions:"Advanced Options...",STMemoryBooks_Button_SaveAsNewProfile:"Save as New Profile",STMemoryBooks_SaveProfileAndCreateMemory:"Save Profile & Create Memory",STMemoryBooks_Tooltip_SaveProfileAndCreateMemory:"Save the modified settings as a new profile and create the memory",STMemoryBooks_Tooltip_CreateMemory:"Create memory using the selected profile settings",STMemoryBooks_EditAndSave:"Edit & Save",STMemoryBooks_RetryGeneration:"Retry Generation",STMemoryBooks_PromptManager_Hint:`\uD83D\uDCA1 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don't change the "respond with JSON" instructions, \uD83D\uDCD5Memory Books uses that to process the returned result from the AI.`,STMemoryBooks_ExpandEditor:"Expand the editor",STMemoryBooks_ClearAndApply:"Clear and Apply",STMemoryBooks_Cancel:"Cancel",STMemoryBooks_Create:"Create",STMemoryBooks_Save:"Save",STMemoryBooks_Delete:"Delete",STMemoryBooks_Toast_ProfileSaved:'Profile "{{name}}" saved successfully',STMemoryBooks_Toast_ProfileSaveFailed:"Failed to save profile: {{message}}",STMemoryBooks_Toast_ProfileNameOrProceed:'Please enter a profile name or use "Create Memory" to proceed without saving',STMemoryBooks_Toast_ProfileNameRequired:"Please enter a profile name",STMemoryBooks_Toast_UnableToReadEditedValues:"Unable to read edited values",STMemoryBooks_Toast_UnableToFindInputFields:"Unable to find input fields",STMemoryBooks_Toast_TitleCannotBeEmpty:"Memory title cannot be empty",STMemoryBooks_Toast_ContentCannotBeEmpty:"Memory content cannot be empty",STMemoryBooks_Toast_NoMemoryLorebookAssigned:"No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.",STMemoryBooks_Error_NoMemoryLorebookAssigned:"No memory lorebook assigned",STMemoryBooks_Error_FailedToLoadLorebook:"Failed to load lorebook",STMemoryBooks_Toast_FailedToLoadLorebook:"Failed to load the selected lorebook.",STMemoryBooks_Toast_SidePromptFailed:'SidePrompt "{{name}}" failed: {{message}}',STMemoryBooks_Toast_FailedToUpdateSidePrompt:'Failed to update sideprompt entry "{{name}}"',STMemoryBooks_Toast_FailedToSaveWave:"Failed to save SidePrompt updates for this wave",STMemoryBooks_Toast_SidePromptsSucceeded:"Side Prompts after memory: {{okCount}} succeeded. {{succeeded}}",STMemoryBooks_Toast_SidePromptsPartiallyFailed:"Side Prompts after memory: {{okCount}} succeeded, {{failCount}} failed. {{failed}}",STMemoryBooks_Toast_SidePromptNameNotProvided:'SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',STMemoryBooks_Toast_SceneClearedStart:"Scene cleared due to start marker deletion",STMemoryBooks_Toast_SceneEndPointCleared:"Scene end point cleared due to message deletion",STMemoryBooks_Toast_SceneMarkersAdjusted:"Scene markers adjusted due to message deletion.",STMemoryBooks_MarkSceneStart:"Mark Scene Start",STMemoryBooks_MarkSceneEnd:"Mark Scene End",STMemoryBooks_CreateMemoryBtn:"Create Memory",STMemoryBooks_ClearSceneBtn:"Clear Scene",STMemoryBooks_NoSceneSelected:"No scene selected. Make sure both start and end points are set.",STMemoryBooks_NoSceneMarkersToastr:"No scene markers set. Use chevron buttons to mark start and end points first.",STMemoryBooks_MissingRangeArgument:"Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_InvalidFormat:"Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_InvalidMessageIDs:"Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)",STMemoryBooks_StartGreaterThanEnd:"Start message cannot be greater than end message",STMemoryBooks_MessageIDsOutOfRange:"Message IDs out of range.",STMemoryBooks_MessagesDoNotExist:"One or more specified messages do not exist",STMemoryBooks_SceneSet:"Scene set.",STMemoryBooks_MemoryAlreadyInProgress:"Memory creation is already in progress",STMemoryBooks_NoLorebookAvailable:"No lorebook available.",STMemoryBooks_NoMessagesToSummarize:"There are no messages to summarize yet.",STMemoryBooks_NoNewMessagesSinceLastMemory:"No new messages since the last memory.",STMemoryBooks_NextMemoryFailed:"Failed to run /nextmemory.",STMemoryBooks_OnlyNOfRequestedMemoriesAvailable:"Only some of the requested memories are available",STMemoryBooks_NoPreviousMemoriesFound:"No previous memories found in lorebook",STMemoryBooks_WorkingToast:"Creating memory...",STMemoryBooks_MaximumRetryAttemptsReached:"Maximum retry attempts reached",STMemoryBooks_RetryingMemoryGeneration:"Retrying memory generation...",STMemoryBooks_UnableToRetrieveEditedMemoryData:"Unable to retrieve edited memory data",STMemoryBooks_EditedMemoryDataIncomplete:"Edited memory data is incomplete",STMemoryBooks_MemoryCreatedSuccessfully:"Memory created successfully!",STMemoryBooks_MemoryCreationFailedWillRetry:"Memory creation failed. Retrying...",STMemoryBooks_SceneTooLarge:"Scene is too large. Try selecting a smaller range.",STMemoryBooks_AIFailedToGenerateValidMemory:"AI failed to generate valid memory.",STMemoryBooks_ProfileConfigurationError:"Profile configuration error.",STMemoryBooks_FailedToCreateMemory:"Failed to create memory.",STMemoryBooks_LoadingCharacterData:"SillyTavern is still loading character data, please wait a few seconds and try again.",STMemoryBooks_GroupChatDataUnavailable:"Group chat data not available, please wait a few seconds and try again.",STMemoryBooks_LorebookValidationError:"Lorebook validation error",STMemoryBooks_SceneOverlap:"Scene overlaps with existing memory.",STMemoryBooks_UnexpectedError:"An unexpected error occurred.",STMemoryBooks_ChangeManualLorebook:"Change",STMemoryBooks_SelectManualLorebook:"Select",STMemoryBooks_ManualLorebook:"Manual Lorebook",STMemoryBooks_FailedToSelectManualLorebook:"Failed to select manual lorebook",STMemoryBooks_ClearManualLorebook:"Clear Manual Lorebook",STMemoryBooks_ManualLorebookCleared:"Manual lorebook cleared",STMemoryBooks_FailedToClearManualLorebook:"Failed to clear manual lorebook",STMemoryBooks_SetAsDefault:"Set as Default",STMemoryBooks_SetAsDefaultProfileSuccess:'"{{name}}" is now the default profile.',STMemoryBooks_EditProfile:"Edit Profile",STMemoryBooks_FailedToEditProfile:"Failed to edit profile",STMemoryBooks_NewProfile:"New Profile",STMemoryBooks_FailedToCreateProfile:"Failed to create profile",STMemoryBooks_DeleteProfile:"Delete Profile",STMemoryBooks_FailedToDeleteProfile:"Failed to delete profile",STMemoryBooks_ExportProfiles:"Export Profiles",STMemoryBooks_FailedToExportProfiles:"Failed to export profiles",STMemoryBooks_ImportProfiles:"Import Profiles",STMemoryBooks_SummaryPromptManager:"Summary Prompt Manager",STMemoryBooks_FailedToOpenSummaryPromptManager:"Failed to open Summary Prompt Manager",STMemoryBooks_SidePrompts:"Side Prompts",STMemoryBooks_FailedToOpenSidePrompts:"Failed to open Side Prompts",STMemoryBooks_SelectPresetFirst:"Select a preset first",STMemoryBooks_NoProfilesAvailable:"No profiles available",STMemoryBooks_SelectedProfileNotFound:"Selected profile not found",STMemoryBooks_PresetAppliedToProfile:"Preset applied to profile",STMemoryBooks_PromptCannotBeEmpty:"Prompt cannot be empty",STMemoryBooks_PresetCreatedSuccessfully:"Preset created successfully",STMemoryBooks_FailedToCreatePreset:"Failed to create preset",STMemoryBooks_PresetUpdatedSuccessfully:"Preset updated successfully",STMemoryBooks_FailedToEditPreset:"Failed to edit preset",STMemoryBooks_PresetDuplicatedSuccessfully:"Preset duplicated successfully",STMemoryBooks_FailedToDuplicatePreset:"Failed to duplicate preset",STMemoryBooks_PresetDeletedSuccessfully:"Preset deleted successfully",STMemoryBooks_PromptsExportedSuccessfully:"Prompts exported successfully",STMemoryBooks_PromptsImportedSuccessfully:"Prompts imported successfully",STMemoryBooks_FailedToImportPrompts:"Failed to import prompts.",STMemoryBooks_CreateMemoryButton:"Create Memory",STMemoryBooks_ConsolidateArcsButton:"Consolidate Memories into Arcs",STMemoryBooks_NoSceneSelectedMakeSure:"No scene selected. Make sure both start and end points are set.",STMemoryBooks_ClearSceneButton:"Clear Scene",STMemoryBooks_FailedToImportProfiles:"Failed to import profiles",STMemoryBooks_ManualLorebookSet:'Manual lorebook set to "{{name}}"',STMemoryBooks_PleaseSelectLorebookForManualMode:"Please select a lorebook for manual mode",STMemoryBooks_FailedToSaveSettings:"Failed to save settings. Please try again.",STMemoryBooks_FailedToInitializeChatMonitoring:"STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.",STMemoryBooks_Label_CurrentSTModel:"Current SillyTavern model",STMemoryBooks_Label_CurrentSTTemperature:"Current SillyTavern temperature",STMemoryBooks_Label_TotalTokens:"Total tokens: {{count}}",STMemoryBooks_Label_TotalTokensCalculating:"Total tokens: Calculating...",STMemoryBooks_Warn_LargeSceneTokens:"⚠️ Large scene ({{tokens}} tokens) may take some time to process.",STMemoryBooks_ModifiedProfileName:"{{name}} - Modified",STMemoryBooks_ProfileEditTitle:"Edit Profile",STMemoryBooks_CancelClose:"Cancel/Close",STMemoryBooks_InvalidProfileData:"Invalid profile data",STMemoryBooks_ProfileUpdatedSuccess:"Profile updated successfully",STMemoryBooks_NewProfileTitle:"New Profile",STMemoryBooks_ProfileCreatedSuccess:"Profile created successfully",STMemoryBooks_DeleteProfileConfirm:'Delete profile "{{name}}"?',STMemoryBooks_CannotDeleteLastProfile:"Cannot delete the last profile",STMemoryBooks_CannotDeleteDefaultProfile:'Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',STMemoryBooks_ProfileDeletedSuccess:"Profile deleted successfully",STMemoryBooks_ProfilesExportedSuccess:"Profiles exported successfully",STMemoryBooks_ImportErrorInvalidFormat:"Invalid profile data format - missing profiles array",STMemoryBooks_ImportErrorNoValidProfiles:"No valid profiles found in import file",STMemoryBooks_ImportSuccess:"Imported {{importedCount}} profile{{plural}}",STMemoryBooks_ImportSkipped:" ({{skippedCount}} duplicate{{plural}} skipped)",STMemoryBooks_ImportComplete:"STMemoryBooks profile import completed",STMemoryBooks_ImportNoNewProfiles:"No new profiles imported - all profiles already exist",STMemoryBooks_ImportFailed:"Failed to import profiles: {{message}}",STMemoryBooks_ImportReadError:"Failed to read import file",STMemoryBooks_PromptManagerNotFound:"Prompt Manager button not found. Open main settings and try again.",STMemoryBooks_PresetListRefreshed:"Preset list refreshed",STMemoryBooks_FailedToRefreshPresets:"Failed to refresh presets",STMemoryBooks_NoCustomPromptToMigrate:"No custom prompt to migrate",STMemoryBooks_CustomPromptMigrated:"Preset created and selected. Remember to Save.",STMemoryBooks_FailedToMigrateCustomPrompt:"Failed to move custom prompt to preset",STMemoryBooks_Toast_SidePromptUpdated:'SidePrompt "{{name}}" updated.',STMemoryBooks_Toast_SidePromptNotFound:"SidePrompt template not found. Check name.",STMemoryBooks_Toast_ManualRunDisabled:'Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',STMemoryBooks_Toast_NoMessagesAvailable:"No messages available.",STMemoryBooks_Toast_InvalidRangeFormat:"Invalid range format. Use X-Y",STMemoryBooks_Toast_InvalidMessageRange:"Invalid message range for /sideprompt",STMemoryBooks_Toast_FailedToCompileRange:"Failed to compile the specified range",STMemoryBooks_Toast_SidePromptRangeTip:'Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',STMemoryBooks_Toast_FailedToCompileMessages:"Failed to compile messages for /sideprompt",STMemoryBooks_Plotpoints:"Plotpoints",STMemoryBooks_PlotpointsPrompt:"Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.",STMemoryBooks_Status:"Status",STMemoryBooks_StatusPrompt:"Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.",STMemoryBooks_CastOfCharacters:"Cast of Characters",STMemoryBooks_CastOfCharactersPrompt:`You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. 
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

Return ONLY the JSON, no other text.`,STMemoryBooks_DisplayName_summary:"Summary - Detailed beat-by-beat summaries in narrative prose",STMemoryBooks_DisplayName_summarize:"Summarize - Bullet-point format",STMemoryBooks_DisplayName_synopsis:"Synopsis - Long and comprehensive (beats, interactions, details) with headings",STMemoryBooks_DisplayName_sumup:"Sum Up - Concise story beats in narrative prose",STMemoryBooks_DisplayName_minimal:"Minimal - Brief 1-2 sentence summary",STMemoryBooks_DisplayName_northgate:"Northgate - Intended for creative writing. By Northgate on ST Discord",STMemoryBooks_DisplayName_aelemar:"Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord",STMemoryBooks_DisplayName_comprehensive:"Comprehensive - Synopsis plus improved keywords extraction",STMemoryBooks_PromptManager_RecreateBuiltins:"♻️ Recreate Built-in Prompts",STMemoryBooks_RecreateBuiltinsTitle:"Recreate Built-in Prompts",STMemoryBooks_RecreateBuiltinsWarning:"This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom:"This does not affect your other custom presets.",STMemoryBooks_RecreateBuiltinsOverwrite:"Overwrite",STMemoryBooks_RegexSelection_Title:"\uD83D\uDCD0 Regex selection",STMemoryBooks_RegexSelection_Desc:"Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.",STMemoryBooks_RegexSelection_Outgoing:"Run regex before sending to AI",STMemoryBooks_RegexSelection_Incoming:"Run regex before adding to lorebook (before previews)",STMemoryBooks_RegexSelect_PlaceholderOutgoing:"Select outgoing regex…",STMemoryBooks_RegexSelect_PlaceholderIncoming:"Select incoming regex…",STMemoryBooks_RegexSelectionsSaved:"Regex selections saved",STMemoryBooks_FailedToSaveRegexSelections:"Failed to save regex selections",STMemoryBooks_UseRegexAdvanced:"Use regex (advanced)",STMemoryBooks_ConfigureRegex:"\uD83D\uDCD0 Configure regex…"},b0={en:lG};import{getRegexScripts as F7}from"../../../extensions/regex/engine.js";import"../../../../lib/select2.min.js";async function B7(Z){try{if(Z?.prompt&&String(Z.prompt).trim())return Z.prompt;if(Z?.preset)return await G0(Z.preset)}catch(Q){console.warn(F("STMemoryBooks: getEffectivePromptAsync fallback due to error:","index.warn.getEffectivePromptAsync"),Q)}return d1()}async function Q$(){return String(J4())}function $5(){return O1}var U1="STMemoryBooks",q7=!1;var H7={moduleSettings:{alwaysUseDefault:!0,showMemoryPreviews:!1,showNotifications:!0,unhideBeforeMemory:!1,refreshEditor:!0,tokenWarningThreshold:50000,defaultMemoryCount:0,autoClearSceneAfterMemory:!1,manualModeEnabled:!1,allowSceneOverlap:!1,autoHideMode:"all",unhiddenEntriesCount:2,autoSummaryEnabled:!1,autoSummaryInterval:50,autoSummaryBuffer:2,autoCreateLorebook:!1,lorebookNameTemplate:"LTM - {{char}} - {{chat}}",useRegex:!1,selectedRegexOutgoing:[],selectedRegexIncoming:[]},titleFormat:"[000] - {{title}}",profiles:[],defaultProfile:0,migrationVersion:4},d=null,O1=!1,lZ=!1,w6=null,Y7=!1,g8=null,k0=null,u0=null,L6=null,B8=null,H8=null;var B0=null,u8=null;function G$(Z){let Q=[];if(Z.matches&&Z.matches("#chat .mes[mesid]")){if(!Z.querySelector(".mes_stmb_start"))o8(Z),Q.push(Z)}else if(Z.querySelectorAll)Z.querySelectorAll("#chat .mes[mesid]").forEach((J)=>{if(!J.querySelector(".mes_stmb_start"))o8(J),Q.push(J)});return Q}function $$(){if(B0)B0.disconnect(),B0=null;let Z=document.getElementById("chat");if(!Z)throw Error(F("STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.","index.error.chatContainerNotFound"));let Q=Y4();if(!Q||Q.start===null&&Q.end===null)n8();B0=new MutationObserver((G)=>{let J=[];for(let W of G)for(let q of W.addedNodes)if(q.nodeType===Node.ELEMENT_NODE)try{let z=G$(q);J.push(...z)}catch(z){console.error(F("STMemoryBooks: Error processing new chat elements:","index.error.processingChatElements"),z)}if(J.length>0)clearTimeout(u8),u8=setTimeout(()=>{try{W4(J)}catch(W){console.error(F("STMemoryBooks: Error updating button states:","index.error.updatingButtonStates"),W)}},S6.CHAT_OBSERVER_DEBOUNCE_MS)}),B0.observe(Z,{childList:!0,subtree:!0}),console.log(F("STMemoryBooks: Chat observer initialized","index.log.chatObserverInitialized"))}function J$(){if(B0)B0.disconnect(),B0=null,console.log(F("STMemoryBooks: Chat observer disconnected","index.log.chatObserverDisconnected"));if(u8)clearTimeout(u8),u8=null}function W$(){console.log(F("STMemoryBooks: Chat changed - updating scene state","index.log.chatChanged")),n8(),O7(),setTimeout(()=>{try{T7()}catch(Z){console.error(F("STMemoryBooks: Error processing messages after chat change:","index.error.processingMessagesAfterChange"),Z)}},S6.CHAT_OBSERVER_DEBOUNCE_MS)}function O7(){let Z=g()||{},{sceneStart:Q,sceneEnd:G}=Z;if(Q!==null||G!==null){if(console.log(x`Found orphaned scene markers: start=${Q}, end=${G}`),!O1&&i[U1].moduleSettings.autoSummaryEnabled)n0()}}async function q$(){try{setTimeout(l0,x1.VALIDATION_DELAY_MS),await Q5(),await SZ()}catch(Z){console.error(F("STMemoryBooks: Error in handleMessageReceived:","index.error.handleMessageReceived"),Z)}}async function Y$(){try{setTimeout(l0,x1.VALIDATION_DELAY_MS),await G5(),await SZ()}catch(Z){console.error(F("STMemoryBooks: Error in handleGroupWrapperFinished:","index.error.handleGroupWrapperFinished"),Z)}}async function z$(Z,Q){if(!await D8())return console.error(F("STMemoryBooks: No scene markers set for createMemory command","index.error.noSceneMarkersForCreate")),toastr.error(F("No scene markers set. Use chevron buttons to mark start and end points first.","STMemoryBooks_NoSceneMarkersToastr"),F("STMemoryBooks","index.toast.title")),"";return v6(),""}async function X$(Z,Q){let G=String(Q||"").trim();if(!G)return toastr.error(F("Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_MissingRangeArgument"),F("STMemoryBooks","index.toast.title")),"";let J=G.match(/^(\d+)\s*[-–—]\s*(\d+)$/);if(!J)return toastr.error(F("Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_InvalidFormat"),F("STMemoryBooks","index.toast.title")),"";let W=Number(J[1]),q=Number(J[2]);if(!Number.isFinite(W)||!Number.isFinite(q))return toastr.error(F("Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)","STMemoryBooks_InvalidMessageIDs"),F("STMemoryBooks","index.toast.title")),"";if(W>q)return toastr.error(F("Start message cannot be greater than end message","STMemoryBooks_StartGreaterThanEnd"),F("STMemoryBooks","index.toast.title")),"";let z=j7;if(W<0||q>=z.length)return toastr.error(x`Message IDs out of range. Valid range: 0-${z.length-1}`,F("STMemoryBooks","index.toast.title")),"";if(!z[W]||!z[q])return toastr.error(F("One or more specified messages do not exist","STMemoryBooks_MessagesDoNotExist"),F("STMemoryBooks","index.toast.title")),"";E6(W,q);let Y=$8(),V=Y.isGroupChat?` in group "${Y.groupName}"`:"";return toastr.info(x`Scene set: messages ${W}-${q}${V}`,F("STMemoryBooks","index.toast.title")),v6(),""}async function V$(Z,Q){try{if(O1)return toastr.info(F("Memory creation is already in progress","STMemoryBooks_MemoryAlreadyInProgress"),F("STMemoryBooks","index.toast.title")),"";let G=await aZ();if(!G.valid)return toastr.error(F("No lorebook available: "+G.error,"STMemoryBooks_NoLorebookAvailable"),F("STMemoryBooks","index.toast.title")),"";let J=g()||{},W=j7.length-1;if(W<0)return toastr.info(F("There are no messages to summarize yet.","STMemoryBooks_NoMessagesToSummarize"),F("STMemoryBooks","index.toast.title")),"";let q=typeof J.highestMemoryProcessed==="number"?J.highestMemoryProcessed:null,z=q===null?0:q+1,Y=W;if(z>Y)return toastr.info(F("No new messages since the last memory.","STMemoryBooks_NoNewMessagesSinceLastMemory"),F("STMemoryBooks","index.toast.title")),"";E6(z,Y),await v6()}catch(G){console.error(F("STMemoryBooks: /nextmemory failed:","index.error.nextMemoryFailed"),G),toastr.error(F("Failed to run /nextmemory: "+G.message,"STMemoryBooks_NextMemoryFailed"),F("STMemoryBooks","index.toast.title"))}return""}async function K$(Z,Q){let G=String(Q||"").trim();if(!G)return toastr.info(F('SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',"STMemoryBooks_SidePromptGuide"),F("STMemoryBooks","index.toast.title")),"";let J=G.match(/^["']([^"']+)["']\s*(.*)$/)||G.match(/^(.+?)(\s+\d+\s*[-–—]\s*\d+)?$/),W=J?(J[1]||G).trim():G;try{let z=(await z0()).filter((Y)=>Y.name.toLowerCase().includes(W.toLowerCase()));if(z.length>1){let Y=z.slice(0,5).map((X)=>X.name).join(", "),V=z.length>5?`, +${z.length-5} more`:"";return toastr.info(x`Multiple matches: ${Y}${V}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]`,F("STMemoryBooks","index.toast.title")),""}return bZ(G)}catch{return bZ(G)}}async function A7(Z,Q,G){let J=String(Q||"").trim();if(!J)return toastr.error(F(G?'Missing name. Use: /sideprompt-on "Name" OR /sideprompt-on all':'Missing name. Use: /sideprompt-off "Name" OR /sideprompt-off all',"STMemoryBooks_SidePromptToggle_MissingName"),F("STMemoryBooks","index.toast.title")),"";try{let{findTemplateByName:W,upsertTemplate:q,listTemplates:z}=await Promise.resolve().then(() => (P8(),L5));if(J.toLowerCase()==="all"){let V=await z(),X=0;for(let K of V)if(K.enabled!==G)await q({key:K.key,enabled:G}),X++;try{window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"))}catch(K){}return toastr.success(x`${G?"Enabled":"Disabled"} ${X} side prompt${X===1?"":"s"}`,F("STMemoryBooks","index.toast.title")),""}let Y=await W(J);if(!Y)return toastr.error(x`Side Prompt not found: ${J}`,F("STMemoryBooks","index.toast.title")),"";if(Y.enabled===G)return toastr.info(x`"${Y.name}" is already ${G?"enabled":"disabled"}`,F("STMemoryBooks","index.toast.title")),"";await q({key:Y.key,enabled:G});try{window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"))}catch(V){}toastr.success(x`${G?"Enabled":"Disabled"} "${Y.name}"`,F("STMemoryBooks","index.toast.title"))}catch(W){console.error("STMemoryBooks: sideprompt enable/disable failed:",W),toastr.error(x`Failed to toggle side prompt: ${W.message}`,F("STMemoryBooks","index.toast.title"))}return""}async function U$(Z,Q){return A7(Z,Q,!0)}async function j$(Z,Q){return A7(Z,Q,!1)}var N7=[];async function rZ(){try{N7=(await z0()||[]).filter((Q)=>{let G=Q?.triggers?.commands;if(!("commands"in(Q?.triggers||{})))return!0;return Array.isArray(G)&&G.some((J)=>String(J).toLowerCase()==="sideprompt")}).map((Q)=>Q.name)}catch(Z){console.warn(F("STMemoryBooks: side prompt cache refresh failed","index.warn.sidePromptCacheRefreshFailed"),Z)}}window.addEventListener("stmb-sideprompts-updated",rZ);try{rZ()}catch(Z){}var oZ=()=>N7.map((Z)=>new nZ(Z));function _1(){if(i.STMemoryBooks=i.STMemoryBooks||G8(H7),(i.STMemoryBooks.migrationVersion??1)<4){if(!i.STMemoryBooks.profiles?.some((W)=>W.useDynamicSTSettings||W?.connection?.api==="current_st")){if(!i.STMemoryBooks.profiles)i.STMemoryBooks.profiles=[];let W={name:"Current SillyTavern Settings",connection:{api:"current_st"},preset:"summary",constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0};if(i.STMemoryBooks.profiles.unshift(W),i.STMemoryBooks.defaultProfile!==void 0)i.STMemoryBooks.defaultProfile+=1;console.log(x`${U1}: Added dynamic profile for existing installation (migration to v3)`)}i.STMemoryBooks.profiles.forEach((W)=>{if(W.useDynamicSTSettings&&W.titleFormat)delete W.titleFormat,console.log(x`${U1}: Removed static titleFormat from dynamic profile`)}),i.STMemoryBooks.migrationVersion=4,s()}if(!i.STMemoryBooks.profiles||i.STMemoryBooks.profiles.length===0){let J={name:"Current SillyTavern Settings",connection:{api:"current_st"},preset:"summary",constVectMode:"link",position:0,orderMode:"auto",orderValue:100,preventRecursion:!1,delayUntilRecursion:!0};i.STMemoryBooks.profiles=[J],console.log(x`${U1}: Created dynamic profile for fresh installation`)}let Q=F$(i.STMemoryBooks),G=UZ(i.STMemoryBooks);if(G.fixes.length>0)console.log(x`${U1}: Applied profile fixes:`,G.fixes),s();return Q}function F$(Z){if(!Z.profiles||Z.profiles.length===0)Z.profiles=[],Z.defaultProfile=0;if(Z.defaultProfile>=Z.profiles.length)Z.defaultProfile=0;if(!Z.moduleSettings)Z.moduleSettings=G8(H7.moduleSettings);if(!Z.moduleSettings.tokenWarningThreshold||Z.moduleSettings.tokenWarningThreshold<1000)Z.moduleSettings.tokenWarningThreshold=30000;if(Z.moduleSettings.defaultMemoryCount=K1(Z.moduleSettings.defaultMemoryCount??0,0,7),Z.moduleSettings.unhiddenEntriesCount===void 0||Z.moduleSettings.unhiddenEntriesCount===null)Z.moduleSettings.unhiddenEntriesCount=2;if(Z.moduleSettings.autoSummaryEnabled===void 0)Z.moduleSettings.autoSummaryEnabled=!1;if(Z.moduleSettings.autoSummaryInterval===void 0||Z.moduleSettings.autoSummaryInterval<10)Z.moduleSettings.autoSummaryInterval=100;if(Z.moduleSettings.autoSummaryBuffer=K1(Z.moduleSettings.autoSummaryBuffer??0,0,50),Z.moduleSettings.autoCreateLorebook===void 0)Z.moduleSettings.autoCreateLorebook=!1;if(Z.moduleSettings.unhideBeforeMemory===void 0)Z.moduleSettings.unhideBeforeMemory=!1;if(!Z.moduleSettings.lorebookNameTemplate)Z.moduleSettings.lorebookNameTemplate="LTM - {{char}} - {{chat}}";if(Z.moduleSettings.manualModeEnabled&&Z.moduleSettings.autoCreateLorebook)Z.moduleSettings.autoCreateLorebook=!1,console.warn(F("STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false","index.warn.mutualExclusion"));if(!Z.migrationVersion||Z.migrationVersion<2)console.log(x`${U1}: Migrating to JSON-based architecture (v2)`),Z.migrationVersion=2,Z.profiles.forEach((Q)=>{if(Q.prompt&&Q.prompt.includes("createMemory"))console.log(x`${U1}: Updating profile "${Q.name}" to use JSON output`),Q.prompt=d1()});return Z}async function aZ(Z=!1){let Q=i.STMemoryBooks,G=await J8();if(!Z){if(!G&&Q?.moduleSettings?.autoCreateLorebook&&!Q?.moduleSettings?.manualModeEnabled){let J=Q.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",W=await X6(J,"chat");if(W.success)G=W.name;else return{valid:!1,error:W.error}}}if(!G)return{valid:!1,error:"No lorebook available or selected."};if(!C6||!C6.includes(G))return{valid:!1,error:`Selected lorebook "${G}" not found.`};try{let J=await sG(G);return{valid:!!J,data:J,name:G}}catch(J){return{valid:!1,error:"Failed to load the selected lorebook."}}}async function B$(Z,Q,G=null){let J=_1(),W=J.moduleSettings.tokenWarningThreshold??30000,q=!J.moduleSettings.alwaysUseDefault||Z.estimatedTokens>W,z=null;if(q){let X=G!==null?G:J.defaultProfile;if(z=await A5(Z,J,Q1(),o(),g0,X),!z.confirmed)return null}else{let X=J.profiles[J.defaultProfile];z={confirmed:!0,profileSettings:{...X,effectivePrompt:await B7(X)},advancedOptions:{memoryCount:K1(J.moduleSettings.defaultMemoryCount??0,0,7),overrideSettings:!1}}}let{profileSettings:Y,advancedOptions:V}=z;if(Y?.connection?.api==="current_st"||V.overrideSettings){let X=o(),K=Q1();if(Y.effectiveConnection={api:X.completionSource||"openai",model:K.model||"",temperature:K.temperature??0.7},Y.useDynamicSTSettings)console.log("STMemoryBooks: Using dynamic ST settings profile - current settings:",Y.effectiveConnection);else console.log("STMemoryBooks: Using current SillyTavern settings override for memory creation")}else Y.effectiveConnection={...Y.connection},console.log("STMemoryBooks: Using profile connection settings for memory creation");return{profileSettings:Y,summaryCount:V.memoryCount??0,tokenThreshold:W,settings:J}}function H$(Z){if(Z&&Z.name==="AIResponseError"){if(typeof Z.recoverable==="boolean")return Z.recoverable;if(Z.code&&String(Z.code).toUpperCase().includes("TRUNCATION"))return!0}if(["TokenWarningError","InvalidProfileError"].includes(Z?.name))return!1;if(Z?.message&&(Z.message.includes("Scene compilation failed")||Z.message.includes("Invalid memory result")||Z.message.includes("Invalid lorebook")))return!1;return!0}async function sZ(Z,Q,G,J=0){let{profileSettings:W,summaryCount:q,tokenThreshold:z,settings:Y}=G;w6=W;let V=null,X=null,K=null;try{if(Y?.moduleSettings?.convertExistingRecursion&&Q?.valid&&Q.data?.entries){let U=V8(Q.data)||[],O=U.length>0?U[0].entry:null,B=!!W.preventRecursion,N=!!W.delayUntilRecursion,H=!1;if(!O)H=!1;else{let T=!!O.preventRecursion,R=!!O.delayUntilRecursion;H=T!==B||R!==N}if(H){let T=0,R=0,w=Object.values(Q.data.entries||{});for(let v of w)if(v&&v.stmemorybooks===!0){T++;let y=v.preventRecursion!==B,h=v.delayUntilRecursion!==N;if(y||h)v.preventRecursion=B,v.delayUntilRecursion=N,R++}if(R>0){try{if(await rG(Q.name,Q.data,!0),Y.moduleSettings?.refreshEditor)try{aG(Q.name)}catch(v){}}catch(v){console.warn("STMemoryBooks: Failed to save lorebook during recursion conversion:",v)}try{toastr.info(x`Updated recursion flags on ${R} of ${T} memory entr${R===1?"y":"ies"}`,"STMemoryBooks")}catch(v){}}}}}catch(U){console.warn("STMemoryBooks: convertExistingRecursion check failed:",U)}let j=c8.MAX_RETRIES;try{if(Y?.moduleSettings?.unhideBeforeMemory)try{await nG(`/unhide ${Z.sceneStart}-${Z.sceneEnd}`)}catch(h){console.warn("STMemoryBooks: /unhide command failed or unavailable:",h)}let U=a0(Z.sceneStart,Z.sceneEnd);V=r0(U);let O=w4(V);if(!O.valid)throw Error(`Scene compilation failed: ${O.errors.join(", ")}`);let B=[];if(X={summaries:[],actualCount:0,requestedCount:0},q>0)if(X=await v0(q,Y,g0),B=X.summaries,X.actualCount>0){if(X.actualCount<X.requestedCount)toastr.warning(x`Only ${X.actualCount} of ${X.requestedCount} requested memories available`,"STMemoryBooks");console.log(`STMemoryBooks: Including ${X.actualCount} previous memories as context`)}else toastr.warning(F("No previous memories found in lorebook","STMemoryBooks_NoPreviousMemoriesFound"),"STMemoryBooks");let N;if(J>0)N=`Retrying memory creation (attempt ${J+1}/${j+1})...`;else N=X.actualCount>0?`Creating memory with ${X.actualCount} context memories...`:"Creating memory...";toastr.info(x`${N}`,"STMemoryBooks",{timeOut:0}),V.previousSummariesContext=B,K=await I4(V);let H=K?.estimatedTokens,T=await l4(V,W,{tokenWarningThreshold:z}),R=T;if(Y.moduleSettings.showMemoryPreviews){toastr.clear();let h=await U8(T,Z,W);if(h.action==="cancel")return;else if(h.action==="retry"){let P=J>=j?J-j:0;if(P>=3)return toastr.warning(x`Maximum retry attempts (${3}) reached`,"STMemoryBooks"),{action:"cancel"};toastr.info(x`Retrying memory generation (${P+1}/${3})...`,"STMemoryBooks");let b=Math.max(J+1,j+P+1);return await sZ(Z,Q,G,b)}if(h.action==="accept")R=T;else if(h.action==="edit"){if(!h.memoryData){console.error("STMemoryBooks: Edit action missing memoryData"),toastr.error(F("Unable to retrieve edited memory data","STMemoryBooks_UnableToRetrieveEditedMemoryData"),"STMemoryBooks");return}if(!h.memoryData.extractedTitle||!h.memoryData.content){console.error("STMemoryBooks: Edited memory data missing required fields"),toastr.error(F("Edited memory data is incomplete","STMemoryBooks_EditedMemoryDataIncomplete"),"STMemoryBooks");return}R=h.memoryData}else console.warn(`STMemoryBooks: Unexpected preview action: ${h.action}`),R=T}let w=await YZ(R,Q);if(!w.success)throw Error(w.error||"Failed to add memory to lorebook");try{let h=W?.effectiveConnection||W?.connection||{};console.debug("STMemoryBooks: Passing profile to runAfterMemory",{api:h.api,model:h.model,temperature:h.temperature}),await EZ(V,W)}catch(h){console.warn("STMemoryBooks: runAfterMemory failed:",h)}try{let h=g()||{};h.highestMemoryProcessed=Z.sceneEnd,Z1()}catch(h){console.warn("STMemoryBooks: Failed to update highestMemoryProcessed baseline:",h)}VZ();let v=X.actualCount>0?` (with ${X.actualCount} context ${X.actualCount===1?"memory":"memories"})`:"";toastr.clear(),k0=null,g8=null,u0=null;let y=J>0?` (succeeded on attempt ${J+1})`:"";toastr.success(x`Memory "${w.entryTitle}" created successfully${v}${y}!`,"STMemoryBooks")}catch(U){if(console.error("STMemoryBooks: Error creating memory:",U),J<j&&H$(U))return toastr.warning(x`Memory creation failed (attempt ${J+1}). Retrying in ${Math.round(c8.RETRY_DELAY_MS/1000)} seconds...`,"STMemoryBooks",{timeOut:3000}),await new Promise((H)=>setTimeout(H,c8.RETRY_DELAY_MS)),await sZ(Z,Q,G,J+1);let B=J>0?` (failed after ${J+1} attempts)`:"",N=U&&U.code?` [${U.code}]`:"";if(U.name==="TokenWarningError")toastr.error(x`Scene is too large (${U.tokenCount} tokens). Try selecting a smaller range${B}.`,"STMemoryBooks",{timeOut:8000});else if(U.name==="AIResponseError"){try{toastr.clear(k0)}catch(H){}g8=U,u0={sceneData:Z,compiledScene:V,profileSettings:W,lorebookValidation:Q,memoryFetchResult:X,sceneStats:K,settings:Y,summaryCount:q,tokenThreshold:z,sceneRange:V?.metadata?.sceneStart!==void 0?`${V.metadata.sceneStart}-${V.metadata.sceneEnd}`:`${Z.sceneStart}-${Z.sceneEnd}`},k0=toastr.error(x`AI failed to generate valid memory${N}: ${U.message}${B}`,"STMemoryBooks",{timeOut:0,extendedTimeOut:0,closeButton:!0,tapToDismiss:!1,onclick:()=>{try{k$(g8)}catch(H){console.error(H)}}})}else if(U.name==="InvalidProfileError")toastr.error(x`Profile configuration error: ${U.message}${B}`,"STMemoryBooks",{timeOut:8000});else toastr.error(x`Failed to create memory: ${U.message}${B}`,"STMemoryBooks")}}async function v6(Z=null){let Q=$8();if(!Q.isGroupChat){if(!pZ||pZ.length===0||!pZ[oG]){toastr.error(F("SillyTavern is still loading character data, please wait a few seconds and try again.","STMemoryBooks_LoadingCharacterData"),"STMemoryBooks");return}}else if(!Q.groupId||!Q.groupName){toastr.error(F("Group chat data not available, please wait a few seconds and try again.","STMemoryBooks_GroupChatDataUnavailable"),"STMemoryBooks");return}if(O1)return;O1=!0;try{let G=_1(),J=await D8();if(!J){console.error("STMemoryBooks: No scene selected for memory initiation"),toastr.error(F("No scene selected","STMemoryBooks_NoSceneSelected"),"STMemoryBooks"),O1=!1;return}let W=await aZ();if(!W.valid){console.error("STMemoryBooks: Lorebook validation failed:",W.error),toastr.error(F(W.error,"STMemoryBooks_LorebookValidationError"),"STMemoryBooks"),O1=!1;return}let q=V8(W.data),z=J.sceneStart,Y=J.sceneEnd;if(!G.moduleSettings.allowSceneOverlap)for(let X of q){let K=a4(X.entry);if(K&&K.start!==null&&K.end!==null){let j=Number(K.start),U=Number(K.end),O=Number(z),B=Number(Y);if(console.debug(`STMemoryBooks: OverlapCheck new=[${O}-${B}] existing="${X.title}" [${j}-${U}] cond1(ns<=e)=${O<=U} cond2(ne>=s)=${B>=j}`),O<=U&&B>=j){console.error(`STMemoryBooks: Scene overlap detected with memory: ${X.title} [${j}-${U}] vs new [${O}-${B}]`),toastr.error(x`Scene overlaps with existing memory: "${X.title}" (messages ${j}-${U})`,"STMemoryBooks"),O1=!1;return}}}let V=await B$(J,W,Z);if(!V){O1=!1;return}if(d)d.completeCancelled(),d=null;await sZ(J,W,V)}catch(G){console.error("STMemoryBooks: Critical error during memory initiation:",G),toastr.error(x`An unexpected error occurred: ${G.message}`,"STMemoryBooks")}finally{O1=!1}}function h6(Z){if(Z.autoHideMode)return Z.autoHideMode;if(Z.autoHideAllMessages)return"all";else if(Z.autoHideLastMemory)return"last";else return"none"}function z7(){let Z=i.STMemoryBooks;if(!Z)return;let Q=g()||{},G=Z.moduleSettings.manualModeEnabled,J=document.querySelector("#stmb-mode-badge");if(J)J.textContent=G?F("Manual","STMemoryBooks_Manual"):F("Automatic (Chat-bound)","STMemoryBooks_AutomaticChatBound");let W=document.querySelector("#stmb-active-lorebook");if(W){let K=G?Q.manualLorebook:g0?.[m8];W.textContent=K||F("None selected","STMemoryBooks_NoneSelected"),W.className=K?"":"opacity50p"}let q=document.querySelector("#stmb-manual-controls");if(q)q.style.display=G?"block":"none";let z=document.querySelector("#stmb-automatic-info");if(z){z.style.display=G?"none":"block";let K=z.querySelector("small");if(K){let j=g0?.[m8]??null;K.innerHTML=j?x`Using chat-bound lorebook "<strong>${j}</strong>"`:F("No chat-bound lorebook. Memories will require lorebook selection.","STMemoryBooks_NoChatBoundLorebook")}}let Y=document.querySelector("#stmb-auto-create-lorebook"),V=document.querySelector("#stmb-manual-mode-enabled"),X=document.querySelector("#stmb-lorebook-name-template");if(Y&&V){let K=Z.moduleSettings.autoCreateLorebook;if(Y.disabled=G,V.disabled=K,X)X.disabled=!K}}function M6(){if(!d?.dlg)return;let Z=_1(),Q=g()||{},G=d.content.querySelector("#stmb-manual-lorebook-buttons"),J=d.content.querySelector("#stmb-profile-buttons"),W=d.content.querySelector("#stmb-extra-function-buttons"),q=d.content.querySelector("#stmb-prompt-manager-buttons");if(G&&Z.moduleSettings.manualModeEnabled){let X=Q.manualLorebook??null,K=[{text:`\uD83D\uDCD5 ${X?F("Change","STMemoryBooks_ChangeManualLorebook"):F("Select","STMemoryBooks_SelectManualLorebook")} `+F("Manual Lorebook","STMemoryBooks_ManualLorebook"),id:"stmb-select-manual-lorebook",action:async()=>{try{if(await T0(X?Q.manualLorebook:null))Z0()}catch(j){console.error("STMemoryBooks: Error selecting manual lorebook:",j),toastr.error(F("Failed to select manual lorebook","STMemoryBooks_FailedToSelectManualLorebook"),"STMemoryBooks")}}}];if(X)K.push({text:"❌ "+F("Clear Manual Lorebook","STMemoryBooks_ClearManualLorebook"),id:"stmb-clear-manual-lorebook",action:()=>{try{let j=g()||{};delete j.manualLorebook,Z1(),Z0(),toastr.success(F("Manual lorebook cleared","STMemoryBooks_ManualLorebookCleared"),"STMemoryBooks")}catch(j){console.error("STMemoryBooks: Error clearing manual lorebook:",j),toastr.error(F("Failed to clear manual lorebook","STMemoryBooks_FailedToClearManualLorebook"),"STMemoryBooks")}}});G.innerHTML="",K.forEach((j)=>{let U=document.createElement("div");U.className="menu_button interactable whitespacenowrap",U.id=j.id,U.textContent=j.text,U.addEventListener("click",j.action),G.appendChild(U)})}if(!J||!W)return;let z=[{text:"⭐ "+F("Set as Default","STMemoryBooks_SetAsDefault"),id:"stmb-set-default-profile",action:()=>{let X=d?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let K=K1(W1(X,Z.defaultProfile??0),0,Z.profiles.length-1);if(K===Z.defaultProfile)return;Z.defaultProfile=K,s();let j=Z.profiles[K]?.connection?.api==="current_st"?F("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):Z.profiles[K].name;toastr.success(x`"${j}" is now the default profile.`,"STMemoryBooks"),Z0()}},{text:"✏️ "+F("Edit Profile","STMemoryBooks_EditProfile"),id:"stmb-edit-profile",action:async()=>{try{let X=d?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let K=K1(W1(X,Z.defaultProfile??0),0,Z.profiles.length-1),j=Z.profiles[K];if(j.useDynamicSTSettings)j.connection=j.connection||{},j.connection.api="current_st",delete j.useDynamicSTSettings,s();await Y5(Z,K,Z0)}catch(X){console.error(`${U1}: Error in edit profile:`,X),toastr.error(F("Failed to edit profile","STMemoryBooks_FailedToEditProfile"),"STMemoryBooks")}}},{text:"➕ "+F("New Profile","STMemoryBooks_NewProfile"),id:"stmb-new-profile",action:async()=>{try{await z5(Z,Z0)}catch(X){console.error(`${U1}: Error in new profile:`,X),toastr.error(F("Failed to create profile","STMemoryBooks_FailedToCreateProfile"),"STMemoryBooks")}}},{text:"\uD83D\uDDD1️ "+F("Delete Profile","STMemoryBooks_DeleteProfile"),id:"stmb-delete-profile",action:async()=>{try{let X=d?.dlg?.querySelector("#stmb-profile-select");if(!X)return;let K=W1(X,Z.defaultProfile??0);await X5(Z,K,Z0)}catch(X){console.error(`${U1}: Error in delete profile:`,X),toastr.error(F("Failed to delete profile","STMemoryBooks_FailedToDeleteProfile"),"STMemoryBooks")}}}],Y=[{text:"\uD83D\uDCE4 "+F("Export Profiles","STMemoryBooks_ExportProfiles"),id:"stmb-export-profiles",action:()=>{try{V5(Z)}catch(X){console.error(`${U1}: Error in export profiles:`,X),toastr.error(F("Failed to export profiles","STMemoryBooks_FailedToExportProfiles"),"STMemoryBooks")}}},{text:"\uD83D\uDCE5 "+F("Import Profiles","STMemoryBooks_ImportProfiles"),id:"stmb-import-profiles",action:()=>{let X=d?.dlg?.querySelector("#stmb-import-file");if(X)X.click()}}],V=[{text:"\uD83E\uDDE9 "+F("Summary Prompt Manager","STMemoryBooks_SummaryPromptManager"),id:"stmb-prompt-manager",action:async()=>{try{await d0()}catch(X){console.error(`${U1}: Error opening prompt manager:`,X),toastr.error(F("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}},{text:"\uD83E\uDDF1 "+F("Arc Prompt Manager","STMemoryBooks_ArcPromptManager"),id:"stmb-arc-prompt-manager",action:async()=>{try{await c0()}catch(X){console.error(`${U1}: Error opening Arc Prompt Manager:`,X),toastr.error(F("Failed to open Arc Prompt Manager","STMemoryBooks_FailedToOpenArcPromptManager"),"STMemoryBooks")}}},{text:"\uD83C\uDFA1 "+F("Trackers & Side Prompts","STMemoryBooks_SidePrompts"),id:"stmb-side-prompts",action:async()=>{try{await b5()}catch(X){console.error(`${U1}: Error opening Trackers & Side Prompts Manager:`,X),toastr.error(F("Failed to open Trackers & Side Prompts Manager","STMemoryBooks_FailedToOpenSidePrompts"),"STMemoryBooks")}}}];J.innerHTML="",W.innerHTML="",q.innerHTML="",z.forEach((X)=>{let K=document.createElement("div");K.className="menu_button interactable whitespacenowrap",K.id=X.id,K.textContent=X.text,K.addEventListener("click",X.action),J.appendChild(K)}),Y.forEach((X)=>{let K=document.createElement("div");K.className="menu_button interactable whitespacenowrap",K.id=X.id,K.textContent=X.text,K.addEventListener("click",X.action),W.appendChild(K)}),V.forEach((X)=>{let K=document.createElement("div");K.className="menu_button interactable whitespacenowrap",K.id=X.id,K.textContent=X.text,K.addEventListener("click",X.action),q.appendChild(K)})}async function d0(){try{let Z=i.STMemoryBooks;await Z8(Z);let Q=await A0(),G='<h3 data-i18n="STMemoryBooks_PromptManager_Title">\uD83E\uDDE9 Summary Prompt Manager</h3>';G+='<div class="world_entry_form_control">',G+='<p data-i18n="STMemoryBooks_PromptManager_Desc">Manage your summary generation prompts. All presets are editable.</p>',G+="</div>",G+='<div class="world_entry_form_control">',G+='<input type="text" id="stmb-prompt-search" class="text_pole" placeholder="Search presets..." aria-label="Search presets" data-i18n="[placeholder]STMemoryBooks_PromptManager_Search;[aria-label]STMemoryBooks_PromptManager_Search" />',G+="</div>",G+='<div id="stmb-preset-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',G+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',G+='<button id="stmb-pm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_New">➕ New Preset</button>',G+='<button id="stmb-pm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Export">\uD83D\uDCE4 Export JSON</button>',G+='<button id="stmb-pm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Import">\uD83D\uDCE5 Import JSON</button>',G+='<button id="stmb-pm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_RecreateBuiltins">♻️ Recreate Built-in Prompts</button>',G+='<button id="stmb-pm-apply" class="menu_button whitespacenowrap" disabled data-i18n="STMemoryBooks_PromptManager_ApplyToProfile">✅ Apply to Selected Profile</button>',G+="</div>",G+=`<small>${F(`\uD83D\uDCA1 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don't change the "respond with JSON" instructions, \uD83D\uDCD5Memory Books uses that to process the returned result from the AI.`,"STMemoryBooks_PromptManager_Hint")}</small>`,G+='<input type="file" id="stmb-pm-import-file" accept=".json" style="display: none;" />';let J=new G1(G,a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:F("Close","STMemoryBooks_Close")});O$(J);let W=J.dlg?.querySelector("#stmb-preset-list");if(W){let q=(Q||[]).map((z)=>({key:String(z.key||""),displayName:String(z.displayName||"")}));W.innerHTML=m0.sanitize(cZ({items:q}))}await J.show()}catch(Z){console.error("STMemoryBooks: Error showing prompt manager:",Z),toastr.error(F("Failed to open Summary Prompt Manager","STMemoryBooks_FailedToOpenSummaryPromptManager"),"STMemoryBooks")}}function O$(Z){let Q=Z.dlg,G=null;Q.addEventListener("click",async(W)=>{let q=W.target.closest(".stmb-action");if(q){W.preventDefault(),W.stopPropagation();let Y=q.closest("tr[data-preset-key]"),V=Y?.dataset.presetKey;if(!V)return;if(Q.querySelectorAll("tr[data-preset-key]").forEach((K)=>{K.classList.remove("ui-state-active"),K.style.backgroundColor="",K.style.border=""}),Y)Y.style.backgroundColor="var(--cobalt30a)",Y.style.border="",G=V;let X=Q.querySelector("#stmb-pm-apply");if(X)X.disabled=!1;if(q.classList.contains("stmb-action-edit"))await X7(Z,V);else if(q.classList.contains("stmb-action-duplicate"))await V7(Z,V);else if(q.classList.contains("stmb-action-delete"))await K7(Z,V);return}let z=W.target.closest("tr[data-preset-key]");if(z){Q.querySelectorAll("tr[data-preset-key]").forEach((V)=>{V.classList.remove("ui-state-active"),V.style.backgroundColor="",V.style.border=""}),z.style.backgroundColor="var(--cobalt30a)",z.style.border="",G=z.dataset.presetKey;let Y=Q.querySelector("#stmb-pm-apply");if(Y)Y.disabled=!1}});let J=Q.querySelector("#stmb-prompt-search");if(J)J.addEventListener("input",(W)=>{let q=W.target.value.toLowerCase();Q.querySelectorAll("tr[data-preset-key]").forEach((z)=>{let Y=z.querySelector("td:first-child").textContent.toLowerCase();z.style.display=Y.includes(q)?"":"none"})});Q.querySelector("#stmb-pm-new")?.addEventListener("click",async()=>{await A$(Z)}),Q.querySelector("#stmb-pm-edit")?.addEventListener("click",async()=>{if(G)await X7(Z,G)}),Q.querySelector("#stmb-pm-duplicate")?.addEventListener("click",async()=>{if(G)await V7(Z,G)}),Q.querySelector("#stmb-pm-delete")?.addEventListener("click",async()=>{if(G)await K7(Z,G)}),Q.querySelector("#stmb-pm-export")?.addEventListener("click",async()=>{await N$()}),Q.querySelector("#stmb-pm-import")?.addEventListener("click",()=>{Q.querySelector("#stmb-pm-import-file")?.click()}),Q.querySelector("#stmb-pm-import-file")?.addEventListener("change",async(W)=>{await T$(W,Z)}),Q.querySelector("#stmb-pm-recreate-builtins")?.addEventListener("click",async()=>{try{let W=`
                <h3>${E(F("Recreate Built-in Prompts","STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${E(F("This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.","STMemoryBooks_RecreateBuiltinsWarning"))}
                </div>
                <p class="opacity70p">${E(F("This does not affect your other custom presets.","STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;if(await new G1(W,a.CONFIRM,"",{okButton:F("Overwrite","STMemoryBooks_RecreateBuiltinsOverwrite"),cancelButton:F("Cancel","STMemoryBooks_Cancel")}).show()===l.AFFIRMATIVE){let Y=await H4("overwrite");try{window.dispatchEvent(new CustomEvent("stmb-presets-updated"))}catch(V){}toastr.success(x`Removed ${Y?.removed||0} built-in overrides`,F("STMemoryBooks","index.toast.title")),Z.completeAffirmative(),await d0()}}catch(W){console.error("STMemoryBooks: Error recreating built-in prompts:",W),toastr.error(F("Failed to recreate built-in prompts","STMemoryBooks_FailedToRecreateBuiltins"),F("STMemoryBooks","index.toast.title"))}}),Q.querySelector("#stmb-pm-apply")?.addEventListener("click",async()=>{if(!G){toastr.error(F("Select a preset first","STMemoryBooks_SelectPresetFirst"),"STMemoryBooks");return}let W=i?.STMemoryBooks;if(!W||!Array.isArray(W.profiles)||W.profiles.length===0){toastr.error(F("No profiles available","STMemoryBooks_NoProfilesAvailable"),"STMemoryBooks");return}let q=W.defaultProfile??0;if(d?.dlg){let Y=d.dlg.querySelector("#stmb-profile-select");if(Y)q=W1(Y,W.defaultProfile??0)}let z=W.profiles[q];if(!z){toastr.error(F("Selected profile not found","STMemoryBooks_SelectedProfileNotFound"),"STMemoryBooks");return}if(z.prompt&&z.prompt.trim())if(await new G1('<h3 data-i18n="STMemoryBooks_ClearCustomPromptTitle">Clear Custom Prompt?</h3><p data-i18n="STMemoryBooks_ClearCustomPromptDesc">This profile has a custom prompt. Clear it so the selected preset is used?</p>',a.CONFIRM,"",{okButton:F("Clear and Apply","STMemoryBooks_ClearAndApply"),cancelButton:F("Cancel","STMemoryBooks_Cancel")}).show()===l.AFFIRMATIVE)z.prompt="";else return;if(z.preset=G,s(),toastr.success(F("Preset applied to profile","STMemoryBooks_PresetAppliedToProfile"),"STMemoryBooks"),d?.dlg)try{Z0()}catch(Y){}})}async function A$(Z){let G=new G1(`
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
    `,a.TEXT,"",{okButton:F("Create","STMemoryBooks_Create"),cancelButton:F("Cancel","STMemoryBooks_Cancel")});if(await G.show()===l.AFFIRMATIVE){let W=G.dlg.querySelector("#stmb-pm-new-display-name").value.trim(),q=G.dlg.querySelector("#stmb-pm-new-prompt").value.trim();if(!q){toastr.error(F("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}try{await I8(null,q,W||null),toastr.success(F("Preset created successfully","STMemoryBooks_PresetCreatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await d0()}catch(z){console.error("STMemoryBooks: Error creating preset:",z),toastr.error(F("Failed to create preset","STMemoryBooks_FailedToCreatePreset"),"STMemoryBooks")}}}async function X7(Z,Q){try{let G=await g6(Q),J=await G0(Q),W=`
            <h3 data-i18n="STMemoryBooks_EditPresetTitle">Edit Preset</h3>
            <div class="world_entry_form_control">
                <label for="stmb-pm-edit-display-name">
                    <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                    <input type="text" id="stmb-pm-edit-display-name" class="text_pole" value="${E(G)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-pm-edit-prompt">
                    <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-pm-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-pm-edit-prompt" class="text_pole textarea_compact" rows="10">${E(J)}</textarea>
                </label>
            </div>
        `,q=new G1(W,a.TEXT,"",{okButton:F("Save","STMemoryBooks_Save"),cancelButton:F("Cancel","STMemoryBooks_Cancel")});if(await q.show()===l.AFFIRMATIVE){let Y=q.dlg.querySelector("#stmb-pm-edit-display-name").value.trim(),V=q.dlg.querySelector("#stmb-pm-edit-prompt").value.trim();if(!V){toastr.error(F("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}await I8(Q,V,Y||null),toastr.success(F("Preset updated successfully","STMemoryBooks_PresetUpdatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await d0()}}catch(G){console.error("STMemoryBooks: Error editing preset:",G),toastr.error(F("Failed to edit preset","STMemoryBooks_FailedToEditPreset"),"STMemoryBooks")}}async function V7(Z,Q){try{let G=await U4(Q);toastr.success(F("Preset duplicated successfully","STMemoryBooks_PresetDuplicatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await d0()}catch(G){console.error("STMemoryBooks: Error duplicating preset:",G),toastr.error(F("Failed to duplicate preset","STMemoryBooks_FailedToDuplicatePreset"),"STMemoryBooks")}}async function K7(Z,Q){let G=await g6(Q),J=new G1(`<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${E(F('Are you sure you want to delete "{{name}}"?',"STMemoryBooks_DeletePresetConfirm",{name:G}))}</p>`,a.CONFIRM,"",{okButton:F("Delete","STMemoryBooks_Delete"),cancelButton:F("Cancel","STMemoryBooks_Cancel")});try{O8(J.dlg)}catch(q){}if(await J.show()===l.AFFIRMATIVE)try{await j4(Q),toastr.success(F("Preset deleted successfully","STMemoryBooks_PresetDeletedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Z.completeAffirmative(),await d0()}catch(q){console.error("STMemoryBooks: Error deleting preset:",q),toastr.error(F("Failed to delete preset","STMemoryBooks_FailedToDeletePreset"),"STMemoryBooks")}}async function N$(){try{let Z=await F4(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-summary-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(F("Prompts exported successfully","STMemoryBooks_PromptsExportedSuccessfully"),"STMemoryBooks")}catch(Z){console.error("STMemoryBooks: Error exporting prompts:",Z),toastr.error(F("Failed to export prompts","STMemoryBooks_FailedToExportPrompts"),"STMemoryBooks")}}async function T$(Z,Q){let G=Z.target.files[0];if(!G)return;try{let J=await G.text();await B4(J),toastr.success(F("Prompts imported successfully","STMemoryBooks_PromptsImportedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-presets-updated")),Q.completeAffirmative(),await d0()}catch(J){console.error("STMemoryBooks: Error importing prompts:",J),toastr.error(x`Failed to import prompts: ${J.message}`,"STMemoryBooks")}}async function c0(){try{let Z=i.STMemoryBooks;await gZ(Z);let Q=await N6(),G='<h3 data-i18n="STMemoryBooks_ArcPromptManager_Title">\uD83E\uDDF1 Arc Prompt Manager</h3>';G+='<div class="world_entry_form_control">',G+='<p data-i18n="STMemoryBooks_ArcPromptManager_Desc">Manage your Arc Analysis prompts. All presets are editable.</p>',G+="</div>",G+='<div class="world_entry_form_control">',G+='<input type="text" id="stmb-apm-search" class="text_pole" placeholder="Search arc presets..." aria-label="Search arc presets" data-i18n="[placeholder]STMemoryBooks_ArcPromptManager_Search;[aria-label]STMemoryBooks_ArcPromptManager_Search" />',G+="</div>",G+='<div id="stmb-apm-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>',G+='<div class="buttons_block justifyCenter gap10px whitespacenowrap">',G+='<button id="stmb-apm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_New">➕ New Arc Preset</button>',G+='<button id="stmb-apm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Export">\uD83D\uDCE4 Export JSON</button>',G+='<button id="stmb-apm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Import">\uD83D\uDCE5 Import JSON</button>',G+='<button id="stmb-apm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_RecreateBuiltins">♻️ Recreate Built-in Arc Prompts</button>',G+="</div>",G+='<input type="file" id="stmb-apm-import-file" accept=".json" style="display: none;" />';let J=new G1(G,a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:F("Close","STMemoryBooks_Close")});R$(J);let W=J.dlg?.querySelector("#stmb-apm-list");if(W){let q=(Q||[]).map((z)=>({key:String(z.key||""),displayName:String(z.displayName||"")}));W.innerHTML=m0.sanitize(cZ({items:q}))}await J.show()}catch(Z){console.error("STMemoryBooks: Error showing Arc Prompt Manager:",Z),toastr.error(F("Failed to open Arc Prompt Manager","STMemoryBooks_FailedToOpenArcPromptManager"),"STMemoryBooks")}}function R$(Z){let Q=Z.dlg,G=null;Q.addEventListener("click",async(J)=>{let W=J.target.closest(".stmb-action");if(W){J.preventDefault(),J.stopPropagation();let z=W.closest("tr[data-preset-key]"),Y=z?.dataset.presetKey;if(!Y)return;if(Q.querySelectorAll("tr[data-preset-key]").forEach((V)=>{V.classList.remove("ui-state-active"),V.style.backgroundColor="",V.style.border=""}),z)z.style.backgroundColor="var(--cobalt30a)",z.style.border="",G=Y;if(W.classList.contains("stmb-action-edit"))await _$(Z,Y);else if(W.classList.contains("stmb-action-duplicate"))await I$(Z,Y);else if(W.classList.contains("stmb-action-delete"))await w$(Z,Y);return}let q=J.target.closest("tr[data-preset-key]");if(q)Q.querySelectorAll("tr[data-preset-key]").forEach((z)=>{z.classList.remove("ui-state-active"),z.style.backgroundColor="",z.style.border=""}),q.style.backgroundColor="var(--cobalt30a)",q.style.border="",G=q.dataset.presetKey}),Q.querySelector("#stmb-apm-search")?.addEventListener("input",(J)=>{let W=J.target.value.toLowerCase();Q.querySelectorAll("tr[data-preset-key]").forEach((q)=>{let z=q.querySelector("td:first-child").textContent.toLowerCase();q.style.display=z.includes(W)?"":"none"})}),Q.querySelector("#stmb-apm-new")?.addEventListener("click",async()=>{await D$(Z)}),Q.querySelector("#stmb-apm-export")?.addEventListener("click",async()=>{await L$()}),Q.querySelector("#stmb-apm-import")?.addEventListener("click",()=>{Q.querySelector("#stmb-apm-import-file")?.click()}),Q.querySelector("#stmb-apm-import-file")?.addEventListener("change",async(J)=>{await C$(J,Z)}),Q.querySelector("#stmb-apm-recreate-builtins")?.addEventListener("click",async()=>{try{let J=`
                <h3>${E(F("Recreate Built-in Prompts","STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${E(F("This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.","STMemoryBooks_RecreateBuiltinsWarning"))}
                </div>
                <p class="opacity70p">${E(F("This does not affect your other custom presets.","STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;if(await new G1(J,a.CONFIRM,"",{okButton:F("Overwrite","STMemoryBooks_RecreateBuiltinsOverwrite"),cancelButton:F("Cancel","STMemoryBooks_Cancel")}).show()===l.AFFIRMATIVE){let z=await i5("overwrite");try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch(Y){}toastr.success(x`Removed ${z?.removed||0} built-in overrides`,F("STMemoryBooks","index.toast.title")),Z.completeAffirmative(),await c0()}}catch(J){console.error("STMemoryBooks: Error recreating built-in arc prompts:",J),toastr.error(F("Failed to recreate built-in prompts","STMemoryBooks_FailedToRecreateBuiltins"),F("STMemoryBooks","index.toast.title"))}})}async function D$(Z){let G=new G1(`
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
    `,a.TEXT,"",{okButton:F("Create","STMemoryBooks_Create"),cancelButton:F("Cancel","STMemoryBooks_Cancel")});if(await G.show()===l.AFFIRMATIVE){let W=G.dlg.querySelector("#stmb-apm-new-display-name").value.trim(),q=G.dlg.querySelector("#stmb-apm-new-prompt").value.trim();if(!q){toastr.error(F("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}try{await mZ(null,q,W||null),toastr.success(F("Preset created successfully","STMemoryBooks_PresetCreatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await c0()}catch(z){console.error("STMemoryBooks: Error creating arc preset:",z),toastr.error(F("Failed to create preset","STMemoryBooks_FailedToCreatePreset"),"STMemoryBooks")}}}async function _$(Z,Q){try{let G=await uZ(Q),J=await T6(Q),W=`
            <h3 data-i18n="STMemoryBooks_EditPresetTitle">Edit Preset</h3>
            <div class="world_entry_form_control">
                <label for="stmb-apm-edit-display-name">
                    <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                    <input type="text" id="stmb-apm-edit-display-name" class="text_pole" value="${E(G)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-apm-edit-prompt">
                    <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-apm-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-apm-edit-prompt" class="text_pole textarea_compact" rows="10">${E(J)}</textarea>
                </label>
            </div>
        `,q=new G1(W,a.TEXT,"",{okButton:F("Save","STMemoryBooks_Save"),cancelButton:F("Cancel","STMemoryBooks_Cancel")});if(await q.show()===l.AFFIRMATIVE){let Y=q.dlg.querySelector("#stmb-apm-edit-display-name").value.trim(),V=q.dlg.querySelector("#stmb-apm-edit-prompt").value.trim();if(!V){toastr.error(F("Prompt cannot be empty","STMemoryBooks_PromptCannotBeEmpty"),"STMemoryBooks");return}await mZ(Q,V,Y||null),toastr.success(F("Preset updated successfully","STMemoryBooks_PresetUpdatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await c0()}}catch(G){console.error("STMemoryBooks: Error editing arc preset:",G),toastr.error(F("Failed to edit preset","STMemoryBooks_FailedToEditPreset"),"STMemoryBooks")}}async function I$(Z,Q){try{let G=await m5(Q);toastr.success(F("Preset duplicated successfully","STMemoryBooks_PresetDuplicatedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await c0()}catch(G){console.error("STMemoryBooks: Error duplicating arc preset:",G),toastr.error(F("Failed to duplicate preset","STMemoryBooks_FailedToDuplicatePreset"),"STMemoryBooks")}}async function w$(Z,Q){let G=await uZ(Q),J=new G1(`<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${E(F('Are you sure you want to delete "{{name}}"?',"STMemoryBooks_DeletePresetConfirm",{name:G}))}</p>`,a.CONFIRM,"",{okButton:F("Delete","STMemoryBooks_Delete"),cancelButton:F("Cancel","STMemoryBooks_Cancel")});try{O8(J.dlg)}catch(q){}if(await J.show()===l.AFFIRMATIVE)try{await d5(Q),toastr.success(F("Preset deleted successfully","STMemoryBooks_PresetDeletedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Z.completeAffirmative(),await c0()}catch(q){console.error("STMemoryBooks: Error deleting arc preset:",q),toastr.error(F("Failed to delete preset","STMemoryBooks_FailedToDeletePreset"),"STMemoryBooks")}}async function L$(){try{let Z=await c5(),Q=new Blob([Z],{type:"application/json"}),G=URL.createObjectURL(Q),J=document.createElement("a");J.href=G,J.download="stmb-arc-prompts.json",J.click(),URL.revokeObjectURL(G),toastr.success(F("Prompts exported successfully","STMemoryBooks_PromptsExportedSuccessfully"),"STMemoryBooks")}catch(Z){console.error("STMemoryBooks: Error exporting arc prompts:",Z),toastr.error(F("Failed to export prompts","STMemoryBooks_FailedToExportPrompts"),"STMemoryBooks")}}async function C$(Z,Q){let G=Z.target.files[0];if(!G)return;try{let J=await G.text();await p5(J),toastr.success(F("Prompts imported successfully","STMemoryBooks_PromptsImportedSuccessfully"),"STMemoryBooks"),window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated")),Q.completeAffirmative(),await c0()}catch(J){console.error("STMemoryBooks: Error importing arc prompts:",J),toastr.error(x`Failed to import prompts: ${J.message}`,"STMemoryBooks")}}async function h$(){try{let Z=await aZ(!0),Q=Z?.name||null,G=Z?.data||{entries:{}};if(!Z?.valid||!Q)toastr.info("No memory lorebook currently assigned, no memories found.","SillyTavern Memory Books"),Q=null,G={entries:{}};let J=Object.values(G.entries||{}),W=(_)=>{if(typeof _!=="string")return 0;let P=_.match(/\[(\d+)\]/);if(P)return parseInt(P[1],10);let b=_.match(/^(\d+)[\s-]/);if(b)return parseInt(b[1],10);return 0},q=J.filter((_)=>_&&_.stmemorybooks===!0&&_.stmbArc!==!0&&!_.disable).sort((_,P)=>W(_.comment||"")-W(P.comment||""));await gZ(i?.STMemoryBooks);let z=await N6(),Y="arc_default",X=_1()?.moduleSettings?.tokenWarningThreshold??30000,K="";K+=`<h3>${E(F("\uD83C\uDF08 Consolidate Memories into Arcs","STMemoryBooks_ConsolidateArcs_Title"))}</h3>`,K+='<div class="world_entry_form_control">',K+=`<label><strong>${E(F("Preset","STMemoryBooks_ConsolidateArcs_Preset"))}:</strong> `,K+='<select id="stmb-arc-preset" class="text_pole">';for(let _ of z){let P=String(_.key||""),b=String(_.displayName||P),f=P===Y?" selected":"";K+=`<option value="${E(P)}"${f}>${E(b)}</option>`}K+=`</select></label> <button id="stmb-arc-rebuild-builtins" class="menu_button whitespacenowrap">${E(F("Rebuild from built-ins","STMemoryBooks_Arc_RebuildBuiltins"))}</button></div>`,K+='<div class="flex-container flexGap10">',K+=`<label>${E(F("Maximum number of memories to process in each pass","STMemoryBooks_Arc_MaxPerPass"))} <input id="stmb-arc-maxpass" type="number" min="1" max="50" value="12" class="text_pole" style="width:80px"/></label>`,K+=`<label>${E(F("Number of automatic arc attempts","STMemoryBooks_Arc_MaxPasses"))} <input id="stmb-arc-maxpasses" type="number" min="1" max="50" value="10" class="text_pole" style="width:100px"/></label>`,K+=`<label>${E(F("Minimum number of memories in each arc","STMemoryBooks_Arc_MinAssigned"))} <input id="stmb-arc-minassigned" type="number" min="1" max="12" value="2" class="text_pole" style="width:110px"/></label>`,K+=`<label>${E(F("Token Budget","STMemoryBooks_Arc_TokenBudget"))} <input id="stmb-arc-token" type="number" min="1000" max="100000" value="${X}" class="text_pole" style="width:120px"/></label>`,K+="</div>",K+='<div class="world_entry_form_control">',K+=`<label><input id="stmb-arc-disable-originals" type="checkbox"/> ${E(F("Disable originals after creating arcs","STMemoryBooks_ConsolidateArcs_DisableOriginals"))}</label>`,K+="</div>",K+='<div class="world_entry_form_control"><div class="flex-container flexGap10 marginBot5">',K+=`<button id="stmb-arc-select-all" class="menu_button">${E(F("Select All","STMemoryBooks_SelectAll"))}</button>`,K+=`<button id="stmb-arc-deselect-all" class="menu_button">${E(F("Deselect All","STMemoryBooks_DeselectAll"))}</button>`,K+="</div>",K+='<div id="stmb-arc-list" style="max-height:300px; overflow-y:auto; border:1px solid var(--SmartHover2); padding:6px">';for(let _ of q){let P=_.comment||"(untitled)",b=String(_.uid),f=W(P);K+=`<label class="flex-container flexGap10" style="align-items:center; margin:2px 0;"><input type="checkbox" class="stmb-arc-item" value="${E(b)}" checked /> <span class="opacity70p">[${String(f).padStart(3,"0")}]</span> <span>${E(P)}</span></label>`}K+="</div>",K+=`<small class="opacity70p">${E(F("Tip: uncheck memories that should not be included.","STMemoryBooks_ConsolidateArcs_Tip"))}</small>`,K+="</div>";let j=new G1(m0.sanitize(K),a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:F("Run","STMemoryBooks_Run"),cancelButton:F("Cancel","STMemoryBooks_Cancel")}),U=j.dlg;try{O8(U)}catch(_){}if(U.querySelector("#stmb-arc-select-all")?.addEventListener("click",(_)=>{_.preventDefault(),U.querySelectorAll(".stmb-arc-item").forEach((P)=>P.checked=!0)}),U.querySelector("#stmb-arc-deselect-all")?.addEventListener("click",(_)=>{_.preventDefault(),U.querySelectorAll(".stmb-arc-item").forEach((P)=>P.checked=!1)}),U.querySelector("#stmb-arc-rebuild-builtins")?.addEventListener("click",async(_)=>{_.preventDefault();try{let P=`
                    <h3>${E(F("Rebuild Arc Prompts from Built-ins","STMemoryBooks_Arc_RebuildTitle"))}</h3>
                    <div class="info-block warning">
                        ${E(F("This will overwrite your saved Arc prompt presets with the built-ins. A timestamped backup will be created.","STMemoryBooks_Arc_RebuildWarning"))}
                    </div>
                    <p class="opacity70p">${E(F("After rebuild, the preset list will refresh automatically.","STMemoryBooks_Arc_RebuildNote"))}</p>
                `;if(await new G1(P,a.CONFIRM,"",{okButton:F("Rebuild","STMemoryBooks_Rebuild"),cancelButton:F("Cancel","STMemoryBooks_Cancel")}).show()!==l.AFFIRMATIVE)return;let m=await l5({backup:!0}),M=await N6(),r=U.querySelector("#stmb-arc-preset");if(r){let v1=r.value||Y;r.innerHTML="";for(let $1 of M){let j1=String($1.key||""),o1=String($1.displayName||j1),A1=document.createElement("option");A1.value=j1,A1.textContent=o1,r.appendChild(A1)}if(Array.from(r.options).some(($1)=>$1.value===v1))r.value=v1;else r.value=Y}try{window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"))}catch(v1){}let g1=m?.backupName?` (backup: ${m.backupName}) `:"";toastr.success(x`Rebuilt Arc prompts (${m?.count||0} presets)${g1}`,"STMemoryBooks")}catch(P){console.error("STMemoryBooks: Arc prompts rebuild failed:",P),toastr.error(x`Failed to rebuild Arc prompts: ${P.message}`,"STMemoryBooks")}}),await j.show()!==l.AFFIRMATIVE)return;let B=Array.from(U.querySelectorAll(".stmb-arc-item")).filter((_)=>_.checked).map((_)=>_.value);if(B.length===0){toastr.error(F("Select at least one memory to consolidate.","STMemoryBooks_SelectAtLeastOne"),"STMemoryBooks");return}if(!Q){toastr.info("Arc consolidation requires a memory lorebook. No lorebook assigned.","STMemoryBooks");return}let H={presetKey:String(U.querySelector("#stmb-arc-preset")?.value||"arc_default"),maxItemsPerPass:Math.max(1,W1(U.querySelector("#stmb-arc-maxpass"),12)),maxPasses:Math.max(1,W1(U.querySelector("#stmb-arc-maxpasses"),10)),minAssigned:Math.max(1,W1(U.querySelector("#stmb-arc-minassigned"),2)),tokenTarget:Math.max(1000,W1(U.querySelector("#stmb-arc-token"),X))},T=!!U.querySelector("#stmb-arc-disable-originals")?.checked,R=new Map(q.map((_)=>[String(_.uid),_])),w=B.map((_)=>R.get(String(_))).filter(Boolean);toastr.info(F("Consolidating memories into arcs...","STMemoryBooks_ConsolidatingArcs"),"STMemoryBooks",{timeOut:0});let v;try{v=await $7(w,H,null)}catch(_){try{toastr.clear(B8)}catch(P){}if(L6=_,H8={lorebookName:Q,lorebookData:G,selectedEntries:w,options:H,disableOriginals:T},_?.name==="ArcAIResponseError")B8=toastr.error(x`Arc analysis failed (invalid JSON): ${_.message}`,"STMemoryBooks",{timeOut:0,extendedTimeOut:0,closeButton:!0,tapToDismiss:!1,onclick:()=>{try{f$(L6)}catch(P){console.error(P)}}});else toastr.error(x`Arc analysis failed: ${_.message}`,"STMemoryBooks");return}let{arcCandidates:y,leftovers:h}=v||{arcCandidates:[],leftovers:[]};if(!y||y.length===0){toastr.warning(F("No arcs were produced. Try different settings or selection.","STMemoryBooks_NoArcsProduced"),"STMemoryBooks");return}try{let _=await dZ({lorebookName:Q,lorebookData:G,arcCandidates:y,disableOriginals:T}),P=Array.isArray(_?.results)?_.results.length:y.length,b=`Created ${P} arc${P===1?"":"s"}${h?.length?`, ${h.length} leftover`:""}.`;if(P===1&&(!h||h.length===0))b+=" (all selected memories were consumed into a single arc)";toastr.success(x`${b}`,"STMemoryBooks"),L6=null,H8=null;try{toastr.clear(B8)}catch(f){}B8=null}catch(_){toastr.error(x`Failed to commit arcs: ${_.message}`,"STMemoryBooks")}}catch(Z){console.error("STMemoryBooks: showArcConsolidationPopup failed:",Z),toastr.error(x`Failed to open consolidate popup: ${Z.message}`,"STMemoryBooks")}}async function M$(){let Z=_1();await Z8(Z);let Q=await D8(),G=Array.isArray(Z.moduleSettings.selectedRegexOutgoing)?Z.moduleSettings.selectedRegexOutgoing:[],J=Array.isArray(Z.moduleSettings.selectedRegexIncoming)?Z.moduleSettings.selectedRegexIncoming:[],W=[];try{(F7({allowedOnly:!1})||[]).forEach((N,H)=>{let T=`idx:${H}`,R=`${N?.scriptName||"Untitled"}${N?.disabled?" (disabled)":""}`;W.push({key:T,label:R,selectedOutgoing:G.includes(T),selectedIncoming:J.includes(T)})})}catch(B){console.warn("STMemoryBooks: Failed to enumerate Regex scripts for UI",B)}let q=Z.profiles[Z.defaultProfile],z=g(),Y=Z.moduleSettings.manualModeEnabled,V=g0?.[m8]??null,X=z?.manualLorebook??null,K={hasScene:!!Q,sceneData:Q,highestMemoryProcessed:z?.highestMemoryProcessed,alwaysUseDefault:Z.moduleSettings.alwaysUseDefault,showMemoryPreviews:Z.moduleSettings.showMemoryPreviews,showNotifications:Z.moduleSettings.showNotifications,unhideBeforeMemory:Z.moduleSettings.unhideBeforeMemory||!1,refreshEditor:Z.moduleSettings.refreshEditor,allowSceneOverlap:Z.moduleSettings.allowSceneOverlap,manualModeEnabled:Z.moduleSettings.manualModeEnabled,lorebookMode:Y?"Manual":"Automatic (Chat-bound)",currentLorebookName:Y?X:V,manualLorebookName:X,chatBoundLorebookName:V,availableLorebooks:C6??[],autoHideMode:h6(Z.moduleSettings),unhiddenEntriesCount:Z.moduleSettings.unhiddenEntriesCount??2,tokenWarningThreshold:Z.moduleSettings.tokenWarningThreshold??50000,defaultMemoryCount:Z.moduleSettings.defaultMemoryCount??0,autoSummaryEnabled:Z.moduleSettings.autoSummaryEnabled??!1,autoSummaryInterval:Z.moduleSettings.autoSummaryInterval??50,autoSummaryBuffer:Z.moduleSettings.autoSummaryBuffer??2,autoCreateLorebook:Z.moduleSettings.autoCreateLorebook??!1,lorebookNameTemplate:Z.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",profiles:Z.profiles.map((B,N)=>({...B,name:B?.connection?.api==="current_st"?F("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):B.name,isDefault:N===Z.defaultProfile})),titleFormat:Z.titleFormat,useRegex:Z.moduleSettings.useRegex||!1,regexOptions:W,selectedRegexOutgoing:G,selectedRegexIncoming:J,titleFormats:q0().map((B)=>({value:B,isSelected:B===Z.titleFormat})),showCustomInput:!q0().includes(Z.titleFormat),selectedProfile:{...q,connection:q.useDynamicSTSettings||q?.connection?.api==="current_st"?(()=>{let B=o(),N=Q1();return{api:B.completionSource||"openai",model:N.model||"Not Set",temperature:N.temperature??0.7}})():{api:q.connection?.api||"openai",model:q.connection?.model||"Not Set",temperature:q.connection?.temperature!==void 0?q.connection.temperature:0.7},titleFormat:q.titleFormat||Z.titleFormat,effectivePrompt:q.prompt&&q.prompt.trim()?q.prompt:q.preset?await G0(q.preset):d1()}},j=m0.sanitize(jZ(K)),U=[];U.push({text:"\uD83E\uDDE0 "+F("Create Memory","STMemoryBooks_CreateMemoryButton"),result:null,classes:["menu_button"],action:async()=>{if(!Q){toastr.error(F("No scene selected. Make sure both start and end points are set.","STMemoryBooks_NoSceneSelectedMakeSure"),"STMemoryBooks");return}let B=Z.defaultProfile;if(d&&d.dlg){let N=d.dlg.querySelector("#stmb-profile-select");if(N)B=parseInt(N.value)||Z.defaultProfile,console.log(`STMemoryBooks: Using profile index ${B} (${Z.profiles[B]?.name}) from main popup selection`)}await v6(B)}}),U.push({text:"\uD83C\uDF08 "+F("Consolidate Memories into Arcs","STMemoryBooks_ConsolidateArcsButton"),result:null,classes:["menu_button"],action:async()=>{await h$()}}),U.push({text:"\uD83D\uDDD1️ "+F("Clear Scene","STMemoryBooks_ClearSceneButton"),result:null,classes:["menu_button"],action:()=>{n0(),Z0()}});let O={wide:!0,large:!0,allowVerticalScrolling:!0,customButtons:U,cancelButton:F("Close","STMemoryBooks_Close"),okButton:!1,onClose:P$};try{d=new G1(j,a.TEXT,"",O),v$(),M6(),await d.show()}catch(B){console.error("STMemoryBooks: Error showing settings popup:",B),d=null}}function v$(){if(!d)return;let Z=d.dlg;Z.addEventListener("click",async(Q)=>{let G=_1();if(Q.target&&Q.target.matches("#stmb-configure-regex")){Q.preventDefault();try{await u$()}catch(J){console.warn("STMemoryBooks: showRegexSelectionPopup failed",J)}return}}),Z.addEventListener("change",async(Q)=>{let G=_1();if(Q.target.matches("#stmb-use-regex")){G.moduleSettings.useRegex=Q.target.checked,s();let J=Z.querySelector("#stmb-configure-regex");if(J)J.style.display=Q.target.checked?"":"none";return}if(Q.target.matches("#stmb-regex-outgoing")){try{let J=Array.from(Q.target.selectedOptions||[]).map((W)=>W.value);G.moduleSettings.selectedRegexOutgoing=J,s()}catch(J){console.warn("STMemoryBooks: failed to save selectedRegexOutgoing",J)}return}if(Q.target.matches("#stmb-regex-incoming")){try{let J=Array.from(Q.target.selectedOptions||[]).map((W)=>W.value);G.moduleSettings.selectedRegexIncoming=J,s()}catch(J){console.warn("STMemoryBooks: failed to save selectedRegexIncoming",J)}return}if(Q.target.matches("#stmb-import-file")){try{K5(Q,G,Z0)}catch(J){console.error(`${U1}: Error in import profiles:`,J),toastr.error(F("Failed to import profiles","STMemoryBooks_FailedToImportProfiles"),"STMemoryBooks")}return}if(Q.target.matches("#stmb-allow-scene-overlap")){G.moduleSettings.allowSceneOverlap=Q.target.checked,s();return}if(Q.target.matches("#stmb-unhide-before-memory")){G.moduleSettings.unhideBeforeMemory=Q.target.checked,s();return}if(Q.target.matches("#stmb-manual-mode-enabled")){let J=Q.target.checked;if(J){G.moduleSettings.autoCreateLorebook=!1;let W=document.querySelector("#stmb-auto-create-lorebook");if(W)W.checked=!1}if(J){let W=g0?.[m8],q=g()||{};if(!q.manualLorebook){if(W){let z=`
                            <h4 data-i18n="STMemoryBooks_ManualLorebookSetupTitle">Manual Lorebook Setup</h4>
                            <div class="world_entry_form_control">
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc1" data-i18n-params='{"name": "${W}"}'>You have a chat-bound lorebook "<strong>${W}</strong>".</p>
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc2">Would you like to use it for manual mode or select a different one?</p>
                            </div>
                        `;if(await new G1(z,a.TEXT,"",{okButton:F("Use Chat-bound","STMemoryBooks_UseChatBound"),cancelButton:F("Select Different","STMemoryBooks_SelectDifferent")}).show()===l.AFFIRMATIVE)q.manualLorebook=W,Z1(),toastr.success(x`Manual lorebook set to "${W}"`,"STMemoryBooks");else if(!await T0(W)){Q.target.checked=!1;return}}else if(toastr.info(F("Please select a lorebook for manual mode","STMemoryBooks_PleaseSelectLorebookForManualMode"),"STMemoryBooks"),!await T0()){Q.target.checked=!1;return}}}G.moduleSettings.manualModeEnabled=Q.target.checked,s(),z7(),M6();return}if(Q.target.matches("#stmb-auto-hide-mode")){G.moduleSettings.autoHideMode=Q.target.value,delete G.moduleSettings.autoHideAllMessages,delete G.moduleSettings.autoHideLastMemory,s();return}if(Q.target.matches("#stmb-profile-select")){let J=K1(W1(Q.target),0,profiles.length-1);if(J>=0&&J<G.profiles.length){let W=G.profiles[J],q=Z.querySelector("#stmb-summary-api"),z=Z.querySelector("#stmb-summary-model"),Y=Z.querySelector("#stmb-summary-temp"),V=Z.querySelector("#stmb-summary-title"),X=Z.querySelector("#stmb-summary-prompt");if(W.useDynamicSTSettings||W?.connection?.api==="current_st"){let K=o(),j=Q1();if(q)q.textContent=K.completionSource||"openai";if(z)z.textContent=j.model||F("Not Set","STMemoryBooks_NotSet");if(Y)Y.textContent=Number(j.temperature??0.7)}else{if(q)q.textContent=W.connection?.api||"openai";if(z)z.textContent=W.connection?.model||F("Not Set","STMemoryBooks_NotSet");if(Y)Y.textContent=W.connection?.temperature!==void 0?W.connection.temperature:"0.7"}if(V)V.textContent=W.titleFormat||G.titleFormat;if(X)X.textContent=await B7(W)}return}if(Q.target.matches("#stmb-title-format-select")){let J=Z.querySelector("#stmb-custom-title-format"),W=Z.querySelector("#stmb-summary-title");if(Q.target.value==="custom")J.classList.remove("displayNone"),J.focus();else if(J.classList.add("displayNone"),G.titleFormat=Q.target.value,s(),W)W.textContent=Q.target.value;return}if(Q.target.matches("#stmb-default-memory-count")){let J=K1(W1(Q.target,G.moduleSettings.defaultMemoryCount??0),0,7);G.moduleSettings.defaultMemoryCount=J;return}if(Q.target.matches("#stmb-auto-summary-enabled")){G.moduleSettings.autoSummaryEnabled=Q.target.checked,s();return}if(Q.target.matches("#stmb-auto-create-lorebook")){if(Q.target.checked){G.moduleSettings.manualModeEnabled=!1;let W=document.querySelector("#stmb-manual-mode-enabled");if(W)W.checked=!1}G.moduleSettings.autoCreateLorebook=Q.target.checked,s(),z7(),M6();return}if(Q.target.matches("#stmb-auto-summary-interval")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=10&&J<=200)G.moduleSettings.autoSummaryInterval=J,s();return}if(Q.target.matches("#stmb-auto-summary-buffer")){let J=W1(Q.target);G.moduleSettings.autoSummaryBuffer=K1(J??0,0,50),s();return}}),Z.addEventListener("input",tG.debounce((Q)=>{let G=_1();if(Q.target.matches("#stmb-custom-title-format")){let J=Q.target.value.trim();if(J&&J.includes("000")){G.titleFormat=J,s();let W=Z.querySelector("#stmb-summary-title");if(W)W.textContent=J}return}if(Q.target.matches("#stmb-lorebook-name-template")){let J=Q.target.value.trim();if(J)G.moduleSettings.lorebookNameTemplate=J,s();return}if(Q.target.matches("#stmb-token-warning-threshold")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=1000&&J<=1e5)G.moduleSettings.tokenWarningThreshold=J,s();return}if(Q.target.matches("#stmb-unhidden-entries-count")){let J=parseInt(Q.target.value);if(!isNaN(J)&&J>=0&&J<=50)G.moduleSettings.unhiddenEntriesCount=J,s();return}},1000))}function P$(Z){try{let Q=Z.dlg,G=_1(),J=Q.querySelector("#stmb-always-use-default")?.checked??G.moduleSettings.alwaysUseDefault,W=Q.querySelector("#stmb-show-memory-previews")?.checked??G.moduleSettings.showMemoryPreviews,q=Q.querySelector("#stmb-show-notifications")?.checked??G.moduleSettings.showNotifications,z=Q.querySelector("#stmb-unhide-before-memory")?.checked??G.moduleSettings.unhideBeforeMemory,Y=Q.querySelector("#stmb-refresh-editor")?.checked??G.moduleSettings.refreshEditor,V=Q.querySelector("#stmb-allow-scene-overlap")?.checked??G.moduleSettings.allowSceneOverlap,X=Q.querySelector("#stmb-auto-hide-mode")?.value??h6(G.moduleSettings),K=W1(Q.querySelector("#stmb-token-warning-threshold"),G.moduleSettings.tokenWarningThreshold??50000),j=Number(Q.querySelector("#stmb-default-memory-count").value),U=W1(Q.querySelector("#stmb-unhidden-entries-count"),G.moduleSettings.unhiddenEntriesCount??0),O=Q.querySelector("#stmb-manual-mode-enabled")?.checked??G.moduleSettings.manualModeEnabled,B=Q.querySelector("#stmb-auto-summary-enabled")?.checked??G.moduleSettings.autoSummaryEnabled,N=W1(Q.querySelector("#stmb-auto-summary-interval"),G.moduleSettings.autoSummaryInterval??50),H=K1(W1(Q.querySelector("#stmb-auto-summary-buffer"),G.moduleSettings.autoSummaryBuffer??0),0,50),T=Q.querySelector("#stmb-auto-create-lorebook")?.checked??G.moduleSettings.autoCreateLorebook;if(J!==G.moduleSettings.alwaysUseDefault||W!==G.moduleSettings.showMemoryPreviews||q!==G.moduleSettings.showNotifications||z!==G.moduleSettings.unhideBeforeMemory||Y!==G.moduleSettings.refreshEditor||K!==G.moduleSettings.tokenWarningThreshold||j!==G.moduleSettings.defaultMemoryCount||O!==G.moduleSettings.manualModeEnabled||V!==G.moduleSettings.allowSceneOverlap||X!==h6(G.moduleSettings)||U!==G.moduleSettings.unhiddenEntriesCount||B!==G.moduleSettings.autoSummaryEnabled||N!==G.moduleSettings.autoSummaryInterval||H!==G.moduleSettings.autoSummaryBuffer||T!==G.moduleSettings.autoCreateLorebook)G.moduleSettings.alwaysUseDefault=J,G.moduleSettings.showMemoryPreviews=W,G.moduleSettings.showNotifications=q,G.moduleSettings.unhideBeforeMemory=z,G.moduleSettings.refreshEditor=Y,G.moduleSettings.tokenWarningThreshold=K,G.moduleSettings.defaultMemoryCount=j,G.moduleSettings.manualModeEnabled=O,G.moduleSettings.allowSceneOverlap=V,G.moduleSettings.autoHideMode=X,delete G.moduleSettings.autoHideAllMessages,delete G.moduleSettings.autoHideLastMemory,G.moduleSettings.unhiddenEntriesCount=U,G.moduleSettings.autoSummaryEnabled=B,G.moduleSettings.autoSummaryInterval=N,G.moduleSettings.autoSummaryBuffer=H,G.moduleSettings.autoCreateLorebook=T,s()}catch(Q){console.error("STMemoryBooks: Failed to save settings:",Q),toastr.warning(F("Failed to save settings. Please try again.","STMemoryBooks_FailedToSaveSettings"),"STMemoryBooks")}d=null}async function Z0(){if(!d||!d.dlg.hasAttribute("open"))return;try{let Z=_1(),Q=await D8(),G=Z.profiles[Z.defaultProfile],J=g(),W=Z.moduleSettings.manualModeEnabled,q=g0?.[m8]||null,z=J?.manualLorebook||null,Y={hasScene:!!Q,sceneData:Q,highestMemoryProcessed:J?.highestMemoryProcessed,alwaysUseDefault:Z.moduleSettings.alwaysUseDefault,showMemoryPreviews:Z.moduleSettings.showMemoryPreviews,showNotifications:Z.moduleSettings.showNotifications,unhideBeforeMemory:Z.moduleSettings.unhideBeforeMemory||!1,refreshEditor:Z.moduleSettings.refreshEditor,allowSceneOverlap:Z.moduleSettings.allowSceneOverlap,manualModeEnabled:Z.moduleSettings.manualModeEnabled,lorebookMode:W?"Manual":"Automatic (Chat-bound)",currentLorebookName:W?z:q,manualLorebookName:z,chatBoundLorebookName:q,availableLorebooks:C6??[],autoHideMode:h6(Z.moduleSettings),unhiddenEntriesCount:Z.moduleSettings.unhiddenEntriesCount??0,tokenWarningThreshold:Z.moduleSettings.tokenWarningThreshold??50000,defaultMemoryCount:Z.moduleSettings.defaultMemoryCount??0,autoSummaryEnabled:Z.moduleSettings.autoSummaryEnabled??!1,autoSummaryInterval:Z.moduleSettings.autoSummaryInterval??50,autoSummaryBuffer:Z.moduleSettings.autoSummaryBuffer??0,autoCreateLorebook:Z.moduleSettings.autoCreateLorebook??!1,lorebookNameTemplate:Z.moduleSettings.lorebookNameTemplate||"LTM - {{char}} - {{chat}}",profiles:Z.profiles.map((j,U)=>({...j,name:j?.connection?.api==="current_st"?F("Current SillyTavern Settings","STMemoryBooks_Profile_CurrentST"):j.name,isDefault:U===Z.defaultProfile})),titleFormat:Z.titleFormat,titleFormats:q0().map((j)=>({value:j,isSelected:j===Z.titleFormat})),showCustomInput:!q0().includes(Z.titleFormat),selectedProfile:{...G,connection:G.useDynamicSTSettings||G?.connection?.api==="current_st"?(()=>{let j=o(),U=Q1();return{api:j.completionSource||"openai",model:U.model||"Not Set",temperature:U.temperature??0.7}})():{api:G.connection?.api||"openai",model:G.connection?.model||"gpt-4.1",temperature:G.connection?.temperature??0.7},titleFormat:G.titleFormat||Z.titleFormat,effectivePrompt:G.prompt&&G.prompt.trim()?G.prompt:G.preset?await G0(G.preset):d1()}},V=m0.sanitize(jZ(Y));d.content.innerHTML=V;let X=d.content.querySelector("#stmb-profile-select");if(X)X.value=Z.defaultProfile,X.dispatchEvent(new Event("change"));let K=["wide_dialogue_popup","large_dialogue_popup","vertical_scrolling_dialogue_popup"];d.dlg.classList.add(...K),d.content.style.overflowY="auto",M6()}catch(Z){console.error("STMemoryBooks: Error refreshing popup content:",Z)}}function T7(){let Z=document.querySelectorAll("#chat .mes[mesid]");if(Z.length>0){let Q=0;Z.forEach((G)=>{if(!G.querySelector(".mes_stmb_start"))o8(G),Q++}),l8()}}function x$(){let Z=f0.fromProps({name:"creatememory",callback:z$,helpString:F("Create memory from marked scene","STMemoryBooks_Slash_CreateMemory_Help")}),Q=f0.fromProps({name:"scenememory",callback:X$,helpString:F("Set scene range and create memory (e.g., /scenememory 10-15)","STMemoryBooks_Slash_SceneMemory_Help"),unnamedArgumentList:[I6.fromProps({description:F("Message range (X-Y format)","STMemoryBooks_Slash_SceneMemory_ArgRangeDesc"),typeList:[_6.STRING],isRequired:!0})]}),G=f0.fromProps({name:"nextmemory",callback:V$,helpString:F("Create memory from end of last memory to current message","STMemoryBooks_Slash_NextMemory_Help")}),J=f0.fromProps({name:"sideprompt",callback:K$,helpString:F('Run side prompt. Usage: /sideprompt "Name" [X-Y]',"STMemoryBooks_Slash_SidePrompt_Help"),unnamedArgumentList:[I6.fromProps({description:F("Template name (quote if contains spaces), optionally followed by X-Y range","STMemoryBooks_Slash_SidePrompt_ArgDesc"),typeList:[_6.STRING],isRequired:!0,enumProvider:oZ})]}),W=f0.fromProps({name:"sideprompt-on",callback:U$,helpString:F('Enable a Side Prompt by name or all. Usage: /sideprompt-on "Name" | all',"STMemoryBooks_Slash_SidePromptOn_Help"),unnamedArgumentList:[I6.fromProps({description:F('Template name (quote if contains spaces) or "all"',"STMemoryBooks_Slash_SidePromptOn_ArgDesc"),typeList:[_6.STRING],isRequired:!0,enumProvider:()=>[new nZ("all"),...oZ()]})]}),q=f0.fromProps({name:"sideprompt-off",callback:j$,helpString:F('Disable a Side Prompt by name or all. Usage: /sideprompt-off "Name" | all',"STMemoryBooks_Slash_SidePromptOff_Help"),unnamedArgumentList:[I6.fromProps({description:F('Template name (quote if contains spaces) or "all"',"STMemoryBooks_Slash_SidePromptOff_ArgDesc"),typeList:[_6.STRING],isRequired:!0,enumProvider:()=>[new nZ("all"),...oZ()]})]}),z=f0.fromProps({name:"stmb-highest",callback:Q$,helpString:F("Return the highest message index for processed memories in this chat. Usage: /stmb-highest","STMemoryBooks_Slash_Highest_Help"),returns:"Highest memory processed message index as a string."});y0.addCommandObject(Z),y0.addCommandObject(Q),y0.addCommandObject(G),y0.addCommandObject(J),y0.addCommandObject(W),y0.addCommandObject(q),y0.addCommandObject(z)}function S$(){let Z=$(`
        <div id="stmb-menu-item-container" class="extension_container interactable" tabindex="0">
            <div id="stmb-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-book extensionsMenuExtensionButton"></div>
                <span data-i18n="STMemoryBooks_MenuItem">Memory Books</span>
            </div>
        </div>
        `),Q=$("#extensionsMenu");if(Q.length>0)Q.append(Z),O8(Z[0]);else console.warn("STMemoryBooks: Extensions menu not found - retrying initialization")}function E$(){$(document).on("click",r1.menuItem,M$),e1.on(F0.CHAT_CHANGED,W$),e1.on(F0.MESSAGE_DELETED,(Q)=>{let G=_1();q4(Q,G)}),e1.on(F0.MESSAGE_RECEIVED,q$),e1.on(F0.GROUP_WRAPPER_FINISHED,Y$),e1.on(F0.GENERATION_STARTED,(Q,G,J)=>{Y7=J||!1;try{if(k0)toastr.clear(k0)}catch(W){}k0=null,g8=null,u0=null});let Z=Object.values(r1).filter((Q)=>Q.includes("model_")||Q.includes("temp_")).join(", ");e1.on(F0.GENERATE_AFTER_DATA,(Q)=>{if(Y7)return;if(O1&&w6){let G=w6.effectiveConnection||w6.connection||{},W={openai:"openai",claude:"claude",openrouter:"openrouter",ai21:"ai21",makersuite:"makersuite",google:"makersuite",vertexai:"vertexai",mistralai:"mistralai",custom:"custom",cohere:"cohere",perplexity:"perplexity",groq:"groq",nanogpt:"nanogpt",deepseek:"deepseek",electronhub:"electronhub",aimlapi:"aimlapi",xai:"xai",pollinations:"pollinations",moonshot:"moonshot",fireworks:"fireworks",cometapi:"cometapi",azure_openai:"azure_openai",zai:"zai",siliconflow:"siliconflow"}[G.api]||"openai";if(Q.chat_completion_source=W,Q.include_reasoning=!1,G.model)Q.model=G.model;if(typeof G.temperature==="number")Q.temperature=G.temperature}}),window.addEventListener("beforeunload",J$)}async function b$(Z){if(O1){toastr.warning(F("Memory generation is already in progress.","STMemoryBooks_ManualFix_InProgress"),"STMemoryBooks");return}try{O1=!0;let Q=u0;if(!Q?.compiledScene||!Q?.profileSettings||!Q?.lorebookValidation?.valid){toastr.error(F("Missing failure context; cannot apply corrected JSON.","STMemoryBooks_ManualFix_NoContext"),"STMemoryBooks");return}if(!Q?.sceneData||Q.sceneData.sceneEnd===void 0||Q.sceneData.sceneStart===void 0){toastr.error(F("Missing scene range; cannot apply corrected JSON.","STMemoryBooks_ManualFix_NoSceneRange"),"STMemoryBooks");return}let G=String(Z||"").trim();if(!G){toastr.error(F("Corrected JSON is empty.","STMemoryBooks_ManualFix_EmptyJson"),"STMemoryBooks");return}let J;try{J=$Z(G)}catch(B){let N=B?.message||"Failed to parse corrected JSON.",H=B?.code?` [${B.code}]`:"";toastr.error(x`Corrected JSON is still invalid${H}: ${N}`,"STMemoryBooks");return}if(!J.content&&!J.summary&&!J.memory_content){toastr.error(F("Corrected JSON is missing content.","STMemoryBooks_ManualFix_MissingContent"),"STMemoryBooks");return}if(!J.title){toastr.error(F("Corrected JSON is missing title.","STMemoryBooks_ManualFix_MissingTitle"),"STMemoryBooks");return}if(!Array.isArray(J.keywords)){toastr.error(F("Corrected JSON is missing keywords array.","STMemoryBooks_ManualFix_MissingKeywords"),"STMemoryBooks");return}let{compiledScene:W,profileSettings:q}=Q,z=(J.content||J.summary||J.memory_content||"").trim(),Y=(J.title||"Memory").trim(),V=Array.isArray(J.keywords)?J.keywords.filter((B)=>B&&typeof B==="string"&&B.trim()!==""):[],X=Q.sceneStats||null,K=Q.sceneRange||`${W.metadata.sceneStart}-${W.metadata.sceneEnd}`,j={content:z,extractedTitle:Y,metadata:{sceneRange:K,messageCount:W.metadata?.messageCount,characterName:W.metadata?.characterName,userName:W.metadata?.userName,chatId:W.metadata?.chatId,createdAt:new Date().toISOString(),profileUsed:q.name,presetUsed:q.preset||"custom",tokenUsage:X?{estimatedTokens:X.estimatedTokens}:void 0,generationMethod:"manual-json-repair",version:"2.0"},suggestedKeys:V,titleFormat:q.useDynamicSTSettings||q?.connection?.api==="current_st"?i.STMemoryBooks?.titleFormat||"[000] - {{title}}":q.titleFormat||"[000] - {{title}}",lorebookSettings:{constVectMode:q.constVectMode,position:q.position,orderMode:q.orderMode,orderValue:q.orderValue,preventRecursion:q.preventRecursion,delayUntilRecursion:q.delayUntilRecursion,outletName:Number(q.position)===7?q.outletName||"":void 0},lorebook:{content:z,comment:`Auto-generated memory from messages ${K}. Profile: ${q.name}.`,key:V||[],keysecondary:[],selective:!0,constant:!1,order:100,position:"before_char",disable:!1,addMemo:!0,excludeRecursion:!1,delayUntilRecursion:!0,probability:100,useProbability:!1}},U=await YZ(j,Q.lorebookValidation);if(!U.success)throw Error(U.error||"Failed to add memory to lorebook");try{let B=q.effectiveConnection||q.connection||{};console.debug("STMemoryBooks: Passing profile to runAfterMemory",{api:B.api,model:B.model,temperature:B.temperature}),await EZ(W,q)}catch(B){console.warn("STMemoryBooks: runAfterMemory failed:",B)}try{let B=g()||{};B.highestMemoryProcessed=Q.sceneData.sceneEnd,Z1()}catch(B){console.warn("STMemoryBooks: Failed to update highestMemoryProcessed baseline:",B)}VZ();let O=Q.memoryFetchResult?.actualCount>0?` (with ${Q.memoryFetchResult.actualCount} context ${Q.memoryFetchResult.actualCount===1?"memory":"memories"})`:"";toastr.clear(),k0=null,g8=null,u0=null,toastr.success(x`Memory "${U.entryTitle}" created successfully${O}!`,"STMemoryBooks")}catch(Q){console.error("STMemoryBooks: Manual JSON repair failed:",Q),toastr.error(x`Failed to create memory from corrected JSON: ${Q.message}`,"STMemoryBooks")}finally{O1=!1}}async function y$(Z){if(lZ){toastr.warning(F("Arc consolidation is already in progress.","STMemoryBooks_ArcManualFix_InProgress"),"STMemoryBooks");return}try{lZ=!0;let Q=H8;if(!Q?.lorebookName||!Q?.lorebookData||!Array.isArray(Q?.selectedEntries)||!Q?.options){toastr.error(F("Missing failure context; cannot apply corrected Arc JSON.","STMemoryBooks_ArcManualFix_NoContext"),"STMemoryBooks");return}let G=String(Z||"").trim();if(!G){toastr.error(F("Corrected JSON is empty.","STMemoryBooks_ArcManualFix_EmptyJson"),"STMemoryBooks");return}let J;try{J=D6(G)}catch(H){let T=H?.message||"Failed to parse corrected Arc JSON.",R=H?.code?` [${H.code}]`:"";toastr.error(x`Corrected Arc JSON is still invalid${R}: ${T}`,"STMemoryBooks");return}let W=Array.isArray(J?.arcs)?J.arcs:[];if(W.length===0){toastr.error(F("Corrected JSON is missing arcs.","STMemoryBooks_ArcManualFix_MissingArcs"),"STMemoryBooks");return}let q=W.some((H)=>Array.isArray(H?.member_ids)&&H.member_ids.length>0);if(W.length>1&&!q){toastr.error(F("Multiple arcs require member_ids to avoid ambiguous assignment. Add member_ids or reduce to one arc.","STMemoryBooks_ArcManualFix_MultiArcNeedsMemberIds"),"STMemoryBooks");return}let Y=Q.selectedEntries.map((H)=>String(H?.uid)).filter(Boolean),V=new Map;Y.forEach((H,T)=>{V.set(H,H);let R=String(T+1).padStart(3,"0");V.set(R,H),V.set(String(T+1),H)});let X=(H)=>V.get(String(H).trim()),K=new Set;(Array.isArray(J?.unassigned_memories)?J.unassigned_memories:[]).forEach((H)=>{let T=X(H?.id);if(T)K.add(T)});let U=Y.filter((H)=>!K.has(H)),O=W.map((H)=>{let T=String(H?.title||"").trim(),R=String(H?.summary||"").trim(),w=Array.isArray(H?.keywords)?H.keywords:[];w=w.filter((y)=>typeof y==="string"&&y.trim()).map((y)=>y.trim());let v=null;if(Array.isArray(H?.member_ids))v=H.member_ids.map(X).filter((y)=>y!==void 0);if(!v||v.length===0)v=U;return v=Array.from(new Set(v)).filter(Boolean),{title:T,summary:R,keywords:w,memberIds:v}}),B=await dZ({lorebookName:Q.lorebookName,lorebookData:Q.lorebookData,arcCandidates:O,disableOriginals:!!Q.disableOriginals}),N=Array.isArray(B?.results)?B.results.length:O.length;toastr.success(x`Created ${N} arc${N===1?"":"s"} from corrected JSON.`,"STMemoryBooks"),L6=null,H8=null;try{toastr.clear(B8)}catch(H){}B8=null}catch(Q){console.error("STMemoryBooks: applyManualFixedArcJson failed:",Q),toastr.error(x`Failed to apply corrected Arc JSON: ${Q.message}`,"STMemoryBooks")}finally{lZ=!1}}function f$(Z){try{let Q=(K)=>E(String(K??"")),G=Q(Z?.message||F("Unknown error","STMemoryBooks_UnknownError")),J=Q(Z?.code||""),W=String(Z?.retryRawText||Z?.rawText||"").trim(),q=String(Z?.rawText||"").trim(),z=!!H8?.lorebookName&&!!H8?.lorebookData,Y="";if(Y+=`<h3>${Q(F("Review Failed Arc Response","STMemoryBooks_ReviewFailedArc_Title"))}</h3>`,Y+=`<div><strong>${Q(F("Error","STMemoryBooks_ReviewFailedArc_ErrorLabel"))}:</strong> ${G}</div>`,J)Y+=`<div><strong>${Q(F("Code","STMemoryBooks_ReviewFailedArc_CodeLabel"))}:</strong> ${J}</div>`;if(W){if(Y+='<div class="world_entry_form_control">',Y+=`<h4>${Q(F("Raw AI Response","STMemoryBooks_ReviewFailedArc_RawLabel"))}</h4>`,Y+=`<textarea id="stmb-arc-corrected-raw" class="text_pole" style="width: 100%; min-height: 220px; max-height: 360px; white-space: pre; overflow:auto;">${E(W)}</textarea>`,Y+='<div class="buttons_block gap10px">',Y+=`<button id="stmb-arc-copy-raw" class="menu_button">${Q(F("Copy Raw","STMemoryBooks_ReviewFailedArc_CopyRaw"))}</button>`,Y+=`<button id="stmb-arc-apply-corrected-raw" class="menu_button" ${z?"":"disabled"}>${Q(F("Create Arcs from corrected JSON","STMemoryBooks_ReviewFailedArc_CreateArcs"))}</button>`,Y+="</div>",!z)Y+=`<div class="opacity70p">${Q(F("Unable to apply corrected JSON because the original consolidation context is missing.","STMemoryBooks_ReviewFailedArc_NoContext"))}</div>`;if(q&&q!==W)Y+=`<details class="world_entry_form_control"><summary class="opacity70p">${Q(F("Show original (pre-retry) response","STMemoryBooks_ReviewFailedArc_ShowOriginal"))}</summary>`,Y+=`<textarea class="text_pole" style="width: 100%; min-height: 160px; max-height: 260px; white-space: pre; overflow:auto;">${E(q)}</textarea>`,Y+="</details>";Y+="</div>"}else Y+=`<div class="world_entry_form_control opacity70p">${Q(F("No raw response was captured.","STMemoryBooks_ReviewFailedArc_NoRaw"))}</div>`;let V=new G1(m0.sanitize(Y),a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:F("Close","STMemoryBooks_Close")}),X=V.dlg;X.querySelector("#stmb-arc-copy-raw")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(W||q),toastr.success(F("Copied raw response","STMemoryBooks_CopiedRaw"),"STMemoryBooks")}catch(K){toastr.error(F("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),X.querySelector("#stmb-arc-apply-corrected-raw")?.addEventListener("click",async()=>{let K=X.querySelector("#stmb-arc-corrected-raw")?.value??W??q;y$(K)}),V.show()}catch(Q){console.error("STMemoryBooks: Failed to show failed Arc response popup:",Q)}}function k$(Z){try{let Q=(K)=>E(String(K||"")),G=Z?.code?Q(Z.code):"",J=Q(Z?.message||"Unknown error"),W=typeof Z?.rawResponse==="string"?Z.rawResponse:"",q=typeof Z?.providerBody==="string"?Z.providerBody:"",z=!!W&&!!u0?.compiledScene&&!!u0?.lorebookValidation?.valid,Y="";if(Y+=`<h3>${Q(F("Review Failed AI Response","STMemoryBooks_ReviewFailedAI_Title"))}</h3>`,Y+='<div class="world_entry_form_control">',Y+=`<div><strong>${Q(F("Error","STMemoryBooks_ReviewFailedAI_ErrorLabel"))}:</strong> ${J}</div>`,G)Y+=`<div><strong>${Q(F("Code","STMemoryBooks_ReviewFailedAI_CodeLabel"))}:</strong> ${G}</div>`;if(Y+="</div>",W){if(Y+='<div class="world_entry_form_control">',Y+=`<h4>${Q(F("Raw AI Response","STMemoryBooks_ReviewFailedAI_RawLabel"))}</h4>`,Y+=`<textarea id="stmb-corrected-raw" class="text_pole" style="width: 100%; min-height: 220px; max-height: 360px; white-space: pre; overflow:auto;">${E(W)}</textarea>`,Y+='<div class="buttons_block gap10px">',Y+=`<button id="stmb-copy-raw" class="menu_button">${Q(F("Copy Raw","STMemoryBooks_ReviewFailedAI_CopyRaw"))}</button>`,Y+=`<button id="stmb-apply-corrected-raw" class="menu_button" ${z?"":"disabled"}>${Q(F("Create Memory from corrected JSON","STMemoryBooks_ReviewFailedAI_CreateMemory"))}</button>`,Y+="</div>",!z)Y+=`<div class="opacity70p">${Q(F("Unable to apply corrected JSON because the original generation context is missing.","STMemoryBooks_ReviewFailedAI_NoContext"))}</div>`;Y+="</div>"}else Y+=`<div class="world_entry_form_control opacity70p">${Q(F("No raw response was captured.","STMemoryBooks_ReviewFailedAI_NoRaw"))}</div>`;if(q)Y+='<div class="world_entry_form_control">',Y+=`<h4>${Q(F("Provider Error Body","STMemoryBooks_ReviewFailedAI_ProviderBody"))}</h4>`,Y+=`<pre class="text_pole" style="white-space: pre-wrap; max-height: 200px; overflow:auto;"><code>${E(q)}</code></pre>`,Y+=`<div class="buttons_block gap10px"><button id="stmb-copy-provider" class="menu_button">${Q(F("Copy Provider Body","STMemoryBooks_ReviewFailedAI_CopyProvider"))}</button></div>`,Y+="</div>";let V=new G1(m0.sanitize(Y),a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:!1,cancelButton:F("Close","STMemoryBooks_Close")}),X=V.dlg;X.querySelector("#stmb-copy-raw")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(W),toastr.success(F("Copied raw response","STMemoryBooks_CopiedRaw"),"STMemoryBooks")}catch(K){toastr.error(F("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),X.querySelector("#stmb-apply-corrected-raw")?.addEventListener("click",async()=>{let K=X.querySelector("#stmb-corrected-raw")?.value??W;b$(K)}),X.querySelector("#stmb-copy-provider")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(q),toastr.success(F("Copied provider body","STMemoryBooks_CopiedProvider"),"STMemoryBooks")}catch(K){toastr.error(F("Copy failed","STMemoryBooks_CopyFailed"),"STMemoryBooks")}}),V.show()}catch(Q){console.error("STMemoryBooks: Failed to show failed AI response popup:",Q)}}async function U7(){if(q7)return;q7=!0,console.log("STMemoryBooks: Initializing");try{let W=Z$?.()||"en";try{let q=await W7(W);if(q)iZ(W,q)}catch(q){console.warn("STMemoryBooks: Failed to load JSON locale bundle:",q)}if(b0&&typeof b0==="object"){if(b0[W])iZ(W,b0[W]);if(W!=="en"&&b0.en)iZ(W,Object.fromEntries(Object.entries(b0.en).filter(([q])=>!0)))}}catch(W){console.warn("STMemoryBooks: Failed to merge plugin locales:",W)}let Z=0,Q=20;while(Z<Q){if($(r1.extensionsMenu).length>0&&e1&&typeof G1<"u")break;await new Promise((W)=>setTimeout(W,500)),Z++}S$();try{O8()}catch(W){}let G=_1(),J=UZ(G);if(!J.valid){if(console.warn("STMemoryBooks: Profile validation issues found:",J.issues),J.fixes.length>0)s()}n8(),O7();try{$$()}catch(W){console.error("STMemoryBooks: Failed to initialize chat observer:",W),toastr.error(F("STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.","STMemoryBooks_FailedToInitializeChatMonitoring"),"STMemoryBooks");return}E$(),await rZ(),x$();try{T7(),console.log("STMemoryBooks: Processed existing messages during initialization")}catch(W){console.error("STMemoryBooks: Error processing existing messages during init:",W)}eG.registerHelper("eq",function(W,q){return W===q}),console.log("STMemoryBooks: Extension loaded successfully")}function g$(){let Z=[];try{(F7({allowedOnly:!1})||[]).forEach((G,J)=>{let W=`idx:${J}`,q=`${G?.scriptName||"Untitled"}${G?.disabled?" (disabled)":""}`;Z.push({key:W,label:q})})}catch(Q){console.warn("STMemoryBooks: buildFlatRegexOptions failed",Q)}return Z}async function u$(){let Z=_1(),Q=g$(),G=Array.isArray(Z.moduleSettings.selectedRegexOutgoing)?Z.moduleSettings.selectedRegexOutgoing:[],J=Array.isArray(Z.moduleSettings.selectedRegexIncoming)?Z.moduleSettings.selectedRegexIncoming:[],W="";W+='<h3 data-i18n="STMemoryBooks_RegexSelection_Title">\uD83D\uDCD0 Regex selection</h3>',W+='<div class="world_entry_form_control"><small class="opacity70p" data-i18n="STMemoryBooks_RegexSelection_Desc">Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.</small></div>',W+='<div class="world_entry_form_control">',W+='<h4 data-i18n="STMemoryBooks_RegexSelection_Outgoing">Run regex before sending to AI</h4>',W+='<select id="stmb-regex-outgoing" multiple style="width:100%">';for(let Y of Q){let V=G.includes(Y.key)?" selected":"";W+=`<option value="${E(Y.key)}"${V}>${E(Y.label)}</option>`}W+="</select>",W+="</div>",W+='<div class="world_entry_form_control">',W+='<h4 data-i18n="STMemoryBooks_RegexSelection_Incoming">Run regex before adding to lorebook (before previews)</h4>',W+='<select id="stmb-regex-incoming" multiple style="width:100%">';for(let Y of Q){let V=J.includes(Y.key)?" selected":"";W+=`<option value="${E(Y.key)}"${V}>${E(Y.label)}</option>`}W+="</select>",W+="</div>";let q=new G1(W,a.TEXT,"",{wide:!0,large:!0,allowVerticalScrolling:!0,okButton:F("Save","STMemoryBooks_Save"),cancelButton:F("Close","STMemoryBooks_Close")});try{O8(q.dlg)}catch(Y){}if(setTimeout(()=>{try{if(window.jQuery&&typeof window.jQuery.fn.select2==="function"){let Y=window.jQuery(q.dlg);window.jQuery("#stmb-regex-outgoing").select2({width:"100%",placeholder:F("Select outgoing regex…","STMemoryBooks_RegexSelect_PlaceholderOutgoing"),closeOnSelect:!1,dropdownParent:Y}),window.jQuery("#stmb-regex-incoming").select2({width:"100%",placeholder:F("Select incoming regex…","STMemoryBooks_RegexSelect_PlaceholderIncoming"),closeOnSelect:!1,dropdownParent:Y})}}catch(Y){console.warn("STMemoryBooks: Select2 initialization failed (using native selects)",Y)}},0),await q.show()===l.AFFIRMATIVE)try{let Y=Array.from(q.dlg?.querySelector("#stmb-regex-outgoing")?.selectedOptions||[]).map((X)=>X.value),V=Array.from(q.dlg?.querySelector("#stmb-regex-incoming")?.selectedOptions||[]).map((X)=>X.value);Z.moduleSettings.selectedRegexOutgoing=Y,Z.moduleSettings.selectedRegexIncoming=V,s(),toastr.success(F("Regex selections saved","STMemoryBooks_RegexSelectionsSaved"),"STMemoryBooks")}catch(Y){console.warn("STMemoryBooks: Failed to save regex selections",Y),toastr.error(F("Failed to save regex selections","STMemoryBooks_FailedToSaveRegexSelections"),"STMemoryBooks")}}$(document).ready(()=>{if(e1&&F0.APP_READY)e1.on(F0.APP_READY,U7);setTimeout(U7,2000)});export{aZ as validateLorebook,$5 as isMemoryProcessing,w6 as currentProfile};

//# debugId=3F95218FE2D0A2A964756E2164756E21
