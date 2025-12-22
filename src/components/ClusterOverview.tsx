import { useState } from "react";
import { Users, AlertTriangle, CheckCircle, HelpCircle, ChevronRight, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClusterInfo, hazardReports, HazardReport } from "@/data/hazardReports";
import ClusterPanel from "./ClusterPanel";

interface ClusterOverviewProps {
  clusters: ClusterInfo[];
  onSelectReport: (report: HazardReport) => void;
}

const getStatusColor = (status: ClusterInfo['status']) => {
  switch (status) {
    case 'Duplikat Kuat':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'Duplikat Mungkin':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Bukan Duplikat':
      return 'bg-success/10 text-success border-success/20';
  }
};

const getStatusIcon = (status: ClusterInfo['status']) => {
  switch (status) {
    case 'Duplikat Kuat':
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'Duplikat Mungkin':
      return <HelpCircle className="w-3.5 h-3.5" />;
    case 'Bukan Duplikat':
      return <CheckCircle className="w-3.5 h-3.5" />;
  }
};

const getLabelColor = (label: string): string => {
  switch (label) {
    case "TBC":
      return "bg-warning/10 text-warning border-warning/20";
    case "PSPP":
      return "bg-info/10 text-info border-info/20";
    case "GR":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const ClusterOverview = ({ clusters, onSelectReport }: ClusterOverviewProps) => {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [viewingCluster, setViewingCluster] = useState<ClusterInfo | null>(null);

  const getClusterReports = (clusterId: string) => {
    return hazardReports.filter(r => r.cluster === clusterId);
  };

  const handleSelectReportFromPanel = (reportId: string) => {
    const report = hazardReports.find(r => r.id === reportId);
    if (report) {
      setViewingCluster(null);
      onSelectReport(report);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg card-shadow">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Cluster Analysis</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {clusters.length} cluster terdeteksi • {clusters.filter(c => c.status === 'Duplikat Kuat').length} duplikat kuat
          </p>
        </div>

        <div className="divide-y divide-border">
          {clusters.map((cluster) => {
            const clusterReports = getClusterReports(cluster.id);
            const isExpanded = expandedCluster === cluster.id;

            return (
              <div key={cluster.id} className="animate-fade-in">
                {/* Cluster Header */}
                <button
                  onClick={() => setExpandedCluster(isExpanded ? null : cluster.id)}
                  className="w-full p-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      cluster.status === 'Duplikat Kuat' ? 'bg-destructive/10' :
                      cluster.status === 'Duplikat Mungkin' ? 'bg-warning/10' : 'bg-success/10'
                    }`}>
                      {getStatusIcon(cluster.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{cluster.id}</span>
                        <Badge variant="outline" className={`${getStatusColor(cluster.status)} text-xs`}>
                          {cluster.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{cluster.name}</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{cluster.reportCount} laporan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                cluster.similarityScore >= 0.75 ? 'bg-destructive' :
                                cluster.similarityScore >= 0.5 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${cluster.similarityScore * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{(cluster.similarityScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-fade-in">
                    <div className="ml-11 space-y-2">
                      {clusterReports.length > 0 ? (
                        <>
                          {clusterReports.map((report) => (
                            <div 
                              key={report.id}
                              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-foreground">{report.id}</span>
                                  {report.labels?.map(label => (
                                    <span 
                                      key={label}
                                      className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getLabelColor(label)}`}
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{report.deskripsiTemuan}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">{report.tanggal}</span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">{report.pelapor}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onSelectReport(report)}
                                className="gap-1 text-primary"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Lihat
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => setViewingCluster(cluster)}
                          >
                            Lihat Detail Cluster
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          Tidak ada laporan dalam sistem yang terhubung ke cluster ini
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cluster Detail Panel */}
      {viewingCluster && (
        <ClusterPanel 
          cluster={viewingCluster}
          onClose={() => setViewingCluster(null)}
          onSelectReport={handleSelectReportFromPanel}
        />
      )}
    </>
  );
};

export default ClusterOverview;
