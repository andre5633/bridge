# Guia de Implantação (VPS) - Bridge App

Este documento contém o passo a passo para implantar o sistema Bridge (Backend + Frontend + Banco de Dados) em um ambiente de produção (VPS) utilizando Docker e Docker Compose.

## Pré-requisitos na VPS

1. **Servidor (VPS)** rodando Linux (Ubuntu 22.04+ recomendado).
2. **Git** instalado.
3. **Docker** e **Docker Compose** instalados (versão v2+).
4. Portas abertas no Firewall: `80` (Frontend), e opcionalmente `8000` (API Backend - se for exposta diretamente, embora o frontend já aponte para ela).

---

## 1. Obtendo o Repositório e o Banco de Dados

### Clonando o Projeto
Acesse o terminal da sua VPS e clone o repositório principal:
```bash
git clone <URL_DO_SEU_REPOSITORIO> bridge-app
cd bridge-app
```

### Configurando Variáveis de Ambiente
O projeto utiliza um arquivo `.env` para gerenciar configurações sensíveis (senhas de banco, chaves secretas, etc.).

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` com um editor de texto (como `nano` ou `vim`) e preencha com dados seguros de produção.
   ```bash
   nano .env
   ```
   - Altere a senha do `POSTGRES_PASSWORD`
   - Gere e insira uma `SECRET_KEY` segura para a API
   - **MUITO IMPORTANTE:** Em `URL_API_PROD`, coloque o IP da sua VPS ou o seu domínio (ex: `http://203.0.113.50:8000/api/v1` ou `https://api.meudominio.com.br/api/v1`). Isso garantirá que o frontend saiba onde encontrar o backend na web.

---

## 2. Subindo a Aplicação com Docker Compose

Com o arquivo `.env` configurado, a orquestração via Docker cuidará de baixar e construir (build) os serviços (Banco de Dados Postgres, Backend FastAPI e Frontend React/Vite com Nginx).

Execute o seguinte comando na raiz do projeto:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

O comando `-d` rodará os containers em *background* (detached mode), e `--build` forçará a construção das imagens com as variáveis recém-configuradas.

Para checar os logs e verificar se tudo iniciou corretamente:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 3. Configurando o Banco de Dados (Migrações e Seed)

Após subir os containers, o Postgres estará rodando vazio. Precisamos rodar as migrações (criar as tabelas) e, opcionalmente, popular dados iniciais essenciais.

1. **Rodar Migrações do Alembic (Cria a estrutura de tabelas):**
   ```bash
   docker exec -it bridge_api_prod alembic upgrade head
   ```

2. **Popular o Plano de Contas Padrão (Seed):**
   ```bash
   docker exec -it bridge_api_prod python backend/seed_chart_accounts.py
   ```

Agora o banco já está estruturado e pronto para uso pelo sistema.

---

## 4. Acessando o Sistema

- **Frontend:** Abra no navegador o IP da sua VPS: `http://SEU_IP_VPS/`.
- **Backend API (Docs):** A documentação do Swagger estará disponível em `http://SEU_IP_VPS:8000/docs`.

---

## Manutenção Comum

**Como reiniciar a aplicação:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

**Como desligar a aplicação:**
```bash
docker-compose -f docker-compose.prod.yml down
```

**Como atualizar a aplicação após um `git pull`:**
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
docker exec -it bridge_api_prod alembic upgrade head
```
