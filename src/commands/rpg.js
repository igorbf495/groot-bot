// ================== RPG MODULE HUB ==================
// Este arquivo re-exporta todas as funções dos módulos RPG
// Importa de: rpg-combat, rpg-pvp, rpg-shop, rpg-quests

// ==================== COMBAT COMMANDS ====================
export { handleTutorial, handleAtributosInfo, handleCriarPJ, handlePerfil, handleStatus, handleCacar, handleBoss, handleListaBosses, handleMonstros, handleSkill } from './rpg-combat.js';

// ==================== PVP COMMANDS ====================
export { handleDuelo, handleRanking, handleRankingELO, handleRankingBoss, handleRoubar } from './rpg-pvp.js';

// ==================== SHOP COMMANDS ====================
export { handleLoja, handleComprar, handleVender, handleEquipar, handleInventario, handleUsar, handleCurar, handleGold, handleDaily, handleStats, handleUpgrade } from './rpg-shop.js';

// ==================== QUEST & ADMIN COMMANDS ====================
export { handleQuests, handleCompletarQuest, handleRankingJogador, handleDarOuro, handleDarXP, handleResetarPJ, menuRPG } from './rpg-quests.js';
