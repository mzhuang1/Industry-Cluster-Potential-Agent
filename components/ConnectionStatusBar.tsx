import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Wifi, WifiOff, Globe } from 'lucide-react';

export enum ConnectionStatus {
  UNKNOWN = 'unknown',
  CHECKING = 'checking',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting'
}

interface ConnectionStatusBarProps {
  status: ConnectionStatus;
  lastAttempt: Date | null;
  reconnectAttempts: number;
  maxAttempts: number;
  onReconnect: () => void;
  isReconnecting: boolean;
}

export const ConnectionStatusBar: React.FC<ConnectionStatusBarProps> = ({
  status,
  lastAttempt,
  reconnectAttempts,
  maxAttempts,
  onReconnect,
  isReconnecting
}) => {
  // 不显示未知状态和已连接状态的状态栏
  if (status === ConnectionStatus.UNKNOWN || status === ConnectionStatus.CONNECTED) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case ConnectionStatus.CHECKING:
        return {
          color: 'bg-blue-500/10 text-blue-700 border-blue-200',
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          message: '正在检查连接状态...',
          badge: { variant: 'default' as const, text: '检查中' }
        };
      
      case ConnectionStatus.RECONNECTING:
        return {
          color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          message: `正在尝试重新连接... (${reconnectAttempts + 1}/${maxAttempts})`,
          badge: { variant: 'secondary' as const, text: '重连中' }
        };
      
      case ConnectionStatus.DISCONNECTED:
      default:
        return {
          color: 'bg-orange-500/10 text-orange-700 border-orange-200',
          icon: <WifiOff className="h-4 w-4" />,
          message: reconnectAttempts >= maxAttempts 
            ? '无法连接到服务器，已切换到离线模式。' 
            : '无法连接到服务器，正在使用离线模式。',
          badge: { variant: 'outline' as const, text: '离线模式' }
        };
    }
  };

  const config = getStatusConfig();

  const formatLastAttempt = () => {
    if (!lastAttempt) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastAttempt.getTime()) / 1000);
    
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return lastAttempt.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const canReconnect = status === ConnectionStatus.DISCONNECTED && 
                      reconnectAttempts < maxAttempts && 
                      !isReconnecting;

  return (
    <div className={`px-4 py-3 border-b ${config.color} transition-all duration-200`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {config.icon}
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {config.message}
            </span>
            <Badge variant={config.badge.variant} className="text-xs">
              {config.badge.text}
            </Badge>
          </div>
          
          {lastAttempt && (
            <span className="text-xs opacity-75">
              上次检查: {formatLastAttempt()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* 离线模式提示 */}
          {status === ConnectionStatus.DISCONNECTED && (
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Globe className="h-3 w-3" />
              <span>功能仍可正常使用</span>
            </div>
          )}
          
          {/* 重连按钮 */}
          {canReconnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              disabled={isReconnecting}
              className="text-xs h-7"
            >
              {isReconnecting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  重连中
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重新连接
                </>
              )}
            </Button>
          )}
          
          {/* 重连尝试完毕后的提示 */}
          {status === ConnectionStatus.DISCONNECTED && reconnectAttempts >= maxAttempts && (
            <div className="flex items-center gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>已达到最大重连次数</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 详细信息 */}
      {status === ConnectionStatus.DISCONNECTED && (
        <div className="mt-2 text-xs opacity-75 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span>• 您可以继续使用所有功能</span>
            <span>• 数据将在本地处理</span>
            <span>• 系统会自动尝试重新连接</span>
          </div>
        </div>
      )}
    </div>
  );
};