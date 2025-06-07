# 腾讯云部署指南 - 产业集群发展潜力评估系统

本文档提供了如何在腾讯云CVM(云服务器)上部署产业集群发展潜力评估系统的详细步骤。

## 1. 准备工作

### 1.1 腾讯云账号和资源

1. 注册并登录[腾讯云控制台](https://console.cloud.tencent.com/)
2. 购买CVM实例，推荐配置：
   - 地域：选择离您用户最近的地域（如华北、华南等）
   - 实例规格：至少2核4GB内存（推荐4核8GB以上）
   - 操作系统：Ubuntu 20.04 LTS 或 22.04 LTS
   - 存储：系统盘50GB云硬盘，数据盘100GB云硬盘
   - 网络：私有网络VPC
   - 安全组：开放80(HTTP)、443(HTTPS)端口
   - 公网带宽：推荐5Mbps以上

### 1.2 域名和证书（可选）

1. 在[腾讯云域名注册控制台](https://console.cloud.tencent.com/domain)购买域名
2. 完成域名备案（中国大陆地区必须）
3. 在[SSL证书控制台](https://console.cloud.tencent.com/ssl)申请免费或付费SSL证书

## 2. 连接到CVM实例

### 2.1 使用SSH密钥方式（推荐）

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-cvm-public-ip
```

### 2.2 使用密码方式

```bash
ssh ubuntu@your-cvm-public-ip
```

## 3. 服务器环境配置

### 3.1 更新系统并安装基础工具

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y vim git curl wget unzip htop net-tools
```

### 3.2 安装Docker和Docker Compose

```bash
# 安装Docker
curl -fsSL https://get.docker.com | sudo bash

# 添加当前用户到docker组
sudo usermod -aG docker $USER

# 应用组权限（需要重新登录终端）
newgrp docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动Docker并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

## 4. 配置域名解析（如果有域名）

1. 登录[腾讯云DNS解析控制台](https://console.cloud.tencent.com/cns)
2. 找到您的域名，点击"解析"
3. 添加记录：
   - 记录类型：A记录
   - 主机记录：@ 或 www（或自定义子域名）
   - 记录值：您的CVM公网IP地址
   - TTL：600秒

## 5. 导出和部署应用

### 5.1 在本地导出应用

在本地开发环境中执行以下步骤：

```bash
# 确保export.sh脚本有执行权限
chmod +x export.sh

# 运行导出脚本
./export.sh
```

导出脚本会创建一个名为`industrial-cluster-assessment-[timestamp].tar.gz`的归档文件。

### 5.2 上传应用到CVM

```bash
# 使用scp上传归档文件
scp industrial-cluster-assessment-*.tar.gz ubuntu@your-cvm-public-ip:~/

# 或使用SFTP工具上传
```

### 5.3 在CVM上解压和配置应用

```bash
# SSH连接到CVM
ssh ubuntu@your-cvm-public-ip

# 创建应用目录
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# 解压应用
tar -xzf ~/industrial-cluster-assessment-*.tar.gz
cd industrial-cluster-assessment-*

# 配置环境变量
cp .env.example .env
nano .env
```

需要编辑的主要环境变量：

```
# API密钥
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 安全设置
JWT_SECRET=generate_a_strong_random_string  # 可以使用: openssl rand -hex 32

# 域名设置（如果有域名）
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### 5.4 配置Nginx和SSL证书

#### 5.4.1 如果使用腾讯云SSL证书：

1. 在腾讯云SSL证书控制台下载Nginx格式的证书文件
2. 解压证书文件，获取.crt和.key文件
3. 在服务器上创建证书目录并上传文件：

```bash
# 在服务器上
mkdir -p nginx/ssl

# 在本地执行:
scp yourdomain.com.crt yourdomain.com.key ubuntu@your-cvm-public-ip:/home/ubuntu/app/industrial-cluster-assessment-*/nginx/ssl/

# 在服务器上重命名证书文件
mv nginx/ssl/yourdomain.com.crt nginx/ssl/fullchain.pem
mv nginx/ssl/yourdomain.com.key nginx/ssl/privkey.pem
```

#### 5.4.2 修改Nginx配置：

```bash
# 编辑nginx配置
nano nginx/conf.d/default.conf
```

修改server_name为您的域名：

```nginx
server_name yourdomain.com www.yourdomain.com;
```

如果没有域名，可以使用服务器IP：

```nginx
server_name your-cvm-public-ip;
```

## 6. 启动应用

### 6.1 使用部署脚本（推荐）

```bash
# 确保部署脚本有执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 6.2 或手动启动

```bash
# 构建容器
docker-compose build --no-cache

# 启动容器
docker-compose up -d
```

## 7. 验证部署

### 7.1 检查容器状态

```bash
docker-compose ps
```

所有容器的状态应该为"Up"。

### 7.2 检查应用日志

```bash
docker-compose logs -f app
```

### 7.3 验证网站访问

在浏览器中访问：
- 如果配置了域名：https://yourdomain.com
- 如果直接使用IP：http://your-cvm-public-ip

### 7.4 运行验证脚本

```bash
chmod +x verify_deployment.sh
./verify_deployment.sh
```

## 8. 腾讯云特定优化

### 8.1 使用腾讯云CLB（Cloud Load Balancer）

如果需要高可用性或流量较大，可以配置腾讯云负载均衡：

1. 在[腾讯云CLB控制台](https://console.cloud.tencent.com/clb)创建负载均衡实例
2. 添加监听器：
   - HTTP(80)端口转发到CVM的80端口
   - HTTPS(443)端口转发到CVM的443端口
3. 上传SSL证书到CLB
4. 将域名解析到CLB的IP地址

### 8.2 使用腾讯云CDN加速静态资源

1. 在[腾讯云CDN控制台](https://console.cloud.tencent.com/cdn)开通CDN服务
2. 添加加速域名（如static.yourdomain.com）
3. 源站类型选择"源站IP"，填写您的CVM IP
4. 修改Nginx配置，为静态资源添加独立域名
5. 将static.yourdomain.com解析到CDN分配的CNAME

### 8.3 使用腾讯云COS（对象存储）存储上传文件和备份

1. 在[腾讯云COS控制台](https://console.cloud.tencent.com/cos5)创建存储桶
2. 安装COSCMD命令行工具：

```bash
pip install -U coscmd
```

3. 配置COSCMD：

```bash
coscmd config -a your-secret-id -s your-secret-key -b your-bucket -r your-region
```

4. 创建备份脚本：

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
cd /home/ubuntu/app/industrial-cluster-assessment-*
docker-compose exec -T db pg_dumpall -c -U postgres > ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
docker-compose exec -T vector_db pg_dumpall -c -U postgres > ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql

# 上传到腾讯云COS
coscmd upload ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql database-backups/
coscmd upload ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql database-backups/

# 清理30天前的备份
find ${BACKUP_DIR} -name "*.sql" -type f -mtime +30 -delete
```

### 8.4 使用腾讯云监控

1. 在CVM中安装腾讯云监控组件：

```bash
wget -qO- https://update2.agent.tencentyun.com/update/install_linux.sh | bash
```

2. 在[腾讯云监控控制台](https://console.cloud.tencent.com/monitor)配置告警策略：
   - CPU使用率 > 80%
   - 内存使用率 > 80%
   - 磁盘使用率 > 90%

## 9. 安全加固

### 9.1 配置腾讯云安全组

在腾讯云控制台配置安全组规则：
- 只允许必要的入站端口(80, 443, 22)
- 限制SSH访问来源IP

### 9.2 系统安全加固

```bash
# 更新系统并安装安全更新
sudo apt update && sudo apt upgrade -y

# 安装fail2ban防止暴力破解
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 配置防火墙
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 9.3 启用腾讯云安全服务

在腾讯云控制台开通：
- 主机安全（云镜）服务
- DDoS防护
- Web应用防火墙（如预算允许）

## 10. 数据备份策略

### 10.1 数据库定期备份

创建备份脚本并设置定时任务：

```bash
# 创建备份目录
mkdir -p /home/ubuntu/backups

# 创建备份脚本
cat > /home/ubuntu/backup_db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
cd /home/ubuntu/app/industrial-cluster-assessment-*
docker-compose exec -T db pg_dumpall -c -U postgres > ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql
docker-compose exec -T vector_db pg_dumpall -c -U postgres > ${BACKUP_DIR}/vector_db_backup_${TIMESTAMP}.sql

# 保留最近30天备份
find ${BACKUP_DIR} -name "db_backup_*.sql" -type f -mtime +30 -delete
find ${BACKUP_DIR} -name "vector_db_backup_*.sql" -type f -mtime +30 -delete
EOF

chmod +x /home/ubuntu/backup_db.sh

# 配置定时任务，每天凌晨2点执行备份
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup_db.sh") | crontab -
```

### 10.2 使用腾讯云COS备份

如上节所述，将数据库备份上传到腾讯云COS对象存储。

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
sudo ufw status

# 检查腾讯云安全组配置（在腾讯云控制台）
```

### 11.4 API连接问题

```bash
# 检查API日志
docker-compose logs app | grep -i "error"

# 检查.env文件中的API密钥
cat .env | grep -i "API_KEY"

# 检查OpenAI API是否可访问
curl -I https://api.openai.com
```

## 12. 性能优化

### 12.1 CVM实例升级

如果应用负载较高，可以考虑：
- 增加CPU和内存
- 使用SSD云硬盘提高存储性能
- 升级网络带宽

### 12.2 数据库优化

```bash
# 编辑PostgreSQL配置
docker-compose exec db bash
nano /var/lib/postgresql/data/postgresql.conf
```

主要优化参数：
- `shared_buffers`: 设置为总内存的25%
- `effective_cache_size`: 设置为总内存的50%
- `work_mem`: 根据连接数和查询复杂度调整

### 12.3 Nginx优化

编辑Nginx配置，添加缓存和压缩：

```nginx
# 启用gzip压缩
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types
  application/javascript
  application/json
  application/x-javascript
  application/xml
  text/css
  text/javascript
  text/plain
  text/xml;

# 配置缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;
```

## 13. 更新与维护

### 13.1 应用更新

当有新版本发布时：

```bash
# 如果使用Git
git pull

# 如果手动更新，重新上传并解压新版本
# 然后执行:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 13.2 系统更新

定期更新系统和依赖：

```bash
# 创建更新脚本
cat > /home/ubuntu/update_system.sh << 'EOF'
#!/bin/bash
sudo apt update && sudo apt upgrade -y
docker system prune -af
EOF

chmod +x /home/ubuntu/update_system.sh

# 配置每周日凌晨4点执行更新
(crontab -l 2>/dev/null; echo "0 4 * * 0 /home/ubuntu/update_system.sh") | crontab -
```

## 联系支持

如有任何部署问题，请联系：

- 技术支持邮箱：support@example.com
- 项目文档：https://github.com/yourusername/industrial-cluster-assessment

---

此部署指南专为腾讯云CVM环境设计。如需在其他云平台部署，请参考相应平台的文档进行适当调整。