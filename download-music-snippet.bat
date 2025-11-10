@echo off
REM Script Windows para baixar trechos de música do YouTube
REM Uso: download-music-snippet.bat <url> <inicio_seg> <fim_seg> <nome_ficheiro>

if "%~4"=="" (
    echo Uso: download-music-snippet.bat ^<url_youtube^> ^<inicio_seg^> ^<fim_seg^> ^<nome_ficheiro^>
    echo.
    echo Exemplo:
    echo   download-music-snippet.bat "https://www.youtube.com/watch?v=az-vjcgjmBI" 76 81 song1.mp3
    echo.
    echo OU no PowerShell:
    echo   .\download-music-snippet.bat "https://www.youtube.com/watch?v=az-vjcgjmBI" 76 81 song1.mp3
    exit /b 1
)

echo ========================================
echo Verificando dependencias...
echo ========================================
echo.

REM Verificar yt-dlp
echo [1/2] Verificando yt-dlp...
yt-dlp --version >nul 2>&1
if errorlevel 1 (
    echo [AVISO] yt-dlp nao esta instalado!
    echo [INFO] A instalar yt-dlp...
    pip install yt-dlp
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar yt-dlp!
        echo [INFO] Tenta manualmente: pip install yt-dlp
        pause
        exit /b 1
    )
    echo [SUCESSO] yt-dlp instalado!
) else (
    echo [OK] yt-dlp esta instalado
)
echo.

REM Verificar ffmpeg
echo [2/2] Verificando ffmpeg...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    REM Tentar recarregar PATH do sistema do registo
    for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYSTEM_PATH=%%B"
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"
    if defined SYSTEM_PATH set "PATH=%SYSTEM_PATH%;%USER_PATH%"
    
    REM Tentar verificar novamente
    ffmpeg -version >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] ffmpeg nao esta instalado ou nao esta no PATH!
        echo.
        echo [INFO] Se acabaste de instalar ffmpeg com winget:
        echo   O PATH foi atualizado, mas precisas de REINICIAR o terminal!
        echo   Fecha e reabre o PowerShell/CMD e tenta novamente.
        echo.
        echo [INFO] Opcoes para instalar ffmpeg:
        echo   1. Com winget: winget install ffmpeg
        echo   2. Com Chocolatey: choco install ffmpeg
        echo   3. Download manual: https://ffmpeg.org/download.html
        echo.
        echo [ERRO] ffmpeg e necessario para cortar os trechos de audio!
        echo [INFO] Instala ffmpeg e reinicia o terminal, depois tenta novamente.
        pause
        exit /b 1
    )
)
echo [OK] ffmpeg esta instalado
echo.

echo ========================================
echo Todas as dependencias estao instaladas!
echo ========================================
echo.

REM Remover aspas dos argumentos se existirem
set URL=%~1
set START=%~2
set END=%~3
set OUTPUT=%~4

REM Validar argumentos
if "%URL%"=="" (
    echo [ERRO] URL nao fornecido!
    exit /b 1
)
if "%START%"=="" (
    echo [ERRO] Tempo de inicio nao fornecido!
    exit /b 1
)
if "%END%"=="" (
    echo [ERRO] Tempo de fim nao fornecido!
    exit /b 1
)
if "%OUTPUT%"=="" (
    echo [ERRO] Nome do ficheiro nao fornecido!
    exit /b 1
)

echo [INFO] URL: %URL%
echo [INFO] Inicio: %START%s
echo [INFO] Fim: %END%s
echo [INFO] Ficheiro: %OUTPUT%
echo.
echo Baixando e cortando trecho...
python download-music-snippet.py "%URL%" %START% %END% "%OUTPUT%"
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao processar.
    pause
)

