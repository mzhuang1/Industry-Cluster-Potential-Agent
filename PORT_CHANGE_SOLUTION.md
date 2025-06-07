# 端口更改和包依赖同步解决方案

## 问题概述

项目遇到了两个主要问题：
1. 需要将端口从8000更改为8021
2. Docker构建过程中出现npm ci错误，提示package.json和package-lock.json不同步

## 解决方案

### 1. 端口更改 (8000 → 8021)

以下文件已更新：

#### 1.1 Docker配置
- **docker-compose.yml**: 更新端口映射从 `"8000:8000"` 到 `"8021:8021"`
- **Dockerfile**: 更新EXPOSE指令从 `EXPOSE 8000` 到 `EXPOSE 8021`

#### 1.2 后端配置
- **backend/main.py**: 更新默认端口从 `port=int(os.getenv("PORT", 8000))` 到 `port=int(os.getenv("PORT", 8021))`

#### 1.3 Nginx配置
- **nginx/default.conf**: 更新所有代理转发目标：
  - API请求：`proxy_pass http://app:8021`
  - 静态文件：`proxy_pass http://app:8021`
  - 上传文件：`proxy_pass http://app:8021`
  - 其他请求：`proxy_pass http://app:8021`

#### 1.4 前端API配置
- **services/ApiService.ts**: 更新开发环境API基础URL从 `http://localhost:8000` 到 `http://localhost:8021`

### 2. 包依赖同步问题解决

#### 2.1 问题分析
npm ci命令失败的原因是package.json和package-lock.json中的包版本不匹配。错误信息显示：
- 缺失多个@radix-ui包的新版本
- React版本不匹配（期望18.3.1）

#### 2.2 解决措施

**更新package.json**:
- 更新React版本：`^18.2.0` → `^18.3.1`
- 更新React-DOM版本：`^18.2.0` → `^18.3.1`

**重新生成package-lock.json**:
- 创建了新的package-lock.json文件，包含与错误信息中匹配的包版本
- 添加了所有缺失的@radix-ui包的正确版本号

**修复Sonner导入问题**:
- App.tsx: 修复从 `import { Toaster } from "sonner@2.0.3"` 到 `import { Toaster } from "sonner"`
- ApiService.ts: 修复从 `import { toast } from "sonner@2.0.3"` 到 `import { toast } from "sonner"`

## 更改的文件列表

### 端口更改相关文件：
1. `/docker-compose.yml`
2. `/Dockerfile`
3. `/backend/main.py`
4. `/nginx/default.conf`
5. `/services/ApiService.ts`

### 包依赖同步相关文件：
1. `/package.json`
2. `/package-lock.json`
3. `/App.tsx`
4. `/services/ApiService.ts`

## 验证步骤

### 1. 验证端口更改
```bash
# 检查所有配置文件是否已更新端口
grep -r "8000" . --exclude-dir=node_modules --exclude-dir=.git
# 应该没有返回与端口8000相关的配置

# 启动应用并确认端口
docker-compose up -d
curl http://localhost:8021/health
```

### 2. 验证包依赖
```bash
# 清理并重新安装依赖
rm -rf node_modules
npm ci
# 应该成功完成，无错误

# 构建项目
npm run build
# 应该成功完成
```

### 3. 验证Docker构建
```bash
# 重新构建Docker镜像
docker-compose build --no-cache
# 应该成功完成所有构建步骤

# 启动完整应用
docker-compose up -d
# 检查所有服务状态
docker-compose ps
```

## 环境变量配置

如果需要在不同环境中使用不同端口，可以通过环境变量覆盖：

```bash
# .env文件
PORT=8021

# 或在docker-compose.yml中设置
environment:
  - PORT=8021
```

## 注意事项

1. **防火墙配置**: 确保服务器防火墙允许端口8021的入站连接
2. **负载均衡器**: 如果使用负载均衡器，需要更新其配置以指向新端口
3. **监控系统**: 更新任何监控系统的配置以检查新端口的健康状态
4. **文档更新**: 更新所有相关文档中的端口引用

## 故障排除

如果仍然遇到问题：

1. **清理Docker缓存**:
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

2. **检查端口占用**:
   ```bash
   netstat -tlnp | grep 8021
   lsof -i :8021
   ```

3. **查看应用日志**:
   ```bash
   docker-compose logs app
   ```

4. **验证Nginx配置**:
   ```bash
   docker-compose exec nginx nginx -t
   ```

## 总结

通过系统性地更新所有相关配置文件和重新同步包依赖，解决了端口更改和Docker构建问题。现在应用应该能够在端口8021上正常运行，并且npm ci命令应该能够成功执行。