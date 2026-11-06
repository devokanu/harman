// Halka prototipi — TikTok LIVE olaylarını yerel WebSocket'e (ws://localhost:8787) aktarır.
// Kurulum:  npm init -y && npm i tiktok-live-connector ws
// Çalıştır: node server.js <tiktok_kullanici_adi>      (yayın AÇIKKEN)
// Not: tiktok-live-connector resmî TikTok API'si değildir (tersine mühendislik, AGPL-3.0);
// sürümüne göre sınıf adları değişir. Aşağıdaki kod v2 (TikTokLiveConnection/WebcastEvent) ve
// v1 (WebcastPushConnection) adlarını dener. Sürüm ve olay alanlarını README/03 notuna göre teyit et.
const { WebSocketServer } = require("ws");
const lib = require("tiktok-live-connector");
const user = process.argv[2];
if (!user) { console.error("kullanım: node server.js <tiktok_kullanici_adi>"); process.exit(1); }

const wss = new WebSocketServer({ port: 8787 });
const send = (o) => { const s = JSON.stringify(o); wss.clients.forEach(c => c.readyState === 1 && c.send(s)); };
console.log("WebSocket hazır: ws://localhost:8787 → katil.html / halka.html bu adrese bağlanır");
// İstemciden gelen mesajı (ör. ai/kopru.js'in {type:"say"} konuşması) diğer istemcilere yeniden yayınla.
wss.on("connection", ws => { ws.on("message", buf => { let o; try { o = JSON.parse(String(buf)); } catch { return; } if (o && o.type === "say") { const s = JSON.stringify(o); wss.clients.forEach(c => c !== ws && c.readyState === 1 && c.send(s)); } }); });

const Conn = lib.TikTokLiveConnection || lib.WebcastPushConnection;
const EV = lib.WebcastEvent || { CHAT: "chat", LIKE: "like", GIFT: "gift", MEMBER: "member", ROOM_USER: "roomUser", FOLLOW: "follow", SHARE: "share" };
const conn = new Conn(user, { processInitialData: false, enableExtendedGiftInfo: true });

// Alan adları sürüme göre değişiyor: README uniqueId/comment/likeCount, 2.5.0 belgeleri user.displayId/content/count.
const who = (d) => ({ user: d.uniqueId || d.user?.uniqueId || d.user?.displayId, nick: d.nickname || d.user?.nickname, avatar: d.profilePictureUrl || d.user?.profilePictureUrl || d.user?.profilePicture?.urls?.[0] || d.user?.avatarThumb?.urlList?.[0] });
let logged = 0; const peek = (n, d) => { if (logged < 3) { logged++; console.log("örnek olay", n, JSON.stringify(d).slice(0, 600)); } }; // ilk olaylarda alan adlarını gör

conn.on(EV.CHAT,   d => { peek("chat", d); send({ type: "comment", ...who(d), text: d.comment ?? d.content }); });
conn.on(EV.LIKE,   d => send({ type: "like",    ...who(d), count: d.likeCount ?? d.count ?? 1 }));
conn.on(EV.MEMBER, d => send({ type: "join",    ...who(d) }));
conn.on(EV.FOLLOW, d => send({ type: "comment", ...who(d), text: "katıl" }));
conn.on(EV.SHARE,  d => send({ type: "comment", ...who(d), text: "katıl" }));
conn.on(EV.ROOM_USER, d => send({ type: "viewers", count: d.viewerCount }));
conn.on(EV.GIFT, d => {
  // Seri (streak) hediyelerde repeatEnd gelene kadar ara sayımlar da gelir; yalnız seri bitince işle.
  const streaking = d.giftType === 1 && !d.repeatEnd;
  if (streaking) return;
  send({ type: "gift", ...who(d), giftName: d.giftName, coins: d.diamondCount, repeat: d.repeatCount || 1 });
});
conn.on("disconnected", () => { console.log("bağlantı koptu, 5 sn sonra tekrar"); setTimeout(start, 5000); });
conn.on("streamEnd", () => console.log("yayın bitti"));

async function start() {
  try { const st = await conn.connect(); console.log("bağlandı, roomId:", st.roomId); }
  catch (e) { console.error("bağlanamadı:", e.message || e); setTimeout(start, 10000); }
}
start();
