/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Percent,
  Award,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Factory,
  CheckCircle,
  Truck,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import BudgetActualDashboard from './BudgetActualDashboard';
import YieldLossDashboard from './YieldLossDashboard';
import MachineUtilizationDashboard from './MachineUtilizationDashboard';
import ProfitabilityDashboard from './ProfitabilityDashboard';
import StrategicControlCenter from './StrategicControlCenter';
import { Sparkles, Cpu, Wrench } from 'lucide-react';

interface DashboardsProps {
  state: any;
  selectedLokasi: string;
  onNavigate?: (menuId: string) => void;
  activeMenu?: string;
  currentUser?: any;
  onLogActivity?: (modul: string, msg: string) => void;
}

export default function Dashboards({ state, selectedLokasi, onNavigate, activeMenu, currentUser, onLogActivity }: DashboardsProps) {
  const activeSubTab = (activeMenu && activeMenu.startsWith('dashboard-') 
    ? activeMenu.replace('dashboard-', '') 
    : 'utama') as string;

  const setActiveSubTab = (tabName: string) => {
    onNavigate?.('dashboard-' + tabName);
  };

  // Helper selectors filtering data by the active branch
  const activeBranchName = state.lokasi.find((l: any) => l.id === selectedLokasi)?.nama || 'Semua Cabang';
  
  const getBranchData = (arr: any[]) => {
    if (!arr) return [];
    if (activeSubTab === 'hq') return arr; // HQ shows global values
    return arr.filter(item => item.lokasiId === selectedLokasi || !item.lokasiId);
  };

  const branchBatches = getBranchData(state.batches);
  const branchStocks = getBranchData(state.stocks);
  const branchPO = getBranchData(state.purchaseOrders);
  const branchPenerimaan = getBranchData(state.penerimaan);
  const branchSales = getBranchData(state.sales);
  const branchPettyCash = getBranchData(state.pettyCash);
  const branchPeelingLogs = getBranchData(state.peelingLogs);
  const branchFryingLogs = getBranchData(state.fryingLogs);
  const branchPackingLogs = getBranchData(state.packingLogs);
  const branchNotifications = getBranchData(state.notifications);

  // 1. Calculations for Dashboard Utama
  const totalBahanMasuk = branchPenerimaan.reduce((sum, item) => sum + item.beratDiterimaKg, 0);
  const rawFruitStock = branchStocks.filter(s => s.kategori === 'Bahan Baku').reduce((sum, item) => sum + item.qty, 0);
  const wTarget = branchBatches.length;
  // Calculate average yields
  const totalPeelingYieldCount = branchPeelingLogs.length;
  const avgPeelingYield = totalPeelingYieldCount > 0 
    ? (branchPeelingLogs.reduce((sum, item) => sum + item.yieldPercent, 0) / totalPeelingYieldCount).toFixed(1) 
    : '61.2';

  const totalFryingLogsCount = branchFryingLogs.length;
  const avgFryingYield = totalFryingLogsCount > 0
    ? ((branchFryingLogs.reduce((sum, item) => sum + item.beratHasilKeripikKg, 0) / branchFryingLogs.reduce((sum, item) => sum + item.beratFrozenMasukKg, 0)) * 100).toFixed(1)
    : '40.0';

  const totalSalesRevenue = branchSales.reduce((sum, invoice) => sum + invoice.totalPenjualan, 0);
  const criticalStockItems = branchStocks.filter(s => {
    if (s.kategori === 'Bahan Baku' && s.qty < 500) return true;
    if (s.kategori === 'Packing Material' && s.qty < 1000) return true;
    return false;
  });

  // Recharts Data mapping: Daily Production (mock from batches)
  const productionTrendData = [
    { tanggal: '26 Mei', apel: 120, nangka: 80, pisang: 50 },
    { tanggal: '27 Mei', apel: 150, nangka: 95, pisang: 70 },
    { tanggal: '28 Mei', apel: 242, nangka: 110, pisang: 60 }, // Batch APL-001 results
    { tanggal: '29 Mei', apel: 180, nangka: 130, pisang: 90 },
    { tanggal: '30 Mei', apel: 110, nangka: 65,  pisang: 120 }, // Batch NGK-002 results
    { tanggal: '31 Mei', apel: 160, nangka: 140, pisang: 80 },
    { tanggal: '01 Jun', apel: 185, nangka: 0,   pisang: 140 }  // Batch APL-003 progress
  ];

  // Recharts Data mapping: Inventory Value by Category
  const inventoryCategoryData = [
    { name: 'Bahan Baku', value: branchStocks.filter(s => s.kategori === 'Bahan Baku').reduce((sum, s) => sum + s.qty * 12000, 0) },
    { name: 'WIP (Kupas/Frozen)', value: branchStocks.filter(s => s.kategori === 'WIP').reduce((sum, s) => sum + s.qty * 18000, 0) },
    { name: 'Produk Jadi (Terkemas)', value: branchStocks.filter(s => s.kategori === 'Produk Jadi').reduce((sum, s) => sum + s.qty * 11200, 0) },
    { name: 'Packing & Penolong', value: branchStocks.filter(s => s.kategori === 'Packing Material').reduce((sum, s) => sum + s.qty * (s.unit === 'liter' ? 16000 : 500), 0) },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

  // Sales trend
  const salesTrendData = [
    { tanggal: '26 Mei', omzet: 12000000, margin: 42 },
    { tanggal: '27 Mei', omzet: 15500000, margin: 44 },
    { tanggal: '28 Mei', omzet: 18000000, margin: 45 },
    { tanggal: '29 Mei', omzet: 22000000, margin: 41 },
    { tanggal: '30 Mei', omzet: 15000000, margin: 43 },
    { tanggal: '31 Mei', omzet: 29000000, margin: 46 }, // INV-001
    { tanggal: '01 Jun', omzet: 5700000, margin: 42 }   // INV-002
  ];

  // Product Distribution for Pie Chart
  const productSalesMap: { [key: string]: number } = {};
  branchSales.forEach((inv: any) => {
    inv.items.forEach((it: any) => {
      const prodName = state.produk.find((p: any) => p.id === it.produkId)?.nama || it.produkId;
      productSalesMap[prodName] = (productSalesMap[prodName] || 0) + it.qtyPcs;
    });
  });
  const productDistributionData = Object.keys(productSalesMap).map(key => ({
    name: key.length > 20 ? key.substring(0, 15) + '...' : key,
    value: productSalesMap[key]
  }));

  // Branch Performance (HQ level comparison)
  const branchComparisonData = state.lokasi.map((l: any, idx: number) => {
    // Generate simulated branch revenue & yields
    const rev = state.sales.filter((s: any) => s.lokasiId === l.id).reduce((sum: number, s: any) => sum + s.totalPenjualan, 0) || (25000000 - idx * 4000000);
    const yld = [78.5, 76.2, 72.8, 79.4, 75.0][idx];
    const output = [3200, 2400, 1800, 2900, 1500][idx];
    const alertCount = state.notifications.filter((n: any) => n.lokasiId === l.id && !n.dibaca).length || idx;
    return {
      name: l.nama.replace('Pabrik ', '').replace('Kawasan Industri Pasuruan', 'Pasuruan'),
      omzet: rev,
      yieldPercent: yld,
      outputPcs: output,
      alerts: alertCount,
      effRating: idx === 2 ? 'Butuh Evaluasi' : 'Optimal'
    };
  });

  return (
    <div className="flex flex-col space-y-6" id="dashboards-container">
      {/* Tab Navigation inside Dashboard */}
      <div className="flex items-center justify-between border-b border-slate-200/65 pb-3 flex-wrap gap-3" id="dashboards-tabs-row">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="tab-dashboard-utama-btn"
            onClick={() => setActiveSubTab('utama')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'utama'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard Utama
          </button>
          <button
            id="tab-dashboard-produksi-btn"
            onClick={() => setActiveSubTab('produksi')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'produksi'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard Produksi
          </button>
          <button
            id="tab-dashboard-inventory-btn"
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard Inventory
          </button>
          <button
            id="tab-dashboard-sales-btn"
            onClick={() => setActiveSubTab('sales')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard Sales
          </button>
          <button
            id="tab-dashboard-payroll-btn"
            onClick={() => setActiveSubTab('payroll')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'payroll'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard Payroll
          </button>
          <button
            id="tab-dashboard-cogs-btn"
            onClick={() => setActiveSubTab('cogs')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'cogs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard COGS &amp; Margin
          </button>
          <button
            id="tab-dashboard-hq-btn"
            onClick={() => setActiveSubTab('hq')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'hq'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Dashboard HQ (Multi-Branch)
          </button>
          <button
            id="tab-dashboard-profitability-btn"
            onClick={() => setActiveSubTab('profitability')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeSubTab === 'profitability'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Profitability Analysis
          </button>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 text-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
          <Factory className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Context: {activeSubTab === 'hq' ? 'National Global HQ' : activeBranchName}</span>
        </div>
      </div>

      {/* ======================= SUB TAB: UTAMA ======================= */}
      {activeSubTab === 'utama' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" id="dashboard-utama-content">
          {/* Key Metrics Cards */}
          <div 
            onClick={() => onNavigate?.('pengadaan-penerimaan')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all duration-150"
            title="Klik untuk melihat Detail Penerimaan Bahan"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penerimaan Bahan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalBahanMasuk.toLocaleString('id-ID')} kg</h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12% vs Minggu lalu
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('inventory-stock')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all duration-150"
            title="Klik untuk melihat Real-time Stock Tracker"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Bahan Baku Segar</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{rawFruitStock.toLocaleString('id-ID')} kg</h3>
              {rawFruitStock < 1000 ? (
                <p className="text-xs text-amber-600 font-medium flex items-center mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-0.5" /> Restock disarankan
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-medium flex items-center mt-1 w-full">
                  <CheckCircle className="w-3.5 h-3.5 mr-0.5 text-emerald-500" /> Kadar stok aman
                </p>
              )}
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('sales-penjualan')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all duration-150"
            title="Klik untuk melihat Input Penjualan Toko"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Omzet Penjualan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Rp {totalSalesRevenue.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +22.4% vs target bulanan
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('batch-history')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all duration-150"
            title="Klik untuk melihat Riwayat Batch Produksi"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Efisiensi Proses (Yield)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{avgPeelingYield}% / {avgFryingYield}%</h3>
              <p className="text-xs text-slate-500 mt-1">Kupas / Frying (Optimum)</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
          </div>

          {/* Critical Stocks & Alert Banner */}
          <div className="col-span-1 lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-4">Grafik Tren Produksi & Yield Harian</h4>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionTrendData}>
                  <defs>
                    <linearGradient id="colorApel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNangka" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="tanggal" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip formatter={(value) => [`${value} kg`, 'Output']} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="apel" name="Apel" stroke="#10B981" fillOpacity={1} fill="url(#colorApel)" />
                  <Area type="monotone" dataKey="nangka" name="Nangka" stroke="#3B82F6" fillOpacity={1} fill="url(#colorNangka)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Critical Stock Alerts list panel */}
          <div className="col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h4 className="font-bold text-slate-900 text-sm">Bahan Kritikal & Peringatan</h4>
                <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {criticalStockItems.length + branchNotifications.filter(n => !n.dibaca).length}
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[180px] pr-1">
                {criticalStockItems.map((stk, idx) => (
                  <div key={idx} className="p-2 bg-amber-50 border border-amber-100 rounded flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{stk.key}</p>
                      <p className="text-[10px] text-slate-500">Stok sisa: {stk.qty} {stk.unit}</p>
                    </div>
                  </div>
                ))}
                {branchNotifications.filter(n => !n.dibaca).slice(0, 3).map((notif: any) => (
                  <div key={notif.id} className="p-2 bg-red-50 border border-red-100 rounded flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{notif.pesan}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-0.5">{notif.tanggal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-2">
              <div className="bg-slate-50 p-2.5 rounded text-center text-xs text-slate-700 font-medium">
                Pabrik berjalan lancar dan optimal harian.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= SUB TAB: PRODUKSI ======================= */}
      {activeSubTab === 'produksi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="dashboard-produksi-content">
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-sm">Pencapaian Target Produksi vs Rencana</h4>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Mei - Juni 2026</span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="tanggal" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="apel" name="Apel (Target 200kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nangka" name="Nangka (Target 120kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pisang" name="Pisang (Target 100kg)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">Metrik Kinerja & Yield Cabang</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                    <span>Yield Kupas Apel</span>
                    <span className="font-semibold">{avgPeelingYield}% <span className="text-slate-400 font-normal">(Optimal &gt; 60%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${parseFloat(avgPeelingYield)}%` }}></div>
                   </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                    <span>Yield Kupas Nangka</span>
                    <span className="font-semibold">38.4% <span className="text-slate-400 font-normal">(Optimal &gt; 35%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38.4%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                    <span>Yield Frying (Vacuum Fryer M01)</span>
                    <span className="font-semibold">{avgFryingYield}% <span className="text-slate-400 font-normal">(Optimal &gt; 38%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${parseFloat(avgFryingYield)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                    <span>Yield Kemas & Labeling</span>
                    <span className="font-semibold">97.2% <span className="text-slate-400 font-normal">(Optimal &gt; 96%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '97.2%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3.5 mt-4 text-xs text-indigo-900">
              <span className="font-bold flex items-center mb-1">
                <Award className="w-4 h-4 mr-1 text-indigo-600" /> Catatan Quality Assurance:
              </span>
              Rasio rendemen (yield) dipengaruhi secara langsung oleh grade kesegaran bahan masuk dari supplier utama.
            </div>
          </div>
        </div>
      )}

      {/* ======================= SUB TAB: INVENTORY ======================= */}
      {activeSubTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="dashboard-inventory-content">
          <div className="col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">Value Saham Inventarisasi</h4>
              <div className="h-[220px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {inventoryCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Value Estimates']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {inventoryCategoryData.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-950">Rp {entry.value.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-4">Snapshot Sisa Stok Gudang Real-time</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs bg-slate-50">
                    <th className="py-2.5 px-3">Nama Material / Item</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                    <th className="py-2.5 px-3 text-right">Status Limits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {branchStocks.slice(0, 7).map((stk: any, idx: number) => {
                    const isMinCritical = (stk.kategori === 'Bahan Baku' && stk.qty < 500) || (stk.kategori === 'Packing Material' && stk.qty < 1000);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-950">{stk.key}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            stk.kategori === 'Bahan Baku' ? 'bg-emerald-100 text-emerald-800' :
                            stk.kategori === 'WIP' ? 'bg-amber-100 text-amber-800' :
                            stk.kategori === 'Produk Jadi' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {stk.kategori}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">{stk.qty.toLocaleString('id-ID')} {stk.unit}</td>
                        <td className="py-2.5 px-3 text-right">
                          {isMinCritical ? (
                            <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[10px]">Restock Required</span>
                          ) : (
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">Aman</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-3.5 text-center text-xs text-slate-500 font-mono">
                Menyajikan 7 item teratas yang terdaftar di stock inventory {activeBranchName}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= SUB TAB: SALES ======================= */}
      {activeSubTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="dashboard-sales-content">
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-4">Tren Pendapatan & Profit Margin (%)</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="tanggal" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Omzet']} />
                  <Legend />
                  <Area type="monotone" dataKey="omzet" name="Omzet Harian" stroke="#F59E0B" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">Laju Produk Terlaris (Pcs)</h4>
              {productDistributionData.length > 0 ? (
                <div className="h-[200px] flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {productDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} pcs`, 'Volume']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">
                  Belum ada data distribusi produk harian.
                </div>
              )}
              <div className="space-y-1 mt-2">
                {productDistributionData.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-600 truncate max-w-[150px]">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{entry.value} pcs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= SUB TAB: PAYROLL ======================= */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in" id="dashboard-payroll-content">
          <div className="flex items-center justify-between mb-4 border-b pb-3 flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Estimasi Pembayaran Gaji & Upah Borongan Produksi</h4>
              <p className="text-xs text-slate-500 mt-1">Mengikuti formula upah per kg (kupas) dan upah per cycle (vacuum frying)</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 font-semibold rounded">Sistem Auto-Kalkulasi Aktif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Gaji Borongan Kupas</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">
                Rp {state.peelingLogs.reduce((sum: number, log: any) => sum + log.gajiDihasilkan, 0).toLocaleString('id-ID')}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Gaji dihitung per kg rendemen hasil kupasan x Rp 1.500</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Gaji Borongan Frying</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">
                Rp {state.fryingLogs.reduce((sum: number, log: any) => sum + log.gajiOperator, 0).toLocaleString('id-ID')}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Gaji operator dihitung per cycle x Rp 25.000</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Gaji Borongan Kemas</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">
                Rp {state.packingLogs.reduce((sum: number, log: any) => sum + log.gajiKemas, 0).toLocaleString('id-ID')}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Ubah borongan pengemas per jam + insentif pcs target</p>
            </div>
          </div>

          <h5 className="font-bold text-slate-900 text-xs mb-3">Daftar Penerima Slip Gaji Borongan Terakhir / Hari Ini</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs bg-slate-50">
                  <th className="py-2.5 px-3">Nama Karyawan</th>
                  <th className="py-2.5 px-3">Role Pekerjaan</th>
                  <th className="py-2.5 px-3 text-right">Hasil Kerja Hari Ini</th>
                  <th className="py-2.5 px-3 text-right">Insentif Diterima</th>
                  <th className="py-2.5 px-3 text-right">Total Upah Kas Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {state.karyawan.slice(0, 6).map((k: any, idx: number) => {
                  // match wages
                  let workOutput = 'Standard Shifts';
                  let payout = k.role === 'Kupas' ? 207600 : k.role === 'Frying' ? 125000 : k.role === 'Kemas' ? 145000 : 4500000;
                  let bonus = k.role === 'Kupas' ? 24600 : k.role === 'Kemas' ? 25000 : 0;
                  
                  if (k.role === 'Kupas') workOutput = '122 Kg Kupas';
                  if (k.role === 'Frying') workOutput = '5 Cycles Vacuum';
                  if (k.role === 'Kemas') workOutput = '800 Pcs Kantong';
                  if (k.role === 'Sales') workOutput = 'Invoice Traced';
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-950">{k.nama}</td>
                      <td className="py-2.5 px-3">{k.role}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{workOutput}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">+Rp {bonus.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">Rp {payout.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= SUB TAB: COGS ======================= */}
      {activeSubTab === 'cogs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in" id="dashboard-cogs-content">
          <div className="flex items-center justify-between mb-4 border-b pb-3 flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Dashboard Target vs COGS/HPP Aktual per SKU</h4>
              <p className="text-xs text-slate-500 mt-1">Mengintegrasikan biaya pengadaan bahan baku, upah borongan pekerja, LPG, minyak goreng, dan sisa waste/remahan</p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 font-semibold rounded">Formula Alokasi Standard Aktif</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {state.produk.map((prod: any, idx: number) => {
              const standard = prod.hppStandar;
              // get calculated actual
              const actual = state.cogsBatch.find((c: any) => c.produkId === prod.id)?.hppPerPcs || (standard * (idx === 2 ? 1.08 : 0.94));
              const diffPercent = ((actual - standard) / standard) * 100;
              const isOver = actual > standard;
              return (
                <div key={prod.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">{prod.sku}</span>
                  <span className="text-xs font-bold text-slate-800 block truncate">{prod.nama}</span>
                  <div className="grid grid-cols-2 gap-2 mt-2 border-t pt-2 border-slate-200/50">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Rencana HPP</span>
                      <span className="text-xs font-bold text-slate-600">Rp {standard.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Aktual HPP</span>
                      <span className={`text-xs font-extrabold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Rp {Math.round(actual).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    {isOver ? (
                      <span className="text-[9px] text-red-600 bg-red-50 px-1 py-0.5 rounded font-semibold font-mono">
                        🔺 +{diffPercent.toFixed(1)}% Pemborosan
                      </span>
                    ) : (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-semibold font-mono">
                        🟢 {diffPercent.toFixed(1)}% Efisien
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <h5 className="font-bold text-slate-900 text-xs mb-3">Model Estimasi Margin Kotor Hasil Penjualan</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs bg-slate-50">
                  <th className="py-2.5 px-3">Produk SKU</th>
                  <th className="py-2.5 px-3">Harga Jual Pasar</th>
                  <th className="py-2.5 px-3 text-right">HPP Aktual Terakhir</th>
                  <th className="py-2.5 px-3 text-right">Gross Profit Margin</th>
                  <th className="py-2.5 px-3 text-right">Status Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {state.produk.map((prod: any, idx: number) => {
                  const actual = state.cogsBatch.find((c: any) => c.produkId === prod.id)?.hppPerPcs || (prod.hppStandar * (idx === 2 ? 1.08 : 0.94));
                  const profit = prod.hargaJualStandar - actual;
                  const profitPercent = (profit / prod.hargaJualStandar) * 100;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-950">{prod.nama}</td>
                      <td className="py-2.5 px-3 font-mono">Rp {prod.hargaJualStandar.toLocaleString('id-ID')} / pcs</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-semibold">Rp {Math.round(actual).toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                        Rp {Math.round(profit).toLocaleString('id-ID')} ({profitPercent.toFixed(1)}%)
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          profitPercent > 40 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {profitPercent > 40 ? 'Sangat Sehat' : 'Margin Rendah'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= SUB TAB: HQ ======================= */}
      {activeSubTab === 'hq' && (
        <div className="space-y-6 animate-fade-in" id="dashboard-hq-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Omzet Nasional</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Rp {state.sales.reduce((sum, s) => sum + s.totalPenjualan, 0).toLocaleString('id-ID')}</h3>
              <p className="text-xs text-slate-500 mt-1">Konsolidasi aggregator 5 cabang</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Rata-rata Yield Nasional</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">76.3%</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Melampaui target nasional 75%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total National Output</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">11,800 Pcs</h3>
              <p className="text-xs text-slate-500 mt-1">Barang kemasan siap jual nasional</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Peringatan Berjalan</span>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{state.notifications.filter(n => !n.dibaca).length} Baru</h3>
              <p className="text-xs text-slate-500 mt-1">Membutuhkan intervensi HQ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-4">Konsolidasi Omzet Antar 5 Cabang Pabrik</h4>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Omzet']} />
                    <Bar dataKey="omzet" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">Urutan Performa Unit Pabrik</h4>
              <div className="space-y-4">
                {branchComparisonData.map((branch, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b pb-2 border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold block text-slate-950">{idx + 1}. {branch.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">OMZET: Rp {branch.omzet.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold block text-emerald-700">Yield: {branch.yieldPercent}%</span>
                      {branch.alerts > 0 ? (
                        <span className="text-[9px] text-red-500 bg-red-5 font-bold px-1.5 py-0.5 rounded flex items-center justify-end">
                          ● {branch.alerts} Alerts
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 bg-emerald-5 font-medium px-1.5 py-0.5 rounded flex items-center justify-end">
                          Optimal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-6 pt-6">
            <StrategicControlCenter state={state} onLogActivity={onLogActivity} />
          </div>
        </div>
      )}

      {activeSubTab === 'budget-actual' && (
        <div className="space-y-6">
          <BudgetActualDashboard state={state} currentUser={currentUser} onLogActivity={onLogActivity || (() => {})} />
        </div>
      )}

      {activeSubTab === 'yield-loss' && (
        <div className="space-y-6">
          <YieldLossDashboard state={state} currentUser={currentUser} onLogActivity={onLogActivity || (() => {})} />
        </div>
      )}

      {activeSubTab === 'machine-utilization' && (
        <div className="space-y-6">
          <MachineUtilizationDashboard state={state} currentUser={currentUser} onLogActivity={onLogActivity || (() => {})} />
        </div>
      )}

      {activeSubTab === 'profitability' && (
        <div className="space-y-6">
          <ProfitabilityDashboard state={state} selectedLokasi={selectedLokasi} />
        </div>
      )}
    </div>
  );
}
