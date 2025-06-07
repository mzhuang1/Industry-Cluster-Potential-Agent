import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  ClockIcon,
  MessageCircleIcon,
  TrashIcon,
  SearchIcon,
  DownloadIcon,
  FilterIcon
} from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  model?: string;
  tokens?: number;
}

interface MessageHistoryProps {
  messages: Message[];
  onClearHistory: () => void;
  onDeleteMessage: (messageId: string) => void;
  onExportHistory: () => void;
  className?: string;
}

export function MessageHistory({ 
  messages, 
  onClearHistory, 
  onDeleteMessage,
  onExportHistory,
  className = ''
}: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages);
  const [filterType, setFilterType] = useState<'all' | 'user' | 'assistant'>('all');

  useEffect(() => {
    let filtered = messages;

    // 按类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(message => message.type === filterType);
    }

    // 按搜索词过滤
    if (searchTerm.trim()) {
      filtered = filtered.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterType]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return timestamp.toLocaleDateString('zh-CN');
  };

  const getTotalTokens = () => {
    return messages.reduce((total, message) => total + (message.tokens || 0), 0);
  };

  const getTypeColor = (type: Message['type']) => {
    return type === 'user' ? 'default' : 'secondary';
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="h-5 w-5" />
            消息历史
            <Badge variant="outline">
              {filteredMessages.length}/{messages.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportHistory}
              disabled={messages.length === 0}
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              disabled={messages.length === 0}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="space-y-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索消息内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {[
                { key: 'all', label: '全部' },
                { key: 'user', label: '用户' },
                { key: 'assistant', label: 'AI' }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(filter.key as typeof filterType)}
                  className="text-xs h-7"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>总消息: {messages.length}</span>
          <span>总Token: {getTotalTokens()}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || filterType !== 'all' ? '未找到匹配的消息' : '暂无消息历史'}
              </div>
            ) : (
              filteredMessages.map((message, index) => (
                <div key={message.id}>
                  <div className="group p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeColor(message.type)} className="text-xs">
                          {message.type === 'user' ? '用户' : 'AI'}
                        </Badge>
                        {message.model && (
                          <Badge variant="outline" className="text-xs">
                            {message.model}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="h-3 w-3" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => onDeleteMessage(message.id)}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm line-clamp-3 mb-2">
                      {message.content}
                    </p>

                    {message.tokens && (
                      <div className="text-xs text-muted-foreground">
                        Token使用: {message.tokens}
                      </div>
                    )}
                  </div>

                  {index < filteredMessages.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}