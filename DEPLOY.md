# 🚀 Deploy do Bot WhatsApp no Ubuntu 24

## Pré-requisitos

- Ubuntu 24.04 LTS
- Acesso root ou sudo
- Mínimo 1GB RAM / 1 vCPU

## Instalação Rápida

```bash
# 1. Clonar/copiar os arquivos para o servidor
cd /home/seu-usuario/
# (copie os arquivos do bot para cá)

# 2. Dar permissão e rodar o script
chmod +x install-ubuntu.sh
./install-ubuntu.sh
```

## Instalação Manual

### 1. Dependências

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ffmpeg python3
```

### 2. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. yt-dlp

```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 4. PM2

```bash
sudo npm install -g pm2
```

### 5. Dependências do projeto

```bash
cd /caminho/do/bot
npm install
```

### 6. Iniciar com PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Seguir instruções para auto-start
```

## Transferir Sessão do Windows

Para não precisar escanear QR novamente:

1. No Windows, copie a pasta `auth_session/` 
2. No Ubuntu, cole na mesma pasta do bot
3. Reinicie: `pm2 restart groot-bot`

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pm2 status` | Ver status |
| `pm2 logs groot-bot` | Ver logs |
| `pm2 restart groot-bot` | Reiniciar |
| `pm2 stop groot-bot` | Parar |
| `pm2 monit` | Monitor interativo |

## Atualizar yt-dlp

```bash
sudo yt-dlp -U
```

## Troubleshooting

### Bot não conecta
- Verifique logs: `pm2 logs groot-bot --lines 100`
- Delete sessão antiga: `rm -rf auth_session/` e escaneie QR novamente

### Erro de permissão
```bash
sudo chown -R $USER:$USER /home/$USER/groot-bot
```

### Download não funciona
```bash
# Verificar ffmpeg
ffmpeg -version

# Verificar yt-dlp
yt-dlp --version
```
