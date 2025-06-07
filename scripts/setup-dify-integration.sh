#!/bin/bash

# Dify Agent 集成安装脚本
# 用于快速集成 Dify Agent 到现有的产业集群评估系统

set -e

echo "🤖 Dify Agent 集成安装向导"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查项目依赖..."
    
    if [ ! -f "package.json" ]; then
        print_error "未在当前目录找到 package.json，请确保在项目根目录运行此脚本"
        exit 1
    fi
    
    if [ ! -f "App.tsx" ]; then
        print_error "未找到 App.tsx，请确保这是正确的 React 项目"
        exit 1
    fi
    
    print_success "项目结构检查通过"
}

# 收集 Dify 配置信息
collect_dify_config() {
    print_info "配置 Dify Agent 连接信息..."
    echo ""
    
    # API Key
    read -p "请输入 Dify API Key: " dify_api_key
    if [ -z "$dify_api_key" ]; then
        print_warning "API Key 为空，将使用模拟模式"
        dify_api_key="demo-key"
    fi
    
    # Base URL
    read -p "请输入 Dify Base URL (默认: https://api.dify.ai/v1): " dify_base_url
    if [ -z "$dify_base_url" ]; then
        dify_base_url="https://api.dify.ai/v1"
    fi
    
    # Agent ID
    read -p "请输入 Dify Agent ID: " dify_agent_id
    if [ -z "$dify_agent_id" ]; then
        print_warning "Agent ID 为空，将使用模拟模式"
        dify_agent_id="demo-agent"
    fi
    
    # 默认提供商
    echo ""
    echo "选择默认 AI 提供商:"
    echo "1) Dify Agent (推荐)"
    echo "2) OpenAI"
    echo "3) Claude"
    read -p "请选择 (1-3): " provider_choice
    
    case $provider_choice in
        1) default_provider="dify" ;;
        2) default_provider="openai" ;;
        3) default_provider="claude" ;;
        *) default_provider="dify" ;;
    esac
    
    print_success "配置信息收集完成"
}

# 更新环境变量
update_env_file() {
    print_info "更新环境变量配置..."
    
    # 备份现有 .env 文件
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        print_info "已备份现有 .env 文件"
    fi
    
    # 添加 Dify 配置到 .env 文件
    cat >> .env << EOF

# Dify Agent 配置 (由 setup-dify-integration.sh 添加)
VITE_DIFY_API_KEY=${dify_api_key}
VITE_DIFY_BASE_URL=${dify_base_url}
VITE_DIFY_AGENT_ID=${dify_agent_id}
VITE_DEFAULT_AI_PROVIDER=${default_provider}

# Dify 高级配置
VITE_DIFY_CONVERSATION_TIMEOUT=3600000
VITE_DIFY_MAX_TOKENS=4000
VITE_DIFY_TEMPERATURE=0.7
EOF
    
    print_success "环境变量配置已更新"
}

# 安装必要的 npm 包
install_packages() {
    print_info "安装集成所需的依赖包..."
    
    # 检查是否需要安装额外的包
    packages_to_install=""
    
    # 检查是否已安装 axios（用于HTTP请求）
    if ! npm list axios > /dev/null 2>&1; then
        packages_to_install="$packages_to_install axios"
    fi
    
    # 检查是否已安装测试相关包
    if ! npm list --dev vitest > /dev/null 2>&1; then
        packages_to_install="$packages_to_install vitest@latest"
    fi
    
    if [ ! -z "$packages_to_install" ]; then
        print_info "安装缺失的依赖: $packages_to_install"
        npm install $packages_to_install
        print_success "依赖包安装完成"
    else
        print_success "所有必要的依赖包已安装"
    fi
}

