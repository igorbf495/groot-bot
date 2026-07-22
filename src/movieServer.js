import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import http from 'http';
import path from 'path';
import { CONFIG } from './config.js';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.m4v', '.mov', '.webm']);
const MIME_TYPES = {
    '.mp4': 'video/mp4',
    '.m4v': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm'
};
const tokenSecret = process.env.MOVIE_LINK_SECRET || crypto.randomBytes(32).toString('hex');

function normalizeSearch(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function movieTitle(relativePath) {
    return path.basename(relativePath, path.extname(relativePath)).replace(/[._-]+/g, ' ').trim();
}

async function walkMovies(directory, root = directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    const movies = [];

    for (const entry of entries) {
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            movies.push(...await walkMovies(absolutePath, root));
        } else if (entry.isFile() && VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            movies.push(path.relative(root, absolutePath));
        }
    }

    return movies;
}

export async function listMovies() {
    await fsp.mkdir(CONFIG.MOVIES_DIR, { recursive: true });
    return (await walkMovies(CONFIG.MOVIES_DIR)).sort((a, b) =>
        movieTitle(a).localeCompare(movieTitle(b), 'pt-BR')
    );
}

export async function findMovie(query) {
    const normalizedQuery = normalizeSearch(query.trim());
    const movies = await listMovies();
    if (!normalizedQuery) return { movies };

    const exact = movies.find(file => normalizeSearch(movieTitle(file)) === normalizedQuery);
    const partial = movies.find(file => normalizeSearch(movieTitle(file)).includes(normalizedQuery));
    return { movie: exact || partial, movies };
}

function sign(value) {
    return crypto.createHmac('sha256', tokenSecret).update(value).digest('base64url');
}

export function createMovieLink(relativePath) {
    const payload = Buffer.from(JSON.stringify({
        file: relativePath,
        exp: Date.now() + CONFIG.MOVIE_LINK_HOURS * 60 * 60 * 1000
    })).toString('base64url');
    const token = `${payload}.${sign(payload)}`;
    return `${CONFIG.MOVIE_PUBLIC_URL}/assistir/${token}`;
}

export function createProviderLink({ type, id, season, episode }) {
    const payload = Buffer.from(JSON.stringify({
        provider: 'pomfy', type, id, season, episode,
        exp: Date.now() + CONFIG.MOVIE_LINK_HOURS * 60 * 60 * 1000
    })).toString('base64url');
    const token = `${payload}.${sign(payload)}`;
    return `${CONFIG.MOVIE_PUBLIC_URL}/online/${token}`;
}

function verifyToken(token) {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) throw new Error('Link inválido');

    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
        throw new Error('Link inválido');
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) throw new Error('Link expirado');
    return data;
}

async function resolveMovie(token) {
    const data = verifyToken(token);
    if (!data.file) throw new Error('Link inválido');
    const root = await fsp.realpath(CONFIG.MOVIES_DIR);
    const target = await fsp.realpath(path.resolve(root, data.file));
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error('Arquivo inválido');
    if (!VIDEO_EXTENSIONS.has(path.extname(target).toLowerCase())) throw new Error('Formato inválido');
    return { target, title: movieTitle(data.file) };
}

function resolveProvider(token) {
    const data = verifyToken(token);
    if (data.provider !== 'pomfy' || !['filme', 'serie'].includes(data.type) || !Number.isSafeInteger(data.id) || data.id <= 0) {
        throw new Error('Link inválido');
    }
    if (data.type === 'serie' && (
        !Number.isSafeInteger(data.season) || data.season <= 0 ||
        !Number.isSafeInteger(data.episode) || data.episode <= 0
    )) throw new Error('Episódio inválido');

    const suffix = data.type === 'serie' ? `/${data.season}/${data.episode}` : '';
    return {
        embedUrl: `https://api.pomfy.stream/${data.type}/${data.id}${suffix}`,
        title: data.type === 'filme'
            ? `Filme ${data.id}`
            : `Série ${data.id} · T${data.season} E${data.episode}`
    };
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
}

