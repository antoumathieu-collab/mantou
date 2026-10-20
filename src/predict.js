/* ---------- Temps théoriques (pur, testable) ----------
Méthode : équivalent 10 km tiré de tes efforts de référence (formule de Riegel, exposant 1,06),
puis projection sur la course en km-effort (km + D+/100). Au-delà d'un marathon : exposant 1,15 (route) ou 1,20 (trail),
puis un facteur de terrain. */
const PREDICT=(function(){
  const TERRAINS={route:{name:"Route",f:1.00},roulant:{name:"Trail roulant",f:1.03},montagne:{name:"Trail montagne",f:1.15},technique:{name:"Trail très technique",f:1.25}};
  /* Coefficient pour ramener une allure d'entraînement à un effort « à fond » sur la même distance */
  function effortFactor(ref){
    if(ref.rpe>=8)return 1.0; if(ref.rpe===7)return 0.96; if(ref.rpe>=5)return 0.90; if(ref.rpe>=1)return 0.82;
    return null; /* sans ressenti : pas utilisé comme référence */
  }
  const riegel=(t,d1,d2,e)=>t*Math.pow(d2/d1,e);
  /* refs : [{key,date,dist,sec,rpe,title}] sur route uniquement */
  function tenKm(refs,today){
    const out=[];
    for(const r of refs){
      const f=effortFactor(r);if(!f||!(r.dist>=3)||!(r.sec>0))continue;
      const age=(today-r.date)/864e5; if(age>150)continue;
      const raceSec=r.sec*f;
      const t10=r.dist<=42.195?riegel(raceSec,r.dist,10,1.06):riegel(riegel(raceSec,r.dist,42.195,1.15),42.195,10,1.06);
      out.push(Object.assign({},r,{t10,f,reliable:r.rpe>=8}));
    }
    out.sort((a,b)=>a.t10-b.t10);
    return out; /* meilleure en premier */
  }
  function timeFor(t10,dist,dplus,terrain){
    const ke=dist+(dplus||0)/100;
    const tr=TERRAINS[terrain]||TERRAINS.route;
    let t;
    if(ke<=42.195)t=riegel(t10,10,ke,1.06);
    else t=riegel(riegel(t10,10,42.195,1.06),42.195,ke,terrain==="route"?1.15:1.20);
    t*=tr.f;
    const spread=ke<=21.1?0.05:ke<=42.195?0.08:0.12;
    return{sec:t,lo:t*(1-spread),hi:t*(1+spread),ke,kmh:dist/(t/3600),pace:t/dist,keh:ke/(t/3600)};
  }
  const fmt=sec=>{sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?h+" h "+String(m).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
  const fmtLong=sec=>{sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
  /* Ralentissement prévu entre le début et la fin (part de l'allure) selon la longueur en km-effort */
  const fade=ke=>ke<=12?0:ke<=25?0.03:ke<=45?0.06:ke<=100?0.15:0.25;
  /* Temps écoulé quand une fraction x (0-1) du km-effort est faite, avec ralentissement linéaire */
  const elapsed=(T,ke,x)=>{const a=fade(ke);return T*((1-a/2)*x+a*x*x/2)};
  return{TERRAINS,tenKm,timeFor,fmt,fmtLong,effortFactor,fade,elapsed};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=PREDICT;
