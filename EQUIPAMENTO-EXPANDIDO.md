# ⚔️ SISTEMA DE EQUIPAMENTOS EXPANDIDO - DOCUMENTAÇÃO

## ✅ IMPLEMENTAÇÃO FASE 1 COMPLETA

### Data: 21 de janeiro de 2026
### Versão: Bot-Igor v2.0.3

---

## 🎯 O QUE MUDOU

### ANTES (Sistema Simples):
```
⚪ Item com bônus fixo
└─ Espada Longa: +2 ATK, +1d8 dano
```

### AGORA (Sistema Expandido):
```
🔵 Raro - Espada Longa da Força
├─ 2 Affixes Aleatórios
├─ Prefixo: "Afiada" → +15% dano
├─ Sufixo: "da Força" → +2 STR
├─ Bônus: +1 ATK, +1d8 dano, +10% dano
└─ Preço Venda: +60% (raridade)
```

---

## 📊 SISTEMA DE RARIDADES

### 6 Níveis de Raridade

#### ⚪ **COMUM** (50% drop)
- Emoji: ⚪
- Sem affixes
- Preço venda: 100% do base
- Onde encontra: Qualquer drop
- Exemplo: Espada Longa comum

#### 🟢 **INCOMUM** (25% drop)
- Emoji: 🟢
- 1 affix (prefixo OU sufixo)
- Preço venda: +30%
- Onde encontra: Monstros fáceis
- Exemplo: 🟢 Espada Longa da Força (+1 STR)

#### 🔵 **RARO** (13% drop)
- Emoji: 🔵
- 2 affixes (prefixo + sufixo)
- Preço venda: +60%
- Onde encontra: Monstros médios
- Exemplo: 🔵 Espada Afiada da Inteligência (+1d8, +1 INT)

#### 🟣 **ÉPICO** (8% drop)
- Emoji: 🟣
- 3 affixes (múltiplos combinações)
- Preço venda: +100%
- Onde encontra: Bosses nível 5+
- Exemplo: 🟣 Espada Mágica Abençoada da Velocidade (+5 dano, +2 INT, +1 AGI)

#### 🟡 **LENDÁRIO** (3% drop)
- Emoji: 🟡
- 4 affixes únicos
- Preço venda: +200%
- Onde encontra: Bosses nível 8+
- Exemplo: 🟡 Espada do Dragão Etérea Vampírica da Perdição

#### 🌟 **ANCESTRAL** (1% drop)
- Emoji: 🌟
- 5 affixes supremos
- Preço venda: +300%
- Onde encontra: Bosses lendários apenas
- Exemplo: 🌟 Espada Ancestral Antiga Etérea Vampírica da Perdição Abençoada

---

## 🔧 SISTEMA DE AFFIXES

### Prefixos de Arma (Modificam Dano)

| Nome | Emoji | Efeito | Valor |
|------|-------|--------|-------|
| Afiada | 💎 | +15% dano | dano extra |
| Mágica | ✨ | +20 dano mágico | danoMagico |
| Letal | 🗡️ | +10% crítico | bonusContra |
| Abençoada | ✨ | +1 STR, +1 INT | stats |
| Etérea | 👻 | 10% lifesteal | lifesteal |
| Antiga | ⚡ | +2 ATK, +1d4 | bonusAtaque + dano |
| Enraivecida | 🔥 | +25% dano, -5% DEF | tradeoff |

### Sufixos de Arma (Modificam Atributos)

| Nome | Emoji | Efeito | Valor |
|------|-------|--------|-------|
| da Força | 💪 | +2 STR | bonusFor |
| da Inteligência | 🧠 | +2 INT | bonusInt |
| da Velocidade | ⚡ | +15% velocidade ATK | bonusAtkSpeed |
| Vampírica | 🧛 | 20% lifesteal | lifesteal |
| da Perdição | ☠️ | Veneno + 10% dano | debuff |
| da Agilidade | 🏃 | +2 AGI | bonusAgi |
| da Regeneração | 🌱 | +1 mana/regen | manaRegen |

### Prefixos de Armadura (Modificam Defesa)

| Nome | Emoji | Efeito | Valor |
|------|-------|--------|-------|
| Fortalecida | 🛡️ | +2 CA | bonusCA |
| Resguardada | 🔒 | +15% resist mágica | resistMagica |
| Vitalizada | ❤️ | +50 HP | bonusHP |
| Encantada | ✨ | +20% resist + 1 INT | combined |
| Antigas | ⚡ | +1 CA, +10% resist | combined |
| Couraçada | 🏰 | +3 CA, -10% movimento | tradeoff |
| Espectra | 👻 | +20% fogo, +20% frio | resistências |

