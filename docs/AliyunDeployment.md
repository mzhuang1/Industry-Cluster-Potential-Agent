# 阿里云部署指南

本文档提供了如何在阿里云ECS(弹性计算服务)上部署产业集群发展潜力评估系统的详细步骤。

## 1. 准备工作

### 1.1 阿里云账号和资源

1. 注册并登录[阿里云控制台](https://home.console.aliyun.com/)
2. 购买ECS实例，推荐配置：
   - 地域：选择离您用户最近的地域
   - 实例规格：至少2核4GB内存（推荐4核8GB）
   - 操作系统：Ubuntu 20.04 或 22.04 LTS
   - 存储：系统盘50GB SSD，数据盘100GB SSD
   - 网络：VPC网络
   - 安全组：开放80(HTTP)、443(HTTPS)端口

### 1.2 域名和证书（可选）

1. 在[阿里云域名控制台](https://dc.console.aliyun.com/)购买域名
2. 完成域名备案（中国大陆地区必须）
3. 在[SSL证书控制台](https://yundunnext.console.aliyun.com/)申请免费或付费SSL证书

## 2. 连接到ECS实例

### 2.1 使用SSH密钥方式（推荐）

```bash
chmod 400 your-key.pem
ssh -i your-key.pem root@your-ecs-public-ip
```

### 2.2 使用密码方式

```bash
ssh root@your-ecs-public-ip
```

## 3. 服务器环境配置

### 3.1 更新系统并安装基础工具

```bash
# 更新系统
apt update && apt upgrade -y

# 安装基础工具
apt install -y vim git curl wget unzip htop net-tools
```

### 3.2 安装Docker和Docker Compose

```bash
# 安装Docker
curl -fsSL https://get.docker.com | bash

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 启动Docker并设置开机自启
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

## 4. 配置域名解析（如果有域名）

1. 登录[阿里云域名控制台](https://dc.console.aliyun.com/)
2. 找到您的域名，点击"解析"
3. 添加记录：
   - 记录类型：A记录
   - 主机记录：@ 或 www（或自定义子域名）
   - 记录值：您的ECS公网IP地址
   - TTL：10分钟

## 5. 部署应用

### 5.1 获取应用代码

```bash
# 创建应用目录
mkdir -p /app
cd /app

# 上传应用归档文件
# 在本地执行: 
# scp industrial-cluster-assessment.tar.gz root@your-ecs-public-ip:/app/

# 解压应用
tar -xzf industrial-cluster-assessment.tar.gz
cd industrial-cluster-assessment
```

### 5.2 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑环境变量
vim .env
```

需要配置的主要环境变量：

```
# API密钥
OPENAI_API_KEY=your_openai_api_key_here

# 安全设置
JWT_SECRET=generate_a_strong_random_string

# 域名设置（如果有域名）
CORS_ORIGINS=https://yourdomain.com
```

### 5.3 配置Nginx和SSL证书

#### 如果使用阿里云SSL证书：

1. 在阿里云控制台下载证书文件（Nginx格式）
2. 解压证书文件，获取.pem和.key文件
3. 在服务器上创建证书目录并上传文件：

```bash
mkdir -p nginx/ssl
# 在本地执行:
# scp yourdomain.com.pem yourdomain.com.key root@your-ecs-public-ip:/app/industrial-cluster-assessment/nginx/ssl/

# 重命名证书文件
mv nginx/ssl/yourdomain.com.pem nginx/ssl/fullchain.pem
mv nginx/ssl/yourdomain.com.key nginx/ssl/privkey.pem
```

#### 修改Nginx配置：

```bash
# 编辑nginx配置
vim nginx/conf.d/default.conf
```

修改server_name为您的域名：

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 5.4 启动应用

```bash
# 确保部署脚本有执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

## 6. 验证部署

### 6.1 检查容器状态

```bash
docker-compose ps
```

所有容器的状态应该为"Up"。

### 6.2 检查应用日志

```bash
docker-compose logs -f app
```

检查是否有错误信息。

### 6.3 验证网站访问

在浏览器中访问：
- 如果配置了域名：https://yourdomain.com
- 如果直接使用IP：http://your-ecs-public-ip

### 6.4 运行验证脚本

```bash
chmod +x verify_deployment.sh
./verify_deployment.sh
```

## 7. 性能优化

### 7.1 阿里云ECS性能优化

1. **监控并调整ECS实例规格**：
   - 在阿里云控制台监控CPU、内存使用率
   - 如发现资源不足，可以在控制台进行配置升级

2. **使用SSD云盘**：
   - 替换数据盘为SSD云盘可显著提高数据库性能

3. **配置弹性伸缩**：
   - 对于访问量波动较大的应用，可配置弹性伸缩策略

### 7.2 网络优化

1. **配置CDN加速**：
   - 在阿里云CDN控制台配置CDN加速静态资源

2. **配置SLB负载均衡**：
   - 如需要高可用方案，可配置SLB实现多实例负载均衡

## 8. 备份策略

### 8.1 数据库备份

创建定时备份脚本：

```bash
mkdir -p /app/backups

# 创建备份脚本
cat > /app/backup_db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/app/backups"
cd /app/industrial-cluster-assessment
docker-compose exec -T db pg_dumpall -c -U postgres > ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
docker-compose exec -T vector_db pg_dumpall -c -U postgres > ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql

# 保留最近30天备份
find ${BACKUP_DIR} -name "db_backup_*.sql" -type f -mtime +30 -delete
find ${BACKUP_DIR} -name "vector_db_backup_*.sql" -type f -mtime +30 -delete
EOF

chmod +x /app/backup_db.sh

# 配置定时任务，每天凌晨2点执行备份
(crontab -l 2>/dev/null; echo "0 2 * * * /app/backup_db.sh") | crontab -
```

### 8.2 配置对象存储备份（推荐）

1. 在阿里云创建OSS(对象存储服务)存储桶
2. 安装OSS命令行工具并配置备份脚本：

```bash
pip install -U aliyun-cli

# 配置阿里云访问凭证
aliyun configure

# 创建OSS备份脚本
cat > /app/backup_to_oss.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/app/backups"
OSS_BUCKET="your-oss-bucket-name"
OSS_PATH="database-backups"

# 执行本地备份
/app/backup_db.sh

# 同步到OSS
LATEST_DB_BACKUP=$(ls -t ${BACKUP_DIR}/db_backup_*.sql | head -1)
LATEST_VECTOR_BACKUP=$(ls -t ${BACKUP_DIR}/vector_db_backup_*.sql | head -1)

if [ -f "$LATEST_DB_BACKUP" ]; then
  aliyun oss cp "$LATEST_DB_BACKUP" oss://${OSS_BUCKET}/${OSS_PATH}/
fi

if [ -f "$LATEST_VECTOR_BACKUP" ]; then
  aliyun oss cp "$LATEST_VECTOR_BACKUP" oss://${OSS_BUCKET}/${OSS_PATH}/
fi
EOF

chmod +x /app/backup_to_oss.sh

# 配置定时任务，每天凌晨3点执行OSS备份
(crontab -l 2>/dev/null; echo "0 3 * * * /app/backup_to_oss.sh") | crontab -
```

## 9. 安全加固

### 9.1 配置安全组

在阿里云控制台配置安全组规则：
- 只允许必要的入站端口(80, 443, 22)
- 限制SSH访问来源IP

### 9.2 系统安全加固

```bash
# 更新系统并安装安全更新
apt update && apt upgrade -y

# 安装fail2ban防止暴力破解
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 配置防火墙
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

### 9.3 配置定期更新

```bash
# 创建自动更新脚本
cat > /app/update_system.sh << 'EOF'
#!/bin/bash
apt update && apt upgrade -y
EOF

chmod +x /app/update_system.sh

# 配置每周日凌晨4点执行系统更新
(crontab -l 2>/dev/null; echo "0 4 * * 0 /app/update_system.sh") | crontab -
```

## 10. 监控和报警

### 10.1 配置阿里云云监控

1. 在阿里云控制台开通云监控服务
2. 为ECS实例安装云监控插件：

```bash
# 安装阿里云监控插件
curl -O http://update2.aegis.aliyun.com/download/install_cloudmonitor_linux_64bit.sh
bash install_cloudmonitor_linux_64bit.sh
```

3. 在云监控控制台配置报警规则：
   - CPU使用率 > 80%
   - 内存使用率 > 80%
   - 磁盘使用率 > 90%

### 10.2 应用健康检查

配置定期健康检查并发送报警：

```bash
# 安装发送邮件工具
apt install -y mailutils

# 创建健康检查脚本
cat > /app/health_check.sh << 'EOF'
#!/bin/bash
HOST="localhost"
EMAIL="your-email@example.com"

# 检查API健康状态
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${HOST}/api/health)
if [ "$HTTP_CODE" != "200" ]; then
  echo "API健康检查失败，状态码: ${HTTP_CODE}" | mail -s "产业集群评估系统告警" $EMAIL
fi

# 检查容器状态
if [ $(docker-compose -f /app/industrial-cluster-assessment/docker-compose.yml ps | grep -c "Up") -lt 4 ]; then
  echo "有容器未正常运行，请检查系统" | mail -s "产业集群评估系统告警" $EMAIL
fi
EOF

chmod +x /app/health_check.sh

# 配置每5分钟执行一次健康检查
(crontab -l 2>/dev/null; echo "*/5 * * * * /app/health_check.sh") | crontab -
```

## 11. 常见问题排查

### 11.1 容器无法启动

```bash
# 查看容器日志
docker-compose logs app
docker-compose logs db

# 检查环境变量
docker-compose config

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 11.2 数据库连接问题

```bash
# 检查数据库容器是否运行
docker-compose ps db

# 检查数据库日志
docker-compose logs db

# 进入数据库容器检查
docker-compose exec db bash
psql -U postgres
\l
\c cluster_assessment
\dt
```

### 11.3 网站无法访问

```bash
# 检查Nginx配置
docker-compose exec nginx nginx -t

# 检查Nginx日志
docker-compose logs nginx

# 检查防火墙规则
ufw status

# 检查安全组配置（在阿里云控制台）
```

## 12. 联系支持

如有任何部署问题，请联系：

- 技术支持邮箱：support@example.com
- 项目文档：https://github.com/yourusername/industrial-cluster-assessment

---

此部署指南专为阿里云ECS环境设计。如需在其他云平台部署，请参考相应平台的文档进行适当调整。