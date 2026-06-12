// ============================================================
//  CHAMADO SUSTENTÁVEL — Agrinho 2026
//  p5.js · Pixel Art · Sons via Web Audio API · Tutoriais
// ============================================================

// ---------- ESTADO GLOBAL ----------
let gameState = "phone";
let paused = false; // Novo estado para pausa
let narrativePlayer; // Para o personagem da narrativa na Fase 4
let narrativeText = ""; // Para o texto da fala do personagem
let narrativeTimer = 0; // Para controlar o tempo da fala

// ---------- ÁUDIO ----------
let audioCtx = null;

// ---------- FASE 1 – ÁGUA ----------
let player;
let leaks = [];
let waterSaved = 0;
let phase1Message = false;

// ---------- FASE 2 – SOLO ----------
const COLS = 20, ROWS = 11, TILE = 32;
let grid = [];
let degradTimer = 0;
let nativeCount = 0;
let phase2Message = false;

// ---------- FASE 3 – FLORESTA ----------
let trees3 = [];
let fences3 = [];
let animals3 = [];
let missions3 = [];
let currentMission3 = 0;
let phase3Message = false;
let riverHealth3 = 100;
let plantedTrees3 = 0;

// ---------- FASE 4 – CAMPO/CIDADE ----------
let boxes4 = [];
let score4 = 0;
let spoiled4 = 0;
let phase4Message = false;
let dragBox = null;

// ---------- ANIMAÇÃO ----------
let fCount = 0;

// ============================================================
function setup() {
  createCanvas(640, 400);
  noSmooth();
  textFont("monospace");
  initAudio(); // Inicializa o contexto de áudio
  preloadSounds(); // Pré-carrega os sons para evitar latência
  resetPhase1();
  resetPhase2();
  resetPhase3();
  resetPhase4();
}

// ============================================================
//  ÁUDIO — Web Audio API
// ============================================================
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Pré-carrega os sons tocando-os com volume 0 e duração mínima
function preloadSounds() {
  if (!audioCtx) return;
  playBeep(440, 0.001, "square", 0, 0);
  playBeep(880, 0.001, "square", 0, 0);
  playBeep(330, 0.001, "sine", 0, 0);
  playBeep(660, 0.001, "sine", 0, 0);
  playBeep(523, 0.001, "sine", 0, 0);
  playBeep(200, 0.001, "sawtooth", 0, 0);
  playBeep(700, 0.001, "square", 0, 0);
  playBeep(300, 0.001, "sawtooth", 0, 0);
}

function playBeep(freq, dur, type = "square", vol = 0.3, delay = 0) {
  if (!audioCtx) return;
  let osc  = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
  gain.gain.setValueAtTime(vol,   audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + dur);
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime  + delay + dur + 0.05);
}

function playRingTone() {
  if (!audioCtx) return;
  let pat = [
    {f:880,  d:0.12, t:0.00},
    {f:1100, d:0.12, t:0.16},
    {f:880,  d:0.12, t:0.32},
    {f:1100, d:0.12, t:0.48},
  ];
  for (let p of pat) playBeep(p.f, p.d, "square", 0.18, p.t);
}

function playSoundFix() {
  playBeep(440, 0.08, "square", 0.2,  0.00);
  playBeep(660, 0.08, "square", 0.2,  0.10);
  playBeep(880, 0.15, "sine",   0.25, 0.20);
}

function playSoundPlant() {
  playBeep(330, 0.06, "sine", 0.2,  0.00);
  playBeep(440, 0.06, "sine", 0.2,  0.08);
  playBeep(550, 0.10, "sine", 0.25, 0.16);
}

function playSoundDeliver() {
  playBeep(660,  0.07, "sine", 0.25, 0.00);
  playBeep(880,  0.07, "sine", 0.25, 0.09);
  playBeep(1100, 0.12, "sine", 0.3,  0.18);
}

function playSoundPhaseDone() {
  let mel = [523, 659, 784, 1047];
  for (let i = 0; i < mel.length; i++)
    playBeep(mel[i], 0.15, "sine", 0.28, i * 0.18);
}

function playSoundSpoil() {
  playBeep(200, 0.2, "sawtooth", 0.2, 0.00);
  playBeep(150, 0.2, "sawtooth", 0.2, 0.18);
}

function playSoundClick() {
  playBeep(700, 0.06, "square", 0.15, 0.0);
}

function playSoundIgnore() {
  playBeep(300, 0.15, "sawtooth", 0.2, 0.00);
  playBeep(220, 0.30, "sawtooth", 0.2, 0.18);
}

// ============================================================
//  DRAW PRINCIPAL
// ============================================================
function draw() {
  if (paused) {
    drawPauseScreen();
    return;
  }

  fCount++;
  // Toque automático do celular
  if (gameState === "phone" && fCount % 180 === 0) playRingTone();

  switch (gameState) {
    case "phone":            drawPhoneScreen();       break;
    case "ignore":           drawIgnoreScreen();      break;
    case "tutorial1":        drawTutorial1();         break;
    case "fase1_agua":       drawWaterPhase();        break;
    case "tutorial2":        drawTutorial2();         break;
    case "fase2_solo":       drawSoilPhase();         break;
    case "tutorial3":        drawTutorial3();         break;
    case "fase3_floresta":   drawForestPhase();       break;
    case "tutorial4":        drawTutorial4();         break;
    case "fase4_intro":      drawNarrativeIntro4();   break; // NOVO: Estado de introdução da Fase 4
    case "fase4campocidade": drawCampoCidadePhase();  break;
    case "final":            drawFinalScreen();       break;
  }
}

// ============================================================
//  UTILITÁRIO
// ============================================================
function mouseOverRect(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

// Função drawMessageBox atualizada para incluir playSoundClick no botão continuar
function drawMessageBox(title, lines, bgColor, nextState = null) {
  fill(0, 0, 0, 185);
  rect(0, 0, width, height);
  fill(bgColor);
  rect(55, 70, width - 110, height - 140, 8);
  fill(255);
  textSize(14);
  textAlign(CENTER);
  text(title, width / 2, 102);
  stroke(255, 255, 255, 80);
  strokeWeight(1);
  line(75, 110, width - 75, 110);
  noStroke();
  fill(228, 228, 228);
  textSize(10);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "") continue;
    text(lines[i], width / 2, 128 + i * 17);
  }
  // Botão continuar
  let bx = width / 2 - 75, by = height - 100, bw = 150, bh = 26;
  fill(mouseOverRect(bx, by, bw, bh) ? color(70, 200, 70) : color(40, 145, 40));
  rect(bx, by, bw, bh, 5);
  fill(255);
  textSize(11);
  textAlign(CENTER, CENTER);
  text("CONTINUAR →", bx + bw / 2, by + bh / 2);

  // Lógica para o clique no botão continuar da message box
  if (mouseIsPressed && mouseOverRect(bx, by, bw, bh)) {
    playSoundClick();
    if (nextState) {
      gameState = nextState;
    }
    // Previne múltiplos cliques
    mouseIsPressed = false;
  }
}

// NOVO: Tela de Pausa
function drawPauseScreen() {
  fill(0, 0, 0, 200); // Fundo escuro
  rect(0, 0, width, height);

  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("PAUSADO", width / 2, height / 2 - 30);

  textSize(12);
  text("Pressione 'P' para continuar", width / 2, height / 2 + 20);
}


// ============================================================
// ░░  TELA INICIAL — CELULAR  ░░
// ============================================================
function drawPhoneScreen() {
  background(18, 18, 32);

  // Estrelas
  noStroke();
  for (let i = 0; i < 55; i++) {
    let sx = (i * 137) % 640;
    let sy = (i * 97)  % 400;
    fill(255, 255, 200, sin(fCount * 0.04 + i) > 0.4 ? 220 : 60);
    rect(sx, sy, 2, 2);
  }

  let blink = (fCount % 44) < 22;

  // Ondas de sinal
  noFill();
  for (let r = 1; r <= 4; r++) {
    stroke(80, 220, 80, blink ? 170 - r * 28 : 25);
    strokeWeight(2);
    ellipse(width / 2, 210, 70 + r * 52, 70 + r * 52);
  }
  noStroke();

  // Corpo do celular
  let cx = width / 2 - 80, cy = 52, cw = 160, ch = 292;
  fill(52, 55, 70);
  rect(cx, cy, cw, ch, 10);

  // Tela
  fill(10, 14, 28);
  rect(cx + 8, cy + 22, cw - 16, ch - 52);

  // Notch
  fill(32, 35, 48);
  rect(cx + 54, cy + 9, 52, 9, 4);
  fill(55, 175, 255);
  rect(cx + 71, cy + 10, 8, 7, 3);

  // Botão home
  fill(72, 75, 92);
  rect(cx + 62, cy + ch - 22, 36, 10, 5);

  // Ícone telefone piscando
  fill(blink ? color(45, 195, 55) : color(28, 95, 32));
  rect(cx + 52, cy + 32, 56, 56, 6);
  fill(255);
  rect(cx + 63, cy + 42, 14, 26, 2);
  rect(cx + 77, cy + 46, 13, 18, 2);
  if (blink) {
    fill(45, 195, 55);
    rect(cx + 66, cy + 46, 9, 12);
  }

  // Texto CHAMANDO
  fill(blink ? color(95, 255, 100) : color(55, 155, 65));
  textSize(9);
  textAlign(CENTER);
  text("● CHAMANDO...", cx + cw / 2, cy + 100);

  // Mensagem
  fill(188, 218, 188);
  textSize(8);
  text("O AGRO ESTÁ CHAMANDO.", cx + cw / 2, cy + 120);
  text("VOCÊ ATENDE ESSE", cx + cw / 2, cy + 136);
  text("CHAMADO PELO FUTURO", cx + cw / 2, cy + 150);
  text("SUSTENTÁVEL?", cx + cw / 2, cy + 164);

  // Botão ATENDER
  let bx1 = cx + 8, by1 = cy + 186, bw1 = 68, bh1 = 28;
  fill(mouseOverRect(bx1, by1, bw1, bh1) ? color(45, 210, 55) : color(22, 140, 28));
  rect(bx1, by1, bw1, bh1, 4);
  fill(255);
  textSize(8);
  textAlign(CENTER, CENTER);
  text("✔ ATENDER", bx1 + bw1 / 2, by1 + bh1 / 2);

  // Botão IGNORAR
  let bx2 = cx + 84, by2 = cy + 186, bw2 = 68, bh2 = 28;
  fill(mouseOverRect(bx2, by2, bw2, bh2) ? color(215, 45, 45) : color(145, 22, 22));
  rect(bx2, by2, bw2, bh2, 4);
  fill(255);
  text("✖ IGNORAR", bx2 + bw2 / 2, by2 + bh2 / 2);

  // Rodapé
  fill(78, 158, 78);
  textSize(8);
  textAlign(CENTER);
  text("CHAMADO SUSTENTÁVEL — AGRINHO 2026", width / 2, height - 10);
  fill(110, 110, 130);
  textSize(7);
  text("[ o celular toca a cada momento — responda ao chamado ]", width / 2, height - 22);
}

