import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface TrendDataPoint {
  name: string;
  actual: number;
  forecast?: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
  className?: string;
}

export function TrendChart({ data, title, className }: TrendChartProps) {
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
            <LineChart
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
              <Line
                type="monotone"
                dataKey="actual"
                name="实际值"
                stroke="var(--chart-1)"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="预测值"
                stroke="var(--chart-2)"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}