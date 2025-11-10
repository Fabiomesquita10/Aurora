# Memory Game 🧠

Jogo de memória clássico onde o objetivo é encontrar todos os pares de cartas.

## Como Jogar

1. Clica em duas cartas para as virar
2. Se as cartas formarem um par (mesmo conteúdo), ficam viradas
3. Se não formarem par, voltam a virar após 1 segundo
4. Encontra todos os pares para ganhar!

## Características

- **12 cartas** (6 pares)
- Cartas são baralhadas aleatoriamente a cada jogo
- Animações suaves ao virar cartas
- Feedback visual quando encontra um par (verde) ou erra (volta a virar)

## Dados Guardados

No `game-attempts.json`:
- `failedAttempts`: Número de vezes que errou (virou cartas que não são par)
- `timeSeconds`: Tempo total em segundos
- `moves`: Número total de movimentos
- `totalPairs`: Número total de pares (6)

## Configuração

As cartas são definidas no `calendar-config.json` para cada dia:

```json
{
  "game": {
    "type": "memory-game",
    "cards": [
      { "id": "card1", "content": "🎵", "pair": "card1" },
      { "id": "card1", "content": "🎵", "pair": "card1" },
      { "id": "card2", "content": "❤️", "pair": "card2" },
      { "id": "card2", "content": "❤️", "pair": "card2" },
      // ... mais pares
    ]
  }
}
```

- `id`: Identificador único do par (deve ser igual para as duas cartas do par)
- `content`: Conteúdo da carta (emoji ou texto)
- `pair`: Referência ao par (deve ser igual ao `id`)

## Playground

No Playground, o jogo repete as mesmas cartas do dia original (conteúdo específico).

