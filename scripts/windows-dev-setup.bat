@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Windows开发环境一键安装脚本
REM 适用于产业集群发展潜力评估系统

echo.
echo ==========================================
echo   产业集群评估系统 - Windows开发环境安装
echo ==========================================
echo.

REM 颜色定义（使用echo的不同方式来模拟颜色）
set "INFO=[信息]"
set "SUCCESS=[成功]"
set "WARNING=[警告]"
set "ERROR=[错误]"

echo %INFO% 开始设置Windows开发环境...
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo %WARNING% 检测到当前不是管理员权限
    echo %WARNING% 某些功能可能需要管理员权限才能正常工作
    echo.
    pause
)

REM 1. 检查必需软件
echo %INFO% 检查必需软件安装状态...
echo.

REM 检查Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo %WARNING% Node.js 未安装
    echo %INFO% 请访问 https://nodejs.org 下载并安装 Node.js LTS 版本
    echo %INFO% 或使用 Chocolatey 安装: choco install nodejs
    set NEED_NODEJS=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %SUCCESS% Node.js 已安装: !NODE_VERSION!
)

REM 检查Git
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo %WARNING% Git 未安装
    echo %INFO% 请访问 https://git-scm.com 下载并安装 Git
    echo %INFO% 或使用 Chocolatey 安装: choco install git
    set NEED_GIT=1
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo %SUCCESS% Git 已安装: !GIT_VERSION!
)

REM 检查Docker
docker --version >nul 2>&1
if %errorLevel% neq 0 (
    echo %WARNING% Docker 未安装
    echo %INFO% 请访问 https://www.docker.com/products/docker-desktop 下载安装
    set NEED_DOCKER=1
) else (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo %SUCCESS% Docker 已安装: !DOCKER_VERSION!
)

REM 检查VS Code
code --version >nul 2>&1
if %errorLevel% neq 0 (
    echo %WARNING% VS Code 未安装
    echo %INFO% 请访问 https://code.visualstudio.com 下载并安装
    set NEED_VSCODE=1
) else (
    echo %SUCCESS% VS Code 已安装
)

echo.

REM 如果有缺失的软件，提示用户
if defined NEED_NODEJS (echo %ERROR% 缺少 Node.js)
if defined NEED_GIT (echo %ERROR% 缺少 Git)
if defined NEED_DOCKER (echo %ERROR% 缺少 Docker)
if defined NEED_VSCODE (echo %ERROR% 缺少 VS Code)

if defined NEED_NODEJS (
    echo.
    echo %INFO% 安装必需软件后请重新运行此脚本
    pause
    exit /b 1
)

echo %SUCCESS% 所有必需软件检查完成
echo.

REM 2. 项目设置
echo %INFO% 设置项目环境...

REM 检查是否在项目目录
if not exist "package.json" (
    echo %ERROR% 未在项目根目录运行脚本
    echo %INFO% 请确保在包含 package.json 的目录中运行此脚本
    pause
    exit /b 1
)

echo %SUCCESS% 项目目录检查通过

REM 3. 安装项目依赖
echo.
echo %INFO% 安装前端依赖...
call npm install
if %errorLevel% neq 0 (
    echo %ERROR% 前端依赖安装失败
    pause
    exit /b 1
)
echo %SUCCESS% 前端依赖安装完成

REM 4. 环境变量配置
echo.
echo %INFO% 配置环境变量...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo %SUCCESS% 已创建 .env 文件，基于 .env.example 模板
        echo %WARNING% 请编辑 .env 文件配置您的API密钥和其他设置
    ) else (
        echo %WARNING% 未找到 .env.example 文件
        echo %INFO% 请手动创建 .env 文件并配置必要的环境变量
    )
) else (
    echo %SUCCESS% .env 文件已存在
)

REM 5. VS Code配置
echo.
echo %INFO% 配置VS Code开发环境...

REM 创建VS Code配置目录
if not exist ".vscode" mkdir .vscode

REM 创建扩展推荐列表
echo %INFO% 创建VS Code扩展推荐列表...
(
echo {
echo   "recommendations": [
echo     "ms-vscode.vscode-typescript-next",
echo     "bradlc.vscode-tailwindcss",
echo     "esbenp.prettier-vscode",
echo     "ms-vscode.vscode-eslint",
echo     "ms-python.python",
echo     "ms-vscode.vscode-docker",
echo     "ms-vscode.powershell",
echo     "formulahendry.auto-rename-tag",
echo     "christian-kohler.path-intellisense"
echo   ]
echo }
) > .vscode\extensions.json

