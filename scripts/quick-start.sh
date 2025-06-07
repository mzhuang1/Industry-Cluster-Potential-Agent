#!/bin/bash

# 产业集群发展潜力评估系统 - 快速启动脚本
# 适用于Linux/macOS系统

set -e

echo "🚀 产业集群发展潜力评估系统 - 快速启动"
echo "================================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 打印信息
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

# 检查系统要求
check_requirements() {
    print_info "检查系统要求..."
    
    # 检查Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js已安装: $NODE_VERSION"
    else
        print_error "Node.js未安装！请安装Node.js 18+版本"
        echo "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    # 检查npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm已安装: $NPM_VERSION"
    else
        print_error "npm未安装！"
        exit 1
    fi
    
    # 检查Git
    if command_exists git; then
        print_success "Git已安装"
    else
        print_warning "Git未安装，某些功能可能受限"
    fi
    
    # 检查Docker（可选）
    if command_exists docker; then
        print_success "Docker已安装"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker未安装，将无法使用容器化部署"
        DOCKER_AVAILABLE=false
    fi
}

# 设置环境变量
setup_environment() {
    print_info "设置环境变量..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "已创建.env文件"
        
        echo ""
        print_warning "请编辑.env文件，配置必要的API密钥："
        echo "- VITE_OPENAI_API_KEY: OpenAI API密钥"
        echo "- VITE_OPENAI_ORGANIZATION_ID: OpenAI组织ID"
        echo "- VITE_OPENAI_PROJECT_ID: OpenAI项目ID"
        echo ""
        
        read -p "是否现在编辑.env文件？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command_exists code; then
                code .env
            elif command_exists vim; then
                vim .env
            elif command_exists nano; then
                nano .env
            else
                print_info "请手动编辑.env文件"
            fi
        fi
    else
        print_success ".env文件已存在"
    fi
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "依赖安装完成"
}

# 启动开发模式
start_development() {
    print_info "启动开发服务器..."
    
    echo ""
    print_success "🎉 项目设置完成！"
    echo ""
    print_info "开发服务器将在以下地址启动:"
    print_info "- 前端: http://localhost:5173"
    print_info "- 后端: http://localhost:8000 (如果启动)"
    echo ""
    print_info "按 Ctrl+C 停止服务器"
    echo ""
    
    npm run dev
}

# 启动后端服务（可选）
start_backend() {
    if [ -d "backend" ]; then
        print_info "检测到后端目录，是否启动后端服务？"
        read -p "启动后端服务？(y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command_exists python3; then
                print_info "设置Python虚拟环境..."
                cd backend
                
                if [ ! -d "venv" ]; then
                    python3 -m venv venv
                    print_success "Python虚拟环境已创建"
                fi
                
                source venv/bin/activate
                
                if [ -f "requirements.txt" ]; then
                    print_info "安装Python依赖..."
                    pip install -r requirements.txt
                    print_success "Python依赖安装完成"
                fi
                
                print_info "启动FastAPI服务器..."
                uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
                BACKEND_PID=$!
                
                cd ..
                print_success "后端服务已启动 (PID: $BACKEND_PID)"
            else
                print_error "Python3未安装，无法启动后端服务"
            fi
        fi
    fi
}

# Docker模式启动
start_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_info "检测到Docker，是否使用Docker启动？"
        read -p "使用Docker启动服务？(y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "使用Docker Compose启动服务..."
            
            if [ -f "docker-compose.yml" ]; then
                docker-compose up --build -d
                print_success "Docker服务已启动"
                
                echo ""
                print_info "服务地址:"
                print_info "- 应用: http://localhost"
                print_info "- API: http://localhost:8000"
                echo ""
                print_info "查看日志: docker-compose logs -f"
                print_info "停止服务: docker-compose down"
                
                return 0
            else
                print_error "docker-compose.yml文件不存在"
                return 1
            fi
        fi
    fi
    return 1
}

# 显示帮助信息
show_help() {
    echo ""
    print_info "📋 常用命令:"
    echo "npm run dev              - 启动开发服务器"
    echo "npm run build            - 构建生产版本"
    echo "npm run preview          - 预览生产版本"
    echo "npm run lint             - 代码检查"
    echo "docker-compose up        - Docker启动"
    echo "docker-compose down      - Docker停止"
    echo ""
    print_info "📚 文档位置:"
    echo "docs/DEVELOPMENT_GUIDE.md - 完整开发指南"
    echo "README.md                - 项目说明"
    echo ""
}

# 主函数
main() {
    echo ""
    print_info "开始设置项目..."
    echo ""
    
    # 检查系统要求
    check_requirements
    echo ""
    
    # 尝试Docker启动
    if start_docker; then
        show_help
        return 0
    fi
    
    # 传统启动方式
    setup_environment
    echo ""
    
    install_dependencies
    echo ""
    
    start_backend
    echo ""
    
    start_development
    
    show_help
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi