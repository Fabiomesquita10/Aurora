# Cryptogram 🔐

Jogo de decifração onde tens que descobrir o texto codificado por substituição de letras.

## 🎮 Como Jogar

1. Vê o texto codificado (letras substituídas)
2. Clica numa letra codificada para selecioná-la
3. Escolhe a letra que pensas ser a correta
4. Repete até decifrares todo o texto
5. Quando estiveres confiante, submete a solução!

## 🔤 Sistema de Codificação

- Cada letra do alfabeto é substituída por outra
- A mesma letra sempre tem a mesma substituição
- Exemplo: Se A = B, então todos os A's no texto são B's

## 🎯 Dicas

- Começa por letras comuns (E, A, O, S, R)
- Procura padrões no texto
- Palavras pequenas são mais fáceis de decifrar
- Podes testar diferentes substituições

## 📊 Progresso

- Vê o texto decodificado em tempo real
- Letras não decodificadas aparecem como "_"
- Podes mudar qualquer substituição a qualquer momento

## 🔧 Componentes

- `Cryptogram.jsx` - Componente principal
- `Cryptogram.css` - Estilos do jogo

## 📝 Props

- `encodedText` (string) - Texto codificado
- `decodedText` (string) - Texto decodificado (solução)
- `cipherType` (string) - Tipo de cifra
- `cipherRule` (object) - Regras da cifra
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando acerta
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

## 💡 Estratégias

1. Procura palavras de 1 letra (geralmente "A" ou "I")
2. Procura palavras de 2 letras comuns ("DE", "EM", "OU")
3. Analisa terminações comuns ("-ÇÃO", "-MENTO")
4. Usa padrões de duplicação de letras

