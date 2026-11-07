# Katıl prototipi

- `katil.html` — 21 sahneli yorumla-katıl prototipi. Tarayıcıda aç: `katil.html?sahne=halka&demo=1` (sahte olaylar). Sahneler: halka, yoklama, cayocagi, dolmus, tribun, burc, gurbet, kusak, sofra, pazar, kumes, trafik, isim, koro, apartman, fal, hava, hatira, zincir, anons, sunucu. Tuşlar: `[` `]` sahne, `k` yorum, `l` 20 beğeni, `g` hediye, `s` büyük hediye, `t` TTS, `r` sıralamayı sıfırla, `h` yardım kutusu, `p` duraklat (acil durdurma), `m` sesi kes.
- `server.js` — TikTok LIVE olaylarını `ws://localhost:8787` adresine aktarır. Kurulum: `npm init -y && npm i tiktok-live-connector ws`, çalıştırma (yayın açıkken): `node server.js <tiktok_kullanici_adi>`.
- `anons/anons.html` — Radyo Anons sahnesi, tek dosya: kart animasyonları, VU metre, dönen plak, YAYINDA lambası, WebAudio sentez sesler, TTS; `sprites/` (DJ iki kare, mikrofon, plak, lamba, kartpostal; yoksa vektör). `?demo=1`, tuşlar `k l 1–5 t p m r h`. Kılavuz 05f.
- `cigkofte/cigkofte.html` — Çiğ Köfte Yoğurma sahnesi, tamamen vektör: acı ölçer, oy çubuğu, yoğuran eller, malzeme yağmuru, ikonik replikler, sıkma turu. Kılavuz 05g.
- `ai/` — Robi (21. sahne) için Node örnekleri: `persona.md`, `beyin.js` (Gemini → Groq → OpenRouter), `ses.js` (Eleven v3 / Piper / yok), `filtre.js`, `kopru.js`, `test.js` (`node ai/test.js`, anahtar gerekmez), `ISTEM.md` (Claude Code istemi). Köprü `{type:"say"}` mesajını prototipe iletir.
- `sprites/` — 40 AI üretimi varlık (19 arka plan JPEG, 21 şeffaf PNG). `katil.html` bunları `sprites/...` göreli yolundan yükler; yüklenmezse (ör. dosya doğrudan açıldıysa) emoji ve basit şekillere döner. `?sprites=0` eski çizimi zorlar.
- `halka.html` — tek sahneli ilk sürüm. `bar.html` — Versus Arena bar overlay'i (`?demo=1`).

Olay sözleşmesi: `{type:"comment"|"like"|"gift"|"join"|"viewers", user, nick, avatar, text, count, giftName, coins, repeat}`.
Ayrıntılı kurulum: `../adimlar.html` bölüm 10.
