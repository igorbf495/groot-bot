// ==================== FUNCOES UTILITARIAS ====================

// Rolar dado (ex: "2d6+3" retorna o resultado)
export function rolarDado(dado) {
    try {
        if (typeof dado === 'number') return dado;
        
        // Garantir que é string
        if (!dado || typeof dado !== 'string') {
            console.warn('[RPG] rolarDado recebeu valor inválido:', dado);
            return 0;
        }
        
        const match = dado.match(/(\d+)?d(\d+)([+-]\d+)?/);
        if (!match) {
            console.warn('[RPG] rolarDado não conseguiu fazer parse:', dado);
            return 0;
        }
        
        const quantidade = parseInt(match[1]) || 1;
        const faces = parseInt(match[2]);
        const modificador = parseInt(match[3]) || 0;
        
        let total = 0;
        for (let i = 0; i < quantidade; i++) {
            total += Math.floor(Math.random() * faces) + 1;
        }
        
        return total + modificador;
    } catch (error) {
        console.error('[RPG] Erro ao rolar dado:', error, 'dado:', dado);
        return 0;
    }
}

// Rolar d20
export function rolarD20() {
    return Math.floor(Math.random() * 20) + 1;
}

// Calcular modificador de atributo (estilo D&D: (attr - 10) / 2)
export function getModificador(valor) {
    return Math.floor((valor - 10) / 2);
}

// XP necessario para proximo level
export function xpParaLevel(level) {
    // Tabela simplificada e mais acessivel
    // Level 1->2: 100 XP (4 ratos ou 2 goblins)
    // Level 2->3: 200 XP
    // Level 3->4: 400 XP
    // Formula: 100 * (1.5 ^ (level-1))
    if (level <= 1) return 100;
    if (level <= 5) return Math.floor(100 * Math.pow(1.5, level - 1));
    if (level <= 10) return Math.floor(500 * Math.pow(1.4, level - 5));
    if (level <= 20) return Math.floor(2000 * Math.pow(1.3, level - 10));
    return Math.floor(20000 + (level - 20) * 5000);
}

// Calcular vantagem de duelo (baseado em level gap e streak)
export function calcularVantagemDuelo(jogadorMais, jogadorMenos) {
    const levelGap = jogadorMais.level - jogadorMenos.level;
    let vantagem = 0;
    
    // Cada 3 levels = +1 de vantagem
    if (levelGap > 0) {
        vantagem = Math.floor(levelGap / 3);
    }
    
    // Bônus de streak
    const streakVantagem = Math.floor((jogadorMais.stats?.dueloStreak || 0) / 5);
    
    return vantagem + streakVantagem;
}

// Calcular mudança de ELO para dois jogadores
export function calcularMudancaELO(vencedor, perdedor) {
    const eloV = vencedor.elo || 1600;
    const eloP = perdedor.elo || 1600;
    
    // K-factor padrão é 32, mas escalamos por level para tornar competição mais equilibrada
    // Jogadores de baixo level ganham/perdem menos ELO
    const kVencedor = 32;
    const kPerdedor = 32;
    
    // Fórmula de ELO esperado: 1 / (1 + 10^((eloOponente - eloJogador) / 400))
    const expectedV = 1 / (1 + Math.pow(10, (eloP - eloV) / 400));
    const expectedP = 1 / (1 + Math.pow(10, (eloV - eloP) / 400));
    
    // Resultado: 1 para vitória, 0 para derrota
    const novoEloVencedor = Math.round(eloV + kVencedor * (1 - expectedV));
    const novoEloPerdedor = Math.round(eloP + kPerdedor * (0 - expectedP));
    
    // Garantir que ELO não fica muito baixo
    return {
        novoEloVencedor: Math.max(1200, novoEloVencedor),
        novoEloPerdedor: Math.max(1200, novoEloPerdedor),
        ganhoVencedor: novoEloVencedor - eloV,
        perdaPerdedor: novoEloPerdedor - eloP
    };
}

// Obter badge de ELO baseado em rating
export function getBadgeELO(elo) {
    if (elo < 1400) return '🥉 Bronze';
    if (elo < 1600) return '🥈 Prata';
    if (elo < 1800) return '🥇 Ouro';
    if (elo < 2000) return '💎 Platina';
    return '👑 Diamante';
}

// Função para obter um boss aleatório
export function getBossAleatorio(BOSSES) {
    return BOSSES[Math.floor(Math.random() * BOSSES.length)];
}

// Função para aplicar mecânicas especiais do boss
export function aplicarMecanicaBoss(boss, rodada, playerDano, playerAtaque) {
    let effect = {};
    
    switch(boss.mecanica) {
        case 'buffo_ataque':
            // A cada 3 rodadas, aumenta ATK do boss
            if (rodada % 3 === 0) {
                effect.danoMultiplier = 1.5;
                effect.naracao = '⚡ O Rei Goblin *GRITA* e seus olhos brilham!';
            }
            break;
            
        case 'regeneracao_e_debuff':
            // Regenera a cada 2 rodadas e reduz ATK do jogador
            if (rodada % 2 === 0) {
                effect.curaBoss = 15;
                effect.naracao = '🌑 A Bruxa Negra canaliza energia escura...';
            }
            effect.playerDanoReduction = 0.75;
            break;
            
        case 'fases_combate':
            // Alterna entre fases
            const fase = Math.floor((boss.hp / (200 / 3)) % 3) + 1;
            if (fase === 1) {
                effect.naracao = '🔥 O Dragão entra em FÚRIA! Seu ataque dobra!';
                effect.danoMultiplier = 2;
            } else if (fase === 2) {
                effect.curaBoss = 30;
                effect.naracao = '✨ O Dragão recupera sua energia!';
            }
            break;
            
        case 'invocacao_progressiva':
            // Aumenta CA progressivamente
            effect.caIncrease = Math.floor(rodada / 2);
            if (rodada % 3 === 0) {
                effect.playerAtaqueReduction = -2;
                effect.naracao = '👻 Espíritos invocados protegem o Lich!';
            }
            break;
            
        case 'veneno_e_defesa':
            // Veneno contínuo e aumenta defesa
            effect.playerVeneno = 5;
            effect.defesaIncrease = Math.floor(rodada * 0.1);
            if (rodada === 1) {
                effect.naracao = '☠️ A Rainha injeta VENENO em você!';
            }
            break;
    }
    
    return effect;
}

// Obter loot legendário com chance baseada no CR do monstro
export function getLootLendario(monstro, playerLevel, LOJA_ITENS, gerarItemComAffixes) {
    // Chance de drop baseada no CR: CR 0.125 = 2%, CR 0.25 = 4%, CR 0.5 = 8%, CR 1 = 15%
    const chanceDrop = Math.min(monstro.cr * 15, 15);
    const roll = Math.random() * 100;
    
    if (roll > chanceDrop) {
        return null; // Sem loot
    }
    
    // 70% chance raro, 25% épico, 4% lendário, 1% ancestral
    const rarityRoll = Math.random() * 100;
    let raridade;
    if (rarityRoll < 70) raridade = 'raro';
    else if (rarityRoll < 95) raridade = 'epico';
    else if (rarityRoll < 99) raridade = 'lendario';
    else raridade = 'ancestral';
    
    // Escolher item aleatório
    const todasAsArmas = LOJA_ITENS.armas;
    const todasAsArmaduras = LOJA_ITENS.armaduras;
    const todosItems = [...todasAsArmas, ...todasAsArmaduras];
    
    const itemBase = todosItems[Math.floor(Math.random() * todosItems.length)];
    
    // Gerar item com affixes
    return gerarItemComAffixes(itemBase, raridade);
}
