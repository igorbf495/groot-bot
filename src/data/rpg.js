import fs from 'fs';
import path from 'path';

// ==================== CONFIGURACAO RPG D20 ====================

const DATA_DIR = path.join(process.cwd(), 'data');
const RPG_FILE = path.join(DATA_DIR, 'rpg.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==================== SISTEMA DE LEVELING DE ITENS ====================
const ITEM_BONUS_PER_LEVEL = 0.05; // 5% por nível
const ITEM_MAX_LEVEL = 500;

// Gating por faixa de nível de item
// 1-3: livre; 4-6: requer pedra rara e level mínimo do jogador; 7-10: pedra de boss e level maior
const UPGRADE_GATES = [
    { maxLevel: 3, minPlayerLevel: 1, pedraKey: null, pedraNome: null },
    { maxLevel: 6, minPlayerLevel: 5, pedraKey: 'rara', pedraNome: 'Pedra Rara' },
    { maxLevel: ITEM_MAX_LEVEL, minPlayerLevel: 10, pedraKey: 'boss', pedraNome: 'Pedra de Boss' },
];

function encontrarItemPorId(itemId) {
    let item = LOJA_ITENS.armas.find(i => i.id === itemId);
    if (!item) item = LOJA_ITENS.armaduras.find(i => i.id === itemId);
    if (!item) item = LOJA_ITENS.consumiveis?.find?.(i => i.id === itemId);
    return item || null;
}

function calcularCustoUpgrade(itemId, levelAtual = 0) {
    const item = encontrarItemPorId(itemId);
    const precoBase = item?.preco || 200;
    return Math.max(100, Math.floor(precoBase * (1 + levelAtual) * 0.5));
}

// ==================== NARRACOES DE COMBATE ====================

export const NARRACOES = {
    // Inicio de batalha
    encontro: [
        '⚡ *Você ouve um barulho nas sombras...* As trevas se movem com propósito maligno...',
        '🌍 *O chão treme sob seus pés...* Algo antigo e poderoso despertou!',
        '🔥 *Um rugido ecoa* que faz os pelos de sua nuca se arrepiar de puro horror...',
        '👁️ *Dois olhos vermelhos brilham* na escuridão... O inimigo se aproxima!',
        '😰 *Você sente uma presença hostil...* O ar fica carregado de magia arcana!',
        '❄️ *O ar fica gelado* de repente... Uma maldição permeia este lugar!'
    ],
    
    // Acertos normais
    acerto: [
        '💢 *Seu golpe conecta com precisão cirúrgica!* O inimigo recua cambaleante!',
        '⚔️ *Um ataque certeiro ecoa pelo campo de batalha!* Sangue respinga no ar!',
        '💥 *Você acerta em cheio!* Seu oponente grita de dor!',
        '😵 *O inimigo cambaleia com o impacto devastador!* Ele luta para manter o equilíbrio!',
        '🎯 *Golpe preciso!* Sua lâmina encontra um ponto fraco na armadura!'
    ],
    
    // Criticos
    critico: [
        '🌟 *GOLPE DEVASTADOR!!!* Sua arma brilha com poder ancestral enquanto destrói a defesa do inimigo!',
        '⚡ *Um ataque LETAL que ressoa através dos reinos!* O inimigo cai de joelhos, ferido mortalmente!',
        '💫 *Você encontra uma brecha na defesa!* Seu ataque perfura direto no coração!',
        '🔥 *IMPACTO BRUTAL QUE ABALA O CHÃO!* O inimigo voa para trás, deixando um rastro de sangue!',
        '🎆 *O golpe ressoa pelo campo de batalha como o raio de um deus!* Uma explosão de energia!',
        '👑 *GOLPE CRÍTICO DE MESTRE!* Suas habilidades alcançam patamares impossíveis!'
    ],
    
    // Erros
    erro: [
        '😅 *Seu ataque passa raspando...* O inimigo ri da sua tentativa fracassada!',
        '⏱️ *O inimigo desvia no último segundo!* Com uma graça quase sobrenatural!',
        '❌ *Você erra por pouco!* Um reflexo do seu adversário salvou sua vida!',
        '💨 *O golpe encontra apenas ar...* Seu inimigo se move como sombra!',
        '🤸 *O inimigo esquiva habilmente!* Com um movimento de dançarino!'
    ],
    
    // Falha critica
    falhaCritica: [
        '🤦 *DESASTRE! Você tropeca feio!* Cai de costas no chão, desajeitado!',
        '💀 *Seu golpe sai COMPLETAMENTE errado!* Você quase se apuñala com sua própria arma!',
        '😱 *Você perde o equilíbrio gloriosamente!* Seu inimigo não consegue conter o riso!',
        '🙈 *QUE DESASTRE! Você se atrapalha feio!* Sua armadura faz barulhos ridículos!',
        '😤 *Uma falha vergonhosa que ecoará nos anais da história!* Você cai desajeitadamente!',
        '🤕 *FALHA CRÍTICA HUMILHANTE!* Você se machuca ao tentar atacar!'
    ],
    
    // Monstro acerta
    monstroAcerta: [
        '⚡ *O inimigo te golpeia com fúria primitiva!* Você sente ossos rangendo!',
        '😵 *Você recebe um ataque doloroso que atravessa sua defesa!* Escuridão toma sua visão!',
        '💥 *O monstro conecta um golpe devastador!* Você é arremessado para trás!',
        '😤 *Você não consegue desviar a tempo!* A dor é aguda e insuportável!',
        '🤕 *Um golpe te atinge em cheio!* Seu corpo inteiro dói intensamente!'
    ],
    
    // Monstro erra
    monstroErra: [
        '🤸 *Você desvia do ataque com maestria!* Sua reflexão é perfeita!',
        '😂 *O monstro erra feio!* Como se tivesse dois olhos esquerdos!',
        '⏱️ *Você esquiva no último instante!* Por um fio de cabelo!',
        '💨 *O ataque passa longe!* Você sente o ar quente passar por sua pele!',
        '🛡️ *Você se defende com sucesso!* Sua técnica é impecável!'
    ],
    
    // Monstro fraco (HP baixo)
    monstroFraco: [
        '🩹 *O monstro está gravemente ferido!* Você pode ver a morte em seus olhos!',
        '😰 *O inimigo respira pesado, desesperado!* O final está próximo!',
        '💔 *O monstro cambaleia perigosamente na beira do abismo!* Um golpe é tudo que falta!',
        '⚠️ *O inimigo está em desvantagem crítica!* Ele não durará muito!',
        '🔴 *O monstro está à beira da morte!* Sua aura de poder desvanece!'
    ],
    
    // Jogador em perigo
    perigo: [
        '⚠️ *VOCÊ ESTÁ EM PERIGO MORTAL!* A morte o ronda como uma sombra!',
        '💔 *Sua saúde está crítica!* Você mal consegue se mover!',
        '😰 *Você sente a morte próxima...* Como um abraço gelado se aproximando!',
        '🆘 *VOCÊ PRECISA REAGIR AGORA!* Ou tudo estará perdido!',
        '🔴 *Está à beira do abismo!* Um golpe pode ser o fim!'
    ],
    
    // Vitoria
    vitoria: [
        '🏆 *O inimigo cai derrotado aos seus pés!* A vitória é sua!',
        '👑 *Você triunfa sobre seu oponente!* O bardo já canta sua epopeia!',
        '✨ *A batalha termina com sua glória!* Você emerge vitorioso do caos!',
        '💀 *O monstro tomba sem vida!* Sua alma parte para além do véu!',
        '🎉 *Você emerge vitorioso!* Sua lenda cresce na história!'
    ],
    
    // Derrota
    derrota: [
        '⚫ *A escuridão consome sua visão...* Você sente a vida escapar de seu corpo...',
        '💀 *Você cai derrotado...* Seu poder não foi suficiente...',
        '😵 *Suas forças se esvaziam...* Você sente o vazio da derrota...',
        '🌙 *O mundo escurece ao seu redor...* A esperança se extingue...',
        '💔 *Você não aguenta mais...* A fadiga toma conta de seu ser...'
    ],
    
    // Duelo - inicio
    dueloInicio: [
        '⚔️ *Os dois combatentes se encaram...* Tensão crackles no ar entre eles!',
        '😤 *A tensão paira no ar como um espectro invisível!* Ambos estão prontos para o combate!',
        '🏆 *Um duelo de honra começa!* Apenas um deixará este campo de batalha!',
        '⚡ *As lâminas são desembainhadas com silvado de aço!* O confronto está prestes a começar!',
        '🔥 *O confronto está prestes a começar!* Duas almas lutarão pela glória!'
    ],
    
    // Duelo - vitoria
    dueloVitoria: [
        '👑 *Um combate honrado e você emergiu VITORIOSO!* Sua lenda cresce entre os guerreiros!',
        '😵 *O oponente cai de joelhos derrotado!* Você provou ser o melhor!',
        '🌟 *Vitória esmagadora que ecoa por todas as terras!* Seu nome será lembrado!',
        '💪 *Você provou ser superior em combate!* O outro guerreiro reconhece sua derrota!',
        '🏆 *O duelo termina com sua GLÓRIA!* Você é o campeão!'
    ],
    
    // Duelo - derrota
    dueloDerrota: [
        '💔 *Você foi superado por um oponente mais forte...* A derrota queima em seu coração!',
        '⚡ *Seu oponente era forte demais...* Você aprenderá desta lição!',
        '😞 *A derrota é amarga...* Mas você sobreviveu para lutar novamente!',
        '💪 *Você precisa treinar muito mais...* O próximo duelo será diferente!',
        '⚔️ *Uma batalha difícil contra um oponente digno...* Você segue em frente!'
    ]
};

// Funcao para pegar narracao aleatoria
export function getNarracao(tipo) {
    const lista = NARRACOES[tipo];
    if (!lista) return '';
    return lista[Math.floor(Math.random() * lista.length)];
}

// ==================== RACAS ====================

export const RACAS = {
    humano: {
        nome: 'Humano',
        emoji: '👤',
        descricao: 'Versatil e adaptavel',
        bonus: { forca: 1, destreza: 1, inteligencia: 1, sorte: 1 },
        habilidade: 'Versatil: +15% XP ganho',
        xpBonus: 1.15
    },
    elfo: {
        nome: 'Elfo',
        emoji: '🧝',
        descricao: 'Agil e perceptivo',
        bonus: { destreza: 3, inteligencia: 1 },
        habilidade: 'Precisao Elfica: +10% chance de critico',
        criticoBonus: 10
    },
    anao: {
        nome: 'Anao',
        emoji: '⛏️',
        descricao: 'Resistente e forte',
        bonus: { forca: 2, destreza: -1, inteligencia: 0, sorte: 0 },
        habilidade: 'Resistencia: +25% HP maximo',
        hpBonus: 1.25
    },
    orc: {
        nome: 'Orc',
        emoji: '👹',
        descricao: 'Brutal e poderoso',
        bonus: { forca: 4, destreza: 0, inteligencia: -2, sorte: 0 },
        habilidade: 'Furia: +30% dano quando HP < 30%',
        furiaBonus: 1.3
    },
    vampiro: {
        nome: 'Vampiro',
        emoji: '🧛',
        descricao: 'Imortal sedento por sangue',
        bonus: { forca: 2, destreza: 2, inteligencia: 1, sorte: -1 },
        habilidade: 'Drenar Vida: Recupera 25% do dano causado como HP',
        drenarVida: 0.25
    }
};

// ==================== CLASSES ====================

export const CLASSES = {
    guerreiro: {
        nome: 'Guerreiro',
        emoji: '⚔️',
        descricao: 'Mestre do combate corpo a corpo',
        hitDie: 10, // d10 para HP
        atributoPrincipal: 'forca',
        bonus: { forca: 2, destreza: 0, inteligencia: 0, sorte: 0 },
        habilidade: 'Golpe Poderoso: Chance de dano +50%',
        chanceHabilidade: 20
    },
    mago: {
        nome: 'Mago',
        emoji: '🧙',
        descricao: 'Mestre das artes arcanas',
        hitDie: 6, // d6 para HP
        atributoPrincipal: 'inteligencia',
        bonus: { forca: -1, destreza: 0, inteligencia: 3, sorte: 1 },
        habilidade: 'Bola de Fogo: Usa INT para ataque e dano (x1.2 bônus)',
        usaInteligencia: true,
        bonosDanoInt: 1.2 // 20% de bônus extra no dano por INT
    },
    ladino: {
        nome: 'Ladino',
        emoji: '🗡️',
        descricao: 'Mestre da furtividade',
        hitDie: 8, // d8 para HP
        atributoPrincipal: 'destreza',
        bonus: { forca: 0, destreza: 3, inteligencia: 0, sorte: 1 },
        habilidade: 'Ataque Furtivo: Critico causa x3 dano',
        criticoMultiplicador: 3
    },
    clerigo: {
        nome: 'Clerigo',
        emoji: '✝️',
        descricao: 'Curandeiro divino',
        hitDie: 8,
        atributoPrincipal: 'fe',
        bonus: { forca: 0, destreza: 0, inteligencia: 0, fe: 2, sorte: 2 },
        habilidade: 'Cura Divina: +20% HP ao vencer + FE no dano',
        curaAoVencer: 0.2
    },
    arqueiro: {
        nome: 'Arqueiro',
        emoji: '🏹',
        descricao: 'Mestre do combate a distancia',
        hitDie: 8,
        atributoPrincipal: 'destreza',
        bonus: { forca: 0, destreza: 3, inteligencia: 1, sorte: 0 },
        habilidade: 'Tiro Certeiro: +15% chance de critico',
        criticoBonus: 15
    }
};

// ==================== AFINIDADES / ESCALONAMENTO À LA ELDEN RING ====================

// Afinidades inspiradas nos caminhos de infusão de Elden Ring.
const AFINIDADES_ELDEN = {
    pesado: { escala: { forca: 1.0, destreza: 0.1 }, bonusDanoPercent: 0.06 },
    agil: { escala: { destreza: 1.0, forca: 0.2, sorte: 0.2 }, bonusDanoPercent: 0.03 },
    qualidade: { escala: { forca: 0.7, destreza: 0.7 }, bonusDanoPercent: 0.04 },
    int: { escala: { inteligencia: 1.0, destreza: 0.2 }, bonusDanoPercent: 0.05 },
    fe: { escala: { fe: 1.0, forca: 0.2 }, bonusDanoPercent: 0.05 },
    sangue: { escala: { destreza: 0.8, sorte: 0.4 }, bonusDanoPercent: 0.03 },
    veneno: { escala: { destreza: 0.7, inteligencia: 0.4 }, bonusDanoPercent: 0.02 },
    fogo: { escala: { forca: 0.6, inteligencia: 0.6 }, bonusDanoPercent: 0.04 },
    raio: { escala: { destreza: 0.6, inteligencia: 0.6 }, bonusDanoPercent: 0.04 },
    gelo: { escala: { inteligencia: 0.85, destreza: 0.35 }, bonusDanoPercent: 0.035 }
};

// Fallback de escala caso a arma não tenha afinidade explícita.
const ESCALA_PADRAO_CLASSE = {
    guerreiro: { forca: 0.9, destreza: 0.3 },
    ladino: { destreza: 0.9, forca: 0.2, sorte: 0.2 },
    mago: { inteligencia: 1.0, destreza: 0.2 },
    clerigo: { fe: 1.0, forca: 0.2 },
    arqueiro: { destreza: 1.0, forca: 0.2 }
};

function inferirAfinidade(arma, playerClasse) {
    if (!arma) return null;
    if (arma.afinidade) return arma.afinidade;
    if (arma.debuff === 'sangramento') return 'sangue';
    if (arma.debuff === 'veneno') return 'veneno';
    if (arma.danoExtra === 'fogo') return 'fogo';
    if (arma.danoExtra === 'raio') return 'raio';
    if (arma.danoExtra === 'frio') return 'gelo';
    if (arma.magico) return 'int';
    if (arma.classe === 'clerigo') return 'fe';
    if (arma.classe === 'mago') return 'int';
    if (arma.classe === 'ladino' || arma.classe === 'arqueiro') return 'agil';
    if (arma.classe === 'guerreiro') return 'pesado';
    if (playerClasse === 'ladino' || playerClasse === 'arqueiro') return 'agil';
    if (playerClasse === 'mago') return 'int';
    if (playerClasse === 'clerigo') return 'fe';
    return 'qualidade';
}

function getEscalaArma(arma, playerClasse) {
    const afinidade = inferirAfinidade(arma, playerClasse);
    const baseEscala = {
        forca: arma?.escalaFor || 0,
        destreza: arma?.escalaDes || 0,
        inteligencia: arma?.escalaInt || 0,
        fe: arma?.escalaFe || 0,
        sorte: arma?.escalaSorte || 0
    };
    const afinidadeEscala = afinidade ? AFINIDADES_ELDEN[afinidade]?.escala : null;
    const classeEscala = playerClasse ? ESCALA_PADRAO_CLASSE[playerClasse] : null;
    const escalaFinal = { ...baseEscala };
    ['forca', 'destreza', 'inteligencia', 'fe', 'sorte'].forEach(attr => {
        const fallback = afinidadeEscala?.[attr] ?? classeEscala?.[attr] ?? 0;
        if (!escalaFinal[attr] || escalaFinal[attr] < fallback) {
            escalaFinal[attr] = fallback;
        }
    });
    return { escala: escalaFinal, afinidade };
}

// ==================== MONSTROS COM CR ====================

// Monstros rebalanceados (CR = Challenge Rating)
// Os atributos foram ajustados para proporcionar uma curva de dificuldade mais suave.
// HP (Hit Points): Reduzido para permitir combates mais curtos e menos punitivos.
// CA (Armor Class): Ajustado para que os ataques do jogador tenham uma chance razoável de acerto.
// bonusAtaque: Reduzido para diminuir a frequência e o dano dos ataques do monstro.
// dano: Reduzido para evitar que o jogador seja derrotado rapidamente.
// xp e ouro: Ajustados para serem proporcionais ao novo nível de dificuldade.
export const MONSTROS = [
    // CR 1/8 (Level 1-2) - Fácil
    // Ideal para jogadores recém-criados, oferece um primeiro contato com o combate.
    { 
        nome: 'Rato Gigante', 
        emoji: '🐀', 
        cr: 0.125, // Challenge Rating: 1/8
        hp: 12,    // Aumentado para mais desafio
        ca: 13,    // CA aumentada
        bonusAtaque: 2, // Bônus aumentado
        dano: '1d4',   // Dano aumentado
        xp: 25,    // XP ajustado
        ouro: 35    // Ouro ajustado
    },

    // CR 1/8 (Level 1-2) - Fácil - Alternativo
    { 
        nome: 'Aranha Venenosa', 
        emoji: '🕷️', 
        cr: 0.125,
        hp: 14,
        ca: 14,
        bonusAtaque: 2,
        dano: '1d5',
        xp: 30,
        ouro: 40
    },
    { 
        nome: 'Morcego das Cavernas', 
        emoji: '🦇', 
        cr: 0.125,
        hp: 11,
        ca: 13,
        bonusAtaque: 2,
        dano: '1d4',
        xp: 26,
        ouro: 32
    },
    { 
        nome: 'Besouro Carapaca', 
        emoji: '🐞', 
        cr: 0.125,
        hp: 16,
        ca: 12,
        bonusAtaque: 2,
        dano: '1d4+1',
        xp: 28,
        ouro: 34
    },
    { 
        nome: 'Lodo Decomposto', 
        emoji: '🟢', 
        cr: 0.125,
        hp: 18,
        ca: 11,
        bonusAtaque: 1,
        dano: '1d4',
        xp: 24,
        ouro: 30
    },
    { 
        nome: 'Serpente de Rio', 
        emoji: '🐍', 
        cr: 0.125,
        hp: 15,
        ca: 13,
        bonusAtaque: 2,
        dano: '1d4+1',
        xp: 27,
        ouro: 33
    },
    
    // CR 1/4 (Level 1-3) - Moderado
    // Um passo acima, introduzindo um pouco mais de resistência e dano.
    { 
        nome: 'Goblin', 
        emoji: '👺', 
        cr: 0.25,  // Challenge Rating: 1/4
        hp: 25,    // HP aumentado
        ca: 13,    // CA aumentada
        bonusAtaque: 3, // Bônus aumentado
        dano: '1d6', 
        xp: 50,    // XP ajustado
        ouro: 60    // Ouro ajustado
    },

    // CR 1/4 (Level 1-3) - Moderado - Alternativo
    { 
        nome: 'Lobo Selvagem', 
        emoji: '🐺', 
        cr: 0.25,
        hp: 28,
        ca: 14,
        bonusAtaque: 3,
        dano: '1d6+1',
        xp: 55,
        ouro: 65
    },
    { 
        nome: 'Kobold Arqueiro', 
        emoji: '🏹', 
        cr: 0.25,
        hp: 24,
        ca: 13,
        bonusAtaque: 4,
        dano: '1d6',
        xp: 52,
        ouro: 58
    },
    { 
        nome: 'Bandido Novato', 
        emoji: '🗡️', 
        cr: 0.25,
        hp: 30,
        ca: 12,
        bonusAtaque: 3,
        dano: '1d6+1',
        xp: 54,
        ouro: 70
    },
    { 
        nome: 'Javali Irritado', 
        emoji: '🐗', 
        cr: 0.25,
        hp: 32,
        ca: 12,
        bonusAtaque: 3,
        dano: '1d6+2',
        xp: 56,
        ouro: 66
    },
    { 
        nome: 'Zumbi Tropego', 
        emoji: '🧟', 
        cr: 0.25,
        hp: 34,
        ca: 11,
        bonusAtaque: 2,
        dano: '1d6',
        xp: 50,
        ouro: 55
    },
    
    // CR 1/2 (Level 3-5) - Desafiador
    // Para jogadores que já ganharam alguns níveis e equipamentos.
    { 
        nome: 'Orc', 
        emoji: '👹', 
        cr: 0.5,   // Challenge Rating: 1/2
        hp: 35,    // HP aumentado
        ca: 13,    // CA aumentada
        bonusAtaque: 4, // Bônus aumentado
        dano: '1d8', // Dano aumentado
        xp: 110,    // XP ajustado
        ouro: 120   // Ouro ajustado
    },

    // CR 1/2 (Level 3-5) - Desafiador - Alternativo
    { 
        nome: 'Troll Robusto', 
        emoji: '🗿', 
        cr: 0.5,
        hp: 45,
        ca: 12,
        bonusAtaque: 4,
        dano: '1d8+1',
        xp: 120,
        ouro: 130
    },
    { 
        nome: 'Gnoll Cacador', 
        emoji: '🐺⚔️', 
        cr: 0.5,
        hp: 42,
        ca: 13,
        bonusAtaque: 5,
        dano: '1d8',
        xp: 115,
        ouro: 125
    },
    { 
        nome: 'Esqueleto Guerreiro', 
        emoji: '💀🛡️', 
        cr: 0.5,
        hp: 38,
        ca: 14,
        bonusAtaque: 4,
        dano: '1d8',
        xp: 112,
        ouro: 118
    },
    { 
        nome: 'Harpia Ruidosa', 
        emoji: '🦅', 
        cr: 0.5,
        hp: 36,
        ca: 13,
        bonusAtaque: 4,
        dano: '1d8+1',
        xp: 118,
        ouro: 122
    },
    { 
        nome: 'Lacertoide Saqueador', 
        emoji: '🦎', 
        cr: 0.5,
        hp: 40,
        ca: 13,
        bonusAtaque: 4,
        dano: '1d8',
        xp: 116,
        ouro: 124
    },
    
    // CR 1 (Level 5-7) - Difícil
    // Representa um desafio significativo, exigindo um personagem mais desenvolvido.
    { 
        nome: 'Ogro', 
        emoji: '👾', 
        cr: 1,     // Challenge Rating: 1
        hp: 70,    // HP aumentado
        ca: 12,    // CA aumentada
        bonusAtaque: 5, // Bônus aumentado
        dano: '1d10+2', // Dano aumentado
        xp: 300,   // XP ajustado
        ouro: 180   // Ouro ajustado
    },

    // CR 1 (Level 5-7) - Difícil - Alternativo
    { 
        nome: 'Dragao Jovem', 
        emoji: '🐉', 
        cr: 1,
        hp: 85,
        ca: 14,
        bonusAtaque: 5,
        dano: '2d8',
        xp: 350,
        ouro: 250
    },
    { 
        nome: 'Minotauro Jovem', 
        emoji: '🐂', 
        cr: 1,
        hp: 90,
        ca: 13,
        bonusAtaque: 6,
        dano: '1d12+2',
        xp: 320,
        ouro: 260
    },
    { 
        nome: 'Homem-Urso', 
        emoji: '🐻', 
        cr: 1,
        hp: 88,
        ca: 12,
        bonusAtaque: 6,
        dano: '2d6+2',
        xp: 310,
        ouro: 240
    },
    { 
        nome: 'Golem de Madeira', 
        emoji: '🪵', 
        cr: 1,
        hp: 95,
        ca: 15,
        bonusAtaque: 5,
        dano: '1d10+1',
        xp: 330,
        ouro: 270
    },
    { 
        nome: 'Capitao Pirata', 
        emoji: '🏴‍☠️', 
        cr: 1,
        hp: 82,
        ca: 14,
        bonusAtaque: 6,
        dano: '1d10+2',
        xp: 340,
        ouro: 280
    },

    // CR 1.5 (Level 7-9) - Desafiador+
    { 
        nome: 'Cavaleiro Negro',
        emoji: '⚫⚔️',
        cr: 1.5,
        hp: 95,
        ca: 15,
        bonusAtaque: 6,
        dano: '1d10+2',
        xp: 420,
        ouro: 260
    },
    { 
        nome: 'Arqueiro Sombrio',
        emoji: '🏹🌑',
        cr: 1.5,
        hp: 88,
        ca: 16,
        bonusAtaque: 7,
        dano: '1d10+1',
        xp: 410,
        ouro: 255
    },
    { 
        nome: 'Medusa Menor',
        emoji: '🐍👁️',
        cr: 1.5,
        hp: 92,
        ca: 15,
        bonusAtaque: 6,
        dano: '1d10+2',
        xp: 430,
        ouro: 270
    },
    { 
        nome: 'Abominacao Costurada',
        emoji: '🧟‍♂️',
        cr: 1.5,
        hp: 105,
        ca: 14,
        bonusAtaque: 6,
        dano: '2d6+2',
        xp: 440,
        ouro: 275
    },
    { 
        nome: 'Salamandra Escarlate',
        emoji: '🦎🔥',
        cr: 1.5,
        hp: 90,
        ca: 15,
        bonusAtaque: 7,
        dano: '2d6+1',
        xp: 425,
        ouro: 265
    },
    { 
        nome: 'Guardiao Runico',
        emoji: '🔷',
        cr: 1.5,
        hp: 98,
        ca: 16,
        bonusAtaque: 6,
        dano: '1d10+3',
        xp: 435,
        ouro: 280
    },

    // CR 2 (Level 9-11) - Difícil
    { 
        nome: 'Mantícora Jovem',
        emoji: '🦁🦂',
        cr: 2,
        hp: 120,
        ca: 15,
        bonusAtaque: 7,
        dano: '2d8+2',
        xp: 600,
        ouro: 350
    },
    { 
        nome: 'Ogro Xama',
        emoji: '👹🔥',
        cr: 2,
        hp: 125,
        ca: 14,
        bonusAtaque: 7,
        dano: '2d8+3',
        xp: 610,
        ouro: 360
    },
    { 
        nome: 'Wyvern Esbelto',
        emoji: '🐉',
        cr: 2,
        hp: 118,
        ca: 15,
        bonusAtaque: 8,
        dano: '2d8+2',
        xp: 620,
        ouro: 370
    },
    { 
        nome: 'Gargula Viva',
        emoji: '🗿🪽',
        cr: 2,
        hp: 122,
        ca: 16,
        bonusAtaque: 7,
        dano: '2d8+1',
        xp: 605,
        ouro: 355
    },
    { 
        nome: 'Aranha Gigante Alfa',
        emoji: '🕷️👑',
        cr: 2,
        hp: 128,
        ca: 14,
        bonusAtaque: 7,
        dano: '2d8+2',
        xp: 615,
        ouro: 365
    },
    { 
        nome: 'Cavaleiro da Prata',
        emoji: '⚔️🛡️',
        cr: 2,
        hp: 130,
        ca: 17,
        bonusAtaque: 8,
        dano: '2d8+3',
        xp: 630,
        ouro: 380
    },

    // CR 2.5 (Level 11-13) - Muito difícil
    { 
        nome: 'Elemental de Fogo',
        emoji: '🔥',
        cr: 2.5,
        hp: 135,
        ca: 16,
        bonusAtaque: 8,
        dano: '2d10',
        xp: 750,
        ouro: 420
    },
    { 
        nome: 'Elemental de Gelo',
        emoji: '❄️',
        cr: 2.5,
        hp: 140,
        ca: 16,
        bonusAtaque: 8,
        dano: '2d10',
        xp: 760,
        ouro: 430
    },
    { 
        nome: 'Demonio Menor',
        emoji: '😈',
        cr: 2.5,
        hp: 145,
        ca: 15,
        bonusAtaque: 9,
        dano: '2d10+2',
        xp: 780,
        ouro: 450
    },
    { 
        nome: 'Ettin Jovem',
        emoji: '👹👹',
        cr: 2.5,
        hp: 150,
        ca: 14,
        bonusAtaque: 9,
        dano: '2d10+3',
        xp: 770,
        ouro: 440
    },
    { 
        nome: 'Espirito da Tempestade',
        emoji: '🌩️',
        cr: 2.5,
        hp: 138,
        ca: 17,
        bonusAtaque: 8,
        dano: '2d10+1',
        xp: 765,
        ouro: 435
    },
    { 
        nome: 'Hidra Juvenil',
        emoji: '🐍🐍',
        cr: 2.5,
        hp: 155,
        ca: 15,
        bonusAtaque: 9,
        dano: '2d10+2',
        xp: 790,
        ouro: 455
    },

    // CR 3 (Level 13-15) - Elite
    { 
        nome: 'Gigante de Pedra',
        emoji: '🗿',
        cr: 3,
        hp: 170,
        ca: 17,
        bonusAtaque: 9,
        dano: '2d12',
        xp: 950,
        ouro: 500
    },
    { 
        nome: 'Troll de Montanha',
        emoji: '🧌',
        cr: 3,
        hp: 180,
        ca: 16,
        bonusAtaque: 9,
        dano: '2d12',
        xp: 960,
        ouro: 510
    },
    { 
        nome: 'Golem de Ferro Runico',
        emoji: '🪨🔷',
        cr: 3,
        hp: 185,
        ca: 18,
        bonusAtaque: 10,
        dano: '2d12+1',
        xp: 980,
        ouro: 530
    },
    { 
        nome: 'Quimera Venenosa',
        emoji: '🐍🦁',
        cr: 3,
        hp: 175,
        ca: 17,
        bonusAtaque: 9,
        dano: '2d12+1',
        xp: 970,
        ouro: 520
    },
    { 
        nome: 'Beholder Escolio',
        emoji: '👁️',
        cr: 3,
        hp: 165,
        ca: 18,
        bonusAtaque: 10,
        dano: '2d12',
        xp: 990,
        ouro: 540
    },
    { 
        nome: 'Dragao das Areias',
        emoji: '🐉🏜️',
        cr: 3,
        hp: 178,
        ca: 17,
        bonusAtaque: 10,
        dano: '2d12+2',
        xp: 1000,
        ouro: 550
    },

    // CR 3.5 (Level 15-17) - Mago elitizado
    { 
        nome: 'Lich Aprendiz',
        emoji: '💀✨',
        cr: 3.5,
        hp: 140,
        ca: 15,
        bonusAtaque: 9,
        dano: '2d10+3',
        xp: 1150,
        ouro: 650
    },
    { 
        nome: 'Necromante Veterano',
        emoji: '📜💀',
        cr: 3.5,
        hp: 150,
        ca: 16,
        bonusAtaque: 10,
        dano: '2d10+4',
        xp: 1170,
        ouro: 670
    },
    { 
        nome: 'Espectro de Guerra',
        emoji: '👻⚔️',
        cr: 3.5,
        hp: 145,
        ca: 17,
        bonusAtaque: 10,
        dano: '2d10+3',
        xp: 1160,
        ouro: 660
    },
    { 
        nome: 'Sucubo Arcanista',
        emoji: '👠😈',
        cr: 3.5,
        hp: 142,
        ca: 16,
        bonusAtaque: 9,
        dano: '2d10+3',
        xp: 1180,
        ouro: 680
    },
    { 
        nome: 'Arquidruida Corrompido',
        emoji: '🌿⚠️',
        cr: 3.5,
        hp: 148,
        ca: 17,
        bonusAtaque: 10,
        dano: '2d10+4',
        xp: 1190,
        ouro: 690
    },
    { 
        nome: 'Elemental de Terra Anciao',
        emoji: '🪨🌋',
        cr: 3.5,
        hp: 155,
        ca: 17,
        bonusAtaque: 10,
        dano: '2d10+4',
        xp: 1200,
        ouro: 700
    },

    // CR 4 (Level 17-20) - Chefe de campo
    { 
        nome: 'Dragao Adulto Pequeno',
        emoji: '🐲',
        cr: 4,
        hp: 210,
        ca: 18,
        bonusAtaque: 10,
        dano: '3d10',
        xp: 1500,
        ouro: 900
    },
    { 
        nome: 'Quimera Ancia',
        emoji: '🦁🐍🦅',
        cr: 4,
        hp: 215,
        ca: 18,
        bonusAtaque: 11,
        dano: '3d10+2',
        xp: 1550,
        ouro: 920
    },
    { 
        nome: 'Golem Colossal',
        emoji: '🗿💠',
        cr: 4,
        hp: 230,
        ca: 19,
        bonusAtaque: 11,
        dano: '3d10+1',
        xp: 1580,
        ouro: 940
    },
    { 
        nome: 'Fenix Sombria',
        emoji: '🔥🦅',
        cr: 4,
        hp: 205,
        ca: 19,
        bonusAtaque: 10,
        dano: '3d10+2',
        xp: 1520,
        ouro: 910
    },
    { 
        nome: 'Kraken Jovem',
        emoji: '🐙',
        cr: 4,
        hp: 225,
        ca: 18,
        bonusAtaque: 11,
        dano: '3d10+3',
        xp: 1600,
        ouro: 950
    },
    { 
        nome: 'Gigante Treme-Terra',
        emoji: '🧌🌍',
        cr: 4,
        hp: 235,
        ca: 17,
        bonusAtaque: 11,
        dano: '3d10+2',
        xp: 1620,
        ouro: 960
    }
];

// ==================== ESCALAMENTO DE DIFICULDADE ====================

/**
 * Escala os stats de um monstro baseado no nível do jogador
 * Quanto maior o nível do jogador, mais forte o monstro fica
 * @param {Object} monstro - Monstro base
 * @param {number} playerLevel - Nível do jogador
 * @param {number} monstrosDerrotados - Quantidade de monstros já derrotados
 * @returns {Object} Monstro escalado
 */
export function escalarMonstro(monstro, playerLevel, monstrosDerrotados = 0) {
    const monstroEscalado = { ...monstro };
    
    // Multiplicador baseado no nível do jogador
    // A cada 2 níveis, o monstro fica ~10% mais forte
    const multiplicadorNivel = 1 + (playerLevel / 20);
    
    // Multiplicador baseado em monstros já derrotados
    // A cada 5 monstros derrotados, +3% de dificuldade
    const multiplicadorProgresso = 1 + (monstrosDerrotados * 0.03 / 5);

    // Boost para personagens de level alto (caçadas ficam mais punitivas em níveis elevados)
    const multiplicadorHighLevel = playerLevel >= 10
        ? 1 + Math.min(0.03 * (playerLevel - 10), 0.6)
        : 1;

    // Boost extra para fim de jogo (level 18+)
    const multiplicadorEndgame = playerLevel >= 18
        ? Math.min(1.45, 1.15 + (playerLevel - 18) * 0.02)
        : 1;
    
    // Multiplicador final (combina todos os fatores)
    const multiplicadorTotal = multiplicadorNivel * multiplicadorProgresso * multiplicadorHighLevel * multiplicadorEndgame;
    
    // Escalar HP (aumenta linearmente)
    monstroEscalado.hp = Math.ceil(monstro.hp * multiplicadorTotal);
    
    // Escalar Bônus de Ataque (aumenta 1 a cada 3 níveis + ajuste para níveis altos)
    const bonusAtaqueBase = monstro.bonusAtaque + Math.floor(playerLevel / 3);
    const bonusAtaqueHighLevel = Math.floor(playerLevel / 8);
    monstroEscalado.bonusAtaque = Math.max(
        monstro.bonusAtaque,
        bonusAtaqueBase + bonusAtaqueHighLevel
    );
    
    // Escalar CA (aumenta 1 a cada 4 níveis, máximo +5) + pequeno reforço em níveis altos
    const caBonusBase = Math.min(5, Math.floor(playerLevel / 4));
    const caBonusHighLevel = Math.min(2, Math.floor(playerLevel / 12));
    monstroEscalado.ca = monstro.ca + caBonusBase + caBonusHighLevel;
    
    // Escalar Dano (aumenta o modificador de dano)
    if (typeof monstro.dano === 'string') {
        try {
            // Verifica se tem + ou -
            const temModificador = monstro.dano.includes('+') || (monstro.dano.includes('-') && !monstro.dano.match(/^(\d+)d(\d+)$/));
            
            if (temModificador) {
                const parts = monstro.dano.split('+');
                let danoBase = parts[0]; // ex: "1d8"
                let modificador = parts[1] ? parseInt(parts[1]) : 0;
                
                // Aumenta modificador progressivamente (escala mais para níveis altos)
                const danoBonus = Math.floor(playerLevel / 5) + Math.floor(playerLevel / 10);
                modificador += danoBonus;
                
                monstroEscalado.dano = modificador > 0 ? `${danoBase}+${modificador}` : danoBase;
            } else {
                // Sem modificador, apenas usa dano base
                monstroEscalado.dano = monstro.dano;
            }
        } catch (e) {
            console.warn('[RPG] Erro ao escalar dano:', monstro.dano, e);
            monstroEscalado.dano = monstro.dano;
        }
    }
    
    // Escalar Recompensas (XP e Ouro)
    monstroEscalado.xp = Math.ceil(monstro.xp * multiplicadorTotal);
    monstroEscalado.ouro = Math.ceil(monstro.ouro * multiplicadorTotal);
    
    // Adicionar info de escalamento visual
    monstroEscalado.multiplicador = multiplicadorTotal.toFixed(2);
    monstroEscalado.escalado = true;
    
    return monstroEscalado;
}

/**
 * Escala os stats de um boss baseado no nível do jogador
 * Bosses escalam mais agressivamente que monstros normais
 * @param {Object} boss - Boss base
 * @param {number} playerLevel - Nível do jogador
 * @returns {Object} Boss escalado
 */
export function escalarBoss(boss, playerLevel) {
    const bossEscalado = { ...boss };
    
    // Multiplicador mais agressivo para bosses (escala ~3.3% por nível)
    const multiplicadorNivel = 1 + (playerLevel / 30);
    
    // Escalar HP (aumenta mais que monstros normais)
    bossEscalado.hp = Math.ceil(boss.hp * multiplicadorNivel);
    
    // Escalar Bônus de Ataque (aumenta 1 a cada 2 níveis)
    bossEscalado.bonusAtaque = Math.max(
        boss.bonusAtaque,
        boss.bonusAtaque + Math.floor(playerLevel / 3)
    );
    
    // Escalar CA (aumenta progressivamente)
    const caBonus = Math.min(5, Math.floor(playerLevel / 4));
    bossEscalado.ca = boss.ca + caBonus;
    
    // Escalar Dano (aumenta o modificador)
    if (typeof boss.dano === 'string') {
        try {
            const temModificador = boss.dano.includes('+') || (boss.dano.includes('-') && !boss.dano.match(/^(\d+)d(\d+)$/));
            
            if (temModificador) {
                const parts = boss.dano.split('+');
                let danoBase = parts[0];
                let modificador = parts[1] ? parseInt(parts[1]) : 0;
                
                const danoBonus = Math.floor(playerLevel / 3);
                modificador += danoBonus;
                
                bossEscalado.dano = modificador > 0 ? `${danoBase}+${modificador}` : danoBase;
            } else {
                bossEscalado.dano = boss.dano;
            }
        } catch (e) {
            console.warn('[RPG] Erro ao escalar dano boss:', boss.dano, e);
            bossEscalado.dano = boss.dano;
        }
    }
    
    // Escalar Recompensas
    bossEscalado.xp = Math.ceil(boss.xp * multiplicadorNivel);
    bossEscalado.ouro = Math.ceil(boss.ouro * multiplicadorNivel);
    
    bossEscalado.multiplicador = multiplicadorNivel.toFixed(2);
    bossEscalado.escalado = true;
    
    return bossEscalado;
}

// ==================== BOSSES DO DUNGEON ====================

export const BOSSES = [
    {
        id: 'rei_goblin',
        nome: 'Rei Goblin',
        emoji: '👑👺',
        level: 5,
        hp: 120,
        ca: 14,
        bonusAtaque: 4,
        dano: '2d6+1',
        xp: 500,
        ouro: 1000,
        habilidade: 'Grito de Guerra',
        descricao: 'O líder dos goblins, aumenta ATK em 50% a cada 3 rodadas',
        mecanica: 'buffo_ataque',
        recompensaUnica: 'trofeu_rei_goblin',
        recompensaArma: 'arma_rei_goblin'
    },
    {
        id: 'bruxa_negra',
        nome: 'Bruxa Negra',
        emoji: '🧙‍♀️🌑',
        level: 7,
        hp: 100,
        ca: 15,
        bonusAtaque: 5,
        dano: '2d8',
        xp: 750,
        ouro: 1000,
        habilidade: 'Maldição',
        descricao: 'Regenera 15 HP a cada 2 rodadas e reduz ATK do jogador em 25%',
        mecanica: 'regeneracao_e_debuff',
        recompensaUnica: 'trofeu_bruxa_negra',
        recompensaArma: 'cajado_bruxa_negra'
    },
    {
        id: 'senhor_dragao',
        nome: 'Senhor Dragão',
        emoji: '🐉👑',
        level: 10,
        hp: 200,
        ca: 16,
        bonusAtaque: 6,
        dano: '3d8+2',
        xp: 1500,
        ouro: 800,
        habilidade: 'Bafo de Fogo',
        descricao: 'Boss supremo! Alterna entre fases: normal, fogo (dano dobrado), regeneração',
        mecanica: 'fases_combate',
        recompensaUnica: 'trofeu_senhor_dragao',
        recompensaArma: 'espada_chama_dragao'
    },
    {
        id: 'lich_antigo',
        nome: 'Lich Antigo',
        emoji: '💀🔮',
        level: 8,
        hp: 150,
        ca: 13,
        bonusAtaque: 5,
        dano: '2d6+3',
        xp: 800,
        ouro: 500,
        habilidade: 'Invocação',
        descricao: 'Invoca reforços! Seus ataques recebem -2 e o boss ganha +1 CA a cada rodada',
        mecanica: 'invocacao_progressiva',
        recompensaUnica: 'trofeu_lich_antigo',
        recompensaArma: 'cajado_lich'
    },
    {
        id: 'rainha_aranhas',
        nome: 'Rainha das Aranhas',
        emoji: '🕷️👑',
        level: 6,
        hp: 90,
        ca: 15,
        bonusAtaque: 5,
        dano: '2d5+2',
        xp: 600,
        ouro: 350,
        habilidade: 'Teia Venenosa',
        descricao: 'Veneno: Você perde 5 HP por rodada. Ela ganha +20% de defesa com cada ataque',
        mecanica: 'veneno_e_defesa',
        recompensaUnica: 'trofeu_rainha_aranhas',
        recompensaArma: 'adaga_teia'
    },
    {
        id: 'titan_pedra',
        nome: 'Titã de Pedra',
        emoji: '🪨👹',
        level: 12,
        hp: 260,
        ca: 18,
        bonusAtaque: 7,
        dano: '3d10',
        xp: 2000,
        ouro: 1200,
        habilidade: 'Pele Implacável',
        descricao: 'Reduz 30% de todo dano recebido e ganha +1 CA por rodada.',
        mecanica: 'reduzir_dano_e_defesa',
        recompensaUnica: 'trofeu_titan_pedra',
        recompensaArma: 'mangual_pedra'
    },
    {
        id: 'hidra_venenosa',
        nome: 'Hidra Venenosa',
        emoji: '🐍🐍🐍',
        level: 13,
        hp: 220,
        ca: 17,
        bonusAtaque: 8,
        dano: '3d8+3',
        xp: 2200,
        ouro: 1300,
        habilidade: 'Mordidas Múltiplas',
        descricao: 'Ataca duas vezes: segundo ataque causa veneno (perda de 10 HP/rodada).',
        mecanica: 'ataque_duplo_veneno',
        recompensaUnica: 'trofeu_hidra_venenosa',
        recompensaArma: 'lanca_veneno_hidra'
    },
    {
        id: 'cavaleiro_carmesim',
        nome: 'Cavaleiro Carmesim',
        emoji: '🛡️🔥',
        level: 14,
        hp: 240,
        ca: 19,
        bonusAtaque: 9,
        dano: '2d12+2',
        xp: 2400,
        ouro: 1400,
        habilidade: 'Sangue e Chama',
        descricao: 'Causa sangramento (5 HP/rodada) e entra em fúria abaixo de 50% HP (dano +50%).',
        mecanica: 'sangramento_e_furia',
        recompensaUnica: 'trofeu_cavaleiro_carmesim',
        recompensaArma: 'espada_sangrenta'
    },
    {
        id: 'arauto_tempestade',
        nome: 'Arauto da Tempestade',
        emoji: '🌩️👁️',
        level: 15,
        hp: 260,
        ca: 18,
        bonusAtaque: 10,
        dano: '3d10+2',
        xp: 2800,
        ouro: 1600,
        habilidade: 'Fúria Elétrica',
        descricao: 'Alterna cargas: turno impar dano +25%, turno par acerto garante atordoar (ignora CA).',
        mecanica: 'alternancia_eletrica',
        recompensaUnica: 'trofeu_arauto_tempestade',
        recompensaArma: 'martelo_tempestade'
    },
    {
        id: 'margit',
        nome: 'Margit, o Agouro',
        emoji: '🦊⚔️',
        level: 16,
        hp: 280,
        ca: 19,
        bonusAtaque: 11,
        dano: '3d10+3',
        xp: 4500,
        ouro: 2700,
        habilidade: 'Martelo Espectral',
        descricao: 'Salta e golpeia com martelo espectral (crit mais alto) e lança lâminas à distância.',
        mecanica: 'burst_espectral',
        recompensaUnica: 'trofeu_margit',
        recompensaArma: 'lamina_agouro'
    },
    {
        id: 'godrick',
        nome: 'Godrick, o Enxertado',
        emoji: '🦾👑',
        level: 17,
        hp: 320,
        ca: 20,
        bonusAtaque: 12,
        dano: '3d12+2',
        xp: 3300,
        ouro: 6900,
        habilidade: 'Dragão Enxertado',
        descricao: 'Fase 2: bafo de fogo e golpes amplos em área; CA +1 e dano de fogo.',
        mecanica: 'fase_fogo_enxerto',
        recompensaUnica: 'trofeu_godrick',
        recompensaArma: 'machado_enxerto'
    },
    {
        id: 'rennala',
        nome: 'Rennala, Rainha da Lua Cheia',
        emoji: '🌕🔮',
        level: 18,
        hp: 300,
        ca: 19,
        bonusAtaque: 13,
        dano: '4d8+4',
        xp: 3600,
        ouro: 8000,
        habilidade: 'Lua Cheia',
        descricao: 'Invoca luas e espíritos; dano mágico alto, chance de reduzir ataque do jogador.',
        mecanica: 'magia_invocacao',
        recompensaUnica: 'trofeu_rennala',
        recompensaArma: 'cetro_lua'
    },
    {
        id: 'radahn',
        nome: 'Radahn, Flagelo das Estrelas',
        emoji: '🌠🏇',
        level: 19,
        hp: 360,
        ca: 21,
        bonusAtaque: 14,
        dano: '4d10+3',
        xp: 4000,
        ouro: 10300,
        habilidade: 'Chuva de Meteoro',
        descricao: 'Abre com flechas de longa distância; fase meteoro causa grande dano em área.',
        mecanica: 'meteoro_area',
        recompensaUnica: 'trofeu_radahn',
        recompensaArma: 'grande_arco_meteoro'
    },
    {
        id: 'malenia',
        nome: 'Malenia, Lâmina de Miquella',
        emoji: '🌸⚔️',
        level: 23,
        hp: 453,
        ca: 28,
        bonusAtaque: 25,
        dano: '5d10+5',
        xp: 4500,
        ouro: 11600,
        habilidade: 'Dança da Água',
        descricao: 'Ataques multigolpes e roubo de vida; fase Scarlet Rot aplica veneno pesado.',
        mecanica: 'multigolpe_lifesteal_rot',
        recompensaUnica: 'trofeu_malenia',
        recompensaArma: 'katana_scarlet'
    },
    {
        id: 'placidusax',
        nome: 'Placidusax, Dragao Ancestral',
        emoji: '🐉⚡',
        level: 26,
        hp: 520,
        ca: 30,
        bonusAtaque: 28,
        dano: '5d12+6',
        xp: 12200,
        ouro: 8000,
        habilidade: 'Tempestade Ancestral',
        descricao: 'Alterna entre rajadas de raio (ignora 25% da CA) e cortes em area; abaixo de 40% HP ganha escudo de trovão (reduz 30% do dano).',
        mecanica: 'tempestade_ancestral',
        recompensaUnica: 'trofeu_placidusax',
        recompensaArma: 'garras_trovao'
    },
    {
        id: 'fera_dourada',
        nome: 'Fera Dourada Eterna',
        emoji: '🦁✨',
        level: 30,
        hp: 2000,
        ca: 32,
        bonusAtaque: 30,
        dano: '6d12+8',
        xp: 6000,
        ouro: 20400,
        habilidade: 'Eco da Criação',
        descricao: 'Ciclos de luz e vacuo: turno de luz causa dano em area e cega (reduz acerto), turno de vacuo puxa e causa dano verdadeiro parcial.',
        mecanica: 'eco_criacao',
        recompensaUnica: 'trofeu_fera_dourada',
        recompensaArma: 'espadon_criacao'
    }
];

// ==================== SISTEMA DE ELOS/RANKING ====================

export const TIERS_RANKING = [
    // Ferro: 0-1500 ELO
    { tier: 'Ferro', divisao: 3, emoji: '⚫', range: [0, 499], cor: '#696969' },
    { tier: 'Ferro', divisao: 2, emoji: '⚫', range: [500, 799], cor: '#696969' },
    { tier: 'Ferro', divisao: 1, emoji: '⚫', range: [800, 1099], cor: '#696969' },
    
    // Prata: 1100-1500 ELO
    { tier: 'Prata', divisao: 3, emoji: '🔶', range: [1100, 1299], cor: '#C0C0C0' },
    { tier: 'Prata', divisao: 2, emoji: '🔶', range: [1300, 1449], cor: '#C0C0C0' },
    { tier: 'Prata', divisao: 1, emoji: '🔶', range: [1450, 1599], cor: '#C0C0C0' },
    
    // Ouro: 1600-1999 ELO
    { tier: 'Ouro', divisao: 3, emoji: '🟡', range: [1600, 1749], cor: '#FFD700' },
    { tier: 'Ouro', divisao: 2, emoji: '🟡', range: [1750, 1899], cor: '#FFD700' },
    { tier: 'Ouro', divisao: 1, emoji: '🟡', range: [1900, 1999], cor: '#FFD700' },
    
    // Platina: 2000-2399 ELO
    { tier: 'Platina', divisao: 3, emoji: '💎', range: [2000, 2099], cor: '#E5E4E2' },
    { tier: 'Platina', divisao: 2, emoji: '💎', range: [2100, 2249], cor: '#E5E4E2' },
    { tier: 'Platina', divisao: 1, emoji: '💎', range: [2250, 2399], cor: '#E5E4E2' },
    
    // Diamante: 2400-2899 ELO
    { tier: 'Diamante', divisao: 3, emoji: '💠', range: [2400, 2549], cor: '#B9F2FF' },
    { tier: 'Diamante', divisao: 2, emoji: '💠', range: [2550, 2699], cor: '#B9F2FF' },
    { tier: 'Diamante', divisao: 1, emoji: '💠', range: [2700, 2899], cor: '#B9F2FF' },
    
    // Mestre: 2900+ ELO
    { tier: 'Mestre', divisao: 3, emoji: '👑', range: [2900, 3149], cor: '#FF6B6B' },
    { tier: 'Mestre', divisao: 2, emoji: '👑', range: [3150, 3399], cor: '#FF6B6B' },
    { tier: 'Mestre', divisao: 1, emoji: '👑', range: [3400, Infinity], cor: '#FF6B6B' }
];

/**
 * Obtém o tier e divisão baseado no ELO
 * @param {number} elo - ELO do jogador
 * @returns {object} { tier, divisao, emoji, progresso, proximoDivisao }
 */
export function obterTierELO(elo = 1600) {
    elo = Math.max(0, elo);
    
    const tierAtual = TIERS_RANKING.find(t => elo >= t.range[0] && elo <= t.range[1]);
    
    if (!tierAtual) {
        return TIERS_RANKING[TIERS_RANKING.length - 1];
    }
    
    // Calcula progresso até próxima divisão
    const eloMin = tierAtual.range[0];
    const eloMax = tierAtual.range[1];
    const progresso = ((elo - eloMin) / (eloMax - eloMin + 1) * 100).toFixed(1);
    
    return {
        tier: tierAtual.tier,
        divisao: tierAtual.divisao,
        emoji: tierAtual.emoji,
        elo: elo,
        progresso: Math.min(100, progresso),
        eloMin,
        eloMax,
        proxELO: eloMax + 1
    };
}

/**
 * Retorna uma barra visual do ELO
 * @param {number} elo - ELO do jogador
 * @returns {string} Barra visual
 */
export function obterBarraELO(elo = 1600) {
    const tierInfo = obterTierELO(elo);
    const preenchimento = Math.floor(tierInfo.progresso / 10);
    const vazio = 10 - preenchimento;
    
    const barra = '█'.repeat(preenchimento) + '░'.repeat(vazio);
    return `${barra} ${tierInfo.progresso}%`;
}

// ==================== MISSÕES/QUESTS ====================

export const QUESTS_DISPONIVEIS = {
    quest_matar_5_ratos: {
        id: 'matar_5_ratos',
        nome: 'Exterminador de Pragas',
        emoji: '🐭',
        descricao: 'Mate 5 ratos gigantes',
        objetivo: { tipo: 'matar', monstro: 'rato_gigante', quantidade: 5 },
        recompensa: { xp: 150, ouro: 100 },
        dificuldade: 'Fácil'
    },
    quest_matar_10_inimigos: {
        id: 'matar_10_inimigos',
        nome: 'Caçador Experiente',
        emoji: '⚔️',
        descricao: 'Vença 10 combates de qualquer tipo',
        objetivo: { tipo: 'vitorias', quantidade: 10 },
        recompensa: { xp: 300, ouro: 250 },
        dificuldade: 'Médio'
    },
    quest_ganhar_3_duelos: {
        id: 'ganhar_3_duelos',
        nome: 'Campeão dos Duelos',
        emoji: '🏆',
        descricao: 'Vença 3 duelos contra outros jogadores',
        objetivo: { tipo: 'duelos_vencidos', quantidade: 3 },
        recompensa: { xp: 250, ouro: 500, elo: 50 },
        dificuldade: 'Difícil'
    },
    quest_ganhar_10000_ouro: {
        id: 'ganhar_10000_ouro',
        nome: 'Gananciador',
        emoji: '💰',
        descricao: 'Acumule 10.000 de ouro',
        objetivo: { tipo: 'ouro_acumulado', quantidade: 10000 },
        recompensa: { xp: 200, ouro: 1000 },
        dificuldade: 'Médio'
    },
    quest_subir_5_levels: {
        id: 'subir_5_levels',
        nome: 'Aventureiro Dedicado',
        emoji: '⭐',
        descricao: 'Suba 5 níveis',
        objetivo: { tipo: 'levels_ganhos', quantidade: 5 },
        recompensa: { xp: 500, ouro: 750 },
        dificuldade: 'Muito Difícil'
    },
    quest_comprar_3_itens: {
        id: 'comprar_3_itens',
        nome: 'Colecionador',
        emoji: '🛍️',
        descricao: 'Compre 3 itens na loja',
        objetivo: { tipo: 'compras', quantidade: 3 },
        recompensa: { xp: 100, ouro: 500 },
        dificuldade: 'Fácil'
    },
    quest_matar_5_goblin: {
        id: 'matar_5_goblin',
        nome: 'Devorador de Goblins',
        emoji: '👹',
        descricao: 'Mate 5 goblins',
        objetivo: { tipo: 'matar', monstro: 'goblin', quantidade: 5 },
        recompensa: { xp: 200, ouro: 150 },
        dificuldade: 'Médio'
    },
    quest_fazer_1_critico: {
        id: 'fazer_1_critico',
        nome: 'Golpe Preciso',
        emoji: '🎯',
        descricao: 'Consiga 1 golpe crítico',
        objetivo: { tipo: 'criticos', quantidade: 1 },
        recompensa: { xp: 50, ouro: 100 },
        dificuldade: 'Fácil'
    },
    quest_sobreviver_30min: {
        id: 'sobreviver_30min',
        nome: 'Sobrevivente',
        emoji: '🛡️',
        descricao: 'Sobreviva 30 minutos sem morrer',
        objetivo: { tipo: 'tempo_vivo', minutos: 30 },
        recompensa: { xp: 300, ouro: 400 },
        dificuldade: 'Médio'
    },
    quest_roubar_500_ouro: {
        id: 'roubar_500_ouro',
        nome: 'Ladrão da Noite',
        emoji: '🗡️💰',
        descricao: 'Roube 500 de ouro de outros jogadores',
        objetivo: { tipo: 'ouro_roubado', quantidade: 500 },
        recompensa: { xp: 250, ouro: 200 },
        dificuldade: 'Difícil'
    }
};

/**
 * Funções para gerenciar quests
 */

export function obterQuestDoDia() {
    // Retorna uma quest aleatória (muda todo dia)
    const quest_ids = Object.keys(QUESTS_DISPONIVEIS);
    const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Muda a cada 24h
    const index = seed % quest_ids.length;
    return QUESTS_DISPONIVEIS[quest_ids[index]];
}

export function obterTodasAsQuests() {
    return Object.values(QUESTS_DISPONIVEIS);
}

export function resetarQuestsDoDia(player) {
    if (!player.quests) {
        player.quests = {};
    }
    
    // Reset de quests (limpa progresso anterior)
    const quest = obterQuestDoDia();
    player.quests.atual = {
        id: quest.id,
        nome: quest.nome,
        emoji: quest.emoji,
        descricao: quest.descricao,
        objetivo: { ...quest.objetivo },
        recompensa: { ...quest.recompensa },
        progresso: 0,
        completada: false,
        dataInicio: Date.now()
    };
    
    return player.quests.atual;
}

export function verificarProgressoQuest(player, tipo, valor = 1, contexto = {}) {
    if (!player?.quests?.atual) return false;
    const quest = player.quests.atual;

    if (quest.objetivo.tipo !== tipo) return false;

    // Normaliza ids de monstros para bater com 'rato_gigante', 'goblin', etc.
    const normalizarId = (texto) => (texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '_');

    const incremento = typeof valor === 'number' ? valor : (valor?.valor || 1);
    const monstroId = normalizarId(valor?.monstro || contexto.monstro);
    const objetivoMonstro = quest.objetivo.monstro ? normalizarId(quest.objetivo.monstro) : null;
    const quantidadeAlvo = quest.objetivo.quantidade || quest.objetivo.minutos || 1;

    // Restrições específicas
    if (tipo === 'matar' && objetivoMonstro) {
        if (!monstroId || monstroId !== objetivoMonstro) return false;
    }

    if (tipo === 'tempo_vivo' && quest.objetivo.minutos) {
        // Para tempo, use minutos passados (valor deve vir em minutos)
        quest.progresso = Math.min(quest.progresso + incremento, quantidadeAlvo);
    } else if (tipo === 'ouro_acumulado' && quest.objetivo.quantidade) {
        // Marca completa se o ouro atual atingir o alvo
        if ((player.ouro || 0) >= quest.objetivo.quantidade) {
            quest.progresso = quest.objetivo.quantidade;
            quest.completada = true;
            quest.dataCompletacao = Date.now();
            return true;
        }
        return false;
    } else if (tipo === 'levels_ganhos' && quest.objetivo.quantidade) {
        quest.progresso = Math.min(quest.progresso + incremento, quantidadeAlvo);
    } else {
        quest.progresso = Math.min(quest.progresso + incremento, quantidadeAlvo);
    }

    if (quest.progresso >= quantidadeAlvo) {
        quest.completada = true;
        quest.dataCompletacao = Date.now();
        return true;
    }
    return false;
}

export function completarQuest(player) {
    if (!player.quests?.atual || !player.quests.atual.completada) {
        return null;
    }
    
    const quest = player.quests.atual;
    const recompensa = quest.recompensa;
    
    // Aplicar recompensas
    if (recompensa.xp) player.xp += recompensa.xp;
    if (recompensa.ouro) player.ouro += recompensa.ouro;
    if (recompensa.elo) player.elo = (player.elo || 1600) + recompensa.elo;
    
    // Registrar na história de quests completadas
    if (!player.questsCompletadas) {
        player.questsCompletadas = [];
    }
    player.questsCompletadas.push({
        id: quest.id,
        nome: quest.nome,
        completada: Date.now()
    });
    
    // Limpar quest atual
    const recompensaRetorno = { ...recompensa };
    player.quests.atual = null;
    
    return recompensaRetorno;
}

export function obterStatusQuest(player) {
    if (!player.quests?.atual) {
        return null;
    }
    
    const quest = player.quests.atual;
    const progresso = quest.progresso;
    const total = quest.objetivo.quantidade || quest.objetivo.minutos || 1;
    const percentual = Math.round((progresso / total) * 100);
    
    return {
        nome: quest.nome,
        emoji: quest.emoji,
        descricao: quest.descricao,
        progresso,
        total,
        percentual,
        completada: quest.completada,
        recompensa: quest.recompensa
    };
}

// ==================== ITENS DA LOJA ====================

// ==================== MODIFICADORES DE ITEMS (AFFIXES) ====================

export const AFFIXES = {
    prefixos_arma: [
        { nome: 'Afiada', emoji: '💎', bonusAtaque: 1, danoBônus: 15 },
        { nome: 'Mágica', emoji: '✨', bonusAtaque: 1, danoMagico: 20 },
        { nome: 'Letal', emoji: '🗡️', bonusAtaque: 1, bonusContra: 10 },
        { nome: 'Abençoada', emoji: '✨', bonusFor: 1, bonusInt: 1 },
        { nome: 'Etérea', emoji: '👻', bonusAtaque: 1, lifesteal: 10 },
        { nome: 'Antiga', emoji: '⚡', bonusAtaque: 2, danoExtra: '1d4' },
        { nome: 'Enraivecida', emoji: '🔥', bonusDano: 25, desvan: -5 }
    ],
    sufixos_arma: [
        { nome: 'da Força', emoji: '💪', bonusFor: 2 },
        { nome: 'da Inteligência', emoji: '🧠', bonusInt: 2 },
        { nome: 'da Velocidade', emoji: '⚡', bonusAtkSpeed: 15 },
        { nome: 'Vampírica', emoji: '🧛', lifesteal: 20 },
        { nome: 'da Perdição', emoji: '☠️', debuff: 'veneno', bonusDano: 10 },
        { nome: 'da Agilidade', emoji: '🏃', bonusAgi: 2 },
        { nome: 'da Regeneração', emoji: '🌱', manaRegen: 1 }
    ],
    prefixos_armadura: [
        { nome: 'Fortalecida', emoji: '🛡️', bonusCA: 2 },
        { nome: 'Resguardada', emoji: '🔒', resistMagica: 15 },
        { nome: 'Vitalizada', emoji: '❤️', bonusHP: 50 },
        { nome: 'Encantada', emoji: '✨', resistMagica: 20, bonusInt: 1 },
        { nome: 'Antigas', emoji: '⚡', bonusCA: 1, resistMagica: 10 },
        { nome: 'Couraçada', emoji: '🏰', bonusCA: 3, desvan: -10 },
        { nome: 'Espectra', emoji: '👻', resistFogo: 20, resistFrio: 20 }
    ],
    sufixos_armadura: [
        { nome: 'da Vitalidade', emoji: '❤️', bonusHP: 80 },
        { nome: 'da Resistência', emoji: '🛡️', bonusCA: 1, resistFisica: 10 },
        { nome: 'da Regeneração', emoji: '🌿', regenHP: 5 },
        { nome: 'da Agilidade', emoji: '🏃', bonusAgi: 2, esquiva: 10 },
        { nome: 'do Mago', emoji: '🔮', bonusInt: 2, manaRegen: 2 },
        { nome: 'da Resistência Mágica', emoji: '🔵', resistMagica: 25 },
        { nome: 'da Imunidade', emoji: '🛡️', resistFogo: 15, resistFrio: 15 }
    ]
};

// ==================== RARIDADES DE ITEMS ====================

export const RARIDADES = {
    comum: { emoji: '⚪', cor: '#808080', nome: 'Comum', venda: 1, affixes: 0 },
    incomum: { emoji: '🟢', cor: '#00FF00', nome: 'Incomum', venda: 1.3, affixes: 1 },
    raro: { emoji: '🔵', cor: '#0099FF', nome: 'Raro', venda: 1.6, affixes: 2 },
    epico: { emoji: '🟣', cor: '#9900FF', nome: 'Épico', venda: 2.0, affixes: 3 },
    lendario: { emoji: '🟡', cor: '#FFCC00', nome: 'Lendário', venda: 3.0, affixes: 4 },
    ancestral: { emoji: '🌟', cor: '#FFFFFF', nome: 'Ancestral', venda: 5.0, affixes: 5 }
};

// ==================== ITENS MELHORADOS COM RARIDADE ====================

export const LOJA_ITENS = {
    armas: [
        // ===== ARMAS GERAIS =====
        { id: 'adaga', nome: 'Adaga', emoji: '🔪', preco: 50, dano: '1d4', bonusAtaque: 1, tipo: 'arma', raridade: 'comum' },
        { id: 'espada_curta', nome: 'Espada Curta', emoji: '🗡️', preco: 100, dano: '1d6', bonusAtaque: 1, tipo: 'arma', raridade: 'comum' },
        { id: 'espada_longa', nome: 'Espada Longa', emoji: '⚔️', preco: 250, dano: '1d8', bonusAtaque: 2, tipo: 'arma', raridade: 'incomum' },
        { id: 'espada_gelo', nome: 'Espada de Gelo', emoji: '❄️⚔️', preco: 21200, dano: '5d8', bonusAtaque: 3, tipo: 'arma', raridade: 'incomum' },
        
        // ===== ARMAS DE GUERREIRO =====
        { id: 'machado_guerra', nome: 'Machado de Guerra', emoji: '🪓', preco: 400, dano: '1d10', bonusAtaque: 2, tipo: 'arma', classe: 'guerreiro', raridade: 'incomum' },
        { id: 'espada_grande', nome: 'Espada Grande', emoji: '⚔️', preco: 600, dano: '2d6', bonusAtaque: 3, tipo: 'arma', classe: 'guerreiro', raridade: 'raro' },
        { id: 'espada_mistica', nome: 'Espada Mistica', emoji: '✨⚔️', preco: 1500, dano: '2d8', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', bonusInt: 1 },
        { id: 'espada_dragao', nome: 'Espada do Dragao', emoji: '🐉⚔️', preco: 4000, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'maca_pesada', nome: 'Maca Pesada', emoji: '🔨', preco: 350, dano: '1d9+1', bonusAtaque: 2, tipo: 'arma', classe: 'guerreiro', raridade: 'incomum' },
        { id: 'alabarda', nome: 'Alabarda', emoji: '🗡️', preco: 800, dano: '1d10+2', bonusAtaque: 3, tipo: 'arma', classe: 'guerreiro', raridade: 'raro' },
        { id: 'shifu', nome: 'Espada do Shifu', emoji: '🗡️', preco: 29720, dano: '5d10+2', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'raro' },
        { id: 'arma_rei_goblin', nome: 'Adaga do Rei Goblin', emoji: '👑🗡️', dano: '1d8+2', bonusAtaque: 2, debuff: 'sangramento', tipo: 'arma', raridade: 'raro', somenteDrop: true },
        
        // ===== ARMAS DE LADINO =====
        { id: 'adaga_envenenada', nome: 'Adaga Envenenada', emoji: '☠️', preco: 150, dano: '1d5+1', bonusAtaque: 2, tipo: 'arma', classe: 'ladino', raridade: 'raro', debuff: 'veneno' },
        { id: 'gume_duplo', nome: 'Gume Duplo', emoji: '⚡', preco: 300, dano: '1d7+1', bonusAtaque: 2, tipo: 'arma', classe: 'ladino', raridade: 'raro' },
        { id: 'punhais_sombra', nome: 'Punhais da Sombra', emoji: '🌑', preco: 600, dano: '1d8+2', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'epico', bonusAgi: 2 },
        { id: 'adaga_teia', nome: 'Adaga de Teia Venenosa', emoji: '🕷️🗡️', dano: '1d10+1', bonusAtaque: 3, debuff: 'veneno', raridade: 'raro', tipo: 'arma', somenteDrop: true },
        // Katana para builds de samurai (Dex)
        { id: 'katana_simples', nome: 'Katana Simples', emoji: '🗡️', preco: 650, dano: '1d7+1', bonusAtaque: 2, tipo: 'arma', classe: 'ladino', raridade: 'incomum', afinidade: 'agil' },
        { id: 'uchigatana', nome: 'Uchigatana', emoji: '🗡️✨', preco: 1400, dano: '1d8+2', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'raro', afinidade: 'agil', debuff: 'sangramento' },
        { id: 'nagakiba', nome: 'Nagakiba', emoji: '🗡️🐍', preco: 3200, dano: '2d6+1', bonusAtaque: 4, tipo: 'arma', classe: 'ladino', raridade: 'epico', afinidade: 'agil', debuff: 'sangramento', bonusAgi: 1 },
        
        // ===== ARMAS DE CLÉRIGO =====
        { id: 'maca_sagrada', nome: 'Maca Sagrada', emoji: '✨🔨', preco: 200, dano: '1d6+1', bonusAtaque: 1, tipo: 'arma', classe: 'clerigo', raridade: 'incomum' },
        { id: 'martelo_luz', nome: 'Martelo da Luz', emoji: '☀️', preco: 500, dano: '1d8+2', bonusAtaque: 2, tipo: 'arma', classe: 'clerigo', raridade: 'raro', bonusInt: 1 },
        { id: 'bordao_bencao', nome: 'Bordao da Bencao', emoji: '✨🪶', preco: 1000, dano: '1d8+3', bonusAtaque: 3, tipo: 'arma', classe: 'clerigo', raridade: 'epico', bonusInt: 2 },
        { id: 'cajado_bruxa_negra', nome: 'Cajado da Bruxa Negra', emoji: '🧙‍♀️🔮', dano: '2d6+2', bonusAtaque: 3, bonusInt: 2, magico: true, raridade: 'epico', debuff: 'veneno', somenteDrop: true },
        { id: 'cajado_lich', nome: 'Cajado do Lich Antigo', emoji: '💀🔮', dano: '2d8+3', bonusAtaque: 4, bonusInt: 3, magico: true, raridade: 'epico', lifesteal: 5, somenteDrop: true },
        
        // ===== ARMAS DE ARQUEIRO =====
        { id: 'arco_simples', nome: 'Arco Simples', emoji: '🏹', preco: 120, dano: '1d6', bonusAtaque: 1, tipo: 'arma', classe: 'arqueiro', raridade: 'comum' },
        { id: 'arco_composto', nome: 'Arco Composto', emoji: '🏹', preco: 300, dano: '1d8+1', bonusAtaque: 2, tipo: 'arma', classe: 'arqueiro', raridade: 'incomum' },
        { id: 'besta_pesada', nome: 'Besta Pesada', emoji: '🔫', preco: 550, dano: '1d10+1', bonusAtaque: 3, tipo: 'arma', classe: 'arqueiro', raridade: 'raro' },
        { id: 'arco_elfico', nome: 'Arco Elfico', emoji: '🌿🏹', preco: 1200, dano: '5d6+1', bonusAtaque: 4, tipo: 'arma', classe: 'arqueiro', raridade: 'epico', bonusAgi: 4 },
        { id: 'grande_arco_meteoro', nome: 'Grande Arco Meteoro', emoji: '🌠🏹', dano: '4d10', bonusAtaque: 6, bonusCrit: 5, raridade: 'lendario', tipo: 'arma', classe: 'arqueiro', somenteDrop: true },
        
        // ===== CAJADOS PARA MAGO =====
        { id: 'cajado_aprendiz', nome: 'Cajado de Aprendiz', emoji: '🪄', preco: 80, dano: '1d6', bonusAtaque: 1, tipo: 'arma', magico: true, bonusInt: 1, raridade: 'comum' },
        { id: 'cajado_aprendiz_plus', nome: 'Cajado Aprimorado', emoji: '🪄✨', preco: 250, dano: '1d7', bonusAtaque: 2, tipo: 'arma', magico: true, bonusInt: 2, raridade: 'incomum' },
        { id: 'cajado_arcano', nome: 'Cajado Arcano', emoji: '🔮', preco: 500, dano: '1d8', bonusAtaque: 3, tipo: 'arma', magico: true, bonusInt: 2, raridade: 'raro' },
        { id: 'cajado_arcano_plus', nome: 'Cajado Arcano Maior', emoji: '🔮✨', preco: 1200, dano: '1d10', bonusAtaque: 4, tipo: 'arma', magico: true, bonusInt: 3, raridade: 'epico', manaRegen: 2 },
        { id: 'cajado_supremo', nome: 'Cajado Supremo', emoji: '⚡🔮', preco: 2500, dano: '2d8', bonusAtaque: 5, tipo: 'arma', magico: true, bonusInt: 4, raridade: 'raro', manaRegen: 5 },
        { id: 'varinha_chamas', nome: 'Varinha de Chamas', emoji: '🔥', preco: 4000, dano: '2d8+2', bonusAtaque: 3, tipo: 'arma', magico: true, bonusInt: 3, raridade: 'raro', danoExtra: 'fogo' },
        { id: 'cajado_gelo', nome: 'Cajado de Gelo', emoji: '❄️', preco: 6050, dano: '3d8+2', bonusAtaque: 2, tipo: 'arma', magico: true, bonusInt: 4, raridade: 'lendario', danoExtra: 'frio' },
        { id: 'cajado_violento', nome: 'Cajado Violento', emoji: '🪄', preco: 10050, dano: '5d8+2', bonusAtaque: 2, tipo: 'arma', magico: true, bonusInt: 6, raridade: 'lendario', danoExtra: 'fogo' }
        ,{ id: 'espada_chama_dragao', nome: 'Espada da Chama Dracônica', emoji: '🐉🔥', dano: '2d10+3', bonusAtaque: 4, danoExtra: 'fogo', tipo: 'arma', raridade: 'epico', somenteDrop: true }
        ,{ id: 'mangual_pedra', nome: 'Mangual do Titã de Pedra', emoji: '🪨🔨', dano: '3d8', bonusAtaque: 4, tipo: 'arma', raridade: 'epico', bonusCA: 1, somenteDrop: true }
        ,{ id: 'lanca_veneno_hidra', nome: 'Lança da Hidra Venenosa', emoji: '🐍🗡️', dano: '2d10+2', bonusAtaque: 4, debuff: 'veneno', raridade: 'epico', tipo: 'arma', somenteDrop: true }
        ,{ id: 'espada_sangrenta', nome: 'Espada Carmesim', emoji: '🩸⚔️', dano: '2d12', bonusAtaque: 5, debuff: 'sangramento', raridade: 'epico', tipo: 'arma', somenteDrop: true }
        ,{ id: 'martelo_tempestade', nome: 'Martelo da Tempestade', emoji: '🌩️🔨', dano: '3d10+2', bonusAtaque: 5, danoExtra: 'raio', raridade: 'epico', tipo: 'arma', somenteDrop: true }
        ,{ id: 'lamina_agouro', nome: 'Lâmina do Agouro', emoji: '🦊⚔️', dano: '3d10', bonusAtaque: 5, bonusCrit: 10, raridade: 'lendario', tipo: 'arma', somenteDrop: true }
        ,{ id: 'machado_enxerto', nome: 'Machado do Enxerto', emoji: '🦾🪓', dano: '3d12+2', bonusAtaque: 6, bonusFor: 2, raridade: 'lendario', tipo: 'arma', somenteDrop: true }
        ,{ id: 'cetro_lua', nome: 'Cetro da Lua Cheia', emoji: '🌕✨', dano: '4d8', bonusAtaque: 5, bonusInt: 4, magico: true, raridade: 'lendario', tipo: 'arma', somenteDrop: true }
        ,{ id: 'katana_scarlet', nome: 'Katana Scarlet Rot', emoji: '🌸🗡️', dano: '5d10', bonusAtaque: 6, debuff: 'veneno', bonusAgi: 2, raridade: 'lendario', tipo: 'arma', somenteDrop: true }
        ,{ id: 'cajado_bruxa_negra_plus', nome: 'Cajado da Bruxa Negra', emoji: '🧙‍♀️🔮', dano: '2d6+2', bonusAtaque: 3, bonusInt: 2, magico: true, raridade: 'epico', debuff: 'veneno', somenteDrop: true }
        ,{ id: 'garras_trovao', nome: 'Garras do Dragão Ancestral', emoji: '🐉⚡', dano: '5d12', bonusAtaque: 7, danoExtra: 'raio', raridade: 'ancestral', tipo: 'arma', somenteDrop: true }
        ,{ id: 'espadon_criacao', nome: 'Espadão da Criação', emoji: '🦁✨⚔️', dano: '6d12+4', bonusAtaque: 8, bonusCA: 1, raridade: 'ancestral', tipo: 'arma', somenteDrop: true }
    ],
    armaduras: [
        { id: 'couro', nome: 'Armadura de Couro', emoji: '🥋', preco: 80, bonusCA: 1, tipo: 'armadura', raridade: 'comum' },
        { id: 'couro_batido', nome: 'Couro Batido', emoji: '🦺', preco: 200, bonusCA: 2, tipo: 'armadura', raridade: 'incomum' },
        { id: 'cota_malha', nome: 'Cota de Malha', emoji: '🛡️', preco: 500, bonusCA: 4, tipo: 'armadura', raridade: 'raro' },
        { id: 'meia_placa', nome: 'Meia Placa', emoji: '⚙️', preco: 1000, bonusCA: 5, tipo: 'armadura', raridade: 'raro', bonusHP: 30 },
        { id: 'placa', nome: 'Armadura de Placa', emoji: '🏰', preco: 2500, bonusCA: 7, tipo: 'armadura', raridade: 'epico', bonusHP: 60 },
        { id: 'placa_dragao', nome: 'Placa de Dragao', emoji: '🐉🛡️', preco: 6000, bonusCA: 9, tipo: 'armadura', raridade: 'lendario', bonusHP: 100, resistFogo: 30 },
        { id: 'couro_pica', nome: 'Couro de pica', emoji: '🛡️', preco: 17500, bonusCA: 15, tipo: 'armadura', raridade: 'epico', bonusHP: 220 },
        { id: 'armadura_insana', nome: 'Armadura Insana', emoji: '🛡️🛡️', preco: 37500, bonusCA: 25, tipo: 'armadura', raridade: 'epico', bonusHP: 250 },

    ],
    consumiveis: [
        { id: 'pocao_hp', nome: 'Pocao de Vida', emoji: '🧪', preco: 25, cura: '2d4+2', tipo: 'consumivel' },
        { id: 'pocao_hp_maior', nome: 'Pocao de Vida Maior', emoji: '🧪✨', preco: 100, cura: '4d4+4', tipo: 'consumivel' },
        { id: 'pocao_hp_suprema', nome: 'Pocao de Vida Suprema', emoji: '💎🧪', preco: 500, cura: '8d4+8', tipo: 'consumivel' }
    ],
    legendarios: [
        // ===== ARMAS LEGENDÁRIAS =====
        { id: 'espada_ancestral', nome: 'Espada Ancestral', emoji: '⚔️👑', dano: '2d10+3', bonusAtaque: 6, tipo: 'legendario', raridade: 'epico' },
        { id: 'machado_titano', nome: 'Machado do Titano', emoji: '🪓⚡', dano: '3d8+2', bonusAtaque: 6, tipo: 'legendario', raridade: 'epico' },
        { id: 'punhais_vento', nome: 'Punhais do Vento', emoji: '💨🗡️', dano: '2d8+4', bonusAtaque: 7, tipo: 'legendario', raridade: 'epico', classe: 'ladino' },
        { id: 'besta_noite', nome: 'Besta da Noite', emoji: '🌑🔫', dano: '2d10+2', bonusAtaque: 6, tipo: 'legendario', raridade: 'epico', classe: 'arqueiro' },
        { id: 'bordao_infinito', nome: 'Bordao Infinito', emoji: '∞🔮', dano: '2d8+3', bonusAtaque: 6, bonusInt: 5, tipo: 'legendario', raridade: 'epico', classe: 'mago' },
        
        // ===== ARMADURAS LEGENDÁRIAS =====
        { id: 'placa_divina', nome: 'Placa Divina', emoji: '✨🏰', bonusCA: 12, tipo: 'legendario', raridade: 'epico' },
        { id: 'cota_dragao', nome: 'Cota do Dragao', emoji: '🐉🛡️', bonusCA: 11, tipo: 'legendario', raridade: 'epico' },
        { id: 'manto_sombra', nome: 'Manto da Sombra', emoji: '🌑👾', bonusCA: 10, tipo: 'legendario', raridade: 'epico', classe: 'ladino' },
        
        // ===== JOIAS LENDÁRIAS =====
        { id: 'anel_poder', nome: 'Anel do Poder', emoji: '💍⚡', bonusAtaque: 3, bonusInt: 2, tipo: 'legendario', raridade: 'raro' },
        { id: 'amuleto_vitalidade', nome: 'Amuleto da Vitalidade', emoji: '❤️‍🔥', hpBonus: 1.3, tipo: 'legendario', raridade: 'raro' },
        { id: 'colar_sabedoria', nome: 'Colar da Sabedoria', emoji: '🧠✨', bonusInt: 3, tipo: 'legendario', raridade: 'raro' },
        { id: 'pulseira_velocidade', nome: 'Pulseira da Velocidade', emoji: '⚡🔁', bonusAtaque: 2, bonusCrit: 15, tipo: 'legendario', raridade: 'raro' },

        // ===== ARMAS ÚNICAS DE BOSS =====
        { id: 'arma_rei_goblin', nome: 'Adaga do Rei Goblin', emoji: '👑🗡️', dano: '1d8+2', bonusAtaque: 2, debuff: 'sangramento', tipo: 'arma', raridade: 'raro', somenteDrop: true },
        { id: 'cajado_bruxa_negra', nome: 'Cajado da Bruxa Negra', emoji: '🧙‍♀️🔮', dano: '2d6+2', bonusAtaque: 3, bonusInt: 2, magico: true, raridade: 'epico', debuff: 'veneno', somenteDrop: true },
        { id: 'espada_chama_dragao', nome: 'Espada da Chama Dracônica', emoji: '🐉🔥', dano: '2d10+3', bonusAtaque: 4, danoExtra: 'fogo', tipo: 'arma', raridade: 'epico', somenteDrop: true },
        { id: 'cajado_lich', nome: 'Cajado do Lich Antigo', emoji: '💀🔮', dano: '2d8+3', bonusAtaque: 4, bonusInt: 3, magico: true, raridade: 'epico', lifesteal: 5, somenteDrop: true },
        { id: 'adaga_teia', nome: 'Adaga de Teia Venenosa', emoji: '🕷️🗡️', dano: '1d10+1', bonusAtaque: 3, debuff: 'veneno', raridade: 'raro', tipo: 'arma', somenteDrop: true },
        { id: 'mangual_pedra', nome: 'Mangual do Titã de Pedra', emoji: '🪨🔨', dano: '3d8', bonusAtaque: 4, tipo: 'arma', raridade: 'epico', bonusCA: 1, somenteDrop: true },
        { id: 'lanca_veneno_hidra', nome: 'Lança da Hidra Venenosa', emoji: '🐍🗡️', dano: '2d10+2', bonusAtaque: 4, debuff: 'veneno', raridade: 'epico', tipo: 'arma', somenteDrop: true },
        { id: 'espada_sangrenta', nome: 'Espada Carmesim', emoji: '🩸⚔️', dano: '2d12', bonusAtaque: 5, debuff: 'sangramento', raridade: 'epico', tipo: 'arma', somenteDrop: true },
        { id: 'martelo_tempestade', nome: 'Martelo da Tempestade', emoji: '🌩️🔨', dano: '3d10+2', bonusAtaque: 5, danoExtra: 'raio', raridade: 'epico', tipo: 'arma', somenteDrop: true },
        { id: 'lamina_agouro', nome: 'Lâmina do Agouro', emoji: '🦊⚔️', dano: '3d10', bonusAtaque: 5, bonusCrit: 10, raridade: 'lendario', tipo: 'arma', somenteDrop: true },
        { id: 'machado_enxerto', nome: 'Machado do Enxerto', emoji: '🦾🪓', dano: '3d12+2', bonusAtaque: 6, bonusFor: 2, raridade: 'lendario', tipo: 'arma', somenteDrop: true },
        { id: 'cetro_lua', nome: 'Cetro da Lua Cheia', emoji: '🌕✨', dano: '4d8', bonusAtaque: 5, bonusInt: 4, magico: true, raridade: 'lendario', tipo: 'arma', somenteDrop: true },
        { id: 'grande_arco_meteoro', nome: 'Grande Arco Meteoro', emoji: '🌠🏹', dano: '4d10', bonusAtaque: 6, bonusCrit: 5, raridade: 'lendario', tipo: 'arma', classe: 'arqueiro', somenteDrop: true },
        { id: 'katana_scarlet', nome: 'Katana Scarlet Rot', emoji: '🌸🗡️', dano: '5d10', bonusAtaque: 6, debuff: 'veneno', bonusAgi: 2, raridade: 'lendario', tipo: 'arma', somenteDrop: true },
        { id: 'garras_trovao', nome: 'Garras do Dragão Ancestral', emoji: '🐉⚡', dano: '5d12', bonusAtaque: 7, danoExtra: 'raio', raridade: 'ancestral', tipo: 'arma', somenteDrop: true },
        { id: 'espadon_criacao', nome: 'Espadão da Criação', emoji: '🦁✨⚔️', dano: '6d12+4', bonusAtaque: 8, bonusCA: 1, raridade: 'ancestral', tipo: 'arma', somenteDrop: true },

        // ===== TROFÉUS ÚNICOS DE BOSS =====
        { id: 'trofeu_rei_goblin', nome: 'Troféu do Rei Goblin', emoji: '👑👺🏆', tipo: 'legendario', raridade: 'raro', bonusHP: 20, bonusAtaque: 1, somenteDrop: true },
        { id: 'trofeu_bruxa_negra', nome: 'Troféu da Bruxa Negra', emoji: '🧙‍♀️🌑🏆', tipo: 'legendario', raridade: 'raro', bonusInt: 2, resistMagica: 10, somenteDrop: true },
        { id: 'trofeu_senhor_dragao', nome: 'Troféu do Senhor Dragão', emoji: '🐉👑🏆', tipo: 'legendario', raridade: 'epico', bonusAtaque: 2, resistFogo: 15, somenteDrop: true },
        { id: 'trofeu_lich_antigo', nome: 'Troféu do Lich Antigo', emoji: '💀🔮🏆', tipo: 'legendario', raridade: 'raro', bonusInt: 2, bonusCA: 1, somenteDrop: true },
        { id: 'trofeu_rainha_aranhas', nome: 'Troféu da Rainha das Aranhas', emoji: '🕷️👑🏆', tipo: 'legendario', raridade: 'raro', bonusAgi: 2, bonusAtaque: 1, somenteDrop: true },
        { id: 'trofeu_titan_pedra', nome: 'Troféu do Titã de Pedra', emoji: '🪨👹🏆', tipo: 'legendario', raridade: 'epico', bonusHP: 60, bonusCA: 2, somenteDrop: true },
        { id: 'trofeu_hidra_venenosa', nome: 'Troféu da Hidra Venenosa', emoji: '🐍🐍🐍🏆', tipo: 'legendario', raridade: 'epico', resistFogo: 10, resistFrio: 10, bonusHP: 40, somenteDrop: true },
        { id: 'trofeu_cavaleiro_carmesim', nome: 'Troféu do Cavaleiro Carmesim', emoji: '🛡️🔥🏆', tipo: 'legendario', raridade: 'epico', bonusCA: 2, bonusAtaque: 2, somenteDrop: true },
        { id: 'trofeu_arauto_tempestade', nome: 'Troféu do Arauto da Tempestade', emoji: '🌩️👁️🏆', tipo: 'legendario', raridade: 'epico', resistMagica: 15, bonusCrit: 5, somenteDrop: true },
        { id: 'trofeu_margit', nome: 'Troféu de Margit', emoji: '🦊⚔️🏆', tipo: 'legendario', raridade: 'epico', bonusAtaque: 3, bonusHP: 30, somenteDrop: true },
        { id: 'trofeu_godrick', nome: 'Troféu de Godrick', emoji: '🦾👑🏆', tipo: 'legendario', raridade: 'lendario', bonusAtaque: 4, bonusFor: 2, somenteDrop: true },
        { id: 'trofeu_rennala', nome: 'Troféu de Rennala', emoji: '🌕🔮🏆', tipo: 'legendario', raridade: 'lendario', bonusInt: 4, resistMagica: 20, somenteDrop: true },
        { id: 'trofeu_radahn', nome: 'Troféu de Radahn', emoji: '🌠🏇🏆', tipo: 'legendario', raridade: 'lendario', bonusAtaque: 4, bonusCA: 2, somenteDrop: true },
        { id: 'trofeu_malenia', nome: 'Troféu de Malenia', emoji: '🌸⚔️🏆', tipo: 'legendario', raridade: 'lendario', bonusAgi: 3, lifesteal: 5, somenteDrop: true },
        { id: 'trofeu_placidusax', nome: 'Troféu de Placidusax', emoji: '🐉⚡🏆', tipo: 'legendario', raridade: 'ancestral', bonusAtaque: 5, resistFogo: 20, resistFrio: 20, somenteDrop: true },
        { id: 'trofeu_fera_dourada', nome: 'Troféu da Fera Dourada', emoji: '🦁✨🏆', tipo: 'legendario', raridade: 'ancestral', bonusCA: 3, bonusHP: 120, somenteDrop: true }
    ]
};

// ==================== FUNCOES DE GERAÇÃO DE ITEMS COM AFFIXES ====================

/**
 * Gera um affix aleatório baseado no tipo
 * @param {string} tipo - 'prefixo_arma', 'sufixo_arma', 'prefixo_armadura', 'sufixo_armadura'
 * @returns {object} O affix selecionado
 */
export function gerarAlfixAleatorio(tipo) {
    const affixes = AFFIXES[tipo];
    if (!affixes || affixes.length === 0) return null;
    return affixes[Math.floor(Math.random() * affixes.length)];
}

/**
 * Gera uma raridade aleatória baseada em chance
 * @returns {string} A raridade (comum, incomum, raro, epico, lendario, ancestral)
 */
export function gerarRaridadeAleatoria() {
    const chance = Math.random() * 100;
    
    if (chance < 50) return 'comum';        // 50%
    if (chance < 75) return 'incomum';      // 25%
    if (chance < 88) return 'raro';         // 13%
    if (chance < 96) return 'epico';        // 8%
    if (chance < 99) return 'lendario';     // 3%
    return 'ancestral';                     // 1%
}

/**
 * Cria um item com affixes aleatórios
 * @param {object} itemBase - Item base da loja
 * @param {string} raridade - Raridade desejada (opcional)
 * @returns {object} Item com affixes e propriedades extras
 */
export function gerarItemComAffixes(itemBase, raridade = null) {
    const itemRaridade = raridade || gerarRaridadeAleatoria();
    const raridadeData = RARIDADES[itemRaridade];
    
    if (!raridadeData) {
        return itemBase; // Fallback
    }
    
    // Copiar item base
    const item = { ...itemBase };
    item.raridade = itemRaridade;
    item.emoji = raridadeData.emoji + ' ' + item.emoji;
    item.affixes = [];
    
    // Adicionar affixes baseado na raridade
    const numAffixes = raridadeData.affixes;
    
    if (item.tipo === 'arma') {
        // Adicionar prefixos
        for (let i = 0; i < Math.ceil(numAffixes / 2); i++) {
            const prefixo = gerarAlfixAleatorio('prefixos_arma');
            if (prefixo) {
                item.affixes.push({ tipo: 'prefixo', ...prefixo });
                // Aplicar bônus
                Object.keys(prefixo).forEach(key => {
                    if (key !== 'nome' && key !== 'emoji') {
                        item[key] = (item[key] || 0) + prefixo[key];
                    }
                });
            }
        }
        
        // Adicionar sufixos
        for (let i = 0; i < Math.floor(numAffixes / 2); i++) {
            const sufixo = gerarAlfixAleatorio('sufixos_arma');
            if (sufixo) {
                item.affixes.push({ tipo: 'sufixo', ...sufixo });
                // Aplicar bônus
                Object.keys(sufixo).forEach(key => {
                    if (key !== 'nome' && key !== 'emoji') {
                        item[key] = (item[key] || 0) + sufixo[key];
                    }
                });
            }
        }
    } else if (item.tipo === 'armadura') {
        // Adicionar prefixos
        for (let i = 0; i < Math.ceil(numAffixes / 2); i++) {
            const prefixo = gerarAlfixAleatorio('prefixos_armadura');
            if (prefixo) {
                item.affixes.push({ tipo: 'prefixo', ...prefixo });
                // Aplicar bônus
                Object.keys(prefixo).forEach(key => {
                    if (key !== 'nome' && key !== 'emoji') {
                        item[key] = (item[key] || 0) + prefixo[key];
                    }
                });
            }
        }
        
        // Adicionar sufixos
        for (let i = 0; i < Math.floor(numAffixes / 2); i++) {
            const sufixo = gerarAlfixAleatorio('sufixos_armadura');
            if (sufixo) {
                item.affixes.push({ tipo: 'sufixo', ...sufixo });
                // Aplicar bônus
                Object.keys(sufixo).forEach(key => {
                    if (key !== 'nome' && key !== 'emoji') {
                        item[key] = (item[key] || 0) + sufixo[key];
                    }
                });
            }
        }
    }
    
    // Ajustar preço baseado em raridade
    item.precoVenda = Math.floor(item.preco * raridadeData.venda);
    
    return item;
}

/**
 * Formata um item para exibição visual
 * @param {object} item - O item a formatar
 * @returns {string} String formatada do item
 */
export function formatarItem(item) {
    let texto = `${item.emoji} ${item.nome}`;
    
    // Adicionar affixes se houver
    if (item.affixes && item.affixes.length > 0) {
        const affixesNome = item.affixes.map(a => `${a.emoji || ''} ${a.nome}`).join(', ');
        texto += `\n     *${affixesNome}*`;
    }
    
    // Adicionar stats principais
    if (item.dano) texto += `\n     ⚔️ Dano: ${item.dano}`;
    if (item.bonusAtaque) texto += `\n     💢 ATK: +${item.bonusAtaque}`;
    if (item.bonusCA) texto += `\n     🛡️ CA: +${item.bonusCA}`;
    if (item.bonusHP) texto += `\n     ❤️ HP: +${item.bonusHP}`;
    if (item.bonusInt) texto += `\n     🧠 INT: +${item.bonusInt}`;
    if (item.bonusFor) texto += `\n     💪 FOR: +${item.bonusFor}`;
    if (item.bonusAgi) texto += `\n     ⚡ AGI: +${item.bonusAgi}`;
    if (item.lifesteal) texto += `\n     🧛 Lifesteal: ${item.lifesteal}%`;
    if (item.resistFogo) texto += `\n     🔥 Resist Fogo: +${item.resistFogo}%`;
    if (item.resistMagica) texto += `\n     🔵 Resist Magia: +${item.resistMagica}%`;
    
    return texto;
}

// ==================== FUNCOES UTILITARIAS ====================

// Rolar dado (ex: "2d6+3" retorna o resultado)
export function rolarDado(dado) {
    try {
        if (typeof dado === 'number') return dado;
        
        // Garantir que é string
        if (!dado || typeof dado !== 'string') {
            console.warn('[RPG] rolarDado recebeu valor inválido:', dado);
            return 0;
        }
        
        const match = dado.match(/(\d+)?d(\d+)([+-]\d+)?/);
        if (!match) {
            console.warn('[RPG] rolarDado não conseguiu fazer parse:', dado);
            return 0;
        }
        
        const quantidade = parseInt(match[1]) || 1;
        const faces = parseInt(match[2]);
        const modificador = parseInt(match[3]) || 0;
        
        let total = 0;
        for (let i = 0; i < quantidade; i++) {
            total += Math.floor(Math.random() * faces) + 1;
        }
        
        return total + modificador;
    } catch (error) {
        console.error('[RPG] Erro ao rolar dado:', error, 'dado:', dado);
        return 0;
    }
}

// Rolar d20
export function rolarD20() {
    return Math.floor(Math.random() * 20) + 1;
}

// ==================== FUNCOES DE DADOS ====================

function loadData() {
    try {
        if (fs.existsSync(RPG_FILE)) {
            const data = fs.readFileSync(RPG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('[RPG] Erro ao carregar dados:', e);
    }
    return { players: {} };
}

function saveData(data) {
    try {
        fs.writeFileSync(RPG_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('[RPG] Erro ao salvar dados:', e);
    }
}

// ==================== FUNCOES DO JOGADOR ====================

export function getPlayer(senderId) {
    const data = loadData();
    return data.players[senderId] || null;
}

export function playerExists(senderId) {
    return getPlayer(senderId) !== null;
}

export function deletarJogador(senderId) {
    const data = loadData();
    if (data.players[senderId]) {
        delete data.players[senderId];
        saveData(data);
        return true;
    }
    return false;
}

// Calcular modificador de atributo (estilo D&D: (attr - 10) / 2)
export function getModificador(valor) {
    return Math.floor((valor - 10) / 2);
}

// XP necessario para proximo level
export function xpParaLevel(level) {
    // Tabela simplificada e mais acessivel
    // Level 1->2: 100 XP (4 ratos ou 2 goblins)
    // Level 2->3: 200 XP
    // Level 3->4: 400 XP
    // Formula: 100 * (1.5 ^ (level-1))
    if (level <= 1) return 100;
    if (level <= 5) return Math.floor(100 * Math.pow(1.5, level - 1));
    if (level <= 10) return Math.floor(500 * Math.pow(1.4, level - 5));
    if (level <= 20) return Math.floor(2000 * Math.pow(1.3, level - 10));
    return Math.floor(20000 + (level - 20) * 5000);
}

// Calcular HP maximo (Elden Ring style: Vigor e Resistência importam)
export function calcularHpMax(player) {
    player = migrarPersonagem(player);
    
    const classe = CLASSES[player.classe] || CLASSES.guerreiro;
    const raca = RACAS[player.raca] || RACAS.humano;
    const modVig = getModificador(player.atributos?.vigor || 10);
    const modRes = getModificador(player.atributos?.resistencia || 10);
    
    // HP = hitDie no level 1 + (media do hitDie + modVig + metade do modRes) por level
    // Resistência concede durabilidade extra sem escalar demais
    let hp = classe.hitDie + modVig + Math.floor(modRes / 2);
    for (let i = 2; i <= player.level; i++) {
        hp += Math.floor(classe.hitDie / 2) + 1 + modVig + Math.floor(modRes / 2);
    }
    
    // Bonus racial (anao)
    if (raca.hpBonus) {
        hp = Math.floor(hp * raca.hpBonus);
    }
    
    return Math.max(hp, 10); // Minimo 10 HP
}

// Calcular Classe de Armadura (CA)
export function calcularCA(player) {
    player = migrarPersonagem(player);
    
    // CA básica usa Destreza; Resistência adiciona um pequeno reforço defensivo
    const modDes = getModificador(player.atributos?.destreza || 10);
    const bonusRes = Math.max(0, Math.floor(getModificador(player.atributos?.resistencia || 10) / 2));
    
    let ca = 10 + modDes + bonusRes;
    
    // Bonus de armadura
    if (player.equipado?.armadura) {
        const armadura = LOJA_ITENS.armaduras.find(i => i.id === player.equipado.armadura);
        if (armadura) ca += armadura.bonusCA;
    }
    
    return ca;
}

// Migrar personagem antigo para o novo sistema
export function migrarPersonagem(player) {
    // Migração para novo sistema de atributos (Elden Ring style)
    const atributosNovos = ['vigor', 'resistencia', 'forca', 'destreza', 'inteligencia', 'fe', 'sorte'];
    const precisaMigrar = !player.atributos || atributosNovos.some(a => player.atributos[a] === undefined);
    if (precisaMigrar) {
        const raca = player.raca || 'humano';
        const racaInfo = RACAS[raca] || RACAS.humano;
        const classeInfo = CLASSES[player.classe] || CLASSES.guerreiro;

        // Pontos investidos nos atributos antigos (para devolver como pontos livres)
        const antigos = player.atributos || {};
        const pontosInvestidos = ['forca', 'destreza', 'inteligencia', 'sorte']
            .reduce((s, k) => s + Math.max(0, (antigos[k] || 10) - 10), 0);
        const pontosLivres = player.pontosAtributos || 0;
        const totalPontos = Math.max(0, pontosInvestidos + pontosLivres);

        // Base 10 para todos os atributos + bônus de raca/classe (aplicado nos atributos pertinentes)
        player.atributos = {
            vigor: 10 + (racaInfo.bonus?.vigor || 0) + (classeInfo.bonus?.vigor || 0),
            resistencia: 10 + (racaInfo.bonus?.resistencia || 0) + (classeInfo.bonus?.resistencia || 0),
            forca: 10 + (racaInfo.bonus?.forca || 0) + (classeInfo.bonus?.forca || 0),
            destreza: 10 + (racaInfo.bonus?.destreza || 0) + (classeInfo.bonus?.destreza || 0),
            inteligencia: 10 + (racaInfo.bonus?.inteligencia || 0) + (classeInfo.bonus?.inteligencia || 0),
            fe: 10 + (racaInfo.bonus?.fe || 0) + (classeInfo.bonus?.fe || 0),
            sorte: 10 + (racaInfo.bonus?.sorte || 0) + (classeInfo.bonus?.sorte || 0)
        };

        player.pontosAtributos = totalPontos;

        // Salvar a migracao
        const data = loadData();
        const senderId = Object.keys(data.players).find(id => data.players[id] === player);
        if (senderId) {
            data.players[senderId] = player;
            saveData(data);
        }
    }
    
    // Se nao tem raca, definir como humano
    if (!player.raca) {
        player.raca = 'humano';
    }
    
    // Se nao tem equipado, criar estrutura
    if (!player.equipado) {
        player.equipado = { arma: null, armadura: null };
    }

    // Migrar lista de bosses derrotados para IDs unicos e ordenar por progressao
    const bossesOrdenados = [...BOSSES].sort((a, b) => a.level - b.level);
    const derrotadosStat = Math.max(0, player.stats?.bossesDerrotados || 0);
    if (!Array.isArray(player.bossesDerrotadosIds)) {
        player.bossesDerrotadosIds = [];
    }
    // Somente reconstruir lista se ela estiver vazia (dados antigos sem IDs)
    if (player.bossesDerrotadosIds.length === 0 && derrotadosStat > 0) {
        const alvoQtd = Math.min(derrotadosStat, bossesOrdenados.length);
        for (let i = 0; i < alvoQtd; i++) {
            const bossId = bossesOrdenados[i].id;
            if (!player.bossesDerrotadosIds.includes(bossId)) {
                player.bossesDerrotadosIds.push(bossId);
            }
        }
    }
    
    return player;
}

// Calcular bonus de ataque
export function calcularBonusAtaque(player) {
    player = migrarPersonagem(player);
    
    const classe = CLASSES[player.classe];
    const atributoPrincipal = classe?.atributoPrincipal || 'forca';
    const atributoValor = player.atributos[atributoPrincipal] || 10;
    
    let bonus = getModificador(atributoValor);
    
    // Proficiencia (aumenta a cada 4 levels)
    bonus += Math.floor(player.level / 4) + 2;
    
    // Bonus de arma e escalonamento extra opcional
    if (player.equipado?.arma) {
        const arma = LOJA_ITENS.armas.find(i => i.id === player.equipado.arma);
        if (arma) {
            bonus += arma.bonusAtaque || 0;
            const { escala, afinidade } = getEscalaArma(arma, player.classe);
            const modEscala =
                (getModificador(player.atributos.forca || 10) * escala.forca) +
                (getModificador(player.atributos.destreza || 10) * escala.destreza) +
                (getModificador(player.atributos.inteligencia || 10) * escala.inteligencia) +
                (getModificador(player.atributos.fe || 10) * escala.fe) +
                (getModificador(player.atributos.sorte || 10) * escala.sorte);
            bonus += Math.floor(modEscala);
            const afinidadeData = afinidade ? AFINIDADES_ELDEN[afinidade] : null;
            if (afinidadeData?.bonusAtaqueFlat) {
                bonus += afinidadeData.bonusAtaqueFlat;
            }
        }
    }
    
    return bonus;
}

// Calcular dano
export function calcularDano(player) {
    player = migrarPersonagem(player);
    
    const classe = CLASSES[player.classe];
    const atributoPrincipal = classe?.atributoPrincipal || 'forca';
    const atributoValor = player.atributos[atributoPrincipal] || 10;
    
    let dadoDano = '1d4'; // Desarmado
    let bonusPlano = 0; // Bônus extra (de classe ou item)
    let bonusEscala = 0;
    let afinidadeData = null;
    
    if (player.equipado?.arma) {
        const arma = LOJA_ITENS.armas.find(i => i.id === player.equipado.arma);
        if (arma) {
            dadoDano = arma.dano;
            if (arma.bonusInt && atributoPrincipal === 'inteligencia') {
                bonusPlano = arma.bonusInt;
            }
            const { escala, afinidade } = getEscalaArma(arma, player.classe);
            afinidadeData = afinidade ? AFINIDADES_ELDEN[afinidade] : null;
            bonusEscala =
                (getModificador(player.atributos.forca || 10) * escala.forca) +
                (getModificador(player.atributos.destreza || 10) * escala.destreza) +
                (getModificador(player.atributos.inteligencia || 10) * escala.inteligencia) +
                (getModificador(player.atributos.fe || 10) * escala.fe) +
                (getModificador(player.atributos.sorte || 10) * escala.sorte);
        }
    }
    
    let modificador = getModificador(atributoValor) + bonusPlano + Math.floor(bonusEscala);
    
    // Bônus extra de dano para classes arcanas
    if (classe?.bonosDanoInt && atributoPrincipal === 'inteligencia') {
        modificador = Math.floor(modificador * classe.bonosDanoInt);
    }

    if (afinidadeData?.bonusDanoPercent) {
        modificador = Math.floor(modificador * (1 + afinidadeData.bonusDanoPercent));
    }
    
    return { dado: dadoDano, modificador };
}

// Criar novo jogador
export function criarJogador(senderId, nome, raca, classe) {
    const data = loadData();
    
    const racaInfo = RACAS[raca];
    const classeInfo = CLASSES[classe];
    if (!racaInfo || !classeInfo) return null;
    
    // Atributos base Elden Ring (10) + bonus de raca/classe quando existir
    const atributos = {
        vigor: 10 + (racaInfo.bonus?.vigor || 0) + (classeInfo.bonus?.vigor || 0),
        resistencia: 10 + (racaInfo.bonus?.resistencia || 0) + (classeInfo.bonus?.resistencia || 0),
        forca: 10 + (racaInfo.bonus?.forca || 0) + (classeInfo.bonus?.forca || 0),
        destreza: 10 + (racaInfo.bonus?.destreza || 0) + (classeInfo.bonus?.destreza || 0),
        inteligencia: 10 + (racaInfo.bonus?.inteligencia || 0) + (classeInfo.bonus?.inteligencia || 0),
        fe: 10 + (racaInfo.bonus?.fe || 0) + (classeInfo.bonus?.fe || 0),
        sorte: 10 + (racaInfo.bonus?.sorte || 0) + (classeInfo.bonus?.sorte || 0)
    };
    
    const novoJogador = {
        nome: nome,
        raca: raca,
        classe: classe,
        level: 1,
        xp: 0,
        atributos: atributos,
        pontosAtributos: 0, // Pontos livres para distribuir ao upar
        hp: 0, // Sera calculado abaixo
        ouro: 50,
        elo: 1600, // ELO Rating para duelos (1600 = intermediário)
        inventario: [],
        equipado: { arma: null, armadura: null },
        stats: {
            monstrosMortos: 0,
            duelosVencidos: 0,
            duelosPerdidos: 0,
            criticos: 0,
            falhasCriticas: 0,
            dueloStreak: 0,
            dueloXpPerdido: 0,
            bossesDerrotados: 0
        },
        cooldowns: { cacar: 0, duelo: 0, boss: 0, daily: null, roubar: 0 },
        criado: Date.now()
    };
    
    // Calcular HP inicial
    data.players[senderId] = novoJogador;
    novoJogador.hp = calcularHpMax(novoJogador);
    
    saveData(data);
    return novoJogador;
}

// Atualizar jogador
export function updatePlayer(senderId, updates) {
    const data = loadData();
    if (!data.players[senderId]) return null;
    
    data.players[senderId] = { ...data.players[senderId], ...updates };
    saveData(data);
    
    return data.players[senderId];
}

// Adicionar XP
export function adicionarXP(senderId, quantidade) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return null;
    
    // Migrar personagem antigo se necessario
    player = migrarPersonagem(player);
    data.players[senderId] = player;
    
    // Bonus de XP racial (humano)
    const raca = RACAS[player.raca] || RACAS.humano;
    if (raca.xpBonus) {
        quantidade = Math.floor(quantidade * raca.xpBonus);
    }
    
    player.xp += quantidade;
    let levelUp = false;
    let levelsGanhos = 0;
    
    while (player.xp >= xpParaLevel(player.level) && player.level < 100) {
        player.xp -= xpParaLevel(player.level);
        player.level++;
        levelsGanhos++;
        levelUp = true;

        // +3 pontos de atributo a cada level (Elden Ring style)
        player.pontosAtributos = (player.pontosAtributos || 0) + 3;
        
        // Bonus de atributo a cada 4 levels no atributo principal
        if (player.level % 4 === 0 && player.atributos) {
            // Aumenta atributo principal da classe
            const classe = CLASSES[player.classe];
            const atributoPrincipal = classe?.atributoPrincipal;
            if (atributoPrincipal && player.atributos[atributoPrincipal] !== undefined) {
                player.atributos[atributoPrincipal] += 1;
            }
        }
    }
    
    if (levelUp) {
        player.hp = calcularHpMax(player); // Restaura HP ao subir de level
    }
    
    saveData(data);
    return { player, levelUp, levelsGanhos, xpGanho: quantidade };
}

// Modificar ouro
export function modificarOuro(senderId, quantidade) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.ouro = Math.max(0, player.ouro + quantidade);
    saveData(data);
    return player;
}

// Modificar HP
export function modificarHP(senderId, quantidade) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    const hpMax = calcularHpMax(player);
    player.hp = Math.max(0, Math.min(hpMax, player.hp + quantidade));
    saveData(data);
    return player;
}

// Adicionar item
export function adicionarItem(senderId, itemId) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.inventario.push(itemId);
    saveData(data);
    return player;
}

// Remover item
export function removerItem(senderId, itemId) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    const index = player.inventario.indexOf(itemId);
    if (index > -1) {
        player.inventario.splice(index, 1);
        saveData(data);
    }
    return player;
}

