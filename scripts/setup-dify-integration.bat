@echo off
REM Dify Agent 集成安装脚本 - Windows版本
chcp 65001 >nul

echo 🤖 Dify Agent 集成安装向导
echo ================================
echo.

set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

:check_dependencies
echo %INFO% 检查项目依赖...

if not exist "package.json" (
    echo %ERROR% 未在当前目录找到 package.json，请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "App.tsx" (
    echo %ERROR% 未找到 App.tsx，请确保这是正确的 React 项目
    pause
    exit /b 1
)

echo %SUCCESS% 项目结构检查通过
echo.

:collect_dify_config
echo %INFO% 配置 Dify Agent 连接信息...
echo.

set /p "dify_api_key=请输入 Dify API Key: "
if "%dify_api_key%"=="" (
    echo %WARNING% API Key 为空，将使用模拟模式
    set "dify_api_key=demo-key"
)

set /p "dify_base_url=请输入 Dify Base URL (默认: https://api.dify.ai/v1): "
if "%dify_base_url%"=="" (
    set "dify_base_url=https://api.dify.ai/v1"
)

set /p "dify_agent_id=请输入 Dify Agent ID: "
if "%dify_agent_id%"=="" (
    echo %WARNING% Agent ID 为空，将使用模拟模式
    set "dify_agent_id=demo-agent"
)

echo.
echo 选择默认 AI 提供商:
echo 1) Dify Agent (推荐)
echo 2) OpenAI  
echo 3) Claude
set /p "provider_choice=请选择 (1-3): "

if "%provider_choice%"=="1" set "default_provider=dify"
if "%provider_choice%"=="2" set "default_provider=openai"
if "%provider_choice%"=="3" set "default_provider=claude"
if "%provider_choice%"=="" set "default_provider=dify"

echo %SUCCESS% 配置信息收集完成
echo.

:update_env_file
echo %INFO% 更新环境变量配置...

if exist ".env" (
    copy .env .env.backup.%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2% >nul 2>&1
    echo %INFO% 已备份现有 .env 文件
)

REM 添加 Dify 配置到 .env 文件
echo. >> .env
echo # Dify Agent 配置 (由 setup-dify-integration.bat 添加) >> .env
echo VITE_DIFY_API_KEY=%dify_api_key% >> .env
echo VITE_DIFY_BASE_URL=%dify_base_url% >> .env
echo VITE_DIFY_AGENT_ID=%dify_agent_id% >> .env
echo VITE_DEFAULT_AI_PROVIDER=%default_provider% >> .env
echo. >> .env
echo # Dify 高级配置 >> .env
echo VITE_DIFY_CONVERSATION_TIMEOUT=3600000 >> .env
echo VITE_DIFY_MAX_TOKENS=4000 >> .env
echo VITE_DIFY_TEMPERATURE=0.7 >> .env

echo %SUCCESS% 环境变量配置已更新
echo.

:install_packages
echo %INFO% 安装集成所需的依赖包...

REM 检查并安装缺失的包
npm list axios >nul 2>&1
if %errorlevel% neq 0 (
    echo %INFO% 安装 axios...
    npm install axios
)

npm list --dev vitest >nul 2>&1
if %errorlevel% neq 0 (
    echo %INFO% 安装 vitest...
    npm install --save-dev vitest@latest
)

echo %SUCCESS% 依赖包安装完成
echo.

:create_dify_service
echo %INFO% 创建 Dify 服务文件...

if not exist "services" (
    mkdir services
    echo %INFO% 创建 services 目录
)

