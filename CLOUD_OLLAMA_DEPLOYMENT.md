# Cloud Ollama Deployment Guide (DigitalOcean)

## Overview
This guide walks through deploying Ollama on a DigitalOcean droplet and connecting it to your Vercel frontend.

## Cost Estimate
- **Droplet**: $24/month (4GB RAM, 2 vCPUs, 80GB SSD)
- **Optional GPU Droplet**: $72+/month (for faster inference)
- **Domain**: ~$12/year (optional, for custom domain)

## Prerequisites
- DigitalOcean account
- SSH client
- Domain name (optional but recommended)

---

## Step 1: Create DigitalOcean Droplet

### 1.1 Create Droplet
```bash
# Visit: https://cloud.digitalocean.com/droplets/new

# Recommended Settings:
- Image: Ubuntu 22.04 LTS
- Plan: Basic - $24/mo (4GB RAM, 2 vCPUs)
- Datacenter: Choose closest to your users
- Authentication: SSH Key (more secure) or Password
- Hostname: ollama-server
```

### 1.2 Add SSH Key (Recommended)
```bash
# On your local machine:
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub

# Copy the output and add it to DigitalOcean during droplet creation
```

### 1.3 Get Droplet IP
After creation, note your droplet's public IP address (e.g., `123.45.67.89`)

---

## Step 2: Connect to Droplet

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system packages
apt update && apt upgrade -y
```

---

## Step 3: Install Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version

# Start Ollama service
systemctl start ollama
systemctl enable ollama
```

---

## Step 4: Configure Ollama for Remote Access

### 4.1 Edit Ollama Service Configuration
```bash
# Create override directory
mkdir -p /etc/systemd/system/ollama.service.d

# Create override config
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
EOF

# Reload systemd and restart Ollama
systemctl daemon-reload
systemctl restart ollama
```

### 4.2 Verify Ollama is Listening
```bash
# Check if Ollama is listening on all interfaces
netstat -tuln | grep 11434

# Should show: 0.0.0.0:11434
```

---

## Step 5: Install and Configure Nginx (Reverse Proxy)

### 5.1 Install Nginx
```bash
apt install nginx -y
```

### 5.2 Configure Nginx for Ollama
```bash
# Create Nginx config
cat > /etc/nginx/sites-available/ollama << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/ollama /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## Step 6: Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
apt install ufw -y

# Allow SSH (IMPORTANT: Do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## Step 7: Install SSL Certificate (HTTPS) - Recommended

### 7.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 7.2 Get SSL Certificate
```bash
# Replace with your actual domain
certbot --nginx -d your-ollama-domain.com

# Follow the prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)
```

### 7.3 Auto-Renewal
```bash
# Test auto-renewal
certbot renew --dry-run

# Certbot will automatically renew certificates
```

---

## Step 8: Pull Ollama Models

```bash
# Pull the models you want to use
ollama pull llama3.2:3b
ollama pull mistral:7b
ollama pull codellama:7b

# List available models
ollama list
```

---

## Step 9: Test Remote Access

### 9.1 Test from Your Local Machine
```bash
# Test basic connectivity (replace with your domain or IP)
curl http://YOUR_DROPLET_IP

# Test Ollama API
curl http://YOUR_DROPLET_IP/api/tags

# Should return JSON with available models
```

### 9.2 Test with HTTPS (if configured)
```bash
curl https://your-ollama-domain.com/api/tags
```

---

## Step 10: Update Vercel Environment Variables

### 10.1 Add Environment Variable in Vercel
```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables

# Add:
Name: VITE_OLLAMA_URL
Value: https://your-ollama-domain.com (or http://YOUR_DROPLET_IP)
Environment: Production, Preview, Development
```

### 10.2 Redeploy Vercel App
```bash
# Trigger a new deployment to use the new environment variable
# Option 1: Push a commit to GitHub
# Option 2: Use Vercel dashboard to redeploy
```

---

## Step 11: Update Application Code (Optional)

If you want to make the Ollama URL configurable in settings:

```typescript
// src/lib/storage.ts - Add to AppSettings interface
export interface AppSettings {
  // ... existing settings
  ollamaUrl: string; // Add this
}

