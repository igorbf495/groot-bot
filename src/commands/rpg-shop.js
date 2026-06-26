import { CONFIG } from '../config.js';
import {
    LOJA_ITENS,
    rolarDado,
    getPlayer,
    calcularHpMax,
    modificarOuro,
    modificarHP,
    adicionarItem,
    removerItem,
    equiparItem,
    verificarCooldown,
    setCooldown,
    adicionarXP,
    getInfoLevelingItem,
    calcularBonusLevelingItem,
    upgradeItemPagar,
    adicionarPedraUpgrade,
    updatePlayer,
    verificarProgressoQuest,
} from '../data/rpg.js';

// ==================== HELPERS ====================

function encontrarItemPorId(itemId) {
    let item = LOJA_ITENS.armas.find(i => i.id === itemId);
    if (!item) item = LOJA_ITENS.armaduras.find(i => i.id === itemId);
    if (!item) item = LOJA_ITENS.consumiveis.find(i => i.id === itemId);
    return item || null;
}

function calcularPrecoVenda(item) {
    if (!item) return 0;
    const base = item.precoVenda ?? item.preco ?? 0;
    return Math.max(1, Math.floor(base * 0.5));
}

function formatarItemLoja(item) {
    const stats = [];
    if (item.dano) stats.push(`Dano: ${item.dano}`);
    if (item.bonusAtaque) stats.push(`+${item.bonusAtaque} ATK`);
    if (item.bonusCA) stats.push(`+${item.bonusCA} CA`);
    if (item.cura) stats.push(`Cura: ${item.cura}`);
    if (item.tipo === 'upgrade_stone') stats.push(item.descricao || 'Usada para upgrade de item');
    return `${item.emoji} *${item.nome}*\nID: \`${item.id}\`\n${stats.join(' | ')}\n💰 ${item.preco} ouro`;
}

function prefixarLinhas(texto) {
    return texto.split('\n').map(linha => `│ ${linha}`).join('\n');
}

// ==================== LOJA ====================

export async function handleLoja(sock, msg, jid, sender, cmdArgs, reply, react) {
    await react('🛒');

    const categoriaArg = cmdArgs.trim().toLowerCase();
    const categorias = {
        armas: { titulo: 'ARMAS', itens: LOJA_ITENS.armas },
        armaduras: { titulo: 'ARMADURAS', itens: LOJA_ITENS.armaduras },
        consumiveis: { titulo: 'CONSUMÍVEIS', itens: LOJA_ITENS.consumiveis },
    };

    // Mostrar categoria específica
    if (categoriaArg && categorias[categoriaArg]) {
        const { titulo, itens } = categorias[categoriaArg];
        const disponiveis = itens.filter(i => !i.somenteDrop);
        const lista = disponiveis.map(item => prefixarLinhas(formatarItemLoja(item))).join('\n│\n');

        return reply(`
╭──────────────────────╮
│ 🛒 *LOJA - ${titulo}*
├──────────────────────┤
│
${lista}
│
├──────────────────────┤
│ *${CONFIG.PREFIX}comprar [id]*
╰──────────────────────╯`);
    }

    // Ajuda / resumo das categorias
    const linhas = [
        '🛒 *LOJA*',
        '',
        `Use *${CONFIG.PREFIX}loja armas* para armas`,
        `Use *${CONFIG.PREFIX}loja armaduras* para armaduras`,
        `Use *${CONFIG.PREFIX}loja consumiveis* para poções e itens de uso`,
        '',
        `Depois compre com *${CONFIG.PREFIX}comprar <id>*`,
    ];

    return reply(linhas.join('\n'));
}

// ==================== STATS DE ITENS ====================