// ============================================================
// ░░  TELA IGNORAR  ░░
// ============================================================
function drawIgnoreScreen() {
  background(52, 48, 42);
  fill(165, 135, 48, 105);
  noStroke();
  ellipse(95, 72, 52, 52);

  // Fumaça
  for (let i = 0; i < 4; i++) {
    let fy = 115 - (fCount * 0.5 + i * 22) % 85;
    fill(95, 95, 95, 75 - i * 14);
    ellipse(488 + i * 13, fy, 18 + i * 4, 18 + i * 4);
  }
  fill(118, 108, 98);
  rect(478, 198, 58, 102);
  rect(486, 178, 10, 24);
  rect(506, 168, 10, 34);

  // Chão rachado
  for (let x = 0; x < width; x += 40) {
    fill((x / 40) % 2 === 0 ? color(102,72,42) : color(85,60,36));
    rect(x, 272, 40, 128);
  }
  stroke(52, 32, 12, 175);
  strokeWeight(1);
  for (let i = 0; i < 14; i++) {
    let rx = 12 + i * 46;
    line(rx, 275, rx+13, 312);
    line(rx+13, 312, rx-3, 352);
    line(rx-3, 352, rx+9, 388);
  }
  noStroke();

  // Rio poluído
  fill(68, 78, 65);
  rect(0, 232, width, 42);
  fill(58, 68, 56);
  for (let x = 0; x < width; x += 32) {
    let ox = (x + fCount * 1.4) % (width + 32) - 16;
    rect(ox, 242, 22, 8, 3);
  }
  fill(38, 32, 48, 115);
  ellipse(195, 248, 58, 13);
  ellipse(425, 246, 78, 11);

  // Árvore morta
  stroke(62, 42, 22);
  strokeWeight(5);
  line(158, 252, 158, 142);
  line(158, 198, 192, 166);
  line(158, 181, 125, 155);
  line(158, 218, 180, 208);
  noStroke();

  // Caixa de texto
  fill(12, 12, 12, 212);
  rect(45, 40, 550, 175, 6);
  fill(222, 72, 72);
  textSize(13);
  textAlign(CENTER);
  text("⚠  CONSEQUÊNCIAS DO DESCUIDO  ⚠", width / 2, 68);
  fill(228, 212, 192);
  textSize(10);
  text("Quando ignoramos o equilíbrio entre produção e meio ambiente,", width / 2, 94);
  text("todos perdem. O solo racha e perde a fertilidade.", width / 2, 110);
  text("Os rios secam ou ficam poluídos. As florestas desaparecem.", width / 2, 126);
  text("Os animais somem e o próprio agronegócio enfraquece.", width / 2, 142);
  text("Sem natureza saudável, não há produção forte nem futuro.", width / 2, 158);
  fill(165, 212, 165);
  textSize(9);
  text("[ clique em qualquer lugar para voltar e atender ao chamado ]", width / 2, 196);
}

// ============================================================
// ░░  TUTORIAIS  ░░
// ============================================================
function drawTutorialBox(icon, title, lines, controlLines, btnLabel, titleCol, nextState) {
  // Fundo escurecido
  fill(8, 12, 22, 238);
  rect(0, 0, width, height);

  // Painel
  fill(16, 22, 36, 245);
  rect(22, 12, width - 44, height - 28, 10);

  // Faixa título
  fill(titleCol);
  rect(22, 12, width - 44, 44, 10, 10, 0, 0);

  // Ícone e título
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text(icon, 42, 46);
  textSize(13);
  textAlign(CENTER);
  text(title, width / 2 + 14, 46);

  // Separador
  stroke(100, 140, 100, 150);
  strokeWeight(1);
  line(40, 62, width - 40, 62);
  noStroke();

  // Linhas de conteúdo
  let y = 80;
  textSize(10);
  textAlign(LEFT);
  for (let ln of lines) {
    if (ln === "") { y += 7; continue; }
    if (ln.startsWith("►")) {
      fill(95, 215, 115);
      text("►", 40, y);
      fill(215, 232, 215);
      text(ln.substring(1).trim(), 56, y);
    } else if (ln.startsWith("⚠")) {
      fill(255, 198, 55);
      text(ln, 40, y);
    } else if (ln.startsWith("✔")) {
      fill(95, 252, 148);
      text(ln, 40, y);
    } else if (ln.startsWith("---")) {
      stroke(80, 120, 80, 140);
      strokeWeight(1);
      line(40, y - 4, width - 40, y - 4);
      noStroke();
      y -= 4;
    } else {
      fill(175, 195, 175);
      text(ln, 40, y);
    }
    y += 15;
  }

  // Área controles
  if (controlLines.length > 0) {
    y += 4;
    fill(18, 32, 18, 215);
    rect(30, y, width - 60, controlLines.length * 17 + 14, 6);
    y += 14;
    for (let cl of controlLines) {
      fill(255, 215, 85);
      textSize(9);
      textAlign(LEFT);
      text("⌨  " + cl, 42, y);
      y += 17;
    }
  }

  // Botão iniciar
  let bx = width / 2 - 120, by = height - 38, bw = 240, bh = 24;
  fill(mouseOverRect(bx, by, bw, bh) ? color(55, 205, 60) : color(28, 148, 32));
  rect(bx, by, bw, bh, 5);
  fill(255);
  textSize(11);
  textAlign(CENTER, CENTER);
  text(btnLabel, width / 2, by + bh / 2);
}

function drawTutorial1() {
  drawTutorialBox(
    "💧", "FASE 1 — ÁGUA E PRODUÇÃO",
    [
      "O QUE ESTÁ ACONTECENDO NO CAMPO:",
      "► 6 canos estão com vazamentos espalhados pelo terreno.",
      "► Cada vazamento desperdiça água vital para as lavouras.",
      "► A água escorre pelo chão sem ser aproveitada.",
      "► Sem água limpa e bem usada, as plantações morrem.",
      "",
      "O QUE VOCÊ PRECISA FAZER:",
      "► Mova seu personagem (operário do campo) pelo cenário.",
      "► Procure os canos com gotas de água caindo.",
      "► Quando estiver BEM PERTO do cano, use sua ferramenta.",
      "► Repita até consertar todos os 6 vazamentos.",
      "",
      "---",
      "✔ Canos piscam em AMARELO quando você está no alcance.",
      "✔ Após consertar, aparece ✔ verde — água economizada!",
      "✔ A barra no topo mostra seu progresso.",
      "",
      "⚠ Agro forte depende de água limpa e bem utilizada!",
    ],
    [
      "← → ↑ ↓  ou  W A S D  →  mover o personagem pelo campo",
      "E  ou  ESPAÇO   →  consertar o vazamento (quando estiver perto)",
      "P                →  pausar/despausar o jogo"
    ],
    "▶  COMEÇAR FASE 1 — ÁGUA E PRODUÇÃO",
    color(18, 75, 158),
    "fase1_agua"
  );
}

function drawTutorial2() {
  drawTutorialBox(
    "🌾", "FASE 2 — SOLO E PLANTIO",
    [
      "O QUE VOCÊ VÊ NA TELA:",
      "► Um mapa de tiles (quadradinhos) representando o solo.",
      "► MARROM ESCURO = solo DEGRADADO (sem vida, improdutivo).",
      "► VERDE MÉDIO   = LAVOURA simples (produzindo alimentos).",
      "► VERDE ESCURO  = área NATIVA (floresta preservada).",
      "► VERDE VIVO    = lavoura SAUDÁVEL (perto de área nativa).",
      "",
      "O QUE VOCÊ PRECISA FAZER:",
      "► Clique em qualquer tile para transformá-lo:",
      "   DEGRADADO → LAVOURA → NATIVO → LAVOURA (ciclo).",
      "► Mantenha PELO MENOS 15% da área como nativo.",
      "► A linha amarela na barra indica o mínimo de 15%.",
      "",
      "---",
      "✔ Lavoura PRÓXIMA a área nativa fica mais saudável.",
      "✔ Se nativo cair abaixo de 15%, o solo degrada sozinho!",
      "✔ Equilíbrio entre lavoura e mata = agro sustentável.",
      "",
      "⚠ Cuide do solo hoje para produzir amanhã e sempre!",
    ],
    [
      "CLIQUE no tile      →  muda o estado do solo (ciclo)",
      "Botão AVANÇAR       →  conclui a fase quando quiser",
      "P                →  pausar/despausar o jogo"
    ],
    "▶  COMEÇAR FASE 2 — SOLO E PLANTIO",
    color(65, 46, 12),
    "fase2_solo"
  );
}

