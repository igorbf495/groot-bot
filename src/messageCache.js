// ==================== CACHE DE MENSAGENS ====================
// Armazena mensagens recentes para revelar deletadas
// Com TTL (Time To Live) para auto-limpeza

import { logger } from './logger.js';

const messageCache = new Map();

// Limite de mensagens armazenadas por chat
const MAX_MESSAGES_PER_CHAT = 200;

// TTL em millisegundos (24 horas)
const MESSAGE_TTL = 24 * 60 * 60 * 1000;

/**
 * Adicionar mensagem ao cache com TTL
 * @param {string} jid - ID do chat
 * @param {object} key - Chave da mensagem (contém .id)
 * @param {string} text - Texto da mensagem
 * @param {string} sender - Sender ID
 * @param {number} timestamp - Timestamp
 */
export function cacheMessage(jid, key, text, sender, timestamp) {
    if (!text || !jid) return;
    
    // Inicializar cache do chat se não existir
    if (!messageCache.has(jid)) {
        messageCache.set(jid, []);
    }
    
    const chatMessages = messageCache.get(jid);
    
    // Adicionar mensagem com timestamp de salvamento
    const message = {
        key: key.id,
        text,
        sender,
        timestamp,
        savedAt: Date.now(),
        expiresAt: Date.now() + MESSAGE_TTL
    };
    
    chatMessages.push(message);
    
    // Limpar mensagens expiradas
    cleanExpiredMessages(jid);
    
    // Manter limite
    if (chatMessages.length > MAX_MESSAGES_PER_CHAT) {
        chatMessages.shift();
    }
}

/**
 * Obter mensagem deletada do cache
 * @param {string} jid - ID do chat
 * @param {string} messageKey - ID da mensagem
 * @returns {object|null} Mensagem ou null
 */
export function getDeletedMessage(jid, messageKey) {
    const chatMessages = messageCache.get(jid);
    
    if (!chatMessages) return null;
    
    // Buscar a mensagem pelo ID
    const message = chatMessages.find(m => m.key === messageKey);
    
    if (!message) return null;
    
    // Verificar se expirou
    if (message.expiresAt && Date.now() > message.expiresAt) {
        logger.debug('[CACHE]', 'Mensagem expirou', { messageKey });
        removerMensagem(jid, messageKey);
        return null;
    }
    
    return message;
}

/**
 * Remover mensagem específica do cache
 * @param {string} jid - ID do chat
 * @param {string} messageKey - ID da mensagem
 */
function removerMensagem(jid, messageKey) {
    const chatMessages = messageCache.get(jid);
    if (!chatMessages) return;
    
    const index = chatMessages.findIndex(m => m.key === messageKey);
    if (index !== -1) {
        chatMessages.splice(index, 1);
    }
}

/**
 * Limpar mensagens expiradas de um chat
 * @param {string} jid - ID do chat
 */
function cleanExpiredMessages(jid) {
    const chatMessages = messageCache.get(jid);
    if (!chatMessages) return;
    
    const now = Date.now();
    const before = chatMessages.length;
    
    messageCache.set(jid, chatMessages.filter(m => !m.expiresAt || m.expiresAt > now));
    
    const after = messageCache.get(jid).length;
    if (before !== after) {
        logger.debug('[CACHE]', `Limpeza de ${before - after} mensagens expiradas`, { jid });
    }
}

/**
 * Limpar todo o cache de um chat
 * @param {string} jid - ID do chat
 */
export function clearCache(jid) {
    if (messageCache.has(jid)) {
        const count = messageCache.get(jid).length;
        messageCache.delete(jid);
        logger.debug('[CACHE]', `Cache limpo: ${count} mensagens removidas`, { jid });
    }
}

/**
 * Limpar TODO o cache de todos os chats
 */
export function clearAllCache() {
    const total = Array.from(messageCache.values()).reduce((sum, msgs) => sum + msgs.length, 0);
    messageCache.clear();
    logger.info('[CACHE]', `Cache global limpo: ${total} mensagens removidas`);
}

/**
 * Obter tamanho total do cache
 * @returns {number} Total de mensagens em cache
 */
export function getCacheSize() {
    let total = 0;
    messageCache.forEach(msgs => total += msgs.length);
    return total;
}

/**
 * Obter estatísticas do cache
 * @returns {object} Stats: total, chats, avgPerChat, memoryUsage
 */
export function getCacheStats() {
    let total = 0;
    let chats = messageCache.size;
    
    messageCache.forEach(msgs => total += msgs.length);
    
    const avgPerChat = chats > 0 ? Math.round(total / chats) : 0;
    
    // Estimativa muito aproximada de uso de memória
    const memoryUsage = Math.round((total * 500) / 1024 / 1024); // ~500 bytes por mensagem
    
    return {
        total,
        chats,
        avgPerChat,
        memoryUsage: `${memoryUsage}MB (estimado)`,
        ttl: `${Math.round(MESSAGE_TTL / 1000 / 60 / 60)} horas`
    };
}

/**
 * Limpar cache periodicamente (a cada 6 horas)
 */
setInterval(() => {
    logger.debug('[CACHE]', 'Executando limpeza periódica de cache');
    
    let totalRemoved = 0;
    messageCache.forEach((msgs, jid) => {
        const before = msgs.length;
        cleanExpiredMessages(jid);
        const after = messageCache.get(jid).length;
        totalRemoved += before - after;
    });
    
    if (totalRemoved > 0) {
        logger.info('[CACHE]', `Limpeza periódica: ${totalRemoved} mensagens removidas`);
    }
}, 6 * 60 * 60 * 1000);

export default {
    cacheMessage,
    getDeletedMessage,
    clearCache,
    clearAllCache,
    getCacheSize,
    getCacheStats
};
