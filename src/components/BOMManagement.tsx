import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Database,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  Search,
  Filter,
  Layers,
  Wand2,
  Lock,
  ChevronRight,
  Info,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';

interface ComponentItem {
  id: string;
  materialType: 'Raw Material' | 'Frozen' | 'Chips' | 'Packaging' | 'Supporting Material' | 'Chemical' | 'Consumable';
  materialId: string;
  qtyNeeded: number;
  unit: string;
  wastePercent: number; // e.g. 5%
  lossPercent: number;  // e.g. 2%
  notes?: string;
}

interface MixedFruitItem {
  fruitVariantId: string;
  percentage: number;
}

interface BOMHeader {
  id: string;
  nama: string;
  produkId: string; // SKU ID
  kategoriProduk: 'Semi-Finished' | 'Finished Goods' | 'OEM' | 'Mixed Fruit Product';
  lokasiId: string; // e.g. JKT, MPD, or 'All'
  version: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Archived';
  effectiveDate: string;
  expiryDate: string;
  notes?: string;
  
  // Mixed Fruit properties
  isMixedProduct: boolean;
  mixedFruits: MixedFruitItem[];

  // Ingredients and parts list
  items: ComponentItem[];

  // Approval status
  approvalStage: 'Creator' | 'Production Manager' | 'HQ Production' | 'Approved';
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  revisionNotes?: string;
  approvalHistory?: any[];
}

interface Props {
  state: {
    produk: any[];
    fruitVariants: any[];
    chipVariants: any[];
    packagingMaster: any[];
    supportingMaster: any[];
    chemicalsMaster: any[];
    bom: any[];
    stocks: any[];
  };
  setBom: React.Dispatch<React.SetStateAction<any[]>>;
  logActivity: (module: string, desc: string, detail?: any) => void;
  currentUser: {
    role: string;
    namaLengkap: string;
    username: string;
  };
}