// Equipar item
export function equiparItem(senderId, itemId) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return { sucesso: false, motivo: 'Jogador nao encontrado' };
    
    if (!player.inventario.includes(itemId)) {
        return { sucesso: false, motivo: 'Voce nao possui este item' };
    }
    
    let item = LOJA_ITENS.armas.find(i => i.id === itemId);
    let slot = 'arma';
    
    if (!item) {
        item = LOJA_ITENS.armaduras.find(i => i.id === itemId);
        slot = 'armadura';
    }
    
    if (!item) {
        return { sucesso: false, motivo: 'Item invalido para equipar' };
    }
    
    const itemAnterior = player.equipado[slot];
    player.equipado[slot] = itemId;
    
    saveData(data);
    return { sucesso: true, item, slot, itemAnterior };
}

// Cooldowns
export function setCooldown(senderId, tipo, tempo) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.cooldowns[tipo] = tempo;
    saveData(data);
    return player;
}

export function verificarCooldown(senderId, tipo) {
    const player = getPlayer(senderId);
    if (!player) return { emCooldown: false };
    
    const agora = Date.now();
    const cooldown = player.cooldowns[tipo];
    
    if (tipo === 'daily') {
        const hoje = new Date().toDateString();
        return { emCooldown: cooldown === hoje, tempoRestante: 0 };
    }
    
    if (cooldown && cooldown > agora) {
        return { emCooldown: true, tempoRestante: cooldown - agora };
    }
    
    return { emCooldown: false, tempoRestante: 0 };
}

