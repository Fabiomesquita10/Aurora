# Puzzle (Tile-Swap)

Jogo de puzzle onde o jogador precisa montar uma imagem trocando peças.

## Como Funciona

1. A imagem é dividida em uma grelha 3×3 ou 4×4
2. As peças são embaralhadas (exceto uma posição que fica vazia)
3. O jogador clica numa peça adjacente ao espaço vazio para a mover
4. O objetivo é colocar todas as peças na posição correta

## Configuração

### Colocar a Imagem

Coloca a imagem na pasta do jogo:
```
src/games/Puzzle/image.jpg
```

Ou em formato PNG:
```
src/games/Puzzle/image.png
```

### Uso no Calendário

Para usar este jogo no calendário, adiciona no `calendar-config.json`:

```json
{
  "day": 1,
  "game": {
    "type": "puzzle-tiles",
    "description": "Monta a imagem",
    "gridSize": 3,
    "imageUrl": "/src/games/Puzzle/image.jpg"
  }
}
```

### Props

- `gridSize` (number): Tamanho da grelha (3 para 3×3, 4 para 4×4). Default: 3
- `imageUrl` (string): URL ou caminho para a imagem
- `day` (number): Dia do calendário
- `onWin` (function): Callback quando o jogo é ganho
- `onComplete` (function): Callback quando o jogo é completado
- `onGameAttempt` (function): Callback para registar tentativa

## Funcionalidades

- ✅ Suporta grelhas 3×3 e 4×4
- ✅ Embaralhamento inteligente (garante que é solucionável)
- ✅ Feedback visual quando uma peça está na posição correta
- ✅ Contador de movimentos e tempo
- ✅ Interface responsiva

## Dificuldade

- **3×3**: 8 peças (mais fácil)
- **4×4**: 15 peças (mais difícil)

