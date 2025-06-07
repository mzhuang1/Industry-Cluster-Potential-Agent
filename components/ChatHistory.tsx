import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  ClockIcon,
  MessageCircleIcon,
  TrashIcon,
  RefreshCwIcon,
  DownloadIcon,
  SearchIcon
} from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  lastMessage: string;
  model: 'gpt-4' | 'claude-3' | 'gemini';
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({ 
  sessions, 
  onLoadSession, 
  onDeleteSession, 
  onNewChat 
}: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>(sessions);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSessions(sessions);
    } else {
      const filtered = sessions.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
  }, [searchTerm, sessions]);

  const getModelBadgeColor = (model: ChatSession['model']) => {
    switch (model) {
      case 'gpt-4':
        return 'default';
      case 'claude-3':
        return 'secondary';
      case 'gemini':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return timestamp.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return timestamp.toLocaleDateString('zh-CN');
    }
  };

  const exportHistory = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      sessions: filteredSessions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="h-5 w-5" />
            对话历史
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              disabled={filteredSessions.length === 0}
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewChat}
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? '未找到匹配的对话' : '暂无对话历史'}
              </div>
            ) : (
              filteredSessions.map((session, index) => (
                <div key={session.id}>
                  <div 
                    className="group p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onLoadSession(session.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <ClockIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(session.timestamp)}
                          </span>
                          <Badge 
                            variant={getModelBadgeColor(session.model)}
                            className="text-xs"
                          >
                            {session.model}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {session.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {session.messageCount} 条消息
                      </span>
                    </div>
                  </div>
                  
                  {index < filteredSessions.length - 1 && (
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