export async function handleStats(sock, msg, jid, sender, cmdArgs, reply, react) {
    await react('📊');
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }

    const itemArg = cmdArgs.trim().toLowerCase();

    // Sem argumento: mostrar itens equipados
    if (!itemArg) {
        let linhas = [`📊 *STATS DOS ITENS EQUIPADOS*`, ''];

        if (player.equipado?.arma) {
            const arma = LOJA_ITENS.armas.find(i => i.id === player.equipado.arma);
            if (arma) {
                const info = getInfoLevelingItem(player.equipado.arma, player);
                const bonus = calcularBonusLevelingItem(player.equipado.arma, player);

                linhas.push(`⚔️ *${arma.emoji} ${arma.nome}*`);
                linhas.push(`Dano: ${arma.dano}`);
                if (info.level > 0) {
                    linhas.push(`\`${info.progressBar}\``);
                    linhas.push(`📈 Nível: ${info.level}/${info.maxLevel}`);
                    linhas.push(`💥 Dano +${(bonus.bonusDanoMultiplier * 100 - 100).toFixed(0)}% (x${bonus.bonusDanoMultiplier.toFixed(2)})`);
                    if (bonus.bonusAtaque > 0) linhas.push(`⚔️ +${bonus.bonusAtaque} ATK`);
                    if (info.custoProximo) linhas.push(`💰 Custo próximo: ${info.custoProximo} ouro`);
                } else {
                    linhas.push('⭕ Novo (sem upgrade)');
                    if (info.custoProximo) linhas.push(`💰 Custo para upar: ${info.custoProximo} ouro`);
                }
                linhas.push('');
            }
        }

        if (player.equipado?.armadura) {
            const armadura = LOJA_ITENS.armaduras.find(i => i.id === player.equipado.armadura);
            if (armadura) {
                const info = getInfoLevelingItem(player.equipado.armadura, player);
                const bonus = calcularBonusLevelingItem(player.equipado.armadura, player);

                linhas.push(`🛡️ *${armadura.emoji} ${armadura.nome}*`);
                linhas.push(`CA: +${armadura.bonusCA || 0}`);
                if (info.level > 0) {
                    linhas.push(`\`${info.progressBar}\``);
                    linhas.push(`📈 Nível: ${info.level}/${info.maxLevel}`);
                    linhas.push(`🛡️ +${bonus.bonusCA} CA (upgrade)`);
                } else {
                    linhas.push('⭕ Novo (sem upgrade)');
                    if (info.custoProximo) linhas.push(`💰 Custo para upar: ${info.custoProximo} ouro`);
                }
                linhas.push('');
            }
        }

        if (!player.equipado?.arma && !player.equipado?.armadura) {
            linhas.push('Você não tem itens equipados!');
        }

        linhas.push('💡 Dica: Pague ouro para upar itens');
        linhas.push(`Use *${CONFIG.PREFIX}upar <id>* para melhorar seu item`);

        return reply(linhas.join('\n'));
    }

    // Argumento: mostrar item específico
    const item = encontrarItemPorId(itemArg);
    if (!item) {
        return reply('Item não encontrado!');
    }

    if (!player.inventario.includes(item.id)) {
        return reply('Você não possui este item!');
    }

    const info = getInfoLevelingItem(item.id, player);
    const bonus = calcularBonusLevelingItem(item.id, player);

    let linhas = [`📊 *STATS DO ITEM*`, ''];
    linhas.push(`${item.emoji} *${item.nome}*`);
    linhas.push(`ID: \`${item.id}\``);
    linhas.push('');

    if (item.dano) linhas.push(`💥 Dano: ${item.dano}`);
    if (item.bonusAtaque) linhas.push(`⚔️ +${item.bonusAtaque} ATK`);
    if (item.bonusCA) linhas.push(`🛡️ +${item.bonusCA} CA`);

    linhas.push('');
    linhas.push(`${info.emoji} *Upgrade*`);
    linhas.push(`\`${info.progressBar}\``);
    linhas.push(`Nível: ${info.level}/${info.maxLevel}`);

    if (info.level > 0) {
        linhas.push('');
        linhas.push(`✨ *Bônus Acumulados*`);
        if (item.dano || item.bonusAtaque) {
            const danoExtra = (bonus.bonusDanoMultiplier * 100 - 100).toFixed(0);
            linhas.push(`💥 Dano: +${danoExtra}% (x${bonus.bonusDanoMultiplier.toFixed(2)})`);
        }
        if (bonus.bonusAtaque > 0) linhas.push(`⚔️ ATK: +${bonus.bonusAtaque}`);
        if (bonus.bonusCA > 0) linhas.push(`🛡️ CA: +${bonus.bonusCA}`);
    }

    if (info.custoProximo) {
        linhas.push('');
        linhas.push(`💰 Próximo upgrade: ${info.custoProximo} ouro`);
        if (info.reqLevelProximo) linhas.push(`🎚️ Nível do jogador: mínimo ${info.reqLevelProximo}`);
        if (info.reqPedraProximo) linhas.push(`🪨 Requer: ${info.reqPedraProximo}`);
    } else {
        linhas.push('');
        linhas.push('🔝 Nível máximo alcançado');
    }

    const equipado = (player.equipado?.arma === item.id || player.equipado?.armadura === item.id) ? ' ✅ EQUIPADO' : '';
    linhas.push(`${equipado}`);
    
    return reply(linhas.join('\n'));
}

