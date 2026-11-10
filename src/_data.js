const BASE=[
[1,"2026-10-19","Base + 10 km",7,800,"5 × 1 km à 4'20, récup 1'30","SL 1 h 45","1 h Z2"],
[2,"2026-10-26","Base + 10 km",7.5,900,"10 × 400 m à 3'50, récup 1'","SL 2 h","1 h Z2"],
[3,"2026-11-02","Base + 10 km",8,1000,"3 × 2 km à 4'15-4'20, récup 2'","SL 2 h","1 h 15 Z2"],
[4,"2026-11-09","Allégée",5.5,600,"8 × 300 m vifs, récup 1'","SL 1 h 30","45 min Z2"],
[5,"2026-11-16","Base + 10 km",8,1000,"3 × 3 km à 4'20, récup 2'","SL 2 h 15","1 h 15 Z2"],
[6,"2026-11-23","Base + 10 km",8,900,"6 × 1 km à 4'00, récup 1'30","SL 2 h","1 h Z2"],
[7,"2026-11-30","Développement",7,600,"6 × 3 min en côte","SL 2 h 30 Z2","1 h Z2"],
[8,"2026-12-07","Récup",5,400,"EASY:Footing 45 min Z2, pas de qualité","SL 1 h 30 Z2","Repos"],
[9,"2026-12-14","Récup",6,700,"8 × 30 s en côte","SL 1 h 45","1 h Z2"],
[10,"2026-12-21","Base trail",7,900,"10 × 45 s en côte, descente trottinée","SL 2 h","1 h Z2"],
[11,"2026-12-28","Base trail",7.5,1000,"3 × 8 min seuil, récup 2'","SL 2 h 15","1 h Z2"],
[12,"2027-01-04","Base trail",8,1200,"5 × 3 min en côte, récup en descente","SL 2 h 30","1 h 15 Z2"],
[13,"2027-01-11","Allégée",6,700,"6 × 1 min vif","SL 1 h 45","45 min Z2"],
[14,"2027-01-18","Base trail",8,1300,"3 × 10 min seuil, récup 2'","SL 2 h 45","1 h Z2"],
[15,"2027-01-25","Base trail",8.5,1400,"6 × 3 min en côte","SL 3 h","1 h 15 Z2"],
[16,"2027-02-01","Base trail",8.5,1500,"3 × 10 min seuil en montée","SL 3 h","1 h 30 Z2 (premier enchaînement)"],
[17,"2027-02-08","Allégée",6,800,"8 × 1 min en côte","SL 2 h","1 h Z2"],
[18,"2027-02-15","Développement",8.5,1600,"4 × 8 min seuil, récup 2'","SL 3 h 15","1 h 15 Z2"],
[19,"2027-02-22","Développement",9,1800,"6 × 4 min en côte","SL 3 h 30","1 h 30 Z2"],
[20,"2027-03-01","Développement",9,2000,"2 × 15 min tempo en montée, récup 4'","SL 3 h 45","1 h Z2"],
[21,"2027-03-08","Allégée",6.5,1000,"6 × 2 min en côte","SL 2 h 15","1 h Z2"],
[22,"2027-03-15","Développement",9,2000,"5 × 5 min en côte","SL 4 h","1 h Z2"],
[23,"2027-03-22","Développement",9,2200,"2 × 15 min seuil","SL 3 h","2 h Z2 (enchaînement)"],
[24,"2027-03-29","Développement",8.5,1800,"10 × 1 min VMA en côte","SL 3 h 30","1 h Z2"],
[25,"2027-04-05","Développement",8,1600,"4 × 5 min en côte","SL 3 h","1 h Z2"],
[26,"2027-04-12","Allégée + course",6,900,"6 × 2 min en côte","SL 1 h 45","1 h Z2"],
[27,"2027-04-19","Spécifique",8.5,2000,"3 × 12 min seuil en montée","SL 3 h 30","1 h Z2"],
[28,"2027-04-26","Allégée + course",5.5,900,"3 × 5 min à allure course","RACE:Trail des Coteaux de Voutezac, 49 km|49 km, 2 000 m D+, UTMB Index 50K. Répétition générale de l'UTC : matériel, nutrition à 60 g/h, départ prudent.","Repos"],
[29,"2027-05-03","Récup",5.5,600,"EASY:Footing 45 min Z2, pas de qualité","SL 1 h 30 Z2","45 min Z2"],
[30,"2027-05-10","Spécifique",10,3000,"3 × 12 min seuil en montée","SL 5 h","1 h 30 Z2"],
[31,"2027-05-17","Spécifique (choc)",11,3600,"5 × 6 min en côte","SL 6 h","2 h Z2"],
[32,"2027-05-24","Allégée",7,1500,"4 × 4 min en côte","SL 2 h 30","1 h Z2"],
[33,"2027-05-31","Spécifique (choc)",12,4200,"2 × 20 min tempo en montée","SL 7 h avec tout le matériel et la nutrition de course","2 h Z2"],
[34,"2027-06-07","Spécifique + test",8,2500,"3 × 8 min seuil en montée","SL 2 h 30","1 h 30 Z2"],
[35,"2027-06-14","Spécifique (répétition générale)",12,4500,"4 × 6 min en côte","SL 7 h avec tout le matériel et la nutrition de course (dont une partie de nuit)","2 h Z2"],
[36,"2027-06-21","Affûtage",9,2500,"3 × 8 min seuil","SL 4 h","1 h Z2"],
[37,"2027-06-28","Affûtage",6,1000,"4 × 4 min à allure course","SL 2 h","45 min Z2"],
[38,"2027-07-05","Course (jeudi 8)",3,300,"3 × 3 min de rappel (court)","Repos","Repos"],
[39,"2027-07-12","Récup après l'UTC",2,0,"EASY:Marche ou vélo léger 45 min","Marche libre","Repos"],
[40,"2027-07-19","Reprise",3,200,"EASY:Footing 30-40 min Z1-Z2","Footing 40 min Z2","Repos"]
];
/* Prolongation jusqu'au X-Trail Corrèze Dordogne (plan avec courses uniquement) */
const EXT=[
[41,"2027-07-26","Reprise",6,800,"EASY:Footing 50 min Z2 + 6 lignes droites","SL 2 h Z2","1 h Z2"],
[42,"2027-08-02","Base été",8,1500,"5 × 3 min en côte","SL 3 h","1 h Z2"],
[43,"2027-08-09","Base été",8.5,1800,"3 × 10 min seuil en montée","SL 3 h 30","1 h 15 Z2"],
[44,"2027-08-16","Allégée + course",6,900,"6 × 2 min en côte","SL 1 h 45","1 h Z2"],
[45,"2027-08-23","Développement",9,2000,"6 × 4 min en côte","SL 4 h","1 h Z2"],
[46,"2027-08-30","Spécifique",9,2200,"3 × 12 min seuil en montée","SL 4 h 30","1 h 30 Z2"],
[47,"2027-09-06","Spécifique",8.5,2000,"2 × 15 min tempo en montée","SL 3 h 30","1 h Z2"],
[48,"2027-09-13","Affûtage",6.5,1200,"3 × 8 min seuil","SL 2 h 15","1 h Z2"],
[49,"2027-09-20","Course",3.5,400,"3 × 3 min de rappel (court)","RACE:X-Trail Corrèze Dordogne, Grand Trail des Tours 56 km|Argentat (19). 56 km, 2 800 m D+, UTMB Index. Nutrition à 80-90 g/h. Date estimée au samedi 25 septembre (26 sept. en 2026), à confirmer.","Repos"],
[50,"2027-09-27","Récup après X-Trail",2,0,"EASY:Marche ou vélo léger 45 min","Marche libre","Repos"],
[51,"2027-10-04","Reprise",3,200,"EASY:Footing 30-40 min Z1-Z2","Footing 40 min Z2","Repos"]
];
/* Courses du plan « avec courses » : date ISO, nom, détail, longue (>= 30 km), date estimée, lien d'inscription (ou futur lien), libellé du lien.
   Liens relevés le 10 novembre 2026. */
