// Cliente publico Nhost: jamais adicionar admin secret ou senhas a variaveis VITE_*.
const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN?.trim();
const region = import.meta.env.VITE_NHOST_REGION?.trim();
let client = null;
const DUEL_SUBSCRIPTION = `subscription LiveDuel($id: uuid!) {
  conquest_duels_by_pk(id: $id) {
    id status host_round guest_round host_score guest_score host_nickname guest_nickname
  }
}`;
const GLOBAL_RANKING_SUBSCRIPTION = `subscription GlobalLeaderboard {
  conquest_duel_leaderboard(order_by: [{best_score: desc}, {wins: desc}], limit: 15) {
    nickname best_score wins played
  }
}`;

function functionUrl(path) {
  if (!subdomain || !region) throw new Error('Configure o projeto Nhost antes de entrar no duelo.');
  return 'https://' + subdomain + '.functions.' + region + '.nhost.run/v1/' + path;
}

async function subscribeGraphql(query, variables, onUpdate, onStatus, token) {
  const endpoint = 'wss://' + subdomain + '.graphql.' + region + '.nhost.run/v1/graphql';
  const socket = new WebSocket(endpoint, 'graphql-transport-ws');
  let stopped = false;
  socket.onopen = () => socket.send(JSON.stringify({
    type: 'connection_init', payload: token ? { headers: { Authorization: 'Bearer ' + token } } : {}
  }));
  socket.onmessage = (event) => {
    let message;
    try { message = JSON.parse(event.data); } catch { return; }
    if (message.type === 'connection_ack') {
      onStatus('Tempo real conectado');
      socket.send(JSON.stringify({ id: 'conquest-live', type: 'subscribe', payload: { query, variables } }));
    } else if (message.type === 'next') {
      if (message.payload?.errors?.length) onStatus('Tempo real indisponível. Atualização automática ativada.');
      else onUpdate(message.payload?.data || {});
    } else if (message.type === 'ping') {
      socket.send(JSON.stringify({ type: 'pong' }));
    } else if (message.type === 'error') {
      onStatus('Tempo real recusado pelo Hasura. Atualização automática ativada.');
    }
  };
  socket.onerror = () => { if (!stopped) onStatus('Tempo real desconectado; usando atualização automática.'); };
  socket.onclose = () => { if (!stopped) onStatus('Conexão encerrada; usando atualização automática.'); };
  return () => {
    stopped = true;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id: 'conquest-live', type: 'complete' }));
    }
    socket.close();
  };
}

async function getClient() {
  if (!subdomain || !region) throw new Error("Defina VITE_NHOST_SUBDOMAIN e VITE_NHOST_REGION.");
  if (!client) {
    const { createClient } = await import("@nhost/nhost-js");
    client = createClient({ subdomain, region });
  }
  return client;
}

function sessionOf(nhost) {
  return nhost.sessionStorage.get();
}

async function requireSession() {
  const nhost = await getClient();
  const session = sessionOf(nhost);
  if (!session?.user?.id) throw new Error("Entre na sua conta para usar os recursos em nuvem.");
  return { nhost, session };
}

const SCORES_QUERY = "query MyConquestScores { conquest_scores(order_by: {created_at: desc}, limit: 10) { id score correct_answers total_answers completed created_at } }";
const SCORES_SUBSCRIPTION = "subscription LiveConquestScores { conquest_scores(order_by: {created_at: desc}, limit: 10) { id score correct_answers total_answers completed created_at } }";

