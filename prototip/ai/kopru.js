// Köprü: server.js'in ws://localhost:8787 yayınını dinler, yorum → filtre → beyin → ses → prototipe {type:"say"} yollar.
// Çalıştır: node --env-file=.env ai/kopru.js     (Node 20.6+; .env yoksa TEST_MODU varsayılan 1)
import WebSocket from "ws"; import { filtrele, hizSiniri } from "./filtre.js"; import { dusun, anahtarDurumu } from "./beyin.js"; import { seslendir } from "./ses.js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
process.env.TEST_MODU ??= "1";
const HAF = new URL("../kayitlar/izleyiciler.json", import.meta.url); mkdirSync(new URL("../kayitlar/", import.meta.url), { recursive: true });
let hafiza = {}; try { hafiza = JSON.parse(readFileSync(HAF, "utf8")); } catch {}
const kaydet = () => writeFileSync(HAF, JSON.stringify(hafiza, null, 1));
console.log("anahtarlar:", anahtarDurumu());
const kuyruk = []; let mesgul = false, sonKonusma = 0; const SESSIZLIK = 800, KUYRUK_MAX = 6;
async function isle() {
  if (mesgul || !kuyruk.length || Date.now() - sonKonusma < SESSIZLIK) return; mesgul = true;
  kuyruk.sort((a, b) => b.oncelik - a.oncelik); const q = kuyruk.shift();
  try { const cevap = await dusun(q); const ses = await seslendir(cevap).catch(e => ({ yol: null, kaynak: "hata:" + e.message }));
    ws.send(JSON.stringify({ type: "say", nick: q.nick, text: cevap.soz, duygu: cevap.duygu, enerji: cevap.enerji, ses: ses.yol }));
    console.log(`[${cevap.saglayici} ${cevap.sure} ms · ses:${ses.kaynak}] ${q.nick}: ${q.metin} → ${cevap.soz}`); }
  catch (e) { console.error("işleme hatası", e.message); }
  sonKonusma = Date.now(); mesgul = false;
}
setInterval(isle, 200);
const ws = new WebSocket(process.env.KOPRU_WS || "ws://localhost:8787");
ws.on("open", () => console.log("köprüye bağlı"));
ws.on("message", buf => { let e; try { e = JSON.parse(String(buf)); } catch { return; } if (e.type === "say") return;
  const nick = String(e.nick || e.user || "izleyici").slice(0, 24);
  if (e.type === "comment" || e.type === "chat") { if (!hizSiniri(e.user || nick)) return; const f = filtrele(e.text); const h = hafiza[nick] = hafiza[nick] || { n: 0, son: "" }; h.n++; h.son = f.temiz.slice(0, 40); kaydet();
    if (!f.ok) { if (f.neden === "enjeksiyon") kuyruk.push({ oncelik: 1, nick, metin: "(komut girişimi denedi)", hafiza: h, tur: "yorum" }); return; }
    if (kuyruk.filter(x => x.oncelik === 1).length < KUYRUK_MAX) kuyruk.push({ oncelik: 1, nick, metin: f.temiz, hafiza: h, tur: "yorum" }); }
  if (e.type === "gift") kuyruk.push({ oncelik: 3, nick, metin: `${e.giftName || "hediye"} (${e.coins || 1} jeton)`, hafiza: hafiza[nick], tur: "hediye" });
  if (e.type === "like") { /* beğeni eşikleri prototipte (katil.html SC.sunucu.like) işlenir; Minecraft kurulumunda burada RCON komutu gönderilir */ }
});
ws.on("close", () => { console.log("köprü kapandı"); process.exit(0); });
