/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Factory,
  Truck,
  Layers,
  Search,
  ExternalLink,
  Navigation,
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Phone,
  Calendar,
  Package,
  PlusCircle,
  Sparkles,
  Users,
  Building2,
  Sprout,
  DollarSign,
  Maximize2,
  Cloud,
  Database
} from 'lucide-react';
import { FacilityCategory, FacilityNetworkEntity } from '../types';
import FacilityInputForm from './FacilityInputForm';
import HarvestRadarAI from './HarvestRadarAI';
import { GoogleCloudWorkspaceHub } from './GoogleCloudWorkspaceHub';

const INITIAL_FACILITIES: FacilityNetworkEntity[] = [
  // 1. Pabrik Pengolahan
  {
    id: 'fac-ssp',
    name: 'Sipahutar Soda Premium (SSP) - Batu',
    category: 'pabrik',
    phone: '+62 813-8899-1234',
    rawMaterial: 'Apel Manalagi, Rome Beauty & Anna',
    harvestCapacity: '4,500 Kg/hari (Kapasitas Olah)',
    lat: -7.8712,
    lng: 112.5268,
    landArea: '1.8 Hektar (Kawasan Pabrik)',
    harvestMonths: 'Sepanjang Tahun (Olah Harian)',
    pricePerKg: 18500, // rata-rata HPP bahan baku olah
    city: 'Batu',
    province: 'Jawa Timur',
    address: 'Jl. Raya Bumiaji No. 88, Kota Batu',
    pic: 'Dra. Endang Sulastri',
    status: 'Operasional',
    description: 'Pabrik utama ekstraksi dan penggorengan hampa keripik apel khas Malang-Batu dengan 6 unit vacuum fryer.'
  },
  {
    id: 'fac-mpd',
    name: 'Madiun Premium Drink (MPD)',
    category: 'pabrik',
    phone: '+62 812-3456-7890',
    rawMaterial: 'Nangka Madu, Salak Pondoh, Pisang Candi',
    harvestCapacity: '3,000 Kg/hari (Kapasitas Olah)',
    lat: -7.6298,
    lng: 111.5239,
    landArea: '2.2 Hektar',
    harvestMonths: 'Sepanjang Tahun',
    pricePerKg: 16000,
    city: 'Madiun',
    province: 'Jawa Timur',
    address: 'Kawasan Industri Ring Road Barat, Madiun',
    pic: 'Ir. Slamet Riyadi',
    status: 'Operasional',
    description: 'Pusat pengolahan keripik nangka, salak, dan aneka buah kering premium kapasitas tinggi.'
  },
  {
    id: 'fac-agdn',
    name: 'Agrowisata Drink Nusantara (AGDN) - Cikarang',
    category: 'pabrik',
    phone: '+62 811-9012-3456',
    rawMaterial: 'Kemasan Foil, Box Karton & Toples Segel',
    harvestCapacity: '2,500 Kg/hari (Packaging Hub)',
    lat: -6.3039,
    lng: 107.1691,
    landArea: '1.2 Hektar',
    harvestMonths: 'Sepanjang Tahun',
    pricePerKg: 22000,
    city: 'Cikarang',
    province: 'Jawa Barat',
    address: 'Delta Silicon Industrial Estate, Cikarang',
    pic: 'Stefanus Wijaya',
    status: 'Operasional',
    description: 'Fasilitas finishing nitro packaging, kontrol mutu toples kaleng, dan pusat distribusi Jabodetabek.'
  },

  // 2. Mitra Tani
  {
    id: 'farm-bumiaji',
    name: 'Kelompok Tani Apel Bumiaji',
    category: 'mitra_tani',
    phone: '+62 857-4567-8901',
    rawMaterial: 'Apel Manalagi & Rome Beauty',
    harvestCapacity: '15 Ton / Bulan',
    lat: -7.8320,
    lng: 112.5350,
    landArea: '12.5 Hektar',
    harvestMonths: 'Agustus - November',
    pricePerKg: 8500,
    city: 'Bumiaji, Batu',
    province: 'Jawa Timur',
    address: 'Desa Sumbergondo, Bumiaji, Batu (Ketinggian 1.100 mdpl)',
    pic: 'Pak Sutrisno',
    status: 'Masa Panen',
    description: 'Mitra tani apel legendaris lereng Arjuno dengan sortasi kadar air rendah dan brix 13.5°.'
  },
  {
    id: 'farm-dampit',
    name: 'Koperasi Mitra Tani Nangka Dampit',
    category: 'mitra_tani',
    phone: '+62 812-7890-4321',
    rawMaterial: 'Nangka Madu Super',
    harvestCapacity: '8 Ton / Bulan',
    lat: -8.2130,
    lng: 112.7540,
    landArea: '18.0 Hektar',
    harvestMonths: 'September - Desember',
    pricePerKg: 7500,
    city: 'Dampit, Malang',
    province: 'Jawa Timur',
    address: 'Kecamatan Dampit, Kabupaten Malang',
    pic: 'Haji Mansyur',
    status: 'Masa Panen',
    description: 'Sumber nangka madu berdaging tebal kuning keemasan untuk rendemen keripik optimal 21%.'
  },
  {
    id: 'farm-pasuruan',
    name: 'Paguyuban Salak Purwosari',
    category: 'mitra_tani',
    phone: '+62 813-2233-4455',
    rawMaterial: 'Salak Pondoh Manis',
    harvestCapacity: '6 Ton / Bulan',
    lat: -7.7650,
    lng: 112.7510,
    landArea: '9.0 Hektar',
    harvestMonths: 'Oktober - Januari',
    pricePerKg: 6500,
    city: 'Purwosari, Pasuruan',
    province: 'Jawa Timur',
    address: 'Kec. Purwosari, Pasuruan (Kaki G. Arjuno timur)',
    pic: 'Cak Wardi',
    status: 'Masa Panen',
    description: 'Penyuplai salak dengan tekstur renyah dan kadar air seimbang tidak berair saat digoreng.'
  },
  {
    id: 'farm-semeru',
    name: 'Mitra Pisang Candi Pasrujambe',
    category: 'mitra_tani',
    phone: '+62 822-4455-6677',
    rawMaterial: 'Pisang Candi & Pisang Ambon',
    harvestCapacity: '10 Ton / Bulan',
    lat: -8.1330,
    lng: 113.1120,
    landArea: '14.0 Hektar',
    harvestMonths: 'Sepanjang Tahun (Panen Mingguan)',
    pricePerKg: 5500,
    city: 'Pasrujambe, Lumajang',
    province: 'Jawa Timur',
    address: 'Lereng Semeru Barat, Lumajang',
    pic: 'Bu Hartatik',
    status: 'Masa Panen',
    description: 'Perkebunan pisang vulkanik subur untuk keripik pisang manis gurih warna kuning alami.'
  },
  {
    id: 'farm-tosari',
    name: 'Kelompok Tani Sayur Tosari Bromo',
    category: 'mitra_tani',
    phone: '+62 819-3344-5566',
    rawMaterial: 'Wortel Berastagi & Kubis Manis',
    harvestCapacity: '12 Ton / Bulan',
    lat: -7.8860,
    lng: 112.9120,
    landArea: '11.0 Hektar',
    harvestMonths: 'Juli - Oktober',
    pricePerKg: 4500,
    city: 'Tosari, Pasuruan',
    province: 'Jawa Timur',
    address: 'Kawasan Kaldera Tengger Bromo, Elevasi 1.700 mdpl',
    pic: 'Pak Budi Waluyo',
    status: 'Masa Panen',
    description: 'Wortel dan sayuran dataran tinggi berserat padat ideal untuk keripik sayur dehidrasi.'
  },

  // 3. HQ Hub & Logistik
  {
    id: 'hub-jkt',
    name: 'Jakarta HQ & Logistics Center',
    category: 'hq_hub',
    phone: '+62 21-555-1234',
    rawMaterial: 'Transit Finished Goods Keripik Kaleng & Toples',
    harvestCapacity: '150 Pallet / Minggu',
    lat: -6.1754,
    lng: 106.8272,
    landArea: '0.8 Hektar (Gedung & Gudang)',
    harvestMonths: 'Sepanjang Tahun',
    pricePerKg: 0,
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    address: 'Gedung Menara Agridea Lt. 14, Jakarta Pusat',
    pic: 'Richardo Petricius (Director)',
    status: 'Operasional',
    description: 'Pusat kendali enterprise AI control tower, manajemen akun ekspor, dan logistik Jabodetabek.'
  },
  {
    id: 'hub-sby',
    name: 'Surabaya Tanjung Perak Cold Hub',
    category: 'hq_hub',
    phone: '+62 31-7788-9900',
    rawMaterial: 'Depot Kontainer Reefer & Muatan Ekspor',
    harvestCapacity: '8 Kontainer 40ft / Bulan',
    lat: -7.1950,
    lng: 112.7350,
    landArea: '1.5 Hektar',
    harvestMonths: 'Sepanjang Tahun',
    pricePerKg: 0,
    city: 'Surabaya',
    province: 'Jawa Timur',
    address: 'Kawasan Pergudangan Perak Barat, Surabaya',
    pic: 'Hendro Gunawan',
    status: 'Operasional',
    description: 'Hub konsolidasi ekspor jalur laut ke Singapura, Malaysia, dan Timur Tengah.'
  },

  // 4. Mitra Supplier
  {
    id: 'sup-berkah',
    name: 'CV Berkah Agro Kemasan',
    category: 'mitra_supplier',
    phone: '+62 811-2233-8899',
    rawMaterial: 'Standing Pouch Foil & Nitrogen Food Grade',
    harvestCapacity: '50,000 Pouch / Bulan',
    lat: -7.5360,
    lng: 112.2380,
    landArea: '2,500 m²',
    harvestMonths: 'Sepanjang Tahun',
    pricePerKg: 1200, // per pcs / unit
    city: 'Jombang',
    province: 'Jawa Timur',
    address: 'Kawasan Industri Ploso, Jombang',
    pic: 'Agus Setiawan',
    status: 'Siap Kirim',
    description: 'Supplier utama kemasan food-grade barrier oksigen tinggi bersertifikat halal & BPOM.'
  },
  {
    id: 'sup-sawit',
    name: 'PT Minyak Murni Nabati',
    category: 'mitra_supplier',
    phone: '+62 813-7766-5544',
    rawMaterial: 'Minyak Kelapa Sawit Fraksinasi (Cooking Oil)',
    harvestCapacity: '20 Ton / Bulan',
    lat: -7.3120,
    lng: 112.7210,
    landArea: '3.0 Hektar',
    harvestMonths: 'Sepanjang Tahun',
    pricePerKg: 14500,
    city: 'Sidoarjo',
    province: 'Jawa Timur',
    address: 'Kawasan Industri Rungkut - Waru, Sidoarjo',
    pic: 'Bambang Sudarsono',
    status: 'Siap Kirim',
    description: 'Penyuplai minyak fraksinasi titik asap tinggi untuk menjaga kerenyahan tanpa rasa tengik.'
  },

  // 5. Mitra Lahan
  {
    id: 'lahan-songgoriti',
    name: 'Lahan Perkebunan Inti Songgoriti',
    category: 'mitra_lahan',
    phone: '+62 812-9988-7766',
    rawMaterial: 'Apel Organik & Varietas Baru Anna Super',
    harvestCapacity: '20 Ton / Musim',
    lat: -7.8650,
    lng: 112.4980,
    landArea: '14.0 Hektar',
    harvestMonths: 'September - November',
    pricePerKg: 9500,
    city: 'Songgokerto, Batu',
    province: 'Jawa Timur',
    address: 'Kawasan Perbukitan Songgoriti, Kota Batu',
    pic: 'Subandi (Agronomist)',
    status: 'Masa Panen',
    description: 'Lahan percontohan pertanian cerdas berbasis sensor kelembaban tanah dan mikro-irigasi tetes.'
  },
  {
    id: 'lahan-poncokusumo',
    name: 'Lahan Kemitraan Poncokusumo',
    category: 'mitra_lahan',
    phone: '+62 821-3322-1100',
    rawMaterial: 'Nangka Madu & Alpukat Mentega',
    harvestCapacity: '25 Ton / Musim',
    lat: -8.0450,
    lng: 112.8020,
    landArea: '22.0 Hektar',
    harvestMonths: 'Agustus - Desember',
    pricePerKg: 8000,
    city: 'Poncokusumo, Malang',
    province: 'Jawa Timur',
    address: 'Desa Ngadas, Poncokusumo, Kabupaten Malang',
    pic: 'Kusworo',
    status: 'Persiapan Tanam',
    description: 'Lahan kemitraan terasering subur berpasir vulkanik Bromo untuk varietas nangka berdaging padat.'
  }
];

