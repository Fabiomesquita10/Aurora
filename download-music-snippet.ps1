# Script PowerShell para baixar trechos de música do YouTube
# Uso: .\download-music-snippet.ps1 <url> <inicio_seg> <fim_seg> <nome_ficheiro>

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    
    [Parameter(Mandatory=$true)]
    [double]$StartTime,
    
    [Parameter(Mandatory=$true)]
    [double]$EndTime,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputFile
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificando dependencias..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar yt-dlp
Write-Host "[1/2] Verificando yt-dlp..." -ForegroundColor Yellow
try {
    $null = yt-dlp --version 2>$null
    Write-Host "[OK] yt-dlp esta instalado" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] yt-dlp nao esta instalado!" -ForegroundColor Red
    Write-Host "[INFO] A instalar yt-dlp..." -ForegroundColor Yellow
    pip install yt-dlp
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRO] Falha ao instalar yt-dlp!" -ForegroundColor Red
        Write-Host "[INFO] Tenta manualmente: pip install yt-dlp" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[SUCESSO] yt-dlp instalado!" -ForegroundColor Green
}
Write-Host ""

# Verificar ffmpeg
Write-Host "[2/2] Verificando ffmpeg..." -ForegroundColor Yellow
try {
    $null = ffmpeg -version 2>$null
    Write-Host "[OK] ffmpeg esta instalado" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] ffmpeg nao esta instalado ou nao esta no PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "[INFO] Se acabaste de instalar ffmpeg com winget:" -ForegroundColor Yellow
    Write-Host "  O PATH foi atualizado, mas precisas de REINICIAR o terminal!" -ForegroundColor Yellow
    Write-Host "  Fecha e reabre o PowerShell e tenta novamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[INFO] Opcoes para instalar ffmpeg:" -ForegroundColor Yellow
    Write-Host "  1. Com winget: winget install ffmpeg" -ForegroundColor White
    Write-Host "  2. Com Chocolatey: choco install ffmpeg" -ForegroundColor White
    Write-Host "  3. Download manual: https://ffmpeg.org/download.html" -ForegroundColor White
    Write-Host ""
    Write-Host "[ERRO] ffmpeg e necessario para cortar os trechos de audio!" -ForegroundColor Red
    Write-Host "[INFO] Instala ffmpeg e reinicia o terminal, depois tenta novamente." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Todas as dependencias estao instaladas!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] URL: $Url" -ForegroundColor Cyan
Write-Host "[INFO] Inicio: ${StartTime}s" -ForegroundColor Cyan
Write-Host "[INFO] Fim: ${EndTime}s" -ForegroundColor Cyan
Write-Host "[INFO] Ficheiro: $OutputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Baixando e cortando trecho..." -ForegroundColor Yellow

# Executar script Python
python download-music-snippet.py "`"$Url`"" $StartTime $EndTime "`"$OutputFile`""

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERRO] Falha ao processar." -ForegroundColor Red
    exit 1
}

