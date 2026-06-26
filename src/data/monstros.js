// ==================== MONSTROS COM CR ====================

// Monstros rebalanceados (CR = Challenge Rating)
// Os atributos foram ajustados para proporcionar uma curva de dificuldade mais suave.
// HP (Hit Points): Reduzido para permitir combates mais curtos e menos punitivos.
// CA (Armor Class): Ajustado para que os ataques do jogador tenham uma chance razoável de acerto.
// bonusAtaque: Reduzido para diminuir a frequência e o dano dos ataques do monstro.
// dano: Reduzido para evitar que o jogador seja derrotado rapidamente.
// xp e ouro: Ajustados para serem proporcionais ao novo nível de dificuldade.
export const MONSTROS = [
    // CR 1/8 (Level 1-2) - Fácil
    // Ideal para jogadores recém-criados, oferece um primeiro contato com o combate.
    { 
        nome: 'Rato Gigante', 
        emoji: '🐀', 
        cr: 0.125, // Challenge Rating: 1/8
        hp: 10,    // Aumentado para mais desafio
        ca: 10,    // CA aumentada
        bonusAtaque: 1, // Bônus aumentado
        dano: '1d4',   // Dano aumentado
        xp: 25,    // XP ajustado
        ouro: 35    // Ouro ajustado
    },

    // CR 1/8 (Level 1-2) - Fácil - Alternativo
    { 
        nome: 'Aranha Venenosa', 
        emoji: '🕷️', 
        cr: 0.125,
        hp: 14,
        ca: 14,
        bonusAtaque: 2,
        dano: '1d5',
        xp: 30,
        ouro: 40
    },
    
    // CR 1/4 (Level 1-3) - Moderado
    // Um passo acima, introduzindo um pouco mais de resistência e dano.
    { 
        nome: 'Goblin', 
        emoji: '👺', 
        cr: 0.25,  // Challenge Rating: 1/4
        hp: 25,    // HP aumentado
        ca: 13,    // CA aumentada
        bonusAtaque: 3, // Bônus aumentado
        dano: '1d6', 
        xp: 50,    // XP ajustado
        ouro: 60    // Ouro ajustado
    },

    // CR 1/4 (Level 1-3) - Moderado - Alternativo
    { 
        nome: 'Lobo Selvagem', 
        emoji: '🐺', 
        cr: 0.25,
        hp: 28,
        ca: 14,
        bonusAtaque: 3,
        dano: '1d6+1',
        xp: 55,
        ouro: 65
    },
    
    // CR 1/2 (Level 3-5) - Desafiador
    // Para jogadores que já ganharam alguns níveis e equipamentos.
    { 
        nome: 'Orc', 
        emoji: '👹', 
        cr: 0.5,   // Challenge Rating: 1/2
        hp: 35,    // HP aumentado
        ca: 13,    // CA aumentada
        bonusAtaque: 4, // Bônus aumentado
        dano: '1d8', // Dano aumentado
        xp: 110,    // XP ajustado
        ouro: 120   // Ouro ajustado
    },

    // CR 1/2 (Level 3-5) - Desafiador - Alternativo
    { 
        nome: 'Troll Robusto', 
        emoji: '🗿', 
        cr: 0.5,
        hp: 48,
        ca: 12,
        bonusAtaque: 4,
        dano: '1d8+1',
        xp: 120,
        ouro: 130
    },
    
    // CR 1 (Level 5-7) - Difícil
    // Representa um desafio significativo, exigindo um personagem mais desenvolvido.
    { 
        nome: 'Ogro', 
        emoji: '👾', 
        cr: 1,     // Challenge Rating: 1
        hp: 70,    // HP aumentado
        ca: 27,    // CA aumentada
        bonusAtaque: 8, // Bônus aumentado
        dano: '1d10+2', // Dano aumentado
        xp: 300,   // XP ajustado
        ouro: 280   // Ouro ajustado
    },

    // CR 1 (Level 5-7) - Difícil - Alternativo
    { 
        nome: 'Dragao Jovem', 
        emoji: '🐉', 
        cr: 1,
        hp: 85,
        ca: 14,
        bonusAtaque: 5,
        dano: '2d8',
        xp: 350,
        ouro: 250
    },

    // CR 4 (Level 10+) - Avancado
    { 
        nome: 'Quimera Ardente', 
        emoji: '🔥', 
        cr: 4,
        hp: 180,
        ca: 18,
        bonusAtaque: 11,
        dano: '2d10+5',
        xp: 900,
        ouro: 700
    },

    // CR 10 (Level 20+) - Elite
    { 
        nome: 'Titan de Ferro', 
        emoji: '🛡️', 
        cr: 10,
        hp: 420,
        ca: 21,
        bonusAtaque: 16,
        dano: '3d12+8',
        xp: 2200,
        ouro: 1800
    },

    // CR 12 (Level 25+) - Mitico
    { 
        nome: 'Devorador Estelar', 
        emoji: '🌌', 
        cr: 12,
        hp: 520,
        ca: 23,
        bonusAtaque: 18,
        dano: '3d12+10',
        xp: 3200,
        ouro: 2400
    }
];

