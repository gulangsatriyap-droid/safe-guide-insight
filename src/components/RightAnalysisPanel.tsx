import { useState } from "react";
import { X, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle, Sparkles, Target, Eye, Brain, ArrowRight, Ban, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AIKnowledgeSource } from "@/data/hazardReports";
import { cn } from "@/lib/utils";

interface RightAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiSources: AIKnowledgeSource[];
  activeLabels: ('TBC' | 'PSPP' | 'GR')[];
}

const labelConfig = {
  TBC: { 
    bg: "bg-primary/10", 
    text: "text-primary",
    border: "border-primary/30",
    accent: "bg-gradient-to-r from-primary/5 to-primary/10",
    iconBg: "bg-primary/10",
    activeBg: "bg-primary",
    activeText: "text-primary-foreground"
  },
  PSPP: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-600",
    border: "border-amber-500/30",
    accent: "bg-gradient-to-r from-amber-500/5 to-amber-500/10",
    iconBg: "bg-amber-500/10",
    activeBg: "bg-amber-500",
    activeText: "text-white"
  },
  GR: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-600",
    border: "border-emerald-500/30",
    accent: "bg-gradient-to-r from-emerald-500/5 to-emerald-500/10",
    iconBg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500",
    activeText: "text-white"
  }
};

const documentConfig = {
  TBC: {
    title: "TBC - To be Concern Hazard",
    fileName: "SOP-TBC-Guidelines-2024.pdf",
    pages: [
      {
        page: 1,
        title: "Daftar Isi",
        content: `DAFTAR ISI

1. Pendahuluan ................................................ 3
2. Definisi dan Istilah ...................................... 5
3. Prosedur Keselamatan Kerja ........................ 7
4. Pelanggaran dan Sanksi ............................... 12
5. Tata Cara Pelaporan .................................... 18
6. Lampiran ..................................................... 22`
      },
      {
        page: 2,
        title: "Kategori Deviasi",
        content: `KATEGORI DEVIASI PENGOPERASIAN KENDARAAN/UNIT

Kategori 1: Deviasi Pengoperasian Kendaraan/Unit

Definisi:
Setiap temuan yang berkaitan dengan pengoperasian kendaraan atau unit yang tidak sesuai dengan standar operasional prosedur yang telah ditetapkan.

Contoh:
• Fatigue (menguap, microsleep, mata tertutup)
• Menggunakan handphone saat mengoperasikan unit
• Tidak menggunakan sabuk pengaman`
      }
    ]
  },
  PSPP: {
    title: "PSPP - Peraturan Sanksi",
    fileName: "PSPP-Regulasi-Keselamatan-2024.pdf",
    pages: [
      {
        page: 1,
        title: "Daftar Isi",
        content: `DAFTAR ISI

1. Pendahuluan ................................................ 3
2. Definisi Pelanggaran .................................... 5
3. Kategori Sanksi ........................................... 8
4. Prosedur Penanganan .................................. 14
5. Lampiran ..................................................... 20`
      }
    ]
  },
  GR: {
    title: "GR - Golden Rules",
    fileName: "Safety-Golden-Rules-2024.pdf",
    pages: [
      {
        page: 1,
        title: "Daftar Isi",
        content: `DAFTAR ISI

1. Golden Rules Overview ................................ 3
2. Rule #1: PPE Compliance ............................ 5
3. Rule #2: Vehicle Operation .......................... 8
4. Rule #3: Work at Height .............................. 12
5. Lampiran ..................................................... 18`
      }
    ]
  }
};

