import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { toast } from './ui/sonner';
import {
  HomeIcon,
  MessageCircleIcon,
  FileTextIcon,
  SearchIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  ShieldIcon
} from 'lucide-react';

interface NavigationProps {
  currentLanguage: 'zh' | 'en';
  onLanguageChange: (language: 'zh' | 'en') => void;
  isAdmin: boolean;
  username: string;
  userRole: string;
}

export function Navigation({ 
  currentLanguage, 
  onLanguageChange, 
  isAdmin, 
  username, 
  userRole 
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navigationItems = [
    {
      name: '首页',
      path: '/',
      icon: HomeIcon,
      description: '系统概览和快速访问'
    },
    {
      name: '智能对话',
      path: '/chat',
      icon: MessageCircleIcon,
      description: 'AI助手对话分析'
    },
    {
      name: '模板库',
      path: '/templates',
      icon: FileTextIcon,
      description: '报告模板管理'
    },
    {
      name: '搜索',
      path: '/search',
      icon: SearchIcon,
      description: '智能搜索功能'
    }
  ];

  const adminItems = [
    {
      name: '系统管理',
      path: '/admin',
      icon: ShieldIcon,
      description: '用户和系统管理'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('已安全退出登录');
      navigate('/login');
    } catch (error) {
      toast.error('退出登录失败，请重试');
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navigationItems[0], mobile?: boolean }) => {
    const Icon = item.icon;
    const isCurrent = isCurrentPath(item.path);
    
    return (
      <Link
        to={item.path}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${mobile ? 'w-full' : ''}
          ${isCurrent 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }
        `}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <Icon className="h-4 w-4" />
        <span className={mobile ? 'block' : 'hidden lg:block'}>
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="sm" showText={false} className="lg:hidden" />
            <Logo size="sm" showText={true} className="hidden lg:flex" />
          </Link>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
            {isAdmin && adminItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>

          {/* 右侧工具栏 */}
          <div className="flex items-center gap-2">
            {/* 语言切换 */}
            <LanguageSwitcher 
              currentLanguage={currentLanguage} 
              onLanguageChange={onLanguageChange} 
            />

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={username} />
                    <AvatarFallback>
                      {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{username}</p>
                    <Badge variant="outline" className="w-fit text-xs">
                      {userRole}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  个人资料
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink key={item.path} item={item} mobile />
              ))}
              {isAdmin && adminItems.map((item) => (
                <NavLink key={item.path} item={item} mobile />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}