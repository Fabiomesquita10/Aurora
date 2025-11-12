# Guia de Deploy - Raspberry Pi com DietPi

## 📋 Pré-requisitos

- Raspberry Pi com DietPi instalado
- Acesso SSH ao Raspberry Pi
- Domínio ou serviço DNS (opcional, para acesso público)
- Conhecimento básico de Linux

## 🚀 Passo a Passo

### 1. Preparar o Build no Windows

```bash
# No Windows, na pasta do projeto
npm run build
```

Isto vai criar a pasta `dist/` com os ficheiros estáticos prontos para deploy.

### 2. Transferir Ficheiros para o Raspberry Pi

#### Opção A: SCP (Secure Copy)

```powershell
# No Windows PowerShell
scp -r dist/* pi@seu-raspberry-ip:/var/www/aurora/
```

#### Opção B: Git (Recomendado)

```bash
# No Raspberry Pi
cd /opt
git clone https://seu-repositorio.git aurora
cd aurora
npm install
npm run build
```

#### Opção C: USB/Network Share

1. Copiar pasta `dist/` para USB
2. Conectar USB ao Raspberry Pi
3. Copiar ficheiros para `/var/www/aurora/`

### 3. Instalar Nginx no DietPi

```bash
# SSH no Raspberry Pi
sudo dietpi-software

# Selecionar:
# - Nginx (web server)
# - Node.js (se precisar de build no Pi)
```

Ou instalar manualmente:

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Configurar Nginx

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/aurora
```

Adicionar:

```nginx
server {
    listen 80;
    server_name seu-dominio.com ou IP-do-raspberry;
    
    root /var/www/aurora;
    index index.html;
    
    # Servir ficheiros estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/aurora /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

### 5. Configurar Permissões

```bash
# Criar diretório se não existir
sudo mkdir -p /var/www/aurora

# Dar permissões
sudo chown -R www-data:www-data /var/www/aurora
sudo chmod -R 755 /var/www/aurora
```

### 6. Configurar Firewall (Opcional)

```bash
# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (se usar SSL)
sudo ufw allow 443/tcp
```

### 7. Configurar SSL com Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

### 8. Acessar o Site

- **Localmente**: `http://IP-do-raspberry`
- **Público**: `http://seu-dominio.com` ou `https://seu-dominio.com` (com SSL)

## 🌐 Configurar DNS para Acesso Público

### Opção 1: Serviços DNS Gratuitos

#### DuckDNS (Recomendado - Grátis)
1. Criar conta em https://www.duckdns.org
2. Criar domínio (ex: `aurora.duckdns.org`)
3. Instalar cliente no Raspberry Pi:

```bash
# Instalar DuckDNS
sudo apt install curl -y

# Criar script de atualização
sudo nano /usr/local/bin/duckdns-update.sh
```

Adicionar:

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=seu-dominio&token=seu-token&ip=" | curl -k -o /var/log/duckdns.log -K -
```

```bash
# Dar permissões
sudo chmod +x /usr/local/bin/duckdns-update.sh

# Adicionar ao crontab (atualizar a cada 5 minutos)
sudo crontab -e
```

Adicionar:
```
*/5 * * * * /usr/local/bin/duckdns-update.sh >/dev/null 2>&1
```

#### No-IP (Alternativa)
1. Criar conta em https://www.noip.com
2. Criar hostname (ex: `aurora.ddns.net`)
3. Instalar cliente:

```bash
cd /usr/local/src
sudo wget https://www.noip.com/client/linux/noip-duc-linux.tar.gz
sudo tar xzf noip-duc-linux.tar.gz
cd noip-2.1.9-1
sudo make install
sudo /usr/local/bin/noip2 -C
```

### Opção 2: Domínio Próprio

1. **Comprar domínio** (ex: Namecheap, GoDaddy, etc.)
2. **Configurar DNS**:
   - Tipo: A Record
   - Nome: `@` ou `www`
   - Valor: IP público do Raspberry Pi
   - TTL: 3600

3. **Obter IP público**:
```bash
curl ifconfig.me
```

4. **Configurar no router**:
   - Port forwarding: Porta 80 → IP interno do Raspberry Pi
   - Port forwarding: Porta 443 → IP interno do Raspberry Pi (se usar SSL)

### Opção 3: Cloudflare Tunnel (Recomendado - Grátis e Seguro)

1. Criar conta em https://www.cloudflare.com
2. Instalar cloudflared:

```bash
# No Raspberry Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

3. Autenticar:

```bash
cloudflared tunnel login
```

4. Criar tunnel:

```bash
cloudflared tunnel create aurora
cloudflared tunnel route dns aurora seu-dominio.com
```

5. Configurar:

```bash
sudo nano ~/.cloudflared/config.yml
```

Adicionar:

```yaml
tunnel: aurora
credentials-file: /home/pi/.cloudflared/tunnel-id.json

ingress:
  - hostname: seu-dominio.com
    service: http://localhost:80
  - service: http_status:404
```

6. Criar serviço systemd:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Adicionar:

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/pi/.cloudflared/config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 🔧 Configurações Adicionais

### Atualizar Automaticamente

Criar script de atualização:

```bash
sudo nano /usr/local/bin/aurora-update.sh
```

Adicionar:

```bash
#!/bin/bash
cd /opt/aurora
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/aurora/
sudo systemctl reload nginx
```

```bash
sudo chmod +x /usr/local/bin/aurora-update.sh
```

### Monitorização

```bash
# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver status do Nginx
sudo systemctl status nginx

# Ver uso de recursos
htop
```

## 🐛 Troubleshooting

### Erro 502 Bad Gateway
```bash
# Verificar se Nginx está a correr
sudo systemctl status nginx

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### Erro 403 Forbidden
```bash
# Verificar permissões
sudo chown -R www-data:www-data /var/www/aurora
sudo chmod -R 755 /var/www/aurora
```

### Site não carrega
```bash
# Verificar firewall
sudo ufw status

# Verificar portas
sudo netstat -tlnp | grep :80
```

### DNS não resolve
```bash
# Testar DNS
nslookup seu-dominio.com

# Verificar configuração DNS
cat /etc/resolv.conf
```

## 📝 Notas Importantes

1. **Backups**: Fazer backup regular dos ficheiros JSON em `src/config/`
2. **Segurança**: Usar HTTPS com Let's Encrypt
3. **Performance**: Nginx é mais eficiente que Apache para ficheiros estáticos
4. **Atualizações**: Atualizar regularmente o sistema e dependências
5. **Firewall**: Configurar firewall para proteger o Raspberry Pi

## 🔒 Segurança Adicional

### Fail2Ban (Proteção contra ataques)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Atualizações Automáticas

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📚 Recursos Úteis

- [DietPi Documentation](https://dietpi.com/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [DuckDNS](https://www.duckdns.org/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

