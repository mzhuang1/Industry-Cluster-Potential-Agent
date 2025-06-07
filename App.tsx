import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/pages/HomePage";
import { ChatPage } from "./components/pages/ChatPage";
import { AdminPage } from "./components/pages/AdminPage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { UnauthorizedPage } from "./components/pages/UnauthorizedPage";
import { TemplatesPage } from "./components/pages/TemplatesPage";
import { SearchPage } from "./components/pages/SearchPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ConnectionStatusBar, ConnectionStatus } from "./components/ConnectionStatusBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { ApiService } from "./services/ApiService";
import { UserRole } from "./services/AuthService";

// 应用主要内容组件
const AppContent: React.FC = () => {
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.UNKNOWN);
  const [lastConnectAttempt, setLastConnectAttempt] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { isAuthenticated, user } = useAuth();

  // 最大重连尝试次数
  const MAX_RECONNECT_ATTEMPTS = 3;
  
  // 重连间隔（毫秒）
  const RECONNECT_INTERVALS = [10000, 30000, 60000]; // 10秒、30秒、60秒

  // 使用回调检查API连接以避免闭包问题
  const checkApiConnection = useCallback(async (isManual: boolean = false) => {
    // 如果正在重连且不是手动触发，则跳过
    if (connectionStatus === ConnectionStatus.RECONNECTING && !isManual) {
      return;
    }
    
    const startTime = Date.now();
    setConnectionStatus(isManual ? ConnectionStatus.RECONNECTING : ConnectionStatus.CHECKING);
    setLastConnectAttempt(new Date());
    
    try {
      console.log(`${isManual ? 'Manual' : 'Auto'} checking API connection status...`);
      
      // 首先检查浏览器在线状态
      if (!navigator.onLine) {
        console.log("Browser reports offline status");
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        ApiService.setMockMode(true);
        return false;
      }
      
      const isConnected = await ApiService.healthCheck();
      const duration = Date.now() - startTime;
      
      console.log(`API connection check completed in ${duration}ms: ${isConnected ? 'connected' : 'disconnected'}`);
      
      if (isConnected) {
        setConnectionStatus(ConnectionStatus.CONNECTED);
        setReconnectAttempts(0); // 重置重连计数
        ApiService.setMockMode(false);
        
        if (isManual) {
          // 手动重连成功的提示
          const duration = Date.now() - startTime;
          console.log(`Successfully reconnected in ${duration}ms`);
        }
      } else {
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        ApiService.setMockMode(true);
        
        if (isManual) {
          setReconnectAttempts(prev => prev + 1);
        }
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking API connection:", error);
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      ApiService.setMockMode(true);
      
      if (isManual) {
        setReconnectAttempts(prev => prev + 1);
      }
      
      return false;
    }
  }, [connectionStatus]);

  // 手动尝试重新连接
  const handleManualReconnect = async () => {
    if (connectionStatus === ConnectionStatus.RECONNECTING) {
      return; // 正在重连中，避免重复操作
    }
    
    console.log(`Manual reconnection attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
    
    try {
      const success = await checkApiConnection(true);
      
      if (!success && reconnectAttempts < MAX_RECONNECT_ATTEMPTS - 1) {
        // 如果失败且还没超过最大尝试次数，安排下次自动重连
        const nextInterval = RECONNECT_INTERVALS[Math.min(reconnectAttempts, RECONNECT_INTERVALS.length - 1)];
        console.log(`Scheduling next reconnection attempt in ${nextInterval}ms`);
        
        setTimeout(() => {
          if (connectionStatus === ConnectionStatus.DISCONNECTED) {
            handleManualReconnect();
          }
        }, nextInterval);
      }
    } catch (error) {
      console.error("Manual reconnection failed:", error);
    }
  };

  // 自动重连逻辑
  const scheduleAutoReconnect = useCallback(() => {
    if (connectionStatus !== ConnectionStatus.DISCONNECTED || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }
    
    const interval = RECONNECT_INTERVALS[Math.min(reconnectAttempts, RECONNECT_INTERVALS.length - 1)];
    console.log(`Scheduling auto-reconnection in ${interval}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
    
    setTimeout(() => {
      if (connectionStatus === ConnectionStatus.DISCONNECTED) {
        checkApiConnection(false);
      }
    }, interval);
  }, [connectionStatus, reconnectAttempts, checkApiConnection]);

  // 初始化连接状态检查
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.UNKNOWN) {
      console.log("Initializing API connection state...");
      
      // 首先检查浏览器在线状态
      if (!navigator.onLine) {
        console.log("Browser reports offline, setting to disconnected mode");
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        ApiService.setMockMode(true);
        return;
      }
      
      // 基于当前模拟模式初始化
      const initialMockMode = ApiService.isMockMode();
      console.log(`Initial mock mode status: ${initialMockMode}`);
      
      if (initialMockMode) {
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
      } else {
        setConnectionStatus(ConnectionStatus.CHECKING);
      }
      
      // 进行实际连接检查
      checkApiConnection(false);
    }
  }, [connectionStatus, checkApiConnection]);

  // 定期健康检查（仅在连接状态下）
  useEffect(() => {
    if (connectionStatus !== ConnectionStatus.CONNECTED) {
      return;
    }
    
    // 连接正常时，每60秒检查一次
    const interval = setInterval(() => {
      checkApiConnection(false);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [connectionStatus, checkApiConnection]);

  // 自动重连调度
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.DISCONNECTED && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      scheduleAutoReconnect();
    }
  }, [connectionStatus, scheduleAutoReconnect]);

  // 监听浏览器在线/离线事件
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser reports online status, checking API connection');
      setReconnectAttempts(0); // 重置重连计数
      checkApiConnection(false);
    };
    
    const handleOffline = () => {
      console.log('Browser reports offline status, switching to offline mode');
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      ApiService.setMockMode(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkApiConnection]);

  // 获取用户角色显示
  const getUserRoleText = () => {
    if (!user) return "";
    
    switch (user.role) {
      case UserRole.ADMIN:
        return "系统管理员";
      case UserRole.MANAGER:
        return "园区管理员";
      case UserRole.RESEARCHER:
        return "研究人员";
      case UserRole.USER:
        return "普通用户";
      default:
        return "";
    }
  };

  // 检查当前路由是否为认证页面
  const isAuthPage = window.location.pathname === '/login' || 
                    window.location.pathname === '/register' || 
                    window.location.pathname === '/forgot-password';

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && !isAuthPage && (
        <Navigation 
          currentLanguage={language} 
          onLanguageChange={setLanguage}
          isAdmin={user?.role === UserRole.ADMIN} 
          username={user?.name || ''}
          userRole={getUserRoleText()}
        />
      )}
      
      {/* 连接状态栏 */}
      {!isAuthPage && connectionStatus !== ConnectionStatus.UNKNOWN && (
        <ConnectionStatusBar
          status={connectionStatus}
          lastAttempt={lastConnectAttempt}
          reconnectAttempts={reconnectAttempts}
          maxAttempts={MAX_RECONNECT_ATTEMPTS}
          onReconnect={handleManualReconnect}
          isReconnecting={connectionStatus === ConnectionStatus.RECONNECTING}
        />
      )}
      
      <main className="flex-1">
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* 受保护的路由 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <TemplatesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404路由 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
};

// 应用主入口
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}