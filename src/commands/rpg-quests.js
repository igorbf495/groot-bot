import { CONFIG } from '../config.js';
import { createBar } from '../utils.js';
import {
    getPlayer,
    modificarOuro,
    adicionarXP,
    deletarJogador,
    updatePlayer,
    obterStatusQuest,
    completarQuest,
    obterTierELO,
    obterBarraELO,
    resetarQuestsDoDia,
} from '../data/rpg.js';

// ==================== QUESTS ====================

/**
 * Mostrar quests disponíveis
 */
export async function handleQuests(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) return reply(`Crie um personagem primeiro! Use *${CONFIG.PREFIX}criar*.`);
    
    await react('📋');
    
    // Inicializar quests se não existir
    if (!player.quests) {
        resetarQuestsDoDia(player);
        updatePlayer(sender, player);
    }
    
    const questAtual = obterStatusQuest(player);
    
    let mensagem = `
╭─────────────────────────╮
│   📋 *MISSÕES DO DIA*     
├─────────────────────────┤
│
│ *Quest Atual:*
│ ${questAtual.emoji} **${questAtual.nome}**
│
│ ${questAtual.descricao}
│ ${createBar(questAtual.percentual)}
│ Progresso: ${questAtual.progresso}/${questAtual.total}
│
│ *Recompensa:*`;
    
    if (questAtual.recompensa.xp) mensagem += `\n│ ⭐ XP: +${questAtual.recompensa.xp}`;
    if (questAtual.recompensa.ouro) mensagem += `\n│ 💰 Ouro: +${questAtual.recompensa.ouro}`;
    if (questAtual.recompensa.elo) mensagem += `\n│ 🏆 ELO: +${questAtual.recompensa.elo}`;
    
    if (questAtual.completada) {
        mensagem += `\n│\n│ ✅ *QUEST COMPLETADA!*\n│ Use *${CONFIG.PREFIX}completarquest* para receber!`;
    }
    
    mensagem += `\n│\n│ 🔄 *Novas quests amanhã!*
╰─────────────────────────╯`;
    
    return reply(mensagem);
}

/**
 * Completar quest atual
 */
export async function handleCompletarQuest(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) return reply(`Crie um personagem primeiro! Use *${CONFIG.PREFIX}criar*.`);
    
    if (!player.quests?.atual) {
        return reply('Você não tem uma quest ativa! Use *!quests*');
    }
    
    if (!player.quests.atual.completada) {
        const status = obterStatusQuest(player);
        return reply(`Quest ainda não foi completada!\n\n${status.nome}: ${status.progresso}/${status.total} (${status.percentual}%)`);
    }
    
    // Completar quest e receber recompensas
    const recompensa = completarQuest(player);
    
    if (!recompensa) {
        return reply('❌ Erro ao completar quest!');
    }
    
    updatePlayer(sender, player);
    
    let mensagem = `╭─────────────────────────╮\n│   ✅ *QUEST COMPLETADA!*     \n├─────────────────────────┤\n│\n│ 🎉 Parabéns!\n│\n│ *Recompensas:*`;
    
    if (recompensa.xp) mensagem += `\n│ ⭐ XP: +${recompensa.xp}`;
    if (recompensa.ouro) mensagem += `\n│ 💰 Ouro: +${recompensa.ouro}`;
    if (recompensa.elo) mensagem += `\n│ 🏆 ELO: +${recompensa.elo}`;
    
    mensagem += `\n│\n│ Nova quest amanhã!
╰─────────────────────────╯`;
    
    await react('✅');
    return reply(mensagem);
}

/**
 * Exibe o ranking de ELO do jogador
 */
export async function handleRankingJogador(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) return reply(`Crie um personagem primeiro! Use *${CONFIG.PREFIX}criar*.`);
    
    const tierInfo = obterTierELO(player.elo || 1600);
    const barra = obterBarraELO(player.elo || 1600);
    
    let mensagem = `╭─────────────────────────────────╮
│      🏆 *RANKING DO JOGADOR*     
├─────────────────────────────────┤
│
│ 👤 *${player.nome}*
│ 📊 Nível: ${player.level}
│
│ ${tierInfo.emoji} *${tierInfo.tier} ${tierInfo.divisao}*
│ ELO: ${tierInfo.elo}
│ 
│ Progresso para próx.:
│ ${barra}
│ ${tierInfo.eloMin}-${tierInfo.eloMax === Infinity ? '∞' : tierInfo.eloMax}
│
│ ⭐ *Estatísticas:*
│ ├ Total Vitorias: ${player.vitorias || 0}
│ ├ Total Derrotas: ${player.derrotas || 0}
│ ├ Taxa: ${((player.vitorias || 0) / (Math.max(1, (player.vitorias || 0) + (player.derrotas || 0))) * 100).toFixed(1)}%
│ └ ELO Total: ${player.elo || 1600}
│
├─────────────────────────────────┤
│ 📋 *SISTEMA DE ELOS:*
│
│ ⚫ Ferro:    0-1.099 ELO
│ 🔶 Prata:   1.100-1.599 ELO
│ 🟡 Ouro:    1.600-1.999 ELO
│ 💎 Platina: 2.000-2.399 ELO
│ 💠 Diamante: 2.400-2.899 ELO
│ 👑 Mestre:  2.900+ ELO
│
╰─────────────────────────────────╯`;
    
    await react('🏆');
    return reply(mensagem);
}

