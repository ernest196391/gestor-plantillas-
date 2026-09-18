import {openaiModel,geminiModel,googleKey} from "../../../../lib/ai-config";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
  const result={openai:{configured:Boolean(process.env.OPENAI_API_KEY),model:openaiModel(),status:null},gemini:{configured:Boolean(googleKey()),model:geminiModel(),status:null}};
  if(process.env.OPENAI_API_KEY){
    try{
      const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:openaiModel(),input:"Responde solo OK",max_output_tokens:16,store:false}),signal:AbortSignal.timeout(15000)});
      result.openai.status=r.status;
      if(!r.ok){const t=await r.text();result.openai.error=t.slice(0,180).replace(/[A-Za-z0-9_-]{20,}/g,"[redacted]")}
    }catch(e){result.openai.status="network";result.openai.error=String(e?.name||"error")}
  }
  if(googleKey()){
    try{
      const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(geminiModel())+":generateContent",{method:"POST",headers:{"x-goog-api-key":googleKey(),"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Responde solo OK"}]}],generationConfig:{maxOutputTokens:16}}),signal:AbortSignal.timeout(15000)});
      result.gemini.status=r.status;
      if(!r.ok){const t=await r.text();result.gemini.error=t.slice(0,180).replace(/[A-Za-z0-9_-]{20,}/g,"[redacted]")}
    }catch(e){result.gemini.status="network";result.gemini.error=String(e?.name||"error")}
  }
  return Response.json(result,{headers:{"Cache-Control":"no-store"}});
}
