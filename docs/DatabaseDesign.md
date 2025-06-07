# 产业集群发展潜力评估系统 - 数据库设计文档

## 1. 数据库选型建议

### 推荐选择: PostgreSQL

PostgreSQL 是一个强大的开源对象关系数据库系统，具有以下优势，使其成为本系统的理想选择:

- **数据完整性与事务支持**：完全符合 ACID 标准，确保用户账户和敏感数据的一致性和安全性
- **空间数据支持**：通过 PostGIS 扩展提供卓越的地理空间数据处理能力，对产业集群地理分布分析至关重要
- **高级分析功能**：内置统计函数和窗口函数，适合进行产业数据分析和趋势研究
- **全文搜索**：内置全文搜索功能，便于检索报告和文档内容
- **JSON/JSONB 支持**：灵活存储和查询半结构化数据，适合存储 AI 模型输出和报告模板
- **可扩展性**：支持水平分区和垂直扩展，能随系统规模增长而扩展
- **开源和成熟**：开源许可证，广泛的社区支持和成熟的生态系统

### 其他考虑的选项

1. **MySQL/MariaDB**
   - 优点：广泛使用，易于部署，轻量级
   - 缺点：地理空间和高级分析功能不如 PostgreSQL 强大

2. **MongoDB**
   - 优点：灵活的文档存储，适合存储非结构化数据
   - 缺点：事务支持有限，不适合需要强一致性的用户账户和权限管理

3. **SQL Server**
   - 优点：强大的企业级功能，与 Microsoft 生态集成良好
   - 缺点：许可成本较高，对小型部署可能过重

4. **Vector 数据库 (如 Milvus、Pinecone)**
   - 适用于：存储 AI 嵌入向量，支持相似性搜索
   - 建议：可作为 PostgreSQL 的补充，专门用于 RAG 系统的向量存储

## 2. 数据库架构设计

### 用户认证与权限管理模块

```sql
-- 用户表
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- 存储密码哈希
    full_name VARCHAR(100) NOT NULL,
    organization VARCHAR(200),
    department VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'researcher', 'user')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'locked')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- 角色权限关联表
CREATE TABLE role_permissions (
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'researcher', 'user')),
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id),
    PRIMARY KEY (role, permission_id)
);

-- 用户会话表
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- 用户活动日志
CREATE TABLE user_activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100)
);
```

### 聊天与会话管理模块

```sql
-- 聊天会话表
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    model VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- 聊天消息表
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER,
    metadata JSONB
);

-- 引用来源表
CREATE TABLE message_sources (
    source_id SERIAL PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES chat_messages(message_id),
    source_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    url VARCHAR(1024),
    metadata JSONB
);
```

### 文档和知识库管理模块

```sql
-- 文档表
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(1024),
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by UUID REFERENCES users(user_id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB
);

-- 文档块表
CREATE TABLE document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(document_id),
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536)  -- 使用PostgreSQL向量扩展
);

-- 向量索引
CREATE INDEX vector_index ON document_chunks USING ivfflat (embedding vector_ip_ops);
```

### 报告管理模块

```sql
-- 报告模板表
CREATE TABLE report_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL,
    content TEXT,
    metadata JSONB,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 生成的报告表
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES report_templates(template_id),
    session_id UUID REFERENCES chat_sessions(session_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    content TEXT,
    file_path VARCHAR(1024),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB
);
```

### 指标与数据管理模块

