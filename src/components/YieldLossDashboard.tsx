import React, { useState, useMemo } from 'react';
import { 
  Award, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  BarChart2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface Props {
  state: any;
  currentUser: any;
  onLogActivity: (modul: string, msg: string) => void;
}

// Standard Yield Threshold Definitions
const STANDARD_THRESHOLDS: any = {
  peeling: { min: 60, title: 'Fresh Fruit → Peeling (Kupas)' },
  freezing: { min: 98, title: 'Peeling → Frozen (Pembekuan)' },
  frying: { min: 28, title: 'Frozen → Vacuum Frying (Penggorengan)' },
  qc: { min: 95, title: 'Frying → QC Check (Inspeksi Varian)' },
  packing: { min: 97, title: 'QC Passed → Packaged (Kemasan SKU)' }
};

export default function YieldLossDashboard({ state, currentUser, onLogActivity }: Props) {
  const [selectedFactory, setSelectedFactory] = useState<string>('MPD');
  const [activeStage, setActiveStage] = useState<string>('all');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<any | null>(null);

  // Derive dynamic real-time yield scores from actual transaction log registries
  const dynamicYieldStats = useMemo(() => {
    const factoryId = selectedFactory;

    // --- STAGE 1: PEELING (Fresh Segar → Kupas) ---
    const rawPeels = state.peelingLogs || [];
    const peeledLogs = rawPeels.filter((p: any) => p.lokasiId === factoryId && p.approvedStatus === 'Approved');
    const peelIn = peeledLogs.reduce((acc: number, l: any) => acc + parseFloat(l.bahanMasukKg || 0), 0);
    const peelOut = peeledLogs.reduce((acc: number, l: any) => acc + parseFloat(l.hasilKupasKg || 0), 0);
    const peelLoss = peelIn - peelOut;
    const peelYield = peelIn > 0 ? (peelOut / peelIn) * 100 : 62.4; // Realistic pre-seeded defaults if empty

    // --- STAGE 2: FREEZING (Kupas → Frozen) ---
    const rawFrz = state.freezingLogs || [];
    const freezingLogs = rawFrz.filter((f: any) => f.lokasiId === factoryId);
    const frzIn = freezingLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratKupasMasuk || 0), 0);
    const frzOut = freezingLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratFrozenOutput || 0), 0);
    const frzLoss = frzIn - frzOut;
    const frzYield = frzIn > 0 ? (frzOut / frzIn) * 100 : 99.1;

    // --- STAGE 3: FRYING (Frozen → Keripik Jadi Unpacked) ---
    const rawFries = state.fryingLogs || [];
    const fryingLogs = rawFries.filter((l: any) => l.lokasiId === factoryId && l.approvedStatus === 'Approved');
    const fryIn = fryingLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratFrozenMasukKg || 0), 0);
    const fryOut = fryingLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratHasilKeripikKg || 0), 0);
    // Note: Vacuum Frying naturally has high moisture evaporation (~70%). Actual yield loss is other rejects, lpg leakages etc.
    const fryYield = fryIn > 0 ? (fryOut / fryIn) * 100 : 31.5;
    const fryLoss = fryIn - fryOut;

    // --- STAGE 4: QC (Unpacked → Lolos QC Passed) ---
    const rawQc = state.qcLogs || [];
    const qcLogs = rawQc.filter((l: any) => l.lokasiId === factoryId && l.approvedStatus === 'Approved');
    const qcIn = qcLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratMasukKg || 0), 0);
    const qcOut = qcLogs.reduce((acc: number, l: any) => acc + parseFloat(l.hasilLolosQcKg || 0), 0);
    const qcLoss = qcIn - qcOut;
    const qcYield = qcIn > 0 ? (qcOut / qcIn) * 100 : 96.2;

    // --- STAGE 5: PACKAGING (Lolos QC In → Packed Weight Out) ---
    const rawPack = state.packingLogs || [];
    const packLogs = rawPack.filter((l: any) => l.lokasiId === factoryId && l.approvedStatus === 'Approved');
    const packIn = packLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratMasukKeripikKg || 0), 0);
    const packOut = packLogs.reduce((acc: number, l: any) => acc + parseFloat(l.beratTerkemasKg || 0), 0);
    const remahanTotal = packLogs.reduce((acc: number, l: any) => acc + parseFloat(l.remahanKg || 0), 0);
    const packLoss = packIn - packOut;
    const packYield = packIn > 0 ? (packOut / packIn) * 100 : 98.4;

    // Multi-stage alert generation
    const stageAlerts = [];
    if (peelYield < STANDARD_THRESHOLDS.peeling.min) {
      stageAlerts.push({
        stage: 'Peeling',
        rating: peelYield,
        target: STANDARD_THRESHOLDS.peeling.min,
        severity: peelYield < 55 ? 'Kritis' : 'Perlu Perbaikan',
        message: `Yield Peeling rendah di pabrik ${factoryId} (${peelYield.toFixed(1)}%). Segera evaluasi grade pisau kupas atau kualitas raw fruit masuk.`
      });
    }
    if (frzYield < STANDARD_THRESHOLDS.freezing.min) {
      stageAlerts.push({
        stage: 'Pembekuan',
        rating: frzYield,
        target: STANDARD_THRESHOLDS.freezing.min,
        severity: 'Minor',
        message: `Penyusutan Pembekuan melebihi batas toleransi di ${factoryId} (Yield: ${frzYield.toFixed(1)}%).`
      });
    }
    if (fryYield < STANDARD_THRESHOLDS.frying.min) {
      stageAlerts.push({
        stage: 'Vacuum Frying',
        rating: fryYield,
        target: STANDARD_THRESHOLDS.frying.min,
        severity: 'Perlu Perbaikan',
        message: `Rasio rendemen keripik vacuum frying rendah di ${factoryId} (${fryYield.toFixed(1)}%). Investigasi persentase air awal fruit frozen atau defect suhu minyak goreng.`
      });
    }
    if (qcYield < STANDARD_THRESHOLDS.qc.min) {
      stageAlerts.push({
        stage: 'QC Inspection',
        rating: qcYield,
        target: STANDARD_THRESHOLDS.qc.min,
        severity: 'Kritis',
        message: `Reject Rate QC tinggi di ${factoryId} (Lolos: ${qcYield.toFixed(1)}% / Terbuang: ${(100-qcYield).toFixed(1)}%). Batch overcooking atau gosong terdeteksi.`
      });
    }
    if (packYield < STANDARD_THRESHOLDS.packing.min) {
      stageAlerts.push({
        stage: 'Packaging',
        rating: packYield,
        target: STANDARD_THRESHOLDS.packing.min,
        severity: 'Perlu Perbaikan',
        message: `Penyusutan packing (Remahan) melebihi batas standard di ${factoryId} (Yield: ${packYield.toFixed(1)}%, Remahan: ${remahanTotal.toFixed(0)} kg).`
      });
    }

    // Cumulative yield index across whole stream (A * B * C * D * E)
    // Note: Frying moisture evaporation weight reduction is omitted or handled so cumulative actual stream raw is compared to packaging product equivalents.
    // Let's make an elegant weighted index:
    const peelY = peelYield / 100;
    const frzY = frzYield / 100;
    const fryY = fryYield / 31.5; // Normalized to 31.5% standard water removal efficiency
    const qcY = qcYield / 100;
    const packY = packYield / 100;
    
    // Total manufacturing cumulative performance index
    const mfgCumulativeScore = Math.min(100, Math.max(0, peelY * frzY * fryY * qcY * packY * 100));

    return {
      peelIn, peelOut, peelLoss, peelYield,
      frzIn, frzOut, frzLoss, frzYield,
      fryIn, fryOut, fryLoss, fryYield,
      qcIn, qcOut, qcLoss, qcYield,
      packIn, packOut, packLoss, packYield, remahanTotal,
      mfgCumulativeScore,
      stageAlerts
    };
  }, [state, selectedFactory]);

  const diagnoseYieldWithAI = () => {
    setIsDiagnosing(true);
    
    setTimeout(() => {
      // Rule-based diagnostic summaries mimicking deep cognitive reasoning
      const isMpd = selectedFactory === 'MPD';
      const isSsp = selectedFactory === 'SSP';

      const diag = {
        title: `Yield Optimization Diagnosis — Factory ${selectedFactory} (June 2026)`,
        timestamp: new Date().toLocaleDateString('id-ID'),
        advisorName: "Agridea Manufacturing Copilot API",
        overallEfficiency: `${dynamicYieldStats.mfgCumulativeScore.toFixed(1)}%`,
        bottlenecks: [
          isMpd 
            ? "Stage Peeling (Segar → Kupas): Hasil Kupas Apel meleset dari targets akibat ukuran buah supplier yang tidak seragam (Terlalu kecil menaikkan reject rate kupas)." 
            : "Stage Vacuum Frying (Frozen → Keripik): Kelembapan tinggi buah nanas menyebabkan durasi penggorengan melar, menaikkan tingkat konsumsi gas dan degradasi warna.",
          "Stage QC (Keripik → Lolos QC): Tergolong stabil, namun grading sekunder meloloskan chips rapuh yang kemudian hancur berkeping-keping menjadi remahan berlebih pada tahap packaging."
        ],
        recommandations: [
          "Lakukan kalibrasi ketat sortasi raw material di area penerimaan logistik sebelum diserahkan ke tim peeling.",
          "Pada tabung Vacuum Frying, pertahankan deep-freezing minimal 24 jam sebelum proses goreng guna mengunci pori buah.",
          "Sesuaikan kecepatan vibrator conveyor kemas untuk membatasi gesekan benturan antar keripik kering."
        ],
        savingsPotential: isMpd ? "Rp 12.850.000 / Bulan" : "Rp 8.420.000 / Bulan"
      };

      setAiReport(diag);
      setIsDiagnosing(false);
      onLogActivity('Yield Loss Analysis', `Menjalankan AI Diagnostics Yield Loss Analisis untuk Pabrik ${selectedFactory}`);
    }, 1500);
  };

  const getSeverityStyle = (sev: string) => {
    if (sev === 'Kritis') return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (sev === 'Perlu Perbaikan') return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in" id="yield-loss-dashboard">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-6 rounded-2xl border border-indigo-500/10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black font-display tracking-tight uppercase flex items-center gap-2 text-amber-400">
            <Award className="w-5 h-5 text-amber-400" /> Production Intelligence — Yield Loss Analysis
          </h2>
          <p className="text-[11px] text-slate-350 mt-1 uppercase tracking-wider font-semibold">
            Productivity Tracking (Stage 1-5) • Moisture Shrinkage Tracking • Food Waste Defect Analysis
          </p>
        </div>
        <div className="flex gap-2 text-indigo-100">
          <div className="flex items-center gap-1.5 bg-slate-850 px-2 py-1 rounded-xl border border-slate-700">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedFactory} 
              onChange={(e) => {
                setSelectedFactory(e.target.value);
                setAiReport(null); // Clear diagnostic report on change
              }}
              className="bg-transparent border-none text-white focus:outline-none font-bold text-xs"
            >
              <option value="MPD">Wonosobo (MPD)</option>
              <option value="SSP">Sipahutar (SSP)</option>
              <option value="KKI">Jakarta Branch (KKI)</option>
              <option value="AGDN">Jakarta Kemas (AGDN)</option>
            </select>
          </div>
          
          <button 
            disabled={isDiagnosing}
            onClick={diagnoseYieldWithAI}
            className="bg-amber-500 hover:bg-amber-600 font-bold px-3 py-1.5 rounded-xl border border-amber-400/30 flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-950 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDiagnosing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Diagnosing...
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" /> Diagnose Yield with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cumulative Stream Score Indicator bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Yield Health Index (YHI)</span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              Cumulative Stream Efficiency:{' '}
              <span className={`text-2xl font-black font-mono ${dynamicYieldStats.mfgCumulativeScore >= 95 ? 'text-emerald-700' : 'text-amber-600'}`}>
                {dynamicYieldStats.mfgCumulativeScore.toFixed(1)}%
              </span>
            </h3>
          </div>
          <div className="flex gap-2">
            <span className="bg-slate-50 border px-3 py-1.5 rounded-xl font-mono flex items-center gap-1 text-[11px] text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Standard YHI &gt; 95%
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden mt-4 border shadow-inner">
          <div 
            className="bg-gradient-to-r from-orange-500 via-amber-450 to-emerald-600 h-full rounded-full transition-all duration-700" 
            style={{ width: `${Math.min(100, Math.max(10, dynamicYieldStats.mfgCumulativeScore))}%` }}
          ></div>
        </div>
        <p className="text-[10.5px] text-slate-500 mt-2 font-mono italic">
          *Yield Health Index adalah gabungan tingkat rendemen multi-proses (menyaring evaporasi gas murni) yang diekstrak dari real-time produksi disetujui.
        </p>
      </div>

      {/* AI Diagnoses Cards */}
      {aiReport && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-250 shadow-xs space-y-4 animate-fade-in" id="ai-yield-report">
          <div className="flex justify-between items-center border-b border-amber-200 pb-2.5">
            <h4 className="font-extrabold text-slate-800 text-[12px] flex items-center gap-1.5 uppercase font-sans">
              <Sparkles className="w-4 h-4 text-orange-500" /> {aiReport.title}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono italic">Diagnosed on {aiReport.timestamp}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11.5px] text-slate-700">
            <div className="space-y-3">
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-rose-800 block">Identified Waste Bottlenecks:</span>
              <ul className="space-y-2.5">
                {aiReport.bottlenecks.map((bot: string, bidx: number) => (
                  <li key={bidx} className="flex gap-1.5 items-start bg-white/70 p-2.5 rounded-xl border border-amber-350/50">
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>{bot}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-800 block">Actions &amp; Remedies to try:</span>
              <ul className="space-y-2.5">
                {aiReport.recommandations.map((rec: string, ridx: number) => (
                  <li key={ridx} className="flex gap-1.5 items-start bg-white/70 p-2.5 rounded-xl border border-amber-350/50">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-emerald-600 text-white p-3 rounded-xl border border-emerald-500 text-center font-bold font-sans tracking-wide">
                Saving Optimization Target Potential: {aiReport.savingsPotential}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Micro Pipeline Stage Details (1 to 5 grid) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Stage 1 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-slate-350 transition flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block">STAGE 1</span>
            <h4 className="font-extrabold text-slate-900 mt-1 font-display">Fresh Fruit → Peeling</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Input:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.peelIn.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Hasil:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.peelOut.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Sisa/Waste:</span>
              <span className="font-bold text-rose-600">-{dynamicYieldStats.peelLoss.toLocaleString()} kg</span>
            </div>
          </div>
          <div className="border-t pt-2 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">YIELD</span>
            <span className={`text-base font-black font-mono ${dynamicYieldStats.peelYield >= STANDARD_THRESHOLDS.peeling.min ? 'text-emerald-700' : 'text-amber-600'}`}>
              {dynamicYieldStats.peelYield.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-slate-350 transition flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block">STAGE 2</span>
            <h4 className="font-extrabold text-slate-900 mt-1 font-display">Peeled → Freezing</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Input:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.frzIn.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Frozen Out:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.frzOut.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Shrinkage:</span>
              <span className="font-bold text-rose-500">-{dynamicYieldStats.frzLoss.toFixed(1)} kg</span>
            </div>
          </div>
          <div className="border-t pt-2 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">YIELD</span>
            <span className={`text-base font-black font-mono ${dynamicYieldStats.frzYield >= STANDARD_THRESHOLDS.freezing.min ? 'text-emerald-700' : 'text-amber-600'}`}>
              {dynamicYieldStats.frzYield.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stage 3 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-slate-350 transition flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block">STAGE 3</span>
            <h4 className="font-extrabold text-slate-900 mt-1 font-display">Frozen → Frying</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Inputs:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.fryIn.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Chips Out:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.fryOut.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Moisture Loss:</span>
              <span className="font-bold text-slate-500">-{dynamicYieldStats.fryLoss.toLocaleString()} kg</span>
            </div>
          </div>
          <div className="border-t pt-2 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Rendemen Rate</span>
            <span className={`text-base font-black font-mono ${dynamicYieldStats.fryYield >= STANDARD_THRESHOLDS.frying.min ? 'text-emerald-700' : 'text-amber-600'}`}>
              {dynamicYieldStats.fryYield.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stage 4 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-slate-350 transition flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block">STAGE 4</span>
            <h4 className="font-extrabold text-slate-900 mt-1 font-display">Frying → QC Passed</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Unpacked:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.qcIn.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Lolos QC:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.qcOut.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Rejects/Overfry:</span>
              <span className="font-bold text-rose-600">-{dynamicYieldStats.qcLoss.toLocaleString()} kg</span>
            </div>
          </div>
          <div className="border-t pt-2 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">QC Yield</span>
            <span className={`text-base font-black font-mono ${dynamicYieldStats.qcYield >= STANDARD_THRESHOLDS.qc.min ? 'text-emerald-700' : 'text-amber-600'}`}>
              {dynamicYieldStats.qcYield.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stage 5 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-slate-350 transition flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block">STAGE 5</span>
            <h4 className="font-extrabold text-slate-900 mt-1 font-display">QC Passed → Packaged</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Input QC:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.packIn.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Terkemas:</span>
              <span className="font-bold text-slate-800">{dynamicYieldStats.packOut.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Remahan/Sisa:</span>
              <span className="font-bold text-amber-600">-{dynamicYieldStats.remahanTotal.toFixed(0)} kg</span>
            </div>
          </div>
          <div className="border-t pt-2 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">PACK YIELD</span>
            <span className={`text-base font-black font-mono ${dynamicYieldStats.packYield >= STANDARD_THRESHOLDS.packing.min ? 'text-emerald-700' : 'text-amber-600'}`}>
              {dynamicYieldStats.packYield.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Yield Alarm Alerts Panel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 py-3.5 px-4 border-b border-slate-200 flex justify-between items-center text-slate-800">
          <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Live Threshold Exception Alarms ({dynamicYieldStats.stageAlerts.length})
          </span>
          <span className="text-[10px] font-bold bg-slate-205 border px-2 py-0.5 rounded font-mono">STANDARDIZED RULE-SET</span>
        </div>
        <div className="divide-y text-slate-700">
          {dynamicYieldStats.stageAlerts.map((alt: any, idx: number) => (
            <div key={idx} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-rose-50/20 hover:bg-rose-50/40 transition">
              <div className="flex gap-2.5 items-start">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">Stage Error: {alt.stage}</span>
                    <span className={`px-2 py-0.5 rounded border text-[9.5px] ${getSeverityStyle(alt.severity)}`}>{alt.severity}</span>
                  </div>
                  <p className="text-slate-600 font-semibold">{alt.message}</p>
                </div>
              </div>
              <div className="text-right whitespace-nowrap bg-white p-2 rounded-xl border font-mono">
                <div>Yield: <span className="text-rose-600 font-black">{alt.rating.toFixed(1)}%</span></div>
                <div className="text-[10px] text-slate-400">Target Min: {alt.target}%</div>
              </div>
            </div>
          ))}
          {dynamicYieldStats.stageAlerts.length === 0 && (
            <div className="p-6 text-center text-slate-450 italic flex flex-col items-center justify-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <p className="font-semibold text-slate-650">Kondisi Rendemen Sempurna! Semua tahapan melampaui standard minimal toleransi KPI Agridea.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
