# 产业集群发展潜力评估系统

基于AI的产业集群发展潜力评估系统，集成了ChatGPT API进行智能分析和报告生成。

## 系统概述

本系统为行业研究机构、产业园区管理者和政府部门提供了产业集群发展潜力的全面评估工具。主要功能包括：

- 基于AI的对话式评估和分析
- 多维度数据可视化
- 产业集群评估报告生成
- 基于RAG的知识增强
- 用户和数据管理

## 技术栈

### 前端
- React
- TypeScript
- Tailwind CSS v4
- ShadCN UI 组件库
- Recharts 数据可视化

### 后端
- FastAPI
- PostgreSQL (关系数据库)
- pgvector (向量数据库)
- OpenAI API (GPT-4)
- Anthropic API (Claude)

### 部署
- Docker & Docker Compose
- Nginx
- SSL/TLS

## 系统要求

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 18+ (仅开发环境)
- Python 3.10+ (仅开发环境)
- 至少4GB RAM
- 20GB磁盘空间

## 快速开始

### 使用Docker部署

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/industrial-cluster-assessment.git
   cd industrial-cluster-assessment
   ```

2. 复制环境变量文件并填写
   ```bash
   cp .env.example .env
   # 编辑.env文件，填写必要的API密钥和配置
   ```

3. 启动应用
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. 访问应用
   在浏览器中访问 `http://localhost:8021` 或者您配置的域名

### 开发环境设置

1. 安装前端依赖
   ```bash
   npm install
   ```

2. 安装后端依赖
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. 启动前端开发服务器
   ```bash
   npm run dev
   ```

4. 启动后端开发服务器
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

## OpenAI API集成

本系统使用OpenAI API来提供智能分析和交互功能。您需要：

1. 在[OpenAI平台](https://platform.openai.com/)注册并获取API密钥
2. 在`.env`文件中设置`OPENAI_API_KEY`
3. 选择合适的模型（默认为gpt-4-turbo-preview）

## 数据库

系统使用两个PostgreSQL数据库：
- 主数据库：存储用户、会话、报告等数据
- 向量数据库：使用pgvector扩展，存储文档嵌入向量用于检索增强生成（RAG）

初始化脚本位于`backend/db/`目录。

## 部署到云服务器

### 阿里云ECS部署

1. 创建并连接到您的ECS实例
   ```bash
   ssh user@your-ecs-instance
   ```

2. 安装Docker和Docker Compose
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. 克隆仓库并部署
   ```bash
   git clone https://github.com/yourusername/industrial-cluster-assessment.git
   cd industrial-cluster-assessment
   cp .env.example .env
   # 编辑.env文件
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. 配置域名和SSL
   - 在阿里云控制台中将您的域名解析到ECS实例IP
   - 使用Let's Encrypt获取SSL证书
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   # 复制证书到Nginx目录
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   ```

5. 重启服务
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### AWS EC2部署

AWS EC2部署步骤与阿里云ECS类似，只需要根据AWS的特性进行一些调整：

1. 创建EC2实例，确保安全组开放80和443端口
2. 使用SSH连接到EC2实例
3. 按照上述步骤安装Docker和部署应用
4. 配置Route 53或其他DNS服务将域名指向EC2实例
5. 使用Let's Encrypt或AWS Certificate Manager配置SSL证书

## 维护和故障排除

### 查看日志
```bash
docker-compose logs -f app  # 查看应用日志
docker-compose logs -f db   # 查看数据库日志
docker-compose logs -f nginx  # 查看Nginx日志
```

### 备份数据
```bash
./scripts/backup.sh  # 执行数据库备份脚本
```

### 常见问题解决

1. API连接问题
   - 检查`.env`文件中的API密钥是否正确
   - 确认防火墙或安全组未阻止出站连接
   - 查看应用日志以获取详细错误信息

2. 数据库连接问题
   - 检查PostgreSQL容器是否正在运行
   - 验证数据库凭据是否正确
   - 检查数据库日志以获取更多信息

3. 性能优化
   - 增加服务器资源（CPU/内存）
   - 优化数据库查询和索引
   - 配置Nginx缓存以减少服务器负载

## 许可和贡献

本项目使用MIT许可证。欢迎贡献和提交问题。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 电子邮件：your-email@example.com
- 项目仓库：https://github.com/yourusername/industrial-cluster-assessment