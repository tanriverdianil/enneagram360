/**
 * Enneagram 360 · pilot backend (Google Apps Script)
 * Saves each result to the sheet "Results", emails the person their profile,
 * and handles newsletter confirmation and unsubscribe links.
 *
 * ONE THING TO EDIT: PAGE_URL below (your GitHub Pages address, ending with /).
 */
const PAGE_URL = 'https://tanriverdianil.github.io/enneagram360/';
const SENDER_NAME = 'Anil · Enneagram 360';
const SHEET_NAME = 'Results';
const MIN_MINUTES_BETWEEN_EMAILS = 10;   // same address can't trigger a new email faster than this
const KEEP_IN_RESERVE = 10;              // stop automatic emails when fewer than this many are left today

const HEAD = ['Timestamp','ID','Language','Name','Email','Profile email','Newsletter','Newsletter updated','Type','Wing','Instincts','Level','Band','Direction','How sure','2nd type','3rd type','Scores 1-9','Self-description type','Own guess','RHETI','Accuracy','Comment','Feedback at','Profile link','Token'];
const COL = {}; HEAD.forEach((h, i) => COL[h] = i + 1);

const TYPE_NAMES = {
 "en": {
  "1": "The Reformer",
  "2": "The Helper",
  "3": "The Achiever",
  "4": "The Individualist",
  "5": "The Investigator",
  "6": "The Loyalist",
  "7": "The Enthusiast",
  "8": "The Challenger",
  "9": "The Peacemaker"
 },
 "tr": {
  "1": "Islah Edici",
  "2": "Yardımsever",
  "3": "Başaran",
  "4": "Bireyselci",
  "5": "Araştırmacı",
  "6": "Sadık",
  "7": "Hevesli",
  "8": "Meydan Okuyan",
  "9": "Barışçı"
 },
 "de": {
  "1": "Der Reformer",
  "2": "Der Helfer",
  "3": "Der Erfolgsmensch",
  "4": "Der Individualist",
  "5": "Der Beobachter",
  "6": "Der Loyale",
  "7": "Der Enthusiast",
  "8": "Der Herausforderer",
  "9": "Der Friedensstifter"
 },
 "ro": {
  "1": "Reformatorul",
  "2": "Ajutorul",
  "3": "Realizatorul",
  "4": "Individualistul",
  "5": "Investigatorul",
  "6": "Loialul",
  "7": "Entuziastul",
  "8": "Provocatorul",
  "9": "Împăciuitorul"
 }
};
const TXT = {
 "en": {
  "subject": "Your Enneagram 360 profile: Type {t}w{w}, {name}",
  "hi": "Hello,",
  "hiName": "Hi {name},",
  "intro": "Thank you for taking the Enneagram 360 pilot. Here is a summary of your result:",
  "fType": "Type",
  "fInst": "Instincts",
  "fNow": "Right now",
  "fDir": "Direction",
  "levelLine": "Level {l} of 9 ({band})",
  "band": {
   "Healthy": "healthy",
   "Average": "average",
   "Unhealthy": "unhealthy"
  },
  "dir": {
   "growth": "leaning toward growth",
   "stress": "leaning toward stress",
   "mixed": "signs of both directions"
  },
  "cta": "Open my full profile",
  "keep": "The button opens your complete profile with all visuals and explanations. Keep this email to come back to it any time.",
  "newsAsk": "You asked to receive updates about Enneagram 360. Please confirm with one click:",
  "newsBtn": "Confirm my subscription",
  "sign": "Warm regards,",
  "signer": "Anil",
  "why": "You received this email because you took the Enneagram 360 test and asked for your profile.",
  "unsub": "Unsubscribe",
  "privacy": "Privacy notice",
  "pageConfirmed": "Thank you, your subscription is confirmed.",
  "pageConfirmedSub": "You will receive occasional updates about Enneagram 360. You can unsubscribe at any time.",
  "pageUnsub": "You have been unsubscribed. You will not receive further emails.",
  "pageInvalid": "This link is no longer valid.",
  "backToSite": "Back to Enneagram 360"
 },
 "tr": {
  "subject": "Enneagram 360 profiliniz: Tip {t}w{w}, {name}",
  "hi": "Merhaba,",
  "hiName": "Merhaba {name},",
  "intro": "Enneagram 360 pilot testini yaptığınız için teşekkürler. Sonucunuzun özeti:",
  "fType": "Tip",
  "fInst": "İçgüdüler",
  "fNow": "Şu an",
  "fDir": "Yön",
  "levelLine": "9 seviyenin {l}. seviyesi ({band})",
  "band": {
   "Healthy": "sağlıklı",
   "Average": "ortalama",
   "Unhealthy": "sağlıksız"
  },
  "dir": {
   "growth": "gelişim yönüne eğilimli",
   "stress": "stres yönüne eğilimli",
   "mixed": "her iki yönün işaretleri"
  },
  "cta": "Tam profilimi aç",
  "keep": "Buton, tüm görseller ve açıklamalarla birlikte tam profilinizi açar. Bu e-postayı saklayın; profilinize istediğiniz zaman geri dönebilirsiniz.",
  "newsAsk": "Enneagram 360 hakkında haber almak istediğinizi belirttiniz. Lütfen tek tıkla onaylayın:",
  "newsBtn": "Aboneliğimi onayla",
  "sign": "Sevgiyle,",
  "signer": "Anıl",
  "why": "Bu e-postayı Enneagram 360 testini yaptığınız ve profilinizi istediğiniz için aldınız.",
  "unsub": "Abonelikten çık",
  "privacy": "Gizlilik bildirimi",
  "pageConfirmed": "Teşekkürler, aboneliğiniz onaylandı.",
  "pageConfirmedSub": "Enneagram 360 hakkında ara sıra haber alacaksınız. İstediğiniz zaman abonelikten çıkabilirsiniz.",
  "pageUnsub": "Abonelikten çıktınız. Artık e-posta almayacaksınız.",
  "pageInvalid": "Bu bağlantı artık geçerli değil.",
  "backToSite": "Enneagram 360’a dön"
 },
 "de": {
  "subject": "Dein Enneagramm-360-Profil: Typ {t}w{w}, {name}",
  "hi": "Hallo,",
  "hiName": "Hallo {name},",
  "intro": "Danke, dass du am Enneagramm-360-Pilot teilgenommen hast. Hier ist eine Zusammenfassung deines Ergebnisses:",
  "fType": "Typ",
  "fInst": "Instinkte",
  "fNow": "Gerade jetzt",
  "fDir": "Richtung",
  "levelLine": "Stufe {l} von 9 ({band})",
  "band": {
   "Healthy": "gesund",
   "Average": "durchschnittlich",
   "Unhealthy": "ungesund"
  },
  "dir": {
   "growth": "Tendenz zum Wachstum",
   "stress": "Tendenz zum Stress",
   "mixed": "Anzeichen für beide Richtungen"
  },
  "cta": "Mein vollständiges Profil öffnen",
  "keep": "Der Button öffnet dein vollständiges Profil mit allen Grafiken und Erklärungen. Bewahre diese E-Mail auf, um jederzeit darauf zurückzukommen.",
  "newsAsk": "Du möchtest Neuigkeiten zu Enneagramm 360 erhalten. Bitte bestätige mit einem Klick:",
  "newsBtn": "Abo bestätigen",
  "sign": "Herzliche Grüße",
  "signer": "Anil",
  "why": "Du erhältst diese E-Mail, weil du den Enneagramm-360-Test gemacht und dein Profil angefordert hast.",
  "unsub": "Abmelden",
  "privacy": "Datenschutzerklärung",
  "pageConfirmed": "Danke, dein Abo ist bestätigt.",
  "pageConfirmedSub": "Du erhältst gelegentlich Neuigkeiten zu Enneagramm 360. Du kannst dich jederzeit abmelden.",
  "pageUnsub": "Du wurdest abgemeldet und erhältst keine weiteren E-Mails.",
  "pageInvalid": "Dieser Link ist nicht mehr gültig.",
  "backToSite": "Zurück zu Enneagramm 360"
 },
 "ro": {
  "subject": "Profilul tău Enneagram 360: Tipul {t}w{w}, {name}",
  "hi": "Bună,",
  "hiName": "Bună, {name},",
  "intro": "Mulțumim că ai făcut testul pilot Enneagram 360. Iată un rezumat al rezultatului tău:",
  "fType": "Tip",
  "fInst": "Instincte",
  "fNow": "Acum",
  "fDir": "Direcție",
  "levelLine": "Nivelul {l} din 9 ({band})",
  "band": {
   "Healthy": "sănătos",
   "Average": "mediu",
   "Unhealthy": "nesănătos"
  },
  "dir": {
   "growth": "înclinație spre creștere",
   "stress": "înclinație spre stres",
   "mixed": "semne din ambele direcții"
  },
  "cta": "Deschide profilul meu complet",
  "keep": "Butonul deschide profilul tău complet, cu toate imaginile și explicațiile. Păstrează acest e-mail ca să revii la el oricând.",
  "newsAsk": "Ai cerut să primești noutăți despre Enneagram 360. Te rog confirmă cu un clic:",
  "newsBtn": "Confirm abonarea",
  "sign": "Cu drag,",
  "signer": "Anil",
  "why": "Primești acest e-mail pentru că ai făcut testul Enneagram 360 și ai cerut profilul tău.",
  "unsub": "Dezabonare",
  "privacy": "Nota de confidențialitate",
  "pageConfirmed": "Mulțumim, abonarea ta este confirmată.",
  "pageConfirmedSub": "Vei primi din când în când noutăți despre Enneagram 360. Te poți dezabona oricând.",
  "pageUnsub": "Te-ai dezabonat. Nu vei mai primi e-mailuri.",
  "pageInvalid": "Acest link nu mai este valid.",
  "backToSite": "Înapoi la Enneagram 360"
 }
};

