/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, UserPlus, Factory, AlertCircle, CheckCircle, Shield } from 'lucide-react';

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

    // Verify password: users without an explicit password hashed can use 'pabrik123'
    const storedHash = targetUser.passwordHash || targetUser.passHash || simpleHash(targetUser.pass || 'pabrik123');
    const enteredHash = simpleHash(password || 'pabrik123');

    if (storedHash !== enteredHash) {
      setSignInError('Password salah. Silakan coba lagi.');
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

  // Pre-configured demo accounts for QA & evaluation
  const DEMO_ACCOUNTS = [
    { label: 'Richard P (Direktur HQ)', username: 'richard_admin', role: 'Kepala Pabrik HQ' },
    { label: 'Budi H (Branch Mgr MLC)', username: 'budi_malang', role: 'Kepala Pabrik Cabang' },
    { label: 'Dian S (Quality Control)', username: 'dian_qc', role: 'QC' },
    { label: 'Siti A (Prod Operator)', username: 'siti_peeler', role: 'Kupas' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" id="login-container">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6" id="login-card">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
            <Factory className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">Agridea Manufacturing Control</h2>
          <p className="text-xs text-slate-400 font-medium">Enterprise Resource Planning &amp; Chips Tracing App</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800" id="login-tabs">
          <button
            onClick={() => { setActiveTab('signin'); setSignInError(''); }}
            className={`flex-1 pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
              activeTab === 'signin'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <LogIn className="w-3.5 h-3.5" /> Masuk
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setSignUpError(''); setSignUpSuccess(false); }}
            className={`flex-1 pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
              activeTab === 'signup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Daftar Akun
            </span>
          </button>
        </div>

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs" id="signin-form">
            {signInError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-emerald-500 rounded-lg p-2.5 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-emerald-500 rounded-lg p-2.5 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                placeholder="Masukkan password (default: pabrik123)"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-emerald-600/10 text-xs font-sans mt-2"
            >
              Sign In ke Dashboard
            </button>

            {/* Quick Demo Accounts Selection */}
            <div className="pt-4 border-t border-slate-900">
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" /> Quick Login Simulasi (Ganti Akun Demo):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setUsername(acc.username);
                      setPassword('pabrik123');
                    }}
                    className="p-2 border border-slate-800 hover:border-slate-700 rounded-lg text-left bg-slate-900 text-slate-300 hover:bg-slate-850/50 transition-all"
                  >
                    <p className="font-bold text-[10px] text-white leading-tight truncate">{acc.label}</p>
                    <p className="text-[9px] text-slate-550 truncate font-mono">@{acc.username}</p>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs" id="signup-form">
            {signUpSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-start gap-2 leading-relaxed">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Registrasi Berhasil!</p>
                  <p className="mt-0.5 text-slate-350 text-[10px]">Pendaftaran akun Anda telah diteruskan ke Direktur HQ. Silakan menunggu persetujuan (approval) agar akun dapat diaktifkan.</p>
                </div>
              </div>
            )}

            {signUpError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="font-semibold text-slate-300 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={signUpModel.fullName}
                  onChange={(e) => setSignUpModel({ ...signUpModel, fullName: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-white placeholder-slate-550 focus:ring-emerald-500 rounded-lg p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="Budi Tjandra"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Username</label>
                <input
                  type="text"
                  value={signUpModel.username}
                  onChange={(e) => setSignUpModel({ ...signUpModel, username: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-white placeholder-slate-550 focus:ring-emerald-500 rounded-lg p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="username_mfg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Email Kantor</label>
                <input
                  type="email"
                  value={signUpModel.email}
                  onChange={(e) => setSignUpModel({ ...signUpModel, email: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-white placeholder-slate-550 focus:ring-emerald-500 rounded-lg p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="budi@agridea.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Password</label>
                <input
                  type="password"
                  value={signUpModel.password}
                  onChange={(e) => setSignUpModel({ ...signUpModel, password: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-white placeholder-slate-550 focus:ring-emerald-500 rounded-lg p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="Min. 6 karakter"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Konfirmasi Password</label>
                <input
                  type="password"
                  value={signUpModel.confirmPassword}
                  onChange={(e) => setSignUpModel({ ...signUpModel, confirmPassword: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-white placeholder-slate-550 focus:ring-emerald-500 rounded-lg p-2 w-full outline-none focus:border-emerald-500 transition-all font-sans"
                  placeholder="Ulangi password"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Role / Jabatan</label>
                <select
                  value={signUpModel.role}
                  onChange={(e) => setSignUpModel({ ...signUpModel, role: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 w-full font-sans cursor-pointer focus:border-emerald-500"
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

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Lokasi Tugas Pabrik</label>
                <select
                  value={signUpModel.lokasiId}
                  onChange={(e) => setSignUpModel({ ...signUpModel, lokasiId: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 w-full font-sans cursor-pointer focus:border-emerald-500"
                >
                  {lokasi.map(l => (
                    <option key={l.id} value={l.id}>{l.nama.replace('Pabrik ', '')}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-emerald-600/10 text-xs font-sans mt-2"
            >
              Ajukan Pendaftaran Akun
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
