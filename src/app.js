/* ---------- Appli : état, stockage ---------- */
const {parse,iso,addDays,MONTHS,DAYS,SITE,RACES,COURSES,PACKS,CHECK}=PLAN;
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
  json(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},setJson(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let site=store.get("site","t")==="p"?"p":"t";
let mode=store.get("mode","race")==="base"?"base":"race";
let logs=store.json("logs",{});
let weights=store.json("weights",[]);
const HEIGHT=1.79;
if(store.get("seeded","")!=="2"){
  if(logs["2026-10-18"]&&logs["2026-10-18"].free){delete logs["2026-10-18"]}
  if(!logs["2026-10-18~odos"]) logs["2026-10-18~odos"]={done:true,sport:"trail",pace:306,dist:13.04,dplus:256,free:true,title:"Odos (sortie libre)"};
  if(!logs["2026-10-18~aureilhan"]) logs["2026-10-18~aureilhan"]={done:true,sport:"route",pace:250,dist:5.81,dplus:2,rpe:9,free:true,title:"Aureilhan 5,8 km (date à vérifier)"};
  if(!logs["2026-10-03~10k"]) logs["2026-10-03~10k"]={done:true,sport:"route",pace:276,dist:10,dplus:0,rpe:9,free:true,title:"10 km en 46 min (début octobre, date approximative)"};
  if(!weights.length) weights=[{d:"2026-10-20",kg:86}];
  store.setJson("logs",logs);store.setJson("weights",weights);store.set("seeded","2");
}
const kd=k=>parse(k.slice(0,10));
/* ---------- Courses : conseillées (modifiables) + ajoutées ---------- */
const RACE_INFO={"2026-11-08":{dist:30,dplus:900,terrain:"roulant",est:true},"2026-12-06":{dist:10,dplus:0,terrain:"route"},"2027-01-24":{dist:32,dplus:900,terrain:"roulant",est:true},
 "2027-02-21":{dist:33.5,dplus:1000,terrain:"roulant",est:true},"2027-03-21":{dist:42,dplus:1600,terrain:"roulant",est:true},"2027-04-18":{dist:31,dplus:1500,terrain:"montagne",est:true},
 "2027-06-10":{dist:79,dplus:3900,terrain:"montagne"},"2027-07-10":{dist:32,dplus:2100,terrain:"montagne"},"2027-10-17":{dist:80.4,dplus:3443,terrain:"montagne"}};
let raceEdits=store.json("raceEdits",{});
let userRaces=store.json("userRaces",[]);
const saveRaces=()=>{store.setJson("raceEdits",raceEdits);store.setJson("userRaces",userRaces)};
function raceInfo(date){const u=userRaces.find(r=>r.date===date);if(u)return Object.assign({user:true},u);
  const r=RACES.find(x=>x[0]===date);if(!r)return null;return Object.assign({date,name:r[1],est:false},RACE_INFO[date]||{dist:null,dplus:0,terrain:"roulant"},raceEdits[date]||{})}
function allRaceInfos(){return RACES.map(r=>raceInfo(r[0])).concat(userRaces.map(u=>Object.assign({user:true},u))).sort((a,b)=>a.date<b.date?-1:1)}
const saveLogs=()=>store.setJson("logs",logs);
const saveWeights=()=>store.setJson("weights",weights);
const ctx=()=>({mode,site,hidden:Object.keys(raceEdits).filter(k=>raceEdits[k].hidden),
  extra:userRaces.map(u=>[u.date,u.name,(u.dist?String(u.dist).replace(".",",")+" km"+(u.dplus?", "+u.dplus+" m D+":""):"")+" · "+PREDICT.TERRAINS[u.terrain||"roulant"].name+". Ta course ajoutée.",(u.dist||0)>=30,false])});
const now=new Date();const TODAY=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()));
const fmtDate=d=>DAYS[(d.getUTCDay()+6)%7]+" "+d.getUTCDate()+" "+MONTHS[d.getUTCMonth()]+" "+d.getUTCFullYear();
const MABR=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const shortDate=d=>d.getUTCDate()+" "+MABR[d.getUTCMonth()];
const fmtPace=sec=>{sec=Math.round(sec);return Math.floor(sec/60)+"'"+String(sec%60).padStart(2,"0")};
const fr=(x,d=1)=>x.toFixed(d).replace(".",",");
const el=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==="class")e.className=v;else if(k==="text")e.textContent=v;else if(k.startsWith("on"))e[k]=v;else if(v!==false&&v!=null)e.setAttribute(k,v)}for(const c of kids)if(c!=null)e.append(c);return e};
const latestWeight=()=>{const w=[...weights].sort((a,b)=>a.d<b.d?-1:1);return w.length?w.at(-1).kg:86};

/* ---------- Saisie d'une séance : case + molette de vitesse ---------- */
function opts(sel,from,to,step,fmt,val){sel.innerHTML="";for(let v=from;v<=to+1e-9;v+=step){const o=el("option",{value:String(v),text:fmt(v)});sel.append(o)}sel.value=String(val)}
function lastPace(sport){const ks=Object.keys(logs).filter(k=>!k.includes("~")).filter(k=>logs[k].sport===sport&&logs[k].pace).sort();return ks.length?logs[ks.at(-1)].pace:null}
function logWidget(date,s){
  const k=iso(date);const isRun=s.run;const isGym=s.kind==="gym";
  if(!isRun&&!isGym)return null;
  const cur=logs[k]||{};
  const box=el("div",{class:"log"});
  const status=el("span",{class:"saved","aria-live":"polite"});
  const flash=t=>{status.textContent=t;clearTimeout(status._t);status._t=setTimeout(()=>status.textContent="",1800)};
  const save=(patch,msg)=>{logs[k]=Object.assign({},logs[k]||{title:s.title},patch);saveLogs();flash(msg||"Enregistré");};
  const cb=el("input",{type:"checkbox",id:"done-"+k});cb.checked=!!cur.done;
  cb.onchange=()=>{save({done:cb.checked,title:s.title},cb.checked?"Séance validée":"Validation retirée");if(cb.checked&&isRun&&!logs[k].pace)save({pace:wheelPace(),sport:sport},"Séance validée")};
  box.append(el("label",{class:"done",for:"done-"+k},cb,el("span",{text:"Séance faite"})),status);
  if(isGym){box.append(gymWidget(k,s,()=>{cb.checked=!!(logs[k]&&logs[k].done);flash("Enregistré")}));return box}
  if(!isRun)return box;
  let sport=cur.sport||s.sport, unit=store.get("unit-"+sport,"minkm");
  let pace=cur.pace||lastPace(sport)||s.refPace;
  const sportSeg=el("div",{class:"seg small-seg",role:"group","aria-label":"Type de terrain"});
  const unitSeg=el("div",{class:"seg small-seg",role:"group","aria-label":"Unité de vitesse"});
  const a=el("select",{"aria-label":"Minutes ou km/h"}),b=el("select",{"aria-label":"Secondes ou dixièmes"});
  const suffix=el("span",{class:"unit"});
  const wheel=el("div",{class:"wheel"},a,el("span",{class:"sep"}),b,suffix);
  const eq=el("span",{class:"small"});
  function wheelPace(){if(unit==="minkm")return (+a.value)*60+(+b.value);const kmh=(+a.value)+(+b.value)/10;return kmh?3600/kmh:pace}
  function drawWheel(){
    if(unit==="minkm"){opts(a,2,15,1,v=>String(v),Math.min(15,Math.max(2,Math.floor(pace/60))));opts(b,0,59,1,v=>String(v).padStart(2,"0"),Math.round(pace%60)%60);wheel.querySelector(".sep").textContent="'";suffix.textContent="/km"}
    else{const kmh=3600/pace;opts(a,2,25,1,v=>String(v),Math.min(25,Math.max(2,Math.floor(kmh))));opts(b,0,9,1,v=>String(v),Math.round((kmh%1)*10)%10);wheel.querySelector(".sep").textContent=",";suffix.textContent="km/h"}
    eq.textContent="= "+(unit==="minkm"?fr(3600/pace)+" km/h":fmtPace(pace)+"/km");
    [...sportSeg.children].forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===sport));
    [...unitSeg.children].forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===unit));
  }
  [["route","Route"],["trail","Trail"]].forEach(([v,t])=>sportSeg.append(el("button",{type:"button","data-v":v,text:t,onclick:()=>{sport=v;unit=store.get("unit-"+sport,"minkm");drawWheel();if(logs[k]&&logs[k].done)save({sport})}})));
  [["minkm","min/km"],["kmh","km/h"]].forEach(([v,t])=>unitSeg.append(el("button",{type:"button","data-v":v,text:t,onclick:()=>{unit=v;store.set("unit-"+sport,v);drawWheel()}})));
  const onWheel=()=>{pace=wheelPace();cb.checked=true;save({pace:Math.round(pace),sport,done:true,title:s.title},"Vitesse enregistrée");drawWheel()};
  a.onchange=onWheel;b.onchange=onWheel;
  const dist=el("input",{type:"number",inputmode:"decimal",step:"0.01",min:"0",placeholder:"km",id:"dist-"+k,value:cur.dist??""});
  const dplus=el("input",{type:"number",inputmode:"numeric",step:"10",min:"0",placeholder:"m",id:"dplus-"+k,value:cur.dplus??""});
  const rpe=el("select",{id:"rpe-"+k});rpe.append(el("option",{value:"",text:"—"}));for(let i=1;i<=10;i++)rpe.append(el("option",{value:String(i),text:String(i)}));rpe.value=cur.rpe?String(cur.rpe):"";
  const num=v=>v===""?null:+v;
  dist.onchange=()=>save({dist:num(dist.value)});dplus.onchange=()=>save({dplus:num(dplus.value)});rpe.onchange=()=>save({rpe:num(rpe.value)});
  const det=el("details",{class:"more"},el("summary",{text:"Distance, D+ et ressenti (facultatif)"}),
    el("div",{class:"fields"},
      el("label",{for:"dist-"+k},el("span",{text:"Distance (km)"}),dist),
      el("label",{for:"dplus-"+k},el("span",{text:"D+ (m)"}),dplus),
      el("label",{for:"rpe-"+k},el("span",{text:"Ressenti (1-10)"}),rpe)),
    el("p",{class:"small",text:"Ressenti 8 à 10 = effort à fond : avec la distance, la séance sert de référence pour tes temps théoriques."}));
  box.append(el("div",{class:"logrow"},el("span",{class:"lbl",text:"Vitesse moyenne"}),sportSeg,unitSeg),el("div",{class:"logrow"},wheel,eq),det);
  drawWheel();
  return box;
}


/* ---------- Musculation : exercices, cibles et saisie ---------- */
const GYM={
  A:[{id:"squat",name:"Squat (barre ou goblet)",sets:4,lo:6,hi:8,unit:"rép",start:40,inc:2.5,tip:"Descente en 3 s"},
     {id:"bulgare",name:"Fente bulgare",sets:3,lo:8,hi:8,unit:"rép/jambe",start:16,inc:2,tip:"Charge = total des 2 haltères"},
     {id:"stepup",name:"Step-up lesté",sets:3,lo:10,hi:10,unit:"rép/jambe",start:16,inc:2,tip:"Box à hauteur du genou, total des 2 haltères"},
     {id:"sdtr",name:"Soulevé de terre roumain",sets:3,lo:8,hi:8,unit:"rép",start:40,inc:2.5,tip:"Dos plat"},
     {id:"excentrique",name:"Descente de marche excentrique",sets:3,lo:10,hi:10,unit:"rép/jambe",start:0,inc:2,tip:"4 s pour descendre ; 0 kg = poids du corps"},
     {id:"mollets",name:"Mollets à une jambe (tendue + fléchie)",sets:3,lo:12,hi:15,unit:"rép/jambe",start:0,inc:2,tip:"0 kg = poids du corps"}],
  B:[{id:"planche",name:"Planche ventrale",sets:3,lo:45,hi:60,unit:"s",start:0,inc:0,tip:"Bassin neutre"},
     {id:"planchelat",name:"Planche latérale",sets:3,lo:30,hi:45,unit:"s/côté",start:0,inc:0,tip:"Hanche haute"},
     {id:"deadbug",name:"Dead bug",sets:3,lo:10,hi:10,unit:"rép/côté",start:0,inc:0,tip:"Lombaires collées au sol"},
     {id:"rowing",name:"Rowing haltère",sets:3,lo:10,hi:12,unit:"rép/bras",start:16,inc:2,tip:"Charge d'un haltère"},
     {id:"pompes",name:"Pompes",sets:3,lo:8,hi:20,unit:"rép",start:0,inc:0,tip:"Max propre"},
     {id:"pont",name:"Pont fessier à une jambe",sets:3,lo:12,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"Fessier, pas les lombaires"}]
};
const GYM_ALL=[...GYM.A,...GYM.B];
const LIGHT_A=["squat","stepup","mollets"];
function gymPlan(s){const type=/Salle B/.test(s.title)?"B":"A";const light=/60 %/.test(s.text);
  let ex=GYM[type];if(light&&type==="A")ex=ex.filter(e=>LIGHT_A.includes(e.id));return{type,light,ex}}
function lastGym(id,beforeKey){const ks=Object.keys(logs).filter(k=>k<beforeKey&&logs[k].gym&&logs[k].gym[id]&&logs[k].gym[id].some(x=>x&&x.r)).sort();
  if(!ks.length)return null;return{key:ks.at(-1),sets:logs[ks.at(-1)].gym[id].filter(x=>x&&x.r)}}
const r25=x=>Math.round(x/2.5)*2.5;
function gymTarget(e,key,light){
  const last=lastGym(e.id,key);let kg=e.start,lo=e.lo,hi=e.hi,sets=e.sets,first=!last,up=false;
  if(last){const maxKg=Math.max(...last.sets.map(x=>+x.kg||0));kg=maxKg;
    const allHi=last.sets.length>=e.sets&&last.sets.every(x=>(+x.r||0)>=e.hi&&(+x.kg||0)>=maxKg);
    if(allHi){if(e.inc>0){kg=maxKg+e.inc;up=true}else{const best=Math.max(...last.sets.map(x=>+x.r||0));lo=hi=best+(e.unit.startsWith("s")?5:1);up=true}}}
  if(light){kg=e.inc>0&&kg>0?r25(kg*0.6):kg;sets=Math.max(2,sets-1)}
  return{sets,lo,hi,kg,first,up};
}
const fmtKg=x=>(Math.round(x*10)/10).toString().replace(".",",");
function gymWidget(k,s,onAny,preview){
  const {ex,light,type}=gymPlan(s);
  const wrap=el("div",{class:"gym"},el("div",{class:"eyebrow",text:"Séance "+type+(light?" allégée (60 % de la charge)":"")+(preview?" · aperçu, à remplir le jour J":" · noter tes séries")}));
  ex.forEach(e=>{
    const t=gymTarget(e,k,light);
    const reps=t.lo===t.hi?String(t.lo):t.lo+"-"+t.hi;
    const tgt=t.sets+" × "+reps+" "+e.unit+(t.kg>0?" · "+fmtKg(t.kg)+" kg":e.inc>0?" · poids du corps":"");
    const row=el("div",{class:"gex"});
    row.append(el("div",{class:"gname"},el("b",{text:e.name}),el("span",{class:"gtgt",text:"Visé : "+tgt+(t.up?" ↑":"")+(t.first&&e.inc>0?" (1re fois : ajuste la charge)":"")}),el("span",{class:"gtip",text:e.tip})));
    const cur=(logs[k]&&logs[k].gym&&logs[k].gym[e.id])||[];
    const setsBox=el("div",{class:"gsets"});const inputs=[];
    for(let i=0;i<t.sets;i++){
      const r=el("input",{type:"number",inputmode:"numeric",min:"0",step:"1",placeholder:String(t.hi),"aria-label":e.name+" série "+(i+1)+" "+e.unit,value:cur[i]&&cur[i].r!=null?cur[i].r:""});
      const w=el("input",{type:"number",inputmode:"decimal",min:"0",step:"0.5",placeholder:fmtKg(t.kg).replace(",","."),"aria-label":e.name+" série "+(i+1)+" kg",value:cur[i]&&cur[i].kg!=null?cur[i].kg:""});
      const save=()=>{logs[k]=logs[k]||{title:s.title};logs[k].gym=logs[k].gym||{};const arr=logs[k].gym[e.id]||[];
        arr[i]={r:r.value===""?null:+r.value,kg:w.value===""?(r.value===""?null:t.kg):+String(w.value).replace(",",".")};logs[k].gym[e.id]=arr;
        if(r.value!=="")logs[k].done=true;saveLogs();onAny()};
      r.onchange=save;w.onchange=save;inputs.push([r,w]);if(preview){r.disabled=true;w.disabled=true}
      setsBox.append(el("label",{class:"gset"},el("span",{class:"sn",text:"S"+(i+1)}),r,el("span",{class:"x",text:"×"}),w,el("span",{class:"u",text:"kg"})));
    }
    const fill=el("button",{type:"button",class:"chip",text:"= visé",title:"Remplir avec la cible"});
    fill.onclick=()=>{inputs.forEach(([r,w],i)=>{if(r.value==="")r.value=t.hi;if(w.value==="")w.value=t.kg;r.dispatchEvent(new Event("change"))})};
    if(!preview)setsBox.append(fill);
    row.append(setsBox);wrap.append(row);
  });
  wrap.append(el("p",{class:"small",text:"La cible monte quand tu as fait toutes les séries au haut de la fourchette : +2,5 kg à la barre, +2 kg aux haltères, +1 rép ou +5 s au poids du corps. En semaine allégée : 60 % de la charge et une série de moins."}));
  return wrap;
}


