import { useState, useEffect } from "react";
import { X, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle, Sparkles, Target, Eye, Brain, ArrowRight, Ban, Info, XCircle, Braces, Copy, Download, ChevronDownSquare, ChevronUpSquare, Search, BookOpen, Link2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AIKnowledgeSource } from "@/data/hazardReports";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RightAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiSources: AIKnowledgeSource[];
  activeLabels: ('TBC' | 'PSPP' | 'GR')[];
  initialTab?: 'TBC' | 'GR' | 'PSPP';
}

// Consistent label config - TBC blue, GR green, PSPP orange
const labelConfig = {
  TBC: { 
    bg: "bg-primary/10", 
    text: "text-primary",
    border: "border-primary/30",
    accent: "bg-gradient-to-r from-primary/5 to-primary/10",
    iconBg: "bg-primary/10",
    activeBg: "bg-primary",
    activeText: "text-primary-foreground",
    falseBadge: "bg-primary/10 text-primary border-primary/30"
  },
  GR: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-600",
    border: "border-emerald-500/30",
    accent: "bg-gradient-to-r from-emerald-500/5 to-emerald-500/10",
    iconBg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500",
    activeText: "text-white",
    falseBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
  },
  PSPP: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-600",
    border: "border-amber-500/30",
    accent: "bg-gradient-to-r from-amber-500/5 to-amber-500/10",
    iconBg: "bg-amber-500/10",
    activeBg: "bg-amber-500",
    activeText: "text-white",
    falseBadge: "bg-amber-500/10 text-amber-600 border-amber-500/30"
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
  }
};

