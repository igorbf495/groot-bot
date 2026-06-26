import { CONFIG } from '../config.js';
import { createBar } from '../utils.js';
import { logger } from '../logger.js';
import {
    RACAS,
    CLASSES,
    LOJA_ITENS,
    rolarD20,
    rolarDado,
    getPlayer,
    getModificador,
    modificarOuro,
    incrementarStat,
    getRanking,
    getRankingELO,
    getRankingBosses,
    calcularVantagemDuelo,
    calcularMudancaELO,
    getBadgeELO,
    updatePlayer,
    calcularBonusAtaque,
    calcularCA,
    calcularDano,
    getNarracao,
    verificarCooldown,
    setCooldown,
    verificarProgressoQuest,
} from '../data/rpg.js';

// ==================== DUELO (PVP) ====================

export async function handleDuelo(sock, msg, jid, sender, mentioned, reply, react) {
    if (!mentioned || mentioned.length === 0) {
        return reply(`Mencione alguem para duelar!\nUso: *${CONFIG.PREFIX}duelo @pessoa*`);
    }
    
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const oponenteId = mentioned[0];
    const oponente = getPlayer(oponenteId);
    
    if (!oponente) {
        return reply('Esse jogador nao tem personagem!');
    }
    
    if (oponenteId === sender) {
        return reply('Voce nao pode duelar consigo mesmo!');
    }
    
    // Verificação de cooldown corrigida
    const cooldown = verificarCooldown(sender, 'duelo');
    if (cooldown && cooldown.emCooldown) {
        const minutos = Math.ceil(cooldown.tempoRestante / 60000);
        return reply(`Aguarde ${minutos}min para duelar novamente!`);
    }
    
    if (player.hp <= 0) return reply('Voce esta morto! Use *!curar*');
    if (oponente.hp <= 0) return reply('Seu oponente esta morto!');
    
    await react('⚔️');
    
    // Stats dos jogadores
    const bonusP1 = calcularBonusAtaque(player);
    const bonusP2 = calcularBonusAtaque(oponente);
    const caP1 = calcularCA(player);
    const caP2 = calcularCA(oponente);
    const danoP1Info = calcularDano(player);
    const danoP2Info = calcularDano(oponente);

    const armaP1 = player.equipado?.arma ? LOJA_ITENS.armas.find(i => i.id === player.equipado.arma) : null;
    const armaP2 = oponente.equipado?.arma ? LOJA_ITENS.armas.find(i => i.id === oponente.equipado.arma) : null;

    const aplicarFraquezaGelo = (danoBase, arma, defensor) => {
        if (!arma || arma.danoExtra !== 'frio') return { dano: danoBase, log: null };
        if (defensor.raca === 'orc') {
            const bonus = Math.max(1, Math.floor(danoBase * 0.4));
            return { dano: danoBase + bonus, log: `❄️ Fraqueza de orc ao gelo: +${bonus} dano.` };
        }
        return { dano: danoBase, log: null };
    };
    
    // Já recebemos { dado, modificador }, então não precisa parsear
    const danoP1 = danoP1Info;
    const danoP2 = danoP2Info;
    
    // Cálculo de iniciativa com D20 + DEX modifier
    const dexP1 = getModificador(player.atributos.destreza);
    const dexP2 = getModificador(oponente.atributos.destreza);
    const iniciativaP1 = rolarD20() + dexP1;
    const iniciativaP2 = rolarD20() + dexP2;
    
    let hpP1 = player.hp;
    let hpP2 = oponente.hp;
    let turno = 0;
    let atacante = iniciativaP1 >= iniciativaP2 ? 1 : 2;
    const logs = [];
    
    // Narração de abertura
    const racaP1 = RACAS[player.raca];
    const racaP2 = RACAS[oponente.raca];
    const classeP1 = CLASSES[player.classe];
    const classeP2 = CLASSES[oponente.classe];
    
    logs.push(getNarracao('dueloInicio'));
    logs.push(`⚔️ ${racaP1.emoji}${classeP1.emoji} ${player.nome} (Lv${player.level}) vs ${racaP2.emoji}${classeP2.emoji} ${oponente.nome} (Lv${oponente.level})`);
    logs.push(`🎯 Iniciativa: ${player.nome}=${iniciativaP1} vs ${oponente.nome}=${iniciativaP2}`);
    
    while (hpP1 > 0 && hpP2 > 0 && turno < 40) {
        turno++;
        
        if (atacante === 1) {
            // Ataque do Player 1
            const rolagem = rolarD20();
            logs.push(`─── 🛡️ Turno ${turno} | ${player.nome} ataca ───`);
            
            // Aviso de HP crítico do oponente
            if (hpP2 <= Math.floor(oponente.hp * 0.3)) {
                logs.push(`⚠️ ${oponente.nome} está em HP crítico! (${hpP2}/${oponente.hp})`);
            }
            
            if (rolagem === 20) {
                // CRÍTICO
                let dano = rolarDado(danoP1.dado) + danoP1.modificador;
                dano *= 2; // Crítico dobra
                const res = aplicarFraquezaGelo(dano, armaP1, oponente);
                hpP2 = Math.max(0, hpP2 - res.dano);
                logs.push(`⭐ CRÍTICO! ${player.nome} causa ${res.dano} HP de dano! ${getNarracao('critico')}`);
                if (res.log) logs.push(`   ${res.log}`);
                incrementarStat(sender, 'criticos', 1);
            } else if (rolagem === 1) {
                // FALHA CRÍTICA
                logs.push(`💀 FALHA CRÍTICA! ${player.nome} tropeça feio!`);
                incrementarStat(sender, 'falhasCriticas', 1);
            } else if (rolagem + bonusP1 >= caP2) {
                // ACERTO NORMAL
                let dano = rolarDado(danoP1.dado) + danoP1.modificador;
                const res = aplicarFraquezaGelo(dano, armaP1, oponente);
                hpP2 = Math.max(0, hpP2 - res.dano);
                const emoji = rolagem >= 15 ? '💥' : '💢';
                logs.push(`${emoji} ${player.nome} acerta! -${res.dano} HP`);
                if (res.log) logs.push(`   ${res.log}`);
            } else {
                // ERRO
                logs.push(`🛡️ ${oponente.nome} desvia com sucesso!`);
            }
            logs.push(`   ❤️ ${player.nome}: ${createBar((hpP1 / player.hp) * 100)} | 💀 ${oponente.nome}: ${createBar((hpP2 / oponente.hp) * 100)}`);
            atacante = 2;
        } else {
            // Ataque do Player 2
            const rolagem = rolarD20();
            logs.push(`─── 🗡️ Turno ${turno} | ${oponente.nome} ataca ───`);
            
            // Aviso de HP crítico do atacante
            if (hpP1 <= Math.floor(player.hp * 0.3)) {
                logs.push(`⚠️ ${player.nome} está em HP crítico! (${hpP1}/${player.hp})`);
            }
            
            if (rolagem === 20) {
                // CRÍTICO
                let dano = rolarDado(danoP2.dado) + danoP2.modificador;
                dano *= 2; // Crítico dobra
                const res = aplicarFraquezaGelo(dano, armaP2, player);
                hpP1 = Math.max(0, hpP1 - res.dano);
                logs.push(`⭐ CRÍTICO! ${oponente.nome} causa ${res.dano} HP de dano! ${getNarracao('dueloDerrota')}`);
                if (res.log) logs.push(`   ${res.log}`);
                incrementarStat(oponenteId, 'criticos', 1);
            } else if (rolagem === 1) {
                // FALHA CRÍTICA
                logs.push(`💀 FALHA CRÍTICA! ${oponente.nome} tropeça feio!`);
                incrementarStat(oponenteId, 'falhasCriticas', 1);
            } else if (rolagem + bonusP2 >= caP1) {
                // ACERTO NORMAL
                let dano = rolarDado(danoP2.dado) + danoP2.modificador;
                const res = aplicarFraquezaGelo(dano, armaP2, player);
                hpP1 = Math.max(0, hpP1 - res.dano);
                const emoji = rolagem >= 15 ? '💥' : '💢';
                logs.push(`${emoji} ${oponente.nome} acerta! -${res.dano} HP`);
                if (res.log) logs.push(`   ${res.log}`);
            } else {
                // ERRO
                logs.push(`🛡️ ${player.nome} desvia com sucesso!`);
            }
            logs.push(`   ❤️ ${player.nome}: ${createBar((hpP1 / player.hp) * 100)} | 💀 ${oponente.nome}: ${createBar((hpP2 / oponente.hp) * 100)}`);
            atacante = 1;
        }
    }
    
    setCooldown(sender, 'duelo', Date.now() + (10 * 60 * 1000));
    
    // Determinação do vencedor
    const venceuP1 = hpP1 > 0 && hpP2 <= 0;
    const venceuP2 = hpP2 > 0 && hpP1 <= 0;
    const empate = hpP1 <= 0 && hpP2 <= 0; // Ambos chegaram a 0 HP
    
    let resultado = '';
    
    if (venceuP1) {
        // ===== PLAYER 1 VENCE =====
        const vantagem = calcularVantagemDuelo(player, oponente);
        const xpBase = 50 + (oponente.level * 5);
        const xpGanho = Math.floor(xpBase * (1 + vantagem * 0.1)); // +10% por vantagem
        const ouroRoubado = Math.max(1, Math.floor(oponente.ouro * 0.25));
        const hpRecuperado = Math.min(Math.floor(player.hp * 0.2), 15); // Recupera até 20% do HP
        
        // Calcular mudança de ELO
        const eloChange = calcularMudancaELO(player, oponente);
        player.elo = eloChange.novoEloVencedor;
        oponente.elo = eloChange.novoEloPerdedor;
        
        // Atualizar stats
        const novoHp = Math.max(1, hpP1 + hpRecuperado);
        player.hp = novoHp;
        player.ouro += ouroRoubado;
        oponente.ouro = Math.max(0, oponente.ouro - ouroRoubado);
        incrementarStat(sender, 'duelosVencidos', 1);
        incrementarStat(sender, 'dueloStreak', 1); // Aumenta streak
        incrementarStat(oponenteId, 'duelosPerdidos', 1);
        incrementarStat(oponenteId, 'dueloStreak', -oponente.stats.dueloStreak); // Reseta streak
        verificarProgressoQuest(player, 'duelos_vencidos', 1);
        
        // Salvar mudanças
        updatePlayer(sender, player);
        updatePlayer(oponenteId, oponente);
        
        resultado = `🏆 *${player.nome}* VENCEU!\n${getNarracao('dueloVitoria')}\n\n⭐ +${xpGanho} XP\n💰 +${ouroRoubado} ouro roubado\n❤️ +${hpRecuperado} HP (${novoHp}/${player.hp})\n🎯 ${getBadgeELO(player.elo)} ${player.elo} ${eloChange.ganhoVencedor > 0 ? '+' : ''}${eloChange.ganhoVencedor}`;
        
    } else if (venceuP2) {
        // ===== PLAYER 2 VENCE =====
        const vantagem = calcularVantagemDuelo(oponente, player);
        const xpBase = 50 + (player.level * 5);
        const xpGanho = Math.floor(xpBase * (1 + vantagem * 0.1));
        const ouroRoubado = Math.max(1, Math.floor(player.ouro * 0.25));
        const hpRecuperado = Math.min(Math.floor(oponente.hp * 0.2), 15);
        
        // Calcular mudança de ELO
        const eloChange = calcularMudancaELO(oponente, player);
        oponente.elo = eloChange.novoEloVencedor;
        player.elo = eloChange.novoEloPerdedor;
        
        // Atualizar stats
        const novoHpOponente = Math.max(1, hpP2 + hpRecuperado);
        oponente.hp = novoHpOponente;
        oponente.ouro += ouroRoubado;
        player.ouro = Math.max(0, player.ouro - ouroRoubado);
        incrementarStat(oponenteId, 'duelosVencidos', 1);
        incrementarStat(oponenteId, 'dueloStreak', 1);
        incrementarStat(sender, 'duelosPerdidos', 1);
        incrementarStat(sender, 'dueloStreak', -player.stats.dueloStreak);
        verificarProgressoQuest(oponente, 'duelos_vencidos', 1);
        
        // Salvar mudanças
        updatePlayer(sender, player);
        updatePlayer(oponenteId, oponente);
        
        resultado = `🏆 *${oponente.nome}* VENCEU!\n${getNarracao('dueloVitoria')}\n\n⭐ +${xpGanho} XP\n💰 +${ouroRoubado} ouro roubado\n❤️ +${hpRecuperado} HP (${novoHpOponente}/${oponente.hp})\n🎯 ${getBadgeELO(oponente.elo)} ${oponente.elo} ${eloChange.ganhoVencedor > 0 ? '+' : ''}${eloChange.ganhoVencedor}`;
        
    } else {
        // ===== EMPATE =====
        resultado = `🤝 EMPATE ÉPICO!\nAmbos caíram em combate simultâneo!`;
        incrementarStat(sender, 'duelosPerdidos', 1);
        incrementarStat(oponenteId, 'duelosPerdidos', 1);
        incrementarStat(sender, 'dueloStreak', -player.stats.dueloStreak);
        incrementarStat(oponenteId, 'dueloStreak', -oponente.stats.dueloStreak);
    }
    
    // Construir mensagem final
    // Mostrar todo o histórico do duelo para não perder contextos de turnos
    const ultimosLogs = logs.join('\n│ ');
    
    return sock.sendMessage(jid, {
        text: `
╭──────────────────────────────────╮
│ ⚔️ *DUELO PVP*
├──────────────────────────────────┤
│ ${racaP1.emoji} ${classeP1.emoji} *${player.nome}* (Lv${player.level})
│ CA: ${caP1} | ATK: +${bonusP1} | Dano: ${danoP1.dado}${danoP1.modificador > 0 ? '+' : danoP1.modificador < 0 ? '' : ''}${danoP1.modificador !== 0 ? danoP1.modificador : ''}
│
│             ⚔️ VS ⚔️
│
│ ${racaP2.emoji} ${classeP2.emoji} *${oponente.nome}* (Lv${oponente.level})
│ CA: ${caP2} | ATK: +${bonusP2} | Dano: ${danoP2.dado}${danoP2.modificador > 0 ? '+' : danoP2.modificador < 0 ? '' : ''}${danoP2.modificador !== 0 ? danoP2.modificador : ''}
│
├──────────────────────────────────┤
│ *ÚLTIMOS TURNOS*
│ ${ultimosLogs}
├──────────────────────────────────┤
│ ${resultado}
│
╰──────────────────────────────────╯`,
        mentions: [sender, oponenteId]
    }, { quoted: msg });
}

