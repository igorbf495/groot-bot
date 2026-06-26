import fs from 'fs';
import path from 'path';
import { DATA_DIR, RPG_FILE } from './config.js';
import { CLASSES, RACAS } from './racas-classes.js';
import { LOJA_ITENS } from './itens.js';
import { getModificador, xpParaLevel } from './utils.js';

// Leveling de itens
const ITEM_XP_PER_LEVEL = 100;
const ITEM_BONUS_PER_LEVEL = 0.05; // 5% por nível

// ==================== FUNCOES DE DADOS ====================

function loadData() {
    try {
        if (fs.existsSync(RPG_FILE)) {
            const data = fs.readFileSync(RPG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('[RPG] Erro ao carregar dados:', e);
    }
    return { players: {} };
}

function saveData(data) {
    try {
        fs.writeFileSync(RPG_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('[RPG] Erro ao salvar dados:', e);
    }
}

// ==================== FUNCOES DO JOGADOR ====================

export function getPlayer(senderId) {
    const data = loadData();
    return data.players[senderId] || null;
}

export function playerExists(senderId) {
    return getPlayer(senderId) !== null;
}

export function deletarJogador(senderId) {
    const data = loadData();
    if (data.players[senderId]) {
        delete data.players[senderId];
        saveData(data);
        return true;
    }
    return false;
}

// Calcular HP maximo
export function calcularHpMax(player) {
    player = migrarPersonagem(player);
    
    const classe = CLASSES[player.classe] || CLASSES.guerreiro;
    const raca = RACAS[player.raca] || RACAS.humano;
    const modCon = getModificador(player.atributos?.forca || 10);
    
    // HP = hitDie no level 1 + (media do hitDie + modCon) por level
    let hp = classe.hitDie + modCon;
    for (let i = 2; i <= player.level; i++) {
        hp += Math.floor(classe.hitDie / 2) + 1 + modCon;
    }
    
    // Bonus racial (anao)
    if (raca.hpBonus) {
        hp = Math.floor(hp * raca.hpBonus);
    }
    
    return Math.max(hp, 10); // Minimo 10 HP
}

// Calcular Classe de Armadura (CA)
export function calcularCA(player) {
    player = migrarPersonagem(player);
    
    let ca = 10 + getModificador(player.atributos?.destreza || 10);
    
    // Bonus de armadura
    if (player.equipado?.armadura) {
        const armadura = LOJA_ITENS.armaduras.find(i => i.id === player.equipado.armadura);
        if (armadura) ca += armadura.bonusCA;
    }
    
    return ca;
}

// Migrar personagem antigo para o novo sistema
export function migrarPersonagem(player) {
    // Migração para novo sistema de atributos (Elden Ring style)
    const atributosNovos = ['vigor', 'resistencia', 'forca', 'destreza', 'inteligencia', 'fe', 'sorte'];
    const precisaMigrar = !player.atributos || atributosNovos.some(a => player.atributos[a] === undefined);
    if (precisaMigrar) {
        const raca = player.raca || 'humano';
        const racaInfo = RACAS[raca] || RACAS.humano;

        // Pontos investidos nos atributos antigos (para devolver como pontos livres)
        const antigos = player.atributos || {};
        const pontosInvestidos = ['forca', 'destreza', 'inteligencia', 'sorte']
            .reduce((s, k) => s + Math.max(0, (antigos[k] || 10) - 10), 0);
        const pontosLivres = player.pontosAtributos || 0;
        const totalPontos = Math.max(0, pontosInvestidos + pontosLivres);

        // Base 10 para todos os atributos + bônus de raça/classe (aplicado nos atributos pertinentes)
        player.atributos = {
            vigor: 10,
            resistencia: 10,
            forca: 10 + (racaInfo.bonus?.forca || 0),
            destreza: 10 + (racaInfo.bonus?.destreza || 0),
            inteligencia: 10 + (racaInfo.bonus?.inteligencia || 0),
            fe: 10,
            sorte: 10 + (racaInfo.bonus?.sorte || 0)
        };

        player.pontosAtributos = totalPontos;

        // Salvar a migracao
        const data = loadData();
        const senderId = Object.keys(data.players).find(id => data.players[id] === player);
        if (senderId) {
            data.players[senderId] = player;
            saveData(data);
        }
    }
    
    // Se nao tem raca, definir como humano
    if (!player.raca) {
        player.raca = 'humano';
    }
    
    // Se nao tem equipado, criar estrutura
    if (!player.equipado) {
        player.equipado = { arma: null, armadura: null };
    }
    // Se nao tem lista de bosses derrotados, inicializar
    if (!player.bossesDerrotadosIds) {
        player.bossesDerrotadosIds = [];
    }
    // Pedras de upgrade (para gating de níveis altos de item)
    if (!player.upgradeStones) {
        player.upgradeStones = { rara: 0, boss: 0 };
    }
    
    return player;
}

// Calcular bonus de ataque
export function calcularBonusAtaque(player) {
    player = migrarPersonagem(player);
    
    const classe = CLASSES[player.classe];
    let atributo = player.atributos.forca;
    
    // Magos e Clerigos usam inteligencia
    if (classe?.usaInteligencia) {
        atributo = player.atributos.inteligencia;
    }
    
    let bonus = getModificador(atributo);
    
    // Proficiencia (aumenta a cada 4 levels)
    bonus += Math.floor(player.level / 4) + 2;
    
    // Bonus de arma
    if (player.equipado?.arma) {
        const arma = LOJA_ITENS.armas.find(i => i.id === player.equipado.arma);
        if (arma) bonus += arma.bonusAtaque;
    }
    
    return bonus;
}

// Calcular dano
export function calcularDano(player) {
    player = migrarPersonagem(player);
    
    const classe = CLASSES[player.classe];
    let atributo = player.atributos.forca;
    
    if (classe?.usaInteligencia) {
        atributo = player.atributos.inteligencia;
    }
    
    let dadoDano = '1d4'; // Desarmado
    let bonosDano = 0; // Bônus extra (de classe ou item)
    
    if (player.equipado?.arma) {
        const arma = LOJA_ITENS.armas.find(i => i.id === player.equipado.arma);
        if (arma) {
            dadoDano = arma.dano;
            // Se arma tem bônus INT (cajado), aumentar o modificador
            if (arma.bonusInt && classe?.usaInteligencia) {
                bonosDano = arma.bonusInt;
            }
        }
    }
    
    let modificador = getModificador(atributo) + bonosDano;
    
    // Bônus extra de dano para classes que usam INT
    if (classe?.bonosDanoInt && classe.usaInteligencia) {
        modificador = Math.floor(modificador * classe.bonosDanoInt);
    }
    
    return { dado: dadoDano, modificador };
}

// Criar novo jogador
export function criarJogador(senderId, nome, raca, classe) {
    const data = loadData();
    
    const racaInfo = RACAS[raca];
    const classeInfo = CLASSES[classe];
    if (!racaInfo || !classeInfo) return null;
    
    // Atributos base (10) + bonus de raca/classe onde existir
    const atributos = {
        vigor: 10,
        resistencia: 10,
        forca: 10 + (racaInfo.bonus.forca || 0) + (classeInfo.bonus.forca || 0),
        destreza: 10 + (racaInfo.bonus.destreza || 0) + (classeInfo.bonus.destreza || 0),
        inteligencia: 10 + (racaInfo.bonus.inteligencia || 0) + (classeInfo.bonus.inteligencia || 0),
        fe: 10,
        sorte: 10 + (racaInfo.bonus.sorte || 0) + (classeInfo.bonus.sorte || 0)
    };
    
    const novoJogador = {
        nome: nome,
        raca: raca,
        classe: classe,
        level: 1,
        xp: 0,
        atributos: atributos,
        pontosAtributos: 0, // Pontos para distribuir tipo Elden Ring
        hp: 0, // Sera calculado abaixo
        ouro: 50,
        elo: 1600, // ELO Rating para duelos (1600 = intermediário)
        inventario: [],
        equipado: { arma: null, armadura: null },
        stats: {
            monstrosMortos: 0,
            duelosVencidos: 0,
            duelosPerdidos: 0,
            criticos: 0,
            falhasCriticas: 0,
            dueloStreak: 0,
            dueloXpPerdido: 0,
            bossesDerrotados: 0
        },
        bossesDerrotadosIds: [],
        upgradeStones: { rara: 0, boss: 0 },
        cooldowns: { cacar: 0, duelo: 0, boss: 0, daily: null, roubar: 0 },
        criado: Date.now()
    };
    
    // Calcular HP inicial
    data.players[senderId] = novoJogador;
    novoJogador.hp = calcularHpMax(novoJogador);
    
    saveData(data);
    return novoJogador;
}

// Atualizar jogador
export function updatePlayer(senderId, updates) {
    const data = loadData();
    if (!data.players[senderId]) return null;
    
    data.players[senderId] = { ...data.players[senderId], ...updates };
    saveData(data);
    
    return data.players[senderId];
}

// Adicionar XP
export function adicionarXP(senderId, quantidade) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return null;
    
    // Migrar personagem antigo se necessario
    player = migrarPersonagem(player);
    data.players[senderId] = player;
    
    // Bonus de XP racial (humano)
    const raca = RACAS[player.raca] || RACAS.humano;
    if (raca.xpBonus) {
        quantidade = Math.floor(quantidade * raca.xpBonus);
    }
    
    player.xp += quantidade;
    let levelUp = false;
    let levelsGanhos = 0;
    
    while (player.xp >= xpParaLevel(player.level) && player.level < 100) {
        player.xp -= xpParaLevel(player.level);
        player.level++;
        levelsGanhos++;
        levelUp = true;
        
        // +3 pontos de atributo a cada level (tipo Elden Ring)
        player.pontosAtributos = (player.pontosAtributos || 0) + 3;
        
        // Bonus de atributo a cada 4 levels
        if (player.level % 4 === 0 && player.atributos) {
            // Aumenta atributo principal da classe
            const classe = CLASSES[player.classe];
            if (classe?.atributoPrincipal === 'forca') player.atributos.forca += 1;
            else if (classe?.atributoPrincipal === 'destreza') player.atributos.destreza += 1;
            else if (classe?.atributoPrincipal === 'inteligencia') player.atributos.inteligencia += 1;
        }
    }
    
    if (levelUp) {
        player.hp = calcularHpMax(player); // Restaura HP ao subir de level
    }
    
    saveData(data);
    return { player, levelUp, levelsGanhos, xpGanho: quantidade };
}

// Modificar ouro
export function modificarOuro(senderId, quantidade) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.ouro = Math.max(0, player.ouro + quantidade);
    saveData(data);
    return player;
}

// Modificar HP
export function modificarHP(senderId, quantidade) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    const hpMax = calcularHpMax(player);
    player.hp = Math.max(0, Math.min(hpMax, player.hp + quantidade));
    saveData(data);
    return player;
}