// ==================== ESCALAMENTO DE DIFICULDADE ====================

/**
 * Escala os stats de um monstro baseado no nível do jogador
 * Quanto maior o nível do jogador, mais forte o monstro fica
 * @param {Object} monstro - Monstro base
 * @param {number} playerLevel - Nível do jogador
 * @param {number} monstrosDerrotados - Quantidade de monstros já derrotados
 * @returns {Object} Monstro escalado
 */
export function escalarMonstro(monstro, playerLevel, monstrosDerrotados = 0) {
    const monstroEscalado = { ...monstro };
    
    // Multiplicador baseado no nível do jogador
    // A cada 2 níveis, o monstro fica ~10% mais forte
    const multiplicadorNivel = 1 + (playerLevel / 20);
    
    // Multiplicador baseado em monstros já derrotados
    // A cada 5 monstros derrotados, +3% de dificuldade
    const multiplicadorProgresso = 1 + (monstrosDerrotados * 0.03 / 5);

    // Boost para personagens de level alto (caçadas ficam mais punitivas em níveis elevados)
    const multiplicadorHighLevel = playerLevel >= 10
        ? 1 + Math.min(0.03 * (playerLevel - 10), 0.6)
        : 1;

    // Boost extra para fim de jogo (level 18+)
    const multiplicadorEndgame = playerLevel >= 18
        ? Math.min(1.45, 1.15 + (playerLevel - 18) * 0.02)
        : 1;
    
    // Multiplicador final (combina todos os fatores)
    const multiplicadorTotal = multiplicadorNivel * multiplicadorProgresso * multiplicadorHighLevel * multiplicadorEndgame;
    
    // Escalar HP (aumenta linearmente)
    monstroEscalado.hp = Math.ceil(monstro.hp * multiplicadorTotal);
    
    // Escalar Bônus de Ataque (aumenta 1 a cada 3 níveis + ajuste para níveis altos)
    const bonusAtaqueBase = monstro.bonusAtaque + Math.floor(playerLevel / 3);
    const bonusAtaqueHighLevel = Math.floor(playerLevel / 8);
    monstroEscalado.bonusAtaque = Math.max(
        monstro.bonusAtaque,
        bonusAtaqueBase + bonusAtaqueHighLevel
    );
    
    // Escalar CA (aumenta 1 a cada 4 níveis, máximo +5) + pequeno reforço em níveis altos
    const caBonusBase = Math.min(5, Math.floor(playerLevel / 4));
    const caBonusHighLevel = Math.min(2, Math.floor(playerLevel / 12));
    monstroEscalado.ca = monstro.ca + caBonusBase + caBonusHighLevel;
    
    // Escalar Dano (aumenta o modificador de dano)
    if (typeof monstro.dano === 'string') {
        try {
            // Verifica se tem + ou -
            const temModificador = monstro.dano.includes('+') || (monstro.dano.includes('-') && !monstro.dano.match(/^(\d+)d(\d+)$/));
            
            if (temModificador) {
                const parts = monstro.dano.split('+');
                let danoBase = parts[0]; // ex: "1d8"
                let modificador = parts[1] ? parseInt(parts[1]) : 0;
                
                // Aumenta modificador progressivamente (escala mais para níveis altos)
                const danoBonus = Math.floor(playerLevel / 5) + Math.floor(playerLevel / 10);
                modificador += danoBonus;
                
                monstroEscalado.dano = modificador > 0 ? `${danoBase}+${modificador}` : danoBase;
            } else {
                // Sem modificador, apenas usa dano base
                monstroEscalado.dano = monstro.dano;
            }
        } catch (e) {
            console.warn('[RPG] Erro ao escalar dano:', monstro.dano, e);
            monstroEscalado.dano = monstro.dano;
        }
    }
    
    // Escalar Recompensas (XP e Ouro)
    monstroEscalado.xp = Math.ceil(monstro.xp * multiplicadorTotal);
    monstroEscalado.ouro = Math.ceil(monstro.ouro * multiplicadorTotal);
    
    // Adicionar info de escalamento visual
    monstroEscalado.multiplicador = multiplicadorTotal.toFixed(2);
    monstroEscalado.escalado = true;
    
    return monstroEscalado;
}

/**
 * Escala os stats de um boss baseado no nível do jogador
 * Bosses escalam mais agressivamente que monstros normais
 * @param {Object} boss - Boss base
 * @param {number} playerLevel - Nível do jogador
 * @returns {Object} Boss escalado
 */
