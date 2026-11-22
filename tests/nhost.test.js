import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
  getSession: vi.fn(), clearSession: vi.fn()
}));

vi.mock('@nhost/nhost-js', () => ({
  createClient: () => ({
    auth: {
      signInEmailPassword: mocks.signIn,
      signUpEmailPassword: mocks.signUp,
      signOut: mocks.signOut
    },
    sessionStorage: { get: mocks.getSession },
    clearSession: mocks.clearSession
  })
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_NHOST_SUBDOMAIN', 'conquest-test');
  vi.stubEnv('VITE_NHOST_REGION', 'sa-east-1');
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.getSession.mockReturnValue(null);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Nhost: autenticação e ranking público', () => {
  it('exibe ranking verificado sem exigir login e sem compartilhar IDs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ranking: [{ nickname: 'Exploradora', bestScore: 400, played: 2, wins: 1 }] })
    });
    vi.stubGlobal('fetch', fetchMock);
    const { cloudService } = await import('../src/services/nhost.js');
    const ranking = await cloudService.getGlobalLeaderboard();
    expect(ranking[0].nickname).toBe('Exploradora');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://conquest-test.functions.sa-east-1.nhost.run/v1/duel',
      { cache: 'no-store' }
    );
  });

  it('informa quando o serviço de ranking público falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, json: async () => ({ error: 'Ranking indisponível.' })
    }));
    const { cloudService } = await import('../src/services/nhost.js');
    await expect(cloudService.getGlobalLeaderboard()).rejects.toThrow('Ranking indisponível.');
  });

  it('realiza login usando e-mail sem espaços extras', async () => {
    mocks.signIn.mockResolvedValue({ body: { session: { user: { id: 'usuario-1' } } } });
    const { cloudService } = await import('../src/services/nhost.js');
    await expect(cloudService.login('  usuario@exemplo.com ', 'senha-forte')).resolves.toMatch(/sucesso/);
    expect(mocks.signIn).toHaveBeenCalledWith({ email: 'usuario@exemplo.com', password: 'senha-forte' });
  });

  it('recusa cadastro malformado antes de consultar o backend', async () => {
    const { cloudService } = await import('../src/services/nhost.js');
    await expect(cloudService.register('email-invalido', 'senha-segura')).rejects.toThrow(/e-mail válido/);
    await expect(cloudService.register('usuario@exemplo.com', 'curta')).rejects.toThrow(/8 caracteres/);
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it('orienta a confirmação por e-mail quando não há sessão imediata', async () => {
    mocks.signUp.mockResolvedValue({ body: { session: null } });
    const { cloudService } = await import('../src/services/nhost.js');
    await expect(cloudService.register('usuario@exemplo.com', 'senha-segura')).resolves.toMatch(/confirme a conta/);
    expect(mocks.signUp).toHaveBeenCalledWith({ email: 'usuario@exemplo.com', password: 'senha-segura' });
  });

  it('não permite ações de duelo sem sessão autenticada', async () => {
    const { cloudService } = await import('../src/services/nhost.js');
    await expect(cloudService.duelRequest('create', { nickname: 'Jogador' })).rejects.toThrow(/Entre na sua conta/);
  });
});
