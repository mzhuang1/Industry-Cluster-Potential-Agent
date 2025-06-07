export interface IndustrialClusterMetrics {
  clusterId: string;
  clusterName: string;
  region: string;
  developmentScore: number;
  innovationIndex: number;
  economicImpact: number;
  sustainability: number;
  infrastructure: number;
  talent: number;
}

export interface TrendData {
  period: string;
  actual: number;
  forecast?: number;
  target?: number;
}

export interface RegionalComparison {
  region: string;
  gdp: number;
  innovation: number;
  population: number;
  clusters: number;
}

export interface SectorAnalysis {
  sector: string;
  companies: number;
  revenue: number;
  growth: number;
  employment: number;
}

export interface HeatMapEntry {
  name: string;
  value: number;
}

export interface RadarMetric {
  subject: string;
  value: number;
  fullMark: number;
}

class VisualizationDataService {
  // 工业集群发展指标数据
  getClusterDevelopmentMetrics(): IndustrialClusterMetrics[] {
    return [
      {
        clusterId: "cluster_001",
        clusterName: "长三角智能制造集群",
        region: "上海-苏州-杭州",
        developmentScore: 92,
        innovationIndex: 88,
        economicImpact: 95,
        sustainability: 85,
        infrastructure: 90,
        talent: 87
      },
      {
        clusterId: "cluster_002", 
        clusterName: "珠三角电子信息集群",
        region: "深圳-广州-东莞",
        developmentScore: 89,
        innovationIndex: 92,
        economicImpact: 91,
        sustainability: 82,
        infrastructure: 88,
        talent: 90
      },
      {
        clusterId: "cluster_003",
        clusterName: "京津冀新能源集群",
        region: "北京-天津-保定",
        developmentScore: 85,
        innovationIndex: 83,
        economicImpact: 87,
        sustainability: 95,
        infrastructure: 85,
        talent: 84
      },
      {
        clusterId: "cluster_004",
        clusterName: "成渝汽车产业集群",
        region: "成都-重庆",
        developmentScore: 78,
        innovationIndex: 75,
        economicImpact: 82,
        sustainability: 76,
        infrastructure: 79,
        talent: 73
      },
      {
        clusterId: "cluster_005",
        clusterName: "中部生物医药集群",
        region: "武汉-长沙-郑州",
        developmentScore: 72,
        innovationIndex: 79,
        economicImpact: 68,
        sustainability: 74,
        infrastructure: 71,
        talent: 76
      }
    ];
  }

  // 发展趋势数据
  getDevelopmentTrends(): TrendData[] {
    return [
      { period: "2019", actual: 65, forecast: 67, target: 70 },
      { period: "2020", actual: 58, forecast: 62, target: 75 },
      { period: "2021", actual: 72, forecast: 71, target: 80 },
      { period: "2022", actual: 78, forecast: 76, target: 85 },
      { period: "2023", actual: 84, forecast: 83, target: 90 },
      { period: "2024", actual: 89, forecast: 88, target: 95 },
      { period: "2025", forecast: 94, target: 100 },
      { period: "2026", forecast: 98, target: 105 },
      { period: "2027", forecast: 102, target: 110 }
    ];
  }

  // 创新指数趋势
  getInnovationTrends(): TrendData[] {
    return [
      { period: "2019Q1", actual: 72 },
      { period: "2019Q2", actual: 74 },
      { period: "2019Q3", actual: 76 },
      { period: "2019Q4", actual: 78 },
      { period: "2020Q1", actual: 71 },
      { period: "2020Q2", actual: 69 },
      { period: "2020Q3", actual: 73 },
      { period: "2020Q4", actual: 77 },
      { period: "2021Q1", actual: 80 },
      { period: "2021Q2", actual: 82 },
      { period: "2021Q3", actual: 85 },
      { period: "2021Q4", actual: 87 },
      { period: "2022Q1", actual: 89 },
      { period: "2022Q2", actual: 91 },
      { period: "2022Q3", actual: 93 },
      { period: "2022Q4", actual: 95 }
    ];
  }