// Estatisticas
export function incrementarStat(senderId, stat, quantidade = 1) {
    const data = loadData();
    const player = data.players[senderId];
    if (!player) return null;
    
    player.stats[stat] = (player.stats[stat] || 0) + quantidade;
    saveData(data);
    return player;
}

// Calcular vantagem de duelo (baseado em level gap e streak)
export function calcularVantagemDuelo(jogadorMais, jogadorMenos) {
    const levelGap = jogadorMais.level - jogadorMenos.level;
    let vantagem = 0;
    
    // Cada 3 levels = +1 de vantagem
    if (levelGap > 0) {
        vantagem = Math.floor(levelGap / 3);
    }
    
    // Bônus de streak
    const streakVantagem = Math.floor((jogadorMais.stats?.dueloStreak || 0) / 5);
    
    return vantagem + streakVantagem;
}

// Ranking
export function getRanking(limite = 10) {
    const data = loadData();
    const players = Object.entries(data.players)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.xp - a.xp;
        })
        .slice(0, limite);
    
    return players;
}

// Ranking de ELO
export function getRankingELO(limite = 10) {
    const data = loadData();
    const players = Object.entries(data.players)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => (b.elo || 1600) - (a.elo || 1600))
        .slice(0, limite);
    
    return players;
}