### Sufixos de Armadura (Modificam Proteção)

| Nome | Emoji | Efeito | Valor |
|------|-------|--------|-------|
| da Vitalidade | ❤️ | +80 HP | bonusHP |
| da Resistência | 🛡️ | +1 CA, +10% física | resistFisica |
| da Regeneração | 🌿 | 5 HP/regen | regenHP |
| da Agilidade | 🏃 | +2 AGI, +10% esquiva | bonusAgi |
| do Mago | 🔮 | +2 INT, +2 mana regen | magico |
| da Resistência Mágica | 🔵 | +25% resist mágica | resistMagica |
| da Imunidade | 🛡️ | +15% fogo, +15% frio | múltiplos |

---

## 🎮 EXEMPLOS DE ITEMS GERADOS

### Exemplo 1: Drop Raro
```
🔵 Espada Longa Afiada da Força
├─ Prefixo: Afiada (+15% dano)
├─ Sufixo: da Força (+2 STR)
├─ Dano: 1d8 (+1 do prefixo)
├─ ATK: +2 (+1 base, +1 sufixo)
├─ STR: +2
└─ Preço Venda: 400 ouro (250 base x 1.6)
```

### Exemplo 2: Drop Épico
```
🟣 Armadura de Placa Vitalizada do Mago
├─ Prefixo: Vitalizada (+50 HP)
├─ Sufixo: do Mago (+2 INT, +2 mana regen)
├─ CA: +7 base, +1 de acessório
├─ HP: +60 (+50 + base)
├─ INT: +2
├─ Mana Regen: +2/seg
└─ Preço Venda: 5000 ouro (2500 base x 2.0)
```

### Exemplo 3: Drop Lendário
```
🟡 Cajado Supremo Mágico Arcano da Velocidade da Regeneração
├─ Prefixos:
│  ├─ Mágica (+20 dano mágico)
│  └─ Arcano (parte do nome)
├─ Sufixos:
│  ├─ da Velocidade (+15% ATK speed)
│  └─ da Regeneração (+1 mana/seg)
├─ Dano: 2d8 (base)
├─ ATK: +5
├─ INT: +4
├─ Mana Regen: +5/seg
└─ Preço Venda: 7500 ouro (2500 base x 3.0)
```

---

## 💾 ESTRUTURA DE DATA DO ITEM

### Item com Affixes
```javascript
{
    id: 'espada_longa_gerada',
    nome: 'Espada Longa',
    emoji: '🔵 ⚔️',  // emoji raridade + emoji original
    preco: 250,     // preço base
    precoVenda: 400, // preco * raridade_multiplier
    dano: '1d8',
    bonusAtaque: 2,
    bonusFor: 0,    // modificadores de atributos
    bonusInt: 0,
    bonusAgi: 0,
    danoBônus: 15,  // % de dano extra
    lifesteal: 0,
    
    // Novo
    raridade: 'raro',
    affixes: [
        {
            tipo: 'prefixo',
            nome: 'Afiada',
            emoji: '💎',
            danoBônus: 15
        },
        {
            tipo: 'sufixo',
            nome: 'da Força',
            emoji: '💪',
            bonusFor: 2
        }
    ]
}
```

---

## 🎲 COMO FUNCIONA A GERAÇÃO

### 1. Drop Normal
```
Jogador derrota monstro
   ↓
Chance de drop (baseado em CR)
   ↓
Gera raridade aleatória (50% comum, 25% incomum, etc)
   ↓
Seleciona item aleatório do catálogo
   ↓
Gera prefixos e sufixos (baseado em raridade)
   ↓
Aplica bônus do affix ao item
   ↓
Ajusta preço de venda
   ↓
Item equipável!
```

### 2. Distribuição de Raridade
```
50% ⚪ Comum
25% 🟢 Incomum
13% 🔵 Raro       ← Melhor chance
 8% 🟣 Épico
 3% 🟡 Lendário
 1% 🌟 Ancestral
───────────────
100% Total
```

### 3. Quantidade de Affixes por Raridade
```
⚪ Comum:    0 affixes (item puro)
🟢 Incomum:  1 affix (prefixo ou sufixo)
🔵 Raro:     2 affixes (1 prefixo + 1 sufixo)
🟣 Épico:    3 affixes (2 prefixos + 1 sufixo)
🟡 Lendário: 4 affixes (2 prefixos + 2 sufixos)
🌟 Ancestral: 5 affixes (3 prefixos + 2 sufixos)
```