// ==================== RANKING ====================

export async function handleRanking(sock, msg, jid, reply, react) {
    await react('🏆');
    
    const ranking = getRanking(10);
    
    if (ranking.length === 0) {
        return reply('Nenhum jogador cadastrado ainda!');
    }
    
    const medalhas = ['🥇', '🥈', '🥉'];
    
    let lista = ranking.map((p, i) => {
        const medalha = medalhas[i] || `${i + 1}.`;
        const classeInfo = CLASSES[p.classe] || CLASSES.guerreiro;
        const racaInfo = RACAS[p.raca] || RACAS.humano;
        const kills = p.stats?.monstrosMortos || 0;
        return `│ ${medalha} *${p.nome}*\n│    ${racaInfo?.emoji || '👤'}${classeInfo?.emoji || '⚔️'} Lv.${p.level} | ${kills} kills`;
    }).join('\n│\n');
    
    return reply(`
╭──────────────────────╮
│ 🏆 *RANKING RPG*
├──────────────────────┤
│
${lista}
│
╰──────────────────────╯`);
}

// Ranking de ELO para duelos
export async function handleRankingELO(sock, msg, jid, reply, react) {
    await react('🎯');
    
    const rankingELO = getRankingELO(10);
    
    if (rankingELO.length === 0) {
        return reply('Nenhum jogador cadastrado ainda!');
    }
    
    const medalhas = ['🥇', '🥈', '🥉'];
    
    let lista = rankingELO.map((p, i) => {
        const medalha = medalhas[i] || `${i + 1}.`;
        const classeInfo = CLASSES[p.classe] || CLASSES.guerreiro;
        const racaInfo = RACAS[p.raca] || RACAS.humano;
        const eloAtual = p.elo || 1600;
        const badge = getBadgeELO(eloAtual);
        const duelosVencidos = p.stats?.duelosVencidos || 0;
        const duelosPerdidos = p.stats?.duelosPerdidos || 0;
        const taxaVitoria = duelosVencidos + duelosPerdidos > 0 
            ? Math.round((duelosVencidos / (duelosVencidos + duelosPerdidos)) * 100)
            : 0;
        
        return `│ ${medalha} ${badge} *${p.nome}*\n│    ${racaInfo?.emoji || '👤'}${classeInfo?.emoji || '⚔️'} Lv.${p.level} | ELO: ${eloAtual}\n│    📊 ${duelosVencidos}W-${duelosPerdidos}L (${taxaVitoria}%)`;
    }).join('\n│\n');
    
    return reply(`
╭──────────────────────────╮
│ 🎯 *RANKING ELO*
│ (Duelos Competitivos)
├──────────────────────────┤
│
${lista}
│
╰──────────────────────────╯`);
}

