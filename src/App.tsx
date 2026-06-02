/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Factory,
  Users,
  Database,
  Truck,
  Flame,
  Award,
  PackageCheck,
  TrendingUp,
  DollarSign,
  ClipboardList,
  ShieldCheck,
  Wrench,
  CheckCircle,
  Bell,
  Settings,
  LogIn,
  Sliders,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  UserPlus,
  RefreshCw,
  Search,
  Printer,
  ChevronLeft
} from 'lucide-react';

// Subcomponents
import Dashboards from './components/Dashboards';
import TrackingAndCOGS from './components/TrackingAndCOGS';
import SidebarForms from './components/SidebarForms';
import LoginScreen from './components/LoginScreen';

// Seed Database
import {
  SEED_FRUIT_VARIANTS,
  SEED_CHIP_VARIANTS,
  SEED_LOKASI,
  SEED_USERS,
  SEED_PENDING_USERS,
  SEED_KARYAWAN,
  SEED_SUPPLIER,
  SEED_CUSTOMER,
  SEED_PRODUK,
  SEED_BOM,
  SEED_MESIN,
  SEED_PO,
  SEED_PENERIMAAN,
  SEED_BATCH,
  SEED_PENGUPASAN_LOGS,
  SEED_PEMBEKUAN_LOGS,
  SEED_VACUUM_FRYING_LOGS,
  SEED_QC_LOGS,
  SEED_PENGEMASAN_LOGS,
  INITIAL_STOCKS,
  SEED_STOCK_OPNAME,
  SEED_PETTY_CASH,
  SEED_PENJUALAN,
  SEED_COGS_BATCH,
  SEED_MAINTENANCE_LOGS,
  SEED_COMPLIANCE_LOGS,
  SEED_NOTIFIKASI,
  SEED_AUDIT_LOGS
} from './initialData';

