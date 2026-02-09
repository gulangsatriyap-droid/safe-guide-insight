import { useState } from "react";
import { FileText, Search, X, Pencil, Eye, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HazardReport } from "@/data/hazardReports";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface EvaluatorTableProps {
  reports: HazardReport[];
  onViewDetail: (report: HazardReport) => void;
}

// Dummy images for preview
const DUMMY_IMAGES = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
];

const getAIResult = (report: HazardReport, type: 'TBC' | 'GR' | 'PSPP') => {
  const hasLabel = report.labels?.includes(type);
  const source = report.aiKnowledgeSources?.find(s => s.type === type);

  if (hasLabel && source) {
    return {
      active: true,
      category: source.category,
      confidence: source.confidence,
      icon: type === "PSPP" ? "⚠" : "✔",
      cls: type === "TBC" ? "text-warning bg-warning/10 border-warning/20"
        : type === "GR" ? "text-success bg-success/10 border-success/20"
          : "text-info bg-info/10 border-info/20",
    };
  }
  if (hasLabel) {
    return {
      active: true,
      category: type === "TBC" ? "Deviasi terdeteksi" : type === "GR" ? "Pelanggaran GR" : "Pelanggaran Prosedur",
      confidence: report.confidenceScore || 0,
      icon: type === "PSPP" ? "⚠" : "✔",
      cls: type === "TBC" ? "text-warning bg-warning/10 border-warning/20"
        : type === "GR" ? "text-success bg-success/10 border-success/20"
          : "text-info bg-info/10 border-info/20",
    };
  }
  return {
    active: false,
    category: "-",
    confidence: 0,
    icon: "✖",
    cls: "text-muted-foreground bg-muted/30 border-border",
  };
};

