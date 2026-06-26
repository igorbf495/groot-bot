# Guia de Modificacao do Sistema RPG

Este guia explica como adicionar novas racas, classes, monstros, itens e comandos ao sistema de RPG do bot.

---

## Estrutura dos Arquivos

```
src/
├── data/rpg.js      # Dados: racas, classes, monstros, itens, funcoes de calculo
├── commands/rpg.js  # Comandos: !cacar, !perfil, !loja, etc.
config.js            # Lista de comandos do bot
index.js             # Router de comandos
```

---

## 1. Adicionar Nova Raca

**Arquivo:** `src/data/rpg.js`

**Localizar:** `export const RACAS = {`

**Estrutura:**
```javascript
nome_interno: {
    nome: 'Nome Exibido',
    emoji: '🎭',
    descricao: 'Descricao curta',
    bonus: { 
        forca: 0,        // -5 a +5
        destreza: 0,     // -5 a +5
        inteligencia: 0, // -5 a +5
        sorte: 0         // -5 a +5
    },
    habilidade: 'Texto descrevendo a habilidade',
    
    // Propriedades opcionais (escolha uma ou mais):
    xpBonus: 1.1,           // Humano: +10% XP
    esquivaBonus: 10,       // Elfo: +10% esquiva
    hpBonus: 1.15,          // Anao: +15% HP
    furiaBonus: 1.3,        // Orc: +30% dano quando HP < 30%
    drenarVida: 0.25,       // Vampiro: cura 25% do dano causado
    criticoBonus: 5         // +5% chance de critico
}
```

**Exemplo - Adicionar Raca "Goblin":**
```javascript
goblin: {
    nome: 'Goblin',
    emoji: '👺',
    descricao: 'Pequeno e astuto',
    bonus: { forca: -2, destreza: 3, inteligencia: 1, sorte: 2 },
    habilidade: 'Furtividade: +20% chance de fugir de batalhas',
    fugirBonus: 0.20
}
```

**Depois:** Atualizar o tutorial em `src/commands/rpg.js` (funcao `handleTutorial`, caso `racas`)

---

## 2. Adicionar Nova Classe

**Arquivo:** `src/data/rpg.js`

**Localizar:** `export const CLASSES = {`

**Estrutura:**
```javascript
nome_interno: {
    nome: 'Nome Exibido',
    emoji: '⚔️',
    descricao: 'Descricao curta',
    hitDie: 10,              // Dado de vida: 6, 8, 10 ou 12
    atributoPrincipal: 'forca', // forca, destreza ou inteligencia
    habilidade: 'Texto da habilidade',
    
    // Propriedades opcionais:
    usaInteligencia: true,      // Mago/Clerigo: usa INT para ataque
    criticoMultiplicador: 1.5,  // Ladino: critico x3 (2 * 1.5)
    chanceHabilidade: 20,       // Guerreiro: 20% de Golpe Poderoso
    curaAoVencer: true          // Clerigo: cura HP ao vencer
}
```

**Exemplo - Adicionar Classe "Monge":**
```javascript
monge: {
    nome: 'Monge',
    emoji: '🥋',
    descricao: 'Mestre das artes marciais',
    hitDie: 8,
    atributoPrincipal: 'destreza',
    habilidade: 'Flurry: 30% de chance de atacar duas vezes',
    chanceAtaqueDuplo: 30
}
```

**Depois:** 
1. Implementar a logica da habilidade em `handleCacar` (src/commands/rpg.js)
2. Atualizar o tutorial

---

## 3. Adicionar Novo Monstro

**Arquivo:** `src/data/rpg.js`

**Localizar:** `export const MONSTROS = [`

**Estrutura:**
```javascript
{
    nome: 'Nome do Monstro',
    emoji: '👹',
    nivel: 5,        // Nivel minimo para encontrar (1-100)
    hp: 30,          // Pontos de vida
    ca: 12,          // Classe de Armadura (dificuldade de acertar)
    dano: '2d6+3',   // Dado de dano (ex: 2d6+3 = 2 dados de 6 + 3)
    xp: 150,         // XP ao derrotar
    ouro: [20, 50]   // Ouro minimo e maximo
}
```

**Exemplo - Adicionar Monstro "Harpia":**
```javascript
{
    nome: 'Harpia',
    emoji: '🦅',
    nivel: 8,
    hp: 45,
    ca: 14,
    dano: '2d8+2',
    xp: 300,
    ouro: [40, 80]
}
```

**Ordenar:** Manter os monstros ordenados por `nivel` (menor para maior)

---

## 4. Adicionar Novo Item na Loja

**Arquivo:** `src/data/rpg.js`

**Localizar:** `export const LOJA_ITENS = {`

### 4.1 Armas
```javascript
armas: [
    {
        id: 'nome_interno',
        nome: 'Nome Exibido',
        emoji: '🗡️',
        preco: 100,
        bonusAtaque: 2,    // Bonus no d20 de ataque
        bonusDano: 3,      // Bonus no dano
        descricao: 'Descricao do item'
    }
]
```

### 4.2 Armaduras
```javascript
armaduras: [
    {
        id: 'nome_interno',
        nome: 'Nome Exibido',
        emoji: '🛡️',
        preco: 150,
        bonusCA: 3,        // Bonus na Classe de Armadura
        descricao: 'Descricao do item'
    }
]
```

