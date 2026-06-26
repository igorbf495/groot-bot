import {
    default as makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    isJidGroup
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import Pino from 'pino';
import fs from 'fs';

// ==================== IMPORTS DOS MODULOS ====================
import { CONFIG } from './src/config.js';
import { getBody } from './src/utils.js';
import { allowChat, blockChat, isChatAllowed, listAllowedChats } from './src/chatAccess.js';

// Comandos
import { handleSticker, handleTTP, handleVV, menuMidia } from './src/commands/midia.js';
import { handleGayFeio, handlePica, handleBomDia, handleMoeda, handleXingar, handleCasal, handleSorteio, handleMeme, handleConselho, handleChance, handleTop5, menuDiversao } from './src/commands/diversao.js';
import { handleBanPromover, handleMarcar, handleRoletaRussa, handleAdd, menuAdmin } from './src/commands/admin.js';
import { handleStatus, handleMenu, handleHelp, menuSistema } from './src/commands/sistema.js';
import { handlePlay, menuMusica } from './src/commands/musica.js';
import { handleAudio } from './src/commands/audio.js';
import { handleVideo, handleTikTok, handleInsta, handleFace, handleTwitter, menuDownloads } from './src/commands/downloads.js';
import { 
    handleTutorial, handleCriarPJ, handlePerfil, handleStatus as handleRPGStatus, handleCacar, handleBoss, handleListaBosses, handleMonstros, handleSkill,
    handleDuelo, handleLoja, handleComprar, handleVender, handleEquipar, handleInventario, 
    handleUsar, handleCurar, handleGold, handleDaily, handleRanking, handleRankingELO, handleRankingBoss, handleRoubar,
    handleDarOuro, handleDarXP, handleResetarPJ, handleQuests, handleCompletarQuest, handleRankingJogador, menuRPG, handleUpgrade, handleStats 
} from './src/commands/rpg.js';

const logger = Pino({ level: 'silent' });
const CHAT_ACCESS_COMMANDS = new Set([
    CONFIG.CMDS.ATIVAR_BOT,
    CONFIG.CMDS.DESATIVAR_BOT,
    CONFIG.CMDS.CHATS_BOT,
    CONFIG.CMDS.CHAT_ID
]);

// Helper para timeout em promises
const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), ms)
        )
    ]);
};

