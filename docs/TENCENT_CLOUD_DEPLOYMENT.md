# 腾讯云 Ubuntu 22.04 部署指南

## 📋 概述

本指南详细说明如何将产业集群发展潜力评估系统部署到腾讯云Ubuntu 22.04服务器上，包括完整的生产环境配置。

## 🛠️ 服务器要求

### 推荐配置
- **CPU**: 2核心或以上
- **内存**: 4GB或以上
- **存储**: 40GB SSD或以上
- **网络**: 带宽3Mbps或以上
- **操作系统**: Ubuntu 22.04 LTS

### 必需端口
- **80**: HTTP访问
- **443**: HTTPS访问
- **22**: SSH访问
- **8000**: API服务（内网）
- **5432**: PostgreSQL（内网）
- **6379**: Redis（内网）

## 🚀 快速部署

### 一键部署脚本

```bash
# 下载并运行一键部署脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/tencent-deploy.sh | sudo bash
```

### 手动部署步骤

如果需要更多控制或自定义配置，请继续阅读详细步骤。

## 📝 详细部署步骤

### 1. 服务器初始化

#### 连接服务器

```bash
# 使用SSH连接到服务器
ssh root@your-server-ip

# 或使用密钥文件
ssh -i your-key.pem ubuntu@your-server-ip
```

#### 更新系统

```bash
# 更新包列表
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim htop unzip software-properties-common
```

#### 创建部署用户

```bash
# 创建应用用户
sudo useradd -m -s /bin/bash appuser

# 添加到sudo组
sudo usermod -aG sudo appuser

# 切换到应用用户
sudo su - appuser
```

### 2. 安装必需软件

#### 安装 Docker

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用户到docker组
sudo usermod -aG docker $USER

# 重新登录以应用组更改
exit
sudo su - appuser

# 验证Docker安装
docker --version
```

#### 安装 Docker Compose

```bash
# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

#### 安装 Nginx

```bash
# 安装Nginx
sudo apt install -y nginx

# 启动并启用Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

### 3. 准备应用代码

#### 克隆项目

```bash
# 进入应用目录
cd /home/appuser

# 克隆项目（替换为您的仓库地址）
git clone https://github.com/your-username/industrial-cluster-assessment-system.git

# 进入项目目录
cd industrial-cluster-assessment-system
```

#### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

生产环境变量配置：

```env
# 生产环境标识
NODE_ENV=production
ENVIRONMENT=production

# 前端配置
VITE_API_BASE_URL=https://your-domain.com
VITE_APP_TITLE=产业集群发展潜力评估系统

# OpenAI配置
VITE_OPENAI_API_KEY=your_production_openai_key
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Claude配置
VITE_CLAUDE_API_KEY=your_production_claude_key

# Dify配置
VITE_DIFY_API_KEY=your_production_dify_key
VITE_DIFY_BASE_URL=https://api.dify.ai/v1
VITE_DIFY_AGENT_ID=your_production_agent_id
VITE_DEFAULT_AI_PROVIDER=dify

# 数据库配置
DATABASE_URL=postgresql://postgres:secure_password@localhost:5432/industrial_cluster
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-very-secure-secret-key-for-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# 文件上传配置
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,docx,xlsx,csv,txt

# 安全配置
SECURE_SSL_REDIRECT=true
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https

# 日志配置
LOG_LEVEL=info
```

### 4. 配置数据库

#### PostgreSQL 配置

```bash
# 创建数据目录
sudo mkdir -p /var/lib/postgresql/data
sudo chown -R 999:999 /var/lib/postgresql/data

# 创建数据库初始化脚本
mkdir -p ./postgres-init
```

#### Redis 配置

```bash
# 创建Redis数据目录
sudo mkdir -p /var/lib/redis/data
sudo chown -R 999:999 /var/lib/redis/data
```

### 5. 配置 Nginx 反向代理

创建Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/industrial-cluster
```

```nginx
# /etc/nginx/sites-available/industrial-cluster

upstream frontend {
    server 127.0.0.1:3000;
}

upstream api {
    server 127.0.0.1:8000;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # 客户端上传大小限制
    client_max_body_size 10M;

    # API代理
    location /api/ {
        proxy_pass http://api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 前端应用
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 对于React Router
        try_files $uri $uri/ @fallback;
    }

    location @fallback {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

启用站点配置：

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/industrial-cluster /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 6. SSL证书配置

#### 使用Let's Encrypt（推荐）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 或使用腾讯云SSL证书

```bash
# 创建SSL目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件（替换为您的证书）
sudo scp your-domain.com.crt root@your-server:/etc/nginx/ssl/
sudo scp your-domain.com.key root@your-server:/etc/nginx/ssl/

# 设置权限
sudo chmod 600 /etc/nginx/ssl/your-domain.com.key
sudo chmod 644 /etc/nginx/ssl/your-domain.com.crt
```

### 7. 应用部署

#### 构建和启动应用

```bash
# 确保在项目目录
cd /home/appuser/industrial-cluster-assessment-system

# 构建Docker镜像
docker-compose -f docker-compose.prod.yml build

# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

#### 创建生产环境Docker Compose文件

