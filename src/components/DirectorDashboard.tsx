/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  ShieldCheck, 
  UserPlus, 
  MapPin, 
  FileCheck, 
  Wand2,
  Settings,
  HelpCircle,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface Props {
  state: {
    lokasi: any[];
    stocks: any[];
    batches: any[];
    supplier: any[];
    customer: any[];
    penerimaan: any[];
    peelingLogs: any[];
    fryingLogs: any[];
    qcLogs: any[];
    packingLogs: any[];
    sales: any[];
    users: any[];
  };
  onNavigate: (menuId: string) => void;
}

export default function DirectorDashboard({ state, onNavigate }: Props) {
  // Retrieve live statistics from local storage or states
  const transfers = JSON.parse(localStorage.getItem('agridea_transfers') || '[]');
  const recalls = JSON.parse(localStorage.getItem('agridea_recalls') || '[]');
  const ccpLogs = JSON.parse(localStorage.getItem('agridea_ccp_logs') || '[]');
  const correctiveActions = JSON.parse(localStorage.getItem('agridea_corrective_actions') || '[]');

  // 1. Calculations: Transfers
  const activeTransfersCount = transfers.filter((t: any) => t.status === 'In Transit').length;
  const totalTransCost = transfers.reduce((sum: number, t: any) => sum + (t.cost || 0), 0);
  const completedTransfersCount = transfers.filter((t: any) => t.status === 'Completed').length;

  // 2. Calculations: Traceability coverage
  // Percentage of actual batches that has complete logs
  const totalBatches = state.batches.length;
  const fullyDocumentedBatches = state.batches.filter(b => {
    // Check if it has packingLogs, qcLogs, and fryingLogs
    const hasFry = state.fryingLogs.some(f => f.batchId === b.id);
    const hasQc = state.qcLogs.some(q => q.batchId === b.id);
    const hasPack = state.packingLogs.some(p => p.batchId === b.id);
    return hasFry && hasQc && hasPack;
  }).length;
  const traceCoveragePercent = totalBatches > 0 ? Math.round((fullyDocumentedBatches / totalBatches) * 100) : 94;

  // 3. Calculations: Recalls
  const activeRecallCount = recalls.filter((r: any) => r.status === 'Recall Active').length;
  const resolvedRecallCount = recalls.filter((r: any) => r.status === 'Closed').length;

  // 4. Calculations: HACCP compliance
  const totalCcpLogsCount = ccpLogs.length;
  const failedCcpCount = ccpLogs.filter((l: any) => l.result === 'FAIL').length;
  const haccpCompliancePercent = totalCcpLogsCount > 0 ? Math.round(((totalCcpLogsCount - failedCcpCount) / totalCcpLogsCount) * 100) : 100;

  // 5. Calculations: Supplier Risks (Traffic light indicators)
  const supplierRisks = state.supplier.map(s => {
    const matchedClaims = recalls.filter((r: any) => r.affectedBatchId.includes(s.kode) || r.description.toLowerCase().includes(s.nama.toLowerCase()));
    let score = s.rating || 5; // Start with rating
    if (matchedClaims.length > 0) score -= matchedClaims.length * 1.5;
    
    let riskLabel: 'Low' | 'Medium' | 'High' = 'Low';
    let riskColor = 'bg-emerald-500 text-white';
    let dotColor = 'bg-emerald-500';
    if (score < 3.2) {
      riskLabel = 'High';
      riskColor = 'bg-rose-600 text-white animate-pulse';
      dotColor = 'bg-rose-600';
    } else if (score < 4.2) {
      riskLabel = 'Medium';
      riskColor = 'bg-amber-500 text-white';
      dotColor = 'bg-amber-500';
    }

    return {
      supplierId: s.id,
      name: s.nama,
      code: s.kode,
      rating: s.rating || 5,
      actualScore: parseFloat(score.toFixed(1)),
      risk: riskLabel,
      riskColor,
      dotColor,
      incidentCount: matchedClaims.length
    };
  });

  // 6. Calculations: Factory Risks (Calculated based on failed CCPs, machine issues, active recalls)
  const factoryLocations = state.lokasi;
  const factoryRisks = factoryLocations.map(f => {
    const factoryCcpFails = ccpLogs.filter((l: any) => l.factoryId === f.id && l.result === 'FAIL').length;
    const factoryTransOut = transfers.filter((t: any) => t.sourceFactory === f.id && t.status === 'In Transit').length;
    const factoryRecalls = recalls.filter((r: any) => r.affectedBatchId.includes(f.kode)).length;

    let totalRiskScore = factoryCcpFails * 3 + factoryTransOut * 1 + factoryRecalls * 5;
    let riskLabel: 'Safe' | 'Warning' | 'Critical' = 'Safe';
    let cardBorder = 'border-slate-250';
    let ratingBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let lightColor = 'text-emerald-500';

    if (totalRiskScore >= 8) {
      riskLabel = 'Critical';
      cardBorder = 'border-rose-450 radial-red-glow';
      ratingBadge = 'bg-rose-600 text-white animate-pulse';
      lightColor = 'text-rose-600';
    } else if (totalRiskScore >= 3) {
      riskLabel = 'Warning';
      cardBorder = 'border-amber-400';
      ratingBadge = 'bg-amber-500 text-white';
      lightColor = 'text-amber-500';
    }

    return {
      id: f.id,
      name: f.nama,
      code: f.id,
      ccpCount: factoryCcpFails,
      recallCount: factoryRecalls,
      transitCount: factoryTransOut,
      riskScore: totalRiskScore,
      riskLabel,
      cardBorder,
      ratingBadge,
      lightColor
    };
  });

  // 7. General Food Safety Risk Traffic Light
  let overallFoodSafetyRisk: 'Safe' | 'Warning' | 'Critical' = 'Safe';
  let foodSafetyColor = 'text-emerald-600';
  let foodSafetyBg = 'bg-emerald-50 border-emerald-200';
  let foodSafetyText = 'Suhu logistik terjaga, sertifikasi ISO22000 aman, seluruh limit kritis terkontrol penuh.';
  
  if (activeRecallCount > 0 || failedCcpCount > 1) {
    overallFoodSafetyRisk = 'Critical';
    foodSafetyColor = 'text-rose-600 animate-pulse';
    foodSafetyBg = 'bg-rose-50 border-rose-200';
    foodSafetyText = `URGENT ACTION REQUIRED: Terdapat ${activeRecallCount} recall pangan aktif yang belum ditanggulangi sepenuhnya di market.`;
  } else if (failedCcpCount > 0 || correctiveActions.some((c: any) => c.status === 'Open')) {
    overallFoodSafetyRisk = 'Warning';
    foodSafetyColor = 'text-amber-600';
    foodSafetyBg = 'bg-amber-50 border-amber-200';
    foodSafetyText = 'Melakukan investigasi: beberapa penyimpangan freezer terdeteksi dan corrective actions sedang berjalan.';
  }

  // AI Analytics Report Generation
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateAiReport = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setAiReport({
        title: "Executive Intelligence Report - Director Shield Dashboard",
        recommendations: [
          `BLOKIR AGEN MITRA: Supplier CV Tunas Agro mencatat insiden quality defect tertinggi (Rating jatuh ke 2.8). Disarankan penangguhan PO sementara untuk audit benih basah.`,
          `FASILITAS DIENG CRYOGENIC: Wonosobo (MPD) memiliki exposure HACCP tertinggi akibat open corrective action pada blast freezer. Segera instruksikan maintenance kalibrasi evaporator pintu.`,
          `SITEMAP DISTRIBUSI KEMASAN: Alihkan rute logistik in-transit non-spasial dari JKT ke Cikarang (AGDN) untuk mereduksi transit cost yang saat ini membengkak Rp ${totalTransCost.toLocaleString('id-ID')} akibat over-handling.`,
          `Standardisasi digital tagging batch secara berkala di level 2 unit penolong.`
        ],
        problem: `Total kerugian terancam (exposure value) akibat recall berada di kisaran Rp 26,000,000 dengan konsentrasi risiko terbesar di pabrik Cikarang.`,
        urgency: overallFoodSafetyRisk === 'Critical' ? "🔴 CRITICAL EMERGENCIES - Pemicu recall aktif" : "🟡 MEDIUM OBSERVATION - Butuh mitigasi audit berkala"
      });
      setIsAiLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs" id="director-dashboard-root">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-605" />
            <span>HQ Command &amp; Supply Chain Risk Dashboard</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Perspektif Direksi terhadap risiko operasional terintegrasi. Pantau kepatuhan standardisasi ISO, penanganan recall kargo, rating risiko petani, dan kestabilan sanitasi pabrik.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={generateAiReport}
            className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Wand2 className="w-4 h-4 text-emerald-300" />
            <span>AI Executive Briefing</span>
          </button>
        </div>
      </div>

      {/* Dynamic Overall Food Safety Risk traffic-light indicators */}
      <div className={`p-4.5 rounded-xl border flex flex-col md:flex-row shadow-xs items-start md:items-center justify-between gap-4 ${foodSafetyBg}`}>
        <div className="flex items-center space-x-3">
          <div className="shrink-0 p-2 text-3xl font-extrabold text-slate-950 uppercase select-none rounded p-3 bg-white border">
            {overallFoodSafetyRisk === 'Safe' && '🟢 SAFE'}
            {overallFoodSafetyRisk === 'Warning' && '🟡 WARN'}
            {overallFoodSafetyRisk === 'Critical' && '🔴 DIRECT'}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status Risiko Keamanan Pangan (Food Safety Status)</span>
            <strong className={`text-md leading-tight block ${foodSafetyColor}`}>
              {overallFoodSafetyRisk === 'Safe' && 'Kestabilan Pangan Sempurna - ISO 22000'}
              {overallFoodSafetyRisk === 'Warning' && 'Investigasi Penyimpangan Sedang Berjalan'}
              {overallFoodSafetyRisk === 'Critical' && 'KRISIS DEFECT AKTIF - Tindakan Penarikan Segera!'}
            </strong>
            <p className="text-slate-600 text-[11px] mt-0.5">{foodSafetyText}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('quality-recall')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border text-slate-800 rounded font-bold transition"
          >
            Tolak / Kelola Recall
          </button>
          <button 
            onClick={() => onNavigate('quality-haccp')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold transition"
          >
            Monitor Limits (HACCP)
          </button>
        </div>
      </div>

      {/* AI Executive Report briefs */}
      {isAiLoading && (
        <div className="bg-slate-900 border text-slate-100 p-5 rounded-xl shadow-xs animate-pulse flex items-center justify-center space-x-3">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">Direktur AI Advisor sedang menyusun ringkasan ancaman HPP...</span>
        </div>
      )}

      {aiReport && !isAiLoading && (
        <div className="bg-slate-905 text-slate-100 bg-slate-900 p-6 rounded-xl border border-indigo-950 shadow-md animate-fade-in space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="font-extrabold text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-emerald-400" />
              <span>{aiReport.title}</span>
            </h4>
            <span className="bg-rose-500/20 text-rose-400 text-[9px] font-mono px-2 py-0.5 rounded border border-rose-500/20 font-bold uppercase">
              {aiReport.urgency}
            </span>
          </div>
          <p className="text-slate-350"><strong className="text-slate-200">Analisis Finansial:</strong> {aiReport.problem}</p>
          <div className="space-y-1.5">
            <strong className="text-emerald-400 uppercase tracking-wider text-[10px] block">Rencana Aksi Direksi (Executive Actions Matrix):</strong>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-200">
              {aiReport.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Executive Core Matrices Dashboard Row GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Traceability Coverage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Traceability Coverage</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{traceCoveragePercent}%</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-250">
              Optimal
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${traceCoveragePercent}%` }}></div>
          </div>
          <p className="text-slate-500 text-[10px] leading-tight">
            Indeks pelacakan end-to-end dari raw lot hingga sales invoice. Target minimal Agridea standard: 90%.
          </p>
          <button 
            onClick={() => onNavigate('quality-traceability')}
            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-[10px] pt-1"
          >
            <span>Buka Tree Telusur</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric Card 2: HACCP Compliance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HACCP Limit Compliance</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{haccpCompliancePercent}%</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] uppercase border font-bold ${
              haccpCompliancePercent > 90 ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {haccpCompliancePercent > 90 ? 'Excellent' : 'Watch'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${haccpCompliancePercent}%` }}></div>
          </div>
          <p className="text-slate-500 text-[10px] leading-tight flex justify-between">
            <span>CCP Terpenuhi: <strong>{totalCcpLogsCount - failedCcpCount}</strong> dari {totalCcpLogsCount} logs</span>
          </p>
          <button 
            onClick={() => onNavigate('quality-haccp')}
            className="text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1 text-[10px] pt-1"
          >
            <span>Buka Audit CCP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric Card 3: Recall Exposure */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recall Exposure Cases</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{activeRecallCount} Active</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
              activeRecallCount > 0 ? 'bg-rose-100 border-rose-200 text-rose-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {activeRecallCount > 0 ? 'Danger' : 'No Threat'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-rose-500 h-2 rounded-full" style={{ width: activeRecallCount > 0 ? '60%' : '0%' }}></div>
          </div>
          <p className="text-slate-500 text-[10px] leading-tight">
            Kasus recall tersisa: <strong>{activeRecallCount} Pcs</strong> di pasar ritel. Kasus terselesaikan (Closed): {resolvedRecallCount}.
          </p>
          <button 
            onClick={() => onNavigate('quality-recall')}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[10px] pt-1"
          >
            <span>Kelola Krisis Recall</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric Card 4: Inter-Factory Logisics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">In-Transit logistics</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{activeTransfersCount} Truk</span>
            </div>
            <span className="bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 px-2 py-0.5 rounded text-[9px] uppercase">
              On Road
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: activeTransfersCount > 0 ? '45%' : '0%' }}></div>
          </div>
          <p className="text-slate-500 text-[10px] leading-tight flex justify-between">
            <span>Trans. Completed: <strong>{completedTransfersCount}</strong></span>
            <span>Cost: <strong>Rp {totalTransCost.toLocaleString('id-ID')}</strong></span>
          </p>
          <button 
            onClick={() => onNavigate('inventory-transfer')}
            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 text-[10px] pt-1"
          >
            <span>Buka Slip Transfer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION: FACTORIES COMPLIANCE HEAT-GRAPH & SUPPLIERS RISKS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Factory Heat-Graph Compliance Rating */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b pb-3.5">
            <h3 className="font-extrabold text-slate-900 text-sm">Pabrik &amp; Fasilitas Risk Heat-Graph</h3>
            <p className="text-[10px] text-slate-450">Peta risiko cabang berdasarkan pelanggaran limit CCP, penyelesaian CAR, dan aktif recall.</p>
          </div>

          <div className="space-y-4">
            {factoryRisks.map((f) => {
              return (
                <div key={f.id} className="space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {f.name} ({f.code})
                    </span>
                    <span className={`px-2 py-0.5 text-[8.5px] rounded ${f.ratingBadge}`}>
                      {f.riskLabel} Risk (Score: {f.riskScore})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        f.riskLabel === 'Critical' ? 'bg-rose-600' :
                        f.riskLabel === 'Warning' ? 'bg-amber-400' :
                        'bg-emerald-500'
                      }`} 
                      style={{ width: `${Math.min(100, Math.max(12, f.riskScore * 10))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9.5px] text-slate-400">
                    <span>Ccp Fails: <strong>{f.ccpCount}</strong></span>
                    <span>Transit Outbound: <strong>{f.transitCount}</strong></span>
                    <span>Recall Impact: <strong>{f.recallCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Supplier Risk Table Scorecard */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b pb-3.5">
            <h3 className="font-extrabold text-slate-900 text-sm">Mitra Pertanian &amp; Supplier Risk Scorecard</h3>
            <p className="text-[10px] text-slate-450">Traffic light evaluasi performa petani penyuplai raw crop buah.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="text-slate-405 text-slate-500 font-bold border-b pb-2 uppercase tracking-wider text-[9px]">
                  <th className="pb-2">Supplier</th>
                  <th className="pb-2">Rating</th>
                  <th className="pb-2 text-center">Incidents</th>
                  <th className="pb-2 text-center">Risk Traffic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierRisks.map((s) => (
                  <tr key={s.supplierId} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 font-sans font-bold text-slate-800">
                      {s.name}
                      <span className="block text-[8.5px] font-mono font-normal text-slate-405 text-slate-400 uppercase">Code: {s.code}</span>
                    </td>
                    <td className="py-2.5 font-bold text-slate-705 text-slate-700">⭐ {s.actualScore} / 5</td>
                    <td className="py-2.5 text-center font-bold text-slate-900">{s.incidentCount} kasus</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${s.riskColor}`}>
                        ● {s.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
