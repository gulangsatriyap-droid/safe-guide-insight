import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Clock, CheckCircle2, AlertCircle, RotateCcw, MapPin, ExternalLink, X, Lock, Ban, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HazardReport, similarReports, EvaluationStatus, AIKnowledgeSource } from "@/data/hazardReports";
import VLMInspectionPanel from "./VLMInspectionPanel";
import RightAnalysisPanel from "./RightAnalysisPanel";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const labelConfig = {
  TBC: { 
    bg: "bg-primary/15", 
    text: "text-primary", 
    border: "border-primary/40", 
    fullName: "TBC",
    activeBg: "bg-primary",
    activeText: "text-primary-foreground"
  },
  PSPP: { 
    bg: "bg-amber-500/15", 
    text: "text-amber-600", 
    border: "border-amber-500/40", 
    fullName: "PSPP",
    activeBg: "bg-amber-500",
    activeText: "text-white"
  },
  GR: { 
    bg: "bg-emerald-500/15", 
    text: "text-emerald-600", 
    border: "border-emerald-500/40", 
    fullName: "GR",
    activeBg: "bg-emerald-500",
    activeText: "text-white"
  }
};

const getEvaluationStatusDisplay = (status: EvaluationStatus) => {
  switch (status) {
    case "BELUM_DIEVALUASI":
      return { icon: Clock, label: "Belum dievaluasi", color: "text-muted-foreground", bg: "bg-muted/50" };
    case "DALAM_EVALUASI":
      return { icon: AlertCircle, label: "Dalam Evaluasi", color: "text-info", bg: "bg-info/10" };
    case "SELESAI":
      return { icon: CheckCircle2, label: "Selesai", color: "text-success", bg: "bg-success/10" };
    case "PERLU_REVIEW_ULANG":
      return { icon: RotateCcw, label: "Perlu Review Ulang", color: "text-warning", bg: "bg-warning/10" };
    default:
      return { icon: Clock, label: "Unknown", color: "text-muted-foreground", bg: "bg-muted" };
  }
};

// Default AI sources for when report doesn't have them
const defaultAISources: AIKnowledgeSource[] = [
  {
    type: 'TBC',
    label: 'TBC',
    category: 'Deviasi pengoperasian kendaraan/unit',
    categoryNumber: 1,
    confidence: 95,
    reasoning: 'Meskipun terlihat tidak memakai helm dan APD lainnya, konteks visual menunjukkan kemungkinan kuat pekerja sedang istirahat, bukan sedang melakukan pekerjaan aktif.',
    citation: {
      title: 'TBC - To be Concern Hazard Guidelines',
      content: 'Kategori 1: Deviasi pengoperasian kendaraan/unit\n\nDefinisi: Setiap temuan yang berkaitan dengan pengoperasian kendaraan atau unit yang tidak sesuai dengan standar operasional prosedur yang telah ditetapkan.'
    }
  },
  {
    type: 'PSPP',
    label: 'PSPP',
    category: 'Pelanggaran Prosedur Keselamatan',
    categoryNumber: 4,
    confidence: 90,
    reasoning: 'Deskripsi temuan mengindikasikan adanya potensi bahaya yang disebabkan oleh penempatan atau kondisi unit/kendaraan yang tidak aman.',
    citation: {
      title: 'PSPP - Peraturan Sanksi Pelanggaran Prosedur',
      content: 'Pasal 4: Pelanggaran Prosedur Keselamatan\n\nAyat 1: Setiap pekerja wajib memastikan peralatan dan unit dalam kondisi aman sebelum, selama, dan setelah operasi.'
    }
  },
  {
    type: 'GR',
    label: 'GR',
    category: 'Pengoperasian Kendaraan & Unit',
    categoryNumber: 2,
    confidence: 90,
    reasoning: 'Deskripsi temuan menyebutkan adanya masalah dalam cara unit dioperasikan atau diposisikan, yang secara langsung berkaitan dengan aturan pengoperasian kendaraan dan unit.',
    citation: {
      title: 'Safety Golden Rules - Pengoperasian Kendaraan & Unit',
      content: 'Golden Rule #2: Pengoperasian Kendaraan & Unit\n\nPrinsip Dasar: "Selalu pastikan kendaraan dan unit dalam kondisi aman dan stabil sebelum meninggalkan posisi operator."'
    }
  }
];

