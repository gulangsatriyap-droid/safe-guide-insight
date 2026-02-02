import { useState, useEffect } from "react";
import { X, FileText, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, AlertCircle, Sparkles, Target, Eye, Brain, XCircle, Braces, Copy, Download, ChevronDownSquare, ChevronUpSquare, Search, BookOpen, ZoomIn, ZoomOut, Maximize2, Highlighter, AlertTriangle, Image as ImageIcon, Video, FileType, Users, Car, MapPin, PenLine, Save, Hand, Lock, Shield, Clock, User, Timer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AIKnowledgeSource } from "@/data/hazardReports";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import HumanAnnotationPanel, { AnnotationData, EditLock, TBC_CATEGORIES } from "@/components/HumanAnnotationPanel";
import { useAutoConfirmCountdown, formatCountdown, getUrgencyLevel } from "@/hooks/useAutoConfirmCountdown";
interface RightAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiSources: AIKnowledgeSource[];
  activeLabels: ('TBC' | 'PSPP' | 'GR')[];
  initialTab?: 'TBC' | 'GR' | 'PSPP';
}

// Consistent label config - TBC blue, GR green, PSPP orange
const labelConfig = {
  TBC: { 
    bg: "bg-primary/10", 
    text: "text-primary",
    border: "border-primary/30",
    accent: "bg-gradient-to-r from-primary/5 to-primary/10",
    iconBg: "bg-primary/10",
    activeBg: "bg-primary",
    activeText: "text-primary-foreground",
    falseBadge: "bg-primary/10 text-primary border-primary/30"
  },
  GR: { 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-600",
    border: "border-emerald-500/30",
    accent: "bg-gradient-to-r from-emerald-500/5 to-emerald-500/10",
    iconBg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500",
    activeText: "text-white",
    falseBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
  },
  PSPP: { 
    bg: "bg-amber-500/10", 
    text: "text-amber-600",
    border: "border-amber-500/30",
    accent: "bg-gradient-to-r from-amber-500/5 to-amber-500/10",
    iconBg: "bg-amber-500/10",
    activeBg: "bg-amber-500",
    activeText: "text-white",
    falseBadge: "bg-amber-500/10 text-amber-600 border-amber-500/30"
  }
};

// TBC Candidates sample data - only showing Candidate 1 and Candidate 3
const tbcCandidates = [
  {
    id: 1,
    candidateLabel: "Candidate 1",
    title: "Deviasi pengoperasian kendaraan/unit",
    relevanceScore: 79,
    source: "Foto",
    deviationType: "Akses Area yang Tidak Aktif Belum Ditutup",
    isPrimary: false,
    aiReasoning: "Berdasarkan analisis visual, terdeteksi adanya pekerja yang mengakses area yang seharusnya tidak aktif namun belum ditutup dengan baramit atau signage yang memadai. Kondisi ini menunjukkan potensi risiko keselamatan karena pekerja dapat terpapar bahaya yang tidak terduga di area tersebut. Sinyal visual menunjukkan tidak adanya pembatas fisik yang jelas antara area aktif dan non-aktif.",
    observedFact: {
      extractedContent: {
        objects: ["Helm", "Sepatu safety", "Rompi"],
        actions: ["Berjalan tanpa APD", "Area tidak tertutup"],
        sceneContext: "Area workshop dengan aktivitas maintenance"
      },
      evidenceMatching: {
        imageTextConsistency: "Match",
        objectDeviationMapping: "Partial Match",
        confidenceNotes: "Objek APD terdeteksi tidak digunakan"
      }
    },
    assumptions: [
      "Aktivitas sebenarnya sebelum foto diambil tidak diketahui",
      "Tidak ada timestamp aktivitas kerja aktif",
      "Tidak terlihat supervisor di area"
    ],
    recommendations: [
      "Verifikasi status aktivitas kerja",
      "Konfirmasi area aktif atau non-aktif",
      "Validasi penggunaan APD sesuai SOP"
    ]
  },
  {
    id: 3,
    candidateLabel: "Candidate 3",
    title: "Deviasi pengoperasian kendaraan/unit",
    relevanceScore: 68,
    source: "Video",
    deviationType: "Housekeeping Tidak Sesuai Standar",
    isPrimary: false,
    aiReasoning: "Dari hasil ekstraksi visual, teridentifikasi kondisi area kerja yang tidak memenuhi standar housekeeping. Material dan peralatan ditemukan berserakan di jalur akses yang dapat menghambat evakuasi darurat. Kondisi ini menciptakan potensi trip hazard bagi pekerja yang melintas dan dapat memperlambat respons dalam situasi darurat.",
    observedFact: {
      extractedContent: {
        objects: ["Material", "Peralatan", "Jalur evakuasi"],
        actions: ["Penempatan material tidak teratur"],
        sceneContext: "Area kerja dengan kondisi tidak rapi"
      },
      evidenceMatching: {
        imageTextConsistency: "Match",
        objectDeviationMapping: "Partial Match",
        confidenceNotes: "Kondisi housekeeping perlu perbaikan"
      }
    },
    assumptions: [
      "Tidak diketahui jadwal pembersihan area",
      "Tidak ada informasi supervisor area"
    ],
    recommendations: [
      "Lakukan housekeeping segera",
      "Bersihkan jalur evakuasi"
    ]
  }
];

// Main TBC data (fixed, cannot be changed by user)
const mainTBCData = {
  title: "Deviasi pengoperasian kendaraan/unit",
  relevanceScore: 85,
  source: "Foto",
  deviationType: "Pekerjaan tidak sesuai DOP / tidak ada DOP",
  aiReasoning: "Berdasarkan hasil analisis visual dan ekstraksi konteks, sistem mengidentifikasi adanya deviasi dalam pengoperasian kendaraan atau unit. Operator terdeteksi tidak mengikuti standar operasional prosedur yang telah ditetapkan, dengan indikasi kuat bahwa pekerjaan yang dilakukan tidak memiliki Dokumen Operasional Prosedur (DOP) yang valid atau tidak sesuai dengan DOP yang ada. Hal ini menunjukkan potensi risiko keselamatan yang signifikan karena operator mungkin tidak mengetahui langkah-langkah keselamatan yang harus diikuti.",
  observedFact: {
    extractedContent: {
      objects: ["Hauler", "Tire", "Workshop Tyre"],
      actions: ["Equipment inspection", "Maintenance observation"],
      sceneContext: "Workshop area dengan aktivitas maintenance kendaraan"
    },
    evidenceMatching: {
      imageTextConsistency: "Match",
      objectDeviationMapping: "Match",
      confidenceNotes: "Deviasi prosedur teridentifikasi dengan jelas"
    }
  },
  assumptions: [
    "Tidak dapat memverifikasi keberadaan DOP di lokasi",
    "Tidak diketahui apakah operator sudah mendapat briefing",
    "Timestamp aktivitas tidak tersedia"
  ],
  recommendations: [
    "Verifikasi keberadaan dan kepatuhan terhadap DOP",
    "Lakukan briefing ulang kepada operator",
    "Dokumentasikan temuan untuk tindak lanjut"
  ]
};

