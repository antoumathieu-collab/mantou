/* Build : génère l'appli installable (dist/prepa-diag-2030), l'aperçu artefact et les calendriers .ics */
const fs=require("fs"),path=require("path");
const SRC=__dirname, OUT=process.env.OUT?path.resolve(process.env.OUT):path.join(SRC,"dist","prepa-diag-2030");
fs.mkdirSync(path.join(SRC,"dist"),{recursive:true});
const read=f=>fs.readFileSync(path.join(SRC,f),"utf8");
const VERSION=process.env.APPV||"4";

/* ---- JS ---- */
const planJs="const PLAN=(function(){\n"+read("_data.js")+"\n"+read("plan_logic.js")+"\n})();\nif(typeof module!==\"undefined\"&&module.exports)module.exports=PLAN;\n";
fs.writeFileSync(path.join(SRC,"plan.js"),planJs);
const nutriJs=read("nutri.js")+"\n"+read("predict.js"), appJs=read("app.js");

/* ---- HTML ---- */
let m=read("_markup.html");
const must=(a,b)=>{if(!m.includes(a))throw new Error("introuvable : "+a.slice(0,60));m=m.replace(a,b)};
must('  --race:#7a3fa0; --race-soft:#efe4f6; --rest:#eef1ee;','  --race:#7a3fa0; --race-soft:#efe4f6; --rest:#eef1ee; --s1:#1f7a52; --s2:#8a45b8;');
m=m.split('--rest:#202925; color-scheme:dark').join('--rest:#202925; --s1:#3f9a70; --s2:#a46ccc; color-scheme:dark');
must('</style>',read("_extra.css")+'\n</style>');
{const st=m.indexOf('    <div class="panel" id="today-panel"></div>\n');if(st<0)throw new Error("today-panel");m=m.replace('    <div class="panel" id="today-panel"></div>\n','');
 m=m.replace('<section class="view" id="v-accueil">','<section class="view" id="v-accueil">\n    <div class="panel" id="today-panel"></div>');}
must(m.slice(m.indexOf('  <nav class="tabs"'),m.indexOf('</nav>')+6),`  <div class="navwrap">
    <nav class="tabs" id="nav-main" aria-label="Sections"></nav>
    <nav class="subtabs" id="nav-sub" aria-label="Sous-sections" hidden></nav>
  </div>`);
must('  </section>\n\n  <!-- COURSES -->',`    <div class="panel">
      <h3>Dans le calendrier de ton iPhone</h3>
      <p class="small">Abonne-toi une fois : les séances apparaissent dans l'app Calendrier, et elles se mettent à jour quand le planning change.</p>
      <div id="ics-box"></div>
    </div>
  </section>

  <!-- COURSES -->`);
must('  <!-- ROUTINE COURSE -->',read("_new_sections.html")+'\n  <!-- ROUTINE COURSE -->');
must('<td>Andorra 80K</td><td>70-90 g</td>','<td>Andorra 80K</td><td>60-90 g</td>');
must('<h2>Entraîner l\'estomac jusqu\'à la Diag</h2>','<h2>Entraîner l\'estomac jusqu\'à la Diag</h2>\n      <p><a href="#calcul">Calcule ta nutrition pour n\'importe quel effort dans l\'onglet Calcul nutrition →</a></p>');

const scripts=(pwa)=>`<script>const IS_PWA=${pwa};</script>\n<script>\n${planJs}\n</script>\n<script>\n${nutriJs}\n</script>\n<script>\n${appJs}\n</script>\n`;

/* Artefact (aperçu) */
const art=m+"\n"+scripts(false);
fs.writeFileSync(path.join(SRC,"dist","artifact.html"),art);