// ==================== UPGRADE PAGO DE ITENS ====================

export async function handleUpgrade(sock, msg, jid, sender, cmdArgs, reply, react) {
    await react('🛠️');
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }

    const itemArg = cmdArgs.trim().toLowerCase();
    if (!itemArg) {
        return reply(`Uso: *${CONFIG.PREFIX}upar <id_do_item>*`);
    }

    const item = encontrarItemPorId(itemArg);
    if (!item) return reply('Item não encontrado.');
    if (!player.inventario.includes(item.id)) return reply('Você não possui este item.');

    const resultado = upgradeItemPagar(sender, item.id);
    if (!resultado.ok) {
        if (resultado.motivo === 'Item já está no nível máximo') {
            return reply('🔝 Este item já está no nível máximo.');
        }
        if (resultado.motivo === 'Ouro insuficiente') {
            return reply(`💰 Você precisa de ${resultado.custo} ouro para upar. Ouro atual: ${player.ouro}.`);
        }
        if (resultado.motivo === 'Level mínimo') {
            return reply(`🎚️ Você precisa estar no nível ${resultado.minPlayerLevel} para upar para o nível ${resultado.proximoLevel}.`);
        }
        if (resultado.motivo === 'Pedra insuficiente') {
            const qtd = player.upgradeStones?.[resultado.pedraKey] || 0;
            return reply(`🪨 Falta ${resultado.pedraNome} para upar para o nível ${resultado.proximoLevel}.
Você possui: ${qtd}.
Requisito de nível: ${resultado.minPlayerLevel}.`);
        }
        return reply(`Não foi possível upar: ${resultado.motivo || 'erro'}`);
    }

    const bonusPct = Math.round(resultado.levelNovo * 100 * 0.05);
    return reply(`🛠️ Upgrade concluído!
${item.emoji} ${item.nome}
Nível: ${resultado.levelAnterior} → ${resultado.levelNovo}
💰 Custo: ${resultado.custo} ouro
💥 Bônus de dano acumulado: +${bonusPct}%`);
}

// ==================== COMPRAR ====================

export async function handleComprar(sock, msg, jid, sender, cmdArgs, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const itemId = cmdArgs.trim().toLowerCase();
    if (!itemId) {
        return reply(`Uso: *${CONFIG.PREFIX}comprar [id]*\nVeja itens em *${CONFIG.PREFIX}loja*`);
    }
    
    let item = LOJA_ITENS.armas.find(i => i.id === itemId);
    if (!item) item = LOJA_ITENS.armaduras.find(i => i.id === itemId);
    if (!item) item = LOJA_ITENS.consumiveis.find(i => i.id === itemId);
    
    if (!item) {
        return reply('Item nao encontrado!');
    }

    if (item.somenteDrop) {
        return reply('Este item só pode ser obtido ao derrotar o boss correspondente.');
    }
    
    if (player.ouro < item.preco) {
        return reply(`Ouro insuficiente! Voce tem ${player.ouro}, precisa de ${item.preco}`);
    }
    
    await react('💰');
    
    modificarOuro(sender, -item.preco);

    if (item.tipo === 'upgrade_stone') {
        const key = item.stoneKey === 'boss' ? 'boss' : 'rara';
        adicionarPedraUpgrade(sender, key, 1);
    } else {
        adicionarItem(sender, item.id);
    }

    verificarProgressoQuest(player, 'compras', 1);
    updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
    
    const pedraMsg = item.tipo === 'upgrade_stone'
        ? `🪨 Pedra adicionada ao estoque (${item.stoneKey === 'boss' ? 'Boss' : 'Rara'})`
        : `${item.tipo !== 'consumivel' ? `Use *${CONFIG.PREFIX}equipar ${item.id}*` : `Use *${CONFIG.PREFIX}usar ${item.id}*`}`;

    return reply(`
╭──────────────────────╮
│ ✅ *COMPRA REALIZADA*
├──────────────────────┤
│
│ ${item.emoji} *${item.nome}*
│ 💰 -${item.preco} ouro
│
│ ${pedraMsg}
│
╰──────────────────────╯`);
}

