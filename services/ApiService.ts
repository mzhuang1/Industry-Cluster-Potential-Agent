// API service for interacting with the FastAPI backend or directly with OpenAI API

import { OpenAIService } from './OpenAIService';
import { toast } from "sonner";

// Base API URL - update this with your actual backend URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8021';

// Flag to determine if we're in mock mode (no backend available)
let USE_MOCK_DATA = false;

// Flag to determine if we're using direct OpenAI API
let USE_DIRECT_OPENAI = true;

// Flag to track if we've already logged connection errors
let HAS_LOGGED_CONNECTION_ERROR = false;

// Flag to track if we're currently trying to reconnect
let IS_RECONNECTING = false;

// Default to mock mode for initial load to prevent errors
// Will be updated by healthCheck
USE_MOCK_DATA = true;

// Function to generate more intelligent mock responses based on message content
function generateIntelligentMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific topics and generate appropriate responses
  if (lowerMessage.includes('产业集群') || lowerMessage.includes('产业') || lowerMessage.includes('集群')) {
    return `关于产业集群发展的分析：

根据您提到的"${message}"，我来为您分析相关的产业集群发展情况：

## 主要发现

1. **发展现状**: 该产业集群已形成较为完整的生态体系，在核心技术、人才聚集和产业链配套方面表现良好。

2. **竞争优势**: 
   - 地理位置优越，交通便利
   - 政策支持力度大，营商环境优化
   - 创新要素集聚，产学研合作活跃
   - 产业链相对完整，协同效应明显

3. **发展潜力**: 预计未来3-5年将保持15-20%的年均增长率，在技术创新、市场拓展和国际合作方面有很大提升空间。

## 建议措施

- 加强关键技术研发投入
- 完善产业链薄弱环节
- 提升国际化合作水平
- 优化人才引进和培养机制

您是否希望我针对某个特定方面进行更深入的分析？`;
  }
  
  if (lowerMessage.includes('报告') || lowerMessage.includes('分析') || lowerMessage.includes('评估')) {
    return `关于您提到的"${message}"：

我可以帮您生成专业的分析报告，涵盖以下几个方面：

## 分析框架

1. **现状评估**
   - 基础数据收集和整理
   - 发展阶段和规模分析
   - 主要特征和优势识别

2. **对比分析**
   - 同行业标杆对比
   - 国内外先进经验借鉴
   - 竞争力评估

3. **趋势预测**
   - 市场发展趋势分析
   - 技术演进方向预判
   - 政策环境变化影响

4. **建议措施**
   - 短期行动计划
   - 中长期发展策略
   - 风险防控措施

您可以告诉我具体需要分析的行业或主题，我将为您提供更详细的专业建议。`;
  }
  
  if (lowerMessage.includes('生物医药') || lowerMessage.includes('医药') || lowerMessage.includes('生物')) {
    return `生物医药产业发展分析：

针对您关注的生物医药领域，以下是关键分析要点：

## 产业现状
- **市场规模**: 国内生物医药市场规模超过3万亿元，年增长率保持在10%以上
- **创新能力**: 创新药研发投入逐年增加，部分领域已达国际先进水平
- **产业集群**: 形成以长三角、珠三角、京津冀为核心的产业集群

## 发展机遇
1. **政策利好**: "健康中国"战略深入实施，医保改革持续推进
2. **需求增长**: 人口老龄化加速，慢性病发病率上升
3. **技术突破**: 基因治疗、细胞治疗等新技术快速发展

## 投资建议
- 重点关注创新药研发企业
- 布局精准医疗和个性化治疗领域
- 关注医疗器械国产化替代机会

您对哪个细分领域比较感兴趣？我可以提供更具体的分析。`;
  }
  
  if (lowerMessage.includes('人工智能') || lowerMessage.includes('ai') || lowerMessage.includes('智能')) {
    return `人工智能产业发展分析：

关于AI产业发展，这里是核心观察：

## 市场态势
- **产业规模**: 中国AI产业规模超过4000亿元，预计2025年将突破8000亿元
- **应用场景**: 从消费级应用扩展到工业、医疗、金融等垂直领域
- **技术成熟度**: 计算机视觉、语音识别等技术已达商用水平

## 重点领域
1. **工业AI**: 智能制造、预测维护、质量检测
2. **AIoT**: 智能家居、智慧城市、车联网
3. **AI芯片**: 云端训练芯片、边缘推理芯片
4. **AI医疗**: 医学影像、药物研发、诊断辅助

## 发展趋势
- 从技术驱动向应用驱动转变
- 大模型技术持续突破
- 产业融合加速深化
- 标准化和规范化完善

您希望了解AI在哪个具体应用场景的发展情况？`;
  }
  
  if (lowerMessage.includes('投资') || lowerMessage.includes('机会') || lowerMessage.includes('项目')) {
    return `投资机会分析：

基于当前市场环境，以下是主要投资机会分析：

## 热点领域
1. **新兴技术**: 人工智能、生物技术、新材料、清洁能源
2. **消费升级**: 健康消费、智能消费、绿色消费
3. **产业数字化**: 传统产业的数字化转型升级
4. **基础设施**: 新基建相关领域投资机会

## 投资策略
- **短期投资**: 关注政策利好和市场热点
- **中期布局**: 重点关注技术成熟度和商业化前景
- **长期配置**: 聚焦具有长期增长潜力的核心资产

## 风险提示
- 技术风险：新技术商业化不确定性
- 市场风险：需求波动和竞争加剧
- 政策风险：监管政策变化影响
- 资金风险：流动性和融资成本变化

您对哪个投资领域比较感兴趣？我可以提供更详细的投资建议。`;
  }
  
  // Default response for general queries
  return `基于您的询问"${message}"，我来为您提供相关分析：

## 分析要点

1. **现状概览**: 该领域目前发展势头良好，具备一定的市场基础和技术积累。

2. **发展机遇**:
   - 政策环境持续优化
   - 市场需求稳步增长
   - 技术创新加速推进
   - 产业生态逐步完善

3. **面临挑战**:
   - 技术创新能力有待提升
   - 市场竞争日趋激烈  
   - 人才供给存在缺口
   - 资金投入需要加强

4. **发展建议**:
   - 加强核心技术研发
   - 完善产业配套体系
   - 提升人才培养质量
   - 拓展国际合作空间

## 未来展望

预计该领域在未来3-5年将保持快速发展态势，建议重点关注技术创新、市场应用和生态建设等方面的进展。

您希望我对其中哪个方面进行更深入的分析？`;
}

