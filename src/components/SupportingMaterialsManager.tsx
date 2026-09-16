import React, { useState } from 'react';
import { Search, Plus, Edit, Archive, CheckCircle, HelpCircle, Layers, ShieldAlert } from 'lucide-react';

interface Props {
  supportingMaster: any[];
  setSupportingMaster: React.Dispatch<React.SetStateAction<any[]>>;
  logActivity: (module: string, desc: string, detail?: any) => void;
}

export default function SupportingMaterialsManager({
  supportingMaster,
  setSupportingMaster,
  logActivity
}: Props) {
  // Local Form state
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [standardCost, setStandardCost] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleResetForm = () => {
    setId('');
    setNama('');
    setUnit('Pcs');
    setStandardCost(0);
    setSupplier('');
    setStatus('Active');
    setEditingId(null);
    setError('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setId(item.id);
    setNama(item.nama);
    setUnit(item.unit || 'Pcs');
    setStandardCost(item.standardCost || 0);
    setSupplier(item.supplier || '');
    setStatus(item.status || 'Active');
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !nama.trim()) {
      setError('Kode Material dan Nama Material harus diisi.');
      return;
    }

    const cleanId = id.trim().toUpperCase();
    const cleanNama = nama.trim();

    // Check duplicate code (only if creating new)
    if (!editingId) {
      if (supportingMaster.some(p => p.id === cleanId)) {
        setError(`Error: Kode material "${cleanId}" sudah terdaftar.`);
        return;
      }
    }

    const payload = {
      id: cleanId,
      nama: cleanNama,
      unit,
      standardCost: Number(standardCost) || 0,
      supplier,
      status
    };

    if (editingId) {
      setSupportingMaster(prev => prev.map(p => p.id === editingId ? payload : p));
      logActivity('SUPPORTING-MASTER', `Mengupdate master supporting material ${editingId} - ${cleanNama}`, { payload });
    } else {
      setSupportingMaster(prev => [...prev, payload]);
      logActivity('SUPPORTING-MASTER', `Menambahkan master supporting material baru ${cleanId} - ${cleanNama}`, { payload });
    }

    handleResetForm();
  };

  const handleArchive = (itemId: string) => {
    setSupportingMaster(prev => prev.map(p => {
      if (p.id === itemId) {
        const nextStatus = p.status === 'Archived' ? 'Active' : 'Archived';
        logActivity('SUPPORTING-MASTER', `Mengubah status master supporting material ${p.id} ke ${nextStatus}`, { itemId, nextStatus });
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Filter items
  const filteredItems = supportingMaster.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.supplier || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="screen-master-supporting-panel">
      {/* HEADER SECTION */}
      <div className="flex bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 items-center justify-between animate-fade-in text-[12px]">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm md:text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Master Data — Supporting Materials (Bahan Penolong)
          </h3>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl">
            Sistem sentralisasi referensi bahan penolong non-kemasan seperti kertas merang, lakban, kardus packing, barcode label, pallet kayu, dsb.
            Digunakan untuk integrasi kalkulasi COGS, audit gudang, serta perhitungan otomatis perencanaan MRP.
          </p>
        </div>
        <div className="hidden md:block bg-slate-850 px-3 py-2 rounded-lg border border-slate-700 font-mono text-[10px] text-indigo-450 font-bold bg-slate-800/80">
          📦 {supportingMaster.length} Tipe Terdaftar
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-start text-xs">
        {/* FORM PANEL */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            ⭐ {editingId ? 'Edit Bahan Penolong' : 'Pendaftaran Bahan Penolong Baru'}
          </h4>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg mb-4 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 scale-110" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold">Kode Material (Material Code) *</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={!!editingId}
                placeholder="Misal: SP-001, SP-011"
                className="bg-white disabled:bg-slate-200 disabled:text-slate-500 border rounded-lg p-2 text-xs w-full font-mono font-bold uppercase focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold">Nama Material (Material Name) *</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: Kertas Merang Peniris Minyak"
                className="bg-white border rounded-lg p-2 text-xs w-full font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block mb-1 text-[10px] font-bold">Satuan (Unit)</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="bg-white border rounded-lg p-2 text-xs w-full font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Roll">Roll</option>
                  <option value="Box">Box</option>
                  <option value="Lembar">Lembar</option>
                  <option value="Liter">Liter</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 text-[10px] font-bold">Standard Cost (HPP Satuan)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold text-[10px]">Rp</span>
                  <input
                    type="number"
                    value={standardCost}
                    onChange={(e) => setStandardCost(Number(e.target.value))}
                    className="bg-white border rounded-lg p-2 pl-8 text-xs w-full font-mono font-bold focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold">Supplier Utama (Linked Supplier)</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Misal: Aneka Plastik Perkasa (S-02)"
                className="bg-white border rounded-lg p-2 text-xs w-full focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-white border rounded-lg p-2 text-xs w-full font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold p-2.5 rounded-lg shadow-sm cursor-pointer border border-indigo-500 font-sans tracking-wide text-xs transition duration-150"
              >
                {editingId ? 'Simpan Perubahan' : 'Daftarkan Material'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2.5 rounded-lg cursor-pointer font-sans"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST TABLE PANEL */}
        <div className="lg:col-span-2 space-y-4">
          {/* SEARCH & FILTERS SECTION */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3.5 items-end shadow-sm">
            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[10px] uppercase">Cari Material / Supplier</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kode, nama bahan penolong..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-lg pl-9 pr-3 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[10px] uppercase">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="">Semua Status</option>
                <option value="Active">Active Only</option>
                <option value="Archived">Archived Only</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3.5">Kode</th>
                    <th className="py-3 px-3.5">Nama Mat. Penolong</th>
                    <th className="py-3 px-3.5">Satuan</th>
                    <th className="py-3 px-3.5 text-right">Std Cost (Est)</th>
                    <th className="py-3 px-3.5">Supplier Utama</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 font-mono font-bold">
                        ❌ Tidak ada bahan penolong ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono font-bold text-slate-950 uppercase">{item.id}</td>
                        <td className="py-2.5 px-3.5 text-slate-950 font-semibold">{item.nama}</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-500 uppercase">{item.unit || 'Pcs'}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-slate-950 font-bold">
                          Rp {(item.standardCost || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600 font-medium">{item.supplier || '—'}</td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            item.status === 'Active' 
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(item)}
                              title="Edit"
                              className="p-1 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleArchive(item.id)}
                              title={item.status === 'Archived' ? 'Aktifkan Kembali' : 'Arsipkan'}
                              className={`p-1 rounded transition cursor-pointer ${
                                item.status === 'Archived' 
                                  ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800' 
                                  : 'text-amber-500 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 text-[10px] text-slate-500 border-t flex justify-between items-center font-mono">
              <span>Menampilkan {filteredItems.length} dari {supportingMaster.length} tipe bahan penolong</span>
              <span className="text-slate-400">Master Data Centrally Locked 🔐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
