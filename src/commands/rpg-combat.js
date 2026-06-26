import { CONFIG } from '../config.js';
import { createBar } from '../utils.js';
import { logger } from '../logger.js';
import {
    RACAS,
    CLASSES,
    BOSSES,
    LOJA_ITENS,
    NARRACOES,
    MONSTROS,
    getNarracao,
    rolarDado,
    rolarD20,
    getPlayer,
    playerExists,
    getModificador,
    criarJogador,
    adicionarXP,
    modificarOuro,
    modificarHP,
    adicionarItem,
    updatePlayer,
    verificarProgressoQuest,
    calcularHpMax,
    calcularCA,
    calcularBonusAtaque,
    calcularDano,
    xpParaLevel,
    migrarPersonagem,
    incrementarStat,
    getMonstroAleatorio,
    getLootLendario,
    getBossAleatorio,
    aplicarMecanicaBoss,
    escalarMonstro,
    escalarBoss,
    setCooldown,
    getInfoLevelingItem,
    calcularBonusLevelingItem,
    verificarCooldown,
    distribuirPontoAtributo
} from '../data/rpg.js';
import { adicionarXPEquipados } from '../data/players.js';

const normalizarId = (texto) => (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '_');

// ==================== HELPERS ====================

function formatarTempo(ms) {
    const segundos = Math.floor(ms / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    
    if (horas > 0) return `${horas}h ${minutos % 60}m`;
    if (minutos > 0) return `${minutos}m ${segundos % 60}s`;
    return `${segundos}s`;
}

function getArmaEquipada(player) {
    if (!player?.equipado?.arma) return null;
    return LOJA_ITENS.armas.find(i => i.id === player.equipado.arma) || null;
}

function calcularEfeitosArma(arma) {
    if (!arma) return { extra: 0, tipo: null, debuff: null };
    const extra = arma.danoExtra ? 5 : 0;
    const tipo = arma.danoExtra || null;
    const debuff = arma.debuff || null;
    return { extra, tipo, debuff };
}

// ==================== TUTORIAL / COMO JOGAR ====================

export async function handleTutorial(sock, msg, jid, cmdArgs, reply, react) {
    await react('📖');
    
    const topico = cmdArgs.trim().toLowerCase();
    
    if (topico === 'd20' || topico === 'dado') {
        return reply(`
╭───────────────────────╮
│ 📖 *TUTORIAL: SISTEMA D20*
├───────────────────────┤
│
│ O d20 e um dado de 20 lados.
│ E a base de todo o combate!
│
│ *COMO FUNCIONA:*
│
│ 1. Voce rola 1d20 (1 a 20)
│ 2. Soma seu bonus de ataque
│ 3. Se o total >= defesa do
│    inimigo, voce ACERTA!
│
│ *EXEMPLO:*
│ Sua rolagem: 14
│ Seu bonus: +5
│ Total: 19
│ Defesa do Goblin: 13
│ 19 >= 13? SIM = ACERTO!
│
│ *RESULTADOS ESPECIAIS:*
│
│ 🎯 *Natural 20* = CRITICO!
│    Dano dobrado (ou x3 Ladino)
│
│ 💀 *Natural 1* = FALHA CRITICA!
│    Voce erra e perde o turno
│
│ Isso torna o combate emocionante
│ pois ate o mais forte pode errar!
│
╰───────────────────────╯`);
    }
    
    if (topico === 'atributos') {
        return reply(`
╭───────────────────────╮
│ 📖 *TUTORIAL: ATRIBUTOS*
├───────────────────────┤
│
│ Agora temos 7 atributos:
│
│ ❤️ *VIGOR* — define seu HP máximo.
│ 🛡️ *RESISTÊNCIA* — defesa extra e fôlego.
│ 💪 *FORÇA* — dano/ataque de armas pesadas.
│ 🏹 *DESTREZA* — ataque/defesa para builds ágeis.
│ 🧠 *INTELIGÊNCIA* — dano/ataque arcano (Magos).
│ ✝️ *FÉ* — dano/ataque divino (Clérigos).
│ 🍀 *SORTE* — críticos, drops e roubos.
│
│ *MODIFICADOR*
│ Cada 2 pontos acima de 10 = +1 no bônus.
│ 10 → +0 | 14 → +2 | 18 → +4
│
│ Cada level dá +3 pontos para distribuir com
│ *${CONFIG.PREFIX}skill atributo qtd*
╰───────────────────────╯`);
    }
    
    if (topico === 'classes') {
        return reply(`
╭───────────────────────╮
│ 📖 *TUTORIAL: CLASSES*
├───────────────────────┤
│
│ ⚔️ *GUERREIRO*
│ HP alto (d10), bonus em Forca
│ Habilidade: Golpe Poderoso
│ (chance de +50% dano)
│
│ 🧙 *MAGO*
│ HP baixo (d6), bonus em INT
│ Habilidade: Usa Inteligencia
│ para atacar ao inves de Forca
│
│ 🗡️ *LADINO*
│ HP medio (d8), bonus em DES
│ Habilidade: Critico causa
│ TRIPLO de dano (x3)!
│
│ ✝️ *CLERIGO*
│ HP medio (d8), equilibrado
│ Habilidade: Recupera HP
│ ao vencer batalhas
│
│ 🏹 *ARQUEIRO*
│ HP medio (d8), bonus em DES
│ Habilidade: Tiro Certeiro
│ (+15% chance de critico)
│
│ Escolha baseado no seu estilo:
│ - Tanque? Guerreiro
│ - Dano magico? Mago
│ - Criticos? Ladino
│ - Sustain? Clerigo
│ - Criticos a distancia? Arqueiro
│
╰───────────────────────╯`);
    }
    
    if (topico === 'racas') {
        return reply(`
╭───────────────────────╮
│ 📖 *TUTORIAL: RACAS*
├───────────────────────┤
│
│ 👤 *HUMANO*
│ +1 em todos os atributos
│ Habilidade: +15% XP ganho
│ Bom para iniciantes!
│
│ 🧝 *ELFO*
│ +3 DES, +1 INT
│ Habilidade: +10% critico
│ Otimo para Ladinos e Magos
│
│ ⛏️ *ANAO*
│ +2 FOR, -1 DES
│ Habilidade: +25% HP maximo
│ Perfeito para Guerreiros
│
│ 👹 *ORC*
│ +4 FOR, -2 INT
│ Habilidade: +30% dano quando
│ HP esta abaixo de 30%
│ Para quem gosta de risco!
│
│ 🧛 *VAMPIRO*
│ +2 FOR, +2 DES, +1 INT, -1 SOR
│ Habilidade: Drena 25% do dano
│ causado como HP
│ Sustain no combate!
│
╰───────────────────────╯`);
    }
    
    if (topico === 'level' || topico === 'xp') {
        return reply(`
╭───────────────────────╮
│ 📖 *TUTORIAL: XP E LEVEL*
├───────────────────────┤
│
│ *COMO SUBIR DE LEVEL:*
│
│ 1. Use *!cacar* para batalhar
│ 2. Venca monstros para ganhar XP
│ 3. Quando XP >= necessario,
│    voce sobe de level!
│
├───────────────────────┤
│ *XP NECESSARIO POR LEVEL:*
│
│ Lv 1 -> 2: 100 XP
│ Lv 2 -> 3: 150 XP
│ Lv 3 -> 4: 225 XP
│ Lv 4 -> 5: 337 XP
│ (aumenta ~50% por level)
│
├───────────────────────┤
│ *XP DOS MONSTROS:*
│
│ Rato Gigante: 25 XP
│ Goblin/Esqueleto: 50 XP
│ Orc: 100 XP
│ Ogro: 450 XP
│ Troll: 700 XP
│ (monstros fortes = mais XP)
│
├───────────────────────┤
│ *BONUS DE XP:*
│
│ Humanos ganham +10% XP
│
├───────────────────────┤
│ *BENEFICIOS AO SUBIR:*
│
│ - Mais HP
│ - Monstros mais fortes aparecem
│ - A cada 4 levels: +1 atributo
│   principal da classe
│
│ Use *!perfil* para ver seu XP
│
╰───────────────────────╯`);
    }
    
    if (topico === 'combate') {
        return reply(`
╭───────────────────────╮
│ 📖 *TUTORIAL: COMBATE*
├───────────────────────┤
│
│ *PASSO A PASSO:*
│
│ 1️⃣ Voce encontra um monstro
│
│ 2️⃣ ATAQUE (sua vez):
│    Rola d20 + bonus ataque
│    Se >= CA do monstro = acerto
│
│ 3️⃣ DANO (se acertou):
│    Rola dado da arma + bonus
│    Ex: 1d8 + 3 = 7 de dano
│
│ 4️⃣ DEFESA (vez do monstro):
│    Monstro rola d20 + bonus
│    Se >= sua CA = ele acerta
│
│ 5️⃣ Repete ate alguem morrer!
│
│ *CA (Classe de Armadura):*
│ Sua defesa = 10 + mod DES + armadura
│ Quanto maior, mais dificil te acertar
│
│ *DICAS:*
│ - Compre armaduras na loja
│ - Cure-se antes de cacar
│ - Ladino + Elfo = muitos criticos
│
╰───────────────────────╯`);
    }
    
    // Menu principal do tutorial
    return reply(`
╭───────────────────────╮
│ 📖 *COMO JOGAR RPG*
├───────────────────────┤
│
│ Bem-vindo ao RPG do Bot!
│
│ *INICIO RAPIDO:*
│
│ 1. Crie seu personagem:
│    *!criarpj Nome raca classe*
│    Ex: !criarpj Shadow humano guerreiro
│
│ 2. Cace monstros:
│    *!cacar*
│
│ 3. Compre equipamentos:
│    *!loja* e *!comprar id*
│
│ 4. Veja seu personagem:
│    *!perfil*
│
├───────────────────────┤
│ 📚 *TOPICOS DETALHADOS:*
│
│ *!tutorial d20*
│ Sistema de dados e combate
│
│ *!tutorial atributos*
│ FOR, DES, INT, SOR
│
│ *!tutorial classes*
│ Guerreiro, Mago, Ladino, Clerigo
│
│ *!tutorial racas*
│ Humano, Elfo, Anao, Orc
│
│ *!tutorial combate*
│ Como funciona a batalha
│
│ *!tutorial level*
│ XP e como subir de nivel
│
╰───────────────────────╯`);
}

// ==================== ATRIBUTOS INFO ====================

export async function handleAtributosInfo(sock, msg, jid, reply, react) {
    await react('📜');
    return reply(`
╭───────────────────────╮
│ 📜 *O QUE CADA ATRIBUTO FAZ*
├───────────────────────┤
│
│ ❤️ *VIGOR* — HP máximo e cura de level up.
│ 🛡️ *RESISTÊNCIA* — CA extra e redução de dano/veneno.
│ 💪 *FORÇA* — Ataque/Dano de armas pesadas e cacar/boss corpo a corpo.
│ 🏹 *DESTREZA* — Ataque/Dano de armas leves/à distância e esquiva.
│ 🧠 *INTELIGÊNCIA* — Ataque/Dano arcano (magos) e efeitos mágicos.
│ ✝️ *FÉ* — Ataque/Dano divino (clérigos) e cura/escudos sagrados.
│ 🍀 *SORTE* — Críticos, drops raros, roubos e prócs de efeitos.
│
│ 🎯 *MODIFICADOR*
│ Cada 2 pts acima de 10 = +1 (ex.: 10→+0, 14→+2, 18→+4).
│ Ganha +3 pontos por level para gastar em *${CONFIG.PREFIX}skill atributo qtd*.
╰───────────────────────╯`);
}

// ==================== CRIAR PERSONAGEM ====================

export async function handleCriarPJ(sock, msg, jid, sender, cmdArgs, reply, react) {
    if (playerExists(sender)) {
        return reply(`
╭──────────────────────╮
│ Voce ja tem um personagem!
│ Use *${CONFIG.PREFIX}perfil* para ver
│ ou *${CONFIG.PREFIX}resetarpj* para deletar
╰──────────────────────╯`);
    }
    
    const args = cmdArgs.trim().split(' ');
    const nome = args[0];
    const raca = args[1]?.toLowerCase();
    const classe = args[2]?.toLowerCase();
    
    if (!nome || !raca || !classe) {
        const racasLista = Object.entries(RACAS)
            .map(([key, r]) => `│ ${r.emoji} *${key}* - ${r.descricao}`)
            .join('\n');
        const classesLista = Object.entries(CLASSES)
            .map(([key, c]) => `│ ${c.emoji} *${key}* - ${c.descricao}`)
            .join('\n');
        
        return reply(`
╭──────────────────────╮
│ ⚔️ *CRIAR PERSONAGEM*
├──────────────────────┤
│
│ Uso: *${CONFIG.PREFIX}criarpj [nome] [raca] [classe]*
│
│ 🧬 *RACAS:*
${racasLista}
│
│ 📜 *CLASSES:*
${classesLista}
│
│ Exemplo:
│ *${CONFIG.PREFIX}criarpj Shadow humano guerreiro*
│
│ Dica: Use *${CONFIG.PREFIX}tutorial* para
│ aprender sobre o sistema!
│
╰──────────────────────╯`);
    }
    
    if (!RACAS[raca]) {
        return reply(`Raca invalida! Opcoes: humano, elfo, anao, orc`);
    }
    
    if (!CLASSES[classe]) {
        return reply(`Classe invalida! Opcoes: guerreiro, mago, ladino, clerigo`);
    }
    
    if (nome.length > 15) {
        return reply('Nome muito longo! Maximo 15 caracteres.');
    }
    
    await react('⚔️');
    const player = criarJogador(sender, nome, raca, classe);
    const racaInfo = RACAS[raca];
    const classeInfo = CLASSES[classe];
    
    return reply(`
╭──────────────────────╮
│ ⚔️ *PERSONAGEM CRIADO!*
├──────────────────────┤
│
│ 📛 *${player.nome}*
│ ${racaInfo.emoji} Raca: ${racaInfo.nome}
│ ${classeInfo.emoji} Classe: ${classeInfo.nome}
│
│ 📊 Level: 1
│ ❤️ HP: ${player.hp}
│ 🛡️ CA: ${calcularCA(player)}
│ 💰 Ouro: ${player.ouro}
│
│ ❤️ VIG: ${player.atributos.vigor} (${getModificador(player.atributos.vigor) >= 0 ? '+' : ''}${getModificador(player.atributos.vigor)})
│ 🛡️ RES: ${player.atributos.resistencia} (${getModificador(player.atributos.resistencia) >= 0 ? '+' : ''}${getModificador(player.atributos.resistencia)})
│ 💪 FOR: ${player.atributos.forca} (${getModificador(player.atributos.forca) >= 0 ? '+' : ''}${getModificador(player.atributos.forca)})
│ 🏹 DES: ${player.atributos.destreza} (${getModificador(player.atributos.destreza) >= 0 ? '+' : ''}${getModificador(player.atributos.destreza)})
│ 🧠 INT: ${player.atributos.inteligencia} (${getModificador(player.atributos.inteligencia) >= 0 ? '+' : ''}${getModificador(player.atributos.inteligencia)})
│ ✝️ FE: ${player.atributos.fe} (${getModificador(player.atributos.fe) >= 0 ? '+' : ''}${getModificador(player.atributos.fe)})
│ 🍀 SOR: ${player.atributos.sorte} (${getModificador(player.atributos.sorte) >= 0 ? '+' : ''}${getModificador(player.atributos.sorte)})
│
├──────────────────────┤
│ 🎯 *Habilidades:*
│ ${racaInfo.habilidade}
│ ${classeInfo.habilidade}
│
│ Use *${CONFIG.PREFIX}cacar* para comecar!
│ Use *${CONFIG.PREFIX}tutorial* para aprender
╰──────────────────────╯`);
}

// ==================== LISTAR BOSSES ====================

export async function handleListaBosses(sock, msg, jid, sender, reply, react) {
    await react('🐉');
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj* para ver os bosses.`);
    }

    const derrotados = player.bossesDerrotadosIds || [];
    const bossesOrdenados = [...BOSSES].sort((a, b) => a.level - b.level);
    const proximoBoss = bossesOrdenados.find(b => !derrotados.includes(b.id)) || null;

    const lista = bossesOrdenados.map(b => {
        const derrotado = derrotados.includes(b.id);
        const ehProximo = proximoBoss && proximoBoss.id === b.id;
        let status;
        if (derrotado) status = '✅ Derrotado';
        else if (ehProximo && player.level >= b.level) status = '🎯 Próximo (liberado)';
        else if (ehProximo) status = `🔒 Requer Lv ${b.level}`;
        else status = '🔒 Trancado (derrote anteriores)';
        return `│ ${b.emoji} *${b.nome}* (Lv ${b.level}) — ${status}
│   CA ${b.ca} | ATK +${b.bonusAtaque} | Dano ${b.dano}
│   ${b.descricao}`;
    }).join('\n│\n');

    return reply(`
╭──────────────────────╮
│ 🐉 *BOSSES DISPONIVEIS*
├──────────────────────┤
│
${lista}
│
│ O próximo desbloqueado aparece como "🎯".
╰──────────────────────╯`);
}

// ==================== LISTAR MONSTROS ====================
export async function handleMonstros(sock, msg, jid, sender, reply, react) {
    await react('📜');
    const grupos = new Map();
    for (const m of MONSTROS) {
        const key = `CR ${m.cr}`;
        if (!grupos.has(key)) grupos.set(key, []);
        grupos.get(key).push(`${m.emoji} ${m.nome}`);
    }

    const linhas = [...grupos.entries()]
        .sort((a, b) => parseFloat(a[0].split(' ')[1]) - parseFloat(b[0].split(' ')[1]))
        .map(([cr, nomes]) => `🔹 ${cr}: ${nomes.join(', ')}`);

    return reply(`🗡️ *MONSTROS DISPONÍVEIS*

${linhas.join('\n')}`);
}

// ==================== PERFIL ====================

export async function handlePerfil(sock, msg, jid, sender, mentioned, reply, react) {
    const targetId = mentioned?.length > 0 ? mentioned[0] : sender;
    let player = getPlayer(targetId);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    player = migrarPersonagem(player);

    const racaInfo = RACAS[player.raca] || RACAS.humano;
    const classeInfo = CLASSES[player.classe] || CLASSES.guerreiro;
    const hpMax = calcularHpMax(player);
    const ca = calcularCA(player);
    const bonusAtaque = calcularBonusAtaque(player);
    const danoInfo = calcularDano(player);
    const xpNecessario = xpParaLevel(player.level + 1);
    const hpPct = Math.floor((player.hp / hpMax) * 100);
    const xpPct = Math.floor((player.xp / xpNecessario) * 100);
    const stats = player.stats || {};
    
    let armaEquipada = 'Desarmado (1d4)';
    let armaDetalhes = '';
    let armaduraEquipada = 'Nenhuma';
    let armaduraDetalhes = '';
    
    if (player.equipado?.arma) {
        const arma = LOJA_ITENS.armas.find(i => i.id === player.equipado.arma);
        if (arma) {
            armaEquipada = `${arma.emoji} ${arma.nome} (${arma.dano})`;
            const extras = [];
            if (arma.bonusAtaque) extras.push(`ATK +${arma.bonusAtaque}`);
            if (arma.bonusInt) extras.push(`INT +${arma.bonusInt}`);
            if (arma.bonusFor) extras.push(`FOR +${arma.bonusFor}`);
            if (arma.bonusAgi) extras.push(`AGI +${arma.bonusAgi}`);
            if (arma.danoExtra) extras.push(`Dano extra: ${arma.danoExtra}`);
            armaDetalhes = extras.length ? `│    ➕ ${extras.join(' | ')}` : '';
        }
    }
    if (player.equipado?.armadura) {
        const armadura = LOJA_ITENS.armaduras.find(i => i.id === player.equipado.armadura);
        if (armadura) {
            armaduraEquipada = `${armadura.emoji} ${armadura.nome} (+${armadura.bonusCA} CA)`;
            const extras = [];
            if (armadura.bonusHP) extras.push(`HP +${armadura.bonusHP}`);
            if (armadura.resistMagica) extras.push(`RM ${armadura.resistMagica}%`);
            if (armadura.resistFogo) extras.push(`Fogo ${armadura.resistFogo}%`);
            if (armadura.resistFrio) extras.push(`Gelo ${armadura.resistFrio}%`);
            armaduraDetalhes = extras.length ? `│    🛡️ ${extras.join(' | ')}` : '';
        }
    }

    const elo = player.elo || 1600;
    const streak = stats.dueloStreak || 0;
    const pontosLivres = player.pontosAtributos || 0;
    const criado = player.criado ? new Date(player.criado).toLocaleDateString('pt-BR') : '—';

    const lore = `${player.nome} vaga como ${racaInfo.nome.toLowerCase()} ${classeInfo.nome.toLowerCase()} de nivel ${player.level}, colecionando ${stats.monstrosMortos || 0} trofeus e ${stats.bossesDerrotados || 0} boss(es) derrotados. e dando o cuzinho por ai`;

    const cooldowns = {
        cacar: verificarCooldown(sender, 'cacar'),
        boss: verificarCooldown(sender, 'boss'),
        duelo: verificarCooldown(sender, 'duelo'),
        daily: verificarCooldown(sender, 'daily')
    };
    
    return reply(`
╭──────────────────────╮
│ 👤 *FICHA DE PERSONAGEM*
├──────────────────────┤
│
│ 📛 *${player.nome}*
│ ${racaInfo.emoji} ${racaInfo.nome} ${classeInfo.emoji} ${classeInfo.nome}
│
│ 📊 Level: *${player.level}*
│ ⭐ XP: ${player.xp}/${xpNecessario}
│ ${createBar(xpPct)}
│
│ ❤️ HP: ${player.hp}/${hpMax}
│ ${createBar(hpPct)}
│
│ 🛡️ CA: *${ca}* | ⚔️ Ataque: *+${bonusAtaque}*
│ 💥 Dano: *${danoInfo.dado}${danoInfo.modificador >= 0 ? '+' : ''}${danoInfo.modificador}*
│ 🏆 ELO: *${elo}* | 🔥 Streak: ${streak}
│ 🧮 Pontos livres: ${pontosLivres} | 📅 Criado: ${criado}
│
│ 💰 Ouro: *${player.ouro}*
│
├──────────────────────┤
│ 📊 *ATRIBUTOS*
│ ❤️ VIG: ${player.atributos?.vigor || 10} (${getModificador(player.atributos?.vigor || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.vigor || 10)})
│ 🛡️ RES: ${player.atributos?.resistencia || 10} (${getModificador(player.atributos?.resistencia || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.resistencia || 10)})
│ 💪 FOR: ${player.atributos?.forca || 10} (${getModificador(player.atributos?.forca || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.forca || 10)})
│ 🏹 DES: ${player.atributos?.destreza || 10} (${getModificador(player.atributos?.destreza || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.destreza || 10)})
│ 🧠 INT: ${player.atributos?.inteligencia || 10} (${getModificador(player.atributos?.inteligencia || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.inteligencia || 10)})
│ ✝️ FE: ${player.atributos?.fe || 10} (${getModificador(player.atributos?.fe || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.fe || 10)})
│ 🍀 SOR: ${player.atributos?.sorte || 10} (${getModificador(player.atributos?.sorte || 10) >= 0 ? '+' : ''}${getModificador(player.atributos?.sorte || 10)})
│
├──────────────────────┤
│ 🎒 *EQUIPAMENTO*
│ ⚔️ ${armaEquipada}
${armaDetalhes ? armaDetalhes + '\n' : ''}│ 🛡️ ${armaduraEquipada}
${armaduraDetalhes ? armaduraDetalhes + '\n' : ''}
│
├──────────────────────┤
│ 📈 *ESTATISTICAS*
│ 💀 Monstros: ${stats.monstrosMortos || 0}
│ 🐉 Bosses: ${stats.bossesDerrotados || 0}
│ ⚔️ Duelos: ${stats.duelosVencidos || 0}V/${stats.duelosPerdidos || 0}D
│ 🎯 Criticos: ${stats.criticos || 0} | 💢 Falhas: ${stats.falhasCriticas || 0}
│
├──────────────────────┤
│ 🕒 *COOLDOWNS*
│ 🐾 Cacar: ${cooldowns.cacar.emCooldown ? formatarTempo(cooldowns.cacar.tempoRestante) : 'Pronto'}
│ 🐉 Boss: ${cooldowns.boss.emCooldown ? formatarTempo(cooldowns.boss.tempoRestante) : 'Pronto'}
│ ⚔️ Duelo: ${cooldowns.duelo.emCooldown ? formatarTempo(cooldowns.duelo.tempoRestante) : 'Pronto'}
│ 🎁 Daily: ${cooldowns.daily.emCooldown ? 'Disponivel amanha' : 'Pronto'}
│
├──────────────────────┤
│ 📜 *LORE*
│ ${lore}
│
╰──────────────────────╯`);
}

// ==================== STATUS/ATRIBUTOS ====================

export async function handleStatus(sock, msg, jid, sender, reply, react) {
    let player = getPlayer(sender);
    
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    player = migrarPersonagem(player);
    
    await react('📊');
    const racaInfo = RACAS[player.raca];
    const classeInfo = CLASSES[player.classe];
    
    // Calcular estatísticas de combate
    const hpMax = calcularHpMax(player);
    const ca = calcularCA(player);
    const bonusAtaque = calcularBonusAtaque(player);
    const danoDice = calcularDano(player);
    
    // Calcular próximo nível
    const xpProximo = xpParaLevel(player.level + 1);
    const pctProgress = Math.floor((player.xp / xpProximo) * 100);
    
    // Barras de atributos
    const criarBarraAtributo = (valor, max = 20) => {
        const pct = Math.min(100, (valor / max) * 100);
        const preenchido = Math.floor(pct / 10);
        const vazio = 10 - preenchido;
        return `▓`.repeat(preenchido) + `░`.repeat(vazio) + ` ${valor}`;
    };
    
    // Stats gerais
    const monstrosKill = player.stats?.monstrosMortos || 0;
    const duelosWin = player.stats?.duelosVencidos || 0;
    const duelosLoss = player.stats?.duelosPerdidos || 0;
    const criticos = player.stats?.criticos || 0;
    const falhas = player.stats?.falhasCriticas || 0;
    
    return reply(`
╭─────────────────────────────────╮
│ 📊 *ATRIBUTOS DETALHADOS*
├─────────────────────────────────┤
│
│ 👤 *${player.nome}* (Lv.${player.level})
│ ${racaInfo.emoji} ${racaInfo.nome} ${classeInfo.emoji} ${classeInfo.nome}
│ 💰 Ouro: ${player.ouro}
│
├─────────────────────────────────┤
│ ❤️ *VIDA*
│ HP: ${player.hp}/${hpMax}
│ ${createBar((player.hp / hpMax) * 100)}
│
├─────────────────────────────────┤
│ 📈 *PROGRESSÃO*
│ XP: ${player.xp}/${xpProximo}
│ ${createBar(pctProgress)}
│
├─────────────────────────────────┤
│ 🎯 *ATRIBUTOS BASE*
│ ❤️ Vigor: ${criarBarraAtributo(player.atributos.vigor)}
│    └ Mod: ${getModificador(player.atributos.vigor) >= 0 ? '+' : ''}${getModificador(player.atributos.vigor)}
│
│ 🛡️ Resistência: ${criarBarraAtributo(player.atributos.resistencia)}
│    └ Mod: ${getModificador(player.atributos.resistencia) >= 0 ? '+' : ''}${getModificador(player.atributos.resistencia)}
│
│ 💪 Força: ${criarBarraAtributo(player.atributos.forca)}
│    └ Mod: ${getModificador(player.atributos.forca) >= 0 ? '+' : ''}${getModificador(player.atributos.forca)}
│
│ 🏹 Destreza: ${criarBarraAtributo(player.atributos.destreza)}
│    └ Mod: ${getModificador(player.atributos.destreza) >= 0 ? '+' : ''}${getModificador(player.atributos.destreza)}
│
│ 🧠 Inteligência: ${criarBarraAtributo(player.atributos.inteligencia)}
│    └ Mod: ${getModificador(player.atributos.inteligencia) >= 0 ? '+' : ''}${getModificador(player.atributos.inteligencia)}
│
│ ✝️ Fé: ${criarBarraAtributo(player.atributos.fe)}
│    └ Mod: ${getModificador(player.atributos.fe) >= 0 ? '+' : ''}${getModificador(player.atributos.fe)}
│
│ 🍀 Sorte: ${criarBarraAtributo(player.atributos.sorte)}
│    └ Mod: ${getModificador(player.atributos.sorte) >= 0 ? '+' : ''}${getModificador(player.atributos.sorte)}
│
├─────────────────────────────────┤
│ ⚔️ *ESTATÍSTICAS DE COMBATE*
│ 🛡️ Defesa (CA): ${ca}
│ 🔫 Bônus de Ataque: ${bonusAtaque >= 0 ? '+' : ''}${bonusAtaque}
│ 💥 Dano: ${danoDice.dado}${danoDice.modificador >= 0 ? '+' : ''}${danoDice.modificador}
│
├─────────────────────────────────┤
│ 🏆 *ESTATÍSTICAS GERAIS*
│ 👹 Monstros Derrotados: ${monstrosKill}
│ ⚔️ Duelos Ganhos: ${duelosWin}
│ 💔 Duelos Perdidos: ${duelosLoss}
│ ⚡ Críticos: ${criticos}
│ 💀 Falhas Críticas: ${falhas}
│
╰─────────────────────────────────╯`);
}

// ==================== CACAR (COMBATE D20) ====================

export async function handleCacar(sock, msg, jid, sender, reply, react) {
    try {
        let player = getPlayer(sender);
        if (!player) return reply(`Crie um personagem primeiro! Use *${CONFIG.PREFIX}criar*.`);
        
        await react('⚔️');
        
        const cooldown = verificarCooldown(sender, 'cacar');
        if (cooldown.emCooldown) {
            return reply(`⏳ Aguarde ${formatarTempo(cooldown.tempoRestante)} para caçar novamente.`);
        }
        
        if (player.hp <= 0) {
            return reply(`Você está morto! Use *${CONFIG.PREFIX}curar* para reviver.`);
        }
        
        let monstro = getMonstroAleatorio(player);
        const monstrosDerrotados = player.stats?.monstrosMortos || 0;
        monstro = escalarMonstro(monstro, player.level, monstrosDerrotados);
        const arma = getArmaEquipada(player);
        const efeitosArma = calcularEfeitosArma(arma);
        let venenoMonstro = 0;
        let venenoRounds = 0;
        
        let logs = [];
        let monstroHP = monstro.hp;
        let playerHP = player.hp;
        let rodadas = 0;
        const maxRodadas = 20;
        
        const bonusPorNivel = Math.floor(player.level / 4);
        const hpMaxPlayer = calcularHpMax(player);
        const caPlayer = calcularCA(player);
        const bonusAtaquePlayer = calcularBonusAtaque(player) + bonusPorNivel;
        const danoInfoPlayer = calcularDano(player);
        
        const racaInfo = RACAS[player.raca] || RACAS.humano;
        const classeInfo = CLASSES[player.classe] || CLASSES.guerreiro;
        const separador = '═'.repeat(35);
        
        logs.push(`${separador}`);
        logs.push(`⚔️ COMBATE INICIADO!`);
        logs.push(`${separador}`);
        const bar = (curr, max) => {
            const pct = Math.max(0, Math.min(100, Math.round((curr / max) * 100)));
            const filled = Math.floor(pct / 10);
            const empty = 10 - filled;
            return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${pct}%`;
        };

        logs.push(`${racaInfo.emoji} ${player.nome} (Lv.${player.level}) - ${classeInfo.emoji} ${classeInfo.nome}`);
        logs.push(`HP ${playerHP}/${hpMaxPlayer} ${bar(playerHP, hpMaxPlayer)} | CA ${caPlayer} | ATK +${bonusAtaquePlayer}`);
        logs.push(`vs ${monstro.emoji} ${monstro.nome} (CR ${monstro.cr})${monstro.escalado ? ` ⚡+${Math.round((monstro.multiplicador - 1) * 100)}%` : ''}`);
        logs.push(`HP ${monstroHP} ${bar(monstroHP, monstro.hp)} | CA ${monstro.ca}`);
        logs.push(``);
        
        while (monstroHP > 0 && playerHP > 0 && rodadas < maxRodadas) {
            rodadas++;
            
            const rolagemJogador = rolarD20();
            const totalAtaque = rolagemJogador + bonusAtaquePlayer;
            const acertoJogador = rolagemJogador !== 1 && totalAtaque >= monstro.ca;
            
            let danoJogador = 0;
            if (acertoJogador) {
                danoJogador = rolarDado(danoInfoPlayer.dado) + danoInfoPlayer.modificador;
                if (rolagemJogador === 20) {
                    const mult = CLASSES[player.classe]?.criticoMultiplicador || 2;
                    danoJogador *= mult;
                    logs.push(`R${rodadas}J: 🎯 CRÍTICO! [D20: 20] Dano: ${danoJogador}!`);
                    incrementarStat(sender, 'criticos');
                    verificarProgressoQuest(player, 'criticos', 1);
                    updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
                } else {
                    logs.push(`R${rodadas}J: ⚔️ Acerto! [D20: ${rolagemJogador}+${bonusAtaquePlayer} = ${totalAtaque}vs${monstro.ca}] Dano: ${danoJogador}`);
                }
                if (efeitosArma.extra > 0) {
                    danoJogador += efeitosArma.extra;
                    logs.push(`   🔥 Dano extra (${efeitosArma.tipo || 'elemental'}): +${efeitosArma.extra}`);
                }
                if (efeitosArma.tipo === 'frio' && monstro.nome.toLowerCase().includes('orc')) {
                    const bonusGelo = Math.floor(danoJogador * 0.4);
                    danoJogador += bonusGelo;
                    logs.push(`   ❄️ Fraqueza de orc ao gelo: +${bonusGelo} dano.`);
                }
                if (efeitosArma.debuff === 'veneno') {
                    venenoMonstro = 5;
                    venenoRounds = 3;
                    logs.push('   ☠️ Veneno aplicado (5 por rodada por 3 turnos).');
                }
                monstroHP -= danoJogador;
            } else if (rolagemJogador === 1) {
                logs.push(`R${rodadas}J: 💀 Falha crítica! [D20: 1]`);
                incrementarStat(sender, 'falhasCriticas');
            } else {
                logs.push(`R${rodadas}J: ❌ Erro! [D20: ${rolagemJogador}+${bonusAtaquePlayer} = ${totalAtaque}vs${monstro.ca}]`);
            }
            logs.push(`   💚 ${player.nome}: ${playerHP}/${hpMaxPlayer} (${bar(playerHP, hpMaxPlayer)})`);
            logs.push(`   💀 ${monstro.nome}: ${Math.max(0, monstroHP)}/${monstro.hp} (${bar(monstroHP, monstro.hp)})`);

            if (monstroHP > 0 && venenoRounds > 0) {
                monstroHP = Math.max(0, monstroHP - venenoMonstro);
                venenoRounds--;
                logs.push(`   ☠️ Veneno causa ${venenoMonstro} dano. Restam ${venenoRounds} turno(s).`);
                logs.push(`   💀 ${monstro.nome}: ${Math.max(0, monstroHP)}/${monstro.hp} (${bar(monstroHP, monstro.hp)})`);
            }
            
            if (monstroHP <= 0) break;
            
            const rolagemMonstro = rolarD20();
            const acertoMonstro = rolagemMonstro + monstro.bonusAtaque >= caPlayer;
            
            let danoMonstro = 0;
            if (acertoMonstro) {
                danoMonstro = rolarDado(monstro.dano);
                playerHP -= danoMonstro;
                if (rolagemMonstro === 20) {
                    logs.push(`R${rodadas}M: ⚡ CRÍTICO! [D20: 20] Dano: ${danoMonstro}!`);
                } else {
                    logs.push(`R${rodadas}M: 💥 Acerto! [D20: ${rolagemMonstro}+${monstro.bonusAtaque} = ${rolagemMonstro + monstro.bonusAtaque}vs${caPlayer}] Dano: ${danoMonstro}`);
                }
            } else if (rolagemMonstro === 1) {
                logs.push(`R${rodadas}M: 😂 Falha crítica! [D20: 1]`);
            } else {
                logs.push(`R${rodadas}M: ❌ Desvio! [D20: ${rolagemMonstro}+${monstro.bonusAtaque} = ${rolagemMonstro + monstro.bonusAtaque}vs${caPlayer}]`);
            }
            logs.push(`   💚 ${player.nome}: ${playerHP}/${hpMaxPlayer} (${bar(playerHP, hpMaxPlayer)})`);
            logs.push(`   💀 ${monstro.nome}: ${Math.max(0, monstroHP)}/${monstro.hp} (${bar(monstroHP, monstro.hp)})`);
        }
        
        setCooldown(sender, 'cacar', Date.now() + 80000);
        
        if (monstroHP <= 0) {
            const xpGanho = monstro.xp;
            const ouroGanho = monstro.ouro;
            
            const xpResult = adicionarXP(sender, xpGanho);
            modificarOuro(sender, ouroGanho);
            modificarHP(sender, playerHP - player.hp);
            incrementarStat(sender, 'monstrosMortos');
            verificarProgressoQuest(player, 'matar', { valor: 1, monstro: normalizarId(monstro.nome) });
            verificarProgressoQuest(player, 'vitorias', 1);
            updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
            
            // 📊 Leveling de itens
            let lootMsg = '';
            const loot = getLootLendario(monstro, player.level);
            if (loot) {
                adicionarItem(sender, loot.id);
                lootMsg = `💎 LOOT: ${loot.emoji} ${loot.nome}`;
            }
            
            if (player.classe === 'clerigo') {
                const cura = Math.floor(calcularHpMax(player) * 0.2);
                modificarHP(sender, cura);
                logs.push(`✝️ Cura Divina +${cura}hp`);
            }
            
            logs.push(``);
            logs.push(`${separador}`);
            logs.push(`🏆 VITÓRIA!`);
            logs.push(`⭐ XP: +${xpGanho} | 💰 Ouro: +${ouroGanho}`);
            if (lootMsg) logs.push(lootMsg);
            logs.push(`❤️ HP: ${playerHP}/${hpMaxPlayer}`);
            
            if (xpResult?.levelUp) {
                logs.push(`🎉 LEVEL UP! Lv${xpResult.player.level}`);
                const racaInfo2 = RACAS[player.raca] || RACAS.humano;
                const classeInfo2 = CLASSES[player.classe] || CLASSES.guerreiro;
                verificarProgressoQuest(xpResult.player, 'levels_ganhos', 1);
                await sock.sendMessage(jid, { 
                    text: `🌟 **LEVEL UP** 🌟\n@${player.nome} ${racaInfo2.emoji} ${classeInfo2.emoji}\n→ Lv${xpResult.player.level}!\n🎊 Parabéns!`,
                    mentions: [sender]
                });
            }

            updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
            
            return reply(`${logs.join('\n')}`);
            
        } else if (playerHP <= 0) {
            modificarHP(sender, -player.hp);
            logs.push(``);
            logs.push(`${separador}`);
            logs.push(`💀 DERROTA!`);
            logs.push(`Você foi derrotado!`);
            logs.push(`Use *${CONFIG.PREFIX}curar* para reviver`);
            return reply(`${logs.join('\n')}`);
            
        } else {
            const xpGanho = Math.floor(monstro.xp * 0.25);
            const ouroGanho = Math.floor(monstro.ouro * 0.25);
            
            const xpResult = adicionarXP(sender, xpGanho);
            modificarOuro(sender, ouroGanho);
            modificarHP(sender, playerHP - player.hp);
            
            logs.push(``);
            logs.push(`${separador}`);
            logs.push(`🏃 RECUO ESTRATÉGICO!`);
            logs.push(`⭐ XP: +${xpGanho} (25%) | 💰 Ouro: +${ouroGanho} (25%)`);
            logs.push(`❤️ HP: ${playerHP}/${hpMaxPlayer}`);
            
            if (xpResult?.levelUp) {
                logs.push(`🎉 LEVEL UP! Lv${xpResult.player.level}`);
                const racaInfo2 = RACAS[player.raca] || RACAS.humano;
                const classeInfo2 = CLASSES[player.classe] || CLASSES.guerreiro;
                await sock.sendMessage(jid, { 
                    text: `🌟 **LEVEL UP** 🌟\n@${player.nome} ${racaInfo2.emoji} ${classeInfo2.emoji}\n→ Lv${xpResult.player.level}!\n🎊 Parabéns!`,
                    mentions: [sender]
                });
            }
            
            return reply(`${logs.join('\n')}`);
        }
    } catch (erro) {
        console.error('Erro em handleCacar:', erro);
        return reply(`❌ Erro ao caçar: ${erro.message}`);
    }
}

