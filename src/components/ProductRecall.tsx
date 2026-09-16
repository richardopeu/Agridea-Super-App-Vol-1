/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Trash2, 
  Search, 
  Plus, 
  ShieldAlert, 
  CheckCircle, 
  Database, 
  User, 
  Truck, 
  Wand2, 
  FileText, 
  Download, 
  Archive,
  RefreshCw
} from 'lucide-react';

interface RecallItem {
  id: string;
  recallNumber: string;
  recallDate: string;
  recallType: 'Quality Issue' | 'Food Safety Issue' | 'Packaging Defect' | 'Customer Complaint' | 'Regulatory Requirement' | 'Other';
  reason: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedBatchId: string;
  affectedSku: string;
  description: string;
  evidenceUrl: string;
  status: 'Reported' | 'Investigated' | 'Approved' | 'Recall Active' | 'Closed';
  affectedQty: number;
  recoveredQty: number;
  openInvestigations: boolean;
}

interface Props {
  state: {
    lokasi: any[];
    stocks: any[];
    batches: any[];
    sales: any[];
    customer: any[];
    produk: any[];
    supplier: any[];
    penerimaan: any[];
  };
  logActivity: (modul: string, deskripsi: string) => void;
  currentUser: {
    id: string;
    username: string;
    role: string;
    lokasiId: string;
    namaLengkap: string;
  };
}

