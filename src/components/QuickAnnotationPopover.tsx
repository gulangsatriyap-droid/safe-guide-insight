import { useState } from "react";
import { Brain, ChevronDown, AlertTriangle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  children: React.ReactNode;
  disabled?: boolean;
}

const QuickAnnotationPopover = ({
  label,
  isOpen,
  onOpenChange,
  onSave,
  aiSuggestion,
  children,
  disabled = false,
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

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="start" 
        side="right"
        sideOffset={8}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Quick Annotate: {label}
            </h4>
            <button
              onClick={handleCancel}
              className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* TBC Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              Select TBC Classification *
            </label>
            <p className="text-[10px] text-muted-foreground">
              Choose from all 14 TBC categories. AI suggestion is shown but not pre-selected.
            </p>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
              >
                <option value="">-- Select TBC Category --</option>
                {TBC_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.id}. {category.name}
                  </option>
                ))}
                <option value="none">No TBC applicable</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            
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
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide justification for your classification decision. This is required before saving."
              rows={3}
              className={cn(
                "w-full px-3 py-2 bg-card border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none",
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
      </PopoverContent>
    </Popover>
  );
};

export default QuickAnnotationPopover;
