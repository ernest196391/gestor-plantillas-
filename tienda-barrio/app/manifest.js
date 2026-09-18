import {tenant} from "../lib/tenant";
// El manifiesto de la aplicación instalable se genera con los datos del
// negocio. Antes era un fichero fijo con el nombre escrito dentro, que es
// justo lo que una plantilla no puede permitirse.
export default function manifest(){return{
  name:tenant.name,
  short_name:tenant.shortName,
  description:tenant.seo.description,
  start_url:"/?source=pwa",
  scope:"/",
  display:"standalone",
  background_color:"#FFFFFF",
  theme_color:tenant.theme.assistant,
  lang:"es",
  icons:[
    {src:"/icons/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},
    {src:"/icons/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"},
    {src:"/icons/maskable-icon-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"}
  ]
}}