/* ---------- helpers ---------- */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold'); }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function safe_(v, max) {               // plain text, no formulas, no links, limited length
  let s = String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').replace(/https?:\/\/\S+|www\.\S+/gi, '').trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, max || 200);
}
function esc_(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function fmt_(s, o) { return String(s).replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m); }
function findRow_(col, value) {
  const sh = sheet_(); if (sh.getLastRow() < 2) return 0;
  const hit = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(value).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}

/* ---------- web endpoints ---------- */
function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true });                       // spam trap
    if (d.kind === 'feedback') return feedback_(d);
    if (d.kind === 'result') return result_(d);
    return json_({ ok: false, error: 'unknown' });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

function result_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const lang = TXT[d.lang] ? d.lang : 'en';
  const t = Number(d.t), w = Number(d.w), l = Number(d.l);
  const nbs = [t === 1 ? 9 : t - 1, t === 9 ? 1 : t + 1];
  if (!/^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(email) || email.length > 120) return json_({ ok: false, error: 'email' });
  if (d.consentProfile !== true) return json_({ ok: false, error: 'consent' });
  if (!(t >= 1 && t <= 9) || nbs.indexOf(w) < 0 || !(l >= 1 && l <= 9)) return json_({ ok: false, error: 'data' });
  if (!/^(sp|so|sx){3}$/.test(String(d.i)) || !/^E360-[A-Za-z0-9_-]{20,2000}$/.test(String(d.code)) || !/^[a-z0-9]{8,32}$/.test(String(d.id))) return json_({ ok: false, error: 'data' });
  const band = ['Healthy', 'Average', 'Unhealthy'].indexOf(d.b) >= 0 ? d.b : 'Average';
  const dir = ['growth', 'stress', 'mixed'].indexOf(d.dir) >= 0 ? d.dir : 'mixed';

  const cache = CacheService.getScriptCache();
  if (cache.get('m:' + email)) return json_({ ok: false, error: 'rate' });

  const name = safe_(d.name, 40);
  const token = Utilities.getUuid().replace(/-/g, '');
  const link = PAGE_URL + '#' + d.code;
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), d.id, lang, name, "'" + email, 'yes', d.consentNews ? 'pending' : 'no', '', t, t + 'w' + w,
      d.i.toUpperCase().match(/../g).join('/'), l, band, dir, safe_(d.c, 12), Number(d.s2) || '', Number(d.s3) || '',
      (Array.isArray(d.sc) ? d.sc.map(Number).join(' ') : ''), Number(d.g) || '', '', '', '', '', '', link, token]);
  } finally { lock.releaseLock(); }

  let mailed = false;
  if (MailApp.getRemainingDailyQuota() > KEEP_IN_RESERVE) {
    sendProfile_(email, lang, { name, t, w, stack: d.i.toUpperCase().match(/../g).join(' / '), l, band, dir, link, token, news: !!d.consentNews });
    cache.put('m:' + email, '1', MIN_MINUTES_BETWEEN_EMAILS * 60);
    mailed = true;
  }
  return json_({ ok: true, mailed });
}

