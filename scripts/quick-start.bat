@echo off
REM 产业集群发展潜力评估系统 - Windows快速启动脚本
chcp 65001 >nul

echo 🚀 产业集群发展潜力评估系统 - 快速启动
echo ================================================
echo.

REM 颜色定义（Windows CMD有限支持）
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

:check_requirements
echo %INFO% 检查系统要求...

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% Node.js未安装！请安装Node.js 18+版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %SUCCESS% Node.js已安装: %NODE_VERSION%
)

REM 检查npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% npm未安装！
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo %SUCCESS% npm已安装: %NPM_VERSION%
)

REM 检查Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %WARNING% Git未安装，某些功能可能受限
) else (
    echo %SUCCESS% Git已安装
)

REM 检查Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %WARNING% Docker未安装，将无法使用容器化部署
    set DOCKER_AVAILABLE=false
) else (
    echo %SUCCESS% Docker已安装
    set DOCKER_AVAILABLE=true
)

echo.

:setup_environment
echo %INFO% 设置环境变量...

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo %SUCCESS% 已创建.env文件
    echo.
    echo %WARNING% 请编辑.env文件，配置必要的API密钥：
    echo - VITE_OPENAI_API_KEY: OpenAI API密钥
    echo - VITE_OPENAI_ORGANIZATION_ID: OpenAI组织ID
    echo - VITE_OPENAI_PROJECT_ID: OpenAI项目ID
    echo.
    
    set /p "edit_env=是否现在编辑.env文件？(y/n): "
    if /i "%edit_env%"=="y" (
        REM 尝试使用不同的编辑器
        where code >nul 2>&1
        if %errorlevel% equ 0 (
            start code .env
        ) else (
            notepad .env
        )
    )
) else (
    echo %SUCCESS% .env文件已存在
)

echo.

:install_dependencies
echo %INFO% 安装项目依赖...

if exist "package-lock.json" (
    npm ci
) else (
    npm install
)

if %errorlevel% neq 0 (
    echo %ERROR% 依赖安装失败！
    pause
    exit /b 1
)

echo %SUCCESS% 依赖安装完成
echo.

:start_services
REM 询问启动方式
echo 选择启动方式：
echo 1. 开发模式（推荐）
echo 2. Docker模式
echo 3. 仅构建项目
echo.

set /p "start_mode=请选择 (1-3): "

if "%start_mode%"=="1" goto start_development
if "%start_mode%"=="2" goto start_docker
if "%start_mode%"=="3" goto build_project

echo 无效选择，使用默认开发模式
goto start_development

:start_docker
if "%DOCKER_AVAILABLE%"=="false" (
    echo %ERROR% Docker未安装，无法使用Docker模式
    goto start_development
)

echo %INFO% 使用Docker Compose启动服务...

if not exist "docker-compose.yml" (
    echo %ERROR% docker-compose.yml文件不存在
    goto start_development
)

docker-compose up --build -d

if %errorlevel% neq 0 (
    echo %ERROR% Docker启动失败，切换到开发模式
    goto start_development
)

echo %SUCCESS% Docker服务已启动
echo.
echo %INFO% 服务地址:
echo - 应用: http://localhost
echo - API: http://localhost:8000
echo.
echo %INFO% 查看日志: docker-compose logs -f
echo %INFO% 停止服务: docker-compose down
echo.
goto show_help

:build_project
echo %INFO% 构建生产版本...
npm run build

if %errorlevel% neq 0 (
    echo %ERROR% 构建失败！
    pause
    exit /b 1
)

echo %SUCCESS% 构建完成！
echo 构建文件位置: dist/
echo.
goto show_help

:start_development
echo %INFO% 启动开发服务器...
echo.
echo %SUCCESS% 🎉 项目设置完成！
echo.
echo %INFO% 开发服务器将在以下地址启动:
echo - 前端: http://localhost:5173
echo - 后端: http://localhost:8000 (如果启动)
echo.
echo %INFO% 按 Ctrl+C 停止服务器
echo.

REM 检查是否需要启动后端
if exist "backend" (
    echo %INFO% 检测到后端目录
    set /p "start_backend=是否启动后端服务？(y/n): "
    if /i "%start_backend%"=="y" (
        call :start_backend_service
    )
)

REM 启动前端开发服务器
npm run dev

goto show_help

:start_backend_service
echo %INFO% 启动后端服务...

cd backend

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %WARNING% Python未安装，无法启动后端服务
    cd ..
    goto :eof
)

if not exist "venv" (
    echo %INFO% 创建Python虚拟环境...
    python -m venv venv
    echo %SUCCESS% Python虚拟环境已创建
)

echo %INFO% 激活虚拟环境并安装依赖...
call venv\Scripts\activate.bat

if exist "requirements.txt" (
    pip install -r requirements.txt
    echo %SUCCESS% Python依赖安装完成
)

echo %INFO% 启动FastAPI服务器...
start "Backend Server" cmd /k "venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

cd ..
echo %SUCCESS% 后端服务已启动
goto :eof

:show_help
echo.
echo %INFO% 📋 常用命令:
echo npm run dev              - 启动开发服务器
echo npm run build            - 构建生产版本
echo npm run preview          - 预览生产版本
echo npm run lint             - 代码检查
echo docker-compose up        - Docker启动
echo docker-compose down      - Docker停止
echo.
echo %INFO% 📚 文档位置:
echo docs\DEVELOPMENT_GUIDE.md - 完整开发指南
echo README.md                - 项目说明
echo.
echo 按任意键退出...
pause >nul
exit /b 0