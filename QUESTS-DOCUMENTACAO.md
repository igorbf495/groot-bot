# 📋 SISTEMA DE QUESTS/MISSÕES - DOCUMENTAÇÃO

## ✅ IMPLEMENTAÇÃO COMPLETA

### Data: 21 de janeiro de 2026

---

## 🎯 O QUE FOI IMPLEMENTADO

### Sistema Completo de Missões Diárias
- ✅ 10 quests diferentes com desafios variados
- ✅ Quest muda todo dia automaticamente
- ✅ Sistema de progresso com barra visual
- ✅ Recompensas em XP, Ouro e ELO
- ✅ Integração automática no jogo

---

## 📖 COMO USAR

### Comando 1: Ver Quest Atual
```
!quests
```

**O que mostra:**
- Nome da quest do dia
- Descrição do objetivo
- Barra de progresso (0%)
- Recompensa esperada
- Instruções para completar

### Comando 2: Completar Quest
```
!completarquest
```

**O que faz:**
- Valida se a quest foi completada
- Distribui as recompensas
- Mostra parabéns com os ganhos
- Reset automático para amanhã

---

## 🎮 QUESTS DISPONÍVEIS

### 1. 🐭 Exterminador de Pragas
- **Objetivo**: Matar 5 ratos gigantes
- **Dificuldade**: Fácil
- **Recompensa**: 150 XP + 100 Ouro
- **Como fazer**: Use `!cacar` até encontrar 5 ratos

### 2. ⚔️ Caçador Experiente
- **Objetivo**: Vencer 10 combates de qualquer tipo
- **Dificuldade**: Médio
- **Recompensa**: 300 XP + 250 Ouro
- **Como fazer**: `!cacar`, `!boss`, `!duelo` - qualquer vitória conta

### 3. 🏆 Campeão dos Duelos
- **Objetivo**: Vencer 3 duelos contra outros jogadores
- **Dificuldade**: Difícil
- **Recompensa**: 250 XP + 500 Ouro + 50 ELO
- **Como fazer**: Use `!duelo @jogador` 3 vezes

### 4. 💰 Gananciador
- **Objetivo**: Acumular 10.000 de ouro
- **Dificuldade**: Médio
- **Recompensa**: 200 XP + 1.000 Ouro
- **Como fazer**: Jogue e acumule ouro

### 5. ⭐ Aventureiro Dedicado
- **Objetivo**: Subir 5 níveis
- **Dificuldade**: Muito Difícil
- **Recompensa**: 500 XP + 750 Ouro
- **Como fazer**: Ganhe XP caçando monstros

### 6. 🛍️ Colecionador
- **Objetivo**: Comprar 3 itens na loja
- **Dificuldade**: Fácil
- **Recompensa**: 100 XP + 500 Ouro
- **Como fazer**: Use `!comprar` 3 vezes

### 7. 👹 Devorador de Goblins
- **Objetivo**: Matar 5 goblins
- **Dificuldade**: Médio
- **Recompensa**: 200 XP + 150 Ouro
- **Como fazer**: Use `!cacar` até encontrar 5 goblins

### 8. 🎯 Golpe Preciso
- **Objetivo**: Conseguir 1 golpe crítico
- **Dificuldade**: Fácil
- **Recompensa**: 50 XP + 100 Ouro
- **Como fazer**: Use `!cacar` - crítico depende da sorte

### 9. 🛡️ Sobrevivente
- **Objetivo**: Sobreviver 30 minutos sem morrer
- **Dificuldade**: Médio
- **Recompensa**: 300 XP + 400 Ouro
- **Como fazer**: Jogue por 30 minutos sem morrer

### 10. 🗡️💰 Ladrão da Noite
- **Objetivo**: Roubar 500 de ouro de outros jogadores
- **Dificuldade**: Difícil
- **Recompensa**: 250 XP + 200 Ouro
- **Como fazer**: Use `!roubar @jogador` múltiplas vezes

---

## 💾 ESTRUTURA DE DADOS

### No arquivo `src/data/rpg.js`:
```javascript
// Dados das quests
export const QUESTS_DISPONIVEIS = {
    quest_id: {
        id: 'unique_id',
        nome: 'Nome da Quest',
        emoji: '🎯',
        descricao: 'Descrição',
        objetivo: { 
            tipo: 'tipo_objetivo',
            quantidade: 10,
            monstro: 'tipo_monstro' (opcional)
        },
        recompensa: {
            xp: 100,
            ouro: 50,
            elo: 10 (opcional)
        },
        dificuldade: 'Fácil|Médio|Difícil'
    }
}

// Funções de gerenciamento
obterQuestDoDia()          // Retorna quest de hoje
resetarQuestsDoDia(player) // Inicia nova quest
verificarProgressoQuest(player, tipo, valor)  // Incrementa progresso
completarQuest(player)     // Aplica recompensas
obterStatusQuest(player)   // Retorna status
```

---

## 🔌 INTEGRAÇÃO COM COMBATE

Quando o jogador usa `!cacar` ou `!duelo`, automaticamente:

1. Sistema verifica qual é a quest atual
2. Se o objetivo for compatível, incrementa progresso
3. Mostra mensagem de progresso após cada ação
4. Quando atinge 100%, marca como completa