// Main GR data (for FALSE state display)
const mainGRData = {
  title: "Pengoperasian Kendaraan & Unit",
  relevanceScore: 0,
  source: "Foto",
  deviationType: "Bekerja di ketinggian > 1.8 m tanpa full body harness",
  aiReasoning: "Tidak ditemukan indikasi pelanggaran Golden Rules dalam analisis visual. Pekerja terdeteksi menggunakan APD yang sesuai dan tidak ada aktivitas bekerja di ketinggian yang teridentifikasi tanpa pengaman yang memadai.",
  observedFact: {
    extractedContent: {
      objects: ["APD", "Helm", "Safety vest"],
      actions: ["Penggunaan APD sesuai standar"],
      sceneContext: "Area kerja dengan kondisi aman"
    },
    evidenceMatching: {
      imageTextConsistency: "Match",
      objectDeviationMapping: "No Deviation",
      confidenceNotes: "Tidak ditemukan pelanggaran Golden Rules"
    }
  },
  assumptions: [
    "Kondisi visual terbatas pada sudut pandang kamera",
    "Tidak diketahui kondisi di luar frame",
    "Aktivitas sebelum dan sesudah rekaman tidak diketahui"
  ],
  recommendations: [
    "Tetap monitor kepatuhan Golden Rules",
    "Lakukan pengecekan berkala"
  ]
};

// Main PSPP data (for FALSE state display)
const mainPSPPData = {
  title: "Pelanggaran Prosedur Keselamatan",
  relevanceScore: 0,
  source: "Foto",
  deviationType: "Hand rail tidak ada pada dudukan tandon profil",
  aiReasoning: "Berdasarkan ekstraksi visual, tidak ditemukan pelanggaran prosedur keselamatan yang signifikan. Kondisi area kerja dan peralatan sesuai dengan standar yang ditetapkan.",
  observedFact: {
    extractedContent: {
      objects: ["Hand rail", "Safety equipment", "Struktur platform"],
      actions: ["Penempatan peralatan sesuai standar"],
      sceneContext: "Area kerja dengan kondisi sesuai prosedur"
    },
    evidenceMatching: {
      imageTextConsistency: "Match",
      objectDeviationMapping: "No Deviation",
      confidenceNotes: "Tidak ditemukan pelanggaran PSPP"
    }
  },
  assumptions: [
    "Kondisi visual terbatas pada sudut pandang kamera",
    "Tidak diketahui kondisi infrastruktur tersembunyi",
    "Status pemeliharaan peralatan tidak diketahui"
  ],
  recommendations: [
    "Tetap lakukan inspeksi rutin PSPP",
    "Dokumentasikan kondisi saat ini"
  ]
};

// Helper to get main data by type
const getMainDataByType = (type: 'TBC' | 'GR' | 'PSPP') => {
  switch (type) {
    case 'TBC': return mainTBCData;
    case 'GR': return mainGRData;
    case 'PSPP': return mainPSPPData;
    default: return mainTBCData;
  }
};

