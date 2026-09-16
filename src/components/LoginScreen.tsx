/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Factory, 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Lock, 
  Brain, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  Layers, 
  Truck
} from 'lucide-react';

interface LoginScreenProps {
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  pendingUsers: any[];
  setPendingUsers: React.Dispatch<React.SetStateAction<any[]>>;
  lokasi: any[];
  onLogin: (user: any) => void;
}

// A simple deterministic hash helper to represent secure password hashing
function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

export default function LoginScreen({
  users,
  setUsers,
  pendingUsers,
  setPendingUsers,
  lokasi,
  onLogin
}: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Forced password change states
  const [forcingUser, setForcingUser] = useState<any | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sign Up inputs
  const [signUpModel, setSignUpModel] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Production Operator',
    lokasiId: 'JKT'
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password minimal 8 karakter.';
    if (!/[A-Z]/.test(pwd)) return 'Password harus memiliki minimal 1 huruf besar (uppercase).';
    if (!/[a-z]/.test(pwd)) return 'Password harus memiliki minimal 1 huruf kecil (lowercase).';
    if (!/[0-9]/.test(pwd)) return 'Password harus memiliki minimal 1 angka.';
    return null;
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    if (!forcingUser) return;

    // verify current password
    const storedHash = forcingUser.passwordHash || forcingUser.passHash || simpleHash(forcingUser.pass || 'pabrik123');
    const enteredCurrentHash = simpleHash(currentPassword);
    if (storedHash !== enteredCurrentHash) {
      setSignInError('Password saat ini salah.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSignInError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const validationMsg = validatePassword(newPassword);
    if (validationMsg) {
      setSignInError(validationMsg);
      return;
    }

    // Success! Update password in users state
    const updatedUser = {
      ...forcingUser,
      passwordHash: simpleHash(newPassword),
      needsPasswordChange: false,
    };
    delete updatedUser.pass; // remove raw password

    setUsers(prev => prev.map(u => u.username.toLowerCase() === forcingUser.username.toLowerCase() ? updatedUser : u));
    
    // Reset state & log in
    setForcingUser(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onLogin(updatedUser);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const targetUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!targetUser) {
      setSignInError('Username tidak ditemukan.');
      return;
    }

    if (targetUser.status !== 'active' && targetUser.status !== 'Active') {
      setSignInError('Akun Anda dinonaktifkan atau masih menunggu persetujuan Direktur HQ.');
      return;
    }

    // Verify password
    const storedHash = targetUser.passwordHash || targetUser.passHash || simpleHash(targetUser.pass || 'pabrik123');
    const enteredHash = simpleHash(password || 'pabrik123');

    if (storedHash !== enteredHash) {
      setSignInError('Password salah. Silakan coba lagi.');
      return;
    }

    // If initial user needs password change
    if (targetUser.needsPasswordChange) {
      setForcingUser(targetUser);
      return;
    }

    // Successful login!
    onLogin(targetUser);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpSuccess(false);

    if (!signUpModel.fullName || !signUpModel.username || !signUpModel.email || !signUpModel.password) {
      setSignUpError('Semua field wajib diisi.');
      return;
    }

    if (signUpModel.password !== signUpModel.confirmPassword) {
      setSignUpError('Konfirmasi password tidak cocok.');
      return;
    }

    const usernameExists = users.some(u => u.username.toLowerCase() === signUpModel.username.trim().toLowerCase()) ||
                           pendingUsers.some(u => u.username.toLowerCase() === signUpModel.username.trim().toLowerCase());
    
    if (usernameExists) {
      setSignUpError('Username sudah digunakan.');
      return;
    }

    // Register user with pending_approval status
    const newPendingUser = {
      id: 'USR-' + (users.length + pendingUsers.length + 200),
      username: signUpModel.username.trim(),
      passwordHash: simpleHash(signUpModel.password),
      namaLengkap: signUpModel.fullName.trim(),
      role: signUpModel.role,
      lokasiId: signUpModel.lokasiId,
      status: 'pending_approval',
      email: signUpModel.email.trim()
    };

    setPendingUsers(prev => [...prev, newPendingUser]);
    setSignUpSuccess(true);
    
    // Reset Sign Up Form
    setSignUpModel({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Production Operator',
      lokasiId: 'JKT'
    });
  };

  const DEMO_ACCOUNTS = [
    { label: 'Richard P (Direktur HQ)', username: 'richard_admin', role: 'Kepala Pabrik HQ' },
    { label: 'Budi H (Branch Mgr MLC)', username: 'budi_malang', role: 'Kepala Pabrik Cabang' },
    { label: 'Dian S (Quality Control)', username: 'dian_qc', role: 'QC' },
    { label: 'Siti A (Prod Operator)', username: 'siti_peeler', role: 'Kupas' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-xs selection:bg-green-100 selection:text-green-800" id="login-container">
      {/* LEFT ASPECT: Visual Showcase & Premium Info Desk */}
      <div className="md:w-7/12 bg-[#0F172A] relative overflow-hidden flex flex-col justify-between p-8 md:p-16 text-white" id="login-visual-showcase">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
        
        {/* Top Branding Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20 ring-1 ring-white/10 shrink-0">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-display uppercase tracking-wider text-green-400">AGRIDEA</h1>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Manufacturing Intelligence System</p>
          </div>
        </div>

        {/* Content Showcase Mid Section */}
        <div className="relative z-10 my-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 font-semibold font-mono text-[10px]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI-Powered Industry 4.0 Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight font-display text-white">
            Agridea Manufacturing <span className="text-green-400">Control App</span>
          </h2>
          <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
            Sistem cerdas integrator harian yang memadukan data pengadaan bahan baku, manajemen batch produksi keripik buah, pelacakan QC berkala, akuntansi closing balance, hingga monitoring utilisasi mesin.
          </p>

          {/* Structured Widgets showing live stats of Factory, Supply Chain, and AI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Factory Yield Rate</span>
                <Activity className="w-4 h-4 text-green-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono tracking-tight text-white">76.8%</span>
                <span className="text-[10px] text-green-400 font-semibold font-mono">↑ 4.2%</span>
              </div>
              <p className="text-[10px] text-slate-400">Rata-rata rendemen kupas & frying terintegrasi.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Supply Chain Tracking</span>
                <Truck className="w-4 h-4 text-green-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono tracking-tight text-white">100% Verified</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
              </div>
              <p className="text-[10px] text-slate-400">Ketertelusuran barcode log buah dari vendor ke toko.</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="relative z-10 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-6">
          <span>2026 PT AGRITEK DESA INDONESIA. All rights reserved.</span>
          <span className="font-mono text-green-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 inline" /> Secure Access Layer
          </span>
        </div>
      </div>

      {/* RIGHT ASPECT: Modern Sign In Card Column */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12" id="login-form-area">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] shadow-xl shadow-slate-100 rounded-2xl p-8 space-y-6" id="login-card">
          
          {forcingUser ? (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs" id="force-password-change-form">
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-4 h-4 text-amber-600" />
                  First Login Force Password Change
                </div>
                <p className="text-[10px] leading-relaxed text-amber-800">Sebagai administrator baru, Anda wajib memperbarui password awal demi keamanan akses seluruh instrumen ERP cabang.</p>
              </div>

              {signInError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signInError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block text-xs">Password Saat Ini *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-11"
                  placeholder="Password bawaan Anda"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block text-xs">Password Baru *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-11"
                  placeholder="Password kuat minimal 8 karakter"
                  required
                />
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-normal space-y-1">
                  <p className="font-bold text-slate-700">Persyaratan Password Baru:</p>
                  <div className="grid grid-cols-2 gap-y-1">
                    <div className="flex items-center gap-1">• Min. 8 Karakter</div>
                    <div className="flex items-center gap-1">• 1+ Huruf Besar (A-Z)</div>
                    <div className="flex items-center gap-1">• 1+ Huruf Kecil (a-z)</div>
                    <div className="flex items-center gap-1">• 1+ Angka (0-9)</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block text-xs">Ulangi Password Baru *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-11"
                  placeholder="Ketik ulang password baru Anda"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md shadow-green-600/15 text-xs font-sans mt-2 cursor-pointer h-11"
              >
                Simpan &amp; Masuk ke Applet
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setForcingUser(null);
                  setSignInError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-full bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-semibold py-2.5 rounded-lg transition-all text-xs font-sans cursor-pointer"
              >
                Batal
              </button>
            </form>
          ) : (
            <>
              {/* Modern Auth Tab Indicators */}
              <div className="text-center space-y-1.5">
                <div className="text-slate-500 uppercase font-bold tracking-widest text-[9px]">Aplikasi Kendali Pabrik</div>
                <h3 className="text-xl font-bold font-display text-slate-900">Sign In ke Dashboard</h3>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg" id="login-tabs">
                <button
                  onClick={() => { setActiveTab('signin'); setSignInError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-md text-center transition-all cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5" /> Masuk
                  </span>
                </button>
                <button
                  onClick={() => { setActiveTab('signup'); setSignUpError(''); setSignUpSuccess(false); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-md text-center transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" /> Daftar Akun
                  </span>
                </button>
              </div>

              {/* TAB 1: SIGN IN FORM */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4" id="signin-form">
                  {signInError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signInError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-3 w-full outline-none transition-all font-sans text-xs h-11"
                      placeholder="Masukkan nama pengguna"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-3 w-full outline-none transition-all font-sans text-xs h-11"
                      placeholder="Masukkan password akun"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-green-600/10 text-xs font-sans mt-2 cursor-pointer h-11"
                  >
                    Masuk ke Sistem Controls
                  </button>

                  {/* PRESET INTEGRATED DEMO USERS AREA FOR RAPID TESTING/SIMULATION */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-600 shrink-0" /> Evaluator Quick Login:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setUsername(acc.username);
                            setPassword('pabrik123');
                          }}
                          className="p-2 border border-[#E2E8F0] hover:border-green-300 rounded-lg text-left bg-[#F8FAFC] hover:bg-green-50/20 transition-all cursor-pointer"
                        >
                          <p className="font-bold text-[10px] text-slate-800 leading-tight truncate">{acc.label}</p>
                          <p className="text-[9px] text-slate-400 truncate font-mono mt-0.5">@{acc.username}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: SIGN UP FORM */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4" id="signup-form">
                  {signUpSuccess && (
                    <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                      <div>
                        <p className="font-bold text-green-950">Pengajuan Berhasil!</p>
                        <p className="mt-0.5 text-slate-600 text-[10px]">Permohonan akun Anda telah masuk ke antrean persetujuan Direktur HQ. Hubungi admin untuk mengaktifkan akun secara instan.</p>
                      </div>
                    </div>
                  )}

                  {signUpError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signUpError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="font-semibold text-slate-700 block">Nama Lengkap</label>
                      <input
                        type="text"
                        value={signUpModel.fullName}
                        onChange={(e) => setSignUpModel({ ...signUpModel, fullName: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-10"
                        placeholder="e.g. Richard Prabowo"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Username</label>
                      <input
                        type="text"
                        value={signUpModel.username}
                        onChange={(e) => setSignUpModel({ ...signUpModel, username: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-10"
                        placeholder="username_mfg"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Email Kantor</label>
                      <input
                        type="email"
                        value={signUpModel.email}
                        onChange={(e) => setSignUpModel({ ...signUpModel, email: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-10"
                        placeholder="richard@agridea.com"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Password</label>
                      <input
                        type="password"
                        value={signUpModel.password}
                        onChange={(e) => setSignUpModel({ ...signUpModel, password: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-10"
                        placeholder="Min. 8 karakter"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Konfirmasi Password</label>
                      <input
                        type="password"
                        value={signUpModel.confirmPassword}
                        onChange={(e) => setSignUpModel({ ...signUpModel, confirmPassword: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs h-10"
                        placeholder="Ketik ulang password"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Role / Jabatan</label>
                      <select
                        value={signUpModel.role}
                        onChange={(e) => setSignUpModel({ ...signUpModel, role: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs cursor-pointer h-10"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Direktur HQ">HQ Director (Direktur HQ)</option>
                        <option value="HQ Admin">HQ Admin</option>
                        <option value="HQ Production">HQ Production</option>
                        <option value="HQ Finance">HQ Finance</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Branch Admin">Branch Admin</option>
                        <option value="Branch Finance">Branch Finance</option>
                        <option value="QC">QC Inspector</option>
                        <option value="Warehouse">Warehouse Staff</option>
                        <option value="Purchasing">Purchasing Staff</option>
                        <option value="Production Operator">Production Operator</option>
                        <option value="Packaging Operator">Packaging Operator</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Lokasi Tugas Utama</label>
                      <select
                        value={signUpModel.lokasiId}
                        onChange={(e) => setSignUpModel({ ...signUpModel, lokasiId: e.target.value })}
                        className="bg-white border border-[#E2E8F0] text-slate-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 rounded-lg p-2.5 w-full outline-none transition-all font-sans text-xs cursor-pointer h-10"
                      >
                        {lokasi.map(l => (
                          <option key={l.id} value={l.id}>{l.nama.replace('Pabrik ', '')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-green-600/10 text-xs font-sans mt-2 cursor-pointer h-11"
                  >
                    Ajukan Pendaftaran Baru
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
