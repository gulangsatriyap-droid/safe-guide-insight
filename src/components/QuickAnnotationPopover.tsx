import { useState, useRef, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// TBC Categories
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

interface QuickAnnotationPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    tbc: { category: string; note: string };
    gr: { category: string; note: string };
    pspp: { category: string; note: string };
  }) => void;
  anchorRef?: React.RefObject<HTMLElement>;
  aiSuggestions?: {
    tbc?: { category: string; confidence: number };
    gr?: { category: string; confidence: number };
    pspp?: { category: string; confidence: number };
  };
}

const QuickAnnotationPopover = ({
  isOpen,
  onOpenChange,
  onSave,
  anchorRef,
}: QuickAnnotationPopoverProps) => {
  const [tbcCategory, setTbcCategory] = useState("");
  const [tbcNote, setTbcNote] = useState("");
  const [grCategory, setGrCategory] = useState("");
  const [grNote, setGrNote] = useState("");
  const [psppCategory, setPsppCategory] = useState("");
  const [psppNote, setPsppNote] = useState("");
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange, anchorRef]);

  const handleSave = () => {
    // At least one annotation should have a note
    if (!tbcNote.trim() && !grNote.trim() && !psppNote.trim()) {
      toast.error("Minimal satu catatan anotasi wajib diisi");
      return;
    }

    onSave({
      tbc: { category: tbcCategory || "none", note: tbcNote.trim() },
      gr: { category: grCategory || "none", note: grNote.trim() },
      pspp: { category: psppCategory || "none", note: psppNote.trim() },
    });

    // Reset form
    setTbcCategory("");
    setTbcNote("");
    setGrCategory("");
    setGrNote("");
    setPsppCategory("");
    setPsppNote("");
    onOpenChange(false);
    toast.success("Anotasi berhasil disimpan");
  };

  const handleCancel = () => {
    setTbcCategory("");
    setTbcNote("");
    setGrCategory("");
    setGrNote("");
    setPsppCategory("");
    setPsppNote("");
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className="absolute right-full top-0 mr-2 z-50 w-[340px] bg-popover border border-border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-right-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow connector pointing right */}
      <div className="absolute top-4 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-border" />
      <div className="absolute top-4 -right-[7px] w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[7px] border-l-popover" />
      
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between">
        <h4 className="text-sm font-semibold">Human Annotation</h4>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
        {/* TBC Section */}
        <div className="space-y-2 p-2 rounded-md bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary text-primary-foreground">TBC</span>
            <span className="text-xs text-muted-foreground">To Be Concern</span>
          </div>
          <Select value={tbcCategory} onValueChange={setTbcCategory}>
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="Pilih kategori TBC" />
            </SelectTrigger>
            <SelectContent className="max-h-[180px]">
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
            rows={1}
            className="w-full text-xs resize-none min-h-[32px]"
          />
        </div>

        {/* GR Section */}
        <div className="space-y-2 p-2 rounded-md bg-success/5 border border-success/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success text-success-foreground">GR</span>
            <span className="text-xs text-muted-foreground">Golden Rules</span>
          </div>
          <Select value={grCategory} onValueChange={setGrCategory}>
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="Pilih kategori GR" />
            </SelectTrigger>
            <SelectContent className="max-h-[180px]">
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
            rows={1}
            className="w-full text-xs resize-none min-h-[32px]"
          />
        </div>

        {/* PSPP Section */}
        <div className="space-y-2 p-2 rounded-md bg-warning/5 border border-warning/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warning text-warning-foreground">PSPP</span>
            <span className="text-xs text-muted-foreground">Pelanggaran</span>
          </div>
          <Select value={psppCategory} onValueChange={setPsppCategory}>
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="Pilih kategori PSPP" />
            </SelectTrigger>
            <SelectContent className="max-h-[180px]">
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
            rows={1}
            className="w-full text-xs resize-none min-h-[32px]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 p-3 pt-2 border-t border-border">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCancel}
          className="flex-1 text-xs h-8"
        >
          Batal
        </Button>
        <Button 
          size="sm"
          onClick={handleSave}
          className="flex-1 gap-1.5 text-xs h-8 bg-success hover:bg-success/90 text-success-foreground"
        >
          <Save className="w-3 h-3" />
          Simpan Semua
        </Button>
      </div>
    </div>
  );
};

export default QuickAnnotationPopover;