function drawTutorial3() {
  drawTutorialBox(
    "🌳", "FASE 3 — FLORESTA, FAUNA E LAVOURA",
    [
      "O QUE ESTÁ ACONTECENDO:",
      "► A floresta nativa está sendo ameaçada.",
      "► A nascente (ponto azul) precisa de proteção urgente.",
      "► Os pássaros e borboletas dependem das árvores.",
      "► A saúde do rio depende das suas ações nesta fase.",
      "",
      "SUAS 3 MISSÕES (UMA DE CADA VEZ):",
      "► MISSÃO 1: Plante 5 árvores na faixa MARROM inferior.",
      "   Cada clique no solo marrom planta uma árvore nova.",
      "► MISSÃO 2: Coloque 4 cercas AO REDOR da nascente azul.",
      "   Clique perto do ponto azul para colocar cada cerca.",
      "► MISSÃO 3: A floresta foi preservada! Clique em CONCLUIR.",
      "",
      "---",
      "✔ Cada missão cumprida aumenta a saúde do rio.",
      "✔ Rio azul = ecossistema saudável = lavoura produtiva.",
      "✔ A nascente pisca em amarelo quando é a hora de cercá-la.",
      "",
      "⚠ Produzir E preservar ao mesmo tempo é possível!",
    ],
    [
      "CLIQUE no solo marrom    →  planta árvore nova (Missão 1)",
      "CLIQUE perto da nascente →  coloca cerca de proteção (Missão 2)",
      "Botão CONCLUIR FASE 3   →  finaliza após as 3 missões (Missão 3)",
      "P                →  pausar/despausar o jogo"
    ],
    "▶  COMEÇAR FASE 3 — FLORESTA, FAUNA E LAVOURA",
    color(18, 85, 28),
    "fase3_floresta"
  );
}

function drawTutorial4() {
  drawTutorialBox(
    "🚜", "FASE 4 — CAMPO, CIDADE E CONSUMO",
    [
      "O QUE ESTÁ ACONTECENDO:",
      "► O campo produziu alimentos frescos com equilíbrio.",
      "► A cidade espera receber esses alimentos a tempo.",
      "► Alimentos parados por muito tempo ESTRAGAM.",
      "► Cada alimento estragado = desperdício de água,",
      "   solo, sementes e trabalho de toda a cadeia do agro.",
      "",
      "O QUE VOCÊ PRECISA FAZER:",
      "► Arraste as caixas de alimento (lado ESQUERDO do campo).",
      "► Leve até o MERCADO ou até a ESCOLA (merenda escolar).",
      "► Cada caixa tem uma BARRA DE FRESCOR:",
      "   VERDE = fresco e pronto para entrega.",
      "   VERMELHO = quase estragando, entregue urgente!",
      "► Tente entregar todas sem deixar nenhuma estragar.",
      "",
      "---",
      "✔ Priorize as caixas com barra mais vermelha primeiro.",
      "✔ Cada entrega conecta campo e cidade sustentavelmente.",
      "",
      "⚠ Consumo consciente fecha o ciclo do agro sustentável!",
    ],
    [
      "CLIQUE + SEGURE na caixa  →  pega o alimento",
      "ARRASTE até o MERCADO      →  entrega no comércio",
      "ARRASTE até a ESCOLA       →  entrega na merenda escolar",
      "SOLTE o mouse              →  confirma a entrega",
      "P                →  pausar/despausar o jogo"
    ],
    "▶  COMEÇAR FASE 4 — CAMPO, CIDADE E CONSUMO",
    color(65, 42, 125),
    "fase4_intro" // NOVO: Aponta para o estado de introdução
  );
}

// ============================================================
// ░░  FASE 1 — ÁGUA E PRODUÇÃO  ░░
// ============================================================
function resetPhase1() {
  waterSaved    = 0;
  phase1Message = false;
  player = { x: 55, y: 305, w: 16, h: 24, speed: 3, dir: 1 };
  leaks  = [];
  for (let i = 0; i < 6; i++) {
    leaks.push({
      x: 95 + i * 90,
      y: 195 + (i % 3) * 42,
      fixed: false,
      drop: 0,
      fixAnim: 0 // Variável para animação de conserto
    });
  }
}

function drawWaterPhase() {
  // Fundo campo
  fill(118, 182, 118);
  rect(0, 0, width, height);
  // Céu
  fill(98, 178, 228);
  rect(0, 0, width, 108);

  // Nuvens
  fill(242, 246, 255);
  noStroke();
  for (let i = 0; i < 3; i++) {
    let cx = (75 + i * 195 + fCount * 0.38) % (width + 75) - 38;
    rect(cx, 16 + i * 14, 52, 18, 5);
    rect(cx + 10, 8 + i * 14, 32, 16, 5);
  }

  // HUD
  fill(14, 42, 72);
  rect(0, 0, width, 30);
  fill(108, 192, 252);
  textSize(10);
  textAlign(LEFT);
  text("💧 FASE 1 — ÁGUA E PRODUÇÃO", 10, 19);
  let fixedCount = leaks.filter(l => l.fixed).length;
  fill(255);
  textAlign(RIGHT);
  text("Consertados: " + fixedCount + " / 6", width - 10, 19);

  // Barra progresso
  fill(28, 58, 98);
  rect(0, 28, width, 6);
  fill(58, 158, 252);
  rect(0, 28, (fixedCount / 6) * width, 6);

  // Rio
  fill(48, 118, 198);
  rect(0, 110, width, 52);
  fill(68, 148, 222, 155);
  for (let x = 0; x < width; x += 52) {
    let ox = (fCount * 2 + x) % (width + 52) - 26;
    rect(ox, 122, 38, 10, 5);
  }
  // Pedras
  fill(78, 88, 98);
  ellipse(175, 130, 26, 12);
  ellipse(375, 124, 22, 10);
  ellipse(538, 132, 30, 11);

  // Solo e grama
  fill(82, 128, 52);
  rect(0, 160, width, height - 160);
  fill(68, 108, 42);
  for (let x = 0; x < width; x += 8) {
    rect(x, 160, 4, 5 + sin(x * 0.3) * 2);
  }

  // Plantações decorativas (direita)
  for (let i = 0; i < 12; i++) {
    let px = 488 + (i % 4) * 36;
    let py = 182 + floor(i / 4) * 30;
    fill(22, 108, 22);
    rect(px + 2, py + 8, 6, 20, 1);
    fill(42, 152, 32);
    rect(px - 2, py, 18, 15, 3);
    fill(62, 182, 48);
    rect(px + 2, py - 7, 10, 12, 3);
  }

  // Vazamentos
  for (let lk of leaks) {
    if (!lk.fixed) {
      lk.drop = (lk.drop + 1) % 60;
      let near = dist(player.x + 8, player.y + 12, lk.x + 6, lk.y) < 48;

      // Highlight de alcance
      if (near) {
        noFill();
        stroke(255, 222, 48, 155 + sin(fCount * 0.22) * 80);
        strokeWeight(2);
        rect(lk.x - 20, lk.y - 42, 54, 66, 5);
        noStroke();
        fill(255, 222, 48);
        textSize(8);
        textAlign(CENTER);
        text("[E] CONSERTAR", lk.x + 6, lk.y - 46);
      }

      // Cano
      fill(145, 145, 158);
      rect(lk.x, lk.y - 26, 13, 26);
      fill(162, 162, 175);
      rect(lk.x - 8, lk.y - 32, 28, 10, 3);
      // Anel de aviso vermelho
      fill(195, 48, 48);
      rect(lk.x + 1, lk.y - 12, 11, 4);

      // Gotas animadas
      for (let d = 0; d < 3; d++) {
        let dy = lk.y + (lk.drop + d * 20) % 60;
        let al = map((lk.drop + d * 20) % 60, 0, 60, 255, 0);
        fill(68, 148, 232, al);
        rect(lk.x + 2 + d * 3, dy, 5, 12, 3);
      }
      // Poça
      fill(58, 128, 198, 78);
      ellipse(lk.x + 6, lk.y + 70, 28, 9);

    } else {
      // Consertado
      fill(145, 145, 158);
      rect(lk.x, lk.y - 26, 13, 26);
      fill(162, 162, 175);
      rect(lk.x - 8, lk.y - 32, 28, 10, 3);
      fill(32, 182, 52);
      rect(lk.x - 4, lk.y - 8, 20, 10, 3);

      // Animação de conserto
      if (lk.fixAnim > 0) {
        lk.fixAnim++;
        let alpha = map(lk.fixAnim, 0, 30, 255, 0);
        let size = map(lk.fixAnim, 0, 30, 10, 20);
        fill(255, 255, 255, alpha);
        textSize(size);
        textAlign(CENTER);
        text("✔", lk.x + 6, lk.y + 4 - lk.fixAnim * 0.5); // Sobe e some
        if (lk.fixAnim > 30) lk.fixAnim = 0; // Reseta após a animação
      } else {
        fill(255);
        textSize(9);
        textAlign(CENTER);
        text("✔", lk.x + 6, lk.y + 4);
      }
    }
  }

  // Personagem
  drawPlayer();

  // Mensagem final
  if (phase1Message) {
    drawMessageBox(
      "💧 FASE 1 CONCLUÍDA!",
      ["Incrível! Você consertou todos os vazamentos!",
       "",
       "Você mostrou que agro forte depende de água",
       "limpa e bem utilizada. Cada gota economizada",
       "significa mais vida para lavouras, animais",
       "e comunidades rurais.",
       "",
       "Sem cuidado com a água, não existe",
       "futuro sustentável."],
      color(18, 88, 168),
      "tutorial2"
    );
  }

  // Instruções rodapé
  if (!phase1Message) {
    fill(8, 8, 8, 168);
    rect(8, height - 24, 478, 16, 3);
    fill(178, 222, 255);
    textSize(8);
    textAlign(LEFT);
    text("← → ↑ ↓  ou  W A S D  mover  |  [E] ou [ESPAÇO]  consertar vazamento  |  [P] pausar", 14, height - 12);
  }
}

function updatePlayer() {
  // Movimentação com setas
  if (keyIsDown(LEFT_ARROW))  { player.x -= player.speed; player.dir = -1; }
  if (keyIsDown(RIGHT_ARROW)) { player.x += player.speed; player.dir =  1; }
  if (keyIsDown(UP_ARROW))    player.y -= player.speed;
  if (keyIsDown(DOWN_ARROW))  player.y += player.speed;

  // Movimentação com WASD
  if (keyIsDown(87)) { player.y -= player.speed; } // W
  if (keyIsDown(83)) { player.y += player.speed; } // S
  if (keyIsDown(65)) { player.x -= player.speed; player.dir = -1; } // A
  if (keyIsDown(68)) { player.x += player.speed; player.dir =  1; } // D

  player.x = constrain(player.x, 0, width - player.w);
  player.y = constrain(player.y, 34, height - player.h - 4);
}

