/*
  Cursed Boardgame Interactive NSFWCYOA - UPGRADED EDITION
  Created by /u/chinesesilklanterns
  Originally May 2020 - Expanded & Enhanced 2026
  
  License: Same as original - Free non-commercial use with attribution.
*/

//============================================================
// CORE GAME STATE
//============================================================

var playertoken = new Object();

// Convert TAFFY-style data to plain arrays (no jQuery/TAFFY dependency)
var cellsdata = configCells; // array of cell configs
var fxdata = configEffects;
var itemsdata = items;
var fxdesc = configAttribDescs;

var currentOptions = []; // track options shown to player
var BOARD_SIZE = 12; // 12x12 grid = 144 cells
var CELL_SIZE = 42; // px per cell icon
var MIN_HEIGHT = 148;
var MIN_AGE = 16;
var MAX_AGE = 99;

// Constants for the board layout
var BOARD_OFFSET_X = 24;
var BOARD_OFFSET_Y = 24;
var BOARD_CELL_W = 42;
var BOARD_CELL_H = 42;

// Game state
var showtfeffect = false;
var tfcounter = 0;
var money = 0;
var issandbox = false;
var loadeddice = false;
var gameLog = [];
var diceMode = 0; // 0=1d6, 1=2d3, 2=1d8, 3=1d4
var gameSaved = false;

// Player stats initialization
playertoken.inv = [];
playertoken.stats = {
  "name":"","last name":"","age":18,"height":170,"gender":0,
  "strength":0,"stamina":0,"dexterity":0,"eyesight":0,
  "constitution":0,"intelligence":0,"charisma":0,"talent":0,"luck":0,
  "breast size":0,"hair length":0,"hair color":"Black","eye color":"Brown",
  "ass size":0,"physique":0,"orientation":0,
  "increased libido":0,"increased sensitivity":0,"increased fluids":0,
  "always ready":0,"enhanced orgasms":0,"submissiveness":0,
  "hypnotic susceptibility":0,"multiple orgasms":0,"random orgasms":0,
  "triggered orgasms":0,"triggered arousal":0,"easily aroused":0,
  "hair trigger":0,"flexible":0,"cheerful":0,"tasty fluids":0,
  "pheromones":0,"no gag reflex":0,"oral lover":0,"anal lover":0,
  "infertile":0,"very fertile":0,"pent up":0,"masochistic":0,
  "exhibitionist":0,"lewd dreams":0,"heat":0,"dependent":0,
  "fluid addiction":0,"lactation":0,"incontinence":0,"hair removal":0,
  "sleepy":0,"ditzy":0,"noisy":0,"denial":0,
  "palette swap":0,"name change":0,"vitality":1
};

playertoken.currentpos = 0;
playertoken.lastrolled = 0;
playertoken.lastselecteditem = 0;

//============================================================
// SAVE/LOAD SYSTEM (localStorage)
//============================================================

function saveGame() {
  try {
    var saveData = {
      stats: playertoken.stats,
      inv: playertoken.inv,
      currentpos: playertoken.currentpos,
      lastrolled: playertoken.lastrolled,
      tfcounter: tfcounter,
      money: money,
      diceMode: diceMode,
      gameLog: gameLog.slice(-20)
    };
    localStorage.setItem('cursedBoardgameSave', JSON.stringify(saveData));
    showPopup("<u>Game Saved</u><br/><br/>Your progress has been saved. You can continue where you left off next time!");
    return true;
  } catch(e) {
    return false;
  }
}

function loadGame() {
  try {
    var raw = localStorage.getItem('cursedBoardgameSave');
    if (!raw) return false;
    var saveData = JSON.parse(raw);
    
    // Restore all saveable state
    Object.assign(playertoken.stats, saveData.stats);
    playertoken.inv = saveData.inv || [];
    playertoken.currentpos = saveData.currentpos || 0;
    playertoken.lastrolled = saveData.lastrolled || 0;
    tfcounter = saveData.tfcounter || 0;
    money = saveData.money || 0;
    diceMode = saveData.diceMode || 0;
    gameLog = saveData.gameLog || [];
    
    return true;
  } catch(e) {
    return false;
  }
}

function hasSaveData() {
  return localStorage.getItem('cursedBoardgameSave') !== null;
}

function deleteSave() {
  localStorage.removeItem('cursedBoardgameSave');
}

//============================================================
// BOARD/POSITIONING - 12x12 Dynamic Grid
//============================================================

function getCellDisplayName(pos) {
  if (pos <= 1) return "Start";
  if (pos >= TOTAL_CELLS) return "End";
  return String(pos);
}

// Convert cell number to grid position on a snake-style 12x12 board
function cellToGrid(cellNum) {
  if (cellNum <= 1) return { row: 11, col: 0 }; // Start
  if (cellNum >= TOTAL_CELLS) return { row: 0, col: 11 }; // End
  
  var actualNum = cellNum - 1; // 0-indexed
  var rowFromBottom = Math.floor(actualNum / BOARD_SIZE);
  var row = (BOARD_SIZE - 1) - rowFromBottom;
  var col = actualNum % BOARD_SIZE;
  
  // Reverse direction on even rows (from bottom)
  if (rowFromBottom % 2 === 0) {
    // left to right
  } else {
    // right to left
    col = (BOARD_SIZE - 1) - col;
  }
  
  return { row: row, col: col };
}

function getCellPixelPosition(cellNum) {
  var g = cellToGrid(cellNum);
  var px = BOARD_OFFSET_X + BOARD_CELL_W * g.col;
  var py = BOARD_OFFSET_Y + BOARD_CELL_H * g.row;
  return { x: px, y: py };
}

//============================================================
// BOARD GENERATION
//============================================================

function generateBoard() {
  var table = document.querySelector('.game-table');
  if (!table) return;
  
  var html = '';
  for (var row = 0; row < BOARD_SIZE; row++) {
    html += '<tr>';
    for (var col = 0; col < BOARD_SIZE; col++) {
      var cellNum = gridToCellNumber(row, col);
      var label = getCellDisplayName(cellNum);
      html += '<td data-cell="' + cellNum + '">' + label + '</td>';
    }
    html += '</tr>';
  }
  table.innerHTML = html;
}

function gridToCellNumber(row, col) {
  var rowFromBottom = (BOARD_SIZE - 1) - row;
  
  if (rowFromBottom === 0) {
    // First row (bottom): Start at col 0, then numbers increase left to right
    if (col === 0) return 1;
    return col + 1;
  }
  
  if (rowFromBottom === BOARD_SIZE - 1) {
    // Last row (top): End at last column
    if (col === BOARD_SIZE - 1) return TOTAL_CELLS;
  }
  
  if (rowFromBottom % 2 === 1) {
    // Odd rows from bottom: right to left
    var base = rowFromBottom * BOARD_SIZE + 1;
    return base + (BOARD_SIZE - 1 - col);
  } else {
    // Even rows from bottom (except row 0): left to right
    var base = rowFromBottom * BOARD_SIZE + 1;
    return base + col;
  }
}

function getCellDataForPosition(pos) {
  for (var i = 0; i < cellsdata.length; i++) {
    if (cellsdata[i].cellid.indexOf(pos) !== -1) {
      return cellsdata[i];
    }
  }
  return null;
}

//============================================================
// ICON PLACEMENT ON BOARD
//============================================================

function placeIconsOnBoard() {
  var snakesDiv = document.getElementById('snakesDiv');
  if (!snakesDiv) return;
  
  var datstr = '';
  for (var i = 0; i < cellsdata.length; i++) {
    var cs = cellsdata[i];
    if (!cs.image) continue;
    for (var j = 0; j < cs.cellid.length; j++) {
      var pos = cs.cellid[j];
      var px = getCellPixelPosition(pos);
      datstr += "<div style='width:" + CELL_SIZE + "px; height:" + CELL_SIZE + "px; top: " + px.y + "px; left: " + px.x + "px;'><img src='img/icons/" + cs.image + "' width=" + CELL_SIZE + " height=" + CELL_SIZE + " /></div>";
    }
  }
  snakesDiv.innerHTML = datstr;
}

