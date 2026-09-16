/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sliders,
  TrendingUp,
  TrendingDown,
  Database,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  FileText,
  AlertTriangle,
  Award,
  Users,
  Percent,
  Layers,
  Sparkles,
  Info,
  Factory,
  Search,
  CheckCircle2,
  Lock,
  DollarSign,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface WeeklyPeriod {
  weekNum: number;
  startDay: number;
  endDay: number;
  label: string;
}

export function getWeeklyPeriods(year: number, month: number): WeeklyPeriod[] {
  const totalDays = new Date(year, month, 0).getDate();
  const weeks: WeeklyPeriod[] = [];
  
  let firstFriday = 1;
  while (firstFriday <= 7) {
    const d = new Date(year, month - 1, firstFriday);
    if (d.getDay() === 5) {
      break;
    }
    firstFriday++;
  }
  
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mName = monthNamesShort[month - 1];
  
  weeks.push({
    weekNum: 1,
    startDay: 1,
    endDay: firstFriday,
    label: `W1 (1-${firstFriday} ${mName})`
  });
  
  let currentDay = firstFriday + 1;
  let weekIndex = 2;
  
  while (currentDay <= totalDays) {
    const end = Math.min(currentDay + 6, totalDays);
    weeks.push({
      weekNum: weekIndex,
      startDay: currentDay,
      endDay: end,
      label: `W${weekIndex} (${currentDay}-${end} ${mName})`
    });
    currentDay += 7;
    weekIndex++;
  }
  
  return weeks;
}

interface ChipsOutputTarget {
  chipVariantId: string;
  plannedOutputKg: number;
}

interface ProductionPlan {
  id: string;
  lokasiId: string; // MPD | SSP | KKI | AGDN
  bulan: number;
  tahun: number;
  status: 'Draft' | 'Approved' | 'Revised';
  workingDays: number;
  fryingCyclesPerDay: number;
  productionCapacity: number; // calculated as frozenInputPerCycleKg * vacuumFryingMachines * dailyCycles
  operatorCount: number;
  frozenInputPerCycleKg?: number;
  vacuumFryingMachines?: number;
  dailyCycles?: number;
  procurementPlan: { fruitVariantId: string; targetKg: number }[];
  peelingPlan: { fruitVariantId: string; grossRawMaterialKg: number; netFrozenOutputKg: number; yieldTargetPercent: number }[];
  productionPlan: { fruitVariantId: string; grossFrozenInputKg: number; netChipsOutputKg: number; vfYieldTargetPercent: number; chipsYieldTargetPercent: number }[];
  inventoryPlan: { fruitVariantId: string; frozenStockTargetKg: number; chipsStockTargetKg: number; finishedGoodsStockTargetPcs: number }[];
  keripikOutputPlan?: ChipsOutputTarget[];
}

interface ProductionPlanningProps {
  state: any;
  setState?: React.Dispatch<React.SetStateAction<any>>;
  selectedLokasi: string;
  currentUser: any;
}

const INITIAL_SEED_PLANS: ProductionPlan[] = [
  {
    id: "PLAN-2026-06-MPD",
    lokasiId: "MPD",
    bulan: 6,
    tahun: 2026,
    status: 'Approved',
    workingDays: 25,
    fryingCyclesPerDay: 10,
    productionCapacity: 1500, // 50 * 3 * 10
    operatorCount: 6,
    frozenInputPerCycleKg: 50,
    vacuumFryingMachines: 3,
    dailyCycles: 10,
    procurementPlan: [
      { fruitVariantId: "FV-04", targetKg: 2500 }, // Apel
      { fruitVariantId: "FV-02", targetKg: 1200 }, // Nangka
      { fruitVariantId: "FV-05", targetKg: 800 },  // Pisang
      { fruitVariantId: "FV-03", targetKg: 500 }   // Salak
    ],
    peelingPlan: [
      { fruitVariantId: "FV-04", grossRawMaterialKg: 2500, netFrozenOutputKg: 1625, yieldTargetPercent: 65 },
      { fruitVariantId: "FV-02", grossRawMaterialKg: 1200, netFrozenOutputKg: 480, yieldTargetPercent: 40 },
      { fruitVariantId: "FV-05", grossRawMaterialKg: 800, netFrozenOutputKg: 480, yieldTargetPercent: 60 },
      { fruitVariantId: "FV-03", grossRawMaterialKg: 500, netFrozenOutputKg: 300, yieldTargetPercent: 60 }
    ],
    productionPlan: [
      { fruitVariantId: "FV-04", grossFrozenInputKg: 1625, netChipsOutputKg: 650, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 95 },
      { fruitVariantId: "FV-02", grossFrozenInputKg: 480, netChipsOutputKg: 180, vfYieldTargetPercent: 37.5, chipsYieldTargetPercent: 96 },
      { fruitVariantId: "FV-05", grossFrozenInputKg: 480, netChipsOutputKg: 192, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 95 },
      { fruitVariantId: "FV-03", grossFrozenInputKg: 300, netChipsOutputKg: 126, vfYieldTargetPercent: 42, chipsYieldTargetPercent: 94 }
    ],
    inventoryPlan: [
      { fruitVariantId: "FV-04", frozenStockTargetKg: 300, chipsStockTargetKg: 150, finishedGoodsStockTargetPcs: 1200 },
      { fruitVariantId: "FV-02", frozenStockTargetKg: 150, chipsStockTargetKg: 75, finishedGoodsStockTargetPcs: 600 },
      { fruitVariantId: "FV-05", frozenStockTargetKg: 120, chipsStockTargetKg: 50, finishedGoodsStockTargetPcs: 450 },
      { fruitVariantId: "FV-03", frozenStockTargetKg: 80, chipsStockTargetKg: 40, finishedGoodsStockTargetPcs: 300 }
    ],
    keripikOutputPlan: [
      { chipVariantId: "PRD-01", plannedOutputKg: 650 },
      { chipVariantId: "PRD-03", plannedOutputKg: 180 },
      { chipVariantId: "PRD-02", plannedOutputKg: 192 },
      { chipVariantId: "PRD-08", plannedOutputKg: 126 }
    ]
  },
  {
    id: "PLAN-2026-06-SSP",
    lokasiId: "SSP",
    bulan: 6,
    tahun: 2026,
    status: 'Approved',
    workingDays: 24,
    fryingCyclesPerDay: 8,
    productionCapacity: 800, // 50 * 2 * 8
    operatorCount: 4,
    frozenInputPerCycleKg: 50,
    vacuumFryingMachines: 2,
    dailyCycles: 8,
    procurementPlan: [
      { fruitVariantId: "FV-01", targetKg: 1800 }, // Nanas
      { fruitVariantId: "FV-03", targetKg: 300 }   // Salak
    ],
    peelingPlan: [
      { fruitVariantId: "FV-01", grossRawMaterialKg: 1800, netFrozenOutputKg: 1080, yieldTargetPercent: 60 },
      { fruitVariantId: "FV-03", grossRawMaterialKg: 300, netFrozenOutputKg: 180, yieldTargetPercent: 60 }
    ],
    productionPlan: [
      { fruitVariantId: "FV-01", grossFrozenInputKg: 1080, netChipsOutputKg: 432, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 94 },
      { fruitVariantId: "FV-03", grossFrozenInputKg: 180, netChipsOutputKg: 72, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 94 }
    ],
    inventoryPlan: [
      { fruitVariantId: "FV-01", frozenStockTargetKg: 200, chipsStockTargetKg: 100, finishedGoodsStockTargetPcs: 900 },
      { fruitVariantId: "FV-03", frozenStockTargetKg: 50, chipsStockTargetKg: 25, finishedGoodsStockTargetPcs: 200 }
    ],
    keripikOutputPlan: [
      { chipVariantId: "PRD-06", plannedOutputKg: 432 },
      { chipVariantId: "PRD-08", plannedOutputKg: 72 }
    ]
  },
  {
    id: "PLAN-2026-06-KKI",
    lokasiId: "KKI",
    bulan: 6,
    tahun: 2026,
    status: 'Approved',
    workingDays: 26,
    fryingCyclesPerDay: 4,
    productionCapacity: 200, // 50 * 1 * 4
    operatorCount: 3,
    frozenInputPerCycleKg: 50,
    vacuumFryingMachines: 1,
    dailyCycles: 4,
    procurementPlan: [
      { fruitVariantId: "FV-04", targetKg: 500 }, // Apel
      { fruitVariantId: "FV-02", targetKg: 400 }  // Nangka
    ],
    peelingPlan: [
      { fruitVariantId: "FV-04", grossRawMaterialKg: 500, netFrozenOutputKg: 325, yieldTargetPercent: 65 },
      { fruitVariantId: "FV-02", grossRawMaterialKg: 400, netFrozenOutputKg: 160, yieldTargetPercent: 40 }
    ],
    productionPlan: [
      { fruitVariantId: "FV-04", grossFrozenInputKg: 325, netChipsOutputKg: 130, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 95 },
      { fruitVariantId: "FV-02", grossFrozenInputKg: 160, netChipsOutputKg: 60, vfYieldTargetPercent: 37.5, chipsYieldTargetPercent: 95 }
    ],
    inventoryPlan: [
      { fruitVariantId: "FV-04", frozenStockTargetKg: 100, chipsStockTargetKg: 50, finishedGoodsStockTargetPcs: 400 },
      { fruitVariantId: "FV-02", frozenStockTargetKg: 80, chipsStockTargetKg: 40, finishedGoodsStockTargetPcs: 300 }
    ],
    keripikOutputPlan: [
      { chipVariantId: "PRD-01", plannedOutputKg: 130 },
      { chipVariantId: "PRD-03", plannedOutputKg: 60 }
    ]
  }
];

