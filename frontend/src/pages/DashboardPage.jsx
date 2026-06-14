import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { getSchemeByName } from "../services/api";
import SchemeDetailPopup from "../components/SchemeDetailPopup";
import { Badge } from "../components/ui/Badge";
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "../lib/cn";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-md p-3 shadow-lg text-xs z-50">
      <p className="font-semibold text-[var(--text)] mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

const STAT_CONFIG = [
  { key: "totalChecks", icon: <BarChart3 size={20} />, gradient: "from-primary-600 to-primary-400", shadow: "shadow-primary-500/20" },
  { key: "rumorsDetected", icon: <ShieldAlert size={20} />, gradient: "from-danger-600 to-danger-400", shadow: "shadow-danger-500/20" },
  { key: "legitimateLabel", icon: <CheckCircle size={20} />, gradient: "from-success-600 to-success-400", shadow: "shadow-success-500/20" },
  { key: "avgConfidence", icon: <TrendingUp size={20} />, gradient: "from-accent-500 to-primary-400", shadow: "shadow-accent-500/20" },
];

export default function DashboardPage() {
  const { publicHistory } = useApp();
  const { t } = useLang();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [showSchemePopup, setShowSchemePopup] = useState(false);

  const total = publicHistory.length;
  const rumors = publicHistory.filter((h) => h.isRumor).length;
  const legit = total - rumors;
  const rumorPct = total ? Math.round((rumors / total) * 100) : 0;
  const avgConf = total ? Math.round(publicHistory.reduce((acc, h) => acc + (h.confidence || 0), 0) / total) : 0;

  const statValues = [
    { value: total, sub: t("allTime") },
    { value: rumors, sub: `${rumorPct}% ${t("ofTotal")}` },
    { value: legit, sub: `${total ? 100 - rumorPct : 0}% ${t("ofTotal")}` },
    { value: `${avgConf}%`, sub: t("modelCertainty") },
  ];

  const schemeCounts = {};
  publicHistory.forEach((h) => { const s = h.scheme || "Unknown"; schemeCounts[s] = (schemeCounts[s] || 0) + 1; });
  const topSchemes = Object.entries(schemeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() - 6 + i);
    const label = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day.getDay()];
    const hts = publicHistory.filter((h) => new Date(h.timestamp).toDateString() === day.toDateString());
    return {
      day: label,
      checks: hts.length,
      rumors: hts.filter(h => h.isRumor).length,
      legitimate: hts.filter(h => !h.isRumor).length
    };
  });

  const R = 30, C = 2 * Math.PI * R;
  const rumorArc = (rumorPct / 100) * C, legitArc = C - rumorArc;

  const handleSchemeClick = async (schemeName) => {
    setSchemeLoading(true); setShowSchemePopup(true); setSelectedScheme(null);
    try { const { data } = await getSchemeByName(schemeName); setSelectedScheme(data); }
    catch (err) { console.error("Failed to fetch scheme details:", err); setSelectedScheme(null); }
    finally { setSchemeLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
        <div>
          <Badge variant="default" className="mb-3">Real-time Analytics</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight mb-1">{t("analyticsDashboard")}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t("dashboardSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-success-400 animate-pulse" />
          <span className="text-xs text-[var(--text-dim)]">Live data</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 lg:mb-16">
        {STAT_CONFIG.map((cfg, i) => (
          <div key={i} className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-lg glow-card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", cfg.gradient, cfg.shadow)}>
                {cfg.icon}
              </div>
              <span className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-semibold">{t(cfg.key)}</span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-[var(--text)]">{statValues[i].value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{statValues[i].sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-12 lg:mb-16">
        {/* Weekly Activity - wider */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 glow-card">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              <div className="text-sm font-bold text-[var(--text)]">{t("weeklyActivity")}</div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Last 7 days</Badge>
          </div>
          <div className="text-xs text-[var(--text-dim)] mb-6">{t("checksPerDay")}</div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekBars} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs text-[var(--text-dim)] capitalize">{v}</span>} />
                <Line type="monotone" dataKey="checks" stroke="#14b8a6" strokeWidth={2.5} dot={false} name="Total Checks" />
                <Line type="monotone" dataKey="rumors" stroke="#ef4444" strokeWidth={2} dot={false} name="Rumors" />
                <Line type="monotone" dataKey="legitimate" stroke="#22c55e" strokeWidth={2} dot={false} name="Legitimate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 glow-card">
          <div className="text-sm font-bold text-[var(--text)] mb-1">{t("rumorVsLegit")}</div>
          <div className="text-xs text-[var(--text-dim)] mb-6">{t("distribution")}</div>
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <svg width={100} height={100} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={R} fill="none" stroke="var(--bg-muted)" strokeWidth={12} />
                {total > 0 && (<><circle cx={40} cy={40} r={R} fill="none" stroke="#ef4444" strokeWidth={12} strokeDasharray={`${rumorArc} ${legitArc}`} strokeDashoffset={C * 0.25} strokeLinecap="round" className="transition-all duration-1000" /><circle cx={40} cy={40} r={R} fill="none" stroke="#22c55e" strokeWidth={12} strokeDasharray={`${legitArc} ${rumorArc}`} strokeDashoffset={C * 0.25 - rumorArc} strokeLinecap="round" className="transition-all duration-1000" /></>)}
                <text x={40} y={44} textAnchor="middle" className="fill-text" fontSize={14} fontWeight={800} fontFamily="var(--font-mono)">{total ? `${rumorPct}%` : "—"}</text>
              </svg>
            </div>
            <div className="flex flex-col gap-3">
              {[{ color: "#ef4444", label: `${t("rumors")}`, pct: `${rumorPct}%` }, { color: "#22c55e", label: `${t("legitimate")}`, pct: `${total ? 100-rumorPct : 0}%` }, { color: "#8b5cf6", label: `${t("avgConfidence")}`, pct: `${avgConf}%` }].map(({ color, label, pct }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">{label}</div>
                    <div className="text-xs font-bold font-mono text-[var(--text)]">{pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Schemes */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 glow-card">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-[var(--text)]">{t("topSchemes")}</div>
          <Badge variant="secondary" className="text-[10px]">{topSchemes.length} schemes</Badge>
        </div>
        <div className="text-xs text-[var(--text-dim)] mb-6">{t("topSchemesSubtitle")}</div>
        {topSchemes.length > 0 ? (
          <div className="space-y-3">
            {topSchemes.map(([scheme, count], idx) => (
              <div key={scheme} className="flex items-center gap-4 cursor-pointer rounded-xl p-3 -mx-3 transition-all hover:bg-[var(--bg-elevated)] group" onClick={() => handleSchemeClick(scheme)} title={`Click for details`}>
                <span className="text-xs font-bold text-[var(--text-dim)] w-6 text-center font-mono">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text)] truncate group-hover:text-primary-400 transition-colors">{scheme}</div>
                  <div className="h-2 mt-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 animate-bar-fill" style={{ width: `${Math.round((count / topSchemes[0][1]) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-primary-400">{count}</span>
              </div>
            ))}
          </div>
        ) : (<div className="flex items-center justify-center py-12"><p className="text-sm text-[var(--text-dim)]">{t("runAnalyses")}</p></div>)}
      </div>

      {showSchemePopup && (<SchemeDetailPopup scheme={selectedScheme} loading={schemeLoading} onClose={() => { setShowSchemePopup(false); setSelectedScheme(null); }} />)}
    </div>
  );
}
