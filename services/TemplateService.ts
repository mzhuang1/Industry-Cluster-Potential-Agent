import { ApiService } from './ApiService';

export interface TemplateChart {
  title: string;
  type: string;
  description?: string;
  dataKey?: string;
}

export interface TemplateSubsection {
  title: string;
  description: string;
}

export interface TemplateSection {
  title: string;
  description: string;
  subsections?: TemplateSubsection[];
  charts?: TemplateChart[];
  dataRequirements?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt?: string;
  usageCount: number;
  sections: TemplateSection[];
  suitableScenarios: string[];
  estimatedPages: number;
  sampleTitle?: string;
  tags?: string[];
}

export interface ReportGenerationOptions {
  templateId: string;
  title: string;
  clusterName: string;
  customParameters?: Record<string, any>;
  includeCharts?: boolean;
  includeExecutiveSummary?: boolean;
  language?: 'zh' | 'en';
}

export interface GeneratedReport {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  templateId: string;
  status: 'complete' | 'processing' | 'failed';
  downloadUrl?: string;
  previewUrl?: string;
}

// 模拟报告内容存储
const MOCK_REPORTS: Map<string, GeneratedReport> = new Map();

// 生成详细的模拟报告内容
function generateMockReportContent(options: ReportGenerationOptions, template: ReportTemplate): string {
  const { title, clusterName, includeExecutiveSummary, includeCharts } = options;
  
  let content = `# ${title}\n\n`;
  
  // 添加基本信息
  content += `**产业集群**: ${clusterName}\n`;
  content += `**报告类型**: ${template.name}\n`;
  content += `**生成时间**: ${new Date().toLocaleString()}\n`;
  content += `**预计页数**: ${template.estimatedPages}页\n\n`;
  
  // 添加执行摘要
  if (includeExecutiveSummary) {
    content += `## 执行摘要\n\n`;
    content += `本报告基于"${template.name}"模板，对${clusterName}进行了全面分析。`;
    content += `通过多维度评估，发现该产业集群在以下方面表现突出：\n\n`;
    content += `- **综合竞争力**: 在同类产业集群中处于领先地位\n`;
    content += `- **创新能力**: 研发投入比例高于行业平均水平\n`;
    content += `- **产业链完整性**: 上下游企业分布均衡\n`;
    content += `- **人才聚集**: 高学历人才占比较高\n\n`;
    content += `建议重点关注国际化水平提升和数字化转型，以进一步增强竞争优势。\n\n`;
  }
  
  // 根据模板章节生成内容
  template.sections.forEach((section, index) => {
    content += `## ${index + 1}. ${section.title}\n\n`;
    content += `${section.description}\n\n`;
    
    // 添加子章节
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsection, subIndex) => {
        content += `### ${index + 1}.${subIndex + 1} ${subsection.title}\n\n`;
        content += `${subsection.description}\n\n`;
        
        // 添加示例内容
        switch (subsection.title) {
          case '主要结论':
            content += `通过分析${clusterName}的发展现状，得出以下主要结论：\n\n`;
            content += `1. **产业规模持续扩大**: 近三年年均增长率达到15.3%\n`;
            content += `2. **创新活力不断增强**: 专利申请量同比增长22.8%\n`;
            content += `3. **产业结构日趋优化**: 高附加值产业占比提升至68.2%\n\n`;
            break;
          case '关键优势':
            content += `${clusterName}的关键优势主要体现在：\n\n`;
            content += `- **地理位置优越**: 位于重要交通枢纽，物流成本较低\n`;
            content += `- **政策支持力度大**: 享受多项产业扶持政策\n`;
            content += `- **人才资源丰富**: 拥有多所知名高校和科研院所\n`;
            content += `- **产业基础雄厚**: 相关配套产业发达\n\n`;
            break;
          case '产业集群背景':
            content += `${clusterName}形成于20世纪90年代，经过30多年的发展，`;
            content += `已成为国内重要的产业聚集区。集群内企业数量超过500家，`;
            content += `从业人员约12万人，年产值达到480亿元。\n\n`;
            break;
          default:
            content += `基于数据分析，${clusterName}在${subsection.title}方面表现良好，`;
            content += `相关指标均高于行业平均水平。详细分析结果显示，`;
            content += `该领域具有良好的发展前景和提升空间。\n\n`;
        }
      });
    }
    
    // 添加图表说明
    if (includeCharts && section.charts && section.charts.length > 0) {
      content += `### 数据可视化\n\n`;
      section.charts.forEach(chart => {
        content += `**${chart.title}**: `;
        switch (chart.type) {
          case 'pie':
            content += `饼图显示了各类别的占比分布，其中主要类别占比达到45.6%。\n`;
            break;
          case 'line':
            content += `折线图展示了近5年的发展趋势，整体呈现稳步上升态势。\n`;
            break;
          case 'bar':
            content += `柱状图对比了不同维度的表现，显示出明显的差异化特征。\n`;
            break;
          case 'radar':
            content += `雷达图展示了多维度综合评估结果，各项指标相对均衡。\n`;
            break;
          default:
            content += `图表展示了相关数据的分布和变化趋势。\n`;
        }
      });
      content += '\n';
    }
    
    // 添加数据要求说明
    if (section.dataRequirements) {
      content += `**数据说明**: ${section.dataRequirements}\n\n`;
    }
  });
  
  // 添加结论和建议
  content += `## 结论与建议\n\n`;
  content += `### 主要结论\n\n`;
  content += `通过对${clusterName}的全面分析，可以得出以下主要结论：\n\n`;
  content += `1. 该产业集群具备良好的发展基础和竞争优势\n`;
  content += `2. 在创新能力和人才聚集方面表现突出\n`;
  content += `3. 产业链相对完整，协同效应明显\n`;
  content += `4. 存在进一步提升的空间和潜力\n\n`;
  
  content += `### 发展建议\n\n`;
  content += `**短期建议（1-2年）：**\n`;
  content += `- 加强产业链薄弱环节建设\n`;
  content += `- 完善人才引进和培养机制\n`;
  content += `- 优化政策支持体系\n\n`;
  
  content += `**中期建议（3-5年）：**\n`;
  content += `- 推进数字化转型升级\n`;
  content += `- 扩大国际合作与交流\n`;
  content += `- 构建创新生态系统\n\n`;
  
  content += `**长期建议（5年以上）：**\n`;
  content += `- 建设世界一流产业集群\n`;
  content += `- 引领行业发展方向\n`;
  content += `- 实现可持续发展目标\n\n`;
  
  content += `---\n\n`;
  content += `*本报告由产业集群发展潜力评估系统自动生成*\n`;
  content += `*生成时间: ${new Date().toLocaleString()}*`;
  
  return content;
}