### 4.3 Consumiveis
```javascript
consumiveis: [
    {
        id: 'nome_interno',
        nome: 'Nome Exibido',
        emoji: '🧪',
        preco: 50,
        tipo: 'cura',      // cura, buff, special
        valor: 30,         // Quantidade curada ou bonus
        descricao: 'Descricao do item'
    }
]
```

---

## 5. Adicionar Novo Comando

### Passo 1: Registrar no config.js
```javascript
// src/config.js
// Localizar: CMDS: {
// Adicionar:
NOVO_COMANDO: 'novocomando',
```

### Passo 2: Criar a funcao em rpg.js
```javascript
// src/commands/rpg.js
// Adicionar a funcao:
export async function handleNovoComando(sock, msg, jid, sender, cmdArgs, reply, react) {
    const player = getPlayer(sender);
    if (!player) {
        return reply(`Crie um personagem com *${CONFIG.PREFIX}criarpj*`);
    }
    
    // Sua logica aqui
    
    return reply('Resposta do comando');
}
```

### Passo 3: Adicionar no index.js
```javascript
// index.js

// 1. Importar a funcao (localizar imports do RPG):
import { 
    handleNovoComando,  // Adicionar aqui
    // ... outros imports
} from './src/commands/rpg.js';

// 2. Adicionar o case no switch (localizar // RPG):
case CONFIG.CMDS.NOVO_COMANDO:
    await handleNovoComando(sock, msg, jid, sender, cmdArgs, reply, react);
    break;
```

---

## 6. Implementar Habilidade de Raca/Classe

**Arquivo:** `src/commands/rpg.js`

**Localizar:** `async function handleCacar` (por volta da linha 500)

**Dentro do loop de combate, adicionar verificacao:**

```javascript
// Exemplo: Goblin pode fugir
if (racaInfo?.fugirBonus && Math.random() < racaInfo.fugirBonus) {
    log.push(`T${turno}: 💨 Fugiu da batalha!`);
    break; // Sai do loop de combate
}

// Exemplo: Monge ataca duas vezes
if (classeInfo?.chanceAtaqueDuplo && Math.random() * 100 < classeInfo.chanceAtaqueDuplo) {
    // Segundo ataque
    const segundoAtaque = rolarD20();
    if (segundoAtaque + bonusAtaquePlayer >= monstro.ca) {
        const danoDuplo = danoBase;
        hpMonstro -= danoDuplo;
        log.push(`T${turno}: 🥋 Flurry! +${danoDuplo} dano extra!`);
    }
}
```

---

## 7. Formulas Importantes

### Modificador de Atributo
```javascript
// (atributo - 10) / 2, arredondado para baixo
// 10 = +0, 12 = +1, 14 = +2, 16 = +3, 18 = +4, 20 = +5
modificador = Math.floor((atributo - 10) / 2);
```

### Chance de Acerto
```javascript
// d20 + bonus >= CA do alvo
rolarD20() + bonusAtaque >= classeArmadura
```

### Dano
```javascript
// Dado da arma + modificador do atributo + bonus da arma
dano = rolarDado(dadoDano) + modificadorAtributo + bonusArma
```

### HP Maximo
```javascript
// hitDie no level 1, depois media + modificador por level
hp = hitDie + modForca;
for (level 2+) {
    hp += (hitDie / 2 + 1) + modForca;
}
```

### XP para Level
```javascript
// Base 100, aumenta 50% por level
xpNecessario = 100 * (1.5 ^ (level - 1))
```

---

## 8. Checklist para Novas Adicoes

### Nova Raca
- [ ] Adicionar objeto em `RACAS` (src/data/rpg.js)
- [ ] Implementar habilidade em `handleCacar` se necessario (src/commands/rpg.js)
- [ ] Atualizar tutorial de racas (src/commands/rpg.js)

### Nova Classe
- [ ] Adicionar objeto em `CLASSES` (src/data/rpg.js)
- [ ] Implementar habilidade em `handleCacar` (src/commands/rpg.js)
- [ ] Atualizar tutorial de classes (src/commands/rpg.js)

### Novo Monstro
- [ ] Adicionar objeto em `MONSTROS` (src/data/rpg.js)
- [ ] Manter ordenado por nivel

### Novo Item
- [ ] Adicionar em `LOJA_ITENS.armas`, `.armaduras` ou `.consumiveis` (src/data/rpg.js)

### Novo Comando
- [ ] Registrar em `CMDS` (src/config.js)
- [ ] Criar funcao `handleX` (src/commands/rpg.js)
- [ ] Exportar a funcao
- [ ] Importar no index.js
- [ ] Adicionar case no switch (index.js)
- [ ] Atualizar menu RPG se necessario

---

## 9. Dicas

1. **Use optional chaining**: Sempre use `racaInfo?.propriedade` para evitar erros
2. **Teste com !resetarpj**: Delete seu personagem e crie novamente para testar
3. **Verifique o console**: Erros aparecem no terminal do bot
4. **Backup**: Faca backup do `data/rpg.json` antes de grandes mudancas
5. **Balanceamento**: 
   - Racas devem ter bonus total entre +2 e +4
   - Monstros de nivel X devem ter HP ~ X * 8 e dano proporcional