**Exemplo:**
```
Você venceu um Goblin!
→ Quest "Devorador de Goblins": 2/5 (40%)
```

---

## 📊 ESTRUTURA DE QUEST DO JOGADOR

No banco de dados `data/rpg.json`, cada jogador tem:

```javascript
player.quests = {
    atual: {
        id: 'matar_5_goblin',
        nome: 'Devorador de Goblins',
        emoji: '👹',
        descricao: 'Mate 5 goblins',
        objetivo: { tipo: 'matar', monstro: 'goblin', quantidade: 5 },
        recompensa: { xp: 200, ouro: 150 },
        progresso: 2,        // Quantas completou
        completada: false,   // Se já acabou
        dataInicio: 1674335466000
    },
    questsCompletadas: [
        { id: 'matar_5_ratos', nome: 'Exterminador...', completada: 1674335566000 },
        // ... histórico de quests
    ]
}
```

---

## 🎪 FLUXO DE USO

### Dia 1:
1. Jogador entra e usa `!quests`
2. Recebe quest do dia (aleatória, baseada em data)
3. Completa objetivos jogando normalmente
4. Vê progresso aumentar após cada ação

### Dia 2 (24h depois):
1. Nova quest automática
2. Quest anterior é arquivada em `questsCompletadas`
3. Pode completar nova quest se quiser

---

## 🔧 COMO ADICIONAR NOVA QUEST

### Passo 1: Editar `src/data/rpg.js`
```javascript
export const QUESTS_DISPONIVEIS = {
    // ... quests existentes
    quest_nova_id: {
        id: 'quest_nova',
        nome: 'Nome da Nova Quest',
        emoji: '🆕',
        descricao: 'Descrição breve',
        objetivo: { tipo: 'tipo', quantidade: 10 },
        recompensa: { xp: 200, ouro: 100 },
        dificuldade: 'Médio'
    }
};
```

### Passo 2: Objetivo pode ser:
- `tipo: 'matar'` + `monstro: 'nome'` - Matar X monstros específicos
- `tipo: 'vitorias'` - Ganhar X combates
- `tipo: 'duelos_vencidos'` - Ganhar X duelos
- `tipo: 'ouro_acumulado'` - Acumular X ouro
- `tipo: 'levels_ganhos'` - Subir X níveis
- `tipo: 'compras'` - Fazer X compras
- `tipo: 'criticos'` - Fazer X críticos
- `tipo: 'tempo_vivo'` - Ficar X minutos vivo
- `tipo: 'ouro_roubado'` - Roubar X ouro

---

## 📈 ESTATÍSTICAS E PROGRESSO

### Após completar quest:
- ✅ Ganho de XP contado imediatamente
- ✅ Ouro adicionado ao inventário
- ✅ ELO aumenta (se houver)
- ✅ Quest marcada como completada
- ✅ Histórico guardado para sempre

### Verificar histórico:
```javascript
// No futuro, podemos adicionar:
player.questsCompletadas  // Lista de todas completadas
player.statsQuests = {
    totalCompletadas: 5,
    xpGanho: 1500,
    ouroGanho: 5000
}
```

---

## ✨ FEATURES FUTURAS

### Próximas fases:
- 📊 Dashboard de progresso (nova tela `!meuquest`)
- 🎁 Bônus especial após 7 quests completadas
- 🏆 Achievements por quests completadas
- 💎 Quests raras com recompensas maiores
- 👥 Quests em grupo (para clãs)
- 📅 Quests semanais/mensais

---

## 🐛 DEBUGGING E TROUBLESHOOTING

### Quest não aparece:
```
!quests
```
Se der erro, personagem foi criado antes da atualização. Use `!resetarpj`

### Quest não progride:
```
1. Certifique que está fazendo a ação correta
2. Use !quests para ver qual é a quest
3. Verifique o tipo de objetivo
```

### Recompensas não foram dadas:
```
Use !completarquest com a quest no status "Completa"
Se não funcionar, procure suporte
```

---

## 📝 CÓDIGO DE EXEMPLO

### Visualizar quest:
```javascript
const quest = obterStatusQuest(player);
console.log(quest);
// {
//   nome: 'Devorador de Goblins',
//   emoji: '👹',
//   progresso: 3,
//   total: 5,
//   percentual: 60,
//   completada: false,
//   recompensa: { xp: 200, ouro: 150 }
// }
```

### Completar quest:
```javascript
const recompensa = completarQuest(player);
console.log(recompensa);
// { xp: 200, ouro: 150 }
```

---

## 📞 COMANDOS RÁPIDOS

| Comando | Função |
|---------|--------|
| `!quests` | Ver quest atual |
| `!completarquest` | Receber recompensas |
| `!rpg` | Menu RPG (inclui quests) |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- ✅ 10 quests implementadas
- ✅ Sistema de progresso
- ✅ Barra visual com createBar()
- ✅ Recompensas XP+Ouro+ELO
- ✅ Integração com combate
- ✅ Reset automático diário
- ✅ Histórico de quests
- ✅ Documentação completa
- ✅ Sintaxe validada
- ✅ Bot testado

---

**Status**: ✅ Completamente implementado e funcional!

Use `!quests` agora para começar! 🚀
