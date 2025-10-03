import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export const KPICard = ({ title, value, icon: Icon, trend, variant = 'default' }: KPICardProps) => {
  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      variant === 'success' && "border-accent",
      variant === 'warning' && "border-warning",
      variant === 'destructive' && "border-destructive"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn(
          "h-5 w-5",
          variant === 'success' && "text-accent",
          variant === 'warning' && "text-warning",
          variant === 'destructive' && "text-destructive",
          variant === 'default' && "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-accent" : "text-destructive"
          )}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};