# 🌟 Projeto Aurora - Estrutura e Organização

## 📋 Visão Geral

Calendário de Advento digital com 25 dias (1-25 de dezembro), cada dia desbloqueia um mini-jogo. Ao completar, revela um prémio. Inclui Wordle diário que dá pontos para gastar na Loja.

## 🗂️ Estrutura de Ficheiros

```
src/
├── components/          # Componentes principais da aplicação
│   ├── AuroraApp.jsx   # Componente principal com navegação
│   ├── Calendar.jsx    # Calendário de advento (25 dias)
│   ├── Presents.jsx    # Aba de presentes ganhos
│   ├── Shop.jsx        # Loja de pontos
│   └── *.css           # Estilos dos componentes
│
├── games/              # Mini-jogos
│   ├── WordleRomantico.jsx  # Jogo Wordle (implementado)
│   ├── WordleRomantico.css
│   └── words.js        # Dicionário de palavras
│
├── utils/              # Utilitários e lógica
│   ├── gameState.js    # Estado global do jogo (pontos, desbloqueios, etc.)
│   └── dateUtils.js    # Funções de gestão de datas e bloqueios
│
├── App.jsx             # Componente raiz
├── main.jsx            # Entry point
└── index.css           # Estilos globais
```

## 🎁 Sistema de Prendas

25 prendas únicas (definidas em `src/utils/gameState.js`):
- **Categorias**: Low, Medium, High, Principal, Final
- **Pontos**: 10-100 pontos por presente
- **Preço estimado**: 0-100€
- Cada dia tem um presente específico

## 💎 Sistema de Pontos

### Wordle Diário
- **1ª tentativa**: 5 pontos
- **2ª tentativa**: 4 pontos
- **3ª tentativa**: 3 pontos
- **4ª tentativa**: 2 pontos
- **5ª tentativa**: 1 ponto
- **6ª tentativa**: 1 ponto
- **Falha completa**: 0 pontos (opcional: +1 ponto de participação)

### Prendas dos Dias
- Pontos adicionais ao completar o jogo do dia
- Valores variam entre 10-100 pontos conforme a categoria

## 🛍️ Loja

10 itens disponíveis (todos repetíveis):
- Chocolate 🍫 (3 pts)
- Rosa 🌹 (5 pts)
- Foto nossa 📸 (6 pts)
- Massagem 💆 (10 pts)
- Beijo extra 💋 (1 pt)
- Bebida quente ☕ (4 pts)
- Escolher filme 🎬 (2 pts)
- Mensagem secreta 💌 (2 pts)
- Sobremesa 🍪 (6 pts)
- Surpresa pequena 🎁 (5 pts)

## 🔒 Sistema de Bloqueio

- **Dia 1**: Disponível desde 1 de dezembro às 00:00
- **Dias seguintes**: Desbloqueiam às **21h** do dia anterior
- Dias futuros mostram countdown até desbloqueio

## 🎮 Jogos Planeados

### Já Implementado
- ✅ **Wordle Romântico**: Adivinhar palavra em 6 tentativas

### Para Implementar
- Quiz de perguntas
- Encoding T9
- QR / Caça ao tesouro
- Jogo de lógica (pares)
- Roda para girar
- Apanhar corações
- Trivia das fotos
- Puzzle (tile-swap)
- Simon (sequência)
- Criptograma
- Mini Sudoku 4×4
- "Isto ou Aquilo" casal
- Jogo de reflexo
- Quiz musical
- 3 Mini-riddles
- Memória (pares)
- Frase baralhada
- Caça-palavras
- Sopa de letras

**Nota**: Estrutura preparada em `GAME_TYPES` e `DAILY_GAMES` em `gameState.js`

## 💾 Persistência

Todos os dados guardados em `localStorage`:
- Pontos
- Dias desbloqueados
- Jogos ganhos
- Itens comprados
- Tentativas diárias do Wordle
- Última data de jogo diário

## 📱 Páginas/Navegação

1. **Calendário** 📅 - Grid de 25 dias, clicáveis quando disponíveis
2. **Presentes** 🎁 - Lista de prendas desbloqueadas e ganhas
3. **Loja** 🛍️ - Comprar itens com pontos ganhos

## 🔧 Configuração Futura

### Adicionar Novos Jogos
1. Criar componente em `src/games/`
2. Adicionar tipo em `GAME_TYPES` em `gameState.js`
3. Mapear dia → jogo em `DAILY_GAMES`
4. Integrar no `Calendar.jsx`

### Personalizar Prendas
Editar `DAILY_GIFTS` em `src/utils/gameState.js`

### Personalizar Itens da Loja
Editar `SHOP_ITEMS` em `src/utils/gameState.js`