// Ranking de Bosses derrotados
export function getRankingBosses(limite = 10) {
    const data = loadData();
    const players = Object.entries(data.players)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => {
            const bossA = b.stats?.bossesDerrotados || 0;
            const bossB = a.stats?.bossesDerrotados || 0;
            if (bossA !== bossB) return bossA - bossB; // primeiro por bosses
            if (b.level !== a.level) return b.level - a.level; // desempate por level
            return b.xp - a.xp; // desempate por XP
        })
        .slice(0, limite);
    return players;
}

// Calcular mudança de ELO para dois jogadores
export function calcularMudancaELO(vencedor, perdedor) {
    const eloV = vencedor.elo || 1600;
    const eloP = perdedor.elo || 1600;
    
    // K-factor padrão é 32, mas escalamos por level para tornar competição mais equilibrada
    // Jogadores de baixo level ganham/perdem menos ELO
    const kVencedor = 32;
    const kPerdedor = 32;
    
    // Fórmula de ELO esperado: 1 / (1 + 10^((eloOponente - eloJogador) / 400))
    const expectedV = 1 / (1 + Math.pow(10, (eloP - eloV) / 400));
    const expectedP = 1 / (1 + Math.pow(10, (eloV - eloP) / 400));
    
    // Resultado: 1 para vitória, 0 para derrota
    const novoEloVencedor = Math.round(eloV + kVencedor * (1 - expectedV));
    const novoEloPerdedor = Math.round(eloP + kPerdedor * (0 - expectedP));
    
    // Garantir que ELO não fica muito baixo
    return {
        novoEloVencedor: Math.max(1200, novoEloVencedor),
        novoEloPerdedor: Math.max(1200, novoEloPerdedor),
        ganhoVencedor: novoEloVencedor - eloV,
        perdaPerdedor: novoEloPerdedor - eloP
    };
}

