import { X, ZoomIn, ZoomOut, Image, Layers, Users, Car, TrafficCone, Building, Cloud, Sparkles, Hand, MousePointer2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  const [toolMode, setToolMode] = useState<"select" | "pan">("pan");
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (toolMode !== "pan") return;
    e.preventDefault();
    setIsPanning(true);
    setStartPan({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    });
  }, [toolMode, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || toolMode !== "pan") return;
    setPanPosition({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  }, [isPanning, toolMode, startPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset pan when zoom changes
  const handleResetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="w-[520px] h-full border-l border-border bg-card flex flex-col animate-slide-in-right"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">VLM Inspection</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image Viewer Section */}
      <div className="flex flex-col shrink-0">
        {/* Zoom & Tool Controls */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1">
            {/* Tool Mode Toggle */}
            <Button 
              variant={toolMode === "select" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setToolMode("select")}
              title="Select Tool"
            >
              <MousePointer2 className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={toolMode === "pan" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setToolMode("pan")}
              title="Pan Tool (Drag to move)"
            >
              <Hand className="w-3.5 h-3.5" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground w-10 text-center font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-[10px] px-2"
            onClick={handleResetView}
          >
            Reset
          </Button>
        </div>

        {/* Image */}
        <div 
          ref={containerRef}
          className={cn(
            "h-[220px] overflow-hidden bg-muted/50 relative",
            toolMode === "pan" ? "cursor-grab" : "cursor-default",
            isPanning && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
            }}
          >
            <img
              src={imageUrl}
              alt="VLM Inspection"
              className="max-w-full max-h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="flex-1 flex flex-col overflow-hidden border-t border-border">
        {/* AI Analysis Header */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">AI Analysis</h3>
            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
              Trace
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Skor kualitas dan ekstraksi metadata</p>
        </div>

        {/* Information Extraction Header */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h4 className="text-xs font-medium text-foreground">Information Extraction</h4>
            <p className="text-[10px] text-muted-foreground">Source: Extraction engine v1</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">View as</span>
            <Select value={viewMode} onValueChange={(v: "table" | "json") => setViewMode(v)}>
              <SelectTrigger className="h-6 w-16 text-[10px]">
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
            <Accordion type="single" collapsible className="px-2 py-1">
              {extractionData.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 px-2 rounded-lg hover:bg-muted/50 data-[state=open]:bg-primary/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <category.icon className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{category.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-1">
                    <div className="bg-muted/30 rounded-lg p-2 space-y-1.5">
                      {Object.entries(category.data).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
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
            <div className="p-3">
              <pre className="bg-muted/50 rounded-lg p-3 text-[10px] overflow-auto max-h-[300px] text-foreground">
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
  );
};

export default VLMInspectionPanel;