// Mock data for offline mode
const mockData = {
  sessions: [] as ChatSession[],
  models: [
    { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
    { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" }
  ] as ModelInfo[],
  report_templates: [
    { 
      id: "template-1", 
      name: "产业集群发展评估", 
      description: "全面评估产业集群的发展状况、竞争力和未来潜力" 
    },
    { 
      id: "template-2", 
      name: "区域产业布局分析", 
      description: "分析特定区域的产业布局、结构和优化方向" 
    },
    { 
      id: "template-3", 
      name: "产业链配套度评估", 
      description: "评估产业链的完整性、配套能力和薄弱环节" 
    }
  ] as ReportTemplate[],
  reports: [] as ReportData[]
};

// ApiService export that follows
export const ApiService = {
  // Health check and connection management
  healthCheck: async (): Promise<boolean> => {
    try {
      // Handle network errors gracefully
      if (!navigator.onLine) {
        console.log("Browser reports offline status, switching to mock mode");
        USE_MOCK_DATA = true;
        return false;
      }
      
      // Set a timeout for the fetch request (reduced to 3 seconds for faster feedback)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Implement health check logic with better error handling
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }).catch(err => {
        clearTimeout(timeoutId);
        // Handle specific error types
        if (err.name === 'AbortError') {
          console.log("Health check timed out after 3 seconds");
        } else if (err instanceof TypeError) {
          console.log("Network error during health check:", err.message);
        } else {
          console.log("Unexpected error during health check:", err.message);
        }
        USE_MOCK_DATA = true;
        return null;
      });
      
      clearTimeout(timeoutId);
      
      // If response is null (from the catch block above), return false
      if (!response) {
        return false;
      }
      
      // Check if response is successful
      if (response.ok) {
        // Try to parse response body to ensure it's a valid health check endpoint
        try {
          const healthData = await response.json();
          console.log("Health check successful:", healthData);
          USE_MOCK_DATA = false;
          return true;
        } catch (parseError) {
          console.log("Health check endpoint returned non-JSON response, assuming healthy");
          USE_MOCK_DATA = false;
          return true;
        }
      } else {
        console.log(`Health check failed with status: ${response.status} ${response.statusText}`);
        USE_MOCK_DATA = true;
        return false;
      }
    } catch (error) {
      // This will catch any other errors, including AbortController timeouts
      console.error("Health check failed with unexpected error:", error);
      USE_MOCK_DATA = true;
      return false;
    }
  },
  
  attemptReconnect: async (): Promise<boolean> => {
    if (IS_RECONNECTING) {
      console.log("Reconnection already in progress, skipping");
      return false;
    }
    
    IS_RECONNECTING = true;
    const startTime = Date.now();
    
    try {
      // Handle case where browser reports being offline
      if (!navigator.onLine) {
        console.log("Browser reports offline status, cannot reconnect");
        USE_MOCK_DATA = true;
        return false;
      }
      
      console.log("Attempting to reconnect to API server...");
      
      // Try multiple connection attempts with exponential backoff
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Reconnection attempt ${attempt}/3`);
        
        const isConnected = await ApiService.healthCheck();
        if (isConnected) {
          const duration = Date.now() - startTime;
          console.log(`Successfully reconnected to API server in ${duration}ms (attempt ${attempt})`);
          USE_MOCK_DATA = false;
          HAS_LOGGED_CONNECTION_ERROR = false; // Reset error logging flag
          return true;
        }
        
        // Wait before next attempt (exponential backoff: 1s, 2s, 4s)
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`All reconnection attempts failed after ${duration}ms`);
      return false;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Reconnection attempt failed after ${duration}ms:`, error);
      USE_MOCK_DATA = true;
      return false;
    } finally {
      IS_RECONNECTING = false;
    }
  },
  
  isMockMode: (): boolean => {
    return USE_MOCK_DATA;
  },
  
  setMockMode: (mode: boolean): void => {
    USE_MOCK_DATA = mode;
  },
  
  getApiBaseUrl: (): string => {
    return API_BASE_URL;
  },
  
  // 获取连接状态信息
  getConnectionInfo: () => {
    return {
      baseUrl: API_BASE_URL,
      isMockMode: USE_MOCK_DATA,
      isDirectOpenAI: USE_DIRECT_OPENAI,
      isReconnecting: IS_RECONNECTING,
      hasLoggedError: HAS_LOGGED_CONNECTION_ERROR
    };
  },
  
  // 强制刷新连接状态
  forceReconnect: async (): Promise<boolean> => {
    console.log("Force reconnecting to API server...");
    USE_MOCK_DATA = false; // 临时禁用mock模式进行测试
    HAS_LOGGED_CONNECTION_ERROR = false;
    IS_RECONNECTING = false;
    
    return await ApiService.attemptReconnect();
  },
  
  // Chat sessions methods
  getChatSessions: async (): Promise<ChatSession[]> => {
    if (USE_MOCK_DATA) {
      return mockData.sessions;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching chat sessions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
      toast.error("Failed to load chat sessions");
      return mockData.sessions;
    }
  },
  
  getChatSession: async (sessionId: string): Promise<ChatSession> => {
    if (USE_MOCK_DATA) {
      const session = mockData.sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      return session;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching chat session: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch chat session ${sessionId}:`, error);
      toast.error("Failed to load chat session");
      
      // Fallback to mock data
      const session = mockData.sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      return session;
    }
  },
  
  createChatSession: async (title: string, model: ModelType): Promise<ChatSession> => {
    if (USE_MOCK_DATA) {
      const newSession: ChatSession = {
        id: `new-${Date.now()}`,
        title,
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        model
      };
      mockData.sessions.unshift(newSession);
      return newSession;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, model })
      });
      
      if (!response.ok) {
        throw new Error(`Error creating chat session: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to create chat session:", error);
      toast.error("Failed to create new chat session");
      
      // Fallback to mock
      const newSession: ChatSession = {
        id: `new-${Date.now()}`,
        title,
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        model
      };
      mockData.sessions.unshift(newSession);
      return newSession;
    }
  },
  
  deleteChatSession: async (sessionId: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      const index = mockData.sessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        mockData.sessions.splice(index, 1);
        return true;
      }
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Failed to delete chat session ${sessionId}:`, error);
      toast.error("Failed to delete chat session");
      return false;
    }
  },
  
  // 简化的聊天消息发送方法（用于ChatPage）
  sendChatMessage: async (message: string, model: string = 'gpt-4'): Promise<string> => {
    // 转换模型名称
    let modelType: ModelType;
    switch (model) {
      case 'gpt-4':
        modelType = ModelType.GPT_4;
        break;
      case 'gpt-3.5':
        modelType = ModelType.GPT_35_TURBO;
        break;
      case 'claude-3':
        modelType = ModelType.CLAUDE_3_OPUS;
        break;
      default:
        modelType = ModelType.GPT_4;
    }

    // 构建请求对象
    const request: ChatRequest = {
      message,
      model: modelType,
      temperature: 0.7,
      use_rag: true
    };

    try {
      const response = await ApiService.sendChatMessageDetailed(request);
      return response.reply;
    } catch (error) {
      console.error('Error in simplified sendChatMessage:', error);
      throw error;
    }
  },

  // 详细的聊天消息发送方法
  sendChatMessageDetailed: async (request: ChatRequest): Promise<ChatResponse> => {
    if (USE_DIRECT_OPENAI && !USE_MOCK_DATA) {
      try {
        console.log("Attempting to use direct OpenAI API for message");
        
        // First check if we can access OpenAI API
        const isAvailable = await OpenAIService.checkAvailability();
        
        if (!isAvailable) {
          console.log("OpenAI API is not available, falling back to alternatives");
          throw new Error("OpenAI API is not available");
        }
        
        // If we're using direct OpenAI API, route through the OpenAIService
        const reply = await OpenAIService.sendMessage(request.message, request.model);
        
        // Create response in expected format
        return {
          session_id: request.session_id || 'direct-openai',
          reply,
          sources: []
        };
      } catch (error) {
        console.error("Direct OpenAI API call failed:", error);
        
        // If we get a network error, set mock mode
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.log("Network error reaching OpenAI API, switching to mock mode");
          USE_MOCK_DATA = true;
        }
        
        // Fall through to other methods if direct API fails
      }
    }
    
    if (USE_MOCK_DATA) {
      // Simulate a delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the intelligent mock response generator for more tailored responses
      const mockReply = generateIntelligentMockResponse(request.message);
      
      return {
        session_id: request.session_id || 'mock-session',
        reply: mockReply,
        sources: []
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to send chat message:", error);
      toast.error("Failed to send message. Please try again later.");
      
      // Fallback to a basic mock response
      return {
        session_id: request.session_id || 'error-session',
        reply: "I'm sorry, I couldn't process your request at this time. Please try again later.",
        sources: []
      };
    }
  },
  
  // Models methods
  getAvailableModels: async (): Promise<ModelInfo[]> => {
    if (USE_MOCK_DATA) {
      return mockData.models;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching models: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch available models:", error);
      return mockData.models;
    }
  },
  
  // Report templates methods
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    if (USE_MOCK_DATA) {
      return mockData.report_templates;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching report templates: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch report templates:", error);
      return mockData.report_templates;
    }
  },
  
  getReportTemplate: async (templateId: string): Promise<ReportTemplate> => {
    if (USE_MOCK_DATA) {
      const template = mockData.report_templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      return template;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports/templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching report template: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch report template ${templateId}:`, error);
      
      // Fallback to mock data
      const template = mockData.report_templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      return template;
    }
  },
  
  // Reports methods
  generateReport: async (request: ReportRequest): Promise<ReportResponse> => {
    if (USE_MOCK_DATA) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        report_id: `report-${Date.now()}`,
        download_url: '#',
        message: 'Report generated successfully (mock data)'
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`Error generating report: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report. Please try again later.");
      
      return {
        report_id: '',
        download_url: '',
        message: 'Failed to generate report'
      };
    }
  },
  
  getReports: async (): Promise<ReportData[]> => {
    if (USE_MOCK_DATA) {
      return mockData.reports;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching reports: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return mockData.reports;
    }
  },
  
  getReport: async (reportId: string): Promise<ReportData> => {
    if (USE_MOCK_DATA) {
      const report = mockData.reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error(`Report not found: ${reportId}`);
      }
      return report;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching report: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch report ${reportId}:`, error);
      
      // Fallback to mock data
      const report = mockData.reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error(`Report not found: ${reportId}`);
      }
      return report;
    }
  },

  // Document upload method
  uploadDocument: async (file: File): Promise<{id: string, message: string}> => {
    if (USE_MOCK_DATA) {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        id: `doc-${Date.now()}`,
        message: 'Document uploaded successfully (mock mode)'
      };
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error uploading document: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document. Please try again later.");
      
      // Fallback response
      return {
        id: `doc-error-${Date.now()}`,
        message: 'Document upload failed'
      };
    }
  },

  // Generic GET method for API calls
  get: async (endpoint: string): Promise<{data: any}> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API GET ${endpoint} failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Failed to GET ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic POST method for API calls
  post: async (endpoint: string, body: any): Promise<{data: any}> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`API POST ${endpoint} failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Failed to POST ${endpoint}:`, error);
      throw error;
    }
  }
};

// Models
export enum ModelType {
  GPT_4 = "gpt-4",
  GPT_35_TURBO = "gpt-3.5-turbo",
  CLAUDE_3_OPUS = "claude-3-opus",
  CLAUDE_3_SONNET = "claude-3-sonnet",
  CLAUDE_3_HAIKU = "claude-3-haiku"
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  model: ModelType;
}

export interface ChatRequest {
  session_id?: string;
  message: string;
  model: ModelType;
  temperature?: number;
  use_rag?: boolean;
  industry_filter?: string;
  region_filter?: string;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  sources?: any[];
}

export interface ReportRequest {
  session_id: string;
  report_type: string;
  title: string;
  industry?: string;
  region?: string;
  include_charts: boolean;
  language: string;
}

export interface ReportResponse {
  report_id: string;
  download_url: string;
  message: string;
}

export interface ReportData {
  id: string;
  title: string;
  report_type: string;
  created_at: string;
  download_url: string;
  industry?: string;
  region?: string;
  language: string;
  status: "completed" | "processing" | "failed";
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  industry?: string;
  region?: string;
}