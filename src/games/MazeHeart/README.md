# Maze Heart 🧩

Jogo de labirinto em forma de coração onde tens que chegar ao coração final.

## 🎮 Como Jogar

1. Usa as setas do teclado ou WASD para mover o coração
2. Navega pelo labirinto evitando as paredes
3. Chega ao coração final (rosa) para ganhar!

## 🎯 Dificuldades

- **Easy**: Labirinto menor, corredores largos, colisões mais permissivas
- **Normal**: Tamanho médio, balanço entre dificuldade e jogabilidade
- **Hard**: Labirinto maior, corredores estreitos, colisões precisas
- **Insane**: Labirinto muito grande, corredores muito estreitos, máximo desafio

## 🎮 Controlos

- **Setas** (↑↓←→) ou **WASD** para mover
- Movimento contínuo enquanto manténs pressionado
- Detecção de colisão com paredes

## 🎨 Visual

- Labirinto gerado aleatoriamente
- Formato de coração
- Caminho do início (azul) ao fim (rosa)
- Animação suave de movimento

## 📊 Características

- Geração aleatória de labirintos
- Garantia de caminho do início ao fim
- Dificuldade ajustável
- Sistema de colisão preciso

## 🔧 Componentes

- `MazeHeart.jsx` - Componente principal
- `MazeHeart.css` - Estilos do jogo

## 📝 Props

- `mazeSize` (number) - Tamanho do labirinto (células por lado)
- `difficulty` (string) - Nível de dificuldade: 'easy', 'normal', 'hard', 'insane'
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando ganha
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

## 💡 Dicas

- Usa as setas para movimento mais preciso
- Não te apresses - planeia o caminho
- Em dificuldades altas, os corredores são muito estreitos
- Podes sempre voltar atrás se ficares preso

