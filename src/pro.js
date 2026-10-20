/* ---------- Moteur « pro » (pur, testable) ----------
Charge : modèle forme/fatigue (Banister ; CTL 42 j, ATL 7 j, TSB = CTL − ATL de la veille), charge de séance type TSS
(durée × intensité², 100 = 1 h au seuil). Charge de la montre (intervals.icu) prioritaire, sinon estimée.
Forme du jour : VFC et FC repos comparées à ta moyenne des 28 derniers jours, sommeil, check-in du matin, fraîcheur. */
const PRO=(function(){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const IF_RPE=r=>r<=3?.65:r===4?.72:r===5?.78:r===6?.83:r===7?.88:r===8?.93:1.0;
  /* Durée prévue d'une séance (min) à partir de son libellé : "1 h 15", "45 min", "14-16 h" */
  function parseMin(t){if(!t)return 0;let m=String(t).match(/(\d+)(?:-(\d+))?\s*h(?:\s*(\d+))?/);if(m){const h=m[2]?(+m[1]+ +m[2])/2:+m[1];return h*60+(+m[3]||0)}m=String(t).match(/(\d+)\s*min/);return m?+m[1]:0}
  function loadOf(rec,kind,plannedMin){
    if(rec&&rec.load!=null&&rec.load>0)return rec.load;
    const min=rec&&rec.time?rec.time/60:(plannedMin||0);if(!min)return 0;
    let IF;
    if(rec&&rec.rpe)IF=IF_RPE(rec.rpe);
    else if(kind==="hard")IF=.85;else if(kind==="race")IF=min>240?.75:min>120?.85:.95;else if(kind==="gym")IF=.6;else IF=.72;
    return Math.round(min/60*IF*IF*100);
  }
  const kC=1-Math.exp(-1/42),kA=1-Math.exp(-1/7);
  /* loads : {"YYYY-MM-DD": charge}, from/to ISO ; seed {ctl,atl} au jour précédant from */
  function pmc(loads,from,to,seed){
    const out=[];let ctl=seed&&seed.ctl||0,atl=seed&&seed.atl||0;
    for(let d=new Date(from+"T00:00:00Z");d<=new Date(to+"T00:00:00Z");d=new Date(d.getTime()+864e5)){
      const k=d.toISOString().slice(0,10);const L=loads[k]||0;const tsb=ctl-atl;
      ctl+=(L-ctl)*kC;atl+=(L-atl)*kA;out.push({d:k,load:L,ctl,atl,tsb});
    }
    return out;
  }
  function tsbZone(t){return t>15?{z:"tres-frais",name:"Très frais",note:"idéal le jour d'une course, mais au-delà de quelques jours on perd de la forme"}:
    t>=5?{z:"frais",name:"Frais",note:"prêt à courir vite"}:t>=-10?{z:"neutre",name:"Neutre",note:"équilibre entre charge et récupération"}:
    t>=-30?{z:"charge",name:"En charge",note:"zone productive : tu construis ta forme"}:{z:"surcharge",name:"Surcharge",note:"risque de blessure et de méforme, lève le pied"}}
  /* Moyenne / écart-type sur les n jours avant date (exclu) */
  function baseline(well,field,date,n){
    const v=[];for(const w of well){if(w.date<date&&w.date>=shift(date,-n)&&w[field]!=null&&w[field]>0)v.push(+w[field])}
    if(v.length<5)return null;const m=v.reduce((a,b)=>a+b,0)/v.length;const sd=Math.sqrt(v.reduce((a,b)=>a+(b-m)*(b-m),0)/v.length)||m*0.05;return{mean:m,sd,count:v.length};
  }
  function shift(iso,n){return new Date(new Date(iso+"T00:00:00Z").getTime()+n*864e5).toISOString().slice(0,10)}
  /* Forme du jour : 0-100, vert ≥ 70, orange 50-69, rouge < 50 */
  function readiness({date,checkin,well,tsb}){
    let s=70;const why=[];let hasData=false;
    const today=well&&well.find(w=>w.date===date);
    if(today&&today.hrv){const b=baseline(well,"hrv",date,28);if(b){hasData=true;const z=(today.hrv-b.mean)/b.sd;
      if(z<-1){s-=15;why.push(["bad","VFC basse : "+Math.round(today.hrv)+" ms (moyenne "+Math.round(b.mean)+")"])}
      else if(z<-0.5){s-=7;why.push(["warn","VFC un peu basse : "+Math.round(today.hrv)+" ms (moyenne "+Math.round(b.mean)+")"])}
      else if(z>0.5){s+=5;why.push(["good","VFC haute : "+Math.round(today.hrv)+" ms"])}
      else why.push(["good","VFC normale : "+Math.round(today.hrv)+" ms"])}}
    if(today&&today.rhr){const b=baseline(well,"rhr",date,28);if(b){hasData=true;const d=today.rhr-b.mean;
      if(d>=5){s-=10;why.push(["bad","FC au repos haute : "+Math.round(today.rhr)+" (+"+Math.round(d)+")"])}
      else if(d>=3){s-=5;why.push(["warn","FC au repos un peu haute : "+Math.round(today.rhr)+" (+"+Math.round(d)+")"])}}}
    let sleepH=checkin&&checkin.sleepH!=null?checkin.sleepH:(today&&today.sleepSecs?today.sleepSecs/3600:null);
    if(sleepH!=null){hasData=true;if(sleepH<6){s-=10;why.push(["bad","Sommeil court : "+sleepH.toFixed(1).replace(".",",")+" h"])}else if(sleepH<7){s-=5;why.push(["warn","Sommeil un peu court : "+sleepH.toFixed(1).replace(".",",")+" h"])}else if(sleepH>=8){s+=4;why.push(["good","Bonne nuit : "+sleepH.toFixed(1).replace(".",",")+" h"])}}
    if(today&&today.sleepScore&&today.sleepScore<60){s-=5;why.push(["warn","Score de sommeil bas : "+today.sleepScore])}
    if(checkin){hasData=true;
      const q=(v,good,label,inv)=>{if(v==null)return;const x=inv?6-v:v;s+=(x-3)*4;if(x<=2)why.push(["warn",label])};
      q(checkin.sleepQ,true,"Mauvaise qualité de sommeil");q(checkin.energy,true,"Peu d'énergie");q(checkin.motivation,true,"Motivation basse");
      q(checkin.soreness,true,"Courbatures marquées",true);q(checkin.stress,true,"Stress élevé",true);}
    if(tsb!=null){if(tsb<-30){s-=15;why.push(["bad","Fatigue accumulée : fraîcheur "+Math.round(tsb)])}else if(tsb<-20){s-=8;why.push(["warn","Fraîcheur basse : "+Math.round(tsb)])}else if(tsb>10){s+=4;why.push(["good","Bien reposé : fraîcheur +"+Math.round(tsb)])}}
    let pain=checkin&&checkin.pain;
    if(pain){s=Math.min(s,40);why.unshift(["bad","Douleur signalée"+(checkin.painWhere?" : "+checkin.painWhere:"")])}
    s=clamp(Math.round(s),0,100);
    const level=pain||s<50?"rouge":s<70?"orange":"vert";
    return{score:s,level,why,hasData,pain:!!pain};
  }
  /* Multiplie les durées d'un texte ("2 h 15", "45 min") */
  function scaleText(t,f){if(f===1||!t)return t;
    return String(t).replace(/(\d+)\s*h\s*(\d+)?(?!\s*min)/g,(m,h,mm)=>{const tot=Math.round(((+h)*60+(+mm||0))*f/5)*5;const H=Math.floor(tot/60),M=tot%60;return H?H+" h"+(M?" "+String(M).padStart(2,"0"):""):M+" min"})
      .replace(/(\d+)\s*min/g,(m,x)=>Math.max(10,Math.round((+x)*f/5)*5)+" min")}
  /* Adapte une séance selon la forme du jour */
  function adapt(s,level){
    if(!s||level==="vert"||s.kind==="rest")return null;
    const c=Object.assign({},s);
    if(level==="rouge"){
      if(s.kind==="race")return{title:s.title,text:"Course prévue : écoute ton corps à l'échauffement. Si la douleur ou le malaise persiste, ne prends pas le départ.",kind:"race",dur:s.dur};
      if(s.kind==="gym")return{title:"Mobilité légère",kind:"gym",dur:"20 min",text:"Pas de charge aujourd'hui : 20 min de mobilité et d'étirements doux."};
      return{title:"Repos ou footing très facile",kind:"easy",dur:"30 min",text:"Repos complet, ou 30 min en Z1 si tu te sens mieux en bougeant. Pas d'intensité. On reprend le plan dès que la forme revient au vert."};
    }
    if(s.kind==="hard")return{title:"Endurance à la place de la qualité",kind:"easy",dur:"45 min",text:"Forme moyenne : remplace la séance de qualité par 45 min en Z2. Décale la qualité à un jour où tu es au vert, sans l'empiler avec la sortie longue."};
    if(s.kind==="easy"&&/Sortie longue/.test(s.title))return{title:"Sortie longue raccourcie",kind:"easy",dur:scaleText(s.dur,0.75),text:scaleText(s.text,0.75)+" Forme moyenne : durée réduite de 25 %, Z2 strict."};
    if(s.kind==="gym")return{title:s.title+" (allégée)",kind:"gym",dur:s.dur,text:"Forme moyenne : fais la séance à 70 % de la charge, une série de moins."};
    if(s.kind==="easy")return{title:s.title+" (raccourcie)",kind:"easy",dur:scaleText(s.dur,0.8),text:scaleText(s.text,0.8)+" Forme moyenne : 20 % plus court, Z1-Z2."};
    return null;
  }
  /* Jours de récupération après une course, selon le km-effort */
  const recoveryDays=ke=>clamp(Math.round(ke/6),2,28);
  /* Cible de fraîcheur le jour J */
  const taperTarget=(ke,prio)=>prio==="C"?null:ke<=45?{lo:5,hi:15}:{lo:10,hi:25};
  return{parseMin,loadOf,pmc,tsbZone,baseline,readiness,scaleText,adapt,recoveryDays,taperTarget,shift,IF_RPE};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=PRO;
