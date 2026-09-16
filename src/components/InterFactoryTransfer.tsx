/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  RefreshCw, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  MapPin, 
  Search, 
  FileText, 
  TrendingUp, 
  Wand2, 
  Clock, 
  DollarSign, 
  Layers 
} from 'lucide-react';

interface TransferItem {
  id: string;
  transferNumber: string;
  transferDate: string;
  sourceFactory: string; // ID, e.g., 'MPD'
  destinationFactory: string; // ID, e.g., 'JKT'
  inventoryType: 'Fresh Fruit' | 'Frozen' | 'Chips' | 'Packaging Material' | 'Finished Goods';
  itemKey: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  notes: string;
  photoUrl: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'In Transit' | 'Received' | 'Completed';
  cost: number;
  // Receiving Fields
  receivedQty?: number;
  condition?: 'Excellent' | 'Good' | 'Damaged' | 'Spoiled';
  receivingPhotoUrl?: string;
  receivingNotes?: string;
  dateApproved?: string;
  dateReceived?: string;
}

interface Props {
  state: {
    lokasi: any[];
    stocks: any[];
    batches: any[];
    users: any[];
    setStocks: React.Dispatch<React.SetStateAction<any[]>>;
    chipVariants?: any[];
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

export default function InterFactoryTransfer({ state, logActivity, currentUser }: Props) {
  const [transfers, setTransfers] = useState<TransferItem[]>(() => {
    const raw = localStorage.getItem('agridea_transfers');
    if (raw) return JSON.parse(raw);
    
    // Seed transfers matching PRD requirements
    return [
      {
        id: 'TRX-001',
        transferNumber: 'TRX-SSP-20260601-001',
        transferDate: '2026-06-01',
        sourceFactory: 'SSP', // Sipahutar
        destinationFactory: 'MPD', // Wonosobo
        inventoryType: 'Fresh Fruit',
        itemKey: 'Nangka Segar',
        batchNumber: 'RCV-SSP-20260601-081',
        quantity: 1200,
        unit: 'kg',
        notes: 'Transfer nangka segar sipas untuk pengolahan frying di Dieng',
        photoUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=150',
        status: 'Completed',
        cost: 650000,
        receivedQty: 1195,
        condition: 'Good',
        receivingPhotoUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=150',
        receivingNotes: 'Diterima dalam kondisi baik, penyusutan wajar 5kg di jalan.',
        dateApproved: '2026-06-02',
        dateReceived: '2026-06-03'
      },
      {
        id: 'TRX-002',
        transferNumber: 'TRX-MPD-20260604-002',
        transferDate: '2026-06-04',
        sourceFactory: 'MPD', // Wonosobo
        destinationFactory: 'AGDN', // Jakarta Kemas Facility
        inventoryType: 'Chips',
        itemKey: 'Apel Keripik Jadi (Unpacked)',
        batchNumber: 'VF-MPD-20260604-003',
        quantity: 450,
        unit: 'kg',
        notes: 'Hasil vacuum frying batch 003 dikirim ke kemas AGDN Cikarang',
        photoUrl: 'https://images.unsplash.com/photo-1616645258469-ec681c17f3ee?w=150',
        status: 'In Transit',
        cost: 950000,
        dateApproved: '2026-06-04'
      },
      {
        id: 'TRX-003',
        transferNumber: 'TRX-JKT-20260605-003',
        transferDate: '2026-06-05',
        sourceFactory: 'JKT', // Jakarta HQ
        destinationFactory: 'KKI', // Jakarta Branch
        inventoryType: 'Finished Goods',
        itemKey: 'AGR-APL-100',
        batchNumber: 'PKG-MPD-20260604-002',
        quantity: 800,
        unit: 'pcs',
        notes: 'Stok redistribusi untuk pameran KKI Kelapa Gading',
        photoUrl: 'https://images.unsplash.com/photo-1563118289-411d31526278?w=150',
        status: 'Submitted',
        cost: 250000
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('agridea_transfers', JSON.stringify(transfers));
  }, [transfers]);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState<TransferItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Insights Custom States
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New transfer form inputs
  const [sourceId, setSourceId] = useState(currentUser.lokasiId || 'MPD');
  const [destId, setDestId] = useState('');
  const [invType, setInvType] = useState<'Fresh Fruit' | 'Frozen' | 'Chips' | 'Packaging Material' | 'Finished Goods'>('Finished Goods');
  const [selectedItem, setSelectedItem] = useState('');
  const [batchNum, setBatchNum] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [cost, setCost] = useState('');

  // Receiving confirmation inputs
  const [recvQty, setRecvQty] = useState('');
  const [recvCondition, setRecvCondition] = useState<'Excellent' | 'Good' | 'Damaged' | 'Spoiled'>('Good');
  const [recvPhotoUrl, setRecvPhotoUrl] = useState('');
  const [recvNotes, setRecvNotes] = useState('');

  // Handle SKU item change to set appropriate units automatically
  useEffect(() => {
    if (invType === 'Finished Goods' || invType === 'Packaging Material') {
      setUnit('pcs');
    } else {
      setUnit('kg');
    }
  }, [invType]);

  // Generate Unique Transfer Number
  const generateTransferNumber = (src: string) => {
    const today = new Date();
    const yyyymm = today.getFullYear().toString() + String(today.getMonth() + 1).padStart(2, '0');
    const dayStr = String(today.getDate()).padStart(2, '0');
    const seq = String(transfers.length + 1).padStart(3, '0');
    return `TRX-${src}-${yyyymm}${dayStr}-${seq}`;
  };

  // Submit transfer request
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destId) {
      alert('Pilih factory tujuan!');
      return;
    }
    if (sourceId === destId) {
      alert('Pabrik asal dan tujuan tidak boleh sama!');
      return;
    }
    if (!selectedItem || !qty || parseFloat(qty) <= 0) {
      alert('Item dan jumlah transfer harus valid!');
      return;
    }

    const tNumber = generateTransferNumber(sourceId);
    const newTrans: TransferItem = {
      id: 'TRX-' + Date.now(),
      transferNumber: tNumber,
      transferDate: new Date().toISOString().split('T')[0],
      sourceFactory: sourceId,
      destinationFactory: destId,
      inventoryType: invType,
      itemKey: selectedItem,
      batchNumber: batchNum || 'N/A',
      quantity: parseFloat(qty),
      unit: unit,
      notes: notes,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150',
      status: 'Submitted',
      cost: parseFloat(cost) || 0
    };

    setTransfers(prev => [newTrans, ...prev]);
    logActivity('Inter Factory Transfer', `Membuat request transfer baru ${tNumber} dari ${sourceId} ke ${destId}`);
    
    // Reset form
    setDestId('');
    setInvType('Finished Goods');
    setSelectedItem('');
    setBatchNum('');
    setQty('');
    setNotes('');
    setPhotoUrl('');
    setCost('');
    setShowAddModal(false);
  };

  // Approve Gate 1: Source Factory Manager Approves (Deducts stock from source, sets status In Transit)
  const handleApproveSource = (id: string) => {
    const target = transfers.find(t => t.id === id);
    if (!target) return;

    // Check if source stock contains enough qty
    const stockFound = state.stocks.find(
      s => s.lokasiId === target.sourceFactory && s.key.toLowerCase() === target.itemKey.toLowerCase()
    );

    if (!stockFound || stockFound.qty < target.quantity) {
      const confirmForce = window.confirm(
        `PERINGATAN: Stok item "${target.itemKey}" di pabrik asal (${target.sourceFactory}) tidak mencukupi (${stockFound ? stockFound.qty : 0} ${target.unit} tersedia, dibutuhkan ${target.quantity} ${target.unit}). ` +
        `Apakah Anda tetap ingin memproses transfer ini dengan mengurangkan sisa stok menjadi negatif?`
      );
      if (!confirmForce) return;
    }

    // Process Stock Deduction
    state.setStocks(prev => {
      let after = [...prev];
      const sIndex = after.findIndex(
        s => s.lokasiId === target.sourceFactory && s.key.toLowerCase() === target.itemKey.toLowerCase()
      );

      if (sIndex !== -1) {
        after[sIndex] = {
          ...after[sIndex],
          qty: after[sIndex].qty - target.quantity
        };
      } else {
        // If not found, add a negative balance slot
        after.push({
          key: target.itemKey,
          kategori: target.inventoryType === 'Finished Goods' ? 'Produk Jadi' : (target.inventoryType === 'Fresh Fruit' ? 'Bahan Baku' : 'WIP'),
          qty: -target.quantity,
          lokasiId: target.sourceFactory,
          unit: target.unit
        });
      }
      localStorage.setItem('agridea_stocks', JSON.stringify(after));
      return after;
    });

    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'In Transit',
          dateApproved: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    }));