// Função para desenhar o sprite do player (reutilizável)
function drawPlayerSprite(x, y, dir) {
  let w = 16, h = 24;
  let moving = (narrativeTimer % 20 < 10); // Simula movimento para a narrativa
  let walk = sin(fCount * 0.28) * 4;

  push();
  translate(x, y);
  scale(dir, 1); // Vira o personagem

  // Sombra
  fill(0, 0, 0, 52);
  ellipse(8, h + 3, 20, 6);

  // Pernas
  fill(42, 68, 152);
  rect(2, 16, 5, 8 + (moving ? walk : 0), 1);
  rect(9, 16, 5, 8 - (moving ? walk : 0), 1);

  // Sapatos
  fill(28, 28, 28);
  rect(1, 23, 6, 4, 1);
  rect(9, 23, 6, 4, 1);

  // Corpo
  fill(52, 152, 68);
  rect(0, 8, w, 12);

  // Braço + ferramenta (simplificado para a narrativa)
  fill(52, 152, 68);
  rect(14, 9, 4, 9);
  fill(172, 132, 52);
  rect(16, 6, 4, 16, 1);

  // Cabeça
  fill(215, 165, 102);
  rect(2, 0, 12, 10, 2);
  fill(26, 26, 26);
  rect(10, 3, 3, 3); // Olho

  // Capacete
  fill(72, 132, 72);
  rect(0, -5, w, 7, 3);
  fill(58, 108, 58);
  rect(-2, -1, w + 4, 3);
  pop();
}

function drawPlayer() {
  if (!phase1Message) updatePlayer();
  drawPlayerSprite(player.x, player.y, player.dir);
}


// ============================================================
// ░░  FASE 2 — SOLO E PLANTIO  ░░
// ============================================================
function resetPhase2() {
  grid = [];
  phase2Message = false;
  degradTimer   = 0;
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      if (c < 3 || c >= COLS - 3 || r === 0 || r === ROWS - 1)
        grid[r][c] = {type: 2, anim: 0};
      else if (random() < 0.28)
        grid[r][c] = {type: 0, anim: 0};
      else
        grid[r][c] = {type: 1, anim: 0};
    }
  }
}

function countNative() {
  let n = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c].type === 2) n++;
  return n;
}

function drawSoilPhase() {
  background(82, 52, 22);

  // HUD
  fill(32, 52, 12);
  rect(0, 0, width, 30);
  fill(152, 212, 92);
  textSize(10);
  textAlign(LEFT);
  text("🌾 FASE 2 — SOLO E PLANTIO", 10, 19);

  nativeCount = countNative();
  let pct = floor((nativeCount / (COLS * ROWS)) * 100);
  fill(pct >= 15 ? color(98, 228, 98) : color(228, 78, 58));
  textAlign(RIGHT);
  text("Área nativa: " + pct + "%  (mín. 15%)", width - 10, 19);

  // Barra nativo
  fill(28, 48, 8);
  rect(0, 28, width, 6);
  fill(pct >= 15 ? color(58, 198, 58) : color(218, 58, 38));
  rect(0, 28, (pct / 100) * width, 6);
  stroke(255, 218, 0);
  strokeWeight(1);
  line(width * 0.15, 28, width * 0.15, 34);
  noStroke();

  // Tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = c * TILE, y = 34 + r * TILE;
      let tile = grid[r][c];
      let t = tile.type;

      // Animação de transição para tiles
      let animOffset = 0;
      if (tile.anim > 0) {
        tile.anim--;
        animOffset = map(tile.anim, 0, 10, 0, 4); // Pequeno "pop" ou "shake"
      }

      if (t === 0) { // Degradado
        fill(122 - animOffset*2, 82 - animOffset*2, 42 - animOffset*2);
        rect(x, y, TILE, TILE);
        stroke(92, 58, 22);
        strokeWeight(1);
        line(x+4,y+6,x+14,y+20);
        line(x+18,y+3,x+24,y+18);
        noStroke();
      } else if (t === 1) { // Lavoura simples
        fill(72 + animOffset*2, 132 + animOffset*2, 42 + animOffset*2);
        rect(x, y, TILE, TILE);
        fill(42, 92, 22);
        rect(x+5, y+3, 5, 22, 1);
        rect(x+14, y+7, 5, 18, 1);
        fill(92, 168, 52);
        rect(x+2, y+6, 10, 5, 2);
        rect(x+11, y+10, 10, 5, 2);
      } else if (t === 2) { // Nativo
        fill(26 + animOffset*2, 92 + animOffset*2, 36 + animOffset*2);
        rect(x, y, TILE, TILE);
        fill(16, 126, 46);
        rect(x+1, y+1, 14, 12, 2);
        rect(x+14, y+6, 12, 12, 2);
        rect(x+4, y+14, 14, 10, 2);
        fill(72, 46, 16);
        rect(x+6, y+20, 4, 10);
        rect(x+18, y+22, 3, 8);
      } else if (t === 3) { // Lavoura saudável
        fill(92 + animOffset*2, 172 + animOffset*2, 52 + animOffset*2);
        rect(x, y, TILE, TILE);
        fill(52, 122, 26);
        rect(x+4, y+1, 7, 28, 1);
        fill(112, 198, 72);
        rect(x+1, y+5, 12, 6, 2);
        rect(x+1, y+14, 12, 6, 2);
        rect(x+1, y+22, 12, 6, 2);
        fill(252, 218, 58);
        rect(x+22, y+4, 5, 5, 2);
      }

      // Grade
      stroke(0, 0, 0, 20);
      strokeWeight(1);
      noFill();
      rect(x, y, TILE, TILE);
      noStroke();

      // Hover
      if (!phase2Message &&
          mouseX > x && mouseX < x + TILE &&
          mouseY > y && mouseY < y + TILE) {
        fill(255, 255, 255, 38);
        rect(x, y, TILE, TILE);
      }
    }
  }

  // Degradação automática
  if (!phase2Message) {
    degradTimer++;
    if (degradTimer > 200 && pct < 15) {
      for (let i = 0; i < 2; i++) {
        let rr = floor(random(ROWS)), cc = floor(random(COLS));
        if (grid[rr][cc].type === 1 || grid[rr][cc].type === 3) {
          grid[rr][cc].type = 0;
          grid[rr][cc].anim = 10; // Inicia animação de degradação
        }
      }
      degradTimer = 0;
    }

    // Lavouras saudáveis perto do nativo
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (grid[r][c].type === 1) {
          let adj = [grid[r-1][c].type,grid[r+1][c].type,grid[r][c-1].type,grid[r][c+1].type];
          if (adj.some(v => v === 2)) {
            grid[r][c].type = 3;
            grid[r][c].anim = 10; // Inicia animação de crescimento
          }
        }
        if (grid[r][c].type === 3) {
          let adj = [grid[r-1][c].type,grid[r+1][c].type,grid[r][c-1].type,grid[r][c+1].type];
          if (!adj.some(v => v === 2)) {
            grid[r][c].type = 1;
            grid[r][c].anim = 10; // Inicia animação de regressão
          }
        }
      }
    }

    // Aviso % baixo
    if (pct < 15) {
      fill(215, 58, 38, 198);
      rect(8, height - 46, width - 16, 18, 3);
      fill(255);
      textSize(9);
      textAlign(CENTER);
      text("⚠ ALERTA: Área nativa abaixo de 15%! O solo está degradando automaticamente!", width/2, height-33);
    }
  }

  // Botão avançar
  if (!phase2Message) {
    let bx = width/2-90, by = height-24, bw = 180, bh = 20;
    fill(mouseOverRect(bx,by,bw,bh) ? color(72,182,72) : color(42,128,42));
    rect(bx, by, bw, bh, 4);
    fill(255);
    textSize(9);
    textAlign(CENTER, CENTER);
    text("AVANÇAR PARA FASE 3 →", bx+bw/2, by+bh/2);

    fill(8,8,8,152);
    rect(8, height - 24 - 18, 500, 15, 3);
    fill(212, 192, 152);
    textSize(8);
    textAlign(LEFT);
    text("[CLIQUE] tile: degradado→lavoura | lavoura→nativo | nativo→lavoura  |  [P] pausar", 14, height-29);
  }

  if (phase2Message) {
    drawMessageBox(
      "🌾 FASE 2 CONCLUÍDA!",
      ["Muito bem! Você entendeu o segredo do solo.",
       "",
       "Agro forte não é só produzir muito hoje.",
       "É cuidar do solo para continuar produzindo",
       "amanhã e nas próximas gerações.",
       "",
       "Lavouras próximas a áreas nativas ficam mais",
       "saudáveis — isso é equilíbrio em ação!",
       "",
       "Solo saudável = a raiz do agro sustentável."],
      color(68, 46, 10),
      "tutorial3"
    );
  }
}

// ============================================================
// ░░  FASE 3 — FLORESTA, FAUNA E LAVOURA  ░░
// ============================================================
function resetPhase3() {
  phase3Message   = false;
  riverHealth3    = 100;
  currentMission3 = 0;
  plantedTrees3   = 0;
  trees3  = [];
  fences3 = [];
  animals3 = [];

  for (let i = 0; i < 14; i++) {
    trees3.push({
      x: 16 + i * 25,
      y: 72 + (i % 4) * 26,
      alive: true,
      size: 16 + (i % 3) * 5,
      sway: random(TWO_PI)
    });
  }

  for (let i = 0; i < 7; i++) {
    animals3.push({
      x: random(60, 560),
      y: random(52, 200),
      vx: random([-0.8, 0.8]),
      vy: random(-0.3, 0.3),
      anim: random(TWO_PI),
      alive: true
    });
  }

  missions3 = [
    { text: "MISSÃO 1/3: Plante 5 árvores na faixa MARROM abaixo (clique no solo marrom)", goal: "plant5",   done: false },
    { text: "MISSÃO 2/3: Proteja a nascente! Coloque 4 cercas perto do ponto AZUL",         goal: "fence4",   done: false },
    { text: "MISSÃO 3/3: Floresta preservada! Clique em CONCLUIR FASE 3 para avançar.",     goal: "preserve", done: false }
  ];
}

