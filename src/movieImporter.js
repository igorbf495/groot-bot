import { execFile, spawn } from 'child_process';
import dns from 'dns/promises';
import fs from 'fs';
import fsp from 'fs/promises';
import net from 'net';
import path from 'path';
import { promisify } from 'util';
import { CONFIG } from './config.js';

const execFilePromise = promisify(execFile);
let activeJob = null;
const TORRENT_VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.mov', '.m4v', '.webm', '.avi']);

async function safeDelete(file) {
    if (!file) return;
    try {
        await fsp.unlink(file);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error(`[FILMES] Falha ao remover ${file}:`, error.message);
    }
}

async function safeRemoveDirectory(directory) {
    if (!directory) return;
    try {
        await fsp.rm(directory, { recursive: true, force: true });
    } catch (error) {
        console.error(`[FILMES] Falha ao limpar ${directory}:`, error.message);
    }
}

async function safeNotify(job, message) {
    try {
        await job.notify(message);
    } catch (error) {
        console.error('[FILMES] Falha ao enviar atualização no WhatsApp:', error.message);
    }
}

function safeTitle(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 _.-]/g, '')
        .replace(/[._ ]+/g, ' ')
        .trim()
        .slice(0, 120);
}

function isPrivateAddress(address) {
    if (net.isIPv4(address)) {
        const [a, b] = address.split('.').map(Number);
        return a === 10 || a === 127 || a === 0 ||
            (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) || a >= 224;
    }
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') ||
        normalized.startsWith('fd') || normalized.startsWith('fe8') ||
        normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb');
}

async function validatePublicUrl(rawUrl) {
    let url;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error('URL inválida');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('Use uma URL HTTP/HTTPS pública e sem credenciais');
    }
    const addresses = await dns.lookup(url.hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
        throw new Error('Endereço privado ou bloqueado');
    }
    return url.href;
}

function waitForChild(child) {
    return new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', code => code === 0 ? resolve() : reject(new Error(`processo encerrou com código ${code}`)));
    });
}

async function probeVideo(file) {
    const { stdout } = await execFilePromise('ffprobe', [
        '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,pix_fmt', '-of', 'json', file
    ], { timeout: 30000 });
    const streams = JSON.parse(stdout).streams || [];
    return {
        video: streams.find(stream => stream.codec_type === 'video'),
        audio: streams.find(stream => stream.codec_type === 'audio')
    };
}

