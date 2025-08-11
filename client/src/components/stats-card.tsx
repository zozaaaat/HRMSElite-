import React from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {cn} from '@/lib/utils';
import {Building2, Users, CheckCircle2, Award} from 'lucide-react';

type SupportedIcon = 'building' | 'users' | 'check' | 'certificate';
type SupportedColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: SupportedIcon;
  color?: SupportedColor;
  className?: string;
}

const iconMap: Record<SupportedIcon, React.ElementType> = {
  building: Building2,
  users: Users,
  check: CheckCircle2,
  certificate: Award
};

const colorClassMap: Record<SupportedColor, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  gray: 'text-gray-600'
};

export function StatsCard ({
  title,
  value,
  icon = 'check',
  color = 'gray',
  className
}: StatsCardProps) {
  const IconComponent = iconMap[icon] ?? CheckCircle2;
  const iconColorClass = colorClassMap[color] ?? colorClassMap.gray;

  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
        </div>
        <IconComponent className={cn('h-10 w-10', iconColorClass)} />
      </CardContent>
    </Card>
  );
}


