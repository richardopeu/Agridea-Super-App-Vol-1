/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sliders,
  DollarSign,
  Activity,
  Wrench,
  FileText,
  Shield,
  FileDown,
  Play,
  RotateCcw,
  PlusSquare,
  Users,
  CheckSquare,
  ClipboardList,
  Flame,
  Award,
  Factory,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import GeminiChatbot from './GeminiChatbot';

interface AIExecutiveAdvisorProps {
  state: any;
  logActivity: (module: string, desc: string) => void;
  currentUser: any;
}

interface ActionPlanItem {
  id: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  owner: string;
  factory: 'MPD' | 'SSP' | 'KKI' | 'AGDN' | 'JKT';
  dueDate: string;
  status: 'Open' | 'Overdue' | 'Completed';
  progress: number;
  evidence: string;
}

export default function AIExecutiveAdvisor({ state, logActivity, currentUser }: AIExecutiveAdvisorProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'briefing' | 'simulation' | 'scorecard' | 'tracker' | 'boardpack' | 'chat'>('briefing');
  const [briefingInterval, setBriefingInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Simulation params
  const [simDemandChange, setSimDemandChange] = useState<number>(0); // -30% to +30%
  const [simYieldChange, setSimYieldChange] = useState<number>(0);   // -10% to +10%
  const [simPriceChange, setSimPriceChange] = useState<number>(0);   // -15% to +15%
  const [simSupplierFail, setSimSupplierFail] = useState<boolean>(false);
  const [simMachineBreakdown, setSimMachineBreakdown] = useState<boolean>(false);
  const [simLaborShortage, setSimLaborShortage] = useState<boolean>(false);

  // Action Tracker State
  const [actionList, setActionList] = useState<ActionPlanItem[]>([
    {
      id: 'ACT-001',
      action: 'Transfer support pouch inventory dari JKT ke Cikarang (AGDN)',
      priority: 'High',
      owner: 'Stefanus (Logistics Coordinator)',
      factory: 'AGDN',
      dueDate: '2026-06-12',
      status: 'Open',
      progress: 35,
      evidence: ''
    },
    {
      id: 'ACT-002',
      action: 'Kalibrasi dan pembersihan vacuum heater oli filter pada mesin VF-02',
      priority: 'High',
      owner: 'Slamet (Maintenance Lead)',
      factory: 'MPD',
      dueDate: '2026-06-09',
      status: 'Overdue',
      progress: 10,
      evidence: 'Spareparts sedang diimpor'
    },
    {
      id: 'ACT-003',
      action: 'Uji klinis ulang kandungan kelembapan input nangka dari Mitra Dampit',
      priority: 'Medium',
      owner: 'Dian Sastro (QC Lead)',
      factory: 'SSP',
      dueDate: '2026-06-15',
      status: 'Open',
      progress: 0,
      evidence: ''
    },
    {
      id: 'ACT-004',
      action: 'Evaluasi target kemasan harian lini kemas toples Cikarang',
      priority: 'Low',
      owner: 'Rina Herawati (Packaging Ops)',
      factory: 'AGDN',
      dueDate: '2026-06-03',
      status: 'Completed',
      progress: 100,
      evidence: 'SOP target baru telah ditandatangani di portal'
    }
  ]);

  // Export board meeting loading effects
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Computed state details from real transactions
  const systemReportCalculations = useMemo(() => {
    const pOrders = state.purchaseOrders || [];
    const salesList = state.sales || [];
    const batches = state.batches || [];
    const peeled = state.peelingLogs || [];
    const qcs = state.qcLogs || [];
    
    // Revenue aggregates
    const actualRevenue = salesList.reduce((acc: number, item: any) => acc + (item.totalPenjualan || 0), 0) || 124800000;
    const actualPOValue = pOrders.reduce((acc: number, item: any) => {
      const itPrice = item.items?.reduce((sAcc: number, sub: any) => sAcc + (sub.totalHarga || 0), 0) || 0;
      return acc + itPrice;
    }, 0) || 82100000;

    const completedBatchesCount = batches.filter((b: any) => b.status === 'Completed').length;
    const avgYieldPercent = peeled.length > 0 
      ? peeled.reduce((acc: number, item: any) => acc + (item.yieldPercent || 0), 0) / peeled.length 
      : 61.8;

    const qcRejectsCount = qcs.reduce((acc: number, item: any) => acc + (item.rejectKg || 0), 0) || 124;

    return {
      actualRevenue,
      actualPOValue,
      completedBatchesCount,
      avgYieldPercent,
      qcRejectsCount
    };
  }, [state]);

  // Add recommendations to actionable tracker
  const handleAddToActionTracker = (actionText: string, factory: 'MPD' | 'SSP' | 'KKI' | 'AGDN' | 'JKT', priority: 'High' | 'Medium' | 'Low', owner: string) => {
    const today = new Date();
    const plusWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const newItem: ActionPlanItem = {
      id: `ACT-00${actionList.length + 1}`,
      action: actionText,
      priority,
      owner,
      factory,
      dueDate: plusWeek,
      status: 'Open',
      progress: 0,
      evidence: ''
    };

    setActionList(prev => [newItem, ...prev]);
    logActivity('AI Action Tracker', `Converted recommendation: "${actionText}" into a tasks card.`);
    alert(`Rekomendasi berhasil dikonversi ke Action Plan! Silakan tinjau tab Action Tracker.`);
  };

  const handleUpdateStatusAndProgress = (id: string, step: number, status: 'Open' | 'Overdue' | 'Completed') => {
    setActionList(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, progress: step, status: step === 100 ? 'Completed' : status };
      }
      return a;
    }));
  };

  const updateEvidence = (id: string, txt: string) => {
    setActionList(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, evidence: txt };
      }
      return a;
    }));
  };

  // What-If Simulation Calculus Model
  const simResult = useMemo(() => {
    // Baseline state parameters
    const basePcs = 14500;
    const baseUnitCost = 5400; // Rp
    const baseSalesRevenue = systemReportCalculations.actualRevenue;
    const baseCostOfGoods = baseSalesRevenue * 0.58; 
    const baseGrossMargin = baseSalesRevenue - baseCostOfGoods;

    // Apply simulation modifiers logically
    let prodMultiplier = 1 + (simYieldChange / 100);
    let inventoryMultiplier = 1 - (simDemandChange / 100) + (simYieldChange / 100);
    let unitCostMultiplier = 1 - (simYieldChange * 0.05 / 100); // Higher yield reduces unit cost

    if (simSupplierFail) {
      prodMultiplier *= 0.7; // 30% production loss
      inventoryMultiplier *= 0.65;
      unitCostMultiplier *= 1.15; // Material urgency pricing
    }
    if (simMachineBreakdown) {
      prodMultiplier *= 0.82; // 18% capacity loss
      unitCostMultiplier *= 1.08;
    }
    if (simLaborShortage) {
      prodMultiplier *= 0.88; // 12% labor constraint loss
      unitCostMultiplier *= 1.1; // Overtime premiums
    }

    const simulatedValRevenue = Math.round(baseSalesRevenue * (1 + simDemandChange / 100) * (1 + simPriceChange / 100));
    const simulatedProductionPcs = Math.round(basePcs * prodMultiplier);
    const simulatedInventoryKg = Math.max(200, Math.round(4800 * inventoryMultiplier));
    const simulatedCostOfGoods = Math.round(simulatedValRevenue * 0.58 * unitCostMultiplier);
    const simulatedGrossMargin = simulatedValRevenue - simulatedCostOfGoods;
    const profitImpactPercent = ((simulatedGrossMargin - baseGrossMargin) / baseGrossMargin) * 100;

    return {
      productionPcs: simulatedProductionPcs,
      inventoryKg: simulatedInventoryKg,
      costOfGoods: simulatedCostOfGoods,
      revenueVal: simulatedValRevenue,
      grossMarginPct: simulatedValRevenue > 0 ? (simulatedGrossMargin / simulatedValRevenue) * 100 : 0,
      profitImpactPercent
    };
  }, [simDemandChange, simYieldChange, simPriceChange, simSupplierFail, simMachineBreakdown, simLaborShortage, systemReportCalculations]);

  // Strategic KPI Scorecard Builder
  const scorecardCalculations = useMemo(() => {
    // Categories and rating breakdown
    const ratings = [
      { category: 'Financial', score: 86, subtext: 'Gross & net margin targets satisfied' },
      { category: 'Operational', score: 79, subtext: 'MPD peeling efficiency warning' },
      { category: 'Supply Chain', score: 72, subtext: 'AGDN package stock depletion risk' },
      { category: 'Quality Safety', score: 95, subtext: 'Pass rate 100% compliant' },
      { category: 'Human Resource', score: 84, subtext: 'Borongan wages payout automated' },
      { category: 'Innovation ops', score: 80, subtext: 'Dewatering process automation pilot' },
      { category: 'HACCP Compliance', score: 98, subtext: 'No active critical compliance issues' }
    ];

    const overallScore = Math.round(ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length);
    
    let label = 'Warning';
    let labelColor = 'text-amber-400 bg-amber-950/40 border-amber-800';
    if (overallScore >= 90) {
      label = 'Excellent';
      labelColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
    } else if (overallScore >= 80) {
      label = 'Good';
      labelColor = 'text-indigo-400 bg-indigo-950/40 border-indigo-800';
    } else if (overallScore < 70) {
      label = 'Critical';
      labelColor = 'text-rose-400 bg-rose-950/40 border-rose-800';
    }

    return {
      ratings,
      overallScore,
      label,
      labelColor
    };
  }, []);

  const triggerExportSimulation = (type: 'PDF' | 'Excel' | 'PowerPoint' | 'Word') => {
    setExportingType(type);
    logActivity('Board Meeting Pack', `Exporting slide deck to: ${type}`);
    setTimeout(() => {
      setExportingType(null);
      alert(`Sukses mengekspor Board Meeting Pack ke format: ${type}! Berkas siap diunduh.`);
    }, 1800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col min-h-[750px] overflow-hidden text-slate-100" id="executive-advisor">
      
      {/* Header bar */}
      <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded bg-amber-500/10 text-amber-400 font-sans text-[10px] uppercase font-bold tracking-wider border border-amber-500/20">
              BOARD ADVISORY DESK
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              Dynamic Advisory Engine
            </span>
          </div>
          <h2 className="text-xl font-bold font-display mt-1 text-white tracking-tight flex items-center gap-2">
            👑 AI Executive Advisor (Virtual COO &amp; CFO)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Menganalisis anomali, melakukan proyeksi what-if komprehensif, mengelola strategic scorecard, dan menyusun andalan Board Meeting Pack otomatis.
          </p>
        </div>

        {/* Global Business Health Gauge */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-2 px-4 rounded-xl border border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400 font-mono text-right uppercase">Overall Health Score</p>
            <div className="flex items-center gap-1.5 mt-0.5 justify-end">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${scorecardCalculations.labelColor}`}>
                {scorecardCalculations.label}
              </span>
              <span className="text-xl font-black text-white font-mono">{scorecardCalculations.overallScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Link tabs inside advisor module */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 overflow-x-auto">
        {[
          { id: 'briefing', label: '📰 Executive Briefing Desk', icon: FileText },
          { id: 'chat', label: '🤖 Gemini Multi-Turn AI & Grounding', icon: Brain },
          { id: 'simulation', label: '🎛️ What-If Simulator', icon: Sliders },
          { id: 'scorecard', label: '🎯 Strategic Scorecard', icon: Award },
          { id: 'tracker', label: '✅ AI Action Tracker', icon: CheckSquare },
          { id: 'boardpack', label: '📂 Board Meeting Pack', icon: ClipboardList }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold select-none border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400 bg-slate-900/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/10'
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab panels */}
      <div className="p-6 flex-1 bg-slate-900/35 overflow-y-auto max-h-[820px]">
        
        {/* ==================== TAB 1: EXECUTIVE BRIEFING DESK ==================== */}
        {activeTab === 'briefing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-950 p-1 rounded-lg border border-slate-850 max-w-sm">
              {[
                { id: 'daily', label: '📅 Daily Briefing' },
                { id: 'weekly', label: '📅 Weekly Review' },
                { id: 'monthly', label: '📅 Monthly Executive Report' }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setBriefingInterval(b.id as any)}
                  className={`flex-1 py-1.5 px-3 rounded text-center transition-all text-xs font-semibold ${
                    briefingInterval === b.id 
                      ? 'bg-amber-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* DYNAMIC REPORTS SELECTOR */}
            {briefingInterval === 'daily' && (
              <div className="space-y-6 animate-fade-in">
                {/* Daily layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Problems Card */}
                  <div className="bg-rose-950/15 border border-rose-900/40 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-rose-300 text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Flame className="w-4 h-4 text-rose-450" />
                      Top 3 Critical Operational Problems
                    </h4>
                    <div className="space-y-3.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-rose-400 font-bold">#1</span>
                        <div>
                          <p className="font-semibold text-white">WIP Buffer Kritis di Wonosobo (MPD)</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Sisa bahan beku apel hanya mendukung proses penggorengan selama 4 hari operasional.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-rose-400 font-bold">#2</span>
                        <div>
                          <p className="font-semibold text-white">Kemasan Pouch di Cikarang (AGDN) Kritis</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Standing pouch 100g diproyeksi stockout dalam 7 hari jika laju packaging stabil.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-rose-400 font-bold">#3</span>
                        <div>
                          <p className="font-semibold text-white">Deviasi Yield Kupas SSP (Sipahutar)</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Yield kupas nanas madu anjlok ke {(systemReportCalculations.avgYieldPercent * 0.95).toFixed(1)}% akibat kandungan air yang tidak di-curing.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opportunities Card */}
                  <div className="bg-emerald-950/15 border border-emerald-900/40 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
                      <TrendingUp className="w-4 h-4 text-emerald-450" />
                      Top 3 Operational Opportunities
                    </h4>
                    <div className="space-y-3.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-emerald-400 font-bold">#1</span>
                        <div>
                          <p className="font-semibold text-white">Koperasi Tani Batu (SUP-01) Konsisten Grade A</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Hasil kupasan penolong mencatat grade A stabil &gt;85% dibanding pemasok sekunder.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-emerald-400 font-bold">#2</span>
                        <div>
                          <p className="font-semibold text-white">Lonjakan Permintaan Keripik Nanas +18%</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Data checkout distributor menandakan permintaan retail melompat di wilayah timur regional.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-emerald-400 font-bold">#3</span>
                        <div>
                          <p className="font-semibold text-white">Utilisasi Mesin Jakarta Branch (KKI) Sentuh 82%</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tungku penggorengan cadangan siap dikerahkan untuk batch tambahan nangka.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priorities Card */}
                  <div className="bg-amber-950/15 border border-amber-900/40 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-amber-450" />
                      Top 3 Strategic Action Priorities
                    </h4>
                    <div className="space-y-3.5 text-xs text-slate-300 font-sans">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-amber-400 font-bold">#1</span>
                        <div>
                          <p className="font-semibold text-white">Perbanyak Purchasing dari Supplier Utama</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Keluarkan PO logistik buah ke SUP-01 Batu demi kestabilan rendemen harian.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-amber-400 font-bold">#2</span>
                        <div>
                          <p className="font-semibold text-white">Relokasi/Transfer Pouch SCM Urgent</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Kirim 5,000 Pcs pouch saringan pembungkus kosong dari HQ JKT ke Cikarang (AGDN) besok siang.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-amber-400 font-bold">#3</span>
                        <div>
                          <p className="font-semibold text-white">Jadwal Kalibrasi Frying VF-02 MPD</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Sisipkan downtime pemeliharaan heater sensor vakum saringan oli 3 jam sebelum shift malam.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* DECISION SUPPORT ENGINE: RECOMMENDATIONS */}
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Brain className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">🧠 Operational Decision Support Recommendation Engine</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Rekomendasi yang diprovokasi oleh algoritma SCM. Klik tombol untuk mengkonversinya langsung menjadi tugas.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        action: 'Naikkan volume pengadaan buah nangka segar dari Supplier SUP-01 sebesar 20%',
                        factory: 'SSP' as const,
                        priority: 'High' as const,
                        owner: 'Stefanus (Logistics)',
                        details: 'Menghindari resiko keterlambatan panen lokal dan mengamankan baseline supply rate.'
                      },
                      {
                        action: 'Transfer darurat 5,000 pouch kemasan dari Jakarta HQ ke Cikarang (AGDN)',
                        factory: 'AGDN' as const,
                        priority: 'High' as const,
                        owner: 'Rina Herawati (Packaging)',
                        details: 'Mengatasi proyeksi kehabisan stok pembungkus saringan packing pouch dalam 7 hari.'
                      },
                      {
                        action: 'Kurangi laju produksi keripik salak reguler akibat de-stoning cost tinggi',
                        factory: 'MPD' as const,
                        priority: 'Low' as const,
                        owner: 'Slamet (Operations)',
                        details: 'Menjaga margin kotor standar di Wonosobo dengan menaikkan fokus pengupasan apel.'
                      },
                      {
                        action: 'Sewa vacuum fryer baru di lokasi Wonosobo (MPD) dalam jangka waktu 90 hari',
                        factory: 'MPD' as const,
                        priority: 'Medium' as const,
                        owner: 'Richardo (HQ Director)',
                        details: 'Mengalihkan kelebihan WIP dan mengoptimalkan return modal dewatering daerah.'
                      }
                    ].map((rec, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold uppercase tracking-tight">{rec.priority}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono font-bold uppercase tracking-tight">{rec.factory}</span>
                        </div>
                        <div className="space-y-1.5 pr-14 select-none">
                          <h5 className="font-bold text-white text-xs">{rec.action}</h5>
                          <p className="text-[10px] text-slate-400 leading-normal">{rec.details}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                          <span className="text-[9px] text-slate-500 font-mono">Owner target: {rec.owner}</span>
                          <button
                            onClick={() => handleAddToActionTracker(rec.action, rec.factory, rec.priority, rec.owner)}
                            className="p-1 px-2.5 rounded bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white transition-all text-[10px] uppercase font-mono font-black"
                          >
                            ⚡ Convert to Action Tracker
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* WEEKLY MANAGEMENT REVIEW */}
            {briefingInterval === 'weekly' && (
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-5 animate-fade-in text-xs font-sans">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-sm">📅 Automated Weekly Management Review Dashboard</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Laporan pengawasan mingguan dikompilasikan dari total log produksi &amp; audit database.</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Periode: Minggu ini (Updated)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl">
                    <p className="text-slate-450 uppercase text-[9px] tracking-wider font-mono">Production Summary</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">{systemReportCalculations.completedBatchesCount} Batches Completed</p>
                    <p className="text-[9.5px] text-slate-500 mt-1">Mengoreng buah nangka &amp; apel segar</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl">
                    <p className="text-slate-450 uppercase text-[9px] tracking-wider font-mono">Procurement Summary</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">Rp {systemReportCalculations.actualPOValue.toLocaleString('id-ID')}</p>
                    <p className="text-[9.5px] text-slate-500 mt-1">Total PO purchasing disetujui</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl">
                    <p className="text-slate-450 uppercase text-[9px] tracking-wider font-mono">Financial Summary</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">Rp {systemReportCalculations.actualRevenue.toLocaleString('id-ID')}</p>
                    <p className="text-[9.5px] text-slate-500 mt-1">Volume invoice toko terbit</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl">
                    <p className="text-slate-450 uppercase text-[9px] tracking-wider font-mono">Quality Summary</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">{systemReportCalculations.avgYieldPercent.toFixed(1)}% Avg Yield</p>
                    <p className="text-[9.5px] text-rose-400 mt-1">⚠️ {systemReportCalculations.qcRejectsCount} Kg reject terakumulasi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-2">
                    <h4 className="font-bold text-white text-xs">🏭 Multi-Factory Utilization Summary</h4>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• **MPD Wonosobo**: Lini kupas membebani sisa blast freezer. Memerlukan penyeimbangan transisi shift.</li>
                      <li>• **SSP Sipahutar Factory**: Rendemen peeler nangka madu stabil di level 61.2% tetapi pasokan pisang masih minim.</li>
                      <li>• **AGDN Cikarang Facility**: Pouch running out warning. Mesin packaging toples beroperasi stabil tanpa deviasi berat.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-2">
                    <h4 className="font-bold text-white text-xs">🚚 Supplier SCM Intelligence Summary</h4>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• **SUP-01 Batu**: Pemasok buah utama mencetak standard deviasi devidence tertinggi dengan rating pass 100%.</li>
                      <li>• **SUP-02 Dampit**: Distribusi transit terkendala cuaca buruk Dieng, menghambat lead time pengiriman pisang hingga ±1.8 hari.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* MONTHLY REPORT VIEW */}
            {briefingInterval === 'monthly' && (
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-5 animate-fade-in text-xs font-sans max-w-4xl mx-auto">
                <div className="border-b border-slate-800 pb-4 text-center">
                  <h3 className="text-white font-black text-base uppercase tracking-wider font-display font-black">MONTHLY OPERATIONS EXECUTIVE REPORT</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">AI Automated Compilation &bull; Confirmed and Generated</p>
                </div>

                <div className="space-y-4 text-slate-300 leading-relaxed text-xs">
                  <div>
                    <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> I. Executive Summary
                    </h4>
                    <p className="mt-2 text-justify">
                      Kinerja operasional Agridea pada bulan peninjauan berjalan dengan stabil pada standar gross margin **44.0%**. Utilisasi mesin vacuum frying di MPD Wonosobo berkinerja pada level optimum harian, didorong penyetujuan form borongan lancar. Di sisi lain, saringan keselamatan mendeteksi ancaman kritis stockout pembungkus Standing Pouch di unit Cikarang (AGDN) dalam waktu 7 hari ke depan. Tindakan alokasi relokasi transit pouch dari JKT sangat disarankan segera.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> II. Key Achievements
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                      <li>**Pencapaian Volume**: Menyelesaikan total **{systemReportCalculations.completedBatchesCount}** batch penggorengan nangka beku.</li>
                      <li>**Inovasi Borongan**: Slip kalkulasi borongan tim peeling sepenuhnya tuntas terhitung secara dinamis.</li>
                      <li>**Lini HACCP**: Nihil insiden kontaminasi fisik/logam terdeteksi di ruang pengepakan utama.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider text-rose-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> III. Key Challenges &amp; Root Causes
                    </h4>
                    <ul className="list-disc pl-4 space-y-1.5 mt-2">
                      <li>
                        **Penyusutan Rendemen Apel**: Rendemen peel berfluktuasi tipis di Wonosobo.
                        <p className="text-[10.5px] text-slate-450 italic mt-0.5">&bull; Root Cause: Ketergantungan pada panen lokal luar di kala curah hujan tinggi tanpa curing.</p>
                      </li>
                      <li>
                        **Kendala Lead-Time Supplier SUP-02**: Penurunan ketepatan hantaran logistik.
                        <p className="text-[10.5px] text-slate-450 italic mt-0.5">&bull; Root Cause: Kerusakan armada logistik supplier sekunder dan infrastruktur jalan regional.</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white uppercase text-[11px] font-mono tracking-wider text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" /> IV. Strategic Priorities &bull; AI Action Plans
                    </h4>
                    <ol className="list-decimal pl-4 space-y-1 mt-2 font-semibold text-slate-200">
                      <li>Relokasi pouch pembungkus darurat 5,000 unit dari JKT ke Cikarang (AGDN).</li>
                      <li>Alihkan pesanan buah sekunder ke Koperasi Tani Batu (SUP-01).</li>
                      <li>Kalibrasi sensor panas sensor suhu oli penggorengan vacuum frying MPD.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800 gap-3">
                  <button
                    onClick={() => logActivity('Monthly Report Print', 'Initiated printer layout for monthly report')}
                    className="p-1.5 px-3 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  >
                    🖨️ Print Report Panel
                  </button>
                  <button
                    onClick={() => alert('Laporan PDF bulanan berhasil dikompilasi!')}
                    className="p-1.5 px-4 rounded bg-amber-600 hover:bg-amber-500 font-bold transition-all text-white flex items-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4" /> Download PDF Report
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 2: WHAT-IF SIMULATOR ==================== */}
        {activeTab === 'simulation' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  🎛️ Real-Time What-If Executive Operations Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1">Lakukan penyetelan pada slider variabel di luar atau aktifkan flag kejadian kritis di bawah ini untuk melihat estimasi dampak finansial, profit, &amp; cost margin kotor perusahaan.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sliders and Toggles Control Deck */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="font-bold text-amber-400 text-xs font-mono uppercase">Simulation Controls</span>
                    <button
                      onClick={() => {
                        setSimDemandChange(0);
                        setSimYieldChange(0);
                        setSimPriceChange(0);
                        setSimSupplierFail(false);
                        setSimMachineBreakdown(false);
                        setSimLaborShortage(false);
                        logActivity('Simulator', 'Reset what-if parameters to baseline.');
                      }}
                      className="p-1 text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Controls
                    </button>
                  </div>

                  {/* Range inputs */}
                  <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-semibold">Demand Shift (%)</span>
                        <span className={`font-mono font-bold ${simDemandChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {simDemandChange >= 0 ? `+${simDemandChange}` : simDemandChange}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        value={simDemandChange}
                        onChange={(e) => setSimDemandChange(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-semibold">Rendemen / Yield Shift (%)</span>
                        <span className={`font-mono font-bold ${simYieldChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {simYieldChange >= 0 ? `+${simYieldChange}` : simYieldChange}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        value={simYieldChange}
                        onChange={(e) => setSimYieldChange(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-semibold">Price Adjustment (%)</span>
                        <span className={`font-mono font-bold ${simPriceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {simPriceChange >= 0 ? `+${simPriceChange}` : simPriceChange}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-15"
                        max="15"
                        value={simPriceChange}
                        onChange={(e) => setSimPriceChange(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Incident Toggles */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-850 text-xs">
                    <span className="text-[10px] text-slate-450 uppercase font-bold font-mono tracking-wider block">Risk Event Flags (Toggles)</span>
                    
                    <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 cursor-pointer select-none">
                      <div>
                        <p className="font-semibold text-slate-200">Mitra Supplier Failure</p>
                        <p className="text-[9.5px] text-rose-400/80 mt-0.5">-30% production volume</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={simSupplierFail}
                        onChange={(e) => setSimSupplierFail(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 cursor-pointer select-none">
                      <div>
                        <p className="font-semibold text-slate-200">Vacuum Fryer Breakdown</p>
                        <p className="text-[9.5px] text-rose-400/80 mt-0.5">-18% frying bottleneck</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={simMachineBreakdown}
                        onChange={(e) => setSimMachineBreakdown(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 cursor-pointer select-none">
                      <div>
                        <p className="font-semibold text-slate-200">Operator Labor Shortage</p>
                        <p className="text-[9.5px] text-rose-400/80 mt-0.5">-12% peeling throughput</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={simLaborShortage}
                        onChange={(e) => setSimLaborShortage(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Simulation Output metrics */}
                <div className="lg:col-span-2 bg-slate-900 p-5 rounded-xl border border-slate-850 flex flex-col justify-between font-sans">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs font-mono uppercase border-b border-slate-850 pb-2">Simulated Projective Impact Results</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                      
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <span className="text-slate-450 block uppercase text-[8.5px] font-mono">EST REVENUE POTENTIAL</span>
                        <span className="text-sm font-black text-white mt-1.5 block font-mono">Rp {simResult.revenueVal.toLocaleString('id-ID')}</span>
                        <span className={`text-[10px] mt-1 block font-mono ${simDemandChange + simPriceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {simDemandChange + simPriceChange >= 0 ? '📈 Kenaikan demand/harga' : '📉 Penyusutan volume'}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <span className="text-slate-450 block uppercase text-[8.5px] font-mono">SIMULATED PRODUCTION SIZE</span>
                        <span className="text-sm font-black text-white mt-1.5 block font-mono">{simResult.productionPcs.toLocaleString()} Pcs</span>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">Volume kemas layak kemas</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <span className="text-slate-450 block uppercase text-[8.5px] font-mono">SIMULATED BUFFER STOCK</span>
                        <span className="text-sm font-black text-white mt-1.5 block font-mono">{simResult.inventoryKg.toLocaleString()} Kg</span>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">Raw fruit + WIP beku beku</span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <span className="text-slate-450 block uppercase text-[8.5px] font-mono">SIMULATED EST COST OF GOODS (COGS)</span>
                        <span className="text-sm font-black text-white mt-1.5 block font-mono">Rp {simResult.costOfGoods.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] text-slate-450 mt-1 block font-mono">Margin Kotor: {simResult.grossMarginPct.toFixed(1)}%</span>
                      </div>

                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 mt-5 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-450 font-mono block uppercase">SIMULATED NET PROFIT ACCURACY</span>
                        <span className={`text-base font-black font-mono block mt-1 ${simResult.profitImpactPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {simResult.profitImpactPercent >= 0 ? `+${simResult.profitImpactPercent.toFixed(1)}%` : `${simResult.profitImpactPercent.toFixed(1)}%`} Profit Change
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-tight ${
                        simResult.profitImpactPercent >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {simResult.profitImpactPercent >= 0 ? '🌟 Positive Outlook' : '⚠️ Under Threat'}
                      </span>
                    </div>

                    <div className="text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-850 leading-relaxed text-slate-350">
                      {simResult.profitImpactPercent < 0 ? (
                        <p className="flex items-start gap-1 text-rose-300">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          Simulasi menunjukkan intervensi urgensi diperlukan. Margin kotor terhimpit akibat naiknya unit cost bahan baku sekunder dan bottleneck fryer. Segera alihkan PO buah ke SUP-01 Batu untuk menyeimbangkan yield.
                        </p>
                      ) : (
                        <p className="flex items-start gap-1 text-emerald-300">
                          <CheckSquare className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                          Apresiasi performa tinggi. Parameter yang diterapkan mendorong pengembalian laba optimal (+{simResult.profitImpactPercent.toFixed(1)}% gain) dan meminimalisir waste logistik.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: STRATEGIC SCORECARD ==================== */}
        {activeTab === 'scorecard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Strategic Corporate Balanced KPI Scorecard
                </h3>
                <p className="text-xs text-slate-400 mt-1">Sistem merangkum kinerja keuangan, pencapaian produksi, rantai pasok supplier, kepatuhan HACCP dan efisiensi borongan harian.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Scorecard Table items */}
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full text-left text-xs divide-y divide-slate-850">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[9px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Perspective Pillar</th>
                        <th className="py-2.5 px-3 text-center">Standard Rank</th>
                        <th className="py-2.5 px-3">Status Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-950">
                      {scorecardCalculations.ratings.map((perspective, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-200 block">{perspective.category} Perspective</span>
                            <span className="text-[10px] text-slate-450 block mt-0.5">{perspective.subtext}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                              perspective.score >= 90 ? 'text-emerald-400 bg-emerald-950' :
                              perspective.score >= 80 ? 'text-indigo-400 bg-indigo-950' :
                              'text-amber-400 bg-amber-950'
                            }`}>
                              {perspective.score}/100
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            {perspective.score >= 90 ? '🟢 Excellent' : perspective.score >= 80 ? '🔵 Good' : '🟡 Warning'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Radar chart representation */}
                <div className="bg-slate-900 rounded-xl border border-slate-850 p-4 h-[300px] flex items-center justify-center" id="scorecard-chart-radar">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scorecardCalculations.ratings}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                      <Radar name="Agridea Health perspective" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: AI ACTION TRACKER ==================== */}
        {activeTab === 'tracker' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    AI Action Tracker &bull; Corporate Task Allocator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Pantau, sunting progress, dan kumpulkan laporan bukti dari penugasan tindakan perbaikan (mitigasi).</p>
                </div>

                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-slate-400 font-semibold uppercase">
                    Open: <span className="text-emerald-400 font-bold">{actionList.filter(a => a.status === 'Open').length}</span>
                  </span>
                  <span className="text-slate-400 font-semibold uppercase">
                    Overdue: <span className="text-rose-400 font-bold">{actionList.filter(a => a.status === 'Overdue').length}</span>
                  </span>
                  <span className="text-slate-400 font-semibold uppercase">
                    Completed: <span className="text-indigo-400 font-bold">{actionList.filter(a => a.status === 'Completed').length}</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg">
                <table className="w-full text-left text-xs divide-y divide-slate-800">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[9px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Task ID &amp; Remedial Action</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3">Owner Assigned</th>
                      <th className="py-2.5 px-3 text-center">Factory Unit</th>
                      <th className="py-2.5 px-3 text-center">Due Date</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Progress %</th>
                      <th className="py-2.5 px-3">Evidence Submission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-950 font-sans">
                    {actionList.map((action) => (
                      <tr key={action.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono text-[9px] text-slate-500 block">[{action.id}]</span>
                          <span className="font-semibold text-white block mt-0.5">{action.action}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] text-center font-bold ${
                            action.priority === 'High' ? 'bg-rose-950 text-rose-300' :
                            action.priority === 'Medium' ? 'bg-amber-950 text-amber-300' :
                            'bg-emerald-950 text-emerald-300'
                          }`}>
                            {action.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{action.owner}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">{action.factory}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{action.dueDate}</td>
                        <td className="py-3 px-3 text-center">
                          <select
                            value={action.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              handleUpdateStatusAndProgress(action.id, newStatus === 'Completed' ? 100 : action.progress, newStatus);
                            }}
                            className="bg-slate-900 text-slate-200 border border-slate-800 rounded p-1 text-[10px] focus:outline-none"
                          >
                            <option value="Open">Open</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col items-center gap-1.5 w-24 mx-auto text-[10px]">
                            <span className="font-mono font-bold text-slate-300">{action.progress}%</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={action.progress}
                              onChange={(e) => {
                                const step = parseInt(e.target.value);
                                handleUpdateStatusAndProgress(action.id, step, step === 100 ? 'Completed' : action.status);
                              }}
                              className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="text"
                            value={action.evidence}
                            onChange={(e) => updateEvidence(action.id, e.target.value)}
                            placeholder="Ketik keterangan bukti tindakan..."
                            className="bg-slate-900 border border-slate-800 rounded text-[10px] p-1 px-2 text-slate-200 placeholder-slate-500 focus:outline-none w-full min-w-[120px]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 5: BOARD MEETING PACK ==================== */}
        {activeTab === 'boardpack' && (
          <div className="space-y-6 animate-fade-in text-xs font-sans">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-850 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5 animate-pulse">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    📂 AI Auto-Generated Board Meeting Package Builder
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Esklusif untuk Direksi. Sistem mengunduh logs, yield korelasi kotor, peta risiko, dan strategic scoreboard harian ke dokumen presentasi formal.</p>
                </div>

                <div className="flex gap-2">
                  {['PDF', 'Excel', 'PowerPoint', 'Word'].map((fmt) => (
                    <button
                      key={fmt}
                      disabled={exportingType !== null}
                      onClick={() => triggerExportSimulation(fmt as any)}
                      className="p-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg font-bold transition-all text-[11px] uppercase font-mono flex items-center gap-1 shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      {exportingType === fmt ? `Exporting...` : fmt}
                    </button>
                  ))}
                </div>
              </div>

              {exportingType && (
                <div className="p-3 bg-indigo-950 text-indigo-200 border border-indigo-900 rounded-lg flex items-center gap-2 animate-bounce font-mono">
                  <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                  Mengompilasi transactional data harian ke format presentasi {exportingType}... Mohon tunggu.
                </div>
              )}

              {/* PDF Document Slides representation on UI */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-5 text-slate-300 leading-relaxed text-justify">
                
                {/* Slide 1 indicator */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden select-none">
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded shadow">SLIDE PERSPECTIVE #1</span>
                  <div className="h-2 w-10 bg-emerald-500 rounded" />
                  <h4 className="text-white font-black text-sm uppercase font-display tracking-wide mt-2">Executive Overview &bull; Board Slide</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Presentasi meringkas standard margin kotor **{simResult.grossMarginPct.toFixed(1)}%** yang stabil berkat keberhasilan borongan dewatering dan peeling. Rekomendasi mitigasi difokuskan pada pengembalian keselamatan buffer Standing Pouch kemas (AGDN) lewat stock transfer JKT.
                  </p>
                </div>

                {/* Slide 2 indicator */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden select-none">
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded shadow">SLIDE PERSPECTIVE #2</span>
                  <div className="h-2 w-10 bg-indigo-500 rounded" />
                  <h4 className="text-white font-black text-sm uppercase font-display tracking-wide mt-2">Factory Multi-Index Rank Map</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    **Jakarta HQ (JKT)** menempati posisi puncak efisiensi (Score 95.8) menyusul kestabilan pass test. **Sipahutar Factory (SSP)** mencatat lintasan menanjak optimal dengan average peeling yield **{systemReportCalculations.avgYieldPercent.toFixed(1)}%**.
                  </p>
                </div>

                {/* Slide 3 indicator */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden select-none">
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded shadow">SLIDE PERSPECTIVE #3</span>
                  <div className="h-2 w-10 bg-amber-500 rounded" />
                  <h4 className="text-white font-black text-sm uppercase font-display tracking-wide mt-2">AI Remedial Action Plan Tracking</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tinjauan persetujuan target kemasan Baru (Toples Cikarang) telah **Completed (100%)** disusul pengisian bukti tanda portal. Mitigasi kritis heater VF-02 (Wonosobo) masih berstatus **Overdue** di bawah penanganan Slamet.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB: GEMINI MULTI-TURN AI CHATBOT & SEARCH GROUNDING ==================== */}
        {activeTab === 'chat' && (
          <div className="space-y-4 animate-fade-in">
            <GeminiChatbot state={state} currentUser={currentUser} defaultRole="operations" />
          </div>
        )}

      </div>
    </div>
  );
}
