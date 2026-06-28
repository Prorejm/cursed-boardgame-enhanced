/*
  Cursed Boardgame Interactive NSFWCYOA - UPGRADED EDITION
  Created by /u/chinesesilklanterns
  Originally May 2020 - Expanded & Enhanced 2026
  
  License: Free non-commercial use with attribution to original creator.
*/

var TOTAL_CELLS = 144;

//============================================================
// BOARD CONFIG - 144 cells (12x12), 9 event types
//============================================================

var configCells = [
  {cellid:[3,7,10,20,36,48,60,72,84,96,108,120,132,140], category:"Transformation", imagebig:"shrine1big.png", image:"shrine1.png", title:"Transformation Shrine", prompt:"Glowing letters appear...<br/><span style='color:yellow'><em>\"Out with the old, in with the new...\"</em></span>", numans:3},
  {cellid:[2,4,6,8,11,13,15,18,22,25,28,31,34,38,41,44,47,50,53,56,59,62,65,68,71,74,77,80,83,86,89,92,95,98,101,104,107,110,113,116,119,122,125,128,131,134,137,142], category:"CursedTransformation", imagebig:"shrine2big.png", image:"shrine2.png", title:"Cursed Transformation Shrine", prompt:"Glowing letters appear...<br/><span style='color:yellow'><em>\"Life may be dull, but stay here with me...\"</em></span>", numans:3},
  {cellid:[14,35,55,75,100,124], category:"Teleport", imagebig:"portal1big.jpg", image:"portal1.png", title:"Teleportation Portal", prompt:"A blue portal materializes...", numans:0},
  {cellid:[16,32,40,52,67,78,91,99,112,121,130,139,143], category:"CursedTeleport", imagebig:"portal2big.jpg", image:"portal2.png", title:"Cursed Teleportation Portal", prompt:"A pink portal swirls...", numans:0},
  {cellid:[9,19,29,39,49,58,69,79,88,97,106,115,127,136,141], category:"TreasureChest", imagebig:"chestbig.png", image:"chest.png", title:"Mysterious Chest", prompt:"A treasure chest appears...", numans:0},
  {cellid:[5,12,21,27,37,43,51,61,70,82,90,102,111,118,126,135,138], category:"WildMagic", imagebig:"chaosbig.jpg", image:"chaos.png", title:"Wild Magic Surge", prompt:"Magical energies twist and surge...", numans:0},
  {cellid:[17,33,54,73,93,109,129], category:"RestStop", imagebig:"glyph1.jpg", image:"glyph1.jpg", title:"Rest Stop", prompt:"A peaceful clearing... You feel rested.", numans:0},
  {cellid:[24,42,63,81,103,117,133], category:"Challenge", imagebig:"chestbig.png", image:"chest.png", title:"Challenge Square", prompt:"Prove your worth! Your attributes will be tested!", numans:0}
];

var itemshopdata = {cellid:[23,45,76,105,123], category:"ItemShop", imagebig:"shop1big.jpg", image:"shop1.png", title:"Item Shop", prompt:"A strange wizard appears...", numans:3};

//============================================================
// ATTRIBUTE DESCRIPTIONS (abbreviated for size)
//============================================================

