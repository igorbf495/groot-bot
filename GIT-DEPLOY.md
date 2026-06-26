# 📦 Guia de Deployment com Git

## ✅ Status Atual
- ✅ Git inicializado localmente
- ✅ `.gitignore` configurado (node_modules, auth_session, cookies.txt, etc)
- ✅ Primeiro commit realizado

---

## 🚀 PASSO 1: Configurar GitHub

### 1.1 Criar Repositório Privado no GitHub

1. Acesse: https://github.com/new
2. **Repository name**: `bot-igor`
3. **Description**: Bot de WhatsApp Igor
4. **Visibility**: `Private` (recomendado, pois tem credenciais)
5. **NÃO inicie com README** 
6. Clique em "Create repository"

### 1.2 Conectar Repositório Local ao GitHub

```bash
cd /Users/c3po/Documents/bot-igor

# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/bot-igor.git

# Renomear branch se necessário (git usa 'main' por padrão)
git branch -M main

# Fazer push inicial
git push -u origin main
```

> **Nota**: GitHub pedirá autenticação. Use:
> - **Username**: seu usuário GitHub
> - **Password**: Personal Access Token (gere em https://github.com/settings/tokens)
>   - Escopo necessário: `repo`

---

## 🖥️ PASSO 2: Configurar Servidor Debian 12

### 2.1 Clonar Repositório no Servidor

```bash
# Conectar ao servidor
ssh seu_usuario@seu_servidor

# Navegar até onde quer o bot
cd /opt  # (ou outro diretório)

# Clonar (primeira vez)
git clone https://github.com/SEU_USUARIO/bot-igor.git
cd bot-igor

# Instalar dependências
npm install

# Iniciar com PM2
npm start
```

### 2.2 Configurar Deploy Automático

Crie um script de deploy no servidor:

```bash
sudo nano /opt/bot-igor/deploy.sh
```

**Conteúdo:**

```bash
#!/bin/bash

# Deploy automático - Bot Igor
set -e  # Parar se houver erro

REPO_DIR="/opt/bot-igor"
LOG_FILE="$REPO_DIR/deploy.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando deploy..." >> $LOG_FILE

cd $REPO_DIR

# Fazer pull das mudanças
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fazendo git pull..." >> $LOG_FILE
git pull origin main >> $LOG_FILE 2>&1

# Verificar se package.json mudou
if git diff HEAD~1 package.json > /dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] package.json mudou, reinstalando dependências..." >> $LOG_FILE
    npm install >> $LOG_FILE 2>&1
fi

# Restart PM2
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reiniciando PM2..." >> $LOG_FILE
pm2 restart bot-igor >> $LOG_FILE 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy concluído com sucesso!" >> $LOG_FILE
```

Dar permissão de execução:

```bash
chmod +x /opt/bot-igor/deploy.sh
```

---

## 📋 PASSO 3: Workflow de Desenvolvimento Local

### Fazer Mudanças e Enviar para Servidor

```bash
# 1. Fazer mudanças no código local
nano src/commands/diversao.js
# ... editar arquivo ...

# 2. Verificar o que mudou
git status
git diff src/commands/diversao.js

# 3. Fazer commit
git add src/commands/diversao.js
git commit -m "feat: adicionar comando !novomeme com filtros"

# 4. Fazer push para GitHub
git push origin main

# 5. No servidor, executar deploy (2 opções)

# OPÇÃO A: Manual (mais rápido para testes)
ssh seu_usuario@seu_servidor "/opt/bot-igor/deploy.sh"

# OPÇÃO B: Automático com Webhook (veja PASSO 4)
```

---

## 🔄 PASSO 4: Webhook para Deploy Automático (Opcional)

Se quer que o servidor **automaticamente** faça deploy quando você faz push:

### 4.1 Instalar Webhook Server no Servidor

```bash
# No servidor
sudo apt install -y webhook

# Criar arquivo de configuração
sudo nano /etc/webhook/hooks.json
```

**Conteúdo de `/etc/webhook/hooks.json`:**

```json
[
  {
    "id": "bot-igor-deploy",
    "execute-command": "/opt/bot-igor/deploy.sh",
    "command-working-directory": "/opt/bot-igor",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha256",
        "secret": "SEU_WEBHOOK_SECRET_AQUI",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

### 4.2 Iniciar Webhook Service

```bash
# Iniciar webhook
sudo systemctl start webhook
sudo systemctl enable webhook

# Verificar status
sudo systemctl status webhook
```

### 4.3 Configurar GitHub Webhook

1. Acesse seu repo: https://github.com/SEU_USUARIO/bot-igor
2. Vá para **Settings** → **Webhooks** → **Add webhook**
3. **Payload URL**: `http://SEU_IP_SERVIDOR:9000/hooks/bot-igor-deploy`
4. **Content type**: `application/json`
5. **Secret**: (copie o mesmo `SEU_WEBHOOK_SECRET_AQUI` do arquivo hooks.json)
6. **Events**: `Push events`
7. **Active**: ✅ Marcar
8. Clique em **Add webhook**

Agora, **toda vez que você faz push**, o servidor automaticamente faz deploy! 🚀

---

## 📊 Resumo dos Comandos Úteis

```bash
# Local - Verificar mudanças
git status
git log --oneline
git diff

# Local - Fazer commit
git add .
git commit -m "mensagem descritiva"
git push origin main

# Servidor - Fazer deploy manual
ssh seu_usuario@seu_servidor "/opt/bot-igor/deploy.sh"

# Servidor - Ver logs
tail -f /opt/bot-igor/deploy.log
pm2 logs bot-igor
```

---

## 🔐 Segurança

✅ O `.gitignore` protege:
- `node_modules/` - Dependências (baixadas com npm install)
- `auth_session/` - Credenciais WhatsApp (NUNCA versionar!)
- `cookies.txt` - Sessão
- `creds.json` - Credenciais
- `device-list-*.json` - Informações de dispositivos

⚠️ **NUNCA faça commit de:**
- Arquivos com senhas/tokens
- Arquivos gerados
- Arquivos de sistema

---

## ❓ Troubleshooting

### "Permission denied" ao fazer push
```bash
# Usar SSH em vez de HTTPS
git remote remove origin
git remote add origin git@github.com:SEU_USUARIO/bot-igor.git
ssh-keygen -t ed25519 -C "seu_email@gmail.com"
# Adicionar SSH key em GitHub Settings → SSH keys
```

### Bot não reinicia após deploy
```bash
# Verificar logs do PM2
pm2 logs bot-igor

# Verificar se não há erro de sintaxe
node -c index.js

# Reiniciar manualmente
pm2 restart bot-igor
```

### Deploy falha no servidor
```bash
# Ver logs do deploy
tail -f /opt/bot-igor/deploy.log

# Testar script manualmente
bash /opt/bot-igor/deploy.sh

# Verificar permissões
ls -la /opt/bot-igor/deploy.sh
```

---

## 📝 Próximos Passos

1. ✅ Crie repo no GitHub
2. ✅ Faça primeiro push: `git push -u origin main`
3. ✅ Clone no servidor: `git clone https://github.com/...`
4. ✅ Configure deploy.sh
5. ✅ (Opcional) Configure Webhook para auto-deploy

Depois disso, é só:
```bash
git push  # No local
# Automático no servidor!
```

---

**Dúvidas? Aviso quando ficar confuso!** 🚀
