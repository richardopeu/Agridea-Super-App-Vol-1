import React, { useState } from 'react';
import { 
  Wand2, 
  Box, 
  Activity, 
  Wallet, 
  Users, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Building,
  DollarSign,
  Lock
} from 'lucide-react';

interface InitialSetupWizardProps {
  currentUser: any;
  selectedLokasi: string;
  lokasi: any[];
  karyawan: any[];
  setKaryawan: React.Dispatch<React.SetStateAction<any[]>>;
  stocks: any[];
  setStocks: React.Dispatch<React.SetStateAction<any[]>>;
  auditLogs: any[];
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
  onAddNotification: (msg: string, type?: 'success' | 'warning' | 'error') => void;
  initialMenu?: string;
}

export default function InitialSetupWizard({
  currentUser,
  selectedLokasi,
  lokasi,
  karyawan,
  setKaryawan,
  stocks,
  setStocks,
  auditLogs,
  setAuditLogs,
  onAddNotification,
  initialMenu = 'setup-wizard'
}: InitialSetupWizardProps) {
  
  // Tabs representing different sections
  const [activeTab, setActiveTab] = useState<string>(
    initialMenu === 'opening-inventory' ? 'inventory' :
    initialMenu === 'opening-production' ? 'production' :
    initialMenu === 'opening-financial' ? 'financial' :
    initialMenu === 'opening-employees' ? 'employees' : 'wizard'
  );

  // Helper log activity inside component
  const logLocalActivity = (modul: string, msg: string) => {
    const newLog = {
      id: 'LOG-' + (auditLogs.length + 1000 + Date.now() % 10000),
      tanggal: new Date().toLocaleString('id-ID'),
      modul,
      username: currentUser ? currentUser.username : 'system',
      deskripsi: msg
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. DATA MIGRATION DASHBOARD STATE
  const [migrationStatus, setMigrationStatus] = useState({
    inventory: 45,
    financial: 30,
    employee: 60,
    supplier: 80,
    customer: 75,
    production: 20
  });

  const overallProgress = Math.round(
    (migrationStatus.inventory +
      migrationStatus.financial +
      migrationStatus.employee +
      migrationStatus.supplier +
      migrationStatus.customer +
      migrationStatus.production) / 6
  );

  // Cut-off settings
  const [cutoffDate, setCutoffDate] = useState<string>('2026-06-01');
  const [migrationLocked, setMigrationLocked] = useState<boolean>(false);

  // 2. OPENING STOCK/INVENTORY STATE
  const [freshFruitItems, setFreshFruitItems] = useState<any[]>([
    { factory: 'MLG', variant: 'Grade A Super', qty: 2500, unitCost: 15000, date: '2026-06-01' },
    { factory: 'MLG', variant: 'Grade B Regular', qty: 1200, unitCost: 12000, date: '2026-06-01' }
  ]);
  const [frozenItems, setFrozenItems] = useState<any[]>([
    { factory: 'MLG', variant: 'Frozen Honey mango', qty: 850, avgCost: 25000, date: '2026-06-01' }
  ]);
  const [chipsItems, setChipsItems] = useState<any[]>([
    { factory: 'MLG', variant: 'Original Nangka Crisps', qty: 450, avgCost: 45000, date: '2026-06-01' }
  ]);
  const [packagingItems, setPackagingItems] = useState<any[]>([
    { factory: 'MLG', material: 'Alumunium Foil Bag 100g', qty: 12000, unit: 'pcs', unitCost: 850, date: '2026-06-01' }
  ]);
  const [finishedGoodsItems, setFinishedGoodsItems] = useState<any[]>([
    { factory: 'MLG', sku: 'SKU-NGK-O100', qty: 3200, cost: 7500, date: '2026-06-01' }
  ]);

  // Form states for manual additions
  const [newFF, setNewFF] = useState({ factory: 'MLG', variant: 'Grade A Super', qty: 1000, unitCost: 14000, date: '2026-06-01' });
  const [newFrozen, setNewFrozen] = useState({ factory: 'MLG', variant: 'Frozen Honey mango', qty: 500, avgCost: 24000, date: '2026-06-01' });
  const [newChips, setNewChips] = useState({ factory: 'MLG', variant: 'Original Nangka Crisps', qty: 200, avgCost: 43000, date: '2026-06-01' });
  const [newPkg, setNewPkg] = useState({ factory: 'MLG', material: 'Carton Box 24x100g', qty: 500, unit: 'pcs', unitCost: 4500, date: '2026-06-01' });
  const [newFG, setNewFG] = useState({ factory: 'MLG', sku: 'SKU-NGK-O100', qty: 1500, cost: 7200, date: '2026-06-01' });

  // Add individual opening inventory
  const handleAddOpeningInventory = (type: string) => {
    if (type === 'fresh') {
      setFreshFruitItems([...freshFruitItems, { ...newFF }]);
      onAddNotification('Berhasil menambahkan saldo awal buah segar.', 'success');
    } else if (type === 'frozen') {
      setFrozenItems([...frozenItems, { ...newFrozen }]);
      onAddNotification('Berhasil menambahkan saldo awal mangga beku.', 'success');
    } else if (type === 'chips') {
      setChipsItems([...chipsItems, { ...newChips }]);
      onAddNotification('Berhasil menambahkan saldo awal keripik curah.', 'success');
    } else if (type === 'packaging') {
      setPackagingItems([...packagingItems, { ...newPkg }]);
      onAddNotification('Berhasil menambahkan saldo awal kemasan.', 'success');
    } else if (type === 'finished') {
      setFinishedGoodsItems([...finishedGoodsItems, { ...newFG }]);
      onAddNotification('Berhasil menambahkan saldo awal barang jadi.', 'success');
    }
  };

  const handleRemoveOpeningItem = (type: string, index: number) => {
    if (type === 'fresh') setFreshFruitItems(freshFruitItems.filter((_, i) => i !== index));
    if (type === 'frozen') setFrozenItems(frozenItems.filter((_, i) => i !== index));
    if (type === 'chips') setChipsItems(chipsItems.filter((_, i) => i !== index));
    if (type === 'packaging') setPackagingItems(packagingItems.filter((_, i) => i !== index));
    if (type === 'finished') setFinishedGoodsItems(finishedGoodsItems.filter((_, i) => i !== index));
    onAddNotification('Item berhasil dihapus.', 'warning');
  };

  // Submit and update actual warehouse states
  const handleSaveOpeningInventorySubmit = () => {
    // Generate real-time stock inputs inside application stock state
    const processedStocks: any[] = [];
    freshFruitItems.forEach(item => {
      processedStocks.push({
        id: 'STOCK-FF-' + Math.floor(Math.random() * 1000000),
        jenis: 'Buah Segar',
        nama: item.variant,
        lokasiId: item.factory,
        qty: item.qty,
        satuan: 'Kg',
        nilaiSatuan: item.unitCost,
        keterangan: 'Migrasi Saldo Awal',
        batchReferensi: 'BAL-AWAL-FF',
        lastUpdated: item.date
      });
    });

    frozenItems.forEach(item => {
      processedStocks.push({
        id: 'STOCK-FZ-' + Math.floor(Math.random() * 1000000),
        jenis: 'Frozen Fruit',
        nama: item.variant,
        lokasiId: item.factory,
        qty: item.qty,
        satuan: 'Kg',
        nilaiSatuan: item.avgCost,
        keterangan: 'Migrasi Saldo Awal',
        batchReferensi: 'BAL-AWAL-FZ',
        lastUpdated: item.date
      });
    });

    chipsItems.forEach(item => {
      processedStocks.push({
        id: 'STOCK-CHIP-' + Math.floor(Math.random() * 1000000),
        jenis: 'Keripik Curah',
        nama: item.variant,
        lokasiId: item.factory,
        qty: item.qty,
        satuan: 'Kg',
        nilaiSatuan: item.avgCost,
        keterangan: 'Migrasi Saldo Awal',
        batchReferensi: 'BAL-AWAL-CHIP',
        lastUpdated: item.date
      });
    });

    packagingItems.forEach(item => {
      processedStocks.push({
        id: 'STOCK-PKG-' + Math.floor(Math.random() * 1000000),
        jenis: 'Bahan Kemas',
        nama: item.material,
        lokasiId: item.factory,
        qty: item.qty,
        satuan: item.unit,
        nilaiSatuan: item.unitCost,
        keterangan: 'Migrasi Saldo Awal',
        batchReferensi: 'BAL-AWAL-PKG',
        lastUpdated: item.date
      });
    });

    finishedGoodsItems.forEach(item => {
      processedStocks.push({
        id: 'STOCK-FG-' + Math.floor(Math.random() * 1000000),
        jenis: 'Barang Jadi',
        nama: item.sku,
        lokasiId: item.factory,
        qty: item.qty,
        satuan: 'Packs',
        nilaiSatuan: item.cost,
        keterangan: 'Migrasi Saldo Awal',
        batchReferensi: 'BAL-AWAL-FG',
        lastUpdated: item.date
      });
    });

    setStocks(prev => [...processedStocks, ...prev]);
    setMigrationStatus(prev => ({ ...prev, inventory: 100 }));
    logLocalActivity('Initial Data Setup', `Migrasi saldo awal inventory dilakukan sebanyak ${processedStocks.length} records.`);
    onAddNotification('Saldo awal persediaan berhasil disimpan dan diintegrasikan ke sistem utama!', 'success');
  };

  // 3. OPENING PRODUCTION POSITION
  const [openingWip, setOpeningWip] = useState({
    factory: 'MLG',
    date: '2026-06-01',
    freshFruitInProcess: 1500, // Kg
    freshFruitCost: 15000,
    frozenInProcess: 800, // Kg
    frozenCost: 25000,
    fryingInProcess: 600, // Kg
    fryingCost: 35000,
    qcInProcess: 350, // Kg
    qcCost: 40000,
    packagingInProcess: 250, // Kg
    packagingCost: 45000
  });

  const handleSaveOpeningProduction = () => {
    setMigrationStatus(prev => ({ ...prev, production: 100 }));
    logLocalActivity('Initial Data Setup', `Migrasi Posisi Produksi Berjalan (WIP) di pabrik ${openingWip.factory} berhasil di-seeding.`);
    onAddNotification('Saldo Awal WIP Produksi berhasil disimpan ke batch berjalan!', 'success');
  };

  // 4. OPENING FINANCIAL BALANCE
  const [financialBalances, setFinancialBalances] = useState({
    cash: 45000000,
    bankIdr: 750000000,
    pettyCash: 12500000,
    accountsReceivable: 145000000,
    accountsPayable: 95000000,
    openingCapital: 800000000,
    retainedEarnings: 100000000,
    date: '2026-06-01'
  });

  // Dynamic calculations from Inventory Stock
  const calcFreshFruitValue = freshFruitItems.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
  const calcFrozenValue = frozenItems.reduce((sum, item) => sum + (item.qty * item.avgCost), 0);
  const calcChipsValue = chipsItems.reduce((sum, item) => sum + (item.qty * item.avgCost), 0);
  const calcPkgValue = packagingItems.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
  const calcFGValue = finishedGoodsItems.reduce((sum, item) => sum + (item.qty * item.cost), 0);
  const totalInventoryValue = calcFreshFruitValue + calcFrozenValue + calcChipsValue + calcPkgValue + calcFGValue;

  // Balance sheet metrics
  const totalAssets = financialBalances.cash + financialBalances.bankIdr + financialBalances.pettyCash + financialBalances.accountsReceivable + totalInventoryValue;
  const totalLiabilities = financialBalances.accountsPayable;
  const totalEquity = financialBalances.openingCapital + financialBalances.retainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const accountingDifference = totalAssets - totalLiabilitiesAndEquity;

  const handleSaveFinancialBalances = () => {
    setMigrationStatus(prev => ({ ...prev, financial: 100 }));
    logLocalActivity('Initial Data Setup', `Migrasi Neraca Awal Finansial berhasil divalidasi dengan Total Aset Rp ${totalAssets.toLocaleString()}`);
    onAddNotification('Neraca saldo awal keuangan berhasil disimpan!', 'success');
  };

  // 5. EMPLOYEE DATA SETUP
  const [employeeInput, setEmployeeInput] = useState({
    nama: '',
    factory: 'MLG',
    role: 'Kupas',
    department: 'Produksi',
    status: 'Aktif',
    salaryType: 'Harian Borongan',
    salaryRate: 1500,
    joinDate: '2026-06-01'
  });

  const handleAddEmployeeManual = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp = {
      id: 'EMP-' + Math.floor(100000 + Math.random() * 900000),
      nama: employeeInput.nama,
      nik: 'NIK-' + Math.floor(100000 + Math.random() * 900000),
      role: employeeInput.role,
      tarifDasar: employeeInput.salaryRate,
      tarifInsentif: employeeInput.salaryType === 'Bulanan' ? 0 : 300,
      targetHarian: employeeInput.role === 'Kupas' ? 40 : 25,
      status: employeeInput.status,
      lokasiId: employeeInput.factory,
      gajiBulanan: employeeInput.salaryType === 'Bulanan' ? employeeInput.salaryRate : 0
    };

    setKaryawan(prev => [newEmp, ...prev]);
    setMigrationStatus(prev => ({ ...prev, employee: Math.min(prev.employee + 5, 100) }));
    logLocalActivity('Employee Migration', `Karyawan baru ${employeeInput.nama} berhasil didaftarkan secara manual pada saldo awal.`);
    onAddNotification(`Registrasi karyawan ${employeeInput.nama} berhasil!`, 'success');
    setEmployeeInput({ ...employeeInput, nama: '' });
  };

  // Excel / CSV Bulk Upload Simulator State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [excelFileSelected, setExcelFileSelected] = useState<string | null>(null);
  const [excelPreviewRows, setExcelPreviewRows] = useState<any[]>([]);

  // Simulation templates
  const mockTemplates = {
    inventory: [
      { JenisPersediaan: 'Buah Segar', Variant: 'Arumanis Super', Qty: 5000, Satuan: 'Kg', CostSatuan: 16000, LokasiKode: 'MLG' },
      { JenisPersediaan: 'Bahan Kemas', Variant: 'Plastik PP 200g', Qty: 40000, Satuan: 'pcs', CostSatuan: 550, LokasiKode: 'SBY' }
    ],
    employees: [
      { NamaKaryawan: 'Adi Wijaya', Role: 'Kupas', Department: 'Produksi', SalaryType: 'Harian Borongan', Rate: 1600, LokasiKode: 'MLG' },
      { NamaKaryawan: 'Dewi Rahma', Role: 'Frying Operator', Department: 'Produksi', SalaryType: 'Harian Borongan', Rate: 2000, LokasiKode: 'MLG' },
      { NamaKaryawan: 'Sutrisno', Role: 'Supervisor', Department: 'Operations', SalaryType: 'Bulanan', Rate: 4500000, LokasiKode: 'JKT' }
    ]
  };

  const handleDownloadTemplate = (type: 'inventory' | 'employees') => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(mockTemplates[type], null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `template_${type}_migration.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddNotification(`Berhasil mendownload template migrasi ${type}.`, 'success');
  };

  const handleSimulateExcelUpload = (type: 'inventory' | 'employees') => {
    setUploadProgress(10);
    setExcelFileSelected(`data_upload_${type}_pabrik_revised.xlsx`);
    
    // Simulate progression
    let current = 10;
    const interval = setInterval(() => {
      current += 30;
      if (current >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        // Load mock data preview
        if (type === 'inventory') {
          setExcelPreviewRows(mockTemplates.inventory);
        } else {
          setExcelPreviewRows(mockTemplates.employees);
        }
        onAddNotification('Simulasi unggah dokumen Excel selesai!', 'success');
      } else {
        setUploadProgress(current);
      }
    }, 300);
  };

  const handleCommitBulkImportPreview = (type: 'inventory' | 'employees') => {
    if (type === 'inventory') {
      const addedQty = excelPreviewRows.length;
      // Map to realstocks
      const newStocksMapped = excelPreviewRows.map(row => ({
        id: 'STOCK-BULK-' + Math.floor(Math.random() * 1000000),
        jenis: row.JenisPersediaan,
        nama: row.Variant,
        lokasiId: row.LokasiKode,
        qty: row.Qty,
        satuan: row.Satuan,
        nilaiSatuan: row.CostSatuan,
        keterangan: 'Migrasi Masal Excel',
        batchReferensi: 'BULK-MIGRATE-EXCEL',
        lastUpdated: '2026-06-01'
      }));
      setStocks(prev => [...newStocksMapped, ...prev]);
      setMigrationStatus(prev => ({ ...prev, inventory: 100 }));
      logLocalActivity('Bulk Upload', `Sukses memasukkan ${addedQty} baris inventori melalui parser Excel.`);
    } else {
      const addedQty = excelPreviewRows.length;
      const newEmployeesMapped = excelPreviewRows.map(row => ({
        id: 'EMP-BULK-' + Math.floor(100000 + Math.random() * 900000),
        nama: row.NamaKaryawan,
        nik: 'NIK-' + Math.floor(100000 + Math.random() * 900000),
        role: row.Role,
        tarifDasar: row.SalaryType === 'Bulanan' ? 0 : row.Rate,
        tarifInsentif: row.SalaryType === 'Bulanan' ? 0 : 300,
        targetHarian: row.Role === 'Kupas' ? 40 : 25,
        status: 'Aktif',
        lokasiId: row.LokasiKode,
        gajiBulanan: row.SalaryType === 'Bulanan' ? row.Rate : 0
      }));
      setKaryawan(prev => [...newEmployeesMapped, ...prev]);
      setMigrationStatus(prev => ({ ...prev, employee: 100 }));
      logLocalActivity('Bulk Upload', `Sukses mengunggah ${addedQty} data karyawan lewat spreadsheet parser.`);
    }

    onAddNotification(`Pernyataan migrasi: ${excelPreviewRows.length} data masal berhasil dimasukkan!`, 'success');
    setExcelPreviewRows([]);
    setUploadProgress(null);
    setExcelFileSelected(null);
  };

  return (
    <div className="space-y-6" id="setup-wizard-root">
      {/* Upper Title Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="space-y-2 max-w-xl z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <Wand2 className="w-3 h-3 animate-pulse" /> SYSTEM SYSTEM INITIALIZATION WIZARD
            </span>
            <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">v1.2 // Live</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-white">Modul Inisialisasi Sistem &amp; Saldo Awal Perusahaan</h1>
          <p className="text-xs text-slate-450 leading-relaxed font-medium">
            Gerbang inisiasi dan migrasi data historis terpadu ketika sistem Agridea pertama kali diimplementasikan. Gunakan alat ini dengan bijak untuk memindahkan neraca, stok gudang, dan personel secara presisi.
          </p>
        </div>
        <div className="shrink-0 flex items-center md:flex-col gap-3 z-20 bg-slate-950/40 p-4 border border-slate-800 rounded-xl" id="overall-gauge shadow-inner">
          <div className="text-center">
            <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Overall Migration Status</p>
            <p className="text-3xl font-extrabold text-emerald-400 font-display mt-0.5">{overallProgress}%</p>
          </div>
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Navigation Panels / Tab bar */}
      <div className="flex flex-wrap border-b border-slate-200" id="setup-tabs">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'wizard' ? 'border-emerald-600 text-emerald-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Wand2 className="w-4 h-4" /> 1. Startup & Status
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'inventory' ? 'border-emerald-600 text-emerald-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Box className="w-4 h-4" /> 2. Opening Inventory
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'production' ? 'border-emerald-600 text-emerald-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Activity className="w-4 h-4" /> 3. Production WIP
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'financial' ? 'border-emerald-600 text-emerald-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Wallet className="w-4 h-4" /> 4. Opening Financials
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'employees' ? 'border-emerald-600 text-emerald-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Users className="w-4 h-4" /> 5. Employee Migration
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'bulk' ? 'border-emerald-600 text-emerald-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Upload className="w-4 h-4" /> 6. Bulk Excel Upload
        </button>
      </div>

      {/* RENDER CONTENT BLOCKS */}
      <div className="bg-slate-50 min-h-[400px]">

        {/* TAB 1: STATUS & STARTUP GUIDELINE */}
        {activeTab === 'wizard' && (
          <div className="space-y-6" id="tab-guideline">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Migration Readiness card */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-500" /> Konfigurasi Migrasi &amp; Cut-Off Date
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Cut-Off Parameter</span>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Tanggal Cut-off Buku Perusahaan
                    </label>
                    <input 
                      type="date" 
                      value={cutoffDate}
                      disabled={migrationLocked}
                      onChange={(e) => setCutoffDate(e.target.value)}
                      className="bg-white border border-slate-250 text-slate-900 rounded-lg p-2.5 w-full outline-none focus:border-emerald-500 font-sans text-xs transition-shadow"
                    />
                    <p className="text-[10px] text-slate-450">Semua transaksi sesudah tanggal ini dianggap transaksi berjalan log.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-500" /> Lock Status Migrasi
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMigrationLocked(!migrationLocked);
                          logLocalActivity('Initial Data Setup', `Mengubah lock status migrasi menjadi ${!migrationLocked}`);
                          onAddNotification(`Konfigurasi migrasi ${!migrationLocked ? 'DIKUNCI' : 'DIBUKA'}`, 'warning');
                        }}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                          migrationLocked 
                            ? 'bg-amber-600 text-white hover:bg-amber-700' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {migrationLocked ? 'Buka Kunci Setup' : 'Kunci Semua Saldo Awal'}
                      </button>
                      <span className="text-xs text-slate-450">
                        {migrationLocked ? '✓ Terkunci untuk Audit' : '⚠️ Masih dapat diedit'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-800">Cakupan Data Saldo Awal yang Dimigrasikan:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-650">
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex gap-2.5 items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">1. Persediaan (Bahan Awal &amp; Finish)</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">Sistem memetakan stok buah segar, buah frozen, chips curah, sachet, dan karton ke masing-masing lokasi pabrik.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex gap-2.5 items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">2. Keuangan &amp; Neraca Saku</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">Mengatur nilai pembukaan saku Kas Cabang, Bank IDR, Hutang Dagang (AP), dan Piutang (AR).</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex gap-2.5 items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">3. Status Produksi Berjalan</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">Mendukung input jumlah WIP (Work in Process) sisa dari sistem lama agar tidak memicu kerugian yield fiktif.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-150 rounded-xl flex gap-2.5 items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">4. Karyawan &amp; Kontak Bisnis</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">Mendaftarkan daftar roster karyawan borongan secara utuh dengan tarif upah yang disepakati.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress gauge card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4" id="tracker-gauges">
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">Migration Stream Tracker</h3>
                <p className="text-[11px] text-slate-450">Tingkat kelengkapan integrasi masing-masing entitas saldo awal:</p>
                
                <div className="space-y-3.5 pt-2">
                  {[
                    { label: 'Inventory (Bahan & FG)', val: migrationStatus.inventory, color: 'bg-emerald-500' },
                    { label: 'Financial & Ledger', val: migrationStatus.financial, color: 'bg-sky-500' },
                    { label: 'Production WIP Positions', val: migrationStatus.production, color: 'bg-purple-500' },
                    { label: 'Employee Register Roster', val: migrationStatus.employee, color: 'bg-indigo-500' },
                    { label: 'Supplier Accounts', val: migrationStatus.supplier, color: 'bg-amber-500' },
                    { label: 'Customer Accounts', val: migrationStatus.customer, color: 'bg-pink-500' }
                  ].map((stream, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-700">{stream.label}</span>
                        <span className="text-slate-900 font-mono text-[11px]">{stream.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stream.color} transition-all duration-550`} style={{ width: `${stream.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 font-mono leading-normal">
                  <div className="flex items-center gap-1.5 font-bold text-slate-755 mb-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-600" /> SYSTEM READINESS CHECK:
                  </div>
                  {overallProgress >= 90 ? (
                    <span className="text-emerald-600 font-bold">✓ READY FOR EXPORT DEPLOYMENT</span>
                  ) : (
                    <span className="text-amber-600 font-bold">⚠️ INCOMPLETE MIGRATION FLOW (NEED &gt;90%)</span>
                  )}
                  <p className="mt-1">Tuntaskan setoran saldo awal persediaan barang jadi, bahan baku segar, dan saku keuangan untuk melewati fase transisi.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OPENING INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6" id="tab-inventory-opening">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Pendaftaran Saldo Awal Persediaan Bahan &amp; Barang Jadi</h2>
                  <p className="text-[11px] text-slate-450 mt-0.5">Alokasikan sisa kubikasi barang dari gudang lama Anda ke database pabrik Agridea.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveOpeningInventorySubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold text-xs rounded-lg transition-transform flex items-center gap-1 shrink-0 shadow-md shadow-emerald-600/10"
                >
                  <CheckCircle className="w-4 h-4" /> Integrasikan Semua Ke Stock Tracker
                </button>
              </div>

              {/* Subsection Grid Forms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Side: Adding Forms */}
                <div className="space-y-4">
                  {/* FF segment */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-emerald-600" /> Saldo Awal Buah Segar (Fresh Fruit)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Lokasi Gudang</label>
                        <select 
                          value={newFF.factory} 
                          onChange={(e) => setNewFF({...newFF, factory: e.target.value})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                        >
                          {lokasi.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Variant Buah</label>
                        <input 
                          type="text" 
                          value={newFF.variant}
                          onChange={(e) => setNewFF({...newFF, variant: e.target.value})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Kuantitas (Kg)</label>
                        <input 
                          type="number" 
                          value={newFF.qty}
                          onChange={(e) => setNewFF({...newFF, qty: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Harga Per-Kg (Rp)</label>
                        <input 
                          type="number" 
                          value={newFF.unitCost}
                          onChange={(e) => setNewFF({...newFF, unitCost: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleAddOpeningInventory('fresh')}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-[11px]"
                    >
                      + Tambah Saldo Buah Segar
                    </button>
                  </div>

                  {/* Frozen segment */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-sky-600" /> Saldo Awal Frozen Fruit
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Lokasi</label>
                        <select 
                          value={newFrozen.factory} 
                          onChange={(e) => setNewFrozen({...newFrozen, factory: e.target.value})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                        >
                          {lokasi.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Fruit Variant</label>
                        <input 
                          type="text" 
                          value={newFrozen.variant}
                          onChange={(e) => setNewFrozen({...newFrozen, variant: e.target.value})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Qty (Kg)</label>
                        <input 
                          type="number" 
                          value={newFrozen.qty}
                          onChange={(e) => setNewFrozen({...newFrozen, qty: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Estimasi Cost/Kg</label>
                        <input 
                          type="number" 
                          value={newFrozen.avgCost}
                          onChange={(e) => setNewFrozen({...newFrozen, avgCost: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleAddOpeningInventory('frozen')}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-[11px]"
                    >
                      + Tambah Saldo Frozen Fruit
                    </button>
                  </div>

                  {/* Finished Goods (SKU) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-purple-600" /> Saldo Awal Barang Jadi (Finished Goods)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Lokasi Gudang</label>
                        <select 
                          value={newFG.factory} 
                          onChange={(e) => setNewFG({...newFG, factory: e.target.value})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                        >
                          {lokasi.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">SKU Produk</label>
                        <input 
                          type="text" 
                          value={newFG.sku}
                          onChange={(e) => setNewFG({...newFG, sku: e.target.value})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Qty (Packs)</label>
                        <input 
                          type="number" 
                          value={newFG.qty}
                          onChange={(e) => setNewFG({...newFG, qty: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">BOM Cost Per-Pack</label>
                        <input 
                          type="number" 
                          value={newFG.cost}
                          onChange={(e) => setNewFG({...newFG, cost: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleAddOpeningInventory('finished')}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-[11px]"
                    >
                      + Tambah Saldo Finished Goods (SKU)
                    </button>
                  </div>
                </div>

                {/* Right Side: Current Records Stack */}
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h3 className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Live Ledger Saldo Gudang Awal</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">Real-time valuation</span>
                    </h3>
                    
                    {/* Fresh Fruit List */}
                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">A) Fresh Fruit Records</p>
                      <div className="space-y-1.5">
                        {freshFruitItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                            <div>
                              <p className="font-bold text-slate-950">{item.variant}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">Pabrik: <span className="font-bold">{item.factory}</span> | Qty: {item.qty} Kg | Cost: Rp {item.unitCost.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-600 font-mono">Rp {(item.qty * item.unitCost).toLocaleString()}</span>
                              <button type="button" onClick={() => handleRemoveOpeningItem('fresh', index)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Frozen Stack */}
                    <div className="space-y-2 text-xs pt-2">
                      <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">B) Frozen Fruit Records</p>
                      <div className="space-y-1.5">
                        {frozenItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                            <div>
                              <p className="font-bold text-slate-950">{item.variant}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">Pabrik: <span className="font-bold">{item.factory}</span> | Qty: {item.qty} Kg | Cost: Rp {item.avgCost.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-600 font-mono">Rp {(item.qty * item.avgCost).toLocaleString()}</span>
                              <button type="button" onClick={() => handleRemoveOpeningItem('frozen', index)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FG Stack */}
                    <div className="space-y-2 text-xs pt-2">
                      <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">C) Finished Goods Records</p>
                      <div className="space-y-1.5">
                        {finishedGoodsItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                            <div>
                              <p className="font-bold text-slate-950">{item.sku}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">Pabrik: <span className="font-bold">{item.factory}</span> | Qty: {item.qty} Packs | HPP: Rp {item.cost.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-purple-600 font-mono">Rp {(item.qty * item.cost).toLocaleString()}</span>
                              <button type="button" onClick={() => handleRemoveOpeningItem('finished', index)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Aggregation Indicator */}
                    <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-150 rounded-xl flex items-center justify-between text-xs pt-4 font-bold">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-emerald-600" /> TOTAL VALUASI PERSEDIAAN AWAL:
                      </span>
                      <span className="text-sm font-extrabold font-mono text-emerald-700">
                        Rp {totalInventoryValue.toLocaleString()}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTION WIP */}
        {activeTab === 'production' && (
          <div className="space-y-6" id="tab-production-opening">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Inisialisasi Posisi Produksi Berjalan (Work-In-Process)</h2>
                  <p className="text-[11px] text-slate-450 mt-0.5">Amankan tonase buah yang masih berada dalam tangki peeler atau sedang digoreng.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveOpeningProduction}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <CheckCircle className="w-4 h-4" /> Simpan Posisi WIP
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
                {/* Inputs */}
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-emerald-600" /> Form Input Posisi WIP per Posisi
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Pabrik WIP</label>
                      <select
                        value={openingWip.factory}
                        onChange={(e) => setOpeningWip({ ...openingWip, factory: e.target.value })}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                      >
                        {lokasi.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tanggal Cut-off WIP</label>
                      <input
                        type="date"
                        value={openingWip.date}
                        onChange={(e) => setOpeningWip({ ...openingWip, date: e.target.value })}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-sans"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Stage-wise wip inputs */}
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="font-bold text-slate-700">1. Kupas / Sortasi Buah (Kg)</span>
                      <input 
                        type="number" 
                        value={openingWip.freshFruitInProcess}
                        onChange={(e) => setOpeningWip({ ...openingWip, freshFruitInProcess: Number(e.target.value) })}
                        className="bg-white border border-slate-350 p-1.5 rounded-lg text-center"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">@ Rp</span>
                        <input 
                          type="number" 
                          value={openingWip.freshFruitCost} 
                          onChange={(e) => setOpeningWip({ ...openingWip, freshFruitCost: Number(e.target.value) })}
                          className="bg-white border border-slate-350 p-1.5 rounded-lg w-full text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="font-bold text-slate-700">2. Pembekuan (Kg)</span>
                      <input 
                        type="number" 
                        value={openingWip.frozenInProcess}
                        onChange={(e) => setOpeningWip({ ...openingWip, frozenInProcess: Number(e.target.value) })}
                        className="bg-white border border-slate-350 p-1.5 rounded-lg text-center"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">@ Rp</span>
                        <input 
                          type="number" 
                          value={openingWip.frozenCost} 
                          onChange={(e) => setOpeningWip({ ...openingWip, frozenCost: Number(e.target.value) })}
                          className="bg-white border border-slate-350 p-1.5 rounded-lg w-full text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="font-bold text-slate-700">3. Vacuum Frying (Kg)</span>
                      <input 
                        type="number" 
                        value={openingWip.fryingInProcess}
                        onChange={(e) => setOpeningWip({ ...openingWip, fryingInProcess: Number(e.target.value) })}
                        className="bg-white border border-slate-350 p-1.5 rounded-lg text-center"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">@ Rp</span>
                        <input 
                          type="number" 
                          value={openingWip.fryingCost} 
                          onChange={(e) => setOpeningWip({ ...openingWip, fryingCost: Number(e.target.value) })}
                          className="bg-white border border-slate-350 p-1.5 rounded-lg w-full text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="font-bold text-slate-700">4. QC Sortasi Akhir (Kg)</span>
                      <input 
                        type="number" 
                        value={openingWip.qcInProcess}
                        onChange={(e) => setOpeningWip({ ...openingWip, qcInProcess: Number(e.target.value) })}
                        className="bg-white border border-slate-350 p-1.5 rounded-lg text-center"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">@ Rp</span>
                        <input 
                          type="number" 
                          value={openingWip.qcCost} 
                          onChange={(e) => setOpeningWip({ ...openingWip, qcCost: Number(e.target.value) })}
                          className="bg-white border border-slate-350 p-1.5 rounded-lg w-full text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="font-bold text-slate-700">5. Proses Kemas (Kg)</span>
                      <input 
                        type="number" 
                        value={openingWip.packagingInProcess}
                        onChange={(e) => setOpeningWip({ ...openingWip, packagingInProcess: Number(e.target.value) })}
                        className="bg-white border border-slate-350 p-1.5 rounded-lg text-center"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">@ Rp</span>
                        <input 
                          type="number" 
                          value={openingWip.packagingCost} 
                          onChange={(e) => setOpeningWip({ ...openingWip, packagingCost: Number(e.target.value) })}
                          className="bg-white border border-slate-350 p-1.5 rounded-lg w-full text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Valuations summary on the right */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2">Rincian &amp; Nilai Seeding WIP</h3>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Buah Segar Kupas dalam Tangki', qty: openingWip.freshFruitInProcess, cost: openingWip.freshFruitCost },
                        { label: 'Frozen Prep dalam Freezer', qty: openingWip.frozenInProcess, cost: openingWip.frozenCost },
                        { label: 'Batch Vakum (sedang digoreng)', qty: openingWip.fryingInProcess, cost: openingWip.fryingCost },
                        { label: 'Spinner &amp; Sortasi QC', qty: openingWip.qcInProcess, cost: openingWip.qcCost },
                        { label: 'Semi-Finish (siap sachet)', qty: openingWip.packagingInProcess, cost: openingWip.packagingCost }
                      ].map((item, id) => (
                        <div key={id} className="flex justify-between items-center text-xs text-slate-650 bg-slate-50 p-2.5 rounded-lg">
                          <span>{item.label}</span>
                          <span className="font-bold text-slate-900 font-mono">Rp {(item.qty * item.cost).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 text-purple-900 border border-purple-150 rounded-xl mt-6 flex justify-between items-center">
                    <span className="font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-650" /> TOTAL WIP VALUE SEEDING:
                    </span>
                    <span className="text-sm font-extrabold font-mono text-purple-700">
                      Rp {(
                        openingWip.freshFruitInProcess * openingWip.freshFruitCost +
                        openingWip.frozenInProcess * openingWip.frozenCost +
                        openingWip.fryingInProcess * openingWip.fryingCost +
                        openingWip.qcInProcess * openingWip.qcCost +
                        openingWip.packagingInProcess * openingWip.packagingCost
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OPENING FINANCIAL BALANCE & LEDGER BALANCE SHEET */}
        {activeTab === 'financial' && (
          <div className="space-y-6" id="tab-financial-opening">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Migrasi Neraca &amp; Saldo Keuangan Awal Perusahaan</h2>
                  <p className="text-[11px] text-slate-450 mt-0.5">Atur saku Kas, Bank IDR, Hutang Supplier, Piutang Toko, dan Nilai Modal Awal.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveFinancialBalances}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <CheckCircle className="w-4 h-4" /> Simpan Neraca Awal
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
                {/* Form Inputs on Left */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[10px] pb-1 border-b border-slate-200">Forms Neraca Awal</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Pembukaan Kas Kantor Tunai (Rp)</label>
                      <input 
                        type="number" 
                        value={financialBalances.cash}
                        onChange={(e) => setFinancialBalances({...financialBalances, cash: Number(e.target.value)})}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Saldo Bank Utama Perusahaan (IDR)</label>
                      <input 
                        type="number" 
                        value={financialBalances.bankIdr}
                        onChange={(e) => setFinancialBalances({...financialBalances, bankIdr: Number(e.target.value)})}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Petty Cash Kas Kecil Cabang (Rp)</label>
                      <input 
                        type="number" 
                        value={financialBalances.pettyCash}
                        onChange={(e) => setFinancialBalances({...financialBalances, pettyCash: Number(e.target.value)})}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Piutang Dagang Toko (Accounts Receivable) (Rp)</label>
                      <input 
                        type="number" 
                        value={financialBalances.accountsReceivable}
                        onChange={(e) => setFinancialBalances({...financialBalances, accountsReceivable: Number(e.target.value)})}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hutang Dagang Supplier (Accounts Payable) (Rp)</label>
                      <input 
                        type="number" 
                        value={financialBalances.accountsPayable}
                        onChange={(e) => setFinancialBalances({...financialBalances, accountsPayable: Number(e.target.value)})}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Modal Disetor (Capital) (Rp)</label>
                        <input 
                          type="number" 
                          value={financialBalances.openingCapital}
                          onChange={(e) => setFinancialBalances({...financialBalances, openingCapital: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Laba Ditahan (Retained)</label>
                        <input 
                          type="number" 
                          value={financialBalances.retainedEarnings}
                          onChange={(e) => setFinancialBalances({...financialBalances, retainedEarnings: Number(e.target.value)})}
                          className="bg-white border border-slate-350 p-2 rounded-lg w-full font-mono text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Balance Sheet on the Right */}
                <div className="p-5 bg-slate-950 text-white rounded-2xl space-y-4 shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="font-bold text-emerald-400 text-xs tracking-wider uppercase">BALANCE SHEET (OPENING NERACA AWAL)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Date: {cutoffDate}</span>
                  </div>

                  {/* Assets */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-900 pb-0.5">ACTIVA (ASSETS)</p>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Kas Tunai Pusat</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.cash.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kas Bank Mandiri / BCA</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.bankIdr.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kas Kecil Pabrik (Petty Cash)</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.pettyCash.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Piutang Dagang Toko (AR)</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.accountsReceivable.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-350">
                        <span>Nilai Persediaan Gudang (Auto-Stock)</span>
                        <span className="font-bold font-mono">Rp {totalInventoryValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-slate-850 pt-2 text-xs font-bold text-emerald-400">
                      <span>TOTAL ASSETS (AKTIVA)</span>
                      <span className="font-mono">Rp {totalAssets.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-900 pb-0.5">PASSIVA (LIABILITIES &amp; EQUITY)</p>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Hutang Dagang Supplier (AP)</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.accountsPayable.toLocaleString()}</span>
                      </div>
                      <hr className="border-slate-900 my-1" />
                      <div className="flex justify-between">
                        <span>Modal Awal Disetor</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.openingCapital.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Laba Ditahan Seeding</span>
                        <span className="font-mono text-slate-100">Rp {financialBalances.retainedEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-slate-850 pt-2 text-xs font-bold text-amber-400">
                      <span>TOTAL LIABILITIES &amp; EQUITY</span>
                      <span className="font-mono">Rp {totalLiabilitiesAndEquity.toLocaleString()}</span>
                    </div>
                  </div>

                  <hr className="border-slate-850 my-2" />

                  {/* Balancing Check block */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    accountingDifference === 0 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-950/40 border-red-500/30 text-red-400'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> RECONCILIATION DIF:
                    </span>
                    <span className="font-mono text-sm font-extrabold">
                      {accountingDifference === 0 ? 'BALANCED' : `Rp ${accountingDifference.toLocaleString()}`}
                    </span>
                  </div>
                  {accountingDifference !== 0 && (
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">⚠️ Peringatan: Angka Aktiva dan Passiva Anda saat ini mengalami selisih sebesar Rp {accountingDifference.toLocaleString()}. Atur jumlah Modal Disor atau Kas Bank agar persamaan akuntansi kembali seimbang.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EMPLOYEES MIGRATION */}
        {activeTab === 'employees' && (
          <div className="space-y-6" id="tab-employees-opening">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Pendaftaran &amp; Migrasi Roster Karyawan</h2>
                  <p className="text-[11px] text-slate-450 mt-0.5">Daftarkan personel baru Anda secara manual atau pakai simulator import excel di bawah.</p>
                </div>
                <span className="text-xs bg-slate-150 px-3 py-1 rounded text-slate-700 font-bold">Total Karyawan Terdaftar: {karyawan.length}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Registration Manual Form */}
                <form onSubmit={handleAddEmployeeManual} className="lg:col-span-1 p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 text-xs font-sans">
                  <h3 className="font-extrabold text-slate-950 text-[10px] uppercase tracking-wider flex items-center gap-1 border-b border-slate-200 pb-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> Manual Registration Form
                  </h3>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Nama Lengkap Personel *</label>
                    <input 
                      type="text" 
                      value={employeeInput.nama}
                      onChange={(e) => setEmployeeInput({ ...employeeInput, nama: e.target.value })}
                      className="bg-white border border-slate-350 p-2 rounded-lg w-full font-bold text-slate-800"
                      placeholder="e.g., Slamet Rahardjo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Factory</label>
                      <select 
                        value={employeeInput.factory}
                        onChange={(e) => setEmployeeInput({ ...employeeInput, factory: e.target.value })}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                      >
                        {lokasi.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Role Jabatan</label>
                      <select 
                        value={employeeInput.role}
                        onChange={(e) => setEmployeeInput({ ...employeeInput, role: e.target.value })}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                      >
                        <option value="Kupas">Kupas Buah</option>
                        <option value="Potong">Potong Buah</option>
                        <option value="Frying">Operator Frying</option>
                        <option value="QC">QC Inspector</option>
                        <option value="Kemas">Operator Kemas</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 font-sans">Salary Type</label>
                      <select 
                        value={employeeInput.salaryType}
                        onChange={(e) => setEmployeeInput({ ...employeeInput, salaryType: e.target.value, salaryRate: e.target.value === 'Bulanan' ? 4500000 : 1500 })}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full font-medium"
                      >
                        <option value="Harian Borongan">Harian Borongan</option>
                        <option value="Bulanan">Gaji Bulanan</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rate (Rp) *</label>
                      <input 
                        type="number" 
                        value={employeeInput.salaryRate}
                        onChange={(e) => setEmployeeInput({ ...employeeInput, salaryRate: Number(e.target.value) })}
                        className="bg-white border border-slate-350 p-2 rounded-lg w-full text-right font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase mt-4"
                  >
                    + Register Karyawan Awal
                  </button>
                </form>

                {/* Right Side Roster Preview */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                    <h3 className="font-bold text-xs text-slate-900 mb-3 flex items-center justify-between">
                      <span>Roster Karyawan Terdaftar (10 Teratas)</span>
                      <span className="text-[10px] text-slate-500 font-medium">Auto-synced</span>
                    </h3>
                    
                    <div className="space-y-2 overflow-y-auto max-h-[300px]">
                      {karyawan.slice(0, 10).map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {emp.nama.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{emp.nama}</p>
                              <p className="text-[10px] text-slate-400">NIK: {emp.nik} | Pabrik: {emp.lokasiId} | Role: {emp.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-950 font-mono text-[11px]">Rp {emp.tarifDasar?.toLocaleString()}</p>
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-450">{emp.gajiBulanan > 0 ? 'Bulanan' : 'Borongan'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BULK EXCEL UPLOADER & EXCEL PREVIEW */}
        {activeTab === 'bulk' && (
          <div className="space-y-6" id="tab-bulk-opening">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Introduction box */}
              <div className="flex flex-col md:flex-row gap-6 justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-sans items-start">
                <div className="space-y-1.5 max-w-xl">
                  <h3 className="font-extrabold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 animate-bounce" /> Simulator Unggah Dokumen Roster &amp; Gudang (Excel/CSV)
                  </h3>
                  <p className="text-slate-550 leading-relaxed">
                    Alat ini menduplikasi mekanisme parsing file spreadsheet migrasi. Anda dapat mendownload file template JSON/CSV, memodifikasinya, lalu memasukkannya ke sistem dengan menjatuhkannya di bawah.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => handleDownloadTemplate('inventory')}
                    className="bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                  >
                    Template Inventory
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDownloadTemplate('employees')}
                    className="bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                  >
                    Template Employee
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone Drag-and-drop simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Dropzone */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[220px]">
                    <Upload className="w-10 h-10 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Drag &amp; Drop Spreadsheet Migrasi Anda di sini</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Mendukung format file .xlsx, .csv, maupun data JSON raw.</p>
                    </div>
                    
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateExcelUpload('inventory')}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-3 font-semibold text-[10px] rounded p-1.5 transition-shadow"
                      >
                        Simulasi Upload Inventory
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateExcelUpload('employees')}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-3 font-semibold text-[10px] rounded p-1.5 transition-shadow"
                      >
                        Simulasi Upload Roster
                      </button>
                    </div>

                    {uploadProgress !== null && (
                      <div className="w-full max-w-xs space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                          <span>Mengunggah {excelFileSelected}...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Parser Preview & Commit Panel */}
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 min-h-[220px] flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                        <span>Hasil Preview Parsing File Excel</span>
                        {excelPreviewRows.length > 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">✓ Ready</span>
                        )}
                      </h4>

                      {excelPreviewRows.length > 0 ? (
                        <div className="border border-slate-150 rounded-lg overflow-hidden divide-y divide-slate-100 text-[11px] font-sans">
                          {excelPreviewRows.map((row, index) => (
                            <div key={index} className="p-2 bg-slate-50 flex justify-between gap-2.5">
                              <span className="font-bold text-slate-900 truncate max-w-[200px]" title={row.Variant || row.NamaKaryawan}>
                                {row.Variant || row.NamaKaryawan}
                              </span>
                              <span className="font-mono text-slate-450 text-[10px]">
                                {row.Qty ? `Qty: ${row.Qty} ${row.Satuan}` : `Role: ${row.Role} (${row.LokasiKode})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-28 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-center p-4 text-center">
                          <p className="text-[10px] text-slate-450 font-medium">Belum ada file diunggah. Unggah file simulasi di sebelah kiri untuk melihat baris yang di-parse.</p>
                        </div>
                      )}
                    </div>

                    {excelPreviewRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleCommitBulkImportPreview(excelPreviewRows[0].Qty ? 'inventory' : 'employees')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase"
                      >
                        Setujui &amp; Commit {excelPreviewRows.length} Rows ke Live DB
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
