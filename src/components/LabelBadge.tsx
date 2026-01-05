import { CheckCircle2, Ban, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface LabelBadgeProps {
  type: 'TBC' | 'PSPP' | 'GR';
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const labelConfig = {
  TBC: {
    name: "TBC",
    fullName: "To be Concern Hazard",
    // Active: solid blue fill
    activeBg: "bg-primary",
    activeText: "text-primary-foreground",
    activeBorder: "border-primary",
    // Hover
    activeHover: "hover:bg-primary/90",
    // Soft/inactive but present
    softBg: "bg-primary/10",
    softText: "text-primary",
    softBorder: "border-primary/30",
    // False state
    falseBg: "bg-muted/50",
    falseText: "text-muted-foreground",
    falseBorder: "border-border",
  },
  GR: {
    name: "GR",
    fullName: "Golden Rules",
    // Active: solid green fill
    activeBg: "bg-emerald-500",
    activeText: "text-white",
    activeBorder: "border-emerald-500",
    activeHover: "hover:bg-emerald-500/90",
    // Soft
    softBg: "bg-emerald-500/10",
    softText: "text-emerald-600",
    softBorder: "border-emerald-500/30",
    // False
    falseBg: "bg-muted/50",
    falseText: "text-muted-foreground",
    falseBorder: "border-border",
  },
  PSPP: {
    name: "PSPP",
    fullName: "Peraturan Sanksi Pelanggaran Prosedur",
    // Active: solid orange/amber fill
    activeBg: "bg-amber-500",
    activeText: "text-white",
    activeBorder: "border-amber-500",
    activeHover: "hover:bg-amber-500/90",
    // Soft
    softBg: "bg-amber-500/10",
    softText: "text-amber-600",
    softBorder: "border-amber-500/30",
    // False
    falseBg: "bg-muted/50",
    falseText: "text-muted-foreground",
    falseBorder: "border-border",
  },
};

const sizeConfig = {
  sm: {
    padding: "px-2 py-0.5",
    text: "text-[11px]",
    icon: "w-3 h-3",
    gap: "gap-1",
  },
  md: {
    padding: "px-2.5 py-1",
    text: "text-xs",
    icon: "w-3.5 h-3.5",
    gap: "gap-1.5",
  },
  lg: {
    padding: "px-3 py-1.5",
    text: "text-sm",
    icon: "w-4 h-4",
    gap: "gap-2",
  },
};

const LabelBadge = ({ 
  type, 
  isActive, 
  size = 'md', 
  showTooltip = false,
  className 
}: LabelBadgeProps) => {
  const config = labelConfig[type];
  const sizes = sizeConfig[size];

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold border transition-colors",
        sizes.padding,
        sizes.text,
        sizes.gap,
        isActive
          ? cn(config.softBg, config.softText, config.softBorder)
          : cn(config.falseBg, config.falseText, config.falseBorder, "opacity-70"),
        className
      )}
    >
      {!isActive && (
        <XCircle className={cn(sizes.icon, "text-destructive/60")} />
      )}
      <span>{config.name}</span>
      {!isActive && (
        <span className="text-[10px] opacity-60">: No</span>
      )}
    </span>
  );

  if (showTooltip && !isActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="text-xs">
              {type === 'GR' 
                ? "Tidak ada rule GR yang cocok pada laporan ini."
                : `Tidak ditemukan kecocokan ${config.fullName} pada laporan ini.`
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

// Compact badge for list view - more visible
export const ListLabelBadge = ({ 
  type, 
  isActive,
  className 
}: { 
  type: 'TBC' | 'PSPP' | 'GR'; 
  isActive: boolean;
  className?: string;
}) => {
  const config = labelConfig[type];

  if (!isActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border",
                "bg-muted/60 text-muted-foreground/70 border-border/50",
                className
              )}
            >
              <Ban className="w-3 h-3 text-destructive/50" />
              <span>{type}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[180px]">
            <p className="text-xs">
              {type === 'GR' 
                ? "Tidak ada rule GR yang cocok."
                : `${type} tidak terdeteksi.`
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border-2 shadow-sm",
        config.softBg,
        config.softText,
        config.softBorder,
        className
      )}
    >
      <CheckCircle2 className="w-3 h-3" />
      <span>{type}</span>
    </span>
  );
};

export default LabelBadge;
