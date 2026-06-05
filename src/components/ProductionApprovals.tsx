import React, { useState } from 'react';
import { 
  CheckCircle, 
  X, 
  PenTool, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Scale, 
  Eye, 
  Sparkles, 
  ShieldAlert, 
  Database,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

interface ProductionApprovalsProps {
  state: any;
  currentUser: any;
}

export default function ProductionApprovals({ state, currentUser }: ProductionApprovalsProps) {
  const [selectedLog, setSelectedLog] = useState<{ type: string; log: any } | null>(null);
  const [signatureText, setSignatureText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const peelingPending = (state.peelingLogs || []).filter((l: any) => l.approvedStatus === 'Pending');
  const fryingPending = (state.fryingLogs || []).filter((l: any) => l.approvedStatus === 'Pending');
  const qcPending = (state.qcLogs || []).filter((l: any) => l.approvedStatus === 'Pending');
  const packingPending = (state.packingLogs || []).filter((l: any) => l.approvedStatus === 'Pending');

  const totalPending = peelingPending.length + fryingPending.length + qcPending.length + packingPending.length;

  const getEmployeeName = (id: string) => {
    const k = (state.karyawan || []).find((emp: any) => emp.id === id);
    return k ? `${k.nama} (${k.position || k.role})` : id;
  };

  const getEmployeeNames = (ids: string[]) => {
    if (!ids || ids.length === 0) return 'Tidak ada';
    return ids.map(id => getEmployeeName(id)).join(', ');
  };

  const handleOpenApproveModal = (type: string, log: any) => {
    setSelectedLog({ type, log });
    setSignatureText(`APPROVEDBY-${currentUser.namaLengkap?.toUpperCase().replace(/\s+/g, '_') || 'MANAGER'}-${new Date().getFullYear()}`);
    setErrorMsg('');
  };

  const handleConfirmApproval = () => {
    if (!signatureText.trim()) {
      setErrorMsg('Tanda tangan digital harus diisi!');
      return;
    }

    if (selectedLog && state.approveProductionTransaction) {
      state.approveProductionTransaction(selectedLog.type, selectedLog.log.id, currentUser, signatureText);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedLog(null);
      }, 1500);
    }
  };

  // Helper calculation of piece-rate Gaji automatically divided per employee (Point 11 & 13)
  const calculatePayoutInfo = (type: string, log: any) => {
    const workerCount = log.karyawanIds ? log.karyawanIds.length : 1;
    let totalGaji = 0;
    let label = '';

    if (type === 'PEELING') {
      totalGaji = log.gajiDihasilkan || 0;
      label = 'Rp ' + (totalGaji / workerCount).toLocaleString('id-ID') + ' per orang (Borongan Peeling)';
    } else if (type === 'FRYING') {
      totalGaji = log.gajiOperator || 0;
      label = 'Rp ' + (totalGaji / workerCount).toLocaleString('id-ID') + ' per orang (Insentif Frying)';
    } else if (type === 'PACKAGING') {
      totalGaji = log.gajiKemas || 0;
      label = 'Rp ' + (totalGaji / workerCount).toLocaleString('id-ID') + ' per orang (Borongan Kemas)';
    } else {
      label = 'N/A (Non-payout task)';
    }

    return {
      workerCount,
      shareAmount: workerCount > 0 ? totalGaji / workerCount : 0,
      labelText: label
    };
  };

  const isAuthorized = ['Branch Manager', 'Factory Manager', 'Kepala Cabang', 'Super Admin', 'Director', 'Direktur HQ', 'Kepala Pabrik HQ', 'Kepala Pabrik Cabang', 'Admin', 'HQ Admin', 'Management'].includes(currentUser.role);

  if (!isAuthorized) {
    return (
      <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center max-w-lg mx-auto mt-12 animate-fade-in text-xs">
        <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-extrabold text-slate-800 text-sm">Akses Terbatas: Persetujuan Supervisor/Manager</h3>
        <p className="text-slate-500 mt-2 leading-relaxed">
          Hanya Branch Manager, Factory Manager, Kepala Pabrik, dan HQ Executive yang memiliki kewenangan menyetujui log transaksi produksi secara digital untuk pembaruan inventaris serta otomatisasi penggajian karyawan.
        </p>
        <div className="bg-slate-100 p-2 text-slate-600 rounded font-bold mt-4 font-mono">
          Peran Anda Saat Ini: {currentUser.role}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs animate-fade-in" id="production-approvals-screen">
      {/* Spark Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-500/10 text-white flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-black font-display tracking-tight uppercase flex items-center gap-1.5 text-emerald-400">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Pusat Persetujuan Produksi &amp; Payout Borongan
          </h2>
          <p className="text-[11px] text-slate-350 mt-1 uppercase tracking-wider font-semibold">
            Digital Signature Verification • Real-time Finished Goods Update • Automated Payroll Approval
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 px-4 py-2 rounded-xl text-center">
          <div className="font-black text-lg font-mono">{totalPending}</div>
          <div className="text-[9px] uppercase font-bold tracking-widest text-emerald-300">Menunggu Verifikasi</div>
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-600 mb-4 animate-pulse">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Semua Pekerjaan Selesai</h3>
          <p className="text-slate-500 mt-1 max-w-sm leading-relaxed">
            Tidak ada transaksi produksi yang tertunda. Semua log dari tim kupas, goreng, QC, dan kemas telah disetujui, ditandatangani secara digital, dan tercatat di inventaris.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          
          {/* 1. PEELING SECTION */}
          {peelingPending.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-amber-500/10 px-4 py-3 border-b border-amber-500/10 flex justify-between items-center">
                <span className="font-extrabold text-amber-800 text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" /> Log Pengupasan Segar (Peeling)
                </span>
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px]">
                  {peelingPending.length} Tertunda
                </span>
              </div>
              <div className="divide-y text-slate-700">
                {peelingPending.map((log: any) => {
                  const payout = calculatePayoutInfo('PEELING', log);
                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-50/50 transition grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-1.5 py-0.5 text-slate-800 rounded">{log.batchId}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{log.tanggal}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-semibold">Log ID: {log.id}</p>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <div className="font-bold text-slate-800">
                          Pekerja Terlibat ({payout.workerCount}): <span className="text-indigo-700 font-extrabold">{getEmployeeNames(log.karyawanIds)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10.5px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                          <div>Masuk: <span className="font-mono font-bold text-slate-900">{log.bahanMasukKg} Kg</span></div>
                          <div>Hasil: <span className="font-mono font-bold text-slate-900">{log.hasilKupasKg} Kg</span></div>
                          <div>Reject: <span className="font-mono font-bold text-red-600">{log.rejectKg} Kg</span></div>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                          <DollarSign className="w-3 h-3" /> Gaji: {payout.labelText}
                        </div>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => handleOpenApproveModal('PEELING', log)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 shadow-sm transition"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Verifikasi &amp; Tanda Tangan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. FRYING SECTION */}
          {fryingPending.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-purple-500/10 px-4 py-3 border-b border-purple-500/10 flex justify-between items-center">
                <span className="font-extrabold text-purple-800 text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-600" /> Vacuum Frying logs
                </span>
                <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px]">
                  {fryingPending.length} Tertunda
                </span>
              </div>
              <div className="divide-y text-slate-700">
                {fryingPending.map((log: any) => {
                  const payout = calculatePayoutInfo('FRYING', log);
                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-50/50 transition grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-1.5 py-0.5 text-slate-800 rounded">{log.batchId}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{log.tanggal}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-semibold">Log ID: {log.id}</p>
                        <p className="text-[10px] text-indigo-700 font-bold">Mesin: {log.mesinId} | Frying Cap: {log.beratFrozenMasukKg} kg/cycle</p>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <div className="font-bold text-slate-800">
                          Operator ({payout.workerCount}): <span className="text-indigo-700 font-extrabold">{getEmployeeNames(log.karyawanIds)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                          <div>Frying Frozen: <span className="font-mono font-bold text-slate-900">{log.beratFrozenMasukKg} Kg</span></div>
                          <div>Hasil Keripik Unpacked: <span className="font-mono font-bold text-slate-900">{log.beratHasilKeripikKg} Kg</span></div>
                        </div>
                        <div className="text-[10.5px] font-semibold text-slate-500">
                          Jumlah Mesin: <span className="font-bold text-slate-900">{log.vacuumFryingMachines || 1} Unit</span> | Cycles: <span className="font-bold text-slate-900">{log.cycleCount}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                          <DollarSign className="w-3 h-3" /> Payout Insentif: {payout.labelText}
                        </div>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => handleOpenApproveModal('FRYING', log)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 shadow-sm transition"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Verifikasi &amp; Tanda Tangan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. QC SECTION */}
          {qcPending.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-emerald-500/10 px-4 py-3 border-b border-emerald-500/10 flex justify-between items-center">
                <span className="font-extrabold text-emerald-800 text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" /> Log Quality Control &amp; Food Safety
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px]">
                  {qcPending.length} Tertunda
                </span>
              </div>
              <div className="divide-y text-slate-700">
                {qcPending.map((log: any) => {
                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-50/50 transition grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-1.5 py-0.5 text-slate-800 rounded">{log.batchId}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{log.tanggal}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-semibold">Log ID: {log.id}</p>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <div className="font-bold text-slate-800">
                          QC Inspector: <span className="text-indigo-700 font-extrabold">{getEmployeeName(log.qcId)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10.5px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                          <div>Input: <span className="font-mono font-bold text-slate-900">{log.beratMasukKg} Kg</span></div>
                          <div>Lolos QC: <span className="font-mono font-bold text-emerald-600">{log.hasilLolosQcKg} Kg</span></div>
                          <div>Grade A/B/C: <span className="font-bold text-slate-900">{log.hasilGradeAKg}/{log.hasilGradeBKg}/{log.hasilGradeCKg} Kg</span></div>
                        </div>
                        {log.rejectKg > 0 && (
                          <div className="text-[10px] text-red-600 font-bold bg-red-50 p-1 px-2 rounded inline-block">
                            ⚠️ Terbuang/Reject: {log.rejectKg} Kg - Alasan: {log.alasanReject || 'N/A'}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => handleOpenApproveModal('QC', log)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 shadow-sm transition"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Verifikasi &amp; Tanda Tangan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. PACKAGING SECTION */}
          {packingPending.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-blue-500/10 px-4 py-3 border-b border-blue-500/10 flex justify-between items-center">
                <span className="font-extrabold text-blue-800 text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" /> Log Kemas Brand (Packaging)
                </span>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px]">
                  {packingPending.length} Tertunda
                </span>
              </div>
              <div className="divide-y text-slate-700">
                {packingPending.map((log: any) => {
                  const payout = calculatePayoutInfo('PACKAGING', log);
                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-50/50 transition grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-1.5 py-0.5 text-slate-800 rounded">{log.batchId}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{log.tanggal}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-semibold">Log ID: {log.id}</p>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <div className="font-bold text-slate-800">
                          Packer Terlibat ({payout.workerCount}): <span className="text-indigo-700 font-extrabold">{getEmployeeNames(log.karyawanIds)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10.5px] font-semibold text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                          <div>Berat Kemas: <span className="font-mono font-bold text-slate-900">{log.beratMasukKeripikKg} Kg</span></div>
                          <div>Total Hasil: <span className="font-mono font-bold text-slate-900 font-extrabold">{log.totalPcsDihasilkan} Pcs</span></div>
                          <div>Remahan/Crumb: <span className="font-mono font-bold text-amber-600">{log.remahanKg} Kg</span></div>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                          <DollarSign className="w-3 h-3" /> Gaji: {payout.labelText}
                        </div>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => handleOpenApproveModal('PACKAGING', log)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 shadow-sm transition"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Verifikasi &amp; Tanda Tangan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* PERSATUAN APPROVAL DIGITAL SIGNATURE DIALOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-slate-200/60 shadow-xl space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-slate-900 text-[13px] uppercase flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-emerald-600 animate-bounce" /> Verifikasi Otentikasi Digital
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {showSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Validasi Digital Disetujui</h4>
                <p className="text-slate-500">
                  Tanda tangan diotentikasi secara digital oleh {currentUser.namaLengkap}. Stok inventaris dan lembar penggajian terupdate seketika!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-dashed space-y-1.5 leading-relaxed">
                  <div className="font-bold text-slate-800 uppercase text-[9px] tracking-wide text-slate-450 border-b pb-1">Rincian Transaksi Produksi</div>
                  <div>ID Log: <span className="font-mono font-extrabold text-slate-900">{selectedLog.log.id}</span></div>
                  <div>Subproses: <span className="font-bold text-indigo-700 uppercase">{selectedLog.type}</span></div>
                  <div>Batch ID: <span className="font-mono font-bold text-slate-900">{selectedLog.log.batchId}</span></div>
                  {selectedLog.log.karyawanIds && (
                    <div>Pekerja: <span className="font-semibold text-slate-800">{getEmployeeNames(selectedLog.log.karyawanIds)}</span></div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-extrabold text-slate-700 block text-[10px] uppercase tracking-wider">
                    Tanda Tangan Digital (Kunci Otentikasi)
                  </label>
                  <p className="text-slate-400 leading-normal text-[10px]">
                    Ketik atau modifikasi kunci tanda tangan digital Anda untuk meresmikan rekam data ini:
                  </p>
                  <input 
                    type="text" 
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full border-2 border-indigo-200 outline-none p-3 rounded-xl font-mono font-black text-[11px] text-indigo-905 bg-indigo-50/50 uppercase tracking-widest text-center"
                    placeholder="CERTIFIED-BY-NAME"
                  />
                  {errorMsg && (
                    <p className="text-red-500 font-bold font-mono text-[9.5px]">{errorMsg}</p>
                  )}
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 leading-relaxed font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold">Perlu Diketahui:</span> Penandatanganan digital ini secara legal mewakili verifikasi Kepala Pabrik / Branch Manager pada sistem Agridea, mengizinkan penyesuaian stok real-time sekaligus menyisipkan payroll data ke slip bulanan.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition"
                  >
                    Batalkan
                  </button>
                  <button 
                    onClick={handleConfirmApproval}
                    className="flex-1 bg-slate-950 text-white font-black py-2.5 rounded-xl hover:bg-slate-800 shadow-md inline-flex items-center justify-center gap-1.5 transition"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" /> Sahkan &amp; Update Stok
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
