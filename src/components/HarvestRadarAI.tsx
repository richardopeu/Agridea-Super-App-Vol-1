/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Factory,
  Compass,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
  Truck,
  ExternalLink,
  ChevronRight,
  Download,
  Info,
  Clock,
  Search,
  Filter,
  ArrowRight,
  MessageSquare,
  Send,
  Bot,
  User,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  FacilityNetworkEntity,
  HarvestRadarResult,
  HarvestRecommendationItem
} from '../types';

interface HarvestRadarAIProps {
  factories: FacilityNetworkEntity[];
  allEntities: FacilityNetworkEntity[];
  onNavigateToForm?: (prefillData?: Partial<FacilityNetworkEntity>) => void;
  onViewOnMap?: (lat: number, lng: number, zoom?: number) => void;
}

// Distance calculator (Haversine formula in KM)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function HarvestRadarAI({
  factories,
  allEntities,
  onNavigateToForm,
  onViewOnMap
}: HarvestRadarAIProps) {
  // Active factory selection (default to Batu or first available)
  const defaultFactory =
    factories.find(f => f.name.includes('Batu') || f.name.includes('SSP')) ||
    factories[0] || {
      id: 'fac-ssp',
      name: 'Sipahutar Soda Premium (SSP) - Batu',
      city: 'Kota Batu',
      province: 'Jawa Timur',
      lat: -7.8712,
      lng: 112.5268,
      category: 'pabrik',
      harvestCapacity: '4,500 Kg/hari',
      rawMaterial: 'Apel & Aneka Buah'
    };

  const [selectedFactoryId, setSelectedFactoryId] = useState<string>(defaultFactory.id);
  const selectedFactory = factories.find(f => f.id === selectedFactoryId) || defaultFactory;

  const [radiusKm, setRadiusKm] = useState<number>(150);
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [commodityType, setCommodityType] = useState<'all' | 'fruit' | 'vegetable'>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [radarResult, setRadarResult] = useState<HarvestRadarResult | null>(null);
  const [selectedItem, setSelectedItem] = useState<HarvestRecommendationItem | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'radar' | 'chatbot'>('radar');

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    modelUsed?: string;
  }>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Selamat datang di **Agridea AI Harvest & Sourcing Copilot**! 🌾\n\nSaya siap memberikan analisis taktis seputar pengadaan buah & sayur di sekitar **${defaultFactory.name}** (radius 150 KM).\n\nTanyakan strategi harga petani, rendemen vacuum frying, komparasi margin antar-komoditas, atau draf kontrak kerja sama supplier.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeViewTab === 'chatbot') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeViewTab]);

  // Filter nearby partners from database within the selected radius
  const nearbyPartners = allEntities
    .filter(e => e.id !== selectedFactory.id && e.category !== 'pabrik')
    .map(e => ({
      ...e,
      distanceKm: calculateDistanceKm(selectedFactory.lat, selectedFactory.lng, e.lat, e.lng)
    }))
    .filter(e => e.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Fetch recommendations from Gemini AI
  const runHarvestRadar = async () => {
    setLoading(true);
    setError(null);
    setFallbackNotice(null);
    try {
      const response = await fetch('/api/gemini/harvest-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryName: selectedFactory.name,
          factoryLocation: `${selectedFactory.city}, ${selectedFactory.province || ''}`,
          lat: selectedFactory.lat,
          lng: selectedFactory.lng,
          radiusKm,
          currentDate,
          commodityType,
          existingFarms: nearbyPartners
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat rekomendasi dari Gemini AI');
      }

      setRadarResult(data.data);
      if (data.isRegionalFallback) {
        setFallbackNotice(data.fallbackNotice || 'Data disajikan melalui Intelijen Agronomi Regional Terverifikasi.');
      }
      if (data.data?.harvestItems?.length > 0) {
        setSelectedItem(data.data.harvestItems[0]);
      }
    } catch (err: any) {
      console.error('Radar Fetch Error:', err);
      const raw = String(err?.message || '');
      let clean = raw;
      if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
        clean = 'Model AI sedang mengalami lonjakan beban permintaan sementara (503 Service Unavailable). Silakan klik tombol Coba Ulang untuk memperbarui data.';
      } else {
        try {
          if (raw.includes('{') && raw.includes('}')) {
            const p = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
            clean = p?.error?.message || clean;
          }
        } catch {}
      }
      setError(clean);
    } finally {
      setLoading(false);
    }
  };

  // Send message to Gemini chat copilot
  const handleSendChatMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = {
      id: 'usr-' + Date.now(),
      role: 'user' as const,
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const sourcingContext = {
        activeFactory: {
          name: selectedFactory.name,
          location: `${selectedFactory.city}, ${selectedFactory.province || ''}`,
          lat: selectedFactory.lat,
          lng: selectedFactory.lng
        },
        radiusKm,
        currentDate,
        commodityType,
        radarSummary: radarResult?.summary,
        topHarvestItems: radarResult?.harvestItems?.map(h => ({
          name: h.name,
          category: h.category,
          seasonStatus: h.harvestSeasonStatus,
          originCenter: h.originCenter,
          yieldPercent: h.expectedYieldPercent,
          recommendedPrice: h.recommendedPricePerKg,
          marketPriceRange: h.marketPriceRange,
          brix: h.qualityStandard?.brixLevel,
          waterContent: h.qualityStandard?.waterContent,
          processingNotes: h.processingNotes
        })) || [],
        registeredPartnersNearby: nearbyPartners.slice(0, 8).map(p => ({
          name: p.name,
          category: p.category,
          city: p.city,
          rawMaterial: p.rawMaterial,
          harvestCapacity: p.harvestCapacity,
          pricePerKg: p.pricePerKg
        }))
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatMessages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: textToSend }
          ],
          model: 'gemini-3.1-flash-lite', // Rapid throughput, zero 503 latency
          systemInstruction: `You are Agridea's Senior Agro-Industrial Sourcing Strategist & Food Processing Technology Expert. You specialize in Indonesian tropical fruit & vegetable harvesting, vacuum frying parameters (Brix, yield, oil absorption, moisture), farmer contract negotiations, and COGS optimization. Ground your answers in the active factory context and live harvest radar data. Respond in clear Indonesian with practical formatting.`,
          contextData: sourcingContext
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server status ${res.status}`);
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: data.reply || 'Tidak ada tanggapan dari AI.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const raw = String(err?.message || '');
      let clean = raw;
      if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
        clean = 'Server model AI sedang mengalami antrean trafik tinggi sementara (503). Permintaan dialihkan atau silakan klik Coba Ulang.';
      } else if (raw.includes('429') || raw.includes('quota')) {
        clean = 'Batas kuota model AI terlampaui (429). Silakan coba kembali.';
      } else {
        try {
          if (raw.includes('{') && raw.includes('}')) {
            const p = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
            clean = p?.error?.message || clean;
          }
        } catch {}
      }

      setChatError(clean);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ **Pemberitahuan Sistem:** ${clean}\n\n*Anda dapat mengirim ulang pertanyaan melalui input di bawah.*`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const askAboutCommodity = (item: HarvestRecommendationItem) => {
    setActiveViewTab('chatbot');
    const question = `Berikan analisis mendalam tentang ${item.name} (${item.originCenter}): Bagaimana parameter vacuum frying optimal (suhu, vakum, durasi), strategi seleksi mutu brix ${item.qualityStandard.brixLevel}, dan strategi negosiasi harga Rp ${item.recommendedPricePerKg.toLocaleString('id-ID')}/Kg dengan petani?`;
    handleSendChatMessage(question);
  };

  // Run automatically on first mount if not yet loaded
  useEffect(() => {
    if (!radarResult && !loading) {
      runHarvestRadar();
    }
  }, [selectedFactoryId]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Powered by Google Gemini 3.5 AI & Sourcing Intelligence
            </div>
            <h3 className="text-xl font-black tracking-tight text-white font-display">
              Rekomendasi Panen Buah & Sayur Realtime (Radius {radiusKm} KM)
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Analisis cerdas agronomi dan industri pengolahan keripik: Mendeteksi komoditas buah dan sayur yang sedang panen raya di sekitar pabrik berdasarkan tanggal real-time, lengkap dengan estimasi <strong>Yield Rendemen</strong>, <strong>Standar Kualitas/Brix</strong>, dan <strong>Rekomendasi Harga Sourcing</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runHarvestRadar}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Menganalisis Realtime...' : 'Jalankan Analisis Gemini'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. Pilih Pabrik Acuan */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-emerald-600" />
            Pabrik Pengolahan Acuan
          </label>
          <select
            value={selectedFactoryId}
            onChange={e => setSelectedFactoryId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-250 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500"
          >
            {factories.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.city})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
            GPS: {selectedFactory.lat.toFixed(4)}, {selectedFactory.lng.toFixed(4)}
          </span>
        </div>

        {/* 2. Radius Pencarian */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              Radius Wilayah
            </label>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
              {radiusKm} KM
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="250"
            step="10"
            value={radiusKm}
            onChange={e => setRadiusKm(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>30 km (Lokal)</span>
            <span>150 km (Regional)</span>
            <span>250 km (Provinsi)</span>
          </div>
        </div>

        {/* 3. Tanggal Realtime Panen */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            Tanggal Acuan Panen
          </label>
          <input
            type="date"
            value={currentDate}
            onChange={e => setCurrentDate(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-250 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
              className="text-[10px] text-emerald-700 font-bold hover:underline"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate('2026-10-15')}
              className="text-[10px] text-slate-500 hover:underline"
            >
              Oktober 2026
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate('2026-12-01')}
              className="text-[10px] text-slate-500 hover:underline"
            >
              Desember 2026
            </button>
          </div>
        </div>

        {/* 4. Filter Jenis Komoditas */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            Filter Komoditas
          </label>
          <div className="grid grid-cols-3 gap-1 mt-1">
            <button
              type="button"
              onClick={() => setCommodityType('all')}
              className={`py-2 rounded-lg text-[11px] font-bold transition text-center ${
                commodityType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setCommodityType('fruit')}
              className={`py-2 rounded-lg text-[11px] font-bold transition text-center ${
                commodityType === 'fruit'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Buah
            </button>
            <button
              type="button"
              onClick={() => setCommodityType('vegetable')}
              className={`py-2 rounded-lg text-[11px] font-bold transition text-center ${
                commodityType === 'vegetable'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sayur
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Ditemukan {nearbyPartners.length} mitra database dalam {radiusKm} km
          </span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('radar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeViewTab === 'radar'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Radar Komoditas Panen ({radarResult?.harvestItems?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('chatbot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeViewTab === 'chatbot'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Chatbot Konsultasi Panen & Pengadaan AI</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
              Gemini Flash Lite
            </span>
          </button>
        </div>

        {activeViewTab === 'radar' && (
          <div className="text-[11px] text-slate-400">
            Pusat Acuan: <strong className="text-slate-700">{selectedFactory.name}</strong> ({radiusKm} KM)
          </div>
        )}
      </div>

      {/* Fallback Notice Banner */}
      {fallbackNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Mode Cadangan Intelijen Agronomi Regional Aktif</span>
              <span className="text-[11px] text-amber-700">{fallbackNotice}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={runHarvestRadar}
            disabled={loading}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Coba Ulang Gemini AI</span>
          </button>
        </div>
      )}

      {/* Error Banner with 1-Click Retry */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block text-sm">Status Permintaan AI</span>
              <span className="text-xs text-rose-700 mt-0.5 block">{error}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={runHarvestRadar}
            disabled={loading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Coba Ulang Sekarang</span>
          </button>
        </div>
      )}

      {/* CHATBOT VIEW */}
      {activeViewTab === 'chatbot' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 text-white shadow-xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Bot className="w-4 h-4" />
                </span>
                <h4 className="font-extrabold text-sm text-slate-100">
                  AI Sourcing & Harvest Strategy Copilot
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  gemini-3.1-flash-lite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Konteks Aktif: <strong>{selectedFactory.name}</strong> • Radius {radiusKm} KM • {nearbyPartners.length} Mitra Regional
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setChatMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content: `Sesi baru dimulai. Tanyakan apa saja seputar pengadaan buah & sayur di sekitar **${selectedFactory.name}**!`,
                    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition cursor-pointer border border-slate-700"
            >
              Reset Obrolan
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rekomendasi Pertanyaan Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🍏 Rendemen & Brix Apel Manalagi', q: 'Berapa standar brix dan yield rendemen ideal untuk keripik apel manalagi Batu dengan vacuum frying?' },
                { label: '🥭 Resep Vacuum Frying Mangga', q: 'Bagaimana parameter suhu dan durasi vacuum frying mangga arumanis agar tidak gosong dan renyah sempurna?' },
                { label: '🍌 Margin Pisang Agung Semeru', q: 'Analisis potensi marjin keuntungan dan efisiensi COGS dari komoditas pisang agung Lumajang untuk pabrik ini.' },
                { label: '🤝 Draf Kontrak Petani Nangka', q: 'Buatkan draf klausul jaminan mutu dan sistem pembayaran borongan untuk kontrak kerja sama petani nangka Dampit.' },
                { label: '⚖️ Komparasi Komoditas Terbaik', q: 'Bandingkan 3 komoditas buah panen saat ini dari sisi ketersediaan volume, biaya bahan baku, dan marjin keuntungan.' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChatMessage(item.q)}
                  disabled={chatLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950/80 hover:border-indigo-500/60 border border-slate-700 text-slate-300 hover:text-indigo-200 text-[11px] transition text-left cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="h-[420px] overflow-y-auto space-y-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 scrollbar-thin">
            {chatMessages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 text-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-850 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-[9px] mt-2 font-mono flex items-center justify-between gap-2 ${
                        isUser ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && <span>{msg.modelUsed}</span>}
                    </div>
                  </div>
                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 text-xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Gemini AI sedang menyusun analisis agronomi...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ketik pertanyaan seputar panen, rendemen vacuum frying, negosiasi harga petani..."
              disabled={chatLoading}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* RADAR VIEW */}
      {activeViewTab === 'radar' && (
        <>
          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Gemini AI Sedang Menggali Data Agronomi & Panen Regional...
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Menganalisis kalender musim panen wilayah Jawa Timur & Jawa Barat dalam radius {radiusKm} KM dari {selectedFactory.name}, menghitung rendemen yield, kualitas brix, dan estimasi harga wajar petani.
                </p>
              </div>
            </div>
          )}

          {radarResult && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Executive Summary Card */}
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Ringkasan Intelijen Panen ({radarResult.factoryInfo?.currentDate || currentDate})
                  </span>
                  <p className="text-xs md:text-sm font-medium leading-relaxed mt-1">
                    {radarResult.summary}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-200 text-center shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Peluang Komoditas</span>
                    <span className="text-xl font-black text-emerald-700">
                      {radarResult.harvestItems?.length || 0} Jenis
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveViewTab('chatbot')}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Buka Chatbot AI Panen"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Tanya Chatbot AI</span>
                  </button>
                </div>
              </div>

          {/* Commodity Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <span>Rekomendasi Komoditas Buah & Sayur Sedang Panen</span>
                <span className="text-xs font-normal text-slate-400">
                  (Klik kartu untuk melihat detail resep & parameter kualitas)
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarResult.harvestItems?.map((item, idx) => {
                const isSelected = selectedItem?.name === item.name;
                const isFruit = item.category === 'Buah';
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className={`bg-white p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            isFruit
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          ~{item.approxDistanceKm} KM dari Pabrik
                        </span>
                      </div>

                      {/* Name & Origin */}
                      <h5 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sentra: <strong>{item.originCenter}</strong>
                      </p>

                      {/* Season Status Tag */}
                      <div className="mt-2">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                          {item.harvestSeasonStatus}
                        </span>
                      </div>

                      {/* Yield, Quality, Price Metrics Box */}
                      <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Yield Rendemen
                          </span>
                          <span className="font-mono font-extrabold text-emerald-700 text-xs">
                            {item.expectedYieldPercent}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Rekomendasi Harga
                          </span>
                          <span className="font-mono font-extrabold text-slate-900 text-xs">
                            Rp {item.recommendedPricePerKg?.toLocaleString('id-ID')} /kg
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 flex justify-between text-[10px]">
                          <span className="text-slate-500">Standar Brix:</span>
                          <span className="font-bold text-slate-800">
                            {item.qualityStandard?.brixLevel || '12-14° Brix'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-1.5">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          askAboutCommodity(item);
                        }}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                        title="Tanyakan parameter & analisis komoditas ini ke Chatbot AI"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Tanya AI</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          Detail <ChevronRight className="w-3 h-3" />
                        </span>
                        {onNavigateToForm && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onNavigateToForm({
                                rawMaterial: item.name,
                                pricePerKg: item.recommendedPricePerKg,
                                harvestMonths: item.harvestMonths,
                                address: `Sentra ${item.originCenter}`,
                                category: 'mitra_tani'
                              });
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded font-bold text-[10px] transition cursor-pointer"
                          >
                            + Mitra
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Drawer / Focus Card for Selected Commodity */}
          {selectedItem && (
            <div className="bg-white rounded-2xl border border-emerald-500/50 shadow-md p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Spesifikasi Industri & Pengolahan Bahan Baku
                  </span>
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>{selectedItem.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                      Sentra: {selectedItem.originCenter} (~{selectedItem.approxDistanceKm} KM)
                    </span>
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => askAboutCommodity(selectedItem)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Konsultasi AI</span>
                  </button>
                  {onNavigateToForm && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToForm({
                          name: `Mitra Tani ${selectedItem.name} (${selectedItem.originCenter})`,
                          rawMaterial: selectedItem.name,
                          pricePerKg: selectedItem.recommendedPricePerKg,
                          harvestMonths: selectedItem.harvestMonths,
                          address: `Sentra perkebunan ${selectedItem.originCenter}`,
                          category: 'mitra_tani'
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Buat Mitra dari Komoditas Ini
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Columns: Yield & Economics, Quality Standards, Processing Tech */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Yield & Sourcing Economics */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    Yield & Rekomendasi Harga
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/80 pb-1">
                      <span className="text-slate-500">Estimasi Rendemen:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {selectedItem.expectedYieldPercent}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/80 pb-1">
                      <span className="text-slate-500">Harga Beli Petani:</span>
                      <span className="font-mono font-bold text-slate-900">
                        Rp {selectedItem.recommendedPricePerKg?.toLocaleString('id-ID')} /kg
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/80 pb-1">
                      <span className="text-slate-500">Rentang Harga Pasar:</span>
                      <span className="font-mono text-slate-700">
                        {selectedItem.marketPriceRange || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jendela Musim Panen:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedItem.harvestMonths || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Standar Kualitas & Kematangan */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Standar Kualitas Bahan Baku
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/80 pb-1">
                      <span className="text-slate-500">Tingkat Brix:</span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.qualityStandard?.brixLevel || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/80 pb-1">
                      <span className="text-slate-500">Kadar Air Optimal:</span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.qualityStandard?.waterContent || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/80 pb-1">
                      <span className="text-slate-500">Tingkat Kematangan:</span>
                      <span className="font-bold text-slate-800">
                        {selectedItem.qualityStandard?.ripenessGrade || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Kriteria Sortasi:</span>
                      <p className="text-[11px] text-slate-700 font-medium leading-snug">
                        {selectedItem.qualityStandard?.sortingCriteria || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Panduan Teknis Pengolahan Keripik */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Factory className="w-4 h-4 text-purple-600" />
                    Instruksi Produksi & Vacuum Frying
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedItem.processingNotes}
                  </p>
                  {selectedItem.strategicAdvantage && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                      <strong>Keunggulan Strategis:</strong> {selectedItem.strategicAdvantage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Strategic Advice & Climate/Weather Risk Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strategic Sourcing Advice */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Rekomendasi Strategi Pengadaan & Kontrak Tani
              </h5>
              <ul className="space-y-2 text-xs text-slate-600">
                {radarResult.strategicAdvice?.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Climate & Logistics Risks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Analisis Cuaca, Kadar Air & Risiko Pasokan
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {radarResult.riskAndWeather}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Mitra Tani Terdaftar dalam Radius:</span>
                <span className="font-mono font-bold text-slate-800">
                  {nearbyPartners.length} Entitas Terpantau
                </span>
              </div>
            </div>
          </div>

          {/* Database Partners within 150 km Radius Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  Mitra Database yang Berada dalam Radius {radiusKm} KM dari {selectedFactory.name}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Jarak dihitung otomatis berdasarkan koordinat GPS aktual kedua titik.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3">Nama Mitra</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3">Komoditas Bahan Baku</th>
                    <th className="py-2 px-3">Jarak ke Pabrik</th>
                    <th className="py-2 px-3">Kapasitas</th>
                    <th className="py-2 px-3">Harga Terdaftar</th>
                    <th className="py-2 px-3">Kontak / Telepon</th>
                    <th className="py-2 px-3 text-center">Peta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nearbyPartners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        Belum ada mitra terdaftar dalam radius {radiusKm} KM. Silakan tambahkan mitra baru melalui tab Input Data.
                      </td>
                    </tr>
                  ) : (
                    nearbyPartners.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {p.name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {p.city}, {p.province}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {p.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-emerald-700">
                          {p.rawMaterial}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                          {p.distanceKm} km
                        </td>
                        <td className="py-2 px-3 text-slate-600">{p.harvestCapacity}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          Rp {p.pricePerKg.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-600">
                          {p.phone}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {onViewOnMap && (
                            <button
                              type="button"
                              onClick={() => onViewOnMap(p.lat, p.lng, 11)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Pusatkan di Peta"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )}
</div>
);
}