export default function App() {
  // Global State
  const [lokasi, setLokasi] = useState<any[]>(SEED_LOKASI);
  const [currentUser, setCurrentUser] = useState<any>(SEED_USERS[0]); // Default to HQ Executive (Richard P)
  const [selectedLokasi, setSelectedLokasi] = useState<string>('JKT'); // Malang HQ
  const activeBranchName = lokasi.find(l => l.id === selectedLokasi)?.nama || 'Semua Cabang';

  // Authentication & Dynamic RBAC States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Starts logged in for seamless review helper
  
  const [rolePermissions, setRolePermissions] = useState<{[key: string]: string[]}>({
    'Super Admin': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'Kepala Pabrik HQ': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'Direktur HQ': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'Director': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'HQ Admin': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'HQ Production': ['dashboard', 'master', 'produksi', 'inventory', 'quality', 'maintenance'],
    'HQ Finance': ['dashboard', 'cogs', 'payroll', 'finance'],
    'Finance HQ': ['dashboard', 'cogs', 'payroll', 'finance'],
    'Finance': ['dashboard', 'cogs', 'payroll', 'finance'],
    'Branch Manager': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'Kepala Pabrik Cabang': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
    'Branch Admin': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'sales', 'delivery'],
    'Branch Finance': ['dashboard', 'payroll', 'finance', 'sales'],
    'Finance Admin': ['dashboard', 'payroll', 'finance', 'sales'],
    'QC': ['dashboard', 'produksi', 'quality'],
    'Warehouse': ['dashboard', 'inventory', 'pengadaan'],
    'Purchasing': ['dashboard', 'pengadaan', 'master'],
    'HR & Procurement': ['dashboard', 'master', 'pengadaan', 'payroll'],
    'Production Operator': ['dashboard', 'produksi'],
    'Operator Kupas': ['dashboard', 'produksi'],
    'Kupas': ['dashboard', 'produksi'],
    'Peeling Operator': ['dashboard', 'produksi'],
    'Operator': ['dashboard', 'produksi'],
    'Operator Kemas': ['dashboard', 'produksi'],
    'Kemas': ['dashboard', 'produksi'],
    'Packaging Operator': ['dashboard', 'produksi'],
    'Sales': ['dashboard', 'sales']
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingPenerimaan, setEditingPenerimaan] = useState<any | null>(null);
  const [isAddingPenerimaan, setIsAddingPenerimaan] = useState<boolean>(false);
  
  const [rcvSupplierId, setRcvSupplierId] = useState<string>('SUP-01');
  const [rcvJenisBahan, setRcvJenisBahan] = useState<string>('Apel Segar');
  const [rcvGrade, setRcvGrade] = useState<'A' | 'B' | 'C'>('A');
  const [rcvBerat, setRcvBerat] = useState<number>(100);
  const [rcvHarga, setRcvHarga] = useState<number>(12000);
  const [rcvPic, setRcvPic] = useState<string>('Budi Santoso');
  const [rcvNotaUrl, setRcvNotaUrl] = useState<string>('nota_order_23.jpg');
  const [rcvFotoUrl, setRcvFotoUrl] = useState<string>('apel_grade_a.jpg');
  const [rcvNotes, setRcvNotes] = useState<string>('Diterima dengan keadaan baik, boks bersih');
  
  // Opname & Pemusnahan States
  const [soItemKey, setSoItemKey] = useState<string>('Apel Segar');
  const [soStokSistem, setSoStokSistem] = useState<number>(100);
  const [soStokFisik, setSoStokFisik] = useState<number>(95);
  const [soAlasan, setSoAlasan] = useState<string>('Susut alamiah menguap');

  const [destFruitKey, setDestFruitKey] = useState<string>('Apel Keripik Jadi (Unpacked)');
  const [destWeight, setDestWeight] = useState<number>(10);
  const [destReason, setDestReason] = useState<string>('Melempem & berjamur karena boks bocor');
  // Surat Jalan states
  const [showingSiId, setShowingSiId] = useState<string | null>(null);
  const [editingSiId, setEditingSiId] = useState<string | null>(null);
  const [siNumberInput, setSiNumberInput] = useState<string>('');
  const [siExpeditionInput, setSiExpeditionInput] = useState<string>('CV Lintas Kargo');
  const [siDriverInput, setSiDriverInput] = useState<string>('Slamet Rahardjo');
  const [siPlatInput, setSiPlatInput] = useState<string>('N 1493 AX');
  
  const [editUserModel, setEditUserModel] = useState<any>({
    username: '',
    namaLengkap: '',
    role: 'Production Operator',
    lokasiId: 'JKT',
    status: 'active',
    password: ''
  });

  const [users, setUsers] = useState<any[]>(() => {
    // Inject a hashed password mapping on seed users if not already present
    return SEED_USERS.map(u => ({
      ...u,
      passwordHash: u.passwordHash || 'hash_1184cbb' // prehashed 'pabrik123'
    }));
  });
  const [pendingUsers, setPendingUsers] = useState<any[]>(SEED_PENDING_USERS);
  const [karyawan, setKaryawan] = useState<any[]>(SEED_KARYAWAN);
  const [supplier, setSupplier] = useState<any[]>(SEED_SUPPLIER);
  const [customer, setCustomer] = useState<any[]>(SEED_CUSTOMER);
  const [produk, setProduk] = useState<any[]>(SEED_PRODUK);
  const [fruitVariants, setFruitVariants] = useState<any[]>(SEED_FRUIT_VARIANTS);
  const [chipVariants, setChipVariants] = useState<any[]>(SEED_CHIP_VARIANTS);

  // Fruit Variants UI States
  const [tempFruit, setTempFruit] = useState<any>({ id: '', nama: '', category: 'Fruit', status: 'Active', notes: '' });
  const [editingFruitId, setEditingFruitId] = useState<string | null>(null);
  const [fruitSearchQuery, setFruitSearchQuery] = useState('');
  const [fruitCategoryFilter, setFruitCategoryFilter] = useState('');
  const [fruitStatusFilter, setFruitStatusFilter] = useState('');

  // Chip Variants UI States
  const [tempChip, setTempChip] = useState<any>({ id: '', nama: '', fruitVariantId: '', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: '' });
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [chipSearchQuery, setChipSearchQuery] = useState('');
  const [chipFruitFilter, setChipFruitFilter] = useState('');
  const [chipStatusFilter, setChipStatusFilter] = useState('');
  const [bom, setBom] = useState<any[]>(SEED_BOM);
  const [mesin, setMesin] = useState<any[]>(SEED_MESIN);
  
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(SEED_PO);
  const [penerimaan, setPenerimaan] = useState<any[]>(SEED_PENERIMAAN);
  const [batches, setBatches] = useState<any[]>(SEED_BATCH);
  const [peelingLogs, setPeelingLogs] = useState<any[]>(SEED_PENGUPASAN_LOGS);
  const [freezingLogs, setFreezingLogs] = useState<any[]>(SEED_PEMBEKUAN_LOGS);
  const [fryingLogs, setFryingLogs] = useState<any[]>(SEED_VACUUM_FRYING_LOGS);
  const [qcLogs, setQcLogs] = useState<any[]>(SEED_QC_LOGS);
  const [packingLogs, setPackingLogs] = useState<any[]>(SEED_PENGEMASAN_LOGS);
  const [stocks, setStocks] = useState<any[]>(INITIAL_STOCKS);
  const [stockOpname, setStockOpname] = useState<any[]>(SEED_STOCK_OPNAME);
  const [pettyCash, setPettyCash] = useState<any[]>(SEED_PETTY_CASH);
  const [sales, setSales] = useState<any[]>(SEED_PENJUALAN);
  const [cogsBatch, setCogsBatch] = useState<any[]>(SEED_COGS_BATCH);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>(SEED_MAINTENANCE_LOGS);
  const [complianceLogs, setComplianceLogs] = useState<any[]>(SEED_COMPLIANCE_LOGS);
  const [notifications, setNotifications] = useState<any[]>(SEED_NOTIFIKASI);
  const [auditLogs, setAuditLogs] = useState<any[]>(SEED_AUDIT_LOGS);

  // Helper activity logger
  const logActivity = (modul: string, msg: string) => {
    const newLog = {
      id: 'LOG-' + (auditLogs.length + 1000 + Date.now() % 10000),
      tanggal: new Date().toLocaleString('id-ID'),
      modul,
      username: currentUser ? currentUser.username : 'system',
      deskripsi: msg
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  };

  // Synchronize employee to user accounts (AUTO USER ACCOUNT GENERATION)
  useEffect(() => {
    setUsers(prevUsers => {
      let updated = [...prevUsers];
      let changed = false;

      karyawan.forEach(k => {
        const isKActive = k.status === 'Aktif' || k.status === 'Active' || !k.status;
        const userId = `USR-EMP-${k.id}`;
        
        // Find existing user linked to this employee
        const existingIdx = updated.findIndex(u => u.id === userId);

        if (isKActive) {
          if (existingIdx === -1) {
            // Automatically generate username & account
            const rawUsername = k.nama.toLowerCase().replace(/[^a-z0-9]/g, '_');
            // Check for duplicate username
            let finalUsername = rawUsername;
            let counter = 1;
            while (updated.some(u => u.username === finalUsername && u.id !== userId)) {
              finalUsername = `${rawUsername}_${counter}`;
              counter++;
            }

            updated.push({
              id: userId,
              username: finalUsername,
              role: k.role,
              lokasiId: k.lokasiId,
              status: 'active',
              namaLengkap: k.nama,
              department: k.department || 'Production',
              passwordHash: 'hash_1184cbb', // prehashed 'pabrik123'
              isAutomated: true
            });
            changed = true;
          } else {
            // Match role and lokasi, but preserve username/status since admin might change them
            const existing = updated[existingIdx];
            if (
              existing.role !== k.role ||
              existing.lokasiId !== k.lokasiId ||
              existing.namaLengkap !== k.nama
            ) {
              updated[existingIdx] = {
                ...existing,
                role: k.role,
                lokasiId: k.lokasiId,
                namaLengkap: k.nama
              };
              changed = true;
            }
          }
        } else {
          // Employee non-active - disable associated user account
          if (existingIdx !== -1 && updated[existingIdx].status === 'active') {
            updated[existingIdx] = {
              ...updated[existingIdx],
              status: 'inactive'
            };
            changed = true;
          }
        }
      });

      return changed ? updated : prevUsers;
    });
  }, [karyawan]);

  // Force isolated users to their assigned lokasiId
  useEffect(() => {
    if (currentUser) {
      const isIsolated = ![
        'Super Admin',
        'Kepala Pabrik HQ',
        'Direktur HQ',
        'Director',
        'HQ Finance',
        'Finance HQ',
        'Finance',
        'HQ Production',
        'HQ Production Manager',
        'HR & Procurement',
        'HR & Procurement Manager',
        'Purchasing',
        'HQ Admin'
      ].includes(currentUser.role);
      
      if (isIsolated && selectedLokasi !== currentUser.lokasiId) {
        setSelectedLokasi(currentUser.lokasiId);
      }
    }
  }, [currentUser, selectedLokasi]);

  const isMenuAllowed = (role: string, menuId: string) => {
    if (role === 'Super Admin' || role === 'Kepala Pabrik HQ' || role === 'Direktur HQ' || role === 'Director') return true;
    if (menuId === 'session' || menuId === 'signup') return true;
    
    // Find item to check its group
    const item = sidebarItems.find(i => i.id === menuId);
    if (!item) return true; // non-sidebar views are always accessible
    if (item.group === 'akun') return true; // anyone can access akun parameters like session/matrix
    
    const allowedGroups = rolePermissions[role] || ['dashboard'];
    return allowedGroups.includes(item.group);
  };

  // Editing and dynamic creation states
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingLokasiId, setEditingLokasiId] = useState<string | null>(null);
  const [editingKaryawanId, setEditingKaryawanId] = useState<string | null>(null);
  const [editKaryawanModel, setEditKaryawanModel] = useState<any>({ 
    nama: '', nik: '', role: 'Kupas', tarifDasar: 1500, tarifInsentif: 300, targetHarian: 40, status: 'Aktif', lokasiId: 'JKT', gajiBulanan: 0 
  });
  const [tempLokasi, setTempLokasi] = useState<any>({ nama: '', alamat: '', kode: '', tipe: 'Production Factory', status: 'Active' });
  const [selectedBatchDetail, setSelectedBatchDetail] = useState<any | null>(null);

  // Search filter and tab navigations
  const [activeMenu, setActiveMenu] = useState<string>('dashboard-utama');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [collapsedGroup, setCollapsedGroup] = useState<{ [key: string]: boolean }>({
    dashboard: false,
    akun: true,
    master: true,
    pengadaan: true,
    produksi: true,
    inventory: true,
    cogs: true,
    sales: true,
    payroll: true,
    finance: true,
    quality: true,
    maintenance: true,
  });

  // Master Data Add Modals
  const [tempKaryawan, setTempKaryawan] = useState({ nama: '', nik: '', role: 'Kupas', tarifDasar: 1500, targetHarian: 40 });
  const [tempSupplier, setTempSupplier] = useState({ 
    nama: '', telepon: '', alamat: '', jenisBahan: 'Apel', namaBank: 'BCA', nomorRekening: '', pemilikRekening: '', koordinatLahan: '-7.8712, 112.5268' 
  });
  const [tempCustomer, setTempCustomer] = useState({ 
    nama: '', alamat: '', telepon: '', tipe: 'OEM', komisi: 2, customBrand: 'AGRIDEA', customSize: 'Standard Pouch', customGramasi: 100, customVarian: 'Apel' 
  });
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [tempSku, setTempSku] = useState({
    sku: '',
    nama: '',
    brand: 'AGRIDEA',
    varian: 'Apel',
    gramasi: 100,
    jenisKemasan: 'Standing Pouch',
    hargaJualStandar: 18000,
    hppStandar: 11200,
    barcode: '',
    version: '1.0',
    status: 'Active',
    bakuKg: 1.2,
    minyakLiter: 0.15,
    lpgKg: 0.20
  });
  const [tempPO, setTempPO] = useState({ 
    supplierId: SEED_SUPPLIER[0]?.id || '', 
    item: 'Apel Segar', 
    qty: 500, 
    qtyPcs: 1000, 
    grade: 'A',
    pricePerKg: 12000,
    pricePerPiece: 1000,
    shippingCost: 250000,
    procurementType: 'by-weight' as 'by-weight' | 'by-piece'
  });
  const [editingMesinId, setEditingMesinId] = useState<string | null>(null);
  const [tempMesin, setTempMesin] = useState({
    nama: '',
    tipe: 'Vacuum Frying',
    locationsId: 'JKT',
    kapasitas: '50 kg/batch',
    status: 'Operational'
  });

  // Sales Transaction Form States
  const [salCust, setSalCust] = useState('CUST-01');
  const [salSku, setSalSku] = useState('PRD-01');
  const [salBatch, setSalBatch] = useState('BATCH-APL-001');
  const [salQty, setSalQty] = useState(150);
  const [salPrice, setSalPrice] = useState(18000);

  // New User Account Form State
  const [newUserModel, setNewUserModel] = useState({ username: '', password: '', namaLengkap: '', role: 'Production Operator', lokasiId: 'JKT' });

  // Central helper to adjust stock - defined at App level so JSX handlers can access it too
  const adjustStockInner = (currentStocks: any[], itemKey: string, val: number, unit: string = 'kg') => {
    const exists = currentStocks.some(s => s.key === itemKey && s.lokasiId === selectedLokasi);
    if (exists) {
      return currentStocks.map(s => {
        if (s.key === itemKey && s.lokasiId === selectedLokasi) {
          return { ...s, qty: Math.max(0, s.qty + val) };
        }
        return s;
      });
    } else {
      let kategori = 'Bahan Baku';
      if (itemKey.includes('Kupas') || itemKey.includes('Frozen') || itemKey.includes('Unpacked') || itemKey.includes('Jadi')) {
        kategori = 'WIP';
      } else if (itemKey.includes('Box') || itemKey.includes('Pouch') || itemKey.includes('Lakban')) {
        kategori = 'Bahan Penolong';
      }
      return [
        ...currentStocks,
        { key: itemKey, kategori, qty: Math.max(0, val), lokasiId: selectedLokasi, unit }
      ];
    }
  };

  // Simulate real-time actions from forms
  const handleActionCallback = (actionType: string, payload: any) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const logId = 'ACT-' + Math.floor(Math.random() * 10000);
    const textBatchId = 'BATCH-APL-003'; // Ongoing frying/peeling apple batch

    // Log the audit trial
    setAuditLogs(prev => [
      { id: 'AD-' + Date.now(), userId: currentUser.id, username: currentUser.username, tanggal: new Date().toISOString(), modul: actionType, deskripsi: `Input data ${actionType} baru oleh ${currentUser.username}` },
      ...prev
    ]);

    if (actionType === 'PENERIMAAN') {
      const newRec: any = {
        id: 'RCV-' + (penerimaan.length + 1001 + (Date.now() % 1000)),
        poId: payload.poId || 'PO-' + Math.floor(Math.random() * 100 + 100),
        lokasiId: selectedLokasi,
        tanggal: payload.tanggal || timestamp,
        supplierId: payload.supplierId,
        jenisBahan: payload.jenisBahan,
        beratDiterimaKg: payload.beratDiterimaKg,
        hargaPerKg: payload.hargaPerKg,
        totalHarga: payload.beratDiterimaKg * payload.hargaPerKg,
        grade: payload.grade,
        asalBahan: payload.asalBahan || 'Malang',
        picId: currentUser.id,
        picPenerima: payload.picPenerima || 'Satpam Pos 1',
        notaUrl: payload.notaUrl || 'nota_empty.jpg',
        fotoBarangUrl: payload.fotoBarangUrl || 'barang_empty.jpg',
        keteranganTambahan: payload.keteranganTambahan || 'Diterima aman'
      };
      setPenerimaan(prev => [newRec, ...prev]);

      // Increase raw material stock
      setStocks(prev => adjustStockInner(prev, payload.jenisBahan, payload.beratDiterimaKg));
    }

    if (actionType === 'PEELING') {
      const newPeel: any = {
        id: 'PL-' + Date.now(),
        batchId: textBatchId,
        lokasiId: selectedLokasi,
        tanggal: timestamp,
        karyawanId: payload.karyawanId,
        bahanMasukKg: payload.bahanMasukKg,
        hasilKupasKg: payload.hasilKupasKg,
        rejectKg: payload.rejectKg,
        jamKerja: payload.jamKerja,
        targetHarian: 40,
        yieldPercent: Math.round((payload.hasilKupasKg / payload.bahanMasukKg) * 100),
        rejectRatePercent: Math.round((payload.rejectKg / payload.bahanMasukKg) * 100),
        gajiDihasilkan: (payload.hasilKupasKg * 1500) + (payload.hasilKupasKg > 40 ? (payload.hasilKupasKg - 40) * 300 : 0),
        insentifDiterima: payload.hasilKupasKg > 40 ? Math.round((payload.hasilKupasKg - 40) * 300) : 0
      };
      setPeelingLogs(prev => [newPeel, ...prev]);

      // Consume Raw Fruit and increase Kupas WIP
      setStocks(prev => {
        let after = adjustStockInner(prev, payload.jenisBahan, -payload.bahanMasukKg);
        const kupasKey = payload.jenisBahan.replace(' Segar', '') + ' Kupas';
        after = adjustStockInner(after, kupasKey, payload.hasilKupasKg);
        return after;
      });

      if (newPeel.yieldPercent < 60) {
        setNotifications(prev => [
          { id: 'NOT-' + Date.now(), jenisAlert: 'Yield rendah', lokasiId: selectedLokasi, pesan: `Peringatan: Yield kupas harian di bawah target oleh ${currentUser.username} (${newPeel.yieldPercent}%)`, tanggal: timestamp, dibaca: false, prioritas: 'Tinggi' },
          ...prev
        ]);
      }
    }

    if (actionType === 'FREEZING') {
      const outQty = payload.beratKupasMasuk; // Automatic matching of inputs!
      const newFrz = {
        id: 'FL-' + Date.now(),
        batchId: textBatchId,
        lokasiId: selectedLokasi,
        tanggal: timestamp,
        beratKupasMasuk: payload.beratKupasMasuk,
        beratFrozenOutput: outQty,
        pic: payload.pic || 'Ahmad',
        fruitType: payload.fruitType || 'Apel',
        shift: payload.shift || 'Pagi'
      };
      setFreezingLogs(prev => [newFrz, ...prev]);

      // Move fruit from Kupas to Frozen
      setStocks(prev => {
        const kupasKey = payload.fruitType + ' Kupas';
        const frozenKey = payload.fruitType + ' Frozen';
        let after = adjustStockInner(prev, kupasKey, -payload.beratKupasMasuk);
        after = adjustStockInner(after, frozenKey, outQty);
        return after;
      });
    }

    if (actionType === 'FRYING') {
      const newFryLog = {
        id: 'VFL-' + Date.now(),
        batchId: textBatchId,
        lokasiId: selectedLokasi,
        tanggal: timestamp,
        operatorId: payload.operatorId,
        mesinId: payload.mesinId,
        beratFrozenMasukKg: payload.beratFrozenMasukKg,
        beratHasilKeripikKg: payload.beratHasilKeripikKg,
        minyakDigunakanLiter: payload.lpgDigunakanKg ? 4 : 0, // standard deduction
        volumeMinyakSebelumGoreng: payload.volumeMinyakSebelumGoreng,
        lpgDigunakanKg: payload.lpgDigunakanKg,
        cycleCount: payload.cycleCount,
        shift: payload.shift,
        parameterMesin: {
          suhuCelcius: payload.suhu,
          tekananVacuumKpa: payload.pressure,
          waktuMenit: payload.waktu,
          jamMulaiGoreng: payload.jamMulaiGoreng,
          jamAduk: payload.jamAduk,
          jamPenirisan: payload.jamPenirisan,
          jamAngkat: payload.jamAngkat,
          waktuPembersihan: payload.waktuPembersihan
        },
        gajiOperator: payload.cycleCount * 25000,
        jenisBuah: payload.jenisBuah
      };
      setFryingLogs(prev => [newFryLog, ...prev]);

      // Deduct frozen chips, minyak and LPG, increase unpacked chips
      setStocks(prev => {
        const frozenKey = payload.jenisBuah + ' Frozen';
        const unpackedKey = payload.jenisBuah + ' Keripik Jadi (Unpacked)';
        let after = adjustStockInner(prev, frozenKey, -payload.beratFrozenMasukKg);
        after = adjustStockInner(after, 'Minyak Goreng Sawit (Litre)', -newFryLog.minyakDigunakanLiter);
        after = adjustStockInner(after, unpackedKey, payload.beratHasilKeripikKg);
        return after;
      });
    }

    if (actionType === 'QC') {
      const newQc = {
        id: 'QCL-' + Date.now(),
        batchId: textBatchId,
        lokasiId: selectedLokasi,
        tanggal: timestamp,
        qcId: payload.qcId,
        beratMasukKg: payload.beratMasukKg,
        hasilGradeAKg: payload.hasilGradeA,
        hasilGradeBKg: payload.hasilGradeB,
        hasilGradeCKg: payload.hasilGradeC,
        rejectKg: payload.rejectKg,
        alasanReject: payload.alasanReject,
        status: 'Passed',
        jenisVarianBuah: payload.jenisVarianBuah,
        hasilLolosQcKg: payload.hasilLolosQcKg
      };
      setQcLogs(prev => [newQc, ...prev]);

      // Increase verified unpacked stock inside the warehouse direct
      setStocks(prev => {
        const unpackedKey = payload.jenisVarianBuah + ' Keripik Jadi (Unpacked)';
        return adjustStockInner(prev, unpackedKey, payload.hasilLolosQcKg);
      });
    }

    if (actionType === 'PACKAGING') {
      const targetSku = state.produk.find((p: any) => p.id === payload.produkId);
      const newPack = {
        id: 'PGL-' + Date.now(),
        batchId: textBatchId,
        produkId: payload.produkId,
        lokasiId: selectedLokasi,
        tanggal: timestamp,
        karyawanId: payload.karyawanId,
        beratMasukKeripikKg: payload.beratMasukKeripikKg,
        beratTerkemasKg: payload.beratTerkemasKg,
        remahanKg: payload.remahanKg,
        totalPcsDihasilkan: payload.totalPcsDihasilkan,
        targetPcsHarian: 300,
        jamKerja: payload.jamKerja,
        pouchDigunakan: payload.qtyKemasanBrand || payload.pouchDigunakan,
        boxDigunakan: payload.qtyKardus || payload.boxDigunakan,
        qtyLakban: payload.qtyLakban || 0,
        isMixed: payload.isMixed || false,
        compositions: payload.compositions || {},
        gajiKemas: (payload.jamKerja * 15000) + (payload.totalPcsDihasilkan > 300 ? (payload.totalPcsDihasilkan - 300) * 50 : 0)
      };
      setPackingLogs(prev => [newPack, ...prev]);

      // Deduct unpacked chips (split if mixed, single fruit variant if not mixed), increase finished pouch SKU count
      setStocks(prev => {
        let after = [...prev];
        if (payload.isMixed && payload.compositions) {
          if (Array.isArray(payload.compositions)) {
            // New dynamic arrays compositions
            payload.compositions.forEach((comp: any) => {
              const chipVar = chipVariants.find((cv: any) => cv.id === comp.chipVariantId);
              const pct = comp.percentage || 0;
              if (chipVar && pct > 0) {
                const compWeight = (pct * payload.beratMasukKeripikKg) / 100;
                after = adjustStockInner(after, chipVar.nama, -compWeight);
              }
            });
          } else {
            // Legacy / object compatibility fallback
            Object.keys(payload.compositions).forEach(fruitName => {
              const pct = payload.compositions[fruitName] || 0;
              if (pct > 0) {
                const compWeight = (pct * payload.beratMasukKeripikKg) / 100;
                const unpackedKey = fruitName + ' Keripik Jadi (Unpacked)';
                after = adjustStockInner(after, unpackedKey, -compWeight);
              }
            });
          }
        } else {
          // Single SKU variant deduction
          const matchedChip = chipVariants.find((cv: any) => {
            const labelLower = cv.nama.toLowerCase();
            const skuLower = targetSku?.nama?.toLowerCase() || '';
            const skuVarianLower = targetSku?.varian?.toLowerCase() || '';
            return labelLower.includes(skuVarianLower) || skuLower.includes(labelLower);
          });
          
          if (matchedChip) {
            after = adjustStockInner(after, matchedChip.nama, -payload.beratMasukKeripikKg);
          } else {
            // Fallback to legacy structure
            let fruitType = 'Apel';
            if (targetSku?.nama.includes('Nangka')) fruitType = 'Nangka';
            else if (targetSku?.nama.includes('Pisang')) fruitType = 'Pisang';
            else if (targetSku?.nama.includes('Salak')) fruitType = 'Salak';
            const unpackedKey = fruitType + ' Keripik Jadi (Unpacked)';
            after = adjustStockInner(after, unpackedKey, -payload.beratMasukKeripikKg);
          }
        }

        // Add finished packaged product
        if (targetSku) {
          after = adjustStockInner(after, targetSku.sku, payload.totalPcsDihasilkan, 'pcs');
        }

        // Reduce supporting materials
        after = adjustStockInner(after, 'Standing Pouch 100g (Pcs)', -(payload.qtyKemasanBrand || payload.totalPcsDihasilkan), 'pcs');
        after = adjustStockInner(after, 'Karton Box Agridea (Pcs)', -(payload.qtyKardus || 10), 'pcs');
        // Subtract tape as well!
        after = adjustStockInner(after, 'Lakban Packing (Meter / Roll)', -parseFloat(payload.qtyLakban || 0), 'pcs');

        return after;
      });
    }

    if (actionType === 'SALES') {
      const totalAmount = payload.qtyPcs * payload.hargaSatuan;
      const targetSku = state.produk.find((p: any) => p.id === payload.produkId);
      const newSales = {
        id: 'TX-' + Date.now(),
        notaNumber: 'INV/2026/06/' + Math.floor(Math.random() * 1000),
        customerId: payload.customerId,
        lokasiId: selectedLokasi,
        tanggal: timestamp,
        statusPengiriman: 'Dispatched',
        items: [
          { produkId: payload.produkId, batchId: payload.batchId, qtyPcs: payload.qtyPcs, hargaSatuan: payload.hargaSatuan, totalHarga: totalAmount, hppSatuan: targetSku?.hppStandar || 11200 }
        ],
        komisiSales: Math.round(totalAmount * 0.02),
        totalPenjualan: totalAmount,
        totalInvoice: totalAmount,
        suratJalanNumber: 'SJ/' + (selectedLokasi === 'JKT' ? 'MLG' : 'BTU') + '/20260601-' + Math.floor(Math.random() * 90 + 10)
      };
      setSales(prev => [newSales, ...prev]);

      // Decrease finished goods Pouch SKU stock
      setStocks(prev => prev.map(s => {
        if (s.key === targetSku?.sku && s.lokasiId === selectedLokasi) {
          return { ...s, qty: Math.max(0, s.qty - payload.qtyPcs) };
        }
        return s;
      }));
    }

    if (actionType === 'PETTYCASH') {
      const newCash = {
        id: 'PC-' + Date.now(),
        tanggal: timestamp,
        lokasiId: selectedLokasi,
        kategori: payload.kategori,
        deskripsi: payload.deskripsi,
        tipe: payload.tipe,
        jumlah: payload.jumlah,
        masukHPP: payload.masukHPP,
        status: 'Approved'
      };
      setPettyCash(prev => [newCash, ...prev]);
    }
  };

  // State packaging wrapper to feed components
  const state = {
    lokasi,
    users,
    karyawan,
    supplier,
    customer,
    produk,
    fruitVariants,
    chipVariants,
    bom,
    mesin,
    purchaseOrders,
    penerimaan,
    batches,
    peelingLogs,
    freezingLogs,
    fryingLogs,
    qcLogs,
    packingLogs,
    stocks,
    stockOpname,
    pettyCash,
    sales,
    cogsBatch,
    maintenanceLogs,
    complianceLogs,
    notifications,
    auditLogs
  };

  // Helper sidebar collapsing
  const toggleGroup = (group: string) => {
    setCollapsedGroup(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Menu lists
  const sidebarItems = [
    { id: 'dashboard-utama', label: 'Dashboard Utama', group: 'dashboard', icon: Sliders },
    { id: 'dashboard-produksi', label: 'Dashboard Produksi', group: 'dashboard', icon: Factory },
    { id: 'dashboard-inventory', label: 'Dashboard Inventory', group: 'dashboard', icon: Database },
    { id: 'dashboard-sales', label: 'Dashboard Sales', group: 'dashboard', icon: TrendingUp },
    { id: 'dashboard-payroll', label: 'Dashboard Payroll', group: 'dashboard', icon: Users },
    { id: 'dashboard-cogs', label: 'Dashboard COGS & HPP', group: 'dashboard', icon: DollarSign },
    { id: 'dashboard-hq', label: 'Dashboard HQ (Multi-Branch)', group: 'dashboard', icon: Sliders },
    
    { id: 'session', label: 'Sign In / Session (Role)', group: 'akun', icon: LogIn },
    { id: 'signup', label: 'Sign Up / Approval', group: 'akun', icon: UserPlus },
    { id: 'users-list', label: 'Daftar Akun Pengguna', group: 'akun', icon: Users },
    { id: 'roles', label: 'Role & Permission Matrix', group: 'akun', icon: ShieldCheck },
    { id: 'audit', label: 'Session & Activity Log', group: 'akun', icon: ClipboardList },

    { id: 'master-karyawan', label: 'Karyawan / Personel', group: 'master', icon: Users },
    { id: 'master-supplier', label: 'Mitra Supplier', group: 'master', icon: Truck },
    { id: 'master-customer', label: 'Toko / Customer', group: 'master', icon: PackageCheck },
    { id: 'master-fruit-variants', label: 'Master Fruit Variants', group: 'master', icon: Award },
    { id: 'master-chip-variants', label: 'Master Chip Variants', group: 'master', icon: Database },
    { id: 'master-sku', label: 'Produk / SKU & BOM', group: 'master', icon: Database },
    { id: 'master-mesin', label: 'Mesin Vacuum Frying', group: 'master', icon: Wrench },
    { id: 'master-lokasi', label: 'Master Factory Locations', group: 'master', icon: Factory },

    { id: 'pengadaan-po', label: 'Purchase Order / Pesanan', group: 'pengadaan', icon: Truck },
    { id: 'pengadaan-penerimaan', label: 'Penerimaan Bahan Baku', group: 'pengadaan', icon: CheckCircle },

    { id: 'input-produksi', label: 'Input Form Produksi', group: 'produksi', icon: Plus },
    { id: 'batch-history', label: 'History Batch Produksi', group: 'produksi', icon: ClipboardList },

    { id: 'inventory-stock', label: 'Real-time Stock Tracker', group: 'inventory', icon: Database },
    { id: 'inventory-opname', label: 'Stock Opname & Adjs', group: 'inventory', icon: Sliders },

    { id: 'cogs-component', label: 'COGS Standar vs Batch', group: 'cogs', icon: DollarSign },
    { id: 'cogs-simulation', label: 'Simulasi Margin & Harga', group: 'cogs', icon: Sliders },

    { id: 'sales-penjualan', label: 'Input Penjualan Toko', group: 'sales', icon: Plus },
    { id: 'sales-suratjalan', label: 'Surat Jalan Digital', group: 'sales', icon: Truck },
    { id: 'sales-batch-trace', label: 'Batches End-to-End Trace', group: 'sales', icon: ClipboardList },

    { id: 'payroll-kalkulasi', label: 'Kalkulasi Gaji Borongan', group: 'payroll', icon: Users },
    { id: 'payroll-slips', label: 'Download Slip Gaji', group: 'payroll', icon: ClipboardList },

    { id: 'finance-cashbook', label: 'Petty Cash Ledger', group: 'finance', icon: DollarSign },

    { id: 'quality-compliance', label: 'Quality & Food Safety Audits', group: 'quality', icon: ShieldCheck },
    { id: 'maintenance-sched', label: 'Jadwal & Biaya Maintenance', group: 'maintenance', icon: Wrench }
  ];

  if (!isLoggedIn) {
    return (
      <LoginScreen
        users={users}
        setUsers={setUsers}
        pendingUsers={pendingUsers}
        setPendingUsers={setPendingUsers}
        lokasi={lokasi}
        onLogin={(user) => {
          setCurrentUser(user);
          setSelectedLokasi(user.lokasiId);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" id="app-layout">
      {/* Dynamic Sidenav Sidebar */}
      <aside className="w-[280px] bg-slate-900 text-slate-350 flex flex-col border-r border-slate-800 shrink-0 select-none overflow-y-auto" id="app-sidebar">
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <h1 className="text-lg font-bold tracking-tight text-emerald-400 font-display">Agridea Manufacturing</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Control App</p>
        </div>

        <nav className="flex-1 p-4 space-y-3.5 text-xs font-medium">
          {/* Group 1: Dashboards */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('dashboard')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">1. Dashboard &amp; Analisis</span>
              {collapsedGroup.dashboard ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.dashboard && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'dashboard' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 2: Akun & Cabang */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('akun')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">2. Akun &amp; Cabang</span>
              {collapsedGroup.akun ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.akun && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'akun' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 3: Master Data */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('master')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">3. Master Data</span>
              {collapsedGroup.master ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.master && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'master' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 4: Pengadaan & Supplier */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('pengadaan')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">4. Pengadaan</span>
              {collapsedGroup.pengadaan ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.pengadaan && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'pengadaan' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 5: Produksi Harian */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('produksi')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">5. Produksi Inti</span>
              {collapsedGroup.produksi ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.produksi && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'produksi' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 6: Inventory */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('inventory')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">6. Inventory Tracker</span>
              {collapsedGroup.inventory ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.inventory && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'inventory' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 7: COGS / HPP */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('cogs')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">7. COGS / HPP</span>
              {collapsedGroup.cogs ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.cogs && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'cogs' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 8: Sales */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('sales')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">8. Sales &amp; Tracing</span>
              {collapsedGroup.sales ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.sales && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => i.group === 'sales' && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 9: Payroll & Finance */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('payroll')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">9. Payroll &amp; Keuangan</span>
              {collapsedGroup.payroll ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.payroll && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => (i.group === 'payroll' || i.group === 'finance') && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group 10: Quality & Maintenance */}
          <div className="space-y-1">
            <button onClick={() => toggleGroup('quality')} className="flex items-center justify-between w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-500">10. Compliance &amp; Servis</span>
              {collapsedGroup.quality ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>
            {!collapsedGroup.quality && (
              <div className="pl-1.5 mt-1 space-y-1 border-l border-slate-800/80 ml-2">
                {sidebarItems.filter(i => (i.group === 'quality' || i.group === 'maintenance') && isMenuAllowed(currentUser.role, i.id)).map(item => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 ${activeMenu === item.id ? 'bg-slate-800 text-emerald-400 border-l-[3px] border-emerald-400 font-semibold shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-300'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content-window">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 select-none shadow-xs" id="app-header">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Factory className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lokasi Pabrik:</span>
            </span>
            <select
              id="branch-context-dropdown"
              value={selectedLokasi}
              onChange={(e) => {
                const isIsolated = ![
                  'Super Admin',
                  'Kepala Pabrik HQ',
                  'Direktur HQ',
                  'Director',
                  'HQ Finance',
                  'Finance HQ',
                  'Finance',
                  'HQ Production',
                  'HQ Production Manager',
                  'HR & Procurement',
                  'HR & Procurement Manager',
                  'Purchasing',
                  'HQ Admin'
                ].includes(currentUser.role);
                if (!isIsolated) {
                  setSelectedLokasi(e.target.value);
                }
              }}
              disabled={![
                'Super Admin',
                'Kepala Pabrik HQ',
                'Direktur HQ',
                'Director',
                'HQ Finance',
                'Finance HQ',
                'Finance',
                'HQ Production',
                'HQ Production Manager',
                'HR & Procurement',
                'HR & Procurement Manager',
                'Purchasing',
                'HQ Admin'
              ].includes(currentUser.role)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-lg px-3 py-2 outline-none hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-sans disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {lokasi
                .filter(l => {
                  const isIsolated = ![
                    'Super Admin',
                    'Kepala Pabrik HQ',
                    'Direktur HQ',
                    'Director',
                    'HQ Finance',
                    'Finance HQ',
                    'Finance',
                    'HQ Production',
                    'HQ Production Manager',
                    'HR & Procurement',
                    'HR & Procurement Manager',
                    'Purchasing',
                    'HQ Admin'
                  ].includes(currentUser.role);
                  return !isIsolated || l.id === currentUser.lokasiId;
                })
                .map(l => (
                  <option key={l.id} value={l.id}>{l.nama}</option>
                ))}
            </select>
          </div>

          <div className="flex items-center space-x-6">
            {/* Simulation Notification icon in header */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveMenu('audit')}>
              <Bell className="w-5 h-5 text-slate-500 hover:text-slate-800" />
              {notifications.filter(n => !n.dibaca).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-4 h-4 text-[9px] font-bold text-center flex items-center justify-center font-mono">
                  {notifications.filter(n => !n.dibaca).length}
                </span>
              )}
            </div>

            {/* Profile Dropdown context */}
            <div className="h-6 border-r border-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center font-bold text-sm font-display">
                {currentUser.namaLengkap.charAt(0)}
              </div>
              <div className="text-left text-xs select-none">
                <span className="font-semibold text-slate-900 block leading-tight">{currentUser.namaLengkap}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">{currentUser.role}</span>
              </div>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  localStorage.removeItem('agridea_logged_in');
                  logActivity('Auth', `Karyawan @${currentUser.username} (${currentUser.namaLengkap}) logged out.`);
                }}
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition ml-2 cursor-pointer border border-slate-200"
                title="Keluar dari sesi"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Inner Content Viewer */}
        <main className="flex-1 p-6 overflow-y-auto" id="app-screen-content">
          {/* Load Dashboards components directly */}
          {activeMenu.startsWith('dashboard-') && (
            <div className="animate-fade-in text-xs">
              <Dashboards state={state} selectedLokasi={selectedLokasi} onNavigate={setActiveMenu} activeMenu={activeMenu} />
            </div>
          )}

          {/* ===================== SIGN IN / SESSION VIEW ===================== */}
          {activeMenu === 'session' && (
            <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="screen-session">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-1">
                <LogIn className="w-4 h-4 text-emerald-600" /> Simulasi Role-Based Access (Multi-User)
              </h3>
              <p className="text-slate-500">
                Pabrik Agridea mendukung perolehan izin menu terisolasi untuk Operator, QC, Kasir, hingga Kepala Pabrik HQ. Ganti penyamaran login Anda di bawah:
              </p>
              
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Pilih Akun Login Simulasi</label>
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = users.find(user => user.id === e.target.value);
                    if (u) {
                      setCurrentUser(u);
                      setSelectedLokasi(u.lokasiId);
                    }
                  }}
                  className="bg-slate-50 border w-full rounded p-2.5 font-bold text-slate-800"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.namaLengkap} ({u.role}) - {SEED_LOKASI.find(l => l.id === u.lokasiId)?.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50 border rounded text-slate-900 leading-normal">
                🔑 <span className="font-bold">Informasi Sesi Aktif:</span>
                <p className="mt-1 font-mono text-[10px]">User ID: {currentUser.id}</p>
                <p className="font-mono text-[10px]">Role: {currentUser.role}</p>
                <p className="font-mono text-[10px]">Izin Menu: Full Admin Access</p>
              </div>
            </div>
          )}

          {/* ===================== SIGN UP / APPROVAL ===================== */}
          {activeMenu === 'signup' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="screen-signup">
              <h3 className="font-semibold text-slate-900 text-sm border-b pb-2">Approval User Baru & Antrean Registrasi</h3>
              <p className="text-slate-500">Pekerja baru dapat mendaftar aplikasi via mobile web dan menunggu otorisasi persetujuan Direktur HQ.</p>

              {pendingUsers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{u.namaLengkap}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Role: {u.role} | Cabang ID: {u.lokasiId}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setUsers(prev => [...prev, { ...u, status: 'active' }]);
                            setPendingUsers(prev => prev.filter(p => p.id !== u.id));
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-3 rounded text-[10px]"
                        >
                          Approve (Aktifkan)
                        </button>
                        <button
                          onClick={() => setPendingUsers(prev => prev.filter(p => p.id !== u.id))}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1 px-3 rounded text-[10px]"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-slate-50 border text-center text-slate-400 italic">
                  Tidak ada permohonan registrasi user baru yang tertunda.
                </div>
              )}
            </div>
          )}

          {/* ===================== DATA PENGGUNA / USER MANAGEMENT ===================== */}
          {activeMenu === 'users-list' && (
            <div className="space-y-6 animate-fade-in text-xs" id="screen-users-list">
              
              {/* EDIT USER SUB-PANEL */}
              {editingUserId && (
                <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                    <h4 className="font-bold text-amber-950 text-sm">✏️ Edit Akun Pengguna: @{editUserModel.oldUsername || editUserModel.username} (ID: {editingUserId})</h4>
                    <button 
                      onClick={() => setEditingUserId(null)} 
                      className="text-amber-700 hover:text-rose-800 font-bold cursor-pointer underline text-[10px]"
                    >
                      Batal [X]
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setUsers(prev => prev.map(u => {
                      if (u.id === editingUserId) {
                        const updated = {
                          ...u,
                          username: editUserModel.username.trim(),
                          namaLengkap: editUserModel.namaLengkap,
                          role: editUserModel.role,
                          lokasiId: editUserModel.lokasiId,
                          status: editUserModel.status === 'active' ? 'active' : 'inactive'
                        };
                        // If password was filled, hash it
                        if (editUserModel.password && editUserModel.password.trim()) {
                          updated.passwordHash = simpleHash(editUserModel.password.trim());
                        }
                        return updated;
                      }
                      return u;
                    }));
                    logActivity('Self Management', `Mengupdate data akun untuk user @${editUserModel.username}.`);
                    setEditingUserId(null);
                  }} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div>
                      <label className="font-bold block mb-1 text-slate-700">Username</label>
                      <input 
                        type="text" 
                        value={editUserModel.username} 
                        onChange={(e) => setEditUserModel({...editUserModel, username: e.target.value})} 
                        className="bg-white border text-xs focus:ring-emerald-500 rounded p-1.5 w-full outline-none font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={editUserModel.namaLengkap} 
                        onChange={(e) => setEditUserModel({...editUserModel, namaLengkap: e.target.value})} 
                        className="bg-white border text-xs focus:ring-emerald-500 rounded p-1.5 w-full outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700">Role Jabatan</label>
                      <select 
                        value={editUserModel.role} 
                        onChange={(e) => setEditUserModel({...editUserModel, role: e.target.value})} 
                        className="bg-white border text-xs rounded p-1.5 w-full outline-none cursor-pointer"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Direktur HQ">HQ Director (Direktur HQ)</option>
                        <option value="Director">Director</option>
                        <option value="HQ Admin">HQ Admin</option>
                        <option value="HQ Production">HQ Production</option>
                        <option value="HQ Finance">HQ Finance</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Branch Admin">Branch Admin</option>
                        <option value="Branch Finance">Branch Finance</option>
                        <option value="QC">QC Inspector</option>
                        <option value="Warehouse">Warehouse Staff</option>
                        <option value="Purchasing">Purchasing Staff</option>
                        <option value="Production Operator">Production Operator</option>
                        <option value="Packaging Operator">Packaging Operator</option>
                        <option value="HR & Procurement">HR & Procurement</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700">Lokasi Penugasan</label>
                      <select 
                        value={editUserModel.lokasiId} 
                        onChange={(e) => setEditUserModel({...editUserModel, lokasiId: e.target.value})} 
                        className="bg-white border text-xs rounded p-1.5 w-full outline-none cursor-pointer"
                      >
                        {lokasi.map(l => (
                          <option key={l.id} value={l.id}>{l.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700">Status Akun</label>
                      <select 
                        value={editUserModel.status} 
                        onChange={(e) => setEditUserModel({...editUserModel, status: e.target.value})} 
                        className="bg-white border text-xs rounded p-1.5 w-full outline-none cursor-pointer"
                      >
                        <option value="active">Active (Diberi Izin)</option>
                        <option value="inactive">Inactive (Diblokir)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-705">Reset Pass (Opsional)</label>
                      <input 
                        type="password" 
                        value={editUserModel.password} 
                        placeholder="Ubah password" 
                        onChange={(e) => setEditUserModel({...editUserModel, password: e.target.value})} 
                        className="bg-white border text-xs focus:ring-emerald-500 rounded p-1.5 w-full outline-none"
                      />
                    </div>
                    <div className="md:col-span-6 flex justify-end">
                      <button 
                        type="submit" 
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-2 px-4 rounded cursor-pointer transition shadow-sm text-xs font-sans"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5 text-slate-950">
                  🛡️ Manajemen Akun Pengguna &amp; Sistem
                </h3>
                <p className="text-slate-500">Mendaftarkan, mengedit, mengaktifkan/menonaktifkan, atau mereset password akun staff, operator, tim QC, dan manager cabang:</p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newUserModel.username || !newUserModel.namaLengkap) return;
                    
                    const nextId = 'USR-' + (users.length + 100);
                    const newAcc = {
                      id: nextId,
                      username: newUserModel.username.trim(),
                      passwordHash: simpleHash(newUserModel.password || 'pabrik123'),
                      namaLengkap: newUserModel.namaLengkap.trim(),
                      role: newUserModel.role,
                      lokasiId: newUserModel.lokasiId,
                      status: 'active'
                    };
                    
                    setUsers(prev => [...prev, newAcc]);
                    logActivity('Self Management', `Mendaftarkan akun pengguna baru @${newAcc.username} dengan hak akses ${newAcc.role}.`);
                    setNewUserModel({ username: '', password: '', namaLengkap: '', role: 'Production Operator', lokasiId: 'JKT' });
                  }}
                  className="bg-slate-50 p-4 rounded-xl border space-y-3.5"
                  id="create-system-account-form"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Username</label>
                      <input
                        type="text"
                        value={newUserModel.username}
                        onChange={(e) => setNewUserModel({ ...newUserModel, username: e.target.value })}
                        className="bg-white border text-xs focus:ring-emerald-500 rounded p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                        placeholder="e.g. buditjandra"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Nama Lengkap</label>
                      <input
                        type="text"
                        value={newUserModel.namaLengkap}
                        onChange={(e) => setNewUserModel({ ...newUserModel, namaLengkap: e.target.value })}
                        className="bg-white border text-xs focus:ring-emerald-500 rounded p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                        placeholder="e.g. Budi Tjandra"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Password</label>
                      <input
                        type="password"
                        value={newUserModel.password || ''}
                        onChange={(e) => setNewUserModel({ ...newUserModel, password: e.target.value })}
                        className="bg-white border text-xs focus:ring-emerald-500 rounded p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                        placeholder="Password default: pabrik123"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Role Sistem</label>
                      <select
                        value={newUserModel.role}
                        onChange={(e) => setNewUserModel({ ...newUserModel, role: e.target.value })}
                        className="bg-white border text-xs border-slate-200 rounded p-2 w-full font-sans cursor-pointer focus:border-emerald-500"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Direktur HQ">HQ Director (Direktur HQ)</option>
                        <option value="HQ Admin">HQ Admin</option>
                        <option value="HQ Production">HQ Production</option>
                        <option value="HQ Finance">HQ Finance</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Branch Admin">Branch Admin</option>
                        <option value="Branch Finance">Branch Finance</option>
                        <option value="QC">QC Inspector</option>
                        <option value="Warehouse">Warehouse Staff</option>
                        <option value="Purchasing">Purchasing Staff</option>
                        <option value="Production Operator">Production Operator</option>
                        <option value="Packaging Operator">Packaging Operator</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Lokasi / Cabang Tugas</label>
                      <select
                        value={newUserModel.lokasiId}
                        onChange={(e) => setNewUserModel({ ...newUserModel, lokasiId: e.target.value })}
                        className="bg-white border text-xs border-slate-200 rounded p-2 w-full font-sans cursor-pointer focus:border-emerald-500"
                      >
                        {lokasi.map(l => (
                          <option key={l.id} value={l.id}>{l.nama} ({l.kota})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-slate-950 text-white font-bold p-2 px-4 rounded-lg hover:bg-slate-800 transition cursor-pointer shadow-xs font-sans text-xs animate-none"
                        id="submit-new-account-btn"
                      >
                        Daftarkan Akun Baru
                      </button>
                    </div>
                  </div>
                </form>

                {/* Table of Users */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono">
                        <th className="py-2.5 px-3">ID User</th>
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">Jabatan / Role</th>
                        <th className="py-2.5 px-3">Tugas Cabang</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => {
                        const isUserActive = u.status === 'active' || u.status === 'Active';
                        return (
                          <tr key={u.id} className="hover:bg-slate-50 font-mono text-[11px]">
                            <td className="py-2.5 px-3 font-bold text-slate-500">{u.id}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800 font-sans">@{u.username}</td>
                            <td className="py-2.5 px-3 text-slate-900 font-sans font-semibold">{u.namaLengkap}</td>
                            <td className="py-2.5 px-3 font-sans">
                              <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px] font-sans">{u.role}</span>
                            </td>
                            <td className="py-2.5 px-3 font-sans font-semibold text-indigo-700">
                              {lokasi.find(l => l.id === u.lokasiId)?.nama || u.lokasiId}
                            </td>
                            <td className="py-2.5 px-3">
                              {isUserActive ? (
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase font-sans">ACTIVE</span>
                              ) : (
                                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase font-sans">BLOCKED</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-sans space-x-2">
                              <button
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setEditUserModel({
                                    username: u.username,
                                    namaLengkap: u.namaLengkap,
                                    role: u.role,
                                    lokasiId: u.lokasiId,
                                    status: isUserActive ? 'active' : 'inactive',
                                    password: ''
                                  });
                                }}
                                className="text-amber-600 hover:text-amber-900 font-bold hover:underline text-[10px] cursor-pointer"
                              >
                                Edit / Reset
                              </button>
                              <button
                                onClick={() => {
                                  setUsers(prev => prev.map(usr => {
                                    if (usr.id === u.id) {
                                      const nextStatus = isUserActive ? 'inactive' : 'active';
                                      logActivity('Self Management', `Mengubah status user @${u.username} menjadi ${nextStatus}.`);
                                      return { ...usr, status: nextStatus };
                                    }
                                    return usr;
                                  }));
                                }}
                                className="text-slate-500 hover:text-slate-800 font-bold hover:underline text-[10px] cursor-pointer"
                              >
                                {isUserActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus user @${u.username}?`)) {
                                    setUsers(prev => prev.filter(usr => usr.id !== u.id));
                                    logActivity('Self Management', `Mendelete / menghapus akun @${u.username} secara permanen.`);
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-900 font-bold hover:underline text-[10px] cursor-pointer"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== ROLE & PERMISSION MATRIX ===================== */}
          {activeMenu === 'roles' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="screen-roles">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">🛡️ Interactive Role &amp; Permission Access Matrix</h3>
                  <p className="text-slate-500 mt-0.5">Memetakan dan mengedit hak akses menu (kelompok fitur) secara dinamis bagi {Object.keys(rolePermissions).length} jabatan operasional.</p>
                </div>
                <button
                  onClick={() => {
                    // Reset to complete security defaults
                    setRolePermissions({
                      'Super Admin': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'Kepala Pabrik HQ': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'Direktur HQ': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'Director': ['dashboard', 'akun', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'HQ Admin': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'HQ Production': ['dashboard', 'master', 'produksi', 'inventory', 'quality', 'maintenance'],
                      'HQ Finance': ['dashboard', 'cogs', 'payroll', 'finance'],
                      'Finance HQ': ['dashboard', 'cogs', 'payroll', 'finance'],
                      'Finance': ['dashboard', 'cogs', 'payroll', 'finance'],
                      'Branch Manager': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'Kepala Pabrik Cabang': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'],
                      'Branch Admin': ['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'sales', 'delivery'],
                      'Branch Finance': ['dashboard', 'payroll', 'finance', 'sales'],
                      'Finance Admin': ['dashboard', 'payroll', 'finance', 'sales'],
                      'QC': ['dashboard', 'produksi', 'quality'],
                      'Warehouse': ['dashboard', 'inventory', 'pengadaan'],
                      'Purchasing': ['dashboard', 'pengadaan', 'master'],
                      'HR & Procurement': ['dashboard', 'master', 'pengadaan', 'payroll'],
                      'Production Operator': ['dashboard', 'produksi'],
                      'Operator Kupas': ['dashboard', 'produksi'],
                      'Kupas': ['dashboard', 'produksi'],
                      'Peeling Operator': ['dashboard', 'produksi'],
                      'Operator': ['dashboard', 'produksi'],
                      'Operator Kemas': ['dashboard', 'produksi'],
                      'Kemas': ['dashboard', 'produksi'],
                      'Packaging Operator': ['dashboard', 'produksi'],
                      'Sales': ['dashboard', 'sales']
                    });
                    logActivity('Security Configuration', 'Mereset matriks otorisasi ke pengaturan default.');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1.5 px-3 rounded text-[10px] cursor-pointer"
                >
                  Reset ke Default
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono">
                      <th className="py-2.5 px-3">Role / Jabatan Sistem</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Dashboard</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Master</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">PO / Pengadaan</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Produksi</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Inventory</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">COGS</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Sales</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Payroll</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Fin Cash</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Quality</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-sans">Maint.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.keys(rolePermissions).map(role => {
                      const allowedGroups = rolePermissions[role] || [];
                      const isReadOnly = role === 'Super Admin' || role === 'Direktur HQ';
                      
                      const togglePermissionGroup = (group: string) => {
                        if (isReadOnly) return;
                        
                        setRolePermissions(prev => {
                          const updatedAllowed = prev[role].includes(group)
                            ? prev[role].filter(g => g !== group)
                            : [...prev[role], group];
                            
                          const next = { ...prev, [role]: updatedAllowed };
                          logActivity('Security Configuration', `Merubah hak akses kelompok fitur [${group}] untuk role: ${role}.`);
                          return next;
                        });
                      };
                      
                      return (
                        <tr key={role} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">
                            <span>{role}</span>
                            {isReadOnly && <span className="ml-1.5 text-[8px] bg-indigo-100 text-indigo-800 px-1 py-0.2 rounded font-sans uppercase">Full Access</span>}
                          </td>
                          {['dashboard', 'master', 'pengadaan', 'produksi', 'inventory', 'cogs', 'sales', 'payroll', 'finance', 'quality', 'maintenance'].map(group => {
                            const hasAccess = allowedGroups.includes(group);
                            return (
                              <td key={group} className="py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasAccess}
                                  disabled={isReadOnly}
                                  onChange={() => togglePermissionGroup(group)}
                                  className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 flex gap-2">
                <span>💡</span>
                <p><strong>Cara Penggunaan:</strong> Anda dapat mencentang atau mengosongkan kotak persetujuan modul di atas untuk merubah izin akses menu secara real-time. Role "Super Admin" dan "Direktur HQ" memiliki otorisasi penuh mutlak (selalu memiliki akses ke semua menu).</p>
              </div>
            </div>
          )}

          {/* ===================== AUDIT LOG SCREEN ===================== */}
          {activeMenu === 'audit' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="screen-audit">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-slate-700" /> Session Activity & Security Logs
              </h3>
              <p className="text-slate-500">Merekam jejak mutasi database secara kronologis untuk audit keselamatan rantai pangan:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                      <th className="py-2 px-3">Waktu Log</th>
                      <th className="py-2 px-3">Modul</th>
                      <th className="py-2 px-3">Karyawan / Akun</th>
                      <th className="py-2 px-3">Aktivitas Terlacak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-500">{log.tanggal}</td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-700">{log.modul}</td>
                        <td className="py-2.5 px-3 text-slate-900">@{log.username}</td>
                        <td className="py-2.5 px-3 text-slate-700">{log.deskripsi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== MASTER DATA KARYAWAN ===================== */}
          {activeMenu === 'master-karyawan' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="screen-master-karyawan">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Master Data Pekerja &amp; Rekayasa Tarif Upah</h3>
                  <p className="text-slate-500 mt-0.5">Mengelola database pekerja, divisi pabrik, lokasi tugas, and skema insentif borongan vs gaji bulanan.</p>
                </div>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">{karyawan.length} Terdaftar</span>
              </div>

              {/* EDIT EMPLOYEE / WAGE MODAL */}
              {editingKaryawanId && (
                <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl space-y-4 text-xs animate-fade-in">
                  <div className="flex justify-between items-center border-b border-indigo-150 pb-2">
                    <h4 className="font-bold text-indigo-900 text-sm">✏️ Rekayasa Data &amp; Tarif Upah Karyawan: {editKaryawanModel.nama}</h4>
                    <button 
                      onClick={() => setEditingKaryawanId(null)} 
                      className="text-slate-500 hover:text-slate-900 font-bold hover:underline cursor-pointer text-[10px]"
                    >
                      Batal [X]
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setKaryawan(prev => prev.map(k => {
                      if (k.id === editingKaryawanId) {
                        return {
                          ...k,
                          nama: editKaryawanModel.nama.trim(),
                          nik: editKaryawanModel.nik.trim(),
                          role: editKaryawanModel.role,
                          tarifDasar: Number(editKaryawanModel.tarifDasar),
                          tarifInsentif: Number(editKaryawanModel.tarifInsentif),
                          targetHarian: Number(editKaryawanModel.targetHarian),
                          lokasiId: editKaryawanModel.lokasiId,
                          status: editKaryawanModel.status,
                          gajiBulanan: Number(editKaryawanModel.gajiBulanan || 0)
                        };
                      }
                      return k;
                    }));
                    logActivity('Self Management', `Mengupdate data karyawan & tarif upah untuk ${editKaryawanModel.nama} (${editKaryawanModel.role}).`);
                    setEditingKaryawanId(null);
                  }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={editKaryawanModel.nama} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, nama: e.target.value})} 
                        className="bg-white border rounded p-2 w-full outline-none" required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">NIK (KTP)</label>
                      <input 
                        type="text" 
                        value={editKaryawanModel.nik} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, nik: e.target.value})} 
                        className="bg-white border rounded p-2 w-full outline-none font-mono" required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Role Divisi Pekerjaan</label>
                      <select 
                        value={editKaryawanModel.role} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, role: e.target.value})} 
                        className="bg-white border rounded p-2 w-full cursor-pointer outline-none"
                      >
                        <option value="Kupas">Pekerja Kupas (Borongan per Kg)</option>
                        <option value="Frying">Operator Vacuum Frying (Harian + Siklus)</option>
                        <option value="Kemas">Pekerja Kemas SKU (Borongan per Pcs)</option>
                        <option value="Branch Manager">Branch Manager (Gaji Bulanan)</option>
                        <option value="Branch Admin">Branch Admin (Gaji Bulanan)</option>
                        <option value="Branch Finance">Branch Finance (Gaji Bulanan)</option>
                        <option value="HQ Staff">HQ Staff (Gaji Bulanan)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Lokasi Penugasan</label>
                      <select 
                        value={editKaryawanModel.lokasiId} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, lokasiId: e.target.value})} 
                        className="bg-white border rounded p-2 w-full cursor-pointer outline-none"
                      >
                        {lokasi.map(l => (
                          <option key={l.id} value={l.id}>{l.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Tarif Dasar / Harian (Rp)</label>
                      <input 
                        type="number" 
                        value={editKaryawanModel.tarifDasar} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, tarifDasar: e.target.value})} 
                        className="bg-white border rounded p-2 w-full font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Tarif Insentif (Kupas/Siklus) (Rp)</label>
                      <input 
                        type="number" 
                        value={editKaryawanModel.tarifInsentif} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, tarifInsentif: e.target.value})} 
                        className="bg-white border rounded p-2 w-full font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Gaji Pokok Bulanan (Tetap) (Rp)</label>
                      <input 
                        type="number" 
                        value={editKaryawanModel.gajiBulanan || 0} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, gajiBulanan: e.target.value})} 
                        className="bg-white border rounded p-2 w-full font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700">Status Pekerja</label>
                      <select 
                        value={editKaryawanModel.status || 'Aktif'} 
                        onChange={(e) => setEditKaryawanModel({...editKaryawanModel, status: e.target.value})} 
                        className="bg-white border rounded p-2 w-full cursor-pointer outline-none"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif (Suspend)</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex justify-end space-x-2 pt-2">
                      <button 
                        type="submit" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 px-6 rounded cursor-pointer transition shadow-sm text-xs font-sans"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Add form */}
              <div className="bg-slate-50 p-4 border rounded-xl gap-3 grid grid-cols-1 md:grid-cols-5 items-end">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                  <input type="text" value={tempKaryawan.nama} onChange={(e) => setTempKaryawan({ ...tempKaryawan, nama: e.target.value })} className="bg-white border text-xs focus:ring-emerald-500 rounded p-1.5 w-full font-sans outline-none" placeholder="Eka Susanti" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIK (KTP)</label>
                  <input type="text" value={tempKaryawan.nik} onChange={(e) => setTempKaryawan({ ...tempKaryawan, nik: e.target.value })} className="bg-white border text-xs focus:ring-emerald-500 rounded p-1.5 w-full font-mono outline-none" placeholder="350701980001" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role Divisi Pekerjaan</label>
                  <select value={tempKaryawan.role} onChange={(e) => setTempKaryawan({ ...tempKaryawan, role: e.target.value as any })} className="bg-white border text-xs rounded p-1.5 w-full cursor-pointer outline-none">
                    <option value="Kupas">Pekerja Kupas (Borongan per Kg)</option>
                    <option value="Frying">Operator Vacuum Frying (Harian + Siklus)</option>
                    <option value="Kemas">Pekerja Kemas SKU (Borongan per Pcs)</option>
                    <option value="Branch Manager">Branch Manager (Gaji Bulanan)</option>
                    <option value="Branch Admin">Branch Admin (Gaji Bulanan)</option>
                    <option value="Branch Finance">Branch Finance (Gaji Bulanan)</option>
                    <option value="HQ Staff">HQ Staff (Gaji Bulanan)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tarif atau Gaji (Rp)</label>
                  <input type="number" value={tempKaryawan.tarifDasar} onChange={(e) => setTempKaryawan({ ...tempKaryawan, tarifDasar: parseInt(e.target.value) || 0 })} className="bg-white border text-xs focus:ring-emerald-500 rounded p-1.5 w-full outline-none" />
                </div>
                <button
                  onClick={() => {
                    if (!tempKaryawan.nama) return;
                    const nextId = 'K-' + (karyawan.length + 101);
                    const isSalaryRole = ['Branch Manager', 'Branch Admin', 'Branch Finance', 'HQ Staff'].includes(tempKaryawan.role);
                    
                    setKaryawan(prev => [...prev, {
                      id: nextId,
                      nama: tempKaryawan.nama.trim(),
                      nik: tempKaryawan.nik.trim(),
                      role: tempKaryawan.role,
                      tarifDasar: isSalaryRole ? 0 : tempKaryawan.tarifDasar,
                      tarifInsentif: tempKaryawan.role === 'Kupas' ? 300 : tempKaryawan.role === 'Frying' ? 5000 : 50,
                      targetHarian: 40,
                      lokasiId: selectedLokasi,
                      status: 'Aktif',
                      gajiBulanan: isSalaryRole ? tempKaryawan.tarifDasar : 0
                    }]);
                    logActivity('Self Management', `Mendaftarkan karyawan baru bernama ${tempKaryawan.nama} sebagai ${tempKaryawan.role}.`);
                    setTempKaryawan({ nama: '', nik: '', role: 'Kupas', tarifDasar: 1500, targetHarian: 40 });
                  }}
                  className="bg-slate-950 text-white font-bold p-1.5 px-4 rounded w-full hover:bg-slate-800 cursor-pointer text-xs"
                >
                  Daftarkan Pekerja
                </button>
              </div>

              {/* Grid or Table display */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">NIK</th>
                      <th className="py-2.5 px-3">Divisi Pekerjaan</th>
                      <th className="py-2.5 px-3">Tugas Factory</th>
                      <th className="py-2.5 px-3 text-right">Tarif Dasar / Harian</th>
                      <th className="py-2.5 px-3 text-right">Gaji Tetap Bulanan</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {karyawan.map(k => {
                      const isKaryawanActive = k.status !== 'Nonaktif';
                      return (
                        <tr key={k.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{k.nama}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{k.nik || '-'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-850 rounded font-bold capitalize font-sans">
                              {k.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-indigo-700 font-sans">
                            {lokasi.find(l => l.id === k.lokasiId)?.nama || 'HQ'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold">
                            {k.tarifDasar > 0 ? `Rp ${k.tarifDasar.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                            {k.gajiBulanan && k.gajiBulanan > 0 ? `Rp ${k.gajiBulanan.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isKaryawanActive ? (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">AKTIF</span>
                            ) : (
                              <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded uppercase">NONAKTIF</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-2 font-semibold">
                            <button
                              onClick={() => {
                                setEditingKaryawanId(k.id);
                                setEditKaryawanModel({
                                  nama: k.nama,
                                  nik: k.nik || '',
                                  role: k.role,
                                  tarifDasar: k.tarifDasar,
                                  tarifInsentif: k.tarifInsentif || 0,
                                  targetHarian: k.targetHarian || 40,
                                  status: k.status || 'Aktif',
                                  lokasiId: k.lokasiId || 'JKT',
                                  gajiBulanan: k.gajiBulanan || 0
                                });
                              }}
                              className="text-indigo-600 hover:text-indigo-900 hover:underline cursor-pointer text-[10px]"
                            >
                              Edit / Upah
                            </button>
                            <button
                              onClick={() => {
                                setKaryawan(prev => prev.map(item => {
                                  if (item.id === k.id) {
                                    const nextStatus = isKaryawanActive ? 'Nonaktif' : 'Aktif';
                                    logActivity('Self Management', `Mengubah status karyawan ${k.nama} menjadi ${nextStatus}.`);
                                    return { ...item, status: nextStatus };
                                  }
                                  return item;
                                }));
                              }}
                              className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer text-[10px]"
                            >
                              {isKaryawanActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data karyawan ${k.nama} secara permanen?`)) {
                                  setKaryawan(prev => prev.filter(item => item.id !== k.id));
                                  logActivity('Self Management', `Menghapus karyawan ${k.nama} dari sistem.`);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-900 hover:underline cursor-pointer text-[10px]"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== MASTER SKU & BOM ===================== */}
          {activeMenu === 'master-sku' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs animate-fade-in" id="screen-master-sku">
              <div>
                <h3 className="font-bold text-slate-900 text-sm border-b pb-2 mb-3">Daftar Produk / SKU &amp; standardisasi BOM</h3>
                <p className="text-slate-500">Definisi Bill of Materials (BOM) standar per gramasi pouch untuk analisis HPP ideal sebelum proses goreng berjalan:</p>
              </div>

              {/* REGISTER / EDIT FORM */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    ⚙️ {editingSkuId ? 'Edit Spesifikasi SKU & Standard Formula BOM' : 'Registrasi SKU Baru & Formula BOM Pokok'}
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Kode SKU</label>
                      <input 
                        type="text" 
                        value={tempSku.sku} 
                        onChange={(e) => setTempSku({ ...tempSku, sku: e.target.value.toUpperCase() })} 
                        className="bg-white border rounded p-1.5 text-xs w-full font-mono font-bold uppercase" 
                        placeholder="AGR-APL-120"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Nama Produk Jadi</label>
                      <input 
                        type="text" 
                        value={tempSku.nama} 
                        onChange={(e) => setTempSku({ ...tempSku, nama: e.target.value })} 
                        className="bg-white border rounded p-1.5 text-xs w-full" 
                        placeholder="Keripik Apel Premium 120g"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Brand Label</label>
                      <input 
                        type="text" 
                        value={tempSku.brand} 
                        onChange={(e) => setTempSku({ ...tempSku, brand: e.target.value.toUpperCase() })} 
                        className="bg-white border rounded p-1.5 text-xs w-full uppercase" 
                        placeholder="AGRIDEA"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Varian Buah</label>
                      <select 
                        value={tempSku.varian} 
                        onChange={(e) => setTempSku({ ...tempSku, varian: e.target.value })} 
                        className="bg-white border rounded p-1.5 text-xs w-full cursor-pointer"
                      >
                        <option value="Apel">Apel</option>
                        <option value="Pisang">Pisang</option>
                        <option value="Nangka">Nangka</option>
                        <option value="Salak">Salak</option>
                        <option value="Mix">Mix Fruits</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Netto (Gramasi)</label>
                      <input 
                        type="number" 
                        value={tempSku.gramasi} 
                        onChange={(e) => setTempSku({ ...tempSku, gramasi: Number(e.target.value) })} 
                        className="bg-white border rounded p-1.5 text-xs w-full font-mono" 
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Barcode EAN-13</label>
                      <input 
                        type="text" 
                        value={tempSku.barcode} 
                        onChange={(e) => setTempSku({ ...tempSku, barcode: e.target.value })} 
                        className="bg-white border rounded p-1.5 text-xs w-full font-mono" 
                        placeholder="899123495001"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Versi Formula BOM</label>
                      <input 
                        type="text" 
                        value={tempSku.version} 
                        onChange={(e) => setTempSku({ ...tempSku, version: e.target.value })} 
                        className="bg-white border rounded p-1.5 text-xs w-full font-mono" 
                        placeholder="v1.0"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 text-[10px]">Status SKU</label>
                      <select 
                        value={tempSku.status} 
                        onChange={(e) => setTempSku({ ...tempSku, status: e.target.value })} 
                        className="bg-white border rounded p-1.5 text-xs w-full cursor-pointer"
                      >
                        <option value="Active">Active (Aktif di Produksi)</option>
                        <option value="Inactive">Inactive (Arsip / Legacy)</option>
                      </select>
                    </div>
                  </div>

                  {/* Standard BOM Inputs per single pouch package */}
                  <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/70 space-y-2">
                    <span className="font-bold text-indigo-950 text-[10px] uppercase tracking-wide block">⚖️ Standardisasi Konsumsi Bahan (BOM per single pouch):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Bahan Baku Segar (Kg)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={tempSku.bakuKg} 
                          onChange={(e) => setTempSku({ ...tempSku, bakuKg: Number(e.target.value) })}
                          className="w-full bg-white border rounded p-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Minyak Goreng Sawit (Ltr)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={tempSku.minyakLiter} 
                          onChange={(e) => setTempSku({ ...tempSku, minyakLiter: Number(e.target.value) })}
                          className="w-full bg-white border rounded p-1 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">LPG Boiler (Kg)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={tempSku.lpgKg} 
                          onChange={(e) => setTempSku({ ...tempSku, lpgKg: Number(e.target.value) })}
                          className="w-full bg-white border rounded p-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 pt-2">
                    {editingSkuId ? (
                      <>
                        <button
                          onClick={() => {
                            if (!tempSku.sku || !tempSku.nama) return;
                            setProduk(prev => prev.map(p => {
                              if (p.id === editingSkuId) {
                                return {
                                  ...p,
                                  sku: tempSku.sku.trim(),
                                  nama: tempSku.nama.trim(),
                                  brand: tempSku.brand.trim(),
                                  varian: tempSku.varian,
                                  gramasi: tempSku.gramasi,
                                  barcode: tempSku.barcode.trim(),
                                  jenisKemasan: tempSku.jenisKemasan,
                                  version: tempSku.version || '1.0',
                                  status: tempSku.status
                                };
                              }
                              return p;
                            }));
                            setBom(prev => prev.map(b => {
                              if (b.produkId === editingSkuId) {
                                return {
                                  ...b,
                                  bahanBakuKg: tempSku.bakuKg,
                                  minyakLiter: tempSku.minyakLiter,
                                  lpgKg: tempSku.lpgKg
                                };
                              }
                              return b;
                            }));
                            logActivity('Master Data', `Mengupdate SKU ${tempSku.sku} dan formula BOM pendukung.`);
                            setEditingSkuId(null);
                            setTempSku({ sku: '', nama: '', brand: 'AGRIDEA', varian: 'Apel', gramasi: 100, jenisKemasan: 'Standing Pouch', hargaJualStandar: 18000, hppStandar: 11200, barcode: '', version: '1.0', status: 'Active', bakuKg: 1.2, minyakLiter: 0.15, lpgKg: 0.20 });
                          }}
                          className="bg-emerald-600 text-white font-bold px-4 py-1.5 rounded hover:bg-emerald-500 cursor-pointer text-xs shadow-xs"
                        >
                          Simpan SKU &amp; BOM
                        </button>
                        <button
                          onClick={() => {
                            setEditingSkuId(null);
                            setTempSku({ sku: '', nama: '', brand: 'AGRIDEA', varian: 'Apel', gramasi: 100, jenisKemasan: 'Standing Pouch', hargaJualStandar: 18000, hppStandar: 11200, barcode: '', version: '1.0', status: 'Active', bakuKg: 1.2, minyakLiter: 0.15, lpgKg: 0.20 });
                          }}
                          className="bg-slate-200 text-slate-700 font-bold px-4 py-1.5 rounded hover:bg-slate-300 cursor-pointer text-xs"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (!tempSku.sku || !tempSku.nama) return;
                          const nextId = 'PRD-' + (produk.length + 101);
                          setProduk(prev => [...prev, {
                            id: nextId,
                            sku: tempSku.sku.trim(),
                            nama: tempSku.nama.trim(),
                            brand: tempSku.brand.trim(),
                            varian: tempSku.varian,
                            gramasi: tempSku.gramasi,
                            barcode: tempSku.barcode.trim() || '899' + Math.floor(1000000000 + Math.random() * 9000000000),
                            jenisKemasan: tempSku.jenisKemasan,
                            hargaJualStandar: tempSku.hargaJualStandar,
                            hppStandar: tempSku.hppStandar,
                            version: tempSku.version || '1.0',
                            status: tempSku.status
                          }]);
                          setBom(prev => [...prev, {
                            id: 'BOM-' + (bom.length + 101),
                            produkId: nextId,
                            bahanBakuKg: tempSku.bakuKg,
                            minyakLiter: tempSku.minyakLiter,
                            lpgKg: tempSku.lpgKg,
                            kemasanPcs: 1,
                            outerBoxFraction: 0.0417
                          }]);
                          logActivity('Master Data', `Mendaftarkan SKU baru ${tempSku.sku} dengan versi BOM ${tempSku.version}.`);
                          setTempSku({ sku: '', nama: '', brand: 'AGRIDEA', varian: 'Apel', gramasi: 100, jenisKemasan: 'Standing Pouch', hargaJualStandar: 18000, hppStandar: 11200, barcode: '', version: '1.0', status: 'Active', bakuKg: 1.2, minyakLiter: 0.15, lpgKg: 0.20 });
                        }}
                        className="bg-slate-950 text-white font-bold px-4 py-1.5 rounded hover:bg-slate-800 cursor-pointer text-xs shadow-xs"
                      >
                        Register SKU &amp; BOM Baru
                      </button>
                    )}
                  </div>
                </div>

                {/* SKU Visual barcode indicator */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-indigo-400 tracking-wider block">PROD SKU BARCODING</span>
                    <h5 className="font-black text-rose-500 font-mono tracking-tight uppercase">{tempSku.sku || 'KODE-SKU'}</h5>
                    <p className="text-[10px] text-slate-400 mt-1">EAN Barcode standar laser kemas standing pouch aluminium foil:</p>
                  </div>

                  <div className="bg-white text-slate-950 p-2.5 rounded-lg border flex flex-col items-center justify-center space-y-1 my-2">
                    <div className="w-full flex justify-between tracking-tighter text-slate-800 font-black font-mono text-[9px] h-7 overflow-hidden select-none select-none select-none select-none">
                      || ||| ||| | ||| || ||| || ||| ||| | ||| | || || ||| || ||| || ||| ||| | ||| | || || ||| || ||| || ||| ||| | ||| | || 
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-widest">{tempSku.barcode || '8991234901001'}</span>
                  </div>

                  <div className="text-[9px] text-slate-400 leading-normal border-t border-slate-800/80 pt-2 flex justify-between">
                    <span>Active Version:</span>
                    <span className="font-bold text-emerald-400 font-mono">{tempSku.version || 'v1.0'}</span>
                  </div>
                </div>
              </div>

              {/* LIST GRID TABLE SKU & BOM */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Kode SKU</th>
                      <th className="py-2.5 px-3">Nama Produk &amp; Brand</th>
                      <th className="py-2.5 px-3">Varian &amp; Netto</th>
                      <th className="py-2.5 px-3">Active Version</th>
                      <th className="py-2.5 px-3">Komposisi BOM Standard (per Pouch)</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                      <th className="py-2.5 px-3 text-right">Opsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produk.filter(p => p.nama.toLowerCase().includes(filterSearch.toLowerCase()) || p.sku.toLowerCase().includes(filterSearch.toLowerCase())).map(p => {
                      const formula = bom.find(b => b.produkId === p.id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                          <td className="py-2.5 px-3 font-mono">
                            <span className="font-extrabold text-indigo-900 block text-xs">{p.sku}</span>
                            <span className="text-[8px] text-slate-400">{p.id}</span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <span className="text-slate-900 block font-bold">{p.nama}</span>
                            <span className="text-[9px] font-mono text-slate-500 font-bold">🏷️ BRAND: {p.brand || 'AGRIDEA'} | {p.barcode}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="block font-bold">🍊 {p.varian}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{p.gramasi} Gram</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-center">
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 text-[9px]">{p.version || 'v1.0'}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            {formula ? (
                              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-600 bg-slate-100/55 p-1 rounded border border-slate-200">
                                <div>Segar: <span className="font-bold text-slate-900 block">{formula.bahanBakuKg} Kg</span></div>
                                <div>Minyak: <span className="font-bold text-slate-900 block">{formula.minyakLiter} Ltr</span></div>
                                <div>Gas LPG: <span className="font-bold text-slate-900 block">{formula.lpgKg} Kg</span></div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No Standard BOM configured</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] ${
                              (p.status || 'Active') === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}>{p.status || 'Active'}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingSkuId(p.id);
                                setTempSku({
                                  sku: p.sku,
                                  nama: p.nama,
                                  brand: p.brand || 'AGRIDEA',
                                  varian: p.varian,
                                  gramasi: p.gramasi,
                                  jenisKemasan: p.jenisKemasan || 'Standing Pouch',
                                  hargaJualStandar: p.hargaJualStandar || 18000,
                                  hppStandar: p.hppStandar || 11200,
                                  barcode: p.barcode || '',
                                  version: p.version || '1.0',
                                  status: p.status || 'Active',
                                  bakuKg: formula?.bahanBakuKg || 1.2,
                                  minyakLiter: formula?.minyakLiter || 0.15,
                                  lpgKg: formula?.lpgKg || 0.20
                                });
                              }}
                              className="text-indigo-600 hover:text-indigo-900 hover:underline font-bold text-[10px] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin mendeaktivasi atau menghapus SKU ${p.sku}?`)) {
                                  setProduk(prev => prev.filter(item => item.id !== p.id));
                                  logActivity('Master Data', `Mendelete SKU ${p.sku} dari list.`);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-900 hover:underline font-bold text-[10px] cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== FORM PRODUKSI INTREGRATED ===================== */}
          {activeMenu === 'input-produksi' && (
            <div className="space-y-6 animate-fade-in" id="screen-input-produksi">
              <SidebarForms state={state} onAction={handleActionCallback} selectedLokasi={selectedLokasi} />
            </div>
          )}

          {/* ===================== REAL TIME STOCK TRACKER ===================== */}
          {activeMenu === 'inventory-stock' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="screen-inventory-stock">
              <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dashboard Monitoring Level Stok Bahan Real-time</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Semua transaksi dan logs produksi secara otomatis langsung memperbarui stok fisik gudang harian secara akurat.</p>
                </div>
                <button
                  onClick={() => {
                    // simulate fresh stock alignment check
                    setStocks(INITIAL_STOCKS);
                  }}
                  className="flex items-center space-x-1 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs text-slate-800 rounded font-semibold font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sinkron Selisih Stok
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                        <th className="py-2.5 px-3">Nama Material / Item</th>
                        <th className="py-2.5 px-3">Kategori Inventori</th>
                        <th className="py-2.5 px-3">Cabang Lokasi</th>
                        <th className="py-2.5 px-3 text-right">Stok Fisik Tersedia</th>
                        <th className="py-2.5 px-3 text-right font-mono">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stocks.filter(s => s.lokasiId === selectedLokasi).map((stk, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-950">{stk.key}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              stk.kategori === 'Bahan Baku' ? 'bg-emerald-100 text-emerald-800' :
                              stk.kategori === 'WIP' ? 'bg-amber-100 text-amber-800' :
                              stk.kategori === 'Produk Jadi' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {stk.kategori}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">{SEED_LOKASI.find(l => l.id === stk.lokasiId)?.nama.replace('Pabrik ', '')}</td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-950 text-xs">
                            {stk.qty.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono uppercase">{stk.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border space-y-4">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-widest border-b pb-2">Status Gudang Penyimpanan</h4>
                  <p className="text-slate-650 leading-normal">
                    Pabrik Agridea menerapkan penamaan barcode SKU dan pemantauan level stock semi-otomatis harian untuk menekan sisa remahan (crushed waste loss).
                  </p>
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 p-3 rounded-lg">
                    🟢 <span className="font-semibold text-emerald-900 grid grid-cols-1">Gudang Dingin (Cold Storage):</span>
                    Suhu konstan freezer blast di jaga pada -18°C untuk menjaga kerenyahan serat buah selama masa penyimpanan setengah jadi (WIP).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== INTEGRATED COGS / HPP COMPONENT ===================== */}
          {(activeMenu === 'cogs-component' || activeMenu === 'sales-batch-trace' || activeMenu === 'cogs-simulation') && (
            <div className="space-y-6 animate-fade-in" id="screen-trace-cogs">
              <TrackingAndCOGS state={state} />
            </div>
          )}

          {/* ===================== NOT IMPLEMENTED VIEWS: GENERIC LAYOUT TO ENSURE USABILITY ===================== */}
          {/* Automatically fallback show tables with interactive search for other menus to keep 100% of the PRD functional! */}
          {!['dashboard-utama', 'dashboard-produksi', 'dashboard-inventory', 'dashboard-sales', 'dashboard-payroll', 'dashboard-cogs', 'dashboard-hq', 'session', 'signup', 'roles', 'audit', 'master-karyawan', 'master-sku', 'input-produksi', 'inventory-stock', 'cogs-component', 'sales-batch-trace', 'cogs-simulation'].includes(activeMenu) && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs animate-fade-in" id="fallback-screen">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm capitalize">{activeMenu.replace('-', ' ')}</h3>
                  <p className="text-slate-500 mt-0.5">Database log dan catatan operasional harian untuk {activeBranchName}.</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Search logs database..."
                    className="pl-8 p-1.5 text-xs bg-slate-50 border rounded"
                  />
                </div>
              </div>

              {/* Dynamic generic content views mapped strictly to active menus fallback */}
              {activeMenu === 'master-supplier' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* FORM INPUT SUPPLIER */}
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        📦 {editingSupplierId ? 'Edit Data Supplier' : 'Registrasi Supplier Baru'}
                      </h4>
                      <p className="text-slate-500 text-[11px]">Lengkapi data identitas perkebunan, titik koordinat peta untuk integrasi logistik, serta informasi rekening transfer bank:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Nama Supplier / Mitra</label>
                          <input 
                            type="text" 
                            value={tempSupplier.nama} 
                            onChange={(e) => setTempSupplier({ ...tempSupplier, nama: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full font-bold focus:border-emerald-500 font-sans outline-none" 
                            placeholder="Koperasi Buah Malang font-bold outline-none" 
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">No Smartphone / HP</label>
                          <input 
                            type="text" 
                            value={tempSupplier.telepon} 
                            onChange={(e) => setTempSupplier({ ...tempSupplier, telepon: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full focus:border-emerald-500 font-sans outline-none" 
                            placeholder="0819..." 
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 font-bold">Koordinat Lahan Perkebunan</label>
                          <input 
                            type="text" 
                            value={tempSupplier.koordinatLahan || ''} 
                            onChange={(e) => setTempSupplier({ ...tempSupplier, koordinatLahan: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full text-indigo-700 font-bold focus:border-emerald-500 font-mono outline-none" 
                            placeholder="e.g. -7.8712, 112.5268" 
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Jenis Bahan Utama</label>
                          <select 
                            value={tempSupplier.jenisBahan} 
                            onChange={(e) => setTempSupplier({ ...tempSupplier, jenisBahan: e.target.value })} 
                            className="bg-white border text-xs rounded p-2 w-full cursor-pointer outline-none"
                          >
                            <option value="Apel">Apel Segar</option>
                            <option value="Nangka">Nangka Segar</option>
                            <option value="Pisang">Pisang</option>
                            <option value="Salak">Salak Pondoh</option>
                            <option value="Pouch">Standing Pouch Kemasan</option>
                            <option value="Kartons">Kardus / Kartons</option>
                            <option value="Minyak Goreng">Minyak Goreng</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="font-semibold block mb-1 text-slate-700 font-semibold">Alamat Lengkap Lahan / Kantor</label>
                          <textarea 
                            value={tempSupplier.alamat} 
                            onChange={(e) => setTempSupplier({ ...tempSupplier, alamat: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full focus:border-emerald-500 font-sans h-12 outline-none" 
                            placeholder="Jl. Raya Pandanrejo, Kec. Bumiaji, Kota Batu, Jawa Timur"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-3 space-y-2">
                        <span className="font-bold text-slate-800 text-[11px] block text-indigo-950">🏦 Informasi Payment / Akun Bank:</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Nama Penerima Bank</label>
                            <select 
                              value={tempSupplier.namaBank || 'BCA'} 
                              onChange={(e) => setTempSupplier({ ...tempSupplier, namaBank: e.target.value })} 
                              className="bg-white border text-xs rounded p-2 w-full cursor-pointer outline-none"
                            >
                              <option value="BCA">Bank Central Asia (BCA)</option>
                              <option value="Mandiri">Bank Mandiri</option>
                              <option value="BNI">Bank Negara Indonesia (BNI)</option>
                              <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                              <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Nomor Rekening</label>
                            <input 
                              type="text" 
                              value={tempSupplier.nomorRekening || ''} 
                              onChange={(e) => setTempSupplier({ ...tempSupplier, nomorRekening: e.target.value })} 
                              className="bg-white border rounded p-2 text-xs w-full focus:border-emerald-500 font-mono outline-none" 
                              placeholder="3150981921" 
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Nama Pemilik Rekening</label>
                            <input 
                              type="text" 
                              value={tempSupplier.pemilikRekening || ''} 
                              onChange={(e) => setTempSupplier({ ...tempSupplier, pemilikRekening: e.target.value })} 
                              className="bg-white border rounded p-2 text-xs w-full focus:border-emerald-500 font-sans outline-none" 
                              placeholder="Suprayitno" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex pt-2 justify-end space-x-2">
                        {editingSupplierId ? (
                          <>
                            <button
                              onClick={() => {
                                if (!tempSupplier.nama) return;
                                setSupplier(prev => prev.map(s => {
                                  if (s.id === editingSupplierId) {
                                    return {
                                      ...s,
                                      nama: tempSupplier.nama.trim(),
                                      telepon: tempSupplier.telepon.trim(),
                                      alamat: tempSupplier.alamat.trim(),
                                      jenisBahan: [tempSupplier.jenisBahan],
                                      namaBank: tempSupplier.namaBank || 'BCA',
                                      nomorRekening: tempSupplier.nomorRekening?.trim() || '',
                                      pemilikRekening: tempSupplier.pemilikRekening?.trim() || '',
                                      koordinatLahan: tempSupplier.koordinatLahan || '-7.8712, 112.5268'
                                    };
                                  }
                                  return s;
                                }));
                                logActivity('Master Data', `Mengupdate data supplier untuk ${tempSupplier.nama}.`);
                                setEditingSupplierId(null);
                                setTempSupplier({ nama: '', telepon: '', alamat: '', jenisBahan: 'Apel', namaBank: 'BCA', nomorRekening: '', pemilikRekening: '', koordinatLahan: '-7.8712, 112.5268' });
                              }}
                              className="bg-emerald-600 text-white font-bold p-2 px-5 rounded-lg hover:bg-emerald-500 text-center text-xs cursor-pointer shadow-xs"
                            >
                              Update Supplier
                            </button>
                            <button
                              onClick={() => {
                                setEditingSupplierId(null);
                                setTempSupplier({ nama: '', telepon: '', alamat: '', jenisBahan: 'Apel', namaBank: 'BCA', nomorRekening: '', pemilikRekening: '', koordinatLahan: '-7.8712, 112.5268' });
                              }}
                              className="bg-slate-200 text-slate-700 font-bold p-2 px-5 rounded-lg hover:bg-slate-300 text-center text-xs cursor-pointer"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (!tempSupplier.nama) return;
                              const nextId = 'SUP-' + (supplier.length + 101);
                              setSupplier(prev => [...prev, {
                                id: nextId,
                                kode: 'SUP-' + tempSupplier.jenisBahan.substring(0,3).toUpperCase() + '-' + Math.floor(Math.random() * 100 + 10),
                                nama: tempSupplier.nama.trim(),
                                alamat: tempSupplier.alamat || 'Jl. Raya Batu, Malang',
                                telepon: tempSupplier.telepon.trim(),
                                jenisBahan: [tempSupplier.jenisBahan],
                                rating: 5,
                                namaBank: tempSupplier.namaBank || 'BCA',
                                nomorRekening: tempSupplier.nomorRekening?.trim() || '',
                                pemilikRekening: tempSupplier.pemilikRekening?.trim() || '',
                                koordinatLahan: tempSupplier.koordinatLahan || '-7.8712, 112.5268'
                              }]);
                              logActivity('Master Data', `Mendaftarkan supplier mitra baru bernama ${tempSupplier.nama}.`);
                              setTempSupplier({ nama: '', telepon: '', alamat: '', jenisBahan: 'Apel', namaBank: 'BCA', nomorRekening: '', pemilikRekening: '', koordinatLahan: '-7.8712, 112.5268' });
                            }}
                            className="bg-slate-950 text-white font-bold p-2 px-6 rounded-lg hover:bg-slate-800 cursor-pointer shadow-xs"
                          >
                            Daftarkan Supplier
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MAPS PANEL */}
                    <div className="bg-white border rounded-xl p-4 flex flex-col space-y-2 justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 uppercase block tracking-wider text-[11px]">🛰️ Google Maps Satellite Preview</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 rounded font-bold uppercase">LIVE CONNECTION</span>
                        </div>
                        <p className="text-slate-400 text-[9px]">Menampilkan visualisasi lokasi koordinat lahan perkebunan kelapa sawit/buah apel mitra:</p>
                      </div>

                      {/* Map Simulation */}
                      <div className="bg-slate-900 h-40 w-full rounded-lg relative overflow-hidden flex flex-col items-center justify-center border border-slate-700">
                        {/* Grid decorative lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-35"></div>
                        
                        {/* Stylized Vector Map representation */}
                        <div className="absolute top-4 left-6 w-16 h-12 bg-emerald-950/40 rounded-full border border-emerald-800/40 opacity-70"></div>
                        <div className="absolute bottom-6 right-8 w-24 h-16 bg-indigo-950/40 rounded-full border border-indigo-800/40 opacity-70"></div>
                        <div className="absolute top-10 right-12 w-20 h-10 bg-slate-800/60 rounded border border-slate-700 opacity-50"></div>
                        
                        {/* Connecting Path Line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                          <path d="M 0 100 Q 150 20 300 130" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4" />
                        </svg>

                        {/* Location Pin */}
                        <div className="relative z-10 flex flex-col items-center animate-bounce">
                          <span className="text-2xl">📍</span>
                          <div className="w-2.5 h-1 bg-slate-950 rounded-full opacity-60"></div>
                        </div>

                        {/* Coordinate Overlay */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-950/80 p-1.5 rounded text-[9px] font-mono text-emerald-400 border border-slate-800 flex justify-between">
                          <span>LAT/LNG: {tempSupplier.koordinatLahan || '-7.8712, 112.5268'}</span>
                          <span className="text-white font-sans">Malang Area</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-sans p-1.5 bg-slate-50 rounded border flex items-start gap-1">
                        <span>ℹ️</span>
                        <span>Koordinat ini disinkronisasikan ke armada truk logistik Agridea untuk optimasi rute jemput panen buah apel segar.</span>
                      </div>
                    </div>

                  </div>

                  {/* SUPPLIER DATA TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-sans">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 font-bold font-sans">
                          <th className="py-2.5 px-3">Kode Supplier</th>
                          <th className="py-2.5 px-3">Nama Supplier</th>
                          <th className="py-2.5 px-3">Tatap Muka &amp; Alamat</th>
                          <th className="py-2.5 px-3">Bahan Dipasok</th>
                          <th className="py-2.5 px-3">Akun Bank Transfer</th>
                          <th className="py-2.5 px-3 text-center">Rating</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.filter(s => s.nama.toLowerCase().includes(filterSearch.toLowerCase())).map(s => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span>{s.kode}</span>
                              <span className="block text-[8px] text-slate-400 font-sans">{s.id}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-800 block text-xs">{s.nama}</span>
                              <span className="text-[10px] text-indigo-700 font-semibold font-mono">📍 {s.koordinatLahan || '-7.8712, 112.5268'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                              <span className="block font-bold">📞 {s.telepon}</span>
                              <span className="block text-[10px] text-slate-400 truncate">{s.alamat}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="bg-indigo-50 text-indigo-800 border border-indigo-100 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                {s.jenisBahan.join(', ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px]">
                              {s.nomorRekening ? (
                                <>
                                  <span className="font-bold text-slate-800 block">{s.namaBank} - {s.nomorRekening}</span>
                                  <span className="text-slate-400 text-[9px] font-sans block truncate">a/n: {s.pemilikRekening}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic">Belum dikonfigurasi</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-amber-500 font-bold">{'⭐'.repeat(s.rating)}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingSupplierId(s.id);
                                  setTempSupplier({
                                    nama: s.nama,
                                    telepon: s.telepon,
                                    alamat: s.alamat,
                                    jenisBahan: s.jenisBahan[0] || 'Apel',
                                    namaBank: s.namaBank || 'BCA',
                                    nomorRekening: s.nomorRekening || '',
                                    pemilikRekening: s.pemilikRekening || '',
                                    koordinatLahan: s.koordinatLahan || '-7.8712, 112.5268'
                                  });
                                }}
                                className="text-indigo-600 hover:text-indigo-900 underline font-bold text-[10px] cursor-pointer"
                              >
                                Edit / Pilih
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'master-customer' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Customer Register / Edit Form */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        🏢 {editingCustomerId ? 'Ubah Data Kemitraan Customer' : 'Pendaftaran Customer & Kemitraan Toko'}
                      </h4>
                      <p className="text-slate-500 text-[11px]">Kategori-kategori kemitraan meliputi White Label/OEM, Maklon privat, Bulky kiloan, and Distributor wilayah:</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Nama Toko / Perusahaan</label>
                          <input 
                            type="text" 
                            value={tempCustomer.nama} 
                            onChange={(e) => setTempCustomer({ ...tempCustomer, nama: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full font-bold outline-none focus:border-indigo-500" 
                            placeholder="Lancar Jaya Surabaya" 
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">No Telepon / WhatsApp</label>
                          <input 
                            type="text" 
                            value={tempCustomer.telepon} 
                            onChange={(e) => setTempCustomer({ ...tempCustomer, telepon: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full outline-none focus:border-indigo-500 font-mono" 
                            placeholder="031-..." 
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Kategori / Tipe Kemitraan</label>
                          <select 
                            value={tempCustomer.tipe} 
                            onChange={(e) => setTempCustomer({ ...tempCustomer, tipe: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full cursor-pointer outline-none focus:border-indigo-500 font-bold"
                          >
                            <option value="OEM">OEM (Original Equipment Manufacturer)</option>
                            <option value="Maklon">Maklon (Private Brand Label)</option>
                            <option value="Bulky">Bulky (Kiloan / Grosir Curah)</option>
                            <option value="Reseller">Reseller Wilayah</option>
                            <option value="Distributor">Distributor Nasional</option>
                            <option value="Supermarket">Supermarket / Modern Trade</option>
                            <option value="Konsinyasi">Konsinyasi (Kandungan Komisi)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Persentase Komisi Sales (%)</label>
                          <input 
                            type="number" 
                            value={tempCustomer.komisi} 
                            onChange={(e) => setTempCustomer({ ...tempCustomer, komisi: Number(e.target.value) })} 
                            className="bg-white border rounded p-2 text-xs w-full outline-none focus:border-indigo-500 font-mono" 
                            placeholder="2" 
                          />
                        </div>
                      </div>

                      {/* PRIVATE LABELLING CONFIGURATION */}
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                        <span className="font-bold text-indigo-950 text-[11px] block flex items-center gap-1">
                          ⚙️ Konfigurasi SKU Kustom White-Label (OEM &amp; Maklon)
                        </span>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Brand Label</label>
                            <input 
                              type="text" 
                              value={tempCustomer.customBrand || ''} 
                              onChange={(e) => setTempCustomer({ ...tempCustomer, customBrand: e.target.value })} 
                              className="bg-white border text-xs rounded p-2 w-full outline-none focus:border-indigo-500 font-semibold" 
                              placeholder="e.g. Srikandi"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Ukuran Kemasan</label>
                            <input 
                              type="text" 
                              value={tempCustomer.customSize || ''} 
                              onChange={(e) => setTempCustomer({ ...tempCustomer, customSize: e.target.value })} 
                              className="bg-white border text-xs rounded p-2 w-full outline-none focus:border-indigo-500" 
                              placeholder="e.g. Medium Pouch"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Berat Bersih (Gramasi)</label>
                            <input 
                              type="number" 
                              value={tempCustomer.customGramasi || 100} 
                              onChange={(e) => setTempCustomer({ ...tempCustomer, customGramasi: Number(e.target.value) })} 
                              className="bg-white border text-xs rounded p-2 w-full outline-none focus:border-indigo-500 font-mono" 
                              placeholder="100"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-0.5 text-[10px]">Varian Rasa Buah</label>
                            <select 
                              value={tempCustomer.customVarian || 'Apel'} 
                              onChange={(e) => setTempCustomer({ ...tempCustomer, customVarian: e.target.value })} 
                              className="bg-white border text-xs rounded p-2 w-full cursor-pointer outline-none focus:border-indigo-500"
                            >
                              <option value="Apel">Kripik Apel</option>
                              <option value="Pisang">Kripik Pisang</option>
                              <option value="Nangka">Kripik Nangka</option>
                              <option value="Salak">Kripik Salak</option>
                              <option value="Mix">Kripik Mix Fruits</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 border-t pt-3">
                        {editingCustomerId ? (
                          <>
                            <button
                              onClick={() => {
                                if (!tempCustomer.nama) return;
                                setCustomer(prev => prev.map(c => {
                                  if (c.id === editingCustomerId) {
                                    return {
                                      ...c,
                                      nama: tempCustomer.nama.trim(),
                                      telepon: tempCustomer.telepon.trim(),
                                      tipe: tempCustomer.tipe,
                                      komisiSalesPercent: tempCustomer.komisi,
                                      customBrand: tempCustomer.customBrand?.trim() || '',
                                      customSize: tempCustomer.customSize?.trim() || '',
                                      customGramasi: Number(tempCustomer.customGramasi) || 120,
                                      customVarian: tempCustomer.customVarian || 'Apel'
                                    };
                                  }
                                  return c;
                                }));
                                logActivity('Master Data', `Mengubah data kemitraan and spesifikasi kustom customer ${tempCustomer.nama}.`);
                                setEditingCustomerId(null);
                                setTempCustomer({ nama: '', alamat: '', telepon: '', tipe: 'OEM', komisi: 2, customBrand: 'AGRIDEA', customSize: 'Standard Pouch', customGramasi: 100, customVarian: 'Apel' });
                              }}
                              className="bg-emerald-600 text-white font-bold p-2 px-6 rounded-lg hover:bg-emerald-500 text-center text-xs cursor-pointer shadow-xs"
                            >
                              Simpan Perubahan
                            </button>
                            <button
                              onClick={() => {
                                setEditingCustomerId(null);
                                setTempCustomer({ nama: '', alamat: '', telepon: '', tipe: 'OEM', komisi: 2, customBrand: 'AGRIDEA', customSize: 'Standard Pouch', customGramasi: 100, customVarian: 'Apel' });
                              }}
                              className="bg-slate-200 text-slate-700 font-bold p-2 px-5 rounded-lg hover:bg-slate-300 text-center text-xs cursor-pointer"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (!tempCustomer.nama) return;
                              const nextId = 'CUST-' + (customer.length + 101);
                              setCustomer(prev => [...prev, {
                                id: nextId,
                                kode: 'CST-' + tempCustomer.nama.substring(0,3).toUpperCase() + '-' + Math.floor(Math.random() * 100 + 10),
                                nama: tempCustomer.nama.trim(),
                                alamat: 'Kawasan Niaga Regional',
                                telepon: tempCustomer.telepon.trim(),
                                tipe: tempCustomer.tipe,
                                komisiSalesPercent: tempCustomer.komisi,
                                customBrand: tempCustomer.customBrand?.trim() || '',
                                customSize: tempCustomer.customSize?.trim() || '',
                                customGramasi: Number(tempCustomer.customGramasi) || 120,
                                customVarian: tempCustomer.customVarian || 'Apel'
                              }]);
                              logActivity('Master Data', `Mendaftarkan mitra customer baru: ${tempCustomer.nama} sebagai ${tempCustomer.tipe}.`);
                              setTempCustomer({ nama: '', alamat: '', telepon: '', tipe: 'OEM', komisi: 2, customBrand: 'AGRIDEA', customSize: 'Standard Pouch', customGramasi: 100, customVarian: 'Apel' });
                            }}
                            className="bg-slate-950 text-white font-bold p-2 px-6 rounded-lg hover:bg-slate-800 cursor-pointer shadow-xs"
                          >
                            Daftarkan Customer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Specification Badge info */}
                    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-indigo-300 tracking-widest uppercase">📄 LABEL DESIGN PREVIEW</span>
                          <span className="bg-indigo-900 border border-indigo-700 text-[8px] font-sans px-1.5 py-0.5 rounded text-indigo-300 font-bold uppercase">PRINT READY</span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-1">Simulasi desain kemasan pouch aluminium foil kustom untuk pesanan OEM/Maklon:</p>
                      </div>

                      <div className="border border-slate-700 bg-slate-950 p-4 rounded-xl space-y-3 relative overflow-hidden">
                        {/* Decorative background pouch circle */}
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
                        <div className="border-b border-dashed border-slate-800 pb-2 flex justify-between items-start">
                          <div>
                            <span className="font-black text-rose-500 text-xs block tracking-widest uppercase">{tempCustomer.customBrand || 'AGRIDEA'}</span>
                            <span className="text-[9px] text-slate-500 block">Brand kustom pemesan</span>
                          </div>
                          <span className="bg-slate-800 text-[9px] px-1 rounded font-bold font-mono text-indigo-400">{tempCustomer.tipe}</span>
                        </div>

                        <div className="space-y-1 text-[10px] text-slate-300 font-sans">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Varian Olahan :</span>
                            <span className="font-extrabold text-white text-right">Keripik {tempCustomer.customVarian || 'Apel'} Rasa Premium</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gramasi Bersih :</span>
                            <span className="font-mono font-bold text-white text-right">{tempCustomer.customGramasi || 100} gram (Netto)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tipe Wadah :</span>
                            <span className="font-bold text-slate-200 text-right">{tempCustomer.customSize || 'Standard standing pouch'}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                          <span className="text-[8px] text-slate-500 font-mono">BOM NO: AGR-BOM-MKL-{(tempCustomer.customGramasi || 100) * 3}</span>
                          <span className="text-[9px] font-bold text-emerald-400">READY TO FRY</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-850">
                        🛡️ Spesifikasi di atas secara dinamis terhubung ke sistem penaksiran harga jual, pengkondisian formula COGS, and pelacakan mutu QC pada saat kemasan naek ke area gudang penyimpanan.
                      </div>
                    </div>

                  </div>

                  {/* CUSTOMER DATABASE GRID */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-sans">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                          <th className="py-2.5 px-3">Kode Customer</th>
                          <th className="py-2.5 px-3">Nama Toko &amp; Kontak</th>
                          <th className="py-2.5 px-3">Kategori Kemitraan</th>
                          <th className="py-2.5 px-3">Komisi Sales</th>
                          <th className="py-2.5 px-3">Spesifikasi SKU Kustom Pemesan (OEM/Maklon)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.filter(c => c.nama.toLowerCase().includes(filterSearch.toLowerCase())).map(c => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span>{c.kode}</span>
                              <span className="block text-[8px] text-slate-400">{c.id}</span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              <span className="font-bold text-slate-900 block text-xs">{c.nama}</span>
                              <span className="text-slate-400 block text-[10px]">📞 {c.telepon || '-'}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                                c.tipe === 'OEM' || c.tipe === 'Maklon' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                              }`}>{c.tipe}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-750">
                              {c.komisiSalesPercent}% Komisi
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              {c.customBrand || c.tipe === 'OEM' || c.tipe === 'Maklon' ? (
                                <div className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[10px] space-y-0.5 text-slate-700">
                                  <span className="block text-rose-700 font-extrabold uppercase font-sans">Brand: {c.customBrand || 'Custom Logo'}</span>
                                  <span className="block text-[9px] text-slate-400 font-sans">Pouch: {c.customSize || 'Standar Pouch'} | Varian: {c.customVarian || 'Apel'} ({c.customGramasi || 100}g)</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">Gunakan standard SKU Agridea</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingCustomerId(c.id);
                                  setTempCustomer({
                                    nama: c.nama,
                                    telepon: c.telepon || '',
                                    alamat: c.alamat || '',
                                    tipe: c.tipe,
                                    komisi: c.komisiSalesPercent || 2,
                                    customBrand: c.customBrand || 'AGRIDEA',
                                    customSize: c.customSize || 'Standard Pouch',
                                    customGramasi: c.customGramasi || 100,
                                    customVarian: c.customVarian || 'Apel'
                                  });
                                }}
                                className="text-indigo-600 hover:text-indigo-900 underline font-bold text-[10px] cursor-pointer"
                              >
                                Edit / Pilih
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

             {activeMenu === 'master-fruit-variants' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs animate-fade-in" id="screen-fruit-variants">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm border-b pb-2 mb-3">Master Data — Fruit &amp; Vegetable Variants</h3>
                    <p className="text-slate-505 font-medium">Centralized directory of raw agricultural components used across all factories and operations. Standard variants are preseeded below.</p>
                  </div>

                  {/* FORM PANEL */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-205">
                    <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                      ⭐ {editingFruitId ? 'Edit Fruit & Vegetable Variant' : 'Add New Fruit & Vegetable Variant'}
                    </h4>

                    {tempFruit.error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg mb-4 font-bold flex items-center gap-2 animate-pulse">
                        <span>⚠️</span>
                        <span>{tempFruit.error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="text-slate-500 block mb-1 text-[10px] font-bold">Variant Code (Auto-generated)</label>
                        <input
                          type="text"
                          value={editingFruitId || `FV-${String(fruitVariants.length + 1).padStart(2, '0')}`}
                          disabled
                          className="bg-slate-100 border text-slate-500 rounded p-1.5 text-xs w-full font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Variant Name</label>
                        <input
                          type="text"
                          value={tempFruit.nama}
                          onChange={(e) => {
                            const val = e.target.value;
                            const isDup = fruitVariants.some(f => f.nama.toLowerCase() === val.trim().toLowerCase() && f.id !== editingFruitId);
                            setTempFruit({ 
                              ...tempFruit, 
                              nama: val,
                              error: isDup ? `Warning: Fruit variant "${val}" already exists.` : ''
                            });
                          }}
                          placeholder="e.g. Nanas Madu"
                          className="bg-white border rounded p-1.5 text-xs w-full font-bold focus:ring-1 focus:ring-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Category</label>
                        <select
                          value={tempFruit.category}
                          onChange={(e) => setTempFruit({ ...tempFruit, category: e.target.value })}
                          className="bg-white border rounded p-1.5 text-xs w-full"
                        >
                          <option value="Fruit">Fruit</option>
                          <option value="Vegetable">Vegetable</option>
                          <option value="Mushroom">Mushroom</option>
                          <option value="Root Crop">Root Crop</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Status</label>
                        <select
                          value={tempFruit.status}
                          onChange={(e) => setTempFruit({ ...tempFruit, status: e.target.value })}
                          className="bg-white border rounded p-1.5 text-xs w-full"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Notes / Keterangan tambahan</label>
                        <input
                          type="text"
                          value={tempFruit.notes || ''}
                          onChange={(e) => setTempFruit({ ...tempFruit, notes: e.target.value })}
                          placeholder="Keterangan asal, masa panen, atau spesifikasi fisik"
                          className="bg-white border rounded p-1.5 text-xs w-full"
                        />
                      </div>

                      <div className="flex items-end space-x-2">
                        {editingFruitId ? (
                          <>
                            <button
                              onClick={() => {
                                if (!tempFruit.nama.trim()) return;
                                if (tempFruit.error) return;
                                
                                setFruitVariants(prev => prev.map(f => {
                                  if (f.id === editingFruitId) {
                                    return {
                                      ...f,
                                      nama: tempFruit.nama.trim(),
                                      category: tempFruit.category,
                                      status: tempFruit.status,
                                      notes: tempFruit.notes
                                    };
                                  }
                                  return f;
                                }));
                                logActivity('FRUIT-MASTER', `Updated Fruit Variant ${editingFruitId}: ${tempFruit.nama}`);
                                setEditingFruitId(null);
                                setTempFruit({ id: '', nama: '', category: 'Fruit', status: 'Active', notes: '' });
                              }}
                              className="bg-emerald-600 text-white font-bold p-1.5 px-3 rounded hover:bg-emerald-500 w-full text-center cursor-pointer font-sans"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingFruitId(null);
                                setTempFruit({ id: '', nama: '', category: 'Fruit', status: 'Active', notes: '' });
                              }}
                              className="bg-slate-300 text-slate-700 font-bold p-1.5 px-3 rounded hover:bg-slate-200 w-full text-center cursor-pointer font-sans"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (!tempFruit.nama.trim()) return;
                              if (tempFruit.error) return;
                              
                              const newId = `FV-${String(fruitVariants.length + 1).padStart(2, '0')}`;
                              const newVal = {
                                id: newId,
                                nama: tempFruit.nama.trim(),
                                category: tempFruit.category,
                                status: tempFruit.status,
                                notes: tempFruit.notes
                              };
                              
                              setFruitVariants(prev => [...prev, newVal]);
                              logActivity('FRUIT-MASTER', `Registered Fruit Variant ${newId}: ${tempFruit.nama}`);
                              setTempFruit({ id: '', nama: '', category: 'Fruit', status: 'Active', notes: '' });
                            }}
                            className="bg-slate-950 text-white font-bold p-1.5 rounded hover:bg-slate-800 w-full cursor-pointer font-sans font-bold"
                          >
                            + Add Variant
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FILTER SECTIONS */}
                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Variant..."
                          value={fruitSearchQuery}
                          onChange={(e) => setFruitSearchQuery(e.target.value)}
                          className="bg-white border text-xs placeholder-slate-400 p-1.5 pl-6 rounded outline-none focus:border-slate-400 w-44"
                        />
                        <Search className="absolute left-2 top-2 text-slate-430 w-3.5 h-3.5" />
                      </div>

                      <select
                        value={fruitCategoryFilter}
                        onChange={(e) => setFruitCategoryFilter(e.target.value)}
                        className="bg-white border rounded p-1.5 text-[11px]"
                      >
                        <option value="">All Categories</option>
                        <option value="Fruit">Fruit</option>
                        <option value="Vegetable">Vegetable</option>
                        <option value="Mushroom">Mushroom</option>
                        <option value="Root Crop">Root Crop</option>
                        <option value="Other">Other</option>
                      </select>

                      <select
                        value={fruitStatusFilter}
                        onChange={(e) => setFruitStatusFilter(e.target.value)}
                        className="bg-white border rounded p-1.5 text-[11px]"
                      >
                        <option value="">All Statuses</option>
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Inactive Only</option>
                      </select>
                    </div>

                    {(fruitSearchQuery || fruitCategoryFilter || fruitStatusFilter) && (
                      <button
                        onClick={() => {
                          setFruitSearchQuery('');
                          setFruitCategoryFilter('');
                          setFruitStatusFilter('');
                        }}
                        className="text-indigo-605 hover:text-indigo-805 underline font-bold text-[10px]"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  {/* TABLE VIEW */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-sans text-slate-700">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                            <th className="py-2.5 px-3">Variant Code</th>
                            <th className="py-2.5 px-3">Variant Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Notes</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-medium text-slate-60)0">
                          {fruitVariants
                            .filter(fv => {
                              const matchName = fv.nama.toLowerCase().includes(fruitSearchQuery.toLowerCase());
                              const matchCategory = fruitCategoryFilter ? fv.category === fruitCategoryFilter : true;
                              const matchStatus = fruitStatusFilter ? fv.status === fruitStatusFilter : true;
                              return matchName && matchCategory && matchStatus;
                            })
                            .map((fv) => (
                              <tr key={fv.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{fv.id}</td>
                                <td className="py-2.5 px-3 text-slate-900 font-bold">{fv.nama}</td>
                                <td className="py-2.5 px-3 font-sans">
                                  <span className={`p-1 px-2 rounded-full text-[9px] font-bold ${
                                    fv.category === 'Fruit' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                    fv.category === 'Vegetable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {fv.category}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${fv.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                  <span className={fv.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                                    {fv.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{fv.notes || '—'}</td>
                                <td className="py-2.5 px-3 text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingFruitId(fv.id);
                                      setTempFruit({
                                        id: fv.id,
                                        nama: fv.nama,
                                        category: fv.category,
                                        status: fv.status,
                                        notes: fv.notes || ''
                                      });
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 underline font-bold cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      const nextStatus = fv.status === 'Active' ? 'Inactive' : 'Active';
                                      setFruitVariants(prev => prev.map(f => f.id === fv.id ? { ...f, status: nextStatus } : f));
                                      logActivity('FRUIT-MASTER', `Toggled Fruit Variant ${fv.id} status to ${nextStatus}`);
                                    }}
                                    className={`${fv.status === 'Active' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'} underline font-bold cursor-pointer`}
                                  >
                                    {fv.status === 'Active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'master-chip-variants' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs animate-fade-in" id="screen-chip-variants">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm border-b pb-2 mb-3">Master Data — Chip Variants</h3>
                    <p className="text-slate-500 font-medium">Finished chips reference key fruit, quality grades, and unit packaging configurations.</p>
                  </div>

                  {/* FORM PANEL */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                      ⭐ {editingChipId ? 'Edit Chip Variant Specifications' : 'Register New Chip Variant'}
                    </h4>

                    {tempChip.error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg mb-4 font-bold flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{tempChip.error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Chip SKU Code</label>
                        <input
                          type="text"
                          value={tempChip.id}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            const isDup = chipVariants.some(c => c.id === val && c.id !== editingChipId);
                            setTempChip({ 
                              ...tempChip, 
                              id: val,
                              error: isDup ? `Error: Chip SKU Code "${val}" already exists.` : ''
                            });
                          }}
                          disabled={!!editingChipId}
                          placeholder="e.g. CHIP-PSG-A02"
                          className="bg-white disabled:bg-slate-100 disabled:text-slate-500 border rounded p-1.5 text-xs w-full font-mono font-bold uppercase transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Chip Variant Name</label>
                        <input
                          type="text"
                          value={tempChip.nama}
                          onChange={(e) => {
                            const val = e.target.value;
                            const isDup = chipVariants.some(c => c.nama.toLowerCase() === val.trim().toLowerCase() && c.id !== editingChipId);
                            setTempChip({ 
                              ...tempChip, 
                              nama: val,
                              error: isDup ? `Error: Chip name "${val}" already exists.` : ''
                            });
                          }}
                          placeholder="e.g. Keripik Pisang Premium"
                          className="bg-white border rounded p-1.5 text-xs w-full font-bold focus:ring-1 focus:ring-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-705 block mb-1 text-[10px] font-bold">Fruit Variant Reference</label>
                        <select
                          value={tempChip.fruitVariantId}
                          onChange={(e) => setTempChip({ ...tempChip, fruitVariantId: e.target.value })}
                          className="bg-white border rounded p-1.5 text-xs w-full cursor-pointer font-bold"
                        >
                          <option value="">-- Choose Fruit --</option>
                          {fruitVariants
                            .filter(f => f.status === 'Active')
                            .map(f => (
                              <option key={f.id} value={f.id}>{f.nama}</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Grade</label>
                        <select
                          value={tempChip.grade}
                          onChange={(e) => setTempChip({ ...tempChip, grade: e.target.value })}
                          className="bg-white border rounded p-1.5 text-xs w-full font-bold text-slate-800"
                        >
                          <option value="A">Grade A</option>
                          <option value="B">Grade B</option>
                          <option value="C">Grade C</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Brand</label>
                        <input
                          type="text"
                          value={tempChip.brand}
                          onChange={(e) => setTempChip({ ...tempChip, brand: e.target.value.toUpperCase() })}
                          placeholder="e.g. AGRIDEA"
                          className="bg-white border rounded p-1.5 text-xs w-full uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Packaging Size</label>
                        <input
                          type="text"
                          value={tempChip.packagingSize}
                          onChange={(e) => setTempChip({ ...tempChip, packagingSize: e.target.value })}
                          placeholder="e.g. 100g or 250g"
                          className="bg-white border rounded p-1.5 text-xs w-full"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Status</label>
                        <select
                          value={tempChip.status}
                          onChange={(e) => setTempChip({ ...tempChip, status: e.target.value })}
                          className="bg-white border rounded p-1.5 text-xs w-full font-bold"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="flex items-end space-x-2">
                        {editingChipId ? (
                          <>
                            <button
                              onClick={() => {
                                if (!tempChip.nama.trim() || !tempChip.fruitVariantId) return;
                                if (tempChip.error) return;
                                
                                setChipVariants(prev => prev.map(c => {
                                  if (c.id === editingChipId) {
                                    return {
                                      ...c,
                                      nama: tempChip.nama.trim(),
                                      fruitVariantId: tempChip.fruitVariantId,
                                      grade: tempChip.grade,
                                      brand: tempChip.brand,
                                      packagingSize: tempChip.packagingSize,
                                      status: tempChip.status
                                    };
                                  }
                                  return c;
                                }));
                                logActivity('CHIP-MASTER', `Updated Chip Variant ${editingChipId}: ${tempChip.nama}`);
                                setEditingChipId(null);
                                setTempChip({ id: '', nama: '', fruitVariantId: '', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: '' });
                              }}
                              className="bg-emerald-600 text-white font-bold p-1.5 px-3 rounded hover:bg-emerald-500 w-full text-center cursor-pointer font-sans"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingChipId(null);
                                setTempChip({ id: '', nama: '', fruitVariantId: '', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: '' });
                              }}
                              className="bg-slate-300 text-slate-700 font-bold p-1.5 px-3 rounded hover:bg-slate-200 w-full text-center cursor-pointer font-sans"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (!tempChip.id.trim() || !tempChip.nama.trim() || !tempChip.fruitVariantId) return;
                              if (tempChip.error) return;

                              const newVal = {
                                id: tempChip.id.trim().toUpperCase(),
                                nama: tempChip.nama.trim(),
                                fruitVariantId: tempChip.fruitVariantId,
                                grade: tempChip.grade,
                                brand: tempChip.brand,
                                packagingSize: tempChip.packagingSize,
                                status: tempChip.status
                              };

                              setChipVariants(prev => [...prev, newVal]);
                              logActivity('CHIP-MASTER', `Registered Chip Variant ${tempChip.id}: ${tempChip.nama}`);
                              setTempChip({ id: '', nama: '', fruitVariantId: '', grade: 'A', brand: 'AGRIDEA', packagingSize: '100g', status: 'Active', notes: '' });
                            }}
                            className="bg-slate-950 text-white font-bold p-1.5 rounded hover:bg-slate-800 w-full cursor-pointer font-sans font-bold"
                          >
                            + Register Chip
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FILTER SECTIONS */}
                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search SKU or Name..."
                          value={chipSearchQuery}
                          onChange={(e) => setChipSearchQuery(e.target.value)}
                          className="bg-white border text-xs placeholder-slate-400 p-1.5 pl-6 rounded outline-none focus:border-slate-400 w-44"
                        />
                        <Search className="absolute left-2 top-2 text-slate-450 w-3.5 h-3.5" />
                      </div>

                      <select
                        value={chipFruitFilter}
                        onChange={(e) => setChipFruitFilter(e.target.value)}
                        className="bg-white border rounded p-1.5 text-[11px]"
                      >
                        <option value="">All Fruits</option>
                        {fruitVariants.map(f => (
                          <option key={f.id} value={f.id}>{f.nama}</option>
                        ))}
                      </select>

                      <select
                        value={chipStatusFilter}
                        onChange={(e) => setChipStatusFilter(e.target.value)}
                        className="bg-white border rounded p-1.5 text-[11px]"
                      >
                        <option value="">All Statuses</option>
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Inactive Only</option>
                      </select>
                    </div>

                    {(chipSearchQuery || chipFruitFilter || chipStatusFilter) && (
                      <button
                        onClick={() => {
                          setChipSearchQuery('');
                          setChipFruitFilter('');
                          setChipStatusFilter('');
                        }}
                        className="text-indigo-600 hover:text-indigo-805 underline font-bold text-[10px]"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  {/* TABLE VIEW */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-sans text-slate-700">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                            <th className="py-2.5 px-3">SKU Code</th>
                            <th className="py-2.5 px-3">Chip Variant Name</th>
                            <th className="py-2.5 px-3">Fruit Reference</th>
                            <th className="py-2.5 px-3">Grade</th>
                            <th className="py-2.5 px-3">Brand</th>
                            <th className="py-2.5 px-3">Pack Size</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-medium text-slate-600">
                          {chipVariants
                            .filter(cv => {
                              const matchQuery = cv.id.toLowerCase().includes(chipSearchQuery.toLowerCase()) || cv.nama.toLowerCase().includes(chipSearchQuery.toLowerCase());
                              const matchFruit = chipFruitFilter ? cv.fruitVariantId === chipFruitFilter : true;
                              const matchStatus = chipStatusFilter ? cv.status === chipStatusFilter : true;
                              return matchQuery && matchFruit && matchStatus;
                            })
                            .map((cv) => {
                              const refFruitObj = fruitVariants.find(f => f.id === cv.fruitVariantId);
                              return (
                                <tr key={cv.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{cv.id}</td>
                                  <td className="py-2.5 px-3 text-slate-900 font-bold">{cv.nama}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="p-1 px-2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-800">
                                      🍎 {refFruitObj ? refFruitObj.nama : 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-bold font-mono text-slate-900">{cv.grade}</td>
                                  <td className="py-2.5 px-3 text-slate-900 uppercase font-bold">{cv.brand}</td>
                                  <td className="py-2.5 px-3 text-indigo-700 font-bold">{cv.packagingSize}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${cv.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                    <span className={cv.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                                      {cv.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingChipId(cv.id);
                                        setTempChip({
                                          id: cv.id,
                                          nama: cv.nama,
                                          fruitVariantId: cv.fruitVariantId,
                                          grade: cv.grade,
                                          brand: cv.brand,
                                          packagingSize: cv.packagingSize,
                                          status: cv.status
                                        });
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 underline font-bold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        const nextStatus = cv.status === 'Active' ? 'Inactive' : 'Active';
                                        setChipVariants(prev => prev.map(c => c.id === cv.id ? { ...c, status: nextStatus } : c));
                                        logActivity('CHIP-MASTER', `Toggled Chip Variant ${cv.id} status to ${nextStatus}`);
                                      }}
                                      className={`${cv.status === 'Active' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'} underline font-bold cursor-pointer`}
                                    >
                                      {cv.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'master-lokasi' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs animate-fade-in" id="master-lokasi-view">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm border-b pb-2 mb-3">Master Data — Factory Locations</h3>
                    <p className="text-slate-500 font-medium font-sans">Manage factory facilities, head offices, and distribution depots across the supply chain.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 text-[10px]">Nama Cabang / Pabrik</label>
                      <input 
                        type="text" 
                        value={tempLokasi.nama} 
                        onChange={(e) => setTempLokasi({ ...tempLokasi, nama: e.target.value })} 
                        className="bg-white border rounded p-1.5 w-full text-xs font-bold outline-none focus:border-emerald-500 transition-all" 
                        placeholder="e.g. Pabrik Wonosobo Baru" 
                        id="location-form-name"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 text-[10px]">Kode Lokasi</label>
                      <input 
                        type="text" 
                        value={tempLokasi.kode} 
                        onChange={(e) => setTempLokasi({ ...tempLokasi, kode: e.target.value })} 
                        className="bg-white border rounded p-1.5 w-full text-xs font-mono font-bold outline-none focus:border-emerald-500 transition-all uppercase" 
                        placeholder="e.g. MPD" 
                        id="location-form-code"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 text-[10px]">Alamat Fisik</label>
                      <input 
                        type="text" 
                        value={tempLokasi.alamat} 
                        onChange={(e) => setTempLokasi({ ...tempLokasi, alamat: e.target.value })} 
                        className="bg-white border rounded p-1.5 w-full text-xs font-medium outline-none focus:border-emerald-500 transition-all" 
                        placeholder="e.g. Kawasan Dieng Km 4" 
                        id="location-form-address"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 text-[10px]">Tipe Pabrik</label>
                      <select
                        value={tempLokasi.tipe || 'Production Factory'}
                        onChange={(e) => setTempLokasi({ ...tempLokasi, tipe: e.target.value })}
                        className="bg-white border rounded p-1.5 w-full text-xs cursor-pointer font-bold"
                      >
                        <option value="Head Office">Head Office</option>
                        <option value="Production Factory">Production Factory</option>
                        <option value="Branch Office">Branch Office</option>
                        <option value="Packaging Facility">Packaging Facility</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      {editingLokasiId ? (
                        <>
                          <button
                            onClick={() => {
                              if (!tempLokasi.nama) return;
                              setLokasi(prev => prev.map(l => {
                                if (l.id === editingLokasiId) {
                                  return {
                                    ...l,
                                    nama: tempLokasi.nama,
                                    kode: tempLokasi.kode.toUpperCase(),
                                    alamat: tempLokasi.alamat,
                                    tipe: tempLokasi.tipe || 'Production Factory',
                                    status: tempLokasi.status || 'Active'
                                  };
                                }
                                return l;
                              }));
                              logActivity('FACTORY-MASTER', `Updated Factory metadata for: ${tempLokasi.nama}`);
                              setEditingLokasiId(null);
                              setTempLokasi({ name: '', alamat: '', code: '', tipe: 'Production Factory', status: 'Active' });
                            }}
                            className="bg-emerald-600 text-white font-bold p-1.5 px-3 rounded hover:bg-emerald-500 w-full text-center text-xs cursor-pointer shadow-xs font-sans"
                            id="location-submit-btn"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setEditingLokasiId(null);
                              setTempLokasi({ name: '', alamat: '', code: '', tipe: 'Production Factory', status: 'Active' });
                            }}
                            className="bg-slate-300 text-slate-705 font-bold p-1.5 px-3 rounded hover:bg-slate-202 w-full text-center text-xs cursor-pointer font-sans"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            if (!tempLokasi.nama) return;
                            const nextId = (tempLokasi.kode || 'LOK-' + Math.floor(Math.random() * 100)).toUpperCase();
                            setLokasi(prev => [...prev, {
                              id: nextId,
                              nama: tempLokasi.nama,
                              kode: nextId,
                              alamat: tempLokasi.alamat || 'Alamat Pabrik Baru',
                              tipe: tempLokasi.tipe || 'Production Factory',
                              status: 'Active'
                            }]);
                            logActivity('FACTORY-MASTER', `Created new Factory facility record: ${tempLokasi.nama}`);
                            setTempLokasi({ name: '', alamat: '', code: '', tipe: 'Production Factory', status: 'Active' });
                          }}
                          className="bg-slate-950 text-white font-bold p-1.5 rounded hover:bg-slate-800 w-full cursor-pointer shadow-xs font-sans text-xs"
                          id="location-submit-btn"
                        >
                          Daftar Cabang
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-sans">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                            <th className="py-2.5 px-3">ID Lokasi</th>
                            <th className="py-2.5 px-3">Kode Cabang</th>
                            <th className="py-2.5 px-3">Nama Lokasi Unit</th>
                            <th className="py-2.5 px-3">Alamat Cabang</th>
                            <th className="py-2.5 px-3">Tipe</th>
                            <th className="py-2.5 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lokasi.map(l => (
                            <tr key={l.id} className="hover:bg-slate-50 border-b last:border-0">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{l.id}</td>
                              <td className="py-2.5 px-3 font-mono font-extrabold text-slate-950 text-xs">{l.kode}</td>
                              <td className="py-2.5 px-3 font-bold text-indigo-700">{l.nama}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-bold">{l.alamat}</td>
                              <td className="py-2.5 px-3">
                                <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase font-sans ${
                                  l.tipe === 'Head Office' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                  l.tipe === 'Production Factory' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                  l.tipe === 'Packaging Facility' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {l.tipe || 'Pabrik'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setEditingLokasiId(l.id);
                                    setTempLokasi({
                                      nama: l.nama,
                                      kode: l.kode,
                                      alamat: l.alamat || '',
                                      tipe: l.tipe || 'Production Factory',
                                      status: l.status || 'Active'
                                    });
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 underline font-extrabold text-[10px] cursor-pointer"
                                  id={`edit-location-btn-${l.id}`}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'master-mesin' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  
                  {/* MACHINE REGISTRATION FORM */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        🔧 {editingMesinId ? 'Ubah Data Mesin & Kondisi Operasional' : 'Daftarkan Mesin Vacuum Frying / Produksi Baru'}
                      </h4>
                      <p className="text-slate-500 text-[11px]">Daftarkan peralatan baru atau sesuaikan kapasitas spesifikasi mesin untuk optimasi per giliran kerja (shift):</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-750">Nama / Model Mesin</label>
                          <input 
                            type="text" 
                            value={tempMesin.nama} 
                            onChange={(e) => setTempMesin({ ...tempMesin, nama: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full font-bold outline-none focus:border-indigo-500" 
                            placeholder="Vacuum Fryer V-04 Super" 
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-750">Tipe / Kategori Fungsi</label>
                          <select 
                            value={tempMesin.tipe} 
                            onChange={(e) => setTempMesin({ ...tempMesin, tipe: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full cursor-pointer outline-none focus:border-indigo-500"
                          >
                            <option value="Vacuum Frying">Vacuum Frying (Frying Unit)</option>
                            <option value="Peeling Machine">Peeling Machine (Kupas Otomatis)</option>
                            <option value="Slicing Machine">Slicing Machine (Perajang Tipis)</option>
                            <option value="Spinning Machine">Spinning Machine (Peniris Minyak)</option>
                            <option value="Packaging Machine">Packaging Machine (Sealer Area)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-750">Kapasitas Kerja Standar</label>
                          <input 
                            type="text" 
                            value={tempMesin.kapasitas} 
                            onChange={(e) => setTempMesin({ ...tempMesin, kapasitas: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full outline-none focus:border-indigo-500 font-mono" 
                            placeholder="50 kg/batch atau 100 kg/jam" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-semibold block mb-1 text-slate-755">Penempatan Pabrik</label>
                            <select 
                              value={tempMesin.locationsId} 
                              onChange={(e) => setTempMesin({ ...tempMesin, locationsId: e.target.value })} 
                              className="bg-white border text-xs rounded p-2 w-full cursor-pointer outline-none"
                            >
                              {SEED_LOKASI.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-slate-755">Status Unit</label>
                            <select 
                              value={tempMesin.status} 
                              onChange={(e) => setTempMesin({ ...tempMesin, status: e.target.value })} 
                              className="bg-white border text-xs rounded p-2 w-full cursor-pointer outline-none font-bold text-amber-900"
                            >
                              <option value="Operational">Operational (OK)</option>
                              <option value="Maintenance">Maintenance (Servis)</option>
                              <option value="Broken">Broken (Rusak Berat)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-3 border-t">
                        {editingMesinId ? (
                          <>
                            <button
                              onClick={() => {
                                if (!tempMesin.nama) return;
                                setMesin(prev => prev.map(m => {
                                  if (m.id === editingMesinId) {
                                    return {
                                      ...m,
                                      nama: tempMesin.nama.trim(),
                                      tipe: tempMesin.tipe,
                                      kapasitas: tempMesin.kapasitas.trim(),
                                      locationsId: tempMesin.locationsId,
                                      status: tempMesin.status
                                    };
                                  }
                                  return m;
                                }));
                                logActivity('Master Data', `Mengupdate data mesin ${tempMesin.nama} (${tempMesin.status}).`);
                                setEditingMesinId(null);
                                setTempMesin({ nama: '', tipe: 'Vacuum Frying', locationsId: 'JKT', kapasitas: '50 kg/batch', status: 'Operational' });
                              }}
                              className="bg-emerald-600 text-white font-bold p-2 px-6 rounded-lg hover:bg-emerald-500 cursor-pointer shadow-xs"
                            >
                              Simpan Mesin
                            </button>
                            <button
                              onClick={() => {
                                setEditingMesinId(null);
                                setTempMesin({ nama: '', tipe: 'Vacuum Frying', locationsId: 'JKT', kapasitas: '50 kg/batch', status: 'Operational' });
                              }}
                              className="bg-slate-200 text-slate-700 font-bold p-2 px-5 rounded-lg hover:bg-slate-300 cursor-pointer"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (!tempMesin.nama) return;
                              const nextId = 'M-' + (mesin.length + 101);
                              setMesin(prev => [...prev, {
                                id: nextId,
                                nama: tempMesin.nama.trim(),
                                tipe: tempMesin.tipe,
                                kapasitas: tempMesin.kapasitas.trim(),
                                locationsId: tempMesin.locationsId,
                                status: tempMesin.status
                              }]);
                              logActivity('Master Data', `Mendaftarkan mesin produksi baru: ${tempMesin.nama}.`);
                              setTempMesin({ nama: '', tipe: 'Vacuum Frying', locationsId: 'JKT', kapasitas: '50 kg/batch', status: 'Operational' });
                            }}
                            className="bg-slate-950 text-white font-bold p-2 px-6 rounded-lg hover:bg-slate-800 cursor-pointer shadow-xs"
                          >
                            Daftarkan Alat Mesin
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Machine Telemetry card */}
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[10px] text-indigo-400 tracking-wider">UNIT STATUS MONITOR</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            tempMesin.status === 'Operational' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-805'
                          }`}>{tempMesin.status.toUpperCase()}</span>
                        </div>
                        <h5 className="font-bold text-white text-xs mt-2">{tempMesin.nama || 'Vacuum Fryer V-XX'}</h5>
                        <p className="text-slate-400 text-[10px] mt-1">Status dan kapasitas standar untuk proses penggorengan:</p>
                      </div>

                      <div className="border border-slate-800 bg-slate-950 p-3 rounded-lg text-[10px] space-y-1 text-slate-300 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kapasitas:</span>
                          <span className="font-extrabold text-white text-right">{tempMesin.kapasitas || '50 kg/batch'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cabang Pabrik:</span>
                          <span className="text-right text-indigo-300">{SEED_LOKASI.find(l => l.id === tempMesin.locationsId)?.nama || 'Malang'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fungsi Unit:</span>
                          <span className="text-right">{tempMesin.tipe}</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 leading-normal border-t border-slate-800 pt-2 bg-slate-950/20 p-1.5 rounded">
                        📈 Mesin ini akan tersedia untuk dipilih pada form catatan batch Vacuum Frying harian.
                      </div>
                    </div>
                  </div>

                  {/* MACHINES DATABASE GRID */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                          <th className="py-2.5 px-3">ID Mesin</th>
                          <th className="py-2.5 px-3">Model No / Deskripsi Alat</th>
                          <th className="py-2.5 px-3">Divisi Unit</th>
                          <th className="py-2.5 px-3">Lokasi Cabang</th>
                          <th className="py-2.5 px-3">Kapasitas Kerja</th>
                          <th className="py-2.5 px-3">Status Operasional</th>
                          <th className="py-2.5 px-3 text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mesin.filter(m => m.nama.toLowerCase().includes(filterSearch.toLowerCase())).map(m => (
                          <tr key={m.id} className="hover:bg-slate-50 border-b last:border-0">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.id}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{m.nama}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-indigo-755">{m.tipe}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-sans">
                              {SEED_LOKASI.find(l => l.id === m.locationsId)?.nama || 'Pabrik Malang (HQ)'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-950">{m.kapasitas}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                m.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 
                                m.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>{m.status}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingMesinId(m.id);
                                  setTempMesin({
                                    nama: m.nama,
                                    tipe: m.tipe || 'Vacuum Frying',
                                    locationsId: m.locationsId || 'JKT',
                                    kapasitas: m.kapasitas || '50 kg/batch',
                                    status: m.status || 'Operational'
                                  });
                                }}
                                className="text-indigo-600 hover:text-indigo-900 font-bold text-[10px] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin mendelet registrasi mesin ${m.nama}?`)) {
                                    setMesin(prev => prev.filter(item => item.id !== m.id));
                                    logActivity('Master Data', `Mendelete unit mesin ${m.nama}.`);
                                  }
                                }}
                                className="text-rose-650 hover:text-rose-900 font-bold text-[10px] cursor-pointer"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'pengadaan-po' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Form Input PO */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        📦 Penerbitan Purchase Order (PO) &amp; Pengadaan Bahan
                      </h4>
                      <p className="text-slate-500 text-[11px]">Proses pengadaan bahan baku segar dari mitra petani, LPG boiler, atau standing pouch kustom supplier:</p>

                      <div className="border border-indigo-100 bg-indigo-50/25 p-4 rounded-xl space-y-3">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-indigo-950">
                            <input 
                              type="radio" 
                              checked={tempPO.procurementType === 'by-weight'} 
                              onChange={() => setTempPO({ ...tempPO, procurementType: 'by-weight', item: 'Apel Segar' })} 
                              className="accent-indigo-600"
                            />
                            Bahan Baku Segar (Kg)
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-indigo-950">
                            <input 
                              type="radio" 
                              checked={tempPO.procurementType === 'by-piece'} 
                              onChange={() => setTempPO({ ...tempPO, procurementType: 'by-piece', item: 'Aluminium Pouch Roll' })} 
                              className="accent-indigo-600"
                            />
                            Packaging / Penunjang (Pcs)
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Mitra Supplier / Rekanan</label>
                          <select 
                            value={tempPO.supplierId} 
                            onChange={(e) => setTempPO({ ...tempPO, supplierId: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full cursor-pointer outline-none focus:border-indigo-500 font-bold"
                          >
                            {supplier.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.jenisBahan})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Nama Bahan / Deskripsi Pengadaan</label>
                          <input 
                            type="text" 
                            value={tempPO.item} 
                            onChange={(e) => setTempPO({ ...tempPO, item: e.target.value })} 
                            className="bg-white border rounded p-2 text-xs w-full outline-none focus:border-indigo-500 font-semibold" 
                            placeholder="e.g. Apel Segar Gajah" 
                          />
                        </div>

                        {tempPO.procurementType === 'by-weight' ? (
                          <>
                            <div>
                              <label className="font-semibold block mb-1 text-slate-700">Volume Pengadaan (Kg)</label>
                              <input 
                                type="number" 
                                value={tempPO.qty} 
                                onChange={(e) => setTempPO({ ...tempPO, qty: Number(e.target.value) || 0 })} 
                                className="bg-white border rounded p-2 text-xs w-full outline-none font-mono focus:border-indigo-500" 
                                placeholder="500" 
                              />
                            </div>
                            <div>
                              <label className="font-semibold block mb-1 text-slate-700">Harga per Kg (Rp)</label>
                              <input 
                                type="number" 
                                value={tempPO.pricePerKg} 
                                onChange={(e) => setTempPO({ ...tempPO, pricePerKg: Number(e.target.value) || 0 })} 
                                className="bg-white border rounded p-2 text-xs w-full outline-none font-mono focus:border-indigo-500" 
                                placeholder="12000" 
                              />
                            </div>
                            <div>
                              <label className="font-semibold block mb-1 text-slate-700">Grade / Standard Mutu</label>
                              <select 
                                value={tempPO.grade} 
                                onChange={(e) => setTempPO({ ...tempPO, grade: e.target.value })} 
                                className="bg-white border rounded p-2 text-xs w-full cursor-pointer outline-none focus:border-indigo-500"
                              >
                                <option value="A">Grade A (Super Besar)</option>
                                <option value="B">Grade B (Medium Matang)</option>
                                <option value="C">Grade C (Kecil / BS)</option>
                                <option value="S">Grade S (Premium Ekspor)</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="font-semibold block mb-1 text-slate-700">Volume Pengadaan (Pcs)</label>
                              <input 
                                type="number" 
                                value={tempPO.qtyPcs} 
                                onChange={(e) => setTempPO({ ...tempPO, qtyPcs: Number(e.target.value) || 0 })} 
                                className="bg-white border rounded p-2 text-xs w-full outline-none font-mono focus:border-indigo-500" 
                                placeholder="1000" 
                              />
                            </div>
                            <div>
                              <label className="font-semibold block mb-1 text-slate-700">Harga per Piece (Rp)</label>
                              <input 
                                type="number" 
                                value={tempPO.pricePerPiece} 
                                onChange={(e) => setTempPO({ ...tempPO, pricePerPiece: Number(e.target.value) || 0 })} 
                                className="bg-white border rounded p-2 text-xs w-full outline-none font-mono focus:border-indigo-500" 
                                placeholder="1200" 
                              />
                            </div>
                            <div>
                              <label className="font-semibold block mb-1 text-slate-700">Grade Kualitas Bahan</label>
                              <select 
                                value={tempPO.grade} 
                                onChange={(e) => setTempPO({ ...tempPO, grade: e.target.value })} 
                                className="bg-white border rounded p-2 text-xs w-full cursor-pointer outline-none focus:border-indigo-500"
                              >
                                <option value="A">Grade Premium (Aluminium 120mc)</option>
                                <option value="B">Grade Standar (Aluminium 100mc)</option>
                                <option value="C">Eco Pack (Standard Plastik)</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="font-semibold block mb-1 text-slate-700">Ongkos Kirim / Freight (Rp)</label>
                          <input 
                            type="number" 
                            value={tempPO.shippingCost} 
                            onChange={(e) => setTempPO({ ...tempPO, shippingCost: Number(e.target.value) || 0 })} 
                            className="bg-white border rounded p-2 text-xs w-full outline-none font-mono focus:border-indigo-500" 
                            placeholder="250000" 
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t">
                        <button
                          onClick={() => {
                            if (!tempPO.item) return;
                            const isWeight = tempPO.procurementType === 'by-weight';
                            const itemPrice = isWeight ? tempPO.pricePerKg : tempPO.pricePerPiece;
                            const itemQty = isWeight ? tempPO.qty : tempPO.qtyPcs;
                            const itemTotal = (itemQty * itemPrice);
                            
                            const nextPoId = 'PO-' + (purchaseOrders.length + 101);
                            const nextPoNo = `PO/2026/06/${Math.floor(Math.random() * 20 + 10)}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
                            
                            setPurchaseOrders(prev => [...prev, {
                              id: nextPoId,
                              poNumber: nextPoNo,
                              supplierId: tempPO.supplierId,
                              lokasiId: selectedLokasi || 'JKT',
                              tanggal: new Date().toISOString().split('T')[0],
                              items: [{ 
                                namaBahan: `${tempPO.item} (Grade ${tempPO.grade})`, 
                                qtyKg: isWeight ? itemQty : 0, 
                                qtyPcs: !isWeight ? itemQty : 0, 
                                hargaPerKg: isWeight ? itemPrice : 0, 
                                hargaPerPc: !isWeight ? itemPrice : 0, 
                                totalHarga: itemTotal + tempPO.shippingCost,
                                shippingCost: tempPO.shippingCost
                              }],
                              status: 'Approved',
                              createdById: 'U-02'
                            }]);
                            
                            logActivity('Logistik', `Menerbitkan Purchase Order ${nextPoNo} kepada supplier.`);
                          }}
                          className="bg-slate-950 text-white font-bold p-2 px-6 rounded-lg hover:bg-slate-800 cursor-pointer shadow-xs"
                        >
                          Terbitkan Purchase Order (PO)
                        </button>
                      </div>
                    </div>

                    {/* PO Preview Panel */}
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="font-bold text-[10px] text-indigo-400 tracking-wider block uppercase">📄 DRAFT PREVIEW TRANSY</span>
                        <h5 className="font-black text-rose-500 font-sans text-xs tracking-wide uppercase mt-1">ESTIMASI PO BERJALAN</h5>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 font-sans text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">SUPPLIER:</span>
                          <span className="font-bold text-white text-xs">{supplier.find(s => s.id === tempPO.supplierId)?.nama || 'No Supplier'}</span>
                        </div>

                        <div className="border-t border-dashed border-slate-800 pt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Deskripsi Item :</span>
                            <span className="font-semibold text-white">{tempPO.item} (G-{tempPO.grade})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Volume :</span>
                            <span className="font-mono text-white text-right">
                              {tempPO.procurementType === 'by-weight' ? `${tempPO.qty} Kg` : `${tempPO.qtyPcs} Pcs`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Harga Satuan :</span>
                            <span className="font-mono text-indigo-300">
                              Rp {tempPO.procurementType === 'by-weight' 
                                ? tempPO.pricePerKg.toLocaleString('id-ID') 
                                : tempPO.pricePerPiece.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800 pt-2">
                            <span className="text-slate-400">Subtotal Item :</span>
                            <span className="font-mono text-white font-bold">
                              Rp {(tempPO.procurementType === 'by-weight' 
                                ? tempPO.qty * tempPO.pricePerKg 
                                : tempPO.qtyPcs * tempPO.pricePerPiece).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ongkos Kirim :</span>
                            <span className="font-mono text-amber-500 font-semibold">Rp {tempPO.shippingCost.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-800 pt-2 flex justify-between items-center bg-slate-900 p-2 rounded">
                          <span className="font-bold text-slate-400 text-[10px]">TOTAL VALUE:</span>
                          <span className="font-mono font-black text-emerald-400 text-xs shadow-xs">
                            Rp {(
                              (tempPO.procurementType === 'by-weight' 
                                ? tempPO.qty * tempPO.pricePerKg 
                                : tempPO.qtyPcs * tempPO.pricePerPiece) + tempPO.shippingCost
                            ).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <p className="text-[9px] text-slate-400 leading-normal bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        🔒 Penerbitan PO ini secara otomatis mengunci kuotasi harga dari supplier bersangkutan and dialokasikan ke forecast anggaran belanja pengadaan.
                      </p>
                    </div>

                  </div>

                  {/* List Grid table PO */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 font-bold font-sans">
                          <th className="py-2.5 px-3">No Purchase Order</th>
                          <th className="py-2.5 px-3">Tanggal Terbit</th>
                          <th className="py-2.5 px-3">Mitra Supplier</th>
                          <th className="py-2.5 px-3">Uraian Bahan Baku / Kelengkapan</th>
                          <th className="py-2.5 px-3 text-right">Ongkir / Freight</th>
                          <th className="py-2.5 px-3 text-right">Total Transaksi (Inc. Ongkir)</th>
                          <th className="py-2.5 px-3 text-right">Status PO</th>
                          <th className="py-2.5 px-3 text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrders.filter(p => p.poNumber.toLowerCase().includes(filterSearch.toLowerCase()) || (supplier.find(s => s.id === p.supplierId)?.nama || '').toLowerCase().includes(filterSearch.toLowerCase())).map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 border-b last:border-0 font-sans">
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-950">
                              <span>{p.poNumber}</span>
                              <span className="block text-[8px] text-slate-400">{p.id}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{p.tanggal}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-850">
                              {supplier.find(s => s.id === p.supplierId)?.nama || p.supplierId}
                            </td>
                            <td className="py-2.5 px-3">
                              {p.items.map((item: any, idx: number) => (
                                <div key={idx} className="space-y-0.5">
                                  <span className="font-extrabold text-slate-900 block text-xs">{item.namaBahan}</span>
                                  <span className="text-[10px] text-slate-500 block font-mono">
                                    {item.qtyKg > 0 
                                      ? `${item.qtyKg} Kg @ Rp ${item.hargaPerKg.toLocaleString('id-ID')}/Kg`
                                      : `${item.qtyPcs || 0} Pcs @ Rp ${(item.hargaPerPc || item.hargaPerKg || 0).toLocaleString('id-ID')}/Pcs`
                                    }
                                  </span>
                                </div>
                              ))}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                              Rp {(p.items[0]?.shippingCost || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-950 font-mono text-xs">
                              Rp {p.items.reduce((s: number, item: any) => {
                                const base = item.totalHarga || (item.qtyKg > 0 ? item.qtyKg * item.hargaPerKg : (item.qtyPcs || 0) * (item.hargaPerPc || 0));
                                return s + base + (item.shippingCost || 0);
                              }, 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'Closed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                p.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                                'bg-yellow-105 text-yellow-850 border border-yellow-200'
                              }`}>{p.status}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              {p.status !== 'Closed' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Tutup / selesaikan Purchase Order ${p.poNumber}? Ini akan mengarsipkan status PO.`)) {
                                      setPurchaseOrders(prev => prev.map(po => {
                                        if (po.id === p.id) {
                                          return { ...po, status: 'Closed' as const };
                                        }
                                        return po;
                                      }));
                                      logActivity('Logistik', `Menyelesaikan dan mengarsipkan PO ${p.poNumber}.`);
                                    }
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 font-semibold text-[10px] cursor-pointer underline"
                                >
                                  Close PO
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus PO ${p.poNumber}?`)) {
                                    setPurchaseOrders(prev => prev.filter(po => po.id !== p.id));
                                    logActivity('Logistik', `Membatalkan / mendelete Purchase Order ${p.poNumber}.`);
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-900 font-semibold text-[10px] cursor-pointer"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'pengadaan-penerimaan' && (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Penerimaan Bahan Baku (Logistik Log)</h4>
                      <p className="text-[11px] text-slate-500">Rekonsiliasi fisik buah masuk, sertifikasi grade, PIC, dan nota pembukuan.</p>
                    </div>
                    {!isAddingPenerimaan && !editingPenerimaan && (
                      <button
                        onClick={() => {
                          setIsAddingPenerimaan(true);
                          setEditingPenerimaan(null);
                          // Reset to defaults
                          setRcvSupplierId('SUP-01');
                          setRcvJenisBahan('Apel Segar');
                          setRcvGrade('A');
                          setRcvBerat(150);
                          setRcvHarga(12000);
                          setRcvPic('Budi Penerima');
                          setRcvNotaUrl('nota-rcv-' + Math.floor(Math.random() * 900 + 100) + '.jpg');
                          setRcvFotoUrl('foto-buah-' + Math.floor(Math.random() * 900 + 100) + '.jpg');
                          setRcvNotes('Kondisi segar, boks bersih.');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded text-[11px] shadow cursor-pointer transition flex items-center gap-1.5"
                      >
                        <span>+ Tambah Penerimaan Baru</span>
                      </button>
                    )}
                  </div>

                  {/* Add or Edit Form Panel */}
                  {(isAddingPenerimaan || editingPenerimaan) && (
                    <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 space-y-4 shadow-sm animate-fade-in">
                      <h5 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        📁 {editingPenerimaan ? `Edit Penerimaan: ${editingPenerimaan.id}` : 'Input Penerimaan Bahan Baku Baru'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Supplier</label>
                          <select value={rcvSupplierId} onChange={(e) => setRcvSupplierId(e.target.value)} className="bg-white border w-full rounded p-2 text-xs">
                            {supplier.map((s: any) => (
                              <option key={s.id} value={s.id}>{s.nama}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Jenis Bahan / Varian Buah</label>
                          <select value={rcvJenisBahan} onChange={(e) => setRcvJenisBahan(e.target.value)} className="bg-white border w-full rounded p-2 text-xs select-rcv-jenis-bahan">
                            <option value="Apel Segar">Apel Segar</option>
                            <option value="Nangka Segar">Nangka Segar</option>
                            <option value="Pisang Segar">Pisang Segar</option>
                            <option value="Salak Segar">Salak Segar</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Grade</label>
                          <select value={rcvGrade} onChange={(e: any) => setRcvGrade(e.target.value)} className="bg-white border w-full rounded p-2 text-xs">
                            <option value="A">Grade A (Super)</option>
                            <option value="B">Grade B (Normal)</option>
                            <option value="C">Grade C (Pecah/Kecil)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Berat Diterima (Kg)</label>
                          <input type="number" value={rcvBerat} onChange={(e) => setRcvBerat(Math.max(1, parseFloat(e.target.value) || 0))} className="border w-full bg-white rounded p-1.5 font-bold" />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Unit Rate (Rp / Kg)</label>
                          <input type="number" value={rcvHarga} onChange={(e) => setRcvHarga(Math.max(1, parseInt(e.target.value) || 0))} className="border w-full bg-white rounded p-1.5 font-bold text-indigo-700" />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">PIC Penerima (Gudang)</label>
                          <input type="text" value={rcvPic} onChange={(e) => setRcvPic(e.target.value)} className="border w-full bg-white rounded p-1.5 text-xs font-bold" placeholder="Nama PIC Penerima" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Upload Slip Nota (Nama File / Link)</label>
                          <div className="flex gap-2">
                            <input type="text" value={rcvNotaUrl} onChange={(e) => setRcvNotaUrl(e.target.value)} className="border w-full bg-slate-50 rounded p-1.5 font-mono text-[10px]" />
                            <label className="bg-slate-200 px-3 py-1.5 rounded cursor-pointer hover:bg-slate-300 font-semibold text-[10px] flex items-center shrink-0">
                              📷 Browse
                              <input type="file" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setRcvNotaUrl('nota_' + e.target.files[0].name);
                                }
                              }} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Upload Foto Barang (Foto Fisik)</label>
                          <div className="flex gap-2">
                            <input type="text" value={rcvFotoUrl} onChange={(e) => setRcvFotoUrl(e.target.value)} className="border w-full bg-slate-50 rounded p-1.5 font-mono text-[10px]" />
                            <label className="bg-slate-200 px-3 py-1.5 rounded cursor-pointer hover:bg-slate-300 font-semibold text-[10px] flex items-center shrink-0">
                              📸 Capture
                              <input type="file" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setRcvFotoUrl('foto_' + e.target.files[0].name);
                                }
                              }} className="hidden" />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Keterangan Tambahan & Catatan Driver</label>
                          <input type="text" value={rcvNotes} onChange={(e) => setRcvNotes(e.target.value)} className="border w-full bg-white rounded p-1.5 text-xs" placeholder="Catatan plat mobil, suhu kirim dsb" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingPenerimaan(false);
                            setEditingPenerimaan(null);
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-4 rounded font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingPenerimaan) {
                              // EDIT ACTION with stock reconciliation
                              const oldRecord = editingPenerimaan;
                              // 1. Reverse old stock added
                              setStocks(prev => {
                                let st = adjustStockInner(prev, oldRecord.jenisBahan, -oldRecord.beratDiterimaKg);
                                // 2. Add new weight
                                return adjustStockInner(st, rcvJenisBahan, rcvBerat);
                              });

                              // Update record in list
                              setPenerimaan(prev => prev.map(p => {
                                if (p.id === oldRecord.id) {
                                  return {
                                    ...p,
                                    supplierId: rcvSupplierId,
                                    jenisBahan: rcvJenisBahan,
                                    grade: rcvGrade,
                                    beratDiterimaKg: rcvBerat,
                                    hargaPerKg: rcvHarga,
                                    totalHarga: rcvBerat * rcvHarga,
                                    picPenerima: rcvPic,
                                    notaUrl: rcvNotaUrl,
                                    fotoBarangUrl: rcvFotoUrl,
                                    keteranganTambahan: rcvNotes
                                  };
                                }
                                return p;
                              }));

                              logActivity('Logistik', `Mengedit data penerimaan ${oldRecord.id}, mengupdate stok & PIC.`);
                            } else {
                              // ADD NEW ACTION
                              handleActionCallback('PENERIMAAN', {
                                supplierId: rcvSupplierId,
                                jenisBahan: rcvJenisBahan,
                                grade: rcvGrade,
                                beratDiterimaKg: rcvBerat,
                                hargaPerKg: rcvHarga,
                                picPenerima: rcvPic,
                                notaUrl: rcvNotaUrl,
                                fotoBarangUrl: rcvFotoUrl,
                                keteranganTambahan: rcvNotes
                              });
                              logActivity('Logistik', `Menginput penerimaan bahan baku segar baru seberat ${rcvBerat} kg.`);
                            }
                            setIsAddingPenerimaan(false);
                            setEditingPenerimaan(null);
                          }}
                          className="bg-slate-950 hover:bg-slate-800 text-white py-1.5 px-4 rounded font-bold text-xs shadow cursor-pointer text-frying-save-changes"
                        >
                          {editingPenerimaan ? 'Simpan Perubahan' : 'Simpan Penerimaan'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Desktop Table View */}
                  <div className="overflow-x-auto shadow border rounded-lg">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-mono">
                      <thead>
                        <tr className="border-b bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-3">ID Rcv</th>
                          <th className="py-3 px-3">Bahan Baku & Grade</th>
                          <th className="py-3 px-3">Supplier</th>
                          <th className="py-3 px-3 text-right">Berat (Kg)</th>
                          <th className="py-3 px-3 text-right">Harga / Kg</th>
                          <th className="py-3 px-3 text-right">Total Nilai</th>
                          <th className="py-3 px-3">PIC Penerima</th>
                          <th className="py-3 px-3">Nota & Foto</th>
                          <th className="py-3 px-3">Notes</th>
                          <th className="py-3 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {penerimaan.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 border-b">
                            <td className="py-3 px-3 font-bold text-slate-900">{p.id}</td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800 block text-xs">{p.jenisBahan}</span>
                              <span className={`inline-block text-[9px] px-1 bg-amber-50 text-amber-800 font-black rounded border border-amber-200 mt-0.5`}>
                                Grade: {p.grade}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-sans">{supplier.find(s => s.id === p.supplierId)?.nama || p.supplierId}</td>
                            <td className="py-3 px-3 text-right font-black text-slate-900">{p.beratDiterimaKg} kg</td>
                            <td className="py-3 px-3 text-right">Rp {p.hargaPerKg.toLocaleString('id-ID')}</td>
                            <td className="py-3 px-3 text-right font-black text-teal-800">Rp {p.totalHarga.toLocaleString('id-ID')}</td>
                            <td className="py-3 px-3 text-slate-600 text-xs font-sans font-bold">{p.picPenerima || 'Satpam Shift 1'}</td>
                            <td className="py-3 px-3 space-y-1">
                              <span className="flex items-center gap-1.5 text-[10px] text-indigo-800 underline cursor-pointer" title={p.notaUrl || 'nota_order_23.jpg'}>
                                📄 {p.notaUrl ? p.notaUrl.substring(0, 16) : 'nota_order_23.jpg'}...
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] text-emerald-800 underline cursor-pointer" title={p.fotoBarangUrl || 'apel_grade_a.jpg'}>
                                📷 {p.fotoBarangUrl ? p.fotoBarangUrl.substring(0, 16) : 'apel_grade_a.jpg'}...
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-sans italic text-[10px] max-w-[150px] truncate" title={p.keteranganTambahan || p.notes || '-'}>
                              {p.keteranganTambahan || p.notes || '-'}
                            </td>
                            <td className="py-3 px-3 text-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPenerimaan(p);
                                  setIsAddingPenerimaan(false);
                                  // Populate states
                                  setRcvSupplierId(p.supplierId);
                                  setRcvJenisBahan(p.jenisBahan);
                                  setRcvGrade(p.grade);
                                  setRcvBerat(p.beratDiterimaKg);
                                  setRcvHarga(p.hargaPerKg);
                                  setRcvPic(p.picPenerima || 'Satpam Shift 1');
                                  setRcvNotaUrl(p.notaUrl || 'nota_order_23.jpg');
                                  setRcvFotoUrl(p.fotoBarangUrl || 'apel_grade_a.jpg');
                                  setRcvNotes(p.keteranganTambahan || p.notes || '');
                                }}
                                className="text-indigo-600 hover:text-indigo-900 font-bold text-[10px] cursor-pointer outline-none bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus data Penerimaan ${p.id}? Ini akan memangkas / menarik balik seberat ${p.beratDiterimaKg} kg dari persediaan fisik!`)) {
                                    // Reverse stock added
                                    setStocks(prev => adjustStockInner(prev, p.jenisBahan, -p.beratDiterimaKg));
                                    setPenerimaan(prev => prev.filter(rec => rec.id !== p.id));
                                    logActivity('Logistik', `Menghapus Penerimaan Bahan Baku ${p.id} seberat ${p.beratDiterimaKg} kg.`);
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-900 font-bold text-[10px] cursor-pointer outline-none bg-rose-50 px-1.5 py-0.5 rounded border border-rose-250 transition"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'batch-history' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold font-mono">
                        <th className="py-2 px-3">Batch ID</th>
                        <th className="py-2 px-3">Bahan Utama</th>
                        <th className="py-2 px-3">Tgl Mulai</th>
                        <th className="py-2 px-3 text-right">Cogs Estimasi</th>
                        <th className="py-2 px-3 text-right">Status Rantai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedBatchDetail(b)} title="Klik untuk melihat Detail Laporan Batch">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{b.id}</td>
                          <td className="py-2.5 px-3 font-bold">{b.namaBahan} Chips</td>
                          <td className="py-2.5 px-3 font-mono">{b.tanggalMulai}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">Rp {b.totalBiayaBahan?.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase text-[9px]">{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeMenu === 'inventory-opname' && (
                <div className="space-y-6 animate-fade-in" id="inventory-opname-view">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form Section 1: Submit Stock Opname Audit Draft */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-900">
                          📝 Pengajuan Form Stock Opname & Penyelarasan
                        </h4>
                        <p className="text-[10px] text-slate-500">Mencatat hasil inspeksi lapangan fisik vs data sistem untuk direkonsiliasi.</p>
                      </div>

                      <div className="space-y-3 text-[11px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-semibold text-slate-600 block mb-0.5">Pilih Item Inventori</label>
                            <select value={soItemKey} onChange={(e) => {
                              setSoItemKey(e.target.value);
                              // Lookup current system stock
                              const st = stocks.find(s => s.key === e.target.value && s.lokasiId === selectedLokasi);
                              setSoStokSistem(st ? st.qty : 0);
                            }} className="border w-full rounded p-1.5 bg-slate-50 text-[11px]">
                              {stocks.filter(s => s.lokasiId === selectedLokasi).map(s => (
                                <option key={s.key} value={s.key}>{s.key} ({s.qty} {s.unit})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold text-slate-600 block mb-0.5">Stok Sistem (Sistem)</label>
                            <input type="number" readOnly value={soStokSistem} className="border w-full rounded p-1.5 bg-slate-100 font-bold font-mono text-[11px]" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-semibold text-slate-600 block mb-0.5">Stok Fisik (Gudang)</label>
                            <input type="number" value={soStokFisik} onChange={(e) => setSoStokFisik(parseFloat(e.target.value) || 0)} className="border w-full rounded p-1.5 font-bold font-mono text-[11px]" />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-600 block mb-0.5">Selisih Discrepancy</label>
                            <span className={`block p-1.5 rounded font-black font-mono text-center text-xs ${soStokFisik - soStokSistem === 0 ? 'bg-slate-100 text-slate-700' : soStokFisik - soStokSistem > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-850'}`}>
                              {soStokFisik - soStokSistem} {(stocks.find(s => s.key === soItemKey)?.unit || 'unit')}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-0.5 font-bold">Alasan Penyimpangan / Justifikasi</label>
                          <input type="text" value={soAlasan} onChange={(e) => setSoAlasan(e.target.value)} className="border w-full rounded p-1.5 text-xs bg-white" placeholder="misal: buah menyusut, boks bintik melembab" />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const diffVal = soStokFisik - soStokSistem;
                            const newSO = {
                              id: 'SO-' + Date.now(),
                              nomorSO: 'SO-OPN-' + Math.floor(Math.random() * 900 + 100),
                              tanggal: new Date().toISOString().split('T')[0],
                              lokasiId: selectedLokasi,
                              kategori: 'Opname Audit',
                              status: 'Pending Approval',
                              createdById: currentUser.id,
                              items: [
                                { itemKey: soItemKey, stokSistem: soStokSistem, stokFisik: soStokFisik, selisih: diffVal, alasan: soAlasan }
                              ]
                            };
                            setStockOpname(prev => [newSO, ...prev]);
                            logActivity('Inventory', `Mengajukan Stock Opname baru dengan selisih ${diffVal} untuk item ${soItemKey}.`);
                            setSoAlasan('');
                          }}
                          className="w-full bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold py-2 rounded shadow cursor-pointer transition flex items-center justify-center gap-1 font-sans"
                        >
                          📤 Kirim Pengajuan Opname Ke Direktur
                        </button>
                      </div>
                    </div>

                    {/* Form Section 2: Pemusnahan Keripik Rusak/Moisture (Destruction Card) */}
                    <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-bold text-rose-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          🔥 Pemusnahan Keripik Rusak / Busuk (Disposal Log)
                        </h4>
                        <p className="text-[10px] text-slate-500">Log penarikan stok keripik reject pasca kemas atau busuk di penyimpanan.</p>
                      </div>

                      <div className="space-y-3 text-[11px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-semibold text-slate-600 block mb-0.5">Item Keripik Gudang</label>
                            <select value={destFruitKey} onChange={(e) => setDestFruitKey(e.target.value)} className="border w-full rounded p-1.5 bg-slate-50 text-[11px] select-pemusnahan-item font-sans">
                              <option value="Apel Keripik Jadi (Unpacked)">Apel Keripik Jadi (Unpacked)</option>
                              <option value="Nangka Keripik Jadi (Unpacked)">Nangka Keripik Jadi (Unpacked)</option>
                              <option value="Pisang Keripik Jadi (Unpacked)">Pisang Keripik Jadi (Unpacked)</option>
                              <option value="Salak Keripik Jadi (Unpacked)">Salak Keripik Jadi (Unpacked)</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold text-slate-600 block mb-0.5">Berat Dimusnahkan (Kg)</label>
                            <input type="number" value={destWeight} onChange={(e) => setDestWeight(Math.max(1, parseFloat(e.target.value) || 0))} className="border w-full rounded p-1.5 bg-white font-bold text-rose-700 text-[11px] input-pemusnahan-qty" />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-0.5">Alasan Pemusnahan (Berjamur / Lembek / Rusak)</label>
                          <input type="text" value={destReason} onChange={(e) => setDestReason(e.target.value)} className="border w-full rounded p-1.5 bg-white text-xs text-rose-950" />
                        </div>

                        <div className="bg-rose-50 text-rose-900 border border-rose-100 p-2 rounded text-[10px] leading-relaxed font-sans">
                          ⚠️ <strong>Prosedur Mutasi Limbah:</strong> Melakukan disposal fisik akan langsung mengurangi kuantitas stok tanpa menunggu approval sekunder, menjamin status harian akurat.
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin memusnahkan ${destWeight} kg dari ${destFruitKey}? Tindakan ini permanen.`)) {
                              // Execute immediate stock subtraction!
                              setStocks(prev => adjustStockInner(prev, destFruitKey, -destWeight));

                              // Wrap into opname archive
                              const newSO = {
                                id: 'SO-' + Date.now(),
                                nomorSO: 'MUT-DISP-' + Math.floor(Math.random() * 8999 + 1000),
                                tanggal: new Date().toISOString().split('T')[0],
                                lokasiId: selectedLokasi,
                                kategori: 'Pemusnahan Disposal',
                                status: 'Approved',
                                createdById: currentUser.id,
                                approvedById: currentUser.id,
                                items: [
                                  { itemKey: destFruitKey, stokSistem: 0, stokFisik: 0, selisih: -destWeight, alasan: 'Pemusnahan: ' + destReason }
                                ]
                              };
                              setStockOpname(prev => [newSO, ...prev]);
                              logActivity('Inventory', `Pemusnahan & pembuangan ${destWeight} kg keripik dari varian ${destFruitKey} karena ${destReason}.`);
                              alert('Pemusnahan berhasil diproses! Stok berkurang.');
                            }
                          }}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-2 rounded shadow cursor-pointer transition flex items-center justify-center gap-1 font-sans button-pemusnahan-submit"
                        >
                          🔥 Eksekusi Pemusnahan Secara Fisik
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stock Opname & Disposal Logs Table */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block font-sans">
                      📋 Log Audit Stock Opname & Disposal Operasional
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-mono">
                        <thead>
                          <tr className="border-b bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">SO / MUT Number</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3">Tanggal Plan</th>
                            <th className="py-2.5 px-3">Rincian Diskrepansi Audit</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-center">Aksi Verifikasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockOpname.map(so => {
                            return (
                              <tr key={so.id} className="hover:bg-slate-50 border-b">
                                <td className="py-3 px-3 font-bold text-slate-950 font-mono text-xs">{so.nomorSO}</td>
                                <td className="py-3 px-3 text-slate-600 font-sans">{so.kategori}</td>
                                <td className="py-3 px-3 text-slate-500 font-mono">{so.tanggal}</td>
                                <td className="py-3 px-3 space-y-1 font-sans">
                                  {so.items.map((it: any, i: number) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-semibold text-slate-900">{it.itemKey}</span>: 
                                      <span className={`font-mono font-bold mx-1 ${it.selisih === 0 ? 'text-slate-500' : it.selisih > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {it.selisih > 0 ? '+' : ''}{it.selisih} kg
                                      </span> 
                                      <span className="text-[10px] text-slate-500 italic">({it.alasan})</span>
                                    </div>
                                  ))}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-wider border ${
                                    so.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 
                                    so.status === 'Needs Recount' ? 'bg-amber-100 text-amber-800 border-amber-300' : 
                                    'bg-yellow-50 text-yellow-850 border-yellow-300 animate-pulse'
                                  }`}>
                                    {so.status === 'Approved' ? 'APPROVED' : 
                                     so.status === 'Needs Recount' ? 'RECOUNT REQ' : 
                                     'PENDING REVIEW'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center space-x-2">
                                  {(so.status === 'Pending Approval' || so.status === 'Needs Recount') ? (
                                    <div className="flex gap-1 justify-center">
                                      <button
                                        onClick={() => {
                                          if (confirm('Review & Approve Stock Opname ini? Data sistem akan langsung disesuaikan secara permanen!')) {
                                            // Apply each item's discrepancy directly to active physical inventory!
                                            setStocks(prev => {
                                              let updated = [...prev];
                                              so.items.forEach((it: any) => {
                                                updated = adjustStockInner(updated, it.itemKey, it.selisih);
                                              });
                                              return updated;
                                            });

                                            // Update status in the stockOpname listing
                                            setStockOpname(prev => prev.map(item => {
                                              if (item.id === so.id) {
                                                return { ...item, status: 'Approved', approvedById: currentUser.id };
                                              }
                                              return item;
                                            }));

                                            alert('Stock Opname berhasil diselaraskan & data stok sistem diperbarui.');
                                            logActivity('Inventory', `Menyetujui penyelarasan stock opname ${so.nomorSO}.`);
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          setStockOpname(prev => prev.map(item => {
                                            if (item.id === so.id) {
                                              return { ...item, status: 'Needs Recount' };
                                            }
                                            return item;
                                          }));
                                          logActivity('Inventory', `Meminta hitung ulang (Needs Recount) untuk SO ${so.nomorSO}.`);
                                          alert('Status diubah: Minta Hitung Ulang diajukan ke operator gudang.');
                                        }}
                                        className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer"
                                      >
                                        Minta Recount
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-sans italic">✔️ Terdistribusi Aman</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'sales-penjualan' && (
                <div className="space-y-6 animate-fade-in" id="sales-penjualan-view">
                  {/* Create Sale Transaction Form Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
                      <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Input Penjualan Toko Baru (Catat Transaksi)</span>
                    </h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleActionCallback('SALES', {
                          customerId: salCust,
                          produkId: salSku,
                          batchId: salBatch,
                          qtyPcs: salQty,
                          hargaSatuan: salPrice
                        });
                      }} 
                      className="space-y-4 text-xs" 
                      id="form-sales-payload"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Pilih Retail / Toko Tujuan</label>
                          <select 
                            value={salCust} 
                            onChange={(e) => setSalCust(e.target.value)} 
                            className="bg-slate-50 border border-slate-200 rounded p-2 w-full outline-none focus:border-emerald-500 font-sans cursor-pointer"
                            id="sales-form-customer"
                          >
                            {customer.map((c: any) => (
                              <option key={c.id} value={c.id}>{c.nama} ({c.tipe})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Produk SKU Terjual</label>
                          <select 
                            value={salSku} 
                            onChange={(e) => setSalSku(e.target.value)} 
                            className="bg-slate-50 border border-slate-200 rounded p-2 w-full outline-none focus:border-emerald-500 font-sans cursor-pointer"
                            id="sales-form-product"
                          >
                            {produk.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.nama}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Hubungkan Batch Terkait (Tracing)</label>
                          <select 
                            value={salBatch} 
                            onChange={(e) => setSalBatch(e.target.value)} 
                            className="bg-slate-50 border border-slate-200 rounded p-2 w-full outline-none focus:border-emerald-500 font-mono cursor-pointer"
                            id="sales-form-batch"
                          >
                            {batches.map((b: any) => (
                              <option key={b.id} value={b.id}>{b.id} ({b.namaBahan})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Jumlah Terjual (Pcs / Kantong)</label>
                          <input 
                            type="number" 
                            value={salQty} 
                            onChange={(e) => setSalQty(Math.max(1, parseInt(e.target.value) || 0))} 
                            className="border border-slate-200 w-full rounded p-2 font-bold focus:border-emerald-500 font-mono"
                            id="sales-form-qty"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Harga Jual Per Pcs (IDR)</label>
                          <input 
                            type="number" 
                            value={salPrice} 
                            onChange={(e) => setSalPrice(Math.max(1, parseInt(e.target.value) || 0))} 
                            className="border border-slate-200 w-full rounded p-2 font-bold focus:border-emerald-500 font-mono"
                            id="sales-form-price"
                          />
                        </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded font-medium text-[10px] text-indigo-900 leading-normal">
                        ✅ <strong className="font-bold font-mono">Real-time Tracing Triggers:</strong> Pencatatan ini langsung memicu surat jalan digital, menghitung komisi sales, dan memotong stok produk jadi di level pergudangan cabang.
                      </div>

                      <button 
                        type="submit" 
                        id="submit-sales-btn" 
                        className="w-full bg-slate-950 text-white font-bold py-2 px-4 rounded shadow hover:bg-slate-800 transition cursor-pointer"
                      >
                        Konfirmasi Penjualan &amp; Catat Transaksi
                      </button>
                    </form>
                  </div>

                  {/* Sales Listing Table (History ledger) */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider">Histori Transaksi &amp; Ledger Penjualan</h4>
                      <strong className="text-slate-500 text-[10px] bg-white border px-2 py-0.5 rounded font-mono font-bold">{sales.length} Record Ledger</strong>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                        <thead>
                          <tr className="border-b bg-slate-50/50 text-slate-500 font-bold">
                            <th className="py-2.5 px-3">No Invoice</th>
                            <th className="py-2.5 px-3">Tanggal Jual</th>
                            <th className="py-2.5 px-3">Customer Toko</th>
                            <th className="py-2.5 px-3 text-right">Nilai Transaksi</th>
                            <th className="py-2.5 px-3 text-right">Komisi Sales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 font-mono text-[11px]">
                              <td className="py-2.5 px-3 font-extrabold text-slate-900">{s.notaNumber}</td>
                              <td className="py-2.5 px-3">{s.tanggal}</td>
                              <td className="py-2.5 px-3 font-sans font-semibold">{customer.find(c => c.id === s.customerId)?.nama || s.customerId}</td>
                              <td className="py-2.5 px-3 text-right text-emerald-700 font-black">Rp {s.totalPenjualan.toLocaleString('id-ID')}</td>
                              <td className="py-2.5 px-3 text-right text-indigo-700">Rp {s.komisiSales.toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'sales-suratjalan' && (
                <div className="space-y-6" id="surat-jalan-station">
                  {/* Title Header */}
                  <div className="bg-slate-50 p-4 border rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-sans font-bold text-slate-800 text-sm">🚚 Surat Jalan Digital & Dispatch Station</h4>
                      <p className="text-[11px] text-slate-500 font-sans">Kelola dokumen pengiriman, update plat armada, dan lihat dokumen PDF siap cetak.</p>
                    </div>
                  </div>

                  {/* DIGITAL SURAT JALAN PREVIEW MODAL / DRAWER */}
                  {showingSiId && (() => {
                    const activeSi = sales.find(s => s.id === showingSiId);
                    if (!activeSi) return null;
                    const activeCustName = customer.find(c => c.id === activeSi.customerId)?.nama || activeSi.customerId;
                    const activeCustAddr = customer.find(c => c.id === activeSi.customerId)?.alamat || 'Kota Malang, Jawa Timur';
                    const activeCustPhone = customer.find(c => c.id === activeSi.customerId)?.telepon || '+62 341-901234';

                    return (
                      <div className="border-2 border-slate-950 bg-white rounded-xl p-6 shadow-2xl relative animate-fade-in space-y-4 max-w-3xl mx-auto" id="surat-jalan-printable-slip">
                        {/* Seal Watermark decoration */}
                        <div className="absolute right-10 top-14 border-4 border-dashed border-indigo-700/30 text-indigo-700/30 font-black text-xs px-4 py-2 rotate-12 select-none uppercase pointer-events-none rounded font-mono">
                          AGRIDEA ORIGINAL CO.
                        </div>

                        {/* Document Header Letterhead */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                          <div>
                            <h2 className="font-sans font-black text-lg tracking-tight text-slate-900">CV. AGRIDEA FOODS NUSANTARA</h2>
                            <p className="text-[10px] text-slate-500 font-sans max-w-sm">
                              Pusat Produksi: Jl. Raya Karanglo No. 23, Singosari, Malang, Jawa Timur<br />
                              Telp: (0341) 402291 | Email: logistics@agridea.co.id
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs bg-slate-950 text-white font-black px-2 py-1 rounded">SURAT JALAN / D.O.</span>
                            <div className="font-mono text-[10px] mt-1 text-slate-600">
                              No: <strong>{activeSi.suratJalanNumber || 'SJ/2026/06-03'}</strong><br />
                              Tanggal: <strong>{activeSi.tanggal}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Ship-To and Transporter Info */}
                        <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-3 rounded border">
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Penerima Kiriman (Consignee):</span>
                            <div className="font-bold text-slate-900 text-xs mt-1">{activeCustName}</div>
                            <div className="text-slate-600 font-sans mt-0.5 leading-relaxed">
                              Alamat: {activeCustAddr}<br />
                              Telp: {activeCustPhone}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Detail Transportasi & Kurir:</span>
                            <div className="mt-1 font-mono space-y-0.5">
                              <div>Ekspedisi: <strong className="text-slate-950">{activeSi.ekspedisi || 'CV Lintas Kargo'}</strong></div>
                              <div>Pengemudi / Driver: <strong className="text-slate-950">{activeSi.pengemudi || 'Slamet Rahardjo'}</strong></div>
                              <div>No. Plat Truk: <strong className="text-indigo-800 font-bold bg-indigo-50 px-1 py-0.2 rounded border border-indigo-150">{activeSi.platNomor || 'N 1493 AX'}</strong></div>
                              <div>Suhu Box: <strong className="text-slate-700">Chilled Air (-4°C)</strong></div>
                            </div>
                          </div>
                        </div>

                        {/* Goods Grid */}
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b bg-slate-900 text-white font-bold font-sans uppercase text-[9px] tracking-wider text-[11px]">
                              <th className="py-2 px-3 text-center w-12">No.</th>
                              <th className="py-2 px-3">Kode SKU</th>
                              <th className="py-2 px-3">Nama Varian & Gramasi</th>
                              <th className="py-2 px-3 text-right">Kuantitas Order</th>
                              <th className="py-2 px-3 text-center">Satuan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeSi.items?.map((item: any, idx: number) => {
                              const prodObj = produk.find(p => p.id === item.produkId);
                              return (
                                <tr key={idx} className="border-b font-mono hover:bg-slate-50">
                                  <td className="py-2 px-3 text-center">{idx + 1}</td>
                                  <td className="py-2 px-3 font-semibold text-slate-800">{prodObj?.sku || 'AGR-APL-100'}</td>
                                  <td className="py-2 px-3 font-sans text-slate-700">{prodObj?.nama || 'Keripik Standar 100g'}</td>
                                  <td className="py-2 px-3 text-right font-black text-slate-950">{item.qtyPcs || item.qty}</td>
                                  <td className="py-2 px-3 text-center font-sans">Pcs (Pouch)</td>
                                </tr>
                              );
                            })}
                            {!activeSi.items && (
                              <tr className="border-b font-mono">
                                <td className="py-2 px-3 text-center">1</td>
                                <td className="py-2 px-3 font-semibold text-slate-800">AGR-APL-100</td>
                                <td className="py-2 px-3 font-sans text-slate-700">Keripik Apel Standar Agridea 100g</td>
                                <td className="py-2 px-3 text-right font-black text-slate-950">250</td>
                                <td className="py-2 px-3 text-center font-sans">Pcs (Pouch)</td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                        {/* Barcode / Signatures */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300">
                          <div className="text-center font-sans text-[10px]">
                            <p className="text-slate-500 mb-10">Penerima / Consignee</p>
                            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800 inline-block px-4">( _________________ )</p>
                          </div>
                          <div className="text-center font-sans text-[10px]">
                            <p className="text-slate-500 mb-10">Pengemudi / Driver</p>
                            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800 inline-block px-4">({activeSi.pengemudi || 'Slamet R.'})</p>
                          </div>
                          <div className="text-center font-sans text-[10px]">
                            <p className="text-slate-500 mb-10">Gudang / Ekspediter</p>
                            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800 inline-block px-4">( Logistik Agridea )</p>
                          </div>
                        </div>

                        {/* Bottom Utility controls */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-slate-200">
                          <button
                            onClick={() => {
                              alert('Membuka dialog cetak sistem... PDF tercetak dengan barcode ' + (activeSi.suratJalanNumber || 'SJ-AGR-01'));
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 text-xs rounded shadow transition cursor-pointer"
                          >
                            🖨️ Cetak / Print PDF
                          </button>
                          <button
                            onClick={() => setShowingSiId(null)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1 px-3 text-xs rounded hover:shadow transition cursor-pointer"
                          >
                            Tutup Preview
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* EDIT METADATA FORM PANEL */}
                  {editingSiId && (
                    <div className="bg-indigo-50/20 border border-indigo-150 rounded-xl p-4 space-y-4 shadow-sm animate-fade-in max-w-2xl mx-auto">
                      <h5 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        ✏️ Edit Data Dispatch Surat Jalan
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Nomor Surat Jalan</label>
                          <input 
                            type="text" 
                            value={siNumberInput} 
                            onChange={(e) => setSiNumberInput(e.target.value)} 
                            className="border w-full bg-white rounded p-1.5 font-bold" 
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Kurir / Ekspedisi</label>
                          <input 
                            type="text" 
                            value={siExpeditionInput} 
                            onChange={(e) => setSiExpeditionInput(e.target.value)} 
                            className="border w-full bg-white rounded p-1.5 text-xs font-semibold" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Nama Pengemudi (Driver)</label>
                          <input 
                            type="text" 
                            value={siDriverInput} 
                            onChange={(e) => setSiDriverInput(e.target.value)} 
                            className="border w-full bg-white rounded p-1.5 text-xs font-semibold" 
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Nomor Plat Mobil Kendaraan</label>
                          <input 
                            type="text" 
                            value={siPlatInput} 
                            onChange={(e) => setSiPlatInput(e.target.value)} 
                            className="border w-full bg-white rounded p-1.5 font-mono text-xs font-black uppercase" 
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingSiId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-1 px-3 text-xs rounded font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSales(prev => prev.map(s => {
                              if (s.id === editingSiId) {
                                return {
                                  ...s,
                                  suratJalanNumber: siNumberInput,
                                  ekspedisi: siExpeditionInput,
                                  pengemudi: siDriverInput,
                                  platNomor: siPlatInput
                                };
                              }
                              return s;
                            }));
                            logActivity('Sales', `Mengupdate detail Surat Jalan ${siNumberInput} pengemudi ${siDriverInput}.`);
                            setEditingSiId(null);
                          }}
                          className="bg-slate-950 hover:bg-slate-800 text-white py-1 px-3 text-xs rounded font-bold shadow cursor-pointer button-save-surat-jalan"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Desktop Table View of Deliveries */}
                  <div className="overflow-x-auto shadow border rounded-lg">
                    <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                      <thead>
                        <tr className="border-b bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] font-sans">
                          <th className="py-3 px-3">No Surat Jalan</th>
                          <th className="py-3 px-3">No Invoice</th>
                          <th className="py-3 px-3">Penerima Outlet</th>
                          <th className="py-3 px-3">Ekspedisi</th>
                          <th className="py-3 px-3">Pengemudi (Driver)</th>
                          <th className="py-3 px-3">No Plat Mobil</th>
                          <th className="py-3 px-3 text-center">Dispatch Status</th>
                          <th className="py-3 px-3 text-center">Aksi Control</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 border-b font-mono text-[11px]">
                            <td className="py-3 px-3">
                              <button
                                onClick={() => setShowingSiId(s.id)}
                                className="font-black text-indigo-700 hover:text-indigo-900 underline text-xs cursor-pointer text-left block transition hover:scale-102"
                                title="Klik untuk membuka Surat Jalan Digital PDF"
                              >
                                📋 {s.suratJalanNumber || `SJ/${selectedLokasi === 'JKT' ? 'MLG' : 'BTU'}/2026-${s.id}`}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-slate-600 italic">{s.notaNumber}</td>
                            <td className="py-3 px-3 font-sans font-bold text-slate-900">{customer.find(c => c.id === s.customerId)?.nama || s.customerId}</td>
                            <td className="py-3 px-3 font-sans text-slate-600">{s.ekspedisi || 'CV Lintas Kargo'}</td>
                            <td className="py-3 px-3 font-sans font-bold text-slate-900">{s.pengemudi || 'Slamet Rahardjo'}</td>
                            <td className="py-3 px-3 text-slate-800 font-extrabold">{s.platNomor || 'N 1493 AX'}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wide">
                                READY FOR DISPATCH
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingSiId(s.id);
                                  setSiNumberInput(s.suratJalanNumber || `SJ/${selectedLokasi === 'JKT' ? 'MLG' : 'BTU'}/2026-${s.id}`);
                                  setSiExpeditionInput(s.ekspedisi || 'CV Lintas Kargo');
                                  setSiDriverInput(s.pengemudi || 'Slamet Rahardjo');
                                  setSiPlatInput(s.platNomor || 'N 1493 AX');
                                }}
                                className="text-indigo-600 hover:text-indigo-900 font-semibold text-[10px] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded transition cursor-pointer"
                              >
                                Edit SJ
                              </button>
                              <button
                                onClick={() => setShowingSiId(s.id)}
                                className="text-slate-700 hover:text-slate-950 font-semibold text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                              >
                                View PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'payroll-kalkulasi' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                        <th className="py-2 px-3">ID Karyawan</th>
                        <th className="py-2 px-3">Nama Pekerja</th>
                        <th className="py-2 px-3">Divisi Pabrik</th>
                        <th className="py-2 px-3 text-right">Ubah Borongan Pokok</th>
                        <th className="py-2 px-3 text-right flex items-center justify-end">Payroll Autogaji</th>
                      </tr>
                    </thead>
                    <tbody>
                      {karyawan.map(k => (
                        <tr key={k.id} className="hover:bg-slate-50 font-mono text-[11px]">
                          <td className="py-2 px-3 font-bold text-slate-900">{k.id}</td>
                          <td className="py-2 px-3 font-sans font-bold">{k.nama}</td>
                          <td className="py-2 px-3 font-sans text-slate-500">{k.role}</td>
                          <td className="py-2 px-3 text-right">Rp {k.tarifDasar >= 1000000 ? k.tarifDasar.toLocaleString('id-ID') : (k.tarifDasar * 80).toLocaleString('id-ID')}</td>
                          <td className="py-2 px-3 text-right font-black text-emerald-700">
                            Rp {k.role === 'Kupas' ? '207.600' : k.role === 'Frying' ? '125.000' : k.role === 'Kemas' ? '145.000' : '4.500.000'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeMenu === 'payroll-slips' && (
                <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 space-y-4 animate-fade-in" id="receipt-slip-payout">
                  <div className="text-center border-b pb-3 border-slate-300">
                    <h3 className="font-extrabold text-slate-950 text-sm">SLIP GAJI BORONGAN HARIAN</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">AGRIDEA MANUFACTURE MALANG</p>
                  </div>
                  <div className="text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Penerima :</span>
                      <span className="font-bold text-slate-900">Siti Aminah</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Divisi :</span>
                      <span className="font-bold text-slate-900">Karyawan Kupas</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Rendemen (Output) :</span>
                      <span className="font-bold text-slate-900">122 kg Apple peeler</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Upah Satuan :</span>
                      <span>122kg x Rp 1.500</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Insentif Target (&gt;40kg) :</span>
                      <span>+Rp 24.600</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm border-t pt-2 border-slate-300 mt-2 text-slate-950">
                      <span>Total Gaji Diterima:</span>
                      <span>Rp 207.600</span>
                    </div>
                  </div>
                  <button onClick={() => window.print()} className="w-full bg-slate-950 text-white font-bold p-2 rounded text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5">
                    <Printer className="w-4 h-4" /> Cetak Slip Gaji (Print)
                  </button>
                </div>
              )}

              {activeMenu === 'finance-cashbook' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-mono">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                        <th className="py-2 px-3">Tanggal Cash</th>
                        <th className="py-2 px-3">Kategori Mutasi</th>
                        <th className="py-2 px-3">Deskripsi Ledger</th>
                        <th className="py-2 px-3 text-right">Jumlah Pengeluaran</th>
                        <th className="py-2 px-3 text-right">Alokasi HPP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pettyCash.map(cash => (
                        <tr key={cash.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500">{cash.tanggal}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{cash.kategori}</td>
                          <td className="py-2.5 px-3 text-slate-700">{cash.deskripsi}</td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-600">Rp {cash.jumlah.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3 text-right font-sans font-bold">
                            <span className={`px-2 py-0.5 rounded text-[9px] ${
                              cash.masukHPP ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>{cash.masukHPP ? 'Ya (HPP)' : 'Tidak'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeMenu === 'quality-compliance' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-mono">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                        <th className="py-2 px-3">Tgl Audit</th>
                        <th className="py-2 px-3">Fungsi Audit</th>
                        <th className="py-2 px-3">Deskripsi Pemeriksaan</th>
                        <th className="py-2 px-3">Pemeriksa (PIC)</th>
                        <th className="py-2 px-3 text-right">Hasil Temuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceLogs.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500">{c.tanggal}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{c.tipeLog}</td>
                          <td className="py-2.5 px-3 text-slate-650">{c.deskripsi}</td>
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-800">@{c.pic}</td>
                          <td className="py-2.5 px-3 text-right text-xs">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                              c.status === 'Complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeMenu === 'maintenance-sched' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium text-slate-700 font-mono">
                    <thead>
                      <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                        <th className="py-2 px-3">Tgl Perawatan</th>
                        <th className="py-2 px-3">Nama Mesin</th>
                        <th className="py-2 px-3">Jenis Kerusakan / Tindakan</th>
                        <th className="py-2 px-3 text-right">Downtime (Mnt)</th>
                        <th className="py-2 px-3 text-right">Biaya Sparepart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.map(mnt => {
                        const targetM = mesin.find(m => m.id === mnt.mesinId);
                        return (
                          <tr key={mnt.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500">{mnt.tanggal}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{targetM?.nama || mnt.mesinId}</td>
                            <td className="py-2.5 px-3 text-slate-750">{mnt.deskripsi}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">{mnt.downtimeMenit} Mnt</td>
                            <td className="py-2.5 px-3 text-right font-black text-rose-600">Rp {mnt.biaya.toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===================== BATCH EXPANDED DETAIL MODAL ===================== */}
          {selectedBatchDetail && (() => {
            const b = selectedBatchDetail;
            const bPeeling = peelingLogs.filter(p => p.batchId === b.id);
            const bFreezing = freezingLogs.filter(f => f.batchId === b.id);
            const bFrying = fryingLogs.filter(f => f.batchId === b.id);
            const bQC = qcLogs.filter(q => q.batchId === b.id);
            const bPacking = packingLogs.filter(p => p.batchId === b.id);

            const totalCOGS = (b.totalBiayaBahan || 0) + 
                              (b.totalBiayaTenagaKerja || 0) + 
                              (b.totalBiayaPenolong || 0) + 
                              (b.totalBiayaEnergy || 0) + 
                              (b.totalBiayaOverhead || 0) + 
                              (b.totalBiayaWaste || 0);

            return (
              <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-xs" id="batch-detail-modal">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="bg-slate-950 text-white p-5 flex items-center justify-between shadow-sm shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Production Batch File</span>
                        <span className="bg-slate-800 text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">{b.status}</span>
                      </div>
                      <h3 className="text-sm font-black tracking-tight mt-1" id="batch-detail-title">Laporan Manufaktur Batch: {b.id}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedBatchDetail(null)}
                      className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition"
                      id="close-batch-modal-btn"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
                    {/* General Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
                      <div>
                        <span className="text-slate-500 block">Bahan Utama:</span>
                        <strong className="font-extrabold text-slate-900">{b.namaBahan} Segar</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tanggal Mulai:</span>
                        <strong className="font-bold text-slate-900">{b.tanggalMulai}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Lokasi Unit Pabrik:</span>
                        <strong className="font-semibold text-indigo-700">{lokasi.find(l => l.id === b.lokasiId)?.nama || b.lokasiId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">HPP Total (COGS):</span>
                        <strong className="font-extrabold text-emerald-700">Rp {totalCOGS.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>

                    {/* Manufacturing Flow Steps */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-slate-950 text-sm border-b pb-1.5">
                        ⚙️ Rantai Proses Produksi &amp; Log Harian
                      </h4>

                      {/* Step 1: Peeling */}
                      <div className="border rounded-xl p-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">🍎 Tahap 1: Pengupasan (Peeling)</span>
                          <span className="text-[10px] text-slate-500">{bPeeling.length} Log Data</span>
                        </div>
                        {bPeeling.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-[11px]">
                              <thead>
                                <tr className="border-b bg-slate-50 text-slate-500">
                                  <th className="p-1.5">Pekerja</th>
                                  <th className="p-1.5 text-right">In (Kg)</th>
                                  <th className="p-1.5 text-right">Out (Kg)</th>
                                  <th className="p-1.5 text-right">Reject (Kg)</th>
                                  <th className="p-1.5 text-right">Yield (%)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bPeeling.map(p => (
                                  <tr key={p.id} className="border-b">
                                    <td className="p-1.5 font-sans font-semibold text-slate-800">{karyawan.find(k => k.id === p.karyawanId)?.nama || p.karyawanId}</td>
                                    <td className="p-1.5 text-right font-semibold">{p.bahanMasukKg} kg</td>
                                    <td className="p-1.5 text-right font-bold text-indigo-600">{p.hasilKupasKg} kg</td>
                                    <td className="p-1.5 text-right text-rose-600 font-bold">{p.rejectKg} kg</td>
                                    <td className="p-1.5 text-right text-emerald-700 font-black">{p.yieldPercent}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Tidak ada log pengupasan terekam untuk batch ini.</p>
                        )}
                      </div>

                      {/* Step 2: Freezing */}
                      <div className="border rounded-xl p-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">❄️ Tahap 2: Pembekuan (Freezing)</span>
                          <span className="text-[10px] text-slate-500">{bFreezing.length} Log Data</span>
                        </div>
                        {bFreezing.length > 0 ? (
                          <div className="space-y-2">
                            {bFreezing.map(f => (
                              <div key={f.id} className="flex justify-between bg-slate-50 p-2.5 rounded font-mono text-[11px]">
                                <span>Shift: <strong className="font-bold text-slate-800">{f.shift}</strong> | Berat Masuk: <strong className="font-bold text-slate-800">{f.beratKupasMasuk} kg</strong></span>
                                <span className="font-bold text-blue-700">Output Beku: {f.beratFrozenOutput} kg</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Tidak ada log pembekuan terekam untuk batch ini.</p>
                        )}
                      </div>

                      {/* Step 3: Frying */}
                      <div className="border rounded-xl p-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">🔥 Tahap 3: Penggilingan &amp; Vacuum Frying</span>
                          <span className="text-[10px] text-slate-500">{bFrying.length} Log Data</span>
                        </div>
                        {bFrying.length > 0 ? (
                          <div className="space-y-3 font-mono text-[11px]">
                            {bFrying.map(v => (
                              <div key={v.id} className="bg-slate-50 p-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                  <span className="text-slate-500 block font-sans">Operator:</span>
                                  <strong className="font-bold text-slate-900">{karyawan.find(k => k.id === v.operatorId)?.nama || v.operatorId}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 block font-sans">Mesin Vacuum:</span>
                                  <strong className="font-bold text-slate-900">{mesin.find(m => m.id === v.mesinId)?.nama || v.mesinId}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-500 block font-sans">Hasil Keripik:</span>
                                  <strong className="font-black text-indigo-700">{v.beratHasilKeripikKg} kg <span className="text-[10px] text-slate-400 font-normal">({((v.beratHasilKeripikKg/v.beratFrozenMasukKg)*100).toFixed(1)}% yield)</span></strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Tidak ada log penggorengan terekam untuk batch ini.</p>
                        )}
                      </div>

                      {/* Step 4: Quality Control */}
                      <div className="border rounded-xl p-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">🔬 Tahap 4: Pemeriksaan Laborat &amp; QC Passed</span>
                          <span className="text-[10px] text-slate-500">{bQC.length} Log Data</span>
                        </div>
                        {bQC.length > 0 ? (
                          <div className="space-y-3">
                            {bQC.map(q => (
                              <div key={q.id} className="bg-slate-50 p-3 rounded-lg space-y-2">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] font-mono">
                                  <div className="bg-white p-1.5 border rounded shadow-xs">
                                    <span className="text-slate-400 block font-sans">Grade A</span>
                                    <strong className="text-emerald-700 font-black text-xs">{q.hasilGradeAKg} kg</strong>
                                  </div>
                                  <div className="bg-white p-1.5 border rounded shadow-xs">
                                    <span className="text-slate-400 block font-sans">Grade B</span>
                                    <strong className="text-blue-700 font-black text-xs">{q.hasilGradeBKg} kg</strong>
                                  </div>
                                  <div className="bg-white p-1.5 border rounded shadow-xs">
                                    <span className="text-slate-400 block font-sans">Grade C</span>
                                    <strong className="text-amber-700 font-black text-xs">{q.hasilGradeCKg} kg</strong>
                                  </div>
                                  <div className="bg-white p-1.5 border rounded shadow-xs">
                                    <span className="text-slate-400 block font-sans">Reject</span>
                                    <strong className="text-rose-600 font-black text-xs">{q.rejectKg} kg</strong>
                                  </div>
                                </div>
                                {q.rejectKg > 0 && (
                                  <p className="text-rose-650 italic bg-white p-2.5 rounded border border-rose-100 font-medium text-[11px] leading-normal">
                                    ⚠️ <strong className="font-bold text-rose-800">Alasan Reject:</strong> {q.alasanReject}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Tidak ada log QC terekam untuk batch ini.</p>
                        )}
                      </div>

                      {/* Step 5: Packaging */}
                      <div className="border rounded-xl p-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">📦 Tahap 5: Pengemasan &amp; SKU Finishing</span>
                          <span className="text-[10px] text-slate-500">{bPacking.length} Log Data</span>
                        </div>
                        {bPacking.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-[11px]">
                              <thead>
                                <tr className="border-b bg-slate-50 text-slate-500">
                                  <th className="p-1.5">Produk Jadi SKU</th>
                                  <th className="p-1.5 text-right">In (Kg)</th>
                                  <th className="p-1.5 text-right">Output (Pcs)</th>
                                  <th className="p-1.5 text-right">Pouch Bocor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bPacking.map(p => (
                                  <tr key={p.id} className="border-b">
                                    <td className="p-1.5 font-sans font-semibold text-slate-800">{produk.find(pr => pr.id === p.produkId)?.nama || p.produkId}</td>
                                    <td className="p-1.5 text-right font-medium">{p.beratMasukKeripikKg} kg</td>
                                    <td className="p-1.5 text-right font-black text-indigo-700">{p.totalPcsDihasilkan} pcs</td>
                                    <td className="p-1.5 text-right text-rose-600 font-bold">{(p.pouchDigunakan - p.totalPcsDihasilkan)} pcs</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Tidak ada log pengemasan terekam untuk batch ini.</p>
                        )}
                      </div>
                    </div>

                    {/* Financial Cost Allocation */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-sm">💰 Rincian Pembiayaan Aktual &amp; HPP Batch</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-[11px]">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500 font-sans">Biaya Bahan Baku:</span>
                          <span className="font-bold text-slate-800">Rp {b.totalBiayaBahan?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500 font-sans">Upah Pekerja Borongan:</span>
                          <span className="font-bold text-slate-800">Rp {b.totalBiayaTenagaKerja?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500 font-sans">Bahan Penolong:</span>
                          <span className="font-bold text-slate-800">Rp {b.totalBiayaPenolong?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1 col-span-1 border-slate-100">
                          <span className="text-slate-500 font-sans">Biaya Utilitas (Gas/LPG):</span>
                          <span className="font-bold text-slate-800">Rp {b.totalBiayaEnergy?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500 font-sans">Alokasi Overhead Mesin:</span>
                          <span className="font-bold text-slate-800">Rp {b.totalBiayaOverhead?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500 font-sans">Kerugian Waste / Susut:</span>
                          <span className="font-bold text-rose-600">Rp {b.totalBiayaWaste?.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 mt-2 font-mono shadow-xs">
                        <span className="font-extrabold text-slate-950 font-sans text-xs">Total Harga Pokok Produksi (HPP):</span>
                        <strong className="font-black text-sm text-emerald-700">Rp {totalCOGS.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-slate-50 p-4 border-t flex justify-end shrink-0">
                    <button 
                      onClick={() => setSelectedBatchDetail(null)}
                      className="bg-slate-950 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg hover:bg-slate-800 transition shadow-sm cursor-pointer"
                      id="close-batch-modal-foot"
                    >
                      Tutup Penelusuran
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
