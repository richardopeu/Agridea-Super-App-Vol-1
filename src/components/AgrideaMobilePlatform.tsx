/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Users,
  Database,
  Shield,
  ShieldCheck,
  CheckCircle,
  Activity,
  Brain,
  ChevronRight,
  ChevronDown,
  Plus,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Wrench,
  Menu,
  RefreshCw,
  Search,
  FileText,
  MapPin,
  Award,
  Check,
  Send,
  MessageSquare,
  Mic,
  MicOff,
  Camera,
  QrCode,
  Trash2,
  Lock,
  Clock,
  User,
  Bell,
  Fingerprint,
  RotateCw,
  Box,
  CornerDownRight,
  Truck
} from 'lucide-react';

interface AgrideaMobilePlatformProps {
  state: any;
  logActivity: (modul: string, deskripsi: string) => void;
  currentUser: {
    id: string;
    username: string;
    namaLengkap: string;
    role: string;
    lokasiId: string;
  };
  onNavigate?: (menu: string) => void;
}

export default function AgrideaMobilePlatform({ state, logActivity, currentUser, onNavigate }: AgrideaMobilePlatformProps) {
  // Mobile role state (defaults to matching the current user's role, but allowing free toggling in the simulator to test all screens as requested!)
  const [selectedMobileRole, setSelectedMobileRole] = useState<string>(currentUser.role);
  
  // Offline / Online toggle
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Offline queue for syncing
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Simulated GPS track state
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; enabled: boolean }>({
    lat: -7.9839, // Default Malang/Batu coordinates
    lng: 112.6214,
    enabled: true
  });

  // Mobile navigation active tab
  const [mobileTab, setMobileTab] = useState<string>('home');
  const [prevMobileTab, setPrevMobileTab] = useState<string>('home');

  // Push notifications queue in mobile
  const [mobileNotifications, setMobileNotifications] = useState<any[]>([
    {
      id: 1,
      title: '🚨 Hazard Alert: standing-pouch kemasan menipis',
      body: 'Segera lakukan stock transfer dari JKT ke SSP untuk mengamankan kemasan.',
      time: 'Baru saja',
      unread: true,
      category: 'Inventory'
    },
    {
      id: 2,
      title: '✅ Penerimaan Baru Berhasil',
      body: 'Bahan baku Apel Segar 450 Kg dari Mitra Berkah Tani telah diverifikasi.',
      time: '5m yang lalu',
      unread: true,
      category: 'Procurement'
    },
    {
      id: 3,
      title: '📢 AI Alert: Yield PeelingSSP Menurun',
      body: 'Yield kupas rata-rata di bawah standar 60% terdeteksi di SSP. Ambil tindakan corrective.',
      time: '1 jam yang lalu',
      unread: false,
      category: 'Production'
    }
  ]);

  // Active overlay / scan simulation
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Voice Note Recording simulations
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voicePlaybackUrl, setVoicePlaybackUrl] = useState<string | null>(null);

  // App Login screen for the simulator itself
  const [simLoggedIn, setSimLoggedIn] = useState<boolean>(true);
  const [simUsername, setSimUsername] = useState<string>(currentUser.username);
  const [simPassword, setSimPassword] = useState<string>('******');
  const [simSelectedBranch, setSimSelectedBranch] = useState<string>(currentUser.lokasiId || 'SSP');

  // ------------------ TRANSIENT TRANSACTION INPUT STATES ------------------
  // 1. Operator Inputs
  const [opTaskType, setOpTaskType] = useState<'Kupas' | 'Frozen' | 'Vacuum Frying'>('Kupas');
  const [opBahanInput, setOpBahanInput] = useState<string>('Apel Segar');
  const [opBahanWeight, setOpBahanWeight] = useState<number>(100);
  const [opHasilWeight, setOpHasilWeight] = useState<number>(62);
  const [opRejectWeight, setOpRejectWeight] = useState<number>(3);
  const [opHours, setOpHours] = useState<number>(8);
  const [opSelectedMachine, setOpSelectedMachine] = useState<string>('M-01');
  const [opSelectedBatch, setOpSelectedBatch] = useState<string>('BATCH-APL-003');
  const [opPhoto, setOpPhoto] = useState<string | null>(null);
  const [opSuccessMsg, setOpSuccessMsg] = useState<string | null>(null);

  // 2. QC Inputs
  const [qcBatch, setQcBatch] = useState<string>('BATCH-APL-003');
  const [qcFruitVariant, setQcFruitVariant] = useState<string>('Apel Anna');
  const [qcGrade, setQcGrade] = useState<string>('Grade A');
  const [qcPassedQty, setQcPassedQty] = useState<number>(95);
  const [qcRejectedQty, setQcRejectedQty] = useState<number>(5);
  const [qcNotes, setQcNotes] = useState<string>('');
  const [qcTemp, setQcTemp] = useState<number>(82); // HACCP temperature
  const [qcOilQuality, setQcOilQuality] = useState<string>('Jernih, PV < 1.0'); // HACCP oil
  const [qcMoisture, setQcMoisture] = useState<number>(2.4); // HACCP moisture
  const [qcPackIntegrity, setQcPackIntegrity] = useState<boolean>(true); // HACCP Pack
  const [qcSuccessMsg, setQcSuccessMsg] = useState<string | null>(null);

  // 3. Packaging Inputs
  const [packSku, setPackSku] = useState<string>('SKU-APL-REMPAH-70G');
  const [packQty, setPackQty] = useState<number>(450);
  const [packBatch, setPackBatch] = useState<string>('BATCH-APL-003');
  const [packMaterial, setPackMaterial] = useState<string>('Standing Pouch Premium');
  const [packSuccessMsg, setPackSuccessMsg] = useState<string | null>(null);

  // 4. Supplier/Farmer Inputs
  const [supFruit, setSupFruit] = useState<string>('Apel Manalagi');
  const [supQty, setSupQty] = useState<number>(500);
  const [supHarvestDate, setSupHarvestDate] = useState<string>('2026-06-08');
  const [supDeliveryDate, setSupDeliveryDate] = useState<string>('2026-06-09');
  const [supSuccessMsg, setSupSuccessMsg] = useState<string | null>(null);

  // 5. Driver / Courier Inputs
  const [drvSelectedDo, setDrvSelectedDo] = useState<string>('DO-2026-0083');
  const [drvReceiver, setDrvReceiver] = useState<string>('Branch JKT Warehouse');
  const [drvSignature, setDrvSignature] = useState<string>('');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [drvSuccessMsg, setDrvSuccessMsg] = useState<string | null>(null);

  // 6. AI Chat Copilot Mobile States
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Agridea Copilot Mobile. Tanyakan apa saja mengenai data pabrik (OEE, yield rendah, status gudang, supplier terbaik, atau cash flow).'
    }
  ]);

  // Sync back local database updates dynamically when Online
  const triggerAutoSync = () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      offlineQueue.forEach(item => {
        if (item.type === 'PEELING' && state.setPeelingLogs) {
          state.setPeelingLogs((prev: any[]) => [item.data, ...prev]);
        } else if (item.type === 'FRYING' && state.setFryingLogs) {
          state.setFryingLogs((prev: any[]) => [item.data, ...prev]);
        } else if (item.type === 'QC' && state.setQcLogs) {
          state.setQcLogs((prev: any[]) => [item.data, ...prev]);
        } else if (item.type === 'PACKING' && state.setPackingLogs) {
          state.setPackingLogs((prev: any[]) => [item.data, ...prev]);
        }
      });
      setSyncedCount(prev => prev + offlineQueue.length);
      setOfflineQueue([]);
      setIsSyncing(false);
      // Trigger success push notification
      setMobileNotifications(prev => [
        {
          id: Date.now(),
          title: '🔄 Data Synchronized',
          body: `Yay! Seluruh transaksi offline (${offlineQueue.length}) berhasil disinkronisasi ke server pusat.`,
          time: 'Baru saja',
          unread: true,
          category: 'System'
        },
        ...prev
      ]);
    }, 1500);
  };

  // Sync effect on connection restoration
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      triggerAutoSync();
    }
  }, [isOnline]);

  // Submits a queue item
  const pushToQueue = (type: string, data: any) => {
    const queueItem = {
      id: 'Q-' + Date.now(),
      type,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    
    if (!isOnline) {
      setOfflineQueue(prev => [...prev, queueItem]);
      // Play brief notification simulation
      setMobileNotifications(prev => [
        {
          id: Date.now(),
          title: '💾 Disimpan di Device (Offline)',
          body: `Gagal mengirim ke cloud karena offline. Transaksi ${type} antri otomatis.`,
          time: 'Baru saja',
          unread: true,
          category: 'System'
        },
        ...prev
      ]);
    } else {
      // Inline direct write to parent states to fully integrate
      if (type === 'PEELING' && state.setPeelingLogs) {
        state.setPeelingLogs((prev: any[]) => [data, ...prev]);
      } else if (type === 'FRYING' && state.setFryingLogs) {
        state.setFryingLogs((prev: any[]) => [data, ...prev]);
      } else if (type === 'QC' && state.setQcLogs) {
        state.setQcLogs((prev: any[]) => [data, ...prev]);
      } else if (type === 'PACKING' && state.setPackingLogs) {
        state.setPackingLogs((prev: any[]) => [data, ...prev]);
      }
      
      setMobileNotifications(prev => [
        {
          id: Date.now(),
          title: `☁️ Kirim Sukses: ${type}`,
          body: `Transaksi langsung tercatat di data engine Agridea Cloud.`,
          time: 'Baru saja',
          unread: true,
          category: 'System'
        },
        ...prev
      ]);
    }
    logActivity('Mobile App', `Submit form ${type} melalui platform mobile (Online: ${isOnline})`);
  };

  // ------------------ CAMERA & VOICE MOCKS ------------------
  const handleRecordVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoicePlaybackUrl('audio_recording_simulated_compressed.mp3');
    } else {
      setIsRecording(true);
      setVoicePlaybackUrl(null);
    }
  };

  const handleSimulateScan = (code: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(code);
      // Auto-fill form values based on scanned items
      if (code.startsWith('BATCH-')) {
        setOpSelectedBatch(code);
        setQcBatch(code);
        setPackBatch(code);
        setMobileNotifications(prev => [
          {
            id: Date.now(),
            title: `🔍 QR Scan: ${code}`,
            body: `Ditemukan batch aktif pada factory. Otomatis memuat data parameter.`,
            time: 'Baru saja',
            unread: true,
            category: 'System'
          },
          ...prev
        ]);
      } else if (code.startsWith('SKU-')) {
        setPackSku(code);
      } else if (code.startsWith('DO-')) {
        setDrvSelectedDo(code);
      }
    }, 1200);
  };

  // ------------------ COPILOT KNOWLEDGE CHAT ------------------
  const handleCopilotChat = () => {
    if (!chatInput.trim()) return;
    const userQ = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setChatInput('');

    // Answer compilation based on actual live data objects!
    setTimeout(() => {
      let r = '';
      const q = userQ.toLowerCase();
      
      // Calculate dynamic numbers
      const totalKaryawan = state.karyawan ? state.karyawan.length : 15;
      const actBatch = state.batches ? state.batches.length : 8;
      const actStocks = state.stocks ? state.stocks.reduce((acc: number, s: any) => acc + (s.beratKg || s.stok || 0), 0) : 12400;

      if (q.includes('yield') || q.includes('turun') || q.includes('peeling')) {
        r = `Berdasarkan record database, Rerata Yield Peeling di SSP terendah berada di angka 58% pada shift malam 3 Juni disebabkan oleh sortasi buah diameter kecil. Di sisi lain, dewatering borongan menjaga yield standard kotor di fasa penirisan sebesar 61.2%.`;
      } else if (q.includes('supplier') || q.includes('mitra')) {
        r = `Supplier dengan performa dan rating terbaik saat ini adalah 'Tani Raya Unggul' (Score 96.4, Average Yield 64.2%), sedangkan rating terendah dipegang oleh 'Mitra Argopuro' akibat reject rate yang tinggi dan keterlambatan pengiriman DO.`;
      } else if (q.includes('stok') || q.includes('inventory') || q.includes('safety')) {
        r = `Critical Alert: Stok Standing Pouch Kemasan Premium (AGDN) saat ini sisa 340 pcs, di bawah safety stock limit 1,000 pcs. Ada total ${actStocks.toLocaleString()} Kg bulk unpacked chips di gudang transit yang menanti pengemasan.`;
      } else if (q.includes('demand') || q.includes('permintaan') || q.includes('penjualan')) {
        r = `Mengacu pada Demand Forecasting Bulan Juni, kenaikan pesanan retail JKT sebesar 18.5% akan mendorong pemanfaatan mesin vacuum frying hingga kapasitas 92%. Penambahan lpg 50kg cadangan sangat direkomendasikan.`;
      } else if (q.includes('sku') || q.includes('profit') || q.includes('paling untung')) {
        r = `SKU dengan kontribusi keuntungan tertinggi adalah 'Keripik Apel Rempah Premium 70G' (Gross Margin ${(state.cogsBatch && state.cogsBatch.length > 0 ? 38.5 : 41.2).toFixed(1)}%), berkat harga jual tinggi pasaran ekspor Jakarta & Surabaya.`;
      } else if (q.includes('risk') || q.includes('risiko') || q.includes('bahaya')) {
        r = `Risiko terbesar hari ini: Risiko Bahan Baku menipis di Jakarta Factory, serta OEE Mesin Frying M-02 Sipahutar yang bergetar abnormal di atas 85 Hz. Jadwal preventif maintenance disarankan dipercepat sore ini.`;
      } else {
        r = `Saya mendeteksi ${totalKaryawan} personel terdaftar aktif di factory system, mengelola ${actBatch} aktif batch produksi minggu ini. Silakan tanyakan korelasi spesifik OEE mesin, yield, atau cash flow.`;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: r }]);
    }, 1000);
  };

  // Helper arrays for form drops
  const activeBatches = state.batches || [
    { id: 'BATCH-APL-003', variantNama: 'Apel Anna' },
    { id: 'BATCH-APL-004', variantNama: 'Apel Manalagi' },
    { id: 'BATCH-NGK-001', variantNama: 'Nangka Bilux' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-slate-100 max-w-6xl mx-auto shadow-2xl font-sans" id="mobile-platform-container">
      {/* Title Header of Mobile Simulator Workspace */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 text-[10px] rounded-full uppercase tracking-wider">
            Build Phase 4 Core Applet
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1 gap-2 flex items-center">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            Agridea Mobile Hub
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Simulasi PWA / Mobile Browser terpadu untuk semua peran operasional pabrik.
          </p>
        </div>

        {/* Outer Simulation Parameter Controls */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-center w-full md:w-auto text-xs">
          <div>
            <label className="text-slate-500 block mb-1 text-[10px] font-bold uppercase">Uji Peran Mobile (Role Test)</label>
            <select
              value={selectedMobileRole}
              onChange={(e) => {
                setSelectedMobileRole(e.target.value);
                setMobileTab('home');
              }}
              className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold rounded p-1.5 focus:outline-none"
            >
              <option value="Super Admin">📊 Super Admin App</option>
              <option value="Director">👑 Director App</option>
              <option value="Direktur HQ">👑 Direktur HQ App</option>
              <option value="Factory Manager">🏭 Factory Manager (SSP)</option>
              <option value="Branch Manager">🏭 Branch Manager (MLG)</option>
              <option value="Operator Kupas">🧑‍🍳 Operator Kupas</option>
              <option value="Operator Vacuum Frying">🔥 Operator Vacuum Frying</option>
              <option value="QC Inspector">🔍 QC Inspector</option>
              <option value="Packaging Team">📦 Packaging Team</option>
              <option value="Supplier">🚜 Supplier / Farmer Partner</option>
              <option value="Driver">🚚 Driver / Logistics Team</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1 text-[10px] font-bold uppercase">Network State</label>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded font-bold transition-all text-[11px] ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online Sync Active' : 'Offline Mode Simulation'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
        {/* Left column info desk */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-3 border-b border-slate-800 pb-2">📦 PWA Mobile Integration Details</h3>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5 text-[10px]">✓</div>
                <div>
                  <strong className="text-slate-200">Online/Offline DB Sync</strong>
                  <p className="text-[11px] text-slate-500">Antrian data offline (<span className="text-orange-400 font-bold">{offlineQueue.length} items</span>) akan disinkronasikan langsung saat status internet &apos;Online&apos;.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5 text-[10px]">✓</div>
                <div>
                  <strong className="text-slate-200">Unified Role Engine</strong>
                  <p className="text-[11px] text-slate-500">Berjalan di single container login dengan fungsionalitas disesuaikan otomatis per user-matrix.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5 text-[10px]">✓</div>
                <div>
                  <strong className="text-slate-200">QR / Barcode Auto Decode</strong>
                  <p className="text-[11px] text-slate-500">Mendukung tracking batch, item status, &amp; recall menggunakan scan kamera digital simulatif.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Sync Stats monitor */}
          <div className="bg-emerald-950/20 border border-emerald-900/30 p-5 rounded-2xl">
            <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-2.5">
              <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Live Sync Monitor
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-slate-500 block text-[10px] uppercase">Gagal/Pending Sync</span>
                <span className="font-mono text-base font-bold text-orange-400">{offlineQueue.length}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-slate-500 block text-[10px] uppercase">Jumlah Sukses Sync</span>
                <span className="font-mono text-base font-bold text-emerald-400">{syncedCount}</span>
              </div>
            </div>
            {isSyncing && (
              <p className="text-[10px] text-slate-400 mt-2 italic text-center animate-pulse">
                Melakukan resolution data conflict &amp; uploading logs...
              </p>
            )}
          </div>

          {/* Active branch tracker info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 my-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <strong className="text-slate-200">Simulate Driver Routes &amp; GPS</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              Sistem mencatat koordinat pengiriman logistik driver secara berkala ({gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}).
            </p>
          </div>
        </div>

        {/* Right column: The Immersive Phone Frame Mock */}
        <div className="lg:col-span-8 flex justify-center py-4 bg-slate-950/40 rounded-3xl border border-slate-800/60 p-4">
          <div className="w-[365px] h-[755px] bg-slate-950 border-[10px] border-slate-800 rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col ring-4 ring-emerald-500/10">
            {/* Phone Top Speaker/Sensor Bezel (Notch) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-950 rounded-full mb-1" />
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3 mb-1" />
            </div>

            {/* Simulated Phone Bar Status Indicators */}
            <div className="h-7 bg-slate-900 px-6 pt-1 flex justify-between items-center text-[10px] font-bold text-slate-450 shrink-0 z-45 border-b border-slate-800/50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>10:37</span>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                )}
                <span className="text-[9px]">4G LTE</span>
                <Battery className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            {/* INTERACTIVE MOBILE SCREEN SPACE */}
            <div className="flex-1 overflow-y-auto bg-slate-900 flex flex-col relative" id="mobile-sim-screen">
              {!simLoggedIn ? (
                /* Simulated Mobile App Login view */
                <div className="p-6 flex-1 flex flex-col justify-center animate-fade-in" id="mobile-login-panel">
                  <div className="text-center mb-6 mt-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-2">
                      A
                    </div>
                    <h3 className="text-base font-bold font-display text-white">Agridea Mobile</h3>
                    <p className="text-[10px] text-slate-500">PWA &middot; Manufacturing Control</p>
                  </div>

                  <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Username</label>
                      <input
                        type="text"
                        value={simUsername}
                        onChange={(e) => setSimUsername(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-white rounded p-2 w-full text-xs focus:outline-none focus:border-emerald-500"
                        placeholder="Operator name"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Password</label>
                      <input
                        type="password"
                        value={simPassword}
                        onChange={(e) => setSimPassword(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-white rounded p-2 w-full text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Factory / Branch</label>
                      <select
                        value={simSelectedBranch}
                        onChange={(e) => setSimSelectedBranch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-emerald-400 font-medium rounded p-2 w-full text-xs focus:outline-none"
                      >
                        <option value="SSP">Sipahutar Factory (SSP)</option>
                        <option value="AGDN">Agridea Malang (AGDN)</option>
                        <option value="JKT">Jakarta HQ Terminal</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remMe" defaultChecked className="rounded accent-emerald-500" />
                      <label htmlFor="remMe" className="text-slate-400 text-[10px]">Remember Me on browser</label>
                    </div>

                    <button
                      onClick={() => {
                        setSimLoggedIn(true);
                        logActivity('Mobile App', `User ${simUsername} login via mobile simulator.`);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs py-2 rounded w-full cursor-pointer shadow mt-2"
                    >
                      Sign In Securely
                    </button>
                    <button
                      onClick={() => {
                        alert('Biometric scanner berhasil didaftarkan: Menghubungkan Sidik Jari/FaceID.');
                      }}
                      className="border border-slate-800 hover:bg-slate-900 text-slate-300 py-1.5 rounded w-full flex items-center justify-center gap-1.5 text-[10px]"
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                      Sign with Biometrics
                    </button>
                  </div>
                </div>
              ) : (
                /* Main Mobile Application Panel */
                <div className="flex-1 flex flex-col p-4">
                  {/* Internal Mobile Top Navbar */}
                  <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl mb-4 border border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs ring-1 ring-emerald-500/20">
                        {selectedMobileRole.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-[11px] leading-tight truncate max-w-[120px]">
                          {simUsername}
                        </h4>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">
                          {selectedMobileRole}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMobileTab('notifications');
                        }}
                        className="relative p-1 text-slate-400 hover:text-white"
                      >
                        <Bell className="w-4 h-4" />
                        {mobileNotifications.filter(n => n.unread).length > 0 && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        )}
                      </button>
                      <button
                        onClick={() => setSimLoggedIn(false)}
                        className="p-1 text-slate-400 hover:text-white text-[10px] font-bold border border-slate-800 rounded bg-slate-900"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

                  {/* IN-APP ALERT BANNER SIMULATION */}
                  {mobileNotifications.some(n => n.unread) && (
                    <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border-l-[3px] border-emerald-500 p-2.5 rounded-r-lg mb-3 flex justify-between items-center text-[10px] animate-fade-in shadow">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-200 line-clamp-1">
                          {mobileNotifications.find(n => n.unread)?.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setMobileNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        }}
                        className="text-slate-500 hover:text-slate-300 font-bold ml-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* ------------------ BOTTOM QR / SCAN SIMULATOR STAGE ------------------ */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col justify-center items-center text-xs p-6">
                      <QrCode className="w-12 h-12 text-emerald-400 animate-pulse mb-4" />
                      <h4 className="font-bold text-white mb-2 text-center uppercase tracking-wider">Mencari Kode QR / Barcode</h4>
                      <div className="w-48 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce mb-6" />
                      
                      <p className="text-slate-400 text-[10px] text-center mb-4">Pilih barcode simulasi di bawah untuk melanjutkan scan:</p>
                      <div className="flex flex-col gap-2 w-full max-w-xs">
                        <button onClick={() => handleSimulateScan('BATCH-APL-003')} className="bg-slate-900 hover:bg-slate-800 p-2 text-[10.5px] rounded border border-slate-800 text-left">
                          🎯 scan Batch ID Apel: BATCH-APL-003
                        </button>
                        <button onClick={() => handleSimulateScan('SKU-APL-REMPAH-70G')} className="bg-slate-900 hover:bg-slate-800 p-2 text-[10.5px] rounded border border-slate-800 text-left">
                          📦 scan SKU packing: SKU-APL-REMPAH-70G
                        </button>
                        <button onClick={() => handleSimulateScan('DO-2026-0083')} className="bg-slate-900 hover:bg-slate-800 p-2 text-[10.5px] rounded border border-slate-800 text-left">
                          🚚 scan DO Delivery: DO-2026-0083
                        </button>
                      </div>

                      <button onClick={() => setIsScanning(false)} className="text-rose-400 hover:text-rose-300 font-bold text-[11px] underline mt-6">
                        Batal
                      </button>
                    </div>
                  )}

                  {/* ------------------ ACTIVE INTERNAL SUBVIEWS ------------------ */}
                  {mobileTab === 'notifications' && (
                    <div className="flex-1 flex flex-col animate-fade-in text-xs">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px] text-emerald-400">
                          <Bell className="w-3.5 h-3.5" /> Notifications Center
                        </h4>
                        <button onClick={() => setMobileTab('home')} className="text-slate-400 text-[10px] hover:text-white">Kembali</button>
                      </div>
                      <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px]">
                        {mobileNotifications.map(item => (
                          <div key={item.id} className={`p-2.5 rounded-lg border text-[11px] ${item.unread ? 'bg-slate-950 border-emerald-500/40 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                            <div className="flex justify-between items-center mb-1 text-[9px]">
                              <span className="bg-slate-800 text-slate-350 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">{item.category}</span>
                              <span>{item.time}</span>
                            </div>
                            <h5 className="font-bold text-slate-200">{item.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mobileTab === 'chat' && (
                    <div className="flex-1 flex flex-col justify-between animate-fade-in text-xs h-[480px]">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1 uppercase text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5" /> Copilot Chat Mobile
                        </h4>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">Generative Live</span>
                      </div>
                      
                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 p-1 max-h-[350px]">
                        {chatHistory.map((item, index) => (
                          <div key={index} className={`max-w-[85%] p-2 rounded-xl text-[10.5px] ${item.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-medium ml-auto rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-300 mr-auto rounded-tl-none'}`}>
                            {item.text}
                          </div>
                        ))}
                      </div>

                      {/* Quick questions helper */}
                      <div className="py-2 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
                        <button onClick={() => setChatInput('Mengapa yield peeling turun?')} className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 border border-slate-800 rounded px-2 py-1 shrink-0">
                          Why did yield decrease?
                        </button>
                        <button onClick={() => setChatInput('Siapa supplier performa terbaik?')} className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 border border-slate-800 rounded px-2 py-1 shrink-0">
                          Best supplier?
                        </button>
                        <button onClick={() => setChatInput('Stok apa di bawah safety stock?')} className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 border border-slate-800 rounded px-2 py-1 shrink-0">
                          Below safety stock?
                        </button>
                        <button onClick={() => setChatInput('Apa risiko terbesar hari ini?')} className="bg-slate-950 hover:bg-slate-800 text-[9px] text-slate-400 border border-slate-800 rounded px-2 py-1 shrink-0">
                          Today&apos;s biggest risk?
                        </button>
                      </div>

                      {/* Input container */}
                      <div className="flex gap-1.5 pt-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCopilotChat(); }}
                          placeholder="Tanyakan status pabrik..."
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-[10.5px] w-full text-white focus:outline-none"
                        />
                        <button onClick={handleCopilotChat} className="bg-emerald-500 text-slate-950 p-2 rounded shrink-0 font-bold">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {mobileTab === 'home' && (
                    <div className="flex-1 flex flex-col animate-fade-in text-[11px]">
                      {/* SWITCH ROLES VIEW RENDER ACCORDING TO USER MATRIX */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'Operator Kupas' || selectedMobileRole === 'Operator Vacuum Frying') && (
                        /* ROLE 1 - OPERATOR APP screen */
                        <div className="space-y-4">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[9px] uppercase font-bold text-slate-500">Active Task</span>
                            <h4 className="font-bold text-white text-xs">Pencatatan Hasil Kupas &amp; Frying</h4>
                            <div className="flex gap-2 mt-2">
                              {['Kupas', 'Frozen', 'Vacuum Frying'].map((t: any) => (
                                <button
                                  key={t}
                                  onClick={() => setOpTaskType(t)}
                                  className={`flex-1 py-1 text-[9px] font-bold rounded ${opTaskType === t ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Operator form content based on active task selected */}
                          <div className="bg-slate-950/40 border border-slate-800/85 p-3.5 rounded-xl space-y-3">
                            <h5 className="font-bold text-amber-400 uppercase text-[9px] tracking-wider mb-2">Input Form Operasional</h5>
                            
                            {opSuccessMsg && (
                              <div className="bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-[10px] p-2 rounded mb-2">
                                {opSuccessMsg}
                              </div>
                            )}

                            <div>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                                <span>Pilih Varian {opTaskType === 'Kupas' ? 'Buah Segar' : 'Bulk Chips'}</span>
                                <button onClick={() => setIsScanning(true)} className="text-emerald-400 font-bold flex items-center gap-0.5 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                  <QrCode className="w-3 h-3" /> Scan Box
                                </button>
                              </div>
                              <select
                                value={opBahanInput}
                                onChange={(e) => setOpBahanInput(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 p-1.5 rounded w-full"
                              >
                                <option value="Apel Segar">Apel Segar (Raw Material)</option>
                                <option value="Nangka Segar">Nangka Segar (Raw Material)</option>
                                <option value="Nanas Segar">Nanas Segar (Raw Material)</option>
                                <option value="Salak Segar">Salak Segar (Raw Material)</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-450 text-[10px] uppercase font-bold block mb-1">Berat Masuk (Kg)</label>
                                <input
                                  type="number"
                                  value={opBahanWeight}
                                  onChange={(e) => setOpBahanWeight(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                              <div>
                                <label className="text-slate-450 text-[10px] uppercase font-bold block mb-1">Hasil Bersih (Kg)</label>
                                <input
                                  type="number"
                                  value={opHasilWeight}
                                  onChange={(e) => setOpHasilWeight(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-455 text-[10px] uppercase font-bold block mb-1">Reject Sortasi (Kg)</label>
                                <input
                                  type="number"
                                  value={opRejectWeight}
                                  onChange={(e) => setOpRejectWeight(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                              <div>
                                <label className="text-slate-455 text-[10px] uppercase font-bold block mb-1">Mesin Vacuum / Batch</label>
                                <input
                                  type="text"
                                  value={opSelectedBatch}
                                  readOnly
                                  className="bg-slate-950 border border-slate-850 p-1 rounded text-slate-400 text-xs w-full cursor-not-allowed"
                                />
                              </div>
                            </div>

                            {/* Voice note simulation inside input form */}
                            <div className="border border-slate-850 p-2 rounded-xl flex items-center justify-between bg-slate-950">
                              <div>
                                <span className="text-[9px] block text-slate-500 uppercase">Voice Memo &bull; Foto</span>
                                <p className="text-[10px] text-slate-350">{voicePlaybackUrl ? '✔️ voice_memo.mp3 ready' : 'Belum Ada Audio'}</p>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={handleRecordVoice}
                                  className={`p-1.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-900 border border-slate-800'} text-white`}
                                >
                                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => setOpPhoto('sim_peel_foto.jpg')} className={`p-1.5 rounded-full ${opPhoto ? 'bg-emerald-500' : 'bg-slate-900 border border-slate-800'} text-white`}>
                                  <Camera className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                // Assemble record payload
                                const recordPayload = {
                                  karyawanId: 'K-002',
                                  karyawanIds: ['K-002'],
                                  bahanMasukKg: opBahanWeight,
                                  hasilKupasKg: opHasilWeight,
                                  rejectKg: opRejectWeight,
                                  jamKerja: opHours,
                                  jenisBahan: opBahanInput,
                                  tanggal: '2026-06-06'
                                };
                                pushToQueue(opTaskType === 'Kupas' ? 'PEELING' : opTaskType === 'Frozen' ? 'FREEZING' : 'FRYING', recordPayload);
                                setOpSuccessMsg('✓ Data berhasil ditambahkan ke antrian pengiriman!');
                                setTimeout(() => setOpSuccessMsg(null), 3000);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs py-2 rounded-lg w-full cursor-pointer text-center"
                            >
                              Simpan Transaksi ({isOnline ? 'Cloud Sync' : 'Offline Queue'})
                            </button>
                          </div>

                          {/* Operator Dashboard widget metrics requested */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px]">
                            <h5 className="font-bold text-white uppercase text-[9px] tracking-wide mb-2">Today&apos;s Target &amp; Productivity</h5>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Today&apos;s Target (Vacuum Frying)</span>
                                  <span className="font-bold">250 Kg / 300 Kg</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                                  <div className="bg-emerald-500 h-full w-[83%]" />
                                </div>
                              </div>
                              <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded text-slate-400">
                                <span>Attendance: <strong className="text-emerald-400">Shift Pagi (Hadir)</strong></span>
                                <span>Ranking: <strong className="text-amber-400">#2 di Pabrik</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ROLE 2 - QC APP SCREEN */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'QC Inspector') && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-emerald-400 flex items-center justify-between uppercase leading-none mb-1 text-[11px]">
                            <span>QC INSPECTION &amp; CCP</span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded text-[8px] border border-slate-800">ISO 22000</span>
                          </h4>

                          {qcSuccessMsg && (
                            <div className="bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-[10px] p-2 rounded">
                              {qcSuccessMsg}
                            </div>
                          )}

                          <div className="bg-slate-950/40 border border-[#1e293b] p-3 rounded-xl space-y-2.5">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Inspection Audit</span>
                            <div>
                              <label className="text-slate-500 text-[9px] block">Kode Batch Produksi</label>
                              <select
                                value={qcBatch}
                                onChange={(e) => setQcBatch(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-amber-400 font-bold p-1 rounded text-xs w-full"
                              >
                                {activeBatches.map((b: any) => (
                                  <option key={b.id} value={b.id}>{b.id} ({b.variantNama})</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-500 text-[9px] block">Passed Qty (Kg)</label>
                                <input
                                  type="number"
                                  value={qcPassedQty}
                                  onChange={(e) => setQcPassedQty(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                              <div>
                                <label className="text-slate-500 text-[9px] block">Rejected Qty (Kg)</label>
                                <input
                                  type="number"
                                  value={qcRejectedQty}
                                  onChange={(e) => setQcRejectedQty(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                            </div>

                            <div className="border-t border-slate-800/90 pt-2 space-y-2">
                              <span className="bg-red-500/10 text-red-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block">
                                Critical Control Point (CCP) Monitor
                              </span>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <label className="text-slate-500 text-[9px] block">Frying Temp (&deg;C)</label>
                                  <input
                                    type="number"
                                    value={qcTemp}
                                    onChange={(e) => setQcTemp(Number(e.target.value))}
                                    className="bg-slate-950 border border-slate-800 p-0.5 rounded text-white text-xs w-full"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-500 text-[9px] block">KA Moisture (%)</label>
                                  <input
                                    type="number"
                                    value={qcMoisture}
                                    onChange={(e) => setQcMoisture(Number(e.target.value))}
                                    className="bg-slate-950 border border-slate-800 p-0.5 rounded text-white text-xs w-full animate-pulse"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <label className="text-slate-500 text-[9px] block">Oil Standard</label>
                                  <input
                                    type="text"
                                    value={qcOilQuality}
                                    onChange={(e) => setQcOilQuality(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 p-0.5 rounded text-slate-300 text-xs w-full"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-500 text-[9px] block">Kemasan Seal</label>
                                  <button
                                    onClick={() => setQcPackIntegrity(!qcPackIntegrity)}
                                    className={`py-0.5 font-bold rounded text-xs w-full text-center ${qcPackIntegrity ? 'bg-emerald-500/15 text-emerald-450' : 'bg-rose-500/15 text-rose-450'}`}
                                  >
                                    {qcPackIntegrity ? 'Pass ✔️' : 'Abnormal ⚠️'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                pushToQueue('QC', {
                                  batchId: qcBatch,
                                  picName: simUsername,
                                  passedKg: qcPassedQty,
                                  rejectedKg: qcRejectedQty,
                                  temp: qcTemp,
                                  moisture: qcMoisture,
                                  status: qcRejectedQty === 0 ? 'Passed' : 'Passed with Findings'
                                });
                                setQcSuccessMsg('✓ Log QC & HACCP berhasil tercatat');
                                setTimeout(() => setQcSuccessMsg(null), 3000);
                              }}
                              className="bg-emerald-500 text-slate-950 font-bold text-xs py-2 rounded w-full cursor-pointer text-center block mt-1"
                            >
                              Kirim Inspeksi Ke Lab
                            </button>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-slate-500 text-[9px] font-bold block mb-1">QC SUMMARY MONITOR</span>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                              <div className="bg-slate-905 p-1.5 rounded">
                                <span className="block text-slate-450">Pass Rate</span>
                                <span className="font-bold text-emerald-400">97.8%</span>
                              </div>
                              <div className="bg-slate-905 p-1.5 rounded">
                                <span className="block text-slate-450">Reject</span>
                                <span className="font-bold text-rose-400">2.2%</span>
                              </div>
                              <div className="bg-slate-905 p-1.5 rounded">
                                <span className="block text-slate-450">Compliance</span>
                                <span className="font-bold text-emerald-400">100%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ROLE 3 - PACKAGING TEAM APP */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'Packaging Team') && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-amber-400 flex items-center justify-between uppercase mb-1 text-[11px]">
                            <span>Packaging &amp; Box Seal</span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded text-[8px] text-slate-400">SSP Pack Depot</span>
                          </h4>

                          {packSuccessMsg && (
                            <div className="bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-[10px] p-2 rounded">
                              {packSuccessMsg}
                            </div>
                          )}

                          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                            <div>
                              <div className="flex justify-between items-center mb-1 text-[9px] text-slate-450">
                                <label className="text-slate-500 block">Pilih SKU Produk Target</label>
                                <button onClick={() => setIsScanning(true)} className="text-emerald-400 font-bold flex items-center gap-0.5">
                                  <QrCode className="w-3 h-3" /> Scan SKU
                                </button>
                              </div>
                              <select
                                value={packSku}
                                onChange={(e) => setPackSku(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 p-1 rounded text-xs w-full"
                              >
                                <option value="SKU-APL-REMPAH-70G">Apel Rempah Premium 70G</option>
                                <option value="SKU-APL-CHIPS-100G">Apel Standar Crispy 100G</option>
                                <option value="SKU-NGK-SWEET-80G">Nangka Madu Crispy 80G</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-505 text-[9px] block">Total Pack Selesai (Pcs)</label>
                                <input
                                  type="number"
                                  value={packQty}
                                  onChange={(e) => setPackQty(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                              <div>
                                <label className="text-slate-505 text-[9px] block">Bahan Kemasan Sachet</label>
                                <select
                                  value={packMaterial}
                                  onChange={(e) => setPackMaterial(e.target.value)}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-slate-300 text-xs w-full"
                                >
                                  <option value="Standing Pouch Premium">Pouch Premium Alufoil</option>
                                  <option value="Plastic Bulk Bag">Plastic Bag Transparan</option>
                                </select>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                pushToQueue('PACKING', {
                                  id: 'PKG-' + Date.now(),
                                  skuId: packSku,
                                  outputPcs: packQty,
                                  picId: 'K-009',
                                  tanggal: '2026-06-06'
                                });
                                setPackSuccessMsg('✓ Log Pengemasan didaftarkan ke Database!');
                                setTimeout(() => setPackSuccessMsg(null), 3000);
                              }}
                              className="bg-emerald-500 text-slate-950 font-bold text-xs py-2 rounded w-full cursor-pointer text-center block"
                            >
                              Kirim Log Kemas
                            </button>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] space-y-1.5">
                            <h5 className="font-bold text-white mb-1 uppercase">Sachet Material Stocks &bull; SSP</h5>
                            <div className="flex justify-between border-b border-sidebar-800 pb-1 text-slate-400">
                              <span>Standing Pouch Premium</span>
                              <span className="font-bold text-emerald-400">340 Pcs</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Box Karton C-40</span>
                              <span className="font-bold text-emerald-400">75 Units</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ROLE 4 - FACTORY / BRANCH MANAGER APP */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'Factory Manager' || selectedMobileRole === 'Branch Manager') && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-emerald-400 flex items-center justify-between uppercase mb-1 text-[11px]">
                            <span>Factory Control Panel</span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold">SSP-MLG</span>
                          </h4>

                          {/* Quick Mobile Approvals queue list requested */}
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2.5">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Mobile Approval Center</span>
                              <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded text-[8.5px]">3 Pending</span>
                            </div>

                            <div className="space-y-2 text-[10px]">
                              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex justify-between items-start">
                                <div>
                                  <strong className="text-white text-[11px]">Production Batch #003</strong>
                                  <p className="text-slate-400 text-[9px] mt-0.5">Yield Peeling: 62% &bull; Frying: 24 Kg</p>
                                </div>
                                <button
                                  onClick={() => alert('Batch #003 Approved sukses')}
                                  className="bg-emerald-500 text-slate-950 font-black px-2 py-1 rounded text-[9px] cursor-pointer"
                                >
                                  ACC
                                </button>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex justify-between items-start">
                                <div>
                                  <strong className="text-white text-[11px]">Antrian Petty Cash Kas SSP</strong>
                                  <p className="text-slate-400 text-[9px] mt-0.5">Rp 1.450.000 (Membeli Solar Frying)</p>
                                </div>
                                <button
                                  onClick={() => alert('Solar approved')}
                                  className="bg-emerald-500 text-slate-950 font-black px-2 py-1 rounded text-[9px] cursor-pointer"
                                >
                                  ACC
                                </button>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex justify-between items-start">
                                <div>
                                  <strong className="text-white text-[11px]">Request Stock Transfer JKT</strong>
                                  <p className="text-slate-400 text-[9px] mt-0.5">1,500 Pcs Plastic standing-pouch kemasan</p>
                                </div>
                                <button
                                  onClick={() => alert('Stock Transfer ACC')}
                                  className="bg-emerald-500 text-slate-950 font-black px-2 py-1 rounded text-[9px] cursor-pointer"
                                >
                                  ACC
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* AI Advisor inside mobile manager app */}
                          <div className="bg-indigo-950/40 border border-indigo-900/30 p-3.5 rounded-xl text-[10.5px]">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-2 uppercase text-[9.5px]">
                              <Brain className="w-4 h-4 text-indigo-400" />
                              AI Factory Advisor Engine
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-indigo-950/80 text-[10px] space-y-2">
                              <div>
                                <strong className="text-amber-400 block">⚠️ Food Safety &amp; Machine Alert</strong>
                                <p className="text-slate-400 text-[9.5px] mt-0.5 mt-0.5">
                                  Vacuum Frying M-01 mengalami getaran keras di atas batas wajar. Rencana preventive maintenance dijadwalkan u/ sore ini untuk mencegah kegagalan batch.
                                </p>
                              </div>
                              <div>
                                <strong className="text-emerald-400 block">💡 Yield Optimization Opportunity</strong>
                                <p className="text-slate-400 text-[9.5px] mt-0.5">
                                  Borongan peeling dewatering menghemat waktu transit sachet sebesar 14.5 menit per batch. Rekomendasikan bonus intensif regu.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ROLE 5 - SUPPLIER MOBILE APP */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'Supplier') && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-emerald-400 flex items-center justify-between uppercase mb-1 text-[11px]">
                            <span>Mitra Tani &amp; Farmer Depot</span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded text-[8px] text-emerald-400">Koperasi Tani</span>
                          </h4>

                          {supSuccessMsg && (
                            <div className="bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-[10px] p-2 rounded">
                              {supSuccessMsg}
                            </div>
                          )}

                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Kirim Rencana Panen Segar</span>
                            <div>
                              <label className="text-slate-500 text-[9px] block">Varian Buah</label>
                              <select
                                value={supFruit}
                                onChange={(e) => setSupFruit(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 p-1 rounded text-xs w-full"
                              >
                                <option value="Apel Manalagi Segar">Apel Manalagi Gunung</option>
                                <option value="Apel Anna Segar">Apel Anna Batu</option>
                                <option value="Nangka Bilux Segar">Nangka Bilux Matang</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-slate-505 text-[9px] block">Estimasi Tonase (Kg)</label>
                                <input
                                  type="number"
                                  value={supQty}
                                  onChange={(e) => setSupQty(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-white text-xs w-full"
                                />
                              </div>
                              <div>
                                <label className="text-slate-505 text-[9px] block">Tanggal Panen</label>
                                <input
                                  type="date"
                                  value={supHarvestDate}
                                  onChange={(e) => setSupHarvestDate(e.target.value)}
                                  className="bg-slate-950 border border-slate-800 p-1 rounded text-slate-300 text-xs w-full font-mono"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSupSuccessMsg('✓ Rencana panen & delivery dikirim ke logistik!');
                                setTimeout(() => setSupSuccessMsg(null), 3000);
                              }}
                              className="bg-emerald-500 text-slate-950 font-bold text-xs py-1.5 rounded w-full cursor-pointer text-center block mt-1"
                            >
                              Registrasikan Delivery Panenan
                            </button>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] space-y-1">
                            <h5 className="font-bold text-white uppercase text-[9px] mb-1">Informasi Harga Hari Ini</h5>
                            <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                              <span>Apel Batu Grade A</span>
                              <span className="font-bold text-emerald-400">Rp 12.500 / Kg</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Nangka Bilux Super</span>
                              <span className="font-bold text-emerald-400">Rp 14.000 / Kg</span>
                            </div>
                            <div className="pt-1.5 flex justify-between text-[9px] text-slate-500">
                              <span>Performa Panen: <strong className="text-emerald-400">94.8% (A)</strong></span>
                              <span>Peringkat Tani: <strong className="text-amber-400">#1 (Premium)</strong></span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ROLE 6 - DRIVER / COURIER APP */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'Driver') && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-emerald-400 flex items-center justify-between uppercase mb-1 text-[11px]">
                            <span>Driver Surat Jalan &amp; POD</span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded text-[8px] text-slate-400">ID: DRV-0091</span>
                          </h4>

                          {drvSuccessMsg && (
                            <div className="bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 text-[10px] p-2 rounded animate-bounce">
                              {drvSuccessMsg}
                            </div>
                          )}

                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2 text-[10.5px]">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Input Bukti Penerimaan (Proof of Delivery / POD)</span>
                            
                            <div>
                              <div className="flex justify-between text-[9px] text-slate-550 mb-1">
                                <label>Pilih Kode DO Surat Jalan</label>
                                <button onClick={() => setIsScanning(true)} className="text-emerald-400 font-bold flex items-center gap-0.5 bg-slate-900 px-1 py-0.5 rounded">
                                  <QrCode className="w-3 h-3" /> Scan DO
                                </button>
                              </div>
                              <select
                                value={drvSelectedDo}
                                onChange={(e) => setDrvSelectedDo(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 p-1.5 rounded text-xs w-full font-mono"
                              >
                                <option value="DO-2026-0083">DO-2026-0083 (Apple Chips 45D Pcs)</option>
                                <option value="DO-2026-0084">DO-2026-0084 (Nangka Chips 250 Pcs)</option>
                                <option value="TFR-SSP-AGDN-01">TFR-SSP-AGDN-01 (Bulk Chips Stock)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">Nama PIC Penerima Gudang</label>
                              <input
                                type="text"
                                value={drvReceiver}
                                onChange={(e) => setDrvReceiver(e.target.value)}
                                className="bg-slate-955 border border-slate-800 p-1 rounded text-white text-xs w-full"
                              />
                            </div>

                            {/* GPS Tracking simulated readout */}
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-[9px] space-y-1">
                              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">GPS GEOLOCATION AUTO-Readout</span>
                              <div className="flex justify-between text-slate-400">
                                <span>Lat Latitude: <strong className="text-slate-200">{gpsLocation.lat.toFixed(5)}</strong></span>
                                <span>Lng Longitude: <strong className="text-slate-200">{gpsLocation.lng.toFixed(5)}</strong></span>
                              </div>
                              <span className="text-emerald-400 font-bold block text-[8px] mt-0.5">GPS Location Lock Successful &amp; Broadcasted Live 🚀</span>
                            </div>

                            {/* Digital signature canvas simulation */}
                            <div className="pt-2 border-t border-slate-850">
                              <label className="text-[9px] font-bold block text-slate-400 text-slate-400 uppercase mb-1">Tanda Tangan Elektronik (POD Signature)</label>
                              <div
                                onClick={() => {
                                  setIsSigning(true);
                                  setTimeout(() => {
                                    setDrvSignature('✔️ digital_signed_hash_93a10.png');
                                    setIsSigning(false);
                                  }, 800);
                                }}
                                className="bg-slate-950 h-16 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-900 cursor-pointer"
                              >
                                {isSigning ? (
                                  <span className="animate-pulse text-[10px] text-emerald-400 font-mono">Menggambar Tanda Tangan...</span>
                                ) : drvSignature ? (
                                  <span className="text-[10px] text-emerald-400 font-bold font-mono">Tanda Tangan Selesai (Disimpan)</span>
                                ) : (
                                  <span className="text-[10px] italic">Klik Disini Untuk Tanda Tangan Digital</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setDrvSuccessMsg('✓ Proof of Delivery Berhasil Dikirim!');
                                setTimeout(() => setDrvSuccessMsg(null), 3000);
                              }}
                              className="bg-emerald-500 text-slate-950 font-bold text-xs py-2 rounded-lg w-full cursor-pointer text-center block mt-1"
                            >
                              Submit Proof of Delivery
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ROLE 7 - EXECUTIVE / DIRECTOR MOBILE APP */}
                      {(selectedMobileRole === 'Super Admin' || selectedMobileRole === 'Director' || selectedMobileRole === 'Direktur HQ') && (
                        <div className="space-y-3.5">
                          <h4 className="font-bold text-indigo-400 flex items-center justify-between uppercase leading-none mb-1 text-[11px]">
                            <span>Director Suite Mobile</span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded text-[8px] text-slate-400 border border-slate-800">HQ Mode</span>
                          </h4>

                          {/* Executive Dashboard key metrics widget requested */}
                          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">Estimated Revenue (June)</span>
                              <span className="font-bold text-emerald-400 text-[13px] font-mono leading-tight">Rp 2.4B</span>
                              <span className="text-[8px] text-emerald-500 block mt-0.5 mt-0.5 font-bold">+18.5% VS May</span>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                              <span className="text-slate-500 block text-[8.5px] uppercase font-bold">Standard Gross Margin</span>
                              <span className="font-bold text-emerald-400 text-[13px] font-mono leading-tight">
                                {state.cogsBatch && state.cogsBatch.length > 0 ? (41.2).toFixed(1) : (38.5).toFixed(1)}%
                              </span>
                              <span className="text-[8px] text-indigo-450 block mt-0.5 font-bold">Stable Borongan Cost</span>
                            </div>
                          </div>

                          {/* AI Executive Advisory generate box requested */}
                          <div className="bg-indigo-950/30 border border-indigo-900/30 p-3 rounded-lg text-[10px]">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1.5 uppercase text-[9px]">
                              <Brain className="w-3.5 h-3.5" />
                              AI Executive Strategic Intelligence
                            </div>
                            
                            <div className="space-y-1.5 text-[9.5px]">
                              <div className="flex items-start gap-1">
                                <span className="bg-rose-500/15 text-rose-450 font-bold px-1 rounded uppercase font-mono text-[7px] shrink-0 mt-0.5">Alert</span>
                                <span className="text-slate-350">Stok packaging standing-pouch kemasan SSP di bawah safety margin (Critical: 340 pcs).</span>
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="bg-emerald-500/15 text-emerald-450 font-bold px-1 rounded uppercase font-mono text-[7px] shrink-0 mt-0.5">Opp</span>
                                <span className="text-slate-350">Dekomposisi biaya borongan dewatering &amp; peeling menjaga margin bersih stabil menghadapi cuaca.</span>
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="bg-amber-500/15 text-amber-450 font-bold px-1 rounded uppercase font-mono text-[7px] shrink-0 mt-0.5">Priority</span>
                                <span className="text-slate-350">Koordinasikan stock transfer Standing Pouch kemas dari transit JKT ke SSP sore ini.</span>
                              </div>
                            </div>
                          </div>

                          {/* Factory Rankings */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                            <span className="text-slate-500 text-[8.5px] uppercase font-bold block mb-1">Factory Performance ranking index</span>
                            <div className="space-y-1.5 text-[10px]">
                              <div className="flex justify-between items-center text-slate-400">
                                <span>1. Jakarta HQ (JKT)</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 bg-slate-900 h-1.5 rounded overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[96%]" />
                                  </div>
                                  <span className="font-bold font-mono">95.8</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>2. Sipahutar (SSP)</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 bg-slate-900 h-1.5 rounded overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-[84%]" />
                                  </div>
                                  <span className="font-bold font-mono">83.5</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>3. Malang Factory (MLG)</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 bg-slate-900 h-1.5 rounded overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[78%]" />
                                  </div>
                                  <span className="font-bold font-mono">77.4</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setMobileTab('chat')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 rounded-lg w-full cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Launch AI Strategic Chat
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Simulated Phone Navigation Dock at Bottom (Home, Copilot Chat, Switch, Offline) */}
            <div className="h-16 bg-slate-950 border-t border-slate-900 flex justify-around items-center shrink-0 z-40">
              <button
                onClick={() => {
                  setMobileTab('home');
                }}
                className={`flex flex-col items-center justify-center text-[9px] ${mobileTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Smartphone className="w-4 h-4 mb-1" />
                <span>Home App</span>
              </button>

              <button
                onClick={() => {
                  setMobileTab('chat');
                }}
                className={`flex flex-col items-center justify-center text-[9px] ${mobileTab === 'chat' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <MessageSquare className="w-4 h-4 mb-1" />
                <span>AI Chat</span>
              </button>

              <button
                onClick={() => setIsScanning(true)}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-slate-950 font-bold -translate-y-3 shadow-lg active:scale-95 transition-transform"
              >
                <QrCode className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setMobileTab('notifications');
                }}
                className={`flex flex-col items-center justify-center text-[9px] ${mobileTab === 'notifications' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Bell className="w-4 h-4 mb-1" />
                <span>Notifs</span>
              </button>
            </div>

            {/* Sim Android physical navigation bar line */}
            <div className="h-4 bg-slate-950 flex justify-center items-center shrink-0">
              <div
                onClick={() => {
                  setMobileTab('home');
                }}
                className="w-24 h-1 bg-slate-800 rounded-full hover:bg-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
