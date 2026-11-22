# Conquest: validação final de autenticação, ranking e deploy

Este roteiro distingue **código implementado** de **funcionalidade testada ao vivo**.

## 1. Validação automatizada

Na pasta do projeto, com Node 22 ou superior:

```sh
npm ci
npm test
npm run build
```

O workflow `.github/workflows/ci-cd.yml` executa os testes e a compilação
em todo push na `main` e em pull requests. Após a aprovação na `main`, publica
o GitHub Pages e uma imagem GHCR marcada por `latest` e pelo SHA do commit.

Com `NHOST_SUBDOMAIN` e `NHOST_REGION` definidos nas **Variables** do GitHub,
o job `smoke-cloud` confirma que a Function `/duel` responde ao ranking público
com JSON válido. A lista vazia `{"ranking":[]}` é válida quando ainda não
existem duelos encerrados; não deve ser preenchida com pontuações falsas.

Para testar localmente a Function já publicada, use os mesmos valores públicos:

```sh
NHOST_SUBDOMAIN=seu-subdominio NHOST_REGION=sa-east-1 npm run smoke:cloud
```

## 2. Autenticação Nhost (exige teste real)

- Crie duas contas de teste suas no formulário do jogo (e-mails válidos).
- Se o Nhost exigir verificação por e-mail, confirme ambas.
- Faça login, atualize a página e confira se a sessão foi restaurada.
- Saia, tente criar duelo sem login e confirme que o acesso é recusado.
- No Nhost, verifique as contas em **Auth → Users**, sem expor senhas ou tokens.

## 3. Ranking público e duelo entre duas contas

- Com a primeira conta, crie uma sala e copie o código de oito caracteres.
- Com a segunda conta em outro navegador ou dispositivo, entre na sala.
- Responda as seis perguntas com cada jogador; finalize o duelo de ambos.
- Verifique vencedor/empate e confira o ranking público em uma janela anônima.
- Repita uma resposta já enviada: o servidor deve recusar a duplicidade.
- Confirme a atualização do ranking em tempo real ou, na indisponibilidade de
  WebSocket, a consulta automática a cada dez segundos.
- Verifique que a resposta pública não contém e-mail nem ID interno.

**Importante:** a campanha 3D ainda guarda pontos ilustrativos calculados no
navegador. Eles não entram no ranking verificado dos duelos, evitando fraude.

## 4. Publicação Oracle Cloud e Portainer (pendente de infraestrutura)

O GitHub Pages não substitui a VPS Oracle exigida no trabalho. Siga
`infra/oci/README.md` para provisionar a VPS, instalar Docker/Portainer,
configurar HTTPS e iniciar a Stack. Nunca publique credenciais no repositório.

O job `deploy-oci` só é habilitado com a variável de repositório
`ENABLE_OCI_DEPLOY=true` e o segredo `PORTAINER_WEBHOOK_URL` **quando o
tipo de Stack do Portainer suportar esse webhook**. No Portainer CE com
repositório Git, utilize GitOps/polling com repull da imagem, conforme a
documentação de infraestrutura. Não habilite o webhook sem infraestrutura real.

Após a implantação, prove em vídeo ou ao vivo:

1. Jogo acessível em HTTPS no domínio/IP configurado da VPS.
2. Container e logs saudáveis no Portainer.
3. Build/testes e publicação de imagem no GitHub Actions.
4. Atualização efetiva da versão da aplicação na Oracle Cloud.

## Situação após esta revisão

- **Código:** cadastro/login, ranking público do duelo, segurança do resultado
  na Function, testes e pipeline de build/imagem/Pages existentes; validações
  automáticas adicionais incluídas.
- **Serviço público:** o GET da Function foi acessado sem autenticação e
  devolveu `{"ranking":[]}` no momento da verificação.
- **Ainda sem confirmação:** duelo completo com duas contas reais e deploy na
  Oracle Cloud/Portainer. Não declarar esses itens concluídos sem testar.
