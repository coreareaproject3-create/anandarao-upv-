import React, { useState, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Info, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  Menu, 
  X, 
  LogOut, 
  Activity, 
  Plus, 
  Trash2, 
  Table as TableIcon, 
  Play,
  Zap,
  Thermometer
} from 'lucide-react';
import { cn } from './lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CorrectionMethod, CalculationResults, ConcreteCriteria, BatchReading } from './types';

const QUALITY_CRITERIA: ConcreteCriteria[] = [
  { velocity: '> 4.5', quality: 'Excellent' },
  { velocity: '3.5 – 4.5', quality: 'Good' },
  { velocity: '3.0 – 3.5', quality: 'Medium' },
  { velocity: '< 3.0', quality: 'Doubtful' },
];

const VS = 5.2; // Steel Velocity (km/s)

const ConcreteHatch = () => (
  <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-[0.35] text-slate-600">
    <defs>
      <pattern id="concrete-hatch" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        {/* Triangles (Aggregate) - High contrast technical grey */}
        <path d="M15 15 L30 22 L22 35 Z" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
        <path d="M60 45 L75 30 L90 52 Z" fill="#64748b" stroke="#1e293b" strokeWidth="0.8" />
        <path d="M110 15 L125 35 L105 28 Z" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
        <path d="M30 100 L45 125 L15 115 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.8" />
        <path d="M90 115 L112 100 L125 130 Z" fill="#64748b" stroke="#1e293b" strokeWidth="0.8" />
        <path d="M65 85 L80 105 L50 100 Z" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
        
        {/* Particles */}
        <circle cx="10" cy="65" r="1" fill="#1e293b" />
        <circle cx="35" cy="10" r="1" fill="#1e293b" />
        <circle cx="100" cy="55" r="1" fill="#1e293b" />
        <circle cx="140" cy="95" r="1" fill="#1e293b" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#concrete-hatch)" />
  </svg>
);

