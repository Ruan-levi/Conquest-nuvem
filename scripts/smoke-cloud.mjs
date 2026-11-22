// Verificação pública do ranking Nhost, sem conta de teste ou segredo administrativo.
const subdomain = process.env.NHOST_SUBDOMAIN?.trim();
const region = process.env.NHOST_REGION?.trim();
if (!/^[a-z0-9-]+$/.test(subdomain || '') || !/^[a-z0-9-]+$/.test(region || '')) {
  console.error('Configure NHOST_SUBDOMAIN e NHOST_REGION com os valores públicos do projeto.');
  process.exitCode = 1;
} else {
  const url = `https://${subdomain}.functions.${region}.nhost.run/v1/duel`;
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw new Error(`Endpoint respondeu HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data?.ranking) || data.ranking.some((item) =>
      !item || typeof item.nickname !== 'string' ||
      !Number.isInteger(item.bestScore) || item.bestScore < 0 ||
      !Number.isInteger(item.played) || item.played < 0 ||
      !Number.isInteger(item.wins) || item.wins < 0 ||
      'user_id' in item || 'email' in item)) {
      throw new Error('Resposta do ranking inválida ou expondo dados privados.');
    }
    console.log(`Ranking público Nhost ativo: ${data.ranking.length} jogadores, sem divulgar dados pessoais.`);
  } catch (error) {
    console.error('Falha ao validar ranking Nhost:', error.message);
    process.exitCode = 1;
  }
}
