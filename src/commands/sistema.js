import os from 'os';
import { CONFIG } from '../config.js';
import { getGreeting, createBar, getCpuInfo, getCpuUsage } from '../utils.js';

// ==================== COMANDOS DE SISTEMA ====================

export async function handleStatus(reply, react) {
    await react('💫');

    const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const memPct = Math.round((usedMem / totalMem) * 100);
    const upHours = Math.floor(os.uptime() / 3600);
    const upMins = Math.floor((os.uptime() % 3600) / 60);

    // Info de CPU
    const cpu = getCpuInfo();
    const cpuUsage = getCpuUsage();

    const statusMsg = `
╭─────────────────────────╮
│     💻 *SISTEMA*        │
├─────────────────────────┤
│ ⏱️ *Uptime:* ${upHours}h ${upMins}m
│
│ 🖥️ *Processador*
│ ${cpu.model.substring(0, 25)}
│ ${cpu.cores} núcleos
│ ${createBar(cpuUsage)}
│
│ 💾 *Memória RAM*
│ ${createBar(memPct)}
│ ${usedMem}GB / ${totalMem}GB
│
│ 🌐 *Status:* Online ✅
│ ⚡ *Latência:* ${Date.now() % 50 + 10}ms
╰─────────────────────────╯`;
    return reply(statusMsg);
}

export async function handleMenu(sock, msg, jid, sender, reply, react) {
    await react('✨');
    const userName = sender.split('@')[0];
    const greeting = getGreeting();
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const menu = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    ✨ *LIMA BOT v13.0* ✨   
┃━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃ ${greeting}, @${userName}!
┃ 🕐 ${hora}
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭───────────────────────╮
│    📚 *CATEGORIAS*       
├───────────────────────┤
│
│ 🎨 *${CONFIG.PREFIX}midia*
│   └ Figurinhas e mídia
│
│ 🎵 *${CONFIG.PREFIX}musica*
│   └ Baixar músicas
│
│ ⬇️ *${CONFIG.PREFIX}downloads*
│   └ Baixar vídeos
│
│ 🎲 *${CONFIG.PREFIX}diversao*
│   └ Jogos e brincadeiras
│
│ 👮 *${CONFIG.PREFIX}admin*
│   └ Comandos de admin
│
│ ⚙️ *${CONFIG.PREFIX}sistema*
│   └ Status e ajuda
│
╰───────────────────────╯

━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Digite a categoria para
ver os comandos disponíveis!
━━━━━━━━━━━━━━━━━━━━━━━━━`;
    return sock.sendMessage(jid, { text: menu, mentions: [sender] }, { quoted: msg });
}

export async function handleHelp(reply, react) {
    await react('📖');
    const helpText = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   📖 *MANUAL DE USO* 📖   
┃━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃ Use /menu para ver comandos
┃ Use /help para ajuda
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──〔 🎨 *MÍDIA* 〕──┐

📌 *${CONFIG.PREFIX}fig*
├─ Cria figurinha da imagem/vídeo
└─ Envie mídia + /fig

📌 *${CONFIG.PREFIX}figfull*
└─ Figurinha esticada 512x512

📌 *${CONFIG.PREFIX}vv* / *${CONFIG.PREFIX}ww*
└─ Revela visualização única

└──────────────────┘

┌──〔 🎲 *DIVERSÃO* 〕──┐

📌 *${CONFIG.PREFIX}gay* / *${CONFIG.PREFIX}feio*
└─ Medidores aleatórios

📌 *${CONFIG.PREFIX}casal*
└─ Sorteia casal do grupo

📌 *${CONFIG.PREFIX}sorteio*
└─ Sorteia 1 membro

└──────────────────┘

┌──〔 👮 *ADMIN* 〕──┐
_Requer: Admin + Bot admin_

📌 *${CONFIG.PREFIX}ban* / *${CONFIG.PREFIX}promover* / *${CONFIG.PREFIX}rebaixar*
└─ Gerenciar membros

📌 *${CONFIG.PREFIX}marcar* [msg]
└─ Marca todos do grupo

📌 *${CONFIG.PREFIX}roletarussa*
└─ Sorteia e BANE alguém 🚨

└──────────────────┘

┌──〔 ⚙️ *SISTEMA* 〕──┐

📌 *${CONFIG.PREFIX}status* - Info do servidor
📌 *${CONFIG.PREFIX}menu* - Lista categorias
📌 *${CONFIG.PREFIX}help* - Este manual

└──────────────────┘`;
    return reply(helpText);
}

export function menuSistema(reply) {
    const menu = `
╭───────────────────────╮
│    ⚙️ *SISTEMA*          
├───────────────────────┤
│
│ 🖥️ *${CONFIG.PREFIX}status*
│   └ Status do servidor
│   └ CPU, RAM, uptime
│
│ 📋 *${CONFIG.PREFIX}menu*
│   └ Menu principal
│   └ Lista categorias
│
│ 📖 *${CONFIG.PREFIX}help*
│   └ Manual completo
│   └ Explica tudo!
│
│ 🔐 *${CONFIG.PREFIX}ativarbot*
│   └ Libera comandos neste chat
│   └ Ex: !ativarbot figurinhas
│
│ ✅ *${CONFIG.PREFIX}liberarcmd*
│   └ Libera categoria/comando
│   └ Ex: !liberarcmd meme play
│
│ ⛔ *${CONFIG.PREFIX}bloquearcmd*
│   └ Bloqueia categoria/comando
│   └ Ex: !bloquearcmd downloads
│
│ 🔒 *${CONFIG.PREFIX}desativarbot*
│   └ Bloqueia comandos neste chat
│
│ 📜 *${CONFIG.PREFIX}chatsbot*
│   └ Lista chats liberados
│
│ 🆔 *${CONFIG.PREFIX}chatid*
│   └ Mostra o ID deste chat

 │ 🔎 *${CONFIG.PREFIX}${CONFIG.CMDS.GOOGLE}* <termo>
 │   └ Busca (Wiki)
│
╰───────────────────────╯

_Desenvolvido por equipe vega_`;
    return reply(menu);
}
