import "./style.css";
import { createWorld } from "./game/scene.js";
import { createGameState, interact, acceptLioraQuest, getBattleQuestion, answerQuestion, canInteract, stageLabel, makeResult } from "./game/logic.js";
import { currentTarget, distance2D } from "./game/world-map.js";
import { cloudService } from "./services/nhost.js";

const $ = (id) => document.getElementById(id);
const keys = Object.create(null);
const canvas = $("renderCanvas");
let state = createGameState();
let world;
let started = false;
let paused = false;
let battleBusy = false;
let effectsEnabled = true;
let audioContext = null;
let lastTime = 0;
let hudTime = 0;
let toastTimeout = 0;
let stopCloudRealtime = null;
let cloudConnectionVersion = 0;
const ui = {
  intro: $("intro-overlay"), hud: $("hud-left"), objective: $("objective-panel"),
  dialogue: $("dialogue-overlay"), battle: $("battle-overlay"), end: $("end-overlay"),
  pause: $("pause-overlay"), cloud: $("cloud-modal"), controls: $("controls-hint"),
  mobile: $("mobile-controls")
};
const isTouch = matchMedia("(pointer:coarse)").matches || innerWidth < 900;

function toggle(el, visible) { el.classList.toggle("hidden", !visible); }
function isVisible(el) { return !el.classList.contains("hidden"); }
function sound(frequency = 420, duration = .1, shape = "sine") {
  if (!effectsEnabled) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioContext.createOscillator();
    const gain = audioContext.createGain();
    o.type = shape;
    o.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    o.connect(gain).connect(audioContext.destination);
    o.start();
    o.stop(audioContext.currentTime + duration);
  } catch (_) { /* Áudio é opcional. */ }
}
function notify(message, duration = 2300) {
  clearTimeout(toastTimeout);
  $("toast").textContent = message;
  toggle($("toast"), true);
  toastTimeout = window.setTimeout(() => toggle($("toast"), false), duration);
}
function reset() {
  state = createGameState();
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  battleBusy = false;
  paused = false;
  started = true;
  for (const el of [ui.intro, ui.dialogue, ui.battle, ui.end, ui.pause]) toggle(el, false);
  toggle(ui.hud, true); toggle(ui.objective, true);
  toggle(ui.mobile, isTouch);
  toggle(ui.controls, !isTouch);
  updateHud();
  notify("✦ Encontre Liora! Siga a seta para começar.", 3300);
}
function updateHud() {
  $("health-text").textContent = state.health + " / 100";
  $("health-fill").style.width = Math.max(0, state.health) + "%";
  $("score-text").textContent = state.score.toLocaleString("pt-BR") + " pts";
  $("score-fill").style.width = Math.min(100, (state.score / 1600) * 100) + "%";
  $("crystal-text").textContent = state.crystals.length + "/3";
  $("guardian-text").textContent = state.guardianIndex + "/3";
  $("correct-text").textContent = state.correct;
  const target = currentTarget(state);
  if (target) {
    $("objective-title").textContent = target.label;
    $("objective-desc").textContent = target.instruction;
    $("objective-distance").textContent = Math.round(distance2D(state.position, target)) + " m até o objetivo";
    $("objective-stage").textContent = stageLabel(state);
    $("direction-arrow").style.transform = "rotate(" + world.directionAngle(state) + "rad)";
  }
  const near = started && !paused && !state.battle && !isVisible(ui.dialogue) &&
    !isVisible(ui.cloud) && !isVisible(ui.end) && canInteract(state);
  toggle($("interaction-prompt"), Boolean(near));
  if (near) $("interaction-text").textContent = near.action + " · " + near.label;
}
function presentBattle() {
  const battle = state.battle;
  if (!battle) return;
  $("battle-tag").textContent = battle.id === "cael" ? "CHEFE FINAL" : "GUARDIÃO DO CONHECIMENTO";
  $("battle-name").textContent = battle.title;
  $("enemy-health-label").textContent = (battle.maxHits - battle.hits) + " / " + battle.maxHits;
  $("enemy-health-fill").style.width = ((battle.maxHits - battle.hits) / battle.maxHits * 100) + "%";
  const q = getBattleQuestion(state);
  $("battle-question").textContent = q.text;
  const container = $("answer-grid");
  container.replaceChildren();
  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    const small = document.createElement("small");
    small.textContent = String(index + 1).padStart(2, "0");
    button.append(small, document.createTextNode(option));
    button.addEventListener("click", () => chooseAnswer(index));
    container.append(button);
  });
  $("battle-feedback").className = "battle-feedback";
  $("battle-feedback").textContent = "Escolha a resposta correta para atacar o inimigo.";
}
function startBattle() {
  toggle(ui.battle, true);
  battleBusy = false;
  presentBattle();
  sound(350, .17, "triangle");
}
function showEnd(won) {
  toggle(ui.battle, false);
  toggle(ui.end, true);
  $("end-symbol").textContent = won ? "✦" : "♡";
  $("end-kicker").textContent = won ? "JORNADA CONCLUÍDA" : "TENTE NOVAMENTE";
  $("end-title").textContent = won ? "O Vale foi salvo!" : "Sua jornada continua...";
  $("end-description").textContent = won
    ? "Você venceu os guardiões, derrotou Cael e restaurou o equilíbrio do Vale dos Conjuntos."
    : "Os desafios foram difíceis, mas cada tentativa ajuda você a aprender os conjuntos.";
  $("end-score").textContent = state.score.toLocaleString("pt-BR");
  $("end-correct").textContent = String(state.correct);
  $("cloud-save-message").textContent = "Resultado salvo localmente neste navegador.";
  const result = makeResult(state);
  try {
    const old = JSON.parse(localStorage.getItem("conquest-local-scores") || "[]");
    const next = [...old, result].sort((a,b) => b.score - a.score).slice(0, 15);
    localStorage.setItem("conquest-local-scores", JSON.stringify(next));
  } catch (_) { $("cloud-save-message").textContent = "Não foi possível utilizar o armazenamento local."; }
  if (won) {
    sound(720, .26, "sine");
    cloudService.saveScore(result).then((res) => {
      if (res.saved) $("cloud-save-message").textContent = "Pontuação registrada no Nhost (versão experimental).";
      else if (res.reason) $("cloud-save-message").textContent += " Nuvem: " + res.reason;
    }).catch(() => {});
  } else sound(220, .25, "triangle");
}
function chooseAnswer(index) {
  if (!state.battle || battleBusy) return;
  battleBusy = true;
  const result = answerQuestion(state, index);
  const buttons = Array.from($("answer-grid").children);
  buttons.forEach((button, idx) => {
    button.disabled = true;
    if (idx === result.answer) button.classList.add("correct");
    if (idx === index && !result.correct) button.classList.add("incorrect");
  });
  const feedback = $("battle-feedback");
  feedback.textContent = result.correct
    ? "✦ Resposta correta! Seu ataque atingiu o inimigo."
    : "✕ Resposta incorreta! Você sofreu dano. Observe a resposta marcada.";
  feedback.className = "battle-feedback " + (result.correct ? "good" : "bad");
  sound(result.correct ? 620 : 160, result.correct ? .15 : .27, "triangle");
  updateHud();
  window.setTimeout(() => {
    battleBusy = false;
    if (result.type === "victory") return showEnd(true);
    if (result.type === "defeat") return showEnd(false);
    if (result.type === "guardian-defeated") {
      toggle(ui.battle, false);
      notify("⚔ Guardião derrotado! Uma nova missão foi revelada.", 3600);
      return updateHud();
    }
    if (state.battle) presentBattle();
  }, 900);
}
function interactNow() {
  if (!started || paused || state.battle || isVisible(ui.end) || isVisible(ui.cloud) || isVisible(ui.dialogue)) return;
  const action = interact(state);
  if (action.type === "dialogue") {
    toggle(ui.dialogue, true);
    sound(490, .12);
  } else if (action.type === "crystal") {
    sound(790, .17);
    notify("✦ " + action.label + " coletado! +35 pontos", 2700);
    if (state.phase === "guardians") notify("✦ Três cristais reunidos! Encontre o Guardião da União.", 4200);
  } else if (action.type === "battle") startBattle();
  updateHud();
}

