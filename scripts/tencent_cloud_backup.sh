#!/bin/bash

# 产业集群发展潜力评估系统 - 腾讯云COS备份脚本
# 该脚本用于将数据库备份和关键文件备份到腾讯云对象存储COS

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置参数
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
APP_DIR="/home/ubuntu/app/industrial-cluster-assessment"
COS_BUCKET="your-bucket-name"  # 修改为您的COS存储桶名称
COS_REGION="ap-beijing"        # 修改为您的存储桶所在地域
RETENTION_DAYS=30              # 本地备份保留天数

# 检查腾讯云COSCMD是否安装
if ! command -v coscmd &> /dev/null; then
    echo -e "${RED}错误: coscmd未安装${NC}"
    echo "请执行: pip install -U coscmd"
    exit 1
fi

# 检查COSCMD是否已配置
if [ ! -f ~/.cos.conf ]; then
    echo -e "${YELLOW}警告: COSCMD未配置${NC}"
    echo "请先运行以下命令配置COSCMD:"
    echo "coscmd config -a <SecretId> -s <SecretKey> -b $COS_BUCKET -r $COS_REGION"
    exit 1
fi

# 创建备份目录
mkdir -p $BACKUP_DIR

echo -e "${GREEN}开始备份数据库...${NC}"

# 检查应用目录是否存在
if [ ! -d "$APP_DIR" ]; then
    # 尝试查找正确的应用目录
    APP_DIR=$(find /home/ubuntu/app -type d -name "industrial-cluster-assessment*" | head -1)
    
    if [ -z "$APP_DIR" ]; then
        echo -e "${RED}错误: 找不到应用目录${NC}"
        exit 1
    fi
fi

cd $APP_DIR

# 备份主数据库
echo "备份主数据库..."
docker-compose exec -T db pg_dumpall -c -U postgres > ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
if [ $? -ne 0 ]; then
    echo -e "${RED}主数据库备份失败${NC}"
else
    echo -e "${GREEN}主数据库备份成功${NC}"
    # 压缩备份文件以节省空间
    gzip ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
fi

# 备份向量数据库
echo "备份向量数据库..."
docker-compose exec -T vector_db pg_dumpall -c -U postgres > ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql
if [ $? -ne 0 ]; then
    echo -e "${RED}向量数据库备份失败${NC}"
else
    echo -e "${GREEN}向量数据库备份成功${NC}"
    # 压缩备份文件以节省空间
    gzip ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql
fi

# 备份环境变量和配置文件
echo "备份配置文件..."
cp $APP_DIR/.env ${BACKUP_DIR}/env_backup_${TIMESTAMP}
tar -czf ${BACKUP_DIR}/configs_backup_${TIMESTAMP}.tar.gz $APP_DIR/nginx/conf.d $APP_DIR/nginx/ssl

# 备份上传的文件（如果有）
if [ -d "$APP_DIR/backend/uploads" ]; then
    echo "备份上传文件..."
    tar -czf ${BACKUP_DIR}/uploads_backup_${TIMESTAMP}.tar.gz $APP_DIR/backend/uploads
fi

echo -e "${GREEN}开始上传备份到腾讯云COS...${NC}"

# 上传备份到腾讯云COS
for file in ${BACKUP_DIR}/*_${TIMESTAMP}*; do
    filename=$(basename "$file")
    echo "上传 $filename 到 COS..."
    
    # 上传到COS并设置存储类型为低频存储，更经济
    coscmd upload "$file" "backups/$filename" -H "{'x-cos-storage-class':'STANDARD_IA'}"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}上传 $filename 失败${NC}"
    else
        echo -e "${GREEN}上传 $filename 成功${NC}"
    fi
done

# 清理过期的本地备份
echo "清理${RETENTION_DAYS}天前的本地备份文件..."
find ${BACKUP_DIR} -type f -mtime +${RETENTION_DAYS} -delete

# 列出成功的备份
echo -e "${GREEN}备份完成，以下文件已上传到腾讯云COS:${NC}"
coscmd list backups/ | grep ${TIMESTAMP}

echo -e "${GREEN}备份和上传过程完成${NC}"
echo "本地备份路径: ${BACKUP_DIR}"
echo "COS存储桶: ${COS_BUCKET}"
echo "备份时间: $(date)"