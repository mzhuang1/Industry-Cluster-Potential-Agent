import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AreaChart, BarChart, PieChart } from '../visualizations';
import { 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Users, 
  Search,
  Plus
} from 'lucide-react';

// 使用现有组件构建的MVP示例
export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟数据 - 在实际应用中从API获取
  const stats = [
    { title: '总用户数', value: '1,234', icon: Users, trend: '+12%' },
    { title: '项目数量', value: '856', icon: FileText, trend: '+8%' },
    { title: '活跃度', value: '94%', icon: TrendingUp, trend: '+5%' },
  ];

  const chartData = [
    { month: '1月', value: 400 },
    { month: '2月', value: 300 },
    { month: '3月', value: 600 },
    { month: '4月', value: 800 },
    { month: '5月', value: 500 },
    { month: '6月', value: 900 },
  ];

  const pieData = [
    { name: '类型A', value: 35, color: '#1e88e5' },
    { name: '类型B', value: 25, color: '#43a047' },
    { name: '类型C', value: 20, color: '#fb8c00' },
    { name: '类型D', value: 20, color: '#e53935' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 页面标题和搜索 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">控制台</h1>
          <p className="text-muted-foreground">管理您的项目和数据</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge variant="secondary" className="mt-1">
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 图表区域 */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">趋势分析</TabsTrigger>
              <TabsTrigger value="distribution">分布统计</TabsTrigger>
              <TabsTrigger value="comparison">对比分析</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>月度趋势</CardTitle>
                  <CardDescription>过去6个月的数据变化</CardDescription>
                </CardHeader>
                <CardContent>
                  <AreaChart 
                    data={chartData} 
                    height={300}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>类型分布</CardTitle>
                  <CardDescription>各类型数据占比情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart 
                    data={pieData} 
                    height={300}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>对比分析</CardTitle>
                  <CardDescription>不同维度的数据对比</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={chartData} 
                    height={300}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                开始对话
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                生成报告
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                数据分析
              </Button>
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: '创建了新项目', time: '2小时前', type: 'create' },
                { title: '完成数据分析', time: '4小时前', type: 'complete' },
                { title: '上传了文档', time: '1天前', type: 'upload' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'create' ? 'bg-green-500' :
                    activity.type === 'complete' ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 系统状态 */}
          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API服务</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">数据库</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">存储</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  警告
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};