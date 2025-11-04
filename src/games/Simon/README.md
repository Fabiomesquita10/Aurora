# Simon - Memorizar Sequência

Jogo de memória onde o jogador precisa memorizar e repetir sequências de cores.

## Como Funciona

1. O jogo mostra uma sequência de bolas que piscam
2. O jogador precisa repetir a sequência na ordem correta
3. Após acertar uma sequência, passa para a próxima
4. O jogo termina quando todas as sequências são completadas ou quando há um erro

## Configuração

### Uso no Calendário

Para usar este jogo no calendário, adiciona no `calendar-config.json`:

```json
{
  "day": 1,
  "game": {
    "type": "simon",
    "description": "Memorizar Sequência",
    "numberOfBalls": 4,
    "sequences": [
      [0, 1, 2, 3],
      [2, 0, 1, 3, 0],
      [1, 2, 0, 3, 2, 1]
    ]
  }
}
```

### Props

- `numberOfBalls` (number): Número de bolas disponíveis (default: 4)
- `sequences` (array): Array de sequências. Cada sequência é um array de números (índices das bolas). Se não fornecido, gera sequências aleatórias.
- `day` (number): Dia do calendário
- `onWin` (function): Callback quando o jogo é ganho
- `onComplete` (function): Callback quando o jogo é completado
- `onGameAttempt` (function): Callback para registar tentativa

## Dados Guardados

No `game-attempts.json`:
- `correctSequences`: Número de sequências acertadas
- `totalSequences`: Número total de sequências
- `averageReactionTime`: Tempo médio de reação em milissegundos
- `timeSeconds`: Tempo total em segundos
- `numberOfBalls`: Número de bolas usadas

## Funcionalidades

- ✅ Configuração personalizada de número de bolas
- ✅ Sequências personalizadas ou geradas aleatoriamente
- ✅ Feedback visual quando as bolas piscam
- ✅ Contador de sequências acertadas
- ✅ Tempo médio de reação
- ✅ Interface responsiva