/* PWA */
fs.mkdirSync(path.join(OUT,"icons"),{recursive:true});
const body=m.replace('<title>Prépa Diag 2030</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n','');
const i=body.indexOf('<div class="wrap">');
const head=`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Prépa Diag 2030</title>
<meta name="description" content="Prépa Diagonale des Fous 2030 : planning, progression, nutrition, courses et matériel.">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#2f6b4f">
<link rel="icon" href="icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Prépa Diag">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>
`;
const sw=`<script>if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})})}</script>\n`;
fs.writeFileSync(path.join(OUT,"index.html"),head+body.slice(0,i)+"</head>\n<body>\n"+body.slice(i)+"\n"+scripts(true)+sw+"</body>\n</html>\n");
fs.writeFileSync(path.join(OUT,"sw.js"),`const CACHE="prepa-diag-v${VERSION}";
const FILES=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const url=new URL(r.url);
  const fresh=r.mode==="navigate"||url.pathname.endsWith(".html")||url.pathname.endsWith(".ics")||url.pathname.endsWith(".webmanifest");
  if(fresh){ /* réseau d'abord : les mises à jour arrivent dès la 1re ouverture en ligne */
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(h=>h||caches.match("./index.html"))));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res})));
});
`);
for(const f of ["manifest.webmanifest","LISEZ-MOI.txt"])fs.copyFileSync(path.join(SRC,"static",f),path.join(OUT,f));
for(const f of fs.readdirSync(path.join(SRC,"static","icons")))fs.copyFileSync(path.join(SRC,"static","icons",f),path.join(OUT,"icons",f));

/* ---- Calendriers .ics ---- */
const P=require(path.join(SRC,"plan.js"));
const esc=t=>String(t).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
const fold=line=>{const b=Buffer.from(line,"utf8");if(b.length<=74)return line;const out=[];let cur="";for(const ch of line){if(Buffer.byteLength(cur+ch,"utf8")>(out.length?73:74)){out.push(cur);cur=ch}else cur+=ch}out.push(cur);return out.join("\r\n ")};
const ymd=d=>P.iso(d).replace(/-/g,"");
const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
function ics(mode){
  const [a,b]=P.range(mode);const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Prepa Diag 2030//FR","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "X-WR-CALNAME:"+esc(mode==="race"?"Prépa Diag · avec courses":"Prépa Diag · plan de base"),"X-WR-TIMEZONE:Europe/Paris",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H","X-PUBLISHED-TTL:PT6H"];
  let n=0;
  for(let d=a;d<=b;d=P.addDays(d,1)){
    const st=P.sessionFor(d,{mode,site:"t"}),sp=P.sessionFor(d,{mode,site:"p"});
    if(!st||st.kind==="rest")continue;
    const w=st.week;
    const summary=st.short+(st.dur&&st.dur!=="—"&&!st.short.includes(st.dur)&&st.kind!=="race"?" ("+st.dur+")":"");
    let desc=st.text===sp.text?st.text:"Tarbes : "+st.text+"\n\nPérigueux : "+sp.text;
    if(st.note)desc+="\n\n"+st.note;
    const dpt=w[4],dpp=Math.round(w[4]/2/100)*100;
    desc+="\n\nSemaine "+w[0]+" · "+w[2]+" · "+(Number.isInteger(w[3])?w[3]+" h":Math.floor(w[3])+" h 30")+" · D+ "+dpt+" m (Tarbes) / "+dpp+" m (Périgueux)";
    if(st.routineLink)desc+="\nRoutine course : onglet Routine course de l'appli.";
    desc+="\nValide la séance et ta vitesse dans l'appli Prépa Diag.";
    L.push("BEGIN:VEVENT","UID:"+ymd(d)+"-"+mode+"@prepa-diag-2030","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+ymd(d),"DTEND;VALUE=DATE:"+ymd(P.addDays(d,1)),
      "SUMMARY:"+esc(summary),"DESCRIPTION:"+esc(desc),"CATEGORIES:"+esc({race:"Course",hard:"Qualité",easy:"Endurance",gym:"Salle"}[st.kind]||"Séance"),"TRANSP:TRANSPARENT","END:VEVENT");n++;
  }
  L.push("END:VCALENDAR");
  return {text:L.map(fold).join("\r\n")+"\r\n",n};
}
for(const [mode,file] of [["race","calendrier-courses.ics"],["base","calendrier-base.ics"]]){const r=ics(mode);fs.writeFileSync(path.join(OUT,file),r.text);console.log(file,r.n,"séances")}
console.log("OK v"+VERSION);
