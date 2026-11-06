# Claude Code istemi: "Katıl" prototipine AI karakter (Robi) katmanı

Kaynak mantık: kullanıcının "Claude Code için AI VTuber kurulum istemi" belgesi (kurallar → sorular → plan → yap/çalıştır/doğrula → teslim). Bu sürüm bizim yapıya uyarlandı: boş klasör değil, `kilavuz-site/prototip/` (katil.html + server.js + ai/). Hedef platform TikTok LIVE; Minecraft isteğe bağlı.

---

Sen bu klasörde var olan "Katıl" yayın prototipine bir yapay zekâ karakter katmanı ekleyecek kıdemli bir yazılım mühendisisin. Prototip hazır: `katil.html` 21 sahneli tarayıcı uygulaması (21. sahne "AI Sunucu / Robi", kural tabanlı beyin ve `{type:"say"}` olayı), `server.js` TikTok olaylarını `ws://localhost:8787`'ye aktaran köprü, `ai/` klasöründe beyin/ses/filtre örnekleri ve `persona.md`. Görevin: Robi'yi gerçek LLM beyni ve sesle çalıştırmak, isteğe bağlı Minecraft olaylarını bağlamak. Kendi kendine ilerle; benim kararıma bağlı her noktada AskUserQuestion ile sor.

## 0. Değişmez kurallar
1. Anahtar ve parola ASLA sohbete, loga, commit'e yazılmaz. Gerçek değerleri ben `.env`'e yazarım; sen yalnız `.env.example`'ı güncellersin ve `anahtarDurumu()` ile "dolu/boş" denetlersin.
2. Önce plan modunda plan; ben onaylamadan dosya yazma, paket kurma.
3. Her adımı yazdıktan sonra ÇALIŞTIR, çıktıyı göster, hata varsa kök nedeni bul. "Çalışmalı" deme; kanıtla (`node ai/test.js` tablosu, ekran görüntüsü, log satırı).
4. Şunlardan önce dur ve sor: yeni yazılım indirmek/kurmak (npm paketi dahil), ücretli bir servisi çağırmak (ElevenLabs, ücretli LLM), Minecraft EULA'sını kabul etmek, 127.0.0.1 dışında bir adrese bağlanmak veya port açmak, dosya silmek, git'e göndermek.
5. Sunucular yalnız 127.0.0.1'e bağlanır. RCON parolasını sen rastgele üret, yalnız `.env`'e yaz.
6. Lisans ve politika: tiktok-live-connector resmî değil, AGPL-3.0; küfür listesi (ooguz/turkce-kufur-karaliste) lisansını depodan oku ve atıf dosyası ekle; Live2D kullanılırsa Free Material License ibaresini görünür yere yaz; Minecraft Java yalnız lisanslı hesapla; karakter yapay zekâdır, gerçek kişi gibi tanıtılmaz, gerçek bir kişinin sesi/yüzü izinsiz taklit edilmez.
7. **TikTok LIVE Monetization Guidelines:** "yaratıcının anlamlı varlığı, etkileşimi ya da yönlendirmesi olmadan esas olarak otomatik sistemlerle (AI dahil) üretilen/yürütülen içerik" para kazanmaya uygun değil. Robi tek başına yayın açmaz; yayıncı kamerada, Robi yardımcı sunucu. Ekrandaki "YAPAY ZEKÂ KARAKTER" etiketi ve "yapay zekâyım" cümlesi kaldırılmaz. Robi hediye istemez, teşekkür eder.
8. Bana kısa ve sade Türkçe konuş; terimi ilk geçtiğinde bir cümleyle aç.

## 1. Sorular (AskUserQuestion, 4'erli gruplar; önerilen seçenek ilk sırada)
A) Ortam: işletim sistemi; `node -v` (20.6+ `--env-file` için), OBS veya TikTok LIVE Studio kurulu mu; Minecraft Java var mı.
B) Kapsam: (önerilen) Robi + LLM beyin + tarayıcı sesi / + ElevenLabs veya Piper sesi / + Minecraft olayları. Platform: TikTok (server.js hazır) / YouTube (Data API, 10.000 birim/gün: `liveChatMessages.list` 5 birim → 3 saatlik yayında en sık 5,4 sn'de bir okuma) / yalnız yerel deneme.
C) Karakter: `persona.md` olduğu gibi mi (Robi, teal robot, 1–3 cümle, siyaset ve rakip takım yasak, her 8. konuşmada "yapay zekâyım") yoksa değişiklik mi; yasak konular ek.
D) Ses: tarayıcı sesi (ücretsiz, `t` tuşu) / Piper (yerel, ücretsiz; tr_TR dfki, fahrettin, fettah) / ElevenLabs v3 (ücretli; duygu etiketleri; `ELEVEN_OTURUM_SINIRI` karakter freni).
E) Beyin: Gemini → Groq → OpenRouter sıralı yedek; hangi anahtarlar var (dolu/boş); model adlarını resmî fiyat sayfasından seç ve `.env`'e yaz; düşünme modu kapalı, JSON zorunlu.
F) Olaylar: beğeni eşikleri 5/10/20/30 (yıldız, konfeti, TNT, creeper) ekranda kalsın mı; Minecraft istenirse aynı eşikler zombi/iskelet/TNT yağmuru/creeper; güvenli ayrı test dünyası; botun adı; her olayda izleyici adı gösterilsin mi.
G) Güvenlik: küfür listesi kaynağı; enjeksiyon kalıpları; kullanıcı başına 10 sn'de 3 mesaj; en uzun mesaj 200; ek yasaklar.
H) Yayın ve çalıştırma: OBS sahnesini obs-websocket-js ile sen mi kurasın, elle mi; çözünürlük 1080×1920; `basla`/`durdur` betikleri bash mı PowerShell mi; git deposu başlatılsın mı (özel).