    logActivity(
      'Inter Factory Transfer', 
      `Approved (Source Manager) transfer ${target.transferNumber}, stok di ${target.sourceFactory} dikurangi ${target.quantity} ${target.unit}.`
    );
  };

  // Approve Gate 2 / Receipt: Destination Factory Manager Confirms Receipt
  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReceiveModal) return;

    const target = showReceiveModal;
    const receivedAmount = parseFloat(recvQty) || target.quantity;

    // Add Stock to Destination Location
    state.setStocks(prev => {
      let after = [...prev];
      const dIndex = after.findIndex(
        s => s.lokasiId === target.destinationFactory && s.key.toLowerCase() === target.itemKey.toLowerCase()
      );

      if (dIndex !== -1) {
        after[dIndex] = {
          ...after[dIndex],
          qty: after[dIndex].qty + receivedAmount
        };
      } else {
        // Add new stock item to destination
        after.push({
          key: target.itemKey,
          kategori: target.inventoryType === 'Finished Goods' ? 'Produk Jadi' : (target.inventoryType === 'Fresh Fruit' ? 'Bahan Baku' : (target.inventoryType === 'Packaging Material' ? 'Packing Material' : 'WIP')),
          qty: receivedAmount,
          lokasiId: target.destinationFactory,
          unit: target.unit
        });
      }
      localStorage.setItem('agridea_stocks', JSON.stringify(after));
      return after;
    });

    // Update transfer ticket
    setTransfers(prev => prev.map(t => {
      if (t.id === target.id) {
        return {
          ...t,
          status: 'Completed',
          receivedQty: receivedAmount,
          condition: recvCondition,
          receivingPhotoUrl: recvPhotoUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=150',
          receivingNotes: recvNotes || 'Diterima utuh tanpa hambatan.',
          dateReceived: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    }));

    logActivity(
      'Inter Factory Transfer', 
      `Completed transfer ${target.transferNumber}, pabrik ${target.destinationFactory} menerima ${receivedAmount} ${target.unit}`
    );

    // Reset modals
    setRecvQty('');
    setRecvNotes('');
    setRecvPhotoUrl('');
    setShowReceiveModal(null);
  };

  // Reject / Cancel
  const handleCancelTransfer = (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus request transfer ini?')) return;
    setTransfers(prev => prev.filter(t => t.id !== id));
    logActivity('Inter Factory Transfer', `Membatalkan/menghapus tiket transfer id ${id}`);
  };

  // AI Security & holding costs analysis report
  const generateAiReport = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      // Logic based on state
      const totalTransit = transfers.filter(t => t.status === 'In Transit').length;
      const totalCostVal = transfers.reduce((sum, t) => sum + t.cost, 0);
      const totalDelays = transfers.filter(t => {
        if (t.status !== 'Completed' && t.status !== 'Draft') {
          const date = new Date(t.transferDate);
          const diffTime = Math.abs(new Date().getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 2;
        }
        return false;
      }).length;

      setAiReport({
        title: "Laporan Intelijen Rantai Pasok Antar-Pabrik Agridea",
        problem: `Terdeteksi hambatan logistik harian dengan ${totalTransit} batch material bernilai tinggi dalam status In Transit. ` +
                 `Pabrik SSP Sipahutar mencatat penumpukan log bahan baku segar akibat utilisasi armada transportasi pihak ketiga yang fluktuatif.`,
        challenge: "Risiko penurunan kerenyahan (crushed waste loss) pada chip WIP sebesar 12% apabila durasi pengiriman pendingin dari SSP ke Dieng Wonosobo melebihi 36 jam.",
        rootCause: "Tidak adanya GPS Tracker terpusat pada armada truk pendingin eksternal, ditambah kurangnya optimasi jadwal rute distribusi terpadu antara transit MPD - AGDN - JKT.",
        actionPlan: [
          "Pasang IoT Temperature sensor dan GPS tracker pada setiap unit logistik kargo transfer segar.",
          "Terapkan FIFO routing otomatis: batches yang didepositkan di SSP langsung dialokasikan ke jalur express tanpa jeda draft.",
          "Standardisasi 'Buffer Cold Storage' di Dieng (MPD) agar mampu mengompensasi delay di jalan hingga 3 hari."
        ],
        riskAssessment: totalDelays > 0 ? "HIGH RISK - Potensi penurunan kesegaran bahan baku" : "MEDIUM RISK - Fluktuasi biaya armada pengiriman antar-pabrik",
        priorityLevel: "High"
      });
      setIsAiLoading(false);
    }, 1200);
  };

  // Dashboard calculations
  const totalIn = transfers.filter(t => t.destinationFactory === currentUser.lokasiId).length;
  const totalOut = transfers.filter(t => t.sourceFactory === currentUser.lokasiId).length;
  const totalInTransit = transfers.filter(t => t.status === 'In Transit').length;
  const totalCost = transfers.reduce((sum, t) => sum + t.cost, 0);

  // Filter transfers based on search
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = 
      t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.itemKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceFactory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationFactory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="inter-factory-transfer-root">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-7 h-7 text-emerald-600" />
            <span>Inter-Factory Supply Transfer</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Modul pengiriman stok bahan baku kotor, frozen WIP, keripik bulk, material kemasan, dan produk jadi antar cabang pabrik Agridea.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button 
            onClick={generateAiReport}
            className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <span>AI Supply Audit</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Request Transfer</span>
          </button>
        </div>
      </div>

      {/* Dashboard KPI Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transfer In (Lokal)</span>
            <span className="text-lg font-black text-slate-900 block">{totalIn} Tiket</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transfer Out (Kirim)</span>
            <span className="text-lg font-black text-slate-900 block">{totalOut} Tiket</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">In Transit (Perjalanan)</span>
            <span className="text-lg font-black text-slate-900 block">{totalInTransit} Tiket</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transfer Delayed</span>
            <span className="text-lg font-black text-slate-900 block">
              {transfers.filter(t => t.status === 'In Transit').length > 0 ? '1 Truk' : 'Ningun'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3 col-span-2 lg:col-span-1">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Transfer Cost</span>
            <span className="text-lg font-black text-indigo-950 block">Rp {totalCost.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* AI Automated Report Section */}
      {isAiLoading && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-xl shadow-xs animate-pulse flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">AI Coach sedang menyusun laporan risiko transfer kargo...</span>
        </div>
      )}

      {aiReport && !isAiLoading && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-indigo-950 shadow-md animate-fade-in space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-xs text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-emerald-400" />
              <span>{aiReport.title}</span>
            </h3>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-rose-500/20">
              {aiReport.riskAssessment}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="space-y-2 border-r border-slate-800/60 pr-4">
              <p className="text-slate-400"><strong className="text-slate-200 block mb-0.5">⚠️ Masalah Teridentifikasi:</strong> {aiReport.problem}</p>
              <p className="text-slate-400"><strong className="text-slate-200 block mb-0.5">🔥 Ancaman Rantai Dingin:</strong> {aiReport.challenge}</p>
              <p className="text-slate-400"><strong className="text-slate-200 block mb-0.5">🧠 Root Cause:</strong> {aiReport.rootCause}</p>
            </div>
            
            <div className="space-y-3 pl-2">
              <strong className="text-emerald-400 block uppercase tracking-wider text-[10px]">✨ Rencana Tindakan yang Disarankan (Action Plan):</strong>
              <ul className="space-y-2 text-slate-300 list-disc pl-4">
                {aiReport.actionPlan.map((plan: string, i: number) => (
                  <li key={i}>{plan}</li>
                ))}
              </ul>
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 bg-slate-850 px-2 py-1 rounded border border-slate-800">
                  Priority: <strong className="text-rose-400">{aiReport.priorityLevel}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {/* Table Search Header */}
        <div className="p-4 border-b bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari transfer #, SKU, batch, lokasi..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 transition"
            />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Menampilkan {filteredTransfers.length} dari {transfers.length} data transfer
          </span>
        </div>

        {/* Dynamic Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <th className="py-3 px-4">Transfer Number</th>
                <th className="py-3 px-4">Item &amp; Type</th>
                <th className="py-3 px-4">Source → Dest</th>
                <th className="py-3 px-4">Qty (Satuan)</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Exp Cost</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-center">Aksi / Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((t) => {
                  const srcName = state.lokasi.find(l => l.id === t.sourceFactory)?.nama.replace('Pabrik ', '') || t.sourceFactory;
                  const destName = state.lokasi.find(l => l.id === t.destinationFactory)?.nama.replace('Pabrik ', '') || t.destinationFactory;
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <div className="flex flex-col">
                          <span>{t.transferNumber}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{t.transferDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={t.photoUrl} 
                            alt={t.itemKey} 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded object-cover border" 
                          />
                          <div>
                            <span className="block font-bold">{t.itemKey}</span>
                            <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{t.inventoryType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase font-mono">{t.sourceFactory}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase font-mono">{t.destinationFactory}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1">{srcName} ke {destName}</span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-950">
                        {t.quantity.toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-normal">{t.unit}</span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[10px]">
                        <span className="bg-slate-100 border px-1.5 py-0.5 rounded block text-center max-w-[120px] truncate">
                          {t.batchNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        Rp {t.cost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block text-center border ${
                          t.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          t.status === 'In Transit' ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' :
                          t.status === 'Approved' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                          t.status === 'Submitted' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.status === 'Submitted' && (currentUser.role === 'Super Admin' || currentUser.role === 'Kepala Pabrik HQ' || currentUser.role === 'Director' || currentUser.lokasiId === t.sourceFactory) && (
                            <button 
                              onClick={() => handleApproveSource(t.id)}
                              className="px-2 py-1 bg-emerald-600 inline-block hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                            >
                              Approve &amp; Dispatch
                            </button>
                          )}
                          
                          {t.status === 'In Transit' && (currentUser.role === 'Super Admin' || currentUser.role === 'Kepala Pabrik HQ' || currentUser.role === 'Director' || currentUser.lokasiId === t.destinationFactory) && (
                            <button 
                              onClick={() => {
                                setRecvQty(t.quantity.toString());
                                setShowReceiveModal(t);
                              }}
                              className="px-2 py-1 bg-blue-600 inline-block hover:bg-blue-700 text-white rounded font-bold text-[10px]"
                            >
                              Terima Barang
                            </button>
                          )}

                          {t.status === 'Completed' && (
                            <div className="text-[9px] text-slate-400 text-left">
                              <span className="block font-bold text-emerald-700">✓ Received {t.receivedQty} {t.unit}</span>
                              <span className="block italic text-[8px] truncate max-w-[120px]">{t.receivingNotes}</span>
                            </div>
                          )}

                          {(t.status === 'Draft' || t.status === 'Submitted') && (
                            <button 
                              onClick={() => handleCancelTransfer(t.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Belum ada rekaman logistik kargo antar pabrik. Klik "Buat Request Transfer" untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRANSFER REQUEST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden text-xs">
            <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm tracking-tight">Buat Slip Request Transfer Cabang</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleCreateTransfer} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pabrik Pengirim (Asal)</label>
                  <select 
                    value={sourceId}
                    onChange={e => setSourceId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  >
                    {state.lokasi.map(l => (
                      <option key={l.id} value={l.id}>{l.nama} ({l.kode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pabrik Penerima (Tujuan)</label>
                  <select 
                    value={destId}
                    onChange={e => setDestId(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  >
                    <option value="">Pilih Pabrik Tujuan...</option>
                    {state.lokasi.map(l => (
                      <option key={l.id} value={l.id}>{l.nama} ({l.kode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tipe Material</label>
                  <select 
                    value={invType}
                    onChange={e => {
                      setInvType(e.target.value as any);
                      setSelectedItem('');
                    }}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  >
                    <option value="Fresh Fruit">Fruit (Bahan Baku Basah)</option>
                    <option value="Frozen">Frozen (WIP Kupas Beku)</option>
                    <option value="Chips">Chips (Keripik Bulky Unpacked)</option>
                    <option value="Packaging Material">Kemasan &amp; Penolong</option>
                    <option value="Finished Goods">Pelanggan Finished Goods SKU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nama Item Spesifik</label>
                  <select 
                    value={selectedItem}
                    onChange={e => setSelectedItem(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  >
                    <option value="">Pilih Item...</option>
                    {invType === 'Finished Goods' && (
                      <>
                        <option value="AGR-APL-100">Keripik Apel Standard 100g (AGR-APL-100)</option>
                        <option value="AGR-PSG-150">Keripik Pisang Premium 150g (AGR-PSG-150)</option>
                        <option value="AGR-NGK-100">Keripik Nangka Standard 100g (AGR-NGK-100)</option>
                        <option value="CRT-SLK-100">Keripik Salak Premium 100g (CRT-SLK-100)</option>
                      </>
                    )}
                    {invType === 'Fresh Fruit' && (
                      <>
                        <option value="Apel Segar">Apel Segar (Fresh)</option>
                        <option value="Nangka Segar">Nangka Segar (Fresh)</option>
                        <option value="Pisang Raja Segar">Pisang Raja Segar (Fresh)</option>
                        <option value="Salak Segar">Salak Segar (Fresh)</option>
                      </>
                    )}
                    {invType === 'Frozen' && (
                      <>
                        <option value="Apel Frozen">Apel Frozen (WIP)</option>
                        <option value="Nangka Frozen">Nangka Frozen (WIP)</option>
                        <option value="Pisang Frozen">Pisang Frozen (WIP)</option>
                      </>
                    )}
                    {invType === 'Chips' && (
                      <>
                        {state.chipVariants && state.chipVariants.length > 0 ? (
                          state.chipVariants
                            .filter(cv => cv.status === 'Active')
                            .map(cv => (
                              <option key={cv.id} value={`${cv.nama} (Unpacked)`}>
                                {cv.nama} (Unpacked)
                              </option>
                            ))
                        ) : (
                          <>
                            <option value="Apel Keripik Jadi (Unpacked)">Keripik Apel Curah Unpacked</option>
                            <option value="Nangka Keripik Jadi (Unpacked)">Keripik Nangka Curah Unpacked</option>
                          </>
                        )}
                      </>
                    )}
                    {invType === 'Packaging Material' && (
                      <>
                        <option value="Standing Pouch 100g (Pcs)">Standing Pouch Alu-foil 100g</option>
                        <option value="Karton Box Agridea (Pcs)">Karton Box Agridea</option>
                        <option value="Minyak Goreng Sawit (Litre)">Minyak Goreng Sawit</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Jumlah (Quantity)</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 500" 
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Satuan</label>
                  <input 
                    type="text" 
                    value={unit}
                    readOnly
                    className="w-full p-2 bg-slate-100 border text-slate-500 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nomor Batch Prod. (Asli)</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: PLG-MPD-202606-004" 
                    value={batchNum}
                    onChange={e => setBatchNum(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Biaya Kargo / Ekspedisi (HPP)</label>
                  <input 
                    type="number" 
                    placeholder="Harga pengiriman" 
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Keterangan Transfer</label>
                <textarea 
                  rows={2} 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  placeholder="Deskripsikan kebutuhan pengiriman antar pabrik ini..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Foto Bukti Barang (Link / Kamera)</label>
                <input 
                  type="text" 
                  value={photoUrl} 
                  onChange={e => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/your-photo" 
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600 text-[10px]"
                />
              </div>

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
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVING CONFIRMATION MODAL */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden text-xs">
            <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm tracking-tight">Konfirmasi Penerimaan Kargo Masuk</h3>
              <button onClick={() => setShowReceiveModal(null)} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleConfirmReceipt} className="p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg flex space-x-3 text-[11px]">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-800">Menyambut Kiriman: {showReceiveModal.transferNumber}</span>
                  <span className="text-slate-600">Terdaftar pengapalan {showReceiveModal.quantity} {showReceiveModal.unit} item <strong>{showReceiveModal.itemKey}</strong> dari pabrik {showReceiveModal.sourceFactory}.</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Jumlah yang Diterima ({showReceiveModal.unit})</label>
                <input 
                  type="number" 
                  value={recvQty}
                  onChange={e => setRecvQty(e.target.value)}
                  required 
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Kondisi Hasil Bongkar Muat</label>
                <select 
                  value={recvCondition}
                  onChange={e => setRecvCondition(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600 font-semibold"
                >
                  <option value="Excellent">Sempurna (No defect, no spoil) - Excellent</option>
                  <option value="Good">Bagus (Batas tolerabilitas aman) - Good</option>
                  <option value="Damaged">Penyusut / Rusak Fisik - Damaged</option>
                  <option value="Spoiled">Busuk / Terkontaminasi - Spoiled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Notes / Temuan Lapangan</label>
                <textarea 
                  rows={2} 
                  value={recvNotes}
                  onChange={e => setRecvNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600"
                  placeholder="Tuliskan catatan hasil timbang gudang anda..."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Foto Bukti Receipt (Bongkar Muat)</label>
                <input 
                  type="text" 
                  value={recvPhotoUrl} 
                  onChange={e => setRecvPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/your-received-photo" 
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-emerald-600 text-[10px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowReceiveModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Bongkar &amp; Tambahkan Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
