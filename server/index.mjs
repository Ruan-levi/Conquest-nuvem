import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createConquestService} from './service.mjs';

const service=createConquestService(process.env.CONQUEST_DB || '/var/lib/conquest/conquest.sqlite');
service.seedAdmin();
const root=resolve(process.env.CONQUEST_DIST || 'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  const path=new URL(req.url,'http://localhost').pathname;
  if(path.startsWith('/api/')){
    try{
      if(req.method==='OPTIONS'){res.writeHead(204).end();return;}
      let input='';for await(const part of req){input+=part;if(input.length>32768){const e=new Error('Requisição muito grande.');e.status=413;throw e;}}
      let body={};if(input){try{body=JSON.parse(input);}catch{const e=new Error('JSON inválido.');e.status=400;throw e;}}
      const token=(req.headers.authorization||'').replace(/^Bearer /i,'');
      const result=service.dispatch(req.method,path,body,token);
      send(200,result);
    }catch(e){const status=e.status || 500;if(status===500)console.error(e);send(status,{error:status===500?'Erro interno.':e.message});}
    return;
  }
  try{
    const relative=decodeURIComponent(path);
    if(relative.includes('..')||relative.includes('\\'))throw Error('Unsafe path');
    const filename=resolve(root,'.'+(relative==='/'?'/index.html':relative));
    if(!filename.startsWith(root+sep))throw Error('Outside');
    const data=await readFile(filename);
    res.writeHead(200,{'Content-Type':types[extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Arquivo não encontrado');}
});
server.listen(Number(process.env.PORT || 4000),'127.0.0.1',()=>console.log('Conquest API e frontend em http://127.0.0.1:'+ (process.env.PORT||4000)));
