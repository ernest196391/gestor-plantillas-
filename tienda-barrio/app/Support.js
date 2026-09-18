"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {money} from "../lib/commerce.mjs";
import {tenant} from "../lib/tenant";
const AI=tenant.assistant;

function Glyph({name}){
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name==="whatsapp"?<><path d="M12 2a10 10 0 0 0-8.7 15L2 22l5-1.3A10 10 0 1 0 12 2Z"/><path d="M8 7c-2 4 3 9 7 9l2-2-3-2-1 1-3-3 1-1-2-3Z"/></>:
    name==="mic"?<><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></>:
    name==="camera"?<><path d="M3 7h5l2-3h4l2 3h5v14H3Z"/><circle cx="12" cy="13" r="3"/></>:
    name==="attach"?<path d="m20 11-8 8a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-2-2l8-8"/>:
    name==="search"?<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>:
    name==="cart"?<><path d="M3 3h2l3 12h11l2-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>:
    name==="truck"?<><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>:
    name==="shop"?<><path d="M4 10v10h16V10M3 10l2-5h14l2 5M8 20v-6h8v6"/></>:
    <path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>}
  </svg>
}

function cleanSpeech(value=""){
  let words=value.replace(/\s+/g," ").trim().split(" ").filter(Boolean);
  let changed=true;
  while(changed){
    changed=false;
    const max=Math.min(8,Math.floor(words.length/2));
    for(let size=max;size>=1&&!changed;size--){
      for(let i=0;i+size*2<=words.length;i++){
        const a=words.slice(i,i+size).join(" ").toLocaleLowerCase("es");
        const b=words.slice(i+size,i+size*2).join(" ").toLocaleLowerCase("es");
        if(a===b){words.splice(i+size,size);changed=true;break}
      }
    }
  }
  return words.join(" ");
}

function mergeSpeech(left="",right=""){
  const a=cleanSpeech(left).split(" ").filter(Boolean),b=cleanSpeech(right).split(" ").filter(Boolean);
  if(!a.length)return b.join(" ");
  if(!b.length)return a.join(" ");
  let overlap=0;
  for(let n=Math.min(a.length,b.length,12);n>0;n--){
    const tail=a.slice(-n).join(" ").toLocaleLowerCase("es");
    const head=b.slice(0,n).join(" ").toLocaleLowerCase("es");
    if(tail===head){overlap=n;break}
  }
  return cleanSpeech([...a,...b.slice(overlap)].join(" "));
}