const RightAnalysisPanel = ({ isOpen, onClose, aiSources, activeLabels }: RightAnalysisPanelProps) => {
  const [activeTab, setActiveTab] = useState<'TBC' | 'PSPP' | 'GR'>('TBC');
  const [showExpandedAnalysis, setShowExpandedAnalysis] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [contentView, setContentView] = useState<'detail' | 'dokumen'>('detail');

  if (!isOpen) return null;

  const config = labelConfig[activeTab];
  const docConfig = documentConfig[activeTab];
  
  // Get current source or null if not active
  const currentSource = aiSources.find(s => s.type === activeTab);
  const isCurrentActive = activeLabels.includes(activeTab);

  const MatchIcon = ({ match }: { match: boolean | string }) => {
    if (match === true || match === "Match" || match === "Ya") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  // Generate analysis data for the current source
  const getAnalysisData = (source: AIKnowledgeSource | undefined) => {
    if (!source) return null;
    return {
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
  };

  const analysisData = getAnalysisData(currentSource);

  return (
    <TooltipProvider>
      {/* Floating overlay panel - doesn't affect layout */}
      <div className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[90vw] bg-card border-l border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center`}>
              <FileText className={`w-5 h-5 ${config.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">AI Analysis</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{docConfig.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Segmented Tabs - TBC / GR / PSPP */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
            {(['TBC', 'GR', 'PSPP'] as const).map((type) => {
              const isActive = activeTab === type;
              const isLabelActive = activeLabels.includes(type);
              const typeConfig = labelConfig[type];
              
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setActiveTab(type);
                        setShowExpandedAnalysis(false);
                        setCurrentPage(0);
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                        isActive 
                          ? isLabelActive
                            ? `${typeConfig.activeBg} ${typeConfig.activeText} shadow-sm`
                            : "bg-muted-foreground/20 text-muted-foreground"
                          : isLabelActive
                            ? `${typeConfig.bg} ${typeConfig.text} hover:opacity-80`
                            : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {!isLabelActive && type === 'GR' && (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      {isLabelActive && isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {type}
                      {!isLabelActive && (
                        <span className="text-[10px] opacity-70">✕</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  {!isLabelActive && (
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <p className="text-xs">
                        {type === 'GR' 
                          ? "Tidak ada rule GR yang cocok pada laporan ini."
                          : `Tidak ditemukan kecocokan ${type} pada laporan ini.`
                        }
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Content View Toggle */}
        <div className="px-4 pt-3">
          <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
            <button
              onClick={() => setContentView('detail')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                contentView === 'detail'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Detail Analisis
            </button>
            <button
              onClick={() => setContentView('dokumen')}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                contentView === 'dokumen'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Dokumen
            </button>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-4">
            {!isCurrentActive ? (
              /* Empty State for False/Inactive Labels */
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Ban className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {activeTab} tidak terdeteksi
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  AI tidak menemukan kecocokan {activeTab === 'GR' ? 'Golden Rules' : activeTab} pada laporan ini.
                </p>
                <div className="flex gap-2">
                  {activeLabels.filter(l => l !== activeTab).slice(0, 2).map(label => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab(label)}
                      className="gap-1.5"
                    >
                      <span>Lihat {label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ))}
                </div>
              </div>
            ) : contentView === 'detail' && analysisData ? (
              /* Detail Analysis Content */
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                {/* Main Analysis Card */}
                <div className={`rounded-xl border ${config.border} overflow-hidden`}>
                  {/* Card Header */}
                  <div className={`px-4 py-3 ${config.accent} border-b ${config.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center`}>
                        <Target className={`w-4 h-4 ${config.text}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {currentSource?.category || "Deviasi Pengoperasian Kendaraan/Unit"}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Hasil klasifikasi otomatis oleh AI
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4 space-y-3 bg-card">
                    {/* Label */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-muted-foreground">L</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Label</span>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {activeTab}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Tipe Deviasi */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Tipe Deviasi</span>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {analysisData.deviationType}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Note Deviasi */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Note Deviasi</span>
                        <p className="text-sm text-foreground mt-0.5">
                          {analysisData.deviationNotes}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Alasan AI */}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Alasan AI</span>
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-sm text-foreground leading-relaxed">
                            {analysisData.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand Analysis Accordion */}
                <Button
                  variant="outline"
                  onClick={() => setShowExpandedAnalysis(!showExpandedAnalysis)}
                  className="w-full h-11 justify-between rounded-xl border-dashed hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">Expand Full Analysis</span>
                  </div>
                  {showExpandedAnalysis ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Expanded Analysis Content */}
                {showExpandedAnalysis && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {/* Observed Facts */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          Observed Facts
                        </h4>
                      </div>
                      <div className="p-3">
                        <ul className="space-y-2">
                          {analysisData.observedFacts.map((fact, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Extracted Context */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-primary" />
                          Extracted Context
                        </h4>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/20 rounded-lg">
                          <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">Actors</span>
                          <span className="text-xs text-foreground">{analysisData.extractedContext.actors.join(", ")}</span>
                        </div>
                        <div className="p-2 bg-muted/20 rounded-lg">
                          <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">Objects</span>
                          <span className="text-xs text-foreground">{analysisData.extractedContext.objects.join(", ")}</span>
                        </div>
                        <div className="p-2 bg-muted/20 rounded-lg">
                          <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">Activities</span>
                          <span className="text-xs text-foreground">{analysisData.extractedContext.activities.join(", ")}</span>
                        </div>
                        <div className="p-2 bg-muted/20 rounded-lg">
                          <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">Work Context</span>
                          <span className="text-xs text-foreground">{analysisData.extractedContext.workContext}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-amber-500/5 border-b border-amber-500/20">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          Assumptions & Unknowns
                        </h4>
                      </div>
                      <div className="p-3">
                        <ul className="space-y-2">
                          {analysisData.assumptions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Evidence Matching */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-primary" />
                          Evidence Matching
                        </h4>
                      </div>
                      <div className="p-3 grid grid-cols-4 gap-2">
                        {[
                          { label: "Actor", match: analysisData.evidence.actorMatch },
                          { label: "Object", match: analysisData.evidence.objectMatch },
                          { label: "Activity", match: analysisData.evidence.activityMatch },
                          { label: "Context", match: analysisData.evidence.contextMatch }
                        ].map((item, idx) => (
                          <div key={idx} className="p-2 bg-muted/20 rounded-lg text-center">
                            <div className="flex justify-center mb-1">
                              <MatchIcon match={item.match} />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/20">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                          Recommended Next Steps
                        </h4>
                      </div>
                      <div className="p-3">
                        <ul className="space-y-2">
                          {analysisData.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-foreground p-2 bg-muted/20 rounded-lg">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : contentView === 'dokumen' ? (
              /* Dokumen Tab Content */
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium text-foreground">
                    Halaman {currentPage + 1} dari {docConfig.pages.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(docConfig.pages.length - 1, p + 1))}
                      disabled={currentPage === docConfig.pages.length - 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-background rounded-xl border border-border p-4 min-h-[300px] shadow-sm">
                  <h3 className="text-base font-semibold mb-3 text-foreground pb-2 border-b border-border">
                    {docConfig.pages[currentPage]?.title}
                  </h3>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {docConfig.pages[currentPage]?.content}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default RightAnalysisPanel;
