/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Settings, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Users, 
  Archive, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  TrendingDown,
  Percent,
  Play
} from 'lucide-react';

interface Props {
  state: {
    lokasi: any[];
    mesin: any[];
    karyawan: any[];
    batches: any[];
    stocks: any[];
  };
  logActivity: (modul: string, deskripsi: string) => void;
  currentUser: any;
}

export interface Bottleneck {
  constraint: string;
  category: 'Machine' | 'Labor' | 'Storage' | 'Packaging';
  impact: string;
  riskLevel: '🔴 CRITICAL' | '🟡 WARNING' | '🟢 HEALTHY';
  recommendedAction: string;
}

export default function CapacityPlanning({ state, logActivity, currentUser }: Props) {
  // Simulator Input Factor (What-If Simulation scenario)
  const [activeScenario, setActiveScenario] = useState<string>('Normal Baseline');
  
  // Custom capacity inputs (stateful sliders)
  const [plannedVolumeKg, setPlannedVolumeKg] = useState<number>(750); // Daily production volume target
  const [availableFryers, setAvailableFryers] = useState<number>(2); // MPD Fryers
  const [peelingStaff, setPeelingStaff] = useState<number>(10);

  // 1. Calculations: MACHINE CAPACITY PLANNING
  // MPD machine capacity is 320 Kg frozen input per fryer per day
  const fryerCapPerDayUnit = 320;
  const maxMachineCapacity = availableFryers * fryerCapPerDayUnit;
  const machineUtilization = Math.round((plannedVolumeKg / (maxMachineCapacity || 1)) * 100);
  const machineGap = maxMachineCapacity - plannedVolumeKg;
  const machineStatus = machineGap < 0 ? 'Capacity Shortage' : 'Safe';

  // 2. Calculations: LABOR CAPACITY PLANNING (Peeling Section)
  // Productivity standard: 60 Kg raw fruit peeled per person per daily shift
  const peelingProductivityStandard = 60;
  const rawFruitRequiredForPeel = Math.round(plannedVolumeKg * 4.2); // Fruit multiplier
  const requiredPeelWorkers = Math.ceil(rawFruitRequiredForPeel / peelingProductivityStandard);
  const laborGap = peelingStaff - requiredPeelWorkers;
  const laborStatus = laborGap < 0 ? 'Shortage' : 'Adequate';

  // 3. Calculations: PACKAGING CAPACITY PLANNING
  const packagingStaffCount = 4;
  const packPerHourPerPerson = 45; // pcs
  const dailyPackagingShiftHrs = 8;
  const totalPackagingMaxPcsDay = packagingStaffCount * packPerHourPerPerson * dailyPackagingShiftHrs;
  const requiredPcsToPack = Math.round(plannedVolumeKg * 10); // 10 pouch per kg (100g each)
  const packagingUtilization = Math.round((requiredPcsToPack / (totalPackagingMaxPcsDay || 1)) * 100);

  // 4. Calculations: WAREHOUSE CAPACITY PLANNING (Simulated storage rates in liters/tons)
  const frozenCapMax = 5000; // Kg
  const frozenStorageCurrent = 3800; // Kg
  const frozenCapPct = Math.round((frozenStorageCurrent / frozenCapMax) * 100);

  const productStorageMax = 20000; // Pcs
  const productStorageCurrent = 16500; // Pcs
  const productStoragePct = Math.round((productStorageCurrent / productStorageMax) * 100);

  // What-If Scenario impact states (derived based on selection)
  const getScenarioData = () => {
    switch (activeScenario) {
      case 'Demand Increase':
        return {
          title: "Scen. Demand Increase (+35%)",
          capacityUtilization: 122,
          profitabilityImpact: "+Rp 18,250,000",
          procurementImpact: "Kekurangan raw nanas 4.8 Ton",
          cashFlow: "Positif (Derit tontonan PO)",
          bottleneck: "Lini Vacuum Frying MPD over-utilized",
          marginImpact: "+2.5% (Efisien skala)",
          colorClass: "bg-indigo-50 border-indigo-200 text-indigo-900"
        };
      case 'Demand Decrease':
        return {
          title: "Scen. Demand Fall (-25%)",
          capacityUtilization: 68,
          profitabilityImpact: "-Rp 9,500,000",
          procurementImpact: "Surplus buah menumpuk di gudang",
          cashFlow: "Negatif akibat biaya overhead tetap",
          bottleneck: "Unutilized labor di Wonosobo",
          marginImpact: "-4.2% (Waste membengkak)",
          colorClass: "bg-slate-50 border-slate-200 text-slate-800"
        };
      case 'Yield Decrease':
        return {
          title: "Scen. Yield Anjlok / Reject tinggi (Hama benih)",
          capacityUtilization: 95,
          profitabilityImpact: "-Rp 14,000,000",
          procurementImpact: "PO Buah terpaksa naik +40%",
          cashFlow: "Beban pembelian buah melonjak drastis",
          bottleneck: "Lini Peeling kebanjiran reject crop",
          marginImpact: "-5.8% (HPP per Pcs naik tajam)",
          colorClass: "bg-rose-50 border-rose-200 text-rose-900"
        };
      case 'Machine Breakdown':
        return {
          title: "Scen. Vacuum Fryer Pecah Evaporator (MPD)",
          capacityUtilization: 145,
          profitabilityImpact: "-Rp 22,000,000",
          procurementImpact: "Penundaan PO mentah",
          cashFlow: "Terlambat terima invoice delivery",
          bottleneck: "FRY-02 Rusak parah, downtime 4 hari",
          marginImpact: "-3.1% (Lembur shift malam)",
          colorClass: "bg-red-50 border-red-200 text-red-950"
        };
      case 'Labor Shortage':
        return {
          title: "Scen. 4 Pekerja Peeling Wonosobo Izin",
          capacityUtilization: 110,
          profitabilityImpact: "-Rp 5,400,000",
          procurementImpact: "Normal",
          cashFlow: "Normal",
          bottleneck: "Laju pemotongan lambat, frying tertunda",
          marginImpact: "-1.2% (Gaji borongan insentif)",
          colorClass: "bg-amber-50 border-amber-200 text-amber-900"
        };
      case 'Supplier Delay':
        return {
          title: "Scen. Kargo Supplier Nangka Terhambat Banjir",
          capacityUtilization: 50,
          profitabilityImpact: "-Rp 8,200,000",
          procurementImpact: "Harus beralih ke local spot market",
          cashFlow: "Suhu logistik terancam melar",
          bottleneck: "Idle vacuum frying machine",
          marginImpact: "-2.2% (Harga spot lebih mahal +15%)",
          colorClass: "bg-yellow-50 border-yellow-250 text-yellow-950"
        };
      default:
        return {
          title: "Normal Baseline (Standard MPS)",
          capacityUtilization: 88,
          profitabilityImpact: "Normal (On-Target Rp 45M)",
          procurementImpact: "Terjadwal rapi",
          cashFlow: "Sehat (Lancar)",
          bottleneck: "Tidak terdeteksi",
          marginImpact: "0.0% Variance",
          colorClass: "bg-white border-slate-200 text-slate-800"
        };
    }
  };

  const scenarioInfo = getScenarioData();

  // 5. Calculations: BOTTLENECK DETECTION ARRAY
  const bottlenecks: Bottleneck[] = [
    {
      constraint: "Vacuum Frying Capacity",
      category: "Machine",
      impact: `Planned: ${plannedVolumeKg}Kg vs Max: ${maxMachineCapacity}Kg.`,
      riskLevel: machineGap < 0 ? '🔴 CRITICAL' : machineUtilization >= 85 ? '🟡 WARNING' : '🟢 HEALTHY',
      recommendedAction: machineGap < 0 ? "Aktifkan shift lembur malam (Shift 3) atau operasikan vacuum fryer cadangan." : "Monitor suhu dan vakum di limit standar."
    },
    {
      constraint: "Raw Peeling Labor Force",
      category: "Labor",
      impact: `Available: ${peelingStaff} workers vs Required: ${requiredPeelWorkers}.`,
      riskLevel: laborGap < 0 ? '🔴 CRITICAL' : laborGap <= 2 ? '🟡 WARNING' : '🟢 HEALTHY',
      recommendedAction: laborGap < 0 ? `Ambil tambahan ${Math.abs(laborGap)} tenaga harian borongan luar daerah.` : "Terapkan bonus pemenuhan target harian (Borongan)."
    },
    {
      constraint: "Cold Storage Room",
      category: "Storage",
      impact: `Frozen space utilized ${frozenCapPct}% (${frozenStorageCurrent} Kg).`,
      riskLevel: frozenCapPct >= 90 ? '🔴 CRITICAL' : frozenCapPct >= 75 ? '🟡 WARNING' : '🟢 HEALTHY',
      recommendedAction: "Pindahkan secepatnya 500 Kg kargo beku ke cold storage SSP Sipahutar menggunakan truk kulkas."
    },
    {
      constraint: "Dynamic Packaging Output",
      category: "Packaging",
      impact: `Need ${requiredPcsToPack} Pcs vs Cap ${totalPackagingMaxPcsDay} Pcs/8h.`,
      riskLevel: packagingUtilization >= 100 ? '🔴 CRITICAL' : packagingUtilization >= 80 ? '🟡 WARNING' : '🟢 HEALTHY',
      recommendedAction: "Gunakan bantuan mesin pengemas otomatis digital AGDN Cikarang."
    }
  ];

  // 6. Calculations: AI PLANNING ENGINE RECOMMENDER
  const [aiRecs, setAiRecs] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    generateAiPlanningRecs();
  }, [plannedVolumeKg, availableFryers, peelingStaff, activeScenario]);

  const generateAiPlanningRecs = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const recs = [
        {
          id: 'AI-REC-01',
          type: 'Production',
          title: "Optimalkan Lini Frying Nanas",
          desc: `Tingkatkan volume produksi Keripik Nanas sebesar 18% di MPD Wonosobo guna menutup lonjakan demand ritel luar provinsi.`
        },
        {
          id: 'AI-REC-02',
          type: 'Procurement',
          title: "Sertifikasi Order Raw Nanas",
          desc: "Beli tambahan 8.2 Ton raw Nanas Madu Subang dalam 7 hari mendatang sebelum harga pasar spot naik musiman."
        },
        {
          id: 'AI-REC-03',
          type: 'Capacity',
          title: "Add Evaporator Fryer",
          desc: "Investasikan satu unit vacuum frying baru di MPD Wonosobo untuk memperlebar ketahanan utilitas harian."
        },
        {
          id: 'AI-REC-04',
          type: 'Inventory',
          title: "Inter-Factory Cold Transfer",
          desc: "Pindahkan 500 Kg Frozen Pineapple dari facility SSP Sipahutar ke MPD Wonosobo guna menyeimbangkan stok."
        }
      ];
      setAiRecs(recs);
      setIsAiLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6" id="capacity-planning-root">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">3. Capacity &amp; Bottleneck Planning</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Menganalisis kapasitas beban kerja pabrik, ketersediaan jam kerja personil kupas, utilitas mesin vacuum fryer Dieng, serta ruang penyimpanan frozen cold warehouse. Terintegrasi What-If simulation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              alert("Menjalankan optimasi alokasi mesin borongan...");
              logActivity('Capacity Optimise', 'Menjalankan auto-balancing alokasi beban rotasi fryer Wonosobo.');
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Optimize Allocations</span>
          </button>
        </div>
      </div>

      {/* THREE PANELS LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: WORKLOAD PARAMETERS & CAPACITY METRIC CARDS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Lini Alokasi Beban &amp; Parameter Simulator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Slider 1: Planned volume */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Beban Produksi Chips (Kg/Hari)</span>
                  <strong className="text-slate-850 font-bold">{plannedVolumeKg} Kg</strong>
                </div>
                <input 
                  type="range"
                  min="200"
                  max="1200"
                  step="50"
                  value={plannedVolumeKg}
                  onChange={(e) => setPlannedVolumeKg(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: 200Kg</span>
                  <span>Max: 1200Kg</span>
                </div>
              </div>

              {/* Slider 2: Available Fryers */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Fryers Beroperasi (MPD Dieng)</span>
                  <strong className="text-slate-850 font-bold">{availableFryers} Unit / Day</strong>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={availableFryers}
                  onChange={(e) => setAvailableFryers(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: 1 Fryer</span>
                  <span>Max: 4 Fryers</span>
                </div>
              </div>

              {/* Slider 3: Peeling Staff */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Daftar Pekerja Peeling Wonosobo</span>
                  <strong className="text-slate-850 font-bold">{peelingStaff} Persons</strong>
                </div>
                <input 
                  type="range"
                  min="4"
                  max="20"
                  step="1"
                  value={peelingStaff}
                  onChange={(e) => setPeelingStaff(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Min: 4 Orang</span>
                  <span>Max: 20 Orang</span>
                </div>
              </div>
            </div>
          </div>

          {/* CAPACITY PLANNING GRAPHICS CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Machine utilize card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <strong className="text-xs">Machine Capacity (Vacuum Frying)</strong>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  machineGap < 0 ? 'bg-rose-500 text-white animate-pulse' :
                  machineUtilization > 85 ? 'bg-amber-400 text-white' :
                  'bg-emerald-50 text-emerald-700'
                }`}>
                  {machineGap < 0 ? 'SHORTAGE' : 'HEALTHY'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Core Frying Utilization Rate:</span>
                  <strong>{machineUtilization}%</strong>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${machineGap < 0 ? 'bg-rose-600' : machineUtilization > 85 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, machineUtilization)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10.5px] text-slate-500 font-mono">
                  <span>Yield Max Max: 500 Kg/F</span>
                  <span>Gap: <strong>{machineGap} Kg</strong></span>
                </div>
              </div>
            </div>

            {/* Labor utilize card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <strong className="text-xs">Labor Capacity (Raw Peeling)</strong>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  laborStatus === 'Shortage' ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {laborStatus}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Peeling Workers Allotment Gap:</span>
                  <strong className={laborGap < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {laborGap < 0 ? `Kurang ${Math.abs(laborGap)} Orang` : `Sisa ${laborGap} Orang`}
                  </strong>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${laborGap < 0 ? 'bg-rose-600' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (peelingStaff / requiredPeelWorkers) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10.5px] text-slate-500 font-mono">
                  <span>Needed: <strong>{requiredPeelWorkers} workers</strong></span>
                  <span>Standard: {peelingProductivityStandard} Kg/shift/worker</span>
                </div>
              </div>
            </div>

            {/* Packaging utilize card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 col-span-1 md:col-span-2">
              <div className="flex justify-between items-center border-b pb-2">
                <strong className="text-xs text-slate-800">Packaging &amp; Cold Storage Warehouse Capacity Rollup</strong>
                <span className="text-[10px] text-slate-400">MPD Facility Node</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
                {/* Pack Output */}
                <div className="space-y-1">
                  <span className="text-slate-450 text-[10px] uppercase block font-semibold text-slate-400">Packaging Output Rate</span>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{requiredPcsToPack.toLocaleString('id-ID')} Pcs</span>
                    <span>Uti: {packagingUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded">
                    <div className="bg-indigo-500 h-1 rounded" style={{ width: `${Math.min(100, packagingUtilization)}%` }}></div>
                  </div>
                </div>

                {/* Cold Storage */}
                <div className="space-y-1">
                  <span className="text-slate-450 text-[10px] uppercase block font-semibold text-slate-400">Cold Frozen Space</span>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{frozenStorageCurrent} Kg</span>
                    <span>Uti: {frozenCapPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded">
                    <div className="bg-cyan-500 h-1 rounded" style={{ width: `${Math.min(100, frozenCapPct)}%` }}></div>
                  </div>
                </div>

                {/* Product storage */}
                <div className="space-y-1">
                  <span className="text-slate-450 text-[10px] uppercase block font-semibold text-slate-400">Finished Goods storage</span>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{productStorageCurrent} Pcs</span>
                    <span>Uti: {productStoragePct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded">
                    <div className="bg-emerald-500 h-1 rounded" style={{ width: `${Math.min(100, productStoragePct)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTLENECK DETECTION GRAPH MATRIX */}
          <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Dynamic Bottleneck Matrix &amp; Real-time Constraint Diagnostic
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b text-[9.5px]">
                    <th className="p-3">Constraint Node</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status Impact Metric</th>
                    <th className="p-3 text-center">Risk Level</th>
                    <th className="p-3">Immediate Mitigation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {bottlenecks.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{b.constraint}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] rounded font-mono uppercase">{b.category}</span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{b.impact}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9.5px] font-bold ${
                          b.riskLevel.includes('CRITICAL') ? 'bg-rose-500 text-white animate-pulse' :
                          b.riskLevel.includes('WARNING') ? 'bg-amber-400 text-slate-900' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {b.riskLevel}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 text-[11px] leading-relaxed italic">{b.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: WHAT-IF SCENARIO SELECTOR, AI ADVISOR RECOMMENDATIONS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Integrated What-If Simulator Panel */}
          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                What-if Plan Simulation Box
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Ganti skenario guna memproyeksikan impact finansial, yield, &amp; cash flow.</p>
            </div>

            <div className="space-y-1.5">
              {[
                'Normal Baseline', 
                'Demand Increase', 
                'Demand Decrease', 
                'Yield Decrease', 
                'Machine Breakdown', 
                'Labor Shortage', 
                'Supplier Delay'
              ].map(scen => (
                <button 
                  key={scen} 
                  onClick={() => {
                    setActiveScenario(scen);
                    logActivity('Simulation Run', `Menjalankan simulasi skenario What-If: ${scen}.`);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-lg text-xs font-bold transition-all border flex items-center justify-between ${
                    activeScenario === scen 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <span>{scen}</span>
                  {activeScenario === scen && <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>}
                </button>
              ))}
            </div>

            {/* Simulated Simulator Outputs */}
            <motion.div 
              key={activeScenario}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-4 rounded-xl border text-[11px] space-y-3 ${scenarioInfo.colorClass}`}
            >
              <strong className="text-xs block font-bold border-b pb-1.5 uppercase font-sans">Projected Outputs:</strong>
              
              <div className="grid grid-cols-2 gap-3 leading-tight font-sans">
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Profitability:</span>
                  <strong className="text-slate-900 text-xs font-bold">{scenarioInfo.profitabilityImpact}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Capacity load:</span>
                  <strong className="text-slate-900 text-xs font-bold">{scenarioInfo.capacityUtilization}%</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9.5px]">Gross margin shift:</span>
                  <strong className="text-slate-900 text-xs font-bold">{scenarioInfo.marginImpact}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9.5px]">Primary logistics constraint:</span>
                  <span className="text-rose-600 block font-bold">{scenarioInfo.bottleneck}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[9.5px]">Procurement adjustment:</span>
                  <span className="text-slate-800 block text-[10px] font-sans italic">{scenarioInfo.procurementImpact}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Planning Recommendations from Engine */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-indigo-950 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-slate-100 text-[10px] uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                AI Planning Advisor
              </h4>
              <span className="bg-indigo-900/40 text-indigo-400 text-[8px] font-mono px-2 py-0.5 rounded border border-indigo-500/10">Active</span>
            </div>

            {isAiLoading ? (
              <div className="py-12 flex justify-center items-center text-slate-400 text-xs">
                <span>Calculating recommendation metrics...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {aiRecs.map((rec, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block font-mono">
                      ⭐ {rec.type} Recommendation
                    </span>
                    <strong className="text-xs text-white block font-semibold leading-snug">{rec.title}</strong>
                    <p className="text-slate-350 text-[11px] leading-relaxed font-sans">{rec.desc}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-2">
              <button 
                onClick={() => {
                  alert("Rencana optimasi alokasi inventaris gudang dan supply berhasil dilepas.");
                  logActivity('Planning Allocation', 'Melepas empat keputusan model mitigasi AI advisor ke unit penolong.');
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Release AI Recommendations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
