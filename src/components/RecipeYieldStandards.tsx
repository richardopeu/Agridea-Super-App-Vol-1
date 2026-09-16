import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Award,
  ChevronRight,
  Database,
  Truck,
  Flame,
  Scale,
  DollarSign,
  Briefcase,
  Play,
  RotateCcw,
  Check,
  UserCheck,
  Activity,
  FileText,
  Search,
  Filter,
  Plus,
  Trash2,
  Cpu,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

// Data Interfaces
export interface YieldStage {
  input: number;
  output: number;
  yieldPercent: number;
  wastePercent: number;
  lossPercent: number;
  notes?: string;
}

export interface Recipe {
  fruitVariantId: string;
  prepMethod: string;
  peelingMethod: string;
  freezingMethod: string;
  fryingSettings: {
    oilType: string;
    temperature: number; // °C
    pressure: number;    // kPa
    duration: number;    // minutes
  };
  qcStandard: string;
  packagingStandard: string;
  notes?: string;
}

export interface YieldStandardHeader {
  id: string; // e.g. YS-01
  fruitVariantId: string;
  productVariantId: string; // chip SKU
  factory: string; // e.g. MPD, SSP, JKT, All
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Archived';
  version: string;
  effectiveDate: string;
  expiryDate: string;
  notes?: string;
  stage1: YieldStage; // Fresh -> Peeling
  stage2: YieldStage; // Peeling -> Frozen
  stage3: YieldStage; // Frozen -> Chips
  stage4: YieldStage; // Chips -> QC Passed
  recipe: Recipe;
  approvalStage: 'Creator' | 'Production Manager' | 'HQ Production' | 'Director Approved';
  approver?: string;
  approvalDate?: string;
  approvalNotes?: string;
}

