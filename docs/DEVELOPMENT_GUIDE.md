# 产业集群发展潜力评估系统 - 开发与部署指南

## 项目概述

这是一个基于React + FastAPI的产业集群发展潜力评估系统，支持AI对话分析、数据可视化、报告生成等功能。

### 技术栈
- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS v4 + shadcn/ui
- **路由**: React Router v6
- **状态管理**: React Context
- **图表**: Recharts
- **后端**: FastAPI + Python
- **数据库**: PostgreSQL + Redis
- **AI服务**: OpenAI/Claude API
- **部署**: Docker + Nginx

## 📁 项目文件结构详解

### 根目录文件
```
├── App.tsx                    # 应用主入口组件
├── main.tsx                   # Vite应用启动入口
├── index.html                 # HTML模板
├── package.json               # NPM依赖配置
├── vite.config.ts            # Vite构建配置
├── tsconfig.json             # TypeScript配置
├── tailwind.config.js        # Tailwind CSS配置
├── postcss.config.js         # PostCSS配置
├── docker-compose.yml        # Docker编排配置
├── Dockerfile                # Docker镜像构建文件
└── .env.example              # 环境变量示例
```

### 核心目录结构

#### `/components` - React组件
```
components/
├── ui/                       # shadcn/ui基础组件库
│   ├── button.tsx           # 按钮组件
│   ├── card.tsx             # 卡片组件
│   ├── dialog.tsx           # 对话框组件
│   └── ...                  # 其他UI组件
├── pages/                   # 页面组件
│   ├── HomePage.tsx         # 首页
│   ├── ChatPage.tsx         # 对话页面
│   ├── AdminPage.tsx        # 管理员页面
│   └── ...                  # 其他页面
├── visualizations/          # 数据可视化组件
│   ├── BarChart.tsx         # 柱状图
│   ├── PieChart.tsx         # 饼图
│   └── ...                  # 其他图表
├── Navigation.tsx           # 导航组件
├── ChatInput.tsx           # 聊天输入组件
├── DataUploadDialog.tsx    # 数据上传对话框
└── ...                     # 其他功能组件
```

#### `/services` - 业务逻辑服务
```
services/
├── ApiService.ts            # API请求封装
├── AuthService.ts           # 用户认证服务
├── OpenAIService.ts         # OpenAI集成服务
├── DataUploadService.ts     # 数据上传服务
├── TemplateService.ts       # 模板管理服务
└── VisualizationDataService.ts # 可视化数据服务
```

#### `/context` - React上下文
```
context/
└── AuthContext.tsx          # 用户认证上下文
```

#### `/backend` - 后端服务
```
backend/
├── main.py                  # FastAPI主入口
├── models/                  # AI模型处理
├── rag/                     # RAG文档处理
├── reports/                 # 报告生成
├── db/                      # 数据库初始化
└── requirements.txt         # Python依赖
```

### 功能模块介绍

#### 1. 用户认证系统
- **登录/注册**: `/components/pages/LoginPage.tsx`, `/RegisterPage.tsx`
- **权限控制**: `/components/ProtectedRoute.tsx`
- **角色管理**: 支持管理员、园区管理员、研究人员、普通用户四种角色

#### 2. AI对话系统
- **智能对话**: `/components/pages/ChatPage.tsx`
- **消息历史**: `/components/ChatHistory.tsx`
- **AI服务集成**: `/services/OpenAIService.ts`

#### 3. 数据管理
- **数据上传**: `/components/DataUploadDialog.tsx`
- **批量处理**: `/components/BatchProcessDialog.tsx`
- **文件验证**: 支持CSV、Excel、JSON格式

#### 4. 数据可视化
- **图表组件**: `/components/visualizations/`
- **仪表板**: `/components/VisualizationDashboard.tsx`
- **报表生成**: `/components/ReportGenerator.tsx`

