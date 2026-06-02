/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Cpu,
  TrendingDown,
  TrendingUp,
  GitCommit,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertOctagon,
  Scale,
  ShoppingBag,
  DollarSign,
  User,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface TrackingAndCOGSProps {
  state: any;
}

export default function TrackingAndCOGS({ state }: TrackingAndCOGSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tracing' | 'cogs' | 'simulation' | 'variance'>('tracing');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('BATCH-APL-001');

  // Interactive Price / Margin Simulation state
  const [simSku, setSimSku] = useState<string>(state.produk[0]?.id || '');
  const [simHargaBeliSegar, setSimHargaBeliSegar] = useState<number>(12000);
  const [simYieldKupas, setSimYieldKupas] = useState<number>(60);
  const [simYieldGoreng, setSimYieldGoreng] = useState<number>(40);
  const [simTargetHargaJual, setSimTargetHargaJual] = useState<number>(18000);
  const [simOverheadAlokasi, setSimOverheadAlokasi] = useState<number>(1500);

  // Selected batch for detailed tracing
  const selectedBatch = state.batches.find((b: any) => b.id === selectedBatchId) || state.batches[0];

  // Helper tracing relations:
  const linkedReceipt = state.penerimaan.find((r: any) => r.jenisBahan.startsWith(selectedBatch?.namaBahan));
  const linkedPeeling = state.peelingLogs.filter((p: any) => p.batchId === selectedBatchId);
  const linkedFreezing = state.freezingLogs.find((f: any) => f.batchId === selectedBatchId);
  const linkedFrying = state.fryingLogs.find((fr: any) => fr.batchId === selectedBatchId);
  const linkedQC = state.qcLogs.find((qc: any) => qc.batchId === selectedBatchId);
  const linkedPackaging = state.packingLogs.filter((p: any) => p.batchId === selectedBatchId);
  const linkedSales = state.sales.filter((s: any) => s.items.some((it: any) => it.batchId === selectedBatchId));

  // COGS Formula calculator following PRD page 19
  // HPP per kg = Total COGS Batch / Total kg keripik layak jual
  // HPP per pcs = Total COGS Batch / Total pcs produk terkemas layak jual
  const calculateSimulatedHPP = () => {
    // 1 kg of finished product requires factors based on peeling and frying yields
    // raw material required = 1 / ( (kupas/100) * (goreng/100) )
    const rawMultiplier = 1 / ((simYieldKupas / 100) * (simYieldGoreng / 100));
    const rawMaterialCostPerKgOfChips = simHargaBeliSegar * rawMultiplier;
    
    // Add packaging (pouch + carton ~ Rp 800/pcs) and energy/cooking oil (~Rp 4000/kg chips)
    const packagingCostPerKg = 8000; // 10 pouch @800 IDR each
    const energyAndOilCostPerKg = 5000;
    const directLaborCostPerKg = 3000;

    const totalCogsPerKg = rawMaterialCostPerKgOfChips + energyAndOilCostPerKg + directLaborCostPerKg + simOverheadAlokasi;
    
    // Convert to per pcs (100g pouch)
    const cogsPerPcs = (totalCogsPerKg * 0.1) + 800; // Gramasi factor + packaging pouch
    const estimatedMargin = ((simTargetHargaJual - cogsPerPcs) / simTargetHargaJual) * 100;

    return {
      rawRequiredKg: rawMultiplier.toFixed(2),
      rawCostPerKgChips: Math.round(rawMaterialCostPerKgOfChips),
      hppPerKg: Math.round(totalCogsPerKg),
      hppPerPcs: Math.round(cogsPerPcs),
      marginPercent: estimatedMargin.toFixed(1)
    };
  };

  const simResult = calculateSimulatedHPP();

  return (
    <div className="flex flex-col space-y-6" id="tracing-cogs-container">
      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/65 pb-3 flex-wrap" id="tracing-tabs-row">
        <button
          id="btn-subtab-tracing"
          onClick={() => setActiveSubTab('tracing')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
            activeSubTab === 'tracing'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Pelacakan Batch (End-to-End Tracing)
        </button>
        <button
          id="btn-subtab-cogs"
          onClick={() => setActiveSubTab('cogs')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
            activeSubTab === 'cogs'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Rincian COGS / HPP Aktual
        </button>
        <button
          id="btn-subtab-simulation"
          onClick={() => setActiveSubTab('simulation')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
            activeSubTab === 'simulation'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Simulasi Margin &amp; Harga Jual
        </button>
        <button
          id="btn-subtab-variance"
          onClick={() => setActiveSubTab('variance')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
            activeSubTab === 'variance'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Analisis Varians (Standard vs Aktual)
        </button>
      </div>

      {/* ==================== SCREEN: END-TO-END TRACING ==================== */}
      {activeSubTab === 'tracing' && (
        <div className="space-y-6 animate-fade-in" id="tracing-screen">
          {/* Batch selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-800">Pilih Batch Produksi:</span>
              <select
                id="select-tracing-batch-id"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="bg-slate-50 text-slate-900 border border-slate-200 rounded p-1.5 text-xs font-mono font-bold"
              >
                {state.batches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.namaBahan}) - {b.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Status Aktif: <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">{selectedBatch?.status}</span>
            </div>
          </div>

          {/* ROADMAP TREE DIAGRAM */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-x-auto min-w-[800px]">
            <h4 className="font-bold text-slate-900 text-sm mb-6 flex items-center">
              <Cpu className="w-4 h-4 mr-1 text-slate-700 animate-pulse" /> Diagram Alur Rantai Lacak Keripik Buah (Real-Time)
            </h4>

            <div className="flex justify-between items-start gap-3 relative z-10">
              {/* Node 1: Pengadaan PO */}
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-2">
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.2 rounded">Langkah 1</span>
                  <span className="text-[10px] text-slate-400 font-mono">Penerimaan</span>
                </div>
                <h5 className="font-bold text-slate-950 text-xs truncate">Bahan Baku Masuk</h5>
                {linkedReceipt ? (
                  <div className="text-[10px] text-slate-600 mt-2 space-y-1">
                    <p className="font-semibold text-slate-900">{linkedReceipt.jenisBahan}</p>
                    <p>Qty: {linkedReceipt.beratDiterimaKg} kg</p>
                    <p>Grade: <span className="bg-emerald-50 text-emerald-700 font-bold px-1 rounded">{linkedReceipt.grade}</span></p>
                    <p className="text-[9px] font-mono whitespace-nowrap text-slate-400">ID: {linkedReceipt.id}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic mt-2">Diterima via Supplier PO-001</p>
                )}
              </div>

              <div className="flex items-center self-center text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 2: Pengupasan */}
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-2">
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.2 rounded">Langkah 2</span>
                  <span className="text-[10px] text-slate-400 font-mono">Peeling</span>
                </div>
                <h5 className="font-bold text-slate-950 text-xs">Pengupasan & Yield</h5>
                {linkedPeeling.length > 0 ? (
                  <div className="text-[10px] text-slate-600 mt-2 space-y-1">
                    <p className="font-semibold text-slate-900">Pekerja: {linkedPeeling[0].karyawanId === 'K-01' ? 'Siti Aminah' : 'Dewi Rahma'}</p>
                    <p>Input: {linkedPeeling.reduce((sum, p) => sum + p.bahanMasukKg, 0)} kg</p>
                    <p className="font-bold text-emerald-700">Yield: {linkedPeeling[0].yieldPercent}%</p>
                    <p>Reject: {linkedPeeling.reduce((sum, p) => sum + p.rejectKg, 0)} kg</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic mt-2">WIP - Pengupasan belum tercatat</p>
                )}
              </div>

              <div className="flex items-center self-center text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 3: Pembekuan & Vacuum Frying */}
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-2">
                  <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.2 rounded">Langkah 3</span>
                  <span className="text-[10px] text-slate-400 font-mono">Frying</span>
                </div>
                <h5 className="font-bold text-slate-950 text-xs">Frying & Telemetri</h5>
                {linkedFrying ? (
                  <div className="text-[10px] text-slate-600 mt-2 space-y-1">
                    <p className="font-semibold text-slate-900">Fryer ID: {linkedFrying.mesinId}</p>
                    <p>Suhu: <span className="font-mono">{linkedFrying.parameterMesin.suhuCelcius}°C</span></p>
                    <p>Press: <span className="font-mono">{linkedFrying.parameterMesin.tekananVacuumKpa} kPa</span></p>
                    <p className="font-bold text-blue-700">Output: {linkedFrying.beratHasilKeripikKg} kg</p>
                  </div>
                ) : linkedFreezing ? (
                  <div className="text-[10px] text-slate-600 mt-2 space-y-1">
                    <p className="text-amber-600 font-bold">● Frozen State Only</p>
                    <p>Input: {linkedFreezing.beratKupasMasuk} kg</p>
                    <p>Output: {linkedFreezing.beratFrozenOutput} kg</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic mt-2">Frying belum berjalan</p>
                )}
              </div>

              <div className="flex items-center self-center text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 4: Quality Control */}
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-2">
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded">Langkah 4</span>
                  <span className="text-[10px] text-slate-400 font-mono">QA / QC</span>
                </div>
                <h5 className="font-bold text-slate-950 text-xs">Grading Quality</h5>
                {linkedQC ? (
                  <div className="text-[10px] text-slate-600 mt-2 space-y-1 col">
                    <p className="font-semibold text-slate-900 border-b pb-1">Passed Inspection</p>
                    <p className="text-emerald-700">Grade A: {linkedQC.hasilGradeAKg} kg</p>
                    <p className="text-amber-600">Grade B: {linkedQC.hasilGradeBKg} kg</p>
                    <p className="text-rose-600">Reject: {linkedQC.rejectKg} kg</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic mt-2">Menunggu grading inspektor</p>
                )}
              </div>

              <div className="flex items-center self-center text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Node 5: Pengemasan Brand */}
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1 mb-2">
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded">Langkah 5</span>
                  <span className="text-[10px] text-slate-400 font-mono">Pack</span>
                </div>
                <h5 className="font-bold text-slate-950 text-xs">Packaging SKU</h5>
                {linkedPackaging.length > 0 ? (
                  <div className="text-[10px] text-slate-600 mt-2 space-y-1">
                    <p className="font-semibold text-slate-900">Total: {linkedPackaging.reduce((sum, p) => sum + p.totalPcsDihasilkan, 0)} Pcs</p>
                    <p>Remahan: {linkedPackaging[0].remahanKg} kg</p>
                    <p>Box: {linkedPackaging[0].boxDigunakan} Karton</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic mt-2">Belum masuk area packing</p>
                )}
              </div>
            </div>

            {/* Backgroud connecting track line */}
            <div className="absolute top-[80px] left-8 right-8 h-1 bg-slate-200 rounded -z-10"></div>
          </div>

          {/* DETAILED RESULTS & CUSTOMER TRACEABILITY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-3">Rantai Tracing Pengiriman Toko / Outlet</h4>
              {linkedSales.length > 0 ? (
                <div className="space-y-4">
                  {linkedSales.map((sales: any) => {
                    const cust = state.customer.find((c: any) => c.id === sales.customerId);
                    return (
                      <div key={sales.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex justify-between items-start">
                        <div className="text-xs space-y-1">
                          <span className="bg-blue-100 text-blue-800 text-[9px] font-semibold px-2 py-0.5 rounded uppercase font-mono">
                            {sales.suratJalanNumber || 'Surat Jalan Dispatched'}
                          </span>
                          <h5 className="font-extrabold text-slate-900 mt-1">{cust?.nama}</h5>
                          <p className="text-[10px] text-slate-500">{cust?.alamat}</p>
                          <p className="text-[10px] text-slate-400">Invoice: {sales.notaNumber} (Tgl: {sales.tanggal})</p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-bold text-slate-950 block">Rp {sales.totalPenjualan.toLocaleString('id-ID')}</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                            {sales.statusPengiriman}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border rounded text-center text-xs text-slate-500 italic">
                  Belum ada pengiriman atau penjualan dari Batch ini yang tersalurkan ke Indogrosir atau Outlet lainnya.
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-3">Analisis Rendemen & Pemborosan Batch</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1.5 border-b">
                  <span className="text-slate-600">Total Penyusutan Kupas (Kulit & Biji)</span>
                  <span className="font-bold text-rose-600 font-mono">
                    {linkedPeeling.length > 0 
                      ? `${(100 - linkedPeeling[0].yieldPercent).toFixed(1)}%` 
                      : '39%'}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b">
                  <span className="text-slate-600">Total Penyusutan Goreng (Evaporasi Air)</span>
                  <span className="font-bold text-rose-600 font-mono">
                    {linkedFrying 
                      ? `${(100 - (linkedFrying.beratHasilKeripikKg / linkedFrying.beratFrozenMasukKg) * 100).toFixed(1)}%` 
                      : '60%'}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b">
                  <span className="text-slate-600">Material Hilang (Remahan & QC Reject)</span>
                  <span className="font-bold text-rose-600 font-mono">
                    {linkedQC ? `${(linkedQC.rejectKg + (linkedPackaging[0]?.remahanKg || 0)).toFixed(1)} kg` : '3.8 kg'}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1.5">
                  <span className="text-slate-950 font-bold">Rasio Hasil Keripik Jadi Layak Jual</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">
                    {linkedPeeling.length > 0 && linkedFrying
                      ? `${((linkedFrying.beratHasilKeripikKg / linkedPeeling.reduce((s,p) => s+p.bahanMasukKg, 0)) * 100).toFixed(1)}%`
                      : '23.8%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN: COGS/HPP DETAIL ==================== */}
      {activeSubTab === 'cogs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in" id="cogs-detail-screen">
          <div className="flex justify-between items-center border-b pb-3 mb-4 flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Rincian Komponen Biaya HPP Aktual</h4>
              <p className="text-xs text-slate-500">Breakdown real-time dari unit cost batch {selectedBatchId}</p>
            </div>
            <button className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded border border-slate-200 font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Ekspor COGS (Excel)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-2 px-3">Komponen Biaya</th>
                      <th className="py-2 px-3">Deskripsi Sumber Data</th>
                      <th className="py-2 px-3 text-right">Biaya Standard (SKU)</th>
                      <th className="py-2 px-3 text-right">Biaya Aktual Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Bahan Baku Utama (Buah)</td>
                      <td className="py-2.5 px-3">Penerimaan Gudang PO Supplier</td>
                      <td className="py-2.5 px-3 text-right">Rp 4.950.000</td>
                      <td className="py-2.5 px-3 text-right font-bold">Rp {selectedBatch?.totalBiayaBahan?.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Minyak Goreng & Bumbu</td>
                      <td className="py-2.5 px-3">Minyak Terserap Frying (Stock)</td>
                      <td className="py-2.5 px-3 text-right">Rp 400.000</td>
                      <td className="py-2.5 px-3 text-right font-bold">Rp {selectedBatch?.totalBiayaPenolong?.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Kemasan & Karton (Pcs)</td>
                      <td className="py-2.5 px-3">Standing Pouch & Outer Box</td>
                      <td className="py-2.5 px-3 text-right">Rp 600.000</td>
                      <td className="py-2.5 px-3 text-right font-bold">Rp 563.500</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Tenaga Kerja Langsung</td>
                      <td className="py-2.5 px-3">Kupas Borongan + Operator Fryer + Kemas</td>
                      <td className="py-2.5 px-3 text-right">Rp 500.000</td>
                      <td className="py-2.5 px-3 text-right font-bold">Rp {selectedBatch?.totalBiayaTenagaKerja?.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Gas LPG & Listrik (Listrik)</td>
                      <td className="py-2.5 px-3">Kompresor Vacuum + Pemanas Gas</td>
                      <td className="py-2.5 px-3 text-right">Rp 450.000</td>
                      <td className="py-2.5 px-3 text-right font-bold">Rp {selectedBatch?.totalBiayaEnergy?.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Alokasi Overhead Pabrik</td>
                      <td className="py-2.5 px-3">Maintenance mesin & utilias umum</td>
                      <td className="py-2.5 px-3 text-right">Rp 100.000</td>
                      <td className="py-2.5 px-3 text-right font-bold">Rp {selectedBatch?.totalBiayaOverhead?.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-rose-700">Rugi Kerusakan (Waste/Reject)</td>
                      <td className="py-2.5 px-3">Remahan packaging & QC gosong</td>
                      <td className="py-2.5 px-3 text-right">Rp 200.000</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700">Rp {selectedBatch?.totalBiayaWaste?.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td className="py-3 px-3 text-slate-950 font-black text-sm" colSpan={2}>Total Nilai COGS Terpapar</td>
                      <td className="py-3 px-3 text-right text-slate-650">Rp 7.200.000</td>
                      <td className="py-3 px-3 text-right text-slate-950 text-sm font-black">
                        Rp {(
                          selectedBatch?.totalBiayaBahan +
                          selectedBatch?.totalBiayaPenolong +
                          563500 +
                          selectedBatch?.totalBiayaTenagaKerja +
                          selectedBatch?.totalBiayaEnergy +
                          selectedBatch?.totalBiayaOverhead +
                          selectedBatch?.totalBiayaWaste
                        ).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">HPP Akhir (Per Unit / Pcs)</h5>
              <div className="space-y-3.5 divide-y divide-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Hasil Normal (Layak Jual)</span>
                  <span className="text-lg font-bold text-slate-950 block">800 Kantong (Pcs)</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block">HPP Aktual Per Pcs</span>
                  <span className="text-lg font-bold text-emerald-700 block">Rp 8.229 <span className="text-xs text-slate-400 font-normal">/ pouch</span></span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block">HPP Rencana Standard</span>
                  <span className="text-sm font-semibold text-slate-600 block">Rp 11.200 <span className="text-xs text-slate-400 font-normal">/ pouch</span></span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block">Profit Bersih Margin</span>
                  <span className="text-sm font-semibold text-slate-900 block">Rp 9.771 <span className="text-xs text-slate-400 font-normal">(54.3% dari harga pasar)</span></span>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-900 text-xs p-3 rounded border border-emerald-100">
                <span className="font-bold block mb-0.5">🟢 Status Analisis COGS: Sangat Sehat (Efisien)</span>
                Penyusutan rendemen bahan baku lebih rendah dibanding budget standard, dan efisiensi energi gas LPG berhasil ditingkatkan pada mesin V-01.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN: MARGIN SIMULATION ==================== */}
      {activeSubTab === 'simulation' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in" id="simulation-screen">
          <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">Simulasi Harga Jual & Profitability Analis HPP</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border rounded-lg space-y-4">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Parameter Estimasi</h5>
              
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Harga Beli Bahan Baku Segar (Rp/Kg)</label>
                <input
                  type="number"
                  value={simHargaBeliSegar}
                  onChange={(e) => setSimHargaBeliSegar(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-white border rounded p-1.5 w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rendemen Kupas / Peeling (%)</label>
                <input
                  type="number"
                  max="100"
                  value={simYieldKupas}
                  onChange={(e) => setSimYieldKupas(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-white border rounded p-1.5 w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rendemen Goreng / Frying (%)</label>
                <input
                  type="number"
                  max="100"
                  value={simYieldGoreng}
                  onChange={(e) => setSimYieldGoreng(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-white border rounded p-1.5 w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Harga Jual Pasar (Rp/Pcs)</label>
                <input
                  type="number"
                  value={simTargetHargaJual}
                  onChange={(e) => setSimTargetHargaJual(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-white border rounded p-1.5 w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Alokasi Biaya Overhead Pabrik (Rp/Kg)</label>
                <input
                  type="number"
                  value={simOverheadAlokasi}
                  onChange={(e) => setSimOverheadAlokasi(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-white border rounded p-1.5 w-full text-xs font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-xs space-y-2">
                  <span className="font-bold text-indigo-900 flex items-center">
                    <Scale className="w-4 h-4 mr-1 text-indigo-700" /> Kebutuhan Bahan Baku Utama
                  </span>
                  <p className="font-bold text-3xl font-mono text-indigo-950 mt-1">{simResult.rawRequiredKg} kg Segar</p>
                  <p className="text-[10px] text-slate-500">Dibutuhkan untuk menghasilkan 1 kg keripik layak kemas dengan efisiensi yield kupas {simYieldKupas}% & yield goreng {simYieldGoreng}%</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-lg text-xs space-y-2">
                  <span className="font-bold text-emerald-900 flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-1 text-emerald-700" /> Estimasi Profit Margin Bersih
                  </span>
                  <p className="font-bold text-3xl font-mono text-emerald-950 mt-1">{simResult.marginPercent}%</p>
                  <p className="text-[10px] text-slate-500">Gross margin berdasarkan simulasi harga pasar Rp {simTargetHargaJual.toLocaleString('id-ID')} vs HPP Per Pcs Rp {simResult.hppPerPcs.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border space-y-3.5">
                <h5 className="font-bold text-slate-900 text-xs border-b pb-2">Komponen Pembentuk HPP (IDR)</h5>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Raw Cost / Kg Chips</span>
                    <span className="font-extrabold text-slate-900">Rp {simResult.rawCostPerKgChips.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">HPP Standard / Kg</span>
                    <span className="font-extrabold text-slate-900">Rp {simResult.hppPerKg.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">HPP Per Pcs (100g)</span>
                    <span className="font-extrabold text-emerald-700 text-sm">Rp {simResult.hppPerPcs.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gross Profit Per Pcs</span>
                    <span className="font-extrabold text-emerald-700 text-sm">Rp {(simTargetHargaJual - simResult.hppPerPcs).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border rounded-lg text-xs text-amber-900">
                ⚠️ <span className="font-semibold text-amber-950">Analisis Sensivitas:</span> Menurunnya rendemen kupas (yield) sebesar 5% akan meningkatkan cost/kg chips hingga 12.4%, sehingga penting dalam mengawasi grade bahan segar.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN: VARIANCE ANALYSIS ==================== */}
      {activeSubTab === 'variance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in" id="variance-analysis-screen">
          <h4 className="font-bold text-slate-900 text-sm border-b pb-2 mb-4">Variance Cost Analysis (Standar vs Aktual)</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-2 px-3">Variance Type</th>
                      <th className="py-2 px-3 text-right">Standard Cost</th>
                      <th className="py-2 px-3 text-right">Actual Cost</th>
                      <th className="py-2 px-3 text-right">Selisih (Variance)</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-bold block text-slate-900">Harga Bahan Baku</span>
                        <span className="text-[10px] text-slate-400">Supplier premium rate, fruit seasonal prices</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp 4.950.000</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {selectedBatch?.totalBiayaBahan?.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">-Rp 150.000</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Efisien (Favorable)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-bold block text-slate-900">Rasio Waste / Remahan</span>
                        <span className="text-[10px] text-slate-400">Crushed chips & QC scrap rate</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp 380.000</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {selectedBatch?.totalBiayaWaste?.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">-Rp 80.000</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Efisien</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-bold block text-slate-900">Pemakaian Gas LPG & Energi</span>
                        <span className="text-[10px] text-slate-400">Continuous boiling & electricity rates</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp 450.000</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {selectedBatch?.totalBiayaEnergy?.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">+Rp 30.000</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded uppercase">Pemborosan (Unfavorable)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-bold block text-slate-900">Biaya Labor Borongan</span>
                        <span className="text-[10px] text-slate-400">Peeling bonus rate & packer targets</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp 500.000</td>
                      <td className="py-2.5 px-3 text-right font-mono">Rp {selectedBatch?.totalBiayaTenagaKerja?.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">-Rp 20.000</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Efisien</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <h5 className="font-bold text-slate-950 border-b pb-2">Investigasi / Audit Trail Varians</h5>
                
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5"></div>
                    <div>
                      <span className="font-bold text-slate-800 block">Gas LPG Over-use (+6.7%)</span>
                      <p className="text-slate-500">Burner vacuum frying M01 berkerak dan membutuhkan pembersihan nozzle.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5"></div>
                    <div>
                      <span className="font-bold text-slate-800 block">Fruit Yield Better (-3.1%)</span>
                      <p className="text-slate-500">Pekerja borongan Siti Aminah melampaui rendemen standard 60% menjadi 61.6%.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-150 p-3.5 rounded mt-4 text-slate-900 text-[11px]">
                <span className="font-bold block mb-1">Rekomendasi Manufaktur:</span>
                Tingkatkan pengawasan saat penerimaan bahan dari supplier Batu agar kelembapan buah tetap rendah guna menghemat bahan bakar gas.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