interface SupplierScore {
  supplierId: string;
  supplierName: string;
  fruitId: string;
  expectedYield: number;
  actualYield: number;
  variance: number;
  status: 'Above Standard' | 'Below Standard';
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

interface Props {
  state: {
    produk: any[];
    fruitVariants: any[];
    chipVariants: any[];
    packagingMaster: any[];
    supportingMaster: any[];
    chemicalsMaster: any[];
    stocks: any[];
  };
  logActivity: (module: string, desc: string, detail?: any) => void;
  currentUser: {
    role: string;
    namaLengkap: string;
    username: string;
  };
}

export default function RecipeYieldStandards({ state, logActivity, currentUser }: Props) {
  // Tabs: 'dashboard' | 'standards' | 'calculator' | 'scorecard' | 'capacity' | 'costing' | 'performance'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'standards' | 'calculator' | 'scorecard' | 'capacity' | 'costing' | 'performance'>('dashboard');

  const [standards, setStandards] = useState<YieldStandardHeader[]>(() => {
    const localData = localStorage.getItem('agridea_yield_standards');
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error("Failed to parse standards", e);
      }
    }

    // Default pre-seeded standards matching exact instruction requirements
    const defaults: YieldStandardHeader[] = [
      {
        id: 'YS-01',
        fruitVariantId: 'FV-01', // Pineapple
        productVariantId: 'PRD-06',
        factory: 'All',
        status: 'Approved',
        version: '1.0',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Pineapple standard formula parameters',
        stage1: { input: 100, output: 62, yieldPercent: 62, wastePercent: 38, lossPercent: 0, notes: 'Manual crown skinning waste' },
        stage2: { input: 62, output: 59, yieldPercent: 95, wastePercent: 0, lossPercent: 5, notes: 'Thawing moisture evaporation' },
        stage3: { input: 59, output: 14.16, yieldPercent: 24, wastePercent: 0, lossPercent: 76, notes: 'Sugar extraction vacuum moisture reduction' },
        stage4: { input: 14.16, output: 13.45, yieldPercent: 95, wastePercent: 5, lossPercent: 0, notes: 'Reject grade segregation' },
        recipe: {
          fruitVariantId: 'FV-01',
          prepMethod: 'Crown removal, longitudinal washing core',
          peelingMethod: 'Circular skinning cutter',
          freezingMethod: 'IQF Blast freezer -28°C for 5 hours',
          fryingSettings: { oilType: 'Coconut Oil', temperature: 84, pressure: 93, duration: 45 },
          qcStandard: 'Residual oil < 2%, Golden color index ≥ 7',
          packagingStandard: 'Printed standing pouch 100g premium aluminum foil foil lining, fully flushed nitrogen',
          notes: 'Standard sweet variant parameters'
        },
        approvalStage: 'Director Approved',
        approver: 'Jefri Sirait',
        approvalDate: '2026-06-01',
        approvalNotes: 'Director approved for all factories active usage.'
      },
      {
        id: 'YS-02',
        fruitVariantId: 'FV-02', // Jackfruit
        productVariantId: 'PRD-03',
        factory: 'All',
        status: 'Approved',
        version: '1.0',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Seed manual extraction guidelines',
        stage1: { input: 100, output: 55, yieldPercent: 55, wastePercent: 45, lossPercent: 0, notes: 'Sacking seed, fiber separation' },
        stage2: { input: 55, output: 52.25, yieldPercent: 95, wastePercent: 0, lossPercent: 5, notes: 'Drip weight reduction' },
        stage3: { input: 52.25, output: 11.5, yieldPercent: 22, wastePercent: 0, lossPercent: 78, notes: 'Intense water flash evacuation' },
        stage4: { input: 11.5, output: 10.93, yieldPercent: 95, wastePercent: 5, lossPercent: 0, notes: 'Grade B sorting' },
        recipe: {
          fruitVariantId: 'FV-02',
          prepMethod: 'Rag and central column peeling manual split',
          peelingMethod: 'Oil smeared hand slicer',
          freezingMethod: 'Rapid cabinet tunnel -22°C',
          fryingSettings: { oilType: 'Coconut Oil', temperature: 86, pressure: 95, duration: 52 },
          qcStandard: 'Starch crystallization ≥ 85%, moisture ≤ 1.5%',
          packagingStandard: 'Slick printed custom standing pouches 100g, sealed at 180°C bar',
          notes: 'Rich fructose caramelized formula'
        },
        approvalStage: 'Director Approved',
        approver: 'Richardo Utoyo',
        approvalDate: '2026-06-02'
      },
      {
        id: 'YS-03',
        fruitVariantId: 'FV-03', // Salak
        productVariantId: 'PRD-04',
        factory: 'All',
        status: 'Approved',
        version: '2.1',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Wonosobo Factory Premium Quality standard',
        stage1: { input: 100, output: 68, yieldPercent: 68, wastePercent: 32, lossPercent: 0, notes: 'Shell + black tip seed exclusion' },
        stage2: { input: 68, output: 65.28, yieldPercent: 96, wastePercent: 0, lossPercent: 4, notes: 'Pre-cool freezer crystallization' },
        stage3: { input: 65.28, output: 17.63, yieldPercent: 27, wastePercent: 0, lossPercent: 73, notes: 'Rigid body cellular water escape' },
        stage4: { input: 17.63, output: 16.74, yieldPercent: 95, wastePercent: 5, lossPercent: 0, notes: 'Broken flakes sieve mesh 10' },
        recipe: {
          fruitVariantId: 'FV-03',
          prepMethod: 'Manual peeling, stone separation, flesh split into 2-3 slices',
          peelingMethod: 'Manual skinning glove',
          freezingMethod: 'Pre-cooled blast room for 8 hours',
          fryingSettings: { oilType: 'Coconut Oil', temperature: 82, pressure: 94, duration: 42 },
          qcStandard: 'Tartness index 4-6, crispy crunch load > 12N',
          packagingStandard: 'Metallic premium envelope pouch 100g',
          notes: 'Lower temperature frying to prevent sour oxidation'
        },
        approvalStage: 'Director Approved',
        approver: 'Afi',
        approvalDate: '2026-06-03'
      },
      {
        id: 'YS-04',
        fruitVariantId: 'FV-05', // Banana (Raja)
        productVariantId: 'PRD-02',
        factory: 'All',
        status: 'Approved',
        version: '1.0',
        effectiveDate: '2026-05-15',
        expiryDate: '2027-05-15',
        notes: 'Raja Banana standard sweet parameter',
        stage1: { input: 100, output: 65, yieldPercent: 65, wastePercent: 35, lossPercent: 0, notes: 'Skin weight removal ratio' },
        stage2: { input: 65, output: 63.05, yieldPercent: 97, wastePercent: 0, lossPercent: 3, notes: 'Cohesive freeze weight reduction' },
        stage3: { input: 63.05, output: 16.39, yieldPercent: 26, wastePercent: 0, lossPercent: 74, notes: 'Vaporized structural cell extraction' },
        stage4: { input: 16.39, output: 15.74, yieldPercent: 96, wastePercent: 4, lossPercent: 0, notes: 'Symmetry visual check' },
        recipe: {
          fruitVariantId: 'FV-05',
          prepMethod: 'Horizontal coin slicer cutter 4mm caliber',
          peelingMethod: 'Hand slip leverage tool',
          freezingMethod: 'Double quick plate contact frozen at -30°C',
          fryingSettings: { oilType: 'Coconut Oil', temperature: 88, pressure: 97, duration: 48 },
          qcStandard: 'Starch stickiness < 3%, moisture < 2.0%',
          packagingStandard: 'Standing pouch 150g fully sealed',
          notes: 'Highly sensitive fructose caramelization point'
        },
        approvalStage: 'Director Approved',
        approver: 'Jefri Sirait',
        approvalDate: '2026-05-20'
      },
      {
        id: 'YS-05',
        fruitVariantId: 'FV-07', // Mango
        productVariantId: 'PRD-01', // proxying placeholder for mango chips
        factory: 'MPD',
        status: 'Approved',
        version: '1.2',
        effectiveDate: '2026-05-20',
        expiryDate: '2027-05-20',
        notes: 'Arumanis variant special low moisture formulation',
        stage1: { input: 100, output: 60, yieldPercent: 60, wastePercent: 40, lossPercent: 0, notes: 'Flat central core seed waste' },
        stage2: { input: 60, output: 57, yieldPercent: 95, wastePercent: 0, lossPercent: 5, notes: 'Water separation during static hold' },
        stage3: { input: 57, output: 13.11, yieldPercent: 23, wastePercent: 0, lossPercent: 77, notes: 'Frying cell moisture extraction' },
        stage4: { input: 13.11, output: 12.45, yieldPercent: 95, wastePercent: 5, lossPercent: 0, notes: 'Soft chips discard' },
        recipe: {
          fruitVariantId: 'FV-07',
          prepMethod: 'Lengthwise skin split, stone excision spoon',
          peelingMethod: 'Automated conveyor slicer 5.5mm',
          freezingMethod: 'Extended cold hold cabinet at -25°C',
          fryingSettings: { oilType: 'Coconut Oil', temperature: 85, pressure: 93, duration: 55 },
          qcStandard: 'Fructan concentration standard, high crunch value',
          packagingStandard: 'Poly-laminated custom envelope pouches',
          notes: 'Must not use over-ripe specimen'
        },
        approvalStage: 'Director Approved',
        approver: 'Richard Petricius',
        approvalDate: '2026-05-25'
      }
    ];
    return defaults;
  });

  // State elements
  const [selectedStandardId, setSelectedStandardId] = useState<string>('YS-01');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Search/Filters
  const [filterFruit, setFilterFruit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchCode, setSearchCode] = useState('');

  // Sku/Ingredient Target for Planning Tool
  const [targetChipsQty, setTargetChipsQty] = useState<number>(1000); // 1000 Kg Finished chips!
  const [selectedPlanningStandardId, setSelectedPlanningStandardId] = useState<string>('YS-01');

  // Interactive slide factor for simulation
  const [simulatedStandardYieldStage3, setSimulatedStandardYieldStage3] = useState<number>(24);
  const [simulatedActualYieldStage3, setSimulatedActualYieldStage3] = useState<number>(20);
  const [simulatedFreshPrice, setSimulatedFreshPrice] = useState<number>(12000);

  // New Standard form state
  const [formData, setFormData] = useState<Partial<YieldStandardHeader>>({
    id: '',
    fruitVariantId: 'FV-01',
    productVariantId: 'PRD-01',
    factory: 'All',
    status: 'Draft',
    version: '1.0',
    effectiveDate: '2026-06-01',
    expiryDate: '2027-06-01',
    notes: '',
    stage1: { input: 100, output: 62, yieldPercent: 62, wastePercent: 38, lossPercent: 0 },
    stage2: { input: 100, output: 95, yieldPercent: 95, wastePercent: 0, lossPercent: 5 },
    stage3: { input: 100, output: 24, yieldPercent: 24, wastePercent: 0, lossPercent: 76 },
    stage4: { input: 100, output: 95, yieldPercent: 95, wastePercent: 5, lossPercent: 0 },
    recipe: {
      fruitVariantId: 'FV-01',
      prepMethod: '',
      peelingMethod: '',
      freezingMethod: '',
      fryingSettings: { oilType: 'Coconut Oil', temperature: 84, pressure: 93, duration: 45 },
      qcStandard: '',
      packagingStandard: ''
    }
  });

  // Capacity slider settings for Capacity Planning Tool
  const [freshCap, setFreshCap] = useState<number>(5000); // kg/day
  const [frozenCap, setFrozenCap] = useState<number>(4000); // kg/day
  const [fryingCap, setFryingCap] = useState<number>(1200); // batch inputs (dry/frozen) in kg
  const [packagingCap, setPackagingCap] = useState<number>(10000); // pcs/day

  // Supplier Yields pre-seed (Expected vs Actual comparison)
  const supplierScores = useMemo<SupplierScore[]>(() => {
    return [
      { supplierId: 'SUP-01', supplierName: 'Koperasi Tani Makmur Batu', fruitId: 'FV-04', expectedYield: 24, actualYield: 26.5, variance: 2.5, status: 'Above Standard', rank: 1, trend: 'up' },
      { supplierId: 'SUP-01', supplierName: 'Koperasi Tani Makmur Batu', fruitId: 'FV-01', expectedYield: 24, actualYield: 25.1, variance: 1.1, status: 'Above Standard', rank: 2, trend: 'stable' },
      { supplierId: 'SUP-02', supplierName: 'CV Pisang Jaya Dampit', fruitId: 'FV-05', expectedYield: 26, actualYield: 25.8, variance: -0.2, status: 'Above Standard', rank: 3, trend: 'stable' },
      { supplierId: 'SUP-03', supplierName: 'Agro Salak Pondoh Sleman', fruitId: 'FV-03', expectedYield: 27, actualYield: 22.4, variance: -4.6, status: 'Below Standard', rank: 4, trend: 'down' }
    ];
  }, []);

  const alerts = useMemo(() => {
    const list: { id: string; fruit: string; factory: string; type: string; std: number; act: number; status: 'Critical' | 'Warning' }[] = [];
    standards.forEach(std => {
      const actualYieldSim = std.id === 'YS-01' ? simulatedActualYieldStage3 / 100 : (std.stage3.yieldPercent / 100) * 0.94; // slightly lower
      const stdYieldSim = std.id === 'YS-01' ? simulatedStandardYieldStage3 / 100 : (std.stage3.yieldPercent / 100);
      
      if (std.id === 'YS-01' && actualYieldSim < stdYieldSim) {
        list.push({
          id: `ALT-YLD-${std.id}`,
          fruit: 'Nanas (Pineapple)',
          factory: 'Wonosobo Factory',
          type: 'Frying Yield Low deviation',
          std: stdYieldSim * 100,
          act: actualYieldSim * 100,
          status: 'Critical'
        });
      }

      // Check stage 2 thawing losses
      if ((std.stage2.lossPercent || 0) > 4.5) {
        list.push({
          id: `ALT-LOSS-${std.id}`,
          fruit: state.fruitVariants.find(f => f.id === std.fruitVariantId)?.nama || 'Buah',
          factory: std.factory === 'All' ? 'Wonosobo Factory' : std.factory,
          type: 'High Thawing/Frozen Weight Loss alert',
          std: 5.0,
          act: std.stage2.lossPercent,
          status: 'Warning'
        });
      }
    });

    return list;
  }, [standards, simulatedStandardYieldStage3, simulatedActualYieldStage3, state.fruitVariants]);

  // AI Insights Generation based on calculations
  const aiAnalysis = useMemo(() => {
    const yieldGap = simulatedStandardYieldStage3 - simulatedActualYieldStage3;
    const pineappleActive = standards.find(s => s.id === 'YS-01');
    return {
      problem: `Pineapple vacuum frying standard yield decreased from standard ${simulatedStandardYieldStage3}% to actual ${simulatedActualYieldStage3}%.`,
      challenge: `High sucrose moisture retention inside the frozen batches triggers an extended water extraction cycle, which causes raw structural tissue shrinkage and caramelization loss.`,
      rootCause: `Thawing hold duration exceeded 120 minutes in ambient temperature (+28°C) before frying, causing structural membrane collapse.`,
      actionPlan: `1. Mandate the IQF blast freezer cell cooling optimization to reduce static surface crystallization.
2. Maintain standard frying vacuum parameters at 93 kPa with maximum temperature threshold set to 84°C.
3. Review supplier skin peeling scrap waste ratio to assure standard fruit variant size consistency.`
    };
  }, [simulatedStandardYieldStage3, simulatedActualYieldStage3, standards]);

  // Retrieve Active standards based on filter
  const filteredStandards = useMemo(() => {
    return standards.filter(s => {
      const fruitName = state.fruitVariants.find(f => f.id === s.fruitVariantId)?.nama || '';
      const matchesFruit = filterFruit ? s.fruitVariantId === filterFruit : true;
      const matchesStatus = filterStatus ? s.status === filterStatus : true;
      const matchesSearch = searchCode ? (s.id.toLowerCase().includes(searchCode.toLowerCase()) || fruitName.toLowerCase().includes(searchCode.toLowerCase())) : true;
      return matchesFruit && matchesStatus && matchesSearch;
    });
  }, [standards, filterFruit, filterStatus, searchCode, state.fruitVariants]);

  const activeStandard = useMemo(() => {
    return standards.find(s => s.id === selectedStandardId) || standards[0];
  }, [standards, selectedStandardId]);

  // Production planning calculation helper
  const planningYieldChain = useMemo(() => {
    const std = standards.find(s => s.id === selectedPlanningStandardId) || standards[0];
    if (!std) return { fresh: 0, peeling: 0, frozen: 0, overallYield: 0 };

    // Yield chain percentages
    const s1 = (std.stage1.yieldPercent || 0) / 100; // Fresh -> Peeling
    const s2 = (std.stage2.yieldPercent || 0) / 100; // Peeling -> Frozen
    const s3 = (std.id === 'YS-01' ? simulatedStandardYieldStage3 / 100 : (std.stage3.yieldPercent || 0) / 100); // Frozen -> Chips
    const s4 = (std.stage4.yieldPercent || 0) / 100; // Chips -> QC Passed

    const overallYield = s1 * s2 * s3 * s4;

    // Backward conversion formula: Required weights
    // Target Chips ÷ Stage 4 Yield ÷ Stage 3 Yield ÷ Stage 2 Yield ÷ Stage 1 Yield = Required Fresh Fruit
    const reqQCChips = targetChipsQty;
    const reqFryingInput = reqQCChips / (s4 || 1);
    const reqFrozenInput = reqFryingInput / (s3 || 1);
    const reqPeelerInput = reqFrozenInput / (s2 || 1);
    const reqFreshInput = reqPeelerInput / (s1 || 1);

    // MRP Consumables / Packaging items
    // Pouch size is defined inside chip variants, let's look it up
    const chipVar = state.chipVariants.find(c => c.fruitVariantId === std.fruitVariantId) || state.chipVariants[0];
    const gramasi = chipVar ? (parseInt(chipVar.packagingSize) || 100) : 100;
    const totalPcs = Math.ceil((targetChipsQty * 1000) / gramasi);
    const totalBoxes = Math.ceil(totalPcs / 24); // 24 pouch per box

    // Proportional standard utility calculations
    const reqOilLiter = reqFrozenInput * 0.15; // 0.15 Liter per kg frozen
    const reqGasKg = reqFrozenInput * 0.18; // 0.18 Kg LPG per kg frozen

    return {
      fresh: reqFreshInput,
      peeling: reqPeelerInput,
      frozen: reqFrozenInput,
      frying: reqFryingInput,
      overallYield,
      totalPcs,
      totalBoxes,
      reqOilLiter,
      reqGasKg,
      gramasi
    };
  }, [standards, selectedPlanningStandardId, targetChipsQty, simulatedStandardYieldStage3, state.chipVariants]);

  // Capacity Bottleneck check
  const capacityMetrics = useMemo(() => {
    // Check how much target can be processed under defined capacities
    // If user wants matching targetChipsQty, let's reverse calculate the fresh fruit required daily
    const dailyFreshReq = planningYieldChain.fresh;
    const dailyPeelingReq = planningYieldChain.peeling;
    const dailyFrozenReq = planningYieldChain.frozen;
    const dailyPcsReq = planningYieldChain.totalPcs;

    const freshUtilization = (dailyFreshReq / freshCap) * 100;
    const peelingUtilization = (dailyPeelingReq / frozenCap) * 100; // proxying peeling using frozenCap
    const fryingUtilization = (dailyFrozenReq / fryingCap) * 100;
    const packagingUtilization = (dailyPcsReq / packagingCap) * 100;

    const stages = [
      { name: 'Fresh Receiving Stage', util: freshUtilization, cap: freshCap, req: dailyFreshReq, unit: 'Kg/day' },
      { name: 'Peeling Output Capacity', util: peelingUtilization, cap: frozenCap, req: dailyPeelingReq, unit: 'Kg/day' },
      { name: 'Vacuum Frying Core Capacity', util: fryingUtilization, cap: fryingCap, req: dailyFrozenReq, unit: 'Kg/day' },
      { name: 'Packaging Sorter Line', util: packagingUtilization, cap: packagingCap, req: dailyPcsReq, unit: 'Pcs/day' }
    ];

    const bottleneck = [...stages].sort((a, b) => b.util - a.util)[0];

    return {
      stages,
      bottleneck,
      isExcess: stages.some(s => s.util > 100)
    };
  }, [planningYieldChain, freshCap, frozenCap, fryingCap, packagingCap]);

  // Costing yield impact margins
  const costImpactInfo = useMemo(() => {
    // Compare Standard Yield vs Low Yield
    // standard overall yield vs simulated actual chain
    const std = standards.find(s => s.id === 'YS-01') || standards[0];
    const s1 = (std.stage1.yieldPercent || 0) / 100;
    const s2 = (std.stage2.yieldPercent || 0) / 100;
    const s3Std = simulatedStandardYieldStage3 / 100;
    const s3Act = simulatedActualYieldStage3 / 100;
    const s4 = (std.stage4.yieldPercent || 0) / 100;

    const stdOverall = s1 * s2 * s3Std * s4;
    const actOverall = s1 * s2 * s3Act * s4;

    // Standard raw cost per Kg finished chip = fresh purchase price / overall conversion yield
    const stdRawCostPerKg = simulatedFreshPrice / stdOverall;
    const actRawCostPerKg = simulatedFreshPrice / actOverall;
    const varianceCostPerKg = actRawCostPerKg - stdRawCostPerKg;

    // Standard overall costs (including premium pouch, oil, utilities estimation)
    const extraOverheadStd = 5000; // e.g. labor + boiler water per kg
    const packGramasi = planningYieldChain.gramasi;
    
    const stdCostPerPouch = (stdRawCostPerKg * (packGramasi / 1000)) + 650; // default packaging unit cost + foil sticker
    const actCostPerPouch = (actRawCostPerKg * (packGramasi / 1000)) + 650;

    const standardRetailPrice = 18000;
    const stdMarginPct = ((standardRetailPrice - stdCostPerPouch) / standardRetailPrice) * 100;
    const actMarginPct = ((standardRetailPrice - actCostPerPouch) / standardRetailPrice) * 100;

    // Total financial loss over target quantity
    const profitLossImpact = (actCostPerPouch - stdCostPerPouch) * planningYieldChain.totalPcs;

    return {
      stdOverall,
      actOverall,
      stdRawCostPerKg,
      actRawCostPerKg,
      varianceCostPerKg,
      stdCostPerPouch,
      actCostPerPouch,
      stdMarginPct,
      actMarginPct,
      profitLossImpact,
      standardRetailPrice
    };
  }, [simulatedStandardYieldStage3, simulatedActualYieldStage3, simulatedFreshPrice, planningYieldChain, standards]);

  // Pre-seed chart data for Recharts
  const monthlyYieldChartData = useMemo(() => {
    return [
      { month: 'Jan', Nanas: 13.5, Nangka: 10.2, Salak: 16.5, Pisang: 15.6 },
      { month: 'Feb', Nanas: 13.8, Nangka: 10.5, Salak: 16.2, Pisang: 15.8 },
      { month: 'Mar', Nanas: 13.2, Nangka: 10.1, Salak: 15.8, Pisang: 15.4 },
      { month: 'Apr', Nanas: 12.9, Nangka: 9.8, Salak: 16.9, Pisang: 15.1 },
      { month: 'May', Nanas: 13.45, Nangka: 10.93, Salak: 16.74, Pisang: 15.74 },
      { month: 'Jun', Nanas: simulatedActualYieldStage3 * 0.62 * 0.95 * 0.95, Nangka: 10.85, Salak: 16.65, Pisang: 15.65 }
    ];
  }, [simulatedActualYieldStage3]);

  const factoryYieldData = [
    { name: 'Wonosobo (MPD)', Standard: 13.45, Actual: 13.12 },
    { name: 'Sipahutar (SSP)', Standard: 13.45, Actual: 13.38 },
    { name: 'Jakarta (AGDN)', Standard: 13.45, Actual: 12.85 }
  ];

  // Forms submit save/edit
  const handleSaveStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.fruitVariantId) {
      alert("Format error: Code and Fruit Variant selection are required.");
      return;
    }

    // Auto calculate Stage Yield percents & overalls
    const buildStage = (inp: number, out: number): YieldStage => {
      const yld = inp > 0 ? (out / inp) * 100 : 0;
      return {
        input: inp,
        output: out,
        yieldPercent: parseFloat(yld.toFixed(2)),
        wastePercent: parseFloat((100 - yld).toFixed(2)),
        lossPercent: 0
      };
    };

    const s1 = buildStage(Number(formData.stage1?.input || 100), Number(formData.stage1?.output || 62));
    const s2 = buildStage(Number(formData.stage2?.input || 100), Number(formData.stage2?.output || 95));
    const s3 = buildStage(Number(formData.stage3?.input || 100), Number(formData.stage3?.output || 24));
    const s4 = buildStage(Number(formData.stage4?.input || 100), Number(formData.stage4?.output || 95));

    const standardRecord: YieldStandardHeader = {
      id: formData.id,
      fruitVariantId: formData.fruitVariantId,
      productVariantId: formData.productVariantId || 'PRD-01',
      factory: formData.factory || 'All',
      status: formData.status as any || 'Draft',
      version: formData.version || '1.0',
      effectiveDate: formData.effectiveDate || '2026-06-01',
      expiryDate: formData.expiryDate || '2027-06-01',
      notes: formData.notes,
      stage1: s1,
      stage2: s2,
      stage3: s3,
      stage4: s4,
      recipe: {
        fruitVariantId: formData.fruitVariantId,
        prepMethod: formData.recipe?.prepMethod || 'Standard mechanical peel',
        peelingMethod: formData.recipe?.peelingMethod || 'Automated industrial peeler',
        freezingMethod: formData.recipe?.freezingMethod || 'Static chamber contact freeze',
        fryingSettings: {
          oilType: formData.recipe?.fryingSettings?.oilType || 'Coconut Oil',
          temperature: Number(formData.recipe?.fryingSettings?.temperature || 84),
          pressure: Number(formData.recipe?.fryingSettings?.pressure || 93),
          duration: Number(formData.recipe?.fryingSettings?.duration || 45)
        },
        qcStandard: formData.recipe?.qcStandard || 'Residual oil < 2%, crunch loading threshold limit',
        packagingStandard: formData.recipe?.packagingStandard || 'Premium foil standing pouches'
      },
      approvalStage: formData.approvalStage as any || 'Creator',
      approver: formData.approver,
      approvalNotes: formData.approvalNotes
    };

    let updatedStandards;
    if (isEditing) {
      updatedStandards = standards.map(s => s.id === formData.id ? standardRecord : s);
      logActivity('Recipe & Yield Standards', `Mengupdate data standard yield & resep untuk kode: ${formData.id}`, standardRecord);
    } else {
      updatedStandards = [...standards, standardRecord];
      logActivity('Recipe & Yield Standards', `Membuat data standard yield & resep baru: ${formData.id}`, standardRecord);
    }

    setStandards(updatedStandards);
    localStorage.setItem('agridea_yield_standards', JSON.stringify(updatedStandards));
    setIsFormOpen(false);
    setIsEditing(false);
    setSelectedStandardId(standardRecord.id);
  };

  const handleStartEdit = (std: YieldStandardHeader) => {
    setFormData(std);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleStartCreate = () => {
    const nextId = `YS-0${standards.length + 1}`;
    setFormData({
      id: nextId,
      fruitVariantId: 'FV-01',
      productVariantId: 'PRD-01',
      factory: 'All',
      status: 'Draft',
      version: '1.0',
      effectiveDate: '2026-06-01',
      expiryDate: '2027-06-01',
      notes: '',
      stage1: { input: 100, output: 62, yieldPercent: 62, wastePercent: 38, lossPercent: 0 },
      stage2: { input: 100, output: 95, yieldPercent: 95, wastePercent: 0, lossPercent: 5 },
      stage3: { input: 100, output: 24, yieldPercent: 24, wastePercent: 0, lossPercent: 76 },
      stage4: { input: 100, output: 95, yieldPercent: 95, wastePercent: 5, lossPercent: 0 },
      recipe: {
        fruitVariantId: 'FV-01',
        prepMethod: '',
        peelingMethod: '',
        freezingMethod: '',
        fryingSettings: { oilType: 'Coconut Oil', temperature: 84, pressure: 93, duration: 45 },
        qcStandard: '',
        packagingStandard: ''
      }
    });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleDeleteStandard = (id: string) => {
    if (!window.confirm(`Hapus format standard yield ${id} dari master?`)) return;
    const filtered = standards.filter(s => s.id !== id);
    setStandards(filtered);
    localStorage.setItem('agridea_yield_standards', JSON.stringify(filtered));
    logActivity('Recipe & Yield Standards', `Menghapus standard yield dengan ID ${id}`);
    if (selectedStandardId === id) {
      setSelectedStandardId(filtered[0]?.id || '');
    }
  };

  // Quick state trigger approval transitions (PM -> HQ -> Director -> Approved)
  const handleWorkflowTransition = (stdId: string, stage: 'Production Manager' | 'HQ Production' | 'Director Approved' | 'Approved') => {
    const matched = standards.find(s => s.id === stdId);
    if (!matched) return;

    let nextApprovalStage = matched.approvalStage;
    let nextStatus = matched.status;

    if (stage === 'Production Manager') {
      nextApprovalStage = 'Production Manager';
      nextStatus = 'Pending Approval';
    } else if (stage === 'HQ Production') {
      nextApprovalStage = 'HQ Production';
      nextStatus = 'Pending Approval';
    } else if (stage === 'Director Approved') {
      nextApprovalStage = 'Director Approved';
      nextStatus = 'Approved';
    }

    const updated: YieldStandardHeader = {
      ...matched,
      approvalStage: nextApprovalStage,
      status: nextStatus,
      approver: currentUser.namaLengkap || currentUser.username,
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes: `Workflow transition approved to stage: [${nextApprovalStage}] by ${currentUser.role}`
    };

    const updatedList = standards.map(s => s.id === stdId ? updated : s);
    setStandards(updatedList);
    localStorage.setItem('agridea_yield_standards', JSON.stringify(updatedList));
    logActivity('Recipe & Yield Standards', `Work flow transition pada Standard ${stdId} disepakati ke level: ${nextApprovalStage}`, updated);
  };

  return (
    <div className="space-y-6" id="recipe-yield-standard-module">
      
      {/* Visual Elegant Header */}
      <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-indigo-900 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> High Performance Standard Controls
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
              MASTER RECIPE &amp; YIELD STANDARD
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium max-w-3xl leading-relaxed">
              Arsitektur meledakkan formulasi proses produksi (peeling, freezing, vacuum frying, grading) dan standardisasi optimalisasi bahan baku melintasi yield engine standar pabrik agridea.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartCreate}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 uppercase cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" /> Buat Yield &amp; Resep
            </button>
          </div>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-indigo-900/60 font-mono text-xs text-indigo-300">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsFormOpen(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            📊 Yield Center Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('standards'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'standards' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            📋 Master Resep &amp; Yield ({standards.length})
          </button>
          <button
            onClick={() => { setActiveTab('calculator'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'calculator' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            🧮 MRP &amp; Planning Engine
          </button>
          <button
            onClick={() => { setActiveTab('scorecard'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'scorecard' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            🏅 Supplier Scorecard
          </button>
          <button
            onClick={() => { setActiveTab('capacity'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'capacity' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            ⚡ Cap-Planning Simulator
          </button>
          <button
            onClick={() => { setActiveTab('costing'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'costing' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            💰 Yield-Costing Control
          </button>
          <button
            onClick={() => { setActiveTab('performance'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'performance' ? 'bg-white text-indigo-950 shadow-md transform -translate-y-0.5 font-extrabold' : 'hover:bg-indigo-900/40 hover:text-white'}`}
          >
            🎯 Multi-Step Performance Trace
          </button>
        </div>
      </div>

      {/* ALERT CENTER (GLOBAL BANNER) */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-red-950 uppercase tracking-wide">Standard Yield Devian Alerts</h4>
              <p className="text-[11px] text-red-800 font-medium">Berdasarkan data sensor/faktual, terdapat {alerts.length} tahap produksi yang kinerjanya di bawah rentang toleransi SOP.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold">
            {alerts.map((alt, idx) => (
              <span key={idx} className="bg-red-100 text-red-900 px-2 py-1 rounded-md border border-red-200">
                ⚠️ [{alt.factory}] {alt.fruit}: {alt.type} ({alt.act.toFixed(1)}% vs Std {alt.std.toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 1: YIELD DASHBOARD (OFFICIAL INTEL CENTER) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in" id="dashboard-yield-tab">
          
          {/* Executive Overview row cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Best Yield Fruit</span>
                <span className="text-lg font-black text-slate-800">Salak (16.74%)</span>
                <span className="text-[10px] text-emerald-600 font-bold block">Expected standard met</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Worst Yield Fruit</span>
                <span className="text-lg font-black text-red-700">Nangka (10.93%)</span>
                <span className="text-[10px] text-red-500 font-bold block">45% Peeled core waste</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Best Supplier Yield</span>
                <span className="text-base font-black text-slate-800">Koperasi Tani Makmur</span>
                <span className="text-[10px] text-emerald-600 font-bold block">+2.5% Premium Apples</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Est. Yield Loss Cost</span>
                <span className="text-lg font-black text-red-600">Rp {Math.round(costImpactInfo.profitLossImpact).toLocaleString()}</span>
                <span className="text-[10px] text-red-500 font-bold block">Impacted on target qty</span>
              </div>
            </div>
          </div>

          {/* Core Analytics charts block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Time series index trend */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Overall End-to-End Yield Trend (%)</h3>
                  <p className="text-slate-400 text-[10px] font-medium">Laju penyerapan recovery kering kripik final dari berat segar bahan baku.</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-600 rounded"></span> Nanas</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 rounded"></span> Nangka</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded"></span> Salak</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyYieldChartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis label={{ value: 'Overall Recovery %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #cbd5e1' }} />
                    <Line type="monotone" dataKey="Nanas" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Nangka" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="Salak" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Advisor Column Dashboard */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-indigo-950 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/20 text-indigo-200 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> AI Yield Diagnosis
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-red-300 font-bold block uppercase tracking-wider">ISSUE INSTANCE</span>
                  <p className="text-xs font-black text-white italic">"{aiAnalysis.problem}"</p>
                </div>
                <div className="text-[11px] text-indigo-200 space-y-2">
                  <p><strong className="text-white">Challenge:</strong> {aiAnalysis.challenge}</p>
                  <p><strong className="text-white">Root Cause:</strong> {aiAnalysis.rootCause}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5">
                <span className="text-[9.5px] text-emerald-400 font-bold block uppercase tracking-wider">🤖 RECOMMENDED ACTION PLAN</span>
                <span className="text-[10px] text-indigo-100 block/ leading-relaxed whitespace-pre-line">{aiAnalysis.actionPlan}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Factory Comparison graph */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Yield Recovery by Facility Locations</h3>
                <p className="text-slate-400 text-[10px] font-medium">Perbandingan standar versus aktual output kering kripik di setiap pabrik.</p>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={factoryYieldData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="Standard" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Director Board Intelligence info */}
            <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">Yield Intelligence Center</h3>
                    <p className="text-slate-400 text-[10px]">Laporan saringan profitabilitas di lantai pabrik untuk jajaran Manajemen Direktur.</p>
                  </div>
                  <Briefcase className="w-5 h-5 text-amber-400" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Best Factory</span>
                    <span className="text-white block font-black">Sipahutar (SSP)</span>
                    <span className="text-emerald-400 text-[9px] block">Actual: 13.38%</span>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Worst Factory</span>
                    <span className="text-white block font-black">Jakarta (AGDN)</span>
                    <span className="text-red-400 text-[9px] block">Actual: 12.85%</span>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Yield loss cost</span>
                    <span className="text-white block font-black">Rp {Math.round(costImpactInfo.profitLossImpact).toLocaleString()}</span>
                    <span className="text-amber-400 text-[9px] block">Yield variance effect</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-6 flex items-center justify-between text-[11px] text-slate-400">
                <p className="flex items-center gap-1.5 leading-none">
                  <Info className="w-3.5 h-3.5 text-amber-400" /> Rendahnya yield frying berdampak langsung pada kenaikan COGS sebesar Rp {Math.round(costImpactInfo.varianceCostPerKg).toLocaleString()}/Kg.
                </p>
                <button
                  onClick={() => setActiveTab('standards')}
                  className="text-amber-400 font-extrabold hover:underline leading-none flex items-center gap-0.5 cursor-pointer"
                >
                  Audit Standards <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: STANDARDS & RECIPES DETAILS */}
      {activeTab === 'standards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="standards-resep-tab">
          
          {/* List Sidebar Filter & Entry list */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Cari Variant / ID Code..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterFruit}
                  onChange={(e) => setFilterFruit(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10.5px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Semua Buah</option>
                  {state.fruitVariants.map(fv => (
                    <option key={fv.id} value={fv.id}>{fv.nama}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10.5px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Semua Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Scrollable Standard list */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredStandards.map(std => {
                const fruitObj = state.fruitVariants.find(f => f.id === std.fruitVariantId);
                const isActive = std.id === selectedStandardId;

                return (
                  <div
                    key={std.id}
                    onClick={() => { setSelectedStandardId(std.id); setIsFormOpen(false); }}
                    className={`bg-white p-4 rounded-xl border transition cursor-pointer select-none space-y-2 ${isActive ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-sm translate-x-1' : 'border-slate-200 hover:border-slate-350'}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                      <span className="font-extrabold text-slate-400">{std.id} (v{std.version})</span>
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${std.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : std.status === 'Pending Approval' ? 'bg-orange-100 text-orange-850 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>{std.status}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-800 text-xs">{fruitObj?.nama || 'Buah'} Standard</h4>
                      <p className="text-[10px] text-slate-450 truncate">{std.notes || 'No notes defined'}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100 font-bold">
                      <span>Overall Recovery:</span>
                      <span className="text-indigo-600 font-extrabold">
                        {((std.id === 'YS-01' ? (62/100 * 95/100 * simulatedStandardYieldStage3/100 * 95/100) : ((std.stage1.yieldPercent || 0)/100 * (std.stage2.yieldPercent || 0)/100 * (std.stage3.yieldPercent || 0)/100 * (std.stage4.yieldPercent || 0)/100)) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed sheet & editing */}
          <div className="lg:col-span-2">
            
            {isFormOpen ? (
              <form onSubmit={handleSaveStandard} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{isEditing ? 'Mengedit Standard Yield' : 'Membuat Standard Yield Baru'}</h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-extrabold font-mono text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Yield Code ID</label>
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      disabled={isEditing}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Fruit Variant</label>
                    <select
                      value={formData.fruitVariantId}
                      onChange={(e) => setFormData({ ...formData, fruitVariantId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {state.fruitVariants.map(fv => (
                        <option key={fv.id} value={fv.id}>{fv.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Product Variant ID</label>
                    <select
                      value={formData.productVariantId}
                      onChange={(e) => setFormData({ ...formData, productVariantId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {state.chipVariants.map(cv => (
                        <option key={cv.id} value={cv.id}>{cv.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Factory Scope</label>
                    <select
                      value={formData.factory}
                      onChange={(e) => setFormData({ ...formData, factory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Factory</option>
                      <option value="MPD">Wonosobo (MPD)</option>
                      <option value="SSP">Sipahutar (SSP)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Version</label>
                    <input
                      type="text"
                      required
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Effective Date</label>
                    <input
                      type="date"
                      required
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Stages input settings */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider block">Yield Stages Formulas Configuration</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5 p-3 bg-white rounded-xl shadow-xs border">
                      <span className="text-[10px] font-black text-slate-800 block">Fresh → Peeling</span>
                      <input
                        type="number"
                        placeholder="In (Kg)"
                        value={formData.stage1?.input}
                        onChange={(e) => setFormData({ ...formData, stage1: { ...formData.stage1!, input: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Out (Kg)"
                        value={formData.stage1?.output}
                        onChange={(e) => setFormData({ ...formData, stage1: { ...formData.stage1!, output: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs mt-1"
                      />
                    </div>

                    <div className="space-y-1.5 p-3 bg-white rounded-xl shadow-xs border">
                      <span className="text-[10px] font-black text-slate-800 block">Peeling → Frozen</span>
                      <input
                        type="number"
                        placeholder="In (Kg)"
                        value={formData.stage2?.input}
                        onChange={(e) => setFormData({ ...formData, stage2: { ...formData.stage2!, input: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Out (Kg)"
                        value={formData.stage2?.output}
                        onChange={(e) => setFormData({ ...formData, stage2: { ...formData.stage2!, output: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs mt-1"
                      />
                    </div>

                    <div className="space-y-1.5 p-3 bg-white rounded-xl shadow-xs border">
                      <span className="text-[10px] font-black text-slate-800 block">Frozen → Frying</span>
                      <input
                        type="number"
                        placeholder="In (Kg)"
                        value={formData.stage3?.input}
                        onChange={(e) => setFormData({ ...formData, stage3: { ...formData.stage3!, input: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Out (Kg)"
                        value={formData.stage3?.output}
                        onChange={(e) => setFormData({ ...formData, stage3: { ...formData.stage3!, output: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs mt-1"
                      />
                    </div>

                    <div className="space-y-1.5 p-3 bg-white rounded-xl shadow-xs border">
                      <span className="text-[10px] font-black text-slate-800 block">QC Grading Pass</span>
                      <input
                        type="number"
                        placeholder="In (Kg)"
                        value={formData.stage4?.input}
                        onChange={(e) => setFormData({ ...formData, stage4: { ...formData.stage4!, input: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Out (Kg)"
                        value={formData.stage4?.output}
                        onChange={(e) => setFormData({ ...formData, stage4: { ...formData.stage4!, output: Number(e.target.value) } })}
                        className="w-full border rounded p-1 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Recipe specific inputs */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider block">Associated Recipe Specifications</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-500 block uppercase">Prep Method</label>
                      <input
                        type="text"
                        value={formData.recipe?.prepMethod || ''}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, prepMethod: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-500 block uppercase">Peeling Method</label>
                      <input
                        type="text"
                        value={formData.recipe?.peelingMethod || ''}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, peelingMethod: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-500 block uppercase">Freezing Method</label>
                      <input
                        type="text"
                        value={formData.recipe?.freezingMethod || ''}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, freezingMethod: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 block uppercase">Oil Type</label>
                      <input
                        type="text"
                        value={formData.recipe?.fryingSettings?.oilType || 'Coconut Oil'}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, fryingSettings: { ...formData.recipe!.fryingSettings, oilType: e.target.value } } })}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 block uppercase">Frying Temp (°C)</label>
                      <input
                        type="number"
                        value={formData.recipe?.fryingSettings?.temperature || 84}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, fryingSettings: { ...formData.recipe!.fryingSettings, temperature: Number(e.target.value) } } })}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 block uppercase">Vacuum Pressure (kPa)</label>
                      <input
                        type="number"
                        value={formData.recipe?.fryingSettings?.pressure || 93}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, fryingSettings: { ...formData.recipe!.fryingSettings, pressure: Number(e.target.value) } } })}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 block uppercase">Duration (mins)</label>
                      <input
                        type="number"
                        value={formData.recipe?.fryingSettings?.duration || 45}
                        onChange={(e) => setFormData({ ...formData, recipe: { ...formData.recipe!, fryingSettings: { ...formData.recipe!.fryingSettings, duration: Number(e.target.value) } } })}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow"
                  >
                    Simpan Standard Record
                  </button>
                </div>
              </form>
            ) : (
              // Structured detail view of standard recipe
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Header detail split */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-xs font-bold">{activeStandard.id} std</span>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide text-indigo-700">v{activeStandard.version}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-[10px] text-slate-400">Exp: {activeStandard.expiryDate}</span>
                    </div>

                    <h2 className="text-lg font-black text-slate-800 tracking-tight font-display">
                      {(state.fruitVariants.find(fv => fv.id === activeStandard.fruitVariantId))?.nama || 'Nanas'} Yield Standards &amp; Recipe
                    </h2>
                    <p className="text-[11.5px] text-slate-500 font-medium font-mono">{activeStandard.notes || 'Arsitektur formulasi detail standard parameter untuk validitas target.'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(activeStandard)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Edit Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStandard(activeStandard.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Workflow status timeline controls */}
                <div className="bg-slate-55 mr-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-bold tracking-wide uppercase text-[9px] block">Official Approval Stage</span>
                      <p className="text-xs font-mono font-black text-slate-800">
                        Level: <span className="text-indigo-700">[{activeStandard.approvalStage}]</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                      {activeStandard.approvalStage === 'Creator' && (
                        <button
                          onClick={() => handleWorkflowTransition(activeStandard.id, 'Production Manager')}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-1.5 rounded-lg transition text-[10px]"
                        >
                          Submit to Production Manager
                        </button>
                      )}
                      {activeStandard.approvalStage === 'Production Manager' && (
                        <button
                          onClick={() => handleWorkflowTransition(activeStandard.id, 'HQ Production')}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-1.5 rounded-lg transition text-[10px]"
                        >
                          Push to HQ Production Manager
                        </button>
                      )}
                      {activeStandard.approvalStage === 'HQ Production' && (
                        <button
                          onClick={() => handleWorkflowTransition(activeStandard.id, 'Director Approved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-lg transition text-[10px]"
                        >
                          Obtain Director Final Signature
                        </button>
                      )}
                      {activeStandard.approvalStage === 'Director Approved' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-850 px-3 py-1 rounded-lg font-black text-[10px] uppercase">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Fully Approved SOP
                        </span>
                      )}
                    </div>
                  </div>

                  {activeStandard.approver && (
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[10.5px] font-mono text-slate-500">
                      <span>Reviewed By: <strong className="text-slate-700">{activeStandard.approver}</strong></span>
                      <span>Action Date: <strong className="text-slate-700">{activeStandard.approvalDate}</strong></span>
                    </div>
                  )}
                </div>

                {/* Grid yield values */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-1">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase block tracking-wider">Fresh → Peeling</span>
                    <span className="text-xl font-mono font-black text-indigo-950 block">{(activeStandard.stage1?.yieldPercent || 0)}%</span>
                    <span className="text-[9px] text-slate-430 font-medium block leading-none">Waste scrap: {(activeStandard.stage1?.wastePercent || 0)}%</span>
                  </div>

                  <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-1">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase block tracking-wider">Peeling → Frozen</span>
                    <span className="text-xl font-mono font-black text-indigo-950 block">{(activeStandard.stage2?.yieldPercent || 0)}%</span>
                    <span className="text-[9px] text-slate-430 font-medium block leading-none">Thaw loss: {(activeStandard.stage2?.lossPercent || 0)}%</span>
                  </div>

                  <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-1 font-mono">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase block font-sans tracking-wider">Frozen → Chips</span>
                    <span className="text-xl font-black text-indigo-950 block">
                      {activeStandard.id === 'YS-01' ? simulatedStandardYieldStage3 : (activeStandard.stage3?.yieldPercent || 0)}%
                    </span>
                    <span className="text-[9px] text-slate-435 font-medium font-sans block leading-none">Frying release: {100 - (activeStandard.id === 'YS-01' ? simulatedStandardYieldStage3 : (activeStandard.stage3?.yieldPercent || 0))}%</span>
                  </div>

                  <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-1">
                    <span className="text-[10px] text-indigo-700 font-bold uppercase block tracking-wider">QC Passed Ratio</span>
                    <span className="text-xl font-mono font-black text-indigo-950 block">{(activeStandard.stage4?.yieldPercent || 0)}%</span>
                    <span className="text-[9px] text-slate-440 font-medium block leading-none">Discard sorted: {(activeStandard.stage4?.wastePercent || 0)}%</span>
                  </div>
                </div>

                {/* Recipe specific cards details */}
                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-600 pl-3">
                    <span className="text-[10.5px] text-indigo-600 font-black block uppercase tracking-wider">Production Recipe Matrix Card</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 bg-white border rounded-2xl space-y-2">
                      <div className="flex items-center gap-1 text-slate-500 font-sans border-b pb-1">
                        <Scale className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-[10px] uppercase">WIP Preparation &amp; Peeling</span>
                      </div>
                      <p className="text-slate-700"><strong className="font-sans text-slate-400">Prep Method:</strong> {activeStandard.recipe?.prepMethod}</p>
                      <p className="text-slate-700"><strong className="font-sans text-slate-400">Peeling Tech:</strong> {activeStandard.recipe?.peelingMethod}</p>
                      <p className="text-slate-700"><strong className="font-sans text-slate-400">Blast Chill:</strong> {activeStandard.recipe?.freezingMethod}</p>
                    </div>

                    <div className="p-4 bg-white border rounded-2xl space-y-2">
                      <div className="flex items-center gap-1 text-slate-500 font-sans border-b pb-1">
                        <Flame className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-[10px] uppercase">Vacuum Frying Parameters</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 leading-normal">
                        <p><strong className="font-sans text-slate-404">Oil Type:</strong> {activeStandard.recipe?.fryingSettings?.oilType}</p>
                        <p><strong className="font-sans text-slate-404">Temp Target:</strong> {activeStandard.recipe?.fryingSettings?.temperature}°C</p>
                        <p><strong className="font-sans text-slate-404">Pressure:</strong> {activeStandard.recipe?.fryingSettings?.pressure} kPa</p>
                        <p><strong className="font-sans text-slate-404">Hold Duration:</strong> {activeStandard.recipe?.fryingSettings?.duration} mins</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border rounded-2xl space-y-2 col-span-1 md:col-span-2">
                      <div className="flex items-center gap-1 text-slate-500 font-sans border-b pb-1">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-[10px] uppercase">QC Sorting Standard &amp; Packaging</span>
                      </div>
                      <p className="text-slate-700"><strong className="font-sans text-slate-400">Quality Gates:</strong> {activeStandard.recipe?.qcStandard}</p>
                      <p className="text-slate-700"><strong className="font-sans text-slate-400">Pack Standard:</strong> {activeStandard.recipe?.packagingStandard}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW 3: MRP & PLANNING CALCULATOR ENGINE */}
      {activeTab === 'calculator' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="planning-engine-tab">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Yield-Driven Production Planning &amp; MRP Explosion</h3>
            <p className="text-slate-400 text-[10.5px]">Masukkan target final kripik kemas untuk meledakkan kebutuhan bahan baku basah, WIP, consumables, dan kemasan secara otomatis.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input target configurations */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Pilih Formula Standard Yield</label>
                  <select
                    value={selectedPlanningStandardId}
                    onChange={(e) => setSelectedPlanningStandardId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                  >
                    {standards.map(std => (
                      <option key={std.id} value={std.id}>{state.fruitVariants.find(fv => fv.id === std.fruitVariantId)?.nama || std.id} Standard (v{std.version})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Target Quantity Chip (QC Passed Output in Kg)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetChipsQty}
                      onChange={(e) => setTargetChipsQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <span className="absolute right-3 top-2.5 font-mono text-xs font-black text-slate-400">KG</span>
                  </div>
                </div>

                <div className="pt-2 border-t text-[11px] font-medium text-slate-500 leading-normal">
                  <p className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-indigo-600" /> Rumus dekomposisi yield standard agridea:</p>
                  <code className="text-[10px] bg-white p-1 rounded font-black block mt-2 whitespace-normal leading-relaxed text-indigo-950 border">
                    Target Chips ÷ QC Passed Yield% ÷ Frying Yield% ÷ Freeze Yield% ÷ Peeling Yield% = Required Fresh Fruit Kg
                  </code>
                </div>
              </div>
            </div>

            {/* Exploded outputs visual hierarchy */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10.5px] text-indigo-700 font-extrabold block uppercase tracking-wider">Multi-stage Yield Decomposition Results</span>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="p-4 bg-slate-50 rounded-2xl border relative overflow-hidden">
                  <div className="absolute right-2 top-2 text-[24px] font-black font-mono text-slate-200/50">4</div>
                  <span className="text-[9.5px] text-slate-400 font-bold block uppercase">FINAL Target</span>
                  <span className="text-lg font-mono font-black text-slate-800">{targetChipsQty.toLocaleString()} Kg</span>
                  <span className="text-[9px] text-indigo-600 font-bold block">Passed QC chips</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border relative overflow-hidden">
                  <div className="absolute right-2 top-2 text-[24px] font-black font-mono text-slate-200/50">3</div>
                  <span className="text-[9.5px] text-slate-400 font-bold block uppercase">Frying input</span>
                  <span className="text-lg font-mono font-black text-slate-800">{Math.round(planningYieldChain.frying).toLocaleString()} Kg</span>
                  <span className="text-[9px] text-slate-500 font-bold block">Packs output WIP</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border relative overflow-hidden">
                  <div className="absolute right-2 top-2 text-[24px] font-black font-mono text-slate-200/50">2</div>
                  <span className="text-[9.5px] text-slate-400 font-bold block uppercase">Frozen required</span>
                  <span className="text-lg font-mono font-black text-slate-800">{Math.round(planningYieldChain.frozen).toLocaleString()} Kg</span>
                  <span className="text-[9px] text-slate-500 font-bold block">WIP Blast chill</span>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 relative overflow-hidden">
                  <div className="absolute right-2 top-2 text-[24px] font-black font-mono text-emerald-200">1</div>
                  <span className="text-[9.5px] text-emerald-800 font-extrabold block uppercase">Fresh Fruit Input</span>
                  <span className="text-lg font-mono font-black text-emerald-950">{Math.round(planningYieldChain.fresh).toLocaleString()} Kg</span>
                  <span className="text-[9px] text-emerald-600 font-extrabold block">Bahan Baku Segar</span>
                </div>

              </div>

              {/* MRP Materials explosion card */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4">
                <span className="text-[10px] text-amber-400 font-black block uppercase tracking-wider">Automated Material Requirements (MRP Explosion)</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[8.5px] uppercase block font-bold leading-none mb-1">Packaging pouch</span>
                    <span className="text-white font-extrabold block">{planningYieldChain.totalPcs.toLocaleString()} Pcs</span>
                    <span className="text-[9.5px] text-slate-400 block font-normal leading-tight">Gramasi: {planningYieldChain.gramasi}g</span>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[8.5px] uppercase block font-bold leading-none mb-1">Carton Box</span>
                    <span className="text-white font-extrabold block">{planningYieldChain.totalBoxes.toLocaleString()} Boxes</span>
                    <span className="text-[9.5px] text-slate-400 block font-normal leading-tight">1 Box / 24 Pouch</span>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[8.5px] uppercase block font-bold leading-none mb-1">Coconut Oil qty</span>
                    <span className="text-white font-extrabold block">{Math.round(planningYieldChain.reqOilLiter).toLocaleString()} Liter</span>
                    <span className="text-[9.5px] text-slate-400 block font-normal leading-tight">0.15 Liter / Kg input</span>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[8.5px] uppercase block font-bold leading-none mb-1">Industrial LPG Gas</span>
                    <span className="text-white font-extrabold block">{Math.round(planningYieldChain.reqGasKg).toLocaleString()} Kg</span>
                    <span className="text-[9.5px] text-slate-400 block font-normal leading-tight">0.18 Kg / Kg frying</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW 4: SUPPLIER SCORECARD INTEGRATION */}
      {activeTab === 'scorecard' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="supplier-scorecard-tab">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Durable Supplier Yield Scorecard</h3>
            <p className="text-slate-400 text-[10.5px]">Analisis kepatuhan kualitas bahan segar dari masing-masing supplier tani mitra berdasarkan rendemen kripik aktual.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-450 uppercase font-bold">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Fruit Var</th>
                  <th className="p-3 text-center">Expected Yield</th>
                  <th className="p-3 text-center">Actual Yield</th>
                  <th className="p-3 text-center">Variance %</th>
                  <th className="p-3 text-center">Trend</th>
                  <th className="p-3">Status Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {supplierScores.map((score, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-400">#{score.rank}</td>
                    <td className="p-3 font-bold text-slate-800 font-sans">{score.supplierName}</td>
                    <td className="p-3 font-semibold text-indigo-700">{(state.fruitVariants.find(f => f.id === score.fruitId))?.nama || score.fruitId}</td>
                    <td className="p-3 text-center">{score.expectedYield}%</td>
                    <td className="p-3 text-center font-bold">{score.actualYield}%</td>
                    <td className={`p-3 text-center font-bold ${score.variance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {score.variance >= 0 ? `+${score.variance}%` : `${score.variance}%`}
                    </td>
                    <td className="p-3 text-center">
                      <span className="uppercase text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600 block max-w-16 mx-auto">
                        {score.trend}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${score.variance >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {score.variance >= 0 ? 'Above Standard' : 'Below Standard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: CAPACITY PLANNING CONTROLLER */}
      {activeTab === 'capacity' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="capacity-planning-tab">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Dual Capacity Bottleneck Analyzer</h3>
            <p className="text-slate-400 text-[10.5px]">Konfigurasikan daily capacity mesin &amp; operator di setiap lini proses, kemudian simulasikan pendeteksian bottleneck secara instant.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sliders setups */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
              <span className="text-[10px] font-black text-indigo-700 uppercase block tracking-wider">Set Daily Process Capacities</span>
              
              <div className="space-y-3 font-mono text-xs text-slate-700">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Fresh Raw Handlers:</span>
                    <span className="text-indigo-600">{freshCap.toLocaleString()} Kg/day</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={freshCap}
                    onChange={(e) => setFreshCap(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Peeling Output Rate:</span>
                    <span className="text-indigo-600">{frozenCap.toLocaleString()} Kg/day</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10005"
                    step="500"
                    value={frozenCap}
                    onChange={(e) => setFrozenCap(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Core Vacuum fry input:</span>
                    <span className="text-indigo-600">{fryingCap.toLocaleString()} Kg/day</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="4000"
                    step="200"
                    value={fryingCap}
                    onChange={(e) => setFryingCap(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Packaging Sorter sealing:</span>
                    <span className="text-indigo-600">{packagingCap.toLocaleString()} Pcs/day</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="30000"
                    step="1000"
                    value={packagingCap}
                    onChange={(e) => setPackagingCap(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Analysis results list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl relative overflow-hidden">
                <div className="space-y-0.5">
                  <span className="text-amber-400 font-extrabold text-[9px] uppercase tracking-wider block">Bottleneck Forecast Alert</span>
                  <h4 className="text-xs font-black font-mono">
                    Target: {targetChipsQty.toLocaleString()} Kg — {capacityMetrics.isExcess ? '🚨 SYSTEM OVERFLOW BOTTLENECK DETECTED' : '✅ CAPACITIES ADEQUATE'}
                  </h4>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {capacityMetrics.stages.map((stg, i) => {
                  let barColor = 'bg-emerald-500';
                  if (stg.util > 100) barColor = 'bg-red-500 animate-pulse';
                  else if (stg.util > 80) barColor = 'bg-amber-500';

                  return (
                    <div key={i} className="p-3 bg-white border rounded-xl shadow-xs space-y-2">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{stg.name}</span>
                        <span>{stg.util.toFixed(1)}% (Req: {Math.round(stg.req).toLocaleString()} vs Cap: {stg.cap.toLocaleString()} {stg.unit})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${barColor} h-full rounded-full`} style={{ width: `${Math.min(100, stg.util)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 6: COSTING & YIELD CONTROLLERS */}
      {activeTab === 'costing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="cogs-yield-cost-tab">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Yield-Sensitive Costing &amp; Profitability Simulator</h3>
            <p className="text-slate-400 text-[10.5px]">Mengkalkulasi dampak deviasi rendemen hasil goreng kripik segar nenas terhadap harga pokok produksi (COGS) dan margin laba kotor kripik secara real-time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sliders factors */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <span className="text-[10px] font-black text-indigo-700 uppercase block tracking-wider">Interactive Cost Drivers Sliders</span>
              
              <div className="space-y-4 font-mono text-xs text-slate-700">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Raw Fresh Price / Kg:</span>
                    <span className="text-indigo-600">Rp {simulatedFreshPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="6000"
                    max="22000"
                    step="500"
                    value={simulatedFreshPrice}
                    onChange={(e) => setSimulatedFreshPrice(Number(e.target.value))}
                    className="w-full accent-indigo-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Standard Stage 3 Yield %:</span>
                    <span className="text-emerald-700 font-extrabold">{simulatedStandardYieldStage3}%</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="30"
                    step="1"
                    value={simulatedStandardYieldStage3}
                    onChange={(e) => setSimulatedStandardYieldStage3(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Actual Stage 3 Frying Yield %:</span>
                    <span className="text-red-600 font-extrabold">{simulatedActualYieldStage3}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="28"
                    step="1"
                    value={simulatedActualYieldStage3}
                    onChange={(e) => setSimulatedActualYieldStage3(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Simulated financial effects */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10.5px] text-slate-500 font-bold block uppercase tracking-wider">Financial Variance Calculations</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-white border rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Fresh-to-Chips Standard COGS</span>
                  <div className="space-y-1 leading-none">
                    <span className="text-lg font-mono font-black text-slate-800 block">Rp {Math.round(costImpactInfo.stdCostPerPouch).toLocaleString()} / pouch</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Expected standard margin: {costImpactInfo.stdMarginPct.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-red-200 bg-red-50/20 rounded-2xl shadow-xs space-y-2">
                  <span className="text-[10px] text-red-600 font-black block uppercase">Actual Low Yield COGS</span>
                  <div className="space-y-1 leading-none">
                    <span className="text-lg font-mono font-black text-red-700 block">Rp {Math.round(costImpactInfo.actCostPerPouch).toLocaleString()} / pouch</span>
                    <span className="text-[10px] text-red-500 font-bold block">Actual margin shrunk to: {costImpactInfo.actMarginPct.toFixed(1)}%</span>
                  </div>
                </div>

              </div>

              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-400 font-black tracking-wider block uppercase">Total Yield Variance Margin Lost</span>
                  <span className="text-2xl font-mono font-black text-white">Rp {Math.round(costImpactInfo.profitLossImpact).toLocaleString()}</span>
                  <p className="text-[9.5px] text-slate-400">Kerugian finansial akibat deviasi yield seberat {standards[0]?.id === 'YS-01' ? (simulatedStandardYieldStage3 - simulatedActualYieldStage3) : 4}% pada target kripik.</p>
                </div>
                <div className="p-3 bg-red-950/40 border border-red-900 rounded-xl max-w-sm shrink-0">
                  <p className="text-[10px] text-red-200 font-mono font-bold leading-normal">
                    ⚠️ Rendahnya actual yield meningkatkan biaya bahan baku sebesar <strong className="text-white">Rp {Math.round(costImpactInfo.varianceCostPerKg).toLocaleString()}/Kg</strong> chips layak jual.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW 7: PERFORMANCE AND COLOR RULES */}
      {activeTab === 'performance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in" id="performance-trace-table">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Multi-dimensional Yield Performance Trace</h3>
            <p className="text-slate-400 text-[10.5px]">Monitoring evaluasi komparasi Standard vs Actual yield melintasi multi-step pabrik, operators, mesin-mesin vacuum fryer, supplier dan nomor batch produksi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2 text-[11px] font-bold">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-250 p-2.5 rounded-xl">
              <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px]">✓</span>
              <span className="text-emerald-950 font-semibold text-xs">Standard Met (Actual &ge; Standard)</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-250 p-2.5 rounded-xl">
              <span className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white text-[9px]">!</span>
              <span className="text-amber-950 font-semibold text-xs">Tolerable Deviation (95% - 99% of Standard)</span>
            </div>
            <div className="flex items-center gap-2 bg-red-50 border border-red-250 p-2.5 rounded-xl col-span-1 md:col-span-2 lg:col-span-1">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px]">✗</span>
              <span className="text-red-950 font-semibold text-xs">Under-Performing (&lt; 95% of Standard)</span>
            </div>
          </div>

          <div className="space-y-4">
            
            <div className="border-l-4 border-indigo-600 pl-3">
              <span className="text-xs font-black text-slate-800 uppercase block tracking-wider">Interactive Batch Trace Yield Status</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-[10px] text-slate-450 uppercase font-bold">
                    <th className="p-3">Dimension Target</th>
                    <th className="p-3">Reference Var</th>
                    <th className="p-3">Standard Yield</th>
                    <th className="p-3">Actual Yield</th>
                    <th className="p-3">Performance Index</th>
                    <th className="p-3 text-center">Color Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-sans font-bold">Wonosobo Facility (Factory MPD)</td>
                    <td className="p-3 text-indigo-700 font-black">Nanas (Pineapple)</td>
                    <td className="p-3">13.45%</td>
                    <td className="p-3 font-bold">13.68%</td>
                    <td className="p-3 text-emerald-700">101.7% Met</td>
                    <td className="p-3 text-center">
                      <span className="w-5 h-5 bg-emerald-500 rounded-full inline-block border shadow-xs" title="Actual >= Standard"></span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-sans font-bold">Jakarta Kemas (AGDN)</td>
                    <td className="p-3 text-indigo-700 font-black">Nanas (Pineapple)</td>
                    <td className="p-3">13.45%</td>
                    <td className="p-3 font-bold">12.85%</td>
                    <td className="p-3 text-amber-700">95.5% Tolerable</td>
                    <td className="p-3 text-center">
                      <span className="w-5 h-5 bg-amber-500 rounded-full inline-block border shadow-xs" title="95%-99%"></span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-sans font-bold">Batch BATCH-APL-001</td>
                    <td className="p-3 text-indigo-700 font-black">Apel standard</td>
                    <td className="p-3">15.74%</td>
                    <td className="p-3 font-bold">13.12%</td>
                    <td className="p-3 text-red-600 font-bold">83.3% Discard alert</td>
                    <td className="p-3 text-center">
                      <span className="w-5 h-5 bg-red-500 rounded-full inline-block border shadow-xs animate-pulse" title="< 95%"></span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-sans font-bold">Vacuum Fryer V-01 (Machine)</td>
                    <td className="p-3 text-indigo-700 font-black">Jackfruit (Nangka)</td>
                    <td className="p-3">10.93%</td>
                    <td className="p-3 font-bold">11.15%</td>
                    <td className="p-3 text-emerald-700">102.0% Met</td>
                    <td className="p-3 text-center">
                      <span className="w-5 h-5 bg-emerald-500 rounded-full inline-block border shadow-xs"></span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-sans font-bold">Slamet (Vacuum Fryer Operator)</td>
                    <td className="p-3 text-indigo-700 font-black">Salak Premium</td>
                    <td className="p-3">16.74%</td>
                    <td className="p-3 font-bold">16.85%</td>
                    <td className="p-3 text-emerald-700">100.6% Met</td>
                    <td className="p-3 text-center">
                      <span className="w-5 h-5 bg-emerald-500 rounded-full inline-block border shadow-xs"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
