import { AlertTriangle, Minus, ArrowDown } from 'lucide-react';
import { TodoPriority } from '@/types/todo';
import { cn } from '@/lib/utils';

interface PriorityIconProps {
  priority: TodoPriority;
  size?: number;
  className?: string;
}

export function PriorityIcon({ priority, size = 14, className }: PriorityIconProps) {
  const icons = {
    high: AlertTriangle,
    medium: Minus,
    low: ArrowDown,
  };

  const Icon = icons[priority];

  return (
    <Icon 
      size={size} 
      className={cn(
        className
      )}
      style={{
        color: priority === 'high' 
          ? 'hsl(var(--priority-high))' 
          : priority === 'medium'
            ? 'hsl(var(--priority-medium))'
            : 'hsl(var(--priority-low))'
      }}
    />
  );
}
