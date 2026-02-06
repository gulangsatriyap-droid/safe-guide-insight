import { useState, useEffect } from "react";
import { 
  X, PenLine, Save, CheckCircle2, Lock, AlertTriangle, 
  Clock, User, Shield
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// All 14 TBC Categories
export const TBC_CATEGORIES = [
  { id: 1, name: "Deviasi pengoperasian kendaraan/unit", description: "Pelanggaran prosedur pengoperasian kendaraan atau unit" },
  { id: 2, name: "Penggunaan APD tidak sesuai standar", description: "Tidak menggunakan atau menggunakan APD yang tidak sesuai" },
  { id: 3, name: "Housekeeping tidak sesuai standar", description: "Area kerja tidak rapi atau berbahaya" },
  { id: 4, name: "Akses area yang tidak aktif", description: "Memasuki area yang seharusnya ditutup atau tidak aktif" },
  { id: 5, name: "Pekerjaan tidak sesuai DOP", description: "Melakukan pekerjaan tanpa atau menyimpang dari DOP" },
  { id: 6, name: "Fatigue / Kelelahan operator", description: "Operator menunjukkan tanda-tanda kelelahan" },
  { id: 7, name: "Distraksi saat mengoperasikan unit", description: "Menggunakan handphone atau aktivitas lain saat operasi" },
  { id: 8, name: "Kecepatan melebihi batas", description: "Mengoperasikan kendaraan melebihi batas kecepatan area" },
  { id: 9, name: "Tidak menggunakan sabuk pengaman", description: "Operator tidak menggunakan seatbelt" },
  { id: 10, name: "Pelanggaran rambu lalu lintas", description: "Mengabaikan rambu atau tanda di area tambang" },
  { id: 11, name: "Posisi unit tidak stabil", description: "Penempatan unit atau peralatan dalam kondisi tidak aman" },
  { id: 12, name: "Bekerja di ketinggian tanpa harness", description: "Pekerjaan >1.8m tanpa full body harness" },
  { id: 13, name: "Pelanggaran prosedur confined space", description: "Tidak mengikuti prosedur confined space entry" },
  { id: 14, name: "Peralatan tidak layak operasi", description: "Menggunakan peralatan rusak atau tidak tersertifikasi" },
];

// GR (Golden Rules) Categories
export const GR_CATEGORIES = [
  { id: "gr1", name: "Isolasi Energi" },
  { id: "gr2", name: "Bekerja di Ketinggian" },
  { id: "gr3", name: "Ruang Terbatas" },
  { id: "gr4", name: "Pengangkatan & Rigging" },
  { id: "gr5", name: "Kendaraan & Alat Berat" },
  { id: "gr6", name: "Pekerjaan Panas" },
  { id: "invalid", name: "Bukan Pelanggaran GR" },
];

// PSPP Categories
export const PSPP_CATEGORIES = [
  { id: "pspp1", name: "Pelanggaran Prosedur Keselamatan" },
  { id: "pspp2", name: "Tidak Menggunakan APD" },
  { id: "pspp3", name: "Bekerja Tanpa Izin Kerja" },
  { id: "pspp4", name: "Mengabaikan Tanda Peringatan" },
  { id: "pspp5", name: "Pelanggaran Area Terlarang" },
  { id: "invalid", name: "Bukan Pelanggaran PSPP" },
];

export interface AnnotationData {
  tbc: { category: string; note: string };
  gr: { category: string; note: string };
  pspp: { category: string; note: string };
  annotatorName: string;
  annotatorRole: string;
  timestamp: string;
  isFinalized: boolean;
}

export interface EditLock {
  isLocked: boolean;
  lockedBy: string;
  lockedAt: string;
}

interface HumanAnnotationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'TBC' | 'GR' | 'PSPP';
  aiSuggestion?: {
    category: string;
    confidence: number;
    reasoning: string;
  };
  currentAnnotation?: AnnotationData | null;
  editLock?: EditLock | null;
  currentUser: {
    name: string;
    role: string;
  };
  onSaveAnnotation: (data: AnnotationData) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  isAutoConfirmed?: boolean;
  autoConfirmCountdown?: {
    remainingSeconds: number;
    totalSeconds: number;
    progress: number;
  };
}

