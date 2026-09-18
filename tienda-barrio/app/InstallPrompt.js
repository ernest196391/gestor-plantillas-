"use client";
import {useEffect,useState} from "react";
import {tenant,storeKey} from "../lib/tenant";
const DISMISSED=storeKey("install-dismissed");
export default function InstallPrompt(){
  const [prompt,setPrompt]=useState(null),[show,setShow]=useState(false);
  useEffect(()=>{
    if(window.matchMedia?.("(display-mode: standalone)").matches) return;
    const dismissed=sessionStorage.getItem(DISMISSED);
    const onPrompt=e=>{e.preventDefault();setPrompt(e);if(!dismissed)setShow(true)};
    window.addEventListener("beforeinstallprompt",onPrompt);
    return()=>window.removeEventListener("beforeinstallprompt",onPrompt);
  },[]);
  if(!show||!prompt)return null;
  const install=async()=>{await prompt.prompt();await prompt.userChoice.catch(()=>null);setShow(false);setPrompt(null)};
  return <div style={{position:"fixed",left:12,right:12,bottom:12,zIndex:90,background:"white",border:"1px solid #cfe9e6",boxShadow:"0 12px 36px #163d4030",borderRadius:18,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,maxWidth:520,margin:"0 auto"}}>
    <img src="/icons/icon-192.png" alt={tenant.name} width="48" height="48" style={{borderRadius:12,flex:"0 0 auto",objectFit:"contain",background:"#FFFFFF"}}/>
    <div style={{minWidth:0,flex:1}}><b style={{display:"block",color:"#1F2937"}}>Instalar {tenant.name}</b><span style={{fontSize:12,color:"#6B7280"}}>Ábrelo como una app desde tu móvil.</span></div>
    <button onClick={install} style={{border:0,borderRadius:12,background:tenant.theme.assistant,color:"white",fontWeight:700,padding:"10px 12px"}}>Instalar</button>
    <button aria-label="Cerrar" onClick={()=>{sessionStorage.setItem(DISMISSED,"1");setShow(false)}} style={{border:0,background:"transparent",fontSize:22,color:"#6B7280"}}>×</button>
  </div>
}