function feedback_(d) {
  if (!/^[a-z0-9]{8,32}$/.test(String(d.id))) return json_({ ok: false, error: 'data' });
  const row = findRow_(COL['ID'], d.id); if (!row) return json_({ ok: false, error: 'notfound' });
  const sh = sheet_();
  const n = v => (Number(v) >= 1 && Number(v) <= 9) ? Number(v) : '';
  sh.getRange(row, COL['Own guess'], 1, 5).setValues([[n(d.gs), n(d.rh), (Number(d.acc) >= 1 && Number(d.acc) <= 5) ? Number(d.acc) : '', safe_(d.cm, 600), new Date()]]);
  return json_({ ok: true });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const tok = String(p.t || '');
  if (!/^[a-f0-9]{32}$/.test(tok) || ['confirm', 'unsub'].indexOf(p.a) < 0) return page_('en', 'Enneagram 360', '');
  const row = findRow_(COL['Token'], tok);
  if (!row) return page_('en', TXT.en.pageInvalid, '');
  const sh = sheet_();
  const lang = TXT[sh.getRange(row, COL['Language']).getValue()] ? sh.getRange(row, COL['Language']).getValue() : 'en';
  const X = TXT[lang];
  if (p.a === 'confirm') {
    sh.getRange(row, COL['Newsletter'], 1, 2).setValues([['confirmed', new Date()]]);
    return page_(lang, X.pageConfirmed, X.pageConfirmedSub);
  }
  sh.getRange(row, COL['Newsletter'], 1, 2).setValues([['unsubscribed', new Date()]]);
  sh.getRange(row, COL['Profile email']).setValue('unsubscribed');
  return page_(lang, X.pageUnsub, '');
}

