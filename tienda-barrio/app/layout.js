import "./globals.css";
import "./veci.css";
import "./veci-fixes.css";
import InstallPrompt from "./InstallPrompt";
import {tenant} from "../lib/tenant";
const themeVars=Object.entries({"--ink":tenant.theme.ink,"--deep":tenant.theme.primary,"--teal":tenant.theme.secondary,"--orange":tenant.theme.accent,"--mint":tenant.theme.mint,"--veci-teal":tenant.theme.assistant,"--veci-dark":tenant.theme.assistantDark,"--veci-brand":tenant.theme.assistantInk,"--veci-border":tenant.theme.assistantBorder,"--veci-tint":tenant.theme.assistantSoft,"--veci-tint-hover":tenant.theme.assistantSoftHover}).map(([k,v])=>k+":"+v).join(";");
export const metadata={
  title:tenant.seo.title,
  description:tenant.seo.description,
  icons:{
    icon:[
      {url:"/icons/icon-192.png",sizes:"192x192",type:"image/png"},
      {url:"/icons/icon-512.png",sizes:"512x512",type:"image/png"}
    ],
    apple:"/apple-touch-icon.png"
  },
  appleWebApp:{capable:true,title:tenant.shortName,statusBarStyle:"default"},
  robots:{index:false,follow:false}
};
export const viewport={themeColor:tenant.theme.assistant,width:"device-width",initialScale:1};
export default function RootLayout({children}){return <html lang="es"><body><style dangerouslySetInnerHTML={{__html:":root,.veciV2{"+themeVars+"}"}}/>{children}<InstallPrompt/></body></html>}