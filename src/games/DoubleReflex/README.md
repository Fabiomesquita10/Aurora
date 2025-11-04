# Reflexo Duplo

Jogo de reflexo onde o jogador precisa clicar rapidamente no botão correto entre duas opções.

## Como Funciona

1. Dois botões aparecem após um delay aleatório (1-3 segundos)
2. Um botão é o correto (verde com ✓) e outro é errado (vermelho com ✗)
3. O jogador precisa clicar no botão correto o mais rápido possível
4. O jogo continua por várias rondas
5. São registados os tempos de reação e os erros

## Configuração

### Uso no Calendário

Para usar este jogo no calendário, adiciona no `calendar-config.json`:

```json
{
  "day": 1,
  "game": {
    "type": "double-reflex",
    "description": "Reflexo Duplo",
    "rounds": 10
  }
}
```

### Props

- `rounds` (number): Número de rondas/tentativas (default: 10)
- `day` (number): Dia do calendário
- `onWin` (function): Callback quando o jogo é ganho
- `onComplete` (function): Callback quando o jogo é completado
- `onGameAttempt` (function): Callback para registar tentativa

## Dados Guardados

No `game-attempts.json`:
- `reactionTimes`: Array com todos os tempos de reação em milissegundos
- `averageReactionTime`: Tempo médio de reação em milissegundos
- `errors`: Número de vezes que falhou (clicou no botão errado)
- `rounds`: Número total de rondas
- `timeSeconds`: Tempo total em segundos

## Funcionalidades

- ✅ Delay aleatório antes de mostrar os botões (1-3 segundos)
- ✅ Botão correto escolhido aleatoriamente
- ✅ Medição precisa de tempo de reação
- ✅ Contador de erros
- ✅ Interface responsiva