// ==================== VENDER ====================

export async function handleVender(sock, msg, jid, sender, cmdArgs, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    await react('💰');

    const itemId = cmdArgs.trim().toLowerCase();
    if (!itemId) {
        if (player.inventario.length === 0) {
            return reply('Seu inventario esta vazio.');
        }

        const contagem = {};
        player.inventario.forEach(id => {
            contagem[id] = (contagem[id] || 0) + 1;
        });

        const lista = Object.entries(contagem).map(([id, qtd]) => {
            const item = encontrarItemPorId(id);
            if (!item) return `│ ❓ ${id} x${qtd}`;
            const preco = calcularPrecoVenda(item);
            const equipado = (player.equipado?.arma === id || player.equipado?.armadura === id) && qtd === 1 ? ' [E]' : '';
            return `│ ${item.emoji} ${item.nome}${equipado} x${qtd} — 💰 ${preco}`;
        }).join('\n');

        return reply(`
╭──────────────────────╮
│ 💰 *VENDER ITENS*
├──────────────────────┤
│
${lista}
│
│ Use *${CONFIG.PREFIX}vender [id]* para vender
│ (Nao e possivel vender o unico item equipado)
╰──────────────────────╯`);
    }

    if (!player.inventario.includes(itemId)) {
        return reply('Voce nao possui este item.');
    }

    const item = encontrarItemPorId(itemId);
    if (!item) {
        return reply('Este item nao pode ser vendido.');
    }

    const contagem = player.inventario.filter(id => id === itemId).length;
    const estaEquipado = player.equipado?.arma === itemId || player.equipado?.armadura === itemId;
    if (estaEquipado && contagem <= 1) {
        return reply('Nao pode vender um item que esta equipado sem ter outra copia.');
    }

    const precoVenda = calcularPrecoVenda(item);
    removerItem(sender, itemId);
    modificarOuro(sender, precoVenda);

    return reply(`
╭──────────────────────╮
│ ✅ *ITEM VENDIDO*
├──────────────────────┤
│
│ ${item.emoji} *${item.nome}*
│ 💰 +${precoVenda} ouro
│ Ouro atual: ${getPlayer(sender).ouro}
│
╰──────────────────────╯`);
}

// ==================== EQUIPAR ====================

export async function handleEquipar(sock, msg, jid, sender, cmdArgs, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const itemId = cmdArgs.trim().toLowerCase();
    if (!itemId) {
        return reply(`Uso: *${CONFIG.PREFIX}equipar [id]*`);
    }
    
    const resultado = equiparItem(sender, itemId);
    
    if (!resultado.sucesso) {
        return reply(resultado.motivo);
    }
    
    await react('⚔️');
    
    return reply(`
╭──────────────────────╮
│ ✅ *ITEM EQUIPADO*
├──────────────────────┤
│
│ ${resultado.item.emoji} *${resultado.item.nome}*
│ Slot: ${resultado.slot === 'arma' ? '⚔️ Arma' : '🛡️ Armadura'}
│
╰──────────────────────╯`);
}

// ==================== INVENTARIO ====================

export async function handleInventario(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    await react('🎒');
    
    if (player.inventario.length === 0) {
        return reply(`
╭──────────────────────╮
│ 🎒 *INVENTARIO VAZIO*
├──────────────────────┤
│
│ Compre itens na *${CONFIG.PREFIX}loja*
│
╰──────────────────────╯`);
    }
    
    const contagem = {};
    player.inventario.forEach(itemId => {
        contagem[itemId] = (contagem[itemId] || 0) + 1;
    });
    
    let lista = Object.entries(contagem).map(([itemId, qtd]) => {
        let item = LOJA_ITENS.armas.find(i => i.id === itemId);
        if (!item) item = LOJA_ITENS.armaduras.find(i => i.id === itemId);
        if (!item) item = LOJA_ITENS.consumiveis.find(i => i.id === itemId);
        
        if (!item) return `│ ❓ ${itemId} x${qtd}`;
        
        const equipado = (player.equipado?.arma === itemId || player.equipado?.armadura === itemId) ? ' [E]' : '';
        return `│ ${item.emoji} ${item.nome}${equipado} x${qtd}`;
    }).join('\n');
    
    return reply(`
╭──────────────────────╮
│ 🎒 *INVENTARIO*
├──────────────────────┤
│
${lista}
│
│ 💰 Ouro: *${player.ouro}*
│ [E] = Equipado
│
╰──────────────────────╯`);
}