/* ---------- Montre Garmin (via intervals.icu et la fonction Netlify /api/sync) ---------- */
const RUN_T=new Set(["Run","TrailRun","VirtualRun"]),BIKE_T=new Set(["Ride","VirtualRide","GravelRide","MountainBikeRide","EBikeRide"]),SWIM_T=new Set(["Swim","OpenWaterSwim"]);
const PLAN_START="2026-10-19";
let garminMap=store.json("garminMap",{});
function actSport(a){if(RUN_T.has(a.type)){const km=a.dist/1000;return a.type==="TrailRun"||(km>0&&(a.dplus||0)/km>=20)?"trail":"route"}if(BIKE_T.has(a.type))return"velo";if(SWIM_T.has(a.type))return"natation";return null}
const isRunSport=s=>s==="route"||s==="trail";
/* Allure de séance de fractionné : intervalles « work », sinon tours proches de l'allure prévue, sinon moyenne */
function targetPaceOf(s){const m=(s.text||"").match(/(\d)'(\d{2})/);return m?(+m[1])*60+(+m[2]):null}
function qualityPace(a,s){
  const laps=(a.laps||[]).filter(l=>l&&l.dist>0&&l.time>0);
  const work=laps.filter(l=>l.work);
  const sum=L=>{const d=L.reduce((x,l)=>x+l.dist,0),t=L.reduce((x,l)=>x+l.time,0);return d>0?t/(d/1000):null};
  if(work.length)return{pace:sum(work),how:"intervalles"};
  const tp=targetPaceOf(s);
  if(tp&&laps.length){const near=laps.filter(l=>{const p=l.time/(l.dist/1000);return Math.abs(p-tp)/tp<=0.08});if(near.length)return{pace:sum(near),how:"tours proches de l'allure prévue"}}
  return{pace:a.time/(a.dist/1000),how:"moyenne"};
}
const REF_RE=/\btest\b|\brace\b|compétition|competition|\bsemi\b|marathon/i;
function recordFrom(a,sport){
  const km=a.dist/1000;const r={done:true,sport,dist:Math.round(km*100)/100,dplus:Math.round(a.dplus||0),time:Math.round(a.time||0),hr:a.hr?Math.round(a.hr):null,garmin:{id:a.id,name:a.name}};
  if(isRunSport(sport))r.pace=Math.round(a.time/km);
  if(sport==="velo")r.kmh=Math.round(km/(a.time/3600)*10)/10;
  if(sport==="natation")r.p100=Math.round(a.time/(a.dist/100));
  return r;
}
function applyActivities(acts){
  let read=acts.length,upd=0,off=0;
  const byDay={};acts.forEach(a=>{if(!a||!a.date)return;const d=a.date.slice(0,10);(byDay[d]=byDay[d]||[]).push(a)});
  for(const day of Object.keys(byDay).sort()){
    const list=byDay[day].filter(a=>actSport(a)).sort((x,y)=>x.date<y.date?-1:1);
    const s=PLAN.sessionFor(parse(day),ctx());
    /* activité déjà associée : elle garde sa séance */
    const todo=[];
    for(const a of list){const k=garminMap[a.id];if(k&&logs[k]){const sp=actSport(a);const keep={rpe:logs[k].rpe,title:logs[k].title,gym:logs[k].gym,free:logs[k].free};logs[k]=Object.assign({},logs[k],recordFrom(a,sp),keep);if(!logs[k].free)fixPace(logs[k],a,s);k.includes("~")?off++:upd++}else todo.push(a)}
    const slotFree=s&&s.run&&!(logs[day]&&logs[day].garmin&&garminMap[logs[day].garmin.id]===day);
    let pick=null;
    if(slotFree){const runs=todo.filter(a=>isRunSport(actSport(a)));
      if(runs.length){pick=/Sortie longue/.test(s.title)?(runs.find(a=>a.dist>15000)||runs[0]):runs[0]}}
    for(const a of todo){
      const sp=actSport(a);
      if(a===pick){const prev=logs[day]||{};logs[day]=Object.assign({},prev,recordFrom(a,sp),{title:s.title,rpe:prev.rpe||(s.kind==="race"||REF_RE.test(a.name||"")?9:null)});fixPace(logs[day],a,s);garminMap[a.id]=day;upd++}
      else{const k=day+"~g"+a.id;const prev=logs[k]||{};logs[k]=Object.assign({},prev,recordFrom(a,sp),{free:true,title:a.name||"Activité",rpe:prev.rpe||(REF_RE.test(a.name||"")?9:null)});garminMap[a.id]=k;off++}
    }
  }
  saveLogs();store.setJson("garminMap",garminMap);
  return{read,upd,off};
}
function fixPace(rec,a,s){if(s&&s.kind==="hard"&&isRunSport(rec.sport)){const q=qualityPace(a,s);rec.pace=Math.round(q.pace);rec.paceHow=q.how;rec.avgPace=Math.round(a.time/(a.dist/1000))}}
const fmtDur=sec=>{sec=Math.round(sec||0);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return h?h+" h "+String(m).padStart(2,"0"):m+" min"};
function garminLine(rec,s){
  if(!rec||!rec.garmin)return null;
  const parts=[rec.garmin.name,rec.dist?fr(rec.dist,2)+" km":"",rec.time?fmtDur(rec.time):"",rec.hr?"FC "+rec.hr:"",rec.dplus?rec.dplus+" m D+":""];
  if(rec.pace&&isRunSport(rec.sport))parts.push(fmtPace(rec.pace)+"/km"+(rec.paceHow&&rec.paceHow!=="moyenne"?" ("+rec.paceHow+")":""));
  if(rec.kmh)parts.push(fr(rec.kmh)+" km/h");if(rec.p100)parts.push(fmtPace(rec.p100)+"/100 m");
  if(s)parts.push("prévu "+(s.dur&&s.dur!=="—"?s.dur:s.title));
  return el("p",{class:"garmin",text:"⌚ Garmin : "+parts.filter(Boolean).join(" · ")});
}
let syncing=false;
async function garminSync(manual){
  const st=document.getElementById("g-status");
  const say=t=>{if(st)st.textContent=t;store.set("gStatus",t)};
  const key=store.get("appKey","");
  if(typeof IS_PWA==="undefined"||!IS_PWA){if(manual)say("La synchro marche seulement dans l'appli en ligne (Netlify).");return}
  if(!key){if(manual)say("Entre d'abord la clé de l'appli.");return}
  if(syncing)return;syncing=true;if(manual)say("Synchronisation…");
  const last=+store.get("gLast","0");
  const after=last?Math.floor(last/1000)-3*86400:Math.floor(Date.parse(PLAN_START+"T00:00:00Z")/1000);
  try{
    const r=await fetch("/api/sync",{method:"POST",headers:{"content-type":"application/json","x-app-key":key},body:JSON.stringify({after})});
    let d={};try{d=await r.json()}catch(e){}
    if(!r.ok)throw new Error(d.error||("Erreur "+r.status));
    const res=applyActivities(d.activities||[]);
    store.set("gLast",String(Date.now()));
    const nowS=new Date().toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    say("Synchro du "+nowS+" : "+res.read+" activité"+(res.read>1?"s":"")+" lue"+(res.read>1?"s":"")+", "+res.upd+" séance"+(res.upd>1?"s":"")+" mise"+(res.upd>1?"s":"")+" à jour, "+res.off+" hors plan."+(res.read===0?" Si tu attendais des activités, vérifie qu'elles sont bien dans le calendrier d'intervals.icu.":""));
    show();
  }catch(e){say("Échec de la synchro : "+e.message)}
  finally{syncing=false}
}
function maybeAutoSync(){const last=+store.get("gLast","0");if(store.get("appKey","")&&Date.now()-last>30*60*1000)garminSync(false)}
function renderReglages(){
  const k=document.getElementById("g-key");k.value=store.get("appKey","");
  document.getElementById("g-status").textContent=store.get("gStatus","Pas encore synchronisé.");
  document.getElementById("g-form").onsubmit=e=>{e.preventDefault();store.set("appKey",k.value.trim());document.getElementById("g-status").textContent="Clé enregistrée.";garminSync(true)};
  document.getElementById("g-sync").onclick=()=>garminSync(true);
  if(typeof IS_PWA==="undefined"||!IS_PWA)document.getElementById("g-status").textContent="La synchro marche seulement dans l'appli en ligne (Netlify).";
}

/* ---------- Fiche séance ---------- */
function fillCard(c,date,withWeek){
  c.innerHTML="";
  const s=PLAN.sessionFor(date,ctx());
  if(!s){c.append(el("p",{text:"Pas de séance prévue ce jour-là dans cette version du plan."}));return}
  const w=s.week;
  c.append(el("div",{},el("div",{class:"eyebrow",text:fmtDate(date)+" · semaine "+w[0]}),el("h3",{text:s.title})));
  const pills=el("div",{class:"pills"});const cls={hard:"hard",race:"race",easy:"easy"}[s.kind]||"";
  [[s.dur,cls],[SITE[site],""],[w[2],""]].forEach(([t,k])=>{if(t&&t!=="—")pills.append(el("span",{class:"pill "+k,text:t}))});
  c.append(pills,el("p",{text:s.text}));
  if(s.note)c.append(el("p",{class:"note",text:s.note}));
  {const gl=garminLine(logs[iso(date)],s);if(gl)c.append(gl)}
  if(s.routineLink)c.append(el("a",{href:"#routine",class:"goto",text:s.kind==="race"?"Routine du jour de course →":(/Veille/.test(s.title)?"Routine de la veille →":"Routine de la semaine avant course →")}));
  if(s.kind==="race"&&s.raceDate){const ri=raceInfo(s.raceDate);const pr=ri&&predictRace(ri);
    if(pr)c.append(el("p",{class:"pred"},el("span",{class:"eyebrow",text:"Temps théorique"}),el("b",{text:PREDICT.fmt(pr.sec)}),el("span",{class:"small",text:"fourchette "+PREDICT.fmt(pr.lo)+" à "+PREDICT.fmt(pr.hi)})));
    c.append(el("a",{href:"#strategie",class:"goto",text:"Stratégie de course →",onclick:()=>{stratRace=s.raceDate;store.set("stratRace",s.raceDate)}}),el("a",{href:"#calcul",class:"goto",text:"Calculer la nutrition de cette course →",onclick:()=>presetFromRace(s.raceDate)}))}
  const lw=logWidget(date,s);if(lw&&date<=TODAY)c.append(lw);
  else if(lw&&s.kind==="gym")c.append(gymWidget(iso(date),s,()=>{},true));
  else if(lw)c.append(el("p",{class:"small",text:"Tu pourras valider cette séance et saisir ta vitesse le jour J."}));
  if(withWeek){
    const dp=site==="p"?Math.round(w[4]/2/100)*100:w[4];
    const hrs=Number.isInteger(w[3])?w[3]+" h":Math.floor(w[3])+" h 30";
    c.append(el("div",{class:"weekbox"},el("div",{class:"eyebrow",text:"La semaine"}),
      el("dl",{},el("dt",{text:"Phase"}),el("dd",{text:w[2]}),el("dt",{text:"Volume"}),el("dd",{text:hrs+(w[3]>9?" (option)":"")}),el("dt",{text:"D+ cible"}),el("dd",{text:dp+" m"+(site==="p"?" (version Périgueux)":"")}))));
  }
}

/* ---------- Planning ---------- */
let [FIRST,LAST]=PLAN.range(mode);
let selected=(TODAY>=FIRST&&TODAY<=LAST)?TODAY:FIRST;
let view={y:selected.getUTCFullYear(),m:selected.getUTCMonth()};
function renderPlanning(){
  [FIRST,LAST]=PLAN.range(mode);
  if(selected>LAST)selected=LAST;
  document.getElementById("mode-base").setAttribute("aria-pressed",mode==="base");
  document.getElementById("mode-race").setAttribute("aria-pressed",mode==="race");
  document.getElementById("site-t").setAttribute("aria-pressed",site==="t");
  document.getElementById("site-p").setAttribute("aria-pressed",site==="p");
  document.getElementById("mode-desc").textContent=mode==="race"
    ?"Avec mes courses : les 9 courses conseillées remplacent la sortie longue de leur semaine, et le plan continue jusqu'aux Templiers (oct. 2027)."
    :"Plan de base : seulement le 10 km, la course de prépa et Andorra. Il s'arrête fin juin 2027.";
  document.getElementById("month").textContent=MONTHS[view.m]+" "+view.y;
  const g=document.getElementById("grid");g.innerHTML="";
  ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].forEach(x=>g.append(el("div",{class:"dow",text:x})));
  const first=new Date(Date.UTC(view.y,view.m,1));const off=(first.getUTCDay()+6)%7;
  const days=new Date(Date.UTC(view.y,view.m+1,0)).getUTCDate();
  for(let i=0;i<off;i++)g.append(el("div"));
  for(let d=1;d<=days;d++){
    const date=new Date(Date.UTC(view.y,view.m,d));const s=PLAN.sessionFor(date,ctx());
    const b=el("button",{type:"button"},el("span",{class:"n",text:String(d)}));
    if(s){b.className="day k-"+s.kind;b.append(el("span",{class:"t",text:s.title}));
      const lg=logs[iso(date)];if(lg&&lg.done)b.append(el("span",{class:"tick","aria-label":"faite",text:"✓"}));
      b.setAttribute("aria-label",d+" "+MONTHS[view.m]+" : "+s.title+(lg&&lg.done?", faite":""));b.onclick=()=>{selected=date;renderPlanning()};}
    else{b.className="day out";b.disabled=true}
    if(iso(date)===iso(TODAY))b.classList.add("today");
    if(iso(date)===iso(selected))b.classList.add("sel");
    g.append(b);
  }
  document.getElementById("prev").disabled=!(first>FIRST);
  document.getElementById("next").disabled=!(new Date(Date.UTC(view.y,view.m+1,1))<=LAST);
  fillCard(document.getElementById("card"),selected,true);
  const rl=document.getElementById("racelist");rl.innerHTML="";
  PLAN.activeRaces(ctx()).forEach(r=>{const d=parse(r[0]);rl.append(el("div",{},el("b",{text:shortDate(d)+" "+d.getUTCFullYear()}),el("span",{text:r[1]+(r[4]?" (date estimée)":"")})))});
  renderIcs();
}
function renderIcs(){
  const box=document.getElementById("ics-box");if(!box)return;box.innerHTML="";
  const file=mode==="race"?"calendrier-courses.ics":"calendrier-base.ics";
  if(typeof IS_PWA==="undefined"||!IS_PWA||location.protocol!=="https:"){
    box.append(el("p",{class:"small",text:"Disponible dans l'appli installée (mise en ligne sur Netlify) : le lien d'abonnement apparaîtra ici."}));return}
  const dir=location.pathname.replace(/[^/]*$/,"");
  const https=location.origin+dir+file, webcal="webcal://"+location.host+dir+file;
  const copy=el("button",{class:"btn",type:"button",text:"Copier le lien"});
  copy.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(https).then(()=>copy.textContent="Lien copié",()=>{inp.select()})};
  const inp=el("input",{type:"text",readonly:"readonly",value:https,class:"urlbox","aria-label":"Lien du calendrier"});
  box.append(el("div",{class:"controls"},el("a",{class:"btn primary",href:webcal,text:"S'abonner sur iPhone"}),copy),inp,
    el("p",{class:"small",text:"Calendrier « "+(mode==="race"?"avec mes courses":"plan de base")+" ». Chaque séance indique la version Tarbes et la version Périgueux. Il se met à jour tout seul quand tu redéploies l'appli au même endroit sur Netlify."}));
}

/* ---------- Accueil ---------- */
function renderHome(){
  const tp=document.getElementById("today-panel");tp.innerHTML="";
  tp.append(el("h2",{text:"Séance du jour"}));
  const [f,l]=PLAN.range(mode);
  const d=TODAY<f?f:TODAY;
  if(d>l){tp.append(el("p",{text:"Le plan détaillé est terminé : on prépare la saison suivante ensemble."}))}
  else{
    if(d.getTime()!==TODAY.getTime())tp.append(el("p",{class:"small",text:"Le plan commence plus tard. Voici la première séance :"}));
    const box=el("div",{class:"todaycard"});fillCard(box,d,false);tp.append(box);
    const late=[];for(let i=1;i<=6&&late.length<3;i++){const dd=addDays(TODAY,-i);const s=PLAN.sessionFor(dd,ctx());if(s&&(s.run||s.kind==="gym")&&!(logs[iso(dd)]&&logs[iso(dd)].done))late.push([dd,s])}
    if(late.length){const ul=el("div",{class:"late"},el("div",{class:"eyebrow",text:"Pas encore validées"}));
      late.forEach(([dd,s])=>ul.append(el("button",{type:"button",class:"latebtn",text:fmtDate(dd).replace(/ \d{4}$/,"")+" · "+s.title,onclick:()=>{selected=dd;view={y:dd.getUTCFullYear(),m:dd.getUTCMonth()};location.hash="#planning"}})));
      tp.append(ul)}
    tp.append(el("a",{href:"#planning",text:"Voir tout le planning →"}));
  }
  const nr=PLAN.activeRaces(ctx()).find(r=>parse(r[0])>=TODAY);
  if(nr){const d2=parse(nr[0]);const days=Math.round((d2-TODAY)/864e5);
    document.getElementById("next-race").textContent=days===0?"Aujourd'hui":"J-"+days;
    document.getElementById("next-race-d").textContent=nr[1]+" · "+d2.getUTCDate()+" "+MONTHS[d2.getUTCMonth()]+(nr[4]?" (date estimée)":"");}
  const da=Math.round((parse("2027-06-10")-TODAY)/864e5);
  document.getElementById("cd-andorra").textContent=da>0?"J-"+da:"Courue";
}

