const BASE=[
[1,"2026-10-19","Base + 10 km",7,800,"5 × 1 km à 4'20, récup 1'30","SL 1 h 45","1 h Z2"],
[2,"2026-10-26","Base + 10 km",7.5,900,"10 × 400 m à 3'50, récup 1'","SL 2 h","1 h Z2"],
[3,"2026-11-02","Base + 10 km",8,1000,"3 × 2 km à 4'15-4'20, récup 2'","SL 2 h","1 h 15 Z2"],
[4,"2026-11-09","Allégée",5.5,600,"8 × 300 m vifs, récup 1'","SL 1 h 30","45 min Z2"],
[5,"2026-11-16","Base + volume",5.5,500,"3 × 3 km à 4'20, récup 2'","SL 1 h 45","1 h Z2"],
[6,"2026-11-23","Base + volume",6,700,"8 × 2 min en côte, récup en descente","SL 2 h","1 h Z2"],
[7,"2026-11-30","Base + volume",6.5,900,"3 × 8 min seuil, récup 2'","SL 2 h 15","1 h 15 Z2"],
[8,"2026-12-07","Base + volume",7,1000,"6 × 3 min en côte, récup en descente","SL 2 h 15","1 h 15 Z2"],
[9,"2026-12-14","Allégée",5,500,"8 × 30 s vifs en côte","SL 1 h 45","1 h 15 Z2"],
[10,"2026-12-21","Base + volume",7,700,"10 × 400 m à 3'50, récup 1'","SL 2 h 15","1 h 15 Z2"],
[11,"2026-12-28","Base + volume",7.5,800,"3 × 10 min seuil, récup 2'","SL 2 h 30","1 h 30 Z2"],
[12,"2027-01-04","Base + volume",8,900,"5 × 1 km à 4'00, récup 1'30","SL 2 h 45","1 h 45 Z2"],
[13,"2027-01-11","Allégée",5.5,600,"6 × 1 min vif","SL 2 h","1 h 30 Z2"],
[14,"2027-01-18","Développement",8.5,1000,"4 × 8 min seuil, récup 2'","SL 3 h","2 h Z2"],
[15,"2027-01-25","Allégée + course",5.5,900,"3 × 5 min à allure seuil bas","40 min Z1 + 4 lignes droites","RACE:Trail des Mouflons, 25 km|Checkpoint 1 · Cherveix-Cubas (24), 25 km, 700 m D+. Valide le bloc de base : départ en Z3, dernier tiers à fond si les jambes sont là. 30-40 g de glucides par heure."],
[16,"2027-02-01","Récup",6.5,700,"EASY:Footing 1 h Z2, pas de qualité","SL 2 h 15","1 h 30 Z2"],
[17,"2027-02-08","Développement",9,1100,"6 × 4 min en côte, récup en descente","SL 3 h 15","2 h Z2"],
[18,"2027-02-15","Développement",9.5,1200,"3 × 12 min seuil, récup 3'","SL 3 h 30","2 h 15 Z2"],
[19,"2027-02-22","Allégée + course",6,1100,"3 × 5 min à allure course","40 min Z1 + 4 lignes droites","RACE:Grand Trail des Couteliers, 36 km|Checkpoint 2 · Nontron (24), 36 km, 850 m D+. Valide le bloc développement : allure régulière, test de 50 g de glucides par heure."],
[20,"2027-03-01","Récup",6.5,900,"EASY:Footing 1 h Z2 + 6 lignes droites","SL 2 h 30","1 h 30 Z2"],
[21,"2027-03-08","Développement",10,1800,"6 × 5 min en côte, récup en descente","SL 3 h 45","2 h Z2"],
[22,"2027-03-15","Développement",10.5,2000,"3 × 12 min seuil en montée","SL 4 h","2 h 15 Z2"],
[23,"2027-03-22","Développement",11,2200,"2 × 20 min tempo en montée, récup 4'","SL 4 h 15","2 h 30 Z2 (enchaînement)"],
[24,"2027-03-29","Allégée",7,1200,"8 × 1 min en côte","SL 3 h","2 h Z2"],
[25,"2027-04-05","Spécifique",11,1800,"5 × 6 min en côte","SL 4 h 15","2 h 30 Z2"],
[26,"2027-04-12","Spécifique",11.5,2000,"3 × 15 min seuil, récup 3'","SL 4 h 30","2 h 45 Z2 (enchaînement)"],
[27,"2027-04-19","Spécifique",12,2200,"8 × 3 min en côte + descente rapide contrôlée","SL 5 h","2 h 45 Z2 (enchaînement)"],
[28,"2027-04-26","Allégée + course",6,1600,"3 × 5 min à allure course","RACE:Ultra Trail Causses et Vallées, L'Atypique 42 km|Checkpoint 3 · Cahors (46), 42 km, environ 1 800 m D+. Premier marathon trail : valide le bloc spécifique. Matériel complet, 60 g de glucides par heure.","Repos"],
[29,"2027-05-03","Récup",7,900,"EASY:Footing 1 h Z2, pas de qualité","SL 3 h","2 h Z2"],
[30,"2027-05-10","Spécifique",12,2600,"4 × 10 min seuil en montée","SL 5 h","2 h 45 Z2 (enchaînement)"],
[31,"2027-05-17","Spécifique (choc)",13,3200,"2 × 25 min tempo en montée","SL 5 h 30 en montagne","3 h 15 Z2 (enchaînement)"],
[32,"2027-05-24","Allégée + course",7,3000,"3 × 4 min à allure course","RACE:Trail du Hautacam, 45 km|Checkpoint 4 · Beaucens (65), 45 km, environ 2 700 m D+. Répétition générale du RT100K : même sac, mêmes produits (60-70 g/h), bâtons. Valide le bloc montagne.","Repos"],
[33,"2027-05-31","Récup",7.5,1200,"EASY:Footing 1 h Z2, pas de qualité","SL 3 h","2 h Z2"],
[34,"2027-06-07","Spécifique (choc)",13.5,3800,"5 × 6 min en côte","SL 6 h en montagne avec tout le matériel et la nutrition de course","3 h 15 Z2 (enchaînement)"],
[35,"2027-06-14","Spécifique (choc)",13.5,4000,"3 × 15 min seuil en montée","SL 6 h, départ à 2 h du matin comme au RT100K","3 h 15 Z2 (enchaînement)"],
[36,"2027-06-21","Affûtage",9.5,2000,"3 × 8 min seuil","SL 3 h 30","2 h 15 Z2"],
[37,"2027-06-28","Affûtage",6.5,1000,"4 × 4 min à allure course","SL 2 h 30","1 h 30 Z2"],
[38,"2027-07-05","Course (samedi 10)",3,300,"3 × 3 min de rappel (court)","RACE:Restonica Trail by UTMB (RT100K), 69 km|Objectif de la saison · Corte, 69 km, 3 950 m D+, départ samedi 10 juillet à 2 h. Visé en performance : départ maîtrisé, relances dans les descentes, 60-80 g de glucides par heure.","Repos"],
[39,"2027-07-12","Récup après le RT100K",2,0,"EASY:Marche ou vélo léger 45 min","Marche libre","Repos"],
[40,"2027-07-19","Reprise",3,200,"EASY:Footing 40 min Z1-Z2","Footing 1 h Z2","Repos"]
];
/* Prolongation après le RT100K jusqu'au X-Trail Corrèze Dordogne (plan avec courses uniquement) */
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
   Calendrier revu le 17 novembre 2026 (4 checkpoints + RT100K). */
