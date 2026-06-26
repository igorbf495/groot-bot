// ==================== SISTEMA DE ELOS/RANKING ====================

export const TIERS_RANKING = [
    // Ferro: 0-1500 ELO
    { tier: 'Ferro', divisao: 3, emoji: '⚫', range: [0, 499], cor: '#696969' },
    { tier: 'Ferro', divisao: 2, emoji: '⚫', range: [500, 799], cor: '#696969' },
    { tier: 'Ferro', divisao: 1, emoji: '⚫', range: [800, 1099], cor: '#696969' },
    
    // Prata: 1100-1500 ELO
    { tier: 'Prata', divisao: 3, emoji: '🔶', range: [1100, 1299], cor: '#C0C0C0' },
    { tier: 'Prata', divisao: 2, emoji: '🔶', range: [1300, 1449], cor: '#C0C0C0' },
    { tier: 'Prata', divisao: 1, emoji: '🔶', range: [1450, 1599], cor: '#C0C0C0' },
    
    // Ouro: 1600-1999 ELO
    { tier: 'Ouro', divisao: 3, emoji: '🟡', range: [1600, 1749], cor: '#FFD700' },
    { tier: 'Ouro', divisao: 2, emoji: '🟡', range: [1750, 1899], cor: '#FFD700' },
    { tier: 'Ouro', divisao: 1, emoji: '🟡', range: [1900, 1999], cor: '#FFD700' },
    
    // Platina: 2000-2399 ELO
    { tier: 'Platina', divisao: 3, emoji: '💎', range: [2000, 2099], cor: '#E5E4E2' },
    { tier: 'Platina', divisao: 2, emoji: '💎', range: [2100, 2249], cor: '#E5E4E2' },
    { tier: 'Platina', divisao: 1, emoji: '💎', range: [2250, 2399], cor: '#E5E4E2' },
    
    // Diamante: 2400-2899 ELO
    { tier: 'Diamante', divisao: 3, emoji: '💠', range: [2400, 2549], cor: '#B9F2FF' },
    { tier: 'Diamante', divisao: 2, emoji: '💠', range: [2550, 2699], cor: '#B9F2FF' },
    { tier: 'Diamante', divisao: 1, emoji: '💠', range: [2700, 2899], cor: '#B9F2FF' },
    
    // Mestre: 2900+ ELO
    { tier: 'Mestre', divisao: 3, emoji: '👑', range: [2900, 3149], cor: '#FF6B6B' },
    { tier: 'Mestre', divisao: 2, emoji: '👑', range: [3150, 3399], cor: '#FF6B6B' },
    { tier: 'Mestre', divisao: 1, emoji: '👑', range: [3400, Infinity], cor: '#FF6B6B' }
];

/**
 * Obtém o tier e divisão baseado no ELO
 * @param {number} elo - ELO do jogador
 * @returns {object} { tier, divisao, emoji, progresso, proximoDivisao }
 */
export function obterTierELO(elo = 1600) {
    elo = Math.max(0, elo);
    
    const tierAtual = TIERS_RANKING.find(t => elo >= t.range[0] && elo <= t.range[1]);
    
    if (!tierAtual) {
        return TIERS_RANKING[TIERS_RANKING.length - 1];
    }
    
    // Calcula progresso até próxima divisão
    const eloMin = tierAtual.range[0];
    const eloMax = tierAtual.range[1];
    const progresso = ((elo - eloMin) / (eloMax - eloMin + 1) * 100).toFixed(1);
    
    return {
        tier: tierAtual.tier,
        divisao: tierAtual.divisao,
        emoji: tierAtual.emoji,
        elo: elo,
        progresso: Math.min(100, progresso),
        eloMin,
        eloMax,
        proxELO: eloMax + 1
    };
}

/**
 * Retorna uma barra visual do ELO
 * @param {number} elo - ELO do jogador
 * @returns {string} Barra visual
 */
export function obterBarraELO(elo = 1600) {
    const tierInfo = obterTierELO(elo);
    const preenchimento = Math.floor(tierInfo.progresso / 10);
    const vazio = 10 - preenchimento;
    
    const barra = '█'.repeat(preenchimento) + '░'.repeat(vazio);
    return `${barra} ${tierInfo.progresso}%`;
}
