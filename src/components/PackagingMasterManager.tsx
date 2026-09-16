import React, { useState } from 'react';
import { Search, Plus, Edit, Archive, CheckCircle, HelpCircle, Box, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  packagingMaster: any[];
  setPackagingMaster: React.Dispatch<React.SetStateAction<any[]>>;
  logActivity: (module: string, desc: string, detail?: any) => void;
}

const CATEGORIES = [
  'Standing Pouch',
  'Aluminium Foil',
  'Metalized Pouch',
  'Vacuum Bag',
  'Carton Box',
  'Label',
  'Sticker',
  'Other'
];

export default function PackagingMasterManager({
  packagingMaster,
  setPackagingMaster,
  logActivity
}: Props) {
  // Local Form state
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Standing Pouch');
  const [ukuran, setUkuran] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleResetForm = () => {
    setId('');
    setNama('');
    setKategori('Standing Pouch');
    setUkuran('');
    setUnit('Pcs');
    setStatus('Active');
    setNotes('');
    setEditingId(null);
    setError('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setId(item.id);
    setNama(item.nama);
    setKategori(item.kategori || 'Standing Pouch');
    setUkuran(item.ukuran || '');
    setUnit(item.unit || 'Pcs');
    setStatus(item.status || 'Active');
    setNotes(item.notes || '');
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !nama.trim()) {
      setError('Kode Kemasan dan Nama Kemasan harus diisi.');
      return;
    }

    const cleanId = id.trim().toUpperCase();
    const cleanNama = nama.trim();

    // Check duplicate code (only if creating new)
    if (!editingId) {
      if (packagingMaster.some(p => p.id === cleanId)) {
        setError(`Error: Kode kemasan/packaging "${cleanId}" sudah terdaftar.`);
        return;
      }
    }

    const payload = {
      id: cleanId,
      nama: cleanNama,
      kategori,
      ukuran,
      unit,
      status,
      notes
    };

    if (editingId) {
      setPackagingMaster(prev => prev.map(p => p.id === editingId ? payload : p));
      logActivity('PACKAGING-MASTER', `Mengupdate master packaging ${editingId} - ${cleanNama}`, { payload });
    } else {
      setPackagingMaster(prev => [...prev, payload]);
      logActivity('PACKAGING-MASTER', `Menambahkan master packaging baru ${cleanId} - ${cleanNama}`, { payload });
    }

    handleResetForm();
  };

  const handleArchive = (itemId: string) => {
    setPackagingMaster(prev => prev.map(p => {
      if (p.id === itemId) {
        const nextStatus = p.status === 'Archived' ? 'Active' : 'Archived';
        logActivity('PACKAGING-MASTER', `Mengubah status master packaging ${p.id} ke ${nextStatus}`, { itemId, nextStatus });
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Filter items
  const filteredItems = packagingMaster.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || p.kategori === categoryFilter;
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6" id="screen-master-packaging-panel">
      {/* HEADER SECTION */}
      <div className="flex bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm md:text-base flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-400" />
            Master Data — Packaging Master (Pusat Kemasan)
          </h3>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl">
            Sistem sentralisasi referensi tipe kemasan, standing pouch, aluminum foil, pelabelan, hingga kardus luar. 
            Semua transaksi opname, saldo awal, produksi, dan COGS akan terkunci menggunakan master kemasan di bawah.
          </p>
        </div>
        <div className="hidden md:block bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 font-mono text-[10px] text-emerald-450 font-bold">
          📦 {packagingMaster.length} Tipe Terdaftar
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-start text-xs">
        {/* FORM PANEL */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            ⭐ {editingId ? 'Edit Spesifikasi Kemasan' : 'Pendaftaran Kemasan Baru'}
          </h4>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg mb-4 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 scale-110" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold">Kode Kemasan (Packaging Code) *</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={!!editingId}
                placeholder="Misal: SP-100, KB-01, LAB-APL"
                className="bg-white disabled:bg-slate-200 disabled:text-slate-500 border rounded-lg p-2 text-xs w-full font-mono font-bold uppercase focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold">Nama Kemasan (Packaging Name) *</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: Standing Pouch Agridea 100g Premium"
                className="bg-white border rounded-lg p-2 text-xs w-full font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block mb-1 text-[10px] font-bold">Kategori Kemasan</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="bg-white border rounded-lg p-2 text-xs w-full font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 text-[10px] font-bold">Satuan (Unit)</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="bg-white border rounded-lg p-2 text-xs w-full font-semibold focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white"
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Roll">Roll</option>
                  <option value="Box">Box</option>
                  <option value="Lembar">Lembar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block mb-1 text-[10px] font-bold">Ukuran / Gramasi Kemasan</label>
                <input
                  type="text"
                  value={ukuran}
                  onChange={(e) => setUkuran(e.target.value)}
                  placeholder="Misal: 100 Gram, 250 Gram, Outer"
                  className="bg-white border rounded-lg p-2 text-xs w-full focus:ring-1 focus:ring-slate-900 focus:outline-none"
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
            </div>

            <div>
              <label className="text-slate-700 block mb-1 text-[10px] font-bold font-sans">Catatan Deskripsi</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis detail spesifikasi plastik foil, ketebalan micron, dsb."
                rows={2}
                className="bg-white border rounded-lg p-2 text-xs w-full font-sans focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-2.5 rounded-lg shadow-sm cursor-pointer border border-emerald-500 font-sans tracking-wide text-xs transition duration-150"
              >
                {editingId ? 'Simpan Perubahan' : 'Daftarkan Kemasan'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold p-2.5 rounded-lg cursor-pointer font-sans"
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
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end shadow-sm">
            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[10px] uppercase">Cari Kemasan / SKU</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kode, nama kemasan, dst..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-lg pl-9 pr-3 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[10px] uppercase">Filter Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-lg p-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value="">Semua Kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                    <th className="py-3 px-3.5">Nama Kemasan</th>
                    <th className="py-3 px-3.5">Kategori</th>
                    <th className="py-3 px-3.5">Ukuran</th>
                    <th className="py-3 px-3.5">Satuan</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 font-mono font-bold">
                        ❌ Tidak ada master kemasan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono font-bold text-slate-950 uppercase">{item.id}</td>
                        <td className="py-2.5 px-3.5 text-slate-950 font-semibold">{item.nama}</td>
                        <td className="py-2.5 px-3.5 text-indigo-900 font-semibold text-[11px]">
                          <span className="bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full">{item.kategori}</span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600">{item.ukuran || '-'}</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-500 uppercase">{item.unit}</td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            item.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
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
              <span>Menampilkan {filteredItems.length} dari {packagingMaster.length} tipe kemasan</span>
              <span className="text-slate-400">Master Data Centrally Locked 🔐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
