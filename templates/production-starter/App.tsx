import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/pages/HomePage";
import { ChatPage } from "./components/pages/ChatPage";
import { LoginPage } from "./components/pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { UserRole } from "./services/AuthService";

// 简化的应用主要内容组件
const AppContent: React.FC = () => {
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const { isAuthenticated, user } = useAuth();

  // 获取用户角色显示
  const getUserRoleText = () => {
    if (!user) return "";
    
    switch (user.role) {
      case UserRole.ADMIN:
        return "管理员";
      case UserRole.RESEARCHER:
        return "研究人员";
      case UserRole.USER:
        return "用户";
      default:
        return "";
    }
  };

  // 检查当前路由是否为认证页面
  const isAuthPage = window.location.pathname === '/login';

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
      
      <main className="flex-1">
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<LoginPage />} />
          
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