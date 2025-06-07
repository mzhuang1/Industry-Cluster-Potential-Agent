import { ApiService } from './ApiService';
import { toast } from "sonner@2.0.3";

// 搜索结果接口
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  imageUrl?: string;
  relevance?: number; // 0-100的相关性评分
  isVerified?: boolean; // 表示是否来自可信来源
}

// 搜索请求参数
export interface SearchRequest {
  query: string;
  language?: 'zh' | 'en';
  filter?: string; // 可以是行业、地区等
  maxResults?: number;
  includeDomains?: string[]; // 仅包含这些域名的结果
  excludeDomains?: string[]; // 排除这些域名的结果
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
}

// 搜索结果分类
export interface SearchResultCategory {
  name: string;
  count: number;
  results: SearchResult[];
}

// 搜索响应
export interface SearchResponse {
  query: string;
  totalResults: number;
  searchTime: number; // 搜索用时（毫秒）
  results: SearchResult[];
  categories?: SearchResultCategory[]; // 按来源、行业等分类的结果
  suggestedQueries?: string[]; // 建议的相关查询
}

// 模拟数据-搜索结果
const MOCK_SEARCH_RESULTS: Record<string, SearchResponse> = {
  "产业集群": {
    query: "产业集群",
    totalResults: 5,
    searchTime: 342,
    results: [
      {
        id: "1",
        title: "产业集群的定义与特征",
        url: "https://example.com/industrial-clusters-definition",
        snippet: "产业集群是指在特定地域内，以某一产业为核心，相关企业、专业化供应商、服务提供商、金融机构等紧密协作形成的网络组织。其主要特征包括地理集中性、专业化分工、创新网络和社会文化嵌入性。",
        source: "产业经济研究",
        publishedDate: "2024-05-02",
        relevance: 95,
        isVerified: true
      },
      {
        id: "2",
        title: "中国产业集群发展现状分析",
        url: "https://example.com/china-industrial-clusters",
        snippet: "目前，中国已形成长三角、珠三角、京津冀等多个具有国际竞争力的产业集群。这些集群在促进区域经济发展、提升产业竞争力方面发挥了重要作用。",
        source: "中国经济研究院",
        publishedDate: "2024-04-15",
        imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        relevance: 92,
        isVerified: true
      },
      {
        id: "3",
        title: "产业集群创新生态系统构建研究",
        url: "https://example.com/cluster-innovation-ecosystem",
        snippet: "产业集群创新生态系统是产业集群持续发展的关键。通过构建完善的创新网络、知识共享机制和创新支持体系，可以显著提升集群的创新能力和国际竞争力。",
        source: "创新管理期刊",
        publishedDate: "2024-03-28",
        relevance: 88
      },
      {
        id: "4",
        title: "数字化转型对产业集群的影响",
        url: "https://example.com/digital-transformation-clusters",
        snippet: "数字化转型正深刻改变产业集群的组织形式和运行模式。云计算、大数据、人工智能等新技术的应用，使集群内的信息流动更加高效，资源配置更加优化。",
        source: "数字经济研究",
        publishedDate: "2024-05-10",
        relevance: 85
      },
      {
        id: "5",
        title: "产业集群竞争力评估方法研究",
        url: "https://example.com/cluster-competitiveness-evaluation",
        snippet: "产业集群竞争力评估是集群管理和政策制定的重要依据。本研究提出了一套包含创新能力、产业链完整性、人才结构、国际化水平等维度的综合评估体系。",
        source: "区域经济研究",
        publishedDate: "2024-02-20",
        relevance: 80,
        isVerified: true
      }
    ],
    categories: [
      {
        name: "学术研究",
        count: 3,
        results: []
      },
      {
        name: "政策分析",
        count: 1,
        results: []
      },
      {
        name: "案例研究",
        count: 1,
        results: []
      }
    ],
    suggestedQueries: [
      "产业集群创新能力",
      "产业集群政策支持",
      "产业集群发展模式",
      "产业集群国际比较"
    ]
  },
  "生物医药产业集群": {
    query: "生物医药产业集群",
    totalResults: 4,
    searchTime: 287,
    results: [
      {
        id: "1",
        title: "中国生物医药产业集群发展报告",
        url: "https://example.com/biopharma-cluster-report",
        snippet: "近年来，中国生物医药产业集群快速发展，已形成以北京中关村、上海张江、苏州工业园区、广州科学城等为代表的多个国家级生物医药产业基地。这些集群在创新药研发、高端医疗器械制造等领域具有较强竞争力。",
        source: "中国产业发展研究网",
        publishedDate: "2024-05-05",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        relevance: 96,
        isVerified: true
      },
      {
        id: "2",
        title: "生物医药产业集群创新生态构建",
        url: "https://example.com/biopharma-innovation-ecosystem",
        snippet: "生物医药产业创新具有投入大、周期长、风险高的特点，建设完善的创新生态系统对产业集群发展至关重要。研究表明，产学研医深度融合、多元化投融资体系和专业化服务平台是生物医药集群成功的关键因素。",
        source: "生物技术与经济",
        publishedDate: "2024-04-18",
        relevance: 93
      },
      {
        id: "3",
        title: "全球生物医药产业集群比较研究",
        url: "https://example.com/global-biopharma-clusters",
        snippet: "波士顿/剑桥、旧金山湾区、伦敦/剑桥/牛津是全球领先的生物医药产业集群。这些集群依托顶尖大学和研究机构，形成了完善的创新网络和产业链，在全球生物医药创新中占据主导地位。中国生物医药集群正在加速追赶，但在原创性创新方面仍有差距。",
        source: "国际产业研究",
        publishedDate: "2024-03-22",
        relevance: 90,
        isVerified: true
      },
      {
        id: "4",
        title: "后疫情时代生物医药产业集群发展新趋势",
        url: "https://example.com/post-covid-biopharma-trends",
        snippet: "COVID-19疫情加速了全球生物医药产业格局重塑。数字化转型、研发国际化和产业链区域化成为主要趋势。中国生物医药产业集群在疫苗、诊断试剂和创新药研发方面取得显著进展，国际影响力不断提升。",
        source: "健康产业评论",
        publishedDate: "2024-05-15",
        relevance: 87
      }
    ],
    suggestedQueries: [
      "生物医药产业创新政策",
      "生物医药人才结构",
      "生物医药投融资体系",
      "生物医药产业国际合作"
    ]
  },
  "artificial intelligence industry cluster": {
    query: "artificial intelligence industry cluster",
    totalResults: 4,
    searchTime: 310,
    results: [
      {
        id: "1",
        title: "Global AI Industry Clusters: A Comparative Analysis",
        url: "https://example.com/global-ai-clusters",
        snippet: "Silicon Valley, Beijing, Boston, and London have emerged as the world's leading AI industry clusters. These regions benefit from a concentration of top research institutions, venture capital, and technology giants that create a virtuous cycle of innovation and talent attraction.",
        source: "AI Economic Review",
        publishedDate: "2024-05-08",
        imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        relevance: 95,
        isVerified: true
      },
      {
        id: "2",
        title: "The Role of Policy in AI Cluster Development",
        url: "https://example.com/ai-policy-cluster",
        snippet: "Government policies play a crucial role in AI industry cluster formation and growth. Successful strategies include targeted R&D funding, regulatory sandboxes, data sharing frameworks, and specialized infrastructure development. Countries with national AI strategies have seen accelerated cluster development.",
        source: "Technology Policy Institute",
        publishedDate: "2024-04-12",
        relevance: 92
      },
      {
        id: "3",
        title: "AI Talent Mobility and Cluster Dynamics",
        url: "https://example.com/ai-talent-mobility",
        snippet: "Talent mobility is a key factor in AI cluster development. Research shows that regions with high concentration of AI specialists and effective talent attraction policies create stronger innovation ecosystems. Universities with strong AI programs serve as critical anchors for cluster formation.",
        source: "Journal of Innovation Economics",
        publishedDate: "2024-03-25",
        relevance: 88,
        isVerified: true
      },
      {
        id: "4",
        title: "Emerging AI Clusters in Asia: Opportunities and Challenges",
        url: "https://example.com/emerging-asian-ai-clusters",
        snippet: "Beyond established hubs in Beijing and Shanghai, new AI clusters are emerging in Shenzhen, Hangzhou, Seoul, Singapore, and Bangalore. These clusters are capitalizing on manufacturing expertise, large domestic markets, and supportive government policies to develop specialized AI capabilities in areas like computer vision, natural language processing, and industrial AI applications.",
        source: "Asian Technology Review",
        publishedDate: "2024-05-01",
        relevance: 85
      }
    ],
    suggestedQueries: [
      "AI industry investment trends",
      "AI cluster innovation metrics",
      "AI talent development strategies",
      "AI industry supply chain"
    ]
  }
};