function setPaused(value) {
  if (!started || isVisible(ui.end) || isVisible(ui.intro) || isVisible(ui.battle) || isVisible(ui.dialogue)) return;
  paused = value;
  toggle(ui.pause, paused);
  Object.keys(keys).forEach(k => keys[k] = false);
}
function onKeyDown(event) {
  if (isVisible(ui.cloud) && ["INPUT","TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
  const k = event.key.toLowerCase();
  if (["w","a","s","d","shift","e","q","r","arrowup","arrowdown","arrowleft","arrowright","escape","1","2","3","4"].includes(k)) event.preventDefault();
  if (k === "escape") {
    if (isVisible(ui.cloud)) {
      closeCloudModal();
      return;
    }
    if (isVisible(ui.battle)) return;
    return setPaused(!paused);
  }
  if (state.battle && ["1","2","3","4"].includes(k)) return chooseAnswer(Number(k) - 1);
  if (k === "e" && !event.repeat) return interactNow();
  keys[k] = true;
}
function onKeyUp(event) { keys[event.key.toLowerCase()] = false; }
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => Object.keys(keys).forEach((k) => keys[k] = false));
for (const button of document.querySelectorAll("[data-control]")) {
  const control = button.dataset.control;
  const onDown = (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    if (control === "e") return interactNow();
    keys[control] = true;
    button.style.backgroundColor = "#377f78";
  };
  const onUp = (event) => {
    event.preventDefault();
    keys[control] = false;
    button.style.backgroundColor = "";
  };
  button.addEventListener("pointerdown", onDown);
  button.addEventListener("pointerup", onUp);
  button.addEventListener("pointercancel", onUp);
  button.addEventListener("lostpointercapture", () => { keys[control] = false; button.style.backgroundColor = ""; });
}

$("start-button").addEventListener("click", () => { reset(); sound(580, .24); });
$("dialogue-continue").addEventListener("click", () => {
  acceptLioraQuest(state);
  toggle(ui.dialogue, false);
  notify("✦ Missão iniciada: encontre os 3 cristais!", 3400);
  sound(660, .2);
  updateHud();
});
$("battle-close").addEventListener("click", () => {
  if (battleBusy) return;
  state.battle = null;
  toggle(ui.battle, false);
  notify("Você recuou. Volte quando estiver pronto.");
});
$("end-restart").addEventListener("click", reset);
$("pause-button").addEventListener("click", () => setPaused(!paused));
$("resume-button").addEventListener("click", () => setPaused(false));
$("restart-button").addEventListener("click", reset);
$("audio-button").addEventListener("click", () => {
  effectsEnabled = !effectsEnabled;
  $("audio-button").textContent = effectsEnabled ? "♫" : "♪̸";
  $("audio-button").title = effectsEnabled ? "Desligar efeitos" : "Ligar efeitos";
  if (effectsEnabled) sound(500, .08);
});

function stopLiveScores() {
  cloudConnectionVersion++;
  if (stopCloudRealtime) stopCloudRealtime();
  stopCloudRealtime = null;
}
function closeCloudModal() {
  stopLiveScores();
  toggle(ui.cloud, false);
}
function renderCloudScores(scores) {
  const list = $("cloud-score-list");
  list.replaceChildren();
  if (!scores.length) {
    const item = document.createElement("li");
    item.textContent = "Ainda nao ha partidas sincronizadas nesta conta.";
    list.append(item);
    return;
  }
  scores.forEach((score) => {
    const item = document.createElement("li");
    const date = new Date(score.created_at).toLocaleDateString("pt-BR");
    item.textContent = date + " · " + score.score + " pts · " +
      score.correct_answers + "/" + score.total_answers + " acertos" +
      (score.completed ? " · Vitoria" : "");
    list.append(item);
  });
}
async function refreshCloudScores() {
  try {
    renderCloudScores(await cloudService.getOwnScores());
  } catch (error) {
    $("cloud-realtime-status").textContent = "Consulta indisponivel: " + (error.message || "falha GraphQL");
  }
}
async function startLiveScores() {
  stopLiveScores();
  if (!cloudService.getUser() || !isVisible(ui.cloud)) return;
  const version = cloudConnectionVersion;
  await refreshCloudScores();
  try {
    const stop = await cloudService.subscribeOwnScores(
      (scores) => { if (cloudConnectionVersion === version) renderCloudScores(scores); },
      (message) => { if (cloudConnectionVersion === version) $("cloud-realtime-status").textContent = message; }
    );
    if (cloudConnectionVersion !== version || !isVisible(ui.cloud)) stop();
    else stopCloudRealtime = stop;
  } catch (error) {
    if (cloudConnectionVersion === version) {
      $("cloud-realtime-status").textContent = "Realtime indisponivel: " + (error.message || "verifique o Nhost");
    }
  }
}
function updateCloudUser() {
  const user = cloudService.getUser();
  toggle($("cloud-user"), Boolean(user));
  toggle($("cloud-login-form"), !user && cloudService.isConfigured());
  toggle($("cloud-dashboard"), Boolean(user));
  if (user) $("cloud-user-name").textContent = "Conectado: " + (user.email || user.id);
  $("cloud-status").textContent = user ? "● Nhost conectado" : (cloudService.isConfigured() ? "● Nhost disponivel" : "● Modo local");
}
$("cloud-open").addEventListener("click", async () => {
  toggle(ui.cloud, true);
  const enabled = cloudService.isConfigured();
  $("cloud-description").textContent = enabled
    ? "Sua conta, partidas sincronizadas e comprovantes privados no Nhost. Pontos calculados no navegador sao demonstrativos."
    : "Nhost nao configurado. Defina VITE_NHOST_SUBDOMAIN e VITE_NHOST_REGION e publique novamente.";
  $("cloud-message").textContent = enabled ? "Os dados dependem das permissoes configuradas no Nhost." : "O jogo funciona localmente sem cadastro.";
  try { await cloudService.initialize(); } catch (error) {
    $("cloud-message").textContent = error.message || "Nao foi possivel iniciar o Nhost.";
  }
  if (!isVisible(ui.cloud)) return;
  updateCloudUser();
  if (cloudService.getUser()) startLiveScores();
});
$("close-cloud").addEventListener("click", closeCloudModal);
$("cloud-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("cloud-message").textContent = "Entrando...";
  try {
    const result = await cloudService.login($("cloud-email").value, $("cloud-password").value);
    $("cloud-password").value = "";
    $("cloud-message").textContent = result;
    updateCloudUser();
    startLiveScores();
  } catch (error) { $("cloud-message").textContent = error.message || "Falha no login."; }
});
$("cloud-register").addEventListener("click", async () => {
  $("cloud-message").textContent = "Criando conta...";
  try {
    const result = await cloudService.register($("cloud-email").value, $("cloud-password").value);
    $("cloud-message").textContent = result;
    updateCloudUser();
    if (cloudService.getUser()) startLiveScores();
  } catch (error) { $("cloud-message").textContent = error.message || "Nao foi possivel criar a conta."; }
});
$("cloud-logout").addEventListener("click", async () => {
  stopLiveScores();
  try {
    await cloudService.logout();
    $("cloud-message").textContent = "Sessao encerrada.";
    renderCloudScores([]);
  } catch (error) {
    $("cloud-message").textContent = "Falha ao desconectar: " + (error.message || "erro");
  }
  updateCloudUser();
});
$("cloud-refresh-scores").addEventListener("click", refreshCloudScores);
$("cloud-upload-proof").addEventListener("click", async () => {
  const button = $("cloud-upload-proof");
  const file = $("cloud-proof").files[0];
  button.disabled = true;
  $("cloud-storage-status").textContent = "Enviando arquivo privado...";
  try {
    const fileId = await cloudService.uploadProof(file);
    $("cloud-storage-status").textContent = "Upload concluido no bucket personal. ID: " + fileId;
    $("cloud-proof").value = "";
  } catch (error) {
    $("cloud-storage-status").textContent = "Falha no upload: " + (error.message || "erro");
  } finally { button.disabled = false; }
});
cloudService.initialize().then(updateCloudUser).catch(() => { /* Modo local permanece acessivel. */ });

try {
  world = createWorld(canvas, interactNow);
  const animate = (timestamp) => {
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, .05) : .016;
    lastTime = timestamp;
    const active = started && !paused && !state.battle &&
      !isVisible(ui.dialogue) && !isVisible(ui.cloud) && !isVisible(ui.end);
    world.update(state, dt, keys, active);
    if (timestamp - hudTime > 95) {
      updateHud();
      hudTime = timestamp;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
} catch (error) {
  console.error("Falha na inicialização do cenário 3D:", error);
  const intro = $("intro-overlay");
  const message = document.createElement("p");
  message.style.color = "#ffc6af";
  message.textContent = "Não foi possível iniciar os gráficos 3D. Verifique a compatibilidade WebGL do navegador e a instalação das dependências.";
  intro.querySelector(".intro-content").append(message);
  $("start-button").disabled = true;
}
