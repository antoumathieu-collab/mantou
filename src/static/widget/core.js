// CAPIRONMAN_CORE — module du widget Prépa Diag pour Scriptable (téléchargé automatiquement par le chargeur)
const MARK = "CAPIRONMAN_CORE";
const KEY_NAME = "prepa_diag_app_key";
const C = { bg: Color.dynamic(new Color("#f3f5f1"), new Color("#141a17")), ink: Color.dynamic(new Color("#1d2621"), new Color("#e6ece8")),
  muted: Color.dynamic(new Color("#5d6b63"), new Color("#9aa9a0")), accent: Color.dynamic(new Color("#2f6b4f"), new Color("#6fc298")),
  warn: Color.dynamic(new Color("#b8741f"), new Color("#e0a050")), bad: Color.dynamic(new Color("#b4532a"), new Color("#e48a5f")),
  chip: Color.dynamic(new Color("#e3e8e4"), new Color("#26302b")), onColor: Color.dynamic(new Color("#ffffff"), new Color("#141a17")),
  goodBg: Color.dynamic(new Color("#e1efe7"), new Color("#1a2a22")), warnBg: Color.dynamic(new Color("#f6ead8"), new Color("#2c241a")), badBg: Color.dynamic(new Color("#f6e1d8"), new Color("#2e1d17")) };