function page_(lang, title, sub) {
  const html = '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Enneagram 360</title></head><body style="margin:0;background:#f3f4f2;font-family:system-ui,sans-serif;color:#1d2523">' +
    '<div style="max-width:520px;margin:12vh auto;padding:28px 24px;background:#fff;border:1px solid #d9dfdc;border-radius:16px;text-align:center">' +
    '<div style="font:600 13px monospace;letter-spacing:.14em;color:#1f5f5b;text-transform:uppercase">Enneagram 360</div>' +
    '<h1 style="font-family:Georgia,serif;font-size:26px;margin:14px 0 8px">' + esc_(title) + '</h1>' +
    (sub ? '<p style="color:#5d6b67;line-height:1.5">' + esc_(sub) + '</p>' : '') +
    '<p><a href="' + PAGE_URL + '" style="color:#1f5f5b">' + esc_(TXT[lang].backToSite) + '</a></p></div></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Enneagram 360').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ---------- the email ---------- */
function sendProfile_(to, lang, r) {
  const X = TXT[lang];
  const self = ScriptApp.getService().getUrl();
  const confirmUrl = self + '?a=confirm&t=' + r.token, unsubUrl = self + '?a=unsub&t=' + r.token;
  const tname = TYPE_NAMES[lang][r.t];
  const subject = fmt_(X.subject, { t: r.t, w: r.w, name: tname });
  const hi = r.name ? fmt_(X.hiName, { name: r.name }) : X.hi;
  const facts = [
    [X.fType, r.t + 'w' + r.w + ' · ' + tname],
    [X.fInst, r.stack],
    [X.fNow, fmt_(X.levelLine, { l: r.l, band: X.band[r.band] })],
    [X.fDir, X.dir[r.dir]]
  ];
  const btn = (url, label, bg) => '<a href="' + url + '" style="display:inline-block;background:' + bg + ';color:#ffffff;text-decoration:none;font-weight:600;padding:13px 24px;border-radius:999px">' + esc_(label) + '</a>';
  const html =
    '<div style="background:#f3f4f2;padding:24px 12px;font-family:Helvetica,Arial,sans-serif;color:#1d2523">' +
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9dfdc;border-radius:16px;overflow:hidden">' +
    '<div style="background:#1f5f5b;color:#ffffff;padding:22px 26px"><div style="font:600 12px monospace;letter-spacing:.14em;text-transform:uppercase;opacity:.85">Enneagram 360</div>' +
    '<div style="font-family:Georgia,serif;font-size:44px;line-height:1.1;margin-top:8px">' + r.t + '<span style="font-size:22px;opacity:.85"> w' + r.w + '</span></div>' +
    '<div style="font-family:Georgia,serif;font-size:22px;margin-top:4px">' + esc_(tname) + '</div></div>' +
    '<div style="padding:24px 26px;line-height:1.55;font-size:15px">' +
    '<p style="margin:0 0 12px">' + esc_(hi) + '</p><p style="margin:0 0 18px">' + esc_(X.intro) + '</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:0 0 20px;font-size:14px">' +
    facts.map(f => '<tr><td style="padding:8px 0;border-bottom:1px solid #e6ebe9;color:#5d6b67;width:40%">' + esc_(f[0]) + '</td><td style="padding:8px 0;border-bottom:1px solid #e6ebe9;font-weight:600">' + esc_(f[1]) + '</td></tr>').join('') +
    '</table><p style="text-align:center;margin:0 0 18px">' + btn(r.link, X.cta, '#1f5f5b') + '</p>' +
    '<p style="margin:0 0 18px;color:#5d6b67;font-size:14px">' + esc_(X.keep) + '</p>' +
    (r.news ? '<div style="background:#f5ecd9;border-radius:12px;padding:16px 18px;margin:0 0 18px"><p style="margin:0 0 12px">' + esc_(X.newsAsk) + '</p>' + btn(confirmUrl, X.newsBtn, '#9a6b1f') + '</div>' : '') +
    '<p style="margin:0">' + esc_(X.sign) + '<br>' + esc_(X.signer) + '</p></div>' +
    '<div style="padding:16px 26px;background:#f8f9f8;color:#7a8783;font-size:12px;line-height:1.5">' + esc_(X.why) + ' <a href="' + unsubUrl + '" style="color:#7a8783">' + esc_(X.unsub) + '</a> · <a href="' + PAGE_URL + 'privacy.html" style="color:#7a8783">' + esc_(X.privacy) + '</a></div>' +
    '</div></div>';
  const plain = [hi, '', X.intro, '', ...facts.map(f => f[0] + ': ' + f[1]), '', X.cta + ': ' + r.link, '', X.keep,
    ...(r.news ? ['', X.newsAsk, confirmUrl] : []), '', X.sign, X.signer, '', X.why, X.unsub + ': ' + unsubUrl].join('\n');
  MailApp.sendEmail({ to: to, subject: subject, body: plain, htmlBody: html, name: SENDER_NAME });
}

/* Run this once from the editor to check that sending works (it emails you a sample). */
function testEmailToMyself() {
  const me = Session.getActiveUser().getEmail();
  sendProfile_(me, 'en', { name: 'Anil', t: 8, w: 7, stack: 'SO / SX / SP', l: 4, band: 'Average', dir: 'growth', link: PAGE_URL, token: '0'.repeat(32), news: true });
}
