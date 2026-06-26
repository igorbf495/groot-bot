// ==================== AFIXOS ====================

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

// ==================== RARIDADES DE ITENS ====================

export const RARIDADES = {
    comum: { emoji: '⚪', cor: '#808080', nome: 'Comum', venda: 1, affixes: 0 },
    incomum: { emoji: '🟢', cor: '#00FF00', nome: 'Incomum', venda: 1.3, affixes: 1 },
    raro: { emoji: '🔵', cor: '#0099FF', nome: 'Raro', venda: 1.6, affixes: 2 },
    epico: { emoji: '🟣', cor: '#9900FF', nome: 'Épico', venda: 2.0, affixes: 3 },
    lendario: { emoji: '🟡', cor: '#FFCC00', nome: 'Lendário', venda: 3.0, affixes: 4 },
    ancestral: { emoji: '🌟', cor: '#FFFFFF', nome: 'Ancestral', venda: 5.0, affixes: 5 }
};

// ==================== ITENS DA LOJA ====================

export const LOJA_ITENS = {
    armas: [
        // ===== ARMAS GERAIS =====
        { id: 'adaga', nome: 'Adaga', emoji: '🔪', preco: 50, dano: '1d4', bonusAtaque: 1, tipo: 'arma', raridade: 'comum' },
        { id: 'espada_curta', nome: 'Espada Curta', emoji: '🗡️', preco: 100, dano: '1d6', bonusAtaque: 1, tipo: 'arma', raridade: 'comum' },
        { id: 'espada_longa', nome: 'Espada Longa', emoji: '⚔️', preco: 250, dano: '1d8', bonusAtaque: 2, tipo: 'arma', raridade: 'incomum' },
        
        // ===== ARMAS DE GUERREIRO =====
        { id: 'machado_guerra', nome: 'Machado de Guerra', emoji: '🪓', preco: 400, dano: '1d10', bonusAtaque: 2, tipo: 'arma', classe: 'guerreiro', raridade: 'incomum' },
        { id: 'espada_grande', nome: 'Espada Grande', emoji: '⚔️', preco: 600, dano: '2d6', bonusAtaque: 3, tipo: 'arma', classe: 'guerreiro', raridade: 'raro' },
        { id: 'espada_mistica', nome: 'Espada Mistica', emoji: '✨⚔️', preco: 1500, dano: '2d8', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', bonusInt: 1 },
        { id: 'espada_dragao', nome: 'Espada do Dragao', emoji: '🐉⚔️', preco: 4000, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'maca_pesada', nome: 'Maca Pesada', emoji: '🔨', preco: 350, dano: '1d9+1', bonusAtaque: 2, tipo: 'arma', classe: 'guerreiro', raridade: 'incomum' },
        { id: 'alabarda', nome: 'Alabarda', emoji: '🗡️', preco: 800, dano: '1d10+2', bonusAtaque: 3, tipo: 'arma', classe: 'guerreiro', raridade: 'raro' },
        { id: 'lanca_tormenta', nome: 'Lanca da Tormenta', emoji: '🌩️', preco: 900, dano: '1d10+2', bonusAtaque: 3, tipo: 'arma', classe: 'guerreiro', raridade: 'raro', danoExtra: 'eletrico' },
        { id: 'martelo_trovao', nome: 'Martelo do Trovao', emoji: '⚡🔨', preco: 1800, dano: '2d8+2', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', bonusFor: 1 },
        { id: 'glaive_realeza', nome: 'Glaive da Realeza', emoji: '👑🗡️', preco: 2200, dano: '2d8+3', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', bonusCA: 1 },
        { id: 'espada_obsidiana', nome: 'Espada de Obsidiana', emoji: '🪨⚔️', preco: 2600, dano: '2d8+3', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', danoExtra: 'sombrio' },
        { id: 'machado_colosso', nome: 'Machado do Colosso', emoji: '🪓🏔️', preco: 3200, dano: '2d12', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', bonusFor: 2 },
        { id: 'claymore_sagrada', nome: 'Claymore Sagrada', emoji: '✨⚔️', preco: 2800, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', bonusHP: 50 },
        { id: 'lamina_furia', nome: 'Lamina da Furia', emoji: '🔥⚔️', preco: 2100, dano: '2d8+2', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', danoExtra: 'fogo' },
        { id: 'espada_gelo', nome: 'Espada de Gelo Negro', emoji: '❄️⚔️', preco: 1900, dano: '1d12+2', bonusAtaque: 4, tipo: 'arma', classe: 'guerreiro', raridade: 'epico', resistFrio: 15 },
        { id: 'flamberge', nome: 'Flamberge Incandescente', emoji: '🔥🗡️', preco: 3500, dano: '2d10+1', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'maca_impacto', nome: 'Maca de Impacto', emoji: '💥🔨', preco: 1200, dano: '1d12', bonusAtaque: 3, tipo: 'arma', classe: 'guerreiro', raridade: 'raro', desvan: -2 },
        { id: 'martelo_solar', nome: 'Martelo Solar', emoji: '🔨☀️', preco: 3600, dano: '2d12+2', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', danoExtra: 'luz' },
        { id: 'espada_ruina', nome: 'Espada da Ruina', emoji: '☄️⚔️', preco: 4200, dano: '3d8', bonusAtaque: 5, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', bonusFor: 1 },
        { id: 'lanca_titanica', nome: 'Lanca Titanica', emoji: '🗡️🏔️', preco: 4800, dano: '3d10', bonusAtaque: 6, tipo: 'arma', classe: 'guerreiro', raridade: 'lendario', bonusFor: 2 },
        { id: 'machado_eterno', nome: 'Machado Eterno', emoji: '🪓🌟', preco: 5500, dano: '3d12', bonusAtaque: 6, tipo: 'arma', classe: 'guerreiro', raridade: 'ancestral', bonusHP: 80 },
        
        // ===== ARMAS DE LADINO =====
        { id: 'adaga_envenenada', nome: 'Adaga Envenenada', emoji: '☠️', preco: 150, dano: '1d5+1', bonusAtaque: 2, tipo: 'arma', classe: 'ladino', raridade: 'raro', debuff: 'veneno' },
        { id: 'punhais_sombra', nome: 'Punhais da Sombra', emoji: '🌑', preco: 600, dano: '1d8+2', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'epico', bonusAgi: 2 },
        { id: 'adaga_vibora', nome: 'Adaga Víbora', emoji: '🐍', preco: 450, dano: '1d6+2', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'raro', debuff: 'veneno' },
        { id: 'punhal_silencio', nome: 'Punhal do Silencio', emoji: '🤫🗡️', preco: 700, dano: '1d8+1', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'raro', bonusCrit: 10 },
        { id: 'lame_danca', nome: 'Laminas Dancantes', emoji: '💃🗡️', preco: 1100, dano: '1d8+2', bonusAtaque: 4, tipo: 'arma', classe: 'ladino', raridade: 'epico', bonusAgi: 2 },
        { id: 'aguilhao', nome: 'Aguilhao Sombrio', emoji: '🦂', preco: 900, dano: '1d6+3', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'raro', debuff: 'sangramento' },
        { id: 'adaga_gelida', nome: 'Adaga Gelida', emoji: '❄️🗡️', preco: 850, dano: '1d6+2', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'raro', danoExtra: 'frio' },
        { id: 'chakram_vento', nome: 'Chakram do Vento', emoji: '💨🪃', preco: 1300, dano: '1d10', bonusAtaque: 4, tipo: 'arma', classe: 'ladino', raridade: 'epico', bonusAgi: 3 },
        { id: 'foice_lua', nome: 'Foice da Lua', emoji: '🌙🗡️', preco: 1500, dano: '1d12', bonusAtaque: 4, tipo: 'arma', classe: 'ladino', raridade: 'epico', bonusCrit: 15 },
        { id: 'punhais_etéreos', nome: 'Punhais Etereos', emoji: '👻🗡️', preco: 2000, dano: '2d6+2', bonusAtaque: 5, tipo: 'arma', classe: 'ladino', raridade: 'lendario', desvan: -5 },
        { id: 'lanca_oculta', nome: 'Lanca Oculta', emoji: '🕵️🗡️', preco: 1000, dano: '1d10', bonusAtaque: 3, tipo: 'arma', classe: 'ladino', raridade: 'raro', bonusAgi: 1 },
        { id: 'adaga_mistica', nome: 'Adaga Mistica', emoji: '✨🗡️', preco: 1700, dano: '1d8+3', bonusAtaque: 5, tipo: 'arma', classe: 'ladino', raridade: 'lendario', danoExtra: 'arcano' },
        { id: 'adaga_reduvia', nome: 'Adaga Reduvia', emoji: '🩸🔪', preco: 1900, dano: '2d6+1', bonusAtaque: 4, tipo: 'arma', classe: 'ladino', raridade: 'lendario', debuff: 'sangramento' },
        { id: 'misericordia', nome: 'Misericordia', emoji: '🗡️🩸', preco: 2100, dano: '2d6+2', bonusAtaque: 5, tipo: 'arma', classe: 'ladino', raridade: 'lendario', bonusCrit: 15 },
        { id: 'presa_sabueso', nome: 'Presa do Sabueso', emoji: '🐺🗡️', preco: 2400, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'ladino', raridade: 'lendario', bonusAgi: 2 },
        { id: 'punhais_draconicos', nome: 'Punhais Draconicos', emoji: '🐉🗡️', preco: 3200, dano: '3d6+2', bonusAtaque: 6, tipo: 'arma', classe: 'ladino', raridade: 'ancestral', danoExtra: 'fogo' },
        { id: 'adaga_fantasma', nome: 'Adaga Fantasma', emoji: '👻🔪', preco: 2100, dano: '2d6+3', bonusAtaque: 5, tipo: 'arma', classe: 'ladino', raridade: 'lendario', desvan: -3 },
        { id: 'laminas_tempestade', nome: 'Laminas da Tempestade', emoji: '🌩️🗡️', preco: 2300, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'ladino', raridade: 'lendario', danoExtra: 'eletrico' },
        { id: 'gume_da_noite', nome: 'Gume da Noite', emoji: '🌑⚡', preco: 2600, dano: '2d8+2', bonusAtaque: 6, tipo: 'arma', classe: 'ladino', raridade: 'lendario', bonusCrit: 20 },
        { id: 'punhais_draconicos', nome: 'Punhais Draconicos', emoji: '🐉🗡️', preco: 3200, dano: '3d6+2', bonusAtaque: 6, tipo: 'arma', classe: 'ladino', raridade: 'ancestral', danoExtra: 'fogo' },
        
        // ===== ARMAS DE CLÉRIGO =====
        { id: 'maca_sagrada', nome: 'Maca Sagrada', emoji: '✨🔨', preco: 200, dano: '1d6+1', bonusAtaque: 1, tipo: 'arma', classe: 'clerigo', raridade: 'incomum' },
        { id: 'martelo_luz', nome: 'Martelo da Luz', emoji: '☀️', preco: 500, dano: '1d8+2', bonusAtaque: 2, tipo: 'arma', classe: 'clerigo', raridade: 'raro', bonusInt: 1 },
        { id: 'bordao_bencao', nome: 'Bordao da Bencao', emoji: '✨🪶', preco: 1000, dano: '1d8+3', bonusAtaque: 3, tipo: 'arma', classe: 'clerigo', raridade: 'epico', bonusInt: 2 },
        { id: 'cetro_curador', nome: 'Cetro Curador', emoji: '💚🔱', preco: 700, dano: '1d6+2', bonusAtaque: 2, tipo: 'arma', classe: 'clerigo', raridade: 'raro', regenHP: 2 },
        { id: 'maça_exorcista', nome: 'Maca do Exorcista', emoji: '✝️🔨', preco: 1500, dano: '1d10', bonusAtaque: 3, tipo: 'arma', classe: 'clerigo', raridade: 'epico', danoExtra: 'sagrado' },
        { id: 'martelo_faith', nome: 'Martelo da Fe', emoji: '🙏🔨', preco: 1800, dano: '1d12', bonusAtaque: 4, tipo: 'arma', classe: 'clerigo', raridade: 'epico', bonusInt: 2 },
        { id: 'cajado_serafim', nome: 'Cajado Serafim', emoji: '👼🪄', preco: 2300, dano: '2d8', bonusAtaque: 4, tipo: 'arma', classe: 'clerigo', raridade: 'epico', manaRegen: 2 },
        { id: 'martelo_redencao', nome: 'Martelo da Redencao', emoji: '🕊️🔨', preco: 2600, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', bonusHP: 40 },
        { id: 'cetro_luz', nome: 'Cetro da Luz Branca', emoji: '💡🔱', preco: 900, dano: '1d8+2', bonusAtaque: 3, tipo: 'arma', classe: 'clerigo', raridade: 'raro', resistMagica: 10 },
        { id: 'maça_martirio', nome: 'Maca do Martirio', emoji: '🩸🔨', preco: 2000, dano: '2d6+2', bonusAtaque: 4, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', lifesteal: 5 },
        { id: 'cajado_catedral', nome: 'Cajado da Catedral', emoji: '⛪🪄', preco: 1400, dano: '1d10+1', bonusAtaque: 3, tipo: 'arma', classe: 'clerigo', raridade: 'raro', bonusInt: 1 },
        { id: 'cajado_miraculo', nome: 'Cajado do Milagre', emoji: '🌟🪄', preco: 3000, dano: '2d8+2', bonusAtaque: 5, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', manaRegen: 3 },
        { id: 'lanca_erdtree', nome: 'Lanca do Erdtree', emoji: '🌳🗡️', preco: 3200, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', danoExtra: 'sagrado' },
        { id: 'espada_ordem_dourada', nome: 'Espada da Ordem Dourada', emoji: '✨⚔️', preco: 3600, dano: '2d10+1', bonusAtaque: 6, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', bonusInt: 2 },
        { id: 'lamina_blasfema', nome: 'Lamina Blasfema', emoji: '🔥⚔️', preco: 4200, dano: '3d8', bonusAtaque: 6, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', lifesteal: 5 },
        { id: 'maca_colera', nome: 'Maca da Colera Divina', emoji: '⚡🔨', preco: 4200, dano: '3d8', bonusAtaque: 6, tipo: 'arma', classe: 'clerigo', raridade: 'ancestral', danoExtra: 'sagrado' },
        { id: 'cetro_sol', nome: 'Cetro do Sol', emoji: '☀️🔱', preco: 3200, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', danoExtra: 'luz' },
        { id: 'martelo_arcangel', nome: 'Martelo do Arcangel', emoji: '😇🔨', preco: 3400, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', bonusInt: 2 },
        { id: 'cajado_purga', nome: 'Cajado da Purga', emoji: '🔥🪄', preco: 3800, dano: '2d10+1', bonusAtaque: 6, tipo: 'arma', classe: 'clerigo', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'maca_colera', nome: 'Maca da Colera Divina', emoji: '⚡🔨', preco: 4200, dano: '3d8', bonusAtaque: 6, tipo: 'arma', classe: 'clerigo', raridade: 'ancestral', danoExtra: 'sagrado' },
        
        // ===== ARMAS DE ARQUEIRO =====
        { id: 'arco_simples', nome: 'Arco Simples', emoji: '🏹', preco: 120, dano: '1d6', bonusAtaque: 1, tipo: 'arma', classe: 'arqueiro', raridade: 'comum' },
        { id: 'arco_composto', nome: 'Arco Composto', emoji: '🏹', preco: 300, dano: '1d8+1', bonusAtaque: 2, tipo: 'arma', classe: 'arqueiro', raridade: 'incomum' },
        { id: 'besta_pesada', nome: 'Besta Pesada', emoji: '🔫', preco: 550, dano: '1d10+1', bonusAtaque: 3, tipo: 'arma', classe: 'arqueiro', raridade: 'raro' },
        { id: 'arco_elfico', nome: 'Arco Elfico', emoji: '🌿🏹', preco: 1200, dano: '2d6+1', bonusAtaque: 4, tipo: 'arma', classe: 'arqueiro', raridade: 'epico', bonusAgi: 1 },
        { id: 'arco_tempestade', nome: 'Arco da Tempestade', emoji: '🌩️🏹', preco: 1600, dano: '2d6+2', bonusAtaque: 4, tipo: 'arma', classe: 'arqueiro', raridade: 'epico', danoExtra: 'eletrico' },
        { id: 'besta_relampago', nome: 'Besta Relampago', emoji: '⚡🔫', preco: 1800, dano: '2d8', bonusAtaque: 4, tipo: 'arma', classe: 'arqueiro', raridade: 'epico', bonusCrit: 10 },
        { id: 'arco_runas', nome: 'Arco de Runas', emoji: '🪶🏹', preco: 2000, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario', bonusAgi: 2 },
        { id: 'besta_tripla', nome: 'Besta Tripla', emoji: '🎯🔫', preco: 2200, dano: '2d6+3', bonusAtaque: 5, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario' },
        { id: 'arco_predador', nome: 'Arco do Predador', emoji: '🐺🏹', preco: 900, dano: '1d10+1', bonusAtaque: 3, tipo: 'arma', classe: 'arqueiro', raridade: 'raro', bonusCrit: 5 },
        { id: 'arco_nevasca', nome: 'Arco Nevasca', emoji: '❄️🏹', preco: 1400, dano: '1d12', bonusAtaque: 4, tipo: 'arma', classe: 'arqueiro', raridade: 'epico', danoExtra: 'frio' },
        { id: 'arco_fenix', nome: 'Arco Fenix', emoji: '🔥🏹', preco: 2500, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'besta_cacador', nome: 'Besta do Cacador', emoji: '🦌🔫', preco: 800, dano: '1d10', bonusAtaque: 3, tipo: 'arma', classe: 'arqueiro', raridade: 'raro' },
        { id: 'arco_serpente', nome: 'Arco Serpente', emoji: '🐍🏹', preco: 1100, dano: '1d10+2', bonusAtaque: 3, tipo: 'arma', classe: 'arqueiro', raridade: 'raro', debuff: 'veneno' },
        { id: 'arco_crepusculo', nome: 'Arco do Crepusculo', emoji: '🌅🏹', preco: 1900, dano: '2d8', bonusAtaque: 4, tipo: 'arma', classe: 'arqueiro', raridade: 'epico', bonusAgi: 1 },
        { id: 'arco_solsticio', nome: 'Arco do Solsticio', emoji: '🌞🏹', preco: 2300, dano: '2d10+1', bonusAtaque: 5, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'besta_miragem', nome: 'Besta da Miragem', emoji: '🌀🔫', preco: 2600, dano: '2d12', bonusAtaque: 6, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario', bonusCrit: 15 },
        { id: 'arco_wyvern', nome: 'Arco do Wyvern', emoji: '🐉🏹', preco: 3000, dano: '3d8', bonusAtaque: 6, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario', bonusAgi: 2 },
        { id: 'arco_cosmico', nome: 'Arco Cosmico', emoji: '🌌🏹', preco: 3600, dano: '3d10', bonusAtaque: 6, tipo: 'arma', classe: 'arqueiro', raridade: 'ancestral', danoExtra: 'luz' },
        { id: 'grande_arco_leao', nome: 'Grande Arco do Leao', emoji: '🦁🏹', preco: 3800, dano: '3d10+1', bonusAtaque: 6, tipo: 'arma', classe: 'arqueiro', raridade: 'lendario', bonusCrit: 10 },
        { id: 'arco_erdtree', nome: 'Arco do Erdtree', emoji: '🌳🏹', preco: 4200, dano: '3d12', bonusAtaque: 6, tipo: 'arma', classe: 'arqueiro', raridade: 'ancestral', danoExtra: 'sagrado' },
        
        // ===== CAJADOS PARA MAGO =====
        { id: 'cajado_aprendiz', nome: 'Cajado de Aprendiz', emoji: '🪄', preco: 80, dano: '1d6', bonusAtaque: 1, tipo: 'arma', magico: true, bonusInt: 1, raridade: 'comum' },
        { id: 'cajado_aprendiz_plus', nome: 'Cajado Aprimorado', emoji: '🪄✨', preco: 250, dano: '1d7', bonusAtaque: 2, tipo: 'arma', magico: true, bonusInt: 2, raridade: 'incomum' },
        { id: 'cajado_arcano', nome: 'Cajado Arcano', emoji: '🔮', preco: 500, dano: '1d8', bonusAtaque: 3, tipo: 'arma', magico: true, bonusInt: 2, raridade: 'raro' },
        { id: 'cajado_arcano_plus', nome: 'Cajado Arcano Maior', emoji: '🔮✨', preco: 1200, dano: '1d10', bonusAtaque: 4, tipo: 'arma', magico: true, bonusInt: 3, raridade: 'epico', manaRegen: 2 },
        { id: 'cajado_supremo', nome: 'Cajado Supremo', emoji: '⚡🔮', preco: 2500, dano: '2d8', bonusAtaque: 5, tipo: 'arma', magico: true, bonusInt: 4, raridade: 'lendario', manaRegen: 5 },
        { id: 'varinha_chamas', nome: 'Varinha de Chamas', emoji: '🔥', preco: 400, dano: '1d8+1', bonusAtaque: 2, tipo: 'arma', magico: true, bonusInt: 2, raridade: 'raro', danoExtra: 'fogo' },
        { id: 'cajado_gelo', nome: 'Cajado de Gelo', emoji: '❄️', preco: 5050, dano: '3d8+2', bonusAtaque: 3, tipo: 'arma', magico: true, bonusInt: 4, raridade: 'lendario', danoExtra: 'frio' },
        { id: 'grimorio_sombras', nome: 'Grimorio das Sombras', emoji: '📖🌑', preco: 900, dano: '1d8+2', bonusAtaque: 3, tipo: 'arma', classe: 'mago', raridade: 'raro', danoExtra: 'sombrio' },
        { id: 'varinha_tempestade', nome: 'Varinha da Tempestade', emoji: '🌩️', preco: 1100, dano: '1d10', bonusAtaque: 3, tipo: 'arma', classe: 'mago', raridade: 'raro', danoExtra: 'eletrico' },
        { id: 'cajado_estelar', nome: 'Cajado Estelar', emoji: '🌟🪄', preco: 1800, dano: '2d6', bonusAtaque: 4, tipo: 'arma', classe: 'mago', raridade: 'epico', bonusInt: 3 },
        { id: 'orbe_cristal', nome: 'Orbe de Cristal', emoji: '🔮🧊', preco: 1500, dano: '1d12', bonusAtaque: 4, tipo: 'arma', classe: 'mago', raridade: 'epico', resistFrio: 10 },
        { id: 'cajado_vazio', nome: 'Cajado do Vazio', emoji: '🕳️🪄', preco: 2400, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'mago', raridade: 'lendario', danoExtra: 'caos' },
        { id: 'varinha_luz', nome: 'Varinha de Luz', emoji: '💡', preco: 800, dano: '1d8+1', bonusAtaque: 2, tipo: 'arma', classe: 'mago', raridade: 'incomum', bonusInt: 1 },
        { id: 'cajado_necrose', nome: 'Cajado da Necrose', emoji: '☠️🪄', preco: 2000, dano: '2d6+2', bonusAtaque: 4, tipo: 'arma', classe: 'mago', raridade: 'epico', debuff: 'veneno' },
        { id: 'livro_arcanum', nome: 'Livro Arcanum', emoji: '📘✨', preco: 1300, dano: '1d10+1', bonusAtaque: 3, tipo: 'arma', classe: 'mago', raridade: 'raro', bonusInt: 2 },
        { id: 'cetro_tempus', nome: 'Cetro do Tempo', emoji: '⏳🔱', preco: 2600, dano: '2d8+2', bonusAtaque: 5, tipo: 'arma', classe: 'mago', raridade: 'lendario', bonusAgi: 1 },
        { id: 'cajado_alvorada', nome: 'Cajado da Alvorada', emoji: '🌅🪄', preco: 1700, dano: '2d6+1', bonusAtaque: 4, tipo: 'arma', classe: 'mago', raridade: 'epico', danoExtra: 'luz' },
        { id: 'orbe_marea', nome: 'Orbe da Marea', emoji: '🌊🔮', preco: 1400, dano: '1d12', bonusAtaque: 3, tipo: 'arma', classe: 'mago', raridade: 'raro', danoExtra: 'agua' },
        { id: 'cajado_cronos', nome: 'Cajado de Cronos', emoji: '⏰🪄', preco: 2200, dano: '2d8+1', bonusAtaque: 5, tipo: 'arma', classe: 'mago', raridade: 'lendario', bonusAgi: 1 },
        { id: 'orbe_abisso', nome: 'Orbe do Abisso', emoji: '🌑🔮', preco: 2600, dano: '2d10', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'lendario', danoExtra: 'sombrio' },
        { id: 'cajado_supernova', nome: 'Cajado Supernova', emoji: '💥🪄', preco: 3200, dano: '3d8', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'lendario', danoExtra: 'fogo' },
        { id: 'grimorio_arcanjo', nome: 'Grimorio do Arcanjo', emoji: '😇📖', preco: 3600, dano: '3d8+1', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'ancestral', bonusInt: 4 },
        { id: 'cajado_meteorito', nome: 'Cajado de Meteorito', emoji: '☄️🪄', preco: 2400, dano: '2d10', bonusAtaque: 5, tipo: 'arma', classe: 'mago', raridade: 'lendario', danoExtra: 'caos' },
        { id: 'cajado_lusat', nome: 'Cajado de Lusat', emoji: '🌀🪄', preco: 3200, dano: '3d8+1', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'lendario', bonusInt: 3 },
        { id: 'cajado_azur', nome: 'Cajado de Azur', emoji: '💠🪄', preco: 3400, dano: '3d10', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'lendario', manaRegen: 2 },
        { id: 'cetro_cariano', nome: 'Cetro Real Cariano', emoji: '👑🪄', preco: 3800, dano: '3d10+1', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'lendario', danoExtra: 'magico' },
        { id: 'cajado_principe_morte', nome: 'Cajado do Principe da Morte', emoji: '☠️🪄', preco: 4200, dano: '3d12', bonusAtaque: 6, tipo: 'arma', classe: 'mago', raridade: 'ancestral', danoExtra: 'sombrio' }
    ],
    armaduras: [
        { id: 'couro', nome: 'Armadura de Couro', emoji: '🥋', preco: 80, bonusCA: 1, tipo: 'armadura', raridade: 'comum' },
        { id: 'couro_batido', nome: 'Couro Batido', emoji: '🦺', preco: 200, bonusCA: 2, tipo: 'armadura', raridade: 'incomum' },
        { id: 'cota_malha', nome: 'Cota de Malha', emoji: '🛡️', preco: 500, bonusCA: 4, tipo: 'armadura', raridade: 'raro' },
        { id: 'meia_placa', nome: 'Meia Placa', emoji: '⚙️', preco: 1000, bonusCA: 5, tipo: 'armadura', raridade: 'raro', bonusHP: 30 },
        { id: 'placa', nome: 'Armadura de Placa', emoji: '🏰', preco: 2500, bonusCA: 7, tipo: 'armadura', raridade: 'epico', bonusHP: 60 },
        { id: 'placa_dragao', nome: 'Placa de Dragao', emoji: '🐉🛡️', preco: 6000, bonusCA: 9, tipo: 'armadura', raridade: 'lendario', bonusHP: 100, resistFogo: 30 }
    ],
    consumiveis: [
        { id: 'pocao_hp', nome: 'Pocao de Vida', emoji: '🧪', preco: 25, cura: '2d4+2', tipo: 'consumivel' },
        { id: 'pocao_hp_maior', nome: 'Pocao de Vida Maior', emoji: '🧪✨', preco: 100, cura: '4d4+4', tipo: 'consumivel' },
        { id: 'pocao_hp_suprema', nome: 'Pocao de Vida Suprema', emoji: '💎🧪', preco: 500, cura: '8d4+8', tipo: 'consumivel' },
        // Pedras de upgrade (não ficam no inventário, convertem em upgradeStones)
        { id: 'pedra_rara', nome: 'Pedra Rara', emoji: '🪨✨', preco: 800, tipo: 'upgrade_stone', stoneKey: 'rara', descricao: 'Necessária para upgrades de nível 4-6' },
        { id: 'pedra_boss', nome: 'Pedra de Boss', emoji: '🪨👑', preco: 2000, tipo: 'upgrade_stone', stoneKey: 'boss', descricao: 'Necessária para upgrades de nível 7-10' }
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
        { id: 'pulseira_velocidade', nome: 'Pulseira da Velocidade', emoji: '⚡🔁', bonusAtaque: 2, bonusCrit: 15, tipo: 'legendario', raridade: 'raro' }
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
