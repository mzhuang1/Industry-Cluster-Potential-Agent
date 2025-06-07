import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  DatabaseIcon,
  PlayIcon,
  PauseIcon,
  RefreshCwIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BarChart3Icon,
  FileTextIcon,
  AlertTriangleIcon,
  InfoIcon
} from 'lucide-react';
import { dataUploadService, UploadResult } from '../services/DataUploadService';
import { toast } from 'sonner@2.0.3';

interface ProcessingTask {
  id: string;
  name: string;
  type: 'analysis' | 'report' | 'visualization' | 'export';
  status: 'pending' | 'running' | 'completed' | 'error' | 'paused';
  progress: number;
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
  estimatedTime?: number; // 预估时间（秒）
}

interface BatchProcessDialogProps {
  trigger?: React.ReactNode;
  uploadHistory?: UploadResult[];
}

export function BatchProcessDialog({ trigger, uploadHistory = [] }: BatchProcessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [processingType, setProcessingType] = useState<string>('comprehensive');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<UploadResult[]>(uploadHistory);
  const [isLoading, setIsLoading] = useState(false);

  // 加载上传历史
  useEffect(() => {
    if (isOpen) {
      loadUploadHistory();
    }
  }, [isOpen]);

  // 重置选择状态当对话框关闭时
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setTasks([]);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const loadUploadHistory = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('Loading upload history...');
      const historyData = await dataUploadService.getUploadHistory(20);
      const successfulUploads = historyData.filter(item => item.success);
      
      console.log('Loaded history data:', successfulUploads);
      setHistory(successfulUploads);
      
      if (successfulUploads.length === 0) {
        toast.info('暂无上传历史', {
          description: '请先上传一些数据文件后再进行批量处理'
        });
      }
    } catch (error) {
      console.error('Failed to load upload history:', error);
      toast.error('加载上传历史失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理类型选项
  const processingOptions = [
    {
      value: 'comprehensive',
      label: '综合分析',
      description: '进行完整的产业集群分析，包括潜力评估、趋势预测等',
      estimatedTime: 300
    },
    {
      value: 'quick_analysis',
      label: '快速分析',
      description: '快速生成基础分析报告和关键指标',
      estimatedTime: 120
    },
    {
      value: 'visualization_only',
      label: '可视化生成',
      description: '仅生成数据可视化图表和仪表板',
      estimatedTime: 60
    },
    {
      value: 'report_generation',
      label: '报告生成',
      description: '基于数据生成详细的评估报告',
      estimatedTime: 180
    },
    {
      value: 'trend_analysis',
      label: '趋势分析',
      description: '专注于发展趋势和预测分析',
      estimatedTime: 240
    }
  ];

  // 创建处理任务
  const createProcessingTasks = (fileNames: string[], type: string): ProcessingTask[] => {
    const option = processingOptions.find(opt => opt.value === type);
    const baseEstimatedTime = option?.estimatedTime || 180;

    const taskTypes: ProcessingTask['type'][] = 
      type === 'comprehensive' ? ['analysis', 'report', 'visualization', 'export'] :
      type === 'quick_analysis' ? ['analysis', 'report'] :
      type === 'visualization_only' ? ['visualization'] :
      type === 'report_generation' ? ['analysis', 'report'] :
      type === 'trend_analysis' ? ['analysis', 'visualization'] : ['analysis'];

    const tasks: ProcessingTask[] = [];

    fileNames.forEach((fileName, fileIndex) => {
      taskTypes.forEach((taskType, taskIndex) => {
        tasks.push({
          id: `${fileIndex}-${taskIndex}-${Date.now()}-${Math.random()}`,
          name: `${getTaskTypeName(taskType)} - ${fileName}`,
          type: taskType,
          status: 'pending',
          progress: 0,
          estimatedTime: Math.floor(baseEstimatedTime / taskTypes.length)
        });
      });
    });

    return tasks;
  };

  // 获取任务类型名称
  const getTaskTypeName = (type: ProcessingTask['type']) => {
    switch (type) {
      case 'analysis': return '数据分析';
      case 'report': return '报告生成';
      case 'visualization': return '可视化';
      case 'export': return '结果导出';
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFiles.length === history.length) {
      // 全部取消选择
      setSelectedFiles([]);
    } else {
      // 全部选择
      setSelectedFiles(history.map(file => file.fileName));
    }
  };

  // 处理文件选择
  const handleFileSelection = (fileName: string, checked: boolean) => {
    console.log(`File selection changed: ${fileName}, checked: ${checked}`);
    
    if (checked) {
      setSelectedFiles(prev => {
        const newSelected = [...prev, fileName];
        console.log('New selected files:', newSelected);
        return newSelected;
      });
    } else {
      setSelectedFiles(prev => {
        const newSelected = prev.filter(name => name !== fileName);
        console.log('New selected files:', newSelected);
        return newSelected;
      });
    }
  };

  // 开始批量处理
  const startBatchProcessing = async () => {
    console.log('Starting batch processing with files:', selectedFiles);
    
    if (selectedFiles.length === 0) {
      toast.error('请先选择要处理的文件');
      return;
    }

    const newTasks = createProcessingTasks(selectedFiles, processingType);
    console.log('Created tasks:', newTasks);
    
    setTasks(newTasks);
    setIsProcessing(true);

    toast.info(`开始处理 ${selectedFiles.length} 个文件`, {
      description: `处理类型: ${processingOptions.find(opt => opt.value === processingType)?.label}`
    });

    try {
      // 顺序处理任务
      for (let i = 0; i < newTasks.length; i++) {
        const task = newTasks[i];
        
        // 更新任务状态为运行中
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, status: 'running', startTime: new Date().toISOString() }
            : t
        ));

        // 模拟任务处理
        await processTask(task);
      }

      toast.success('批量处理完成');
    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error('批量处理过程中发生错误');
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理单个任务
  const processTask = async (task: ProcessingTask) => {
    const processingTime = (task.estimatedTime || 60) * 1000; // 转换为毫秒
    const intervalTime = 100; // 100ms更新一次进度
    const totalIntervals = processingTime / intervalTime;

    return new Promise<void>((resolve, reject) => {
      let currentInterval = 0;

      const progressInterval = setInterval(() => {
        currentInterval++;
        const progress = Math.min((currentInterval / totalIntervals) * 100, 100);

        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, progress } : t
        ));

        if (currentInterval >= totalIntervals) {
          clearInterval(progressInterval);
          
          // 90% 成功率
          const success = Math.random() > 0.1;
          
          setTasks(prev => prev.map(t => 
            t.id === task.id 
              ? { 
                  ...t, 
                  status: success ? 'completed' : 'error',
                  progress: 100,
                  endTime: new Date().toISOString(),
                  result: success ? generateMockResult(task.type) : undefined,
                  error: success ? undefined : '处理过程中发生错误'
                }
              : t
          ));

          if (success) {
            resolve();
          } else {
            reject(new Error('Task processing failed'));
          }
        }
      }, intervalTime);
    });
  };

  // 生成模拟结果
  const generateMockResult = (type: ProcessingTask['type']) => {
    switch (type) {
      case 'analysis':
        return {
          metrics: {
            clusters_analyzed: Math.floor(Math.random() * 10) + 5,
            data_points: Math.floor(Math.random() * 1000) + 500,
            accuracy_score: (Math.random() * 0.2 + 0.8).toFixed(2)
          }
        };
      case 'report':
        return {
          pages: Math.floor(Math.random() * 20) + 10,
          sections: Math.floor(Math.random() * 8) + 5,
          charts: Math.floor(Math.random() * 15) + 8
        };
      case 'visualization':
        return {
          charts_generated: Math.floor(Math.random() * 10) + 5,
          dashboard_created: true
        };
      case 'export':
        return {
          files_generated: Math.floor(Math.random() * 5) + 2,
          formats: ['PDF', 'Excel', 'CSV']
        };
    }
  };

  // 暂停/恢复处理
  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
    toast.info(isProcessing ? '处理已暂停' : '处理已恢复');
  };

  // 重新开始处理
  const restartProcessing = () => {
    setTasks([]);
    setIsProcessing(false);
    toast.info('已重置处理任务');
  };

  // 下载结果
  const downloadResults = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    if (completedTasks.length === 0) {
      toast.error('没有可下载的结果');
      return;
    }

    // 模拟下载
    toast.success(`开始下载 ${completedTasks.length} 项处理结果`);
  };

  // 获取状态图标
  const getTaskStatusIcon = (status: ProcessingTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      case 'paused':
        return <PauseIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // 获取类型图标
  const getTaskTypeIcon = (type: ProcessingTask['type']) => {
    switch (type) {
      case 'analysis':
        return <BarChart3Icon className="h-4 w-4" />;
      case 'report':
        return <FileTextIcon className="h-4 w-4" />;
      case 'visualization':
        return <BarChart3Icon className="h-4 w-4" />;
      case 'export':
        return <DownloadIcon className="h-4 w-4" />;
    }
  };

  // 计算总体进度
  const overallProgress = tasks.length > 0 
    ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length 
    : 0;

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const errorTasks = tasks.filter(task => task.status === 'error').length;

  // 检查是否可以开始处理
  const canStartProcessing = selectedFiles.length > 0 && !isProcessing;

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <DatabaseIcon className="w-4 h-4" />
      批量处理
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            批量数据处理
          </DialogTitle>
          <DialogDescription>
            选择已上传的数据文件进行批量分析和处理，生成综合报告和可视化结果。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="setup" className="h-[600px] flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">配置处理</TabsTrigger>
            <TabsTrigger value="monitor">进度监控</TabsTrigger>
            <TabsTrigger value="results">结果查看</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="flex-1 overflow-auto space-y-4">
            {/* 处理类型选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">选择处理类型</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={processingType} onValueChange={setProcessingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择处理类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {processingOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description} (约 {Math.floor(option.estimatedTime / 60)} 分钟)
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 文件选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  选择数据文件
                  <div className="flex items-center gap-2">
                    {history.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleSelectAll}
                        className="text-xs"
                      >
                        {selectedFiles.length === history.length ? '取消全选' : '全选'}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadUploadHistory}
                      disabled={isLoading}
                    >
                      <RefreshCwIcon className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                      刷新
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">加载数据文件...</div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DatabaseIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <div>暂无可处理的数据文件</div>
                    <div className="text-sm mt-1">请先上传数据文件</div>
                  </div>
                ) : (
                  <>
                    {/* 选择状态提示 */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                        <InfoIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          已选择 {selectedFiles.length} 个文件进行处理
                        </span>
                      </div>
                    )}
                    
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {history.map((file, index) => (
                          <div key={`${file.fileName}-${index}`} className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50 transition-colors">
                            <Checkbox
                              checked={selectedFiles.includes(file.fileName)}
                              onCheckedChange={(checked) => {
                                handleFileSelection(file.fileName, !!checked);
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{file.fileName}</div>
                              <div className="text-xs text-muted-foreground">
                                {file.processedRows} 行数据 • {new Date(file.uploadTime).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {selectedFiles.length > 0 && `已选择 ${selectedFiles.length} 个文件`}
                {!canStartProcessing && selectedFiles.length === 0 && '请选择要处理的文件'}
                {isProcessing && '正在处理中...'}
              </div>
              <Button 
                onClick={startBatchProcessing}
                disabled={!canStartProcessing}
                className="flex items-center gap-2"
                size="default"
              >
                <PlayIcon className="h-4 w-4" />
                {isProcessing ? '处理中...' : '开始处理'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="flex-1 overflow-auto space-y-4">
            {/* 总体进度 */}
            {tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    总体进度
                    <div className="flex items-center gap-2">
                      {isProcessing ? (
                        <Button variant="outline" size="sm" onClick={toggleProcessing}>
                          <PauseIcon className="h-3 w-3 mr-1" />
                          暂停
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={toggleProcessing}>
                          <PlayIcon className="h-3 w-3 mr-1" />
                          继续
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={restartProcessing}>
                        <RefreshCwIcon className="h-3 w-3 mr-1" />
                        重置
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={overallProgress} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span>
                        {completedTasks} / {tasks.length} 任务完成
                        {errorTasks > 0 && ` • ${errorTasks} 个错误`}
                      </span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 任务列表 */}
            {tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">处理任务</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {getTaskStatusIcon(task.status)}
                              {getTaskTypeIcon(task.type)}
                              <div className="flex-1">
                                <div className="text-sm font-medium">{task.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {task.status === 'running' && `预计还需 ${task.estimatedTime}秒`}
                                  {task.status === 'completed' && task.endTime && 
                                    `完成于 ${new Date(task.endTime).toLocaleTimeString()}`}
                                  {task.status === 'error' && task.error}
                                </div>
                              </div>
                            </div>
                            <Badge variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'error' ? 'destructive' :
                              task.status === 'running' ? 'secondary' : 'outline'
                            }>
                              {task.status === 'running' ? '进行中' :
                               task.status === 'completed' ? '已完成' :
                               task.status === 'error' ? '错误' :
                               task.status === 'paused' ? '已暂停' : '等待中'}
                            </Badge>
                          </div>
                          
                          {task.status === 'running' && (
                            <Progress value={task.progress} className="h-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* 空状态 */}
            {tasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>暂无处理任务</div>
                <div className="text-sm mt-1">请先在"配置处理"页面选择文件并开始处理</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="flex-1 overflow-auto space-y-4">
            {/* 结果概览 */}
            {tasks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <div className="text-sm text-muted-foreground">成功完成</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{errorTasks}</div>
                    <div className="text-sm text-muted-foreground">处理失败</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(overallProgress)}%
                    </div>
                    <div className="text-sm text-muted-foreground">总体进度</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 处理结果 */}
            {completedTasks > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    处理结果
                    <Button variant="outline" size="sm" onClick={downloadResults}>
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      下载结果
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {tasks
                        .filter(task => task.status === 'completed')
                        .map(task => (
                          <div key={task.id} className="border rounded p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">{task.name}</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <DownloadIcon className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {task.result && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {JSON.stringify(task.result, null, 2).slice(0, 100)}...
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>暂无处理结果</div>
                <div className="text-sm mt-1">请先配置并开始处理任务</div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}