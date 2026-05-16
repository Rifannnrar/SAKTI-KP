import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    variant?: 'default' | 'warning' | 'danger' | 'info';
}

export function StatCard({ title, value, icon: Icon, description, variant = 'default' }: StatCardProps) {
    const variantStyles = {
        default: 'border-border bg-card',
        warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
        danger: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
        info: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
    };

    const iconStyles = {
        default: 'bg-primary/10 text-primary',
        warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
        danger: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
        info: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    };

    return (
        <div className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${variantStyles[variant]}`}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                <div className={`flex size-12 items-center justify-center rounded-lg ${iconStyles[variant]}`}>
                    <Icon className="size-6" />
                </div>
            </div>
        </div>
    );
}