function parisDay(offset) {
  const d = new Date(Date.now() + (offset || 0) * 864e5);
  const f = new DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f.string(d);
}
function unesc(t) { return String(t).replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\;/g, ";").replace(/\\\\/g, "\\"); }
function parseIcs(ics) {
  const lines = ics.replace(/\r?\n[ \t]/g, "").split(/\r?\n/); const evs = []; let ev = null;
  for (const l of lines) {
    if (l === "BEGIN:VEVENT") { ev = {}; continue; }
    if (l === "END:VEVENT") { if (ev) evs.push(ev); ev = null; continue; }
    if (!ev) continue;
    const i = l.indexOf(":"); if (i < 0) continue;
    const k = l.slice(0, i).split(";")[0]; ev[k] = unesc(l.slice(i + 1));
  }
  return evs.map(e => ({ date: (e.DTSTART || "").replace(/(\d{4})(\d{2})(\d{2}).*/, "$1-$2-$3"), summary: e.SUMMARY || "", desc: e.DESCRIPTION || "", kind: e["X-PREPA-KIND"] || "", title: e["X-PREPA-TITLE"] || "" }));
}
function dayInfo(evs, date) {
  const list = evs.filter(e => e.date === date);
  if (!list.length) return null;
  const main = list.find(e => e.kind !== "gym") || list[0];
  const lines = main.desc.split("\n");
  const nutri = lines.find(l => l.startsWith("🍌 Nutrition")) || "";
  const detail = lines.slice(1).find(l => l && !/^(🍌|💪|- |Avant|Après|Prévu)/.test(l)) || "";
  const gym = list.some(e => e.kind === "gym") && main.kind !== "gym";
  const exStart = lines.findIndex(l => l.startsWith("💪 Exercices"));
  const ex = exStart >= 0 ? lines.slice(exStart + 1).filter(l => l.startsWith("- ")).map(l => l.slice(2).replace(/ : /, " ")) : [];
  return { ex, title: main.summary.replace(/^(🏃|⚡|💪|🏁)\s*/, ""), detail, nutri: nutri.replace(/^🍌 Nutrition(\s*\([^)]*\))?\s*:\s*/, "🍌 "), gym, adapted: /^(⚠️|🔴|🩹)/.test(main.summary) };
}
async function getKey(ask) {
  if (Keychain.contains(KEY_NAME)) return Keychain.get(KEY_NAME);
  if (!ask) return null;
  const a = new Alert(); a.title = "Clé de l'appli"; a.message = "Tape le mot de passe APP_KEY choisi dans Netlify. Il est gardé dans le trousseau de l'iPhone.";
  a.addSecureTextField("APP_KEY", ""); a.addAction("OK"); a.addCancelAction("Annuler");
  if (await a.present() === -1) return null;
  const k = a.textFieldValue(0).trim(); if (k) Keychain.set(KEY_NAME, k); return k || null;
}
async function loadPlan(base) {
  const fm = FileManager.local(); const p = fm.joinPath(fm.documentsDirectory(), "prepa-diag-plan.ics");
  try { const r = new Request(base + "/plan.ics?days=3"); r.timeoutInterval = 15; const t = await r.loadString(); if (t.startsWith("BEGIN:VCALENDAR")) { fm.writeString(p, t); return { ics: t, offline: false }; } } catch (e) {}
  return { ics: fm.fileExists(p) ? fm.readString(p) : "", offline: true };
}
async function loadWell(base, key) {
  if (!key) return null;
  try { const r = new Request(base + "/api/well?date=" + parisDay()); r.headers = { "x-app-key": key }; r.timeoutInterval = 15; const j = await r.loadJSON(); return j && j.score != null ? j : null; } catch (e) { return null; }
}
function pill(w) {
  if (!w) return "⚪ –";
  return (w.level === "vert" ? "🟢 " : w.level === "orange" ? "🟠 " : "🔴 ") + w.score;
}
function footer(w, info) {
  if (!w || !w.answered) return "📝 Forme du jour à remplir";
  if (w.pain >= 2) return "🩹 Douleur : pas de course";
  if (w.level === "rouge") return "🔴 Séance remplacée";
  if (w.level === "orange") return "⚠️ Séance allégée";
  return info ? "✅ Comme prévu" : "✅ Bonne forme";
}
function levelColor(w) { return !w ? C.muted : w.level === "rouge" ? C.bad : w.level === "orange" ? C.warn : C.accent; }
function addText(st, t, size, color, bold, lines) {
  const x = st.addText(t); x.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size); x.textColor = color; if (lines) x.lineLimit = lines; x.minimumScaleFactor = 0.8; return x;
}
function split(info) {
  if (!info) return { name: "Repos", dur: "" };
  const m = info.title.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  return m ? { name: m[1], dur: m[2] } : { name: info.title, dur: "" };
}
function chip(st, t, color) {
  const c = st.addStack(); c.backgroundColor = C.chip; c.cornerRadius = 6; c.setPadding(2, 6, 2, 6);
  addText(c, t, 10, color || C.ink, true, 1); return c;
}
function gradient(w) {
  const g = new LinearGradient(); g.locations = [0, 1];
  const tint = !w ? C.bg : w.level === "rouge" ? C.badBg : w.level === "orange" ? C.warnBg : C.goodBg;
  g.colors = [tint, C.bg]; return g;
}
function addSession(w, info, small, showEx) {
  const s = split(info);
  addText(w, s.name, small ? 14 : 17, C.ink, true, small ? 3 : 2);
  if (!info) return;
  const row = w.addStack(); row.layoutHorizontally(); row.spacing = 4;
  if (s.dur) chip(row, "⏱ " + s.dur);
  if (info.gym) chip(row, "💪 + salle");
  if (!small && info.detail) { w.addSpacer(3); addText(w, info.detail, 11, C.muted, false, 2); }
  if (showEx && info.ex && info.ex.length) { w.addSpacer(3); info.ex.slice(0, 5).forEach(e => addText(w, "• " + e, 10, C.muted, false, 1)); }
  if (info.nutri) { w.addSpacer(3); addText(w, info.nutri, small ? 10 : 11, C.accent, true, 2); }
}
async function buildWidget(base, key) {
  const fam = config.widgetFamily || "medium";
  const [{ ics, offline }, well] = await Promise.all([loadPlan(base), loadWell(base, key)]);
  const evs = ics ? parseIcs(ics) : [];
  const today = dayInfo(evs, parisDay()), tomorrow = dayInfo(evs, parisDay(1));
  const w = new ListWidget(); w.url = base + "/"; w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
  const s = split(today);
  /* écran verrouillé */
  if (fam === "accessoryInline") { addText(w, pill(well) + " · " + s.name + (s.dur ? " " + s.dur : ""), 12, C.ink, false, 1); return w; }
  if (fam === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true; const st = w.addStack(); st.layoutVertically(); st.centerAlignContent();
    addText(st, well ? String(well.score) : "–", 20, C.ink, true, 1); addText(st, "forme", 9, C.ink, false, 1); return w;
  }
  if (fam === "accessoryRectangular") {
    addText(w, pill(well) + "  " + (s.dur || ""), 11, C.ink, true, 1); addText(w, s.name, 13, C.ink, true, 1);
    if (today && today.nutri) addText(w, today.nutri, 10, C.ink, false, 1); return w;
  }
  /* écran d'accueil */
  w.backgroundGradient = gradient(well); w.setPadding(12, 14, 10, 14);
  const top = w.addStack(); top.layoutHorizontally(); top.centerAlignContent();
  const df = new DateFormatter(); df.locale = "fr_FR"; df.dateFormat = fam === "small" ? "EEE d" : "EEEE d MMMM";
  addText(top, df.string(new Date()).toUpperCase(), 10, C.muted, true, 1); top.addSpacer();
  const b = top.addStack(); b.backgroundColor = levelColor(well); b.cornerRadius = 9; b.setPadding(2, 7, 2, 7);
  addText(b, (well ? well.score : "–") + "", 12, C.onColor, true, 1);
  w.addSpacer(6);
  addSession(w, today, fam === "small", fam === "large");
  if (fam === "large") {
    w.addSpacer(10);
    const sep = w.addStack(); sep.backgroundColor = C.chip; sep.size = new Size(0, 1); w.addSpacer(8);
    addText(w, "DEMAIN", 10, C.muted, true, 1); w.addSpacer(2);
    const t = split(tomorrow); addText(w, t.name + (t.dur ? " · " + t.dur : ""), 13, C.ink, true, 2);
    if (tomorrow && tomorrow.nutri) addText(w, tomorrow.nutri, 10, C.accent, false, 1);
  }
  w.addSpacer();
  addText(w, footer(well, today) + (offline ? " · hors ligne" : ""), 10, levelColor(well), true, 1);
  return w;
}
async function ask(title, opts) {
  const a = new Alert(); a.title = title; opts.forEach(o => a.addAction(o)); a.addCancelAction("Annuler");
  return await a.presentSheet();
}
async function questionnaire(base) {
  const key = await getKey(true); if (!key) return;
  const cur = await loadWell(base, key);
  const legs = await ask("Jambes ?", ["1 · Très lourdes", "2 · Lourdes", "3 · Normales", "4 · Bonnes", "5 · Fraîches"]); if (legs < 0) return;
  const pain = await ask("Douleur ?", ["0 · Aucune", "1 · Légère", "2 · Gênante", "3 · Forte"]); if (pain < 0) return;
  const body = { date: parisDay(), legs: legs + 1, pain };
  const watchSleep = cur && (cur.sleepH || cur.sleepScore);
  if (!watchSleep) { const s = await ask("Sommeil ?", ["1 · Très mauvais", "2 · Mauvais", "3 · Moyen", "4 · Bon", "5 · Excellent"]); if (s < 0) return; body.sleep = s + 1; }
  let res = null, err = null;
  try { const r = new Request(base + "/api/well"); r.method = "POST"; r.headers = { "content-type": "application/json", "x-app-key": key }; r.body = JSON.stringify(body); res = await r.loadJSON(); if (res.error) { err = res.error; res = null; } } catch (e) { err = String(e); }
  const a = new Alert();
  if (!res) { a.title = "Échec"; a.message = (err || "Pas de réponse") + (/incorrecte/.test(err || "") ? "\nLa clé sera redemandée au prochain lancement." : ""); if (/incorrecte/.test(err || "")) Keychain.remove(KEY_NAME); }
  else { a.title = pill(res) + "/100 · " + (res.level === "vert" ? "Feu vert" : res.level === "orange" ? "Forme moyenne" : "Récupération"); a.message = footer(res, true) + (res.reasons && res.reasons.length ? "\n" + res.reasons.join("\n") : ""); }
  a.addAction("OK"); await a.present();
}
module.exports.MARK = MARK;
module.exports.main = async (base) => {
  base = (base || "").replace(/\/$/, "");
  if (config.runsInWidget) { const key = await getKey(false); Script.setWidget(await buildWidget(base, key)); Script.complete(); return; }
  await questionnaire(base);
  const key = await getKey(false); const w = await buildWidget(base, key);
  await w.presentLarge(); Script.complete();
};