const RightAnalysisPanel = ({ isOpen, onClose, aiSources, activeLabels, initialTab }: RightAnalysisPanelProps) => {
  const [activeTab, setActiveTab] = useState<'TBC' | 'GR' | 'PSPP'>(initialTab || 'TBC');
  const [showExpandedAnalysis, setShowExpandedAnalysis] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [contentView, setContentView] = useState<'detail' | 'dokumen'>('detail');
  const [drawerMode, setDrawerMode] = useState<'none' | 'dokumen' | 'ontologi'>('none');
  const [jsonExpanded, setJsonExpanded] = useState(false);

  // Update active tab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sample ontology JSON data
  const ontologyData = {
    report_id: "TBC-VEH-004",
    classification: {
      tbc: {
        matched: activeLabels.includes('TBC'),
        category: "Deviasi pengoperasian kendaraan/unit",
        confidence: 0.95,
        deviation_type: "Pekerjaan tidak sesuai DOP / tidak ada DOP"
      },
      gr: {
        matched: activeLabels.includes('GR'),
        category: "Pengoperasian Kendaraan & Unit",
        confidence: 0.90,
        deviation_type: "Bekerja di ketinggian > 1.8 m tanpa full body harness"
      },
      pspp: {
        matched: activeLabels.includes('PSPP'),
        category: "Pelanggaran Prosedur Keselamatan",
        confidence: 0.88,
        deviation_type: "Hand rail tidak ada pada dudukan tandon profil"
      }
    },
    extracted_entities: {
      actors: ["Maintenance", "Inspector"],
      objects: ["Hauler", "Tire", "Workshop Tyre"],
      activities: ["Equipment inspection", "Maintenance observation"],
      work_context: "Work"
    },
    visual_analysis: {
      signals: ["Visual tyre damage", "Text unfit for operation"],
      image_quality: "Clear",
      visibility: "High"
    },
    timestamp: new Date().toISOString()
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(ontologyData, null, 2));
    toast.success("JSON disalin ke clipboard");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(ontologyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontology-${ontologyData.report_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON berhasil diunduh");
  };

  // Document references data
  const documentReferences = [
    {
      title: "SOP Keselamatan Pengoperasian Kendaraan",
      type: "SOP",
      reference: "SOP-KPK-001",
      sections: ["Pasal 4.2", "Pasal 5.1"]
    },
    {
      title: "Regulasi K3 Pertambangan",
      type: "Regulasi",
      reference: "REG-K3P-2024",
      sections: ["Bab III", "Pasal 12"]
    },
    {
      title: "Panduan Internal Safety",
      type: "Internal",
      reference: "INT-SAF-003",
      sections: ["Section 2.4", "Section 3.1"]
    }
  ];

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
  const getAnalysisData = (source: AIKnowledgeSource | undefined, isFalse: boolean = false) => {
    if (!source && !isFalse) return null;
    
    // Default data for FALSE states
    const defaultData = {
      id: `${activeTab}-VEH-004`,
      category: activeTab === 'TBC' ? 'Deviasi Pengoperasian Kendaraan/Unit' : 
                activeTab === 'GR' ? 'Golden Rules - Keselamatan Kerja' : 
                'Pelanggaran Prosedur Keselamatan',
      label: activeTab,
      relevanceScore: 0,
      classification: "No Match",
      reason: `AI tidak menemukan kecocokan ${activeTab === 'GR' ? 'Golden Rules' : activeTab} yang relevan dengan temuan ini berdasarkan analisis deskripsi dan visual.`,
      deviationType: "Tidak teridentifikasi",
      deviationNotes: `Tidak ada deviasi ${activeTab} yang terdeteksi pada laporan ini.`,
      extractedContext: {
        actors: ["Tidak teridentifikasi"],
        objects: ["Tidak teridentifikasi"],
        activities: ["Tidak teridentifikasi"],
        workContext: "Tidak jelas",
        visualSignals: [],
        textSignals: [],
        imageQuality: "Clear",
        visibility: "Tidak ada"
      },
      evidence: {
        actorMatch: false,
        objectMatch: false,
        activityMatch: false,
        contextMatch: "No Match",
        matchedSignals: [],
        missingSignals: ["Tidak ada sinyal yang cocok untuk kategori " + activeTab]
      },
      observedFacts: [
        "Tidak ditemukan indikasi pelanggaran " + activeTab + " pada laporan ini"
      ],
      assumptions: [
        "Mungkin memerlukan review manual untuk konfirmasi"
      ],
      recommendations: [
        "Review laporan secara manual jika diperlukan",
        "Cek kategori lain yang mungkin relevan"
      ]
    };

    if (!source) return defaultData;
    
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

  const analysisData = getAnalysisData(currentSource, !isCurrentActive);

  // Calculate panel widths based on drawer state
  const mainPanelWidth = drawerMode !== 'none' ? 'w-[480px]' : 'w-[480px]';
  const extensionPanelWidth = 'w-[420px]';
  
  return (
    <TooltipProvider>
      {/* Container for both panels */}
      <div className="fixed top-0 right-0 bottom-0 flex z-50 animate-in slide-in-from-right duration-300">
        {/* Extension Panel for Dokumen / Ontologi - appears on the LEFT of main panel */}
        {drawerMode !== 'none' && (
          <div className={`${extensionPanelWidth} bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-200`}>
            {/* Extension Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  drawerMode === 'dokumen' ? "bg-primary/10" : "bg-amber-500/10"
                )}>
                  {drawerMode === 'dokumen' 
                    ? <BookOpen className="w-4 h-4 text-primary" />
                    : <Braces className="w-4 h-4 text-amber-600" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {drawerMode === 'dokumen' ? 'Dokumen Rujukan' : 'Raw Ontology JSON'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {drawerMode === 'dokumen' ? 'Referensi SOP & Regulasi' : 'Struktur data klasifikasi AI'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerMode('none')}
                className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Extension Panel Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {drawerMode === 'dokumen' ? (
                  /* Dokumen Rujukan Content */
                  <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text"
                        placeholder="Cari dokumen..."
                        className="w-full h-9 pl-9 pr-3 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                      />
                    </div>
                    
                    {/* Document List */}
                    {documentReferences.map((doc, idx) => (
                      <div 
                        key={idx}
                        className="bg-card border border-border rounded-xl p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            doc.type === 'SOP' ? "bg-primary/10" :
                            doc.type === 'Regulasi' ? "bg-emerald-500/10" :
                            "bg-amber-500/10"
                          )}>
                            <FileText className={cn(
                              "w-4 h-4",
                              doc.type === 'SOP' ? "text-primary" :
                              doc.type === 'Regulasi' ? "text-emerald-600" :
                              "text-amber-600"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                                doc.type === 'SOP' ? "bg-primary/10 text-primary" :
                                doc.type === 'Regulasi' ? "bg-emerald-500/10 text-emerald-600" :
                                "bg-amber-500/10 text-amber-600"
                              )}>
                                {doc.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{doc.reference}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {doc.sections.map((section, sIdx) => (
                                <span 
                                  key={sIdx}
                                  className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                                >
                                  {section}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center shrink-0">
                            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Ontologi JSON Content */
                  <div className="space-y-3">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs gap-1.5"
                        onClick={handleCopyJson}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy JSON
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs gap-1.5"
                        onClick={handleDownloadJson}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </div>
                    
                    {/* Expand/Collapse Toggle */}
                    <button 
                      onClick={() => setJsonExpanded(!jsonExpanded)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {jsonExpanded ? (
                        <>
                          <ChevronUpSquare className="w-3.5 h-3.5" />
                          Collapse All
                        </>
                      ) : (
                        <>
                          <ChevronDownSquare className="w-3.5 h-3.5" />
                          Expand All
                        </>
                      )}
                    </button>
                    
                    {/* JSON Code Viewer */}
                    <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-xs font-mono leading-relaxed">
                        <code className="text-slate-300">
                          {jsonExpanded ? (
                            JSON.stringify(ontologyData, null, 2).split('\n').map((line, i) => (
                              <div key={i} className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">{String(i + 1).padStart(3, ' ')}</span>
                                {line.includes(':') ? (
                                  <>
                                    <span className="text-cyan-400">{line.split(':')[0]}</span>
                                    <span className="text-slate-400">:</span>
                                    <span className={cn(
                                      line.includes('true') ? "text-emerald-400" :
                                      line.includes('false') ? "text-rose-400" :
                                      line.includes('"') ? "text-amber-300" :
                                      "text-purple-400"
                                    )}>{line.split(':').slice(1).join(':')}</span>
                                  </>
                                ) : (
                                  <span className="text-slate-400">{line}</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  1</span>
                                <span className="text-slate-400">{'{'}</span>
                              </div>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  2</span>
                                <span className="text-cyan-400">  "report_id"</span>
                                <span className="text-slate-400">: </span>
                                <span className="text-amber-300">"{ontologyData.report_id}"</span>
                                <span className="text-slate-400">,</span>
                              </div>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  3</span>
                                <span className="text-cyan-400">  "classification"</span>
                                <span className="text-slate-400">: </span>
                                <span className="text-slate-500">{'{ ... }'}</span>
                                <span className="text-slate-400">,</span>
                              </div>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  4</span>
                                <span className="text-cyan-400">  "extracted_entities"</span>
                                <span className="text-slate-400">: </span>
                                <span className="text-slate-500">{'{ ... }'}</span>
                                <span className="text-slate-400">,</span>
                              </div>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  5</span>
                                <span className="text-cyan-400">  "visual_analysis"</span>
                                <span className="text-slate-400">: </span>
                                <span className="text-slate-500">{'{ ... }'}</span>
                                <span className="text-slate-400">,</span>
                              </div>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  6</span>
                                <span className="text-cyan-400">  "timestamp"</span>
                                <span className="text-slate-400">: </span>
                                <span className="text-amber-300">"..."</span>
                              </div>
                              <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                                <span className="text-slate-600 select-none mr-4">  7</span>
                                <span className="text-slate-400">{'}'}</span>
                              </div>
                            </>
                          )}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Main Analysis Panel */}
        <div className={`${mainPanelWidth} max-w-[40vw] min-w-[400px] bg-card border-l border-border shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center`}>
              <FileText className={`w-5 h-5 ${config.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Detail Analisis</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{docConfig.title}</p>
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Segmented Tabs - Order: TBC → GR → PSPP with bold colors */}
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
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                        isActive 
                          ? `${typeConfig.activeBg} ${typeConfig.activeText} shadow-md`
                          : isLabelActive
                            ? `${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border} hover:opacity-80`
                            : "bg-muted/80 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted border border-transparent"
                      )}
                    >
                      {!isLabelActive && (
                        <XCircle className="w-3.5 h-3.5 text-destructive/60" />
                      )}
                      {isLabelActive && isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {type}
                      {!isLabelActive && !isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-bold ml-0.5">FALSE</span>
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
          
          {/* Dokumen & Ontologi Toggle Buttons */}
          <div className="flex gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDrawerMode(drawerMode === 'dokumen' ? 'none' : 'dokumen')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                    drawerMode === 'dokumen' 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-semibold">Aa</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{drawerMode === 'dokumen' ? 'Dokumen (open)' : 'Dokumen'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDrawerMode(drawerMode === 'ontologi' ? 'none' : 'ontologi')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                    drawerMode === 'ontologi' 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  <Braces className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{drawerMode === 'ontologi' ? 'Ontologi (open)' : 'Ontologi (JSON)'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* FALSE Status Banner - Show when current tab is FALSE */}
        {!isCurrentActive && (
          <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/15 border border-destructive/30">
                <XCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-bold text-destructive">FALSE</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Status: Tidak memenuhi kriteria {activeTab}
              </span>
            </div>
          </div>
        )}


        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-4">
            {analysisData && (
              /* Detail Analysis Content - Always show, even for FALSE states */
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                {/* Main Analysis Card */}
                <div className={`rounded-xl border ${isCurrentActive ? config.border : 'border-border'} overflow-hidden`}>
                  {/* Card Header */}
                  <div className={`px-4 py-3 ${isCurrentActive ? config.accent : 'bg-muted/30'} border-b ${isCurrentActive ? config.border : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${isCurrentActive ? config.iconBg : 'bg-muted/50'} flex items-center justify-center`}>
                        <Target className={`w-4 h-4 ${isCurrentActive ? config.text : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {analysisData.category}
                          </h4>
                          {!isCurrentActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-bold">FALSE</span>
                          )}
                        </div>
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm font-bold text-foreground">
                            {activeTab}
                          </p>
                          {!isCurrentActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Not Matched</span>
                          )}
                        </div>
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
                      <div className={`w-6 h-6 rounded-md ${isCurrentActive ? 'bg-primary/10' : 'bg-muted/50'} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Brain className={`w-3.5 h-3.5 ${isCurrentActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Alasan AI</span>
                        <div className={`mt-2 p-3 rounded-lg border ${isCurrentActive ? 'bg-primary/5 border-primary/10' : 'bg-muted/30 border-border'}`}>
                          <p className="text-sm text-foreground leading-relaxed">
                            {analysisData.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation for FALSE states */}
                {!isCurrentActive && activeLabels.length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Lihat kategori yang terdeteksi:</p>
                    <div className="flex gap-2 flex-wrap">
                      {activeLabels.map(label => {
                        const lConfig = labelConfig[label];
                        return (
                          <Button
                            key={label}
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab(label)}
                            className={cn(
                              "gap-1.5 h-8 text-xs font-bold",
                              lConfig.bg, lConfig.text, `border ${lConfig.border}`
                            )}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {label}
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
            )}
          </div>
        </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RightAnalysisPanel;
