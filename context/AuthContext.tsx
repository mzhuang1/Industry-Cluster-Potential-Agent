import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User, UserRole, LoginRequest, RegisterRequest } from '../services/AuthService';
import { toast } from "sonner@2.0.3";

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  loginAsDemo: () => Promise<void>;
  isDemoUser: boolean;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件属性
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 检查是否是演示模式
        const demoMode = localStorage.getItem('demo_mode') === 'true';
        if (demoMode) {
          const demoUser = AuthService.getDemoUser();
          setUser(demoUser);
          setIsDemoUser(true);
        } else {
          const currentUser = AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        AuthService.logout();
        localStorage.removeItem('demo_mode');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录方法
  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.login(credentials);
      setUser(loggedInUser);
      setIsDemoUser(false);
      localStorage.removeItem('demo_mode');
      toast.success('登录成功');
    } catch (error) {
      toast.error(`登录失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册方法
  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await AuthService.register(data);
      toast.success('注册成功，请登录');
    } catch (error) {
      toast.error(`注册失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsDemoUser(false);
    localStorage.removeItem('demo_mode');
    toast.info('已退出登录');
  };

  // 以演示用户身份登录
  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      const demoUser = AuthService.getDemoUser();
      setUser(demoUser);
      setIsDemoUser(true);
      localStorage.setItem('demo_mode', 'true');
      toast.success('已进入演示模式');
    } catch (error) {
      toast.error(`进入演示模式失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 检查用户是否拥有特定角色
  const hasRole = (role: UserRole): boolean => {
    return !!user && user.role === role;
  };

  // 检查用户是否拥有特定权限
  const hasPermission = (permission: string): boolean => {
    return !!user && !!user.permissions && user.permissions.includes(permission);
  };

  // 提供上下文值
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
    loginAsDemo,
    isDemoUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，便于获取认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};