import axios from 'axios';
import { CONFIG } from './config.js';

const PAGE_SIZE = 10;
const POMFY_CACHE_MS = 10 * 60 * 1000;
const DETAILS_CACHE_MS = 24 * 60 * 60 * 1000;
const listCache = new Map();
const detailsCache = new Map();

function requireTmdbToken() {
    if (!CONFIG.TMDB_API_TOKEN) {
        throw new Error('configure TMDB_API_TOKEN na VPS e reinicie o bot com --update-env');
    }
}

function normalizeType(type) {
    if (type === 'filmes') return { pomfy: 'filmes', tmdb: 'movie' };
    if (type === 'series') return { pomfy: 'series', tmdb: 'tv' };
    throw new Error('tipo de catálogo inválido');
}

async function fetchPomfyIds(type) {
    const { pomfy } = normalizeType(type);
    const cached = listCache.get(pomfy);
    if (cached && Date.now() - cached.createdAt < POMFY_CACHE_MS) return cached.ids;

    const { data } = await axios.get('https://api.pomfy.stream/lista', {
        params: { tipo: pomfy }, timeout: 10000,
        headers: { Accept: 'application/json' }
    });
    if (!Array.isArray(data)) throw new Error('a Pomfy retornou uma listagem inválida');
    const ids = data.map(Number).filter(id => Number.isSafeInteger(id) && id > 0);
    listCache.set(pomfy, { ids, createdAt: Date.now() });
    return ids;
}

async function tmdbGet(endpoint, params = {}) {
    requireTmdbToken();
    const { data } = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
        params: { language: 'pt-BR', ...params }, timeout: 8000,
        headers: { Authorization: `Bearer ${CONFIG.TMDB_API_TOKEN}`, Accept: 'application/json' }
    });
    return data;
}

function mapTmdbItem(item, tmdbType) {
    return {
        id: item.id,
        title: tmdbType === 'movie' ? item.title : item.name,
        date: tmdbType === 'movie' ? item.release_date : item.first_air_date
    };
}

async function fetchDetails(type, id) {
    const { tmdb } = normalizeType(type);
    const cacheKey = `${tmdb}:${id}`;
    const cached = detailsCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < DETAILS_CACHE_MS) return cached.item;

    const data = await tmdbGet(`/${tmdb}/${id}`);
    const item = mapTmdbItem(data, tmdb);
    detailsCache.set(cacheKey, { item, createdAt: Date.now() });
    return item;
}

export async function getCatalogPage(type, page = 1) {
    requireTmdbToken();
    const ids = await fetchPomfyIds(type);
    const totalPages = Math.max(1, Math.ceil(ids.length / PAGE_SIZE));
    if (page > totalPages) return { items: [], page, totalPages };
    const pageIds = ids.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const settled = await Promise.allSettled(pageIds.map(id => fetchDetails(type, id)));
    const items = settled.map((result, index) =>
        result.status === 'fulfilled' ? result.value : { id: pageIds[index], title: `Título ${pageIds[index]}`, date: '' }
    );
    return { items, page, totalPages };
}

export async function searchCatalog(type, query) {
    requireTmdbToken();
    const { tmdb } = normalizeType(type);
    const [availableIds, firstPage, secondPage] = await Promise.all([
        fetchPomfyIds(type),
        tmdbGet(`/search/${tmdb}`, { query, include_adult: false, page: 1 }),
        tmdbGet(`/search/${tmdb}`, { query, include_adult: false, page: 2 })
    ]);
    const available = new Set(availableIds);
    return [...(firstPage.results || []), ...(secondPage.results || [])]
        .filter(item => available.has(item.id))
        .slice(0, 10)
        .map(item => mapTmdbItem(item, tmdb));
}
