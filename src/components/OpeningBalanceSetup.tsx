/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  HelpCircle, 
  Info, 
  AlertCircle,
  Database,
  Briefcase,
  Layers,
  TrendingUp,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Props {
  lokasi: any[];
  fruitVariants: any[];
  chipVariants: any[];
  skuProduk: any[];
  openingInventory: any[];
  setOpeningInventory: React.Dispatch<React.SetStateAction<any[]>>;
  openingProduction: any[];
  setOpeningProduction: React.Dispatch<React.SetStateAction<any[]>>;
  openingFinancial: any[];
  setOpeningFinancial: React.Dispatch<React.SetStateAction<any[]>>;
  recalculateAll: () => void;
  logActivity: (module: string, desc: string, detail?: any) => void;
  packagingMaster: any[];
  supportingMaster: any[];
  chemicalsMaster?: any[];
  setChipVariants?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function OpeningBalanceSetup({
  lokasi,
  fruitVariants,
  chipVariants,
  skuProduk,
  openingInventory,
  setOpeningInventory,
  openingProduction,
  setOpeningProduction,
  openingFinancial,
  setOpeningFinancial,
  recalculateAll,
  logActivity,
  packagingMaster,
  supportingMaster,
  chemicalsMaster = [],
  setChipVariants
}: Props) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'production' | 'financial'>('inventory');
  const [invMaterialCategory, setInvMaterialCategory] = useState<string>('Packaging Materials');

  const getDisplayUnit = () => {
    if (invType === 'Finished Goods') return 'Pcs';
    if (invType === 'Packaging & Supporting Materials') {
      if (invMaterialCategory === 'Packaging Materials') {
        const item = packagingMaster.find(pm => pm.id === invVariant);
        return item?.unit || 'Pcs';
      } else {
        const item = supportingMaster.find(sm => sm.id === invVariant);
        return item?.unit || 'Unit';
      }
    }
    return 'Kg';
  };

  const getItemName = (item: any) => {
    if (item.inventoryType === 'Finished Goods') {
      const matchSku = skuProduk.find(sp => sp.id === item.variant);
      const matchChip = chipVariants.find(cv => cv.id === item.variant);
      return matchSku ? `${matchSku.id} - ${matchSku.nama}` : (matchChip ? `${matchChip.id} - ${matchChip.nama}` : item.variant);
    }
    if (item.inventoryType === 'Packaging & Supporting Materials') {
      if (item.materialCategory === 'Packaging Materials') {
        const match = packagingMaster.find(pm => pm.id === item.variant);
        return match ? `${match.id} - ${match.nama}` : item.variant;
      } else {
        const match = supportingMaster.find(sm => sm.id === item.variant) || (chemicalsMaster || []).find(cc => cc.id === item.variant);
        return match ? `${match.id} - ${match.nama}` : item.variant;
      }
    }
    return item.variant;
  };

  const getItemUnit = (item: any) => {
    if (item.inventoryType === 'Finished Goods') return 'Pcs';
    if (item.inventoryType === 'Packaging & Supporting Materials') {
      if (item.materialCategory === 'Packaging Materials') {
        const match = packagingMaster.find(pm => pm.id === item.variant);
        return match?.unit || 'Pcs';
      } else {
        const match = supportingMaster.find(sm => sm.id === item.variant) || (chemicalsMaster || []).find(cc => cc.id === item.variant);
        return match?.unit || 'Unit';
      }
    }
    return 'Kg';
  };

  // Tab 1 Form states
  const [invId, setInvId] = useState<string>('');
  const [invFactory, setInvFactory] = useState<string>(lokasi[0]?.id || 'JKT');
  const [invType, setInvType] = useState<string>('Fresh Fruit');
  const [invVariant, setInvVariant] = useState<string>('');
  const [invQty, setInvQty] = useState<number>(0);
  const [invCost, setInvCost] = useState<number>(0);
  const [invDate, setInvDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [invNotes, setInvNotes] = useState<string>('');
  const [isEditingInv, setIsEditingInv] = useState<boolean>(false);

  // Tab 2 Form states
  const [prodId, setProdId] = useState<string>('');
  const [prodFactory, setProdFactory] = useState<string>(lokasi[0]?.id || 'JKT');
  const [prodDate, setProdDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [prodFresh, setProdFresh] = useState<number>(0);
  const [prodFrozen, setProdFrozen] = useState<number>(0);
  const [prodFrying, setProdFrying] = useState<number>(0);
  const [prodQc, setProdQc] = useState<number>(0);
  const [prodPacking, setProdPacking] = useState<number>(0);
  const [prodNotes, setProdNotes] = useState<string>('');
  const [isEditingProd, setIsEditingProd] = useState<boolean>(false);

  // Tab 3 Form states
  const [finId, setFinId] = useState<string>('');
  const [finCash, setFinCash] = useState<number>(0);
  const [finBank, setFinBank] = useState<number>(0);
  const [finPetty, setFinPetty] = useState<number>(0);
  const [finInvVal, setFinInvVal] = useState<number>(0);
  const [finAp, setFinAp] = useState<number>(0);
  const [finAr, setFinAr] = useState<number>(0);
  const [finCapital, setFinCapital] = useState<number>(0);
  const [finDate, setFinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [finNotes, setFinNotes] = useState<string>('');
  const [isEditingFin, setIsEditingFin] = useState<boolean>(false);

  // Reset Inventory Form
  const resetInvForm = () => {
    setInvId('');
    setInvType('Fresh Fruit');
    setInvVariant('');
    setInvMaterialCategory('Packaging Materials');
    setInvQty(0);
    setInvCost(0);
    setInvNotes('');
    setIsEditingInv(false);
  };

  // Reset Production Form
  const resetProdForm = () => {
    setProdId('');
    setProdFresh(0);
    setProdFrozen(0);
    setProdFrying(0);
    setProdQc(0);
    setProdPacking(0);
    setProdNotes('');
    setIsEditingProd(false);
  };

  // Reset Financial Form
  const resetFinForm = () => {
    setFinId('');
    setFinCash(0);
    setFinBank(0);
    setFinPetty(0);
    setFinInvVal(0);
    setFinAp(0);
    setFinAr(0);
    setFinCapital(0);
    setFinNotes('');
    setIsEditingFin(false);
  };

  // Save Opening Inventory
  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invVariant) {
      alert('Silakan pilih varian / SKU!');
      return;
    }

    const payload = {
      id: invId || 'OP-INV-' + Date.now(),
      lokasiId: invFactory,
      inventoryType: invType,
      variant: invVariant,
      materialCategory: invType === 'Packaging & Supporting Materials' ? invMaterialCategory : undefined,
      qty: Number(invQty),
      unitCost: Number(invCost),
      tanggal: invDate,
      notes: invNotes,
      status: 'Approved' // Treat as approved for calculation
    };

    if (invType === 'Finished Goods' && setChipVariants) {
      const matchInChips = chipVariants.some(cv => cv.id === invVariant);
      if (!matchInChips) {
        const skuObj = skuProduk.find(sp => sp.id === invVariant);
        if (skuObj) {
          const matchingFruit = fruitVariants.find(fv => fv.nama.toLowerCase().includes(skuObj.varian.toLowerCase())) || fruitVariants[0];
          const newChipVariant = {
            id: skuObj.id,
            nama: skuObj.nama,
            fruitVariantId: matchingFruit?.id || 'FV-01',
            grade: 'A',
            brand: skuObj.brand,
            packagingSize: `${skuObj.gramasi}g`,
            status: 'Active',
            notes: 'Automated Sync via Opening Balance Setup',
            targetYield: 10
          };
          setChipVariants(prev => {
            const exists = prev.some(cv => cv.id === newChipVariant.id);
            if (exists) return prev;
            const updated = [...prev, newChipVariant];
            localStorage.setItem('agridea_chip_variants', JSON.stringify(updated));
            return updated;
          });
          logActivity('Master Chip Variants', `Menambahkan Master Chip Variant otomatis untuk SKU ${skuObj.sku}`, newChipVariant);
        }
      }
    }

    if (isEditingInv) {
      setOpeningInventory(prev => prev.map(item => item.id === invId ? payload : item));
      logActivity('Opening Balance Setup', `Mengedit Saldo Awal Inventaris #${invId} di ${invFactory} untuk ${invVariant}`, { old: openingInventory.find(i => i.id === invId), new: payload });
    } else {
      setOpeningInventory(prev => [...prev, payload]);
      logActivity('Opening Balance Setup', `Menyimpan Saldo Awal Inventaris Baru di ${invFactory} untuk ${invVariant} sebanyak ${invQty}`);
    }

    setTimeout(() => {
      recalculateAll();
    }, 100);

    resetInvForm();
  };

  // Edit Opening Inventory Item
  const handleEditInventory = (item: any) => {
    setInvId(item.id);
    setInvFactory(item.lokasiId);
    setInvType(item.inventoryType);
    setInvVariant(item.variant);
    if (item.inventoryType === 'Packaging & Supporting Materials') {
      setInvMaterialCategory(item.materialCategory || 'Packaging Materials');
    }
    setInvQty(item.qty);
    setInvCost(item.unitCost);
    setInvDate(item.tanggal);
    setInvNotes(item.notes || '');
    setIsEditingInv(true);
  };

  // Delete Opening Inventory Item
  const handleDeleteInventory = (id: string, variant: string, location: string) => {
    if (confirm(`Yakin ingin menghapus saldo awal inventaris untuk ${variant} di ${location}?`)) {
      setOpeningInventory(prev => prev.filter(item => item.id !== id));
      logActivity('Opening Balance Setup', `Menghapus Saldo Awal Inventaris #${id} (${variant}) di ${location}`);
      setTimeout(() => {
        recalculateAll();
      }, 100);
    }
  };

  // Save Opening Production State
  const handleSaveProduction = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: prodId || 'OP-PROD-' + Date.now(),
      lokasiId: prodFactory,
      tanggal: prodDate,
      freshFruitInProcess: Number(prodFresh),
      frozenInProcess: Number(prodFrozen),
      vacuumFryingInProcess: Number(prodFrying),
      qcInProcess: Number(prodQc),
      packagingInProcess: Number(prodPacking),
      notes: prodNotes,
      status: 'Approved'
    };

    if (isEditingProd) {
      setOpeningProduction(prev => prev.map(item => item.id === prodId ? payload : item));
      logActivity('Opening Balance Setup', `Mengedit Saldo Awal Produksi WIP #${prodId} di ${prodFactory}`, { old: openingProduction.find(i => i.id === prodId), new: payload });
    } else {
      setOpeningProduction(prev => [...prev, payload]);
      logActivity('Opening Balance Setup', `Menyimpan Saldo Awal Produksi WIP Baru di ${prodFactory}`);
    }

    setTimeout(() => {
      recalculateAll();
    }, 100);

    resetProdForm();
  };

  // Edit Production Position Item
  const handleEditProduction = (item: any) => {
    setProdId(item.id);
    setProdFactory(item.lokasiId);
    setProdDate(item.tanggal);
    setProdFresh(item.freshFruitInProcess);
    setProdFrozen(item.frozenInProcess);
    setProdFrying(item.vacuumFryingInProcess);
    setProdQc(item.qcInProcess);
    setProdPacking(item.packagingInProcess);
    setProdNotes(item.notes || '');
    setIsEditingProd(true);
  };

  // Delete Production Position Item
  const handleDeleteProduction = (id: string, location: string) => {
    if (confirm(`Yakin ingin menghapus saldo awal produksi WIP di ${location}?`)) {
      setOpeningProduction(prev => prev.filter(item => item.id !== id));
      logActivity('Opening Balance Setup', `Menghapus Saldo Awal Produksi WIP #${id} di ${location}`);
      setTimeout(() => {
        recalculateAll();
      }, 100);
    }
  };

  // Save Financial Balance
  const handleSaveFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: finId || 'OP-FIN-' + Date.now(),
      cashBalance: Number(finCash),
      bankBalance: Number(finBank),
      pettyCashBalance: Number(finPetty),
      inventoryValue: Number(finInvVal),
      accountsPayable: Number(finAp),
      accountsReceivable: Number(finAr),
      openingCapital: Number(finCapital),
      tanggal: finDate,
      notes: finNotes,
      status: 'Approved'
    };

    if (isEditingFin) {
      setOpeningFinancial(prev => prev.map(item => item.id === finId ? payload : item));
      logActivity('Opening Balance Setup', `Mengedit Saldo Awal Keuangan / Neraca #${finId}`, { old: openingFinancial.find(f => f.id === finId), new: payload });
    } else {
      setOpeningFinancial(prev => [...prev, payload]);
      logActivity('Opening Balance Setup', `Menyimpan Saldo Awal Keuangan Baru`);
    }

    setTimeout(() => {
      recalculateAll();
    }, 100);

    resetFinForm();
  };

  // Edit Financial Item
  const handleEditFinancial = (item: any) => {
    setFinId(item.id);
    setFinCash(item.cashBalance);
    setFinBank(item.bankBalance);
    setFinPetty(item.pettyCashBalance);
    setFinInvVal(item.inventoryValue);
    setFinAp(item.accountsPayable);
    setFinAr(item.accountsReceivable);
    setFinCapital(item.openingCapital);
    setFinDate(item.tanggal);
    setFinNotes(item.notes || '');
    setIsEditingFin(true);
  };

  // Delete Financial Item
  const handleDeleteFinancial = (id: string) => {
    if (confirm(`Yakin ingin menghapus saldo awal neraca keuangan ini?`)) {
      setOpeningFinancial(prev => prev.filter(item => item.id !== id));
      logActivity('Opening Balance Setup', `Menghapus Saldo Awal Keuangan #${id}`);
      setTimeout(() => {
        recalculateAll();
      }, 100);
    }
  };

  // Dynamic variants selection helper based on inventory type
  const getVariantOptions = () => {
    switch (invType) {
      case 'Fresh Fruit':
        return fruitVariants.map(fv => ({ key: fv.nama + ' Segar', label: fv.nama + ' Segar (Bahan Baku)' }));
      case 'Frozen':
        return fruitVariants.map(fv => ({ key: fv.nama + ' Frozen', label: fv.nama + ' Frozen (Setengah Jadi)' }));
      case 'Chips':
        return fruitVariants.map(fv => ({ key: fv.nama + ' Keripik Jadi (Unpacked)', label: fv.nama + ' Keripik Unpacked (Setengah Jadi)' }));
      case 'Packaging & Supporting Materials':
        if (invMaterialCategory === 'Packaging Materials') {
          return packagingMaster.map(pm => ({ key: pm.id, label: `${pm.id} - ${pm.nama}` }));
        } else {
          const supportOpts = (supportingMaster || []).map(sm => ({ key: sm.id, label: `${sm.id} - ${sm.nama}` }));
          const chemicalOpts = (chemicalsMaster || []).map(cc => ({ key: cc.id, label: `${cc.id} - ${cc.nama} [Chemical/Consumable]` }));
          return [...supportOpts, ...chemicalOpts];
        }
      case 'Finished Goods':
        return skuProduk.map(sp => ({ key: sp.id, label: `${sp.id} - ${sp.nama} [SKU: ${sp.sku}]` }));
      default:
        return [];
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 text-xs text-slate-800 space-y-6" id="opening-balance-workspace">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg tracking-wider uppercase">System Module</span>
            <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg tracking-wider uppercase border border-emerald-100">HQ Setup</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">Opening Balance Setup [Saldo Awal]</h2>
          <p className="text-slate-500 font-medium">Lakukan inisialisasi saldo awal inventaris, posisi WIP produksi, serta neraca keuangan di awal periode transaksi berjalan.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-3">
          <Database className="w-8 h-8 text-indigo-600 shrink-0" />
          <div>
            <span className="font-extrabold text-indigo-900 block text-[11px]">Database Ledger Active</span>
            <span className="text-slate-500 font-mono text-[10px]">Real-Time Costing Simulation Enabled</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs border">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-slate-950 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          1. Opening Inventory [Saldo Stok]
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'production'
              ? 'bg-slate-950 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          2. Opening Production WIP [Posisi WIP]
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'financial'
              ? 'bg-slate-950 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          3. Opening Financial Balance [Neraca Awal]
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tab content 1: INVENTORY */}
        {activeTab === 'inventory' && (
          <>
            {/* Form Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-extrabold text-slate-900 text-sm">{isEditingInv ? 'Edit' : 'Tambah'} Saldo Awal Inventaris</h3>
                <p className="text-slate-500 font-medium">Inisialisasi persediaan awal di masing-masing gudang unit pabrik.</p>
              </div>

              <form onSubmit={handleSaveInventory} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Factory / Lokasi Gudang *</label>
                  <select
                    value={invFactory}
                    onChange={(e) => setInvFactory(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                    required
                  >
                    {lokasi.map(l => (
                      <option key={l.id} value={l.id}>{l.nama} ({l.kode})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Tipe Inventaris *</label>
                  <select
                    value={invType}
                    onChange={(e) => {
                      setInvType(e.target.value);
                      setInvVariant(''); // reset selected variant
                    }}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                    required
                  >
                    <option value="Fresh Fruit">Fresh Fruit [Buah Segar]</option>
                    <option value="Frozen">Frozen Fruit [Setengah Jadi]</option>
                    <option value="Chips">Chips / Unpacked [Setengah Jadi]</option>
                    <option value="Packaging & Supporting Materials">Packaging & Supporting Materials</option>
                    <option value="Finished Goods">Finished Goods [SKU Produk Kemasan]</option>
                  </select>
                </div>

                {invType === 'Packaging & Supporting Materials' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-bold text-slate-700 block text-[11px]">Kategori Material *</label>
                    <select
                      value={invMaterialCategory}
                      onChange={(e) => {
                        setInvMaterialCategory(e.target.value);
                        setInvVariant(''); // reset selected variant on category change
                      }}
                      className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                      required
                    >
                      <option value="Packaging Materials">Packaging Materials</option>
                      <option value="Supporting Materials">Supporting Materials</option>
                      <option value="Production Consumables">Production Consumables</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Varian / SKU *</label>
                  <select
                    value={invVariant}
                    onChange={(e) => setInvVariant(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    required
                  >
                    <option value="">-- Hubungkan Varian --</option>
                    {getVariantOptions().map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {invType === 'Finished Goods' && invVariant && (() => {
                  const selectedSku = skuProduk.find(sp => sp.id === invVariant);
                  const selectedChipVariant = chipVariants.find(cv => cv.id === invVariant);
                  const codeName = selectedSku?.sku || selectedChipVariant?.id || invVariant;
                  const brandName = selectedSku?.brand || selectedChipVariant?.brand || 'AGRIDEA';
                  const gramasi = selectedSku ? `${selectedSku.gramasi}g` : (selectedChipVariant?.packagingSize || '100g');
                  return (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-mono animate-fade-in">
                      <div>
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Variant SKU:</span>
                        <span className="text-slate-800 font-extrabold">{codeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Brand:</span>
                        <span className="text-slate-800 font-extrabold">{brandName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-bold uppercase text-[9px]">Packaging Size / Gramasi:</span>
                        <span className="text-slate-800 font-extrabold">{gramasi}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">Kuantitas (Qty) *</label>
                    <input
                      type="number"
                      value={invQty || ''}
                      onChange={(e) => setInvQty(Number(e.target.value))}
                      placeholder="Contoh: 1000"
                      className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0.01"
                      step="any"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">Unit/Satuan</label>
                    <input
                      type="text"
                      value={getDisplayUnit()}
                      className="border border-slate-200 rounded-xl p-2.5 w-full bg-slate-50 font-medium font-mono cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Biaya per Unit (Unit Cost / HPP) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400 font-mono">Rp</span>
                    <input
                      type="number"
                      value={invCost || ''}
                      onChange={(e) => setInvCost(Number(e.target.value))}
                      placeholder="Harga per kg / pcs"
                      className="border border-slate-200 rounded-xl p-2.5 pl-9 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Tanggal Input *</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Keterangan / Memo</label>
                  <textarea
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    placeholder="Catatan tambahan inisialisasi stok..."
                    className="border border-slate-200 rounded-xl p-2.5 w-full h-20 focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {isEditingInv ? 'Perbarui' : 'Simpan Saldo'}
                  </button>
                  {isEditingInv && (
                    <button
                      type="button"
                      onClick={resetInvForm}
                      className="bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table List Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3.5 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Daftar Saldo Awal Inventaris</h3>
                  <p className="text-slate-500 font-medium">Log riwayat saldo inisialisasi yang terdaftar di database.</p>
                </div>
                <span className="bg-slate-100 text-slate-800 font-extrabold font-mono text-xs px-3 py-1 rounded-full">
                  Total Items: {openingInventory.length}
                </span>
              </div>

              {openingInventory.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-2xl space-y-2 border-slate-300">
                  <Database className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-600">Belum ada saldo awal inventaris.</p>
                  <p className="text-slate-400 text-[10px]">Isi formulir di sebelah kiri untuk menginisialisasi persediaan Gudang awal.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono">
                        <th className="py-2.5 px-3">Gudang</th>
                        <th className="py-2.5 px-3">Varian/Item</th>
                        <th className="py-2.5 px-3">Tipe</th>
                        <th className="py-2.5 px-3 text-right">Kuantitas</th>
                        <th className="py-2.5 px-3 text-right">Unit HPP</th>
                        <th className="py-2.5 px-3 text-right">Total Nilai Asset</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openingInventory.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50 font-medium">
                          <td className="py-3 px-3 font-bold text-indigo-700">{lokasi.find(l=>l.id===item.lokasiId)?.nama || item.lokasiId}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 text-xs">
                            <div>{getItemName(item)}</div>
                            {item.materialCategory && (
                              <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 rounded font-sans uppercase font-bold">{item.materialCategory}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">{item.inventoryType}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold">
                            {item.qty.toLocaleString()} <span className="lowercase font-bold text-slate-400">{getItemUnit(item)}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">Rp {item.unitCost.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-950">Rp {(item.qty * item.unitCost).toLocaleString()}</td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleEditInventory(item)}
                                className="p-1 hover:text-indigo-600 outline-none text-slate-400 bg-slate-50 hover:bg-indigo-50 border border-slate-200.60 rounded transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInventory(item.id, item.variant, item.lokasiId)}
                                className="p-1 hover:text-rose-600 outline-none text-slate-400 bg-slate-50 hover:bg-rose-50 border border-slate-200.60 rounded transition cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab content 2: PRODUCTION POSITION WIP */}
        {activeTab === 'production' && (
          <>
            {/* Form Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-extrabold text-slate-900 text-sm">{isEditingProd ? 'Edit' : 'Tambah'} Saldo WIP Produksi</h3>
                <p className="text-slate-500 font-medium">Daarkan posisi kuantitas bahan yang mengendap dalam stasiun kerja.</p>
              </div>

              <form onSubmit={handleSaveProduction} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Factory / Unit Pabrik *</label>
                  <select
                    value={prodFactory}
                    onChange={(e) => setProdFactory(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                    required
                  >
                    {lokasi.map(l => (
                      <option key={l.id} value={l.id}>{l.nama} ({l.kode})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Tanggal Inisiasi *</label>
                  <input
                    type="date"
                    value={prodDate}
                    onChange={(e) => setProdDate(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">Kuantitas WIP per Workstation:</h4>
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Fresh Fruit In Process (Kg)</label>
                    <input
                      type="number"
                      value={prodFresh || ''}
                      onChange={(e) => setProdFresh(Number(e.target.value))}
                      placeholder="Stasiun Kupas (Kg)"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Frozen In Process (Kg)</label>
                    <input
                      type="number"
                      value={prodFrozen || ''}
                      onChange={(e) => setProdFrozen(Number(e.target.value))}
                      placeholder="Ruang Cold Storage (Kg)"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Vacuum Frying In Process (Kg)</label>
                    <input
                      type="number"
                      value={prodFrying || ''}
                      onChange={(e) => setProdFrying(Number(e.target.value))}
                      placeholder="Stasiun Frying (Kg)"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">QC In Process (Kg)</label>
                    <input
                      type="number"
                      value={prodQc || ''}
                      onChange={(e) => setProdQc(Number(e.target.value))}
                      placeholder="Stasiun QC & Grading (Kg)"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Packaging In Process (Kg)</label>
                    <input
                      type="number"
                      value={prodPacking || ''}
                      onChange={(e) => setProdPacking(Number(e.target.value))}
                      placeholder="Stasiun Packaging (Kg)"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-1 border-t pt-3">
                  <label className="font-bold text-slate-700 block text-[11px]">Keterangan / Memo</label>
                  <textarea
                    value={prodNotes}
                    onChange={(e) => setProdNotes(e.target.value)}
                    placeholder="Catatan tambahan inisialisasi saldo WIP..."
                    className="border border-slate-200 rounded-xl p-2.5 w-full h-16 focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                  />
                </div>

                <div className="pt-1 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {isEditingProd ? 'Perbarui' : 'Simpan Saldo'}
                  </button>
                  {isEditingProd && (
                    <button
                      type="button"
                      onClick={resetProdForm}
                      className="bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table List Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3.5 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Daftar Saldo Awal WIP Produksi</h3>
                  <p className="text-slate-500 font-medium">Bahan setengah jadi yang terperangkap dalam siklus mesin di awal periode.</p>
                </div>
                <span className="bg-slate-100 text-slate-800 font-extrabold font-mono text-xs px-3 py-1 rounded-full">
                  Total Records: {openingProduction.length}
                </span>
              </div>

              {openingProduction.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-2xl space-y-2 border-slate-300">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-600">Belum ada saldo awal WIP produksi.</p>
                  <p className="text-slate-400 text-[10px]">Isi rincian kuantitas work-in-progress di sebelah kiri stasiun kerja.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono">
                        <th className="py-2.5 px-3">Unit Pabrik</th>
                        <th className="py-2.5 px-3">Tgl Inisiasi</th>
                        <th className="py-2.5 px-3 text-right">Draft Kupas</th>
                        <th className="py-2.5 px-3 text-right">Cold Storage</th>
                        <th className="py-2.5 px-3 text-right">Stasiun Frying</th>
                        <th className="py-2.5 px-3 text-right">Stasiun QC</th>
                        <th className="py-2.5 px-3 text-right">Stasiun Kemas</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openingProduction.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50 font-medium">
                          <td className="py-3 px-3 font-bold text-indigo-700">{lokasi.find(l=>l.id===item.lokasiId)?.nama || item.lokasiId}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-950">{item.tanggal}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">{item.freshFruitInProcess.toLocaleString()} kg</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">{item.frozenInProcess.toLocaleString()} kg</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-600">{item.vacuumFryingInProcess.toLocaleString()} kg</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600">{item.qcInProcess.toLocaleString()} kg</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">{item.packagingInProcess.toLocaleString()} kg</td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleEditProduction(item)}
                                className="p-1 hover:text-indigo-600 outline-none text-slate-400 bg-slate-50 hover:bg-indigo-50 border border-slate-200.60 rounded transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduction(item.id, item.lokasiId)}
                                className="p-1 hover:text-rose-600 outline-none text-slate-400 bg-slate-50 hover:bg-rose-50 border border-slate-200.60 rounded transition cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab content 3: FINANCIAL BALANCES */}
        {activeTab === 'financial' && (
          <>
            {/* Form Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-extrabold text-slate-900 text-sm">{isEditingFin ? 'Edit' : 'Tambah'} Saldo Awal Keuangan</h3>
                <p className="text-slate-500 font-medium">Inisialisasi neraca saldo akun kas, bank, liabilitas, dan ekuitas awal.</p>
              </div>

              <form onSubmit={handleSaveFinancial} className="space-y-4 text-[11px] font-medium">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Tanggal Saldo Awal *</label>
                  <input
                    type="date"
                    value={finDate}
                    onChange={(e) => setFinDate(e.target.value)}
                    className="border border-slate-200 rounded-xl p-2.5 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">Asset & Saldo Kas:</h4>
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Cash Balance (Kas Utama) (Rp)</label>
                    <input
                      type="number"
                      value={finCash || ''}
                      onChange={(e) => setFinCash(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Bank Balance (Giro/Rembourse) (Rp)</label>
                    <input
                      type="number"
                      value={finBank || ''}
                      onChange={(e) => setFinBank(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Petty Cash Balance (Brankas Kas Kecil) (Rp)</label>
                    <input
                      type="number"
                      value={finPetty || ''}
                      onChange={(e) => setFinPetty(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Inventory Value (Penilaian Persediaan asset) (Rp)</label>
                    <input
                      type="number"
                      value={finInvVal || ''}
                      onChange={(e) => setFinInvVal(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Accounts Receivable (Piutang Dagang) (Rp)</label>
                    <input
                      type="number"
                      value={finAr || ''}
                      onChange={(e) => setFinAr(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">Liabilitas & Pasiva:</h4>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Accounts Payable (Hutang Dagang) (Rp)</label>
                    <input
                      type="number"
                      value={finAp || ''}
                      onChange={(e) => setFinAp(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Opening Capital (Modal Disetor Awal) (Rp)</label>
                    <input
                      type="number"
                      value={finCapital || ''}
                      onChange={(e) => setFinCapital(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="border border-slate-200 rounded-xl p-2 w-full focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 border-t pt-3">
                  <label className="font-bold text-slate-700 block text-[11px]">Keterangan / Memo</label>
                  <textarea
                    value={finNotes}
                    onChange={(e) => setFinNotes(e.target.value)}
                    placeholder="Catatan saldo awal neraca..."
                    className="border border-slate-200 rounded-xl p-2.5 w-full h-16 focus:ring-2 focus:ring-slate-900 focus:outline-none font-sans"
                  />
                </div>

                <div className="pt-1 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {isEditingFin ? 'Perbarui' : 'Simpan Saldo'}
                  </button>
                  {isEditingFin && (
                    <button
                      type="button"
                      onClick={resetFinForm}
                      className="bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table List Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3.5 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Daftar Saldo Neraca Awal</h3>
                  <p className="text-slate-500 font-medium">Laporan neraca keuangan inisiasi saldo pembukuan double-entry.</p>
                </div>
                <span className="bg-slate-100 text-slate-800 font-extrabold font-mono text-xs px-3 py-1 rounded-full">
                  Total Neraca: {openingFinancial.length}
                </span>
              </div>

              {openingFinancial.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-2xl space-y-2 border-slate-300">
                  <TrendingUp className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-600">Belum ada saldo neraca keuangan awal.</p>
                  <p className="text-slate-400 text-[10px]">Isi jumlah asiva, pasiva, kas dan hutang Dagang awal periode.</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono text-[10px]">
                        <th className="py-2.5 px-3">Tgl Neraca</th>
                        <th className="py-2.5 px-3 text-right">Kas / Tunai</th>
                        <th className="py-2.5 px-3 text-right">Bank / Escrow</th>
                        <th className="py-2.5 px-3 text-right">Kas Kecil (PC)</th>
                        <th className="py-2.5 px-3 text-right">Inventory Val</th>
                        <th className="py-2.5 px-3 text-right">Hutang (AP)</th>
                        <th className="py-2.5 px-3 text-right">Piutang (AR)</th>
                        <th className="py-2.5 px-3 text-right">Modal Awal</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openingFinancial.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50 font-medium text-slate-900">
                          <td className="py-3 px-3 font-bold font-mono">{item.tanggal}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">Rp {item.cashBalance.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-teal-700">Rp {item.bankBalance.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">Rp {item.pettyCashBalance.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">Rp {item.inventoryValue.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">Rp {item.accountsPayable.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-sky-600">Rp {item.accountsReceivable.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-950">Rp {item.openingCapital.toLocaleString()}</td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEditFinancial(item)}
                                className="p-1 hover:text-indigo-600 outline-none text-slate-400 bg-slate-50 hover:bg-indigo-50 border border-slate-200.60 rounded transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteFinancial(item.id)}
                                className="p-1 hover:text-rose-600 outline-none text-slate-400 bg-slate-50 hover:bg-rose-50 border border-slate-200.60 rounded transition cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
