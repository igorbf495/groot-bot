# 🏆 Sistema de Elos/Ranking - Documentação Completa

## 📋 Visão Geral

O **Sistema de Elos** organiza todos os jogadores em **6 categorias (Tiers)** com **3 divisões cada** (18 níveis totais). Jogadores ganham ou perdem ELO ao participarem de duelos contra outros jogadores.

**ELO Inicial:** 1600 (Ouro III)

---

## 🎯 Estrutura dos Elos

### Ferro (Iniciante)
- **Ferro III**: 0-499 ELO ⚫
- **Ferro II**: 500-799 ELO ⚫
- **Ferro I**: 800-1099 ELO ⚫

### Prata (Intermediário)
- **Prata III**: 1100-1299 ELO 🔶
- **Prata II**: 1300-1449 ELO 🔶
- **Prata I**: 1450-1599 ELO 🔶

### Ouro (Avançado)
- **Ouro III**: 1600-1749 ELO 🟡 ← *Início padrão*
- **Ouro II**: 1750-1899 ELO 🟡
- **Ouro I**: 1900-1999 ELO 🟡

### Platina (Expert)
- **Platina III**: 2000-2099 ELO 💎
- **Platina II**: 2100-2249 ELO 💎
- **Platina I**: 2250-2399 ELO 💎

### Diamante (Master)
- **Diamante III**: 2400-2549 ELO 💠
- **Diamante II**: 2550-2699 ELO 💠
- **Diamante I**: 2700-2899 ELO 💠

### Mestre (Lendário)
- **Mestre III**: 2900-3149 ELO 👑
- **Mestre II**: 3150-3399 ELO 👑
- **Mestre I**: 3400+ ELO 👑

---

## 🎮 Como Usar

### Ver seu Ranking Pessoal
```
!meuperfil
```

**Resultado:**
```
╭─────────────────────────────────╮
│      🏆 RANKING DO JOGADOR     
├─────────────────────────────────┤
│
│ 👤 PlayerName
│ 📊 Nível: 15
│
│ 🟡 Ouro 2
│ ELO: 1805
│ 
│ Progresso para próx.:
│ █████░░░░░░░░░░░░░ 55.0%
│ 1750-1899
│
│ ⭐ Estatísticas:
│ ├ Total Vitorias: 45
│ ├ Total Derrotas: 12
│ ├ Taxa: 78.9%
│ └ ELO Total: 1805
│
├─────────────────────────────────┤
│ 📋 SISTEMA DE ELOS:
│
│ ⚫ Ferro:    0-1.099 ELO
│ 🔶 Prata:   1.100-1.599 ELO
│ 🟡 Ouro:    1.600-1.999 ELO
│ 💎 Platina: 2.000-2.399 ELO
│ 💠 Diamante: 2.400-2.899 ELO
│ 👑 Mestre:  2.900+ ELO
│
╰─────────────────────────────────╯
```

---

## ⚔️ Ganhar/Perder ELO

### Duelos
- **Vitória**: +20 a +50 ELO (dependendo do oponente)
- **Derrota**: -10 a -30 ELO (dependendo do oponente)
- **Balanceamento**: Duelos com oponentes de tier similar dão mais pontos

### Quests
- **"Campeão dos Duelos"**: +50 ELO (ao completar - vencer 3 duelos)

---

## 📊 Funções Internas

### `obterTierELO(elo)`
Obtém informações do tier baseado no ELO.

**Parâmetros:**
- `elo` (number): ELO do jogador (padrão: 1600)

**Retorna:**
```javascript
{
  tier: 'Ouro',
  divisao: 2,
  emoji: '🟡',
  elo: 1805,
  progresso: 55.0,
  eloMin: 1750,
  eloMax: 1899,
  proxELO: 1900
}
```

---

### `obterBarraELO(elo)`
Retorna uma barra visual do progresso até próxima divisão.

**Parâmetros:**
- `elo` (number): ELO do jogador (padrão: 1600)

**Retorna:**
```
█████░░░░░░░░░░░░░ 55.0%
```

---

## 🎯 Exemplo de Progresso

```
Jogador começa em: 1600 ELO (Ouro III)

Vence 5 duelos contra tier similar:
+25 × 5 = +125 ELO
→ Novo ELO: 1725 (ainda Ouro III)

Vence 3 duelos contra Ouro II:
+30 × 3 = +90 ELO
→ Novo ELO: 1815 (SOBE PARA OURO II!)

Perde 2 duelos contra Platina I:
-30 × 2 = -60 ELO
→ Novo ELO: 1755 (ainda Ouro II)

Vence Quest "Campeão dos Duelos":
+50 ELO
→ Novo ELO: 1805 (Ouro II confirmado)
```

---

## 🏆 Rankings Globais

### Ver Top Players (XP Total)
```
!ranking
```

### Ver Top Duelers (ELO)
```
!rankingelo
```

---

## 📈 Estratégia para Subir de Tier

### Rápido (Agressivo)
1. Duele sempre contra jogadores **acima** de seu tier
2. Vitórias dão +40 a +50 ELO
3. Derrotas dão -10 a -15 ELO
4. **Risco**: Pode ficar preso se perder demais

### Seguro (Conservador)
1. Duele contra jogadores **no seu tier**
2. Vitórias dão +25 a +30 ELO
3. Derrotas dão -20 a -25 ELO
4. **Vantagem**: Progresso consistente

### Equilibrado
1. 70% duelos no seu tier
2. 30% duelos acima do seu tier
3. Evolução rápida + segurança

---

## 💡 Dicas

✅ **Faça quests diárias** - Ganhe +50 ELO ao completar a quest "Campeão dos Duelos"

✅ **Acompanhe sua taxa de vitória** - Mantenha acima de 50% para subir

✅ **Duele estrategicamente** - Escolha oponentes baseado em seu objetivo

✅ **Não se desanime** - ELO é cíclico, ganhos/perdas são compensados

✅ **Aumente seu nível** - Jogadores mais altos têm vantagem em duelos

---

## 🔧 Adicionando Novos Tiers (Futuro)

Para adicionar novos tiers, modifique `TIERS_RANKING` em `src/data/rpg.js`:

```javascript
export const TIERS_RANKING = [
    // Novo tier aqui
    { tier: 'Diamante', divisao: 3, emoji: '💠', range: [2400, 2549], cor: '#B9F2FF' },
    // ... mais tiers
];
```

---

## 📚 Estrutura do Dados do Jogador

```javascript
player.elo = 1805; // ELO numérico
player.vitorias = 45; // Total de vitórias em duelos
player.derrotas = 12; // Total de derrotas em duelos
```

---

## ⚙️ Configuração

**Comando para ver ranking pessoal:**
```
CONFIG.CMDS.RANKING_JOGADOR: 'meuperfil'
```

---

## 🚀 Status

✅ **IMPLEMENTADO E TESTADO**

- Sistema de 6 tiers com 3 divisões cada
- Cálculo automático de progresso
- Visualização com barras gráficas
- Integração com duelos
- Comando !meuperfil funcional

---

*Última atualização: 21 de janeiro de 2026*
