# ai/ — Robi için beyin, ses, filtre, köprü (örnek kod)

Robi, `katil.html` 21. sahnedeki yapay zekâ karakter. Tarayıcıdaki sürüm kural tabanlı çalışır ve anahtar istemez. Bu klasör, isteğe bağlı LLM + TTS katmanıdır: `server.js` köprüsünü dinler, cevabı `{type:"say"}` olarak prototipe geri yollar.

| Dosya | Ne yapar |
|---|---|
| `persona.md` | Kimlik, ton, kesin yasaklar, JSON şeması `{duygu, enerji, soz}`, 20 örnek konuşma (LLM çağrısına rastgele 6'sı eklenir) |
| `filtre.js` | Küfür (`kayitlar/kufur.txt`), komut girişimi kalıpları, yasak konu, bağlantı/uzunluk kesme, kullanıcı başına 10 sn'de 3 mesaj |
| `beyin.js` | Gemini → Groq → OpenRouter sıralı yedek; JSON onarımı; 8 sn zaman aşımı; 429'da bekle; `TEST_MODU=1` hazır cevap; anahtarlar yalnız dolu/boş |
| `ses.js` | `SES=eleven` (Eleven v3, duygu → audio tag, oturum karakter sınırı), `piper` (yerel), `yok`; hash önbelleği `kayitlar/ses/` |
| `kopru.js` | ws://localhost:8787 dinler → filtre → beyin → ses → `say`; izleyici hafızası `kayitlar/izleyiciler.json`; öncelik kuyruğu, 800 ms sessizlik |
| `test.js` | Kuru uçtan uca test; tablo basar |
| `ISTEM.md` | Claude Code'a verilecek, bizim yapıya uyarlanmış kurulum istemi |

## Çalıştırma
```
cp ai/.env.example .env        # değerleri sen doldur; .env paylaşılmaz
node ai/test.js                # anahtar gerekmez
npm i ws                       # köprü için tek bağımlılık
node --env-file=.env ai/kopru.js   # ayrı terminalde: node server.js <tiktok_kullanici_adi>
```
Prototip: `katil.html?sahne=sunucu` (köprüye bağlanır) veya `?sahne=sunucu&demo=1` (sahte izleyici).

## Anahtar kaynakları (resmî)
Gemini: ai.google.dev → "Get API key" · Groq: console.groq.com/keys · OpenRouter: openrouter.ai/keys · ElevenLabs: elevenlabs.io → Profile → API keys. Ücretsiz kotalar sık değişir; projenin kendi kota ekranı geçerlidir.

## Acil durdurma ve harcama tavanı
- Prototipte `p` duraklatır (olaylar yok sayılır, kuyruk boşalır), `m` sesi keser. Köprüde `touch kayitlar/DUR` konuşmayı durdurur, dosyayı silince devam eder.
- `LLM_OTURUM_SINIRI` (varsayılan 1500) aşılınca beyin hazır cevaba düşer; `ELEVEN_OTURUM_SINIRI` sesi keser. Kaynak fikir: Sayıyla, 6 Kas 2026.

## Sınırlar
- TikTok LIVE kuralı: yaratıcı varlığı olmadan otomatik içerik para kazanmaya uygun değil. Robi yardımcı sunucudur; yayıncı kamerada kalır.
- tiktok-live-connector resmî değil (AGPL-3.0), yayın açıkken denenir; kırılabilir.
- `online-mode=false` (Minecraft, ISTEM 9. adım) yalnız 127.0.0.1'de ve yalnız yerel bot için.
- Küfür listesi lisansı (CC BY-SA 4.0 belirtiliyor) kullanmadan önce depodan okunur; atıf dosyası eklenir.
