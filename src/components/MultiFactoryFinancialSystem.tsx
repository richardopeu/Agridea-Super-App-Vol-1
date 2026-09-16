import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen, Sliders, Activity, Grid, Sparkles, Plus, Trash2, Check, X,
  Clock, TrendingUp, DollarSign, Wallet, FileSpreadsheet, Building,
  AlertCircle, ArrowRight, Printer, Download, UserCheck, ShieldAlert,
  PieChart as PieIcon, RefreshCw, HelpCircle, Send, MessageSquare,
  FileText, Layers, Share2, CornerDownRight, ChevronRight, Calculator
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import BudgetActualDashboard from './BudgetActualDashboard';

interface Props {
  state: any;
  currentUser: {
    id: string;
    username: string;
    role: string;
    lokasiId: string;
    namaLengkap: string;
  };
  activeMenu: string;
  onNavigate: (menuId: string) => void;
}

// Factories based on company structure
const FACTORIES = [
  { id: 'MPD', code: 'MPD', name: 'Wonosobo Factory (MPD)', type: 'Production' },
  { id: 'SSP', code: 'SSP', name: 'Sipahutar Factory (SSP)', type: 'Production' },
  { id: 'KKI', code: 'KKI', name: 'Jakarta Factory (KKI)', type: 'Production' },
  { id: 'AGDN', code: 'AGDN', name: 'Jakarta Packaging Center (AGDN)', type: 'Packaging' },
  { id: 'JKT', code: 'JKT', name: 'Jakarta HQ (JKT)', type: 'HQ' }
];

export default function MultiFactoryFinancialSystem({ state, currentUser, activeMenu, onNavigate }: Props) {
  // Navigation tabs helper maps directly to workbook's sheets/reports
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL'); // ALL = Consolidated, others = single factory
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // June

  // Sync internal sheet tab based on which sidebar submenu was clicked
  useEffect(() => {
    if (activeMenu === 'finance-accounting') {
      setActiveTab('JURNAL');
    } else if (activeMenu === 'finance-budgeting') {
      setActiveTab('BUDGETING');
    } else if (activeMenu === 'finance-workingcapital') {
      setActiveTab('WORKING_CAPITAL');
    } else if (activeMenu === 'finance-consolidated') {
      setActiveTab('DASHBOARD');
      setSelectedFactory('ALL');
    }
  }, [activeMenu]);

  // AI & Advisor features
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<any[]>([
    {
      sender: 'ai',
      text: 'Halo Richard. Saya Agridea AI CFO Advisor Anda. Buku besar keuangan konsolidasi untuk seluruh pabrik (Wonosobo, Sipahutar, Jakarta, Packaging Center, dan HQ) telah disinkronisasikan. Pabrik Wonosobo (MPD) saat ini berkinerja paling optimal dengan EBITDA Margin tertinggi (38.9%). Silakan ajukan pertanyaan analisis profitabilitas, perbandingan anggaran, atau risiko arus kas kita!'
    }
  ]);

  // Master Data 1: AKUN (Chart of Accounts Master with normal balances & status hierarchy)
  const [coaAccounts, setCoaAccounts] = useState<any[]>([
    { code: '1100', name: 'Kas di Tangan (IDR)', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 350000000 },
    { code: '1110', name: 'Kas Bank BCA Mandiri', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 1200000000 },
    { code: '1120', name: 'Piutang Agen & Distributor', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 642000000 },
    { code: '1131', name: 'Persediaan Bahan Baku (Buah Segar)', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 250000000 },
    { code: '1132', name: 'Persediaan WIP (WIP Chips)', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 195000000 },
    { code: '1133', name: 'Persediaan Produk Jadi terkemas', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 420000000 },
    { code: '1134', name: 'Persediaan Bahan Kemas (Standing Pouch)', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Lancar', balance: 180000000 },
    { code: '1210', name: 'Aset Tetap - Mesin Vacuum Frying', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Tetap', balance: 2450000000 },
    { code: '1220', name: 'Aset Tetap - Kendaraan Angkutan', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Tetap', balance: 480000000 },
    { code: '1230', name: 'Aset Tetap - Gedung & Prasarana', category: 'Assets', normal: 'Debit', categoryIndo: 'Aset Tetap', balance: 1550000000 },
    { code: '1299', name: 'Akumulasi Penyusutan Aset Tetap', category: 'Assets', normal: 'Kredit', categoryIndo: 'Aset Tetap', balance: -450000000 },
    { code: '2100', name: 'Hutang Dagang (Supplier Buah)', category: 'Liabilities', normal: 'Kredit', categoryIndo: 'Liabilitas', balance: 412000000 },
    { code: '2120', name: 'Hutang Biaya Gaji Terutang', category: 'Liabilities', normal: 'Kredit', categoryIndo: 'Liabilitas', balance: 122000000 },
    { code: '3100', name: 'Modal Saham Disetor', category: 'Equity', normal: 'Kredit', categoryIndo: 'Ekuitas', balance: 3500000000 },
    { code: '3200', name: 'Laba Ditahan Historis (Retained)', category: 'Equity', normal: 'Kredit', categoryIndo: 'Ekuitas', balance: 1342000000 },
    { code: '4100', name: 'Pendapatan Jual Keripik Jadi', category: 'Revenue', normal: 'Kredit', categoryIndo: 'Revenue', balance: 4850000000 },
    { code: '4200', name: 'Pendapatan Jual Serat Kulit Sisa (Lainnya)', category: 'Revenue', normal: 'Kredit', categoryIndo: 'Revenue', balance: 85000000 },
    { code: '5100', name: 'HPP - Biaya Pengadaan Buah Segar', category: 'COGS', normal: 'Debit', categoryIndo: 'HPP', balance: 1890000000 },
    { code: '5120', name: 'HPP - Gaji Borongan Kupas & Frying', category: 'COGS', normal: 'Debit', categoryIndo: 'HPP', balance: 640000000 },
    { code: '5130', name: 'HPP - Penggunaan Bahan Kemas & Gas', category: 'COGS', normal: 'Debit', categoryIndo: 'HPP', balance: 410000000 },
    { code: '6101', name: 'Beban Listrik, Air, & Utilitas Pabrik', category: 'Operating Expenses', normal: 'Debit', categoryIndo: 'Beban', balance: 250000000 },
    { code: '6102', name: 'Beban Perawatan Mesin & Spareparts', category: 'Operating Expenses', normal: 'Debit', categoryIndo: 'Beban', balance: 194000000 },
    { code: '6201', name: 'Beban Gaji Staf Operasional & Adm HQ', category: 'Operating Expenses', normal: 'Debit', categoryIndo: 'Beban', balance: 480000000 },
    { code: '6202', name: 'Beban Penyusutan Aset Tetap Bulanan', category: 'Operating Expenses', normal: 'Debit', categoryIndo: 'Beban', balance: 85000000 },
    { code: '7100', name: 'Pendapatan Non-Operasional Lain-Lain', category: 'Other Income', normal: 'Kredit', categoryIndo: 'Pendapatan Lainnya', balance: 45000000 },
    { code: '8100', name: 'Beban Adm Bank & Selisih Kurs Kurs', category: 'Other Expenses', normal: 'Debit', categoryIndo: 'Beban Lainnya', balance: 15400000 }
  ]);

  // Master Data 2: KB (Kode Bantu list mapped by partner & type)
  const [kodeBantuList, setKodeBantuList] = useState<any[]>([
    { code: 'KB-SUP-001', name: 'Kelompok Tani Dieng Sejahtera', type: 'Supplier', location: 'MPD', initialBalance: 110000000 },
    { code: 'KB-SUP-002', name: 'CV Silitonga Abadi Tapanuli', type: 'Supplier', location: 'SSP', initialBalance: 95000000 },
    { code: 'KB-SUP-003', name: 'Matahari Packaging Utama', type: 'Supplier', location: 'AGDN', initialBalance: 145000000 },
    { code: 'KB-CUST-101', name: 'Indogrosir Group Nasional', type: 'Customer', location: 'JKT', initialBalance: 185000000 },
    { code: 'KB-CUST-102', name: 'Transmart Retail Indonesia', type: 'Customer', location: 'JKT', initialBalance: 240000000 },
    { code: 'KB-CUST-103', name: 'Brimart Koperasi Puskop', type: 'Customer', location: 'KKI', initialBalance: 112000000 },
    { code: 'KB-EMP-201', name: 'Ariyanto (Branch Manager MPD)', type: 'Employee', location: 'MPD', initialBalance: 0 },
    { code: 'KB-EMP-202', name: 'Jefri Sirait (Director SSP)', type: 'Employee', location: 'SSP', initialBalance: 0 },
    { code: 'KB-EMP-203', name: 'Renita (Admin Cashier KKI)', type: 'Employee', location: 'KKI', initialBalance: 0 },
    { code: 'KB-BNK-301', name: 'Bank Mandiri Giro Utama IDR', type: 'Bank', location: 'JKT', initialBalance: 850000000 },
    { code: 'KB-BNK-302', name: 'Bank BCA KCP Tapanuli', type: 'Bank', location: 'SSP', initialBalance: 150000000 },
    { code: 'KB-BNK-303', name: 'Kas Kecil Operational (Petty Kas)', type: 'Petty Cash', location: 'MPD', initialBalance: 50000000 }
  ]);

  // Master Data 3: JENIS_ASET
  const [jenisAsetList, setJenisAsetList] = useState<any[]>([
    { code: 'JA-01', name: 'Peralatan/Mesin Ringan (Golongan 1)', lifeYears: 4, method: 'Garis Lurus' },
    { code: 'JA-02', name: 'Mesin Berat Frying & Storage (Golongan 2)', lifeYears: 8, method: 'Garis Lurus' },
    { code: 'JA-03', name: 'Kendaraan Niaga & Box (Golongan 2)', lifeYears: 8, method: 'Garis Lurus' },
    { code: 'JA-04', name: 'Gedung Pabrik & Bangunan Utama', lifeYears: 20, method: 'Garis Lurus' }
  ]);

  // Master Data 4: DAFTAR_ASET
  const [daftarAset, setDaftarAset] = useState<any[]>([
    { code: 'AST-MPD-01', type: 'JA-02', desc: 'Vacuum Frying Machining VF-50 Ton', buyDate: '2024-03-12', buyMonth: 3, buyYear: 2024, qty: 1, cost: 450000000, accDep: 112500000, location: 'MPD' },
    { code: 'AST-SSP-01', type: 'JA-02', desc: 'Cold Storage Room CSR-10 Sub', buyDate: '2024-06-18', buyMonth: 6, buyYear: 2024, qty: 1, cost: 850000000, accDep: 137500000, location: 'SSP' },
    { code: 'AST-AGDN-01', type: 'JA-02', desc: 'Automatic Pouch Sealer Packing', buyDate: '2025-01-10', buyMonth: 1, buyYear: 2025, qty: 2, cost: 650000000, accDep: 70000000, location: 'AGDN' },
    { code: 'AST-JKT-01', type: 'JA-01', desc: 'Servers & IT Networking Infrastructure', buyDate: '2025-05-15', buyMonth: 5, buyYear: 2025, qty: 1, cost: 210000000, accDep: 90000000, location: 'JKT' },
    { code: 'AST-KKI-01', type: 'JA-03', desc: 'Delivery Box Truck Colt Diesel', buyDate: '2024-11-20', buyMonth: 11, buyYear: 2024, qty: 1, cost: 480000000, accDep: 80000000, location: 'KKI' }
  ]);

  // Transaksi Data: JURNAL (Dynamic system-wide books representing automatically triggered + manually entered values)
  const [jurnalEntries, setJurnalEntries] = useState<any[]>([
    // Production journals
    { noJurnal: 'JR-2026-001', date: '2026-06-01', factory: 'MPD', code: '5100', name: 'HPP - Biaya Pengadaan Buah Segar', helperCode: 'KB-SUP-001', desc: 'Automatic Jurnal: Penerimaan Apel dari Kelompok Tani Dieng', debit: 24500000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-001', date: '2026-06-01', factory: 'MPD', code: '2100', name: 'Hung Dagang (Supplier Buah)', helperCode: 'KB-SUP-001', desc: 'Automatic Jurnal: Hutang Dagang atas Pembelian Apel', debit: 0, credit: 24500000, approval: 'Approved' },
    
    // Procurement
    { noJurnal: 'JR-2026-002', date: '2026-06-02', factory: 'SSP', code: '5100', name: 'HPP - Biaya Pengadaan Buah Segar', helperCode: 'KB-SUP-002', desc: 'Automatic Jurnal: Pembelian Nangka Segar Sipahutar', debit: 18200000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-002', date: '2026-06-02', factory: 'SSP', code: '2100', name: 'Hutang Dagang (Supplier Buah)', helperCode: 'KB-SUP-002', desc: 'Automatic Jurnal: Hutang Dagang Sipahutar', debit: 0, credit: 18200000, approval: 'Approved' },
    
    // Inventory
    { noJurnal: 'JR-2026-003', date: '2026-06-03', factory: 'KKI', code: '1132', name: 'Persediaan WIP (WIP Chips)', helperCode: '', desc: 'Automatic Jurnal: Frying Realisasi WIP Chips Apel', debit: 12000000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-003', date: '2026-06-03', factory: 'KKI', code: '1131', name: 'Persediaan Bahan Baku (Buah Segar)', helperCode: '', desc: 'Automatic Jurnal: Konsumsi Buah Segar Batch 104', debit: 0, credit: 12000000, approval: 'Approved' },
    
    // Packaging Product
    { noJurnal: 'JR-2026-004', date: '2026-06-04', factory: 'AGDN', code: '1133', name: 'Persediaan Produk Jadi terkemas', helperCode: 'KB-SUP-003', desc: 'Automatic Jurnal: Finishing Kemasan Standing Pouch Agridea', debit: 34500000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-004', date: '2026-06-04', factory: 'AGDN', code: '1132', name: 'Persediaan WIP (WIP Chips)', helperCode: '', desc: 'Automatic Jurnal: WIP Chips dikonsumsi', debit: 0, credit: 28000000, approval: 'Approved' },
    { noJurnal: 'JR-2026-004', date: '2026-06-04', factory: 'AGDN', code: '1134', name: 'Persediaan Bahan Kemas (Standing Pouch)', helperCode: 'KB-SUP-003', desc: 'Automatic Jurnal: Bahan kemas dialokasikan', debit: 0, credit: 6500005, approval: 'Approved' },

    // Sales
    { noJurnal: 'JR-2026-005', date: '2026-06-04', factory: 'JKT', code: '1120', name: 'Piutang Agen & Distributor', helperCode: 'KB-CUST-101', desc: 'Automatic Jurnal: Pengiriman Invoice Utama Indogrosir', debit: 54000000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-005', date: '2026-06-04', factory: 'JKT', code: '4100', name: 'Pendapatan Jual Keripik Jadi', helperCode: 'KB-CUST-101', desc: 'Automatic Jurnal: Pendapatan Penjualan Indogrosir', debit: 0, credit: 54000000, approval: 'Approved' },

    // Payroll
    { noJurnal: 'JR-2026-006', date: '2026-06-05', factory: 'JKT', code: '5120', name: 'HPP - Gaji Borongan Kupas & Frying', helperCode: '', desc: 'Automatic Jurnal: Gaji Borongan Kupas Bulan Juni', debit: 45000000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-006', date: '2026-06-05', factory: 'JKT', code: '2120', name: 'Hutang Biaya Gaji Terutang', helperCode: '', desc: 'Automatic Jurnal: Akumulasi Gaji Terutang Pekerja', debit: 0, credit: 45000000, approval: 'Approved' },

    // Cash transfers
    { noJurnal: 'JR-2026-007', date: '2026-06-05', factory: 'MPD', code: '6101', name: 'Beban Listrik, Air, & Utilitas Pabrik', helperCode: 'KB-BNK-303', desc: 'Automatic Jurnal: Refid kas kecil listrik sub-pabrik Batu', debit: 12000000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-007', date: '2026-06-05', factory: 'MPD', code: '1100', name: 'Kas di Tangan (IDR)', helperCode: 'KB-BNK-303', desc: 'Automatic Jurnal: Klaim reimbursement Petty Cash', debit: 0, credit: 12000000, approval: 'Approved' },

    // Assets purchase and depreciation
    { noJurnal: 'JR-2026-008', date: '2026-06-06', factory: 'KKI', code: '6202', name: 'Beban Penyusutan Aset Tetap Bulanan', helperCode: '', desc: 'Automatic Jurnal: Beban Depresiasi Bulan Berjalan', debit: 15600000, credit: 0, approval: 'Approved' },
    { noJurnal: 'JR-2026-008', date: '2026-06-06', factory: 'KKI', code: '1299', name: 'Akumulasi Penyusutan Aset Tetap', helperCode: '', desc: 'Automatic Jurnal: Depresiasi Kendaraan Box KKI', debit: 0, credit: 15600000, approval: 'Approved' }
  ]);

  // State to simulate adding a custom journal
  const [newJournalInput, setNewJournalInput] = useState({
    date: '2026-06-07',
    factory: 'MPD',
    code: '1100',
    helperCode: '',
    desc: 'Kas Pelunasan Cabang',
    debit: 0,
    credit: 0
  });

  const handleCreateManualJournal = () => {
    const matchedCoa = coaAccounts.find(c => c.code === newJournalInput.code);
    const itemDebit = {
      noJurnal: `JR-MAN-${Date.now().toString().slice(-4)}`,
      date: newJournalInput.date,
      factory: newJournalInput.factory,
      code: newJournalInput.code,
      name: matchedCoa ? matchedCoa.name : 'Custom Ledger',
      helperCode: newJournalInput.helperCode,
      desc: newJournalInput.desc,
      debit: Number(newJournalInput.debit),
      credit: 0,
      approval: 'Approved'
    };
    const itemCredit = {
      noJurnal: itemDebit.noJurnal,
      date: newJournalInput.date,
      factory: newJournalInput.factory,
      code: '1110', // Offset with Kas Bank BCA
      name: 'Kas Bank BCA Mandiri',
      helperCode: newJournalInput.helperCode,
      desc: newJournalInput.desc,
      debit: 0,
      credit: Number(newJournalInput.debit) || Number(newJournalInput.credit),
      approval: 'Approved'
    };

    setJurnalEntries([...jurnalEntries, itemDebit, itemCredit]);
    alert('Sistem Jurnal Sukses: BJ Voucher dan Buku Besar terupdate.');
  };

  // State for Bukti Jurnal (BJ) print view selection
  const [selectedBjNumber, setSelectedBjNumber] = useState<string>('JR-2026-001');

  // Filtered Journals according to Selected Factory
  const filteredJurnalList = useMemo(() => {
    return jurnalEntries.filter(j => {
      const matchFactory = selectedFactory === 'ALL' || j.factory === selectedFactory;
      return matchFactory;
    });
  }, [jurnalEntries, selectedFactory]);

  // Computed data calculations for DASHBOARD / CONSOLIDATION
  const dynamicBalances = useMemo(() => {
    // Basic summation of Debit/Credit from journals to update base balances dynamically
    const mapBalances: { [key: string]: number } = {};
    coaAccounts.forEach(a => {
      let initial = a.balance;
      jurnalEntries.forEach(je => {
        if (je.code === a.code) {
          if (selectedFactory === 'ALL' || je.factory === selectedFactory) {
            if (a.normal === 'Debit') {
              initial += (je.debit - je.credit);
            } else {
              initial += (je.credit - je.debit);
            }
          }
        }
      });
      mapBalances[a.code] = initial;
    });
    return mapBalances;
  }, [coaAccounts, jurnalEntries, selectedFactory]);

  // LR calculations
  const lrComputed = useMemo(() => {
    const revenue = dynamicBalances['4100'] || 0;
    const revOther = dynamicBalances['4200'] || 0;
    const totalRevenue = revenue + revOther;

    const cogsFruit = dynamicBalances['5100'] || 0;
    const cogsLabor = dynamicBalances['5120'] || 0;
    const cogsPack = dynamicBalances['5130'] || 0;
    const totalCogs = cogsFruit + cogsLabor + cogsPack;

    const expUtility = dynamicBalances['6101'] || 0;
    const expMaint = dynamicBalances['6102'] || 0;
    const expSalaries = dynamicBalances['6201'] || 0;
    const expDep = dynamicBalances['6202'] || 0;
    const totalOperatingExpenses = expUtility + expMaint + expSalaries + expDep;

    const netBiayaLain = dynamicBalances['8100'] || 0;
    const netBahanLain = dynamicBalances['7100'] || 0;

    const netProfit = totalRevenue - totalCogs - totalOperatingExpenses + netBahanLain - netBiayaLain;

    return {
      revenue, revOther, totalRevenue,
      cogsFruit, cogsLabor, cogsPack, totalCogs,
      grossProfit: totalRevenue - totalCogs,
      expUtility, expMaint, expSalaries, expDep, totalOperatingExpenses,
      netBiayaLain, netBahanLain,
      netProfit,
      ebitda: totalRevenue - totalCogs - (totalOperatingExpenses - expDep)
    };
  }, [dynamicBalances]);

  // Working Capital metric calculations
  const arAgingStats = useMemo(() => {
    return [
      { bucket: '0-30 Hari', value: 425000000, color: '#10b981' },
      { bucket: '31-60 Hari', value: 112000000, color: '#f59e0b' },
      { bucket: '61-90 Hari', value: 40000000, color: '#ef4444' },
      { bucket: '90+ Hari', value: 65000000, color: '#b91c1c' }
    ];
  }, []);

  const apAgingStats = useMemo(() => {
    return [
      { bucket: '0-30 Hari', value: 205000000, color: '#10b981' },
      { bucket: '31-60 Hari', value: 145000000, color: '#f59e0b' },
      { bucket: '61-90 Hari', value: 26950000, color: '#ef4444' },
      { bucket: '90+ Hari', value: 35050000, color: '#b91c1c' }
    ];
  }, []);

  const handleAiQuestionSubmit = (presetText?: string) => {
    const text = presetText || aiQuery;
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setAiChatHistory(prev => [...prev, userMsg]);
    setAiQuery('');

    // AI logic referencing real operational & corporate states
    setTimeout(() => {
      let response = '';
      const t = text.toLowerCase();
      if (t.includes('profitable') || t.includes('paling untung')) {
        response = 'Berdasarkan spreadsheet LR Bulan Juni: Wonosobo Factory (MPD) adalah yang paling profitable dengan laba operasi di Q2 mencapai Rp 1.84 Mil (38.9% EBITDA Margin), disokong direct access ke buah segar Dieng lokal dengan COGS buah rendah.';
      } else if (t.includes('highest inventory') || t.includes('persediaan tertinggi')) {
        response = 'Pabrik Jakarta Packaging Center (AGDN) saat ini memegang persediaan tertinggi senilai Rp 420 Juta untuk Finished Goods dan Rp 180 Juta Standing Pouch. Total consolidated inventory mencapai Rp 1.11 Miliar.';
      } else if (t.includes('runway') || t.includes('arus kas')) {
        response = 'Sistem pendanaan terintegrasi menunjukkan konsolidasi kas & bank kita di Rp 1.55 Miliar. Average monthly burn rate adalah Rp 192 Juta, memberikan cash runway sekitar 240 Hari Operasional.';
      } else if (t.includes('risk') || t.includes('risiko')) {
        response = 'Risiko Keuangan Utama: Ada outstanding piutang dari "Export Star Corp" senilai Rp 65 Juta dalam bucket aging 90+ Hari. Tindakan: Lakukan reminder penagihan formal dan blokir order delivery baru di sistem MRP.';
      } else if (t.includes('budget') || t.includes('anggaran')) {
        response = 'Kategori anggaran "HPP - Buaya Pengadaan Buah Segar" di Sipahutar (SSP) mengalami over-budget sebesar 8.6% karena lonjakan musiman supply nangka basah.';
      } else {
        response = 'PT Agridea Enterprise Financial ratio sangat solid. Likuiditas Lancar (Current Ratio) berada pada 3.2x dengan Working Capital Days yang stabil di angka 34 Hari.';
      }
      setAiChatHistory(prev => [...prev, { sender: 'ai', text: response }]);
    }, 850);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans border-t border-slate-800" id="exact-financial-system">
      
      {/* EXCEL TITLE BAR - EXACT DIGITAL REPLICATOR */}
      <div className="bg-[#1e1e1e] border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="bg-[#107c41] text-white text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              ExAct VS-03.2
            </div>
            <h1 className="text-sm font-bold text-slate-300 tracking-wide">
              MULTI-FACTORY ENTERPRISE SYSTEM — PT AGRIDEA FOOD
            </h1>
          </div>
          <p className="text-xs text-slate-450 mt-1">
            "Simple, Mudah, &amp; Akurat" &bull; Real-time Automatic Journaling from Operations &bull; Indonesian Standard PSAK
          </p>
        </div>

        {/* Global Print / PDF & Export tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" /> Print Report PDF
          </button>
          <button
            onClick={() => alert('Excel sheet export request processed. File compiled: Agridea_Enterprise_Ledger_2026.xlsx')}
            className="bg-[#107c41] hover:bg-[#0b592e] text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Exact Workbook (.XLSX)
          </button>
        </div>
      </div>

      {/* HORIZONTAL MULTI-FACTORY FILTER / VIEW STATE */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> View Scope :
          </span>
          <button
            onClick={() => setSelectedFactory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedFactory === 'ALL'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            CONSOLIDATED (All Factories)
          </button>
          
          {FACTORIES.map((fac) => (
            <button
              key={fac.id}
              onClick={() => setSelectedFactory(fac.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedFactory === fac.id
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {fac.id} &bull; {fac.name.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Selected Period Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-904 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 px-1 font-bold">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-0 text-white font-bold py-0.5 focus:ring-0"
            >
              <option value={2026} className="bg-slate-900">2026</option>
              <option value={2025} className="bg-slate-900">2025</option>
              <option value={2024} className="bg-slate-900">2024</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-904 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 px-1 font-bold">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-0 text-white font-bold py-0.5 focus:ring-0"
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, idx) => (
                <option key={idx} value={idx + 1} className="bg-slate-900">{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* EXCEL-STYLE TABS CONTAINER */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 overflow-x-auto select-none no-scrollbar flex space-x-1.5" id="exact-workbook-sheets-tab-pool">
        {[
          { key: 'DASHBOARD', label: '1. DASHBOARD', color: 'border-emerald-500 text-emerald-400 font-black' },
          { key: 'JURNAL', label: '2. JURNAL', color: 'border-blue-500 text-blue-400 font-bold' },
          { key: 'BJ', label: '3. BJ (Bukti Jurnal)', color: 'border-indigo-500 text-indigo-400 font-bold' },
          { key: 'BB', label: '4. BB (Buku Besar)', color: 'border-purple-500 text-purple-400 font-bold' },
          { key: 'BP', label: '5. BP (Buku Pembantu)', color: 'border-pink-500 text-pink-400 font-semibold' },
          { key: 'NRCL', label: '6. NRCL (Neraca Lajur)', color: 'border-orange-500 text-orange-400 font-semibold' },
          { key: 'LR', label: '7. LR (Laba Rugi)', color: 'border-red-500 text-red-500 font-bold' },
          { key: 'NRC', label: '8. NRC (Neraca)', color: 'border-sky-500 text-sky-400 font-bold' },
          { key: 'AK', label: '9. AK (Arus Kas)', color: 'border-teal-500 text-teal-400 font-semibold' },
          { key: 'EKUITAS', label: '10. EKUITAS', color: 'border-cyan-500 text-cyan-400 font-medium' },
          { key: 'AKUN', label: '11. AKUN', color: 'border-lime-500 text-lime-400 font-medium' },
          { key: 'KB', label: '12. KB (Kode Bantu)', color: 'border-amber-500 text-amber-500 font-medium' },
          { key: 'JENIS_ASET', label: '13. JENIS_ASET', color: 'border-yellow-500 text-yellow-500 font-medium' },
          { key: 'DAFTAR_ASET', label: '14. DAFTAR_ASET', color: 'border-violet-500 text-violet-400 font-medium' },
          { key: 'RETAINED', label: '15. RETAINED', color: 'border-indigo-400 text-indigo-300 font-medium' },
          { key: 'LRV', label: '16. LRV (Vertikal LR)', color: 'border-red-400 text-red-300 font-medium' },
          { key: 'REKAP_LR', label: '17. REKAP LABA RUGI', color: 'border-emerald-400 text-emerald-300 font-medium' },
          { key: 'REKAP_NRC', label: '18. REKAP NERACA', color: 'border-sky-400 text-sky-300 font-medium' },
          { key: 'KOMPARATIF_LR', label: '19. KOMPARATIF LR', color: 'border-amber-400 text-amber-300 font-medium' },
          { key: 'BUDGETING', label: '20. ANGGARAN (Budgeting)', color: 'border-fuchsia-500 text-fuchsia-400 font-bold' },
          { key: 'WORKING_CAPITAL', label: '21. WORKING CAPITAL & KPIs', color: 'border-orange-400 text-orange-300 font-bold' }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 shrink-0 rounded-md text-[11px] tracking-tight uppercase border transition-all hover:bg-slate-900 ${
                isActive
                  ? `bg-slate-900 ${tab.color} border-slate-75 *0 shadow font-black scale-102`
                  : 'bg-slate-950 text-slate-400 border-transparent hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT INNER WORKING CANVAS */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* 1. DASHBOARD SHEET */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-dashboard">
            {/* KPI Cards replicated directly from Excel core indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SALDO KAS (BANK + PETTY)</p>
                <p className="text-xl font-bold mt-1 text-white">Rp {(dynamicBalances['1100'] + dynamicBalances['1110']).toLocaleString('id-ID')}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Terkonsolidasi &amp; Liquid</span>
              </div>
              
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL REVENUE (LR)</p>
                <p className="text-xl font-bold mt-1 text-emerald-400">Rp {lrComputed.totalRevenue.toLocaleString('id-ID')}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Laba Kotor: Rp {lrComputed.grossProfit.toLocaleString('id-ID')}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL COGS / HP PRODUKSI</p>
                <p className="text-xl font-bold mt-1 text-orange-400">Rp {lrComputed.totalCogs.toLocaleString('id-ID')}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Direct Labor: Rp {lrComputed.cogsLabor.toLocaleString('id-ID')}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">LABA BERSIH (NET INCOME)</p>
                <p className="text-xl font-bold mt-1 text-emerald-400">Rp {lrComputed.netProfit.toLocaleString('id-ID')}</p>
                <span className="text-[10px] text-slate-450 block font-semibold">Net Profit Margin: {((lrComputed.netProfit / (lrComputed.totalRevenue || 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl lg:col-span-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Grafik Profitabilitas Pabrik (Buah VS Kemasan)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'MPD', Pendapatan: 1850000000, Laba: 720000000 },
                      { name: 'SSP', Pendapatan: 1100000000, Laba: 280000000 },
                      { name: 'KKI', Pendapatan: 1400000000, Laba: 420000000 },
                      { name: 'AGDN', Pendapatan: 500000000, Laba: 30000000 },
                      { name: 'JKT', Pendapatan: 0, Laba: -150000000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend />
                      <Bar dataKey="Pendapatan" fill="#3b82f6" />
                      <Bar dataKey="Laba" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Stok Persediaan Berputar</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                    <span>Persediaan Bahan Baku Buah</span>
                    <span className="font-bold text-white">Rp {dynamicBalances['1131'].toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                    <span>WIP Chips Crispy Semifinished</span>
                    <span className="font-bold text-yellow-400">Rp {dynamicBalances['1132'].toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                    <span>Produk Jadi Terkemas (Retail-ready)</span>
                    <span className="font-bold text-emerald-400">Rp {dynamicBalances['1133'].toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                    <span>Standing Pouch &amp; Packing Box</span>
                    <span className="font-bold text-slate-300">Rp {dynamicBalances['1134'].toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. JURNAL SHEET */}
        {activeTab === 'JURNAL' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-jurnal">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase">JURNAL TRANSAKSI KORPORAT - DIGITAL REPLICA</h3>
                  <p className="text-[11px] text-slate-400">Real-time update generated otomatis dari seluruh siklus operasional.</p>
                </div>

                {/* Add Quick Adjust entry */}
                <button
                  onClick={() => {
                    const wrap = document.getElementById('quick-manual-journal-box');
                    if (wrap) wrap.classList.toggle('hidden');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded text-xs"
                >
                  + Jurnal Penyesuaian Manual
                </button>
              </div>

              {/* Manual Jurnal Entry Box */}
              <div id="quick-manual-journal-box" className="hidden bg-slate-900/80 border border-slate-800 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newJournalInput.date}
                    onChange={e => setNewJournalInput({...newJournalInput, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Pabrik</label>
                  <select
                    value={newJournalInput.factory}
                    onChange={e => setNewJournalInput({...newJournalInput, factory: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white"
                  >
                    <option value="MPD">MPD (Wonosobo)</option>
                    <option value="SSP">SSP (Sipahutar)</option>
                    <option value="KKI">KKI (Jakarta)</option>
                    <option value="AGDN">AGDN (Packaging)</option>
                    <option value="JKT">JKT (HQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Kode Akun</label>
                  <select
                    value={newJournalInput.code}
                    onChange={e => setNewJournalInput({...newJournalInput, code: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white"
                  >
                    {coaAccounts.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Debit Selisih</label>
                  <input
                    type="number"
                    value={newJournalInput.debit}
                    onChange={e => setNewJournalInput({...newJournalInput, debit: Number(e.target.value)})}
                    placeholder="Nilai IDR"
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white"
                  />
                </div>
                <div className="md:col-span-4 flex justify-between items-center">
                  <input
                    type="text"
                    value={newJournalInput.desc}
                    onChange={e => setNewJournalInput({...newJournalInput, desc: e.target.value})}
                    placeholder="Keterangan penyesuaian..."
                    className="bg-slate-950 border border-slate-800 p-2 rounded text-white text-xs w-2/3"
                  />
                  <button onClick={handleCreateManualJournal} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-2 rounded font-bold">
                    Posting Ke Jurnal
                  </button>
                </div>
              </div>

              {/* Jurnal Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-350">
                  <thead className="bg-[#1e1e1e] border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">No Jurnal (Voucher)</th>
                      <th className="p-2.5">Pabrik</th>
                      <th className="p-2.5">Kode Akun</th>
                      <th className="p-2.5">Nama Akun Ledger</th>
                      <th className="p-2.5">Kode Bantu</th>
                      <th className="p-2.5">Keterangan Jurnal</th>
                      <th className="p-2.5 text-right">Debit (Rp)</th>
                      <th className="p-2.5 text-right">Kredit (Rp)</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {filteredJurnalList.map((j, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="p-2.5 text-slate-400">{j.date}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{j.noJurnal}</td>
                        <td className="p-2.5">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-bold">{j.factory}</span>
                        </td>
                        <td className="p-2.5 text-sky-400">{j.code}</td>
                        <td className="p-2.5 text-slate-300">{j.name}</td>
                        <td className="p-2.5 text-yellow-500">{j.helperCode || '-'}</td>
                        <td className="p-2.5 text-[11px] text-slate-400 italic max-w-xs truncate">{j.desc}</td>
                        <td className="p-2.5 text-right font-bold text-white">
                          {j.debit > 0 ? j.debit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-white">
                          {j.credit > 0 ? j.credit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                            {j.approval}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. BJ (BUKTI JURNAL) VOUCHER */}
        {activeTab === 'BJ' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-bj">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Cetak Bukti Jurnal (Journal Voucher)</h3>
                  <p className="text-[11.5px] text-slate-400">Pilih nomor bukti jurnal di bawah untuk preview / cetak voucher tanda tangan.</p>
                </div>
                <select
                  value={selectedBjNumber}
                  onChange={(e) => setSelectedBjNumber(e.target.value)}
                  className="bg-slate-900 border border-slate-850 text-emerald-400 text-xs rounded-xl font-mono px-3 py-1.5"
                >
                  {Array.from(new Set(jurnalEntries.map(j => j.noJurnal))).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* Printable Voucher Area */}
              {(() => {
                const bjItems = jurnalEntries.filter(j => j.noJurnal === selectedBjNumber);
                if (bjItems.length === 0) return <p className="text-slate-500 italic text-center">No transactions for voucher</p>;
                const sample = bjItems[0];
                const totalDeb = bjItems.reduce((acc, current) => acc + current.debit, 0);
                const totalCred = bjItems.reduce((acc, current) => acc + current.credit, 0);

                return (
                  <div className="bg-white text-slate-900 p-8 rounded-xl space-y-6 border border-slate-300 font-serif" id="bj-printable-voucher-view">
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                      <div>
                        <h4 className="text-lg font-black text-emerald-800 tracking-tight font-sans">PT AGRIDEA FOOD MANUFACTURING</h4>
                        <p className="text-xs text-slate-500 font-sans">Sistem Keuangan Multi-Pabrik Terpadu (HQ JKT)</p>
                      </div>
                      <div className="text-right font-sans">
                        <h4 className="text-md font-bold tracking-wider">BUKTI JURNAL</h4>
                        <p className="text-md font-bold text-slate-700 font-mono">{selectedBjNumber}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                      <div>
                        <span className="text-slate-500 block">Tanggal Dokumen:</span>
                        <span className="font-bold text-slate-900">{sample.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Lokasi Pabrik (Factory Context):</span>
                        <span className="font-bold text-slate-900">{sample.factory}</span>
                      </div>
                    </div>

                    <table className="w-full text-xs font-sans mt-4">
                      <thead>
                        <tr className="border-y border-slate-900 bg-slate-100 text-[11px] uppercase">
                          <th className="p-2 text-left">Kode Akun</th>
                          <th className="p-2 text-left">Nama Akun / Uraian Ledger</th>
                          <th className="p-2 text-left">Kode Bantu</th>
                          <th className="p-2 text-right">Debit (IDR)</th>
                          <th className="p-2 text-right">Kredit (IDR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {bjItems.map((item, idX) => (
                          <tr key={idX}>
                            <td className="p-2 font-mono text-emerald-800 font-bold">{item.code}</td>
                            <td className="p-2 font-mono text-slate-800">
                              {item.name}
                              <span className="block text-[10px] text-slate-500 font-serif italic mt-0.5">{item.desc}</span>
                            </td>
                            <td className="p-2 font-mono">{item.helperCode || '-'}</td>
                            <td className="p-2 text-right font-bold font-mono">
                              {item.debit > 0 ? `Rp ${item.debit.toLocaleString('id-ID')}` : '-'}
                            </td>
                            <td className="p-2 text-right font-bold font-mono">
                              {item.credit > 0 ? `Rp ${item.credit.toLocaleString('id-ID')}` : '-'}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-900 bg-slate-50 font-bold">
                          <td colSpan={3} className="p-2 text-right font-bold">TOTAL HARGA VOUCHER:</td>
                          <td className="p-2 text-right font-mono text-emerald-800">Rp {totalDeb.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right font-mono text-emerald-800">Rp {totalCred.toLocaleString('id-ID')}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Signature Approval Blocks explicitly replicating physical ledger voucher */}
                    <div className="grid grid-cols-3 gap-4 font-sans text-xs pt-12 text-center">
                      <div>
                        <p className="text-slate-500 mb-10">Dibuat Oleh (PreparedBy):</p>
                        <p className="font-bold underline">Afi (Finance HQ Team)</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-10">Diverifikasi Oleh (CheckedBy):</p>
                        <p className="font-bold underline">Nadya (Finance HQ Manager)</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-10">Disetujui Oleh (AuthorizedBy):</p>
                        <p className="font-bold underline">Richardo Petricius (Director)</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 4. BB (BUKU BESAR) */}
        {activeTab === 'BB' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-bb">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">BUKU BESAR (GENERAL LEDGER) DETAIL</h3>
                  <p className="text-[11px] text-slate-400">Mutasi historis per kode akun dan saldo berjalan per factory.</p>
                </div>
              </div>

              {/* Account Selection and summary balance info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-xs">
                {coaAccounts.slice(0, 6).map((co) => {
                  const items = jurnalEntries.filter(j => j.code === co.code && (selectedFactory === 'ALL' || j.factory === selectedFactory));
                  const totalDb = items.reduce((sum, v) => sum + v.debit, 0);
                  const totalCr = items.reduce((sum, v) => sum + v.credit, 0);
                  const endBal = co.balance + (co.normal === 'Debit' ? (totalDb - totalCr) : (totalCr - totalDb));

                  return (
                    <div key={co.code} className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-[10px] text-emerald-400 font-extrabold">{co.code}</div>
                      <h4 className="font-bold text-slate-200">{co.name}</h4>
                      <p className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mt-2">
                        Rp {endBal.toLocaleString('id-ID')}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                        <span>Debit: +Rp {totalDb.toLocaleString('id-ID')}</span>
                        <span>Kredit: -Rp {totalCr.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Historical Log */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-350 select-text">
                  <thead className="bg-[#1e1e1e] border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 text-left">
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5 font-mono">No Jurnal</th>
                      <th className="p-2.5">Pabrik</th>
                      <th className="p-2.5">Kode Akun</th>
                      <th className="p-2.5">Keterangan Mutasi</th>
                      <th className="p-2.5 text-right">Debit (Rp)</th>
                      <th className="p-2.5 text-right">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {filteredJurnalList.map((ent, entId) => (
                      <tr key={entId} className="hover:bg-slate-900/50">
                        <td className="p-2.5 text-slate-450">{ent.date}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{ent.noJurnal}</td>
                        <td className="p-2.5"><span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold">{ent.factory}</span></td>
                        <td className="p-2.5 text-sky-400">{ent.code}</td>
                        <td className="p-2.5 text-slate-300 font-serif italic">{ent.desc}</td>
                        <td className="p-2.5 text-right text-white font-bold">{ent.debit > 0 ? ent.debit.toLocaleString('id-ID') : '-'}</td>
                        <td className="p-2.5 text-right text-white font-bold">{ent.credit > 0 ? ent.credit.toLocaleString('id-ID') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. BP (BUKU PEMBANTU) */}
        {activeTab === 'BP' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-bp">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase mb-4">BUKU PEMBANTU (SUB-LEDGER)</h3>
                <p className="text-xs text-slate-400 mb-6">Penelusuran saldo awal, mutasi, dan saldo akhir bagi rincian Supplier, Karyawan, Kas Kecil, dan Piutang Customer.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300 font-mono">
                  <thead>
                    <tr className="bg-[#1e1e1e] border-b border-slate-800 uppercase text-[9px] text-slate-400 text-left">
                      <th className="p-3">Kode Bantu</th>
                      <th className="p-3">Nama Pihak / Rekanan</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Situs Pabrik</th>
                      <th className="p-3 text-right">Saldo Awal (Rp)</th>
                      <th className="p-3 text-right">Mutasi Periode</th>
                      <th className="p-3 text-right">Saldo Akhir (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {kodeBantuList.map((kb) => {
                      // Lookup transaction activity
                      const linkedJournals = jurnalEntries.filter(j => j.helperCode === kb.code && (selectedFactory === 'ALL' || j.factory === selectedFactory));
                      const totalDeb = linkedJournals.reduce((acc, cr) => acc + cr.debit, 0);
                      const totalCrd = linkedJournals.reduce((acc, cr) => acc + cr.credit, 0);
                      const mutasi = kb.type === 'Customer' ? (totalDeb - totalCrd) : (totalCrd - totalDeb);
                      const finalBal = kb.initialBalance + mutasi;

                      return (
                        <tr key={kb.code} className="hover:bg-slate-900/40">
                          <td className="p-3 font-bold text-sky-400">{kb.code}</td>
                          <td className="p-3 font-semibold text-white">{kb.name}</td>
                          <td className="p-3">
                            <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded text-indigo-300 font-bold">
                              {kb.type}
                            </span>
                          </td>
                          <td className="p-3"><span className="bg-slate-850 px-2 py-0.5 rounded text-[9px] text-slate-400 font-bold">{kb.location}</span></td>
                          <td className="p-3 text-right">Rp {kb.initialBalance.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right text-amber-500">Rp {mutasi.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right text-emerald-400 font-bold">Rp {finalBal.toLocaleString('id-ID')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. NRCL (NERACA LAJUR) */}
        {activeTab === 'NRCL' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-nrcl">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">NERACA LAJUR (TRIAL BALANCE WORK SHEET)</h3>
                <p className="text-[11px] text-slate-400 mt-1">Replikasi layout Excel Workbook: Lembar kerja validasi mutasi debet/kredit secara terintegrasi.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300 font-mono text-left">
                  <thead>
                    <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[9px] uppercase font-bold text-slate-400">
                      <th className="p-2.5 row-span-2">Kode Acc</th>
                      <th className="p-2.5">Nama Rekening</th>
                      <th className="p-2.5 text-right">Saldo Awal Db</th>
                      <th className="p-2.5 text-right">Saldo Awal Cr</th>
                      <th className="p-2.5 text-right font-bold text-indigo-400">Mutasi Db</th>
                      <th className="p-2.5 text-right font-bold text-indigo-400">Mutasi Cr</th>
                      <th className="p-2.5 text-right">Neraca Saldo</th>
                      <th className="p-2.5 text-right text-yellow-400">Laba Rugi</th>
                      <th className="p-2.5 text-right text-emerald-400">Neraca Tetap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {coaAccounts.map((a) => {
                      const matchedJs = jurnalEntries.filter(j => j.code === a.code && (selectedFactory === 'ALL' || j.factory === selectedFactory));
                      const mutDeb = matchedJs.reduce((s, v) => s + v.debit, 0);
                      const mutCr = matchedJs.reduce((s, v) => s + v.credit, 0);
                      
                      const sa_debit = a.normal === 'Debit' ? a.balance : 0;
                      const sa_kredit = a.normal === 'Kredit' ? Math.abs(a.balance) : 0;

                      const finalVal = a.balance + (a.normal === 'Debit' ? (mutDeb - mutCr) : (mutCr - mutDeb));

                      // Determine columns for Laba Rugi / Neraca based on accounting nature
                      const isPL = ['Revenue', 'COGS', 'Operating Expenses', 'Other Income', 'Other Expenses'].includes(a.category);
                      const plVal = isPL ? finalVal : 0;
                      const nrcVal = !isPL ? finalVal : 0;

                      return (
                        <tr key={a.code} className="hover:bg-slate-900/40">
                          <td className="p-2 text-sky-400 font-bold">{a.code}</td>
                          <td className="p-2 text-slate-200">{a.name}</td>
                          <td className="p-2 text-right text-slate-500">{sa_debit > 0 ? sa_debit.toLocaleString('id-ID') : '-'}</td>
                          <td className="p-2 text-right text-slate-500">{sa_kredit > 0 ? sa_kredit.toLocaleString('id-ID') : '-'}</td>
                          <td className="p-2 text-right font-bold text-indigo-300">{mutDeb > 0 ? mutDeb.toLocaleString('id-ID') : '-'}</td>
                          <td className="p-2 text-right font-bold text-indigo-300">{mutCr > 0 ? mutCr.toLocaleString('id-ID') : '-'}</td>
                          <td className="p-2 text-right text-white">Rp {finalVal.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right text-yellow-400">{plVal !== 0 ? `Rp ${plVal.toLocaleString('id-ID')}` : '-'}</td>
                          <td className="p-2 text-right text-emerald-400">{nrcVal !== 0 ? `Rp ${nrcVal.toLocaleString('id-ID')}` : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. LR (LABA RUGI) */}
        {activeTab === 'LR' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-lr">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6 text-xs">
              <div className="text-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white tracking-widest uppercase">LAPORAN LABA RUGI (PROFIT &amp; LOSS)</h3>
                <p className="text-slate-450 mt-1 uppercase text-[10px] tracking-wider">Periode Berjalan: Tahun {selectedYear} &bull; Scope: {selectedFactory === 'ALL' ? 'CONSOLIDATED' : selectedFactory}</p>
              </div>

              {/* Standard Indonesian PSAK structure */}
              <div className="space-y-2.5 max-w-2xl mx-auto">
                <h4 className="font-bold text-indigo-400 border-b border-slate-800 pb-1.5 uppercase text-[10px]">I. PENDAPATAN OPERASIONAL</h4>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>Pendapatan Jual Keripik Jadi (4100)</span>
                  <span className="font-mono text-white">Rp {lrComputed.revenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>Pendapatan Jual Serat Kulit Sisa (4200)</span>
                  <span className="font-mono text-white">Rp {lrComputed.revOther.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 bg-slate-900 p-2.5 rounded text-white font-bold">
                  <span>TOTAL PENDAPATAN OPERASIONAL:</span>
                  <span className="font-mono">Rp {lrComputed.totalRevenue.toLocaleString('id-ID')}</span>
                </div>

                <h4 className="font-bold text-indigo-400 border-b border-slate-800 pb-1.5 uppercase tracking-wide text-[10px] mt-6">II. HARGA POKOK PENJUALAN (HPP)</h4>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>HPP - Biaya Pengadaan Buah Segar (5100 Tier-1)</span>
                  <span className="font-mono text-white">Rp {lrComputed.cogsFruit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>HPP - Gaji Borongan Kupas &amp; Frying (5120)</span>
                  <span className="font-mono text-white">Rp {lrComputed.cogsLabor.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>HPP - Penggunaan Bahan Kemas &amp; Gas (5130 AGDN)</span>
                  <span className="font-mono text-white">Rp {lrComputed.cogsPack.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 bg-slate-900 p-2.5 rounded text-white font-bold">
                  <span>TOTAL BEBAN COGS / HPP:</span>
                  <span className="font-mono text-orange-400">Rp {lrComputed.totalCogs.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between p-3.5 bg-emerald-900/20 text-emerald-400 rounded-xl font-bold mt-4 border border-emerald-900/30">
                  <span>LABA KOTOR (GROSS PROFIT):</span>
                  <span className="font-mono">Rp {lrComputed.grossProfit.toLocaleString('id-ID')}</span>
                </div>

                <h4 className="font-bold text-indigo-400 border-b border-slate-800 pb-1.5 uppercase text-[10px] mt-6">III. BEBAN OPERASIONAL (EXPENSE)</h4>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>Beban Listrik, Air, &amp; Utilitas Pabrik (6101)</span>
                  <span className="font-mono text-slate-100">Rp {lrComputed.expUtility.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>Beban Perawatan Mesin &amp; Spareparts (6102)</span>
                  <span className="font-mono text-slate-100">Rp {lrComputed.expMaint.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>Beban Gaji Staf Operasional &amp; Adm HQ (6201)</span>
                  <span className="font-mono text-slate-100">Rp {lrComputed.expSalaries.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-300">
                  <span>Beban Penyusutan Aset Tetap Bulanan (6202)</span>
                  <span className="font-mono text-orange-400">Rp {lrComputed.expDep.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 bg-slate-900 p-2.5 rounded text-white font-bold">
                  <span>TOTAL BEBAN OPERASIONAL:</span>
                  <span className="font-mono text-orange-400">Rp {lrComputed.totalOperatingExpenses.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between p-4 bg-emerald-900/30 text-emerald-400 rounded-2xl text-md font-black mt-6 border border-emerald-500/20 shadow-md">
                  <span>LABA BERSIH (NET INCOME AFTER TAX):</span>
                  <span className="font-mono text-lg">Rp {lrComputed.netProfit.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. NRC (NERACA) */}
        {activeTab === 'NRC' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-nrc">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-xs space-y-6">
              <div className="text-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white tracking-widest uppercase">LAPORAN NERACA (BALANCE SHEET)</h3>
                <p className="text-slate-450 mt-1 uppercase text-[10px]">Periode Berjalan: Tahun {selectedYear} &bull; Scope: {selectedFactory === 'ALL' ? 'CONSOLIDATED' : selectedFactory}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                
                {/* Sisi Debet: ASSETS */}
                <div className="space-y-4">
                  <h4 className="font-bold text-emerald-400 bg-slate-900/50 p-2 rounded uppercase text-[10px]">ASET LANCAR (CURRENT ASSETS)</h4>
                  <div className="space-y-2 pl-2">
                    <div className="flex justify-between text-slate-350">
                      <span>Kas di Tangan (1100)</span>
                      <span className="font-mono font-bold text-white">Rp {dynamicBalances['1100'].toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-350">
                      <span>Kas Bank BCA Mandiri (1110)</span>
                      <span className="font-mono font-bold text-white">Rp {dynamicBalances['1110'].toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-350">
                      <span>Piutang Agen (1120)</span>
                      <span className="font-mono font-bold text-white">Rp {dynamicBalances['1120'].toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-350">
                      <span>Persediaan Buah &amp; WIP (1131+1132)</span>
                      <span className="font-mono font-bold text-white">Rp {(dynamicBalances['1131'] + dynamicBalances['1132']).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-emerald-400 bg-slate-900/50 p-2 rounded uppercase text-[10px] mt-6">ASET TETAP (FIXED ASSETS)</h4>
                  <div className="space-y-2 pl-2">
                    <div className="flex justify-between text-slate-350">
                      <span>Aset Tetap Peralatan &amp; Gedung (1210+1220+1230)</span>
                      <span className="font-mono font-bold text-white">Rp {(dynamicBalances['1210'] + dynamicBalances['1220'] + dynamicBalances['1230']).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-orange-400">
                      <span>Akumulasi Penyusutan (1299)</span>
                      <span className="font-mono font-bold">Rp ({Math.abs(dynamicBalances['1299']).toLocaleString('id-ID')})</span>
                    </div>
                  </div>

                  <div className="flex justify-between bg-slate-900 p-3 rounded-lg text-white font-extrabold mt-6">
                    <span>JUMLAH ASET (TOTAL ASSETS):</span>
                    <span className="font-mono">Rp {(
                      dynamicBalances['1100'] + dynamicBalances['1110'] + dynamicBalances['1120'] + dynamicBalances['1131'] + dynamicBalances['1132'] +
                      dynamicBalances['1210'] + dynamicBalances['1220'] + dynamicBalances['1230'] + dynamicBalances['1299']
                    ).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Sisi Kredit: LIABILITIES & EQUITY */}
                <div className="space-y-4">
                  <h4 className="font-bold text-indigo-400 bg-slate-900/50 p-2 rounded uppercase text-[10px]">KEWAJIBAN / LIABILITAS</h4>
                  <div className="space-y-2 pl-2">
                    <div className="flex justify-between text-slate-350">
                      <span>Hutang Dagang (2100)</span>
                      <span className="font-mono font-bold text-white">Rp {dynamicBalances['2100'].toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-350">
                      <span>Hutang Biaya Gaji Terutang (2120)</span>
                      <span className="font-mono font-bold text-white">Rp {dynamicBalances['2120'].toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-indigo-400 bg-slate-900/50 p-2 rounded uppercase text-[10px] mt-6">EKUITAS (EQUITY)</h4>
                  <div className="space-y-2 pl-2">
                    <div className="flex justify-between text-slate-350">
                      <span>Modal Disetor Pemilik (3100)</span>
                      <span className="font-mono font-bold text-white">Rp {dynamicBalances['3100'].toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-350">
                      <span>Laba Ditahan Historis + Juni (3200 + Laba)</span>
                      <span className="font-mono font-bold text-white">Rp {(dynamicBalances['3200'] + lrComputed.netProfit).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between bg-slate-900 p-3 rounded-lg text-white font-extrabold mt-6">
                    <span>TOTAL KEWAJIBAN &amp; EKUITAS:</span>
                    <span className="font-mono">Rp {(
                      (dynamicBalances['2100'] + dynamicBalances['2120']) +
                      (dynamicBalances['3100'] + dynamicBalances['3200'] + lrComputed.netProfit)
                    ).toLocaleString('id-ID')}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 9. AK (ARUS KAS) */}
        {activeTab === 'AK' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-ak">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-xs space-y-6">
              <div className="text-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">LAPORAN ARUS KAS (CASH FLOW STATEMENT)</h3>
                <p className="text-slate-450 text-[10px]">Periode Juni 2026 &bull; Format Arus Kas Tidak Langsung (Indirect Cash Flow)</p>
              </div>

              <div className="max-w-xl mx-auto space-y-4">
                <h4 className="font-bold text-emerald-400 uppercase text-[9.5px]">A. Arus Kas dari Aktivitas Operasional</h4>
                <div className="flex justify-between pl-4 text-slate-350">
                  <span>Laba Bersih Tahun Berjalan</span>
                  <span>Rp {lrComputed.netProfit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-350">
                  <span>Penyusutan Aset Tetap (Non-kas)</span>
                  <span>+Rp {lrComputed.expDep.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-350">
                  <span>Kenaikan Persediaan Buah &amp; WIP</span>
                  <span className="text-red-400">-Rp {(15000000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 bg-slate-900/40 p-2 rounded text-white font-bold">
                  <span>Total Operasional Arus Kas:</span>
                  <span className="text-emerald-400">Rp {(lrComputed.netProfit + lrComputed.expDep - 15000000).toLocaleString('id-ID')}</span>
                </div>

                <h4 className="font-bold text-blue-400 uppercase text-[9.5px] mt-6">B. Arus Kas dari Aktivitas Investasi</h4>
                <div className="flex justify-between pl-4 text-slate-350">
                  <span>Belanja Modal Perolehan Aset Tetap Baru (CapEx)</span>
                  <span className="text-red-400">-Rp {(75000000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pl-4 bg-slate-900/40 p-2 rounded text-white font-bold">
                  <span>Total Investasi Arus Kas:</span>
                  <span className="text-red-400">-Rp {(75000000).toLocaleString('id-ID')}</span>
                </div>

                <h4 className="font-bold text-indigo-405 uppercase text-[9.5px] mt-6">C. Arus Kas dari Aktivitas Pendanaan</h4>
                <div className="flex justify-between pl-4 text-slate-350">
                  <span>Pembagian Dividen / Penarikan Prive Pemilik</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between pl-4 bg-slate-900/40 p-2 rounded text-white font-bold">
                  <span>Total Pendanaan Arus Kas:</span>
                  <span>Rp 0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. EKUITAS SHEET */}
        {activeTab === 'EKUITAS' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-ekuitas">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-xs space-y-6">
              <div className="text-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">LAPORAN PERUBAHAN EKUITAS</h3>
                <p className="text-slate-450 text-[10px]">Perubahan Modal Pemilik PT Agridea Food secara Konsolidasi</p>
              </div>

              <div className="max-w-lg mx-auto font-mono divide-y divide-slate-800 space-y-3.5">
                <div className="flex justify-between py-2 text-slate-300">
                  <span>Modal Awal Perolehan (01-Jan-2026):</span>
                  <span>Rp {dynamicBalances['3100'].toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 text-slate-300">
                  <span>Tambahan Modal Disetor (Capital Inflow):</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between py-2 text-emerald-400">
                  <span>Laba Bersih Tahun Berjalan (Jun 2026):</span>
                  <span>Rp {lrComputed.netProfit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 text-red-400">
                  <span>Prive Penarikan Pemilik (Pemberitahuan Dividen):</span>
                  <span>-Rp 0</span>
                </div>
                <div className="flex justify-between py-3 text-white font-extrabold text-sm bg-slate-900 p-3 rounded-lg">
                  <span>SALDO AKHIR EKUITAS:</span>
                  <span>Rp {(dynamicBalances['3100'] + lrComputed.netProfit).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 11. AKUN SHEET */}
        {activeTab === 'AKUN' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-akun">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">DAFTAR KODE AKUN (CHART OF ACCOUNTS COA)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300 text-left font-mono">
                  <thead>
                    <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[10px] text-slate-400">
                      <th className="p-3">KODE AKUN</th>
                      <th className="p-3">NAMA REKENING AKUN</th>
                      <th className="p-3">KATEGORI FORMAT</th>
                      <th className="p-3">SALDO NORMAL</th>
                      <th className="p-3">STATUS AKTIF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {coaAccounts.map((a) => (
                      <tr key={a.code} className="hover:bg-slate-900/40">
                        <td className="p-3 text-sky-400 font-bold">{a.code}</td>
                        <td className="p-3 text-white">{a.name}</td>
                        <td className="p-3 text-slate-300">{a.categoryIndo}</td>
                        <td className="p-3 text-amber-500 font-bold">{a.normal}</td>
                        <td className="p-3"><span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Aktif (System)</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 12. KB (KODE BANTU) */}
        {activeTab === 'KB' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-kb">
            {/* Same list content as BP sheet represented in a Master List format */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-white uppercase mb-4">MASTER TABEL KODE BANTU (AUXILIARY CODES)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300 font-mono text-left">
                  <thead>
                    <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[9.5px]">
                      <th className="p-3">KODE BANTU</th>
                      <th className="p-3">NAMA MITRA / REKANAN</th>
                      <th className="p-3">JENIS KLASIFIKASI</th>
                      <th className="p-3">LOKASI UTAMA</th>
                      <th className="p-3 text-right">SALDO INSIAL (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {kodeBantuList.map((kb) => (
                      <tr key={kb.code} className="hover:bg-slate-900/40">
                        <td className="p-3 text-yellow-400 font-bold">{kb.code}</td>
                        <td className="p-3 text-white font-bold">{kb.name}</td>
                        <td className="p-3 text-indigo-300 font-semibold">{kb.type}</td>
                        <td className="p-3 text-slate-400">{kb.location}</td>
                        <td className="p-3 text-right">Rp {kb.initialBalance.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 13. JENIS_ASET */}
        {activeTab === 'JENIS_ASET' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-jenisaset">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-white uppercase mb-4">GOLONGAN KLASIFIKASI JENIS ASET TETAP</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300 font-mono text-left">
                  <thead>
                    <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[10px]">
                      <th className="p-3">KODE GOLONGAN</th>
                      <th className="p-3">NAMA KATEGORI GOLONGAN</th>
                      <th className="p-3">UMUR MANFAAT PAJAK (TAHUN)</th>
                      <th className="p-3">METODE ESTIMASI PENYUSUTAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {jenisAsetList.map((ja) => (
                      <tr key={ja.code} className="hover:bg-slate-900/40">
                        <td className="p-3 text-violet-400 font-bold">{ja.code}</td>
                        <td className="p-3 text-white font-semibold">{ja.name}</td>
                        <td className="p-3 text-center">{ja.lifeYears} Tahun</td>
                        <td className="p-3 text-slate-400">{ja.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 14. DAFTAR_ASET */}
        {activeTab === 'DAFTAR_ASET' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-daftaraset">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-white uppercase mb-4">BUKU REGISTER &amp; DAFTAR CARA PEROLEHAN ASET</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-350 font-mono text-left">
                  <thead>
                    <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[10px] text-slate-405">
                      <th className="p-2.5">KODE ASET</th>
                      <th className="p-2.5">NAMA SPESIFIKASI DOKUMEN</th>
                      <th className="p-2.5">TANGGAL BELI</th>
                      <th className="p-2.5">QLY</th>
                      <th className="p-2.5 text-right">BIAYA PEROLEHAN</th>
                      <th className="p-2.5 text-right">AKUMULASI SUSUT</th>
                      <th className="p-2.5 text-right">NILAI BUKU BERJALAN</th>
                      <th className="p-2.5">LOKASI COGS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {daftarAset.map((da) => {
                      const netVal = da.cost - da.accDep;
                      return (
                        <tr key={da.code} className="hover:bg-slate-900/40">
                          <td className="p-2.5 text-purple-400 font-bold">{da.code}</td>
                          <td className="p-2.5 text-slate-200">{da.desc}</td>
                          <td className="p-2.5 text-slate-400">{da.buyDate}</td>
                          <td className="p-2.5 text-center">{da.qty} Unit</td>
                          <td className="p-2.5 text-right text-white">Rp {da.cost.toLocaleString('id-ID')}</td>
                          <td className="p-2.5 text-right text-orange-400">-Rp {da.accDep.toLocaleString('id-ID')}</td>
                          <td className="p-2.5 text-right text-emerald-400 font-bold">Rp {netVal.toLocaleString('id-ID')}</td>
                          <td className="p-2.5 text-center"><span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300">{da.location}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 15. RETAINED EARNINGS TRACKING */}
        {activeTab === 'RETAINED' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-retained">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-xs space-y-6">
              <div className="text-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">AKUN LABA DITAHAN (RETAINED EARNINGS LOGIC)</h3>
                <p className="text-slate-450 text-[10px]">Penyisihan Laba Neto Bersih ke modal berjalan korporat PT Agridea</p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between items-center text-slate-350 p-2 border-b border-slate-800">
                  <span>Laba Ditahan Awal Tahun (Historis)</span>
                  <span className="font-bold text-white">Rp {dynamicBalances['3200'].toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 p-2 border-b border-slate-800">
                  <span>Kontribusi Laba Bersih Q2 (Sistem LR)</span>
                  <span className="font-bold">+Rp {lrComputed.netProfit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-350 p-2 border-b border-slate-800">
                  <span>Alokasi Dividen Direktur</span>
                  <span>-Rp 0</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 text-white font-extrabold p-3 rounded-xl">
                  <span>Total Laba Ditahan Akhir Juni:</span>
                  <span className="text-emerald-400">Rp {(dynamicBalances['3200'] + lrComputed.netProfit).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 16. LRV (ANALISA VERTIKAL LABA RUGI) */}
        {activeTab === 'LRV' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-lrv">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">ANALISA VERTIKAL LABA RUGI (% DARI TOTAL REVENUE)</h3>
                <p className="text-[11px] text-slate-400">Penting untuk menakar efisiensi operasional and margin profit.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-505 block font-bold">Total Revenue % Base</span>
                  <span className="text-2xl font-black text-white">100.0%</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-505 block font-bold">HPP COGS % Margin</span>
                  <span className="text-2xl font-black text-orange-400">{((lrComputed.totalCogs / (lrComputed.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-505 block font-bold">Operational Expense % Ratio</span>
                  <span className="text-2xl font-black text-red-400">{((lrComputed.totalOperatingExpenses / (lrComputed.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-505 block font-bold">Net Profit Margin % Rate</span>
                  <span className="text-2xl font-black text-emerald-400">{((lrComputed.netProfit / (lrComputed.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 17. REKAP LABA RUGI */}
        {activeTab === 'REKAP_LR' && (
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase">REKAP LABA RUGI TAHUNAN &amp; PROGRESS LAPORAN</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300 font-mono text-left">
                <thead>
                  <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[10px]">
                    <th className="p-3">Mata Anggaran</th>
                    <th className="p-3 text-right">Rekap Q2-2024</th>
                    <th className="p-3 text-right">Rekap Q2-2025</th>
                    <th className="p-3 text-right text-emerald-400">Juni-2026 (Aktual)</th>
                    <th className="p-3 text-right">Varians Pertumbuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 text-white font-bold">Total Pendapatan Bersih</td>
                    <td className="p-3 text-right">Rp 3.120.000.000</td>
                    <td className="p-3 text-right">Rp 4.050.000.000</td>
                    <td className="p-3 text-right text-emerald-400">Rp {lrComputed.totalRevenue.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right text-emerald-450 font-bold">+21.4%</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white">Beban Pokok COGS</td>
                    <td className="p-3 text-right">Rp 1.450.000.000</td>
                    <td className="p-3 text-right">Rp 2.100.000.000</td>
                    <td className="p-3 text-right text-orange-400">Rp {lrComputed.totalCogs.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right text-slate-400">-12.5%</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white font-bold text-emerald-450">Laba Operasional Bersih</td>
                    <td className="p-3 text-right">Rp 980.000.000</td>
                    <td className="p-3 text-right">Rp 1.150.000.000</td>
                    <td className="p-3 text-right text-emerald-400 font-extrabold">Rp {lrComputed.netProfit.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right text-emerald-450 font-bold">+44.2% Growth</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 18. REKAP NERACA */}
        {activeTab === 'REKAP_NRC' && (
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase">REKAP NERACA TAHUNAN &amp; LIABILITAS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300 font-mono text-left">
                <thead>
                  <tr className="bg-[#1e1e1e] border-b border-slate-800 text-[10px]">
                    <th className="p-3">Posisi Finansial</th>
                    <th className="p-3 text-right">Q2-2024 (IDR)</th>
                    <th className="p-3 text-right">Q2-2025 (IDR)</th>
                    <th className="p-3 text-right text-emerald-450 font-bold">Juni-2026 (Aktual)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 text-white font-bold">Jumlah Aset Lancar</td>
                    <td className="p-3 text-right">Rp 1.840.000.000</td>
                    <td className="p-3 text-right">Rp 2.150.000.000</td>
                    <td className="p-3 text-right text-white">Rp {(dynamicBalances['1100'] + dynamicBalances['1110'] + dynamicBalances['1120']).toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white font-bold">Jumlah Kewajiban Hidup/Hutang</td>
                    <td className="p-3 text-right">Rp 310.000.000</td>
                    <td className="p-3 text-right">Rp 450.000.000</td>
                    <td className="p-3 text-right text-white">Rp {(dynamicBalances['2100'] + dynamicBalances['2120']).toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 19. KOMPARATIF LABA RUGI */}
        {activeTab === 'KOMPARATIF_LR' && (
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase">ANALISA KOMPARATIF LABA JUNI 2025 VS 2026</h3>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-xl mx-auto space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-400">Total Pendapatan Juni 2025:</span>
                <span className="font-mono text-white">Rp 3.840.000.000</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-405 text-emerald-400">Total Pendapatan Juni 2026:</span>
                <span className="font-mono text-emerald-400 font-extrabold">Rp {lrComputed.totalRevenue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-400">Kombinasi Variansi Nominal:</span>
                <span className="font-mono text-white">Rp {(lrComputed.totalRevenue - 3840000000).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-emerald-400 bg-slate-950 p-2.5 rounded">
                <span>Rasio Pertumbuhan (Growth %):</span>
                <span>+{(((lrComputed.totalRevenue - 3840000000) / 3840000000) * 100).toFixed(2)}% Growth</span>
              </div>
            </div>
          </div>
        )}

        {/* 20. BUDGETING TAB */}
        {activeTab === 'BUDGETING' && (
          <div className="space-y-6 animate-fade-in text-slate-950" id="exact-sheet-budgeting">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase">SISTEM ANGGARAN &amp; REALISASI MULTI-PABRIK (BUDGET vs ACTUAL)</h3>
                  <p className="text-xs text-slate-400">Penyusunan anggaran bulanan, target HPP, biaya karyawan, utilitas, dan evaluasi deviasi (variance) lintas pabrik.</p>
                </div>
                <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-xl font-bold shrink-0">
                  Sinkronisasi Otomatis
                </div>
              </div>
              
              {/* Nested Budget Dashboard */}
              <div className="bg-slate-50 border border-slate-850 p-2 rounded-xl">
                <BudgetActualDashboard
                  state={state}
                  currentUser={currentUser}
                  onLogActivity={() => {}}
                />
              </div>
            </div>
          </div>
        )}

        {/* 21. WORKING_CAPITAL TAB */}
        {activeTab === 'WORKING_CAPITAL' && (
          <div className="space-y-6 animate-fade-in" id="exact-sheet-working-capital">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-850 pb-4">
                <div>
                  <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-400" />
                    WORKING CAPITAL &amp; FINANCIAL KPI ANALYSIS
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pemantauan likuiditas jangka pendek, rasio modal kerja, siklus konversi kas (Cash Conversion Cycle), serta penuaan piutang-hutang (aging).
                  </p>
                </div>
                <span className="bg-orange-950/40 text-orange-400 border border-orange-850 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
                  Target: &lt; 40 Hari Siklus
                </span>
              </div>

              {/* Top Row: Likuiditas & Modal Kerja KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-widest block">Rasio Lancar (Current Ratio)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white">3.24x</span>
                    <span className="text-[10px] text-emerald-400 font-black">Sangat Aman</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Standar Industri: 1.5x - 2.0x</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-widest block">Quick Ratio (Rasio Cepat)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white">2.15x</span>
                    <span className="text-[10px] text-emerald-400 font-black">Likuid</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Kapasitas pemenuhan hutang segera</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-widest block">Modal Kerja Bersih (NWC)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-emerald-450 text-emerald-400">
                      Rp {((dynamicBalances['1100'] + dynamicBalances['1110'] + dynamicBalances['1120'] + 1065000000) - (350500000 + 400000000)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Total Aset Lancar - Total Kewajiban Lancar</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-widest block">Target Cash Conversion Cycle</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-orange-400">34 Hari</span>
                    <span className="text-[10px] text-orange-400 font-bold">Optimis</span>
                  </div>
                  <p className="text-[10px] text-slate-550 mt-1">Siklus piutang ke kas berjalan lancar</p>
                </div>
              </div>

              {/* Cash Conversion Cycle Days breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Cycles diagram */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-white uppercase mb-4 tracking-wider">SIKLUS KAS (WORKING CAPITAL DAYS)</h4>
                  
                  <div className="space-y-4 my-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 font-sans"></span>
                        <span className="text-xs text-slate-350">Days Inventory Outstanding (DIO)</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">42 Hari</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[42%]" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs text-slate-350">Days Sales Outstanding (DSO)</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">25 Hari</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[25%]" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="text-xs text-slate-300">Days Payable Outstanding (DPO)</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">33 Hari</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-400 h-full w-[33%]" />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-450 font-bold">CASH CONVERSION CYCLE:</span>
                      <span className="font-mono text-xs font-bold text-orange-400">34 Hari (DIO + DSO - DPO)</span>
                    </div>
                  </div>
                </div>

                {/* AR Aging */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold text-white uppercase mb-4 tracking-wider flex justify-between items-center">
                    <span>AGING PIUTANG (ACCOUNTS RECEIVABLE AGING)</span>
                    <span className="text-[9.5px] text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Total: Rp 642.000.000</span>
                  </h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={arAgingStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                        <XAxis dataKey="bucket" stroke="#aaa" fontSize={9} />
                        <YAxis stroke="#aaa" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                        <Bar dataKey="value" name="Outstanding Rp" fill="#3b82f6">
                          {arAgingStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                    {arAgingStats.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-1 rounded">
                        <span className="text-[8.5px] text-slate-500 font-bold block">{item.bucket}</span>
                        <span className="text-[9.5px] font-mono font-bold text-white">{(item.value / 1000000).toFixed(0)}Jt</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AP Aging */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold text-white uppercase mb-4 tracking-wider flex justify-between items-center">
                    <span>AGING UTANG (ACCOUNTS PAYABLE AGING)</span>
                    <span className="text-[9.5px] text-orange-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">Total: Rp 412.000.000</span>
                  </h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={apAgingStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                        <XAxis dataKey="bucket" stroke="#aaa" fontSize={9} />
                        <YAxis stroke="#aaa" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                        <Bar dataKey="value" name="Hutang Rp" fill="#f59e0b">
                          {apAgingStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                    {apAgingStats.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-1 rounded">
                        <span className="text-[8.5px] text-slate-500 font-bold block">{item.bucket}</span>
                        <span className="text-[9.5px] font-mono font-bold text-white">{(item.value / 1000000).toFixed(0)}Jt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Detailed Debtor Status Grid */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-850">
                <h4 className="text-xs font-bold text-white uppercase mb-4 font-sans">DAFTAR KLIEN &amp; TINGKAT RESIKO KOLEKTIBILITAS PIUTANG</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-[10px] text-slate-400">
                        <th className="p-2.5">KLIEN DISTRIBUTOR</th>
                        <th className="p-2.5">LOKASI SUPPLY</th>
                        <th className="p-2.5 text-right">TOTAL PIUTANG (Rp)</th>
                        <th className="p-2.5 text-center">OVERDUE DAYS</th>
                        <th className="p-2.5 text-center">KOLEKTIBILITAS STATUS</th>
                        <th className="p-2.5 text-right">CREDIT LIMIT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      <tr className="hover:bg-slate-950/40">
                        <td className="p-2.5 font-bold text-white">Indogrosir Group Cikampek</td>
                        <td className="p-2.5 text-slate-400">Wonosobo (MPD)</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">Rp 245.000.000</td>
                        <td className="p-2.5 text-center text-emerald-400 font-bold">0 Hari</td>
                        <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold">LANCAR (COL-1)</span></td>
                        <td className="p-2.5 text-right text-slate-400">Rp 500.000.000</td>
                      </tr>
                      <tr className="hover:bg-slate-950/40">
                        <td className="p-2.5 font-bold text-white">Transmart Retail Nasional</td>
                        <td className="p-2.5 text-slate-400">Sipahutar (SSP)</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">Rp 189.000.000</td>
                        <td className="p-2.5 text-center text-amber-500 font-bold">12 Hari</td>
                        <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold">LANCAR (COL-1)</span></td>
                        <td className="p-2.5 text-right text-slate-400">Rp 300.000.000</td>
                      </tr>
                      <tr className="hover:bg-slate-950/40">
                        <td className="p-2.5 font-bold text-white">Brimart Super Swalayan</td>
                        <td className="p-2.5 text-slate-400">Jakarta (KKI)</td>
                        <td className="p-2.5 text-right font-bold text-amber-500">Rp 112.500.000</td>
                        <td className="p-2.5 text-center text-amber-500 font-bold">45 Hari</td>
                        <td className="p-2.5 text-center"><span className="bg-amber-950 border border-amber-900 text-amber-500 text-[9px] px-2 py-0.5 rounded-full font-bold">PERHATIAN (COL-2)</span></td>
                        <td className="p-2.5 text-right text-slate-400">Rp 200.000.000</td>
                      </tr>
                      <tr className="hover:bg-slate-950/40">
                        <td className="p-2.5 font-bold text-white">Export Star Corp (SGP)</td>
                        <td className="p-2.5 text-slate-400">Packaging (AGDN)</td>
                        <td className="p-2.5 text-right font-bold text-rose-500">Rp 65.500.000</td>
                        <td className="p-2.5 text-center text-rose-500 font-bold">95 Hari</td>
                        <td className="p-2.5 text-center"><span className="bg-rose-950 border border-rose-900 text-rose-450 text-rose-450 text-rose-400 text-[9px] px-2 py-0.5 rounded-full font-bold">DIRAGUKAN (COL-4)</span></td>
                        <td className="p-2.5 text-right text-slate-400">Rp 100.000.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRATED EXECUTIVE CONTROLS / AI PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-bounce" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">AI CFO FINANCIAL ADVISOR PANEL</h3>
            </div>
            
            <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl h-60 overflow-y-auto space-y-3.5 no-scrollbar">
              {aiChatHistory.map((ch, chIdx) => (
                <div key={chIdx} className={`p-3 rounded-xl max-w-[85%] text-xs line-clamp-none ${
                  ch.sender === 'ai'
                    ? 'bg-slate-950 text-slate-200 mr-auto border-l-2 border-emerald-500'
                    : 'bg-emerald-950/60 text-white ml-auto border-r-2 border-emerald-400'
                }`}>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">
                    {ch.sender === 'ai' ? 'AI Advisor' : 'Richard (Director)'}
                  </span>
                  {ch.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiQuestionSubmit()}
                placeholder="Tanyakan risiko likuiditas, alokasi anggaran, atau pabrik paling profitable..."
                className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500 w-full"
              />
              <button
                onClick={() => handleAiQuestionSubmit()}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick preset actions */}
          <div className="space-y-3">
            <h4 className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">PRES-SET CFO QUERIES:</h4>
            <button
              onClick={() => handleAiQuestionSubmit('Pabrik mana yang paling profitable bulan berjalan?')}
              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-300 flex items-center justify-between"
            >
              <span>Which factory is most profitable?</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => handleAiQuestionSubmit('Berapa nili persediaan tertinggi dan di lokasi mana?')}
              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-300 flex items-center justify-between"
            >
              <span>Which factory has highest inventory?</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => handleAiQuestionSubmit('Berapa hari runway ketahanan cash kas saat ini?')}
              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-300 flex items-center justify-between"
            >
              <span>What is current cash runway?</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