export const cloudService = {
  isConfigured() { return Boolean(subdomain && region); },
  projectLabel() { return this.isConfigured() ? subdomain + " · " + region : "Não configurado"; },
  getUser() { return client?.sessionStorage.get()?.user || null; },
  async initialize() {
    if (this.isConfigured()) await getClient();
    return this.getUser();
  },
  async login(email, password) {
    const nhost = await getClient();
    const response = await nhost.auth.signInEmailPassword({ email: email.trim(), password });
    if (!response.body?.session?.user) {
      throw new Error("Login nao concluido. Confira a verificacao do e-mail ou a autenticacao de dois fatores.");
    }
    return "Login realizado com sucesso.";
  },
  async register(email, password) {
    if (!email?.trim() || !password || password.length < 8) {
      throw new Error("Informe e-mail válido e senha com no mínimo 8 caracteres.");
    }
    const nhost = await getClient();
    const response = await nhost.auth.signUpEmailPassword({ email: email.trim(), password });
    return response.body?.session?.user
      ? "Conta criada e conectada."
      : "Solicitação de cadastro enviada ao Nhost. Confira seu e-mail (inclusive Spam), confirme a conta e depois faça login. Veja a conta em Auth → Users no projeto indicado acima.";
  },
  async logout() {
    const nhost = await getClient();
    const session = sessionOf(nhost);
    try {
      if (session?.refreshToken) await nhost.auth.signOut({ refreshToken: session.refreshToken });
    } finally {
      nhost.clearSession();
    }
  },
  async saveScore(result) {
    if (!this.isConfigured()) return { saved: false, reason: "Nhost nao configurado." };
    try {
      const { nhost } = await requireSession();
      // Demonstracao academica: resultados calculados no browser NAO sao antitrapaca.
      const response = await nhost.graphql.request({
        query: "mutation ConquestScore($score: Int!, $correct: Int!, $total: Int!, $completed: Boolean!) { insert_conquest_scores_one(object: {score: $score, correct_answers: $correct, total_answers: $total, completed: $completed}) { id } }",
        variables: {
          score: result.score,
          correct: result.correct_answers,
          total: result.total_answers,
          completed: result.completed
        }
      });
      return { saved: Boolean(response.body?.data?.insert_conquest_scores_one?.id) };
    } catch (error) {
      return { saved: false, reason: "Falha na gravacao: " + (error.message || "confira as permissoes Hasura.") };
    }
  },
  async getOwnScores() {
    const { nhost } = await requireSession();
    const response = await nhost.graphql.request({ query: SCORES_QUERY });
    return response.body?.data?.conquest_scores || [];
  },
  // Placar publicado somente a partir de duelos corrigidos na Function.
  async getGlobalLeaderboard() {
    const response = await fetch(functionUrl('duel'), { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Ranking global indisponível.');
    return body.ranking || [];
  },
  async getLeaderboard() { return this.getGlobalLeaderboard(); },
  async duelRequest(action, params = {}) {
    const { session } = await requireSession();
    if (!session.accessToken) throw new Error('Entre novamente na sua conta Nhost.');
    const response = await fetch(functionUrl('duel'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.accessToken },
      body: JSON.stringify({ action, ...params }), cache: 'no-store'
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Não foi possível acessar a partida.');
    return body;
  },
  async subscribeDuel(roomId, onChange, onStatus = () => {}) {
    const { session } = await requireSession();
    return subscribeGraphql(DUEL_SUBSCRIPTION, { id: roomId }, onChange, onStatus, session.accessToken);
  },
  async subscribeGlobalLeaderboard(onChange, onStatus = () => {}) {
    const token = client?.sessionStorage.get()?.accessToken;
    return subscribeGraphql(GLOBAL_RANKING_SUBSCRIPTION, {}, onChange, onStatus, token);
  },
  async uploadProof(file) {
    if (!(file instanceof File)) throw new Error("Selecione uma imagem.");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      throw new Error("Use imagem PNG, JPEG ou WebP.");
    }
    if (file.size > 2 * 1024 * 1024) throw new Error("Imagem deve ter ate 2 MB.");
    const { nhost } = await requireSession();
    const response = await nhost.storage.uploadFiles({
      "bucket-id": "personal",
      "file[]": [file]
    });
    const uploaded = response.body?.processedFiles?.[0];
    if (!uploaded?.id) throw new Error("Upload nao confirmado pelo Nhost Storage.");
    return uploaded.id;
  },
  async subscribeOwnScores(onScores, onStatus = () => {}) {
    const { session } = await requireSession();
    const token = session.accessToken;
    if (!token) throw new Error("A sessao nao possui token de acesso valido.");
    // Endpoint Cloud GraphQL Hasura, com protocolo graphql-transport-ws.
    const wsUrl = "wss://" + subdomain + ".graphql." + region + ".nhost.run/v1/graphql";
    const socket = new WebSocket(wsUrl, "graphql-transport-ws");
    let stopped = false;
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "connection_init",
        payload: { headers: { Authorization: "Bearer " + token } }
      }));
    };
    socket.onmessage = (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === "connection_ack") {
        onStatus("Realtime conectado");
        socket.send(JSON.stringify({
          id: "conquest-my-scores",
          type: "subscribe",
          payload: { query: SCORES_SUBSCRIPTION }
        }));
      } else if (message.type === "next") {
        onScores(message.payload?.data?.conquest_scores || []);
      } else if (message.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
      } else if (message.type === "error") {
        onStatus("Realtime recusado: confira as permissoes Hasura");
      }
    };
    socket.onerror = () => { if (!stopped) onStatus("Realtime indisponivel"); };
    socket.onclose = () => { if (!stopped) onStatus("Realtime desconectado"); };
    return () => {
      stopped = true;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ id: "conquest-my-scores", type: "complete" }));
      }
      socket.close();
    };
  }
};
