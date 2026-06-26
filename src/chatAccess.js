import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCESS_FILE = path.join(DATA_DIR, 'allowed-chats.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function loadAccessData() {
    try {
        ensureDataDir();
        if (!fs.existsSync(ACCESS_FILE)) {
            return { chats: {} };
        }

        const data = JSON.parse(fs.readFileSync(ACCESS_FILE, 'utf-8'));
        if (Array.isArray(data.allowedChats)) {
            const chats = {};
            for (const jid of data.allowedChats) {
                chats[jid] = { mode: 'all', commands: [] };
            }
            return { chats };
        }

        return {
            chats: data.chats && typeof data.chats === 'object' ? data.chats : {}
        };
    } catch (error) {
        console.error('[CHAT ACCESS] Erro ao carregar lista:', error.message);
        return { chats: {} };
    }
}

function saveAccessData(data) {
    ensureDataDir();
    fs.writeFileSync(ACCESS_FILE, JSON.stringify(data, null, 2));
}

export function isChatAllowed(jid) {
    const data = loadAccessData();
    return !!data.chats[jid];
}

export function isCommandAllowed(jid, command) {
    const data = loadAccessData();
    const chat = data.chats[jid];
    if (!chat) return false;
    if (chat.mode === 'all') return true;
    return Array.isArray(chat.commands) && chat.commands.includes(command);
}

export function allowChat(jid, commands = null) {
    const data = loadAccessData();
    data.chats[jid] = Array.isArray(commands)
        ? { mode: 'custom', commands: [...new Set(commands)] }
        : { mode: 'all', commands: [] };
    saveAccessData(data);
    return data.chats[jid];
}

export function addAllowedCommands(jid, commands) {
    const data = loadAccessData();
    const current = data.chats[jid] || { mode: 'custom', commands: [] };
    if (current.mode === 'all') {
        return current;
    }

    current.mode = 'custom';
    current.commands = [...new Set([...(current.commands || []), ...commands])];
    data.chats[jid] = current;
    saveAccessData(data);
    return current;
}

export function removeAllowedCommands(jid, commands) {
    const data = loadAccessData();
    const current = data.chats[jid];
    if (!current) return null;
    if (current.mode === 'all') {
        current.mode = 'custom';
        current.commands = [];
    } else {
        current.commands = (current.commands || []).filter(command => !commands.includes(command));
    }

    data.chats[jid] = current;
    saveAccessData(data);
    return current;
}

export function blockChat(jid) {
    const data = loadAccessData();
    delete data.chats[jid];
    saveAccessData(data);

    return data.chats;
}

export function listAllowedChats() {
    const data = loadAccessData();
    return Object.entries(data.chats).map(([jid, access]) => ({ jid, ...access }));
}

export function getChatAccess(jid) {
    return loadAccessData().chats[jid] || null;
}
