# PC&MR — novo site

Site original em React, TypeScript e Vite, com servidor Express e SQLite. Desenvolvido neste repositório, sem conexão com o FluxBroker e sem alterar o site atualmente publicado.

## Experimentar

O arquivo `artifacts/pcmr-preview.html` é uma prévia interativa independente: abra-o no navegador, sem instalação ou conexão. Contém a imagem e as fontes. Os filtros, detalhes, menu, FAQ e formulário funcionam; **a cotação neste arquivo é uma simulação explícita, sem envio nem armazenamento de dados**.

Para gerar novamente o arquivo:

```sh
npm ci
npm run build:preview
```

Para executar o site com registro real dos pedidos no servidor da prévia:

```sh
# Node.js 24.x (veja .nvmrc)
npm ci
npm run dev
```

O servidor escuta na porta 3000 e disponibiliza `GET /api/health`. Vite é integrado ao mesmo servidor, portanto não há dependência de uma segunda API nem configuração de CORS. No ambiente em nuvem, o processo precisa de permissão para escutar portas locais. Para produção: `npm run build && npm start`. O servidor se vincula a `0.0.0.0`; use HTTPS no proxy de entrada quando disponibilizá-lo externamente.

## O que foi implementado

- Layout original responsivo, com a paleta exata do manual: marinho `#15294D`, coral `#F14E49` e marfim `#FCF9ED`.
- Montserrat hospedada localmente; fotografia editorial gerada para este projeto e otimizada em WebP.
- Catálogo de proteção com filtros e detalhes, apresentação institucional, etapas da contratação e FAQ acessível.
- Cotação em três etapas: tipo de proteção, dados e autorização, revisão. Validação no cliente e no servidor.
- API com gravação em SQLite, protocolo UUID, proteção contra envio duplicado, limite de requisições, honeypot e verificação de origem.
- Retentativa após falha de conexão, preservando os campos na memória da página; sucesso só após confirmação do servidor.
- Modais nativos com foco contido, retorno de foco, fechamento por Escape e suporte a movimento reduzido.
- Aviso de privacidade transparente sobre o funcionamento desta prévia.
- Build para produção, testes do servidor e testes reais no Chromium.

## Dados e configuração

Não são necessárias credenciais para desenvolver. O Node carrega um `.env` opcional, ignorado pelo Git; `.env.example` documenta os nomes disponíveis. Valores exportados no ambiente têm precedência.

| Variável           | Padrão               | Finalidade                                                                                                      |
| ------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `PORT`             | `3000`               | Porta HTTP                                                                                                      |
| `HOST`             | `0.0.0.0`            | Interface HTTP                                                                                                  |
| `DATA_DIR`         | `.data`              | Diretório privado do banco; use volume persistente em um deploy                                                 |
| `SITE_ORIGIN`      | Origem da requisição | Origem exata autorizada; configure a URL HTTPS do novo ambiente para produção                                   |
| `TRUST_PROXY_HOPS` | Não definido         | Configure somente atrás de um proxy confiável, de 1 a 3 saltos; afeta o IP utilizado pelo limite de requisições |

Os pedidos ficam em `.data/quotes.sqlite`, fora dos arquivos públicos e ignorados pelo Git. Não existe endpoint público para listar dados de clientes. O registro inclui autorização e data, sem documentos nem dados sensíveis de saúde. Os testes usam dados fictícios `example.com` e bancos temporários. Os testes de navegador gravam uma solicitação fictícia no banco do servidor sob teste; prefira um `DATA_DIR` temporário para essa finalidade.

Esta entrega **não envia e-mails, WhatsApp ou notificações**. O modo servido registra os pedidos localmente; o HTML independente apenas simula. Uma futura operação comercial precisa definir um destino autorizado de atendimento, retenção de dados, backup e acesso à fila de solicitações. Nunca exponha o arquivo SQLite via servidor estático.

## Validação

```sh
npm test            # 8 testes reais de API, validação e persistência
npm run build      # TypeScript + build Vite
npm run test:e2e    # com npm run dev em execução
```

Os testes E2E usam Python com Playwright e Chromium em `/usr/bin/chromium`, disponíveis neste ambiente. Em outro computador, instale esses pré-requisitos. `BASE_URL` permite usar outro endereço. Os testes exercitam filtros, modais, formulário, consentimento, persistência via API, falha de rede e telas de 320, 390, 768, 1024 e 1440 pixels. Capturas e relatório ficam em `test-results/`, ignorado pelo Git.

`npm run test:preview` valida o arquivo independente, sem API nem requisições externas, e `npm run test:a11y` verifica a página e os estados do formulário com axe-core. A verificação automatizada não substitui uma auditoria manual completa de acessibilidade.

O workflow em `.github/workflows/ci.yml` executa testes de API e build com Node 24. Para formatar: `npm run format`.

## Conteúdo e publicação

Veja `docs/content-sources.md` para origem dos fatos e pendências comerciais. O acesso ao site atual foi bloqueado pela política de rede do ambiente; não foram copiados seu design, estrutura ou código. O catálogo é uma proposta editorial a validar com a corretora.

A prévia contém `noindex, nofollow`. Não a publique como site definitivo antes de confirmar catálogo, contatos, identificação jurídica, arquivos oficiais de logo, atendimento dos pedidos e aviso final de privacidade. Não foram feitas alterações de DNS, deploy, push ou mudanças no site publicado.

## Organização

```text
src/                 interface, conteúdo e estilos
server/              API e servidor de desenvolvimento/produção
public/images/       imagem original otimizada
scripts/             empacotamento da prévia independente
tests/               API, navegador, acessibilidade e prévia
docs/                manual recebido e origem do conteúdo
artifacts/           HTML independente e capturas geradas (ignorado)
.data/               dados privados em execução (ignorado)
```

Use o checkout existente em `/workspace/site-novo-pcmr`. Cada tarefa na nuvem já é isolada; não é necessário criar um worktree.