// Obter badge de ELO baseado em rating
export function getBadgeELO(elo) {
    if (elo < 1400) return '🥉 Bronze';
    if (elo < 1600) return '🥈 Prata';
    if (elo < 1800) return '🥇 Ouro';
    if (elo < 2000) return '💎 Platina';
    return '👑 Diamante';
}

export async function handleFugir(sock, msg, jid, sender, reply, react) {
    // 1. Validação inicial do jogador e estado de combate
    const player = getPlayer(sender); // Função utilitária para buscar os dados do jogador
    if (!player) {
        return reply(`Você precisa criar um personagem primeiro! Use *${CONFIG.PREFIX}criarpj*`);
    }

    if (!player.emCombate) {
        return reply("Você não está em combate no momento!");
    }

    // 2. Cálculo da Chance de Fuga
    // A Destreza é um atributo comum para determinar agilidade e capacidade de escapar.
    const modificadorDES = getModificador(player.atributos.destreza); // Calcula o modificador do atributo Destreza
    
    // Chance base de 50% + bônus do modificador de Destreza.
    // Cada ponto no modificador de Destreza adiciona 5% à chance de fuga.
    let chanceFugaCalculada = 50 + (modificadorDES * 5); 
    
    // Limites de Chance: Garante que a fuga nunca seja 100% garantida ou 0% possível,
    // mantendo a tensão e a possibilidade de sucesso/falha.
    const CHANCE_MINIMA = 20; // Chance mínima de fuga (ex: mesmo um personagem lento tem uma pequena chance)
    const CHANCE_MAXIMA = 80; // Chance máxima de fuga (ex: mesmo um personagem muito ágil pode ser pego de surpresa)
    const chanceFinal = Math.max(CHANCE_MINIMA, Math.min(CHANCE_MAXIMA, chanceFugaCalculada));
    
    // 3. Rolagem para Determinar Sucesso
    const rolagem = Math.random() * 100; // Gera um número aleatório entre 0 (inclusive) e 100 (exclusive)
    const sucesso = rolagem <= chanceFinal; // Se a rolagem for menor ou igual à chance, a fuga é bem-sucedida

    // 4. Processamento do Resultado da Fuga
    if (sucesso) {
        await react('🏃'); // Feedback visual de sucesso
        
        // Finaliza o estado de combate do jogador
        player.emCombate = false;
        player.monstroAtual = null; // Limpa a referência ao monstro atual
        updatePlayer(sender, player); // Salva as alterações no estado do jogador
        
        return reply(`✅ *Fuga bem sucedida!*\nVocê escapou do combate com sucesso! (Chance: ${Math.round(chanceFinal)}%)`);
    } else {
        await react('💢'); // Feedback visual de falha
        
        // Consequência da falha: O jogador sofre dano.
        // O dano é calculado como uma fração do dano normal do monstro para ser punitivo, mas não fatal.
        // É crucial que 'player.monstroAtual' esteja definido e contenha a propriedade 'dano'.
        const danoBaseMonstro = player.monstroAtual?.dano || 10; // Fallback para dano padrão se não houver monstro ou dano
        const danoSofrido = Math.max(1, Math.floor(rolarDado(danoBaseMonstro) / 2)); // rolarDado é uma função para simular uma rolagem de dado
        
        modificarHP(sender, -danoSofrido); // Função utilitária para aplicar dano ao HP do jogador
        
        return reply(`❌ *Fuga falhou!*\nVocê sofreu ${danoSofrido} de dano enquanto tentava fugir! (Chance: ${Math.round(chanceFinal)}%)`);
    }
}

