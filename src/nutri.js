/* ---------- Calcul nutrition (pur, testable) ----------
Références : Jeukendrup (mysportscience, glucides par durée), ACSM/AND/DC 2016 et GSSI (charge glucidique, repas d'avant, récup),
ISSN 2019 ultra (eau 450-750 ml/h, sodium 500-700 mg/L, protéines 5-10 g/h, 150-400 kcal/h), ISSN 2021 caféine (3-6 mg/kg, 60 min avant),
Minetti 2002 (coût énergétique en pente), Compendium des activités physiques (natation). */
const NUTRI=(function(){
  const SPORTS={trail:"Trail",route:"Course sur route",velo:"Vélo",natation:"Natation"};
  const EFFORTS={facile:"Facile (Z1-Z2)",endurance:"Endurance (Z2)",tempo:"Soutenu (Z3)",competition:"Compétition (à fond sur la distance)"};
  const TEMPS={frais:"Frais (< 10 °C)",doux:"Doux (10-20 °C)",chaud:"Chaud (20-27 °C)",tres_chaud:"Très chaud (> 27 °C)"};
  const r5=x=>Math.round(x/5)*5, r10=x=>Math.round(x/10)*10;
  const hm=min=>{min=Math.round(min);const h=Math.floor(min/60),m=min%60;return h+":"+String(m).padStart(2,"0")};

  function energy(i){
    const W=i.weight, h=i.durH;
    if(i.sport==="route"||i.sport==="trail"){
      /* ~0,95 kcal/kg/km sur le plat (ISSN : 0,86-0,88 ; règle usuelle ~1), +10 % de terrain en trail,
         ~0,6 kcal/kg par 100 m de D+ (Minetti 2002), descentes non déduites (freinage, terrain technique). */
      const terrain=i.sport==="trail"?1.10:1.0;
      const inten={facile:1.0,endurance:1.0,tempo:1.03,competition:1.05}[i.effort]||1;
      return W*(0.95*i.dist*terrain+0.6*i.dplus/100)*inten;
    }
    if(i.sport==="velo"){
      /* Physique : roulement + air + montée, rendement brut 22 %. Vélo 9 kg, Crr 0,005, CdA 0,32, air 1,2 kg/m3. */
      const m=W+9,v=i.speedKmh/3.6,d=i.dist*1000;
      const work=(m*9.81*0.005+0.5*1.2*0.32*v*v)*d+m*9.81*i.dplus;
      return work/0.22/4184;
    }
    /* Natation : MET selon l'allure au 100 m (Compendium) */
    const p=360/i.speedKmh; /* secondes par 100 m */
    const met=p>150?5.8:p>120?8.3:p>100?10.0:11.0;
    return met*W*h;
  }
  function carbFraction(i){
    if(i.effort==="facile")return .40;
    if(i.effort==="endurance")return .55;
    if(i.effort==="tempo")return .75;
    /* « Compétition » : l'intensité réellement tenable baisse avec la durée */
    return i.durH<1.5?.88:i.durH<3?.78:i.durH<6?.68:.60;
  }
  function fluidRange(i){
    if(i.sweat>0){const lo=Math.min(1000,i.sweat*600),hi=Math.min(1000,i.sweat*800);return[r10(lo),r10(hi)]}
    const t={frais:[400,500],doux:[450,650],chaud:[600,800],tres_chaud:[700,900]}[i.temp]||[450,650];
    return t;
  }

  function compute(inp){
    const i=Object.assign({},inp);
    i.durH=i.dist/i.speedKmh; const durMin=i.durH*60;
    const kmEffort=(i.sport==="route"||i.sport==="trail")?i.dist+i.dplus/100:null;
    const kcal=energy(i); const kcalH=kcal/i.durH;
    const frac=carbFraction(i); const carbUseH=kcalH*frac/4;
    const loaded=i.context==="course"&&i.durH>=1.5;
    const stores=i.weight*(loaded?8:6); /* glycogène musculaire + hépatique, ordre de grandeur */
    const autonomyH=stores*0.8/carbUseH;
    const W=i.weight, trained=i.gut==="entraine";
    const out={durH:i.durH,durTxt:hm(durMin),kmEffort,kmEffortH:kmEffort?kmEffort/i.durH:null,kcal:Math.round(kcal),kcalH:Math.round(kcalH),
      frac,carbUseH:Math.round(carbUseH),carbUsedTotal:Math.round(carbUseH*i.durH),stores:Math.round(stores),autonomyH,loaded,notes:[]};

    /* ---- Glucides pendant l'effort ---- */
    let lo=0,hi=0,start=null,tier;
    const swim=i.sport==="natation";
    if(swim){
      if(i.durH<1.5){tier="none"}else{tier="swim";lo=30;hi=60;start=30}
    }else if(i.durH<0.75){tier="none"}
    else if(i.durH<1.25){tier="rinse"}
    else if(i.durH<2){tier="30";lo=30;hi=i.effort==="competition"||i.effort==="tempo"?45:30;start=durMin<95?30:25}
    else if(i.durH<2.5){tier="60";lo=45;hi=60;start=20}
    else if(i.durH<6){tier="90";lo=trained?60:45;hi=trained?90:60;start=20}
    else{tier="ultra";lo=trained?60:40;hi=trained?80:60;start=20}
    if(i.effort==="facile"&&tier!=="none"&&tier!=="rinse"&&i.context!=="course"){out.notes.push("En séance facile, tu peux viser le bas de la fourchette. Mais c'est aussi le bon moment pour habituer ton estomac aux doses de course.")}
    const target=tier==="none"||tier==="rinse"?0:r5((lo+hi)/2);
    out.carb={tier,lo,hi,target,start};

    /* ---- Eau et sodium ---- */
    let [flo,fhi]=fluidRange(i);
    let fluidNeeded=true;
    if(swim){fluidNeeded=i.durH>=1.5; if(fluidNeeded){flo=200;fhi=400}}
    else if(i.durH<0.75){fluidNeeded=i.temp==="chaud"||i.temp==="tres_chaud"; if(fluidNeeded){flo=150;fhi=300}}
    else if(i.durH<1.25&&(i.temp==="frais"||i.temp==="doux")){fluidNeeded=false}
    out.fluid={needed:fluidNeeded,lo:flo,hi:fhi,mid:r10((flo+fhi)/2)};
    const sodiumNeeded=fluidNeeded&&(i.durH>=2||((i.temp==="chaud"||i.temp==="tres_chaud")&&i.durH>=1));
    out.sodium={needed:sodiumNeeded,lo:r10(flo/1000*500),hi:r10(fhi/1000*700)};

    /* ---- Protéines (ultra) ---- */
    out.protein=i.durH>=6?{lo:5,hi:10}:null;

    /* ---- Caféine ---- */
    const caf=[];
    if(i.context==="course"||i.effort==="competition"||i.effort==="tempo"){
      if(i.durH<6) caf.push({when:"45-60 min avant le départ",dose:r10(W*2)+"-"+r10(W*3)+" mg (2-3 mg/kg)"});
      else{caf.push({when:"45-60 min avant le départ",dose:r10(W*1)+"-"+r10(W*2)+" mg (1-2 mg/kg)"});
           caf.push({when:"Après 6 h de course, puis toutes les 2-3 h (surtout la nuit)",dose:"environ "+r10(W*1)+" mg (1 mg/kg), par exemple 1 gel caféiné"});}
    }
    out.caffeine=caf;

    /* ---- Avant ---- */
    const pre=[];
    if(i.context==="course"&&i.durH>=1.5) pre.push({when:"J-2 et J-1 (36-48 h)",what:"Charge glucidique : "+r10(W*8)+"-"+r10(W*10)+" g de glucides par jour (8-10 g/kg), pauvre en fibres la veille."});
    else pre.push({when:"La veille",what:"Repas habituel, riche en féculents. Pas besoin de charge glucidique pour un effort de moins de 90 min."});
    if(i.durH>=1.5) pre.push({when:"3-4 h avant",what:"Repas de "+r10(W*2)+"-"+r10(W*3)+" g de glucides (2-3 g/kg), peu de fibres et de gras. Par exemple : pain, confiture, banane, riz au lait."});
    else pre.push({when:"2-3 h avant",what:"Repas de "+r10(W*1)+"-"+r10(W*1.5)+" g de glucides (1-1,5 g/kg), déjà testé à l'entraînement."});
    pre.push({when:"2-4 h avant",what:"Boire "+r10(W*5)+"-"+r10(W*7)+" ml (5-7 ml/kg), puis de petites gorgées jusqu'au départ."});
    if(i.durH>=1.25&&!swim) pre.push({when:"10-15 min avant",what:"1 gel (20-25 g de glucides) avec quelques gorgées d'eau."});
    out.pre=pre;

    /* ---- Après ---- */
    const post=[];
    if(i.durH>=1.5||i.effort==="competition"||i.effort==="tempo"){
      post.push({when:"Dans l'heure",what:r10(W*1)+"-"+r10(W*1.2)+" g de glucides et "+r5(W*0.3)+" g de protéines (0,3 g/kg). Par exemple : un repas complet, ou une boisson de récup et une banane."});
      if(i.durH>=3) post.push({when:"Les 4 h suivantes",what:"Continue à environ "+r10(W*1)+" g de glucides par heure si tu as une autre séance dans les 24 h."});
    }else post.push({when:"Après",what:"Ton repas suivant normal suffit."});
    post.push({when:"Hydratation",what:"Pèse-toi avant et après : bois environ 1,5 L par kg perdu, sur les heures qui suivent."});
    out.post=post;

    /* ---- Plan de prises ---- */
    const sched=[];
    const items={gel:0,pate:0,salé:0,cafeine:0};
    let drinkLiters=0,drinkCarbs=0;
    if(target>0){
      const interval=swim?30:20;
      const conc=60; /* g/L de boisson d'effort */
      const fluidH=out.fluid.needed?out.fluid.mid:0;
      const drinkCarbsH=Math.min(target,fluidH/1000*conc);
      const foodH=Math.max(0,target-drinkCarbsH);
      let acc=0;
      const ultra=tier==="ultra";
      const end=durMin-(i.durH>3?10:15);
      const where=i.sport==="trail"?"de préférence dans une montée, en marchant":i.sport==="route"?"sur une portion plate, juste avant un ravito si possible":i.sport==="velo"?"sur le plat, jamais en descente":"pendant une pause de ravitaillement";
      for(let t=start;t<=end;t+=interval){
        const hr=t/60; const row={t,clock:hm(t),drink:fluidH?r10(fluidH*interval/60):0,food:[]};
        acc+=foodH*interval/60;
        const solidSlot=ultra&&hr>=3&&t%60===0;
        if(swim){row.food.push("boisson d'effort ou gel liquide (~"+r5(target*interval/60)+" g)");acc=0;items.gel+=0}
        else if(solidSlot&&acc>=15){row.food.push("solide salé (~30 g de glucides : pomme de terre, sandwich, barre salée)");acc-=30;items.salé++}
        else if(acc>=18){
          const useGel=(sched.length%2===0)||i.sport==="route";
          if(useGel){row.food.push("1 gel (25 g)");acc-=25;items.gel++}else{row.food.push("1 pâte de fruits ou ½ barre (20 g)");acc-=20;items.pate++}
        }
        if(ultra&&hr>=6&&(t-360)%150===0){row.food.push("+ caféine (gel caféiné)");items.cafeine++}
        if(out.protein&&t%180===0&&hr>=3){row.food.push("+ 10-20 g de protéines (barre, boisson, fromage au ravito)")}
        if(!row.food.length&&row.drink===0)continue;
        sched.push(row);
      }
      drinkLiters=fluidH*i.durH/1000; drinkCarbs=Math.round(drinkCarbsH*i.durH);
      out.where=where;
      out.drinkConc=conc;
      out.drinkCarbsH=Math.round(drinkCarbsH);
    }else if(out.fluid.needed){
      out.where="";
    }
    out.schedule=sched;
    out.shopping={gel:items.gel,pate:items.pate,sale:items.salé,cafeine:items.cafeine,drinkLiters:Math.round(drinkLiters*10)/10,drinkCarbs,
      powder:Math.round(drinkCarbs/0.95)};
    out.intakeKcalH=Math.round(target*4);
    out.coverPct=target?Math.round(target*4/kcalH*100):0;

    /* ---- Explication automatique ---- */
    let why;
    if(tier==="none") why="Ton effort dure "+hm(durMin)+". Tu utilises environ "+out.carbUsedTotal+" g de glucides, alors que tes réserves sont d'environ "+out.stores+" g. Manger pendant l'effort n'apporte rien : un bon repas avant suffit.";
    else if(tier==="rinse") why="Effort de "+hm(durMin)+" : tes réserves (~"+out.stores+" g) couvrent largement les ~"+out.carbUsedTotal+" g utilisés. Tu n'as pas besoin de manger. À fond, rincer ta bouche avec une boisson sucrée, ou boire quelques gorgées, peut aider un peu.";
    else if(tier==="swim") why="Nage longue : tu ne peux t'alimenter qu'aux pauses. Une prise liquide toutes les 30 min suffit.";
    else why="Tu brûles environ "+out.carbUseH+" g de glucides par heure. Tes réserves (~"+out.stores+" g"+(loaded?" après la charge glucidique":"")+") tiennent environ "+(autonomyH<10?autonomyH.toFixed(1).replace(".",","):Math.round(autonomyH))+" h. Ton effort dure "+hm(durMin)+" : manger "+target+" g/h retarde le coup de barre"+(autonomyH>i.durH?" et garde ton allure jusqu'au bout.":", qui arriverait sinon avant l'arrivée.");
    out.why=why;
    if(target>60) out.notes.push("Au-delà de 60 g/h, il faut un mélange glucose + fructose : la plupart des gels et boissons « 2:1 » ou « 1:0,8 » le sont.");
    if(tier==="ultra") out.notes.push("Sur plus de 6 h, l'ISSN considère que 30-50 g/h est souvent ce qui passe réellement. Vise ta cible si tu l'as testée à l'entraînement, sinon reste dans le bas de la fourchette. Au-delà de 3 h, ajoute du salé et du solide.");
    if(i.effort==="competition"&&i.durH>3) out.notes.push("Sur cette durée, « à fond » veut dire Z2-Z3 en réalité. Le calcul en tient compte.");
    if(!trained&&target>=60) out.notes.push("Estomac pas encore entraîné : monte progressivement les doses sur tes sorties longues.");
    if(out.fluid.needed&&out.fluid.hi>=900) out.notes.push("Ne dépasse pas environ 1 L/h, et ne prends pas de poids pendant l'effort : trop boire sans sel expose à l'hyponatrémie.");
    return out;
  }

  /* Conversions de vitesse */
  const conv={
    toKmh(unit,a,b){ if(unit==="kmh")return +a; const sec=(+a)*60+(+b); if(!sec)return 0; return unit==="minkm"?3600/sec:360/sec; },
    fmtPace(sec){sec=Math.round(sec);return Math.floor(sec/60)+"'"+String(sec%60).padStart(2,"0")},
    all(kmh){return{kmh:kmh.toFixed(1).replace(".",","),minkm:conv.fmtPace(3600/kmh),min100:conv.fmtPace(360/kmh)}}
  };
  return{compute,conv,SPORTS,EFFORTS,TEMPS,hm};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=NUTRI;