function drawForestPhase() {
  // Céu
  fill(92, 172, 232);
  rect(0, 0, width, 118);

  // Nuvens
  fill(243, 247, 255);
  noStroke();
  for (let i = 0; i < 4; i++) {
    let cx = (48 + i * 152 + fCount * 0.24) % (width + 60) - 30;
    rect(cx, 14 + (i%2)*18, 53, 17, 5);
    rect(cx+11, 7+(i%2)*18, 31, 15, 5);
  }

  // HUD
  fill(16, 36, 16, 208);
  rect(0, 0, width, 28);
  fill(152, 232, 112);
  textSize(10);
  textAlign(LEFT);
  text("🌳 FASE 3 — FLORESTA, FAUNA E LAVOURA", 10, 18);
  fill(28, 48, 28);
  rect(415, 7, 202, 12, 3);
  fill(lerpColor(color(178,48,48), color(48,158,228), riverHealth3/100));
  rect(415, 7, riverHealth3 * 2, 12, 3);
  fill(198, 228, 255);
  textSize(8);
  textAlign(RIGHT);
  text("🌊 Rio: " + riverHealth3 + "%", width - 10, 18);

  // Floresta nativa
  fill(23, 82, 30);
  rect(0, 118, 392, 138);

  // Lavoura (direita)
  fill(80, 148, 52);
  rect(390, 118, 250, 138);
  for (let i = 0; i < 8; i++) {
    fill(43, 102, 26);
    rect(400+(i%4)*52, 128+floor(i/4)*55, 18, 42, 2);
    fill(102, 182, 58);
    rect(402+(i%4)*52, 121, 14, 11, 2);
  }

  // Solo degradado
  fill(130, 88, 46);
  rect(0, 255, width, 78);
  stroke(98, 62, 26);
  strokeWeight(1);
  for (let x = 7; x < width; x += 34) {
    line(x, 258, x+13, 283);
    line(x+13, 283, x+3, 308);
  }
  noStroke();
  // Label área plantio
  fill(252, 228, 120);
  textSize(8);
  textAlign(CENTER);
  text("▼ ÁREA DEGRADADA — CLIQUE AQUI PARA PLANTAR ÁRVORES (MISSÃO 1) ▼", width/2, 248);

  // Rio
  let rc = lerpColor(color(122,82,46), color(52,132,212), riverHealth3/100);
  fill(rc);
  rect(0, 331, width, 69);
  fill(255,255,255,33);
  for (let x = 0; x < width; x += 46) {
    let ox = (fCount + x) % width;
    rect(ox, 343, 27, 6, 3);
  }

  // Árvores existentes
  for (let t of trees3) {
    t.sway += 0.019;
    let sw = sin(t.sway) * 2;
    if (!t.alive) {
      fill(92, 62, 26);
      rect(t.x-3, t.y+t.size, 10, 10);
    } else {
      fill(92, 60, 26);
      rect(t.x+sw, t.y+t.size-2, 8, 17);
      fill(26, 112, 36);
      rect(t.x-t.size/2+4+sw, t.y, t.size, t.size, 3);
      fill(46, 152, 56);
      rect(t.x-t.size/2+8+sw, t.y-7, t.size-8, t.size-4, 3);

      // Animação de plantio
      if (t.plantAnim > 0) {
        t.plantAnim--;
        let scaleFactor = map(t.plantAnim, 0, 30, 1, 0.5); // Cresce de 0.5 para 1
        push();
        translate(t.x + sw + 4, t.y + t.size / 2);
        scale(scaleFactor);
        fill(255, 255, 255, map(t.plantAnim, 0, 30, 0, 200));
        textSize(12);
        textAlign(CENTER, CENTER);
        text("🌱", 0, 0);
        pop();
      }
    }
  }

  // Cercas
  for (let f of fences3) {
    fill(152, 102, 56);
    rect(f.x-5, f.y-5, 10, 10, 1);
    stroke(172, 122, 66);
    strokeWeight(2);
    line(f.x, f.y-5, f.x, f.y+5);
    noStroke();

    // Animação de cerca
    if (f.fenceAnim > 0) {
      f.fenceAnim--;
      let alpha = map(f.fenceAnim, 0, 30, 255, 0);
      fill(255, 255, 255, alpha);
      textSize(12);
      textAlign(CENTER, CENTER);
      text("🔨", f.x, f.y - f.fenceAnim * 0.5);
    }
  }

  // Nascente
  fill(52, 112, 212);
  ellipse(200, 292, 33, 33);
  fill(92, 172, 252, 128);
  ellipse(200, 292, 21, 21);
  fill(212, 238, 255);
  ellipse(200, 292, 9, 9);
  fill(198, 236, 255);
  textSize(7);
  textAlign(CENTER);
  text("NASCENTE", 200, 313);

  // Pulso amarelo quando missão 2
  if (currentMission3 === 1) {
    noFill();
    stroke(255, 228, 58, 140 + sin(fCount*0.12)*80);
    strokeWeight(2);
    ellipse(200, 292, 68+sin(fCount*0.09)*8, 68+sin(fCount*0.09)*8);
    noStroke();
  }

  // Animais (pássaros / borboletas)
  for (let a of animals3) {
    if (!a.alive) continue;
    a.anim += 0.06;
    a.x  += a.vx;
    a.y  += a.vy + sin(a.anim) * 0.38;
    if (a.x < 8 || a.x > width-8) a.vx *= -1;
    if (a.y < 48 || a.y > 208)    a.vy *= -1;
    // Pássaro pixel
    fill(252, 158, 28);
    rect(a.x, a.y, 10, 6, 2);
    fill(78, 38, 8);
    rect(a.x+8, a.y-3, 4, 4, 1);
    fill(252, 98, 18);
    rect(a.x-2, a.y+1, 4, 4, 1);
    // Asas batendo
    fill(255, 200, 60, sin(a.anim*3)*128+128);
    rect(a.x+1, a.y-4, 8, 4, 1);
  }

  // HUD missão
  if (!phase3Message && currentMission3 < missions3.length) {
    let m = missions3[currentMission3];
    fill(12, 12, 12, 208);
    rect(8, height-52, width-16, 46, 4);
    fill(252, 218, 78);
    textSize(10);
    textAlign(LEFT);
    text(m.text, 14, height-34);
    fill(178, 178, 178);
    textSize(8);
    text("Árvores plantadas: " + plantedTrees3 + " / 5    |    Cercas colocadas: " + fences3.length + " / 4  |  [P] pausar", 14, height-18);

    // Verificar conclusões
    if (m.goal === "plant5" && plantedTrees3 >= 5 && !m.done) {
      m.done = true;
      currentMission3++;
      riverHealth3 = min(100, riverHealth3 + 20);
      playSoundPhaseDone();
    }
    if (m.goal === "fence4" && fences3.length >= 4 && !m.done) {
      m.done = true;
      currentMission3++;
      riverHealth3 = min(100, riverHealth3 + 20);
      playSoundPhaseDone();
    }

    // Botão concluir missão 3
    if (currentMission3 === 2) {
      let bx = width/2-90, by = height-22, bw = 180, bh = 18;
      fill(mouseOverRect(bx,by,bw,bh)?color(58,202,58):color(28,148,32));
      rect(bx, by, bw, bh, 4);
      fill(255);
      textSize(9);
      textAlign(CENTER, CENTER);
      text("CONCLUIR FASE 3 →", bx+bw/2, by+bh/2);
    }
  }

  if (phase3Message) {
    drawMessageBox(
      "🌳 FASE 3 CONCLUÍDA!",
      ["Excelente trabalho de conservação!",
       "",
       "Agro forte e futuro sustentável significam",
       "produzir e preservar ao mesmo tempo.",
       "Você plantou árvores, protegeu a nascente",
       "e manteve os animais no ecossistema.",
       "",
       "Não é escolher entre lavoura ou floresta:",
       "é encontrar o EQUILÍBRIO entre os dois."],
      color(18, 88, 26),
      "tutorial4"
    );
  }
}

// ============================================================
// ░░  INTRODUÇÃO FASE 4 — NARRATIVA  ░░
// ============================================================
function drawNarrativeIntro4() {
  drawCampoCidadeBackground(); // Função auxiliar para desenhar o fundo sem a lógica do jogo

  // Personagem andando
  let playerX = map(narrativeTimer, 0, 180, -50, width / 2 - 100); // Anda da esquerda para o centro
  let playerY = height - 60; // Posição na parte inferior da tela

  // Desenha o personagem (operário da Fase 1)
  push();
  translate(playerX, playerY);
  scale(1.5); // Aumenta um pouco o tamanho para destaque
  drawPlayerSprite(0, 0, 1); // Reutiliza o sprite do player, virado para a direita
  pop();

  // Balão de fala
  if (narrativeTimer > 60) { // Começa a mostrar o balão depois de um tempo
    let bubbleX = playerX + 80;
    let bubbleY = playerY - 80;
    let bubbleW = 200;
    let bubbleH = 70;

    fill(255, 255, 255, 230);
    rect(bubbleX, bubbleY, bubbleW, bubbleH, 10);
    triangle(bubbleX + 20, bubbleY + bubbleH, bubbleX + 40, bubbleY + bubbleH, playerX + 20, playerY - 10);

    fill(50);
    textSize(10);
    textAlign(LEFT, TOP);
    text(narrativeText, bubbleX + 10, bubbleY + 10, bubbleW - 20, bubbleH - 20);
  }

  // Atualiza a narrativa
  narrativeTimer++;
  if (narrativeTimer === 1) {
    narrativeText = "Chegamos na parte importante: levar os alimentos até a cidade!";
  } else if (narrativeTimer === 180) { // Tempo para a primeira fala
    narrativeText = "Não demore, se não os produtos irão estragar!";
  } else if (narrativeTimer > 360) { // Tempo para a segunda fala e transição
    gameState = "fase4campocidade";
    narrativeTimer = 0; // Reseta para a próxima vez
    narrativeText = "";
  }
}

