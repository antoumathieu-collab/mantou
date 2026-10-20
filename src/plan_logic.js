/* ---------- Logique du planning (pure, sans DOM : utilisée par l'appli et par le générateur de calendrier) ---------- */
const parse=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,d))};
const iso=d=>d.toISOString().slice(0,10);
const addDays=(d,n)=>new Date(d.getTime()+n*864e5);
const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const SITE={t:"Tarbes",p:"Périgueux"};
const durOf=v=>(v.match(/(\d+ h(?: \d+)?|\d+ min)/)||["—"])[0];
const S=(kind,title,dur,text,note,short)=>({kind,title,dur,text,note:note||"",short:short||title});

function weeksFor(mode){return mode==="race"?BASE.concat(EXT):BASE}
/* Courses actives : conseillées (mode « avec courses », sauf masquées) + courses ajoutées par l'utilisateur (tous modes) */
function activeRaces(ctx){const h=ctx.hidden||[];const rec=ctx.mode==="race"?RACES.filter(r=>!h.includes(r[0])):[];return rec.concat(ctx.extra||[]).sort((a,b)=>a[0]<b[0]?-1:1)}
function raceOn(d,ctx){const k=iso(d);return activeRaces(ctx).find(r=>r[0]===k)||null}
function raceInWeek(w,ctx){const s=parse(w[1]);return activeRaces(ctx).find(r=>{const x=(parse(r[0])-s)/864e5;return x>=0&&x<7})||null}

function baseSession(w,dow,site){
  const [n,,phase,h,dp,tue,sat,sun]=w;
  const light=/Allégée|Récup|Affûtage|Course|Reprise/.test(phase);
  const P=site==="p";
  if(n===34){
    if(dow===0) return S("rest","Repos","—","Repos complet. Prépare le sac et vérifie la liste du matériel obligatoire.");
    if(dow===1) return S("hard","Rappel d'allure","40 min","15 min Z1, puis "+tue+", retour au calme 10 min.","","Rappel d'allure · "+tue);
    if(dow===2) return S("easy","Footing court","30 min","30 min Z1 très facile. Voyage vers Andorre si besoin.");
    if(dow===3) return S("race","Andorra Trail 80K","14-16 h","79 km, 3 900 m D+. Objectif : finir en 14-16 h, nutrition selon l'onglet Calcul nutrition.","Date exacte du départ (10 ou 11 juin) à confirmer sur le site officiel.","COURSE · Andorra Trail 80K");
    if(dow===4) return S("race","Andorra (si départ le 11)","—","Si ton départ est le 11 juin, c'est le jour de course. Sinon, repos.","","Andorra (si départ le 11)");
    return S("rest","Récupération","—","Marche tranquille, sommeil, repas complets.");
  }
  if(dow===0) return S("rest","Repos","—","Repos. Option : 15 min de mobilité chevilles et hanches.");
  if(dow===1){
    if(tue.startsWith("EASY:")) return S("easy","Footing facile","45 min",tue.slice(5));
    return S("hard","Séance de qualité","1 h","Échauffement 20 min Z1-Z2, puis "+tue+", retour au calme 10 min. "+(P?"Sur le plat ou sur ta plus longue côte de Périgueux.":"En montée si la séance le dit, sinon sur le plat."),"Si les jambes ne sont pas revenues de la sortie longue, fais 45 min Z2 à la place.","Qualité · "+tue);
  }
  if(dow===2){
    if(h<=3) return S("rest","Repos","—","Repos ou marche.");
    return S("gym","Salle A + footing",light?"45 min":"1 h 15",(light?"Séance A à 60 % de la charge (squat, step-ups, mollets). ":"Séance A complète : squat, fente bulgare, step-up lesté, soulevé de terre roumain, descente excentrique, mollets. ")+(P?"Puis 20 min de tapis incliné à 12-15 %.":"Puis 20 min de footing Z1."));
  }
  if(dow===3){
    if(h<=3) return S("easy","Footing libre","30 min","Au ressenti, Z1-Z2.");
    return S("easy","Endurance fondamentale",h<=6?"45 min":"1 h","Z2, aisance respiratoire. "+(P?"Ajoute 6-8 lignes droites de 20 s.":"Parcours vallonné."),"Toujours facile, même si tu te sens bien.","Endurance Z2 · "+(h<=6?"45 min":"1 h"));
  }
  if(dow===4){
    if(light||h<=3) return S("rest","Repos","—","Repos (semaine allégée : une seule séance de salle).");
    return S("gym","Salle B","45 min","Planche, planche latérale, dead bug, rowing haltère, pompes, pont fessier une jambe, 10 min de mobilité.");
  }
  const val=dow===5?sat:sun;
  if(val.startsWith("RACE:")){const [t,txt]=val.slice(5).split("|");return S("race",t,"Course",txt||t,"La veille : repas riche en glucides. Le lendemain : Z1 ou repos.","COURSE · "+t)}
  if(val==="Repos") return S("rest","Repos","—","Repos.");
  const dplus=P?Math.round(dp/2/100)*100:dp;
  if(dow===5){
    const isSL=val.startsWith("SL");
    return S("easy",isSL?"Sortie longue":"Sortie",durOf(val),val.replace(/^SL /,"Sortie longue de ")+". "+(dp>0?(P?"Parcours le plus vallonné, avec des répétitions de côtes, pour viser ~"+dplus+" m D+ sur la semaine.":"En montagne : vise ~"+dplus+" m D+ sur la semaine, marche dès que tu sors de Z2."):""),h>=8?"Mange dès la 1re heure : la cible est dans l'onglet Calcul nutrition.":"",(isSL?"Sortie longue ":"Sortie ")+durOf(val));
  }
  return S("easy","Sortie moyenne",durOf(val),val+(P?", sur parcours vallonné.":", en montagne sur jambes fatiguées."),"","Sortie moyenne · "+val);
}
function lookup(d,mode){
  for(const w of weeksFor(mode)){const diff=Math.round((d-parse(w[1]))/864e5);if(diff>=0&&diff<7)return{w,dow:diff}}
  return null;
}
function range(mode){const W=weeksFor(mode);return[parse(W[0][1]),addDays(parse(W.at(-1)[1]),6)]}

