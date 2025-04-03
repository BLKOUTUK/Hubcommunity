import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface EngagementCardProps {
  title: string;
  metrics: string | number;
  description: string;
  progress: number;
  change: number;
  icon: React.ReactNode;
}

export function EngagementCard({
  title,
  metrics,
  description,
  progress,
  change,
  icon,
}: EngagementCardProps) {
  const formattedMetrics = typeof metrics === 'number' ? metrics.toString() : metrics;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedMetrics}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}