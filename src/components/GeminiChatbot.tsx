/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Brain,
  Sparkles,
  Send,
  Globe,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  fallbackNotice?: string | null;
  isQuotaError?: boolean;
  failedQuery?: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    searchChunks?: Array<{ title: string; uri: string }>;
  } | null;
}

type SupportedModel = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'gemini-3.1-pro-preview';

interface RolePreset {
  id: string;
  title: string;
  icon: string;
  description: string;
  instruction: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'operations',
    title: 'Industrial Operations & Yield Specialist',
    icon: '🏭',
    description: 'Expert on vacuum frying parameters, peeling yield loss, batch scheduling, and OEE.',
    instruction: 'You are the Chief Industrial Operations & Yield Specialist for Agridea Manufacturing. You specialize in fruit and vegetable vacuum frying processes, peeling yield optimization, temperature control, and factory production scheduling. Always provide practical, data-driven, step-by-step guidance.'
  },
  {
    id: 'finance',
    title: 'Senior Financial & COGS/HPP Auditor',
    icon: '💰',
    description: 'Specialist in Bill of Materials, raw material variance, margin simulations, and unit costing.',
    instruction: 'You are the Senior Manufacturing Financial Controller & Cost Accounting Auditor for Agridea. You specialize in COGS/HPP variance analysis, raw material price fluctuations (fruit, cooking oil, LPG, packaging), and gross margin optimization. Provide structured calculations and financial insights.'
  },
  {
    id: 'agri_supply',
    title: 'Agri-Sourcing & Supply Chain Strategist',
    icon: '🚜',
    description: 'Focused on farmer partner relations, fruit seasonality, logistics routes, and procurement.',
    instruction: 'You are the Agricultural Sourcing & Supply Chain Director for Agridea. You specialize in Indonesian fruit crop harvests (Batu Apples, Dampit Jackfruits, Pasuruan Salak, Semeru Bananas), post-harvest moisture levels, and multi-factory logistics routing.'
  },
  {
    id: 'maintenance',
    title: 'Equipment SRE & Predictive Maintenance',
    icon: '🛠️',
    description: 'Advises on vacuum pump seals, oil filtration cycles, burner efficiency, and downtime prevention.',
    instruction: 'You are the Senior Reliability & Predictive Maintenance Engineer for Agridea. You specialize in vacuum frying machinery maintenance, oil degradation prevention, vacuum pump pressure seals, and preventing machine breakdowns.'
  },
  {
    id: 'compliance',
    title: 'Food Safety, HACCP & Halal Auditor',
    icon: '📋',
    description: 'Ensures strict compliance with BPOM, Halal Indonesia, HACCP, and ISO 22000 hygiene standards.',
    instruction: 'You are the Senior Food Safety & Regulatory Compliance Lead for Agridea. You ensure all factory operations adhere to HACCP critical control points, BPOM hygiene standards, Halal certification, and proper product labeling.'
  }
];

interface GeminiChatbotProps {
  state?: any;
  currentUser?: any;
  defaultRole?: string;
  initialPrompt?: string;
  compact?: boolean;
}

