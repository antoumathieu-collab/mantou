/* ---------- Logique du planning (pure, sans DOM : utilisée par l'appli et par le générateur de calendrier) ---------- */
const parse=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,d))};
const iso=d=>d.toISOString().slice(0,10);
const addDays=(d,n)=>new Date(d.getTime()+n*864e5);
const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const SITE={t:"Tarbes",p:"Périgueux"};
const durOf=v=>(v.match(/(\d+ h(?: \d+)?|\d+ min)/)||["—"])[0];
const S=(kind,title,dur,text,note,short)=>({kind,title,dur,text,note:note||"",short:short||title});

/* Calendrier ENIT 2026-2027, S5APP puis S6APP : semaines école = Tarbes, semaines entreprise = Périgueux (SNCF) */
const ENIT_BLOCKS=[{from:"2026-08-31",to:"2026-09-20",site:"p"},{from:"2026-09-21",to:"2026-10-25",site:"t"},{from:"2026-10-26",to:"2026-11-22",site:"p"},
 {from:"2026-11-23",to:"2026-12-20",site:"t"},{from:"2026-12-21",to:"2027-02-21",site:"p"},{from:"2027-02-22",to:"2027-04-04",site:"t"},
 {from:"2027-04-05",to:"2027-05-09",site:"p"},{from:"2027-05-10",to:"2027-06-20",site:"t"},{from:"2027-06-21",to:"2027-08-29",site:"p"}];
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
,
  C:[{id:"goblet",name:"Squat goblet",sets:3,lo:10,hi:12,unit:"rép",start:20,inc:2,tip:"Haltère contre la poitrine, descente contrôlée"},
     {id:"sdt",name:"Soulevé de terre (barre ou trap bar)",sets:3,lo:5,hi:6,unit:"rép",start:50,inc:2.5,tip:"Dos plat, pousse le sol"},
     {id:"fentesm",name:"Fentes marchées",sets:3,lo:10,hi:10,unit:"rép/jambe",start:16,inc:2,tip:"Total des 2 haltères, buste droit"},
     {id:"tirage",name:"Tirage vertical (ou tractions)",sets:3,lo:8,hi:10,unit:"rép",start:40,inc:2.5,tip:"Omoplates serrées, poitrine haute"},
     {id:"dch",name:"Développé couché haltères",sets:3,lo:8,hi:10,unit:"rép",start:14,inc:2,tip:"Charge d'un haltère"},
     {id:"pallof",name:"Pallof press (élastique ou poulie)",sets:3,lo:12,hi:12,unit:"rép/côté",start:0,inc:0,tip:"Anti-rotation : le tronc ne bouge pas"},
     {id:"mollets",name:"Mollets à une jambe (tendue + fléchie)",sets:3,lo:12,hi:15,unit:"rép/jambe",start:0,inc:2,tip:"0 kg = poids du corps"}],
  D:[{id:"tirage",name:"Tirage vertical (ou tractions)",sets:4,lo:6,hi:10,unit:"rép",start:40,inc:2.5,tip:"Omoplates serrées, poitrine haute"},
     {id:"rowbarre",name:"Rowing barre",sets:3,lo:8,hi:10,unit:"rép",start:30,inc:2.5,tip:"Dos plat, tire vers le nombril"},
     {id:"facepull",name:"Face pull (poulie ou élastique)",sets:3,lo:15,hi:15,unit:"rép",start:10,inc:2,tip:"Coudes hauts : posture et épaules"},
     {id:"rowing",name:"Rowing haltère",sets:3,lo:10,hi:12,unit:"rép/bras",start:16,inc:2,tip:"Charge d'un haltère"},
     {id:"extlomb",name:"Extension lombaire",sets:3,lo:12,hi:15,unit:"rép",start:0,inc:2,tip:"Monte jusqu'à l'alignement, pas plus"},
     {id:"ytw",name:"Y-T-W allongé",sets:2,lo:8,hi:8,unit:"rép par lettre",start:0,inc:1,tip:"Lent et contrôlé, très léger"},
     {id:"planchelat",name:"Planche latérale",sets:3,lo:30,hi:45,unit:"s/côté",start:0,inc:0,tip:"Hanche haute"}],
  E:[{id:"dch",name:"Développé couché haltères",sets:4,lo:8,hi:10,unit:"rép",start:14,inc:2,tip:"Charge d'un haltère"},
     {id:"militaire",name:"Développé militaire haltères",sets:3,lo:8,hi:10,unit:"rép",start:10,inc:2,tip:"Charge d'un haltère, gainage serré"},
     {id:"pompes",name:"Pompes",sets:3,lo:8,hi:20,unit:"rép",start:0,inc:0,tip:"Max propre"},
     {id:"dips",name:"Dips (assistés si besoin)",sets:3,lo:8,hi:12,unit:"rép",start:0,inc:2,tip:"Épaules basses, descente à 90°"},
     {id:"elevlat",name:"Élévations latérales",sets:3,lo:12,hi:15,unit:"rép",start:6,inc:1,tip:"Charge d'un haltère, sans élan"},
     {id:"deadbug",name:"Dead bug",sets:3,lo:10,hi:10,unit:"rép/côté",start:0,inc:0,tip:"Lombaires collées au sol"}]
};
/* Version maison : poids du corps, une chaise, un sac à dos (lesté de livres ou de bouteilles) et un tapis */
const HOME={
  A:[{id:"h_bulgare",name:"Fente bulgare (pied arrière sur une chaise)",sets:3,lo:10,hi:15,unit:"rép/jambe",start:0,inc:0,tip:"Sac à dos lesté quand 15 devient facile"},
     {id:"h_stepup",name:"Step-up sur chaise ou marche",sets:3,lo:12,hi:15,unit:"rép/jambe",start:0,inc:0,tip:"Pousse avec la jambe du haut, pas d'élan"},
     {id:"h_sdtuni",name:"Soulevé de terre à une jambe (sac à dos)",sets:3,lo:10,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"Dos plat, bassin de face : équilibre de traileur"},
     {id:"h_exc",name:"Descente de marche excentrique",sets:3,lo:10,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"4 s pour descendre : protège les genoux en descente"},
     {id:"h_chaise",name:"Chaise contre le mur",sets:3,lo:45,hi:75,unit:"s",start:0,inc:0,tip:"Cuisses parallèles au sol"},
     {id:"h_mollets",name:"Mollets à une jambe sur une marche",sets:3,lo:15,hi:20,unit:"rép/jambe",start:0,inc:0,tip:"Talon sous la marche, montée complète"}],
  B:[{id:"planche",name:"Planche ventrale",sets:3,lo:45,hi:60,unit:"s",start:0,inc:0,tip:"Bassin neutre"},
     {id:"planchelat",name:"Planche latérale",sets:3,lo:30,hi:45,unit:"s/côté",start:0,inc:0,tip:"Hanche haute"},
     {id:"deadbug",name:"Dead bug",sets:3,lo:10,hi:10,unit:"rép/côté",start:0,inc:0,tip:"Lombaires collées au sol"},
     {id:"h_rowsac",name:"Rowing sac à dos (ou tirage sous une table)",sets:3,lo:12,hi:15,unit:"rép",start:0,inc:0,tip:"Omoplates serrées en haut"},
     {id:"pompes",name:"Pompes",sets:3,lo:8,hi:20,unit:"rép",start:0,inc:0,tip:"Max propre"},
     {id:"pont",name:"Pont fessier à une jambe",sets:3,lo:12,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"Fessier, pas les lombaires"}],
  C:[{id:"h_squat",name:"Squat lent (3 s pour descendre)",sets:3,lo:15,hi:20,unit:"rép",start:0,inc:0,tip:"Sac à dos lesté dans les bras si trop facile"},
     {id:"h_fentes",name:"Fentes arrière alternées",sets:3,lo:10,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"Genou avant au-dessus de la cheville"},
     {id:"pompes",name:"Pompes",sets:3,lo:8,hi:20,unit:"rép",start:0,inc:0,tip:"Max propre"},
     {id:"h_rowsac",name:"Rowing sac à dos (ou tirage sous une table)",sets:3,lo:12,hi:15,unit:"rép",start:0,inc:0,tip:"Omoplates serrées en haut"},
     {id:"h_sdtuni",name:"Soulevé de terre à une jambe (sac à dos)",sets:3,lo:10,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"Dos plat, bassin de face"},
     {id:"h_mollets",name:"Mollets à une jambe sur une marche",sets:3,lo:15,hi:20,unit:"rép/jambe",start:0,inc:0,tip:"Montée complète"},
     {id:"planche",name:"Planche ventrale",sets:3,lo:45,hi:60,unit:"s",start:0,inc:0,tip:"Bassin neutre"}],
  D:[{id:"h_rowsac",name:"Rowing sac à dos (ou tirage sous une table)",sets:4,lo:12,hi:15,unit:"rép",start:0,inc:0,tip:"Omoplates serrées en haut"},
     {id:"h_superman",name:"Superman",sets:3,lo:12,hi:15,unit:"rép",start:0,inc:0,tip:"2 s en haut, regard vers le sol"},
     {id:"h_ytw",name:"Y-T-W allongé au sol",sets:2,lo:8,hi:10,unit:"rép par lettre",start:0,inc:0,tip:"Lent, pouces vers le plafond"},
     {id:"h_birddog",name:"Bird dog",sets:3,lo:10,hi:10,unit:"rép/côté",start:0,inc:0,tip:"Bassin immobile"},
     {id:"planchelat",name:"Planche latérale",sets:3,lo:30,hi:45,unit:"s/côté",start:0,inc:0,tip:"Hanche haute"},
     {id:"pont",name:"Pont fessier à une jambe",sets:3,lo:12,hi:12,unit:"rép/jambe",start:0,inc:0,tip:"Fessier, pas les lombaires"}],
  E:[{id:"pompes",name:"Pompes",sets:4,lo:8,hi:20,unit:"rép",start:0,inc:0,tip:"Max propre"},
     {id:"h_pike",name:"Pompes piquées (épaules)",sets:3,lo:6,hi:10,unit:"rép",start:0,inc:0,tip:"Fesses hautes, tête entre les mains"},
     {id:"h_dips",name:"Dips sur une chaise",sets:3,lo:10,hi:15,unit:"rép",start:0,inc:0,tip:"Épaules basses, descente à 90°"},
     {id:"h_pompesdecl",name:"Pompes pieds surélevés",sets:3,lo:6,hi:12,unit:"rép",start:0,inc:0,tip:"Pieds sur la chaise, gainage serré"},
     {id:"h_touches",name:"Planche haute, touches d'épaule",sets:3,lo:10,hi:10,unit:"rép/côté",start:0,inc:0,tip:"Bassin immobile"},
     {id:"deadbug",name:"Dead bug",sets:3,lo:10,hi:10,unit:"rép/côté",start:0,inc:0,tip:"Lombaires collées au sol"}]
};
const LIGHT_HA=["h_stepup","h_exc","h_mollets"];
function homeLines(type,light){let ex=HOME[type];if(light&&type==="A")ex=ex.filter(e=>LIGHT_HA.includes(e.id));
  return ex.map(e=>e.name+" "+(light?Math.max(2,e.sets-1):e.sets)+" × "+(e.lo===e.hi?e.lo:e.lo+"-"+e.hi)+" "+e.unit).join(" · ")}
