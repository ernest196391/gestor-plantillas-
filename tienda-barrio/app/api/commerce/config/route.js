import {tenant} from "../../../../lib/tenant";
import {whatsappUrl} from "../../../../lib/commerce.mjs";
import {assistantReady} from "../../../../lib/ai-config";
export const dynamic="force-dynamic";
export async function GET(){return Response.json({whatsapp:whatsappUrl(process.env.MARKET_WHATSAPP_NUMBER||tenant.whatsapp,"Hola, necesito ayuda con "+tenant.name+"."),assistantReady:assistantReady(),avatar:tenant.assistant.avatar},{headers:{"Cache-Control":"no-store"}})}