export default function BOMManagement({ state, setBom, logActivity, currentUser }: Props) {
  // Tabs: 'dashboard' | 'list' | 'profitability' | 'ai-insights'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'profitability' | 'ai-insights'>('dashboard');
  
  // Active selection for BOM List & Details
  const [selectedBomId, setSelectedBomId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [formId, setFormId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formProdukId, setFormProdukId] = useState('');
  const [formKategori, setFormKategori] = useState<'Semi-Finished' | 'Finished Goods' | 'OEM' | 'Mixed Fruit Product'>('Finished Goods');
  const [formLokasiId, setFormLokasiId] = useState('All');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formEffectiveDate, setFormEffectiveDate] = useState('2026-06-01');
  const [formExpiryDate, setFormExpiryDate] = useState('2027-06-01');
  const [formNotes, setFormNotes] = useState('');
  const [formIsMixed, setFormIsMixed] = useState(false);
  const [formMixedFruits, setFormMixedFruits] = useState<MixedFruitItem[]>([
    { fruitVariantId: '', percentage: 0 }
  ]);
  const [formItems, setFormItems] = useState<ComponentItem[]>([]);

  // Workflow Dialog state
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowActionNotes, setWorkflowActionNotes] = useState('');

  // Price Simulation State (Sku Profitability)
  const [simulatedSkuId, setSimulatedSkuId] = useState<string>(() => {
    return state.produk && state.produk.length > 0 ? state.produk[0].id : '';
  });
  const [simulatedPrice, setSimulatedPrice] = useState<number>(0);
  const [simulatedLaborCost, setSimulatedLaborCost] = useState<number>(2000);
  const [simulatedOverheadCost, setSimulatedOverheadCost] = useState<number>(1500);

  // Load Seed BOMs on first render if state has standard bom or build rich BOM
  const richBoms = useMemo<BOMHeader[]>(() => {
    // If state.bom contains items, let's map or construct them. We will save our rich BOM in standard structure.
    const rawBom = state.bom || [];
    // Filter to find custom formulated headers. They are formatted as BOMHeader.
    // If not matching rich structure, map the standard ones as fallback.
    return rawBom.map(b => {
      if (b.items) return b as BOMHeader;
      
      // Fallback: Create structured multi-level BOM for simple legacy formats
      const skuObj = state.produk.find((p: any) => p.id === b.produkId);
      const category: any = skuObj?.varian === 'Mixed' ? 'Mixed Fruit Product' : 'Finished Goods';
      
      // Level 1 components for raw fruit to frozen
      const defaultFruitName = skuObj?.varian || 'Apel';
      const fruitMaster = state.fruitVariants.find(fv => fv.nama.toLowerCase().includes(defaultFruitName.toLowerCase())) || state.fruitVariants[0];
      const chipVariant = state.chipVariants.find(cv => cv.nama.toLowerCase().includes(defaultFruitName.toLowerCase())) || state.chipVariants[0];

      const parts: ComponentItem[] = [];
      if (b.bahanBakuKg > 0 && fruitMaster) {
        parts.push({
          id: `COMP-${b.id}-1`,
          materialType: 'Raw Material',
          materialId: fruitMaster.id,
          qtyNeeded: b.bahanBakuKg,
          unit: 'Kg',
          wastePercent: 8,
          lossPercent: 2,
          notes: 'Standard Peeled Yield Conversion'
        });
      }
      if (chipVariant && b.bahanBakuKg > 0) {
        parts.push({
          id: `COMP-${b.id}-2`,
          materialType: 'Chips',
          materialId: chipVariant.id,
          qtyNeeded: skuObj?.gramasi ? skuObj.gramasi / 1000 : 0.1, // weight in Kg
          unit: 'Kg',
          wastePercent: 3,
          lossPercent: 1,
          notes: 'Unpacked bulk chips required'
        });
      }
      // Packaging Material
      const standingPouch = state.packagingMaster.find(pm => pm.nama.toLowerCase().includes('pouch') || pm.kategori === 'Standing Pouch') || state.packagingMaster[0];
      if (standingPouch) {
        parts.push({
          id: `COMP-${b.id}-3`,
          materialType: 'Packaging',
          materialId: standingPouch.id,
          qtyNeeded: b.kemasanPcs || 1,
          unit: 'Pcs',
          wastePercent: 1,
          lossPercent: 0,
          notes: 'Finished packaging shell'
        });
      }
      // Carton box fraction
      const cartonBox = state.packagingMaster.find(pm => pm.id === 'PK-004' || pm.nama.toLowerCase().includes('box') || pm.nama.toLowerCase().includes('carton')) || state.packagingMaster[1];
      if (cartonBox && b.outerBoxFraction > 0) {
        parts.push({
          id: `COMP-${b.id}-4`,
          materialType: 'Packaging',
          materialId: cartonBox.id,
          qtyNeeded: b.outerBoxFraction,
          unit: 'Pcs',
          wastePercent: 0,
          lossPercent: 0,
          notes: 'Proportional Master Box Box cost share'
        });
      }
      // LPG & Minyak
      const coconutOil = state.chemicalsMaster.find(cc => cc.nama.toLowerCase().includes('minyak')) || { id: 'CC-101', unit: 'Liter', standardCost: 18500 };
      if (coconutOil && b.minyakLiter > 0) {
        parts.push({
          id: `COMP-${b.id}-5`,
          materialType: 'Chemical',
          materialId: coconutOil.id,
          qtyNeeded: b.minyakLiter,
          unit: 'Liter',
          wastePercent: 5,
          lossPercent: 0,
          notes: 'Vacuum frying oil volume'
        });
      }
      const industrialGas = state.chemicalsMaster.find(cc => cc.nama.toLowerCase().includes('lpg') || cc.nama.toLowerCase().includes('gas')) || { id: 'CC-102', unit: 'Tabung', standardCost: 950000 };
      if (industrialGas && b.lpgKg > 0) {
        // 50kg gas cylinder fraction
        parts.push({
          id: `COMP-${b.id}-6`,
          materialType: 'Consumable',
          materialId: industrialGas.id,
          qtyNeeded: b.lpgKg / 50, // convert kg required to cylinders
          unit: 'Tabung',
          wastePercent: 0,
          lossPercent: 0,
          notes: 'LPG heat fuel proportional requirement'
        });
      }

      return {
        id: b.id,
        nama: `Standard BOM for SKU ${skuObj?.sku || b.produkId}`,
        produkId: b.produkId,
        kategoriProduk: category,
        lokasiId: 'All',
        version: b.version || '1.0',
        status: b.status || 'Approved',
        effectiveDate: '2026-06-01',
        expiryDate: '2027-06-01',
        notes: 'Legacy pre-existing seed converted',
        isMixedProduct: category === 'Mixed Fruit Product',
        mixedFruits: [],
        items: parts,
        approvalStage: 'Approved',
        createdAt: '2026-05-15',
        createdBy: 'System Default'
      };
    });
  }, [state.bom, state.produk, state.fruitVariants, state.chipVariants, state.packagingMaster, state.supportingMaster, state.chemicalsMaster]);

  // Master Lists matching types
  const masterMaterials = useMemo(() => {
    return {
      'Raw Material': state.fruitVariants.map(fv => ({ id: fv.id, nama: `${fv.nama} Segar`, unit: 'Kg', cost: 12000 })), // dynamic estimasi
      'Frozen': state.fruitVariants.map(fv => ({ id: `WIP-FRZ-${fv.id}`, nama: `${fv.nama} Frozen WIP`, unit: 'Kg', cost: 24000 })),
      'Chips': state.chipVariants.map(cv => ({ id: cv.id, nama: cv.nama, unit: 'Kg', cost: 75000 })),
      'Packaging': state.packagingMaster.map(pm => ({ id: pm.id, nama: pm.nama, unit: pm.unit || 'Pcs', cost: pm.standardCost || 500 })),
      'Supporting Material': state.supportingMaster.map(sm => ({ id: sm.id, nama: sm.nama, unit: sm.unit || 'Pcs', cost: sm.standardCost || 250 })),
      'Chemical': (state.chemicalsMaster || []).filter((cc: any) => cc.kategori === 'Minyak Kelapa' || cc.nama.toLowerCase().includes('minyak') || cc.kategori?.includes('Sanitizer')).map((cc: any) => ({ id: cc.id, nama: cc.nama, unit: cc.unit || 'Liter', cost: cc.standardCost || 18500 })),
      'Consumable': (state.chemicalsMaster || []).filter((cc: any) => cc.nama.toLowerCase().includes('lpg') || cc.nama.toLowerCase().includes('gas') || cc.nama.toLowerCase().includes('utility')).map((cc: any) => ({ id: cc.id, nama: cc.nama, unit: cc.unit || 'Tabung', cost: cc.standardCost || 950000 }))
    };
  }, [state.fruitVariants, state.chipVariants, state.packagingMaster, state.supportingMaster, state.chemicalsMaster]);

  // Helper cost computation for material in BOM item
  const getMaterialCost = (materialType: string, materialId: string) => {
    const list = (masterMaterials as any)[materialType] || [];
    const found = list.find((m: any) => m.id === materialId);
    return found ? found.cost : 0;
  };

  const getMaterialName = (materialType: string, materialId: string) => {
    const list = (masterMaterials as any)[materialType] || [];
    const found = list.find((m: any) => m.id === materialId);
    return found ? found.nama : materialId;
  };

  // Compute stats for Dashboard
  const stats = useMemo(() => {
    const totalBOM = richBoms.length;
    const approvedBOM = richBoms.filter(b => b.status === 'Approved').length;
    const pendingBOM = richBoms.filter(b => b.status === 'Pending Approval').length;
    const draftBOM = richBoms.filter(b => b.status === 'Draft').length;

    // Cost accumulation & Top drivers across approved BOMs
    let totalRMCost = 0;
    let totalPkgCost = 0;
    let totalChemCost = 0;
    let totalOverheadCost = 0;
    let occurrences: { [name: string]: { cost: number; qty: number } } = {};

    richBoms.filter(b => b.status === 'Approved').forEach(bom => {
      bom.items.forEach(item => {
        const costPerUnit = getMaterialCost(item.materialType, item.materialId);
        // Factor in waste / loss
        const adjustedQty = item.qtyNeeded * (1 + (item.wastePercent || 0) / 100) * (1 + (item.lossPercent || 0) / 100);
        const itemTotal = adjustedQty * costPerUnit;

        const name = getMaterialName(item.materialType, item.materialId);
        if (!occurrences[name]) {
          occurrences[name] = { cost: 0, qty: 0 };
        }
        occurrences[name].cost += itemTotal;
        occurrences[name].qty += adjustedQty;

        if (item.materialType === 'Raw Material' || item.materialType === 'Chips') {
          totalRMCost += itemTotal;
        } else if (item.materialType === 'Packaging' || item.materialType === 'Supporting Material') {
          totalPkgCost += itemTotal;
        } else {
          totalChemCost += itemTotal;
        }
      });
    });

    const drivers = Object.entries(occurrences)
      .map(([name, val]) => ({ name, cost: val.cost, qty: val.qty }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    return {
      totalBOM,
      approvedBOM,
      pendingBOM,
      draftBOM,
      costAllocation: {
        rm: totalRMCost,
        pkg: totalPkgCost,
        chem: totalChemCost,
        total: totalRMCost + totalPkgCost + totalChemCost
      },
      topDrivers: drivers
    };
  }, [richBoms, masterMaterials]);

  // Handle SKU change for Profitability simulator
  const activeSimulatedSku = useMemo(() => {
    const sku = state.produk.find(p => p.id === simulatedSkuId);
    if (!sku) return null;
    
    // Find approved BOM for this product
    const matchingBom = richBoms.find(b => b.produkId === simulatedSkuId && b.status === 'Approved') || richBoms.find(b => b.produkId === simulatedSkuId);
    
    let rmCost = 0;
    let pgCost = 0;
    let chemCost = 0;
    let totalMaterialCost = 0;
    let detailedItems: any[] = [];

    if (matchingBom) {
      matchingBom.items.forEach(item => {
        const baseCost = getMaterialCost(item.materialType, item.materialId);
        const wasteLossMult = (1 + (item.wastePercent || 0)/100) * (1 + (item.lossPercent || 0)/100);
        const effectiveQty = item.qtyNeeded * wasteLossMult;
        const totalItemCost = effectiveQty * baseCost;
        
        detailedItems.push({
          name: getMaterialName(item.materialType, item.materialId),
          type: item.materialType,
          qty: item.qtyNeeded,
          wasteLossMult,
          cost: baseCost,
          total: totalItemCost
        });

        if (item.materialType === 'Raw Material' || item.materialType === 'Chips' || item.materialType === 'Frozen') {
          rmCost += totalItemCost;
        } else if (item.materialType === 'Packaging' || item.materialType === 'Supporting Material') {
          pgCost += totalItemCost;
        } else {
          chemCost += totalItemCost;
        }
        totalMaterialCost += totalItemCost;
      });
    }

    const price = simulatedPrice || sku.hargaJualStandar || 20000;
    const finalCOGS = totalMaterialCost + simulatedLaborCost + simulatedOverheadCost;
    const marginAmount = price - finalCOGS;
    const marginPct = price > 0 ? (marginAmount / price) * 100 : 0;

    return {
      sku,
      bom: matchingBom,
      rmCost,
      pgCost,
      chemCost,
      totalMaterial: totalMaterialCost,
      totalCOGS: finalCOGS,
      price,
      marginAmount,
      marginPct,
      detailedItems
    };
  }, [simulatedSkuId, simulatedPrice, simulatedLaborCost, simulatedOverheadCost, richBoms, state.produk, masterMaterials]);

  // AI Insights generation dynamically
  const aiBomAnalysis = useMemo(() => {
    const issuesList: { problem: string; challenge: string; action: string; badge: 'Critical' | 'Warning' | 'Good' }[] = [];
    
    // Let's analyze BOM data
    richBoms.forEach(b => {
      let totalWaste = 0;
      let totalCost = 0;
      let hasSilica = false;
      let packagingCount = 0;

      b.items.forEach(item => {
        const matCost = getMaterialCost(item.materialType, item.materialId);
        const wasteLossVal = (item.wastePercent || 0) + (item.lossPercent || 0);
        totalWaste += wasteLossVal;
        totalCost += (item.qtyNeeded * (1 + wasteLossVal/100) * matCost);
        
        if (item.materialId.toLowerCase().includes('silica')) hasSilica = true;
        if (item.materialType === 'Packaging') packagingCount++;
      });

      if (b.status === 'Approved') {
        const skuObj = state.produk.find(p => p.id === b.produkId);
        
        if (totalWaste > 12) {
          issuesList.push({
            problem: `High Waste & Loss rate on BOM: ${b.id} (${skuObj?.nama || b.nama})`,
            challenge: `The accumulated waste & loss reaches ${totalWaste.toFixed(1)}%. This degrades cumulative production margins by bloating raw material costs.`,
            action: `Review vacuum frying temperature stability, peeling automation calibration, and check if operators need fresh briefing to reduce scrap.`,
            badge: 'Critical'
          });
        }

        if (totalCost > (skuObj?.hargaJualStandar * 0.65)) {
          issuesList.push({
            problem: `Extreme Material Cost Ratio on SKU: ${skuObj?.sku}`,
            challenge: `The standard COGS from BOM ingredients is Rp ${Math.round(totalCost).toLocaleString()} which exceeds 65% of sale price (Rp ${skuObj.hargaJualStandar.toLocaleString()}).`,
            action: `Renegotiate bulk material prices with packaging vendors, audit gas thermal efficiency, or simulate a retail price hike to Rp ${Math.round(totalCost / 0.45).toLocaleString()}.`,
            badge: 'Critical'
          });
        }

        if (b.kategoriProduk === 'Mixed Fruit Product' && b.mixedFruits && b.mixedFruits.length > 5) {
          issuesList.push({
            problem: `Complex Multi-Fruit Composition Yield Risk (${b.mixedFruits.length} fruits formulation)`,
            challenge: `With ${b.mixedFruits.length} separate fruit materials, variance in moisture retention grades creates severe post-frying quality inconsistencies.`,
            action: `Implement pre-sorting standard operating procedures (SOP) and track moisture levels individually before mixing.`,
            badge: 'Warning'
          });
        }

        if (!hasSilica && b.kategoriProduk !== 'Semi-Finished') {
          issuesList.push({
            problem: `Missing Silica Gel Preservative component in Finished Good packaging`,
            challenge: `Finished chips are susceptible to moisture absorption, reducing shelf life and crunchiness with high potential of customer complaints.`,
            action: `Inject standard PK-006 Silica Gel Pack into BOM detail for strict quality preservation.`,
            badge: 'Warning'
          });
        }
      }
    });

    if (issuesList.length === 0) {
      issuesList.push({
        problem: `Outstanding BOM Formulation Hygiene`,
        challenge: `No serious waste exceptions or margin bottlenecks detected in currently approved formulations.`,
        action: `Maintain current vendor pricing agreements, regular calibration schedules for vacuum fryers, and run monthly audits.`,
        badge: 'Good'
      });
    }

    return issuesList;
  }, [richBoms, state.produk, masterMaterials]);

  // Adding single item row in form items
  const handleAddFormItem = () => {
    const newItem: ComponentItem = {
      id: 'COMP-NEW-' + Date.now() + Math.random().toString(36).substr(2, 5),
      materialType: 'Raw Material',
      materialId: '',
      qtyNeeded: 0,
      unit: 'Kg',
      wastePercent: 0,
      lossPercent: 0,
      notes: ''
    };
    setFormItems([...formItems, newItem]);
  };

  const handleRemoveFormItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleUpdateFormItem = (index: number, updated: Partial<ComponentItem>) => {
    const copy = [...formItems];
    copy[index] = { ...copy[index], ...updated } as ComponentItem;
    
    // Automatically preset unit based on selected material type
    if (updated.materialType) {
      const type = updated.materialType;
      if (type === 'Raw Material' || type === 'Chips' || type === 'Frozen') {
        copy[index].unit = 'Kg';
      } else if (type === 'Packaging' || type === 'Supporting Material') {
        copy[index].unit = 'Pcs';
      } else if (type === 'Chemical') {
        copy[index].unit = 'Liter';
      } else if (type === 'Consumable') {
        copy[index].unit = 'Tabung';
      }
      copy[index].materialId = '';
    } else if (updated.materialId) {
      // Look up standard unit from master materials
      const type = copy[index].materialType;
      const list = (masterMaterials as any)[type] || [];
      const found = list.find((m: any) => m.id === updated.materialId);
      if (found) {
        copy[index].unit = found.unit;
      }
    }
    setFormItems(copy);
  };

  // Mixed Fruit Management in form
  const handleAddMixedFruit = () => {
    if (formMixedFruits.length >= 10) return; // Allow up to 10 Fruit Variants
    setFormMixedFruits([...formMixedFruits, { fruitVariantId: '', percentage: 0 }]);
  };

  const handleRemoveMixedFruit = (index: number) => {
    setFormMixedFruits(formMixedFruits.filter((_, i) => i !== index));
  };

  const handleUpdateMixedFruit = (index: number, updated: Partial<MixedFruitItem>) => {
    const copy = [...formMixedFruits];
    copy[index] = { ...copy[index], ...updated };
    setFormMixedFruits(copy);
  };

  // Open creation form of a clean BOM
  const handleStartCreate = () => {
    setFormId('BOM-' + (richBoms.length + 101));
    setFormNama('');
    setFormProdukId(state.produk[0]?.id || '');
    setFormKategori('Finished Goods');
    setFormLokasiId('All');
    setFormVersion('1.0');
    setFormEffectiveDate('2026-06-01');
    setFormExpiryDate('2027-06-01');
    setFormNotes('');
    setFormIsMixed(false);
    setFormMixedFruits([{ fruitVariantId: '', percentage: 0 }]);
    setFormItems([
      {
        id: 'COMP-SEED-1',
        materialType: 'Chips',
        materialId: state.chipVariants[0]?.id || '',
        qtyNeeded: 0.100,
        unit: 'Kg',
        wastePercent: 2,
        lossPercent: 0,
        notes: 'Main chip core ingredient'
      },
      {
        id: 'COMP-SEED-2',
        materialType: 'Packaging',
        materialId: state.packagingMaster[0]?.id || '',
        qtyNeeded: 1,
        unit: 'Pcs',
        wastePercent: 1,
        lossPercent: 0,
        notes: 'Primary container'
      }
    ]);
    setIsCreating(true);
    setIsEditing(false);
  };

  // Edit existing BOM loader
  const handleStartEdit = (bom: BOMHeader) => {
    setFormId(bom.id);
    setFormNama(bom.nama);
    setFormProdukId(bom.produkId);
    setFormKategori(bom.kategoriProduk);
    setFormLokasiId(bom.lokasiId);
    setFormVersion(bom.version);
    setFormEffectiveDate(bom.effectiveDate);
    setFormExpiryDate(bom.expiryDate);
    setFormNotes(bom.notes || '');
    setFormIsMixed(bom.isMixedProduct || false);
    setFormMixedFruits(bom.mixedFruits?.length ? bom.mixedFruits : [{ fruitVariantId: '', percentage: 0 }]);
    setFormItems(bom.items);
    
    setIsEditing(true);
    setIsCreating(false);
  };

  // Submit Save BOM
  const handleSaveBOM = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check total percentage for Mixed Fruit
    if (formIsMixed) {
      const sum = formMixedFruits.reduce((a, b) => a + Number(b.percentage), 0);
      if (sum !== 100) {
        alert('Formulasi Campuran Gagal: Total persentase komposisi buah wajib persis 100% (saat ini: ' + sum + '%)');
        return;
      }
    }

    const payload: BOMHeader = {
      id: formId,
      nama: formNama || `BOM Formulasi SKU ${state.produk.find(p => p.id === formProdukId)?.sku || formProdukId}`,
      produkId: formProdukId,
      kategoriProduk: formIsMixed ? 'Mixed Fruit Product' : formKategori,
      lokasiId: formLokasiId,
      version: formVersion,
      status: 'Draft', // always reverts to draft on modifications
      effectiveDate: formEffectiveDate,
      expiryDate: formExpiryDate,
      notes: formNotes,
      isMixedProduct: formIsMixed,
      mixedFruits: formIsMixed ? formMixedFruits.filter(mf => mf.fruitVariantId && mf.percentage > 0) : [],
      items: formItems.filter(item => item.materialId && item.qtyNeeded > 0),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.namaLengkap || currentUser.username,
      approvalStage: 'Creator'
    };

    let updatedList;
    if (isEditing) {
      updatedList = richBoms.map(b => b.id === formId ? payload : b);
      logActivity('BOM Management', `Mengupdate Bill of Materials (BOM) ${formId} status kembali draft.`, payload);
    } else {
      updatedList = [...richBoms, payload];
      logActivity('BOM Management', `Membuat Bill of Materials (BOM) baru ${formId} dengan ${payload.items.length} komponen.`, payload);
    }

    // Persist to App State & LocalStorage
    setBom(updatedList);
    localStorage.setItem('agridea_bom', JSON.stringify(updatedList));
    
    setIsEditing(false);
    setIsCreating(false);
    setSelectedBomId(formId);
  };

  // Workflow Approval transition
  const handleWorkflowTransition = (stage: 'Pending Approval' | 'Approved' | 'Archived' | 'Draft') => {
    const bomObj = richBoms.find(b => b.id === selectedBomId);
    if (!bomObj) return;

    let nextStage: 'Draft' | 'Pending Approval' | 'Approved' | 'Archived' = stage;
    let approvalStage: 'Creator' | 'Production Manager' | 'HQ Production' | 'Approved' = bomObj.approvalStage;

    if (stage === 'Pending Approval') {
      approvalStage = 'Production Manager';
    } else if (stage === 'Approved') {
      if (currentUser.role.includes('HQ') || currentUser.role.includes('Director') || currentUser.role.includes('Admin')) {
        approvalStage = 'Approved';
      } else if (currentUser.role.includes('Manager')) {
        approvalStage = 'HQ Production';
        nextStage = 'Pending Approval'; // still pending until HQ approves
      } else {
        alert('Akses Ditolak: Anda tidak memiliki wewenang menyetujui formulasi BOM secara final.');
        return;
      }
    } else if (stage === 'Draft') {
      approvalStage = 'Creator';
    }

    const updatedUser = currentUser.namaLengkap || currentUser.username;
    const historyItem = {
      stage: approvalStage,
      action: stage === 'Draft' ? 'Rejected' as const : (stage === 'Approved' ? 'Approved' as const : 'Submitted' as const),
      approver: updatedUser,
      date: new Date().toISOString().split('T')[0],
      revisionNotes: workflowActionNotes
    };

    const updated: BOMHeader = {
      ...bomObj,
      status: nextStage,
      approvalStage: approvalStage,
      approvedAt: nextStage === 'Approved' ? new Date().toISOString().split('T')[0] : bomObj.approvedAt,
      approvedBy: nextStage === 'Approved' ? updatedUser : bomObj.approvedBy,
      revisionNotes: workflowActionNotes,
      approvalHistory: [...(bomObj.approvalHistory || []), historyItem]
    };

    const updatedList = richBoms.map(b => b.id === selectedBomId ? updated : b);
    setBom(updatedList);
    localStorage.setItem('agridea_bom', JSON.stringify(updatedList));

    logActivity('BOM Management', `BOM ${selectedBomId} dialihkan ke status [${nextStage}] Stage: [${approvalStage}] oleh ${updatedUser}`, updated);
    
    setShowWorkflowModal(false);
    setWorkflowActionNotes('');
  };

  // Delete BOM header
  const handleDeleteBOM = (bomId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus formulasi BOM ' + bomId + '? Tindakan ini tidak dapat dibatalkan.')) return;
    const updatedList = richBoms.filter(b => b.id !== bomId);
    setBom(updatedList);
    localStorage.setItem('agridea_bom', JSON.stringify(updatedList));
    logActivity('BOM Management', `Menghapus Bill of Materials ${bomId}.`);
    if (selectedBomId === bomId) setSelectedBomId(null);
  };

  // Filtering list
  const filteredBoms = useMemo(() => {
    return richBoms.filter(b => {
      const matchSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          state.produk.find(p => p.id === b.produkId)?.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter ? b.kategoriProduk === categoryFilter : true;
      const matchStatus = statusFilter ? b.status === statusFilter : true;
      return matchSearch && matchCat && matchStatus;
    });
  }, [richBoms, searchQuery, categoryFilter, statusFilter, state.produk]);

  const activeBomDetail = useMemo(() => {
    if (!selectedBomId) return null;
    return richBoms.find(b => b.id === selectedBomId) || null;
  }, [selectedBomId, richBoms]);

  return (
    <div className="space-y-6" id="bom-management-module">
      
      {/* Visual Context Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" /> High-Performance Factory Core
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white italic">
              MULTI-LEVEL BILL of MATERIALS (BOM)
            </h1>
            <p className="text-slate-405 text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Arsitektur meledakkan formulasi produk (BOM explosion) melintasi multi-step pengolahan, bahan kemas, helper, chemical, serta pendistribusian cost standar &amp; margin secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartCreate}
              className="bg-emerald-500 hover:bg-emerald-600 active:transform active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 uppercase tracking-wide cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" /> Buat Formula BOM
            </button>
          </div>
        </div>

        {/* NAVIGATION SHELF */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsCreating(false); setIsEditing(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 select-none ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            📊 BOM Executive Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('list'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 select-none ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Master Formulasi &amp; Workflow ({richBoms.length})
          </button>
          <button
            onClick={() => { setActiveTab('profitability'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 select-none ${activeTab === 'profitability' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            💰 SKU Costing &amp; Profitability
          </button>
          <button
            onClick={() => { setActiveTab('ai-insights'); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 select-none ${activeTab === 'ai-insights' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-white'}`}
          >
            ✨ AI Formulations Auditor
          </button>
        </div>
      </div>

      {/* VIEW 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && !isCreating && !isEditing && (
        <div className="space-y-6 animate-fade-in" id="bom-dashboard-view">
          
          {/* Quick Stats Shelf */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Total BOM Formula</span>
                <span className="text-2xl font-mono font-black text-slate-800">{stats.totalBOM}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Approved (Final)</span>
                <span className="text-2xl font-mono font-black text-emerald-700">{stats.approvedBOM}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Pending Review</span>
                <span className="text-2xl font-mono font-black text-orange-700">{stats.pendingBOM}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Draft Formulations</span>
                <span className="text-2xl font-mono font-black text-blue-700">{stats.draftBOM}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Pie Chart / Cost Allocation Breakdown via Progress bars */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Approved BOM Standard Cost Allocation</h3>
                <p className="text-slate-400 text-[10.5px]">Breakdown beban rata-rata per formulasi produk berjalan.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span> Bahan Baku Segar / WIP</span>
                    <span className="font-mono">{stats.costAllocation.rm > 0 ? Math.round((stats.costAllocation.rm / stats.costAllocation.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${stats.costAllocation.rm > 0 ? (stats.costAllocation.rm / stats.costAllocation.total) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-430 block">Est: Rp {stats.costAllocation.rm.toLocaleString()}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Packaging &amp; Supporting Box</span>
                    <span className="font-mono">{stats.costAllocation.pkg > 0 ? Math.round((stats.costAllocation.pkg / stats.costAllocation.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.costAllocation.pkg > 0 ? (stats.costAllocation.pkg / stats.costAllocation.total) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-450 block">Est: Rp {stats.costAllocation.pkg.toLocaleString()}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> Utilities Sawit &amp; LPG Consumables</span>
                    <span className="font-mono">{stats.costAllocation.chem > 0 ? Math.round((stats.costAllocation.chem / stats.costAllocation.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${stats.costAllocation.chem > 0 ? (stats.costAllocation.chem / stats.costAllocation.total) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-463 block">Est: Rp {stats.costAllocation.chem.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Top Cost Drivers List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Top 5 Materials Cost Drivers</h3>
                <p className="text-slate-400 text-[10.5px]">Item material termahal yang menyerap anggaran produksi.</p>
              </div>

              <div className="divide-y divide-slate-100 pt-1">
                {stats.topDrivers.map((driver, index) => (
                  <div key={index} className="py-2 flex items-center justify-between font-mono text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-900 font-extrabold block truncate max-w-40">{driver.name}</span>
                      <span className="text-slate-400 text-[10px] block">Qty share: {driver.qty.toFixed(1)} unit</span>
                    </div>
                    <span className="text-emerald-700 font-black">
                      Rp {Math.round(driver.cost).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Helper Tips / Multi-level guide */}
            <div className="bg-gradient-to-br from-indigo-550 to-indigo-700 bg-indigo-900 text-white p-6 rounded-2xl border border-indigo-950 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="bg-indigo-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">BOM Levels Architecture</span>
                <h4 className="font-black font-display text-base tracking-wide leading-snug">Multi-Step Explosion Diagram</h4>
                <div className="space-y-2 text-[11px] text-indigo-200 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9.5px]">1</span>
                    <span>Level 1: Raw Fresh Fruit &amp; Frying conversion to WIP Frozen/Bulk.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9.5px]">2</span>
                    <span>Level 2: Bulk chips matched with stands, stickers, silica gels.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9.5px]">3</span>
                    <span>Level 3: Custom Mixed Fruit ratios, OEM configurations, and Custom Brands.</span>
                  </div>
                </div>
              </div>
              <p className="text-[9.5px] text-indigo-300 leading-tight mt-4">
                Sistem menghapus manual kalkulasi. Formula validasi secara ketat mencegah sisa margin yang bocor dalam proses kemas dan penyusutan air.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: BOM LIST & DETAIL STRAW */}
      {activeTab === 'list' && !isCreating && !isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="bom-list-and-flow-view">
          
          {/* LEFT: Filters & List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari Code, Nama BOM, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10.5px] font-extrabold font-sans text-slate-700"
                >
                  <option value="">Semua Kategori</option>
                  <option value="Semi-Finished">Semi-Finished</option>
                  <option value="Finished Goods">Finished Goods</option>
                  <option value="OEM">OEM Products</option>
                  <option value="Mixed Fruit Product">Mixed Fruit</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10.5px] font-extrabold font-sans text-slate-700"
                >
                  <option value="">Semua Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredBoms.length === 0 ? (
                <div className="p-8 text-center bg-white border rounded-2xl text-slate-400 font-bold">
                  BOM tidak ditemukan.
                </div>
              ) : (
                filteredBoms.map(bom => {
                  const skuObj = state.produk.find(p => p.id === bom.produkId);
                  const isActive = selectedBomId === bom.id;
                  
                  let statusColor = 'bg-slate-100 text-slate-650';
                  if (bom.status === 'Approved') statusColor = 'bg-emerald-100 text-emerald-800';
                  if (bom.status === 'Pending Approval') statusColor = 'bg-orange-100 text-orange-850 animate-pulse';
                  if (bom.status === 'Draft') statusColor = 'bg-blue-100 text-blue-800';

                  return (
                    <div
                      key={bom.id}
                      onClick={() => { setSelectedBomId(bom.id); }}
                      className={`bg-white p-4 rounded-xl border transition cursor-pointer select-none space-y-2 ${isActive ? 'ring-2 ring-slate-900 border-slate-900 shadow-md translate-x-1' : 'border-slate-200 hover:border-slate-400'}`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                        <span className="font-extrabold block text-slate-400">{bom.id}</span>
                        <span className={`px-1.5 py-0.5 rounded-md font-extrabold uppercase ${statusColor}`}>{bom.status}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-black text-slate-800 text-xs tracking-tight line-clamp-1">{bom.nama}</h4>
                        <span className="text-slate-400 block text-[10px] font-medium leading-tight">SKU: {skuObj?.sku || bom.produkId}</span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-450 pt-1 border-t border-slate-100">
                        <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 truncate max-w-28 uppercase font-bold">{bom.kategoriProduk}</span>
                        <span className="font-bold">v{bom.version}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Detail Sheet */}
          <div className="lg:col-span-2">
            {!activeBomDetail ? (
              <div className="bg-white p-12 text-center border border-dashed rounded-3xl text-slate-400 font-bold flex flex-col items-center justify-center h-full min-h-64">
                <FileSpreadsheet className="w-12 h-12 mb-3 text-slate-300" />
                Silakan pilih salah satu data BOM di sebelah kiri untuk melihat rincian komponen detail material, flow persetujuan, serta audit log.
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
                
                {/* Detail Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-extrabold text-xs">{activeBomDetail.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">{activeBomDetail.kategoriProduk}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight font-display">{activeBomDetail.nama}</h2>
                    <p className="text-[11px] text-slate-500 font-medium font-mono">Product Target SKU: <strong className="text-indigo-950">{(state.produk.find(p => p.id === activeBomDetail.produkId))?.nama || activeBomDetail.produkId} ({(state.produk.find(p => p.id === activeBomDetail.produkId))?.sku})</strong></p>
                  </div>

                  {/* Visual Status Button and Version info */}
                  <div className="text-right space-y-1">
                    <span className="text-slate-400 block font-bold text-[9px] uppercase font-mono tracking-wider">Version v{activeBomDetail.version}</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setShowWorkflowModal(true)}
                        className="bg-slate-900 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg border border-slate-850 hover:bg-slate-800 shadow-sm select-none transition flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" /> Alur Persetujuan
                      </button>
                      <button
                        onClick={() => handleStartEdit(activeBomDetail)}
                        className="bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg select-none transition"
                      >
                        Edit BOM
                      </button>
                      <button
                        onClick={() => handleDeleteBOM(activeBomDetail.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition"
                        title="Delete BOM"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-650" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* MIXED FRUIT COMPOSITION SHEET */}
                {activeBomDetail.isMixedProduct && activeBomDetail.mixedFruits && (
                  <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                    <span className="text-[10px] font-extrabold text-orange-850 uppercase tracking-widest block">🍊 Campuran Multi-Fruit (Composition Support - Max 10 Variants)</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {activeBomDetail.mixedFruits.map((mf, mfIdx) => {
                        const targetFruit = state.fruitVariants.find(fv => fv.id === mf.fruitVariantId);
                        const weight = (mf.percentage * 200) / 100; // Mock standard 200g weight
                        const cost = weight * 12; // cost share ratio
                        return (
                          <div key={mfIdx} className="bg-white/80 p-2.5 rounded-xl border border-orange-100 text-xs font-mono">
                            <span className="text-slate-400 block uppercase text-[8.5px] font-black">Fruit Variant:</span>
                            <span className="text-slate-800 font-black truncate block">{targetFruit?.nama || mf.fruitVariantId}</span>
                            <div className="flex items-end justify-between pt-1 border-t border-slate-100/30 mt-1">
                              <div>
                                <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Ratio</span>
                                <span className="text-orange-600 font-bold">{mf.percentage}%</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Cost Alloc</span>
                                <span className="text-slate-700 font-bold">12%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Standard Data Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-[11px] font-mono leading-snug">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-extrabold">STATUS TERAKHIR</span>
                    <span className="text-slate-800 font-extrabold uppercase">{activeBomDetail.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-extrabold">STAGE WORKFLOW</span>
                    <span className="text-slate-800 font-extrabold">{activeBomDetail.approvalStage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-extrabold">TANGGAL EFEKTIF</span>
                    <span className="text-slate-800 font-extrabold">{activeBomDetail.effectiveDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-extrabold">TANGGAL EXPIRY</span>
                    <span className="text-slate-800 font-extrabold">{activeBomDetail.expiryDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[9px] uppercase font-extrabold">PEMBUAT FORMULA</span>
                    <span className="text-slate-800 font-extrabold">{activeBomDetail.createdBy} ({activeBomDetail.createdAt})</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[9px] uppercase font-extrabold">DISETUJUI OLEH</span>
                    <span className="text-slate-800 font-extrabold">{activeBomDetail.approvedBy ? `${activeBomDetail.approvedBy} (${activeBomDetail.approvedAt})` : 'Belum disetujui secara final'}</span>
                  </div>
                </div>

                {/* Sub-table list of items */}
                <div className="space-y-3 leading-relaxed">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider block">🔬 Rincian Formula Komponen Material</h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Tipe Material</th>
                          <th className="py-3 px-4">Item Name / Code</th>
                          <th className="py-3 px-2 text-right">Kebutuhan Qty</th>
                          <th className="py-3 px-2 text-right">Waste %</th>
                          <th className="py-3 px-2 text-right">Loss %</th>
                          <th className="py-3 px-4 text-right">Cost Estimasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {activeBomDetail.items.map((item, idx) => {
                          const matCost = getMaterialCost(item.materialType, item.materialId);
                          const adjQty = item.qtyNeeded * (1 + (item.wastePercent || 0)/100) * (1 + (item.lossPercent || 0)/100);
                          const rowCost = adjQty * matCost;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-mono font-bold text-[11px] text-slate-500">{item.materialType}</td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-800 block leading-tight">{getMaterialName(item.materialType, item.materialId)}</span>
                                <span className="font-mono text-[9px] text-slate-400 block">Code: {item.materialId}</span>
                              </td>
                              <td className="py-3 px-2 text-right font-mono font-extrabold text-slate-700">{item.qtyNeeded.toLocaleString()} {item.unit}</td>
                              <td className="py-3 px-2 text-right font-mono text-slate-405 text-slate-500">{item.wastePercent || 0}%</td>
                              <td className="py-3 px-2 text-right font-mono text-slate-405 text-slate-500">{item.lossPercent || 0}%</td>
                              <td className="py-3 px-4 text-right font-mono font-black text-slate-800">
                                Rp {Math.round(rowCost).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Revision Notes if exists */}
                {activeBomDetail.revisionNotes && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-[11px] leading-relaxed text-slate-750">
                    <span className="font-extrabold text-orange-800 uppercase block tracking-wider text-[9px] mb-1">Catatan Revisi / Approval Terakhir:</span>
                    {activeBomDetail.revisionNotes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: SKU COSTING & PROFITABILITY */}
      {activeTab === 'profitability' && !isCreating && !isEditing && (
        <div className="space-y-6 animate-fade-in" id="sku-costing-view">
          
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Price Simulation &amp; SKU Margin Analyzer
              </h3>
              <p className="text-slate-400 text-[11px]">Hitung COGS, margin kotor, dan laba bersih per pouch secara otomatis berbasis bahan baku BOM dan target labor.</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-700 uppercase">Pilih Produk:</label>
              <select
                value={simulatedSkuId}
                onChange={(e) => {
                  setSimulatedSkuId(e.target.value);
                  setSimulatedPrice(0); // reset custom price
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold font-mono focus:ring-2 focus:ring-slate-950 focus:outline-none focus:bg-white"
              >
                {state.produk.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.nama}</option>
                ))}
              </select>
            </div>
          </div>

          {activeSimulatedSku ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-stretch">
              
              {/* Simulator Controls & Input */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Konfigurasi Simulasi</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide block">Harga Jual Standar (Rp)</label>
                  <input
                    type="number"
                    value={simulatedPrice || activeSimulatedSku.sku.hargaJualStandar}
                    onChange={(e) => setSimulatedPrice(Math.max(1050, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white block"
                  />
                  <span className="text-[9.5px] text-slate-400">Harga Jual terdaftar: Rp {activeSimulatedSku.sku.hargaJualStandar.toLocaleString()}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide block">Gaji Buruh Kemas &amp; Shift (Rp / Pcs)</label>
                  <input
                    type="number"
                    value={simulatedLaborCost}
                    onChange={(e) => setSimulatedLaborCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white block"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide block">Biaya Overhead Pabrik (Gas, Logistik - Rp / Pcs)</label>
                  <input
                    type="number"
                    value={simulatedOverheadCost}
                    onChange={(e) => setSimulatedOverheadCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white block"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] leading-relaxed text-slate-500">
                  <span className="font-extrabold block text-slate-800 uppercase tracking-wider text-[9px] mb-1">Standard Formulations Source:</span>
                  {activeSimulatedSku.bom ? (
                    <p>Membaca database aktif approved rumus BOM <strong className="font-mono text-indigo-700 font-extrabold">{activeSimulatedSku.bom.id}</strong> ({activeSimulatedSku.bom.items.length} komponen).</p>
                  ) : (
                    <p className="text-red-500 font-bold">⚠️ Belum ditemukan rumus BOM yang disetujui (Approved) untuk produk SKU ini. Menghitung berbasis default fallback data.</p>
                  )}
                </div>
              </div>

              {/* Profitability Gauges */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1.5">
                    <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Final Simulated Cost (COGS)</span>
                    <div className="text-2xl font-black font-mono tracking-tight text-white">
                      Rp {Math.round(activeSimulatedSku.totalCOGS).toLocaleString()}
                    </div>
                    <p className="text-[10px] text-indigo-300 font-sans">Material + Tenaga Kerja + Overhead</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                    <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Gross Profit per Pouch</span>
                    <div className={`text-2xl font-black font-mono tracking-tight ${activeSimulatedSku.marginAmount > 0 ? 'text-emerald-700' : 'text-red-650'}`}>
                      Rp {Math.round(activeSimulatedSku.marginAmount).toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">Harga Jual dikurangi total COGS</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                    <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Gross Margin Percent</span>
                    <div className={`text-2xl font-black font-mono tracking-tight ${activeSimulatedSku.marginPct > 35 ? 'text-emerald-700' : 'text-orange-650'}`}>
                      {activeSimulatedSku.marginPct.toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">Ideal margin standard pabrik &gt; 35%</p>
                  </div>
                </div>

                {/* COGS Segment Breakdown Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider block">🔬 Rincian Struktur Beban Berbasis BOM</h4>
                    <span className="text-[10px] font-mono text-slate-400">Calculated Component Breakdown</span>
                  </div>

                  <div className="divide-y divide-slate-100 font-mono text-[11px] leading-relaxed">
                    <div className="py-2.5 flex items-center justify-between font-bold">
                      <span className="text-slate-650">A. Bahan Baku Segar / WIP Chips</span>
                      <span className="text-slate-900">Rp {Math.round(activeSimulatedSku.rmCost).toLocaleString()}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between font-bold">
                      <span className="text-slate-650">B. Standar Kemasan (Standing pouch, silicon, carton fraction)</span>
                      <span className="text-slate-900">Rp {Math.round(activeSimulatedSku.pgCost).toLocaleString()}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between font-bold">
                      <span className="text-slate-650">C. Utilitas Frying (Minyak Goreng, LPG proporsi)</span>
                      <span className="text-slate-900">Rp {Math.round(activeSimulatedSku.chemCost).toLocaleString()}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between font-semibold text-slate-450 italic">
                      <span>Total Biaya Bahan Primer (BOM Materials Total / A + B + C)</span>
                      <span className="font-bold text-indigo-700">Rp {Math.round(activeSimulatedSku.totalMaterial).toLocaleString()}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between font-bold">
                      <span className="text-slate-650">D. Target Upah Tenaga Kerja Langsung</span>
                      <span className="text-slate-900">Rp {simulatedLaborCost.toLocaleString()}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between font-bold">
                      <span className="text-slate-650">E. Alokasi Overhead Pabrik &amp; Penyusutan</span>
                      <span className="text-slate-900">Rp {simulatedOverheadCost.toLocaleString()}</span>
                    </div>
                    <div className="py-3 flex items-center justify-between font-black text-xs text-slate-800 border-t pt-3">
                      <span className="uppercase">TOTAL HARGA POKOK PENJUALAN (COGS / A+B+C+D+E)</span>
                      <span className="font-mono text-indigo-950">Rp {Math.round(activeSimulatedSku.totalCOGS).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center text-slate-400 font-bold border rounded-2xl">
              Silakan buat dan approve formula produk terlebih dahulu melintasi level BOM.
            </div>
          )}

        </div>
      )}

      {/* VIEW 4: AI BOM ANALYSIS / AUDITOR */}
      {activeTab === 'ai-insights' && !isCreating && !isEditing && (
        <div className="space-y-6 animate-fade-in" id="bom-ai-insights-view">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-650 animate-pulse" /> AI Auditor Panel
              </span>
              <h3 className="font-black text-slate-800 tracking-tight font-display text-lg">AI BOM FORMULATIONS AUDITOR &amp; WASTE ANALYSIS</h3>
              <p className="text-slate-400 text-xs font-medium max-w-xl">
                Secara intelijen memindai semua database BOM aktif untuk mendeteksi deviasi cost, pemborosan bahan (waste), potensi renyah meleset (lack of silica), atau kebocoran margin finansial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            {aiBomAnalysis.map((item, idx) => {
              let badgeColor = 'bg-slate-100 text-slate-800';
              if (item.badge === 'Critical') badgeColor = 'bg-red-100 text-red-800 border border-red-200';
              if (item.badge === 'Warning') badgeColor = 'bg-orange-100 text-orange-950 border border-orange-200';
              if (item.badge === 'Good') badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';

              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold uppercase ${badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-slate-400 text-[10.5px] font-bold font-mono">Insight #{idx+1}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-extrabold text-slate-800 text-sm">{item.problem}</h5>
                    <p className="text-slate-500 text-xs font-medium">{item.challenge}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-1">
                    <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-widest block">💡 Rekomendasi Solusi &amp; Action Plan:</span>
                    <p className="text-slate-700 text-xs font-semibold leading-relaxed">{item.action}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* FORM: CREATE OR EDIT BOM */}
      {(isCreating || isEditing) && (
        <form onSubmit={handleSaveBOM} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-8 animate-fade-in" id="bom-form-shelf">
          
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight font-display uppercase">
                {isCreating ? 'Membuat Formulasi BOM Baru' : `Mengedit Formulasi BOM [${formId}]`}
              </h2>
              <p className="text-slate-400 text-xs">Isi rincian header dan komponen material detail di bawah ini.</p>
            </div>

            <button
              type="button"
              onClick={() => { setIsCreating(false); setIsEditing(false); }}
              className="text-slate-400 hover:text-slate-800 font-extrabold text-xs transition uppercase"
            >
              Batalkan
            </button>
          </div>

          {/* SECTION 1: HEADER INFO */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-5">
            <h4 className="font-black text-slate-850 text-xs uppercase tracking-wider block border-b pb-1.5">1. Definisi Header &amp; Konteks Produk</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">BOM Code</label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={isEditing}
                  placeholder="Contoh: BOM-APL-L1"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Version (e.g. 1.0)</label>
                <input
                  type="text"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                  placeholder="e.g. 1.0"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Nama BOM / Formulasi</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="e.g. Apple Pouch Standard Recipe"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Target Product SKU</label>
                <select
                  value={formProdukId}
                  onChange={(e) => setFormProdukId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {state.produk.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.sku} ({p.nama})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Kategori Produk</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="Semi-Finished">Semi-Finished WIP</option>
                  <option value="Finished Goods">Finished Goods Retail</option>
                  <option value="OEM">OEM Products</option>
                  <option value="Mixed Fruit Product">Mixed Fruit Case</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Pabrik / Lokasi</label>
                <select
                  value={formLokasiId}
                  onChange={(e) => setFormLokasiId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="All">Semua Lokasi (Global)</option>
                  <option value="JKT">Jakarta Factory (HQ)</option>
                  <option value="MPD">Madiun/Batu Branch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Tanggal Efektif</label>
                <input
                  type="date"
                  value={formEffectiveDate}
                  onChange={(e) => setFormEffectiveDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Tanggal Expiry</label>
                <input
                  type="date"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[11px] font-extrabold text-slate-705 uppercase tracking-wider block">Catatan Formulasi (Notes)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Garansi renyah 12 bulan..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:ring-2 focus:ring-slate-900 focus:outline-none min-h-16"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MIXED PRODUCT COMPOSITION (Toggle check) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="form_is_mixed_chk"
                  checked={formIsMixed}
                  onChange={(e) => setFormIsMixed(e.target.checked)}
                  className="w-4.5 h-4.5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <label htmlFor="form_is_mixed_chk" className="text-xs font-black text-slate-800 uppercase tracking-wide cursor-pointer select-none">
                  Aktifkan Formulir Campuran Multi-Fruit / Mixed Product (Hingga 10 Buah)
                </label>
              </div>
              {formIsMixed && (
                <button
                  type="button"
                  onClick={handleAddMixedFruit}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] uppercase py-1.5 px-3 rounded-lg border border-indigo-200 transition"
                >
                  Tambah Buah (+ Max 10)
                </button>
              )}
            </div>

            {formIsMixed && (
              <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-200 space-y-4 animate-fade-in">
                <span className="text-[10px] text-orange-950 font-extrabold uppercase tracking-widest block">🍊 Komposisi Rasio Variant Buah Seimbang (Wajib total 100%)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formMixedFruits.map((mf, index) => (
                    <div key={index} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Fruit Variant #{index+1}</span>
                        <select
                          value={mf.fruitVariantId}
                          onChange={(e) => handleUpdateMixedFruit(index, { fruitVariantId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                        >
                          <option value="">-- Pilih Buah --</option>
                          {state.fruitVariants.map(fv => (
                            <option key={fv.id} value={fv.id}>{fv.id} - {fv.nama}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 space-y-1">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Rasio (%)</span>
                        <div className="relative">
                          <input
                            type="number"
                            value={mf.percentage}
                            onChange={(e) => handleUpdateMixedFruit(index, { percentage: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-center text-xs focus:outline-none"
                            placeholder="30"
                            min="0"
                            max="100"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-bold">%</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMixedFruit(index)}
                        className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg transition mt-4"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-orange-100 flex items-center justify-between text-xs font-mono font-black text-slate-800">
                  <span>KOMUMULATIVE FORMULATION BALANCE:</span>
                  <span className={formMixedFruits.reduce((a,b)=>a+Number(b.percentage),0) === 100 ? 'text-emerald-700' : 'text-red-500'}>
                    {formMixedFruits.reduce((a,b)=>a+Number(b.percentage),0)}% / 100%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: MATERIAL DETAILS / INGREDIENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-black text-slate-805 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                2. Daftar Detail Komponen (Ingredients, Box &amp; Packing Materials)
              </h4>
              <button
                type="button"
                onClick={handleAddFormItem}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase py-1.5 px-3 rounded-lg border border-emerald-255 transition"
              >
                + Tambah Baris Komponen
              </button>
            </div>

            <div className="space-y-3">
              {formItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 border border-dashed rounded-2xl">
                  Tidak ada komponen material terdaftar. Klik + Tambah Baris Komponen di atas untuk memulai meledakkan resep.
                </div>
              ) : (
                formItems.map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    
                    {/* Material Type */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Material Type</span>
                      <select
                        value={item.materialType}
                        onChange={(e) => handleUpdateFormItem(idx, { materialType: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold leading-tight"
                      >
                        <option value="Raw Material">Raw Material (Segar)</option>
                        <option value="Frozen">Frozen WIP</option>
                        <option value="Chips">Chips (Setengah Jadi)</option>
                        <option value="Packaging">Packaging (Primary/Stand)</option>
                        <option value="Supporting Material">Supporting Box/Sticker</option>
                        <option value="Chemical">Chemical (Sawit)</option>
                        <option value="Consumable">Consumable Gas/Utilities</option>
                      </select>
                    </div>

                    {/* Material ID lookup */}
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block flex items-center justify-between">
                        <span>Pilih Material</span>
                        <span className="text-[8.5px] font-mono font-bold text-indigo-700">Stock: {item.unit}</span>
                      </span>
                      <select
                        value={item.materialId}
                        onChange={(e) => handleUpdateFormItem(idx, { materialId: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-semibold leading-normal"
                      >
                        <option value="">-- Pilih --</option>
                        {((masterMaterials as any)[item.materialType] || []).map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.id} - {m.nama} (Rp {m.cost.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Standard Qty */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Qty Needed per Unit</span>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.0001"
                          value={item.qtyNeeded}
                          onChange={(e) => handleUpdateFormItem(idx, { qtyNeeded: Number(e.target.value) })}
                          required
                          min="0.0001"
                          placeholder="e.g. 1"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-black text-center"
                        />
                        <span className="absolute right-2 top-2 text-[9px] text-slate-400 font-bold uppercase">{item.unit}</span>
                      </div>
                    </div>

                    {/* Waste % */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Waste / Susut %</span>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.wastePercent}
                          onChange={(e) => handleUpdateFormItem(idx, { wastePercent: Number(e.target.value) })}
                          min="0"
                          max="100"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-center"
                        />
                        <span className="absolute right-2 top-2 text-[9.5px] font-bold text-slate-400">%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 mt-3 md:mt-0">
                      <div className="text-right flex-1 md:flex-none">
                        <span className="text-[8.5px] font-extrabold text-slate-400 uppercase block">Line Total</span>
                        <span className="text-xs font-mono font-black text-slate-800">
                          Rp {Math.round(item.qtyNeeded * (1 + (item.wastePercent||0)/100) * getMaterialCost(item.materialType, item.materialId)).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFormItem(idx)}
                        className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4.5 h-4.5 text-red-650" />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* SYSTEM TOTAL ACTIONS */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block font-black uppercase tracking-wider">Estimated standard recipe COGS material cost</span>
              <div className="text-xl font-mono font-black">
                Rp {formItems.reduce((acc, item) => {
                  const base = getMaterialCost(item.materialType, item.materialId);
                  const wasteLoss = (1 + (item.wastePercent||0)/100);
                  return acc + (item.qtyNeeded * wasteLoss * base);
                }, 0).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setIsEditing(false); }}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-xs uppercase"
              >
                Batalkan
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-black text-xs uppercase tracking-wide flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                Simpan Sebagai Draft <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </form>
      )}

      {/* APPROVAL WORKFLOW DIALOG MODAL */}
      {showWorkflowModal && activeBomDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="workflow-transition-modal">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-6 border-b border-slate-100">
              <span className="font-mono text-xs text-slate-400 font-black block uppercase mb-1">Workflow Panel</span>
              <h3 className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">Otorisasi &amp; Status Level Formula [{activeBomDetail.id}]</h3>
              <p className="text-slate-400 text-xs mt-1">Ganti status, layangkan pengajuan, atau sanggah revisi dengan digital seal.</p>
            </div>

            <div className="p-6 space-y-4 leading-relaxed text-xs">
              
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                <p className="text-slate-500">Current Status: <strong className="text-slate-800 uppercase">{activeBomDetail.status}</strong></p>
                <p className="text-slate-500">Active Workflow Stage: <strong className="text-indigo-650 text-indigo-700">{activeBomDetail.approvalStage}</strong></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide block">Keterangan Otorisasi / Catatan Revisi:</label>
                <textarea
                  value={workflowActionNotes}
                  onChange={(e) => setWorkflowActionNotes(e.target.value)}
                  placeholder="e.g. Formula ini disahkan setelah penyesuaian gramasi 150g ke 100g pasca lab test..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:bg-white min-h-16"
                />
              </div>

              {/* Digital Signature Simulated indicator */}
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-[11px] font-mono text-emerald-800">
                <span>🔒 DIGITAL SEAL KEY DETECTED</span>
                <span className="font-bold">AGRIDEA-SECURE-{currentUser.role.toUpperCase()}-SEAL</span>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-[11px] font-extrabold uppercase transition"
              >
                Tutup
              </button>
              
              {/* Draft to Pending Approval */}
              {activeBomDetail.status === 'Draft' && (
                <button
                  type="button"
                  onClick={() => handleWorkflowTransition('Pending Approval')}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-wide shadow-sm"
                >
                  Ajukan untuk Direview (Pending Approval)
                </button>
              )}

              {/* Approve actions */}
              {activeBomDetail.status !== 'Approved' && (
                <button
                  type="button"
                  onClick={() => handleWorkflowTransition('Approved')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wide shadow-sm"
                >
                  Sahkan &amp; Nyatakan Approved
                </button>
              )}

              {/* Revert back to draft */}
              {activeBomDetail.status !== 'Draft' && (
                <button
                  type="button"
                  onClick={() => handleWorkflowTransition('Draft')}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-650 text-white text-[11px] font-black uppercase tracking-wide shadow-sm"
                >
                  Tolak (Kembalikan ke Draft)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