  // 区域比较数据
  getRegionalComparison(): RegionalComparison[] {
    return [
      {
        region: "长三角",
        gdp: 27.6,
        innovation: 92,
        population: 237.8,
        clusters: 15
      },
      {
        region: "珠三角", 
        gdp: 12.9,
        innovation: 89,
        population: 86.4,
        clusters: 12
      },
      {
        region: "京津冀",
        gdp: 10.4,
        innovation: 85,
        population: 113.5,
        clusters: 8
      },
      {
        region: "成渝城市群",
        gdp: 7.8,
        innovation: 78,
        population: 120.3,
        clusters: 6
      },
      {
        region: "中部城市群",
        gdp: 8.9,
        innovation: 72,
        population: 95.7,
        clusters: 7
      }
    ];
  }

  // 行业分析数据
  getSectorAnalysis(): SectorAnalysis[] {
    return [
      {
        sector: "智能制造",
        companies: 1247,
        revenue: 2856.7,
        growth: 15.8,
        employment: 89420
      },
      {
        sector: "电子信息",
        companies: 2134,
        revenue: 3421.5,
        growth: 18.2,
        employment: 156780
      },
      {
        sector: "新能源",
        companies: 856,
        revenue: 1789.3,
        growth: 22.4,
        employment: 67890
      },
      {
        sector: "生物医药",
        companies: 612,
        revenue: 1234.8,
        growth: 19.7,
        employment: 45230
      },
      {
        sector: "新材料",
        companies: 743,
        revenue: 987.2,
        growth: 16.3,
        employment: 34560
      },
      {
        sector: "人工智能",
        companies: 428,
        revenue: 756.4,
        growth: 28.9,
        employment: 28970
      }
    ];
  }

  // 竞争力热力图数据
  getCompetitivenessHeatMap(): HeatMapEntry[] {
    return [
      { name: "技术创新", value: 92 },
      { name: "人才集聚", value: 87 },
      { name: "资本支持", value: 84 },
      { name: "政策环境", value: 89 },
      { name: "基础设施", value: 91 },
      { name: "市场需求", value: 85 },
      { name: "产业协同", value: 78 },
      { name: "国际合作", value: 73 },
      { name: "绿色发展", value: 81 }
    ];
  }

  // 区域发展潜力热力图
  getRegionalPotentialHeatMap(): HeatMapEntry[] {
    return [
      { name: "上海", value: 95 },
      { name: "深圳", value: 93 },
      { name: "北京", value: 91 },
      { name: "杭州", value: 88 },
      { name: "苏州", value: 86 },
      { name: "广州", value: 84 },
      { name: "南京", value: 82 },
      { name: "成都", value: 79 },
      { name: "重庆", value: 77 }
    ];
  }

  // 综合评价雷达图数据
  getComprehensiveRadarData(): RadarMetric[] {
    return [
      { subject: "创新能力", value: 88, fullMark: 100 },
      { subject: "产业基础", value: 92, fullMark: 100 },
      { subject: "人才储备", value: 85, fullMark: 100 },
      { subject: "资金支持", value: 79, fullMark: 100 },
      { subject: "政策支持", value: 91, fullMark: 100 },
      { subject: "基础设施", value: 89, fullMark: 100 },
      { subject: "市场环境", value: 86, fullMark: 100 },
      { subject: "开放程度", value: 82, fullMark: 100 }
    ];
  }