var configAttribDescs = [
  {attribname:"gender", descs:["M","F"]},
  {attribname:"strength", descs:["Weak and slender.","","Fit and well-toned.","Incredibly strong, muscular."]},
  {attribname:"stamina", descs:["Easily tired.","","Above average stamina.","Inexhaustible endurance."]},
  {attribname:"dexterity", descs:["Clumsy but adorable.","","Nimble and graceful.","Extremely dexterous, lightning reflexes."]},
  {attribname:"eyesight", descs:["Short sighted, needs glasses.","","Perfect vision."]},
  {attribname:"constitution", descs:["","Hardy, rarely ill.","Perfect health, immune to disease."]},
  {attribname:"intelligence", descs:["","Quick-witted, good memory.","Genius level, eidetic memory."]},
  {attribname:"charisma", descs:["Shy and socially awkward.","","Generally likable.","Everyone adores you."]},
  {attribname:"talent", descs:["","Naturally talented.","Astoundingly gifted at everything."]},
  {attribname:"luck", descs:["Terrible luck.","","Things generally go well.","Favored by the universe."]},
  {attribname:"hair length", descs:["Short","Neck length","Shoulder length","Long","Really long"]},
  {attribname:"breast size", descs:["","A-Cup","B-Cup","C-Cup","D-Cup","E-Cup","F-Cup","G-Cup","Gigantic"]},
  {attribname:"ass size", descs:["","Cute petite","Toned round","Curvy bubbly","Thicc juicy","Extra thicc"]},
  {attribname:"physique", descs:["","Cute feminine form.","Sensual curvy woman."]},
  {attribname:"orientation", descs:["Attracted to Women","Attracted to Men","Bisexual"]},
  {attribname:"increased libido", descs:["","Higher than normal.","Significantly higher.","Completely out of control."]},
  {attribname:"increased sensitivity", descs:["","Especially sensitive.","Extremely sensitive."]},
  {attribname:"increased fluids", descsM:["","Produce huge loads."], descsF:["","Get wet easily."]},
  {attribname:"always ready", descsM:["","Perpetually hard."], descsF:["","Always dripping wet."]},
  {attribname:"enhanced orgasms", descs:["","Longer, more powerful.","Mind-blowingly intense."]},
  {attribname:"submissiveness", descs:["","Naturally submissive.","Very submissive."]},
  {attribname:"hypnotic susceptibility", descs:["","Vulnerable to hypnosis."]},
  {attribname:"multiple orgasms", descs:["","No refractory period."]},
  {attribname:"random orgasms", descs:["","Occasional random orgasms."]},
  {attribname:"triggered orgasms", descs:["","Trigger word: Pineapple."]},
  {attribname:"triggered arousal", descs:["","Trigger word: Nutmeg."]},
  {attribname:"easily aroused", descs:["","Easily hot and bothered."]},
  {attribname:"hair trigger", descs:["","Easy to orgasm."]},
  {attribname:"flexible", descs:["","Very flexible."]},
  {attribname:"cheerful", descs:["","Naturally upbeat."]},
  {attribname:"tasty fluids", descs:["","Super delicious."]},
  {attribname:"pheromones", descs:["","Emit arousing pheromones."]},
  {attribname:"no gag reflex", descs:["","No gag reflex."]},
  {attribname:"oral lover", descs:["","Love oral sex."]},
  {attribname:"anal lover", descs:["","Love anal sex."]},
  {attribname:"infertile", descsM:["","Shooting blanks."], descsF:["","Completely barren."]},
  {attribname:"very fertile", descsM:["","Extremely potent."], descsF:["","Exceptionally fertile."]},
  {attribname:"pent up", descs:["","Cannot cool down without orgasm."]},
  {attribname:"masochistic", descs:["","Pain triggers pleasure."]},
  {attribname:"exhibitionist", descs:["","Crave public exposure."]},
  {attribname:"lewd dreams", descs:["","Frequent erotic dreams."]},
  {attribname:"heat", descs:["","Monthly animalistic heat."]},
  {attribname:"dependent", descs:["","Need help to get off."]},
  {attribname:"fluid addiction", descs:["","Addicted to cum."]},
  {attribname:"lactation", descs:["","Constantly producing milk."]},
  {attribname:"incontinence", descs:["","Weak bladder.","Lost bladder control."]},
  {attribname:"hair removal", descs:["","Permanently hairless body."]},
  {attribname:"sleepy", descs:["","Need more sleep."]},
  {attribname:"ditzy", descs:["","Scatterbrained."]},
  {attribname:"noisy", descs:["","Cannot stay quiet."]},
  {attribname:"denial", descs:["","10% chance denied.","30% chance denied for 2h."]},
  {attribname:"palette swap", descs:["",""]},
  {attribname:"name change", descs:["",""]},
];

//============================================================
// CHANGE DESCRIPTIONS & IMAGES
//============================================================