/* Séance d'un jour donné. ctx = {mode:"race"|"base", site:"t"|"p"} */
function sessionFor(date,ctx){
  const L=lookup(date,ctx.mode);if(!L)return null;
  const w=L.w,dow=L.dow;let s=null;
  const r=raceOn(date,ctx);
  if(r){ s=S("race",r[1],"Course",r[2],"La veille : repas riche en glucides. Le lendemain : Z1 ou repos.","COURSE · "+r[1]); s.raceDate=r[0]; }
  if(!s){
    const wr=raceInWeek(w,ctx);
    if(wr && !/^RACE:/.test(w[6]+w[7]) && w[0]!==34){
      const rd=(parse(wr[0])-parse(w[1]))/864e5;
      if(dow===5 && rd===6) s=S("easy","Veille de course","40 min","40 min Z1 + 4 lignes droites de 20 s. Prépare ton sac et ta nutrition.","","Veille de course · 40 min Z1");
      else if(dow===6 && rd===5) s=S("rest","Lendemain de course","—","Repos ou 30 min Z1 très facile.");
    }
  }
  if(!s && dow===1){
    const pr=raceOn(addDays(date,-2),ctx)||raceOn(addDays(date,-3),ctx);
    if(pr && pr[3] && pr[1]!=="10 km route") s=S("easy","Footing de récupération","45 min","Lendemain de course longue : 45 min Z1-Z2 à la place de la qualité.","On reprend la séance de qualité la semaine suivante.","Récup · footing 45 min");
  }
  if(!s) s=baseSession(w,dow,ctx.site);
  s.week=w;s.dow=dow;
  s.run=(s.kind==="easy"||s.kind==="hard"||s.kind==="race") && s.dur!=="—";
  /* sport par défaut pour la saisie de vitesse */
  if(s.kind==="race") s.sport=/10 km route/.test(s.title)?"route":"trail";
  else if(s.kind==="hard") s.sport="route";
  else if(/Sortie/.test(s.title)) s.sport=ctx.site==="t"?"trail":"route";
  else s.sport="route";
  /* allure de référence (s/km) pour pré-remplir la molette */
  s.refPace=s.kind==="race"?(s.sport==="route"?252:540):s.kind==="hard"?260:(s.sport==="trail"?420:330);
  s.routineLink=s.kind==="race"||/Veille de course/.test(s.title)||w[0]===34||/Affûtage|Course/.test(w[2])||!!raceInWeek(w,ctx);
  return s;
}
/* Nombre de séances (hors repos) prévues sur une semaine */
function plannedInWeek(w,ctx){let n=0;for(let i=0;i<7;i++){const s=sessionFor(addDays(parse(w[1]),i),ctx);if(s&&s.kind!=="rest")n++}return n}

return {activeRaces,BASE,EXT,RACES,COURSES,PACKS,CHECK,parse,iso,addDays,MONTHS,DAYS,SITE,weeksFor,raceOn,raceInWeek,lookup,range,sessionFor,plannedInWeek};