export default function Support({onAdd,onSet,onClear,cart={}}){
  const [config,setConfig]=useState(null),[open,setOpen]=useState(false),[q,setQ]=useState(""),[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[messages,setMessages]=useState([]),[recording,setRecording]=useState(false),[voiceStatus,setVoiceStatus]=useState(""),[cameraOpen,setCameraOpen]=useState(false),[stream,setStream]=useState(null),[nudge,setNudge]=useState(false),[avatarFailed,setAvatarFailed]=useState(false),[confirmClear,setConfirmClear]=useState(false);
  const launcher=useRef(null),panel=useRef(null),end=useRef(null),recognition=useRef(null),videoRef=useRef(null);
  const dictationBase=useRef(""),committedSpeech=useRef(""),sessionSpeech=useRef(""),listenWanted=useRef(false),voiceSending=useRef(false);

  useEffect(()=>{fetch("/api/commerce/config").then(r=>r.json()).then(setConfig).catch(()=>setError("No pudimos cargar la configuración."))},[]);
  useEffect(()=>{const t=setTimeout(()=>setNudge(true),900),h=setTimeout(()=>setNudge(false),9000);const dismiss=()=>setNudge(false);window.addEventListener("scroll",dismiss,{passive:true});return()=>{clearTimeout(t);clearTimeout(h);window.removeEventListener("scroll",dismiss)}},[]);
  useEffect(()=>()=>{listenWanted.current=false;recognition.current?.abort();stream?.getTracks().forEach(t=>t.stop())},[stream]);
  useEffect(()=>{if(open)panel.current?.focus();else launcher.current?.focus()},[open]);
  useEffect(()=>{end.current?.scrollIntoView({block:"nearest"})},[messages,busy]);
  useEffect(()=>{if(cameraOpen&&videoRef.current&&stream)videoRef.current.srcObject=stream},[cameraOpen,stream]);
  const previews=useMemo(()=>files.map(f=>f.type?.startsWith("image/")?URL.createObjectURL(f):null),[files]);
  useEffect(()=>()=>previews.forEach(u=>u&&URL.revokeObjectURL(u)),[previews]);
  const cartCount=useMemo(()=>Object.values(cart||{}).reduce((a,b)=>a+b,0),[cart]);

  function currentSpeech(){
    return cleanSpeech([dictationBase.current,committedSpeech.current,sessionSpeech.current].filter(Boolean).join(" "));
  }
  function stopCamera(){stream?.getTracks().forEach(t=>t.stop());setStream(null);setCameraOpen(false)}
  function close(){listenWanted.current=false;recognition.current?.abort();recognition.current=null;setRecording(false);setVoiceStatus("");stopCamera();setOpen(false)}
  function openPanel(){setNudge(false);setError("");setOpen(true)}
  function keys(e){if(e.key==="Escape")close();if(e.key==="Tab"){const list=[...panel.current.querySelectorAll('button:not(:disabled),a[href],textarea:not(:disabled),input:not(:disabled)')].filter(x=>x.getClientRects().length);if(!list.length)return;const first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
  function addFiles(list){const incoming=Array.from(list||[]),next=[...files,...incoming];if(next.length>3||next.reduce((s,f)=>s+f.size,0)>3000000){setError("Hasta 3 archivos y 3 MB en total.");return}setFiles(next);setError("")}
  async function openCamera(){setError("");try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});setStream(s);setCameraOpen(true)}catch{setError("No pudimos abrir la cámara. Revisa el permiso o usa Adjuntar.")}}
  function takePhoto(){const v=videoRef.current;if(!v?.videoWidth)return setError("La cámara aún no está lista.");const c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);c.toBlob(blob=>{if(blob){addFiles([new File([blob],"foto-veci.jpg",{type:"image/jpeg"})]);stopCamera()}},"image/jpeg",.9)}

  async function ask(text,attachments=files){
    const question=cleanSpeech((text??q).trim());if(busy||(!question&&!attachments.length))return;
    setBusy(true);setVoiceStatus("");setError("");
    const form=new FormData();form.set("question",question);form.set("history",JSON.stringify(messages.slice(-10).map(x=>({role:x.role,text:x.text}))));attachments.forEach(f=>form.append("attachments",f));
    const localAttachments=attachments.map(f=>({name:f.name,url:f.type?.startsWith("image/")?URL.createObjectURL(f):null}));
    setMessages(m=>[...m,{role:"user",text:question||"Consulta con foto",attachments:localAttachments}]);
    try{
      const r=await fetch("/api/assistant/chat",{method:"POST",body:form,signal:AbortSignal.timeout(55000)});
      let data={};try{data=await r.json()}catch{}
      if(!r.ok)throw Error(data.error||AI.name+" no pudo responder ahora.");
      if(data.action==="add"&&Array.isArray(data.products)&&data.products.length){const nuevos=data.products.filter(p=>!cart[p.id]);nuevos.forEach(p=>onAdd(p.id));data.answer=(data.answer||"")+(nuevos.length===0?" Ya los tenías en el carrito, no he vuelto a sumarlos.":nuevos.length===1?" Ya lo añadí al carrito.":` Ya añadí ${nuevos.length} al carrito.`)}
      setMessages(m=>[...m,{role:"assistant",text:data.answer,products:data.products,contact:data.contact,checkout:data.checkout}]);setQ("");setFiles([]);
    }catch(e){setError(e.name==="TimeoutError"?"La consulta tardó demasiado. Puedes reintentar.":e.message)}
    finally{setBusy(false)}
  }

  function startRecognizer(){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R){setError("Este navegador no admite dictado. Puedes escribir tu consulta.");listenWanted.current=false;setRecording(false);return}
    const r=new R();recognition.current=r;r.lang="es-ES";r.interimResults=true;r.continuous=true;
    r.onresult=e=>{
      const chunks=[];
      for(let i=0;i<e.results.length;i++){const t=e.results[i][0]?.transcript?.trim();if(t)chunks.push(t)}
      let session="";
      for(const chunk of chunks)session=mergeSpeech(session,chunk);
      sessionSpeech.current=cleanSpeech(session);
      setQ(currentSpeech());
    };
    r.onerror=e=>{
      if(!["aborted","no-speech"].includes(e.error))setError("No pudimos usar el micrófono. Revisa el permiso del navegador.");
      if(e.error==="not-allowed"||e.error==="service-not-allowed"){listenWanted.current=false;setRecording(false);setVoiceStatus("")}
    };
    r.onend=()=>{
      recognition.current=null;
      committedSpeech.current=mergeSpeech(committedSpeech.current,sessionSpeech.current);
      sessionSpeech.current="";
      const text=currentSpeech();setQ(text);
      if(listenWanted.current){
        setVoiceStatus("Escuchando…");
        setTimeout(()=>{if(listenWanted.current)startRecognizer()},180);
      }else{
        setRecording(false);
        if(!voiceSending.current)setVoiceStatus(text?"Dictado listo. Revisa el texto y toca enviar.":"");
      }
    };
    try{r.start();setRecording(true)}catch{listenWanted.current=false;setRecording(false);setError("El micrófono no está disponible.");setVoiceStatus("")}
  }

  function dictate(){
    if(recording||listenWanted.current){
      listenWanted.current=false;voiceSending.current=false;
      const text=currentSpeech();setQ(text);setRecording(false);setVoiceStatus(text?"Dictado listo. Revisa el texto y toca enviar.":"");
      recognition.current?.stop();return;
    }
    setError("");voiceSending.current=false;dictationBase.current=cleanSpeech(q);committedSpeech.current="";sessionSpeech.current="";listenWanted.current=true;setVoiceStatus("Escuchando…");startRecognizer();
  }

  function send(e){
    e.preventDefault();
    const text=cleanSpeech(recording||listenWanted.current?currentSpeech():q);
    if(recording||listenWanted.current){
      listenWanted.current=false;voiceSending.current=true;setRecording(false);setVoiceStatus("Transcribiendo…");setQ(text);
      const r=recognition.current;if(r){r.onend=null;try{r.abort()}catch{}recognition.current=null}
      if(text)setTimeout(()=>ask(text,[]),80);else{voiceSending.current=false;setVoiceStatus("")}
      return;
    }
    setQ(text);ask(text);
  }

  const avatar=AI.avatar||"/brand/assistant-avatar.png";
  const avatarNode=(cls="")=>avatarFailed?<span className={(cls?cls+" ":"")+"veciAvatarFallback"} aria-label={AI.name}>{AI.name.slice(0,1)}</span>:<img className={cls} src={avatar} alt={AI.name} onError={()=>setAvatarFailed(true)}/>;
  const quick=[["search","Buscar productos","Encuentra lo que necesitas","Quiero buscar productos del catálogo."],["cart","Armar compra","Te ayudo paso a paso","Ayúdame a armar una compra. Pregúntame primero para qué la necesito y mi presupuesto."],["truck","Envío","Consulta zonas y precios","Quiero saber el costo de mensajería. Pregúntame municipio y localidad si hace falta."],["shop","Recoger en tienda","Compra online y recoge","Explícame cómo funciona recoger mi compra en "+tenant.name+"."]];

  return <div className="veciV2"><div className="supportDock">{nudge&&!open&&<button className="veciNudge" onClick={openPanel}><span className="veciNudgeText">{AI.nudge}</span><span className="veciNudgeWave" aria-hidden="true">👋</span></button>}<button ref={launcher} className="bessyLaunch" aria-label={"Abrir "+AI.name} onClick={openPanel}>{avatarNode()}</button>{config?.whatsapp&&<a className="waLaunch" href={config.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Glyph name="whatsapp"/></a>}</div>
  {open&&<div className="bessyBackdrop" onClick={close}><section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={AI.name} className="bessyPanel" onClick={e=>e.stopPropagation()} onKeyDown={keys}>
    <div className="bessyBrandBar"><div><strong>{tenant.name}</strong><span> · {tenant.tagline}</span></div><button className="bessyClose" onClick={close}>×</button></div>
    <div className="bessyIdentity"><div className="bessyAvatar">{avatarNode()}</div><div><b>{AI.name}</b><small className="bessyOnline">● En línea</small><small>{AI.role}</small></div></div>
    <div className="bessyMessages" aria-live="polite"><p><b>{AI.greeting}</b><br/>{AI.greetingSub}</p><p>{AI.intro}</p>
      {cartCount>0&&<div className="bessyCartStrip"><span>🛒 {cartCount} {cartCount===1?"producto":"productos"} en tu carrito</span>{confirmClear?<span className="bessyClearAsk">¿Vaciar todo?<button className="cancelOrder" onClick={()=>{onClear?.();setConfirmClear(false)}}>Sí, vaciar</button><button onClick={()=>setConfirmClear(false)}>No</button></span>:<><a href="/checkout">Revisar pedido →</a><button className="bessyClearBtn" onClick={()=>setConfirmClear(true)}>Vaciar</button></>}</div>}
      {messages.map((m,i)=><article key={i} className={m.role}><p>{m.text}</p>{m.attachments?.some(a=>a.url)&&<div className="bessyMessageMedia">{m.attachments.filter(a=>a.url).map((a,n)=><img key={n} src={a.url} alt="Foto enviada"/>)}</div>}{m.products?.length>0&&<><div className="bessyProductGrid">{m.products.map(p=>{const inCart=cart[p.id]||0;return <div className="bessyProduct" key={p.id}><div className="bessyProductImage"><img src={p.img} alt={p.n}/></div><div className="bessyProductInfo"><b>{p.n}</b><span>{p.d}</span><strong>{money(p.p)}</strong>{inCart?<div className="bessyQty"><button aria-label={"Quitar una unidad de "+p.n} onClick={()=>onSet?.(p.id,inCart-1)}>−</button><span>{inCart} en carrito</span><button aria-label={"Añadir otra unidad de "+p.n} onClick={()=>onAdd(p.id)}>＋</button></div>:<button onClick={()=>onAdd(p.id)}>Añadir al carrito</button>}</div></div>})}</div>{(()=>{const faltan=m.products.filter(p=>!cart[p.id]);return m.products.length>1&&faltan.length>1&&<button className="bessyMultiAdd" onClick={()=>faltan.forEach(p=>onAdd(p.id))}>＋ Añadir {faltan.length===m.products.length?`los ${faltan.length} productos`:`los ${faltan.length} que faltan`}</button>})()}</>}{m.checkout?.url&&<a className="bessyCheckoutBtn" href={m.checkout.url}>Ir al checkout <span aria-hidden="true">→</span></a>}{m.contact?.url&&<a className="bessyContactBtn" href={m.contact.url} target="_blank" rel="noopener noreferrer"><Glyph name="whatsapp"/> Escribir por WhatsApp</a>}</article>)}
      {busy&&<p className="bessyTyping" role="status">{AI.name} está buscando…</p>}<div ref={end}/></div>
    {messages.length===0&&<div className="bessyQuick">{quick.map(([icon,title,sub,prompt])=><button key={title} type="button" onClick={()=>ask(prompt,[])}><Glyph name={icon}/><span>{title}<small>{sub}</small></span></button>)}{config?.whatsapp&&<a className="whatsappAction" href={config.whatsapp} target="_blank" rel="noopener noreferrer"><Glyph name="whatsapp"/> Confirmar por WhatsApp<small>Continúa tu compra con una persona</small></a>}</div>}
    {error&&<p className="bessyError" role="alert">{error}</p>}
    <span className="sr-only" role="status" aria-live="polite">{recording?"Escuchando. El texto aparece en el campo de mensaje. Solo la flecha envía.":voiceStatus}</span>
    <form className="bessyComposer" onSubmit={send}><label htmlFor="bessy-q">Tu consulta</label><textarea id="bessy-q" maxLength={1000} value={q} onChange={e=>setQ(e.target.value)} placeholder={recording?"Escuchando…":"Escribe tu mensaje..."}/>{files.length>0&&<div className="bessyFiles">{files.map((f,i)=><div className="bessyFilePreview" key={i}>{previews[i]?<img src={previews[i]} alt="Vista previa"/>:<span>{f.name}</span>}<button type="button" onClick={()=>setFiles(v=>v.filter((_,n)=>n!==i))}>×</button></div>)}</div>}<div className="bessyTools"><label className="fileControl"><Glyph name="attach"/><input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.txt" onChange={e=>{addFiles(e.target.files);e.target.value=""}}/></label><button className="cameraControl" type="button" onClick={openCamera}><Glyph name="camera"/></button><button className={recording?"micControl recording":"micControl"} type="button" onClick={dictate} aria-pressed={recording} aria-label={recording?"Detener dictado":"Dictar por voz"}><Glyph name="mic"/>{recording&&<span className="micWave" aria-hidden="true"><i/><i/><i/></span>}</button><button type="submit" disabled={busy||!config?.assistantReady} aria-label={recording?"Finalizar transcripción y enviar":"Enviar consulta"}><Glyph name="send"/></button></div></form>
    <div className="bessyTagline">{AI.closing}</div>
    {cameraOpen&&<div className="veciCamera"><video ref={videoRef} autoPlay playsInline muted/><div><button type="button" onClick={stopCamera}>Cancelar</button><button type="button" className="cameraShot" onClick={takePhoto}>Tomar foto</button></div></div>}
  </section></div>}</div>
}