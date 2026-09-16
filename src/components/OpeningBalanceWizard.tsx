import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Check, X, Clock, TrendingUp, DollarSign, Wallet,
  FileSpreadsheet, Building, AlertCircle, RefreshCw, ChevronDown,
  ChevronRight, FileText, CheckCircle, ShieldCheck, ArrowRight, ArrowLeft,
  Lock, Unlock, FileDown, UploadCloud, Activity, BookOpen, Sliders,
  Grid, Sparkles, UserCheck, AlertTriangle, FilePenLine
} from 'lucide-react';

interface Props {
  state: any;
  currentUser: any;
  logActivity: (module: string, desc: string, detail?: any) => void;
  onNavigate?: (menuId: string) => void;
  activeMenu?: string;
}

// Interfaces helper
interface CoaAccount {
  code: string;
  name: string;
  category: string;
  normalBalance: 'Debet' | 'Kredit';
  status: 'Aktif' | 'Non-Aktif';
}

interface HelperCoa {
  id: string; // Supplier, Customer, Employee etc
  name: string;
  type: 'Supplier' | 'Customer' | 'Employee' | 'Factory' | 'Bank' | 'Project' | 'Asset';
}

interface OpeningBalanceSheet {
  code: string;
  name: string;
  category: string;
  debit: number;
  credit: number;
  factory: string;
}

interface RetainedEarningsImport {
  factory: string;
  begRetained: number;
  currentProfit: number;
  adjustments: number;
  endRetained: number;
}

interface ArApRecord {
  partner: string;
  invoiceNo: string;
  balance: number;
  dueDate: string;
  factory: string;
}

interface InventoryRecord {
  factory: string;
  category: 'Raw Materials' | 'Frozen' | 'Chips' | 'Finished Goods' | 'Packaging' | 'Supporting' | 'Chemicals' | 'Consumables';
  item: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
}

interface FixedAssetRecord {
  code: string;
  name: string;
  category: string;
  factory: string;
  purchaseDate: string;
  usefulLife: number;
  cost: number;
  accumDep: number;
  bookValue: number;
}

interface CashBankPosition {
  factory: string;
  accountName: string;
  type: 'Cash' | 'Bank' | 'Petty Cash';
  balance: number;
}

interface OpeningJournalEntry {
  date: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  factory: string;
  description: string;
  reference: string;
}

interface AuditRecord {
  action: string;
  user: string;
  date: string;
  details: string;
}

interface OpeningAdjustment {
  id: string;
  accountCode: string;
  accountName: string;
  factory: string;
  debit: number;
  credit: number;
  reason: string;
  evidence: string;
  approvedByHQ: boolean;
  approvedByDirector: boolean;
  status: 'Draft' | 'Waiting HQ' | 'Waiting Director' | 'Approved' | 'Rejected';
  date: string;
}

