import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Download, FileText, BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { HeatMap } from "./visualizations/HeatMap";
import { RadarChart } from "./visualizations/RadarChart";
import { TrendChart } from "./visualizations/TrendChart";
import { BarChart } from "./visualizations/BarChart";
import { PieChart } from "./visualizations/PieChart";
import { AreaChart } from "./visualizations/AreaChart";
import { visualizationDataService } from "../services/VisualizationDataService";
import { toast } from "sonner@2.0.3";

interface VisualizationDashboardProps {
  className?: string;
}

export function VisualizationDashboard({ className }: VisualizationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 使用 useMemo 来确保数据在组件挂载时正确初始化
  const data = useMemo(() => {
    try {
      return {
        clusterMetrics: visualizationDataService.getClusterDevelopmentMetrics() || [],
        developmentTrends: visualizationDataService.getDevelopmentTrends() || [],
        innovationTrends: visualizationDataService.getInnovationTrends() || [],
        regionalComparison: visualizationDataService.getRegionalComparison() || [],
        sectorAnalysis: visualizationDataService.getSectorAnalysis() || [],
        competitivenessHeatMap: visualizationDataService.getCompetitivenessHeatMap() || [],
        regionalPotentialHeatMap: visualizationDataService.getRegionalPotentialHeatMap() || [],
        comprehensiveRadar: visualizationDataService.getComprehensiveRadarData() || [],
        mockReport: visualizationDataService.getMockAnalysisReport()
      };
    } catch (error) {
      console.error('Error loading visualization data:', error);
      return {
        clusterMetrics: [],
        developmentTrends: [],
        innovationTrends: [],
        regionalComparison: [],
        sectorAnalysis: [],
        competitivenessHeatMap: [],
        regionalPotentialHeatMap: [],
        comprehensiveRadar: [],
        mockReport: {
          title: "数据加载错误",
          summary: { overallScore: 0, rank: 0, totalClusters: 0, keyFindings: [] },
          recommendations: []
        }
      };
    }
  }, []);

  // 转换数据格式，添加错误处理
  const chartData = useMemo(() => {
    try {
      return {
        regionalBarData: data.regionalComparison.map(item => ({
          name: item.region || '未知区域',
          GDP: item.gdp || 0,
          创新指数: item.innovation || 0,
          集群数量: item.clusters || 0
        })),
        sectorPieData: data.sectorAnalysis.map(item => ({
          name: item.sector || '未知行业',
          value: item.revenue || 0
        })),
        growthAreaData: data.sectorAnalysis.map(item => ({
          name: item.sector || '未知行业',
          收入: item.revenue || 0,
          增长率: item.growth || 0,
          企业数: Math.round((item.companies || 0) / 10) // 缩放以便显示
        }))
      };
    } catch (error) {
      console.error('Error transforming chart data:', error);
      return {
        regionalBarData: [],
        sectorPieData: [],
        growthAreaData: []
      };
    }
  }, [data]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // 模拟报告生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("分析报告生成成功！", {
        description: "报告已生成，包含详细的数据分析和建议。"
      });
      
      // 这里可以添加实际的报告下载逻辑
      console.log("生成报告:", data.mockReport);
      
    } catch (error) {
      toast.error("报告生成失败", {
        description: "请稍后重试或联系技术支持。"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePreviewReport = () => {
    toast.info("报告预览", {
      description: "正在准备报告预览，请稍候..."
    });
    
    // 模拟预览功能
    setTimeout(() => {
      if (data.mockReport && data.mockReport.summary) {
        alert(`报告摘要:
        
总体评分: ${data.mockReport.summary.overallScore}分
排名: 第${data.mockReport.summary.rank}名 (共${data.mockReport.summary.totalClusters}个集群)

主要发现:
${data.mockReport.summary.keyFindings?.map((finding, index) => `${index + 1}. ${finding}`).join('\n') || '暂无数据'}

建议措施:
${data.mockReport.recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || '暂无数据'}`);
      } else {
        alert('报告数据加载失败，请稍后重试。');
      }
    }, 1000);
  };

  return (
    <div className={className}>
      {/* 报告生成区域 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                智能对话分析
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                基于AI对话数据的行业集群分析报告生成
              </p>
            </div>
            <Badge variant="secondary">数据已更新</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handlePreviewReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              查看示例
            </Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGeneratingReport ? "生成中..." : "生成报告"}
            </Button>
          </div>
          
          {/* 快速统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.clusterMetrics.length}</div>
              <div className="text-sm text-muted-foreground">分析集群</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">平均评分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">核心指标</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">数据完整度</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 可视化图表区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            总体概览
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            发展趋势
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            区域对比
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            深度分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeatMap
              data={data.competitivenessHeatMap}
              title="竞争力热力图"
              maxValue={100}
            />
            <RadarChart
              data={data.comprehensiveRadar}
              title="综合评价雷达图"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              data={chartData.regionalBarData}
              title="区域发展指标对比"
              dataKeys={["GDP", "创新指数"]}
            />
            <PieChart
              data={chartData.sectorPieData}
              title="行业收入分布"
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              data={data.developmentTrends}
              title="发展潜力趋势预测"
            />
            <TrendChart
              data={data.innovationTrends}
              title="创新指数季度变化"
            />
          </div>
          
          <AreaChart
            data={chartData.growthAreaData}
            title="行业增长态势"
            dataKeys={["收入", "增长率"]}
            stacked={false}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeatMap
              data={data.regionalPotentialHeatMap}
              title="区域发展潜力"
              maxValue={100}
            />
            <BarChart
              data={chartData.regionalBarData}
              title="区域综合实力对比"
              dataKeys={["GDP", "创新指数", "集群数量"]}
              colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {data.clusterMetrics.slice(0, 3).map((cluster, index) => (
              <RadarChart
                key={cluster.clusterId}
                data={visualizationDataService.getClusterComparisonRadar(cluster.clusterId)}
                title={cluster.clusterName}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>产业集群深度分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.clusterMetrics.map((cluster) => (
                  <div key={cluster.clusterId} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{cluster.clusterName}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>发展评分:</span>
                        <Badge variant={cluster.developmentScore >= 90 ? "default" : "secondary"}>
                          {cluster.developmentScore}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>创新指数:</span>
                        <span>{cluster.innovationIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>经济影响:</span>
                        <span>{cluster.economicImpact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>区域:</span>
                        <span className="text-xs">{cluster.region}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              data={data.sectorAnalysis.map(sector => ({
                name: sector.sector,
                企业数量: sector.companies,
                就业人数: Math.round(sector.employment / 1000), // 转换为千人
                营收: sector.revenue
              }))}
              title="行业规模分析"
              dataKeys={["企业数量", "就业人数", "营收"]}
              stacked={false}
            />
            
            <BarChart
              data={data.sectorAnalysis.map(sector => ({
                name: sector.sector,
                增长率: sector.growth,
                营收: Math.round(sector.revenue / 100) // 缩放以便对比
              }))}
              title="行业增长率与规模关系"
              dataKeys={["增长率", "营收"]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}