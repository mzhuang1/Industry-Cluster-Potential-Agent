#!/bin/bash

# 产业集群发展潜力评估系统 - 导出脚本
# 该脚本帮助将项目打包为可部署的归档文件

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 创建时间戳
TIMESTAMP=$(date +%Y%m%d%H%M%S)
EXPORT_NAME="industrial-cluster-assessment-${TIMESTAMP}"

echo -e "${GREEN}开始导出产业集群发展潜力评估系统...${NC}"

# 检查是否有未提交的更改
if [ -d .git ]; then
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}警告: 存在未提交的更改。建议在导出前提交所有更改。${NC}"
        read -p "是否继续导出? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}导出已取消。${NC}"
            exit 1
        fi
    fi
fi

# 创建临时目录
echo "创建临时目录..."
TEMP_DIR=$(mktemp -d)
mkdir -p "${TEMP_DIR}/${EXPORT_NAME}"

# 复制所有文件到临时目录
echo "复制项目文件..."
rsync -av --progress ./ "${TEMP_DIR}/${EXPORT_NAME}" \
    --exclude node_modules \
    --exclude .git \
    --exclude .env \
    --exclude "*.zip" \
    --exclude "*.tar.gz" \
    --exclude __pycache__ \
    --exclude "*.pyc" \
    --exclude "backups" \
    --exclude "logs" \
    --exclude "uploads/*" \
    --exclude "dist" \
    --exclude "build"

# 确保复制了示例环境变量文件
if [ -f .env.example ]; then
    cp .env.example "${TEMP_DIR}/${EXPORT_NAME}/"
    echo "已复制环境变量示例文件 .env.example"
else
    echo -e "${YELLOW}警告: 未找到 .env.example 文件${NC}"
fi

# 确保脚本是可执行的
chmod +x "${TEMP_DIR}/${EXPORT_NAME}/deploy.sh"
if [ -f "${TEMP_DIR}/${EXPORT_NAME}/export.sh" ]; then
    chmod +x "${TEMP_DIR}/${EXPORT_NAME}/export.sh"
fi

# 创建归档文件
echo "创建归档文件..."
ARCHIVE_NAME="${EXPORT_NAME}.tar.gz"
tar -czf "${ARCHIVE_NAME}" -C "${TEMP_DIR}" "${EXPORT_NAME}"

# 清理临时目录
rm -rf "${TEMP_DIR}"

echo -e "${GREEN}导出完成!${NC}"
echo "归档文件: ${ARCHIVE_NAME}"
echo "文件大小: $(du -h ${ARCHIVE_NAME} | cut -f1)"
echo ""
echo -e "${YELLOW}部署说明:${NC}"
echo "1. 将 ${ARCHIVE_NAME} 传输到您的服务器"
echo "2. 在服务器上解压: tar -xzf ${ARCHIVE_NAME}"
echo "3. 进入目录: cd ${EXPORT_NAME}"
echo "4. 配置环境: cp .env.example .env 并编辑 .env 文件"
echo "5. 运行部署脚本: ./deploy.sh"
echo ""
echo "详细的部署指南请参阅 DEPLOYMENT_GUIDE.md"