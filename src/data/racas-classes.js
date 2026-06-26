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
    },
     boyceta: {
        nome: 'Boyceta',
        emoji: '🏳️‍🌈',
        descricao: 'Nao quenta ver um fogo que quer queimar a ruela',
        bonus: { forca: 10, destreza: 4, inteligencia: 4, sorte: 5 },
        habilidade: 'Queimar Ruela: Recupera 25% do dano causado como HP',
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
        bonus: { forca: -1, destreza: 0, inteligencia: 4, sorte: 1 },
        habilidade: 'Bola de Fogo: Usa INT para ataque e dano (x1.35 bônus)',
        usaInteligencia: true,
        bonosDanoInt: 1.35 // 35% de bônus extra no dano por INT
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
        atributoPrincipal: 'inteligencia',
        bonus: { forca: 0, destreza: 0, inteligencia: 2, sorte: 2 },
        habilidade: 'Cura Divina: +20% HP ao vencer + INT no dano',
        curaAoVencer: 0.2,
        usaInteligencia: true
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
