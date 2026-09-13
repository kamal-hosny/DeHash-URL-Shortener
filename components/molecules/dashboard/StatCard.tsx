import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, className }) => {
    return (
        <div className={`
      bg-card text-card-foreground
      p-6 rounded-lg 
      border border-border
      shadow-sm hover:shadow-md transition-shadow duration-200
      flex flex-col justify-between
      ${className}
    `}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className="p-2 bg-accent rounded-lg text-accent-foreground">
                    <Icon size={16} />
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
                {trend && (
                    <div className="flex items-center mt-1">
                        <span className={`
              text-xs font-medium px-1.5 py-0.5 rounded
              ${trend.isPositive
                                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30'
                                : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
                            }
            `}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">from last month</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
