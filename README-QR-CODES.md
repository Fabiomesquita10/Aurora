# 🕯️ Guia para Gerar QR Codes da Caça ao Tesouro

## Método 1: Usar o Gerador HTML (Mais Simples)

1. Abre o ficheiro `generate-qr-codes.html` no teu browser
2. Clica em "Gerar QR Code" para cada um dos 3 QR codes
3. Faz download de cada imagem
4. Imprime ou guarda digitalmente

## Método 2: Usar QRCode Monkey (Mais Personalizado)

Para QR codes mais bonitos com logo e design personalizado:

### Passo 1: Aceder ao QRCode Monkey
Vai a: https://www.qrcode-monkey.com

### Passo 2: Gerar cada QR Code

Para cada um dos 3 QR codes:

1. **No campo de texto**, cola apenas o código (sem espaços):
   - QR Code 1: `AURORA_QR_1`
   - QR Code 2: `AURORA_QR_2`
   - QR Code 3: `AURORA_QR_3`

2. **Personalizar o design** (opcional):
   - Cores: Podes escolher cores personalizadas
   - Logo: Podes adicionar um logo no centro
   - Estilo: Podes escolher diferentes estilos de QR code

3. **Fazer download** da imagem em alta resolução

### Passo 3: Colocar os QR Codes

Coloca os QR codes nos locais indicados pelas mensagens:

- **QR Code 1** → Porta-luvas do carro
- **QR Code 2** → Dentro do casaco castanho novo (guarda-vestidos)
- **QR Code 3** → Dentro da mala dela

## Método 3: Usar a API do QRCode Monkey (Avançado)

Se quiseres gerar os QR codes programaticamente com design personalizado:

1. Regista-te na RapidAPI: https://rapidapi.com
2. Subscreve à API do QRCode Monkey: https://rapidapi.com/qrcode-monkey/api/qrcode-monkey
3. Usa a chave da API para fazer chamadas

Exemplo de configuração JSON para a API:
```json
{
  "data": "AURORA_QR_1",
  "size": 500,
  "config": {
    "body": "rounded-pointed",
    "eye": "frame14",
    "eyeBall": "ball16",
    "bodyColor": "#e74c3c",
    "bgColor": "#FFFFFF",
    "eye1Color": "#c0392b",
    "eye2Color": "#c0392b",
    "eye3Color": "#c0392b",
    "eyeBall1Color": "#e74c3c",
    "eyeBall2Color": "#e74c3c",
    "eyeBall3Color": "#e74c3c",
    "gradientColor1": "#e74c3c",
    "gradientColor2": "#c0392b",
    "gradientType": "radial"
  },
  "file": "png"
}
```

## ⚠️ Importante

- Os códigos devem ser **exatamente** estes: `AURORA_QR_1`, `AURORA_QR_2`, `AURORA_QR_3`
- Não adiciones espaços ou caracteres extras
- Testa cada QR code antes de esconder (usa a câmera do telemóvel para verificar)

## 📱 Testar os QR Codes

Para testar se os QR codes funcionam:
1. Abre a câmera do telemóvel
2. Aponta para o QR code
3. Deve aparecer o texto (ex: `AURORA_QR_1`)
4. Se aparecer, está correto!

## 🎮 Como Funciona no Jogo

Quando a Filipa escanear cada QR code no jogo:
1. O jogo detecta o código escaneado
2. Mostra a mensagem correspondente no ecrã
3. Regista o tempo total que demorou a encontrar os 3 QR codes
4. Guarda tudo no `game-attempts.json`

