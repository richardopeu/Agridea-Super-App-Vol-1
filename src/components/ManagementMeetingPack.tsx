/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingUp,
  Cpu,
  Users,
  DollarSign,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Mail,
  Sliders,
  Sparkles,
  Download,
  Share2,
  Settings,
  Plus,
  Trash2,
  Check,
  Calendar,
  Layers2,
  Play,
  Briefcase,
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  Clock,
  Printer,
  X,
  FileCheck,
  Eye,
  CheckCircle,
  ThumbsUp,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Props {
  state: any;
  currentUser: {
    id: string;
    username: string;
    role: string;
    lokasiId: string;
    namaLengkap: string;
  };
}

export default function ManagementMeetingPack({ state, currentUser }: Props) {
  // Navigation active tab
  const [activeReportTab, setActiveReportTab] = useState<
    'exec' | 'production' | 'procurement' | 'supplier' | 'yield' | 'inventory' | 'machine' | 'hr' | 'finance' | 'scorecard' | 'board' | 'actions'
  >('exec');

  // Report filters
  const [selectedPeriod, setSelectedPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [selectedRecipientRole, setSelectedRecipientRole] = useState<'Director' | 'HQ Management' | 'Factory Manager' | 'Finance' | 'Procurement' | 'Production'>('Director');
  
  // Action Tracker State
  const [actionItems, setActionItems] = useState([
    { id: 1, task: 'Optimalkan cooling duration di SSP untuk mengurangi moisture loss', owner: 'Rian Hidayat', factory: 'SSP', dueDate: '2026-06-15', status: 'In Progress', progress: 65, feedback: 'Uji coba freezer baru telah disesuaikan.' },
    { id: 2, task: 'Klarifikasi delivery delay CV Pisang Jaya Dampit (SUP-02)', owner: 'Agus Santoso', factory: 'AGDN', dueDate: '2026-06-10', status: 'Open', progress: 10, feedback: 'Menunggu respon surat peringatan ke-1.' },
    { id: 3, task: 'Sertifikasi HACCP mesin vacuum frying line B', owner: 'Citra Dewi', factory: 'MPD', dueDate: '2025-12-20', status: 'Completed', progress: 100, feedback: 'Hasil audit eksternal memuaskan.' },
    { id: 4, task: 'Preventive maintenance tungku goreng nomor #04', owner: 'Eko Wahyudi', factory: 'KKI', dueDate: '2026-06-03', status: 'Overdue', progress: 45, feedback: 'Frying downtime meningkat 3 jam minggu ini.' }
  ]);
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newFactory, setNewFactory] = useState('MPD');
  const [newDueDate, setNewDueDate] = useState('');

  // Email Scheduler state
  const [scheduleTime, setScheduleTime] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');
  const [recipientEmails, setRecipientEmails] = useState('director@agridea.co.id, hq-ops@agridea.co.id');
  const [scheduleSentLog, setScheduleSentLog] = useState<string[]>([]);
  const [isSchedulingSuccess, setIsSchedulingSuccess] = useState(false);

  // Simulated PPTX / PDF export trigger
  const [exportPreviewMode, setExportPreviewMode] = useState<string | null>(null);

  // Add customized action plan item
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask || !newOwner || !newDueDate) return;
    const newItem = {
      id: Date.now(),
      task: newTask,
      owner: newOwner,
      factory: newFactory,
      dueDate: newDueDate,
      status: 'Open',
      progress: 0,
      feedback: 'Belum ada bukti yang diserahkan'
    };
    setActionItems([newItem, ...actionItems]);
    setNewTask('');
    setNewOwner('');
    setNewDueDate('');
  };

  const handleUpdateProgress = (id: number, val: number) => {
    setActionItems(actionItems.map(item => {
      if (item.id === id) {
        const nextProg = Math.min(100, Math.max(0, val));
        const nextStatus = nextProg === 100 ? 'Completed' : nextProg > 0 ? 'In Progress' : 'Open';
        return { ...item, progress: nextProg, status: nextStatus };
      }
      return item;
    }));
  };

  const handleDeleteAction = (id: number) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  // Automated board scheduler Simulation
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = `[SUCCESS] Distribute ${scheduleTime} Board Pack to: [${recipientEmails}] on schedule configuration setup successful.`;
    setScheduleSentLog([newLog, ...scheduleSentLog]);
    setIsSchedulingSuccess(true);
    setTimeout(() => setIsSchedulingSuccess(false), 3000);
  };

  // Colors for Recharts
  const THEME_COLORS = ['#0f172a', '#10b981', '#4f46e5', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="bg-slate-50 min-h-screen p-6 space-y-6" id="meeting-pack-viewport">
      
      {/* Enterprise-Level Banner */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-slate-900 rounded-xl text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Executive Reporting: Management Meeting Pack</h1>
              <p className="text-slate-500 text-xs mt-0.5">Sistem Kompilasi Dewan Direksi Agridea. Penghapusan konsololidasi manual Excel &amp; PowerPoint.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 mt-4 text-[11px] font-bold text-slate-500">
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Period:</span>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value as any)}
                className="bg-transparent border-none outline-none font-extrabold text-slate-900"
              >
                <option value="Daily">Daily Reporting</option>
                <option value="Weekly">Weekly Board Summary</option>
                <option value="Monthly">Monthly Corporate pack</option>
                <option value="Quarterly">Quarterly Audits</option>
                <option value="Yearly">Annual Board Pack</option>
              </select>
            </div>

            <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Recipient Scope:</span>
              <select
                value={selectedRecipientRole}
                onChange={e => setSelectedRecipientRole(e.target.value as any)}
                className="bg-transparent border-none outline-none font-extrabold text-slate-900"
              >
                <option value="Director">Director Overview</option>
                <option value="HQ Management">HQ Operations Management</option>
                <option value="Factory Manager">Factory Manager Suite</option>
                <option value="Finance">Finance &amp; COGS Audit</option>
                <option value="Procurement">Procurement &amp; Supplier Audit</option>
                <option value="Production">Production &amp; Yield Audit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick export suite */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setExportPreviewMode('PPTX')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export PPTX Slide Deck
          </button>
          <button
            onClick={() => setExportPreviewMode('PDF')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" /> Save Board PDF Book
          </button>
          <button
            onClick={() => setExportPreviewMode('XLSX')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Pull Excel Sheet (.xlsx)
          </button>
        </div>
      </div>

      {/* Primary Sidebar Reports navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-slate-700 font-sans">
        
        {/* Navigation panel */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="bg-white border rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider mb-2.5">Report Categories</span>
            <div className="space-y-1">
              {[
                { id: 'exec', label: '1. Executive Summary', icon: Sparkles, color: 'text-indigo-600' },
                { id: 'production', label: '2. Production Performance', icon: Layers, color: 'text-emerald-600' },
                { id: 'procurement', label: '3. Procurement Status', icon: Sliders, color: 'text-slate-700' },
                { id: 'supplier', label: '4. Supplier Scorecard', icon: Award, color: 'text-amber-500' },
                { id: 'yield', label: '5. Yield-Loss Analytics', icon: TrendingUp, color: 'text-emerald-500' },
                { id: 'inventory', label: '6. Live Inventory aging', icon: Layers2, color: 'text-slate-500' },
                { id: 'machine', label: '7. Machine utilization', icon: Cpu, color: 'text-indigo-500' },
                { id: 'hr', label: '8. HR Productivity / Cost', icon: Users, color: 'text-slate-600' },
                { id: 'finance', label: '9. Financial Statement', icon: DollarSign, color: 'text-emerald-600' },
                { id: 'scorecard', label: '10. Factory Scorecard Index', icon: Sliders, color: 'text-amber-600' },
                { id: 'board', label: '11. Automated Board Pack', icon: FileCheck, color: 'text-indigo-600' },
                { id: 'actions', label: '12. Action Plan Tracker', icon: CheckCircle, color: 'text-emerald-600' }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveReportTab(tab.id as any)}
                    className={`w-full text-left p-2.5 font-bold rounded-xl transition flex items-center justify-between border ${
                      activeReportTab === tab.id
                        ? 'bg-slate-950 text-white border-slate-900 shadow-sm'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 shrink-0 ${activeReportTab === tab.id ? 'text-emerald-400' : tab.color}`} />
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900 border border-slate-800 text-slate-300 p-4 rounded-2xl shadow-xs space-y-2">
            <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI Report Generation
            </h4>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Analisis Meeting Pack dibuat dinamis berdasarkan data agregat seluruh cabang. Pergeseran data harian kupasan jeruk, apel, dan pisang mentah akan langsung memicu perubahan visual chart.
            </p>
          </div>
        </div>

        {/* Core content viewport */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[500px]">
          
          {/* 1. EXECUTIVE SUMMARY SECTION */}
          {activeReportTab === 'exec' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">64. EXECUTIVE SUMMARY NOTES ({selectedPeriod})</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Analisis Ringkas Eksekutif Otomatis Direktur Agridea.</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  LEVEL COMPLIANCE: 100%
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 text-slate-705 leading-relaxed text-slate-800 font-sans">
                <span className="font-extrabold text-slate-900 block uppercase tracking-wide text-[10px]">AI Executive Synthesis</span>
                <p>
                  "Kompilasi dewan direksi mengonfirmasi pencapaian volume produksi Agridea Group mencapai **103%** dari target di kuartal berjalan. Kebutuhan procurement mengasapi target rencana awal sebesar **5%** didorong oleh pemulihan jalur pasokan panen Batu. Efisiensi rendemen (yield) kupas kotor rata-rata terkerek **2.3%** di Pabrik MPD. Namun, sirkulasi inventory di gudang KKI mencatatkan tumpukan berlebih melampaui ambang batas aman gudang, sejalan dengan peningkatan durasi pemeliharaan mesin Vacuum Frying di MPD yang memakan tambahan **11 jam** downtime."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase block mb-1">✓ Key Achievements</span>
                  <ul className="space-y-1 text-emerald-950 font-medium">
                    <li>● Target volume produksi nasional melampaui patokan 103%.</li>
                    <li>● Koperasi Tani Batu berhasil mendominasi kualitas kiriman Grade A (87%).</li>
                    <li>● Revenue kotor regional tumbuh konsisten di kisaran 12% MoM.</li>
                  </ul>
                </div>
                
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                  <span className="font-bold text-rose-800 text-[10px] uppercase block mb-1">⚠ Key Challenges</span>
                  <ul className="space-y-1 text-rose-950 font-medium">
                    <li>● Keterlambatan pengiriman CV Pisang Jaya Dampit merugikan SLA transit.</li>
                    <li>● Penumpukan WIP (gudang pembekuan) melebihi batas 8,000 Kg sirkulasi.</li>
                    <li>● Frying maintenance downtime menghambat sirkulasi batch malam.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTION PERFORMANCE SECTION */}
          {activeReportTab === 'production' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">65. PRODUCTION PERFORMANCE REPORT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Analisis Volume Aktual Produksi vs Rencana Kerja.</p>
              </div>

              {/* Dynamic Production tables */}
              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Production Phase</th>
                      <th className="py-2 px-3 text-right">Target (Kg/Batch)</th>
                      <th className="py-2 px-3 text-right">Actual (Kg/Batch)</th>
                      <th className="py-2 px-3 text-right">Variance</th>
                      <th className="py-2 px-3 text-center">Achievement %</th>
                      <th className="py-2 px-3 text-center">Traffic Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                    {[
                      { phase: 'Fresh Fruit (Masukan)', target: 25000, actual: 25750, progress: 'Green' },
                      { phase: 'Peeling (Kupas Bersih)', target: 15250, actual: 15630, progress: 'Green' },
                      { phase: 'Frozen (Pembekuan)', target: 9900, actual: 9801, progress: 'Yellow' },
                      { phase: 'Vacuum Frying (Goreng)', target: 4100, actual: 4220, progress: 'Green' },
                      { phase: 'QC Inspection', target: 4050, actual: 4010, progress: 'Yellow' },
                      { phase: 'Packaging (Kemasan)', target: 3950, actual: 3910, progress: 'Yellow' },
                      { phase: 'Finished Goods (Gudang Jadi)', target: 3900, actual: 3510, progress: 'Red' }
                    ].map((row, idx) => {
                      const achievement = ((row.actual / row.target) * 100);
                      const variance = row.actual - row.target;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.phase}</td>
                          <td className="py-2.5 px-3 text-right">{row.target.toLocaleString('id-ID')}</td>
                          <td className="py-2.5 px-3 text-right">{row.actual.toLocaleString('id-ID')}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {variance >= 0 ? '+' : ''}{variance.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{achievement.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                              row.progress === 'Green' ? 'bg-emerald-100 text-emerald-800' :
                              row.progress === 'Yellow' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {row.progress === 'Green' ? '🟢 Achieved' : row.progress === 'Yellow' ? '🟡 Warning' : '🔴 Critical'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PROCUREMENT SECTION */}
          {activeReportTab === 'procurement' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">66. PROCUREMENT STATUS REPORT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Analisis Pengadaan Bahan Baku Buah Agridea.</p>
              </div>

              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Fruit Variant</th>
                      <th className="py-2 px-3">Preferred Supplier</th>
                      <th className="py-2 px-3 text-right">Target (Kg)</th>
                      <th className="py-2 px-3 text-right">Actual (Kg)</th>
                      <th className="py-2 px-3 text-right">Variance</th>
                      <th className="py-2 px-3 text-right">Ratio %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { fruit: 'Apel Malang', supplier: 'Kope. Tani Makmur Batu', target: 12000, actual: 12450 },
                      { fruit: 'Nangka Kupas', supplier: 'Kope. Tani Makmur Batu', target: 8000, actual: 8400 },
                      { fruit: 'Pisang Mas', supplier: 'CV Pisang Jaya Dampit', target: 15000, actual: 13500 },
                      { fruit: 'Salak Pondoh', supplier: 'Agro Salak Sleman', target: 6000, actual: 6100 }
                    ].map((row, idx) => {
                      const ratio = (row.actual / row.target) * 100;
                      const variance = row.actual - row.target;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.fruit}</td>
                          <td className="py-2.5 px-3">{row.supplier}</td>
                          <td className="py-2.5 px-3 text-right">{row.target.toLocaleString('id-ID')} Kg</td>
                          <td className="py-2.5 px-3 text-right">{row.actual.toLocaleString('id-ID')} Kg</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {variance >= 0 ? '+' : ''}{variance.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black">{ratio.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Simulated Charts for layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-150 p-4 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-slate-800 uppercase block mb-3 text-[10px]">Supplier Volume Contribution %</span>
                  <div className="h-44 text-slate-950">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Kop Tani Batu', value: 20850 },
                            { name: 'CV Pisang Dampit', value: 13500 },
                            { name: 'Agro Salak Sleman', value: 6100 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {THEME_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border border-slate-150 p-4 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-slate-800 uppercase block mb-3 text-[10px]">Monthly Factory Comparsion Trend</span>
                  <div className="h-44 text-slate-950">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={[
                        { name: 'Jan', MPD: 12000, SSP: 10500, KKI: 11000 },
                        { name: 'Feb', MPD: 13500, SSP: 11000, KKI: 12200 },
                        { name: 'Mar', MPD: 14000, SSP: 12500, KKI: 11800 },
                        { name: 'Apr', MPD: 13800, SSP: 14000, KKI: 13900 }
                      ]}>
                        <CartesianGrid stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={9} />
                        <YAxis fontSize={9} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                        <Bar dataKey="MPD" fill="#0f172a" />
                        <Bar dataKey="SSP" fill="#10b981" />
                        <Bar dataKey="KKI" fill="#4f46e5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SUPPLIER PERFORMANCE SHEET */}
          {activeReportTab === 'supplier' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">67. SUPPLIER PERFORMANCE SCORECARD REPORT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Analisis Mitra Pengiriman Supplier &amp; Rekomendasi Alokasi Volume.</p>
              </div>

              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2.5 px-3">Supplier Name</th>
                      <th className="py-2.5 px-3 text-center">Delivery SLA</th>
                      <th className="py-2.5 px-3 text-center">Quality score</th>
                      <th className="py-2.5 px-3 text-center">Yield factor</th>
                      <th className="py-2.5 px-3 text-center">Price Index</th>
                      <th className="py-2.5 px-3 text-center">Overall rating</th>
                      <th className="py-2.5 px-3 text-center">AI Recommendation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { name: 'Koperasi Tani Makmur Batu', delivery: 96, quality: 91, yield: 88, price: 85, rating: 92, action: 'Increase Allocation' },
                      { name: 'Agro Salak Pondoh Sleman', delivery: 100, quality: 95, yield: 96, price: 88, rating: 96, action: 'Maintain Allocation' },
                      { name: 'CV Pisang Jaya Dampit', delivery: 78, quality: 82, yield: 76, price: 95, rating: 84, action: 'Reduce Allocation' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{row.name}</td>
                        <td className="py-3 px-3 text-center">{row.delivery}%</td>
                        <td className="py-3 px-3 text-center">{row.quality}/100</td>
                        <td className="py-3 px-3 text-center">{row.yield}%</td>
                        <td className="py-3 px-3 text-center">{row.price}%</td>
                        <td className="py-3 px-3 text-center font-black">{row.rating} (Grade B+)</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black ${
                            row.action === 'Increase Allocation' ? 'bg-emerald-100 text-emerald-800' :
                            row.action === 'Maintain Allocation' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-rose-100 text-rose-800 pointer'
                          }`}>
                            {row.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. YIELD LOSS SECTION */}
          {activeReportTab === 'yield' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">68. MANUFACTURING YIELD &amp; LOSS REPORT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Log Penyusutan Rendemen Buah dari Input Segar hingga Kemasan Jadi.</p>
              </div>

              {/* Rendemen timeline progress */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-[11px]">
                <div className="bg-slate-100 rounded-xl p-3 border">
                  <span className="font-bold text-slate-400 block uppercase text-[9px]">1. Fresh Input</span>
                  <span className="font-black text-slate-900 block mt-1">100.0%</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Baseline 1,000 Kg</span>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 border">
                  <span className="font-bold text-emerald-600 block uppercase text-[9px]">2. Peeling Kupas</span>
                  <span className="font-black text-slate-900 block mt-1">62.5%</span>
                  <span className="text-[9px] text-rose-600 mt-0.5 block">Loss: 37.5%</span>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 border">
                  <span className="font-bold text-slate-400 block uppercase text-[9px]">3. Frozen WIP</span>
                  <span className="font-black text-slate-900 block mt-1">39.6%</span>
                  <span className="text-[9px] text-rose-600 mt-0.5 block">Loss: 22.9%</span>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 border">
                  <span className="font-bold text-emerald-600 block uppercase text-[9px]">4. Frying Crisps</span>
                  <span className="font-black text-slate-900 block mt-1">26.1%</span>
                  <span className="text-[9px] text-rose-600 mt-0.5 block">Loss: 13.5%</span>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 border">
                  <span className="font-bold text-slate-400 block uppercase text-[9px]">5. QC / Packed</span>
                  <span className="font-black text-slate-900 block mt-1">25.0%</span>
                  <span className="text-[9px] text-rose-600 mt-0.5 block">Loss: 1.1%</span>
                </div>
              </div>

              {/* Yield losses calculations table */}
              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2.5 px-3">Segment Transition</th>
                      <th className="py-2.5 px-3 text-right">Inweight Kg</th>
                      <th className="py-2.5 px-3 text-right">Outweight Kg</th>
                      <th className="py-2.5 px-3 text-right">Loss Kg</th>
                      <th className="py-2.5 px-3 text-right">Loss Ratio %</th>
                      <th className="py-2.5 px-3 text-right">Accl. Yield %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { seg: 'Fresh -> Kupas (Peeling)', in: 1000, out: 625, loss: 375, lossPct: 37.5, accum: 62.5 },
                      { seg: 'Kupas -> Frozen Cold', in: 625, out: 396, loss: 229, lossPct: 36.6, accum: 39.6 },
                      { seg: 'Frozen -> Vacuum Frying', in: 396, out: 261, loss: 135, lossPct: 34.1, accum: 26.1 },
                      { seg: 'Fried -> QC & Packaging', in: 261, out: 250, loss: 11, lossPct: 4.2, accum: 25.0 }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.seg}</td>
                        <td className="py-2.5 px-3 text-right">{row.in} Kg</td>
                        <td className="py-2.5 px-3 text-right">{row.out} Kg</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{row.loss} Kg</td>
                        <td className="py-2.5 px-3 text-right text-rose-500">{row.lossPct}%</td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-950">{row.accum}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. INVENTORY STATUS SECTION */}
          {activeReportTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">69. REAL-TIME WAREHOUSE INVENTORY AGE REPORT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Daftar volume persediaan, umur fisik stock, dan sediaan lambat gerak.</p>
              </div>

              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Inventory Segment</th>
                      <th className="py-2 px-3 text-right">Beginning (Kg)</th>
                      <th className="py-2 px-3 text-right">Incoming (Kg)</th>
                      <th className="py-2 px-3 text-right">Outgoing (Kg)</th>
                      <th className="py-2 px-3 text-right">Ending Qty (Kg)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { seg: 'Fresh Fruit Stock (Sedayu)', begin: 8500, in: 12500, out: 12100, end: 8900, status: 'Healthy' },
                      { seg: 'Frozen Fruit WIP (Mempawah)', begin: 4200, in: 14500, out: 11000, end: 7700, status: 'Surplus Risk' },
                      { seg: 'Chips Bulk Stock (KKI)', begin: 1900, in: 4200, out: 4600, end: 1500, status: 'Low Level' },
                      { seg: 'Finished Goods (Pouch)', begin: 5500, in: 8200, out: 7800, end: 5900, status: 'Healthy' },
                      { seg: 'Packaging boxes / Carton', begin: 12000, in: 25000, out: 24200, end: 12800, status: 'Healthy' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.seg}</td>
                        <td className="py-2.5 px-3 text-right">{row.begin.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-right">{row.in.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-right">{row.out.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-950">{row.end.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            row.status === 'Healthy' ? 'bg-emerald-100 text-emerald-800' :
                            row.status === 'Surplus Risk' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inventory Aging, Slow stock panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-xl bg-indigo-50/20">
                  <span className="font-extrabold text-[10px] uppercase block text-indigo-900 mb-1">📅 Slow Moving &amp; Dead Stock Audit</span>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between">
                      <span>Fruit Frozen over 45 days (Dead Stock):</span>
                      <span className="font-bold text-slate-900">450 Kg (SSP)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WIP Peeling over 30 days:</span>
                      <span className="font-bold text-indigo-800">1,210 Kg</span>
                    </div>
                  </div>
                </div>

                <div className="border p-4 rounded-xl bg-orange-50/20">
                  <span className="font-extrabold text-[10px] uppercase block text-orange-950 mb-1">🤖 AI Inventory Recommendation</span>
                  <p className="text-[11px] leading-relaxed text-orange-900 font-sans font-medium mt-1">
                    "Lakukan over-head transit stok beku sebanyak 1,500 Kg dari Mempawah (MPD) ke Sedayu (SSP) untuk mengurangi penekanan utilisasi freezer lokal sebelum pembusukan berantai terjadi."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. MACHINE PERFORMANCE SECTION */}
          {activeReportTab === 'machine' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">70. MACHINE INTEGRITY &amp; OEE REPORT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Analisis efisiensi OEE (Overall Equipment Effectiveness) mesin frying utama.</p>
              </div>

              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Machine Identity</th>
                      <th className="py-2 px-3">Factory</th>
                      <th className="py-2 px-3 text-right">OEE Index %</th>
                      <th className="py-2 px-3 text-right">Utilization Ratio</th>
                      <th className="py-2 px-3 text-right">Total Downtime</th>
                      <th className="py-2 px-3 text-right">Maintenance Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                    {[
                      { name: 'Vacuum Frying #01', factory: 'MPD', oee: 84.5, util: 92, down: '1.5 Hours', cost: 1250000 },
                      { name: 'Vacuum Frying #02', factory: 'MPD', oee: 82.0, util: 88, down: '3.0 Hours', cost: 1800000 },
                      { name: 'De-stoning Peeler #1', factory: 'SSP', oee: 91.2, util: 95, down: '0.5 Hours', cost: 450000 },
                      { name: 'Spin Dryer Vacuum', factory: 'KKI', oee: 78.5, util: 81, down: '12.5 Hours', cost: 5200000 }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.name}</td>
                        <td className="py-2.5 px-3">{row.factory}</td>
                        <td className="py-2.5 px-3 text-right font-black">{row.oee}%</td>
                        <td className="py-2.5 px-3 text-right">{row.util}%</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{row.down}</td>
                        <td className="py-2.5 px-3 text-right font-mono">Rp {row.cost.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. HR & PAYROLL REPORT VALUE */}
          {activeReportTab === 'hr' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">71. LABOUR COST &amp; PAYROLL AUDIT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Analisis pengupasan borongan harian dan kontribusi tenaga kerja per kilo.</p>
              </div>

              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Factory Node</th>
                      <th className="py-2 px-3 text-center">Attendance Compliance</th>
                      <th className="py-2 px-3 text-right">Labor Cost sum</th>
                      <th className="py-2 px-3 text-right">Overtime Paid</th>
                      <th className="py-2 px-3 text-right">Labor Productivity</th>
                      <th className="py-2 px-3 text-right">Cost Per Kg Fresh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      { node: 'MPD - Mempawah', attend: 98.2, labor: 42100000, ot: 4500000, prod: '45.2 Kg/Man', perKg: 933 },
                      { node: 'SSP - Sedayu', attend: 96.5, labor: 35400000, ot: 2100000, prod: '41.0 Kg/Man', perKg: 863 },
                      { node: 'KKI - Kencana', attend: 94.0, labor: 28900000, ot: 5100000, prod: '38.5 Kg/Man', perKg: 982 }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.node}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{row.attend}%</td>
                        <td className="py-2.5 px-3 text-right font-mono">Rp {row.labor.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-600">Rp {row.ot.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-right">{row.prod}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">Rp {row.perKg} / Kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. FINANCIAL STATEMENTS SECTION */}
          {activeReportTab === 'finance' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">72. FINANCIAL PERFORMANCE STATEMENT</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Laba bersih usaha, margin kotor, dan posisi kas Agridea.</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">National Consolidated Net Cash Position</span>
                  <span className="text-xl font-black text-emerald-400 block mt-1">Rp 1,096,300,000</span>
                </div>
                <div className="flex gap-4">
                  <div className="border-l pl-4 border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-bold">REVENUE YTD</span>
                    <span className="font-mono text-white text-sm font-bold">Rp 4.54B</span>
                  </div>
                  <div className="border-l pl-4 border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-bold">GROSS MARGIN</span>
                    <span className="font-mono text-emerald-400 text-sm font-bold">43.5%</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Financial Row Index</th>
                      <th className="py-2 px-3 text-right">MPD Factory</th>
                      <th className="py-2 px-3 text-right">SSP Factory</th>
                      <th className="py-2 px-3 text-right">KKI Factory</th>
                      <th className="py-2 px-3 text-right bg-slate-50 text-slate-950 font-black">Consolidated Sum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                    {[
                      { row: 'Revenue (Total Penjualan)', mpd: 420000000, ssp: 350000000, kki: 280000000, total: 1050000000, bold: true },
                      { row: 'COGS (Bahan Baku / Procurement)', mpd: 180000000, ssp: 145000000, kki: 121000000, total: 446000000, color: 'text-rose-600' },
                      { row: 'Gross Profit (Laba Kotor)', mpd: 240000000, ssp: 205000000, kki: 159000000, total: 604000000, bg: 'bg-emerald-50/20' },
                      { row: 'Operating Expenses (Gaji / Lapangan)', mpd: 95000000, ssp: 88000000, kki: 74000000, total: 257000000, color: 'text-rose-600' },
                      { row: 'Consolidated Net Profit (Laba Bersih)', mpd: 145000000, ssp: 117000000, kki: 85000000, total: 347000000, bold: true, bg: 'bg-slate-100 block-sum' }
                    ].map((r, idx) => (
                      <tr key={idx} className={`${r.bg || ''} hover:bg-slate-50`}>
                        <td className={`py-2.5 px-3 ${r.bold ? 'font-black text-slate-950' : ''}`}>{r.row}</td>
                        <td className={`py-2.5 px-3 text-right font-mono ${r.color || ''}`}>Rp {r.mpd.toLocaleString('id-ID')}</td>
                        <td className={`py-2.5 px-3 text-right font-mono ${r.color || ''}`}>Rp {r.ssp.toLocaleString('id-ID')}</td>
                        <td className={`py-2.5 px-3 text-right font-mono ${r.color || ''}`}>Rp {r.kki.toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-right bg-slate-50 text-slate-950 font-black font-mono">Rp {r.total.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. FACTORY SCORECARD SUMMARY SECTION */}
          {activeReportTab === 'scorecard' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">73. FACTORY SCORECARD RANKINGS</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Analisis multi-faktor peringkat performa Pabrik Cabang Agridea.</p>
              </div>

              {/* Master rankings banners */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-emerald-800">Best Performance</span>
                  <span className="font-black text-emerald-950 block mt-1">SSP - Sedayu</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-indigo-800">Most Improved</span>
                  <span className="font-black text-indigo-950 block mt-1">MPD - Mempawah</span>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-rose-800">Highest Risk</span>
                  <span className="font-black text-rose-950 block mt-1">KKI - Kencana</span>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 border">
                  <span className="text-[9px] uppercase font-bold text-slate-405">Compliance index</span>
                  <span className="font-black text-slate-900 block mt-1">98.5% (High SLA)</span>
                </div>
              </div>

              {/* Grid dynamic indexes */}
              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2.5 px-3">Factory Code</th>
                      <th className="py-2.5 px-3 text-center">Production Vol</th>
                      <th className="py-2.5 px-3 text-center">Peel Yield</th>
                      <th className="py-2.5 px-3 text-center">Stock Turn</th>
                      <th className="py-2.5 px-3 text-center">Labor cost</th>
                      <th className="py-2.5 px-3 text-center">Machine OEE</th>
                      <th className="py-2.5 px-3 text-center">Compliance</th>
                      <th className="py-2.5 px-3 text-center bg-slate-50 text-slate-900 font-black">Overall Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-center">
                    {[
                      { code: 'SSP (Sedayu)', prod: 'A', yieldScore: 'A', stock: 'B', labor: 'A', machine: 'B', compliance: 'A', overall: 'A (Excellent)' },
                      { code: 'MPD (Mempawah)', prod: 'A', yieldScore: 'B', stock: 'A', labor: 'C', machine: 'C', compliance: 'A', overall: 'B (Good)' },
                      { code: 'KKI (Kencana)', prod: 'B', yieldScore: 'B', stock: 'B', labor: 'A', machine: 'A', compliance: 'B', overall: 'B (Optimal)' },
                      { code: 'AGDN (Agridea)', prod: 'C', yieldScore: 'C', stock: 'C', labor: 'B', machine: 'B', compliance: 'A', overall: 'C (Needs Review)' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-sans">
                        <td className="py-3 px-3 text-left font-black text-slate-950">{row.code}</td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-emerald-150 text-emerald-800 bg-emerald-100">{row.prod}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-emerald-100 text-emerald-800">{row.yieldScore}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-indigo-100 text-indigo-800">{row.stock}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-emerald-100 text-emerald-800">{row.labor}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-indigo-100 text-indigo-800">{row.machine}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-emerald-100 text-emerald-800">{row.compliance}</span>
                        </td>
                        <td className="py-3 px-3 font-extrabold bg-slate-50/50 text-slate-950">{row.overall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. AUTOMATED DECK BUILDER / BOARD MEETING PLAYER PREVIEW */}
          {activeReportTab === 'board' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">76. AUTOMATED BOARD PACK PLAYER</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Sirkulasi dokumen saringan PowerPoint dan PDF eksekutif siap pamer.</p>
                </div>
              </div>

              {/* Slidshow Player Visual box to review PowerPoint deck automatically generated! */}
              <div className="border border-slate-200 rounded-2xl bg-slate-905 overflow-hidden text-slate-100 text-center relative bg-slate-950 p-6 min-h-[290px] flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-slate-450 text-slate-450 border-b border-slate-800 pb-3 mb-2">
                  <span className="font-black text-emerald-400 font-mono">POWERPOINT BOARD DECK GENERATOR (.PPTX)</span>
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded font-bold text-white">4 Slides Loaded</span>
                </div>

                {/* Slides content renders based of local cycle or user selection slider preview */}
                <div className="py-4 space-y-4">
                  <div className="px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl max-w-sm mx-auto text-left shadow-2xl relative space-y-2 font-sans animate-fade-in text-xs">
                    <span className="font-mono text-[9px] text-emerald-400 font-bold block uppercase border-b border-slate-800 pb-2">Slide 1: Cover Page Slide</span>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider block pt-1 leading-normal">
                      AGRIDEA MEETING DECK - {selectedPeriod} REVIEW
                    </h2>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Diterbitkan otomatis pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold">Agridea Corporate Board Platform</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                  <div className="flex gap-2 text-[9px] text-slate-400 font-bold">
                    <span>✓ Dynamic Covers</span>
                    <span>✓ Real charts Compiled</span>
                    <span>✓ AI text bundled</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-black">Ready for Immediate board projection</span>
                </div>
              </div>

              {/* Scheduled report distribution module */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span className="font-black text-slate-900 border-b border-indigo-600">78. Scheduled Report Distribution Setup</span>
                </div>

                <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Distribution Schedule</label>
                    <select
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none text-slate-900"
                    >
                      <option value="Daily">Distribution Daily (07:00 WIB)</option>
                      <option value="Weekly">Distribution Weekly (Monday 08:00 WIB)</option>
                      <option value="Monthly">Distribution Monthly (1st Day of Month)</option>
                      <option value="Quarterly">Distribution Quarterly Board Schedule</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Recipients List</label>
                    <input
                      type="text"
                      value={recipientEmails}
                      onChange={e => setRecipientEmails(e.target.value)}
                      placeholder="Enter emails..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Activate Automatic Mailer
                  </button>
                </form>

                {isSchedulingSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold border border-emerald-250 animate-bounce">
                    ✓ Board distribution cron trigger successfully registered in Agridea HQ Mail-server!
                  </div>
                )}

                {/* Sent log list */}
                {scheduleSentLog.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">History Log Setup</span>
                    <div className="bg-slate-100 p-2 text-[10px] text-slate-600 font-mono rounded max-h-24 overflow-y-auto">
                      {scheduleSentLog.map((log, idx) => (
                        <div key={idx} className="truncate">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 12. ACTION PLAN TRACKER SECTION */}
          {activeReportTab === 'actions' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">79. ACTION PLAN TRACKER</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Konversi rekomendasi rapat dewan direksi menjadi target penugasan operasional konkret.</p>
              </div>

              {/* Summary counters */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <span className="text-lg font-black text-emerald-800">{actionItems.filter(i => i.status === 'Completed').length}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-700 block mt-0.5">Completed Actions</span>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <span className="text-lg font-black text-orange-850">{actionItems.filter(i => i.status === 'In Progress' || i.status === 'Open').length}</span>
                  <span className="text-[9px] uppercase font-bold text-orange-800 block mt-0.5">Open Actions</span>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                  <span className="text-lg font-black text-rose-800">{actionItems.filter(i => i.status === 'Overdue').length}</span>
                  <span className="text-[9px] uppercase font-bold text-rose-700 block mt-0.5">Overdue Action alert</span>
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddAction} className="bg-slate-50 border rounded-2xl p-4 space-y-3">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Create New Meeting Action Item Task</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Task description..."
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    className="md:col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-800"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Owner PIC Name..."
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-800"
                  />
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-800 text-slate-800 cursor-pointer text-xs"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <label className="text-[10px] font-bold text-slate-400">Target Factory:</label>
                    <select
                      value={newFactory}
                      onChange={e => setNewFactory(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="MPD">MPD (Mempawah)</option>
                      <option value="SSP">SSP (Sedayu)</option>
                      <option value="KKI">KKI (Kencana)</option>
                      <option value="AGDN">AGDN (HQ)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-800 text-[11px] transition inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Delegate Action Task
                  </button>
                </div>
              </form>

              {/* Table list of action items */}
              <div className="overflow-x-auto text-[11px] text-slate-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-100 font-bold text-slate-500">
                      <th className="py-2 px-3">Objective &amp; Task</th>
                      <th className="py-2 px-3">PIC Owner</th>
                      <th className="py-2 px-3 text-center">Branch</th>
                      <th className="py-2 px-3 text-center">Due Date</th>
                      <th className="py-2 px-3 text-center">Progress %</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Action Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {actionItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block leading-tight">{item.task}</span>
                          <span className="text-[10px] text-slate-400 font-bold italic mt-0.5 block">Evidence/Notes: {item.feedback}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{item.owner}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-950">{item.factory}</td>
                        <td className="py-3 px-3 text-center">{item.dueDate}</td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.progress}
                            onChange={e => handleUpdateProgress(item.id, parseInt(e.target.value))}
                            className="bg-transparent border rounded text-center w-12 py-0.5 font-bold outline-none text-slate-850"
                          /> %
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800' :
                            item.status === 'Overdue' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>{item.status}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteAction(item.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Simulated Export Popup Modal */}
      {exportPreviewMode && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setExportPreviewMode(null)}
        >
          <div 
            className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 text-xs font-sans"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">{exportPreviewMode} File Generator Output</h3>
              </div>
              <button onClick={() => setExportPreviewMode(null)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3.5 leading-relaxed text-slate-705">
              <span className="font-bold text-slate-805 text-emerald-600 block uppercase text-[10px]">SUCCESSFULLY GENERATED FOR DECON / PROJECTION</span>
              
              {exportPreviewMode === 'PPTX' && (
                <p>
                  "PowerPoint format pack generated. Contains loaded slides for cover pages, KPI dashboards, live production variance charts, risk audits, and recommended supplier alocations without any manual adjustment required."
                </p>
              )}

              {exportPreviewMode === 'PDF' && (
                <p>
                  "Executive PDF package created. Document is correctly sized to 1-Page limits, with visual charts, labor compliance rates, and complete factory scorecard rankings formatted."
                </p>
              )}

              {exportPreviewMode === 'XLSX' && (
                <p>
                  "Real-time corporate spreadsheets pulled. Direct sheet bindings mapping fresh fruit, peeling, frozen WIP volume, OEE machine scores, and cost audits outputted."
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setExportPreviewMode(null)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold transition"
              >
                Download Compiled Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