```sql
-- 指标类别表
CREATE TABLE indicator_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES indicator_categories(category_id),
    weight DECIMAL(5,2)
);

-- 指标表
CREATE TABLE indicators (
    indicator_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES indicator_categories(category_id),
    indicator_name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    weight DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 产业类别表
CREATE TABLE industry_categories (
    industry_id SERIAL PRIMARY KEY,
    industry_code VARCHAR(20) UNIQUE,
    industry_name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES industry_categories(industry_id),
    description TEXT,
    level INTEGER NOT NULL
);

-- 区域表
CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    region_code VARCHAR(20) UNIQUE,
    region_name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES regions(region_id),
    level INTEGER NOT NULL,
    geo_data GEOMETRY(MultiPolygon, 4326)  -- 使用PostGIS扩展
);

-- 指标数据表
CREATE TABLE indicator_data (
    data_id SERIAL PRIMARY KEY,
    indicator_id INTEGER NOT NULL REFERENCES indicators(indicator_id),
    industry_id INTEGER REFERENCES industry_categories(industry_id),
    region_id INTEGER REFERENCES regions(region_id),
    time_period VARCHAR(50) NOT NULL,  -- 如"2025-Q2"或"2025"
    value DECIMAL(15,4),
    source VARCHAR(255),
    confidence DECIMAL(5,2),
    is_predicted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 3. 数据库管理系统设计

### 数据库备份策略

1. **定时自动备份**
   - 每日增量备份
   - 每周完整备份
   - 每月归档备份，保留至少12个月

2. **备份验证**
   - 自动测试备份的可恢复性
   - 记录验证日志

3. **备份存储**
   - 本地快速访问副本
   - 异地备份（不同物理位置）
   - 可选云存储备份（如阿里云OSS/AWS S3）

### 数据库监控系统

1. **实时性能监控**
   - 连接数
   - 查询性能和慢查询
   - 缓存命中率
   - 资源使用率（CPU, 内存, 磁盘I/O）

2. **预警系统**
   - 基于阈值的警报
   - 异常模式检测
   - 多渠道通知（邮件, 短信, 企业微信）

3. **日志管理**
   - 集中式日志收集
   - 结构化日志分析
   - 自动化报告生成

### 数据库安全机制

1. **访问控制**
   - 基于角色的访问控制 (RBAC)
   - 最小权限原则
   - 定期权限审计

2. **数据加密**
   - 传输中加密 (TLS/SSL)
   - 静态数据加密
   - 敏感字段专项加密

3. **审计跟踪**
   - 完整的数据库操作审计
   - 用户活动监控
   - 异常行为检测

### 高可用性和灾难恢复

1. **主从复制**
   - 同步或异步复制
   - 自动故障转移

2. **集群设计**
   - 读写分离
   - 负载均衡

3. **灾难恢复计划**
   - 明确的恢复时间目标 (RTO)
   - 明确的恢复点目标 (RPO)
   - 定期灾难恢复演练

## 4. 数据库操作最佳实践

### 查询优化

1. **索引策略**
   - 为频繁查询的字段创建索引
   - 为外键创建索引
   - 定期分析和优化索引

2. **查询设计**
   - 避免使用 SELECT *
   - 优化JOIN操作
   - 使用查询缓存

### 连接池管理

1. **配置最佳实践**
   - 适当的池大小设置
   - 连接超时设置
   - 健康检查机制

2. **监控和维护**
   - 跟踪连接使用情况
   - 定期清理空闲连接
   - 负载峰值自动扩展

### 数据迁移和版本控制

1. **迁移策略**
   - 使用迁移工具 (如Flyway或Liquibase)
   - 基于版本的迁移脚本
   - 向前和向后兼容性考虑

2. **部署流程**
   - 与CI/CD管道集成
   - 自动化测试
   - 回滚计划

## 5. 数据库扩展和性能优化

### 分区策略

对大型表（如indicator_data）实施表分区:

```sql
CREATE TABLE indicator_data (
    -- 同上面的字段
) PARTITION BY RANGE (time_period);

-- 创建按年度分区
CREATE TABLE indicator_data_2024 PARTITION OF indicator_data
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE indicator_data_2025 PARTITION OF indicator_data
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 缓存策略

1. **应用层缓存**
   - 使用Redis缓存频繁访问的数据
   - 实现细粒度的缓存失效策略

2. **数据库缓存**
   - 适当配置PostgreSQL共享缓冲区
   - 使用物化视图缓存复杂查询结果

### 大规模数据处理

1. **批处理操作**
   - 使用批量插入而非单条插入
   - 实现分批处理的ETL流程

2. **异步处理**
   - 使用消息队列处理非实时数据操作
   - 实现数据处理的横向扩展

## 6. 实施建议

### 数据库环境规划

1. **环境分离**
   - 开发环境
   - 测试/QA环境
   - 预生产环境
   - 生产环境

2. **资源分配**
   - 生产环境: 高性能硬件，冗余配置
   - 开发/测试环境: 配置可较低但结构应与生产环境一致

### 实施时间表

1. **第一阶段: 基础设施设置** (2-3周)
   - 安装和配置PostgreSQL
   - 实现基础备份和监控
   - 设置开发环境

2. **第二阶段: 核心功能实现** (4-6周)
   - 用户认证与权限管理
   - 聊天与会话管理
   - 基础报告功能

3. **第三阶段: 高级功能和优化** (6-8周)
   - 文档和知识库管理
   - 高级分析功能
   - 性能优化和扩展

### 维护计划

1. **定期维护任务**
   - 每周数据库统计信息更新
   - 每月索引重建和优化
   - 每季度安全审计

2. **升级策略**
   - 定期评估版本更新需求
   - 先在非生产环境测试升级
   - 制定详细的升级和回滚计划

## 7. 数据库与前端集成

### ORM 策略

推荐使用**Prisma ORM**：
- 类型安全
- 自动生成类型
- 优秀的迁移支持
- 与TypeScript/JavaScript良好集成

```typescript
// Prisma模型示例
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String
  fullName  String   @map("full_name")
  role      UserRole
  status    UserStatus @default(PENDING)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  sessions  ChatSession[]

  @@map("users")
}

// 使用示例
const user = await prisma.user.findUnique({
  where: { username: loginRequest.username },
  include: { permissions: true }
});
```

### API层设计

1. **RESTful API**
   - 用于基本的CRUD操作
   - 清晰的资源命名和HTTP方法使用

2. **GraphQL**（可选）
   - 用于复杂的数据查询
   - 减少过度获取和多次请求

3. **实时数据**
   - 使用WebSocket进行实时通知
   - 使用订阅模式实现实时数据更新