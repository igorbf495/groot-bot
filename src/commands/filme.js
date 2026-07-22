import { CONFIG } from '../config.js';
import { createMovieLink, findMovie } from '../movieServer.js';
import { cancelMovieImport, getMovieImportStatus, startMovieImport } from '../movieImporter.js';

function titleFromFile(file) {
    const name = file.split(/[\\/]/).pop();
    return name.replace(/\.[^.]+$/, '').replace(/[._-]+/g, ' ').trim();
}

export async function handleFilme(cmdArgs, reply, react) {
    const query = (cmdArgs || '').trim();
    await react('🎬');

    const { movie, movies } = await findMovie(query);
    if (!query) {
        if (movies.length === 0) {
            return reply(`🎬 A biblioteca está vazia.\n\nAdicione arquivos MP4 em:\n${CONFIG.MOVIES_DIR}`);
        }
        const list = movies.slice(0, 20).map((file, index) => `${index + 1}. ${titleFromFile(file)}`).join('\n');
        const more = movies.length > 20 ? `\n\n...e mais ${movies.length - 20} filme(s).` : '';
        return reply(`🎬 *FILMES DISPONÍVEIS*\n\n${list}${more}\n\nUse: *${CONFIG.PREFIX}filme nome do filme*`);
    }

    if (!movie) {
        await react('❌');
        return reply(`❌ Não encontrei “${query}”.\n\nUse *${CONFIG.PREFIX}filme* para ver a lista.`);
    }

    const title = titleFromFile(movie);
    const link = createMovieLink(movie);
    await react('✅');
    return reply(`🎬 *${title}*\n\n▶️ Assistir:\n${link}\n\n⏳ Link válido por ${CONFIG.MOVIE_LINK_HOURS} horas.`);
}

export async function handleAddFilme(cmdArgs, isOwner, reply, react) {
    if (!isOwner) return reply('❌ Apenas o dono do bot pode gerenciar a biblioteca de filmes.');
    const separator = cmdArgs.indexOf('|');
    const url = (separator === -1 ? cmdArgs : cmdArgs.slice(0, separator)).trim();
    const title = (separator === -1 ? '' : cmdArgs.slice(separator + 1)).trim();

    if (!url || !title) {
        return reply(`Uso: *${CONFIG.PREFIX}addfilme URL_DIRETA | Nome do filme*`);
    }

    try {
        await startMovieImport({ url, title, notify: reply });
        await react('⬇️');
        return reply(`⬇️ Download iniciado em segundo plano.\n\n🎬 ${title}\nUse *${CONFIG.PREFIX}statusfilme* para acompanhar.`);
    } catch (error) {
        await react('❌');
        return reply(`❌ Não foi possível iniciar: ${error.message}`);
    }
}

export async function handleStatusFilme(isOwner, reply) {
    if (!isOwner) return reply('❌ Apenas o dono do bot pode gerenciar a biblioteca de filmes.');
    return reply(getMovieImportStatus());
}

export async function handleCancelarFilme(isOwner, reply, react) {
    if (!isOwner) return reply('❌ Apenas o dono do bot pode gerenciar a biblioteca de filmes.');
    if (!cancelMovieImport()) return reply('ℹ️ Não há importação em andamento.');
    await react('🛑');
    return reply('🛑 Cancelamento solicitado.');
}
