// Integração opcional: a versão local do Conquest funciona sem variáveis Nhost.
// Não armazene segredos administrativos em VITE_* (valores VITE são públicos no build).
const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN?.trim();
const region = import.meta.env.VITE_NHOST_REGION?.trim();
let client = null;
let user = null;

async function getClient() {
  if (!subdomain || !region) throw new Error("Defina VITE_NHOST_SUBDOMAIN e VITE_NHOST_REGION.");
  if (!client) {
    const { createClient } = await import("@nhost/nhost-js");
    client = createClient({ subdomain, region });
    user = client.sessionStorage.get()?.user || null;
  }
  return client;
}

export const cloudService = {
  isConfigured() { return Boolean(subdomain && region); },
  getUser() {
    if (user) return user;
    try { return client?.sessionStorage.get()?.user || null; } catch { return null; }
  },
  async login(email, password) {
    const nhost = await getClient();
    const result = await nhost.auth.signInEmailPassword({ email, password });
    user = result.body?.session?.user || null;
    if (!user) throw new Error("Login sem sessão. Confirme suas credenciais e a verificação do e-mail.");
    return "Login realizado com sucesso.";
  },
  async register(email, password) {
    if (!email || !password || password.length < 6) throw new Error("Informe e-mail e uma senha com pelo menos 6 caracteres.");
    const nhost = await getClient();
    const result = await nhost.auth.signUpEmailPassword({ email, password });
    user = result.body?.session?.user || null;
    return user ? "Conta criada e conectada." : "Conta criada. Verifique seu e-mail antes de entrar.";
  },
  async logout() {
    const nhost = await getClient();
    try { await nhost.auth.signOut(); } finally { nhost.clearSession(); user = null; }
  },
  async saveScore(result) {
    if (!this.isConfigured()) return { saved: false, reason: "Nhost ainda não configurado." };
    try {
      const nhost = await getClient();
      if (!nhost.sessionStorage.get()?.user) return { saved: false, reason: "Entre na sua conta para salvar resultados." };
      // A tabela e as permissões precisam estar configuradas segundo docs/NHOST.md.
      // Esta inserção de pontuação é EXPERIMENTAL: pontuação vem do cliente e pode ser forjada.
      // NÃO usar em ranking competitivo sem validação por Nhost Functions / servidor.
      const response = await nhost.graphql.request({
        query: "mutation ConquestScore($score: Int!, $correct: Int!, $total: Int!, $completed: Boolean!) { insert_conquest_scores_one(object: {score: $score, correct_answers: $correct, total_answers: $total, completed: $completed}) { id } }",
        variables: { score: result.score, correct: result.correct_answers, total: result.total_answers, completed: result.completed }
      });
      return { saved: Boolean(response.body?.data?.insert_conquest_scores_one?.id) };
    } catch (error) {
      return { saved: false, reason: "Falha na gravação: " + (error.message || "verifique o Hasura e a tabela.") };
    }
  },
  async getLeaderboard() {
    const nhost = await getClient();
    const response = await nhost.graphql.request({
      query: "query ConquestRanking { conquest_scores(order_by: {score: desc}, limit: 10, where: {completed: {_eq: true}}) { score correct_answers created_at } }"
    });
    return response.body?.data?.conquest_scores || [];
  }
};
