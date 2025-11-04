# Wordle Romântico 💕

Jogo de palavras inspirado no Wordle, mas com palavras românticas.

## 🎮 Como Jogar

- Adivinha a palavra romântica de 5 letras em até 6 tentativas
- Cada tentativa deve ser uma palavra válida de 5 letras
- Recebe feedback por letra:
  - 🟢 **Verde**: Letra correta na posição correta
  - 🟡 **Amarelo**: Letra existe na palavra mas em posição diferente
  - ⚪ **Cinza**: Letra não existe na palavra

## 📊 Pontuação

- **1ª tentativa**: 5 pontos
- **2ª tentativa**: 4 pontos
- **3ª tentativa**: 3 pontos
- **4ª tentativa**: 2 pontos
- **5ª tentativa**: 1 ponto
- **6ª tentativa**: 1 ponto
- **Falha**: 0 pontos

## 🔧 Componentes

- `WordleRomantico.jsx` - Componente principal do jogo
- `WordleRomantico.css` - Estilos do jogo
- `words.js` - Dicionário de palavras românticas (partilhado)

## 📝 Props

- `targetWord` (string, opcional) - Palavra específica para adivinhar
- `day` (number) - Dia do calendário (para registo de tentativas)
- `onWin` (function) - Callback quando ganha
- `onComplete` (function) - Callback quando completa (ganha ou perde)
- `onGameAttempt` (function) - Callback para registar tentativa
- `calculateWordlePoints` (function) - Função para calcular pontos
- `randomMode` (boolean) - Se true, usa palavra aleatória

## 🎯 Funcionalidades

- Validação de palavras contra dicionário
- Feedback visual por letra
- Teclado virtual com feedback
- Contagem de tentativas
- Registro automático de tentativas e scores

