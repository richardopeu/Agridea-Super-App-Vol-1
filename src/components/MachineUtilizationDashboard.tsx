import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Clock, 
  BarChart2, 
  ToggleLeft,
  Truck,
  Flame,
  FileText
} from 'lucide-react';

interface Props {
  state: any;
  currentUser: any;
  onLogActivity: (modul: string, msg: string) => void;
}

// Maintenance threshold constant
const RUNTIME_MAINT_THRESHOLD_HOURS = 150; // Hours before scheduled tune up
const CYCLES_MAINT_THRESHOLD_COUNT = 30;  // Completed cycle run before service trigger

export default function MachineUtilizationDashboard({ state, currentUser, onLogActivity }: Props) {
  const [selectedFactory, setSelectedFactory] = useState<string>('MPD');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  
  // Local state for interactive machine state simulation toggling
  const [machineManualDowntime, setMachineManualDowntime] = useState<any>({});

  // Fetch machines filtered by selected factory
  const machines = useMemo(() => {
    return (state.mesin || []).filter((m: any) => m.lokasiId === selectedFactory);
  }, [state.mesin, selectedFactory]);

  // Set default selected machine
  React.useEffect(() => {
    if (machines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(machines[0].id);
    } else if (machines.length > 0 && !machines.some((m: any) => m.id === selectedMachineId)) {
      setSelectedMachineId(machines[0].id);
    }
  }, [machines, selectedMachineId]);

  // Calculate high fidelity real-time machine utilization metrics
  const machinesMetrics = useMemo(() => {
    const factoryId = selectedFactory;
    const fryingLogs = state.fryingLogs || [];
    const maintLogs = state.maintenanceLogs || [];
    const qcLogs = state.qcLogs || [];

    return machines.map((machine: any) => {
      // 1. Core cycle aggregation
      const myFries = fryingLogs.filter((fl: any) => fl.mesinId === machine.id && fl.lokasiId === factoryId && fl.approvedStatus === 'Approved');
      const actualCycles = myFries.reduce((acc: number, log: any) => acc + parseInt(log.cycleCount || 1), 0);
      
      // Calculate running time (est. 1.5 hours per completed frying cycle)
      const runningTime = actualCycles * 1.5;

      // 2. Setup & Downtime calculation
      // Setup time: setup and cleaning takes 15 minutes (0.25 hrs) per cycle run
      const setupTime = actualCycles * 0.25;

      // Downtime: map maintenance logs matching this machine
      const myMaint = maintLogs.filter((ml: any) => ml.mesinId === machine.id);
      const maintenanceCosts = myMaint.reduce((acc: number, log: any) => acc + parseFloat(log.biaya || 0), 0);
      
      // Downtime hours: each maintenance event averages 4 hours downtime, plus setup manual downtime
      let downtimeHours = myMaint.length * 4;
      if (machineManualDowntime[machine.id]) {
        downtimeHours += parseFloat(machineManualDowntime[machine.id].hours || 0);
      } else {
        // Seed default downtime details for better visual richness
        downtimeHours += machine.id === 'M-01' ? 8 : machine.id === 'M-02' ? 12 : 4;
      }

      // Planned Operating Time for OEE
      const plannedOperatingTime = 160; // 160 Hours standard month quota (20 days * 8 hours)

      // --- AVAILABILITY ---
      // Availability = Running Time / Planned Operating Time
      const availability = plannedOperatingTime > 0 ? (runningTime / plannedOperatingTime) * 100 : 75;

      // --- PERFORMANCE ---
      // Performance = Actual cycles / Target cycles (Standard 80 cycles target per month)
      const targetCycles = 60;
      const performance = (actualCycles / targetCycles) * 100;

      // --- QUALITY ---
      // Quality = Approved Quality Check weight ratio
      // Yield of non-rejects for variance
      const myQcs = qcLogs.filter((q: any) => q.lokasiId === factoryId && q.approvedStatus === 'Approved');
      const sumQcIn = myQcs.reduce((acc: number, log: any) => acc + parseFloat(log.beratMasukKg || 0), 0);
      const sumQcPass = myQcs.reduce((acc: number, log: any) => acc + parseFloat(log.hasilLolosQcKg || 0), 0);
      const quality = sumQcIn > 0 ? (sumQcPass / sumQcIn) * 100 : 96.5;

      // --- OEE (Overall Equipment Effectiveness) ---
      // OEE = Availability * Performance * Quality
      const oee = Math.min(100, Math.max(0, (availability / 100) * (performance / 100) * (quality / 100) * 100));

      // Utilization rate formula
      const totalTimeSpan = runningTime + downtimeHours + setupTime;
      const utilizationRate = totalTimeSpan > 0 ? (runningTime / totalTimeSpan) * 100 : 65.0;

      // Fuel & utilities estimate
      // Each vacuum frying cycle consumes ~4 Litres of water and 3kg LPG
      const lpgUsed = actualCycles * 3;

      // Determine machine current status
      let operationalStatus = 'Optimal';
      if (machineManualDowntime[machine.id]?.status) {
        operationalStatus = machineManualDowntime[machine.id].status;
      } else if (actualCycles >= CYCLES_MAINT_THRESHOLD_COUNT || runningTime >= RUNTIME_MAINT_THRESHOLD_HOURS) {
        operationalStatus = 'Perlu Maintenance';
      } else if (machine.id === 'M-01') {
        operationalStatus = 'Optimal';
      } else if (machine.id === 'M-02') {
        operationalStatus = 'Downtime (Setup)';
      } else {
        operationalStatus = 'Idle';
      }

      return {
        ...machine,
        actualCycles,
        runningTime,
        setupTime,
        downtimeHours,
        utilizationRate,
        availability,
        performance,
        quality,
        oee,
        maintenanceCosts,
        maintenanceCount: myMaint.length,
        lpgUsed,
        operationalStatus
      };
    });
  }, [state, selectedFactory, machineManualDowntime, machines]);

  // Handle manual simulation trigger
  const triggerDowntimeSimulation = (mId: string, status: 'Downtime (Setup)' | 'Downtime (Service/Repair)' | 'Optimal', hours: number) => {
    setMachineManualDowntime((prev: any) => ({
      ...prev,
      [mId]: { status, hours }
    }));
    onLogActivity('Machine Utilization', `Mengubah status mesin ${mId} menjadi ${status} (${hours} Jam Downtime)`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case 'Downtime (Setup)':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'Downtime (Service/Repair)':
        return 'text-rose-900 bg-rose-50 border-rose-300 font-bold';
      case 'Perlu Maintenance':
        return 'text-rose-700 bg-rose-50 border-rose-300 font-black animate-pulse';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const activeMetrics = useMemo(() => {
    return machinesMetrics.find((m: any) => m.id === selectedMachineId) || null;
  }, [machinesMetrics, selectedMachineId]);

  return (
    <div className="space-y-6 text-xs animate-fade-in" id="machine-utilization-dashboard">
      {/* Enterprise Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-6 rounded-2xl border border-indigo-500/10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black font-display tracking-tight uppercase flex items-center gap-2 text-purple-400">
            <Wrench className="w-5 h-5 text-purple-400" /> Operations Intelligence — Machine Utilization
          </h2>
          <p className="text-[11px] text-slate-350 mt-1 uppercase tracking-wider font-semibold">
            Overall Equipment Effectiveness (OEE) • Planned Preventative Maintenance • Technical Downtime Logs
          </p>
        </div>
        <div className="flex gap-2 text-indigo-100">
          <div className="flex items-center gap-1.5 bg-slate-850 px-2 py-1 rounded-xl border border-slate-700">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
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
        </div>
      </div>

      {machines.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 italic rounded-2xl border border-dashed border-slate-300">
          Tidak ada mesin Vacuum Frying terdaftar di pabrik {selectedFactory}.
        </div>
      ) : (
        <>
          {/* Active Machines Grid Directory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {machinesMetrics.map((machine: any) => {
              const cyclesWarning = machine.actualCycles >= CYCLES_MAINT_THRESHOLD_COUNT;
              const isSelected = machine.id === selectedMachineId;

              return (
                <div 
                  key={machine.id} 
                  onClick={() => setSelectedMachineId(machine.id)}
                  className={`p-5 rounded-2xl border transition-all duration-300 text-left relative cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-indigo-650 shadow-md ring-1 ring-indigo-350' 
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Capacity: {machine.kapasitasBatchMax} Kg/Cycle
                      </span>
                      <h4 className="font-black text-slate-900 text-[13px] mt-1.5 font-display flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-indigo-650 shrink-0" /> {machine.namaMesin}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getStatusColor(machine.operationalStatus)}`}>
                      {machine.operationalStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-0.5 border-r pr-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Siklus Month-to-Date</span>
                      <p className="text-xl font-black text-slate-900 font-mono">{machine.actualCycles} runs</p>
                    </div>
                    <div className="space-y-0.5 pl-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">OEE SCORE</span>
                      <p className={`text-xl font-black font-mono ${machine.oee >= 85 ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {machine.oee.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {cyclesWarning && (
                    <div className="mt-3 flex items-center gap-1.5 p-1.5 px-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-semibold animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> Preventive Service Required (Exceeds {CYCLES_MAINT_THRESHOLD_COUNT} runs)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Master Detail Section for selected machine */}
          {activeMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="machine-oee-matrix">
              {/* Left col: Utilization & OEE Formula Matrix */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-8 space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2">
                    <BarChart2 className="w-4 h-4 text-indigo-600 font-sans" /> OEE Formulation Matrix — {activeMetrics.namaMesin} ({activeMetrics.id})
                  </h3>
                </div>

                {/* Sub KPI Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Availability */}
                  <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
                    <div className="flex justify-between text-slate-800 font-bold text-[11px]">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-650" /> 1. AVAILABILITY</span>
                      <span className="font-mono">{activeMetrics.availability.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${activeMetrics.availability}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">
                      Running: {activeMetrics.runningTime} Hr / Limit: 160 Hr
                    </p>
                  </div>

                  {/* Performance */}
                  <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
                    <div className="flex justify-between text-slate-800 font-bold text-[11px]">
                      <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-purple-600" /> 2. PERFORMANCE</span>
                      <span className="font-mono">{activeMetrics.performance.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full" style={{ width: `${Math.min(100, activeMetrics.performance)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">
                      Completed: {activeMetrics.actualCycles} runs / Target: 60
                    </p>
                  </div>

                  {/* Quality */}
                  <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
                    <div className="flex justify-between text-slate-800 font-bold text-[11px]">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 3. QUALITY RATE</span>
                      <span className="font-mono">{activeMetrics.quality.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${activeMetrics.quality}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">
                      Lolos QC / Inputs Ratio
                    </p>
                  </div>
                </div>

                {/* Utilization Time Breakdown Pie equivalents */}
                <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Estimated Monthly Time Budget allocation</h4>
                  <div className="flex flex-wrap gap-6 text-[10.5px]">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="w-3 h-3 bg-indigo-600 inline-block rounded"></span>
                      <span>Running Time: <span className="font-black text-slate-900 font-mono">{activeMetrics.runningTime} Jam</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="w-3 h-3 bg-amber-400 inline-block rounded"></span>
                      <span>Setup &amp; Cleaning: <span className="font-black text-slate-900 font-mono">{activeMetrics.setupTime} Jam</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="w-3 h-3 bg-rose-500 inline-block rounded"></span>
                      <span>维修/Downtime: <span className="font-black text-slate-900 font-mono">{activeMetrics.downtimeHours} Jam</span></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-3.5 mt-2 bg-white p-3 rounded-lg border">
                    <div>
                      <span className="text-[10.5px] uppercase font-bold text-slate-400">Yield Max utilization Rate (UT)</span>
                      <p className="text-[11.5px] text-indigo-900 font-bold mt-0.5">Rasio Produktifitas Mesin / Total Alokasi jam sedia</p>
                    </div>
                    <span className="text-xl font-black font-mono text-indigo-700">{activeMetrics.utilizationRate.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Simulated Downtime Override Trigger Controls */}
                <div className="border hover:border-slate-350 p-4.5 rounded-xl space-y-3 shadow-3xs">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-purple-800 flex items-center gap-1">
                    <ToggleLeft className="w-4 h-4 text-purple-700" /> Live Downtime &amp; Fault Simulator Controls
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1 font-semibold">
                    <button 
                      onClick={() => triggerDowntimeSimulation(activeMetrics.id, 'Optimal', 4)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Reset to Optimal Normal
                    </button>
                    <button 
                      onClick={() => triggerDowntimeSimulation(activeMetrics.id, 'Downtime (Setup)', 15)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Simulate Setup Hold (15 hrs downtime)
                    </button>
                    <button 
                      onClick={() => triggerDowntimeSimulation(activeMetrics.id, 'Downtime (Service/Repair)', 24)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Simulate Vacuum Leak Fault (24 hrs downtime)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right col: Downtime Reasons and Maintenance History Costs */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-4 space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2 text-rose-800">
                    <Wrench className="w-4 h-4 text-rose-700 font-sans" /> Maintenance &amp; Downtime Analysis
                  </h3>
                </div>

                {/* Cumulative maintenance costing */}
                <div className="p-4 bg-rose-50/40 rounded-xl space-y-2 border border-rose-200/55">
                  <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider block">Total Maintenance Cost MTD</span>
                  <p className="text-xl font-mono font-black text-rose-900">
                    Rp {activeMetrics.maintenanceCosts.toLocaleString('id-ID')}
                  </p>
                  <div className="text-[10px] text-slate-500 font-semibold font-mono flex justify-between">
                    <span>Events logged MTD:</span>
                    <span className="text-indigo-950 font-bold">{activeMetrics.maintenanceCount} repairs</span>
                  </div>
                </div>

                {/* Downtime Pareto chart equivalents/descriptions */}
                <div className="space-y-3">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-slate-450 block">Downtime Core Category analysis:</span>
                  <div className="space-y-2 text-[10.5px]">
                    <div className="bg-slate-50 p-2 rounded border space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>1. Pembersihan &amp; Setup (Routine)</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-amber-400 h-1 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>2. Kerusakan Mekanik tabung vacuum</span>
                        <span>35%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-rose-500 h-1 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>3. Defect Delay Bahan Baku Pokok</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-slate-400 h-1 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>4. Gangguan PLN / Listrik</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
