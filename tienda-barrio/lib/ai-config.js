// Defaults mirrored from NEXO source; runtime env overrides remain supported.
export const openaiModel=()=>process.env.OPENAI_MODEL||process.env.NEXO_ASSISTANT_MODEL||"gpt-5.6-terra";
export const geminiModel=()=>process.env.GEMINI_MODEL||"gemini-2.5-flash";
export const googleKey=()=>process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY;
export const assistantReady=()=>!!(process.env.OPENAI_API_KEY||googleKey());