export default function GeminiChatbot({
  state,
  currentUser,
  defaultRole = 'operations',
  initialPrompt,
  compact = false
}: GeminiChatbotProps) {
  // Model selection:
  // gemini-3.1-pro-preview for complex tasks
  // gemini-3.5-flash for general tasks (and required for Search Grounding)
  // gemini-3.1-flash-lite for fast tasks
  const [selectedModel, setSelectedModel] = useState<SupportedModel>('gemini-3.5-flash');
  
  // Search Grounding toggle (uses gemini-3.5-flash with googleSearch tool)
  const [enableSearchGrounding, setEnableSearchGrounding] = useState<boolean>(true);

  // Role / System instruction
  const [selectedRoleId, setSelectedRoleId] = useState<string>(defaultRole);
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `**Halo ${currentUser?.namaLengkap || 'Rekan Agridea'}!** 👋\n\nSaya adalah **Gemini AI Industrial Copilot** untuk Agridea Manufacturing Intelligence Platform.\n\nSistem dilengkapi model berkecepatan tinggi & handal (**Gemini 3.5 Flash** dan **Gemini 3.1 Flash Lite** dengan perlindungan kuota otomatis), serta **Google Search Grounding** untuk validasi harga komoditas terkini secara faktual.\n\nApa yang ingin Anda konsultasikan atau analisis hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>(initialPrompt || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRole = ROLE_PRESETS.find(r => r.id === selectedRoleId) || ROLE_PRESETS[0];
  const effectiveInstruction = customInstruction.trim() || activeRole.instruction;

  // Auto-scroll to bottom of thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Extract live system summary context to ground responses in actual app state
  const liveSystemContext = React.useMemo(() => {
    if (!state) return 'No live system data provided.';
    try {
      const activeBatches = (state.batches || []).slice(0, 5).map((b: any) => ({
        id: b.id,
        varian: b.varianBuah,
        status: b.status,
        yield: b.yieldPercent
      }));
      const lowStocks = (state.stocks || []).filter((s: any) => (s.qty || s.stok || 0) < 500).slice(0, 6);
      const factories = (state.lokasi || []).map((l: any) => l.nama);
      
      return {
        activeUser: currentUser?.namaLengkap || currentUser?.username || 'Staff',
        userRole: currentUser?.role || 'Operational Staff',
        factories,
        sampleActiveBatches: activeBatches,
        criticalStockAlerts: lowStocks.map((s: any) => `${s.namaItem || s.key}: ${s.qty || s.stok || 0} ${s.satuan || 'Kg/Pcs'}`),
        totalBatchesRecorded: state.batches?.length || 0,
        totalSalesVolume: state.sales?.length || 0
      };
    } catch (e) {
      return 'Error extracting context.';
    }
  }, [state, currentUser]);

  const handleSendMessage = async (
    queryToSend?: string,
    overrideModel?: SupportedModel,
    overrideGrounding?: boolean
  ) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const activeModel = overrideModel || selectedModel;
    const activeGrounding = overrideGrounding !== undefined ? overrideGrounding : enableSearchGrounding;

    setInputQuery('');
    setErrorMsg(null);

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Build conversation payload for server API
      // Maps existing messages to { role: 'user' | 'assistant', content: string }
      const historyPayload = updatedHistory
        .filter(m => m.content.trim() && !m.isQuotaError)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: activeGrounding ? 'gemini-3.5-flash' : activeModel,
          systemInstruction: effectiveInstruction,
          enableSearchGrounding: activeGrounding,
          contextData: liveSystemContext
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Tidak ada balasan dari Gemini.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || activeModel,
        fallbackNotice: data.fallbackNotice || null,
        groundingMetadata: data.groundingMetadata || null
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Gemini Chat Error:', err);
      const rawMsg = String(err.message || '');
      const isQuota = rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('limit');
      const is503 = rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('unavailable');

      let cleanMsg = rawMsg;
      try {
        if (rawMsg.includes('{') && rawMsg.includes('}')) {
          const jsonStart = rawMsg.indexOf('{');
          const jsonEnd = rawMsg.lastIndexOf('}');
          const parsed = JSON.parse(rawMsg.slice(jsonStart, jsonEnd + 1));
          cleanMsg = parsed?.error?.message || cleanMsg;
        }
      } catch {}

      let friendlyText = '';
      if (isQuota) {
        friendlyText = `⚠️ **Batas Kuota Model Terlampaui (429 Quota Exceeded)**\n\nModel yang dipilih sedang mencapai batas kuota gratis. Jangan khawatir, Anda dapat langsung mengklik tombol di bawah untuk beralih ke **Gemini 3.1 Flash Lite** yang memiliki kuota berlimpah dan respon ultra cepat!`;
      } else if (is503) {
        friendlyText = `⚠️ **Model AI Sedang Mengalami Lonjakan Permintaan (503 Service Unavailable)**\n\nServer model AI (${activeModel}) sedang mengalami lonjakan beban trafik sementara di Google Cloud. Silakan klik tombol di bawah untuk mencoba kembali dengan **Gemini 3.1 Flash Lite** yang lebih stabil dan bebas antrean!`;
      } else {
        friendlyText = `⚠️ **Terjadi kendala saat memproses permintaan:**\n\n${cleanMsg || 'Koneksi terputus.'}\n\n*Silakan coba kembali atau gunakan Gemini 3.1 Flash Lite.*`;
      }

      setErrorMsg(friendlyText);
      
      // Add error notice in chat with retry action
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          role: 'assistant',
          content: friendlyText,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isQuotaError: true,
          failedQuery: text
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Bersihkan riwayat percakapan ini?')) {
      setMessages([
        {
          id: 'reset-' + Date.now(),
          role: 'assistant',
          content: `Riwayat percakapan telah dibersihkan. Role aktif: **${activeRole.title}**. Model: **${enableSearchGrounding ? 'gemini-3.5-flash (Google Search)' : selectedModel}**. Siap menerima pertanyaan baru!`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const samplePrompts = [
    {
      label: '🌐 Cek Harga Pasar Apel & Minyak',
      prompt: 'Berapa rata-rata harga pasar komoditas Apel Manalagi Malang dan Minyak Goreng Sawit curah / industri di Jawa Timur saat ini? Berikan analisis dampaknya ke HPP keripik buah.'
    },
    {
      label: '📉 Solusi Penurunan Yield Kupas',
      prompt: 'Yield kupas apel di pabrik SSP turun menjadi 58.2% (standar 62%). Apa saja 4 akar masalah paling sering dan bagaimana SOP mitigasi segera?'
    },
    {
      label: '💡 Optimasi Formula HPP Keripik',
      prompt: 'Bagaimana cara mensimulasikan HPP per kemasan standing pouch 100g jika biaya gas LPG industri naik 10% dan rendemen frying bertahan di 22%?'
    },
    {
      label: '📋 Cek Regulasi BPOM & Halal',
      prompt: 'Sebutkan persyaratan wajib label kemasan dan ambang batas residu minyak (peroksida) menurut BPOM untuk keripik buah vacuum frying di Indonesia.'
    }
  ];

  return (
    <div className={`flex flex-col bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${compact ? 'h-[540px]' : 'h-[750px] min-h-[500px]'}`}>
      {/* Top Header Controls Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1.5">
                Gemini Industrial Copilot
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  v3.x Live
                </span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Role: <span className="text-emerald-400 font-semibold">{activeRole.title}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Role selector dropdown/modal toggle */}
          <button
            onClick={() => setShowRoleModal(!showRoleModal)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer text-[11px]"
            title="Ubah peran instruksi AI"
          >
            <span>{activeRole.icon}</span>
            <span className="hidden sm:inline">Role: {activeRole.title.split(' ')[0]}</span>
            <span className="sm:hidden">Role</span>
          </button>

          {/* Model selector pill */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2 py-1 rounded transition cursor-pointer ${selectedModel === 'gemini-3.5-flash' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="gemini-3.5-flash (Standar & Search Grounding)"
            >
              3.5 Flash
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2 py-1 rounded transition cursor-pointer ${selectedModel === 'gemini-3.1-flash-lite' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="gemini-3.1-flash-lite (⚡ Respon Instan & Kuota Paling Stabil)"
            >
              ⚡ 3.1 Lite
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`px-2 py-1 rounded transition cursor-pointer ${selectedModel === 'gemini-3.8-flash' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="gemini-3.8-flash (Model Terbaru)"
            >
              3.8 Flash
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`px-2 py-1 rounded transition cursor-pointer ${selectedModel === 'gemini-3.1-pro-preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              title="gemini-3.1-pro-preview (Mode Kompleks - Memerlukan Billing)"
            >
              3.1 Pro
            </button>
          </div>

          {/* Google Search Grounding toggle */}
          <button
            onClick={() => setEnableSearchGrounding(!enableSearchGrounding)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
              enableSearchGrounding
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-xs'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Gunakan data pencarian Google Search riil (gemini-3.5-flash dengan googleSearch tool)"
          >
            <Globe className={`w-3.5 h-3.5 ${enableSearchGrounding ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Google Search</span>
            <span className={`w-2 h-2 rounded-full ${enableSearchGrounding ? 'bg-blue-400' : 'bg-slate-600'}`} />
          </button>

          {/* Reset Thread */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
            title="Bersihkan chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role Selection Drawer / Panel */}
      {showRoleModal && (
        <div className="bg-slate-950/95 border-b border-slate-800 p-4 animate-fade-in text-xs z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              Pilih Persona / Spesialisasi Chatbot (System Instruction)
            </span>
            <button
              onClick={() => setShowRoleModal(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3">
            {ROLE_PRESETS.map(role => (
              <div
                key={role.id}
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setCustomInstruction('');
                  setShowRoleModal(false);
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition text-left ${
                  selectedRoleId === role.id && !customInstruction
                    ? 'bg-emerald-950/50 border-emerald-500/80 text-white ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{role.icon}</span>
                  <span className="font-bold text-[11px] truncate">{role.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{role.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Custom System Instruction (Opsional):</label>
            <textarea
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Contoh: Bertindaklah sebagai konsultan ekspor keripik buah ke pasar Jepang dan Timur Tengah..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Main Scrollable Thread Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 border font-sans relative group ${
                  isUser
                    ? 'bg-emerald-700 text-white border-emerald-600 rounded-tr-none shadow-md'
                    : 'bg-slate-950 text-slate-200 border-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                {/* Header metadata */}
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1.5 border-b border-slate-800/60 pb-1 font-mono">
                  <span className="font-bold text-slate-300">
                    {isUser ? (currentUser?.namaLengkap || 'Anda') : 'Gemini Copilot'}
                  </span>
                  <div className="flex items-center gap-2">
                    {!isUser && msg.modelUsed && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 text-[9px]">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-white"
                      title="Salin teks"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Fallback notification chip if model was automatically switched due to quota/rate limit */}
                {!isUser && msg.fallbackNotice && (
                  <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] flex items-center gap-1.5 font-sans">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{msg.fallbackNotice}</span>
                  </div>
                )}

                {/* Message Body formatted with react-markdown */}
                <div className="prose prose-invert prose-xs max-w-none text-slate-100 leading-relaxed font-sans">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Quick 1-click fallback switch button if quota error happened */}
                {!isUser && msg.isQuotaError && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedModel('gemini-3.1-flash-lite');
                        setEnableSearchGrounding(false);
                        if (msg.failedQuery) {
                          handleSendMessage(msg.failedQuery, 'gemini-3.1-flash-lite', false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ Coba Ulang dengan Gemini 3.1 Flash Lite</span>
                    </button>
                  </div>
                )}

                {/* Google Search Grounding Metadata Sources (Citations) */}
                {!isUser && msg.groundingMetadata && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400">
                      <Globe className="w-3 h-3" />
                      <span>Google Search Data Grounding Sources:</span>
                    </div>

                    {/* Search query keywords */}
                    {msg.groundingMetadata.webSearchQueries && msg.groundingMetadata.webSearchQueries.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.groundingMetadata.webSearchQueries.map((q, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-blue-300 text-[9px] flex items-center gap-1">
                            <Search className="w-2.5 h-2.5" />
                            {q}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cited sources links */}
                    {msg.groundingMetadata.searchChunks && msg.groundingMetadata.searchChunks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingMetadata.searchChunks.map((chunk, idx) => (
                          <a
                            key={idx}
                            href={chunk.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                            <span className="max-w-[200px] truncate">{chunk.title || chunk.uri}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 space-y-2 max-w-[70%]">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {enableSearchGrounding 
                    ? 'Menghubungkan Gemini 3.5 Flash dengan Google Search...' 
                    : `Sedang memproses dengan ${selectedModel}...`}
                </span>
              </div>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0 select-none">
        <span className="text-[9px] font-bold text-slate-500 uppercase shrink-0">Saran:</span>
        {samplePrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sp.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[10px] whitespace-nowrap transition cursor-pointer disabled:opacity-50"
          >
            {sp.label}
          </button>
        ))}
      </div>

      {/* Input Dock Area */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Tanyakan analisis produksi, yield, COGS, harga komoditas terkini..."
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3.5 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60"
            />
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              {enableSearchGrounding && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                  <Globe className="w-2.5 h-2.5" />
                  Search
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 px-1">
          <span>Model: <span className="text-slate-400 font-mono font-bold">{enableSearchGrounding ? 'gemini-3.5-flash (Search Grounded)' : selectedModel}</span></span>
          <span>Enterprise Context: <span className="text-emerald-400 font-bold">Aktif &amp; Terintegrasi</span></span>
        </div>
      </div>
    </div>
  );
}