// ==================== USAR CONSUMIVEL ====================

export async function handleUsar(sock, msg, jid, sender, cmdArgs, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const itemId = cmdArgs.trim().toLowerCase();
    if (!itemId) {
        return reply(`Uso: *${CONFIG.PREFIX}usar [id]*`);
    }
    
    if (!player.inventario.includes(itemId)) {
        return reply('Voce nao possui este item!');
    }
    
    const item = LOJA_ITENS.consumiveis.find(i => i.id === itemId);
    if (!item) {
        return reply('Este item nao e consumivel!');
    }
    
    await react('🧪');
    
    removerItem(sender, itemId);
    
    let efeito = '';
    if (item.cura) {
        const cura = rolarDado(item.cura);
        modificarHP(sender, cura);
        efeito = `❤️ +${cura} HP recuperado!`;
    }
    
    return reply(`
╭──────────────────────╮
│ 🧪 *ITEM USADO*
├──────────────────────┤
│
│ ${item.emoji} *${item.nome}*
│ ${efeito}
│
╰──────────────────────╯`);
}

// ==================== CURAR ====================

export async function handleCurar(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const hpMax = calcularHpMax(player);
    
    if (player.hp >= hpMax) {
        return reply('Voce ja esta com HP cheio!');
    }
    
    await react('💚');
    
    const hpFaltando = hpMax - player.hp;
    const custoOuro = Math.floor(hpFaltando * 0.5);
    
    if (player.ouro >= custoOuro) {
        modificarOuro(sender, -custoOuro);
        modificarHP(sender, hpMax);
        
        return reply(`
╭──────────────────────╮
│ 💚 *CURADO!*
├──────────────────────┤
│
│ ❤️ HP: ${hpMax}/${hpMax}
│ 💰 Custo: -${custoOuro} ouro
│
╰──────────────────────╯`);
    } else {
        const curaPossivel = Math.floor(player.ouro * 2);
        modificarOuro(sender, -player.ouro);
        modificarHP(sender, curaPossivel);
        
        const novoPlayer = getPlayer(sender);
        
        return reply(`
╭──────────────────────╮
│ 💚 *CURA PARCIAL*
├──────────────────────┤
│
│ ❤️ +${curaPossivel} HP
│ HP atual: ${novoPlayer.hp}/${hpMax}
│ 💰 Ouro gasto: todo
│
│ _Ouro insuficiente para cura total_
╰──────────────────────╯`);
    }
}

// ==================== GOLD ====================

export async function handleGold(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    await react('💰');
    
    const ouro = player.ouro || 0;
    const formatado = ouro.toLocaleString('pt-BR');
    
    const mensagem = `💰 *OURO*\n\n${formatado} ouro`;
    return reply(mensagem);
}

// ==================== DAILY ====================

export async function handleDaily(sock, msg, jid, sender, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    const cooldown = verificarCooldown(sender, 'daily');
    if (cooldown.emCooldown) {
        return reply(`Voce ja coletou o bonus diario hoje! Volte amanha.`);
    }
    
    await react('🎁');
    
    const ouroBonus = 50 + (player.level * 10);
    const xpBonus = 25 + (player.level * 5);
    
    setCooldown(sender, 'daily', new Date().toDateString());
    modificarOuro(sender, ouroBonus);
    const resultado = adicionarXP(sender, xpBonus);
    
    let levelUpMsg = '';
    if (resultado.levelUp) {
        levelUpMsg = `│ 🎉 LEVEL UP! Level ${resultado.player.level}!`;
    }
    
    return reply(`
╭──────────────────────╮
│ 🎁 *BONUS DIARIO*
├──────────────────────┤
│
│ 💰 +${ouroBonus} Ouro
│ ⭐ +${resultado.xpGanho} XP
${levelUpMsg}
│
│ Volte amanha!
╰──────────────────────╯`);
}

// (duplicate stats/upgrade block removed)
