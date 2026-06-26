// ==================== LOGGER CENTRALIZADO ====================
// Sistema de logging com níveis estruturados para debug, info, warn, error

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// Determinar nível de log pelo NODE_ENV
const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// Cores para terminal (ANSI)
const COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m'
};

/**
 * Formata timestamp no formato HH:MM:SS
 */
function getTimestamp() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

/**
 * Logger com suporte a 4 níveis: DEBUG, INFO, WARN, ERROR
 * Exemplo de uso:
 * logger.debug('[RPG]', 'Jogador criado');
 * logger.info('[COMBATE]', 'Boss derrotado');
 * logger.warn('[DOWNLOAD]', 'Falha em retry');
 * logger.error('[RPG]', 'Erro ao salvar dados');
 */
export const logger = {
    /**
     * Log de DEBUG (apenas em desenvolvimento)
     * @param {string} context - Contexto/módulo (ex: '[RPG]', '[COMBATE]')
     * @param {string} message - Mensagem
     * @param {any} [data] - Dados adicionais (opcional)
     */
    debug: (context, message, data) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
            const time = getTimestamp();
            const prefix = `${COLORS.DIM}[${time}] ${COLORS.CYAN}${context}${COLORS.RESET}`;
            console.log(`${prefix} 🐛 ${message}`, data ? data : '');
        }
    },

    /**
     * Log de INFO (operações normais)
     * @param {string} context - Contexto/módulo
     * @param {string} message - Mensagem
     * @param {any} [data] - Dados adicionais (opcional)
     */
    info: (context, message, data) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
            const time = getTimestamp();
            const prefix = `${COLORS.BRIGHT}[${time}] ${COLORS.GREEN}${context}${COLORS.RESET}`;
            console.log(`${prefix} ℹ️  ${message}`, data ? data : '');
        }
    },

    /**
     * Log de WARN (avisos/cuidado)
     * @param {string} context - Contexto/módulo
     * @param {string} message - Mensagem
     * @param {any} [data] - Dados adicionais (opcional)
     */
    warn: (context, message, data) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
            const time = getTimestamp();
            const prefix = `${COLORS.BRIGHT}[${time}] ${COLORS.YELLOW}${context}${COLORS.RESET}`;
            console.log(`${prefix} ⚠️  ${message}`, data ? data : '');
        }
    },

    /**
     * Log de ERROR (erros/exceções)
     * @param {string} context - Contexto/módulo
     * @param {string} message - Mensagem
     * @param {Error|any} [error] - Erro (opcional)
     */
    error: (context, message, error) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
            const time = getTimestamp();
            const prefix = `${COLORS.BRIGHT}[${time}] ${COLORS.RED}${context}${COLORS.RESET}`;
            console.error(`${prefix} ❌ ${message}`);
            if (error) {
                if (error instanceof Error) {
                    console.error(`${COLORS.RED}   Stack: ${error.stack}${COLORS.RESET}`);
                } else {
                    console.error(`${COLORS.RED}   Detalhes: ${JSON.stringify(error, null, 2)}${COLORS.RESET}`);
                }
            }
        }
    },

    /**
     * Obter nível de log atual
     */
    getLevel: () => CURRENT_LEVEL,

    /**
     * Obter nome do nível de log
     */
    getLevelName: () => {
        for (const [key, value] of Object.entries(LOG_LEVELS)) {
            if (value === CURRENT_LEVEL) return key;
        }
        return 'UNKNOWN';
    }
};

export default logger;