//============================================================
// PLAYER TOKEN POSITIONING
//============================================================

playertoken.setpos = function(curpos) {
  playertoken.currentpos = curpos;
  
  var px = getCellPixelPosition(curpos);
  
  var playerEl = document.getElementById('player');
  if (playerEl) {
    playerEl.style.transition = 'top 0.4s ease, left 0.4s ease';
    playerEl.style.top = px.y + 'px';
    playerEl.style.left = px.x + 'px';
  }
  
  if (curpos === "End" || curpos >= TOTAL_CELLS) {
    playertoken.gameover();
  } else if (curpos > 1 && curpos < TOTAL_CELLS) {
    setTimeout(function() { setQuestion(); }, 600);
  } else {
    setTimeout(function() { enableUI(); }, 400);
  }
};

playertoken.gameover = function() {
  setTimeout(function() {
    document.getElementById('finalinspect').style.display = '';
    document.getElementById('finalinspect').style.opacity = '0';
    setTimeout(function() {
      document.getElementById('finalinspect').style.transition = 'opacity 1s';
      document.getElementById('finalinspect').style.opacity = '1';
    }, 100);
    document.getElementById('msgComplete').style.display = 'block';
  }, 1000);
  
  var prog = "";
  if (tfcounter === 0) {
    prog = "You somehow made it through entirely unscathed. Perhaps fate has other plans...";
  } else if (tfcounter <= 3) {
    prog = "You made it through nearly unchanged. Well, except for one or two things...";
  } else if (tfcounter <= 9) {
    prog = "Hmm. Guess you're gonna have a couple of changes to get used to...";
  } else if (tfcounter <= 18) {
    prog = "You've gone through quite a lot of changes. Time to rediscover yourself...";
  } else {
    prog = "You've been through so many changes it's hard to keep count. A brand new you!";
  }
  
  document.getElementById('prognosis').innerHTML = prog;
  document.getElementById('tfcount').innerHTML = "Total Curses Received: " + tfcounter + " | Cash Earned: $" + money;
  addLog("Game completed! Total curses: " + tfcounter + ", Cash: $" + money);
  
  // Auto-save completion
  saveGame();
};

//============================================================
// SCREEN NAVIGATION
//============================================================

var nextscreen = function(oldscreen, newscreen) {
  document.getElementById(oldscreen).style.display = 'none';
  document.getElementById(newscreen).style.display = 'block';
  if (newscreen === 'screen4') {
    generateBoard();
    placeIconsOnBoard();
    setTimeout(function() {
      showPopup("<img src='img/welcome.jpg' width=200 height=125 style=\"border:2px solid #000000; float:middle;\" /><br/>Welcome to <span style='color:lime'><s>Jumanji</s> Cursed Boardgame</span>, the greatest (and totally original) boardgame of all time! <br/><br/>Go ahead, <span style='color:pink'>roll the dice</span>, your game token will begin moving! Reach the end and win the game to escape - you'll get to keep whatever you win!<br/><br/>Oh, what fun we're going to have!<br/><br/><span style='color:yellow'><em>\"We all make choices, but in the end, our choices make us.\"</em></span>");
    }, 300);
  }
};

//============================================================
// CHARACTER SELECTION
//============================================================

var selectedchar = function() {
  nextscreen('screen2', 'screen3');
  loadeddice = false;
  
  if (issandbox) {
    playertoken.stats["name"] = document.getElementById('ifname') ? document.getElementById('ifname').value : 'John';
    playertoken.stats["last name"] = document.getElementById('ilname') ? document.getElementById('ilname').value : 'Smith';
    playertoken.stats["age"] = document.getElementById('iage') ? parseInt(document.getElementById('iage').value) : 24;
    playertoken.stats["height"] = document.getElementById('iheight') ? parseInt(document.getElementById('iheight').value) : 180;
    playertoken.stats["hair color"] = document.getElementById('ihairc') ? document.getElementById('ihairc').value : 'Brown';
    playertoken.stats["eye color"] = document.getElementById('ieyec') ? document.getElementById('ieyec').value : 'Hazel';
    if (document.getElementById('iori')) playertoken.stats["orientation"] = parseInt(document.getElementById('iori').value);
    
    if (document.getElementById('igender')) {
      var igd = parseInt(document.getElementById('igender').value);
      playertoken.stats["gender"] = igd;
      if (igd !== 0) {
        if (playertoken.stats["breast size"] < 1) playertoken.stats["breast size"] = 1;
        if (playertoken.stats["hair length"] < 1) playertoken.stats["hair length"] = 1;
        if (playertoken.stats["ass size"] < 1) playertoken.stats["ass size"] = 1;
      }
    }
    
    if (document.getElementById("iinfsilver") && document.getElementById("iinfsilver").checked) {
      playertoken.inv = [{name:"Silver Coin", qty:999}];
    }
    if (document.getElementById("iloaddice") && document.getElementById("iloaddice").checked) {
      loadeddice = true;
    }
  }
  
  var active = document.querySelector('.active');
  if (active) active.className = '';
};

function playcurseanim() {
  setTimeout(function() {
    var charicon = document.getElementById('charicon');
    var innerself = document.getElementById('innerself');
    if (charicon) {
      charicon.style.animation = "curseanim 3s";
    }
    if (innerself) {
      innerself.style.animation = "curseanim2 4s";
    }
    setTimeout(function() {
      if (charicon) charicon.style.animation = "none";
      if (innerself) innerself.style.animation = "none";
    }, 4100);
  }, 100);
}

//============================================================
// DICE SYSTEM
//============================================================

var rolldice = function() {
  disableUI();
  
  var randomNum;
  var diceModeVal = diceMode;
  
  if (loadeddice) {
    randomNum = 1;
  } else {
    switch(diceModeVal) {
      case 0: randomNum = Math.floor(Math.random() * 6) + 1; break;       // 1d6
      case 1: randomNum = Math.floor(Math.random() * 3) + Math.floor(Math.random() * 3) + 2; break; // 2d3 (2-6)
      case 2: randomNum = Math.floor(Math.random() * 8) + 1; break;       // 1d8 (1-8)
      case 3: randomNum = Math.floor(Math.random() * 4) + 1; break;       // 1d4 (1-4)
      default: randomNum = Math.floor(Math.random() * 6) + 1;
    }
  }
  
  addLog("Rolled " + randomNum + " (dice mode: " + getDiceModeLabel() + ")");
  
  // Animate dice
  var diceEl = document.getElementById('reddice');
  if (diceEl) {
    diceEl.className = "dice digit" + Math.min(randomNum, 6);
  }
  
  setTimeout(function() {
    var diceElStatic = document.getElementById('reddice');
    if (diceElStatic) {
      diceElStatic.className += "static";
    }
    playertoken.lastrolled = randomNum;
    MovePlayer(randomNum);
  }, 1000);
};

function getDiceModeLabel() {
  switch(diceMode) {
    case 0: return "1d6";
    case 1: return "2d3";
    case 2: return "1d8";
    case 3: return "1d4";
    default: return "1d6";
  }
}

function cycleDiceMode() {
  diceMode = (diceMode + 1) % 4;
  document.getElementById('diceModeLabel').innerHTML = getDiceModeLabel();
  addLog("Switched to " + getDiceModeLabel());
}

//============================================================
// PLAYER MOVEMENT
//============================================================

function MovePlayer(stepToMove) {
  if (playertoken.currentpos == "Start") playertoken.currentpos = 1;
  if (playertoken.currentpos == "End") playertoken.currentpos = TOTAL_CELLS;
  
  playertoken.currentpos += stepToMove;
  
  // Clamp
  if (playertoken.currentpos < 1) playertoken.currentpos = 1;
  if (playertoken.currentpos > TOTAL_CELLS) playertoken.currentpos = TOTAL_CELLS;
  
  addLog("Moved " + stepToMove + " steps to position " + playertoken.currentpos);
  
  var displayPos;
  if (playertoken.currentpos <= 1) displayPos = "Start";
  else if (playertoken.currentpos >= TOTAL_CELLS) displayPos = "End";
  else displayPos = playertoken.currentpos;
  
  playertoken.setpos(displayPos);
}

