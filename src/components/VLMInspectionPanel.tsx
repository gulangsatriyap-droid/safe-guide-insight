import { X, ZoomIn, ZoomOut, Image, Layers, Users, Car, TrafficCone, Building, Cloud, Sparkles, Hand, Target, Eye, AlertTriangle, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface VLMExtractionCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  data: Record<string, string | number | boolean | string[]>;
}

interface VLMInspectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  extractionData?: VLMExtractionCategory[];
}

// Default extraction data for demo
const defaultExtractionData: VLMExtractionCategory[] = [
  {
    id: "image_properties",
    label: "Image Properties",
    icon: Image,
    iconColor: "text-primary bg-primary/10",
    data: {
      "Resolution": "1920x1080",
      "Format": "JPEG",
      "Quality Score": "92%",
    }
  },
  {
    id: "composition",
    label: "Composition",
    icon: Target,
    iconColor: "text-emerald-600 bg-emerald-500/10",
    data: {
      "Scene Type": "Mining Site",
      "Time of Day": "Daytime",
      "Weather": "Clear",
    }
  },
  {
    id: "people_ppe",
    label: "People & PPE",
    icon: Users,
    iconColor: "text-amber-600 bg-amber-500/10",
    data: {
      "People Detected": 2,
      "Helmet": "Worn",
      "Safety Vest": "Worn",
    }
  },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: Car,
    iconColor: "text-blue-600 bg-blue-500/10",
    data: {
      "Detected": 1,
      "Type": "Dump Truck",
      "Status": "Stationary",
    }
  },
  {
    id: "traffic_control",
    label: "Traffic Control",
    icon: AlertTriangle,
    iconColor: "text-orange-600 bg-orange-500/10",
    data: {
      "Cones": 0,
      "Barriers": "None",
      "Signage": "Not Visible",
    }
  },
  {
    id: "access_infrastructure",
    label: "Access Infrastructure",
    icon: MapPin,
    iconColor: "text-purple-600 bg-purple-500/10",
    data: {
      "Road Type": "Unpaved",
      "Road Condition": "Fair",
    }
  },
  {
    id: "environment",
    label: "Environment",
    icon: Eye,
    iconColor: "text-sky-600 bg-sky-500/10",
    data: {
      "Terrain": "Flat",
      "Ground": "Dry",
      "Hazards": "None",
    }
  }
];

const VLMInspectionPanel = ({ 
  isOpen, 
  onClose, 
  imageUrl,
  extractionData = defaultExtractionData 
}: VLMInspectionPanelProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  if (!isOpen) return null;

  // Use dummy image if no valid URL
  const displayImage = imageUrl || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="fixed inset-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">VLM Inspection</span>
            </div>
            <span className="text-sm text-muted-foreground">AI Image Analysis & Extraction</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Image Left, Extraction Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left - Image Viewer (wider) */}
          <div className="flex-1 flex flex-col bg-muted/20 min-w-0">
            {/* Zoom & Pan Controls */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/80 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Image Preview</span>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Hand/Pan Tool */}
                <Button 
                  variant={isPanMode ? "default" : "outline"} 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setIsPanMode(!isPanMode)}
                  title="Pan Tool (drag to move image)"
                >
                  <Hand className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button variant="outline" size="sm" className="h-8 text-xs px-3" onClick={resetPosition}>
                  Reset
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div 
              className={cn(
                "flex-1 overflow-hidden flex items-center justify-center p-8",
                isPanMode ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              )}
              onMouseDown={(e) => {
                if (!isPanMode) return;
                setIsDragging(true);
                setDragStart({
                  x: e.clientX - position.x,
                  y: e.clientY - position.y
                });
              }}
              onMouseMove={(e) => {
                if (!isDragging || !isPanMode) return;
                setPosition({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
                });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div 
                className="relative transition-transform duration-100 ease-out select-none"
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                }}
              >
                <img
                  src={displayImage}
                  alt="VLM Inspection"
                  className="max-w-full max-h-[calc(100vh-220px)] object-contain rounded-lg shadow-xl border border-border/50"
                  draggable={false}
                />
              </div>
            </div>

            {/* Description Box */}
            <div className="px-5 pb-5 shrink-0">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-1">Deskripsi Temuan</h4>
                <p className="text-sm text-muted-foreground">
                  Operator HD tidak menggunakan safety vest saat keluar dari unit.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Extraction Results Panel */}
          <div className="w-[380px] border-l border-border flex flex-col bg-card shrink-0">
            {/* AI Analysis Header */}
            <div className="px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground text-lg">AI Analysis</h3>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Trace
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Skor kualitas dan ekstraksi metadata</p>
            </div>

            {/* Information Extraction Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
              <div>
                <h4 className="text-sm font-medium text-foreground">Information Extraction</h4>
                <p className="text-xs text-muted-foreground">Source: Extraction engine v1</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">View as</span>
                <select className="h-7 px-2 text-xs bg-card border border-border rounded text-foreground focus:outline-none">
                  <option value="table">Table</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            {/* Extraction Categories - Accordion Style */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {extractionData.map((category, index) => (
                  <Collapsible key={category.id} defaultOpen={index === 0}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.iconColor.split(' ')[1])}>
                          <category.icon className={cn("w-4 h-4", category.iconColor.split(' ')[0])} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{category.label}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-3 bg-muted/20 rounded-lg space-y-2">
                      {Object.entries(category.data).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className={cn(
                            "font-medium",
                            value === "Worn" || value === "Yes" ? "text-emerald-600" :
                            value === "Not Visible" || value === "None" ? "text-muted-foreground" :
                            "text-foreground"
                          )}>
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </span>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VLMInspectionPanel;
