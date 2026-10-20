// Prépa Diag — chargeur du widget (à coller UNE seule fois dans Scriptable)
// Il télécharge la dernière version du widget (au plus toutes les 12 h) : rien à recoller lors des mises à jour.
const BASE = "https://gleeful-heliotrope-4d5314.netlify.app";
const NAME = "prepa-diag-core";
const fm = module.filename.includes("Mobile Documents") ? FileManager.iCloud() : FileManager.local();
const dir = module.filename.replace(/\/[^\/]*$/, "");
const path = fm.joinPath(dir, NAME + ".js");
// Mise à jour du widget au plus toutes les 12 h (ou à chaque lancement manuel) : moins de requêtes, moins de crédits Netlify.
const fresh = fm.fileExists(path) && (Date.now() - fm.modificationDate(path).getTime() < 12 * 3600 * 1000);
if (!fresh || !config.runsInWidget) try {
  const req = new Request(BASE + "/widget/core.js?t=" + Date.now()); req.timeoutInterval = 15;
  const code = await req.loadString();
  if (code.includes("CAPIRONMAN_CORE")) fm.writeString(path, code);
} catch (e) { /* hors ligne : on garde la version déjà téléchargée */ }
if (fm.isFileStoredIniCloud && fm.isFileStoredIniCloud(path) && !fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path);
if (!fm.fileExists(path)) throw new Error("Widget pas encore téléchargé : lance le script une fois avec du réseau.");
await importModule(NAME).main(BASE);
