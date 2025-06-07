# Windows 本地开发环境设置指南

## 📋 概述

本指南详细说明如何在Windows系统上使用VS Code设置本地开发环境，并最终部署到腾讯云Ubuntu 22.04服务器。

## 🛠️ 前置要求

### 必需软件
- **Node.js** (v18.0.0 或更高版本)
- **npm** (通常随Node.js一起安装)
- **Git** (用于版本控制)
- **VS Code** (推荐代码编辑器)
- **Docker Desktop** (用于容器化部署)

### 可选软件
- **Windows Terminal** (更好的命令行体验)
- **PowerShell 7** (现代PowerShell体验)

## 🚀 快速开始

### 1. 安装必需软件

#### Node.js 安装
```bash
# 访问 https://nodejs.org 下载LTS版本
# 或使用 chocolatey 安装
choco install nodejs

# 验证安装
node --version
npm --version
```

#### Git 安装
```bash
# 访问 https://git-scm.com 下载
# 或使用 chocolatey 安装
choco install git

# 验证安装
git --version
```

#### Docker Desktop 安装
```bash
# 访问 https://www.docker.com/products/docker-desktop 下载
# 安装后启动 Docker Desktop
docker --version
docker-compose --version
```

### 2. 克隆项目并设置

```bash
# 克隆项目（如果还没有）
git clone <your-repository-url>
cd industrial-cluster-assessment-system

# 安装前端依赖
npm install

# 复制环境变量文件
copy .env.example .env

# 编辑环境变量
notepad .env
```

### 3. 配置环境变量

编辑 `.env` 文件：

```env
# 前端配置
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=产业集群发展潜力评估系统

# OpenAI配置
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Claude配置  
VITE_CLAUDE_API_KEY=your_claude_api_key_here

# Dify配置
VITE_DIFY_API_KEY=your_dify_api_key_here
VITE_DIFY_BASE_URL=https://api.dify.ai/v1
VITE_DIFY_AGENT_ID=your_dify_agent_id_here
VITE_DEFAULT_AI_PROVIDER=dify

# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/industrial_cluster
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# 文件上传配置
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,docx,xlsx,csv,txt

# 开发模式配置
DEVELOPMENT_MODE=true
DEBUG=true
LOG_LEVEL=debug
```

## 🔧 VS Code 配置

### 推荐扩展

创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-python.python",
    "ms-vscode.vscode-docker",
    "ms-vscode.powershell",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

### VS Code 设置

创建 `.vscode/settings.json`：

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["className\\s*:\\s*[\"'`]([^\"'`]*)[\"'`]", "([^\"'`]*)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "typescript.suggest.autoImports": true,
  "python.defaultInterpreterPath": "./backend/venv/Scripts/python.exe",
  "python.terminal.activateEnvironment": true
}
```

### 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Attach to Chrome",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/main.py",
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

### 任务配置

创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Install Dependencies",
      "type": "shell",
      "command": "npm install",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Start Frontend Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Build Frontend",
      "type": "shell",
      "command": "npm run build",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Start Backend Server",
      "type": "shell",
      "command": "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Docker Compose Up",
      "type": "shell",
      "command": "docker-compose up -d",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Docker Compose Down",
      "type": "shell",
      "command": "docker-compose down",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

## 🏃‍♂️ 本地开发流程

### 方式一：前后端分离开发

#### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 创建Python虚拟环境（如果还没有）
python -m venv venv

# 激活虚拟环境
.\venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动FastAPI服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. 启动前端服务

```bash
# 在新的终端窗口中
npm run dev
```

#### 3. 访问应用

- 前端：http://localhost:5173
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

### 方式二：Docker容器化开发

#### 1. 构建并启动所有服务

```bash
# 构建并启动所有容器
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 2. 访问应用

- 应用：http://localhost:3000
- API：http://localhost:8000

## 🔍 开发工具和脚本

### 快速启动脚本