const RACES=[
["2026-11-08","Le Montagrier Trail, 30 km","Montagrier (24). En Z2-Z3, c'est une sortie longue en compétition. Si tu es à Tarbes ce week-end-là : sortie longue normale à la place.",true,false,"",""],
["2027-01-17","Trail de Pécharmant, 21 km","Creysse (24), 21 km, environ 300-400 m D+. Course de reprise, Z3 maximum. La noctambule de 11 km du samedi soir est possible à la place. Date à confirmer (16-17 janvier).",false,true,"https://www.spiridonperigordpourpre.fr/","Site de l'organisateur · inscriptions à venir"],
["2027-02-21","Hivernal Trail Grand-Brassac, 20 km","Grand-Brassac (24), 20 km de jour, 600 m D+. Course d'entraînement, test des produits de nutrition. Le 20 km de nuit de la veille est possible à la place. Date à confirmer : 13-14 ou 20-21 février selon les calendriers.",false,true,"https://fr.milesrepublic.com/event/hivernal-trail-grand-brassac-htgb-15725","Fiche de la course · inscriptions vers le 20 janvier"],
["2027-03-28","Trail des Citadelles, 40 km","Lavelanet (09). 40 km, 2 000 m D+, UTMB Index 50K : ta première cote. Premier vrai test montagne, 50-60 g/h. Week-end de Pâques, date à confirmer sur le site officiel.",true,true,"https://www.trailcitadelles.com","Site officiel · inscriptions à venir"],
["2027-04-18","Trail nature d'Isle, 22 km","Isle (87), 22 km, 600 m D+. En Z3 maximum : c'est de l'entraînement, deux semaines avant Voutezac. Date à confirmer (mi-avril).",false,true,"https://tni.jourdetrail.fr/","Site officiel · inscriptions à venir"],
["2027-05-01","Trail des Coteaux de Voutezac, 49 km","Voutezac (19). 49 km, 2 000 m D+, UTMB Index 50K. Répétition générale de l'UTC : matériel, nutrition à 60 g/h, rythme. 550 dossards pour les trois trails.",true,false,"https://www.klikego.com/inscription/trail-et-rando-des-coteaux-voutezac-2027/running-course-a-pied/1643665602486-10","S'inscrire · ouvert sur Klikego"],
["2027-07-08","Ultra-Trail di Corsica (UTC100M), 110 km","Corte (Corse). 110 km, 7 200 m D+, 4 Running Stones, 182 points Grand Raid. Objectif de la saison : finir, environ 24-28 h (limite 48 h), deux nuits. Départ jeudi 8 juillet à 23 h, cours Paoli (horaire 2026, à confirmer pour 2027). Dors le plus possible la veille. Repli possible : Restonica 69 km (10 juillet) si les points de contrôle de fin avril et de fin mai ne sont pas bons.",true,false,"https://restonica.utmb.world/races/UTC100M","Page de la course"],
["2027-08-22","Trail de Peyrignac, 21,8 km","Peyrignac (24), 21,8 km, 530 m D+. Reprise en douceur après l'UTC, sans objectif de temps. Date à confirmer (23 août en 2026).",false,true,"https://fr.milesrepublic.com/event/trail-de-peyrignac-7394","Fiche de la course · inscriptions à venir"],
["2027-09-25","X-Trail Corrèze Dordogne, Grand Trail des Tours 56 km","Argentat (19). 56 km, 2 800 m D+, UTMB Index. Le 81 km (3 632 m D+) si l'UTC s'est bien passée, le 29 km sinon : à décider en août. Date estimée (26 sept. en 2026).",true,true,"https://www.xtrail-correze-dordogne.com/x-trail-correze-dordogne/","Site officiel · inscriptions à venir"]
];
/* Calendrier « un trail par mois » : date, course retenue, alternative, UTMB Index, Stones, points Grand Raid, surlignée, lien, libellé */
const COURSES=[
["17 janv. 2027 *","<b>Trail de Pécharmant, Creysse (24), 21 km</b>","Roc'trail, Paussac (24), 30-31 janv.","À vérifier","Non","&lt; 75",1,"https://www.spiridonperigordpourpre.fr/","Organisateur"],
["20-21 févr. 2027 *","<b>Hivernal Trail Grand-Brassac (24), 20 km, 600 m D+</b>","Trail de la Pierre du Loup, Sauviat (87), 25 km","À vérifier","Non","&lt; 75",1,"https://fr.milesrepublic.com/event/hivernal-trail-grand-brassac-htgb-15725","Fiche"],
["28 mars 2027 *","<b>Trail des Citadelles, Lavelanet (09), 40 km, 2 000 m D+</b>","Trail des Mouflons, Cherveix-Cubas (24), 44 km, 4 avril","Oui (50K)","Non","60",1,"https://www.trailcitadelles.com","Site officiel"],
["18 avril 2027 *","<b>Trail nature d'Isle (87), 22 km, 600 m D+</b>","Trail de la forêt de Lenfant, Saint-Gence (87), 20 km","À vérifier","Non","&lt; 75",1,"https://tni.jourdetrail.fr/","Site officiel"],
["1er mai 2027","<b>Trail des Coteaux, Voutezac (19), 49 km, 2 000 m D+</b>","Oh Meu Deus by UTMB (Portugal), 52 km, 30 avril","Oui (50K)","Non","69",1,"https://www.klikego.com/inscription/trail-et-rando-des-coteaux-voutezac-2027/running-course-a-pied/1643665602486-10","S'inscrire"],
["8 juil. 2027","<b>Ultra-Trail di Corsica (UTC100M), Corte, 110 km, 7 200 m D+</b> · objectif de la saison","Repli : Restonica Trail by UTMB, 69 km, 3 950 m D+ (10 juil.)","Oui (100M)","4","182",1,"https://restonica.utmb.world/races/UTC100M","Page de la course"],
["22 août 2027 *","<b>Trail de Peyrignac (24), 21,8 km, 530 m D+</b>","Grand Raid des Pyrénées, Tour du Moudang 60 km (tirage au sort)","À vérifier","Non","&lt; 75",1,"https://fr.milesrepublic.com/event/trail-de-peyrignac-7394","Fiche"],
["25 sept. 2027 *","<b>X-Trail Corrèze Dordogne, Argentat (19), 56 km, 2 800 m D+</b> (ou 29 km / 81 km)","—","Oui","Non","84 (117 sur le 81 km)",1,"https://www.xtrail-correze-dordogne.com/x-trail-correze-dordogne/","Site officiel"]
];
const PACKS={
ess:[["Chaussures","Kiprun MT Cushion 2","environ 60 €","282 g, drop 4 mm, amortie"],["Sac","Kiprun Bag 900 10 L","79,99 €","240 g, poche à eau 1 L incluse"],["2 flasques 500 ml","Kiprun","environ 25 €","Non fournies avec ce sac"],["Bâtons","Kiprun aluminium 500","environ 75 €","Robustes pour apprendre"],["Frontale","Kiprun Ontrail 900","60 €","900 lumens, 139 g"],["Veste imperméable","Kiprun Run 900","99,99 €","2,5 couches, 20 000 Schmerber, 182 g"],["Couche chaude, bonnet, gants","Kiprun / Decathlon","environ 45 €","Obligatoires en altitude"],["Survie + gobelet","Decathlon","environ 10 €","Obligatoires"],["Total","","~455 €",""]],
qp:[["Chaussures de course","Hoka Speedgoat 7","99,99 à 164,99 €","Accroche Vibram, référence en ultra"],["Chaussures d'entraînement","Kiprun MT Cushion 2","environ 60 €","Alterner les paires"],["Sac","Salomon ADV Skin 12","96 à 140 €","2 flasques incluses, très stable"],["Bâtons","Kiprun carbone 3 brins","99,99 €","Carbone à moitié prix"],["Frontale","Nitecore HC60 UHE","80 €","1 600 lumens, 140 g"],["Batterie de secours","Nitecore","environ 20 €","Pour une nuit complète"],["Veste imperméable","Kiprun Run 900","99,99 €","Même imper que des vestes 2× plus chères"],["Couche chaude, bonnet, gants","Kiprun / Decathlon","environ 50 €","Obligatoires"],["Survie + gobelet","Decathlon","environ 10 €","Obligatoires"],["Total","","~720 €","~655 € avec les Speedgoat à 99,99 €"]],
hg:[["Chaussures de course","Salomon S/Lab Ultra Glide 2","250 €","292 g, drop 6 mm, pour plus de 60 km"],["Chaussures d'entraînement","Hoka Speedgoat 7","164,99 €","Terrains techniques"],["Sac","Salomon ADV Skin 12","140 €","Le meilleur de sa catégorie"],["Bâtons","Black Diamond Distance Carbon Z","160 €","256-296 g la paire"],["Frontale","Petzl Nao RL","160 €","1 500 lumens, éclairage réactif"],["Veste imperméable","Salomon Bonatti Trail","162 €","Pertex Shield 20K/20K"],["Couche mérinos, bonnet, gants","Au choix","environ 90 €","Plus chaude à poids égal"],["Survie + gobelet","Decathlon","environ 10 €","Obligatoires"],["Total","","~1 175 €","Alternative frontale : Petzl Swift RL à 93,90 €"]]
};

const CHECK=[["Dossard + épingles ou porte-dossard","toutes"],["Puce de chronométrage si fournie à part","toutes"],["Chaussures de course rodées","toutes"],["Chaussettes testées","toutes"],["Crème anti-frottements","toutes"],["Montre chargée + trace GPS","toutes"],["Flasques remplies","toutes"],["Nutrition comptée pour la course","toutes"],["Téléphone chargé","toutes"],["Pièce d'identité + carte bancaire","toutes"],["Sac de trail réglé","ultra"],["Frontale + batterie de secours","ultra"],["Veste imperméable","ultra"],["Couche chaude","ultra"],["Bonnet + gants","ultra"],["Couverture de survie","ultra"],["Gobelet souple","ultra"],["Sifflet","ultra"],["Bâtons","ultra"],["Pansements ampoules","ultra"],["Pastilles de sel","ultra"],["Vêtements secs pour l'arrivée","ultra"],["Plan de course écrit (sections, temps, nutrition)","ultra"]];
