import { useState } from "react";
import { FileText, Search, Filter, X, Clock, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HazardReport, EvaluationStatus, SLAStatus } from "@/data/hazardReports";

interface EvaluatorTableProps {
  reports: HazardReport[];
  onViewDetail: (report: HazardReport) => void;
}

const getLabelColor = (label: string): string => {
  switch (label) {
    case "TBC":
      return "bg-warning/10 text-warning border-warning/20";
    case "PSPP":
      return "bg-info/10 text-info border-info/20";
    case "GR":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getEvaluationStatusBadge = (status: EvaluationStatus) => {
  switch (status) {
    case "BELUM_DIEVALUASI":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1">
          <Clock className="w-3 h-3" />
          Belum Dievaluasi
        </Badge>
      );
    case "DALAM_EVALUASI":
      return (
        <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1">
          <AlertCircle className="w-3 h-3" />
          Dalam Evaluasi
        </Badge>
      );
    case "SELESAI":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Selesai
        </Badge>
      );
    case "PERLU_REVIEW_ULANG":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
          <RotateCcw className="w-3 h-3" />
          Perlu Review
        </Badge>
      );
    default:
      return null;
  }
};

const getSLABadge = (sla: SLAStatus) => {
  switch (sla) {
    case "hijau":
      return <span className="inline-block w-2 h-2 rounded-full bg-success" title="SLA Aman" />;
    case "kuning":
      return <span className="inline-block w-2 h-2 rounded-full bg-warning" title="SLA Mendekati" />;
    case "merah":
      return <span className="inline-block w-2 h-2 rounded-full bg-destructive" title="SLA Lewat" />;
    default:
      return null;
  }
};

const EvaluatorTable = ({ reports, onViewDetail }: EvaluatorTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [slaFilter, setSlaFilter] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === "" || 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.deskripsiTemuan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabel = selectedLabels.length === 0 || 
      selectedLabels.some(label => report.labels?.includes(label as 'TBC' | 'PSPP' | 'GR'));

    const matchesSLA = slaFilter === "all" || report.slaStatus === slaFilter;
    
    const matchesAssignment = assignmentFilter === "all" || 
      (assignmentFilter === "assigned" && report.assignedTo) ||
      (assignmentFilter === "unassigned" && !report.assignedTo);

    return matchesSearch && matchesLabel && matchesSLA && matchesAssignment;
  });

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const clearFilters = () => {
    setSelectedLabels([]);
    setSlaFilter("all");
    setAssignmentFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLabels.length > 0 || slaFilter !== "all" || assignmentFilter !== "all";

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Stats
  const siapEvaluasiCount = reports.filter(r => r.evaluationStatus === "BELUM_DIEVALUASI").length;
  const slaLewatCount = reports.filter(r => r.slaStatus === "merah").length;

  return (
    <div className="bg-card rounded-lg card-shadow animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Daftar Laporan (Siap Dievaluasi)</h2>
              <p className="text-sm text-muted-foreground">
                {siapEvaluasiCount} siap dievaluasi 
                {slaLewatCount > 0 && <span className="text-destructive"> · {slaLewatCount} SLA lewat batas</span>}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari ID, pelapor, lokasi, atau deskripsi..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Label Filters */}
          <div className="flex items-center gap-2">
            <Button 
              variant={selectedLabels.includes("TBC") ? "default" : "outline"} 
              size="sm"
              className={selectedLabels.includes("TBC") ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
              onClick={() => handleLabelToggle("TBC")}
            >
              TBC
            </Button>
            <Button 
              variant={selectedLabels.includes("PSPP") ? "default" : "outline"} 
              size="sm"
              className={selectedLabels.includes("PSPP") ? "bg-info text-info-foreground hover:bg-info/90" : ""}
              onClick={() => handleLabelToggle("PSPP")}
            >
              PSPP
            </Button>
            <Button 
              variant={selectedLabels.includes("GR") ? "default" : "outline"} 
              size="sm"
              className={selectedLabels.includes("GR") ? "bg-success text-success-foreground hover:bg-success/90" : ""}
              onClick={() => handleLabelToggle("GR")}
            >
              GR
            </Button>
          </div>

          {/* SLA Filter */}
          <Select value={slaFilter} onValueChange={setSlaFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="SLA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua SLA</SelectItem>
              <SelectItem value="merah">SLA Lewat</SelectItem>
              <SelectItem value="kuning">SLA Mendekati</SelectItem>
              <SelectItem value="hijau">SLA Aman</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignment Filter */}
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="assigned">Assigned ke Saya</SelectItem>
              <SelectItem value="unassigned">Belum Assigned</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 w-10">
                <Checkbox 
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Label</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Confidence</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ID Tracking</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tanggal</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pelapor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Lokasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Jenis Hazard</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status Evaluasi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">SLA</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, index) => (
              <tr 
                key={report.id} 
                className="border-b border-border hover:bg-muted/20 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-4 py-3">
                  <Checkbox 
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => handleSelectReport(report.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {report.labels?.map(label => (
                      <span 
                        key={label}
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${getLabelColor(label)}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${
                    (report.confidenceScore || 0) >= 90 ? 'text-success' :
                    (report.confidenceScore || 0) >= 80 ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {report.confidenceScore || 0}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{report.id}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{report.tanggal}</td>
                <td className="px-4 py-3 text-sm text-foreground">{report.pelapor}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.lokasiKode}</p>
                    <p className="text-xs text-muted-foreground">{report.lokasi}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.jenisHazard}</p>
                    <p className="text-xs text-muted-foreground">{report.subJenisHazard}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {report.evaluationStatus && getEvaluationStatusBadge(report.evaluationStatus)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {report.slaStatus && getSLABadge(report.slaStatus)}
                    <span className="text-xs text-muted-foreground">{report.slaDueDate}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                    onClick={() => onViewDetail(report)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Evaluasi
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {filteredReports.length} dari {reports.length} laporan
          {hasActiveFilters && ` (hasil filter)`}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorTable;