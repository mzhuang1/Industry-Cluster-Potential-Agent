import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from './ui/sonner';
import {
  FileTextIcon,
  DownloadIcon,
  RefreshCwIcon,
  EyeIcon,
  SettingsIcon,
  BarChart3Icon,
  TrendingUpIcon,
  MapIcon,
  UsersIcon
} from 'lucide-react';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  estimated_time: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  total_time: number;
}

interface ReportConfig {
  templateId: string;
  title: string;
  description: string;
  sections: string[];
  language: 'zh' | 'en';
  format: 'pdf' | 'docx' | 'html';
  includeCharts: boolean;
  includeTables: boolean;
  includeMap: boolean;
  includeRecommendations: boolean;
}

export function ReportGenerator() {
  const [config, setConfig] = useState<ReportConfig>({
    templateId: '',
    title: '',
    description: '',
    sections: [],
    language: 'zh',
    format: 'pdf',
    includeCharts: true,
    includeTables: true,
    includeMap: false,
    includeRecommendations: true
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // 模拟报告模板
  const templates: ReportTemplate[] = [
    {
      id: 'comprehensive',
      name: '综合分析报告',
      description: '包含产业集群全面分析的详细报告',
      total_time: 300,
      sections: [
        {
          id: 'executive_summary',
          title: '执行摘要',
          description: '报告核心要点和主要发现',
          required: true,
          estimated_time: 30
        },
        {
          id: 'industry_overview',
          title: '产业概况',
          description: '目标产业的基本情况和发展现状',
          required: true,
          estimated_time: 60
        },
        {
          id: 'cluster_analysis',
          title: '集群分析',
          description: '产业集群的结构、特征和竞争优势',
          required: true,
          estimated_time: 90
        },
        {
          id: 'potential_assessment',
          title: '发展潜力评估',
          description: '基于多维度指标的潜力评估结果',
          required: true,
          estimated_time: 80
        },
        {
          id: 'recommendations',
          title: '政策建议',
          description: '针对性的发展策略和政策建议',
          required: false,
          estimated_time: 40
        }
      ]
    },
    {
      id: 'quick_assessment',
      name: '快速评估报告',
      description: '基于核心指标的快速评估报告',
      total_time: 120,
      sections: [
        {
          id: 'key_findings',
          title: '核心发现',
          description: '主要评估结果和关键指标',
          required: true,
          estimated_time: 40
        },
        {
          id: 'swot_analysis',
          title: 'SWOT分析',
          description: '优势、劣势、机会、威胁分析',
          required: true,
          estimated_time: 50
        },
        {
          id: 'action_plan',
          title: '行动计划',
          description: '短期和中期发展建议',
          required: false,
          estimated_time: 30
        }
      ]
    }
  ];

  const currentTemplate = templates.find(t => t.id === config.templateId);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setConfig(prev => ({
        ...prev,
        templateId,
        sections: template.sections.filter(s => s.required).map(s => s.id)
      }));
    }
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      sections: checked
        ? [...prev.sections, sectionId]
        : prev.sections.filter(id => id !== sectionId)
    }));
  };

  const handleOptionToggle = (option: keyof ReportConfig, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const generateReport = async () => {
    if (!config.templateId || !config.title.trim()) {
      toast.error('请完成必填项配置');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // 模拟生成过程
      const steps = [
        '初始化生成器...',
        '收集数据...',
        '分析产业集群...',
        '计算发展潜力...',
        '生成图表...',
        '编写报告内容...',
        '格式化输出...',
        '完成生成'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
        toast.info(steps[i]);
      }

      // 模拟生成的报告ID
      const reportId = `report_${Date.now()}`;
      setGeneratedReport(reportId);
      
      toast.success('报告生成成功！');
    } catch (error) {
      toast.error('报告生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    // 模拟下载
    toast.success(`开始下载 ${config.format.toUpperCase()} 格式报告`);
  };

  const previewReport = () => {
    if (!generatedReport) return;

    // 模拟预览
    toast.info('打开报告预览窗口');
  };

  const resetConfig = () => {
    setConfig({
      templateId: '',
      title: '',
      description: '',
      sections: [],
      language: 'zh',
      format: 'pdf',
      includeCharts: true,
      includeTables: true,
      includeMap: false,
      includeRecommendations: true
    });
    setGeneratedReport(null);
    setProgress(0);
  };

  const getEstimatedTime = () => {
    if (!currentTemplate) return 0;
    
    const selectedSections = currentTemplate.sections.filter(
      section => config.sections.includes(section.id)
    );
    
    return selectedSections.reduce((total, section) => total + section.estimated_time, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">报告生成器</h2>
          <p className="text-muted-foreground">
            基于分析结果生成专业的产业集群发展潜力评估报告
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetConfig}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            重置
          </Button>
          
          {generatedReport && (
            <>
              <Button variant="outline" onClick={previewReport}>
                <EyeIcon className="h-4 w-4 mr-2" />
                预览
              </Button>
              <Button onClick={downloadReport}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                下载
              </Button>
            </>
          )}
          
          {!generatedReport && (
            <Button 
              onClick={generateReport}
              disabled={isGenerating || !config.templateId || !config.title.trim()}
            >
              <FileTextIcon className="h-4 w-4 mr-2" />
              {isGenerating ? '生成中...' : '生成报告'}
            </Button>
          )}
        </div>
      </div>

      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">正在生成报告...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                预计剩余时间: {Math.max(0, Math.round((100 - progress) * getEstimatedTime() / 100))} 秒
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">配置报告</TabsTrigger>
          <TabsTrigger value="preview">预览设置</TabsTrigger>
          <TabsTrigger value="advanced">高级选项</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基础配置 */}
            <Card>
              <CardHeader>
                <CardTitle>基础配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">报告模板</Label>
                  <Select value={config.templateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择报告模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">报告标题</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入报告标题"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">报告描述</Label>
                  <Input
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入报告描述（可选）"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>语言</Label>
                    <Select value={config.language} onValueChange={(value: 'zh' | 'en') => setConfig(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>输出格式</Label>
                    <Select value={config.format} onValueChange={(value: 'pdf' | 'docx' | 'html') => setConfig(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">Word文档</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 章节选择 */}
            <Card>
              <CardHeader>
                <CardTitle>章节选择</CardTitle>
              </CardHeader>
              <CardContent>
                {currentTemplate ? (
                  <div className="space-y-3">
                    {currentTemplate.sections.map(section => (
                      <div key={section.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={section.id}
                          checked={config.sections.includes(section.id)}
                          onCheckedChange={(checked: boolean) => handleSectionToggle(section.id, checked)}
                          disabled={section.required}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={section.id} className="font-medium">
                              {section.title}
                            </Label>
                            {section.required && (
                              <Badge variant="secondary" className="text-xs">
                                必需
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            预计时间: {section.estimated_time} 秒
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">总预计时间:</span>
                      <Badge variant="outline">
                        {Math.round(getEstimatedTime() / 60)} 分钟
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">请先选择报告模板</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>内容选项</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={config.includeCharts}
                    onCheckedChange={(checked: boolean) => handleOptionToggle('includeCharts', checked)}
                  />
                  <Label htmlFor="includeCharts" className="flex items-center gap-2">
                    <BarChart3Icon className="h-4 w-4" />
                    包含图表
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTables"
                    checked={config.includeTables}
                    onCheckedChange={(checked: boolean) => handleOptionToggle('includeTables', checked)}
                  />
                  <Label htmlFor="includeTables" className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    包含表格
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMap"
                    checked={config.includeMap}
                    onCheckedChange={(checked: boolean) => handleOptionToggle('includeMap', checked)}
                  />
                  <Label htmlFor="includeMap" className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4" />
                    包含地图
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRecommendations"
                    checked={config.includeRecommendations}
                    onCheckedChange={(checked: boolean) => handleOptionToggle('includeRecommendations', checked)}
                  />
                  <Label htmlFor="includeRecommendations" className="flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4" />
                    包含建议
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>高级选项</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  高级选项功能正在开发中，敬请期待...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}