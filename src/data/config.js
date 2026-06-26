import fs from 'fs';
import path from 'path';

// ==================== CONFIGURACAO RPG D20 ====================

export const DATA_DIR = path.join(process.cwd(), 'data');
export const RPG_FILE = path.join(DATA_DIR, 'rpg.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
