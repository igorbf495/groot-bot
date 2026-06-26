# 🔄 INSTRUÇÕES PARA ATUALIZAR IMPORTS DOS COMANDOS

Agora que o `rpg.js` foi dividido em 9 módulos, precisamos atualizar os imports nos arquivos de comando.

## 📋 Arquivos a Atualizar

- [ ] `src/commands/rpg-combat.js`
- [ ] `src/commands/rpg-pvp.js`
- [ ] `src/commands/rpg-shop.js`
- [ ] `src/commands/rpg-quests.js`
- [ ] `src/commands/rpg.js` (verificar hub)

---

## 📝 TEMPLATE DE MIGRAÇÃO

### ❌ ANTES (Importação Monolítica)
```javascript
import RPG from '../data/rpg.js';

// Desestrutura do export default
const { RACAS, CLASSES, MONSTROS, LOJA_ITENS, ... } = RPG;
// Ou acessa assim:
const { rolarD20, getPlayer } = RPG;
```

### ✅ DEPOIS (Importação Modularizada)

**Opção 1: Simples (recomendado para começar)**
```javascript
// Importar TUDO do índice (mais simples)
import * as RPG from '../data/index.js';

// Usar como antes:
const { RACAS, CLASSES, rolarD20, getPlayer } = RPG;
```

**Opção 2: Específica (mais eficiente)**
```javascript
// Importar apenas o necessário
import { RACAS, CLASSES } from '../data/racas-classes.js';
import { MONSTROS, escalarMonstro, BOSSES } from '../data/monstros.js';
import { NARRACOES, getNarracao } from '../data/narracoes.js';
import { LOJA_ITENS, gerarItemComAffixes } from '../data/itens.js';
import { getPlayer, updatePlayer, modificarHP, adicionarXP } from '../data/players.js';
import { rolarD20, rolarDado, getModificador } from '../data/utils.js';
import { TIERS_RANKING, obterTierELO } from '../data/rankings.js';
import { QUESTS_DISPONIVEIS, obterQuestDoDia } from '../data/quests.js';
```

---

## 📂 MAPEAMENTO POR COMANDO

### **rpg-combat.js**

Funções usadas: `RACAS`, `CLASSES`, `NARRACOES`, `MONSTROS`, `BOSSES`, `LOJA_ITENS`, `rolarD20`, `rolarDado`, `getPlayer`, `updatePlayer`, `modificarHP`, `adicionarXP`, `escalarMonstro`, `escalarBoss`, `calcularHpMax`, `calcularCA`, `calcularBonusAtaque`, `calcularDano`, `getMonstroAleatorio`, `incrementarStat`

```javascript
import { RACAS, CLASSES } from '../data/racas-classes.js';
import { NARRACOES, getNarracao } from '../data/narracoes.js';
import { MONSTROS, BOSSES, escalarMonstro, escalarBoss } from '../data/monstros.js';
import { LOJA_ITENS } from '../data/itens.js';
import { rolarD20, rolarDado, getModificador } from '../data/utils.js';
import { getPlayer, updatePlayer, modificarHP, adicionarXP, calcularHpMax, calcularCA, calcularBonusAtaque, calcularDano, getMonstroAleatorio, incrementarStat } from '../data/players.js';
```

### **rpg-pvp.js**

Funções usadas: `getPlayer`, `updatePlayer`, `getRanking`, `getRankingELO`, `calcularMudancaELO`, `obterTierELO`, `rolarD20`, `calcularBonusAtaque`, `modificarOuro`, `verificarCooldown`, `setCooldown`

```javascript
import { getPlayer, updatePlayer, getRanking, getRankingELO, verificarCooldown, setCooldown, modificarOuro } from '../data/players.js';
import { calcularMudancaELO, rolarD20 } from '../data/utils.js';
import { obterTierELO } from '../data/rankings.js';
```

### **rpg-shop.js**

Funções usadas: `LOJA_ITENS`, `getPlayer`, `updatePlayer`, `adicionarItem`, `removerItem`, `equiparItem`, `modificarHP`, `modificarOuro`, `verificarCooldown`, `setCooldown`, `calcularHpMax`

```javascript
import { LOJA_ITENS } from '../data/itens.js';
import { getPlayer, updatePlayer, adicionarItem, removerItem, equiparItem, modificarHP, modificarOuro, verificarCooldown, setCooldown, calcularHpMax } from '../data/players.js';
```

### **rpg-quests.js**

Funções usadas: `getPlayer`, `updatePlayer`, `TIERS_RANKING`, `obterTierELO`, `obterQuestDoDia`, `verificarProgressoQuest`, `completarQuest`, `resetarQuestsDoDia`, `obterStatusQuest`

```javascript
import { getPlayer, updatePlayer } from '../data/players.js';
import { TIERS_RANKING, obterTierELO } from '../data/rankings.js';
import { obterQuestDoDia, verificarProgressoQuest, completarQuest, resetarQuestsDoDia, obterStatusQuest } from '../data/quests.js';
```

### **rpg.js (hub)**

Este arquivo apenas re-exporta, verifique se está correto:

```javascript
// Verificar se tem referências diretas a rpg.js
// Se sim, atualizar para usar o novo índice
import * as RPG from './data/index.js';
export default RPG;
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

- [ ] Atualizar imports em rpg-combat.js
- [ ] Testar !tutorial, !criarpj, !perfil, !status, !cacar, !boss
- [ ] Atualizar imports em rpg-pvp.js
- [ ] Testar !duelo, !ranking, !rankingelo, !roubar
- [ ] Atualizar imports em rpg-shop.js
- [ ] Testar !loja, !comprar, !equipar, !inventario, !curar, !daily
- [ ] Atualizar imports em rpg-quests.js
- [ ] Testar !quests, !completarquest, !rankingjogador
- [ ] Verificar rpg.js (hub file)
- [ ] Testar menu RPG (!rpg)

---

## 🧪 TESTE PÓS-MIGRAÇÃO

Depois de atualizar cada arquivo, teste:

```bash
# No WhatsApp/Discord, executar:
!cacar              # Testa combate
!perfil             # Testa dados do jogador
!duelo @jogador     # Testa PvP
!loja               # Testa loja
!quests             # Testa quests
```

---

## 🐛 POSSÍVEIS ERROS

### Erro: "Cannot find module"
- Verificar caminho: `../data/` é relativo ao arquivo de comando
- Se o comando está em `src/commands/`, os dados devem estar em `src/data/`

### Erro: "X is not exported from Y"
- Verificar se está na lista de `export` do módulo
- Se não estiver, adicionar: `export { X }`

### Erro: "TypeError: X is not a function"
- Verificar se importou a função, não o objeto
- Exemplo: `import { getPlayer }` não `import { PLAYERS }`

---

## 📊 IMPACTO DA MUDANÇA

- ✅ Código mais organizado
- ✅ Imports mais específicos
- ✅ Melhor tree-shaking em bundlers
- ✅ Autocomplete melhor no editor
- ✅ Preparado para crescer

**Nenhuma mudança de funcionalidade!**

---

**Pronto para começar? Escolha um arquivo e atualize!** 🚀
