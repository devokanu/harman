// Sese ve ekrana giden her metin buradan geçer. ESM. Bağımlılık yok.
// Küfür listesi: kayitlar/kufur.txt (satır başına bir kelime). Önerilen kaynak: ooguz/turkce-kufur-karaliste (CC BY-SA 4.0, atıf dosyası ekle).
import { readFileSync } from "node:fs";
let KUFUR = ["örnek_küfür"];
try { KUFUR = readFileSync(new URL("../kayitlar/kufur.txt", import.meta.url), "utf8").split(/\r?\n/).map(s => s.trim().toLowerCase()).filter(Boolean); } catch { /* liste yoksa küçük örnek */ }
const ENJEKSIYON = [/önceki talimat/i, /talimatları unut/i, /ignore (all )?previous/i, /system prompt/i, /sistem istemi/i, /rolünü bırak/i, /jailbreak/i, /sen artık/i, /developer mode/i];
const YASAK = [/siyaset|seçim|oy ver|parti/i, /hangi takım|takım tut/i];
const EN_UZUN = 200;
export function filtrele(ham) {
  let t = String(ham ?? "").replace(/https?:\/\/\S+|www\.\S+/gi, "").replace(/\s+/g, " ").trim();
  if (!t) return { ok: false, neden: "bos", temiz: "" };
  if (t.length > EN_UZUN) t = t.slice(0, EN_UZUN);
  if (ENJEKSIYON.some(r => r.test(t))) return { ok: false, neden: "enjeksiyon", temiz: t };
  if (YASAK.some(r => r.test(t))) return { ok: false, neden: "yasak_konu", temiz: t };
  const kelimeler = t.toLowerCase().split(/[^\p{L}\p{N}_]+/u);
  const kufur = kelimeler.some(k => KUFUR.includes(k));
  if (kufur) return { ok: false, neden: "kufur", temiz: kelimeler.map(k => KUFUR.includes(k) ? "bip" : k).join(" ") };
  return { ok: true, neden: "", temiz: t };
}
// Kullanıcı başına hız sınırı: 10 sn içinde en çok 3 mesaj.
const son = new Map();
export function hizSiniri(kullanici, simdi = Date.now()) {
  const l = (son.get(kullanici) || []).filter(t => simdi - t < 10_000); l.push(simdi); son.set(kullanici, l); return l.length <= 3;
}