// Ranking de Bosses derrotados
export async function handleRankingBoss(sock, msg, jid, reply, react) {
    await react('🐉');
    const rankingBoss = getRankingBosses(10);
    if (rankingBoss.length === 0) {
        return reply('Nenhum jogador cadastrou derrotas de boss ainda!');
    }
    const medalhas = ['🥇', '🥈', '🥉'];
    const lista = rankingBoss.map((p, i) => {
        const medalha = medalhas[i] || `${i + 1}.`;
        const classeInfo = CLASSES[p.classe] || CLASSES.guerreiro;
        const racaInfo = RACAS[p.raca] || RACAS.humano;
        const bosses = p.stats?.bossesDerrotados || 0;
        return `│ ${medalha} *${p.nome}* — ${bosses} boss(es)
│    ${racaInfo?.emoji || '👤'}${classeInfo?.emoji || '⚔️'} Lv.${p.level}`;
    }).join('\n│\n');
    return reply(`
╭──────────────────────╮
│ 🐉 *RANKING DE BOSSES*
├──────────────────────┤
│
${lista}
│
╰──────────────────────╯`);
}

// ==================== ROUBAR ====================

export async function handleRoubar(sock, msg, jid, sender, mentioned, reply, react) {
    if (!mentioned || mentioned.length === 0) {
        return reply(`Mencione alguem!\nUso: *${CONFIG.PREFIX}roubar @pessoa*`);
    }
    
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const vitima = getPlayer(mentioned[0]);
    if (!vitima) {
        return reply('Esse jogador nao tem personagem!');
    }
    
    if (mentioned[0] === sender) {
        return reply('Voce nao pode roubar de si mesmo!');
    }
    
    const cooldown = verificarCooldown(sender, 'roubar');
    if (cooldown.emCooldown) {
        const minutos = Math.ceil(cooldown.tempoRestante / 60000);
        return reply(`Aguarde ${minutos}min para roubar novamente!`);
    }
    
    await react('🗡️');
    setCooldown(sender, 'roubar', Date.now() + (15 * 60 * 1000));
    
    // Chance baseada em DES e Sorte, bonus para Ladinos
    const classeInfo = CLASSES[player.classe];
    let chanceRoubo = 30 + getModificador(player.atributos.destreza) * 3 + getModificador(player.atributos.sorte) * 2;
    if (player.classe === 'ladino') chanceRoubo += 20;
    
    if (Math.random() * 100 < chanceRoubo) {
        const ouroRoubado = Math.min(vitima.ouro, Math.floor(vitima.ouro * 0.15) + rolarDado('1d20'));
        
        modificarOuro(sender, ouroRoubado);
        modificarOuro(mentioned[0], -ouroRoubado);
        
        return sock.sendMessage(jid, {
            text: `
╭──────────────────────╮
│ 🗡️ *ROUBO BEM SUCEDIDO!*
├──────────────────────┤
│
│ Voce roubou *${ouroRoubado}* ouro
│ de @${mentioned[0].split('@')[0]}!
│
╰──────────────────────╯`,
            mentions: [mentioned[0]]
        }, { quoted: msg });
    } else {
        const perda = Math.min(player.ouro, 20 + rolarDado('1d20'));
        modificarOuro(sender, -perda);
        
        return sock.sendMessage(jid, {
            text: `
╭──────────────────────╮
│ ❌ *ROUBO FALHOU!*
├──────────────────────┤
│
│ @${mentioned[0].split('@')[0]} te pegou!
│ Voce perdeu *${perda}* ouro!
│
╰──────────────────────╯`,
            mentions: [mentioned[0]]
        }, { quoted: msg });
    }
}
