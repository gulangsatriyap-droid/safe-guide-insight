import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Clock, FileText, CheckCircle2, Ban, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HazardReport } from "@/data/hazardReports";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCountdown, getUrgencyLevel } from "@/hooks/useAutoConfirmCountdown";

// Simulated countdown state per report (in real app, this would come from backend)
const INITIAL_COUNTDOWN_SECONDS = 120; // 2 minutes for demo

interface ReportCountdownState {
  [reportId: string]: {
    remainingSeconds: number;
    isAutoConfirmed: boolean;
  };
}

interface ReportListPanelProps {
  reports: HazardReport[];
  selectedReportId: string;
  onSelectReport: (report: HazardReport) => void;
}

const getLabelConfig = (label: 'TBC' | 'PSPP' | 'GR', isActive: boolean) => {
  const configs = {
    TBC: {
      activeBg: "bg-primary/15",
      activeText: "text-primary",
      activeBorder: "border-primary/40",
    },
    GR: {
      activeBg: "bg-emerald-500/15",
      activeText: "text-emerald-600",
      activeBorder: "border-emerald-500/40",
    },
    PSPP: {
      activeBg: "bg-amber-500/15",
      activeText: "text-amber-600",
      activeBorder: "border-amber-500/40",
    },
  };

  if (isActive) {
    return configs[label];
  }
  return {
    activeBg: "bg-muted/40",
    activeText: "text-muted-foreground/60",
    activeBorder: "border-border/50",
  };
};

const getReportAge = (tanggal: string): string => {
  const today = new Date();
  const parts = tanggal.split(" ");
  const day = parseInt(parts[0]);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const month = monthNames.indexOf(parts[1]);
  const year = parseInt(parts[2]);
  
  const reportDate = new Date(year, month, day);
  const diffTime = Math.abs(today.getTime() - reportDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "1 hari lalu";
  return `${diffDays} hari lalu`;
};

const ReportListPanel = ({ reports, selectedReportId, onSelectReport }: ReportListPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Simulated countdown state for each report
  const [countdowns, setCountdowns] = useState<ReportCountdownState>(() => {
    const initial: ReportCountdownState = {};
    reports.forEach(report => {
      // Only AI-labeled reports get countdown (those with active labels)
      if (report.labels && report.labels.length > 0) {
        // Randomize initial countdown for demo (between 30s and 120s)
        const randomSeconds = Math.floor(Math.random() * 90) + 30;
        initial[report.id] = {
          remainingSeconds: randomSeconds,
          isAutoConfirmed: false,
        };
      }
    });
    return initial;
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(reportId => {
          const state = updated[reportId];
          if (!state.isAutoConfirmed && state.remainingSeconds > 0) {
            hasChanges = true;
            updated[reportId] = {
              ...state,
              remainingSeconds: state.remainingSeconds - 1,
              isAutoConfirmed: state.remainingSeconds - 1 <= 0,
            };
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter reports based on search
  const filteredReports = reports.filter(report =>
    report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.deskripsiTemuan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  return (
    <TooltipProvider>
      <div className="w-[300px] min-w-[280px] max-w-[320px] bg-card border-r border-border flex flex-col h-full">
        {/* Search & Filter */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari laporan..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Report List */}
        <div className="flex-1 overflow-y-auto">
        {paginatedReports.map((report) => {
            const isSelected = report.id === selectedReportId;
            const labels = report.labels || [];
            const countdown = countdowns[report.id];
            const hasActiveLabels = labels.length > 0;
            const isAutoConfirmed = countdown?.isAutoConfirmed || false;
            const remainingSeconds = countdown?.remainingSeconds || 0;
            const urgency = hasActiveLabels ? getUrgencyLevel(remainingSeconds, INITIAL_COUNTDOWN_SECONDS) : 'normal';
            
            return (
              <button
                key={report.id}
                onClick={() => onSelectReport(report)}
                className={cn(
                  "w-full text-left p-4 border-b border-border transition-all hover:bg-muted/50",
                  isSelected && "bg-primary/5 border-l-4 border-l-primary shadow-sm"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-primary/10" : "bg-muted"
                  )}>
                    <FileText className={cn(
                      "w-4 h-4",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Labels Row - Improved visibility */}
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      {(['TBC', 'GR', 'PSPP'] as const).map((type) => {
                        const isActive = labels.includes(type);
                        const config = getLabelConfig(type, isActive);
                        
                        if (!isActive) {
                          return (
                            <Tooltip key={type}>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border",
                                    config.activeBg, config.activeText, config.activeBorder
                                  )}
                                >
                                  <Ban className="w-2.5 h-2.5" />
                                  {type}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                {type === 'GR' 
                                  ? "Tidak ada rule GR yang cocok."
                                  : `${type} tidak terdeteksi.`
                                }
                              </TooltipContent>
                            </Tooltip>
                          );
                        }
                        
                        return (
                          <span
                            key={type}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border-2 shadow-sm",
                              config.activeBg, config.activeText, config.activeBorder
                            )}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {type}
                          </span>
                        );
                      })}
                    </div>
                    
                    <h4 className={cn(
                      "text-sm font-semibold truncate",
                      isSelected ? "text-foreground" : "text-foreground/90"
                    )}>
                      {report.id}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {report.subJenisHazard}
                    </p>
                    
                    {/* Date row */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{report.tanggal}</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span>{getReportAge(report.tanggal)}</span>
                    </div>

                    {/* Auto-confirm countdown (only for AI-labeled reports) */}
                    {hasActiveLabels && (
                      <div className="mt-2">
                        {isAutoConfirmed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                <Lock className="w-3 h-3" />
                                <span className="text-[10px] font-medium">Auto-confirmed</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p>Klasifikasi AI sudah final. Anotasi manual tidak tersedia.</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full",
                                urgency === 'critical' ? "bg-destructive/10" :
                                urgency === 'warning' ? "bg-amber-500/10" : "bg-primary/10"
                              )}>
                                <Clock className={cn(
                                  "w-3 h-3",
                                  urgency === 'critical' ? "text-destructive" :
                                  urgency === 'warning' ? "text-amber-500" : "text-primary"
                                )} />
                                <span className={cn(
                                  "text-[10px] font-bold tabular-nums",
                                  urgency === 'critical' ? "text-destructive" :
                                  urgency === 'warning' ? "text-amber-600" : "text-primary"
                                )}>
                                  {formatCountdown(remainingSeconds)}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[200px]">
                              <p>Auto-confirm dalam {formatCountdown(remainingSeconds)}. Review sekarang untuk anotasi manual.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{filteredReports.length} laporan</span>
            <span>Hal {currentPage} / {totalPages || 1}</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className="w-7 h-7"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ReportListPanel;
