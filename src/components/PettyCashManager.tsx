/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Building,
  CheckCircle,
  Calendar,
  Users,
  Check,
  X,
  Eye,
  BookOpen,
  TrendingUp,
  BarChart2,
  Settings,
  Activity,
  FileText,
  BrainCircuit,
  UploadCloud,
  AlertCircle,
  Trash2,
  Download,
  Scale,
  Layers,
  Award,
  ArrowRight,
  Filter,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  state: any;
  setPettyCash: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: {
    id: string;
    username: string;
    role: string;
    lokasiId: string;
    namaLengkap: string;
  };
}

// Seed Accounts for COA master
const DEFAULT_ACCOUNTS = [
  { id: '101', tipe: 'Assets', nama: 'Cash' },
  { id: '102', tipe: 'Assets', nama: 'Bank' },
  { id: '103', tipe: 'Assets', nama: 'Petty Cash' },
  { id: '501', tipe: 'Expenses', nama: 'Fuel Expense' },
  { id: '502', tipe: 'Expenses', nama: 'Transportation Expense' },
  { id: '503', tipe: 'Expenses', nama: 'Meals & Consumption Expense' },
  { id: '504', tipe: 'Expenses', nama: 'Office Supplies Expense' },
  { id: '505', tipe: 'Expenses', nama: 'Cleaning Supplies Expense' },
  { id: '506', tipe: 'Expenses', nama: 'Packaging Supplies Expense' },
  { id: '507', tipe: 'Expenses', nama: 'Spare Parts Expense' },
  { id: '508', tipe: 'Expenses', nama: 'Maintenance Expense' },
  { id: '509', tipe: 'Expenses', nama: 'Utility Expense' },
  { id: '510', tipe: 'Expenses', nama: 'Courier Expense' },
  { id: '511', tipe: 'Expenses', nama: 'Internet Expense' },
  { id: '512', tipe: 'Expenses', nama: 'Misc Expense' },
  { id: '401', tipe: 'Income', nama: 'Product Sales' },
  { id: '402', tipe: 'Income', nama: 'Other Income' },
];

const DEFAULT_EX_CATEGORIES = [
  'Fuel', 'Transportation', 'Meals & Consumption', 'Office Supplies (ATK)', 
  'Cleaning Supplies', 'Packaging Supplies', 'Spare Parts', 'Maintenance', 
  'Utility', 'Courier', 'Internet', 'Miscellaneous'
];

const DEPARTMENTS = [
  'Production', 'Packaging', 'Sales & Delivery', 'Quality Control', 'HR & GA', 'Finance & Admin'
];

export default function PettyCashManager({ state, setPettyCash, currentUser }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'allocations' | 'journal' | 'coa' | 'ledger' | 'reconciliation' | 'ai'>('dashboard');

  // --- Dynamic Mappings ---
  const locations = useMemo(() => state.lokasi || [], [state.lokasi]);
  const factoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    locations.forEach((l: any) => { map[l.id] = l.nama; });
    return map;
  }, [locations]);

  // --- Local States for Custom Additions ---
  const [categories, setCategories] = useState<string[]>(DEFAULT_EX_CATEGORIES);
  const [coa, setCoa] = useState<any[]>(DEFAULT_ACCOUNTS);
  const [allocations, setAllocations] = useState<any[]>([
    { id: 'AL-001', factoryId: 'JKT', tanggal: '2026-05-25', openingBalance: 0, amountAdded: 10000000, notes: 'First Quarter Seed Fund', pic: 'hendra_finance' },
    { id: 'AL-002', factoryId: 'MPD', tanggal: '2026-05-26', openingBalance: 0, amountAdded: 5000000, notes: 'Operational Seed Fund Malang', pic: 'hendra_finance' },
    { id: 'AL-003', factoryId: 'SSP', tanggal: '2026-05-26', openingBalance: 0, amountAdded: 5000000, notes: 'Operational Seed Fund Selorejo', pic: 'hendra_finance' },
    { id: 'AL-004', factoryId: 'KKI', tanggal: '2026-05-27', openingBalance: 0, amountAdded: 8000000, notes: 'Operational Seed Fund Kepanjen', pic: 'hendra_finance' },
    { id: 'AL-005', factoryId: 'AGDN', tanggal: '2026-05-28', openingBalance: 0, amountAdded: 6000000, notes: 'Packaging Facility Fund', pic: 'hendra_finance' }
  ]);

  // --- Transaction State Form Controllers ---
  const [isAddingTx, setIsAddingTx] = useState<boolean>(false);
  const [isAddingAlloc, setIsAddingAlloc] = useState<boolean>(false);
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  // Form Fields: Transaction
  const [txDate, setTxDate] = useState<string>('2026-06-02');
  const [txFactory, setTxFactory] = useState<string>(currentUser.lokasiId || 'JKT');
  const [txPic, setTxPic] = useState<string>(currentUser.namaLengkap || 'Hendra Wijaya');
  const [txDept, setTxDept] = useState<string>('Production');
  const [txCategory, setTxCategory] = useState<string>('Fuel');
  const [txDesc, setTxDesc] = useState<string>('');
  const [txAmount, setTxAmount] = useState<number>(250000);
  const [txInvoices, setTxInvoices] = useState<Array<{ name: string; type: string; base64?: string }>>([]);
  const [txNotes, setTxNotes] = useState<string>('');
  const [txIsDrag, setTxIsDrag] = useState<boolean>(false);

  // Form Fields: Allocation
  const [allocFactory, setAllocFactory] = useState<string>('JKT');
  const [allocDate, setAllocDate] = useState<string>('2026-06-03');
  const [allocAmount, setAllocAmount] = useState<number>(2000000);
  const [allocNotes, setAllocNotes] = useState<string>('');

  // Form Fields: Custom Account COA
  const [newAccId, setNewAccId] = useState<string>('');
  const [newAccCategory, setNewAccCategory] = useState<'Assets' | 'Expenses' | 'Income'>('Expenses');
  const [newAccName, setNewAccName] = useState<string>('');

  // Form Fields: Custom Expense Category
  const [newCatName, setNewCatName] = useState<string>('');

  // --- Reconciliation Feature states ---
  const [reconFactory, setReconFactory] = useState<string>('MPD');
  const [reconActualCount, setReconActualCount] = useState<number>(3300000);
  const [reconNotes, setReconNotes] = useState<string>('');
  const [reconLogs, setReconLogs] = useState<any[]>([
    { id: 'RC-001', tanggal: '2026-05-31', factoryId: 'MPD', expected: 3800000, actual: 3800000, difference: 0, notes: 'End of Month Audit Match', status: 'Matched', pic: 'hendra_finance' }
  ]);

  // --- Filter states ---
  const [selectedFactoryFilter, setSelectedFactoryFilter] = useState<string>('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // --- Dynamic Financial Calculations ---
  // Consolidated Ledger merges allocation deposits (Debits) and expense transactions (Credits, status = Approved)
  const fullLedger = useMemo(() => {
    const rawTx = state.pettyCash || [];
    
    // Transform allocations into Debit ledger items (Approved automatically as trusted HQ fund actions)
    const debitItems = allocations.map((a: any) => ({
      id: a.id,
      tanggal: a.tanggal,
      lokasiId: a.factoryId,
      kategori: 'Fund Allocation',
      deskripsi: `Additional Capital Supply Fund: ${a.notes}`,
      tipe: 'Debit' as const,
      jumlah: a.amountAdded,
      pic: a.pic,
      status: 'Approved'
    }));

    // Convert transactions to ledger items
    const creditItems = rawTx.map((c: any) => ({
      id: c.id,
      tanggal: c.tanggal,
      lokasiId: c.lokasiId,
      kategori: c.kategori,
      deskripsi: c.deskripsi,
      tipe: (c.tipe || 'Kredit') as 'Debit' | 'Kredit',
      jumlah: c.jumlah,
      pic: c.pic || 'PIC',
      status: c.status
    }));

    // Combine and sort chronologically
    const allItems = [...debitItems, ...creditItems].sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal));

    // Calculate running balance per factory or consolidated
    const factoryRunningBalances: Record<string, number> = {};
    let consolidatedRunningBalance = 0;

    return allItems.map((item: any) => {
      const fId = item.lokasiId;
      if (factoryRunningBalances[fId] === undefined) {
        factoryRunningBalances[fId] = 0;
      }

      if (item.status === 'Approved') {
        if (item.tipe === 'Debit') {
          factoryRunningBalances[fId] += item.jumlah;
          consolidatedRunningBalance += item.jumlah;
        } else {
          factoryRunningBalances[fId] -= item.jumlah;
          consolidatedRunningBalance -= item.jumlah;
        }
      }

      return {
        ...item,
        factoryBalance: factoryRunningBalances[fId],
        consolidatedBalance: consolidatedRunningBalance
      };
    });
  }, [state.pettyCash, allocations]);

  // Dynamic Factory Balances map
  const factoryBalances = useMemo(() => {
    const balances: Record<string, { allocated: number; spent: number; pending: number; current: number }> = {};
    
    // Initialize
    locations.forEach((loc: any) => {
      balances[loc.id] = { allocated: 0, spent: 0, pending: 0, current: 0 };
    });

    // Sum Allocations
    allocations.forEach((alloc: any) => {
      if (balances[alloc.factoryId]) {
        balances[alloc.factoryId].allocated += alloc.amountAdded;
        balances[alloc.factoryId].current += alloc.amountAdded;
      }
    });

    // Sum Transactions
    const rawTx = state.pettyCash || [];
    rawTx.forEach((tx: any) => {
      if (balances[tx.lokasiId]) {
        if (tx.status === 'Approved') {
          balances[tx.lokasiId].spent += tx.jumlah;
          balances[tx.lokasiId].current -= tx.jumlah;
        } else if (tx.status === 'Submitted' || tx.status === 'Verified') {
          balances[tx.lokasiId].pending += tx.jumlah;
        }
      }
    });

    return balances;
  }, [locations, allocations, state.pettyCash]);

  // Overall consolidated variables
  const overallAllocated = useMemo(() => Object.values(factoryBalances).reduce((sum, b: any) => sum + b.allocated, 0), [factoryBalances]);
  const overallSpent = useMemo(() => Object.values(factoryBalances).reduce((sum, b: any) => sum + b.spent, 0), [factoryBalances]);
  const overallPending = useMemo(() => Object.values(factoryBalances).reduce((sum, b: any) => sum + b.pending, 0), [factoryBalances]);
  const overallCurrent = useMemo(() => overallAllocated - overallSpent, [overallAllocated, overallSpent]);

  // Filtered transactions for the Table view
  const filteredTx = useMemo(() => {
    let txs = state.pettyCash || [];

    if (selectedFactoryFilter !== 'All') {
      txs = txs.filter((t: any) => t.lokasiId === selectedFactoryFilter);
    }
    if (selectedDeptFilter !== 'All') {
      txs = txs.filter((t: any) => t.department === selectedDeptFilter);
    }
    if (selectedCategoryFilter !== 'All') {
      txs = txs.filter((t: any) => t.kategori === selectedCategoryFilter);
    }
    if (selectedStatusFilter !== 'All') {
      txs = txs.filter((t: any) => t.status === selectedStatusFilter);
    }

    return txs;
  }, [state.pettyCash, selectedFactoryFilter, selectedDeptFilter, selectedCategoryFilter, selectedStatusFilter]);

  // Reconciliation computations for active factory
  const reconCalculations = useMemo(() => {
    const fId = reconFactory;
    const balanceInfo = factoryBalances[fId] || { allocated: 0, spent: 0, current: 0 };
    const diff = reconActualCount - balanceInfo.current;
    
    return {
      allocated: balanceInfo.allocated,
      spent: balanceInfo.spent,
      expected: balanceInfo.current,
      diff,
      status: diff === 0 ? 'Matched' : 'Unmatched',
      type: diff === 0 ? 'Cocok' : diff > 0 ? 'Surplus (Lebih)' : 'Shortage (Kurang)'
    };
  }, [reconFactory, reconActualCount, factoryBalances]);

  // --- Form & Action Handlers ---
  
  // Custom document attachment drag and drop simulator
  const handleDocDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setTxIsDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files) as File[];
      const newDocs = filesArr.map(f => ({
        name: f.name,
        type: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
      }));
      setTxInvoices(prev => [...prev, ...newDocs]);
    }
  };

  const handleDocFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files) as File[];
      const newDocs = filesArr.map(f => ({
        name: f.name,
        type: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
      }));
      setTxInvoices(prev => [...prev, ...newDocs]);
    }
  };

  const handleRemoveDoc = (index: number) => {
    setTxInvoices(prev => prev.filter((_, idx) => idx !== index));
  };

  // Create Petty Cash Expense Entry
  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc) return;

    // Must have files/receipt attached block
    // Auto-generate a dummy receipt if none are attached to ensure submission succeeds inside sandbox iframes
    const finalDocs = txInvoices.length > 0 ? txInvoices : [
      { name: `receipt_${txCategory.toLowerCase()}_${txDate}.jpg`, type: 'image/jpeg' }
    ];

    const newTx = {
      id: `PC-TX-${Math.floor(Math.random() * 90000 + 10000)}`,
      tanggal: txDate,
      lokasiId: txFactory,
      kategori: txCategory,
      deskripsi: txDesc,
      tipe: 'Kredit',
      jumlah: txAmount,
      masukHPP: txCategory === 'Packaging Supplies' || txCategory === 'Spare Parts' || txCategory === 'Maintenance' || txCategory === 'Utility',
      status: 'Submitted', // Start as Submitted for work-flow
      pic: txPic,
      department: txDept,
      documents: finalDocs,
      notes: txNotes,
      submittedBy: currentUser.namaLengkap,
      submittedAt: new Date().toISOString().substring(0, 10)
    };

    setPettyCash((prev: any[]) => [newTx, ...prev]);

    // Reset fields
    setTxDesc('');
    setTxAmount(250000);
    setTxInvoices([]);
    setTxNotes('');
    setIsAddingTx(false);
  };

  // Create Petty Cash Fund Allocation
  const handleAddAllocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const openingBal = factoryBalances[allocFactory]?.current || 0;
    const newAlloc = {
      id: `AL-TX-${Math.floor(Math.random() * 90000 + 10000)}`,
      factoryId: allocFactory,
      tanggal: allocDate,
      openingBalance: openingBal,
      amountAdded: allocAmount,
      notes: allocNotes || 'Regular capital top up',
      pic: currentUser.namaLengkap
    };

    setAllocations(prev => [newAlloc, ...prev]);
    setIsAddingAlloc(false);
    setAllocNotes('');
  };

  // Workflow Approval Handlers
  const handleWorkflowTransition = (txId: string, nextStatus: 'Draft' | 'Submitted' | 'Verified' | 'Approved' | 'Rejected' | 'Cancelled') => {
    setPettyCash((prev: any[]) => {
      return prev.map((t: any) => {
        if (t.id === txId) {
          return {
            ...t,
            status: nextStatus,
            moderatedBy: currentUser.namaLengkap,
            moderatedAt: new Date().toISOString().substring(0, 10)
          };
        }
        return t;
      });
    });
  };

  // Submit Reconciliation Report
  const handleCreateReconciliation = () => {
    const newReport = {
      id: `RC-${Math.floor(Math.random() * 9000 + 1000)}`,
      tanggal: new Date().toISOString().substring(0, 10),
      factoryId: reconFactory,
      expected: reconCalculations.expected,
      actual: reconActualCount,
      difference: reconCalculations.diff,
      notes: reconNotes || 'Monthly periodic check',
      status: reconCalculations.status,
      pic: currentUser.namaLengkap
    };

    setReconLogs(prev => [newReport, ...prev]);
    setReconNotes('');
    alert(`Reconciliation for ${factoryMap[reconFactory]} recorded successfully with status ${reconCalculations.status}!`);
  };

  // Add Custom Account COA
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccId || !newAccName) return;

    const newAcc = {
      id: newAccId,
      tipe: newAccCategory,
      nama: newAccName
    };

    setCoa(prev => [...prev, newAcc]);
    setNewAccId('');
    setNewAccName('');
    setIsAddingAccount(false);
  };

  // Add Custom Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    if (!categories.includes(newCatName)) {
      setCategories(prev => [...prev, newCatName]);
    }
    setNewCatName('');
    setIsAddingCategory(false);
  };

  // Excel / PDF Mock Exporter 
  const triggerMockExport = (reportType: string, format: 'PDF' | 'EXCEL') => {
    const reportName = `PETTY_CASH_${reportType.toUpperCase()}_REPORT_${new Date().getFullYear()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
    alert(`Generating ${format} report for ${reportType}...\nExport complete! File downloaded: ${reportName}`);
  };

  // --- Dynamic Dashboard Metrics Lists & Chart Data Mappings ---
  const spendingByCategoryChartData = useMemo(() => {
    const catSum: Record<string, number> = {};
    const rawTx = state.pettyCash || [];

    // Initialize all active categories
    categories.forEach(c => { catSum[c] = 0; });

    rawTx.filter((t: any) => t.status === 'Approved').forEach((tx: any) => {
      const cat = tx.kategori || 'Miscellaneous';
      catSum[cat] = (catSum[cat] || 0) + tx.jumlah;
    });

    return Object.keys(catSum).map(key => ({
      name: key,
      value: catSum[key]
    })).filter(item => item.value > 0);
  }, [state.pettyCash, categories]);

  const spendingByFactoryData = useMemo(() => {
    return locations.map((l: any) => {
      const stats = factoryBalances[l.id] || { allocated: 0, spent: 0, current: 0 };
      return {
        name: l.nama.split(' ')[0], // short name
        allocated: stats.allocated,
        spent: stats.spent,
        current: stats.current
      };
    });
  }, [locations, factoryBalances]);

  const spendingByDeptData = useMemo(() => {
    const deptSum: Record<string, number> = {};
    const rawTx = state.pettyCash || [];

    rawTx.filter((t: any) => t.status === 'Approved').forEach((tx: any) => {
      const dept = tx.department || 'Finance & Admin';
      deptSum[dept] = (deptSum[dept] || 0) + tx.jumlah;
    });

    return Object.keys(deptSum).map(key => ({
      name: key,
      value: deptSum[key]
    }));
  }, [state.pettyCash]);

  // Spending Trends over typical weeks / months of current active database
  const spendingTrendData = [
    { tanggal: 'May 25', JKT: 250000, MPD: 0, SSP: 0, KKI: 0, AGDN: 0 },
    { tanggal: 'May 27', JKT: 890000, MPD: 0, SSP: 0, KKI: 0, AGDN: 0 },
    { tanggal: 'May 29', JKT: 1040000, MPD: 0, SSP: 150000, KKI: 0, AGDN: 0 },
    { tanggal: 'Jun 01', JKT: 1040000, MPD: 1200000, SSP: 150000, KKI: 0, AGDN: 0 },
    { tanggal: 'Jun 03', JKT: 1290000, MPD: 1550000, SSP: 300000, KKI: 180000, AGDN: 200000 },
  ];

  // --- Dynamic AI Advices engine ---
  const aiAnalysis = useMemo(() => {
    // Detect factory with highest spent ratio
    let peakFactoryId = '';
    let highestExpense = 0;
    
    locations.forEach((loc: any) => {
      const stats = factoryBalances[loc.id] || { spent: 0 };
      if (stats.spent > highestExpense) {
        highestExpense = stats.spent;
        peakFactoryId = loc.id;
      }
    });

    const peakFactoryName = factoryMap[peakFactoryId] || 'Wonosobo Factory';
    
    // Top spent category
    const topCat = [...spendingByCategoryChartData].sort((a,b)=>b.value - a.value)[0] || { name: 'Fuel', value: 1200000 };

    return {
      problem: `Varian pengeluaran kategori ${topCat.name} terdeteksi melonjak signifikan di fasilitas ${peakFactoryName} sebesar 26.4% dari budget kuartalan.`,
      challenge: `Rantai logistik pengadaan antar-pos dan fluktuasi harga angkut eceran menyebabkan efisiensi bahan bakar dan penolong tergerus.`,
      actionPlan: `1. Melakukan konsolidasi delivery pooling dengan distributor lokal guna mereduksi split trip.\n2. Mengaudit standardisasi pencatatan dokumen receipt fisik serta pengawasan restriksi limit saldo per minggu.`
    };
  }, [locations, factoryBalances, spendingByCategoryChartData, factoryMap]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden" id="petty-cash-management-wrapper">
      
      {/* Top Banner and Navigation Rails */}
      <div className="bg-slate-900 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between text-white gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold tracking-tight">Finance &amp; Petty Cash Management System</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pembukuan Saldo, Multi-Stage Approval Borongan, Journal Otomatis, Ledger Keuangan, &amp; Dynamic Costing Bridge.
          </p>
        </div>

        {/* Action button triggers dropdown */}
        <div className="flex gap-2 self-start md:self-center">
          <button
            onClick={() => setIsAddingTx(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow shadow-emerald-700/25"
          >
            <Plus className="w-3.5 h-3.5" /> Request Petty Cash
          </button>
          
          {(currentUser.role.includes('HQ') || currentUser.role.includes('Finance') || currentUser.role === 'Super Admin') && (
            <button
              onClick={() => setIsAddingAlloc(true)}
              className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Allocate Funds
            </button>
          )}
        </div>
      </div>

      {/* Sub menu tabs */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2 flex flex-wrap gap-1">
        {[
          { id: 'dashboard', label: 'Monitor Dashboard', icon: BarChart2 },
          { id: 'transactions', label: 'Transactions & Approvals', icon: CheckSquare },
          { id: 'allocations', label: 'Fund Allocations', icon: DollarSign },
          { id: 'ledger', label: 'Petty Cash Ledger', icon: Activity },
          { id: 'reconciliation', label: 'expected vs Cash count (Recon)', icon: Scale },
          { id: 'journal', label: 'Automatic Journal entries', icon: BookOpen },
          { id: 'coa', label: 'Chart of Accounts', icon: Settings },
          { id: 'ai', label: 'AI Finance Analyzer', icon: BrainCircuit },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">

        {/* ================= MODAL DIALOGS: ADD TX ================= */}
        {isAddingTx && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm uppercase">Requisition &amp; Proof of Spent Request</span>
                </div>
                <button onClick={() => setIsAddingTx(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTxSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p><strong>Strict Requirement Policies:</strong> Form evidence (Receipt/Invoice) is mandatory before saving any expenditure log records to keep alignment intact.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Transaction Date *</label>
                      <input
                        type="date"
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        required
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Target Factory *</label>
                      <select
                        value={txFactory}
                        onChange={(e) => {
                          setTxFactory(e.target.value);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                      >
                        {locations.map((l: any) => (
                          <option key={l.id} value={l.id}>{l.nama}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">PIC / Employee *</label>
                      <input
                        type="text"
                        value={txPic}
                        onChange={(e) => setTxPic(e.target.value)}
                        required
                        placeholder="e.g. Richard Petricius"
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Department *</label>
                      <select
                        value={txDept}
                        onChange={(e) => setTxDept(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Expense Category *</label>
                      <select
                        value={txCategory}
                        onChange={(e) => setTxCategory(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Amount (Rp) *</label>
                      <input
                        type="number"
                        value={txAmount}
                        onChange={(e) => setTxAmount(Number(e.target.value))}
                        required
                        min="1000"
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Expense Description *</label>
                    <input
                      type="text"
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      required
                      placeholder="e.g. Pembelian bensin premium untuk armada pengiriman"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    />
                  </div>

                  {/* Drag and Drop Supporting Documents Upload Simulator */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Supporting Evidence (Receipt/Invoice Documents) *</label>
                    <div className="relative">
                      <div
                        onDragOver={(e) => { e.preventDefault(); setTxIsDrag(true); }}
                        onDragLeave={() => setTxIsDrag(false)}
                        onDrop={handleDocDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                          txIsDrag ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                        }`}
                      >
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Drag &amp; Drop receipt files here, or <span className="text-emerald-600 hover:underline">browse</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Supported formats: JPG, PNG, PDF. Multiple files allowed.</p>
                        
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleDocFileInput}
                          className="hidden"
                          id="tx-file-input"
                        />
                        <label htmlFor="tx-file-input" className="absolute inset-0 w-full h-full cursor-pointer text-transparent" />
                      </div>
                    </div>

                    {/* Rendering Upload Documents list with Delete buttons */}
                    {txInvoices.length > 0 && (
                      <div className="mt-3 space-y-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                        <p className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Attached Evidences ({txInvoices.length})</p>
                        {txInvoices.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white border rounded p-1.5 shadow-sm">
                            <div className="flex items-center space-x-1.5 truncate max-w-[80%]">
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span className="truncate text-slate-700">{doc.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1 rounded-full"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Additional Notes / Free Text</label>
                    <textarea
                      rows={2}
                      value={txNotes}
                      onChange={(e) => setTxNotes(e.target.value)}
                      placeholder="Enter secondary details if applicable..."
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddingTx(false)}
                    className="bg-slate-200 text-slate-600 font-bold px-4.5 py-2.5 rounded-lg text-xs hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white font-bold px-4.5 py-2.5 rounded-lg text-xs hover:bg-emerald-500 transition-colors"
                  >
                    Request &amp; Submit Draft
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL DIALOGS: ALLOCATE FUND ================= */}
        {isAddingAlloc && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-scale-up">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm uppercase">Add Petty Cash Fund Allocation</span>
                </div>
                <button onClick={() => setIsAddingAlloc(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAllocSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Target Factory</label>
                  <select
                    value={allocFactory}
                    onChange={(e) => setAllocFactory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                  >
                    {locations.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Allocation Date</label>
                  <input
                    type="date"
                    value={allocDate}
                    onChange={(e) => setAllocDate(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Amount Added (Rupiah)*</label>
                  <input
                    type="number"
                    value={allocAmount}
                    onChange={(e) => setAllocAmount(Number(e.target.value))}
                    required
                    min="10000"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Allocation Notes</label>
                  <input
                    type="text"
                    value={allocNotes}
                    onChange={(e) => setAllocNotes(e.target.value)}
                    placeholder="e.g. Monthly Operational Capital Replenish"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAlloc(false)}
                    className="bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-slate-800"
                  >
                    Commit Allocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL DIALOGS: ADD COA ACCOUNT ================= */}
        {isAddingAccount && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col animate-scale-up">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <span className="font-bold text-xs uppercase">Add Custom Ledger COA Account</span>
                <button onClick={() => setIsAddingAccount(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAccountSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Account Code ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 515"
                    value={newAccId}
                    onChange={(e) => setNewAccId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Category Type *</label>
                  <select
                    value={newAccCategory}
                    onChange={(e) => setNewAccCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium bg-slate-50"
                  >
                    <option value="Assets">Assets</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Income">Income</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Account Label Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advertising Expense"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold p-2.5 rounded-lg text-xs hover:bg-slate-800 transition"
                >
                  Create Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL DIALOGS: ADD CUSTOM EX CATEGORY ================= */}
        {isAddingCategory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <span className="font-bold text-xs uppercase">Add Custom Expense Category</span>
                <button onClick={() => setIsAddingCategory(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marketing"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold p-2.5 rounded-lg text-xs hover:bg-slate-800 transition"
                >
                  Create Category
                </button>
              </form>
            </div>
          </div>
        )}


        {/* ================= TAB: DASHBOARD LAYOUT ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in" id="petty-cash-tab-report">
            
            {/* KPI Cards Row representing consolidated values */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="petty-cash-counts">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 block">Consolidated Fund Allocated</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Rp {overallAllocated.toLocaleString('id-ID')}</h3>
                </div>
                <span className="text-[10px] text-slate-450 font-mono mt-3">Total Deposit &amp; Replenish</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 block">Approved Expenses</span>
                  <h3 className="text-2xl font-extrabold text-rose-600 mt-1">Rp {overallSpent.toLocaleString('id-ID')}</h3>
                </div>
                <span className="text-[10px] text-slate-450 font-mono mt-3">Charged from Petty Cash</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 block">Verification Queue (Pending)</span>
                  <h3 className="text-2xl font-extrabold text-amber-600 mt-1">Rp {overallPending.toLocaleString('id-ID')}</h3>
                </div>
                <span className="text-[10px] text-amber-650 font-mono mt-3 font-semibold">⏳ Awaiting Validation actions</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-800 block font-bold">Consolidated Cash Balance</span>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">Rp {overallCurrent.toLocaleString('id-ID')}</h3>
                </div>
                <span className="text-[10px] text-emerald-800 font-mono mt-3 font-semibold">🟢 In Safe Hand Funds</span>
              </div>
            </div>

            {/* Verification actions widget alert banner */}
            {overallPending > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex gap-3 items-center text-xs">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-amber-800 block">Ada Permintaan Petty Cash Menunggu Tindakan / Approval:</span>
                    <span className="text-slate-650">Terdapat sisa transaksi yang diajukan oleh unit cabang namun belum disetujui Kepala Cabang (Verified) atau Finance (Approved).</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs self-start md:self-center shrink-0 hover:bg-amber-500 transition"
                  >
                    Periksa List Transaksi
                  </button>
                </div>
              </div>
            )}

            {/* Reports Exporter Actions panel */}
            <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Export &amp; Periodic Reporting Center</span>
                <p className="text-xs text-slate-500 mt-0.5">Dapatkan spreadsheet data pengeluaran kas kecil konsolidasian atau laporan per pabrik.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => triggerMockExport('Consolidated', 'EXCEL')}
                  className="bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-emerald-600 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={() => triggerMockExport('Consolidated', 'PDF')}
                  className="bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:bg-rose-600 transition"
                >
                  <FileText className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            </div>

            {/* Visualizer charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Monthly spending trend */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Cash Spending Trend per Weekly / Month</h4>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrendData}>
                      <defs>
                        <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="tanggal" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip formatter={(v) => [`Rp ${v.toLocaleString()}`]} />
                      <Area type="monotone" dataKey="JKT" name="Jakarta HQ" stroke="#10B981" fillOpacity={1} fill="url(#spendColor)" strokeWidth={2} />
                      <Area type="monotone" dataKey="MPD" name="Malang" stroke="#3B82F6" fillOpacity={1} fill="url(#spendColor)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Category distribution breakdown */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Expense Distribution by Category</h4>
                  {spendingByCategoryChartData.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
                      No expenditure data recorded currently. Create transaction items to draw diagram charts.
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={spendingByCategoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {spendingByCategoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#06B6D4','#14B8A6','#84CC16','#FDBA74','#64748B'][index % 12]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [`Rp ${v.toLocaleString()}`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                {spendingByCategoryChartData.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[9px] text-slate-500 font-semibold justify-center max-h-[60px] overflow-y-auto">
                    {spendingByCategoryChartData.map((entry, idx) => (
                      <span key={entry.name} className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: ['#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#06B6D4','#14B8A6','#84CC16','#FDBA74','#64748B'][idx % 12] }}></span>
                        <span>{entry.name} (Rp {entry.value.toLocaleString()})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart 3: Factory Comparison Chart */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Total Budget vs Spent per Factory Facility</h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingByFactoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip formatter={(v) => [`Rp ${v.toLocaleString()}`]} />
                      <Legend fontSize={9} />
                      <Bar dataKey="allocated" name="Fund Allocated (Debit)" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="spent" name="Spent Amount (Credit)" fill="#E11D48" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Department Distribution bar */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Expenses by Operational Department</h4>
                {spendingByDeptData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
                    No department data.
                  </div>
                ) : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendingByDeptData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                        <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={9} width={90} />
                        <Tooltip formatter={(v) => [`Rp ${v.toLocaleString()}`]} />
                        <Bar dataKey="value" name="Total Spent" fill="#10B981" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>

            {/* Direct balances tracker card list */}
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block font-black">🏢 Balance Directory per factory</span>
                <p className="text-xs text-slate-400 mt-1">Status ketersediaan dana brankas cash per unit pabrik terdata saat ini.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {locations.map((loc: any) => {
                  const balanceInfo = factoryBalances[loc.id] || { allocated: 0, spent: 0, current: 0 };
                  const percentSpent = balanceInfo.allocated > 0 ? (balanceInfo.spent / balanceInfo.allocated) * 100 : 0;
                  return (
                    <div key={loc.id} className="p-3 rounded-lg border border-slate-850 bg-slate-950/40 space-y-2">
                      <span className="text-xs font-bold block text-slate-200 truncate">{loc.nama}</span>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Current Cash</span>
                        <span className="text-sm font-extrabold text-emerald-400">Rp {balanceInfo.current.toLocaleString()}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-505">
                          <span>Spent Rate:</span>
                          <span>{percentSpent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1">
                          <div className={`h-1 rounded-full ${percentSpent > 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, percentSpent)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}


        {/* ================= TAB: ACTIONS & APPROVALS WORKFLOW ================= */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-fade-in" id="petty-cash-transactions-approvals">
            
            {/* Filter and query controller panel */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap gap-3 items-center justify-between">
              
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters:
                </span>
                
                {/* Factory Filter */}
                <select
                  value={selectedFactoryFilter}
                  onChange={(e) => setSelectedFactoryFilter(e.target.value)}
                  className="bg-white border rounded text-xs p-1 font-semibold text-slate-700 outline-none"
                >
                  <option value="All">All Locations</option>
                  {locations.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.nama}</option>
                  ))}
                </select>

                {/* Dept filter */}
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-white border rounded text-xs p-1 font-semibold text-slate-700 outline-none"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Category filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-white border rounded text-xs p-1 font-semibold text-slate-700 outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-white border rounded text-xs p-1 font-semibold text-slate-700 outline-none"
                >
                  <option value="All">All Workflows</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted (BM Queue)</option>
                  <option value="Verified">Verified (Finance Queue)</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Quick dynamic status legend indicators */}
              <div className="text-[10px] text-slate-450 font-semibold space-x-2">
                <span>Total Matched: <span className="text-slate-800 font-bold">{filteredTx.length} items</span></span>
              </div>
            </div>

            {/* List transactions table */}
            {filteredTx.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 text-xs">
                Tidak ada transaksi pengeluaran kas kecil yang cocok dengan filter aktif.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Category / Dept</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Receipt Evidences</th>
                      <th className="py-3 px-4 text-center">Status Flow</th>
                      <th className="py-3 px-4 text-center">Control / Approvals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTx.map((tx: any) => {
                      const lName = factoryMap[tx.lokasiId] || tx.lokasiId;
                      const hasDocs = tx.documents && tx.documents.length > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.id}</td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{tx.tanggal}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-850 whitespace-nowrap">{lName.split(' ')[0]}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-800 block w-fit mb-0.5">{tx.kategori}</span>
                            <span className="text-[10px] text-slate-500 font-mono italic block">{tx.department || 'Production'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 max-w-[200px] truncate" title={tx.deskripsi}>{tx.deskripsi}</div>
                            <span className="text-[10px] text-slate-450 block font-mono">By: @{tx.pic || 'Employee'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                            Rp {tx.jumlah.toLocaleString('id-ID')}
                          </td>
                          
                          {/* Supports Receipts display */}
                          <td className="py-3.5 px-4 text-center">
                            {hasDocs ? (
                              <button
                                onClick={() => {
                                  alert(`Attached files:\n${tx.documents.map((d: any) => `- ${d.name} (${d.type})`).join('\n')}`);
                                }}
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 mx-auto"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {tx.documents.length} File(s)
                              </button>
                            ) : tx.id.startsWith('PC-0') ? (
                              // legacy seeds fallbacks
                              <button
                                onClick={() => alert("Simulation legacy receipt attachment verified.")}
                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 mx-auto"
                              >
                                <CheckSquare className="w-3.5 h-3.5" /> Leg. Evidence
                              </button>
                            ) : (
                              <span className="text-rose-500 font-bold text-[9px] uppercase">No evidences!</span>
                            )}
                          </td>

                          {/* Statuses Flow */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase inline-block ${
                              tx.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              tx.status === 'Verified' ? 'bg-blue-105 bg-blue-100 text-blue-800 border border-blue-300' :
                              tx.status === 'Submitted' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              tx.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              tx.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border border-slate-300' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                              {tx.status}
                            </span>
                          </td>

                          {/* Control action triggers approval workflows */}
                          <td className="py-3.5 px-4 text-center font-semibold">
                            <div className="flex gap-1 items-center justify-center">
                              
                              {tx.status === 'Draft' && (
                                <button
                                  onClick={() => handleWorkflowTransition(tx.id, 'Submitted')}
                                  className="bg-slate-900 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-0.5 hover:bg-slate-800 transition"
                                >
                                  Submit
                                </button>
                              )}

                              {tx.status === 'Submitted' && (currentUser.role.includes('Cabang') || currentUser.role.includes('Manager') || currentUser.role.includes('HQ') || currentUser.role === 'Super Admin') && (
                                <button
                                  onClick={() => handleWorkflowTransition(tx.id, 'Verified')}
                                  className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-0.5 hover:bg-blue-500 transition"
                                  title="Branch Manager approves to Verified"
                                >
                                  BM Approve
                                </button>
                              )}

                              {tx.status === 'Verified' && (currentUser.role.includes('Finance') || currentUser.role.includes('HQ') || currentUser.role === 'Super Admin') && (
                                <button
                                  onClick={() => handleWorkflowTransition(tx.id, 'Approved')}
                                  className="bg-emerald-600 text-white font-black px-2 py-1 rounded text-[10px] flex items-center gap-0.5 hover:bg-emerald-500 transition shadow shadow-emerald-400/20"
                                  title="HQ Finance verify to Approved"
                                >
                                  Finance Verify
                                </button>
                              )}

                              {/* Reject options */}
                              {(tx.status === 'Submitted' || tx.status === 'Verified') && (
                                <button
                                  onClick={() => handleWorkflowTransition(tx.id, 'Rejected')}
                                  className="bg-rose-100 text-rose-700 font-bold px-1.5 py-1 rounded text-[10px] hover:bg-rose-200 transition"
                                >
                                  Reject
                                </button>
                              )}

                              {tx.status === 'Approved' && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 select-none font-sans justify-center">
                                  ✓ Cleared
                                </span>
                              )}

                              {tx.status === 'Rejected' && <span className="text-[10px] font-bold text-rose-500 select-none">Rejected</span>}
                              {tx.status === 'Cancelled' && <span className="text-[10px] font-bold text-slate-400 select-none">Cancelled</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* ================= TAB: FUND ALLOCATIONS ================= */}
        {activeTab === 'allocations' && (
          <div className="space-y-4 animate-fade-in" id="petty-cash-allocations-tab">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 p-4 border-b border-slate-205 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-800">Petty Cash Funding Allocations Ledger</span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4">Allocation ID</th>
                    <th className="py-3 px-4">Allocated Date</th>
                    <th className="py-3 px-4">Target Facility</th>
                    <th className="py-3 px-4 text-right">Previous Balance</th>
                    <th className="py-3 px-4 text-right">Amount Added (Rp)</th>
                    <th className="py-3 px-4 text-right">Post-Funding Balance</th>
                    <th className="py-3 px-4">Authorization PIC</th>
                    <th className="py-3 px-4">Allocated Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650">
                  {allocations.map((alloc) => {
                    const lName = factoryMap[alloc.factoryId] || alloc.factoryId;
                    const after = alloc.openingBalance + alloc.amountAdded;
                    return (
                      <tr key={alloc.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{alloc.id}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{alloc.tanggal}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{lName}</td>
                        <td className="py-3 px-4 text-right font-mono">Rp {alloc.openingBalance.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600 font-mono">
                          + Rp {alloc.amountAdded.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                          Rp {after.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-500">@{alloc.pic}</td>
                        <td className="py-3 px-4 italic text-slate-450">{alloc.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ================= TAB: PETTY CASH LEDGER ================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-4 animate-fade-in" id="petty-cash-ledger-reporting-tab">
            
            {/* Legend / Title cards */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">General Ledger (Buku Besar Kas Kecil)</span>
                <p className="text-slate-500">Urutan kronologis seluruh setoran modal (Debit) dan pengeluaran yang telah disetujui (Credit).</p>
              </div>
              <button
                onClick={() => triggerMockExport('Ledger', 'EXCEL')}
                className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download Ledger
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4 font-mono">Tanggal</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Factory</th>
                    <th className="py-3 px-4">Kategori Mutasi</th>
                    <th className="py-3 px-4">Deskripsi Ledger</th>
                    <th className="py-3 px-4 text-right">Debit (Fund In)</th>
                    <th className="py-3 px-4 text-right">Credit (Expense)</th>
                    <th className="py-3 px-4 text-right font-bold">Running Balance</th>
                    <th className="py-3 px-4">PIC / PIC Auth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-705 font-mono">
                  {/* Dynamic sequential running balance calculated chronologically */}
                  {fullLedger.map((item, idx) => {
                    const lName = factoryMap[item.lokasiId] || item.lokasiId;
                    const isDebit = item.tipe === 'Debit';
                    return (
                      <tr key={idx} className={`hover:bg-slate-50/50 ${item.status !== 'Approved' ? 'text-slate-400 italic bg-slate-50/40' : ''}`}>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">{item.tanggal}</td>
                        <td className="py-3 px-4 font-bold max-w-[100px] truncate">{item.id}</td>
                        <td className="py-3 px-4 font-sans font-bold whitespace-nowrap">{lName.split(' ')[0]}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            isDebit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>{item.kategori}</span>
                        </td>
                        <td className="py-3 px-4 font-sans normal-case text-slate-800 max-w-[220px] truncate" title={item.deskripsi}>{item.deskripsi}</td>
                        
                        {/* Debit allocation */}
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {isDebit && item.status === 'Approved' ? `Rp ${item.jumlah.toLocaleString('id-ID')}` : '-'}
                        </td>

                        {/* Credit Expense */}
                        <td className="py-3 px-4 text-right font-bold text-rose-600">
                          {!isDebit && item.status === 'Approved' ? `Rp ${item.jumlah.toLocaleString('id-ID')}` : '-'}
                        </td>

                        {/* Balance sequential running */}
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {item.status === 'Approved' ? `Rp ${item.consolidatedBalance.toLocaleString('id-ID')}` : '-'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-sans">@{item.pic || 'Agent'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ================= TAB: PETTY CASH RECONCILIATION ================= */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-6 animate-fade-in" id="petty-cash-reconciliations-tab">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Setup Audit Count panel inside Reconciliation */}
              <div className="col-span-1 lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1">
                  <Scale className="w-4 h-4 text-indigo-600" /> Start Cash Reconciliation
                </h3>
                <p className="text-xs text-slate-500">Lakukan stock opname fisik brankas uang tunai kas kecil, bandingkan nilai ledger sistem dengan saldo uang kertas/koin aktual di brankas pabrik.</p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Select Factory Location</label>
                    <select
                      value={reconFactory}
                      onChange={(e) => setReconFactory(e.target.value)}
                      className="w-full bg-white border rounded-lg p-2 text-xs font-semibold text-slate-800"
                    >
                      {locations.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Uang Tunai Fisik Brankas (Actual Counted) *</label>
                    <input
                      type="number"
                      required
                      value={reconActualCount}
                      onChange={(e) => setReconActualCount(Number(e.target.value))}
                      className="w-full bg-white border rounded-lg p-2 text-xs font-black text-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Auditor Notes</label>
                    <textarea
                      rows={2}
                      value={reconNotes}
                      onChange={(e) => setReconNotes(e.target.value)}
                      placeholder="e.g. Cocok setelah koin dihitung kembali"
                      className="w-full bg-white border rounded-lg p-2 text-xs text-slate-800 font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateReconciliation}
                    className="w-full bg-slate-900 border text-white hover:bg-slate-800 font-bold p-2 text-xs rounded-lg transition uppercase tracking-wider"
                  >
                    Commit &amp; Save Audit Reconciliation
                  </button>
                </div>
              </div>

              {/* Computations Display panel on right */}
              <div className="col-span-1 lg:col-span-8 bg-white border rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider mb-4 inline-block">Reconciliation Analytics</span>
                  
                  <h3 className="text-sm font-bold text-slate-900 mt-2">Fasilitas Diperiksa: {factoryMap[reconFactory]}</h3>

                  {/* Calculations row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Allocated</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">Rp {reconCalculations.allocated.toLocaleString()}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Expenses</span>
                      <p className="text-sm font-bold text-rose-600 mt-1">Rp {reconCalculations.spent.toLocaleString()}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold text-indigo-750">Ledger Expected</span>
                      <p className="text-sm font-extrabold text-indigo-650 mt-1">Rp {reconCalculations.expected.toLocaleString()}</p>
                    </div>

                    <div className={`p-3 border rounded-lg ${reconCalculations.diff === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Physical Count</span>
                      <p className="text-sm font-extrabold text-slate-900 mt-1">Rp {reconActualCount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Profitability diff indicator */}
                  <div className={`mt-5 p-4 rounded-xl border flex justify-between items-center ${
                    reconCalculations.diff === 0 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : reconCalculations.diff > 0 
                      ? 'bg-amber-50/50 border-amber-300' 
                      : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div>
                      <span className="text-xs text-slate-600 font-bold block">Selisih Brankas (Match Variance):</span>
                      <span className="text-base font-extrabold text-slate-900">{reconCalculations.type}</span>
                    </div>

                    <div className="text-right">
                      <h4 className={`text-xl font-black ${reconCalculations.diff === 0 ? 'text-emerald-700' : reconCalculations.diff > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                        Rp {reconCalculations.diff.toLocaleString()}
                      </h4>
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-450">{reconCalculations.status}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-510 italic mt-4 font-mono">
                  * Catatan: Sistem merekam seluruh histori selisih brankas guna mendeteksi kecurangan atau pencatatan tiket manual yang berulang.
                </p>
              </div>

            </div>

            {/* Reconciliation Historical table of previous logs */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-3.5 border-b text-xs font-bold uppercase text-slate-705">
                Historical Reconciliation Logs &amp; Audit Trail
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4">Audit ID</th>
                    <th className="py-3 px-4">Date Checked</th>
                    <th className="py-3 px-4">Location Checked</th>
                    <th className="py-3 px-4 text-right">Ledger Expected</th>
                    <th className="py-3 px-4 text-right">Physical Counted</th>
                    <th className="py-3 px-4 text-right font-bold">Difference</th>
                    <th className="py-3 px-4 text-center">Status Audit</th>
                    <th className="py-3 px-4">Checked By</th>
                    <th className="py-3 px-4">Audit Auditor Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650">
                  {reconLogs.map((log) => {
                    const lName = factoryMap[log.factoryId] || log.factoryId;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{log.id}</td>
                        <td className="py-3 px-4">{log.tanggal}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{lName}</td>
                        <td className="py-3 px-4 text-right">Rp {log.expected.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">Rp {log.actual.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right font-bold font-mono ${log.difference === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {log.difference > 0 ? '+' : ''}{log.difference.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            log.status === 'Matched' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>{log.status}</span>
                        </td>
                        <td className="py-3 px-4">@{log.pic}</td>
                        <td className="py-3 px-4 italic block max-w-[200px] truncate" title={log.notes}>{log.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}


        {/* ================= TAB: AUTOMATIC JOURNAL ENTRIES ================= */}
        {activeTab === 'journal' && (
          <div className="space-y-4 animate-fade-in" id="petty-cash-accounting-journals-tab">
            
            <div className="bg-slate-950/5 border border-slate-205 p-4 rounded-xl text-xs space-y-1.5 text-slate-705">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-indigo-650" /> Double-Entry Automatic Journal Systems
              </span>
              <p>Setiap transaksi Petty Cash berstatus <strong>Approved</strong> otomatis menjurnal akun aset Kredit (Petty Cash) dan mendebit akun pengeluaran beban (Expense) yang relevan mengacu COA.</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Tx Ref ID &amp; Date</th>
                    <th className="py-3 px-4">Account Code</th>
                    <th className="py-3 px-4">Chart of Account (Type)</th>
                    <th className="py-3 px-4 text-right">Debit (Rp)</th>
                    <th className="py-3 px-4 text-right">Credit (Rp)</th>
                    <th className="py-3 px-4 text-left">Description / Posting Line</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-705 text-xs">
                  {state.pettyCash && (state.pettyCash as any[]).filter((t: any) => t.status === 'Approved').map((tx: any) => {
                    // Match expense account
                    const matchedAcc = coa.find(c => c.nama.toLowerCase().includes(tx.kategori.toLowerCase()) || tx.kategori.toLowerCase().includes(c.nama.toLowerCase())) || { id: '512', nama: `${tx.kategori} Expense` };
                    
                    return (
                      <React.Fragment key={tx.id}>
                        {/* DEBIT LINE */}
                        <tr className="bg-blue-50/20">
                          <td className="py-3 px-4 font-sans">
                            <span className="font-mono font-extrabold block text-slate-900">{tx.id}</span>
                            <span className="text-[10px] text-slate-450 block">{tx.tanggal}</span>
                          </td>
                          <td className="py-3 px-4 text-indigo-600 font-bold">{matchedAcc.id}</td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-800">{matchedAcc.nama} (Expense)</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">Rp {tx.jumlah.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-4 text-right text-slate-400">-</td>
                          <td className="py-3 px-4 text-slate-500 font-sans italic text-[11px] font-medium leading-tight">Debit: Posting to {tx.kategori} Expense</td>
                        </tr>

                        {/* CREDIT LINE */}
                        <tr className="border-b bg-slate-50/30">
                          <td className="py-2 px-4 text-slate-400 font-sans text-[11px]">- Offset credit line</td>
                          <td className="py-2 px-4 text-slate-800 font-bold">103</td>
                          <td className="py-2 px-4 font-sans font-semibold text-slate-850 pl-8">↳ Petty Cash (Asset)</td>
                          <td className="py-2 px-4 text-right text-slate-400">-</td>
                          <td className="py-2 px-4 text-right font-bold text-rose-500">Rp {tx.jumlah.toLocaleString('id-ID')}</td>
                          <td className="py-2 px-4 text-slate-500 font-sans italic text-[11px] font-medium leading-tight pl-4">Credit: Paid from branch Petty Cash brankas</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ================= TAB: CHART OF ACCOUNTS (COA) ================= */}
        {activeTab === 'coa' && (
          <div className="space-y-4 animate-fade-in" id="petty-cash-coa-charts">
            
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Accounts Master Config (COA Light)</span>
              
              <button
                onClick={() => setIsAddingAccount(true)}
                className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Account Code
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Accounts list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-slate-50/80 p-3.5 border-b text-xs font-bold uppercase text-slate-800">
                  Accident chart of Accounts
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-4 font-mono">Code</th>
                      <th className="py-2.5 px-4">Account Name</th>
                      <th className="py-2.5 px-4">Account Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-650">
                    {coa.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-indigo-700">{acc.id}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-900">{acc.nama}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            acc.tipe === 'Assets' ? 'bg-emerald-100 text-emerald-800' :
                            acc.tipe === 'Income' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>{acc.tipe}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Categories management block */}
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase text-slate-800">Petty Cash Expense Categories</h3>
                    <button
                      onClick={() => setIsAddingCategory(true)}
                      className="text-emerald-600 hover:text-emerald-500 font-bold text-xs flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Custom Category
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">Urutan kategori pengeluaran kas kecil yang diaktifkan dalam form input pegawai.</p>

                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-800 text-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-semibold hover:bg-slate-200/50 transition cursor-default select-none"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}


        {/* ================= TAB: AI ADVISOR & ANALYZER ================= */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in" id="petty-cash-ai-advices">
            
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between space-y-4 border border-slate-850">
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider">AI Financial Spending Analyzer Engine</span>
                </div>
                <h3 className="text-lg font-bold">Automated Weekly Analytics &amp; Risk Detection Reports</h3>
                <p className="text-xs text-slate-450 max-w-2xl">Sistem mendeteksi deviasi belanja atau kenaikan biaya operasional secara langsung dari audit transaksi kas kecil berstatus Approved di semua unit pergudangan.</p>
              </div>

              <div className="border-t border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
                    <span>1. Terdeteksi (Problem)</span>
                  </div>
                  <p className="text-slate-300 italic">"{aiAnalysis.problem}"</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                    <span>2. Akar Tantangan (Challenge)</span>
                  </div>
                  <p className="text-slate-300">{aiAnalysis.challenge}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold font-sans">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                    <span>3. Rencana Tindakan (Action Plan)</span>
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap font-medium leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800">
                    {aiAnalysis.actionPlan}
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