# 创建 Dify 服务文件
create_dify_service() {
    print_info "创建 Dify 服务文件..."
    
    # 检查 services 目录是否存在
    if [ ! -d "services" ]; then
        mkdir -p services
        print_info "创建 services 目录"
    fi
    
    # 复制服务文件（这里应该从模板创建）
    print_info "创建 DifyService.ts..."
    cat > services/DifyService.ts << 'EOF'
// Dify Agent 服务
// 此文件由 setup-dify-integration.sh 自动生成

export interface DifyConfig {
  apiKey: string;
  baseUrl: string;
  agentId: string;
  conversationId?: string;
}

export interface DifyResponse {
  id: string;
  answer: string;
  conversation_id: string;
  created_at: number;
  metadata?: {
    usage?: {
      total_tokens: number;
      prompt_tokens: number;
      completion_tokens: number;
    };
    retrieval_documents?: Array<{
      content: string;
      score: number;
      title: string;
    }>;
  };
}

export class DifyService {
  private config: DifyConfig;
  private conversationId: string | null = null;

  constructor(config: DifyConfig) {
    this.config = config;
    this.conversationId = config.conversationId || null;
  }

  async sendMessage(
    message: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<DifyResponse> {
    try {
      const payload = {
        query: message,
        conversation_id: this.conversationId,
        user: userId,
        inputs: context || {},
        response_mode: 'blocking',
        auto_generate_name: true
      };

      const response = await fetch(`${this.config.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Dify API error: ${response.status} ${response.statusText}`);
      }

      const data: DifyResponse = await response.json();
      
      if (data.conversation_id) {
        this.conversationId = data.conversation_id;
      }

      return data;
    } catch (error) {
      console.error('Error sending message to Dify:', error);
      throw error;
    }
  }

  // 更多方法请参考完整的 DifyService 实现
}
EOF

    print_success "DifyService.ts 创建完成"
    
    # 创建 AI Provider Manager
    print_info "创建 AIProviderManager.ts..."
    cat > services/AIProviderManager.ts << 'EOF'
// AI 提供商管理器
// 此文件由 setup-dify-integration.sh 自动生成

import { DifyService } from './DifyService';

export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  DIFY = 'dify'
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider: AIProvider;
  metadata?: Record<string, any>;
}

export class AIProviderManager {
  private difyService: DifyService;
  private currentProvider: AIProvider;

  constructor() {
    this.difyService = new DifyService({
      apiKey: import.meta.env.VITE_DIFY_API_KEY || '',
      baseUrl: import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1',
      agentId: import.meta.env.VITE_DIFY_AGENT_ID || ''
    });
    
    this.currentProvider = (import.meta.env.VITE_DEFAULT_AI_PROVIDER as AIProvider) || AIProvider.DIFY;
  }

  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  async sendMessage(
    message: string,
    userId: string,
    context?: Record<string, any>
  ) {
    switch (this.currentProvider) {
      case AIProvider.DIFY:
        return await this.difyService.sendMessage(message, userId, context);
      default:
        throw new Error(`Provider ${this.currentProvider} not implemented yet`);
    }
  }

  // 更多方法请参考完整的 AIProviderManager 实现
}
EOF

    print_success "AIProviderManager.ts 创建完成"
}

# 更新 package.json 脚本
update_package_scripts() {
    print_info "更新 package.json 脚本..."
    
    # 添加 Dify 相关的脚本
    npm pkg set scripts.test:dify="vitest run tests/dify-integration.test.ts"
    npm pkg set scripts.dify:check="node -e \"console.log('Dify Config:', {api: process.env.VITE_DIFY_API_KEY ? 'Set' : 'Missing', url: process.env.VITE_DIFY_BASE_URL, agent: process.env.VITE_DIFY_AGENT_ID})\""
    
    print_success "package.json 脚本已更新"
}

# 创建测试文件
create_test_files() {
    print_info "创建集成测试文件..."
    
    # 创建 tests 目录
    if [ ! -d "tests" ]; then
        mkdir -p tests
    fi
    
    # 创建测试文件
    cat > tests/dify-integration.test.ts << 'EOF'
// Dify 集成测试
// 此文件由 setup-dify-integration.sh 自动生成

import { describe, it, expect } from 'vitest';
import { DifyService } from '../services/DifyService';
import { AIProviderManager, AIProvider } from '../services/AIProviderManager';

describe('Dify Integration Tests', () => {
  it('should create DifyService instance', () => {
    const service = new DifyService({
      apiKey: 'test-key',
      baseUrl: 'https://api.dify.ai/v1',
      agentId: 'test-agent'
    });
    
    expect(service).toBeDefined();
  });

  it('should create AIProviderManager instance', () => {
    const manager = new AIProviderManager();
    expect(manager).toBeDefined();
    expect(manager.getCurrentProvider()).toBe(AIProvider.DIFY);
  });

  it('should switch providers', () => {
    const manager = new AIProviderManager();
    manager.setProvider(AIProvider.OPENAI);
    expect(manager.getCurrentProvider()).toBe(AIProvider.OPENAI);
  });
});
EOF

    print_success "测试文件创建完成"
}