var configChangeDescs = [
  {attribname:"strength", descs:["","A little stronger.","A little stronger.","Power flowing through your limbs."]},
  {attribname:"hair length", descs:["","Hair lengthens to neck.","Hair to shoulders.","Hair flowing down your back.","Hair to your waist."]},
  {attribname:"breast size", descs:["","Small mounds form.","Expanding...","Expanding...","Getting heavier.","Getting heavier.","Voluptuous!","Massive!","Gigantic!"]},
  {attribname:"ass size", descs:["","Rounding out.","Bubble butt!","Curvier!","Gigantic!"]},
  {attribname:"increased libido", descs:["","Warm hunger.","Urgent desire.","Burning passion!"]},
  {attribname:"increased sensitivity", descs:["","Surprisingly good.","Overwhelming!"]},
  {attribname:"easily aroused", descsM:["","Cock stirring."],descsF:["","Nipples hard, pussy wet."]}
];

var configChangeImgs = [
  {attribname:"strength", imgsM:["enfeebledM.jpg","strengthM.jpg"], imgsF:["enfeebledF.jpg","strengthF.jpg"]},
  {attribname:"stamina", imgsM:["enervatedM.jpg","staminaM.jpg"], imgsF:["enervatedF.jpg","staminaF.jpg"]},
  {attribname:"dexterity", imgsM:["clumsyM.jpg","dexterityM.jpg"], imgsF:["clumsyF.jpg","dexterityF.jpg"]},
  {attribname:"eyesight", imgsM:["eyesightM.jpg","eyesight.jpg"], imgsF:["eyesightF.jpg","eyesight.jpg"]},
  {attribname:"constitution", imgs:["constitution.jpg"]},
  {attribname:"intelligence", imgs:["intelligence.jpg"]},
  {attribname:"charisma", imgsM:["wallflowerM.jpg","charisma.jpg"], imgsF:["wallflowerF.jpg","charisma.jpg"]},
  {attribname:"talent", imgsM:["talentM.jpg"], imgsF:["talentF.jpg"]},
  {attribname:"luck", imgs:["unlucky.jpg","luck.jpg"]},
  {attribname:"breast size", imgs:["","chest1.jpg","chest2.jpg","chest3.jpg","chest4.jpg","chest5.jpg","chest6.jpg","chest7.jpg","chest8.jpg"]},
  {attribname:"hair length", imgs:["","hair1.jpg","hair2.jpg","hair3.jpg","hair4.jpg"]},
  {attribname:"ass size", imgs:["","ass1.jpg","ass2.jpg","ass3.jpg","ass4.jpg","ass5.jpg"]},
  {attribname:"physique", imgs:["","physique1.jpg","physique2.jpg"]},
  {attribname:"height", imgsM:["shrinkM.jpg"], imgsF:["shrinkF.jpg"]},
  {attribname:"age", imgsM:["regressM.jpg"], imgsF:["regressF.jpg"]},
  {attribname:"orientation", imgs:[]},
  {attribname:"increased libido", imgsF:["","libidoF1.jpg","libidoF2.jpg","libidoF3.jpg"],imgsM:["","libidoM1.jpg","libidoM2.jpg","libidoM3.jpg"]},
  {attribname:"increased sensitivity", imgs:["sensitive.jpg"]},
  {attribname:"increased fluids", imgsM:["increasedfluidsM.jpg"], imgsF:["increasedfluidsF.jpg"]},
  {attribname:"always ready", imgsM:["alwaysreadyM.jpg"], imgsF:["alwaysreadyF.jpg"]},
  {attribname:"enhanced orgasms", imgsM:["enhancedM1.jpg","enhancedM1.jpg","enhancedM2.jpg"], imgsF:["enhancedF1.jpg","enhancedF1.jpg","enhancedF2.jpg"]},
  {attribname:"submissiveness", imgs:["submissive.jpg"]},
  {attribname:"multiple orgasms", imgs:["multipleorgasms.jpg"]},
  {attribname:"random orgasms", imgs:["randomorgasms.jpg"]},
  {attribname:"triggered orgasms", imgs:["triggeredorgasms.jpg"]},
  {attribname:"triggered arousal", imgs:["triggeredarousal.jpg"]},
  {attribname:"easily aroused", imgsM:["easilyarousedM.jpg"], imgsF:["easilyarousedF.jpg"]},
  {attribname:"hair trigger", imgsM:["hairtriggerM.jpg"], imgsF:["hairtriggerF.jpg"]},
  {attribname:"flexible", imgsM:["flexibleM.jpg"], imgsF:["flexibleF.jpg"]},
  {attribname:"cheerful", imgsM:["cheerfulM.jpg"], imgsF:["cheerfulF.jpg"]},
  {attribname:"tasty fluids", imgs:["tastyfluids.jpg"]},
  {attribname:"pheromones", imgs:["pheromones.jpg"]},
  {attribname:"no gag reflex", imgs:["nogag.jpg"]},
  {attribname:"oral lover", imgsM:["oralloverM.jpg"], imgsF:["oralloverF.jpg"]},
  {attribname:"anal lover", imgs:["anallover.jpg"]},
  {attribname:"infertile", imgs:["infertile.jpg"]},
  {attribname:"pent up", imgs:["pentup.jpg"]},
  {attribname:"masochistic", imgsM:["masochistM.jpg"], imgsF:["masochistF.jpg"]},
  {attribname:"exhibitionist", imgs:["exhibitionist.jpg"]},
  {attribname:"lewd dreams", imgs:["lewddreams.jpg"]},
  {attribname:"heat", imgs:["heat.jpg"]},
  {attribname:"dependent", imgs:["dependent.jpg"]},
  {attribname:"fluid addiction", imgs:["fluidaddiction.jpg"]},
  {attribname:"lactation", imgs:["lactation.jpg"]},
  {attribname:"incontinence", imgs:["incontinence.jpg"]},
  {attribname:"hair removal", imgs:["hairremoval.jpg"]},
  {attribname:"sleepy", imgsM:["sleepyM.jpg"], imgsF:["sleepyF.jpg"]},
  {attribname:"ditzy", imgsM:["ditzyM.jpg"], imgsF:["ditzyF.jpg"]},
  {attribname:"noisy", imgs:["noisy.jpg"]},
  {attribname:"denial", imgs:["denial.jpg"]},
  {attribname:"cash", imgs:["cash.jpg"]}
];

//============================================================
// EFFECTS
//============================================================

var configEffects = [
  // Positive
  {category:"Transformation", effectname:"Strength Enhancement", img:"none", desc:"Strength Improved!", requiresattribnotmax:"strength"},
  {category:"Transformation", effectname:"Stamina Enhancement", img:"none", desc:"Stamina Improved!", requiresattribnotmax:"stamina"},
  {category:"Transformation", effectname:"Dexterity Enhancement", img:"none", desc:"Dexterity Improved!", requiresattribnotmax:"dexterity"},
  {category:"Transformation", effectname:"Eyesight Enhancement", img:"none", desc:"Eyesight Improved!", requiresattribnotmax:"eyesight"},
  {category:"Transformation", effectname:"Constitution Enhancement", img:"none", desc:"Constitution Improved!", requiresattribnotmax:"constitution"},
  {category:"Transformation", effectname:"Intelligence Enhancement", img:"none", desc:"Intelligence Improved!", requiresattribnotmax:"intelligence"},
  {category:"Transformation", effectname:"Charisma Enhancement", img:"none", desc:"Charisma Improved!", requiresattribnotmax:"charisma"},
  {category:"Transformation", effectname:"Talent Enhancement", img:"none", desc:"Talent Improved!", requiresattribnotmax:"talent"},
  {category:"Transformation", effectname:"Luck Enhancement", img:"none", desc:"Luck Improved!", requiresattribnotmax:"luck"},
  // Cursed
  {category:"CursedTransformation", effectname:"Hair Growth", img:"none", desc:"Hair growth!", requiresattribnotmax:"hair length",randwt:1},
  {category:"CursedTransformation", effectname:"Enfeeblement", img:"none", desc:"Enfeebled!", requiresattribnotmin:"strength"},
  {category:"CursedTransformation", effectname:"Breast Growth", img:"none", desc:"Breast growth!", requiresattribnotmax:"breast size",randwt:4},
  {category:"CursedTransformation", effectname:"Gender Change", img:"tg.jpg", desc:"Gender changed!", requiresattribnotmax:"gender",randwt:9},
  {category:"CursedTransformation", effectname:"Extra Feminization", img:"physique2.jpg", desc:"Extra feminization!", requiresattribnotmin:"gender",requiresattribnotmax:"physique",randwt:4},
  {category:"CursedTransformation", effectname:"Shrinking", img:"none", desc:"Height decreased!", requiresattribcustom:"height"},
  {category:"CursedTransformation", effectname:"Ass Expansion", img:"none", desc:"Ass expansion!", requiresattribnotmax:"ass size",randwt:2},
  {category:"CursedTransformation", effectname:"Orientation Change", img:"orientation.jpg", desc:"Orientation changed!", requiresattribcustom:"orientation",randwt:3},
  {category:"CursedTransformation", effectname:"Increased Libido", img:"none", desc:"Libido increased!", requiresattribnotmax:"increased libido",randwt:3},
  {category:"CursedTransformation", effectname:"Increased Sensitivity", img:"none", desc:"Sensitivity increased!", requiresattribnotmin:"gender",requiresattribnotmax:"increased sensitivity",randwt:1},
  {category:"CursedTransformation", effectname:"Increased Fluids", img:"none", desc:"Fluids increased!", requiresattribnotmax:"increased fluids"},
  {category:"CursedTransformation", effectname:"Always Ready", img:"none", desc:"Always ready!", requiresattribnotmax:"always ready"},
  {category:"CursedTransformation", effectname:"Enhanced Orgasms", img:"none", desc:"Orgasms enhanced!", requiresattribnotmax:"enhanced orgasms"},
  {category:"CursedTransformation", effectname:"Submissiveness", img:"none", desc:"Submissiveness increased!", requiresattribnotmin:"gender",requiresattribnotmax:"submissiveness"},
  {category:"CursedTransformation", effectname:"Hypnotic Susceptibility", img:"none", desc:"Hypnotic susceptibility!", requiresattribnotmax:"hypnotic susceptibility"},
  {category:"CursedTransformation", effectname:"Multiple Orgasms", img:"none", desc:"Multiple orgasms!", requiresattribnotmin:"gender",requiresattribnotmax:"multiple orgasms"},
  {category:"CursedTransformation", effectname:"Random Orgasms", img:"none", desc:"Random orgasms!", requiresattribnotmin:"gender",requiresattribnotmax:"random orgasms"},
  {category:"CursedTransformation", effectname:"Triggered Orgasms", img:"none", desc:"Triggered orgasms!", requiresattribnotmin:"gender",requiresattribnotmax:"triggered orgasms"},
  {category:"CursedTransformation", effectname:"Triggered Arousal", img:"none", desc:"Triggered arousal!", requiresattribnotmin:"gender",requiresattribnotmax:"triggered arousal"},
  {category:"CursedTransformation", effectname:"Easily Aroused", img:"none", desc:"Easily aroused!", requiresattribnotmax:"easily aroused"},
  {category:"CursedTransformation", effectname:"Hair Trigger", img:"none", desc:"Hair trigger!", requiresattribnotmax:"hair trigger"},
  {category:"CursedTransformation", effectname:"Flexible", img:"none", desc:"Flexible!", requiresattribnotmax:"flexible"},
  {category:"CursedTransformation", effectname:"Cheerful", img:"none", desc:"Cheerful!", requiresattribnotmax:"cheerful"},
  {category:"CursedTransformation", effectname:"Tasty Fluids", img:"none", desc:"Tasty fluids!", requiresattribnotmax:"tasty fluids"},
  {category:"CursedTransformation", effectname:"Pheromones", img:"none", desc:"Pheromones!", requiresattribnotmax:"pheromones"},
  {category:"CursedTransformation", effectname:"No Gag Reflex", img:"none", desc:"No gag reflex!", requiresattribnotmin:"gender",requiresattribnotmax:"no gag reflex"},
  {category:"CursedTransformation", effectname:"Oral Lover", img:"none", desc:"Oral lover!", requiresattribnotmax:"oral lover"},
  {category:"CursedTransformation", effectname:"Anal Lover", img:"none", desc:"Anal lover!", requiresattribnotmax:"anal lover"},
  {category:"CursedTransformation", effectname:"Infertile", img:"none", desc:"Infertile!", requiresattribcustom:"infertile"},
  {category:"CursedTransformation", effectname:"Very Fertile", img:"none", desc:"Very fertile!", requiresattribcustom:"very fertile"},
  {category:"CursedTransformation", effectname:"Pent Up", img:"none", desc:"Pent up!", requiresattribnotmin:"gender",requiresattribnotmax:"pent up"},
  {category:"CursedTransformation", effectname:"Masochistic", img:"none", desc:"Masochistic!", requiresattribnotmax:"masochistic"},
  {category:"CursedTransformation", effectname:"Exhibitionist", img:"none", desc:"Exhibitionist!", requiresattribnotmin:"gender",requiresattribnotmax:"exhibitionist"},
  {category:"CursedTransformation", effectname:"Lewd Dreams", img:"none", desc:"Lewd dreams!", requiresattribnotmin:"gender",requiresattribnotmax:"lewd dreams"},
  {category:"CursedTransformation", effectname:"Age Regression", img:"none", desc:"Age regression!", requiresattribcustom:"age",randwt:1},
  {category:"CursedTransformation", effectname:"Heat", img:"none", desc:"Heat!", requiresattribnotmin:"gender",requiresattribnotmax:"heat"},
  {category:"CursedTransformation", effectname:"Dependent", img:"none", desc:"Dependent!", requiresattribnotmin:"gender",requiresattribnotmax:"dependent"},
  {category:"CursedTransformation", effectname:"Fluid Addiction", img:"none", desc:"Fluid addiction!", requiresattribnotmax:"fluid addiction"},
  {category:"CursedTransformation", effectname:"Lactation", img:"none", desc:"Lactation!", requiresattribnotmin:"gender",requiresattribnotmax:"lactation"},
  {category:"CursedTransformation", effectname:"Incontinence", img:"none", desc:"Incontinence!", requiresattribnotmin:"gender",requiresattribnotmax:"incontinence"},
  {category:"CursedTransformation", effectname:"Hair Removal", img:"none", desc:"Hair removal!", requiresattribnotmin:"gender",requiresattribnotmax:"hair removal"},
  {category:"CursedTransformation", effectname:"Sleepy", img:"none", desc:"Sleepy!", requiresattribnotmax:"sleepy"},
  {category:"CursedTransformation", effectname:"Ditzy", img:"none", desc:"Ditzy!", requiresattribnotmax:"ditzy"},
  {category:"CursedTransformation", effectname:"Noisy", img:"none", desc:"Noisy!", requiresattribnotmin:"gender",requiresattribnotmax:"noisy"},
  {category:"CursedTransformation", effectname:"Orgasm Denial", img:"none", desc:"Orgasm denial!", requiresattribnotmax:"denial"},
  {category:"CursedTransformation", effectname:"Clumsy", img:"none", desc:"Clumsy!", requiresattribnotmin:"dexterity"},
  {category:"CursedTransformation", effectname:"Enervation", img:"none", desc:"Enervation!", requiresattribnotmin:"stamina"},
  {category:"CursedTransformation", effectname:"Glasses", img:"none", desc:"Glasses!", requiresattribnotmin:"eyesight"},
  {category:"CursedTransformation", effectname:"Palette Swap", img:"paletteswap.jpg", desc:"Palette swap!", requiresattribnotmax:"palette swap"},
  {category:"CursedTransformation", effectname:"Name Change", img:"namechange.jpg", desc:"Name changed!", requiresattribnotmin:"gender",requiresattribnotmax:"name change",randwt:4},
  {category:"CursedTransformation", effectname:"Bad Luck", img:"none", desc:"Bad luck!", requiresattribnotmin:"luck"},
  {category:"CursedTransformation", effectname:"Wallflower", img:"none", desc:"Shy!", requiresattribnotmin:"charisma"},
];

//============================================================
// CHARACTER TEMPLATES
//============================================================

var playerTemplates = [
  {"name":"James","last name":"Carter","age":33,"height":183,"gender":0,"hair color":"Blonde","eye color":"Blue","desc":"An explorer at heart.<br/><span style='color:yellow'>(Easy)</span>", "gear":[{name:"Glyph of Protection", qty:3},{name:"Glyph of Unlocking", qty:2},{name:"Glyph of Jaunting", qty:2},{name:"Silver Coin", qty:5}],"strength":2,"stamina":2,"dexterity":1,"eyesight":1,"constitution":0,"intelligence":0,"charisma":1,"talent":0,"luck":1,"breast size":0,"hair length":0,"physique":0,"ass size":0},
  {"name":"Colin","last name":"Winters","age":30,"height":174,"gender":0,"hair color":"Brown","eye color":"Hazel","desc":"Dedicated accountant.<br/><span style='color:yellow'>(Normal)</span>", "gear":[{name:"Glyph of Protection", qty:2},{name:"Glyph of Unlocking", qty:1},{name:"Silver Coin", qty:3}],"strength":1,"stamina":1,"dexterity":1,"eyesight":0,"constitution":0,"intelligence":1,"charisma":1,"talent":0,"luck":1,"breast size":0,"hair length":0,"physique":0,"ass size":0},
  {"name":"Jeremy","last name":"Davis","age":27,"height":177,"gender":0,"hair color":"Blonde","eye color":"Blue","desc":"Free-spirited artist.<br/><span style='color:yellow'>(Normal)</span>", "gear":[{name:"Glyph of Protection", qty:2},{name:"Glyph of Jaunting", qty:1},{name:"Silver Coin", qty:3}],"strength":1,"stamina":1,"dexterity":1,"eyesight":1,"constitution":0,"intelligence":0,"charisma":2,"talent":0,"luck":1,"breast size":0,"hair length":0,"physique":0,"ass size":0},
  {"name":"Trevon","last name":"Smith","age":25,"height":180,"gender":0,"hair color":"Black","eye color":"Brown","desc":"Sports enthusiast.<br/><span style='color:yellow'>(Hard)</span>", "gear":[{name:"Glyph of Protection", qty:1}],"strength":1,"stamina":2,"dexterity":2,"eyesight":1,"constitution":0,"intelligence":0,"charisma":1,"talent":0,"luck":1,"breast size":0,"hair length":0,"physique":0,"ass size":0},
  {"name":"Justin","last name":"Andrews","age":22,"height":171,"gender":0,"hair color":"Brunette","eye color":"Dark brown","desc":"Recent college grad.<br/><span style='color:yellow'>(Very Hard)</span>","gear":[],"strength":1,"stamina":1,"dexterity":1,"eyesight":0,"constitution":0,"intelligence":0,"charisma":0,"talent":0,"luck":1,"breast size":0,"hair length":0,"physique":0,"ass size":0},
  {"name":"John","last name":"Smith","age":24,"height":180,"gender":0,"hair color":"Brown","eye color":"Hazel","desc":"","gear":[],"strength":1,"stamina":1,"dexterity":1,"eyesight":1,"constitution":0,"intelligence":0,"charisma":1,"talent":0,"luck":1,"breast size":0,"hair length":0,"physique":0,"ass size":0}
];

//============================================================
// ITEMS
//============================================================

var items = [
  {name:"Silver Coin", desc:"A valuable old coin.", effect:"May be used to purchase glyphs.", img:"silvercoin.png", usable:false, stacks:true, randwt:3, gameitm:1},
  {name:"Cash", desc:"Various dollar bills.", effect:"Genuine currency.", img:"cash.jpg", usable:false, stacks:true, randwt:7},
  {name:"Glyph of Jaunting", desc:"Teleportation glyph.", effect:"Teleports you 6 steps forward.", img:"glyph2.jpg", usable:true, stacks:true, gameitm:1},
  {name:"Glyph of Protection", desc:"Shield glyph.", effect:"Negates magical effects.", img:"glyph1.jpg", usable:false, stacks:true, gameitm:1},
  {name:"Glyph of Unlocking", desc:"Disarming glyph.", effect:"Disarms chest traps.", img:"glyph3.jpg", usable:false, stacks:true, gameitm:1}
];
