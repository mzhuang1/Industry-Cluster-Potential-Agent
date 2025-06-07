#!/bin/bash

# 腾讯云Ubuntu 22.04一键部署脚本
# 产业集群发展潜力评估系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
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

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# 检查用户权限
check_user() {
    if [ "$EUID" -eq 0 ]; then
        error "请勿使用root用户运行此脚本"
        error "建议创建普通用户并添加sudo权限"
        exit 1
    fi
    
    if ! sudo -n true 2>/dev/null; then
        error "当前用户没有sudo权限"
        exit 1
    fi
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "     产业集群发展潜力评估系统"
    echo "     腾讯云 Ubuntu 22.04 一键部署脚本"
    echo "=================================================="
    echo -e "${NC}"
    echo
    log "开始系统部署流程..."
    echo
}

# 收集配置信息
collect_config() {
    log "收集部署配置信息..."
    echo
    
    # 域名配置
    read -p "请输入您的域名 (例如: example.com): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        error "域名不能为空"
        exit 1
    fi
    
    # SSL证书选择
    echo
    echo "SSL证书配置选项:"
    echo "1. 使用 Let's Encrypt 自动申请 (推荐)"
    echo "2. 使用已有证书文件"
    echo "3. 暂不配置SSL (仅HTTP)"
    read -p "请选择 (1-3): " SSL_CHOICE
    
    case $SSL_CHOICE in
        1)
            SSL_TYPE="letsencrypt"
            read -p "请输入邮箱 (用于Let's Encrypt): " EMAIL
            ;;
        2)
            SSL_TYPE="custom"
            read -p "请输入证书文件路径 (.crt): " CERT_PATH
            read -p "请输入私钥文件路径 (.key): " KEY_PATH
            ;;
        3)
            SSL_TYPE="none"
            warning "将使用HTTP部署，不推荐在生产环境使用"
            ;;
        *)
            error "无效选择"
            exit 1
            ;;
    esac
    
    # 数据库密码
    echo
    read -s -p "请设置PostgreSQL数据库密码: " DB_PASSWORD
    echo
    read -s -p "请确认数据库密码: " DB_PASSWORD_CONFIRM
    echo
    
    if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
        error "密码不匹配"
        exit 1
    fi
    
    # JWT密钥
    JWT_SECRET=$(openssl rand -base64 32)
    
    # API密钥配置
    echo
    warning "API密钥配置 (可稍后在.env文件中修改):"
    read -p "OpenAI API Key (可选): " OPENAI_API_KEY
    read -p "Claude API Key (可选): " CLAUDE_API_KEY
    read -p "Dify API Key (可选): " DIFY_API_KEY
    read -p "Dify Agent ID (可选): " DIFY_AGENT_ID
    
    # 确认配置
    echo
    echo "=== 部署配置确认 ==="
    echo "域名: $DOMAIN"
    echo "SSL类型: $SSL_TYPE"
    echo "数据库密码: [已设置]"
    echo "JWT密钥: [自动生成]"
    echo
    read -p "确认开始部署? (y/N): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 0
    fi
}

# 系统更新
update_system() {
    log "更新系统包..."
    sudo apt update && sudo apt upgrade -y
    
    log "安装基础工具..."
    sudo apt install -y curl wget git vim htop unzip software-properties-common \
        apt-transport-https ca-certificates gnupg lsb-release jq
    
    success "系统更新完成"
}

# 安装Docker
install_docker() {
    log "安装Docker..."
    
    # 检查Docker是否已安装
    if command -v docker &> /dev/null; then
        success "Docker已安装，跳过安装步骤"
        return
    fi
    
    # 安装Docker官方GPG密钥
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # 添加Docker仓库
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # 安装Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 添加用户到docker组
    sudo usermod -aG docker $USER
    
    success "Docker安装完成"
}

# 安装Docker Compose
install_docker_compose() {
    log "安装Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose已安装，跳过安装步骤"
        return
    fi
    
    # 下载Docker Compose
    DOCKER_COMPOSE_VERSION="v2.21.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # 添加执行权限
    sudo chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    success "Docker Compose安装完成"
}

# 安装Nginx
install_nginx() {
    log "安装Nginx..."
    
    if command -v nginx &> /dev/null; then
        success "Nginx已安装，跳过安装步骤"
        return
    fi
    
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    success "Nginx安装完成"
}