const HumanAnnotationPanel = ({
  isOpen,
  onClose,
  currentAnnotation,
  editLock,
  currentUser,
  onSaveAnnotation,
  onStartEditing,
  onCancelEditing,
  isAutoConfirmed = false,
}: HumanAnnotationPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Unified state for all 3 types
  const [tbcCategory, setTbcCategory] = useState("");
  const [tbcNote, setTbcNote] = useState("");
  const [grCategory, setGrCategory] = useState("");
  const [grNote, setGrNote] = useState("");
  const [psppCategory, setPsppCategory] = useState("");
  const [psppNote, setPsppNote] = useState("");

  const isLockedByOther = editLock?.isLocked && editLock.lockedBy !== currentUser.name;
  const isFinalized = currentAnnotation?.isFinalized || false;

  // Reset form when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setTbcCategory("");
      setTbcNote("");
      setGrCategory("");
      setGrNote("");
      setPsppCategory("");
      setPsppNote("");
    }
  }, [isOpen]);

  const handleStartEditing = () => {
    if (isAutoConfirmed) {
      toast.error("Klasifikasi AI sudah dikonfirmasi secara otomatis. Anotasi tidak tersedia.");
      return;
    }
    if (isFinalized) {
      toast.error("Annotation sudah final dan tidak dapat diubah");
      return;
    }
    if (isLockedByOther) {
      toast.error(`Sedang diedit oleh ${editLock?.lockedBy}`);
      return;
    }
    setIsEditing(true);
    onStartEditing();
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setTbcCategory("");
    setTbcNote("");
    setGrCategory("");
    setGrNote("");
    setPsppCategory("");
    setPsppNote("");
    onCancelEditing();
  };

  const handleSaveAnnotation = () => {
    // At least one annotation should have a note
    if (!tbcNote.trim() && !grNote.trim() && !psppNote.trim()) {
      toast.error("Minimal satu catatan anotasi wajib diisi");
      return;
    }

    const annotationData: AnnotationData = {
      tbc: { category: tbcCategory || "none", note: tbcNote.trim() },
      gr: { category: grCategory || "none", note: grNote.trim() },
      pspp: { category: psppCategory || "none", note: psppNote.trim() },
      annotatorName: currentUser.name,
      annotatorRole: currentUser.role,
      timestamp: new Date().toISOString(),
      isFinalized: true,
    };

    onSaveAnnotation(annotationData);
    setIsEditing(false);
    toast.success("Annotation berhasil disimpan");
  };

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <PenLine className="w-4 h-4 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Human Annotation</h3>
                <p className="text-[10px] text-muted-foreground">Final classification decision</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Edit Lock Banner */}
            {isLockedByOther && (
              <div className="p-3 bg-warning/10 rounded-xl border border-warning/30 flex items-center gap-2">
                <Lock className="w-4 h-4 text-warning" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-warning">
                    Currently being edited by {editLock?.lockedBy}
                  </p>
                  <p className="text-[10px] text-warning/80">
                    Only one reviewer can edit annotation at a time.
                  </p>
                </div>
              </div>
            )}

            {/* Finalized State */}
            {isFinalized && currentAnnotation && (
              <div className="space-y-3">
                <div className="p-4 bg-success/10 rounded-xl border border-success/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-success">Annotation Finalized</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Annotated By */}
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{currentAnnotation.annotatorName}</span>
                      <span className="text-xs text-muted-foreground">({currentAnnotation.annotatorRole})</span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground">
                        {new Date(currentAnnotation.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    ✅ Annotation finalized – further edits are not allowed
                  </p>
                </div>
              </div>
            )}

            {/* Auto-Confirmed State */}
            {isAutoConfirmed && !isFinalized && (
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Auto-confirmed</span>
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Waktu review habis — klasifikasi AI menjadi final
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Idle State (Not Annotated) */}
            {!isFinalized && !isEditing && !isAutoConfirmed && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Not yet annotated by human
                  </p>
                </div>

                <Button 
                  onClick={handleStartEditing}
                  disabled={isLockedByOther}
                  className={cn(
                    "w-full gap-2",
                    isLockedByOther 
                      ? "bg-muted text-muted-foreground" 
                      : "bg-success hover:bg-success/90 text-success-foreground"
                  )}
                >
                  <PenLine className="w-4 h-4" />
                  Edit Annotation
                </Button>
              </div>
            )}

            {/* Editing State - Unified 3-section form */}
            {!isFinalized && isEditing && (
              <div className="space-y-4">
                {/* Editing Lock Banner */}
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-primary">
                      ✏️ Currently being edited by {currentUser.name}
                    </p>
                  </div>
                </div>

                {/* TBC Section */}
                <div className="space-y-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary text-primary-foreground">TBC</span>
                    <span className="text-xs text-muted-foreground">To Be Concern</span>
                  </div>
                  <Select value={tbcCategory} onValueChange={setTbcCategory}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Pilih kategori TBC" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {TBC_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs">
                          {cat.id}. {cat.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="none" className="text-xs text-muted-foreground">Tidak ada TBC</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={tbcNote}
                    onChange={(e) => setTbcNote(e.target.value)}
                    placeholder="Catatan TBC (opsional)"
                    rows={2}
                    className="w-full text-xs resize-none min-h-[40px]"
                  />
                </div>

                {/* GR Section */}
                <div className="space-y-2 p-3 rounded-xl bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success text-success-foreground">GR</span>
                    <span className="text-xs text-muted-foreground">Golden Rules</span>
                  </div>
                  <Select value={grCategory} onValueChange={setGrCategory}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Pilih kategori GR" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {GR_CATEGORIES.map((cat) => (
                        <SelectItem 
                          key={cat.id} 
                          value={cat.id} 
                          className={cn("text-xs", cat.id === "invalid" && "text-destructive")}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={grNote}
                    onChange={(e) => setGrNote(e.target.value)}
                    placeholder="Catatan GR (opsional)"
                    rows={2}
                    className="w-full text-xs resize-none min-h-[40px]"
                  />
                </div>

                {/* PSPP Section */}
                <div className="space-y-2 p-3 rounded-xl bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warning text-warning-foreground">PSPP</span>
                    <span className="text-xs text-muted-foreground">Pelanggaran</span>
                  </div>
                  <Select value={psppCategory} onValueChange={setPsppCategory}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Pilih kategori PSPP" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {PSPP_CATEGORIES.map((cat) => (
                        <SelectItem 
                          key={cat.id} 
                          value={cat.id} 
                          className={cn("text-xs", cat.id === "invalid" && "text-destructive")}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={psppNote}
                    onChange={(e) => setPsppNote(e.target.value)}
                    placeholder="Catatan PSPP (opsional)"
                    rows={2}
                    className="w-full text-xs resize-none min-h-[40px]"
                  />
                </div>

                {/* Validation hint */}
                {!tbcNote.trim() && !grNote.trim() && !psppNote.trim() && (
                  <p className="text-[10px] text-warning flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Minimal satu catatan anotasi wajib diisi
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEditing}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleSaveAnnotation}
                    disabled={!tbcNote.trim() && !grNote.trim() && !psppNote.trim()}
                    className={cn(
                      "flex-1 gap-2",
                      (tbcNote.trim() || grNote.trim() || psppNote.trim())
                        ? "bg-success hover:bg-success/90 text-success-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Save className="w-4 h-4" />
                    Simpan Semua
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default HumanAnnotationPanel;
