// CAPIRONMAN_CORE — module du widget Prépa Diag pour Scriptable (téléchargé automatiquement par le chargeur)
const MARK = "CAPIRONMAN_CORE";
const KEY_NAME = "prepa_diag_app_key";
const C = { bg: Color.dynamic(new Color("#f3f5f1"), new Color("#141a17")), ink: Color.dynamic(new Color("#1d2621"), new Color("#e6ece8")),
  muted: Color.dynamic(new Color("#5d6b63"), new Color("#9aa9a0")), accent: Color.dynamic(new Color("#2f6b4f"), new Color("#6fc298")),
  warn: Color.dynamic(new Color("#b8741f"), new Color("#e0a050")), bad: Color.dynamic(new Color("#b4532a"), new Color("#e48a5f")) };

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
  const detail = lines.slice(1).find(l => l && !l.startsWith("🍌") && !l.startsWith("Avant") && !l.startsWith("Après")) || "";
  const gym = list.some(e => e.kind === "gym") && main.kind !== "gym";
  return { title: main.summary, detail, nutri: nutri.replace(/^🍌 Nutrition(\s*\([^)]*\))?\s*:\s*/, "🍌 "), gym, adapted: /^(⚠️|🔴|🩹)/.test(main.summary) };
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
  try { const r = new Request(base + "/plan.ics"); r.timeoutInterval = 15; const t = await r.loadString(); if (t.startsWith("BEGIN:VCALENDAR")) { fm.writeString(p, t); return { ics: t, offline: false }; } } catch (e) {}
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
  if (w.pain >= 2) return "🩹 Douleur : pas de course aujourd'hui";
  if (w.level === "rouge") return "🔴 Séance remplacée : très facile ou repos";
  if (w.level === "orange") return "⚠️ Séance allégée";
  return info ? "✅ Séance comme prévue" : "✅ Bonne forme";
}
function addText(st, t, size, color, bold, lines) {
  const x = st.addText(t); x.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size); x.textColor = color; if (lines) x.lineLimit = lines; return x;
}
function addDay(w, info, label, small) {
  if (label) addText(w, label, 10, C.muted, true, 1);
  if (!info) { addText(w, "Repos", small ? 13 : 15, C.ink, true, 1); return; }
  addText(w, info.title, small ? 13 : 15, C.ink, true, 2);
  if (!small && info.detail) addText(w, info.detail, 11, C.muted, false, 2);
  if (info.gym) addText(w, "💪 + salle", 11, C.ink, false, 1);
  if (info.nutri) addText(w, info.nutri, 11, C.accent, false, small ? 2 : 2);
}
async function buildWidget(base, key) {
  const fam = config.widgetFamily || "medium";
  const [{ ics, offline }, well] = await Promise.all([loadPlan(base), loadWell(base, key)]);
  const evs = ics ? parseIcs(ics) : [];
  const today = dayInfo(evs, parisDay()), tomorrow = dayInfo(evs, parisDay(1));
  const w = new ListWidget(); w.backgroundColor = C.bg; w.url = base + "/"; w.setPadding(12, 14, 12, 14);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  const top = w.addStack(); top.layoutHorizontally(); top.centerAlignContent();
  const df = new DateFormatter(); df.locale = "fr_FR"; df.dateFormat = fam === "small" ? "EEE d" : "EEEE d MMMM";
  addText(top, df.string(new Date()), 11, C.muted, true, 1); top.addSpacer();
  addText(top, pill(well), 13, well && well.level === "rouge" ? C.bad : well && well.level === "orange" ? C.warn : C.accent, true, 1);
  w.addSpacer(6);
  addDay(w, today, null, fam === "small");
  if (fam === "large") { w.addSpacer(10); addDay(w, tomorrow, "DEMAIN", false); }
  w.addSpacer();
  addText(w, footer(well, today) + (offline ? " · hors ligne" : ""), 10, well && well.level !== "vert" ? C.warn : C.muted, false, 1);
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
  await w.presentMedium(); Script.complete();
};
