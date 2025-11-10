# 🎵 Script para Baixar Trechos de Música do YouTube

Este script baixa músicas do YouTube e corta trechos de 5 segundos para usar no Quiz Musical.

## 📋 Pré-requisitos

### 1. Instalar Python
- Windows: https://www.python.org/downloads/
- Mac: Já vem instalado
- Linux: `sudo apt install python3`

### 2. Instalar yt-dlp
```bash
pip install yt-dlp
```

### 3. Instalar ffmpeg
- **Windows**: 
  - Download: https://ffmpeg.org/download.html
  - Ou com Chocolatey: `choco install ffmpeg`
- **Mac**: 
  ```bash
  brew install ffmpeg
  ```
- **Linux**: 
  ```bash
  sudo apt install ffmpeg
  ```

## 🚀 Como Usar

### Método 1: Python diretamente
```bash
python download-music-snippet.py "https://www.youtube.com/watch?v=VIDEO_ID" 30 35 song1.mp3
```

### Método 2: Windows Batch (mais fácil)
```bash
download-music-snippet.bat "https://www.youtube.com/watch?v=VIDEO_ID" 30 35 song1.mp3
```

## 📝 Exemplos

### Exemplo 1: Trecho de 5 segundos
```bash
python download-music-snippet.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 30 35 song1.mp3
```
- Baixa a música
- Corta os segundos 30-35 (5 segundos)
- Guarda como `song1.mp3`

### Exemplo 2: Guardar na pasta do jogo
```bash
python download-music-snippet.py "https://www.youtube.com/watch?v=..." 45 50 src/games/MusicalQuiz/audio/song2.mp3
```

## 💡 Dicas

1. **Encontrar o melhor trecho**: 
   - Abre o YouTube
   - Vê a música e anota os segundos do trecho que queres (ex: 1:30 - 1:35 = 90s - 95s)

2. **Trechos recomendados**:
   - Refrão (geralmente mais reconhecível)
   - Início da música
   - Parte mais característica

3. **Testar antes**:
   - Toca o ficheiro MP3 para verificar se está correto
   - Verifica se o tamanho está razoável (~100-200 KB para 5 segundos)

## 🔧 Troubleshooting

### Erro: "yt-dlp não está instalado"
```bash
pip install yt-dlp
```

### Erro: "ffmpeg não está instalado"
- Windows: Descarrega de https://ffmpeg.org/download.html e adiciona ao PATH
- Mac: `brew install ffmpeg`
- Linux: `sudo apt install ffmpeg`

### Erro: "Python não encontrado"
- Instala Python de https://www.python.org/downloads/
- Marca a opção "Add Python to PATH" durante a instalação

## 📁 Estrutura Final

Depois de baixar todos os trechos:
```
src/games/MusicalQuiz/audio/
  ├── song1.mp3
  ├── song2.mp3
  ├── song3.mp3
  ├── song4.mp3
  └── song5.mp3
```

