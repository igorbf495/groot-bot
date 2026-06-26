// ==================== MISSÕES/QUESTS ====================

export const QUESTS_DISPONIVEIS = {
    quest_matar_5_ratos: {
        id: 'matar_5_ratos',
        nome: 'Exterminador de Pragas',
        emoji: '🐭',
        descricao: 'Mate 5 ratos gigantes',
        objetivo: { tipo: 'matar', monstro: 'rato_gigante', quantidade: 5 },
        recompensa: { xp: 150, ouro: 100 },
        dificuldade: 'Fácil'
    },
    quest_matar_10_inimigos: {
        id: 'matar_10_inimigos',
        nome: 'Caçador Experiente',
        emoji: '⚔️',
        descricao: 'Vença 10 combates de qualquer tipo',
        objetivo: { tipo: 'vitorias', quantidade: 10 },
        recompensa: { xp: 300, ouro: 250 },
        dificuldade: 'Médio'
    },
    quest_ganhar_3_duelos: {
        id: 'ganhar_3_duelos',
        nome: 'Campeão dos Duelos',
        emoji: '🏆',
        descricao: 'Vença 3 duelos contra outros jogadores',
        objetivo: { tipo: 'duelos_vencidos', quantidade: 3 },
        recompensa: { xp: 250, ouro: 500, elo: 50 },
        dificuldade: 'Difícil'
    },
    quest_ganhar_10000_ouro: {
        id: 'ganhar_10000_ouro',
        nome: 'Gananciador',
        emoji: '💰',
        descricao: 'Acumule 10.000 de ouro',
        objetivo: { tipo: 'ouro_acumulado', quantidade: 10000 },
        recompensa: { xp: 200, ouro: 1000 },
        dificuldade: 'Médio'
    },
    quest_subir_5_levels: {
        id: 'subir_5_levels',
        nome: 'Aventureiro Dedicado',
        emoji: '⭐',
        descricao: 'Suba 5 níveis',
        objetivo: { tipo: 'levels_ganhos', quantidade: 5 },
        recompensa: { xp: 500, ouro: 750 },
        dificuldade: 'Muito Difícil'
    },
    quest_comprar_3_itens: {
        id: 'comprar_3_itens',
        nome: 'Colecionador',
        emoji: '🛍️',
        descricao: 'Compre 3 itens na loja',
        objetivo: { tipo: 'compras', quantidade: 3 },
        recompensa: { xp: 100, ouro: 500 },
        dificuldade: 'Fácil'
    },
    quest_matar_5_goblin: {
        id: 'matar_5_goblin',
        nome: 'Devorador de Goblins',
        emoji: '👹',
        descricao: 'Mate 5 goblins',
        objetivo: { tipo: 'matar', monstro: 'goblin', quantidade: 5 },
        recompensa: { xp: 200, ouro: 150 },
        dificuldade: 'Médio'
    },
    quest_fazer_1_critico: {
        id: 'fazer_1_critico',
        nome: 'Golpe Preciso',
        emoji: '🎯',
        descricao: 'Consiga 1 golpe crítico',
        objetivo: { tipo: 'criticos', quantidade: 1 },
        recompensa: { xp: 50, ouro: 100 },
        dificuldade: 'Fácil'
    },
    quest_sobreviver_30min: {
        id: 'sobreviver_30min',
        nome: 'Sobrevivente',
        emoji: '🛡️',
        descricao: 'Sobreviva 30 minutos sem morrer',
        objetivo: { tipo: 'tempo_vivo', minutos: 30 },
        recompensa: { xp: 300, ouro: 400 },
        dificuldade: 'Médio'
    },
    quest_roubar_500_ouro: {
        id: 'roubar_500_ouro',
        nome: 'Ladrão da Noite',
        emoji: '🗡️💰',
        descricao: 'Roube 500 de ouro de outros jogadores',
        objetivo: { tipo: 'ouro_roubado', quantidade: 500 },
        recompensa: { xp: 250, ouro: 200 },
        dificuldade: 'Difícil'
    }
};

/**
 * Funções para gerenciar quests
 */

export function obterQuestDoDia() {
    // Retorna uma quest aleatória (muda todo dia)
    const quest_ids = Object.keys(QUESTS_DISPONIVEIS);
    const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Muda a cada 24h
    const index = seed % quest_ids.length;
    return QUESTS_DISPONIVEIS[quest_ids[index]];
}

export function obterTodasAsQuests() {
    return Object.values(QUESTS_DISPONIVEIS);
}

export function resetarQuestsDoDia(player) {
    if (!player.quests) {
        player.quests = {};
    }
    
    // Reset de quests (limpa progresso anterior)
    const quest = obterQuestDoDia();
    player.quests.atual = {
        id: quest.id,
        nome: quest.nome,
        emoji: quest.emoji,
        descricao: quest.descricao,
        objetivo: { ...quest.objetivo },
        recompensa: { ...quest.recompensa },
        progresso: 0,
        completada: false,
        dataInicio: Date.now()
    };
    
    return player.quests.atual;
}

export function verificarProgressoQuest(player, tipo, valor = 1) {
    if (!player.quests?.atual) return false;
    
    const quest = player.quests.atual;
    
    // Verificar se o tipo de objetivo bate
    if (quest.objetivo.tipo === tipo) {
        quest.progresso = Math.min(quest.progresso + valor, quest.objetivo.quantidade);
        
        // Verificar se completou
        if (quest.progresso >= quest.objetivo.quantidade) {
            quest.completada = true;
            quest.dataCompletacao = Date.now();
            return true; // Quest completada!
        }
    }
    
    return false;
}

export function completarQuest(player) {
    if (!player.quests?.atual || !player.quests.atual.completada) {
        return null;
    }
    
    const quest = player.quests.atual;
    const recompensa = quest.recompensa;
    
    // Aplicar recompensas
    if (recompensa.xp) player.xp += recompensa.xp;
    if (recompensa.ouro) player.ouro += recompensa.ouro;
    if (recompensa.elo) player.elo = (player.elo || 1600) + recompensa.elo;
    
    // Registrar na história de quests completadas
    if (!player.questsCompletadas) {
        player.questsCompletadas = [];
    }
    player.questsCompletadas.push({
        id: quest.id,
        nome: quest.nome,
        completada: Date.now()
    });
    
    // Limpar quest atual
    const recompensaRetorno = { ...recompensa };
    player.quests.atual = null;
    
    return recompensaRetorno;
}

export function obterStatusQuest(player) {
    if (!player.quests?.atual) {
        return null;
    }
    
    const quest = player.quests.atual;
    const progresso = quest.progresso;
    const total = quest.objetivo.quantidade;
    const percentual = Math.round((progresso / total) * 100);
    
    return {
        nome: quest.nome,
        emoji: quest.emoji,
        descricao: quest.descricao,
        progresso,
        total,
        percentual,
        completada: quest.completada,
        recompensa: quest.recompensa
    };
}
