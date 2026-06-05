/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
  FileText,
  UploadCloud,
  X,
  MapPin,
  Calendar,
  User,
  Activity,
  Award
} from 'lucide-react';

interface ComplianceAndServiceProps {
  state: any;
  setMaintenanceLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  setComplianceLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: any;
  selectedLokasi: string;
}

export default function ComplianceAndService({
  state,
  setMaintenanceLogs,
  setComplianceLogs,
  currentUser,
  selectedLokasi
}: ComplianceAndServiceProps) {
  // Sync maintenance and audit data using localStorage or parent state
  const [maintenanceReports, setMaintenanceReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('agridea_maintenance_reports');
    if (saved) return JSON.parse(saved);
    
    // Seed some initial maintenance logs matching user's SEED_MAINTENANCE_LOGS or expand
    return [
      {
        id: 'MNT-REP-01',
        lokasiId: 'MPD',
        machineName: 'Vacuum Frying Machine #1 (Wonosobo)',
        machineCategory: 'Vacuum Frying',
        maintenanceType: 'Preventive',
        maintenanceDate: '2026-05-20',
        technician: 'Budi Hartono',
        downtimeHours: 2.0,
        cost: 200000,
        description: 'Cleaning burner, checking pressure vacuum gasket seals, oil lubrication',
        status: 'Completed',
        photoName: 'burner_clean.jpg',
        docName: 'preventive_sched_may.pdf'
      },
      {
        id: 'MNT-REP-02',
        lokasiId: 'SSP',
        machineName: 'Peeling Blender Motor S5',
        machineCategory: 'Peeling Machine',
        maintenanceType: 'Breakdown',
        maintenanceDate: '2026-05-31',
        technician: 'Tomi Budiseno',
        downtimeHours: 8.0,
        cost: 1250000,
        description: 'Vacuum motor overload failure. Replaced bearings and cooling coil.',
        status: 'Completed',
        photoName: 'motor_overload_fix.jpg',
        docName: 'bearing_replacement_invoice.pdf'
      },
      {
        id: 'MNT-REP-03',
        lokasiId: 'MPD',
        machineName: 'Vacuum Frying Machine #2 (Wonosobo)',
        machineCategory: 'Vacuum Frying',
        maintenanceType: 'Corrective',
        maintenanceDate: '2026-06-02',
        technician: 'Sutrisno',
        downtimeHours: 3.5,
        cost: 450000,
        description: 'Gasket seal replacement due to pressure leak detected during run #4.',
        status: 'Open',
        photoName: 'gasket_leak.jpg',
        docName: ''
      }
    ];
  });

  const [auditReports, setAuditReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('agridea_audit_reports');
    if (saved) return JSON.parse(saved);

    // Seed realistic audit logs based on guidelines
    return [
      {
        id: 'AUD-001',
        auditType: 'Food Safety Audit',
        auditDate: '2026-05-15',
        auditor: 'Dr. Agus Purwanto (BPOM)',
        findings: 'Pest control records in the dry storage room were not fully printed out for April 2026. Hand sanitizers near packaging tables needed refill.',
        riskLevel: 'Medium',
        correctiveAction: 'Refilled all hand sanitizers and printed pesticide bait station logs. Created a digital automated backup checklist.',
        dueDate: '2026-05-25',
        pic: 'Renita (Admin)',
        status: 'Closed',
        evidenceName: 'pest_control_logs_refilled.pdf'
      },
      {
        id: 'AUD-002',
        auditType: 'GMP Audit',
        auditDate: '2026-06-01',
        auditor: 'Amelia (HQ Quality Manager)',
        findings: 'Three operators in Peeling Room MPD were found wearing hairnets loosely, showcasing exposed ears.',
        riskLevel: 'Low',
        correctiveAction: 'Re-trained peeling crew on protective clothing policy. Added mirror near entrance for hygiene self-check.',
        dueDate: '2026-06-05',
        pic: 'Stefanus (Branch Manager)',
        status: 'Open',
        evidenceName: ''
      },
      {
        id: 'AUD-003',
        auditType: 'HACCP Audit',
        auditDate: '2026-05-28',
        auditor: 'HACCP Certification body Indonesia',
        findings: 'Vacuum frying oil temperature sensor verification tag was missing on Frying machine #2.',
        riskLevel: 'High',
        correctiveAction: 'Calibrated the temperature sensor manually with dynamic thermometer testing and stamped verified validation certificate on physical machinery frame.',
        dueDate: '2026-06-10',
        pic: 'Slamet (Frying Supervisor)',
        status: 'Closed',
        evidenceName: 'calib_cert_m2.pdf'
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'maintenance' | 'audit'>('dashboard');

  // Filter systems
  const [filterLokasi, setFilterLokasi] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Forms modals/expand states
  const [showMaintForm, setShowMaintForm] = useState<boolean>(false);
  const [showAuditForm, setShowAuditForm] = useState<boolean>(false);

  // Quick Dashboard Forms
  const [showQuickMaintForm, setShowQuickMaintForm] = useState<boolean>(false);
  const [showQuickAuditForm, setShowQuickAuditForm] = useState<boolean>(false);

  // Detail Modal selections
  const [selectedMaintDetail, setSelectedMaintDetail] = useState<any | null>(null);
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<any | null>(null);

  // Quick form specific inputs
  const [quickMaintMachine, setQuickMaintMachine] = useState<string>('');
  const [quickMaintCategory, setQuickMaintCategory] = useState<string>('Vacuum Frying');
  const [quickMaintType, setQuickMaintType] = useState<string>('Breakdown'); // Default to breakdown/troubleshoot
  const [quickMaintDesc, setQuickMaintDesc] = useState<string>('');
  const [quickMaintHours, setQuickMaintHours] = useState<number>(1);
  const [quickMaintCost, setQuickMaintCost] = useState<number>(0);

  const [quickAuditType, setQuickAuditType] = useState<string>('GMP Audit');
  const [quickAuditFindings, setQuickAuditFindings] = useState<string>('');
  const [quickAuditRisk, setQuickAuditRisk] = useState<string>('High');
  const [quickAuditCorrective, setQuickAuditCorrective] = useState<string>('');
  const [quickAuditPIC, setQuickAuditPIC] = useState<string>('');

  // Action room state variables for updates
  const [updateMaintDesc, setUpdateMaintDesc] = useState<string>('');
  const [updateMaintHours, setUpdateMaintHours] = useState<number>(0);
  const [updateMaintCost, setUpdateMaintCost] = useState<number>(0);
  const [updateMaintStatus, setUpdateMaintStatus] = useState<string>('Open');

  const [updateAuditFindings, setUpdateAuditFindings] = useState<string>('');
  const [updateAuditRisk, setUpdateAuditRisk] = useState<string>('High');
  const [updateAuditCorrective, setUpdateAuditCorrective] = useState<string>('');
  const [updateAuditPIC, setUpdateAuditPIC] = useState<string>('');
  const [updateAuditDueDate, setUpdateAuditDueDate] = useState<string>('');
  const [updateAuditStatus, setUpdateAuditStatus] = useState<string>('Open');

  // React synchronizers
  useEffect(() => {
    if (selectedMaintDetail) {
      setUpdateMaintDesc(selectedMaintDetail.description || '');
      setUpdateMaintHours(selectedMaintDetail.downtimeHours || 0);
      setUpdateMaintCost(selectedMaintDetail.cost || 0);
      setUpdateMaintStatus(selectedMaintDetail.status || 'Open');
    }
  }, [selectedMaintDetail]);

  useEffect(() => {
    if (selectedAuditDetail) {
      setUpdateAuditFindings(selectedAuditDetail.findings || '');
      setUpdateAuditRisk(selectedAuditDetail.riskLevel || 'High');
      setUpdateAuditCorrective(selectedAuditDetail.correctiveAction || '');
      setUpdateAuditPIC(selectedAuditDetail.pic || '');
      setUpdateAuditDueDate(selectedAuditDetail.dueDate || '');
      setUpdateAuditStatus(selectedAuditDetail.status || 'Open');
    }
  }, [selectedAuditDetail]);

  const handleSaveMaintDetails = () => {
    if (!selectedMaintDetail) return;
    setMaintenanceReports(prev => prev.map(m => {
      if (m.id === selectedMaintDetail.id) {
        return {
          ...m,
          description: updateMaintDesc,
          downtimeHours: updateMaintHours,
          cost: updateMaintCost,
          status: updateMaintStatus
        };
      }
      return m;
    }));
    setSelectedMaintDetail(prev => prev ? {
      ...prev,
      description: updateMaintDesc,
      downtimeHours: updateMaintHours,
      cost: updateMaintCost,
      status: updateMaintStatus
    } : null);
  };

  const handleSaveAuditDetails = () => {
    if (!selectedAuditDetail) return;
    setAuditReports(prev => prev.map(a => {
      if (a.id === selectedAuditDetail.id) {
        return {
          ...a,
          findings: updateAuditFindings,
          riskLevel: updateAuditRisk,
          correctiveAction: updateAuditCorrective,
          pic: updateAuditPIC,
          dueDate: updateAuditDueDate,
          status: updateAuditStatus
        };
      }
      return a;
    }));
    setSelectedAuditDetail(prev => prev ? {
      ...prev,
      findings: updateAuditFindings,
      riskLevel: updateAuditRisk,
      correctiveAction: updateAuditCorrective,
      pic: updateAuditPIC,
      dueDate: updateAuditDueDate,
      status: updateAuditStatus
    } : null);
  };

  // Quick form submission handlers
  const handleQuickMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMaintMachine || !quickMaintDesc) {
      alert("Lengkapi nama mesin dan deskripsi masalah troubleshooting.");
      return;
    }
    const newMNT = {
      id: 'MNT-REP-' + Date.now().toString().slice(-6),
      lokasiId: currentUser.lokasiId === 'JKT' ? 'MPD' : currentUser.lokasiId, // Default to user's location
      machineName: quickMaintMachine,
      machineCategory: quickMaintCategory,
      maintenanceType: quickMaintType,
      maintenanceDate: new Date().toISOString().split('T')[0],
      technician: currentUser.namaLengkap, // Pre-assign reporter/operator
      downtimeHours: parseFloat(quickMaintHours as any) || 0,
      cost: parseInt(quickMaintCost as any) || 0,
      description: quickMaintDesc,
      status: 'In Progress',
      photoName: 'troubleshoot_reported.jpg',
      docName: ''
    };
    setMaintenanceReports(prev => [newMNT, ...prev]);
    setQuickMaintMachine('');
    setQuickMaintDesc('');
    setQuickMaintHours(1);
    setQuickMaintCost(0);
    setShowQuickMaintForm(false);
  };

  const handleQuickAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAuditFindings || !quickAuditCorrective) {
      alert("Lengkapi deskripsi temuan hazard dan usulan tindakan koreksi (corrective action).");
      return;
    }
    const newAudit = {
      id: 'AUD-' + Date.now().toString().slice(-6),
      auditType: quickAuditType,
      auditDate: new Date().toISOString().split('T')[0],
      auditor: currentUser.namaLengkap + ` (${currentUser.role})`, // Reported by currently logged in user
      findings: quickAuditFindings,
      riskLevel: quickAuditRisk,
      correctiveAction: quickAuditCorrective,
      dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0], // 5 days due
      pic: quickAuditPIC || 'Crew Lapangan',
      status: 'Open',
      evidenceName: ''
    };
    setAuditReports(prev => [newAudit, ...prev]);
    setQuickAuditFindings('');
    setQuickAuditCorrective('');
    setQuickAuditPIC('');
    setShowQuickAuditForm(false);
  };

  // Machine maintenance form states
  const [maintLokasiId, setMaintLokasiId] = useState<string>(selectedLokasi === 'JKT' ? 'MPD' : selectedLokasi);
  const [maintMachineName, setMaintMachineName] = useState<string>('');
  const [maintMachineCategory, setMaintMachineCategory] = useState<string>('Vacuum Frying');
  const [maintType, setMaintType] = useState<string>('Preventive');
  const [maintDate, setMaintDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [maintTechnician, setMaintTechnician] = useState<string>('');
  const [maintDowntime, setMaintDowntime] = useState<number>(0);
  const [maintCost, setMaintCost] = useState<number>(0);
  const [maintDesc, setMaintDesc] = useState<string>('');
  const [maintStatus, setMaintStatus] = useState<string>('Open');
  const [maintPhoto, setMaintPhoto] = useState<string>('');
  const [maintDoc, setMaintDoc] = useState<string>('');

  // Audit form states
  const [auditType, setAuditType] = useState<string>('Food Safety Audit');
  const [auditDateValue, setAuditDateValue] = useState<string>(new Date().toISOString().split('T')[0]);
  const [auditAuditor, setAuditAuditor] = useState<string>('');
  const [auditFindings, setAuditFindings] = useState<string>('');
  const [auditRisk, setAuditRisk] = useState<string>('Medium');
  const [auditCorrective, setAuditCorrective] = useState<string>('');
  const [auditDueDate, setAuditDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [auditPIC, setAuditPIC] = useState<string>('');
  const [auditEvidence, setAuditEvidence] = useState<string>('');
  const [auditStatus, setAuditStatus] = useState<string>('Open');

  // Trigger sync to parents and localStorage hooks
  useEffect(() => {
    localStorage.setItem('agridea_maintenance_reports', JSON.stringify(maintenanceReports));
    if (setMaintenanceLogs) {
      // Map back to global App state as well to maintain consistency!
      const mapped = maintenanceReports.map(rep => ({
        id: rep.id,
        mesinId: rep.machineName,
        tanggal: rep.maintenanceDate,
        tipe: rep.maintenanceType,
        deskripsi: rep.description,
        biaya: rep.cost,
        downtimeMenit: Math.round(rep.downtimeHours * 60),
        pemberiTugas: rep.technician
      }));
      setMaintenanceLogs(mapped);
    }
  }, [maintenanceReports, setMaintenanceLogs]);

  useEffect(() => {
    localStorage.setItem('agridea_audit_reports', JSON.stringify(auditReports));
    if (setComplianceLogs) {
      const mapped = auditReports.map(rep => ({
        id: rep.id,
        tipeLog: rep.auditType as any,
        tanggal: rep.auditDate,
        status: rep.status === 'Closed' ? 'Complete' : (rep.riskLevel === 'Critical' || rep.riskLevel === 'High' ? 'Critical' : 'Action_Required'),
        deskripsi: rep.findings + '. Tindakan koreksi: ' + rep.correctiveAction,
        pic: rep.pic,
        detailData: { auditor: rep.auditor, riskLevel: rep.riskLevel, dueDate: rep.dueDate }
      }));
      setComplianceLogs(mapped);
    }
  }, [auditReports, setComplianceLogs]);

  // Compute stats metrics
  const stats = useMemo(() => {
    const totalMaintenance = maintenanceReports.length;
    const completedMaintenance = maintenanceReports.filter(m => m.status === 'Completed').length;
    const openMaintenance = totalMaintenance - completedMaintenance;
    
    const openFindings = auditReports.filter(a => a.status === 'Open').length;
    const closedFindings = auditReports.filter(a => a.status === 'Closed').length;
    const totalFindings = openFindings + closedFindings;

    const totalDowntimeHours = maintenanceReports.reduce((sum, item) => sum + parseFloat(item.downtimeHours || 0), 0);
    const auditComplianceScore = totalFindings > 0 ? Math.round((closedFindings / totalFindings) * 100) : 100;

    return {
      totalMaintenance,
      completedMaintenance,
      openMaintenance,
      totalFindings,
      openFindings,
      closedFindings,
      totalDowntimeHours,
      auditComplianceScore
    };
  }, [maintenanceReports, auditReports]);

  // Handle Maintenance Form Submit
  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintMachineName || !maintTechnician) {
      alert("Please enter machine name and technician.");
      return;
    }

    const newReport = {
      id: 'MNT-REP-' + Date.now(),
      lokasiId: maintLokasiId,
      machineName: maintMachineName,
      machineCategory: maintMachineCategory,
      maintenanceType: maintType,
      maintenanceDate: maintDate,
      technician: maintTechnician,
      downtimeHours: parseFloat(maintDowntime as any) || 0,
      cost: parseInt(maintCost as any) || 0,
      description: maintDesc,
      status: maintStatus,
      photoName: maintPhoto || 'mock_uploaded_photo.jpg',
      docName: maintDoc
    };

    setMaintenanceReports(prev => [newReport, ...prev]);
    setShowMaintForm(false);
    
    // Reset Form
    setMaintMachineName('');
    setMaintTechnician('');
    setMaintCost(0);
    setMaintDowntime(0);
    setMaintDesc('');
    setMaintPhoto('');
    setMaintDoc('');
  };

  // Handle Audit Form Submit
  const handleAddAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditAuditor || !auditFindings) {
      alert("Please specify the auditor and findings description.");
      return;
    }

    const newAudit = {
      id: 'AUD-' + Date.now(),
      auditType,
      auditDate: auditDateValue,
      auditor: auditAuditor,
      findings: auditFindings,
      riskLevel: auditRisk,
      correctiveAction: auditCorrective,
      dueDate: auditDueDate,
      pic: auditPIC,
      status: auditStatus,
      evidenceName: auditEvidence || 'supporting_evidence.pdf'
    };

    setAuditReports(prev => [newAudit, ...prev]);
    setShowAuditForm(false);

    // Reset Form
    setAuditAuditor('');
    setAuditFindings('');
    setAuditCorrective('');
    setAuditPIC('');
    setAuditEvidence('');
  };

  // Toggle status of maintenance
  const toggleMaintStatus = (id: string) => {
    setMaintenanceReports(prev => prev.map(m => {
      if (m.id === id) {
        let nStatus = 'Open';
        if (m.status === 'Open') nStatus = 'In Progress';
        else if (m.status === 'In Progress') nStatus = 'Completed';
        return { ...m, status: nStatus };
      }
      return m;
    }));
  };

  // Toggle audit status
  const toggleAuditStatus = (id: string) => {
    setAuditReports(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'Open' ? 'Closed' : 'Open' };
      }
      return a;
    }));
  };

  const deleteMaintLog = (id: string) => {
    if (confirm("Delete this maintenance entry?")) {
      setMaintenanceReports(prev => prev.filter(m => m.id !== id));
    }
  };

  const deleteAuditLog = (id: string) => {
    if (confirm("Delete this audit record?")) {
      setAuditReports(prev => prev.filter(a => a.id !== id));
    }
  };

  // Filter logs by criteria
  const filteredMaint = useMemo(() => {
    return maintenanceReports.filter(m => {
      const matchLoc = filterLokasi === 'All' || m.lokasiId === filterLokasi;
      const matchSearch = !searchQuery || 
        m.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLoc && matchSearch;
    });
  }, [maintenanceReports, filterLokasi, searchQuery]);

  const filteredAudits = useMemo(() => {
    return auditReports.filter(a => {
      const matchSearch = !searchQuery ||
        a.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.findings.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.pic.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [auditReports, searchQuery]);

  // Factory locations matching master
  const factoriesList = ['MPD', 'SSP', 'KKI', 'AGDN', 'JKT'];

  return (
    <div className="space-y-6" id="compliance-service-hub-container">
      {/* Title Header bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-lg font-black font-display tracking-tight text-white flex items-center gap-2">
                Compliance &amp; Service Reporting Hub
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Pusat Pelaporan Lapangan, Audit Standarisasi GMP/HACCP, &amp; Manajemen Preventive Maintenance Agridea
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'maintenance' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Machine Maintenance
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === 'audit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Food Safety &amp; GMP Audits
          </button>
        </div>
      </div>

      {/* DASHBOARD INTEGRATION VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in" id="compliance-overview-dashboard">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Maint. Count</p>
                <p className="text-xl font-black font-mono mt-0.5 text-indigo-900">{stats.totalMaintenance} logs</p>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">
                  <span className="text-amber-600 font-bold">{stats.openMaintenance} Open</span> | {stats.completedMaintenance} Completed
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-650 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Open Findings</p>
                <p className="text-xl font-black font-mono mt-0.5 text-red-600">{stats.openFindings} findings</p>
                <p className="text-[8px] text-slate-500 font-medium">Require action plans</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Closed Audits</p>
                <p className="text-xl font-black font-mono mt-0.5 text-emerald-600">{stats.closedFindings} closed</p>
                <p className="text-[8px] text-emerald-600 font-semibold">Fully cleared &amp; verified</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-650 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Downtime Hours</p>
                <p className="text-xl font-black font-mono mt-0.5 text-amber-700">{stats.totalDowntimeHours} Hrs</p>
                <p className="text-[8px] text-slate-500 font-medium">Impact on factory capacity</p>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl shadow-xs flex items-center gap-4 border border-slate-800">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Award className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Compliance Score</p>
                <p className="text-2xl font-black font-mono mt-0.5 text-emerald-300">{stats.auditComplianceScore}%</p>
                <p className="text-[8px] text-slate-400 font-medium">Cleared findings ratio</p>
              </div>
            </div>
          </div>

          {/* ROLE INDICATOR & ACTIONS */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-4 rounded-xl border border-slate-205 flex flex-wrap justify-between items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Active Reporter Persona:</span>
              <span className="bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-sm">
                <User className="w-3 h-3" /> {currentUser?.namaLengkap || 'Guest User'} ({currentUser?.role || 'Operator Mesin'})
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowQuickMaintForm(prev => !prev)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10.5px] transition flex items-center gap-1 hover:shadow-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Machine Troubleshoot Log
              </button>
              <button 
                onClick={() => setShowQuickAuditForm(prev => !prev)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10.5px] transition flex items-center gap-1 hover:shadow-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Log Quick Hazard Finding (GMP/BPOM)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Summary list of Open Maintenance */}
            <div className="bg-white rounded-xl border border-slate-200/85 p-5 shadow-xs">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-500" /> Active Maintenance &amp; Troubleshooting
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                    {maintenanceReports.filter(r => r.status !== 'Completed').length} Pending
                  </span>
                  <button
                    onClick={() => setShowQuickMaintForm(!showQuickMaintForm)}
                    className="p-1 text-slate-500 hover:text-indigo-650 bg-slate-100 hover:bg-slate-200 rounded"
                    title="Laporkan Masalah Mesin"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Compact Inline Form */}
              {showQuickMaintForm && (
                <form onSubmit={handleQuickMaintSubmit} className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-150 space-y-3 mb-4 text-xs font-semibold text-slate-700 animate-slide-in">
                  <div className="flex justify-between items-center">
                    <p className="font-black text-indigo-950 text-[11px] uppercase tracking-wider">Malfungsi / Masalah Mesin Lapangan</p>
                    <button type="button" onClick={() => setShowQuickMaintForm(false)} className="text-slate-400 hover:text-slate-650">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Nama / ID Unit Mesin</label>
                      <select
                        value={quickMaintMachine}
                        onChange={(e) => {
                          setQuickMaintMachine(e.target.value);
                          const found = state?.mesin?.find((m: any) => m.nama === e.target.value);
                          if (found?.tipe) setQuickMaintCategory(found.tipe);
                        }}
                        className="p-2 border rounded-lg w-full bg-white text-slate-800 font-bold"
                        required
                      >
                        <option value="">-- Pilih Mesin --</option>
                        {state?.mesin?.map((m: any) => (
                          <option key={m.id} value={m.nama}>{m.nama} ({m.kapasitas})</option>
                        )) || (
                          <>
                            <option value="Vacuum Fryer V-01 (Agrowindo 50kg)">Vacuum Fryer V-01 (Agrowindo 50kg)</option>
                            <option value="Vacuum Fryer V-02 (Agrowindo 25kg)">Vacuum Fryer V-02 (Agrowindo 25kg)</option>
                            <option value="Semi-Auto Peeler P-01">Semi-Auto Peeler P-01</option>
                            <option value="Continuous Band Sealer K-01">Continuous Band Sealer K-01</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Jenis Masalah / Tipe</label>
                      <select
                        value={quickMaintType}
                        onChange={(e) => setQuickMaintType(e.target.value)}
                        className="p-1.5 border rounded w-full bg-white text-slate-705 font-bold"
                      >
                        <option value="Breakdown">Breakdown (Mati Total / Emergency)</option>
                        <option value="Corrective">Corrective Maintenance</option>
                        <option value="Preventive">Routine Troubleshooting</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Downtime (Jam)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={quickMaintHours}
                        onChange={(e) => setQuickMaintHours(parseFloat(e.target.value) || 0)}
                        className="p-1.5 border rounded w-full bg-white font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Deskripsi Gejala / Kerusakan</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Suhu tidak stabil atau blower bergetar kencang"
                        value={quickMaintDesc}
                        onChange={(e) => setQuickMaintDesc(e.target.value)}
                        className="p-2 border rounded-lg w-full bg-white font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Estimasi Biaya Perbaikan (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 150000"
                        value={quickMaintCost}
                        onChange={(e) => setQuickMaintCost(parseInt(e.target.value) || 0)}
                        className="p-1.5 border rounded w-full bg-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button type="button" onClick={() => setShowQuickMaintForm(false)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700 text-[10.5px]">Batal</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10.5px] shadow-sm">Kirim Laporan</button>
                  </div>
                </form>
              )}

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {maintenanceReports.filter(r => r.status !== 'Completed').map(rep => (
                  <div key={rep.id} className="p-3 bg-slate-50 hover:bg-slate-100 transition rounded-lg border border-slate-200/60 text-xs flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black">{rep.lokasiId}</span>
                        <span className="truncate">{rep.machineName}</span>
                      </div>
                      <p className="text-slate-500 text-[10.5px] leading-relaxed truncate">{rep.description}</p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-semibold text-slate-400 font-mono mt-1">
                        <span>Type: {rep.maintenanceType}</span>
                        <span>Downtime: {rep.downtimeHours}h</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                        rep.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {rep.status}
                      </span>
                      <button
                        onClick={() => setSelectedMaintDetail(rep)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        Lihat Detail →
                      </button>
                    </div>
                  </div>
                ))}
                {maintenanceReports.filter(r => r.status !== 'Completed').length === 0 && (
                  <p className="text-center text-slate-400 py-8 text-[11px]">All machines operational. No open downtime maintenance needed.</p>
                )}
              </div>
            </div>

            {/* Quick checklist of Audits & compliance alerts */}
            <div className="bg-white rounded-xl border border-slate-200/85 p-5 shadow-xs">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500" /> Open Findings &amp; Risk Corrective Actions
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-red-50 text-red-650 px-2 py-0.5 rounded font-bold">
                    {auditReports.filter(r => r.status === 'Open').length} Open Issues
                  </span>
                  <button
                    onClick={() => setShowQuickAuditForm(!showQuickAuditForm)}
                    className="p-1 text-slate-500 hover:text-emerald-655 bg-slate-100 hover:bg-slate-200 rounded"
                    title="Catat Audit / Temuan Lapangan"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Audit / Finding Form */}
              {showQuickAuditForm && (
                <form onSubmit={handleQuickAuditSubmit} className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-150 space-y-3 mb-4 text-xs font-semibold text-slate-700 animate-slide-in">
                  <div className="flex justify-between items-center">
                    <p className="font-extrabold text-emerald-950 text-[11px] uppercase tracking-wider">Registrasi Temuan Hazard GMP &amp; HACCP</p>
                    <button type="button" onClick={() => setShowQuickAuditForm(false)} className="text-slate-400 hover:text-slate-650">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Kategori Audit Temuan</label>
                      <select
                        value={quickAuditType}
                        onChange={(e) => setQuickAuditType(e.target.value)}
                        className="p-1.5 border rounded w-full bg-white text-slate-705 font-bold"
                      >
                        <option value="GMP Audit">GMP Audit (Sanitasi / Kebersihan)</option>
                        <option value="Food Safety Audit">Food Safety (Kemasan / Hygiene)</option>
                        <option value="HACCP Audit">HACCP (Suhu / Sensor Kontrol)</option>
                        <option value="BPOM Audit">BPOM Standard Audit</option>
                        <option value="Internal Audit">Internal QC Quality Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Risiko / Incident Risk</label>
                      <select
                        value={quickAuditRisk}
                        onChange={(e) => setQuickAuditRisk(e.target.value)}
                        className="p-1.5 border rounded w-full bg-white text-slate-750 font-bold"
                      >
                        <option value="Low">Low - Minor Observation</option>
                        <option value="Medium">Medium - Opportunity for Imp.</option>
                        <option value="High">High - Non-Conformity</option>
                        <option value="Critical">Critical - Immediate Stop</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">Deskripsi Temuan / Bukti Penyimpangan</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ditemukan tumpahan minyak sisa dekat mesin blower frying #1"
                        value={quickAuditFindings}
                        onChange={(e) => setQuickAuditFindings(e.target.value)}
                        className="p-2 border rounded-lg w-full bg-white font-medium text-slate-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-450 block font-semibold mb-0.5">Rencana Tindakan Koreksi (Corrective Action Plan)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pembersihan tumpahan dengan absorben, pasang rubber mat anti-slip"
                        value={quickAuditCorrective}
                        onChange={(e) => setQuickAuditCorrective(e.target.value)}
                        className="p-2 border rounded-lg w-full bg-white font-medium text-slate-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-405 block font-semibold mb-0.5">Assigned PIC / Person In Charge</label>
                      <input
                        type="text"
                        placeholder="e.g. Slamet (Frying Supervisor)"
                        value={quickAuditPIC}
                        onChange={(e) => setQuickAuditPIC(e.target.value)}
                        className="p-2 border rounded-lg w-full bg-white font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button type="button" onClick={() => setShowQuickAuditForm(false)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700 text-[10.5px]">Batal</button>
                    <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10.5px] shadow-sm">Simpan Issue</button>
                  </div>
                </form>
              )}

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {auditReports.filter(r => r.status === 'Open').map(aud => (
                  <div key={aud.id} className="p-3 bg-red-50/30 rounded-lg border border-red-100/60 text-xs flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black uppercase text-white px-1.5 py-0.5 rounded ${aud.riskLevel === 'Critical' ? 'bg-red-650 animate-pulse' : aud.riskLevel === 'High' ? 'bg-orange-500' : 'bg-yellow-500 text-slate-900'}`}>{aud.riskLevel} Risk</span>
                        <span className="font-extrabold text-slate-805 truncate">{aud.auditType}</span>
                      </div>
                      <p className="text-slate-600 font-medium text-[11px] leading-relaxed truncate">Finding: {aud.findings}</p>
                      <div className="flex gap-3 text-[9px] text-slate-450 mt-1">
                        <span>PIC: {aud.pic}</span>
                        <span>Due: {aud.dueDate}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <button
                        onClick={() => setSelectedAuditDetail(aud)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                      >
                        Detail &amp; CA →
                      </button>
                    </div>
                  </div>
                ))}
                {auditReports.filter(r => r.status === 'Open').length === 0 && (
                  <p className="text-center text-emerald-500 py-8 text-[11px] font-bold flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8" /> 100% GMP Clean Audit Score! No pending findings.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MAINTENANCE DETAIL MODAL ----------------- */}
      {selectedMaintDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-maint-detail">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-indigo-950 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide">Machine Service Detail Record</h3>
                  <p className="text-[10px] text-indigo-300 font-mono">{selectedMaintDetail.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMaintDetail(null)} className="text-indigo-205 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-xs space-y-4 font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-250/50">
                <div>
                  <p className="text-[9.5px] text-slate-400 uppercase">Factory Location / Cabang</p>
                  <p className="text-xs font-black text-slate-800">{selectedMaintDetail.lokasiId}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-400 uppercase">Machine Classification</p>
                  <p className="text-xs font-black text-slate-800">{selectedMaintDetail.machineCategory}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9.5px] text-slate-400 uppercase font-bold">Target Equipment Unit</p>
                  <p className="text-sm font-black text-indigo-950">{selectedMaintDetail.machineName}</p>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] text-slate-400 uppercase">Trouble/Fix Description &amp; Symptoms</p>
                <p className="font-medium bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-slate-800 leading-relaxed text-[11px] font-mono whitespace-pre-line">{selectedMaintDetail.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9px] text-slate-405 uppercase">Service Type</p>
                  <span className={`px-2 py-0.5 mt-0.5 inline-block rounded text-[9.5px] font-black ${selectedMaintDetail.maintenanceType === 'Breakdown' ? 'bg-red-50 text-red-650' : selectedMaintDetail.maintenanceType === 'Corrective' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {selectedMaintDetail.maintenanceType}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] text-slate-405 uppercase">Downtime spent</p>
                  <p className="font-black text-amber-700 text-xs mt-0.5">{selectedMaintDetail.downtimeHours} Hours</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-405 uppercase">Allocated Cost</p>
                  <p className="font-black text-indigo-900 text-xs mt-0.5">Rp {selectedMaintDetail.cost.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <p className="text-[9.5px] text-slate-400 uppercase">Assigned Technician / Reporter</p>
                  <p className="text-xs font-black text-slate-800">{selectedMaintDetail.technician || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-400 uppercase">Service Date</p>
                  <p className="text-xs font-black text-slate-800 font-mono">{selectedMaintDetail.maintenanceDate}</p>
                </div>
              </div>

              {/* EDITABLE SERVICE REPORT - COMPLIANCE REGISTRATION SYSTEM */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <Activity className="w-3 h-3 text-indigo-500 animate-pulse" /> Diagnostics Action Room
                  </p>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold font-mono">
                    Role: {currentUser?.role || 'Staff'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-600 block font-bold mb-1">Update Deskripsi Masalah / Troubleshooting Detail:</label>
                    <textarea
                      value={updateMaintDesc}
                      onChange={(e) => setUpdateMaintDesc(e.target.value)}
                      rows={2}
                      className="p-2 border rounded-lg w-full bg-white text-slate-800 font-medium font-sans resize-none outline-none focus:border-indigo-500"
                      placeholder="Masukkan progres perbaikan secara mendetail..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 block font-bold mb-1">Downtime spent (Jam):</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={updateMaintHours}
                        onChange={(e) => setUpdateMaintHours(parseFloat(e.target.value) || 0)}
                        className="p-1.5 border rounded-lg w-full bg-white font-mono font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block font-bold mb-1">Allocated Cost (Rp):</label>
                      <input
                        type="number"
                        min="0"
                        value={updateMaintCost}
                        onChange={(e) => setUpdateMaintCost(parseInt(e.target.value) || 0)}
                        className="p-1.5 border rounded-lg w-full bg-white font-mono font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 block font-bold mb-1">Workflow Status:</label>
                    <div className="flex gap-1 font-sans">
                      {['Open', 'In Progress', 'Completed'].map(st => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setUpdateMaintStatus(st)}
                          className={`flex-1 py-1 text-[10.5px] rounded-lg font-bold border transition ${updateMaintStatus === st ? 'bg-indigo-600 text-white border-indigo-650 shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMaintDetails}
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save Diagnostic Logs &amp; Status
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 p-3 flex justify-between gap-1 border-t">
              <button
                onClick={() => {
                  if (confirm("Delete this maintenance log report permanently?")) {
                    setMaintenanceReports(prev => prev.filter(m => m.id !== selectedMaintDetail.id));
                    setSelectedMaintDetail(null);
                  }
                }}
                className="text-red-600 hover:text-red-800 font-bold text-xs px-2.5"
              >
                Delete Log
              </button>
              <button
                onClick={() => setSelectedMaintDetail(null)}
                className="bg-indigo-950 text-white text-xs font-bold py-1.5 px-4 rounded-xl shadow-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- AUDIT DETAIL MODAL ----------------- */}
      {selectedAuditDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-audit-detail">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-emerald-950 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide">Compliance &amp; Risk Corrective Action</h3>
                  <p className="text-[10px] text-emerald-300 font-mono">{selectedAuditDetail.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAuditDetail(null)} className="text-emerald-205 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-xs space-y-4 font-semibold text-slate-700">
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 text-xs">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded ${selectedAuditDetail.riskLevel === 'Critical' ? 'bg-red-600 animate-pulse' : selectedAuditDetail.riskLevel === 'High' ? 'bg-orange-500' : 'bg-yellow-500 text-slate-900'}`}>{selectedAuditDetail.riskLevel} Risk rating</span>
                  <span className="font-extrabold text-slate-900 text-xs">{selectedAuditDetail.auditType}</span>
                </div>
                <div className="text-slate-700 leading-relaxed font-medium text-[11px]"><span className="font-bold text-slate-400 uppercase text-[9.5px] block mb-0.5">Finding Details:</span>{selectedAuditDetail.findings}</div>
              </div>

              <div className="bg-emerald-50/45 p-4 rounded-xl border border-emerald-100 text-xs">
                <p className="font-bold text-slate-450 uppercase text-[9.5px] mb-1">Proposed Corrective Action Task (Disusun oleh Kepala Cabang / Produksi):</p>
                <div className="text-emerald-950 font-semibold leading-relaxed font-mono whitespace-pre-line text-[11.5px]">{selectedAuditDetail.correctiveAction || 'None registered'}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-[9px] text-slate-404 uppercase">Assigned PIC</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{selectedAuditDetail.pic}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-404 uppercase">Audit Date</p>
                  <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{selectedAuditDetail.auditDate}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-404 uppercase">Due Date</p>
                  <p className="text-xs font-black text-slate-850 font-mono text-red-650 mt-0.5">{selectedAuditDetail.dueDate}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Logged Auditor / Quality Officer:</p>
                  <p className="text-xs font-black text-indigo-900">{selectedAuditDetail.auditor}</p>
                </div>
              </div>

              {/* EDITABLE AUDIT FINDING & ACTION DETAILS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-650" /> Action &amp; Risk Corrective Action Room
                  </p>
                  <span className="text-[9px] bg-emerald-55 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold font-mono">
                    Active User Role: {currentUser?.role || 'Staff'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div>
                    <label className="text-[9.5px] text-slate-600 block font-bold mb-1">Update Findings / Temuannya:</label>
                    <textarea
                      value={updateAuditFindings}
                      onChange={(e) => setUpdateAuditFindings(e.target.value)}
                      rows={2}
                      className="p-2 border rounded-lg w-full bg-white text-slate-800 font-medium font-sans resize-none outline-none focus:border-emerald-500"
                      placeholder="Masukkan detil temuan hazard / penyimpangan baru..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9.5px] text-slate-600 block font-bold mb-1">Risk Level / Rating:</label>
                      <select
                        value={updateAuditRisk}
                        onChange={(e) => setUpdateAuditRisk(e.target.value)}
                        className="p-1.5 border rounded-lg w-full bg-white font-bold"
                      >
                        <option value="Low">Low - Minor Observation</option>
                        <option value="Medium">Medium - Improvement Opportunity</option>
                        <option value="High">High - Non-Conformity</option>
                        <option value="Critical">Critical - Immediate Stop</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9.5px] text-slate-600 block font-bold mb-1">Due Date Target:</label>
                      <input
                        type="date"
                        value={updateAuditDueDate}
                        onChange={(e) => setUpdateAuditDueDate(e.target.value)}
                        className="p-1.5 border rounded-lg w-full bg-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9.5px] text-slate-600 block font-bold mb-1">Rencana Corrective Action:</label>
                      <input
                        type="text"
                        value={updateAuditCorrective}
                        onChange={(e) => setUpdateAuditCorrective(e.target.value)}
                        className="p-2 border rounded-lg w-full bg-white font-medium outline-none focus:border-emerald-500"
                        placeholder="e.g. Ganti kawat kasa penutup exhaust"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] text-slate-600 block font-bold mb-1">Assigned PIC / PIC:</label>
                      <input
                        type="text"
                        value={updateAuditPIC}
                        onChange={(e) => setUpdateAuditPIC(e.target.value)}
                        className="p-2 border rounded-lg w-full bg-white font-bold outline-none focus:border-emerald-500"
                        placeholder="e.g. Tomi (Kepala Cabang)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] text-slate-600 block font-bold mb-1">Audit Finding Status:</label>
                    <div className="flex gap-1">
                      {['Open', 'Closed'].map(st => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setUpdateAuditStatus(st)}
                          className={`flex-1 py-1 text-[10.5px] rounded-lg font-bold border transition ${updateAuditStatus === st ? 'bg-emerald-600 text-white border-emerald-650 shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {st === 'Open' ? '⚠️ Keep Finding Open' : '✅ Verify Action Done & Close'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAuditDetails}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save Corrective Actions &amp; Finding Details
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 p-3 flex justify-between gap-1 border-t">
              <button
                onClick={() => {
                  if (confirm("Delete this compliance finding permanently?")) {
                    setAuditReports(prev => prev.filter(a => a.id !== selectedAuditDetail.id));
                    setSelectedAuditDetail(null);
                  }
                }}
                className="text-red-700 hover:text-red-950 font-bold text-xs px-2.5"
              >
                Delete Log
              </button>
              <button
                onClick={() => setSelectedAuditDetail(null)}
                className="bg-emerald-950 text-white text-xs font-bold py-1.5 px-4 rounded-xl shadow-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MACHINE MAINTENANCE REGISTER & FILTERS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4 animate-fade-in" id="machine-maintenance-view">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 mr-1 uppercase">Filter Location:</span>
              <button
                onClick={() => setFilterLokasi('All')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${filterLokasi === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-250'}`}
              >
                All Branches
              </button>
              {factoriesList.map(loc => (
                <button
                  key={loc}
                  onClick={() => setFilterLokasi(loc)}
                  className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${filterLokasi === loc ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-250'}`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search machine, technician..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-full bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white"
                />
              </div>

              <button
                onClick={() => setShowMaintForm(!showMaintForm)}
                className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-1.5 select-none shrink-0"
              >
                <Plus className="w-4 h-4" /> Log Routine Service
              </button>
            </div>
          </div>

          {/* Form Modal Dropdown */}
          {showMaintForm && (
            <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-md animate-slide-in">
              <div className="flex justify-between items-center pb-3 border-b mb-4">
                <h3 className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 animate-spin" /> Log Machine Maintenance &amp; Troubleshooting
                </h3>
                <button onClick={() => setShowMaintForm(false)} className="text-slate-400 hover:text-slate-650">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                {/* Factory Location selection */}
                <div>
                  <label className="text-slate-500 mb-1 block">Factory Location</label>
                  <select
                    value={maintLokasiId}
                    onChange={(e) => setMaintLokasiId(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    {factoriesList.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Machine Name */}
                <div>
                  <label className="text-slate-500 mb-1 block">Machine Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vacuum Frying Machine #3"
                    value={maintMachineName}
                    onChange={(e) => setMaintMachineName(e.target.value)}
                    className="p-2 border rounded-lg w-full text-slate-800 font-bold bg-white"
                  />
                </div>

                {/* Machine Category */}
                <div>
                  <label className="text-slate-500 mb-1 block">Machine Category</label>
                  <select
                    value={maintMachineCategory}
                    onChange={(e) => setMaintMachineCategory(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    <option value="Vacuum Frying">Vacuum Frying Machine</option>
                    <option value="Peeling Machine">Peeling Machine</option>
                    <option value="Packaging Machine">Packaging Machine</option>
                    <option value="Dehydrator">Dehydrator</option>
                    <option value="Boiler">LPG Boiler System</option>
                    <option value="Cold Storage">Centrifugal Freezer / Cold Storage</option>
                  </select>
                </div>

                {/* Maintenance Type */}
                <div>
                  <label className="text-slate-500 mb-1 block">Maintenance Type</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    <option value="Preventive">Preventive (Routine Check)</option>
                    <option value="Corrective">Corrective (Calibration / Adjust)</option>
                    <option value="Breakdown">Breakdown Repair (EMERGENCY)</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-slate-500 mb-1 block">Service Date</label>
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="p-2 border rounded-lg w-full font-mono text-slate-800"
                  />
                </div>

                {/* Technician name */}
                <div>
                  <label className="text-slate-500 mb-1 block">Technician / Vendor Engineer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sutrisno / CV Tehnik"
                    value={maintTechnician}
                    onChange={(e) => setMaintTechnician(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  />
                </div>

                {/* Downtime Hours */}
                <div>
                  <label className="text-slate-500 mb-1 block">Downtime Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 2.5"
                    value={maintDowntime}
                    onChange={(e) => setMaintDowntime(parseFloat(e.target.value) || 0)}
                    className="p-2 border rounded-lg w-full font-mono text-slate-800 bg-white"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="text-slate-500 mb-1 block">Maintenance Cost (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500000"
                    value={maintCost}
                    onChange={(e) => setMaintCost(parseInt(e.target.value) || 0)}
                    className="p-2 border rounded-lg w-full font-mono text-slate-800 bg-white"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-slate-500 mb-1 block">Maintenance Status</label>
                  <select
                    value={maintStatus}
                    onChange={(e) => setMaintStatus(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    <option value="Open">Open (Reported)</option>
                    <option value="In Progress">In Progress (Active Job)</option>
                    <option value="Completed">Completed (Cleared)</option>
                  </select>
                </div>

                {/* Photos */}
                <div>
                  <label className="text-slate-500 mb-1 block">Machine Photo Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. repair_photo.jpg"
                      value={maintPhoto}
                      onChange={(e) => setMaintPhoto(e.target.value)}
                      className="p-2 border rounded-lg flex-1 text-slate-800 bg-white"
                    />
                    <button type="button" className="bg-slate-200 p-2 rounded-lg" title="Simulate Upload">
                      <UploadCloud className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Doc */}
                <div className="md:col-span-2">
                  <label className="text-slate-500 mb-1 block">Supporting Invoice / Checklist Document Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. vendor_quotation_v8.pdf"
                      value={maintDoc}
                      onChange={(e) => setMaintDoc(e.target.value)}
                      className="p-2 border rounded-lg flex-1 text-slate-800 bg-white"
                    />
                    <button type="button" className="bg-slate-200 p-2 rounded-lg" title="Simulate Invoice Attachment">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <label className="text-slate-500 mb-1 block">Full Problem / Maintenance Action Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe failure mode, parts replaced, calibration steps..."
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    className="p-2 border rounded-lg w-full text-slate-800"
                  />
                </div>

                {/* Buttons footer */}
                <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowMaintForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-750 rounded-lg text-white font-bold shadow-sm"
                  >
                    Save Operational Log
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Records Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" id="maint-table">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Factory</th>
                    <th className="p-3">Machine &amp; Class</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Service Date</th>
                    <th className="p-3">Technician</th>
                    <th className="p-3">Downtime / Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Details &amp; Files</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-700">
                  {filteredMaint.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[10.5px] font-black">{m.id}</td>
                      <td className="p-3">
                        <span className="p-1 px-2.5 bg-indigo-50 text-indigo-750 font-bold rounded text-[10px] uppercase">{m.lokasiId}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-800">{m.machineName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{m.machineCategory}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${m.maintenanceType === 'Breakdown' ? 'bg-red-50 text-red-600 border border-red-200' : m.maintenanceType === 'Corrective' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                          {m.maintenanceType}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600">{m.maintenanceDate}</td>
                      <td className="p-3 text-indigo-900 font-bold">{m.technician}</td>
                      <td className="p-3">
                        <div className="text-amber-700 font-extrabold">{m.downtimeHours} Hrs downtime</div>
                        <div className="text-slate-400 font-bold">Rp {m.cost.toLocaleString('id-ID')}</div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleMaintStatus(m.id)}
                          className={`font-black py-0.5 px-2.5 rounded text-[10px] border transition ${m.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : m.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-650 border-red-200'}`}
                        >
                          {m.status}
                        </button>
                      </td>
                      <td className="p-3 space-y-1">
                        <p className="text-[10.5px] leading-relaxed text-slate-500 italic max-w-xs">{m.description}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.photoName && (
                            <span className="bg-slate-100 text-[9px] text-slate-500 py-0.5 px-1.5 rounded flex items-center gap-1 font-mono font-semibold hover:bg-slate-200 cursor-pointer">
                              <Activity className="w-2.5 h-2.5 text-indigo-500" /> {m.photoName}
                            </span>
                          )}
                          {m.docName && (
                            <span className="bg-blue-50 text-[9px] text-blue-600 py-0.5 px-1.5 rounded flex items-center gap-1 font-mono font-semibold hover:bg-blue-105 cursor-pointer">
                              <FileText className="w-2.5 h-2.5 text-blue-500" /> {m.docName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteMaintLog(m.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMaint.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400">No maintenance logs matches current search description.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOD SAFETY & COMPLIANCE GMP AUDITS */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fade-in" id="food-safety-audit-view">
          {/* Header Action controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 shadow-xs">
            <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Standardized GMP / BPOM compliance reports
            </h4>

            <button
              onClick={() => setShowAuditForm(!showAuditForm)}
              className="bg-emerald-650 hover:bg-emerald-750 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-1.5 select-none"
            >
              <Plus className="w-4 h-4" /> Log BPOM / HACCP Incident Report
            </button>
          </div>

          {/* Expand Form */}
          {showAuditForm && (
            <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-md animate-slide-in">
              <div className="flex justify-between items-center pb-3 border-b mb-4">
                <h3 className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Log Regulatory Audit / HACCP Inspection Findings
                </h3>
                <button onClick={() => setShowAuditForm(false)} className="text-slate-400 hover:text-slate-650">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAudit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                {/* Audit Type selection */}
                <div>
                  <label className="text-slate-500 mb-1 block">Audit Standard / Category</label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    <option value="BPOM Audit">BPOM Indonesia Audit</option>
                    <option value="HACCP Audit">HACCP Certification Check</option>
                    <option value="Food Safety Audit">Food Safety Inspection</option>
                    <option value="GMP Audit">GMP (Good Manufacturing) Audit</option>
                    <option value="Internal Audit">Internal QC Quality Review</option>
                    <option value="External Audit">External Retailer Audit</option>
                  </select>
                </div>

                {/* Audit Date */}
                <div>
                  <label className="text-slate-500 mb-1 block">Incident / Audit Date</label>
                  <input
                    type="date"
                    required
                    value={auditDateValue}
                    onChange={(e) => setAuditDateValue(e.target.value)}
                    className="p-2 border rounded-lg w-full font-mono text-slate-800"
                  />
                </div>

                {/* Lead Auditor */}
                <div>
                  <label className="text-slate-500 mb-1 block">Auditor / Quality Assurer Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dra. Sri Utami (BPOM)"
                    value={auditAuditor}
                    onChange={(e) => setAuditAuditor(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  />
                </div>

                {/* Risk Level */}
                <div>
                  <label className="text-slate-500 mb-1 block">Incident Risk Class</label>
                  <select
                    value={auditRisk}
                    onChange={(e) => setAuditRisk(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    <option value="Low">Low Risk (Minor Obs.)</option>
                    <option value="Medium">Medium Risk (OFI)</option>
                    <option value="High">High Risk (Non-Conformity)</option>
                    <option value="Critical">Critical (Immediate Line Stop)</option>
                  </select>
                </div>

                {/* Target due Date */}
                <div>
                  <label className="text-slate-500 mb-1 block">Resolution Due Date</label>
                  <input
                    type="date"
                    required
                    value={auditDueDate}
                    onChange={(e) => setAuditDueDate(e.target.value)}
                    className="p-2 border rounded-lg w-full font-mono text-slate-800"
                  />
                </div>

                {/* PIC */}
                <div>
                  <label className="text-slate-500 mb-1 block">Resolved PIC Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stefanus (Factory Head)"
                    value={auditPIC}
                    onChange={(e) => setAuditPIC(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  />
                </div>

                {/* Upload attachment */}
                <div>
                  <label className="text-slate-500 mb-1 block">Evidence Photo / Document Log</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. bpom_clearance_note_5.pdf"
                      value={auditEvidence}
                      onChange={(e) => setAuditEvidence(e.target.value)}
                      className="p-2 border rounded-lg flex-1 text-slate-800 bg-white"
                    />
                    <button type="button" className="bg-slate-200 p-2 rounded-lg" title="Simulate File upload">
                      <UploadCloud className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-slate-500 mb-1 block">Finding State</label>
                  <select
                    value={auditStatus}
                    onChange={(e) => setAuditStatus(e.target.value)}
                    className="p-2 border rounded-lg w-full font-bold text-slate-800 bg-white"
                  >
                    <option value="Open">Open (Pending Resolution)</option>
                    <option value="Closed">Closed (Resolved &amp; Cleared)</option>
                  </select>
                </div>

                {/* Audit Findings */}
                <div className="md:col-span-3">
                  <label className="text-slate-500 mb-1 block">Non-Conformity Findings Detail</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detail BPOM inspector observations or internal hygiene findings..."
                    value={auditFindings}
                    onChange={(e) => setAuditFindings(e.target.value)}
                    className="p-2 border rounded-lg w-full text-slate-800"
                  />
                </div>

                {/* Corrective Action */}
                <div className="md:col-span-3">
                  <label className="text-slate-500 mb-1 block">Mandated Corrective Action Taken</label>
                  <textarea
                    rows={2}
                    placeholder="E.g. retrained floor workers on sanitation protocols, added bait station, etc..."
                    value={auditCorrective}
                    onChange={(e) => setAuditCorrective(e.target.value)}
                    className="p-2 border rounded-lg w-full text-slate-800"
                  />
                </div>

                {/* Buttons */}
                <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAuditForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-650 hover:bg-emerald-750 text-white rounded-lg font-bold shadow-sm"
                  >
                    Register Audit Finding
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Audit list records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAudits.map(aud => (
              <div key={aud.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-250 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 py-0.5 px-2.5 rounded-full font-bold">
                        {aud.id}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase mt-1 tracking-tight">
                        {aud.auditType}
                      </h4>
                    </div>
                    
                    <button
                      onClick={() => toggleAuditStatus(aud.id)}
                      className={`text-[9.5px] font-black tracking-wider py-1 px-3 border transition rounded-lg uppercase ${aud.status === 'Closed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-600 border-red-250 hover:bg-red-100'}`}
                    >
                      {aud.status}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-650 leading-relaxed">
                    <p className="font-semibold text-slate-800">Observation Findings:</p>
                    <p className="italic text-slate-600 font-medium">"{aud.findings}"</p>
                  </div>

                  {aud.correctiveAction && (
                    <div className="p-3 bg-emerald-50/20 rounded-lg text-xs space-y-1 text-slate-650 border border-emerald-100/40 leading-relaxed">
                      <p className="font-bold text-emerald-850 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Corrective Action Logged:
                      </p>
                      <p className="text-slate-700 font-medium">{aud.correctiveAction}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-semibold">
                    <div className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> Auditor: <span className="font-bold text-slate-700">{aud.auditor}</span></div>
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> PIC: <span className="font-bold text-slate-700">{aud.pic}</span></div>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Inspected: <span className="font-mono text-slate-750">{aud.auditDate}</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Target Due: <span className="font-mono text-slate-750">{aud.dueDate}</span></div>
                    <div className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-slate-400" /> Risk Level: <span className={`font-extrabold ${aud.riskLevel === 'Critical' ? 'text-red-650 animate-pulse' : aud.riskLevel === 'High' ? 'text-orange-500' : 'text-yellow-600'}`}>{aud.riskLevel}</span></div>
                    {aud.evidenceName && (
                      <div className="flex items-center gap-1 font-mono text-indigo-650 hover:underline cursor-pointer">
                        <FileText className="w-3 h-3 text-indigo-550" /> {aud.evidenceName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                  <button
                    onClick={() => deleteAuditLog(aud.id)}
                    className="p-1 px-3 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