// ==================== ADMIN COMMANDS ====================

export async function handleDarOuro(sock, msg, jid, sender, mentioned, cmdArgs, reply, react, botNumber) {
    const args = cmdArgs.trim().split(' ').filter(Boolean);
    const quantidade = parseInt(args[0]);
    const targetId = mentioned?.[0];

    if (!quantidade || quantidade <= 0 || !targetId) {
        return reply(`Uso: *${CONFIG.PREFIX}darouro [quantidade] @pessoa*`);
    }

    const doador = getPlayer(sender);
    if (!doador) {
        return reply('Crie um personagem com !criarpj primeiro.');
    }

    const receptor = getPlayer(targetId);
    if (!receptor) {
        return reply('O jogador alvo nao tem personagem.');
    }

    if (sender === targetId) {
        return reply('Voce nao pode doar ouro para si mesmo.');
    }

    if ((doador.ouro || 0) < quantidade) {
        return reply(`Ouro insuficiente. Voce tem ${doador.ouro || 0}.`);
    }

    await react('💸');
    modificarOuro(sender, -quantidade);
    modificarOuro(targetId, quantidade);

    return reply(`💸 ${quantidade} ouro enviado para @${targetId.split('@')[0]}!`);
}

export async function handleDarXP(sock, msg, jid, sender, mentioned, cmdArgs, reply, react, botNumber) {
    const senderNum = sender.split('@')[0];
    const donoNum = CONFIG.DONO_BOT.split('@')[0];
    const botNum = botNumber.split('@')[0];
    
    if (senderNum !== donoNum && senderNum !== botNum) {
        return reply('Apenas o dono do bot pode usar este comando!');
    }
    
    const args = cmdArgs.trim().split(' ');
    const quantidade = parseInt(args[0]);
    
    if (isNaN(quantidade) || quantidade <= 0) {
        return reply(`Uso: *${CONFIG.PREFIX}darxp [quantidade] @pessoa*`);
    }
    
    const targetId = mentioned?.length > 0 ? mentioned[0] : sender;
    const player = getPlayer(targetId);
    
    if (!player) {
        return reply('Jogador nao tem personagem!');
    }
    
    await react('⭐');
    const resultado = adicionarXP(targetId, quantidade);
    
    let msg2 = `⭐ +${quantidade} XP`;
    if (resultado.levelUp) msg2 += ` | Level UP! Lv.${resultado.player.level}`;
    
    return reply(msg2);
}

export async function handleResetarPJ(sock, msg, jid, sender, mentioned, reply, react, botNumber) {
    // Cada um so pode resetar o proprio personagem
    const player = getPlayer(sender);
    
    if (!player) {
        return reply('Voce nao tem personagem para deletar!');
    }
    
    await react('🗑️');
    
    if (deletarJogador(sender)) {
        return reply(`Seu personagem *${player.nome}* foi deletado! Use *${CONFIG.PREFIX}criarpj* para criar outro.`);
    } else {
        return reply('❌ Erro ao deletar personagem!');
    }
}

// ==================== MENU RPG ====================

export function menuRPG(reply) {
    return reply(`
╭───────────────────────╮
│    ⚔️ *RPG D20*          
├───────────────────────┤
│
│ 📖 *INICIO*
│ ├ *!tutorial* - Como jogar
│ ├ *!criarpj* nome raca classe
│ ├ *!perfil* - Ver ficha
│ └ *!atributos* - Atributos
│
│ ⚔️ *COMBATE*
│ ├ *!cacar* - Cacar monstros
│ ├ *!boss* - Desafiar boss (Nível 5+)
│ ├ *!duelo* @pessoa - PvP
│ └ *!roubar* @pessoa
│
│ 🛒 *ECONOMIA*
│ ├ *!loja* [categoria]
│ ├ *!comprar* [id]
│ ├ *!inventario*
│ ├ *!equipar* [id]
│ ├ *!usar* [id]
│ └ *!curar*
│
│ 📋 *MISSÕES*
│ ├ *!quests* - Ver quest do dia
│ └ *!completarquest* - Receber recompensa
│
│ 🏆 *RANKING*
│ ├ *!meuperfil* - Seu ranking pessoal
│ ├ *!ranking* - Top players (XP)
│ └ *!rankingelo* - Top duelers (ELO)
│
│ 🧬 *RACAS:* humano, elfo,
│    anao, orc
│
│ 📜 *CLASSES:* guerreiro,
│    mago, ladino, clerigo
│
╰───────────────────────╯`);
}
