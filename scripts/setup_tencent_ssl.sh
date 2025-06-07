#!/bin/bash

# 产业集群发展潜力评估系统 - 腾讯云SSL证书配置脚本
# 该脚本用于下载并配置腾讯云SSL证书

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置参数
APP_DIR="/home/ubuntu/app/industrial-cluster-assessment"
SSL_DIR="${APP_DIR}/nginx/ssl"
DOMAIN=""
CERT_PATH=""
KEY_PATH=""

# 显示帮助
show_help() {
    echo "使用方法: $0 -d domain.com -c /path/to/cert.crt -k /path/to/key.key"
    echo ""
    echo "参数:"
    echo "  -d    域名"
    echo "  -c    证书文件路径(.crt)"
    echo "  -k    私钥文件路径(.key)"
    echo "  -h    显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 -d example.com -c ~/ssl/example.com.crt -k ~/ssl/example.com.key"
}

# 解析参数
while getopts "d:c:k:h" opt; do
    case $opt in
        d) DOMAIN="$OPTARG" ;;
        c) CERT_PATH="$OPTARG" ;;
        k) KEY_PATH="$OPTARG" ;;
        h) show_help; exit 0 ;;
        \?) echo "无效选项: -$OPTARG" >&2; show_help; exit 1 ;;
    esac
done

# 检查必要参数
if [ -z "$DOMAIN" ] || [ -z "$CERT_PATH" ] || [ -z "$KEY_PATH" ]; then
    echo -e "${RED}错误: 缺少必要参数${NC}"
    show_help
    exit 1
fi

# 检查证书文件是否存在
if [ ! -f "$CERT_PATH" ]; then
    echo -e "${RED}错误: 证书文件不存在: $CERT_PATH${NC}"
    exit 1
fi

if [ ! -f "$KEY_PATH" ]; then
    echo -e "${RED}错误: 私钥文件不存在: $KEY_PATH${NC}"
    exit 1
fi

# 检查应用目录是否存在
if [ ! -d "$APP_DIR" ]; then
    # 尝试查找正确的应用目录
    APP_DIR=$(find /home/ubuntu/app -type d -name "industrial-cluster-assessment*" | head -1)
    
    if [ -z "$APP_DIR" ]; then
        echo -e "${RED}错误: 找不到应用目录${NC}"
        exit 1
    fi
    
    SSL_DIR="${APP_DIR}/nginx/ssl"
fi

echo -e "${GREEN}开始配置SSL证书...${NC}"

# 创建SSL目录
mkdir -p $SSL_DIR
chmod 755 $SSL_DIR

# 复制证书文件
echo "复制证书文件到 $SSL_DIR..."
cp "$CERT_PATH" "${SSL_DIR}/fullchain.pem"
cp "$KEY_PATH" "${SSL_DIR}/privkey.pem"
chmod 644 "${SSL_DIR}/fullchain.pem"
chmod 600 "${SSL_DIR}/privkey.pem"

# 修改Nginx配置
NGINX_CONF="${APP_DIR}/nginx/conf.d/default.conf"

if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${YELLOW}警告: Nginx配置文件不存在, 创建默认配置...${NC}"
    
    mkdir -p $(dirname "$NGINX_CONF")
    
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # 重定向HTTP到HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL配置
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # 访问日志和错误日志
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # 代理API请求
    location /api/ {
        proxy_pass http://app:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://app:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # 代理上传文件
    location /uploads/ {
        proxy_pass http://app:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        client_max_body_size 50M;
        client_body_buffer_size 10M;
    }

    # 所有其他请求
    location / {
        proxy_pass http://app:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
else
    echo "更新Nginx配置文件..."
    # 更新server_name
    sed -i "s/server_name .*/server_name ${DOMAIN} www.${DOMAIN};/g" "$NGINX_CONF"
fi

echo -e "${GREEN}SSL证书配置完成${NC}"
echo "域名: ${DOMAIN}"
echo "证书文件: ${SSL_DIR}/fullchain.pem"
echo "私钥文件: ${SSL_DIR}/privkey.pem"
echo "Nginx配置: ${NGINX_CONF}"
echo ""
echo -e "${YELLOW}请重启Nginx容器以应用更改:${NC}"
echo "cd $APP_DIR && docker-compose restart nginx"