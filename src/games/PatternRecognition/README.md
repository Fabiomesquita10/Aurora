# Pattern Recognition 🔍

Jogo de reconhecimento de padrões visuais onde o objetivo é identificar o padrão e escolher o próximo elemento.

## Como Jogar

1. Observa a sequência de elementos (emojis, símbolos, números)
2. Identifica o padrão
3. Escolhe o próximo elemento correto entre as opções
4. A dica só aparece após 2 erros no mesmo padrão

## Características

- Múltiplos padrões por jogo
- Dicas aparecem apenas após 2 erros no mesmo padrão
- Feedback visual imediato (verde = correto, vermelho = errado)
- Progresso visual com pontos de progresso
- Animações suaves

## Dados Guardados

No `game-attempts.json`:
- `correctAnswers`: Número de padrões identificados corretamente
- `totalErrors`: Número total de vezes que errou
- `totalPatterns`: Número total de padrões

## Configuração

Os padrões são definidos no `calendar-config.json` para cada dia:

```json
{
  "game": {
    "type": "pattern-recognition",
    "patterns": [
      {
        "id": "pattern1",
        "sequence": ["🔴", "🔵", "🔴", "🔵", "?"],
        "options": ["🔴", "🔵", "🟢"],
        "correct": 0,
        "hint": "Alterna entre vermelho e azul"
      },
      {
        "id": "pattern2",
        "sequence": ["⭐", "⭐", "❤️", "⭐", "⭐", "?"],
        "options": ["⭐", "❤️", "🎁"],
        "correct": 1,
        "hint": "Dois estrelas, um coração"
      }
      // ... mais padrões
    ]
  }
}
```

- `id`: Identificador único do padrão
- `sequence`: Array com os elementos da sequência (use `"?"` para o elemento a descobrir)
- `options`: Array com as opções de resposta (mínimo 3)
- `correct`: Índice da opção correta (0-based)
- `hint`: Dica que aparece após 2 erros

## Playground

No Playground, o jogo repete os mesmos padrões do dia original (conteúdo específico).