const startBot = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_session');
        const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
            generateHighQualityLinkPreview: true,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000, // Keep-alive para evitar queda
            defaultQueryTimeoutMs: 60000, // Timeout maior para queries
            retryRequestDelayMs: 250, // Retry rapido
            browser: ['LimaBot', 'Chrome', '13.0.0'], // Mudar user agent para Chrome
            getMessage: async (key) => { return { conversation: 'hello' } } // Fallback para mensagens antigas
        });

        // Limpar pasta temporária ao iniciar para evitar acúmulo de lixo
        if (fs.existsSync(CONFIG.TEMP_DIR)) {
            fs.rmSync(CONFIG.TEMP_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(CONFIG.TEMP_DIR, { recursive: true });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                console.clear();
                console.log('✨ LIMA BOT - V13.0 MODULAR ✨');
                qrcode.generate(qr, { small: true });
            }
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) setTimeout(startBot, 3000);
                else process.exit(1);
            }
            if (connection === 'open') console.log(`✅ Conectado: ${sock.user.id.split(':')[0]}`);
        });

        sock.ev.on('creds.update', saveCreds);

        // ==================== ROUTER DE COMANDOS ====================
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            try {
                if (type !== 'notify') return;

                // Processar mensagens em paralelo para não bloquear a fila
                await Promise.allSettled(messages.map(async (msg) => {
                    return withTimeout(
                        (async () => {
                let command = null;
                try {
                    if (!msg.message) return;
                    if (msg.key.remoteJid === 'status@broadcast') return;

                    const text = getBody(msg);
                    if (!text || !text.trim().startsWith(CONFIG.PREFIX)) return;

                    const jid = msg.key.remoteJid;
                    const isGroup = isJidGroup(jid);
                    const sender = isGroup ? (msg.key.participant || msg.participant) : jid;
                    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

                    const args = text.slice(CONFIG.PREFIX.length).trim().split(/\s+/);
                    command = args.shift().toLowerCase();
                    const cmdArgs = args.join(' ');
                    
                    console.log(`[COMANDO] ${command}`);

                    const reply = (txt) => sock.sendMessage(jid, { text: txt }, { quoted: msg });
                    const react = (emoji) => sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });
                    const senderNum = sender.split('@')[0];
                    const donoNum = CONFIG.DONO_BOT.split('@')[0];
                    const isOwner = senderNum === donoNum;

                    if (!isChatAllowed(jid) && !CHAT_ACCESS_COMMANDS.has(command)) {
                        console.log(`[BLOQUEADO] Chat nao autorizado: ${jid}`);
                        return;
                    }

                    let isAdmin = false;
                    let isBotAdmin = true; // Assumir que é admin, API vai falhar se não for
                    let groupMetadata;
                    if (isGroup) {
                        groupMetadata = await sock.groupMetadata(jid);
                        const participant = groupMetadata.participants.find(p => p.id === sender);
                        isAdmin = !!(participant?.admin || participant?.superAdmin);

                        // Nota: Em grupos com LID, não conseguimos verificar se o bot é admin
                        // A API vai retornar erro se tentarmos executar ação sem permissão
                    }

                    // ==================== ROUTER ====================
                    console.log(`[COMANDO] ${command} de ${sender}`);
                    switch (command) {
                        // 🔐 CONTROLE DE CHATS
                        case CONFIG.CMDS.ATIVAR_BOT:
                            if (!isOwner && !(isGroup && isAdmin)) {
                                return reply('Apenas o dono do bot ou admin do grupo pode ativar este chat.');
                            }
                            allowChat(jid);
                            await react('✅');
                            await reply(`✅ Bot ativado neste chat.\n\nID: ${jid}`);
                            break;
                        case CONFIG.CMDS.DESATIVAR_BOT:
                            if (!isOwner && !(isGroup && isAdmin)) {
                                return reply('Apenas o dono do bot ou admin do grupo pode desativar este chat.');
                            }
                            blockChat(jid);
                            await react('🔒');
                            await reply(`🔒 Bot desativado neste chat.\n\nID: ${jid}`);
                            break;
                        case CONFIG.CMDS.CHATS_BOT:
                            if (!isOwner) return reply('Apenas o dono do bot pode listar chats.');
                            {
                                const chats = listAllowedChats();
                                const lista = chats.length
                                    ? chats.map((chat, i) => `${i + 1}. ${chat}`).join('\n')
                                    : 'Nenhum chat liberado.';
                                await react('📜');
                                await reply(`📜 *CHATS LIBERADOS*\n\n${lista}`);
                            }
                            break;
                        case CONFIG.CMDS.CHAT_ID:
                            if (!isOwner && !(isGroup && isAdmin)) {
                                return reply('Apenas o dono do bot ou admin do grupo pode ver o ID deste chat.');
                            }
                            await react('🆔');
                            await reply(`🆔 *ID deste chat:*\n${jid}`);
                            break;

                        // 📚 SUBMENUS
                        case CONFIG.CMDS.MENU_DOWNLOADS:
                            await menuDownloads(reply);
                            break;
                        case CONFIG.CMDS.MENU_MIDIA:
                            await react('🎨');
                            await menuMidia(reply);
                            break;
                        case CONFIG.CMDS.MENU_DIVERSAO:
                            await react('🎲');
                            await menuDiversao(reply);
                            break;
                        case CONFIG.CMDS.MENU_ADMIN:
                            await react('👮');
                            await menuAdmin(reply);
                            break;
                        case CONFIG.CMDS.MENU_SISTEMA:
                            await react('⚙️');
                            await menuSistema(reply);
                            break;
                        case CONFIG.CMDS.MENU_MUSICA:
                            await react('🎵');
                            await menuMusica(reply);
                            break;

                        // ⚙️ SISTEMA
                        case CONFIG.CMDS.STATUS:
                            await handleStatus(reply, react);
                            break;
                        case CONFIG.CMDS.MENU:
                            await handleMenu(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.HELP:
                            await handleHelp(reply, react);
                            break;

                        // 🎨 MÍDIA
                        case CONFIG.CMDS.STICKER:
                        case CONFIG.CMDS.STICKER_FULL:
                            await handleSticker(sock, msg, jid, command, logger, reply, react);
                            break;
                        case CONFIG.CMDS.TTP:
                            await handleTTP(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.VV:
                        case CONFIG.CMDS.WW:
                            await handleVV(sock, msg, jid, sender, command, logger, reply, react);
                            break;

                        // 🎵 MÚSICA
                        case CONFIG.CMDS.PLAY:
                            await handlePlay(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.AUDIO:
                            await handleAudio(sock, msg, jid, cmdArgs, reply, react);
                            break;

                        // ⬇️ DOWNLOADS
                        case CONFIG.CMDS.VIDEO:
                            await handleVideo(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.TIKTOK:
                            await handleTikTok(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.INSTA:
                            await handleInsta(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.FACE:
                            await handleFace(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.TWITTER:
                            await handleTwitter(sock, msg, jid, cmdArgs, reply, react);
                            break;

                        // 🎲 DIVERSÃO
                        case CONFIG.CMDS.GAY:
                        case CONFIG.CMDS.FEIO:
                            await react(command === CONFIG.CMDS.GAY ? '🏳️‍🌈' : '👹');
                            await handleGayFeio(command, reply);
                            break;
                        case CONFIG.CMDS.PICA:
                            await react('🍌');
                            await handlePica(reply);
                            break;
                        case CONFIG.CMDS.BOMDIA:
                            await react('🌅');
                            await handleBomDia(sock, msg, jid, isGroup, groupMetadata, reply);
                            break;
                        case CONFIG.CMDS.MOEDA:
                            await react('🪙');
                            await handleMoeda(reply);
                            break;
                        case CONFIG.CMDS.CASAL:
                            await react('💑');
                            await handleCasal(sock, msg, jid, isGroup, groupMetadata, reply);
                            break;
                        case CONFIG.CMDS.SORTEIO:
                            await react('🎰');
                            await handleSorteio(sock, msg, jid, isGroup, groupMetadata, reply);
                            break;
                        case CONFIG.CMDS.XINGAR:
                            await react('💣');
                            await handleXingar(sock, jid, msg, groupMetadata, reply);
                            break;
                        case CONFIG.CMDS.MEME:
                            await handleMeme(sock, msg, jid, reply, react);
                            break;
                        case CONFIG.CMDS.CONSELHO:
                            await handleConselho(reply, react);
                            break;
                        case CONFIG.CMDS.CHANCE:
                            await handleChance(cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.TOP5:
                            await handleTop5(sock, msg, jid, isGroup, groupMetadata, cmdArgs, reply, react);
                            break;

                        // 👮 ADMIN
                        case CONFIG.CMDS.ADD:
                            await handleAdd(sock, msg, jid, cmdArgs, isGroup, isAdmin, isBotAdmin, reply);
                            break;
                        case CONFIG.CMDS.BAN:
                        case CONFIG.CMDS.PROMOVER:
                        case CONFIG.CMDS.REBAIXAR:
                            await handleBanPromover(sock, msg, jid, sender, botNumber, cmdArgs, command, isGroup, isAdmin, isBotAdmin, reply);
                            break;
                        case CONFIG.CMDS.MARCAR:
                            await handleMarcar(sock, msg, jid, cmdArgs, isGroup, isAdmin, groupMetadata, reply);
                            break;
                        case CONFIG.CMDS.ROLETARUSSA:
                            await handleRoletaRussa(sock, msg, jid, botNumber, isGroup, isAdmin, isBotAdmin, groupMetadata, reply, react);
                            break;

                        // ⚔️ RPG
                        case CONFIG.CMDS.MENU_RPG:
                            await react('⚔️');
                            await menuRPG(reply);
                            break;
                        case CONFIG.CMDS.TUTORIAL:
                            await handleTutorial(sock, msg, jid, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.CRIARPJ:
                            await handleCriarPJ(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.PERFIL:
                            const mentionedPerfil = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                            await handlePerfil(sock, msg, jid, sender, mentionedPerfil, reply, react);
                            break;
                        case CONFIG.CMDS.RPG_STATUS:
                            await handleRPGStatus(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.CACAR:
                            await handleCacar(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.BOSS:
                            await handleBoss(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.BOSSES:
                            await handleListaBosses(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.MONSTROS:
                            await handleMonstros(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.SKILL:
                            await handleSkill(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.DUELO:
                            const mentionedDuelo = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                            await handleDuelo(sock, msg, jid, sender, mentionedDuelo, reply, react);
                            break;
                        case CONFIG.CMDS.LOJA:
                            await handleLoja(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.COMPRAR:
                            await handleComprar(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.VENDER:
                            await handleVender(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.EQUIPAR:
                            await handleEquipar(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.INVENTARIO:
                            await handleInventario(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.USAR:
                            await handleUsar(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.CURAR:
                            await handleCurar(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.GOLD:
                            await handleGold(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.DAILY:
                            await handleDaily(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.STATS:
                            await handleStats(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.UPGRADE:
                            await handleUpgrade(sock, msg, jid, sender, cmdArgs, reply, react);
                            break;
                        case CONFIG.CMDS.RANKING:
                            await handleRanking(sock, msg, jid, reply, react);
                            break;
                        case CONFIG.CMDS.RANKING_ELO:
                            await handleRankingELO(sock, msg, jid, reply, react);
                            break;
                        case CONFIG.CMDS.RANKING_BOSS:
                            await handleRankingBoss(sock, msg, jid, reply, react);
                            break;
                        case CONFIG.CMDS.QUESTS:
                            await handleQuests(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.COMPLETARQUEST:
                            await handleCompletarQuest(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.RANKING_JOGADOR:
                            await handleRankingJogador(sock, msg, jid, sender, reply, react);
                            break;
                        case CONFIG.CMDS.ROUBAR:
                            const mentionedRoubar = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                            await handleRoubar(sock, msg, jid, sender, mentionedRoubar, reply, react);
                            break;
                        case CONFIG.CMDS.DAROURO:
                            const mentionedOuro = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                            await handleDarOuro(sock, msg, jid, sender, mentionedOuro, cmdArgs, reply, react, botNumber);
                            break;
                        case CONFIG.CMDS.DARXP:
                            const mentionedXP = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                            await handleDarXP(sock, msg, jid, sender, mentionedXP, cmdArgs, reply, react, botNumber);
                            break;
                        case CONFIG.CMDS.RESETARPJ:
                            const mentionedReset = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                            await handleResetarPJ(sock, msg, jid, sender, mentionedReset, reply, react, botNumber);
                            break;
                    }
                    console.log(`[✓] ${command} processado com sucesso`);
                } catch (err) {
                    if (command) {
                        console.error(`[ERRO] Comando ${command}:`, err.message);
                    } else {
                        console.error('[ERRO] Processando mensagem:', err.message);
                    }
                    if (err.message !== 'Timeout') {
                        console.error(err.stack);
                    }
                }
                    })(), 
                    10000 // 10 segundos de timeout por mensagem
                );
            }));
            } catch (error) {
                console.error('[ERRO CRÍTICO messages.upsert]', error.message);
                console.error(error.stack);
            }
        });
    } catch (err) {
        console.error('[ERRO] Falha em startBot:', err);
        process.exit(1);
    }
}

process.on('uncaughtException', (err) => {
    console.error('[ERRO CRÍTICO] Exception não capturada:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
    console.error('[ERRO CRÍTICO] Promise rejection não tratado:', err.message);
    console.error(err.stack);
});

startBot().catch(err => {
    console.error('[ERRO] Falha ao iniciar bot:', err);
    process.exit(1);
});
