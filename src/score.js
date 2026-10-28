/* ---------- Forme du jour : score et adaptation (partagé entre l'appli, les fonctions Netlify et le calendrier) ----------
Score /100 : sommeil 30 pts (réponse, sinon montre : score Garmin ou heures), jambes 40 pts, douleur 30 pts.
Pénalités : FC repos ≥ +5 bpm (−15) ou ≥ +8 (−25) vs moyenne des 7 jours précédents ; VFC < 85 % (−15) ou < 75 % (−25) de sa moyenne ;
pénalité totale plafonnée à −30. Vert ≥ 70, orange 50-69, rouge < 50 ou douleur ≥ 2. */
const SCORE=(function(){
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const shift=(iso,n)=>new Date(new Date(iso+"T00:00:00Z").getTime()+n*864e5).toISOString().slice(0,10);
  function avgPrev(well,field,date,n){const lo=shift(date,-n);const v=(well||[]).filter(w=>w&&w.date<date&&w.date>=lo&&w[field]>0).map(w=>+w[field]);return v.length>=3?v.reduce((a,b)=>a+b,0)/v.length:null}
  function compute({date,ans,well}){
    const w=(well||[]).find(x=>x&&x.date===date)||{};
    const a=ans||{};const reasons=[];
    /* sommeil */
    let sleep,sleepSrc;
    if(a.sleep>=1){sleep=(a.sleep-1)/4*30;sleepSrc="réponse"}
    else if(w.sleepScore>0){sleep=clamp(w.sleepScore,0,100)*0.3;sleepSrc="score Garmin "+Math.round(w.sleepScore)}
    else if(w.sleepSecs>0){const h=w.sleepSecs/3600;sleep=clamp((h-5)/3,0,1)*30;sleepSrc=h.toFixed(1).replace(".",",")+" h (montre)"}
    else{sleep=20;sleepSrc="inconnu"}
    const legs=a.legs>=1?(a.legs-1)/4*40:24;
    const painLv=a.pain!=null?+a.pain:0;
    const pain=[30,20,8,0][clamp(painLv,0,3)];
    /* pénalités montre */
    let pen=0;const rhrAvg=avgPrev(well,"rhr",date,7),hrvAvg=avgPrev(well,"hrv",date,7);
    if(w.rhr>0&&rhrAvg){const d=w.rhr-rhrAvg;if(d>=8){pen+=25;reasons.push("FC au réveil +"+Math.round(d)+" bpm")}else if(d>=5){pen+=15;reasons.push("FC au réveil +"+Math.round(d)+" bpm")}}
    if(w.hrv>0&&hrvAvg){const r=w.hrv/hrvAvg;if(r<0.75){pen+=25;reasons.push("VFC à "+Math.round(r*100)+" % de ta moyenne")}else if(r<0.85){pen+=15;reasons.push("VFC à "+Math.round(r*100)+" % de ta moyenne")}}
    pen=Math.min(30,pen);
    const score=clamp(Math.round(sleep+legs+pain-pen),0,100);
    if(sleep<15)reasons.push("Sommeil insuffisant ("+sleepSrc+")");
    if(a.legs&&a.legs<=2)reasons.push("Jambes lourdes");
    if(painLv>=1)reasons.push(["","Petite douleur","Douleur","Douleur forte"][painLv]);
    const level=painLv>=2||score<50?"rouge":score<70?"orange":"vert";
    return{date,score,level,answered:!!(a.legs>=1),pain:painLv,parts:{sleep:Math.round(sleep),legs:Math.round(legs),pain,penalty:pen},sleepSrc,
      rhr:w.rhr||null,rhrAvg:rhrAvg?Math.round(rhrAvg):null,hrv:w.hrv||null,hrvAvg:hrvAvg?Math.round(hrvAvg):null,sleepH:w.sleepSecs?Math.round(w.sleepSecs/360)/10:null,sleepScore:w.sleepScore||null,reasons};
  }
  /* Fractionné allégé : 1 répétition sur 4 en moins, 5 s/km plus lent */
  function lighten(text){
    let t=String(text).replace(/(\d+)\s*×/,(m,n)=>Math.max(1,Math.round((+n)*0.75))+" ×");
    t=t.replace(/à (\d)'(\d{2})(?:-(\d)'?(\d{2}))?/,(m,a,b,c,d)=>{const f=(x,y)=>{const s=(+x)*60+(+y)+5;return Math.floor(s/60)+"'"+String(s%60).padStart(2,"0")};return "à "+f(a,b)+(c?"-"+f(c,d):"")});
    return t;
  }
  const isLong=s=>/Sortie longue/.test(s.title||"")&&parseMin(s.dur)>=90;
  function parseMin(t){if(!t)return 0;let m=String(t).match(/(\d+)(?:-(\d+))?\s*h(?:\s*(\d+))?/);if(m){const h=m[2]?(+m[1]+ +m[2])/2:+m[1];return h*60+(+m[3]||0)}m=String(t).match(/(\d+)\s*min/);return m?+m[1]:0}
  /* s : {kind:"hard"|"easy"|"gym"|"race"|"rest", title, text, dur, prio?} → séance adaptée ou null */
  function adapt(s,level,pain){
    if(!s||s.kind==="rest")return null;
    const run=s.kind==="hard"||s.kind==="easy"||s.kind==="race";
    const isTest=s.kind==="race"&&(s.prio!=="A")||/test/i.test(s.title||"");
    if(pain>=2&&run&&!(s.kind==="race"&&s.prio==="A")){
      return{kind:"easy",cross:true,title:"Vélo, natation ou elliptique",dur:s.dur&&s.dur!=="Course"?s.dur:"45 min",flag:"🩹 Douleur : pas de course",
        text:"Douleur signalée : remplace la course par du vélo, de la natation ou de l'elliptique, même durée, très facile. Si la douleur dure plus de 5 à 7 jours, consulte."};
    }
    if(pain>=2&&s.kind==="gym")return{kind:"gym",noLegs:true,title:"Haut du corps et gainage",dur:"30 min",flag:"🩹 Pas de renfo jambes",text:"Douleur : gainage et haut du corps seulement (planches, rowing, pompes)."};
    if(level==="rouge"){
      if(isTest)return{kind:s.kind,title:"À reporter : "+s.title,dur:s.dur,flag:"🔴 Test à reporter",text:"Forme au rouge : un test ou une course secondaire aujourd'hui ne refléterait pas ton niveau. Reporte-le et fais 30-40 min très facile."};
      if(s.kind==="race")return{kind:"race",title:s.title,dur:s.dur,flag:"🔴 Forme basse",text:"Forme au rouge le jour d'un objectif : pars encore plus prudemment, et abandonne sans hésiter si un malaise ou une douleur apparaît."};
      if(s.kind==="hard"||isLong(s))return{kind:"easy",title:"Footing très facile",dur:"30-40 min",flag:"🔴 Séance remplacée",text:"Forme au rouge : la séance intense est remplacée par 30-40 min très facile (Z1), ou repos complet."};
      if(s.kind==="gym")return{kind:"gym",noLegs:true,title:"Mobilité et gainage",dur:"20 min",flag:"🔴 Séance allégée",text:"Forme au rouge : 20 min de mobilité et de gainage, pas de charge."};
      return{kind:"easy",title:s.title+" (très facile)",dur:s.dur,flag:"🔴 Très facile",text:s.text+" Forme au rouge : reste en Z1, coupe court si les jambes ne reviennent pas."};
    }
    if(level==="orange"){
      if(s.kind==="hard")return{kind:"hard",title:"Fractionné allégé",dur:s.dur,flag:"⚠️ Séance allégée",text:lighten(s.text)+" (forme orange : 1 répétition sur 4 en moins, 5 s/km plus lent)"};
      if(s.kind==="gym"&&/Salle A|maison · Jambes/.test(s.title))return{kind:"gym",noLegs:true,title:"Salle sans les jambes",dur:"45 min",flag:"⚠️ Pas de renfo jambes",text:"Forme orange : pas de renfo jambes aujourd'hui. Gainage et haut du corps (planches, dead bug, rowing, pompes)."};
    }
    return null;
  }
  /* ---- Calendrier : adapter l'événement du jour dans un .ics (utilisé par /plan.ics) ---- */
  const unesc=t=>String(t).replace(/\\n/g,"\n").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\");
  const esc=t=>String(t).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
  function fold(line){const out=[];let cur="";for(const ch of line){const enc=typeof TextEncoder!=="undefined"?new TextEncoder().encode(cur+ch).length:(cur+ch).length;if(enc>(out.length?73:74)){out.push(cur);cur=ch}else cur+=ch}out.push(cur);return out.join("\r\n ")}
  function adaptIcs(ics,date,res){
    if(!res||res.level==="vert"&&res.pain<2)return ics;
    const ymd=date.replace(/-/g,"");
    const unf=ics.replace(/\r?\n[ \t]/g,"");const lines=unf.split(/\r?\n/);
    let out=[],ev=null;
    for(const l of lines){
      if(l==="BEGIN:VEVENT"){ev=[l];continue}
      if(ev){ev.push(l);if(l==="END:VEVENT"){out=out.concat(adaptEvent(ev,ymd,res));ev=null}continue}
      out.push(l);
    }
    return out.filter(x=>x!=="").map(fold).join("\r\n")+"\r\n";
  }
  function adaptEvent(ev,ymd,res){
    const get=k=>{const l=ev.find(x=>x.startsWith(k+":")||x.startsWith(k+";"));return l?unesc(l.slice(l.indexOf(":")+1)):null};
    if(!(get("DTSTART")||"").includes(ymd))return ev;
    const s={kind:get("X-PREPA-KIND")||"easy",title:get("X-PREPA-TITLE")||get("SUMMARY")||"",text:get("X-PREPA-TEXT")||"",dur:get("X-PREPA-DUR")||"",prio:get("X-PREPA-PRIO")||null};
    const ad=adapt(s,res.level,res.pain);if(!ad)return ev;
    const desc=get("DESCRIPTION")||"";const nut=desc.indexOf("🍌 Nutrition")>=0?desc.slice(desc.indexOf("🍌 Nutrition")):"";
    const newDesc=ad.flag+" (forme "+res.score+"/100)\n"+ad.text+"\n\nPrévu : "+s.title+(s.dur?" ("+s.dur+")":"")+(nut&&!ad.cross?"\n\n"+nut:"");
    return ev.map(x=>x.startsWith("SUMMARY")?"SUMMARY:"+esc(ad.flag.split(" ")[0]+" "+ad.title+(ad.dur?" ("+ad.dur+")":"")):x.startsWith("DESCRIPTION")?"DESCRIPTION:"+esc(newDesc):x);
  }
  return{compute,adapt,lighten,adaptIcs,esc,fold,parseMin,shift};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=SCORE;
