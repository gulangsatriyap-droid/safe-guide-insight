import { useState } from "react";
import { X, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle, Sparkles, Target, Eye, Brain, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'TBC' | 'PSPP' | 'GR';
  analysisData: {
    id: string;
    category: string;
    label: string;
    relevanceScore: number;
    classification: string;
    reason: string;
    deviationType: string;
    deviationNotes: string;
    extractedContext: {
      actors: string[];
      objects: string[];
      activities: string[];
      workContext: string;
      visualSignals: string[];
      textSignals: string[];
      imageQuality: string;
      visibility: string;
    };
    evidence: {
      actorMatch: boolean;
      objectMatch: boolean;
      activityMatch: boolean;
      contextMatch: string;
      matchedSignals: string[];
      missingSignals: string[];
    };
    observedFacts: string[];
    assumptions: string[];
    recommendations: string[];
  };
}

const labelConfig = {
  TBC: { 
    bg: "bg-primary/10", 
    text: "text-primary",
    border: "border-primary/20",
    accent: "bg-gradient-to-r from-primary/5 to-primary/10",
    iconBg: "bg-primary/10"
  },
  PSPP: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-600",
    border: "border-amber-500/20",
    accent: "bg-gradient-to-r from-amber-500/5 to-amber-500/10",
    iconBg: "bg-amber-500/10"
  },
  GR: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-600",
    border: "border-emerald-500/20",
    accent: "bg-gradient-to-r from-emerald-500/5 to-emerald-500/10",
    iconBg: "bg-emerald-500/10"
  }
};

const documentConfig = {
  TBC: {
    title: "Rujukan Dokumen",
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
        title: "Pendahuluan",
        content: `PENDAHULUAN

TBC (To Be Concern) adalah sistem klasifikasi temuan keselamatan yang dirancang untuk mengidentifikasi dan mengelola potensi bahaya di lingkungan kerja.

Tujuan:
• Mengidentifikasi potensi bahaya sejak dini
• Mencegah terjadinya insiden keselamatan
• Memastikan kepatuhan terhadap prosedur keselamatan`
      },
      {
        page: 3,
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
    title: "Rujukan Dokumen",
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
    title: "Rujukan Dokumen",
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

const AnalysisPanel = ({ isOpen, onClose, type, analysisData }: AnalysisPanelProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showExpandedAnalysis, setShowExpandedAnalysis] = useState(false);
  const config = labelConfig[type];
  const docConfig = documentConfig[type];

  if (!isOpen) return null;

  const MatchIcon = ({ match }: { match: boolean | string }) => {
    if (match === true || match === "Match" || match === "Ya") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shadow-sm`}>
              <FileText className={`w-6 h-6 ${config.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${config.bg} ${config.text}`}>
                  {type}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Analysis</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">{docConfig.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-all hover:scale-105"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="detail" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <TabsList className="w-full grid grid-cols-2 h-11 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="detail" 
                className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Detail Analisis
              </TabsTrigger>
              <TabsTrigger 
                value="dokumen" 
                className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Dokumen
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Detail Analisis Tab */}
          <TabsContent value="detail" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-5">
                {/* Main Analysis Card */}
                <div className={`rounded-xl border ${config.border} overflow-hidden`}>
                  {/* Card Header */}
                  <div className={`px-5 py-4 ${config.accent} border-b ${config.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center`}>
                        <Target className={`w-5 h-5 ${config.text}`} />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          Deviasi Pengoperasian Kendaraan/Unit
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Hasil klasifikasi otomatis oleh AI
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 space-y-4 bg-card">
                    {/* Kategori */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-muted-foreground">1</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kategori</span>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {analysisData.category}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Tipe */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipe Deviasi</span>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {analysisData.deviationType}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Alasan */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alasan AI</span>
                        <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-sm text-foreground leading-relaxed">
                            {analysisData.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand Analysis Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowExpandedAnalysis(!showExpandedAnalysis)}
                  className="w-full h-12 justify-between rounded-xl border-dashed hover:border-primary hover:bg-primary/5 transition-all group"
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
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Observed Facts */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          Observed Facts
                        </h4>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {analysisData.observedFacts.map((fact, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
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
                      <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-primary" />
                          Extracted Context
                        </h4>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground block mb-1">Actors</span>
                          <span className="text-sm text-foreground">{analysisData.extractedContext.actors.join(", ")}</span>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground block mb-1">Objects</span>
                          <span className="text-sm text-foreground">{analysisData.extractedContext.objects.join(", ")}</span>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground block mb-1">Activities</span>
                          <span className="text-sm text-foreground">{analysisData.extractedContext.activities.join(", ")}</span>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground block mb-1">Work Context</span>
                          <span className="text-sm text-foreground">{analysisData.extractedContext.workContext}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/20">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          Assumptions & Unknowns
                        </h4>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {analysisData.assumptions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Evidence Matching */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-primary" />
                          Evidence Matching
                        </h4>
                      </div>
                      <div className="p-4 grid grid-cols-4 gap-3">
                        {[
                          { label: "Actor", match: analysisData.evidence.actorMatch },
                          { label: "Object", match: analysisData.evidence.objectMatch },
                          { label: "Activity", match: analysisData.evidence.activityMatch },
                          { label: "Context", match: analysisData.evidence.contextMatch }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 bg-muted/20 rounded-lg text-center">
                            <div className="flex justify-center mb-2">
                              <MatchIcon match={item.match} />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/20">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                          Recommended Next Steps
                        </h4>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {analysisData.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-foreground p-3 bg-muted/20 rounded-lg">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">
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
            </ScrollArea>
          </TabsContent>

          {/* Dokumen Tab */}
          <TabsContent value="dokumen" className="flex-1 overflow-hidden m-0">
            <div className="h-full flex flex-col px-6 py-4">
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-xl">
                <span className="text-sm font-medium text-foreground">
                  Halaman {currentPage + 1} dari {docConfig.pages.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(docConfig.pages.length - 1, p + 1))}
                    disabled={currentPage === docConfig.pages.length - 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="bg-background rounded-xl border border-border p-6 min-h-[400px] shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-foreground pb-3 border-b border-border">
                    {docConfig.pages[currentPage]?.title}
                  </h3>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {docConfig.pages[currentPage]?.content}
                  </pre>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisPanel;