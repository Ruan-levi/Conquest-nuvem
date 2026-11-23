const React = window.React;
const { useEffect, useState } = React;
const { createRoot } = window.ReactDOM;

const h = React.createElement;
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const storeKey = 'conquest-entregavel5-token';
async function api(path, method = 'GET', data, token = '') {
  const response = await fetch(path, {
    method,
    headers: { ...JSON_HEADERS, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(payload.error || `Erro ${response.status}`);
  return payload;
}
function Input({ label, value, onChange, type = 'text', ...rest }) {
  return h('label', { className: 'e5-field' },
    h('span', null, label),
    h('input', { type, value, onChange: e => onChange(e.target.value), ...rest }));
}
function App() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem(storeKey) || '');
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [ranking, setRanking] = useState([]);
  const [scores, setScores] = useState([]);
  const [players, setPlayers] = useState([]);
  async function refresh(withToken = token) {
    const [newRanking, newScores] = await Promise.all([
      api('/api/ranking'),
      withToken ? api('/api/scores', 'GET', undefined, withToken) : Promise.resolve([]),
    ]);
    setRanking(newRanking); setScores(newScores);
  }
  useEffect(() => {
    const button = document.getElementById('e5-open');
    if (!button) return;
    const clicked = () => { setOpen(true); setMessage(''); };
    button.addEventListener('click', clicked);
    return () => button.removeEventListener('click', clicked);
  }, []);
  useEffect(() => {
    refresh().catch(e => setMessage(e.message));
    if (token) api('/api/me', 'GET', undefined, token).then(setUser).catch(() => {
      setToken(''); sessionStorage.removeItem(storeKey); setUser(null);
    });
  }, [token]);
  useEffect(() => {
    const handler = async event => {
      if (!token) return;
      const result = event.detail || {};
      try {
        await api('/api/scores', 'POST', {
          score: Number(result.score) || 0,
          correct: Number(result.correct) || 0,
          finished: Boolean(result.finished),
        }, token);
        await refresh(token);
        setMessage('Resultado da jornada registrado no SQLite da AWS.');
      } catch(e) { setMessage('Não foi possível salvar o resultado: ' + e.message); }
    };
    window.addEventListener('conquest:finished', handler);
    return () => window.removeEventListener('conquest:finished', handler);
  }, [token]);
  async function submit(event) {
    event.preventDefault(); setMessage('');
    try {
      if (mode === 'register') {
        await api('/api/register', 'POST', { username, display_name: displayName, password });
        setMode('login');setMessage('Cadastro concluído. Agora entre com seu usuário e senha.');
      } else {
        const result = await api('/api/login', 'POST', { username, password });
        sessionStorage.setItem(storeKey, result.token);
        setToken(result.token); setUser(result.user); setPassword('');
        setMessage('Login realizado. Suas próximas partidas serão salvas na AWS.');
      }
    } catch(e) { setMessage(e.message); }
  }
  async function updateName(event) {
    event.preventDefault();
    try {const result=await api('/api/me','PATCH',{display_name:displayName},token);setUser(result);setMessage('Nome público atualizado.');await refresh(token);}
    catch(e){setMessage(e.message);}
  }
  async function listPlayers() {
    try {setPlayers(await api('/api/admin/players','GET',undefined,token));setMessage('Lista de jogadores carregada.');}
    catch(e){setMessage(e.message);}
  }
  async function logout() {
    try{await api('/api/logout','POST',{},token);}catch{}
    sessionStorage.removeItem(storeKey);setToken('');setUser(null);setScores([]);setPlayers([]);setMessage('Você saiu da conta AWS.');
  }
  if (!open) return null;
  return h('div', { className:'e5-backdrop', role:'dialog', 'aria-modal':'true', 'aria-label':'Conta e progresso na AWS' },
    h('div', { className:'e5-modal' },
      h('button',{className:'e5-close',type:'button',onClick:()=>setOpen(false),'aria-label':'Fechar'},'×'),
      h('small',{className:'e5-eyebrow'},'ENTREGÁVEL 5 · AWS EC2'),
      h('h2',null,'Conquest · Meu progresso'),
      h('p',null,'A jornada 3D pode ser jogada sem login. Crie uma conta aqui para salvar pontuações no SQLite da AWS. Duelos online continuam usando as contas Nhost.'),
      message && h('div',{className:'e5-message',role:'status'},message),
      !user ? h('form',{className:'e5-form',onSubmit:submit},
        h('div',{className:'e5-tabs'},
          h('button',{type:'button',onClick:()=>setMode('login'),className:mode==='login'?'current':''},'Entrar'),
          h('button',{type:'button',onClick:()=>setMode('register'),className:mode==='register'?'current':''},'Criar conta')),
        h(Input,{label:'Usuário',value:username,onChange:setUsername,minLength:3,required:true}),
        mode==='register'&&h(Input,{label:'Nome público',value:displayName,onChange:setDisplayName,minLength:2,required:true}),
        h(Input,{label:'Senha (mínimo 10 caracteres)',type:'password',value:password,onChange:setPassword,minLength:10,required:true}),
        h('button',{className:'e5-primary',type:'submit'},mode==='login'?'Entrar na conta':'Cadastrar jogador'))
      : h('section',{className:'e5-account'},
          h('p',null,'Conectado como ',h('strong',null,user.display_name),' · ',user.role),
          h('form',{onSubmit:updateName,className:'e5-inline'},
            h(Input,{label:'Alterar nome no ranking',value:displayName,onChange:setDisplayName,minLength:2,placeholder:user.display_name,required:true}),
            h('button',{className:'e5-primary',type:'submit'},'Atualizar perfil')),
          h('button',{type:'button',className:'e5-secondary',onClick:logout},'Sair da conta')),
      h('div',{className:'e5-columns'},
        h('section',null,h('h3',null,'Ranking AWS (jornadas)'),
          ranking.length?h('ol',null,...ranking.map((r,i)=>h('li',{key:i},`${r.name} — ${r.best_score} pontos`))):h('p',null,'Sem resultados publicados ainda.')),
        h('section',null,h('h3',null,'Meu histórico'),
          !user?h('p',null,'Entre para consultar suas partidas.'):
          scores.length?h('ol',null,...scores.map((r,i)=>h('li',{key:r.id},`${r.score} pontos · ${r.correct} acertos`))):h('p',null,'Jogue uma partida até o fim para registrar sua pontuação.'))),
      user?.role==='admin'&&h('section',{className:'e5-admin'},
        h('button',{type:'button',className:'e5-secondary',onClick:listPlayers},'Ver jogadores cadastrados'),
        players.length>0&&h('ul',null,...players.map(p=>h('li',{key:p.id},`${p.username} · ${p.role}`))))));
}
export function mountEntregavel5() {
  const target=document.getElementById('entregavel5-root');
  if(target)createRoot(target).render(h(App));
}
