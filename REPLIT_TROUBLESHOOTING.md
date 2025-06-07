# Replit 部署故障排除指南

## 🚨 常见问题解决方案

### 1. Host 阻塞错误 (已修复)

**错误信息**: `Blocked request. This host (...replit.dev) is not allowed`

**解决方案**: 已在 `vite.config.ts` 中添加 `allowedHosts: 'all'` 配置

### 2. 端口配置问题

**问题**: Replit 无法访问应用

**解决方案**:
```bash
# 确保使用正确的启动命令
npm run dev

# 或者手动指定参数
npm run dev -- --host 0.0.0.0 --port 3000
```

### 3. 环境变量问题

**检查环境变量**:
```bash
# 在 Replit Shell 中执行
echo $NODE_ENV
echo $PORT
```

**设置环境变量** (在 Replit Secrets 中):
- `NODE_ENV`: `development`
- `VITE_API_URL`: `your-backend-url` (如果有)

### 4. 依赖安装问题

**清理并重新安装**:
```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 清理 npm 缓存
npm cache clean --force

# 重新安装
npm install
```

### 5. 构建问题

**检查 TypeScript 错误**:
```bash
# 运行类型检查
npx tsc --noEmit

# 运行 ESLint 检查
npm run lint
```

**修复常见错误**:
```bash
# 如果出现权限问题
chmod +x scripts/*.sh

# 如果出现 git 问题
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

## 🔧 Replit 特定配置

### .replit 文件配置
```
run = "npm run dev"
entrypoint = "App.tsx"

[env]
NODE_ENV = "development"

[[ports]]
localPort = 3000
externalPort = 80
```

### replit.nix 文件配置
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.npm-8_x
    pkgs.git
  ];
}
```

### vite.config.ts 关键配置
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all', // 重要: 允许所有主机
    hmr: {
      clientPort: 443, // 使用 HTTPS 端口
    },
  },
})
```

## 🚀 快速启动步骤

### 方法一: 自动启动 (推荐)
1. 点击 Replit 中的 "Run" 按钮
2. 等待依赖安装完成
3. 应用将在新标签页中打开

### 方法二: 手动启动
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# Replit 会自动提供访问 URL
```

## 🐛 调试技巧

### 查看实时日志
```bash
# 在 Replit Shell 中查看详细日志
npm run dev -- --debug

# 查看网络请求
curl -I http://localhost:3000
```

### 检查端口状态
```bash
# 查看端口占用
netstat -tulpn | grep :3000

# 杀死占用端口的进程 (如果需要)
pkill -f "vite"
```

### 网络连接测试
```bash
# 测试外部连接
ping google.com

# 测试本地服务
curl http://localhost:3000
```

## 🔍 性能优化

### Replit 环境优化
```bash
# 设置 npm 镜像 (中国用户)
npm config set registry https://registry.npmmirror.com/

# 启用并行构建
npm install --prefer-offline

# 减少日志输出
npm run dev --silent
```

### 内存使用优化
```javascript
// 在 vite.config.ts 中添加
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})
```

## 📱 移动端测试

### 在 Replit 中测试移动端
1. 打开应用 URL
2. 在浏览器中按 F12 打开开发者工具
3. 点击移动设备图标切换到移动视图
4. 测试响应式设计

### 二维码分享
- Replit 提供的 URL 可以生成二维码
- 使用手机扫描测试移动端体验

## 🔒 安全注意事项

### 环境变量安全
- 敏感信息存储在 Replit Secrets 中
- 不要在代码中硬编码 API 密钥
- 使用 `.env.example` 文件作为模板

### HTTPS 配置
- Replit 自动提供 HTTPS
- 确保所有 API 调用使用 HTTPS
- 配置 CORS 策略

## 📞 获取帮助

### Replit 社区资源
- [Replit 文档](https://docs.replit.com/)
- [Replit 社区论坛](https://ask.replit.com/)
- [GitHub Issues](https://github.com/replit/replit/issues)

### 项目特定支持
- 检查项目 README.md
- 查看 GitHub Issues
- 联系项目维护者

---

**最后更新**: 2024年12月
**适用版本**: Replit Web IDE, Node.js 18+, Vite 5+