interface ReportDetailProps {
  report: HazardReport;
  onBack: () => void;
  currentIndex: number;
  totalReports: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const ReportDetail = ({ report, onBack, currentIndex, totalReports, onNavigate }: ReportDetailProps) => {
  const evalStatus = report.evaluationStatus ? getEvaluationStatusDisplay(report.evaluationStatus) : null;
  const [confirmAction, setConfirmAction] = useState("");
  const [showVLMPanel, setShowVLMPanel] = useState(false);
  const [showPinPoint, setShowPinPoint] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  // Coordinates for the location (could come from report data)
  const latitude = 2.389337;
  const longitude = 117.36189;

  const handleOpenMaps = () => {
    try {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open maps:', error);
    }
  };

  // Use report's AI sources or default ones
  const aiSources = report.aiKnowledgeSources && report.aiKnowledgeSources.length > 0 
    ? report.aiKnowledgeSources 
    : defaultAISources;

  // Get active labels
  const activeLabels = report.labels || ['TBC', 'PSPP', 'GR'];

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Main Content Area - Full width, panel floats over */}
        <div className={cn(
          "flex-1 overflow-y-auto bg-background",
          ""
        )}>
          <div className="animate-fade-in p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Evaluator Dashboard
              </button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Detail Laporan</span>
            </div>

