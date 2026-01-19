import { X, ZoomIn, ZoomOut, Image, Layers, Users, Car, TrafficCone, Building, Cloud, Sparkles, Hand, Move } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface VLMExtractionCategory {
  id: string;
  label: string;
  icon: React.ElementType;
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
    data: {
      "Resolution": "1920x1080",
      "Format": "JPEG",
      "Quality Score": "92%",
      "Brightness": "Normal",
      "Contrast": "Good",
      "Sharpness": "Clear"
    }
  },
  {
    id: "composition",
    label: "Composition",
    icon: Layers,
    data: {
      "Scene Type": "Outdoor - Mining Site",
      "Time of Day": "Daytime",
      "Weather": "Clear",
      "Visibility": "Good",
      "Camera Angle": "Eye Level"
    }
  },
  {
    id: "people_ppe",
    label: "People & PPE",
    icon: Users,
    data: {
      "People Detected": 2,
      "Helmet Worn": "Yes",
      "Safety Vest": "Yes",
      "Safety Glasses": "Not Detected",
      "Gloves": "Not Visible",
      "Safety Boots": "Visible"
    }
  },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: Car,
    data: {
      "Vehicles Detected": 1,
      "Type": "Dump Truck",
      "Status": "Stationary",
      "Condition": "Operational",
      "Hazard Lights": "Off"
    }
  },
  {
    id: "traffic_control",
    label: "Traffic Control",
    icon: TrafficCone,
    data: {
      "Cones Detected": 0,
      "Barriers": "None",
      "Signage": "Not Visible",
      "Road Markings": "Visible"
    }
  },
  {
    id: "access_infrastructure",
    label: "Access Infrastructure",
    icon: Building,
    data: {
      "Road Type": "Unpaved",
      "Road Condition": "Fair",
      "Access Points": 1,
      "Structures": "None"
    }
  },
  {
    id: "environment",
    label: "Environment",
    icon: Cloud,
    data: {
      "Terrain": "Flat",
      "Ground Condition": "Dry",
      "Dust Level": "Low",
      "Hazards Detected": "None"
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
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isPanMode) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [isPanMode, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isPanMode) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, isPanMode, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="fixed inset-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
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
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/80">
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
              ref={imageContainerRef}
              className={`flex-1 overflow-hidden flex items-center justify-center p-8 ${
                isPanMode ? 'cursor-grab' : 'cursor-default'
              } ${isDragging ? 'cursor-grabbing' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                className="relative transition-transform duration-100 ease-out select-none"
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                }}
              >
                <img
                  src={imageUrl}
                  alt="VLM Inspection"
                  className="max-w-full max-h-[calc(100vh-180px)] object-contain rounded-lg shadow-xl border border-border/50"
                  draggable={false}
                />
              </div>
            </div>

            {/* Description Box */}
            <div className="px-5 pb-5">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-1">Deskripsi Temuan</h4>
                <p className="text-sm text-muted-foreground">
                  Operator HD tidak menggunakan safety vest saat keluar dari unit.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Extraction Results Panel */}
          <div className="w-[480px] border-l border-border flex flex-col bg-card shrink-0">
            {/* AI Analysis Header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground text-lg">AI Analysis</h3>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Trace
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Skor kualitas dan ekstraksi metadata</p>
            </div>

            {/* Information Extraction Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h4 className="text-sm font-medium text-foreground">Information Extraction</h4>
                <p className="text-xs text-muted-foreground">Source: Extraction engine v1</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">View as</span>
                <Select value={viewMode} onValueChange={(v: "table" | "json") => setViewMode(v)}>
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Extraction Categories */}
            <div className="flex-1 overflow-auto">
              {viewMode === "table" ? (
                <Accordion type="multiple" defaultValue={["image_properties"]} className="px-4 py-3">
                  {extractionData.map((category) => (
                    <AccordionItem key={category.id} value={category.id} className="border border-border rounded-lg mb-2 overflow-hidden bg-background">
                      <AccordionTrigger className="hover:no-underline py-3 px-4 hover:bg-muted/50 data-[state=open]:bg-primary/5 [&[data-state=open]>svg]:rotate-90">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <category.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{category.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2.5">
                          {Object.entries(category.data).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{key}</span>
                              <span className="font-medium text-foreground">
                                {Array.isArray(value) ? value.join(", ") : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="p-4">
                  <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-auto max-h-[calc(100vh-320px)] text-foreground border border-border">
                    {JSON.stringify(
                      extractionData.reduce((acc, cat) => ({
                        ...acc,
                        [cat.id]: cat.data
                      }), {}),
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VLMInspectionPanel;