// Função para obter um boss aleatório
export function getBossAleatorio() {
    return BOSSES[Math.floor(Math.random() * BOSSES.length)];
}

// Função para aplicar mecânicas especiais do boss
export function aplicarMecanicaBoss(boss, rodada, playerDano, playerAtaque) {
    let effect = {};
    
    switch(boss.mecanica) {
        case 'buffo_ataque':
            // A cada 3 rodadas, aumenta ATK do boss
            if (rodada % 3 === 0) {
                effect.danoMultiplier = 1.5;
                effect.naracao = '⚡ O Rei Goblin *GRITA* e seus olhos brilham!';
            }
            break;
            
        case 'regeneracao_e_debuff':
            // Regenera a cada 2 rodadas e reduz ATK do jogador
            if (rodada % 2 === 0) {
                effect.curaBoss = 15;
                effect.naracao = '🌑 A Bruxa Negra canaliza energia escura...';
            }
            effect.playerDanoReduction = 0.75;
            break;
            
        case 'fases_combate':
            // Alterna entre fases
            const fase = Math.floor((boss.hp / (200 / 3)) % 3) + 1;
            if (fase === 1) {
                effect.naracao = '🔥 O Dragão entra em FÚRIA! Seu ataque dobra!';
                effect.danoMultiplier = 2;
            } else if (fase === 2) {
                effect.curaBoss = 30;
                effect.naracao = '✨ O Dragão recupera sua energia!';
            }
            break;
            
        case 'invocacao_progressiva':
            // Aumenta CA progressivamente
            effect.caIncrease = Math.floor(rodada / 2);
            if (rodada % 3 === 0) {
                effect.playerAtaqueReduction = -2;
                effect.naracao = '👻 Espíritos invocados protegem o Lich!';
            }
            break;
            
        case 'veneno_e_defesa':
            // Veneno contínuo e aumenta defesa
            effect.playerVeneno = 5;
            effect.defesaIncrease = Math.floor(rodada * 0.1);
            if (rodada === 1) {
                effect.naracao = '☠️ A Rainha injeta VENENO em você!';
            }
            break;
    }
    
    return effect;
}

