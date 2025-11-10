#!/usr/bin/env python3
"""
Script para baixar trechos de música do YouTube
Uso: python download-music-snippet.py <url> <inicio_segundos> <fim_segundos> <nome_ficheiro>
Exemplo: python download-music-snippet.py "https://www.youtube.com/watch?v=..." 30 35 song1.mp3
"""

import sys
import subprocess
import os

def check_dependencies():
    """Verifica se yt-dlp e ffmpeg estão instalados"""
    try:
        subprocess.run(['yt-dlp', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[ERRO] yt-dlp nao esta instalado!")
        print("[INFO] Instala com: pip install yt-dlp")
        return False
    
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[ERRO] ffmpeg nao esta instalado!")
        print("[INFO] Instala ffmpeg:")
        print("   Windows: https://ffmpeg.org/download.html")
        print("   Mac: brew install ffmpeg")
        print("   Linux: sudo apt install ffmpeg")
        return False
    
    return True

def download_and_cut(url, start_time, end_time, output_file):
    """Baixa o vídeo do YouTube e corta o trecho"""
    print(f"[MUSICA] A baixar audio de: {url}")
    print(f"[TEMPO] Trecho: {start_time}s - {end_time}s ({end_time - start_time}s)")
    print(f"[FICHEIRO] {output_file}")
    print()
    
    # Criar pasta de destino se não existir
    output_dir = os.path.dirname(output_file) if os.path.dirname(output_file) else '.'
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Ficheiro temporário
    temp_file = "temp_audio.mp3"
    
    try:
        # Baixar áudio do YouTube
        print("[DOWNLOAD] A baixar...")
        subprocess.run([
            'yt-dlp',
            '-x',  # Extrair apenas áudio
            '--audio-format', 'mp3',
            '--audio-quality', '0',  # Melhor qualidade
            '-o', temp_file,
            url
        ], check=True)
        
        print("[CORTAR] A cortar trecho...")
        # Cortar o trecho com ffmpeg
        subprocess.run([
            'ffmpeg',
            '-i', temp_file,
            '-ss', str(start_time),  # Início
            '-t', str(end_time - start_time),  # Duração
            '-acodec', 'copy',  # Copiar codec (mais rápido)
            '-y',  # Sobrescrever se existir
            output_file
        ], check=True, capture_output=True)
        
        # Remover ficheiro temporário
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        print(f"[SUCESSO] Ficheiro guardado: {output_file}")
        file_size = os.path.getsize(output_file) / 1024  # KB
        print(f"[TAMANHO] {file_size:.1f} KB")
        
    except subprocess.CalledProcessError as e:
        print(f"[ERRO] Erro ao processar: {e}")
        if os.path.exists(temp_file):
            os.remove(temp_file)
        return False
    
    return True

def main():
    if len(sys.argv) != 5:
        print("[USO] python download-music-snippet.py <url_youtube> <inicio_seg> <fim_seg> <nome_ficheiro>")
        print()
        print("[EXEMPLO]")
        print('   python download-music-snippet.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 30 35 song1.mp3')
        print()
        print("[INFO] Isto vai baixar e cortar os segundos 30-35 (5 segundos) da musica")
        sys.exit(1)
    
    url = sys.argv[1]
    try:
        start_time = float(sys.argv[2])
        end_time = float(sys.argv[3])
    except ValueError:
        print("[ERRO] Os tempos devem ser numeros!")
        sys.exit(1)
    
    output_file = sys.argv[4]
    
    # Validar tempos
    if start_time < 0 or end_time <= start_time:
        print("[ERRO] Tempo invalido! O fim deve ser maior que o inicio.")
        sys.exit(1)
    
    duration = end_time - start_time
    if duration > 10:
        print(f"[AVISO] O trecho tem {duration}s. Recomendado: 5 segundos.")
        response = input("Continuar? (s/n): ")
        if response.lower() != 's':
            sys.exit(0)
    
    # Verificar dependências
    if not check_dependencies():
        sys.exit(1)
    
    # Processar
    success = download_and_cut(url, start_time, end_time, output_file)
    
    if success:
        print()
        print("[PRONTO] Podes usar o ficheiro no jogo!")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

