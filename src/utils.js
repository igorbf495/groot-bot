import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { execFile } from 'child_process';
import util from 'util';
import { Jimp } from 'jimp';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { CONFIG } from './config.js';

const execFilePromise = util.promisify(execFile);

// ==================== FUNÇÕES UTILITÁRIAS ====================

// Saudação baseada na hora do dia
export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '🌅 Bom dia';
    if (hour >= 12 && hour < 18) return '☀️ Boa tarde';
    return '🌙 Boa noite';
};

// Barra de progresso com gradiente visual
export const createBar = (pct) => {
    // Garantir que pct esta entre 0 e 100
    pct = Math.max(0, Math.min(100, pct));
    
    const total = 15;
    const filled = Math.max(0, Math.min(total, Math.round((pct / 100) * total)));
    const empty = Math.max(0, total - filled);

    let emoji;
    if (pct <= 25) emoji = '🟢';
    else if (pct <= 50) emoji = '🟡';
    else if (pct <= 75) emoji = '🟠';
    else emoji = '🔴';

    return `${emoji} ${'▓'.repeat(filled)}${'░'.repeat(empty)} ${pct}%`;
};

// Arquivo temporário aleatório
export const getRandomFile = (ext) =>
    path.join(CONFIG.TEMP_DIR, `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`);

// Deletar arquivos com segurança
export async function safeDelete(paths) {
    if (!Array.isArray(paths)) paths = [paths];
    await Promise.all(paths.map(p => fsp.unlink(p).catch(() => { })));
}

// Extrair mídia de mensagem quoted
export function getQuotedMedia(msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return null;
    const unwrap = (m) => {
        if (m.viewOnceMessage) return unwrap(m.viewOnceMessage.message);
        if (m.viewOnceMessageV2) return unwrap(m.viewOnceMessageV2.message);
        return m;
    };
    const content = unwrap(quoted);
    if (content.imageMessage) return { type: 'image', bufferMsg: { imageMessage: content.imageMessage } };
    if (content.videoMessage) return { type: 'video', bufferMsg: { videoMessage: content.videoMessage } };
    return null;
}

// Extrair texto da mensagem
export function getBody(msg) {
    const m = msg.message;
    if (!m) return '';
    if (m.conversation) return m.conversation;
    if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
    if (m.imageMessage?.caption) return m.imageMessage.caption;
    if (m.videoMessage?.caption) return m.videoMessage.caption;
    return '';
}

// Criar figurinha
export async function createSticker(mediaBuffer, isVideo, options) {
    const { pack, author, type } = options;
    if (isVideo) {
        const input = getRandomFile('mp4');
        const output = getRandomFile('webp');
        try {
            await fsp.writeFile(input, mediaBuffer);
            const scale = type === 'stretch' ? 'scale=512:512' : 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
            await execFilePromise('ffmpeg', ['-i', input, '-vf', `${scale},fps=10`, '-c:v', 'libwebp', '-loop', '0', '-ss', '00:00:00', '-t', '00:00:06', '-preset', 'default', '-an', '-vsync', '0', '-s', '512x512', output]);
            const webpBuffer = await fsp.readFile(output);
            const sticker = new Sticker(webpBuffer, { pack, author, type: StickerTypes.FULL, quality: 30 });
            await safeDelete([input, output]);
            return await sticker.build();
        } catch (e) {
            console.error('[STICKER VIDEO ERROR]', e.message);
            await safeDelete([input, output]);
            throw e;
        }
    } else {
        try {
            const image = await Jimp.read(mediaBuffer);
            if (type === 'stretch') {
                image.resize({ w: 512, h: 512 });
            } else {
                image.contain({ w: 512, h: 512 });
            }
            const buffer = await image.getBuffer('image/png');
            const sticker = new Sticker(buffer, { pack, author, type: StickerTypes.FULL, quality: 50 });
            return await sticker.build();
        } catch (e) {
            console.error('[STICKER IMAGE ERROR]', e.message);
            throw e;
        }
    }
}

// Obter informações de CPU
export function getCpuInfo() {
    const cpus = os.cpus();
    const model = cpus[0].model.trim();
    const cores = cpus.length;
    return { model, cores };
}

// Obter uso de CPU (aproximado)
export function getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;

    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    const usage = Math.round(100 - (100 * totalIdle / totalTick));
    return usage;
}
