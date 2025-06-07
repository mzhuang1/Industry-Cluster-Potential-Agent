import React, { useState, useRef } from 'react';
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
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  UploadCloudIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { dataUploadService, UploadResult } from '../services/DataUploadService';
import { toast } from 'sonner@2.0.3';

interface FileUploadItem {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  result?: UploadResult;
  error?: string;
}

interface DataUploadDialogProps {
  trigger?: React.ReactNode;
  onUploadComplete?: (results: UploadResult[]) => void;
}

export function DataUploadDialog({ trigger, onUploadComplete }: DataUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文件选择处理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newItems: FileUploadItem[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadItems(prev => [...prev, ...newItems]);
    
    // 重置input值，允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 移除文件
  const removeFile = (index: number) => {
    setUploadItems(prev => prev.filter((_, i) => i !== index));
  };

  // 清空所有文件
  const clearAllFiles = () => {
    setUploadItems([]);
  };

  // 开始上传
  const startUpload = async () => {
    if (uploadItems.length === 0) {
      toast.error('请先选择要上传的文件');
      return;
    }

    setIsUploading(true);

    try {
      const files = uploadItems.map(item => item.file);
      const results: UploadResult[] = [];

      await dataUploadService.uploadFiles(
        files,
        // 进度回调
        (fileIndex, progress) => {
          setUploadItems(prev => 
            prev.map((item, index) => 
              index === fileIndex 
                ? { ...item, progress, status: 'uploading' as const }
                : item
            )
          );
        },
        // 完成回调
        (fileIndex, result) => {
          setUploadItems(prev => 
            prev.map((item, index) => 
              index === fileIndex 
                ? { 
                    ...item, 
                    progress: 100, 
                    status: result.success ? 'completed' : 'error',
                    result,
                    error: result.success ? undefined : result.errors?.[0] || '上传失败'
                  }
                : item
            )
          );
          results.push(result);
        }
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`成功上传 ${successCount} 个文件${failCount > 0 ? `，${failCount} 个文件失败` : ''}`);
      } else {
        toast.error('所有文件上传失败');
      }

      onUploadComplete?.(results);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传过程中发生错误');
    } finally {
      setIsUploading(false);
    }
  };

  // 下载模板
  const downloadTemplate = async (type: 'csv' | 'excel') => {
    try {
      await dataUploadService.downloadTemplate(type);
    } catch (error) {
      toast.error('模板下载失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取状态图标
  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      default:
        return <FileIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // 获取状态描述
  const getStatusDescription = (item: FileUploadItem) => {
    switch (item.status) {
      case 'completed':
        return item.result ? 
          `处理 ${item.result.processedRows || 0} 行数据${item.result.errors?.length ? `，${item.result.errors.length} 个错误` : ''}` :
          '上传完成';
      case 'error':
        return item.error || '上传失败';
      case 'uploading':
        return `上传中... ${item.progress}%`;
      default:
        return '等待上传';
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <UploadCloudIcon className="w-4 h-4" />
      上传数据
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloudIcon className="h-5 w-5" />
            数据文件上传
          </DialogTitle>
          <DialogDescription>
            支持上传 CSV、Excel、JSON 等格式的数据文件，系统将自动处理和分析您的数据。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 模板下载区域 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DownloadIcon className="h-4 w-4" />
                数据模板
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('csv')}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="h-3 w-3" />
                  下载 CSV 模板
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('excel')}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="h-3 w-3" />
                  下载 Excel 模板
                </Button>
                <div className="text-xs text-muted-foreground">
                  建议先下载模板，按格式整理数据后上传
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 文件选择区域 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">选择文件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.json,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloudIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">点击选择文件</span> 或拖拽文件到此处
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    支持 CSV、Excel、JSON 格式，单文件最大 10MB
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-3 w-3" />
                    添加文件
                  </Button>
                  {uploadItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFiles}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-3 w-3" />
                      清空所有
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 文件列表区域 */}
          {uploadItems.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>文件列表 ({uploadItems.length})</span>
                  <Badge variant="secondary">
                    {uploadItems.filter(item => item.status === 'completed').length} / {uploadItems.length} 完成
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {uploadItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(item.status)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {item.file.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(item.file.size)} • {getStatusDescription(item)}
                              </div>
                            </div>
                          </div>
                          
                          {item.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {item.status === 'uploading' && (
                          <Progress value={item.progress} className="h-2" />
                        )}
                        
                        {item.result?.errors && item.result.errors.length > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <AlertTriangleIcon className="h-3 w-3 text-yellow-600" />
                              <span className="text-yellow-800 dark:text-yellow-200">
                                数据处理警告
                              </span>
                            </div>
                            <div className="text-yellow-700 dark:text-yellow-300">
                              {item.result.errors.slice(0, 3).join(', ')}
                              {item.result.errors.length > 3 && '...'}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {uploadItems.length > 0 && `已选择 ${uploadItems.length} 个文件`}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={startUpload}
                disabled={uploadItems.length === 0 || isUploading}
                className="min-w-[80px]"
              >
                {isUploading ? '上传中...' : '开始上传'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}