// NOVO: Função auxiliar para desenhar o fundo da Fase 4
function drawCampoCidadeBackground() {
  // Campo (esquerda)
  fill(98, 168, 68);
  rect(0, 0, 308, height);
  // Cidade (direita)
  fill(148, 148, 158);
  rect(308, 0, width-308, height);
  // Divisória (estrada)
  fill(118, 108, 88);
  rect(304, 0, 8, height);
  fill(248, 228, 0);
  for (let y = 0; y < height; y += 28) {
    rect(307, (y + fCount * 2) % height, 2, 14);
  }

  // Sol
  fill(252, 222, 58);
  noStroke();
  ellipse(58, 65, 42, 42);
  fill(252, 238, 98, 178);
  for (let a = 0; a < 360; a += 45) {
    let rx = 58 + cos(radians(a + fCount * 0.5)) * 28;
    let ry = 65 + sin(radians(a + fCount * 0.5)) * 28;
    rect(rx-2, ry-2, 4, 4);
  }

  // Plantações decorativas campo
  for (let i = 0; i < 5; i++) {
    fill(42, 112, 32);
    rect(172 + i*24, 238, 14, 32, 2);
    fill(68, 152, 48);
    rect(169 + i*24, 226, 20, 14, 3);
    fill(92, 188, 62);
    rect(173 + i*24, 218, 12, 10, 3);
  }

  // Trator pixel
  fill(212, 72, 28);
  rect(168, 298, 68, 32);
  fill(175, 55, 18);
  rect(158, 308, 22, 22);
  fill(28, 28, 28);
  ellipse(172, 330, 18, 18);
  ellipse(218, 330, 18, 18);
  fill(48, 48, 48);
  ellipse(172, 330, 10, 10);
  ellipse(218, 330, 10, 10);
  fill(238, 198, 58);
  rect(230, 301, 10, 9);
  fill(252, 228, 78);
  rect(232, 296, 6, 6);
  // Janela trator
  fill(158, 218, 252);
  rect(192, 302, 22, 16, 2);
  fill(0, 0, 0, 60);
  rect(194, 304, 18, 12, 1);

  // Label CAMPO
  fill(255, 255, 255, 188);
  textSize(11);
  textAlign(CENTER);
  text("C  A  M  P  O", 154, 52);
  fill(188, 232, 148);
  textSize(8);
  text("Arraste as caixas para a cidade →", 154, 65);

  // ---- CIDADE (direita) ----
  // Prédios pixel
  let predios = [
    {x:324, y:72,  w:48, h:152, c:color(128,128,158)},
    {x:382, y:108, w:40, h:116, c:color(118,118,148)},
    {x:432, y:58,  w:58, h:166, c:color(138,138,168)},
    {x:500, y:94,  w:46, h:130, c:color(124,124,154)},
    {x:556, y:132, w:72, h: 92, c:color(114,114,144)},
  ];
  for (let p of predios) {
    fill(p.c);
    rect(p.x, p.y, p.w, p.h);
    // telhado
    fill(red(p.c)-18, green(p.c)-18, blue(p.c)+12);
    rect(p.x, p.y, p.w, 8);
    // janelas
    fill(252, 238, 148, 185);
    for (let wy = p.y+14; wy < p.y+p.h-18; wy+=22) {
      for (let wx = p.x+7; wx < p.x+p.w-7; wx+=17) {
        rect(wx, wy, 10, 13, 1);
        // persiana
        fill(228, 208, 108, 100);
        rect(wx, wy, 10, 4);
        fill(252, 238, 148, 185);
      }
    }
  }

  // Calçada
  fill(168, 162, 152);
  rect(312, 262, width-312, 22);
  stroke(148, 142, 132);
  strokeWeight(1);
  for (let x = 312; x < width; x += 24) {
    line(x, 262, x, 284);
  }
  noStroke();

  // MERCADO pixel
  fill(72, 55, 148);
  rect(322, 284, 108, 68);
  fill(88, 68, 172);
  rect(322, 284, 108, 18); // faixa superior
  fill(252, 248, 255);
  textSize(9);
  textAlign(CENTER);
  text("MERCADO", 376, 297);
  // porta mercado
  fill(48, 38, 102);
  rect(358, 318, 36, 34);
  fill(128, 108, 228, 148);
  rect(360, 320, 16, 30);
  rect(378, 320, 14, 30);
  // luminoso piscando
  fill(fCount%40<20 ? color(252,58,58) : color(198,38,38));
  rect(334, 288, 28, 8, 2);
  fill(255);
  textSize(6);
  text("ABERTO", 348, 296);

  // ESCOLA pixel
  fill(198, 158, 38);
  rect(448, 284, 98, 68);
  // telhado escola
  fill(175, 75, 35);
  triangle(438, 284, 556, 284, 497, 254);
  // janelas escola
  fill(248, 218, 98);
  rect(458, 294, 18, 18, 1);
  rect(518, 294, 18, 18, 1);
  // porta escola
  fill(138, 88, 28);
  rect(484, 318, 28, 34);
  // placa escola
  fill(252, 252, 252);
  rect(452, 308, 90, 22, 2);
  fill(48, 78, 148);
  textSize(7);
  textAlign(CENTER);
  text("ESCOLA / MERENDA", 497, 322);

  // Setas indicativas (animadas)
  if (score4 < 6) {
    fill(252, 228, 58, 148 + sin(fCount * 0.08) * 80);
    textSize(16);
    textAlign(CENTER);
    text("→", 296 + sin(fCount*0.1)*4, 155);
    text("→", 296 + sin(fCount*0.1+1)*4, 215);
  }

  // Label CIDADE
  fill(255, 255, 255, 188);
  textSize(11);
  textAlign(CENTER);
  text("C  I  D  A  D  E", 480, 52);
  fill(218, 218, 248);
  textSize(8);
  text("Mercado e Escola aguardam entrega", 480, 65);
}

// ============================================================
// ░░  FASE 4 — CAMPO, CIDADE E CONSUMO  ░░
// ============================================================
function resetPhase4() {
  boxes4 = [];
  score4 = 0;
  spoiled4 = 0;
  phase4Message = false;
  dragBox = null;

  let items = [
    {label:"🌽 MILHO",    x:28,  y:80},
    {label:"🥕 CENOURA",  x:28,  y:148},
    {label:"🍅 TOMATE",   x:28,  y:216},
    {label:"🌾 TRIGO",    x:115, y:80},
    {label:"🥦 BRÓCOLIS", x:115, y:148},
    {label:"🍎 MAÇÃ",     x:115, y:216},
  ];
  for (let it of items) {
    boxes4.push({
      x: it.x, y: it.y, w: 78, h: 52,
      label: it.label,
      state: "fresh",
      timer: 0,
      dragging: false,
      ox: 0, oy: 0,
      spoilSounded: false,
      deliveryAnim: 0 // Animação de entrega
    });
  }
}

