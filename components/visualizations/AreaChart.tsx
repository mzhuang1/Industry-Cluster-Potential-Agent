import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface AreaChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  [key: string]: any;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  title: string;
  className?: string;
  dataKeys?: string[];
  colors?: string[];
  stacked?: boolean;
}

export function AreaChart({ 
  data, 
  title, 
  className, 
  dataKeys = ["value"], 
  colors = ["var(--chart-1)", "var(--chart-2)"],
  stacked = false
}: AreaChartProps) {
  // Handle undefined or empty data
  const validData = data && Array.isArray(data) ? data : [];

  // If no data, show empty state
  if (validData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-sm">暂无数据</div>
              <div className="text-xs mt-1">No data available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart
              data={validData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId={stacked ? "1" : key}
                  stroke={colors[index] || colors[0]}
                  fill={colors[index] || colors[0]}
                  fillOpacity={0.6}
                  name={key === "value" ? "数值" : key}
                />
              ))}
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}