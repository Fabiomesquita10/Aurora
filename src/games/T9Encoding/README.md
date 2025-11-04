# T9 Encoding 📱

Decifra palavras usando o código numérico T9 de telemóveis antigos.

## 🎮 Como Jogar

1. Vê os números T9 (ex: 5683)
2. Cada número corresponde a letras:
   - 2 = ABC
   - 3 = DEF
   - 4 = GHI
   - 5 = JKL
   - 6 = MNO
   - 7 = PQRS
   - 8 = TUV
   - 9 = WXYZ
3. Digita a palavra que pensas ser a correta
4. Submete quando estiveres confiante!

## 📱 Mapeamento T9

- **2**: A, B, C
- **3**: D, E, F
- **4**: G, H, I
- **5**: J, K, L
- **6**: M, N, O
- **7**: P, Q, R, S
- **8**: T, U, V
- **9**: W, X, Y, Z

## 🎯 Exemplo

- `5683` pode ser:
  - **LOVE** (L=5, O=6, V=8, E=3)
  - Ou outra combinação válida

## 🔧 Componentes

- `T9Encoding.jsx` - Componente principal
- `T9Encoding.css` - Estilos do jogo

## 📝 Props

- `numbers` (string) - Sequência numérica T9
- `targetWord` (string, opcional) - Palavra alvo específica
- `targetPhrase` (string, opcional) - Frase alvo (múltiplas palavras)
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando acerta
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

## 💡 Dicas

- Pensa em palavras românticas comuns
- Cada número pode ser várias letras
- Podes tentar várias combinações
- Se não souberes, tenta adivinhar palavras relacionadas com amor!

