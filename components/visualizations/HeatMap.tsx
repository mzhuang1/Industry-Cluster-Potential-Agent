import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface HeatMapData {
  name: string;
  value: number;
}

interface HeatMapProps {
  data: HeatMapData[];
  title: string;
  className?: string;
  maxValue?: number;
}

export function HeatMap({ data, title, className, maxValue = 100 }: HeatMapProps) {
  // Handle undefined or empty data
  const validData = data && Array.isArray(data) ? data : [];

  // Function to determine color intensity based on value
  const getColor = (value: number) => {
    // Converting to a value between 0 and 1
    const normalizedValue = value / maxValue;
    
    // Return a color gradient from light blue to dark blue
    return `rgba(21, 101, 192, ${Math.min(0.1 + normalizedValue * 0.9, 1)})`;
  };

  // Function to determine text color based on background color intensity
  const getTextColor = (value: number) => {
    return value / maxValue > 0.6 ? "white" : "black";
  };

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
        <div className="grid grid-cols-3 gap-2">
          {validData.map((item, index) => (
            <div
              key={index}
              className="aspect-square flex flex-col items-center justify-center p-2 rounded-md"
              style={{ backgroundColor: getColor(item.value || 0) }}
            >
              <div className="text-sm font-medium" style={{ color: getTextColor(item.value || 0) }}>
                {item.name}
              </div>
              <div className="text-lg font-bold" style={{ color: getTextColor(item.value || 0) }}>
                {item.value || 0}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}