# 配置防火墙
configure_firewall() {
    log "配置防火墙..."
    
    # 启用UFW防火墙
    sudo ufw --force enable
    
    # 允许SSH
    sudo ufw allow ssh
    
    # 允许HTTP和HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # 显示防火墙状态
    sudo ufw status
    
    success "防火墙配置完成"
}

# 创建应用目录
setup_app_directory() {
    log "设置应用目录..."
    
    APP_DIR="/home/$USER/industrial-cluster-assessment-system"
    
    if [ -d "$APP_DIR" ]; then
        warning "应用目录已存在，备份现有目录..."
        sudo mv "$APP_DIR" "${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 创建应用目录
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    # 如果提供了Git仓库，克隆代码
    if [ ! -z "$GIT_REPO" ]; then
        log "克隆项目代码..."
        git clone "$GIT_REPO" .
    else
        warning "未提供Git仓库地址，请手动上传项目文件到 $APP_DIR"
    fi
    
    success "应用目录设置完成: $APP_DIR"
}

# 创建环境变量文件
create_env_file() {
    log "创建环境变量文件..."
    
    cat > .env << EOF
# 生产环境配置
NODE_ENV=production
ENVIRONMENT=production

# 前端配置
VITE_API_BASE_URL=https://$DOMAIN
VITE_APP_TITLE=产业集群发展潜力评估系统

# OpenAI配置
VITE_OPENAI_API_KEY=$OPENAI_API_KEY
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Claude配置
VITE_CLAUDE_API_KEY=$CLAUDE_API_KEY

# Dify配置
VITE_DIFY_API_KEY=$DIFY_API_KEY
VITE_DIFY_BASE_URL=https://api.dify.ai/v1
VITE_DIFY_AGENT_ID=$DIFY_AGENT_ID
VITE_DEFAULT_AI_PROVIDER=dify

# 数据库配置
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@postgres:5432/industrial_cluster
POSTGRES_PASSWORD=$DB_PASSWORD
REDIS_URL=redis://redis:6379

# JWT配置
JWT_SECRET=$JWT_SECRET
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
EOF
    
    # 设置环境文件权限
    chmod 600 .env
    
    success "环境变量文件创建完成"
}

# 创建生产环境Docker Compose文件
create_docker_compose() {
    log "创建Docker Compose配置..."
    
    cat > docker-compose.prod.yml << 'EOF'
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
      - postgres_data:/var/lib/postgresql/data
      - ./backend/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: redis_prod
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: backend_prod
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/industrial_cluster
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "127.0.0.1:8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: frontend_prod
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
EOF
    
    success "Docker Compose配置创建完成"
}