// Adicionar item
export function adicionarItem(senderId, itemId) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.inventario.push(itemId);
    saveData(data);
    return player;
}

// Remover item
export function removerItem(senderId, itemId) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    const index = player.inventario.indexOf(itemId);
    if (index > -1) {
        player.inventario.splice(index, 1);
        saveData(data);
    }
    return player;
}

// Equipar item
export function equiparItem(senderId, itemId) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return { sucesso: false, motivo: 'Jogador nao encontrado' };
    
    if (!player.inventario.includes(itemId)) {
        return { sucesso: false, motivo: 'Voce nao possui este item' };
    }
    
    let item = LOJA_ITENS.armas.find(i => i.id === itemId);
    let slot = 'arma';
    
    if (!item) {
        item = LOJA_ITENS.armaduras.find(i => i.id === itemId);
        slot = 'armadura';
    }
    
    if (!item) {
        return { sucesso: false, motivo: 'Item invalido para equipar' };
    }
    
    const itemAnterior = player.equipado[slot];
    player.equipado[slot] = itemId;
    
    saveData(data);
    return { sucesso: true, item, slot, itemAnterior };
}

// Cooldowns
export function setCooldown(senderId, tipo, tempo) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.cooldowns[tipo] = tempo;
    saveData(data);
    return player;
}