const documentConfig = {
  TBC: {
    title: "TBC - To be Concern Hazard",
    subtitle: "Pengoperasian Kendaraan / Unit",
    fileName: "SOP-TBC-Guidelines-2024.pdf",
    code: "SOP-TBC-001",
    type: "SOP",
    totalPages: 22,
    pages: [
      {
        page: 1,
        title: "Daftar Isi",
        content: `STANDAR OPERASIONAL PROSEDUR
IDENTIFIKASI TO BE CONCERN (TBC) HAZARD

Dokumen No: SOP-TBC-001
Revisi: 03
Tanggal Efektif: 1 Januari 2024
Halaman: 1 dari 22

═══════════════════════════════════════════════════════════════

DAFTAR ISI

1. Pendahuluan ............................................................. 3
   1.1 Latar Belakang
   1.2 Tujuan
   1.3 Ruang Lingkup

2. Definisi dan Istilah .................................................. 5
   2.1 To Be Concern (TBC)
   2.2 Hazard Classification
   2.3 Risk Assessment

3. Prosedur Identifikasi TBC ......................................... 7
   3.1 Tahapan Identifikasi
   3.2 Kriteria TBC
   3.3 Metode Pelaporan

4. Kategori Deviasi ...................................................... 12
   4.1 Deviasi Pengoperasian Kendaraan
   4.2 Deviasi Prosedur Kerja
   4.3 Deviasi Penggunaan APD

5. Tindakan Korektif ..................................................... 18
   5.1 Prosedur Penanganan
   5.2 Eskalasi Temuan
   5.3 Dokumentasi

6. Lampiran .................................................................. 22`
      },
      {
        page: 2,
        title: "Pendahuluan",
        content: `BAB 1. PENDAHULUAN

═══════════════════════════════════════════════════════════════

1.1 LATAR BELAKANG

Dalam operasional pertambangan, identifikasi potensi bahaya (hazard) 
merupakan langkah kritis dalam memastikan keselamatan kerja. Sistem 
To Be Concern (TBC) dikembangkan sebagai mekanisme early warning 
untuk mendeteksi kondisi atau perilaku yang berpotensi menimbulkan 
kecelakaan kerja.

1.2 TUJUAN

Standar Operasional Prosedur ini bertujuan untuk:

  a) Memberikan panduan sistematis dalam mengidentifikasi kondisi 
     atau perilaku yang termasuk kategori TBC
  
  b) Menetapkan kriteria dan klasifikasi TBC berdasarkan tingkat 
     risiko dan potensi dampak
  
  c) Mendefinisikan prosedur pelaporan, dokumentasi, dan tindak 
     lanjut temuan TBC

1.3 RUANG LINGKUP

SOP ini berlaku untuk:
  • Seluruh area operasional tambang
  • Semua personel yang terlibat dalam operasi
  • Kontraktor dan subkontraktor
  • Visitor dengan izin kerja khusus`
      },
      {
        page: 3,
        title: "Kategori Deviasi",
        content: `BAB 4. KATEGORI DEVIASI PENGOPERASIAN KENDARAAN/UNIT

═══════════════════════════════════════════════════════════════

4.1 DEVIASI PENGOPERASIAN KENDARAAN

Kategori 1: Deviasi Pengoperasian Kendaraan/Unit

┌─────────────────────────────────────────────────────────────┐
│ DEFINISI                                                     │
├─────────────────────────────────────────────────────────────┤
│ Setiap temuan yang berkaitan dengan pengoperasian kendaraan │
│ atau unit yang tidak sesuai dengan standar operasional      │
│ prosedur yang telah ditetapkan.                             │
└─────────────────────────────────────────────────────────────┘

CONTOH DEVIASI:

  ▸ Fatigue (menguap, microsleep, mata tertutup)
  ▸ Menggunakan handphone saat mengoperasikan unit
  ▸ Tidak menggunakan sabuk pengaman
  ▸ Melebihi batas kecepatan yang ditetapkan
  ▸ Tidak mematuhi rambu lalu lintas area tambang
  ▸ Mengoperasikan unit tanpa sertifikasi valid

KLASIFIKASI RISIKO:
  
  ⚠️  TINGGI   : Potensi fatality atau cedera serius
  ⚡  SEDANG   : Potensi cedera ringan atau kerusakan unit
  ℹ️  RENDAH   : Pelanggaran prosedur minor`
      },
      {
        page: 4,
        title: "Prosedur Pelaporan",
        content: `BAB 5. PROSEDUR PELAPORAN TBC

═══════════════════════════════════════════════════════════════

5.1 ALUR PELAPORAN

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  TEMUAN     │ ──▶ │  VALIDASI   │ ──▶ │  ESKALASI   │
  │  LAPANGAN   │     │  SUPERVISOR │     │  MANAJEMEN  │
  └─────────────┘     └─────────────┘     └─────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │ INPUT DATA  │     │  ANALISIS   │     │  KEPUTUSAN  │
  │  SISTEM     │     │   RISIKO    │     │  TINDAKAN   │
  └─────────────┘     └─────────────┘     └─────────────┘

5.2 WAKTU PELAPORAN

  • Temuan TINGGI  : Segera (< 30 menit)
  • Temuan SEDANG  : < 4 jam
  • Temuan RENDAH  : < 24 jam (akhir shift)

5.3 INFORMASI WAJIB

  1. Tanggal dan waktu kejadian
  2. Lokasi spesifik (area, pit, workshop)
  3. Deskripsi kondisi/perilaku
  4. Foto/video pendukung
  5. Identitas pihak terlibat
  6. Rekomendasi awal`
      }
    ]
  },
  GR: {
    title: "GR - Golden Rules",
    subtitle: "Keselamatan Kerja",
    fileName: "Safety-Golden-Rules-2024.pdf",
    code: "REG-GR-001",
    type: "Regulasi",
    totalPages: 18,
    pages: [
      {
        page: 1,
        title: "Daftar Isi",
        content: `GOLDEN RULES KESELAMATAN KERJA
PANDUAN WAJIB SELURUH PERSONEL

Dokumen No: REG-GR-001
Revisi: 05
Tanggal Efektif: 1 Januari 2024
Halaman: 1 dari 18

═══════════════════════════════════════════════════════════════

DAFTAR ISI

1. Golden Rules Overview .............................................. 3
   1.1 Prinsip Dasar
   1.2 Komitmen Keselamatan
   1.3 Konsekuensi Pelanggaran

2. Rule #1: PPE Compliance ........................................... 5
   2.1 Jenis APD Wajib
   2.2 Standar Kualitas APD
   2.3 Pemeriksaan Harian

3. Rule #2: Vehicle Operation ....................................... 8
   3.1 Pre-Start Check
   3.2 Batas Kecepatan
   3.3 Sabuk Pengaman

4. Rule #3: Work at Height ........................................... 12
   4.1 Definisi Ketinggian
   4.2 Full Body Harness
   4.3 Anchor Point

5. Rule #4: Confined Space .......................................... 15

6. Lampiran ................................................................ 18`
      },
      {
        page: 2,
        title: "Golden Rules Overview",
        content: `BAB 1. GOLDEN RULES OVERVIEW

═══════════════════════════════════════════════════════════════

1.1 PRINSIP DASAR

Golden Rules adalah seperangkat aturan keselamatan yang WAJIB 
dipatuhi tanpa pengecualian oleh seluruh personel di area kerja.

┌─────────────────────────────────────────────────────────────┐
│                    "ZERO TOLERANCE POLICY"                   │
│                                                              │
│   Pelanggaran Golden Rules dapat mengakibatkan pemutusan    │
│   hubungan kerja tanpa peringatan sebelumnya.               │
└─────────────────────────────────────────────────────────────┘

1.2 DAFTAR GOLDEN RULES

  ★ RULE 1: Selalu gunakan APD sesuai standar
  ★ RULE 2: Patuhi prosedur pengoperasian kendaraan
  ★ RULE 3: Gunakan full body harness di ketinggian > 1.8m
  ★ RULE 4: Ikuti prosedur confined space entry
  ★ RULE 5: Lakukan LOTO sebelum maintenance
  ★ RULE 6: Tidak bekerja di bawah pengaruh alkohol/obat

1.3 KONSEKUENSI PELANGGARAN

  Level 1: Pembinaan dan dokumentasi
  Level 2: Surat Peringatan + training ulang
  Level 3: PEMUTUSAN HUBUNGAN KERJA`
      },
      {
        page: 3,
        title: "Vehicle Operation",
        content: `BAB 3. RULE #2: VEHICLE OPERATION

═══════════════════════════════════════════════════════════════

3.1 PRE-START CHECK (WAJIB)

Sebelum mengoperasikan kendaraan/unit, operator WAJIB:

  ☑ Memeriksa kondisi rem dan sistem pengereman
  ☑ Memeriksa tekanan dan kondisi ban
  ☑ Memeriksa level oli dan cairan pendingin
  ☑ Memeriksa fungsi lampu dan klakson
  ☑ Memeriksa sabuk pengaman dan cermin
  ☑ Mengisi checklist harian

3.2 BATAS KECEPATAN

  ┌────────────────────────┬─────────────────┐
  │ AREA                   │ BATAS KECEPATAN │
  ├────────────────────────┼─────────────────┤
  │ Workshop               │ 10 km/jam       │
  │ Area Loading          │ 15 km/jam       │
  │ Hauling Road (Empty)  │ 40 km/jam       │
  │ Hauling Road (Loaded) │ 30 km/jam       │
  │ Ramp                  │ 20 km/jam       │
  └────────────────────────┴─────────────────┘

3.3 SABUK PENGAMAN

  ⚠️ WAJIB menggunakan sabuk pengaman setiap saat
  ⚠️ Pastikan sabuk terpasang dengan benar
  ⚠️ Laporkan sabuk pengaman yang rusak/tidak berfungsi`
      },
      {
        page: 4,
        title: "Work at Height",
        content: `BAB 4. RULE #3: WORK AT HEIGHT

═══════════════════════════════════════════════════════════════

4.1 DEFINISI KETINGGIAN

Pekerjaan di ketinggian (Work at Height) adalah setiap pekerjaan 
yang dilakukan pada ketinggian ≥ 1.8 meter dari permukaan.

┌─────────────────────────────────────────────────────────────┐
│ KRITERIA WORK AT HEIGHT                                      │
├─────────────────────────────────────────────────────────────┤
│ • Bekerja di scaffolding                                    │
│ • Bekerja di atas atap                                      │
│ • Bekerja di tangga > 1.8m                                  │
│ • Bekerja di platform elevated                              │
│ • Bekerja di dekat lubang/bukaan                           │
└─────────────────────────────────────────────────────────────┘

4.2 FULL BODY HARNESS (MANDATORY)

  ✓ Gunakan full body harness yang tersertifikasi
  ✓ Pastikan harness dalam kondisi baik (tidak sobek/aus)
  ✓ Kaitkan lanyard ke anchor point yang kokoh
  ✓ Double lanyard untuk perpindahan posisi

4.3 ANCHOR POINT

  • Anchor point harus mampu menahan beban min. 22 kN
  • Gunakan anchor point yang sudah diverifikasi
  • DILARANG menggunakan pipa, kabel, atau struktur sementara`
      }
    ]
  },
  PSPP: {
    title: "PSPP - Peraturan Sanksi",
    subtitle: "Pelanggaran Prosedur",
    fileName: "PSPP-Regulasi-Keselamatan-2024.pdf",
    code: "INT-PSPP-001",
    type: "Internal",
    totalPages: 20,
    pages: [
      {
        page: 1,
        title: "Daftar Isi",
        content: `PERATURAN SANKSI PELANGGARAN PROSEDUR (PSPP)
PEDOMAN INTERNAL PERUSAHAAN

Dokumen No: INT-PSPP-001
Revisi: 04
Tanggal Efektif: 1 Januari 2024
Halaman: 1 dari 20

═══════════════════════════════════════════════════════════════

DAFTAR ISI

1. Pendahuluan ............................................................. 3
   1.1 Dasar Hukum
   1.2 Tujuan Peraturan
   1.3 Ruang Lingkup

2. Definisi Pelanggaran ................................................. 5
   2.1 Pelanggaran Ringan
   2.2 Pelanggaran Sedang
   2.3 Pelanggaran Berat

3. Kategori Sanksi ......................................................... 8
   3.1 Sanksi Administratif
   3.2 Sanksi Operasional
   3.3 Sanksi Pemutusan

4. Prosedur Penanganan .................................................. 14
   4.1 Investigasi
   4.2 Hearing
   4.3 Keputusan

5. Banding dan Review ................................................... 18

6. Lampiran ................................................................... 20`
      },
      {
        page: 2,
        title: "Kategori Pelanggaran",
        content: `BAB 2. DEFINISI PELANGGARAN

═══════════════════════════════════════════════════════════════

2.1 PELANGGARAN RINGAN

Pelanggaran yang tidak secara langsung membahayakan keselamatan 
namun menyimpang dari prosedur standar.

  CONTOH:
  • Tidak melengkapi dokumentasi/checklist
  • Keterlambatan pelaporan non-kritikal
  • Ketidaksesuaian minor terhadap SOP

  SANKSI: Teguran lisan, coaching, dokumentasi

2.2 PELANGGARAN SEDANG

Pelanggaran yang berpotensi menimbulkan risiko keselamatan 
atau kerugian operasional.

  CONTOH:
  • Tidak menggunakan APD di area wajib APD
  • Mengabaikan prosedur pre-start check
  • Bekerja tanpa izin kerja yang valid

  SANKSI: Surat Peringatan I/II, training ulang, suspension

2.3 PELANGGARAN BERAT

┌─────────────────────────────────────────────────────────────┐
│ ⚠️  PELANGGARAN YANG MENGAKIBATKAN ATAU BERPOTENSI          │
│     MENGAKIBATKAN FATALITY, CEDERA SERIUS, ATAU             │
│     KERUSAKAN BESAR                                         │
└─────────────────────────────────────────────────────────────┘

  CONTOH:
  • Pelanggaran Golden Rules
  • Bekerja di bawah pengaruh alkohol/narkoba
  • Pemalsuan dokumen keselamatan
  • Mengoperasikan unit tanpa sertifikasi

  SANKSI: PEMUTUSAN HUBUNGAN KERJA`
      },
      {
        page: 3,
        title: "Prosedur Penanganan",
        content: `BAB 4. PROSEDUR PENANGANAN PELANGGARAN

═══════════════════════════════════════════════════════════════

4.1 ALUR INVESTIGASI

  ┌─────────────────────────────────────────────────────────┐
  │ 1. LAPORAN MASUK                                        │
  │    ↓                                                    │
  │ 2. VERIFIKASI AWAL (24 jam)                            │
  │    ↓                                                    │
  │ 3. PENGUMPULAN BUKTI                                   │
  │    • Foto/Video                                        │
  │    • Witness statement                                 │
  │    • Dokumen pendukung                                 │
  │    ↓                                                    │
  │ 4. INTERVIEW TERLAPOR                                  │
  │    ↓                                                    │
  │ 5. ANALISIS & KESIMPULAN                              │
  │    ↓                                                    │
  │ 6. REKOMENDASI SANKSI                                  │
  └─────────────────────────────────────────────────────────┘

4.2 HEARING (SIDANG)

Untuk pelanggaran SEDANG dan BERAT, wajib dilakukan hearing:

  • Komposisi Panel: HR, Safety, Supervisor, Perwakilan Pekerja
  • Terlapor berhak didampingi
  • Durasi maksimal: 5 hari kerja dari laporan
  • Keputusan tertulis dalam 3 hari kerja

4.3 HAK BANDING

Terlapor berhak mengajukan banding dalam waktu 7 hari kerja 
setelah keputusan diterbitkan.`
      },
      {
        page: 4,
        title: "Matriks Sanksi",
        content: `BAB 3. MATRIKS KATEGORI SANKSI

═══════════════════════════════════════════════════════════════

TABEL MATRIKS SANKSI

┌─────────────────────┬──────────────┬──────────────┬──────────────┐
│ JENIS PELANGGARAN   │ PELANGGARAN  │ PELANGGARAN  │ PELANGGARAN  │
│                     │ PERTAMA      │ KEDUA        │ KETIGA       │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ RINGAN              │ Teguran      │ SP-1         │ SP-2         │
│                     │ Lisan        │              │              │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ SEDANG              │ SP-1         │ SP-2         │ SP-3/PHK     │
│                     │ + Training   │ + Suspension │              │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ BERAT               │ SP-3/PHK     │ PHK          │ PHK          │
│                     │              │              │              │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ GOLDEN RULES        │ PHK          │ -            │ -            │
│                     │ LANGSUNG     │              │              │
└─────────────────────┴──────────────┴──────────────┴──────────────┘

KETERANGAN:
  SP-1 : Surat Peringatan Pertama (berlaku 6 bulan)
  SP-2 : Surat Peringatan Kedua (berlaku 6 bulan)
  SP-3 : Surat Peringatan Ketiga (berlaku 6 bulan)
  PHK  : Pemutusan Hubungan Kerja

CATATAN PENTING:
  ⚠️ Pelanggaran Golden Rules = PHK langsung tanpa SP
  ⚠️ Masa berlaku SP tidak menghapus catatan historis`
      }
    ]
  }
};