---

## 🏪 COMO USAR (Do ponto de vista do player)

### Caçando Monstros
```
Player: !cacar
Bot: Você encontrou um Rato Gigante...

[Combate...]

Bot: ✅ Vitória!
     Ganhou 50 XP + 30 ouro
     
     Drop: 🟢 Adaga da Força
     (Adaga comum + 1 sufixo)
```

### Comprando na Loja
```
Player: !loja armas
Bot: 1. ⚪ Espada Longa (250 ouro)
     2. ⚪ Machado de Guerra (400 ouro)
     ...
```

### Visualizando Item
```
Player: !inventario
Bot: 📦 Seu Inventário:
     ├─ 🔵 Espada Longa Afiada da Força
     │  ├─ ⚔️ Dano: 1d8
     │  ├─ 💢 ATK: +2
     │  ├─ 💪 FOR: +2
     │  └─ 💎 Dano extra: +15%
     │
     └─ ⚪ Adaga
        └─ ⚔️ Dano: 1d4
```

---

## ✨ BÔNUS ESPECIAIS

### Propriedades Únicas (Já Implementadas)

#### Armas
- `danoExtra: 'fogo'` - Adiciona dano de fogo
- `danoExtra: 'frio'` - Adiciona dano de frio
- `debuff: 'veneno'` - Aplicar veneno em ataque
- `lifesteal` - % de dano roubado como HP
- `manaRegen` - Regeneração de mana

#### Armaduras
- `resistFogo` - Reduz dano de fogo em %
- `resistMagica` - Reduz dano mágico em %
- `resistFisica` - Reduz dano físico em %
- `regenHP` - HP regenerado por turno
- `bonusHP` - HP máximo aumentado

---

## 📈 IMPACTO ESPERADO

### Gameplay
✅ Mais motivação para farmar drops
✅ Mais customização de builds
✅ Progression visual constante
✅ Mais valor estratégico em equipamento

### Economia
✅ Items raro/épico valem mais
✅ Novo sistema de trade (futuro)
✅ Maior variedade de preços

### Retenção
✅ "Uma mais" - sempre um novo item melhor
✅ RNG satisfatório - chance de épico/lendário
✅ Customização - diferentes builds possíveis

---

## 🚀 PRÓXIMAS FASES (Roadmap)

### Fase 2: Set Bonuses
- Equipar 2+ peças matching = bônus extra
- Exemplo: 2x Dragão = +10% armadura, 3x = +20%, etc

### Fase 3: Soquetes e Joias
- Items podem ter 1-3 soquetes
- Encaixar joias (Rubi +STR, Safira +INT, etc)
- Combinações customizáveis

### Fase 4: Upgrading
- Usar Pó de Diamante para +1 um item
- Risco de falha (10% em +1, 30% em +3)
- Máximo +10 com resets possíveis

### Fase 5: Crafting
- Desmontar items = materiais
- Combinar materiais = novo item
- Receitas especiais

---

## 📚 FUNÇÕES NOVAS (Para devs)

### Nova API
```javascript
// Gerar item com affixes
gerarItemComAffixes(itemBase, 'raro')

// Gerar affix aleatório
gerarAlfixAleatorio('sufixos_arma')

// Gerar raridade
gerarRaridadeAleatoria()

// Formatar para exibição
formatarItem(item)
```

### Exemplo de Uso
```javascript
const itemBase = LOJA_ITENS.armas[0]; // Adaga
const itemGerado = gerarItemComAffixes(itemBase, 'epico');
console.log(formatarItem(itemGerado));
// 🟣 Adaga Mágica Abençoada da Velocidade
//      ✨ Mágica: +20 dano mágico
//      ✨ Abençoada: +1 STR, +1 INT
//      ⚡ da Velocidade: +15% ATK Speed
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- ✅ 6 níveis de raridade
- ✅ 7 prefixos para armas
- ✅ 7 sufixos para armas
- ✅ 7 prefixos para armaduras
- ✅ 7 sufixos para armaduras
- ✅ Sistema de geração aleatória
- ✅ Aplicação de bônus
- ✅ Ajuste de preço por raridade
- ✅ Formatação visual
- ✅ Drop system atualizado
- ✅ Sintaxe validada
- ✅ Documentação completa

---

## 🎮 TESTE AGORA

```
!cacar       → Dropar items com affixes aleatórios
!inventario  → Ver seus items formatados
!loja        → Ver catálogo com raridades
```

---

**Status**: ✅ Fase 1 100% IMPLEMENTADA E TESTADA

Próximo passo: Fase 2 (Set Bonuses)

