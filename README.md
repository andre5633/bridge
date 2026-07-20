# Bridge

Sistema financeiro gerencial para produtora de eventos. Cadastra artistas, categorias e eventos, e controla contas bancárias, plano de contas e lançamentos, gerando DRE e análises a partir dessa movimentação.

## Stack

Backend em FastAPI com SQLAlchemy 2 assíncrono sobre PostgreSQL 15, migrations com Alembic e validação com Pydantic 2. O código é organizado por domínio: cada módulo em `app/modules/` tem seus próprios `models`, `schemas`, `repository`, `service` e `router`.

Frontend em React 19 com Vite e TypeScript. O Tailwind vem por CDN, configurado no `index.html`, e não como dependência de build. A navegação é por estado, sem router.

## Rodando

### Desenvolvimento

```bash
cp .env.example .env
docker compose up -d --build
cd frontend && npm install && npm run dev
```

O compose de desenvolvimento sobe o banco na porta 5435 e a API na 8001. O frontend não está no compose — roda pelo Vite na 3001 e aponta para `http://localhost:8001/api/v1`.

O container do backend executa `start.sh` no boot, que aplica as migrations e roda o seed do plano de contas antes de subir o uvicorn. Não é preciso rodar nada disso à mão.

### Produção

```bash
cp .env.example .env
# preencher DATABASE_URL, SECRET_KEY e URL_API_PROD
docker compose -f docker-compose.prod.yml up -d --build
```

Frontend na porta 80 e API na 8000, ambas configuráveis por `FRONTEND_PORT_EXTERNAL` e `API_PORT_EXTERNAL`. Swagger em `/docs`.

O compose de produção **não sobe banco** — o serviço está comentado no arquivo. O PostgreSQL precisa ser externo e apontado por `DATABASE_URL`.

O `VITE_API_URL` é build arg, não variável de runtime: trocar a URL da API exige rebuild da imagem do frontend.

### Variáveis

Só duas são realmente obrigatórias: `DATABASE_URL` e `SECRET_KEY`. O backend não sobe sem elas.

`URL_API_PROD` define para onde o frontend aponta no build de produção. `BACKEND_CORS_ORIGINS` e `ENVIRONMENT` têm valor padrão.

As variáveis `POSTGRES_*` continuam no `.env.example`, mas hoje não são consumidas por nada, já que o serviço de banco saiu do compose.

## Módulos

Tudo sob `/api/v1`, com respostas no envelope `{ "success": true, "data": ... }`.

**Auth** — registro e login com JWT. O token é guardado no `localStorage` sob a chave `finanza_user` e injetado por interceptor do axios.

**Cadastros** — artistas, categorias, contas bancárias e plano de contas, todos com CRUD completo. Na interface, esses quatro são abas da tela de configurações.

**Eventos** — CRUD com vínculo a artista e categoria, orçamento e descrição.

**Lançamentos** — a movimentação financeira que alimenta os relatórios.

**Relatórios** — `GET /reports/dre` e `GET /reports/analytics`.

Há ainda `GET /api/v1/health`, que testa a conexão com o banco.

## Pontos de atenção

O `BACKEND_CORS_ORIGINS` vem com `["*"]` por padrão. Restrinja à origem do frontend antes de expor o sistema — e note que `["*"]` combinado com `allow_credentials=True` é rejeitado pelos navegadores.

O `backend/.env` está versionado com `SECRET_KEY=supersecretkey-change-in-prod`. Troque a chave e tire o arquivo do controle de versão.

O `DEPLOY.md` está desatualizado em três pontos: afirma que o compose sobe o Postgres (não sobe mais), e manda rodar as migrations e o seed manualmente, o que o `start.sh` já faz no boot — sendo que o caminho do seed no comando também está errado.

As telas `CostCenters.tsx` e `Analytics.tsx` estão órfãs, sem rota que as alcance. A de centros de custo é código anterior à API: opera sobre `localStorage` e não existe módulo correspondente no backend.

O `@google/genai` continua no `package.json` mas não é importado por ninguém — o `geminiService.ts` hoje devolve textos fixos. A `GEMINI_API_KEY` no `vite.config.ts` e no `.env.local` é resíduo do mesmo template. O sistema não usa IA.

Não há testes automatizados.
