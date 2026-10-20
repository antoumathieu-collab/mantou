const API = "https://intervals.icu/api/v1";
const RUN = new Set(["Run","TrailRun","VirtualRun"]);
const json = (d, s=200) => new Response(JSON.stringify(d), {status:s, headers:{"content-type":"application/json","cache-control":"no-store"}});
export default async (req) => {
  if (req.method !== "POST") return json({error:"POST attendu"}, 405);
  if (!process.env.APP_KEY || req.headers.get("x-app-key") !== process.env.APP_KEY) return json({error:"Clé d'appli incorrecte"}, 403);
  const key = process.env.INTERVALS_API_KEY;
  if (!key) return json({error:"INTERVALS_API_KEY manquant dans Netlify"}, 500);
  let body = {}; try { body = await req.json(); } catch {}
  const day = s => new Date(s*1000).toISOString().slice(0,10);
  const H = {authorization:"Basic "+Buffer.from("API_KEY:"+key).toString("base64"), "user-agent":"Mozilla/5.0", accept:"application/json"};
  try {
    const r = await fetch(`${API}/athlete/0/activities?oldest=${day(+body.after||0)}&newest=${day(Date.now()/1000+86400)}`, {headers:H});
    if (!r.ok) throw new Error("intervals.icu "+r.status);
    const out = []; let n = 0;
    for (const a of await r.json()) {
      if (!a?.type || !(a.distance>0)) continue;
      const o = {id:a.id, name:a.name||a.type, type:a.type, date:a.start_date_local, dist:a.distance, time:a.moving_time||a.elapsed_time, dplus:a.total_elevation_gain||0, hr:a.average_heartrate||null, load:a.icu_training_load??null, laps:null};
      if (RUN.has(a.type) && o.time>=900 && n++<40) {
        const d = await fetch(`${API}/activity/${a.id}?intervals=true`, {headers:H});
        if (d.ok) o.laps = ((await d.json()).icu_intervals||[]).map(l => ({dist:l.distance, time:l.moving_time||l.elapsed_time, hr:l.average_heartrate||null, work:l.type==="WORK"}));
      }
      out.push(o);
    }
    /* Données de forme (VFC, FC repos, sommeil, poids, charge) : 60 jours minimum pour les moyennes de référence */
    let wellness = [];
    try {
      const wOld = day(Math.min(+body.after||0, Date.now()/1000-60*86400));
      const w = await fetch(`${API}/athlete/0/wellness?oldest=${wOld}&newest=${day(Date.now()/1000+86400)}`, {headers:H});
      if (w.ok) wellness = (await w.json()).map(x => ({date:x.id, hrv:x.hrv??null, rhr:x.restingHR??null,
        sleepSecs:x.sleepSecs??(x.sleepTime!=null?(x.sleepTime>24?x.sleepTime:x.sleepTime*3600):null), sleepScore:x.sleepScore??null,
        weight:x.weight??null, ctl:x.ctl??null, atl:x.atl??null}));
    } catch {}
    return json({activities:out, wellness});
  } catch (e) { return json({error:e.message}, 502); }
};
export const config = { path: "/api/sync" };
