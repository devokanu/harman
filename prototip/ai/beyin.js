// Beyin: Gemini → Groq → OpenRouter sıralı yedek; JSON şeması {duygu, enerji, soz}; 8 sn zaman aşımı; 429'da bekleyip bir kez daha.
// TEST_MODU=1 iken hiçbir sağlayıcı çağrılmaz, hazır cevap döner. Anahtar değerleri asla loglanmaz (yalnız dolu/boş).
import { readFileSync } from "node:fs";
const env = process.env;
const DUYGULAR = ["mutlu", "sakin", "muzip", "merakli", "saskin", "panik", "korkmus"];
const persona = (() => { try { return readFileSync(new URL("./persona.md", import.meta.url), "utf8"); } catch { return "Sen Robi adlı yapay zekâ yayın karakterisin. Kısa, sıcak, Türkçe konuş."; } })();
const ornekler = persona.split("\n").filter(l => /^\d+\. /.test(l));
export function anahtarDurumu() { return { GEMINI: !!env.GEMINI_API_KEY, GROQ: !!env.GROQ_API_KEY, OPENROUTER: !!env.OPENROUTER_API_KEY, ELEVENLABS: !!env.ELEVENLABS_API_KEY, TEST_MODU: env.TEST_MODU === "1" }; }
function sistemIstemi(hafiza) {
  const sec = [...ornekler].sort(() => Math.random() - .5).slice(0, 6).join("\n");
  return `${persona}\n\nİzleyici hafızası: ${JSON.stringify(hafiza || {})}\n\nÖrnekler:\n${sec}\n\nYALNIZ JSON döndür: {"duygu":"...","enerji":1|2|3,"soz":"..."}`;
}
function onar(metin) {
  try { const j = JSON.parse(metin.replace(/^```json|```$/gm, "").trim()); if (!DUYGULAR.includes(j.duygu)) j.duygu = "sakin"; j.enerji = Math.min(3, Math.max(1, +j.enerji || 2)); j.soz = String(j.soz || "").slice(0, 160); if (!j.soz) throw new Error("boş söz"); return j; } catch { return null; }
}
async function fetchJSON(url, body, headers, ms = 8000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: ac.signal }); if (r.status === 429) { await new Promise(s => setTimeout(s, 1500)); return fetchJSON(url, body, headers, ms); } if (!r.ok) throw new Error(`${r.status} ${await r.text().then(x => x.slice(0, 120))}`); return r.json(); } finally { clearTimeout(t); }
}
const SAGLAYICI = {
  async gemini(sys, kullanici) { // https://ai.google.dev/api  (generateContent, responseMimeType json)
    const m = env.GEMINI_MODEL || "gemini-2.5-flash";
    const j = await fetchJSON(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, { systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: kullanici }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.8, maxOutputTokens: 120, thinkingConfig: { thinkingBudget: 0 } } }, { "x-goog-api-key": env.GEMINI_API_KEY });
    return j.candidates?.[0]?.content?.parts?.[0]?.text || "";
  },
  async groq(sys, kullanici) { // https://console.groq.com/docs/api-reference (OpenAI uyumlu)
    const j = await fetchJSON("https://api.groq.com/openai/v1/chat/completions", { model: env.GROQ_MODEL || "llama-3.1-8b-instant", messages: [{ role: "system", content: sys }, { role: "user", content: kullanici }], response_format: { type: "json_object" }, temperature: 0.8, max_tokens: 120 }, { authorization: `Bearer ${env.GROQ_API_KEY}` });
    return j.choices?.[0]?.message?.content || "";
  },
  async openrouter(sys, kullanici) { // https://openrouter.ai/docs (OpenAI uyumlu)
    const j = await fetchJSON("https://openrouter.ai/api/v1/chat/completions", { model: env.OPENROUTER_MODEL, messages: [{ role: "system", content: sys }, { role: "user", content: kullanici }], temperature: 0.8, max_tokens: 120 }, { authorization: `Bearer ${env.OPENROUTER_API_KEY}` });
    return j.choices?.[0]?.message?.content || "";
  }
};
const HAZIR = { selam: { duygu: "mutlu", enerji: 2, soz: "Selam {ad}! Hoş geldin, yerin hazır." }, genel: { duygu: "sakin", enerji: 1, soz: "{ad}, bunu not ettim. Devam et." } };
let cagriSayaci = 0; // harcama tavanı: LLM_OTURUM_SINIRI aşılınca hazır cevap
export const harcama = () => ({ cagri: cagriSayaci, sinir: +(env.LLM_OTURUM_SINIRI || 1500) });
export async function dusun({ nick, metin, hafiza, tur = "yorum" }) {
  const t0 = Date.now();
  if (env.TEST_MODU !== "1" && cagriSayaci >= +(env.LLM_OTURUM_SINIRI || 1500)) { const h = HAZIR.genel; return { ...h, soz: h.soz.replace("{ad}", nick), saglayici: "sinir", sure: 0 }; }
  if (env.TEST_MODU !== "1") cagriSayaci++;
  if (env.TEST_MODU === "1") { const h = /selam|merhaba|slm/i.test(metin) ? HAZIR.selam : HAZIR.genel; return { ...h, soz: h.soz.replace("{ad}", nick), saglayici: "test", sure: Date.now() - t0 }; }
  const sys = sistemIstemi(hafiza); const kullanici = `${tur}: ${nick}: ${metin}`;
  const sira = [["gemini", env.GEMINI_API_KEY], ["groq", env.GROQ_API_KEY], ["openrouter", env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL]].filter(([, k]) => k).map(([n]) => n);
  for (const ad of sira) {
    try { const ham = await SAGLAYICI[ad](sys, kullanici); let j = onar(ham); if (!j) { j = onar(await SAGLAYICI[ad](sys + "\nÖnceki cevap şemaya uymadı; yalnız geçerli JSON.", kullanici)); } if (j) return { ...j, saglayici: ad, sure: Date.now() - t0 }; }
    catch (e) { console.error(`[beyin] ${ad} başarısız: ${String(e.message).slice(0, 100)}`); }
  }
  return { ...HAZIR.genel, soz: HAZIR.genel.soz.replace("{ad}", nick), saglayici: "yedek", sure: Date.now() - t0 };
}
