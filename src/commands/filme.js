import { CONFIG } from '../config.js';
import { createMovieLink, createProviderLink, findMovie } from '../movieServer.js';
import { cancelMovieImport, getMovieImportStatus, startMovieImport, startTorrentImport } from '../movieImporter.js';
import { getCatalogPage, searchCatalog } from '../catalogService.js';

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

export async function handleAssistir(cmdArgs, reply, react) {
    const args = (cmdArgs || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const type = args[0];
    const id = Number(args[1]);

    if (type === 'filme' && Number.isSafeInteger(id) && id > 0 && args.length === 2) {
        const link = createProviderLink({ type, id });
        await react('🎬');
        return reply(`🎬 *FILME ${id}*\n\n▶️ Assistir:\n${link}\n\n⏳ Link válido por ${CONFIG.MOVIE_LINK_HOURS} horas.`);
    }

    const season = Number(args[2]);
    const episode = Number(args[3]);
    if (type === 'serie' && [id, season, episode].every(value => Number.isSafeInteger(value) && value > 0) && args.length === 4) {
        const link = createProviderLink({ type, id, season, episode });
        await react('📺');
        return reply(`📺 *SÉRIE ${id} · T${season} E${episode}*\n\n▶️ Assistir:\n${link}\n\n⏳ Link válido por ${CONFIG.MOVIE_LINK_HOURS} horas.`);
    }

    return reply(`Uso:\n*${CONFIG.PREFIX}assistir filme ID_TMDB*\n*${CONFIG.PREFIX}assistir serie ID_TMDB TEMPORADA EPISÓDIO*`);
}

function formatCatalogItem(item, index) {
    const year = item.date?.slice(0, 4) || 's/ ano';
    return `${index + 1}. *${item.title}* (${year})\n   ID: ${item.id}`;
}

export async function handleCatalogo(cmdArgs, reply, react) {
    const [rawType = 'filmes', rawPage = '1'] = (cmdArgs || '').trim().toLowerCase().split(/\s+/);
    const type = rawType === 'serie' || rawType === 'series' ? 'series'
        : rawType === 'filme' || rawType === 'filmes' ? 'filmes' : null;
    const page = Number(rawPage);
    if (!type || !Number.isSafeInteger(page) || page < 1) {
        return reply(`Uso: *${CONFIG.PREFIX}catalogo filmes 1* ou *${CONFIG.PREFIX}catalogo series 1*`);
    }

    try {
        await react('📚');
        const result = await getCatalogPage(type, page);
        if (!result.items.length) return reply('ℹ️ Esta página não possui títulos.');
        const label = type === 'filmes' ? 'FILMES' : 'SÉRIES';
        const list = result.items.map(formatCatalogItem).join('\n\n');
        return reply(`📚 *CATÁLOGO DE ${label}*\nPágina ${result.page}/${result.totalPages}\n\n${list}\n\n▶️ Use *${CONFIG.PREFIX}assistir ${type === 'filmes' ? 'filme' : 'serie'} ID${type === 'series' ? ' TEMP EP' : ''}*`);
    } catch (error) {
        await react('❌');
        return reply(`❌ Catálogo indisponível: ${error.message}`);
    }
}

export async function handleBuscarCatalogo(type, cmdArgs, reply, react) {
    const query = (cmdArgs || '').trim();
    if (!query) return reply(`Uso: *${CONFIG.PREFIX}${type === 'filmes' ? 'buscarfilme' : 'buscarserie'} nome*`);

    try {
        await react('🔎');
        const items = await searchCatalog(type, query);
        if (!items.length) return reply(`❌ Não encontrei “${query}” no catálogo disponível.`);
        const list = items.map(formatCatalogItem).join('\n\n');
        return reply(`🔎 *RESULTADOS DISPONÍVEIS*\n\n${list}\n\n▶️ Use o ID no comando *${CONFIG.PREFIX}assistir*.`);
    } catch (error) {
        await react('❌');
        return reply(`❌ Busca indisponível: ${error.message}`);
    }
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

export async function handleAddTorrent(cmdArgs, isOwner, reply, react) {
    if (!isOwner) return reply('❌ Apenas o dono do bot pode gerenciar a biblioteca de filmes.');
    const separator = cmdArgs.indexOf('|');
    const magnet = (separator === -1 ? cmdArgs : cmdArgs.slice(0, separator)).trim();
    const title = (separator === -1 ? '' : cmdArgs.slice(separator + 1)).trim();

    if (!magnet || !title) {
        return reply(`Uso: *${CONFIG.PREFIX}addtorrent MAGNET | Nome do filme*`);
    }

    try {
        await startTorrentImport({ magnet, title, notify: reply });
        await react('🧲');
        return reply(`🧲 Torrent iniciado em segundo plano.\n\n🎬 ${title}\nUse *${CONFIG.PREFIX}statustorrent* para acompanhar.`);
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
