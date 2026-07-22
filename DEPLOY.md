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
sudo apt install -y curl git ffmpeg aria2 python3
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

## Player de filmes

Coloque apenas vídeos que você tenha autorização para disponibilizar na pasta `filmes/` do projeto. MP4 com vídeo H.264 e áudio AAC oferece a melhor compatibilidade com iPhone, Android e PC.

Variáveis opcionais do serviço:

```bash
MOVIES_DIR=/caminho/para/filmes
MOVIE_PUBLIC_URL=https://grootlab.xyz
MOVIE_SERVER_HOST=127.0.0.1
MOVIE_SERVER_PORT=3000
MOVIE_LINK_HOURS=6
MOVIE_MAX_GB=15
MOVIE_LINK_SECRET=troque-por-um-segredo-longo-e-aleatorio
TMDB_API_TOKEN=seu-api-read-access-token-do-tmdb
```

O registro DNS `A` de `grootlab.xyz` deve apontar para `45.164.135.145`. Instale o proxy e o Certbot:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx-grootlab.conf /etc/nginx/sites-available/grootlab.xyz
sudo ln -s /etc/nginx/sites-available/grootlab.xyz /etc/nginx/sites-enabled/grootlab.xyz
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
sudo certbot --nginx -d grootlab.xyz
sudo certbot renew --dry-run
```

Configuração usada pelo Nginx:

```nginx
server {
    listen 80;
    server_name grootlab.xyz;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

As portas TCP 80 e 443 precisam estar liberadas no firewall da VPS e no painel do provedor. Depois, reinicie o processo do bot com as variáveis atualizadas. No WhatsApp:

```text
!filme
!filme nome do filme
!addfilme URL_DIRETA | Nome do filme
!statusfilme
!cancelarfilme
!addtorrent MAGNET | Nome do filme
!statustorrent
!cancelartorrent
!assistir filme ID_TMDB
!assistir serie ID_TMDB TEMPORADA EPISODIO
!catalogo filmes 1
!catalogo series 1
!buscarfilme nome
!buscarserie nome
```

Os comandos de importação são exclusivos do dono do bot. Use somente links diretos de arquivos próprios, licenciados ou de domínio público.
