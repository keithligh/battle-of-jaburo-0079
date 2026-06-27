/* =====================================================================
 *  data.js: THE BATTLE OF JABURO (查布羅戰役). A self-playing 3D documentary.
 *  ---------------------------------------------------------------------
 *  A FICTIONAL battle from "Mobile Suit Gundam" (機動戰士高達, Sunrise, 1979),
 *  set on 30 November Universal Century 0079, during the One Year War. The
 *  Principality of Zeon, led by Char Aznable, launches a surprise assault on
 *  the Earth Federation's hidden underground headquarters, Jaburo; the
 *  Federation holds. This is a documentary-style reconstruction of the canon,
 *  NOT real history.
 *
 *  Faithfulness over invention: every depicted force, commander and beat traces
 *  to the cited Gundam canon (see notes.sources and Research_Brief_BattleOfJaburo.md);
 *  supplementary/disputed material and the real-world geographic stand-in are
 *  disclosed honestly in notes.caveats. The engine itself is never edited.
 *
 *  Bilingual slots: `_zh` = Traditional Chinese (primary), `_en` = English.
 * ===================================================================== */
window.BATTLE_DATA = (function () {

  /* -- the two sides. `eff` = Earth Federation (defender, blue);
   *    `zeon` = Principality of Zeon (attacker, red). role drives the engine's
   *    attacker/defender behaviour (front/retreat colour, strength bars, gradient). -- */
  const factions = {
    eff:  { main:0x3b6fd8, glow:0x6f9bff, dim:0x1f3a78, css:"#3b6fd8", name_zh:"地球聯邦軍", name_en:"Earth Federation Forces", role:"defender", maxStrength:2800, defaultFlag:"eff" },
    zeon: { main:0xcf2a2a, glow:0xff6a55, dim:0x7a1717, css:"#cf2a2a", name_zh:"自護公國軍", name_en:"Principality of Zeon",     role:"attacker", maxStrength:2800, defaultFlag:"zeon" },
  };

  /* -- the map box (REAL WGS84 lng/lat) + the clock window + identity.
   *    meta.geo is the single bbox source (tools/fetch_tiles reads it). The box covers the
   *    Guiana Highlands (Mount Roraima / Kukenan-tepui), our disclosed real-world stand-in for
   *    Jaburo: real terrain with >1,000 m of relief and real rivers. See notes.caveats. -- */
  const meta = {
    geo:{ minLng:-60.92, maxLng:-60.62, minLat:5.02, maxLat:5.28, Z:13 },
    dayMin:29, dayMax:30.9, year:79, month:11, lastDay:30,   // U.C. 0079.11.29 (prelude) -> 0079.11.30 (the battle)
    title:"查布羅戰役", subtitle:"機動戰士高達 · 一年戰爭 · The Battle of Jaburo · U.C.0079",
    // a humid-highland film grade: less sepia than the default so the jungle greens read, grade otherwise unchanged.
    theme:{ grade:{ filter:"sepia(0.16) saturate(0.92) contrast(1.05) brightness(0.99)", vignette:0.42, grain:0.045 } },
  };

  /* -- ui: full Traditional Chinese interface pack (English appended on compact chrome where it aids clarity).
   *    The disclaimer keeps the required EOX/SRTM attribution verbatim (English) and adds the fiction note. -- */
  const ui = {
    boot:{ dem:"載入地形高程 (DEM)…", imagery:"載入衛星影像…", terrain:"建構地形…", music:"載入配樂…", starting:"啟動中…" },
    err:{ tileLoad:"地圖磚載入失敗：", tilesMissing:"過多地圖磚缺失", tilesMissingHint:"請重新執行 fetch_tiles", tileGaps:"地圖磚" },
    frontLine:{ zh:"戰線", en:"Front line" },
    strengthUnit:"", endLabel:"終", sceneLabel:"U.C.00{year}.{month}.{day}",
    notesCaveatsHeader:"說明與限制 Caveats", notesSourcesHeader:"資料來源 Sources",
    langToggle:{ both:"中·EN", zh:"中", en:"EN" },
    notesBtn:"ⓘ 註記 Notes", notesHeader:"註記與資料來源 NOTES & SOURCES", resume:"▶ 繼續導覽 Resume",
    hint:{ autoplay:"自動播放中 Auto-playing", drag:"拖曳可自由視角（會暫停導覽）Drag to free-look" },
    legend:{ symbolsHeader:"圖例 Symbols", flagsHeader:"勢力旗幟 Flags",
      advance:"進攻 Advance", hq:"司令部 HQ", air:"空中 Air", navy:"海上 Naval", artillery:"火砲 Artillery", contact:"接敵 In contact", strength:"戰力 Strength",
      movement:"移動 Movement", combat:"交戰・火力 Combat", lost:"損失・撤退 Lost" },
    disclaimer:"虛構戰役（機動戰士高達, U.C.0079），重現於真實地形之上；片中以真實的羅賴馬山一帶代用查布羅之位置（原作未載其座標）。"
      +"地形與影像為現今實景，與作品設定未必相符。<br>"
      +"Imagery © EOX Sentinel-2 cloudless 2016 (CC BY 4.0, s2maps.eu, modified Copernicus Sentinel data) · elevation SRTM courtesy USGS",
  };

  /* -- intro: the opening title card + its establishing camera over the massif. -- */
  const intro = { title_zh:"查布羅戰役", title_en:"The Battle of Jaburo",
    sub_zh:"機動戰士高達 · 一年戰爭 · U.C.0079.11.30", sub_en:"Mobile Suit Gundam · One Year War · U.C. 0079",
    cam:{ lng:-60.77, lat:5.14, dist:1700, az:15, el:50 } };   // a reveal of the massif, close enough to read the base

  /* -- outro: the closing pull-back. It states plainly that this is a fictional reconstruction. -- */
  const outro = { title_zh:"查布羅，巋然不動", title_en:"Jaburo Stands",
    narration_zh:"地球聯邦守住了查布羅。這是一場虛構的戰役，謹依《機動戰士高達》設定，重現於真實的圭亞那高地之上。",
    narration_en:"The Earth Federation held Jaburo. This is a fictional battle, reconstructed faithfully to Mobile Suit Gundam canon over the real terrain of the Guiana Highlands.",
    cam:{ lng:-60.78, lat:5.12, dist:1900, az:0, el:50, orbit:1.2, tween:3.6 } };   // measured pull-back + orbit

  /* -- flagLegend: the flag swatches in the legend (art is in flags.js). -- */
  const flagLegend = [
    { flag:"eff",  zh:"地球聯邦軍", en:"Earth Federation Forces", faction:"eff"  },
    { flag:"zeon", zh:"自護公國軍", en:"Principality of Zeon",     faction:"zeon" },
  ];

  /* -- geography: real named places (peaks have h>0 → ▲), the base gate, the river, the savanna,
   *    and the Federation's outer perimeter (a defensive line that holds). -- */
  const geography = {
    regions: [
      { name_zh:"大薩瓦納草原", name_en:"Gran Sabana", type:"region", lng:-60.80, lat:5.055 },
    ],
    points: [
      { name_zh:"羅賴馬山", name_en:"Mount Roraima", type:"peak", lng:-60.76250, lat:5.14333, h:2810 },
      { name_zh:"庫克南山", name_en:"Kukenan-tepui", type:"peak", lng:-60.83116, lat:5.21011, h:2680 },
      { name_zh:"查布羅太空港閘門", name_en:"Jaburo Spaceport Gate", type:"fort", lng:-60.772, lat:5.112 },
      { name_zh:"庫克南河", name_en:"Kukenan River", type:"bay", lng:-60.838, lat:5.085 },
    ],
    lines: [
      { name_zh:"聯邦外圍防線", name_en:"Federation Perimeter", color:"#5b8def",
        path:[[-60.845,5.10],[-60.805,5.088],[-60.765,5.083],[-60.725,5.089],[-60.70,5.10]] },
    ],
  };

  /* -- units: each force moves along its track of keyframes {d,lng,lat,s,st}.
   *    st (state) in march | hold | attack | retreat | landing | dead. kind:"command" renders the
   *    static HQ beacon; every other kind renders the formation wedge that scales with strength (cf:true). -- */
  const units = [
    // ---- EARTH FEDERATION (defender): holding the massif and the gate ----
    { id:"eff_hq", faction:"eff", kind:"command", flag:"eff", cf:false,
      name_zh:"查布羅司令部", name_en:"Jaburo HQ", type:"Headquarters",
      track:[ {d:29, lng:-60.765, lat:5.132, s:1200, st:"hold"},
              {d:30.9, lng:-60.765, lat:5.132, s:1200, st:"hold"} ] },
    { id:"eff_whitebase", faction:"eff", kind:"navy", flag:"eff", cf:true,
      name_zh:"白色基地", name_en:"White Base (SCV-70)", type:"Assault carrier",
      track:[ {d:29, lng:-60.802, lat:5.078, s:900, st:"march"},
              {d:29.4, lng:-60.772, lat:5.112, s:900, st:"hold"},
              {d:30.9, lng:-60.772, lat:5.112, s:860, st:"hold"} ] },
    { id:"eff_gundam", faction:"eff", kind:"mecha", flag:"eff", cf:true,
      name_zh:"高達", name_en:"RX-78-2 Gundam", type:"Mobile Suit",
      track:[ {d:30.0, lng:-60.772, lat:5.112, s:720, st:"hold"},
              {d:30.35, lng:-60.783, lat:5.102, s:720, st:"attack"},
              {d:30.5, lng:-60.788, lat:5.099, s:700, st:"attack"},
              {d:30.9, lng:-60.780, lat:5.106, s:700, st:"hold"} ] },
    { id:"eff_gm", faction:"eff", kind:"mecha", flag:"eff", cf:true,
      name_zh:"吉姆部隊", name_en:"RGM-79 GM line", type:"Mass-production Mobile Suit",
      track:[ {d:29.8, lng:-60.762, lat:5.100, s:1100, st:"hold"},
              {d:30.2, lng:-60.772, lat:5.092, s:1000, st:"attack"},
              {d:30.9, lng:-60.766, lat:5.100, s:960, st:"hold"} ] },
    { id:"eff_support", faction:"eff", kind:"artillery", flag:"eff", cf:true,
      name_zh:"鐳射大砲隊", name_en:"Guncannon & Guntank battery", type:"Support Mobile Suit",
      track:[ {d:29.8, lng:-60.750, lat:5.115, s:600, st:"hold"},
              {d:30.9, lng:-60.752, lat:5.115, s:560, st:"hold"} ] },
    { id:"eff_flymanta", faction:"eff", kind:"air", flag:"eff", cf:true,
      name_zh:"飛行曼塔", name_en:"Fly Manta interceptors", type:"Interceptor",
      track:[ {d:30.0, lng:-60.780, lat:5.082, s:500, st:"hold"},
              {d:30.2, lng:-60.798, lat:5.072, s:480, st:"attack"},
              {d:30.5, lng:-60.788, lat:5.086, s:440, st:"attack"} ] },
    { id:"eff_beam", faction:"eff", kind:"artillery", flag:"eff", cf:true,
      name_zh:"光束砲台", name_en:"Concealed beam batteries", type:"Fixed defense",
      track:[ {d:29.5, lng:-60.742, lat:5.100, s:800, st:"hold"},
              {d:30.9, lng:-60.742, lat:5.100, s:780, st:"hold"} ] },

    // ---- PRINCIPALITY OF ZEON (attacker): up the river and down from the sky ----
    { id:"zeon_madangler", faction:"zeon", kind:"navy", flag:"zeon", cf:true,
      name_zh:"馬德安格拉", name_en:"Mad Angler subs", type:"Submarine squadron",
      track:[ {d:29, lng:-60.890, lat:5.050, s:700, st:"march"},
              {d:29.8, lng:-60.842, lat:5.072, s:700, st:"march"},
              {d:30.2, lng:-60.812, lat:5.090, s:650, st:"hold"},
              {d:30.9, lng:-60.866, lat:5.050, s:500, st:"retreat"} ] },
    { id:"zeon_char", faction:"zeon", kind:"mecha", flag:"zeon", cf:true,
      name_zh:"馬沙・魔蟹", name_en:"Char's MSM-07S Z'Gok", type:"Commander Mobile Suit",
      track:[ {d:29.6, lng:-60.860, lat:5.060, s:600, st:"march"},
              {d:30.1, lng:-60.812, lat:5.090, s:600, st:"attack"},
              {d:30.35, lng:-60.790, lat:5.100, s:560, st:"attack"},
              {d:30.55, lng:-60.786, lat:5.100, s:520, st:"attack"},
              {d:30.78, lng:-60.852, lat:5.052, s:480, st:"retreat"} ] },
    { id:"zeon_amphib", faction:"zeon", kind:"mecha", flag:"zeon", cf:true,
      name_zh:"水陸兩用MS隊", name_en:"Amphibious MS (Z'Gok / Gogg / Zock)", type:"Amphibious Mobile Suit",
      track:[ {d:29.8, lng:-60.850, lat:5.060, s:800, st:"march"},
              {d:30.2, lng:-60.802, lat:5.094, s:700, st:"attack"},
              {d:30.5, lng:-60.787, lat:5.100, s:300, st:"attack"},
              {d:30.72, lng:-60.787, lat:5.100, s:0, st:"dead"} ] },
    { id:"zeon_gaw", faction:"zeon", kind:"air", flag:"zeon", cf:true,
      name_zh:"野牛母艦隊", name_en:"Gaw carriers & Dopp fighters", type:"Air carrier group",
      track:[ {d:30.0, lng:-60.820, lat:5.050, s:900, st:"attack"},
              {d:30.2, lng:-60.792, lat:5.070, s:700, st:"attack"},
              {d:30.5, lng:-60.802, lat:5.060, s:450, st:"retreat"},
              {d:30.9, lng:-60.862, lat:5.042, s:350, st:"retreat"} ] },
    { id:"zeon_land", faction:"zeon", kind:"mecha", flag:"zeon", cf:true,
      name_zh:"陸戰MS隊", name_en:"Land MS (Zaku II / Gouf / Dom)", type:"Mobile Suit",
      track:[ {d:30.0, lng:-60.800, lat:5.070, s:1000, st:"landing"},
              {d:30.2, lng:-60.782, lat:5.085, s:800, st:"attack"},
              {d:30.5, lng:-60.776, lat:5.095, s:350, st:"attack"},
              {d:30.74, lng:-60.776, lat:5.095, s:0, st:"dead"} ] },
    { id:"zeon_acguy", faction:"zeon", kind:"mecha", flag:"zeon", cf:true,
      name_zh:"龜霸突擊隊", name_en:"Acguy commandos", type:"Commando Mobile Suit",
      track:[ {d:30.4, lng:-60.790, lat:5.100, s:400, st:"attack"},
              {d:30.6, lng:-60.772, lat:5.112, s:350, st:"attack"},
              {d:30.82, lng:-60.820, lat:5.060, s:250, st:"retreat"} ] },
  ];

  /* -- arrows: dated movement annotations {f,from,to,d,kind,label}. The airdrop uses LANDING arrows
   *    (sky -> ground); the river approach and the breakthroughs use ATTACK arrows. -- */
  const arrows = [
    { f:"zeon", from:[-60.882,5.050], to:[-60.818,5.088], d:29.9, kind:"attack",  label:"溯河突進 River advance" },
    { f:"zeon", from:[-60.828,5.030], to:[-60.800,5.068], d:30.0, kind:"landing", label:"空降 Airdrop" },
    { f:"zeon", from:[-60.788,5.030], to:[-60.780,5.068], d:30.0, kind:"landing", label:"空降 Airdrop" },
    { f:"zeon", from:[-60.808,5.092], to:[-60.788,5.100], d:30.35, kind:"attack", label:"突入 Breakthrough" },
    { f:"eff",  from:[-60.770,5.110], to:[-60.786,5.100], d:30.42, kind:"attack", label:"迎擊 Intercept" },
    { f:"zeon", from:[-60.790,5.092], to:[-60.858,5.050], d:30.76, kind:"retreat", label:"撤退 Withdrawal" },
  ];

  /* -- fronts: dated front-line polylines (the contact line). It is pushed back south as the EFF holds. -- */
  const fronts = [
    { d:29.5, path:[[-60.835,5.076],[-60.785,5.072],[-60.730,5.076]] },
    { d:30.2, path:[[-60.822,5.086],[-60.786,5.086],[-60.742,5.088]] },
    { d:30.7, path:[[-60.835,5.068],[-60.785,5.064],[-60.730,5.069]] },
  ];

  /* -- weather: per-day { d, night, fog, rain, smoke } (each 0..1). Humid highland. -- */
  const weather = [
    { d:29,   night:0.16, fog:0.26, rain:0.0,  smoke:0.0,  zh:"晨霧", en:"Misty dawn" },
    { d:30,   night:0.0,  fog:0.18, rain:0.10, smoke:0.12, zh:"陰天・硝煙", en:"Overcast, battle smoke" },
    { d:30.7, night:0.06, fog:0.20, rain:0.05, smoke:0.18, zh:"硝煙瀰漫", en:"Smoke over the highlands" },
  ];

  /* -- hotspots: dated combat FX { a, b, kind, lng, lat, i } (built-in kinds only). -- */
  const hotspots = [
    { a:30.0, b:30.3,  kind:"landing",   lng:-60.800, lat:5.070, i:0.7 },
    { a:30.0, b:30.25, kind:"landing",   lng:-60.782, lat:5.075, i:0.6 },
    { a:30.0, b:30.3,  kind:"firefight", lng:-60.806, lat:5.092, i:0.5 },
    { a:30.1, b:30.45, kind:"air",       lng:-60.792, lat:5.078, i:0.6 },
    { a:30.1, b:30.5,  kind:"artillery", lng:-60.760, lat:5.100, i:0.55 },
    { a:30.3, b:30.6,  kind:"explosion", lng:-60.788, lat:5.100, i:0.7 },
    { a:30.35,b:30.55, kind:"firefight", lng:-60.785, lat:5.100, i:0.7 },
    { a:30.5, b:30.66, kind:"explosion", lng:-60.773, lat:5.112, i:0.5 },
  ];

  /* -- storyboard: the directed shots, cut like a TV battle documentary. Framing is kept CLOSE so the mobile
   *    suits and the fighting are always readable: a brief context reveal, then mostly TIGHT/MEDIUM shots on the
   *    action, a HERO ORBIT circling the climax, and a measured PULL-BACK at the close. `dist` drives the zoom
   *    (engine eases each move over CFG.TWEEN; effective distance = dist*0.45 world units, ~16.5 m per unit, so
   *    e.g. dist 380 ≈ a 2.8 km framing); `az` swings around the massif so each cut sweeps; `el` varies high/low;
   *    `orbit` (deg/sec) circles the action through the hold. -- */
  const storyboard = [
    // 1. Context reveal (~11 km): the highland + the base area, slow orbit. Close enough to pick out the cluster.
    { day:29.0, hold:9, cam:{lng:-60.77, lat:5.14, dist:1500, az:18, el:48, orbit:0.9},
      title_zh:"潛伏的要塞", title_en:"The Hidden Fortress", dateLabel:"U.C. 0079.11.29",
      narration_zh:"南美的圭亞那高地。在這片台地與密林之下，藏著地球聯邦軍最大的地下司令部「查布羅」。",
      narration_en:"The Guiana Highlands of South America. Beneath these tablelands and jungle lies Jaburo, the Earth Federation's greatest underground stronghold.",
      side:"eff", focus:["eff_hq","eff_whitebase"], commanders:[{zh:"雷比爾將軍",en:"Gen. Revil"}] },
    // 2. PUNCH-IN to the gate (1500 -> 600, ~4.5 km): White Base descends, Char marks the spot.
    { day:29.4, hold:7, cam:{lng:-60.77, lat:5.11, dist:600, az:-30, el:38, orbit:0.6},
      title_zh:"白色基地入港", title_en:"White Base Descends", dateLabel:"U.C. 0079.11.29",
      narration_zh:"白色基地循密道沒入岩體。在它下方，馬沙的潛艦隊看準閘門開啟的一瞬，記下了這座要塞的位置。",
      narration_en:"White Base slips into the rock through a hidden gate. Below, Char's submarines catch the moment it opens and mark the fortress for the first time.",
      side:"eff", focus:["eff_whitebase","eff_hq"], commanders:[{zh:"布拉度・諾亞",en:"Bright Noa"}] },
    // 3. CLOSE low tracking up the river (~4.8 km), big az swing.
    { day:29.7, hold:8, cam:{lng:-60.83, lat:5.07, dist:650, az:-68, el:32, orbit:0.6},
      title_zh:"溯流而上", title_en:"Up the River", dateLabel:"U.C. 0079.11.29 · 夜 Night",
      narration_zh:"馬沙的馬德安格拉潛艦隊溯河而上，水陸兩用機體在暗流中逼近太空港的閘門。",
      narration_en:"Char's Mad Angler submarine squadron pushes up the river. Amphibious mobile suits close on the spaceport gate under cover of the current.",
      side:"zeon", focus:["zeon_madangler","zeon_char"], commanders:[{zh:"馬沙・亞斯洛布",en:"Char Aznable"}] },
    // 4. Lift to a slightly wider view (~7 km) so the whole drop force reads over the savanna.
    { day:30.0, hold:9, cam:{lng:-60.80, lat:5.07, dist:950, az:28, el:46, orbit:0.6},
      title_zh:"天降強襲", title_en:"The Airborne Assault", dateLabel:"U.C. 0079.11.30 · 拂曉 Dawn",
      narration_zh:"拂曉，野牛空中母艦掠過大薩瓦納草原，渣古、老虎與大魔自天而降。查布羅之戰就此爆發。",
      narration_en:"At dawn the Gaw carriers sweep over the Gran Sabana and drop their Zakus, Goufs and Doms. The Battle of Jaburo has begun.",
      side:"zeon", focus:["zeon_gaw","zeon_land"], commanders:[] },
    // 5. HARD PUNCH-IN (950 -> 380, ~2.8 km), low: the MS hit the ground, dust everywhere.
    { day:30.05, hold:7, cam:{lng:-60.80, lat:5.07, dist:380, az:-6, el:34, orbit:1.0},
      title_zh:"鋼鐵巨人著陸", title_en:"Boots on the Ground", dateLabel:"U.C. 0079.11.30 · 拂曉 Dawn",
      narration_zh:"渣古與大魔重重砸落草原，揚起漫天塵土。自護的鋼鐵巨人已踏上查布羅的門前。",
      narration_en:"Zakus and Doms slam down onto the savanna in clouds of dust. Zeon's steel giants have reached Jaburo's doorstep.",
      side:"zeon", focus:["zeon_land"], commanders:[] },
    // 6. SWEEP to the far side (az 110), close (~4.6 km) on the defenders firing.
    { day:30.2, hold:9, cam:{lng:-60.77, lat:5.095, dist:620, az:110, el:40, orbit:0.9},
      title_zh:"聯邦的火網", title_en:"The Federation's Guns", dateLabel:"U.C. 0079.11.30 · 上午 Morning",
      narration_zh:"聯邦的隱蔽光束砲台與飛行曼塔攔截機迎頭痛擊，大批自護機體未及落地便被擊墜。",
      narration_en:"Concealed beam batteries and Fly Manta interceptors answer hard. Many of the Zeon machines never reach the ground.",
      side:"eff", focus:["eff_beam","eff_flymanta"], commanders:[] },
    // 7. TIGHT on the gate (~3.6 km): Char breaks in among the GMs.
    { day:30.35, hold:9, cam:{lng:-60.787, lat:5.10, dist:480, az:60, el:36, orbit:0.9},
      title_zh:"突入閘門", title_en:"Into the Gate", dateLabel:"U.C. 0079.11.30 · 正午 Midday",
      narration_zh:"馬沙的紅色魔蟹破開水下入口，率水陸兩用隊突入要塞。聯邦的吉姆量產型傾巢而出迎戰。",
      narration_en:"Char's red Z'Gok blasts through an underwater entrance and leads the amphibious team inside. The mass-produced GMs pour out to meet them.",
      side:"both", focus:["zeon_char","eff_gm"], commanders:[{zh:"馬沙・亞斯洛布",en:"Char Aznable"}] },
    // 8. HERO ORBIT: very tight (~2.5 km), low, circling the duel (the centrepiece).
    { day:30.45, hold:13, cam:{lng:-60.785, lat:5.10, dist:340, az:200, el:30, orbit:2.2},
      title_zh:"紅彗星與高達", title_en:"The Red Comet and the Gundam", dateLabel:"U.C. 0079.11.30 · 午後 Afternoon",
      narration_zh:"馬沙與阿寶的高達正面交鋒。伍迪駕駛凡凡氣墊機決死衝撞，擊損馬沙的主攝影機，迫使紅彗星後撤，自己卻命喪當場。",
      narration_en:"Char duels Amuro's Gundam head-on. Lt. Woody Malden rams his Fan Fan in a suicidal charge, smashing Char's main camera and forcing the Red Comet back, at the cost of his own life.",
      side:"both", focus:["zeon_char","eff_gundam"], commanders:[{zh:"阿寶・尼爾",en:"Amuro Ray"},{zh:"伍迪・馬爾汀",en:"Woody Malden"}] },
    // 9. TIGHT on the sabotage (~3.4 km), swing back.
    { day:30.55, hold:9, cam:{lng:-60.775, lat:5.11, dist:460, az:-40, el:38, orbit:0.8},
      title_zh:"龜霸的破壞工作", title_en:"The Acguy Sappers", dateLabel:"U.C. 0079.11.30 · 午後 Afternoon",
      narration_zh:"龜霸突擊隊潛入，於吉姆生產工廠安放定時炸彈。白色基地的孩子們發現了破壞者，及時示警，炸彈被拆除。",
      narration_en:"An Acguy commando team infiltrates and plants time bombs on the GM factory. The White Base children find the saboteurs and raise the alarm in time. The bombs are defused.",
      side:"zeon", focus:["zeon_acguy","eff_gm"], commanders:[] },
    // 10. Ease out to a medium shot (~6.7 km) of the retreat down-river.
    { day:30.75, hold:9, cam:{lng:-60.82, lat:5.07, dist:900, az:-90, el:42, orbit:0.9},
      title_zh:"撤退", title_en:"The Withdrawal", dateLabel:"U.C. 0079.11.30 · 黃昏 Dusk",
      narration_zh:"抵抗過於頑強，自護未能達成任何目標。馬沙掩護殘部撤離，查布羅的閘門依舊緊閉。",
      narration_en:"The defense is too strong and Zeon achieves none of its objectives. Char covers the retreat of his survivors. Jaburo's gates remain sealed.",
      side:"zeon", focus:["zeon_char","zeon_amphib"], commanders:[{zh:"馬沙・亞斯洛布",en:"Char Aznable"}] },
    // 11. Measured pull-back (~11 km): rise over the intact fortress, slow orbit.
    { day:30.85, hold:12, cam:{lng:-60.78, lat:5.12, dist:1500, az:8, el:50, orbit:1.1},
      title_zh:"聯邦的勝利", title_en:"A Federation Victory", dateLabel:"U.C. 0079.11.30 · 入夜 Nightfall",
      narration_zh:"查布羅安然無恙，吉姆生產線完好，自護折損逾半。聯邦守住了要塞，卻也暴露了它的位置。日後反攻太空的艦隊，將從這座地底港啟航。",
      narration_en:"Jaburo stands intact, its GM lines unharmed, Zeon's attacking force more than halved. The Federation holds its fortress, even as its secret location is now known. From this underground port, the fleet that will retake space will one day sail.",
      side:"eff", focus:["eff_hq","eff_gundam","eff_gm"], commanders:[{zh:"雷比爾將軍",en:"Gen. Revil"}] },
  ];

  /* -- notes: REQUIRED. summary + caveats[] + sources. This is a fictional battle, so sources cite the
   *    canonical Gundam works (not real history); the honesty disclosures live in caveats. -- */
  const notes = {
    summary:"「查布羅戰役」是動畫《機動戰士高達》（Sunrise, 1979）中的虛構戰役，發生於宇宙世紀（U.C.）0079 年 11 月 30 日的一年戰爭期間。自護公國軍由馬沙・亞斯洛布率領，奇襲地球聯邦軍位於南美的地下總司令部查布羅，最終為聯邦所擊退。本片為依據作品設定、重現於真實地形之上的紀錄片式重構，並非真實歷史。 The Battle of Jaburo is a fictional engagement from Mobile Suit Gundam (Sunrise, 1979), set on 30 November U.C. 0079 during the One Year War: Zeon, led by Char Aznable, makes a surprise assault on the Earth Federation's underground headquarters and is repulsed. This is a documentary-style reconstruction over real terrain, not real history.",
    caveats:[
      "虛構戰役：所有部隊、事件與人物均出自《機動戰士高達》（Sunrise, 1979），並非真實歷史。 This is a fictional battle: every force, event and character is from Mobile Suit Gundam (Sunrise, 1979), not real history.",
      "地理為真實地形的代用。查布羅在原始動畫設定於亞馬遜盆地，後期設定（《THE ORIGIN》）改置於圭亞那高地。本片採用真實的羅賴馬山／庫克南山一帶作為代用地點；任何官方作品皆未載明其經緯度。 Geography is a real-world stand-in. Jaburo sits in the Amazon basin in the original anime and is relocated to the Guiana Highlands in later canon (The Origin). This production uses the real Mount Roraima / Kukenan area as a stand-in; no official work gives coordinates.",
      "時間線依電視動畫設定，集中於 U.C.0079.11.30 一日（11 月 29 日為前夜）。遊戲等補充作品所述的延長戰期非本片採用。 Timeline follows the TV-anime single-day framing of 30 Nov U.C. 0079 (29 Nov prelude); the extended siege in some games is not used here.",
      "兵力與戰損數字（如自護投入逾五十架MS、損失過半）出自設定資料集（Entertainment Bible #39 等），非電視畫面直接呈現；片中數值僅作示意。 Force and loss figures (e.g. 50+ Zeon MS committed, over half lost) come from supplementary guidebooks (Entertainment Bible #39), not shown directly on screen; values here are illustrative.",
      "自護軍溯行的具體河流於原作未具名；片中沿庫克南河的行軍路線為本片之編排。 The specific river the Zeon force ascended is unnamed in canon; the Kukenan-River route shown here is this production's staging.",
      "旗幟為一年戰爭時期的勢力徽記：自護為紅底金色徽紋，聯邦為金色徽記（藍底為後製重建色）。皆為虛構徽記，非任何真實世界的違禁符號。 Flags are the One-Year-War faction emblems: Zeon's gold crest on red, the Federation's gold emblem (the blue field is a reconstructed colour). Both are fictional insignia, not any real-world prohibited symbol.",
      "地形與衛星影像為現今實景（EOX Sentinel-2 / SRTM），與作品設定未必相符。 Terrain and imagery are present-day real-world data (EOX Sentinel-2 / SRTM) and need not match the work's setting.",
    ],
    sources:"主要依據 Primary canon: 《機動戰士高達》電視動畫第 29 話《Tragedy in Jaburo》與第 30 話《A Wish of War Orphans》(Sunrise, 1979)；劇場版II《哀・戰士編 / Soldiers of Sorrow》(1981)。 References: The Gundam Wiki (Battle of Jaburo, Jaburo, Char Aznable, Amuro Ray, Operation V, Earth Federation Forces, Principality of Zeon, MSM-07 Z'Gok); Wikipedia (Mobile Suit Gundam, List of Mobile Suit Gundam episodes, Mount Roraima, Kukenan-tepui, Gran Sabana); Mobile Suit Gundam The Origin official site (gundam-the-origin.net); Flags of the World (fic_gund). 完整來源與考證見專案內 Research_Brief_BattleOfJaburo.md。 Full sourcing and fact-check: Research_Brief_BattleOfJaburo.md in this repository.",
  };

  return { meta, factions, ui, intro, outro, flagLegend, geography, units, arrows, fronts, weather, hotspots, storyboard, notes };
})();