export const DEFAULT_SETTINGS: AppSettings = {
  // ... existing defaults
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
};
```

---

## Monitoring and Maintenance

### Check Ollama Logs
```bash
# View Ollama service logs
journalctl -u ollama -f

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitor Resource Usage
```bash
# Install htop for better monitoring
apt install htop -y
htop

# Check disk space
df -h

# Check memory usage
free -h
```

### Update Ollama
```bash
# Pull latest Ollama version
curl -fsSL https://ollama.com/install.sh | sh

# Restart service
systemctl restart ollama
```

---

## Security Best Practices

### 1. Regular Updates
```bash
# Set up automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure --priority=low unattended-upgrades
```

### 2. Change SSH Port (Optional)
```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Change: Port 22 → Port 2222
# Restart SSH: systemctl restart sshd
# Update firewall: ufw allow 2222/tcp
```

### 3. Disable Root Login
```bash
# Create a new user
adduser yourusername
usermod -aG sudo yourusername

# Disable root login in /etc/ssh/sshd_config
# PermitRootLogin no
```

### 4. Rate Limiting (Nginx)
```nginx
# Add to Nginx config to prevent abuse
limit_req_zone $binary_remote_addr zone=ollama_limit:10m rate=10r/s;

server {
    location / {
        limit_req zone=ollama_limit burst=20;
        # ... rest of config
    }
}
```

---

## Troubleshooting

### Ollama Not Responding
```bash
# Check service status
systemctl status ollama

# Restart service
systemctl restart ollama

# Check if port is listening
netstat -tuln | grep 11434
```

### CORS Errors
- Ensure Nginx CORS headers are set correctly
- Check `OLLAMA_ORIGINS=*` in service config
- Restart both Nginx and Ollama

### SSL Certificate Issues
```bash
# Renew certificate manually
certbot renew

# Check certificate expiry
certbot certificates
```

### High Memory Usage
```bash
# Ollama models are loaded into RAM
# Check loaded models: ollama ps

# Unload a model: ollama rm modelname
# Or restart Ollama: systemctl restart ollama
```

---

## Cost Optimization

### 1. Use Smaller Models
- `llama3.2:3b` instead of `llama3.2:7b`
- Smaller models use less RAM

### 2. Downgrade Droplet
- Start with 4GB RAM droplet
- Upgrade only if needed

### 3. Snapshot and Destroy
- Create snapshot of configured droplet
- Destroy droplet when not in use
- Restore from snapshot when needed
- Pay only for snapshot storage (~$0.05/GB/month)

---

## Quick Reference Commands

```bash
# SSH into server
ssh root@YOUR_DROPLET_IP

# Check Ollama status
systemctl status ollama

# View logs
journalctl -u ollama -f

# Pull new model
ollama pull modelname

# List models
ollama list

# Test API
curl http://localhost:11434/api/tags

# Restart services
systemctl restart ollama
systemctl restart nginx
```

---

## Next Steps

1. **Set up monitoring**: Install tools like Grafana/Prometheus
2. **Configure backups**: Use DigitalOcean snapshots or backups
3. **Add analytics**: Track API usage and costs
4. **Scale horizontally**: Add more droplets behind a load balancer if needed

---

## Support

- **DigitalOcean Docs**: https://docs.digitalocean.com
- **Ollama Docs**: https://github.com/ollama/ollama/blob/main/docs/faq.md
- **Nginx Docs**: https://nginx.org/en/docs/

---

**Deployment Date**: {{ date }}
**Server IP**: {{ YOUR_DROPLET_IP }}
**Domain**: {{ your-domain.com }}
