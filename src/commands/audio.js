import axios from 'axios';
import * as cheerio from 'cheerio';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config.js';
import { getRandomFile, safeDelete } from '../utils.js';

const execFilePromise = promisify(execFile);

// ==================== COMANDO DE EFEITOS SONOROS ====================

export async function handleAudio(sock, msg, jid, cmdArgs, reply, react) {
    if (!cmdArgs) {
        return reply(`╭──────────────╮\n│ ⚠️ *COMO USAR*    │\n├──────────────┤\n│ ${CONFIG.PREFIX}audio ratinho │\n│ ${CONFIG.PREFIX}audio gemidao │\n╰──────────────╯`);
    }

    await react('🔊');

    try {
        const query = encodeURIComponent(cmdArgs);
        const url = `https://www.myinstants.com/pt/search/?name=${query}`;

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Encontrar o primeiro botão de play.
        // O HTML do MyInstants varia, então usamos mais de um seletor/regex.
        let mp3Url = null;
        let title = '';

        // Procurar todos os botões e pegar o primeiro válido
        $('.instant').each((i, el) => {
            if (mp3Url) return; // Já achou

            const btn = $(el).find('.small-button, .instant-page-button, button, a');
            const link = $(el).find('.instant-link');

            if (btn.length) {
                const onclick = btn.attr('onclick');
                // Formato: play('/media/sounds/nome.mp3', 'loader', 'id')
                const match = onclick?.match(/play\(['\"]([^'\"]+)['\"]/);

                if (match && match[1]) {
                    console.log('[DEBUG] Audio encontrado:', match[1]);
                    mp3Url = match[1];
                    title = link.text() || cmdArgs;
                    return;
                }

                const href = btn.attr('href');
                if (href && href.includes('/media/sounds/')) {
                    mp3Url = href;
                    title = link.text() || cmdArgs;
                }
            }
        });

        // Fallback geral para layouts diferentes
        if (!mp3Url) {
            const fallback = $('a[href*="/media/sounds/"]').first();
            if (fallback.length) {
                mp3Url = fallback.attr('href');
                title = fallback.text()?.trim() || cmdArgs;
            }
        }

        if (!mp3Url) {
            return reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Som não           │\n│ encontrado!       │\n╰──────────────╯');
        }

        // Se a URL for relativa, adicionar domínio
        if (!mp3Url.startsWith('http')) {
            mp3Url = `https://www.myinstants.com${mp3Url}`;
        }

        await reply(`╭───────────────────────╮
│ 🔊 *ENVIANDO* 🔊
├───────────────────────┤
│
│ 🎧 ${title.substring(0, 25)}
│
╰───────────────────────╯`);

        // Baixar MP3 temporariamente
        const tempMp3 = getRandomFile('mp3');
        const tempOgg = getRandomFile('ogg');

        try {
            const writer = fs.createWriteStream(tempMp3);
            const response = await axios({
                url: mp3Url,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Converter para OGG Opus (compatível com WhatsApp PTT)
            const ffmpegPath = CONFIG.FFMPEG_PATH;

            // Flags para garantir compatibilidade máxima com Voice Note do WhatsApp
            const ffmpegArgs = [
                '-y',
                '-i', tempMp3,
                '-c:a', 'libopus',
                '-b:a', '64k', // Qualidade voz
                '-vbr', 'on',
                '-compression_level', '10',
                '-application', 'voip', // Otimizado para voz
                tempOgg
            ];

            await execFilePromise(ffmpegPath, ffmpegArgs);

            // Enviar PTT
            await sock.sendMessage(jid, {
                audio: await fs.promises.readFile(tempOgg),
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });

        } finally {
            // Limpar arquivos
            await safeDelete(tempMp3);
            await safeDelete(tempOgg);
        }

        await react('✅');

    } catch (e) {
        console.error('Erro audio:', e);
        await react('❌');
        await reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Falha ao buscar   │\n╰──────────────╯');
    }
}

export function menuAudio(reply) {
    const menu = `
╭───────────────────────╮
│    🔊 *EFEITOS*          
├───────────────────────┤
│
│ 📢 *${CONFIG.PREFIX}audio* <nome>
│   └ Busca sons de meme
│   └ ex: !audio ratinho
│
╰───────────────────────╯`;
    return reply(menu);
}