export default function ProductRecall({ state, logActivity, currentUser }: Props) {
  const [recalls, setRecalls] = useState<RecallItem[]>(() => {
    const raw = localStorage.getItem('agridea_recalls');
    if (raw) return JSON.parse(raw);
    
    return [
      {
        id: 'RCL-001',
        recallNumber: 'RCL/202606/001',
        recallDate: '2026-06-02',
        recallType: 'Packaging Defect',
        reason: 'Sealant alu-foil pouch bocor pada bagian lipatan crimping',
        riskLevel: 'Medium',
        affectedBatchId: 'BATCH-20260601-A1',
        affectedSku: 'AGR-APL-100',
        description: 'Ditemukan 5 unit pouch kembung pada pengiriman ke Indogrosir akibat defect sealing roller paking di suhu 140C.',
        evidenceUrl: 'https://images.unsplash.com/photo-1616645258469-ec681c17f3ee?w=150',
        status: 'Closed',
        affectedQty: 1240,
        recoveredQty: 1240,
        openInvestigations: false
      },
      {
        id: 'RCL-002',
        recallNumber: 'RCL/202606/002',
        recallDate: '2026-06-05',
        recallType: 'Food Safety Issue',
        reason: 'Uji organoleptik mendeteksi bau rancidity (tengik) akibat oksidasi minyak goreng sawit',
        riskLevel: 'Critical',
        affectedBatchId: 'BATCH-20260601-A2',
        affectedSku: 'AGR-PSG-150',
        description: 'Tengik terdeteksi setelah 12 jam sirkulasi minyak melebihi 10 siklus penggorengan tanpa pergantian aktif karbon.',
        evidenceUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=150',
        status: 'Recall Active',
        affectedQty: 450,
        recoveredQty: 290,
        openInvestigations: true
      }
    ];
  });

  // Form modals states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New recall form states
  const [recallType, setRecallType] = useState<RecallItem['recallType']>('Quality Issue');
  const [reason, setReason] = useState('');
  const [riskLevel, setRiskLevel] = useState<RecallItem['riskLevel']>('Medium');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [affectedQtyInput, setAffectedQtyInput] = useState('');

  // AI Containment States
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-generate recall id
  const generateRecallNumber = () => {
    const today = new Date();
    const yyyymm = today.getFullYear().toString() + String(today.getMonth() + 1).padStart(2, '0');
    const seq = String(recalls.length + 1).padStart(3, '0');
    return `RCL/${yyyymm}/${seq}`;
  };

  // Perform Auto-Traceability calculations based on the selected batch
  const getAutoTraceData = (batchId: string) => {
    if (!batchId) return null;
    
    const bt = state.batches.find(b => b.id === batchId);
    if (!bt) return null;

    // 1. Inventory in Warehouse (Matches product SKU for finished goods)
    const matchedSku = bt.namaBahan === 'Apel' ? 'AGR-APL-100' : 'AGR-PSG-150';
    const warehouseStkObj = state.stocks.find(s => s.key === matchedSku && s.lokasiId === bt.lokasiId);
    const warehouseQty = warehouseStkObj ? warehouseStkObj.qty : 0;

    // 2. Inventory in Factory (WIP, unpacked chips or frozen output)
    const wipFruitKey = `${bt.namaBahan} Frozen`;
    const factoryWipObj = state.stocks.find(s => s.key === wipFruitKey && s.lokasiId === bt.lokasiId);
    const factoryWipQty = factoryWipObj ? factoryWipObj.qty : 0;

    // 3. Inventory In Transit (From localStorage transfers key)
    const transfersRaw = localStorage.getItem('agridea_transfers');
    let inTransitQty = 0;
    if (transfersRaw) {
      const allTrans = JSON.parse(transfersRaw);
      const transitMatches = allTrans.filter(
        (t: any) => t.batchNumber === batchId && (t.status === 'In Transit' || t.status === 'Submitted')
      );
      inTransitQty = transitMatches.reduce((sum: number, t: any) => sum + t.quantity, 0);
    }

    // 4. Customers Receiving Batch (Retrieve sales matched invoices)
    // Filter invoices associated with this batch ID
    const matchingSales = state.sales.filter(s => s.items.some((it: any) => it.batchId === batchId));
    let rawSoldQty = 0;
    const customerList = matchingSales.map(sales => {
      const custObj = state.customer.find(c => c.id === sales.customerId);
      const matchingItem = sales.items.find((it: any) => it.batchId === batchId);
      const soldPcs = matchingItem ? matchingItem.qtyPcs : 0;
      rawSoldQty += soldPcs;
      return {
        customerName: custObj?.nama || 'Indogrosir Branch',
        location: custObj?.alamat || 'Direktorat Distribusi',
        invoiceNumber: sales.notaNumber,
        suratJalan: sales.suratJalanNumber || 'SJ-DELIVERY-DISPATCHED',
        dateShipped: sales.tanggal,
        pcsSold: soldPcs,
        invoiceRevenue: sales.totalPenjualan
      };
    });

    return {
      batchId,
      sku: matchedSku,
      warehouseQty,
      factoryWipQty,
      inTransitQty,
      totalSoldQty: rawSoldQty || (bt.totalHasilPcs || 450),
      customers: customerList
    };
  };

  const autoTraceData = getAutoTraceData(selectedBatchId);

  // Submit recall request
  const handleCreateRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert('Pilih batch yang terdampak!');
      return;
    }

    const rNum = generateRecallNumber();
    const resolvedTrace = getAutoTraceData(selectedBatchId);
    const calculatedAffQty = resolvedTrace ? (resolvedTrace.warehouseQty + resolvedTrace.totalSoldQty + resolvedTrace.inTransitQty) : 1000;

    const newRecall: RecallItem = {
      id: 'RCL-' + Date.now(),
      recallNumber: rNum,
      recallDate: new Date().toISOString().split('T')[0],
      recallType: recallType,
      reason: reason,
      riskLevel: riskLevel,
      affectedBatchId: selectedBatchId,
      affectedSku: selectedSku || (selectedBatchId === 'BATCH-20260601-A1' ? 'AGR-APL-100' : 'AGR-PSG-150'),
      description: description,
      evidenceUrl: evidenceUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=150',
      status: 'Reported',
      affectedQty: parseFloat(affectedQtyInput) || calculatedAffQty,
      recoveredQty: 0,
      openInvestigations: true
    };

    setRecalls(prev => [newRecall, ...prev]);
    localStorage.setItem('agridea_recalls', JSON.stringify([newRecall, ...recalls]));
    logActivity('Recall Management', `Membuat tiket recall baru ${rNum} untuk batch ${selectedBatchId} tingkat risiko ${riskLevel}`);
    
    // Reset states
    setReason('');
    setDescription('');
    setEvidenceUrl('');
    setAffectedQtyInput('');
    setSelectedBatchId('');
    setShowAddModal(false);
  };

  // Change workflow step in recall
  const handleUpdateStatus = (id: string, nextStatus: RecallItem['status']) => {
    setRecalls(prev => prev.map(r => {
      if (r.id === id) {
        let recQty = r.recoveredQty;
        if (nextStatus === 'Closed') {
          // Recover full exposure amount
          recQty = r.affectedQty;
        } else if (nextStatus === 'Recall Active') {
          recQty = Math.floor(r.affectedQty * 0.65); // recovers partial blockages
        }
        return {
          ...r,
          status: nextStatus,
          recoveredQty: recQty,
          openInvestigations: nextStatus !== 'Closed'
        };
      }
      return r;
    }));
    
    const label = recalls.find(r => r.id === id)?.recallNumber;
    logActivity('Recall Management', `Workflow update: recall ${label} status diubah ke ${nextStatus}`);
  };

  // AI Containment and impact analyzer
  const generateAiReport = (rItem: RecallItem) => {
    setIsAiLoading(true);
    setTimeout(() => {
      const trace = getAutoTraceData(rItem.affectedBatchId);
      const totalFinancialLoss = (rItem.affectedQty - rItem.recoveredQty) * 14500; // Mock losses Rp 14,500/pcs

      setAiReport({
        title: `Rencana Penahanan (Recall Containment Plan) - ${rItem.recallNumber}`,
        problem: `Batch ${rItem.affectedBatchId} terkontaminasi insiden ${rItem.recallType} dengan paparan risiko ${rItem.riskLevel}. Kargo terjual senilai Rp ${totalFinancialLoss.toLocaleString('id-ID')} tersebar di pasar ritel bebas.`,
        challenge: `Lokasi rantai kemasan Cikarang (AGDN) dan logistik jalanan saat ini menampung ${trace?.inTransitQty || 0} pcs WIP yang berpotensi bocor atau rusak jika tidak ditarik terhitung dalam 12 jam ini.`,
        rootCause: `Kelalaian operator pada pemantauan suhu roll sealer (CCP-6) pada tahap packing ditambah kurangnya kalibrasi sensor visual kemasan di fasilitas Kemas Facility.`,
        actionPlan: [
          `BLOKIR sisa stok ${trace?.warehouseQty || 0} Pcs di Gudang penyimpanan agar tidak diteror surat jalan ekspedisi.`,
          `Hubungi perwakilan outlet "${trace?.customers[0]?.customerName || 'Indogrosir'}" untuk langsung menghentikan pemajangan sisa ${trace?.totalSoldQty || 0} Pcs di rak penjualan.`,
          `Lakukan penyitaan kargo in-transit (${trace?.inTransitQty || 0} Pcs) dan arahkan truk ekspedisi terdekat untuk memutar kembali ke Dieng (MPD) sebagai limbah waste.`,
          `Latih kembali kru sealer paking untuk memverifikasi critical limit sealer (140°C - 160°C) sebelum menyalakan mesin.`
        ],
        riskAssessment: rItem.riskLevel === 'Critical' ? "🔴 CRITICAL - Risiko denda regulatori & komplain massal konsumen." : "🟡 WARNING - Potensi degradasi kepercayaan retail partner.",
        priorityLevel: rItem.riskLevel
      });
      setIsAiLoading(false);
    }, 1200);
  };

  // Dashboard calculations
  const activeRecalls = recalls.filter(r => r.status === 'Recall Active').length;
  const closedRecalls = recalls.filter(r => r.status === 'Closed').length;
  const totAffQty = recalls.reduce((sum, r) => sum + r.affectedQty, 0);
  const totRecQty = recalls.reduce((sum, r) => sum + r.recoveredQty, 0);
  const openInvs = recalls.filter(r => r.openInvestigations).length;

  return (
    <div className="space-y-6 animate-fade-in" id="product-recall-root">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            <span>Product Recall &amp; Safety Containment</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sistem krisis penanganan kepatuhan pangan (food safety control). Blokir stok bermasalah di gudang, cegah pengapalan transit, dan tarik peredaran barang cepat kilat di outlet retail.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Laporkan Hazard / Recall</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Recalls</span>
            <span className="text-lg font-black text-rose-750 block">{activeRecalls} Kasus</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Closed &amp; Resolved</span>
            <span className="text-lg font-black text-slate-900 block">{closedRecalls} Kasus</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-slate-50 text-slate-600">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Affected Quantity</span>
            <span className="text-lg font-black text-slate-900 block">{totAffQty.toLocaleString('id-ID')} Pcs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-sky-50 text-sky-600">
            <Database className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recovered Quantity</span>
            <span className="text-lg font-black text-emerald-700 block">{totRecQty.toLocaleString('id-ID')} Pcs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3 col-span-2 lg:col-span-1">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <CheckCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Open Investigation</span>
            <span className="text-lg font-black text-amber-700 block">{openInvs} Investigasi</span>
          </div>
        </div>
      </div>

      {/* AI Containment Impact Outputs */}
      {isAiLoading && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl shadow-xs animate-pulse flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
          <span className="text-xs font-mono">Crisis AI Command Center sedang memetakan rantai penarikan ritel belanja...</span>
        </div>
      )}

      {aiReport && !isAiLoading && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-indigo-950 shadow-md animate-fade-in space-y-3 text-xs leading-relaxed">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <h4 className="font-extrabold text-xs text-rose-400 tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>{aiReport.title}</span>
            </h4>
            <span className="bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded border border-rose-500/20 font-black tracking-wider uppercase text-[9px]">
              {aiReport.riskAssessment}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 border-r border-slate-800/60 pr-4">
              <p className="text-slate-400"><strong className="text-slate-200 block mb-0.5">⚠️ Ringkasan Kerusakan &amp; Eksposur Finansial:</strong> {aiReport.problem}</p>
              <p className="text-slate-400"><strong className="text-slate-200 block mb-0.5">🔥 Titik Penyebaran WIP:</strong> {aiReport.challenge}</p>
              <p className="text-slate-400"><strong className="text-slate-200 block mb-0.5">🧠 Root Cause Analisis:</strong> {aiReport.rootCause}</p>
            </div>
            
            <div className="space-y-2 pl-2">
              <strong className="text-rose-400 block uppercase tracking-wider text-[10px]">✨ Prosedur Penarikan Segera (Urgent Response Plan):</strong>
              <ul className="space-y-1.5 text-slate-200 list-decimal pl-4">
                {aiReport.actionPlan.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <div className="pt-2 font-mono text-[10px] text-slate-400">
                CONTAINMENT STATUS: <span className="text-rose-400 font-bold">READY TO DEPLOY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Recalls List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECALL TICKETS TABLE */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="bg-slate-50/50 p-4 border-b">
            <h3 className="font-extrabold text-slate-800">Daftar Laporan Recall &amp; Keamanan Pangan</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider border-b text-[10px]">
                  <th className="py-3 px-4">Recall ID</th>
                  <th className="py-3 px-4">Recall Type</th>
                  <th className="py-3 px-4">Affected Batch</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Reason / Masalah</th>
                  <th className="py-3 px-4">Exposure / Rec Qty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action / AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recalls.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        {r.recallNumber}
                        <span className="block font-normal text-[9.5px] text-slate-400 mt-0.5">{r.recallDate}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded uppercase ${
                          r.recallType === 'Food Safety Issue' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                          r.recallType === 'Packaging Defect' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          'bg-slate-50 border-slate-100 text-slate-600'
                        }`}>
                          {r.recallType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-700">{r.affectedBatchId}</td>
                      <td className="py-4 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                          r.riskLevel === 'Critical' ? 'bg-rose-600 text-white animate-pulse' :
                          r.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                          r.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.riskLevel}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <span className="font-bold text-slate-900 block">{r.reason}</span>
                        <span className="text-[10px] text-slate-450 block italic mt-0.5 truncate max-w-[280px]">{r.description}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">Exp: {r.affectedQty} Pcs</span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-1 py-0.2 rounded mt-1 text-center">Rec: {r.recoveredQty} Pcs</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          r.status === 'Closed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          r.status === 'Recall Active' ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' :
                          r.status === 'Investigated' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => generateAiReport(r)}
                            className="p-1 px-2 border hover:bg-slate-50 border-indigo-200 text-indigo-700 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Containment</span>
                          </button>
                          
                          {r.status === 'Reported' && (
                            <button 
                              onClick={() => handleUpdateStatus(r.id, 'Investigated')}
                              className="px-2 py-0.8 bg-amber-500 hover:bg-amber-600 inline-block text-white rounded font-bold text-[9px]"
                            >
                              Investigate
                            </button>
                          )}

                          {r.status === 'Investigated' && (
                            <button 
                              onClick={() => handleUpdateStatus(r.id, 'Recall Active')}
                              className="px-2 py-0.8 bg-rose-600 hover:bg-rose-700 inline-block text-white rounded font-bold text-[9px]"
                            >
                              Activate Recall
                            </button>
                          )}

                          {r.status === 'Recall Active' && (
                            <button 
                              onClick={() => handleUpdateStatus(r.id, 'Closed')}
                              className="px-2 py-0.8 bg-emerald-600 hover:bg-emerald-700 inline-block text-white rounded font-bold text-[9px]"
                            >
                              Close Case
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE NEW RECALL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden text-xs">
            <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm tracking-tight">Formulir Laporan Hazard &amp; Penarikan Produk</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleCreateRecall} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Batch Terdampak</label>
                  <select 
                    value={selectedBatchId}
                    onChange={e => {
                      setSelectedBatchId(e.target.value);
                      const bt = state.batches.find(b => b.id === e.target.value);
                      if (bt) {
                        setSelectedSku(bt.namaBahan === 'Apel' ? 'AGR-APL-100' : 'AGR-PSG-150');
                      }
                    }}
                    required
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  >
                    <option value="">Pilih Batch Produksi...</option>
                    {state.batches.map(b => (
                      <option key={b.id} value={b.id}>{b.id} - {b.namaBahan} ({b.tanggalMulai})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">SKU Terpaut</label>
                  <input 
                    type="text" 
                    value={selectedSku}
                    readOnly
                    placeholder="Auto-matched SKU"
                    className="w-full p-2 bg-slate-150 border text-slate-500 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tipe Incident / Recall</label>
                  <select 
                    value={recallType}
                    onChange={e => setRecallType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  >
                    <option value="Quality Issue">Quality Issue (Penyusutan Kerenyahan)</option>
                    <option value="Food Safety Issue">Food Safety Issue (Kontaminasi/Tengik)</option>
                    <option value="Packaging Defect">Packaging Defect (Seal Bocor/Gembung)</option>
                    <option value="Customer Complaint">Customer Complaint (Laporan Konsumen)</option>
                    <option value="Regulatory Requirement">Regulatory Requirement (Standard BPOM)</option>
                    <option value="Other">Other (Lain-lain)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Risk Level (Tingkat Dampak)</label>
                  <select 
                    value={riskLevel}
                    onChange={e => setRiskLevel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600 font-semibold"
                  >
                    <option value="Low">Low - Risiko Minor Internal</option>
                    <option value="Medium">Medium - Potensi Retur Toko</option>
                    <option value="High">High - Komplain Lisensi Retail</option>
                    <option value="Critical">Critical - Bahaya Kesehatan Konsumen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Subjek / Alasan Recall Singkat</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Sealant crimper bocor pada suhu kemasan di bawah target" 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kuantitas Terpapar (Pcs)</label>
                  <input 
                    type="number" 
                    placeholder="Kosongkan untuk menghitung otomatis" 
                    value={affectedQtyInput}
                    onChange={e => setAffectedQtyInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Link Foto Bukti Laboratorium / Defect</label>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/defect-photo" 
                    value={evidenceUrl}
                    onChange={e => setEvidenceUrl(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Deskripsi &amp; Temuan Investigasi Lapangan</label>
                <textarea 
                  rows={3} 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  placeholder="Ceritakan temuan detail sirkulasi minyak goreng, uji organoleptik atau sensor visual yang gagal..."
                />
              </div>

              {/* LIVE AUTO-TRACE IMPACT SIMULATOR DISPLAY */}
              {selectedBatchId && autoTraceData && (
                <div className="bg-slate-50 border p-3 rounded-lg space-y-1.5 font-mono text-[10px] leading-tight text-slate-700">
                  <span className="block font-black text-rose-700 border-b pb-1">⚡ ANALISIS DAMPAK DISTRIBUSI (Live Simulator):</span>
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <div>
                      <span>Stok di Gudang:</span>
                      <strong className="block text-slate-900">{autoTraceData.warehouseQty} Pcs</strong>
                    </div>
                    <div>
                      <span>Stok WIP Pabrik:</span>
                      <strong className="block text-slate-900">{autoTraceData.factoryWipQty} kg</strong>
                    </div>
                    <div>
                      <span>Stok In Transit:</span>
                      <strong className="block text-slate-900">{autoTraceData.inTransitQty} Pcs</strong>
                    </div>
                  </div>
                  <div className="border-t pt-1">
                    <span>Sold / Terkirim ke Mitra Retail:</span>
                    <strong className="block text-slate-900">
                      {autoTraceData.totalSoldQty} Pcs ({autoTraceData.customers.length} outlet terinfeksi)
                    </strong>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 font-bold"
                >
                  Tutup
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Isukan Laporan &amp; Tahan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