export function verificarCooldown(senderId, tipo) {
    const player = getPlayer(senderId);
    if (!player) return { emCooldown: false };
    
    const agora = Date.now();
    const cooldown = player.cooldowns[tipo];
    
    if (tipo === 'daily') {
        const hoje = new Date().toDateString();
        return { emCooldown: cooldown === hoje, tempoRestante: 0 };
    }
    
    if (cooldown && cooldown > agora) {
        return { emCooldown: true, tempoRestante: cooldown - agora };
    }
    
    return { emCooldown: false, tempoRestante: 0 };
}

// Estatisticas
export function incrementarStat(senderId, stat, quantidade = 1) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.stats[stat] = (player.stats[stat] || 0) + quantidade;
    saveData(data);
    return player;
}

// Ranking
export function getRanking(limite = 10) {
    const data = loadData();
    const players = Object.entries(data.players)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.xp - a.xp;
        })
        .slice(0, limite);
    
    return players;
}

// Ranking de ELO
export function getRankingELO(limite = 10) {
    const data = loadData();
    const players = Object.entries(data.players)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => (b.elo || 1600) - (a.elo || 1600))
        .slice(0, limite);
    
    return players;
}

export function getMonstroAleatorio(player, MONSTROS) {
    const nivelJogador = player.level;
    
    // Calcula o CR máximo apropriado para o nível do jogador com dificuldade aumentada a partir do nível 5.
    // - Níveis 1-2: CR até 1 (fácil)
    // - Níveis 3-4: CR até 2 (moderado)
    // - Nível 5+: Dificuldade aumenta significativamente, monstros fortes aparecem com mais frequência
    let crMaximo;
    if (nivelJogador < 5) {
        crMaximo = Math.max(1, Math.floor(nivelJogador / 2));
    } else {
        // A partir do nível 5, aumenta muito mais a dificuldade
        crMaximo = Math.floor((nivelJogador - 3) / 1.5); // Progressão mais agressiva
    }
    
    // Filtra monstros cujo CR é menor ou igual ao CR máximo permitido para o nível do jogador.
    const monstrosElegiveis = MONSTROS.filter(m => {
        return m.cr <= crMaximo;
    });
    
    // Edge Case: Se, por algum motivo, nenhum monstro elegível for encontrado (o que não deve acontecer com a lista atual),
    // retorna o monstro mais fraco para evitar erros.
    if (monstrosElegiveis.length === 0) {
        console.warn("Nenhum monstro elegível encontrado para o nível do jogador. Retornando o monstro mais fraco.");
        return MONSTROS[0];
    }
    
    // A partir do nível 5, favorece monstros mais fortes (inverte o peso)
    let pesos;
    if (nivelJogador < 5) {
        // Peso normal: favorece monstros fracos
        pesos = monstrosElegiveis.map(m => 1 / (m.cr + 0.5));
    } else {
        // Peso invertido: favorece monstros fortes
        pesos = monstrosElegiveis.map(m => m.cr + 0.5);
    }
    
    const totalPesos = pesos.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalPesos;
    let pesoAcumulado = 0;
    
    // Itera sobre os monstros elegíveis para encontrar qual foi selecionado com base nos pesos.
    for (let i = 0; i < monstrosElegiveis.length; i++) {
        pesoAcumulado += pesos[i];
        if (random <= pesoAcumulado) {
            return monstrosElegiveis[i];
        }
    }
    
    // Fallback: Retorna o primeiro monstro elegível se o loop não encontrar um (por precaução).
    return monstrosElegiveis[0];
}

