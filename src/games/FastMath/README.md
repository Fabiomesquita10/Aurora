# Fast Math ⚡

Jogo de matemática rápida onde o objetivo é resolver o máximo de cálculos possível dentro do tempo limite.

## Como Jogar

1. Observa a pergunta matemática
2. Responde o mais rápido possível
3. Continua a responder perguntas até o tempo acabar
4. O jogo volta ao início quando acabas todas as perguntas

## Características

- **Timer configurável** (padrão: 30 segundos)
- Perguntas repetem-se em ciclo até o tempo acabar
- Feedback visual (corretas/erradas)
- Timer fica vermelho quando faltam 10 segundos
- Foco automático no campo de resposta

## Dados Guardados

No `game-attempts.json`:
- `correctAnswers`: Número de respostas corretas
- `questionTimes`: Array com dados de cada pergunta respondida:
  - `questionIndex`: Índice da pergunta
  - `question`: Texto da pergunta
  - `answer`: Resposta correta
  - `userAnswer`: Resposta do utilizador
  - `isCorrect`: Se acertou ou não
  - `timeSeconds`: Tempo em segundos para responder esta pergunta
- `totalQuestions`: Número total de perguntas disponíveis
- `questionsAnswered`: Total de perguntas respondidas (corretas + erradas)

## Configuração

As perguntas são definidas no `calendar-config.json` para cada dia:

```json
{
  "game": {
    "type": "fast-math",
    "timeLimit": 30,
    "questions": [
      { "question": "5 + 3", "answer": 8 },
      { "question": "10 - 4", "answer": 6 },
      { "question": "7 × 2", "answer": 14 },
      { "question": "15 ÷ 3", "answer": 5 }
      // ... mais perguntas
    ]
  }
}
```

- `timeLimit`: Tempo limite em segundos (padrão: 30)
- `question`: Texto da pergunta matemática
- `answer`: Resposta correta (número)

## Playground

No Playground, o jogo repete as mesmas perguntas do dia original (conteúdo específico).