const RightAnalysisPanel = ({ isOpen, onClose, aiSources, activeLabels, initialTab }: RightAnalysisPanelProps) => {
  const [activeTab, setActiveTab] = useState<'TBC' | 'GR' | 'PSPP'>(initialTab || 'TBC');
  const [drawerMode, setDrawerMode] = useState<'none' | 'dokumen' | 'ontologi' | 'tbc' | 'vlm' | 'annotation'>('none');
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [docCurrentPage, setDocCurrentPage] = useState(1);
  const [docZoom, setDocZoom] = useState(100);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [highlightRelevant, setHighlightRelevant] = useState(true);
  
  // Collapsible states
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [observedFactOpen, setObservedFactOpen] = useState(true);
  const [assumptionsOpen, setAssumptionsOpen] = useState(true);
  
  // VLM inspection state
  const [vlmZoom, setVlmZoom] = useState(1);
  const [vlmPanMode, setVlmPanMode] = useState(false);
  const [vlmDragging, setVlmDragging] = useState(false);
  const [vlmPosition, setVlmPosition] = useState({ x: 0, y: 0 });
  const [vlmDragStart, setVlmDragStart] = useState({ x: 0, y: 0 });
  
  // Annotation state - Enhanced for single-editor locking
  const [annotationData, setAnnotationData] = useState<AnnotationData | null>(null);
  const [editLock, setEditLock] = useState<EditLock | null>(null);
  
  // Simulated current user (in real app, this would come from auth context)
  const currentUser = {
    name: "Ahmad Evaluator",
    role: "Safety Evaluator"
  };
  
  // Auto-confirm countdown (only for AI-labeled items not yet annotated)
  const hasActiveLabels = activeLabels.length > 0;
  const autoConfirm = useAutoConfirmCountdown({
    initialSeconds: 90, // 1.5 minutes for demo
    shouldRun: hasActiveLabels && isOpen,
    isHumanAnnotated: annotationData?.isFinalized || false,
    onAutoConfirm: () => {
      toast.info("Klasifikasi AI telah dikonfirmasi secara otomatis.", {
        description: "Anotasi manual tidak lagi tersedia untuk laporan ini.",
      });
    }
  });
  
  // Derived state
  const isAnnotated = annotationData?.isFinalized || false;
  const isAutoConfirmed = autoConfirm.isAutoConfirmed;
  const urgency = getUrgencyLevel(autoConfirm.remainingSeconds, autoConfirm.totalSeconds);
  // Update active tab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Reset doc page when tab changes
  useEffect(() => {
    setDocCurrentPage(1);
  }, [activeTab]);

  // Sample ontology JSON data
  const ontologyData = {
    report_id: "TBC-VEH-004",
    classification: {
      tbc: {
        matched: activeLabels.includes('TBC'),
        category: "Deviasi pengoperasian kendaraan/unit",
        confidence: 0.95,
        deviation_type: "Pekerjaan tidak sesuai DOP / tidak ada DOP"
      },
      gr: {
        matched: activeLabels.includes('GR'),
        category: "Pengoperasian Kendaraan & Unit",
        confidence: 0.90,
        deviation_type: "Bekerja di ketinggian > 1.8 m tanpa full body harness"
      },
      pspp: {
        matched: activeLabels.includes('PSPP'),
        category: "Pelanggaran Prosedur Keselamatan",
        confidence: 0.88,
        deviation_type: "Hand rail tidak ada pada dudukan tandon profil"
      }
    },
    extracted_entities: {
      actors: ["Maintenance", "Inspector"],
      objects: ["Hauler", "Tire", "Workshop Tyre"],
      activities: ["Equipment inspection", "Maintenance observation"],
      work_context: "Work"
    },
    visual_analysis: {
      signals: ["Visual tyre damage", "Text unfit for operation"],
      image_quality: "Clear",
      visibility: "High"
    },
    timestamp: new Date().toISOString()
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(ontologyData, null, 2));
    toast.success("JSON disalin ke clipboard");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(ontologyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontology-${ontologyData.report_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON berhasil diunduh");
  };

  if (!isOpen) return null;

  const config = labelConfig[activeTab];
  const docConfig = documentConfig[activeTab];
  
  // Get current source or null if not active
  const currentSource = aiSources.find(s => s.type === activeTab);
  const isCurrentActive = activeLabels.includes(activeTab);

  // Get current candidate (primary or selected)
  const currentCandidate = selectedCandidate !== null 
    ? tbcCandidates.find(c => c.id === selectedCandidate) 
    : tbcCandidates.find(c => c.isPrimary);

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'foto':
        return <ImageIcon className="w-3.5 h-3.5" />;
      case 'video':
        return <Video className="w-3.5 h-3.5" />;
      case 'text':
        return <FileType className="w-3.5 h-3.5" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5" />;
    }
  };

  // Get current document page content
  const currentDocPage = docConfig.pages.find(p => p.page === docCurrentPage) || docConfig.pages[0];
  
  return (
    <TooltipProvider>
      {/* Container for both panels */}
      <div className="fixed top-0 right-0 bottom-0 flex z-50 animate-in slide-in-from-right duration-300">
        {/* Wide Document Preview Panel */}
        {drawerMode === 'dokumen' && (
          <div className="w-[55vw] max-w-[900px] min-w-[600px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  config.iconBg
                )}>
                  <FileText className={cn("w-5 h-5", config.text)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">Preview Dokumen</p>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold",
                      config.bg, config.text
                    )}>
                      {activeTab}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{docConfig.fileName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{docConfig.code}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium",
                      docConfig.type === 'SOP' ? "bg-primary/10 text-primary" :
                      docConfig.type === 'Regulasi' ? "bg-emerald-500/10 text-emerald-600" :
                      "bg-amber-500/10 text-amber-600"
                    )}>
                      {docConfig.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Buka Penuh</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unduh Dokumen</TooltipContent>
                </Tooltip>
                <button
                  onClick={() => setDrawerMode('none')}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* PDF-like Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={docCurrentPage <= 1}
                  onClick={() => setDocCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg">
                  <input
                    type="number"
                    value={docCurrentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= docConfig.totalPages) {
                        setDocCurrentPage(val);
                      }
                    }}
                    className="w-8 text-center text-sm font-medium bg-transparent focus:outline-none"
                    min={1}
                    max={docConfig.totalPages}
                  />
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="text-sm font-medium text-muted-foreground">{docConfig.totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={docCurrentPage >= docConfig.totalPages}
                  onClick={() => setDocCurrentPage(p => Math.min(docConfig.totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setDocZoom(z => Math.max(50, z - 10))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium text-muted-foreground w-12 text-center">{docZoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setDocZoom(z => Math.min(200, z + 10))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari dalam dokumen..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="h-8 w-48 pl-8 pr-3 text-xs border border-border rounded-lg bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={highlightRelevant ? "default" : "outline"}
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setHighlightRelevant(!highlightRelevant)}
                    >
                      <Highlighter className="w-3.5 h-3.5" />
                      <span className="text-xs">Highlight</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Highlight pasal relevan</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Document Content */}
            <ScrollArea className="flex-1">
              <div className="p-6" style={{ fontSize: `${docZoom}%` }}>
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 min-h-[80vh]">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800 leading-relaxed">
                    {currentDocPage.content}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Ontology JSON Panel */}
        {drawerMode === 'ontologi' && (
          <div className="w-[380px] bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Braces className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ontologi JSON</p>
                  <p className="text-[10px] text-muted-foreground">Raw classification data</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerMode('none')}
                className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs gap-1.5"
                    onClick={handleCopyJson}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs gap-1.5"
                    onClick={handleDownloadJson}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
                
                {/* Expand/Collapse Toggle */}
                <button 
                  onClick={() => setJsonExpanded(!jsonExpanded)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {jsonExpanded ? (
                    <>
                      <ChevronUpSquare className="w-3.5 h-3.5" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDownSquare className="w-3.5 h-3.5" />
                      Expand All
                    </>
                  )}
                </button>
                
                {/* JSON Code Viewer */}
                <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed">
                    <code className="text-slate-300">
                      {jsonExpanded ? (
                        JSON.stringify(ontologyData, null, 2).split('\n').map((line, i) => (
                          <div key={i} className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">{String(i + 1).padStart(3, ' ')}</span>
                            {line.includes(':') ? (
                              <>
                                <span className="text-cyan-400">{line.split(':')[0]}</span>
                                <span className="text-slate-400">:</span>
                                <span className={cn(
                                  line.includes('true') ? "text-emerald-400" :
                                  line.includes('false') ? "text-rose-400" :
                                  line.includes('"') ? "text-amber-300" :
                                  "text-purple-400"
                                )}>{line.split(':').slice(1).join(':')}</span>
                              </>
                            ) : (
                              <span className="text-slate-400">{line}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  1</span>
                            <span className="text-slate-400">{'{'}</span>
                          </div>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  2</span>
                            <span className="text-cyan-400">  "report_id"</span>
                            <span className="text-slate-400">: </span>
                            <span className="text-amber-300">"{ontologyData.report_id}"</span>
                            <span className="text-slate-400">,</span>
                          </div>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  3</span>
                            <span className="text-cyan-400">  "classification"</span>
                            <span className="text-slate-400">: </span>
                            <span className="text-slate-500">{'{ ... }'}</span>
                            <span className="text-slate-400">,</span>
                          </div>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  4</span>
                            <span className="text-cyan-400">  "extracted_entities"</span>
                            <span className="text-slate-400">: </span>
                            <span className="text-slate-500">{'{ ... }'}</span>
                            <span className="text-slate-400">,</span>
                          </div>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  5</span>
                            <span className="text-cyan-400">  "visual_analysis"</span>
                            <span className="text-slate-400">: </span>
                            <span className="text-slate-500">{'{ ... }'}</span>
                            <span className="text-slate-400">,</span>
                          </div>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  6</span>
                            <span className="text-cyan-400">  "timestamp"</span>
                            <span className="text-slate-400">: </span>
                            <span className="text-amber-300">"..."</span>
                          </div>
                          <div className="hover:bg-slate-800/50 px-1 -mx-1 rounded">
                            <span className="text-slate-600 select-none mr-4">  7</span>
                            <span className="text-slate-400">{'}'}</span>
                          </div>
                        </>
                      )}
                    </code>
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Main Analysis Panel */}
        <div className="w-[520px] min-w-[420px] bg-card border-l border-border shadow-lg flex flex-col">
          {/* SECTION 1: HEADER */}
          <div className="px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", config.activeBg)}>
                  <span className={cn("text-base font-bold", config.activeText)}>T</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">Detail Analisis</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{docConfig.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Context line */}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>{docConfig.subtitle}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {getSourceIcon(currentCandidate?.source || 'Foto')}
                <span>{currentCandidate?.source || 'Foto'}</span>
              </div>
            </div>

            {/* Status Chips (segmented) */}
            <div className="flex gap-2 mt-3">
              {(['TBC', 'GR', 'PSPP'] as const).map((type) => {
                const isActive = activeTab === type;
                const isLabelActive = activeLabels.includes(type);
                const typeConfig = labelConfig[type];
                
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveTab(type);
                      setSelectedCandidate(null);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      isActive 
                        ? `${typeConfig.activeBg} ${typeConfig.activeText}`
                        : isLabelActive
                          ? `${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border}`
                          : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {isLabelActive && isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {!isLabelActive && (
                      <X className="w-3 h-3" />
                    )}
                    {type}
                    {!isLabelActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-bold">FALSE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toolbar: Navigation buttons */}
          <div className="px-4 py-2 border-b border-border bg-muted/20">
            <div className="flex gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setDrawerMode(drawerMode === 'dokumen' ? 'none' : 'dokumen')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      drawerMode === 'dokumen' 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold">Aa</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{drawerMode === 'dokumen' ? 'Dokumen (open)' : 'Dokumen'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setDrawerMode(drawerMode === 'ontologi' ? 'none' : 'ontologi')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      drawerMode === 'ontologi' 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    <Braces className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{drawerMode === 'ontologi' ? 'Ontologi (open)' : 'Ontologi (JSON)'}</p>
                </TooltipContent>
              </Tooltip>

              {/* TBC Candidate Button */}
              {activeTab === 'TBC' && isCurrentActive && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDrawerMode(drawerMode === 'tbc' ? 'none' : 'tbc')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                        drawerMode === 'tbc' 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">TBC</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                        drawerMode === 'tbc' 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-primary text-primary-foreground"
                      )}>
                        {tbcCandidates.length}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{drawerMode === 'tbc' ? 'TBC Candidates (open)' : 'TBC Candidates'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Annotation Button - Enhanced status display with auto-confirm */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !isAutoConfirmed && setDrawerMode(drawerMode === 'annotation' ? 'none' : 'annotation')}
                    disabled={isAutoConfirmed}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      isAutoConfirmed
                        ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60"
                        : drawerMode === 'annotation' 
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                          : isAnnotated
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-card hover:bg-muted text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {isAutoConfirmed ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Auto-confirmed</span>
                      </>
                    ) : isAnnotated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-semibold">Finalized</span>
                        <Lock className="w-3 h-3 opacity-70" />
                      </>
                    ) : editLock?.isLocked ? (
                      <>
                        <PenLine className="w-4 h-4" />
                        <span className="font-medium">Editing...</span>
                      </>
                    ) : (
                      <>
                        <PenLine className="w-4 h-4" />
                        <span className="font-medium">Annotate</span>
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    {isAutoConfirmed 
                      ? "🔒 AI classification auto-confirmed. Human annotation no longer available."
                      : isAnnotated 
                        ? `✅ Annotated by ${annotationData?.annotatorName}` 
                        : editLock?.isLocked 
                          ? `✏️ Being edited by ${editLock.lockedBy}`
                          : 'Human Annotation'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-4 space-y-4">

              {/* AUTO-CONFIRM COUNTDOWN / STATUS - Show for AI-labeled items */}
              {hasActiveLabels && !isAnnotated && (
                <div className={cn(
                  "rounded-xl border overflow-hidden animate-in fade-in duration-300",
                  isAutoConfirmed 
                    ? "bg-muted/50 border-border"
                    : urgency === 'critical' 
                      ? "bg-destructive/5 border-destructive/30"
                      : urgency === 'warning' 
                        ? "bg-amber-500/5 border-amber-500/30"
                        : "bg-primary/5 border-primary/30"
                )}>
                  {isAutoConfirmed ? (
                    // Auto-confirmed state (locked by AI)
                    <div className="p-4">
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
                            Klasifikasi AI sudah final — anotasi manual tidak lagi tersedia
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Countdown running state
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          urgency === 'critical' ? "bg-destructive/10" :
                          urgency === 'warning' ? "bg-amber-500/10" : "bg-primary/10"
                        )}>
                          <Timer className={cn(
                            "w-5 h-5",
                            urgency === 'critical' ? "text-destructive" :
                            urgency === 'warning' ? "text-amber-500" : "text-primary"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-xs font-semibold",
                              urgency === 'critical' ? "text-destructive" :
                              urgency === 'warning' ? "text-amber-600" : "text-primary"
                            )}>
                              Auto-confirm dalam:
                            </span>
                            <span className={cn(
                              "text-xl font-bold tabular-nums",
                              urgency === 'critical' ? "text-destructive" :
                              urgency === 'warning' ? "text-amber-600" : "text-primary"
                            )}>
                              {formatCountdown(autoConfirm.remainingSeconds)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 rounded-full",
                            urgency === 'critical' ? "bg-destructive" :
                            urgency === 'warning' ? "bg-amber-500" : "bg-primary"
                          )}
                          style={{ width: `${autoConfirm.progress}%` }}
                        />
                      </div>
                      
                      {/* Warning text */}
                      {urgency === 'critical' && (
                        <p className="text-[10px] text-destructive mt-2.5 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Segera review! Setelah waktu habis, klasifikasi AI menjadi final.
                        </p>
                      )}
                      {urgency === 'warning' && (
                        <p className="text-[10px] text-amber-600 mt-2.5">
                          Review sekarang untuk melakukan anotasi manual.
                        </p>
                      )}
                      {urgency === 'normal' && (
                        <p className="text-[10px] text-muted-foreground mt-2.5">
                          Klik "Annotate" untuk review dan berikan klasifikasi manual.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 1: HUMAN ANNOTATION RESULT (if annotated) - Shows above AI */}
              {isAnnotated && annotationData && activeTab === 'TBC' && (
                <div className="rounded-xl border-2 border-emerald-500/50 overflow-hidden bg-emerald-500/5 animate-in fade-in duration-300">
                  {/* Human Annotation Header */}
                  <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700">Human Annotation</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">FINAL</span>
                          </div>
                          <p className="text-[10px] text-emerald-600">Keputusan akhir oleh manusia</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  
                  {/* Annotated TBC Info */}
                  <div className="p-4 space-y-3">
                    {/* TBC Category */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-700">
                          TBC (By Human)
                        </span>
                        <h4 className="text-sm font-semibold text-foreground mt-1">
                          {annotationData.annotatedTBC 
                            ? TBC_CATEGORIES.find(c => c.id.toString() === annotationData.annotatedTBC)?.name 
                            : "No TBC Assigned"}
                        </h4>
                      </div>
                    </div>

                    {/* Annotation Note */}
                    <div className="p-3 bg-card rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <PenLine className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wide">Catatan Anotasi</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed italic">
                        "{annotationData.annotationNote}"
                      </p>
                    </div>

                    {/* Annotator Info */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-emerald-500/20">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>{annotationData.annotatorName} ({annotationData.annotatorRole})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(annotationData.timestamp).toLocaleString('id-ID', {
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
              )}
              
              {/* SECTION 2: PRIMARY CARD - Shows AI suggestion (label changes if human annotated) */}
              {(() => {
                const currentMainData = getMainDataByType(activeTab);
                // If human annotated TBC, use human's choice for display
                const displayTitle = (isAnnotated && annotationData?.annotatedTBC && activeTab === 'TBC')
                  ? TBC_CATEGORIES.find(c => c.id.toString() === annotationData.annotatedTBC)?.name || currentMainData.title
                  : currentMainData.title;
                
                return (
                  <div className={cn(
                    "rounded-xl border overflow-hidden",
                    isAnnotated && activeTab === 'TBC' 
                      ? "border-muted opacity-60" 
                      : isCurrentActive ? config.border : "border-destructive/30"
                  )}>
                    {/* Card Header */}
                    <div className={cn(
                      "px-4 py-3",
                      isAnnotated && activeTab === 'TBC' 
                        ? "bg-muted/30" 
                        : isCurrentActive ? config.accent : "bg-destructive/5"
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            isAnnotated && activeTab === 'TBC'
                              ? "bg-muted"
                              : isCurrentActive ? config.iconBg : "bg-destructive/10"
                          )}>
                            {isAnnotated && activeTab === 'TBC' ? (
                              <Brain className="w-5 h-5 text-muted-foreground" />
                            ) : isCurrentActive ? (
                              <AlertTriangle className={cn("w-5 h-5", config.text)} />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-bold",
                                isAnnotated && activeTab === 'TBC'
                                  ? "bg-muted text-muted-foreground"
                                  : isCurrentActive ? `${config.bg} ${config.text}` : "bg-destructive/10 text-destructive"
                              )}>
                                {isAnnotated && activeTab === 'TBC' 
                                  ? "AI Suggestion (Superseded)" 
                                  : `${activeTab} ${isCurrentActive ? "Utama" : "FALSE"}`}
                              </span>
                            </div>
                            <h4 className={cn(
                              "text-sm font-semibold",
                              isAnnotated && activeTab === 'TBC'
                                ? "text-muted-foreground line-through"
                                : isCurrentActive ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {currentMainData.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Tipe: {currentMainData.deviationType}
                            </p>
                          </div>
                        </div>
                        {/* Relevance Score */}
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground block">Relevance Score</span>
                          <span className={cn(
                            "text-2xl font-bold",
                            isAnnotated && activeTab === 'TBC'
                              ? "text-muted-foreground"
                              : isCurrentActive ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {isCurrentActive ? currentMainData.relevanceScore : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 3: DEVIATION META - Compact */}
              {isCurrentActive && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {getSourceIcon(mainTBCData.source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">Tipe Deviasi :</span>
                      <span className="text-xs text-foreground">{mainTBCData.source}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Deskripsi dan foto konsisten, sinyal deviasi dan objek cocok dengan {activeTab}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 6: AI REASONING - Always show */}
              {(() => {
                const currentMainData = getMainDataByType(activeTab);
                return (
                  <div className={cn(
                    "rounded-xl border overflow-hidden",
                    isCurrentActive ? "border-amber-500/30" : "border-muted"
                  )}>
                    <div className={cn(
                      "px-4 py-3 border-b",
                      isCurrentActive ? "bg-amber-500/10 border-amber-500/20" : "bg-muted/30 border-border"
                    )}>
                      <div className="flex items-center gap-2">
                        <Brain className={cn(
                          "w-4 h-4",
                          isCurrentActive ? "text-amber-600" : "text-muted-foreground"
                        )} />
                        <h4 className="text-sm font-semibold text-foreground">ALASAN AI</h4>
                      </div>
                    </div>
                    <div className={cn(
                      "p-4",
                      isCurrentActive ? "bg-amber-50/50" : "bg-muted/10"
                    )}>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isCurrentActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {currentMainData.aiReasoning}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Quick navigation to active labels for FALSE state */}
              {!isCurrentActive && activeLabels.length > 0 && (
                <div className="p-3 bg-muted/20 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Lihat kategori yang terdeteksi:</p>
                  <div className="flex gap-2 flex-wrap">
                    {activeLabels.map(label => {
                      const lConfig = labelConfig[label];
                      return (
                        <Button
                          key={label}
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab(label)}
                          className={cn(
                            "gap-1.5 h-7 text-xs font-bold",
                            lConfig.bg, lConfig.text, `border ${lConfig.border}`
                          )}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 7: OBSERVED FACT (Collapsible) - Show for all types including FALSE */}
              {(
                <Collapsible open={observedFactOpen} onOpenChange={setObservedFactOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">Observed Fact</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      observedFactOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-3 space-y-4">
                    {/* Extracted Content - Card-based layout matching reference */}
                    <div className="p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Extracted Content</span>
                      </div>
                      
                      {/* 2x2 Grid Layout */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Actors */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Actors</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ontologyData.extracted_entities.actors.map((actor, idx) => (
                              <span key={idx} className="px-2 py-1 bg-card rounded-md text-xs font-medium text-foreground border border-border">
                                {actor}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Objects */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Objects</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ontologyData.extracted_entities.objects.map((obj, idx) => (
                              <span key={idx} className="px-2 py-1 bg-card rounded-md text-xs font-medium text-foreground border border-border">
                                {obj}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Activities */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Activities</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ontologyData.extracted_entities.activities.map((activity, idx) => (
                              <span key={idx} className="px-2 py-1 bg-card rounded-md text-xs font-medium text-foreground border border-border">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Work Context */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Work Context</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-1 bg-card rounded-md text-xs font-medium text-foreground border border-border">
                              {ontologyData.extracted_entities.work_context}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer Text */}
                    <p className="text-[10px] text-muted-foreground italic text-center">
                      This observation is generated from automated image analysis.
                    </p>

                    {/* View Image Source Button - Stand out CTA */}
                    <button
                      onClick={() => setDrawerMode(drawerMode === 'vlm' ? 'none' : 'vlm')}
                      className={cn(
                        "flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all group",
                        drawerMode === 'vlm'
                          ? "bg-primary text-primary-foreground border-primary shadow-lg"
                          : "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30 hover:border-primary hover:shadow-md hover:from-primary/10 hover:to-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center relative",
                          drawerMode === 'vlm' ? "bg-primary-foreground/20" : "bg-primary/10"
                        )}>
                          <ImageIcon className={cn(
                            "w-5 h-5 absolute",
                            drawerMode === 'vlm' ? "text-primary-foreground" : "text-primary"
                          )} />
                          <Sparkles className={cn(
                            "w-3 h-3 absolute -top-0.5 -right-0.5",
                            drawerMode === 'vlm' ? "text-primary-foreground" : "text-primary"
                          )} />
                        </div>
                        <div className="text-left">
                          <span className={cn(
                            "text-sm font-bold block",
                            drawerMode === 'vlm' ? "text-primary-foreground" : "text-foreground"
                          )}>View Image Source</span>
                          <span className={cn(
                            "text-[10px]",
                            drawerMode === 'vlm' ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>AI Visual Language Model Analysis</span>
                        </div>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:translate-x-0.5",
                        drawerMode === 'vlm' ? "bg-primary-foreground/20" : "bg-primary/10"
                      )}>
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform",
                          drawerMode === 'vlm' ? "text-primary-foreground rotate-180" : "text-primary"
                        )} />
                      </div>
                    </button>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* SECTION 8: ASSUMPTIONS & UNKNOWNS (Collapsible) - Show for all types including FALSE */}
              {(
                <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">Assumptions & Unknowns</span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      assumptionsOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2 p-3 bg-card rounded-lg border border-border">
                    <ul className="space-y-2">
                      {(currentCandidate?.assumptions || getMainDataByType(activeTab).assumptions || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}


            </div>
          </ScrollArea>
        </div>

        {/* TBC Candidate Extension Panel - LEFT of main */}
        {drawerMode === 'tbc' && (
          <div className="w-[360px] min-w-[320px] bg-card border-r border-border shadow-lg flex flex-col animate-in slide-in-from-left duration-200 order-first">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">TBC Candidates</h3>
                    <p className="text-[10px] text-muted-foreground">Pilih kandidat untuk detail</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDrawerMode('none');
                    setSelectedCandidate(null);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {/* Show both TBC candidates at once */}
                {tbcCandidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className={cn(
                      "rounded-xl border overflow-hidden transition-all",
                      selectedCandidate === candidate.id 
                        ? "border-primary/30 shadow-sm" 
                        : "border-border hover:border-primary/20"
                    )}
                  >
                    {/* Card Header - Always visible */}
                    <button
                      onClick={() => setSelectedCandidate(selectedCandidate === candidate.id ? null : candidate.id)}
                      className={cn(
                        "w-full flex items-start justify-between p-3 text-left transition-colors",
                        selectedCandidate === candidate.id ? "bg-primary/5" : "bg-card hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary">
                              {candidate.candidateLabel}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground">{candidate.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Tipe: {candidate.deviationType}
                          </p>
                        </div>
                      </div>
                      {/* Relevance Score */}
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] text-muted-foreground block">Relevance Score</span>
                        <span className={cn(
                          "text-xl font-bold",
                          candidate.relevanceScore >= 80 ? "text-emerald-600" :
                          candidate.relevanceScore >= 70 ? "text-amber-600" :
                          "text-muted-foreground"
                        )}>
                          {candidate.relevanceScore}
                        </span>
                      </div>
                    </button>

                    {/* Expandable AI Reasoning */}
                    {selectedCandidate === candidate.id && (
                      <div className="px-3 pb-3 bg-muted/10 animate-in fade-in duration-200">
                        <div className="rounded-lg border border-amber-500/30 overflow-hidden">
                          <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
                            <div className="flex items-center gap-1.5">
                              <Brain className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[10px] font-semibold text-foreground uppercase">Alasan AI</span>
                            </div>
                          </div>
                          <div className="p-3 bg-amber-50/50">
                            <p className="text-xs text-foreground leading-relaxed">
                              {candidate.aiReasoning}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* VLM Inspection Extension Panel - LEFT of main - WIDE layout like reference */}
        {drawerMode === 'vlm' && (
          <div className="flex-1 min-w-[700px] max-w-[900px] bg-card border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-200 order-first">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">VLM Inspection</span>
                </div>
                <span className="text-sm text-muted-foreground">AI Image Analysis & Extraction</span>
              </div>
              <button
                onClick={() => setDrawerMode('none')}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content - Image Left, Extraction Right */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left - Image Viewer */}
              <div className="flex-1 flex flex-col bg-muted/20 min-w-0">
                {/* Zoom & Pan Controls */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Image Preview</span>
                    <div className="h-3 w-px bg-border" />
                    <span className="text-xs text-muted-foreground">{Math.round(vlmZoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Hand/Pan Tool */}
                    <Button 
                      variant={vlmPanMode ? "default" : "outline"} 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => setVlmPanMode(!vlmPanMode)}
                      title="Pan Tool (drag to move image)"
                    >
                      <Hand className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setVlmZoom(prev => Math.max(prev - 0.25, 0.5))}>
                      <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setVlmZoom(prev => Math.min(prev + 0.25, 3))}>
                      <ZoomIn className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs px-2.5" 
                      onClick={() => { setVlmZoom(1); setVlmPosition({ x: 0, y: 0 }); }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Image Container with Pan/Drag */}
                <div 
                  className={cn(
                    "flex-1 overflow-hidden flex items-center justify-center p-6",
                    vlmPanMode ? (vlmDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                  )}
                  onMouseDown={(e) => {
                    if (!vlmPanMode) return;
                    setVlmDragging(true);
                    setVlmDragStart({ x: e.clientX - vlmPosition.x, y: e.clientY - vlmPosition.y });
                  }}
                  onMouseMove={(e) => {
                    if (!vlmDragging || !vlmPanMode) return;
                    setVlmPosition({ x: e.clientX - vlmDragStart.x, y: e.clientY - vlmDragStart.y });
                  }}
                  onMouseUp={() => setVlmDragging(false)}
                  onMouseLeave={() => setVlmDragging(false)}
                >
                  <div 
                    className="relative transition-transform duration-100 ease-out select-none"
                    style={{ 
                      transform: `scale(${vlmZoom}) translate(${vlmPosition.x / vlmZoom}px, ${vlmPosition.y / vlmZoom}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                      alt="VLM Inspection"
                      className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg shadow-xl border border-border/50"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Description Box */}
                <div className="px-4 pb-4 shrink-0">
                  <div className="bg-card border border-border rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-1">Deskripsi Temuan</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Operator HD tidak menggunakan safety vest saat keluar dari unit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Extraction Results Panel */}
              <div className="w-[340px] border-l border-border flex flex-col bg-card shrink-0">
                {/* AI Analysis Header */}
                <div className="px-4 py-3 border-b border-border shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">AI Analysis</h3>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Trace
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Skor kualitas dan ekstraksi metadata</p>
                </div>

                {/* Information Extraction Header */}
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                  <div>
                    <h4 className="text-xs font-medium text-foreground">Information Extraction</h4>
                    <p className="text-[10px] text-muted-foreground">Source: Extraction engine v1</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">View as</span>
                    <select className="h-6 px-2 text-[10px] bg-card border border-border rounded text-foreground focus:outline-none">
                      <option value="table">Table</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>

                {/* Extraction Categories - Accordion Style */}
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {/* Image Properties */}
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Image Properties</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Resolution</span><span className="font-medium">1920x1080</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Format</span><span className="font-medium">JPEG</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Quality Score</span><span className="font-medium">92%</span></div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Composition */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
                            <Target className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Composition</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Scene Type</span><span className="font-medium">Mining Site</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Time of Day</span><span className="font-medium">Daytime</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Weather</span><span className="font-medium">Clear</span></div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* People & PPE */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <span className="text-xs font-medium text-foreground">People & PPE</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">People Detected</span><span className="font-medium">2</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Helmet</span><span className="font-medium text-emerald-600">Worn</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Safety Vest</span><span className="font-medium text-emerald-600">Worn</span></div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Vehicles */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center">
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Vehicles</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Detected</span><span className="font-medium">1</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Type</span><span className="font-medium">Dump Truck</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Status</span><span className="font-medium">Stationary</span></div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Traffic Control */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Traffic Control</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Cones</span><span className="font-medium">0</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Barriers</span><span className="font-medium">None</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Signage</span><span className="font-medium">Not Visible</span></div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Access Infrastructure */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-purple-500/10 flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Access Infrastructure</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Road Type</span><span className="font-medium">Unpaved</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Road Condition</span><span className="font-medium">Fair</span></div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Environment */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 bg-background rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-sky-500/10 flex items-center justify-center">
                            <Eye className="w-3.5 h-3.5 text-sky-600" />
                          </div>
                          <span className="text-xs font-medium text-foreground">Environment</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1.5 p-2.5 bg-muted/20 rounded-lg space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Terrain</span><span className="font-medium">Flat</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Ground</span><span className="font-medium">Dry</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Hazards</span><span className="font-medium">None</span></div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}

        {/* Human Annotation Panel - LEFT side like TBC Candidate */}
        {drawerMode === 'annotation' && !isAutoConfirmed && (
          <div className="w-[420px] min-w-[380px] bg-card border-r border-border shadow-lg flex flex-col animate-in slide-in-from-left duration-200 order-first">
            <HumanAnnotationPanel
              isOpen={true}
              onClose={() => setDrawerMode('none')}
              activeTab={activeTab}
              aiSuggestion={currentSource ? {
                category: currentSource.category,
                confidence: currentSource.confidence,
                reasoning: currentSource.reasoning
              } : undefined}
              currentAnnotation={annotationData}
              editLock={editLock}
              currentUser={currentUser}
              isAutoConfirmed={isAutoConfirmed}
              autoConfirmCountdown={{
                remainingSeconds: autoConfirm.remainingSeconds,
                totalSeconds: autoConfirm.totalSeconds,
                progress: autoConfirm.progress,
              }}
              onSaveAnnotation={(data) => {
                setAnnotationData(data);
                setEditLock(null);
                setDrawerMode('none');
              }}
              onStartEditing={() => {
                setEditLock({
                  isLocked: true,
                  lockedBy: currentUser.name,
                  lockedAt: new Date().toISOString()
                });
              }}
              onCancelEditing={() => {
                setEditLock(null);
              }}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RightAnalysisPanel;
