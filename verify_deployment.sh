#!/bin/bash

# 产业集群发展潜力评估系统 - 部署验证脚本
# 该脚本帮助验证系统是否正确部署和运行

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== 产业集群发展潜力评估系统 - 部署验证 =====${NC}"
echo "开始时间: $(date)"
echo ""

# 检查Docker是否在运行
echo "检查Docker服务..."
if systemctl is-active --quiet docker; then
    echo -e "Docker服务: ${GREEN}运行中${NC}"
else
    echo -e "Docker服务: ${RED}未运行${NC}"
    echo "请使用 'sudo systemctl start docker' 启动Docker服务"
    exit 1
fi

# 检查是否在项目目录中
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: 未找到docker-compose.yml文件${NC}"
    echo "请确保您在项目根目录中运行此脚本"
    exit 1
fi

# 检查容器状态
echo ""
echo "检查容器状态..."
CONTAINERS=("app" "db" "vector_db" "nginx")
ALL_RUNNING=true

for CONTAINER in "${CONTAINERS[@]}"; do
    CONTAINER_NAME=$(docker-compose ps -q ${CONTAINER})
    
    if [ -z "$CONTAINER_NAME" ]; then
        echo -e "${CONTAINER}: ${RED}未创建${NC}"
        ALL_RUNNING=false
        continue
    fi
    
    STATUS=$(docker inspect --format='{{.State.Status}}' ${CONTAINER_NAME})
    
    if [ "$STATUS" == "running" ]; then
        # 获取容器运行时间
        STARTED_AT=$(docker inspect --format='{{.State.StartedAt}}' ${CONTAINER_NAME})
        UPTIME=$(docker inspect --format='{{since .State.StartedAt}}' ${CONTAINER_NAME})
        echo -e "${CONTAINER}: ${GREEN}运行中${NC} (运行时间: ${UPTIME})"
    else
        echo -e "${CONTAINER}: ${RED}${STATUS}${NC}"
        ALL_RUNNING=false
    fi
done

echo ""
echo "检查网络连接..."

# 检查内部网络
echo "内部网络检查:"
if docker-compose exec -T app ping -c 2 db > /dev/null 2>&1; then
    echo -e "应用 -> 数据库: ${GREEN}连接正常${NC}"
else
    echo -e "应用 -> 数据库: ${RED}连接失败${NC}"
    ALL_RUNNING=false
fi

if docker-compose exec -T app ping -c 2 vector_db > /dev/null 2>&1; then
    echo -e "应用 -> 向量数据库: ${GREEN}连接正常${NC}"
else
    echo -e "应用 -> 向量数据库: ${RED}连接失败${NC}"
    ALL_RUNNING=false
fi

# 检查外部可访问性
echo ""
echo "外部访问检查:"
HOST_IP=$(hostname -I | awk '{print $1}')
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${HOST_IP})

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    echo -e "HTTP访问 (${HOST_IP}): ${GREEN}可访问 (状态码: ${HTTP_CODE})${NC}"
else
    echo -e "HTTP访问 (${HOST_IP}): ${RED}不可访问 (状态码: ${HTTP_CODE})${NC}"
    ALL_RUNNING=false
fi

# 检查API健康状态
API_HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${HOST_IP}/api/health)
if [ "$API_HEALTH_CODE" == "200" ]; then
    echo -e "API健康检查: ${GREEN}通过${NC}"
else
    echo -e "API健康检查: ${RED}失败 (状态码: ${API_HEALTH_CODE})${NC}"
    ALL_RUNNING=false
fi

# 检查日志中的错误
echo ""
echo "检查关键错误日志..."
ERROR_COUNT=$(docker-compose logs --tail=100 | grep -i "error\|exception\|fail" | wc -l)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}在最近100行日志中发现${ERROR_COUNT}个可能的错误${NC}"
    echo "查看详细错误: docker-compose logs | grep -i 'error\|exception\|fail'"
else
    echo -e "${GREEN}未发现明显错误${NC}"
fi

# 检查磁盘空间
echo ""
echo "检查磁盘空间..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
DISK_USAGE_PCT=${DISK_USAGE%\%}
if [ "$DISK_USAGE_PCT" -gt 85 ]; then
    echo -e "磁盘使用率: ${RED}${DISK_USAGE} (警告: 磁盘空间不足)${NC}"
else
    echo -e "磁盘使用率: ${GREEN}${DISK_USAGE}${NC}"
fi

# 检查内存使用情况
echo ""
echo "检查资源使用情况..."
echo "容器资源使用:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | head -n 6

# 总结
echo ""
echo "=============================="
if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}部署验证成功! 所有服务均正常运行。${NC}"
else
    echo -e "${YELLOW}部署验证完成，但存在一些问题需要注意。${NC}"
    echo "请检查上述输出中标记为红色的项目。"
fi

echo ""
echo "查看详细日志: docker-compose logs"
echo "查看应用日志: docker-compose logs app"
echo "重启所有服务: docker-compose restart"
echo "重启单个服务: docker-compose restart [服务名]"
echo ""
echo "验证完成时间: $(date)"