import { CONFIG } from '../config.js';

// ==================== COMANDOS DE ADMIN ====================

export async function handleBanPromover(sock, msg, jid, sender, botNumber, cmdArgs, command, isGroup, isAdmin, isBotAdmin, reply) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }
    if (!isAdmin) {
        return reply('╭──────────────╮\n│ 🚫 *NEGADO*       │\n├──────────────┤\n│ Apenas admins     │\n│ podem usar este   │\n│ comando!          │\n╰──────────────╯');
    }
    if (!isBotAdmin) {
        return reply('╭──────────────╮\n│ ⚠️ *ATENÇÃO*      │\n├──────────────┤\n│ Preciso ser admin │\n│ para executar     │\n│ esta ação!        │\n╰──────────────╯');
    }

    let tgt = null;
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (contextInfo?.mentionedJid?.length > 0) {
        tgt = contextInfo.mentionedJid[0];
    } else if (contextInfo?.participant) {
        tgt = contextInfo.participant;
    } else if (cmdArgs) {
        const numero = cmdArgs.replace(/\D/g, '');
        if (numero.length >= 10) {
            tgt = numero + '@s.whatsapp.net';
        }
    }

    if (!tgt) {
        return reply('╭──────────────╮\n│ ⚠️ *COMO USAR*    │\n├──────────────┤\n│ • Marque @alguém  │\n│ • Responda msg    │\n│ • Digite número   │\n╰──────────────╯');
    }

    if (tgt === botNumber) {
        return reply('╭──────────────╮\n│ 🤖 *OPS!*         │\n├──────────────┤\n│ Não posso fazer   │\n│ isso comigo       │\n│ mesmo! 😅         │\n╰──────────────╯');
    }

    const act = command === CONFIG.CMDS.BAN ? 'remove' : (command === CONFIG.CMDS.PROMOVER ? 'promote' : 'demote');
    const emoji = command === CONFIG.CMDS.BAN ? '🚫' : (command === CONFIG.CMDS.PROMOVER ? '⬆️' : '⬇️');
    const actionName = command === CONFIG.CMDS.BAN ? 'BANIDO' : (command === CONFIG.CMDS.PROMOVER ? 'PROMOVIDO' : 'REBAIXADO');

    try {
        await sock.groupParticipantsUpdate(jid, [tgt], act);
        const sucessoMsg = `
╭───────────────────────╮
│ ${emoji} *${actionName}* ${emoji}
├───────────────────────┤
│
│ 👤 @${tgt.split('@')[0]}
│
│ ✅ Ação executada
│    com sucesso!
│
╰───────────────────────╯`;
        await sock.sendMessage(jid, { text: sucessoMsg, mentions: [tgt] }, { quoted: msg });
    } catch (e) {
        await reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Não foi possível  │\n│ executar a ação.  │\n│ Usuário pode não  │\n│ estar no grupo.   │\n╰──────────────╯');
    }
}

export async function handleMarcar(sock, msg, jid, cmdArgs, isGroup, isAdmin, groupMetadata, reply) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }
    if (!isAdmin) {
        return reply('╭──────────────╮\n│ 🚫 *NEGADO*       │\n├──────────────┤\n│ Apenas admins     │\n│ podem usar este   │\n│ comando!          │\n╰──────────────╯');
    }

    const msgTexto = cmdArgs || 'Atenção!';
    const todosMarcados = groupMetadata.participants.map(p => `@${p.id.split('@')[0]}`).join(' ');
    const marcarMsg = `
╭───────────────────────╮
│   📢 *AVISO GERAL* 📢  
├───────────────────────┤
│
│ 💬 ${msgTexto}
│
├───────────────────────┤
│ 👥 *Marcados:*
│ ${todosMarcados}
│
╰───────────────────────╯`;
    await sock.sendMessage(jid, {
        text: marcarMsg,
        mentions: groupMetadata.participants.map(p => p.id)
    }, { quoted: msg });
}

