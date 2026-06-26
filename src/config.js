import path from 'path';
import os from 'os';

// ==================== DETECÇÃO DO SISTEMA ====================
const IS_WINDOWS = process.platform === 'win32';
const BIN_EXT = IS_WINDOWS ? '.exe' : '';

// ==================== CONFIGURAÇÕES ====================
export const CONFIG = {
    PREFIX: '!',
    DONO_BOT: '557799105385@s.whatsapp.net', // Numero do dono do bot
    
    // Caminhos dos binários (detecta Windows/Linux automaticamente)
    YTDLP_PATH: IS_WINDOWS 
        ? path.join(process.cwd(), 'bin', `yt-dlp${BIN_EXT}`)
        : 'yt-dlp',  // No Linux usa do PATH do sistema
    FFMPEG_PATH: IS_WINDOWS 
        ? path.join(process.cwd(), 'bin', `ffmpeg${BIN_EXT}`)
        : 'ffmpeg',  // No Linux usa do PATH do sistema
    FFMPEG_DIR: IS_WINDOWS 
        ? path.join(process.cwd(), 'bin')
        : '/usr/bin',
    CMDS: {
        // 🎨 Mídia
        STICKER: 'fig',
        STICKER_FULL: 'figfull',
        TTP: 'ttp',
        VV: 'vv',
        WW: 'ww',

        // 🎲 Diversão
        GAY: 'gay',
        FEIO: 'feio',
        PICA: 'pica',
        BOMDIA: 'bomdia',
        MOEDA: 'moeda',
        CASAL: 'casal',
        SORTEIO: 'sorteio',
        XINGAR: 'xingar',
        MEME: 'meme',
        CONSELHO: 'conselho',
        CHANCE: 'chance',
        TOP5: 'top5',

        // 👮 Admin
        BAN: 'ban',
        ADD: 'add',
        LIGAR: 'ligar',
        PROMOVER: 'promover',
        REBAIXAR: 'rebaixar',
        MARCAR: 'marcar',
        ROLETARUSSA: 'roletarussa',

        // ⚙️ Sistema
        MENU: 'menu',
        STATUS: 'status',
        HELP: 'help',
        ATIVAR_BOT: 'ativarbot',
        DESATIVAR_BOT: 'desativarbot',
        LIBERAR_CMD: 'liberarcmd',
        BLOQUEAR_CMD: 'bloquearcmd',
        CHATS_BOT: 'chatsbot',
        CHAT_ID: 'chatid',

        // 🎵 Música / Áudio
        PLAY: 'play',
        AUDIO: 'audio',

        // ⬇️ Downloads
        VIDEO: 'video',
        TIKTOK: 'tiktok',
        INSTA: 'insta',
        FACE: 'face',
        TWITTER: 'twitter',
        GOOGLE: 'google',
        WIKI: 'wiki',

        // 📚 Submenus
        MENU_MIDIA: 'midia',
        MENU_DOWNLOADS: 'downloads',
        MENU_DIVERSAO: 'diversao',
        MENU_ADMIN: 'admin',
        MENU_SISTEMA: 'sistema',
        MENU_MUSICA: 'musica',
        MENU_RPG: 'rpg',

        // ⚔️ RPG
        TUTORIAL: 'tutorial',
        CRIARPJ: 'criarpj',
        PERFIL: 'perfil',
        FICHA: 'ficha',
        RPG_STATUS: 'atributos',
        CACAR: 'cacar',
        BOSS: 'boss',
        BOSSES: 'bosses',
        MONSTROS: 'monstros',
        SKILL: 'skill',
        DUELO: 'duelo',
        LOJA: 'loja',
        COMPRAR: 'comprar',
        VENDER: 'vender',
        EQUIPAR: 'equipar',
        INVENTARIO: 'inventario',
        USAR: 'usar',
        CURAR: 'curar',
        DAILY: 'daily',
        GOLD: 'gold',
        ATRIBUTOS_INFO: 'atributosinfo',
        RANKING: 'ranking',
        RANKING_ELO: 'rankingelo',
        RANKING_BOSS: 'rankingboss',
        ROUBAR: 'roubar',
        DAROURO: 'darouro',
        DARXP: 'darxp',
        RESETARPJ: 'resetarpj',
        QUESTS: 'quests',
        COMPLETARQUEST: 'completarquest',
        RANKING_JOGADOR: 'meuperfil',
        STATS: 'stats',
        UPGRADE: 'upar'
    },
    PACK: 'groot',
    AUTHOR: 'groot-bot',
    TEMP_DIR: path.join(os.tmpdir(), 'groot-bot-free')
};

export default CONFIG;
