import { visualizationDataService } from './VisualizationDataService';

interface ResponseContext {
  question: string;
  includeVisualization?: boolean;
  responseType?: 'analysis' | 'comparison' | 'prediction' | 'general';
}

class IntelligentResponseService {
  
  // 检测问题类型和关键词
  private detectQuestionType(question: string): 'analysis' | 'comparison' | 'prediction' | 'general' {
    const normalizedQuestion = question.toLowerCase();
    
    if (normalizedQuestion.includes('比较') || normalizedQuestion.includes('对比') || normalizedQuestion.includes('vs')) {
      return 'comparison';
    }
    
    if (normalizedQuestion.includes('预测') || normalizedQuestion.includes('未来') || normalizedQuestion.includes('趋势')) {
      return 'prediction';
    }
    
    if (normalizedQuestion.includes('分析') || normalizedQuestion.includes('评估') || normalizedQuestion.includes('研究')) {
      return 'analysis';
    }
    
    return 'general';
  }

  // 检测地区关键词
  private detectRegion(question: string): string | null {
    const regions = [
      '长三角', '珠三角', '京津冀', '成渝', '中部',
      '上海', '深圳', '北京', '杭州', '苏州', '广州', '南京', '成都', '重庆', '武汉', '长沙', '郑州'
    ];
    
    for (const region of regions) {
      if (question.includes(region)) {
        return region;
      }
    }
    
    return null;
  }

  // 检测产业关键词
  private detectIndustry(question: string): string | null {
    const industries = [
      '智能制造', '电子信息', '新能源', '生物医药', '新材料', '人工智能',
      '汽车', '航空航天', '光电子', '金融科技', '装备制造', '半导体', '医疗器械'
    ];
    
    for (const industry of industries) {
      if (question.includes(industry)) {
        return industry;
      }
    }
    
    return null;
  }

  // 生成智能响应
  generateIntelligentResponse(context: ResponseContext): string {
    const { question } = context;
    const questionType = this.detectQuestionType(question);
    const region = this.detectRegion(question);
    const industry = this.detectIndustry(question);

    // 获取相关数据
    const clusterMetrics = visualizationDataService.getClusterDevelopmentMetrics();
    const regionalData = visualizationDataService.getRegionalComparison();
    const sectorData = visualizationDataService.getSectorAnalysis();

    let response = '';

    switch (questionType) {
      case 'analysis':
        response = this.generateAnalysisResponse(region, industry, clusterMetrics, sectorData);
        break;
      case 'comparison':
        response = this.generateComparisonResponse(region, industry, regionalData, clusterMetrics);
        break;
      case 'prediction':
        response = this.generatePredictionResponse(region, industry);
        break;
      default:
        response = this.generateGeneralResponse(region, industry);
    }

    // 如果问题涉及数据可视化，添加可视化提示
    if (question.includes('图表') || question.includes('可视化') || question.includes('数据') || question.includes('分析报告')) {
      response += '\n\n📊 **数据可视化提示：**\n您可以在左侧的"可视化"标签页或首页的数据可视化面板中查看相关图表和详细分析。我们提供了热力图、雷达图、趋势图等多种可视化形式来帮助您更好地理解数据。';
    }

    return response;
  }

  private generateAnalysisResponse(region: string | null, industry: string | null, clusterMetrics: any[], sectorData: any[]): string {
    const targetRegion = region || '目标区域';
    const targetIndustry = industry || '相关产业';

    // 找到最相关的集群数据
    const relevantCluster = clusterMetrics.find(cluster => 
      region ? cluster.region.includes(region) : true
    ) || clusterMetrics[0];

    // 找到相关行业数据
    const relevantSector = sectorData.find(sector => 
      industry ? sector.sector.includes(industry) : true
    ) || sectorData[0];

    return `## ${targetRegion}${targetIndustry}集群分析报告

**综合评估结果：**
- 发展潜力评分：${relevantCluster.developmentScore}/100（全国排名前${Math.ceil((100 - relevantCluster.developmentScore) / 10)}%）
- 创新指数：${relevantCluster.innovationIndex}/100
- 经济影响力：${relevantCluster.economicImpact}/100
- 可持续发展指数：${relevantCluster.sustainability}/100

**主要优势：**
- 创新能力突出：研发投入强度达到4.2%，高于全国平均水平
- 产业链完整度高：上下游配套企业齐全，协同效应明显
- 人才聚集效应显著：高技能人才占比35%，人才密度居全国前列
- 政策支持力度大：累计投入专项扶持资金180亿元

**发展潜力分析：**
${targetIndustry}行业在该区域呈现良好发展态势，企业数量${relevantSector.companies}家，年营收${relevantSector.revenue}亿元，同比增长${relevantSector.growth}%。产业集群效应突出，创新驱动作用明显。

**建议措施：**
1. 加强关键核心技术攻关，提升自主创新能力
2. 完善产业生态体系，强化产业链供应链韧性
3. 深化产教融合，加大高端人才引进培养力度
4. 加强国际合作，拓展全球市场发展空间`;
  }

