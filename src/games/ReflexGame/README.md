# Reflex Game ⚡

Jogo de reflexos e velocidade - clica quando algo mudar!

## 🎮 Como Jogar

1. Espera pela mudança visual (cor, forma, etc.)
2. Clica o mais rápido possível quando algo mudar
3. Repete para várias rondas (geralmente 5)
4. Ganha se tiveres bons tempos de reação!

## ⚡ Tempo de Reação

- O jogo mede o teu tempo de reação em milissegundos
- Mais rápido = mais pontos
- Pontuação: (1000 - tempo_reacao) / 10
- Penalização se clicares muito cedo

## 🎯 Rondas

- Múltiplas rondas (geralmente 5)
- Cada ronda tem um tempo aleatório de espera
- Score acumula ao longo das rondas

## ⚠️ Penalizações

- Se clicares antes da mudança, perdes 10 pontos
- Conta como erro
- Espera pela mudança visual!

## 📊 Pontuação

- Baseada na velocidade de reação
- Score final = soma de todos os tempos de reação
- Melhor tempo de reação = mais pontos

## 🔧 Componentes

- `ReflexGame.jsx` - Componente principal
- `ReflexGame.css` - Estilos do jogo

## 📝 Props

- `rounds` (number) - Número de rondas
- `day` (number) - Dia do calendário
- `onWin` (function) - Callback quando completa
- `onComplete` (function) - Callback quando completa
- `onGameAttempt` (function) - Callback para registar tentativa

## 💡 Dicas

- Mantém os olhos focados na área de mudança
- Não cliques antecipadamente - espera!
- Resposta rápida = mais pontos
- Concentra-te e fica alerta