# 配置Nginx
configure_nginx() {
    log "配置Nginx..."
    
    # 创建Nginx配置文件
    sudo tee /etc/nginx/sites-available/industrial-cluster > /dev/null << EOF
# 上游服务器定义
upstream frontend {
    server 127.0.0.1:3000;
}

upstream api {
    server 127.0.0.1:8000;
}

# HTTP配置 (用于重定向到HTTPS或Let's Encrypt验证)
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他请求重定向到HTTPS (如果配置了SSL)
    location / {
EOF

    if [ "$SSL_TYPE" != "none" ]; then
        echo "        return 301 https://\$server_name\$request_uri;" | sudo tee -a /etc/nginx/sites-available/industrial-cluster > /dev/null
    else
        cat << 'EOF' | sudo tee -a /etc/nginx/sites-available/industrial-cluster > /dev/null
        # 直接代理到前端 (仅HTTP模式)
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
EOF
    fi

    echo "    }" | sudo tee -a /etc/nginx/sites-available/industrial-cluster > /dev/null
    echo "}" | sudo tee -a /etc/nginx/sites-available/industrial-cluster > /dev/null

    # 如果配置SSL，添加HTTPS服务器块
    if [ "$SSL_TYPE" != "none" ]; then
        cat << EOF | sudo tee -a /etc/nginx/sites-available/industrial-cluster > /dev/null

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL证书配置 (稍后配置)
    # ssl_certificate /etc/nginx/ssl/cert.pem;
    # ssl_certificate_key /etc/nginx/ssl/key.pem;
    
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 对于React Router
        try_files \$uri \$uri/ @fallback;
    }

    location @fallback {
        proxy_pass http://frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    fi

    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/industrial-cluster /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default

    # 测试Nginx配置
    sudo nginx -t
    
    success "Nginx配置完成"
}

# 配置SSL证书
configure_ssl() {
    if [ "$SSL_TYPE" = "none" ]; then
        warning "跳过SSL配置"
        return
    fi
    
    log "配置SSL证书..."
    
    case $SSL_TYPE in
        "letsencrypt")
            # 安装Certbot
            sudo apt install -y certbot python3-certbot-nginx
            
            # 创建webroot目录
            sudo mkdir -p /var/www/certbot
            
            # 重启Nginx以应用初始配置
            sudo systemctl restart nginx
            
            # 获取Let's Encrypt证书
            log "申请Let's Encrypt证书..."
            sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
            
            # 设置自动续期
            echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
            ;;
            
        "custom")
            # 创建SSL目录
            sudo mkdir -p /etc/nginx/ssl
            
            # 复制证书文件
            if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
                sudo cp "$CERT_PATH" /etc/nginx/ssl/cert.pem
                sudo cp "$KEY_PATH" /etc/nginx/ssl/key.pem
                sudo chmod 600 /etc/nginx/ssl/key.pem
                sudo chmod 644 /etc/nginx/ssl/cert.pem
                
                # 更新Nginx配置中的证书路径
                sudo sed -i 's|# ssl_certificate.*|ssl_certificate /etc/nginx/ssl/cert.pem;|' /etc/nginx/sites-available/industrial-cluster
                sudo sed -i 's|# ssl_certificate_key.*|ssl_certificate_key /etc/nginx/ssl/key.pem;|' /etc/nginx/sites-available/industrial-cluster
            else
                error "证书文件不存在: $CERT_PATH 或 $KEY_PATH"
                exit 1
            fi
            ;;
    esac
    
    success "SSL证书配置完成"
}

# 创建必要的目录
create_directories() {
    log "创建必要的目录..."
    
    mkdir -p uploads logs
    chmod 755 uploads logs
    
    success "目录创建完成"
}

# 构建和启动应用
deploy_application() {
    log "构建和部署应用..."
    
    # 确保Docker组权限生效
    newgrp docker << EOF
    # 构建应用镜像
    log "构建Docker镜像..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # 启动应用
    log "启动应用服务..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # 等待服务启动
    log "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    docker-compose -f docker-compose.prod.yml ps
EOF
    
    success "应用部署完成"
}

# 创建系统服务
create_systemd_service() {
    log "创建系统服务..."
    
    sudo tee /etc/systemd/system/industrial-cluster.service > /dev/null << EOF
[Unit]
Description=Industrial Cluster Assessment System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PWD
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF
    
    # 重新加载systemd并启用服务
    sudo systemctl daemon-reload
    sudo systemctl enable industrial-cluster.service
    
    success "系统服务创建完成"
}

# 创建管理脚本
create_management_scripts() {
    log "创建管理脚本..."
    
    # 创建部署脚本
    cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 部署产业集群评估系统..."

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down

# 备份数据库
echo "💾 备份数据库..."
docker exec postgres_prod pg_dump -U postgres industrial_cluster > backup_$(date +%Y%m%d_%H%M%S).sql || true

# 构建新镜像
echo "🔨 构建应用镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 启动服务
echo "▶️  启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 执行健康检查..."
for i in {1..5}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ 应用部署成功！"
        break
    fi
    if [ $i -eq 5 ]; then
        echo "❌ 健康检查失败，请检查日志"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
    sleep 10
done

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "🎉 部署完成！"
EOF
    
    # 创建监控脚本
    cat > monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="./logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 检查Docker容器状态
echo "[$DATE] Checking Docker containers..." >> $LOG_FILE
docker-compose -f docker-compose.prod.yml ps >> $LOG_FILE

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
    # 可以在这里添加告警逻辑
fi
EOF
    
    # 创建备份脚本
    cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
echo "备份数据库..."
docker exec postgres_prod pg_dump -U postgres industrial_cluster > $BACKUP_DIR/database_$DATE.sql

# 备份上传文件
echo "备份上传文件..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# 备份配置文件
echo "备份配置文件..."
cp .env $BACKUP_DIR/env_$DATE
cp docker-compose.prod.yml $BACKUP_DIR/docker-compose_$DATE.yml

# 清理旧备份 (保留7天)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR"
EOF
    
    # 设置执行权限
    chmod +x deploy.sh monitor.sh backup.sh
    
    success "管理脚本创建完成"
}

