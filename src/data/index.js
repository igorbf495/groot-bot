// ==================== INDEX: Re-exporta todos os módulos ====================
// Este arquivo centraliza as exportações de todo o sistema RPG

// Configuração
export { DATA_DIR, RPG_FILE } from './config.js';

// Narrações
export { NARRACOES, getNarracao } from './narracoes.js';

// Raças e Classes
export { RACAS, CLASSES } from './racas-classes.js';

// Monstros e Escalamento
export { MONSTROS, BOSSES, escalarMonstro, escalarBoss } from './monstros.js';

// Itens, Afixos e Raridades
export { AFFIXES, RARIDADES, LOJA_ITENS, gerarAlfixAleatorio, gerarRaridadeAleatoria, gerarItemComAffixes, formatarItem } from './itens.js';

// Rankings e Elos
export { TIERS_RANKING, obterTierELO, obterBarraELO } from './rankings.js';

// Quests
export { QUESTS_DISPONIVEIS, obterQuestDoDia, obterTodasAsQuests, resetarQuestsDoDia, verificarProgressoQuest, completarQuest, obterStatusQuest } from './quests.js';

// Funções Utilitárias
export { rolarDado, rolarD20, getModificador, xpParaLevel, calcularVantagemDuelo, calcularMudancaELO, getBadgeELO, getBossAleatorio, aplicarMecanicaBoss, getLootLendario } from './utils.js';

// Funções de Jogador
export { getPlayer, playerExists, deletarJogador, calcularHpMax, calcularCA, migrarPersonagem, calcularBonusAtaque, calcularDano, criarJogador, updatePlayer, adicionarXP, modificarOuro, modificarHP, adicionarItem, removerItem, equiparItem, setCooldown, verificarCooldown, incrementarStat, getRanking, getRankingELO, getMonstroAleatorio, distribuirPontoAtributo, obterPontosAtributos, inicializarLevelingItens, adicionarXPEquipados } from './players.js';
