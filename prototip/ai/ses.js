// Ses: SES=eleven (Eleven v3, duygu etiketleri) | piper (yerel, ücretsiz) | yok. Aynı cümle hash ile kayitlar/ses/ altına önbelleklenir.
// TEST_MODU=1 iken yalnız önbellekten çalınır; ELEVEN_OTURUM_SINIRI (karakter) aşılınca ses üretilmez, yalnız balon.
import { createHash } from "node:crypto"; import { existsSync, mkdirSync, writeFileSync } from "node:fs"; import { execFile } from "node:child_process";
const env = process.env; const DIR = new URL("../kayitlar/ses/", import.meta.url); let harcanan = 0;
const ETIKET = { mutlu: "[excited]", sakin: "", muzip: "[cheeky]", merakli: "[curious]", saskin: "[gasps]", panik: "[panicking]", korkmus: "[worried]" }; // Eleven v3 audio tags; SSML desteklenmez
export function sesDosyasi({ soz, duygu }) {
  const metin = (env.SES === "eleven" ? `${ETIKET[duygu] || ""} ${soz}`.trim() : soz);
  const h = createHash("sha1").update(env.SES + "|" + metin).digest("hex").slice(0, 16); mkdirSync(DIR, { recursive: true });
  return { metin, yol: new URL(`${h}.${env.SES === "piper" ? "wav" : "mp3"}`, DIR).pathname };
}
export async function seslendir(cevap) {
  if (env.SES === "yok" || !env.SES) return { yol: null, kaynak: "balon" };
  const { metin, yol } = sesDosyasi(cevap); if (existsSync(yol)) return { yol, kaynak: "onbellek" };
  if (env.TEST_MODU === "1") return { yol: null, kaynak: "test_balon" };
  if (env.SES === "eleven") { // https://elevenlabs.io/docs/api-reference/text-to-speech/convert  model eleven_v3
    if (harcanan + metin.length > +(env.ELEVEN_OTURUM_SINIRI || 20000)) return { yol: null, kaynak: "sinir_balon" };
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVEN_SES_ID}?output_format=mp3_44100_128`, { method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "content-type": "application/json" }, body: JSON.stringify({ text: metin, model_id: "eleven_v3", voice_settings: { stability: 0.5 } }) });
    if (!r.ok) throw new Error("eleven " + r.status); writeFileSync(yol, Buffer.from(await r.arrayBuffer())); harcanan += metin.length; return { yol, kaynak: "eleven" };
  }
  if (env.SES === "piper") { // piper --model tr_TR-fahrettin-medium.onnx --output_file x.wav  (sesler: huggingface.co/rhasspy/piper-voices tr/tr_TR: dfki, fahrettin, fettah)
    await new Promise((res, rej) => { const p = execFile("piper", ["--model", env.PIPER_MODEL, "--output_file", yol], (e) => e ? rej(e) : res()); p.stdin.end(metin); });
    return { yol, kaynak: "piper" };
  }
  return { yol: null, kaynak: "balon" };
}