/* ---------- Courses, matériel, checklist ---------- */
function renderCourses(){
  const tb=document.getElementById("course-rows");tb.innerHTML="";
  COURSES.forEach(c=>{const tr=document.createElement("tr");if(c[6])tr.className="key";
    c.slice(0,6).forEach((v,i)=>{const td=document.createElement("td");
      if(i===3||i===4){const t=document.createElement("span");t.className="tag "+(/^Oui|Doubl/.test(v)?"ok":/^Non|—/.test(v)?"no":"");t.innerHTML=v;td.appendChild(t)}else td.innerHTML=v;
      tr.appendChild(td)});tb.appendChild(tr)});
}
let pk=store.get("pk","qp");if(!PACKS[pk])pk="qp";
function renderPack(){
  document.querySelectorAll("[data-pk]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.pk===pk));
  const tb=document.getElementById("pk-rows");tb.innerHTML="";
  PACKS[pk].forEach(r=>{const tr=el("tr",{class:r[0]==="Total"?"key":""});r.forEach(v=>tr.append(el("td",{text:v,style:r[0]==="Total"?"font-weight:600":null})));tb.append(tr)});
}
function renderChecklist(){
  const box=document.getElementById("checklist");box.innerHTML="";
  const st=store.json("check",{})||{};
  CHECK.forEach(([t,k],i)=>{const id="chk-"+i;const inp=el("input",{type:"checkbox",id});inp.checked=!!st[i];
    inp.onchange=()=>{st[i]=inp.checked;store.setJson("check",st)};
    box.append(el("label",{for:id},inp,el("span",{},t+" ",el("span",{class:"sz",text:k}))))});
}

/* ---------- Calcul nutrition ---------- */
const PRESETS=[
  ["10 km",{sport:"route",dist:10,dplus:0,pace:252,effort:"competition",context:"course"}],
  ["Semi",{sport:"route",dist:21.1,dplus:0,pace:270,effort:"competition",context:"course"}],
  ["Marathon",{sport:"route",dist:42.195,dplus:0,pace:300,effort:"competition",context:"course"}],
  ["SL trail 3 h",{sport:"trail",dist:24,dplus:1200,pace:450,effort:"endurance",context:"entrainement"}],
  ["Andorra 80K",{sport:"trail",dist:79,dplus:3900,pace:679,effort:"competition",context:"course"}],
  ["Templiers",{sport:"trail",dist:80.4,dplus:3443,pace:560,effort:"competition",context:"course"}],
  ["Diagonale",{sport:"trail",dist:180,dplus:10200,pace:660,effort:"competition",context:"course"}],
  ["Vélo 2 h",{sport:"velo",dist:60,dplus:600,pace:120,effort:"endurance",context:"entrainement"}],
  ["Natation 2 km",{sport:"natation",dist:2,dplus:0,pace:1200,effort:"endurance",context:"entrainement"}]
];
const RACE_PRESET={"2026-11-08":{sport:"trail",dist:30,dplus:900,pace:420},"2026-12-06":{sport:"route",dist:10,dplus:0,pace:252},"2027-01-24":{sport:"trail",dist:32,dplus:900,pace:420},
 "2027-02-21":{sport:"trail",dist:33.5,dplus:1000,pace:430},"2027-03-21":{sport:"trail",dist:42,dplus:1600,pace:480},"2027-04-18":{sport:"trail",dist:31,dplus:1500,pace:500},
 "2027-06-10":{sport:"trail",dist:79,dplus:3900,pace:679},"2027-07-10":{sport:"trail",dist:32,dplus:2100,pace:580},"2027-10-17":{sport:"trail",dist:80.4,dplus:3443,pace:560}};
let NI=Object.assign({sport:"trail",dist:24,dplus:1200,pace:450,effort:"endurance",temp:"doux",context:"entrainement",gut:"debutant",sweat:"",unit:"minkm",weight:null},store.json("nutri",{}));
function presetFromRace(k){const ri=raceInfo(k);if(!ri||!ri.dist)return;const pr=predictRace(ri);
  Object.assign(NI,{sport:ri.terrain==="route"?"route":"trail",dist:ri.dist,dplus:ri.dplus||0,pace:pr?pr.pace:(RACE_PRESET[k]||{}).pace||420,effort:"competition",context:"course",unit:"minkm"});store.setJson("nutri",NI)}
function defaultUnit(sp){return sp==="velo"?"kmh":sp==="natation"?"min100":"minkm"}
function renderCalc(){
  const f=document.getElementById("calc-form");f.innerHTML="";
  const pre=el("div",{class:"presets"});PRESETS.forEach(([n,p])=>pre.append(el("button",{type:"button",class:"chip",text:n,onclick:()=>{Object.assign(NI,p,{unit:defaultUnit(p.sport)});store.setJson("nutri",NI);renderCalc()}})));
  f.append(el("div",{class:"eyebrow",text:"Exemples à charger"}),pre);
  const seg=(name,obj,key,onSet)=>{const s=el("div",{class:"seg wrapseg",role:"group","aria-label":name});Object.entries(obj).forEach(([v,t])=>s.append(el("button",{type:"button","aria-pressed":String(NI[key]===v),text:t,onclick:()=>{NI[key]=v;if(onSet)onSet(v);store.setJson("nutri",NI);renderCalc()}})));return s};
  f.append(el("div",{class:"frow"},el("span",{class:"lbl",text:"Sport"}),seg("Sport",NUTRI.SPORTS,"sport",v=>{NI.unit=defaultUnit(v);if(v==="natation"&&NI.dist>10)NI.dist=2})));
  const sw=NI.sport==="natation";
  const dist=el("input",{type:"number",inputmode:"decimal",step:"0.1",min:"0",id:"c-dist",value:sw?Math.round(NI.dist*1000):NI.dist});
  dist.onchange=()=>{NI.dist=sw?(+dist.value)/1000:+dist.value;store.setJson("nutri",NI);renderCalc()};
  const dp=el("input",{type:"number",inputmode:"numeric",step:"10",min:"0",id:"c-dplus",value:NI.dplus});
  dp.onchange=()=>{NI.dplus=+dp.value;store.setJson("nutri",NI);renderCalc()};
  const fields=el("div",{class:"fields"},el("label",{for:"c-dist"},el("span",{text:sw?"Distance (m)":"Distance (km)"}),dist));
  if(!sw)fields.append(el("label",{for:"c-dplus"},el("span",{text:"Dénivelé positif (m)"}),dp));
  f.append(fields);
  /* vitesse */
  const units=sw?{min100:"min/100 m",kmh:"km/h"}:NI.sport==="velo"?{kmh:"km/h",minkm:"min/km"}:{minkm:"min/km",kmh:"km/h",min100:"min/100 m"};
  if(!units[NI.unit])NI.unit=Object.keys(units)[0];
  const kmh0=3600/NI.pace;
  const spWrap=el("div",{class:"speed"});
  if(NI.unit==="kmh"){const inp=el("input",{type:"number",inputmode:"decimal",step:"0.1",min:"0.5",id:"c-kmh",value:fr(kmh0).replace(",",".")});
    inp.onchange=()=>{const v=+inp.value;if(v>0){NI.pace=3600/v;store.setJson("nutri",NI);renderCalc()}};spWrap.append(inp,el("span",{class:"unit",text:"km/h"}))}
  else{const per=NI.unit==="minkm"?NI.pace:NI.pace/10;const m=el("select",{"aria-label":"Minutes"}),s=el("select",{"aria-label":"Secondes"});
    opts(m,0,NI.unit==="minkm"?20:6,1,v=>String(v),Math.floor(per/60));opts(s,0,59,1,v=>String(v).padStart(2,"0"),Math.round(per%60)%60);
    const upd=()=>{const sec=(+m.value)*60+(+s.value);if(sec>0){NI.pace=NI.unit==="minkm"?sec:sec*10;store.setJson("nutri",NI);renderCalc()}};m.onchange=upd;s.onchange=upd;
    spWrap.append(el("div",{class:"wheel"},m,el("span",{class:"sep",text:"'"}),s,el("span",{class:"unit",text:NI.unit==="minkm"?"/km":"/100 m"})))}
  const cv=NUTRI.conv.all(kmh0);
  f.append(el("div",{class:"frow"},el("span",{class:"lbl",text:NI.sport==="trail"?"Vitesse moyenne réelle (montées comprises)":"Vitesse moyenne"}),seg("Unité",units,"unit"),spWrap,
    el("span",{class:"small",text:"= "+cv.kmh+" km/h · "+cv.minkm+"/km · "+cv.min100+"/100 m"})));
  f.append(el("div",{class:"frow"},el("span",{class:"lbl",text:"Effort prévu"}),seg("Effort",NUTRI.EFFORTS,"effort")));
  f.append(el("div",{class:"frow"},el("span",{class:"lbl",text:"Météo"}),seg("Météo",NUTRI.TEMPS,"temp")));
  f.append(el("div",{class:"frow"},el("span",{class:"lbl",text:"Contexte"}),seg("Contexte",{entrainement:"Entraînement",course:"Course (compétition)"},"context")));
  f.append(el("div",{class:"frow"},el("span",{class:"lbl",text:"Estomac entraîné à manger en courant ?"}),seg("Estomac",{debutant:"Pas encore",entraine:"Oui, testé"},"gut")));
  const wv=NI.weight||latestWeight();
  const wIn=el("input",{type:"number",inputmode:"decimal",step:"0.1",min:"30",id:"c-weight",value:wv});wIn.onchange=()=>{NI.weight=+wIn.value||null;store.setJson("nutri",NI);renderCalc()};
  const sIn=el("input",{type:"number",inputmode:"decimal",step:"0.1",min:"0",placeholder:"inconnu",id:"c-sweat",value:NI.sweat});sIn.onchange=()=>{NI.sweat=sIn.value;store.setJson("nutri",NI);renderCalc()};
  f.append(el("div",{class:"fields"},el("label",{for:"c-weight"},el("span",{text:"Poids (kg)"}),wIn),el("label",{for:"c-sweat"},el("span",{text:"Sudation (L/h), si connue"}),sIn)));
  f.append(el("p",{class:"small",text:"Poids repris de ton dernier relevé dans Progression. Pour mesurer ta sudation : pèse-toi avant et après 1 h de course, sans boire. Chaque kg perdu correspond à environ 1 L/h."}));
  renderCalcResult();
}
function renderCalcResult(){
  const out=document.getElementById("calc-out");out.innerHTML="";
  const kmh=3600/NI.pace;
  if(!(NI.dist>0)||!(kmh>0)){out.append(el("p",{text:"Indique une distance et une vitesse."}));return}
  const r=NUTRI.compute({sport:NI.sport,dist:NI.dist,dplus:NI.sport==="natation"?0:(+NI.dplus||0),speedKmh:kmh,effort:NI.effort,temp:NI.temp,context:NI.context,gut:NI.gut,weight:NI.weight||latestWeight(),sweat:+NI.sweat||0});
  const tiles=el("div",{class:"tiles"});
  const tile=(v,l)=>tiles.append(el("div",{class:"tile"},el("b",{text:v}),el("span",{text:l})));
  tile(r.durTxt.replace(":"," h "),"durée estimée");
  tile(r.kcal.toLocaleString("fr-FR")+" kcal","dépense estimée ("+r.kcalH+"/h)");
  tile(r.carb.target?r.carb.target+" g/h":"Rien","glucides pendant l'effort");
  tile(r.fluid.needed?r.fluid.lo+"-"+r.fluid.hi+" ml/h":"Pas nécessaire","eau");
  out.append(tiles,el("p",{class:"lead",text:r.why}));
  if(r.kmEffort&&NI.sport==="trail")out.append(el("p",{class:"small",text:"Soit "+fr(r.kmEffort)+" km-effort, à "+fr(r.kmEffortH)+" km-effort/h."}));
  const tbl=(rows,head)=>{const t=el("table");if(head)t.append(el("thead",{},el("tr",{},...head.map(h=>el("th",{text:h})))));const tb=el("tbody");rows.forEach(r=>tb.append(el("tr",{},...r.map(c=>el("td",{text:c})))));t.append(tb);return el("div",{class:"tbl"},t)};
  /* cibles */
  const rows=[];
  if(r.carb.target)rows.push(["Glucides",r.carb.lo+"-"+r.carb.hi+" g/h, cible "+r.carb.target+" g/h","1re prise à "+NUTRI.hm(r.carb.start)+", puis toutes les "+(NI.sport==="natation"?30:20)+" min"]);
  else rows.push(["Glucides",r.carb.tier==="rinse"?"Pas nécessaire (option : rinçage de bouche)":"Pas nécessaire","Repas d'avant suffisant"]);
  rows.push(["Eau",r.fluid.needed?r.fluid.lo+"-"+r.fluid.hi+" ml/h":"Pas nécessaire",r.fluid.needed?"Petites gorgées régulières, selon ta soif":"Bois avant et après"]);
  rows.push(["Sodium",r.sodium.needed?r.sodium.lo+"-"+r.sodium.hi+" mg/h":"Pas nécessaire",r.sodium.needed?"500-700 mg par litre bu (pastilles ou boisson salée)":""]);
  if(r.protein)rows.push(["Protéines",r.protein.lo+"-"+r.protein.hi+" g/h","Au ravito : fromage, jambon, boisson de récup"]);
  out.append(el("h3",{text:"Les cibles"}),tbl(rows,["","Quantité","Comment"]));
  if(r.carb.target)out.append(el("p",{class:"small",text:"Ces "+r.carb.target+" g/h apportent environ "+r.intakeKcalH+" kcal/h, soit "+r.coverPct+" % de ta dépense. C'est normal : on ne compense jamais tout, on retarde l'épuisement des réserves."}));
  /* plan de prises */
  if(r.schedule.length){
    out.append(el("h3",{text:"Quand manger et boire"}));
    if(r.where)out.append(el("p",{class:"small",text:"Moment idéal pour une prise : "+r.where+". Boisson d'effort dosée à "+r.drinkConc+" g/L (≈ "+r.drinkCarbsH+" g/h de glucides par la boisson)."}));
    const byH={};r.schedule.forEach(x=>{const h=Math.floor(x.t/60);(byH[h]=byH[h]||[]).push(x)});
    const hr=Object.keys(byH).map(h=>["Heure "+(+h+1),byH[h].map(x=>x.clock+" : "+(x.drink?x.drink+" ml de boisson":"")+(x.food.length?(x.drink?" + ":"")+x.food.join(" "):"")).join("\n")]);
    const t=tbl(hr,["","Prises"]);t.querySelectorAll("td:nth-child(2)").forEach(td=>td.style.whiteSpace="pre-line");out.append(t);
    const sh=r.shopping,list=[];
    if(sh.drinkLiters)list.push(fr(sh.drinkLiters)+" L de boisson d'effort (≈ "+sh.powder+" g de poudre)");
    if(sh.gel)list.push(sh.gel+" gel"+(sh.gel>1?"s":""));if(sh.pate)list.push(sh.pate+" pâte"+(sh.pate>1?"s":"")+" de fruits ou ½ barres");
    if(sh.sale)list.push(sh.sale+" portion"+(sh.sale>1?"s":"")+" de salé (souvent aux ravitos)");if(sh.cafeine)list.push(sh.cafeine+" gel"+(sh.cafeine>1?"s":"")+" caféiné"+(sh.cafeine>1?"s":""));
    out.append(el("p",{},el("b",{text:"À prévoir : "}),list.join(" · ")+". Prends 1-2 gels de secours en plus."));
  }
  out.append(el("h3",{text:"Avant"}),tbl(r.pre.map(x=>[x.when,x.what])));
  if(r.caffeine.length)out.append(el("h3",{text:"Caféine (facultatif)"}),tbl(r.caffeine.map(x=>[x.when,x.dose])),el("p",{class:"small",text:"À tester à l'entraînement d'abord. Pas plus d'environ 400 mg sur la journée. Évite-la si elle te donne des troubles digestifs ou t'empêche de dormir avant la course."}));
  out.append(el("h3",{text:"Après"}),tbl(r.post.map(x=>[x.when,x.what])));
  if(r.notes.length){const ul=el("ul");r.notes.forEach(n=>ul.append(el("li",{text:n})));out.append(el("h3",{text:"Conseils du coach"}),ul)}
  out.append(el("p",{class:"small",text:"Dépense : environ 0,95 kcal/kg/km sur le plat, +10 % en trail, +0,6 kcal/kg par 100 m de D+ ; physique du vélo ; MET pour la natation. Ce sont des estimations à ±10-15 %, pas des valeurs médicales."}));
}

/* ---------- Graphiques (SVG dessiné à la largeur réelle) ---------- */
function niceTicks(lo,hi,n){const span=hi-lo||1;const step0=span/n;const mag=Math.pow(10,Math.floor(Math.log10(step0)));const step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>span/s<=n)||mag*10;const a=Math.floor(lo/step)*step,b=Math.ceil(hi/step)*step;const t=[];for(let v=a;v<=b+1e-9;v+=step)t.push(+v.toFixed(6));return t}
const SVGNS="http://www.w3.org/2000/svg";
const sv=(tag,attrs={})=>{const e=document.createElementNS(SVGNS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
function chart(host,o){
  /* o: {type:"line"|"bar", series:[{name,color,points:[{x:Date,y,tip}]}], yFmt, invert, empty} */
  host.innerHTML="";host.classList.add("chart");
  const pts=o.series.flatMap(s=>s.points);
  if(!pts.length){host.append(el("div",{class:"empty",text:o.empty}));return}
  const W=Math.max(280,host.clientWidth||600),H=220,m={l:46,r:16,t:14,b:28};
  let xs=pts.map(p=>p.x.getTime()),x0=Math.min(...xs),x1=Math.max(...xs);
  if(x1-x0<7*864e5){x0-=3.5*864e5;x1+=3.5*864e5}
  let ys=pts.map(p=>p.y),y0=Math.min(...ys),y1=Math.max(...ys);
  if(o.type==="bar"){y0=0;y1=Math.max(100,y1)}else{const pad=(y1-y0||Math.abs(y1)*0.1||1)*0.15;y0-=pad;y1+=pad}
  const ticks=o.paceTicks?(()=>{const span=y1-y0;const st=[5,10,15,20,30,60,120].find(s=>span/s<=4)||300;const t=[];for(let v=Math.floor(y0/st)*st;v<=Math.ceil(y1/st)*st+1e-9;v+=st)t.push(v);return t})():niceTicks(y0,y1,4);y0=ticks[0];y1=ticks.at(-1);
  const X=t=>m.l+(t-x0)/(x1-x0)*(W-m.l-m.r);
  const Y=v=>o.invert?m.t+(v-y0)/(y1-y0)*(H-m.t-m.b):H-m.b-(v-y0)/(y1-y0)*(H-m.t-m.b);
  const svg=sv("svg",{width:W,height:H,viewBox:`0 0 ${W} ${H}`,role:"img","aria-label":o.label||""});
  ticks.forEach(t=>{svg.append(sv("line",{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),class:"grid"}));const tx=sv("text",{x:m.l-8,y:Y(t)+4,"text-anchor":"end",class:"axis"});tx.textContent=o.yFmt(t);svg.append(tx)});
  /* axe x : 2 à 5 dates */
  const nx=Math.min(5,Math.max(2,Math.floor((W-m.l-m.r)/110)));
  for(let i=0;i<nx;i++){const t=x0+(x1-x0)*i/(nx-1);const tx=sv("text",{x:X(t),y:H-8,"text-anchor":i===0?"start":i===nx-1?"end":"middle",class:"axis"});tx.textContent=shortDate(new Date(t));svg.append(tx)}
  const marks=[];
  o.series.forEach((s,si)=>{
    const P=[...s.points].sort((a,b)=>a.x-b.x);
    if(o.type==="bar"){const bw=Math.max(6,Math.min(26,(W-m.l-m.r)/Math.max(P.length,1)*0.6));
      P.forEach(p=>{const x=X(p.x.getTime()),y=Y(p.y),h=Math.max(0,Y(0)-y);const r=sv("rect",{x:x-bw/2,y:y,width:bw,height:h,rx:Math.min(4,bw/2),fill:s.color});svg.append(r);marks.push({x,y,p,s})})}
    else{
      if(P.length>1){const d=P.map((p,i)=>(i?"L":"M")+X(p.x.getTime()).toFixed(1)+" "+Y(p.y).toFixed(1)).join(" ");svg.append(sv("path",{d,fill:"none",stroke:s.color,"stroke-width":2,"stroke-linejoin":"round","stroke-linecap":"round"}))}
      P.forEach(p=>{const x=X(p.x.getTime()),y=Y(p.y);svg.append(sv("circle",{cx:x,cy:y,r:4,fill:s.color,stroke:"var(--surface)","stroke-width":2}));marks.push({x,y,p,s})});
    }
  });
  const cross=sv("line",{y1:m.t,y2:H-m.b,class:"cross",visibility:"hidden"});svg.append(cross);
  const ring=sv("circle",{r:6,fill:"none","stroke-width":2,visibility:"hidden"});svg.append(ring);
  host.append(svg);
  const tip=el("div",{class:"tip",hidden:true});host.append(tip);
  const showAt=cx=>{let best=null,bd=1e9;marks.forEach(mk=>{const d=Math.abs(mk.x-cx);if(d<bd){bd=d;best=mk}});if(!best||bd>40){hide();return}
    cross.setAttribute("x1",best.x);cross.setAttribute("x2",best.x);cross.setAttribute("visibility","visible");
    ring.setAttribute("cx",best.x);ring.setAttribute("cy",best.y);ring.setAttribute("stroke",best.s.color);ring.setAttribute("visibility",o.type==="bar"?"hidden":"visible");
    tip.hidden=false;tip.innerHTML="";tip.append(el("b",{text:fmtDate(best.p.x).replace(/^\S+ /,"")}),el("span",{text:(o.series.length>1?best.s.name+" : ":"")+best.p.tip}));
    const tw=tip.offsetWidth;tip.style.left=Math.min(W-tw-4,Math.max(4,best.x-tw/2))+"px";tip.style.top=Math.max(0,best.y-58)+"px"};
  const hide=()=>{cross.setAttribute("visibility","hidden");ring.setAttribute("visibility","hidden");tip.hidden=true};
  svg.addEventListener("pointermove",e=>{const r=svg.getBoundingClientRect();showAt(e.clientX-r.left)});
  svg.addEventListener("pointerdown",e=>{const r=svg.getBoundingClientRect();showAt(e.clientX-r.left)});
  svg.addEventListener("pointerleave",hide);
  if(o.series.length>1){const lg=el("div",{class:"legend"});o.series.forEach(s=>lg.append(el("span",{},el("i",{style:"background:"+s.color}),s.name)));host.append(lg)}
}

/* ---------- Progression ---------- */
function runLogs(sport){return Object.entries(logs).filter(([k,v])=>v.done&&v.pace&&v.sport===sport).map(([k,v])=>({k,v,d:kd(k)})).sort((a,b)=>a.k<b.k?-1:1)}
function weekStats(){
  const res=[];const W=PLAN.weeksFor(mode);
  for(const w of W){const s0=parse(w[1]);if(s0>TODAY)break;
    let planned=0,done=0;for(let i=0;i<7;i++){const d=addDays(s0,i);if(d>TODAY)break;const s=PLAN.sessionFor(d,ctx());if(s&&s.kind!=="rest"){planned++;if(logs[iso(d)]&&logs[iso(d)].done)done++}}
    if(planned)res.push({w,d:s0,planned,done,pct:Math.round(done/planned*100)})}
  return res;
}
function renderProgress(){
  const css=getComputedStyle(document.documentElement);const c1=css.getPropertyValue("--s1").trim()||"#1f7a52",c2=css.getPropertyValue("--s2").trim()||"#8a45b8";
  const route=runLogs("route"),trail=runLogs("trail");
  const wk=weekStats();const last4=wk.slice(-4);const p4=last4.reduce((a,x)=>a+x.planned,0);const d4=last4.reduce((a,x)=>a+x.done,0);
  const nDone=Object.values(logs).filter(v=>v.done).length;
  const ws=[...weights].sort((a,b)=>a.d<b.d?-1:1);
  const tiles=document.getElementById("prog-tiles");tiles.innerHTML="";
  const t=(v,l)=>tiles.append(el("div",{class:"tile"},el("b",{text:v}),el("span",{text:l})));
  t(String(nDone),"séances validées");
  t(p4?Math.round(d4/p4*100)+" %":"—","régularité, 4 dernières semaines");
  t(route.length?fmtPace(Math.min(...route.map(x=>x.v.pace)))+"/km":"—","meilleure allure sur route");
  t(ws.length?fr(ws.at(-1).kg)+" kg":"—",ws.length>1?((ws.at(-1).kg-ws[0].kg>=0?"+":"")+fr(ws.at(-1).kg-ws[0].kg)+" kg depuis le "+shortDate(parse(ws[0].d))):"poids actuel");
  chart(document.getElementById("ch-route"),{type:"line",invert:true,paceTicks:true,label:"Allure sur route par séance",yFmt:v=>fmtPace(v),empty:"Valide une séance sur route avec ta vitesse pour voir ta courbe d'allure.",
    series:[{name:"Allure route",color:c1,points:route.map(x=>({x:x.d,y:x.v.pace,tip:fmtPace(x.v.pace)+"/km · "+fr(3600/x.v.pace)+" km/h"+(x.v.dist?" · "+fr(x.v.dist,2)+" km":"")}))}]});
  const tk=trail.map(x=>({x:x.d,y:3600/x.v.pace,tip:fr(3600/x.v.pace)+" km/h · "+fmtPace(x.v.pace)+"/km"+(x.v.dplus?" · "+x.v.dplus+" m D+":"")}));
  const te=trail.filter(x=>x.v.dist&&x.v.dplus!=null).map(x=>{const kmh=3600/x.v.pace;const ke=kmh*(1+(x.v.dplus/100)/x.v.dist);return{x:x.d,y:ke,tip:fr(ke)+" km-effort/h"}});
  chart(document.getElementById("ch-trail"),{type:"line",label:"Vitesse en trail par séance",yFmt:v=>fr(v),empty:"Valide une séance de trail pour suivre ta vitesse.",
    series:te.length?[{name:"Vitesse (km/h)",color:c1,points:tk},{name:"Vitesse km-effort/h (si D+ saisi)",color:c2,points:te}]:[{name:"Vitesse (km/h)",color:c1,points:tk}]});
  {const vol={};Object.entries(logs).forEach(([k,v])=>{if(!v.done||!isRunSport(v.sport)||!v.dist)return;const d=kd(k);const mon=addDays(d,-((d.getUTCDay()+6)%7));const key=iso(mon);vol[key]=(vol[key]||0)+v.dist});
   const pts=Object.keys(vol).sort().filter(k=>k>="2026-09-01").map(k=>({x:addDays(parse(k),3),y:Math.round(vol[k]*10)/10,tip:"Semaine du "+shortDate(parse(k))+" : "+fr(vol[k])+" km de course (séances du plan + hors plan)"}));
   chart(document.getElementById("ch-vol"),{type:"bar",label:"Volume de course par semaine",yFmt:v=>v+" km",empty:"Le volume apparaît dès que tes séances ont une distance (saisie ou montre).",series:[{name:"km",color:c1,points:pts}]});}
  chart(document.getElementById("ch-reg"),{type:"bar",label:"Régularité par semaine",yFmt:v=>v+" %",empty:"La régularité s'affiche dès la première semaine du plan.",
    series:[{name:"Séances faites",color:c1,points:wk.map(x=>({x:addDays(x.d,3),y:x.pct,tip:"Semaine "+x.w[0]+" : "+x.done+"/"+x.planned+" séances ("+x.pct+" %)"}))}]});
  chart(document.getElementById("ch-weight"),{type:"line",label:"Poids",yFmt:v=>fr(v),empty:"Ajoute une pesée pour suivre ton poids.",
    series:[{name:"Poids",color:c1,points:ws.map(w=>({x:parse(w.d),y:w.kg,tip:fr(w.kg)+" kg · IMC "+fr(w.kg/(HEIGHT*HEIGHT))}))}]});
  renderStrength(c1);
  const bmi=ws.length?ws.at(-1).kg/(HEIGHT*HEIGHT):null;
  document.getElementById("bmi").textContent=bmi?"IMC actuel : "+fr(bmi)+" (taille 1,79 m).":"";
  renderWeightList();renderHistory();
}

let strEx=store.get("strEx","squat");
function renderStrength(color){
  const sel=document.getElementById("str-ex");if(!sel)return;
  if(!sel.options.length){[["A",GYM.A],["B",GYM.B]].forEach(([t,list])=>{const g=el("optgroup",{label:"Séance "+t});list.forEach(e=>g.append(el("option",{value:e.id,text:e.name})));sel.append(g)});sel.onchange=()=>{strEx=sel.value;store.set("strEx",strEx);renderStrength(color)}}
  if(!GYM_ALL.some(e=>e.id===strEx))strEx="squat";sel.value=strEx;
  const e=GYM_ALL.find(x=>x.id===strEx);const weighted=e.inc>0;
  const pts=Object.keys(logs).filter(k=>logs[k].gym&&logs[k].gym[e.id]).sort().map(k=>{const sets=logs[k].gym[e.id].filter(x=>x&&x.r);if(!sets.length)return null;
    let best=sets[0],val=0;sets.forEach(x=>{const v=weighted&&(+x.kg>0)?(+x.kg)*(1+(+x.r)/30):(+x.r);if(v>val){val=v;best=x}});
    const vol=sets.reduce((s,x)=>s+(+x.r)*((+x.kg)||0),0);
    return{x:kd(k),y:Math.round(val*10)/10,tip:"Meilleure série : "+best.r+" "+e.unit+(+best.kg>0?" × "+fmtKg(+best.kg)+" kg":"")+(weighted&&(+best.kg>0)?" · 1RM estimé "+fmtKg(val)+" kg":"")+(vol?" · volume "+Math.round(vol)+" kg":"")+" · "+sets.length+" séries"}}).filter(Boolean);
  const useKg=weighted&&pts.length&&Object.keys(logs).some(k=>logs[k].gym&&logs[k].gym[e.id]&&logs[k].gym[e.id].some(x=>x&&+x.kg>0));
  document.getElementById("str-note").textContent=useKg?"Force estimée (1RM, formule d'Epley : charge × (1 + rép/30)) de ta meilleure série.":"Répétitions (ou secondes) de ta meilleure série.";
  chart(document.getElementById("ch-str"),{type:"line",label:"Progression "+e.name,yFmt:v=>useKg?fmtKg(v)+" kg":String(Math.round(v)),empty:"Note tes séries sur une séance de salle pour voir ta progression sur cet exercice.",
    series:[{name:e.name,color,points:pts}]});
}
function renderWeightList(){
  const box=document.getElementById("w-list");box.innerHTML="";
  [...weights].sort((a,b)=>a.d<b.d?1:-1).slice(0,8).forEach(w=>{
    box.append(el("div",{class:"hrow"},el("span",{text:fmtDate(parse(w.d)).replace(/^\S+ /,"")}),el("b",{text:fr(w.kg)+" kg"}),
      el("button",{type:"button",class:"x","aria-label":"Supprimer la pesée du "+w.d,text:"Supprimer",onclick:()=>{weights=weights.filter(x=>x!==w);saveWeights();renderProgress()}})))});
}
function renderHistory(){
  const box=document.getElementById("hist");box.innerHTML="";
  const ks=Object.keys(logs).filter(k=>logs[k].done).sort().reverse().slice(0,15);
  if(!ks.length){box.append(el("p",{class:"small",text:"Aucune séance validée pour l'instant."}));return}
  ks.forEach(k=>{const v=logs[k];
    const info=[(v.garmin?"⌚ ":"")+(v.title||"Séance"),v.kmh?"vélo "+fr(v.kmh)+" km/h":"",v.p100?"natation "+fmtPace(v.p100)+"/100 m":"",v.hr?"FC "+v.hr:"",v.pace?(v.sport==="trail"?"trail ":"route ")+fmtPace(v.pace)+"/km":"",v.dist?fr(v.dist,2)+" km":"",v.dplus?v.dplus+" m D+":"",v.rpe?"ressenti "+v.rpe+"/10":"",v.gym?Object.keys(v.gym).filter(id=>v.gym[id].some(x=>x&&x.r)).length+" exercices notés":""].filter(Boolean).join(" · ");
    box.append(el("div",{class:"hrow"},el("span",{text:fmtDate(kd(k)).replace(/^\S+ /,"").replace(/ \d{4}$/,"")}),el("span",{class:"grow",text:info}),
      el("button",{type:"button",class:"x","aria-label":"Supprimer la séance du "+k,text:"Supprimer",onclick:()=>{delete logs[k];saveLogs();renderProgress()}})))});
}
function initProgressForms(){
  const wd=document.getElementById("w-date"),wk=document.getElementById("w-kg");wd.value=iso(TODAY);wk.value=latestWeight();
  document.getElementById("w-form").onsubmit=e=>{e.preventDefault();const kg=+String(wk.value).replace(",",".");if(!(kg>20&&kg<300))return;
    weights=weights.filter(x=>x.d!==wd.value);weights.push({d:wd.value,kg:Math.round(kg*10)/10});saveWeights();renderProgress()};
  /* séance libre */
  const fd=document.getElementById("f-date");fd.value=iso(TODAY);
  const fs=document.getElementById("f-sport"),fm=document.getElementById("f-min"),fsec=document.getElementById("f-sec");
  opts(fm,2,15,1,v=>String(v),6);opts(fsec,0,59,1,v=>String(v).padStart(2,"0"),0);
  const frpe=document.getElementById("f-rpe");frpe.append(el("option",{value:"",text:"—"}));for(let i=1;i<=10;i++)frpe.append(el("option",{value:String(i),text:String(i)}));
  document.getElementById("f-form").onsubmit=e=>{e.preventDefault();if(!fd.value)return;const k=fd.value+"~"+Date.now().toString(36);
    const dist=document.getElementById("f-dist").value,dp=document.getElementById("f-dplus").value,nm=document.getElementById("f-name").value.trim();
    logs[k]={done:true,sport:fs.value,pace:(+fm.value)*60+(+fsec.value),dist:dist===""?null:+dist,dplus:dp===""?null:+dp,rpe:frpe.value?+frpe.value:null,title:nm||"Séance libre",free:true};
    saveLogs();renderProgress();document.getElementById("f-ok").textContent="Séance ajoutée";setTimeout(()=>document.getElementById("f-ok").textContent="",1800)};
  /* sauvegarde */
  const ta=document.getElementById("backup");
  document.getElementById("b-export").onclick=()=>{const data=JSON.stringify({v:1,logs,weights,check:store.json("check",{}),nutri:NI});ta.value=data;ta.select();
    try{const blob=new Blob([data],{type:"application/json"});const a=el("a",{href:URL.createObjectURL(blob),download:"prepa-diag-sauvegarde-"+iso(TODAY)+".json"});document.body.append(a);a.click();a.remove()}catch(e){}
    if(navigator.clipboard)navigator.clipboard.writeText(data).then(()=>msg("Copié dans le presse-papiers"),()=>msg("Sélectionné : copie-le à la main"))};
  document.getElementById("b-import").onclick=()=>{try{const d=JSON.parse(ta.value);if(!d||!d.logs)throw 0;logs=d.logs;weights=d.weights||[];saveLogs();saveWeights();if(d.check)store.setJson("check",d.check);msg("Données importées");renderProgress()}catch(e){msg("Texte non reconnu : colle le contenu d'une sauvegarde")}};
  const msg=t=>{document.getElementById("b-msg").textContent=t};
}

/* ---------- Temps théoriques ---------- */
function routeRefs(){return Object.entries(logs).filter(([k,v])=>v.done&&v.pace&&v.sport==="route"&&v.dist).map(([k,v])=>({key:k,date:kd(k),dist:v.dist,sec:v.pace*v.dist,rpe:v.rpe||null,title:v.title||"Séance"}))}
function bestTen(){const t=PREDICT.tenKm(routeRefs(),TODAY);return t.length?t[0]:null}
function predictRace(ri){const b=bestTen();if(!b||!ri||!ri.dist)return null;return PREDICT.timeFor(b.t10,ri.dist,ri.dplus||0,ri.terrain||"roulant")}
const terrainSel=(id,val)=>{const s=el("select",{id});Object.entries(PREDICT.TERRAINS).forEach(([k,t])=>s.append(el("option",{value:k,text:t.name})));s.value=val||"roulant";return s};
function renderTemps(){
  const refBox=document.getElementById("t-ref");refBox.innerHTML="";
  const list=PREDICT.tenKm(routeRefs(),TODAY);const b=list[0];
  if(!b){refBox.append(el("p",{text:"Aucune référence pour l'instant. Valide une séance sur route avec sa distance et un ressenti (8 à 10 si c'était à fond), ou ajoute une course passée dans Progression."}));
    ["t-std","t-races"].forEach(id=>document.getElementById(id).innerHTML="");return}
  refBox.append(el("p",{class:"lead"},"Ta référence : ",el("b",{text:b.title}),", "+fr(b.dist,2)+" km en "+PREDICT.fmtLong(b.sec)+" ("+shortDate(b.date)+(b.rpe?", ressenti "+b.rpe:"")+"). Équivalent 10 km : ",el("b",{text:PREDICT.fmtLong(b.t10)}),"."));
  if(!b.reliable)refBox.append(el("p",{class:"small",text:"Fiabilité moyenne : cette référence n'est pas un effort à fond (ressenti < 8). Les temps sont corrigés, mais un vrai test (5 ou 10 km à fond) les rendra plus justes."}));
  if(list.length>1)refBox.append(el("p",{class:"small",text:"Autres références prises en compte : "+list.slice(1,4).map(x=>x.title+" → 10 km en "+PREDICT.fmtLong(x.t10)).join(" · ")}));
  const tbl=(head,rows)=>{const t=el("table");t.append(el("thead",{},el("tr",{},...head.map(h=>el("th",{text:h})))));const tb=el("tbody");rows.forEach(r=>{const tr=el("tr",{class:r.cls||""});r.cells.forEach(c=>tr.append(el("td",{},c)));tb.append(tr)});t.append(tb);return el("div",{class:"tbl"},t)};
  const std=[["5 km",5],["10 km",10],["Semi-marathon",21.0975],["Marathon",42.195]].map(([n,d])=>{const r=PREDICT.timeFor(b.t10,d,0,"route");return{cells:[n,PREDICT.fmtLong(r.sec),fmtPace(r.pace)+"/km",PREDICT.fmt(r.lo)+" à "+PREDICT.fmt(r.hi)]}});
  const s=document.getElementById("t-std");s.innerHTML="";s.append(tbl(["Distance","Temps théorique","Allure","Fourchette"],std));
  const rows=allRaceInfos().filter(r=>r.dist&&!(r.hidden)).map(r=>{const p=PREDICT.timeFor(b.t10,r.dist,r.dplus||0,r.terrain||"roulant");
    return{cls:parse(r.date)<TODAY?"past":"",cells:[r.name+(r.user?" (ajoutée)":""),shortDate(parse(r.date))+" "+r.date.slice(0,4),fr(r.dist,1)+" km · "+(r.dplus||0)+" m"+(r.est?" (D+ estimé)":""),PREDICT.TERRAINS[r.terrain||"roulant"].name,el("b",{text:PREDICT.fmt(p.sec)}),PREDICT.fmt(p.lo)+" à "+PREDICT.fmt(p.hi),fr(p.kmh)+" km/h"]}});
  const rc=document.getElementById("t-races");rc.innerHTML="";rc.append(tbl(["Course","Date","Format","Terrain","Temps théorique","Fourchette","Vitesse"],rows));
}
function initWhatIf(){
  const box=document.getElementById("t-whatif");
  const d=el("input",{type:"number",id:"wi-dist",inputmode:"decimal",step:"0.1",min:"1",value:"42"}),dp=el("input",{type:"number",id:"wi-dplus",inputmode:"numeric",step:"10",min:"0",value:"2000"});
  const ts=terrainSel("wi-terrain","montagne");const out=el("p",{class:"lead","aria-live":"polite"});
  const go=()=>{const b=bestTen();if(!b){out.textContent="Il faut d'abord une référence sur route.";return}const r=PREDICT.timeFor(b.t10,+d.value||0,+dp.value||0,ts.value);
    out.textContent="Temps théorique : "+PREDICT.fmt(r.sec)+" (fourchette "+PREDICT.fmt(r.lo)+" à "+PREDICT.fmt(r.hi)+"), soit "+fr(r.kmh)+" km/h et "+fr(r.ke)+" km-effort."};
  [d,dp,ts].forEach(x=>x.oninput=go);
  box.append(el("div",{class:"fields"},el("label",{for:"wi-dist"},el("span",{text:"Distance (km)"}),d),el("label",{for:"wi-dplus"},el("span",{text:"D+ (m)"}),dp),el("label",{for:"wi-terrain"},el("span",{text:"Terrain"}),ts)),out);
  box._go=go;
}


/* ---------- Stratégie de course ---------- */
let stratRace=store.get("stratRace","");
let raceCP=store.json("raceCP",{});let raceStart=store.json("raceStart",{});
const saveCP=()=>{store.setJson("raceCP",raceCP);store.setJson("raceStart",raceStart)};
function raceKind(ri){const ke=ri.dist+(ri.dplus||0)/100;if(ri.terrain==="route")return ri.dist<=12?"route-court":ri.dist<=22?"route-semi":"route-long";return ke<=45?"trail-court":ke<=100?"trail-long":"ultra"}
const STRAT={
 "route-court":{phases:[["Départ (0-1 km)","Pars à ton allure cible, pas plus vite : au plus 3 s/km sous l'objectif. Laisse partir ceux qui s'enflamment."],["Installation (1-5 km)","Allure régulière, respiration contrôlée. Cale-toi derrière un groupe à ta vitesse."],["Le dur (5-8 km)","C'est là que la tête lâche : reste sur l'allure, coupe la course en 1 km à la fois."],["Finish (8-10 km)","Accélère progressivement à 2 km de l'arrivée, à fond sur les 500 derniers mètres."]],
  tips:["Échauffement de 15-20 min avec 3-4 accélérations de 20 s, fini 10 min avant le départ.","Rien à manger pendant la course : le repas d'avant suffit.","Montre en allure moyenne au tour (lap) de 1 km pour éviter les variations du GPS."]},
 "route-semi":{phases:[["0-5 km","1 à 2 % plus lent que l'allure cible. Tu dois avoir l'impression de te retenir."],["5-15 km","Allure cible, stable. Bois aux ravitos, 1 gel vers 45-50 min si l'effort dépasse 1 h 15."],["15-21 km","Si tu te sens bien à 15 km, accélère par paliers de 2-3 s/km."]],tips:["Un départ trop rapide de 10 s/km coûte souvent 2 à 3 min à la fin.","Repère les ravitos sur le plan du parcours avant la course."]},
 "route-long":{phases:[["0-10 km","Plus lent que l'allure cible de 3-5 s/km. Commence à boire et manger dès 20 min."],["10-30 km","Allure cible, régulière. Une prise toutes les 20 min, sans en sauter une."],["30-42 km","Le marathon commence ici. Garde la foulée courte, découpe en blocs de 2 km."]],tips:["Le mur du 30e km se prépare dès le départ : partir lentement et manger tôt.","Si l'allure chute de plus de 15 s/km, ralentis volontairement 2 km et mange : on récupère souvent."]},
 "trail-court":{phases:[["Premier quart","Pars en Z2-Z3, même si ça bouchonne : on double plus tard. Ne grimpe pas en courant ce que tu ne pourrais pas tenir 30 min."],["Milieu","Montées raides (> 15 %) en marche active, mains sur les cuisses ou bâtons. Relance dès que ça s'adoucit. Descentes relâchées, regard 3-4 m devant."],["Dernier quart","Si tu as encore de l'énergie, c'est ici que tu gagnes des places, surtout en descente et sur le plat."]],tips:["Mange à partir de 30 min si l'effort dépasse 1 h 15, de préférence en montée.","Ravitos : remplir, prendre, repartir, moins de 2 min."]},
 "trail-long":{phases:[["0-30 %","Strictement en Z2. Tu dois pouvoir parler. Marche toutes les montées raides dès le départ, même les premières."],["30-70 %","Allure stable. Manger toutes les 20 min, boire à la soif. Point toutes les heures : manger ? boire ? douleur ? frottement ?"],["70-100 %","La vraie course commence. Relance sur le plat et en descente si les jambes le permettent ; sinon, tiens la marche active."]],tips:["Ravitos : arrive en sachant ce que tu prends, repars en mangeant. 5 min maximum.","Coup de mou : mange, ralentis 20 min, puis juge. Ne décide jamais d'abandonner à chaud.","Descentes : petits pas rapides, ne freine pas en talon pour épargner les quadriceps."]},
 "ultra":{phases:[["0-25 %","Beaucoup plus lent que ce que tu peux faire. Z1-Z2, marche dès que ça monte. Laisse partir tout le monde."],["25-60 %","Routine : manger, boire, sel, une base de vie bien gérée. Préparer la nuit avant qu'elle tombe (frontale, couche chaude)."],["60-85 %","Le moment le plus dur : fatigue, sommeil, estomac. Avance de ravito en ravito, micro-sieste de 10-15 min si tu t'endors en marchant."],["85-100 %","Tu connais la fin : garde ta routine jusqu'à la ligne, ne relâche pas la nutrition."]],tips:["Sur 20 h et plus, le temps passé aux ravitos et bases de vie pèse lourd : prévois 3-5 min par ravito, 20-30 min par base de vie.","Change de chaussettes et soigne les pieds à mi-course.","Caféine de préférence la nuit et dans la 2e moitié."]}
};
function stratRaces(){return allRaceInfos().filter(r=>r.dist&&!r.hidden&&parse(r.date)>=addDays(TODAY,-1))}
function renderStrategy(){
  const box=document.getElementById("st-body");box.innerHTML="";
  const sel=document.getElementById("st-race");sel.innerHTML="";
  const races=stratRaces();
  if(!races.length){box.append(el("p",{text:"Aucune course à venir avec une distance. Ajoute-en une dans Mes courses."}));return}
  races.forEach(r=>sel.append(el("option",{value:r.date,text:shortDate(parse(r.date))+" "+r.date.slice(0,4)+" · "+r.name})));
  if(!races.some(r=>r.date===stratRace))stratRace=races[0].date;sel.value=stratRace;
  sel.onchange=()=>{stratRace=sel.value;store.set("stratRace",stratRace);renderStrategy()};
  const ri=raceInfo(stratRace);const pr=predictRace(ri);const ke=ri.dist+(ri.dplus||0)/100;const kind=raceKind(ri);const S=STRAT[kind];
  const tbl=(head,rows)=>{const t=el("table");if(head)t.append(el("thead",{},el("tr",{},...head.map(h=>el("th",{text:h})))));const tb=el("tbody");rows.forEach(r=>tb.append(el("tr",{},...r.map(c=>el("td",{},c)))));t.append(tb);return el("div",{class:"tbl"},t)};
  box.append(el("p",{class:"small",text:fr(ri.dist,1)+" km · "+(ri.dplus||0)+" m D+ · "+fr(ke)+" km-effort · "+PREDICT.TERRAINS[ri.terrain||"roulant"].name}));
  if(!pr){box.append(el("p",{text:"Ajoute une référence sur route (séance à fond avec distance) pour obtenir les objectifs de temps."}))}
  else{
    box.append(el("h3",{text:"Tes 3 objectifs"}));
    const tiles=el("div",{class:"tiles"});
    [["A",pr.lo,"Jour parfait"],["B",pr.sec,"Objectif réaliste"],["C",pr.hi,"Jour difficile : finir"]].forEach(([k,t,l])=>tiles.append(el("div",{class:"tile goal goal-"+k},el("span",{class:"eyebrow",text:"Objectif "+k}),el("b",{text:kind.startsWith("route")?PREDICT.fmtLong(t):PREDICT.fmt(t)}),el("span",{text:l+(kind.startsWith("route")?" · "+fmtPace(t/ri.dist)+"/km":" · "+fr(ri.dist/(t/3600))+" km/h")}))));
    box.append(tiles,el("p",{class:"small",text:"Tu pars sur l'objectif B. Tu ne vises A qu'après la moitié de la course, si tout va bien. C est ta limite pour finir sans te blesser."}));
  }
  box.append(el("h3",{text:"Le déroulé"}),tbl(["Phase","Ce que tu fais"],S.phases));
  /* points de passage */
  box.append(el("h3",{text:"Temps de passage"}));
  const st=el("input",{type:"time",id:"st-start",value:raceStart[stratRace]||(kind.startsWith("route")?"09:30":"06:00")});
  st.onchange=()=>{raceStart[stratRace]=st.value;saveCP();renderStrategy()};
  box.append(el("div",{class:"fields"},el("label",{for:"st-start"},el("span",{text:"Heure de départ"}),st)));
  let cps=raceCP[stratRace];const auto=!cps||!cps.length;
  if(auto){const step=ri.dist<=12?2:ri.dist<=25?5:ri.dist<=60?10:20;cps=[];for(let d=step;d<ri.dist-0.5;d+=step)cps.push({name:"km "+d,km:d,dplus:Math.round((ri.dplus||0)*d/ri.dist)})}
  const all=[...cps].sort((a,b)=>a.km-b.km).concat([{name:"Arrivée",km:ri.dist,dplus:ri.dplus||0,finish:true}]);
  const [hh,mm]=(st.value||"06:00").split(":").map(Number);const t0=hh*3600+mm*60;
  const clock=s=>{s=Math.round(t0+s)%86400;return String(Math.floor(s/3600)).padStart(2,"0")+":"+String(Math.floor(s%3600/60)).padStart(2,"0")};
  if(pr){
    let prev=0,prevKm=0;
    const rows=all.map(c=>{const x=Math.min(1,(c.km+(c.dplus||0)/100)/ke);const t=PREDICT.elapsed(pr.sec,ke,x);const seg=t-prev;const segKm=c.km-prevKm;prev=t;prevKm=c.km;
      return[c.name,fr(c.km,1)+" km"+(ri.dplus?" · "+(c.dplus||0)+" m":""),PREDICT.fmt(t),clock(t),segKm>0?(kind.startsWith("route")?fmtPace(seg/segKm)+"/km":fr(segKm/(seg/3600))+" km/h"):"",
        c.finish||auto?"":el("button",{type:"button",class:"x",text:"Supprimer",onclick:()=>{raceCP[stratRace]=raceCP[stratRace].filter(z=>z!==c);saveCP();renderStrategy()}})]});
    box.append(tbl(["Point","Distance · D+ cumulé","Temps","Heure","Allure du tronçon",""],rows));
    box.append(el("p",{class:"small",text:(auto?"Points automatiques. Ajoute les vrais ravitos (distance et D+ cumulés, sur la fiche de la course) pour un plan précis. ":"")+"Les temps intègrent un ralentissement progressif de "+Math.round(PREDICT.fade(ke)*100)+" % entre le début et la fin, normal sur cette distance."}));
  }
  const nm=el("input",{type:"text",id:"cp-name",placeholder:"ex. Ravito 1"}),km=el("input",{type:"number",id:"cp-km",inputmode:"decimal",step:"0.1",min:"0"}),dp=el("input",{type:"number",id:"cp-dp",inputmode:"numeric",step:"10",min:"0"});
  const add=el("form",{class:"fields"},el("label",{for:"cp-name"},el("span",{text:"Point de passage"}),nm),el("label",{for:"cp-km"},el("span",{text:"Km"}),km),el("label",{for:"cp-dp"},el("span",{text:"D+ cumulé (m)"}),dp),el("button",{class:"btn primary",type:"submit",text:"Ajouter"}));
  add.onsubmit=e=>{e.preventDefault();if(!(+km.value>0))return;raceCP[stratRace]=(raceCP[stratRace]||[]).concat([{name:nm.value.trim()||"Point "+km.value,km:+km.value,dplus:+dp.value||0}]);saveCP();renderStrategy()};
  box.append(add);
  box.append(el("h3",{text:"Les clés de cette course"}));const ul=el("ul");S.tips.forEach(t=>ul.append(el("li",{text:t})));box.append(ul);
  if(ri.terrain!=="route"){box.append(el("h3",{text:"En montée et en descente"}));const u2=el("ul");
    ["Marche dès que la pente dépasse environ 15 % ou que tu sors de Z2 : sur un trail long, une marche active à 5-6 km/h coûte bien moins qu'une course lente.","Bâtons : pousse avec les deux en même temps dans les raidards, range-les sur le plat.","Descente : petits appuis rapides, bras écartés pour l'équilibre, ne bloque pas les genoux.","Au sommet d'une montée, trottine 1 min pour relancer avant de dérouler la descente."].forEach(t=>u2.append(el("li",{text:t})));box.append(u2)}
  box.append(el("p",{},el("a",{href:"#calcul",text:"Plan de nutrition de cette course →",onclick:()=>presetFromRace(stratRace)}),"  ",el("a",{href:"#routine",text:"Routine avant course →"})));
}
/* ---------- Mes courses ---------- */
function renderMesCourses(){
  const box=document.getElementById("mc-list");box.innerHTML="";
  const races=allRaceInfos();const b=bestTen();
  races.forEach(r=>{
    const past=parse(r.date)<TODAY;const p=b&&r.dist?PREDICT.timeFor(b.t10,r.dist,r.dplus||0,r.terrain||"roulant"):null;
    const row=el("div",{class:"race"+(r.hidden?" off":"")+(past?" past":"")});
    const d=parse(r.date);
    row.append(el("div",{class:"rdate"},el("b",{text:String(d.getUTCDate())}),el("span",{text:MABR[d.getUTCMonth()]+" "+d.getUTCFullYear()})));
    const info=el("div",{class:"rinfo"},el("b",{text:r.name}),el("span",{class:"small",text:(r.dist?fr(r.dist,1)+" km · "+(r.dplus||0)+" m D+"+(r.est?" (D+ estimé : à corriger)":""):"distance à compléter")+" · "+PREDICT.TERRAINS[r.terrain||"roulant"].name+(r.user?" · ajoutée par toi":" · conseillée")+(r.hidden?" · retirée du planning":"")}));
    if(p&&!r.hidden)info.append(el("span",{class:"rpred",text:"Temps théorique "+PREDICT.fmt(p.sec)+" ("+PREDICT.fmt(p.lo)+" à "+PREDICT.fmt(p.hi)+")"}));
    row.append(info);
    const act=el("div",{class:"ract"});
    act.append(el("button",{type:"button",class:"btn",text:"Modifier",onclick:()=>editRace(r,row)}));
    if(r.dist&&!r.hidden)act.append(el("a",{class:"btn",href:"#calcul",text:"Nutrition",onclick:()=>presetFromRace(r.date)}),el("a",{class:"btn",href:"#strategie",text:"Stratégie",onclick:()=>{stratRace=r.date;store.set("stratRace",r.date)}}));
    if(r.user)act.append(el("button",{type:"button",class:"btn",text:"Supprimer",onclick:()=>{userRaces=userRaces.filter(x=>x.id!==r.id);saveRaces();renderMesCourses()}}));
    else act.append(el("button",{type:"button",class:"btn",text:r.hidden?"Remettre":"Je ne la fais pas",onclick:()=>{raceEdits[r.date]=Object.assign({},raceEdits[r.date],{hidden:!r.hidden});saveRaces();renderMesCourses()}}));
    row.append(act);box.append(row);
  });
}
function raceForm(r,onSave,onCancel){
  const f=el("form",{class:"fields raceform"});const id=(r&&r.id)||("u"+Date.now().toString(36));
  const nm=el("input",{type:"text",id:"rf-name-"+id,required:"required",value:r?r.name:"",placeholder:"Nom de la course"});
  const dt=el("input",{type:"date",id:"rf-date-"+id,required:"required",value:r?r.date:iso(addDays(TODAY,30))});
  const di=el("input",{type:"number",id:"rf-dist-"+id,inputmode:"decimal",step:"0.1",min:"1",required:"required",value:r&&r.dist?r.dist:""});
  const dp=el("input",{type:"number",id:"rf-dplus-"+id,inputmode:"numeric",step:"10",min:"0",value:r?(r.dplus||0):0});
  const te=terrainSel("rf-ter-"+id,r?r.terrain:"roulant");
  const rec=r&&!r.user;
  if(rec){nm.disabled=true;dt.disabled=true}
  f.append(el("label",{for:nm.id},el("span",{text:"Nom"}),nm),el("label",{for:dt.id},el("span",{text:"Date"}),dt),el("label",{for:di.id},el("span",{text:"Distance (km)"}),di),
    el("label",{for:dp.id},el("span",{text:"D+ (m)"}),dp),el("label",{for:te.id},el("span",{text:"Terrain"}),te),
    el("div",{class:"controls"},el("button",{class:"btn primary",type:"submit",text:r?"Enregistrer":"Ajouter la course"}),onCancel?el("button",{class:"btn",type:"button",text:"Annuler",onclick:onCancel}):null));
  f.onsubmit=e=>{e.preventDefault();onSave({id,name:nm.value.trim(),date:dt.value,dist:+di.value,dplus:+dp.value||0,terrain:te.value})};
  return f;
}
function editRace(r,row){
  const f=raceForm(r,v=>{if(r.user){userRaces=userRaces.map(x=>x.id===r.id?v:x)}else{raceEdits[r.date]=Object.assign({},raceEdits[r.date],{dist:v.dist,dplus:v.dplus,terrain:v.terrain,est:false})}saveRaces();renderMesCourses()},()=>renderMesCourses());
  row.replaceWith(f);
}
function initAddRace(){
  const box=document.getElementById("mc-add");box.innerHTML="";
  box.append(raceForm(null,v=>{userRaces.push(v);saveRaces();initAddRace();renderMesCourses();document.getElementById("mc-msg").textContent=v.name+" ajoutée : elle apparaît dans le planning et dans les temps théoriques."}));
}

/* ---------- Navigation (onglets regroupés) ---------- */
const GROUPS=[
  {id:"accueil",name:"Accueil",views:[["accueil","Accueil"]]},
  {id:"entrainement",name:"Planning",views:[["planning","Calendrier"],["progres","Progression"],["routine","Routine course"]]},
  {id:"courses",name:"Courses",views:[["mescourses","Mes courses"],["temps","Temps théoriques"],["strategie","Stratégie de course"],["courses","Calendrier des courses"],["objectifs","Objectifs Diag"]]},
  {id:"nutrition",name:"Nutrition",views:[["calcul","Calcul nutrition"],["nutrition","Guide nutrition"]]},
  {id:"infos",name:"Infos",views:[["reglages","Montre Garmin"],["materiel","Matériel"],["plan","Plan et règles"]]}
];
const VIEWS=GROUPS.flatMap(g=>g.views.map(v=>v[0]));
const groupOf=v=>GROUPS.find(g=>g.views.some(x=>x[0]===v));
let curView="accueil";
function buildNav(){
  const nav=document.getElementById("nav-main");nav.innerHTML="";
  GROUPS.forEach(g=>nav.append(el("a",{href:"#"+g.views[0][0],"data-g":g.id,text:g.name})));
}
function show(){
  let v=(location.hash||"").slice(1);if(!VIEWS.includes(v))v="accueil";curView=v;
  const g=groupOf(v);
  VIEWS.forEach(x=>{document.getElementById("v-"+x).hidden=x!==v});
  document.querySelectorAll("#nav-main a").forEach(a=>{if(a.dataset.g===g.id){a.setAttribute("aria-current","page");a.scrollIntoView({block:"nearest",inline:"nearest"})}else a.removeAttribute("aria-current")});
  const sub=document.getElementById("nav-sub");sub.innerHTML="";sub.hidden=g.views.length<2;
  g.views.forEach(([id,name])=>{const a=el("a",{href:"#"+id,text:name});if(id===v)a.setAttribute("aria-current","page");sub.append(a)});
  if(v==="planning"){view={y:selected.getUTCFullYear(),m:selected.getUTCMonth()};renderPlanning()}
  if(v==="accueil")renderHome();
  if(v==="progres")renderProgress();
  if(v==="calcul")renderCalc();
  if(v==="temps"){renderTemps();document.getElementById("t-whatif")._go()}
  if(v==="mescourses")renderMesCourses();
  if(v==="strategie")renderStrategy();
  if(v==="reglages")renderReglages();
}
window.addEventListener("hashchange",()=>{show();window.scrollTo(0,0)});
let rz;window.addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(curView==="progres")renderProgress()},200)});
document.getElementById("mode-base").onclick=()=>{mode="base";store.set("mode",mode);renderPlanning()};
document.getElementById("mode-race").onclick=()=>{mode="race";store.set("mode",mode);renderPlanning()};
document.getElementById("site-t").onclick=()=>{site="t";store.set("site",site);renderPlanning()};
document.getElementById("site-p").onclick=()=>{site="p";store.set("site",site);renderPlanning()};
document.getElementById("prev").onclick=()=>{view.m--;if(view.m<0){view.m=11;view.y--}renderPlanning()};
document.getElementById("next").onclick=()=>{view.m++;if(view.m>11){view.m=0;view.y++}renderPlanning()};
document.getElementById("today-btn").onclick=()=>{selected=(TODAY>=FIRST&&TODAY<=LAST)?TODAY:FIRST;view={y:selected.getUTCFullYear(),m:selected.getUTCMonth()};renderPlanning()};
document.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{pk=b.dataset.pk;store.set("pk",pk);renderPack()});
document.getElementById("check-reset").onclick=()=>{store.setJson("check",{});renderChecklist()};
buildNav();initWhatIf();initAddRace();renderCourses();renderPack();renderChecklist();initProgressForms();show();
maybeAutoSync();
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")maybeAutoSync()});