// 模拟数据 - 实际环境中应从API获取
export const MOCK_TEMPLATES: ReportTemplate[] = [
  {
    id: "template-001",
    name: "产业集群综合评估报告",
    description: "全面评估产业集群的发展现状、创新能力、人才结构、产业链完整性和未来发展潜力",
    category: "综合评估",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isOfficial: true,
    createdAt: "2025-03-15T09:00:00Z",
    usageCount: 382,
    suitableScenarios: ["政府决策", "园区规划", "投资分析"],
    estimatedPages: 35,
    sections: [
      {
        title: "执行摘要",
        description: "报告的主要发现和结论概述",
        subsections: [
          { title: "主要结论", description: "评估的核心发现" },
          { title: "关键优势", description: "产业集群的主要优势" },
          { title: "潜在风险", description: "需要注意的风险因素" }
        ]
      },
      {
        title: "产业集群概况",
        description: "对产业集群的基本情况进行描述",
        subsections: [
          { title: "产业集群背景", description: "集群的形成历史和背景" },
          { title: "区域特征", description: "地理位置和区域特点" },
          { title: "规模统计", description: "企业数量、就业人数、产值等" }
        ],
        charts: [
          { title: "企业规模分布", type: "pie" },
          { title: "产值增长趋势", type: "line" }
        ],
        dataRequirements: "需要企业数量、类型、规模、产值等统计数据"
      },
      {
        title: "创新能力分析",
        description: "评估产业集群的创新水平和能力",
        subsections: [
          { title: "研发投入", description: "R&D投入比例和绝对值" },
          { title: "专利分析", description: "专利数量、质量和类型分析" },
          { title: "创新主体", description: "创新企业和机构分析" }
        ],
        charts: [
          { title: "R&D投入比例", type: "bar" },
          { title: "专利申请趋势", type: "line" }
        ]
      },
      {
        title: "产业链分析",
        description: "评估产业链的完整性、韧性和协同效应",
        charts: [
          { title: "产业链结构图", type: "network" },
          { title: "关键环节占比", type: "bar" }
        ]
      },
      {
        title: "人才结构分析",
        description: "分析产业集群的人才数量、质量和结构",
        charts: [
          { title: "人才学历分布", type: "pie" },
          { title: "技能结构分析", type: "radar" }
        ]
      },
      {
        title: "竞争力评估",
        description: "与国内外同类产业集群的对比分析",
        charts: [
          { title: "综合竞争力雷达图", type: "radar" },
          { title: "各维度对比分析", type: "bar" }
        ]
      },
      {
        title: "发展潜力预测",
        description: "基于数据模型的未来发展预测",
        charts: [
          { title: "产值增长预测", type: "line" },
          { title: "就业增长预测", type: "line" }
        ]
      },
      {
        title: "政策建议",
        description: "针对评估结果提出的政策和措施建议",
        subsections: [
          { title: "短期建议", description: "1-2年内可实施的措施" },
          { title: "中期建议", description: "3-5年规划建议" },
          { title: "长期战略", description: "5年以上的战略方向" }
        ]
      }
    ]
  },
  {
    id: "template-002",
    name: "产业链韧性分析报告",
    description: "专注于产业链的完整性、风险评估和抗风险能力分析",
    category: "专项分析",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isOfficial: true,
    createdAt: "2025-04-22T14:30:00Z",
    usageCount: 156,
    suitableScenarios: ["供应链优化", "风险管理", "产业政策制定"],
    estimatedPages: 28,
    sections: [
      {
        title: "产业链概览",
        description: "产业链结构和主要环节分析",
        charts: [
          { title: "产业链示意图", type: "network" },
          { title: "各环节企业数量", type: "bar" }
        ]
      },
      {
        title: "产业链完整度评估",
        description: "对产业链各环节的完整性进行评估",
        charts: [
          { title: "完整度评分", type: "gauge" },
          { title: "环节缺失分析", type: "heatmap" }
        ]
      },
      {
        title: "关键环节分析",
        description: "识别和分析产业链中的关键环节",
        charts: [
          { title: "关键环节影响度", type: "bar" }
        ]
      },
      {
        title: "供应链风险评估",
        description: "分析供应链中存在的潜在风险",
        charts: [
          { title: "风险类型分布", type: "pie" },
          { title: "风险程度热力图", type: "heatmap" }
        ]
      },
      {
        title: "韧性指数计算",
        description: "基于多维度指标计算产业链韧性指数",
        charts: [
          { title: "韧性指数雷达图", type: "radar" }
        ]
      },
      {
        title: "案例对比研究",
        description: "与国内外典型产业链韧性案例对比",
        charts: [
          { title: "韧性指数对比", type: "bar" }
        ]
      },
      {
        title: "韧性提升建议",
        description: "针对薄弱环节提出的韧性提升建议",
        subsections: [
          { title: "短期举措", description: "立即可实施的优化措施" },
          { title: "中长期策略", description: "系统性提升策略" }
        ]
      }
    ]
  },
  {
    id: "template-003",
    name: "产业集群创新生态报告",
    description: "专注于产业集群的创新网络、知识流动和创新主体互动分析",
    category: "专项分析",
    thumbnailUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isOfficial: true,
    createdAt: "2025-05-10T11:15:00Z",
    usageCount: 98,
    suitableScenarios: ["创新政策制定", "创新环境优化", "科技园区规划"],
    estimatedPages: 25,
    sections: [
      {
        title: "创新生态概述",
        description: "产业集群创新生态的基本构成和特点",
        charts: [
          { title: "创新生态结构图", type: "network" }
        ]
      },
      {
        title: "创新主体分析",
        description: "企业、高校、科研院所等创新主体分析",
        charts: [
          { title: "创新主体分布", type: "pie" },
          { title: "主体创新贡献度", type: "bar" }
        ]
      },
      {
        title: "知识流动网络",
        description: "分析集群内的知识流动和扩散机制",
        charts: [
          { title: "知识流动网络图", type: "network" },
          { title: "知识流动强度", type: "heatmap" }
        ]
      },
      {
        title: "创新资源分析",
        description: "研发设施、资金、人才等创新资源分析",
        charts: [
          { title: "创新资源分布", type: "pie" },
          { title: "资源利用效率", type: "bar" }
        ]
      },
      {
        title: "创新绩效评估",
        description: "对产业集群创新产出和效率的评估",
        charts: [
          { title: "专利产出趋势", type: "line" },
          { title: "创新效率分析", type: "scatter" }
        ]
      },
      {
        title: "创新瓶颈识别",
        description: "识别制约创新发展的主要瓶颈",
        charts: [
          { title: "瓶颈因素影响度", type: "bar" }
        ]
      },
      {
        title: "创新生态优化建议",
        description: "针对创新生态提出的优化建议",
        subsections: [
          { title: "创新网络构建", description: "促进创新主体互动的措施" },
          { title: "资源配置优化", description: "创新资源优化配置建议" },
          { title: "政策支持方向", description: "所需的政策支持方向" }
        ]
      }
    ]
  },
  {
    id: "template-004",
    name: "产业集群人才结构分析",
    description: "聚焦产业集群的人才数量、质量、结构和流动性分析",
    category: "专项分析",
    thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isOfficial: false,
    createdAt: "2025-01-05T16:45:00Z",
    usageCount: 75,
    suitableScenarios: ["人才政策制定", "教育培训规划", "人才引进策略"],
    estimatedPages: 20,
    sections: [
      {
        title: "人才概况",
        description: "产业集群人才的基本情况概述",
        charts: [
          { title: "人才总量变化", type: "line" },
          { title: "人才密度比较", type: "bar" }
        ]
      },
      {
        title: "人才结构分析",
        description: "从年龄、学历、专业等维度分析人才结构",
        charts: [
          { title: "学历结构", type: "pie" },
          { title: "年龄分布", type: "bar" },
          { title: "专业领域分布", type: "treemap" }
        ]
      },
      {
        title: "核心人才分析",
        description: "高层次人才和关键岗位人才分析",
        charts: [
          { title: "高层次人才分布", type: "pie" },
          { title: "核心人才流动趋势", type: "line" }
        ]
      },
      {
        title: "人才流动分析",
        description: "人才流入、流出和内部流动分析",
        charts: [
          { title: "人才流动桑基图", type: "sankey" },
          { title: "净流入率变化", type: "line" }
        ]
      },
      {
        title: "薪酬水平分析",
        description: "产业集群内不同岗位薪酬水平分析",
        charts: [
          { title: "岗位薪酬对比", type: "bar" },
          { title: "薪酬水平地图", type: "heatmap" }
        ]
      },
      {
        title: "人才需求预测",
        description: "未来3-5年的人才需求预测",
        charts: [
          { title: "人才需求预测", type: "line" },
          { title: "人才缺口分析", type: "bar" }
        ]
      },
      {
        title: "人才政策建议",
        description: "基于分析结果提出的人才政策建议",
        subsections: [
          { title: "人才引进策略", description: "吸引外部人才的策略" },
          { title: "人才培养计划", description: "内部人才培养方案" },
          { title: "人才生态建设", description: "构建良好人才生态的建议" }
        ]
      }
    ]
  },
  {
    id: "template-005",
    name: "产业集群国际化水平评估",
    description: "评估产业集群的国际化程度、国际竞争力和全球价值链融入度",
    category: "专项分析",
    thumbnailUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isOfficial: false,
    createdAt: "2025-02-18T10:20:00Z",
    usageCount: 42,
    suitableScenarios: ["国际化战略制定", "外贸政策规划", "全球布局分析"],
    estimatedPages: 22,
    sections: [
      {
        title: "国际化概况",
        description: "产业集群国际化的基本情况概述",
        charts: [
          { title: "出口额变化趋势", type: "line" },
          { title: "国际市场分布", type: "pie" }
        ]
      },
      {
        title: "国际市场渗透度",
        description: "在全球市场的占有率和渗透情况",
        charts: [
          { title: "主要市场占有率", type: "bar" },
          { title: "市场渗透度地图", type: "map" }
        ]
      },
      {
        title: "全球价值链分析",
        description: "在全球价值链中的位置和角色分析",
        charts: [
          { title: "价值链位置分析", type: "scatter" },
          { title: "价值链升级路径", type: "line" }
        ]
      },
      {
        title: "国际合作网络",
        description: "与国际伙伴的合作网络分析",
        charts: [
          { title: "国际合作网络图", type: "network" },
          { title: "合作强度热力图", type: "heatmap" }
        ]
      },
      {
        title: "跨国企业分析",
        description: "集群内跨国企业的数量和影响力分析",
        charts: [
          { title: "跨国企业分布", type: "pie" },
          { title: "跨国企业贡献度", type: "bar" }
        ]
      },
      {
        title: "国际化能力评估",
        description: "从多维度评估集群的国际化能力",
        charts: [
          { title: "国际化能力雷达图", type: "radar" }
        ]
      },
      {
        title: "国际化战略建议",
        description: "基于评估结果提出的国际化策略建议",
        subsections: [
          { title: "市场拓展策略", description: "国际市场拓展建议" },
          { title: "价值链升级路径", description: "全球价值链升级路径" },
          { title: "国际品牌建设", description: "国际品牌打造策略" }
        ]
      }
    ]
  },
  {
    id: "template-006",
    name: "产业集群数字化转型评估",
    description: "评估产业集群的数字化水平、转型进程和未来路径",
    category: "专项分析",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isOfficial: true,
    createdAt: "2025-04-03T09:30:00Z",
    usageCount: 89,
    suitableScenarios: ["数字化转型规划", "智能制造推进", "产业互联网建设"],
    estimatedPages: 30,
    sections: [
      {
        title: "数字化现状概述",
        description: "产业集群数字化的整体现状",
        charts: [
          { title: "数字化程度评分", type: "gauge" },
          { title: "数字化投入趋势", type: "line" }
        ]
      },
      {
        title: "数字基础设施评估",
        description: "网络、计算和存储等基础设施评估",
        charts: [
          { title: "基础设施完备度", type: "radar" },
          { title: "基础设施投入对比", type: "bar" }
        ]
      },
      {
        title: "企业数字化水平分析",
        description: "集群内企业数字化程度的分布和对比",
        charts: [
          { title: "企业数字化水平分布", type: "histogram" },
          { title: "不同规模企业数字化水平", type: "box" }
        ]
      },
      {
        title: "数字化应用场景分析",
        description: "在研发、生产、营销等环节的数字化应用",
        charts: [
          { title: "应用场景分布", type: "pie" },
          { title: "应用成熟度评分", type: "radar" }
        ]
      },
      {
        title: "数据资源与应用",
        description: "数据资源的积累、共享和应用情况",
        charts: [
          { title: "数据资源增长", type: "line" },
          { title: "数据应用方式分布", type: "pie" }
        ]
      },
      {
        title: "数字化人才与能力",
        description: "数字化相关人才和能力评估",
        charts: [
          { title: "数字化人才结构", type: "pie" },
          { title: "能力成熟度模型", type: "radar" }
        ]
      },
      {
        title: "数字化转型路径规划",
        description: "基于评估结果的转型路径规划",
        subsections: [
          { title: "短期行动计划", description: "1-2年数字化行动计划" },
          { title: "中期转型路径", description: "3-5年转型规划" },
          { title: "长期数字愿景", description: "5年以上数字化愿景" }
        ],
        charts: [
          { title: "转型路径图", type: "timeline" }
        ]
      }
    ]
  }
];