function drawCampoCidadePhase() {
  drawCampoCidadeBackground(); // Desenha o fundo comum da Fase 4

  // HUD
  fill(18, 28, 18, 218);
  rect(0, 0, width, 28);
  fill(178, 238, 118);
  textSize(10);
  textAlign(LEFT);
  text("🚜 FASE 4 — CAMPO, CIDADE E CONSUMO", 10, 18);
  fill(252, 218, 78);
  textAlign(RIGHT);
  text("Entregues: " + score4 + "  |  Estragados: " + spoiled4 + "  |  [P] pausar", width - 10, 18);

  // Barra de progresso entregas
  fill(22, 38, 12);
  rect(0, 26, width, 6);
  fill(78, 198, 78);
  rect(0, 26, (score4 / 6) * width, 6);

  // ---- CAIXAS DE ALIMENTO ----
  for (let b of boxes4) {
    if (b.state === "delivered") {
      // Animação de entrega
      if (b.deliveryAnim > 0) {
        b.deliveryAnim++;
        let alpha = map(b.deliveryAnim, 0, 30, 255, 0);
        let size = map(b.deliveryAnim, 0, 30, 10, 20);
        fill(48, 192, 68, alpha);
        textSize(size);
        textAlign(CENTER, CENTER);
        text("✔ ENTREGUE!", b.x + b.w/2, b.y + b.h/2 - b.deliveryAnim * 0.5);
        if (b.deliveryAnim > 30) b.deliveryAnim = 0; // Reseta após a animação
      }
      continue;
    }

    // Timer de apodrecimento
    if (!b.dragging && b.state === "fresh") {
      b.timer++;
      if (b.timer > 420) {
        b.state = "spoiled";
        spoiled4++;
        if (!b.spoilSounded) {
          playSoundSpoil();
          b.spoilSounded = true;
        }
      }
    }

    // Caixa principal
    let freshPct = 1 - (b.timer / 420);
    if (b.state === "fresh") {
      fill(lerpColor(color(158,88,28), color(208,178,82), freshPct));
    } else {
      fill(88, 62, 28);
    }
    rect(b.x, b.y, b.w, b.h, 4);

    // Textura madeira
    stroke(0, 0, 0, 28);
    strokeWeight(1);
    line(b.x+2, b.y+18, b.x+b.w-2, b.y+18);
    line(b.x+2, b.y+34, b.x+b.w-2, b.y+34);
    line(b.x+b.w/2, b.y+2, b.x+b.w/2, b.y+b.h-8);
    noStroke();

    // Barra de frescor
    fill(28, 28, 28);
    rect(b.x+2, b.y+b.h-9, b.w-4, 6, 2);
    fill(lerpColor(color(215,52,42), color(52,215,72), freshPct));
    rect(b.x+2, b.y+b.h-9, (b.w-4)*freshPct, 6, 2);

    // Label alimento
    fill(b.state === "fresh" ? 32 : 155);
    textSize(8);
    textAlign(CENTER, CENTER);
    text(b.label, b.x+b.w/2, b.y+b.h/2-5);

    // Estragado
    if (b.state === "spoiled") {
      fill(198, 52, 52, 218);
      rect(b.x, b.y, b.w, b.h, 4);
      fill(255);
      textSize(9);
      textAlign(CENTER, CENTER);
      text("✖ ESTRAGOU", b.x+b.w/2, b.y+b.h/2-4);
      textSize(7);
      text("desperdício!", b.x+b.w/2, b.y+b.h/2+8);
    }

    // Highlight hover
    if (b.state === "fresh" && mouseOverRect(b.x, b.y, b.w, b.h) && !dragBox) {
      noFill();
      stroke(252, 228, 58, 188);
      strokeWeight(2);
      rect(b.x-2, b.y-2, b.w+4, b.h+4, 5);
      noStroke();
      fill(252, 228, 58);
      textSize(7);
      textAlign(CENTER);
      text("CLIQUE E ARRASTE", b.x+b.w/2, b.y-6);
    }

    // Posição durante arrasto
    if (b.dragging) {
      b.x = mouseX - b.ox;
      b.y = mouseY - b.oy;
      // Sombra de arrasto
      fill(0, 0, 0, 58);
      rect(b.x+5, b.y+5, b.w, b.h, 4);
    }

    // Verificar entrega no MERCADO
    if (!b.dragging && b.state === "fresh") {
      if (b.x + b.w/2 > 318 && b.x + b.w/2 < 438 && b.y + b.h > 278 && b.y < 358) {
        b.state = "delivered";
        score4++;
        playSoundDeliver();
        b.deliveryAnim = 1; // Inicia a animação de entrega
      }
      // Verificar entrega na ESCOLA
      if (b.x + b.w/2 > 444 && b.x + b.w/2 < 550 && b.y + b.h > 278 && b.y < 358) {
        b.state = "delivered";
        score4++;
        playSoundDeliver();
        b.deliveryAnim = 1; // Inicia a animação de entrega
      }
    }
  }

  // Contagem de estragados atualizada
  spoiled4 = boxes4.filter(b => b.state === "spoiled").length;

  // NOVO: Verifica se todas as caixas foram entregues para ativar a mensagem
  if (!phase4Message && score4 === 6) {
    phase4Message = true;
    playSoundPhaseDone(); // Toca o som de fase concluída
  }

  // Botão avançar (só aparece se a fase não estiver concluída)
  if (!phase4Message) {
    let bx = width/2-95, by = height-26, bw = 190, bh = 20;
    fill(mouseOverRect(bx, by, bw, bh) ? color(72,182,72) : color(42,128,42));
    rect(bx, by, bw, bh, 4);
    fill(255);
    textSize(9);
    textAlign(CENTER, CENTER);
    text("CONCLUIR FASE 4 → TELA FINAL", bx+bw/2, by+bh/2);

    // Instrução arrasto
    fill(8,8,8,158);
    rect(8, height-26-17, 290, 14, 3);
    fill(212, 228, 252);
    textSize(7);
    textAlign(LEFT);
    text("CLIQUE + ARRASTE a caixa até Mercado ou Escola", 13, height-35);
  }

  // Mensagem de conclusão
  if (phase4Message) {
    // Resultado personalizado
    let titulo = score4 === 6 ? "🏆 FASE 4 CONCLUÍDA COM EXCELÊNCIA!" : "✔ FASE 4 CONCLUÍDA!";
    let bonus  = score4 === 6 ? "Você entregou TUDO sem desperdício! Parabéns!" :
                 score4 >= 4  ? "Boa entrega! Tente reduzir o desperdício da próxima vez." :
                                "Atenção ao desperdício — cada alimento tem valor!";
    drawMessageBox(
      titulo,
      ["Quando o campo produz com equilíbrio",
       "e a cidade consome com consciência,",
       "todo mundo ganha: o agro,",
       "o meio ambiente e as pessoas.",
       "",
       bonus,
       "",
       "Entregas: " + score4 + " / 6   |   Estragados: " + spoiled4 + " / 6"],
      color(62, 42, 122),
      "final"
    );
  }
}

// ============================================================
// ░░  TELA FINAL  ░░
// ============================================================
function drawFinalScreen() {
  // Gradiente de céu
  for (let y = 0; y < 220; y++) {
    stroke(lerpColor(color(88,172,238), color(148,212,252), y/220));
    line(0, y, width, y);
  }
  noStroke();

  // Sol com raios
  fill(252, 228, 58);
  ellipse(width-90, 68, 72, 72);
  fill(252, 238, 98, 178);
  for (let a = 0; a < 360; a += 45) {
    let rx = (width-90) + cos(radians(a + fCount*0.3)) * 48;
    let ry = 68 + sin(radians(a + fCount*0.3)) * 48;
    rect(rx-3, ry-3, 6, 6);
  }

  // Colinas
  fill(58, 148, 58);
  ellipse(95,  378, 318, 168);
  ellipse(358, 395, 418, 148);
  ellipse(618, 372, 338, 168);

  // Rio
  fill(58, 138, 218);
  rect(0, 348, width, 52);
  fill(88, 168, 248, 118);
  for (let x = 0; x < width; x += 52) {
    let ox = (fCount*1.2 + x) % (width+52) - 26;
    rect(ox, 358, 35, 8, 4);
  }
  // Reflexo no rio
  fill(255, 255, 255, 38);
  rect(0, 348, width, 12);

  // Árvores pixel (espalhadas)
  let treePositions = [38, 118, 205, 448, 528, 602];
  for (let tx of treePositions) {
    fill(78, 48, 18);
    rect(tx+5, 295, 9, 46);
    fill(28, 118, 38);
    rect(tx-2, 262, 22, 34, 3);
    fill(48, 155, 58);
    rect(tx+2, 252, 14, 16, 3);
    fill(68, 178, 72);
    rect(tx+5, 244, 8, 12, 3);
    // Frutos
    fill(218, 58, 38);
    rect(tx+1, 270, 4, 4, 2);
    rect(tx+14, 275, 4, 4, 2);
  }

  // Lavoura
  for (let i = 0; i < 9; i++) {
    fill(78, 158, 48);
    rect(248+i*22, 308, 15, 36, 2);
    fill(118, 198, 68);
    rect(250+i*22, 300, 11, 10, 2);
    fill(148, 228, 88);
    rect(252+i*22, 293, 7, 8, 2);
  }

  // Escola pixel
  fill(215, 165, 55);
  rect(272, 228, 92, 78);
  fill(178, 72, 32);
  triangle(262, 228, 374, 228, 318, 192);
  // Janelas escola
  fill(248, 218, 98);
  rect(282, 240, 18, 18, 1);
  rect(340, 240, 18, 18, 1);
  // Porta escola
  fill(138, 88, 28);
  rect(306, 264, 24, 42);
  fill(178, 118, 48);
  rect(308, 266, 10, 38);
  // Placa escola
  fill(252, 252, 252);
  rect(274, 256, 88, 14, 2);
  fill(38, 58, 138);
  textSize(7);
  textAlign(CENTER);
  text("SÃO CRISTÓVÃO", 318, 267);
  // Bandeira
  fill(88, 148, 252);
  rect(364, 192, 2, 28);
  fill(28, 198, 78);
  rect(366, 192, 22, 14);
  fill(252, 228, 18);
  ellipse(375, 199, 10, 10);

  // Personagens pixel (comunidade)
  let personagens = [
    {x:158, skin:color(215,165,102), shirt:color(52,142,218)},
    {x:180, skin:color(178,118,68),  shirt:color(218,72,42)},
    {x:392, skin:color(215,158,92),  shirt:color(48,178,72)},
    {x:414, skin:color(188,132,78),  shirt:color(178,52,148)},
    {x:436, skin:color(228,178,112), shirt:color(52,112,198)},
  ];
  for (let ch of personagens) {
    // Sombra
    fill(0,0,0,42);
    ellipse(ch.x+7, 352, 17, 5);
    // Pernas
    fill(38, 58, 128);
    rect(ch.x+2, 338, 5, 12);
    rect(ch.x+9, 338, 5, 12);
    // Corpo
    fill(ch.shirt);
    rect(ch.x, 325, 16, 15);
    // Cabeça
    fill(ch.skin);
    rect(ch.x+2, 314, 12, 12, 2);
    // Olho
    fill(28,28,28);
    rect(ch.x+9, 318, 3, 3);
    // Cabelo
    fill(58,38,18);
    rect(ch.x+2, 314, 12, 4, 2);
    // Braços levantados (celebrando)
    fill(ch.shirt);
    rect(ch.x-3, 324, 4, 8);
    rect(ch.x+15, 324, 4, 8);
    fill(ch.skin);
    rect(ch.x-4, 320, 5, 6);
    rect(ch.x+15, 320, 5, 6);
  }

  // ---- CELULAR COM MENSAGEM FINAL ----
  let cx = 402, cy = 34, cw = 222, ch2 = 256;
  // Sombra do celular
  fill(0,0,0,58);
  rect(cx+6, cy+6, cw, ch2, 12);
  // Corpo
  fill(45, 48, 62);
  stroke(115, 118, 135);
  strokeWeight(2);
  rect(cx, cy, cw, ch2, 12);
  noStroke();
  // Tela
  fill(9, 14, 27);
  rect(cx+8, cy+21, cw-16, ch2-46);
  // Notch
  fill(32, 35, 48);
  rect(cx+75, cy+9, 48, 8, 4);
  fill(52, 172, 252);
  rect(cx+91, cy+10, 8, 6, 3);
  // Botão home
  fill(68, 72, 88);
  rect(cx+88, cy+ch2-20, 32, 8, 4);

  // Conteúdo tela celular
  // Título
  fill(78, 218, 78);
  textSize(10);
  textAlign(CENTER);
  text("✔ CHAMADO ATENDIDO!", cx+cw/2, cy+44);

  // Estrelas de resultado
  fill(252, 218, 58);
  textSize(14);
  text("★ ★ ★", cx+cw/2, cy+62);

  // Separador
  stroke(48, 78, 48);
  strokeWeight(1);
  line(cx+16, cy+68, cx+cw-16, cy+68);
  noStroke();

  fill(198, 228, 198);
  textSize(8);
  text("Parabéns!", cx+cw/2, cy+82);
  text("Você mostrou que é possível", cx+cw/2, cy+96);
  text("ter um agro forte e um", cx+cw/2, cy+110);
  text("futuro sustentável.", cx+cw/2, cy+124);
  text("", cx+cw/2, cy+136);
  text("Produzir sem destruir", cx+cw/2, cy+142);
  text("não é utopia —", cx+cw/2, cy+156);
  text("é ESCOLHA e AÇÃO!", cx+cw/2, cy+170);

  stroke(48, 78, 48);
  line(cx+16, cy+178, cx+cw-16, cy+178);
  noStroke();

  fill(158, 198, 252);
  textSize(7);
  text("CHAMADO SUSTENTÁVEL", cx+cw/2, cy+191);
  text("AGRINHO 2026", cx+cw/2, cy+202);

  // Créditos personalizáveis
  fill(228, 228, 158);
  text("Estudante: NICOLI KATARINA", cx+cw/2, cy+216);
  text("Colégio São Cristóvão", cx+cw/2, cy+228);

  // Botão jogar novamente
  let bx = cx+14, by = cy+ch2-38, bw2 = cw-28, bh = 22;
  fill(mouseOverRect(bx,by,bw2,bh) ? color(55,198,58) : color(28,138,32));
  rect(bx, by, bw2, bh, 5);
  fill(255);
  textSize(9);
  textAlign(CENTER, CENTER);
  text("↺  JOGAR NOVAMENTE", bx+bw2/2, by+bh/2);

  // Título esquerdo
  fill(18, 55, 18, 215);
  rect(0, 0, 388, 30);
  fill(118, 238, 118);
  textSize(12);
  textAlign(LEFT);
  text("🌿 CHAMADO SUSTENTÁVEL — AGRINHO 2026", 10, 19);

  // Confetes animados
  for (let i = 0; i < 18; i++) {
    let cx2 = (i * 138 + fCount * (1 + i%3)) % width;
    let cy2 = (fCount * (0.8 + i*0.15) + i * 88) % height;
    fill(
      [252,78,48,218,28][i%5],
      [78,218,252,48,188][i%5],
      [48,78,28,252,78][i%5],
      200
    );
    rect(cx2, cy2, 6, 6, (i%2===0)?3:0);
  }
}