const GYM_NAMES={A:"Jambes et force",B:"Gainage et haut du corps",C:"Full body coureur",D:"Dos et posture",E:"Pecs et épaules"};
const LIGHT_A=["squat","stepup","mollets"];
function gymLines(type,light){let ex=GYM[type];if(light&&type==="A")ex=ex.filter(e=>LIGHT_A.includes(e.id));
  return ex.map(e=>e.name+" "+(light?Math.max(2,e.sets-1):e.sets)+" × "+(e.lo===e.hi?e.lo:e.lo+"-"+e.hi)+" "+e.unit).join(" · ")}
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
    const g=S("gym","Salle A · Jambes + footing",light?"45 min":"1 h 15",(light?"Jambes à 60 % de la charge : ":"Jambes et force : ")+gymLines("A",light)+". "+(P?"Puis 20 min de tapis incliné à 12-15 %.":"Puis 20 min de footing Z1."),"","💪 Salle A · Jambes + footing");g.gymType="A";return g;
  }
  if(dow===3){
    if(h<=3) return S("easy","Footing libre","30 min","Au ressenti, Z1-Z2.");
    return S("easy","Endurance fondamentale",h<=6?"45 min":"1 h","Z2, aisance respiratoire. "+(P?"Ajoute 6-8 lignes droites de 20 s.":"Parcours vallonné."),"Toujours facile, même si tu te sens bien.","Endurance Z2 · "+(h<=6?"45 min":"1 h"));
  }
  if(dow===4){
    if(light||h<=3) return S("rest","Repos","—","Repos (semaine allégée : une seule séance de salle).");
    /* rotation sur les vendredis réellement travaillés (les semaines allégées n'en ont pas) */
    const k=BASE.concat(EXT).filter(x=>x[0]<n&&!/Allégée|Récup|Affûtage|Course|Reprise/.test(x[2])&&x[3]>3).length;
    const t=["C","D","E","B"][k%4];
    const g=S("gym","Salle · "+GYM_NAMES[t],t==="C"?"50 min":"45 min",GYM_NAMES[t]+" : "+gymLines(t,false)+". Puis 10 min de mobilité.","","💪 Salle · "+GYM_NAMES[t]);g.gymType=t;return g;
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

return {GYM,HOME,LIGHT_HA,homeLines,GYM_NAMES,gymLines,ENIT_BLOCKS,activeRaces,BASE,EXT,RACES,COURSES,PACKS,CHECK,parse,iso,addDays,MONTHS,DAYS,SITE,weeksFor,raceOn,raceInWeek,lookup,range,sessionFor,plannedInWeek};
