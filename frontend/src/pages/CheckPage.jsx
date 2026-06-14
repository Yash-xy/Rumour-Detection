import { useState } from "react";
import { ShieldCheck, Zap, TrendingUp, Users, ArrowRight } from "lucide-react";
import InputForm from "../components/InputForm";
import ResultDisplay from "../components/ResultDisplay";
import { analyzeText } from "../services/api";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";

const FEATURES = [
  { icon: <ShieldCheck size={20} />, title: "AI-Powered", desc: "Deep learning model trained on government scheme data" },
  { icon: <Zap size={20} />, title: "Instant Scan", desc: "Real-time analysis with confidence scoring" },
  { icon: <TrendingUp size={20} />, title: "98% Accuracy", desc: "Cross-referenced against official databases" },
  { icon: <Users size={20} />, title: "Community", desc: "Join thousands verifying government claims" },
];

export default function CheckPage() {
  const { refreshHistory, publicHistory } = useApp();
  const { t } = useLang();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [lastText, setLastText] = useState("");
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (text) => {
    setLoading(true);
    setResult(null);
    setApiError("");
    setLastText(text);

    try {
      const { data } = await analyzeText(text);
      const enriched = {
        ...data,
        isRumor: data.verdict === "Rumor",
        related_schemes: data.related_schemes || [],
      };
      setResult(enriched);
      refreshHistory();
      addToast(
        enriched.isRumor ? "⚠️ Potential rumor detected!" : "✅ Content verified as legitimate",
        enriched.isRumor ? "error" : "success"
      );
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.response?.data || null;
      const message = err.message || String(err);
      const requestInfo = err.config ? `${err.config.method?.toUpperCase() || ''} ${err.config.url}` : null;
      const msg = detail
        ? `API error: ${status} - ${JSON.stringify(detail)}`
        : `API connection failed: ${message}`;
      setApiError(msg + (requestInfo ? ` (request: ${requestInfo})` : ""));
      addToast("Failed to analyze text. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalChecks = publicHistory.length;
  const rumorsFound = publicHistory.filter(h => h.isRumor).length;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      {!result && !loading && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] mb-12 lg:mb-16">
          {/* Background glow */}
          <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <img
              src="/images/hero.png"
              alt=""
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl">
            <Badge variant="warning" className="mb-4 text-xs font-semibold">
              {t("liveAnalysis")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] tracking-tight leading-tight mb-4">
              {t("pageTitle").split(" ").map((word, i) =>
                i < 2 ? <span key={i} className="text-gradient">{word} </span> : word + " "
              )}
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed mb-8 max-w-xl">
              {t("pageSubtitle")}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-[var(--text)]">{totalChecks}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Total Checks</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-danger-500/15 flex items-center justify-center text-danger-400">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-[var(--text)]">{rumorsFound}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Rumors Found</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <Alert variant="destructive" className="mb-10">
          <span>⚠️</span>
          <span className="text-sm">{apiError}</span>
        </Alert>
      )}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Input Column */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 glow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text)]">Rumor Scanner</h2>
                <p className="text-[10px] text-[var(--text-dim)]">Paste any text to verify</p>
              </div>
            </div>
            <InputForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Preview of analyzed text */}
          {result && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 animate-fade-in">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-dim)] mb-2">
                {t("analyzedText")}
              </p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
                {lastText}
              </p>
            </div>
          )}
        </div>

        {/* Result Column */}
        <div className="lg:col-span-2">
          <ResultDisplay result={result} loading={loading} />
        </div>
      </div>

      {/* ── Feature Cards ────────────────────────────────────────────── */}
      {!result && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 glow-card animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 mb-3 group-hover:bg-primary-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-[var(--text)] mb-1">{f.title}</h3>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Schemes Illustration Section ──────────────────────────────── */}
      {!result && !loading && (
        <div className="mt-16 lg:mt-24 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <Badge variant="default" className="w-fit mb-4 text-xs">Verified Database</Badge>
              <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-3">
                Cross-Referenced Against <span className="text-gradient">Official Schemes</span>
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                Our AI engine verifies claims against a comprehensive database of government welfare programs including PM-KISAN, Ayushman Bharat, MGNREGA, and hundreds more.
              </p>
              <div className="flex flex-wrap gap-2">
                {["PM-KISAN", "Ayushman Bharat", "MGNREGA", "PM Awas", "Jan Dhan"].map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative min-h-[240px] bg-gradient-to-br from-primary-900/20 to-accent-500/10">
              <img
                src="/images/schemes.png"
                alt="Government welfare schemes network"
                className="w-full h-full object-cover opacity-70"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[var(--bg-card)]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
