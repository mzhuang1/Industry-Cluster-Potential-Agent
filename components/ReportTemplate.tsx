import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  FileTextIcon,
  ClockIcon,
  EyeIcon,
  DownloadIcon,
  StarIcon,
  TagIcon
} from 'lucide-react';

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

interface ReportTemplateData {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: TemplateSection[];
  estimatedTime: number; // 分钟
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  rating: number;
  usageCount: number;
  lastUpdated: string;
}

interface ReportTemplateProps {
  template: ReportTemplateData;
  onPreview: (templateId: string) => void;
  onUse: (templateId: string) => void;
  onDownload?: (templateId: string) => void;
  className?: string;
}

export function ReportTemplate({ 
  template, 
  onPreview, 
  onUse, 
  onDownload,
  className = ''
}: ReportTemplateProps) {

  const getDifficultyColor = (difficulty: ReportTemplateData['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: ReportTemplateData['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '复杂';
      default: return '未知';
    }
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} 分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} 小时 ${remainingMinutes} 分钟` : `${hours} 小时`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <Card className={`h-full flex flex-col hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <FileTextIcon className="h-5 w-5" />
              {template.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{template.rating}</span>
          </div>
        </div>

        {/* 元数据 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            {template.category}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={`text-white ${getDifficultyColor(template.difficulty)}`}
          >
            {getDifficultyText(template.difficulty)}
          </Badge>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClockIcon className="h-3 w-3" />
            {formatEstimatedTime(template.estimatedTime)}
          </div>
        </div>

        {/* 标签 */}
        {template.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <TagIcon className="h-3 w-3 text-muted-foreground" />
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{template.tags.length - 3} 更多
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* 章节列表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">报告章节</h4>
          <div className="space-y-1">
            {template.sections.slice(0, 4).map((section, index) => (
              <div key={section.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{index + 1}.</span>
                <span className="flex-1 truncate">{section.title}</span>
                {section.required && (
                  <Badge variant="outline" className="text-xs">
                    必需
                  </Badge>
                )}
              </div>
            ))}
            {template.sections.length > 4 && (
              <div className="text-sm text-muted-foreground">
                ... 还有 {template.sections.length - 4} 个章节
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">使用次数</span>
            <div className="font-medium">{template.usageCount.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-muted-foreground">最后更新</span>
            <div className="font-medium">{formatDate(template.lastUpdated)}</div>
          </div>
        </div>
      </CardContent>

      {/* 操作按钮 */}
      <div className="p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPreview(template.id)}
            className="flex-1"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            预览
          </Button>
          
          {onDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDownload(template.id)}
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            size="sm" 
            onClick={() => onUse(template.id)}
            className="flex-1"
          >
            使用模板
          </Button>
        </div>
      </div>
    </Card>
  );
}