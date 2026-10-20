/* Logique commune des fonctions (testable sans Netlify : store et fetch injectés) */
import SCORE from "../../../src/score.js";
export const API = "https://intervals.icu/api/v1";
export const json = (d, s=200) => new Response(JSON.stringify(d), {status:s, headers:{"content-type":"application/json","cache-control":"no-store"}});
export const parisDay = (d=new Date()) => new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris"}).format(d);
export const authOk = (req, env) => { const k = req.headers.get("x-app-key") || new URL(req.url).searchParams.get("key"); return !!env.APP_KEY && k === env.APP_KEY; };
export const headers = key => ({authorization:"Basic "+Buffer.from("API_KEY:"+key).toString("base64"), "user-agent":"Mozilla/5.0", accept:"application/json"});
export async function wellness(env, oldest, newest, f=fetch){
  if(!env.INTERVALS_API_KEY) return [];
  try{
    const w = await f(`${API}/athlete/0/wellness?oldest=${oldest}&newest=${newest}`, {headers:headers(env.INTERVALS_API_KEY)});
    if(!w.ok) return [];
    return (await w.json()).map(x => ({date:x.id, hrv:x.hrv??null, rhr:x.restingHR??null,
      sleepSecs:x.sleepSecs??(x.sleepTime!=null?(x.sleepTime>24?x.sleepTime:x.sleepTime*3600):null), sleepScore:x.sleepScore??null,
      weight:x.weight??null, ctl:x.ctl??null, atl:x.atl??null}));
  }catch{ return []; }
}
export async function scoreFor(date, env, store, f=fetch){
  const ans = await store.get("ans/"+date, {type:"json"}) || null;
  const well = await wellness(env, SCORE.shift(date,-8), date, f);
  return Object.assign(SCORE.compute({date, ans, well}), {ans});
}
export async function answers(store, from){
  const out = {};
  const {blobs} = await store.list({prefix:"ans/"});
  for(const b of blobs){ const d = b.key.slice(4); if(d>=from){ out[d] = await store.get(b.key,{type:"json"}); } }
  return out;
}
/* /api/well */
export async function handleWell(req, env, store, f=fetch){
  if(!authOk(req, env)) return json({error:"Clé d'appli incorrecte"}, 403);
  if(req.method === "POST"){
    let b = {}; try{ b = await req.json(); }catch{}
    const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date||"") ? b.date : parisDay();
    const legs = Math.round(+b.legs), pain = Math.round(+b.pain);
    if(!(legs>=1 && legs<=5) || !(pain>=0 && pain<=3)) return json({error:"legs 1-5 et pain 0-3 attendus"}, 400);
    const ans = {legs, pain, at:Date.now()};
    if(b.sleep!=null && +b.sleep>=1 && +b.sleep<=5) ans.sleep = Math.round(+b.sleep);
    await store.setJSON("ans/"+date, ans);
    return json(await scoreFor(date, env, store, f));
  }
  const url = new URL(req.url); const date = url.searchParams.get("date") || parisDay();
  return json(await scoreFor(date, env, store, f));
}
/* /api/ics : l'appli envoie son calendrier */
export async function handleIcsUpload(req, env, store){
  if(req.method !== "POST") return json({error:"POST attendu"}, 405);
  if(!authOk(req, env)) return json({error:"Clé d'appli incorrecte"}, 403);
  const t = await req.text();
  if(!t.startsWith("BEGIN:VCALENDAR") || t.length > 3_000_000) return json({error:"Calendrier invalide"}, 400);
  await store.set("plan.ics", t);
  return json({ok:true, bytes:t.length});
}
/* /plan.ics : calendrier public, séance du jour adaptée à la forme */
export async function handlePlan(req, env, store, f=fetch){
  let ics = await store.get("plan.ics");
  if(!ics){ return new Response(null, {status:302, headers:{location:"/calendrier-courses.ics"}}); }
  try{ const d = parisDay(); const res = await scoreFor(d, env, store, f); if(res.ans || res.level!=="vert") ics = SCORE.adaptIcs(ics, d, res); }catch{}
  return new Response(ics, {headers:{"content-type":"text/calendar; charset=utf-8","cache-control":"no-cache, max-age=0"}});
}
