import { downloadMediaMessage } from '@whiskeysockets/baileys';
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
