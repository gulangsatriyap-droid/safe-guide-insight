import { Clock, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCountdown, getUrgencyLevel } from "@/hooks/useAutoConfirmCountdown";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AutoConfirmCountdownProps {
  remainingSeconds: number;
  totalSeconds: number;
  isAutoConfirmed: boolean;
  isHumanAnnotated?: boolean;
  variant?: 'compact' | 'full' | 'inline';
  className?: string;
}

/**
 * Reusable countdown display component for auto-confirm feature
 * Shows countdown timer before lock, and "Auto-confirmed" badge after
 */
export const AutoConfirmCountdown = ({
  remainingSeconds,
  totalSeconds,
  isAutoConfirmed,
  isHumanAnnotated = false,
  variant = 'full',
  className,
}: AutoConfirmCountdownProps) => {
  const urgency = getUrgencyLevel(remainingSeconds, totalSeconds);
  const progress = (remainingSeconds / totalSeconds) * 100;

  // If human annotated, don't show countdown
  if (isHumanAnnotated) {
    return null;
  }

  // Auto-confirmed state (locked by AI)
  if (isAutoConfirmed) {
    if (variant === 'compact' || variant === 'inline') {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-muted-foreground",
              className
            )}>
              <Lock className="w-3 h-3" />
              <span className="text-[10px] font-medium">Auto-confirmed</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">AI classification auto-confirmed. Human annotation no longer available.</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div className={cn(
        "p-3 rounded-xl bg-muted/50 border border-border",
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Auto-confirmed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              AI classification final — human annotation no longer available
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Countdown running state
  const urgencyColors = {
    normal: {
      bg: "bg-primary/5",
      border: "border-primary/20",
      text: "text-primary",
      progress: "bg-primary",
      icon: "text-primary",
    },
    warning: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/30",
      text: "text-amber-600",
      progress: "bg-amber-500",
      icon: "text-amber-500",
    },
    critical: {
      bg: "bg-destructive/5",
      border: "border-destructive/30",
      text: "text-destructive",
      progress: "bg-destructive",
      icon: "text-destructive",
    },
  };

  const colors = urgencyColors[urgency];

  // Inline variant (for cards/list items)
  if (variant === 'inline') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full",
            colors.bg,
            className
          )}>
            <Clock className={cn("w-3 h-3", colors.icon)} />
            <span className={cn("text-[10px] font-bold tabular-nums", colors.text)}>
              {formatCountdown(remainingSeconds)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Auto-confirm dalam {formatCountdown(remainingSeconds)}. Review sekarang untuk anotasi manual.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Compact variant (for tight spaces)
  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
        colors.bg, colors.border, "border",
        className
      )}>
        <Clock className={cn("w-3.5 h-3.5", colors.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-[10px] font-medium", colors.text)}>Auto-confirm dalam:</span>
            <span className={cn("text-xs font-bold tabular-nums", colors.text)}>
              {formatCountdown(remainingSeconds)}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", colors.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full variant (for detail panels)
  return (
    <div className={cn(
      "p-3 rounded-xl border",
      colors.bg, colors.border,
      className
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          urgency === 'critical' ? "bg-destructive/10" :
          urgency === 'warning' ? "bg-amber-500/10" : "bg-primary/10"
        )}>
          <Clock className={cn("w-4 h-4", colors.icon)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-semibold", colors.text)}>Auto-confirm dalam:</span>
            <span className={cn("text-lg font-bold tabular-nums", colors.text)}>
              {formatCountdown(remainingSeconds)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000 rounded-full", colors.progress)}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Warning text for critical state */}
      {urgency === 'critical' && (
        <p className="text-[10px] text-destructive mt-2 font-medium">
          ⚠️ Segera review! Setelah waktu habis, klasifikasi AI menjadi final.
        </p>
      )}
      {urgency === 'warning' && (
        <p className="text-[10px] text-amber-600 mt-2">
          Review sekarang untuk melakukan anotasi manual.
        </p>
      )}
    </div>
  );
};

export default AutoConfirmCountdown;
