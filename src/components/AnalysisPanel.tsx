import { useState } from "react";
import { 
  X, FileText, AlertTriangle, Image, Sparkles, Eye, HelpCircle, ArrowRight,
  ShieldAlert, Camera, FileImage, Scale, FileSearch, CheckCircle2, XCircle,
  ChevronRight, Layers
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    activeBg: "bg-primary",
    activeText: "text-primary-foreground"
  },
  PSPP: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-600",
    activeBg: "bg-amber-500",
    activeText: "text-white"
  },
  GR: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-600",
    activeBg: "bg-emerald-500",
    activeText: "text-white"
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
  const [activeTab, setActiveTab] = useState<'TBC' | 'GR' | 'PSPP'>(type);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  if (!isOpen) return null;

  // AI Reasons as bullet points
  const aiReasons = [
    "Tidak memakai helm dan APD lainnya",
    "Konteks visual: pekerja sedang istirahat",
    "Bukan aktivitas kerja aktif",
    "Sinyal deviasi cocok dengan TBC"
  ];

  // Extracted Content data
  const extractedContent = {
    actors: analysisData.extractedContext.actors,
    objects: analysisData.extractedContext.objects,
    activities: analysisData.extractedContext.activities,
    workContext: analysisData.extractedContext.workContext,
    visualSignals: analysisData.extractedContext.visualSignals,
  };

  // Evidence Matching data
  const evidenceMatching = {
    actorMatch: analysisData.evidence.actorMatch,
    objectMatch: analysisData.evidence.objectMatch,
    activityMatch: analysisData.evidence.activityMatch,
    contextMatch: analysisData.evidence.contextMatch,
    matchedSignals: analysisData.evidence.matchedSignals,
    missingSignals: analysisData.evidence.missingSignals,
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">Detail Analisis</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Title Section */}
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {activeTab} - {activeTab === 'TBC' ? 'To be Concern Hazard' : activeTab === 'GR' ? 'Golden Rules' : 'PSPP'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-primary font-medium">Pengoperasian Kendaraan / Unit</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Foto</span>
              </div>
            </div>

            {/* Tab Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('TBC')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'TBC' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {activeTab === 'TBC' && <span className="text-xs">✓</span>}
                TBC
              </button>
              <button
                onClick={() => setActiveTab('GR')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'GR' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                × GR
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">FALSE</span>
              </button>
              <button
                onClick={() => setActiveTab('PSPP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'PSPP' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                × PSPP
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">FALSE</span>
              </button>
            </div>

            {/* Icon Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
                <FileText className="w-3.5 h-3.5" />
                Aa
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
                {"{ }"}
              </button>
            </div>

            {/* Yellow Warning Card - Deviasi with Hazard Icon */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Deviasi pengoperasian kendaraan/unit
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tipe: <span className="text-primary">Akses Area yang Tidak Aktif Belum Ditutup</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tipe Deviasi Card with Photo Icon */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">
                    Tipe Deviasi : <span className="text-muted-foreground">Foto</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <FileImage className="w-3 h-3" />
                    Deskripsi dan foto konsisten, sinyal deviasi dan objek cocok dengan TBC
                  </p>
                </div>
              </div>
            </div>

            {/* Bobot Deviasi Card */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">
                    Bobot Deviasi : <span className="text-amber-600 font-semibold">Medium</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tingkat keparahan berdasarkan evaluasi risiko dan dampak potensial
                  </p>
                </div>
              </div>
            </div>

            {/* Orange AI Reason Card */}
            <Collapsible defaultOpen className="rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-500/15 dark:hover:to-orange-500/15 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">ALASAN AI</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-x border-b border-amber-200 dark:border-amber-500/20 rounded-b-xl -mt-3">
                <ul className="space-y-2 pt-3">
                  {aiReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Accordion Sections */}
            <Accordion type="multiple" className="space-y-2" value={expandedSections} onValueChange={setExpandedSections}>
              {/* Observed Fact with nested sub-sections */}
              <AccordionItem value="observed-fact" className="border border-border rounded-xl overflow-hidden bg-card">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]]:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Observed Fact</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 mt-2">
                    {/* Facts list */}
                    <ul className="space-y-2">
                      {analysisData.observedFacts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {fact}
                        </li>
                      ))}
                    </ul>

                    {/* Nested: Extracted Content */}
                    <Collapsible className="border border-border/50 rounded-lg bg-muted/20">
                      <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileSearch className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-medium text-foreground">Extracted Content</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[70px]">Actors:</span>
                            <span className="text-foreground">{extractedContent.actors.join(", ")}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[70px]">Objects:</span>
                            <span className="text-foreground">{extractedContent.objects.join(", ")}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[70px]">Activities:</span>
                            <span className="text-foreground">{extractedContent.activities.join(", ")}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[70px]">Context:</span>
                            <span className="text-foreground">{extractedContent.workContext}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[70px]">Signals:</span>
                            <span className="text-foreground">{extractedContent.visualSignals.join(", ")}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Nested: Evidence Matching */}
                    <Collapsible className="border border-border/50 rounded-lg bg-muted/20">
                      <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-medium text-foreground">Evidence Matching</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            {evidenceMatching.actorMatch ? 
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : 
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            }
                            <span className="text-foreground">Actor Match: {evidenceMatching.actorMatch ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {evidenceMatching.objectMatch ? 
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : 
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            }
                            <span className="text-foreground">Object Match: {evidenceMatching.objectMatch ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {evidenceMatching.activityMatch ? 
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : 
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            }
                            <span className="text-foreground">Activity Match: {evidenceMatching.activityMatch ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border/50">
                            <span className="text-muted-foreground">Context:</span>
                            <span className="text-foreground">{evidenceMatching.contextMatch}</span>
                          </div>
                          {evidenceMatching.matchedSignals.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {evidenceMatching.matchedSignals.map((signal, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] rounded-full">
                                  {signal}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Assumptions & Unknowns */}
              <AccordionItem value="assumptions" className="border border-border rounded-xl overflow-hidden bg-card">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]]:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Assumptions & Unknowns</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-2 mt-2">
                    {analysisData.assumptions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Recommended Next Steps */}
              <AccordionItem value="recommendations" className="border border-border rounded-xl overflow-hidden bg-card">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]]:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Recommended Next Steps</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-2 mt-2">
                    {analysisData.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-foreground p-2 bg-muted/20 rounded-lg">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AnalysisPanel;