// ============================================================
// ░░  EVENTOS DE MOUSE  ░░
// ============================================================
function mousePressed() {
  if (paused) return; // Não processa cliques se estiver pausado

  // ---- TELA INICIAL ----
  if (gameState === "phone") {
    let cx = width/2-80, cy = 52;
    // Botão ATENDER
    if (mouseOverRect(cx+8, cy+186, 68, 28)) {
      playSoundClick();
      playSoundPhaseDone(); // Som de fase concluída ao atender
      gameState = "tutorial1";
    }
    // Botão IGNORAR
    if (mouseOverRect(cx+84, cy+186, 68, 28)) {
      playSoundIgnore();
      gameState = "ignore";
    }
  }

  // ---- IGNORAR ----
  else if (gameState === "ignore") {
    playSoundClick();
    gameState = "phone";
  }

  // ---- TUTORIAIS ----
  else if (gameState === "tutorial1") {
    let bx = width/2-120, by = height-38, bw = 240, bh = 24;
    if (mouseOverRect(bx, by, bw, bh)) {
      playSoundClick();
      resetPhase1();
      gameState = "fase1_agua";
    }
  }

  else if (gameState === "tutorial2") {
    let bx = width/2-120, by = height-38, bw = 240, bh = 24;
    if (mouseOverRect(bx, by, bw, bh)) {
      playSoundClick();
      resetPhase2();
      gameState = "fase2_solo";
    }
  }

  else if (gameState === "tutorial3") {
    let bx = width/2-120, by = height-38, bw = 240, bh = 24;
    if (mouseOverRect(bx, by, bw, bh)) {
      playSoundClick();
      resetPhase3();
      gameState = "fase3_floresta";
    }
  }

  else if (gameState === "tutorial4") {
    let bx = width/2-120, by = height-38, bw = 240, bh = 24;
    if (mouseOverRect(bx, by, bw, bh)) {
      playSoundClick();
      resetPhase4(); // Reseta a fase 4 antes da intro
      gameState = "fase4_intro"; // NOVO: Vai para a introdução da narrativa
      narrativeTimer = 0; // Reseta o timer da narrativa
      narrativeText = ""; // Limpa o texto
    }
  }

  // ---- FASE 1 ----
  else if (gameState === "fase1_agua") {
    if (phase1Message) {
      // O clique no botão "CONTINUAR" é tratado diretamente na drawMessageBox agora
      // Não precisamos de lógica extra aqui, a função drawMessageBox já cuida disso.
    }
  }

  // ---- FASE 2 ----
  else if (gameState === "fase2_solo") {
    if (phase2Message) {
      // O clique no botão "CONTINUAR" é tratado diretamente na drawMessageBox agora
    } else {
      // Botão avançar
      let bx = width/2-90, by = height-24, bw = 180, bh = 20;
      if (mouseOverRect(bx, by, bw, bh)) {
        playSoundClick();
        phase2Message = true;
        playSoundPhaseDone();
        return;
      }
      // Editar tile
      let col = floor(mouseX / TILE);
      let row = floor((mouseY - 34) / TILE);
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        playSoundPlant();
        let t = grid[row][col].type;
        if (t === 0) grid[row][col] = {type: 1, anim: 10};
        else if (t === 1) grid[row][col] = {type: 2, anim: 10};
        else if (t === 2) grid[row][col] = {type: 1, anim: 10};
        else if (t === 3) grid[row][col] = {type: 2, anim: 10};
      }
    }
  }

  // ---- FASE 3 ----
  else if (gameState === "fase3_floresta") {
    if (phase3Message) {
      // O clique no botão "CONTINUAR" é tratado diretamente na drawMessageBox agora
    } else {
      let m = currentMission3 < missions3.length ? missions3[currentMission3] : null;

      // Missão 1: plantar árvore no solo degradado
      if (m && m.goal === "plant5" && mouseY > 248 && mouseY < 334 && plantedTrees3 < 10) {
        trees3.push({
          x: mouseX - 8,
          y: mouseY - 20,
          alive: true,
          size: 18,
          sway: random(TWO_PI),
          plantAnim: 30 // Animação de plantio
        });
        plantedTrees3++;
        playSoundPlant();
      }

      // Missão 2: colocar cerca perto da nascente
      if (m && m.goal === "fence4" && dist(mouseX, mouseY, 200, 292) < 65 && fences3.length < 4) {
        fences3.push({x: mouseX, y: mouseY, fenceAnim: 30}); // Animação de cerca
        playSoundFix();
      }

      // Missão 3: botão concluir
      if (currentMission3 === 2) {
        let bx = width/2-90, by = height-22, bw = 180, bh = 18;
        if (mouseOverRect(bx, by, bw, bh)) {
          playSoundClick();
          playSoundPhaseDone();
          phase3Message = true;
        }
      }
    }
  }

  // ---- FASE 4 ----
  else if (gameState === "fase4campocidade") {
    if (phase4Message) {
      // O clique no botão "CONTINUAR" é tratado diretamente na drawMessageBox agora
    } else {
      // Botão avançar (apenas se todas as caixas não foram entregues ainda)
      let bx = width/2-95, by = height-26, bw = 190, bh = 20;
      if (mouseOverRect(bx, by, bw, bh) && score4 < 6) { // Adicionado condição score4 < 6
        playSoundClick();
        phase4Message = true;
        return;
      }
      // Iniciar arrasto das caixas
      for (let b of boxes4) {
        if (b.state !== "fresh") continue;
        if (mouseOverRect(b.x, b.y, b.w, b.h)) {
          b.dragging = true;
          b.ox = mouseX - b.x;
          b.oy = mouseY - b.y;
          dragBox = b;
          playSoundClick();
          break;
        }
      }
    }
  }

  // ---- TELA FINAL ----
  else if (gameState === "final") {
    let cx = 402, cy = 34, cw = 222, ch2 = 256;
    let bx = cx+14, by = cy+ch2-38, bw2 = cw-28, bh = 22;
    if (mouseOverRect(bx, by, bw2, bh)) {
      playSoundClick();
      gameState = "phone";
      fCount = 0;
      resetPhase1();
      resetPhase2();
      resetPhase3();
      resetPhase4();
    }
  }
}

function mouseReleased() {
  if (paused) return; // Não processa soltura do mouse se estiver pausado

  if (dragBox) {
    dragBox.dragging = false;
    // Verifica se a caixa foi entregue e inicia animação
    if (dragBox.state === "delivered") {
      dragBox.deliveryAnim = 1; // Inicia a animação de entrega
    }
    dragBox = null;
  }
}

// ============================================================
// ░░  TECLADO — EVENTOS GLOBAIS  ░░
// ============================================================
function keyPressed() {
  // Lógica de pausa
  if (key === 'p' || key === 'P') {
    paused = !paused;
    // Opcional: pausar/retomar sons em reprodução aqui
    return; // Não processa outras teclas se for a de pausa
  }

  if (gameState === "fase1_agua" && !phase1Message && !paused) {
    if (key === 'e' || key === 'E' || keyCode === 32) {
      for (let lk of leaks) {
        if (lk.fixed) continue;
        let d = dist(player.x+8, player.y+12, lk.x+6, lk.y);
        if (d < 48) {
          lk.fixed = true;
          waterSaved++;
          playSoundFix();
          lk.fixAnim = 1; // Inicia animação de conserto
          if (waterSaved >= 6) {
            phase1Message = true;
            playSoundPhaseDone();
          }
          break;
        }
      }
    }
  }
}