const EvaluatorTable = ({ reports, onViewDetail }: EvaluatorTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === "" ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pelapor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.deskripsiTemuan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabel = selectedLabels.length === 0 ||
      selectedLabels.some(label => report.labels?.includes(label as 'TBC' | 'PSPP' | 'GR'));

    return matchesSearch && matchesLabel;
  });

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const clearFilters = () => {
    setSelectedLabels([]);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLabels.length > 0 || searchTerm !== "";

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg card-shadow animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Daftar Laporan (Siap Dievaluasi)</h2>
                <p className="text-sm text-muted-foreground">
                  {reports.length} laporan · Fast review mode
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

            <div className="flex items-center gap-2">
              {["TBC", "PSPP", "GR"].map(label => (
                <Button
                  key={label}
                  variant={selectedLabels.includes(label) ? "default" : "outline"}
                  size="sm"
                  className={selectedLabels.includes(label)
                    ? label === "TBC" ? "bg-warning text-warning-foreground hover:bg-warning/90"
                      : label === "GR" ? "bg-success text-success-foreground hover:bg-success/90"
                        : "bg-info text-info-foreground hover:bg-info/90"
                    : ""}
                  onClick={() => handleLabelToggle(label)}
                >
                  {label}
                </Button>
              ))}
            </div>

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
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[140px]">ID Tracking</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[90px]">Tanggal</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[110px]">Pelapor</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[130px]">Lokasi</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[110px]">PIC Perusahaan</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[150px]">Ketidaksesuaian</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[150px]">Sub Ketidaksesuaian</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[170px]">Deskripsi</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[140px]">TBC</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[140px]">GR</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[140px]">PSPP</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[120px]">Human Annotation</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[70px]">Gambar</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 min-w-[90px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => {
                const tbc = getAIResult(report, "TBC");
                const gr = getAIResult(report, "GR");
                const pspp = getAIResult(report, "PSPP");
                const imgUrl = DUMMY_IMAGES[index % DUMMY_IMAGES.length];

                return (
                  <tr key={report.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    {/* ID */}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onViewDetail(report)}
                        className="text-xs font-medium text-primary hover:underline cursor-pointer"
                      >
                        {report.id}
                      </button>
                    </td>
                    {/* Tanggal */}
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{report.tanggal}</td>
                    {/* Pelapor */}
                    <td className="px-3 py-2 text-xs text-foreground">{report.pelapor}</td>
                    {/* Lokasi */}
                    <td className="px-3 py-2">
                      <p className="text-xs font-medium text-foreground">{report.lokasiKode}</p>
                      <p className="text-[11px] text-muted-foreground">{report.lokasi}</p>
                    </td>
                    {/* PIC */}
                    <td className="px-3 py-2 text-xs text-foreground">{report.picPerusahaan || "-"}</td>
                    {/* Ketidaksesuaian */}
                    <td className="px-3 py-2">
                      <p className="text-xs text-foreground truncate max-w-[140px]" title={report.ketidaksesuaian}>
                        {report.ketidaksesuaian || "-"}
                      </p>
                    </td>
                    {/* Sub Ketidaksesuaian */}
                    <td className="px-3 py-2">
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]" title={report.subKetidaksesuaian}>
                        {report.subKetidaksesuaian || "-"}
                      </p>
                    </td>
                    {/* Deskripsi */}
                    <td className="px-3 py-2">
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]" title={report.deskripsiTemuan}>
                        {report.deskripsiTemuan}
                      </p>
                    </td>
                    {/* TBC - show AI result */}
                    <td className="px-3 py-2">
                      <div className={`inline-flex flex-col gap-0.5 text-xs px-2 py-1 rounded border ${tbc.cls}`}>
                        <span className="font-medium flex items-center gap-1">
                          {tbc.icon} {tbc.active ? "TBC" : "Non-TBC"}
                        </span>
                        {tbc.active && (
                          <>
                            <span className="text-[10px] truncate max-w-[120px]" title={tbc.category}>{tbc.category}</span>
                            <span className="text-[10px] opacity-70">{tbc.confidence}%</span>
                          </>
                        )}
                      </div>
                    </td>
                    {/* GR - show AI result */}
                    <td className="px-3 py-2">
                      <div className={`inline-flex flex-col gap-0.5 text-xs px-2 py-1 rounded border ${gr.cls}`}>
                        <span className="font-medium flex items-center gap-1">
                          {gr.icon} {gr.active ? "GR" : "Non-GR"}
                        </span>
                        {gr.active && (
                          <>
                            <span className="text-[10px] truncate max-w-[120px]" title={gr.category}>{gr.category}</span>
                            <span className="text-[10px] opacity-70">{gr.confidence}%</span>
                          </>
                        )}
                      </div>
                    </td>
                    {/* PSPP - show AI result */}
                    <td className="px-3 py-2">
                      <div className={`inline-flex flex-col gap-0.5 text-xs px-2 py-1 rounded border ${pspp.cls}`}>
                        <span className="font-medium flex items-center gap-1">
                          {pspp.icon} {pspp.active ? "PSPP" : "Non-PSPP"}
                        </span>
                        {pspp.active && (
                          <>
                            <span className="text-[10px] truncate max-w-[120px]" title={pspp.category}>{pspp.category}</span>
                            <span className="text-[10px] opacity-70">{pspp.confidence}%</span>
                          </>
                        )}
                      </div>
                    </td>
                    {/* Human Annotation - action button */}
                    <td className="px-3 py-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs border-accent hover:bg-accent/10"
                            onClick={() => onViewDetail(report)}
                          >
                            <Pencil className="w-3 h-3" />
                            Annotate
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Buka annotation TBC, GR & PSPP</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    {/* Gambar - thumbnail with hover preview */}
                    <td className="px-3 py-2">
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            onClick={() => setPreviewImage({ url: imgUrl, title: report.id })}
                            className="w-10 h-10 rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer bg-muted"
                          >
                            <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent side="left" className="w-72 p-1">
                          <img src={imgUrl} alt="Preview" className="w-full h-auto rounded object-cover" />
                          <p className="text-[10px] text-muted-foreground text-center mt-1">{report.id} · Klik untuk fullscreen</p>
                        </HoverCardContent>
                      </HoverCard>
                    </td>
                    {/* Action - Evaluasi button */}
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => onViewDetail(report)}
                      >
                        <Eye className="w-3 h-3" />
                        Evaluasi
                      </Button>
                    </td>
                  </tr>
                );
              })}
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

        {/* Image Preview Dialog */}
        <ImagePreviewDialog
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
          imageUrl={previewImage?.url || ""}
          title={previewImage?.title}
        />
      </div>
    </TooltipProvider>
  );
};

export default EvaluatorTable;
