/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Percent,
  Factory as FactoryIcon,
  Users,
  Award,
  ChevronRight,
  RefreshCw,
  Sliders,
  Scale,
  BrainCircuit,
  ShoppingBag,
  Layers,
  ArrowRight
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

import { getProductProfitabilitySummary, calculateBatchCosting } from '../utils/costingEngine';

interface Props {
  state: any;
  selectedLokasi: string;
}

export default function ProfitabilityDashboard({ state, selectedLokasi }: Props) {
  // Profitability summaries calculated from current state
  const summaries = useMemo(() => getProductProfitabilitySummary(state), [state]);

  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'breakeven' | 'ai-insights'>('overview');
  const [filterType, setFilterType] = useState<'sku' | 'customer' | 'factory' | 'fruit' | 'brand'>('sku');

  // Multi-branch mappings for Factory display
  const factoryMap = {
    'JKT': { nama: 'JKT - Jakarta HQ', warna: '#6366F1' },
    'MPD': { nama: 'MPD - Malang Pujon Dehydrator', warna: '#10B981' },
    'SSP': { nama: 'SSP - Selorejo Surya Processing', warna: '#F59E0B' },
    'KKI': { nama: 'KKI - Kepanjen Keripik Industri', warna: '#EF4444' },
    'AGDN': { nama: 'AGDN - Agridea Global Distribution', warna: '#8B5CF6' }
  } as Record<string, { nama: string; warna: string }>;

  // --- Realtime Price & Yield Simulator parameters ---
  const [simFruitCost, setSimFruitCost] = useState<number>(12000); 
  const [simLaborRate, setSimLaborRate] = useState<number>(1500); 
  const [simPackagingCost, setSimPackagingCost] = useState<number>(800); 
  const [simPeelingYield, setSimPeelingYield] = useState<number>(60); 
  const [simFryingYield, setSimFryingYield] = useState<number>(40); 
  const [simTargetPrice, setSimTargetPrice] = useState<number>(18000);

  // --- Break-Even Analysis inputs ---
  const [bePrice, setBePrice] = useState<number>(18000);
  const [beFixedCost, setBeFixedCost] = useState<number>(15000000); // Rp 15 Juta per month
  const [beVariableCost, setBeVariableCost] = useState<number>(10800);

  // --- AI Insight custom prompt states ---
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<{ text: string; loading: boolean }>({ text: '', loading: false });

  // 1. Interactive Calculations - Simulation
  const simulatedResults = useMemo(() => {
    // raw multiplier: 1 kg finished chips needs raw materials based on cumulative yields
    const rawMultiplier = 1 / ((simPeelingYield / 100) * (simFryingYield / 100));
    const fruitCostPerKgChips = simFruitCost * rawMultiplier;

    // Direct packing material (pouch @simPackagingCost + carton box fractional share ~500)
    const packCostPerKg = (simPackagingCost * 10) + 1000; 
    
    // Add indirect costs & cooking oils
    const oilAndEnergyCosts = 2800; 
    const allocatedOverhead = 1200;

    // Total actual HPP calculation per Kg chips
    const hppPerKg = fruitCostPerKgChips + (simLaborRate * 5) + packCostPerKg + oilAndEnergyCosts + allocatedOverhead;
    
    // 100g Pouch calculations
    const hppPerPcs = (hppPerKg * 0.1) + simPackagingCost + 120; // 100g product fraction + packaging + labeling
    const profitPerPcs = simTargetPrice - hppPerPcs;
    const marginPercent = simTargetPrice > 0 ? (profitPerPcs / simTargetPrice) * 100 : 0;

    return {
      rawRequiredMultiplier: rawMultiplier.toFixed(2),
      fruitContributionPerKg: Math.round(fruitCostPerKgChips),
      hppPerKg: Math.round(hppPerKg),
      hppPerPcs: Math.round(hppPerPcs),
      profitPerPcs: Math.round(profitPerPcs),
      marginPercent: marginPercent.toFixed(1)
    };
  }, [simFruitCost, simLaborRate, simPackagingCost, simPeelingYield, simFryingYield, simTargetPrice]);

  // 2. Break-Even calculations
  const breakEvenResults = useMemo(() => {
    const contributionMarginUnit = bePrice - beVariableCost;
    const breakEvenQty = contributionMarginUnit > 0 ? Math.ceil(beFixedCost / contributionMarginUnit) : 0;
    const breakEvenRev = breakEvenQty * bePrice;

    return {
      contributionMarginUnit,
      breakEvenQty,
      breakEvenRev
    };
  }, [bePrice, beFixedCost, beVariableCost]);

  // Executive summary aggregations for Director Panel (#35)
  const directorMetrics = useMemo(() => {
    const totalRevenue = summaries.bySku.reduce((sum, s) => sum + s.revenue, 0);
    const totalCogs = summaries.bySku.reduce((sum, s) => sum + s.cogs, 0);
    const totalGrossProfit = totalRevenue - totalCogs;
    const totalMarginPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    // Best and worst performing factories
    const factoryPerformance = Object.keys(summaries.byFactory).map((key) => {
      const fact = summaries.byFactory[key];
      const prof = fact.revenue - fact.cogs;
      const marg = fact.revenue > 0 ? (prof / fact.revenue) * 100 : 0;
      return { id: key, revenue: fact.revenue, cogs: fact.cogs, profit: prof, margin: marg };
    });

    const activeFactories = factoryPerformance.filter(f => f.revenue > 0);
    const bestFactory = activeFactories.length > 0 ? [...activeFactories].sort((a, b) => b.margin - a.margin)[0] : { id: 'JKT', margin: 42.1 };
    const worstFactory = activeFactories.length > 0 ? [...activeFactories].sort((a, b) => a.margin - b.margin)[0] : { id: 'KKI', margin: 31.4 };

    // Best and worst SKU by margin
    const bestSKU = summaries.top10Skus[0] || { name: 'Nangka Chips Premium 100g', marginPercent: 46.2 };
    const worstSKU = summaries.bottom10Skus[0] || { name: 'Pineapple Chips Family 250g', marginPercent: 18.5 };

    // Top customer contribution
    const topCustomer = [...summaries.byCustomer].sort((a, b) => b.revenue - a.revenue)[0] || { name: 'Indogrosir National', revenue: 15400000 };

    return {
      totalRevenue,
      totalCogs,
      totalGrossProfit,
      totalMarginPercent,
      bestFactory: factoryMap[bestFactory.id]?.nama || bestFactory.id,
      bestFactoryMargin: bestFactory.margin.toFixed(1),
      worstFactory: factoryMap[worstFactory.id]?.nama || worstFactory.id,
      worstFactoryMargin: worstFactory.margin.toFixed(1),
      bestSKU: bestSKU.name,
      bestSKUMargin: bestSKU.marginPercent.toFixed(1),
      worstSKU: worstSKU.name,
      worstSKUMargin: worstSKU.marginPercent.toFixed(1),
      topCustomerName: topCustomer.name || 'Pusat Oleh-Oleh Malang',
      topCustomerRevenue: topCustomer.revenue
    };
  }, [summaries]);

  // Standard static AI advices with customizable interactive prompt options (#32)
  const defaultAIInsights = [
    {
      tipe: 'CRITICAL',
      judul: 'Penurunan Margin Keripik Nanas 250g',
      pesan: 'Pineapple Chips 250g margin kotor anjlok dar 35% ke 22.4% dalam 2 minggu terakhir.',
      analisis: 'Disebabkan oleh kenaikan harga bahan baku nanas segar dari supplier sebesar 18.2% dan penurunan yield pengupasan di pabrik KKI dari rata-rata standar 61% ke 54.5%.',
      rekomendasi: 'Segera lakukan audit standar pengupasan atau naikkan harga jual eceran sebesar 8.5% guna menyerap varians harga bahan baku nanas.'
    },
    {
      tipe: 'WARNING',
      judul: 'Varians Overhead di Fasilitas SSP Selorejo',
      pesan: 'Alokasi utilitas energi LPG dan gas meningkat 14% di atas target rasio anggaran.',
      analisis: 'Faktor pendorong utama adalah menurunnya efisiensi mesin frying (cycle-time membengkak akibat kebocoran gasket vakum pada fryer SSP-02).',
      rekomendasi: 'Jadwalkan pemeliharaan preventif gasket vakum dan optimalkan kapasitas penggorengan minimum 45 kg per cycle.'
    },
    {
      tipe: 'SUCCESS',
      judul: 'Margin Menggembirakan Maklon SKU Keripik Apel',
      pesan: 'OEM Partner Maklon brand "Crispify" menyumbangkan margin kotor neto sebesar 44.8%.',
      analisis: 'Sinergi kemasan custom (menggunakan standing pouch doff premium) dan pesanan bervolume besar melampaui skala ekonomis.',
      rekomendasi: 'Pertahankan kemitraan b2b OEM ini dan jajaki komitmen kontrak kuantitas pasokan semester berikutnya.'
    }
  ];

  const handleAIScan = () => {
    setAiResponse({ text: '', loading: true });
    
    setTimeout(() => {
      let analysisText = '';
      const promptLower = customPrompt.toLowerCase();
      
      if (promptLower.includes('apel') || promptLower.includes('apple')) {
        analysisText = `### AUDIT BATCH COGS: KERIPIK APEL
- **Diagnosis Biaya**: Nilai HPP Keripik Apel saat ini berada di kisaran Rp 10.120/pcs dari anggaran standard Rp 11.200/pcs. Penyerapan biaya berjalan dengan **efisiensi tinggi sebesar +9.6%**.
- **Yield Kupas**: Yield pengupasan stabil di 61.2%. Fluktuasi kecil berkorelasi positif dengan kualitas pasokan segar dari Supplier Agro Apple Malang.
- **Rencana Tindakan**: Margin kotor eceran saat ini adalah 43.7% (Sehat). Direkomendasikan mempertahankan formulasi harga saat ini dan melakukan promosi bundling volume.`;
      } else if (promptLower.includes('harga') || promptLower.includes('harga jual') || promptLower.includes('simulasi')) {
        analysisText = `### ANALISIS HARGA JUAL & SENSITIVITAS MARGIN
- **Faktor Resiko**: Setiap kenaikan Rp 1.000 pada komoditas buah segar akan mendongkrak HPP finish product sebesar Rp 2.400/kg (akibat multiplier penyusutan berat kupas dan fryer).
- **Rekomendasi Strategis**: 
  1. Untuk OEM/Maklon, tetapkan klausul "Formula-Pricing" dinamis yang melacak pergerakan pasar segar nasional.
  2. Pertahankan margin kotor aman minimal 35% di tingkat Distributor dan 40% di Retailer.`;
      } else {
        analysisText = `### KONSULTASI INTELEKTUAL BATCH COSTING (AI COGS)
- **Problem Terdeteksi**: SKU "Keripik Nangka 80g" mendapati marjin margin tergerus dari 35% ke 24.8% karena biaya pengadaan nangka melambung 18%.
- **Skenario Simulasi Yield**: Jika yield pengupasan buah nangka ditingkatkan sebesar 5% (melalui penggunaan pisau mekanis), margin berjalan dapat dipulihkan sebesar 3.8% tanpa harus menaikkan harga jual pasar.
- **Rekomendasi Eksekutif**: Tingkatkan efisiensi tenaga kerja borongan dan optimalkan kapasitas mesin frying guna menyebarkan alokasi overhead tetap.`;
      }

      setAiResponse({ text: analysisText, loading: false });
    }, 1500);
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-xl space-y-6 flex flex-col" id="profitability-dashboard-container">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4" id="profitability-header border">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">Advanced Costing &amp; SKU Profitability</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Dashboard Eksekutif Pelacakan Biaya Aktual, Alokasi Tenaga Kerja per Batch, Profit Margin, &amp; Price Simulation</p>
        </div>

        {/* Tab Controllers */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl self-start md:self-center border border-slate-700/60">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Profitability Report
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === 'simulation'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Price Simulator
          </button>
          <button
            onClick={() => setActiveTab('breakeven')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === 'breakeven'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Break-Even Analytics
          </button>
          <button
            onClick={() => setActiveTab('ai-insights')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === 'ai-insights'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white text-xs'
            }`}
          >
            <span className="flex items-center gap-1 font-bold">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" /> AI Cost Advisor
            </span>
          </button>
        </div>
      </div>

      {/* ================= tab: overview ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in" id="content-overview-profitability">
          
          {/* Executive Director Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="director-summary-cards">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Consolidate Revenue</span>
                <h3 className="text-2xl font-bold text-white mt-1">Rp {directorMetrics.totalRevenue.toLocaleString('id-ID')}</h3>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-mono font-medium">
                🟢 100% Berbasis Penjualan Aktual
              </div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Actual COGS (HPP Konsolidasi)</span>
                <h3 className="text-2xl font-bold text-rose-400 mt-1">Rp {directorMetrics.totalCogs.toLocaleString('id-ID')}</h3>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                Termasuk Upah Borongan &amp; Utilitas
              </div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gross Profit &amp; Margin</span>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                  Rp {directorMetrics.totalGrossProfit.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-white font-semibold">
                Rata-rata Margin: <span className="text-emerald-400 font-bold">{directorMetrics.totalMarginPercent.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-emerald-950 bg-emerald-950/10 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Executive Performance</span>
                <p className="text-xs text-white font-bold mt-1 truncate">Best SKU: {directorMetrics.bestSKU}</p>
                <p className="text-xs text-slate-300 mt-0.5 truncate">Worst SKU: {directorMetrics.worstSKU}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-900 border-t border-slate-800/80 text-[11px] text-amber-300">
                Top Client: <span className="font-bold">{directorMetrics.topCustomerName}</span>
              </div>
            </div>
          </div>

          {/* Ranking & Alerts Banner */}
          {summaries.negativeMarginSkus.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-900/60 p-4 rounded-xl flex gap-3 items-center text-xs" id="negative-margin-alert-row">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <span className="font-bold text-rose-400">Peringatan Risiko Margin Rendah (Negative Margin SKU):</span>
                <span className="text-slate-300 ml-1">
                  Ditemukan {summaries.negativeMarginSkus.length} SKU yang penjualannya mencetak marjin kritis di bawah standar margin kotor aman 35%: 
                  {summaries.negativeMarginSkus.map(m => ` ${m.name} (${Math.round(m.marginPercent)}%)`).join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Main charts and lists section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-reporting-charts-grid">
            
            {/* Visualizer chart on left */}
            <div className="col-span-1 lg:col-span-8 bg-slate-800/30 p-5 rounded-xl border border-slate-800/80 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2.5">
                <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Metrik Finansial Konsolidasi</h4>
                <div className="flex gap-1">
                  {(['sku', 'customer', 'brand', 'factory'] as any[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                        filterType === type ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      filterType === 'sku'
                        ? summaries.bySku
                        : filterType === 'customer'
                        ? summaries.byCustomer
                        : filterType === 'brand'
                        ? Object.keys(summaries.byBrand).map((key) => ({ name: key, revenue: summaries.byBrand[key].revenue, cogs: summaries.byBrand[key].cogs }))
                        : Object.keys(summaries.byFactory).map((key) => ({ name: factoryMap[key]?.nama || key, revenue: summaries.byFactory[key].revenue, cogs: summaries.byFactory[key].cogs }))
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey={filterType === 'sku' ? 'sku' : 'name'} stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }}
                      formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Omzet Penjualan" fill="#5F5DEC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cogs" name="COGS Aktual" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sub-section displaying dynamic Factory performance indexes */}
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-4">
                {Object.keys(summaries.byFactory).map((facCode: string) => {
                  const facSum = summaries.byFactory[facCode] || { revenue: 0, cogs: 0 };
                  const facProfit = facSum.revenue - facSum.cogs;
                  const profitRatio = facSum.revenue > 0 ? (facProfit / facSum.revenue) * 100 : 0;
                  return (
                    <div key={facCode} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">{factoryMap[facCode]?.nama.split(' - ')[1] || facCode}</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs font-bold text-white">Rp {Math.round(facProfit / 1000).toLocaleString('id-ID')}k</span>
                        <span className={`text-[9px] font-mono font-bold ${profitRatio > 35 ? 'text-emerald-400' : 'text-amber-500'}`}>
                          {profitRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List on right side */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              
              {/* Top and Bottom 10 ranking SKU */}
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-xs text-white mb-3 tracking-wider uppercase border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>SKU Profit Margins Ranking</span>
                  <span className="text-[9px] text-slate-400">Terurut Tertgi</span>
                </h4>
                
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {summaries.top10Skus.map((sku: any, idx: number) => (
                    <div key={sku.sku} className="p-2.5 bg-slate-900/40 rounded border border-slate-800 flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{sku.name}</p>
                          <p className="text-[9px] text-slate-500 font-mono">{sku.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-400">{sku.marginPercent.toFixed(1)}%</p>
                        <p className="text-[9px] text-slate-400">Rp {Math.round(sku.hppUnit).toLocaleString()}/pcs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Trace loops & dynamic list view of all Batch Cost details */}
          <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-3">Rincian Komponen Biaya per Batch Produksi (Aktual Berjalan)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[10px] font-bold uppercase">
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Bahan</th>
                    <th className="py-3 px-3 text-right">Biaya Buah</th>
                    <th className="py-3 px-3 text-right">Biaya Borongan Pekerja</th>
                    <th className="py-3 px-3 text-right">Kemasan &amp; Box</th>
                    <th className="py-3 px-3 text-right">Minyak &amp; LPG</th>
                    <th className="py-3 px-3 text-right">Maint. &amp; Overhead Allocation</th>
                    <th className="py-3 px-3 text-right font-black">Dynamic COGS Total</th>
                    <th className="py-3 px-3 text-right">HPP / Pcs</th>
                    <th className="py-3 px-3 text-center">Status Efisiensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {summaries.cogsCache.map((details) => (
                    <tr key={details.batchId} className="hover:bg-slate-800/25">
                      <td className="py-3 px-3 font-mono font-bold text-white">{details.batchId}</td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                          {details.namaBahan}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">Rp {details.rawMaterialCost.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right font-semibold text-amber-300">Rp {details.totalLaborCost.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right">Rp {details.packagingMaterialCost.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right">Rp {Math.round(details.oilCost + details.utilityCost).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right text-slate-400">Rp {Math.round(details.maintenanceCost + details.overheadCost).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right font-mono text-white font-extrabold">Rp {Math.round(details.totalActualCost).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right font-black text-white">Rp {Math.round(details.costPerPcs).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          details.efficiencyStatus === 'Sangat Efisien'
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
                            : details.efficiencyStatus === 'Optimal'
                            ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                            : 'bg-rose-900/50 text-rose-300 border border-rose-800'
                        }`}>
                          {details.efficiencyStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="b2b-customer-profitability">
            
            {/* Customer profitability display columns */}
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4">Customer &amp; b2b Partner profitability index</h4>
              <div className="space-y-3">
                {summaries.byCustomer.map((cust) => {
                  const custMg = cust.revenue > 0 ? (cust.profit / cust.revenue) * 100 : 0;
                  return (
                    <div key={cust.id} className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white text-xs">{cust.name}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            cust.type === 'Distributor' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800' :
                            cust.type === 'OEM' ? 'bg-amber-900/30 text-amber-400 border border-amber-800' :
                            cust.type === 'Maklon' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {cust.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Sales: <span className="text-slate-300 font-bold">Rp {cust.revenue.toLocaleString()}</span> | 
                          COGS: <span className="text-rose-400">Rp {cust.cogs.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black block ${custMg > 35 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Rp {Math.round(cust.profit).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">CM: {custMg.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer category aggregations display */}
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800/80">
              <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4">Profitability Contribution by Channel Type</h4>
              <div className="space-y-4">
                {Object.keys(summaries.byCustomerCategory).map((catName) => {
                  const catData = summaries.byCustomerCategory[catName] || { revenue: 0, cogs: 0, profit: 0 };
                  const cMargin = catData.revenue > 0 ? (catData.profit / catData.revenue) * 100 : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-bold text-slate-300">{catName} Channels</span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          Rp {Math.round(catData.profit).toLocaleString()} ({cMargin.toFixed(1)}% Margin)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(5, cMargin))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= tab: simulation ================= */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="content-price-simulation">
          
          {/* Controllers on Left */}
          <div className="col-span-1 lg:col-span-6 bg-slate-800/30 p-5 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-4 h-4 text-emerald-500 animate-spin-slow" /> Director Real-Time Cost Simulator
            </h3>
            <p className="text-xs text-slate-400">Gunakan slider parameter di bawah ini untuk mensimulasikan dampak perubahan biaya buah, upah, harga kemasan, serta hasil yield terhadap HPP dan laba unit secara real-time.</p>
            
            {/* Slider parameters */}
            <div className="space-y-4 pt-3">
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300">Fruit Procurement Cost (Raw):</label>
                  <span className="font-mono text-white font-bold">Rp {simFruitCost.toLocaleString()}/Kg</span>
                </div>
                <input
                  type="range"
                  min="6000"
                  max="25000"
                  step="500"
                  value={simFruitCost}
                  onChange={(e) => setSimFruitCost(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300">Labor Piece-Rate Target (Wage):</label>
                  <span className="font-mono text-white font-bold">Rp {simLaborRate.toLocaleString()}/Kg processed</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="5000"
                  step="100"
                  value={simLaborRate}
                  onChange={(e) => setSimLaborRate(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300">Single Pouch Bag Cost:</label>
                  <span className="font-mono text-white font-bold">Rp {simPackagingCost.toLocaleString()}/pcs</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={simPackagingCost}
                  onChange={(e) => setSimPackagingCost(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300">Peeling Yield %:</label>
                    <span className="font-mono text-emerald-400 font-bold">{simPeelingYield}%</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="75"
                    step="1"
                    value={simPeelingYield}
                    onChange={(e) => setSimPeelingYield(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300">Vacuum Fryer Yield %:</label>
                    <span className="font-mono text-emerald-400 font-bold">{simFryingYield}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="55"
                    step="1"
                    value={simFryingYield}
                    onChange={(e) => setSimFryingYield(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-800 pt-3">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-semibold">Simulated Selling Price (Pouch Retail):</label>
                  <span className="font-mono text-white font-black text-emerald-400">Rp {simTargetPrice.toLocaleString()}/pcs</span>
                </div>
                <input
                  type="range"
                  min="12000"
                  max="35000"
                  step="500"
                  value={simTargetPrice}
                  onChange={(e) => setSimTargetPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

            </div>
          </div>

          {/* Results Visual Panel on Right */}
          <div className="col-span-1 lg:col-span-6 bg-slate-800/20 p-6 rounded-2xl border border-emerald-950 flex flex-col justify-between">
            <div>
              <span className="text-[9px] bg-emerald-900 text-emerald-300 px-2 py-1 rounded-full uppercase tracking-wider font-extrabold self-start inline-block mb-3">Live Simulation Results</span>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Raw Material Multiplier</span>
                  <p className="text-lg font-black text-white mt-1">{simulatedResults.rawRequiredMultiplier} Kg</p>
                  <span className="text-[10px] text-slate-500 block">Raw fruit needed per 1 Kg chips</span>
                </div>

                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Total HPP Per Kg Chips</span>
                  <p className="text-lg font-black text-rose-400 mt-1">Rp {simulatedResults.hppPerKg.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-b border-slate-800 py-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 text-xs">Simulated COGS per standard 100g pouch:</span>
                  <span className="text-base font-extrabold text-white">Rp {simulatedResults.hppPerPcs.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 text-xs">Profit contribution margin per unit:</span>
                  <span className="text-base font-extrabold text-emerald-400">Rp {simulatedResults.profitPerPcs.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 font-bold text-sm">Simulated Margin Percentage:</span>
                  <span className="text-xl font-black text-emerald-400">{simulatedResults.marginPercent}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 mt-4 text-xs font-mono text-slate-300">
              <p className="text-slate-400 font-bold text-[10px] uppercase block mb-1">📋 Heuristik Analisis Direktur HQ</p>
              {Number(simulatedResults.marginPercent) > 40 ? (
                <span className="text-emerald-400 font-bold">🟢 MARGIN SANGAT SEHAT. Tarif kemitraan ini optimal. Rekomendasikan produksi massal.</span>
              ) : Number(simulatedResults.marginPercent) >= 30 ? (
                <span className="text-blue-400 font-bold">🔵 REZIM MARGIN OPTIMAL. Memiliki perlindungan biaya stabil moderat.</span>
              ) : (
                <span className="text-rose-400 font-bold">⚠️ RESIKO MARGIN TINGGI. Margin kotor di bawah target aman 30%. Tingkatkan yield kupas atau naikkan harga jual pasar sesegera mungkin!</span>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ================= tab: breakeven ================= */}
      {activeTab === 'breakeven' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="content-breakeven">
          
          {/* Calculator params on left */}
          <div className="col-span-1 lg:col-span-5 bg-slate-800/30 p-5 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-4 h-4 text-indigo-500" /> Break-Even Volume &amp; Revenue Analytics
            </h3>
            
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-bold">Fixed Costs (Biaya Tetap Bulanan - Gaji Tetap, Sewa, HQ Overhead)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={beFixedCost}
                    onChange={(e) => setBeFixedCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 pl-10 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-bold">Unit Selling Price Target (Harga Jual per Pcs)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={bePrice}
                    onChange={(e) => setBePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 pl-10 text-xs text-white  font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-bold">Unit Variable Costs (Biaya Variabel per Pcs - Buah, Kemas, Oil, Borongan)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={beVariableCost}
                    onChange={(e) => setBeVariableCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 pl-10 text-xs text-white  font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Graphical output on right */}
          <div className="col-span-1 lg:col-span-7 bg-slate-800/20 p-6 rounded-2xl border border-indigo-950 flex flex-col justify-between">
            <div>
              <span className="text-[9px] bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full uppercase tracking-wider font-extrabold mb-3 inline-block">Break-Even Metric Summary</span>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Break-Even Quantity (BEQ)</span>
                  <p className="text-xl font-black text-indigo-400 mt-1">{breakEvenResults.breakEvenQty.toLocaleString('id-ID')} Pcs</p>
                  <span className="text-[9px] text-slate-500 block">Single pack pouches to break-even</span>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Break-Even Revenue (BER)</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">Rp {breakEvenResults.breakEvenRev.toLocaleString('id-ID')}</p>
                  <span className="text-[9px] text-slate-500 block">Total gross sales value in Rupiah</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded bg-slate-900/80 border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">Unit Contribution Margin:</span>
                <span className="font-bold text-white font-mono">Rp {breakEvenResults.contributionMarginUnit.toLocaleString('id-ID')} ({((breakEvenResults.contributionMarginUnit / bePrice) * 100).toFixed(1)}%)</span>
              </div>
            </div>

            <div className="h-[140px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: '0%', cost: beFixedCost, revenue: 0 },
                    { name: '50% BEQ', cost: Math.round(beFixedCost + (breakEvenResults.breakEvenQty * 0.5 * beVariableCost)), revenue: Math.round(breakEvenResults.breakEvenRev * 0.5) },
                    { name: 'BEQ POINT', cost: Math.round(beFixedCost + (breakEvenResults.breakEvenQty * beVariableCost)), revenue: breakEvenResults.breakEvenRev },
                    { name: '150% BEQ', cost: Math.round(beFixedCost + (breakEvenResults.breakEvenQty * 1.5 * beVariableCost)), revenue: Math.round(breakEvenResults.breakEvenRev * 1.5) },
                    { name: '200% BEQ', cost: Math.round(beFixedCost + (breakEvenResults.breakEvenQty * 2.0 * beVariableCost)), revenue: Math.round(breakEvenResults.breakEvenRev * 2.0) },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis dataKey="name" stroke="#718096" fontSize={8} />
                  <Tooltip formatter={(value: any) => [`Rp ${value.toLocaleString()}`]} />
                  <Line type="monotone" dataKey="cost" name="Total Biaya" stroke="#E53E3E" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="revenue" name="Omzet Penjualan" stroke="#319795" strokeWidth={2.5} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ================= tab: ai insights ================= */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6 animate-fade-in" id="content-ai-cost-insights">
          
          {/* Visual AI Card banner */}
          <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-5 justify-between md:items-center">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-1.5 text-amber-500">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">AI Cost Advisor &amp; Operational Audit Insights</h3>
              </div>
              <p className="text-xs text-slate-400">Sistem AI Costing menganalisis fluktuasi biaya pembelian dari penerimaan log, rasio reject pengupasan, waktu siklus fryer, upah borongan payroll, kemasan OEM, dan data omzet toko secara berkelanjutan.</p>
            </div>
            <div className="bg-slate-900/50 p-2 border border-slate-800 rounded-lg flex items-center font-mono text-[10px] text-slate-400 self-start md:self-center">
              <span>ACTIVE MODEL: GEMINI-3.5-FLASH</span>
            </div>
          </div>

          {/* AI Advisories Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="ai-advisory-cards">
            {defaultAIInsights.map((insight, idx) => (
              <div key={idx} className="bg-slate-950/20 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      insight.tipe === 'CRITICAL' ? 'bg-rose-950/40 text-rose-300 border border-rose-800' :
                      insight.tipe === 'WARNING' ? 'bg-amber-950/40 text-amber-300 border border-amber-800' :
                      'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    }`}>
                      {insight.tipe}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{insight.judul}</h4>
                  <p className="text-[11px] text-slate-400 italic">"{insight.pesan}"</p>
                  <p className="text-xs text-slate-300 mt-2">{insight.analisis}</p>
                </div>

                <div className="bg-slate-900/65 p-3 rounded text-[11px] text-slate-300 border-l-2 border-emerald-500">
                  <span className="font-bold text-emerald-400 block mb-0.5">Rencana Tindakan:</span>
                  {insight.rekomendasi}
                </div>
              </div>
            ))}
          </div>

          {/* Live Custom Prompt AI Advisor Simulator */}
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" /> Tanyakan AI Audit Costing (Prompt Interaktif)
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Audit COGS Keripik Apel, dampak kenaikan harga kemas, simulasi margin nanas..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAIScan}
                disabled={aiResponse.loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 shadow-md shadow-emerald-950/20 shrink-0"
              >
                {aiResponse.loading ? 'Menganalisis...' : 'Analisis Biaya'}
              </button>
            </div>

            {/* Response console output */}
            {(aiResponse.text || aiResponse.loading) && (
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-slate-300 animate-fade-in whitespace-pre-wrap leading-relaxed">
                {aiResponse.loading ? (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI sedang mengumpulkan parameter biaya dari Log Kupas, Frying, QC, Packaging, &amp; Penjualan...</span>
                  </div>
                ) : (
                  <div>{aiResponse.text}</div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