  private generateComparisonResponse(region: string | null, industry: string | null, regionalData: any[], clusterMetrics: any[]): string {
    // 选择两个区域进行对比
    const region1 = regionalData[0];
    const region2 = regionalData[1];

    return `## 区域产业集群对比分析

**${region1.region} vs ${region2.region}**

| 指标 | ${region1.region} | ${region2.region} | 优势方 |
|------|---------|---------|--------|
| GDP规模（万亿元） | ${region1.gdp} | ${region2.gdp} | ${region1.gdp > region2.gdp ? region1.region : region2.region} |
| 创新指数 | ${region1.innovation} | ${region2.innovation} | ${region1.innovation > region2.innovation ? region1.region : region2.region} |
| 产业集群数量 | ${region1.clusters} | ${region2.clusters} | ${region1.clusters > region2.clusters ? region1.region : region2.region} |
| 人口规模（万人） | ${region1.population} | ${region2.population} | ${region1.population > region2.population ? region1.region : region2.region} |

**对比结论：**
- **经济规模：** ${region1.region}在GDP总量方面${region1.gdp > region2.gdp ? '领先' : '落后'}于${region2.region}
- **创新能力：** ${region1.innovation > region2.innovation ? region1.region : region2.region}在创新指数方面表现更优
- **集群发展：** ${region1.clusters > region2.clusters ? region1.region : region2.region}的产业集群数量更多，集群化发展程度更高

**发展建议：**
1. ${region1.region}应重点${region1.innovation < region2.innovation ? '提升创新能力' : '保持创新优势'}
2. ${region2.region}需要${region2.gdp < region1.gdp ? '扩大经济规模' : '维持经济领先地位'}
3. 两地可在${industry || '重点产业'}领域加强合作，实现优势互补`;
  }

  private generatePredictionResponse(region: string | null, industry: string | null): string {
    const trends = visualizationDataService.getDevelopmentTrends();
    const currentScore = trends[trends.length - 2]?.actual || 89;
    const nextYearForecast = trends[trends.length - 1]?.forecast || 94;

    return `## ${region || '目标区域'}${industry || '产业集群'}发展趋势预测

**短期预测（2025-2027年）：**
- 2025年发展潜力指数预计达到${nextYearForecast}分，较2024年提升${nextYearForecast - currentScore}分
- 产业规模年均增长率预计保持在18-22%
- 新增企业数量预计每年增长15%左右

**中期展望（2027-2030年）：**
- 产业集群综合竞争力将进入全国前5名
- 关键技术领域实现重大突破，自主创新能力显著提升
- 形成具有国际影响力的产业品牌3-5个

**长期愿景（2030年以后）：**
- 建成具有全球竞争力的世界级产业集群
- 在全球价值链中占据重要地位
- 成为引领行业发展的创新高地

**关键驱动因素：**
1. **政策支持：** 国家及地方政策持续加码，为产业发展提供有力保障
2. **技术进步：** 数字化转型和智能化升级加速推进
3. **市场需求：** 国内外市场需求稳定增长，为产业发展提供广阔空间
4. **人才集聚：** 高端人才持续流入，为创新发展提供智力支撑

**风险提示：**
- 国际贸易环境不确定性可能影响发展节奏
- 核心技术依赖进口的风险需要关注
- 人才竞争加剧可能推高发展成本`;
  }

  private generateGeneralResponse(region: string | null, industry: string | null): string {
    return `感谢您的咨询！我是产业集群发展潜力评估助手，专门为您提供专业的产业分析服务。

**我可以帮助您：**
- 🔍 分析特定区域或行业的发展潜力
- 📊 提供详细的数据分析和可视化报告
- 📈 预测产业发展趋势和投资机会
- ⚖️ 进行区域间或行业间的对比分析
- 📋 生成专业的评估报告和政策建议

**当前数据库涵盖：**
- 全国40+个重点产业集群
- 5大区域经济圈对比数据
- 6个重点行业发展指标
- 实时更新的政策和市场信息

您可以尝试询问：
- "分析长三角地区智能制造产业集群的发展潜力"
- "对比珠三角和京津冀的创新能力"
- "预测新能源产业未来5年的发展趋势"

请告诉我您具体想了解哪个方面的信息，我将为您提供详细的分析报告！`;
  }

  // 根据问题内容生成个性化的模拟响应
  generateContextualResponse(question: string): string {
    const context: ResponseContext = {
      question,
      includeVisualization: true,
      responseType: this.detectQuestionType(question)
    };

    return this.generateIntelligentResponse(context);
  }
}

export const intelligentResponseService = new IntelligentResponseService();