#### 5. 模板系统
- **模板管理**: `/components/pages/TemplatesPage.tsx`
- **模板预览**: `/components/TemplatePreview.tsx`
- **报告模板**: `/components/ReportTemplate.tsx`

#### 6. 管理功能
- **用户管理**: `/components/admin/UserManagement.tsx`
- **系统监控**: `/components/ConnectionStatusBar.tsx`

## 🚀 本地开发环境搭建（Windows + VS Code）

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- VS Code
- Git

### 1. 安装Node.js
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载并安装LTS版本（推荐18.17.0+）
3. 验证安装：
```bash
node --version
npm --version
```

### 2. 克隆项目（如果是从仓库获取）
```bash
git clone <your-repository-url>
cd industrial-cluster-assessment
```

### 3. 安装依赖
```bash
# 安装前端依赖
npm install

# 如果使用yarn
yarn install
```

### 4. 环境变量配置
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件，配置必要的环境变量
```

`.env` 文件示例：
```env
# API配置
VITE_API_BASE_URL=http://localhost:8000
VITE_MOCK_MODE=true

# OpenAI配置
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_ORGANIZATION_ID=your_org_id
VITE_OPENAI_PROJECT_ID=your_project_id

# 应用配置
VITE_APP_TITLE=产业集群发展潜力评估系统
VITE_APP_VERSION=1.0.0
```

### 5. VS Code配置

#### 推荐扩展
```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code设置
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 6. 启动开发服务器
```bash
# 启动前端开发服务器
npm run dev

# 或使用yarn
yarn dev
```

浏览器访问: `http://localhost:5173`

### 7. 启动后端服务（可选）
```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Windows）
venv\Scripts\activate

# 安装Python依赖
pip install -r requirements.txt

# 启动FastAPI服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🧪 本地测试步骤

### 1. 功能测试清单

#### 基础功能测试
- [ ] 应用启动正常
- [ ] 页面路由正常跳转
- [ ] 用户认证流程（登录/注册）
- [ ] 主页界面显示正常

#### 核心功能测试
- [ ] AI对话功能
- [ ] 数据上传功能
- [ ] 批量处理功能
- [ ] 数据可视化图表
- [ ] 模板生成和预览

#### 响应式测试
- [ ] 桌面端显示
- [ ] 平板端显示
- [ ] 移动端显示

### 2. 调试技巧

#### 浏览器开发者工具
```javascript
// 在组件中添加调试日志
console.log('Component state:', state);
console.error('API Error:', error);
```

#### React Developer Tools
安装浏览器扩展：React Developer Tools

#### 网络请求调试
在开发者工具的Network标签页查看API请求状态

### 3. 常见问题解决

#### 依赖安装问题
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 端口冲突
```bash
# 修改端口启动
npm run dev -- --port 3000
```

## 🌐 腾讯云服务器部署指南

### 服务器要求
- Ubuntu 22.04 LTS
- 2核4GB内存（最低配置）
- 20GB磁盘空间
- 开放端口：22(SSH), 80(HTTP), 443(HTTPS), 8000(API)

### 1. 服务器初始化

#### 连接服务器
```bash
# 使用SSH连接
ssh root@your-server-ip
```

#### 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

#### 安装基础软件
```bash
# 安装必要工具
sudo apt install -y curl wget git vim ufw

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装Docker和Docker Compose

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用户到docker组
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 3. 配置防火墙

```bash
# 启用UFW
sudo ufw enable

# 允许SSH
sudo ufw allow ssh

# 允许HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 允许API端口
sudo ufw allow 8000

# 查看状态
sudo ufw status
```

### 4. 部署应用

#### 上传代码
```bash
# 方法1：使用Git
git clone <your-repository-url> /opt/industrial-cluster-assessment
cd /opt/industrial-cluster-assessment

# 方法2：使用SCP上传
# 在本地执行
scp -r ./ root@your-server-ip:/opt/industrial-cluster-assessment/
```