async function prepareMovie(job) {
    const codecs = await probeVideo(job.downloadPath);
    if (!codecs.video) throw new Error('o arquivo baixado não contém vídeo');
    job.phase = 'preparando MP4';

    const compatible = codecs.video.codec_name === 'h264' &&
        ['yuv420p', 'yuvj420p'].includes(codecs.video.pix_fmt) &&
        (!codecs.audio || codecs.audio.codec_name === 'aac');
    const args = compatible
        ? ['-y', '-i', job.downloadPath, '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy', '-movflags', '+faststart', job.finalPath]
        : [
            '-y', '-i', job.downloadPath, '-map', '0:v:0', '-map', '0:a:0?',
            '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-preset', 'veryfast',
            '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
            '-ar', '48000', '-movflags', '+faststart', job.finalPath
        ];

    job.child = spawn(CONFIG.FFMPEG_PATH, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    job.child.stderr.on('data', chunk => {
        const time = chunk.toString().match(/time=(\S+)/)?.[1];
        if (time) job.detail = `posição ${time}`;
    });
    await waitForChild(job.child);
}

async function findLargestTorrentVideo(directory) {
    const candidates = [];
    async function walk(current) {
        for (const entry of await fsp.readdir(current, { withFileTypes: true })) {
            const target = path.join(current, entry.name);
            if (entry.isDirectory()) await walk(target);
            else if (entry.isFile() && TORRENT_VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
                const stats = await fsp.stat(target);
                candidates.push({ target, size: stats.size });
            }
        }
    }
    await walk(directory);
    candidates.sort((a, b) => b.size - a.size);
    return candidates[0];
}

async function runImport(job) {
    try {
        await fsp.mkdir(CONFIG.MOVIES_DIR, { recursive: true });
        job.phase = 'baixando';
        const commonArgs = [
            '--no-conf=true', '--allow-overwrite=true', '--auto-file-renaming=false',
            '--file-allocation=none', '--continue=true', '--max-tries=5', '--retry-wait=3',
            '--connect-timeout=15', '--timeout=60', '--summary-interval=5',
            '--show-console-readout=true', '--console-log-level=notice'
        ];
        const sourceArgs = job.type === 'torrent'
            ? [
                '--seed-time=0', '--bt-enable-lpd=false', '--bt-save-metadata=false',
                '--follow-torrent=mem', '--check-integrity=true', '--dir', job.tempDir, job.url
            ]
            : [
                '--max-connection-per-server=8', '--split=8', '--min-split-size=5M',
                '--dir', CONFIG.TEMP_DIR, '--out', path.basename(job.downloadPath), job.url
            ];
        job.child = spawn('aria2c', [...commonArgs, ...sourceArgs], { stdio: ['ignore', 'pipe', 'pipe'] });

        const captureProgress = chunk => {
            const lines = chunk.toString().split(/[\r\n]+/).filter(Boolean);
            const progress = lines.reverse().find(line => line.includes('DL:') || line.includes('%'));
            if (progress) job.detail = progress.trim().slice(0, 180);
        };
        job.child.stdout.on('data', captureProgress);
        job.child.stderr.on('data', captureProgress);
        await waitForChild(job.child);
        if (job.cancelled) throw new Error('importação cancelada');

        if (job.type === 'torrent') {
            job.phase = 'selecionando vídeo';
            const selected = await findLargestTorrentVideo(job.tempDir);
            if (!selected) throw new Error('o torrent não contém um arquivo de vídeo compatível');
            job.downloadPath = selected.target;
        }

        const stats = await fsp.stat(job.downloadPath);
        if (stats.size < 1024 * 1024) throw new Error('arquivo menor que 1 MB');
        if (stats.size > CONFIG.MOVIE_MAX_GB * 1024 ** 3) throw new Error(`arquivo maior que ${CONFIG.MOVIE_MAX_GB} GB`);
        await prepareMovie(job);
        if (job.cancelled) throw new Error('importação cancelada');
        job.phase = 'concluído';
        await safeNotify(job, `✅ *FILME ADICIONADO*\n\n🎬 ${job.title}\nUse *${CONFIG.PREFIX}filme ${job.title}* para assistir.`);
    } catch (error) {
        job.phase = job.cancelled ? 'cancelado' : 'falhou';
        job.error = job.cancelled ? null : error.message;
        await safeDelete(job.finalPath);
        if (!job.cancelled) await safeNotify(job, `❌ Falha ao importar *${job.title}*: ${error.message}`);
    } finally {
        if (job.type === 'torrent') await safeRemoveDirectory(job.tempDir);
        else {
            await safeDelete(job.downloadPath);
            await safeDelete(`${job.downloadPath}.aria2`);
        }
        job.child = null;
        job.finishedAt = Date.now();
    }
}

export async function startMovieImport({ url, title, notify }) {
    if (activeJob && !activeJob.finishedAt) throw new Error('já existe uma importação em andamento');
    const cleanTitle = safeTitle(title);
    if (!cleanTitle) throw new Error('nome do filme inválido');
    const publicUrl = await validatePublicUrl(url);
    await fsp.mkdir(CONFIG.TEMP_DIR, { recursive: true });
    await fsp.mkdir(CONFIG.MOVIES_DIR, { recursive: true });

    const finalPath = path.join(CONFIG.MOVIES_DIR, `${cleanTitle}.mp4`);
    if (fs.existsSync(finalPath)) throw new Error('já existe um filme com esse nome');
    const downloadPath = path.join(CONFIG.TEMP_DIR, `movie-${Date.now()}-${process.pid}.source`);
    activeJob = { type: 'direct', title: cleanTitle, url: publicUrl, notify, finalPath, downloadPath, phase: 'iniciando', detail: '', child: null, cancelled: false, startedAt: Date.now(), finishedAt: null, error: null };
    void runImport(activeJob);
    return activeJob;
}

export async function startTorrentImport({ magnet, title, notify }) {
    if (activeJob && !activeJob.finishedAt) throw new Error('já existe uma importação em andamento');
    if (!/^magnet:\?xt=urn:btih:[a-zA-Z0-9]+(?:&|$)/i.test(magnet)) throw new Error('link magnet inválido');
    const cleanTitle = safeTitle(title);
    if (!cleanTitle) throw new Error('nome do filme inválido');
    await fsp.mkdir(CONFIG.TEMP_DIR, { recursive: true });
    await fsp.mkdir(CONFIG.MOVIES_DIR, { recursive: true });

    const finalPath = path.join(CONFIG.MOVIES_DIR, `${cleanTitle}.mp4`);
    if (fs.existsSync(finalPath)) throw new Error('já existe um filme com esse nome');
    const tempDir = await fsp.mkdtemp(path.join(CONFIG.TEMP_DIR, 'torrent-'));
    activeJob = { type: 'torrent', title: cleanTitle, url: magnet, notify, finalPath, downloadPath: null, tempDir, phase: 'buscando metadados', detail: '', child: null, cancelled: false, startedAt: Date.now(), finishedAt: null, error: null };
    void runImport(activeJob);
    return activeJob;
}

export function getMovieImportStatus() {
    if (!activeJob) return 'ℹ️ Nenhuma importação foi iniciada.';
    const elapsed = Math.max(1, Math.floor(((activeJob.finishedAt || Date.now()) - activeJob.startedAt) / 60000));
    const detail = activeJob.detail ? `\n📊 ${activeJob.detail}` : '';
    const error = activeJob.error ? `\n❌ ${activeJob.error}` : '';
    return `🎬 *${activeJob.title}*\n⚙️ Status: ${activeJob.phase}\n⏱️ Tempo: ${elapsed} min${detail}${error}`;
}

export function cancelMovieImport() {
    if (!activeJob || activeJob.finishedAt) return false;
    activeJob.cancelled = true;
    activeJob.phase = 'cancelando';
    activeJob.child?.kill('SIGTERM');
    return true;
}