//============================================================
// UI CONTROLS
//============================================================

function disableUI() {
  var rollBtn = document.getElementById('rolldicebtn');
  var redDice = document.getElementById('reddice');
  var invIcon = document.getElementById('invicon');
  var charIcon = document.getElementById('charicon');
  var shopIcon = document.getElementById('shopicon');
  
  if (rollBtn) rollBtn.onclick = null;
  if (redDice) redDice.onclick = null;
  if (invIcon) invIcon.onclick = null;
  if (charIcon) charIcon.onclick = null;
  if (shopIcon) shopIcon.onclick = null;
}

function enableUI() {
  document.getElementById('rolldicebtn').onclick = rolldice;
  document.getElementById('reddice').onclick = rolldice;
  document.getElementById('invicon').onclick = showinventory;
  document.getElementById('charicon').onclick = showplayerstatus;
  document.getElementById('shopicon').onclick = showshop;
}

//============================================================
// GAME LOG SYSTEM
//============================================================

function addLog(msg) {
  gameLog.push(msg);
  if (gameLog.length > 50) gameLog.shift();
  
  var logEl = document.getElementById('gameLog');
  if (logEl) {
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = '> ' + msg;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function toggleLog() {
  var logEl = document.getElementById('gameLog');
  if (logEl) {
    logEl.style.display = (logEl.style.display === 'none' || logEl.style.display === '') ? 'block' : 'none';
  }
}

//============================================================
// HELPER FUNCTIONS
//============================================================

function get_attrib_limit(attribname) {
  var entry = null;
  for (var i = 0; i < fxdesc.length; i++) {
    if (fxdesc[i].attribname === attribname) { entry = fxdesc[i]; break; }
  }
  if (!entry) return 0;
  
  if (!entry.descsM || !entry.descsF) {
    return entry.descs.length - 1;
  } else {
    return playertoken.stats["gender"] === 0 ? entry.descsM.length - 1 : entry.descsF.length - 1;
  }
}

function adjust_attrib(attribname, amt) {
  var newval = playertoken.stats[attribname] + amt;
  var limit = get_attrib_limit(attribname);
  newval = newval < 0 ? 0 : newval;
  newval = newval > limit ? limit : newval;
  playertoken.stats[attribname] = newval;
}

function PrepareTF() {
  ++tfcounter;
  showtfeffect = true;
}

function removeDups(arrs) {
  return arrs.filter(function(item, pos) { return arrs.indexOf(item) === pos; });
}

function shuffle(inarr) {
  var extras = [];
  for (var i = 0; i < inarr.length; i++) {
    if (inarr[i].randwt != null) {
      for (var j = 0; j < inarr[i].randwt; j++) {
        extras.push(inarr[i]);
      }
    }
  }
  var o = inarr.concat(extras);
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return removeDups(o);
}

function filterunwanteditems(arr) {
  var newarr = [];
  for (var i = 0; i < arr.length; i++) {
    if (!arr[i].stacks && qtyitem(arr[i].name)) {
      // already have
    } else {
      newarr.push(arr[i]);
    }
  }
  return newarr;
}

function filterunwantedtf(arr) {
  var newarr = [];
  for (var i = 0; i < arr.length; i++) {
    var fx = arr[i];
    if (fx.requiresattribcustom) {
      if (fx.requiresattribcustom === "orientation" && playertoken.stats["orientation"] > 0) { /* skip */ }
      else if (fx.requiresattribcustom === "age" && playertoken.stats["age"] <= MIN_AGE) { /* skip */ }
      else if (fx.requiresattribcustom === "height" && playertoken.stats["height"] <= MIN_HEIGHT) { /* skip */ }
      else if ((fx.requiresattribcustom === "infertile" || fx.requiresattribcustom === "very fertile") && (playertoken.stats["infertile"] > 0 || playertoken.stats["very fertile"] > 0)) { /* skip */ }
      else { newarr.push(fx); }
    } else if (!fx.requiresattribnotmax && !fx.requiresattribnotmin) {
      newarr.push(fx);
    } else {
      if (fx.requiresattribnotmax && !fx.requiresattribnotmin) {
        var limit = get_attrib_limit(fx.requiresattribnotmax);
        if (playertoken.stats[fx.requiresattribnotmax] < limit) newarr.push(fx);
      } else if (fx.requiresattribnotmin && !fx.requiresattribnotmax) {
        if (playertoken.stats[fx.requiresattribnotmin] > 0) newarr.push(fx);
      } else if (fx.requiresattribnotmin && fx.requiresattribnotmax) {
        var limit2 = get_attrib_limit(fx.requiresattribnotmax);
        if (playertoken.stats[fx.requiresattribnotmin] > 0 && playertoken.stats[fx.requiresattribnotmax] < limit2) newarr.push(fx);
      }
    }
  }
  return newarr;
}

function findTfxByCategory(category) {
  var result = [];
  for (var i = 0; i < fxdata.length; i++) {
    if (fxdata[i].category === category) result.push(fxdata[i]);
  }
  return result;
}

//============================================================
// QUESTION/EVENT SYSTEM
//============================================================

var setQuestion = function(fixeddata) {
  var currcelldata = null;
  
  if (fixeddata) {
    currcelldata = fixeddata;
  } else {
    currcelldata = getCellDataForPosition(playertoken.currentpos);
  }

  if (currcelldata) {
    var qt = "";
    if (currcelldata.imagebig) {
      qt += "<img src='img/icons/" + currcelldata.imagebig + "' width=140 height=140 style=\"border:2px solid #000000; margin:6px; float: right;\" />";
    }
    qt += "<u>" + currcelldata.title + "</u><br/>" + currcelldata.prompt;
    
    currentOptions = [];
    
    switch(currcelldata.category) {
      case "Transformation":
        currentOptions = shuffle(filterunwantedtf(findTfxByCategory("Transformation"))).slice(0, currcelldata.numans);
        currentOptions.push({category: "Transformation", effectname: "Choose Nothing", img:"silvercoin.png", desc: "<span style='color:yellow'><em>\"When nothing you see quite fits your plate, sometimes it's better just to wait.\"</em></span><br/><br/>You make a choice... to choose nothing. A single silver coin materializes at your feet.<br/><br/><span style='color:lime'>Silver Coin Obtained!</span>"});
        break;
        
      case "CursedTransformation":
        currentOptions = shuffle(filterunwantedtf(findTfxByCategory("CursedTransformation"))).slice(0, currcelldata.numans);
        if (currentOptions.length === 0) {
          currentOptions.push({category: "CursedTransformation", effectname: "Carry On", img:"nothing.jpg", desc: "<span style='color:yellow'><em>\"...........\"</em></span><br/><br/>You brace yourself... but nothing happens."});
        }
        var qtyglyph = qtyitem("Glyph of Protection");
        if (qtyglyph) {
          currentOptions.push({category: "CursedTransformation", effectname: "Activate Glyph of Protection", subtitle: (qtyglyph + " Remaining"), img:"none", value: 0});
        }
        break;
        
      case "Teleport":
        var steps1 = Math.floor(Math.random() * 3) + 2;
        var steps2 = Math.floor(Math.random() * 4) + 5;
        currentOptions.push({category: "Teleport", effectname: "Stay Put", img:"none", value: 0});
        currentOptions.push({category: "Teleport", effectname: "Short Jump", subtitle: ("Advance " + steps1 + " squares"), img:"none", value: steps1});
        currentOptions.push({category: "Teleport", effectname: "Long Jump", subtitle: ("Advance " + steps2 + " squares"), img:"none", value: steps2});
        break;
        
      case "CursedTeleport":
        var retreatSteps = Math.floor(Math.random() * 6) + 7;
        currentOptions = shuffle(filterunwantedtf(findTfxByCategory("CursedTransformation"))).slice(0, 1);
        if (currentOptions.length === 0) {
          currentOptions.push({category: "CursedTeleport", effectname: "Stay Put", img:"none", value: 0});
        } else {
          currentOptions[0].overridetitle = "Pay The Price";
          currentOptions[0].subtitle = "Gain: " + currentOptions[0].effectname;
        }
        currentOptions.push({category: "CursedTeleport", effectname: "Decline", subtitle: ("Retreat " + retreatSteps + " squares"), img:"none", value: (-retreatSteps)});
        var qtyglyph2 = qtyitem("Glyph of Protection");
        if (qtyglyph2) {
          currentOptions.push({category: "WildMagic", effectname: "Activate Glyph of Protection", subtitle: (qtyglyph2 + " Remaining"), img:"none", value: 0});
        }
        break;
        
      case "TreasureChest":
        currentOptions.push({category: "TreasureChest", effectname: "Open Chest", img:"none", value: 0});
        currentOptions.push({category: "TreasureChest", effectname: "Ignore Chest", img:"none", value: 0});
        var qtyunlock = qtyitem("Glyph of Unlocking");
        if (qtyunlock) {
          currentOptions.push({category: "TreasureChest", effectname: "Activate Glyph of Unlocking", subtitle: (qtyunlock + " Remaining"), img:"none", value: 0});
        }
        break;
        
      case "WildMagic":
        currentOptions = shuffle(filterunwantedtf(findTfxByCategory("CursedTransformation"))).slice(0, 1);
        if (currentOptions.length === 0) {
          currentOptions.push({category: "WildMagic", effectname: "Stay Put", img:"none", value: 0});
        } else {
          currentOptions[0].overridetitle = "Accept Fate";
          currentOptions[0].subtitle = "Gain: " + currentOptions[0].effectname;
        }
        var qtyglyph3 = qtyitem("Glyph of Protection");
        if (qtyglyph3) {
          currentOptions.push({category: "WildMagic", effectname: "Activate Glyph of Protection", subtitle: (qtyglyph3 + " Remaining"), img:"none", value: 0});
        }
        break;
        
      case "ItemShop":
        var mycoins = qtyitem("Silver Coin");
        if (mycoins >= 3) {
          currentOptions.push({category: "ItemShop", effectname: "Glyph of Protection", subtitle: "Costs 3 Silver Coins", img:"none", value: 3});
        }
        if (mycoins >= 2) {
          currentOptions.push({category: "ItemShop", effectname: "Glyph of Jaunting", subtitle: "Costs 2 Silver Coins", img:"none", value: 2});
        }
        if (mycoins >= 1) {
          currentOptions.push({category: "ItemShop", effectname: "Glyph of Unlocking", subtitle: "Costs 1 Silver Coin", img:"none", value: 1});
        }
        currentOptions.push({category: "ItemShop", effectname: "Buy Nothing", img:"none", value: 0});
        qt += "<br/><br/><b>Silver Coins: " + mycoins + "</b>";
        break;
        
      case "RestStop":
        // Free bonus: small luck boost or silver coin
        var restBonus = Math.floor(Math.random() * 3);
        if (restBonus === 0 && playertoken.stats["luck"] < get_attrib_limit("luck")) {
          currentOptions.push({category: "RestStop", effectname: "Rest & Recover", img:"none", value: 1, promoteAttribute: "luck"});
        } else {
          currentOptions.push({category: "RestStop", effectname: "Rest & Recover", img:"none", value: 0, giveCoin: true});
        }
        break;
        
      case "Challenge":
        // Test a random stat
        var challengeStats = ["strength", "stamina", "dexterity", "intelligence", "luck"];
        var testStat = challengeStats[Math.floor(Math.random() * challengeStats.length)];
        var statVal = playertoken.stats[testStat];
        var difficulty = Math.floor(Math.random() * 2) + 1; // DC 1-2
        var success = statVal >= difficulty;
        
        currentOptions.push({category: "Challenge", effectname: "Accept Challenge", img:"none", value: 0, testStat: testStat, testDC: difficulty, success: success});
        currentOptions.push({category: "Challenge", effectname: "Decline", img:"none", value: 0, skipChallenge: true});
        qt += "<br/><br/><b>Test: " + testStat.toUpperCase() + " (DC " + difficulty + ") | Your Stat: " + statVal + "</b>";
        break;
    }
    
    var titleEl = document.getElementById('questionTitleTxt');
    if (titleEl) titleEl.innerHTML = qt;
    
    // Fill answer options
    for (var i = 0; i < 4; i++) {
      var li = document.querySelectorAll('#userAnswer ul li')[i];
      if (!li) continue;
      
      if (currentOptions[i]) {
        li.style.display = "flex";
        var fxcatstr = currentOptions[i].overridetitle || currentOptions[i].effectname;
        if (currentOptions[i].subtitle) {
          fxcatstr += "<br/>(" + currentOptions[i].subtitle + ")";
        }
        li.innerHTML = fxcatstr;
        currentOptions[i].overridetitle = "";
        currentOptions[i].subtitle = "";
      } else {
        li.style.display = "none";
      }
    }
    
    // Show question viewer
    var qv = document.getElementById('questionViewer');
    if (qv) qv.style.bottom = "0px";
    
    // Hide dice sidebar
    var hideSide = document.getElementById('hideside');
    if (hideSide) hideSide.style.display = "none";
  } else {
    // No question, enable dice
    setTimeout(function() { enableUI(); }, 800);
  }
};

//============================================================
// EFFECT APPLICATION
//============================================================

function ApplyEffect(seldat) {
  setTimeout(function() {
    if (document.querySelector('.active')) {
      document.querySelector('.active').className = "";
    }
    
    var extrastr = "";
    var shownimg = seldat.img;
    var betterimg = "";
    var attribute = "";
    var showpopupafter = true;
    
    // Handle special cases
    switch(seldat.effectname) {
      case "Buy Nothing":
      case "Stay Put":
      case "Ignore Chest":
      case "Carry On":
        showpopupafter = false;
        addLog("Chose: " + seldat.effectname);
        break;
        
      case "Short Jump":
      case "Long Jump":
      case "Decline":
        showpopupafter = false;
        disableUI();
        addLog("Chose: " + seldat.effectname + " (" + seldat.value + " steps)");
        setTimeout(function() { MovePlayer(seldat.value); }, 500);
        break;
        
      case "Glyph of Jaunting":
      case "Glyph of Protection":
      case "Glyph of Unlocking":
        showpopupafter = false;
        giveitem(seldat.effectname, 1);
        useconsumable("Silver Coin", seldat.value);
        addLog("Purchased: " + seldat.effectname);
        showPopup("<u>Purchased Item</u><br/><br/><span style='color:yellow'><em>\"Thank you for your purchase!\"</em></span><br/><br/>The wizard takes your silver coins, hands you a glyph, and disappears.<br/><br/><span style='color:cyan'>Purchased " + seldat.effectname + " for " + seldat.value + " silver coins.</span>", "shop2big.jpg");
        break;
        
      case "Activate Glyph of Protection":
        showpopupafter = false;
        addLog("Used Glyph of Protection");
        showPopup("<u>Activate Glyph of Protection</u><br/><br/><span style='color:yellow'><em>\"Not Today.\"</em></span><br/><br/>You activate a Glyph of Protection, which blossoms into a shield, negating the incoming magical effects.<br/><br/><span style='color:cyan'>Used 1 Glyph of Protection</span>", "dispel.jpg");
        useconsumable("Glyph of Protection", 1);
        break;
        
      case "Activate Glyph of Unlocking":
      case "Open Chest":
        showpopupafter = false;
        var isTrapped = (Math.floor(Math.random() * 3) === 0);
        var trapOptions = shuffle(filterunwantedtf(findTfxByCategory("CursedTransformation"))).slice(0, 1);
        
        if (seldat.effectname === "Activate Glyph of Unlocking") {
          useconsumable("Glyph of Unlocking", 1);
          isTrapped = false;
        }
        
        if (isTrapped && trapOptions.length > 0) {
          var trap = trapOptions[0];
          addLog("Chest was TRAPPED! Curse: " + trap.effectname);
          showPopup("<u>Trapped Chest</u><br/><br/><span style='color:yellow'><em>\"Surprise!\"</em></span><br/><br/>A pink cloud of glittery dust explodes onto you!<br/><br/><span style='color:cyan'>Gained: " + trap.effectname + "</span>", "badchest.jpg", function() { ApplyEffect(trap); });
        } else {
          var randitem = (shuffle(filterunwanteditems(itemsdata)).slice(0, 1))[0];
          var giveqty = 1;
          if (randitem.name === "Cash") {
            giveqty = Math.floor(1 + Math.random() * 8) * 100;
            money += giveqty;
          }
          giveitem(randitem.name, giveqty);
          addLog("Looted: " + randitem.name + " x" + giveqty);
          showPopup("<u>Treasure Looted</u><br/><br/><span style='color:yellow'><em>\"Congratulations!\"</em></span><br/><br/>You got: " + randitem.name + " x " + giveqty + "<br/><br/><span style='color:cyan'>Added to inventory.</span>", "goodchest.jpg");
        }
        break;
        
      case "Rest & Recover":
        showpopupafter = false;
        if (seldat.giveCoin) {
          giveitem("Silver Coin", 1);
          addLog("Rest stop: gained a silver coin");
          showPopup("<u>Rest Stop</u><br/><br/>You rest peacefully, feeling refreshed.<br/><br/><span style='color:lime'>You found a Silver Coin!</span>");
        } else if (seldat.promoteAttribute) {
          adjust_attrib(seldat.promoteAttribute, 1);
          addLog("Rest stop: " + seldat.promoteAttribute + " +1");
          showPopup("<u>Rest Stop</u><br/><br/>You rest peacefully. The calming energy revitalizes you.<br/><br/><span style='color:lime'>" + seldat.promoteAttribute.toUpperCase() + " improved!</span>");
        }
        break;
        
      case "Accept Challenge":
        showpopupafter = false;
        addLog("Challenge: " + seldat.testStat + " vs DC " + seldat.testDC);
        if (seldat.success) {
          giveitem("Silver Coin", 2);
          addLog("Challenge PASSED!");
          showPopup("<u>Challenge Passed!</u><br/><br/>Your <span style='color:lime'>" + seldat.testStat.toUpperCase() + "</span> served you well!<br/><br/><span style='color:yellow'>You earned 2 Silver Coins!</span>");
        } else {
          addLog("Challenge FAILED");
          showPopup("<u>Challenge Failed</u><br/><br/>Your <span style='color:red'>" + seldat.testStat.toUpperCase() + "</span> wasn't enough. You stumbled but managed to carry on.<br/><br/><span style='color:yellow'>No reward this time.</span>");
        }
        break;
        
      case "Decline":
        if (seldat.skipChallenge) {
          showpopupafter = false;
          addLog("Declined challenge");
          showPopup("<u>Challenge Declined</u><br/><br/>You step away cautiously. No harm done.");
        }
        break;
        
      default:
        // Apply attribute effects
        applyAttributeEffect(seldat, function(attr, img, extra) {
          attribute = attr;
          betterimg = img;
          extrastr = extra;
        });
        break;
    }
    
    if (attribute !== "") {
      betterimg = stringify_attrib_img(attribute);
      var fancydesc = stringify_change_desc(attribute);
      if (fancydesc !== "") extrastr += "<br/><br/>" + fancydesc;
      var satrd = stringify_attrib_desc(attribute, false, true);
      if (satrd !== "") extrastr += "<br/><br/>" + satrd;
    }
    
    if (betterimg && betterimg !== "" && (shownimg === "none" || shownimg === "")) {
      shownimg = betterimg;
    }
    
    if (showpopupafter) {
      addLog("Effect: " + seldat.effectname);
      showPopup("<u>" + seldat.effectname + "</u><br/><br/>" + seldat.desc + "<span style='color:cyan'>" + extrastr + "</span>", shownimg);
    }
  }, 500);
}

function applyAttributeEffect(seldat, callback) {
  var attribute = "";
  var extrastr = "";
  
  switch(seldat.effectname) {
    case "Strength Enhancement": attribute = "strength"; adjust_attrib(attribute, 1); break;
    case "Stamina Enhancement": attribute = "stamina"; adjust_attrib(attribute, 1); break;
    case "Dexterity Enhancement": attribute = "dexterity"; adjust_attrib(attribute, 1); break;
    case "Eyesight Enhancement": attribute = "eyesight"; adjust_attrib(attribute, 1); break;
    case "Constitution Enhancement": attribute = "constitution"; adjust_attrib(attribute, 1); break;
    case "Intelligence Enhancement": attribute = "intelligence"; adjust_attrib(attribute, 1); break;
    case "Charisma Enhancement": attribute = "charisma"; adjust_attrib(attribute, 1); break;
    case "Talent Enhancement": attribute = "talent"; adjust_attrib(attribute, 1); break;
    case "Luck Enhancement": attribute = "luck"; adjust_attrib(attribute, 1); break;
    case "Hair Growth": PrepareTF(); attribute = "hair length"; adjust_attrib(attribute, 1); break;
    case "Enfeeblement": PrepareTF(); attribute = "strength"; adjust_attrib(attribute, -10); break;
    case "Breast Growth": PrepareTF(); attribute = "breast size"; adjust_attrib(attribute, 1); break;
    case "Gender Change":
      PrepareTF();
      if (playertoken.stats["breast size"] < 2) adjust_attrib("breast size", 1);
      if (playertoken.stats["ass size"] < 2) adjust_attrib("ass size", 1);
      if (playertoken.stats["hair length"] < 2) adjust_attrib("hair length", 1);
      playertoken.stats["height"] -= 6;
      if (playertoken.stats["height"] < MIN_HEIGHT) playertoken.stats["height"] = MIN_HEIGHT;
      attribute = "physique";
      adjust_attrib("gender", 1);
      adjust_attrib(attribute, 1);
      break;
    case "Extra Feminization":
      PrepareTF();
      if (playertoken.stats["breast size"] < 2) adjust_attrib("breast size", 2);
      else adjust_attrib("breast size", 1);
      adjust_attrib("ass size", 1);
      adjust_attrib("hair length", 1);
      attribute = "physique"; adjust_attrib(attribute, 1);
      break;
    case "Shrinking": PrepareTF(); attribute = "height"; playertoken.stats["height"] -= 4; if (playertoken.stats["height"] < MIN_HEIGHT) playertoken.stats["height"] = MIN_HEIGHT; break;
    case "Ass Expansion": PrepareTF(); attribute = "ass size"; adjust_attrib(attribute, 1); break;
    case "Orientation Change": PrepareTF(); attribute = "orientation"; playertoken.stats["orientation"] = 1 + Math.floor(Math.random() * 2); break;
    case "Increased Libido": PrepareTF(); attribute = "increased libido"; adjust_attrib(attribute, 1); break;
    case "Increased Sensitivity": PrepareTF(); attribute = "increased sensitivity"; adjust_attrib(attribute, 1); break;
    case "Increased Fluids": PrepareTF(); attribute = "increased fluids"; adjust_attrib(attribute, 1); break;
    case "Always Ready": PrepareTF(); attribute = "always ready"; adjust_attrib(attribute, 1); break;
    case "Enhanced Orgasms": PrepareTF(); attribute = "enhanced orgasms"; adjust_attrib(attribute, 1); break;
    case "Submissiveness": PrepareTF(); attribute = "submissiveness"; adjust_attrib(attribute, 1); break;
    case "Hypnotic Susceptibility": PrepareTF(); attribute = "hypnotic susceptibility"; adjust_attrib(attribute, 1); break;
    case "Multiple Orgasms": PrepareTF(); attribute = "multiple orgasms"; adjust_attrib(attribute, 1); break;
    case "Random Orgasms": PrepareTF(); attribute = "random orgasms"; adjust_attrib(attribute, 1); break;
    case "Triggered Orgasms": PrepareTF(); attribute = "triggered orgasms"; adjust_attrib(attribute, 1); break;
    case "Triggered Arousal": PrepareTF(); attribute = "triggered arousal"; adjust_attrib(attribute, 1); break;
    case "Easily Aroused": PrepareTF(); attribute = "easily aroused"; adjust_attrib(attribute, 1); break;
    case "Hair Trigger": PrepareTF(); attribute = "hair trigger"; adjust_attrib(attribute, 1); break;
    case "Flexible": PrepareTF(); attribute = "flexible"; adjust_attrib(attribute, 1); break;
    case "Cheerful": PrepareTF(); attribute = "cheerful"; adjust_attrib(attribute, 1); break;
    case "Tasty Fluids": PrepareTF(); attribute = "tasty fluids"; adjust_attrib(attribute, 1); break;
    case "Pheromones": PrepareTF(); attribute = "pheromones"; adjust_attrib(attribute, 1); break;
    case "No Gag Reflex": PrepareTF(); attribute = "no gag reflex"; adjust_attrib(attribute, 1); break;
    case "Oral Lover": PrepareTF(); attribute = "oral lover"; adjust_attrib(attribute, 1); break;
    case "Anal Lover": PrepareTF(); attribute = "anal lover"; adjust_attrib(attribute, 1); break;
    case "Infertile": PrepareTF(); attribute = "infertile"; adjust_attrib("very fertile", -1); adjust_attrib(attribute, 1); break;
    case "Very Fertile": PrepareTF(); attribute = "very fertile"; adjust_attrib("infertile", -1); adjust_attrib(attribute, 1); break;
    case "Pent Up": PrepareTF(); attribute = "pent up"; adjust_attrib(attribute, 1); break;
    case "Masochistic": PrepareTF(); attribute = "masochistic"; adjust_attrib(attribute, 1); break;
    case "Exhibitionist": PrepareTF(); attribute = "exhibitionist"; adjust_attrib(attribute, 1); break;
    case "Lewd Dreams": PrepareTF(); attribute = "lewd dreams"; adjust_attrib(attribute, 1); break;
    case "Age Regression":
      PrepareTF();
      attribute = "age";
      playertoken.stats["age"] -= 5;
      if (playertoken.stats["age"] < MIN_AGE) playertoken.stats["age"] = MIN_AGE;
      if (playertoken.stats["age"] < 20) { playertoken.stats["height"] -= 4; if (playertoken.stats["height"] < MIN_HEIGHT) playertoken.stats["height"] = MIN_HEIGHT; }
      break;
    case "Heat": PrepareTF(); attribute = "heat"; adjust_attrib(attribute, 1); break;
    case "Wallflower": PrepareTF(); attribute = "charisma"; adjust_attrib(attribute, -10); break;
    case "Dependent": PrepareTF(); attribute = "dependent"; adjust_attrib(attribute, 1); break;
    case "Fluid Addiction": PrepareTF(); attribute = "fluid addiction"; adjust_attrib(attribute, 1); break;
    case "Lactation": PrepareTF(); attribute = "lactation"; adjust_attrib(attribute, 1); break;
    case "Incontinence": PrepareTF(); attribute = "incontinence"; adjust_attrib(attribute, 1); break;
    case "Hair Removal": PrepareTF(); attribute = "hair removal"; adjust_attrib(attribute, 1); break;
    case "Sleepy": PrepareTF(); attribute = "sleepy"; adjust_attrib(attribute, 1); break;
    case "Ditzy": PrepareTF(); attribute = "ditzy"; adjust_attrib(attribute, 1); break;
    case "Noisy": PrepareTF(); attribute = "noisy"; adjust_attrib(attribute, 1); break;
    case "Orgasm Denial": PrepareTF(); attribute = "denial"; adjust_attrib(attribute, 1); break;
    case "Clumsy": PrepareTF(); attribute = "dexterity"; adjust_attrib(attribute, -10); break;
    case "Enervation": PrepareTF(); attribute = "stamina"; adjust_attrib(attribute, -10); break;
    case "Glasses": PrepareTF(); attribute = "eyesight"; adjust_attrib(attribute, -10); break;
    case "Bad Luck": PrepareTF(); attribute = "luck"; adjust_attrib(attribute, -10); break;
    case "Palette Swap":
      PrepareTF();
      attribute = "";
      adjust_attrib("palette swap", 1);
      var hrc = ["Black","Blonde","Brown","Brunette","Gray","White","Pink","Red","Auburn"];
      var eyc = ["Blue","Green","Dark brown","Brown","Hazel","Amber","Gray"];
      playertoken.stats["hair color"] = hrc[Math.floor(Math.random() * hrc.length)];
      playertoken.stats["eye color"] = eyc[Math.floor(Math.random() * eyc.length)];
      extrastr += "<br/><br/>Your hair changes to " + toLowerFirst(playertoken.stats["hair color"]) + ", and your eyes to " + toLowerFirst(playertoken.stats["eye color"]) + "!";
      break;
    case "Name Change":
      PrepareTF();
      attribute = "";
      adjust_attrib("name change", 1);
      var femname = ["Jennifer","Jessica","Megan","Sarah","Samantha","Amanda","Nicole","Danielle","Emily","Chloe","Alice","Sophie"];
      playertoken.stats["name"] = femname[Math.floor(Math.random() * femname.length)];
      extrastr += "<br/><br/>Your name is now " + playertoken.stats["name"] + ".";
      break;
    case "Choose Nothing":
      attribute = "";
      giveitem("Silver Coin", 1);
      break;
  }
  
  callback(attribute, betterimg, extrastr);
}

//============================================================
// SUBMIT ANSWER
//============================================================

var submitAnswer = function() {
  if (document.querySelectorAll('.active').length < 1) return false;
  
  document.getElementById('questionViewer').style.bottom = "";
  
  var selectedoption = parseInt(document.querySelector('.active').value);
  var seldat = currentOptions[selectedoption];
  
  ApplyEffect(seldat);
  
  // Unlock dice
  document.getElementById('hideside').style.display = "";
  setTimeout(function() { enableUI(); }, 1000);
};

//============================================================
// POPUP SYSTEM
//============================================================

function showPopup(str, img, onnext) {
  if (onnext) {
    var dismissBtn = document.getElementById('dismisspop');
    dismissBtn.onclick = null;
    dismissBtn.addEventListener('click', function handler() {
      dismissBtn.removeEventListener('click', handler);
      hidepopup();
      setTimeout(function() { onnext(); }, 10);
    });
  } else {
    document.getElementById('dismisspop').onclick = null;
    document.getElementById('dismisspop').addEventListener('click', function() { hidepopup(); });
  }
  
  var html = "";
  if (img) {
    html += "<img src='img/icons/" + img + "' width=140 height=140 style=\"border:2px solid #000000; margin:8px; float:left;\" />";
  }
  html += str;
  document.getElementById('popmsg').innerHTML = html;
  document.querySelector('.overlay').style.display = 'block';
  document.querySelector('.alertMsg').style.display = 'block';
}

function hidepopup() {
  document.querySelector('.overlay').style.display = 'none';
  document.querySelector('.alertMsg').style.display = 'none';
  if (showtfeffect) {
    showtfeffect = false;
    playcurseanim();
  }
}

//============================================================
// TOGGLE FUNCTIONS
//============================================================

function toggleminimize() {
  var qvobj = document.getElementById('questionViewer');
  if (qvobj.style.bottom === "0px") {
    qvobj.style.left = qvobj.style.left === "" ? "-792px" : "";
  }
}

//============================================================
// SHOP, STATUS, INVENTORY
//============================================================

function showshop() {
  setQuestion(itemshopdata);
}

function showplayerstatus() {
  var facestr = "<img src='img/icons/face" + (playertoken.stats["gender"] === 0 ? "0" : "1") + ".png' width=120 height=120 style=\"margin:6px; float: right;\" />";
  document.getElementById('playerstatustext').innerHTML = facestr + stringify_player(true);
  document.getElementById('playerstatus').style.bottom = '0px';
}

function showinventory() {
  document.getElementById('inventorytext').innerHTML = "";
  document.getElementById('inventory').style.bottom = '0px';
  var invstr = "<ul>";
  for (var i = 0; i < playertoken.inv.length; i++) {
    if (playertoken.inv[i].qty > 0) {
      invstr += "<li value=" + i + " onclick='selectinvitem(this)'>" + playertoken.inv[i].name + " x " + playertoken.inv[i].qty + "</li>";
    }
  }
  invstr += "</ul>";
  document.getElementById('inventoryicons').innerHTML = invstr;
}

function selectinvitem(ele) {
  if (typeof ele === 'number' || !isNaN(parseInt(ele.value))) {
    setactiveans(ele);
    playertoken.lastselecteditem = parseInt(ele.value);
  }
  
  var invitm = playertoken.inv[playertoken.lastselecteditem];
  if (!invitm) return;
  
  var itmdata = null;
  for (var i = 0; i < itemsdata.length; i++) {
    if (itemsdata[i].name === invitm.name) { itmdata = itemsdata[i]; break; }
  }
  if (!itmdata) return;
  
  var str = "";
  if (itmdata.img && itmdata.img !== "") {
    str += "<img src='img/icons/" + itmdata.img + "' width=100 height=100 style=\"border:2px solid #000000\" /><br/>";
  }
  str += "<u>" + invitm.name + "</u><br/>" + itmdata.desc + "<br/><br/>";
  if (itmdata.gameitm) str += "<span style='color:pink;'>(GAME ITEM)</span><br/>";
  str += "<span style='color:yellow;'>" + itmdata.effect + "</span>";
  if (itmdata.usable) {
    str += "<br/><button class='submitAns' onclick='useinvitem()'>Use Item</button>";
  }
  document.getElementById('inventorytext').innerHTML = str;
}

function useinvitem() {
  var invitm = playertoken.inv[playertoken.lastselecteditem];
  if (!invitm) return;
  
  invitm.qty -= 1;
  showinventory();
  document.getElementById('inventory').style.bottom = '';
  
  switch(invitm.name) {
    case "Glyph of Jaunting":
      disableUI();
      addLog("Used Glyph of Jaunting");
      setTimeout(function() { MovePlayer(6); }, 1000);
      break;
  }
}

//============================================================
// ITEM MANAGEMENT
//============================================================

function giveitem(_name, _qty) {
  var found = null;
  var itmdata = null;
  for (var i = 0; i < itemsdata.length; i++) {
    if (itemsdata[i].name === _name) { itmdata = itemsdata[i]; break; }
  }
  
  for (var i = 0; i < playertoken.inv.length; i++) {
    if (playertoken.inv[i].name === _name) { found = playertoken.inv[i]; break; }
  }
  
  if (found && itmdata && itmdata.stacks) {
    found.qty += _qty;
  } else {
    playertoken.inv.push({name: _name, qty: _qty});
  }
}

function qtyitem(_name) {
  for (var i = 0; i < playertoken.inv.length; i++) {
    if (playertoken.inv[i].name === _name && playertoken.inv[i].qty > 0) return playertoken.inv[i].qty;
  }
  return 0;
}

function useconsumable(_name, amt) {
  for (var i = 0; i < playertoken.inv.length; i++) {
    if (playertoken.inv[i].name === _name && playertoken.inv[i].qty > 0) {
      playertoken.inv[i].qty -= amt;
      if (playertoken.inv[i].qty < 0) playertoken.inv[i].qty = 0;
      break;
    }
  }
}

//============================================================
// SELECTION HELPERS
//============================================================

var setactiveans = function(ele) {
  if (document.querySelector('.active')) {
    document.querySelector('.active').className = "";
  }
  if (ele) {
    ele.className = "active";
  }
};

function selectsandbox(ele) {
  selectchar(ele);
  setactiveans(ele);
  issandbox = true;
  document.getElementById('bios').style.display = 'block';
  document.getElementById('bio').innerHTML =
    "First Name: <input type=text id=ifname value='John' maxlength=15 size=8><br/>" +
    "Last Name: <input type=text id=ilname value='Smith' maxlength=15 size=8><br/>" +
    "Age: <input type=number id=iage value=24 min=16 max=80><br/>" +
    "Height (cm): <input type=number id=iheight value=180 min=" + MIN_HEIGHT + " max=200><br/>" +
    "Gender: <select id=igender><option value=0>M</option> <option value=1>F</option></select><br/>" +
    "Orientation: <select id=iori><option value=0>Prefers F</option> <option value=1>Prefers M</option><option value=2>Bisexual</option></select><br/>" +
    "Hair Color: <input type=text id=ihairc value='Brown' maxlength=15 size=8><br/>" +
    "Eye Color: <input type=text id=ieyec value='Hazel' maxlength=15 size=8><br/>" +
    "Infinite Silver Coins: <input type=checkbox id=iinfsilver> | " +
    "Loaded Dice: <input type=checkbox id=iloaddice>";
  document.getElementById('bio2').innerHTML = "Sandbox mode allows full customization.<br/><br/>Options available:<br/>- Custom name, age, appearance<br/>- Infinite coins (cheat)<br/>- Loaded dice (always roll 1)<br/><br/><span style='color:yellow'>Experimental!</span>";
}

function selectchar(ele) {
  issandbox = false;
  setactiveans(ele);
  document.getElementById('bios').style.display = 'block';
  var tmp = playerTemplates[ele.value];
  if (!tmp) return;
  
  playertoken.stats["name"] = tmp["name"];
  playertoken.stats["last name"] = tmp["last name"];
  playertoken.stats["age"] = tmp["age"];
  playertoken.stats["gender"] = tmp["gender"];
  playertoken.stats["height"] = tmp["height"];
  playertoken.stats["strength"] = tmp["strength"];
  playertoken.stats["stamina"] = tmp["stamina"];
  playertoken.stats["dexterity"] = tmp["dexterity"];
  playertoken.stats["eyesight"] = tmp["eyesight"];
  playertoken.stats["constitution"] = tmp["constitution"];
  playertoken.stats["intelligence"] = tmp["intelligence"];
  playertoken.stats["charisma"] = tmp["charisma"];
  playertoken.stats["talent"] = tmp["talent"];
  playertoken.stats["luck"] = tmp["luck"];
  playertoken.stats["hair color"] = tmp["hair color"];
  playertoken.stats["eye color"] = tmp["eye color"];
  playertoken.stats["breast size"] = tmp["breast size"];
  playertoken.stats["hair length"] = tmp["hair length"];
  playertoken.stats["ass size"] = tmp["ass size"];
  playertoken.stats["physique"] = tmp["physique"];
  
  playertoken.inv = tmp.gear ? tmp.gear.slice() : [];
  
  document.getElementById('bio').innerHTML = "<img src='img/icons/face0.png' width=120 height=120 /><br/>" + stringify_player(false);
  document.getElementById('bio2').innerHTML = tmp.desc;
}

function playagain() {
  deleteSave();
  location.href = document.URL;
}

//============================================================
// STRINGIFY HELPERS
//============================================================

function toFeet(n) {
  var realFeet = (n * 0.393700) / 12;
  var feet = Math.floor(realFeet);
  var inches = Math.round((realFeet - feet) * 12);
  return feet + "&prime;" + inches + '&Prime;';
}

function toLowerFirst(string) {
  if (string.length > 0) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }
  return "";
}

function stringify_player(verbose) {
  var str = "";
  str += "<span style='color:yellow'>Name:</span> " + playertoken.stats["name"] + " " + playertoken.stats["last name"] + "<br/>";
  str += "<span style='color:yellow'>Age:</span> " + playertoken.stats["age"] + "<br/>";
  str += "<span style='color:yellow'>Sex:</span> " + stringify_attrib_desc("gender", false, false) + "<br/>";
  if (verbose) str += "<span style='color:yellow'>Orientation:</span> " + stringify_attrib_desc("orientation", false, false) + "<br/>";
  str += "<span style='color:yellow'>Height:</span> " + toFeet(playertoken.stats["height"]) + " (" + playertoken.stats["height"] + "cm)<br/>";
  
  if (verbose) {
    str += "<span style='color:yellow'>Hair:</span> " + playertoken.stats["hair color"] + ", " + toLowerFirst(stringify_attrib_desc("hair length", false, false)) + "<br/>";
    str += "<span style='color:yellow'>Eye Color:</span> " + playertoken.stats["eye color"] + "<br/>";
    
    if (playertoken.stats["breast size"] > 0) {
      str += "<span style='color:yellow'>Breast Size:</span> " + stringify_attrib_desc("breast size", false, false) + "<br/>";
    }
    if (playertoken.stats["ass size"] > 0) {
      str += "<span style='color:yellow'>Ass Size:</span> " + stringify_attrib_desc("ass size", false, false) + "<br/>";
    }
    
    var attrs = ["physique","increased libido","increased sensitivity","increased fluids",
      "always ready","enhanced orgasms","submissiveness","hypnotic susceptibility",
      "multiple orgasms","random orgasms","triggered orgasms","triggered arousal",
      "easily aroused","hair trigger","flexible","cheerful","tasty fluids",
      "pheromones","no gag reflex","oral lover","anal lover","infertile","very fertile",
      "pent up","masochistic","exhibitionist","lewd dreams","heat","dependent",
      "fluid addiction","lactation","incontinence","hair removal","sleepy","ditzy",
      "noisy","denial","strength","stamina","dexterity","eyesight","constitution",
      "intelligence","charisma","talent","luck"];
    
    str += "<ul>";
    for (var i = 0; i < attrs.length; i++) {
      var adesc = stringify_attrib_desc(attrs[i], true, false);
      if (adesc !== "") {
        str += "<li class='pic-list'><img src='img/icons/" + stringify_attrib_img(attrs[i]) + "' width='60' height='60' /><p>" + adesc + "</p></li>";
      }
    }
    str += "</ul>";
  }
  return str;
}

function stringify_attrib_img(attribute) {
  var found = null;
  for (var i = 0; i < configChangeImgs.length; i++) {
    if (configChangeImgs[i].attribname === attribute) { found = configChangeImgs[i]; break; }
  }
  
  if (found) {
    var lv = playertoken.stats[attribute];
    if (found.imgsF && found.imgsM) {
      if (typeof lv === 'number' && lv < found.imgsF.length && lv < found.imgsM.length) {
        return playertoken.stats["gender"] === 0 ? found.imgsM[lv] : found.imgsF[lv];
      }
      if (found.imgsM.length > 0 && found.imgsF.length > 0) {
        return playertoken.stats["gender"] === 0 ? found.imgsM[found.imgsM.length - 1] : found.imgsF[found.imgsF.length - 1];
      }
    } else {
      if (typeof lv === 'number' && lv < found.imgs.length) return found.imgs[lv];
      if (found.imgs.length > 0) return found.imgs[found.imgs.length - 1];
    }
  }
  return "";
}

function stringify_change_desc(attribute) {
  var found = null;
  for (var i = 0; i < configChangeDescs.length; i++) {
    if (configChangeDescs[i].attribname === attribute) { found = configChangeDescs[i]; break; }
  }
  
  if (found) {
    var lv = playertoken.stats[attribute];
    if (typeof lv === 'number') {
      if (!found.descsM || !found.descsF) {
        if (lv < found.descs.length) return found.descs[lv];
      } else {
        if (playertoken.stats["gender"] === 0) {
          if (lv < found.descsM.length) return found.descsM[lv];
        } else {
          if (lv < found.descsF.length) return found.descsF[lv];
        }
      }
    }
  }
  return "";
}

function stringify_attrib_desc(attribute, includeLabel, describeAllChange) {
  var fx = null;
  for (var i = 0; i < fxdesc.length; i++) {
    if (fxdesc[i].attribname === attribute) { fx = fxdesc[i]; break; }
  }
  if (!fx) return "Your " + attribute + " is now " + playertoken.stats[attribute];

  var ret = "";
  if (!fx.descsM || !fx.descsF) {
    ret = fx.descs[playertoken.stats[attribute]];
  } else {
    ret = playertoken.stats["gender"] === 0 ? fx.descsM[playertoken.stats[attribute]] : fx.descsF[playertoken.stats[attribute]];
  }

  if (describeAllChange && ret === "") ret = "Your " + attribute + " is unremarkably average.";
  if (ret !== "" && includeLabel) ret = "<span style='color:yellow'>" + attribute.toUpperCase() + "</span> - " + ret;

  var overrideDesc = "";
  switch(attribute) {
    case "height":
      overrideDesc = "Your height is now " + toFeet(playertoken.stats["height"]) + " (" + playertoken.stats["height"] + "cm)";
      break;
    case "breast size":
      if (describeAllChange && ret !== "") overrideDesc = "Your " + attribute + " is now " + ret;
      break;
    case "hair length":
    case "hair color":
      if (describeAllChange && ret !== "") overrideDesc = "Your hair is now " + toLowerFirst(ret);
      break;
    case "ass size":
      if (describeAllChange && ret !== "") overrideDesc = "Your ass is now " + toLowerFirst(ret);
      break;
  }

  return overrideDesc !== "" ? overrideDesc : ret;
}

//============================================================
// ITEMS DATA
//============================================================

var items = [
  {name:"Silver Coin", desc:"一枚古老的银币。", effect:"可用于在商店购买符文。", img:"silvercoin.png", usable:false, stacks:true, randwt:3, gameitm:1},
  {name:"Cash", desc:"各种面额的美元钞票。", effect:"真金白银！赢得它，就属于你。", img:"cash.jpg", usable:false, stacks:true, randwt:7},
  {name:"Glyph of Jaunting", desc:"一块刻有褪色符文的鹅卵石。", effect:"激活后，精确传送你前进6步。", img:"glyph2.jpg", usable:true, stacks:true, gameitm:1},
  {name:"Glyph of Protection", desc:"一块刻有褪色符文的鹅卵石。", effect:"激活后在你周围形成临时护盾，抵御部分魔法效果。", img:"glyph1.jpg", usable:false, stacks:true, gameitm:1},
  {name:"Glyph of Unlocking", desc:"一块刻有褪色符文的鹅卵石。", effect:"用于解除宝箱中的陷阱。", img:"glyph3.jpg", usable:false, stacks:true, gameitm:1},
];

//============================================================
// INITIALIZATION - Replace jQuery document.ready
//============================================================

function initGame() {
  document.body.classList.add('done');
  
  // Set up save/continue button
  var continueBtn = document.getElementById('continueBtn');
  if (continueBtn && hasSaveData()) {
    continueBtn.style.display = 'block';
    continueBtn.onclick = function() {
      if (loadGame()) {
        // Skip to game screen
        document.getElementById('screen1').style.display = 'none';
        document.getElementById('screen4').style.display = 'block';
        generateBoard();
        placeIconsOnBoard();
        enableUI();
        playertoken.setpos(playertoken.currentpos || "Start");
        addLog("已从存档继续游戏");
        for (var i = 0; i < gameLog.length; i++) {
          addLog(gameLog[i]);
        }
      }
    };
  }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}