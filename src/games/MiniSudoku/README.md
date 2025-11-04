# Mini Sudoku 🔢

Versão 4×4 do clássico Sudoku usando ícones em vez de números.

## 🎮 Como Jogar

1. Preenche a grelha 4×4 com os 4 ícones: 🎄 ❤️ ⭐ 🎁
2. Cada linha, coluna e quadrado 2×2 deve ter todos os 4 ícones
3. Clica numa célula vazia e escolhe o ícone
4. Podes pedir uma dica se precisares
5. Completa a grelha para ganhar!

## 📐 Regras

- **Linha**: Cada linha deve ter 🎄 ❤️ ⭐ 🎁 (sem repetições)
- **Coluna**: Cada coluna deve ter 🎄 ❤️ ⭐ 🎁 (sem repetições)
- **Quadrado 2×2**: Cada quadrado 2×2 deve ter 🎄 ❤️ ⭐ 🎁 (sem repetições)

## 💡 Dicas

- Podes pedir uma dica que revela uma célula
- Dicas são limitadas (geralmente 1-2 por jogo)
- Usa as dicas estrategicamente

## 🎯 Validação

- O jogo valida automaticamente se a solução está correta
- Podes submeter quando estiveres confiante
- Se estiver correto, ganhas!

## 🔧 Componentes

- `MiniSudoku.jsx` - Componente principal
- `MiniSudoku.css` - Estilos do jogo

## 📝 Props

- `puzzle` (array) - Grelha do puzzle (4×4)
- `solution` (array) - Solução do puzzle
- `initial` (array) - Células iniciais preenchidas
- `hint` (object) - Informação de dica disponível
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando completa corretamente
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

## 💡 Dicas de Resolução

1. Começa por linhas/colunas com mais células preenchidas
2. Procura células que só podem ter um ícone
3. Elimina possibilidades baseado nas regras
4. Trabalha sistematicamente de célula em célula