// Obter monstro baseado no level do jogador
export function getMonstroAleatorio(player) {
    const nivelJogador = player.level;
    
    // Calcula o CR máximo apropriado para o nível do jogador com dificuldade aumentada a partir do nível 5.
    // - Níveis 1-2: CR até 1 (fácil)
    // - Níveis 3-4: CR até 2 (moderado)
    // - Nível 5+: Dificuldade aumenta significativamente, monstros fortes aparecem com mais frequência
    let crMaximo;
    if (nivelJogador < 5) {
        crMaximo = Math.max(1, Math.floor(nivelJogador / 2));
    } else {
        // A partir do nível 5, aumenta muito mais a dificuldade
        crMaximo = Math.floor((nivelJogador - 3) / 1.5); // Progressão mais agressiva
    }
    
    // Filtra monstros cujo CR é menor ou igual ao CR máximo permitido para o nível do jogador.
    const monstrosElegiveis = MONSTROS.filter(m => {
        return m.cr <= crMaximo;
    });
    
    // Edge Case: Se, por algum motivo, nenhum monstro elegível for encontrado (o que não deve acontecer com a lista atual),
    // retorna o monstro mais fraco para evitar erros.
    if (monstrosElegiveis.length === 0) {
        console.warn("Nenhum monstro elegível encontrado para o nível do jogador. Retornando o monstro mais fraco.");
        return MONSTROS[0];
    }
    
    // A partir do nível 5, favorece monstros mais fortes (inverte o peso)
    let pesos;
    if (nivelJogador < 5) {
        // Peso normal: favorece monstros fracos
        pesos = monstrosElegiveis.map(m => 1 / (m.cr + 0.5));
    } else {
        // Peso invertido: favorece monstros fortes
        pesos = monstrosElegiveis.map(m => m.cr + 0.5);
    }
    
    const totalPesos = pesos.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalPesos;
    let pesoAcumulado = 0;
    
    // Itera sobre os monstros elegíveis para encontrar qual foi selecionado com base nos pesos.
    for (let i = 0; i < monstrosElegiveis.length; i++) {
        pesoAcumulado += pesos[i];
        if (random <= pesoAcumulado) {
            return monstrosElegiveis[i];
        }
    }
    
    // Fallback: Retorna o primeiro monstro elegível se o loop não encontrar um (por precaução).
    return monstrosElegiveis[0];
}