REM 创建VS Code设置
echo %INFO% 创建VS Code工作区设置...
(
echo {
echo   "typescript.preferences.includePackageJsonAutoImports": "on",
echo   "editor.formatOnSave": true,
echo   "editor.codeActionsOnSave": {
echo     "source.fixAll.eslint": true,
echo     "source.organizeImports": true
echo   },
echo   "files.associations": {
echo     "*.css": "tailwindcss"
echo   },
echo   "tailwindCSS.experimental.classRegex": [
echo     ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
echo     ["className\\s*:\\s*[\"'`]([^\"'`]*)[\"'`]", "([^\"'`]*)"],
echo     ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
echo   ],
echo   "emmet.includeLanguages": {
echo     "typescript": "html",
echo     "typescriptreact": "html"
echo   },
echo   "typescript.suggest.autoImports": true
echo }
) > .vscode\settings.json

REM 创建调试配置
echo %INFO% 创建调试配置...
(
echo {
echo   "version": "0.2.0",
echo   "configurations": [
echo     {
echo       "name": "Launch Chrome",
echo       "type": "chrome",
echo       "request": "launch",
echo       "url": "http://localhost:5173",
echo       "webRoot": "${workspaceFolder}"
echo     }
echo   ]
echo }
) > .vscode\launch.json

REM 创建任务配置
echo %INFO% 创建VS Code任务配置...
(
echo {
echo   "version": "2.0.0",
echo   "tasks": [
echo     {
echo       "label": "Install Dependencies",
echo       "type": "shell",
echo       "command": "npm install",
echo       "group": "build"
echo     },
echo     {
echo       "label": "Start Dev Server",
echo       "type": "shell",
echo       "command": "npm run dev",
echo       "group": "build"
echo     },
echo     {
echo       "label": "Build Project",
echo       "type": "shell",
echo       "command": "npm run build",
echo       "group": "build"
echo     },
echo     {
echo       "label": "Docker Compose Up",
echo       "type": "shell",
echo       "command": "docker-compose up -d",
echo       "group": "build"
echo     }
echo   ]
echo }
) > .vscode\tasks.json

echo %SUCCESS% VS Code配置完成

REM 6. 创建开发脚本
echo.
echo %INFO% 创建开发工具脚本...

if not exist "scripts" mkdir scripts

REM 创建快速启动脚本
echo %INFO% 创建快速启动脚本...
(
echo @echo off
echo echo 🚀 启动产业集群评估系统开发环境...
echo echo.
echo echo 📦 检查依赖...
echo call npm install
echo echo.
echo echo 🌐 启动前端开发服务器...
echo start "Frontend Dev Server" cmd /k "npm run dev"
echo echo.
echo echo ✅ 开发环境启动完成！
echo echo 📱 前端地址: http://localhost:5173
echo echo.
echo pause
) > scripts\dev-start.bat

REM 创建构建脚本
echo %INFO% 创建构建脚本...
(
echo @echo off
echo echo 🔨 构建产业集群评估系统...
echo echo.
echo echo 📦 安装依赖...
echo call npm install
echo echo.
echo echo 🏗️ 构建前端...
echo call npm run build
echo echo.
echo echo ✅ 构建完成！
echo echo 📁 构建文件位于: dist 目录
echo pause
) > scripts\build.bat

REM 创建清理脚本
echo %INFO% 创建清理脚本...
(
echo @echo off
echo echo 🧹 清理开发环境...
echo echo.
echo echo 📁 清理node_modules...
echo if exist node_modules rmdir /s /q node_modules
echo echo.
echo echo 📁 清理dist目录...
echo if exist dist rmdir /s /q dist
echo echo.
echo echo 📦 重新安装依赖...
echo call npm install
echo echo.
echo echo ✅ 清理完成！
echo pause
) > scripts\clean.bat

echo %SUCCESS% 开发脚本创建完成

REM 7. Docker环境检查
echo.
echo %INFO% 检查Docker环境...

docker info >nul 2>&1
if %errorLevel% neq 0 (
    echo %WARNING% Docker服务未运行或无法连接
    echo %INFO% 请启动Docker Desktop
    echo %INFO% 如需使用Docker开发环境，请确保Docker正常运行
) else (
    echo %SUCCESS% Docker环境正常
    
    echo %INFO% 检查Docker Compose配置...
    if exist "docker-compose.yml" (
        echo %SUCCESS% 找到Docker Compose配置文件
        
        echo %INFO% 创建Docker开发脚本...
        (
        echo @echo off
        echo echo 🐋 启动Docker开发环境...
        echo echo.
        echo echo 🔨 构建Docker镜像...
        echo docker-compose build
        echo echo.
        echo echo 🚀 启动所有服务...
        echo docker-compose up -d
        echo echo.
        echo echo 📊 查看服务状态...
        echo docker-compose ps
        echo echo.
        echo echo ✅ Docker环境启动完成！
        echo echo 📱 应用地址: http://localhost:3000
        echo echo 🔧 API地址: http://localhost:8000
        echo echo.
        echo echo 查看日志: docker-compose logs -f
        echo pause
        ) > scripts\docker-start.bat
        
        (
        echo @echo off
        echo echo 🛑 停止Docker开发环境...
        echo docker-compose down
        echo echo ✅ Docker环境已停止
        echo pause
        ) > scripts\docker-stop.bat
        
        echo %SUCCESS% Docker开发脚本创建完成
    )
)

