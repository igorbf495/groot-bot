#!/bin/bash
# ============================================
# INSTALAÇÃO DO BOT WHATSAPP NO UBUNTU 24
# ============================================

set -e  # Para em caso de erro

echo "🚀 Iniciando instalação do Bot WhatsApp..."

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências do sistema
echo "📦 Instalando dependências..."
sudo apt install -y curl git ffmpeg python3

# 3. Instalar Node.js 20 LTS
echo "📦 Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node -v

# 4. Instalar yt-dlp
echo "📦 Instalando yt-dlp..."
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
yt-dlp --version

# 5. Instalar PM2 globalmente
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# 6. Instalar dependências do projeto
echo "📦 Instalando dependências do projeto..."
npm install

# 7. Setup PM2
echo "⚙️ Configurando PM2..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

echo ""
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 status        - Ver status do bot"
echo "   pm2 logs groot-bot - Ver logs em tempo real"
echo "   pm2 restart groot-bot - Reiniciar bot"
echo ""
echo "⚠️  IMPORTANTE: Escaneie o QR Code que aparecerá nos logs!"
echo "   Rode: pm2 logs groot-bot"
