import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { CONFIG } from '../config.js';
import { getQuotedMedia, createSticker } from '../utils.js';

// ==================== COMANDOS DE MÍDIA ====================

export async function handleSticker(sock, msg, jid, command, logger, reply, react) {
    await react('🎨');
    let mediaBuffer;
    let isVideo = false;
    const quotedData = getQuotedMedia(msg);
    const isDirect = !!msg.message.imageMessage || !!msg.message.videoMessage;

    try {
        if (quotedData) {
            isVideo = quotedData.type === 'video';
            mediaBuffer = await downloadMediaMessage({ key: msg.key, message: quotedData.bufferMsg }, 'buffer', {}, { logger });
        } else if (isDirect) {
            isVideo = !!msg.message.videoMessage;
            mediaBuffer = await downloadMediaMessage(msg, 'buffer', {}, { logger });
        } else {
            return reply('╭──────────────╮\n│ ⚠️ *ATENÇÃO*      │\n├──────────────┤\n│ Envie uma imagem │\n│ ou vídeo junto    │\n│ com o comando!    │\n╰──────────────╯');
        }

        const type = (command === CONFIG.CMDS.STICKER_FULL) ? 'stretch' : 'crop';
        const sticker = await createSticker(mediaBuffer, isVideo, { pack: CONFIG.PACK, author: CONFIG.AUTHOR, type });
        await sock.sendMessage(jid, { sticker }, { quoted: msg });
        await react('✅');
    } catch (e) {
        console.error('[STICKER ERROR]', e);
        await react('❌');
        await reply('╭──────────────╮\n│ ❌ *ERRO*          │\n├──────────────┤\n│ Não foi possível   │\n│ criar a figurinha. │\n│ Tente novamente!   │\n╰──────────────╯');
    }
}

export async function handleVV(sock, msg, jid, sender, command, logger, reply, react) {
    const q = getQuotedMedia(msg);
    if (!q) {
        return reply('╭──────────────╮\n│ ⚠️ *ATENÇÃO*      │\n├──────────────┤\n│ Responda uma      │\n│ visualização      │\n│ única!            │\n╰──────────────╯');
    }

    await react('👁️');
    try {
        const buffer = await downloadMediaMessage({ key: msg.key, message: q.bufferMsg }, 'buffer', {}, { logger });
        const caption = '╭──────────────╮\n│ 🔓 *REVELADO!*    │\n├──────────────┤\n│ Visualização      │\n│ única recuperada  │\n│ com sucesso!      │\n╰──────────────╯';
        const content = q.type === 'image' ? { image: buffer, caption } : { video: buffer, caption };

        if (command === CONFIG.CMDS.VV) {
            await sock.sendMessage(sender, content);
        } else {
            await sock.sendMessage(jid, content, { quoted: msg });
        }
        await react('✅');
    } catch (e) {
        await react('❌');
        await reply('╭──────────────╮\n│ ❌ *ERRO*         │\n├──────────────┤\n│ Não foi possível  │\n│ recuperar a mídia │\n╰──────────────╯');
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function wrapText(text, maxChars = 16, maxLines = 7) {
    const words = text.trim().split(/\s+/);
    const lines = [];
    let current = '';

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length <= maxChars) {
            current = next;
            continue;
        }

        if (current) lines.push(current);
        current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
        if (lines.length >= maxLines - 1) break;
    }

    if (current && lines.length < maxLines) lines.push(current);
    return lines.slice(0, maxLines);
}

export async function handleTTP(sock, msg, jid, cmdArgs, reply, react) {
    const texto = cmdArgs.trim();
    if (!texto) {
        return reply(`╭──────────────╮\n│ ⚠️ *COMO USAR*    │\n├──────────────┤\n│ ${CONFIG.PREFIX}ttp seu texto │\n╰──────────────╯`);
    }

    await react('✍️');

    try {
        const textoLimitado = texto.slice(0, 120);
        const linhas = wrapText(textoLimitado);
        const fontSize = linhas.length <= 2 ? 70 : linhas.length <= 4 ? 56 : 44;
        const yStart = 256 - ((linhas.length - 1) * fontSize * 0.58);
        const colors = [
            ['#111827', '#facc15'],
            ['#0f172a', '#38bdf8'],
            ['#18181b', '#fb7185'],
            ['#14532d', '#86efac'],
            ['#312e81', '#c4b5fd']
        ];
        const [bg, accent] = colors[Math.floor(Math.random() * colors.length)];
        const textSvg = linhas.map((linha, i) => {
            const y = yStart + (i * fontSize * 1.08);
            return `<text x="256" y="${y}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(linha)}</text>`;
        }).join('');

        const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
<rect width="512" height="512" rx="86" fill="${bg}"/>
<circle cx="78" cy="76" r="30" fill="${accent}" opacity="0.95"/>
<circle cx="438" cy="430" r="38" fill="${accent}" opacity="0.75"/>
<path d="M84 412 C160 470 344 470 428 108" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity="0.35"/>
<g font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff" stroke="#000000" stroke-width="8" paint-order="stroke" letter-spacing="0">
${textSvg}
</g>
</svg>`;

        const sticker = await new Sticker(svg, {
            pack: CONFIG.PACK,
            author: CONFIG.AUTHOR,
            type: StickerTypes.FULL,
            quality: 90
        }).build();

        await sock.sendMessage(jid, { sticker }, { quoted: msg });
        await react('✅');
    } catch (e) {
        console.error('[TTP ERROR]', e);
        await react('❌');
        return reply('❌ Não consegui criar a figurinha de texto. Tente uma frase menor.');
    }
}

export function menuMidia(reply) {
    const menu = `
╭───────────────────────╮
│    🎨 *MÍDIA*
├───────────────────────┤
│
│ 📸 *${CONFIG.PREFIX}fig*
│   └ Criar figurinha
│   └ Envie imagem/vídeo
│
│ 🖼️ *${CONFIG.PREFIX}figfull*
│   └ Figurinha esticada
│   └ Preenche 512x512
│
│ ✍️ *${CONFIG.PREFIX}ttp* texto
│   └ Transforma texto
│   └ em figurinha
│
│ 👁️ *${CONFIG.PREFIX}vv*
│   └ Revelar vizu única
│   └ Envia no seu PV
│
│ 👀 *${CONFIG.PREFIX}ww*
│   └ Revelar vizu única
│   └ Envia no grupo
│
╰───────────────────────╯`;
    return reply(menu);
}
