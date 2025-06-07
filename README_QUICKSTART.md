# 产业集群发展潜力评估系统 - 快速上手指南

> 🚀 为React新手准备的快速启动指南

## 📋 项目简介

这是一个基于React + TypeScript的现代化Web应用，用于产业集群发展潜力评估。支持AI对话分析、数据可视化、报告生成等功能。

### 🎯 主要功能
- **AI智能对话**: 基于OpenAI/Claude的智能分析助手
- **数据可视化**: 丰富的图表和仪表板
- **数据上传**: 支持CSV、Excel等格式的数据导入
- **批量处理**: 自动化数据分析和报告生成
- **模板系统**: 可定制的报告模板
- **用户管理**: 多角色权限控制

## 🔧 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18+ | 前端框架 |
| TypeScript | 5+ | 类型安全 |
| Vite | 5+ | 构建工具 |
| Tailwind CSS | 4+ | 样式框架 |
| shadcn/ui | - | UI组件库 |
| Recharts | - | 图表库 |
| FastAPI | - | 后端API |

## ⚡ 5分钟快速启动

### 方法一：自动脚本启动（推荐）

#### Windows用户
```cmd
# 双击运行或在命令行执行
scripts\quick-start.bat
```

#### Linux/macOS用户
```bash
# 赋予执行权限并运行
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

### 方法二：手动启动

#### 1. 检查环境
确保已安装：
- [Node.js 18+](https://nodejs.org/)
- npm (随Node.js安装)
- Git (可选)

```bash
# 检查版本
node --version  # 应该 >= v18.0.0
npm --version   # 应该 >= 8.0.0
```

#### 2. 安装依赖
```bash
# 安装项目依赖
npm install
```

#### 3. 配置环境
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑.env文件，配置API密钥（可选，有默认模拟数据）
```

#### 4. 启动开发服务器
```bash
# 启动前端
npm run dev
```

浏览器自动打开 `http://localhost:5173`

## 🌐 在线体验

如果只想快速体验功能，直接启动项目即可。系统内置了模拟数据，无需配置真实的API密钥。

### 默认测试账号
- **用户名**: admin
- **密码**: admin123
- **角色**: 系统管理员

## 📁 项目结构速览

```
├── components/           # React组件
│   ├── pages/           # 页面组件
│   ├── ui/              # UI基础组件
│   └── visualizations/  # 图表组件
├── services/            # 业务逻辑服务
├── context/             # React上下文
├── backend/             # 后端服务
└── docs/                # 文档
```

## 🎯 核心功能演示

### 1. 首页 (`/`)
- AI助手介绍
- 数据上传入口
- 可视化示例

### 2. 对话页面 (`/chat`)
- AI智能对话
- 实时响应
- 历史记录

### 3. 数据可视化 (`/` -> 数据可视化标签)
- 多种图表类型
- 交互式仪表板
- 报告生成

### 4. 模板库 (`/templates`)
- 报告模板浏览
- 模板预览
- 自定义模板

## 🛠️ 开发指南

### 常用命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
npm run lint     # 代码检查
```

### 代码结构
- **组件**: 采用函数式组件 + Hooks
- **样式**: Tailwind CSS + shadcn/ui
- **状态**: React Context + useState/useEffect
- **类型**: TypeScript严格模式

### 添加新功能
1. 在 `components/` 创建组件
2. 在 `services/` 添加业务逻辑
3. 在 `App.tsx` 配置路由

## 🐳 Docker部署（高级）

如果已安装Docker，可以使用容器化部署：

```bash
# 构建并启动所有服务
docker-compose up --build

# 后台运行
docker-compose up -d

# 停止服务
docker-compose down
```

访问: `http://localhost`

## 🌍 生产部署

详细的生产环境部署指南请参考：
- [完整开发指南](docs/DEVELOPMENT_GUIDE.md)
- [腾讯云部署](docs/TencentCloudDeployment.md)

### 快速部署到云服务器
1. 上传代码到服务器
2. 安装Docker和Docker Compose
3. 配置环境变量
4. 运行 `docker-compose up -d`
5. 配置域名和SSL证书

## 📚 学习资源

### React新手推荐
- [React官方教程](https://react.dev/learn)
- [TypeScript入门](https://www.typescriptlang.org/docs/)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

### 项目相关
- [Vite文档](https://vitejs.dev/)
- [shadcn/ui组件](https://ui.shadcn.com/)
- [Recharts图表](https://recharts.org/)

## ❓ 常见问题

### Q: 启动失败怎么办？
A: 检查Node.js版本，清除依赖重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

### Q: 端口被占用？
A: 修改端口启动：
```bash
npm run dev -- --port 3000
```

### Q: 没有真实API密钥？
A: 不用担心！项目内置模拟数据，可以正常体验所有功能。

### Q: 图表不显示？
A: 可能是数据加载问题，刷新页面或检查浏览器控制台错误。

## 🆘 获取帮助

1. **查看文档**: `docs/DEVELOPMENT_GUIDE.md`
2. **检查日志**: 浏览器开发者工具 Console
3. **重置项目**: 删除 `node_modules` 重新安装
4. **联系支持**: 提供错误信息和操作步骤

## 🎉 开始探索

现在你可以：
1. 🔍 **浏览界面**: 熟悉各个页面和功能
2. 💬 **体验AI对话**: 试试智能助手的分析能力
3. 📊 **查看图表**: 探索数据可视化功能
4. 📄 **生成报告**: 尝试模板和报告功能
5. 🔧 **修改代码**: 开始你的定制开发

祝你使用愉快！🚀

---

📝 **提示**: 这是一个功能完整的生产级应用。作为学习项目，你可以通过修改代码来学习React开发的各个方面。建议从简单的样式修改开始，逐步深入到功能开发。