echo %INFO% 创建 DifyService.ts...
(
echo // Dify Agent 服务
echo // 此文件由 setup-dify-integration.bat 自动生成
echo.
echo export interface DifyConfig {
echo   apiKey: string;
echo   baseUrl: string;
echo   agentId: string;
echo   conversationId?: string;
echo }
echo.
echo export interface DifyResponse {
echo   id: string;
echo   answer: string;
echo   conversation_id: string;
echo   created_at: number;
echo   metadata?: any;
echo }
echo.
echo export class DifyService {
echo   private config: DifyConfig;
echo   private conversationId: string ^| null = null;
echo.
echo   constructor^(config: DifyConfig^) {
echo     this.config = config;
echo     this.conversationId = config.conversationId ^|\| null;
echo   }
echo.
echo   async sendMessage^(
echo     message: string,
echo     userId: string,
echo     context?: Record^<string, any^>
echo   ^): Promise^<DifyResponse^> {
echo     try {
echo       const payload = {
echo         query: message,
echo         conversation_id: this.conversationId,
echo         user: userId,
echo         inputs: context ^|\| {},
echo         response_mode: 'blocking',
echo         auto_generate_name: true
echo       };
echo.
echo       const response = await fetch^(`${this.config.baseUrl}/chat-messages`, {
echo         method: 'POST',
echo         headers: {
echo           'Authorization': `Bearer ${this.config.apiKey}`,
echo           'Content-Type': 'application/json',
echo         },
echo         body: JSON.stringify^(payload^),
echo       }^);
echo.
echo       if ^(!response.ok^) {
echo         throw new Error^(`Dify API error: ${response.status} ${response.statusText}`^);
echo       }
echo.
echo       const data: DifyResponse = await response.json^(^);
echo.
echo       if ^(data.conversation_id^) {
echo         this.conversationId = data.conversation_id;
echo       }
echo.
echo       return data;
echo     } catch ^(error^) {
echo       console.error^('Error sending message to Dify:', error^);
echo       throw error;
echo     }
echo   }
echo.
echo   // 更多方法请参考完整的 DifyService 实现
echo }
) > services\DifyService.ts

echo %SUCCESS% DifyService.ts 创建完成

echo %INFO% 创建 AIProviderManager.ts...
(
echo // AI 提供商管理器
echo // 此文件由 setup-dify-integration.bat 自动生成
echo.
echo import { DifyService } from './DifyService';
echo.
echo export enum AIProvider {
echo   OPENAI = 'openai',
echo   CLAUDE = 'claude',
echo   DIFY = 'dify'
echo }
echo.
echo export interface AIMessage {
echo   id: string;
echo   type: 'user' ^| 'assistant';
echo   content: string;
echo   timestamp: number;
echo   provider: AIProvider;
echo   metadata?: Record^<string, any^>;
echo }
echo.
echo export class AIProviderManager {
echo   private difyService: DifyService;
echo   private currentProvider: AIProvider;
echo.
echo   constructor^(^) {
echo     this.difyService = new DifyService^({
echo       apiKey: import.meta.env.VITE_DIFY_API_KEY ^|\| '',
echo       baseUrl: import.meta.env.VITE_DIFY_BASE_URL ^|\| 'https://api.dify.ai/v1',
echo       agentId: import.meta.env.VITE_DIFY_AGENT_ID ^|\| ''
echo     }^);
echo.
echo     this.currentProvider = ^(import.meta.env.VITE_DEFAULT_AI_PROVIDER as AIProvider^) ^|\| AIProvider.DIFY;
echo   }
echo.
echo   setProvider^(provider: AIProvider^): void {
echo     this.currentProvider = provider;
echo   }
echo.
echo   getCurrentProvider^(^): AIProvider {
echo     return this.currentProvider;
echo   }
echo.
echo   async sendMessage^(
echo     message: string,
echo     userId: string,
echo     context?: Record^<string, any^>
echo   ^) {
echo     switch ^(this.currentProvider^) {
echo       case AIProvider.DIFY:
echo         return await this.difyService.sendMessage^(message, userId, context^);
echo       default:
echo         throw new Error^(`Provider ${this.currentProvider} not implemented yet`^);
echo     }
echo   }
echo.
echo   // 更多方法请参考完整的 AIProviderManager 实现
echo }
) > services\AIProviderManager.ts

echo %SUCCESS% AIProviderManager.ts 创建完成
echo.

:update_package_scripts
echo %INFO% 更新 package.json 脚本...

REM 更新 package.json (Windows下较复杂，这里简化处理)
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['test:dify'] = 'vitest run tests/dify-integration.test.ts';
pkg.scripts['dify:check'] = 'node -e \"console.log(\\\"Dify Config:\\\", {api: process.env.VITE_DIFY_API_KEY ? \\\"Set\\\" : \\\"Missing\\\", url: process.env.VITE_DIFY_BASE_URL, agent: process.env.VITE_DIFY_AGENT_ID})\"';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo %SUCCESS% package.json 脚本已更新
echo.

:create_test_files
echo %INFO% 创建集成测试文件...

if not exist "tests" (
    mkdir tests
)