interface GoogleMapsFacilityTrackerProps {
  state?: any;
  onPickCoordinate?: (lat: number, lng: number) => void;
  defaultActiveTab?: 'peta' | 'input-data' | 'rekomendasi-panen' | 'workspace-sync';
}

export default function GoogleMapsFacilityTracker({
  state,
  onPickCoordinate,
  defaultActiveTab = 'peta'
}: GoogleMapsFacilityTrackerProps) {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // Active top-level navigation tab
  const [activeTab, setActiveTab] = useState<'peta' | 'input-data' | 'rekomendasi-panen' | 'workspace-sync'>(
    defaultActiveTab
  );

  // Entities state with LocalStorage and Cloud SQL persistence
  const [entities, setEntities] = useState<FacilityNetworkEntity[]>(() => {
    try {
      const saved = localStorage.getItem('agridea_custom_facilities_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved facilities', e);
    }
    return INITIAL_FACILITIES;
  });

  // Fetch or Seed from Cloud SQL on mount
  useEffect(() => {
    fetch('/api/facilities')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.facilities) && data.facilities.length > 0) {
          setEntities(data.facilities);
        } else {
          // Seed INITIAL_FACILITIES into Cloud SQL
          INITIAL_FACILITIES.forEach(fac => {
            fetch('/api/facilities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fac)
            }).catch(() => {});
          });
        }
      })
      .catch(err => {
        console.warn('Cloud SQL facilities fetch note:', err);
      });
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('agridea_custom_facilities_v2', JSON.stringify(entities));
    } catch (e) {
      console.error('Failed to store facilities', e);
    }
  }, [entities]);

  // Selected item on map
  const [selectedEntity, setSelectedEntity] = useState<FacilityNetworkEntity | null>(
    entities[0] || null
  );
  const [filterCategory, setFilterCategory] = useState<FacilityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Map center state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -7.8712,
    lng: 112.5268
  });
  const [mapZoom, setMapZoom] = useState<number>(8);

  // Filtered entities for Map & Sidebar
  const filteredEntities = entities.filter(item => {
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rawMaterial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Factories list for Harvest Radar
  const factoryEntities = entities.filter(e => e.category === 'pabrik');

  // Handle map click
  const handleMapClick = (ev: any) => {
    if (ev.detail && ev.detail.latLng) {
      const { lat, lng } = ev.detail.latLng;
      setClickedCoord({ lat, lng });
      if (onPickCoordinate) {
        onPickCoordinate(lat, lng);
      }
    }
  };

  // Save entity (create / update)
  const handleSaveEntity = (savedItem: FacilityNetworkEntity) => {
    setEntities(prev => {
      const exists = prev.some(item => item.id === savedItem.id);
      if (exists) {
        return prev.map(item => (item.id === savedItem.id ? savedItem : item));
      }
      return [savedItem, ...prev];
    });
    setSelectedEntity(savedItem);

    // Persist to Cloud SQL PostgreSQL
    fetch('/api/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedItem),
    }).catch(err => console.warn('Could not persist facility to Cloud SQL:', err));
  };

  // Delete entity
  const handleDeleteEntity = (id: string) => {
    setEntities(prev => prev.filter(item => item.id !== id));
    if (selectedEntity?.id === id) {
      setSelectedEntity(null);
    }

    // Delete from Cloud SQL PostgreSQL
    fetch(`/api/facilities/${id}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Could not delete facility from Cloud SQL:', err));
  };

  // Select on map
  const handleSelectOnMap = (item: FacilityNetworkEntity) => {
    setSelectedEntity(item);
    setMapCenter({ lat: item.lat, lng: item.lng });
    setMapZoom(11);
    setActiveTab('peta');
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Main Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('peta')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'peta'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Peta & Direktori Jaringan</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/15 rounded">
              {entities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('input-data')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'input-data'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>2. Input Data (Pabrik, Tani, Hub, Supplier, Lahan)</span>
          </button>

          <button
            onClick={() => setActiveTab('rekomendasi-panen')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'rekomendasi-panen'
                ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>3. Rekomendasi Panen AI (Radius 150 KM)</span>
            <span className="text-[9px] uppercase tracking-wider bg-white/20 text-white font-black px-1.5 py-0.5 rounded">
              Gemini Realtime
            </span>
          </button>

          <button
            id="tab-btn-workspace-sync"
            onClick={() => setActiveTab('workspace-sync')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'workspace-sync'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>4. Google Drive, Sheets & Cloud SQL Hub</span>
            <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
              Sync
            </span>
          </button>
        </div>

        {/* Quick GPS Status */}
        {clickedCoord && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Titik Klik: <strong>{clickedCoord.lat.toFixed(4)}, {clickedCoord.lng.toFixed(4)}</strong>
            </span>
            <button
              onClick={() => setActiveTab('input-data')}
              className="text-emerald-700 font-extrabold hover:underline ml-1"
            >
              + Input Data
            </button>
          </div>
        )}
      </div>

      {/* ======================= TAB 1: PETA INTERAKTIF & DIREKTORI ======================= */}
      {activeTab === 'peta' && (
        <div className="space-y-4">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Pabrik */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pabrik Aktif</span>
                <p className="text-base font-black text-slate-900">
                  {entities.filter(e => e.category === 'pabrik').length} Unit
                </p>
                <span className="text-[9px] text-emerald-600 font-bold">Batu, Madiun, Cikarang</span>
              </div>
            </div>

            {/* Mitra Tani */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mitra Tani</span>
                <p className="text-base font-black text-slate-900">
                  {entities.filter(e => e.category === 'mitra_tani').length} Kelompok
                </p>
                <span className="text-[9px] text-amber-600 font-bold">Apel, Nangka, Salak, Sayur</span>
              </div>
            </div>

            {/* HQ Hub */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">HQ Hub</span>
                <p className="text-base font-black text-slate-900">
                  {entities.filter(e => e.category === 'hq_hub').length} Hub
                </p>
                <span className="text-[9px] text-blue-600 font-bold">Jakarta & Surabaya</span>
              </div>
            </div>

            {/* Mitra Supplier */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mitra Supplier</span>
                <p className="text-base font-black text-slate-900">
                  {entities.filter(e => e.category === 'mitra_supplier').length} Mitra
                </p>
                <span className="text-[9px] text-purple-600 font-bold">Foil, Minyak & Gas</span>
              </div>
            </div>

            {/* Mitra Lahan */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-lime-100 text-lime-700 flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mitra Lahan</span>
                <p className="text-base font-black text-slate-900">
                  {entities.filter(e => e.category === 'mitra_lahan').length} Perkebunan
                </p>
                <span className="text-[9px] text-lime-700 font-bold">36+ Hektar Lahan</span>
              </div>
            </div>
          </div>

          {/* Map View & Left Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[700px]">
            {/* Left Facilities Directory Sidebar */}
            <div className="w-full lg:w-88 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col gap-3 shrink-0 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                    Direktori Fasilitas
                  </h4>
                </div>
                <button
                  onClick={() => setActiveTab('input-data')}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" /> Tambah Baru
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari fasilitas, bahan baku, kota..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category Pills Filter */}
              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-2 py-1 rounded transition ${
                    filterCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Semua ({entities.length})
                </button>
                <button
                  onClick={() => setFilterCategory('pabrik')}
                  className={`px-2 py-1 rounded transition ${
                    filterCategory === 'pabrik'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Pabrik
                </button>
                <button
                  onClick={() => setFilterCategory('mitra_tani')}
                  className={`px-2 py-1 rounded transition ${
                    filterCategory === 'mitra_tani'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Mitra Tani
                </button>
                <button
                  onClick={() => setFilterCategory('hq_hub')}
                  className={`px-2 py-1 rounded transition ${
                    filterCategory === 'hq_hub'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  HQ Hub
                </button>
                <button
                  onClick={() => setFilterCategory('mitra_supplier')}
                  className={`px-2 py-1 rounded transition ${
                    filterCategory === 'mitra_supplier'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Supplier
                </button>
                <button
                  onClick={() => setFilterCategory('mitra_lahan')}
                  className={`px-2 py-1 rounded transition ${
                    filterCategory === 'mitra_lahan'
                      ? 'bg-lime-700 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Lahan
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredEntities.map(item => {
                  const isSelected = selectedEntity?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedEntity(item);
                        setMapCenter({ lat: item.lat, lng: item.lng });
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-800 leading-snug">
                          {item.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                            item.category === 'pabrik'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.category === 'mitra_tani'
                              ? 'bg-amber-100 text-amber-700'
                              : item.category === 'hq_hub'
                              ? 'bg-blue-100 text-blue-700'
                              : item.category === 'mitra_supplier'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-lime-100 text-lime-700'
                          }`}
                        >
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-[10px] text-emerald-700 font-semibold mb-1">
                        📦 {item.rawMaterial}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1 mt-1">
                        <span>{item.city}, {item.province}</span>
                        <span className="font-mono font-bold text-slate-700">
                          {item.pricePerKg > 0 ? `Rp ${item.pricePerKg.toLocaleString('id-ID')}/kg` : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clicked coordinate banner */}
              {clickedCoord && (
                <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl text-[10px] space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Titik Terpilih dari Klik Peta:
                  </span>
                  <p className="font-mono text-white">
                    {clickedCoord.lat.toFixed(6)}, {clickedCoord.lng.toFixed(6)}
                  </p>
                  <button
                    onClick={() => setActiveTab('input-data')}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-center mt-1"
                  >
                    Pakai Titik Ini di Form Input
                  </button>
                </div>
              )}
            </div>

            {/* Right Interactive Google Map Canvas */}
            <div className="flex-1 relative h-full">
              {apiKey ? (
                <APIProvider apiKey={apiKey}>
                  <Map
                    center={mapCenter}
                    zoom={mapZoom}
                    onCenterChanged={ev => setMapCenter(ev.detail.center)}
                    onZoomChanged={ev => setMapZoom(ev.detail.zoom)}
                    mapId="AGRIDEA_GEO_FACILITY_MAP"
                    onClick={handleMapClick}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    className="w-full h-full"
                  >
                    {filteredEntities.map(item => (
                      <Marker
                        key={item.id}
                        position={{ lat: item.lat, lng: item.lng }}
                        onClick={() => setSelectedEntity(item)}
                        title={`${item.name} (${item.rawMaterial})`}
                      />
                    ))}

                    {/* Selected Location InfoWindow */}
                    {selectedEntity && (
                      <InfoWindow
                        position={{ lat: selectedEntity.lat, lng: selectedEntity.lng }}
                        onCloseClick={() => setSelectedEntity(null)}
                      >
                        <div className="p-2 text-slate-800 max-w-xs space-y-2 text-left font-sans">
                          <div className="flex items-center justify-between gap-2 border-b pb-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                selectedEntity.category === 'pabrik'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : selectedEntity.category === 'mitra_tani'
                                  ? 'bg-amber-100 text-amber-700'
                                  : selectedEntity.category === 'hq_hub'
                                  ? 'bg-blue-100 text-blue-700'
                                  : selectedEntity.category === 'mitra_supplier'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-lime-100 text-lime-700'
                              }`}
                            >
                              {selectedEntity.category.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-700 font-bold">
                              {selectedEntity.status}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                              {selectedEntity.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">{selectedEntity.address}</p>
                          </div>

                          <div className="bg-slate-50 p-2 rounded text-[10px] space-y-1 border border-slate-100">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Bahan Baku:</span>
                              <span className="font-bold text-slate-800">{selectedEntity.rawMaterial}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Kapasitas:</span>
                              <span className="font-bold text-slate-800">{selectedEntity.harvestCapacity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Harga / Kg:</span>
                              <span className="font-mono font-bold text-emerald-700">
                                {selectedEntity.pricePerKg > 0 ? `Rp ${selectedEntity.pricePerKg.toLocaleString('id-ID')}` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Luas Lahan:</span>
                              <span className="font-semibold text-slate-700">{selectedEntity.landArea || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Musim Panen:</span>
                              <span className="font-semibold text-slate-700">{selectedEntity.harvestMonths || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Kontak:</span>
                              <span className="font-mono text-slate-700">{selectedEntity.phone} ({selectedEntity.pic || 'PIC'})</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${selectedEntity.lat},${selectedEntity.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition"
                            >
                              <Navigation className="w-3 h-3" />
                              Buka Google Maps
                            </a>
                            <button
                              type="button"
                              onClick={() => setActiveTab('rekomendasi-panen')}
                              className="px-2 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-[10px] font-bold flex items-center gap-1"
                              title="Analisis Panen Sekitar Sini"
                            >
                              <Sparkles className="w-3 h-3" />
                              Radar AI
                            </button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full bg-slate-900 text-slate-300 flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
                  <h4 className="font-bold text-base text-white">Google Maps API Key Belum Dikonfigurasi</h4>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Pastikan variabel <code className="text-amber-300 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> telah diset.
                  </p>
                </div>
              )}

              {/* Floating Instructions */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md text-[10px] text-slate-600 flex items-center gap-2 max-w-xs pointer-events-none select-none">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Klik peta untuk menangkap koordinat GPS, atau klik marker untuk detail komprehensif.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: INPUT DATA MASTER JARINGAN ======================= */}
      {activeTab === 'input-data' && (
        <FacilityInputForm
          entities={entities}
          onSaveEntity={handleSaveEntity}
          onDeleteEntity={handleDeleteEntity}
          onSelectOnMap={handleSelectOnMap}
          pickedCoord={clickedCoord}
        />
      )}

      {/* ======================= TAB 3: REKOMENDASI PANEN GEMINI AI (150 KM) ======================= */}
      {activeTab === 'rekomendasi-panen' && (
        <HarvestRadarAI
          factories={factoryEntities}
          allEntities={entities}
          onNavigateToForm={prefill => {
            setActiveTab('input-data');
          }}
          onViewOnMap={(lat, lng, zoom = 10) => {
            setMapCenter({ lat, lng });
            setMapZoom(zoom);
            setActiveTab('peta');
          }}
        />
      )}

      {/* ======================= TAB 4: GOOGLE CLOUD, DRIVE & SHEETS HUB ======================= */}
      {activeTab === 'workspace-sync' && (
        <GoogleCloudWorkspaceHub
          facilities={entities}
          batches={state?.batchProduksi || []}
          onRefreshFacilities={() => {
            fetch('/api/facilities')
              .then(r => r.json())
              .then(d => {
                if (d.success && d.facilities) setEntities(d.facilities);
              });
          }}
        />
      )}
    </div>
  );
}