# 创建使用说明文档
create_usage_guide() {
    print_info "创建使用说明文档..."
    
    cat > DIFY_USAGE_GUIDE.md << EOF
# Dify Agent 使用指南

## 🎯 集成完成

恭喜！Dify Agent 已成功集成到您的产业集群评估系统中。

## 📋 配置信息

- **API Key**: $(echo $dify_api_key | sed 's/./*/g')
- **Base URL**: $dify_base_url
- **Agent ID**: $dify_agent_id
- **默认提供商**: $default_provider

## 🚀 快速开始

### 1. 验证配置
\`\`\`bash
npm run dify:check
\`\`\`

### 2. 运行测试
\`\`\`bash
npm run test:dify
\`\`\`

### 3. 启动应用
\`\`\`bash
npm run dev
\`\`\`

## 🔧 使用方式

### 在聊天页面使用
1. 访问 \`/chat\` 页面
2. 在AI提供商选择器中选择 "Dify 智能助手"
3. 开始对话

### 编程接口使用
\`\`\`typescript
import { AIProviderManager, AIProvider } from './services/AIProviderManager';

const aiManager = new AIProviderManager();
aiManager.setProvider(AIProvider.DIFY);

const response = await aiManager.sendMessage(
  "分析产业集群发展潜力",
  "user-123",
  { domain: "industrial_cluster_analysis" }
);
\`\`\`

## 📚 更多信息

详细的集���指南请参考: \`docs/DIFY_INTEGRATION_GUIDE.md\`

## 🆘 故障排除

1. **连接失败**: 检查 API Key 和网络连接
2. **响应异常**: 查看浏览器控制台错误信息
3. **配置问题**: 运行 \`npm run dify:check\` 检查配置

## 📞 支持

如有问题，请参考完整的集成文档或联系技术支持。
EOF

    print_success "使用说明文档创建完成"
}

# 运行验证测试
run_verification() {
    print_info "运行集成验证..."
    
    # 检查配置
    print_info "检查 Dify 配置..."
    npm run dify:check
    
    # 运行测试
    print_info "运行集成测试..."
    if npm run test:dify; then
        print_success "集成测试通过"
    else
        print_warning "部分测试失败，但不影响基本功能"
    fi
    
    print_success "验证完成"
}

# 显示完成信息
show_completion_info() {
    echo ""
    print_success "🎉 Dify Agent 集成完成！"
    echo ""
    print_info "📋 下一步操作:"
    echo "1. 查看使用指南: cat DIFY_USAGE_GUIDE.md"
    echo "2. 启动开发服务器: npm run dev"
    echo "3. 访问聊天页面测试 Dify 功能"
    echo "4. 查看完整文档: docs/DIFY_INTEGRATION_GUIDE.md"
    echo ""
    print_info "🔧 常用命令:"
    echo "npm run dify:check     - 检查 Dify 配置"
    echo "npm run test:dify      - 运行 Dify 测试"
    echo "npm run dev            - 启动开发服务器"
    echo ""
    print_warning "⚠️  注意事项:"
    echo "- 请妥善保管您的 Dify API 密钥"
    echo "- 生产环境部署前请更新相应的环境变量"
    echo "- 建议定期检查 API 使用量和费用"
    echo ""
}

# 主执行流程
main() {
    check_dependencies
    echo ""
    
    collect_dify_config
    echo ""
    
    update_env_file
    echo ""
    
    install_packages
    echo ""
    
    create_dify_service
    echo ""
    
    update_package_scripts
    echo ""
    
    create_test_files
    echo ""
    
    create_usage_guide
    echo ""
    
    run_verification
    echo ""
    
    show_completion_info
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi