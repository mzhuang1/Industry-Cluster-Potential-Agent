import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import {
  FileTextIcon,
  XIcon,
  DownloadIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon
} from 'lucide-react';

interface PreviewSection {
  id: string;
  title: string;
  description: string;
  content: string;
  required: boolean;
  estimatedTime: number;
  charts?: string[];
  tables?: string[];
}

interface TemplatePreviewData {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: PreviewSection[];
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleContent: string;
}

interface TemplatePreviewProps {
  template: TemplatePreviewData;
  isOpen: boolean;
  onClose: () => void;
  onUse: (templateId: string) => void;
  onDownload?: (templateId: string) => void;
}

export function TemplatePreview({ 
  template, 
  isOpen, 
  onClose, 
  onUse, 
  onDownload 
}: TemplatePreviewProps) {
  const [activeSection, setActiveSection] = useState(template.sections[0]?.id || '');

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: TemplatePreviewData['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyText = (difficulty: TemplatePreviewData['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '复杂';
      default: return '未知';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} 分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const currentSection = template.sections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileTextIcon className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{template.category}</Badge>
                <span className={`text-sm font-medium ${getDifficultyColor(template.difficulty)}`}>
                  {getDifficultyText(template.difficulty)}
                </span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ClockIcon className="h-3 w-3" />
                  {formatTime(template.totalTime)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button variant="outline" onClick={() => onDownload(template.id)}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                下载
              </Button>
            )}
            <Button onClick={() => onUse(template.id)}>
              <PlayIcon className="h-4 w-4 mr-2" />
              使用模板
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧章节列表 */}
          <div className="w-80 border-r bg-muted/20">
            <div className="p-4 border-b">
              <h3 className="font-medium mb-2">报告章节</h3>
              <p className="text-sm text-muted-foreground">
                {template.sections.length} 个章节，共 {template.sections.filter(s => s.required).length} 个必需章节
              </p>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-2">
                {template.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                      activeSection === section.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {section.title}
                          </span>
                          {section.required ? (
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircleIcon className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs opacity-80 line-clamp-2">
                          {section.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-60">
                            {formatTime(section.estimatedTime)}
                          </span>
                          {!section.required && (
                            <Badge variant="outline" className="text-xs">
                              可选
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧内容预览 */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-4 w-fit">
                <TabsTrigger value="preview">内容预览</TabsTrigger>
                <TabsTrigger value="structure">结构说明</TabsTrigger>
                <TabsTrigger value="sample">示例内容</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="flex-1 m-4 mt-2">
                {currentSection ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {currentSection.title}
                        {currentSection.required ? (
                          <Badge variant="default" className="text-xs">
                            必需章节
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            可选章节
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {currentSection.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          预计时间: {formatTime(currentSection.estimatedTime)}
                        </div>
                        {currentSection.charts && currentSection.charts.length > 0 && (
                          <div>包含 {currentSection.charts.length} 个图表</div>
                        )}
                        {currentSection.tables && currentSection.tables.length > 0 && (
                          <div>包含 {currentSection.tables.length} 个表格</div>
                        )}
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex-1 p-4">
                      <ScrollArea className="h-full">
                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {currentSection.content || '此章节的详细内容将在生成报告时自动填充。'}
                          </div>
                          
                          {/* 图表和表格提示 */}
                          {(currentSection.charts?.length || currentSection.tables?.length) && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <InfoIcon className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-sm">包含的可视化元素</span>
                              </div>
                              
                              {currentSection.charts && currentSection.charts.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium">图表：</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {currentSection.charts.map((chart, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {chart}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {currentSection.tables && currentSection.tables.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium">表格：</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {currentSection.tables.map((table, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {table}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    请选择一个章节查看预览
                  </div>
                )}
              </TabsContent>

              <TabsContent value="structure" className="flex-1 m-4 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>报告结构说明</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          {template.sections.map((section, index) => (
                            <div key={section.id} className="border rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">
                                  {index + 1}. {section.title}
                                </span>
                                {section.required ? (
                                  <Badge variant="default" className="text-xs">必需</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">可选</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {section.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                预计生成时间: {formatTime(section.estimatedTime)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sample" className="flex-1 m-4 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>示例内容</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      以下是使用此模板生成的报告示例片段
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="prose max-w-none text-sm">
                        <div className="whitespace-pre-wrap">
                          {template.sampleContent || '暂无示例内容'}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}