import { CONFIG } from '../config.js';
import { createBar } from '../utils.js';

// ==================== COMANDOS DE DIVERSÃO ====================

export async function handleGayFeio(command, reply) {
    const pct = Math.floor(Math.random() * 101);
    const isGay = command === CONFIG.CMDS.GAY;
    const emoji = isGay ? '🏳️‍🌈' : '👹';
    const title = isGay ? 'MEDIDOR GAY' : 'MEDIDOR DE FEIURA';
    const desc = pct <= 25 ? (isGay ? 'Hétero demais!' : 'Lindo(a) demais!') :
        pct <= 50 ? (isGay ? 'Um pouco...' : 'Normal, de boa') :
            pct <= 75 ? (isGay ? 'Bastante! 🌈' : 'Feinho(a) ein') :
                (isGay ? 'MUITO GAY! 🏳️‍🌈💅' : 'SOCORRO! 💀');

    const resultado = `
╭──────────────────────╮
│ ${emoji} *${title}* ${emoji}
├──────────────────────┤
│
│ ${createBar(pct)}
│
│ 💬 _${desc}_
│
╰──────────────────────╯`;
    return reply(resultado);
}

export async function handlePica(reply) {
    const tamanho = Math.floor(Math.random() * 18) + 6; // De 6cm a 23cm
    const emojis = ['🍌', '🌶️', '🔞'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const desc = tamanho <= 8 ? 'Micro penis 😅' :
        tamanho <= 12 ? 'Pequeno demais 😒' :
            tamanho <= 16 ? 'Normal, passa 😏' :
                'CARAMBA! 🥵';

    const resultado = `
╭──────────────────────╮
│ ${emoji} *MEDIDOR DE PICA* ${emoji}
├──────────────────────┤
│
│ 📏 *Resultado: ${tamanho}cm*
│
│ 💬 _${desc}_
│
╰──────────────────────╯`;
    return reply(resultado);
}

export async function handleBomDia(sock, msg, jid, isGroup, groupMetadata, reply) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }

    const participantes = groupMetadata.participants;
    const mentions = participantes.map(p => p.id);
    
    const hora = new Date().getHours();
    const greeting = hora >= 5 && hora < 12 ? '🌅' : hora >= 12 && hora < 18 ? '☀️' : '🌙';
    
    const bomdiaMsg = `
╭───────────────────────────────────────╮
│ ${greeting} *BOM DIA FDP!* ${greeting}
├───────────────────────────────────────┤
│
│ QUEM ACORDAR POR ULTIMO É VIADO! 😂
│ ${mentions.map(m => `@${m.split('@')[0]}`).join(', ')}
│
╰───────────────────────────────────────╯`;
    
    return sock.sendMessage(jid, { text: bomdiaMsg, mentions }, { quoted: msg });
}

export async function handleMoeda(reply) {
    const resultado = Math.random() < 0.5 ? 'CARA' : 'COROA';
    const emoji = resultado === 'CARA' ? '🪙' : '🪙';
    const emojiFinal = resultado === 'CARA' ? '👤' : '🦅';

    const moedaMsg = `
╭──────────────────────╮
│ 🪙 *CARA OU COROA?* 🪙
├──────────────────────┤
│
│ ${emojiFinal} *${resultado}!* ${emojiFinal}
│
╰──────────────────────╯`;
    
    return reply(moedaMsg);
}

export async function handleXingar(sock, jid, msg, groupMetadata, reply) {
    if (!groupMetadata) {
        return reply('❌ Este comando só funciona em grupos!');
    }

    // Lista de xingamentos bem pesados e criativos
 const xingamentos = [
        'O que tu quer ta mole 🧊🤏',
        'Vai tomar no seu cu 🖕🍑',
        'Vai se fuder 🤬🖕',
        'Vai se arrombar 🕳️🧨',
        'Vai tomar no meio do olho do seu cu 👁️🫵🍑',
        'Boiola 💅🌈🔥',
        'Vc da muito é o cu 🥒🍑',
        'Gosto de pica no cu 🍆🍑',
    ];

    // Pega um membro aleatório do grupo (exceto o bot)
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const membrosDoGrupo = groupMetadata.participants.filter(p => p.id !== botNumber);
    
    if (membrosDoGrupo.length === 0) {
        return reply('Só tem bot aqui! 🤖');
    }

    const vítima = membrosDoGrupo[Math.floor(Math.random() * membrosDoGrupo.length)];
    const xingamento = xingamentos[Math.floor(Math.random() * xingamentos.length)];
    
    const nome = vítima.id.split('@')[0];

    const resultado = `
╭──────────────────────────────╮
│ 💣 *KITA NAO* 💣
├──────────────────────────────┤
│
│ @${nome}
│
├──────────────────────────────┤
│
│ ${xingamento}
│
╰──────────────────────────────╯`;

    return sock.sendMessage(jid, { text: resultado, mentions: [vítima.id] }, { quoted: msg });
}

