import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import axios from 'axios';
import instagramFn from 'instagram-url-direct';
const { instagramGetUrl } = instagramFn;
import { CONFIG } from '../config.js';
import { getRandomFile, safeDelete } from '../utils.js';
import { logger } from '../logger.js';

const execFilePromise = promisify(execFile);

// ==================== CONFIGURAÇÕES ====================

const PLATFORM_CONFIG = {
    'video': { emoji: '🎬', title: 'YouTube', maxSize: 200 },
    'tiktok': { emoji: '🎵', title: 'TikTok', maxSize: 150 },
    'insta': { emoji: '📸', title: 'Instagram', maxSize: 150 },
    'face': { emoji: '📘', title: 'Facebook', maxSize: 150 },
    'twitter': { emoji: '🐦', title: 'Twitter/X', maxSize: 150 }
};

/**
 * Download genérico de vídeo com suporte a múltiplas plataformas
 * @param {object} sock - Socket do Baileys
 * @param {object} msg - Mensagem original
 * @param {string} jid - ID do chat
 * @param {string} cmdArgs - Argumentos do comando (link ou busca)
 * @param {function} reply - Função para responder
 * @param {function} react - Função para reagir
 * @param {string} platform - Plataforma ('video', 'tiktok', 'insta', 'face', 'twitter')
 */
async function downloadVideo(sock, msg, jid, cmdArgs, reply, react, platform) {
    const config = PLATFORM_CONFIG[platform];
    if (!config) {
        logger.error('[DOWNLOAD]', `Plataforma desconhecida: ${platform}`);
        return reply('Plataforma inválida!');
    }

    if (!cmdArgs) {
        return reply(`╭──────────────╮\n│ ⚠️ *COMO USAR*    │\n├──────────────┤\n│ ${CONFIG.PREFIX}${platform} <link> │\n╰──────────────╯`);
    }

    // Validação básica de link (exceto YouTube que aceita busca)
    if (platform !== 'video' && !cmdArgs.includes('http')) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Link inválido!    │\n╰──────────────╯');
    }

    await react(config.emoji);
    await reply(`╭───────────────────────╮\n│ ${config.emoji} *BAIXANDO*      \n├───────────────────────┤\n│ ⏳ Aguarde...         \n╰───────────────────────╯`);

    let outputPath = getRandomFile('mp4');
    let videoTitle = 'Vídeo';

    try {
        logger.info('[DOWNLOAD]', `Iniciando download ${platform}`, { link: cmdArgs.substring(0, 50) });

        // Delegar para o handler específico
        if (platform === 'tiktok') {
            await downloadFromTikTok(cmdArgs, outputPath);
            videoTitle = 'TikTok Video';
        } else if (platform === 'insta') {
            await downloadFromInstagram(cmdArgs, outputPath);
            videoTitle = 'Instagram Video';
        } else if (platform === 'video') {
            videoTitle = await downloadWithYTDLP(cmdArgs, outputPath, platform, {
                allowSearch: true,
                maxSizeMB: config.maxSize
            });
        } else {
            // YouTube-DLP para Twitter, Facebook e outros
            videoTitle = await downloadWithYTDLP(cmdArgs, outputPath, platform);
        }

        // ==================== ENVIO DA MENSAGEM ====================
        await sendDownloadedVideo(sock, msg, jid, outputPath, videoTitle, config);

        await react('✅');
        logger.info('[DOWNLOAD]', `Download concluído: ${platform}`);

    } catch (error) {
        logger.error('[DOWNLOAD]', `Erro ao baixar ${platform}:`, error);

        // Cleanup
        await safeDelete(outputPath);
        await safeDelete(outputPath + '.mp4');
        await safeDelete(outputPath + '.mkv');

        await react('❌');
        await reply(`╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Falha ao baixar   │\n╰──────────────╯`);
    }
}

/**
 * Download do TikTok usando API dedicada
 */
