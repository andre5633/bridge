# Guia: Como enviar o projeto para o GitHub (ou outro Git)

Como o projeto ainda não está inicializado como um repositório Git, siga os passos abaixo para configurá-lo e enviá-lo para a nuvem.

### 1. Inicializar o Repositório Local
Abra o terminal na pasta raiz do projeto (`Bridge`) e execute:
```bash
git init
```

### 2. Adicionar os Arquivos
Adicione todos os arquivos ao controle de versão (o arquivo `.gitignore` que eu criei garantirá que arquivos sensíveis como `.env` não sejam enviados):
```bash
git add .
```

### 3. Fazer o Primeiro Commit
Crie o primeiro ponto de restauração do seu código:
```bash
git commit -m "feat: configuração inicial e arquivos de produção/VPS"
```

### 4. Criar o Repositório no GitHub
1. Vá para [github.com/new](https://github.com/new).
2. Dê um nome ao repositório (ex: `bridge-management-system`).
3. Clique em **Create repository** (não marque as opções de "Initialize repository with a README" pois já temos os arquivos).

### 5. Conectar o Local ao Remoto
Copie os comandos que o GitHub mostrará e cole no seu terminal. Eles serão parecidos com estes:
```bash
# Substitua pela URL que o GitHub fornecer:
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
```

---

### Dicas Importantes:
* **Segurança:** Nunca remova o `.env` do `.gitignore`. Se precisar mudar alguma configuração, use o arquivo `.env.example` como base.
* **VPS:** Na sua VPS, o primeiro passo do `DEPLOY.md` será justamente fazer o `git clone` dessa URL que você acabou de criar.
* **Atualizações:** Sempre que fizer mudanças, use `git add .`, `git commit -m "mensagem"` e `git push` para manter o GitHub atualizado.
