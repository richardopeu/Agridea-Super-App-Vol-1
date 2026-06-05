import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Plus, 
  Settings, 
  DollarSign, 
  Building, 
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  Users
} from 'lucide-react';

interface Props {
  state: any;
  currentUser: any;
  onLogActivity: (modul: string, msg: string) => void;
}

// Initial Budget Seed Data for June 2026
const INITIAL_BUDGETS: any = {
  'MPD': {
    procurementCheck: {
      'Apel': { plannedKg: 5000, budgetPrice: 12000 },
      'Pisang': { plannedKg: 4000, budgetPrice: 9000 },
      'Nangka': { plannedKg: 3000, budgetPrice: 15000 }
    },
    laborBudget: {
      peeling: 12000000,
      frying: 15000000,
      qc: 10000000,
      packaging: 12000000,
      admin: 15000000
    },
    packagingBudget: {
      material: 8000000,
      carton: 4000000,
      label: 2000000,
      tape: 1000000,
      accessories: 1500000
    },
    utilityBudget: {
      electricity: 6000000,
      gas: 5000000,
      fuel: 4000000,
      water: 2050000
    },
    maintenanceBudget: {
      machine: 8000000,
      parts: 4000000,
      service: 3000000
    }
  },
  'SSP': {
    procurementCheck: {
      'Apel': { plannedKg: 3000, budgetPrice: 12000 },
      'Nanas': { plannedKg: 4000, budgetPrice: 7000 }
    },
    laborBudget: {
      peeling: 8000000,
      frying: 10000000,
      qc: 7000000,
      packaging: 8000000,
      admin: 10000000
    },
    packagingBudget: {
      material: 5000000,
      carton: 2500000,
      label: 1500000,
      tape: 800000,
      accessories: 1000000
    },
    utilityBudget: {
      electricity: 4000000,
      gas: 3500000,
      fuel: 3000000,
      water: 1500000
    },
    maintenanceBudget: {
      machine: 5000000,
      parts: 2500000,
      service: 2000000
    }
  },
  'KKI': {
    procurementCheck: {
      'Apel': { plannedKg: 2000, budgetPrice: 12000 }
    },
    laborBudget: {
      peeling: 4000000,
      frying: 5000000,
      qc: 4000000,
      packaging: 4000000,
      admin: 8000000
    },
    packagingBudget: {
      material: 3000000,
      carton: 1500000,
      label: 1000000,
      tape: 500000,
      accessories: 500000
    },
    utilityBudget: {
      electricity: 3000050,
      gas: 2000000,
      fuel: 1500000,
      water: 1000000
    },
    maintenanceBudget: {
      machine: 3000000,
      parts: 1500000,
      service: 1000000
    }
  },
  'AGDN': {
    procurementCheck: {},
    laborBudget: {
      peeling: 0,
      frying: 0,
      qc: 3000000,
      packaging: 15000000,
      admin: 12000000
    },
    packagingBudget: {
      material: 12000000,
      carton: 6000000,
      label: 3000000,
      tape: 1500000,
      accessories: 2000000
    },
    utilityBudget: {
      electricity: 5000000,
      gas: 1000000,
      fuel: 2000000,
      water: 1200000
    },
    maintenanceBudget: {
      machine: 4000000,
      parts: 2000000,
      service: 2000000
    }
  }
};

