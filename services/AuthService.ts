import { ApiService } from './ApiService';

// 用户角色
export enum UserRole {
  USER = 'user',          // 普通用户
  RESEARCHER = 'researcher', // 研究人员
  MANAGER = 'manager',    // 园区管理员
  ADMIN = 'admin'         // 系统管理员
}

// 用户状态
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  LOCKED = 'locked'
}

// 用户信息接口
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  organization?: string;
  department?: string;
  lastLogin?: string;
  created: string;
  permissions?: string[];
  avatar?: string;
}

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

// 登录响应接口
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  organization?: string;
  department?: string;
}

// 用户列表响应接口
export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

// 认证服务类
export class AuthService {
  private static AUTH_TOKEN_KEY = 'auth_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static USER_KEY = 'user_data';
  
  // 获取当前登录用户
  static getCurrentUser(): User | null {
    if (AuthService.isMockMode()) {
      // 在模拟模式下返回模拟用户
      return mockData.currentUser;
    }
    
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  
  // 获取演示用户
  static getDemoUser(): User {
    // 创建一个具有研究员权限的演示用户
    const demoUser: User = {
      id: 'demo_user',
      username: 'demo',
      email: 'demo@example.com',
      name: '演示用户',
      role: UserRole.RESEARCHER,
      status: UserStatus.ACTIVE,
      organization: '演示组织',
      department: '研究部门',
      created: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      permissions: ['reports.view', 'reports.create', 'data.view', 'data.export']
    };
    
    // 将演示用户存储在本地，以便在页面刷新后仍能使用
    localStorage.setItem(this.USER_KEY, JSON.stringify(demoUser));
    localStorage.setItem(this.AUTH_TOKEN_KEY, 'demo_token');
    
    return demoUser;
  }
  
  // 获取认证令牌
  static getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  // 获取刷新令牌
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  // 检查是否处于模拟模式
  static isMockMode(): boolean {
    return ApiService.isMockMode();
  }
  
  // 检查用户是否已登录
  static isAuthenticated(): boolean {
    if (AuthService.isMockMode()) {
      // 在模拟模式下，总是认为用户已登录
      return true;
    }
    
    // 检查是否是演示模式
    if (localStorage.getItem('demo_mode') === 'true') {
      return true;
    }
    
    return !!this.getToken() && !!this.getCurrentUser();
  }
  
  // 检查用户是否拥有特定角色
  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === role;
  }
  
