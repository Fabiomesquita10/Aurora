# Number Sequence 🔢

Jogo de sequências numéricas onde o objetivo é identificar o padrão e completar a sequência.

## Como Jogar

1. Observa a sequência de números apresentada
2. Identifica o padrão (soma, multiplicação, quadrados, etc.)
3. Escreve o número que falta na sequência
4. Usa a dica se precisares de ajuda (aparece automaticamente)

## Características

- Múltiplas sequências por jogo
5. Dicas opcionais para cada sequência
- Feedback imediato (correto/incorreto)
- Progresso visual com pontos de progresso

## Dados Guardados

No `game-attempts.json`:
- `correctAnswers`: Número de sequências completadas corretamente
- `totalSequences`: Número total de sequências

## Configuração

As sequências são definidas no `calendar-config.json` para cada dia:

```json
{
  "game": {
    "type": "number-sequence",
    "sequences": [
      {
        "id": "seq1",
        "sequence": [2, 4, 6, 8, "?"],
        "answer": 10,
        "hint": "Soma 2 a cada número"
      },
      {
        "id": "seq2",
        "sequence": [1, 3, 5, 7, "?"],
        "answer": 9,
        "hint": "Números ímpares"
      }
      // ... mais sequências
    ]
  }
}
```

- `id`: Identificador único da sequência
- `sequence`: Array com os números da sequência (use `"?"` para o número a descobrir)
- `answer`: Resposta correta (número)
- `hint`: Dica opcional para ajudar o jogador

## Playground

No Playground, o jogo repete as mesmas sequências do dia original (conteúdo específico).

