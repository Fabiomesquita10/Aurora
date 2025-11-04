# Word Search 🔍

Jogo de caça-palavras onde tens que encontrar todas as palavras escondidas na grelha.

## 🎮 Como Jogar

1. Vê a lista de palavras que precisas encontrar
2. Clica e arrasta (ou clica início e fim) para selecionar letras
3. Palavras podem estar em qualquer direção:
   - Horizontal (→)
   - Vertical (↓)
   - Diagonal (↘, ↙)
   - Invertidas (←, ↑, ↖, ↗)
4. Quando encontrares uma palavra, ela fica marcada na lista
5. Encontra todas as palavras para ganhar!

## 🎯 Direções

As palavras podem estar em 8 direções:
- Horizontal: esquerda → direita
- Horizontal invertida: direita → esquerda
- Vertical: cima → baixo
- Vertical invertida: baixo → cima
- Diagonal: 4 direções (↘, ↙, ↖, ↗)

## 📊 Progresso

- Lista de palavras mostra quais já foram encontradas
- Palavras encontradas ficam marcadas e riscadas
- Contador de palavras encontradas

## 🎨 Visual

- Grelha de letras colorida
- Palavras selecionadas ficam destacadas
- Palavras encontradas ficam permanentemente marcadas

## 🔧 Componentes

- `WordSearch.jsx` - Componente principal
- `WordSearch.css` - Estilos do jogo

## 📝 Props

- `words` (array) - Array de palavras para encontrar
- `gridSize` (number) - Tamanho da grelha (padrão: 12x12)
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando encontra todas as palavras
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

## 💡 Dicas

- Palavras podem começar em qualquer posição
- Podes arrastar em qualquer direção
- Algumas palavras podem sobrepor-se
- Letras não usadas aparecem em cinza