export class SearchService {
  /**
   * 执行在线搜索
   * @param request 搜索请求参数
   * @returns 搜索结果
   */
  static async search(request: SearchRequest): Promise<SearchResponse> {
    // 检查是否处于模拟模式
    if (ApiService.isMockMode()) {
      return this.mockSearch(request);
    }

    try {
      // 实际API搜索请求
      const response = await ApiService.post('/search', request);
      return response.data;
    } catch (error) {
      console.error('Search API error:', error);
      
      // 如果API调用失败，切换到模拟模式
      ApiService.setMockMode(true);
      toast.error('搜索API连接失败，切换到模拟数据');
      
      // 返回模拟数据
      return this.mockSearch(request);
    }
  }

  /**
   * 获取搜索建议（自动完成）
   * @param query 查询文本
   * @param language 语言
   * @returns 建议列表
   */
  static async getSuggestions(query: string, language: 'zh' | 'en' = 'zh'): Promise<string[]> {
    if (ApiService.isMockMode()) {
      // 模拟搜索建议
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (language === 'zh') {
        if (query.includes('产业')) {
          return [
            '产业集群',
            '产业政策',
            '产业转型',
            '产业发展规划',
            '产业链韧性'
          ];
        } else if (query.includes('医药')) {
          return [
            '医药产业集群',
            '医药研发投入',
            '医药产业政策',
            '医药人才培养'
          ];
        }
      } else {
        if (query.includes('industr')) {
          return [
            'industrial cluster',
            'industry 4.0',
            'industrial policy',
            'industrial transformation'
          ];
        } else if (query.includes('ai') || query.includes('artificial')) {
          return [
            'artificial intelligence industry',
            'ai cluster development',
            'ai innovation ecosystem',
            'ai talent mobility'
          ];
        }
      }
      
      return [];
    }

    try {
      const response = await ApiService.get(`/search/suggestions?query=${encodeURIComponent(query)}&language=${language}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      
      // 在API错误时返回空数组
      return [];
    }
  }

  /**
   * 模拟搜索，用于离线模式
   * @param request 搜索请求参数
   * @returns 模拟的搜索结果
   */
  private static async mockSearch(request: SearchRequest): Promise<SearchResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { query } = request;
    
    // 尝试查找精确匹配的查询
    if (query in MOCK_SEARCH_RESULTS) {
      return MOCK_SEARCH_RESULTS[query];
    }
    
    // 如果没有精确匹配，尝试查找部分匹配
    for (const key of Object.keys(MOCK_SEARCH_RESULTS)) {
      if (query.includes(key) || key.includes(query)) {
        const result = { ...MOCK_SEARCH_RESULTS[key] };
        result.query = query; // 更新查询字符串
        return result;
      }
    }
    
    // 如果没有匹配，返回通用结果
    let defaultResults: SearchResponse;
    
    if (request.language === 'en') {
      defaultResults = {
        query: query,
        totalResults: 1,
        searchTime: 310,
        results: [
          {
            id: "generic-1",
            title: `Search results for "${query}"`,
            url: "https://example.com/search-results",
            snippet: "This is a simulated search result for your query in mock mode. In actual operation, this would connect to a real search API to provide relevant results.",
            source: "Simulated Source",
            publishedDate: new Date().toISOString().split('T')[0],
            relevance: 70
          }
        ],
        suggestedQueries: ["Try a more specific query", "Use industry keywords", "Include location information"]
      };
    } else {
      defaultResults = {
        query: query,
        totalResults: 1,
        searchTime: 310,
        results: [
          {
            id: "generic-1",
            title: `"${query}"的搜索结果`,
            url: "https://example.com/search-results",
            snippet: "这是模拟模式下生成的搜索结果。在实际运行中，系统会连接到真实的搜索API来提供相关结果。",
            source: "模拟来源",
            publishedDate: new Date().toISOString().split('T')[0],
            relevance: 70
          }
        ],
        suggestedQueries: ["尝试更具体的查询", "使用行业关键词", "包含地域信息"]
      };
    }
    
    return defaultResults;
  }
}