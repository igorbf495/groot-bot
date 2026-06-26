import axios from 'axios';
import { CONFIG } from '../config.js';

function stripTags(text = '') {
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function handleWikiSearch(cmdArgs, reply, react) {
    const termo = cmdArgs?.trim();
    if (!termo) {
        return reply(`Use ${CONFIG.PREFIX}${CONFIG.CMDS.WIKI} <termo>`);
    }

    await react('🔎');

    try {
        const { data } = await axios.get('https://pt.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                list: 'search',
                format: 'json',
                utf8: 1,
                srsearch: termo,
                srlimit: 5,
                srprop: 'snippet'
            },
            timeout: 12000
        });

        const items = data?.query?.search || [];
        if (!items.length) return reply('Nenhum resultado encontrado na Wikipedia.');

        const linhas = items.map((item, idx) => {
            const title = item.title || 'Resultado';
            const snippet = stripTags(item.snippet || '').slice(0, 200);
            const link = `https://pt.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
            return `${idx + 1}. *${title}*
${link}
${snippet}`;
        });

        const msg = `🔎 *Wikipedia* — ${termo}\n\n${linhas.join('\n\n')}`;
        return reply(msg);
    } catch (err) {
        return reply(`Erro ao buscar: ${err?.response?.status || err.message}`);
    }
}

// Alias para compatibilidade com o comando antigo
export async function handleGoogleSearch(cmdArgs, reply, react) {
    return handleWikiSearch(cmdArgs, reply, react);
}