async function downloadFromTikTok(link, outputPath) {
    logger.debug('[TIKTOK]', 'Usando API TikWM');
    
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(link)}`;
    const { data: res } = await axios.get(apiUrl);

    if (!res?.data?.play) {
        throw new Error('TikTok: API não retornou vídeo válido');
    }

    logger.debug('[TIKTOK]', 'Iniciando stream de download');
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url: res.data.play,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

/**
 * Download do Instagram usando library dedicada
 */
async function downloadFromInstagram(link, outputPath) {
    logger.debug('[INSTA]', 'Usando library instagram-url-direct');
    
    const results = await instagramGetUrl(link);
    if (!results?.url_list?.[0]) {
        throw new Error('Instagram: Não foi possível extrair link do vídeo');
    }

    const mediaUrl = results.url_list[0];
    logger.debug('[INSTA]', 'Iniciando stream de download');

    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url: mediaUrl,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

/**
 * Download usando yt-dlp (Twitter, Facebook, etc)
 */
async function downloadWithYTDLP(urlOrSearch, outputPath, platform, options = {}) {
    const ffmpegPath = CONFIG.FFMPEG_DIR;
    const cookiesPath = path.join(process.cwd(), 'cookies.txt');
    const hasCookies = fs.existsSync(cookiesPath);
    const allowSearch = !!options.allowSearch;
    const maxSizeMB = options.maxSizeMB || 200;
    const source = allowSearch && !urlOrSearch.includes('http')
        ? `ytsearch1:${urlOrSearch}`
        : urlOrSearch;

    let videoTitle = `${platform} Video`;

    // Tentar obter título
    try {
        const titleArgs = [source, '--get-title', '--no-warnings', '--no-playlist'];
        const { stdout } = await execFilePromise(CONFIG.YTDLP_PATH, titleArgs, { timeout: 15000 });
        videoTitle = stdout.trim() || videoTitle;
    } catch (e) {
        logger.warn('[YT-DLP]', `Erro ao obter título: ${e.message}`);
    }

    const baseArgs = [
        source,
        '-f', 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/mp4',
        '--merge-output-format', 'mp4',
        '-o', outputPath,
        '--no-playlist',
        '--max-filesize', `${maxSizeMB}M`,
        '--no-warnings',
        '--quiet',
        '--geo-bypass',
        '--ignore-config',
        '--add-header', 'User-Agent: Mozilla/5.0',
        '--add-header', 'Referer: https://www.youtube.com/',
        '--add-header', 'Accept-Language: en-US,en;q=0.9'
    ];

    if (ffmpegPath) {
        baseArgs.push('--ffmpeg-location', ffmpegPath);
    }

    if (hasCookies) {
        baseArgs.push('--cookies', cookiesPath);
    }

    const runYTDLP = async (args, tag = 'primario') => {
        logger.debug('[YT-DLP]', `Iniciando download (${tag}) para ${platform}`);
        await execFilePromise(CONFIG.YTDLP_PATH, args, { timeout: 180000 });
    };

    try {
        await runYTDLP(baseArgs);
    } catch (err) {
        const msg = err?.stderr || err?.message || '';
        const is403 = msg.includes('403');
        logger.warn('[YT-DLP]', `Falha primária (${msg.trim().slice(0,200)}). Tentando fallback.`);

        // Fallback: força IPv4, remove cookies e relaxa formato
        const fallbackArgs = baseArgs.filter(a => a !== '--cookies' && a !== cookiesPath);
        const formatIdx = fallbackArgs.indexOf('-f');
        if (formatIdx !== -1 && fallbackArgs[formatIdx + 1]) {
            fallbackArgs[formatIdx + 1] = 'bestvideo[ext=mp4][height<=720]+bestaudio/best';
        }

        fallbackArgs.push(
            '--force-ipv4',
            '--no-check-certificates'
        );

        try {
            await runYTDLP(fallbackArgs, 'fallback');
        } catch (err2) {
            // Propagar erro original se fallback também falhar
            throw is403 ? new Error('YT-DLP: HTTP 403 mesmo após fallback') : err2;
        }
    }

    return videoTitle;
}

/**
 * Enviar vídeo baixado como mensagem
 */
async function sendDownloadedVideo(sock, msg, jid, outputPath, videoTitle, config) {
    // Verificar arquivo final (yt-dlp pode renomear)
    let finalPath = outputPath;
    if (!fs.existsSync(outputPath)) {
        if (fs.existsSync(outputPath + '.mp4')) finalPath = outputPath + '.mp4';
        else if (fs.existsSync(outputPath + '.mkv')) finalPath = outputPath + '.mkv';
        else throw new Error('Arquivo não gerado');
    }

    // Verificar tamanho
    const stats = await fsp.stat(finalPath);
    const sizeInMB = stats.size / (1024 * 1024);
    logger.debug('[DOWNLOAD]', `Tamanho do arquivo: ${sizeInMB.toFixed(2)}MB`);

    // Se for muito grande, envia como documento
    if (sizeInMB > config.maxSize) {
        logger.debug('[DOWNLOAD]', `Enviando como documento (>${config.maxSize}MB)`);
        await sock.sendMessage(jid, {
            document: await fsp.readFile(finalPath),
            mimetype: 'video/mp4',
            fileName: `${config.title.toLowerCase()}_${Date.now()}.mp4`,
            caption: `📂 *${videoTitle}*`
        }, { quoted: msg });
    } else {
        // Envia como vídeo (player nativo)
        logger.debug('[DOWNLOAD]', 'Enviando como vídeo');
        await sock.sendMessage(jid, {
            video: await fsp.readFile(finalPath),
            caption: `🎬 *${videoTitle}*`,
            gifPlayback: false,
            mimetype: 'video/mp4'
        }, { quoted: msg });
    }

    await safeDelete(finalPath);
}

// ==================== HANDLERS DO COMANDO ====================

export async function handleVideo(sock, msg, jid, cmdArgs, reply, react) {
    await downloadVideo(sock, msg, jid, cmdArgs, reply, react, 'video');
}

export async function handleTikTok(sock, msg, jid, cmdArgs, reply, react) {
    await downloadVideo(sock, msg, jid, cmdArgs, reply, react, 'tiktok');
}

export async function handleInsta(sock, msg, jid, cmdArgs, reply, react) {
    await downloadVideo(sock, msg, jid, cmdArgs, reply, react, 'insta');
}

export async function handleFace(sock, msg, jid, cmdArgs, reply, react) {
    await downloadVideo(sock, msg, jid, cmdArgs, reply, react, 'face');
}

export async function handleTwitter(sock, msg, jid, cmdArgs, reply, react) {
    await downloadVideo(sock, msg, jid, cmdArgs, reply, react, 'twitter');
}

// ==================== MENU ====================

export function menuDownloads(reply) {
    const menu = `
╭───────────────────────╮
│    ⬇️ *DOWNLOADS*        
├───────────────────────┤
│
│ 🎬 *${CONFIG.PREFIX}video* <busca ou link>
│   └ Procura no YouTube
│   └ MP4 (até 200MB)
│
│ 🎵 *${CONFIG.PREFIX}tiktok* <link>
│   └ TikTok sem marca
│
│ 📸 *${CONFIG.PREFIX}insta* <link>
│   └ Instagram Reels
│
│ 🐦 *${CONFIG.PREFIX}twitter* <link>
│   └ Twitter / X
│
│ 📘 *${CONFIG.PREFIX}face* <link>
│   └ Facebook Vídeo
│
╰───────────────────────╯`;
    return reply(menu);
}
