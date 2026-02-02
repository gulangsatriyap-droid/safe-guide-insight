import { useState, useEffect } from "react";
import { 
  X, PenLine, Save, CheckCircle2, Brain, Lock, AlertTriangle, 
  Clock, User, Shield, ChevronDown, AlertCircle, FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export interface AnnotationData {
  annotatedTBC: string | null;
  annotatorName: string;
  annotatorRole: string;
  annotationNote: string;
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
  /** Whether AI classification has been auto-confirmed (locks out human annotation) */
  isAutoConfirmed?: boolean;
  /** Countdown info for display */
  autoConfirmCountdown?: {
    remainingSeconds: number;
    totalSeconds: number;
    progress: number;
  };
}

const HumanAnnotationPanel = ({
  isOpen,
  onClose,
  activeTab,
  aiSuggestion,
  currentAnnotation,
  editLock,
  currentUser,
  onSaveAnnotation,
  onStartEditing,
  onCancelEditing,
  isAutoConfirmed = false,
  autoConfirmCountdown,
}: HumanAnnotationPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTBC, setSelectedTBC] = useState<string>("");
  const [annotationNote, setAnnotationNote] = useState("");

  // Check if current user is the one who locked
  const isLockedByCurrentUser = editLock?.isLocked && editLock.lockedBy === currentUser.name;
  const isLockedByOther = editLock?.isLocked && editLock.lockedBy !== currentUser.name;
  const isFinalized = currentAnnotation?.isFinalized || false;

  // Reset form when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setSelectedTBC("");
      setAnnotationNote("");
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
    setSelectedTBC("");
    setAnnotationNote("");
    onCancelEditing();
  };

  const handleSaveAnnotation = () => {
    if (!annotationNote.trim()) {
      toast.error("Catatan annotator wajib diisi");
      return;
    }

    const annotationData: AnnotationData = {
      annotatedTBC: selectedTBC || null,
      annotatorName: currentUser.name,
      annotatorRole: currentUser.role,
      annotationNote: annotationNote.trim(),
      timestamp: new Date().toISOString(),
      isFinalized: true,
    };

    onSaveAnnotation(annotationData);
    setIsEditing(false);
    toast.success("Annotation berhasil disimpan dan difinalisasi");
  };

  if (!isOpen) return null;

  // Simplified wrapper - parent handles positioning
  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <PenLine className="w-4 h-4 text-emerald-600" />
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
            {/* === Information Hierarchy === */}
            
            {/* 1. Observed Fact Reference */}
            <div className="p-3 bg-muted/20 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Observed from Image</span>
              </div>
              <p className="text-xs text-foreground">
                Data observasi telah diextract dari gambar secara otomatis. Lihat panel "Observed Fact" untuk detail.
              </p>
            </div>

            {/* 2. AI Suggestion (Non-authoritative) */}
            {aiSuggestion && (
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wide">AI Suggestion (Non-final)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-700 rounded font-medium">
                      {activeTab}
                    </span>
                    <span className="text-xs text-foreground">{aiSuggestion.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Confidence:</span>
                    <span className="text-[10px] font-medium text-foreground">{aiSuggestion.confidence}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    ⚠️ This is an AI suggestion only. Final classification must be made by human reviewer.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Human Annotation Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-foreground">Human Annotation (Final)</span>
              </div>

              {/* Edit Lock Banner */}
              {isLockedByOther && (
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-orange-700">
                      Currently being edited by {editLock?.lockedBy}
                    </p>
                    <p className="text-[10px] text-orange-600">
                      Only one reviewer can edit annotation at a time.
                    </p>
                  </div>
                </div>
              )}

              {/* Finalized State */}
              {isFinalized && currentAnnotation && (
                <div className="space-y-3">
                  {/* Final Annotation Record */}
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Human Annotation Record</span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Annotated TBC */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Annotated TBC</span>
                        <p className="text-sm font-medium text-foreground">
                          {currentAnnotation.annotatedTBC 
                            ? TBC_CATEGORIES.find(c => c.id.toString() === currentAnnotation.annotatedTBC)?.name || "Custom TBC"
                            : "No TBC assigned"}
                        </p>
                      </div>

                      {/* Annotated By */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Annotated by</span>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{currentAnnotation.annotatorName}</span>
                          <span className="text-xs text-muted-foreground">({currentAnnotation.annotatorRole})</span>
                        </div>
                      </div>

                      {/* Annotation Note */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Annotation Note</span>
                        <p className="text-xs text-foreground bg-background p-2 rounded-lg border border-border">
                          "{currentAnnotation.annotationNote}"
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Annotated on</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-foreground">
                            {new Date(currentAnnotation.timestamp).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Finalized Notice */}
                  <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      ✅ Annotation finalized – further edits are not allowed
                    </p>
                  </div>

                  {/* Disabled Edit Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Lock className="w-4 h-4" />
                        Edit Annotation
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Annotation has been finalized and cannot be modified</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Auto-Confirmed State (AI classification locked) */}
              {isAutoConfirmed && !isFinalized && (
                <div className="space-y-3">
                  {/* Auto-confirmed Banner */}
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

                  {/* Disabled Edit Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Lock className="w-4 h-4" />
                        Anotasi Tidak Tersedia
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Klasifikasi AI sudah dikonfirmasi secara otomatis</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Idle State (Not Annotated) */}
              {!isFinalized && !isEditing && !isAutoConfirmed && (
                <div className="space-y-3">
                  {/* Not Annotated Notice */}
                  <div className="p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Not yet annotated by human
                      </p>
                    </div>
                  </div>

                  {/* Edit Annotation Button */}
                  <Button 
                    onClick={handleStartEditing}
                    disabled={isLockedByOther}
                    className={cn(
                      "w-full gap-2",
                      isLockedByOther 
                        ? "bg-muted text-muted-foreground" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    )}
                  >
                    <PenLine className="w-4 h-4" />
                    Edit Annotation
                  </Button>
                </div>
              )}

              {/* Editing State */}
              {!isFinalized && isEditing && (
                <div className="space-y-4">
                  {/* Editing Lock Banner */}
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-primary">
                        ✏️ Currently being edited by {currentUser.name}
                      </p>
                      <p className="text-[10px] text-primary/70">
                        Other users see this in read-only mode
                      </p>
                    </div>
                  </div>

                  {/* TBC Selection - Full 14 Categories */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground block">
                      Select TBC Classification *
                    </label>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Choose from all 14 TBC categories. AI suggestion is shown but not pre-selected.
                    </p>
                    <div className="relative">
                      <select
                        value={selectedTBC}
                        onChange={(e) => setSelectedTBC(e.target.value)}
                        className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                      >
                        <option value="">-- Select TBC Category --</option>
                        {TBC_CATEGORIES.map((category) => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.id}. {category.name}
                          </option>
                        ))}
                        <option value="none">No TBC applicable</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    
                    {/* AI Hint (subtle) */}
                    {aiSuggestion && (
                      <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-1">
                        <Brain className="w-3 h-3" />
                        AI suggested: {aiSuggestion.category} ({aiSuggestion.confidence}% confidence)
                      </p>
                    )}
                  </div>

                  {/* Annotation Note - Required */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground block">
                      Annotation Note * <span className="text-destructive">(Required)</span>
                    </label>
                    <textarea
                      value={annotationNote}
                      onChange={(e) => setAnnotationNote(e.target.value)}
                      placeholder="Provide justification for your classification decision. This is required before saving."
                      rows={4}
                      className={cn(
                        "w-full px-3 py-2.5 bg-card border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none",
                        !annotationNote.trim() ? "border-amber-500" : "border-border"
                      )}
                    />
                    {!annotationNote.trim() && (
                      <p className="text-[10px] text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Note is required to save annotation
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEditing}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveAnnotation}
                      disabled={!annotationNote.trim()}
                      className={cn(
                        "flex-1 gap-2",
                        annotationNote.trim() 
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Save className="w-4 h-4" />
                      Save Annotation
                    </Button>
                  </div>

                  {/* Warning */}
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-[10px] text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Saving will finalize the annotation. This action cannot be undone.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Audit Trail Info */}
            <div className="p-3 bg-muted/10 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Audit Trail</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                All annotations are timestamped, traceable, and immutable after save. 
                Every final classification has a clear human owner.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default HumanAnnotationPanel;