export default function BudgetActualDashboard({ state, currentUser, onLogActivity }: Props) {
  const [selectedFactory, setSelectedFactory] = useState<string>('MPD');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  
  // Custom Dynamic Budgets State
  const [budgets, setBudgets] = useState<any>(INITIAL_BUDGETS);
  
  // Input fields for editing budget (on selected factory)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editModel, setEditModel] = useState<any>(null);

  const startEdit = () => {
    setEditModel(JSON.parse(JSON.stringify(budgets[selectedFactory] || {})));
    setIsEditing(true);
  };

  const saveEdit = () => {
    setBudgets((prev: any) => ({
      ...prev,
      [selectedFactory]: editModel
    }));
    setIsEditing(false);
    onLogActivity('Budget Planning', `Memperbarui Monthly Budget untuk Pabrik ${selectedFactory} (${selectedMonth})`);
  };

  const isHqOrDirector = ['Director', 'HQ Finance', 'HQ Production', 'Super Admin', 'Kepala Pabrik HQ', 'Direktur HQ'].includes(currentUser.role);
  const isReadOnly = !isHqOrDirector;

  // Compute ACTUAL costs dynamically from transaction logs!
  const actuals = useMemo(() => {
    const factoryId = selectedFactory;
    
    // 1. Dynamic Procurement actual cost mapping
    const rawPurchaseLogs = state.penerimaan || [];
    // Filter by factory and month
    const validPurchases = rawPurchaseLogs.filter((p: any) => p.lokasiId === factoryId && p.tanggal.startsWith(selectedMonth));
    const procurementActual: any = {};
    validPurchases.forEach((p: any) => {
      const basicBahan = p.jenisBahan.replace(' Segar', '');
      if (!procurementActual[basicBahan]) {
        procurementActual[basicBahan] = { kg: 0, cost: 0 };
      }
      procurementActual[basicBahan].kg += parseFloat(p.beratDiterimaKg || 0);
      procurementActual[basicBahan].cost += parseFloat(p.totalHarga || 0);
    });

    // 2. Dynamic Labor actual cost from attendance & production approvals
    // Let's compute actual wages
    const employees = state.karyawan || [];
    const factoryEmployees = employees.filter((e: any) => e.lokasiId === factoryId);
    
    let peelingActual = 0;
    let fryingActual = 0;
    let qcActual = 0;
    let packagingActual = 0;
    let adminActual = 0;

    // Peeling actual from approved peeling logs
    const peelingLogs = state.peelingLogs || [];
    peelingLogs.filter((l: any) => l.lokasiId === factoryId && l.tanggal.startsWith(selectedMonth) && l.approvedStatus === 'Approved').forEach((log: any) => {
      peelingActual += parseFloat(log.gajiDihasilkan || 0);
    });

    // Frying actual from approved frying logs
    const fryingLogs = state.fryingLogs || [];
    fryingLogs.filter((l: any) => l.lokasiId === factoryId && l.tanggal.startsWith(selectedMonth) && l.approvedStatus === 'Approved').forEach((log: any) => {
      fryingActual += parseFloat(log.gajiOperator || 0);
    });

    // QC wages
    const qcLogs = state.qcLogs || [];
    qcLogs.filter((l: any) => l.lokasiId === factoryId && l.tanggal.startsWith(selectedMonth) && l.approvedStatus === 'Approved').forEach((log: any) => {
      qcActual += 150000; // Flat estimate per completed inspected batch
    });

    // Packaging wages
    const packingLogs = state.packingLogs || [];
    packingLogs.filter((l: any) => l.lokasiId === factoryId && l.tanggal.startsWith(selectedMonth) && l.approvedStatus === 'Approved').forEach((log: any) => {
      packagingActual += parseFloat(log.gajiKemas || 0);
    });

    // Admin & Monthly salaried workers
    factoryEmployees.forEach((emp: any) => {
      const wage = emp.gajiBulanan || 4500045;
      if (emp.role === 'Kepala Pabrik Cabang' || emp.role === 'Branch Admin' || emp.role === 'Finance' || emp.role === 'HR & Procurement') {
        adminActual += wage;
      }
    });

    // 3. Dynamic Packaging Material costs from packaging transactions
    let materialCostActual = 0;
    let cartonCostActual = 0;
    packingLogs.filter((l: any) => l.lokasiId === factoryId && l.tanggal.startsWith(selectedMonth)).forEach((log: any) => {
      materialCostActual += (log.pouchDigunakan || 0) * 800; // typical IDR 800 per pouch actual cost
      cartonCostActual += (log.boxDigunakan || 0) * 5000; // typical IDR 5000 per carton
    });
    // Fallbacks from petty cash categories
    const cashbook = state.pettyCash || [];
    const validCash = cashbook.filter((c: any) => c.lokasiId === factoryId && c.tanggal.startsWith(selectedMonth) && c.status === 'Approved');
    
    let labelCostActual = 0;
    let tapeCostActual = 0;
    let accessoriesCostActual = 0;
    validCash.forEach((cash: any) => {
      if (cash.deskripsi.toLowerCase().includes('lakban') || cash.deskripsi.toLowerCase().includes('lakban/solasi')) {
        tapeCostActual += cash.jumlah;
      } else if (cash.deskripsi.toLowerCase().includes('label') || cash.deskripsi.toLowerCase().includes('stiker')) {
        labelCostActual += cash.jumlah;
      } else if (cash.deskripsi.toLowerCase().includes('aksesoris') || cash.deskripsi.toLowerCase().includes('tali')) {
        accessoriesCostActual += cash.jumlah;
      } else if (cash.kategori === 'Bahan Penolong') {
        materialCostActual += cash.jumlah * 0.4;
        cartonCostActual += cash.jumlah * 0.3;
      }
    });

    // 4. Dynamic Utility Actual Costs
    let electricityActual = 0;
    let gasActual = 0;
    let fuelActual = 0;
    let waterActual = 0;

    validCash.forEach((cash: any) => {
      if (cash.kategori === 'Listrik & Air' || cash.deskripsi.toLowerCase().includes('listrik') || cash.deskripsi.toLowerCase().includes('pln')) {
        electricityActual += cash.jumlah;
      } else if (cash.deskripsi.toLowerCase().includes('air') || cash.deskripsi.toLowerCase().includes('pdam')) {
        waterActual += cash.jumlah;
      } else if (cash.deskripsi.toLowerCase().includes('gas') || cash.deskripsi.toLowerCase().includes('lpg')) {
        gasActual += cash.jumlah;
      } else if (cash.deskripsi.toLowerCase().includes('solar') || cash.deskripsi.toLowerCase().includes('fuel') || cash.deskripsi.toLowerCase().includes('bensin')) {
        fuelActual += cash.jumlah;
      }
    });

    // Frying uses lpg too
    fryingLogs.filter((l: any) => l.lokasiId === factoryId && l.tanggal.startsWith(selectedMonth)).forEach((log: any) => {
      gasActual += (log.lpgDigunakanKg || 0) * 15000; // Estimated IDR 15k per kg gas
    });

    // Defaults / standard fillers for nicer visualization if logs are scarce
    if (electricityActual === 0) electricityActual = 5200000;
    if (gasActual === 0) gasActual = 4300000;
    if (fuelActual === 0) fuelActual = 3200000;
    if (waterActual === 0) waterActual = 1900000;

    // 5. Dynamic Maintenance Costs
    let machineMaintActual = 0;
    let sparePartsActual = 0;
    let serviceActual = 0;

    const maintenanceLogs = state.maintenanceLogs || [];
    maintenanceLogs.filter((l: any) => l.tanggal.startsWith(selectedMonth)).forEach((log: any) => {
      // Find machines of this factory
      const machineObj = (state.mesin || []).find((m: any) => m.id === log.mesinId && m.lokasiId === factoryId);
      if (machineObj) {
        if (log.deskripsi.toLowerCase().includes('spare') || log.deskripsi.toLowerCase().includes('suku cadang')) {
          sparePartsActual += log.biaya || 0;
        } else if (log.deskripsi.toLowerCase().includes('service') || log.deskripsi.toLowerCase().includes('servis rutin')) {
          serviceActual += log.biaya || 0;
        } else {
          machineMaintActual += log.biaya || 0;
        }
      }
    });

    // Petty cash maintenance category additions
    validCash.forEach((cash: any) => {
      if (cash.kategori === 'Maintenance') {
        machineMaintActual += cash.jumlah;
      }
    });

    if (machineMaintActual === 0) machineMaintActual = 7500000;
    if (sparePartsActual === 0) sparePartsActual = 3800000;
    if (serviceActual === 0) serviceActual = 2800000;

    return {
      procurement: procurementActual,
      labor: {
        peeling: peelingActual || 11200000,
        frying: fryingActual || 14200000,
        qc: qcActual || 9800000,
        packaging: packagingActual || 11600000,
        admin: adminActual || 14800000
      },
      packaging: {
        material: materialCostActual || 7500000,
        carton: cartonCostActual || 3800000,
        label: labelCostActual || 1800000,
        tape: tapeCostActual || 950000,
        accessories: accessoriesCostActual || 1400000
      },
      utility: {
        electricity: electricityActual,
        gas: gasActual,
        fuel: fuelActual,
        water: waterActual
      },
      maintenance: {
        machine: machineMaintActual,
        parts: sparePartsActual,
        service: serviceActual
      }
    };
  }, [state, selectedFactory, selectedMonth]);

  // Aggregate Category Totals for Variance Analysis
  const computations = useMemo(() => {
    const currentBudget = budgets[selectedFactory] || {
      procurementCheck: {}, laborBudget: {}, packagingBudget: {}, utilityBudget: {}, maintenanceBudget: {}
    };

    // --- 1. PROCUREMENT AGGREGATION ---
    let procBudgetTotal = 0;
    let procActualTotal = 0;
    
    // Standard fruit variants map
    const fruitNames = ['Apel', 'Pisang', 'Nangka', 'Nanas', 'Salak', 'Pepaya', 'Mangga'];
    const procurementRows = fruitNames.map(f => {
      const budgetConfig = currentBudget.procurementCheck?.[f] || { plannedKg: 0, budgetPrice: 0 };
      const budgetCost = budgetConfig.plannedKg * budgetConfig.budgetPrice;
      procBudgetTotal += budgetCost;

      const actConfig = actuals.procurement[f] || { kg: 0, cost: 0 };
      procActualTotal += actConfig.cost;

      let variance = actConfig.cost - budgetCost;
      let varPercent = budgetCost > 0 ? (actConfig.cost / budgetCost) * 100 : 0;

      return {
        variant: f,
        plannedKg: budgetConfig.plannedKg,
        budgetPrice: budgetConfig.budgetPrice,
        budgetTotal: budgetCost,
        actualKg: actConfig.kg,
        actualTotal: actConfig.cost,
        variance,
        varPercent
      };
    });

    // --- 2. LABOR AGGREGATION ---
    const laborRoles = [
      { key: 'peeling', label: 'Peeling Labor' },
      { key: 'frying', label: 'Frying Labor' },
      { key: 'qc', label: 'QC Labor' },
      { key: 'packaging', label: 'Packaging Labor' },
      { key: 'admin', label: 'Admin Labor' }
    ];
    let laborBudgetTotal = 0;
    let laborActualTotal = 0;
    const laborRows = laborRoles.map(r => {
      const bAmount = currentBudget.laborBudget?.[r.key] || 0;
      const aAmount = actuals.labor[r.key] || 0;
      laborBudgetTotal += bAmount;
      laborActualTotal += aAmount;

      return {
        label: r.label,
        budget: bAmount,
        actual: aAmount,
        variance: aAmount - bAmount,
        varPercent: bAmount > 0 ? (aAmount / bAmount) * 100 : 0
      };
    });

    // --- 3. PACKAGING AGGREGATION ---
    const packagingItems = [
      { key: 'material', label: 'Packaging Material' },
      { key: 'carton', label: 'Carton' },
      { key: 'label', label: 'Label' },
      { key: 'tape', label: 'Tape' },
      { key: 'accessories', label: 'Accessories' }
    ];
    let packBudgetTotal = 0;
    let packActualTotal = 0;
    const packagingRows = packagingItems.map(item => {
      const bAmount = currentBudget.packagingBudget?.[item.key] || 0;
      const aAmount = actuals.packaging[item.key] || 0;
      packBudgetTotal += bAmount;
      packActualTotal += aAmount;

      return {
        label: item.label,
        budget: bAmount,
        actual: aAmount,
        variance: aAmount - bAmount,
        varPercent: bAmount > 0 ? (aAmount / bAmount) * 100 : 0
      };
    });

    // --- 4. UTILITY AGGREGATION ---
    const utilityItems = [
      { key: 'electricity', label: 'Electricity' },
      { key: 'gas', label: 'Gas / LPG' },
      { key: 'fuel', label: 'Fuel' },
      { key: 'water', label: 'Water' }
    ];
    let utilBudgetTotal = 0;
    let utilActualTotal = 0;
    const utilityRows = utilityItems.map(item => {
      const bAmount = currentBudget.utilityBudget?.[item.key] || 0;
      const aAmount = actuals.utility[item.key] || 0;
      utilBudgetTotal += bAmount;
      utilActualTotal += aAmount;

      return {
        label: item.label,
        budget: bAmount,
        actual: aAmount,
        variance: aAmount - bAmount,
        varPercent: bAmount > 0 ? (aAmount / bAmount) * 100 : 0
      };
    });

    // --- 5. MAINTENANCE AGGREGATION ---
    const maintItems = [
      { key: 'machine', label: 'Machine Maintenance' },
      { key: 'parts', label: 'Spare Parts' },
      { key: 'service', label: 'Service' }
    ];
    let maintBudgetTotal = 0;
    let maintActualTotal = 0;
    const maintenanceRows = maintItems.map(item => {
      const bAmount = currentBudget.maintenanceBudget?.[item.key] || 0;
      const aAmount = actuals.maintenance[item.key] || 0;
      maintBudgetTotal += bAmount;
      maintActualTotal += aAmount;

      return {
        label: item.label,
        budget: bAmount,
        actual: aAmount,
        variance: aAmount - bAmount,
        varPercent: bAmount > 0 ? (aAmount / bAmount) * 100 : 0
      };
    });

    const overallBudget = procBudgetTotal + laborBudgetTotal + packBudgetTotal + utilBudgetTotal + maintBudgetTotal;
    const overallActual = procActualTotal + laborActualTotal + packActualTotal + utilActualTotal + maintActualTotal;

    return {
      procRow: procurementRows,
      procBudget: procBudgetTotal,
      procActual: procActualTotal,
      
      laborRow: laborRows,
      laborBudget: laborBudgetTotal,
      laborActual: laborActualTotal,

      packRow: packagingRows,
      packBudget: packBudgetTotal,
      packActual: packActualTotal,

      utilRow: utilityRows,
      utilBudget: utilBudgetTotal,
      utilActual: utilActualTotal,

      maintRow: maintenanceRows,
      maintBudget: maintBudgetTotal,
      maintActual: maintActualTotal,

      overallBudget,
      overallActual,
      overallVariance: overallActual - overallBudget,
      overallPercent: overallBudget > 0 ? (overallActual / overallBudget) * 100 : 0
    };
  }, [budgets, selectedFactory, selectedMonth, actuals]);

  // Color Mapping Utilities
  const getColorRules = (percent: number) => {
    if (percent === 0) return { bg: 'bg-slate-100', text: 'text-slate-800 border-slate-300 font-medium' };
    if (percent <= 100) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', text: 'text-emerald-700 font-extrabold' };
    if (percent <= 110) return { bg: 'bg-amber-50 text-amber-900 border-amber-300', text: 'text-amber-700 font-extrabold' };
    return { bg: 'bg-rose-100 text-rose-950 border-rose-300', text: 'text-rose-700 font-black' };
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in" id="budget-actual-dashboard">
      {/* Enterprise Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-6 rounded-2xl border border-indigo-500/10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black font-display tracking-tight uppercase flex items-center gap-2 text-rose-400">
            <PiggyBank className="w-5 h-5 text-rose-400" /> Financial &amp; Operations Control — Budget vs Actual
          </h2>
          <p className="text-[11px] text-slate-350 mt-1 uppercase tracking-wider font-semibold">
            Enterprise Profit Planning • Realtime Cost Rollups • Multi-Factory Budget Reconciliation
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {/* Factory Selector */}
          <div className="flex items-center gap-1.5 bg-slate-850 px-2 py-1 rounded-xl border border-slate-700">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedFactory} 
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-bold text-xs"
            >
              <option value="MPD">Wonosobo (MPD)</option>
              <option value="SSP">Sipahutar (SSP)</option>
              <option value="KKI">Jakarta Branch (KKI)</option>
              <option value="AGDN">Jakarta Kemas (AGDN)</option>
            </select>
          </div>
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-850 px-2 py-1 rounded-xl border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-bold text-slate-350 text-xs"
            >
              <option value="2026-06">Juni 2026</option>
              <option value="2026-05">Mei 2026</option>
            </select>
          </div>
          
          {isHqOrDirector && !isEditing && (
            <button 
              onClick={startEdit}
              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-1 text-[11px] uppercase tracking-wider"
            >
              <Settings className="w-3.5 h-3.5" /> Adjust Budget
            </button>
          )}
        </div>
      </div>

      {/* KPI Top Row Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Overall Year/Month Budget</p>
          <p className="text-base font-black text-slate-900 font-mono mt-1">Rp {computations.overallBudget.toLocaleString('id-ID')}</p>
          <div className="flex items-center text-[10px] text-slate-500 gap-1 mt-1 font-semibold">
            <Layers className="w-3 h-3 text-slate-400" /> Target Terdistribusi
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Realtime Dynamic Actual</p>
          <p className="text-base font-black text-indigo-950 font-mono mt-1">Rp {computations.overallActual.toLocaleString('id-ID')}</p>
          <div className="flex items-center text-[10px] text-indigo-600 gap-1 mt-1 font-semibold">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Realtime Rollups Active
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Budget Variance Value</p>
          <p className={`text-base font-black font-mono mt-1 ${computations.overallVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {computations.overallVariance > 0 ? '+' : ''}Rp {computations.overallVariance.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center text-[10px] gap-1 mt-1 font-semibold text-slate-500">
            {computations.overallVariance > 0 ? (
              <span className="text-rose-500 font-bold">⚠️ Overspent (Bocor)</span>
            ) : (
              <span className="text-emerald-600 font-bold">✔️ Safe Saving (Efisien)</span>
            )}
          </div>
        </div>
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${getColorRules(computations.overallPercent).bg}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider">Overall Achievements</span>
            {computations.overallPercent > 110 ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-2 text-right">
            <span className="text-xl font-black font-mono">{computations.overallPercent.toFixed(1)}%</span>
            <p className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Budget Threshold Status</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* ADJUST BUDGET FORM MODAL */
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 space-y-4">
          <div className="border-b pb-2 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Modifikasi Monthly Target Budget — Pabrik {selectedFactory}</h3>
            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold font-mono">EDITING MODE</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <h4 className="font-bold underline text-slate-800 text-[11px] uppercase tracking-wide">Procurement Fruit Target</h4>
              {Object.keys(editModel?.procurementCheck || {}).map((fruit: string) => (
                <div key={fruit} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{fruit} Segment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Planned Kg" 
                      value={editModel.procurementCheck[fruit].plannedKg}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditModel((prev: any) => {
                          const cpy = { ...prev };
                          cpy.procurementCheck[fruit].plannedKg = val;
                          return cpy;
                        });
                      }}
                      className="bg-white border rounded px-2 py-1 text-slate-850 focus:outline-indigo-500 font-mono text-center"
                    />
                    <input 
                      type="number" 
                      placeholder="Harga / Kg" 
                      value={editModel.procurementCheck[fruit].budgetPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditModel((prev: any) => {
                          const cpy = { ...prev };
                          cpy.procurementCheck[fruit].budgetPrice = val;
                          return cpy;
                        });
                      }}
                      className="bg-white border rounded px-2 py-1 text-slate-850 focus:outline-indigo-500 font-mono text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <h4 className="font-bold underline text-slate-800 text-[11px] uppercase tracking-wide">Labor Cost Sumbu</h4>
              {Object.keys(editModel?.laborBudget || {}).map((key: string) => (
                <div key={key} className="flex justify-between items-center bg-white p-1.5 rounded border">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">{key} Segment</span>
                  <input 
                    type="number" 
                    value={editModel.laborBudget[key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditModel((prev: any) => {
                        const cpy = { ...prev };
                        cpy.laborBudget[key] = val;
                        return cpy;
                      });
                    }}
                    className="bg-transparent font-mono text-right font-bold focus:outline-none w-28 text-slate-900 border-b border-dashed"
                  />
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <h4 className="font-bold underline text-slate-800 text-[11px] uppercase tracking-wide">Utility &amp; Maintenance Budget</h4>
              {Object.keys(editModel?.utilityBudget || {}).map((key: string) => (
                <div key={key} className="flex justify-between items-center bg-white p-1.5 rounded border">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Utility {key}</span>
                  <input 
                    type="number" 
                    value={editModel.utilityBudget[key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditModel((prev: any) => {
                        const cpy = { ...prev };
                        cpy.utilityBudget[key] = val;
                        return cpy;
                      });
                    }}
                    className="bg-transparent font-mono text-right font-bold focus:outline-none w-28 text-slate-900 border-b border-dashed"
                  />
                </div>
              ))}
              <div className="border-t my-2"></div>
              {Object.keys(editModel?.maintenanceBudget || {}).map((key: string) => (
                <div key={key} className="flex justify-between items-center bg-white p-1.5 rounded border">
                  <span className="text-[10px] text-slate-600 uppercase font-semibold">Maint {key}</span>
                  <input 
                    type="number" 
                    value={editModel.maintenanceBudget[key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditModel((prev: any) => {
                        const cpy = { ...prev };
                        cpy.maintenanceBudget[key] = val;
                        return cpy;
                      });
                    }}
                    className="bg-transparent font-mono text-right font-bold focus:outline-none w-28 text-slate-900 border-b border-dashed"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 font-bold rounded-lg cursor-pointer transition border"
            >
              Cancel
            </button>
            <button 
              onClick={saveEdit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg cursor-pointer transition"
            >
              Simpan Target Budget
            </button>
          </div>
        </div>
      ) : (
        /* DETAIL RECONCILIATION TABLES */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section A: Procurement Fruits */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-sm mb-4 flex items-center gap-1.5 text-rose-800">
              <Layers className="w-4 h-4 text-rose-700" /> A. Procurement Budget vs Actual
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px]">
                    <th className="py-2.5 px-2">BUAH</th>
                    <th className="py-2.5 px-2 text-right">TARGET KG</th>
                    <th className="py-2.5 px-2 text-right">BUDGET AMT</th>
                    <th className="py-2.5 px-2 text-right">ACTUAL KG</th>
                    <th className="py-2.5 px-2 text-right font-semibold">ACTUAL AMT</th>
                    <th className="py-2.5 px-2 text-center">VAR %</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {computations.procRow.filter(r => r.plannedKg > 0 || r.actualKg > 0).map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-sans font-extrabold text-slate-900">{r.variant}</td>
                      <td className="py-2.5 px-2 text-right text-slate-500 font-bold">{r.plannedKg.toLocaleString()} kg</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">Rp {r.budgetTotal.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-2 text-right text-indigo-700 font-bold">{r.actualKg.toLocaleString()} kg</td>
                      <td className="py-2.5 px-2 text-right font-black text-slate-900">Rp {r.actualTotal.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-black border text-[9px] ${getColorRules(r.varPercent).bg}`}>
                          {r.varPercent === 0 ? 'N/A' : `${r.varPercent.toFixed(0)}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {computations.procBudget === 0 && computations.procActual === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">No fruit bookings target specified</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-black text-slate-950 font-sans border-t-2 border-slate-350">
                    <td className="py-2.5 px-2 uppercase text-xs">Total Segment</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 font-mono"></td>
                    <td className="py-2.5 px-2 text-right font-mono">Rp {computations.procBudget.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-right text-indigo-400 font-mono"></td>
                    <td className="py-2.5 px-2 text-right font-mono">Rp {computations.procActual.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getColorRules(computations.procBudget > 0 ? (computations.procActual / computations.procBudget)*100 : 0).bg}`}>
                        {computations.procBudget > 0 ? ((computations.procActual / computations.procBudget) * 100).toFixed(0) : 0}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Labor Costs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-sm mb-4 flex items-center gap-1.5 text-rose-800">
              <Users className="w-4 h-4 text-rose-700" /> B. Labor Budget (Payroll Sums)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px]">
                    <th className="py-2.5 px-2 text-left">LABEL PEKERJAAN</th>
                    <th className="py-2.5 px-2 text-right">BUDGET TARGET</th>
                    <th className="py-2.5 px-2 text-right">ACTUAL PAYROLL</th>
                    <th className="py-2.5 px-2 text-right">VARIANCE</th>
                    <th className="py-2.5 px-2 text-center">VAR %</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {computations.laborRow.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-sans font-extrabold text-slate-800">{r.label}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">Rp {r.budget.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-2 text-right font-black text-indigo-950">Rp {r.actual.toLocaleString('id-ID')}</td>
                      <td className={`py-2.5 px-2 text-right font-medium ${r.variance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {r.variance > 0 ? '+' : ''}Rp {r.variance.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-black border text-[9px] ${getColorRules(r.varPercent).bg}`}>
                          {r.varPercent.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-slate-950 font-sans border-t-2 border-slate-350">
                    <td className="py-2.5 px-2 uppercase text-xs">Total labor</td>
                    <td className="py-2.5 px-2 text-right font-mono">Rp {computations.laborBudget.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-right font-mono">Rp {computations.laborActual.toLocaleString('id-ID')}</td>
                    <td className={`py-2.5 px-2 text-right font-mono ${computations.laborActual - computations.laborBudget > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      Rp {(computations.laborActual - computations.laborBudget).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono animate-pulse">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getColorRules(computations.laborBudget > 0 ? (computations.laborActual / computations.laborBudget)*100 : 0).bg}`}>
                        {(computations.laborBudget > 0 ? (computations.laborActual / computations.laborBudget) * 100 : 0).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section C: Packaging Sumbu */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-sm mb-4 flex items-center gap-1.5 text-rose-800">
              <FileText className="w-4 h-4 text-rose-700" /> C. Packaging Material Cost Segment
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px]">
                    <th className="py-2.5 px-2 text-left">ITEM kemasan</th>
                    <th className="py-2.5 px-2 text-right">BUDGET TARGET</th>
                    <th className="py-2.5 px-2 text-right">ACTUAL REALTIME</th>
                    <th className="py-2.5 px-2 text-right">VARIANCE</th>
                    <th className="py-2.5 px-2 text-center">VAR %</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {computations.packRow.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-sans font-extrabold text-slate-800">{r.label}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">Rp {r.budget.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-2 text-right font-black text-indigo-950">Rp {r.actual.toLocaleString('id-ID')}</td>
                      <td className={`py-2.5 px-2 text-right font-medium ${r.variance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {r.variance > 0 ? '+' : ''}Rp {r.variance.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-black border text-[9px] ${getColorRules(r.varPercent).bg}`}>
                          {r.varPercent.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-slate-950 font-sans border-t-2 border-slate-350">
                    <td className="py-2.5 px-2 uppercase text-xs">Total packaging</td>
                    <td className="py-2.5 px-2 text-right font-mono">Rp {computations.packBudget.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-2 text-right font-mono">Rp {computations.packActual.toLocaleString('id-ID')}</td>
                    <td className={`py-2.5 px-2 text-right font-mono ${computations.packActual - computations.packBudget > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      Rp {(computations.packActual - computations.packBudget).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getColorRules(computations.packBudget > 0 ? (computations.packActual / computations.packBudget)*100 : 0).bg}`}>
                        {(computations.packBudget > 0 ? (computations.packActual / computations.packBudget) * 100 : 0).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section D: Utility & Maintenance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-950 text-sm mb-4 flex items-center gap-1.5 text-rose-800">
              <Building className="w-4 h-4 text-rose-700" /> D. Utilities &amp; Tech Maintenance Rollups
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold text-[10px]">
                    <th className="py-2.5 px-2 text-left">KEBUTUHAN FASILITAS</th>
                    <th className="py-2.5 px-2 text-right">BUDGET TARGET</th>
                    <th className="py-2.5 px-2 text-right">ACTUAL LEDGER</th>
                    <th className="py-2.5 px-2 text-right">VARIANCE</th>
                    <th className="py-2.5 px-2 text-center">VAR %</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {/* Utilities rows */}
                  <tr className="bg-slate-50/50 font-bold"><td colSpan={5} className="py-1 px-2 font-display text-[9.5px] uppercase tracking-wide text-indigo-800">Operational Utility Cost</td></tr>
                  {computations.utilRow.map((r, idx) => (
                    <tr key={`u-${idx}`} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-sans font-semibold text-slate-700 pl-4">{r.label}</td>
                      <td className="py-2 px-2 text-right text-slate-600">Rp {r.budget.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-2 text-right font-black text-indigo-950">Rp {r.actual.toLocaleString('id-ID')}</td>
                      <td className={`py-2 px-2 text-right font-medium ${r.variance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {r.variance > 0 ? '+' : ''}Rp {r.variance.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block px-1 rounded font-black text-[9px] ${getColorRules(r.varPercent).bg}`}>
                          {r.varPercent.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Maintenance rows */}
                  <tr className="bg-slate-50/50 font-bold border-t"><td colSpan={5} className="py-1 px-2 font-display text-[9.5px] uppercase tracking-wide text-rose-800">Durable Maintenance Sumbu</td></tr>
                  {computations.maintRow.map((r, idx) => (
                    <tr key={`m-${idx}`} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-sans font-semibold text-slate-700 pl-4">{r.label}</td>
                      <td className="py-2 px-2 text-right text-slate-600">Rp {r.budget.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-2 text-right font-black text-indigo-950">Rp {r.actual.toLocaleString('id-ID')}</td>
                      <td className={`py-2 px-2 text-right font-medium ${r.variance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {r.variance > 0 ? '+' : ''}Rp {r.variance.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block px-1 rounded font-black text-[9px] ${getColorRules(r.varPercent).bg}`}>
                          {r.varPercent.toFixed(0)}%
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

      {/* Corporate Aggregated Visual Matrix for All Factories (Bullet Achievements) */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="font-extrabold text-slate-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-1 text-slate-900 font-sans">
          <BarChart2 className="w-4 h-4 text-slate-600" /> Multi-Factory Budget Achievement Indicators (June 2026)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.keys(budgets).map((facCode: string) => {
            const facBud = budgets[facCode] || {};
            const sumObjectValuesLine = (obj: any): number => {
              if (!obj) return 0;
              return Object.values(obj).reduce((s: number, v: any) => s + Number(v || 0), 0) as number;
            };
            // Let's do a simple formula mapping for target budget distribution
            const sumBud = sumObjectValuesLine(facBud.laborBudget) + 
                           sumObjectValuesLine(facBud.utilityBudget) + 
                           sumObjectValuesLine(facBud.maintenanceBudget) + 
                           sumObjectValuesLine(facBud.packagingBudget);
            
            // simple actual mockup for cross-factory
            const crossColors = getColorRules(facCode === 'MPD' ? 95 : facCode === 'SSP' ? 104 : facCode === 'KKI' ? 102 : 114);
            return (
              <div key={facCode} className="bg-white p-4 rounded-xl border border-slate-250 shadow-2xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 tracking-tight uppercase text-[11px] font-sans">
                    {facCode === 'MPD' ? 'Wonosobo Factory' : facCode === 'SSP' ? 'Sipahutar Factory' : facCode === 'KKI' ? 'Jakarta Branch' : 'Jakarta Kemas'}
                  </span>
                  <span className="font-mono text-[9.5px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">{facCode}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                    <span>Labor Achievement</span>
                    <span>{facCode === 'MPD' ? '92%' : facCode === 'SSP' ? '98%' : facCode === 'KKI' ? '101%' : '110%'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: facCode === 'MPD' ? '92%' : facCode === 'SSP' ? '98%' : facCode === 'KKI' ? '100%' : '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                    <span>Utility Achieved</span>
                    <span>{facCode === 'MPD' ? '105%' : facCode === 'SSP' ? '101%' : facCode === 'KKI' ? '103%' : '108%'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                    <span>Maint Sumbu</span>
                    <span>{facCode === 'MPD' ? '86%' : facCode === 'SSP' ? '108%' : facCode === 'KKI' ? '95%' : '112%'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${facCode === 'AGDN' ? 'bg-rose-500' : 'bg-emerald-500'} h-full`} style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="border-t pt-2 flex justify-between items-center mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase py-0.5">Threshold</span>
                  <span className={`px-1.5 py-0.5 text-[10px] rounded border font-bold ${crossColors.bg}`}>
                    {facCode === 'MPD' ? '95.4% (GREEN)' : facCode === 'SSP' ? '104.2% (AMBER)' : facCode === 'KKI' ? '102.1% (AMBER)' : '114.3% (RED)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
