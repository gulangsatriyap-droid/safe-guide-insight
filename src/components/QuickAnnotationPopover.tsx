import { useState } from "react";
import { Brain, ChevronDown, AlertTriangle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// TBC Categories from HumanAnnotationPanel
export const TBC_CATEGORIES = [
  { id: 1, name: "Deviasi pengoperasian kendaraan/unit" },
  { id: 2, name: "Penggunaan APD tidak sesuai standar" },
  { id: 3, name: "Housekeeping tidak sesuai standar" },
  { id: 4, name: "Akses area yang tidak aktif" },
  { id: 5, name: "Pekerjaan tidak sesuai DOP" },
  { id: 6, name: "Fatigue / Kelelahan operator" },
  { id: 7, name: "Distraksi saat mengoperasikan unit" },
  { id: 8, name: "Kecepatan melebihi batas" },
  { id: 9, name: "Tidak menggunakan sabuk pengaman" },
  { id: 10, name: "Pelanggaran rambu lalu lintas" },
  { id: 11, name: "Posisi unit tidak stabil" },
  { id: 12, name: "Bekerja di ketinggian tanpa harness" },
  { id: 13, name: "Pelanggaran prosedur confined space" },
  { id: 14, name: "Peralatan tidak layak operasi" },
];

interface QuickAnnotationPopoverProps {
  label: 'TBC' | 'GR' | 'PSPP';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    selectedCategory: string;
    note: string;
    label: 'TBC' | 'GR' | 'PSPP';
  }) => void;
  aiSuggestion?: {
    category: string;
    confidence: number;
  };
}

const QuickAnnotationPopover = ({
  label,
  isOpen,
  onOpenChange,
  onSave,
  aiSuggestion,
}: QuickAnnotationPopoverProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!note.trim()) {
      toast.error("Catatan annotator wajib diisi");
      return;
    }

    onSave({
      selectedCategory: selectedCategory || "none",
      note: note.trim(),
      label,
    });

    // Reset form
    setSelectedCategory("");
    setNote("");
    onOpenChange(false);
    toast.success(`Anotasi ${label} berhasil disimpan`);
  };

  const handleCancel = () => {
    setSelectedCategory("");
    setNote("");
    onOpenChange(false);
  };

  const getLabelColor = () => {
    switch (label) {
      case 'TBC': return 'text-primary';
      case 'GR': return 'text-emerald-600';
      case 'PSPP': return 'text-amber-600';
      default: return 'text-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <span>Quick Annotate:</span>
            <span className={cn("font-bold", getLabelColor())}>{label}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              Select TBC Classification *
            </label>
            <p className="text-[10px] text-muted-foreground">
              Choose from all 14 TBC categories. AI suggestion is shown but not pre-selected.
            </p>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue placeholder="-- Select TBC Category --" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {TBC_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()} className="text-xs">
                    {category.id}. {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="none" className="text-xs">No TBC applicable</SelectItem>
              </SelectContent>
            </Select>
            
            {/* AI Hint */}
            {aiSuggestion && (
              <p className="text-[10px] text-warning flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI suggested: {aiSuggestion.category} ({aiSuggestion.confidence}%)
              </p>
            )}
          </div>

          {/* Annotation Note */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              Annotation Note * <span className="text-destructive">(Required)</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide justification for your classification decision. This is required before saving."
              rows={3}
              className={cn(
                "w-full text-xs resize-none min-h-[80px]",
                !note.trim() ? "border-warning" : "border-border"
              )}
            />
            {!note.trim() && (
              <p className="text-[10px] text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Note is required to save annotation
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
              className="flex-1 text-xs h-8"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={!note.trim()}
              className={cn(
                "flex-1 gap-1.5 text-xs h-8",
                note.trim() 
                  ? "bg-success hover:bg-success/90 text-success-foreground" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Save className="w-3 h-3" />
              Save Annotation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAnnotationPopover;
