# Dify Agent 集成指南

## 📋 概述

本指南详细说明如何将您在Dify平台开发的AI Agent与现有的产业集群发展潜力评估系统集成。通过集成，您可以利用Dify的强大AI能力，同时保持现有应用的完整性和用户体验。

## 🏗️ 当前应用架构分析

### 现有系统特点
- **前端框架**: React 18 + TypeScript + Vite
- **UI组件**: shadcn/ui + Tailwind CSS v4
- **状态管理**: React Context + Hooks
- **路由系统**: React Router v6
- **认证系统**: JWT + 角色权限控制
- **AI服务**: OpenAI/Claude直接集成
- **后端**: FastAPI + PostgreSQL + Redis
- **部署**: Docker + Nginx

### 核心功能模块
1. **用户认证系统** (`/context/AuthContext.tsx`)
2. **AI对话系统** (`/components/pages/ChatPage.tsx`)
3. **数据管理** (`/services/DataUploadService.ts`)
4. **数据可视化** (`/components/visualizations/`)
5. **模板系统** (`/components/pages/TemplatesPage.tsx`)
6. **管理功能** (`/components/pages/AdminPage.tsx`)

## 🔄 Dify Agent 集成方案

### 方案对比

| 集成方案 | 优势 | 劣势 | 适用场景 |
|---------|------|------|----------|
| **完全替换** | 功能强大，维护简单 | 迁移成本高，定制受限 | 重新设计系统 |
| **并行集成** | 渐进式迁移，风险低 | 维护成本高，用户体验分割 | 大型系统迁移 |
| **混合模式** | 最佳实践，功能互补 | 架构复杂度中等 | **推荐方案** |
| **API代理** | 集成简单，改动最小 | 功能受限，延迟增加 | 快速验证 |

## 🚀 推荐集成方案：混合模式

### 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Backend API    │    │   Dify Agent    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Chat UI     │ │◄──►│ │ Chat Router │ │◄──►│ │ AI Agent    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Legacy AI   │ │◄──►│ │ AI Manager  │ │◄──►│ │ Knowledge   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │ Base        │ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │ Data Viz    │ │◄──►│ │ Data API    │ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │ Workflows   │ │
└─────────────────┘    └─────────────────┘    │ └─────────────┘ │
                                              └─────────────────┘
```

## 📝 集成实施步骤

### 第一阶段：环境准备和服务创建

#### 1. 创建 Dify Agent 服务

```typescript
// services/DifyService.ts
export interface DifyConfig {
  apiKey: string;
  baseUrl: string;
  agentId: string;
  conversationId?: string;
}