// ==================== SISTEMA DE ATRIBUTOS (ELDEN RING STYLE) ====================

export function distribuirPontoAtributo(senderId, atributo, pontos) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return null;
    
    player = migrarPersonagem(player);
    
    const atributoValido = ['forca', 'destreza', 'inteligencia', 'sorte'].includes(atributo.toLowerCase());
    if (!atributoValido) return { erro: 'Atributo inválido' };
    
    const pontosSolicitados = Math.max(1, Math.min(pontos, player.pontosAtributos || 0));
    if (pontosSolicitados === 0) return { erro: 'Você não tem pontos de atributo disponíveis' };
    
    // Distribuir os pontos
    const atributoNorm = atributo.toLowerCase();
    player.atributos[atributoNorm] += pontosSolicitados;
    player.pontosAtributos -= pontosSolicitados;
    
    // Se distribuiu todos os pontos, recalcular HP
    if (player.pontosAtributos === 0) {
        player.hp = calcularHpMax(player);
    }
    
    data.players[senderId] = player;
    saveData(data);
    
    return {
        success: true,
        atributo: atributoNorm,
        pontos: pontosSolicitados,
        novoValor: player.atributos[atributoNorm],
        pontosRestantes: player.pontosAtributos
    };
}

export function obterPontosAtributos(senderId) {
    const player = getPlayer(senderId);
    if (!player) return null;
    
    return {
        pontos: player.pontosAtributos || 0,
        atributos: player.atributos || {},
        level: player.level
    };
}
/**
 * Garantir estrutura de leveling nos itens do jogador
 */