export function escalarBoss(boss, playerLevel) {
    const bossEscalado = { ...boss };
    
    // Multiplicador mais agressivo para bosses (escala 3.3% por nível)
    const multiplicadorNivel = 1 + (playerLevel / 30);

    // Boost extra para fim de jogo (level 18+)
    const multiplicadorEndgame = playerLevel >= 18
        ? Math.min(1.6, 1.25 + (playerLevel - 18) * 0.025)
        : 1;
    
    // Escalar HP (aumenta mais que monstros normais)
    bossEscalado.hp = Math.ceil(boss.hp * multiplicadorNivel * multiplicadorEndgame);
    
    // Escalar Bônus de Ataque (aumenta 1 a cada 2 níveis)
    bossEscalado.bonusAtaque = Math.max(
        boss.bonusAtaque,
        boss.bonusAtaque + Math.floor(playerLevel / 3)
    );
    
    // Escalar CA (aumenta progressivamente)
    const caBonus = Math.min(5, Math.floor(playerLevel / 4));
    bossEscalado.ca = Math.ceil((boss.ca + caBonus) * multiplicadorEndgame);
    
    // Escalar Dano (aumenta o modificador)
    if (typeof boss.dano === 'string') {
        try {
            const temModificador = boss.dano.includes('+') || (boss.dano.includes('-') && !boss.dano.match(/^(\d+)d(\d+)$/));
            
            if (temModificador) {
                const parts = boss.dano.split('+');
                let danoBase = parts[0];
                let modificador = parts[1] ? parseInt(parts[1]) : 0;
                
                const danoBonus = Math.floor(playerLevel / 3);
                modificador += danoBonus;
                
                bossEscalado.dano = modificador > 0 ? `${danoBase}+${modificador}` : danoBase;
            } else {
                bossEscalado.dano = boss.dano;
            }
        } catch (e) {
            console.warn('[RPG] Erro ao escalar dano boss:', boss.dano, e);
            bossEscalado.dano = boss.dano;
        }
    }
    
    // Escalar Recompensas
    bossEscalado.xp = Math.ceil(boss.xp * multiplicadorNivel * multiplicadorEndgame);
    bossEscalado.ouro = Math.ceil(boss.ouro * multiplicadorNivel * multiplicadorEndgame);
    
    bossEscalado.multiplicador = (multiplicadorNivel * multiplicadorEndgame).toFixed(2);
    bossEscalado.escalado = true;
    
    return bossEscalado;
}

// ==================== BOSSES DO DUNGEON ====================