export async function handleRoletaRussa(sock, msg, jid, botNumber, isGroup, isAdmin, isBotAdmin, groupMetadata, reply, react) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }
    if (!isAdmin) {
        return reply('╭──────────────╮\n│ 🚫 *NEGADO*       │\n├──────────────┤\n│ Apenas admins     │\n│ podem usar este   │\n│ comando!          │\n╰──────────────╯');
    }
    if (!isBotAdmin) {
        return reply('╭──────────────╮\n│ ⚠️ *ATENÇÃO*      │\n├──────────────┤\n│ Preciso ser admin │\n│ para executar     │\n│ esta ação!        │\n╰──────────────╯');
    }

    const membrosComuns = groupMetadata.participants.filter(p =>
        !p.admin && p.id !== botNumber
    );

    if (membrosComuns.length === 0) {
        return reply('╭──────────────╮\n│ 🔫 *ROLETA*       │\n├──────────────┤\n│ Não há membros    │\n│ comuns para       │\n│ sortear!          │\n╰──────────────╯');
    }

    await react('🔫');

    const suspenseMsg = `
╭───────────────────────╮
│   🔫 *ROLETA RUSSA* 🔫  
├───────────────────────┤
│
│ 🎰 Girando o tambor...
│
│ 🟢 🟢 🟢 🟢 🟢 🔴
│
╰───────────────────────╯`;
    await reply(suspenseMsg);

    await new Promise(r => setTimeout(r, 2000));

    const vitima = membrosComuns[Math.floor(Math.random() * membrosComuns.length)].id;

    // Mensagem ANTES de banir para que todos vejam quem foi
    const roletaMsg = `
╭───────────────────────╮
│   🔫 *ROLETA RUSSA* 🔫  
├───────────────────────┤
│
│ 💥 *BANG!* 💥
│
│ 💀 A vítima foi:
│ 
│    🚫 @${vitima.split('@')[0]}
│
│ _Descanse em paz..._
│
╰───────────────────────╯`;
    await sock.sendMessage(jid, { text: roletaMsg, mentions: [vitima] }, { quoted: msg });

    // Agora bane
    try {
        await sock.groupParticipantsUpdate(jid, [vitima], 'remove');
    } catch (e) {
        await reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Não consegui      │\n│ remover o membro! │\n╰──────────────╯');
    }
}

export async function handleAdd(sock, msg, jid, cmdArgs, isGroup, isAdmin, isBotAdmin, reply) {
    if (!isGroup) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Use apenas em     │\n│ grupos!           │\n╰──────────────╯');
    }
    if (!isAdmin) {
        return reply('╭──────────────╮\n│ 🚫 *NEGADO*       │\n├──────────────┤\n│ Apenas admins     │\n│ podem usar este   │\n│ comando!          │\n╰──────────────╯');
    }
    if (!isBotAdmin) {
        return reply('╭──────────────╮\n│ ⚠️ *ATENÇÃO*      │\n├──────────────┤\n│ Preciso ser admin │\n│ para executar     │\n│ esta ação!        │\n╰──────────────╯');
    }

    if (!cmdArgs) {
        return reply('╭──────────────╮\n│ ⚠️ *COMO USAR*    │\n├──────────────┤\n│ /add 5511999999999│\n│                   │\n│ Digite o número   │\n│ completo com DDD  │\n╰──────────────╯');
    }

    const numero = cmdArgs.replace(/\D/g, '');
    if (numero.length < 10) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Número inválido!  │\n│ Use formato:      │\n│ 5511999999999     │\n╰──────────────╯');
    }

    const tgt = numero + '@s.whatsapp.net';

    try {
        await sock.groupParticipantsUpdate(jid, [tgt], 'add');
        const sucessoMsg = `
╭───────────────────────╮
│ ➕ *ADICIONADO* ➕
├───────────────────────┤
│
│ 👤 @${numero}
│
│ ✅ Membro adicionado
│    com sucesso!
│
╰───────────────────────╯`;
        await sock.sendMessage(jid, { text: sucessoMsg, mentions: [tgt] }, { quoted: msg });
    } catch (e) {
        let errorMsg = 'Não foi possível\n│ adicionar.';
        if (e.message?.includes('not-authorized')) {
            errorMsg = 'Número bloqueou\n│ convites de grupo';
        } else if (e.message?.includes('403')) {
            errorMsg = 'Privacidade do\n│ usuário não permite';
        }
        await reply(`╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ ${errorMsg}   │\n╰──────────────╯`);
    }
}

export function menuAdmin(reply) {
    const menu = `
╭───────────────────────╮
│    👮 *ADMIN*            
├───────────────────────┤
│ _Requer: Admin + Bot admin_
│
│ ➕ *${CONFIG.PREFIX}add* número
│   └ Adiciona ao grupo
│
│ 🚫 *${CONFIG.PREFIX}ban* @user
│   └ Remove do grupo
│
│ ⬆️ *${CONFIG.PREFIX}promover* @user
│   └ Torna administrador
│
│ ⬇️ *${CONFIG.PREFIX}rebaixar* @user
│   └ Remove cargo admin
│
│ 📢 *${CONFIG.PREFIX}marcar* [msg]
│   └ Marca todos
│
│ 🔫 *${CONFIG.PREFIX}roletarussa*
│   └ Sorteia e BANE 1
│
╰───────────────────────╯`;
    return reply(menu);
}