创建 `scripts/dev-start.bat`：

```batch
@echo off
echo 🚀 启动产业集群评估系统开发环境...

echo.
echo 📦 检查依赖...
call npm install

echo.
echo 🐋 启动Docker服务...
docker-compose up -d postgres redis

echo.
echo ⏰ 等待数据库启动...
timeout /t 10

echo.
echo 🖥️ 启动后端服务...
start "Backend Server" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ⏰ 等待后端启动...
timeout /t 5

echo.
echo 🌐 启动前端服务...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ 开发环境启动完成！
echo.
echo 📱 前端地址: http://localhost:5173
echo 🔧 后端地址: http://localhost:8000
echo 📚 API文档: http://localhost:8000/docs
echo.
pause
```

### 构建脚本

创建 `scripts/build-local.bat`：

```batch
@echo off
echo 🔨 构建产业集群评估系统...

echo.
echo 📦 安装依赖...
call npm install

echo.
echo 🏗️ 构建前端...
call npm run build

echo.
echo 🐋 构建Docker镜像...
docker-compose build

echo.
echo ✅ 构建完成！
echo.
echo 运行以下命令启动应用:
echo docker-compose up -d
pause
```

### 清理脚本

创建 `scripts/cleanup.bat`：

```batch
@echo off
echo 🧹 清理开发环境...

echo.
echo 🛑 停止所有容器...
docker-compose down

echo.
echo 🗑️ 清理Docker资源...
docker system prune -f

echo.
echo 📁 清理node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo 📁 清理dist目录...
if exist dist rmdir /s /q dist

echo.
echo ✅ 清理完成！
pause
```

## 🧪 测试和调试

### 前端测试

```bash
# 运行类型检查
npm run build

# 运行linting
npm run lint

# 预览生产构建
npm run preview
```

### 后端测试

```bash
# 进入后端目录
cd backend

# 激活虚拟环境
.\venv\Scripts\activate

# 运行测试（如果有）
pytest

# 检查代码风格
flake8 .

# 类型检查
mypy .
```

### API测试

使用VS Code的REST Client扩展，创建 `api-tests.http`：

```http
### 健康检查
GET http://localhost:8000/health

### 用户注册
POST http://localhost:8000/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpassword"
}

### 用户登录
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpassword"
}
```

## 📦 打包和部署准备

### 1. 前端构建

```bash
npm run build
```

### 2. Docker镜像构建

```bash
# 构建所有服务
docker-compose build

# 或单独构建
docker build -t industrial-cluster-frontend .
```

### 3. 验证构建

```bash
# 运行完整的Docker环境
docker-compose up -d

# 检查所有服务状态
docker-compose ps

# 查看日志
docker-compose logs
```

## 🔧 常见问题解决

### Node.js版本问题

```bash
# 使用nvm管理Node版本（需要先安装nvm-windows）
nvm install 18.17.0
nvm use 18.17.0
```

### 端口冲突

```bash
# 检查端口占用
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# 终止进程
taskkill /PID <PID> /F
```

### Docker问题

```bash
# 重启Docker Desktop
# 清理Docker缓存
docker system prune -a

# 重建镜像
docker-compose build --no-cache
```

### 依赖安装问题

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules和重新安装
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 🎯 开发最佳实践

### 1. Git工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature
```

### 2. 代码规范

- 使用TypeScript严格模式
- 遵循ESLint和Prettier规则
- 组件使用PascalCase命名
- 文件使用kebab-case命名
- 及时添加类型注解

### 3. 性能优化

- 使用React.memo优化组件渲染
- 合理使用useMemo和useCallback
- 图片资源优化
- 懒加载非关键组件

### 4. 安全考虑

- 不在前端存储敏感信息
- API调用添加适当的错误处理
- 输入验证和清理
- 正确使用环境变量

下一步：查看 [腾讯云部署指南](./TENCENT_CLOUD_DEPLOYMENT.md) 了解如何部署到生产环境。