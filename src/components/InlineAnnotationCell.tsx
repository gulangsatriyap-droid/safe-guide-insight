import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ketidaksesuaianData } from "@/data/ketidaksesuaianData";
import { toast } from "sonner";

interface InlineAnnotationData {
  ketidaksesuaian: string;
  subKetidaksesuaian: string;
  deskripsi: string;
}

interface InlineAnnotationCellProps {
  reportId: string;
  initialData: InlineAnnotationData;
  onSave: (reportId: string, data: InlineAnnotationData) => void;
}

const InlineAnnotationCell = ({ reportId, initialData, onSave }: InlineAnnotationCellProps) => {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<InlineAnnotationData>(initialData);
  const [subOptions, setSubOptions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.ketidaksesuaian) {
      const found = ketidaksesuaianData.find(k => k.ketidaksesuaian === data.ketidaksesuaian);
      setSubOptions(found?.sub_ketidaksesuaian || []);
    }
  }, [data.ketidaksesuaian]);

  const handleSave = () => {
    onSave(reportId, data);
    setEditing(false);
    toast.success("Annotation tersimpan");
  };

  const handleCancel = () => {
    setData(initialData);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="group relative min-w-[200px]">
        <div className="text-xs space-y-0.5">
          {data.ketidaksesuaian ? (
            <>
              <p className="font-medium text-foreground truncate max-w-[180px]" title={data.ketidaksesuaian}>
                {data.ketidaksesuaian}
              </p>
              <p className="text-muted-foreground truncate max-w-[180px]" title={data.subKetidaksesuaian}>
                {data.subKetidaksesuaian || "-"}
              </p>
              {data.deskripsi && (
                <p className="text-muted-foreground/70 truncate max-w-[180px]" title={data.deskripsi}>
                  {data.deskripsi}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground italic">Belum dianotasi</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-1 -top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setEditing(true)}
        >
          <Pencil className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-w-[260px] space-y-2 p-2 bg-muted/30 rounded-md border border-border">
      <Select
        value={data.ketidaksesuaian}
        onValueChange={(val) => setData(prev => ({ ...prev, ketidaksesuaian: val, subKetidaksesuaian: "" }))}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Ketidaksesuaian" />
        </SelectTrigger>
        <SelectContent>
          {ketidaksesuaianData.map(k => (
            <SelectItem key={k.ketidaksesuaian} value={k.ketidaksesuaian} className="text-xs">
              {k.ketidaksesuaian}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={data.subKetidaksesuaian}
        onValueChange={(val) => setData(prev => ({ ...prev, subKetidaksesuaian: val }))}
        disabled={subOptions.length === 0}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Sub Ketidaksesuaian" />
        </SelectTrigger>
        <SelectContent>
          {subOptions.map(s => (
            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        value={data.deskripsi}
        onChange={(e) => setData(prev => ({ ...prev, deskripsi: e.target.value }))}
        placeholder="Deskripsi temuan..."
        className="text-xs min-h-[48px] resize-none"
      />

      <div className="flex gap-1 justify-end">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
          <X className="w-3 h-3" />
        </Button>
        <Button variant="default" size="icon" className="h-6 w-6" onClick={handleSave}>
          <Check className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default InlineAnnotationCell;
