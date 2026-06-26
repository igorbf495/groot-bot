📋 GUIA DE MIGRAÇÃO - DIVISÃO DO RPG.JS
═══════════════════════════════════════════════════════════════════

## ✅ CONCLUÍDO

O arquivo `src/data/rpg.js` foi dividido em 9 arquivos menores e especializados:

📁 src/data/
├── config.js           (Configuração: DATA_DIR, RPG_FILE)
├── narracoes.js        (NARRACOES, getNarracao)
├── racas-classes.js    (RACAS, CLASSES)
├── monstros.js         (MONSTROS, BOSSES, escalarMonstro, escalarBoss)
├── itens.js            (AFFIXES, RARIDADES, LOJA_ITENS, functions...)
├── rankings.js         (TIERS_RANKING, obterTierELO, obterBarraELO)
├── quests.js           (QUESTS_DISPONIVEIS, quest functions)
├── utils.js            (Funções utilitárias: rolarDado, getModificador, etc)
├── players.js          (Funções de jogador: getPlayer, createPlayer, etc)
└── index.js            (👈 ÍNDICE - Re-exporta tudo)

## 📋 PRÓXIMAS ETAPAS

### 1. Atualizar imports nos arquivos de comando

**Opção A: Importar tudo do índice (mais simples)**
```javascript
// ANTES:
import RPG from '../data/rpg.js';
const { RACAS, CLASSES, MONSTROS } = RPG;

// DEPOIS:
import { RACAS, CLASSES, MONSTROS, getPlayer, rolarD20 } from '../data/index.js';
```

**Opção B: Importar de módulos específicos (mais modular)**
```javascript
// ANTES:
import RPG from '../data/rpg.js';

// DEPOIS:
import { RACAS, CLASSES } from '../data/racas-classes.js';
import { MONSTROS, escalarMonstro } from '../data/monstros.js';
import { getPlayer, modificarHP } from '../data/players.js';
import { rolarD20, getModificador } from '../data/utils.js';
```

### 2. Arquivos que precisam ser atualizados

- [ ] src/commands/rpg-combat.js
- [ ] src/commands/rpg-pvp.js
- [ ] src/commands/rpg-shop.js
- [ ] src/commands/rpg-quests.js
- [ ] src/commands/rpg.js

## 🔍 DIFERENÇAS IMPORTANTES

### Default Export → Named Exports
```javascript
// ANTES (default export no final):
export default { RACAS, CLASSES, ... }
const { RACAS } = RPG;

// DEPOIS (named exports diretos):
export const RACAS = { ... };
import { RACAS } from './racas-classes.js';
```

### Organização de Funções

Agrupadas por categoria:

| Arquivo | Conteúdo |
|---------|----------|
| `config.js` | Configuração global |
| `narracoes.js` | Textos de narração |
| `racas-classes.js` | Definições de raças e classes |
| `monstros.js` | Dados de monstros + funções de escalamento |
| `itens.js` | Itens, afixos, raridades + geração |
| `rankings.js` | Sistema de ranking e ELO |
| `quests.js` | Quests e funções associadas |
| `utils.js` | Funções auxiliares (dados, cálculos) |
| `players.js` | CRUD de jogadores + cálculos de stats |

## 💡 DICA: Teste Incremental

1. Atualizar um arquivo de comando por vez
2. Testar antes de atualizar o próximo
3. Verificar se imports funcionam corretamente

## 📊 BENEFÍCIOS DA DIVISÃO

✅ Arquivos menores e mais legíveis
✅ Fácil encontrar onde adicionar novos monstros/itens
✅ Separação clara de responsabilidades
✅ Melhor manutenção e debugging
✅ Preparado para escalar (adicionar mais conteúdo)

## 🚀 PRÓXIMOS PASSOS

1. ✅ Dividir rpg.js em 9 módulos
2. ⏳ Atualizar imports nos 5 arquivos de comando
3. ⏳ Testar bot inteiro
4. ⏳ Considerar Phase 2 improvements (novas classes, monstros, etc)

═══════════════════════════════════════════════════════════════════
