# Guia de Configuração DNS - Acesso Público

## 🌐 Opções de DNS para Acesso Público

### 1. DuckDNS (Recomendado - Grátis e Fácil) ⭐

**Vantagens**:
- ✅ Grátis
- ✅ Fácil de configurar
- ✅ Sem necessidade de domínio próprio
- ✅ Suporta múltiplos subdomínios

**Desvantagens**:
- ❌ Domínio longo (ex: `aurora.duckdns.org`)
- ❌ Precisa de atualização periódica do IP

**Passos**:

1. **Criar conta**: https://www.duckdns.org
2. **Criar subdomínio**: Escolher nome (ex: `aurora`)
3. **Dominio completo**: `aurora.duckdns.org`
4. **Instalar no Raspberry Pi**:

```bash
# Criar diretório
mkdir -p ~/duckdns
cd ~/duckdns

# Criar script de atualização
nano duck.sh
```

Adicionar:

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=aurora&token=SEU-TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

```bash
# Dar permissões
chmod +x duck.sh

# Testar
./duck.sh

# Adicionar ao crontab (atualizar a cada 5 minutos)
crontab -e
```

Adicionar:
```
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

5. **Configurar Nginx**:

```nginx
server {
    listen 80;
    server_name aurora.duckdns.org;
    
    root /var/www/aurora;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 2. No-IP (Alternativa Grátis)

**Vantagens**:
- ✅ Grátis (com renovação mensal)
- ✅ Domínios personalizados
- ✅ Fácil de configurar

**Desvantagens**:
- ❌ Precisa renovar mensalmente (gratuito)
- ❌ Domínio limitado (ex: `aurora.ddns.net`)

**Passos**:

1. **Criar conta**: https://www.noip.com
2. **Criar hostname**: Escolher nome e domínio
3. **Instalar cliente**:

```bash
cd /usr/local/src
wget https://www.noip.com/client/linux/noip-duc-linux.tar.gz
tar xzf noip-duc-linux.tar.gz
cd noip-2.1.9-1
make install
/usr/local/bin/noip2 -C
```

4. **Configurar serviço**:

```bash
sudo systemctl enable noip2
sudo systemctl start noip2
```

### 3. Cloudflare Tunnel (Recomendado - Mais Seguro) 🔒

**Vantagens**:
- ✅ Grátis
- ✅ Sem necessidade de abrir portas no router
- ✅ SSL automático
- ✅ Proteção DDoS incluída
- ✅ Domínio próprio suportado

**Desvantagens**:
- ❌ Configuração mais complexa
- ❌ Requer conta Cloudflare

**Passos**:

1. **Criar conta**: https://www.cloudflare.com
2. **Adicionar domínio** (ou usar subdomínio grátis)
3. **Instalar cloudflared**:

```bash
# No Raspberry Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

4. **Autenticar**:

```bash
cloudflared tunnel login
```

5. **Criar tunnel**:

```bash
cloudflared tunnel create aurora
```

6. **Configurar DNS**:

```bash
cloudflared tunnel route dns aurora aurora.seudominio.com
```

7. **Configurar tunnel**:

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Adicionar:

```yaml
tunnel: aurora
credentials-file: /home/pi/.cloudflared/tunnel-id.json

ingress:
  - hostname: aurora.seudominio.com
    service: http://localhost:80
  - service: http_status:404
```

8. **Criar serviço systemd**:

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
sudo systemctl status cloudflared
```

### 4. Domínio Próprio (Mais Profissional)

**Vantagens**:
- ✅ Domínio personalizado (ex: `aurora.com`)
- ✅ Mais profissional
- ✅ Controle total

**Desvantagens**:
- ❌ Requer compra de domínio (~10-15€/ano)
- ❌ Configuração mais complexa
- ❌ Precisa abrir portas no router

**Passos**:

1. **Comprar domínio**:
   - Namecheap: https://www.namecheap.com
   - GoDaddy: https://www.godaddy.com
   - Google Domains: https://domains.google

2. **Obter IP público do Raspberry Pi**:

```bash
# No Raspberry Pi
curl ifconfig.me
```

3. **Configurar DNS no registrador**:

   - Tipo: **A Record**
   - Nome: `@` (ou `www` para subdomínio)
   - Valor: **IP público do Raspberry Pi**
   - TTL: `3600` (1 hora)

4. **Configurar Port Forwarding no Router**:

   - Porta **80** (HTTP) → IP interno do Raspberry Pi
   - Porta **443** (HTTPS) → IP interno do Raspberry Pi

5. **Configurar Nginx**:

```nginx
server {
    listen 80;
    server_name aurora.com www.aurora.com;
    
    root /var/www/aurora;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

6. **Configurar SSL com Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d aurora.com -d www.aurora.com
```

## 🔍 Verificar Configuração DNS

### Testar DNS

```bash
# Verificar se DNS resolve
nslookup aurora.duckdns.org
# ou
dig aurora.duckdns.org

# Verificar IP público
curl ifconfig.me
```

### Testar Conectividade

```bash
# Testar se site está acessível
curl -I http://aurora.duckdns.org

# Testar desde outro computador
ping aurora.duckdns.org
```

## 🔒 Configurar SSL/HTTPS

### Com Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d aurora.duckdns.org

# Renovação automática
sudo certbot renew --dry-run
```

### Com Cloudflare (Automático)

Cloudflare Tunnel fornece SSL automaticamente - não é necessário configurar Let's Encrypt.

## 📊 Comparação de Opções

| Opção | Custo | Dificuldade | Segurança | Domínio |
|-------|-------|-------------|-----------|---------|
| DuckDNS | Grátis | Fácil | Média | `*.duckdns.org` |
| No-IP | Grátis* | Fácil | Média | `*.ddns.net` |
| Cloudflare Tunnel | Grátis | Média | Alta | Qualquer |
| Domínio Próprio | ~10€/ano | Média | Alta | Personalizado |

*Renovação mensal necessária (gratuito)

## 🎯 Recomendação

**Para uso pessoal/romântico**:
- ✅ **DuckDNS** - Mais fácil e grátis
- ✅ **Cloudflare Tunnel** - Mais seguro, sem abrir portas

**Para uso profissional**:
- ✅ **Domínio Próprio + Cloudflare** - Mais profissional e seguro

## 🔧 Troubleshooting

### DNS não resolve

```bash
# Verificar configuração DNS
cat /etc/resolv.conf

# Limpar cache DNS
sudo systemd-resolve --flush-caches

# Testar com servidor DNS diferente
nslookup aurora.duckdns.org 8.8.8.8
```

### IP não atualiza (DuckDNS/No-IP)

```bash
# Verificar script de atualização
cat ~/duckdns/duck.sh

# Testar manualmente
~/duckdns/duck.sh

# Verificar logs
cat ~/duckdns/duck.log

# Verificar crontab
crontab -l
```

### Porta 80 bloqueada

```bash
# Verificar firewall
sudo ufw status

# Permitir porta 80
sudo ufw allow 80/tcp

# Verificar se Nginx está a escutar
sudo netstat -tlnp | grep :80
```

### Router não faz port forwarding

1. Aceder ao router (geralmente `192.168.1.1`)
2. Procurar "Port Forwarding" ou "Virtual Server"
3. Adicionar regra:
   - Porta externa: 80
   - Porta interna: 80
   - IP interno: IP do Raspberry Pi
   - Protocolo: TCP

## 📚 Recursos Úteis

- [DuckDNS](https://www.duckdns.org/)
- [No-IP](https://www.noip.com/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Namecheap](https://www.namecheap.com/)

