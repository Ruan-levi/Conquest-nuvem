// Sala online para dois jogadores. Todas as respostas são corrigidas no Nhost.
export function initDuelUI(cloudService) {
  const $ = (id) => document.getElementById(id);
  const modal = $('duel-modal');
  const setup = $('duel-setup');
  const play = $('duel-play');
  const actions = ['duel-create', 'duel-join', 'duel-cancel', 'duel-refresh'];
  let room = null;
  let pollTimer = null;
  let stopRealtime = null;
  let refreshing = false;
  let sending = false;

  function visible(element, on) { element.classList.toggle('hidden', !on); }
  function message(text) { $('duel-message').textContent = text; }
  function lock(on) {
    sending = on;
    actions.forEach(id => { $(id).disabled = on; });
  }
  function cleanup() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    if (stopRealtime) stopRealtime();
    stopRealtime = null;
  }
  function renderRoom(value) {
    room = value;
    visible(setup, false);
    visible(play, true);
    $('duel-room-code').textContent = room.code;
    $('duel-host-name').textContent = room.host.nickname;
    $('duel-host-score').textContent = String(room.host.score);
    $('duel-host-round').textContent = `${room.host.answered}/${room.rounds}`;
    $('duel-guest-name').textContent = room.guest?.nickname || 'Aguardando jogador';
    $('duel-guest-score').textContent = String(room.guest?.score || 0);
    $('duel-guest-round').textContent = `${room.guest?.answered || 0}/${room.rounds}`;
    const heading = $('duel-round-label');
    const grid = $('duel-answers');
    grid.replaceChildren();
    if (room.status === 'waiting') {
      heading.textContent = 'AGUARDANDO O SEGUNDO JOGADOR';
      $('duel-question').textContent = 'Compartilhe o código acima com um amigo. A partida começará quando ele entrar.';
    } else if (room.status === 'cancelled') {
      heading.textContent = 'PARTIDA ENCERRADA';
      $('duel-question').textContent = 'Um participante encerrou o duelo. Esta partida não entra no ranking.';
      cleanup();
    } else if (room.status === 'finished') {
      heading.textContent = 'RESULTADO FINAL';
      $('duel-question').textContent = room.winner === 'draw' ? 'Empate! Os dois participantes fizeram a mesma pontuação.'
        : room.winner === room.role ? 'Vitória! Você venceu o duelo de Teoria dos Conjuntos.'
          : 'O adversário venceu. Treine e convide para uma revanche!';
      message('Duas participações concluídas. Resultado enviado ao ranking global.');
      cleanup();
    } else if (room.myAnswered === room.rounds) {
      heading.textContent = 'VOCÊ CONCLUIU AS 6 RODADAS';
      $('duel-question').textContent = 'Aguardando seu adversário terminar para calcular o vencedor.';
    } else {
      heading.textContent = `QUESTÃO ${room.myAnswered + 1} DE ${room.rounds}`;
      $('duel-question').textContent = room.question?.text || 'Carregando pergunta…';
      (room.question?.options || []).forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'answer-button';
        const small = document.createElement('small');
        small.textContent = String(index + 1).padStart(2, '0');
        button.append(small, document.createTextNode(option));
        button.disabled = sending;
        button.addEventListener('click', () => answer(index));
        grid.append(button);
      });
    }
    $('duel-cancel').disabled = room.status === 'cancelled' || room.status === 'finished';
    $('duel-cancel').textContent = room.status === 'waiting' ? 'CANCELAR CONVITE' : 'ENCERRAR PARTIDA';
  }
  async function refresh() {
    if (!room || refreshing || sending || modal.classList.contains('hidden') || room.status === 'finished') return;
    refreshing = true;
    try {
      const result = await cloudService.duelRequest('status', { roomId: room.id });
      renderRoom(result.room);
    } catch (error) {
      message('Falha de sincronização: ' + error.message);
    } finally { refreshing = false; }
  }
  async function attachRoom(data) {
    cleanup();
    room = data.room;
    renderRoom(room);
    message(room.status === 'waiting' ? 'Sala criada. Compartilhe o código para convidar.' : 'Sala conectada. Boa partida!');
    if (room.status === 'finished' || room.status === 'cancelled') return;
    // Realtime por GraphQL, com consulta periódica caso o WebSocket seja bloqueado.
    if (modal.classList.contains('hidden')) return;
    pollTimer = setInterval(refresh, 2500);
    try {
      const stop = await cloudService.subscribeDuel(room.id, refresh, status => {
        $('duel-connection').textContent = status;
      });
      if (room && !modal.classList.contains('hidden') && room.status !== 'finished') stopRealtime = stop;
      else stop();
    } catch (_) { $('duel-connection').textContent = 'Atualização automática a cada 2,5 segundos.'; }
  }
  async function request(action, params) {
    if (sending) return;
    lock(true);
    message('Conectando ao Nhost…');
    try { await attachRoom(await cloudService.duelRequest(action, params)); }
    catch (error) { message(error.message); }
    finally { lock(false); }
  }
  async function answer(choice) {
    if (!room || room.status !== 'active' || sending) return;
    const round = room.myAnswered + 1;
    lock(true);
    $('duel-answers').querySelectorAll('button').forEach(b => { b.disabled = true; });
    message('Validando sua resposta no servidor…');
    try {
      const result = await cloudService.duelRequest('answer', { roomId: room.id, round, choice });
      renderRoom(result.room);
      message(result.answer.correct ? 'Resposta correta! +100 pontos.' : 'Resposta incorreta. O duelo continua!');
    } catch (error) { message(error.message); await refresh(); }
    finally {
      lock(false);
      if (room) renderRoom(room);
    }
  }

  function open() {
    visible(modal, true);
    if (!cloudService.isConfigured()) return message('Configure o Nhost no GitHub Actions para habilitar o duelo.');
    if (!cloudService.getUser()) return message('Entre na sua conta Nhost em “Entrar / Cadastrar” antes de criar ou entrar em um duelo.');
    const user = cloudService.getUser();
    if ($('duel-nickname').value === 'Aventureiro' && user?.id) {
      $('duel-nickname').value = 'Jogador-' + user.id.slice(0, 6);
    }
    message('Crie uma sala ou informe o código de convite do outro jogador.');
  }
  function close() { visible(modal, false); cleanup(); }
  $('portal-duel-open').addEventListener('click', open);
  $('duel-close').addEventListener('click', close);
  $('duel-back').addEventListener('click', () => { cleanup(); room = null; visible(play, false); visible(setup, true); message('Crie uma sala ou entre com um novo código.'); });
  $('duel-refresh').addEventListener('click', refresh);
  $('duel-create').addEventListener('click', () => request('create', { nickname: $('duel-nickname').value }));
  $('duel-join').addEventListener('click', () => request('join', {
    nickname: $('duel-nickname').value, code: $('duel-code-input').value
  }));
  $('duel-cancel').addEventListener('click', async () => {
    if (!room || sending) return;
    lock(true);
    try {
      const result = await cloudService.duelRequest('cancel', { roomId: room.id });
      renderRoom(result.room);
      message('Duelo encerrado. Nenhuma pontuação foi publicada.');
      cleanup();
    } catch (error) { message(error.message); }
    finally { lock(false); }
  });
}
