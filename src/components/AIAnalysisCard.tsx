import { Info, ChevronRight, Sparkles, XCircle } from "lucide-react";
import { AIKnowledgeSource } from "@/data/hazardReports";
import { cn } from "@/lib/utils";

interface AIAnalysisCardProps {
  source: AIKnowledgeSource;
  isActive?: boolean;
  onDetailClick?: (type: 'TBC' | 'GR' | 'PSPP') => void;
}

// Consistent colors: TBC=blue, GR=green, PSPP=orange
const labelConfig = {
  TBC: { 
    fullName: "TBC - To be Concern Hazard",
    shortName: "TBC",
    documentName: "SOP-TBC-Guidelines-2024.pdf",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    badgeBg: "bg-primary",
    badgeText: "text-primary-foreground"
  },
  GR: { 
    fullName: "GR - Golden Rules Violation",
    shortName: "GR",
    documentName: "Safety-Golden-Rules-2024.pdf",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/30",
    badgeBg: "bg-emerald-500",
    badgeText: "text-white"
  },
  PSPP: { 
    fullName: "PSPP - Potensi Safety Performance Problem",
    shortName: "PSPP",
    documentName: "PSPP-Regulasi-Keselamatan-2024.pdf",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/30",
    badgeBg: "bg-amber-500",
    badgeText: "text-white"
  }
};

const AIAnalysisCard = ({ source, isActive = true, onDetailClick }: AIAnalysisCardProps) => {
  const config = labelConfig[source.type];

  // Handle click on "Detail Analisis"
  const handleDetailClick = () => {
    if (onDetailClick) {
      onDetailClick(source.type);
    }
  };

  if (!isActive) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 opacity-60 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border",
            "bg-muted/50 text-muted-foreground border-border"
          )}>
            {config.shortName}
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/30 rounded border border-border">
            <Sparkles className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">AI</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Tidak terdeteksi</span>
          </div>
        </div>
        {onDetailClick && (
          <div className="pt-3 border-t border-border">
            <button
              onClick={handleDetailClick}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Detail Analisis</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Truncate reasoning for compact view
  const briefReason = source.reasoning.length > 150 
    ? source.reasoning.substring(0, 150) + '...' 
    : source.reasoning;

  // Description based on category
  const description = source.description || source.citation.content.split('\n')[0];

  // Get relevance score based on type
  const getRelevanceScore = () => {
    switch (source.type) {
      case 'TBC': return 79;
      case 'GR': return 90;
      case 'PSPP': return 100;
      default: return 85;
    }
  };

  const relevanceScore = getRelevanceScore();

  return (
    <div className={cn(
      "rounded-xl border bg-card h-full flex flex-col transition-all hover:shadow-md",
      config.border
    )}>
      {/* Header with AI Label and Relevance Score */}
      <div className={cn("flex items-center justify-between px-4 py-3 border-b", config.bg, config.border)}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border",
            config.bg, config.text, config.border
          )}>
            {config.shortName}
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-primary">AI</span>
          </div>
        </div>
        {/* Relevance Score */}
        <span className="text-2xl font-bold text-foreground">{relevanceScore}</span>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3 flex-1">
        {/* Title */}
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">
            {source.category}
          </p>
        </div>

        {/* Tipe Deviasi */}
        <div className="flex items-start gap-1.5">
          <span className={cn("text-xs font-bold shrink-0", config.text)}>Tipe:</span>
          <span className="text-xs font-medium text-foreground">
            {source.deviationType || "Pengoperasian Kendaraan / Unit"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border mt-auto">
        <button
          onClick={handleDetailClick}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold transition-colors",
            config.text, "hover:opacity-80"
          )}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Detail Analisis</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AIAnalysisCard;