// ==================== BOSS/DUNGEON ====================

export async function handleBoss(sock, msg, jid, sender, reply, react) {
    try {
        const player = getPlayer(sender);
        
        if (!player) {
            return reply('Você precisa criar um personagem primeiro! Use *!criarpj*');
        }
        
        if (player.hp <= 0) {
            return reply('Você está morto! Use *!curar* para reviver!');
        }
        
        const derrotados = player.bossesDerrotadosIds || [];
        const bossesOrdenados = [...BOSSES].sort((a, b) => a.level - b.level);
        const proximoBoss = bossesOrdenados.find(b => !derrotados.includes(b.id));
        if (!proximoBoss) {
            return reply('🎉 Você já derrotou todos os bosses disponíveis!');
        }
        let boss = escalarBoss(proximoBoss, player.level);
        await react('🐉');
        
        const arma = getArmaEquipada(player);
        const efeitosArma = calcularEfeitosArma(arma);
        let venenoBoss = 0;
        let venenoRounds = 0;

        const hpMaxPlayer = calcularHpMax(player);
        let playerHP = hpMaxPlayer;
        let bossHP = boss.hp;
        let rodada = 0;
        const logs = [];
        
        const bonusPorNivel = Math.floor(player.level / 4);
        const caPlayer = calcularCA(player);
        const bonusAtaquePlayer = calcularBonusAtaque(player) + bonusPorNivel;
        const danoInfoPlayer = calcularDano(player);
        
        const racaInfo = RACAS[player.raca] || RACAS.humano;
        const classeInfo = CLASSES[player.classe] || CLASSES.guerreiro;
        const separador = '═'.repeat(35);
        const bar = (curr, max) => {
            const pct = Math.max(0, Math.min(100, Math.round((curr / max) * 100)));
            const filled = Math.floor(pct / 10);
            const empty = 10 - filled;
            return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${pct}%`;
        };
        
        logs.push(separador);
        logs.push(`🐉 DESAFIO DO BOSS!`);
        logs.push(`${racaInfo.emoji} ${player.nome} (Lv${player.level}) vs ${boss.emoji} ${boss.nome}`);
        logs.push(`💚 ${player.nome}: ${playerHP}/${hpMaxPlayer} ${bar(playerHP, hpMaxPlayer)}`);
        logs.push(`🐉 ${boss.nome}: ${bossHP}/${boss.hp} ${bar(bossHP, boss.hp)}`);
        logs.push(``);
        
        while (bossHP > 0 && playerHP > 0) {
            rodada++;
            
            const rolagemJogador = rolarD20();
            const totalAtaque = rolagemJogador + bonusAtaquePlayer;
            const acertoJogador = rolagemJogador !== 1 && totalAtaque >= boss.ca;
            
            let danoJogador = 0;
            if (acertoJogador) {
                const danoInfo = calcularDano(player);
                danoJogador = rolarDado(danoInfo?.dado || '1d4') + (danoInfo?.modificador || 0);
                
                if (rolagemJogador === 20) {
                    const mult = CLASSES[player.classe]?.criticoMultiplicador || 2;
                    danoJogador *= mult;
                    logs.push(`R${rodada}J: 🌟 CRÍTICO! [D20: 20] Dano: ${danoJogador}!`);
                    incrementarStat(sender, 'criticos');
                    verificarProgressoQuest(player, 'criticos', 1);
                    updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
                } else {
                    logs.push(`R${rodada}J: ⚔️ Acerto! [D20: ${rolagemJogador}+${bonusAtaquePlayer} = ${totalAtaque}vs${boss.ca}] Dano: ${danoJogador}`);
                }
                if (efeitosArma.extra > 0) {
                    danoJogador += efeitosArma.extra;
                    logs.push(`   🔥 Dano extra (${efeitosArma.tipo || 'elemental'}): +${efeitosArma.extra}`);
                }
                if (efeitosArma.debuff === 'veneno') {
                    venenoBoss = 5;
                    venenoRounds = 3;
                    logs.push('   ☠️ Veneno aplicado (5 por rodada por 3 turnos).');
                }
                
                const mecanica = aplicarMecanicaBoss(boss, rodada, danoJogador, totalAtaque);
                if (mecanica.playerDanoReduction) {
                    danoJogador = Math.floor(danoJogador * mecanica.playerDanoReduction);
                }
                if (mecanica.danoMultiplier && mecanica.danoMultiplier < 1) {
                    danoJogador = Math.floor(danoJogador * mecanica.danoMultiplier);
                }
                
                bossHP = Math.max(0, bossHP - danoJogador);
            } else if (rolagemJogador === 1) {
                logs.push(`R${rodada}J: 💀 Falha crítica! [D20: 1]`);
                incrementarStat(sender, 'falhasCriticas');
            } else {
                logs.push(`R${rodada}J: ❌ Erro! [D20: ${rolagemJogador}+${bonusAtaquePlayer} = ${totalAtaque}vs${boss.ca}]`);
            }
            logs.push(`   💚 ${player.nome}: ${playerHP}/${hpMaxPlayer} ${bar(playerHP, hpMaxPlayer)} | 🐉 ${boss.nome}: ${Math.max(0, bossHP)}/${boss.hp} ${bar(bossHP, boss.hp)}`);
            
            if (bossHP <= 0) break;
            
            const rolagemBoss = rolarD20();
            const mecanica = aplicarMecanicaBoss(boss, rodada, danoJogador, 0);
            const bonusAtaqueBoss = boss.bonusAtaque + (mecanica.caIncrease || 0);
            const totalAtaqueBoss = rolagemBoss + bonusAtaqueBoss;
            
            let danoBoss = 0;
            if (rolagemBoss !== 1 && totalAtaqueBoss >= caPlayer) {
                danoBoss = rolarDado(boss.dano || '1d6');
                playerHP = Math.max(0, playerHP - danoBoss);
                if (rolagemBoss === 20) {
                    danoBoss *= 2;
                    logs.push(`R${rodada}M: ⚡ CRÍTICO! [D20: 20] Dano: ${danoBoss}!`);
                } else {
                    logs.push(`R${rodada}M: 💥 Acerto! [D20: ${rolagemBoss}+${bonusAtaqueBoss} = ${totalAtaqueBoss}vs${caPlayer}] Dano: ${danoBoss}`);
                }
            } else if (rolagemBoss === 1) {
                logs.push(`R${rodada}M: 😂 Falha crítica! [D20: 1]`);
            } else {
                logs.push(`R${rodada}M: ❌ Desvio! [D20: ${rolagemBoss}+${bonusAtaqueBoss} = ${totalAtaqueBoss}vs${caPlayer}]`);
            }
            
            if (mecanica.curaBoss) {
                bossHP = Math.min(boss.hp, bossHP + mecanica.curaBoss);
            }
            if (mecanica.playerVeneno) {
                playerHP = Math.max(0, playerHP - mecanica.playerVeneno);
            }
            if (bossHP > 0 && venenoRounds > 0) {
                bossHP = Math.max(0, bossHP - venenoBoss);
                venenoRounds--;
                logs.push(`   ☠️ Veneno causa ${venenoBoss} dano. Restam ${venenoRounds} turno(s).`);
            }
            logs.push(`   💚 ${player.nome}: ${playerHP}/${hpMaxPlayer} ${bar(playerHP, hpMaxPlayer)} | 🐉 ${boss.nome}: ${Math.max(0, bossHP)}/${boss.hp} ${bar(bossHP, boss.hp)}`);
        }
        
        if (bossHP <= 0) {
            const xpGanho = boss.xp;
            const ouroGanho = boss.ouro;
            const xpResult = adicionarXP(sender, xpGanho);
            modificarOuro(sender, ouroGanho);
            modificarHP(sender, playerHP - player.hp);
            incrementarStat(sender, 'bossesDerrotados');
            verificarProgressoQuest(player, 'vitorias', 1);
            verificarProgressoQuest(player, 'matar', { valor: 1, monstro: normalizarId(boss.nome) });
            updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
            const atual = getPlayer(sender);
            const derrotadosLista = atual?.bossesDerrotadosIds || [];
            const firstKill = !derrotadosLista.includes(boss.id);
            if (firstKill) {
                derrotadosLista.push(boss.id);
                updatePlayer(sender, { bossesDerrotadosIds: derrotadosLista });

                if (boss.recompensaUnica) {
                    adicionarItem(sender, boss.recompensaUnica);
                    const trofeu = LOJA_ITENS.legendarios.find(i => i.id === boss.recompensaUnica);
                    logs.push(`🏅 Recompensa única: ${trofeu ? `${trofeu.emoji} ${trofeu.nome}` : boss.recompensaUnica}`);
                }

                if (boss.recompensaArma) {
                    adicionarItem(sender, boss.recompensaArma);
                    const armaDrop = LOJA_ITENS.legendarios.find(i => i.id === boss.recompensaArma);
                    logs.push(`🗡️ Arma do boss: ${armaDrop ? `${armaDrop.emoji} ${armaDrop.nome}` : boss.recompensaArma}`);
                }
            }
            
            // 📊 Leveling de itens
            const itemsLevelUP = adicionarXPEquipados(sender, xpGanho);
            
            let lootMsg = '';
            if (Math.random() * 100 < 30) {
                const legendarios = LOJA_ITENS.legendarios;
                const loot = legendarios[Math.floor(Math.random() * legendarios.length)];
                adicionarItem(sender, loot.id);
                lootMsg = `💎 LOOT: ${loot.emoji} ${loot.nome}`;
            }
            
            logs.push(``);
            logs.push(separador);
            logs.push(`👑 BOSS DERROTADO!`);
            logs.push(`⭐ XP: +${xpGanho} | 💰 Ouro: +${ouroGanho}`);
            if (lootMsg) logs.push(lootMsg);
            logs.push(`❤️ HP: ${playerHP}/${hpMaxPlayer}`);
            
            if (xpResult?.levelUp) {
                logs.push(`🎉 LEVEL UP! Lv${xpResult.player.level}`);
                verificarProgressoQuest(xpResult.player, 'levels_ganhos', 1);
            }

            updatePlayer(sender, { quests: player.quests, questsCompletadas: player.questsCompletadas });
            
            return reply(`${logs.join('\n')}`);
            
        } else if (playerHP <= 0) {
            modificarHP(sender, -player.hp);
            logs.push(``);
            logs.push(separador);
            logs.push(`💀 DERROTADO!`);
            logs.push(`Você foi derrotado pelo ${boss.nome}!`);
            logs.push(`Use *!curar* para reviver`);
            return reply(`${logs.join('\n')}`);
            
        }
    } catch (erro) {
        console.error('Erro em handleBoss:', erro);
        return reply(`❌ Erro: ${erro.message}`);
    }
}

// ==================== DISTRIBUIR PONTOS DE ATRIBUTO ====================

export async function handleSkill(sock, msg, jid, sender, cmdArgs, reply, react) {
    try {
        const player = getPlayer(sender);
        if (!player) {
            return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
        }
        
        const playerMig = migrarPersonagem(player);
        const pontos = playerMig.pontosAtributos || 0;
        
        if (pontos === 0) {
            await react('❌');
            const mensagem = `
╭─ 🎯 PONTOS DE ATRIBUTO ─╮
│
│ Você não tem pontos disponíveis!
│ Ganhe +3 pontos ao subir de level.
│
│ 📊 Atributos atuais:
│ ❤️ Vigor: ${playerMig.atributos.vigor}
│ 🛡️ Resistência: ${playerMig.atributos.resistencia}
│ 💪 Força: ${playerMig.atributos.forca}
│ 🏹 Destreza: ${playerMig.atributos.destreza}
│ 🧠 Inteligência: ${playerMig.atributos.inteligencia}
│ ✝️ Fé: ${playerMig.atributos.fe}
│ 🍀 Sorte: ${playerMig.atributos.sorte}
│
╰────────────────────────╯`;
            return reply(mensagem);
        }
        
        if (!cmdArgs || cmdArgs.trim() === '') {
            await react('📊');
            const mensagem = `
╭─ 🎯 DISTRIBUIR PONTOS ─╮
│
│ ⭐ Pontos disponíveis: ${pontos}
│
│ 📊 Atributos atuais:
│ ❤️ Vigor: ${playerMig.atributos.vigor}
│ 🛡️ Resistência: ${playerMig.atributos.resistencia}
│ 💪 Força: ${playerMig.atributos.forca}
│ 🏹 Destreza: ${playerMig.atributos.destreza}
│ 🧠 Inteligência: ${playerMig.atributos.inteligencia}
│ ✝️ Fé: ${playerMig.atributos.fe}
│ 🍀 Sorte: ${playerMig.atributos.sorte}
│
│ 💬 Uso:
│ *${CONFIG.PREFIX}skill vigor 1* - Adiciona 1 ponto
│ *${CONFIG.PREFIX}skill destreza 3* - Adiciona 3 pontos
│
│ 🏛️ Atributos válidos:
│ vigor, resistencia, forca, destreza, inteligencia, fe, sorte
│
╰────────────────────────╯`;
            return reply(mensagem);
        }
        
        const args = cmdArgs.trim().split(/\s+/);
        const atributo = args[0];
        const pontosSolicitados = parseInt(args[1]) || 1;
        
        if (pontosSolicitados <= 0) {
            return reply('❌ Quantidade deve ser maior que 0');
        }
        
        const resultado = distribuirPontoAtributo(sender, atributo, pontosSolicitados);
        
        if (resultado.erro) {
            return reply(`❌ ${resultado.erro}`);
        }
        
        await react('✅');
        
        const playerAtualizado = migrarPersonagem(getPlayer(sender));
        const mensagem = `
╭─ ✅ PONTO DISTRIBUÍDO ─╮
│
│ ${atributo.toUpperCase()}: ${resultado.novoValor - resultado.pontos} → ${resultado.novoValor}
│ 📈 +${resultado.pontos} ponto(s)
│
│ ⭐ Pontos restantes: ${resultado.pontosRestantes}
│
│ 📊 Seus atributos:
│ ❤️ Vigor: ${playerAtualizado.atributos.vigor}
│ 🛡️ Resistência: ${playerAtualizado.atributos.resistencia}
│ 💪 Força: ${playerAtualizado.atributos.forca}
│ 🏹 Destreza: ${playerAtualizado.atributos.destreza}
│ 🧠 Inteligência: ${playerAtualizado.atributos.inteligencia}
│ ✝️ Fé: ${playerAtualizado.atributos.fe}
│ 🍀 Sorte: ${playerAtualizado.atributos.sorte}
│
╰────────────────────────╯`;
        return reply(mensagem);
        
    } catch (erro) {
        console.error('Erro em handleSkill:', erro);
        return reply(`❌ Erro: ${erro.message}`);
    }
}
