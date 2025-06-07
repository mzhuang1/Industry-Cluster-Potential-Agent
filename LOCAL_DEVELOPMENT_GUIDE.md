# 产业集群发展潜力评估系统 - 本地开发指南

## 📋 环境要求

### 必需软件
- **Node.js** >= 18.0.0 (推荐使用 LTS 版本)
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **Python** >= 3.9 (如果要运行后端)
- **Git**
- **VS Code** (推荐扩展见下方)

### 推荐的 VS Code 扩展
```
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Auto Rename Tag
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- GitLens
- Python (如果开发后端)
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <项目仓库地址>
cd industrial-cluster-assessment
```

### 2. 安装前端依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 3. 环境配置
复制环境变量示例文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：
```env
# OpenAI API 配置
VITE_OPENAI_API_KEY=sk-None-CrxZrBTzpsTdBRiwHRxbT3BlbkFJOfpGRnEKRaujnsmOk5FO
VITE_OPENAI_ORG_ID=org-7FByIq8yjdv2kNGXU6Sign2E
VITE_OPENAI_PROJECT_ID=energestai_chat_test
VITE_OPENAI_API_BASE=https://api.openai.com/v1

# API 服务配置
VITE_API_BASE_URL=http://localhost:8021
VITE_ENABLE_MOCK_MODE=true

# 其他配置
VITE_APP_TITLE=产业集群发展潜力评估系统
VITE_APP_VERSION=1.0.0
```

### 4. 启动开发服务器
```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

应用将在 `http://localhost:5173` 启动

## 🔧 项目结构说明

```
├── App.tsx                 # 应用主入口组件
├── main.tsx               # Vite 入口文件
├── components/            # React 组件
│   ├── pages/            # 页面组件
│   ├── ui/               # UI 基础组件 (shadcn/ui)
│   └── ...               # 其他功能组件
├── services/             # API 服务和业务逻辑
├── context/              # React Context
├── styles/               # 样式文件 (Tailwind CSS v4)
├── assets/               # 静态资源
└── backend/              # Python FastAPI 后端 (可选)
```

## 🎨 样式系统

项目使用 **Tailwind CSS v4** 和 **shadcn/ui** 组件库：

### 主要设计 Token
- **主色调**: `#1e88e5` (CDI 蓝色)
- **字体**: Source Han Sans (中文) + Inter (英文)
- **圆角**: `0.625rem`
- **基础字体大小**: `14px`

### 自定义 CSS 变量
在 `styles/globals.css` 中定义了完整的设计系统，支持明暗模式切换。

## 🔌 API 服务配置

### 前端 Mock 模式
默认情况下，应用运行在 Mock 模式下，所有 API 调用都会返回模拟数据：

```typescript
// services/ApiService.ts
// 自动检测 API 连接状态，失败时切换到 Mock 模式
```

### 连接真实后端 (可选)
如果要连接真实的后端服务：

1. **启动 Python 后端**:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

2. **更新环境变量**:
```env
VITE_ENABLE_MOCK_MODE=false
VITE_API_BASE_URL=http://localhost:8021
```

## 🛠️ 开发命令

### 前端开发
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 后端开发 (可选)
```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python main.py

# 或使用 uvicorn
uvicorn main:app --reload --port 8021
```

## 🔑 功能模块说明

### 1. 认证系统
- **登录页面**: `/login`
- **注册页面**: `/register`
- **密码重置**: `/forgot-password`
- **角色权限**: 支持用户、研究员、管理员、系统管理员四个角色

### 2. 主要功能页面
- **首页**: `/` - 系统概览和快速入口
- **智能对话**: `/chat` - AI 对话分析功能
- **模板库**: `/templates` - 报告模板管理
- **搜索功能**: `/search` - 文档和数据搜索
- **管理后台**: `/admin` - 系统管理 (需要管理员权限)

### 3. 核心服务
- **ApiService**: API 请求管理和 Mock 模式
- **AuthService**: 用户认证和权限管理
- **TemplateService**: 报告模板管理
- **SearchService**: 搜索功能
- **OpenAIService**: AI 对话服务

## 🐛 常见问题解决

### 1. 依赖安装失败
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 或者使用 yarn
rm -rf node_modules yarn.lock
yarn install
```

### 2. 端口冲突
如果默认端口 5173 被占用，可以指定其他端口：
```bash
npm run dev -- --port 3000
```

### 3. TypeScript 类型错误
```bash
# 运行类型检查
npm run type-check

# 重启 TypeScript 服务 (在 VS Code 中)
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 4. 样式不生效
确保 Tailwind CSS 正确配置：
```bash
# 检查 tailwind.config.js 和 postcss.config.js
# 重启开发服务器
npm run dev
```

### 5. API 连接问题
- 检查 `.env` 文件中的 API 配置
- 确认后端服务是否正常运行
- 查看浏览器控制台的网络请求

## 🔒 环境变量说明

### 必需变量
```env
VITE_API_BASE_URL=http://localhost:8021          # API 服务地址
VITE_ENABLE_MOCK_MODE=true                       # 是否启用 Mock 模式
```

### OpenAI 集成 (可选)
```env
VITE_OPENAI_API_KEY=your_api_key_here           # OpenAI API 密钥
VITE_OPENAI_ORG_ID=your_org_id_here             # 组织 ID
VITE_OPENAI_PROJECT_ID=your_project_id_here     # 项目 ID
```

### 开发配置
```env
VITE_APP_TITLE=产业集群发展潜力评估系统         # 应用标题
VITE_APP_VERSION=1.0.0                          # 版本号
VITE_DEBUG_MODE=true                            # 调试模式
```

## 📱 移动端开发

项目支持响应式设计，使用 Chrome DevTools 测试移动端：

1. 按 F12 打开开发者工具
2. 点击设备模拟器图标
3. 选择不同设备尺寸测试

## 🚢 生产部署

### Docker 部署
```bash
# 构建 Docker 镜像
docker build -t industrial-cluster-app .

# 运行容器
docker run -p 8021:8021 industrial-cluster-app

# 或使用 docker-compose
docker-compose up -d
```

### 手动部署
```bash
# 构建生产版本
npm run build

# 部署 dist 目录到静态文件服务器
# 如 nginx, apache, 或 CDN
```

## 🤝 开发最佳实践

### 1. 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用 PascalCase 命名
- 文件名使用 kebab-case

### 2. Git 工作流
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature
```

### 3. 组件开发
- 使用 shadcn/ui 组件库
- 保持组件单一职责
- 编写 TypeScript 接口定义
- 添加适当的错误处理

### 4. 状态管理
- 使用 React Context 进行全局状态管理
- 组件内使用 useState 和 useEffect
- 避免不必要的重渲染

## 📞 技术支持

遇到问题时，请按以下步骤排查：

1. **检查控制台错误**: 浏览器 F12 -> Console
2. **检查网络请求**: Network 标签页
3. **验证环境配置**: 确认 `.env` 文件设置
4. **重启开发服务器**: `Ctrl+C` 然后 `npm run dev`
5. **清除缓存**: 删除 `node_modules` 重新安装

## 📚 技术栈文档

- [React](https://reactjs.org/docs/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🎉 开始开发

现在您已经准备好开始开发了！建议从以下步骤开始：

1. 启动开发服务器: `npm run dev`
2. 在浏览器打开: `http://localhost:5173`
3. 使用测试账号登录或注册新用户
4. 浏览各个功能模块
5. 开始编写或修改代码

祝您开发愉快！🚀