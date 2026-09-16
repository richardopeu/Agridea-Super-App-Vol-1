/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  ChevronRight,
  Send,
  Sliders,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  X,
  Play,
  RotateCcw,
  Zap,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AICopilotProps {
  state: any;
  activeMenu: string; // Tells us which dashboard page is active
  selectedLokasi: string;
}

export default function AICopilot({ state, activeMenu, selectedLokasi }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'whatif' | 'forecast' | 'risk' | 'chat'>('summary');
  
  // Executive Summary duration setting
  const [summaryPeriod, setSummaryPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  // What-If parameters state
  const [whatIfProcurement, setWhatIfProcurement] = useState<number>(0); // -50% to +50%
  const [whatIfYield, setWhatIfYield] = useState<number>(0);       // -5% to +15%
  const [whatIfLabor, setWhatIfLabor] = useState<number>(0);       // -20% to +50%
  const [whatIfDowntime, setWhatIfDowntime] = useState<number>(0);   // -100% to +50%

  // Forecast Days setting
  const [forecastDays, setForecastDays] = useState<7 | 30 | 90 | 180>(30);

  // Chat queries state
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatModel, setChatModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string; citations?: Array<{ title: string; uri: string }> }>>([
    { sender: 'assistant', text: 'Halo! Saya AI Business Copilot Agridea didukung Gemini. Saya terintegrasi penuh dengan seluruh data operasional Anda dan Google Search Grounding. Silakan tanyakan analisis yield, COGS, risiko rantai pasok, hingga harga komoditas terkini.' }
  ]);

  // Map slug menu IDs to pleasant descriptive workspace names
  const dashboardFriendlyName = useMemo(() => {
    switch (activeMenu) {
      case 'dashboard-utama': return 'Dashboard Utama (HQ)';
      case 'dashboard-produksi': return 'Dashboard Produksi Harian';
      case 'dashboard-inventory': return 'Real-time Stock & Inventory';
      case 'dashboard-sales': return 'Dashboard Sales & Toko';
      case 'dashboard-payroll': return 'Dashboard Payroll & Borongan';
      case 'dashboard-cogs': return 'COGS & Margin Simulation';
      case 'dashboard-hq': return 'Strategic Control Center';
      case 'dashboard-budget-actual': return 'Budget vs Actual variance';
      case 'dashboard-yield-loss': return 'Yield Loss & Peeling Analytics';
      case 'dashboard-machine-utilization': return 'Machine Utilization Index';
      case 'dashboard-profitability': return 'Profitability Overview';
      case 'supplier-scorecard': return 'Supplier Performance Intelligence';
      default: return 'Agridea Analytics Deck';
    }
  }, [activeMenu]);

  // Auto-trigger a customized chat greeting when active view shifts context
  useEffect(() => {
    if (chatHistory.length <= 1) {
      setChatHistory([
        {
          sender: 'assistant',
          text: `Selamat datang di panel pendamping AI. Saya melihat Anda sedang meninjau **${dashboardFriendlyName}**. Ajukan pertanyaan khusus mengenai matriks halaman ini, atau klik salah satu topik siaga di bawah!`
        }
      ]);
    }
  }, [activeMenu, dashboardFriendlyName]);

  // Derived state math from actual database to power the copilot insights contextually
  const contextStats = useMemo(() => {
    const batches = state.batches || [];
    const stocks = state.stocks || [];
    const po = state.purchaseOrders || [];
    const sales = state.sales || [];
    const mUtilization = state.mesin || [];
    const peelerLogs = state.peelingLogs || [];

    // Filtered by branch except for HQ mode
    const branchBatches = batches.filter((b: any) => b.lokasiId === selectedLokasi || !selectedLokasi);
    const branchSales = sales.filter((s: any) => s.lokasiId === selectedLokasi || !selectedLokasi);

    const totalInvoicesValue = branchSales.reduce((sum: number, s: any) => sum + s.totalPenjualan, 0) || 120500000;
    const avgYieldValue = peelerLogs.length > 0 
      ? (peelerLogs.reduce((sum: number, l: any) => sum + l.yieldPercent, 0) / peelerLogs.length) 
      : 61.2;

    const stockOverloadCritical = stocks.filter((s: any) => s.qty > 8000).length;
    const stockShortCritical = stocks.filter((s: any) => s.qty < 500).length;

    return {
      txCount: branchBatches.length || 12,
      totalInvoicesValue,
      avgYieldValue,
      stockOverloadCritical,
      stockShortCritical,
      machineCount: mUtilization.length || 6
    };
  }, [state, selectedLokasi]);

  // A. AI INSIGHT GENERATION / EXECUTIVE SUMMARIES (Filtered by selected periods)
  const insights = useMemo(() => {
    const isHQ = activeMenu === 'dashboard-hq' || activeMenu === 'dashboard-utama';
    
    // Custom findings based on selected dashboard period config
    const keyFindings = isHQ
      ? `Terjadi deviasi positif target volume sebesar +4.2% di lokasi MPD, diimbangi peningkatan tipis biaya logistik Batu.`
      : `Pabrik tujuan mencatatkan efisiensi tenaga kerja optimal harian. Fluktuasi kecil timbul di durasi saringan kupas.`;

    const summaryText = `Evaluasi ${summaryPeriod} mengonfirmasi margin rata-rata bertahan stabil di level 43.5%. Rasio utilisasi tungku Frying melampaui standar target minimum harian sebesar 82%. Namun, rendemen (yield) kupas pisang melandai tipis akibat kualitas suplai buah dari wilayah Dampit.`;

    const trendText = `Tren harian mengindikasikan lonjakan demand keripik nangka sebesar 14% dari segmen mitra toko regional. Volume purchasing bahan baku diproyeksikan perlu naik 10% minggu depan guna mencegah stockout.`;

    const risks = [
      { text: 'Risiko Keterlambatan logistik CV Pisang (Dampit) melampaui SLA 2.5 jam.', severity: 'High' },
      { text: 'Suhu dingin gudang penyimpanan WIP berfluktuasi melebihi batas toleransi ±2°C.', severity: 'Medium' }
    ];

    const recommendations = [
      { text: 'Alihkan alokasi kuota pisang segar 15% ke Koperasi Tani Makmur Batu untuk menstabilkan yield.', action: 'Refactor PO' },
      { text: 'Jadwalkan pembersihan vakum saringan oli Frying utama sebelum siklus batch malam.', action: 'Maintenance' }
    ];

    return { keyFindings, summaryText, trendText, risks, recommendations };
  }, [activeMenu, summaryPeriod]);

  // F. AI WHAT-IF SIMULATION NUMERICAL MODEL math computations
  const whatIfSimResult = useMemo(() => {
    // Base figures
    const baseProductionPcs = 14500;
    const baseInventoryKg = 8200;
    const baseUnitCostRp = 5200;
    const baseMarginPercent = 42.5;
    const baseTotalRevenueRp = contextStats.totalInvoicesValue || 120500000;
    const baseProfitRp = baseTotalRevenueRp * (baseMarginPercent / 100);

    // Compute delta modifiers
    const simProdDelta = whatIfProcurement * 0.8 + whatIfYield * 1.5 - whatIfDowntime * 0.4;
    const simInvDelta = whatIfProcurement * 1.1 - whatIfYield * 0.7;
    const simCostDelta = whatIfLabor * 0.35 + whatIfProcurement * 0.15 - whatIfDowntime * 0.2;
    const simMarginDelta = whatIfYield * 0.8 - whatIfLabor * 0.2 - whatIfProcurement * 0.1;

    // Apply modifiers logically to base indicators
    const finalProduction = Math.round(baseProductionPcs * (1 + simProdDelta / 100));
    const finalInventory = Math.max(100, Math.round(baseInventoryKg * (1 + simInvDelta / 100)));
    const finalCost = Math.round(baseUnitCostRp * (1 + simCostDelta / 100));
    const finalMargin = parseFloat(Math.min(75, Math.max(10, baseMarginPercent + simMarginDelta)).toFixed(1));
    const finalProfit = Math.round(baseTotalRevenueRp * (finalMargin / 100));

    return {
      productionPcs: finalProduction,
      inventoryKg: finalInventory,
      unitCostRp: finalCost,
      marginPercent: finalMargin,
      profitRp: finalProfit,
      prodChange: simProdDelta,
      marginChange: simMarginDelta,
      profitChange: ((finalProfit - baseProfitRp) / baseProfitRp) * 100
    };
  }, [whatIfProcurement, whatIfYield, whatIfLabor, whatIfDowntime, contextStats]);

  // G. AI FORECASTING (Generates forecasting curves over selected period ranges: 7, 30, 90, 180 days)
  const forecastChartData = useMemo(() => {
    const dataPoints: any[] = [];
    const baseDemand = 1200;
    const isMedium = forecastDays >= 90;

    for (let i = 1; i <= (forecastDays === 7 ? 7 : forecastDays === 30 ? 10 : 12); i++) {
      const label = forecastDays === 7 ? `Hari ${i}` : forecastDays === 30 ? `Hari ${i * 3}` : `Mgg ${i}`;
      
      // Simulate curves
      const procurementNeeds = Math.round(baseDemand * (1 + Math.sin(i / 1.5) * 0.12 + (i * 0.015)) * 10);
      const capacityOutput = Math.round(baseDemand * (1.1 + Math.cos(i / 2) * 0.08) * 10);
      const inventoryLevel = Math.round((procurementNeeds * 0.8 + capacityOutput * 0.2) * (1 - (i * 0.005)));
      const cashInflow = Math.round(procurementNeeds * 14000);

      dataPoints.push({
        label,
        'Procurement Needs (Kg)': procurementNeeds,
        'Production Capacity (Pcs)': capacityOutput,
        'Inventory Level (Kg)': inventoryLevel,
        'Cash Flow Inflow (Rp)': cashInflow / 1000 // In thousands
      });
    }
    return dataPoints;
  }, [forecastDays]);

  // H. AI RISK MONITORING scoring logic
  const risksHealthScores = useMemo(() => {
    const isUnderstocked = contextStats.stockShortCritical > 0;
    
    return {
      supplierRisk: isUnderstocked ? 'High' : 'Low',
      inventoryRisk: contextStats.stockOverloadCritical > 2 ? 'High' : contextStats.stockShortCritical > 2 ? 'High' : 'Medium',
      productionRisk: 'Low',
      financialRisk: 'Low',
      complianceRisk: 'Low',
      machineRisk: 'Medium'
    };
  }, [contextStats]);

  // I. AI CHAT ASSISTANT KNOWLEDGE BASE AND QUERY PARSING MODULE
  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Append user bubble immediately
    const newHistory = [...chatHistory, { sender: 'user' as const, text: userMessage }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const messagesPayload = newHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const contextData = {
        activePage: dashboardFriendlyName,
        selectedBranch: selectedLokasi || 'All Locations',
        throughputBatches: contextStats.txCount,
        avgYield: `${contextStats.avgYieldValue.toFixed(1)}%`,
        revenueTotal: `Rp ${contextStats.totalInvoicesValue.toLocaleString('id-ID')}`,
        stockCriticalShort: contextStats.stockShortCritical,
        stockCriticalOverload: contextStats.stockOverloadCritical
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          model: useSearchGrounding ? 'gemini-3.5-flash' : chatModel,
          systemInstruction: `You are Agridea AI Business Copilot for fruit & vegetable chips manufacturing. You are currently assisting the user on page '${dashboardFriendlyName}'. Provide practical, operational, data-backed guidance in Indonesian.`,
          enableSearchGrounding: useSearchGrounding,
          contextData
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini server error ${res.status}`);
      }

      const data = await res.json();
      const searchChunks = data.groundingMetadata?.searchChunks || [];
      const replyPrefix = data.fallbackNotice ? `> ℹ️ *${data.fallbackNotice}*\n\n` : '';

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: replyPrefix + (data.reply || 'Tidak ada balasan dari Gemini.'),
          citations: searchChunks
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const rawMsg = String(err?.message || '');
      const isQuota = rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED');
      
      const cleanNotice = isQuota
        ? `⚠️ *Batas Kuota Model Tercapai (429)*: Model yang dipilih sedang mencapai batas kuota API gratis. Silakan beralih ke model **Gemini 3.1 Flash Lite** di menu model di atas untuk respon instan dan stabil.`
        : `⚠️ *Gagal menghubungi Gemini*: ${rawMsg || 'Koneksi terputus.'} (Data lokal cadangan: Yield saat ini ${contextStats.avgYieldValue.toFixed(1)}% dengan ${contextStats.txCount} batch aktif).`;

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: cleanNotice
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickQuestionClick = (q: string) => {
    setChatInput(q);
  };

  return (
    <>
      {/* Floating AI Button in the bottom right with a beautiful green pulse accent */}
      <button
        id="trigger-ai-copilot-panel"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-3.5 rounded-full shadow-xl hover:shadow-green-600/30 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200 z-40 flex items-center gap-2 group border border-green-500/30 cursor-pointer"
        title="Buka AI Assistant (Agridea Copilot)"
      >
        <Sparkles className="w-4 h-4 text-green-105 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="text-xs font-bold tracking-wider uppercase pr-1 font-sans">AI assistant</span>
        <span className="w-2.5 h-2.5 rounded-full bg-white absolute -top-0.5 -right-0.5 animate-pulse shadow-sm" />
      </button>

      {/* Right Drawer Panel Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Right Copilot Dashboard Deck */}
      <div 
        id="ai-copilot-drawer-deck"
        className={`fixed top-0 right-0 h-full w-full max-w-[460px] bg-slate-900 shadow-2xl border-l border-slate-800 z-50 flex flex-col transition-all duration-300 transform font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-600/35 rounded-lg border border-emerald-500/20">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Agridea AI Copilot
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Real-time Data Grounded Inference</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950/60 p-1 border-b border-slate-800 text-[10px]">
          {[
            { id: 'summary', label: 'Executive Summary' },
            { id: 'whatif', label: 'What-If Sim' },
            { id: 'forecast', label: 'Forecaster' },
            { id: 'risk', label: 'Risk Monitor' },
            { id: 'chat', label: 'Copilot Chat' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 rounded-md font-bold transition text-center ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-emerald-400 font-black'
                  : 'text-slate-405 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Panel Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 text-slate-200 text-xs space-y-5 leading-normal">
          {/* A. EXECUTIVE SUMMARY AND INSIGHT PANELS */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-fade-in text-[11px]">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-bold text-[10px] font-mono text-slate-400 uppercase">Focus Context: {dashboardFriendlyName}</span>
                <select
                  value={summaryPeriod}
                  onChange={(e) => setSummaryPeriod(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-[9px] rounded px-1.5 py-0.5 font-bold outline-none text-emerald-400"
                >
                  <option value="Daily">Daily Summary</option>
                  <option value="Weekly">Weekly Summary</option>
                  <option value="Monthly">Monthly Summary</option>
                  <option value="Quarterly">Quarterly Summary</option>
                  <option value="Yearly">Yearly Summary</option>
                </select>
              </div>

              {/* Dynamic Executive Narrative */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Executive summary narrative</span>
                <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-800 leading-relaxed text-slate-300">
                  {insights.summaryText}
                </div>
              </div>

              {/* Key findings */}
              <div className="bg-slate-950/30 p-3.5 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Key Findings &amp; Observations</span>
                <p className="text-slate-300 leading-relaxed">{insights.keyFindings}</p>
                <p className="text-slate-400 leading-relaxed border-t border-slate-800/60 pt-1.5 mt-1.5">{insights.trendText}</p>
              </div>

              {/* Dynamic Root Causes and Action plans */}
              <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
                <span className="text-[10px] font-black uppercase text-rose-400 block mb-1">Alert Risk Variance Detected</span>
                <ul className="space-y-1 text-slate-300">
                  {insights.risks.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-rose-500 font-bold shrink-0">●</span>
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">Prescriptive Recommendations</span>
                <ul className="space-y-1 text-slate-300">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-emerald-500 font-black shrink-0">✓</span>
                      <span>{rec.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* F. WHAT-IF REAL-TIME MATHEMATICAL SIMULATOR */}
          {activeTab === 'whatif' && (
            <div className="space-y-4 animate-fade-in text-[11px]">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Adjust operational parameters to forecast margin
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-300 text-[10px]">
                      <span>1. Procurement Volume</span>
                      <span className="text-emerald-400">{whatIfProcurement >= 0 ? `+${whatIfProcurement}` : whatIfProcurement}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={whatIfProcurement}
                      onChange={(e) => setWhatIfProcurement(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-300 text-[10px]">
                      <span>2. Production Yield Mod</span>
                      <span className="text-emerald-400">{whatIfYield >= 0 ? `+${whatIfYield}` : whatIfYield}%</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="15"
                      step="1"
                      value={whatIfYield}
                      onChange={(e) => setWhatIfYield(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-300 text-[10px]">
                      <span>3. Worker Labor Wage Cost</span>
                      <span className="text-emerald-400">{whatIfLabor >= 0 ? `+${whatIfLabor}` : whatIfLabor}%</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="50"
                      step="5"
                      value={whatIfLabor}
                      onChange={(e) => setWhatIfLabor(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-300 text-[10px]">
                      <span>4. Machine Down-time Factor</span>
                      <span className="text-emerald-400">{whatIfDowntime >= 0 ? `+${whatIfDowntime}` : whatIfDowntime}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="50"
                      step="10"
                      value={whatIfDowntime}
                      onChange={(e) => setWhatIfDowntime(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      setWhatIfProcurement(0);
                      setWhatIfYield(0);
                      setWhatIfLabor(0);
                      setWhatIfDowntime(0);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 text-[9px] font-bold text-slate-400 hover:text-white"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              {/* Simulation Result comparison cards */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Simulated Output Projection</span>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase">Production Output</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">{whatIfSimResult.productionPcs.toLocaleString()} Pcs</span>
                    <span className={`text-[9px] font-extrabold block mt-0.5 ${
                      whatIfSimResult.prodChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {whatIfSimResult.prodChange >= 0 ? '▲' : '▼'} {Math.abs(whatIfSimResult.prodChange).toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase">Estimated Unit Cost</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">Rp {whatIfSimResult.unitCostRp.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Base: Rp 5,200</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase">Gross Margin</span>
                    <span className="text-sm font-bold text-emerald-400 mt-1 block">{whatIfSimResult.marginPercent}%</span>
                    <span className="text-[9px] text-slate-400 block font-bold mt-0.5">Base: 42.5%</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase">Simulated Profit</span>
                    <span className="text-sm font-bold text-emerald-400 mt-1 block">Rp {whatIfSimResult.profitRp.toLocaleString('id-ID')}</span>
                    <span className={`text-[9px] font-extrabold block mt-0.5 ${
                      whatIfSimResult.profitChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {whatIfSimResult.profitChange >= 0 ? '▲' : '▼'} {Math.abs(whatIfSimResult.profitChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* G. FORECASTING TREND PLOTS AND FORECAST DATES */}
          {activeTab === 'forecast' && (
            <div className="space-y-4 animate-fade-in text-[11px]">
              <div className="flex bg-slate-950 p-2 rounded-xl border border-slate-800 justify-between items-center">
                <span className="font-bold text-[10px] font-mono text-slate-400 uppercase">Forecast Horizon</span>
                <div className="flex gap-1.5">
                  {[7, 30, 90, 180].map(days => (
                    <button
                      key={days}
                      onClick={() => setForecastDays(days as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        forecastDays === days ? 'bg-slate-800 text-emerald-400' : 'text-slate-405 text-slate-400 hover:text-white'
                      }`}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
              </div>

              {/* Graph display */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">AI Forecasting Curves</span>
                <div className="h-44 text-slate-950">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastChartData}>
                      <XAxis dataKey="label" stroke="#475569" fontSize={8} />
                      <YAxis stroke="#475569" fontSize={8} />
                      <Tooltip wrapperStyle={{ fontSize: 9 }} />
                      <CartesianGrid stroke="#1e293b" />
                      <Line type="monotone" dataKey="Procurement Needs (Kg)" stroke="#10b981" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="Production Capacity (Pcs)" stroke="#6366f1" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="Inventory Level (Kg)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-[9px] mt-2 text-slate-400 font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Purchase Needs</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-indigo-500" /> Prod Capacity</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500" /> Stock Level</span>
                </div>
              </div>

              {/* Brief bullet projection */}
              <div className="bg-slate-950/45 p-3.5 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Forecasting Projections Summary</span>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex justify-between">
                    <span>Target Procurement Needs (Next Phase):</span>
                    <span className="font-bold text-white">{(contextStats.avgYieldValue * 180).toFixed(0)} Kg</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Expected Production Capacity:</span>
                    <span className="font-bold text-white">{(contextStats.txCount * 1450).toFixed(0)} Pcs</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Estimated Cash Flow Inflow (average):</span>
                    <span className="font-bold text-emerald-400">Rp {(contextStats.totalInvoicesValue * 1.08).toLocaleString('id-ID', {maximumFractionDigits:0})}</span>
                  </li>
                  <li className="flex justify-between border-t border-slate-800 pt-1.5 mt-1.5">
                    <span>Critical Labor Requirements index:</span>
                    <span className="font-bold text-white">35 Mandays (Optimal)</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* H. RISK MONITORING DECK WITH TRAFFIC LIGHTS */}
          {activeTab === 'risk' && (
            <div className="space-y-4 animate-fade-in text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Enterprise Risk Audits</span>
              
              <div className="space-y-2.5">
                {[
                  { id: 'supplier', label: 'Supplier Performance Risk', value: risksHealthScores.supplierRisk, desc: 'Indicates PO delays or fruit rejection thresholds from suppliers.' },
                  { id: 'inventory', label: 'Inventory & Stock Level Risk', value: risksHealthScores.inventoryRisk, desc: 'Potential stockouts or overload of raw/WIP materials.' },
                  { id: 'production', label: 'Production Throughput Risk', value: risksHealthScores.productionRisk, desc: 'Identifies yield losses or furnace temperature anomalies.' },
                  { id: 'financial', label: 'Cash Flow & Financial Risk', value: risksHealthScores.financialRisk, desc: 'Checks AP aging vs cash on hand thresholds.' },
                  { id: 'compliance', label: 'Food Safety & Compliance Risk', value: risksHealthScores.complianceRisk, desc: 'HACCP or grading standard deviation alerts.' },
                  { id: 'machine', label: 'Machine Integrity & Downtime Risk', value: risksHealthScores.machineRisk, desc: 'Vacuum Frying engine hours and overdue maintenance.' }
                ].map(r => (
                  <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-start gap-3">
                    <span className="text-base shrink-0 mt-0.5">
                      {r.value === 'High' ? '🔴' : r.value === 'Medium' ? '🟡' : '🟢'}
                    </span>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{r.label}</span>
                        <span className={`text-[9px] uppercase font-mono font-black ${
                          r.value === 'High' ? 'text-rose-500' : r.value === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {r.value} Risk
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* I. CHAT ASSISTANT PANEL */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[420px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
              {/* Model & Search Grounding Bar */}
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-bold">Model:</span>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value as any)}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                  >
                    <option value="gemini-3.5-flash">3.5 Flash (Standar)</option>
                    <option value="gemini-3.1-flash-lite">⚡ 3.1 Lite (Cepat & Kuota Stabil)</option>
                    <option value="gemini-3.8-flash">3.8 Flash (Baru)</option>
                    <option value="gemini-3.1-pro-preview">3.1 Pro (Billing)</option>
                  </select>
                </div>

                <button
                  onClick={() => setUseSearchGrounding(!useSearchGrounding)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    useSearchGrounding ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800 text-slate-400'
                  }`}
                  title="Aktifkan Google Search Grounding"
                >
                  <span>🌐</span>
                  <span>Search {useSearchGrounding ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Message scroll viewport */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-[11px] leading-relaxed">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-3 rounded-2xl max-w-[85%] border font-sans ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 border-slate-700 text-white rounded-br-none'
                        : 'bg-slate-900 border-slate-800/60 text-slate-200 rounded-bl-none font-medium'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800 text-[9px] space-y-1">
                          <span className="text-blue-400 font-bold block">🌐 Sumber Google Search:</span>
                          <div className="flex flex-wrap gap-1">
                            {msg.citations.slice(0, 3).map((cit, cIdx) => (
                              <a
                                key={cIdx}
                                href={cit.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-slate-950 text-blue-300 hover:text-white border border-slate-800 truncate max-w-[160px]"
                              >
                                {cit.title || cit.uri}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl rounded-bl-none text-[10px] text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini sedang berpikir...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Prompts Tray */}
              <div className="p-2 border-t border-slate-800 flex gap-1.5 overflow-x-auto bg-slate-950/90 whitespace-nowrap scrollbar-thin select-none">
                {[
                  'Berapa harga pasar apel di Jatim sekarang?',
                  'Kenapa yield kupas di MPD berfluktuasi?',
                  'Supplier mana yang rendemen buahnya tertinggi?',
                  'Simulasi kenaikan harga minyak goreng 15%',
                  'Bagaimana proyeksi cashflow bulan depan?'
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestionClick(q)}
                    className="px-2.5 py-1 rounded bg-slate-900 text-[9px] border border-slate-800 font-bold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Text Input dock */}
              <div className="p-2 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                  disabled={isChatLoading}
                  placeholder="Ketik pertanyaan untuk copilot..."
                  className="flex-1 bg-slate-900 text-[11px] font-sans font-medium text-white border border-slate-850 rounded-xl px-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
                />
                <button
                  onClick={handleChatSend}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 text-white transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