// Função para obter loot legendário com chance baseada no CR do monstro
export function getLootLendario(monstro, playerLevel) {
    // Chance de drop baseada no CR: CR 0.125 = 2%, CR 0.25 = 4%, CR 0.5 = 8%, CR 1 = 15%
    const chanceDrop = Math.min(monstro.cr * 15, 15);
    const roll = Math.random() * 100;
    
    if (roll > chanceDrop) {
        return null; // Sem loot
    }
    
    // 70% chance raro, 25% épico, 4% lendário, 1% ancestral
    const rarityRoll = Math.random() * 100;
    let raridade;
    if (rarityRoll < 70) raridade = 'raro';
    else if (rarityRoll < 95) raridade = 'epico';
    else if (rarityRoll < 99) raridade = 'lendario';
    else raridade = 'ancestral';
    
    // Escolher item aleatório
    const todasAsArmas = LOJA_ITENS.armas;
    const todasAsArmaduras = LOJA_ITENS.armaduras;
    const todosItems = [...todasAsArmas, ...todasAsArmaduras];
    
    const itemBase = todosItems[Math.floor(Math.random() * todosItems.length)];
    
    // Gerar item com affixes
    return gerarItemComAffixes(itemBase, raridade);
}

// ==================== SISTEMA DE ATRIBUTOS (ELDEN RING STYLE) ====================

export function distribuirPontoAtributo(senderId, atributo, pontos) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return { erro: 'Jogador não encontrado' };
    
    player = migrarPersonagem(player);
    
    // Verificar se tem pontos disponíveis
    if ((player.pontosAtributos || 0) <= 0) {
        return { erro: 'Você não tem pontos de atributo disponíveis' };
    }
    
    const atributoValido = ['vigor', 'resistencia', 'forca', 'destreza', 'inteligencia', 'fe', 'sorte'].includes(atributo.toLowerCase());
    if (!atributoValido) return { erro: 'Atributo inválido' };
    
    // Calcular pontos a distribuir (máximo do que tem disponível)
    const pontosSolicitados = Math.max(1, Math.min(pontos, player.pontosAtributos));
    
    // Distribuir os pontos
    const atributoNorm = atributo.toLowerCase();
    player.atributos[atributoNorm] += pontosSolicitados;
    player.pontosAtributos -= pontosSolicitados;
    
    // Sempre recalcular HP quando mexer em atributos defensivos (vigor/resistencia) ou zerar pontos
    if (['vigor', 'resistencia'].includes(atributoNorm) || player.pontosAtributos === 0) {
        player.hp = calcularHpMax(player);
    }
    
    data.players[senderId] = player;
    saveData(data);
    
    return {
        success: true,
        atributo: atributoNorm,
        pontos: pontosSolicitados,
        novoValor: player.atributos[atributoNorm],
        pontosRestantes: player.pontosAtributos
    };
}

export function obterPontosAtributos(senderId) {
    const player = getPlayer(senderId);
    if (!player) return null;
    const playerMig = migrarPersonagem(player);
    
    return {
        pontos: playerMig.pontosAtributos || 0,
        atributos: playerMig.atributos || {},
        level: playerMig.level
    };
}

// ==================== LEVELING DE ITENS ====================

/**
 * Inicializar estrutura de leveling de itens se não existir
 */
export function inicializarLevelingItens(player) {
    if (!player.inventarioLeveling) {
        player.inventarioLeveling = {};
    }
    if (!player.upgradeStones) {
        player.upgradeStones = { rara: 0, boss: 0 };
    }
    return player;
}

export function adicionarPedraUpgrade(senderId, key, quantidade = 1) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return { ok: false, motivo: 'Jogador não encontrado' };

    player = inicializarLevelingItens(player);
    const chave = key === 'boss' ? 'boss' : 'rara';
    player.upgradeStones[chave] = (player.upgradeStones[chave] || 0) + Math.max(1, quantidade);

    data.players[senderId] = player;
    saveData(data);
    return { ok: true, player };
}

/**
 * Adicionar XP a um item no inventário
 */
export function upgradeItemPagar(senderId, itemId) {
    const data = loadData();
    let player = data.players[senderId];
    if (!player) return { ok: false, motivo: 'Jogador não encontrado' };

    player = inicializarLevelingItens(player);

    if (!player.inventario.includes(itemId)) {
        return { ok: false, motivo: 'Você não possui este item' };
    }

    if (!player.inventarioLeveling[itemId]) {
        player.inventarioLeveling[itemId] = { level: 0 };
    }

    const levelAtual = player.inventarioLeveling[itemId].level || 0;
    if (levelAtual >= ITEM_MAX_LEVEL) {
        return { ok: false, motivo: 'Item já está no nível máximo', levelAtual };
    }

    const proximoLevel = levelAtual + 1;
    const gate = UPGRADE_GATES.find(g => proximoLevel <= g.maxLevel) || UPGRADE_GATES[UPGRADE_GATES.length - 1];

    if (player.level < gate.minPlayerLevel) {
        return { ok: false, motivo: 'Level mínimo', minPlayerLevel: gate.minPlayerLevel, proximoLevel };
    }

    if (gate.pedraKey) {
        const quantidade = player.upgradeStones?.[gate.pedraKey] || 0;
        if (quantidade <= 0) {
            return {
                ok: false,
                motivo: 'Pedra insuficiente',
                pedraKey: gate.pedraKey,
                pedraNome: gate.pedraNome,
                minPlayerLevel: gate.minPlayerLevel,
                proximoLevel,
            };
        }
        player.upgradeStones[gate.pedraKey] = quantidade - 1;
    }

    const custo = calcularCustoUpgrade(itemId, levelAtual);
    if ((player.ouro || 0) < custo) {
        return { ok: false, motivo: 'Ouro insuficiente', custo, levelAtual };
    }

    player.ouro -= custo;
    player.inventarioLeveling[itemId].level = proximoLevel;

    data.players[senderId] = player;
    saveData(data);

    return {
        ok: true,
        custo,
        levelAnterior: levelAtual,
        levelNovo: player.inventarioLeveling[itemId].level,
        bonusDanoPercent: Math.round(player.inventarioLeveling[itemId].level * ITEM_BONUS_PER_LEVEL * 100),
        pedraConsumida: gate.pedraKey ? { key: gate.pedraKey, nome: gate.pedraNome } : null,
        minPlayerLevel: gate.minPlayerLevel,
        gate,
    };
}

/**
 * Calcular bônus de um item baseado no seu nível
 */
export function calcularBonusLevelingItem(itemId, player) {
    if (!player?.inventarioLeveling?.[itemId]) {
        return {
            level: 0,
            bonusDanoMultiplier: 1,
            bonusCA: 0,
            bonusAtaque: 0
        };
    }
    
    const level = player.inventarioLeveling[itemId].level || 0;
    return {
        level,
        bonusDanoMultiplier: 1 + (level * ITEM_BONUS_PER_LEVEL),
        bonusCA: level,
        bonusAtaque: Math.floor(level / 2)
    };
}

/**
 * Obter informações de leveling de um item
 */
export function getInfoLevelingItem(itemId, player) {
    player = inicializarLevelingItens(player);
    
    if (!player.inventarioLeveling?.[itemId]) {
        const gateZero = UPGRADE_GATES.find(g => 1 <= g.maxLevel) || UPGRADE_GATES[0];
        return {
            level: 0,
            progressBar: '░░░░░░░░░░ 0%',
            descricao: '⭕ Novo (sem upgrade)',
            emoji: '⭕',
            custoProximo: calcularCustoUpgrade(itemId, 0),
            maxLevel: ITEM_MAX_LEVEL,
            reqLevelProximo: gateZero?.minPlayerLevel || 1,
            reqPedraProximo: gateZero?.pedraNome || null
        };
    }
    
    const dados = player.inventarioLeveling[itemId];
    const levelAtual = dados.level || 0;
    const percentual = Math.min(100, Math.round((levelAtual / ITEM_MAX_LEVEL) * 100));
    
    const barras = Math.floor(percentual / 10);
    const progressBar = '█'.repeat(barras) + '░'.repeat(10 - barras) + ` ${percentual}%`;
    
    const levelEmojis = ['⭕', '🟢', '🔵', '🟣', '🟡', '🌟', '💎', '👑'];
    const emoji = levelEmojis[Math.min(dados.level || 0, levelEmojis.length - 1)];

    const proximoLevel = levelAtual + 1;
    const gate = levelAtual >= ITEM_MAX_LEVEL ? null : (UPGRADE_GATES.find(g => proximoLevel <= g.maxLevel) || UPGRADE_GATES[UPGRADE_GATES.length - 1]);
    
    return {
        level: levelAtual,
        progressBar,
        descricao: `${emoji} Nível ${levelAtual}/${ITEM_MAX_LEVEL}`,
        emoji,
        custoProximo: levelAtual >= ITEM_MAX_LEVEL ? null : calcularCustoUpgrade(itemId, levelAtual),
        maxLevel: ITEM_MAX_LEVEL,
        reqLevelProximo: gate?.minPlayerLevel || null,
        reqPedraProximo: gate?.pedraNome || null
    };
}

export default {
    RACAS,
    CLASSES,
    MONSTROS,
    LOJA_ITENS,
    rolarDado,
    rolarD20,
    getPlayer,
    playerExists,
    getModificador,
    criarJogador,
    updatePlayer,
    adicionarXP,
    modificarOuro,
    modificarHP,
    adicionarItem,
    removerItem,
    equiparItem,
    setCooldown,
    verificarCooldown,
    incrementarStat,
    getRanking,
    getRankingELO,
    getRankingBosses,
    calcularMudancaELO,
    getBadgeELO,
    escalarMonstro,
    escalarBoss,
    getMonstroAleatorio,
    calcularHpMax,
    calcularCA,
    calcularBonusAtaque,
    calcularDano,
    xpParaLevel,
    calcularVantagemDuelo,
    
    // Quests
    obterQuestDoDia,
    obterTodasAsQuests,
    resetarQuestsDoDia,
    verificarProgressoQuest,
    completarQuest,
    obterStatusQuest,
    
    // Elos
    obterTierELO,
    obterBarraELO,
    TIERS_RANKING,
    
    // Affixes e Raridades
    gerarAlfixAleatorio,
    gerarRaridadeAleatoria,
    gerarItemComAffixes,
    formatarItem,
    AFFIXES,
    RARIDADES,
    
    // Sistema de Atributos
    distribuirPontoAtributo,
    obterPontosAtributos,
    
    // Upgrades de Itens
    inicializarLevelingItens,
    adicionarPedraUpgrade,
    upgradeItemPagar,
    calcularBonusLevelingItem,
    getInfoLevelingItem
};
