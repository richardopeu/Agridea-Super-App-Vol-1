import React, { useState } from 'react';
import { 
  Sliders, 
  Trash2, 
  RefreshCw, 
  Eye, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  CornerDownRight, 
  Save, 
  X, 
  Clock,
  History,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface TransactionRevisionsProps {
  currentUser: any;
  penerimaan: any[];
  setPenerimaan: React.Dispatch<React.SetStateAction<any[]>>;
  peelingLogs: any[];
  setPeelingLogs: React.Dispatch<React.SetStateAction<any[]>>;
  freezingLogs: any[];
  setFreezingLogs: React.Dispatch<React.SetStateAction<any[]>>;
  fryingLogs: any[];
  setFryingLogs: React.Dispatch<React.SetStateAction<any[]>>;
  qcLogs: any[];
  setQcLogs: React.Dispatch<React.SetStateAction<any[]>>;
  packingLogs: any[];
  setPackingLogs: React.Dispatch<React.SetStateAction<any[]>>;
  sales: any[];
  setSales: React.Dispatch<React.SetStateAction<any[]>>;
  pettyCash: any[];
  setPettyCash: React.Dispatch<React.SetStateAction<any[]>>;
  logActivity: (modul: string, msg: string, action?: string, oldValue?: any, newValue?: any, reason?: string) => void;
  recalculateAll: () => void;
}

export default function TransactionRevisions({
  currentUser,
  penerimaan,
  setPenerimaan,
  peelingLogs,
  setPeelingLogs,
  freezingLogs,
  setFreezingLogs,
  fryingLogs,
  setFryingLogs,
  qcLogs,
  setQcLogs,
  packingLogs,
  setPackingLogs,
  sales,
  setSales,
  pettyCash,
  setPettyCash,
  logActivity,
  recalculateAll
}: TransactionRevisionsProps) {
  // Module selection
  const [activeModule, setActiveModule] = useState<'penerimaan' | 'peeling' | 'freezing' | 'frying' | 'qc' | 'packing' | 'sales' | 'pettyCash'>('penerimaan');

  // Modal active states
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [revisionHistoryRecord, setRevisionHistoryRecord] = useState<any | null>(null);

  // Edit fields
  const [editFields, setEditFields] = useState<any>({});
  const [revisionReason, setRevisionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get active dataset
  const getDataset = () => {
    switch (activeModule) {
      case 'penerimaan': return { data: penerimaan, setter: setPenerimaan, name: 'Penerimaan Bahan Baku' };
      case 'peeling': return { data: peelingLogs, setter: setPeelingLogs, name: 'Log Peeling (Kupas)' };
      case 'freezing': return { data: freezingLogs, setter: setFreezingLogs, name: 'Log Freezing (Pembekuan)' };
      case 'frying': return { data: fryingLogs, setter: setFryingLogs, name: 'Log Vacuum Frying' };
      case 'qc': return { data: qcLogs, setter: setQcLogs, name: 'Log Quality Control/Grading' };
      case 'packing': return { data: packingLogs, setter: setPackingLogs, name: 'Log Packaging/Kemas Brand' };
      case 'sales': return { data: sales, setter: setSales, name: 'Invoice Penjualan' };
      case 'pettyCash': return { data: pettyCash, setter: setPettyCash, name: 'Jurnal Petty Cash' };
    }
  };

  const currentDataset = getDataset();

  // Helper values
  const isSuperAdmin = currentUser && currentUser.role === 'Super Admin';

  const handleOpenEdit = (rec: any) => {
    setEditingRecord(rec);
    setEditFields({ ...rec });
    setRevisionReason('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetList = currentDataset.data;
    const setter = currentDataset.setter;

    const oldRecord = targetList.find(r => r.id === editingRecord.id);
    if (!oldRecord) {
      setErrorMsg('Data tidak ditemukan!');
      return;
    }

    // Work out status and workflows
    const isApproved = oldRecord.approvedStatus === 'Approved' || oldRecord.status?.toLowerCase() === 'approved' || oldRecord.approvedStatus === 'Passed';
    
    // Feature 4: Workflow
    if (isApproved && !revisionReason.trim()) {
      setErrorMsg('Revisi untuk transaksi yang Sudah Approved / Approved wajib mencantumkan alasan perubahan!');
      return;
    }

    // Prepare updated record
    let updatedRecord = { ...editingRecord, ...editFields };
    
    // Recalculate specific dependent fields if modified
    if (activeModule === 'penerimaan') {
      updatedRecord.totalHarga = parseFloat(updatedRecord.beratDiterimaKg || 0) * parseFloat(updatedRecord.hargaPerKg || 0);
    } else if (activeModule === 'peeling') {
      updatedRecord.yieldPercent = Math.round((parseFloat(updatedRecord.hasilKupasKg || 0) / parseFloat(updatedRecord.bahanMasukKg || 1)) * 100);
      updatedRecord.rejectRatePercent = Math.round((parseFloat(updatedRecord.rejectKg || 0) / parseFloat(updatedRecord.bahanMasukKg || 1)) * 100);
      updatedRecord.gajiDihasilkan = (parseFloat(updatedRecord.hasilKupasKg || 0) * 1500) + (parseFloat(updatedRecord.hasilKupasKg || 0) > 40 ? (parseFloat(updatedRecord.hasilKupasKg || 0) - 40) * 300 : 0);
    } else if (activeModule === 'sales') {
      let total = 0;
      if (updatedRecord.items && updatedRecord.items[0]) {
        updatedRecord.items[0].qtyPcs = parseInt(updatedRecord.qtyPcs || updatedRecord.items[0].qtyPcs || 0);
        updatedRecord.items[0].hargaSatuan = parseFloat(updatedRecord.hargaSatuan || updatedRecord.items[0].hargaSatuan || 0);
        updatedRecord.items[0].totalHarga = updatedRecord.items[0].qtyPcs * updatedRecord.items[0].hargaSatuan;
        total = updatedRecord.items[0].totalHarga;
      } else {
        total = parseInt(updatedRecord.qtyPcs || 0) * parseFloat(updatedRecord.hargaSatuan || 0);
      }
      updatedRecord.totalPenjualan = total;
      updatedRecord.totalInvoice = total;
      updatedRecord.komisiSales = Math.round(total * 0.02);
    } else if (activeModule === 'pettyCash') {
      updatedRecord.jumlah = parseFloat(updatedRecord.jumlah || 0);
    }

    // Add revision history trace log
    const revEntry = {
      timestamp: new Date().toISOString(),
      user: currentUser?.username || 'admin',
      reason: revisionReason || 'Koreksi draft',
      oldData: { ...oldRecord },
      newData: { ...updatedRecord }
    };

    if (!updatedRecord.revisionHistory) {
      updatedRecord.revisionHistory = [];
    }
    updatedRecord.revisionHistory.push(revEntry);

    // Save back to master array
    setter((prev: any[]) => prev.map(r => r.id === oldRecord.id ? updatedRecord : r));

    // Audit logs
    logActivity(
      currentDataset.name,
      `Revisi transaksi ${oldRecord.id}. Alasan: ${revisionReason || 'Koreksi draft oleh admin/user'}.`,
      'Edit',
      oldRecord,
      updatedRecord,
      revisionReason || 'Draft corrections'
    );

    setSuccessMsg('Revisi transaksi berhasil disimpan dan stok gudang direkalkulasi secara otomatis!');
    setTimeout(() => {
      setEditingRecord(null);
      recalculateAll();
    }, 1500);
  };

  // Feature 6: Soft Delete
  const handleSoftDelete = (rec: any) => {
    if (confirm(`Apakah Anda yakin ingin Mengarsipkan (Soft Delete) transaksi ${rec.id}? Data tidak akan dihapus permanen, melainkan berstatus Archived.`)) {
      const setter = currentDataset.setter;
      setter((prev: any[]) => prev.map(item => item.id === rec.id ? { ...item, status: 'Archived', originalStatus: item.status || item.approvedStatus || 'Approved' } : item));
      
      logActivity(
        currentDataset.name,
        `Mengarsipkan (Soft Delete) transaksi ${rec.id}.`,
        'Delete',
        rec,
        { ...rec, status: 'Archived' },
        'Soft deleted transaction'
      );

      recalculateAll();
    }
  };

  // Feature 6: Restore
  const handleRestore = (rec: any) => {
    if (confirm(`Apakah Anda yakin ingin MEMULIHKAN (RESTORE) transaksi ${rec.id} kembali ke status normal?`)) {
      const setter = currentDataset.setter;
      setter((prev: any[]) => prev.map(item => item.id === rec.id ? { ...item, status: rec.originalStatus || 'Approved' } : item));
      
      logActivity(
        currentDataset.name,
        `Memulihkan (Restore) transaksi terarsip ${rec.id}.`,
        'Restore',
        rec,
        { ...rec, status: rec.originalStatus || 'Approved' },
        'Restored by Super Admin'
      );

      recalculateAll();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="transaction-revisions-hub">
      {/* Header */}
      <div className="border-b pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 uppercase flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 animate-spin-slow" /> Kode Revisi &amp; Alur Administrasi Transaksi (Backdated Engine)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Ubah, tinjau, arsipkan (soft-delete), atau pulihkan transaksi secara aman. Penghitungan ulang stok, COGS harian, dan profitabilitas berlangsung seketika.
          </p>
        </div>
        <div className="bg-slate-150 rounded px-2.5 py-1 text-[10px] text-slate-500 font-bold border font-mono">
          Peran: <span className="text-indigo-600 uppercase">{currentUser?.role || 'GUEST'}</span>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex border-b pb-3 mb-6 gap-1.5 overflow-x-auto text-[11px] font-bold">
        <button onClick={() => setActiveModule('penerimaan')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'penerimaan' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>1. Pengadaan</button>
        <button onClick={() => setActiveModule('peeling')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'peeling' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>2. Kupas (Peeling)</button>
        <button onClick={() => setActiveModule('freezing')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'freezing' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>3. Frozen (Pembekuan)</button>
        <button onClick={() => setActiveModule('frying')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'frying' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>4. Vacuum Frying</button>
        <button onClick={() => setActiveModule('qc')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'qc' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>5. Inspeksi QC</button>
        <button onClick={() => setActiveModule('packing')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'packing' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>6. Kemas Sku</button>
        <button onClick={() => setActiveModule('sales')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'sales' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>7. Penjualan Toko</button>
        <button onClick={() => setActiveModule('pettyCash')} className={`px-3 py-1.5 rounded-lg transition shrink-0 ${activeModule === 'pettyCash' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>8. Petty Cash</button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto shadow border rounded-xl bg-white">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono text-[10px] uppercase">
              <th className="py-2.5 px-3">ID Transaksi</th>
              <th className="py-2.5 px-3">Tanggal / Waktu</th>
              <th className="py-2.5 px-3">Lokasi</th>
              <th className="py-2.5 px-3">Parameter Inti</th>
              <th className="py-2.5 px-3">Status Sistem</th>
              <th className="py-2.5 px-3 text-center">Tindakan Revisions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {currentDataset.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">Tidak ada catatan transaksi untuk modul ini.</td>
              </tr>
            ) : (
              currentDataset.data.map((rec: any) => {
                const isDraft = rec.approvedStatus === 'Pending' || rec.status === 'Draft';
                const isArchived = rec.status === 'Archived';
                const displayStatus = isArchived ? 'Archived' : (rec.status || rec.approvedStatus || 'Passed');
                
                return (
                  <tr key={rec.id} className={`hover:bg-slate-50/50 ${isArchived ? 'bg-slate-50 opacity-60 text-slate-400 line-through' : ''}`}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rec.id}</td>
                    <td className="py-2.5 px-3 text-slate-650">{rec.tanggal} {rec.time || '12:00'}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans font-bold">{rec.lokasiId || 'JKT'}</td>
                    <td className="py-2.5 px-3 font-sans text-xs">
                      {activeModule === 'penerimaan' && (
                        <span>{rec.jenisBahan} - <strong className="font-mono text-indigo-900">{rec.beratDiterimaKg} kg</strong> @ Rp {rec.hargaPerKg}</span>
                      )}
                      {activeModule === 'peeling' && (
                        <span>Peeling {rec.jenisBahan} - masuk: {rec.bahanMasukKg}kg, hasil: <strong className="font-mono text-indigo-900">{rec.hasilKupasKg}kg</strong></span>
                      )}
                      {activeModule === 'freezing' && (
                        <span>Freeze {rec.fruitType} - masuk: {rec.beratKupasMasuk}kg, hasil: <strong className="font-mono text-indigo-900">{rec.beratFrozenOutput}kg</strong></span>
                      )}
                      {activeModule === 'frying' && (
                        <span>Frying {rec.jenisBuah || 'Buah'} - masuk: {rec.beratFrozenMasukKg}kg, hasil: <strong className="font-mono text-indigo-900">{rec.beratHasilKeripikKg}kg</strong></span>
                      )}
                      {activeModule === 'qc' && (
                        <span>QA {rec.jenisVarianBuah} - masuk: {rec.beratMasukKg}kg, lolos: <strong className="font-mono text-indigo-900">{rec.hasilLolosQcKg}kg</strong></span>
                      )}
                      {activeModule === 'packing' && (
                        <span>Kemas SKU: {rec.produkId} - hasil: <strong className="font-mono text-indigo-900">{rec.totalPcsDihasilkan} pcs</strong></span>
                      )}
                      {activeModule === 'sales' && (
                        <span>Penjualan SKU {rec.items?.[0]?.produkId || rec.produkId} - <strong className="font-mono text-indigo-900">{rec.items?.[0]?.qtyPcs || rec.qtyPcs} pcs</strong></span>
                      )}
                      {activeModule === 'pettyCash' && (
                        <span>{rec.kategori} - <strong className="font-mono text-indigo-900">Rp {rec.jumlah?.toLocaleString('id-ID')} [{rec.tipe}]</strong></span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isArchived 
                          ? 'bg-slate-200 text-slate-650' 
                          : isDraft 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1.5 font-sans">
                      <button onClick={() => setViewRecord(rec)} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border hover:bg-slate-200 transition text-[10px] font-bold cursor-pointer" title="Lihat detail penuh">Tinjau</button>
                      
                      {!isArchived && (
                        <button onClick={() => handleOpenEdit(rec)} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-100 transition text-[10px] font-bold cursor-pointer">Revisi</button>
                      )}

                      {rec.revisionHistory && rec.revisionHistory.length > 0 && (
                        <button onClick={() => setRevisionHistoryRecord(rec)} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 transition text-[10px] font-bold cursor-pointer" title="Riwayat revisi data">Logs ({rec.revisionHistory.length})</button>
                      )}

                      {!isArchived ? (
                        <button onClick={() => handleSoftDelete(rec)} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 hover:bg-rose-100 transition text-[10px] font-bold cursor-pointer">Arsipkan</button>
                      ) : (
                        isSuperAdmin && (
                          <button onClick={() => handleRestore(rec)} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-250 hover:bg-emerald-100 transition text-[10px] font-bold cursor-pointer">Restore</button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: VIEW DETAILS */}
      {viewRecord && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" /> Tinjauan Detil Transaksi: {viewRecord.id}
              </h3>
              <button onClick={() => setViewRecord(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3.5 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tanggal</span>
                  <span className="font-mono bg-slate-50 px-2 py-0.5 rounded font-black text-slate-800">{viewRecord.tanggal}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Waktu / Shift</span>
                  <span className="font-mono bg-slate-50 px-2 py-0.5 rounded font-black text-slate-800">{viewRecord.time || '12:00'} ({viewRecord.shift || 'Reguler'})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">ID Lokasi</span>
                  <span className="font-sans font-bold text-indigo-700 uppercase">{viewRecord.lokasiId || 'JKT'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">PIC / Operator</span>
                  <span className="font-sans font-bold text-slate-800">{viewRecord.picPenerima || viewRecord.pic || viewRecord.operatorId || 'Staff'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Isi Konten Field Inti</span>
                {Object.entries(viewRecord).map(([k, v]) => {
                  if (['id', 'tanggal', 'time', 'lokasiId', 'pic', 'picPenerima', 'operatorId', 'revisionHistory', 'originalStatus'].includes(k)) return null;
                  if (typeof v === 'object') return null;
                  return (
                    <div key={k} className="flex justify-between items-center text-[10.5px]">
                      <span className="font-mono text-slate-400 uppercase text-[9.5px]">{k}</span>
                      <span className="font-mono font-bold text-slate-800 text-right">{String(v)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t text-right">
              <button onClick={() => setViewRecord(null)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REVISION FORM */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border">
            <div className="bg-indigo-950 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" /> Formulir Koreksi Revisions: {editingRecord.id}
              </h3>
              <button type="button" onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-xs font-bold leading-normal">{errorMsg}</div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-bold leading-normal">{successMsg}</div>
              )}

              {/* Dynamic Input Fields Depending on Module */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tanggal Transaksi</span>
                  <input 
                    type="date"
                    value={editFields.tanggal || ''}
                    onChange={(e) => setEditFields({ ...editFields, tanggal: e.target.value })}
                    className="bg-white border rounded p-1.5 w-full font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Jam/Waktu</span>
                  <input 
                    type="text"
                    value={editFields.time || '12:00'}
                    onChange={(e) => setEditFields({ ...editFields, time: e.target.value })}
                    className="bg-white border rounded p-1.5 w-full font-mono font-bold text-slate-900 placeholder-slate-400"
                    placeholder="12:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border rounded-xl">
                {activeModule === 'penerimaan' && (
                  <>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Variant Buah</span>
                      <input 
                        type="text" 
                        value={editFields.jenisBahan || ''}
                        onChange={(e) => setEditFields({ ...editFields, jenisBahan: e.target.value })}
                        className="bg-white border rounded p-1.5 w-full font-sans font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Berat Diterima (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratDiterimaKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratDiterimaKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Harga per Kg</span>
                      <input 
                        type="number" 
                        value={editFields.hargaPerKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, hargaPerKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'peeling' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Bahan Masuk (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.bahanMasukKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, bahanMasukKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hasil Kupas (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.hasilKupasKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, hasilKupasKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reject (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.rejectKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, rejectKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Jam Kerja</span>
                      <input 
                        type="number" 
                        value={editFields.jamKerja ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, jamKerja: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'freezing' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Berat Kupas Masuk (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratKupasMasuk ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratKupasMasuk: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Berat Frozen Output (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratFrozenOutput ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratFrozenOutput: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'frying' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Berat Frozen Masuk (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratFrozenMasukKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratFrozenMasukKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hasil Keripik Jadi (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratHasilKeripikKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratHasilKeripikKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'qc' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Berat Inspeksi Masuk (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratMasukKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratMasukKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Lolos QC Grade A (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.hasilLolosQcKg ?? editFields.hasilGradeAKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, hasilLolosQcKg: parseFloat(e.target.value) || 0, hasilGradeAKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'packing' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Berat Masuk Keripik (Kg)</span>
                      <input 
                        type="number" 
                        value={editFields.beratMasukKeripikKg ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, beratMasukKeripikKg: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Pcs Dikemas</span>
                      <input 
                        type="number" 
                        value={editFields.totalPcsDihasilkan ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, totalPcsDihasilkan: parseInt(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'sales' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Qty Produk Pcs</span>
                      <input 
                        type="number" 
                        value={editFields.qtyPcs ?? editFields.items?.[0]?.qtyPcs ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, qtyPcs: parseInt(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Harga per Pcs</span>
                      <input 
                        type="number" 
                        value={editFields.hargaSatuan ?? editFields.items?.[0]?.hargaSatuan ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, hargaSatuan: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                  </>
                )}

                {activeModule === 'pettyCash' && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Jumlah Biaya Petty (Rp)</span>
                      <input 
                        type="number" 
                        value={editFields.jumlah ?? ''}
                        onChange={(e) => setEditFields({ ...editFields, jumlah: parseFloat(e.target.value) || 0 })}
                        className="bg-white border rounded p-1.5 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Kategori Jurnal</span>
                      <input 
                        type="text" 
                        value={editFields.kategori || ''}
                        onChange={(e) => setEditFields({ ...editFields, kategori: e.target.value })}
                        className="bg-white border rounded p-1.5 w-full font-sans font-bold text-slate-900"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Feature 4: Revision reason inputs mandatory for approved datasets */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2.5">
                <span className="text-[10px] uppercase font-black tracking-wide text-amber-800 block flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Otorisasi Manager &amp; Alasan Revisi Data (Required)
                </span>
                <p className="text-[10px] text-amber-700 leading-normal">
                  Koreksi nilai transaksi ini akan dirunut dalam lembar audit. Silakan cantumkan justifikasi perubahan di bawah ini:
                </p>
                <input 
                  type="text"
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="bg-white border border-amber-300 rounded p-2 text-xs w-full font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-400 font-medium"
                  placeholder="Contoh: Salah rekam dari tim timbangan Malang, aslinya..."
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setEditingRecord(null)}
                className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded-lg text-xs cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Save className="w-4 h-4" /> Simpan &amp; Terapkan Revisi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: REVISION HISTORY DETAILS */}
      {revisionHistoryRecord && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-400 animate-spin-slow" /> Catatan Kronologi Revisi untuk {revisionHistoryRecord.id}
              </h3>
              <button onClick={() => setRevisionHistoryRecord(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-5 text-xs max-h-[70vh] overflow-y-auto space-y-4">
              <div className="text-slate-500 text-[11px] leading-relaxed">
                Menampilkan daftar perubahan data bersejarah dari waktu ke waktu yang telah diverifikasi oleh Manajer/Super Admin:
              </div>

              <div className="relative pl-6 border-l-2 border-slate-200 ml-2 space-y-5">
                {revisionHistoryRecord.revisionHistory.map((rev: any, index: number) => (
                  <div key={index} className="relative">
                    {/* Circle bullet node icon */}
                    <div className="absolute -left-[31px] top-0.5 bg-indigo-100 ring-4 ring-white rounded-full p-1 border border-indigo-505 text-indigo-700">
                      <Clock className="w-3 h-3" />
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-bold text-slate-800">Revisi #{index + 1} oleh @{rev.user}</span>
                        <span className="font-mono text-[9px] text-slate-550 font-medium bg-white px-2 py-0.5 rounded border">{rev.timestamp?.replace('T', ' ')?.substring(0, 16)}</span>
                      </div>
                      
                      <div className="font-sans text-[11px] text-slate-650 bg-amber-50 p-2 rounded border border-amber-100 font-semibold italic text-slate-800 leading-normal">
                        "{rev.reason || 'Koreksi administratif'}"
                      </div>

                      {/* Diff view */}
                      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono leading-relaxed pt-1.5 text-slate-705">
                        <div className="bg-rose-50 border border-rose-100 p-2 rounded text-rose-900">
                          <span className="font-extrabold block text-rose-800 uppercase text-[9px] mb-1">Sebelum Perubahan:</span>
                          {Object.entries(rev.oldData).map(([k, v]) => {
                            if (['revisionHistory', 'originalStatus', 'status'].includes(k)) return null;
                            if (typeof v === 'object') return null;
                            if (rev.newData[k] !== v) {
                              return <div key={k}>{k}: <strong className="font-extrabold line-through">{String(v)}</strong></div>;
                            }
                            return null;
                          })}
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-2 rounded text-emerald-950">
                          <span className="font-extrabold block text-emerald-800 uppercase text-[9px] mb-1">Sesudah Perubahan:</span>
                          {Object.entries(rev.newData).map(([k, v]) => {
                            if (['revisionHistory', 'originalStatus', 'status'].includes(k)) return null;
                            if (typeof v === 'object') return null;
                            if (rev.oldData[k] !== v) {
                              return <div key={k}>{k}: <strong className="font-black text-emerald-900">{String(v)}</strong></div>;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t text-right">
              <button onClick={() => setRevisionHistoryRecord(null)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
