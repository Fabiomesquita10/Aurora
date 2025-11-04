# Bomb Wire 🔴

Jogo de desativação de bomba onde tens que cortar o fio correto antes do tempo acabar.

## 🎮 Como Jogar

1. Inicia o jogo e começa o temporizador
2. Lê as regras fornecidas (dicas sobre qual fio cortar)
3. Podes pedir até 3 dicas resolvendo questões de matemática
4. Corta o fio correto antes do tempo acabar!

## 💡 Sistema de Dicas

- Podes pedir até 3 dicas durante o jogo
- Cada dica requer resolver uma questão de matemática
- As dicas revelam regras sobre qual fio cortar
- As questões aparecem ao lado do jogo (desktop) ou abaixo (mobile)

## 🔴 Fios

Três fios disponíveis:
- **Vermelho** 🔴
- **Azul** 🔵
- **Verde** 🟢

Cada fio tem um número aleatório associado (1-10).

## ⏱️ Temporizador

- Tempo limite configurável (padrão: 15 segundos)
- Se o tempo acabar, perdes!

## 🎯 Regras

As regras são baseadas em:
- Tempo restante
- Números dos fios
- Condições lógicas (ex: "Se tempo > 10, corta vermelho")

## 📊 Pontuação

- Pontos baseados no tempo restante quando cortas o fio correto
- Mais tempo restante = mais pontos

## 🔧 Componentes

- `BombWire.jsx` - Componente principal
- `BombWire.css` - Estilos do jogo

## 📝 Props

- `difficulty` (string) - Dificuldade do jogo
- `rules` (array) - Array de regras para determinar fio correto
- `maxTime` (number) - Tempo máximo em segundos
- `mathQuestions` (array) - Questões de matemática para dicas
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando ganha
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