// Technical Visual Guide Component
const VisualGuide = ({ method }: { method: CorrectionMethod }) => {
  return (
    <div className="w-full bg-slate-900 border-2 border-dash-line p-4 rounded-none relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-dash-accent uppercase tracking-widest bg-white px-2 py-0.5">Reference Diagram</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-dash-accent" />
            <div className="w-1 h-1 bg-dash-accent/50" />
            <div className="w-1 h-1 bg-dash-accent/20" />
          </div>
        </div>
        
        <div className="aspect-video bg-white/5 border border-white/10 flex items-center justify-center p-2">
          <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-lg">
            {/* Common Background: Concrete Block */}
            <rect x="40" y="20" width="120" height="80" fill="#ffffff10" stroke="#ffffff30" strokeWidth="1" strokeDasharray="2 1" />
            
            {/* Transducers */}
            <rect x="28" y="52" width="12" height="16" fill="#3b82f6" rx="1" />
            <rect x="160" y="52" width="12" height="16" fill="#3b82f6" rx="1" />
            
            {/* Main Pulse Path */}
            <line x1="40" y1="60" x2="160" y2="60" stroke="#ffffff40" strokeWidth="1" strokeDasharray="4 2" />

            {method === 'no-correction' && (
              <g>
                <circle cx="100" cy="60" r="4" fill="#ef4444" opacity="0.5" />
                <path d="M 40 60 L 160 60" stroke="#22c55e" strokeWidth="2" strokeDasharray="100" strokeDashoffset="0" />
                <text x="100" y="110" fill="#ffffff60" fontSize="8" textAnchor="middle" fontWeight="bold">Direct Path (L)</text>
              </g>
            )}

            {method === 'perpendicular' && (
              <g>
                {/* Rebar Cross Section */}
                <circle cx="100" cy="60" r="6" fill="#94a3b8" stroke="#ffffff" strokeWidth="1" />
                <line x1="100" y1="54" x2="100" y2="66" stroke="#ffffff" strokeWidth="0.5" />
                <line x1="94" y1="60" x2="106" y2="60" stroke="#ffffff" strokeWidth="0.5" />
                
                {/* Path Animation */}
                <path d="M 40 60 L 94 60" stroke="#22c55e" strokeWidth="2" />
                <path d="M 106 60 L 160 60" stroke="#22c55e" strokeWidth="2" />
                
                {/* Dimensions */}
                <path d="M 40 15 L 160 15" stroke="#3b82f6" strokeWidth="0.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                <text x="100" y="10" fill="#3b82f6" fontSize="8" textAnchor="middle" fontWeight="bold">Path Length (L)</text>
                <text x="100" y="50" fill="#ffffff80" fontSize="7" textAnchor="middle">Length of Steel (Ls)</text>
              </g>
            )}

            {method === 'parallel' && (
              <g>
                {/* Parallel Rebar */}
                <rect x="40" y="75" width="120" height="4" fill="#94a3b8" rx="1" />
                
                {/* Pulse Deviation Path */}
                <path d="M 40 60 L 60 75 L 140 75 L 160 60" fill="none" stroke="#22c55e" strokeWidth="2" />
                
                {/* Offset Dimension */}
                <line x1="165" y1="60" x2="165" y2="75" stroke="#f59e0b" strokeWidth="1" />
                <text x="172" y="72" fill="#f59e0b" fontSize="8" fontWeight="bold">a</text>
                
                <text x="100" y="110" fill="#ffffff60" fontSize="8" textAnchor="middle">Rebar Offset from Center</text>
              </g>
            )}

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="mt-3 flex gap-2">
          <div className={cn("p-1 rounded-sm border border-white/10", method === 'parallel' ? 'bg-orange-500/20' : 'bg-white/5')}>
            <span className="text-[8px] font-mono text-white/50">{method === 'parallel' ? 'OFFSET: a' : 'VS: 5.2 km/s'}</span>
          </div>
          <div className={cn("p-1 rounded-sm border border-white/10", method === 'perpendicular' ? 'bg-blue-500/20' : 'bg-white/5')}>
            <span className="text-[8px] font-mono text-white/50">{method === 'perpendicular' ? 'CORRECTION: Ls' : 'L-PATH'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Technical Visual Components
const UPVWaveAnimation = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-40 px-6 py-12">
      {/* Transducer - TX (Left) */}
      <div className="order-2 md:order-1 flex flex-col items-center gap-3 shrink-0 transition-transform duration-500 hover:scale-105">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-dash-line flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(59,130,246,0.2)] group z-20">
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div className="absolute -right-3 w-5 h-10 bg-slate-800 border-y-4 border-r-4 border-dash-line rounded-r-md shadow-lg" />
          
          <div className="flex flex-col items-center text-center px-2">
            <span className="text-lg font-black text-white leading-none tracking-tighter mb-1">TX</span>
          </div>
          <div className="mt-1 w-8 h-1 bg-dash-accent/40 animate-pulse rounded-full" />
          
          <motion.div 
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-dash-accent/30"
          />
        </div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse shadow-[0_0_20px_rgba(59,130,246,1)]" />
      </div>

      {/* The Specimen (Concrete Cube) - Login Box Wrapper */}
      <div className="order-1 md:order-2 relative group perspective-1000 w-full max-w-md z-10">
        {/* Oscilloscope Waveform THROUGH Container - Pulse background */}
        <div className="absolute inset-x-[-150%] inset-y-0 z-[-1] overflow-hidden pointer-events-none flex justify-center items-center">
          <svg viewBox="0 0 1400 200" preserveAspectRatio="none" className="w-[1400px] h-full opacity-40 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
            <defs>
              <filter id="waveGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="pulseGradient">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>
            
            {/* Horizontal Baseline Glow */}
            <motion.line 
              x1="200" y1="100" x2="1200" y2="100" 
              stroke="#3b82f6" 
              strokeWidth="2"
              opacity="0.3"
            />
            
            {/* Traveling Discrete Pulse - Precise UPV Apparatus Ping */}
            <motion.path
              d="M 0 100 L 20 100 L 25 20 L 35 180 L 45 40 L 55 160 L 65 80 L 75 120 L 85 100 L 110 100"
              fill="none"
              stroke="#0284c7"
              strokeWidth="4"
              filter="url(#waveGlow)"
              animate={{ 
                x: [200, 1090],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear",
                times: [0, 0.05, 0.95, 1],
                repeatDelay: 0.8
              }}
            />

            {/* Traveling Pulse Highlight Glow */}
            <motion.circle
              r="100"
              fill="url(#pulseGradient)"
              animate={{ cx: [200, 1200] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 0.8
              }}
              style={{ filter: 'blur(25px)' }}
            />
          </svg>
        </div>
        
        {/* Background Overlay to ensure wave visibility on top of the concrete background */}
        <div className="absolute inset-0 z-0 bg-slate-900/10 pointer-events-none" />

        {/* Dynamic Highlight Sweep - Synchronized with Pulse */}
        <motion.div 
          className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ 
            duration: 0.8, // Duration within the box
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 1.5, // 0.8 + 1.5 = 2.3 total cycle
            delay: 0.4 // Sync with pulse entry
          }}
        />

        {children}
      </div>

      {/* Transducer - RX (Right) */}
      <div className="order-3 flex flex-col items-center gap-3 shrink-0 transition-transform duration-500 hover:scale-105">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-dash-line flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(34,197,94,0.2)] group z-20">
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div className="absolute -left-3 w-5 h-10 bg-slate-800 border-y-4 border-l-4 border-dash-line rounded-l-md shadow-lg" />
          
          <div className="flex flex-col items-center text-center px-2">
            <span className="text-lg font-black text-white leading-none tracking-tighter mb-1">RX</span>
          </div>
          <div className="mt-1 w-8 h-1 bg-green-500/40 rounded-full" />

          <motion.div 
            animate={{ scale: [0.8, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeIn", delay: 1 }}
            className="absolute inset-0 rounded-full border-2 border-green-500/30"
          />
        </div>
        <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)]" />
      </div>

      {/* Global Background Connection Line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-300 -translate-y-1/2 z-0 hidden md:block opacity-10" />
    </div>
  );
};

// WAVE SHIELD Logo Component
const WAVEShieldLogo = ({ className, size = 200 }: { className?: string; size?: number }) => (
  <svg width={size} viewBox="0 0 400 500" className={cn("h-auto shadow-2xl drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Shield Outline */}
    <path 
      d="M200 50 L350 120 V300 C350 400 200 450 200 450 C200 450 50 400 50 300 V120 L200 50Z" 
      stroke="#3b82f6" 
      strokeWidth="12" 
      strokeLinejoin="round" 
    />
    
    {/* Inner Shield (Double line effect) */}
    <path 
      d="M200 70 L330 130 V290 C330 380 200 430 200 430 C200 430 70 380 70 290 V130 L200 70Z" 
      stroke="#1e3a8a" 
      strokeWidth="2" 
      opacity="0.4"
    />

    {/* Inner Rebars (Vertical) */}
    <rect x="115" y="140" width="20" height="240" rx="4" fill="#94a3b8" />
    <rect x="190" y="100" width="20" height="320" rx="4" fill="#cbd5e1" />
    <rect x="265" y="140" width="20" height="240" rx="4" fill="#94a3b8" />

    {/* Horizontal Support Beams */}
    <rect x="75" y="215" width="250" height="20" rx="2" fill="#f8fafc" fillOpacity="0.9" />
    <rect x="75" y="255" width="250" height="20" rx="2" fill="#f8fafc" fillOpacity="0.9" />

    {/* Wave Pattern (The Pulse) */}
    <motion.path 
      d="M75 235 Q105 210 135 235 T195 235 T255 235 T315 235" 
      stroke="#3b82f6" 
      strokeWidth="8" 
      fill="none" 
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path 
      d="M75 235 Q105 260 135 235 T195 235 T255 235 T315 235" 
      stroke="#ef4444" 
      strokeWidth="5" 
      strokeDasharray="10 10" 
      fill="none" 
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Checkmark */}
    <motion.path 
      d="M160 360 L200 400 L280 300" 
      stroke="#3b82f6" 
      strokeWidth="16" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1 }}
    />
  </svg>
);

