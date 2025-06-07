@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   产业集群评估系统 - 快速功能测试
echo ==========================================
echo.

set "SUCCESS=[成功]"
set "ERROR=[错误]"
set "INFO=[信息]"

echo %INFO% 开始功能测试...
echo.

REM 1. 检查Node.js环境
echo %INFO% 检查Node.js环境...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo %ERROR% Node.js 未安装或配置不正确
    goto :error
)
echo %SUCCESS% Node.js 环境正常

REM 2. 检查项目依赖
echo %INFO% 检查项目依赖...
if not exist "node_modules" (
    echo %INFO% 安装项目依赖...
    call npm install
    if %errorLevel% neq 0 (
        echo %ERROR% 依赖安装失败
        goto :error
    )
)
echo %SUCCESS% 项目依赖正常

REM 3. 检查环境变量
echo %INFO% 检查环境变量...
if not exist ".env" (
    echo %INFO% 创建环境变量文件...
    copy .env.example .env >nul 2>&1
    if %errorLevel% neq 0 (
        echo %ERROR% 无法创建环境变量文件
        goto :error
    )
    echo %INFO% 请编辑 .env 文件配置您的API密钥
)
echo %SUCCESS% 环境变量文件存在

REM 4. TypeScript编译测试
echo %INFO% 进行TypeScript编译测试...
call npx tsc --noEmit
if %errorLevel% neq 0 (
    echo %ERROR% TypeScript编译失败，请检查代码错误
    goto :error
)
echo %SUCCESS% TypeScript编译通过

REM 5. 构建测试
echo %INFO% 进行构建测试...
call npm run build
if %errorLevel% neq 0 (
    echo %ERROR% 项目构建失败
    goto :error
)
echo %SUCCESS% 项目构建成功

REM 6. 检查构建产物
echo %INFO% 检查构建产物...
if not exist "dist" (
    echo %ERROR% 构建目录不存在
    goto :error
)
if not exist "dist\index.html" (
    echo %ERROR% 主页面文件未生成
    goto :error
)
echo %SUCCESS% 构建产物正常

REM 7. 检查Docker环境（可选）
echo %INFO% 检查Docker环境...
docker --version >nul 2>&1
if %errorLevel% neq 0 (
    echo %INFO% Docker 未安装，跳过Docker测试
) else (
    echo %SUCCESS% Docker 环境可用
    
    echo %INFO% 测试Docker构建...
    docker-compose build >nul 2>&1
    if %errorLevel% neq 0 (
        echo %ERROR% Docker镜像构建失败
        goto :error
    )
    echo %SUCCESS% Docker镜像构建成功
)

echo.
echo ==========================================
echo %SUCCESS% 所有测试通过！系统已准备就绪
echo ==========================================
echo.
echo 📋 下一步操作:
echo   1. 编辑 .env 文件配置API密钥
echo   2. 运行 quick-start.bat 启动开发服务器
echo   3. 访问 http://localhost:5173 测试应用
echo   4. 参考文档进行生产环境部署
echo.
echo 📚 相关文档:
echo   • docs\WINDOWS_LOCAL_DEVELOPMENT.md
echo   • docs\TENCENT_CLOUD_DEPLOYMENT.md
echo.
goto :end

:error
echo.
echo ==========================================
echo %ERROR% 测试失败！请解决以上问题后重试
echo ==========================================
echo.
echo 🔧 故障排除建议:
echo   1. 确保Node.js版本为18.0.0或更高
echo   2. 检查网络连接，确保能正常下载依赖
echo   3. 查看错误信息，修复代码问题
echo   4. 查阅文档或联系技术支持
echo.
pause
exit /b 1

:end
pause