            {/* Report ID with AI Label */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">ID: {report.id}</h1>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">AI Labeled</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{currentIndex} of {totalReports}</span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onNavigate('prev')}
                    disabled={currentIndex === 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onNavigate('next')}
                    disabled={currentIndex === totalReports}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column - Info Cards */}
              <div className="lg:col-span-3 space-y-5">
                {/* Informasi Laporan */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4 text-base">Informasi Laporan</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">ID Laporan</p>
                      <p className="text-sm font-semibold text-foreground">{report.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Tanggal pembuatan</p>
                      <p className="text-sm font-medium text-foreground">{report.tanggalPembuatan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Pelapor</p>
                      <p className="text-sm font-medium text-foreground">{report.pelapor} - {report.rolePelapor}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Lokasi */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4 text-base">Informasi Lokasi</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Site</p>
                      <p className="text-sm font-medium text-foreground">{report.site}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Lokasi</p>
                      <p className="text-sm font-medium text-foreground">{report.lokasi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Detail Lokasi</p>
                      <p className="text-sm font-medium text-foreground">{report.detailLokasi}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2 text-xs h-9"
                      onClick={() => setShowPinPoint(true)}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Pin Point Lokasi
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2 text-xs h-9"
                      onClick={handleOpenMaps}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka Maps
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Latitude</p>
                      <p className="text-sm font-medium text-foreground">2.389337</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Longitude</p>
                      <p className="text-sm font-medium text-foreground">117.36189</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Deskripsi Objek */}
              <div className="lg:col-span-5 flex flex-col">
              {/* Deskripsi Temuan */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4 text-base">Deskripsi Temuan</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Ketidaksesuaian</p>
                      <p className="text-sm font-medium text-foreground">{report.jenisHazard || "APD"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary font-medium mb-0.5">Sub ketidaksesuaian</p>
                      <p className="text-sm font-medium text-foreground">{report.subJenisHazard || "Tidak menggunakan APD"}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-primary font-medium mb-0.5">Quick Action</p>
                    <p className="text-sm font-medium text-foreground">{report.quickAction || "Fatigue Test"}</p>
                  </div>

                  {/* Deskripsi Temuan */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Deskripsi Temuan</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.deskripsiTemuan || "Pekerja tidak menggunakan helm saat berada di area konstruksi."}
                    </p>
                  </div>

                  {/* Image */}
                  <div 
                    className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden group cursor-pointer"
                    onClick={() => setShowVLMPanel(true)}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop" 
                      alt="Bukti temuan" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-foreground">VLM Inspection</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - AI Output, Status, Pengendalian */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* AI Labeled - Clickable Cards */}
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm">AI Labeled</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
                      onClick={() => setShowAnalysisPanel(true)}
                    >
                      <Info className="w-3.5 h-3.5" />
                      Detail Analisis
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['TBC', 'PSPP', 'GR'] as const).map((type) => {
                      const isActive = activeLabels.includes(type);
                      const config = labelConfig[type];
                      
                      if (!isActive) {
                        return (
                          <Tooltip key={type}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setShowAnalysisPanel(true)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                                  "bg-muted/50 text-muted-foreground/70 border-border/60 hover:bg-muted"
                                )}
                              >
                                <Ban className="w-3.5 h-3.5 text-destructive/50" />
                                {type}
                                <span className="text-[10px] opacity-60">: No</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[180px]">
                              <p className="text-xs">
                                {type === 'GR' 
                                  ? "Tidak ada rule GR yang cocok pada laporan ini."
                                  : `${type} tidak terdeteksi.`
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      
                      return (
                        <button
                          key={type}
                          onClick={() => setShowAnalysisPanel(true)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all shadow-sm",
                            config.bg, config.text, config.border,
                            "hover:opacity-80 cursor-pointer"
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Laporan - Locked */}
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm relative">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-foreground text-sm">Status Laporan</h3>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </div>
                  <div className="opacity-50 pointer-events-none">
                    {evalStatus && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${evalStatus.bg}`}>
                        <evalStatus.icon className={`w-4 h-4 ${evalStatus.color}`} />
                        <div>
                          <p className={`text-sm font-medium ${evalStatus.color}`}>{evalStatus.label}</p>
                          <p className="text-xs text-muted-foreground">SLA Due <span className="text-destructive font-medium">10 Des 2025</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    🔒 Fitur ini akan aktif pada phase berikutnya
                  </p>
                </div>

                {/* Pengendalian Section - Locked */}
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-foreground text-sm">Pengendalian</h3>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-3 opacity-50 pointer-events-none">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Pilih konfirmasi</p>
                      <Select value={confirmAction} onValueChange={setConfirmAction} disabled>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Tutup Laporan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tutup">Tutup Laporan</SelectItem>
                          <SelectItem value="review">Perlu Review Ulang</SelectItem>
                          <SelectItem value="escalate">Eskalasi ke Supervisor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium" disabled>
                      Selesaikan Evaluasi
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    🔒 Fitur ini akan aktif pada phase berikutnya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Analysis Panel - Non-modal */}
        <RightAnalysisPanel
          isOpen={showAnalysisPanel}
          onClose={() => setShowAnalysisPanel(false)}
          aiSources={aiSources}
          activeLabels={activeLabels}
        />

        {/* VLM Inspection Panel */}
        <VLMInspectionPanel
          isOpen={showVLMPanel}
          onClose={() => setShowVLMPanel(false)}
          imageUrl="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop"
        />

        {/* Pin Point Location Modal */}
        <Dialog open={showPinPoint} onOpenChange={setShowPinPoint}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Pin Point Lokasi</DialogTitle>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Pin Point Lokasi</h3>
                </div>
                <button 
                  onClick={() => setShowPinPoint(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative aspect-video bg-muted">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.123456789!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwMjMnMjEuNiJOIDExN8KwMjEnNDIuOCJF!5e0!3m2!1sen!2sid!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
            <div className="p-4 bg-card border-t border-border">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Latitude</p>
                  <p className="text-sm font-medium text-foreground">{latitude}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Longitude</p>
                  <p className="text-sm font-medium text-foreground">{longitude}</p>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-0.5">Lokasi</p>
                <p className="text-sm font-medium text-foreground">{report.lokasi} - {report.detailLokasi}</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleOpenMaps}
              >
                <ExternalLink className="w-4 h-4" />
                Buka di Google Maps
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ReportDetail;
