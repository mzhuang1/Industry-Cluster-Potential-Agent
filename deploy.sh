#!/bin/bash

# 产业集群发展潜力评估系统部署脚本
# 使用方法: ./deploy.sh [production|staging]

# 设置环境变量
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
APP_NAME="cluster-assessment"
CLOUD_PROVIDER="tencent"  # 云服务商: tencent 或 alibaba

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # 无颜色

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装。请先安装Docker。${NC}"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装。请先安装Docker Compose。${NC}"
    exit 1
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env文件不存在。正在从示例创建...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}请编辑.env文件并填写必要的环境变量。${NC}"
        exit 1
    else
        echo -e "${RED}错误: .env.example文件也不存在。无法继续。${NC}"
        exit 1
    fi
fi

# 创建必要的目录
mkdir -p nginx/ssl nginx/logs nginx/conf.d
mkdir -p backend/logs

# 显示部署信息
echo -e "${GREEN}=== 部署信息 ===${NC}"
echo -e "环境: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "时间戳: ${YELLOW}${TIMESTAMP}${NC}"
echo -e "应用名称: ${YELLOW}${APP_NAME}${NC}"
echo -e "云服务商: ${YELLOW}${CLOUD_PROVIDER}${NC}"
echo ""

# 根据环境设置配置
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${GREEN}使用生产环境配置${NC}"
    export COMPOSE_FILE=docker-compose.yml
    
    # 检查SSL证书
    if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
        echo -e "${YELLOW}警告: SSL证书文件不存在。${NC}"
        echo -e "${YELLOW}请确保您已将SSL证书放置在nginx/ssl目录中。${NC}"
        echo -e "${YELLOW}或者，您可以先使用自签名证书进行测试。${NC}"
        
        read -p "是否生成自签名证书用于测试? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}生成自签名SSL证书...${NC}"
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/privkey.pem \
                -out nginx/ssl/fullchain.pem \
                -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc./CN=localhost"
            echo -e "${GREEN}自签名证书已生成。${NC}"
        fi
    fi
else
    echo -e "${GREEN}使用测试环境配置${NC}"
    export COMPOSE_FILE=docker-compose.yml
fi

# 腾讯云特定配置
if [ "$CLOUD_PROVIDER" = "tencent" ]; then
    echo -e "${GREEN}配置腾讯云特定设置...${NC}"
    
    # 检查是否安装了COSCMD工具（用于备份）
    if command -v coscmd &> /dev/null; then
        echo "腾讯云对象存储命令行工具(COSCMD)已安装"
    else
        echo -e "${YELLOW}提示: 如需使用腾讯云对象存储进行备份，请安装COSCMD:${NC}"
        echo "pip install -U coscmd"
    fi
    
    # 配置腾讯云监控组件（如需要）
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ ! -f /usr/local/qcloud/monitor/barad/admin/uninstall.sh ]; then
            echo -e "${YELLOW}提示: 未检测到腾讯云监控组件，建议安装:${NC}"
            echo "wget -qO- https://update2.agent.tencentyun.com/update/install_linux.sh | bash"
        else
            echo "腾讯云监控组件已安装"
        fi
    fi
fi

# 拉取最新代码（如果是git仓库）
if [ -d .git ]; then
    echo -e "${GREEN}拉取最新代码...${NC}"
    git pull
    if [ $? -ne 0 ]; then
        echo -e "${RED}拉取代码失败。请检查您的git配置。${NC}"
        exit 1
    fi
fi

# 备份当前数据库（如果存在）
if [ -d "postgres_data" ]; then
    echo -e "${GREEN}备份当前数据库...${NC}"
    mkdir -p backups
    BACKUP_FILE="backups/db_backup_${TIMESTAMP}.sql"
    docker-compose exec -T db pg_dumpall -c -U postgres > $BACKUP_FILE
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}数据库备份成功: ${BACKUP_FILE}${NC}"
    else
        echo -e "${YELLOW}数据库备份失败，继续部署...${NC}"
    fi
fi

# 构建和启动容器
echo -e "${GREEN}构建和启动Docker容器...${NC}"
docker-compose build --no-cache
docker-compose up -d

# 检查服务是否启动成功
echo -e "${GREEN}检查服务状态...${NC}"
sleep 10
docker-compose ps

# 显示应用日志
echo -e "${GREEN}显示应用日志的最后几行...${NC}"
docker-compose logs --tail=50 app

echo -e "${GREEN}部署完成!${NC}"
echo -e "您可以通过以下命令查看更多日志:"
echo -e "  docker-compose logs -f"

# 检查应用健康状态
echo -e "${GREEN}检查应用健康状态...${NC}"
curl -s http://localhost:8021/health | grep -q "ok"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}应用状态正常！${NC}"
    
    # 获取服务器IP地址
    SERVER_IP=$(curl -s http://metadata.tencentyun.com/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')
    
    echo -e "${GREEN}您可以访问以下地址使用您的应用:${NC}"
    echo -e "  http://${SERVER_IP}"
    
    # 如果配置了SSL
    if [ -f nginx/ssl/fullchain.pem ] && [ -f nginx/ssl/privkey.pem ]; then
        echo -e "  https://${SERVER_IP} (如果您已配置域名和SSL)"
    fi
else
    echo -e "${RED}应用可能未正确启动。请检查日志以获取更多信息。${NC}"
fi

# 创建备份定时任务
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${GREEN}配置自动备份...${NC}"
    
    if [ ! -f ./scripts/tencent_cloud_backup.sh ]; then
        mkdir -p scripts
        cat > ./scripts/tencent_cloud_backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
APP_DIR=$(dirname $(dirname $(readlink -f $0)))
mkdir -p $BACKUP_DIR

cd $APP_DIR
docker-compose exec -T db pg_dumpall -c -U postgres > ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
docker-compose exec -T vector_db pg_dumpall -c -U postgres > ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql

# 如果已配置COSCMD，则上传到腾讯云COS
if command -v coscmd &> /dev/null && [ -f ~/.cos.conf ]; then
    gzip ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
    gzip ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql
    coscmd upload ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz backups/
    coscmd upload ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql.gz backups/
fi

# 保留最近30天备份
find ${BACKUP_DIR} -name "db_backup_*.sql*" -type f -mtime +30 -delete
find ${BACKUP_DIR} -name "vector_db_backup_*.sql*" -type f -mtime +30 -delete
EOF
        chmod +x ./scripts/tencent_cloud_backup.sh
    fi
    
    # 配置定时任务
    CRON_JOB="0 2 * * * $(pwd)/scripts/tencent_cloud_backup.sh > /dev/null 2>&1"
    (crontab -l 2>/dev/null | grep -v "tencent_cloud_backup.sh"; echo "$CRON_JOB") | crontab -
    
    echo -e "${GREEN}已配置每天凌晨2点自动备份数据库${NC}"
fi

echo -e "${GREEN}===================${NC}"
echo -e "${GREEN}部署过程全部完成！${NC}"
echo -e "${GREEN}===================${NC}"