function sendPlayer(res, token, title) {
    const safeTitle = escapeHtml(title);
    const safeToken = encodeURIComponent(token);
    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${safeTitle} | Groot Filmes</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#07110d;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:grid;place-items:center;padding:20px}.box{width:min(1100px,100%)}h1{font-size:clamp(20px,4vw,32px);margin:0 0 16px;color:#69f0ae}video{width:100%;max-height:78vh;background:#000;border-radius:14px;box-shadow:0 18px 50px #0008}.hint{color:#aab8b1;font-size:14px;margin-top:12px}</style></head>
<body><main class="box"><h1>🎬 ${safeTitle}</h1><video controls playsinline preload="metadata" src="/stream/${safeToken}"></video><p class="hint">Groot Filmes · Link temporário</p></main></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(html), 'Cache-Control': 'no-store' });
    res.end(html);
}

function sendProviderPlayer(res, embedUrl, title) {
    const safeTitle = escapeHtml(title);
    const safeUrl = escapeHtml(embedUrl);
    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="referrer" content="no-referrer"><title>${safeTitle} | Groot Filmes</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#07110d;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:grid;place-items:center;padding:14px}.box{width:min(1200px,100%)}h1{font-size:clamp(18px,4vw,28px);margin:0 0 12px;color:#69f0ae}.frame{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden;box-shadow:0 18px 50px #0008}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.hint{color:#aab8b1;font-size:13px;margin-top:10px}</style></head>
<body><main class="box"><h1>🎬 ${safeTitle}</h1><div class="frame"><iframe src="${safeUrl}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" allowfullscreen></iframe></div><p class="hint">Groot Filmes · Conteúdo fornecido por provedor licenciado · Link temporário</p></main></body></html>`;
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html),
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; frame-src https://api.pomfy.stream; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
    });
    res.end(html);
}

async function streamMovie(req, res, target) {
    const stats = await fsp.stat(target);
    const contentType = MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream';
    const commonHeaders = { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=3600' };
    const range = req.headers.range;

    if (!range) {
        res.writeHead(200, { ...commonHeaders, 'Content-Length': stats.size });
        if (req.method === 'HEAD') return res.end();
        return fs.createReadStream(target).pipe(res);
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return res.end();
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), stats.size - 1) : stats.size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= stats.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return res.end();
    }

    res.writeHead(206, {
        ...commonHeaders,
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': end - start + 1
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target, { start, end }).pipe(res);
}

async function requestHandler(req, res) {
    try {
        const url = new URL(req.url, 'http://localhost');
        const playerMatch = /^\/assistir\/([^/]+)$/.exec(url.pathname);
        const streamMatch = /^\/stream\/([^/]+)$/.exec(url.pathname);
        const onlineMatch = /^\/online\/([^/]+)$/.exec(url.pathname);

        if (playerMatch) {
            const token = decodeURIComponent(playerMatch[1]);
            const { title } = await resolveMovie(token);
            return sendPlayer(res, token, title);
        }
        if (streamMatch && (req.method === 'GET' || req.method === 'HEAD')) {
            const { target } = await resolveMovie(decodeURIComponent(streamMatch[1]));
            return streamMovie(req, res, target);
        }
        if (onlineMatch) {
            const { embedUrl, title } = resolveProvider(decodeURIComponent(onlineMatch[1]));
            return sendProviderPlayer(res, embedUrl, title);
        }
        if (url.pathname === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end('{"ok":true}');
        }

        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Página não encontrada');
    } catch (error) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(error.message === 'Link expirado' ? 'Este link expirou. Peça um novo link no WhatsApp.' : 'Link inválido ou filme indisponível.');
    }
}

let server;
export async function startMovieServer() {
    if (server) return server;
    await fsp.mkdir(CONFIG.MOVIES_DIR, { recursive: true });
    server = http.createServer((req, res) => void requestHandler(req, res));
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(CONFIG.MOVIE_SERVER_PORT, CONFIG.MOVIE_SERVER_HOST, resolve);
    });
    console.log(`[FILMES] Player em ${CONFIG.MOVIE_SERVER_HOST}:${CONFIG.MOVIE_SERVER_PORT}`);
    console.log(`[FILMES] Biblioteca: ${CONFIG.MOVIES_DIR}`);
    return server;
}