export const BOSSES = [
    {
        id: 'rei_goblin',
        nome: 'Rei Goblin',
        emoji: '👑👺',
        level: 5,
        hp: 120,
        ca: 14,
        bonusAtaque: 4,
        dano: '2d6+1',
        xp: 500,
        ouro: 300,
        habilidade: 'Grito de Guerra',
        descricao: 'O líder dos goblins, aumenta ATK em 50% a cada 3 rodadas',
        mecanica: 'buffo_ataque'
    },
    {
        id: 'bruxa_negra',
        nome: 'Bruxa Negra',
        emoji: '🧙‍♀️🌑',
        level: 7,
        hp: 100,
        ca: 15,
        bonusAtaque: 5,
        dano: '2d8',
        xp: 750,
        ouro: 400,
        habilidade: 'Maldição',
        descricao: 'Regenera 15 HP a cada 2 rodadas e reduz ATK do jogador em 25%',
        mecanica: 'regeneracao_e_debuff'
    },
    {
        id: 'senhor_dragao',
        nome: 'Senhor Dragão',
        emoji: '🐉👑',
        level: 10,
        hp: 200,
        ca: 16,
        bonusAtaque: 6,
        dano: '3d8+2',
        xp: 1500,
        ouro: 800,
        habilidade: 'Bafo de Fogo',
        descricao: 'Boss supremo! Alterna entre fases: normal, fogo (dano dobrado), regeneração',
        mecanica: 'fases_combate'
    },
    {
        id: 'lich_antigo',
        nome: 'Lich Antigo',
        emoji: '💀🔮',
        level: 8,
        hp: 150,
        ca: 13,
        bonusAtaque: 5,
        dano: '2d6+3',
        xp: 800,
        ouro: 500,
        habilidade: 'Invocação',
        descricao: 'Invoca reforços! Seus ataques recebem -2 e o boss ganha +1 CA a cada rodada',
        mecanica: 'invocacao_progressiva'
    },
    {
        id: 'rainha_aranhas',
        nome: 'Rainha das Aranhas',
        emoji: '🕷️👑',
        level: 6,
        hp: 90,
        ca: 15,
        bonusAtaque: 5,
        dano: '2d5+2',
        xp: 600,
        ouro: 350,
        habilidade: 'Teia Venenosa',
        descricao: 'Veneno: Você perde 5 HP por rodada. Ela ganha +20% de defesa com cada ataque',
        mecanica: 'veneno_e_defesa'
    },
    {
        id: 'titan_pedra',
        nome: 'Titã de Pedra',
        emoji: '🪨👹',
        level: 12,
        hp: 260,
        ca: 18,
        bonusAtaque: 7,
        dano: '3d10',
        xp: 2000,
        ouro: 1200,
        habilidade: 'Pele Implacável',
        descricao: 'Reduz 30% de todo dano recebido e ganha +1 CA por rodada.',
        mecanica: 'reduzir_dano_e_defesa'
    },
    {
        id: 'hidra_venenosa',
        nome: 'Hidra Venenosa',
        emoji: '🐍🐍🐍',
        level: 13,
        hp: 220,
        ca: 17,
        bonusAtaque: 8,
        dano: '3d8+3',
        xp: 2200,
        ouro: 1300,
        habilidade: 'Mordidas Múltiplas',
        descricao: 'Ataca duas vezes: segundo ataque causa veneno (perda de 10 HP/rodada).',
        mecanica: 'ataque_duplo_veneno'
    },
    {
        id: 'cavaleiro_carmesim',
        nome: 'Cavaleiro Carmesim',
        emoji: '🛡️🔥',
        level: 14,
        hp: 240,
        ca: 19,
        bonusAtaque: 9,
        dano: '2d12+2',
        xp: 2400,
        ouro: 1400,
        habilidade: 'Sangue e Chama',
        descricao: 'Causa sangramento (5 HP/rodada) e entra em fúria abaixo de 50% HP (dano +50%).',
        mecanica: 'sangramento_e_furia'
    },
    {
        id: 'arauto_tempestade',
        nome: 'Arauto da Tempestade',
        emoji: '🌩️👁️',
        level: 15,
        hp: 260,
        ca: 18,
        bonusAtaque: 10,
        dano: '3d10+2',
        xp: 2800,
        ouro: 1600,
        habilidade: 'Fúria Elétrica',
        descricao: 'Alterna cargas: turno impar dano +25%, turno par acerto garante atordoar (ignora CA).',
        mecanica: 'alternancia_eletrica'
    },
    {
        id: 'margit',
        nome: 'Margit, o Agouro',
        emoji: '🦊⚔️',
        level: 16,
        hp: 280,
        ca: 19,
        bonusAtaque: 11,
        dano: '3d10+3',
        xp: 3000,
        ouro: 1700,
        habilidade: 'Martelo Espectral',
        descricao: 'Salta e golpeia com martelo espectral (crit mais alto) e lança lâminas à distância.',
        mecanica: 'burst_espectral'
    },
    {
        id: 'godrick',
        nome: 'Godrick, o Enxertado',
        emoji: '🦾👑',
        level: 17,
        hp: 320,
        ca: 20,
        bonusAtaque: 12,
        dano: '3d12+2',
        xp: 3300,
        ouro: 1900,
        habilidade: 'Dragão Enxertado',
        descricao: 'Fase 2: bafo de fogo e golpes amplos em área; CA +1 e dano de fogo.',
        mecanica: 'fase_fogo_enxerto'
    },
    {
        id: 'rennala',
        nome: 'Rennala, Rainha da Lua Cheia',
        emoji: '🌕🔮',
        level: 18,
        hp: 300,
        ca: 19,
        bonusAtaque: 13,
        dano: '4d8+4',
        xp: 3600,
        ouro: 8000,
        habilidade: 'Lua Cheia',
        descricao: 'Invoca luas e espíritos; dano mágico alto, chance de reduzir ataque do jogador.',
        mecanica: 'magia_invocacao'
    },
    {
        id: 'radahn',
        nome: 'Radahn, Flagelo das Estrelas',
        emoji: '🌠🏇',
        level: 19,
        hp: 360,
        ca: 21,
        bonusAtaque: 14,
        dano: '4d10+3',
        xp: 4000,
        ouro: 4300,
        habilidade: 'Chuva de Meteoro',
        descricao: 'Abre com flechas de longa distância; fase meteoro causa grande dano em área.',
        mecanica: 'meteoro_area'
    },
    {
        id: 'malenia',
        nome: 'Malenia, Lâmina de Miquella',
        emoji: '🌸⚔️',
        level: 20,
        hp: 780,
        ca: 24,
        bonusAtaque: 19,
        dano: '4d10+5',
        xp: 4500,
        ouro: 2600,
        habilidade: 'Dança da Água',
        descricao: 'Ataques multigolpes e roubo de vida; fase Scarlet Rot aplica veneno pesado.',
        mecanica: 'multigolpe_lifesteal_rot'
    }
];