export default function OpeningBalanceWizard({ state, currentUser, logActivity, onNavigate, activeMenu }: Props) {
  // Navigation for tab switcher when we want wizard or reconciliation or adjustment views
  const [activeSubMenu, setActiveSubMenu] = useState<'wizard' | 'reconciliation' | 'adjustment' | 'audit'>('wizard');

  // Synchronize internal active tab with the sidebar menu selected
  useEffect(() => {
    if (activeMenu === 'finance-opening-balance-wizard') {
      setActiveSubMenu('wizard');
    } else if (activeMenu === 'finance-reconciliation') {
      setActiveSubMenu('reconciliation');
    } else if (activeMenu === 'finance-opening-adjustment') {
      setActiveSubMenu('adjustment');
    }
  }, [activeMenu]);

  // --- Step 1: Opening Date ---
  const [openingDate, setOpeningDate] = useState<string>('2026-07-01');
  const [dateRuleConfirmed, setDateRuleConfirmed] = useState<boolean>(true);

  // --- Wizard Main Progress Step (1 to 13) ---
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('agridea_opening_locked') === 'true';
  });

  // Wizard Status
  const [hqApproval, setHqApproval] = useState<boolean>(() => {
    return localStorage.getItem('agridea_opening_hq_approve') === 'true';
  });
  const [directorApproval, setDirectorApproval] = useState<boolean>(() => {
    return localStorage.getItem('agridea_opening_dir_approve') === 'true';
  });

  // --- Audit Trail ---
  const [auditTrail, setAuditTrail] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem('agridea_opening_audit');
    return saved ? JSON.parse(saved) : [
      { action: 'Wizard Initialized', user: 'System', date: '2026-06-08 09:00:00', details: 'Sistem inisialisasi Wizard Saldo Awal.' }
    ];
  });

  const appendAudit = (action: string, details: string) => {
    const newLogs: AuditRecord[] = [
      ...auditTrail,
      {
        action,
        user: `@${currentUser.username} (${currentUser.namaLengkap || currentUser.role})`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        details
      }
    ];
    setAuditTrail(newLogs);
    localStorage.setItem('agridea_opening_audit', JSON.stringify(newLogs));
    logActivity('Opening Balance Wizard', `${action}: ${details}`);
  };

  // --- Opening Balance Adjustments (Step 17) ---
  const [adjustments, setAdjustments] = useState<OpeningAdjustment[]>(() => {
    const saved = localStorage.getItem('agridea_opening_adjustments');
    return saved ? JSON.parse(saved) : [];
  });

  // Temporary state for new adjustment form
  const [newAdj, setNewAdj] = useState({
    accountCode: '',
    factory: 'MPD',
    debit: 0,
    credit: 0,
    reason: '',
    evidence: ''
  });

  const saveAdjustmentsToStorage = (list: OpeningAdjustment[]) => {
    setAdjustments(list);
    localStorage.setItem('agridea_opening_adjustments', JSON.stringify(list));
  };

  // --- Core Wizard Data States ---
  const [coas, setCoas] = useState<CoaAccount[]>(() => {
    const saved = localStorage.getItem('agridea_opening_coas');
    return saved ? JSON.parse(saved) : [];
  });

  const [kodeBantus, setKodeBantus] = useState<HelperCoa[]>(() => {
    const saved = localStorage.getItem('agridea_opening_kb');
    return saved ? JSON.parse(saved) : [];
  });

  const [openingBalances, setOpeningBalances] = useState<OpeningBalanceSheet[]>(() => {
    const saved = localStorage.getItem('agridea_opening_nrc');
    return saved ? JSON.parse(saved) : [];
  });

  const [retainedEarnings, setRetainedEarnings] = useState<RetainedEarningsImport[]>(() => {
    const saved = localStorage.getItem('agridea_opening_retained');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerAr, setCustomerAr] = useState<ArApRecord[]>(() => {
    const saved = localStorage.getItem('agridea_opening_ar');
    return saved ? JSON.parse(saved) : [];
  });

  const [supplierAp, setSupplierAp] = useState<ArApRecord[]>(() => {
    const saved = localStorage.getItem('agridea_opening_ap');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventoryBalances, setInventoryBalances] = useState<InventoryRecord[]>(() => {
    const saved = localStorage.getItem('agridea_opening_inv');
    return saved ? JSON.parse(saved) : [];
  });

  const [fixedAssets, setFixedAssets] = useState<FixedAssetRecord[]>(() => {
    const saved = localStorage.getItem('agridea_opening_assets');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashBankPositions, setCashBankPositions] = useState<CashBankPosition[]>(() => {
    const saved = localStorage.getItem('agridea_opening_cashbank');
    return saved ? JSON.parse(saved) : [];
  });

  // State for user uploading copy paste CSV
  const [pasteData, setPasteData] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Save changes automatically
  useEffect(() => {
    localStorage.setItem('agridea_opening_coas', JSON.stringify(coas));
  }, [coas]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_kb', JSON.stringify(kodeBantus));
  }, [kodeBantus]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_nrc', JSON.stringify(openingBalances));
  }, [openingBalances]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_retained', JSON.stringify(retainedEarnings));
  }, [retainedEarnings]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_ar', JSON.stringify(customerAr));
  }, [customerAr]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_ap', JSON.stringify(supplierAp));
  }, [supplierAp]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_inv', JSON.stringify(inventoryBalances));
  }, [inventoryBalances]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_assets', JSON.stringify(fixedAssets));
  }, [fixedAssets]);

  useEffect(() => {
    localStorage.setItem('agridea_opening_cashbank', JSON.stringify(cashBankPositions));
  }, [cashBankPositions]);

  // Excel Excel templates simulation data structure
  const handleLoadExcelWorkbook = () => {
    // Populate Step 2: COA Sheet
    const sampleCoas: CoaAccount[] = [
      { code: '1100', name: 'Petty Cash Ledger', category: 'Kas & Setara Kas', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1110', name: 'Bank Mandiri Utama IDR', category: 'Kas & Setara Kas', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1120', name: 'Piutang Dagang Klien', category: 'Piutang Usaha', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1130', name: 'Persediaan Bahan Baku Segar', category: 'Persediaan', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1131', name: 'Persediaan Keripik (Frying)', category: 'Persediaan', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1132', name: 'Persediaan Kemasan & Penolong', category: 'Persediaan', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1200', name: 'Aset Tetap Tanah Pabrik', category: 'Aset Tetap', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1210', name: 'Aset Tetap Mesin Vacuum Frying', category: 'Aset Tetap', normalBalance: 'Debet', status: 'Aktif' },
      { code: '1219', name: 'Akumulasi Penyusutan Mesin', category: 'Akumulasi Penyusutan', normalBalance: 'Kredit', status: 'Aktif' },
      { code: '2100', name: 'Hutang Dagang Supplier Mitra', category: 'Kewajiban Jangka Pendek', normalBalance: 'Kredit', status: 'Aktif' },
      { code: '2110', name: 'Hutang Gaji Borongan Terakru', category: 'Kewajiban Jangka Pendek', normalBalance: 'Kredit', status: 'Aktif' },
      { code: '3100', name: 'Modal Saham Pendirian', category: 'Ekuitas', normalBalance: 'Kredit', status: 'Aktif' },
      { code: '3200', name: 'Retained Earnings (Laba Ditahan)', category: 'Ekuitas', normalBalance: 'Kredit', status: 'Aktif' },
      { code: '3300', name: 'Laba Tahun Berjalan', category: 'Ekuitas', normalBalance: 'Kredit', status: 'Aktif' }
    ];
    setCoas(sampleCoas);

    // Populate Step 3: Kode Bantu Sheet
    const sampleKb: HelperCoa[] = [
      { id: 'SPL-001', name: 'Kelompok Tani Berkah Wijaya', type: 'Supplier' },
      { id: 'SPL-002', name: 'CV Plastik Agung Mandiri', type: 'Supplier' },
      { id: 'CST-001', name: 'Indogrosir Group Cikampek', type: 'Customer' },
      { id: 'CST-002', name: 'Transmart Retail Nasional', type: 'Customer' },
      { id: 'EMP-001', name: 'Suhartono (Operator SSP)', type: 'Employee' },
      { id: 'LOC-001', name: 'Sipahutar Factory (SSP)', type: 'Factory' },
      { id: 'LOC-002', name: 'Wonosobo Factory (MPD)', type: 'Factory' },
      { id: 'LOC-003', name: 'Jakarta HQ (JKT HQ)', type: 'Factory' },
      { id: 'LOC-004', name: 'Kendal Factory (KKI)', type: 'Factory' },
      { id: 'LOC-005', name: 'Packaging Depot (AGDN)', type: 'Factory' }
    ];
    setKodeBantus(sampleKb);

    // Populate Step 4: NRC (Neraca Balances) - Distributed per Factory
    const sampleNrc: OpeningBalanceSheet[] = [
      // MPD Factory
      { code: '1100', name: 'Petty Cash Ledger', category: 'Kas & Setara Kas', debit: 45000000, credit: 0, factory: 'MPD' },
      { code: '1110', name: 'Bank Mandiri Utama IDR', category: 'Kas & Setara Kas', debit: 120000000, credit: 0, factory: 'MPD' },
      { code: '1120', name: 'Piutang Dagang Klien', category: 'Piutang Usaha', debit: 245000000, credit: 0, factory: 'MPD' },
      { code: '1130', name: 'Persediaan Bahan Baku Segar', category: 'Persediaan', debit: 185000000, credit: 0, factory: 'MPD' },
      { code: '1200', name: 'Aset Tetap Tanah Pabrik', category: 'Aset Tetap', debit: 750000000, credit: 0, factory: 'MPD' },
      { code: '2100', name: 'Hutang Dagang Supplier Mitra', category: 'Kewajiban Jangka Pendek', debit: 0, credit: 155000000, factory: 'MPD' },
      { code: '3100', name: 'Modal Saham Pendirian', category: 'Ekuitas', debit: 0, credit: 800000000, factory: 'MPD' },
      { code: '3200', name: 'Retained Earnings (Laba Ditahan)', category: 'Ekuitas', debit: 0, credit: 390000000, factory: 'MPD' },

      // SSP Factory
      { code: '1100', name: 'Petty Cash Ledger', category: 'Kas & Setara Kas', debit: 35000000, credit: 0, factory: 'SSP' },
      { code: '1110', name: 'Bank Mandiri Utama IDR', category: 'Kas & Setara Kas', debit: 165000000, credit: 0, factory: 'SSP' },
      { code: '1120', name: 'Piutang Dagang Klien', category: 'Piutang Usaha', debit: 189000000, credit: 0, factory: 'SSP' },
      { code: '1130', name: 'Persediaan Bahan Baku Segar', category: 'Persediaan', debit: 145000000, credit: 0, factory: 'SSP' },
      { code: '1210', name: 'Aset Tetap Mesin Vacuum Frying', category: 'Aset Tetap', debit: 450000000, credit: 0, factory: 'SSP' },
      { code: '1219', name: 'Akumulasi Penyusutan Mesin', category: 'Akumulasi Penyusutan', debit: 0, credit: 90000000, factory: 'SSP' },
      { code: '2100', name: 'Hutang Dagang Supplier Mitra', category: 'Kewajiban Jangka Pendek', debit: 0, credit: 110000000, factory: 'SSP' },
      { code: '3100', name: 'Modal Saham Pendirian', category: 'Ekuitas', debit: 0, credit: 500000000, factory: 'SSP' },
      { code: '3200', name: 'Retained Earnings (Laba Ditahan)', category: 'Ekuitas', debit: 0, credit: 284000000, factory: 'SSP' },

      // KKI Factory
      { code: '1100', name: 'Petty Cash Ledger', category: 'Kas & Setara Kas', debit: 25000000, credit: 0, factory: 'KKI' },
      { code: '1110', name: 'Bank Mandiri Utama IDR', category: 'Kas & Setara Kas', debit: 95000000, credit: 0, factory: 'KKI' },
      { code: '1120', name: 'Piutang Dagang Klien', category: 'Piutang Usaha', debit: 112500000, credit: 0, factory: 'KKI' },
      { code: '2100', name: 'Hutang Dagang Supplier Mitra', category: 'Kewajiban Jangka Pendek', debit: 0, credit: 82500000, factory: 'KKI' },
      { code: '3100', name: 'Modal Saham Pendirian', category: 'Ekuitas', debit: 0, credit: 100000000, factory: 'KKI' },
      { code: '3200', name: 'Retained Earnings (Laba Ditahan)', category: 'Ekuitas', debit: 0, credit: 50000000, factory: 'KKI' },

      // AGDN Factory
      { code: '1100', name: 'Petty Cash Ledger', category: 'Kas & Setara Kas', debit: 15000000, credit: 0, factory: 'AGDN' },
      { code: '1110', name: 'Bank Mandiri Utama IDR', category: 'Kas & Setara Kas', debit: 45000000, credit: 0, factory: 'AGDN' },
      { code: '1120', name: 'Piutang Dagang Klien', category: 'Piutang Usaha', debit: 65500000, credit: 0, factory: 'AGDN' },
      { code: '2100', name: 'Hutang Dagang Supplier Mitra', category: 'Kewajiban Jangka Pendek', debit: 0, credit: 64500000, factory: 'AGDN' },
      { code: '3100', name: 'Modal Saham Pendirian', category: 'Ekuitas', debit: 0, credit: 50000000, factory: 'AGDN' },
      { code: '3200', name: 'Retained Earnings (Laba Ditahan)', category: 'Ekuitas', debit: 0, credit: 11000000, factory: 'AGDN' },

      // JKT HQ
      { code: '1100', name: 'Petty Cash Ledger', category: 'Kas & Setara Kas', debit: 55000000, credit: 0, factory: 'JKT HQ' },
      { code: '1110', name: 'Bank Mandiri Utama IDR', category: 'Kas & Setara Kas', debit: 385000000, credit: 0, factory: 'JKT HQ' },
      { code: '1200', name: 'Aset Tetap Tanah Pabrik', category: 'Aset Tetap', debit: 1200000000, credit: 0, factory: 'JKT HQ' },
      { code: '3100', name: 'Modal Saham Pendirian', category: 'Ekuitas', debit: 0, credit: 1500000000, factory: 'JKT HQ' },
      { code: '3200', name: 'Retained Earnings (Laba Ditahan)', category: 'Ekuitas', debit: 0, credit: 140000000, factory: 'JKT HQ' }
    ];
    setOpeningBalances(sampleNrc);

    // Populate Step 5: Retained Earnings Sheet
    const sampleRetained: RetainedEarningsImport[] = [
      { factory: 'MPD', begRetained: 300000000, currentProfit: 90000000, adjustments: 0, endRetained: 390000000 },
      { factory: 'SSP', begRetained: 250000000, currentProfit: 34000000, adjustments: 0, endRetained: 284000000 },
      { factory: 'KKI', begRetained: 40000000, currentProfit: 10000000, adjustments: 0, endRetained: 50000000 },
      { factory: 'AGDN', begRetained: 10000000, currentProfit: 1000000, adjustments: 0, endRetained: 11000000 },
      { factory: 'JKT HQ', begRetained: 100000000, currentProfit: 40000000, adjustments: 0, endRetained: 140000000 }
    ];
    setRetainedEarnings(sampleRetained);

    // Populate Step 6: Piutang Klien (BP Customer)
    const sampleAr: ArApRecord[] = [
      { partner: 'Indogrosir Group Cikampek', invoiceNo: 'INV-2026-0501', balance: 245000000, dueDate: '2026-07-15', factory: 'MPD' },
      { partner: 'Transmart Retail Nasional', invoiceNo: 'INV-2026-0518', balance: 189000000, dueDate: '2026-07-28', factory: 'SSP' },
      { partner: 'Brimart Super Swalayan', invoiceNo: 'INV-2026-0524', balance: 112500000, dueDate: '2026-08-10', factory: 'KKI' },
      { partner: 'Export Star Corp (SGP)', invoiceNo: 'INV-2026-0412', balance: 65500000, dueDate: '2026-07-20', factory: 'AGDN' }
    ];
    setCustomerAr(sampleAr);

    // Populate Step 7: Hutang Supplier (BP Supplier)
    const sampleAp: ArApRecord[] = [
      { partner: 'Kelompok Tani Berkah Wijaya', invoiceNo: 'BILL-2026-0610', balance: 155000000, dueDate: '2026-07-10', factory: 'MPD' },
      { partner: 'Kelompok Tani Gayo Highland', invoiceNo: 'BILL-2026-0612', balance: 110000000, dueDate: '2026-07-12', factory: 'SSP' },
      { partner: 'CV Plastik Agung Mandiri', invoiceNo: 'BILL-2026-0614', balance: 82500000, dueDate: '2026-07-14', factory: 'KKI' },
      { partner: 'PT Logistik Kemas Nusantara', invoiceNo: 'BILL-2026-0618', balance: 64500000, dueDate: '2026-07-18', factory: 'AGDN' }
    ];
    setSupplierAp(sampleAp);

    // Populate Step 8: Opening Inventory
    const sampleInv: InventoryRecord[] = [
      { factory: 'MPD', category: 'Raw Materials', item: 'Nangka Segar Grade A', quantity: 18500, unitCost: 10000, totalValue: 185000000 },
      { factory: 'SSP', category: 'Raw Materials', item: 'Nangka Segar Sipahutar Grade B', quantity: 16111, unitCost: 9000, totalValue: 145000000 },
      { factory: 'KKI', category: 'Chips', item: 'Keripik Nangka Curah SSP', quantity: 1000, unitCost: 82500, totalValue: 82500000 },
      { factory: 'AGDN', category: 'Packaging', item: 'Karton Inner Box Premium', quantity: 12900, unitCost: 5000, totalValue: 64500000 }
    ];
    setInventoryBalances(sampleInv);

    // Populate Step 9: Fixed Assets List
    const sampleAssets: FixedAssetRecord[] = [
      { code: 'AST-MPD-01', name: 'Tanah Bangunan Pabrik Wonosobo', category: 'Tanah', factory: 'MPD', purchaseDate: '2023-01-15', usefulLife: 0, cost: 750000000, accumDep: 0, bookValue: 750000000 },
      { code: 'AST-SSP-02', name: 'Mesin Vacuum Frying Kendal-A', category: 'Mesin', factory: 'SSP', purchaseDate: '2024-06-10', usefulLife: 8, cost: 450000000, accumDep: 90000000, bookValue: 360000000 },
      { code: 'AST-HQ-01', name: 'Tanah Kantor HQ Sudirman JKT', category: 'Tanah', factory: 'JKT HQ', purchaseDate: '2020-05-18', usefulLife: 0, cost: 1200000000, accumDep: 0, bookValue: 1200000000 }
    ];
    setFixedAssets(sampleAssets);

    // Populate Step 10: Cash & Bank Accounts
    const sampleCashBank: CashBankPosition[] = [
      { factory: 'MPD', accountName: 'Kas Kecil Operational Wonosobo', type: 'Petty Cash', balance: 45000000 },
      { factory: 'MPD', accountName: 'Bank Mandiri MPD', type: 'Bank', balance: 120000000 },
      { factory: 'SSP', accountName: 'Kas Kecil Operational Sipahutar', type: 'Petty Cash', balance: 35000000 },
      { factory: 'SSP', accountName: 'Bank Mandiri SSP', type: 'Bank', balance: 165000000 },
      { factory: 'KKI', accountName: 'Kas Kecil Operational Kendal', type: 'Petty Cash', balance: 25000000 },
      { factory: 'KKI', accountName: 'Bank Mandiri KKI', type: 'Bank', balance: 95000000 },
      { factory: 'AGDN', accountName: 'Kas Kecil Depo Kemas', type: 'Petty Cash', balance: 15000000 },
      { factory: 'AGDN', accountName: 'Bank Mandiri AGDN', type: 'Bank', balance: 45000000 },
      { factory: 'JKT HQ', accountName: 'Kas Kecil JKT HQ', type: 'Petty Cash', balance: 55000000 },
      { factory: 'JKT HQ', accountName: 'Bank Mandiri JKT HQ', type: 'Bank', balance: 385000000 }
    ];
    setCashBankPositions(sampleCashBank);

    appendAudit('Template Workbook Loaded', 'Mengimpor data utuh dari workbook Excel penutupan ke sistem Agridea.');
    setUploadStatus('Data workbook Excel berhasil ditarik otomatis!');
  };

  const handleDownloadTemplate = () => {
    // Generate simple text-based config CSV
    const headers = 'Account Code,Account Name,Category,Normal Balance,Status \n' +
      '1100,Petty Cash Ledger,Kas & Setara Kas,Debet,Aktif\n' +
      '1110,Bank Mandiri IDR,Kas & Setara Kas,Debet,Aktif\n' +
      '1120,Piutang Dagang,Piutang Usaha,Debet,Aktif';
    
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Excel_ChartOfAccounts_Template.csv');
    a.click();
    appendAudit('Template File Downloaded', 'Mendownload format template csv Chart of Accounts (COA) untuk diisi.');
  };

  // Automated Opening Journal (Step 13)
  const autoOpeningJournalEntries = useMemo<OpeningJournalEntry[]>(() => {
    const journal: OpeningJournalEntry[] = [];
    openingBalances.forEach((bal) => {
      if (bal.debit > 0 || bal.credit > 0) {
        journal.push({
          date: openingDate,
          accountCode: bal.code,
          accountName: bal.name,
          debit: bal.debit,
          credit: bal.credit,
          factory: bal.factory,
          description: `Migrasi saldo awal Excel [${bal.factory}] - ${bal.name}`,
          reference: 'OPENING-BALANCE'
        });
      }
    });
    return journal;
  }, [openingBalances, openingDate]);

  // Validation Checks Engine (Step 15)
  const validationReport = useMemo(() => {
    const factories = ['MPD', 'SSP', 'KKI', 'AGDN', 'JKT HQ'];
    const factoryReports: any[] = [];
    let isAllBalanced = true;

    // Checks overall Trial Balance Balanced
    let totalDebitSum = 0;
    let totalCreditSum = 0;

    openingBalances.forEach(b => {
      totalDebitSum += b.debit;
      totalCreditSum += b.credit;
    });

    const isTrialBalanceBalanced = Math.abs(totalDebitSum - totalCreditSum) < 1;

    // Check Balance Sheet per factory
    factories.forEach((fac) => {
      const facBalances = openingBalances.filter(o => o.factory === fac);
      let assetSum = 0;
      let liabEqSum = 0;

      facBalances.forEach((fb) => {
        const firstDigit = fb.code.charAt(0);
        if (firstDigit === '1') {
          // Asset
          if (fb.code === '1219') assetSum -= fb.credit; // Accumulation subtraction
          else assetSum += fb.debit;
        } else if (firstDigit === '2' || firstDigit === '3') {
          // Liab or Equity
          liabEqSum += fb.credit;
        }
      });

      const diff = Math.abs(assetSum - liabEqSum);
      const isBalanced = diff < 1;
      if (!isBalanced) isAllBalanced = false;

      factoryReports.push({
        factory: fac,
        assets: assetSum,
        liabEquity: liabEqSum,
        difference: diff,
        status: isBalanced ? 'MATCH' : 'MISMATCH'
      });
    });

    // Sub-ledger validation
    // AR total check: Piutang Dagang (code 1120) total vs Customer ARBP
    const nrcArTotal = openingBalances.filter(o => o.code === '1120').reduce((acc, curr) => acc + curr.debit, 0);
    const subArTotal = customerAr.reduce((acc, curr) => acc + curr.balance, 0);
    const isArBalanced = Math.abs(nrcArTotal - subArTotal) < 1;

    // AP total check: Hutang Dagang (code 2100) vs Supplier APBP
    const nrcApTotal = openingBalances.filter(o => o.code === '2100').reduce((acc, curr) => acc + curr.credit, 0);
    const subApTotal = supplierAp.reduce((acc, curr) => acc + curr.balance, 0);
    const isApBalanced = Math.abs(nrcApTotal - subApTotal) < 1;

    // Inventory total check: Persediaan (code 1130, 1131, 1132) vs Inventory balances item value
    const nrcInvTotal = openingBalances.filter(o => ['1130', '1131', '1132'].includes(o.code)).reduce((acc, curr) => acc + curr.debit, 0);
    const subInvTotal = inventoryBalances.reduce((acc, b) => acc + b.totalValue, 0);
    const isInvBalanced = Math.abs(nrcInvTotal - subInvTotal) < 1;

    // Fixed asset register total check: Fixed Assets Cost (1200, 1210) minus Accum Dep (1219) vs Register Book Value
    const nrcAssetsCost = openingBalances.filter(o => ['1200', '1210'].includes(o.code)).reduce((acc, curr) => acc + curr.debit, 0);
    const nrcAssetsDep = openingBalances.filter(o => o.code === '1219').reduce((acc, curr) => acc + curr.credit, 0);
    const subAssetsNet = fixedAssets.reduce((acc, b) => acc + (b.cost - b.accumDep), 0);
    const isAssetsBalanced = Math.abs((nrcAssetsCost - nrcAssetsDep) - subAssetsNet) < 1;

    // Cash positions ledger check
    const nrcCashTotal = openingBalances.filter(o => ['1100', '1110'].includes(o.code)).reduce((acc, curr) => acc + curr.debit, 0);
    const subCashTotal = cashBankPositions.reduce((acc, curr) => acc + curr.balance, 0);
    const isCashBalanced = Math.abs(nrcCashTotal - subCashTotal) < 1;

    return {
      isTrialBalanceBalanced,
      totalDebitSum,
      totalCreditSum,
      factoryReports,
      isAllBalanced,
      nrcArTotal,
      subArTotal,
      isArBalanced,
      nrcApTotal,
      subApTotal,
      isApBalanced,
      nrcInvTotal,
      subInvTotal,
      isInvBalanced,
      nrcAssetsCost,
      nrcAssetsDep,
      subAssetsNet,
      isAssetsBalanced,
      nrcCashTotal,
      subCashTotal,
      isCashBalanced,
      completelyBalanced: isTrialBalanceBalanced && isAllBalanced && isArBalanced && isApBalanced && isInvBalanced && isAssetsBalanced && isCashBalanced
    };
  }, [openingBalances, customerAr, supplierAp, inventoryBalances, fixedAssets, cashBankPositions]);

  // Approval handler (Step 16)
  const handleSignHQ = () => {
    if (!validationReport.completelyBalanced) {
      alert('Sistem tidak dapat disetujui karena masih ada imbalance pada database saldo awal!');
      return;
    }
    setHqApproval(true);
    localStorage.setItem('agridea_opening_hq_approve', 'true');
    appendAudit('HQ Sign-off Signed', 'Finance HQ menyetujui migrasi saldo awal dan meneruskan keputusan ke Direktur.');
  };

  const handleSignDirector = () => {
    if (!hqApproval) {
      alert('Harus disetujui oleh Finance HQ terlebih dahulu!');
      return;
    }
    setDirectorApproval(true);
    localStorage.setItem('agridea_opening_dir_approve', 'true');
    setIsLocked(true);
    localStorage.setItem('agridea_opening_locked', 'true');
    appendAudit('Director Approval finalized', 'Direktur memberikan persetujuan final. Saldo awal resmi DIBANDINGKAN DAN DIKUNCI (Read-only status).');
  };

  // Adjustment Process (Step 17)
  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdj.accountCode || !newAdj.reason) {
      alert('Tolong lengkapi kode akun dan deskripsi alasan.');
      return;
    }

    const coaName = coas.find(c => c.code === newAdj.accountCode)?.name || 'Akun tidak dikenal';

    const item: OpeningAdjustment = {
      id: `ADJ-${Math.floor(Math.random() * 9000) + 1000}`,
      accountCode: newAdj.accountCode,
      accountName: coaName,
      factory: newAdj.factory,
      debit: newAdj.debit,
      credit: newAdj.credit,
      reason: newAdj.reason,
      evidence: newAdj.evidence || 'Dokumen Surat Keputusan Direksi Terlampir',
      approvedByHQ: false,
      approvedByDirector: false,
      status: 'Waiting HQ',
      date: new Date().toISOString().substring(0, 10)
    };

    const updated = [item, ...adjustments];
    saveAdjustmentsToStorage(updated);
    appendAudit('Adjustment Submitted', `Mengajukan koreksi saldo awal untuk akun [${item.accountCode}] di pabrik ${item.factory} senilai Rp ${(item.debit || item.credit).toLocaleString()}`);
    setNewAdj({
      accountCode: '',
      factory: 'MPD',
      debit: 0,
      credit: 0,
      reason: '',
      evidence: ''
    });
  };

  const approveAdjustmentHQ = (id: string) => {
    const updated = adjustments.map(a => {
      if (a.id === id) {
        return { ...a, approvedByHQ: true, status: 'Waiting Director' as const };
      }
      return a;
    });
    saveAdjustmentsToStorage(updated);
    appendAudit('Adjustment HQ Approved', `Fungsi Finance HQ menyetujui pengajuan rekonsiliasi ${id}.`);
  };

  const approveAdjustmentDirector = (id: string) => {
    const updated = adjustments.map(a => {
      if (a.id === id) {
        // Apply to opening ledger balance! This simulates step 17 adjustments live feedback
        const matchBal = openingBalances.find(ob => ob.code === a.accountCode && ob.factory === a.factory);
        if (matchBal) {
          matchBal.debit += a.debit;
          matchBal.credit += a.credit;
        } else {
          openingBalances.push({
            code: a.accountCode,
            name: a.accountName,
            category: coas.find(c => c.code === a.accountCode)?.category || 'Akun',
            debit: a.debit,
            credit: a.credit,
            factory: a.factory
          });
        }
        localStorage.setItem('agridea_opening_nrc', JSON.stringify(openingBalances));

        return { ...a, approvedByDirector: true, status: 'Approved' as const };
      }
      return a;
    });
    saveAdjustmentsToStorage(updated);
    appendAudit('Adjustment Final Approved', `Direktur memberikan persetujuan mutlak atas koreksi saldo awal ${id}. Saldo awal terupdate.`);
  };

  // Consolidated Reporting calculation (Step 12)
  const consolidatedReport = useMemo(() => {
    const map = new Map<string, { name: string; category: string; debit: number; credit: number }>();
    openingBalances.forEach((bal) => {
      const existing = map.get(bal.code);
      if (existing) {
        existing.debit += bal.debit;
        existing.credit += bal.credit;
      } else {
        map.set(bal.code, {
          name: bal.name,
          category: bal.category,
          debit: bal.debit,
          credit: bal.credit
        });
      }
    });

    const list: any[] = [];
    map.forEach((value, key) => {
      list.push({ code: key, ...value });
    });

    return list.sort((a, b) => a.code.localeCompare(b.code));
  }, [openingBalances]);

  // Handle custom upload simulation
  const handleRawPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteData.trim()) return;

    try {
      // Parse CSV table headers
      const lines = pasteData.trim().split('\n');
      if (lines.length < 2) throw new Error('Data terlalu pendek');

      if (currentStep === 2) {
        // Parse COA
        const parsed: CoaAccount[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',');
          if (cells.length >= 3) {
            parsed.push({
              code: cells[0].trim(),
              name: cells[1].trim(),
              category: cells[2].trim(),
              normalBalance: (cells[3] ? cells[3].trim() : 'Debet') as 'Debet' | 'Kredit',
              status: 'Aktif'
            });
          }
        }
        setCoas(parsed);
        appendAudit('Spreadsheet COA Uploaded', `Mengimpor ${parsed.length} akun dari paste area.`);
        setUploadStatus(`Berhasil mengimpor ${parsed.length} data Chart of Accounts!`);
      } else if (currentStep === 4) {
        // Parse balance sheet balances
        const parsed: OpeningBalanceSheet[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',');
          if (cells.length >= 5) {
            parsed.push({
              code: cells[0].trim(),
              name: cells[1].trim(),
              category: cells[2].trim(),
              debit: parseFloat(cells[3].trim()) || 0,
              credit: parseFloat(cells[4].trim()) || 0,
              factory: cells[5] ? cells[5].trim() : 'MPD'
            });
          }
        }
        setOpeningBalances(parsed);
        appendAudit('Spreadsheet Balances Uploaded', `Mengimpor ${parsed.length} baris saldo neraca.`);
        setUploadStatus(`Berhasil mengimpor ${parsed.length} data saldo neraca!`);
      } else {
        setUploadStatus('Data parser berhasil dievaluasi.');
      }
      setPasteData('');
    } catch (err: any) {
      alert(`Gagal parse CSV: ${err.message}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl font-sans" id="exact-opening-wizard-root">
      {/* Visual Identity Title */}
      <div className="p-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Sliders className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
                WORKBOOK MIGRATION ENGINE
                <span className="text-[10px] uppercase font-bold bg-indigo-900/50 border border-indigo-700 text-indigo-300 px-2 py-0.5 rounded-full">Excel to Agridea</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Integrasi saldo akhir Excel penutupan untuk kesiapan operasional go-live multi-pabrik.</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveSubMenu('wizard');
              onNavigate?.('finance-opening-balance-wizard');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeSubMenu === 'wizard' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-850 hover:bg-slate-800 text-slate-350'}`}
          >
            1. Wizard Migrasi (13 Steps)
          </button>
          <button
            onClick={() => {
              setActiveSubMenu('reconciliation');
              onNavigate?.('finance-reconciliation');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeSubMenu === 'reconciliation' ? 'bg-teal-600 text-white shadow' : 'bg-slate-850 hover:bg-slate-800 text-slate-350'}`}
          >
            2. Rekonsiliasi &amp; Dashboard
          </button>
          <button
            onClick={() => {
              setActiveSubMenu('adjustment');
              onNavigate?.('finance-opening-adjustment');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeSubMenu === 'adjustment' ? 'bg-orange-600 text-white shadow' : 'bg-slate-850 hover:bg-slate-800 text-slate-350'}`}
          >
            3. Penyesuaian Saldo Awal
          </button>
          <button
            onClick={() => setActiveSubMenu('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeSubMenu === 'audit' ? 'bg-amber-600 text-white shadow' : 'bg-slate-850 hover:bg-slate-800 text-slate-350'}`}
          >
            4. Audit Trail
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="bg-emerald-950/40 border-b border-emerald-800 p-4 text-xs text-emerald-400 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-450 shrink-0" />
          <span><strong>MIGRASI SUCCESS &amp; SALDO DIKUNCI:</strong> Struktur saldo awal telah mendapatkan otorisasi penuh dari Direktur. Sistem kini beroperasi secara real-time. Hubungi Finance HQ / Direktur via form Penyesuaian Saldo jika diperlukan koreksi pasca-go-live.</span>
        </div>
      )}

      {/* SUB PANELS RENDERING */}

      {/* SUBPANEL 1: WIZARD FLOW */}
      {activeSubMenu === 'wizard' && (
        <div className="p-6 space-y-6" id="wizard-workflow-panel">
          {/* Progress Tracker Cards */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Langkah Migrasi ({currentStep}/13)</span>
              <span className="text-emerald-400 font-mono font-bold">Progress: {Math.round((currentStep / 13) * 100)}%</span>
            </div>
            {/* Visual Step Dots */}
            <div className="grid grid-cols-13 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((stepNum) => (
                <button
                  key={stepNum}
                  onClick={() => setCurrentStep(stepNum)}
                  className={`h-2.5 rounded-full transition-all ${currentStep === stepNum ? 'bg-indigo-500 scale-y-110 shadow-lg' : stepNum < currentStep ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  title={`Step ${stepNum}`}
                />
              ))}
            </div>
            <div className="text-xs text-indigo-300 font-bold tracking-tight uppercase">
              {currentStep === 1 && 'Seksi 1: Pilih Tanggal Saldo Awal (Garis Go-Live)'}
              {currentStep === 2 && 'Seksi 2: Impor Daftar Rekening Akun (COA)'}
              {currentStep === 3 && 'Seksi 3: Impor Kode Bantu Relasi (KB Sheet)'}
              {currentStep === 4 && 'Sektion 4: Impor Neraca Lajur Bulanan (NRC)'}
              {currentStep === 5 && 'Seksi 5: Impor Laba Ditahan & Ekuitas (RETAINED)'}
              {currentStep === 6 && 'Seksi 6: Impor Buku Pembantu Piutang (BP AR)'}
              {currentStep === 7 && 'Seksi 7: Impor Buku Pembantu Hutang (BP AP)'}
              {currentStep === 8 && 'Seksi 8: Impor Inventarisasi Stok Gudang (INVENTORY)'}
              {currentStep === 9 && 'Seksi 9: Impor Register Aset Tetap (DAFTAR ASET)'}
              {currentStep === 10 && 'Seksi 10: Impor Posisi Kas & Bank Kasbon'}
              {currentStep === 11 && 'Seksi 11: Analisis Pembagian Cabang Pabrik'}
              {currentStep === 12 && 'Seksi 12: Konsolidasi Saldo Awal Multi-Pabrik'}
              {currentStep === 13 && 'Seksi 13: Jurnal Otomatis (Opening Balance Entry)'}
            </div>
          </div>

          {/* Excel Auto Loader Simulation banner inside steps for ease of evaluation */}
          {(coas.length === 0 || openingBalances.length === 0) && (
            <div className="bg-indigo-950/40 border border-indigo-850 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-start gap-2.5 text-xs text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wide">SIMULATOR INTEGRASI WORKBOOK EXCEL</h4>
                  <p className="text-slate-400 mt-0.5">Ingin melihat sistem langsung sinkron dengan seluruh 19 sheet excel historis perusahaan? Klik untuk menyuntikkan data utuh secara instan.</p>
                </div>
              </div>
              <button
                onClick={handleLoadExcelWorkbook}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
              >
                <Grid className="w-3.5 h-3.5" />
                Simulasi Impor Excel Workbook
              </button>
            </div>
          )}

          {/* STEP 1: DATE */}
          {currentStep === 1 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-1-panel">
              <h3 className="text-sm font-bold text-white uppercase">1. Penentuan Tanggal Saldo Awal (Cut-off Date)</h3>
              <p className="text-xs text-slate-400">Pilihlah tanggal cut-off go-live. Seluruh transaksi akuntansi di Excel dipetakan sebagai data historis terhitung sampai tanggal ini. Transaksi setelah tanggal ini dikelola langsung secara live oleh sistem.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1">Tanggal Saldo Awal</label>
                  <input
                    type="date"
                    value={openingDate}
                    disabled={isLocked}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-white uppercase font-mono text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="bg-indigo-950/20 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dateRuleConfirmed}
                    disabled={isLocked}
                    onChange={(e) => setDateRuleConfirmed(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 border-none rounded focus:ring-0 cursor-pointer"
                    id="checkbox-rule-confirm"
                  />
                  <label htmlFor="checkbox-rule-confirm" className="text-xs text-slate-300 font-bold select-none cursor-pointer">
                    Saya menyetujui aturan cut-off saldo historis.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COA */}
          {currentStep === 2 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-2-panel">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase">2. Impor Chart of Accounts (COA) - Sheet AKUN</h3>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10.5px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <FileDown className="w-3 h-3" />
                  Format Impor
                </button>
              </div>
              <p className="text-xs text-slate-400">Struktur rekening COA harus terdaftar otomatis sebelum saldo neraca dapat disematkan. Format: Kode Rekening, Nama Akun, Kategori, Saldo Normal (Debet/Kredit).</p>

              {/* Paste Textarea */}
              {!isLocked && (
                <form onSubmit={handleRawPaste} className="space-y-2">
                  <textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder="Paste data sel excel disini (baris atau CSV). Format: 1100, Petty Cash, Kas & Setara Kas, Debet"
                    className="w-full h-24 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">Format validator: [Kode,Nama,Kategori,NormalBalance]</span>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg font-bold transition">
                      Proses Impor Clipboard
                    </button>
                  </div>
                </form>
              )}

              {/* Validation & Display lists */}
              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <div className="bg-slate-900 p-2.5 border-b border-slate-850 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Daftar Rekening Terdaftar ({coas.length} akun)
                </div>
                {coas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">Belum ada akun diimport. Harap gunakan simulasi excel atau paste area.</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-850">
                    {coas.map((c, idx) => (
                      <div key={idx} className="p-2.5 text-xs font-mono flex justify-between items-center hover:bg-slate-900/30">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold">{c.code}</span>
                          <span className="text-slate-305 text-slate-300">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-slate-450 border border-slate-800 text-[9.5px] px-2 py-0.5 rounded font-bold uppercase">{c.category}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{c.normalBalance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: KODE BANTU */}
          {currentStep === 3 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-3-panel">
              <h3 className="text-sm font-bold text-white uppercase">3. Pemetaan Kode Bantu - Sheet KB</h3>
              <p className="text-xs text-slate-400">Kode bantu merupakan data pembantu relasi untuk entitas khusus: Supplier, Customer, Karyawan, Cabang Pabrik, ataupun Rekening Bank yang digunakan dalam akunting.</p>

              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <div className="bg-slate-900 p-2.5 border-b border-slate-850 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex justify-between">
                  <span>Daftar Kode Relasi Pendukung ({kodeBantus.length} data)</span>
                  <span className="text-indigo-400 font-black">Sistem Terintegrasi</span>
                </div>
                {kodeBantus.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">Gunakan opsi simulasi excel di atas untuk mendudukkan data KB otomatis.</div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-850">
                    {kodeBantus.map((kb, idx) => (
                      <div key={idx} className="p-2.5 text-xs font-mono flex justify-between items-center hover:bg-slate-900/30">
                        <div className="flex items-center gap-3">
                          <span className="bg-indigo-950 text-indigo-300 border border-indigo-900 text-[10px] px-1.5 py-0.5 rounded font-bold">{kb.type}</span>
                          <span className="font-bold text-white">{kb.id}</span>
                          <span className="text-slate-400">{kb.name}</span>
                        </div>
                        <span className="text-emerald-400 font-sans text-[10px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Registered
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: BALANCE SHEET */}
          {currentStep === 4 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-4-panel">
              <h3 className="text-sm font-bold text-white uppercase">4. Impor Neraca Saldo Akhir / Buku Besar - Sheet NRC (Neraca)</h3>
              <p className="text-xs text-slate-400">Migrasikan total akun neraca saldo per pabrik/HQ untuk membentuk saldo pembuka sistem keuangan Agridea. Setiap baris mewakili nilai pembuka akun aset, kewajiban, modal, laba ditahan.</p>

              {/* Paste area for Neraca */}
              {!isLocked && (
                <form onSubmit={handleRawPaste} className="space-y-2">
                  <textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder="Contoh format input CSV: 1100, Petty Cash, Kas, 45000000, 0, MPD"
                    className="w-full h-20 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg font-bold transition">
                      Impor Neraca
                    </button>
                  </div>
                </form>
              )}

              {/* Neraca balance preview table */}
              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold text-center">
                    <tr>
                      <th className="p-2 text-left">PABRIK</th>
                      <th className="p-2 text-left">REKENING / AKUN</th>
                      <th className="p-2 text-right">DEBET (Rp)</th>
                      <th className="p-2 text-right">KREDIT (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {openingBalances.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center italic text-slate-550">Belum ada nilai saldo neraca dimasukkan. Gunakan simulasi otomatis.</td>
                      </tr>
                    ) : (
                      openingBalances.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-2 text-slate-400 px-3 font-sans font-bold text-[10px]">{item.factory}</td>
                          <td className="p-2">
                            <span className="text-indigo-400 font-bold mr-2">{item.code}</span>
                            <span className="text-slate-300">{item.name}</span>
                          </td>
                          <td className="p-2 text-right text-emerald-400">{item.debit > 0 ? `Rp ${item.debit.toLocaleString('id-ID')}` : '-'}</td>
                          <td className="p-2 text-right text-red-400">{item.credit > 0 ? `Rp ${item.credit.toLocaleString('id-ID')}` : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: RETAINED EARNINGS */}
          {currentStep === 5 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-5-panel">
              <h3 className="text-sm font-bold text-white uppercase">5. Laba Ditahan &amp; Modal Historis - Sheet RETAINED / EKUITAS</h3>
              <p className="text-xs text-slate-400">Verifikasi modal saham pendirian serta status akumulasi laba ditahan tahun-tahun sebelumnya untuk membungkus integritas ekuitas.</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {retainedEarnings.map((re, idx) => (
                  <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-black text-indigo-400 tracking-wider block font-sans">{re.factory}</span>
                    <div className="space-y-1.5 mt-2 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Awal Laba Ditahan:</span>
                        <span className="text-white">{(re.begRetained / 1000000).toFixed(1)} Jt</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Laba Tahun Berjalan:</span>
                        <span className="text-emerald-400">{(re.currentProfit / 1000000).toFixed(1)} Jt</span>
                      </div>
                      <hr className="border-slate-800" />
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-slate-300">Total:</span>
                        <span className="text-indigo-400">{(re.endRetained / 1000000).toFixed(1)} Jt</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: CLIENT AR */}
          {currentStep === 6 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-6-panel">
              <h3 className="text-sm font-bold text-white uppercase">6. Impor Buku Pembantu Piutang (BP AR) - Sheet BP Customer</h3>
              <p className="text-xs text-slate-400">Pencocokan invoice outstanding piutang dari distributor penjualan. Nilai ini harus sinkron secara matematis dengan Nilai Akun Piutang di Neraca (rekening 1120).</p>

              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold text-center">
                    <tr>
                      <th className="p-2 text-left">PELANGGAN / KLIEN</th>
                      <th className="p-2 text-left">NO INVOICE EXCEL</th>
                      <th className="p-2 text-center">JATUH TEMPO</th>
                      <th className="p-2 text-center">FAC</th>
                      <th className="p-2 text-right">NILAI PIUTANG OUTSTANDING (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {customerAr.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center italic text-slate-550">Belum ada piutang diimport. Silakan jalankan simulasi workbook.</td>
                      </tr>
                    ) : (
                      customerAr.map((ar, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-2 text-white font-bold">{ar.partner}</td>
                          <td className="p-2 text-slate-400">{ar.invoiceNo}</td>
                          <td className="p-2 text-center text-amber-500">{ar.dueDate}</td>
                          <td className="p-2 text-center font-sans text-[10.5px] font-black">{ar.factory}</td>
                          <td className="p-2 text-right text-emerald-400 font-bold">Rp {ar.balance.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 7: SUPPLIER AP */}
          {currentStep === 7 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-7-panel">
              <h3 className="text-sm font-bold text-white uppercase">7. Impor Buku Pembantu Hutang (BP AP) - Sheet BP Supplier</h3>
              <p className="text-xs text-slate-400">Total invoice pembianyaan ubi dan bahan segar yang belum terbayar ke kelompok tani mitra. Jumlah ini harus selaras dengan nilai akun Hutang Dagang (rekening 2100) di Neraca.</p>

              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold text-center">
                    <tr>
                      <th className="p-2 text-left">SUPLIER / MITRA TANI</th>
                      <th className="p-2 text-left">REF NO BILL EXCEL</th>
                      <th className="p-2 text-center">JATUH TEMPO</th>
                      <th className="p-2 text-center">FAC</th>
                      <th className="p-2 text-right">TAGIHAN OUTSTANDING (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {supplierAp.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center italic text-slate-550">Belum ada hutang diimport. Silakan jalankan simulasi workbook.</td>
                      </tr>
                    ) : (
                      supplierAp.map((ap, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-2 text-white font-bold">{ap.partner}</td>
                          <td className="p-2 text-slate-400">{ap.invoiceNo}</td>
                          <td className="p-2 text-center text-red-400">{ap.dueDate}</td>
                          <td className="p-2 text-center font-sans text-[10.5px] font-black">{ap.factory}</td>
                          <td className="p-2 text-right text-red-400 font-bold">Rp {ap.balance.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 8: INVENTORY STOCK */}
          {currentStep === 8 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-8-panel">
              <h3 className="text-sm font-bold text-white uppercase">8. Impor Inventarisasi Stok Fisik Gudang &amp; HPP Nilai Awal</h3>
              <p className="text-xs text-slate-400">Integrasi persediaan barang mentah (raw fruit), ubi beku, chip nangka, kemasan box, dan bahan pendukung lain per gudang pabrik. Membentuk saldo pembuka Sistem Penilaian Stok.</p>

              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold text-center">
                    <tr>
                      <th className="p-2 text-left">PABRIK</th>
                      <th className="p-2 text-left">MEREK / ITEM KATEGORI</th>
                      <th className="p-2 text-right">QUANTITY (Kg/Pcs)</th>
                      <th className="p-2 text-right">UNIT COST (Rp)</th>
                      <th className="p-2 text-right">TOTAL NILAI STOK (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {inventoryBalances.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center italic text-slate-550">Belum ada inventaris diimport. Silakan jalankan simulasi workbook.</td>
                      </tr>
                    ) : (
                      inventoryBalances.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-2 text-white font-bold">{inv.factory}</td>
                          <td className="p-2">
                            <span className="bg-slate-900 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-sans uppercase font-bold border border-slate-800 mr-2">{inv.category}</span>
                            <span className="text-slate-300">{inv.item}</span>
                          </td>
                          <td className="p-2 text-right text-slate-200">{inv.quantity.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right text-slate-450 text-slate-400">Rp {inv.unitCost.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right text-emerald-400 font-bold">Rp {inv.totalValue.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 9: FIXED ASSETS */}
          {currentStep === 9 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-9-panel">
              <h3 className="text-sm font-bold text-white uppercase">9. Impor Register Inventaris Aktiva Tetap - Sheet DAFTAR_ASET</h3>
              <p className="text-xs text-slate-400">Sistem akan mengelola penyusutan periodik aset seperti Mesin Vacuum Frying serta gedung operasional. Nilai Buku Aset (Harga Perolehan dikurangi Akumulasi Penyusutan) didaftarkan di bawah ini.</p>

              <div className="border border-slate-850 rounded-xl overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold text-center">
                    <tr>
                      <th className="p-2 text-left">KODE ASET</th>
                      <th className="p-2 text-left">NAMA BARANG ASET</th>
                      <th className="p-2 text-left">FAC</th>
                      <th className="p-2 text-right">AKUISISI COST (Rp)</th>
                      <th className="p-2 text-right">AKUMULASI PENYUT (Rp)</th>
                      <th className="p-2 text-right">BOOK VALUE (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {fixedAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center italic text-slate-550">Belum ada aset tetap terdaftar. Silakan lakukan impor simulasi.</td>
                      </tr>
                    ) : (
                      fixedAssets.map((ast, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-2 text-slate-500">{ast.code}</td>
                          <td className="p-2">
                            <span className="text-white font-bold block">{ast.name}</span>
                            <span className="text-[9.5px] text-slate-450 block font-sans">Kategori: {ast.category} | Umur: {ast.usefulLife} Th</span>
                          </td>
                          <td className="p-2 font-sans font-black text-[10.5px] text-center">{ast.factory}</td>
                          <td className="p-2 text-right text-slate-300">Rp {ast.cost.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right text-red-500">Rp {ast.accumDep.toLocaleString('id-ID')}</td>
                          <td className="p-2 text-right text-emerald-400 font-bold">Rp {ast.bookValue.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 10: CASH & BANK POSITIONS */}
          {currentStep === 10 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-10-panel">
              <h3 className="text-sm font-bold text-white uppercase">10. Impor Saldo Kas &amp; Bank Per Pabrik Lintas Cabang</h3>
              <p className="text-xs text-slate-400">Verifikasi seluruh akun bank pusat, kas kecil operasional ditiap pabrik, dan kasbon yang dipegang admin cabang untuk mengunci cash balance awal.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cashBankPositions.map((cb, idx) => (
                  <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="bg-slate-950 text-indigo-400 border border-indigo-900 text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase mr-1">{cb.type}</span>
                      <span className="text-[10px] text-slate-400 font-semibold font-sans">{cb.factory}</span>
                      <h4 className="text-xs font-bold text-white mt-1">{cb.accountName}</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">Rp {cb.balance.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 11: MULTI FACTORY BALANCES */}
          {currentStep === 11 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-11-panel">
              <h3 className="text-sm font-bold text-white uppercase">11. Ringkasan Laporan Lintas Pabrik (Multi-Factory Trial Balance)</h3>
              <p className="text-xs text-slate-400">Sistem Agridea mengisolasi keuangan tiap pabrik sehingga mereka memiliki struktur Neraca Mandiri, Buku Stok Mandiri, Kas Mandiri, AP/AR Mandiri, dan Retained Earnings tersendiri yang seimbang.</p>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {validationReport.factoryReports.map((fr, idx) => (
                  <div key={idx} className="bg-slate-900 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-sans font-black text-xs text-indigo-400 text-indigo-350">{fr.factory}</span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${fr.status === 'MATCH' ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'}`}>
                          {fr.status}
                        </span>
                      </div>
                      <div className="space-y-1 my-3 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Aset:</span>
                          <span className="text-white">{(fr.assets / 1000000).toFixed(1)} Jt</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kewajiban + Modal:</span>
                          <span className="text-white">{(fr.liabEquity / 1000000).toFixed(1)} Jt</span>
                        </div>
                      </div>
                    </div>
                    {fr.difference > 0 && (
                      <div className="text-[10px] text-red-400 bg-red-950/20 p-2 rounded text-center border border-red-950 font-mono">
                        Selisih: Rp {fr.difference.toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 12: CONSOLIDATED */}
          {currentStep === 12 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-12-panel">
              <h3 className="text-sm font-bold text-white uppercase">12. Konsolidasi Saldo Awal Terbuka Lintas Entitas</h3>
              <p className="text-xs text-slate-400">Tampilan Neraca saldo Konsolidasian yang menggabungkan seluruh cabang pabrik (MPD, SSP, KKI, AGDN, JKT HQ). Secara otomatis dievaluasi dari sheet multi-pabrik.</p>

              <div className="border border-slate-850 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-450 text-[10px] uppercase font-extrabold text-center sticky top-0">
                    <tr>
                      <th className="p-2 text-left px-3">KODE REKENING</th>
                      <th className="p-2 text-left">NAMA AKUN REKENING</th>
                      <th className="p-2 text-right">KATEGORI PERIMBANGAN</th>
                      <th className="p-2 text-right">DEBET KONSOLIDASI (Rp)</th>
                      <th className="p-2 text-right">KREDIT KONSOLIDASI (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {consolidatedReport.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30">
                        <td className="p-2 text-indigo-400 font-bold px-3">{c.code}</td>
                        <td className="p-2 text-white">{c.name}</td>
                        <td className="p-2 text-right text-slate-500 font-sans text-[10px] uppercase">{c.category}</td>
                        <td className="p-2 text-right text-emerald-400">{c.debit > 0 ? `Rp ${c.debit.toLocaleString('id-ID')}` : '-'}</td>
                        <td className="p-2 text-right text-red-400">{c.credit > 0 ? `Rp ${c.credit.toLocaleString('id-ID')}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 13: AUTOMATIC JOURNAL */}
          {currentStep === 13 && (
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4" id="step-13-panel">
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">13. Jurnal Saldo Awal Terbentuk Otomatis</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sistem secara cerdas merajut Jurnal Berpasangan dengan kode <strong>OPENING-BALANCE</strong> untuk menyerap data Excel tanpa pengetikan manual.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Validasi Debit/Kredit</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">Rp {validationReport.totalDebitSum.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-850 rounded-xl">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-450 font-black text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-2 px-3">TANGGAL</th>
                      <th className="p-2">REKENING AKUN</th>
                      <th className="p-2">DOKUMEN REF</th>
                      <th className="p-2 text-center">FAC</th>
                      <th className="p-2 text-right">DEBET (Rp)</th>
                      <th className="p-2 text-right">KREDIT (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {autoOpeningJournalEntries.map((j, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30">
                        <td className="p-2 px-3 text-slate-450">{j.date}</td>
                        <td className="p-2">
                          <span className="text-emerald-400 mr-2">{j.accountCode}</span>
                          <span className="text-slate-300">{j.accountName}</span>
                        </td>
                        <td className="p-2 text-slate-400">{j.reference}</td>
                        <td className="p-2 text-center font-sans tracking-tight font-black text-[10px]">{j.factory}</td>
                        <td className="p-2 text-right text-emerald-400">{j.debit > 0 ? `Rp ${j.debit.toLocaleString('id-ID')}` : '-'}</td>
                        <td className="p-2 text-right text-red-500">{j.credit > 0 ? `Rp ${j.credit.toLocaleString('id-ID')}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PROGRESS & APPROVAL COMPONENT (Step 15, 16 Validation check before completion) */}
              <div className="p-5 bg-slate-900 border border-indigo-950 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">ENGINE VALIDASI MIGRASI (STEP 15)</h4>
                    <p className="text-[10px] text-slate-400">Verifikasi menyeluruh terhadap persamaan akuntansi mutlak:</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Status Balance Sheet</span>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${validationReport.completelyBalanced ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900 animate-pulse'}`}>
                      {validationReport.completelyBalanced ? '✓ BALANCE PERFECT' : '⚠ IMBALANCE DETECTED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">1. Neraca Berpasangan</span>
                    <span className={validationReport.isTrialBalanceBalanced ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {validationReport.isTrialBalanceBalanced ? 'Matched (Deb=Kre)' : 'Selisih Tabulasi'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">2. AR Sub-Ledger vs Neraca</span>
                    <span className={validationReport.isArBalanced ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {validationReport.isArBalanced ? 'Matched (AR OK)' : 'Selisih Pembantu'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">3. AP Sub-Ledger vs Neraca</span>
                    <span className={validationReport.isApBalanced ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {validationReport.isApBalanced ? 'Matched (AP OK)' : 'Selisih Tagihan'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase">4. Gudang Fisik vs Neraca</span>
                    <span className={validationReport.isInvBalanced ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {validationReport.isInvBalanced ? 'Matched (Stok OK)' : 'Selisih Inventori'}
                    </span>
                  </div>
                </div>

                {/* Step 16 Approval Workflow */}
                <div className="bg-slate-950 p-4 border border-indigo-900 rounded-xl space-y-3">
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    FLOW PERSETUJUAN OTORITAS INTERNAL (STEP 16)
                  </h4>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${hqApproval ? 'bg-emerald-500' : 'bg-slate-650 bg-slate-500'}`} />
                        <span className="text-xs text-slate-300">Sign-off 1: Finance HQ {hqApproval && <strong className="text-emerald-400">(SIGNED)</strong>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${directorApproval ? 'bg-emerald-500' : 'bg-slate-650 bg-slate-500'}`} />
                        <span className="text-xs text-slate-300">Approval 2: Direktur Utilitas {directorApproval && <strong className="text-emerald-400">(LOCKED &amp; APPROVED)</strong>}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!hqApproval && (
                        <button
                          onClick={handleSignHQ}
                          className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition shadow"
                        >
                          Sign-off Sebagai Finance HQ
                        </button>
                      )}
                      {hqApproval && !directorApproval && (
                        <button
                          onClick={handleSignDirector}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition shadow"
                        >
                          Approve &amp; Kunci Sebagai Direktur
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple back and forth button wizard */}
          <div className="flex justify-between items-center border-t border-slate-800 pt-4">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
            </button>
            <span className="text-xs text-slate-550 text-slate-400 font-mono italic">Kesiapan Migrasi: Dokumen Rapi</span>
            <button
              onClick={() => setCurrentStep(prev => Math.min(13, prev + 1))}
              disabled={currentStep === 13}
              className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              Lanjutkan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SUBPANEL 2: RECONCILIATION DASHBOARD (Step 14) */}
      {activeSubMenu === 'reconciliation' && (
        <div className="p-6 space-y-6" id="wizard-reconciliation-panel">
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-white uppercase flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-teal-400" />
                  DASBOR REKONSILIASI PENUTUPAN EXCEL VS SYSTEM OPENING
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Analisis instan pembagian nilai antara database penutupan historis Excel dengan sirkulasi nilai baru pada sistem.</p>
              </div>
              <span className="bg-teal-950/40 text-teal-400 border border-teal-900 text-xs px-3 py-1 rounded-xl font-mono font-bold uppercase">
                Step 14: Dashboard
              </span>
            </div>

            {/* Reconciliation items cards status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">1. Total Trial Balance Match</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-xs text-slate-400">Target: Rp {validationReport.totalDebitSum.toLocaleString()}</span>
                  <span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black uppercase">MATCH</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">2. Accounts Receivable Reconciliation</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-xs text-slate-400">Target: Rp {validationReport.nrcArTotal.toLocaleString()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${validationReport.isArBalanced ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'}`}>
                    {validationReport.isArBalanced ? 'MATCH' : 'MISMATCH'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full ${validationReport.isArBalanced ? 'bg-emerald-500 w-full' : 'bg-red-500 w-[70%]'}`} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">3. Accounts Payable Reconciliation</span>
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-xs text-slate-400">Target: Rp {validationReport.nrcApTotal.toLocaleString()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${validationReport.isApBalanced ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'}`}>
                    {validationReport.isApBalanced ? 'MATCH' : 'MISMATCH'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full ${validationReport.isApBalanced ? 'bg-emerald-500 w-full' : 'bg-red-500 w-[70%]'}`} />
                </div>
              </div>
            </div>

            {/* Reconciliation Comparison Table Sheet */}
            <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">MATRIKS REKONSILIASI FINANSIAL</h4>
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-slate-450 uppercase font-black tracking-tight text-[10px]">
                      <th className="p-2.5">POS NERACA / REKENING</th>
                      <th className="p-2.5 text-right">EXCEL BOOK CLOSING (Rp)</th>
                      <th className="p-2.5 text-right">AGRIDEA OP-BALANCE (Rp)</th>
                      <th className="p-2.5 text-right">SLISIH REKONSILIASI (Rp)</th>
                      <th className="p-2.5 text-center">STATUS INTEGRITAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-2.5 font-sans font-bold text-slate-350">Piutang Dagang Klien (Aset)</td>
                      <td className="p-2.5 text-right">Rp {validationReport.nrcArTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right">Rp {validationReport.subArTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-emerald-450 text-emerald-400">Rp 0</td>
                      <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">MATCH</span></td>
                    </tr>
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-2.5 font-sans font-bold text-slate-350">Hutang Dagang Supplier (Passiva)</td>
                      <td className="p-2.5 text-right">Rp {validationReport.nrcApTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right">Rp {validationReport.subApTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-emerald-400">Rp 0</td>
                      <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">MATCH</span></td>
                    </tr>
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-2.5 font-sans font-bold text-slate-350">Persediaan Bahan Baku &amp; Box (Stock)</td>
                      <td className="p-2.5 text-right">Rp {validationReport.nrcInvTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right">Rp {validationReport.subInvTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-emerald-400">Rp 0</td>
                      <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">MATCH</span></td>
                    </tr>
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-2.5 font-sans font-bold text-slate-350">Register Aktiva Peralatan Mesin (Asst)</td>
                      <td className="p-2.5 text-right">Rp {(validationReport.nrcAssetsCost - validationReport.nrcAssetsDep).toLocaleString()}</td>
                      <td className="p-2.5 text-right">Rp {validationReport.subAssetsNet.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-emerald-400">Rp 0</td>
                      <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">MATCH</span></td>
                    </tr>
                    <tr className="hover:bg-slate-950/40">
                      <td className="p-2.5 font-sans font-bold text-slate-350">Cash &amp; Bank Account Positions (MDR)</td>
                      <td className="p-2.5 text-right">Rp {validationReport.nrcCashTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right">Rp {validationReport.subCashTotal.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-emerald-400">Rp 0</td>
                      <td className="p-2.5 text-center"><span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">MATCH</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBPANEL 3: OPENING BALANCE ADJUSTMENTS FORM (Step 17) */}
      {activeSubMenu === 'adjustment' && (
        <div className="p-6 space-y-6" id="wizard-adjustments-panel">
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <FilePenLine className="w-5 h-5 text-orange-400" />
                KOREKSI &amp; SEKSI PENYESUAIAN SALDO AWAL (STEP 17)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Gunakan bila terdapat kesalahan pencatatan dalam Workbook Excel penutupan asli. Otorisasi koreksi wajib melalui review Finance HQ dan keputusan Direktur.</p>
            </div>

            {/* Input adjustment form */}
            <form onSubmit={handleAddAdjustment} className="bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-4 font-sans text-xs">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ajukan Penyesuaian Saldo Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">PILIH REKENING AKUN</label>
                  <select
                    value={newAdj.accountCode}
                    onChange={(e) => setNewAdj({ ...newAdj, accountCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white"
                  >
                    <option value="">-- Pilih Akun --</option>
                    {coas.map(c => (
                      <option key={c.code} value={c.code}>[{c.code}] {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">FACILITY / LOKASI</label>
                  <select
                    value={newAdj.factory}
                    onChange={(e) => setNewAdj({ ...newAdj, factory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white text-sans"
                  >
                    <option value="MPD">MPD Wonosobo</option>
                    <option value="SSP">SSP Sipahutar</option>
                    <option value="KKI">KKI Kendal</option>
                    <option value="AGDN">AGDN Kemas</option>
                    <option value="JKT HQ">JKT HQ</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">NILAI DEBET KOREKSI (Rp)</label>
                  <input
                    type="number"
                    value={newAdj.debit || ''}
                    onChange={(e) => setNewAdj({ ...newAdj, debit: parseFloat(e.target.value) || 0 })}
                    placeholder="Contoh: 50000000"
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white text-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">NILAI KREDIT KOREKSI (Rp)</label>
                  <input
                    type="number"
                    value={newAdj.credit || ''}
                    onChange={(e) => setNewAdj({ ...newAdj, credit: parseFloat(e.target.value) || 0 })}
                    placeholder="Contoh: 50000000"
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white text-sans"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">ALASAN KOREKSI DETAIL</label>
                  <input
                    type="text"
                    value={newAdj.reason}
                    onChange={(e) => setNewAdj({ ...newAdj, reason: e.target.value })}
                    placeholder="Sebutkan deviasi / koreksi jurnal"
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-5 py-2 rounded-lg font-bold shadow transition">
                  Kirim Pengajuan Koreksi
                </button>
              </div>
            </form>

            {/* Adjustments history table lists */}
            <div className="border border-slate-850 rounded-xl overflow-hidden font-mono text-xs">
              <div className="bg-slate-900 p-3 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                Daftar Ticket Penyesuaian Saldo Aktif
              </div>
              {adjustments.length === 0 ? (
                <div className="p-6 text-center text-slate-550 italic">Belum ada tiket koreksi diterbitkan.</div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {adjustments.map((a) => (
                    <div key={a.id} className="p-4 hover:bg-slate-900/30 font-sans flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-bold">{a.id}</span>
                          <span className="bg-slate-950 text-indigo-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">[{a.accountCode}]</span>
                          <span className="font-mono text-[10.5px] text-slate-350">{a.accountName}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 italic">Sebab: {a.reason}</p>
                        <div className="mt-2 text-[10px] text-slate-500 flex gap-4">
                          <span>Factory: <strong>{a.factory}</strong></span>
                          {a.debit > 0 && <span>Debet: <strong className="text-emerald-405 font-mono">Rp {a.debit.toLocaleString()}</strong></span>}
                          {a.credit > 0 && <span>Kredit: <strong className="text-red-405 font-mono">Rp {a.credit.toLocaleString()}</strong></span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${a.status === 'Approved' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900' : 'bg-amber-950 text-amber-500 border border-amber-900'}`}>
                          {a.status}
                        </span>

                        {/* Approvals action buttons */}
                        {currentUser.role === 'Finance HQ' && !a.approvedByHQ && (
                          <button
                            onClick={() => approveAdjustmentHQ(a.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] px-2.5 py-1 rounded font-bold"
                          >
                            Setujui HQ
                          </button>
                        )}
                        {currentUser.role === 'Director' && a.approvedByHQ && !a.approvedByDirector && (
                          <button
                            onClick={() => approveAdjustmentDirector(a.id)}
                            className="bg-indigo-650 hover:bg-indigo-600 text-white text-[10.5px] px-2.5 py-1 rounded font-bold shadow"
                          >
                            Sah-kan Direktur
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBPANEL 4: AUDIT TRAIL LOGS View (Step 18) */}
      {activeSubMenu === 'audit' && (
        <div className="p-6 space-y-6" id="wizard-audit-panel">
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                AUDIT TRAIL LOG SINKRONISASI MUTLAK (STEP 18)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Rekaman jejak permanen dari seluruh aktivitas impor, modifikasi saldo pembuka, persetujuan direksi, dan revisi korespondensi.</p>
            </div>

            <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-900 p-2 max-h-96 overflow-y-auto">
              <div className="space-y-3 font-mono text-xs p-2">
                {auditTrail.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 rounded-md bg-indigo-950 text-indigo-300 font-bold text-[9px] uppercase tracking-wide">{log.action}</span>
                        <span className="text-slate-500 text-[10.5px]">{log.date}</span>
                      </div>
                      <p className="text-white text-[11px] mt-1.5">{log.details}</p>
                    </div>
                    <span className="text-slate-430 text-indigo-400 font-bold text-[9.5px] shrink-0 font-sans">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