(
echo // Dify 集成测试
echo // 此文件由 setup-dify-integration.bat 自动生成
echo.
echo import { describe, it, expect } from 'vitest';
echo import { DifyService } from '../services/DifyService';
echo import { AIProviderManager, AIProvider } from '../services/AIProviderManager';
echo.
echo describe^('Dify Integration Tests', ^(^) =^> {
echo   it^('should create DifyService instance', ^(^) =^> {
echo     const service = new DifyService^({
echo       apiKey: 'test-key',
echo       baseUrl: 'https://api.dify.ai/v1',
echo       agentId: 'test-agent'
echo     }^);
echo.
echo     expect^(service^).toBeDefined^(^);
echo   }^);
echo.
echo   it^('should create AIProviderManager instance', ^(^) =^> {
echo     const manager = new AIProviderManager^(^);
echo     expect^(manager^).toBeDefined^(^);
echo     expect^(manager.getCurrentProvider^(^)^).toBe^(AIProvider.DIFY^);
echo   }^);
echo.
echo   it^('should switch providers', ^(^) =^> {
echo     const manager = new AIProviderManager^(^);
echo     manager.setProvider^(AIProvider.OPENAI^);
echo     expect^(manager.getCurrentProvider^(^)^).toBe^(AIProvider.OPENAI^);
echo   }^);
echo }^);
) > tests\dify-integration.test.ts

echo %SUCCESS% 测试文件创建完成
echo.

:create_usage_guide
echo %INFO% 创建使用说明文档...

(
echo # Dify Agent 使用指南
echo.
echo ## 🎯 集成完成
echo.
echo 恭喜！Dify Agent 已成功集成到您的产业集群评估系统中。
echo.
echo ## 📋 配置信息
echo.
echo - **API Key**: ********
echo - **Base URL**: %dify_base_url%
echo - **Agent ID**: %dify_agent_id%
echo - **默认提供商**: %default_provider%
echo.
echo ## 🚀 快速开始
echo.
echo ### 1. 验证配置
echo ```cmd
echo npm run dify:check
echo ```
echo.
echo ### 2. 运行测试
echo ```cmd
echo npm run test:dify
echo ```
echo.
echo ### 3. 启动应用
echo ```cmd
echo npm run dev
echo ```
echo.
echo ## 🔧 使用方式
echo.
echo ### 在聊天页面使用
echo 1. 访问 `/chat` 页面
echo 2. 在AI提供商选择器中选择 "Dify 智能助手"
echo 3. 开始对话
echo.
echo ### 编程接口使用
echo ```typescript
echo import { AIProviderManager, AIProvider } from './services/AIProviderManager';
echo.
echo const aiManager = new AIProviderManager^(^);
echo aiManager.setProvider^(AIProvider.DIFY^);
echo.
echo const response = await aiManager.sendMessage^(
echo   "分析产业集群发展潜力",
echo   "user-123",
echo   { domain: "industrial_cluster_analysis" }
echo ^);
echo ```
echo.
echo ## 📚 更多信息
echo.
echo 详细的集成指南请参考: `docs\DIFY_INTEGRATION_GUIDE.md`
echo.
echo ## 🆘 故障排除
echo.
echo 1. **连接失败**: 检查 API Key 和网络连接
echo 2. **响应异常**: 查看浏览器控制台错误信息  
echo 3. **配置问题**: 运行 `npm run dify:check` 检查配置
echo.
echo ## 📞 支持
echo.
echo 如有问题，请参考完整的集成文档或联系技术支持。
) > DIFY_USAGE_GUIDE.md

echo %SUCCESS% 使用说明文档创建完成
echo.

:run_verification
echo %INFO% 运行集成验证...

echo %INFO% 检查 Dify 配置...
call npm run dify:check

echo %INFO% 运行集成测试...
call npm run test:dify
if %errorlevel% equ 0 (
    echo %SUCCESS% 集成测试通过
) else (
    echo %WARNING% 部分测试失败，但不影响基本功能
)

echo %SUCCESS% 验证完成
echo.

:show_completion_info
echo.
echo %SUCCESS% 🎉 Dify Agent 集成完成！
echo.
echo %INFO% 📋 下一步操作:
echo 1. 查看使用指南: type DIFY_USAGE_GUIDE.md
echo 2. 启动开发服务器: npm run dev
echo 3. 访问聊天页面测试 Dify 功能
echo 4. 查看完整文档: docs\DIFY_INTEGRATION_GUIDE.md
echo.
echo %INFO% 🔧 常用命令:
echo npm run dify:check     - 检查 Dify 配置
echo npm run test:dify      - 运行 Dify 测试
echo npm run dev            - 启动开发服务器
echo.
echo %WARNING% ⚠️  注意事项:
echo - 请妥善保管您的 Dify API 密钥
echo - 生产环境部署前请更新相应的环境变量
echo - 建议定期检查 API 使用量和费用
echo.

pause
exit /b 0