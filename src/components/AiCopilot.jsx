import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  ChevronRight,
  ShieldCheck,
  Send,
  Copy,
  Check,
  Key,
  RotateCw,
  Sliders,
  Bot,
  Terminal,
  Zap
} from 'lucide-react';
import { formatBDT, formatNumber } from '../utils/formatters';

function renderFormattedText(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const italicParts = part.split(/(\*.*?\*)/g);
    return italicParts.map((sub, j) => {
      if (sub.startsWith('*') && sub.endsWith('*')) {
        return (
          <em key={j} className="italic text-pink-300">
            {sub.slice(1, -1)}
          </em>
        );
      }
      return sub;
    });
  });
}

export default function AiCopilot({
  filteredMerchants,
  getMerchantMetrics,
  timeframeLabel,
  apiKey,
  onOpenSettings,
  showToast
}) {
  const [briefOutput, setBriefOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [timestamp, setTimestamp] = useState('Awaiting execution');
  const [copied, setCopied] = useState(false);

  const totalOutlets = filteredMerchants.length;

  const handleGenerate = async (inquiry = null) => {
    setIsLoading(true);

    let totalPA = 0;
    let totalPC = 0;
    let greenCnt = 0;
    let amberCnt = 0;
    let redCnt = 0;
    let under25kCnt = 0;
    let under50kCnt = 0;
    let dropOff1mCnt = 0;

    filteredMerchants.forEach((m) => {
      const met = getMerchantMetrics(m);
      totalPA += met.pa;
      totalPC += met.pc;
      if (met.health === 'Green') greenCnt++;
      else if (met.health === 'Amber') amberCnt++;
      else redCnt++;

      if (met.pa > 0 && met.pa <= 25000) under25kCnt++;
      if (met.pa > 0 && met.pa <= 50000) under50kCnt++;
      if (m.noTxn1m) dropOff1mCnt++;
    });

    const activeRate = totalOutlets > 0 ? ((greenCnt + amberCnt) / totalOutlets) * 100 : 0;
    const sampleDormant = filteredMerchants
      .filter((m) => getMerchantMetrics(m).health === 'Red')
      .slice(0, 4)
      .map((m) => `${m.brand} (${m.thana}, ${m.district} - ${m.rbKam})`)
      .join('; ') || 'None in active slice';

    const sampleAmber = filteredMerchants
      .filter((m) => getMerchantMetrics(m).health === 'Amber')
      .slice(0, 3)
      .map((m) => `${m.brand} (${m.thana})`)
      .join('; ') || 'None';

    const activeQuery = inquiry || customPrompt.trim() || 'Generate a comprehensive 3-part commercial strategy directive for territory field teams';

    // 1. Google Gemini 2.5 Flash
    if (apiKey) {
      const systemPrompt = `
You are the Chief Commercial Officer (CCO) and Head of Territory Operations at bKash Bangladesh.
Analyze this filtered commercial sales dataset:
- Reporting Period: ${timeframeLabel}
- Total Merchant Outlets in Scope: ${totalOutlets}
- Gross Throughput (PA): BDT ${totalPA.toLocaleString()}
- Completed Payments (PC): ${totalPC.toLocaleString()}
- Active Transacting Outlets: ${greenCnt + amberCnt} (${activeRate.toFixed(1)}%)
- Dormant (Red / Zero Trx) Outlets: ${redCnt} (Samples: ${sampleDormant})
- Low-Throughput (Amber) Outlets: ${amberCnt} (Samples: ${sampleAmber})
- Under 25K Revenue Outlets: ${under25kCnt}
- Under 50K Revenue Outlets: ${under50kCnt}
- Freshly Registered Outlets with Zero Txns in Month 1: ${dropOff1mCnt}
- Specific Inquiry: "${activeQuery}"

Provide a state-of-the-art, high-impact tactical strategy.
Structure with crisp emoji headers:
1. 🎯 Executive Territory Diagnostic
2. 🚨 Revenue Leakage & Drop-off Root Causes
3. 📋 Field Directives for KAM & RB KAM Officers (specific, actionable tasks for field audits, cashier incentive campaigns, QR standee visibility, and Day-7 onboarding SLA)
Keep language authoritative, concise, and professional.
`;

      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
          }
        );

        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(errData.error?.message || 'Gemini API call failed');
        }

        const data = await resp.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply) {
          setBriefOutput(reply);
          setTimestamp('Gemini 2.5 Flash • ' + new Date().toLocaleTimeString());
          setIsLoading(false);
          showToast('Generated strategy brief via Gemini 2.5 Flash', 'success');
          return;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local heuristic engine:', err);
        showToast('Gemini notice: falling back to built-in heuristic (' + err.message + ')', 'warning');
      }
    }

    // 2. Offline Heuristic Engine Fallback
    setTimeout(() => {
      let content = '';

      if (activeQuery.includes('Audit Dormant')) {
        content = `### 🚨 Dormant (Red) Account Emergency Audit
**Territory Exposure:** ${redCnt} out of ${totalOutlets} outlets (${((redCnt / (totalOutlets || 1)) * 100).toFixed(1)}%) recorded zero transactions in ${timeframeLabel}.

**Critical Outlets Flagged for Physical Intervention:**
${sampleDormant}

**Tactical Field Directive:**
1. **48-Hour On-site Visit:** Assigned RB KAMs must visit each dormant outlet within 48 hours to verify the physical bKash QR standee at the billing counter.
2. **Cashier Engagement Test:** Perform a live BDT 10 test transaction with the active cashier to verify settlement routing and app notification.
3. **Standee Upgrades:** Replace weathered or hidden QR stickers with prominent acrylic tent cards facing customer footpaths.`;
      } else if (activeQuery.includes('Registration Drop-Off') || activeQuery.includes('Registration Churn')) {
        content = `### ⏳ Onboarding Drop-Off & Activation Lag Analysis
**Bottleneck Metrics:** ${dropOff1mCnt} registered merchant accounts recorded zero transactions in their first full calendar month following registration.

**Root-Cause Diagnosis:**
The latency between merchant wallet creation and physical QR point-of-sale standee deployment is causing acute merchant attrition. Cashiers revert to cash when POS materials are not handed over on Day 1.

**Operational Mandate:**
1. **Day-7 First Transaction SLA:** Category Leads and RB KAMs must enforce that every newly onboarded outlet completes at least 3 customer transactions within 7 days of wallet activation.
2. **Welcome Kit Auditing:** Ensure welcome collateral (merchant QR, table tents, and customer sticker) is delivered within 72 hours.`;
      } else if (activeQuery.includes('Under 25K') || activeQuery.includes('Uplift')) {
        content = `### ⚡ Velocity Acceleration for Under 25K & 50K Merchants
**Cohort Overview:** ${under50kCnt} merchants are active but generate under BDT 50,000 monthly volume (including ${under25kCnt} generating under 25K).

**Growth Opportunity:**
These accounts already know how to transact via bKash. They suffer from consumer awareness at the checkout counter, not operational friction.

**Tactical Action Directives:**
1. **Localized 5% Cashback Tents:** KAMs must allocate localized seasonal cashback micro-campaigns to these specific merchant counters.
2. **Cashier Incentive Rewards:** Introduce a tiered monthly incentive of BDT 500 for cashiers achieving 50+ monthly bKash transactions.
3. **Cross-Merchandising:** Place bKash floor decals near high-traffic billing queues.`;
      } else {
        content = `### 🎯 Executive Territory Operations Diagnostic (${timeframeLabel})
**Performance Snapshot:**
Scope gross volume generated **${formatBDT(totalPA)}** across **${formatNumber(totalPC)}** customer payments. Transacting penetration is **${activeRate.toFixed(1)}%** across ${totalOutlets} merchants.

### 🚨 Risk & Opportunity Hotspots:
- **Dormancy Risk:** ${redCnt} dormant accounts (${((redCnt / (totalOutlets || 1)) * 100).toFixed(1)}%) risk falling off completely or switching to competitors.
- **Volume Expansion:** ${amberCnt} accounts operate at low transaction velocity and can be upgraded to Green tier with targeted cashier drives.

### 📋 Directives for RB KAMs & Category Leads:
1. **Dormant Outlet Re-Activation:** Immediate field visit to: *${sampleDormant}*.
2. **Cashier Target Push:** Brief the top 10 Amber tier outlets with bKash digital payment target rewards.
3. **Regional Weekly Cadence:** RB KAM Leads to conduct Friday pipeline reviews on outlets with zero transactions.`;
      }

      setBriefOutput(content);
      setTimestamp('Commercial Rule Engine • ' + new Date().toLocaleTimeString());
      setIsLoading(false);
      showToast('Generated strategy brief via Territory Analytics Engine', 'info');
    }, 450);
  };

  const handleCopy = () => {
    if (!briefOutput) return;
    navigator.clipboard.writeText(briefOutput);
    setCopied(true);
    showToast('Copied strategy brief to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-7 text-white shadow-2xl overflow-hidden glass-panel-elevated border border-white/10 dark:border-white/[0.12] transition-all duration-300">
      
      {/* Aurora Ambient Background Orbs */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-[#E2136E]/30 to-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-[#E2136E] text-slate-950 font-black shadow-lg shadow-[#E2136E]/30 border border-white/30">
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Google AI Studio Territory Copilot</span>
              </h2>
              <span
                className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full border backdrop-blur-md shadow-xs ${
                  apiKey
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {apiKey ? 'Gemini 2.5 Flash' : 'Analytical Rule Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Automated commercial diagnostics, field directives for KAMs & RB KAMs, and registration conversion triage
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-white/10 backdrop-blur-md cursor-pointer"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#E2136E] to-[#FF2E88] hover:from-[#B80D57] hover:to-pink-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#E2136E]/35 transition transform active:scale-95 disabled:opacity-50 cursor-pointer border border-white/20"
          >
            {isLoading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>Generate Strategy Brief</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Output Console Box */}
        <div className="lg:col-span-2 bg-black/40 dark:bg-black/50 rounded-2xl p-5 border border-white/10 min-h-[220px] flex flex-col justify-between text-xs leading-relaxed backdrop-blur-xl space-y-4 shadow-inner">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RotateCw className="w-6 h-6 text-[#E2136E] animate-spin" />
              <span className="text-sm font-semibold text-slate-300">
                Synthesizing territory intelligence & generating commercial directives...
              </span>
            </div>
          ) : briefOutput ? (
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2">
              <div className="space-y-2.5 text-slate-200 text-xs leading-relaxed">
                {briefOutput.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={idx} className="h-1.5" />;

                  if (trimmed.startsWith('###')) {
                    const headingText = trimmed.replace(/^###\s*/, '');
                    return (
                      <h4 key={idx} className="text-sm font-black text-pink-400 pt-2 border-b border-white/10 pb-1 flex items-center space-x-1.5">
                        {renderFormattedText(headingText)}
                      </h4>
                    );
                  }

                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const itemText = trimmed.replace(/^[-*]\s*/, '');
                    return (
                      <div key={idx} className="flex items-start space-x-2 pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E2136E] mt-1.5 flex-shrink-0 shadow-xs shadow-[#E2136E]" />
                        <div>{renderFormattedText(itemText)}</div>
                      </div>
                    );
                  }

                  const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                  if (numMatch) {
                    return (
                      <div key={idx} className="flex items-start space-x-2 pl-2">
                        <span className="font-extrabold text-pink-400 flex-shrink-0">{numMatch[1]}.</span>
                        <div>{renderFormattedText(numMatch[2])}</div>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="text-slate-300">
                      {renderFormattedText(trimmed)}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto text-pink-400">
                <Bot className="w-6 h-6" />
              </div>
              <p className="text-slate-400 italic max-w-md mx-auto text-xs">
                Click <strong className="text-white">"Generate Strategy Brief"</strong> or choose a directive on the right to synthesize filtered territory performance and receive actionable field directives.
              </p>
            </div>
          )}

          {/* Footer Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-400">
            <span>{timestamp}</span>
            <div className="flex items-center space-x-3">
              {briefOutput && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Directive Brief"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Brief</span>
                    </>
                  )}
                </button>
              )}
              <span className="flex items-center space-x-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>bKash Commercial Ops</span>
              </span>
            </div>
          </div>
        </div>

        {/* Priority Directives & Custom Prompt */}
        <div className="space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
              Priority Tactical Directives:
            </span>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleGenerate('Audit Dormant Red Outlets')}
                disabled={isLoading}
                className="w-full text-left glass-card hover:border-rose-500/50 text-slate-200 px-4 py-3 rounded-xl transition flex items-center justify-between group cursor-pointer"
              >
                <span className="group-hover:text-rose-300 font-bold">🚨 Audit Dormant Red Outlets</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleGenerate('Analyze Registration Drop-Off (1/3/5 Mos)')}
                disabled={isLoading}
                className="w-full text-left glass-card hover:border-amber-500/50 text-slate-200 px-4 py-3 rounded-xl transition flex items-center justify-between group cursor-pointer"
              >
                <span className="group-hover:text-amber-300 font-bold">⏳ Registration Drop-Off (1/3/5 Mos)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleGenerate('Uplift Under 25K/50K Merchants')}
                disabled={isLoading}
                className="w-full text-left glass-card hover:border-purple-500/50 text-slate-200 px-4 py-3 rounded-xl transition flex items-center justify-between group cursor-pointer"
              >
                <span className="group-hover:text-purple-300 font-bold">⚡ Uplift Under 25K/50K Merchants</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleGenerate('Executive Board Summary')}
                disabled={isLoading}
                className="w-full text-left glass-card hover:border-blue-500/50 text-slate-200 px-4 py-3 rounded-xl transition flex items-center justify-between group cursor-pointer"
              >
                <span className="group-hover:text-blue-300 font-bold">📊 Executive Board Summary</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Custom Question Glass Input */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Ask Territory Copilot:
            </label>
            <div className="relative">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                placeholder="Ask specific questions about this slice..."
                className="w-full pl-3.5 pr-10 py-2.5 glass-input rounded-xl text-xs text-white placeholder:text-slate-500 shadow-sm"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !customPrompt.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 bg-[#E2136E] hover:bg-pink-600 disabled:opacity-40 text-white rounded-lg transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