export interface DifyMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
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

  /**
   * 发送消息到 Dify Agent
   */
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
        response_mode: 'blocking', // 或 'streaming'
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
      
      // 保存会话ID用于后续对话
      if (data.conversation_id) {
        this.conversationId = data.conversation_id;
      }

      return data;
    } catch (error) {
      console.error('Error sending message to Dify:', error);
      throw error;
    }
  }

  /**
   * 流式对话（WebSocket或SSE）
   */
  async sendStreamMessage(
    message: string,
    userId: string,
    onChunk: (chunk: string) => void,
    context?: Record<string, any>
  ): Promise<DifyResponse> {
    try {
      const payload = {
        query: message,
        conversation_id: this.conversationId,
        user: userId,
        inputs: context || {},
        response_mode: 'streaming',
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
        throw new Error(`Dify API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let finalResponse: DifyResponse | null = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                
                if (data.event === 'message') {
                  onChunk(data.answer);
                } else if (data.event === 'message_end') {
                  finalResponse = data;
                  this.conversationId = data.conversation_id;
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      }

      return finalResponse || {
        id: '',
        answer: '',
        conversation_id: this.conversationId || '',
        created_at: Date.now()
      };
    } catch (error) {
      console.error('Error in stream message:', error);
      throw error;
    }
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(limit: number = 20): Promise<DifyMessage[]> {
    if (!this.conversationId) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/messages?conversation_id=${this.conversationId}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation history: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data.map((msg: any) => ({
        id: msg.id,
        type: msg.type,
        content: msg.query || msg.answer,
        timestamp: new Date(msg.created_at).getTime(),
        metadata: msg.metadata
      }));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * 重置对话
   */
  resetConversation(): void {
    this.conversationId = null;
  }

  /**
   * 获取当前会话ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }
}
```

#### 2. 创建 AI Provider 管理器

```typescript
// services/AIProviderManager.ts
import { OpenAIService } from './OpenAIService';
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

export interface AIResponse {
  message: AIMessage;
  usage?: {
    tokens: number;
    cost?: number;
  };
  sources?: Array<{
    title: string;
    content: string;
    score?: number;
  }>;
}

export class AIProviderManager {
  private openaiService: OpenAIService;
  private difyService: DifyService;
  private currentProvider: AIProvider;

  constructor() {
    // 初始化各个服务
    this.openaiService = new OpenAIService();
    this.difyService = new DifyService({
      apiKey: import.meta.env.VITE_DIFY_API_KEY || '',
      baseUrl: import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1',
      agentId: import.meta.env.VITE_DIFY_AGENT_ID || ''
    });
    
    // 默认使用 Dify，回退到 OpenAI
    this.currentProvider = this.isDifyConfigured() ? AIProvider.DIFY : AIProvider.OPENAI;
  }

  /**
   * 检查 Dify 是否已配置
   */
  private isDifyConfigured(): boolean {
    return !!(
      import.meta.env.VITE_DIFY_API_KEY && 
      import.meta.env.VITE_DIFY_BASE_URL &&
      import.meta.env.VITE_DIFY_AGENT_ID
    );
  }

  /**
   * 设置当前AI提供商
   */
  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  /**
   * 获取当前AI提供商
   */
  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * 发送消息
   */
  async sendMessage(
    message: string,
    userId: string,
    context?: Record<string, any>,
    onStream?: (chunk: string) => void
  ): Promise<AIResponse> {
    try {
      switch (this.currentProvider) {
        case AIProvider.DIFY:
          return await this.sendDifyMessage(message, userId, context, onStream);
        
        case AIProvider.OPENAI:
          return await this.sendOpenAIMessage(message, userId, context, onStream);
        
        default:
          throw new Error(`Unsupported AI provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error(`Error with ${this.currentProvider} provider:`, error);
      
      // 自动降级到备用提供商
      if (this.currentProvider === AIProvider.DIFY) {
        console.log('Falling back to OpenAI...');
        return await this.sendOpenAIMessage(message, userId, context, onStream);
      }
      
      throw error;
    }
  }

  /**
   * 使用 Dify 发送消息
   */
  private async sendDifyMessage(
    message: string,
    userId: string,
    context?: Record<string, any>,
    onStream?: (chunk: string) => void
  ): Promise<AIResponse> {
    if (onStream) {
      // 流式响应
      const response = await this.difyService.sendStreamMessage(
        message,
        userId,
        onStream,
        context
      );

      return {
        message: {
          id: response.id,
          type: 'assistant',
          content: response.answer,
          timestamp: response.created_at,
          provider: AIProvider.DIFY,
          metadata: response.metadata
        },
        usage: response.metadata?.usage ? {
          tokens: response.metadata.usage.total_tokens,
        } : undefined,
        sources: response.metadata?.retrieval_documents?.map(doc => ({
          title: doc.title,
          content: doc.content,
          score: doc.score
        }))
      };
    } else {
      // 普通响应
      const response = await this.difyService.sendMessage(message, userId, context);

      return {
        message: {
          id: response.id,
          type: 'assistant',
          content: response.answer,
          timestamp: response.created_at,
          provider: AIProvider.DIFY,
          metadata: response.metadata
        },
        usage: response.metadata?.usage ? {
          tokens: response.metadata.usage.total_tokens,
        } : undefined,
        sources: response.metadata?.retrieval_documents?.map(doc => ({
          title: doc.title,
          content: doc.content,
          score: doc.score
        }))
      };
    }
  }

  /**
   * 使用 OpenAI 发送消息
   */
  private async sendOpenAIMessage(
    message: string,
    userId: string,
    context?: Record<string, any>,
    onStream?: (chunk: string) => void
  ): Promise<AIResponse> {
    // 这里调用您现有的 OpenAI 服务
    const response = await this.openaiService.sendMessage({
      message,
      context: context || {},
      stream: !!onStream,
      onStream
    });

    return {
      message: {
        id: `openai-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        provider: AIProvider.OPENAI,
        metadata: response.metadata
      },
      usage: response.usage ? {
        tokens: response.usage.total_tokens,
        cost: response.usage.cost
      } : undefined
    };
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(): Promise<AIMessage[]> {
    switch (this.currentProvider) {
      case AIProvider.DIFY:
        const difyHistory = await this.difyService.getConversationHistory();
        return difyHistory.map(msg => ({
          ...msg,
          type: msg.type === 'question' ? 'user' : 'assistant',
          provider: AIProvider.DIFY
        })) as AIMessage[];
      
      default:
        // 从本地存储或其他地方获取历史记录
        return [];
    }
  }

  /**
   * 重置对话
   */
  resetConversation(): void {
    switch (this.currentProvider) {
      case AIProvider.DIFY:
        this.difyService.resetConversation();
        break;
      
      default:
        // 清除其他提供商的对话状态
        break;
    }
  }
}
```

### 第二阶段：修改现有聊天组件

#### 3. 更新聊天页面组件

```typescript
// components/pages/ChatPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ChatInput } from '../ChatInput';
import { ChatMessage } from '../ChatMessage';
import { AIProviderManager, AIProvider, AIMessage } from '../../services/AIProviderManager';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner@2.0.3';
import {
  SettingsIcon,
  RefreshCwIcon,
  DownloadIcon,
  ZapIcon,
  BrainIcon,
  RobotIcon
} from 'lucide-react';

export function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [aiManager] = useState(() => new AIProviderManager());
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(
    aiManager.getCurrentProvider()
  );
  const [useStream, setUseStream] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 加载对话历史
  useEffect(() => {
    loadConversationHistory();
  }, [currentProvider]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const loadConversationHistory = async () => {
    try {
      const history = await aiManager.getConversationHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      provider: currentProvider
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const context = {
        // 添加产业集群分析相关的上下文
        domain: 'industrial_cluster_analysis',
        user_role: user?.role || 'user',
        timestamp: new Date().toISOString(),
        // 可以添加当前页面的数据作为上下文
        current_data: getCurrentPageContext()
      };

      let assistantMessage: AIMessage;

      if (useStream) {
        // 流式响应
        const response = await aiManager.sendMessage(
          content,
          user?.id || 'anonymous',
          context,
          (chunk: string) => {
            setStreamingMessage(prev => prev + chunk);
          }
        );

        assistantMessage = response.message;
        setStreamingMessage('');
      } else {
        // 普通响应
        const response = await aiManager.sendMessage(
          content,
          user?.id || 'anonymous',
          context
        );

        assistantMessage = response.message;
      }

      setMessages(prev => [...prev, assistantMessage]);

      // 显示使用的源文档（如果有）
      if (response.sources && response.sources.length > 0) {
        toast.success(`引用了 ${response.sources.length} 个相关文档`);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('发送消息失败，请稍后重试');
      
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: '抱歉，我现在无法处理您的请求。请稍后重试。',
        timestamp: Date.now(),
        provider: currentProvider
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    if (provider === currentProvider) return;
    
    setCurrentProvider(provider);
    aiManager.setProvider(provider);
    
    // 重置对话
    aiManager.resetConversation();
    setMessages([]);
    
    toast.info(`已切换到 ${getProviderName(provider)}`);
  };

  const handleResetConversation = () => {
    aiManager.resetConversation();
    setMessages([]);
    setStreamingMessage('');
    toast.info('对话已重置');
  };

  const getCurrentPageContext = () => {
    // 获取当前页面的上下文信息，比如已上传的数据、当前分析结果等
    return {
      page: 'chat',
      // 可以从其他服务获取当前的数据状态
    };
  };

  const getProviderName = (provider: AIProvider) => {
    switch (provider) {
      case AIProvider.DIFY: return 'Dify 智能助手';
      case AIProvider.OPENAI: return 'OpenAI GPT';
      case AIProvider.CLAUDE: return 'Claude';
      default: return provider;
    }
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case AIProvider.DIFY: return <RobotIcon className="h-4 w-4" />;
      case AIProvider.OPENAI: return <BrainIcon className="h-4 w-4" />;
      case AIProvider.CLAUDE: return <ZapIcon className="h-4 w-4" />;
      default: return <BrainIcon className="h-4 w-4" />;
    }
  };

  const exportConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      provider: currentProvider,
      messages: messages,
      user: user?.name || 'Anonymous'
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('对话记录已导出');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 页面标题和控制栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">智能分析助手</h1>
          <p className="text-muted-foreground">
            基于AI的产业集群发展潜力分析对话系统
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* AI提供商选择 */}
          <Select
            value={currentProvider}
            onValueChange={(value: AIProvider) => handleProviderChange(value)}
          >
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                {getProviderIcon(currentProvider)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AIProvider.DIFY}>
                <div className="flex items-center gap-2">
                  <RobotIcon className="h-4 w-4" />
                  Dify 智能助手
                </div>
              </SelectItem>
              <SelectItem value={AIProvider.OPENAI}>
                <div className="flex items-center gap-2">
                  <BrainIcon className="h-4 w-4" />
                  OpenAI GPT
                </div>
              </SelectItem>
              <SelectItem value={AIProvider.CLAUDE}>
                <div className="flex items-center gap-2">
                  <ZapIcon className="h-4 w-4" />
                  Claude
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetConversation}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportConversation}
            disabled={messages.length === 0}
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">对话设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="stream-mode">流式响应</Label>
                <Switch
                  id="stream-mode"
                  checked={useStream}
                  onCheckedChange={setUseStream}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  当前模型: {getProviderName(currentProvider)}
                </Badge>
                {currentProvider === AIProvider.DIFY && (
                  <Badge variant="secondary">支持知识库</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 聊天界面 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 主聊天区域 */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getProviderIcon(currentProvider)}
                  {getProviderName(currentProvider)}
                </CardTitle>
                <Badge variant="outline">
                  {messages.length} 条消息
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="text-lg mb-2">👋 欢迎使用智能分析助手</div>
                    <div>您可以向我询问产业集群发展相关的任何问题</div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isUser={message.type === 'user'}
                      provider={message.provider}
                    />
                  ))
                )}
                
                {/* 流式消息显示 */}
                {streamingMessage && (
                  <ChatMessage
                    message={{
                      id: 'streaming',
                      type: 'assistant',
                      content: streamingMessage,
                      timestamp: Date.now(),
                      provider: currentProvider
                    }}
                    isUser={false}
                    provider={currentProvider}
                    isStreaming={true}
                  />
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* 输入区域 */}
              <div className="border-t p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                  placeholder="请输入您的问题..."
                />
                
                {isLoading && (
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    AI 正在思考中...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 - 快捷操作 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">快捷问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "分析当前产业集群的发展潜力",
                "生成产业集群发展报告",
                "比较不同地区的产业优势",
                "预测未来发展趋势",
                "提供政策建议"
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-wrap"
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 使用统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">对话统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>消息数量:</span>
                  <span>{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>当前会话:</span>
                  <Badge variant="outline" className="text-xs">
                    活跃
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>AI 模型:</span>
                  <span className="text-xs">{getProviderName(currentProvider)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 第三阶段：环境配置和部署

#### 4. 更新环境变量配置

```bash
# .env.example
# 现有配置...

# Dify Agent 配置
VITE_DIFY_API_KEY=your_dify_api_key
VITE_DIFY_BASE_URL=https://api.dify.ai/v1
VITE_DIFY_AGENT_ID=your_agent_id

# AI 提供商选择 (dify|openai|claude)
VITE_DEFAULT_AI_PROVIDER=dify

# Dify 高级配置
VITE_DIFY_CONVERSATION_TIMEOUT=3600000
VITE_DIFY_MAX_TOKENS=4000
VITE_DIFY_TEMPERATURE=0.7
```

#### 5. 更新后端 API 路由

```python
# backend/main.py 添加 Dify 路由
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import Optional, Dict, Any

app = FastAPI(title="Industrial Cluster Assessment API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DifyProxyService:
    def __init__(self):
        self.api_key = os.getenv("DIFY_API_KEY")
        self.base_url = os.getenv("DIFY_BASE_URL", "https://api.dify.ai/v1")
        self.timeout = 30.0

    async def send_message(
        self,
        message: str,
        user_id: str,
        conversation_id: Optional[str] = None,
        inputs: Optional[Dict[str, Any]] = None
    ):
        """代理转发到 Dify API"""
        if not self.api_key:
            raise HTTPException(status_code=500, detail="Dify API key not configured")

        payload = {
            "query": message,
            "user": user_id,
            "conversation_id": conversation_id,
            "inputs": inputs or {},
            "response_mode": "blocking",
            "auto_generate_name": True
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat-messages",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Dify API error: {str(e)}"
                )

dify_service = DifyProxyService()

@app.post("/api/dify/chat")
async def dify_chat(
    message: str,
    user_id: str,
    conversation_id: Optional[str] = None,
    inputs: Optional[Dict[str, Any]] = None
):
    """Dify 聊天接口"""
    try:
        result = await dify_service.send_message(
            message=message,
            user_id=user_id,
            conversation_id=conversation_id,
            inputs=inputs
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dify/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    limit: int = 20
):
    """获取对话历史"""
    if not dify_service.api_key:
        raise HTTPException(status_code=500, detail="Dify API key not configured")

    headers = {
        "Authorization": f"Bearer {dify_service.api_key}",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{dify_service.base_url}/messages",
                params={"conversation_id": conversation_id, "limit": limit},
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch conversation: {str(e)}"
            )

# 健康检查端点
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "dify": bool(dify_service.api_key),
            "database": True,  # 检查数据库连接
        }
    }
```

### 第四阶段：测试和优化

#### 6. 集成测试脚本

```typescript
// tests/dify-integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DifyService } from '../services/DifyService';
import { AIProviderManager } from '../services/AIProviderManager';

describe('Dify Integration Tests', () => {
  let difyService: DifyService;
  let aiManager: AIProviderManager;

  beforeEach(() => {
    difyService = new DifyService({
      apiKey: process.env.VITE_DIFY_API_KEY || 'test-key',
      baseUrl: process.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1',
      agentId: process.env.VITE_DIFY_AGENT_ID || 'test-agent'
    });

    aiManager = new AIProviderManager();
  });

  it('should send message to Dify successfully', async () => {
    const response = await difyService.sendMessage(
      '测试消息',
      'test-user',
      { domain: 'industrial_cluster_analysis' }
    );

    expect(response).toBeDefined();
    expect(response.id).toBeTruthy();
    expect(response.answer).toBeTruthy();
    expect(response.conversation_id).toBeTruthy();
  });

  it('should handle streaming messages', async () => {
    const chunks: string[] = [];
    
    await difyService.sendStreamMessage(
      '请分析产业集群发展潜力',
      'test-user',
      (chunk) => chunks.push(chunk),
      { domain: 'industrial_cluster_analysis' }
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toBeTruthy();
  });

  it('should switch between AI providers', async () => {
    expect(aiManager.getCurrentProvider()).toBe('dify');

    aiManager.setProvider('openai');
    expect(aiManager.getCurrentProvider()).toBe('openai');

    aiManager.setProvider('dify');
    expect(aiManager.getCurrentProvider()).toBe('dify');
  });
});
```

## 🎯 最佳实践

### 数据安全
1. **API密钥管理**: 使用环境变量，不在代码中硬编码
2. **用户数据**: 确保用户对话数据的隐私保护
3. **访问控制**: 基于用户角色限制AI功能访问

### 性能优化
1. **响应缓存**: 缓存常见问题的响应
2. **请求优化**: 合并多个小请求
3. **错误重试**: 实现智能重试机制
4. **资源监控**: 监控API使用量和成本

### 用户体验
1. **渐进增强**: 确保在Dify不可用时有降级方案
2. **加载状态**: 提供清晰的加载和流式响应反馈
3. **错误处理**: 友好的错误提示和恢复建议
4. **上下文保持**: 维护对话的连续性

### 监控和维护
1. **日志记录**: 详细记录API调用和错误
2. **性能指标**: 监控响应时间和成功率
3. **用户反馈**: 收集用户对AI质量的反馈
4. **A/B测试**: 测试不同AI提供商的效果

## 🚀 部署清单

### 前端部署
- [ ] 更新环境变量配置
- [ ] 构建生产版本
- [ ] 更新Nginx配置
- [ ] 部署到CDN

### 后端部署
- [ ] 更新FastAPI路由
- [ ] 配置Dify API密钥
- [ ] 更新Docker配置
- [ ] 部署到云服务器

### 测试验证
- [ ] API连接测试
- [ ] 流式响应测试
- [ ] 错误处理测试
- [ ] 性能压力测试

### 监控设置
- [ ] 配置日志收集
- [ ] 设置性能监控
- [ ] 配置告警规则
- [ ] 建立运维流程

## 📞 故障排除

### 常见问题
1. **Dify API连接失败**: 检查API密钥和网络连接
2. **响应超时**: 调整超时设置和重试策略
3. **流式响应中断**: 检查WebSocket连接稳定性
4. **上下文丢失**: 确保会话ID正确传递

### 调试技巧
```typescript
// 启用详细日志
localStorage.setItem('debug', 'dify:*');

// 查看网络请求
console.log('Dify Request:', payload);

// 监控响应时间
const startTime = Date.now();
// ... API 调用
console.log('Response time:', Date.now() - startTime);
```

通过这个完整的集成方案，您可以将Dify Agent无缝集成到现有的React应用中，同时保持系统的灵活性和可维护性。