```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres_prod
    environment:
      POSTGRES_DB: industrial_cluster
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - /var/lib/postgresql/data:/var/lib/postgresql/data
      - ./backend/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: redis_prod
    command: redis-server --appendonly yes
    volumes:
      - /var/lib/redis/data:/data
    ports:
      - "127.0.0.1:6379:6379"
    restart: unless-stopped
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: backend_prod
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/industrial_cluster
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "127.0.0.1:8000:8000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: frontend_prod
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 8. 系统服务配置

#### 创建Systemd服务

```bash
sudo nano /etc/systemd/system/industrial-cluster.service
```

```ini
[Unit]
Description=Industrial Cluster Assessment System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/appuser/industrial-cluster-assessment-system
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=appuser
Group=appuser

[Install]
WantedBy=multi-user.target
```

```bash
# 重新加载systemd
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable industrial-cluster.service

# 启动服务
sudo systemctl start industrial-cluster.service

# 检查状态
sudo systemctl status industrial-cluster.service
```

### 9. 监控和日志

#### 设置日志轮转

```bash
sudo nano /etc/logrotate.d/industrial-cluster
```

```
/home/appuser/industrial-cluster-assessment-system/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su appuser appuser
}
```

#### 监控脚本

```bash
nano /home/appuser/monitor.sh
```

```bash
#!/bin/bash

# 监控脚本
LOG_FILE="/home/appuser/industrial-cluster-assessment-system/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 检查Docker容器状态
echo "[$DATE] Checking Docker containers..." >> $LOG_FILE
docker-compose -f /home/appuser/industrial-cluster-assessment-system/docker-compose.prod.yml ps >> $LOG_FILE

# 检查磁盘空间
echo "[$DATE] Disk usage:" >> $LOG_FILE
df -h >> $LOG_FILE

# 检查内存使用
echo "[$DATE] Memory usage:" >> $LOG_FILE
free -h >> $LOG_FILE

# 检查应用健康状态
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "[$DATE] Application is healthy" >> $LOG_FILE
else
    echo "[$DATE] Application health check failed" >> $LOG_FILE
    # 发送告警（可配置邮件或短信）
fi
```

```bash
# 添加执行权限
chmod +x /home/appuser/monitor.sh

# 添加到crontab
crontab -e
# 添加：*/5 * * * * /home/appuser/monitor.sh
```

## 🔐 安全配置

### 防火墙设置

```bash
# 启用UFW防火墙
sudo ufw enable

# 允许SSH
sudo ufw allow ssh

# 允许HTTP和HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 检查状态
sudo ufw status
```

### 安全加固

```bash
# 禁用root SSH登录
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 修改SSH端口（可选）
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# 重启SSH服务
sudo systemctl restart ssh

# 设置fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🚀 部署自动化脚本

创建完整的自动化部署脚本：

```bash
nano /home/appuser/deploy.sh
```

```bash
#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

log "🚀 开始部署产业集群评估系统..."

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    error "请勿使用root用户运行此脚本"
    exit 1
fi

# 进入项目目录
cd /home/appuser/industrial-cluster-assessment-system

# 拉取最新代码
log "📥 拉取最新代码..."
git pull origin main

# 停止现有服务
log "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down

# 备份数据库
log "💾 备份数据库..."
docker exec postgres_prod pg_dump -U postgres industrial_cluster > backup_$(date +%Y%m%d_%H%M%S).sql

# 构建新镜像
log "🔨 构建应用镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 启动服务
log "▶️  启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
log "⏳ 等待服务启动..."
sleep 30

# 健康检查
log "🔍 执行健康检查..."
for i in {1..5}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "应用部署成功！"
        break
    fi
    if [ $i -eq 5 ]; then
        error "健康检查失败，请检查日志"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
    sleep 10
done

# 清理旧镜像
log "🧹 清理旧镜像..."
docker image prune -f

success "🎉 部署完成！"
log "📱 应用地址: https://your-domain.com"
log "📊 监控日志: docker-compose -f docker-compose.prod.yml logs -f"
```

```bash
chmod +x /home/appuser/deploy.sh
```

## 📊 监控和维护

### 日常维护命令

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 更新应用
./deploy.sh

# 备份数据
docker exec postgres_prod pg_dump -U postgres industrial_cluster > backup.sql

# 查看资源使用
docker stats

# 清理系统
docker system prune -f
```

### 性能优化

```bash
# 调整系统参数
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
echo 'fs.file-max=65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 调整Docker配置
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5
}
```

## 🆘 故障排除

### 常见问题

1. **应用无法启动**
```bash
# 检查Docker日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000
```

2. **数据库连接问题**
```bash
# 检查数据库容器
docker exec -it postgres_prod psql -U postgres -d industrial_cluster

# 检查网络连接
docker network ls
docker network inspect industrial-cluster-assessment-system_app-network
```

3. **SSL证书问题**
```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew

# 测试SSL配置
openssl s_client -connect your-domain.com:443
```

### 紧急恢复

```bash
# 回滚到上一个版本
git log --oneline -10
git checkout <previous-commit>
./deploy.sh

# 恢复数据库备份
docker exec -i postgres_prod psql -U postgres -d industrial_cluster < backup.sql
```

## 📞 技术支持

如遇到部署问题，请提供以下信息：
- 服务器配置和Ubuntu版本
- 错误日志
- Docker和应用版本
- 网络配置详情

联系方式：[您的联系方式]