// Main App Component
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [method, setMethod] = useState<CorrectionMethod>('perpendicular');
  const [pathLength, setPathLength] = useState<number>(150);
  const [pulseTime, setPulseTime] = useState<number>(35);
  const [offsetDistance, setOffsetDistance] = useState<number>(40);
  const [barDiameter, setBarDiameter] = useState<number>(12);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Batch Mode States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchData, setBatchData] = useState<BatchReading[]>([]);
  const [currentRowLocation, setCurrentRowLocation] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  const results = useMemo((): CalculationResults => {
    return calculateReadingResults(method, pathLength, pulseTime, offsetDistance, barDiameter);
  }, [method, pathLength, pulseTime, offsetDistance, barDiameter]);

  function calculateReadingResults(
    m: CorrectionMethod, 
    L: number, 
    T: number, 
    a: number, 
    Ls: number
  ): CalculationResults {
    const measuredV = L / T; // mm/µs = km/s
    let correctedV = measuredV;
    let quality = '';
    let gamma: number | undefined;
    let kFactor: number | undefined;
    let influenceMsg: string | undefined;
    let influencePresent: boolean | undefined;

    if (m === 'perpendicular') {
      gamma = 4.606 / VS;
      kFactor = 1 - (Ls / L) * (1 - gamma);
      correctedV = measuredV * kFactor * 0.9;
    } else if (m === 'parallel') {
      const numerator = 2 * a * VS;
      const termInner = (T * VS) - L;
      const denominator = Math.sqrt(4 * (a ** 2) + Math.pow(termInner, 2));
      
      const initialCorrectedV = denominator !== 0 ? numerator / denominator : 0;
      
      const aRatio = a / L;
      const rhs = 0.5 * Math.sqrt((VS - initialCorrectedV) / (VS + initialCorrectedV));

      if (aRatio > rhs) {
        influenceMsg = "Influence of rebar correction is not needed";
        influencePresent = false;
        correctedV = measuredV;
      } else {
        influenceMsg = "Influence Present (Correction applied)";
        influencePresent = true;
        correctedV = 1.15 * initialCorrectedV;
      }
      gamma = initialCorrectedV / VS;
      kFactor = initialCorrectedV / measuredV;
    }

    if (correctedV > 4.5) quality = 'Excellent';
    else if (correctedV >= 3.5) quality = 'Good';
    else if (correctedV >= 3.0) quality = 'Medium';
    else quality = 'Doubtful';

    return { 
      measuredVelocity: measuredV, 
      correctedVelocity: correctedV, 
      quality,
      gamma,
      kFactor,
      influenceMsg,
      influencePresent
    };
  }

  const batchResults = useMemo(() => {
    return batchData.map(reading => ({
      ...reading,
      results: calculateReadingResults(
        reading.method, 
        reading.pathLength, 
        reading.pulseTime, 
        reading.offsetDistance || 0, 
        reading.barDiameter || 0
      )
    }));
  }, [batchData]);

  const batchStats = useMemo(() => {
    if (batchResults.length === 0) return null;
    const velocities = batchResults.map(r => r.results!.correctedVelocity);
    const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const stdDev = Math.sqrt(velocities.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / velocities.length);
    
    const qualityCounts = batchResults.reduce((acc, r) => {
      const q = r.results!.quality;
      acc[q] = (acc[q] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { mean, stdDev, qualityCounts };
  }, [batchResults]);

  const addToBatch = () => {
    const newEntry: BatchReading = {
      id: crypto.randomUUID(),
      location: currentRowLocation || `Reading ${batchData.length + 1}`,
      method,
      pathLength,
      pulseTime,
      offsetDistance: method === 'parallel' ? offsetDistance : undefined,
      barDiameter: method === 'perpendicular' ? barDiameter : undefined,
    };
    setBatchData([...batchData, newEntry]);
    setCurrentRowLocation('');
    showToast("Added to batch table");
  };

  const removeFromBatch = (id: string) => {
    setBatchData(batchData.filter(r => r.id !== id));
    showToast("Reading removed", "error");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();

    // Header Helper
    const drawHeader = (title: string) => {
      doc.setFillColor(0, 102, 204);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('THIAGARAJAR COLLEGE OF ENGINEERING', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Department of Civil Engineering - Madurai', 105, 22, { align: 'center' });
      doc.text(title, 105, 30, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    };

    if (isBatchMode && batchResults.length > 0) {
      drawHeader('Batch WAVE SHIELD Analysis Report');
      
      doc.setFontSize(10);
      doc.text(`Facility: Thiagarajar College of Engineering`, 20, 50);
      doc.text(`Department: Civil Engineering Laboratory`, 20, 55);
      
      if (user) {
        doc.text(`Lead Investigator: ${user.name}`, 120, 50);
        doc.text(`Email: ${user.email}`, 120, 55);
      }

      // Statistical Summary Section
      if (batchStats) {
        doc.setFont('helvetica', 'bold');
        doc.text('1. Statistical Summary', 20, 70);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Measured Points: ${batchResults.length}`, 25, 78);
        doc.text(`Mean Corrected Velocity: ${batchStats.mean.toFixed(3)} km/s`, 25, 85);
        doc.text(`Standard Deviation: ${batchStats.stdDev.toFixed(4)}`, 25, 92);
      }

      // Qualitative Distribution Table
      if (batchStats) {
        autoTable(doc, {
          startY: 105,
          head: [['Quality Gradation', 'Measurement Count']],
          body: Object.entries(batchStats.qualityCounts),
          theme: 'grid',
          headStyles: { fillColor: [51, 65, 85] },
          styles: { fontSize: 9, halign: 'center' },
          margin: { left: 40, right: 40 }
        });
      }

      // Second Page for Detailed Data
      doc.addPage();
      drawHeader('WAVE SHIELD Comprehensive Results');
      
      // Batch Results Table
      autoTable(doc, {
        startY: 45,
        head: [['Ref', 'Member Location', 'Path L', 'Pulse T', 'Vc (km/s)', 'Grade']],
        body: batchResults.map((r, i) => [
          String(i + 1).padStart(2, '0'),
          r.location,
          `${r.pathLength}mm`,
          `${r.pulseTime}µs`,
          r.results!.correctedVelocity.toFixed(3),
          r.results!.quality
        ]),
        theme: 'striped',
        margin: { top: 45 },
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8, halign: 'center' },
        columnStyles: {
            1: { halign: 'left' }
        }
      });

    } else {
      drawHeader('WAVE SHIELD Correction Report');

      doc.setFontSize(10);
      doc.text(`Date: ${dateStr}`, 20, 50);
      if (user) {
        doc.text(`Tester Name: ${user.name}`, 120, 50);
        doc.text(`Email: ${user.email}`, 120, 55);
      }

      // Section 1: Parameters
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 60, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('1. Test Parameters', 25, 65);

      doc.setFont('helvetica', 'normal');
      let yPos = 75;
      doc.text(`Path Length (L): ${pathLength} mm`, 25, yPos);
      yPos += 7;
      doc.text(`Pulse Time (T): ${pulseTime} µs`, 25, yPos);
      yPos += 7;
      doc.text(`Correction Type: ${method.charAt(0).toUpperCase() + method.slice(1)}`, 25, yPos);
      
      if (method === 'perpendicular') {
        yPos += 7;
        doc.text(`Length of Steel (Ls): ${barDiameter} mm`, 25, yPos);
      } else if (method === 'parallel') {
        yPos += 7;
        doc.text(`Offset Distance (a): ${offsetDistance} mm`, 25, yPos);
      }

      // Section 2: Results
      yPos += 15;
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('2. Calculation Results', 25, yPos);

      doc.setFont('helvetica', 'normal');
      yPos += 10;
      doc.text(`Measured Velocity: ${results.measuredVelocity.toFixed(3)} km/s`, 25, yPos);
      
      if (results.gamma !== undefined) {
        yPos += 7;
        doc.text(`Gamma (y): ${results.gamma.toFixed(4)}`, 25, yPos);
      }
      if (results.kFactor !== undefined) {
        yPos += 7;
        doc.text(`Correction Factor (k): ${results.kFactor.toFixed(4)}`, 25, yPos);
      }
      if (results.influenceMsg) {
        yPos += 7;
        doc.text(`Influence: ${results.influenceMsg}`, 25, yPos);
      }

      // Highlight Final Result
      yPos += 15;
      doc.setFillColor(255, 255, 153);
      doc.rect(20, yPos - 5, 170, 15, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`Corrected Velocity (Vc): ${results.correctedVelocity.toFixed(3)} km/s`, 25, yPos + 4);

      yPos += 20;
      doc.setFontSize(12);
      doc.text(`Concrete Quality: ${results.quality}`, 25, yPos);

      // Criteria Table
      yPos += 15;
      autoTable(doc, {
        startY: yPos,
        head: [['Velocity (km/sec)', 'Quality']],
        body: QUALITY_CRITERIA.map(q => [q.velocity, q.quality]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] }
      });
    }

    // Common Contact Information Section (Global at end of PDF)
    const finalTablePos = (doc as any).lastAutoTable?.finalY || 200;
    const footerY = finalTablePos + 15;
    
    if (footerY < 250) {
      doc.setFillColor(240, 240, 240);
      doc.rect(20, footerY, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Final Laboratory Verification', 25, footerY + 5);

      doc.setFont('helvetica', 'normal');
      let contactY = footerY + 15;
      doc.text('Institution: Thiagarajar College of Engineering (TCE)', 25, contactY);
      contactY += 6;
      doc.text('Department: Department of Civil Engineering', 25, contactY);
      contactY += 6;
      doc.text('Support Email: anandarao242004@gmail.com', 25, contactY);
    }

    // Global Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated laboratory report for internal research and educational purposes only.', 105, 285, { align: 'center' });

    doc.save(`WAVE_SHIELD_Report_${new Date().getTime()}.pdf`);
  };

  const getQualityBg = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'bg-dash-success';
      case 'Good': return 'bg-dash-info';
      case 'Medium': return 'bg-dash-warning';
      case 'Doubtful': return 'bg-dash-error';
      default: return 'bg-dash-accent';
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#1a2b38] flex flex-col items-center justify-center p-6 overflow-y-auto">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 1.5, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <WAVEShieldLogo size={220} />
          </motion.div>

          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="text-[52px] md:text-[64px] font-black italic tracking-tighter leading-none text-white drop-shadow-2xl flex flex-col"
            >
              <span>WAVE</span>
              <span className="text-blue-500 -mt-4">SHIELD</span>
            </motion.h1>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full mt-2"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="mt-4 text-blue-300 font-black uppercase tracking-[0.4em] text-xs italic"
            >
              True velocity . True strength
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.8 }}
            className="max-w-xl mx-auto text-center mb-10 px-8"
          >
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border-t-2 border-blue-500/50 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <p className="text-[14px] md:text-[16px] text-blue-100 font-medium leading-relaxed italic drop-shadow-sm">
                WaveShield corrects ultrasonic pulse velocity (UPV) readings affected by steel rebar in reinforced concrete, giving you accurate results without overestimation.
              </p>
            </div>
          </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.2, duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSplash(false)}
              className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/20 hover:border-blue-500 transition-colors shadow-2xl shrink-0"
            >
               <div className="absolute inset-2 rounded-full border border-blue-500/30 animate-ping opacity-50" />
               <Play size={28} className="text-white fill-white ml-1.5 transition-transform group-hover:scale-125 md:size-[32px]" />
            </motion.button>
          </div>

        {/* Floating tech elements */}
        <div className="absolute top-10 left-10 w-24 h-24 border border-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 border-4 border-blue-500/10 rounded-full animate-ping" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-dash-ink">

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto"
          >
            <UPVWaveAnimation>
              <div className="relative z-10 bg-[#cfd8dc] border-4 border-dash-line pt-8 px-8 pb-16 w-full max-w-md shadow-2xl login-concrete-cube group/cube">
                <ConcreteHatch />
                
                {/* Beam Reinforcement Cross Section (Decorative) */}
                <div className="absolute inset-6 pointer-events-none opacity-100">
                  {/* Stirrup/Link - Wrapped around the outside of rods */}
                  <div className="absolute inset-0 border-[6px] border-slate-900/70 rounded-md" />
                  
                  {/* Top Rods - Tucked into stirrup corners (Small Diameter) */}
                  <div className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-800 shadow-xl flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300/10" />
                  </div>
                  <div className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-800 shadow-xl flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300/10" />
                  </div>
                  
                  {/* Bottom Rods - Tucked into stirrup corners and mid-point (Large Diameter) */}
                  <div className="absolute bottom-1 left-1 w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 shadow-2xl flex items-center justify-center -translate-x-1 translate-y-1">
                    <div className="w-8 h-8 rounded-full border border-slate-400/20" />
                  </div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 shadow-2xl flex items-center justify-center translate-y-1">
                    <div className="w-8 h-8 rounded-full border border-slate-400/20" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 shadow-2xl flex items-center justify-center translate-x-1 translate-y-1">
                    <div className="w-8 h-8 rounded-full border border-slate-400/20" />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-6">
                    <WAVEShieldLogo size={80} className="mb-4 drop-shadow-md" />
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic text-center leading-none text-slate-800">
                      WAVE <br />
                      <span className="text-blue-600">SHIELD</span>
                    </h2>
                  </div>
                  
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (tempName && tempEmail) {
                          setUser({ name: tempName, email: tempEmail });
                        }
                      }}
                      className="space-y-6 w-full"
                    >
                      <div className="space-y-2">
                        <label className="input-label">Tester Name</label>
                        <input
                          required
                          disabled={isLoggingIn}
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Enter full name"
                          className="dash-input bg-white/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="input-label">Email Address</label>
                        <input
                          required
                          disabled={isLoggingIn}
                          type="email"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="dash-input bg-white/80"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full max-w-[260px] mx-auto py-3 bg-dash-accent text-white font-black uppercase tracking-widest text-[10px] border-4 border-dash-line flex items-center justify-center gap-2 hover:bg-blue-700 active:translate-y-1 transition-all disabled:opacity-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                      >
                        {isLoggingIn ? "Authenticating..." : (
                          <>
                            Launch Analysis <Play size={14} fill="white" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setShowSplash(true)}
                  className="text-[12px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-500 transition-colors flex items-center gap-2 px-6 py-3 bg-slate-900/40 border border-blue-900/40 rounded-full backdrop-blur-md shadow-2xl relative z-[110]"
                >
                  <X size={14} /> Exit to Menu
                </button>
              </div>
            </UPVWaveAnimation>
        </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 w-full"
          >
            {/* Sidebar Mobile Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden vertical-rl fixed top-4 right-4 z-50 p-2 bg-white rounded-none shadow-md border-2 border-dash-line"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={cn(
              "fixed inset-y-0 left-0 z-40 w-[300px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 transition-transform lg:relative lg:translate-x-0 overflow-y-auto shrink-0",
              sidebarOpen ? "translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.1)]" : "-translate-x-full"
            )}>
              {/* Sidebar Header Logo */}
              <div className="flex flex-col items-center py-4 border-b-4 border-double border-slate-100 mb-2">
                <WAVEShieldLogo size={100} className="mb-2" />
                <div className="text-center">
                  <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">
                    WAVE <span className="text-blue-600">SHIELD</span>
                  </h2>
                </div>
              </div>

              {/* Mode Toggle at extreme top */}
              <div className="flex bg-slate-100 p-1 rounded-none border border-slate-200">
                <button 
                  onClick={() => setIsBatchMode(false)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    !isBatchMode ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-800"
                  )}
                >
                  <Activity size={12} />
                  Single
                </button>
                <button 
                  onClick={() => setIsBatchMode(true)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    isBatchMode ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-800"
                  )}
                >
                  <TableIcon size={12} />
                  Batch
                </button>
              </div>

              <div className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Laboratory Status: Online</span>
                </div>
                <div className="border-l-[4px] border-blue-600 pl-4 py-1">
                  <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tighter leading-[1.1]">Thiagarajar College of Engineering</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Dept. of Civil Engineering</p>
                </div>
              </div>

              <div className="py-2 mb-2 border-b-2 border-dash-line border-dashed">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Authenticated Analyst</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-dash-bg border border-dash-line flex items-center justify-center text-white font-black text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[12px] font-black text-blue-700 truncate capitalize">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-700 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <VisualGuide method={method} />
                </div>

                <div className="space-y-2">
                  <label className="input-label">Correction Orientation</label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value as CorrectionMethod)}
                    className="dash-input cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%234b5563%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.5rem_center] pr-10"
                  >
                    <option value="no-correction">No Correction (Plain Concrete)</option>
                    <option value="parallel">Parallel to the rebar</option>
                    <option value="perpendicular">Perpendicular to the rebar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="input-label">Path Length (L)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={pathLength} 
                      onChange={(e) => setPathLength(Number(e.target.value))}
                      className="dash-input pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400">mm</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="input-label">Pulse Time (T)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={pulseTime} 
                      onChange={(e) => setPulseTime(Number(e.target.value))}
                      className="dash-input pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400">µs</span>
                  </div>
                </div>

                {(method === 'parallel' || method === 'perpendicular') && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5 pt-4 border-t-2 border-dash-line border-dashed flex flex-col"
                  >
                    {method === 'parallel' && (
                      <div className="space-y-2">
                        <label className="input-label">Offset Distance (a)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={offsetDistance} 
                            onChange={(e) => setOffsetDistance(Number(e.target.value))}
                            className="dash-input pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400">mm</span>
                        </div>
                      </div>
                    )}
                    {method === 'perpendicular' && (
                      <div className="space-y-2">
                        <label className="input-label">Length of Steel (Ls)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={barDiameter} 
                            onChange={(e) => setBarDiameter(Number(e.target.value))}
                            className="dash-input pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400">mm</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {isBatchMode && (
                  <div className="space-y-2 pt-2">
                    <label className="input-label">Member Location/ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Column B-12"
                      value={currentRowLocation} 
                      onChange={(e) => setCurrentRowLocation(e.target.value)}
                      className="dash-input"
                    />
                    <button 
                      onClick={addToBatch}
                      className="w-full mt-2 bg-blue-600 text-white py-3 font-black uppercase tracking-widest border-2 border-blue-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Commit to Batch
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-auto p-4 bg-dash-bg font-bold border-2 border-dash-line text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                <h3 className="text-[10px] font-black uppercase mb-2 tracking-widest bg-white text-dash-ink px-1 w-fit">Reference Manual</h3>
                <p className="text-[10px] leading-relaxed">
                  Steel Velocity (Vs) is fixed at 5.2 km/s. Standards: IS 516 : 2019 (Part 5).
                </p>
              </div>
            </aside>

            {/* Main Content Dashboard */}
            <main className="flex-1 min-w-0 px-12 py-12 flex flex-col gap-10 overflow-y-auto bg-dash-bg relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
              
              {/* Header Section */}
              <div className="relative z-10 shrink-0">
                <div className="inline-block bg-blue-600 text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] border border-blue-400">
                  {greeting}, {user.name} // {user.email}
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 border-4 border-white/20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl shrink-0 transform -rotate-6 shadow-2xl relative overflow-hidden group">
                       <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <WAVEShieldLogo size={54} className="relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-1" />
                       <span className="text-[9px] font-black text-blue-400/80 tracking-widest relative z-10 drop-shadow-sm">v4.0</span>
                    </div>
                    <h1 className="text-[42px] font-black text-white uppercase tracking-tighter italic leading-[0.9] transform -skew-x-6 drop-shadow-md">
                      WAVE SHIELD
                    </h1>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setUser(null)}
                      className="px-6 py-2 border-2 border-white/40 bg-white/5 text-white flex items-center gap-2 font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-slate-800 transition-all shadow-lg backdrop-blur-sm"
                    >
                      <LogOut size={14} />
                      Logout Session
                    </button>
                  </div>
                </div>
              </div>

              {!isBatchMode ? (
                /* SINGLE MEASUREMENT VIEW */
                <div className="space-y-10 relative z-10 flex flex-col flex-1 pb-10">
                  {/* Results Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="metric-card border-b-4 border-blue-500 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-slate-900" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-slate-900" />
                      </div>
                      <span className="input-label flex justify-between items-center">
                        Measured Velocity
                        <span className="text-[8px] font-mono text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Status: Active</span>
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[44px] font-black italic text-slate-800 tracking-tighter">{results.measuredVelocity.toFixed(3)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">km/s</span>
                      </div>
                      <div className="mt-2 w-full h-[1px] bg-blue-100" />
                    </div>

                    <div className="metric-card border-b-4 border-slate-400 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-slate-900" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-slate-900" />
                      </div>
                      <span className="input-label flex justify-between items-center">
                        Factor (K)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[44px] font-black italic text-slate-800 tracking-tighter">{results.kFactor?.toFixed(3) || '1.000'}</span>
                      </div>
                      <div className="mt-2 w-full h-[1px] bg-slate-100" />
                    </div>

                    <div className="metric-card border-b-4 border-blue-600 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-slate-900" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-slate-900" />
                      </div>
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.03] text-blue-600 pointer-events-none transform scale-150 group-hover:scale-125 transition-transform duration-700">
                        <CheckCircle2 size={100} />
                      </div>
                      <span className="input-label text-blue-600 flex justify-between items-center">
                        Corrected Velocity (Vc)
                        <span className="text-[8px] font-mono text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Verified Result</span>
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[44px] font-black italic text-blue-600 tracking-tighter">{results.correctedVelocity.toFixed(3)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">km/s</span>
                      </div>
                    </div>
                  </div>

                  {results.influenceMsg && (
                    <div className={cn(
                        "px-4 py-2 border-2 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]",
                        results.influencePresent === false 
                          ? "bg-white border-dashed border-slate-300 text-slate-500" 
                          : "bg-white border-blue-600/50 text-blue-600"
                      )}
                    >
                      {results.influencePresent === false ? <Info size={14} /> : <AlertCircle size={14} />}
                      {results.influenceMsg}
                    </div>
                  )}

                  {/* Diagnostic Result Bar - High-End Instrument Feel */}
                  <div className="bg-[#1e3a8a] border-[4px] border-slate-900 p-10 flex flex-col md:flex-row items-center justify-between shadow-[24px_24px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden group transition-all duration-700">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-white to-blue-400 opacity-30" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-white to-blue-400 opacity-30" />
                    
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    
                    <div className="relative z-10 flex items-center gap-8">
                      <div className="w-20 h-20 rounded-none border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Activity size={40} className="text-blue-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                          <span className="text-[11px] font-black text-blue-200 uppercase tracking-[0.3em]">Analysis Output // Realtime</span>
                        </div>
                        <h2 className="text-[56px] font-black text-white italic uppercase tracking-tighter leading-none transform -skew-x-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                          {results.quality}
                        </h2>
                      </div>
                    </div>

                    <div className="relative z-10 mt-8 md:mt-0 flex flex-col items-end">
                      <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm p-4 border border-white/10">
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-blue-300/60 uppercase">System Integrity</p>
                          <p className="text-[14px] font-black text-white uppercase tracking-widest">VERIFIED</p>
                        </div>
                        <div className="w-12 h-12 border-2 border-blue-400 bg-blue-400/10 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-700">
                          <CheckCircle2 size={24} className="text-blue-400 -rotate-45 group-hover:rotate-0 transition-transform duration-700" />
                        </div>
                      </div>
                      <p className="text-[8px] font-mono text-blue-300/30 mt-2 tracking-widest uppercase">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Classification Standard Table */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2">
                      <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Concrete Quality Classification Standard</h3>
                      <span className="text-[9px] bg-slate-800 text-white px-3 py-1 font-black uppercase tracking-[0.2em] italic">IS 516 : 2019 (Part 5)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-0 border border-slate-200 bg-white">
                      {/* Header Row */}
                      <div className="p-4 border-b border-r border-slate-200 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Pulse Velocity (km/s)</div>
                      <div className="p-4 border-b border-r border-slate-200 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Condition</div>
                      <div className="p-4 border-b border-slate-200 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</div>

                      {QUALITY_CRITERIA.map((q) => {
                        const isActive = q.quality === results.quality;
                        return (
                          <React.Fragment key={q.quality}>
                            <div className={cn("p-6 border-b border-r border-slate-100 font-bold text-[18px] text-slate-500", isActive && "bg-[#eff6ff] text-blue-900 font-black border-b-2 border-blue-200")}>
                              {q.velocity}
                            </div>
                            <div className={cn("p-6 border-b border-r border-slate-100 font-black uppercase tracking-widest italic text-slate-500", isActive && "bg-[#eff6ff] text-blue-700 border-b-2 border-blue-200")}>
                              {q.quality}
                            </div>
                            <div className={cn("p-6 border-b border-slate-100 flex items-center gap-3", isActive && "bg-[#eff6ff] border-b-2 border-blue-200")}>
                              {isActive ? (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Target Reached</span>
                                </>
                              ) : (
                                <div className="w-10 h-[1px] bg-slate-100" />
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Session Commitment Area */}
                  <div className="mt-auto">
                    <button 
                      onClick={() => {
                          setBatchData([...batchData, {
                            id: Date.now().toString(),
                            location: currentRowLocation || `Reading ${batchData.length + 1}`,
                            method,
                            pathLength,
                            pulseTime,
                            offsetDistance,
                            barDiameter,
                            results,
                            timestamp: new Date().toISOString()
                          }]);
                          showToast(`Analysis Committed to Session Matrix`);
                          setCurrentRowLocation('');
                      }}
                      className="px-10 py-5 bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] border-2 border-slate-700 flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-[12px_12px_30px_rgba(0,0,0,0.2)] hover:shadow-[16px_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 self-start"
                    >
                      <Plus size={16} /> Commit Reading to Session Table
                    </button>
                  </div>
                </div>
              ) : (
                /* BATCH ANALYSIS VIEW */
                <div className="space-y-6 relative z-10 flex flex-col flex-1 pb-10">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="metric-card bg-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-4 h-4 opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-slate-900" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-slate-900" />
                      </div>
                      <span className="input-label">Total Readings</span>
                      <p className="text-3xl font-black text-slate-800 italic">{batchData.length}</p>
                    </div>
                    <div className="metric-card bg-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-4 h-4 opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-slate-900" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-slate-900" />
                      </div>
                      <span className="input-label text-blue-600">Mean Velocity (Vc)</span>
                      <p className="text-3xl font-black text-blue-600 italic">{batchStats?.mean.toFixed(3) || '0.000'}</p>
                    </div>
                    <div className="metric-card bg-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-4 h-4 opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-slate-900" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-slate-900" />
                      </div>
                      <span className="input-label">Std. Deviation</span>
                      <p className="text-3xl font-black text-slate-800 italic">{batchStats?.stdDev.toFixed(4) || '0.0000'}</p>
                    </div>
                    <div className="metric-card bg-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-4 h-4 opacity-[0.1] pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-blue-600" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-blue-600" />
                      </div>
                      <span className="input-label">Consistency</span>
                      <p className="text-3xl font-black text-slate-800 italic">{batchData.length > 0 ? 'Verified' : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 overflow-hidden flex flex-col flex-1 shadow-sm">
                    <div className="overflow-auto flex-1">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-20">
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameters</th>
                            <th className="p-4 text-left text-[10px] font-black text-blue-600 uppercase tracking-widest">Velocity (km/s)</th>
                            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality</th>
                            <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Discard</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic">
                          {batchResults.map((r, i) => (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="p-4 font-mono font-bold text-slate-400 text-[11px]">{String(i + 1).padStart(2, '0')}</td>
                              <td className="p-4 font-black uppercase text-[12px] text-slate-700 tracking-tight">{r.location}</td>
                              <td className="p-4 font-mono text-[11px] text-slate-500">L:{r.pathLength} / T:{r.pulseTime}</td>
                              <td className="p-4 font-black text-[14px] text-blue-600 italic">{r.results!.correctedVelocity.toFixed(3)}</td>
                              <td className="p-4">
                                <span className={cn(
                                  "text-[9px] font-black uppercase px-2 py-0.5 inline-block border",
                                  r.results!.quality === 'Excellent' ? 'border-green-500 text-green-600 bg-green-50' : 
                                  r.results!.quality === 'Good' ? 'border-blue-500 text-blue-600 bg-blue-50' : 
                                  r.results!.quality === 'Medium' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 'border-red-500 text-red-600 bg-red-50'
                                )}>{r.results!.quality}</span>
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => setBatchData(batchData.filter(b => b.id !== r.id))}
                                  className="text-slate-200 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {batchData.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-20 text-center opacity-20">
                                <div className="flex flex-col items-center gap-4">
                                  <Calculator size={60} />
                                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Session Data Queue Empty</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4 shrink-0">
                <button 
                  onClick={() => {
                    generatePDF();
                    showToast("Laboratory report generated", "success");
                  }}
                  className="group bg-blue-700 text-white px-8 py-4 rounded-none font-black text-[14px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-3 border-2 border-dash-line w-full md:w-auto"
                >
                  <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                  {isBatchMode ? 'Download Batch Report' : 'Download PDF Report'}
                </button>
                <button 
                  onClick={() => {
                    if (isBatchMode) {
                      setBatchData([]);
                    } else {
                      setPathLength(150);
                      setPulseTime(35);
                      setOffsetDistance(40);
                      setBarDiameter(12);
                      setMethod('perpendicular');
                    }
                    showToast("System metrics reset", "success");
                  }}
                  className="bg-white border-2 border-dash-line text-dash-ink px-8 py-4 rounded-none font-black text-[14px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] hover:bg-slate-50 hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-3"
                >
                  {isBatchMode ? 'Clear All Batch Data' : 'Reset Lab Metrics'}
                </button>
              </div>

              <div className="mt-auto pt-8 border-t-2 border-dash-line border-dashed flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-dash-ink/60">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-dash-ink font-black uppercase tracking-widest mb-1">Institution</span>
                    <span>Thiagarajar College of Engineering</span>
                    <span>Madurai, Tamil Nadu</span>
                  </div>
                  <div className="w-[1px] h-8 bg-dash-line/20" />
                  <div className="flex flex-col">
                    <span className="text-dash-ink font-black uppercase tracking-widest mb-1">Department</span>
                    <span>Civil Engineering - Laboratory</span>
                    <span>Reinforced Concrete Analysis</span>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-dash-ink font-black uppercase tracking-widest mb-1">System Information</span>
                  <span>Version 2.4.0 (TCE-CIVIL)</span>
                  <span>Standards: IS 516 (Part 5)</span>
                </div>
              </div>

              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 border-4 border-dash-line font-black uppercase tracking-widest text-[11px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-3",
                      toast.type === 'success' ? "bg-dash-success text-white" : 
                      toast.type === 'warning' ? "bg-dash-warning text-dash-ink" : 
                      "bg-dash-error text-white"
                    )}
                  >
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : 
                     toast.type === 'warning' ? <Info size={16} /> : 
                     <AlertCircle size={16} />}
                    {toast.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