  // 检查用户是否拥有特定权限
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }
  
  // 用户登录
  static async login(request: LoginRequest): Promise<User> {
    if (AuthService.isMockMode()) {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 检查凭据是否匹配模拟用户
      const user = mockUsers.find(u => u.username === request.username);
      if (!user || mockUserPasswords[request.username] !== request.password) {
        throw new Error('用户名或密码错误');
      }
      
      // 设置为当前用户
      mockData.currentUser = { ...user };
      
      // 模拟存储令牌
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.AUTH_TOKEN_KEY, `mock_token_${Date.now()}`);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, `mock_refresh_${Date.now()}`);
      
      return user;
    }
    
    try {
      const response = await fetch(`${ApiService.getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登录失败');
      }
      
      const data: LoginResponse = await response.json();
      
      // 存储认证信息
      localStorage.setItem(this.AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误，切换到模拟模式
        ApiService.setMockMode(true);
        return this.login(request);
      }
      
      throw error;
    }
  }
  
  // 用户注册
  static async register(request: RegisterRequest): Promise<User> {
    if (AuthService.isMockMode()) {
      // 模拟注册延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查用户名和邮箱是否已存在
      if (mockUsers.some(u => u.username === request.username)) {
        throw new Error('用户名已存在');
      }
      
      if (mockUsers.some(u => u.email === request.email)) {
        throw new Error('邮箱已被注册');
      }
      
      // 创建新用户
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: request.username,
        email: request.email,
        name: request.name,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        organization: request.organization,
        department: request.department,
        created: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // 添加到模拟用户列表
      mockUsers.push(newUser);
      
      // 添加密码
      mockUserPasswords[request.username] = request.password;
      
      return newUser;
    }
    
    try {
      const response = await fetch(`${ApiService.getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '注册失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误，切换到模拟模式
        ApiService.setMockMode(true);
        return this.register(request);
      }
      
      throw error;
    }
  }
  
  // 用户登出
  static logout(): void {
    if (AuthService.isMockMode()) {
      mockData.currentUser = null;
    }
    
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('demo_mode');
    
    // 可以添加调用后端登出接口的逻辑
    // 例如: fetch(`${ApiService.getApiBaseUrl()}/auth/logout`);
  }
  
  // 刷新令牌
  static async refreshToken(): Promise<string> {
    if (AuthService.isMockMode()) {
      // 模拟刷新令牌
      await new Promise(resolve => setTimeout(resolve, 300));
      const newToken = `mock_token_${Date.now()}`;
      localStorage.setItem(this.AUTH_TOKEN_KEY, newToken);
      return newToken;
    }
    
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(`${ApiService.getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        // 如果刷新令牌失败，清除所有认证状态
        this.logout();
        throw new Error('令牌刷新失败，请重新登录');
      }
      
      const data = await response.json();
      localStorage.setItem(this.AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误，切换到模拟模式
        ApiService.setMockMode(true);
        return this.refreshToken();
      }
      
      throw error;
    }
  }
  
  // 获取用户列表（仅限管理员）
  static async getUsers(page: number = 1, pageSize: number = 10): Promise<UsersResponse> {
    if (AuthService.isMockMode()) {
      // 模拟获取用户列表
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedUsers = mockUsers.slice(start, end);
      
      return {
        users: paginatedUsers,
        total: mockUsers.length,
        page,
        pageSize
      };
    }
    
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('未授权操作');
      }
      
      const response = await fetch(
        `${ApiService.getApiBaseUrl()}/admin/users?page=${page}&pageSize=${pageSize}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get users error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误，切换到模拟模式
        ApiService.setMockMode(true);
        return this.getUsers(page, pageSize);
      }
      
      throw error;
    }
  }
  
  // 更新用户状态（仅限管理员）
  static async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    if (AuthService.isMockMode()) {
      // 模拟更新用户状态
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('用户不存在');
      }
      
      mockUsers[userIndex].status = status;
      
      return mockUsers[userIndex];
    }
    
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('未授权操作');
      }
      
      const response = await fetch(`${ApiService.getApiBaseUrl()}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('更新用户状态失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update user status error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误，切换到模拟模式
        ApiService.setMockMode(true);
        return this.updateUserStatus(userId, status);
      }
      
      throw error;
    }
  }
  
  // 更新用户角色（仅限管理员）
  static async updateUserRole(userId: string, role: UserRole): Promise<User> {
    if (AuthService.isMockMode()) {
      // 模拟更新用户角色
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('用户不存在');
      }
      
      mockUsers[userIndex].role = role;
      
      return mockUsers[userIndex];
    }
    
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('未授权操作');
      }
      
      const response = await fetch(`${ApiService.getApiBaseUrl()}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw new Error('更新用户角色失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update user role error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 网络错误，切换到模拟模式
        ApiService.setMockMode(true);
        return this.updateUserRole(userId, role);
      }
      
      throw error;
    }
  }
}

// 模拟数据
const mockData: {
  currentUser: User | null;
} = {
  currentUser: null
};

// 模拟用户列表
const mockUsers: User[] = [
  {
    id: 'user_1',
    username: 'admin',
    email: 'admin@cdi.com',
    name: '系统管理员',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    organization: '产业发展研究院',
    department: '技术部',
    lastLogin: '2025-05-30T08:45:00.000Z',
    created: '2024-01-01T00:00:00.000Z',
    permissions: ['users.manage', 'reports.all', 'settings.all']
  },
  {
    id: 'user_2',
    username: 'park_manager',
    email: 'manager@cdi.com',
    name: '园区管理员',
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    organization: '杭州高新区',
    department: '产业规划部',
    lastLogin: '2025-05-28T14:30:00.000Z',
    created: '2024-02-15T00:00:00.000Z',
    permissions: ['reports.view', 'reports.create', 'data.view']
  },
  {
    id: 'user_3',
    username: 'researcher',
    email: 'researcher@cdi.com',
    name: '研究员',
    role: UserRole.RESEARCHER,
    status: UserStatus.ACTIVE,
    organization: '产业发展研究院',
    department: '研究部',
    lastLogin: '2025-05-29T09:15:00.000Z',
    created: '2024-03-10T00:00:00.000Z',
    permissions: ['reports.view', 'reports.create', 'data.view', 'data.export']
  },
  {
    id: 'user_4',
    username: 'user',
    email: 'user@example.com',
    name: '普通用户',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    organization: '某企业',
    department: '战略部',
    lastLogin: '2025-05-20T10:45:00.000Z',
    created: '2024-04-05T00:00:00.000Z',
    permissions: ['reports.view']
  },
  {
    id: 'user_5',
    username: 'inactive_user',
    email: 'inactive@example.com',
    name: '未激活用户',
    role: UserRole.USER,
    status: UserStatus.INACTIVE,
    created: '2024-05-01T00:00:00.000Z',
    permissions: []
  }
];

// 模拟用户密码映射
const mockUserPasswords: {[username: string]: string} = {
  'admin': 'admin123',
  'park_manager': 'manager123',
  'researcher': 'researcher123',
  'user': 'user123',
  'inactive_user': 'inactive123'
};