const RACES=[
["2027-01-31","Trail des Mouflons, 25 km","Checkpoint 1 · Cherveix-Cubas (24), Le petit mouflon : 25 km, 700 m D+, départ 9 h. Valide le bloc de base : départ en Z3, dernier tiers à fond si les jambes sont là. Date estimée (fin janvier, parfois le 1er février) : à confirmer.",false,true,"https://fr.milesrepublic.com/event/trail-des-mouflons-912","Fiche Miles Republic"],
["2027-02-28","Grand Trail des Couteliers, 36 km","Checkpoint 2 · Nontron (24), 36 km, 850 m D+, départ 8 h 30. Valide le bloc développement, test à 50 g de glucides par heure. Date estimée (28 févr.-1er mars en 2026, certaines sources annoncent les 6-7 mars) : à confirmer.",true,true,"https://fr.milesrepublic.com/event/trail-des-grands-couteliers-15742","Fiche Miles Republic"],
["2027-05-01","Ultra Trail Causses et Vallées, 42 km","Checkpoint 3 · Cahors (46), L'Atypique : 42 km, environ 1 800 m D+ (à confirmer). Premier marathon trail, matériel complet, 60 g/h. Date estimée (mai 2027, jour pas encore publié).",true,true,"https://fr.milesrepublic.com/event/ultra-trail-causses-et-vallees-lot-dordogne-2761","Fiche Miles Republic"],
["2027-05-29","Trail du Hautacam, 45 km","Checkpoint 4 · Beaucens (65), samedi 29 mai : 45 km, environ 2 700 m D+. Répétition générale du RT100K : même sac, mêmes produits (60-70 g/h), bâtons.",true,false,"https://www.trails-hautacam.com/inscriptions/trail-du-hautacam","Inscriptions"],
["2027-07-10","Restonica Trail by UTMB (RT100K), 69 km","Objectif de la saison · Corte (Corse), 69 km, 3 950 m D+, départ samedi 10 juillet à 2 h, cours Paoli, limite 19 h. Visé en performance.",true,false,"https://restonica.utmb.world/races/RT100K","Page de la course"],
["2027-08-22","Trail de Peyrignac, 21,8 km","Peyrignac (24), 21,8 km, 530 m D+. Reprise en douceur après le RT100K, sans objectif de temps. Date à confirmer (23 août en 2026).",false,true,"https://fr.milesrepublic.com/event/trail-de-peyrignac-7394","Fiche Miles Republic"],
["2027-09-25","X-Trail Corrèze Dordogne, Grand Trail des Tours 56 km","Argentat (19). 56 km, 2 800 m D+, UTMB Index. Le 81 km si l'été s'est bien passé, le 29 km sinon : à décider en août. Date estimée (26 sept. en 2026).",true,true,"https://www.xtrail-correze-dordogne.com/x-trail-correze-dordogne/","Site officiel"]
];
/* Calendrier « un trail par mois » : date, course retenue, alternative, UTMB Index, Stones, points Grand Raid, surlignée, lien, libellé */
const COURSES=[
["31 janv. 2027 *","<b>Trail des Mouflons, Cherveix-Cubas (24), 25 km, 700 m D+</b> · checkpoint 1","Le grand mouflon 44 km, même jour (trop long à ce stade)","À vérifier","Non","32",1,"https://fr.milesrepublic.com/event/trail-des-mouflons-912","Fiche"],
["28 févr. 2027 *","<b>Grand Trail des Couteliers, Nontron (24), 36 km, 850 m D+</b> · checkpoint 2","Trail 24 km, même jour","À vérifier","Non","44",1,"https://fr.milesrepublic.com/event/trail-des-grands-couteliers-15742","Fiche"],
["1er mai 2027 *","<b>Ultra Trail Causses et Vallées, Cahors (46), 42 km</b> · checkpoint 3","—","À vérifier","Non","≈ 60",1,"https://fr.milesrepublic.com/event/ultra-trail-causses-et-vallees-lot-dordogne-2761","Fiche"],
["29 mai 2027","<b>Trail du Hautacam, Beaucens (65), 45 km, ≈ 2 700 m D+</b> · checkpoint 4","Trail 24 km (1 600 m D+), même jour","À vérifier","Non","≈ 72",1,"https://www.trails-hautacam.com/inscriptions/trail-du-hautacam","Inscriptions"],
["10 juil. 2027","<b>Restonica Trail by UTMB (RT100K), Corte, 69 km, 3 950 m D+</b> · objectif de la saison","—","Oui (100K)","3","108",1,"https://restonica.utmb.world/races/RT100K","Page de la course"],
["22 août 2027 *","<b>Trail de Peyrignac (24), 21,8 km, 530 m D+</b>","—","À vérifier","Non","&lt; 75",0,"https://fr.milesrepublic.com/event/trail-de-peyrignac-7394","Fiche"],
["25 sept. 2027 *","<b>X-Trail Corrèze Dordogne, Argentat (19), 56 km, 2 800 m D+</b> (ou 29 km / 81 km)","—","Oui","Non","84 (117 sur le 81 km)",0,"https://www.xtrail-correze-dordogne.com/x-trail-correze-dordogne/","Site officiel"]
];
const PACKS={
ess:[["Chaussures","Kiprun MT Cushion 2","environ 60 €","282 g, drop 4 mm, amortie"],["Sac","Kiprun Bag 900 10 L","79,99 €","240 g, poche à eau 1 L incluse"],["2 flasques 500 ml","Kiprun","environ 25 €","Non fournies avec ce sac"],["Bâtons","Kiprun aluminium 500","environ 75 €","Robustes pour apprendre"],["Frontale","Kiprun Ontrail 900","60 €","900 lumens, 139 g"],["Veste imperméable","Kiprun Run 900","99,99 €","2,5 couches, 20 000 Schmerber, 182 g"],["Couche chaude, bonnet, gants","Kiprun / Decathlon","environ 45 €","Obligatoires en altitude"],["Survie + gobelet","Decathlon","environ 10 €","Obligatoires"],["Total","","~455 €",""]],
qp:[["Chaussures de course","Hoka Speedgoat 7","99,99 à 164,99 €","Accroche Vibram, référence en ultra"],["Chaussures d'entraînement","Kiprun MT Cushion 2","environ 60 €","Alterner les paires"],["Sac","Salomon ADV Skin 12","96 à 140 €","2 flasques incluses, très stable"],["Bâtons","Kiprun carbone 3 brins","99,99 €","Carbone à moitié prix"],["Frontale","Nitecore HC60 UHE","80 €","1 600 lumens, 140 g"],["Batterie de secours","Nitecore","environ 20 €","Pour une nuit complète"],["Veste imperméable","Kiprun Run 900","99,99 €","Même imper que des vestes 2× plus chères"],["Couche chaude, bonnet, gants","Kiprun / Decathlon","environ 50 €","Obligatoires"],["Survie + gobelet","Decathlon","environ 10 €","Obligatoires"],["Total","","~720 €","~655 € avec les Speedgoat à 99,99 €"]],
hg:[["Chaussures de course","Salomon S/Lab Ultra Glide 2","250 €","292 g, drop 6 mm, pour plus de 60 km"],["Chaussures d'entraînement","Hoka Speedgoat 7","164,99 €","Terrains techniques"],["Sac","Salomon ADV Skin 12","140 €","Le meilleur de sa catégorie"],["Bâtons","Black Diamond Distance Carbon Z","160 €","256-296 g la paire"],["Frontale","Petzl Nao RL","160 €","1 500 lumens, éclairage réactif"],["Veste imperméable","Salomon Bonatti Trail","162 €","Pertex Shield 20K/20K"],["Couche mérinos, bonnet, gants","Au choix","environ 90 €","Plus chaude à poids égal"],["Survie + gobelet","Decathlon","environ 10 €","Obligatoires"],["Total","","~1 175 €","Alternative frontale : Petzl Swift RL à 93,90 €"]]
};

const CHECK=[["Dossard + épingles ou porte-dossard","toutes"],["Puce de chronométrage si fournie à part","toutes"],["Chaussures de course rodées","toutes"],["Chaussettes testées","toutes"],["Crème anti-frottements","toutes"],["Montre chargée + trace GPS","toutes"],["Flasques remplies","toutes"],["Nutrition comptée pour la course","toutes"],["Téléphone chargé","toutes"],["Pièce d'identité + carte bancaire","toutes"],["Sac de trail réglé","ultra"],["Frontale + batterie de secours","ultra"],["Veste imperméable","ultra"],["Couche chaude","ultra"],["Bonnet + gants","ultra"],["Couverture de survie","ultra"],["Gobelet souple","ultra"],["Sifflet","ultra"],["Bâtons","ultra"],["Pansements ampoules","ultra"],["Pastilles de sel","ultra"],["Vêtements secs pour l'arrivée","ultra"],["Plan de course écrit (sections, temps, nutrition)","ultra"]];