// 模板提示建议 - 用于ChatInput组件
export const templatePromptSuggestions = [
  "请基于'产业集群综合评估'模板生成XX产业集群分析报告",
  "使用'产业链韧性分析'模板评估XX产业集群供应链稳定性",
  "帮我生成一份XX产业集群的创新生态分析报告",
  "请为XX产业集群创建一份人才结构分析报告"
];

export class TemplateService {
  /**
   * 获取所有可用的报告模板
   */
  static async getTemplates(): Promise<ReportTemplate[]> {
    try {
      // 先检查是否处于模拟模式
      if (ApiService.isMockMode()) {
        console.log("在模拟模式下获取模板");
        return MOCK_TEMPLATES;
      }
      
      // 尝试从API获取模板
      try {
        const response = await ApiService.get('/templates');
        return response.data;
      } catch (apiError) {
        console.error("API error in getTemplates:", apiError);
        // 如果API调用失败，自动切换到模拟模式并返回模拟数据
        ApiService.setMockMode(true);
        return MOCK_TEMPLATES;
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      // 在任何错误情况下回退到模拟数据
      return MOCK_TEMPLATES;
    }
  }

  /**
   * 获取单个模板详情
   * @param templateId 模板ID
   */
  static async getTemplateById(templateId: string): Promise<ReportTemplate | null> {
    try {
      // 先检查是否处于模拟模式
      if (ApiService.isMockMode()) {
        const template = MOCK_TEMPLATES.find(t => t.id === templateId);
        return template || null;
      }
      
      // 尝试从API获取模板详情
      try {
        const response = await ApiService.get(`/templates/${templateId}`);
        return response.data;
      } catch (apiError) {
        console.error(`API error fetching template ${templateId}:`, apiError);
        // 如果API调用失败，从模拟数据中查找
        return MOCK_TEMPLATES.find(t => t.id === templateId) || null;
      }
    } catch (error) {
      console.error(`Error fetching template ${templateId}:`, error);
      // 在任何错误情况下从模拟数据中查找
      return MOCK_TEMPLATES.find(t => t.id === templateId) || null;
    }
  }

  /**
   * 生成报告
   * @param options 报告生成选项
   */
  static async generateReport(options: ReportGenerationOptions): Promise<GeneratedReport> {
    try {
      // 先检查是否处于模拟模式
      if (ApiService.isMockMode()) {
        console.log("在模拟模式下生成报告", options);
        
        // 模拟报告生成
        const template = MOCK_TEMPLATES.find(t => t.id === options.templateId);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const reportId = `report-${Date.now()}`;
        const reportContent = generateMockReportContent(options, template!);
        
        const report: GeneratedReport = {
          id: reportId,
          title: options.title,
          content: reportContent,
          createdAt: new Date().toISOString(),
          templateId: options.templateId,
          status: 'complete',
          downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(reportContent)}`,
          previewUrl: `#preview-${reportId}`
        };
        
        // 存储报告到模拟存储中
        MOCK_REPORTS.set(reportId, report);
        
        return report;
      }
      
      // 尝试通过API生成报告
      try {
        console.log("通过API生成报告", options);
        const response = await ApiService.post('/reports/generate', options);
        return response.data;
      } catch (apiError) {
        console.error("API error generating report:", apiError);
        
        // 如果API调用失败，自动切换到模拟模式
        ApiService.setMockMode(true);
        
        // 递归调用自身，这次将使用模拟模式
        return this.generateReport(options);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      throw new Error("报告生成失败，请稍后重试");
    }
  }

  /**
   * 获取报告生成状态
   * @param reportId 报告ID
   */
  static async getReportStatus(reportId: string): Promise<GeneratedReport> {
    try {
      // 先检查是否处于模拟模式
      if (ApiService.isMockMode()) {
        // 模拟报告状态
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const storedReport = MOCK_REPORTS.get(reportId);
        if (storedReport) {
          return storedReport;
        }
        
        return {
          id: reportId,
          title: "模拟报告",
          content: "# 模拟报告内容\n\n这是一个模拟生成的报告内容。",
          createdAt: new Date().toISOString(),
          templateId: "template-001",
          status: 'complete',
          downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent("# 模拟报告内容\n\n这是一个模拟生成的报告内容。")}`,
          previewUrl: `#preview-${reportId}`
        };
      }
      
      // 尝试从API获取报告状态
      try {
        const response = await ApiService.get(`/reports/${reportId}/status`);
        return response.data;
      } catch (apiError) {
        console.error(`API error fetching report status for ${reportId}:`, apiError);
        throw new Error("获取报告状态失败");
      }
    } catch (error) {
      console.error(`Error fetching report status for ${reportId}:`, error);
      throw new Error("获取报告状态失败");
    }
  }

  /**
   * 获取报告内容 - 用于预览
   * @param reportId 报告ID
   */
  static getReportContent(reportId: string): string | null {
    if (ApiService.isMockMode()) {
      const report = MOCK_REPORTS.get(reportId);
      return report?.content || null;
    }
    return null;
  }
}