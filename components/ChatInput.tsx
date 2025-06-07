import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from './ui/sheet';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { toast } from './ui/sonner';
import {
  SendIcon,
  PaperclipIcon,
  MicIcon,
  SettingsIcon,
  XIcon,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  SparklesIcon
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
  maxLength?: number;
  // 为了兼容性，保留这些属性
  onSubmit?: (message: string, attachments?: File[]) => void;
  isProcessing?: boolean;
  language?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend?: () => void;
}

export function ChatInput({ 
  onSendMessage, 
  onSubmit, // 兼容性支持
  disabled = false, 
  isProcessing = false,
  placeholder = "请输入您的问题...",
  showSuggestions = true,
  maxLength = 2000,
  value: controlledValue,
  onChange: controlledOnChange,
  onSend
}: ChatInputProps) {
  const [message, setMessage] = useState(controlledValue || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 兼容受控组件
  const actualValue = controlledValue !== undefined ? controlledValue : message;
  const actualDisabled = disabled || isProcessing;

  // 建议的问题
  const suggestions = [
    "分析当前产业集群的发展潜力",
    "生成产业集群发展报告",
    "比较不同地区的产业优势",
    "预测未来发展趋势"
  ];

  const handleSubmit = useCallback(() => {
    if (!actualValue.trim() && attachments.length === 0) return;
    if (actualDisabled) return;

    // 优先使用 onSendMessage，如果没有则使用 onSubmit 作为后备
    const submitHandler = onSendMessage || onSubmit;
    if (submitHandler) {
      submitHandler(actualValue.trim(), attachments);
    }
    
    // 如果有 onSend 回调，也调用它
    if (onSend) {
      onSend();
    }

    // 只有在非受控模式下才清空消息
    if (controlledValue === undefined) {
      setMessage('');
    }
    setAttachments([]);
    
    // 重置文本框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [actualValue, attachments, onSendMessage, onSubmit, onSend, actualDisabled, controlledValue]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // 如果是受控组件，调用外部onChange
    if (controlledOnChange) {
      controlledOnChange(e);
    } else {
      // 否则更新内部状态
      setMessage(newValue);
    }
    
    adjustTextareaHeight();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // 限制文件大小为10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 过大，请选择小于10MB的文件`);
        return false;
      }
      
      // 支持的文件类型
      const allowedTypes = [
        'text/plain',
        'text/csv',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`不支持的文件类型：${file.name}`);
        return false;
      }
      
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    
    // 重置file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('您的浏览器不支持语音输入');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (controlledValue === undefined) {
        setMessage(prev => prev + transcript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error('语音识别失败，请重试');
    };

    recognition.start();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (file.type.includes('pdf')) {
      return <FileTextIcon className="h-4 w-4" />;
    } else {
      return <FileIcon className="h-4 w-4" />;
    }
  };

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (controlledValue === undefined) {
      setMessage(suggestion);
    }
  };

  return (
    <div className="space-y-3">
      {/* 建议问题 */}
      {showSuggestions && actualValue === '' && attachments.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={actualDisabled}
            >
              <SparklesIcon className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Card key={index} className="inline-flex">
              <CardContent className="flex items-center gap-2 p-2">
                {getFileIcon(file)}
                <span className="text-sm truncate max-w-[120px]">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeAttachment(index)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex items-end gap-2">
        {/* 主输入框 */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={actualValue}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder={actualDisabled ? "AI正在思考中..." : placeholder}
            disabled={actualDisabled}
            className="min-h-[40px] max-h-[120px] resize-none pr-20"
            maxLength={maxLength}
          />
          
          {/* 字数统计 */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {actualValue.length}/{maxLength}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 文件上传 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.csv,.pdf,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={actualDisabled}
            className="h-8 w-8 p-0"
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>

          {/* 语音输入 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            disabled={actualDisabled}
            className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500' : ''}`}
          >
            <MicIcon className="h-4 w-4" />
          </Button>

          {/* 设置 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-8 w-8 p-0"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>

          {/* 发送按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={actualDisabled || (!actualValue.trim() && attachments.length === 0)}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 当前模型显示 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          {model}
        </Badge>
        <span>Temperature: {temperature[0]}</span>
        <span>Max Tokens: {maxTokens[0]}</span>
      </div>

      {/* 设置面板 */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>对话设置</SheetTitle>
            <SheetDescription>
              调整AI模型参数以获得更好的对话体验
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* 模型选择 */}
            <div className="space-y-2">
              <Label>AI模型</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude-3</SelectItem>
                  <SelectItem value="gemini">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Temperature设置 */}
            <div className="space-y-2">
              <Label>创造性 (Temperature): {temperature[0]}</Label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={2}
                min={0}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                较低的值产生更一致的输出，较高的值产生更有创意的输出
              </p>
            </div>

            {/* Max Tokens设置 */}
            <div className="space-y-2">
              <Label>最大输出长度: {maxTokens[0]}</Label>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                max={4000}
                min={100}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                控制AI响应的最大长度
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}