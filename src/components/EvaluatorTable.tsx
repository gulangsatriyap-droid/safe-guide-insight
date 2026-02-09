import { useState } from "react";
import { FileText, Search, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HazardReport } from "@/data/hazardReports";
import InlineAnnotationCell from "@/components/InlineAnnotationCell";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";

interface EvaluatorTableProps {
  reports: HazardReport[];
  onViewDetail: (report: HazardReport) => void;
}

const getTBCStatus = (report: HazardReport) => {
  if (report.labels?.includes("TBC")) return { icon: "✔", text: "Sesuai", cls: "text-success bg-success/10" };
  return { icon: "✖", text: "Tidak", cls: "text-destructive bg-destructive/10" };
};

const getGRStatus = (report: HazardReport) => {
  if (report.labels?.includes("GR")) return { icon: "✔", text: "Sesuai", cls: "text-success bg-success/10" };
  return { icon: "✖", text: "Tidak", cls: "text-destructive bg-destructive/10" };
};

const getPSPPStatus = (report: HazardReport) => {
  if (report.labels?.includes("PSPP")) return { icon: "⚠", text: "Review", cls: "text-warning bg-warning/10" };
  return { icon: "✖", text: "Tidak", cls: "text-destructive bg-destructive/10" };
};

const EvaluatorTable = ({ reports, onViewDetail }: EvaluatorTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, { ketidaksesuaian: string; subKetidaksesuaian: string; deskripsi: string }>>({});

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

  const handleAnnotationSave = (reportId: string, data: { ketidaksesuaian: string; subKetidaksesuaian: string; deskripsi: string }) => {
    setAnnotations(prev => ({ ...prev, [reportId]: data }));
  };

  const columns = [
    { key: "id", label: "ID Tracking", width: "min-w-[140px]" },
    { key: "tanggal", label: "Tanggal", width: "min-w-[100px]" },
    { key: "pelapor", label: "Pelapor", width: "min-w-[120px]" },
    { key: "lokasi", label: "Lokasi", width: "min-w-[140px]" },
    { key: "pic", label: "PIC Perusahaan", width: "min-w-[120px]" },
    { key: "ketidaksesuaian", label: "Ketidaksesuaian", width: "min-w-[160px]" },
    { key: "sub", label: "Sub Ketidaksesuaian", width: "min-w-[160px]" },
    { key: "deskripsi", label: "Deskripsi", width: "min-w-[180px]" },
    { key: "tbc", label: "TBC", width: "min-w-[80px]" },
    { key: "gr", label: "GR", width: "min-w-[80px]" },
    { key: "pspp", label: "PSPP", width: "min-w-[80px]" },
    { key: "annotation", label: "Human Annotation", width: "min-w-[220px]" },
    { key: "gambar", label: "Gambar", width: "min-w-[80px]" },
  ];

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
              {columns.map(col => (
                <th key={col.key} className={`text-left text-xs font-medium text-muted-foreground px-3 py-3 ${col.width}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => {
              const tbc = getTBCStatus(report);
              const gr = getGRStatus(report);
              const pspp = getPSPPStatus(report);
              const annotation = annotations[report.id];

              return (
                <tr key={report.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  {/* ID */}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onViewDetail(report)}
                      className="text-sm font-medium text-primary hover:underline cursor-pointer"
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
                  {/* PIC Perusahaan */}
                  <td className="px-3 py-2 text-xs text-foreground">{report.picPerusahaan || "-"}</td>
                  {/* Ketidaksesuaian */}
                  <td className="px-3 py-2">
                    <p className="text-xs text-foreground truncate max-w-[150px]" title={report.ketidaksesuaian}>
                      {report.ketidaksesuaian || "-"}
                    </p>
                  </td>
                  {/* Sub Ketidaksesuaian */}
                  <td className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={report.subKetidaksesuaian}>
                      {report.subKetidaksesuaian || "-"}
                    </p>
                  </td>
                  {/* Deskripsi */}
                  <td className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate max-w-[170px]" title={report.deskripsiTemuan}>
                      {report.deskripsiTemuan}
                    </p>
                  </td>
                  {/* TBC */}
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${tbc.cls}`}>
                      {tbc.icon} {tbc.text}
                    </span>
                  </td>
                  {/* GR */}
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${gr.cls}`}>
                      {gr.icon} {gr.text}
                    </span>
                  </td>
                  {/* PSPP */}
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${pspp.cls}`}>
                      {pspp.icon} {pspp.text}
                    </span>
                  </td>
                  {/* Human Annotation */}
                  <td className="px-3 py-2">
                    <InlineAnnotationCell
                      reportId={report.id}
                      initialData={annotation || {
                        ketidaksesuaian: report.ketidaksesuaian || "",
                        subKetidaksesuaian: report.subKetidaksesuaian || "",
                        deskripsi: report.deskripsiTemuan || "",
                      }}
                      onSave={handleAnnotationSave}
                    />
                  </td>
                  {/* Gambar */}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setPreviewImage({ url: report.gambarUrl || "/placeholder.svg", title: report.id })}
                      className="w-10 h-10 rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer bg-muted flex items-center justify-center"
                    >
                      {report.gambarUrl ? (
                        <img src={report.gambarUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
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
  );
};

export default EvaluatorTable;
