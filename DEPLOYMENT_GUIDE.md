# 部署指南 - 产业集群发展潜力评估系统

本文档提供了如何导出、打包和部署产业集群发展潜力评估系统的详细步骤。

## 1. 导出和打包项目

### 方法1：使用Git（推荐）

如果你的项目已经在Git仓库中，这是最简单的方法：

```bash
# 在你的服务器上
git clone https://your-repository-url.git
cd your-repository-name
```

### 方法2：手动打包

如果你没有使用Git，可以手动打包项目：

1. 在你的本地开发环境中，确保项目完整可用
2. 创建一个ZIP文件，包含所有项目文件：

```bash
# 在项目根目录下
zip -r project.zip . -x "node_modules/*" -x ".git/*" -x "*.env"
```

3. 将ZIP文件传输到你的服务器：

```bash
scp project.zip user@your-server-ip:/path/to/destination
```

4. 在服务器上解压：

```bash
ssh user@your-server-ip
cd /path/to/destination
unzip project.zip -d industrial-cluster-assessment
cd industrial-cluster-assessment
```

## 2. 准备服务器环境

### 安装Docker和Docker Compose

```bash
# 更新包列表
sudo apt update

# 安装必要的包
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加Docker的官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加Docker仓库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 更新包列表
sudo apt update

# 安装Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组（避免每次都需要sudo）
sudo usermod -aG docker $USER
```

重新登录服务器，使docker组权限生效。

### 配置防火墙

确保服务器防火墙开放以下端口：

- 80 (HTTP)
- 443 (HTTPS)
- 8021 (如果你想直接访问后端API)

对于UFW防火墙：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8021/tcp
sudo ufw enable
```

## 3. 配置环境变量

1. 复制示例环境变量文件并编辑：

```bash
cp .env.example .env
nano .env
```

2. 设置以下重要变量：

```
# API密钥 - 必须配置
OPENAI_API_KEY=your_openai_api_key_here

# 安全设置
JWT_SECRET=generate_a_strong_random_string  # 可以使用: openssl rand -hex 32

# 数据库凭据 - 如果需要修改默认值
DATABASE_URL=postgresql://postgres:postgres@db:5432/cluster_assessment

# 域名配置 - 如果您有域名
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
```

## 4. 配置Nginx

1. 修改Nginx配置文件以匹配你的域名：

```bash
nano nginx/conf.d/default.conf
```

2. 更新以下行：

```
server_name yourdomain.com www.yourdomain.com;
```

替换为你实际的域名或服务器IP。

## 5. SSL证书配置（可选但推荐）

### 使用Let's Encrypt（如果你有域名）

```bash
# 安装certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 复制证书到Nginx目录
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chmod 755 nginx/ssl
```

### 使用自签名证书（测试用途）

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=CDI/CN=localhost"
```

## 6. 构建和启动应用

使用部署脚本或直接使用Docker Compose：

### 使用部署脚本（推荐）

```bash
chmod +x deploy.sh
./deploy.sh
```

### 或手动使用Docker Compose

```bash
# 构建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d
```

## 7. 验证部署

1. 检查容器运行状态：

```bash
docker-compose ps
```

2. 查看应用日志：

```bash
docker-compose logs -f app
```

3. 在浏览器中访问你的应用：
   - 如果配置了域名：https://yourdomain.com
   - 如果直接使用IP：http://your-server-ip

## 8. 维护和管理

### 更新应用

当有代码更新时：

```bash
# 如果使用Git
git pull

# 重新构建和启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 备份数据库

```bash
# 创建备份目录
mkdir -p backups

# 备份主数据库
docker-compose exec -T db pg_dumpall -c -U postgres > backups/db_backup_$(date +%Y%m%d).sql

# 备份向量数据库
docker-compose exec -T vector_db pg_dumpall -c -U postgres > backups/vector_db_backup_$(date +%Y%m%d).sql
```

### 监控日志

```bash
# 查看所有服务的日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs app
docker-compose logs db
docker-compose logs nginx
```

### 停止应用

```bash
docker-compose down
```

### 完全卸载

```bash
docker-compose down -v
```

这将停止所有容器并删除所有卷（包括数据库数据）。

## 9. 故障排除

### 问题：无法连接到数据库

检查数据库容器是否在运行：

```bash
docker-compose ps db
```

查看数据库日志：

```bash
docker-compose logs db
```

### 问题：Nginx报错或网站无法访问

检查Nginx配置：

```bash
docker-compose exec nginx nginx -t
```

查看Nginx日志：

```bash
docker-compose logs nginx
```

### 问题：OpenAI API连接失败

1. 检查`.env`文件中的API密钥是否正确
2. 确认服务器可以访问外网
3. 查看应用日志中的详细错误信息：

```bash
docker-compose logs app | grep "OpenAI"
```

## 10. 性能优化建议

1. 增加服务器资源（特别是内存，推荐至少8GB）
2. 配置Nginx缓存以减轻后端负载
3. 对于高流量场景，考虑将数据库迁移到专用服务器
4. 使用CDN服务加速静态资源交付

## 11. 安全建议

1. 定期更新系统和Docker
2. 使用强密码和JWT密钥
3. 限制SSH访问，使用密钥认证
4. 定期备份数据
5. 监控服务器日志以发现异常活动

---

如有任何部署问题，请参考项目的README.md文件或联系开发团队。