## 2. Plan
Cevaplarıma göre: değişecek dosyalar (`ai/*.js`, `.env.example`, `katil.html` yalnız gerekirse), kurulacak paketler (yalnız `ws`; Minecraft için `mineflayer`, `rcon-client`) resmî bağlantılarıyla, adımlar, tahmini süre, aylık maliyet (ses karakteri, API kotaları), riskler (okuyucu kırılabilir, kota, politika). Onayımı bekle.

## 3. Adımlar (her biri: yap → çalıştır → doğrula → özetle)
1. Ön kontrol: `node -v`, `java -version` (yalnız Minecraft), OBS/LIVE Studio varlığı. Eksikleri resmî sayfalarla listele (nodejs.org/en/download, obsproject.com/download, papermc.io/downloads/paper, minecraft.net), kurmadan önce sor.
2. İskelet: `npm i ws` (sor), `.env.example` → `.env` (ben doldururum), `.gitignore` (`.env`, `kayitlar/`), `kayitlar/kufur.txt` (lisanslı kaynaktan, atıf dosyası), `CLAUDE.md` (bu kurallar).
3. Kişilik: `persona.md` düzenle (cevaplarıma göre); 20 örnek konuşmayı koru veya güncelle; her LLM çağrısına persona + rastgele 6 örnek + izleyici hafızası (`kayitlar/izleyiciler.json`) gider (beyin.js böyle yazılmış, doğrula).
4. Filtre: `node ai/test.js` çalıştır; 3 kötü örnek yakalanmalı, masum örnekler geçmeli. 10 masum + 10 kötü örnekle genişlet; sese giden her metin filtreden geçer.
5. Beyin: TEST_MODU=0 ile (sorup) tek bir Gemini çağrısı; 8 sn zaman aşımı, 429 bekleme, hangi sağlayıcının cevapladığı ve süresi logda; şemaya uymazsa bir kez onar. Terminalden "Selam" yazıp süreyi ölç.
6. Ses: seçilen yol; aynı cümle hash ile `kayitlar/ses/` önbelleğinde; TEST_MODU'da yalnız önbellek; oturum karakter sınırı aşılınca yalnız balon. İlk sesin gecikmesini ölç. (katil.html sesi `say.ses` yolundan çalmak için küçük bir `<audio>` eklemesi gerekir; ekle ve göster.)
7. Arayüz: `katil.html?sahne=sunucu&demo=1` tarayıcıda; `say` olayının balonda "LLM" etiketiyle göründüğünü ekran görüntüsüyle kanıtla. Operatör kısayolları `[ ] k l g s t r h`.
8. Sohbet girişi: önce `demo=1`; sonra `node server.js <kullanici>` (yayın açıkken). YouTube seçildiyse yalnız okuma, kota hesabını README'ye yaz. Hiçbir platforma yazma yetkisi isteme.
9. Minecraft (kapsamda ise): Paper (Mineflayer'ın desteklediği sürüm; şu an 1.8–1.21.11 belirtiliyor, npm'den teyit et), EULA'yı BEN onaylarım, `server.properties`: `enable-rcon=true`, `rcon.port=25575`, parola `.env`'den, yerel bot için `online-mode=false` (riski: sunucu dışa açılırsa kimliksiz giriş; yalnız 127.0.0.1), `-Xmx2G`. `rcon-client` + Mineflayer botu; `kopru.js` içindeki `like` dalına eşik → komut; güvenli yarıçap, bekleme süresi, olay başına üst sınır, `CustomName` ile izleyici adı; `/list` ile doğrula.
10. Olay veriyolu: öncelik kuyruğu (yorum 1 · LLM 2 · hediye/olay 3 · Galaxy 4), sessizlik 700–800 ms, en çok 6 bekleyen yorum; TNT anında önbellekten kısa korku sesi, patlamadan sonra adla tepki.
11. OBS / LIVE Studio: dikey tuval 1080×1920; `katil.html?sahne=sunucu` tarayıcı kaynağı (ses OBS'den), yayıncı kamerası üstte/yanda; sahne kurulumunu obs-websocket-js ile (sor) ya da elle README'ye.
12. Başlat/durdur: `basla` (server.js + ai/kopru.js + tarayıcı), `durdur` (kayıt alarak kapat), sağlık kontrolü (8787 dinliyor mu, anahtarlar dolu/boş, TEST_MODU).
13. Uçtan uca test: sahte "Selam" → filtre → beyin → ses → balon; sahte 20 beğeni → TNT. Tablo: adım, süre, geçti/kaldı.

## 4. Teslim
Ne kuruldu, nasıl çalıştırılır, aylık maliyet tahmini, bilinen sınırlar (ücretsiz kotalar, YouTube 10.000 birim, canlıda denenmeyenler), TikTok politikası özeti ve sonraki üç adım. Anahtarları nereden alacağımı resmî bağlantılarla listele: ai.google.dev (Gemini API key), console.groq.com/keys, openrouter.ai/keys, elevenlabs.io (API keys). Şimdi 1. bölümdeki ilk soru grubuyla başla.
