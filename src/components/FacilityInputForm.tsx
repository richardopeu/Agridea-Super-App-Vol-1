/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Factory,
  Users,
  Building2,
  Package,
  Sprout,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Maximize2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Navigation,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { FacilityCategory, FacilityNetworkEntity } from '../types';

interface FacilityInputFormProps {
  entities: FacilityNetworkEntity[];
  onSaveEntity: (entity: FacilityNetworkEntity) => void;
  onDeleteEntity: (id: string) => void;
  onSelectOnMap: (entity: FacilityNetworkEntity) => void;
  pickedCoord: { lat: number; lng: number } | null;
}

const CATEGORY_CONFIG: Record<
  FacilityCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  pabrik: {
    label: 'Pabrik Pengolahan',
    icon: Factory,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  mitra_tani: {
    label: 'Mitra Tani',
    icon: Users,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  hq_hub: {
    label: 'HQ Hub & Logistik',
    icon: Building2,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  mitra_supplier: {
    label: 'Mitra Supplier',
    icon: Package,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  mitra_lahan: {
    label: 'Mitra Lahan / Perkebunan',
    icon: Sprout,
    color: 'text-lime-700',
    bg: 'bg-lime-50',
    border: 'border-lime-200'
  }
};

const COMMON_RAW_MATERIALS = [
  'Apel Manalagi',
  'Apel Anna',
  'Apel Rome Beauty',
  'Nangka Madu',
  'Salak Pondoh',
  'Pisang Candi',
  'Pisang Ambon',
  'Mangga Arumanis',
  'Wortel Berastagi',
  'Kentang Granola',
  'Jamur Tiram',
  'Sayur Kol / Kubis',
  'Buncis Perancis',
  'Minyak Kelapa Sawit Fraksinasi',
  'Kemasan Aluminium Foil & Box'
];

export default function FacilityInputForm({
  entities,
  onSaveEntity,
  onDeleteEntity,
  onSelectOnMap,
  pickedCoord
}: FacilityInputFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTabCategory, setActiveTabCategory] = useState<FacilityCategory | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FacilityCategory>('mitra_tani');
  const [phone, setPhone] = useState('');
  const [rawMaterial, setRawMaterial] = useState('Apel Manalagi');
  const [harvestCapacity, setHarvestCapacity] = useState('15 Ton / Bulan');
  const [lat, setLat] = useState<string>('-7.8712');
  const [lng, setLng] = useState<string>('112.5268');
  const [landArea, setLandArea] = useState('5.5 Hektar');
  const [harvestMonths, setHarvestMonths] = useState('Agustus - November');
  const [pricePerKg, setPricePerKg] = useState<number>(8500);
  const [pic, setPic] = useState('');
  const [city, setCity] = useState('Batu');
  const [province, setProvince] = useState('Jawa Timur');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Operasional' | 'Masa Panen' | 'Persiapan Tanam' | 'Siap Kirim'>('Masa Panen');
  const [notification, setNotification] = useState<string | null>(null);

  // Set picked coordinates from map
  const applyPickedCoordinate = () => {
    if (pickedCoord) {
      setLat(pickedCoord.lat.toFixed(6));
      setLng(pickedCoord.lng.toFixed(6));
      setNotification(`Koordinat diambil dari peta: ${pickedCoord.lat.toFixed(4)}, ${pickedCoord.lng.toFixed(4)}`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Browser Geolocation
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
          setNotification('Koordinat berhasil didapatkan dari GPS perangkat.');
          setTimeout(() => setNotification(null), 3000);
        },
        () => {
          alert('Gagal mengakses GPS perangkat. Silakan input manual atau klik di peta.');
        }
      );
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('mitra_tani');
    setPhone('');
    setRawMaterial('Apel Manalagi');
    setHarvestCapacity('10 Ton / Bulan');
    setLat('-7.8712');
    setLng('112.5268');
    setLandArea('5.0 Hektar');
    setHarvestMonths('Agustus - November');
    setPricePerKg(8500);
    setPic('');
    setCity('Batu');
    setProvince('Jawa Timur');
    setAddress('');
    setStatus('Masa Panen');
  };

  const startEdit = (item: FacilityNetworkEntity) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPhone(item.phone);
    setRawMaterial(item.rawMaterial);
    setHarvestCapacity(item.harvestCapacity);
    setLat(String(item.lat));
    setLng(String(item.lng));
    setLandArea(item.landArea);
    setHarvestMonths(item.harvestMonths);
    setPricePerKg(item.pricePerKg);
    setPic(item.pic);
    setCity(item.city);
    setProvince(item.province);
    setAddress(item.address);
    setStatus(item.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mohon isi nama fasilitas/mitra!');
      return;
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      alert('Koordinat latitude/longitude tidak valid!');
      return;
    }

    const entityData: FacilityNetworkEntity = {
      id: editingId || `fac-${Date.now()}`,
      name: name.trim(),
      category,
      phone: phone.trim(),
      rawMaterial: rawMaterial.trim(),
      harvestCapacity: harvestCapacity.trim(),
      lat: parsedLat,
      lng: parsedLng,
      landArea: landArea.trim(),
      harvestMonths: harvestMonths.trim(),
      pricePerKg: Number(pricePerKg) || 0,
      pic: pic.trim(),
      city: city.trim(),
      province: province.trim(),
      address: address.trim(),
      status,
      updatedAt: new Date().toISOString()
    };

    onSaveEntity(entityData);
    setNotification(editingId ? 'Data berhasil diperbarui!' : 'Data mitra/fasilitas baru berhasil didaftarkan!');
    setTimeout(() => setNotification(null), 3000);
    resetForm();
  };

  // Filtered entity list
  const filteredEntities = entities.filter(ent => {
    const matchCategory = activeTabCategory === 'all' || ent.category === activeTabCategory;
    const matchSearch =
      !searchFilter ||
      ent.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ent.rawMaterial.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ent.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ent.pic.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              Input & Registrasi Fasilitas Agro-Jaringan
            </h3>
          </div>
          <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
            Input data koordinat dan parameter komprehensif untuk 5 pilar ekosistem rantai pasok: 
            <strong> Pabrik</strong>, <strong>Mitra Tani</strong>, <strong>HQ Hub</strong>, <strong>Mitra Supplier</strong>, dan <strong>Mitra Lahan</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pickedCoord && (
            <button
              type="button"
              onClick={applyPickedCoordinate}
              className="px-3 py-1.5 bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Gunakan GPS ({pickedCoord.lat.toFixed(2)}, {pickedCoord.lng.toFixed(2)})
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </span>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">
                {editingId ? 'Edit Data Fasilitas / Mitra' : 'Registrasi Fasilitas Baru'}
              </h4>
              <p className="text-[11px] text-slate-400">Pastikan koordinat peta dan harga per kg terisi akurat.</p>
            </div>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Kategori Fasilitas / Entitas Jaringan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as FacilityCategory[]).map(catKey => {
                const conf = CATEGORY_CONFIG[catKey];
                const Icon = conf.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                      isSelected
                        ? `${conf.bg} ${conf.border} border-2 ${conf.color} font-extrabold shadow-xs`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? conf.color : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* 1. Nama */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Entitas / Mitra / Pabrik <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kelompok Tani Sumber Makmur Bumiaji"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* 2. Nomor HP */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Nomor HP / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +62 812-3456-7890"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* 3. Jenis Bahan Baku */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jenis Bahan Baku / Komoditas Utama <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={rawMaterial}
                  onChange={e => setRawMaterial(e.target.value)}
                  placeholder="e.g. Apel Manalagi & Rome Beauty"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
                <select
                  onChange={e => e.target.value && setRawMaterial(e.target.value)}
                  className="px-2 py-2 text-xs bg-slate-100 border border-slate-250 rounded-lg text-slate-700 cursor-pointer"
                  title="Pilih contoh komoditas"
                >
                  <option value="">Pilih...</option>
                  {COMMON_RAW_MATERIALS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Kapasitas Panen */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kapasitas Panen / Kapasitas Olah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={harvestCapacity}
                onChange={e => setHarvestCapacity(e.target.value)}
                placeholder="e.g. 15 Ton / Bulan atau 3.000 Kg / Hari"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* 5. Luas Lahan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-slate-400" />
                Luas Lahan (Ha / m²)
              </label>
              <input
                type="text"
                value={landArea}
                onChange={e => setLandArea(e.target.value)}
                placeholder="e.g. 8.5 Hektar (atau 12.000 m²)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* 6. Bulan Musim Panen */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Bulan Musim Panen
              </label>
              <input
                type="text"
                value={harvestMonths}
                onChange={e => setHarvestMonths(e.target.value)}
                placeholder="e.g. Agustus - November (atau Sepanjang Tahun)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* 7. Harga per Kg */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                Harga per Kg (Rp / Kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">Rp</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={pricePerKg}
                  onChange={e => setPricePerKg(Number(e.target.value))}
                  placeholder="8500"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-emerald-800"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Format: Rp {pricePerKg.toLocaleString('id-ID')} / kg
              </span>
            </div>

            {/* 8. Titik Koordinat Maps (Lat & Lng) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  Titik Koordinat di Maps (Latitude, Longitude) <span className="text-rose-500">*</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-2.5 h-2.5" /> GPS Saya
                  </button>
                  {pickedCoord && (
                    <button
                      type="button"
                      onClick={applyPickedCoordinate}
                      className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" /> Titik Peta
                    </button>
                  )}
                </div>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  placeholder="Latitude (e.g. -7.8712)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <input
                  type="text"
                  required
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  placeholder="Longitude (e.g. 112.5268)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Klik lokasi di peta Google Maps untuk menyalin titik koordinat secara langsung tanpa perlu mengetik manual.
              </p>
            </div>

            {/* 9. PIC / Kontak Person */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama PIC / Koordinator Lapangan
              </label>
              <input
                type="text"
                value={pic}
                onChange={e => setPic(e.target.value)}
                placeholder="e.g. Pak Slamet Riyadi"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* 10. Kota & Provinsi */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kota / Kabupaten & Provinsi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Kota (e.g. Batu)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
                <input
                  type="text"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  placeholder="Provinsi (e.g. Jawa Timur)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>
            </div>

            {/* 11. Status Operasional */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              >
                <option value="Masa Panen">Masa Panen (Aktif Panen)</option>
                <option value="Operasional">Operasional (Pabrik / Hub)</option>
                <option value="Persiapan Tanam">Persiapan Tanam / Pemupukan</option>
                <option value="Siap Kirim">Siap Kirim / Logistik Transit</option>
              </select>
            </div>
          </div>

          {/* Alamat Lengkap */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Alamat Lengkap & Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Desa Sumbergondo, Bumiaji, Kota Batu. Elevasi 1.100 mdpl lereng Gunung Arjuno."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingId ? 'Simpan Perubahan' : 'Daftarkan ke Jaringan Maps'}
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table of Registered Facilities */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span>Database Terdaftar di Google Maps Facility Network</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                {entities.length} Lokasi
              </span>
            </h4>
            <p className="text-slate-400 text-xs mt-0.5">
              Kelola dan pantau seluruh entitas rantai pasok dalam satu direktori terpusat.
            </p>
          </div>

          {/* Search bar & Category filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Cari nama, bahan, kota..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={activeTabCategory}
              onChange={e => setActiveTabCategory(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-700 font-semibold"
            >
              <option value="all">Semua Kategori</option>
              <option value="pabrik">Pabrik</option>
              <option value="mitra_tani">Mitra Tani</option>
              <option value="hq_hub">HQ Hub</option>
              <option value="mitra_supplier">Mitra Supplier</option>
              <option value="mitra_lahan">Mitra Lahan</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 font-bold">Kategori</th>
                <th className="py-2.5 px-3 font-bold">Nama Entitas</th>
                <th className="py-2.5 px-3 font-bold">Bahan Baku</th>
                <th className="py-2.5 px-3 font-bold">Kapasitas / Luas</th>
                <th className="py-2.5 px-3 font-bold">Harga / Kg</th>
                <th className="py-2.5 px-3 font-bold">Musim Panen</th>
                <th className="py-2.5 px-3 font-bold">Koordinat GPS</th>
                <th className="py-2.5 px-3 font-bold">Kontak / PIC</th>
                <th className="py-2.5 px-3 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Tidak ditemukan data yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredEntities.map(item => {
                  const conf = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.mitra_tani;
                  const Icon = conf.icon;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${conf.bg} ${conf.color}`}>
                          <Icon className="w-3 h-3" />
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.city}, {item.province}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-700">{item.rawMaterial}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-slate-700">{item.harvestCapacity}</p>
                        <p className="text-[10px] text-slate-400">{item.landArea || '-'}</p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Rp {item.pricePerKg.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-600">{item.harvestMonths || 'Sepanjang Tahun'}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[10px] text-slate-600">
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-slate-800">{item.pic || '-'}</p>
                        <p className="text-[10px] font-mono text-slate-500">{item.phone}</p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectOnMap(item)}
                            title="Tampilkan di Peta Google Maps"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            title="Edit Data"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menghapus ${item.name}?`)) {
                                onDeleteEntity(item.id);
                              }
                            }}
                            title="Hapus Data"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