REM 8. 后端环境设置（如果存在）
echo.
if exist "backend" (
    echo %INFO% 检测到后端目录，设置Python环境...
    
    python --version >nul 2>&1
    if %errorLevel% neq 0 (
        echo %WARNING% Python 未安装
        echo %INFO% 请访问 https://python.org 下载并安装 Python 3.8+
    ) else (
        echo %SUCCESS% Python 已安装
        
        REM 创建后端启动脚本
        echo %INFO% 创建后端启动脚本...
        (
        echo @echo off
        echo echo 🐍 启动后端服务...
        echo cd backend
        echo echo.
        echo echo 📦 检查虚拟环境...
        echo if not exist "venv" ^(
        echo     echo 创建Python虚拟环境...
        echo     python -m venv venv
        echo ^)
        echo echo.
        echo echo 🔧 激活虚拟环境...
        echo call venv\Scripts\activate
        echo echo.
        echo echo 📦 安装依赖...
        echo pip install -r requirements.txt
        echo echo.
        echo echo 🚀 启动FastAPI服务器...
        echo uvicorn main:app --reload --host 0.0.0.0 --port 8000
        ) > scripts\backend-start.bat
        
        echo %SUCCESS% 后端脚本创建完成
    )
)

REM 9. 创建一键启动脚本
echo.
echo %INFO% 创建一键启动脚本...
(
echo @echo off
echo title 产业集群评估系统 - 开发环境
echo echo.
echo echo ==========================================
echo echo   产业集群评估系统 - 开发环境启动器
echo echo ==========================================
echo echo.
echo echo 请选择启动方式:
echo echo 1. 前端开发服务器 ^(推荐^)
echo echo 2. Docker完整环境
echo echo 3. 前端 + 后端分离开发
echo echo 4. 退出
echo echo.
echo set /p choice=请输入选择 ^(1-4^): 
echo.
echo if "%%choice%%"=="1" goto frontend
echo if "%%choice%%"=="2" goto docker
echo if "%%choice%%"=="3" goto separate
echo if "%%choice%%"=="4" goto exit
echo goto start
echo.
echo :frontend
echo echo 🌐 启动前端开发服务器...
echo call scripts\dev-start.bat
echo goto end
echo.
echo :docker
echo echo 🐋 启动Docker完整环境...
echo if exist scripts\docker-start.bat ^(
echo     call scripts\docker-start.bat
echo ^) else ^(
echo     echo Docker脚本不存在，请检查Docker环境
echo     pause
echo ^)
echo goto end
echo.
echo :separate
echo echo 🔧 启动前端和后端分离开发...
echo start "Frontend" cmd /c "scripts\dev-start.bat"
echo if exist scripts\backend-start.bat ^(
echo     start "Backend" cmd /c "scripts\backend-start.bat"
echo ^) else ^(
echo     echo 后端脚本不存在，仅启动前端
echo ^)
echo goto end
echo.
echo :exit
echo exit /b 0
echo.
echo :end
echo echo.
echo echo 开发环境启动完成！
echo pause
) > quick-start.bat

echo %SUCCESS% 一键启动脚本创建完成

REM 10. 完成设置
echo.
echo ==========================================
echo %SUCCESS% Windows开发环境设置完成！
echo ==========================================
echo.
echo 📋 可用的开发工具:
echo   • quick-start.bat          - 一键启动开发环境
echo   • scripts\dev-start.bat    - 启动前端开发服务器
echo   • scripts\build.bat        - 构建项目
echo   • scripts\clean.bat        - 清理项目
if exist scripts\docker-start.bat echo   • scripts\docker-start.bat  - 启动Docker环境
if exist scripts\backend-start.bat echo   • scripts\backend-start.bat - 启动后端服务
echo.
echo 📝 下一步操作:
echo   1. 编辑 .env 文件配置API密钥
echo   2. 运行 quick-start.bat 启动开发环境
echo   3. 在VS Code中打开项目开始开发
echo.
echo 📚 开发文档:
echo   • docs\WINDOWS_LOCAL_DEVELOPMENT.md - 详细开发指南
echo   • docs\TENCENT_CLOUD_DEPLOYMENT.md - 部署指南
echo.
echo 🆘 如遇问题，请查看相关文档或联系技术支持
echo.

REM 询问是否立即启动开发环境
set /p start_now=是否现在启动开发环境？(y/n): 
if /i "!start_now!"=="y" (
    echo.
    echo 🚀 启动开发环境...
    start quick-start.bat
)

echo.
echo 感谢使用产业集群发展潜力评估系统！
pause