export function inicializarLevelingItens(player) {
    if (!player.inventarioLeveling) {
        player.inventarioLeveling = {};
    }
    return player;
}

/**
 * Adicionar XP a um item específico
 */
export function adicionarXPItem(senderId, itemId, xpGanho) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return { levelUp: false, levelAnterior: 0, levelNovo: 0, xpAtual: 0, xpProximo: ITEM_XP_PER_LEVEL };

    player = inicializarLevelingItens(player);
    if (!player.inventarioLeveling[itemId]) {
        player.inventarioLeveling[itemId] = { level: 0, xp: 0 };
    }

    let levelUp = false;
    const levelAnterior = player.inventarioLeveling[itemId].level;
    player.inventarioLeveling[itemId].xp += xpGanho;

    while (player.inventarioLeveling[itemId].xp >= ITEM_XP_PER_LEVEL) {
        player.inventarioLeveling[itemId].xp -= ITEM_XP_PER_LEVEL;
        player.inventarioLeveling[itemId].level += 1;
        levelUp = true;
    }
    
    data.players[senderId] = player;
    saveData(data);
    
    return {
        levelUp,
        levelAnterior,
        levelNovo: player.inventarioLeveling[itemId].level,
        xpAtual: player.inventarioLeveling[itemId].xp,
        xpProximo: ITEM_XP_PER_LEVEL
    };
}

/**
 * Calcular bônus de um item baseado no seu nível
 */
export function calcularBonusLevelingItem(itemId, player) {
    if (!player?.inventarioLeveling?.[itemId]) {
        return {
            level: 0,
            bonusDanoMultiplier: 1,
            bonusCA: 0,
            bonusAtaque: 0
        };
    }
    
    const level = player.inventarioLeveling[itemId].level || 0;
    return {
        level,
        bonusDanoMultiplier: 1 + (level * ITEM_BONUS_PER_LEVEL),
        bonusCA: level,
        bonusAtaque: Math.floor(level / 2)
    };
}

/**
 * Obter informações de leveling de um item
 */
export function getInfoLevelingItem(itemId, player) {
    player = inicializarLevelingItens(player);
    
    if (!player.inventarioLeveling?.[itemId]) {
        return {
            level: 0,
            xp: 0,
            maxXp: ITEM_XP_PER_LEVEL,
            progressBar: '░░░░░░░░░░ 0%',
            descricao: '⭕ Novo (sem leveling)',
            emoji: '⭕'
        };
    }
    
    const dados = player.inventarioLeveling[itemId];
    const xp = dados.xp || 0;
    const maxXp = ITEM_XP_PER_LEVEL;
    const percentual = Math.round((xp / maxXp) * 100);
    
    const barras = Math.floor(percentual / 10);
    const progressBar = '█'.repeat(barras) + '░'.repeat(10 - barras) + ` ${percentual}%`;
    
    const levelEmojis = ['⭕', '🟢', '🔵', '🟣', '🟡', '🌟', '💎', '👑'];
    const emoji = levelEmojis[Math.min(dados.level || 0, levelEmojis.length - 1)];
    
    return {
        level: dados.level || 0,
        xp,
        maxXp,
        progressBar,
        descricao: `${emoji} Nível ${dados.level || 0} (${xp}/${maxXp} XP)`,
        emoji
    };
}

/**
 * Adicionar XP a itens equipados após combate
 */
export function adicionarXPEquipados(senderId, xpBase) {
    const player = getPlayer(senderId);
    if (!player?.equipado) return [];
    
    const itemsLevelUP = [];
    
    // Arma equipada (70% do XP)
    if (player.equipado.arma) {
        const resultado = adicionarXPItem(senderId, player.equipado.arma, Math.floor(xpBase * 0.7));
        if (resultado.levelUp) {
            itemsLevelUP.push({
                tipo: 'arma',
                itemId: player.equipado.arma,
                ...resultado
            });
        }
    }
    
    // Armadura equipada (30% do XP)
    if (player.equipado.armadura) {
        const resultado = adicionarXPItem(senderId, player.equipado.armadura, Math.floor(xpBase * 0.3));
        if (resultado.levelUp) {
            itemsLevelUP.push({
                tipo: 'armadura',
                itemId: player.equipado.armadura,
                ...resultado
            });
        }
    }
    
    return itemsLevelUP;
}