#### 配置环境变量
```bash
cd /opt/industrial-cluster-assessment

# 复制环境变量文件
cp .env.example .env

# 编辑生产环境配置
vim .env
```

生产环境 `.env` 配置：
```env
# API配置
VITE_API_BASE_URL=https://your-domain.com/api
VITE_MOCK_MODE=false

# OpenAI配置
VITE_OPENAI_API_KEY=your_production_openai_key
VITE_OPENAI_ORGANIZATION_ID=your_org_id
VITE_OPENAI_PROJECT_ID=your_project_id

# 数据库配置
DATABASE_URL=postgresql://user:password@db:5432/industrial_cluster
REDIS_URL=redis://redis:6379

# 安全配置
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGINS=https://your-domain.com
```

### 5. Docker部署

#### 构建和启动服务
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### Docker Compose配置示例
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx/conf.d
    depends_on:
      - backend
    environment:
      - NODE_ENV=production

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/industrial_cluster
      - REDIS_URL=redis://redis:6379

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=industrial_cluster
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 6. 配置Nginx（SSL证书）

#### 申请SSL证书
```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com
```

#### Nginx配置
```nginx
# nginx/default.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. 设置自动启动

#### 创建systemd服务
```bash
sudo vim /etc/systemd/system/industrial-cluster.service
```

```ini
[Unit]
Description=Industrial Cluster Assessment System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/industrial-cluster-assessment
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# 启用服务
sudo systemctl enable industrial-cluster.service
sudo systemctl start industrial-cluster.service

# 检查状态
sudo systemctl status industrial-cluster.service
```

### 8. 监控和维护

#### 日志管理
```bash
# 查看应用日志
docker-compose logs -f frontend
docker-compose logs -f backend

# 查看系统日志
sudo journalctl -u industrial-cluster.service -f
```

#### 备份脚本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec db pg_dump -U postgres industrial_cluster > $BACKUP_DIR/db_$DATE.sql

# 备份应用代码
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/industrial-cluster-assessment

# 清理旧备份（保留7天）
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

#### 自动备份
```bash
# 添加到crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /opt/scripts/backup.sh
```

## 🔧 开发最佳实践

### 1. 代码规范
- 使用TypeScript严格模式
- 遵循React Hooks规范
- 组件采用函数式组件
- 使用ESLint和Prettier

### 2. 性能优化
- 使用React.memo优化组件渲染
- 合理使用useMemo和useCallback
- 图片懒加载
- 代码分割

### 3. 错误处理
- 使用Error Boundary
- API错误统一处理
- 用户友好的错误提示

### 4. 测试策略
- 单元测试：Jest + React Testing Library
- 集成测试：Cypress
- 端到端测试：Playwright

## 📚 学习资源

### React学习
- [React官方文档](https://react.dev/)
- [TypeScript官方文档](https://www.typescriptlang.org/)
- [Vite官方文档](https://vitejs.dev/)

### UI组件库
- [shadcn/ui文档](https://ui.shadcn.com/)
- [Tailwind CSS文档](https://tailwindcss.com/)

### 部署相关
- [Docker官方文档](https://docs.docker.com/)
- [腾讯云文档](https://cloud.tencent.com/document)

## 🆘 常见问题解决

### 开发环境问题
1. **端口被占用**: 修改vite.config.ts中的端口配置
2. **依赖冲突**: 删除node_modules重新安装
3. **TypeScript错误**: 检查tsconfig.json配置

### 部署问题
1. **Docker构建失败**: 检查Dockerfile和网络连接
2. **SSL证书问题**: 确认域名解析正确
3. **数据库连接失败**: 检查数据库配置和网络

### 性能问题
1. **页面加载慢**: 启用gzip压缩，优化图片
2. **API响应慢**: 检查后端服务状态
3. **内存占用高**: 检查是否有内存泄漏

希望这份指南能帮助您顺利搭建和部署产业集群评估系统！如有问题，请及时反馈。