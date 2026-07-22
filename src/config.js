import path from 'path';
import os from 'os';

// ==================== DETECÇÃO DO SISTEMA ====================
const IS_WINDOWS = process.platform === 'win32';
const BIN_EXT = IS_WINDOWS ? '.exe' : '';
const FFMPEG_DIR_FALLBACK = process.env.FFMPEG_DIR || (process.platform === 'darwin' ? '/opt/homebrew/bin' : '/usr/bin');

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
        : FFMPEG_DIR_FALLBACK,
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
        FILME: 'filme',
        ADD_FILME: 'addfilme',
        STATUS_FILME: 'statusfilme',
        CANCELAR_FILME: 'cancelarfilme',
        ADD_TORRENT: 'addtorrent',
        STATUS_TORRENT: 'statustorrent',
        CANCELAR_TORRENT: 'cancelartorrent',
        ASSISTIR: 'assistir',
        CATALOGO: 'catalogo',
        BUSCAR_FILME: 'buscarfilme',
        BUSCAR_SERIE: 'buscarserie',

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
    TEMP_DIR: path.join(os.tmpdir(), 'groot-bot-free'),
    MOVIES_DIR: path.resolve(process.env.MOVIES_DIR || path.join(process.cwd(), 'filmes')),
    MOVIE_PUBLIC_URL: (process.env.MOVIE_PUBLIC_URL || 'https://grootlab.xyz').replace(/\/$/, ''),
    MOVIE_SERVER_HOST: process.env.MOVIE_SERVER_HOST || '127.0.0.1',
    MOVIE_SERVER_PORT: Number(process.env.MOVIE_SERVER_PORT || 3000),
    MOVIE_LINK_HOURS: Number(process.env.MOVIE_LINK_HOURS || 6),
    MOVIE_MAX_GB: Number(process.env.MOVIE_MAX_GB || 15),
    TMDB_API_TOKEN: process.env.TMDB_API_TOKEN || ''
};

export default CONFIG;
