import { ApiService } from './ApiService';
import { toast } from 'sonner@2.0.3';

export interface UploadResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  uploadTime: string;
  processedRows?: number;
  errors?: string[];
  data?: any;
}

export interface BatchProcessResult {
  success: boolean;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  results: UploadResult[];
  summary?: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
}

class DataUploadService {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'text/plain'
  ];

  private allowedExtensions = ['.csv', '.xlsx', '.xls', '.json', '.txt'];

  /**
   * 验证文件
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `文件大小超过限制 (${Math.round(this.maxFileSize / 1024 / 1024)}MB)`
      };
    }

    // 检查文件类型
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `不支持的文件类型。支持的格式: ${this.allowedExtensions.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * 单个文件上传
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadTime', new Date().toISOString());

      // 模拟进度更新
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 95) progress = 95;
        onProgress?.(progress);
      }, 200);

      let result: UploadResult;

      if (ApiService.isMockMode()) {
        // 模拟上传处理
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = this.mockUploadResult(file);
      } else {
        // 实际API调用
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`上传失败: ${response.statusText}`);
        }

        result = await response.json();
      }

      clearInterval(progressInterval);
      onProgress?.(100);

      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * 批量文件上传
   */
  async uploadFiles(
    files: FileList | File[],
    onProgress?: (fileIndex: number, progress: number) => void,
    onFileComplete?: (fileIndex: number, result: UploadResult) => void
  ): Promise<BatchProcessResult> {
    const fileArray = Array.from(files);
    const results: UploadResult[] = [];
    let processedFiles = 0;
    let failedFiles = 0;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        try {
          const result = await this.uploadFile(file, (progress) => {
            onProgress?.(i, progress);
          });
          
          results.push(result);
          if (result.success) {
            processedFiles++;
          } else {
            failedFiles++;
          }
          
          onFileComplete?.(i, result);
        } catch (error) {
          const errorResult: UploadResult = {
            success: false,
            fileName: file.name,
            fileSize: file.size,
            uploadTime: new Date().toISOString(),
            errors: [error instanceof Error ? error.message : '未知错误']
          };
          
          results.push(errorResult);
          failedFiles++;
          onFileComplete?.(i, errorResult);
        }
      }

      const summary = this.calculateBatchSummary(results);

      return {
        success: failedFiles === 0,
        totalFiles: fileArray.length,
        processedFiles,
        failedFiles,
        results,
        summary
      };
    } catch (error) {
      console.error('Batch upload error:', error);
      throw error;
    }
  }

  /**
   * 计算批量处理摘要
   */
  private calculateBatchSummary(results: UploadResult[]) {
    let totalRows = 0;
    let validRows = 0;
    let errorRows = 0;

    results.forEach(result => {
      if (result.processedRows) {
        totalRows += result.processedRows;
        validRows += result.processedRows - (result.errors?.length || 0);
        errorRows += result.errors?.length || 0;
      }
    });

    return {
      totalRows,
      validRows,
      errorRows
    };
  }

  /**
   * 模拟上传结果
   */
  private mockUploadResult(file: File): UploadResult {
    const isSuccess = Math.random() > 0.1; // 90% 成功率
    const processedRows = Math.floor(Math.random() * 1000) + 100;
    const errorRows = isSuccess ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 50) + 10;

    return {
      success: isSuccess,
      fileName: file.name,
      fileSize: file.size,
      uploadTime: new Date().toISOString(),
      processedRows,
      errors: errorRows > 0 ? Array.from({ length: errorRows }, (_, i) => `第${i + 1}行数据格式错误`) : [],
      data: {
        preview: [
          { column1: '示例数据1', column2: '示例数据2', column3: '示例数据3' },
          { column1: '示例数据4', column2: '示例数据5', column3: '示例数据6' },
        ]
      }
    };
  }

  /**
   * 下载模板文件
   */
  async downloadTemplate(templateType: 'csv' | 'excel' = 'csv'): Promise<void> {
    try {
      if (ApiService.isMockMode()) {
        // 模拟模板下载
        const templateData = this.generateMockTemplate(templateType);
        this.downloadMockTemplate(templateData, templateType);
        return;
      }

      const response = await ApiService.request(`/api/templates/${templateType}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('模板下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_upload_template.${templateType === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('模板下载成功');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('模板下载失败');
      throw error;
    }
  }

  /**
   * 生成模拟模板
   */
  private generateMockTemplate(type: 'csv' | 'excel') {
    const headers = ['区域名称', '产业类型', 'GDP总值(亿元)', '企业数量', '就业人数', '创新指数', '发展潜力评分'];
    const sampleData = [
      ['杭州市', '生物医药', '500.2', '150', '25000', '85.5', '92'],
      ['深圳市', '电子信息', '1200.8', '300', '80000', '95.2', '96'],
      ['上海市', '金融服务', '2500.6', '200', '120000', '90.8', '94']
    ];

    if (type === 'csv') {
      return [headers, ...sampleData].map(row => row.join(',')).join('\n');
    } else {
      return { headers, data: sampleData };
    }
  }

  /**
   * 下载模拟模板
   */
  private downloadMockTemplate(templateData: any, type: 'csv' | 'excel') {
    if (type === 'csv') {
      const blob = new Blob([templateData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // 简化的Excel模拟下载
      toast.info('Excel模板生成中...', {
        description: '实际项目中需要集成Excel生成库'
      });
    }
  }

  /**
   * 获取上传历史
   */
  async getUploadHistory(limit: number = 10): Promise<UploadResult[]> {
    try {
      if (ApiService.isMockMode()) {
        return this.getMockUploadHistory(limit);
      }

      const response = await ApiService.request(`/api/uploads/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get upload history error:', error);
      return [];
    }
  }

  /**
   * 获取模拟上传历史
   */
  private getMockUploadHistory(limit: number): UploadResult[] {
    const mockFiles = [
      '杭州生物医药数据.csv',
      '深圳电子信息产业.xlsx',
      '上海金融服务数据.csv',
      '北京科技创新指标.xlsx',
      '广州制造业数据.csv'
    ];

    return Array.from({ length: Math.min(limit, mockFiles.length) }, (_, i) => ({
      success: Math.random() > 0.2,
      fileName: mockFiles[i],
      fileSize: Math.floor(Math.random() * 2000000) + 100000,
      uploadTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      processedRows: Math.floor(Math.random() * 500) + 50,
      errors: Math.random() > 0.8 ? ['部分数据格式错误'] : []
    }));
  }
}

export const dataUploadService = new DataUploadService();