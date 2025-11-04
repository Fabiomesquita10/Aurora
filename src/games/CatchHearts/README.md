# Catch Hearts 💝

Jogo de velocidade onde tens que apanhar corações que caem do céu.

## 🎮 Como Jogar

1. Clica em "Iniciar" para começar
2. Corações aparecem aleatoriamente na área de jogo
3. Clica nos corações para os apanhar
4. Apanha o número objetivo de corações antes do tempo acabar!

## ⏱️ Temporizador

- Tempo limitado (padrão: 60 segundos)
- Corações aparecem continuamente durante o jogo
- Velocidade de aparição aumenta com o tempo

## 🎯 Objetivo

- Apanha o número objetivo de corações (padrão: 30)
- Cada coração apanhado conta para o score
- Se apanhares todos a tempo, ganhas!

## 📊 Tentativas

- Número máximo de tentativas configurável (padrão: 3)
- Se perderes, podes tentar novamente
- Cada tentativa regista os resultados

## 🎨 Visual

- Corações coloridos aparecem aleatoriamente
- Animação suave de queda
- Feedback visual ao clicar nos corações

## 🔧 Componentes

- `CatchHearts.jsx` - Componente principal
- `CatchHearts.css` - Estilos do jogo

## 📝 Props

- `targetHearts` (number) - Número objetivo de corações (padrão: 30)
- `gameDuration` (number) - Duração do jogo em segundos (padrão: 60)
- `maxAttempts` (number) - Número máximo de tentativas (padrão: 3)
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando ganha
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

