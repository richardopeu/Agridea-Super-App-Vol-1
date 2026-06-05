/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  UserCheck,
  DollarSign,
  Briefcase,
  AlertOctagon,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Percent
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AttendanceManagementProps {
  state: any;
  currentUser: any;
  selectedLokasi: string;
}

// HQ Configured Geofencing Master Coordinates
const GEOFENCE_CONFIG: { [factoryKey: string]: { lat: number; lng: number; radiusMeters: number; namaCabang: string } } = {
  JKT: { lat: -6.2088, lng: 106.8456, radiusMeters: 150, namaCabang: 'HQ Jakarta Office' },
  MPD: { lat: -7.3601, lng: 109.9022, radiusMeters: 100, namaCabang: 'MPD Wonosobo' },
  SSP: { lat: 2.0524, lng: 99.0143, radiusMeters: 100, namaCabang: 'SSP Sipahutar' },
  KKI: { lat: -6.1834, lng: 106.8302, radiusMeters: 120, namaCabang: 'KKI Jakarta Barat' },
  AGDN: { lat: -6.2301, lng: 106.9011, radiusMeters: 100, namaCabang: 'AGDN Jakarta Kemas' }
};

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  factoryId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave';
  isOvertime: boolean;
  overtimeHours: number;
}

export default function AttendanceManagement({ state, currentUser, selectedLokasi }: AttendanceManagementProps) {
  // Sync core attendance database using localStorage
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('agridea_attendance_records');
    if (saved) return JSON.parse(saved);

    // Seed comprehensive logs for June 2026 to showcase robust payroll & attendance statistics
    const seedRecords: AttendanceRecord[] = [];
    const employees = state.karyawan || [];

    // Let's seed present logs for all employees for past few days of June 2026 (June 1st, 2nd, 3rd)
    const dates = ['2026-06-01', '2026-06-02', '2026-06-03'];

    dates.forEach(dt => {
      employees.forEach((emp: any) => {
        // Skip random/all for realistic leave/absent counts
        const hash = (emp.id.charCodeAt(emp.id.length - 1) + dt.charCodeAt(dt.length - 1)) % 15;
        let empStatus: 'Present' | 'Late' | 'Absent' | 'Leave' = 'Present';
        if (hash === 2) empStatus = 'Late';
        else if (hash === 5) empStatus = 'Leave';
        else if (hash === 11) empStatus = 'Absent';

        if (empStatus === 'Absent' || empStatus === 'Leave') {
          seedRecords.push({
            id: `ATT-${emp.id}-${dt}`,
            employeeId: emp.id,
            employeeName: emp.nama,
            role: emp.role,
            factoryId: emp.lokasiId,
            date: dt,
            timeIn: '',
            timeOut: '',
            status: empStatus,
            isOvertime: false,
            overtimeHours: 0
          });
        } else {
          // Present or Late
          const timeInStr = empStatus === 'Late' ? '08:45:12' : '07:54:10';
          seedRecords.push({
            id: `ATT-${emp.id}-${dt}`,
            employeeId: emp.id,
            employeeName: emp.nama,
            role: emp.role,
            factoryId: emp.lokasiId,
            date: dt,
            timeIn: timeInStr,
            timeOut: '17:05:00',
            status: empStatus,
            isOvertime: hash === 3 || hash === 7,
            overtimeHours: hash === 3 ? 2 : (hash === 7 ? 1.5 : 0)
          });
        }
      });
    });

    return seedRecords;
  });

  // Persist logs
  useEffect(() => {
    localStorage.setItem('agridea_attendance_records', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  // View States
  const [activeTab, setActiveTab] = useState<'clock' | 'dashboard' | 'payroll'>('clock');
  const [selectedRegLokasi, setSelectedRegLokasi] = useState<string>(selectedLokasi === 'JKT' ? 'MPD' : selectedLokasi);
  
  // Selection filter search
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedEmployeeClock, setSelectedEmployeeClock] = useState<string>('');
  
  // Mobile / Tablet simulation mode selector
  const [deviceSimulationType, setDeviceSimulationType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // Simulated GPS details
  const [simulatedLat, setSimulatedLat] = useState<number>(-7.3602); // Defaults to MPD Wonosobo
  const [simulatedLng, setSimulatedLng] = useState<number>(109.9023);

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState<{ status: 'success' | 'danger' | null; text: string }>({ status: null, text: '' });

  // Filter master list of karyawan based on factory location
  const currentFactoryEmployees = useMemo(() => {
    const list = state.karyawan || [];
    return list.filter((emp: any) => emp.lokasiId === selectedRegLokasi);
  }, [state.karyawan, selectedRegLokasi]);

  // Map employee list to check clock-in status for today
  const todayString = '2026-06-03'; // Fixed June 3rd, 2026 as per local time context

  const employeeClockStatus = useMemo(() => {
    const statusMap: { [empId: string]: AttendanceRecord | undefined } = {};
    attendanceLogs.forEach(rec => {
      if (rec.date === todayString) {
        statusMap[rec.employeeId] = rec;
      }
    });
    return statusMap;
  }, [attendanceLogs, todayString]);

  // Helper: Haversine formula to compute distance in meters between two geolocations
  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // Determine current GPS distance from targeted Factory
  const distanceStats = useMemo(() => {
    const fence = GEOFENCE_CONFIG[selectedRegLokasi];
    if (!fence) return { distance: 0, isAllowed: false };
    const distanceMeter = getDistanceInMeters(simulatedLat, simulatedLng, fence.lat, fence.lng);
    const isAllowed = distanceMeter <= fence.radiusMeters;
    return {
      distance: Math.round(distanceMeter),
      isAllowed,
      radius: fence.radiusMeters,
      fenceLat: fence.lat,
      fenceLng: fence.lng,
      cabang: fence.namaCabang
    };
  }, [selectedRegLokasi, simulatedLat, simulatedLng]);

  // Set simulation location slider helper parameters
  const applyPresetCoordinate = (presetKey: string, offset: 'inside' | 'outside' = 'inside') => {
    const f = GEOFENCE_CONFIG[presetKey];
    if (f) {
      if (offset === 'inside') {
        // Exactly on spot
        setSimulatedLat(f.lat + 0.0001);
        setSimulatedLng(f.lng + 0.0001);
      } else {
        // Way outside
        setSimulatedLat(f.lat + 0.015);
        setSimulatedLng(f.lng + 0.015);
      }
    }
  };

  // Run initial alignment of Presets
  useEffect(() => {
    applyPresetCoordinate(selectedRegLokasi, 'inside');
  }, [selectedRegLokasi]);

  // Clock In trigger
  const handleCheckIn = () => {
    const emp = (state.karyawan || []).find((e: any) => e.id === selectedEmployeeClock);
    if (!emp) {
      setAlertMsg({ status: 'danger', text: 'Please select an employee first.' });
      return;
    }

    // Geofencing verification
    if (!distanceStats.isAllowed) {
      setAlertMsg({
        status: 'danger',
        text: `You are outside authorized factory location. GPS registers ${distanceStats.distance}M from fence center, maximum allowed is ${distanceStats.radius}M.`
      });
      return;
    }

    // Build clock-in log
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const cutoffTime = '08:00:00';
    
    // Evaluate if late
    const isLate = timeStr > cutoffTime;

    const newRecord: AttendanceRecord = {
      id: `ATT-${emp.id}-${todayString}`,
      employeeId: emp.id,
      employeeName: emp.nama,
      role: emp.role,
      factoryId: selectedRegLokasi,
      date: todayString,
      timeIn: timeStr,
      timeOut: '',
      status: isLate ? 'Late' : 'Present',
      isOvertime: false,
      overtimeHours: 0
    };

    setAttendanceLogs(prev => {
      const filtered = prev.filter(r => !(r.employeeId === emp.id && r.date === todayString));
      return [newRecord, ...filtered];
    });

    setAlertMsg({
      status: 'success',
      text: `Absen Masuk Berhasil! ${emp.nama} clocked in representing ${selectedRegLokasi} at ${timeStr} (${isLate ? 'TERLAMBAT' : 'TEPAT WAKTU'})`
    });
  };

  // Clock Out trigger
  const handleCheckOut = () => {
    const emp = (state.karyawan || []).find((e: any) => e.id === selectedEmployeeClock);
    if (!emp) {
      setAlertMsg({ status: 'danger', text: 'Please select an employee first.' });
      return;
    }

    // Find current checkIn record
    const todayRecord = attendanceLogs.find(r => r.employeeId === emp.id && r.date === todayString);
    if (!todayRecord || !todayRecord.timeIn) {
      setAlertMsg({ status: 'danger', text: `${emp.nama} has not clocked in yet today.` });
      return;
    }

    // Geofencing verification
    if (!distanceStats.isAllowed) {
      setAlertMsg({
        status: 'danger',
        text: `You are outside authorized factory location. GPS registers ${distanceStats.distance}M from fence center.`
      });
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    // Evaluate dynamic overtime (shift ends at 17:00:00)
    const standardShiftEnd = '17:00:00';
    let ovHours = 0;
    let isOv = false;
    
    if (timeStr > standardShiftEnd) {
      // Calculate delta
      isOv = true;
      ovHours = 2.0; // Simulated flat premium overtime hours or can be computed
    }

    setAttendanceLogs(prev => prev.map(rec => {
      if (rec.employeeId === emp.id && rec.date === todayString) {
        return {
          ...rec,
          timeOut: timeStr,
          isOvertime: isOv,
          overtimeHours: ovHours
        };
      }
      return rec;
    }));

    setAlertMsg({
      status: 'success',
      text: `Absen Pulang Berhasil! ${emp.nama} clock out completed at ${timeStr}. Overtime duration registered: ${ovHours} hour(s)`
    });
  };

  // Attendance statistics compilation
  const stats = useMemo(() => {
    const presentData = attendanceLogs.filter(a => a.date === todayString && (a.status === 'Present' || a.status === 'Late'));
    const totalPresent = presentData.length;
    const totalLate = presentData.filter(a => a.status === 'Late').length;
    
    // Group attendance counts by departments
    const deptTotals: { [dept: string]: { present: number; total: number } } = {};
    const factoryTotals: { [fact: string]: { present: number; late: number; absent: number; leave: number } } = {};

    factoriesList().forEach(f => {
      factoryTotals[f] = { present: 0, late: 0, absent: 0, leave: 0 };
    });

    attendanceLogs.forEach(rec => {
      // Categorize only for current selected month data
      if (rec.date.startsWith('2026-06')) {
        const fact = rec.factoryId;
        if (factoryTotals[fact]) {
          if (rec.status === 'Present') factoryTotals[fact].present++;
          else if (rec.status === 'Late') {
            factoryTotals[fact].present++;
            factoryTotals[fact].late++;
          }
          else if (rec.status === 'Absent') factoryTotals[fact].absent++;
          else if (rec.status === 'Leave') factoryTotals[fact].leave++;
        }
      }
    });

    return {
      totalPresent,
      totalLate,
      factoryTotals
    };
  }, [attendanceLogs]);

  // Attendance Table listings
  const attendanceTableData = useMemo(() => {
    return attendanceLogs.map(r => {
      const emp = (state.karyawan || []).find((e: any) => e.id === r.employeeId);
      return {
        ...r,
        department: emp?.department || 'Production',
        position: emp?.position || 'Operator'
      };
    });
  }, [attendanceLogs, state.karyawan]);

  // Filtered employees clock matching search query
  const filteredClockEmployees = currentFactoryEmployees.filter((e: any) => 
    e.nama.toLowerCase().includes(employeeSearch.toLowerCase()) || 
    e.nik.includes(employeeSearch)
  );

  function factoriesList() {
    return ['MPD', 'SSP', 'KKI', 'AGDN', 'JKT'];
  }

  // --- PAYROLL COMPLEX ENGINE ---
  // Connects directly to logs and attendance to compute wages
  const computedPayrollList = useMemo(() => {
    const employees = state.karyawan || [];
    return employees.map((emp: any) => {
      // Filter month-specific attendance records
      const empRecords = attendanceLogs.filter(r => r.employeeId === emp.id && r.date.startsWith('2026-06'));
      const daysPresent = empRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const daysLeave = empRecords.filter(r => r.status === 'Leave').length;
      const daysAbsent = empRecords.filter(r => r.status === 'Absent').length;
      const sumOvertimeHours = empRecords.reduce((sum, r) => sum + parseFloat(r.overtimeHours || 0), 0);

      let formulaExplanation = '';
      let wageCalculationDetail = 0;
      let overtimeCompensation = sumOvertimeHours * 25000; // Overtime rate flat IDR 25,000 / hour
      let deductions = daysAbsent * 50000; // Deduction penalty IDR 50,000 per absent day

      // 1. Daily Wage Employees
      if (emp.tarifDasar > 0 && emp.role === 'Production Operator' && emp.department !== 'Vacuum Frying') {
        wageCalculationDetail = daysPresent * emp.tarifDasar; 
        formulaExplanation = `Hari Hadir (${daysPresent}) × Tarif Harian (Rp ${emp.tarifDasar.toLocaleString()})`;
      } 
      // 2. Peeling Wage Employees - Calculate based on matching Peeling Logs yields
      else if (emp.role === 'Peeling Operator') {
        // Aggregate peeled weight from state logs
        const myPeels = (state.peelingLogs || []).filter((pl: any) => pl.karyawanId === emp.id);
        const totalKgPeeled = myPeels.reduce((sum: number, pl: any) => sum + parseFloat(pl.hasilKupasKg || 0), 0);
        
        wageCalculationDetail = totalKgPeeled * emp.tarifDasar;
        formulaExplanation = `Total Kupas (${totalKgPeeled} Kg) × Tarif per Kg (Rp ${emp.tarifDasar.toLocaleString()})`;
      } 
      // 3. Vacuum Frying Operator - Calculate based on Frying Logs shift completed cycles
      else if (emp.role === 'Production Operator' && emp.department === 'Vacuum Frying') {
        // Aggregate completed cycles from state logs
        const myFries = (state.fryingLogs || []).filter((fl: any) => fl.operatorId === emp.id);
        const totalCycles = myFries.reduce((sum: number, fl: any) => sum + parseInt(fl.cycleCount || 1), 0);
        
        wageCalculationDetail = totalCycles * emp.tarifDasar; // default Rp 25,000 / cycle
        formulaExplanation = `Cycles Frying (${totalCycles} run) × Tarif per Siklus (Rp ${emp.tarifDasar.toLocaleString()})`;
      } 
      // 4. Monthly Contract Employees (HR, branch managers, Admins, supervisors)
      else {
        wageCalculationDetail = emp.gajiBulanan || 4500000;
        formulaExplanation = `Gaji Pokok Bulanan (Contracted)`;
      }

      const totalTakeHome = wageCalculationDetail + overtimeCompensation - deductions;

      return {
        id: emp.id,
        nama: emp.nama,
        role: emp.role,
        lokasiId: emp.lokasiId,
        department: emp.department || 'Production',
        type: emp.gajiBulanan > 0 ? 'Bulanan' : 'Borongan / Harian',
        daysPresent,
        daysAbsent,
        sumOvertimeHours,
        baseWage: wageCalculationDetail,
        overtime: overtimeCompensation,
        deductions,
        netPay: totalTakeHome,
        formula: formulaExplanation
      };
    });
  }, [state.karyawan, attendanceLogs, state.peelingLogs, state.fryingLogs]);

  // Aggregate stats payload for recharts
  const barChartData = useMemo(() => {
    return computedPayrollList.slice(0, 8).map(p => ({
      name: p.nama,
      base: p.baseWage,
      overtime: p.overtime,
       deductions: -p.deductions,
      net: p.netPay
    }));
  }, [computedPayrollList]);

  return (
    <div className="space-y-6" id="attendance-payroll-hub">
      {/* Visual Launcher Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-lg font-black font-display tracking-tight text-white flex items-center gap-2">
                Employee Attendance &amp; Integrated Payroll Engine
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Sistem Pengecekan Kehadiran Geo-Fencing GPS ditiap Pabrik disandingkan dengan Borongan Kontrak Gaji Karyawan
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('clock')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'clock' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Check-In / Out Terminal
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'dashboard' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Attendance Logs &amp; Stats
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'payroll' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Connected Payroll Report
          </button>
        </div>
      </div>

      {/* CLOCK-IN TERMINAL WITH GEOFENCE SIMULATION */}
      {activeTab === 'clock' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="attendance-clockin-terminal">
          {/* Geofence GPS Simulator Controller Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 mb-3">
              <MapPin className="text-red-500 w-4 h-4" /> 1. HQ GEOFENCE GPS SIMULATOR
            </h3>
            
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              Karyawan diwajibkan melakukan absensi didalam radius pabrik yang disetujui. Atur preset slider GPS dibawah ini untuk mensimulasikan lokasi perangkat anda:
            </p>

            <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Target Factory Geofence Area</label>
                <div className="text-slate-800 font-extrabold text-xs flex items-center gap-1">
                  <span>Pin: {selectedRegLokasi}</span>
                  <span className="text-indigo-600">({distanceStats.cabang})</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] font-bold text-slate-500">
                <div>Lat: {distanceStats.fenceLat}</div>
                <div>Lng: {distanceStats.fenceLng}</div>
              </div>
            </div>

            {/* Simulated GPS Settings Slider */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 leading-none">Simulate Coordinates</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => applyPresetCoordinate(selectedRegLokasi, 'inside')}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-2 rounded-lg border border-emerald-200"
                >
                  📍 Preset Inside Radius
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetCoordinate(selectedRegLokasi, 'outside')}
                  className="bg-red-50 text-red-650 hover:bg-red-100 p-2 rounded-lg border border-red-200"
                >
                  🚨 Preset Outside Radius
                </button>
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Lat Coordinate</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={simulatedLat}
                    onChange={(e) => setSimulatedLat(parseFloat(e.target.value) || 0)}
                    className="p-1.5 border rounded bg-slate-50 font-mono w-full text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Lng Coordinate</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={simulatedLng}
                    onChange={(e) => setSimulatedLng(parseFloat(e.target.value) || 0)}
                    className="p-1.5 border rounded bg-slate-50 font-mono w-full text-center"
                  />
                </div>
              </div>
              
              <div className="border-t pt-3 flex flex-col items-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Fence Verification Status</p>
                <span className={`mt-1.5 py-1 px-3 rounded-full text-[10px] font-black tracking-wide uppercase flex items-center gap-1 border ${distanceStats.isAllowed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-650 animate-pulse'}`}>
                  {distanceStats.isAllowed ? (
                    <>✔ WITHIN AUTHORIZED FACTORY AREA ({distanceStats.distance}M)</>
                  ) : (
                    <>✖ OUTSIDE RADIUS: LIMIT EXCEEDED ({distanceStats.distance}M / MAX {distanceStats.radius}M)</>
                  )}
                </span>
                {!distanceStats.isAllowed && (
                  <p className="text-red-600 font-extrabold text-[10px] text-center mt-1.5 animate-bounce">
                    "You are outside authorized factory location."
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Clock Terminal Controls */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs md:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 mb-3">
              <UserCheck className="text-indigo-650 w-4 h-4" /> 2. CLOCK-IN / OUT ABSENSI TERMINAL
            </h3>

            {/* Display message logs */}
            {alertMsg.status && (
              <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed flex items-start gap-1.5 ${alertMsg.status === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-650 border border-red-200'}`}>
                <span>{alertMsg.status === 'success' ? '✔' : '⚠'}</span>
                <span>{alertMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Branch/Factory */}
              <div>
                <label className="text-slate-500 font-semibold block mb-1 text-xs">Acknowledge Factory Branch</label>
                <select
                  value={selectedRegLokasi}
                  onChange={(e) => setSelectedRegLokasi(e.target.value)}
                  className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white text-xs"
                >
                  {factoriesList().map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Select Employee */}
              <div>
                <label className="text-slate-500 font-semibold block mb-1 text-xs">Search &amp; Select employee ID name</label>
                <div className="relative">
                  <select
                    value={selectedEmployeeClock}
                    onChange={(e) => {
                      setSelectedEmployeeClock(e.target.value);
                      setAlertMsg({ status: null, text: '' });
                    }}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white text-xs"
                  >
                    <option value="">-- Choose Employee --</option>
                    {filteredClockEmployees.map((e: any) => {
                      const todayAtt = employeeClockStatus[e.id];
                      const statusMark = todayAtt ? ` [${todayAtt.status}: ${todayAtt.timeIn || '??'}-${todayAtt.timeOut || ''}]` : '';
                      return (
                        <option key={e.id} value={e.id}>
                          {e.nama} - {e.role} ({e.id}){statusMark}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Search filter helper */}
            <div className="relative pt-1">
              <Search className="absolute left-2.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter employee list by name..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full bg-slate-50 border rounded-lg text-xs leading-none"
              />
            </div>

            {/* Large Interactive Buttons for CheckIn & CheckOut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={!selectedEmployeeClock}
                className={`py-4 rounded-xl font-black text-xs text-white uppercase shadow-sm select-none transition flex flex-col items-center gap-1.5 border ${!selectedEmployeeClock ? 'bg-slate-300 border-slate-200 cursor-not-allowed' : 'bg-emerald-600 border-emerald-500 hover:bg-emerald-700'}`}
              >
                <span className="text-lg">👇 CLOCK-IN MASUK</span>
                <span className="text-[9px] font-normal tracking-wide lowercase">Registers timestamp &amp; checks geo-fence</span>
              </button>

              <button
                type="button"
                onClick={handleCheckOut}
                disabled={!selectedEmployeeClock}
                className={`py-4 rounded-xl font-black text-xs text-white uppercase shadow-sm select-none transition flex flex-col items-center gap-1.5 border ${!selectedEmployeeClock ? 'bg-slate-300 border-slate-200 cursor-not-allowed' : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-700'}`}
              >
                <span className="text-lg">👆 CLOCK-OUT PULANG</span>
                <span className="text-[9px] font-normal tracking-wide lowercase">Computes final shift hours &amp; overtime</span>
              </button>
            </div>

            {/* Fast display of selected employee parameters */}
            {selectedEmployeeClock && (() => {
              const emp = (state.karyawan || []).find((e: any) => e.id === selectedEmployeeClock);
              const todayAtt = employeeClockStatus[selectedEmployeeClock];
              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">NIK / Role Category</span>
                    <span className="font-extrabold text-slate-800">{emp?.nik} / {emp?.role}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">Daily Base / Monthly Contract</span>
                    <span className="font-extrabold text-slate-800">
                      {emp?.gajiBulanan > 0 ? `Rp ${emp.gajiBulanan.toLocaleString()}/blnd` : `Rp ${emp?.tarifDasar?.toLocaleString()}/unit`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">Today Clock-In</span>
                    <span className="font-extrabold text-emerald-600">{todayAtt?.timeIn || 'Not Clocked In'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block">Today Clock-Out</span>
                    <span className="font-extrabold text-indigo-600">{todayAtt?.timeOut || 'Pending Pulang'}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ATTENDANCE REPORTS TAB & HISTORIES */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in" id="attendance-dashboard">
          {/* Top Quick Figures */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Present Today</p>
                <p className="text-xl font-black font-mono text-indigo-900 mt-0.5">{stats.totalPresent} employees</p>
                <p className="text-[9px] text-indigo-600">Active checked-in</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-650 rounded-xl">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Late Check-ins</p>
                <p className="text-xl font-black font-mono text-red-600 mt-0.5">{stats.totalLate} late</p>
                <p className="text-[9px] text-red-500">Requires review</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-650 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Leaves This Month</p>
                <p className="text-xl font-black font-mono text-amber-600 mt-0.5">
                  {attendanceLogs.filter(a => a.date.startsWith('2026-06') && a.status === 'Leave').length} days
                </p>
                <p className="text-[9px] text-slate-500">Permit &amp; Medical forms</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Overtime count</p>
                <p className="text-xl font-black font-mono text-emerald-600 mt-0.5">
                  {attendanceLogs.filter(a => a.date.startsWith('2026-06') && a.isOvertime).length} shifts
                </p>
                <p className="text-[9px] text-emerald-600">Additional hours registered</p>
              </div>
            </div>
          </div>

          {/* Matrix view of branch attendance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-3 mb-4">
              <Layers className="w-4 h-4 text-indigo-650" /> Present / Late / Absent Month-to-date (MTD) Per Factory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {factoriesList().map(fc => {
                const data = stats.factoryTotals[fc] || { present: 0, late: 0, absent: 0, leave: 0 };
                const totalRegisteredActions = data.present + data.absent + data.leave;
                const attendanceRate = totalRegisteredActions > 0 ? Math.round((data.present / totalRegisteredActions) * 100) : 100;
                
                return (
                  <div key={fc} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-slate-800 uppercase bg-slate-200 py-0.5 px-2 rounded">{fc}</span>
                        <span className="font-mono text-emerald-600 font-extrabold">{attendanceRate}% rate</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mb-3">MTD Totals (June)</p>
                      
                      <div className="space-y-1.5 text-[11px] font-medium text-slate-700">
                        <div className="flex justify-between"><span>Present:</span> <span className="font-bold text-emerald-600">{data.present}</span></div>
                        <div className="flex justify-between"><span>Late:</span> <span className="font-bold text-red-500">{data.late}</span></div>
                        <div className="flex justify-between"><span>Absent:</span> <span className="font-bold text-red-650">{data.absent}</span></div>
                        <div className="flex justify-between"><span>Leaves:</span> <span className="font-bold text-amber-600">{data.leave}</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Table Log listing */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase">Complete History Log of Absensi (June 2026)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" id="attendance-table-dashboard">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase border-b">
                  <tr>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">FullName</th>
                    <th className="p-3">Factory</th>
                    <th className="p-3 font-mono">Date</th>
                    <th className="p-3">Clock In</th>
                    <th className="p-3">Clock Out</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Overtime Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-700">
                  {attendanceTableData.slice().reverse().map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[10.5px] font-bold">{row.employeeId}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{row.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{row.position} ({row.department})</div>
                      </td>
                      <td className="p-3"><span className="p-1 px-2 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-650">{row.factoryId}</span></td>
                      <td className="p-3 font-mono font-bold text-slate-500">{row.date}</td>
                      <td className="p-3 font-mono font-bold text-emerald-650">{row.timeIn || '--'}</td>
                      <td className="p-3 font-mono font-bold text-indigo-650">{row.timeOut || '--'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] ${row.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : row.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-650 border border-red-200'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-slate-700">
                        {row.overtimeHours > 0 ? (
                          <span className="text-emerald-600 font-extrabold">{row.overtimeHours} Hrs</span>
                        ) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CORE INTEGRATED PAYROLL ENGINE REPORTS */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-fade-in" id="payroll-integration">
          {/* Charts Analysis comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs md:col-span-2 space-y-3">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Dynamic Wage Accruals Per Worker (June 2026 MTD)
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} formatter={(v) => `Rp${(v as number)/1000}K`} />
                    <Tooltip formatter={(v) => `Rp ${(v as number).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="base" name="Gaji Pokok / Borongan" fill="#4f46e5" stackId="a" />
                    <Bar dataKey="overtime" name="Lembur (Overtime)" fill="#10b981" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <DollarSign className="w-4 h-4" /> PAYROLL FORMULA MATRIX GUIDELINES
                </h4>

                <div className="space-y-3 text-xs leading-relaxed font-semibold text-slate-350 pr-1 pt-3">
                  <div className="p-2.5 bg-slate-950 rounded-lg">
                    <p className="font-black text-white">Daily Wage (Produksi Harian)</p>
                    <p className="text-[11px] text-slate-400 font-medium">Present days × Daily basic wage of employee</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg">
                    <p className="font-black text-white">Peeling Wage (Borongan Kupas)</p>
                    <p className="text-[11px] text-slate-400 font-medium">Kg Peeled (from Peeling logs) × Wage/Kg basic rate</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg">
                    <p className="font-black text-white">Frying Cycles Wage (Borongan Goreng)</p>
                    <p className="text-[11px] text-slate-400 font-medium">Frying batch cycles (from Frying logs) × Wage/cycle basic rate</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg">
                    <p className="font-black text-white">Monthly Staff (Gaji Kontrak)</p>
                    <p className="text-[11px] text-slate-400 font-medium">Standard Salary + Flat Overtime hours penalty - Deductions</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-850 pt-3 mt-4 text-center">
                Sync with Bank: <span className="font-black text-emerald-400">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Dynamic Payroll listing */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase">Automated Payslip Allocations Matrix</h4>
              <span className="text-[10.5px] font-black text-slate-500">June 2026 MTD calculation</span>
            </div>
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-xs text-left" id="payroll-table-report">
                <thead className="bg-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b">
                  <tr>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">FullName</th>
                    <th className="p-3">Factory</th>
                    <th className="p-3">Gaji Category</th>
                    <th className="p-3">Attendance Stats</th>
                    <th className="p-3">Base / Borongan Wage</th>
                    <th className="p-3">Overtime Pay</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3 font-mono">Net Take Home</th>
                    <th className="p-3">Formula Breakdown Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold text-slate-700">
                  {computedPayrollList.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/75">
                      <td className="p-3 font-mono text-[10.5px] font-black text-slate-500">{p.id}</td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-800">{p.nama}</div>
                        <div className="text-[9.5px] text-slate-400 font-medium">{p.role} ({p.department})</div>
                      </td>
                      <td className="p-3"><span className="p-1 px-2 bg-slate-100 rounded text-[9.5px] uppercase font-bold text-slate-650">{p.lokasiId}</span></td>
                      <td className="p-3 font-bold text-[10px] text-indigo-700 uppercase">{p.type}</td>
                      <td className="p-3">
                        <div className="text-slate-600 font-bold">{p.daysPresent} present</div>
                        <div className="text-red-600 font-bold text-[9.5px]">{p.daysAbsent} absent | {p.sumOvertimeHours}h OT</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">Rp {p.baseWage.toLocaleString('id-ID')}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+Rp {p.overtime.toLocaleString('id-ID')}</td>
                      <td className="p-3 font-mono font-bold text-red-600">-Rp {p.deductions.toLocaleString('id-ID')}</td>
                      <td className="p-3 font-mono text-[13px] font-black text-indigo-900 bg-indigo-50/30">Rp {p.netPay.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-[10px] text-slate-500 leading-snug italic max-w-xs">{p.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