  // 集群对比雷达图数据
  getClusterComparisonRadar(clusterId: string): RadarMetric[] {
    const data: { [key: string]: RadarMetric[] } = {
      "cluster_001": [
        { subject: "创新指数", value: 88, fullMark: 100 },
        { subject: "经济效益", value: 95, fullMark: 100 },
        { subject: "可持续性", value: 85, fullMark: 100 },
        { subject: "基础设施", value: 90, fullMark: 100 },
        { subject: "人才聚集", value: 87, fullMark: 100 },
        { subject: "政策支持", value: 92, fullMark: 100 }
      ],
      "cluster_002": [
        { subject: "创新指数", value: 92, fullMark: 100 },
        { subject: "经济效益", value: 91, fullMark: 100 },
        { subject: "可持续性", value: 82, fullMark: 100 },
        { subject: "基础设施", value: 88, fullMark: 100 },
        { subject: "人才聚集", value: 90, fullMark: 100 },
        { subject: "政策支持", value: 86, fullMark: 100 }
      ],
      "cluster_003": [
        { subject: "创新指数", value: 83, fullMark: 100 },
        { subject: "经济效益", value: 87, fullMark: 100 },
        { subject: "可持续性", value: 95, fullMark: 100 },
        { subject: "基础设施", value: 85, fullMark: 100 },
        { subject: "人才聚集", value: 84, fullMark: 100 },
        { subject: "政策支持", value: 89, fullMark: 100 }
      ]
    };

    return data[clusterId] || data["cluster_001"];
  }

  // 发展阶段分析数据
  getDevelopmentStageData(): { stage: string; clusters: number; avgScore: number }[] {
    return [
      { stage: "萌芽期", clusters: 8, avgScore: 45 },
      { stage: "成长期", clusters: 15, avgScore: 68 },
      { stage: "成熟期", clusters: 12, avgScore: 85 },
      { stage: "领先期", clusters: 5, avgScore: 95 }
    ];
  }

  // 投资回报分析
  getInvestmentReturnData(): TrendData[] {
    return [
      { period: "第1年", actual: -12, forecast: -15 },
      { period: "第2年", actual: 8, forecast: 5 },
      { period: "第3年", actual: 24, forecast: 22 },
      { period: "第4年", actual: 38, forecast: 35 },
      { period: "第5年", actual: 52, forecast: 48 },
      { period: "第6年", forecast: 62 },
      { period: "第7年", forecast: 73 },
      { period: "第8年", forecast: 82 }
    ];
  }

  // 产业链完整度分析
  getIndustryChainData(): { chain: string; completeness: number; keyNodes: number }[] {
    return [
      { chain: "原材料供应", completeness: 85, keyNodes: 12 },
      { chain: "核心制造", completeness: 92, keyNodes: 18 },
      { chain: "配套服务", completeness: 78, keyNodes: 15 },
      { chain: "销售渠道", completeness: 88, keyNodes: 22 },
      { chain: "技术研发", completeness: 91, keyNodes: 8 },
      { chain: "金融支持", completeness: 76, keyNodes: 6 }
    ];
  }

  // 风险评估数据
  getRiskAssessmentData(): { risk: string; probability: number; impact: number; level: string }[] {
    return [
      { risk: "技术变革风险", probability: 65, impact: 85, level: "高" },
      { risk: "市场竞争风险", probability: 78, impact: 72, level: "高" },
      { risk: "政策变化风险", probability: 45, impact: 68, level: "中" },
      { risk: "人才流失风险", probability: 52, impact: 75, level: "中" },
      { risk: "资金链风险", probability: 38, impact: 82, level: "中" },
      { risk: "环境政策风险", probability: 42, impact: 58, level: "低" }
    ];
  }

  // 获取模拟分析报告数据
  getMockAnalysisReport() {
    return {
      title: "长三角智能制造产业集群发展潜力评估报告",
      summary: {
        overallScore: 89,
        rank: 1,
        totalClusters: 40,
        keyFindings: [
          "创新能力居全国首位，研发投入强度达4.2%",
          "产业链完整度高，上下游配套齐全",
          "人才聚集效应明显，高技能人才占比35%",
          "政策支持力度大，累计投入专项资金180亿元"
        ]
      },
      metrics: this.getClusterDevelopmentMetrics()[0],
      trends: this.getDevelopmentTrends(),
      competitiveness: this.getCompetitivenessHeatMap(),
      radar: this.getComprehensiveRadarData(),
      risks: this.getRiskAssessmentData(),
      recommendations: [
        "加强关键核心技术攻关，提升自主创新能力",
        "完善产业生态，强化产业链供应链韧性", 
        "深化产教融合，加大高端人才引进力度",
        "加强国际合作，拓展全球市场空间"
      ]
    };
  }
}

export const visualizationDataService = new VisualizationDataService();