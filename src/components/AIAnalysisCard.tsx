import { useState } from "react";
import { Info, ChevronRight, Sparkles } from "lucide-react";
import { AIKnowledgeSource } from "@/data/hazardReports";
import AnalysisPanel from "./AnalysisPanel";

interface AIAnalysisCardProps {
  source: AIKnowledgeSource;
  isActive?: boolean;
}

const labelConfig = {
  TBC: { 
    fullName: "TBC - To be Concern Hazard",
    shortName: "TBC",
    documentName: "SOP-TBC-Guidelines-2024.pdf",
    labelColor: "bg-blue-500/10 text-blue-600 border-blue-200"
  },
  PSPP: { 
    fullName: "PSPP - Potensi Safety Performance Problem",
    shortName: "PSPP",
    documentName: "PSPP-Regulasi-Keselamatan-2024.pdf",
    labelColor: "bg-amber-500/10 text-amber-600 border-amber-200"
  },
  GR: { 
    fullName: "GR - Golden Rules Violation",
    shortName: "GR",
    documentName: "Safety-Golden-Rules-2024.pdf",
    labelColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200"
  }
};

const AIAnalysisCard = ({ source, isActive = true }: AIAnalysisCardProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const config = labelConfig[source.type];

  // Analysis data based on source
  const analysisData = {
    id: `${source.type}-VEH-004`,
    category: source.category,
    label: source.citation.content,
    relevanceScore: source.confidence / 100,
    classification: "Match",
    reason: source.reasoning,
    deviationType: source.deviationType || "Pengoperasian Kendaraan / Unit",
    deviationNotes: "Deskripsi dan foto konsisten, sinyal deviasi dan objek cocok dengan " + source.type,
    extractedContext: {
      actors: ["Maintenance", "Inspector"],
      objects: ["Hauler", "Tire", "Workshop Tyre"],
      activities: ["Equipment inspection", "Maintenance observation"],
      workContext: "Work",
      visualSignals: ["Visual tyre damage"],
      textSignals: ["Text unfit for operation"],
      imageQuality: "Clear",
      visibility: "Tidak ada"
    },
    evidence: {
      actorMatch: true,
      objectMatch: true,
      activityMatch: true,
      contextMatch: "Match",
      matchedSignals: ["Visual tyre damage", "Text unfit for operation"],
      missingSignals: ["Depth of damage", "Internal tyre integrity", "Unit operational status"]
    },
    observedFacts: [
      "Kerusakan terlihat pada ban sisi ketiga (side wall cut)",
      "Foto menunjukkan permukaan ban dengan kerusakan",
      "Dinyatakan potensi bocor dan unit dilanjutkan setelah diperbaiki"
    ],
    assumptions: [
      "Tidak diketahui apakah ban masih digunakan saat pengambilan foto",
      "Belum ada informasi hasil inspeksi resmi atau standar pabrikan"
    ],
    recommendations: [
      "Status operasional ban/unit saat observasi",
      "Hasil inspeksi teknis resmi dari tim maintenance",
      "Batas toleransi kerusakan ban sesuai standar pabrikan"
    ]
  };

  if (!isActive) {
    return (
      <div className="bg-card rounded-lg border border-border p-3 opacity-40">
        <div className="flex items-center justify-center h-8">
          <span className="text-sm font-medium text-muted-foreground">
            {config.shortName}
          </span>
        </div>
      </div>
    );
  }

  // Truncate reasoning for compact view
  const briefReason = source.reasoning.length > 100 
    ? source.reasoning.substring(0, 100) + '...' 
    : source.reasoning;

  // Description based on category
  const description = source.description || source.citation.content.split('\n')[0];

  return (
    <>
      <div className="rounded-lg border border-border bg-card h-full flex flex-col">
        {/* Header with AI Label */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${config.labelColor}`}>
              {config.shortName}
            </span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">AI</span>
            </div>
          </div>
          <span className="text-sm font-medium text-foreground">{source.confidence}%</span>
        </div>

        {/* Content - New Structure */}
        <div className="px-3 py-3 space-y-2.5 flex-1">
          {/* Judul */}
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {source.categoryNumber}. {source.category}
            </p>
          </div>

          {/* Deskripsi */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Tipe Deviasi */}
          <div className="flex items-start gap-1.5">
            <span className="text-xs text-primary font-medium shrink-0">Tipe:</span>
            <span className="text-xs font-medium text-foreground">
              {source.deviationType || "Pengoperasian Kendaraan / Unit"}
            </span>
          </div>

          {/* Alasan */}
          <div className="bg-muted/50 rounded-md p-2">
            <p className="text-xs text-primary font-medium mb-1">Alasan:</p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {briefReason}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-border mt-auto">
          <button
            onClick={() => setShowPanel(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Detail Analisis</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Analysis Panel */}
      <AnalysisPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        type={source.type}
        analysisData={analysisData}
      />
    </>
  );
};

export default AIAnalysisCard;
