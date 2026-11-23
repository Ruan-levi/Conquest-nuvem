import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function passwordMatches(password, hash) {
  try {
    const [salt, expected] = hash.split(':');
    const actual = scryptSync(password, salt, 64);
    return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
  } catch { return false; }
}
const tokenHash = token => createHash('sha256').update(token).digest('hex');
const invalid = (code, message) => { const e = new Error(message); e.status = code; throw e; };
const normalize = (value, max = 80) => String(value ?? '').trim().slice(0, max);
function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) invalid(400, 'A senha deve ter entre 10 e 128 caracteres.');
  return value;
}
export function createConquestService(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  db.exec(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'jogador' CHECK(role IN ('admin','jogador')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS access_tokens (
    token_hash TEXT PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id),
    score INTEGER NOT NULL CHECK(score>=0 AND score<=1000000),
    correct INTEGER NOT NULL CHECK(correct>=0 AND correct<=100),
    finished INTEGER NOT NULL CHECK(finished IN (0,1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  const one = (sql,...params) => db.prepare(sql).get(...params);
  const list = (sql,...params) => db.prepare(sql).all(...params);
  const run = (sql,...params) => db.prepare(sql).run(...params);
  const publicUser = user => ({id:user.id,username:user.username,display_name:user.display_name,role:user.role});
  function register(body) {
    const username = normalize(body.username, 32).toLowerCase();
    const displayName = normalize(body.display_name, 40);
    if (!/^[a-z0-9_-]{3,32}$/.test(username)) invalid(400,'Usuário deve ter de 3 a 32 caracteres (letras, números, _ ou -).');
    if (displayName.length < 2) invalid(400,'Informe um nome público com pelo menos 2 caracteres.');
    const hash = passwordHash(validatePassword(body.password));
    try {
      const r = run('INSERT INTO players(username,display_name,password_hash) VALUES(?,?,?)',username,displayName,hash);
      return publicUser(one('SELECT * FROM players WHERE id=?',Number(r.lastInsertRowid)));
    } catch(e) { if(e.code?.startsWith('SQLITE_CONSTRAINT')) invalid(409,'Esse nome de usuário já está cadastrado.');throw e; }
  }
  function session(token) {
    if (!token) invalid(401,'Entre com sua conta para continuar.');
    const user = one('SELECT p.* FROM players p JOIN access_tokens t ON t.player_id=p.id WHERE t.token_hash=? AND t.expires_at>datetime(\'now\')',tokenHash(token));
    if (!user) invalid(401,'Sessão inválida ou expirada.');
    return user;
  }
  function authenticate(body) {
    const user=one('SELECT * FROM players WHERE username=?',normalize(body.username,32).toLowerCase());
    if (!user || !passwordMatches(body.password||'',user.password_hash)) invalid(401,'Usuário ou senha incorretos.');
    const token=randomBytes(32).toString('hex');
    run("INSERT INTO access_tokens(token_hash,player_id,expires_at) VALUES(?,?,datetime('now','+8 hours'))",tokenHash(token),user.id);
    return {token,user:publicUser(user)};
  }
  function seedAdmin() {
    if (!process.env.CONQUEST_ADMIN_PASSWORD) return false;
    const username = normalize(process.env.CONQUEST_ADMIN_USER || 'admin',32).toLowerCase();
    if(one('SELECT id FROM players WHERE username=?',username)) return true;
    run("INSERT INTO players(username,display_name,password_hash,role) VALUES(?,?,?,'admin')",username,'Administrador',passwordHash(validatePassword(process.env.CONQUEST_ADMIN_PASSWORD)));
    return true;
  }
  function dispatch(method,path,body={},token) {
    if (method==='GET' && path==='/api/health') return {status:'ok',service:'Conquest',database:'SQLite'};
    if (method==='GET' && path==='/api/ranking') return list('SELECT p.display_name name,MAX(s.score) best_score,COUNT(s.id) games FROM scores s JOIN players p ON p.id=s.player_id WHERE s.finished=1 GROUP BY p.id ORDER BY best_score DESC, games DESC LIMIT 20');
    if (method==='POST' && path==='/api/register') return register(body);
    if (method==='POST' && path==='/api/login') return authenticate(body);
    const user=session(token);
    if (method==='GET' && path==='/api/me') return publicUser(user);
    if (method==='POST' && path==='/api/logout') {run('DELETE FROM access_tokens WHERE token_hash=?',tokenHash(token));return {ok:true};}
    if (method==='PATCH' && path==='/api/me') {
      const displayName=normalize(body.display_name,40);
      if(displayName.length<2) invalid(400,'Nome público muito curto.');
      run('UPDATE players SET display_name=? WHERE id=?',displayName,user.id);
      return publicUser(one('SELECT * FROM players WHERE id=?',user.id));
    }
    if (method==='POST' && path==='/api/scores') {
      if(!Number.isSafeInteger(body.score)||body.score<0||body.score>1000000||!Number.isSafeInteger(body.correct)||body.correct<0||body.correct>100||typeof body.finished!=='boolean') invalid(400,'Pontuação inválida.');
      const r=run('INSERT INTO scores(player_id,score,correct,finished) VALUES(?,?,?,?)',user.id,body.score,body.correct,body.finished?1:0);
      return {id:Number(r.lastInsertRowid),saved:true};
    }
    if (method==='GET' && path==='/api/scores') return list('SELECT id,score,correct,finished,created_at FROM scores WHERE player_id=? ORDER BY id DESC LIMIT 30',user.id);
    if (method==='GET' && path==='/api/admin/players') {
      if(user.role!=='admin')invalid(403,'Acesso restrito ao administrador.');
      return list('SELECT id,username,display_name,role,created_at FROM players ORDER BY id DESC LIMIT 100');
    }
    invalid(404,'Rota não encontrada.');
  }
  return {dispatch,seedAdmin,close:()=>db.close()};
}
