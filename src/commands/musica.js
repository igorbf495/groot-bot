import { execFile } from 'child_process';
import util from 'util';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config.js';
import { getRandomFile, safeDelete } from '../utils.js';

const execFilePromise = util.promisify(execFile);

// ==================== COMANDOS DE MÚSICA ====================

export async function handlePlay(sock, msg, jid, cmdArgs, reply, react) {
    if (!cmdArgs) {
        return reply('╭──────────────╮\n│ ⚠️ *COMO USAR*    │\n├──────────────┤\n│ !play nome música │\n│ ou                │\n│ !play link youtube│\n╰──────────────╯');
    }

    // Verificar se yt-dlp existe (no Linux verifica se está no PATH)
    const IS_WINDOWS = process.platform === 'win32';
    if (IS_WINDOWS && !fs.existsSync(CONFIG.YTDLP_PATH)) {
        return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ yt-dlp não        │\n│ encontrado!       │\n╰──────────────╯');
    }

    await react('🎵');

    let outputPath = null;

    try {
        let searchQuery = cmdArgs;

        // Se não for URL, adicionar ytsearch:
        if (!cmdArgs.includes('youtube.com') && !cmdArgs.includes('youtu.be')) {
            searchQuery = `ytsearch:${cmdArgs}`;
        }

        await reply('╭──────────────╮\n│ 🔍 *BUSCANDO*     │\n├──────────────┤\n│ ' + cmdArgs.substring(0, 18) + '...    │\n╰──────────────╯');

        outputPath = getRandomFile('mp3');

        // Baixar áudio com yt-dlp
        const ffmpegPath = CONFIG.FFMPEG_DIR;
        const cookiesPath = path.join(process.cwd(), 'cookies.txt');

        const args = [
            searchQuery,

            '-x',                           // Extrair áudio mp3 disso
            '--audio-format', 'mp3',        // Formato MP3
            '--audio-quality', '0',         // Melhor qualidade (VBR)
            '--postprocessor-args', '-threads 0', // Usar todos os núcleos
            '-o', outputPath,               // Arquivo de saída
            '--no-playlist',                // Não baixar playlist
            '--max-filesize', '50M',        // Limite maior
            '--no-warnings',
            '--quiet'
        ];

        if (ffmpegPath) {
            args.push('--ffmpeg-location', ffmpegPath);
        }

        // Se tiver cookies.txt, usa
        if (fs.existsSync(cookiesPath)) {
            args.push('--cookies', cookiesPath);
        } else {
            // Sem cookies, usar truques para tentar bypass (VPS)
            args.push('--extractor-args', 'youtube:player_client=web_creator,mweb');
            args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        }



        await reply(`╭───────────────────────╮
│ 🎵 *BAIXANDO* 🎵
├───────────────────────┤
│
│ ⏳ Aguarde...
│
╰───────────────────────╯`);

        try {
            await execFilePromise(CONFIG.YTDLP_PATH, args, { timeout: 120000 });
        } catch (originalError) {
            // Se falhou e ESTAVA usando cookies, tenta de novo SEM cookies e com truques
            if (fs.existsSync(cookiesPath) && args.includes(cookiesPath)) {
                console.log('⚠️ Falha com cookies. Tentando fallback SEM cookies...');

                // Recriar argumentos limpos para o fallback
                const fallbackArgs = [
                    searchQuery,
                    '-x', // Extrair áudio
                    '--audio-format', 'mp3',
                    '--audio-quality', '0',
                    '--postprocessor-args', '-threads 0',
                    '-o', outputPath,
                    '--no-playlist',
                    '--max-filesize', '50M',
                    '--no-warnings',
                    '--quiet',
                    // Adicionar truques de bypass
                    '--extractor-args', 'youtube:player_client=web_creator,mweb',
                    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ];

                if (ffmpegPath) {
                    fallbackArgs.push('--ffmpeg-location', ffmpegPath);
                }

                await execFilePromise(CONFIG.YTDLP_PATH, fallbackArgs, { timeout: 120000 });
            } else {
                throw originalError; // Se já estava sem cookies, joga o erro
            }
        }

        // Verificar se arquivo foi criado (yt-dlp adiciona extensão)
        let finalPath = outputPath;
        if (!fs.existsSync(outputPath)) {
            // Tentar com .mp3 adicionado
            if (fs.existsSync(outputPath + '.mp3')) {
                finalPath = outputPath + '.mp3';
            } else {
                return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Falha ao baixar!  │\n╰──────────────╯');
            }
        }

        // Verificar tamanho
        const stats = await fsp.stat(finalPath);

        // Se for muito pequeno, é erro
        if (stats.size < 1000) {
            await safeDelete(finalPath);
            return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Arquivo vazio!    │\n╰──────────────╯');
        }

        // Obter título do vídeo
        let title = 'Música';
        try {
            const { stdout } = await execFilePromise(CONFIG.YTDLP_PATH, [searchQuery, '--get-title', '--no-warnings'], { timeout: 10000 });
            title = stdout.trim().replace(/[<>:"/\\|?*]/g, ''); // Remover caracteres inválidos
        } catch { }

        // Enviar áudio
        const audioBuffer = await fsp.readFile(finalPath);

        // Se for maior que 60MB (limite seguro para audio), envia como documento
        // O WhatsApp suporta documentos de até 2GB
        if (stats.size > 60 * 1024 * 1024) {
            await sock.sendMessage(jid, {
                document: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                caption: '📂 Arquivo grande enviado como documento'
            }, { quoted: msg });
        } else {
            // Tenta enviar como áudio normal
            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${title}.mp3`
            }, { quoted: msg });
        }

        await safeDelete(finalPath);
        await react('✅');

    } catch (e) {
        console.error('Erro play:', e);

        // Garantir limpeza em caso de erro
        // Garantir limpeza em caso de erro
        if (outputPath && fs.existsSync(outputPath)) await safeDelete(outputPath);
        if (outputPath && fs.existsSync(outputPath + '.mp3')) await safeDelete(outputPath + '.mp3');

        await react('❌');
        let errorMsg = 'Erro ao baixar.';
        if (e.message?.includes('timeout')) {
            errorMsg = 'Timeout!';
        } else if (e.message?.includes('unavailable')) {
            errorMsg = 'Indisponível';
        } else if (e.message?.includes('Sign in') || e.message?.includes('confirm your age')) {
            errorMsg = 'Restrição de idade\n│ (Vídeo bloqueado)';
        }
        await reply(`╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ ${errorMsg}       │\n╰──────────────╯`);
    }
}

export function menuMusica(reply) {
    const menu = `
╭───────────────────────╮
│    🎵 *MÚSICA*           
├───────────────────────┤
│
│ 🎧 *${CONFIG.PREFIX}play* <música>
│   └ Baixa do YouTube
│
│ 🎶 *${CONFIG.PREFIX}musica* <música>
│   └ Atalho para !play
│
│ 🔊 *${CONFIG.PREFIX}audio* <nome>
│   └ Efeitos do MyInstants
│
│ 🎬 *${CONFIG.PREFIX}filme* [nome]
│   └ Lista ou abre um filme da VPS
│
│ ▶️ *${CONFIG.PREFIX}assistir filme* ID
│ ▶️ *${CONFIG.PREFIX}assistir serie* ID TEMP EP
│   └ Player do provedor licenciado
│
│ 📚 *${CONFIG.PREFIX}catalogo* filmes|series [página]
│ 🔎 *${CONFIG.PREFIX}buscarfilme* nome
│ 🔎 *${CONFIG.PREFIX}buscarserie* nome
│
│ ⬇️ *${CONFIG.PREFIX}addfilme* URL | Nome
│ 📊 *${CONFIG.PREFIX}statusfilme*
│ 🛑 *${CONFIG.PREFIX}cancelarfilme*
│   └ Apenas o dono do bot
│
│ 🧲 *${CONFIG.PREFIX}addtorrent* MAGNET | Nome
│ 📊 *${CONFIG.PREFIX}statustorrent*
│ 🛑 *${CONFIG.PREFIX}cancelartorrent*
│   └ Torrents autorizados/domínio público
│
╰───────────────────────╯`;
    return reply(menu);
}
