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
            return { allowedChats: [] };
        }

        const data = JSON.parse(fs.readFileSync(ACCESS_FILE, 'utf-8'));
        return {
            allowedChats: Array.isArray(data.allowedChats) ? data.allowedChats : []
        };
    } catch (error) {
        console.error('[CHAT ACCESS] Erro ao carregar lista:', error.message);
        return { allowedChats: [] };
    }
}

function saveAccessData(data) {
    ensureDataDir();
    fs.writeFileSync(ACCESS_FILE, JSON.stringify(data, null, 2));
}

export function isChatAllowed(jid) {
    const data = loadAccessData();
    return data.allowedChats.includes(jid);
}

export function allowChat(jid) {
    const data = loadAccessData();
    if (!data.allowedChats.includes(jid)) {
        data.allowedChats.push(jid);
        saveAccessData(data);
    }

    return data.allowedChats;
}

export function blockChat(jid) {
    const data = loadAccessData();
    const before = data.allowedChats.length;
    data.allowedChats = data.allowedChats.filter(chat => chat !== jid);

    if (data.allowedChats.length !== before) {
        saveAccessData(data);
    }

    return data.allowedChats;
}

export function listAllowedChats() {
    return loadAccessData().allowedChats;
}