export async function handleCasal(sock, msg, jid, isGroup, groupMetadata, reply) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }

    const participantes = groupMetadata.participants;
    if (participantes.length < 2) {
        return reply('❌ Precisa de pelo menos 2 pessoas!');
    }

    const shuffled = [...participantes].sort(() => Math.random() - 0.5);
    const p1 = shuffled[0].id;
    const p2 = shuffled[1].id;
    const amor = Math.floor(Math.random() * 101);

    const casalMsg = `
╭───────────────────────╮
│   💑 *CASAL SORTEADO* 💑
├───────────────────────┤
│
│ 💘 @${p1.split('@')[0]}
│         ❤️ + ❤️
│ 💘 @${p2.split('@')[0]}
│
├───────────────────────┤
│ 💕 *Compatibilidade:*
│ ${createBar(amor)}
│
╰───────────────────────╯`;
    return sock.sendMessage(jid, { text: casalMsg, mentions: [p1, p2] }, { quoted: msg });
}

export async function handleSorteio(sock, msg, jid, isGroup, groupMetadata, reply) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }

    const winner = groupMetadata.participants[Math.floor(Math.random() * groupMetadata.participants.length)].id;
    const sorteioMsg = `
╭───────────────────────╮
│   🎰 *SORTEIO* 🎰      
├───────────────────────┤
│
│ 🎊 *PARABÉNS!* 🎊
│
│ 🏆 O vencedor é:
│ 
│    👤 @${winner.split('@')[0]}
│
╰───────────────────────╯`;
    return sock.sendMessage(jid, { text: sorteioMsg, mentions: [winner] }, { quoted: msg });
}

export async function handleMeme(sock, msg, jid, reply, react) {
    try {
        await react('😂');
        
        // Busca meme de uma API pública
        const response = await fetch('https://api.imgflip.com/get_memes');
        const data = await response.json();
        
        if (!data.success || !data.memes || data.memes.length === 0) {
            return reply('❌ Erro ao buscar meme. Tente novamente!');
        }
        
        // Seleciona um meme aleatório
        const meme = data.memes[Math.floor(Math.random() * data.memes.length)];
        
        // Envia a imagem do meme
        const memeMsg = `
╭───────────────────────╮
│     😂 *MEME DO DIA* 😂
├───────────────────────┤
│
│ _${meme.name}_
│
╰───────────────────────╯`;
        
        // Envia mensagem + imagem
        await sock.sendMessage(jid, { text: memeMsg }, { quoted: msg });
        await sock.sendMessage(jid, { 
            image: { url: meme.url },
            caption: meme.name
        }, { quoted: msg });
        
        await react('🤣');
    } catch (error) {
        console.error('[ERRO] Meme:', error.message);
        return reply('❌ Erro ao buscar meme: ' + error.message);
    }
}

export function menuDiversao(reply) {
    const menu = `
╭───────────────────────╮
│    🎲 *DIVERSÃO*          
├───────────────────────┤
│
│ 🏳️‍🌈 *${CONFIG.PREFIX}gay*
│   └ Medidor gay (0-100%)
│   └ Diversão apenas!
│
│ 👹 *${CONFIG.PREFIX}feio*
│   └ Medidor de feiura
│   └ Quanto você é feio?
│
│ 🍌 *${CONFIG.PREFIX}pica*
│   └ Medidor de pica
│   └ De 6cm a 23cm
│
│ 🌅 *${CONFIG.PREFIX}bomdia*
│   └ Mensagem de bom dia
│   └ Marca todos do grupo
│   └ ⚠️ Só em grupos
|
│
│ 🪙 *${CONFIG.PREFIX}moeda*
│   └ Cara ou coroa?
│   └ Resultado aleatório
│
│ 💑 *${CONFIG.PREFIX}casal*
│   └ Sorteia um casal
│   └ Mostra compatibilidade
│   └ ⚠️ Só em grupos
│
│ 🎰 *${CONFIG.PREFIX}sorteio*
│   └ Sorteia 1 membro
│   └ ⚠️ Só em grupos
│
│ 💣 *${CONFIG.PREFIX}xingar*
│   └ Xinga alguém aleatório
│   └ Bem pesado e criativo!
│   └ ⚠️ Só em grupos
│
│ 😂 *${CONFIG.PREFIX}meme*
│   └ Envia um meme aleatório
│   └ Direto da internet
│
╰───────────────────────╯`;
    return reply(menu);
}
