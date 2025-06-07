import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  UserIcon,
  BotIcon,
  CopyIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  VolumeXIcon,
  Volume2Icon
} from 'lucide-react';

interface ChatMessageProps {
  message?: {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: number;
    model?: string;
    attachments?: Array<{
      type: 'file' | 'image';
      name: string;
      url: string;
    }>;
  };
  // 支持旧的API以保持向后兼容
  role?: 'user' | 'assistant';
  content?: React.ReactNode | string;
  isUser?: boolean;
  onRegenerate?: () => void;
  onRate?: (messageId: string, rating: 'up' | 'down') => void;
}

export function ChatMessage({ 
  message, 
  role,
  content,
  isUser: propIsUser, 
  onRegenerate, 
  onRate 
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // 处理新旧API兼容性
  const actualMessage = message || {
    id: Date.now().toString(),
    type: (role || 'assistant') as 'user' | 'assistant',
    content: typeof content === 'string' ? content : '',
    timestamp: Date.now()
  };

  const isUser = propIsUser !== undefined ? propIsUser : actualMessage.type === 'user';
  const messageContent = message ? message.content : content;

  const copyToClipboard = async () => {
    try {
      const textContent = typeof messageContent === 'string' ? messageContent : actualMessage.content;
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const speakMessage = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const textContent = typeof messageContent === 'string' ? messageContent : actualMessage.content;
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src="/ai-avatar.png" />
          <AvatarFallback>
            <BotIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* 消息头部信息 */}
        <div className="flex items-center gap-2 mb-1">
          {!isUser && actualMessage.model && (
            <Badge variant="outline" className="text-xs">
              {actualMessage.model}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(actualMessage.timestamp)}
          </span>
        </div>

        {/* 消息内容 */}
        <div
          className={`rounded-lg px-4 py-2 max-w-full ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {messageContent || actualMessage.content}
          </div>

          {/* 附件显示 */}
          {actualMessage.attachments && actualMessage.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {actualMessage.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-background/10 rounded">
                  {attachment.type === 'image' ? (
                    <img 
                      src={attachment.url} 
                      alt={attachment.name}
                      className="max-w-48 max-h-32 rounded object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2"
            >
              <CopyIcon className="h-3 w-3" />
              {copied ? '已复制' : '复制'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={speakMessage}
              className="h-6 px-2"
            >
              {speaking ? (
                <VolumeXIcon className="h-3 w-3" />
              ) : (
                <Volume2Icon className="h-3 w-3" />
              )}
            </Button>

            {onRate && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRate(actualMessage.id, 'up')}
                  className="h-6 px-2"
                >
                  <ThumbsUpIcon className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRate(actualMessage.id, 'down')}
                  className="h-6 px-2"
                >
                  <ThumbsDownIcon className="h-3 w-3" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                >
                  <MoreHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onRegenerate && (
                  <DropdownMenuItem onClick={onRegenerate}>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    重新生成
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={copyToClipboard}>
                  <CopyIcon className="h-4 w-4 mr-2" />
                  复制消息
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src="/user-avatar.png" />
          <AvatarFallback>
            <UserIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}