# 设置定时任务
setup_cron_jobs() {
    log "设置定时任务..."
    
    # 创建crontab条目
    (crontab -l 2>/dev/null; cat << EOF
# 产业集群评估系统监控和维护任务
*/5 * * * * $PWD/monitor.sh
0 2 * * * $PWD/backup.sh
0 4 * * 0 docker system prune -f
EOF
    ) | crontab -
    
    success "定时任务设置完成"
}

# 健康检查
health_check() {
    log "执行最终健康检查..."
    
    # 检查Docker服务
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        error "Docker服务未正常运行"
        return 1
    fi
    
    # 检查应用响应
    for i in {1..10}; do
        if curl -f "http://localhost:3000/health" > /dev/null 2>&1; then
            success "应用健康检查通过"
            break
        fi
        if [ $i -eq 10 ]; then
            error "应用健康检查失败"
            return 1
        fi
        sleep 5
    done
    
    # 检查Nginx
    if ! sudo nginx -t; then
        error "Nginx配置有误"
        return 1
    fi
    
    # 检查SSL (如果配置了)
    if [ "$SSL_TYPE" != "none" ]; then
        if curl -f "https://$DOMAIN/health" > /dev/null 2>&1; then
            success "HTTPS访问正常"
        else
            warning "HTTPS访问可能有问题，请检查SSL配置"
        fi
    fi
    
    success "所有健康检查通过"
}

# 显示部署结果
show_completion() {
    clear
    echo -e "${GREEN}"
    echo "=============================================="
    echo "🎉 部署完成！产业集群评估系统已成功部署"
    echo "=============================================="
    echo -e "${NC}"
    echo
    echo -e "${CYAN}📋 部署信息:${NC}"
    echo "• 域名: $DOMAIN"
    
    if [ "$SSL_TYPE" != "none" ]; then
        echo "• 访问地址: https://$DOMAIN"
        echo "• SSL类型: $SSL_TYPE"
    else
        echo "• 访问地址: http://$DOMAIN"
    fi
    
    echo "• 应用目录: $PWD"
    echo
    echo -e "${CYAN}🔧 管理命令:${NC}"
    echo "• 查看服务状态: docker-compose -f docker-compose.prod.yml ps"
    echo "• 查看实时日志: docker-compose -f docker-compose.prod.yml logs -f"
    echo "• 重启服务: docker-compose -f docker-compose.prod.yml restart"
    echo "• 更新部署: ./deploy.sh"
    echo "• 数据备份: ./backup.sh"
    echo "• 系统监控: ./monitor.sh"
    echo
    echo -e "${CYAN}📁 重要文件:${NC}"
    echo "• 环境配置: .env"
    echo "• Docker配置: docker-compose.prod.yml"
    echo "• Nginx配置: /etc/nginx/sites-available/industrial-cluster"
    echo "• 系统服务: /etc/systemd/system/industrial-cluster.service"
    echo
    echo -e "${CYAN}🔐 安全提醒:${NC}"
    echo "• 请妥善保管数据库密码和JWT密钥"
    echo "• 定期检查并更新SSL证书"
    echo "• 监控系统资源使用情况"
    echo "• 定期备份重要数据"
    echo
    echo -e "${YELLOW}📚 更多信息:${NC}"
    echo "• 开发文档: docs/WINDOWS_LOCAL_DEVELOPMENT.md"
    echo "• 部署文档: docs/TENCENT_CLOUD_DEPLOYMENT.md"
    echo
    echo -e "${GREEN}感谢使用产业集群发展潜力评估系统！${NC}"
}

# 主函数
main() {
    show_welcome
    check_user
    collect_config
    
    log "开始部署流程..."
    
    update_system
    install_docker
    install_docker_compose
    install_nginx
    configure_firewall
    setup_app_directory
    create_env_file
    create_docker_compose
    create_directories
    configure_nginx
    configure_ssl
    
    # 重启Nginx应用SSL配置
    sudo systemctl restart nginx
    
    deploy_application
    create_systemd_service
    create_management_scripts
    setup_cron_jobs
    
    if health_check; then
        show_completion
    else
        error "部署过程中发现问题，请检查日志"
        exit 1
    fi
}

# 错误处理
trap 'error "部署脚本执行失败，请检查错误信息"; exit 1' ERR

# 执行主函数
main "$@"