export default function ProductionPlanning({ state, setState, selectedLokasi, currentUser }: ProductionPlanningProps) {
  const [plans, setPlans] = useState<ProductionPlan[]>(() => {
    try {
      const localPlans = localStorage.getItem('agridea_production_plans');
      return localPlans ? JSON.parse(localPlans) : INITIAL_SEED_PLANS;
    } catch (e) {
      return INITIAL_SEED_PLANS;
    }
  });

  // Sync to local
  useEffect(() => {
    try {
      localStorage.setItem('agridea_production_plans', JSON.stringify(plans));
    } catch (e) {
      console.warn('Could not sync production plans to localStorage', e);
    }
  }, [plans]);

  const [activeTab, setActiveTab] = useState<'factory' | 'consolidated' | 'director' | 'plans' | 'ai-insights' | 'mrp'>('factory');
  const [selectedPlanFactory, setSelectedPlanFactory] = useState<string>(() => {
    if (selectedLokasi && selectedLokasi !== 'JKT' && selectedLokasi !== 'ALL') {
      return selectedLokasi;
    }
    return 'MPD';
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // June
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 0 means Consolidated Full Month

  // Master Data mapping helpers (Hoisted before any useMemo calls)
  const activeFruitVariants = useMemo(() => {
    return (state?.fruitVariants || []).filter((fv: any) => fv && (fv.status === 'Active' || fv.status === 'Aktif' || fv.status === 'active'));
  }, [state?.fruitVariants]);

  const activeChipVariants = useMemo(() => {
    return (state?.chipVariants || []).filter((cv: any) => cv && (cv.status === 'Active' || cv.status === 'Aktif' || cv.status === 'active'));
  }, [state?.chipVariants]);

  const fruitIdToName = (id: string) => {
    if (!id) return '';
    const f = (state?.fruitVariants || []).find((v: any) => v && v.id === id);
    return f ? f.nama : id;
  };

  const chipIdToName = (id: string) => {
    if (!id) return '';
    const c = (state?.chipVariants || []).find((v: any) => v && v.id === id);
    return c ? c.nama : id;
  };

  const fruitNameToId = (name: string) => {
    if (!name) return '';
    const found = (state?.fruitVariants || []).find((v: any) => v && v.nama && v.nama.trim().toLowerCase() === name.trim().toLowerCase());
    return found?.id || '';
  };

  // MRP simulation/active-plan states
  const [mrpViewMode, setMrpViewMode] = useState<'active-plan' | 'simulate'>('active-plan');
  const [mrpTargetKg, setMrpTargetKg] = useState<number>(1000);
  const [mrpSelectedSku, setMrpSelectedSku] = useState<string>(() => {
    return state?.produk && state.produk.length > 0 ? state.produk[0].id : 'PRD-01';
  });

  const mrpRequirements = useMemo(() => {
    let targets: { skuId: string; targetKg: number; targetPcs: number }[] = [];

    if (mrpViewMode === 'simulate') {
      const selectedSkuObj = (state?.produk || []).find((p: any) => p.id === mrpSelectedSku);
      if (selectedSkuObj) {
        const gramasi = selectedSkuObj.gramasi || 100;
        const targetPcs = Math.round((mrpTargetKg * 1000) / gramasi);
        targets.push({
          skuId: mrpSelectedSku,
          targetKg: mrpTargetKg,
          targetPcs: targetPcs
        });
      }
    } else {
      const activePlan = plans.find(p => p.lokasiId === selectedPlanFactory && p.bulan === selectedMonth && p.tahun === selectedYear);
      if (activePlan) {
        if (activePlan.keripikOutputPlan && activePlan.keripikOutputPlan.length > 0) {
          activePlan.keripikOutputPlan.forEach((kop: any) => {
            const skuObj = (state?.produk || []).find((p: any) => p.id === kop.chipVariantId);
            if (skuObj) {
              const gramasi = skuObj.gramasi || 100;
              const targetPcs = Math.round(((kop.plannedOutputKg || 0) * 1000) / gramasi);
              targets.push({
                skuId: skuObj.id,
                targetKg: kop.plannedOutputKg || 0,
                targetPcs: targetPcs
              });
            }
          });
        } else if (activePlan.productionPlan && activePlan.productionPlan.length > 0) {
          activePlan.productionPlan.forEach((pp: any) => {
            const fvName = fruitIdToName(pp.fruitVariantId) || '';
            const skuObj = (state?.produk || []).find((p: any) => p?.varian && fvName && p.varian.toLowerCase().includes(fvName.toLowerCase())) ||
                           (state?.produk || []).find((p: any) => p?.id === 'PRD-01') ||
                           (state?.produk || [])[0];
            if (skuObj) {
              const gramasi = skuObj.gramasi || 100;
              const targetPcs = Math.round(((pp.netChipsOutputKg || 0) * 1000) / gramasi);
              targets.push({
                skuId: skuObj.id,
                targetKg: pp.netChipsOutputKg || 0,
                targetPcs: targetPcs
              });
            }
          });
        }
      }
    }

    const result = {
      targets,
      fruit: [] as any[],
      packaging: [] as any[],
      supporting: [] as any[],
      chemicals: [] as any[],
      totals: {
        totalTargetKg: 0,
        totalTargetPcs: 0,
        totalBudget: 0
      }
    };

    const boms = state?.bom || [];

    targets.forEach(tgt => {
      result.totals.totalTargetKg += tgt.targetKg;
      result.totals.totalTargetPcs += tgt.targetPcs;

      const skuObj = (state?.produk || []).find((p: any) => p?.id === tgt.skuId);
      if (!skuObj) return;

      const matchingBom = boms.find((b: any) => b?.produkId === tgt.skuId) || (boms.length > 0 ? boms[0] : null);
      
      const multiplierFresh = matchingBom?.bahanBakuKg || 1.2;
      const multiplierOil = matchingBom?.minyakLiter || 0.15;
      const multiplierLPG = matchingBom?.lpgKg || 0.20;

      const freshFruitNeededKg = tgt.targetPcs * multiplierFresh;
      const fruitCost = freshFruitNeededKg * 12000;

      const skuVarian = skuObj.varian || '';
      const matchingFruitMaster = (state?.fruitVariants || []).find((fv: any) => fv?.nama && skuVarian && fv.nama.toLowerCase().includes(skuVarian.toLowerCase())) || (state?.fruitVariants || [])[0];

      result.fruit.push({
        id: matchingFruitMaster?.id || 'FV-XX',
        nama: `${skuVarian || 'Produk'} Segar (Bahan Baku)`,
        qtyNeeded: freshFruitNeededKg,
        unit: 'Kg',
        costEst: fruitCost,
        sourceSku: skuObj.sku || skuObj.id
      });

      const matchPouch = (state?.packagingMaster || []).find((pm: any) => pm.kategori === 'Standing Pouch') || { id: 'PK-001', nama: 'Standing Pouch Pack', standardCost: 450, unit: 'Pcs' };
      result.packaging.push({
        id: matchPouch.id,
        nama: matchPouch.nama,
        qtyNeeded: tgt.targetPcs,
        unit: 'Pcs',
        costEst: tgt.targetPcs * (matchPouch.standardCost || 450),
        sourceSku: skuObj.sku || skuObj.id
      });

      const matchLabel = (state?.packagingMaster || []).find((pm: any) => pm.kategori === 'Sticker' || pm.kategori === 'Label') || { id: 'PK-005', nama: 'Label Sticker Agridea', standardCost: 150, unit: 'Pcs' };
      result.packaging.push({
        id: matchLabel.id,
        nama: matchLabel.nama,
        qtyNeeded: tgt.targetPcs,
        unit: 'Pcs',
        costEst: tgt.targetPcs * (matchLabel.standardCost || 150),
        sourceSku: skuObj.sku || skuObj.id
      });

      const boxCount = Math.ceil(tgt.targetPcs * 0.0417);
      const matchCarton = (state?.packagingMaster || []).find((pm: any) => pm.kategori === 'Carton' || pm.kategori === 'Box') || { id: 'PK-004', nama: 'Carton Box Agridea', standardCost: 8500, unit: 'Pcs' };
      result.packaging.push({
        id: matchCarton.id,
        nama: matchCarton.nama,
        qtyNeeded: boxCount,
        unit: 'Pcs',
        costEst: boxCount * (matchCarton.standardCost || 8500),
        sourceSku: skuObj.sku || skuObj.id
      });

      const matchSilica = (state?.packagingMaster || []).find((pm: any) => pm.kategori === 'Silica Gel') || { id: 'PK-006', nama: 'Silica Gel Pack', standardCost: 45, unit: 'Pcs' };
      result.packaging.push({
        id: matchSilica.id,
        nama: matchSilica.nama,
        qtyNeeded: tgt.targetPcs,
        unit: 'Pcs',
        costEst: tgt.targetPcs * (matchSilica.standardCost || 45),
        sourceSku: skuObj.sku || skuObj.id
      });

      const tapeRolls = Math.ceil(boxCount / 10);
      const matchTape = (state?.supportingMaster || []).find((sm: any) => sm.nama && sm.nama.toLowerCase().includes('lakban')) || { id: 'SP-011', nama: 'Lakban Coklat Opp Tape', standardCost: 12000, unit: 'Roll' };
      result.supporting.push({
        id: matchTape.id,
        nama: matchTape.nama,
        qtyNeeded: tapeRolls,
        unit: 'Roll',
        costEst: tapeRolls * (matchTape.standardCost || 12000),
        sourceSku: skuObj.sku || skuObj.id
      });

      const matchMerang = (state?.supportingMaster || []).find((sm: any) => sm.nama && sm.nama.toLowerCase().includes('kertas merang')) || { id: 'SP-001', nama: 'Kertas Merang Peniris', standardCost: 120, unit: 'Pcs' };
      result.supporting.push({
        id: matchMerang.id,
        nama: matchMerang.nama,
        qtyNeeded: tgt.targetPcs,
        unit: 'Pcs',
        costEst: tgt.targetPcs * (matchMerang.standardCost || 120),
        sourceSku: skuObj.sku || skuObj.id
      });

      const matchBarcodeLabel = (state?.supportingMaster || []).find((sm: any) => sm.nama && (sm.nama.toLowerCase().includes('barcode') || sm.nama.toLowerCase().includes('sku'))) || { id: 'SP-013', nama: 'Label SKU Barcode Thermal', standardCost: 35, unit: 'Pcs' };
      result.supporting.push({
        id: matchBarcodeLabel.id,
        nama: matchBarcodeLabel.nama,
        qtyNeeded: tgt.targetPcs,
        unit: 'Pcs',
        costEst: tgt.targetPcs * (matchBarcodeLabel.standardCost || 35),
        sourceSku: skuObj.sku || skuObj.id
      });

      const oilNeeded = tgt.targetPcs * multiplierOil;
      const matchOil = (state?.chemicalsMaster || []).find((cc: any) => cc.kategori === 'Minyak Kelapa' || (cc.nama && cc.nama.toLowerCase().includes('minyak'))) || { id: 'CC-101', nama: 'Minyak Kelapa Premium', standardCost: 18500, unit: 'Liter' };
      result.chemicals.push({
        id: matchOil.id,
        nama: matchOil.nama,
        qtyNeeded: oilNeeded,
        unit: 'Liter',
        costEst: oilNeeded * (matchOil.standardCost || 18500),
        sourceSku: skuObj.sku || skuObj.id
      });

      const gasKg = tgt.targetPcs * multiplierLPG;
      const gasTubes = Math.ceil(gasKg / 50);
      const matchGas = (state?.chemicalsMaster || []).find((cc: any) => cc.nama && (cc.nama.toLowerCase().includes('lpg') || cc.nama.toLowerCase().includes('gas'))) || { id: 'CC-102', nama: 'LPG Pertamina Industri 50kg', standardCost: 950000, unit: 'Tabung' };
      result.chemicals.push({
        id: matchGas.id,
        nama: matchGas.nama,
        qtyNeeded: gasTubes,
        unit: 'Tabung',
        costEst: gasTubes * (matchGas.standardCost || 950000),
        sourceSku: skuObj.sku || skuObj.id
      });

      const sanitizerQty = Math.ceil(tgt.targetPcs / 1000);
      const matchSanitizer = (state?.chemicalsMaster || []).find((cc: any) => cc.nama && (cc.nama.toLowerCase().includes('sanitizer') || cc.kategori === 'Aseptic/Sanitizer')) || { id: 'CC-007', nama: 'Sanitizer Spray Anti-Bacterial', standardCost: 45000, unit: 'Liter' };
      result.chemicals.push({
        id: matchSanitizer.id,
        nama: matchSanitizer.nama,
        qtyNeeded: sanitizerQty,
        unit: 'Liter',
        costEst: sanitizerQty * (matchSanitizer.standardCost || 45000),
        sourceSku: skuObj.sku || skuObj.id
      });
    });

    const consolidate = (list: any[]) => {
      const grouped: { [id: string]: any } = {};
      list.forEach(item => {
        if (!grouped[item.id]) {
          grouped[item.id] = { ...item, sourceSkus: [item.sourceSku] };
        } else {
          grouped[item.id].qtyNeeded += item.qtyNeeded;
          grouped[item.id].costEst += item.costEst;
          if (!grouped[item.id].sourceSkus.includes(item.sourceSku)) {
            grouped[item.id].sourceSkus.push(item.sourceSku);
          }
        }
      });
      return Object.values(grouped);
    };

    result.fruit = consolidate(result.fruit);
    result.packaging = consolidate(result.packaging);
    result.supporting = consolidate(result.supporting);
    result.chemicals = consolidate(result.chemicals);

    let grandBudget = 0;
    result.fruit.forEach(x => grandBudget += x.costEst);
    result.packaging.forEach(x => grandBudget += x.costEst);
    result.supporting.forEach(x => grandBudget += x.costEst);
    result.chemicals.forEach(x => grandBudget += x.costEst);

    result.totals.totalBudget = grandBudget;

    return result;
  }, [mrpViewMode, mrpTargetKg, mrpSelectedSku, plans, selectedPlanFactory, selectedMonth, selectedYear, state?.produk, state?.bom, state?.fruitVariants, state?.packagingMaster, state?.supportingMaster, state?.chemicalsMaster]);

  // Toggle editor form
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states under edit
  const [editPlanFactory, setEditPlanFactory] = useState<string>(selectedPlanFactory);
  const [editWorkingDays, setEditWorkingDays] = useState<number>(25);
  const [editFryingCycles, setEditFryingCycles] = useState<number>(10);
  const [editCapacity, setEditCapacity] = useState<number>(1500);
  const [editOperators, setEditOperators] = useState<number>(6);

  // New auto-calc Vacuum Frying capacity factors
  const [editFrozenInputPerCycleKg, setEditFrozenInputPerCycleKg] = useState<number>(50);
  const [editVacuumFryingMachines, setEditVacuumFryingMachines] = useState<number>(3);
  const [editDailyCycles, setEditDailyCycles] = useState<number>(10);

  // Lists form elements
  const [editProcPlan, setEditProcPlan] = useState<{ fruitVariantId: string; targetKg: number }[]>([]);
  const [editPeelPlan, setEditPeelPlan] = useState<{ fruitVariantId: string; grossRawMaterialKg: number; netFrozenOutputKg: number; yieldTargetPercent: number }[]>([]);
  const [editProdPlan, setEditProdPlan] = useState<{ fruitVariantId: string; grossFrozenInputKg: number; netChipsOutputKg: number; vfYieldTargetPercent: number; chipsYieldTargetPercent: number }[]>([]);
  const [editInvPlan, setEditInvPlan] = useState<{ fruitVariantId: string; frozenStockTargetKg: number; chipsStockTargetKg: number; finishedGoodsStockTargetPcs: number }[]>([]);
  
  // Custom Keripik Outputs List
  const [editKeripikPlan, setEditKeripikPlan] = useState<ChipsOutputTarget[]>([]);

  // Search fruit inside form
  const [fruitSearchForm, setFruitSearchForm] = useState<string>('');
  const [chipSearchForm, setChipSearchForm] = useState<string>('');

  const weeklyPeriods = useMemo(() => getWeeklyPeriods(selectedYear, selectedMonth), [selectedMonth, selectedYear]);

  // Integrated alerts from Compliance & Service Hub
  const factoryAlerts = useMemo(() => {
    try {
      const savedMaint = localStorage.getItem('agridea_maintenance_reports');
      const maintList = savedMaint ? JSON.parse(savedMaint) : [];
      const activeMaint = maintList.filter((m: any) => m && m.lokasiId === selectedPlanFactory && m.status !== 'Completed').length;

      const savedAudit = localStorage.getItem('agridea_audit_reports');
      const auditList = savedAudit ? JSON.parse(savedAudit) : [];
      const activeAudit = auditList.filter((a: any) => a && a.status === 'Open').length;

      return { activeMaint, activeAudit };
    } catch (e) {
      return { activeMaint: 0, activeAudit: 0 };
    }
  }, [selectedPlanFactory, plans]);

  // Find active plan based on filters
  const activePlan = useMemo(() => {
    return plans.find(p => p && p.lokasiId === selectedPlanFactory && p.bulan === selectedMonth && p.tahun === selectedYear);
  }, [plans, selectedPlanFactory, selectedMonth, selectedYear]);

  // Handle auto-calc of Vacuum Frying capacity factors in form
  useEffect(() => {
    const calculatedCapacity = (editFrozenInputPerCycleKg || 50) * (editVacuumFryingMachines || 3) * (editDailyCycles || 10);
    setEditCapacity(calculatedCapacity);
  }, [editFrozenInputPerCycleKg, editVacuumFryingMachines, editDailyCycles]);

  // Live transactional ACTUAL aggregate compiler
  const actualData = useMemo(() => {
    const data: {
      procurement: { [fruitId: string]: number };
      peelingGross: { [fruitId: string]: number };
      peelingNet: { [fruitId: string]: number };
      fryingGross: { [fruitId: string]: number };
      chipsNet: { [fruitId: string]: number };
      chipsTotalDefects: { [fruitId: string]: number };
      fryingCount: { [fruitId: string]: number };
      chipsOutputKg: { [chipVariantId: string]: number };
    } = {
      procurement: {},
      peelingGross: {},
      peelingNet: {},
      fryingGross: {},
      chipsNet: {},
      chipsTotalDefects: {},
      fryingCount: {},
      chipsOutputKg: {}
    };

    const isRecordInPeriod = (dateStr: string, recordLokasiId: string) => {
      if (!dateStr) return false;
      if (selectedPlanFactory && recordLokasiId !== selectedPlanFactory) return false;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const yr = d.getFullYear();
      const mn = d.getMonth() + 1;
      if (yr !== selectedYear || mn !== selectedMonth) return false;

      const dayOfMonth = d.getDate();
      if (selectedWeek > 0) {
        const activePeriod = weeklyPeriods[selectedWeek - 1];
        if (!activePeriod) return false;
        return dayOfMonth >= activePeriod.startDay && dayOfMonth <= activePeriod.endDay;
      }
      return true;
    };

    // 1. Procurement
    (state.penerimaan || []).forEach((p: any) => {
      if (isRecordInPeriod(p.tanggal, p.lokasiId)) {
        const fid = fruitNameToId(p.jenisBahan);
        if (fid) {
          data.procurement[fid] = (data.procurement[fid] || 0) + p.beratDiterimaKg;
        }
      }
    });

    // 2. Peeling Logs
    (state.peelingLogs || []).forEach((p: any) => {
      if (isRecordInPeriod(p.tanggal, p.lokasiId)) {
        const batch = (state.batches || []).find((b: any) => b.id === p.batchId);
        const fKey = batch ? batch.namaBahan : 'Apel';
        const fid = fruitNameToId(fKey);
        if (fid) {
          data.peelingGross[fid] = (data.peelingGross[fid] || 0) + p.bahanMasukKg;
          data.peelingNet[fid] = (data.peelingNet[fid] || 0) + p.hasilKupasKg;
        }
      }
    });

    // 3. Frying Logs
    (state.fryingLogs || []).forEach((fry: any) => {
      if (isRecordInPeriod(fry.tanggal, fry.lokasiId)) {
        const batch = (state.batches || []).find((b: any) => b.id === fry.batchId);
        const fKey = batch ? batch.namaBahan : 'Apel';
        const fid = fruitNameToId(fKey);
        if (fid) {
          data.fryingGross[fid] = (data.fryingGross[fid] || 0) + fry.beratFrozenMasukKg;
          data.chipsNet[fid] = (data.chipsNet[fid] || 0) + fry.beratHasilKeripikKg;
          data.fryingCount[fid] = (data.fryingCount[fid] || 0) + (fry.cycleCount || 1);
        }
      }
    });

    // 4. Packaging / Repack logs to Chip variant specific actuals
    (state.packingLogs || []).forEach((pack: any) => {
      if (isRecordInPeriod(pack.tanggal, pack.lokasiId)) {
        const cid = pack.produkId; // SKU / variant
        if (cid) {
          data.chipsOutputKg[cid] = (data.chipsOutputKg[cid] || 0) + (pack.beratTerkemasKg || 0);
        }
      }
    });

    // Fallback: If packing logs are empty or unrecorded, back-calculate Chip actuals proportional to frying logs output of that same fruit standard!
    activeChipVariants.forEach(cv => {
      if (!data.chipsOutputKg[cv.id]) {
        // Map based on the fruit variant output of the chip
        data.chipsOutputKg[cv.id] = data.chipsNet[cv.fruitVariantId] || 0;
      }
    });

    return data;
  }, [state, selectedPlanFactory, selectedMonth, selectedYear, selectedWeek, weeklyPeriods, activeChipVariants]);

  // Populates form helper from selected plan
  const loadPlanToEdit = () => {
    if (!activePlan) return;
    setEditPlanFactory(activePlan.lokasiId);
    setEditWorkingDays(activePlan.workingDays);
    setEditFryingCycles(activePlan.fryingCyclesPerDay);
    setEditCapacity(activePlan.productionCapacity);
    setEditOperators(activePlan.operatorCount);
    
    setEditFrozenInputPerCycleKg(activePlan.frozenInputPerCycleKg || 50);
    setEditVacuumFryingMachines(activePlan.vacuumFryingMachines || 3);
    setEditDailyCycles(activePlan.dailyCycles || 10);

    setEditProcPlan([...(activePlan.procurementPlan || [])]);
    setEditPeelPlan([...(activePlan.peelingPlan || [])]);
    setEditProdPlan([...(activePlan.productionPlan || [])]);
    setEditInvPlan([...(activePlan.inventoryPlan || [])]);
    setEditKeripikPlan([...(activePlan.keripikOutputPlan || [])]);
    
    setIsEditing(true);
  };

  // Add active fruit variant into monthly planning
  const handleAddFruitToPlan = (fvId: string) => {
    if (editProcPlan.some(p => p.fruitVariantId === fvId)) {
      alert("Fruit variant already added in plan.");
      return;
    }

    setEditProcPlan(prev => [...prev, { fruitVariantId: fvId, targetKg: 2000 }]);
    setEditPeelPlan(prev => [...prev, { fruitVariantId: fvId, grossRawMaterialKg: 2000, netFrozenOutputKg: 1300, yieldTargetPercent: 65 }]);
    setEditProdPlan(prev => [...prev, { fruitVariantId: fvId, grossFrozenInputKg: 1300, netChipsOutputKg: 520, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 95 }]);
    setEditInvPlan(prev => [...prev, { fruitVariantId: fvId, frozenStockTargetKg: 250, chipsStockTargetKg: 125, finishedGoodsStockTargetPcs: 1000 }]);
  };

  // Add active chip variant to Finished Goods output monthly targets
  const handleAddChipToPlan = (chipId: string) => {
    if (editKeripikPlan.some(p => p.chipVariantId === chipId)) {
      alert("Chip variant already added.");
      return;
    }
    setEditKeripikPlan(prev => [...prev, { chipVariantId: chipId, plannedOutputKg: 500 }]);
  };

  // Remove fruit variant completely from edit plans matrices
  const handleRemoveFruitFromPlan = (fvId: string) => {
    setEditProcPlan(prev => prev.filter(p => p.fruitVariantId !== fvId));
    setEditPeelPlan(prev => prev.filter(p => p.fruitVariantId !== fvId));
    setEditProdPlan(prev => prev.filter(p => p.fruitVariantId !== fvId));
    setEditInvPlan(prev => prev.filter(p => p.fruitVariantId !== fvId));
  };

  const handleRemoveChipFromPlan = (chipId: string) => {
    setEditKeripikPlan(prev => prev.filter(p => p.chipVariantId !== chipId));
  };

  // Initialize a dynamic empty plan representing the selected filters
  const startNewPlan = () => {
    // Populate with 5 baseline active fruit variants for minimum capacities
    const preselectedFruits = activeFruitVariants.slice(0, 5);
    const preselectedChips = activeChipVariants.slice(0, 4);

    setEditPlanFactory(selectedPlanFactory);
    setEditWorkingDays(25);
    setEditFryingCycles(10);
    setEditFrozenInputPerCycleKg(50);
    setEditVacuumFryingMachines(3);
    setEditDailyCycles(10);
    setEditCapacity(1500);
    setEditOperators(6);

    const proc = preselectedFruits.map(pf => ({ fruitVariantId: pf.id, targetKg: 2000 }));
    const peel = preselectedFruits.map(pf => ({ fruitVariantId: pf.id, grossRawMaterialKg: 2000, netFrozenOutputKg: 1300, yieldTargetPercent: 65 }));
    const prod = preselectedFruits.map(pf => ({ fruitVariantId: pf.id, grossFrozenInputKg: 1300, netChipsOutputKg: 520, vfYieldTargetPercent: 40, chipsYieldTargetPercent: 95 }));
    const inv = preselectedFruits.map(pf => ({ fruitVariantId: pf.id, frozenStockTargetKg: 250, chipsStockTargetKg: 125, finishedGoodsStockTargetPcs: 1000 }));
    
    const chipPlan = preselectedChips.map(pc => ({ chipVariantId: pc.id, plannedOutputKg: 500 }));

    setEditProcPlan(proc);
    setEditPeelPlan(peel);
    setEditProdPlan(prod);
    setEditInvPlan(inv);
    setEditKeripikPlan(chipPlan);

    setIsEditing(true);
  };

  // Save submit plan changes
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProcPlan.length < 5) {
      if (!confirm("Your month planning has less than 5 fruit variants. Minimun suggested capacity is 5 fruit variants per month. Save anyway?")) {
        return;
      }
    }

    const updatedPlan: ProductionPlan = {
      id: `PLAN-${selectedYear}-${selectedMonth}-${editPlanFactory}`,
      lokasiId: editPlanFactory,
      bulan: selectedMonth,
      tahun: selectedYear,
      status: activePlan?.status || 'Draft',
      workingDays: editWorkingDays,
      fryingCyclesPerDay: editFryingCycles,
      productionCapacity: editCapacity,
      operatorCount: editOperators,
      frozenInputPerCycleKg: editFrozenInputPerCycleKg,
      vacuumFryingMachines: editVacuumFryingMachines,
      dailyCycles: editDailyCycles,
      procurementPlan: editProcPlan,
      peelingPlan: editPeelPlan,
      productionPlan: editProdPlan,
      inventoryPlan: editInvPlan,
      keripikOutputPlan: editKeripikPlan
    };

    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === updatedPlan.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedPlan;
        return copy;
      } else {
        return [...prev, updatedPlan];
      }
    });

    setIsEditing(false);
  };

  const handleApprovePlan = () => {
    if (!activePlan) return;
    setPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, status: 'Approved' } : p));
  };

  const handleRevisePlan = () => {
    if (!activePlan) return;
    setPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, status: 'Revised' } : p));
  };

  // Rule E: KPI Indicator state colors based on achievements
  const getKpiStatus = (actual: number, plan: number) => {
    if (!plan || plan === 0) return { color: 'bg-emerald-50 text-emerald-800 border-emerald-250', text: 'On Target 🟢', rating: 'GREEN', pct: 100 };
    const pct = (actual / plan) * 100;
    if (pct >= 100) {
      return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: `On Target 🟢 (${pct.toFixed(0)}%)`, rating: 'GREEN', pct };
    } else if (pct >= 90) {
      return { color: 'bg-amber-50 text-amber-700 border-amber-250', text: `Attention 🟡 (${pct.toFixed(0)}%)`, rating: 'YELLOW', pct };
    } else {
      return { color: 'bg-rose-50 text-rose-650 border-rose-200', text: `Critical 🔴 (${pct.toFixed(0)}%)`, rating: 'RED', pct };
    }
  };

  const renderKpiCell = (actual: number, plan: number, suffix: string = 'Kg') => {
    const kpi = getKpiStatus(actual, plan);
    return (
      <td className="p-3 text-right">
        <div className="font-mono font-black text-slate-800 text-xs">{actual.toLocaleString()} {suffix}</div>
        <div className={`mt-1 py-0.5 px-2 rounded text-[10px] inline-block font-bold border ${kpi.color}`}>
          {plan === 0 ? '0 Plan' : `${kpi.pct.toFixed(0)}% achievement`}
        </div>
      </td>
    );
  };

  // --- DYNAMIC DIAGNOSTIC AI EVALUATOR ENGINE ---
  // Integrates Maintenance downtime, Regulatory BPOM checklists, Employee checkins
  const diagnosticsData = useMemo(() => {
    // 1. Maintaince log statistics
    const savedMReports = localStorage.getItem('agridea_maintenance_reports');
    const logsList = savedMReports ? JSON.parse(savedMReports) : [];
    const activeMaintenanceCount = logsList.filter((m: any) => m.lokasiId === selectedPlanFactory && m.status !== 'Completed').length;
    const totalDowntimeHours = logsList.filter((m: any) => m.lokasiId === selectedPlanFactory).reduce((sum: number, m: any) => sum + parseFloat(m.downtimeHours || 0), 0);

    // 2. Audit compliance log statistics
    const savedAudits = localStorage.getItem('agridea_audit_reports');
    const auditList = savedAudits ? JSON.parse(savedAudits) : [];
    const activeFindingsRisk = auditList.filter((a: any) => a.status === 'Open').length;
    const isGmpViolated = auditList.some((a: any) => a.status === 'Open' && (a.riskLevel === 'High' || a.riskLevel === 'Critical'));

    // 3. Live Attendance checkins statistics
    const savedAtt = localStorage.getItem('agridea_attendance_records');
    const attList = savedAtt ? JSON.parse(savedAtt) : [];
    const JuneLogs = attList.filter((a: any) => a.date.startsWith('2026-06') && a.factoryId === selectedPlanFactory);
    const presentCount = JuneLogs.filter((a: any) => a.status === 'Present' || a.status === 'Late').length;
    const lateCount = JuneLogs.filter((a: any) => a.status === 'Late').length;
    
    // Total physical frying yields
    const totalActualFryingYield = Object.values(actualData.chipsNet).reduce((sum: number, n: any) => sum + (Number(n) || 0), 0) as number;
    const calculatedCapacity = (activePlan?.productionCapacity || 1200) * (activePlan?.workingDays || 25);
    const capacityUtilization = calculatedCapacity > 0 ? Math.round((totalActualFryingYield / calculatedCapacity) * 100) : 58;

    // AI heuristic diagnostic writer
    let aiProblem = `Operations are flowing normally. Fruit raw material procurement achieves 92% targets.`;
    let aiChallenge = `Optimizing logistics chain to shorten warehouse waiting times while keeping standard room parameters secure.`;
    let aiActionPlan = `Continue current shift rotations and verify standard daily lubrication cycles on Vacuum Frying Machine #1.`;

    if (activeFindingsRisk > 0 || totalDowntimeHours > 0 || lateCount > 0 || capacityUtilization < 70) {
      aiProblem = `We flagged operational anomalies: ${totalDowntimeHours} hours downtime on physical machinery, combined with ${lateCount} late employee entries tonight, delay-triggered start times. GMP Compliance lists ${activeFindingsRisk} open Corrective Actions. Frying capacity utilization stands at ${capacityUtilization}%.`;
      
      aiChallenge = `Re-calibrating vacuum frying batch pressure tolerances on the floor while satisfying BPOM compliance instructions and compensating for machine breakdowns.`;
      
      aiActionPlan = `1. Calibrate Vacuum Frying gaskets to prevent further leak downtime. 2. Implement strict hairnet checks at the hygiene station. 3. Adjust daily target cycles to 10 cycles using available personnel.`;
    }

    return {
      activeMaintenanceCount,
      totalDowntimeHours,
      activeFindingsRisk,
      isGmpViolated,
      presentCount,
      lateCount,
      capacityUtilization,
      aiProblem,
      aiChallenge,
      aiActionPlan
    };
  }, [selectedPlanFactory, activePlan, actualData]);

  // Aggregate consolidated figures for charts
  const consolidatedBarChart = useMemo(() => {
    if (!activePlan || !activePlan.procurementPlan || !Array.isArray(activePlan.procurementPlan)) return [];
    return activePlan.procurementPlan.map(p => {
      const actualProcKg = (actualData?.procurement && actualData.procurement[p.fruitVariantId]) || 0;
      return {
        name: fruitIdToName(p.fruitVariantId),
        "Planned Target (Kg)": p.targetKg || 0,
        "Actual Achievement (Kg)": actualProcKg
      };
    });
  }, [activePlan, actualData, state?.fruitVariants]);

  return (
    <div className="space-y-6" id="production-planning-performance-module">
      
      {/* Dynamic Sub-header Navigation Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Factory:</span>
          {((state?.lokasi && state.lokasi.length > 0) ? state.lokasi : [
            { id: 'MPD', nama: 'Wonosobo factory' },
            { id: 'SSP', nama: 'Sipahutar factory' },
            { id: 'KKI', nama: 'Jakarta Branch' }
          ]).map((loc: any) => (
            <button
              key={loc.id}
              onClick={() => setSelectedPlanFactory(loc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPlanFactory === loc.id ? 'bg-indigo-600 text-white shadow-xs border-indigo-605' : 'bg-slate-100 text-slate-650 hover:bg-slate-200'}`}
            >
              {loc.nama || loc.id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
          <span>Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(parseInt(e.target.value));
              setSelectedWeek(0);
            }}
            className="p-1 border rounded bg-white text-slate-800"
          >
            <option value={5}>Mei 25</option>
            <option value={6}>Juni 26</option>
            <option value={7}>Juli 26</option>
          </select>

          <span>Week Partition:</span>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="p-1 border rounded bg-white text-slate-800"
          >
            <option value={0}>Consolidated Month</option>
            {weeklyPeriods.map(wp => (
              <option key={wp.weekNum} value={wp.weekNum}>{wp.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setActiveTab('ai-insights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${activeTab === 'ai-insights' ? 'bg-purple-600 text-white border-purple-500' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Diagnostics
          </button>
        </div>
      </div>

      {/* CORE MONTHLY ESTIMATED CAPACITY & VACUUM FRYING CONFIG */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Factory operational details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Capacity</div>
          <h3 className="text-xl font-mono font-black text-indigo-900 mt-1">
            {activePlan ? `${activePlan.productionCapacity.toLocaleString()} Kg/day` : 'N/A'}
          </h3>
          <p className="text-[10.5px] text-slate-500 font-medium mt-1">
            Standard: {activePlan?.frozenInputPerCycleKg || 50}Kg × {activePlan?.vacuumFryingMachines || 3} Machines × {activePlan?.dailyCycles || 10} Cycles
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planned Working Days</div>
          <h3 className="text-xl font-mono font-black text-slate-800 mt-1">
            {activePlan ? `${activePlan.workingDays} Days` : 'N/A'}
          </h3>
          <p className="text-[10.5px] text-slate-500 font-medium mt-1">
            Total operators: {activePlan?.operatorCount || 6} workers active
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Planned Fruits</div>
          <h3 className="text-xl font-mono font-black text-emerald-700 mt-1">
            {activePlan?.procurementPlan ? `${activePlan.procurementPlan.length} Variants` : '0 Variants'}
          </h3>
          <p className="text-[10.5px] text-slate-500 font-medium mt-1 leading-none">
            Min requirement: 5 variants
          </p>
        </div>

        {/* Dynamic Compliance & Maintenance Health Alert Card */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          (factoryAlerts.activeMaint > 0 || factoryAlerts.activeAudit > 0)
            ? 'bg-red-50 text-slate-900 border-red-200 animate-pulse'
            : 'bg-white text-slate-900 border-slate-200'
        }`}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility Health Status</div>
          {(factoryAlerts.activeMaint > 0 || factoryAlerts.activeAudit > 0) ? (
            <div className="mt-1 space-y-1">
              <h3 className="text-sm font-black text-red-700 flex items-center gap-1">
                ⚠️ Issues Detected
              </h3>
              <p className="text-[10px] text-red-600 font-bold leading-tight">
                {factoryAlerts.activeMaint} Active Repairs / {factoryAlerts.activeAudit} Open Findings
              </p>
            </div>
          ) : (
            <div className="mt-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1">
                🟢 All Systems Clean
              </h3>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                Zero machine repairs or hazard observations
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs flex justify-between items-center">
          <div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Approval Status</div>
            <h3 className="text-md font-black uppercase tracking-tight text-white mt-1">
              {activePlan ? activePlan.status : 'No Plan Drafted'}
            </h3>
          </div>
          
          <div className="flex gap-1.5">
            {!activePlan ? (
              <button
                onClick={startNewPlan}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg"
              >
                Create Plan
              </button>
            ) : (
              <>
                <button
                  onClick={loadPlanToEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                {currentUser?.role === 'Director' || currentUser?.role === 'Direktur HQ' ? (
                  <button
                    onClick={handleApprovePlan}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC SEARCHABLE PLAN EDIT MODAL / DRAWER */}
      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md animate-slide-in space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-indigo-100">
            <div>
              <h3 className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 animate-spin" /> Setup Production Targets &amp; Capacity Variables
              </h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Editing Month Planning for {selectedPlanFactory} - Period June 2026</p>
            </div>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-650">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSavePlan} className="space-y-6">
            
            {/* PLAN FACTORY SELECTION INTEGRATED WITH MASTER FACTORY LOCATIONS */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 text-xs space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Target Plan Factory (Master Data Location)</label>
              <select
                value={editPlanFactory}
                onChange={(e) => setEditPlanFactory(e.target.value)}
                className="p-2.5 border rounded-lg w-full bg-white text-slate-850 font-bold text-xs"
                id="edit-plan-factory-select"
              >
                {((state?.lokasi && state.lokasi.length > 0) ? state.lokasi : [
                  { id: 'MPD', nama: 'Wonosobo factory' },
                  { id: 'SSP', nama: 'Sipahutar factory' },
                  { id: 'KKI', nama: 'Jakarta Branch' }
                ]).map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nama || loc.id} ({loc.id})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Choose the design target facility. Integrated directly with the <strong>Master Factory Locations</strong> state.
              </p>
            </div>
            
            {/* CAPACITY FORMULA BOX */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 text-xs space-y-3">
              <h4 className="font-extrabold text-indigo-905 uppercase text-[10px] tracking-wider flex items-center gap-1">
                ⚙ AUTOMATED VACUUM FRYING CAPACITY CONFIGURATION
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-semibold text-slate-700">
                <div>
                  <label className="text-[10.5px] text-slate-500 mb-1 block">Frozen Input per Machine Cycle (Kg)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFrozenInputPerCycleKg}
                    onChange={(e) => setEditFrozenInputPerCycleKg(parseInt(e.target.value) || 0)}
                    className="p-1.5 border rounded bg-white w-full text-center font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] text-slate-500 mb-1 block">Number of Vacuum Frying Machines</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editVacuumFryingMachines}
                    onChange={(e) => setEditVacuumFryingMachines(parseInt(e.target.value) || 0)}
                    className="p-1.5 border rounded bg-white w-full text-center font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] text-slate-500 mb-1 block">Daily Cycle limit per machine</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editDailyCycles}
                    onChange={(e) => setEditDailyCycles(parseInt(e.target.value) || 0)}
                    className="p-1.5 border rounded bg-white w-full text-center font-mono font-bold"
                  />
                </div>

                <div className="bg-indigo-600 text-white p-2.5 rounded-lg flex flex-col justify-center items-center">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-200">Vacuum Frying Capacity</span>
                  <span className="text-sm font-mono font-black mt-0.5">{editCapacity.toLocaleString()} Kg / day</span>
                </div>
              </div>
            </div>

            {/* GENERAL OPERATORS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <label className="text-slate-500 mb-1 block">Scheduled Working Days (Month)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editWorkingDays}
                  onChange={(e) => setEditWorkingDays(parseInt(e.target.value) || 0)}
                  className="p-2 border rounded-lg bg-white w-full font-mono text-center"
                />
              </div>

              <div>
                <label className="text-slate-500 mb-1 block">Scheduled Frying Cycles/Day</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFryingCycles}
                  onChange={(e) => setEditFryingCycles(parseInt(e.target.value) || 0)}
                  className="p-2 border rounded-lg bg-white w-full font-mono text-center"
                />
              </div>

              <div>
                <label className="text-slate-500 mb-1 block">Scheduled Operations Crew</label>
                <input
                  type="number"
                  min="1"
                  value={editOperators}
                  onChange={(e) => setEditOperators(parseInt(e.target.value) || 0)}
                  className="p-2 border rounded-lg bg-white w-full font-mono text-center"
                />
              </div>
            </div>

            {/* DYNAMIC MULTI-SELECT FRUIT ADDER */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                🍎 1. FRUIT PROCUREMENT TARGETS (MULTIPLE SELECTIONS)
              </h4>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search available active agricultural fruit variants..."
                  value={fruitSearchForm}
                  onChange={(e) => setFruitSearchForm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border rounded-lg w-full text-xs font-semibold"
                />
              </div>

              {/* Suggestions grid */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                {activeFruitVariants
                  .filter(fv => fv.nama.toLowerCase().includes(fruitSearchForm.toLowerCase()))
                  .map(fv => {
                    const isAdded = editProcPlan.some(p => p.fruitVariantId === fv.id);
                    return (
                      <button
                        key={fv.id}
                        type="button"
                        onClick={() => handleAddFruitToPlan(fv.id)}
                        className={`py-1 px-2.5 rounded font-black tracking-tight text-[10px] border transition-all ${isAdded ? 'bg-indigo-100 text-indigo-750 border-indigo-350 cursor-default' : 'bg-white text-slate-650 hover:bg-slate-105 border-slate-300 hover:border-indigo-500'}`}
                        disabled={isAdded}
                      >
                        {isAdded ? `✓ ${fv.nama}` : `+ ${fv.nama}`}
                      </button>
                    );
                  })}
              </div>

              {/* Dynamic target compiler weights */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-2 border-t">
                {editProcPlan.map((pr, index) => {
                  const peeling = editPeelPlan[index] || { yieldTargetPercent: 65 };
                  const pfName = fruitIdToName(pr.fruitVariantId);
                  return (
                    <div key={pr.fruitVariantId} className="p-2.2 bg-white rounded-lg border flex items-center justify-between gap-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveFruitFromPlan(pr.fruitVariantId)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                          title="Remove variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-slate-800 text-[11px] min-w-24">{pfName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">Monthly target (Kg)</span>
                          <input
                            type="number"
                            value={pr.targetKg}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              setEditProcPlan(prev => {
                                const c = [...prev];
                                c[index].targetKg = v;
                                return c;
                              });
                              setEditPeelPlan(prev => {
                                const c = [...prev];
                                if (c[index]) {
                                  c[index].grossRawMaterialKg = v;
                                  c[index].netFrozenOutputKg = Math.round(v * (c[index].yieldTargetPercent || 65) / 100);
                                }
                                return c;
                              });
                            }}
                            className="p-1 border rounded w-20 text-center font-mono font-bold"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">Weekly target (Kg)</span>
                          <span className="font-mono text-slate-500 font-extrabold">{(pr.targetKg / 4).toFixed(0)} Kg</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">Peel Yield target (%)</span>
                          <input
                            type="number"
                            value={peeling.yieldTargetPercent}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              setEditPeelPlan(prev => {
                                const c = [...prev];
                                if (c[index]) {
                                  c[index].yieldTargetPercent = v;
                                  c[index].netFrozenOutputKg = Math.round(c[index].grossRawMaterialKg * v / 100);
                                }
                                return c;
                              });
                            }}
                            className="p-1 border rounded w-16 text-center font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC KERIPIK OUTPUT PLANS TARGET BASED ON SKUS */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                🍪 2. FG KERIPIK OUTPUT TARGETS (KG SPECIFIC SKUS)
              </h4>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search available active finished goods chip variants SKU..."
                  value={chipSearchForm}
                  onChange={(e) => setChipSearchForm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border rounded-lg w-full text-xs font-semibold"
                />
              </div>

              {/* Suggestions grid */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                {activeChipVariants
                  .filter(cv => cv.nama.toLowerCase().includes(chipSearchForm.toLowerCase()))
                  .map(cv => {
                    const isAdded = editKeripikPlan.some(p => p.chipVariantId === cv.id);
                    return (
                      <button
                        key={cv.id}
                        type="button"
                        onClick={() => handleAddChipToPlan(cv.id)}
                        className={`py-1 px-2.5 rounded font-black tracking-tight text-[10px] border transition-all ${isAdded ? 'bg-indigo-100 text-indigo-750 border-indigo-350 cursor-default' : 'bg-white text-slate-650 hover:bg-slate-105 border-slate-300 hover:border-indigo-500'}`}
                        disabled={isAdded}
                      >
                        {isAdded ? `✓ ${cv.nama}` : `+ ${cv.nama}`}
                      </button>
                    );
                  })}
              </div>

              {/* Chip Outputs inputs list */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-2 border-t">
                {editKeripikPlan.map((ch, index) => {
                  const chName = chipIdToName(ch.chipVariantId);
                  return (
                    <div key={ch.chipVariantId} className="p-2.2 bg-white rounded-lg border flex items-center justify-between gap-4 font-semibold text-slate-705">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveChipFromPlan(ch.chipVariantId)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-slate-800 text-[11px] min-w-32">{chName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">Planned Output Target (Kg)</span>
                          <input
                            type="number"
                            value={ch.plannedOutputKg}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              setEditKeripikPlan(prev => {
                                const c = [...prev];
                                c[index].plannedOutputKg = v;
                                return c;
                              });
                            }}
                            className="p-1 border rounded w-28 text-center font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form footer actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold"
              >
                Assemble Standard Monthly Targets
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABS INTERACTION RENDER PANELS */}
      <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex gap-2 overflow-x-auto w-full">
        <button
          onClick={() => setActiveTab('factory')}
          className={`py-2 px-4 rounded-lg font-bold text-xs select-none transition ${activeTab === 'factory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Factory Performance Matrix
        </button>
        <button
          onClick={() => setActiveTab('consolidated')}
          className={`py-2 px-4 rounded-lg font-bold text-xs select-none transition ${activeTab === 'consolidated' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Consolidated Operational View
        </button>
        <button
          onClick={() => setActiveTab('mrp')}
          className={`py-2 px-4 rounded-lg font-bold text-xs select-none transition flex items-center gap-1.5 uppercase ${activeTab === 'mrp' ? 'bg-emerald-600 text-white font-extrabold' : 'text-emerald-400 hover:text-white'}`}
        >
          <Database className="w-4 h-4" /> MRP &amp; Materials (BOM Explosion)
        </button>
        <button
          onClick={() => setActiveTab('ai-insights')}
          className={`py-2 px-4 rounded-lg font-bold text-xs select-none transition flex items-center gap-1.5 uppercase ${activeTab === 'ai-insights' ? 'bg-purple-650 text-white font-extrabold bg-purple-600' : 'text-purple-400 hover:text-white'}`}
        >
          <Sparkles className="w-4 h-4" /> Operations Diagnostics &amp; AI Analytics
        </button>
      </div>

      {/* 1. FACTORY DETAIL KPI PERFORMANCE PANEL */}
      {activeTab === 'factory' && (
        <div className="space-y-6 animate-fade-in" id="factory-kpi-grids">
          
          {/* Main targets matrix comparison list */}
          {activePlan ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1">
                  🎯 TARGET MATRIX VS REAL ACHIEVEMENTS ({selectedPlanFactory} - JUNI 2026)
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-3">Agricultural Fruit Variant</th>
                      <th className="p-3 text-right">Procurement Target (Kg)</th>
                      <th className="p-3 text-right">Procurement Code Actuals</th>
                      <th className="p-3 text-right">Peeled Output Target (Kg)</th>
                      <th className="p-3 text-right">Frying Yield Target (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold text-slate-700">
                    {(activePlan?.procurementPlan || []).map((p, idx) => {
                      const actualProc = (actualData?.procurement && actualData.procurement[p.fruitVariantId]) || 0;
                      const peelPlan = (activePlan?.peelingPlan && activePlan.peelingPlan[idx]) || { netFrozenOutputKg: 0 };
                      const prodPlan = (activePlan?.productionPlan && activePlan.productionPlan[idx]) || { vfYieldTargetPercent: 40 };
                      
                      return (
                        <tr key={p.fruitVariantId} className="hover:bg-slate-50/70">
                          <td className="p-3 font-extrabold text-slate-800">{fruitIdToName(p.fruitVariantId)}</td>
                          <td className="p-3 text-right font-mono">{p.targetKg.toLocaleString()} Kg</td>
                          {renderKpiCell(actualProc, p.targetKg)}
                          <td className="p-3 text-right font-mono">{peelPlan.netFrozenOutputKg.toLocaleString()} Kg</td>
                          <td className="p-3 text-right font-mono">{prodPlan.vfYieldTargetPercent}% yield</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="p-12 border bg-white rounded-xl text-center text-slate-400 text-xs">No active monthly plan drafted for chosen Factory. Please click 'Create Plan' above.</p>
          )}

          {/* Connected Finished Goods Keripik Output target table */}
          {activePlan && activePlan.keripikOutputPlan && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h4 className="font-extrabold text-slate-905 text-xs uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-500" /> Finished Goods: Keripik Output Targets (Kg SKUs)
                </h4>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 py-0.5 px-2 rounded-full uppercase">Sourced from Master Chips Variants</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left" id="chips-target-table">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Chip Variant SKU Name</th>
                      <th className="p-3 text-right">Planned Chips Output (Kg)</th>
                      <th className="p-3 text-right">Actual Packaged Chips (Kg)</th>
                      <th className="p-3 text-right">Achievement % Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold text-slate-700">
                    {activePlan.keripikOutputPlan.map((ch) => {
                      const cvName = chipIdToName(ch.chipVariantId);
                      const actualYield = actualData.chipsOutputKg[ch.chipVariantId] || 0;
                      return (
                        <tr key={ch.chipVariantId} className="hover:bg-slate-50/70">
                          <td className="p-3 font-extrabold text-slate-800">{cvName}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-650">{ch.plannedOutputKg.toLocaleString()} Kg</td>
                          {renderKpiCell(actualYield, ch.plannedOutputKg, 'Kg')}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual Bar Yield Graphics comparison */}
          {activePlan && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Fruit Procurement comparison charts
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consolidatedBarChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}kg`} />
                    <Tooltip formatter={(v) => `${(v as number).toLocaleString()} Kg`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Planned Target (Kg)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual Achievement (Kg)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CONSOLIDATED CONSOLE TAB */}
      {activeTab === 'consolidated' && (
        <div className="space-y-6" id="consolidated-dashboard">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-extrabold text-slate-805 text-xs uppercase tracking-wider pb-3 border-b mb-4">
              Agridea manufacturing network performance metrics (June 2026 MTD)
            </h4>

            {/* Quick Summary network figures */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2">
              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1 bg-gradient-to-tr from-slate-50 to-indigo-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Procurement Net Achievements</p>
                <div className="text-xl font-mono font-black text-indigo-900">
                  {Object.values(actualData.procurement).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0).toLocaleString()} Kg
                </div>
                <p className="text-[9.5px] text-indigo-650 font-bold">Consolidated whole group received</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Peeling Output Weights MTD</p>
                <div className="text-xl font-mono font-black text-emerald-700">
                  {Object.values(actualData.peelingNet).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0).toLocaleString()} Kg
                </div>
                <p className="text-[9.5px] text-emerald-600 font-bold">Net frozen stocks compiled</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Vacuum Frying Cycles completed</p>
                <div className="text-xl font-mono font-black text-amber-700">
                  {Object.values(actualData.fryingCount).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0).toLocaleString()} Runs
                </div>
                <p className="text-[9.5px] text-slate-500 font-medium font-bold">Standard shift runs completed</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Finished packaged chip yields</p>
                <div className="text-xl font-mono font-black text-indigo-905 text-indigo-950">
                  {Object.values(actualData.chipsOutputKg).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0).toLocaleString()} Kg
                </div>
                <p className="text-[9.5px] text-slate-500 font-semibold font-bold">Aggregated finished retail pouches</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 MRP & MATERIALS EXPLOSION PANEL */}
      {activeTab === 'mrp' && (
        <div className="space-y-6 animate-fade-in" id="mrp-explosion-panel">
          {/* Header Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800 tracking-tight font-display flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600 animate-pulse" />
                Material Requirements Planning (MRP) &amp; BOM Explosion
              </h3>
              <p className="text-slate-500 font-medium">
                Pecah target output produksi menjadi kebutuhan bahan baku segar, kemasan primer/sekunder, material helper packing, serta chemical industri secara real-time.
              </p>
            </div>

            {/* MRP Control Toggles */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setMrpViewMode('active-plan')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold select-none transition ${mrpViewMode === 'active-plan' ? 'bg-indigo-650 text-white bg-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Gunakan Master Target Bulan Berjalan
              </button>
              <button
                onClick={() => setMrpViewMode('simulate')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold select-none transition ${mrpViewMode === 'simulate' ? 'bg-indigo-650 text-white bg-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Simulasi Target Kustom (Interactive)
              </button>
            </div>
          </div>

          {/* SIMULATION FORM SHELF */}
          {mrpViewMode === 'simulate' && (
            <div className="bg-gradient-to-br from-indigo-50 to-emerald-50/50 p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Pilih SKU Variant / Finished Goods</label>
                <select
                  value={mrpSelectedSku}
                  onChange={(e) => setMrpSelectedSku(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {(state.produk || []).map((p: any) => (
                    <option key={p.id} value={p.id} className="font-mono">
                      {p.id} - {p.nama} [SKU: {p.sku}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Target Output Keripik Jadi (Kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={mrpTargetKg}
                    onChange={(e) => setMrpTargetKg(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-black font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none pr-10"
                    placeholder="Contoh: 1000"
                    min="1"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 font-extrabold font-mono">Kg</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-indigo-100 flex flex-col justify-center">
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wide">Fitted Pouches Equivalent:</span>
                <span className="text-xl font-mono font-black text-indigo-700">
                  {mrpRequirements.totals.totalTargetPcs.toLocaleString()} Pcs Bags
                </span>
                <span className="text-[9.5px] text-slate-500 font-semibold leading-none mt-1">
                  Dihitung berbasis gramasi kemasan kustom master data.
                </span>
              </div>
            </div>
          )}

          {/* ACTIVE PLAN LIST DISPLAY CONTAINER */}
          {mrpViewMode === 'active-plan' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase">
                    📁 TARGET DETAILED OUTPUT BUILT-IN ({selectedPlanFactory} - JUNI 2026)
                  </h4>
                  <p className="text-slate-400 text-[10px]">Material Requirement Planning meledakkan (explosion) data target di bawah ini:</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 font-black text-[10.5px] px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider">
                  Active Operational Target
                </div>
              </div>

              {mrpRequirements.targets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl">
                  Tidak ditemukan target aktif pada Rencana Produksi pabrik {selectedPlanFactory} bulan Juni 2026. Lakukan setup target kemasan terlebih dahulu.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mrpRequirements.targets.map(tgt => {
                    const sku = (state.produk || []).find((p: any) => p.id === tgt.skuId);
                    return (
                      <div key={tgt.skuId} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded uppercase">SKU: {sku?.sku || tgt.skuId}</span>
                          <span className="font-bold text-slate-400">{tgt.skuId}</span>
                        </div>
                        <h5 className="font-black text-slate-800 truncate text-[11px] leading-tight block">{sku?.nama || tgt.skuId}</h5>
                        <div className="flex items-end justify-between pt-1">
                          <div>
                            <span className="text-slate-400 block text-[8.5px] uppercase font-extrabold">Volume Target</span>
                            <span className="text-slate-800 font-extrabold text-xs">{tgt.targetKg.toLocaleString()} Kg</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[8.5px] uppercase font-extrabold">Total Retail Bags</span>
                            <span className="text-indigo-650 text-xs font-black text-indigo-700">{tgt.targetPcs.toLocaleString()} Bags</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GRAND METRICS OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
              <span className="text-slate-400 text-[9px] uppercase font-black uppercase tracking-wider">Total Output Target Kg</span>
              <div className="text-2xl font-black font-mono tracking-tight text-white">
                {mrpRequirements.totals.totalTargetKg.toLocaleString()} Kg
              </div>
              <p className="text-[10px] text-emerald-300 font-semibold font-sans">Tonase Keripik Bersih</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[9px] uppercase font-black uppercase tracking-wider">Est. Retail Pouches Pcs</span>
              <div className="text-2xl font-black font-mono tracking-tight text-indigo-950">
                {mrpRequirements.totals.totalTargetPcs.toLocaleString()} Pcs
              </div>
              <p className="text-[10px] text-slate-500 font-semibold font-sans">Volume Kemasan Retail Bag</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[9px] uppercase font-black uppercase tracking-wider">Estimated Grand Budget</span>
              <div className="text-2xl font-black font-mono tracking-tight text-emerald-700">
                Rp {mrpRequirements.totals.totalBudget.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold font-sans">Fruit + Packing + Help Consumables</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[9px] uppercase font-black uppercase tracking-wider">Ratio Cost Per Pouch</span>
              <div className="text-2xl font-black font-mono tracking-tight text-slate-800">
                Rp {mrpRequirements.totals.totalTargetPcs > 0 ? Math.round(mrpRequirements.totals.totalBudget / mrpRequirements.totals.totalTargetPcs).toLocaleString('id-ID') : '0'}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold font-sans">COGS Material per Pouch Bag</p>
            </div>
          </div>

          {/* EXPLODED BILL OF MATERIALS SUMMARY TABLES BY CATEGORY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 leading-relaxed">
            
            {/* Category 1: Raw Fruit Materials */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-800 font-black text-xs uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                  1. Fresh Fruit Raw Materials [Buah Segar]
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Fruit Variants Master</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mrpRequirements.fruit.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 font-bold">Tidak ada kebutuhan bahan baku segar.</div>
                ) : (
                  mrpRequirements.fruit.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <span className="text-slate-800 font-extrabold block">{item.nama}</span>
                        <span className="text-slate-400 text-[9px] uppercase">Master Code: {item.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-800 font-black block text-indigo-950 text-xs">
                          {item.qtyNeeded.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {item.unit}
                        </span>
                        <span className="text-slate-400 text-[9.5px]">Est. Rp {item.costEst.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category 2: Packaging Materials */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-800 font-black text-xs uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                  2. Packaging Materials [Bahan Kemas]
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Packaging Master</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mrpRequirements.packaging.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 font-bold">Tidak ada kebutuhan packaging.</div>
                ) : (
                  mrpRequirements.packaging.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <span className="text-slate-800 font-extrabold block">{item.nama}</span>
                        <span className="text-slate-400 text-[9px] uppercase">Master Code: {item.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-800 font-black block text-indigo-950 text-xs">
                          {item.qtyNeeded.toLocaleString()} {item.unit}
                        </span>
                        <span className="text-slate-400 text-[9.5px]">Est. Rp {item.costEst.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category 3: Supporting Packing Materials */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-800 font-black text-xs uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                  3. Supporting Materials [Helper &amp; Packing]
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Supporting Master</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mrpRequirements.supporting.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 font-bold">Tidak ada kebutuhan supporting materials.</div>
                ) : (
                  mrpRequirements.supporting.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <span className="text-slate-800 font-extrabold block">{item.nama}</span>
                        <span className="text-slate-400 text-[9px] uppercase">Master Code: {item.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-800 font-black block text-indigo-950 text-xs">
                          {item.qtyNeeded.toLocaleString()} {item.unit}
                        </span>
                        <span className="text-slate-400 text-[9.5px]">Est. Rp {item.costEst.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category 4: Chemicals & Consumables */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-800 font-black text-xs uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span>
                  4. Chemicals &amp; Consumables [Bahan Penunjang &amp; Utilitas]
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Chemicals Master</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mrpRequirements.chemicals.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 font-bold">Tidak ada kebutuhan chemical consumables.</div>
                ) : (
                  mrpRequirements.chemicals.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <span className="text-slate-800 font-extrabold block">{item.nama}</span>
                        <span className="text-slate-400 text-[9px] uppercase">Master Code: {item.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-800 font-black block text-indigo-950 text-xs">
                          {item.qtyNeeded.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {item.unit}
                        </span>
                        <span className="text-slate-400 text-[9.5px]">Est. Rp {item.costEst.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* BOM Standard Info Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 font-medium">
            <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-650" />
              Standard Bill of Materials (BOM) Formula Explanation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10.5px] leading-relaxed text-slate-650">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-800 block">🍎 Apple Pouch (100g)</span>
                <p>Kebutuhan Buah Segar: 1.2 Kg/pouch (HPP Rp 14,400)</p>
                <p>Minyak Kelapa: 0.15 Liter/pouch (HPP Rp 2,775)</p>
                <p>Gast LPG: 0.20 Kg/pouch (HPP Rp 3,800)</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-800 block">🍌 Banana Pouch (100g)</span>
                <p>Kebutuhan Buah Segar: 1.4 Kg/pouch (HPP Rp 16,800)</p>
                <p>Minyak Kelapa: 0.16 Liter/pouch (HPP Rp 2,960)</p>
                <p>Gast LPG: 0.21 Kg/pouch (HPP Rp 3,990)</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-800 block">🍍 Pineapple Pouch (100g)</span>
                <p>Kebutuhan Buah Segar: 1.3 Kg/pouch (HPP Rp 15,600)</p>
                <p>Minyak Kelapa: 0.15 Liter/pouch (HPP Rp 2,775)</p>
                <p>Gast LPG: 0.20 Kg/pouch (HPP Rp 3,800)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DIAGNOSTICS & SYSTEM AI ANALYTICS PANEL */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6 animate-fade-in" id="ai-diagnostics-tab">
          
          {/* Interactive Spark Header */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-indigo-905 text-white p-6 rounded-2xl border border-purple-500/20 shadow-md flex items-center gap-4">
            <span className="p-3 bg-purple-500/20 rounded-xl text-purple-300 border border-purple-400/20">
              <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </span>
            <div>
              <h2 className="text-md font-black font-display text-white uppercase tracking-tight">AI Operational Diagnostics &amp; Capacity Analyst</h2>
              <p className="text-[10.5px] text-purple-200 mt-1">Cross-references employee geo-fenced shifts, machinery service logs, and BPOM compliance findings with frying capacity targets.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Operational stats parameters list */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-xs divide-y font-semibold text-slate-705">
              <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider pb-2 flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-purple-500" /> Operational telemetry parameters (June MTD)
              </h4>

              <div className="flex justify-between py-2.5">
                <span>Active present worker shifts (June)</span>
                <span className="font-mono text-slate-800 font-extrabold">{diagnosticsData.presentCount} shifts</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Late check-ins alerts</span>
                <span className={`font-mono font-extrabold ${diagnosticsData.lateCount > 0 ? 'text-red-500' : 'text-slate-500'}`}>{diagnosticsData.lateCount} late records</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-slate-400" /> Maintenance Downtime hours</span>
                <span className="font-mono text-amber-700 font-extrabold">{diagnosticsData.totalDowntimeHours} Hrs</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-red-505" /> Regulatory findings pending</span>
                <span className={`font-mono font-extrabold ${diagnosticsData.activeFindingsRisk > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>{diagnosticsData.activeFindingsRisk} open logs</span>
              </div>
              <div className="flex justify-between py-2.5 bg-purple-50/20 p-2 rounded-lg font-bold">
                <span>Frying capacity utilization rate</span>
                <span className="font-mono text-purple-800 text-sm font-black">{diagnosticsData.capacityUtilization}%</span>
              </div>
            </div>

            {/* Generated natural language AI output blocks */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-xs md:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">
                  Diagnostics Analysis Outcome
                </h4>
                <span className="text-[9.5px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Autonomous recommendation engine live</span>
              </div>

              {/* PROBLEM */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-red-500 flex items-center gap-1">
                  🚨 DETECTED PROBLEM &amp; BOTTLENECK IMPACT
                </span>
                <div className="p-3 bg-red-50/40 rounded-lg text-slate-700 leading-relaxed font-semibold">
                  {diagnosticsData.aiProblem}
                </div>
              </div>

              {/* CHALLENGE */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 flex items-center gap-1">
                  🎯 CORE FIELD CHALLENGE
                </span>
                <div className="p-3 bg-amber-50/40 rounded-lg text-slate-700 leading-relaxed font-semibold">
                  {diagnosticsData.aiChallenge}
                </div>
              </div>

              {/* ACTION PLAN */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 flex items-center gap-1 animate-pulse">
                  👍 IMMEDIATE ACTION PLAN RECOMMENDATIONS
                </span>
                <div className="p-3 bg-emerald-50/40 rounded-lg text-slate-750 leading-relaxed font-extrabold">
                  {diagnosticsData.aiActionPlan}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
